"use client";

import { useState, useCallback, useRef, useEffect, CSSProperties, ReactNode } from "react";

// ─── macOS Liquid Glass + Quiet Luxury design tokens ─────────
const G = {
  bgGradient: "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(216,204,248,0.45) 0%, transparent 55%), radial-gradient(ellipse 60% 80% at 85% 90%, rgba(196,220,255,0.35) 0%, transparent 55%), radial-gradient(ellipse 70% 70% at 50% 50%, rgba(240,238,255,1) 0%, rgba(235,240,250,1) 100%)",

  // Glass layers
  glass:        "rgba(255,255,255,0.68)",
  glassStrong:  "rgba(255,255,255,0.82)",
  glassSubtle:  "rgba(255,255,255,0.42)",
  glassDark:    "rgba(255,255,255,0.22)",
  glassNavbar:  "rgba(246,244,252,0.88)",
  glassInput:   "rgba(255,255,255,0.55)",

  // Borders
  borderShine:  "rgba(255,255,255,0.95)",
  borderMid:    "rgba(0,0,0,0.07)",
  borderSubtle: "rgba(0,0,0,0.045)",
  borderStrong: "rgba(0,0,0,0.10)",

  // Ink
  ink:     "#1A1825",
  inkMid:  "#3A3858",
  inkSub:  "#6A6888",
  inkDim:  "#9A98B8",
  inkFaint:"#C4C2DC",

  // Quiet luxury palette
  violet:      "#8165B4",
  violetSoft:  "rgba(129,101,180,0.14)",
  gold:        "#B8986A",
  goldSoft:    "rgba(184,152,106,0.13)",
  sage:        "#5E9070",
  sageSoft:    "rgba(94,144,112,0.13)",
  rose:        "#BE6878",
  roseSoft:    "rgba(190,104,120,0.13)",
  sky:         "#5080BE",
  skySoft:     "rgba(80,128,190,0.13)",
  ember:       "#C06850",
  emberSoft:   "rgba(192,104,80,0.13)",

  // Elevation shadows — glass-realistic
  s0: "0 1px 2px rgba(0,0,0,0.04)",
  s1: "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
  s2: "0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.85)",
  s3: "0 12px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.85)",
  s4: "0 24px 64px rgba(0,0,0,0.11), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
};

const FONT       = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const FONT_ROUND = "-apple-system, 'SF Pro Rounded', BlinkMacSystemFont, sans-serif";

// ─── Genre + Platform data ────────────────────────────────────
const GENRES = [
  { id:"parody",    label:"Parody",    color:"#D05555", bg:"rgba(208,85,85,0.10)",    emoji:"🎭" },
  { id:"comedy",    label:"Comedy",    color:"#C07830", bg:"rgba(192,120,48,0.10)",   emoji:"😂" },
  { id:"political", label:"Political", color:"#4878B4", bg:"rgba(72,120,180,0.10)",   emoji:"🏛" },
  { id:"drama",     label:"Drama",     color:"#8862B8", bg:"rgba(136,98,184,0.10)",   emoji:"🎬" },
  { id:"horror",    label:"Horror",    color:"#B83838", bg:"rgba(184,56,56,0.10)",    emoji:"👻" },
  { id:"romance",   label:"Romance",   color:"#BE6878", bg:"rgba(190,104,120,0.10)",  emoji:"💕" },
  { id:"action",    label:"Action",    color:"#B89030", bg:"rgba(184,144,48,0.10)",   emoji:"💥" },
  { id:"scifi",     label:"Sci-Fi",    color:"#4890B4", bg:"rgba(72,144,180,0.10)",   emoji:"🚀" },
  { id:"satire",    label:"Satire",    color:"#5E9070", bg:"rgba(94,144,112,0.10)",   emoji:"🗞" },
  { id:"thriller",  label:"Thriller",  color:"#B06848", bg:"rgba(176,104,72,0.10)",   emoji:"🔪" },
];

const PLATFORMS = [
  { id:"tiktok", label:"TikTok",   icon:"♪", maxSecs:60 },
  { id:"reels",  label:"Reels",    icon:"◉", maxSecs:45 },
  { id:"shorts", label:"Shorts",   icon:"▶", maxSecs:60 },
];

const ALGO_GOALS = [
  { key:"retention",    label:"Watch Time",     icon:"◷", color:"#5E9070", desc:"Hooks that prevent scroll-off" },
  { key:"comments",     label:"Comments",       icon:"◌", color:"#C07830", desc:"Lines that beg for a reply" },
  { key:"shares",       label:"Shares",         icon:"↗", color:"#4878B4", desc:"Moments people forward" },
  { key:"profileVisit", label:"Profile Visits", icon:"◈", color:"#8862B8", desc:"Curiosity that drives clicks" },
  { key:"saves",        label:"Saves",          icon:"◇", color:"#BE6878", desc:"Reference worth bookmarking" },
  { key:"rewatch",      label:"Rewatch",        icon:"↺", color:"#B83838", desc:"Hidden details rewarding return" },
];

const SCENE_TYPE_META: Record<string, { color: string; bg: string; dot: string }> = {
  HOOK:       { color:"#C05050", bg:"rgba(192,80,80,0.08)",    dot:"#C05050" },
  SETUP:      { color:"#B07830", bg:"rgba(176,120,48,0.08)",   dot:"#B07830" },
  BUILD:      { color:"#9090A0", bg:"rgba(144,144,160,0.08)",  dot:"#9090A0" },
  ESCALATE:   { color:"#B06848", bg:"rgba(176,104,72,0.08)",   dot:"#B06848" },
  TWIST:      { color:"#8862B8", bg:"rgba(136,98,184,0.08)",   dot:"#8862B8" },
  PUNCHLINE:  { color:"#C05050", bg:"rgba(192,80,80,0.08)",    dot:"#C05050" },
  CALLBACK:   { color:"#4878B4", bg:"rgba(72,120,180,0.08)",   dot:"#4878B4" },
  CLIFFHANGER:{ color:"#B83838", bg:"rgba(184,56,56,0.08)",    dot:"#B83838" },
  OUTRO:      { color:"#5E9070", bg:"rgba(94,144,112,0.08)",   dot:"#5E9070" },
};

// ─── API ──────────────────────────────────────────────────────
async function claude(system: string, user: string, search = false): Promise<any> {
  const body: any = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system,
    messages: [{ role: "user", content: user }],
  };
  if (search) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  const t = (d.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  const a = t.indexOf("{"), b2 = t.lastIndexOf("}");
  return JSON.parse(a >= 0 ? t.slice(a, b2 + 1) : t.replace(/```json|```/g, "").trim());
}

