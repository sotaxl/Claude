import Foundation
import StoreKit

@MainActor
final class StoreService: ObservableObject {
    static let shared = StoreService()

    @Published private(set) var proProduct: Product?
    @Published private(set) var isPro = false
    @Published private(set) var isLoading = false

    private let proProductID = "com.fillkey.pro.monthly"

    // MARK: – Load products

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let products = try await Product.products(for: [proProductID])
            proProduct = products.first
            await refreshEntitlements()
        } catch {
            // Products unavailable (e.g., not configured yet in App Store Connect)
        }
    }

    // MARK: – Purchase

    func purchase() async throws {
        guard let product = proProduct else { return }
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            await refreshEntitlements()
        case .userCancelled, .pending:
            break
        @unknown default:
            break
        }
    }

    // MARK: – Restore

    func restorePurchases() async {
        do {
            try await AppStore.sync()
            await refreshEntitlements()
        } catch {
            // Restore failed silently
        }
    }

    // MARK: – Entitlement check

    func refreshEntitlements() async {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if transaction.productID == proProductID && !transaction.isExpired {
                isPro = true
                return
            }
        }
        isPro = false
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified: throw StoreError.unverified
        case .verified(let value): return value
        }
    }
}

enum StoreError: Error {
    case unverified
}

extension Transaction {
    var isExpired: Bool {
        if let expiry = expirationDate {
            return Date() > expiry
        }
        return false
    }
}
