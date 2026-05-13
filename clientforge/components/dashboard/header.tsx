"use client"
import { useSession } from "next-auth/react"
import { Bell } from "lucide-react"
import { getInitials, isSubscriptionActive } from "@/lib/utils"

interface HeaderProps { title: string; subtitle?: string }

export function DashboardHeader({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession()
  const isPro = isSubscriptionActive(session?.user?.stripeCurrentPeriodEnd)

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {!isPro && (
          <a
            href="/dashboard/billing"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors"
          >
            ⚡ Upgrade to Pro
          </a>
        )}

        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
          {getInitials(session?.user?.name)}
        </div>
      </div>
    </header>
  )
}
