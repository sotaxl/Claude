import SwiftUI
import StoreKit

@main
struct FillKeyApp: App {
    @StateObject private var store = StoreService.shared
    @StateObject private var syncEngine = SyncEngine.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .environmentObject(syncEngine)
                .task {
                    await store.loadProducts()
                    await store.restorePurchases()
                }
        }
    }
}

struct RootView: View {
    @EnvironmentObject var store: StoreService
    @AppStorage("hasCompletedOnboarding", store: .init(suiteName: AppGroup.suiteName)) var hasCompletedOnboarding = false

    var body: some View {
        if hasCompletedOnboarding {
            MainTabView()
        } else {
            OnboardingView()
        }
    }
}
