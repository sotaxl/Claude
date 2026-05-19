import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, conversations } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const convId = req.nextUrl.searchParams.get("conversationId");

  if (convId) {
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, convId));
    return NextResponse.json(msgs);
  }

  const convs = await db.select().from(conversations).where(
    or(eq(conversations.homeownerId, userId), eq(conversations.tradespersonId, userId))
  );
  return NextResponse.json(convs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, content } = await req.json();
  const userId = (session.user as any).id;

  const [msg] = await db.insert(messages).values({
    conversationId,
    senderId: userId,
    content,
  }).returning();

  return NextResponse.json(msg);
}
