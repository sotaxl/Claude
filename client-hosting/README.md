# Client Hosting Setup — Master Checklist

Complete these in order. Each service has its own guide in this folder.

---

## Quick Reference

| Service    | What it does                        | File                   |
|------------|-------------------------------------|------------------------|
| GitHub     | Code storage & deployments trigger  | `01-github.md`         |
| Supabase   | Database, Auth, File Storage        | `02-supabase.md`       |
| Vercel     | Hosting & automatic deployments     | `03-vercel.md`         |
| Stripe     | Payments & subscriptions            | `04-stripe.md`         |
| Resend     | Transactional email                 | `05-resend.md`         |
| Claude API | AI features (optional)              | `06-claude.md`         |

All environment variables in one place → `env-template.txt`

---

## Setup Order

### Phase 1 — Accounts (do first, ~15 min)
- [ ] Create GitHub repo (see `01-github.md`)
- [ ] Create Supabase project (see `02-supabase.md`)
- [ ] Create Vercel account & link GitHub (see `03-vercel.md`)
- [ ] Create Stripe account (see `04-stripe.md`)
- [ ] Create Resend account (see `05-resend.md`)
- [ ] Get Claude API key if using AI (see `06-claude.md`)

### Phase 2 — Configure Each Service (~30 min)
- [ ] Set up Supabase: database tables, auth providers, RLS policies
- [ ] Set up Stripe: products, prices, webhook
- [ ] Set up Resend: verify sending domain
- [ ] Connect GitHub repo to Vercel

### Phase 3 — Connect Everything (~20 min)
- [ ] Fill in `env-template.txt` with all real values
- [ ] Add all env vars to Vercel dashboard
- [ ] Add Supabase URL + anon key to Vercel
- [ ] Add Stripe webhook secret to Vercel
- [ ] Trigger first deploy on Vercel

### Phase 4 — Go Live (~10 min)
- [ ] Add custom domain in Vercel
- [ ] Update DNS records at domain registrar
- [ ] Update Supabase allowed URLs (add production domain)
- [ ] Update Stripe webhook URL (add production endpoint)
- [ ] Test auth, payment, and email end-to-end
- [ ] Enable Vercel password protection while client reviews (optional)

---

## How the Services Connect

```
User visits site
      │
      ▼
   Vercel  ◄──── GitHub (auto-deploys on push to main)
      │
      ├──► Supabase (auth + database + storage)
      ├──► Stripe   (payments + subscriptions)
      ├──► Resend   (sends emails)
      └──► Claude API (AI features, if used)
```

- **Vercel** pulls code from **GitHub** and deploys automatically
- **Supabase** handles who can log in and what data they can see
- **Stripe** handles money — Vercel receives Stripe webhooks to update subscription status
- **Resend** sends emails triggered by your app (welcome, invoices, etc.)
- **Claude** responds to AI prompts from your app's backend

---

## Costs (ballpark)

| Service    | Free tier                        | Paid starts at     |
|------------|----------------------------------|--------------------|
| GitHub     | Unlimited public + private repos | $4/mo (teams)      |
| Supabase   | 2 free projects, 500MB DB        | $25/mo             |
| Vercel     | 1 free project                   | $20/mo (pro)       |
| Stripe     | Free (2.9% + 30¢ per charge)     | Same rate          |
| Resend     | 3,000 emails/mo free             | $20/mo (50k)       |
| Claude API | Pay per token                    | ~$3/M input tokens |
