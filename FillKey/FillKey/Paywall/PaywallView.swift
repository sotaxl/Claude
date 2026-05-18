import SwiftUI
import StoreKit

struct PaywallView: View {
    @EnvironmentObject var store: StoreService
    @Environment(\.dismiss) var dismiss
    @State private var isPurchasing = false
    @State private var error: Error?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "key.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.yellow)
                        Text("FillKey Pro")
                            .font(.largeTitle.bold())
                        Text("Every credential, one tap away")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 32)

                    // Feature list
                    VStack(alignment: .leading, spacing: 16) {
                        FeatureRow(icon: "envelope.fill", color: .blue,
                                   title: "Email OTP", subtitle: "Gmail + Apple Mail one-time codes")
                        FeatureRow(icon: "icloud.fill", color: .cyan,
                                   title: "Cross-Device Sync", subtitle: "End-to-end encrypted via CloudKit")
                        FeatureRow(icon: "creditcard.fill", color: .purple,
                                   title: "Card Autofill", subtitle: "Secure Enclave-protected card fill")
                        FeatureRow(icon: "number.circle.fill", color: .green,
                                   title: "Unlimited TOTP", subtitle: "No cap on authenticator accounts")
                    }
                    .padding()
                    .background(.secondarySystemBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    // Price + CTA
                    VStack(spacing: 12) {
                        if let product = store.proProduct {
                            Button {
                                Task { await purchase() }
                            } label: {
                                HStack {
                                    if isPurchasing {
                                        ProgressView().tint(.white)
                                    } else {
                                        Text("Start Pro — \(product.displayPrice)/mo")
                                            .font(.headline)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(.yellow)
                                .foregroundStyle(.black)
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                            }
                            .disabled(isPurchasing)
                        } else {
                            ProgressView()
                        }

                        Button("Restore Purchase") {
                            Task { await store.restorePurchases() }
                        }
                        .font(.footnote)
                        .foregroundStyle(.secondary)

                        Text("Cancel anytime in Settings → Subscriptions")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                            .multilineTextAlignment(.center)
                    }

                    if let error {
                        Text(error.localizedDescription)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .padding(.horizontal)
                    }
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }

    private func purchase() async {
        isPurchasing = true
        error = nil
        do {
            try await store.purchase()
            if store.isPro { dismiss() }
        } catch {
            self.error = error
        }
        isPurchasing = false
    }
}

private struct FeatureRow: View {
    let icon: String
    let color: Color
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
                .frame(width: 36)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.subheadline.bold())
                Text(subtitle).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
        }
    }
}
