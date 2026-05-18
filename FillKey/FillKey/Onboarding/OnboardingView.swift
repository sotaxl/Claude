import SwiftUI

struct OnboardingView: View {
    @AppStorage("hasCompletedOnboarding", store: .init(suiteName: AppGroup.suiteName))
    var hasCompletedOnboarding = false

    @State private var step = 0

    var body: some View {
        TabView(selection: $step) {
            WelcomeStep().tag(0)
            EnableExtensionStep().tag(1)
            EnableKeyboardStep().tag(2)
            EnableAutofillStep().tag(3)
            DoneStep { hasCompletedOnboarding = true }.tag(4)
        }
        .tabViewStyle(.page)
        .indexViewStyle(.page(backgroundDisplayMode: .always))
        .ignoresSafeArea()
    }
}

// MARK: – Step Views

private struct WelcomeStep: View {
    var body: some View {
        OnboardingStepLayout(
            icon: "key.fill",
            iconColor: .yellow,
            title: "Welcome to FillKey",
            body: "Every password, OTP, and card — surfaced right above your keyboard in Safari.",
            buttonLabel: "Get Started",
            action: {}
        )
    }
}

private struct EnableExtensionStep: View {
    var body: some View {
        OnboardingStepLayout(
            icon: "safari.fill",
            iconColor: .blue,
            title: "Enable Safari Extension",
            body: "Go to Settings → Safari → Extensions → FillKey and turn it on for all websites.",
            buttonLabel: "Open Settings",
            action: { UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!) }
        )
    }
}

private struct EnableKeyboardStep: View {
    var body: some View {
        OnboardingStepLayout(
            icon: "keyboard.fill",
            iconColor: .green,
            title: "Enable FillKey Keyboard",
            body: "Go to Settings → General → Keyboard → Keyboards → Add New Keyboard → FillKey.\n\nThen enable Full Access so it can read your saved credentials.",
            buttonLabel: "Open Settings",
            action: { UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!) }
        )
    }
}

private struct EnableAutofillStep: View {
    var body: some View {
        OnboardingStepLayout(
            icon: "person.badge.key.fill",
            iconColor: .purple,
            title: "Set as AutoFill Provider",
            body: "Go to Settings → Passwords → Password Options → enable FillKey as your AutoFill provider.\n\nThis lets iOS route SMS one-time codes to FillKey automatically.",
            buttonLabel: "Open Settings",
            action: { UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!) }
        )
    }
}

private struct DoneStep: View {
    let onDone: () -> Void
    var body: some View {
        OnboardingStepLayout(
            icon: "checkmark.circle.fill",
            iconColor: .green,
            title: "You're all set!",
            body: "Open Safari and tap any login form. Your FillKey toolbar will appear above the keyboard.",
            buttonLabel: "Start Using FillKey",
            action: onDone
        )
    }
}

private struct OnboardingStepLayout: View {
    let icon: String
    let iconColor: Color
    let title: String
    let body: String
    let buttonLabel: String
    let action: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            Image(systemName: icon)
                .font(.system(size: 80))
                .foregroundStyle(iconColor)
            VStack(spacing: 12) {
                Text(title)
                    .font(.largeTitle.bold())
                    .multilineTextAlignment(.center)
                Text(body)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }
            Spacer()
            Button(action: action) {
                Text(buttonLabel)
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.yellow)
                    .foregroundStyle(.black)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 48)
        }
    }
}
