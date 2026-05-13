# Claude PWA

An offline-capable, installable Claude chat app for iOS (and any browser). Reduces API usage through smart response caching — repeated or similar questions are served instantly from local storage with zero API calls.

## Features

- **Installable on iOS** — add to home screen via Safari, works like a native app
- **Smart cache** — Jaccard similarity matching serves cached answers for similar questions
- **Offline queue** — compose messages with no connection, they send automatically when back online
- **Streaming** — responses stream word-by-word, just like Claude.ai
- **Full history** — conversation persists in IndexedDB across sessions
- **Cache stats** — see how many tokens you've saved

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/sotaxl/Claude
cd Claude/claude-pwa
npm install
```

### 2. Add your API key

```bash
cp .env.example .env.local
# edit .env.local and paste your key:
# ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com/).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Safari on your Mac or iPhone.

## Deploy to Vercel (recommended for iPhone access)

```bash
npm install -g vercel
vercel
```

When prompted, set the environment variable `ANTHROPIC_API_KEY`.

Once deployed you get a `https://` URL you can open on your iPhone.

## Install on iPhone

1. Open your Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

The app now lives on your home screen with its own icon, launches full-screen, and works offline for cached queries.

## How the cache works

Every response is stored in IndexedDB with a normalised key derived from your question. When you ask something new:

1. Exact match → served instantly (0 tokens)
2. >82% word-overlap similarity → served instantly (0 tokens)
3. No match → streamed from Claude API, then cached for next time

The cache holds up to 500 entries. Least-recently-used entries are evicted automatically.

## Offline behaviour

| Situation | What happens |
|---|---|
| Question is cached | Instant answer — no network needed |
| Question not cached, online | Streams from Claude, caches result |
| Question not cached, offline | Message queued in IndexedDB |
| Back online | Queued messages send automatically |
