import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      subscriptionStatus: string | null
      stripePriceId: string | null
      stripeCurrentPeriodEnd: Date | null
    } & DefaultSession["user"]
  }
  interface User {
    subscriptionStatus?: string | null
    stripePriceId?: string | null
    stripeCurrentPeriodEnd?: Date | null
  }
}

export type SubscriptionPlan = "free" | "pro" | "agency"

export interface PlanFeatures {
  name: string
  price: number
  priceId: string
  description: string
  features: string[]
  limits: { clients: number; projects: number; teamMembers: number }
  popular?: boolean
}

export interface ProjectStatus {
  id: string
  label: string
  color: string
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  { id: "planning", label: "Planning", color: "bg-yellow-500/20 text-yellow-400" },
  { id: "active", label: "Active", color: "bg-blue-500/20 text-blue-400" },
  { id: "review", label: "In Review", color: "bg-purple-500/20 text-purple-400" },
  { id: "completed", label: "Completed", color: "bg-green-500/20 text-green-400" },
  { id: "on-hold", label: "On Hold", color: "bg-gray-500/20 text-gray-400" },
]

export const PLANS: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    name: "Starter",
    price: 0,
    priceId: "",
    description: "Perfect for freelancers just getting started",
    features: [
      "Up to 3 clients",
      "Up to 5 active projects",
      "Client portal access",
      "Basic reporting",
      "Email support",
    ],
    limits: { clients: 3, projects: 5, teamMembers: 1 },
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "",
    description: "For growing freelancers and small agencies",
    features: [
      "Unlimited clients",
      "Unlimited projects",
      "Custom client portal domain",
      "Advanced analytics",
      "Automated email sequences",
      "Discount codes",
      "Priority support",
    ],
    limits: { clients: Infinity, projects: Infinity, teamMembers: 3 },
    popular: true,
  },
  agency: {
    name: "Agency",
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID ?? "",
    description: "For agencies managing multiple teams",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "White-label portal",
      "Custom branding",
      "API access",
      "SSO / SAML",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    limits: { clients: Infinity, projects: Infinity, teamMembers: Infinity },
  },
}
