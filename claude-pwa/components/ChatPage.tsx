"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  saveMessage, getMessages, clearMessages,
  getCached, putCache, getCacheStats,
  enqueue, dequeue, removeFromQueue,
  type Message,
} from "@/lib/db"
import { nanoid, cn, renderMarkdown, formatTime } from "@/lib/utils"
import {
  Send, Trash2, WifiOff, Zap, RotateCcw,
  ChevronDown, Settings, X,
} from "lucide-react"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [online, setOnline] = useState(true)
  const [stats, setStats] = useState({ count: 0, totalTokensSaved: 0 })
  const [showStats, setShowStats] = useState(false)
  const [streamText, setStreamText] = useState("")
  const [useCache, setUseCache] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load messages + stats on mount
  useEffect(() => {
    getMessages().then(setMessages)
    getCacheStats().then(setStats)
  }, [])

  // Online/offline detection
  useEffect(() => {
    const set = () => setOnline(navigator.onLine)
    window.addEventListener("online", set)
    window.addEventListener("offline", set)
    setOnline(navigator.onLine)
    return () => { window.removeEventListener("online", set); window.removeEventListener("offline", set) }
  }, [])

  // Flush offline queue when reconnected
  useEffect(() => {
    if (!online) return
    dequeue().then(async (queued) => {
      for (const q of queued) {
        await sendMessage(q.content, true)
        await removeFromQueue(q.id)
      }
    })
  }, [online]) // eslint-disable-line

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamText])

  // Auto-resize textarea
  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 180) + "px"
  }

  const sendMessage = useCallback(async (text: string, fromQueue = false) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: Message = {
      id: nanoid(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      offline: fromQueue,
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    await saveMessage(userMsg)
    if (!fromQueue) setInput("")

    // Check cache first
    if (useCache) {
      const cached = await getCached(trimmed)
      if (cached) {
        const reply: Message = {
          id: nanoid(),
          role: "assistant",
          content: cached.response,
          timestamp: Date.now(),
          cached: true,
        }
        setMessages((prev) => [...prev, reply])
        await saveMessage(reply)
        getCacheStats().then(setStats)
        return
      }
    }

    // Offline — queue the message
    if (!navigator.onLine) {
      const queued: Message = {
        id: nanoid(),
        role: "assistant",
        content: "_Your message is queued and will be sent when you reconnect._",
        timestamp: Date.now(),
        offline: true,
      }
      setMessages((prev) => [...prev, queued])
      await saveMessage(queued)
      await enqueue({ id: nanoid(), content: trimmed, conversationId: "main", queuedAt: Date.now() })
      return
    }

    // Stream from Claude API
    setLoading(true)
    setStreamText("")
    let fullText = ""

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream: true,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullText += chunk
        setStreamText(fullText)
      }
    } catch (err) {
      fullText = `Sorry, something went wrong: ${err instanceof Error ? err.message : "unknown error"}`
    }

    const reply: Message = {
      id: nanoid(),
      role: "assistant",
      content: fullText,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, reply])
    setStreamText("")
    setLoading(false)
    await saveMessage(reply)

    // Cache the response
    if (useCache && fullText && !fullText.startsWith("Sorry")) {
      const tokens = Math.ceil((trimmed.length + fullText.length) / 4)
      await putCache(trimmed, fullText, tokens)
      getCacheStats().then(setStats)
    }
  }, [messages, useCache])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClear = async () => {
    await clearMessages()
    setMessages([])
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#1a1a1a] safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#d97757] flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-[#e8e3d8] font-semibold">Claude</span>
          {!online && (
            <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Cache toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors",
              useCache
                ? "bg-[#d97757]/15 text-[#d97757]"
                : "bg-[#2a2a2a] text-[#888]"
            )}
          >
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Cache</span>
            {stats.count > 0 && <span className="font-bold">{stats.count}</span>}
          </button>

          <button
            onClick={handleClear}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#888] hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cache stats panel */}
      {showStats && (
        <div className="mx-3 mt-2 bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a] animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#e8e3d8] text-sm font-semibold">Response Cache</span>
            <button onClick={() => setShowStats(false)} className="text-[#888] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-[#d97757] text-xl font-bold">{stats.count}</p>
              <p className="text-[#888] text-xs mt-0.5">Cached responses</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-green-400 text-xl font-bold">{stats.totalTokensSaved.toLocaleString()}</p>
              <p className="text-[#888] text-xs mt-0.5">Tokens saved</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#3a3a3a]">
            <span className="text-[#888] text-xs">Smart caching</span>
            <button
              onClick={() => setUseCache(!useCache)}
              className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                useCache ? "bg-[#d97757]" : "bg-[#3a3a3a]"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                useCache ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 py-12">
            <div className="w-14 h-14 rounded-2xl bg-[#d97757]/15 flex items-center justify-center">
              <span className="text-[#d97757] text-2xl font-bold">C</span>
            </div>
            <div>
              <p className="text-[#e8e3d8] font-semibold text-lg">How can I help?</p>
              <p className="text-[#888] text-sm mt-1">
                Replies are cached locally — repeated questions cost zero API tokens.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-2">
              {[
                "Explain async/await in JS",
                "Write a Python function to reverse a string",
                "What is the Fermi paradox?",
                "Give me a recipe for pasta carbonara",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus() }}
                  className="text-left text-xs text-[#888] bg-[#2a2a2a] hover:bg-[#333] border border-[#3a3a3a] rounded-xl px-3 py-2.5 transition-colors leading-snug"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Streaming response */}
        {loading && (
          <div className="flex gap-3 max-w-[88%] animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-[#d97757] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <div className="bg-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[#e8e3d8] flex-1">
              {streamText ? (
                <div
                  className="prose-claude"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(streamText) }}
                />
              ) : (
                <ThinkingDots />
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-[#2a2a2a]">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-[#2a2a2a] rounded-2xl border border-[#3a3a3a] px-4 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            placeholder={online ? "Message Claude…" : "Offline — message will queue…"}
            rows={1}
            className="flex-1 bg-transparent text-[#e8e3d8] placeholder-[#555] outline-none text-[15px] leading-relaxed py-1 max-h-44 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-all",
              input.trim() && !loading
                ? "bg-[#d97757] text-white hover:bg-[#c86644]"
                : "bg-[#3a3a3a] text-[#555] cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[#444] text-[10px] mt-1.5">
          {online ? "Shift+Enter for new line" : "Messages queue when offline"}
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"

  return (
    <div className={cn("flex gap-3 animate-slide-up", isUser ? "flex-row-reverse" : "")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#d97757] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">C</span>
        </div>
      )}

      <div className={cn("max-w-[88%] flex flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-[#2d4a3e] text-[#e8e3d8] rounded-2xl rounded-tr-sm"
              : "bg-[#2a2a2a] text-[#e8e3d8] rounded-2xl rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div
              className="prose-claude"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[#555] text-[10px]">{formatTime(msg.timestamp)}</span>
          {msg.cached && (
            <span className="flex items-center gap-0.5 text-[#d97757] text-[10px]">
              <Zap className="w-2.5 h-2.5" /> cached
            </span>
          )}
          {msg.offline && (
            <span className="flex items-center gap-0.5 text-yellow-500 text-[10px]">
              <WifiOff className="w-2.5 h-2.5" /> queued
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-[#d97757] rounded-full animate-pulse-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  )
}
