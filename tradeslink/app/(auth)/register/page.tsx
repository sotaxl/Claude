"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "tradesperson" ? "tradesperson" : "homeowner";

  const [role, setRole] = useState<"homeowner" | "tradesperson">(defaultRole as any);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Registration failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join thousands of people on TradesLink</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-slate-100 rounded-xl">
          <button
            onClick={() => setRole("homeowner")}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all ${role === "homeowner" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
          >
            <span className="text-xl">🏡</span> Homeowner
          </button>
          <button
            onClick={() => setRole("tradesperson")}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all ${role === "tradesperson" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
          >
            <span className="text-xl">🔧</span> Tradesperson
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" className="pl-9" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="pl-9 pr-9"
                minLength={8}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {role === "tradesperson" && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-brand-700 mb-2">As a tradesperson you'll be able to:</p>
              <ul className="space-y-1">
                {["Create a public profile", "Receive job enquiries", "Manage your bookings", "Collect reviews & ratings"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-brand-600">
                    <CheckCircle className="h-3.5 w-3.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...</> : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-brand-500">Terms</Link> and{" "}
          <Link href="/privacy" className="text-brand-500">Privacy Policy</Link>
        </p>

        <p className="text-center text-sm text-slate-500 mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-500 font-semibold hover:text-brand-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
