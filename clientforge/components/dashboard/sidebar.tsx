"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard, Users, FolderKanban, CreditCard,
  Settings, LogOut, Zap, ChevronRight, Clapperboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Episode Studio", href: "/dashboard/episode-studio", icon: Clapperboard },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-white/5 bg-black/40 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">ClientForge</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", active && "text-indigo-400")} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400/50" />}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
