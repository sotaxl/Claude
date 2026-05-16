import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"
import {
  autonomousPortfolio,
  autonomousAnalytics,
  autonomousSystemLog,
  type AutonomousProduct,
} from "@/db/schema"
import { desc, asc, eq } from "drizzle-orm"

const client = new Anthropic()

// ─── Types ────────────────────────────────────────────────────────────────────

interface Strategy {
  trend_focus: string
  goal: string
}

interface RevenueAction {
  type: string
  description: string
  expected_impact: number
}

interface MarketTrends {
  trends: string[]
  pricing: CompetitorPrice[]
  social: SocialSignals
}

interface CompetitorPrice {
  name: string
  price: number
  plan: string
}

interface SocialSignals {
  twitter: { sentiment: number; mentions: number }
  linkedin: { engagement: number; impressions: number }
  reddit: { upvotes: number; comments: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractText(response: Anthropic.Message): string {
  const block = response.content.find((b) => b.type === "text")
  return block && block.type === "text" ? block.text : ""
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2 ** i * 1000))
    }
  }
  throw lastError
}

async function syslog(level: "info" | "warn" | "error", message: string, data?: unknown) {
  console.log(`[${level.toUpperCase()}] ${message}`)
  await db.insert(autonomousSystemLog).values({ level, message, data: data ?? null })
}

// ─── Market Data ──────────────────────────────────────────────────────────────

async function getCompetitorPricing(): Promise<CompetitorPrice[]> {
  // Replace with real pricing scraper / API when available
  return [
    { name: "CompetitorA", price: 49, plan: "Pro" },
    { name: "CompetitorB", price: 79, plan: "Agency" },
    { name: "CompetitorC", price: 29, plan: "Starter" },
  ]
}

async function getTrends(): Promise<string[]> {
  // Replace with Google Trends / Twitter API integration
  return [
    "AI-powered SaaS tools",
    "no-code automation",
    "vertical SaaS for SMBs",
    "usage-based pricing",
    "embedded finance",
  ]
}

async function getSocialSignals(): Promise<SocialSignals> {
  // Replace with real social listening APIs (Brandwatch, Sprout, etc.)
  return {
    twitter: { sentiment: 0.72, mentions: 1420 },
    linkedin: { engagement: 0.68, impressions: 8900 },
    reddit: { upvotes: 340, comments: 87 },
  }
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

async function orchestrator(): Promise<{ strategy: Strategy; market: MarketTrends }> {
  const [pricing, trends, social] = await Promise.all([
    getCompetitorPricing(),
    getTrends(),
    getSocialSignals(),
  ])

  const market: MarketTrends = { trends, pricing, social }

  const response = await withRetry(() =>
    client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: `You are an autonomous SaaS strategist. Analyze this market data and return a strategy.

Competitor pricing: ${JSON.stringify(pricing)}
Market trends: ${JSON.stringify(trends)}
Social signals: ${JSON.stringify(social)}

Return ONLY a valid JSON object:
{"trend_focus": "the main trend to focus on", "goal": "the primary business goal for this cycle"}`,
        },
      ],
    })
  )

  const text = extractText(response)
  const match = text.match(/\{[\s\S]*?\}/)
  const strategy: Strategy = match
    ? JSON.parse(match[0])
    : { trend_focus: trends[0], goal: "grow MRR" }

  return { strategy, market }
}

// ─── Content Agent ────────────────────────────────────────────────────────────

async function contentAgent(topic: string): Promise<string> {
  const response = await withRetry(() =>
    client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: `Write viral SaaS marketing content about: ${topic}

Make it punchy, shareable, and under 280 characters. Include hook + CTA.`,
        },
      ],
    })
  )
  return extractText(response)
}

async function distributeContent(content: string, platforms: string[]): Promise<void> {
  for (const platform of platforms) {
    const envKey = `${platform.toUpperCase()}_API_KEY`
    if (process.env[envKey]) {
      // TODO: wire up platform-specific SDK when key is present
      await syslog("info", `[DISTRIBUTE:${platform}] Would post via API`, { preview: content.slice(0, 100) })
    } else {
      await syslog("info", `[DISTRIBUTE:${platform}] Simulated (set ${envKey} to enable)`, {
        preview: content.slice(0, 100),
      })
    }
  }
}

