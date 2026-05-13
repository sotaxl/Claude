"use client"
import { useState } from "react"
import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { PLANS } from "@/types"

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Start free. Scale when{" "}
            <span className="gradient-text">you&apos;re ready.</span>
          </h2>
          <p className="text-gray-400 text-xl mb-8">No hidden fees. Cancel anytime.</p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Annual <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(Object.entries(PLANS) as [string, typeof PLANS.free][]).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-2xl p-8 border transition-all ${
                plan.popular
                  ? "border-indigo-500 bg-indigo-950/30 glow"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}

              <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-5xl font-bold text-white">
                  ${annual ? Math.floor(plan.price * 0.8) : plan.price}
                </span>
                <span className="text-gray-400 text-sm ml-1">/mo</span>
                {annual && plan.price > 0 && (
                  <p className="text-green-400 text-sm mt-1">Save ${(plan.price * 0.2 * 12).toFixed(0)}/yr</p>
                )}
              </div>

              <Link
                href={plan.price === 0 ? "/register" : `/register?plan=${key}`}
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all mb-8 ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                {plan.price === 0 ? "Get started free" : `Start 14-day trial`}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          Have a discount code? Apply it at checkout. Use <span className="text-indigo-400 font-mono">LAUNCH25</span> for 25% off Pro.
        </p>
      </div>
    </section>
  )
}
