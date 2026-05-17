import { Users, FolderKanban, CreditCard, Mail, BarChart3, Shield } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Client Portal",
    description: "Give every client a branded portal where they can view projects, approve deliverables and track progress — without a single email.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Kanban boards, timelines and status updates. Keep every project on track and every client informed — automatically.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: CreditCard,
    title: "Stripe Billing",
    description: "Send invoices, manage subscriptions and collect payments in one click. Stripe-powered — supports cards, bank transfers and more.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Mail,
    title: "Automated Emails",
    description: "Welcome sequences, payment reminders, project updates and discount campaigns — all sent automatically based on client activity.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description: "Track MRR, project margins and client lifetime value. Know exactly which clients and projects drive your growth.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Google & Apple Sign-In, SOC 2 ready infrastructure, role-based access and full audit logs. Safe for any client.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything your agency needs,{" "}
            <span className="gradient-text">nothing it doesn&apos;t.</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Built by freelancers who were tired of duct-taping together five different tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:border-white/15 hover:bg-white/[0.05] transition-all group"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
