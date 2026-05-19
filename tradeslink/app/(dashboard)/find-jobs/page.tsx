"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Clock, DollarSign, MessageSquare, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getTradeCategory, TRADE_CATEGORIES } from "@/lib/utils";
import { mockJobs } from "@/lib/mock-data";

export default function FindJobsPage() {
  const [search, setSearch] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  const filtered = mockJobs.filter((job) => {
    if (selectedTrade && job.tradeType !== selectedTrade) return false;
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) &&
        !job.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Job Board</h1>
        <p className="text-slate-500 text-sm mt-1">
          {filtered.length} open job{filtered.length !== 1 ? "s" : ""} near you
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="pl-9" />
        </div>
        <select
          value={selectedTrade ?? ""}
          onChange={(e) => setSelectedTrade(e.target.value || null)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All trades</option>
          {TRADE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-slate-900">No jobs found</h3>
          <p className="text-slate-500 text-sm mt-1">Try changing your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const trade = getTradeCategory(job.tradeType);
            return (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-brand-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{job.title}</h3>
                      <Badge variant={job.status === "open" ? "success" : "secondary"} className="capitalize text-xs">
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {trade && (
                        <span className={`badge-trade text-xs ${trade.color}`}>{trade.icon} {trade.label}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-brand-500 font-medium">
                        <Clock className="h-3 w-3" /> {job.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {job.budget ? (
                      <>
                        <div className="text-lg font-extrabold text-slate-900">{formatCurrency(job.budget)}</div>
                        <div className="text-xs text-slate-400 capitalize">{job.budgetType}</div>
                      </>
                    ) : (
                      <div className="text-sm font-medium text-slate-500">Quote required</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{job.quotesCount} quotes so far</span>
                    <span>Posted {job.createdAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/messages?job=${job.id}`}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Ask a Question
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/jobs/${job.id}/quote`}>Submit Quote</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
