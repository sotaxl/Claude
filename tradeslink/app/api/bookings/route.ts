import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const results = await db.select().from(bookings).where(eq(bookings.homeownerId, userId));
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;

  const [booking] = await db.insert(bookings).values({
    homeownerId: userId,
    tradespersonId: body.tradespersonId,
    title: body.title,
    description: body.description,
    scheduledDate: new Date(body.scheduledDate),
    agreedPrice: body.agreedPrice,
    address: body.address,
    notes: body.notes,
  }).returning();

  return NextResponse.json(booking);
}
