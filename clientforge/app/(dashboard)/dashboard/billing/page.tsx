"use client"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Check, Zap, ExternalLink, Loader2 } from "lucide-react"
import { PLANS } from "@/types"
import { formatDate, isSubscriptionActive } from "@/lib/utils"

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [coupon, setCoupon] = useState(params.get("coupon") ?? "")
  const [successMsg, setSuccessMsg] = useState(params.get("success") === "true" ? "🎉 Subscription activated! Welcome to Pro." : "")

  const isPro = isSubscriptionActive(session?.user?.stripeCurrentPeriodEnd)
  const currentPriceId = session?.user?.stripePriceId

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const handleUpgrade = async (priceId: string, planKey: string) => {
    setLoading(planKey)
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, coupon: coupon || undefined }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  const handlePortal = async () => {
    setLoading("portal")
    const res = await fetch("/api/billing/portal", { method: "POST" })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader title="Billing" subtitle="Manage your subscription and payment method" />

      <div className="p-6 max-w-4xl">
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 text-green-300 text-sm mb-6">
            {successMsg}
          </div>
        )}

        {/* Current plan */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <h2 className="text-white text-xl font-bold">{isPro ? "Pro" : "Starter (Free)"}</h2>
                {isPro && (
                  <span className="flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              {isPro && session?.user?.stripeCurrentPeriodEnd && (
                <p className="text-gray-500 text-sm mt-1">
                  Renews {formatDate(session.user.stripeCurrentPeriodEnd)}
                </p>
              )}
            </div>
            {isPro && (
              <button onClick={handlePortal} disabled={!!loading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Manage billing
              </button>
            )}
          </div>
        </div>

        {/* Coupon */}
        <div className="flex gap-3 mb-8">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Discount code (e.g. LAUNCH25)"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 w-64" />
          <p className="text-gray-500 text-xs self-center">Applied automatically at checkout</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5">
          {(Object.entries(PLANS) as [string, typeof PLANS.free][]).map(([key, plan]) => {
            const isActive = key === "free" ? !isPro : isPro && currentPriceId === plan.priceId
            return (
              <div key={key}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.popular ? "border-indigo-500/50 bg-indigo-950/20" :
                  isActive ? "border-green-500/30 bg-green-950/10" :
                  "border-white/10 bg-white/[0.02]"
                }`}>
                {plan.popular && (
                  <div className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-3">
                    <Zap className="w-3 h-3" /> Popular
                  </div>
                )}
                <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isActive ? (
                  <div className="text-center text-sm text-green-400 py-2">✓ Current plan</div>
                ) : key === "free" ? (
                  <div className="text-center text-sm text-gray-500 py-2">Free forever</div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.priceId, key)}
                    disabled={!!loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading === key ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isPro ? "Switch plan" : "Upgrade"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
