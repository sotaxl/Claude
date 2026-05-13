import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects, clients } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProjectsBoard } from "@/components/dashboard/projects-board"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [allProjects, allClients] = await Promise.all([
    db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt)),
    db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.userId, userId)),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Projects"
        subtitle={`${allProjects.length} project${allProjects.length !== 1 ? "s" : ""}`}
      />
      <div className="p-6 flex-1">
        <ProjectsBoard projects={allProjects} clients={allClients} />
      </div>
    </div>
  )
}
