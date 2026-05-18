import Foundation
import CloudKit
import Combine

@MainActor
final class SyncEngine: ObservableObject {
    static let shared = SyncEngine()

    @Published private(set) var isSyncing = false
    @Published private(set) var lastSyncDate: Date?
    @Published private(set) var syncError: Error?

    private let container = CKContainer(identifier: "iCloud.com.fillkey.app")
    private var privateDB: CKDatabase { container.privateCloudDatabase }
    private let crypto = CloudKitCryptoService.shared
    private let keychain = KeychainService.shared

    // MARK: – Sync

    func syncNow() async {
        guard !isSyncing else { return }
        isSyncing = true
        syncError = nil
        defer { isSyncing = false }

        do {
            try await pullFromCloud()
            try await pushToCloud()
            lastSyncDate = Date()
        } catch {
            syncError = error
        }
    }

    // MARK: – Push

    private func pushToCloud() async throws {
        let credentials = try await keychain.loadAllCredentials()
        var records: [CKRecord] = []

        for credential in credentials {
            let encrypted = try await crypto.encrypt(credential)
            let encRecord = EncryptedCredentialRecord(credential: credential, encryptedBlob: encrypted)
            records.append(encRecord.ckRecord)
        }

        let batchSize = 400
        for batch in stride(from: 0, to: records.count, by: batchSize) {
            let slice = Array(records[batch..<min(batch + batchSize, records.count)])
            let op = CKModifyRecordsOperation(recordsToSave: slice, recordIDsToDelete: nil)
            op.savePolicy = .changedKeys
            op.qualityOfService = .utility
            try await privateDB.add(op)
        }
    }

    // MARK: – Pull

    private func pullFromCloud() async throws {
        let query = CKQuery(
            recordType: EncryptedCredentialRecord.recordType,
            predicate: NSPredicate(value: true)
        )
        query.sortDescriptors = [NSSortDescriptor(key: "modifiedAt", ascending: false)]

        var cursor: CKQueryOperation.Cursor?
        var allRecords: [CKRecord] = []

        repeat {
            let (records, nextCursor) = try await fetchPage(query: query, cursor: cursor)
            allRecords.append(contentsOf: records)
            cursor = nextCursor
        } while cursor != nil

        for record in allRecords {
            guard let encRecord = EncryptedCredentialRecord(ckRecord: record) else { continue }
            if encRecord.isTombstone {
                // Tombstone: remove locally if exists
                try? await keychain.delete(for: "credential.\(encRecord.recordID.recordName)")
                continue
            }
            let credential = try await crypto.decrypt(encRecord.encryptedBlob)
            // Last-write-wins: only update if cloud version is newer
            if let local = try? await keychain.load(Credential.self, for: credential.keychainKey) {
                if credential.modifiedAt > local.modifiedAt {
                    try await keychain.save(credential, for: credential.keychainKey)
                }
            } else {
                try await keychain.save(credential, for: credential.keychainKey)
            }
        }
    }

    private func fetchPage(
        query: CKQuery,
        cursor: CKQueryOperation.Cursor?
    ) async throws -> ([CKRecord], CKQueryOperation.Cursor?) {
        return try await withCheckedThrowingContinuation { continuation in
            var records: [CKRecord] = []
            let op: CKQueryOperation

            if let cursor {
                op = CKQueryOperation(cursor: cursor)
            } else {
                op = CKQueryOperation(query: query)
            }
            op.resultsLimit = 200

            op.recordMatchedBlock = { _, result in
                if case .success(let record) = result {
                    records.append(record)
                }
            }
            op.queryResultBlock = { result in
                switch result {
                case .success(let cursor):
                    continuation.resume(returning: (records, cursor))
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
            self.privateDB.add(op)
        }
    }
}

// MARK: – CKDatabase async helper

extension CKDatabase {
    func add(_ operation: CKModifyRecordsOperation) async throws {
        return try await withCheckedThrowingContinuation { continuation in
            operation.modifyRecordsResultBlock = { result in
                switch result {
                case .success: continuation.resume()
                case .failure(let error): continuation.resume(throwing: error)
                }
            }
            self.add(operation)
        }
    }
}
