import type { Metadata } from "next"
import { PricingSection } from "@/components/marketing/pricing"
import { FAQ } from "@/components/marketing/faq"
import { CTA } from "@/components/marketing/cta"

export const metadata: Metadata = {
  title: "Pricing — ClientForge",
  description: "Free plan available. Pro from $29/month. Agency from $79/month. No hidden fees.",
}

export default function PricingPage() {
  return (
    <div className="pt-24">
      <PricingSection />
      <FAQ />
      <CTA />
    </div>
  )
}
