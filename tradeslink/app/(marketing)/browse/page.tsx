"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, MapPin, Star, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradeCard } from "@/components/shared/trade-card";
import { Badge } from "@/components/ui/badge";
import { TRADE_CATEGORIES } from "@/lib/utils";
import { mockPros } from "@/lib/mock-data";

export default function BrowsePage() {
  const [search, setSearch] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxRate, setMaxRate] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price_low" | "price_high" | "reviews">("rating");

  const filtered = useMemo(() => {
    return mockPros
      .filter((pro) => {
        if (search && !pro.name.toLowerCase().includes(search.toLowerCase()) &&
          !pro.headline.toLowerCase().includes(search.toLowerCase()) &&
          !pro.location.toLowerCase().includes(search.toLowerCase())) return false;
        if (selectedTrade && pro.tradeType !== selectedTrade) return false;
        if (minRating && pro.avgRating < minRating) return false;
        if (maxRate && pro.hourlyRate > maxRate) return false;
        if (verifiedOnly && !pro.verified) return false;
        if (availableOnly && !pro.available) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.avgRating - a.avgRating;
        if (sortBy === "price_low") return a.hourlyRate - b.hourlyRate;
        if (sortBy === "price_high") return b.hourlyRate - a.hourlyRate;
        if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
        return 0;
      });
  }, [search, selectedTrade, minRating, maxRate, verifiedOnly, availableOnly, sortBy]);

  const activeFiltersCount = [selectedTrade, minRating, maxRate, verifiedOnly, availableOnly].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container py-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Find a Tradesperson</h1>
          <p className="text-slate-500 text-sm mt-1">
            Showing {filtered.length} professional{filtered.length !== 1 ? "s" : ""} near you
          </p>

          {/* Search bar */}
          <div className="mt-4 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, trade or location..."
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 shrink-0`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setSelectedTrade(null); setMinRating(null); setMaxRate(null); setVerifiedOnly(false); setAvailableOnly(false); }}
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Trade type */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-slate-700 mb-2.5">Trade Type</h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedTrade(null)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedTrade ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    All trades
                  </button>
                  {TRADE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedTrade(selectedTrade === cat.value ? null : cat.value)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedTrade === cat.value ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min rating */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-slate-700 mb-2.5">Minimum Rating</h4>
                <div className="flex gap-1.5">
                  {[4, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? null : r)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${minRating === r ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-300"}`}
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {r}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Max hourly rate */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-slate-700 mb-2.5">Max Hourly Rate</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {[40, 60, 80].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMaxRate(maxRate === r ? null : r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${maxRate === r ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-300"}`}
                    >
                      Up to £{r}/hr
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Verified only
                  </span>
                  <div
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${verifiedOnly ? "bg-brand-500" : "bg-slate-200"} relative`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${verifiedOnly ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400" /> Available now
                  </span>
                  <div
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${availableOnly ? "bg-brand-500" : "bg-slate-200"} relative`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${availableOnly ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </label>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort + active filters */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex flex-wrap gap-2">
                {selectedTrade && (
                  <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedTrade(null)}>
                    {TRADE_CATEGORIES.find(c => c.value === selectedTrade)?.label}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {minRating && (
                  <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setMinRating(null)}>
                    ⭐ {minRating}+ rating <X className="h-3 w-3" />
                  </Badge>
                )}
                {verifiedOnly && (
                  <Badge variant="success" className="gap-1 cursor-pointer" onClick={() => setVerifiedOnly(false)}>
                    Verified <X className="h-3 w-3" />
                  </Badge>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 ml-auto"
              >
                <option value="rating">Sort: Top Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-slate-900">No professionals found</h3>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search term</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSelectedTrade(null); setMinRating(null); setMaxRate(null); setVerifiedOnly(false); setAvailableOnly(false); }}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((pro) => (
                  <TradeCard key={pro.id} pro={pro} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
