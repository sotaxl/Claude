# Clear – Dark Pattern Blocker

A Safari Web Extension for iOS that detects and neutralizes dark patterns on shopping and subscription sites.

## What it detects

| Pattern | Severity | Example |
|---|---|---|
| Fake urgency timers | 🔴 High | "Offer ends in 09:47" |
| Fake stock scarcity | 🔴 High | "Only 2 left!" |
| Fake social proof | 🟠 Medium | "47 people viewing this" |
| Pre-checked opt-ins | 🟠 Medium | Pre-ticked newsletter checkbox |
| Confirm-shaming | 🟠 Medium | "No thanks, I hate saving money" |
| Hidden costs | 🟡 Low | "+ tax & fees" in fine print |
| Forced continuity | 🔴 High | "Free trial, then $9.99/mo auto-billed" |

## Architecture

```
clear-extension/
├── Extension/           Safari Web Extension (JS + HTML/CSS)
│   ├── manifest.json    Manifest V3
│   ├── content.js       Detection engine + DOM neutralizer
│   ├── background.js    Badge counter (service worker)
│   ├── popup.html/css/js Extension popup UI
│   └── icons/           PNG icons (see generate-icons.sh)
└── iOS/                 Native SwiftUI app wrapper
    ├── ClearApp.swift
    ├── ContentView.swift
    └── SafariWebExtensionHandler.swift
```

## Xcode project setup

> Requires Xcode 15+, iOS 17 SDK, macOS 14+

### 1. Create the Xcode project

1. Open Xcode → **File → New → Project**
2. Choose **iOS → App**, name it `Clear`, bundle ID `com.clearapp`
3. Language: **Swift**, Interface: **SwiftUI**

### 2. Add the Safari Web Extension target

1. **File → New → Target → Safari Extension**
2. Name it `Clear Extension`, type **Safari Web Extension**
3. Set bundle ID to `com.clearapp.extension`

### 3. Copy source files

Replace generated stubs with the files in this repo:

- `iOS/ClearApp.swift` → into the `Clear` target
- `iOS/ContentView.swift` → into the `Clear` target
- `iOS/SafariWebExtensionHandler.swift` → into the `Clear Extension` target
- Everything in `Extension/` → into the `Clear Extension/Resources` folder

### 4. Generate icons

```bash
cd Extension/icons
chmod +x generate-icons.sh
./generate-icons.sh
# Then run the rsvg-convert commands printed by the script
```

### 5. Run

- Select the `Clear` scheme, target a connected iPhone or simulator
- Build & run (`⌘R`)
- On device: Settings → Safari → Extensions → Clear → Enable

## Monetisation

| Tier | Price | Features |
|---|---|---|
| Free | $0 | Detect + label all patterns |
| Pro | $2.99/mo or $19.99/yr | Auto-neutralize (uncheck boxes, collapse timers) + scan history + cross-device sync |

Gate Pro features in `content.js` by checking `browser.storage.local.get(['isPro'])` before calling neutralizers.

## Submitting to the App Store

1. All extensions must ship inside a parent iOS app — the SwiftUI wrapper fulfils this requirement.
2. In App Store Connect, add the **Safari Extension** entitlement.
3. Enable **In-App Purchases** for Pro tier via StoreKit 2.
4. Privacy manifest: this extension reads DOM text — declare `NSPrivacyAccessedAPICategoryUserDefaults` and no data collection beyond on-device storage.
