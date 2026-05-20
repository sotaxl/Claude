# Stripe Setup

Stripe handles all payments, subscriptions, and billing.

---

## Step 1 — Create Account

1. Go to [stripe.com](https://stripe.com) → **Start now**
2. Verify your email
3. Complete business details (needed before you can receive real payments)

You start in **Test mode** — no real money moves until you activate.

---

## Step 2 — Create Products & Prices

Go to **Product catalogue** → **Add product**:

### Example SaaS Plans

**Free Plan**
- Name: `Free`
- Price: `£0 / month`
- Copy the **Price ID** (looks like `price_1ABC...`)

**Pro Plan**
- Name: `Pro`
- Price: `£29 / month` (recurring)
- Add an annual price: `£279 / year` (recurring)
- Copy both **Price IDs**

**Agency Plan**
- Name: `Agency`
- Price: `£79 / month` (recurring)
- Copy the **Price ID**

> Save all Price IDs — they go into your environment variables.

---

## Step 3 — Get API Keys

Go to **Developers** → **API keys**:

| Key | Environment Variable | Notes |
|-----|---------------------|-------|
| Publishable key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Safe to expose publicly |
| Secret key | `STRIPE_SECRET_KEY` | **Never expose — server only** |

You'll have two sets: **Test keys** and **Live keys**.
- Use test keys during development
- Switch to live keys when going to production

---

## Step 4 — Set Up Webhooks

Webhooks tell your app when something happens in Stripe (payment succeeded, subscription cancelled, etc.).

### For Local Development

1. Install the Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Run:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
3. It prints a **webhook signing secret** — copy it to `STRIPE_WEBHOOK_SECRET` in `.env.local`

### For Production

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://yourclientdomain.com/api/webhooks/stripe`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Go to the webhook → **Signing secret** → copy it to `STRIPE_WEBHOOK_SECRET` in Vercel

> **Important:** Production webhook secret is different from the local CLI secret. Add the correct one to Vercel.

---

## Step 5 — Create a Customer Portal

Stripe's hosted portal lets customers manage their own subscriptions (cancel, upgrade, update card).

1. **Settings** → **Billing** → **Customer portal**
2. Enable **Allow customers to cancel subscriptions**
3. Enable **Allow customers to update subscriptions** (upgrade/downgrade)
4. Set your **business name** and logo
5. Save

In your app, create a portal session:
```ts
// app/api/billing/portal/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { customerId } = await req.json()

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  })

  return Response.json({ url: session.url })
}
```

---

## Step 6 — Handle Webhooks in Your App

```ts
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      // Update user's plan in Supabase
      break
    }
    case 'customer.subscription.deleted': {
      // Downgrade user to free plan
      break
    }
    case 'invoice.payment_failed': {
      // Send dunning email via Resend
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

---

## Step 7 — Go Live Checklist

Before switching from test to live mode:

- [ ] Complete Stripe business verification (takes 1-3 days)
- [ ] Add bank account for payouts
- [ ] Switch API keys to live keys in Vercel
- [ ] Create a new production webhook endpoint (different from test)
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel to the live webhook secret
- [ ] Test a real payment of £0.50 or use [test cards](https://stripe.com/docs/testing#cards)

### Test Card Numbers

| Card | Number | Use |
|------|--------|-----|
| Visa | `4242 4242 4242 4242` | Successful payment |
| Declined | `4000 0000 0000 0002` | Card declined |
| 3D Secure | `4000 0027 6000 3184` | Requires auth |

Use any future expiry, any 3-digit CVC, any postcode.

---

## Environment Variables

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...
STRIPE_PRICE_ID_AGENCY_MONTHLY=price_...
```

---

## Checklist

- [ ] Stripe account created and verified
- [ ] Products and prices created
- [ ] Price IDs saved to `env-template.txt`
- [ ] Test webhook set up for local dev
- [ ] Production webhook endpoint added
- [ ] Webhook events selected
- [ ] Customer portal configured
- [ ] Live API keys added to Vercel when going live
