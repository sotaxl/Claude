"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, MessageSquare, Star, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/shared/booking-status-badge";
import { formatCurrency } from "@/lib/utils";
import { mockBookings } from "@/lib/mock-data";

const TABS = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered = mockBookings.filter(b => activeTab === "all" || b.status === activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{mockBookings.length} total bookings</p>
        </div>
        <Button asChild>
          <Link href="/browse">+ New Booking</Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            {tab !== "all" && (
              <span className="ml-1.5 text-xs text-slate-400">
                ({mockBookings.filter(b => b.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-bold text-slate-900">No {activeTab} bookings</h3>
          <p className="text-slate-500 text-sm mt-1">When you book a tradesperson it will appear here</p>
          <Button className="mt-4" asChild><Link href="/browse">Find a Pro</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <span className="text-xs text-slate-400">Booking #{booking.id.toUpperCase()}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(booking.agreedPrice)}</span>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-4">
                  <Image
                    src={booking.tradesperson.image}
                    alt={booking.tradesperson.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">{booking.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {booking.tradesperson.name} · {booking.tradesperson.trade}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-brand-400" />
                        {new Date(booking.scheduledDate).toLocaleDateString("en-GB", {
                          weekday: "long", day: "numeric", month: "long", year: "numeric"
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-brand-400" />
                        {new Date(booking.scheduledDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 text-brand-400" />
                      {booking.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/messages/${booking.id}`}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Message
                    </Link>
                  </Button>
                  {booking.status === "completed" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/bookings/${booking.id}/review`}>
                        <Star className="h-3.5 w-3.5 mr-1.5" /> Leave Review
                      </Link>
                    </Button>
                  )}
                  {booking.status === "pending" && (
                    <Button variant="destructive" size="sm">
                      Cancel Booking
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="ml-auto" asChild>
                    <Link href={`/bookings/${booking.id}`}>
                      View Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
