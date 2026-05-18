import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var store: StoreService
    @EnvironmentObject var syncEngine: SyncEngine
    @State private var showPaywall = false
    @AppStorage("hasCompletedOnboarding", store: .init(suiteName: AppGroup.suiteName))
    var hasCompletedOnboarding = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Subscription") {
                    if store.isPro {
                        HStack {
                            Label("FillKey Pro", systemImage: "star.fill")
                                .foregroundStyle(.yellow)
                            Spacer()
                            Text("Active").foregroundStyle(.green)
                        }
                    } else {
                        Button("Upgrade to Pro") { showPaywall = true }
                            .foregroundStyle(.yellow)
                    }
                }

                Section("Sync") {
                    HStack {
                        Label("CloudKit Sync", systemImage: "icloud.fill")
                        Spacer()
                        if syncEngine.isSyncing {
                            ProgressView()
                        } else if let date = syncEngine.lastSyncDate {
                            Text(date, style: .relative).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    Button("Sync Now") {
                        Task { await syncEngine.syncNow() }
                    }
                    .disabled(!store.isPro || syncEngine.isSyncing)
                }

                Section("Setup") {
                    Button("Extension Setup Guide") {
                        UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!)
                    }
                    Button("Re-run Onboarding") {
                        hasCompletedOnboarding = false
                    }
                    .foregroundStyle(.red)
                }

                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "—")
                            .foregroundStyle(.secondary)
                    }
                    Link("Privacy Policy", destination: URL(string: "https://fillkey.app/privacy")!)
                    Link("Terms of Service", destination: URL(string: "https://fillkey.app/terms")!)
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
        }
    }
}
