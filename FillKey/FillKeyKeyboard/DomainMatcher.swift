import Foundation

struct DomainMatcher {
    private let sharedDefaults = UserDefaults(suiteName: AppGroup.suiteName)
    static let currentDomainKey = "fillkey.currentDomain"

    var currentDomain: String? {
        sharedDefaults?.string(forKey: Self.currentDomainKey)
    }

    func credentials(matching domain: String?, from all: [Credential]) -> (matching: [Credential], others: [Credential]) {
        guard let domain else { return ([], all) }
        let etld = Credential.extractETLDPlusOne(from: domain)
        let matching = all.filter { Credential.extractETLDPlusOne(from: $0.domain) == etld }
        let matchingIDs = Set(matching.map { $0.id })
        let others = all.filter { !matchingIDs.contains($0.id) }
        return (matching, others)
    }
}

struct AppGroup {
    static let suiteName = "group.com.fillkey.shared"
    static let keychainAccessGroup = "group.com.fillkey.shared"
}
