import Foundation
import CryptoKit

// RFC 6238 TOTP implementation — no third-party dependencies
enum TOTPError: Error, Sendable {
    case invalidBase32
    case invalidSeed
    case computationFailed
}

struct TOTPGenerator: Sendable {

    // MARK: – Public API

    static func currentCode(seed: Data, digits: Int = 6, period: Int = 30) throws -> String {
        let counter = UInt64(Date().timeIntervalSince1970) / UInt64(period)
        return try hotp(seed: seed, counter: counter, digits: digits)
    }

    static func secondsRemaining(period: Int = 30) -> Int {
        let elapsed = Int(Date().timeIntervalSince1970) % period
        return period - elapsed
    }

    static func decodeBase32(_ input: String) throws -> Data {
        let base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        let cleaned = input.uppercased().replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "=", with: "")

        var bits = 0
        var bitsCount = 0
        var output = Data()

        for char in cleaned {
            guard let value = base32Alphabet.firstIndex(of: char) else {
                throw TOTPError.invalidBase32
            }
            let index = base32Alphabet.distance(from: base32Alphabet.startIndex, to: value)
            bits = (bits << 5) | index
            bitsCount += 5
            if bitsCount >= 8 {
                bitsCount -= 8
                output.append(UInt8((bits >> bitsCount) & 0xFF))
            }
        }
        return output
    }

    // MARK: – RFC 4226 HOTP

    private static func hotp(seed: Data, counter: UInt64, digits: Int) throws -> String {
        var counterBigEndian = counter.bigEndian
        let counterData = withUnsafeBytes(of: &counterBigEndian) { Data($0) }

        let key = SymmetricKey(data: seed)
        let mac = HMAC<Insecure.SHA1>.authenticationCode(for: counterData, using: key)
        let macData = Data(mac)

        // Dynamic truncation
        let offset = Int(macData.last! & 0x0F)
        let truncated = macData[offset..<(offset + 4)]
        var code = truncated.withUnsafeBytes { $0.load(as: UInt32.self).bigEndian }
        code &= 0x7FFFFFFF

        let divisor = UInt32(pow(10.0, Double(digits)))
        let otp = code % divisor

        return String(format: "%0\(digits)d", otp)
    }
}

// MARK: – otpauth URI parsing

struct OTPAuthURI: Sendable {
    let issuer: String
    let accountName: String
    let secret: String
    let algorithm: String
    let digits: Int
    let period: Int

    static func parse(_ uri: String) -> OTPAuthURI? {
        guard uri.hasPrefix("otpauth://totp/") else { return nil }

        var components = URLComponents(string: uri)
        let labelPart = uri.dropFirst("otpauth://totp/".count)
            .components(separatedBy: "?").first ?? ""
        let decoded = labelPart.removingPercentEncoding ?? labelPart

        var issuer = ""
        var account = decoded
        if decoded.contains(":") {
            let parts = decoded.components(separatedBy: ":")
            issuer = parts[0]
            account = parts.dropFirst().joined(separator: ":")
        }

        let params = components?.queryItems ?? []
        func param(_ name: String) -> String? {
            params.first(where: { $0.name == name })?.value
        }

        guard let secret = param("secret") else { return nil }
        let finalIssuer = param("issuer") ?? issuer
        let algorithm = param("algorithm") ?? "SHA1"
        let digits = Int(param("digits") ?? "6") ?? 6
        let period = Int(param("period") ?? "30") ?? 30

        return OTPAuthURI(
            issuer: finalIssuer,
            accountName: account,
            secret: secret,
            algorithm: algorithm,
            digits: digits,
            period: period
        )
    }
}
