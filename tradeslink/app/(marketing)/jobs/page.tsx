import Link from "next/link";
import { MapPin, Clock, ChevronRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getTradeCategory } from "@/lib/utils";
import { mockJobs } from "@/lib/mock-data";

export const metadata = { title: "Job Board – Find Trade Work" };

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Job Board</h1>
              <p className="text-slate-500 mt-1">Latest jobs posted by homeowners in your area</p>
            </div>
            <Button asChild>
              <Link href="/post-job"><Briefcase className="h-4 w-4 mr-2" /> Post a Job</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="space-y-4">
          {mockJobs.map((job) => {
            const trade = getTradeCategory(job.tradeType);
            return (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {trade && (
                        <span className={`badge-trade text-xs ${trade.color}`}>{trade.icon} {trade.label}</span>
                      )}
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-4 w-4 text-brand-400" /> {job.urgency}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-3 text-sm leading-relaxed">{job.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {job.budget && (
                      <>
                        <div className="text-xl font-extrabold text-slate-900">{formatCurrency(job.budget)}</div>
                        <div className="text-xs text-slate-400 capitalize">{job.budgetType} price</div>
                      </>
                    )}
                    <Badge variant={job.status === "open" ? "success" : "secondary"} className="mt-2 capitalize">
                      {job.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-400">{job.quotesCount} quotes · Posted {job.createdAt}</span>
                  <Button asChild>
                    <Link href={`/jobs/${job.id}`}>
                      View Job <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
