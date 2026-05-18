import SwiftUI

struct VaultView: View {
    @StateObject private var vm = VaultViewModel()
    @EnvironmentObject var store: StoreService
    @State private var showAddTOTP = false
    @State private var showAddPassword = false
    @State private var showAddCard = false
    @State private var showPaywall = false
    @State private var searchText = ""

    var filteredCredentials: [Credential] {
        guard !searchText.isEmpty else { return vm.credentials }
        return vm.credentials.filter {
            $0.label.localizedCaseInsensitiveContains(searchText) ||
            ($0.username?.localizedCaseInsensitiveContains(searchText) ?? false) ||
            $0.domain.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                if filteredCredentials.isEmpty && searchText.isEmpty {
                    ContentUnavailableView(
                        "No credentials yet",
                        systemImage: "key.fill",
                        description: Text("Add passwords, TOTP accounts, or cards.")
                    )
                } else {
                    ForEach(filteredCredentials) { credential in
                        CredentialRow(credential: credential, vm: vm)
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Search credentials")
            .navigationTitle("My Vault")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Add Password", systemImage: "lock.fill") {
                            showAddPassword = true
                        }
                        Button("Add TOTP Account", systemImage: "qrcode") {
                            showAddTOTP = true
                        }
                        Button("Add Card", systemImage: "creditcard.fill") {
                            if store.isPro { showAddCard = true }
                            else { showPaywall = true }
                        }
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showAddTOTP) {
                AddTOTPView(vm: vm)
            }
            .sheet(isPresented: $showAddPassword) {
                AddPasswordView(vm: vm)
            }
            .sheet(isPresented: $showAddCard) {
                AddCardView(vm: vm)
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
            .task { await vm.load() }
        }
    }
}

private struct CredentialRow: View {
    let credential: Credential
    let vm: VaultViewModel

    var icon: String {
        switch credential.type {
        case .totp: return "clock.badge.checkmark.fill"
        case .password: return "lock.fill"
        case .card: return "creditcard.fill"
        case .passkey: return "person.badge.key.fill"
        default: return "key.fill"
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.yellow)
                .frame(width: 32)
            VStack(alignment: .leading, spacing: 2) {
                Text(credential.label).font(.subheadline.bold())
                if let username = credential.username {
                    Text(username).font(.caption).foregroundStyle(.secondary)
                }
                Text(credential.domain).font(.caption2).foregroundStyle(.tertiary)
            }
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("Delete", role: .destructive) {
                Task { try? await vm.delete(credential) }
            }
        }
    }
}

// MARK: – Add forms

struct AddTOTPView: View {
    let vm: VaultViewModel
    @Environment(\.dismiss) var dismiss
    @State private var uri = ""
    @State private var error: Error?

    var body: some View {
        NavigationStack {
            Form {
                Section("OTP Auth URI") {
                    TextField("otpauth://totp/...", text: $uri)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }
                if let error {
                    Section {
                        Text(error.localizedDescription).foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Add TOTP Account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        Task {
                            do {
                                try await vm.addTOTP(uri: uri)
                                dismiss()
                            } catch { self.error = error }
                        }
                    }
                    .disabled(uri.isEmpty)
                }
            }
        }
    }
}

struct AddPasswordView: View {
    let vm: VaultViewModel
    @Environment(\.dismiss) var dismiss
    @State private var label = ""
    @State private var username = ""
    @State private var password = ""
    @State private var domain = ""

    var body: some View {
        NavigationStack {
            Form {
                Section { TextField("Site name", text: $label) }
                Section {
                    TextField("Username / Email", text: $username)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    SecureField("Password", text: $password)
                    TextField("Domain (e.g. google.com)", text: $domain)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }
            }
            .navigationTitle("Add Password")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        Task {
                            try? await vm.addPassword(label: label, username: username, password: password, domain: domain)
                            dismiss()
                        }
                    }
                    .disabled(label.isEmpty || password.isEmpty)
                }
            }
        }
    }
}

struct AddCardView: View {
    let vm: VaultViewModel
    @Environment(\.dismiss) var dismiss
    @State private var nickname = ""
    @State private var cardholderName = ""
    @State private var pan = ""
    @State private var expiryMonth = 1
    @State private var expiryYear = Calendar.current.component(.year, from: Date())

    var body: some View {
        NavigationStack {
            Form {
                Section("Card Details") {
                    TextField("Nickname (e.g. Chase Sapphire)", text: $nickname)
                    TextField("Cardholder Name", text: $cardholderName)
                        .textInputAutocapitalization(.words)
                    SecureField("Card Number", text: $pan)
                        .keyboardType(.numberPad)
                }
                Section("Expiry") {
                    Picker("Month", selection: $expiryMonth) {
                        ForEach(1...12, id: \.self) { Text(String(format: "%02d", $0)).tag($0) }
                    }
                    Picker("Year", selection: $expiryYear) {
                        let currentYear = Calendar.current.component(.year, from: Date())
                        ForEach(currentYear...(currentYear + 10), id: \.self) { Text(String($0)).tag($0) }
                    }
                }
            }
            .navigationTitle("Add Card")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        let card = CardRecord(
                            nickname: nickname,
                            last4: String(pan.suffix(4)),
                            expiryMonth: expiryMonth,
                            expiryYear: expiryYear,
                            cardholderName: cardholderName
                        )
                        Task {
                            try? await vm.addCard(card, pan: pan)
                            dismiss()
                        }
                    }
                    .disabled(nickname.isEmpty || pan.count < 13)
                }
            }
        }
    }
}
