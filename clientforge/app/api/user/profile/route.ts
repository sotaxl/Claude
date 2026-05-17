import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({ name: z.string().min(1).max(100) })

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name } = schema.parse(await req.json())
    await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, session.user.id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
}
