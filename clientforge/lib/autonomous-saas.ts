import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const state = {
  portfolio: [] as any[],
  analytics: [] as any[],
  trends: [] as string[],
  marketSignals: {} as any,
}

function extractText(response: Anthropic.Message): string {
  const block = response.content.find((b) => b.type === "text")
  return block && block.type === "text" ? block.text : ""
}

async function getCompetitorPricing(): Promise<any[]> {
  return [
    { name: "CompetitorA", price: 49, plan: "Pro" },
    { name: "CompetitorB", price: 79, plan: "Agency" },
    { name: "CompetitorC", price: 29, plan: "Starter" },
  ]
}

async function getTrends(): Promise<string[]> {
  return [
    "AI-powered SaaS tools",
    "no-code automation",
    "vertical SaaS for SMBs",
    "usage-based pricing",
    "embedded finance",
  ]
}

async function getSocialSignals(): Promise<any> {
  return {
    twitter: { sentiment: 0.72, mentions: 1420 },
    linkedin: { engagement: 0.68, impressions: 8900 },
    reddit: { upvotes: 340, comments: 87 },
  }
}

async function orchestrator(): Promise<{ trend_focus: string; goal: string }> {
  const [pricing, trends, social] = await Promise.all([
    getCompetitorPricing(),
    getTrends(),
    getSocialSignals(),
  ])

  state.trends = trends
  state.marketSignals = { pricing, social }

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `You are an autonomous SaaS strategist. Analyze this market data and decide the best strategy.

Competitor pricing: ${JSON.stringify(pricing)}
Market trends: ${JSON.stringify(trends)}
Social signals: ${JSON.stringify(social)}
Current portfolio: ${JSON.stringify(state.portfolio)}

Return ONLY a valid JSON object with exactly these fields:
{"trend_focus": "the main trend to focus on", "goal": "the primary business goal for this cycle"}`,
      },
    ],
  })

  const text = extractText(response)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { trend_focus: trends[0], goal: "grow revenue" }
}

async function contentAgent(topic: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `Write viral SaaS marketing content about: ${topic}

Make it punchy, shareable, and optimized for social media. Include a hook, value proposition, and CTA. Keep it under 280 characters for X/Twitter.`,
      },
    ],
  })
  return extractText(response)
}

async function distributeContent(content: string, platforms: string[]): Promise<void> {
  for (const platform of platforms) {
    console.log(`[DISTRIBUTE] ${platform}: ${content.slice(0, 100)}...`)
    await new Promise((r) => setTimeout(r, 100))
  }
}

function scoreAction(action: any): number {
  const scores: Record<string, number> = {
    viral_loop: 7,
    add_paywall: 6,
    referral_program: 5,
    upsell_campaign: 4,
    email_drip: 3,
    seo_content: 2,
    paid_ads: 1,
  }
  return scores[action.type] ?? 0
}

async function revenueEngine(currentState: any): Promise<any> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `You are a SaaS revenue optimization engine. Analyze this state and return prioritized actions.

State: ${JSON.stringify(currentState)}

Return ONLY a valid JSON array of action objects, each with:
- type: one of [viral_loop, add_paywall, referral_program, upsell_campaign, email_drip, seo_content, paid_ads]
- description: brief description
- expected_impact: number 1-10

Example: [{"type": "viral_loop", "description": "Add share-for-credits mechanic", "expected_impact": 8}]`,
      },
    ],
  })

  const text = extractText(response)
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  const actions = jsonMatch ? JSON.parse(jsonMatch[0]) : []
  return actions.sort((a: any, b: any) => scoreAction(b) - scoreAction(a))[0] ?? null
}

function validatePatch(patch: string): boolean {
  const dangerous = [
    "rm -rf",
    "drop table",
    "delete from",
    "truncate",
    "format c:",
    "sudo rm",
    "__import__",
    "exec(",
    "eval(",
    "os.system",
    "subprocess",
  ]
  const lower = patch.toLowerCase()
  return !dangerous.some((d) => lower.includes(d))
}

