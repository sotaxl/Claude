import Foundation
import CloudKit
import CryptoKit

struct EncryptedCredentialRecord: Sendable {
    static let recordType = "EncryptedCredential"

    let recordID: CKRecord.ID
    let encryptedBlob: Data
    let credentialType: String
    let domainHash: String
    let modifiedAt: Date
    let isTombstone: Bool

    var ckRecord: CKRecord {
        let record = CKRecord(recordType: Self.recordType, recordID: recordID)
        record["encryptedBlob"] = encryptedBlob as NSData
        record["credentialType"] = credentialType as NSString
        record["domainHash"] = domainHash as NSString
        record["modifiedAt"] = modifiedAt as NSDate
        record["isTombstone"] = (isTombstone ? 1 : 0) as NSNumber
        return record
    }

    init?(ckRecord: CKRecord) {
        guard
            let blob = ckRecord["encryptedBlob"] as? Data,
            let type = ckRecord["credentialType"] as? String,
            let hash = ckRecord["domainHash"] as? String,
            let date = ckRecord["modifiedAt"] as? Date
        else { return nil }

        self.recordID = ckRecord.recordID
        self.encryptedBlob = blob
        self.credentialType = type
        self.domainHash = hash
        self.modifiedAt = date
        self.isTombstone = (ckRecord["isTombstone"] as? Int ?? 0) == 1
    }

    init(credential: Credential, encryptedBlob: Data) {
        self.recordID = CKRecord.ID(recordName: credential.id.uuidString)
        self.encryptedBlob = encryptedBlob
        self.credentialType = credential.type.rawValue
        self.domainHash = credential.domainHash
        self.modifiedAt = credential.modifiedAt
        self.isTombstone = credential.isTombstone
    }
}

// MARK: – CloudKit encryption key management

actor CloudKitCryptoService {
    static let shared = CloudKitCryptoService()

    private let keyKeychainKey = "cloudkit.encryption.key"

    private func getOrCreateKey() async throws -> SymmetricKey {
        if let keyData = try? await KeychainService.shared.load(for: keyKeychainKey) {
            return SymmetricKey(data: keyData)
        }
        let newKey = SymmetricKey(size: .bits256)
        let keyData = newKey.withUnsafeBytes { Data($0) }
        try await KeychainService.shared.save(keyData, for: keyKeychainKey)
        return newKey
    }

    func encrypt(_ credential: Credential) async throws -> Data {
        let key = try await getOrCreateKey()
        let data = try JSONEncoder().encode(credential)
        let sealedBox = try AES.GCM.seal(data, using: key)
        guard let combined = sealedBox.combined else {
            throw CryptoKitError.incorrectParameterSize
        }
        return combined
    }

    func decrypt(_ data: Data) async throws -> Credential {
        let key = try await getOrCreateKey()
        let sealedBox = try AES.GCM.SealedBox(combined: data)
        let decrypted = try AES.GCM.open(sealedBox, using: key)
        return try JSONDecoder().decode(Credential.self, from: decrypted)
    }
}