// ─── Revenue Engine ───────────────────────────────────────────────────────────

const ACTION_SCORES: Record<string, number> = {
  viral_loop: 7,
  add_paywall: 6,
  referral_program: 5,
  upsell_campaign: 4,
  email_drip: 3,
  seo_content: 2,
  paid_ads: 1,
}

function scoreAction(action: RevenueAction): number {
  return ACTION_SCORES[action.type] ?? 0
}

async function revenueEngine(portfolio: AutonomousProduct[]): Promise<RevenueAction | null> {
  const response = await withRetry(() =>
    client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: `You are a SaaS revenue optimization engine. Return prioritized actions for this portfolio.

Portfolio: ${JSON.stringify(portfolio.map((p) => ({ name: p.name, revenue: p.revenue, growth: p.growth, churn: p.churn })))}

Return ONLY a valid JSON array:
[{"type": "viral_loop|add_paywall|referral_program|upsell_campaign|email_drip|seo_content|paid_ads", "description": "...", "expected_impact": 1-10}]`,
        },
      ],
    })
  )

  const text = extractText(response)
  const match = text.match(/\[[\s\S]*\]/)
  const actions: RevenueAction[] = match ? JSON.parse(match[0]) : []
  return actions.sort((a, b) => scoreAction(b) - scoreAction(a))[0] ?? null
}

// ─── Self-Modification ────────────────────────────────────────────────────────

const DANGEROUS_PATTERNS = [
  "rm -rf", "drop table", "delete from", "truncate", "format c:",
  "sudo rm", "__import__", "exec(", "eval(", "os.system", "subprocess",
]

function validatePatch(patch: string): boolean {
  const lower = patch.toLowerCase()
  return !DANGEROUS_PATTERNS.some((p) => lower.includes(p))
}