function enhanceScenePrompt(raw: string, scene: any, episode: any, genre: string, algoGoals: string[]) {
  if (!raw.trim()) return "";
  return `ENHANCEMENT ENGINE OUTPUT — execute every layer in order.

FOUNDATION: Episode "${episode.episodeTitle}" — genre: ${genre}, arc: ${episode.overallStorybeatSummary}. Scene ${scene.id} (${scene.type}) titled "${scene.title}". Story role: ${scene.storyRole}. Master style: ${episode.stylePrompt}.

CREATOR DIRECTION: "${raw}" — Establish emotional/narrative intent first. Translate to visual action, dialogue shift, and caption update that all reinforce intention without breaking arc position.

ALGORITHM LAYER: Goals: ${algoGoals.join(", ")}. Each change must serve at least one goal. Explain in algoTactic which goal and how.

CONTINUITY CONSTRAINT: Don't change scene entry/exit conditions — only transform the middle.

OUTPUT: A single regenerated scene JSON object executing all of the above simultaneously.`;
}

// ─── Main Component ───────────────────────────────────────────
export default function EpisodeStudio() {
  const [tab,           setTab]          = useState<"setup"|"timeline"|"algo"|"export">("setup");
  const [prevTab,       setPrevTab]      = useState<string>("setup");
  const [tabTransition, setTabTransition]= useState(false);
  const [genre,         setGenre]        = useState("parody");
  const [platform,      setPlatform]     = useState("tiktok");
  const [topic,         setTopic]        = useState("");
  const [algoGoals,     setAlgoGoals]    = useState(["retention","comments","shares"]);
  const [episode,       setEpisode]      = useState<any>(null);
  const [scenes,        setScenes]       = useState<any[]>([]);
  const [algoLayer,     setAlgoLayer]    = useState<any>(null);
  const [loading,       setLoading]      = useState<string|null>(null);
  const [error,         setError]        = useState<string|null>(null);
  const [prevEpisodes,  setPrevEpisodes] = useState<string[]>([]);
  const [ep2Draft,      setEp2Draft]     = useState("");

  const g = GENRES.find(x => x.id === genre)!;
  const p = PLATFORMS.find(x => x.id === platform)!;

  const switchTab = (next: "setup"|"timeline"|"algo"|"export") => {
    if (next === tab) return;
    setTabTransition(true);
    setPrevTab(tab);
    setTimeout(() => { setTab(next); setTabTransition(false); }, 160);
  };

  // ── Generate full episode ──────────────────────────────────
  const generateEpisode = async () => {
    if (!topic.trim()) return;
    setError(null); setLoading("episode"); setEpisode(null); setScenes([]); setAlgoLayer(null);
    const prevContext = prevEpisodes.length
      ? `PREVIOUS EPISODES:\n${prevEpisodes.map((e, i) => `EP${i + 1}: ${e}`).join("\n")}\nContinue the story. Reference past events. Reward loyal viewers with callbacks.`
      : "";
    try {
      const result = await claude(
        `You are a viral animated short-form content director and algorithm strategist. Respond ONLY with valid JSON — no markdown, no backticks, no preamble.`,
        `Build a complete episode production package.

TOPIC: ${topic}
GENRE: ${genre} | PLATFORM: ${platform} (max ${p.maxSecs}s)
ALGORITHM GOALS: ${algoGoals.join(", ")}
EPISODE NUMBER: ${prevEpisodes.length + 1}
${prevContext}

INSTRUCTION: Before generating any scene, establish the complete story arc. Every scene must know its position in the emotional journey. Algorithm goals must be baked into scene design — not added as afterthoughts.

Return ONLY this JSON:
{
  "episodeTitle": "...",
  "episodeNumber": ${prevEpisodes.length + 1},
  "logline": "One punchy sentence",
  "overallStorybeatSummary": "Full arc: setup → escalation → twist → resolution",
  "emotionalJourney": "The feeling progression a viewer experiences start to finish",
  "toneNotes": "How ${genre} shapes every scene's delivery",
  "stylePrompt": "Master Midjourney/DALL-E style descriptor — character design, palette, lighting, art direction",
  "totalDuration": "e.g. 54s",
  "arcBreakdown": { "act1End": 2, "act2End": 5, "act3Start": 6 },
  "scenes": [
    {
      "id": 1, "type": "HOOK", "title": "Scene name", "duration": "5s",
      "arcPosition": "Opening — establishes world and raises immediate question",
      "storyRole": "Why this scene must exist and what it sets up",
      "visual": "Exactly what the viewer sees",
      "dialogue": "Exact spoken words or [silence]",
      "caption": "On-screen text optimised for engagement",
      "imagePrompt": "Complete Midjourney prompt — include master style, mood, composition, characters",
      "animationNote": "Kling/Runway motion direction",
      "voiceNote": "ElevenLabs tone, pace, emotion",
      "algoTactic": "The specific algorithm mechanism planted here and which goal it serves",
      "engagementHook": "The exact psychological trigger in this scene"
    }
  ],
  "hashtags": ["#tag"],
  "postingStrategy": "Platform-specific timing and framing",
  "seriesHook": "What unresolved thread keeps viewers coming back for episode ${prevEpisodes.length + 2}"
}

Generate 7-9 scenes. Build real tension. Make the TWIST unexpected. End with the OUTRO creating desire for the next episode.`,
        true
      );
      setEpisode(result);
      setScenes(result.scenes || []);
      switchTab("timeline");
    } catch {
      setError("Episode generation failed — please try again.");
    }
    setLoading(null);
  };

  // ── Regenerate single scene ────────────────────────────────
  const regenScene = useCallback(async (idx: number, customPrompt: string) => {
    const sc = scenes[idx];
    setLoading(`scene-${idx}`);
    try {
      const enhanced = customPrompt
        ? enhanceScenePrompt(customPrompt, sc, episode, genre, algoGoals)
        : `Regenerate scene ${sc.id} with fresh creative energy. Keep arc position and story role identical. Improve dialogue punchiness and visual distinctiveness. Serve algorithm goals: ${algoGoals.join(", ")}.`;
      const result = await claude(
        `You are a scene director for viral animated content. Respond ONLY with a single valid JSON object — no markdown, no wrapping array.`,
        `${enhanced}

MASTER STYLE: ${episode.stylePrompt}
FULL ARC: ${episode.overallStorybeatSummary}
SCENE POSITION: Scene ${sc.id} of ${scenes.length} — type: ${sc.type}
PREVIOUS: ${idx > 0 ? `Scene ${scenes[idx-1].id} ends with: ${scenes[idx-1].visual}` : "This is the opening scene."}
NEXT: ${idx < scenes.length-1 ? `Scene ${scenes[idx+1].id} begins: ${scenes[idx+1].visual}` : "This is the final scene."}

Return ONLY this JSON:
{
  "id": ${sc.id}, "type": "${sc.type}", "title": "...", "duration": "${sc.duration}",
  "arcPosition": "...", "storyRole": "...", "visual": "...", "dialogue": "...",
  "caption": "...", "imagePrompt": "Full prompt including master style",
  "animationNote": "...", "voiceNote": "...", "algoTactic": "...", "engagementHook": "..."
}`
      );
      setScenes(prev => { const n = [...prev]; n[idx] = result; return n; });
    } catch {
      setError(`Scene ${sc.id} regeneration failed.`);
    }
    setLoading(null);
  }, [scenes, episode, genre, algoGoals]);

  // ── Generate algo analysis ─────────────────────────────────
  const generateAlgo = async () => {
    if (!episode) return;
    setLoading("algo"); setError(null);
    try {
      const result = await claude(
        `You are a platform algorithm analyst and behavioural psychologist specialising in short-form video. Respond ONLY with valid JSON.`,
        `Perform a deep algorithmic dissection of this episode.

EPISODE: "${episode.episodeTitle}" — ${genre} — ${platform}
GOALS: ${algoGoals.join(", ")}
SCENES: ${JSON.stringify(scenes.map(s => ({ id:s.id, type:s.type, title:s.title, dialogue:s.dialogue, algoTactic:s.algoTactic, engagementHook:s.engagementHook })))}

Return ONLY JSON:
{
  "overallScore": 82,
  "viralProbability": "67%",
  "platformFit": "How well this matches ${platform} algorithm patterns right now",
  "retentionCurve": [{ "sceneId":1, "predictedRetention":95, "dropRisk":"low", "tactic":"why viewers stay" }],
  "engagementBreakdown": [{ "metric":"comments", "sceneId":2, "trigger":"exact moment", "psychologicalMechanism":"why this works", "expectedLift":"+38%", "optimisedLine":"improved version" }],
  "hiddenOptimisations": [{ "type":"Rewatch Loop", "sceneId":3, "description":"planted detail that rewards second viewing", "howToAmplify":"..." }],
  "profileVisitMoments": [{ "sceneId":1, "mechanism":"what makes them visit your profile", "suggestion":"..." }],
  "shareableMoment": { "sceneId":4, "reason":"why this gets forwarded", "optimisation":"..." },
  "saveMechanism": { "sceneId":2, "reason":"why this gets bookmarked", "suggestion":"..." },
  "captionUpgrades": [{ "sceneId":1, "original":"...", "upgraded":"...", "reason":"..." }],
  "commentSeedLines": ["A line to add in caption that plants a discussion topic"],
  "firstThreeSeconds": { "currentHook": "...", "strengthScore": 8, "upgrade": "stronger version" },
  "bestPostTime": "Day + time + reasoning for ${platform}",
  "seriesRetentionStrategy": "How to tease next episode without spoiling",
  "weakestScene": { "sceneId":3, "issue":"...", "fix":"..." }
}`
      );
      setAlgoLayer(result);
      switchTab("algo");
    } catch {
      setError("Algorithm analysis failed.");
    }
    setLoading(null);
  };

  // ── Export ─────────────────────────────────────────────────
  const exportTxt = () => {
    if (!episode) return;
    const lines = [
      `EPISODE ${episode.episodeNumber}: ${episode.episodeTitle}`,
      `${platform.toUpperCase()} · ${genre.toUpperCase()} · ${episode.totalDuration}`,
      ``,
      `LOGLINE: ${episode.logline}`,
      `ARC: ${episode.overallStorybeatSummary}`,
      `EMOTIONAL JOURNEY: ${episode.emotionalJourney}`,
      `SERIES HOOK: ${episode.seriesHook}`,
      ``,
      `━━━ MASTER STYLE PROMPT ━━━`,
      episode.stylePrompt,
      ``,
      `━━━ SCENES ━━━`,
      ...scenes.map(s => [
        ``,
        `[SCENE ${s.id} · ${s.type} · ${s.duration}] ${s.title}`,
        `Arc Position:  ${s.arcPosition}`,
        `Story Role:    ${s.storyRole}`,
        `Visual:        ${s.visual}`,
        `Dialogue:      ${s.dialogue}`,
        `Caption:       ${s.caption}`,
        `Image Prompt:  ${s.imagePrompt}`,
        `Animation:     ${s.animationNote}`,
        `Voice:         ${s.voiceNote}`,
        `Algo Tactic:   ${s.algoTactic}`,
        `Eng. Hook:     ${s.engagementHook}`,
      ].join("\n")),
      ``,
      `━━━ DISTRIBUTION ━━━`,
      `Hashtags: ${episode.hashtags?.join(" ")}`,
      `Strategy: ${episode.postingStrategy}`,
      algoLayer ? [``, `━━━ ALGORITHM SCORE ━━━`, `Score: ${algoLayer.overallScore}/100 · Viral: ${algoLayer.viralProbability}`, algoLayer.platformFit, `Best Post Time: ${algoLayer.bestPostTime}`].join("\n") : "",
    ].filter(v => v !== null && v !== undefined).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ep${episode.episodeNumber}_${episode.episodeTitle.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSequel = () => {
    if (!episode) return;
    const summary = `"${episode.episodeTitle}": ${episode.overallStorybeatSummary} Series hook: ${episode.seriesHook}. Key scenes: ${scenes.map(s => `${s.type}(${s.title})`).join(", ")}.`;
    setPrevEpisodes(p => [...p, summary]);
    setEp2Draft(summary);
    setEpisode(null); setScenes([]); setAlgoLayer(null);
    setTopic(""); switchTab("setup");
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: G.bgGradient, fontFamily: FONT, color: G.ink, overflowX: "hidden" }}>
      <Style />

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: G.glassNavbar,
        backdropFilter: "blur(28px) saturate(200%)",
        WebkitBackdropFilter: "blur(28px) saturate(200%)",
        borderBottom: `1px solid ${G.borderSubtle}`,
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.05)",
        padding: "0 28px",
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 28 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: `linear-gradient(135deg, ${g.color}, ${g.color}88)`,
            boxShadow: `0 2px 8px ${g.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, transition: "all 0.3s ease",
          }}>
            {g.emoji}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: G.ink }}>
            Episode Studio
          </span>
        </div>

        {/* Tab pill selector */}
        <div style={{
          display: "flex", alignItems: "center",
          background: G.glassSubtle,
          backdropFilter: "blur(8px)",
          borderRadius: 10,
          padding: "3px",
          gap: 0,
          border: `1px solid ${G.borderMid}`,
          boxShadow: G.s0,
        }}>
          {([
            ["setup",    "Setup",     "◈"],
            ["timeline", "Timeline",  "▤"],
            ["algo",     "Algorithm", "◑"],
            ["export",   "Export",    "↑"],
          ] as const).map(([id, lbl, icon]) => (
            <button key={id} onClick={() => switchTab(id)} className="tab-pill" style={{
              height: 28, padding: "0 14px",
              background: tab === id ? G.glassStrong : "transparent",
              border: "none",
              borderRadius: 7,
              color: tab === id ? G.ink : G.inkDim,
              fontSize: 12,
              fontWeight: tab === id ? 500 : 400,
              letterSpacing: "-0.01em",
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: tab === id ? G.s1 : "none",
              fontFamily: FONT,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{icon}</span>
              {lbl}
            </button>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div className="spinner" style={{
              width: 14, height: 14, borderRadius: "50%",
              border: `1.5px solid ${G.borderMid}`,
              borderTopColor: g.color,
            }} />
            <span style={{ fontSize: 11, color: G.inkSub, letterSpacing: "-0.01em" }}>
              {loading === "episode" ? "Generating episode…"
                : loading === "algo" ? "Analysing algorithm…"
                : "Regenerating scene…"}
            </span>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div style={{
            marginLeft: loading ? 12 : "auto",
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(192,80,80,0.08)",
            border: "1px solid rgba(192,80,80,0.18)",
            borderRadius: 8, padding: "5px 10px 5px 8px",
          }}>
            <span style={{ fontSize: 10, color: "#C05050" }}>⚠</span>
            <span style={{ fontSize: 11, color: "#A04040" }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#A04040", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
          </div>
        )}
      </nav>

      {/* ── Page content with transition ── */}
      <div className={tabTransition ? "tab-exit" : "tab-enter"} style={{ minHeight: "calc(100vh - 52px)" }}>

        {/* ── SETUP ── */}
        {tab === "setup" && (
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "36px 24px" }}>

            {/* Series context banner */}
            {prevEpisodes.length > 0 && (
              <GlassCard style={{ marginBottom: 20, borderLeft: `3px solid ${G.sage}`, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Label color={G.sage} style={{ marginBottom: 6 }}>Continuing Series — Episode {prevEpisodes.length + 1}</Label>
                    {prevEpisodes.map((e, i) => (
                      <div key={i} style={{ fontSize: 12, color: G.inkSub, lineHeight: 1.6, marginTop: 3 }}>
                        <span style={{ color: G.inkFaint, fontSize: 11 }}>EP{i + 1}  </span>{e}
                      </div>
                    ))}
                  </div>
                  <GhostBtn onClick={() => { setPrevEpisodes([]); setEp2Draft(""); }} style={{ fontSize: 11, padding: "4px 10px" }}>
                    Clear history
                  </GhostBtn>
                </div>
              </GlassCard>
            )}

            {/* Topic input */}
            <GlassCard style={{ marginBottom: 20, padding: "24px 28px" }}>
              <Label style={{ marginBottom: 10 }}>What's this episode about?</Label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g. 'White Lotus Season 3 dinner scene parody' — or — 'US election debate reimagined as a cooking show'"
                className="glass-input"
                style={{
                  width: "100%", resize: "vertical",
                  background: G.glassInput,
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${G.borderMid}`,
                  borderRadius: 12,
                  color: G.ink, fontSize: 14, lineHeight: 1.65,
                  padding: "14px 16px",
                  outline: "none",
                  fontFamily: FONT,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: G.s0,
                }}
                onFocus={e => { e.target.style.borderColor = g.color + "80"; e.target.style.boxShadow = `0 0 0 3px ${g.color}18`; }}
                onBlur={e => { e.target.style.borderColor = G.borderMid; e.target.style.boxShadow = G.s0; }}
              />
            </GlassCard>

            {/* Genre + Platform row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

              {/* Genre */}
              <GlassCard style={{ padding: "20px 20px" }}>
                <Label style={{ marginBottom: 12 }}>Genre</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {GENRES.map(gn => (
                    <button key={gn.id} onClick={() => setGenre(gn.id)} className="genre-chip" style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 12,
                      cursor: "pointer", fontFamily: FONT,
                      border: genre === gn.id ? `1px solid ${gn.color}60` : `1px solid ${G.borderMid}`,
                      background: genre === gn.id ? gn.bg : "rgba(255,255,255,0.4)",
                      color: genre === gn.id ? gn.color : G.inkSub,
                      transition: "all 0.15s ease",
                      fontWeight: genre === gn.id ? 500 : 400,
                    }}>
                      <span style={{ marginRight: 4, fontSize: 11 }}>{gn.emoji}</span>{gn.label}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Platform + Goals */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <GlassCard style={{ padding: "20px 20px" }}>
                  <Label style={{ marginBottom: 10 }}>Platform</Label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {PLATFORMS.map(pl => (
                      <button key={pl.id} onClick={() => setPlatform(pl.id)} className="genre-chip" style={{
                        flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12,
                        cursor: "pointer", fontFamily: FONT,
                        border: platform === pl.id ? `1px solid ${g.color}60` : `1px solid ${G.borderMid}`,
                        background: platform === pl.id ? g.bg : "rgba(255,255,255,0.4)",
                        color: platform === pl.id ? g.color : G.inkSub,
                        transition: "all 0.15s ease",
                        fontWeight: platform === pl.id ? 500 : 400,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      }}>
                        <span style={{ fontSize: 14 }}>{pl.icon}</span>
                        <span>{pl.label}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard style={{ padding: "20px 20px", flex: 1 }}>
                  <Label style={{ marginBottom: 10 }}>Algorithm Goals</Label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                    {ALGO_GOALS.map(m => {
                      const on = algoGoals.includes(m.key);
                      return (
                        <button key={m.key} onClick={() => setAlgoGoals(p => on ? p.filter(x => x !== m.key) : [...p, m.key])} className="algo-goal" style={{
                          padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                          fontFamily: FONT,
                          border: on ? `1px solid ${m.color}50` : `1px solid ${G.borderSubtle}`,
                          background: on ? `${m.color}10` : "rgba(255,255,255,0.35)",
                          transition: "all 0.15s ease",
                        }}>
                          <div style={{ fontSize: 13, marginBottom: 2 }}>{m.icon}</div>
                          <div style={{ fontSize: 11, color: on ? m.color : G.inkSub, fontWeight: on ? 500 : 400 }}>{m.label}</div>
                          <div style={{ fontSize: 10, color: G.inkFaint, marginTop: 1, lineHeight: 1.3 }}>{m.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Generate CTA */}
            <button
              onClick={generateEpisode}
              disabled={!topic.trim() || loading === "episode"}
              className="cta-btn"
              style={{
                width: "100%", padding: "16px 0",
                background: !topic.trim() || loading === "episode"
                  ? "rgba(180,178,200,0.35)"
                  : `linear-gradient(135deg, ${g.color}E8, ${g.color}AA)`,
                border: "none", borderRadius: 14,
                color: !topic.trim() || loading === "episode" ? G.inkDim : "#fff",
                fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em",
                cursor: !topic.trim() || loading === "episode" ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: !topic.trim() || loading === "episode" ? "none" : `0 4px 24px ${g.color}40, inset 0 1px 0 rgba(255,255,255,0.25)`,
                fontFamily: FONT,
              }}
            >
              {loading === "episode" ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  Building episode…
                </span>
              ) : (
                `Generate Episode ${prevEpisodes.length + 1}`
              )}
            </button>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {tab === "timeline" && episode && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

            {/* Episode header */}
            <GlassCard style={{ padding: "24px 28px", marginBottom: 20, borderLeft: `3px solid ${g.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: g.color, textTransform: "uppercase", marginBottom: 6 }}>
                    Episode {episode.episodeNumber} · {genre} · {platform} · {episode.totalDuration}
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: G.ink, margin: 0, lineHeight: 1.2 }}>
                    {episode.episodeTitle}
                  </h1>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <GhostBtn onClick={generateAlgo} disabled={!!loading} style={{ color: G.sky }}>
                    {loading === "algo" ? "…" : "◑ Algorithm"}
                  </GhostBtn>
                  <GhostBtn onClick={() => switchTab("export")} style={{ color: g.color }}>
                    ↑ Export
                  </GhostBtn>
                </div>
              </div>

              {/* Logline */}
              <div style={{ fontSize: 14, color: G.inkMid, fontStyle: "italic", lineHeight: 1.65, marginBottom: 14, borderLeft: `2px solid ${G.borderMid}`, paddingLeft: 14 }}>
                "{episode.logline}"
              </div>

              {/* Arc summary */}
              <div style={{ fontSize: 12, color: G.inkSub, lineHeight: 1.7, marginBottom: 16 }}>
                {episode.overallStorybeatSummary}
              </div>

              {/* Emotional journey tag */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${g.color}0E`, border: `1px solid ${g.color}28`, borderRadius: 8, padding: "6px 12px", marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: g.color, letterSpacing: "0.05em" }}>EMOTIONAL ARC</span>
                <span style={{ fontSize: 12, color: G.inkSub }}>{episode.emotionalJourney}</span>
              </div>

              {/* Act bars */}
              {episode.arcBreakdown && (
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {(["Act I", "Act II", "Act III"] as const).map((act, i) => {
                    const colors = [G.rose, G.gold, G.sage];
                    const widths = [
                      episode.arcBreakdown.act1End,
                      episode.arcBreakdown.act2End - episode.arcBreakdown.act1End,
                      scenes.length - episode.arcBreakdown.act2End,
                    ];
                    return (
                      <div key={i} style={{
                        flex: widths[i] || 1, height: 24, borderRadius: 6,
                        background: `${colors[i]}14`,
                        border: `1px solid ${colors[i]}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 500, color: colors[i], letterSpacing: "0.04em",
                      }}>
                        {act}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timeline scrubber */}
              <div style={{ display: "flex", gap: 3, height: 20, alignItems: "stretch" }}>
                {scenes.map((s, i) => {
                  const meta = SCENE_TYPE_META[s.type] || { color: G.inkDim, bg: G.glassSubtle, dot: G.inkDim };
                  return (
                    <div key={i} title={`${s.type}: ${s.title}`} style={{
                      flex: parseInt(s.duration) || 4,
                      background: meta.color,
                      borderRadius: i === 0 ? "5px 2px 2px 5px" : i === scenes.length - 1 ? "2px 5px 5px 2px" : 2,
                      opacity: 0.55,
                    }} />
                  );
                })}
              </div>

              {/* Style prompt expandable */}
              <details style={{ marginTop: 14 }}>
                <summary style={{ fontSize: 11, color: G.inkDim, cursor: "pointer", userSelect: "none", letterSpacing: "-0.01em", listStyle: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 10 }}>◈</span> Master Style Prompt
                </summary>
                <div style={{ marginTop: 10, padding: "12px 14px", background: "rgba(0,0,0,0.03)", borderRadius: 8, fontSize: 12, color: G.inkSub, lineHeight: 1.7, border: `1px solid ${G.borderSubtle}` }}>
                  {episode.stylePrompt}
                  <CopyBtn text={episode.stylePrompt} style={{ marginTop: 8 }} />
                </div>
              </details>
            </GlassCard>

            {/* Scene cards */}
            {scenes.map((scene, idx) => (
              <SceneCard key={`${scene.id}-${idx}`} scene={scene} idx={idx} total={scenes.length}
                genreColor={g.color} loading={loading === `scene-${idx}`}
                onRegen={regenScene}
              />
            ))}
          </div>
        )}

        {tab === "timeline" && !episode && (
          <EmptyState msg="No episode generated yet." cta="Go to Setup" onCta={() => switchTab("setup")} />
        )}

        {/* ── ALGORITHM ── */}
        {tab === "algo" && algoLayer && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

            {/* Score banner */}
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, marginBottom: 16 }}>
              <GlassCard style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: G.inkDim, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Score</div>
                <div style={{
                  fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.04em",
                  color: algoLayer.overallScore >= 75 ? G.sage : algoLayer.overallScore >= 55 ? G.gold : G.rose,
                  fontFamily: FONT_ROUND,
                }}>
                  {algoLayer.overallScore}
                </div>
                <div style={{ fontSize: 11, color: G.inkFaint, marginTop: 2 }}>/100</div>
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: G.sky }}>{algoLayer.viralProbability}</div>
                <div style={{ fontSize: 10, color: G.inkDim }}>viral probability</div>
              </GlassCard>

              <GlassCard style={{ padding: "22px 24px" }}>
                <Label style={{ marginBottom: 8 }}>Platform Fit — {platform.toUpperCase()}</Label>
                <div style={{ fontSize: 13, color: G.inkMid, lineHeight: 1.7, marginBottom: 14 }}>{algoLayer.platformFit}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <InfoPill label="Hook Strength" value={`${algoLayer.firstThreeSeconds?.strengthScore}/10`} color={G.gold} />
                  <InfoPill label="Best Post Time" value={algoLayer.bestPostTime} color={G.sage} />
                </div>
                {algoLayer.firstThreeSeconds?.upgrade && (
                  <div style={{ padding: "10px 12px", background: `${G.gold}0C`, border: `1px solid ${G.gold}28`, borderRadius: 8, fontSize: 12, color: G.gold, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 500 }}>Hook upgrade: </span>{algoLayer.firstThreeSeconds.upgrade}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Retention curve */}
            <AlgoSection title="Retention Curve" sub="Predicted watch-time % per scene">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {algoLayer.retentionCurve?.map((r: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 11, color: G.inkDim, width: 44, flexShrink: 0, textAlign: "right" }}>SC {r.sceneId}</div>
                    <div style={{ flex: 1, height: 18, background: "rgba(0,0,0,0.04)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                      <div style={{
                        position: "absolute", inset: 0, width: `${r.predictedRetention}%`,
                        background: r.predictedRetention >= 80 ? `linear-gradient(90deg, ${G.sage}80, ${G.sage})` : r.predictedRetention >= 60 ? `linear-gradient(90deg, ${G.gold}80, ${G.gold})` : `linear-gradient(90deg, ${G.rose}80, ${G.rose})`,
                        borderRadius: 4, transition: "width 0.8s ease",
                        display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6,
                      }}>
                        <span style={{ fontSize: 10, color: "#fff", fontWeight: 500 }}>{r.predictedRetention}%</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: G.inkSub, flex: 1, lineHeight: 1.4 }}>{r.tactic}</div>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: r.dropRisk === "low" ? `${G.sage}15` : `${G.rose}15`, color: r.dropRisk === "low" ? G.sage : G.rose }}>
                      {r.dropRisk}
                    </span>
                  </div>
                ))}
              </div>
            </AlgoSection>

            {/* Engagement breakdown */}
            <AlgoSection title="Engagement Breakdown" sub="Algorithm triggers mapped to specific moments">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {algoLayer.engagementBreakdown?.map((e: any, i: number) => {
                  const m = ALGO_GOALS.find(x => x.key === e.metric) || { color: G.inkSub, icon: "•" };
                  return (
                    <div key={i} style={{ padding: "14px 16px", background: "rgba(0,0,0,0.025)", borderRadius: 10, border: `1px solid ${G.borderSubtle}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 500, color: m.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>{m.icon} {e.metric} · SC{e.sceneId}</span>
                        <span style={{ fontSize: 10, color: G.sage, background: `${G.sage}15`, padding: "1px 7px", borderRadius: 4, fontWeight: 500 }}>{e.expectedLift}</span>
                      </div>
                      <div style={{ fontSize: 12, color: G.gold, fontStyle: "italic", marginBottom: 6, lineHeight: 1.5 }}>"{e.trigger}"</div>
                      <div style={{ fontSize: 11, color: G.inkSub, marginBottom: 6, lineHeight: 1.5 }}>{e.psychologicalMechanism}</div>
                      {e.optimisedLine && (
                        <div style={{ fontSize: 11, color: G.sage, background: `${G.sage}0C`, padding: "5px 9px", borderRadius: 6, lineHeight: 1.5 }}>
                          ✦ {e.optimisedLine}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AlgoSection>

            {/* Hidden optimisations */}
            <AlgoSection title="Hidden Optimisations" sub="Invisible tactics baked into the structure">
              {algoLayer.hiddenOptimisations?.map((h: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "12px 14px", background: "rgba(0,0,0,0.025)", borderRadius: 8, marginBottom: 7, border: `1px solid ${G.borderSubtle}` }}>
                  <span style={{ color: G.violet, fontSize: 12, fontWeight: 500, minWidth: 110, flexShrink: 0 }}>SC{h.sceneId} · {h.type}</span>
                  <div>
                    <div style={{ fontSize: 12, color: G.inkSub, lineHeight: 1.6 }}>{h.description}</div>
                    <div style={{ fontSize: 11, color: G.inkDim, marginTop: 4 }}>Amplify: {h.howToAmplify}</div>
                  </div>
                </div>
              ))}
            </AlgoSection>

            {/* Caption upgrades */}
            <AlgoSection title="Caption Upgrades" sub="Optimised on-screen text per scene">
              {algoLayer.captionUpgrades?.map((c: any, i: number) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", gap: 12, padding: "12px 14px", background: "rgba(0,0,0,0.025)", borderRadius: 8, marginBottom: 7, border: `1px solid ${G.borderSubtle}`, alignItems: "start" }}>
                  <span style={{ fontSize: 11, color: G.inkDim, paddingTop: 2 }}>SC{c.sceneId}</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 500, color: G.inkFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Original</div>
                    <div style={{ fontSize: 11, color: G.inkDim, fontStyle: "italic", lineHeight: 1.5 }}>{c.original}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 500, color: G.sage, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Upgraded ✓</div>
                    <div style={{ fontSize: 11, color: G.inkMid, lineHeight: 1.5 }}>{c.upgraded}</div>
                    <div style={{ fontSize: 10, color: G.inkDim, marginTop: 3 }}>{c.reason}</div>
                  </div>
                </div>
              ))}
            </AlgoSection>

            {/* Bottom three-col */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <AlgoSection title="Comment Seeds" compact>
                {algoLayer.commentSeedLines?.map((l: string, i: number) => (
                  <div key={i} style={{ padding: "8px 10px", background: "rgba(0,0,0,0.025)", borderRadius: 6, fontSize: 11, color: G.gold, fontStyle: "italic", marginBottom: 5, lineHeight: 1.5 }}>"{l}"</div>
                ))}
              </AlgoSection>
              <AlgoSection title="Profile Visits" compact>
                {algoLayer.profileVisitMoments?.map((h: any, i: number) => (
                  <div key={i} style={{ padding: "8px 10px", background: "rgba(0,0,0,0.025)", borderRadius: 6, fontSize: 11, color: G.violet, marginBottom: 5, lineHeight: 1.5 }}>
                    <span style={{ fontSize: 10, color: G.inkDim }}>SC{h.sceneId}: </span>{h.mechanism}
                    {h.suggestion && <div style={{ fontSize: 10, color: G.inkDim, marginTop: 3 }}>→ {h.suggestion}</div>}
                  </div>
                ))}
              </AlgoSection>
              <AlgoSection title="Share & Save" compact>
                {algoLayer.shareableMoment && (
                  <div style={{ padding: "8px 10px", background: "rgba(0,0,0,0.025)", borderRadius: 6, fontSize: 11, color: G.sky, marginBottom: 5, lineHeight: 1.5 }}>
                    <span style={{ fontSize: 10, color: G.inkDim }}>SC{algoLayer.shareableMoment.sceneId}: </span>{algoLayer.shareableMoment.reason}
                    {algoLayer.shareableMoment.optimisation && <div style={{ fontSize: 10, color: G.inkDim, marginTop: 3 }}>→ {algoLayer.shareableMoment.optimisation}</div>}
                  </div>
                )}
                {algoLayer.saveMechanism && (
                  <div style={{ padding: "8px 10px", background: "rgba(0,0,0,0.025)", borderRadius: 6, fontSize: 11, color: G.rose, lineHeight: 1.5 }}>
                    <span style={{ fontSize: 10, color: G.inkDim }}>SC{algoLayer.saveMechanism.sceneId}: </span>{algoLayer.saveMechanism.reason}
                  </div>
                )}
              </AlgoSection>
            </div>

            {/* Weakest scene */}
            {algoLayer.weakestScene && (
              <GlassCard style={{ padding: "18px 22px", marginBottom: 14, border: `1px solid ${G.rose}28`, borderLeft: `3px solid ${G.rose}` }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: G.rose, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>⚠ Weakest Scene — SC{algoLayer.weakestScene.sceneId}</div>
                <div style={{ fontSize: 13, color: G.inkSub, marginBottom: 8 }}>{algoLayer.weakestScene.issue}</div>
                <div style={{ fontSize: 13, color: G.sage }}>Fix: {algoLayer.weakestScene.fix}</div>
                <GhostBtn onClick={() => switchTab("timeline")} style={{ marginTop: 12, color: G.rose }}>↩ Go fix it</GhostBtn>
              </GlassCard>
            )}

            {/* Series retention */}
            <GlassCard style={{ padding: "18px 22px", borderLeft: `3px solid ${G.sage}` }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: G.sage, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>Series Retention Strategy</div>
              <div style={{ fontSize: 13, color: G.inkSub, lineHeight: 1.7 }}>{algoLayer.seriesRetentionStrategy}</div>
            </GlassCard>
          </div>
        )}

        {tab === "algo" && !algoLayer && (
          <EmptyState msg="Run algorithm analysis from the Timeline tab." cta="Go to Timeline" onCta={() => switchTab("timeline")} />
        )}

        {/* ── EXPORT ── */}
        {tab === "export" && (
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px" }}>
            {episode ? (
              <>
                <GlassCard style={{ padding: "24px 28px", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: g.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                    EP{episode.episodeNumber} · {episode.totalDuration}
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: G.ink, margin: "0 0 22px" }}>
                    {episode.episodeTitle}
                  </h2>
                  {[
                    { icon: "↓", label: "Download full script + prompts (.txt)", color: G.sage, fn: exportTxt, btn: "Download" },
                    { icon: "◈", label: "Copy master style prompt", color: G.violet, fn: () => navigator.clipboard.writeText(episode.stylePrompt), btn: "Copy" },
                    { icon: "◈", label: "Copy all image prompts", color: G.gold, fn: () => navigator.clipboard.writeText(scenes.map(s => `SCENE ${s.id} [${s.type}]:\n${s.imagePrompt}`).join("\n\n---\n\n")), btn: "Copy" },
                    { icon: "◈", label: "Copy all hashtags", color: G.sky, fn: () => navigator.clipboard.writeText(episode.hashtags?.join(" ") || ""), btn: "Copy" },
                    { icon: "◈", label: "Copy all captions", color: G.rose, fn: () => navigator.clipboard.writeText(scenes.map(s => `SC${s.id}: ${s.caption}`).join("\n")), btn: "Copy" },
                  ].map((row, i) => <ExportRow key={i} {...row} />)}
                </GlassCard>

                {/* Sequel launcher */}
                <GlassCard style={{ padding: "24px 28px", borderLeft: `3px solid ${G.sage}` }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: G.sage, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
                    Generate Episode {episode.episodeNumber + 1}
                  </div>
                  <p style={{ fontSize: 13, color: G.inkSub, lineHeight: 1.7, marginBottom: 16 }}>
                    The Enhancement Engine compresses this episode into a structured context object. Characters remember. Unresolved threads carry forward. Returning viewers are rewarded.
                  </p>
                  <Label style={{ marginBottom: 8 }}>Episode summary — editable</Label>
                  <textarea
                    value={ep2Draft || `EP${episode.episodeNumber} "${episode.episodeTitle}": ${episode.overallStorybeatSummary} Series hook: ${episode.seriesHook}`}
                    onChange={e => setEp2Draft(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%", background: G.glassInput, border: `1px solid ${G.borderMid}`,
                      borderRadius: 10, color: G.sage, fontSize: 12, lineHeight: 1.7,
                      padding: "12px 14px", resize: "vertical", marginBottom: 14,
                      fontFamily: FONT, outline: "none",
                    }}
                  />
                  <button onClick={loadSequel} className="cta-btn" style={{
                    width: "100%", padding: "14px 0",
                    background: `linear-gradient(135deg, ${G.sage}D8, ${G.sky}AA)`,
                    border: "none", borderRadius: 12,
                    color: "#fff", fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em",
                    cursor: "pointer", fontFamily: FONT,
                    boxShadow: `0 4px 20px ${G.sage}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    transition: "all 0.2s ease",
                  }}>
                    Continue Story — Episode {episode.episodeNumber + 1}
                  </button>
                </GlassCard>
              </>
            ) : (
              <EmptyState msg="No episode generated yet." cta="Go to Setup" onCta={() => switchTab("setup")} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scene Card ────────────────────────────────────────────────
function SceneCard({ scene, idx, total, genreColor, loading, onRegen }: any) {
  const [custom, setCustom]     = useState("");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);
  const meta = SCENE_TYPE_META[scene.type] || { color: G.inkDim, bg: "rgba(0,0,0,0.04)", dot: G.inkDim };

  const copyPrompt = () => {
    navigator.clipboard.writeText(scene.imagePrompt);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="scene-card" style={{
      background: G.glass, backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: `1px solid ${G.borderMid}`,
      borderLeft: `3px solid ${meta.color}`,
      borderRadius: "0 12px 12px 0",
      padding: "18px 22px",
      marginBottom: 10,
      boxShadow: G.s2,
      opacity: loading ? 0.45 : 1,
      transition: "opacity 0.2s ease, box-shadow 0.2s ease",
    }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            background: `${meta.color}18`, color: meta.color,
            fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
            letterSpacing: "0.06em", textTransform: "uppercase",
            border: `1px solid ${meta.color}30`,
          }}>{scene.type}</span>
          <span style={{ fontSize: 14, color: G.ink, fontWeight: 500, letterSpacing: "-0.01em" }}>{scene.title}</span>
          <span style={{ fontSize: 11, color: G.inkDim }}>{scene.duration}</span>
          <span style={{ fontSize: 11, color: G.inkFaint, borderLeft: `1px solid ${G.borderMid}`, paddingLeft: 8 }}>{scene.arcPosition}</span>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="ghost-mini" style={{
          background: "rgba(0,0,0,0.04)", border: `1px solid ${G.borderSubtle}`,
          borderRadius: 6, color: G.inkSub, fontSize: 11, padding: "4px 10px",
          cursor: "pointer", fontFamily: FONT, transition: "all 0.15s",
        }}>
          {expanded ? "↑ Less" : "↓ More"}
        </button>
      </div>

      {/* Core fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
        <SceneField label="Visual" value={scene.visual} />
        <SceneField label="Dialogue" value={scene.dialogue} italic />
      </div>

      {/* Caption pill */}
      <div style={{ padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, fontSize: 12, color: G.inkSub, marginBottom: 12, border: `1px solid ${G.borderSubtle}` }}>
        <span style={{ color: G.inkFaint, marginRight: 6 }}>📱</span>{scene.caption}
      </div>

      {/* Algo tactic tag */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${G.violet}0E`, border: `1px solid ${G.violet}20`, borderRadius: 6, padding: "4px 10px", marginBottom: expanded ? 14 : 0 }}>
        <span style={{ fontSize: 9, color: G.violet }}>⚡</span>
        <span style={{ fontSize: 11, color: G.violet }}>{scene.algoTactic}</span>
      </div>

      {/* Expanded fields */}
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${G.borderSubtle}` }}>
          <SceneField label="Engagement Hook" value={scene.engagementHook} />
          <SceneField label="Story Role" value={scene.storyRole} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SceneField label="🎞 Animation" value={scene.animationNote} />
            <SceneField label="🎙 Voice" value={scene.voiceNote} />
          </div>
          {/* Image prompt */}
          <div style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${G.borderMid}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: G.inkDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>Image Prompt → Midjourney / DALL·E</span>
              <button onClick={copyPrompt} style={{
                background: "none", border: `1px solid ${copied ? G.sage : G.borderMid}`,
                borderRadius: 5, color: copied ? G.sage : G.inkDim,
                fontSize: 10, padding: "3px 9px", cursor: "pointer", fontFamily: FONT,
                transition: "all 0.15s",
              }}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div style={{ fontSize: 12, color: G.inkSub, lineHeight: 1.7 }}>{scene.imagePrompt}</div>
          </div>
        </div>
      )}

      {/* Custom direction + regen */}
      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: G.inkFaint, marginBottom: 6, letterSpacing: "0.04em" }}>
            Direction — the Enhancement Engine will expand this to fit the full arc
          </div>
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder={'e.g. "make it darker" · "add a twist" · "change punchline to be about AI"'}
            className="glass-input"
            style={{
              width: "100%", background: G.glassInput, border: `1px solid ${G.borderMid}`,
              borderRadius: 8, color: G.ink, fontSize: 12, padding: "9px 12px",
              fontFamily: FONT, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={e => { e.target.style.borderColor = genreColor + "60"; e.target.style.boxShadow = `0 0 0 3px ${genreColor}14`; }}
            onBlur={e => { e.target.style.borderColor = G.borderMid; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <button onClick={() => onRegen(idx, custom)} disabled={!!loading} style={{
          padding: "9px 16px",
          background: loading ? "rgba(0,0,0,0.04)" : `${genreColor}12`,
          border: `1px solid ${loading ? G.borderSubtle : genreColor + "40"}`,
          borderRadius: 8, color: loading ? G.inkFaint : genreColor,
          fontSize: 11, fontWeight: 500, letterSpacing: "-0.01em",
          cursor: loading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap", transition: "all 0.15s ease", fontFamily: FONT,
        }}>
          {loading ? "…" : "↺ Regen"}
        </button>
      </div>
    </div>
  );
}

// ─── Micro components ──────────────────────────────────────────
function GlassCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: G.glass,
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: `1px solid ${G.borderMid}`,
      borderRadius: 14,
      boxShadow: G.s2,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ children, color, style: s }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: color || G.inkDim, ...s }}>
      {children}
    </div>
  );
}

function GhostBtn({ children, onClick, disabled, style: s }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties }) {
  return (
    <button onClick={onClick} disabled={disabled} className="ghost-mini" style={{
      padding: "6px 12px", background: "rgba(0,0,0,0.04)",
      border: `1px solid ${G.borderMid}`, borderRadius: 8,
      color: G.inkSub, fontSize: 12, fontWeight: 400, letterSpacing: "-0.01em",
      cursor: disabled ? "not-allowed" : "pointer", fontFamily: FONT,
      transition: "all 0.15s ease", opacity: disabled ? 0.4 : 1,
      ...s,
    }}>
      {children}
    </button>
  );
}

function SceneField({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, color: G.inkFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: italic ? G.gold : G.inkMid, lineHeight: 1.65, fontStyle: italic ? "italic" : "normal" }}>{value}</div>
    </div>
  );
}

function AlgoSection({ title, sub, children, compact }: { title: string; sub?: string; children: ReactNode; compact?: boolean }) {
  return (
    <GlassCard style={{ padding: compact ? "14px 16px" : "18px 20px", marginBottom: compact ? 0 : 14 }}>
      <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, letterSpacing: "-0.01em", color: G.ink, marginBottom: sub ? 3 : 12 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: G.inkDim, marginBottom: 12 }}>{sub}</div>}
      {children}
    </GlassCard>
  );
}

function InfoPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: "10px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, border: `1px solid ${G.borderSubtle}` }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: G.inkFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function CopyBtn({ text, style: s }: { text: string; style?: CSSProperties }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", background: "none", border: `1px solid ${done ? G.sage : G.borderMid}`,
      borderRadius: 5, color: done ? G.sage : G.inkDim, fontSize: 11, fontFamily: FONT,
      cursor: "pointer", transition: "all 0.15s", ...s,
    }}>
      {done ? "✓ Copied" : "Copy"}
    </button>
  );
}

function ExportRow({ icon, label, color, fn, btn }: any) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(0,0,0,0.025)", borderRadius: 9, marginBottom: 7, border: `1px solid ${G.borderSubtle}` }}>
      <div style={{ fontSize: 13, color: G.inkMid }}>
        <span style={{ marginRight: 8, color: G.inkFaint }}>{icon}</span>{label}
      </div>
      <button onClick={() => { fn(); setDone(true); setTimeout(() => setDone(false), 1800); }} style={{
        padding: "6px 14px", background: done ? `${G.sage}14` : `${color}10`,
        border: `1px solid ${done ? G.sage : color}40`,
        borderRadius: 7, color: done ? G.sage : color,
        fontSize: 11, fontWeight: 500, letterSpacing: "-0.01em",
        fontFamily: FONT, cursor: "pointer", transition: "all 0.15s ease",
      }}>
        {done ? "✓ Done" : btn}
      </button>
    </div>
  );
}

function EmptyState({ msg, cta, onCta }: { msg: string; cta: string; onCta: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16 }}>
      <div style={{ fontSize: 13, color: G.inkDim, letterSpacing: "-0.01em" }}>{msg}</div>
      <GhostBtn onClick={onCta}>{cta}</GhostBtn>
    </div>
  );
}

// ─── Global styles ─────────────────────────────────────────────
function Style() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }

      @keyframes spin { to { transform: rotate(360deg); } }
      .spinner { animation: spin 0.75s linear infinite; display: inline-block; }

      @keyframes tabEnter {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes tabExit {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(-4px); }
      }
      .tab-enter { animation: tabEnter 0.22s cubic-bezier(0.34, 1.2, 0.64, 1) both; }
      .tab-exit  { animation: tabExit  0.14s ease both; }

      .scene-card:hover {
        box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85) !important;
        transform: translateY(-1px);
        transition: all 0.2s ease !important;
      }

      .tab-pill:hover { background: rgba(255,255,255,0.55) !important; color: #2A2848 !important; }
      .genre-chip:hover { opacity: 0.85; transform: translateY(-1px); }
      .algo-goal:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .ghost-mini:hover { background: rgba(0,0,0,0.07) !important; }
      .cta-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
      .cta-btn:active { transform: translateY(0); }

      .glass-input:focus {
        outline: none;
      }

      details > summary { list-style: none; }
      details > summary::-webkit-details-marker { display: none; }
    `}</style>
  );
}
