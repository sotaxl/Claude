import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { clients } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { DashboardHeader } from "@/components/dashboard/header"
import { ClientsTable } from "@/components/dashboard/clients-table"

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const allClients = await db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt))

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Clients"
        subtitle={`${allClients.length} client${allClients.length !== 1 ? "s" : ""}`}
      />
      <div className="p-6">
        <ClientsTable clients={allClients} />
      </div>
    </div>
  )
}
