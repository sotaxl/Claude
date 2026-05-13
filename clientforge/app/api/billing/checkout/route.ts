import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { absoluteUrl } from "@/lib/utils"
import { z } from "zod"

const checkoutSchema = z.object({
  priceId: z.string(),
  coupon: z.string().optional(),
  annual: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { priceId, coupon } = checkoutSchema.parse(body)

    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id))
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      ...(coupon ? { discounts: [{ coupon }] } : {}),
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: user.id },
      },
      success_url: absoluteUrl("/billing?success=true"),
      cancel_url: absoluteUrl("/billing"),
      metadata: { userId: user.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
