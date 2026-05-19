import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, CheckCircle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/star-rating";
import { formatCurrency, getTradeCategory } from "@/lib/utils";

interface TradeCardProps {
  pro: {
    id: string;
    name: string;
    tradeType: string;
    headline: string;
    location: string;
    hourlyRate: number;
    avgRating: number;
    reviewCount: number;
    completedJobs: number;
    responseTime: string;
    verified: boolean;
    insuranceVerified: boolean;
    available: boolean;
    image: string;
    skills?: string[];
  };
}

export function TradeCard({ pro }: TradeCardProps) {
  const trade = getTradeCategory(pro.tradeType);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden pro-card-hover group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-white shadow-md">
              <Image
                src={pro.image}
                alt={pro.name}
                width={64}
                height={64}
                className="object-cover h-full w-full"
              />
            </div>
            {pro.available && (
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-400 ring-2 ring-white" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">{pro.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{pro.headline}</p>
              </div>
              {pro.verified && (
                <span className="badge-verified flex-shrink-0">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={pro.avgRating} size="sm" showValue />
              <span className="text-xs text-slate-400">({pro.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Trade badge & location */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {trade && (
            <span className={`badge-trade text-xs ${trade.color}`}>
              {trade.icon} {trade.label}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" /> {pro.location}
          </span>
        </div>

        {/* Skills */}
        {pro.skills && pro.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pro.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100">
                {skill}
              </span>
            ))}
            {pro.skills.length > 3 && (
              <span className="text-xs text-slate-400">+{pro.skills.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-slate-900">{formatCurrency(pro.hourlyRate)}</span>
          <span className="text-xs text-slate-400">/hr</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-400">{pro.responseTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pro.insuranceVerified && (
            <span title="Insured">
              <Shield className="h-4 w-4 text-blue-400" />
            </span>
          )}
          <Button asChild size="sm">
            <Link href={`/trades/${pro.id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
