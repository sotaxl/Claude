# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repo (`sotaxl/claude`) contains two things:

1. **`clientforge/`** — A production-ready SaaS starter (Next.js 14 App Router + TypeScript)
2. **Skills** — Agent skill definitions in `.agents/skills/` and `SKILL.md`

## ClientForge

### Tech Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Drizzle ORM + NeonDB (PostgreSQL)
- **Auth**: NextAuth v4 (Google, Apple, Email/Password)
- **Payments**: Stripe (subscriptions + webhooks)
- **Email**: Resend + React Email

### Commands

All commands run from `clientforge/`:

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Apply Drizzle schema to NeonDB
npm run db:generate  # Generate Drizzle migrations
npm run db:studio    # Open Drizzle Studio
npm run email:dev    # Preview React Email templates
```

For local Stripe webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Architecture

```
clientforge/
├── app/
│   ├── (auth)/       # Login, register — public routes
│   ├── (dashboard)/  # Protected pages (sidebar layout)
│   ├── (marketing)/  # Landing, pricing — public routes
│   └── api/          # REST: auth, Stripe webhooks, client portal token auth
├── components/
│   ├── auth/         # Login/register forms
│   ├── dashboard/    # Sidebar, kanban board, tables
│   └── marketing/    # Hero, pricing, navbar, footer
├── db/schema.ts      # Single Drizzle schema: users, clients, projects, activities
├── emails/           # React Email templates (welcome, upgrade, dunning, discount)
├── lib/              # auth.ts, db.ts, stripe.ts, email.ts, utils.ts
└── middleware.ts     # NextAuth route protection for /dashboard, /clients, /projects, /billing, /settings
```

**Auth flow**: NextAuth session → `middleware.ts` guards dashboard routes → `lib/auth.ts` configures providers and session callbacks.

**Stripe flow**: Price IDs from env vars → checkout session → webhook at `/api/webhooks/stripe` handles subscription lifecycle idempotently.

**Client portal**: Shareable token-based link (no auth required) — separate from the main NextAuth session.

### Environment Setup

Copy `.env.example` to `.env.local` and fill in: `DATABASE_URL`, `NEXTAUTH_SECRET`, Google/Apple OAuth credentials, Stripe keys + price IDs, and `RESEND_API_KEY`.

### Stripe Plans

- Free, Pro ($29/mo), Agency ($79/mo) with 14-day trial and annual discount
- Discount codes: `LAUNCH25` (25% off 3 months), `ANNUAL20` (20% off annual)
- Price IDs must be created in Stripe dashboard and added to `.env.local`

## Skills

Agent skills are stored in `.agents/skills/` and tracked in `skills-lock.json`. The `SKILL.md` at the root is a template for creating new skills.
