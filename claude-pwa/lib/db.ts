/**
 * IndexedDB wrapper using idb.
 * Stores: messages (chat history), cache (question→response pairs), queue (offline messages).
 */
import { openDB, type IDBPDatabase } from "idb"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  cached?: boolean
  offline?: boolean
}

export interface CacheEntry {
  key: string          // normalised question text
  response: string
  tokens: number
  hits: number
  createdAt: number
  lastHit: number
}

export interface QueuedMessage {
  id: string
  content: string
  conversationId: string
  queuedAt: number
}

let _db: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db
  _db = await openDB("claude-pwa", 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore("messages", { keyPath: "id" })
        const cache = db.createObjectStore("cache", { keyPath: "key" })
        cache.createIndex("lastHit", "lastHit")
        db.createObjectStore("queue", { keyPath: "id" })
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains("conversations")) {
          db.createObjectStore("conversations", { keyPath: "id" })
        }
      }
    },
  })
  return _db
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function saveMessage(msg: Message): Promise<void> {
  const db = await getDB()
  await db.put("messages", msg)
}

export async function getMessages(limit = 100): Promise<Message[]> {
  const db = await getDB()
  const all = await db.getAll("messages") as Message[]
  return all.sort((a, b) => a.timestamp - b.timestamp).slice(-limit)
}

export async function clearMessages(): Promise<void> {
  const db = await getDB()
  await db.clear("messages")
}

// ─── Response Cache ───────────────────────────────────────────────────────────

export function normaliseKey(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 200)
}

function similarity(a: string, b: string): number {
  const setA = new Set(a.split(" "))
  const setB = new Set(b.split(" "))
  const intersection = [...setA].filter((w) => setB.has(w)).length
  return intersection / (Math.sqrt(setA.size) * Math.sqrt(setB.size))
}

export async function getCached(question: string): Promise<CacheEntry | null> {
  const db = await getDB()
  const key = normaliseKey(question)
  const all = await db.getAll("cache") as CacheEntry[]

  // Exact match first
  const exact = all.find((e) => e.key === key)
  if (exact) {
    exact.hits++
    exact.lastHit = Date.now()
    await db.put("cache", exact)
    return exact
  }

  // Fuzzy match — Jaccard similarity on word tokens
  const best = all
    .map((e) => ({ entry: e, score: similarity(key, e.key) }))
    .filter(({ score }) => score > 0.82)
    .sort((a, b) => b.score - a.score)[0]

  if (best) {
    best.entry.hits++
    best.entry.lastHit = Date.now()
    await db.put("cache", best.entry)
    return best.entry
  }

  return null
}

export async function putCache(question: string, response: string, tokens: number): Promise<void> {
  const db = await getDB()
  const key = normaliseKey(question)
  const entry: CacheEntry = {
    key,
    response,
    tokens,
    hits: 0,
    createdAt: Date.now(),
    lastHit: Date.now(),
  }
  await db.put("cache", entry)

  // Evict oldest entries if over 500
  const all = await db.getAll("cache") as CacheEntry[]
  if (all.length > 500) {
    const sorted = all.sort((a, b) => a.lastHit - b.lastHit)
    for (let i = 0; i < sorted.length - 400; i++) {
      await db.delete("cache", sorted[i].key)
    }
  }
}

export async function getCacheStats(): Promise<{ count: number; totalTokensSaved: number }> {
  const db = await getDB()
  const all = await db.getAll("cache") as CacheEntry[]
  return {
    count: all.length,
    totalTokensSaved: all.reduce((sum, e) => sum + e.tokens * e.hits, 0),
  }
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

export async function enqueue(msg: QueuedMessage): Promise<void> {
  const db = await getDB()
  await db.put("queue", msg)
}

export async function dequeue(): Promise<QueuedMessage[]> {
  const db = await getDB()
  return db.getAll("queue") as Promise<QueuedMessage[]>
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("queue", id)
}
