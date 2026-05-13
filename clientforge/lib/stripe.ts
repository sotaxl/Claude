import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
  appInfo: { name: "ClientForge", version: "1.0.0" },
})

export const STRIPE_PLANS = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  agency: {
    monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!,
    annual: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID!,
  },
}

export const DISCOUNT_CODES = {
  LAUNCH25: "Launch offer — 25% off for 3 months",
  ANNUAL20: "Annual plan — 20% off",
}
