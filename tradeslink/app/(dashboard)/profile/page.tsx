"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, MapPin, Phone, Mail, Wrench, Plus, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TRADE_CATEGORIES } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "trade" | "portfolio">("personal");

  const [form, setForm] = useState({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: "+44 7700 900000",
    location: "Manchester, UK",
    bio: "I'm passionate about finding reliable tradespeople for my home projects.",
  });

  const [tradeForm, setTradeForm] = useState({
    tradeType: "electrician",
    headline: "Master Electrician · 15 Years Experience",
    hourlyRate: "65",
    experienceYears: "15",
    description: "Fully qualified master electrician with 15 years of experience.",
    skills: ["Rewiring", "Consumer units", "EV chargers"],
  });

  const [newSkill, setNewSkill] = useState("");

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  function addSkill() {
    if (newSkill.trim() && !tradeForm.skills.includes(newSkill.trim())) {
      setTradeForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your personal and trade information</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> :
           saved ? "✓ Saved!" :
           <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-3xl font-extrabold">
            {form.name[0]?.toUpperCase() ?? "U"}
          </div>
          <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg hover:bg-brand-600 transition-colors">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <div className="font-bold text-slate-900 text-lg">{form.name}</div>
          <div className="text-slate-500 text-sm">{form.email}</div>
          <div className="text-xs text-brand-500 font-medium mt-1 capitalize">{(session?.user as any)?.role ?? "Homeowner"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(["personal", "trade", "portfolio"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "trade" ? "Trade Profile" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Personal */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className="pl-9" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className="pl-9" value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea rows={3} value={form.bio} onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
        </div>
      )}

      {/* Trade profile */}
      {activeTab === "trade" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Trade Type</Label>
              <select
                value={tradeForm.tradeType}
                onChange={(e) => setTradeForm(p => ({ ...p, tradeType: e.target.value }))}
                className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {TRADE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Hourly Rate (£)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">£</span>
                <Input className="pl-7" value={tradeForm.hourlyRate} onChange={(e) => setTradeForm(p => ({ ...p, hourlyRate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Profile Headline</Label>
              <Input value={tradeForm.headline} onChange={(e) => setTradeForm(p => ({ ...p, headline: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Years of Experience</Label>
              <Input type="number" value={tradeForm.experienceYears} onChange={(e) => setTradeForm(p => ({ ...p, experienceYears: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={4} value={tradeForm.description} onChange={(e) => setTradeForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Skills & Specialisms</Label>
            <div className="flex flex-wrap gap-2">
              {tradeForm.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1 bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full font-medium border border-brand-100">
                  {skill}
                  <button onClick={() => setTradeForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))} className="text-brand-400 hover:text-brand-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                className="max-w-xs"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button variant="outline" size="sm" onClick={addSkill}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio */}
      {activeTab === "portfolio" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-slate-500 text-sm mb-4">Upload photos of your completed work to attract more customers.</p>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video rounded-lg bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
                <Camera className="h-6 w-6 text-slate-300" />
                <span className="text-xs text-slate-400">Upload photo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
