import XCTest
@testable import FillKey

final class KeychainServiceTests: XCTestCase {

    private let keychain = KeychainService.shared
    private let testKey = "test.keychain.\(UUID().uuidString)"

    override func tearDown() async throws {
        try? await keychain.delete(for: testKey)
    }

    func testSaveAndLoad() async throws {
        let data = Data("test-secret".utf8)
        try await keychain.save(data, for: testKey)
        let loaded = try await keychain.load(for: testKey)
        XCTAssertEqual(data, loaded)
    }

    func testOverwrite() async throws {
        try await keychain.save(Data("first".utf8), for: testKey)
        try await keychain.save(Data("second".utf8), for: testKey)
        let loaded = try await keychain.load(for: testKey)
        XCTAssertEqual(loaded, Data("second".utf8))
    }

    func testDelete() async throws {
        try await keychain.save(Data("value".utf8), for: testKey)
        try await keychain.delete(for: testKey)
        do {
            _ = try await keychain.load(for: testKey)
            XCTFail("Expected itemNotFound error")
        } catch KeychainError.itemNotFound {
            // Expected
        }
    }

    func testDeleteNonExistent() async throws {
        // Should not throw
        try await keychain.delete(for: "nonexistent.key.\(UUID().uuidString)")
    }

    func testCodableRoundtrip() async throws {
        struct TestStruct: Codable, Equatable {
            let name: String
            let value: Int
        }
        let original = TestStruct(name: "hello", value: 42)
        try await keychain.save(original, for: testKey)
        let loaded = try await keychain.load(TestStruct.self, for: testKey)
        XCTAssertEqual(original, loaded)
    }

    func testCredentialSaveAndLoad() async throws {
        let key = "credential.test.\(UUID().uuidString)"
        defer { Task { try? await self.keychain.delete(for: key) } }

        let credential = Credential(
            type: .password,
            label: "GitHub",
            username: "alice@example.com",
            domain: "github.com"
        )
        try await keychain.save(credential, for: key)
        let loaded = try await keychain.load(Credential.self, for: key)
        XCTAssertEqual(loaded.id, credential.id)
        XCTAssertEqual(loaded.label, "GitHub")
        XCTAssertEqual(loaded.type, .password)
    }
}
