import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { sendPaymentFailedEmail, sendUpgradeConfirmationEmail } from "@/lib/email"
import type Stripe from "stripe"

const HANDLED_EVENTS: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
]

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (!HANDLED_EVENTS.includes(event.type)) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== "subscription") break

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const userId = session.metadata?.userId
        if (!userId) break

        await db.update(users).set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          subscriptionStatus: subscription.status as "trialing" | "active",
          updatedAt: new Date(),
        }).where(eq(users.id, userId))

        const [user] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId))
        if (user?.email) {
          await sendUpgradeConfirmationEmail({ to: user.email, name: user.name ?? "there" })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await db.update(users).set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          subscriptionStatus: subscription.status as "trialing" | "active" | "past_due" | "canceled" | "cancel_pending" | "paused" | "unpaid",
          updatedAt: new Date(),
        }).where(eq(users.stripeCustomerId, subscription.customer as string))
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await db.update(users).set({
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
          subscriptionStatus: "canceled",
          updatedAt: new Date(),
        }).where(eq(users.stripeCustomerId, subscription.customer as string))
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const [user] = await db
          .select({ id: users.id, email: users.email, name: users.name })
          .from(users)
          .where(eq(users.stripeCustomerId, invoice.customer as string))
          .limit(1)

        if (user?.email) {
          await db.update(users).set({ subscriptionStatus: "past_due", updatedAt: new Date() })
            .where(eq(users.id, user.id))
          await sendPaymentFailedEmail({ to: user.email, name: user.name ?? "there" })
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason === "subscription_cycle") {
          await db.update(users).set({ subscriptionStatus: "active", updatedAt: new Date() })
            .where(eq(users.stripeCustomerId, invoice.customer as string))
        }
        break
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