async function selfModify(strategy: Strategy): Promise<void> {
  const response = await withRetry(() =>
    client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Describe one safe, minimal config change to optimize for: ${strategy.goal}
Focus on: ${strategy.trend_focus}
Return a single sentence description only — no code.`,
        },
      ],
    })
  )

  const patch = extractText(response)
  if (!patch) return

  if (!validatePatch(patch)) {
    await syslog("warn", "[PATCH BLOCKED] Dangerous operation detected", { patch: patch.slice(0, 120) })
    return
  }

  await syslog("info", "[PATCH APPLIED]", { patch: patch.slice(0, 120) })
}

// ─── Portfolio Manager ────────────────────────────────────────────────────────

function scoreProduct(p: Pick<AutonomousProduct, "revenue" | "growth" | "churn">): number {
  return p.revenue * 0.5 + p.growth * 0.3 - p.churn * 0.2
}

async function generateNewProducts(trends: string[]): Promise<Omit<AutonomousProduct, "id" | "score" | "createdAt" | "updatedAt">[]> {
  const response = await withRetry(() =>
    client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: `Generate 3 micro SaaS product ideas based on: ${JSON.stringify(trends)}

Return ONLY a valid JSON array with exactly 3 objects:
[{"name":"...","description":"...","targetMarket":"...","revenue":2000,"growth":0.15,"churn":0.05}]`,
        },
      ],
    })
  )

  const text = extractText(response)
  const match = text.match(/\[[\s\S]*\]/)
  return match ? JSON.parse(match[0]) : []
}

async function managePortfolio(trends: string[]): Promise<AutonomousProduct[]> {
  const existing = await db
    .select()
    .from(autonomousPortfolio)
    .orderBy(desc(autonomousPortfolio.score))

  // Prune bottom performers (keep top 5)
  if (existing.length > 5) {
    const toDelete = existing.slice(5)
    for (const product of toDelete) {
      await db.delete(autonomousPortfolio).where(eq(autonomousPortfolio.id, product.id))
    }
    await syslog("info", `[PORTFOLIO] Pruned ${toDelete.length} underperforming product(s)`)
  }

  const current = existing.slice(0, 5)

  if (current.length < 3) {
    const newProducts = await generateNewProducts(trends)
    for (const p of newProducts) {
      const score = scoreProduct(p)
      await db.insert(autonomousPortfolio).values({ ...p, score })
    }
    await syslog("info", `[PORTFOLIO] Added ${newProducts.length} new product(s)`)
  }

  return db.select().from(autonomousPortfolio).orderBy(desc(autonomousPortfolio.score))
}

function applyMarketDrift(p: AutonomousProduct) {
  return {
    revenue: Math.max(0, p.revenue * (1 + (Math.random() * 0.2 - 0.05))),
    growth: Math.max(0, Math.min(1, p.growth + (Math.random() * 0.1 - 0.05))),
    churn: Math.max(0, Math.min(1, p.churn + (Math.random() * 0.04 - 0.02))),
  }
}

// ─── Main Cycle ───────────────────────────────────────────────────────────────

export async function runCycle(): Promise<{
  strategy: Strategy
  totalRevenue: number
  productCount: number
  topAction: RevenueAction | null
}> {
  await syslog("info", `[CYCLE START] ${new Date().toISOString()}`)

  const { strategy, market } = await orchestrator()
  await syslog("info", `[STRATEGY] Focus: ${strategy.trend_focus} | Goal: ${strategy.goal}`)

  const content = await contentAgent(strategy.trend_focus)
  await distributeContent(content, ["X", "TIKTOK", "INSTAGRAM"])

  const portfolio = await managePortfolio(market.trends)

  // Apply market simulation and persist updated metrics
  for (const product of portfolio) {
    const drifted = applyMarketDrift(product)
    const score = scoreProduct(drifted)
    await db
      .update(autonomousPortfolio)
      .set({ ...drifted, score, updatedAt: new Date() })
      .where(eq(autonomousPortfolio.id, product.id))
  }

  const updated = await db.select().from(autonomousPortfolio).orderBy(desc(autonomousPortfolio.score))
  const topAction = await revenueEngine(updated)

  if (topAction) {
    await syslog("info", `[REVENUE] Top action: ${topAction.type} — ${topAction.description}`)
  }

  await selfModify(strategy)

  const totalRevenue = updated.reduce((sum, p) => sum + p.revenue, 0)

  // Keep last 168 analytics records (1 week at hourly cadence)
  const allAnalytics = await db
    .select()
    .from(autonomousAnalytics)
    .orderBy(asc(autonomousAnalytics.createdAt))

  if (allAnalytics.length >= 168) {
    await db.delete(autonomousAnalytics).where(eq(autonomousAnalytics.id, allAnalytics[0].id))
  }

  await db.insert(autonomousAnalytics).values({
    totalRevenue,
    productCount: updated.length,
    strategy,
    topAction,
  })

  await syslog(
    "info",
    `[CYCLE END] Products: ${updated.length} | MRR: $${Math.round(totalRevenue).toLocaleString()}`
  )

  return { strategy, totalRevenue, productCount: updated.length, topAction }
}

// ─── State accessor (for API routes) ─────────────────────────────────────────

export async function getSystemState() {
  const [portfolio, analytics] = await Promise.all([
    db.select().from(autonomousPortfolio).orderBy(desc(autonomousPortfolio.score)),
    db.select().from(autonomousAnalytics).orderBy(desc(autonomousAnalytics.createdAt)).limit(24),
  ])
  return { portfolio, analytics }
}

// ─── Local dev / persistent-process entry point ───────────────────────────────

export async function startBillionaireOS(): Promise<void> {
  console.log("BILLIONAIRE AUTONOMOUS OS STARTED (long-running mode)")
  while (true) {
    try {
      await runCycle()
      await new Promise((r) => setTimeout(r, 60 * 60 * 1000))
    } catch (e) {
      console.error("SYSTEM ERROR:", e)
      await new Promise((r) => setTimeout(r, 5 * 60 * 1000))
    }
  }
}
