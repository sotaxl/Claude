# ClientForge

A production-ready SaaS starter for agencies and freelancers. Client portal, project management, Stripe billing, Google & Apple Sign-In, and automated email sequences — all in one codebase.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Drizzle ORM + NeonDB (PostgreSQL) |
| Auth | NextAuth v4 — Google, Apple, Email/Password |
| Payments | Stripe (subscriptions, webhooks, customer portal) |
| Email | Resend + React Email |

## Features

- **Landing page** — dark-SaaS design, hero, features, pricing, testimonials, FAQ, CTA
- **Auth** — Google Sign-In, Apple Sign-In, email/password with bcrypt
- **Dashboard** — stats overview, project board (kanban + list), client table
- **Client portal** — shareable portal link per client with token auth
- **Stripe billing** — Free / Pro ($29/mo) / Agency ($79/mo), 14-day trial, annual discount
- **Webhooks** — idempotent handler for subscription lifecycle events
- **Email sequences** — Welcome, upgrade confirmation, payment failed/dunning, discount offer
- **Discount codes** — LAUNCH25 (25% off 3 months), ANNUAL20 (20% off annual)
- **Settings** — profile, email notification preferences, danger zone

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourorg/clientforge
cd clientforge
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in every variable in `.env.local`. See comments inline for where to get each value.

### 3. Set up the database

```bash
npm run db:push    # applies schema to NeonDB
npm run db:studio  # optional: open Drizzle Studio
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Set up Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed webhook secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Project Structure

```
clientforge/
├── app/
│   ├── (auth)/           # Login, register pages
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── (marketing)/      # Landing page, pricing
│   └── api/              # REST endpoints + auth + webhooks
├── components/
│   ├── auth/             # Login & register forms
│   ├── dashboard/        # Sidebar, header, tables, boards
│   └── marketing/        # Navbar, hero, features, pricing, footer
├── db/
│   └── schema.ts         # Drizzle schema (users, clients, projects, activities)
├── emails/               # React Email templates
├── lib/                  # auth.ts, db.ts, stripe.ts, email.ts, utils.ts
├── hooks/                # use-toast
└── types/                # Session types, plan definitions
```

## Email Sequences

All emails sent via Resend from `noreply@clientforge.io`:

| Trigger | Template |
|---|---|
| New signup | Welcome email with onboarding steps |
| Successful upgrade | Upgrade confirmation with feature list |
| Payment failed | Dunning email with payment update link |
| Free user 7+ days | Discount offer with `LAUNCH25` code |

## Stripe Setup

1. Create products in Stripe dashboard: **Pro** and **Agency**
2. Create monthly and annual prices for each
3. Copy price IDs into `.env.local`
4. Create discount coupon `LAUNCH25` (25% off, 3 months) in Stripe dashboard
5. Deploy webhook endpoint and update `STRIPE_WEBHOOK_SECRET`

## Deployment

Deploy to Vercel in one click:

```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

## License

MIT
