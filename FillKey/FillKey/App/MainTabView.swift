import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            VaultView()
                .tabItem { Label("Vault", systemImage: "key.fill") }
            SettingsView()
                .tabItem { Label("Settings", systemImage: "gear") }
        }
        .tint(.yellow)
    }
}
