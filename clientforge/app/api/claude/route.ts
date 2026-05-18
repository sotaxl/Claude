import { NextResponse } from "next/server";

const SAMBANOVA_URL = "https://api.sambanova.ai/v1/chat/completions";
const SAMBANOVA_MODEL = "Meta-Llama-3.3-70B-Instruct";

export async function POST(req: Request) {
  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SAMBANOVA_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();

  // Convert Anthropic request format → OpenAI format
  const messages: { role: string; content: string }[] = [];
  if (body.system) messages.push({ role: "system", content: body.system });
  for (const msg of body.messages ?? []) {
    messages.push({ role: msg.role, content: msg.content });
  }

  const upstream = await fetch(SAMBANOVA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: SAMBANOVA_MODEL,
      max_tokens: Math.max(body.max_tokens ?? 4096, 4096),
      response_format: { type: "json_object" },
      messages,
    }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // Convert OpenAI response → Anthropic format (client code unchanged)
  const text = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ content: [{ type: "text", text }] });
}
