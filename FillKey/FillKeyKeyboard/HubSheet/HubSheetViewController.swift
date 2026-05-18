import UIKit
import LocalAuthentication
import SwiftUI

final class HubSheetViewController: UIViewController {
    var onFill: ((String) -> Void)?
    var currentDomain: String?

    private var credentials: [Credential] = []
    private var cards: [CardRecord] = []
    private var isPro = false

    // Tab bar
    private let tabBar = UISegmentedControl(items: ["Codes", "Passwords", "Cards", "Passkeys"])
    private var currentTab = 0

    private let tableView = UITableView(frame: .zero, style: .insetGrouped)
    private let searchController = UISearchController()
    private var filteredCredentials: [Credential] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        loadCredentials()
    }

    private func setupUI() {
        view.backgroundColor = .systemGroupedBackground
        title = "FillKey Hub"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .close,
            target: self, action: #selector(close)
        )

        tabBar.selectedSegmentIndex = 0
        tabBar.addTarget(self, action: #selector(tabChanged), for: .valueChanged)
        tabBar.translatesAutoresizingMaskIntoConstraints = false

        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")

        view.addSubview(tabBar)
        view.addSubview(tableView)

        NSLayoutConstraint.activate([
            tabBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            tabBar.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            tabBar.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            tableView.topAnchor.constraint(equalTo: tabBar.bottomAnchor, constant: 8),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        // Check Pro status
        let defaults = UserDefaults(suiteName: AppGroup.suiteName)
        isPro = defaults?.bool(forKey: "fillkey.isPro") ?? false

        // Disable Pro-only tabs
        if !isPro {
            tabBar.setEnabled(false, forSegmentAt: 2) // Cards
        }
    }

    private func loadCredentials() {
        Task {
            let all = (try? await KeychainService.shared.loadAllCredentials()) ?? []
            self.credentials = all.filter { !$0.isTombstone }
            self.filterCredentials(query: nil)
            DispatchQueue.main.async { self.tableView.reloadData() }
        }
    }

    private func filterCredentials(query: String?) {
        let relevant: [Credential]
        switch currentTab {
        case 0: relevant = credentials.filter { [.totp, .smsOTP, .emailOTP].contains($0.type) }
        case 1: relevant = credentials.filter { $0.type == .password }
        case 3: relevant = credentials.filter { $0.type == .passkey }
        default: relevant = []
        }

        if let query, !query.isEmpty {
            filteredCredentials = relevant.filter {
                $0.label.localizedCaseInsensitiveContains(query) ||
                $0.domain.localizedCaseInsensitiveContains(query)
            }
        } else {
            // Domain-first sort
            let matcher = DomainMatcher()
            if let domain = currentDomain {
                let (matching, others) = matcher.credentials(matching: domain, from: relevant)
                filteredCredentials = matching + others
            } else {
                filteredCredentials = relevant
            }
        }
    }

    @objc private func tabChanged() {
        currentTab = tabBar.selectedSegmentIndex
        filterCredentials(query: nil)
        tableView.reloadData()
    }

    @objc private func close() {
        dismiss(animated: true)
    }
}

// MARK: – Table

extension HubSheetViewController: UITableViewDataSource, UITableViewDelegate {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        currentTab == 2 ? cards.count : filteredCredentials.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
        var config = cell.defaultContentConfiguration()

        if currentTab == 2 {
            let card = cards[indexPath.row]
            config.text = card.nickname
            config.secondaryText = "···· \(card.last4) · Exp \(card.displayExpiry)"
            config.image = UIImage(systemName: "creditcard.fill")
        } else {
            let cred = filteredCredentials[indexPath.row]
            config.text = cred.label
            config.secondaryText = cred.username ?? cred.domain
            config.image = credentialIcon(for: cred.type)
        }

        cell.contentConfiguration = config
        cell.accessoryType = .disclosureIndicator
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)

        if currentTab == 2 {
            fillCard(cards[indexPath.row])
        } else {
            fillCredential(filteredCredentials[indexPath.row])
        }
    }

    private func credentialIcon(for type: CredentialType) -> UIImage? {
        switch type {
        case .totp: UIImage(systemName: "clock.badge.checkmark.fill")
        case .password: UIImage(systemName: "lock.fill")
        case .passkey: UIImage(systemName: "person.badge.key.fill")
        default: UIImage(systemName: "key.fill")
        }
    }

    private func fillCredential(_ credential: Credential) {
        Task {
            do {
                let value: String
                switch credential.type {
                case .totp:
                    let seed = try await KeychainService.shared.loadTOTPSeed(for: credential.id)
                    value = try TOTPGenerator.currentCode(
                        seed: seed,
                        digits: credential.totpDigits ?? 6,
                        period: credential.totpPeriod ?? 30
                    )
                case .password:
                    value = try await KeychainService.shared.loadPassword(for: credential.id)
                default:
                    return
                }
                DispatchQueue.main.async {
                    self.onFill?(value)
                    self.dismiss(animated: true)
                }
            } catch {
                // Show error
            }
        }
    }

    private func fillCard(_ card: CardRecord) {
        // Card fill sequence: number → expiry → name (separate taps)
        dismiss(animated: true)
    }
}
