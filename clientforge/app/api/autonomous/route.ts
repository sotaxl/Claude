import { NextResponse } from "next/server"
import { getSystemState } from "@/lib/autonomous-saas"

let systemRunning = false
let systemError: string | null = null

export async function GET() {
  return NextResponse.json({
    running: systemRunning,
    error: systemError,
    state: getSystemState(),
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { action } = body

  if (action === "start") {
    if (systemRunning) {
      return NextResponse.json({ error: "System already running" }, { status: 400 })
    }

    systemRunning = true
    systemError = null

    const { startBillionaireOS } = await import("@/lib/autonomous-saas")

    startBillionaireOS().catch((e: Error) => {
      systemRunning = false
      systemError = e.message
    })

    return NextResponse.json({ message: "Autonomous SaaS OS started", running: true })
  }

  if (action === "stop") {
    systemRunning = false
    return NextResponse.json({ message: "Stop signal sent (current cycle will finish)", running: false })
  }

  return NextResponse.json({ error: "Invalid action. Use: start | stop" }, { status: 400 })
}
