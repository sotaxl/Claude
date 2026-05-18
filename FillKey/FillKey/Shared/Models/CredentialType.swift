import Foundation

enum CredentialType: String, Codable, CaseIterable, Sendable {
    case password
    case totp
    case smsOTP
    case emailOTP
    case card
    case passkey
}

struct AppGroup {
    static let suiteName = "group.com.fillkey.shared"
    static let keychainAccessGroup = "group.com.fillkey.shared"
}
