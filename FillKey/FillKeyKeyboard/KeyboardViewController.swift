import UIKit
import LocalAuthentication

final class KeyboardViewController: UIInputViewController {

    // MARK: – Subviews

    private let otpRow = OTPRowView()
    private let nextKeyboardButton: UIButton = {
        var config = UIButton.Configuration.plain()
        config.image = UIImage(systemName: "globe")
        config.baseForegroundColor = .systemGray
        let b = UIButton(configuration: config)
        b.translatesAutoresizingMaskIntoConstraints = false
        return b
    }()

    private var currentDomain: String? {
        UserDefaults(suiteName: AppGroup.suiteName)?.string(forKey: DomainMatcher.currentDomainKey)
    }

    private var otpRefreshTimer: Timer?

    // MARK: – Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLayout()
        setupCallbacks()
        startOTPRefresh()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        refreshOTPCodes()
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        otpRefreshTimer?.invalidate()
    }

    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
        nextKeyboardButton.isHidden = !needsInputModeSwitchKey
    }

    // MARK: – Layout

    private func setupLayout() {
        otpRow.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(otpRow)
        view.addSubview(nextKeyboardButton)

        NSLayoutConstraint.activate([
            otpRow.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            otpRow.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            otpRow.topAnchor.constraint(equalTo: view.topAnchor),
            otpRow.heightAnchor.constraint(equalToConstant: 44),

            // Make the keyboard extension height = OTP row only
            view.heightAnchor.constraint(equalToConstant: 44),

            nextKeyboardButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 8),
            nextKeyboardButton.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -4)
        ])

        nextKeyboardButton.addTarget(self, action: #selector(handleInputModeList(from:with:)), for: .allTouchEvents)
    }

    // MARK: – Callbacks

    private func setupCallbacks() {
        otpRow.onSMSTap = { [weak self] code in
            self?.insertText(code)
            UIPasteboard.general.string = code
        }

        otpRow.onTOTPTap = { [weak self] code in
            self?.insertText(code)
            UIPasteboard.general.string = code
        }

        otpRow.onHubTap = { [weak self] in
            self?.openHub()
        }
    }

    // MARK: – OTP refresh

    private func startOTPRefresh() {
        otpRefreshTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.refreshOTPCodes()
        }
    }

    private func refreshOTPCodes() {
        // Read SMS OTP from shared defaults (set by credential provider or AutoFill)
        let defaults = UserDefaults(suiteName: AppGroup.suiteName)
        let smsCode = defaults?.string(forKey: "fillkey.latestSMSOTP")
        otpRow.smsCode = smsCode

        // Load first TOTP credential and show its current code
        Task { @MainActor in
            let all = (try? await KeychainService.shared.loadAllCredentials()) ?? []
            let totpCredentials = all.filter { $0.type == .totp && !$0.isTombstone }

            // Domain-first: show the most relevant TOTP for current domain
            let domain = self.currentDomain
            let matcher = DomainMatcher()
            let sorted: [Credential]
            if let domain {
                let (matching, others) = matcher.credentials(matching: domain, from: totpCredentials)
                sorted = matching + others
            } else {
                sorted = totpCredentials
            }

            guard let first = sorted.first else { return }
            let seed = try? await KeychainService.shared.loadTOTPSeed(for: first.id)
            guard let seed else { return }
            let code = try? TOTPGenerator.currentCode(seed: seed, digits: first.totpDigits ?? 6, period: first.totpPeriod ?? 30)
            self.otpRow.totpCode = code
            self.otpRow.totpSecondsRemaining = TOTPGenerator.secondsRemaining()
        }
    }

    // MARK: – Hub sheet

    private func openHub() {
        // Require biometric auth before opening hub
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            presentHubDirectly()
            return
        }

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                               localizedReason: "Authenticate to open FillKey Hub") { [weak self] success, _ in
            DispatchQueue.main.async {
                if success { self?.presentHubDirectly() }
            }
        }
    }

    private func presentHubDirectly() {
        let hubVC = HubSheetViewController()
        hubVC.currentDomain = currentDomain
        hubVC.onFill = { [weak self] value in
            self?.insertText(value)
        }

        let nav = UINavigationController(rootViewController: hubVC)
        if let sheet = nav.sheetPresentationController {
            sheet.detents = [.medium(), .large()]
            sheet.prefersGrabberVisible = true
        }

        // Present from the extension's view controller hierarchy
        var responder: UIResponder? = self
        while responder != nil {
            if let vc = responder as? UIViewController {
                vc.present(nav, animated: true)
                return
            }
            responder = responder?.next
        }
    }
}
