"use client"
import { useState } from "react"
import { Plus, Search, Calendar, DollarSign } from "lucide-react"
import type { Project } from "@/db/schema"
import { PROJECT_STATUSES } from "@/types"
import { formatDate, formatCurrency } from "@/lib/utils"

interface ProjectsBoardProps {
  projects: Project[]
  clients: { id: string; name: string }[]
}

export function ProjectsBoard({ projects, clients }: ProjectsBoardProps) {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"board" | "list">("board")
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", clientId: "", status: "planning", budget: "", dueDate: "" })
  const [saving, setSaving] = useState(false)

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        budget: form.budget ? parseInt(form.budget) * 100 : null,
        dueDate: form.dueDate || null,
      }),
    })
    setSaving(false)
    setShowModal(false)
    window.location.reload()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
          {(["board", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${view === v ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PROJECT_STATUSES.map((status) => {
            const cols = filtered.filter((p) => p.status === status.id)
            return (
              <div key={status.id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  <span className="text-gray-600 text-xs">{cols.length}</span>
                </div>
                <div className="space-y-2">
                  {cols.map((p) => (
                    <div key={p.id} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 hover:border-white/15 transition-all cursor-pointer">
                      <p className="text-white text-xs font-medium mb-2 line-clamp-2">{p.name}</p>
                      {p.dueDate && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          {formatDate(p.dueDate)}
                        </div>
                      )}
                      {p.budget && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(p.budget)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Project", "Client", "Status", "Budget", "Due Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => {
                const status = PROJECT_STATUSES.find((s) => s.id === p.status)
                const client = clients.find((c) => c.id === p.clientId)
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white text-sm font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{client?.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status?.color}`}>{status?.label}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">{p.budget ? formatCurrency(p.budget) : "—"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{p.dueDate ? formatDate(p.dueDate) : "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-white font-bold text-xl mb-6">New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Project name *" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500" />
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="">No client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500">
                {PROJECT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="Budget (USD)" type="number" min="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500" />
              <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                  {saving ? "Creating…" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
