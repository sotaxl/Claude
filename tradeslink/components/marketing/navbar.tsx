"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Wrench, ChevronDown, Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Trades<span className="text-brand-500">Link</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
              Find a Pro
            </Link>
            <Link href="/jobs" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
              Job Board
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
              How it Works
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/messages" className="hidden md:flex relative">
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">2</span>
                </Link>
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Link href="/dashboard">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-brand-100 hover:ring-brand-300 transition-all">
                      <AvatarImage src={session.user?.image ?? ""} />
                      <AvatarFallback>{session.user?.name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
          <div className="container py-4 flex flex-col gap-2">
            <Link href="/browse" className="py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
              Find a Pro
            </Link>
            <Link href="/jobs" className="py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
              Job Board
            </Link>
            <Link href="/how-it-works" className="py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
              How it Works
            </Link>
            <div className="h-px bg-slate-100 my-2" />
            {session ? (
              <>
                <Link href="/dashboard" className="py-2 text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button
                  className="py-2 text-sm font-medium text-red-500 text-left"
                  onClick={() => { signOut(); setMobileOpen(false); }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
