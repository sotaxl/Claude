import Foundation
import Security

enum KeychainError: Error, Sendable {
    case duplicateItem
    case itemNotFound
    case unexpectedData
    case unhandledError(OSStatus)
}

actor KeychainService {
    static let shared = KeychainService()

    private let accessGroup = AppGroup.keychainAccessGroup

    // MARK: – Write

    func save(_ data: Data, for key: String) throws {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: "com.fillkey.app",
            kSecAttrAccount: key,
            kSecAttrAccessGroup: accessGroup,
            kSecValueData: data,
            kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        let status = SecItemAdd(query as CFDictionary, nil)

        if status == errSecDuplicateItem {
            let updateQuery: [CFString: Any] = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrService: "com.fillkey.app",
                kSecAttrAccount: key,
                kSecAttrAccessGroup: accessGroup
            ]
            let updateAttributes: [CFString: Any] = [kSecValueData: data]
            let updateStatus = SecItemUpdate(updateQuery as CFDictionary, updateAttributes as CFDictionary)
            guard updateStatus == errSecSuccess else {
                throw KeychainError.unhandledError(updateStatus)
            }
        } else if status != errSecSuccess {
            throw KeychainError.unhandledError(status)
        }
    }

    func save<T: Encodable>(_ value: T, for key: String) throws {
        let data = try JSONEncoder().encode(value)
        try save(data, for: key)
    }

    // MARK: – Read

    func load(for key: String) throws -> Data {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: "com.fillkey.app",
            kSecAttrAccount: key,
            kSecAttrAccessGroup: accessGroup,
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound { throw KeychainError.itemNotFound }
            throw KeychainError.unhandledError(status)
        }

        guard let data = result as? Data else { throw KeychainError.unexpectedData }
        return data
    }

    func load<T: Decodable>(_ type: T.Type, for key: String) throws -> T {
        let data = try load(for: key)
        return try JSONDecoder().decode(type, from: data)
    }

    // MARK: – Delete

    func delete(for key: String) throws {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: "com.fillkey.app",
            kSecAttrAccount: key,
            kSecAttrAccessGroup: accessGroup
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.unhandledError(status)
        }
    }

    // MARK: – List all keys for a prefix

    func allKeys(prefix: String) throws -> [String] {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: "com.fillkey.app",
            kSecAttrAccessGroup: accessGroup,
            kSecReturnAttributes: true,
            kSecMatchLimit: kSecMatchLimitAll
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        if status == errSecItemNotFound { return [] }
        guard status == errSecSuccess else { throw KeychainError.unhandledError(status) }

        let items = result as? [[CFString: Any]] ?? []
        return items.compactMap { $0[kSecAttrAccount] as? String }
            .filter { $0.hasPrefix(prefix) }
    }

    // MARK: – Credential helpers

    func saveCredential(_ credential: Credential, password: String?) throws {
        try save(credential, for: credential.keychainKey)
        if let password {
            guard let passwordData = password.data(using: .utf8) else { return }
            try save(passwordData, for: "password.\(credential.id.uuidString)")
        }
    }

    func loadAllCredentials() throws -> [Credential] {
        let keys = try allKeys(prefix: "credential.")
        return try keys.map { key in
            try load(Credential.self, for: key)
        }
    }

    func loadPassword(for credentialID: UUID) throws -> String {
        let data = try load(for: "password.\(credentialID.uuidString)")
        guard let password = String(data: data, encoding: .utf8) else {
            throw KeychainError.unexpectedData
        }
        return password
    }

    func saveTOTPSeed(_ seed: Data, for credentialID: UUID) throws {
        try save(seed, for: "totp.seed.\(credentialID.uuidString)")
    }

    func loadTOTPSeed(for credentialID: UUID) throws -> Data {
        try load(for: "totp.seed.\(credentialID.uuidString)")
    }
}
