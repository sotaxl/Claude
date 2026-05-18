import SafariServices
import os.log

final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    private let sharedDefaults = UserDefaults(suiteName: "group.com.fillkey.shared")
    private let logger = Logger(subsystem: "com.fillkey.app.safari", category: "extension")

    func beginRequest(with context: NSExtensionContext) {
        guard
            let item = context.inputItems.first as? NSExtensionItem,
            let message = item.userInfo?[SFExtensionMessageKey]
        else {
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        guard let dict = message as? [String: Any],
              let action = dict["action"] as? String
        else {
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        switch action {
        case "fieldFocused":
            handleFieldFocused(dict: dict)
            context.completeRequest(returningItems: [], completionHandler: nil)

        case "getDomain":
            let domain = (dict["domain"] as? String) ?? ""
            sharedDefaults?.set(domain, forKey: "fillkey.currentDomain")
            context.completeRequest(returningItems: [], completionHandler: nil)

        default:
            context.completeRequest(returningItems: [], completionHandler: nil)
        }
    }

    private func handleFieldFocused(dict: [String: Any]) {
        // Only metadata — no credential values cross into JS layer
        guard let fieldType = dict["fieldType"] as? String,
              let domain = dict["domain"] as? String
        else { return }

        let etld = extractETLDPlusOne(from: domain)
        sharedDefaults?.set(etld, forKey: "fillkey.currentDomain")
        sharedDefaults?.set(fieldType, forKey: "fillkey.currentFieldType")

        // Do NOT log fieldType + domain together to avoid correlation
        logger.info("Field focused event received")
    }

    private func extractETLDPlusOne(from hostname: String) -> String {
        let parts = hostname.lowercased()
            .replacingOccurrences(of: "www.", with: "")
            .components(separatedBy: ".")
        guard parts.count >= 2 else { return hostname.lowercased() }
        return parts.suffix(2).joined(separator: ".")
    }
}
