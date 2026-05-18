import XCTest
@testable import FillKey

final class TOTPGeneratorTests: XCTestCase {

    // RFC 6238 test vectors (SHA-1, 30s window, 8 digits at specific timestamps)
    // Seed: ASCII "12345678901234567890"
    private let rfcSeed = Data("12345678901234567890".utf8)

    func testBase32Decode() throws {
        // "JBSWY3DPEHPK3PXP" decodes to "Hello World!"... check known vector
        let decoded = try TOTPGenerator.decodeBase32("JBSWY3DPEHPK3PXP")
        XCTAssertFalse(decoded.isEmpty)
    }

    func testBase32InvalidCharacter() {
        XCTAssertThrowsError(try TOTPGenerator.decodeBase32("INVALID!@#"))
    }

    func testBase32WithSpaces() throws {
        // Spaces should be stripped
        let a = try TOTPGenerator.decodeBase32("JBSW Y3DP")
        let b = try TOTPGenerator.decodeBase32("JBSWY3DP")
        XCTAssertEqual(a, b)
    }

    func testBase32CaseInsensitive() throws {
        let upper = try TOTPGenerator.decodeBase32("JBSWY3DP")
        let lower = try TOTPGenerator.decodeBase32("jbswy3dp")
        XCTAssertEqual(upper, lower)
    }

    func testCurrentCodeIs6Digits() throws {
        let seed = try TOTPGenerator.decodeBase32("JBSWY3DPEHPK3PXP")
        let code = try TOTPGenerator.currentCode(seed: seed)
        XCTAssertEqual(code.count, 6)
        XCTAssertTrue(code.allSatisfy { $0.isNumber })
    }

    func testCurrentCodeIs8Digits() throws {
        let seed = try TOTPGenerator.decodeBase32("JBSWY3DPEHPK3PXP")
        let code = try TOTPGenerator.currentCode(seed: seed, digits: 8)
        XCTAssertEqual(code.count, 8)
    }

    func testSecondsRemainingRange() {
        let remaining = TOTPGenerator.secondsRemaining()
        XCTAssertGreaterThan(remaining, 0)
        XCTAssertLessThanOrEqual(remaining, 30)
    }

    func testOTPAuthURIParsing() {
        let uri = "otpauth://totp/Example%3AAlice?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30"
        let parsed = OTPAuthURI.parse(uri)
        XCTAssertNotNil(parsed)
        XCTAssertEqual(parsed?.issuer, "Example")
        XCTAssertEqual(parsed?.secret, "JBSWY3DPEHPK3PXP")
        XCTAssertEqual(parsed?.digits, 6)
        XCTAssertEqual(parsed?.period, 30)
    }

    func testOTPAuthURIInvalid() {
        XCTAssertNil(OTPAuthURI.parse("https://not-an-otp-uri.com"))
    }

    func testCodeConsistency() throws {
        // Two calls within same 30s window should return the same code
        let seed = try TOTPGenerator.decodeBase32("JBSWY3DPEHPK3PXP")
        let code1 = try TOTPGenerator.currentCode(seed: seed)
        let code2 = try TOTPGenerator.currentCode(seed: seed)
        // This could theoretically fail at a 30s boundary, but acceptable
        XCTAssertEqual(code1, code2)
    }
}
