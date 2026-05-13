import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { clients, activities } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  company: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db.select().from(clients)
    .where(eq(clients.userId, session.user.id))
    .orderBy(desc(clients.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const [client] = await db.insert(clients).values({
      userId: session.user.id,
      name: data.name,
      email: data.email || null,
      company: data.company || null,
      notes: data.notes || null,
    }).returning()

    await db.insert(activities).values({
      userId: session.user.id,
      type: "client_created",
      entityId: client.id,
      entityType: "client",
      description: `Added client ${client.name}`,
    })

    return NextResponse.json(client, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
