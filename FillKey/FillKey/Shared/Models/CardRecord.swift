import Foundation

struct CardRecord: Identifiable, Codable, Sendable {
    let id: UUID
    var nickname: String
    var last4: String
    var expiryMonth: Int
    var expiryYear: Int
    var cardholderName: String
    // PAN is stored separately in Keychain encrypted with Secure Enclave key
    // This struct never holds the plaintext PAN
    var createdAt: Date
    var modifiedAt: Date

    init(
        id: UUID = UUID(),
        nickname: String,
        last4: String,
        expiryMonth: Int,
        expiryYear: Int,
        cardholderName: String
    ) {
        self.id = id
        self.nickname = nickname
        self.last4 = last4
        self.expiryMonth = expiryMonth
        self.expiryYear = expiryYear
        self.cardholderName = cardholderName
        self.createdAt = Date()
        self.modifiedAt = Date()
    }

    var displayExpiry: String {
        String(format: "%02d/%02d", expiryMonth, expiryYear % 100)
    }

    var panKeychainKey: String { "card.pan.\(id.uuidString)" }
    var metadataKeychainKey: String { "card.meta.\(id.uuidString)" }
}
