import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Calendar, MessageSquare, Briefcase, Star,
  TrendingUp, ChevronRight, Clock, CheckCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/shared/booking-status-badge";
import { StarRating } from "@/components/shared/star-rating";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockBookings, mockConversations } from "@/lib/mock-data";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isTrader = (session?.user as any)?.role === "tradesperson";

  const stats = isTrader
    ? [
        { label: "Upcoming Bookings", value: "3", icon: Calendar, color: "bg-blue-50 text-blue-600", trend: "+1 this week" },
        { label: "Unread Messages", value: "5", icon: MessageSquare, color: "bg-brand-50 text-brand-600", trend: "2 new" },
        { label: "Open Jobs Nearby", value: "24", icon: Briefcase, color: "bg-purple-50 text-purple-600", trend: "8 new today" },
        { label: "Your Rating", value: "4.9", icon: Star, color: "bg-amber-50 text-amber-600", trend: "142 reviews" },
      ]
    : [
        { label: "Active Bookings", value: "2", icon: Calendar, color: "bg-blue-50 text-blue-600", trend: "1 this week" },
        { label: "Unread Messages", value: "2", icon: MessageSquare, color: "bg-brand-50 text-brand-600", trend: "New today" },
        { label: "Posted Jobs", value: "1", icon: Briefcase, color: "bg-purple-50 text-purple-600", trend: "3 quotes received" },
        { label: "Completed Jobs", value: "8", icon: CheckCircle, color: "bg-green-50 text-green-600", trend: "All-time" },
      ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Good morning, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening with your account today
          </p>
        </div>
        <Button asChild>
          <Link href={isTrader ? "/find-jobs" : "/browse"}>
            {isTrader ? "Browse Jobs" : "Find a Pro"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.trend}</p>
              </div>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upcoming bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Upcoming Bookings</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings" className="text-brand-500">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {mockBookings.filter(b => b.status !== "completed").slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <Image
                  src={booking.tradesperson.image}
                  alt={booking.tradesperson.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{booking.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {booking.tradesperson.name} · {booking.tradesperson.trade}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {new Date(booking.scheduledDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <BookingStatusBadge status={booking.status} />
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(booking.agreedPrice)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/browse">+ Book a new tradesperson</Link>
            </Button>
          </div>
        </div>

        {/* Recent messages */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Messages</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/messages" className="text-brand-500">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {mockConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={conv.participant.image}
                    alt={conv.participant.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                  {conv.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold text-slate-900 ${conv.unread > 0 ? "font-bold" : ""}`}>
                      {conv.participant.name}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(conv.lastMessageAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${conv.unread > 0 ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(isTrader ? [
          { icon: "🔍", title: "Browse open jobs", desc: "Find local work in your trade", href: "/find-jobs" },
          { icon: "⭐", title: "Your reviews", desc: "See what clients say about you", href: "/profile" },
          { icon: "📅", title: "Manage availability", desc: "Update your calendar & hours", href: "/profile" },
        ] : [
          { icon: "🔍", title: "Find a tradesperson", desc: "Browse verified local pros", href: "/browse" },
          { icon: "📋", title: "Post a job", desc: "Get quotes from multiple pros", href: "/post-job" },
          { icon: "⭐", title: "Leave a review", desc: "Rate your recent work", href: "/bookings" },
        ]).map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">{action.icon}</span>
            <div>
              <div className="font-semibold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">{action.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
