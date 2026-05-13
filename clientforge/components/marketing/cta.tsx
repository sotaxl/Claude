import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-violet-950/50 p-16 text-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-indigo-600/20 rounded-full blur-[80px]" />
          </div>

          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to look like a<br />
              <span className="gradient-text">world-class agency?</span>
            </h2>
            <p className="text-gray-400 text-xl mb-10 max-w-xl mx-auto">
              Join 2,400+ freelancers and agencies using ClientForge. Start free, upgrade when you grow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/30"
              >
                Start free today <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-gray-500 text-sm">No card required · Free forever plan</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
