"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, FileText, DollarSign, Clock, Camera, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TRADE_CATEGORIES } from "@/lib/utils";

const STEPS = ["Job Details", "Location & Budget", "Review & Post"];

export default function PostJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    tradeType: "",
    description: "",
    urgency: "flexible",
    location: "",
    postcode: "",
    budget: "",
    budgetType: "fixed",
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push("/dashboard?posted=true");
  }

  const trade = TRADE_CATEGORIES.find(c => c.value === form.tradeType);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Post Your Job</h1>
          <p className="text-slate-500 mt-2">Describe your job and receive quotes from local tradespeople</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i <= step ? "text-brand-600" : "text-slate-400"}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? "bg-brand-500 text-white" :
                  i === step ? "bg-brand-500 text-white ring-4 ring-brand-100" :
                  "bg-slate-200 text-slate-500"
                }`}>
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className="hidden sm:block text-sm font-medium">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 ${i < step ? "bg-brand-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {/* Step 1 */}
          {step === 0 && (
            <div className="p-6 space-y-4">
              <h2 className="font-bold text-slate-900 text-lg">Tell us about the job</h2>

              <div className="space-y-1.5">
                <Label>Job Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Full bathroom renovation, Replace consumer unit"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Trade Required *</Label>
                <select
                  value={form.tradeType}
                  onChange={(e) => update("tradeType", e.target.value)}
                  className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a trade...</option>
                  {TRADE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Job Description *</Label>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe the work needed in as much detail as possible. What needs doing? What's the current situation? Any specific requirements?"
                />
                <p className="text-xs text-slate-400">{form.description.length}/500 characters</p>
              </div>

              <div className="space-y-1.5">
                <Label>When do you need this done?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["asap", "within 1 week", "within 1 month", "flexible", "future planning", "unsure"].map((u) => (
                    <button
                      key={u}
                      onClick={() => update("urgency", u)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border capitalize transition-colors ${
                        form.urgency === u
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:border-brand-300"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <h2 className="font-bold text-slate-900 text-lg">Location & Budget</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Address / Area *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input className="pl-9" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Street or area name" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Postcode *</Label>
                  <Input value={form.postcode} onChange={(e) => update("postcode", e.target.value)} placeholder="e.g. M14 5KL" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Budget Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "fixed", label: "Fixed Price", desc: "I have a specific budget in mind" },
                    { value: "quote", label: "Get Quotes", desc: "I want tradespeople to quote me" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => update("budgetType", t.value)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        form.budgetType === t.value
                          ? "border-brand-500 bg-brand-50"
                          : "border-slate-200 hover:border-brand-300"
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-900">{t.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.budgetType === "fixed" && (
                <div className="space-y-1.5">
                  <Label>Your Budget (£)</Label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">£</span>
                    <Input className="pl-7" type="number" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="0" />
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium">💡 Tip</p>
                <p className="text-sm text-amber-700 mt-1">
                  Jobs with photos receive 40% more quotes. You'll be able to add photos after posting.
                </p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <div className="p-6 space-y-4">
              <h2 className="font-bold text-slate-900 text-lg">Review your job post</h2>

              <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Job Title</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{form.title || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Trade</div>
                  <div className="mt-0.5">{trade ? `${trade.icon} ${trade.label}` : "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Description</div>
                  <div className="text-sm text-slate-700 mt-0.5 leading-relaxed">{form.description || "—"}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Location</div>
                    <div className="text-sm text-slate-700 mt-0.5">{[form.location, form.postcode].filter(Boolean).join(", ") || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Budget</div>
                    <div className="text-sm text-slate-700 mt-0.5">
                      {form.budgetType === "quote" ? "Quotes only" : form.budget ? `£${form.budget}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Urgency</div>
                    <div className="text-sm text-slate-700 mt-0.5 capitalize">{form.urgency}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  "Your job will be visible to verified local tradespeople",
                  "You'll receive up to 5 quotes within 24 hours",
                  "No obligation to accept any quote",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 ? !form.title || !form.tradeType || !form.description : !form.location || !form.postcode}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...</> : "Post Job Free"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
