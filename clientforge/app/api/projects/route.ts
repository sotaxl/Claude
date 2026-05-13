import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects, activities } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  clientId: z.string().optional().or(z.literal("")),
  status: z.enum(["planning", "active", "review", "completed", "on-hold"]).default("planning"),
  budget: z.number().int().min(0).nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db.select().from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const [project] = await db.insert(projects).values({
      userId: session.user.id,
      name: data.name,
      description: data.description || null,
      clientId: data.clientId || null,
      status: data.status,
      budget: data.budget ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    }).returning()

    await db.insert(activities).values({
      userId: session.user.id,
      type: "project_created",
      entityId: project.id,
      entityType: "project",
      description: `Created project "${project.name}"`,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
