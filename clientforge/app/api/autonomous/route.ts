import { NextResponse } from "next/server"
import { getSystemState, runCycle } from "@/lib/autonomous-saas"

export async function GET() {
  try {
    const state = await getSystemState()
    return NextResponse.json({ ok: true, ...state })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// Manual trigger for testing — not used in production (cron handles scheduling)
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  if (body?.action !== "run") {
    return NextResponse.json({ error: 'Use {"action":"run"} to trigger a cycle manually' }, { status: 400 })
  }

  try {
    const result = await runCycle()
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
