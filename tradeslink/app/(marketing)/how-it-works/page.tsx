import Link from "next/link";
import { Search, FileText, MessageSquare, CheckCircle, Shield, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "How It Works" };

export default function HowItWorksPage() {
  const homeownerSteps = [
    {
      icon: Search,
      step: "1",
      title: "Search or Post a Job",
      description: "Browse thousands of verified tradespeople by trade and location, or post your job for free and let professionals come to you with quotes.",
      color: "bg-brand-50 text-brand-600 border-brand-100",
    },
    {
      icon: MessageSquare,
      step: "2",
      title: "Compare Profiles & Chat",
      description: "Review portfolios, check ratings and reviews, compare prices and response times. Message tradespeople directly before you commit to anything.",
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      icon: CheckCircle,
      step: "3",
      title: "Book & Track Progress",
      description: "Book your preferred professional with one click. Track the booking, communicate through the app, and pay securely when the job is done.",
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      icon: Star,
      step: "4",
      title: "Leave a Review",
      description: "Once the job is complete, share your experience to help other homeowners choose the right tradesperson for their project.",
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  const proSteps = [
    {
      icon: FileText,
      step: "1",
      title: "Create Your Profile",
      description: "Set up your professional profile with your trade, skills, experience, portfolio photos and hourly rate.",
      color: "bg-brand-50 text-brand-600 border-brand-100",
    },
    {
      icon: Search,
      step: "2",
      title: "Browse & Quote on Jobs",
      description: "Search the local job board for work in your trade. Submit competitive quotes directly to homeowners.",
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      icon: MessageSquare,
      step: "3",
      title: "Win Work & Chat",
      description: "Homeowners contact you directly through the platform. Discuss the job, agree on a price, and confirm the booking.",
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      icon: CheckCircle,
      step: "4",
      title: "Complete Jobs & Get Paid",
      description: "Complete the work and receive payment securely through TradesLink. Build your reputation with 5-star reviews.",
      color: "bg-green-50 text-green-600 border-green-100",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold">How TradesLink Works</h1>
          <p className="text-slate-300 mt-3 text-lg max-w-xl mx-auto">
            We make it simple to connect homeowners with trusted local tradespeople. Safe, transparent, and hassle-free.
          </p>
        </div>
      </section>

      {/* Trust */}
      <section className="py-10 border-b border-slate-100">
        <div className="container">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Shield, title: "All Pros Verified", desc: "We check IDs, qualifications, and insurance before anyone joins.", color: "text-blue-500" },
              { icon: Star, title: "Genuine Reviews", desc: "Reviews can only be left by homeowners who booked through TradesLink.", color: "text-amber-400" },
              { icon: CheckCircle, title: "Safe Payments", desc: "Pay securely through the platform. Money held until job is complete.", color: "text-green-500" },
            ].map((item) => (
              <div key={item.title} className="text-center p-4">
                <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-2`} />
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For homeowners */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block bg-brand-100 text-brand-700 text-sm font-semibold px-3 py-1 rounded-full mb-3">
              For Homeowners
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Find & Book Your Tradesperson</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {homeownerSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${step.color} mb-4`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-slate-400 mb-1">Step {step.step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href="/browse">Find a Pro Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For tradespeople */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full mb-3">
              For Tradespeople
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Grow Your Trades Business</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {proSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${step.color} mb-4`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-slate-400 mb-1">Step {step.step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" variant="dark" asChild>
              <Link href="/register?role=tradesperson">Join as a Pro <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is it free to post a job?", a: "Yes, posting a job is completely free for homeowners. You only pay when you hire a tradesperson." },
              { q: "How are tradespeople verified?", a: "All professionals go through an ID check, and we verify their trade qualifications and insurance before they can take bookings." },
              { q: "What if I'm not happy with the work?", a: "We have a dispute resolution service. Payments can be held in escrow until you're satisfied with the work." },
              { q: "How does payment work?", a: "You pay securely through TradesLink. Funds are held until the job is marked complete, protecting both parties." },
              { q: "Can I get multiple quotes?", a: "Yes! When you post a job, you can receive up to 5 quotes from local tradespeople. Compare and choose the best fit." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900">{faq.q}</h3>
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
