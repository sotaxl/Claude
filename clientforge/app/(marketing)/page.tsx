import type { Metadata } from "next"
import { Hero } from "@/components/marketing/hero"
import { Features } from "@/components/marketing/features"
import { PricingSection } from "@/components/marketing/pricing"
import { Testimonials } from "@/components/marketing/testimonials"
import { FAQ } from "@/components/marketing/faq"
import { CTA } from "@/components/marketing/cta"

export const metadata: Metadata = {
  title: "ClientForge — Client Portal & Project Management for Agencies",
  description: "Manage clients, projects and billing in one place. Give every client a professional portal. Start free.",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <PricingSection />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  )
}
