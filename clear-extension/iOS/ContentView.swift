import SwiftUI
import SafariServices

struct ContentView: View {
    @State private var isEnabled = false
    @State private var checking  = true

    private let bundleID = "com.clearapp.extension"

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo
                VStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .strokeBorder(Color.white.opacity(0.12), lineWidth: 1.5)
                            .frame(width: 88, height: 88)
                        Image(systemName: "scope")
                            .font(.system(size: 34, weight: .light))
                            .foregroundStyle(.white)
                    }

                    Text("Clear")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)

                    Text("Dark Pattern Blocker")
                        .font(.system(size: 15))
                        .foregroundStyle(.white.opacity(0.5))
                }

                Spacer().frame(height: 40)

                // Status card
                HStack(spacing: 14) {
                    Image(systemName: isEnabled ? "checkmark.shield.fill" : "shield.slash.fill")
                        .font(.system(size: 26))
                        .foregroundStyle(isEnabled ? Color.green : Color.white.opacity(0.3))
                        .animation(.spring(response: 0.4), value: isEnabled)

                    VStack(alignment: .leading, spacing: 3) {
                        Text(statusTitle)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(.white)

                        Text(statusSub)
                            .font(.system(size: 13))
                            .foregroundStyle(.white.opacity(0.45))
                    }

                    Spacer()
                }
                .padding(18)
                .background(.white.opacity(0.06))
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .strokeBorder(.white.opacity(0.08), lineWidth: 1)
                )
                .padding(.horizontal, 24)

                Spacer().frame(height: 20)

                // CTA button
                Button(action: openSafariSettings) {
                    HStack {
                        Image(systemName: "safari")
                        Text("Enable in Safari Settings")
                    }
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .padding(.horizontal, 24)

                Spacer().frame(height: 44)

                // Features
                VStack(alignment: .leading, spacing: 14) {
                    FeatureRow(icon: "timer",               color: .red,    text: "Detects fake countdown timers")
                    FeatureRow(icon: "cube.box.fill",       color: .orange, text: "Exposes fake stock scarcity")
                    FeatureRow(icon: "checkmark.square.fill", color: .yellow, text: "Unchecks pre-selected opt-ins")
                    FeatureRow(icon: "text.bubble.fill",    color: .purple, text: "Flags confirm-shaming language")
                    FeatureRow(icon: "arrow.triangle.2.circlepath", color: .blue, text: "Warns about forced continuity")
                }
                .padding(.horizontal, 32)

                Spacer()
            }
        }
        .onAppear(perform: checkStatus)
    }

    private var statusTitle: String {
        if checking { return "Checking…" }
        return isEnabled ? "Extension Active" : "Extension Disabled"
    }

    private var statusSub: String {
        if checking { return "Looking up Safari extension state" }
        return isEnabled
            ? "Monitoring Safari for dark patterns"
            : "Enable Clear in Safari → Extensions"
    }

    private func checkStatus() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: bundleID) { state, _ in
            DispatchQueue.main.async {
                checking  = false
                isEnabled = state?.isEnabled ?? false
            }
        }
    }

    private func openSafariSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }
}

struct FeatureRow: View {
    let icon:  String
    let color: Color
    let text:  String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 20)
            Text(text)
                .font(.system(size: 13))
                .foregroundStyle(.white.opacity(0.5))
        }
    }
}

#Preview {
    ContentView()
}
