import Foundation
import Security
import CryptoKit

enum SecureEnclaveError: Error, Sendable {
    case keyGenerationFailed(OSStatus)
    case keyNotFound
    case encryptionFailed
    case decryptionFailed
}

actor SecureEnclaveService {
    static let shared = SecureEnclaveService()

    private let keyTag = "com.fillkey.app.card-encryption-key"

    // MARK: – Key management

    private func getOrCreateKey() throws -> SecKey {
        // Try to find existing key
        if let key = try? findKey() { return key }

        // Create new Secure Enclave key
        var error: Unmanaged<CFError>?
        guard SecureEnclave.isAvailable else {
            // Fallback for devices without Secure Enclave (simulators)
            return try createSoftwareKey()
        }

        let access = SecAccessControlCreateWithFlags(
            nil,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            [.privateKeyUsage, .biometryCurrentSet],
            &error
        )
        guard let access, error == nil else {
            throw SecureEnclaveError.keyGenerationFailed(errSecParam)
        }

        let attributes: [CFString: Any] = [
            kSecAttrKeyType: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrKeySizeInBits: 256,
            kSecAttrTokenID: kSecAttrTokenIDSecureEnclave,
            kSecPrivateKeyAttrs: [
                kSecAttrIsPermanent: true,
                kSecAttrApplicationTag: keyTag.data(using: .utf8)!,
                kSecAttrAccessControl: access
            ] as [CFString: Any]
        ]

        guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
            throw SecureEnclaveError.keyGenerationFailed(errSecInternalError)
        }
        return privateKey
    }

    private func findKey() throws -> SecKey? {
        let query: [CFString: Any] = [
            kSecClass: kSecClassKey,
            kSecAttrKeyType: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrApplicationTag: keyTag.data(using: .utf8)!,
            kSecAttrTokenID: kSecAttrTokenIDSecureEnclave,
            kSecReturnRef: true
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess else { return nil }
        return result as! SecKey
    }

    private func createSoftwareKey() throws -> SecKey {
        let attributes: [CFString: Any] = [
            kSecAttrKeyType: kSecAttrKeyTypeECSECPrimeRandom,
            kSecAttrKeySizeInBits: 256,
            kSecPrivateKeyAttrs: [
                kSecAttrIsPermanent: true,
                kSecAttrApplicationTag: keyTag.data(using: .utf8)!,
                kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
            ] as [CFString: Any]
        ]
        var error: Unmanaged<CFError>?
        guard let key = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
            throw SecureEnclaveError.keyGenerationFailed(errSecInternalError)
        }
        return key
    }

    // MARK: – Encrypt / Decrypt PAN

    func encryptPAN(_ pan: String) throws -> Data {
        guard let panData = pan.data(using: .utf8) else {
            throw SecureEnclaveError.encryptionFailed
        }

        // Use AES-256-GCM with a random key, then wrap that key with the Secure Enclave key
        let symmetricKey = SymmetricKey(size: .bits256)
        let sealedBox = try AES.GCM.seal(panData, using: symmetricKey)
        guard let ciphertext = sealedBox.combined else {
            throw SecureEnclaveError.encryptionFailed
        }

        // Wrap the symmetric key with the EC public key via ECIES
        let privateKey = try getOrCreateKey()
        guard let publicKey = SecKeyCopyPublicKey(privateKey) else {
            throw SecureEnclaveError.encryptionFailed
        }

        var error: Unmanaged<CFError>?
        let keyData = symmetricKey.withUnsafeBytes { Data($0) }
        guard let wrappedKey = SecKeyCreateEncryptedData(
            publicKey,
            .eciesEncryptionCofactorX963SHA256AESGCM,
            keyData as CFData,
            &error
        ) else {
            throw SecureEnclaveError.encryptionFailed
        }

        // Bundle: [4 bytes wrappedKey length][wrappedKey][ciphertext]
        var result = Data()
        var keyLen = UInt32(wrappedKey as Data).bigEndian
        result.append(Data(bytes: &keyLen, count: 4))
        result.append(wrappedKey as Data)
        result.append(ciphertext)
        return result
    }

    func decryptPAN(_ encryptedData: Data) throws -> String {
        guard encryptedData.count > 4 else { throw SecureEnclaveError.decryptionFailed }

        let keyLenBytes = encryptedData.prefix(4)
        let keyLen = Int(keyLenBytes.withUnsafeBytes { $0.load(as: UInt32.self).bigEndian })
        guard encryptedData.count > 4 + keyLen else { throw SecureEnclaveError.decryptionFailed }

        let wrappedKey = encryptedData[4..<(4 + keyLen)]
        let ciphertext = encryptedData[(4 + keyLen)...]

        let privateKey = try getOrCreateKey()
        var error: Unmanaged<CFError>?
        guard let keyData = SecKeyCreateDecryptedData(
            privateKey,
            .eciesEncryptionCofactorX963SHA256AESGCM,
            wrappedKey as CFData,
            &error
        ) else {
            throw SecureEnclaveError.decryptionFailed
        }

        let symmetricKey = SymmetricKey(data: keyData as Data)
        let sealedBox = try AES.GCM.SealedBox(combined: Data(ciphertext))
        let panData = try AES.GCM.open(sealedBox, using: symmetricKey)

        guard let pan = String(data: panData, encoding: .utf8) else {
            throw SecureEnclaveError.decryptionFailed
        }
        return pan
    }
}
