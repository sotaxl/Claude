import Foundation
import CryptoKit

struct Credential: Identifiable, Codable, Sendable {
    let id: UUID
    var type: CredentialType
    var label: String
    var username: String?
    var domain: String
    var domainHash: String  // SHA-256 of eTLD+1, used for CloudKit
    var createdAt: Date
    var modifiedAt: Date
    var isTombstone: Bool

    // TOTP-specific (seed stored separately in Keychain, referenced by id)
    var totpIssuer: String?
    var totpAlgorithm: String?
    var totpDigits: Int?
    var totpPeriod: Int?

    init(
        id: UUID = UUID(),
        type: CredentialType,
        label: String,
        username: String? = nil,
        domain: String,
        createdAt: Date = Date(),
        modifiedAt: Date = Date()
    ) {
        self.id = id
        self.type = type
        self.label = label
        self.username = username
        self.domain = domain
        self.domainHash = Self.hashDomain(domain)
        self.createdAt = createdAt
        self.modifiedAt = modifiedAt
        self.isTombstone = false
    }

    static func hashDomain(_ domain: String) -> String {
        let data = Data(domain.lowercased().utf8)
        let digest = SHA256.hash(data: data)
        return digest.map { String(format: "%02x", $0) }.joined()
    }

    var keychainKey: String { "credential.\(id.uuidString)" }
    var seedKeychainKey: String { "totp.seed.\(id.uuidString)" }
}

// MARK: – Domain extraction

extension Credential {
    static func extractETLDPlusOne(from hostname: String) -> String {
        // Simplified eTLD+1: strip www. and take last two components
        let parts = hostname.lowercased()
            .replacingOccurrences(of: "www.", with: "")
            .components(separatedBy: ".")
        guard parts.count >= 2 else { return hostname.lowercased() }
        return parts.suffix(2).joined(separator: ".")
    }
}
