import XCTest
@testable import FillKey

final class OTPExtractorTests: XCTestCase {

    func testExtractsCodeFromOTPSubject() {
        let msg = EmailMessage(
            subject: "Your verification code is 847291",
            bodySnippet: "Use this code to log in.",
            sender: "noreply@example.com",
            receivedAt: Date()
        )
        let result = OTPExtractor.extract(from: msg)
        XCTAssertNotNil(result)
        XCTAssertEqual(result?.code, "847291")
    }

    func testExtractsFromBodySnippetFallback() {
        let msg = EmailMessage(
            subject: "Your OTP",
            bodySnippet: "Enter code 123456 to continue.",
            sender: "noreply@example.com",
            receivedAt: Date()
        )
        let result = OTPExtractor.extract(from: msg)
        XCTAssertNotNil(result)
    }

    func testIgnoresNonOTPEmail() {
        let msg = EmailMessage(
            subject: "Welcome to our newsletter!",
            bodySnippet: "Thanks for signing up.",
            sender: "news@example.com",
            receivedAt: Date()
        )
        let result = OTPExtractor.extract(from: msg)
        XCTAssertNil(result)
    }

    func testIgnoresTooShortCode() {
        let msg = EmailMessage(
            subject: "Your verify code is 123",
            bodySnippet: "Use 123",
            sender: "noreply@example.com",
            receivedAt: Date()
        )
        let result = OTPExtractor.extract(from: msg)
        XCTAssertNil(result) // 3 digits < 4 minimum
    }

    func testExpiryIsSetCorrectly() {
        let now = Date()
        let msg = EmailMessage(
            subject: "Your one-time passcode 334821",
            bodySnippet: "",
            sender: "auth@example.com",
            receivedAt: now
        )
        let result = OTPExtractor.extract(from: msg)
        XCTAssertNotNil(result)
        XCTAssertEqual(result!.expiresAt.timeIntervalSince(now), 300, accuracy: 1)
    }

    func testIsExpiredForOldMessage() {
        let old = Date().addingTimeInterval(-400)
        let msg = EmailMessage(
            subject: "verification code 123456",
            bodySnippet: "",
            sender: "auth@example.com",
            receivedAt: old
        )
        let result = OTPExtractor.extract(from: msg)
        XCTAssertNotNil(result)
        XCTAssertTrue(result!.isExpired)
    }
}
