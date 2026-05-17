import SafariServices
import os.log

private let log = OSLog(subsystem: "com.clearapp", category: "Extension")

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        guard
            let item    = context.inputItems.first as? NSExtensionItem,
            let message = item.userInfo?[SFExtensionMessageKey] as? [String: Any]
        else {
            context.completeRequest(returningItems: nil)
            return
        }

        os_log(.default, log: log, "Clear received message: %{public}@", message.description)

        let response      = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["status": "ok"]]
        context.completeRequest(returningItems: [response])
    }
}
