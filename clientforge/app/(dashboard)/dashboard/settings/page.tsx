"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Loader2, Save } from "lucide-react"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    await update({ name })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7">
          <h2 className="text-white font-semibold text-lg mb-6">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input value={session?.user?.email ?? ""} disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-500 text-sm cursor-not-allowed" />
              <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved!" : "Save changes"}
            </button>
          </form>
        </div>

        {/* Email notifications */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7">
          <h2 className="text-white font-semibold text-lg mb-6">Email Notifications</h2>
          <div className="space-y-4">
            {[
              { label: "Project updates", desc: "Get notified when a project status changes" },
              { label: "Payment reminders", desc: "Dunning emails for failed payments" },
              { label: "Weekly digest", desc: "A summary of your activity every Monday" },
              { label: "Product news", desc: "New features and important announcements" },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
                <button className="w-10 h-6 bg-indigo-600 rounded-full relative flex-shrink-0 mt-0.5">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-7">
          <h2 className="text-red-400 font-semibold text-lg mb-2">Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-5">Deleting your account is permanent and cannot be undone.</p>
          <button className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}
