"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The Starter plan is completely free and doesn't require a card. You only need to add payment when you upgrade to Pro or Agency.",
  },
  {
    q: "What happens when my trial ends?",
    a: "After your 14-day Pro trial, you'll be asked to add a card to continue. If you don't, your account automatically moves to the free Starter plan — no data lost.",
  },
  {
    q: "How does Google and Apple Sign-In work?",
    a: "Your clients can log into their portal using their existing Google or Apple account — no new password needed. You can also use either to create your own ClientForge account.",
  },
  {
    q: "Can I send my own branded emails to clients?",
    a: "Yes. On the Pro plan, automated emails (welcome, project updates, payment reminders) are sent from your domain. You can customise subject lines and content.",
  },
  {
    q: "What discount codes are available?",
    a: "Use LAUNCH25 for 25% off your first 3 months of Pro. Annual plans get a permanent 20% discount. Additional codes are occasionally sent via email to active free users.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes, instantly from your billing page. You keep access until the end of your current billing period — no questions, no fees.",
  },
  {
    q: "Is my client data secure?",
    a: "All data is encrypted at rest and in transit. ClientForge runs on NeonDB with daily backups, and we support Google/Apple SSO for strong authentication.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 border-t border-white/5">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-4xl font-bold">Common questions</h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-medium">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
