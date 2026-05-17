import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, PixelCraft Studio",
    avatar: "SC",
    color: "bg-pink-500",
    rating: 5,
    quote: "I used to spend 4 hours a week chasing clients for approvals. With ClientForge, they just log into their portal and everything's there. I've already upsold two clients just because I look more professional.",
  },
  {
    name: "Marcus Okonkwo",
    role: "Lead Developer, Velocity Labs",
    avatar: "MO",
    color: "bg-blue-500",
    rating: 5,
    quote: "The automated billing alone paid for the Pro plan in the first week. Stripe integration works flawlessly — I set up subscriptions for my retainer clients and stopped manually invoicing.",
  },
  {
    name: "Priya Sharma",
    role: "Brand Strategist",
    avatar: "PS",
    color: "bg-violet-500",
    rating: 5,
    quote: "The client portal is genuinely beautiful. Clients comment on it all the time. I used the discount email to convert 3 free users to paid in one campaign — took 10 minutes to set up.",
  },
  {
    name: "Tom Reyes",
    role: "CEO, Northside Digital",
    avatar: "TR",
    color: "bg-green-500",
    rating: 5,
    quote: "Scaled from 8 to 30 clients without adding overhead. ClientForge handles the client communication layer so my team can focus on actual delivery.",
  },
  {
    name: "Jana Kovács",
    role: "UX Consultant",
    avatar: "JK",
    color: "bg-orange-500",
    rating: 5,
    quote: "Finally deleted Notion, Toggl AND FreshBooks. One tool that actually does all three well. The Google Sign-In made onboarding clients instant.",
  },
  {
    name: "Alex Nguyen",
    role: "Full-stack Freelancer",
    avatar: "AN",
    color: "bg-cyan-500",
    rating: 5,
    quote: "I was skeptical about paying for another SaaS. Two months in — ClientForge has added $2,800/month in recovered revenue just from the dunning emails.",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-4">Customers</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Loved</span> by agencies worldwide
          </h2>
          <p className="text-gray-400 text-xl">Real results from real teams.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:border-white/12 transition-all"
            >
              <div className="flex mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
