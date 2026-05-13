import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden grid-bg">
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4 text-center">
        {/* Social proof badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-8">
          <div className="flex -space-x-1">
            {["bg-pink-400", "bg-blue-400", "bg-green-400", "bg-yellow-400"].map((c) => (
              <div key={c} className={`w-5 h-5 rounded-full ${c} border-2 border-black`} />
            ))}
          </div>
          <span><strong className="text-white">2,400+</strong> agencies trust ClientForge</span>
        </div>

        {/* Headline — PAS framework */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Stop losing clients to{" "}
          <span className="gradient-text">messy spreadsheets.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ClientForge gives you a professional client portal, project tracking and automated billing — so you look like a $10M agency even on day one.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            Start free — no card needed <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#demo"
            className="flex items-center gap-2 text-gray-300 hover:text-white font-medium text-lg px-6 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all"
          >
            See a demo
          </Link>
        </div>

        {/* Star rating */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="flex">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span>4.9/5 from 480+ reviews</span>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden glow">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
                <div key={c} className={`w-3 h-3 rounded-full ${c}`} />
              ))}
              <div className="flex-1 mx-4 h-6 bg-white/5 rounded-md" />
            </div>
            <div className="p-6 grid grid-cols-4 gap-4">
              {[
                { label: "Active Clients", value: "24", change: "+3 this month", color: "text-blue-400" },
                { label: "Active Projects", value: "12", change: "2 due soon", color: "text-violet-400" },
                { label: "Revenue MTD", value: "$14,200", change: "+18% vs last month", color: "text-green-400" },
                { label: "Open Invoices", value: "$3,800", change: "4 pending", color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 grid grid-cols-3 gap-4">
              {["Redesign Website", "Mobile App MVP", "Brand Strategy"].map((p, i) => (
                <div key={p} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">{p}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      i === 0 ? "bg-blue-500/20 text-blue-400" :
                      i === 1 ? "bg-green-500/20 text-green-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>{i === 0 ? "Active" : i === 1 ? "Completed" : "Planning"}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${[70, 100, 30][i]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
