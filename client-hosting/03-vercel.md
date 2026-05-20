# Vercel Setup

Vercel hosts your app and automatically deploys every time you push to GitHub.

---

## Step 1 — Create Account & Import Project

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Click **Add New** → **Project**
3. Find your GitHub repo and click **Import**
4. Vercel auto-detects Next.js — no framework config needed
5. **Do not deploy yet** — add env vars first (Step 2)

---

## Step 2 — Add Environment Variables

In the Vercel project setup screen (or later via **Settings** → **Environment Variables**):

Add every variable from `env-template.txt`. For each one:
- Paste the **Name** (e.g. `NEXT_PUBLIC_SUPABASE_URL`)
- Paste the **Value**
- Select which environments it applies to:
  - **Production** — your live site
  - **Preview** — pull request previews
  - **Development** — local `vercel dev` (optional)

### Which vars go where

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` (prod project) | ✅ | ❌ | ❌ |
| `NEXT_PUBLIC_SUPABASE_URL` (dev project) | ❌ | ✅ | ✅ |
| `STRIPE_WEBHOOK_SECRET` (prod) | ✅ | ❌ | ❌ |
| `STRIPE_WEBHOOK_SECRET` (test) | ❌ | ✅ | ✅ |
| `NEXTAUTH_URL` | `https://yourclient.com` | auto | `http://localhost:3000` |

> Using separate Supabase/Stripe projects for prod vs dev is safer — mistakes in testing don't affect real users.

---

## Step 3 — Deploy

1. Click **Deploy** — Vercel builds your app
2. Wait ~2 minutes for the build to complete
3. Click the preview URL to check it works
4. If build fails, click **View build logs** to see the error

### Common build errors

| Error | Fix |
|-------|-----|
| `Cannot find module` | Run `npm install` locally and commit `package-lock.json` |
| `Environment variable not found` | Variable missing in Vercel dashboard — add it |
| TypeScript errors | Fix type errors locally before pushing |
| `Build command exited with 1` | Check build logs — usually a missing env var |

---

## Step 4 — Connect a Custom Domain

1. Vercel project → **Settings** → **Domains**
2. Click **Add** → type `yourclientdomain.com`
3. Vercel shows you DNS records to add — two options:

### Option A — Nameservers (Easiest, full control to Vercel)
Change the domain's nameservers to Vercel's at your domain registrar:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Option B — A Record (Keep DNS at registrar)
Add these records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

4. DNS changes take up to 48 hours (usually ~15 minutes)
5. Vercel auto-provisions an SSL certificate once DNS propagates

---

## Step 5 — Set Up Preview Deployments

Every pull request gets its own preview URL — great for showing the client changes before they go live.

Vercel does this automatically. You can share the preview URL with your client to approve changes before merging to `main`.

To password-protect previews (so only the client can see them):
1. **Settings** → **Deployment Protection**
2. Enable **Vercel Authentication** or set a **Password**

---

## Step 6 — Configure Build Settings (if needed)

Go to **Settings** → **General** → **Build & Development Settings**:

| Setting | Value for Next.js |
|---------|------------------|
| Framework Preset | Next.js (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Root Directory | `/` (or `clientforge/` if in subfolder) |

> If your Next.js app is in a subfolder (like `clientforge/`), set **Root Directory** to that folder.

---

## Step 7 — Automatic Deploys

Vercel deploys automatically when:
- You push to `main` → deploys to production
- You push to any other branch → creates a preview deployment
- You open a pull request → creates a preview URL shown in the PR

No extra setup needed — this works as soon as your GitHub repo is connected.

---

## Step 8 — Logs & Monitoring

- **Runtime logs:** Vercel project → **Logs** tab (live request logs)
- **Build logs:** Click any deployment → **Build Logs**
- **Function logs:** Serverless function invocations with timing and errors

For production monitoring, consider adding [Vercel Analytics](https://vercel.com/analytics) (free tier available):
```bash
npm install @vercel/analytics
```
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
export default function RootLayout({ children }) {
  return <html><body>{children}<Analytics /></body></html>
}
```

---

## Checklist

- [ ] Vercel account created (signed in with GitHub)
- [ ] GitHub repo imported into Vercel
- [ ] All environment variables added (Production, Preview, Dev)
- [ ] First deploy successful
- [ ] Custom domain added
- [ ] DNS records updated at registrar
- [ ] SSL certificate active (green padlock)
- [ ] Preview deployments tested
