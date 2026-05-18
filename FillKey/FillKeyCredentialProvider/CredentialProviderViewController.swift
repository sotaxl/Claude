import AuthenticationServices
import UIKit
import LocalAuthentication

final class CredentialProviderViewController: ASCredentialProviderViewController {

    private var serviceIdentifiers: [ASCredentialServiceIdentifier] = []
    private var credentials: [Credential] = []

    private let tableView = UITableView(frame: .zero, style: .insetGrouped)
    private let searchController = UISearchController()
    private var filteredCredentials: [Credential] = []

    // MARK: – Entry points

    override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
        self.serviceIdentifiers = serviceIdentifiers
        Task {
            await loadAndFilter()
        }
    }

    override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
        Task {
            await authenticate(then: { [weak self] in
                await self?.provide(credentialIdentity: credentialIdentity)
            })
        }
    }

    override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
        Task {
            await provide(credentialIdentity: credentialIdentity)
        }
    }

    // MARK: – Load credentials

    private func loadAndFilter() async {
        let all = (try? await KeychainService.shared.loadAllCredentials()) ?? []
        let passwords = all.filter { $0.type == .password && !$0.isTombstone }

        // Match against service identifiers
        let matchingDomains = Set(serviceIdentifiers.compactMap { si -> String? in
            switch si.type {
            case .URL: return URL(string: si.identifier)?.host.map { Credential.extractETLDPlusOne(from: $0) }
            case .domain: return Credential.extractETLDPlusOne(from: si.identifier)
            @unknown default: return nil
            }
        })

        let matching = passwords.filter { matchingDomains.contains(Credential.extractETLDPlusOne(from: $0.domain)) }
        let others = passwords.filter { !matchingDomains.contains(Credential.extractETLDPlusOne(from: $0.domain)) }

        await MainActor.run {
            self.credentials = matching + others
            self.filteredCredentials = self.credentials
            self.setupUI()
        }
    }

    // MARK: – UI

    private func setupUI() {
        view.backgroundColor = .systemGroupedBackground

        navigationItem.title = "FillKey"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: self, action: #selector(cancel)
        )

        searchController.searchResultsUpdater = self
        searchController.obscuresBackgroundDuringPresentation = false
        searchController.searchBar.placeholder = "Search passwords"
        navigationItem.searchController = searchController

        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
        view.addSubview(tableView)
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.topAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        tableView.reloadData()
    }

    @objc private func cancel() {
        extensionContext.cancelRequest(withError: NSError(
            domain: ASExtensionErrorDomain,
            code: ASExtensionError.userCanceled.rawValue
        ))
    }

    // MARK: – Provide credential

    private func provide(credentialIdentity: ASPasswordCredentialIdentity) async {
        guard let recordID = UUID(uuidString: credentialIdentity.recordIdentifier ?? "") else {
            cancel()
            return
        }
        do {
            let password = try await KeychainService.shared.loadPassword(for: recordID)
            let credential = ASPasswordCredential(user: credentialIdentity.user, password: password)
            extensionContext.completeRequest(withSelectedCredential: credential, completionHandler: nil)
        } catch {
            cancel()
        }
    }

    private func authenticate(then action: @escaping () async -> Void) async {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            await action()
            return
        }
        let success = (try? await context.evaluatePolicy(
            .deviceOwnerAuthentication,
            localizedReason: "Authenticate to autofill"
        )) ?? false
        if success { await action() }
    }
}

// MARK: – Table

extension CredentialProviderViewController: UITableViewDataSource, UITableViewDelegate {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        filteredCredentials.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
        let cred = filteredCredentials[indexPath.row]
        var config = cell.defaultContentConfiguration()
        config.text = cred.label
        config.secondaryText = cred.username ?? cred.domain
        config.image = UIImage(systemName: "lock.fill")
        cell.contentConfiguration = config
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let cred = filteredCredentials[indexPath.row]

        Task {
            await authenticate(then: { [weak self] in
                guard let self else { return }
                do {
                    let password = try await KeychainService.shared.loadPassword(for: cred.id)
                    let credential = ASPasswordCredential(user: cred.username ?? "", password: password)
                    self.extensionContext.completeRequest(withSelectedCredential: credential, completionHandler: nil)
                } catch {
                    self.cancel()
                }
            })
        }
    }
}

// MARK: – Search

extension CredentialProviderViewController: UISearchResultsUpdating {
    func updateSearchResults(for searchController: UISearchController) {
        let query = searchController.searchBar.text ?? ""
        if query.isEmpty {
            filteredCredentials = credentials
        } else {
            filteredCredentials = credentials.filter {
                $0.label.localizedCaseInsensitiveContains(query) ||
                ($0.username?.localizedCaseInsensitiveContains(query) ?? false) ||
                $0.domain.localizedCaseInsensitiveContains(query)
            }
        }
        tableView.reloadData()
    }
}

// MARK: – LAContext async

extension LAContext {
    func evaluatePolicy(_ policy: LAPolicy, localizedReason: String) async throws -> Bool {
        return try await withCheckedThrowingContinuation { continuation in
            evaluatePolicy(policy, localizedReason: localizedReason) { success, error in
                if let error { continuation.resume(throwing: error) }
                else { continuation.resume(returning: success) }
            }
        }
    }
}
