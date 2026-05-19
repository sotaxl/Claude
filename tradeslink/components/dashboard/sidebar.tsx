"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Calendar, MessageSquare, User,
  Briefcase, Search, LogOut, Wrench, Star, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const homeownerNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/bookings", icon: Calendar, label: "My Bookings" },
  { href: "/my-jobs", icon: Briefcase, label: "My Jobs" },
  { href: "/messages", icon: MessageSquare, label: "Messages", badge: 2 },
  { href: "/browse", icon: Search, label: "Find a Pro" },
  { href: "/profile", icon: User, label: "My Profile" },
];

const tradeNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/bookings", icon: Calendar, label: "Bookings" },
  { href: "/find-jobs", icon: Briefcase, label: "Job Board" },
  { href: "/messages", icon: MessageSquare, label: "Messages", badge: 2 },
  { href: "/profile", icon: User, label: "My Profile" },
];

interface SidebarProps {
  role?: string;
  userName?: string;
  userImage?: string;
}

export function Sidebar({ role = "homeowner", userName, userImage }: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "tradesperson" ? tradeNav : homeownerNav;

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-slate-900 min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Trades<span className="text-brand-400">Link</span>
          </span>
        </Link>
      </div>

      {/* User */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{userName ?? "User"}</div>
            <div className="text-xs text-slate-400 capitalize">{role}</div>
          </div>
          <button className="ml-auto text-slate-400 hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                active
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
              {item.badge && !active && (
                <span className="ml-auto h-5 min-w-5 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
