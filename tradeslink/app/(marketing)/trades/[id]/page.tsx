import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin, Clock, Star, CheckCircle, Shield, Award,
  MessageSquare, Calendar, ChevronRight, Briefcase,
  ArrowLeft, Phone, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { formatCurrency, getTradeCategory } from "@/lib/utils";
import { mockPros, mockReviews } from "@/lib/mock-data";

export async function generateStaticParams() {
  return mockPros.map((p) => ({ id: p.id }));
}

export default function TradeProfilePage({ params }: { params: { id: string } }) {
  const pro = mockPros.find((p) => p.id === params.id);
  if (!pro) notFound();

  const trade = getTradeCategory(pro.tradeType);
  const ratingBreakdown = [
    { label: "Quality", value: 4.9 },
    { label: "Timeliness", value: 4.7 },
    { label: "Value", value: 4.8 },
    { label: "Communication", value: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/browse" className="flex items-center gap-1 hover:text-brand-500 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{trade?.label}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-medium">{pro.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-5">
                <div className="relative flex-shrink-0">
                  <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
                    <Image src={pro.image} alt={pro.name} width={96} height={96} className="object-cover h-full w-full" />
                  </div>
                  {pro.available && (
                    <span className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 text-[10px] font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Available
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900">{pro.name}</h1>
                      <p className="text-slate-500 mt-0.5">{pro.headline}</p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {trade && (
                      <span className={`badge-trade ${trade.color}`}>{trade.icon} {trade.label}</span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 text-brand-400" /> {pro.location}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-4 w-4 text-brand-400" /> Responds {pro.responseTime}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <StarRating rating={pro.avgRating} showValue />
                      <span className="text-sm text-slate-400">({pro.reviewCount} reviews)</span>
                    </div>
                    {pro.verified && (
                      <span className="badge-verified"><CheckCircle className="h-3 w-3" /> Verified Pro</span>
                    )}
                    {pro.insuranceVerified && (
                      <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                        <Shield className="h-3 w-3" /> Insured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
                {[
                  { value: pro.completedJobs, label: "Jobs Completed" },
                  { value: `${pro.avgRating}/5`, label: "Average Rating" },
                  { value: pro.reviewCount, label: "Reviews" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl font-extrabold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-3">About {pro.name.split(" ")[0]}</h2>
              <p className="text-slate-600 leading-relaxed">{pro.description}</p>

              {/* Skills */}
              <h3 className="font-semibold text-slate-800 mt-5 mb-3">Specialisms & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {pro.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-sm text-slate-700 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 text-lg mb-4">Portfolio</h2>
              <div className="grid grid-cols-3 gap-3">
                {pro.portfolioImages.map((img, i) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      src={img}
                      alt={`Portfolio ${i + 1}`}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-900 text-lg">
                  Reviews <span className="text-slate-400 font-normal text-base">({pro.reviewCount})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={pro.avgRating} size="lg" />
                  <span className="text-2xl font-extrabold text-slate-900">{pro.avgRating}</span>
                </div>
              </div>

              {/* Rating breakdown */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6 p-4 bg-slate-50 rounded-xl">
                {ratingBreakdown.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 w-28">{r.label}</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(r.value / 5) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-8 text-right">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Review list */}
              <div className="space-y-5">
                {mockReviews.map((review) => (
                  <div key={review.id} className="pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Image
                        src={review.reviewerImage}
                        alt={review.reviewerName}
                        width={36}
                        height={36}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">{review.reviewerName}</span>
                          <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                        <StarRating rating={review.rating} size="sm" className="mt-1" />
                        <p className="font-semibold text-sm text-slate-800 mt-2">{review.title}</p>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Booking widget */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(pro.hourlyRate)}</span>
                <span className="text-slate-400">/hour</span>
              </div>
              <p className="text-xs text-slate-400 mb-5">Or request a fixed price quote for your project</p>

              <Button className="w-full mb-3" size="lg" asChild>
                <Link href={`/bookings/new?pro=${pro.id}`}>
                  <Calendar className="h-4 w-4 mr-2" /> Book Now
                </Link>
              </Button>
              <Button variant="outline" className="w-full mb-3" size="lg" asChild>
                <Link href={`/messages?to=${pro.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Send Message
                </Link>
              </Button>
              <Button variant="secondary" className="w-full" size="lg" asChild>
                <Link href={`/post-job?trade=${pro.tradeType}`}>
                  <Briefcase className="h-4 w-4 mr-2" /> Get a Quote
                </Link>
              </Button>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                {[
                  { icon: CheckCircle, text: "Free quotes, no obligation", color: "text-green-500" },
                  { icon: Shield, text: "Fully insured & verified", color: "text-blue-500" },
                  { icon: Star, text: `${pro.avgRating}/5 from ${pro.reviewCount} reviews`, color: "text-amber-400" },
                  { icon: Clock, text: `Responds ${pro.responseTime}`, color: "text-brand-500" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-slate-600">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Similar pros */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Other {trade?.label}s Near You</h3>
              {mockPros
                .filter((p) => p.tradeType === pro.tradeType && p.id !== pro.id)
                .slice(0, 2)
                .map((p) => (
                  <Link key={p.id} href={`/trades/${p.id}`} className="flex items-center gap-3 py-3 border-t border-slate-100 hover:bg-slate-50 -mx-1 px-1 rounded-lg transition-colors">
                    <Image src={p.image} alt={p.name} width={36} height={36} className="rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating rating={p.avgRating} size="sm" />
                        <span className="text-xs text-slate-400">({p.reviewCount})</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
