import Foundation
import Combine
import AVFoundation

@MainActor
final class VaultViewModel: ObservableObject {
    @Published private(set) var credentials: [Credential] = []
    @Published private(set) var cards: [CardRecord] = []
    @Published var error: Error?

    private let keychain = KeychainService.shared

    func load() async {
        do {
            credentials = try await keychain.loadAllCredentials()
                .filter { !$0.isTombstone }
                .sorted { $0.modifiedAt > $1.modifiedAt }
        } catch {
            self.error = error
        }
    }

    func addTOTP(uri: String) async throws {
        guard let parsed = OTPAuthURI.parse(uri) else { throw VaultError.invalidURI }
        let seed = try TOTPGenerator.decodeBase32(parsed.secret)

        var credential = Credential(
            type: .totp,
            label: parsed.issuer.isEmpty ? parsed.accountName : parsed.issuer,
            username: parsed.accountName,
            domain: parsed.issuer.lowercased()
        )
        credential.totpIssuer = parsed.issuer
        credential.totpAlgorithm = parsed.algorithm
        credential.totpDigits = parsed.digits
        credential.totpPeriod = parsed.period

        try await keychain.saveTOTPSeed(seed, for: credential.id)
        try await keychain.saveCredential(credential, password: nil)
        await load()
    }

    func addPassword(label: String, username: String, password: String, domain: String) async throws {
        let credential = Credential(
            type: .password,
            label: label,
            username: username,
            domain: domain
        )
        try await keychain.saveCredential(credential, password: password)
        await load()
    }

    func addCard(_ card: CardRecord, pan: String) async throws {
        let encrypted = try await SecureEnclaveService.shared.encryptPAN(pan)
        try await keychain.save(encrypted, for: card.panKeychainKey)
        try await keychain.save(card, for: card.metadataKeychainKey)
        await load()
    }

    func delete(_ credential: Credential) async throws {
        var tombstone = credential
        tombstone.isTombstone = true
        try await keychain.saveCredential(tombstone, password: nil)
        await load()
    }

    func currentTOTPCode(for credential: Credential) async throws -> String {
        let seed = try await keychain.loadTOTPSeed(for: credential.id)
        return try TOTPGenerator.currentCode(
            seed: seed,
            digits: credential.totpDigits ?? 6,
            period: credential.totpPeriod ?? 30
        )
    }
}

enum VaultError: Error, LocalizedError {
    case invalidURI

    var errorDescription: String? {
        switch self {
        case .invalidURI: return "Invalid OTP URI format"
        }
    }
}
