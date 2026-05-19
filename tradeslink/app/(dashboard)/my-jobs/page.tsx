import Link from "next/link";
import { Plus, MapPin, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getTradeCategory } from "@/lib/utils";
import { mockJobs } from "@/lib/mock-data";

export const metadata = { title: "My Jobs" };

export default function MyJobsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">Jobs you've posted and their status</p>
        </div>
        <Button asChild>
          <Link href="/post-job"><Plus className="h-4 w-4 mr-2" /> Post a Job</Link>
        </Button>
      </div>

      {mockJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold text-slate-900">No jobs posted yet</h3>
          <p className="text-slate-500 text-sm mt-1">Post a job to receive quotes from local tradespeople</p>
          <Button className="mt-4" asChild><Link href="/post-job">Post Your First Job</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {mockJobs.map((job) => {
            const trade = getTradeCategory(job.tradeType);
            return (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {trade && (
                        <span className={`badge-trade text-xs ${trade.color}`}>{trade.icon} {trade.label}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" /> {job.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <Badge variant={job.status === "open" ? "success" : "secondary"} className="flex-shrink-0 capitalize">
                    {job.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    {job.budget && (
                      <span className="text-sm font-bold text-slate-900">Budget: {formatCurrency(job.budget)}</span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-brand-600 font-semibold">
                      <MessageSquare className="h-4 w-4" /> {job.quotesCount} quote{job.quotesCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      View Quotes <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
