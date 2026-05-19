import Link from "next/link";
import Image from "next/image";
import {
  Search, MapPin, CheckCircle, Star, Shield, Clock,
  Zap, ArrowRight, Users, Briefcase, Award, ChevronRight,
  Wrench, Hammer, Paintbrush, Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeCard } from "@/components/shared/trade-card";
import { StarRating } from "@/components/shared/star-rating";
import { TRADE_CATEGORIES } from "@/lib/utils";
import { mockPros } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        {/* Orange accent blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-600/10 blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="container relative py-20 lg:py-28">
          <div className="max-w-3xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-500/30 px-4 py-1.5 mb-6">
              <Zap className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-sm font-medium text-brand-300">10,000+ Verified Professionals Ready</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Find Trusted Local{" "}
              <span className="text-brand-400">Tradespeople</span>{" "}
              Near You
            </h1>
            <p className="mt-5 text-lg text-slate-300 max-w-2xl leading-relaxed">
              From electricians to plumbers, carpenters to roofers — TradesLink connects you with vetted, reviewed, and insured professionals in your area.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 shadow-lg">
                <Wrench className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <select className="flex-1 py-3.5 text-slate-700 text-sm bg-transparent focus:outline-none">
                  <option value="">What trade do you need?</option>
                  {TRADE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 sm:w-48 shadow-lg">
                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input placeholder="Your postcode" className="flex-1 py-3.5 text-slate-700 text-sm bg-transparent focus:outline-none" />
              </div>
              <Button size="lg" className="px-6 rounded-xl shadow-lg shadow-brand-500/30 whitespace-nowrap" asChild>
                <Link href="/browse">
                  <Search className="h-4 w-4 mr-2" /> Find a Pro
                </Link>
              </Button>
            </div>

            {/* Popular searches */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400">Popular:</span>
              {["Electrician", "Plumber", "Carpenter", "Roofer", "Painter"].map((t) => (
                <Link key={t} href={`/browse?trade=${t.toLowerCase()}`}
                  className="text-xs text-slate-300 hover:text-brand-300 transition-colors underline underline-offset-2">
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
            {[
              { value: "10,000+", label: "Verified Pros" },
              { value: "50,000+", label: "Jobs Completed" },
              { value: "4.8/5", label: "Average Rating" },
              { value: "2 hrs", label: "Avg Response Time" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="bg-slate-50 border-b border-slate-100 py-4">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-slate-500">
            {[
              { icon: Shield, text: "All pros fully insured" },
              { icon: CheckCircle, text: "Identity verified" },
              { icon: Star, text: "Reviewed & rated" },
              { icon: Clock, text: "Fast response times" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-brand-500" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trade Categories ── */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">Browse by Trade</h2>
            <p className="text-slate-500 mt-2">Find specialist professionals for every job around your home</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TRADE_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/browse?trade=${cat.value}`}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-600 leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">How TradesLink Works</h2>
            <p className="text-slate-500 mt-2">Get the job done in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search or Post a Job",
                description: "Browse professionals by trade and location, or post your job to receive quotes from local tradespeople.",
                color: "bg-brand-50 text-brand-600",
              },
              {
                step: "02",
                icon: Users,
                title: "Compare & Choose",
                description: "Review profiles, portfolios, ratings and prices. Chat directly with tradespeople before committing.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Book & Relax",
                description: "Book your preferred professional, track progress, and pay securely through the platform.",
                color: "bg-green-50 text-green-600",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="text-5xl font-black text-slate-100 mb-4 leading-none">{step.step}</div>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${step.color} mb-4`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white -translate-y-1/2">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Professionals ── */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Top-Rated Professionals</h2>
              <p className="text-slate-500 mt-1">Handpicked tradespeople with exceptional reviews</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/browse">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockPros.slice(0, 6).map((pro) => (
              <TradeCard key={pro.id} pro={pro} />
            ))}
          </div>

          <div className="mt-6 flex justify-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/browse">View All Professionals <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Post a Job CTA ── */}
      <section className="py-16 bg-gradient-to-r from-brand-500 to-brand-600">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white">Got a job that needs doing?</h2>
              <p className="text-brand-100 mt-3 text-lg leading-relaxed">
                Post your job for free and receive quotes from verified local tradespeople within hours. No fuss, no obligation.
              </p>
              <ul className="mt-4 space-y-2">
                {["Free to post", "Up to 5 quotes", "No commitment", "Reviewed tradespeople only"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-brand-100">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <Button size="lg" variant="dark" asChild className="bg-white text-brand-600 hover:bg-brand-50">
                  <Link href="/post-job">Post a Job Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                  <Link href="/browse">Browse Pros</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { icon: "⚡", title: "Emergency electrician", time: "3 quotes · 2hrs" },
                { icon: "🔧", title: "Boiler service", time: "5 quotes · 4hrs" },
                { icon: "🪚", title: "Kitchen fitting", time: "4 quotes · 6hrs" },
                { icon: "🏠", title: "Roof repair", time: "2 quotes · 3hrs" },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="text-xs text-brand-200 mt-1">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">What Our Customers Say</h2>
            <p className="text-slate-500 mt-2">Thousands of happy homeowners and tradespeople</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Alice Johnson",
                location: "Manchester",
                rating: 5,
                text: "Found an excellent electrician within the hour. Professional, tidy and reasonably priced. Already booked him for the next job!",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
              },
              {
                name: "Mark Harris",
                location: "London",
                rating: 5,
                text: "Posted my bathroom job and had 4 quotes back the same day. Went with the best reviewed plumber and couldn't be happier. App is really easy to use.",
                avatar: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=80&h=80&fit=crop&crop=face",
              },
              {
                name: "Sophie Williams",
                location: "Bristol",
                rating: 5,
                text: "As a carpenter I've found TradesLink invaluable for finding quality local work. The booking and payment system is really straightforward.",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <StarRating rating={t.rating} showValue />
                <blockquote className="mt-4 text-slate-600 text-sm leading-relaxed italic">
                  "{t.text}"
                </blockquote>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join as a Tradesperson ── */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-500 mb-6">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold">Are You a Tradesperson?</h2>
            <p className="text-slate-300 mt-3 text-lg leading-relaxed">
              Join thousands of tradespeople growing their business on TradesLink. Get more jobs, manage bookings, and build your reputation online.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-left">
              {[
                { icon: "💼", title: "More jobs", desc: "Access thousands of local job postings" },
                { icon: "⭐", title: "Build reputation", desc: "Collect reviews and grow your profile" },
                { icon: "💰", title: "Get paid fast", desc: "Secure payments straight to your account" },
              ].map((item) => (
                <div key={item.title} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
            <Button size="xl" className="mt-8" asChild>
              <Link href="/register?role=tradesperson">
                Join as a Tradesperson <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
