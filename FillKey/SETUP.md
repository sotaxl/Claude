# FillKey — Setup Guide (iPhone-Only Developer)

Since you're building from an iPhone, GitHub Actions handles all the Xcode building.
Here's every step you need to do — all from your phone.

---

## Step 1: Apple Developer Account ($99/year)

1. Go to https://developer.apple.com on Safari
2. Sign in with your Apple ID → enroll in the **Apple Developer Program**
3. Pay the $99/year fee (required for App Store submission)

---

## Step 2: Create App IDs (developer.apple.com)

Go to **Certificates, Identifiers & Profiles → Identifiers**. Create 4 App IDs:

| App ID | Bundle ID |
|--------|-----------|
| FillKey | `com.fillkey.app` |
| FillKey Keyboard | `com.fillkey.app.keyboard` |
| FillKey Safari | `com.fillkey.app.safari` |
| FillKey AutoFill | `com.fillkey.app.credential-provider` |

For each, enable these capabilities as needed:
- **FillKey (main)**: App Groups, iCloud (CloudKit), AutoFill Credential Provider
- **Keyboard**: App Groups
- **Safari**: App Groups
- **AutoFill**: App Groups, AutoFill Credential Provider

For App Groups: use `group.com.fillkey.shared`
For iCloud Container: use `iCloud.com.fillkey.app`

---

## Step 3: Create App Store Connect App

1. Go to https://appstoreconnect.apple.com
2. **My Apps → +** → New App
3. Fill in:
   - **Name**: FillKey — Autofill & OTP Hub
   - **Bundle ID**: `com.fillkey.app`
   - **SKU**: `fillkey-ios-001`
   - **Primary Language**: English

---

## Step 4: Create In-App Purchase (StoreKit)

In App Store Connect → your app → **Monetization → In-App Purchases**:
- Type: **Auto-Renewable Subscription**
- Reference Name: FillKey Pro Monthly
- Product ID: `com.fillkey.pro.monthly`
- Price: $3.99/month

---

## Step 5: Generate Signing Certificate (using GitHub Actions)

Since you can't run Xcode, use an alternative approach:

### Option A: Use a free cloud Mac (Easiest)

Sign up at **Codemagic** (codemagic.io) — free tier available:
1. Connect your GitHub repo
2. Codemagic handles signing automatically via their UI
3. It can submit to App Store Connect directly

### Option B: GitHub Actions with Manual Certificate (Advanced)

You need a signing certificate. Use a **free cloud Mac** to generate it once:
- **MacInCloud** (macincloud.com) — hourly rental ~$1/hour
- **Scaleway Apple Silicon** — pay-per-use

On the cloud Mac, run:
```bash
# Generate a certificate signing request
security create-keychain -p password build.keychain
security unlock-keychain -p password build.keychain
openssl genrsa -out private.key 2048
openssl req -new -key private.key -out CertificateSigningRequest.certSigningRequest \
  -subj "/emailAddress=you@example.com/CN=FillKey/O=YourName/C=US"
```

Then upload `CertificateSigningRequest.certSigningRequest` to:
**developer.apple.com → Certificates → + → iOS Distribution**

Download the resulting `.cer` file, then on the cloud Mac:
```bash
security import distribution.cer -k build.keychain
security export -k build.keychain -t identities -f pkcs12 -P "yourpassword" -o certificate.p12
base64 -i certificate.p12 | pbcopy  # Copy to clipboard
```

Then in **GitHub → your repo → Settings → Secrets**:
- `BUILD_CERTIFICATE_BASE64`: paste the base64 certificate
- `P12_PASSWORD`: your p12 password
- `KEYCHAIN_PASSWORD`: any password (e.g. `build123`)
- `DEVELOPMENT_TEAM`: your 10-character Team ID from developer.apple.com

---

## Step 6: Set Your Team ID in project.yml

Edit `FillKey/project.yml` and replace `""` in `DEVELOPMENT_TEAM: ""` with your Team ID.

Your Team ID is the 10-character string on developer.apple.com under **Membership Details**.

---

## Step 7: Create Provisioning Profiles

In **developer.apple.com → Profiles**, create 4 Distribution profiles:
- One for each App ID above
- Type: **App Store**

Download each, base64 encode them, and add as GitHub Secrets:
- `PROVISIONING_PROFILE_BASE64`
- `KEYBOARD_PROFILE_BASE64`
- `SAFARI_PROFILE_BASE64`
- `CREDENTIAL_PROFILE_BASE64`

---

## Step 8: App Store Connect API Key

1. **App Store Connect → Users & Access → Integrations → App Store Connect API**
2. Generate a key with **Developer** role
3. Download the `.p8` file immediately (can't re-download)
4. Add GitHub Secrets:
   - `ASC_KEY_ID`: Key ID from the table
   - `ASC_ISSUER_ID`: Issuer ID at the top of the page
   - `ASC_KEY_BASE64`: `base64 -i AuthKey_XXXX.p8` output

---

## Step 9: Push to Trigger Build

Once secrets are set, every push to `main` will:
1. Build the project with XcodeGen
2. Run unit tests
3. Archive and export IPA
4. Upload to App Store Connect (TestFlight)

Watch progress at: **github.com/[your-repo]/actions**

---

## Step 10: TestFlight Testing

1. Install **TestFlight** app on your iPhone
2. App Store Connect → your app → **TestFlight**
3. Add yourself as an internal tester
4. The build appears within ~30 minutes of a successful CI run

To test the extensions:
1. Install the TestFlight build
2. **Settings → Safari → Extensions → FillKey** → On
3. **Settings → General → Keyboard → Keyboards → Add New Keyboard → FillKey** → Enable Full Access
4. **Settings → Passwords → Password Options** → Enable FillKey

---

## App Store Submission Checklist

- [ ] Screenshots: 6.7" (iPhone 16 Pro Max), 6.1" (iPhone 16), 12.9" iPad
- [ ] App Preview video (optional but recommended)
- [ ] Privacy Policy URL (required for subscription apps)
- [ ] Age Rating: 4+
- [ ] Export Compliance: None (standard encryption only)
- [ ] Content Rights: Yes, you own all content
- [ ] Advertising Identifier: No
- [ ] Review Notes (paste this):
  > FillKey is a Safari Web Extension and AutoFill Credential Provider.
  > To test: Settings → Safari → Extensions → FillKey (enable), Settings → General → Keyboard → Keyboards → FillKey (enable + Full Access), Settings → Passwords → Password Options → FillKey.
  > Test credentials are in the reviewer account.

---

## Gmail OAuth Setup (for Pro email OTP feature)

1. **console.cloud.google.com** → New Project → "FillKey"
2. **APIs & Services → OAuth consent screen** → External → add `gmail.readonly` scope
3. **Credentials → + Create → OAuth client ID** → iOS
4. Bundle ID: `com.fillkey.app`
5. Copy the Client ID → add to `FillKey/FillKey/Info.plist` as `GMAIL_CLIENT_ID`

---

## Recommended Free Tools (iPhone-accessible)

| Task | Tool |
|------|------|
| Monitor CI builds | GitHub mobile app |
| Review code | GitHub mobile app |
| Manage App Store | App Store Connect app |
| Beta testing | TestFlight app |
| Cloud Mac (one-time cert gen) | MacInCloud |
