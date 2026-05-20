# Claude API Setup

Add AI features to your app using Anthropic's Claude API.
Skip this file if the project doesn't need AI.

---

## Step 1 — Get an API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Go to **API Keys** → **Create Key**
4. Name it (e.g. `client-name-prod`)
5. Copy the key immediately — only shown once

Add to `env-template.txt`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

> This key is **server-side only** — never put it in client-side code or prefix with `NEXT_PUBLIC_`.

---

## Step 2 — Add Billing

1. **Settings** → **Billing** → **Add payment method**
2. Set a **monthly spend limit** to avoid surprise bills (e.g. £50/month)
3. Set an **email alert** at 80% of the limit

---

## Step 3 — Choose the Right Model

| Model | Speed | Cost | Best for |
|-------|-------|------|----------|
| `claude-haiku-4-5-20251001` | Fastest | Cheapest | Simple tasks, high volume |
| `claude-sonnet-4-6` | Balanced | Mid | Most features, summarisation |
| `claude-opus-4-7` | Slowest | Most expensive | Complex reasoning, analysis |

**Start with Sonnet** — it handles most tasks well and is cost-efficient.

---

## Step 4 — Install the SDK

```bash
npm install @anthropic-ai/sdk
```

Create a utility:

```ts
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

---

## Step 5 — Basic Usage

Always call Claude from **Server Components, Server Actions, or API Routes** — never from client-side code.

### Simple Message

```ts
// app/api/ai/route.ts
import { anthropic } from '@/lib/claude'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: prompt }
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return Response.json({ text })
}
```

### Streaming (for chat-like UX)

```ts
// app/api/ai/stream/route.ts
import { anthropic } from '@/lib/claude'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
```

### With a System Prompt

```ts
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: `You are a helpful assistant for ${clientName}. 
           Be concise and professional. 
           Only answer questions related to their business.`,
  messages: [
    { role: 'user', content: userMessage }
  ],
})
```

---

## Step 6 — Prompt Caching (Save Money)

If you use the same system prompt for many users, enable prompt caching — you only pay to process the system prompt once:

```ts
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: 'Your long system prompt here...',
      cache_control: { type: 'ephemeral' },  // cache this
    }
  ],
  messages: [{ role: 'user', content: userMessage }],
})
```

Cache saves ~90% on repeated system prompt costs. Cached content stays for 5 minutes.

---

## Step 7 — Rate Limiting

Protect your API route from abuse — never let users call Claude directly without limits:

```ts
// Simple per-user rate limiting using Supabase
// app/api/ai/route.ts
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  // Check usage (store in Supabase)
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', new Date().toISOString().split('T')[0])
    .single()

  if (usage && usage.count >= 50) {
    return new Response('Daily AI limit reached', { status: 429 })
  }

  // Call Claude...
  // Then increment usage count
}
```

---

## Step 8 — Common Use Cases

| Feature | Prompt approach |
|---------|----------------|
| **Summarise documents** | Send document text, ask for a summary |
| **Draft emails** | Provide context, ask to write an email |
| **Answer questions** | Give system context about the business |
| **Classify/tag items** | Ask Claude to output JSON labels |
| **Generate reports** | Send data, ask for formatted analysis |

---

## Cost Estimation

| Model | Input (per M tokens) | Output (per M tokens) |
|-------|---------------------|----------------------|
| Haiku 4.5 | $0.80 | $4.00 |
| Sonnet 4.6 | $3.00 | $15.00 |
| Opus 4.7 | $15.00 | $75.00 |

1,000 tokens ≈ 750 words. A typical chat message = ~500 tokens.

At Sonnet pricing: **1,000 messages ≈ $1.50–3.00** — very affordable for most SaaS.

---

## Checklist

- [ ] Anthropic account created
- [ ] API key copied to `env-template.txt`
- [ ] Billing set up with spend limit
- [ ] Model chosen (`claude-sonnet-4-6` recommended)
- [ ] SDK installed (`@anthropic-ai/sdk`)
- [ ] `lib/claude.ts` utility created
- [ ] API route created (server-side only)
- [ ] Rate limiting added
- [ ] Prompt caching enabled if using system prompts
