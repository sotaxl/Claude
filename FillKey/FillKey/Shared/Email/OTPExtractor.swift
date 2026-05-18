import Foundation

struct ExtractedOTP: Sendable {
    let code: String
    let sender: String
    let receivedAt: Date
    var expiresAt: Date { receivedAt.addingTimeInterval(300) } // 5-min default expiry
    var isExpired: Bool { Date() > expiresAt }
}

struct OTPExtractor: Sendable {

    // Matches 4–8 digit codes in OTP-related emails
    private static let codePattern = #/\b(\d{4,8})\b/#
    private static let otpSubjectKeywords = [
        "code", "verify", "otp", "one-time", "one time",
        "verification", "authenticate", "confirm", "passcode"
    ]

    static func extract(from message: EmailMessage) -> ExtractedOTP? {
        let subjectLower = message.subject.lowercased()
        guard otpSubjectKeywords.contains(where: { subjectLower.contains($0) }) else {
            return nil
        }

        // Search subject first, then body snippet
        let searchText = "\(message.subject) \(message.bodySnippet)"
        guard let match = searchText.firstMatch(of: codePattern) else {
            return nil
        }

        return ExtractedOTP(
            code: String(match.1),
            sender: message.sender,
            receivedAt: message.receivedAt
        )
    }
}

struct EmailMessage: Sendable {
    let subject: String
    let bodySnippet: String
    let sender: String
    let receivedAt: Date
}