async function applyPatch(patch: string): Promise<void> {
  if (!validatePatch(patch)) {
    console.warn("[PATCH BLOCKED] Dangerous operation detected:", patch.slice(0, 80))
    return
  }
  console.log("[PATCH APPLIED]", patch.slice(0, 120))
}

async function selfModify(strategy: { trend_focus: string; goal: string }): Promise<void> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Generate a safe, minimal code patch description to optimize for: ${strategy.goal}
Focus on: ${strategy.trend_focus}
Return a single line description of the change (not actual code).`,
      },
    ],
  })

  const patch = extractText(response)
  if (patch) await applyPatch(patch)
}

function scoreProduct(product: any): number {
  return product.revenue * 0.5 + product.growth * 0.3 - product.churn * 0.2
}

async function generateNewProducts(): Promise<any[]> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `Generate 3 micro SaaS product ideas based on these trends: ${JSON.stringify(state.trends)}

Return ONLY a valid JSON array with exactly 3 objects, each containing:
- name: product name
- description: one sentence description
- target_market: who it's for
- revenue: estimated monthly revenue (number, start small like 500-5000)
- growth: growth rate 0-1
- churn: churn rate 0-1

Example: [{"name": "AutoReport", "description": "Automated weekly reports", "target_market": "SMBs", "revenue": 2000, "growth": 0.15, "churn": 0.05}]`,
      },
    ],
  })

  const text = extractText(response)
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : []
}

async function managePortfolio(): Promise<void> {
  if (state.portfolio.length > 0) {
    state.portfolio = state.portfolio
      .map((p) => ({ ...p, score: scoreProduct(p) }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)

    const topProducts = state.portfolio.slice(0, 5)
    const pruned = state.portfolio.length - topProducts.length
    if (pruned > 0) console.log(`[PORTFOLIO] Pruned ${pruned} underperforming product(s)`)
    state.portfolio = topProducts
  }

  if (state.portfolio.length < 3) {
    const newProducts = await generateNewProducts()
    state.portfolio.push(...newProducts)
    console.log(`[PORTFOLIO] Added ${newProducts.length} new product(s)`)
  }
}

function simulateMarket(): void {
  state.portfolio = state.portfolio.map((p) => ({
    ...p,
    revenue: p.revenue * (1 + (Math.random() * 0.2 - 0.05)),
    growth: Math.max(0, Math.min(1, p.growth + (Math.random() * 0.1 - 0.05))),
    churn: Math.max(0, Math.min(1, p.churn + (Math.random() * 0.04 - 0.02))),
  }))

  state.analytics.push({
    timestamp: new Date().toISOString(),
    totalRevenue: state.portfolio.reduce((sum, p) => sum + p.revenue, 0),
    productCount: state.portfolio.length,
  })

  if (state.analytics.length > 24) {
    state.analytics = state.analytics.slice(-24)
  }
}

async function runCycle(): Promise<void> {
  console.log(`\n[CYCLE START] ${new Date().toISOString()}`)

  const strategy = await orchestrator()
  console.log(`[STRATEGY] Focus: ${strategy.trend_focus} | Goal: ${strategy.goal}`)

  const content = await contentAgent(strategy.trend_focus)
  await distributeContent(content, ["X", "TikTok", "Instagram"])

  await managePortfolio()

  simulateMarket()

  const action = await revenueEngine(state)
  if (action) {
    console.log(`[REVENUE] Top action: ${action.type} — ${action.description}`)
  }

  await selfModify(strategy)

  const totalRevenue = state.portfolio.reduce((sum, p) => sum + p.revenue, 0)
  console.log(
    `[CYCLE END] Portfolio: ${state.portfolio.length} products | Est. MRR: $${Math.round(totalRevenue).toLocaleString()}`
  )
}

export function getSystemState() {
  return {
    ...state,
    analytics: state.analytics.slice(-5),
  }
}

export async function startBillionaireOS(): Promise<void> {
  console.log("BILLIONAIRE AUTONOMOUS OS STARTED")
  while (true) {
    try {
      await runCycle()
      await new Promise((r) => setTimeout(r, 60 * 60 * 1000))
    } catch (e) {
      console.error("SYSTEM ERROR:", e)
    }
  }
}
