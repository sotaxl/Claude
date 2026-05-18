import Foundation
import AuthenticationServices

// Gmail OAuth client — uses ASWebAuthenticationSession (no external SDKs)
@MainActor
final class GmailOAuthClient: NSObject, Sendable {
    static let shared = GmailOAuthClient()

    // Configure these in your Google Cloud Console project
    private let clientID = Bundle.main.object(forInfoDictionaryKey: "GMAIL_CLIENT_ID") as? String ?? ""
    private let redirectURI = "com.fillkey.app:/oauth2callback"
    private let scopes = ["https://www.googleapis.com/auth/gmail.readonly"]

    private let tokenKeychainKey = "gmail.oauth.token"
    private let keychain = KeychainService.shared

    struct OAuthToken: Codable, Sendable {
        let accessToken: String
        let refreshToken: String?
        let expiresAt: Date
        var isExpired: Bool { Date() >= expiresAt }
    }

    // MARK: – Auth flow

    func authenticate(presentingWindow: ASPresentationAnchor) async throws {
        let state = UUID().uuidString
        let scopeString = scopes.joined(separator: "%20")
        let authURLString = "https://accounts.google.com/o/oauth2/v2/auth"
            + "?client_id=\(clientID)"
            + "&redirect_uri=\(redirectURI)"
            + "&response_type=code"
            + "&scope=\(scopeString)"
            + "&state=\(state)"
            + "&access_type=offline"

        guard let authURL = URL(string: authURLString) else { throw OAuthError.invalidURL }

        let callbackURL: URL = try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: authURL, callbackURLScheme: "com.fillkey.app") { url, error in
                if let error { continuation.resume(throwing: error); return }
                guard let url else { continuation.resume(throwing: OAuthError.noCallback); return }
                continuation.resume(returning: url)
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = true
            session.start()
        }

        guard let code = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?
            .queryItems?.first(where: { $0.name == "code" })?.value
        else { throw OAuthError.noAuthCode }

        let token = try await exchangeCodeForToken(code)
        try await keychain.save(token, for: tokenKeychainKey)
    }

    func validToken() async throws -> OAuthToken {
        var token = try await keychain.load(OAuthToken.self, for: tokenKeychainKey)
        if token.isExpired, let refreshToken = token.refreshToken {
            token = try await refreshAccessToken(refreshToken)
            try await keychain.save(token, for: tokenKeychainKey)
        }
        return token
    }

    func isConnected() async -> Bool {
        (try? await keychain.load(OAuthToken.self, for: tokenKeychainKey)) != nil
    }

    func disconnect() async throws {
        try await keychain.delete(for: tokenKeychainKey)
    }

    // MARK: – Token exchange

    private func exchangeCodeForToken(_ code: String) async throws -> OAuthToken {
        var request = URLRequest(url: URL(string: "https://oauth2.googleapis.com/token")!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        request.httpBody = "code=\(code)&client_id=\(clientID)&redirect_uri=\(redirectURI)&grant_type=authorization_code"
            .data(using: .utf8)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try parseTokenResponse(data)
    }

    private func refreshAccessToken(_ refreshToken: String) async throws -> OAuthToken {
        var request = URLRequest(url: URL(string: "https://oauth2.googleapis.com/token")!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        request.httpBody = "refresh_token=\(refreshToken)&client_id=\(clientID)&grant_type=refresh_token"
            .data(using: .utf8)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try parseTokenResponse(data, existingRefreshToken: refreshToken)
    }

    private func parseTokenResponse(_ data: Data, existingRefreshToken: String? = nil) throws -> OAuthToken {
        struct Response: Decodable {
            let access_token: String
            let refresh_token: String?
            let expires_in: Int
        }
        let response = try JSONDecoder().decode(Response.self, from: data)
        return OAuthToken(
            accessToken: response.access_token,
            refreshToken: response.refresh_token ?? existingRefreshToken,
            expiresAt: Date().addingTimeInterval(TimeInterval(response.expires_in - 60))
        )
    }

    // MARK: – Fetch recent OTP emails

    func fetchRecentOTPMessages() async throws -> [ExtractedOTP] {
        let token = try await validToken()

        // Search Gmail for OTP-related emails in the last hour
        let query = "subject:(code OR verify OR OTP OR \"one-time\" OR verification) newer_than:1h"
        let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        let url = URL(string: "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=\(encodedQuery)&maxResults=20")!

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token.accessToken)", forHTTPHeaderField: "Authorization")

        let (listData, _) = try await URLSession.shared.data(for: request)

        struct MessageList: Decodable {
            struct MessageRef: Decodable { let id: String }
            let messages: [MessageRef]?
        }

        let list = try JSONDecoder().decode(MessageList.self, from: listData)
        var results: [ExtractedOTP] = []

        for ref in list.messages?.prefix(10) ?? [] {
            guard let otp = try? await fetchMessage(id: ref.id, token: token.accessToken) else { continue }
            results.append(otp)
        }

        return results.filter { !$0.isExpired }
    }

    private func fetchMessage(id: String, token: String) async throws -> ExtractedOTP? {
        let url = URL(string: "https://gmail.googleapis.com/gmail/v1/users/me/messages/\(id)?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)

        struct GmailMessage: Decodable {
            struct Header: Decodable { let name: String; let value: String }
            struct Payload: Decodable { let headers: [Header] }
            let snippet: String
            let payload: Payload
            let internalDate: String
        }

        let msg = try JSONDecoder().decode(GmailMessage.self, from: data)
        let headers = msg.payload.headers
        let subject = headers.first(where: { $0.name == "Subject" })?.value ?? ""
        let from = headers.first(where: { $0.name == "From" })?.value ?? ""
        let dateMs = Double(msg.internalDate) ?? 0

        let emailMsg = EmailMessage(
            subject: subject,
            bodySnippet: msg.snippet,
            sender: from,
            receivedAt: Date(timeIntervalSince1970: dateMs / 1000)
        )
        return OTPExtractor.extract(from: emailMsg)
    }
}

extension GmailOAuthClient: ASWebAuthenticationPresentationContextProviding {
    nonisolated func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first(where: { $0.isKeyWindow }) ?? UIWindow()
    }
}

enum OAuthError: Error {
    case invalidURL
    case noCallback
    case noAuthCode
}
