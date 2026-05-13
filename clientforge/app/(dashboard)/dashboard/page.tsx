import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { clients, projects, activities } from "@/db/schema"
import { eq, desc, count } from "drizzle-orm"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Users, FolderKanban, TrendingUp, Clock } from "lucide-react"
import { PROJECT_STATUSES } from "@/types"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [
    clientCount, projectRows, recentActivity,
  ] = await Promise.all([
    db.select({ count: count() }).from(clients).where(eq(clients.userId, userId)),
    db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt)).limit(8),
    db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt)).limit(6),
  ])

  const activeProjects = projectRows.filter((p) => p.status === "active").length
  const totalBudget = projectRows.reduce((sum, p) => sum + (p.budget ?? 0), 0)
  const overdue = projectRows.filter((p) =>
    p.dueDate && new Date(p.dueDate) < new Date() && p.status !== "completed"
  ).length

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title={`Good morning, ${session?.user?.name?.split(" ")[0] ?? "there"} 👋`}
        subtitle="Here's what's happening with your clients today."
      />

      <div className="p-6 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Clients" value={clientCount[0].count} icon={Users} color="blue" />
          <StatsCard label="Active Projects" value={activeProjects} icon={FolderKanban} color="violet" />
          <StatsCard label="Total Budget" value={formatCurrency(totalBudget)} icon={TrendingUp} color="green" />
          <StatsCard label="Overdue" value={overdue} icon={Clock} color={overdue > 0 ? "red" : "gray"} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="font-semibold text-white">Recent Projects</h2>
              <a href="/dashboard/projects" className="text-indigo-400 text-sm hover:text-indigo-300">View all →</a>
            </div>
            <div className="divide-y divide-white/5">
              {projectRows.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-500 text-sm">
                  No projects yet. <a href="/dashboard/projects" className="text-indigo-400 hover:underline">Create one →</a>
                </div>
              ) : projectRows.map((p) => {
                const status = PROJECT_STATUSES.find((s) => s.id === p.status)
                return (
                  <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Due {p.dueDate ? formatDate(p.dueDate) : "No due date"}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status?.color ?? "bg-gray-500/20 text-gray-400"}`}>
                      {status?.label ?? p.status}
                    </span>
                    {p.budget && (
                      <span className="text-gray-400 text-xs font-mono">{formatCurrency(p.budget)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="font-semibold text-white">Activity</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No activity yet</p>
              ) : recentActivity.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">{a.description}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
