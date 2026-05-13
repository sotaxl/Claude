import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  try {
    const { messages, stream: doStream } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages required" }, { status: 400 })
    }

    // Streaming response
    if (doStream) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const stream = await client.messages.stream({
              model: "claude-sonnet-4-6",
              max_tokens: 4096,
              system: "You are Claude, a helpful AI assistant. Be concise when possible.",
              messages: messages.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
            })

            for await (const chunk of stream) {
              if (
                chunk.type === "content_block_delta" &&
                chunk.delta.type === "text_delta"
              ) {
                controller.enqueue(encoder.encode(chunk.delta.text))
              }
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "API error"
            controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`))
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      })
    }

    // Non-streaming (used for cache-miss path)
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: "You are Claude, a helpful AI assistant. Be concise when possible.",
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    })

    const content = response.content[0].type === "text" ? response.content[0].text : ""
    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens

    return NextResponse.json({ content, inputTokens, outputTokens })
  } catch (err) {
    console.error("Chat API error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
