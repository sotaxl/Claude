"use client";

import { useState, useCallback, CSSProperties, ReactNode } from "react";

// ─── macOS 26 Tahoe — Liquid Glass design system ──────────────
const T = {
  // Animated fluid background layers
  bgBase: "#0A0E1A",

  // Glass surfaces — dark glass for Tahoe style
  glass1:  "rgba(255,255,255,0.10)",
  glass2:  "rgba(255,255,255,0.14)",
  glass3:  "rgba(255,255,255,0.18)",
  glassHover: "rgba(255,255,255,0.20)",
  navGlass: "rgba(12,16,32,0.72)",

  // Borders — bright hairlines on dark glass
  border1: "rgba(255,255,255,0.18)",
  border2: "rgba(255,255,255,0.10)",
  borderGlow: "rgba(255,255,255,0.28)",

  // Text
  textPrimary:   "rgba(255,255,255,0.96)",
  textSecondary: "rgba(255,255,255,0.65)",
  textMuted:     "rgba(255,255,255,0.38)",
  textDim:       "rgba(255,255,255,0.22)",

  // Apple system colors (Tahoe palette)
  blue:    "#0A84FF",
  teal:    "#5AC8FA",
  mint:    "#30D158",
  purple:  "#BF5AF2",
  pink:    "#FF375F",
  orange:  "#FF9F0A",
  indigo:  "#5E5CE6",
  cyan:    "#32ADE6",

  // Shadows with color
  shadowSm:  "0 2px 12px rgba(0,0,0,0.4)",
  shadowMd:  "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)",
  shadowLg:  "0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.20)",
  shadowGlow:"0 0 40px rgba(10,132,255,0.25)",

  // Border radius — everything curved
  r1: "14px",
  r2: "20px",
  r3: "28px",
  r4: "36px",
  pill: "100px",
};

const FONT = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
const FONT_ROUND = "-apple-system, 'SF Pro Rounded', BlinkMacSystemFont, sans-serif";

// ─── Genre + Platform data ────────────────────────────────────
const GENRES = [
  { id:"parody",    label:"Parody",    color:"#FF375F", glow:"rgba(255,55,95,0.3)",   emoji:"🎭" },
  { id:"comedy",    label:"Comedy",    color:"#FF9F0A", glow:"rgba(255,159,10,0.3)",  emoji:"😂" },
  { id:"political", label:"Political", color:"#0A84FF", glow:"rgba(10,132,255,0.3)",  emoji:"🏛" },
  { id:"drama",     label:"Drama",     color:"#BF5AF2", glow:"rgba(191,90,242,0.3)",  emoji:"🎬" },
  { id:"horror",    label:"Horror",    color:"#FF453A", glow:"rgba(255,69,58,0.3)",   emoji:"👻" },
  { id:"romance",   label:"Romance",   color:"#FF6B8A", glow:"rgba(255,107,138,0.3)", emoji:"💕" },
  { id:"action",    label:"Action",    color:"#FFD60A", glow:"rgba(255,214,10,0.3)",  emoji:"💥" },
  { id:"scifi",     label:"Sci-Fi",    color:"#5AC8FA", glow:"rgba(90,200,250,0.3)",  emoji:"🚀" },
  { id:"satire",    label:"Satire",    color:"#30D158", glow:"rgba(48,209,88,0.3)",   emoji:"🗞" },
  { id:"thriller",  label:"Thriller",  color:"#FF9F0A", glow:"rgba(255,159,10,0.3)",  emoji:"🔪" },
];

const PLATFORMS = [
  { id:"tiktok", label:"TikTok",  icon:"♪", maxSecs:60 },
  { id:"reels",  label:"Reels",   icon:"◉", maxSecs:45 },
  { id:"shorts", label:"Shorts",  icon:"▶", maxSecs:60 },
];

const ALGO_GOALS = [
  { key:"retention",    label:"Watch Time",     icon:"◷", color:"#30D158" },
  { key:"comments",     label:"Comments",       icon:"◌", color:"#FF9F0A" },
  { key:"shares",       label:"Shares",         icon:"↗", color:"#0A84FF" },
  { key:"profileVisit", label:"Profile Visits", icon:"◈", color:"#BF5AF2" },
  { key:"saves",        label:"Saves",          icon:"◇", color:"#FF375F" },
  { key:"rewatch",      label:"Rewatch",        icon:"↺", color:"#5AC8FA" },
];

const SCENE_COLORS: Record<string, { color: string; glow: string }> = {
  HOOK:       { color:"#FF375F", glow:"rgba(255,55,95,0.4)" },
  SETUP:      { color:"#FF9F0A", glow:"rgba(255,159,10,0.4)" },
  BUILD:      { color:"#5AC8FA", glow:"rgba(90,200,250,0.4)" },
  ESCALATE:   { color:"#FF9F0A", glow:"rgba(255,159,10,0.4)" },
  TWIST:      { color:"#BF5AF2", glow:"rgba(191,90,242,0.4)" },
  PUNCHLINE:  { color:"#FF375F", glow:"rgba(255,55,95,0.4)" },
  CALLBACK:   { color:"#0A84FF", glow:"rgba(10,132,255,0.4)" },
  CLIFFHANGER:{ color:"#FF453A", glow:"rgba(255,69,58,0.4)" },
  OUTRO:      { color:"#30D158", glow:"rgba(48,209,88,0.4)" },
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
  const r = await fetch("/api/claude", {
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
ALGORITHM LAYER: Goals: ${algoGoals.join(", ")}. Each change must serve at least one goal.
CONTINUITY CONSTRAINT: Don't change scene entry/exit conditions — only transform the middle.
OUTPUT: A single regenerated scene JSON object.`;
}

// ─── Main Component ───────────────────────────────────────────
export default function EpisodeStudio() {
  const [tab,           setTab]          = useState<"setup"|"timeline"|"algo"|"export">("setup");
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
    setTimeout(() => { setTab(next); setTabTransition(false); }, 150);
  };

  const generateEpisode = async () => {
    if (!topic.trim()) return;
    setError(null); setLoading("episode"); setEpisode(null); setScenes([]); setAlgoLayer(null);
    const prevContext = prevEpisodes.length
      ? `PREVIOUS EPISODES:\n${prevEpisodes.map((e, i) => `EP${i + 1}: ${e}`).join("\n")}\nContinue the story. Reference past events.`
      : "";
    try {
      const result = await claude(
        `You are a viral animated short-form content director. Respond ONLY with valid JSON — no markdown, no backticks.`,
        `Build a complete episode production package.
TOPIC: ${topic}
GENRE: ${genre} | PLATFORM: ${platform} (max ${p.maxSecs}s)
ALGORITHM GOALS: ${algoGoals.join(", ")}
EPISODE NUMBER: ${prevEpisodes.length + 1}
${prevContext}
Return ONLY this JSON:
{
  "episodeTitle":"...","episodeNumber":${prevEpisodes.length+1},"logline":"...","overallStorybeatSummary":"...","emotionalJourney":"...","toneNotes":"...","stylePrompt":"...","totalDuration":"...","arcBreakdown":{"act1End":2,"act2End":5,"act3Start":6},
  "scenes":[{"id":1,"type":"HOOK","title":"...","duration":"5s","arcPosition":"...","storyRole":"...","visual":"...","dialogue":"...","caption":"...","imagePrompt":"...","animationNote":"...","voiceNote":"...","algoTactic":"...","engagementHook":"..."}],
  "hashtags":["#tag"],"postingStrategy":"...","seriesHook":"..."
}
Generate 7-9 scenes. Build real tension. Make TWIST unexpected.`, true
      );
      setEpisode(result);
      setScenes(result.scenes || []);
      switchTab("timeline");
    } catch { setError("Episode generation failed — please try again."); }
    setLoading(null);
  };

  const regenScene = useCallback(async (idx: number, customPrompt: string) => {
    const sc = scenes[idx];
    setLoading(`scene-${idx}`);
    try {
      const enhanced = customPrompt
        ? enhanceScenePrompt(customPrompt, sc, episode, genre, algoGoals)
        : `Regenerate scene ${sc.id} with fresh energy. Keep arc position identical. Serve algorithm goals: ${algoGoals.join(", ")}.`;
      const result = await claude(
        `You are a scene director for viral animated content. Respond ONLY with a single valid JSON object.`,
        `${enhanced}
MASTER STYLE: ${episode.stylePrompt}
SCENE POSITION: Scene ${sc.id} of ${scenes.length} — type: ${sc.type}
PREVIOUS: ${idx > 0 ? `Scene ${scenes[idx-1].id} ends: ${scenes[idx-1].visual}` : "Opening scene."}
NEXT: ${idx < scenes.length-1 ? `Scene ${scenes[idx+1].id} begins: ${scenes[idx+1].visual}` : "Final scene."}
Return ONLY: {"id":${sc.id},"type":"${sc.type}","title":"...","duration":"${sc.duration}","arcPosition":"...","storyRole":"...","visual":"...","dialogue":"...","caption":"...","imagePrompt":"...","animationNote":"...","voiceNote":"...","algoTactic":"...","engagementHook":"..."}`
      );
      setScenes(prev => { const n = [...prev]; n[idx] = result; return n; });
    } catch { setError(`Scene ${sc.id} regen failed.`); }
    setLoading(null);
  }, [scenes, episode, genre, algoGoals]);

  const generateAlgo = async () => {
    if (!episode) return;
    setLoading("algo"); setError(null);
    try {
      const result = await claude(
        `You are a platform algorithm analyst. Respond ONLY with valid JSON.`,
        `Analyse this episode algorithmically.
EPISODE: "${episode.episodeTitle}" — ${genre} — ${platform}
GOALS: ${algoGoals.join(", ")}
SCENES: ${JSON.stringify(scenes.map(s => ({ id:s.id,type:s.type,title:s.title,dialogue:s.dialogue,algoTactic:s.algoTactic,engagementHook:s.engagementHook })))}
Return ONLY JSON:
{"overallScore":82,"viralProbability":"67%","platformFit":"...","retentionCurve":[{"sceneId":1,"predictedRetention":95,"dropRisk":"low","tactic":"..."}],"engagementBreakdown":[{"metric":"comments","sceneId":2,"trigger":"...","psychologicalMechanism":"...","expectedLift":"+38%","optimisedLine":"..."}],"hiddenOptimisations":[{"type":"Rewatch Loop","sceneId":3,"description":"...","howToAmplify":"..."}],"profileVisitMoments":[{"sceneId":1,"mechanism":"...","suggestion":"..."}],"shareableMoment":{"sceneId":4,"reason":"...","optimisation":"..."},"saveMechanism":{"sceneId":2,"reason":"...","suggestion":"..."},"captionUpgrades":[{"sceneId":1,"original":"...","upgraded":"...","reason":"..."}],"commentSeedLines":["..."],"firstThreeSeconds":{"currentHook":"...","strengthScore":8,"upgrade":"..."},"bestPostTime":"...","seriesRetentionStrategy":"...","weakestScene":{"sceneId":3,"issue":"...","fix":"..."}}`
      );
      setAlgoLayer(result);
      switchTab("algo");
    } catch { setError("Algorithm analysis failed."); }
    setLoading(null);
  };

  const exportTxt = () => {
    if (!episode) return;
    const lines = [`EPISODE ${episode.episodeNumber}: ${episode.episodeTitle}`,`${platform.toUpperCase()} · ${genre.toUpperCase()} · ${episode.totalDuration}`,"",`LOGLINE: ${episode.logline}`,`ARC: ${episode.overallStorybeatSummary}`,`EMOTIONAL JOURNEY: ${episode.emotionalJourney}`,`SERIES HOOK: ${episode.seriesHook}`,"","━━━ MASTER STYLE PROMPT ━━━",episode.stylePrompt,"","━━━ SCENES ━━━",...scenes.map(s=>[`\n[SCENE ${s.id} · ${s.type} · ${s.duration}] ${s.title}`,`Visual: ${s.visual}`,`Dialogue: ${s.dialogue}`,`Caption: ${s.caption}`,`Image Prompt: ${s.imagePrompt}`,`Animation: ${s.animationNote}`,`Voice: ${s.voiceNote}`,`Algo: ${s.algoTactic}`].join("\n")),"","━━━ DISTRIBUTION ━━━",`Hashtags: ${episode.hashtags?.join(" ")}`,`Strategy: ${episode.postingStrategy}`].join("\n");
    const blob = new Blob([lines], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`ep${episode.episodeNumber}_${episode.episodeTitle.replace(/\s+/g,"_")}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const loadSequel = () => {
    if (!episode) return;
    const summary = `"${episode.episodeTitle}": ${episode.overallStorybeatSummary} Hook: ${episode.seriesHook}. Scenes: ${scenes.map(s=>`${s.type}(${s.title})`).join(", ")}.`;
    setPrevEpisodes(p => [...p, summary]);
    setEp2Draft(summary);
    setEpisode(null); setScenes([]); setAlgoLayer(null); setTopic(""); switchTab("setup");
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:T.bgBase, fontFamily:FONT, color:T.textPrimary, overflowX:"hidden", position:"relative" }}>
      <TahoeStyles accentColor={g.color} accentGlow={g.glow} />

      {/* ── Animated fluid background ── */}
      <div className="fluid-bg" />

      {/* ── Navbar ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background:T.navGlass,
        backdropFilter:"blur(48px) saturate(200%)",
        WebkitBackdropFilter:"blur(48px) saturate(200%)",
        borderBottom:`1px solid ${T.border2}`,
        boxShadow:"0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)",
        padding:"0 24px", height:56,
        display:"flex", alignItems:"center", gap:0,
      }}>
        {/* Wordmark */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:24 }}>
          <div style={{
            width:32, height:32, borderRadius:10,
            background:`linear-gradient(135deg, ${g.color}, ${g.color}88)`,
            boxShadow:`0 4px 16px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}>{g.emoji}</div>
          <span style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.02em", color:T.textPrimary }}>Episode Studio</span>
        </div>

        {/* Pill tab selector */}
        <div style={{
          display:"flex", alignItems:"center",
          background:"rgba(255,255,255,0.08)",
          borderRadius:T.pill, padding:"4px",
          border:`1px solid ${T.border2}`,
        }}>
          {([ ["setup","Setup","◈"], ["timeline","Timeline","▤"], ["algo","Algorithm","◑"], ["export","Export","↑"] ] as const).map(([id,lbl,icon]) => (
            <button key={id} onClick={() => switchTab(id)} style={{
              height:32, padding:"0 16px",
              background: tab===id ? `linear-gradient(135deg, ${g.color}CC, ${g.color}88)` : "transparent",
              border:"none", borderRadius:T.pill,
              color: tab===id ? "#fff" : T.textMuted,
              fontSize:12, fontWeight: tab===id ? 600 : 400,
              letterSpacing:"-0.01em", cursor:"pointer",
              transition:"all 0.2s ease",
              boxShadow: tab===id ? `0 2px 12px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.25)` : "none",
              fontFamily:FONT,
              display:"flex", alignItems:"center", gap:5,
            }}>
              <span style={{ fontSize:10, opacity:0.8 }}>{icon}</span>{lbl}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            <div className="spin" style={{ width:14, height:14, borderRadius:"50%", border:`2px solid rgba(255,255,255,0.15)`, borderTopColor:g.color }} />
            <span style={{ fontSize:12, color:T.textMuted }}>
              {loading==="episode"?"Generating episode…":loading==="algo"?"Analysing…":"Regenerating…"}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginLeft:loading?"12px":"auto", display:"flex", alignItems:"center", gap:8, background:"rgba(255,55,95,0.15)", border:"1px solid rgba(255,55,95,0.3)", borderRadius:T.pill, padding:"5px 12px 5px 10px" }}>
            <span style={{ fontSize:11, color:T.pink }}>⚠ {error}</span>
            <button onClick={()=>setError(null)} style={{ background:"none",border:"none",color:T.pink,cursor:"pointer",fontSize:14,lineHeight:1,padding:0 }}>×</button>
          </div>
        )}
      </nav>

      {/* ── Page content ── */}
      <div className={tabTransition?"tab-exit":"tab-enter"} style={{ minHeight:"calc(100vh - 56px)" }}>

        {/* ── SETUP ── */}
        {tab==="setup" && (
          <div style={{ maxWidth:800, margin:"0 auto", padding:"36px 24px" }}>

            {prevEpisodes.length > 0 && (
              <TahoeCard style={{ marginBottom:20, borderLeft:`3px solid ${T.mint}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <PillLabel color={T.mint} style={{ marginBottom:8 }}>Continuing Series — Episode {prevEpisodes.length + 1}</PillLabel>
                    {prevEpisodes.map((e,i)=>(
                      <div key={i} style={{ fontSize:12, color:T.textMuted, lineHeight:1.6, marginTop:3 }}>
                        <span style={{ color:T.textDim }}>EP{i+1}  </span>{e}
                      </div>
                    ))}
                  </div>
                  <TahoeBtn onClick={()=>{ setPrevEpisodes([]); setEp2Draft(""); }} small>Clear</TahoeBtn>
                </div>
              </TahoeCard>
            )}

            {/* Topic */}
            <TahoeCard style={{ marginBottom:20, padding:"28px 32px" }}>
              <PillLabel style={{ marginBottom:12 }}>What's this episode about?</PillLabel>
              <textarea
                value={topic}
                onChange={e=>setTopic(e.target.value)}
                rows={3}
                placeholder={"e.g. 'White Lotus Season 3 dinner scene parody' or 'US election debate reimagined as a cooking show'"}
                className="tahoe-input"
                style={{
                  width:"100%", resize:"vertical",
                  background:"rgba(255,255,255,0.07)",
                  border:`1px solid ${T.border2}`,
                  borderRadius:T.r2,
                  color:T.textPrimary, fontSize:14, lineHeight:1.65,
                  padding:"16px 18px", outline:"none", fontFamily:FONT,
                  transition:"border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e=>{ e.target.style.borderColor=g.color+"80"; e.target.style.boxShadow=`0 0 0 4px ${g.glow}`; }}
                onBlur={e=>{ e.target.style.borderColor=T.border2; e.target.style.boxShadow="none"; }}
              />
            </TahoeCard>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              {/* Genre */}
              <TahoeCard style={{ padding:"24px 24px" }}>
                <PillLabel style={{ marginBottom:14 }}>Genre</PillLabel>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {GENRES.map(gn=>(
                    <button key={gn.id} onClick={()=>setGenre(gn.id)} className="tahoe-chip" style={{
                      padding:"7px 14px", borderRadius:T.pill, fontSize:12, cursor:"pointer", fontFamily:FONT,
                      border:`1px solid ${genre===gn.id ? gn.color+"60" : T.border2}`,
                      background: genre===gn.id ? `${gn.color}20` : "rgba(255,255,255,0.06)",
                      color: genre===gn.id ? gn.color : T.textMuted,
                      transition:"all 0.18s ease", fontWeight: genre===gn.id ? 600 : 400,
                      boxShadow: genre===gn.id ? `0 0 16px ${gn.glow}` : "none",
                    }}>
                      <span style={{ marginRight:5 }}>{gn.emoji}</span>{gn.label}
                    </button>
                  ))}
                </div>
              </TahoeCard>

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Platform */}
                <TahoeCard style={{ padding:"22px 24px" }}>
                  <PillLabel style={{ marginBottom:12 }}>Platform</PillLabel>
                  <div style={{ display:"flex", gap:8 }}>
                    {PLATFORMS.map(pl=>(
                      <button key={pl.id} onClick={()=>setPlatform(pl.id)} className="tahoe-chip" style={{
                        flex:1, padding:"10px 0", borderRadius:T.r2, fontSize:12, cursor:"pointer", fontFamily:FONT,
                        border:`1px solid ${platform===pl.id ? g.color+"60" : T.border2}`,
                        background: platform===pl.id ? `${g.color}20` : "rgba(255,255,255,0.06)",
                        color: platform===pl.id ? g.color : T.textMuted,
                        transition:"all 0.18s ease", fontWeight: platform===pl.id ? 600 : 400,
                        boxShadow: platform===pl.id ? `0 0 20px ${g.glow}` : "none",
                        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                      }}>
                        <span style={{ fontSize:16 }}>{pl.icon}</span>
                        <span>{pl.label}</span>
                      </button>
                    ))}
                  </div>
                </TahoeCard>

                {/* Algo goals */}
                <TahoeCard style={{ padding:"22px 24px", flex:1 }}>
                  <PillLabel style={{ marginBottom:12 }}>Algorithm Goals</PillLabel>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {ALGO_GOALS.map(m=>{
                      const on=algoGoals.includes(m.key);
                      return (
                        <button key={m.key} onClick={()=>setAlgoGoals(p=>on?p.filter(x=>x!==m.key):[...p,m.key])} className="tahoe-chip" style={{
                          padding:"10px 12px", borderRadius:T.r1, cursor:"pointer", textAlign:"left", fontFamily:FONT,
                          border:`1px solid ${on?m.color+"50":T.border2}`,
                          background: on?`${m.color}18`:"rgba(255,255,255,0.06)",
                          transition:"all 0.18s ease",
                          boxShadow: on?`0 0 16px ${m.color}30`:"none",
                        }}>
                          <div style={{ fontSize:14, marginBottom:2 }}>{m.icon}</div>
                          <div style={{ fontSize:11, color:on?m.color:T.textMuted, fontWeight:on?600:400 }}>{m.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </TahoeCard>
              </div>
            </div>

            {/* Generate CTA */}
            <button onClick={generateEpisode} disabled={!topic.trim()||loading==="episode"} className="cta-main" style={{
              width:"100%", padding:"18px 0",
              background:!topic.trim()||loading==="episode"
                ? "rgba(255,255,255,0.08)"
                : `linear-gradient(135deg, ${g.color}, ${g.color}88)`,
              border:"none", borderRadius:T.r3,
              color:!topic.trim()||loading==="episode"?T.textMuted:"#fff",
              fontSize:15, fontWeight:600, letterSpacing:"-0.01em",
              cursor:!topic.trim()||loading==="episode"?"not-allowed":"pointer",
              transition:"all 0.25s ease",
              boxShadow:!topic.trim()||loading==="episode"?"none":`0 8px 32px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
              fontFamily:FONT,
            }}>
              {loading==="episode"
                ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}><span className="spin" style={{ width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff" }} />Building episode…</span>
                : `Generate Episode ${prevEpisodes.length+1}`}
            </button>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {tab==="timeline" && episode && (
          <div style={{ maxWidth:920, margin:"0 auto", padding:"28px 24px" }}>

            {/* Episode header */}
            <TahoeCard style={{ padding:"28px 32px", marginBottom:20, boxShadow:`${T.shadowLg}, 0 0 60px ${g.glow}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:18 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:18 }}>{g.emoji}</span>
                    <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:g.color, textTransform:"uppercase", padding:"3px 10px", borderRadius:T.pill, background:`${g.color}18`, border:`1px solid ${g.color}40` }}>
                      EP{episode.episodeNumber} · {genre} · {platform} · {episode.totalDuration}
                    </span>
                  </div>
                  <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.03em", color:T.textPrimary, margin:0, lineHeight:1.15, fontFamily:FONT_ROUND }}>
                    {episode.episodeTitle}
                  </h1>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <TahoeBtn onClick={generateAlgo} disabled={!!loading} accent={T.cyan}>
                    {loading==="algo"?"…":"◑ Algorithm"}
                  </TahoeBtn>
                  <TahoeBtn onClick={()=>switchTab("export")} accent={g.color}>
                    ↑ Export
                  </TahoeBtn>
                </div>
              </div>

              <div style={{ fontSize:14, color:T.textSecondary, fontStyle:"italic", lineHeight:1.7, marginBottom:14, borderLeft:`2px solid ${g.color}50`, paddingLeft:16 }}>
                "{episode.logline}"
              </div>
              <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.7, marginBottom:16 }}>{episode.overallStorybeatSummary}</div>

              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${g.color}12`, border:`1px solid ${g.color}30`, borderRadius:T.pill, padding:"6px 14px", marginBottom:18 }}>
                <span style={{ fontSize:10, fontWeight:600, color:g.color, letterSpacing:"0.06em" }}>EMOTIONAL ARC</span>
                <span style={{ fontSize:12, color:T.textSecondary }}>{episode.emotionalJourney}</span>
              </div>

              {/* Act bars */}
              {episode.arcBreakdown && (
                <div style={{ display:"flex", gap:5, marginBottom:16 }}>
                  {(["Act I","Act II","Act III"] as const).map((act,i)=>{
                    const colors=[T.pink,T.orange,T.mint];
                    const glows=[`rgba(255,55,95,0.3)`,`rgba(255,159,10,0.3)`,`rgba(48,209,88,0.3)`];
                    const widths=[episode.arcBreakdown.act1End, episode.arcBreakdown.act2End-episode.arcBreakdown.act1End, scenes.length-episode.arcBreakdown.act2End];
                    return (
                      <div key={i} style={{ flex:widths[i]||1, height:28, borderRadius:T.pill, background:`${colors[i]}15`, border:`1px solid ${colors[i]}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, color:colors[i], letterSpacing:"0.04em", boxShadow:`0 0 12px ${glows[i]}` }}>
                        {act}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timeline scrubber */}
              <div style={{ display:"flex", gap:3, height:16, alignItems:"stretch", borderRadius:T.pill, overflow:"hidden" }}>
                {scenes.map((s,i)=>{
                  const sc=SCENE_COLORS[s.type]||{color:T.textMuted,glow:"rgba(255,255,255,0.1)"};
                  return <div key={i} title={`${s.type}: ${s.title}`} style={{ flex:parseInt(s.duration)||4, background:sc.color, opacity:0.55 }} />;
                })}
              </div>

              <details style={{ marginTop:16 }}>
                <summary style={{ fontSize:11, color:T.textDim, cursor:"pointer", userSelect:"none", listStyle:"none", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:10 }}>◈</span> Master Style Prompt
                </summary>
                <div style={{ marginTop:10, padding:"14px 16px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, fontSize:12, color:T.textMuted, lineHeight:1.7, border:`1px solid ${T.border2}` }}>
                  {episode.stylePrompt}
                  <CopyBtn text={episode.stylePrompt} style={{ marginTop:8 }} />
                </div>
              </details>
            </TahoeCard>

            {scenes.map((scene,idx)=>(
              <SceneCard key={`${scene.id}-${idx}`} scene={scene} idx={idx} total={scenes.length}
                genreColor={g.color} genreGlow={g.glow} loading={loading===`scene-${idx}`}
                onRegen={regenScene}
              />
            ))}
          </div>
        )}

        {tab==="timeline" && !episode && <EmptyState msg="No episode generated yet." cta="Go to Setup" onCta={()=>switchTab("setup")} />}

        {/* ── ALGORITHM ── */}
        {tab==="algo" && algoLayer && (
          <div style={{ maxWidth:920, margin:"0 auto", padding:"28px 24px" }}>

            {/* Score */}
            <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:16, marginBottom:16 }}>
              <TahoeCard style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 20px" }}>
                <div style={{ fontSize:10, fontWeight:600, color:T.textDim, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Score</div>
                <div style={{ fontSize:62, fontWeight:800, lineHeight:1, letterSpacing:"-0.05em", fontFamily:FONT_ROUND,
                  color:algoLayer.overallScore>=75?T.mint:algoLayer.overallScore>=55?T.orange:T.pink,
                  textShadow:algoLayer.overallScore>=75?`0 0 30px rgba(48,209,88,0.5)`:algoLayer.overallScore>=55?`0 0 30px rgba(255,159,10,0.5)`:`0 0 30px rgba(255,55,95,0.5)`,
                }}>{algoLayer.overallScore}</div>
                <div style={{ fontSize:11, color:T.textDim, marginTop:2 }}>/100</div>
                <div style={{ marginTop:12, fontSize:15, fontWeight:700, color:T.cyan, textShadow:`0 0 20px rgba(90,200,250,0.5)` }}>{algoLayer.viralProbability}</div>
                <div style={{ fontSize:10, color:T.textDim }}>viral probability</div>
              </TahoeCard>

              <TahoeCard style={{ padding:"24px 28px" }}>
                <PillLabel style={{ marginBottom:10 }}>Platform Fit — {platform.toUpperCase()}</PillLabel>
                <div style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7, marginBottom:14 }}>{algoLayer.platformFit}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  <AlgoPill label="Hook Strength" value={`${algoLayer.firstThreeSeconds?.strengthScore}/10`} color={T.orange} />
                  <AlgoPill label="Best Post Time" value={algoLayer.bestPostTime} color={T.mint} />
                </div>
                {algoLayer.firstThreeSeconds?.upgrade && (
                  <div style={{ padding:"10px 14px", background:`${T.orange}12`, border:`1px solid ${T.orange}25`, borderRadius:T.r2, fontSize:12, color:T.orange, lineHeight:1.6 }}>
                    <span style={{ fontWeight:600 }}>Hook upgrade: </span>{algoLayer.firstThreeSeconds.upgrade}
                  </div>
                )}
              </TahoeCard>
            </div>

            {/* Retention curve */}
            <AlgoSection title="Retention Curve" sub="Predicted watch-time % per scene">
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {algoLayer.retentionCurve?.map((r: any, i: number)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ fontSize:11, color:T.textDim, width:44, textAlign:"right", flexShrink:0 }}>SC {r.sceneId}</div>
                    <div style={{ flex:1, height:20, background:"rgba(255,255,255,0.06)", borderRadius:T.pill, overflow:"hidden" }}>
                      <div style={{ width:`${r.predictedRetention}%`, height:"100%", borderRadius:T.pill, transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
                        background:r.predictedRetention>=80?`linear-gradient(90deg,${T.mint}80,${T.mint})`:r.predictedRetention>=60?`linear-gradient(90deg,${T.orange}80,${T.orange})`:`linear-gradient(90deg,${T.pink}80,${T.pink})`,
                        boxShadow:r.predictedRetention>=80?`0 0 12px rgba(48,209,88,0.5)`:r.predictedRetention>=60?`0 0 12px rgba(255,159,10,0.5)`:`0 0 12px rgba(255,55,95,0.5)`,
                        display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:8,
                      }}>
                        <span style={{ fontSize:10, color:"#fff", fontWeight:700 }}>{r.predictedRetention}%</span>
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, flex:1 }}>{r.tactic}</div>
                    <span style={{ fontSize:10, padding:"2px 9px", borderRadius:T.pill, background:r.dropRisk==="low"?`${T.mint}18`:`${T.pink}18`, color:r.dropRisk==="low"?T.mint:T.pink, border:`1px solid ${r.dropRisk==="low"?T.mint+"30":T.pink+"30"}` }}>
                      {r.dropRisk}
                    </span>
                  </div>
                ))}
              </div>
            </AlgoSection>

            {/* Engagement breakdown */}
            <AlgoSection title="Engagement Breakdown" sub="Algorithm triggers mapped to specific moments">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
                {algoLayer.engagementBreakdown?.map((e: any, i: number)=>{
                  const m=ALGO_GOALS.find(x=>x.key===e.metric)||{color:T.textMuted,icon:"•"};
                  return (
                    <div key={i} style={{ padding:"16px 18px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, border:`1px solid ${T.border2}`, boxShadow:`0 0 20px ${m.color}15` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:9 }}>
                        <span style={{ fontSize:10, fontWeight:600, color:m.color, letterSpacing:"0.06em", textTransform:"uppercase" }}>{m.icon} {e.metric} · SC{e.sceneId}</span>
                        <span style={{ fontSize:10, color:T.mint, background:`${T.mint}15`, padding:"2px 8px", borderRadius:T.pill, fontWeight:600, border:`1px solid ${T.mint}30` }}>{e.expectedLift}</span>
                      </div>
                      <div style={{ fontSize:12, color:T.orange, fontStyle:"italic", marginBottom:7, lineHeight:1.5 }}>"{e.trigger}"</div>
                      <div style={{ fontSize:11, color:T.textMuted, marginBottom:7, lineHeight:1.5 }}>{e.psychologicalMechanism}</div>
                      {e.optimisedLine && <div style={{ fontSize:11, color:T.mint, background:`${T.mint}0C`, padding:"6px 10px", borderRadius:T.r1, lineHeight:1.5 }}>✦ {e.optimisedLine}</div>}
                    </div>
                  );
                })}
              </div>
            </AlgoSection>

            {/* Caption upgrades */}
            <AlgoSection title="Caption Upgrades" sub="Optimised on-screen text per scene">
              {algoLayer.captionUpgrades?.map((c: any, i: number)=>(
                <div key={i} style={{ display:"grid", gridTemplateColumns:"40px 1fr 1fr", gap:12, padding:"12px 16px", background:"rgba(255,255,255,0.04)", borderRadius:T.r2, marginBottom:8, border:`1px solid ${T.border2}`, alignItems:"start" }}>
                  <span style={{ fontSize:11, color:T.textDim, paddingTop:2 }}>SC{c.sceneId}</span>
                  <div>
                    <div style={{ fontSize:9, fontWeight:600, color:T.textDim, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Original</div>
                    <div style={{ fontSize:11, color:T.textDim, fontStyle:"italic", lineHeight:1.5 }}>{c.original}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:9, fontWeight:600, color:T.mint, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Upgraded ✓</div>
                    <div style={{ fontSize:11, color:T.textSecondary, lineHeight:1.5 }}>{c.upgraded}</div>
                    <div style={{ fontSize:10, color:T.textDim, marginTop:3 }}>{c.reason}</div>
                  </div>
                </div>
              ))}
            </AlgoSection>

            {/* Bottom 3-col */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
              <AlgoSection title="Comment Seeds" compact>
                {algoLayer.commentSeedLines?.map((l: string, i: number)=>(
                  <div key={i} style={{ padding:"9px 12px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, fontSize:11, color:T.orange, fontStyle:"italic", marginBottom:6, lineHeight:1.5, border:`1px solid ${T.border2}` }}>"{l}"</div>
                ))}
              </AlgoSection>
              <AlgoSection title="Profile Visits" compact>
                {algoLayer.profileVisitMoments?.map((h: any, i: number)=>(
                  <div key={i} style={{ padding:"9px 12px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, fontSize:11, color:T.purple, marginBottom:6, lineHeight:1.5, border:`1px solid ${T.border2}` }}>
                    <span style={{ fontSize:10, color:T.textDim }}>SC{h.sceneId}: </span>{h.mechanism}
                  </div>
                ))}
              </AlgoSection>
              <AlgoSection title="Share & Save" compact>
                {algoLayer.shareableMoment && (
                  <div style={{ padding:"9px 12px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, fontSize:11, color:T.cyan, marginBottom:6, lineHeight:1.5, border:`1px solid ${T.border2}` }}>
                    <span style={{ fontSize:10, color:T.textDim }}>SC{algoLayer.shareableMoment.sceneId}: </span>{algoLayer.shareableMoment.reason}
                  </div>
                )}
                {algoLayer.saveMechanism && (
                  <div style={{ padding:"9px 12px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, fontSize:11, color:T.pink, lineHeight:1.5, border:`1px solid ${T.border2}` }}>
                    <span style={{ fontSize:10, color:T.textDim }}>SC{algoLayer.saveMechanism.sceneId}: </span>{algoLayer.saveMechanism.reason}
                  </div>
                )}
              </AlgoSection>
            </div>

            {algoLayer.weakestScene && (
              <TahoeCard style={{ padding:"20px 24px", marginBottom:14, borderLeft:`3px solid ${T.pink}`, boxShadow:`${T.shadowMd}, 0 0 30px rgba(255,55,95,0.15)` }}>
                <div style={{ fontSize:11, fontWeight:600, color:T.pink, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>⚠ Weakest Scene — SC{algoLayer.weakestScene.sceneId}</div>
                <div style={{ fontSize:13, color:T.textMuted, marginBottom:8 }}>{algoLayer.weakestScene.issue}</div>
                <div style={{ fontSize:13, color:T.mint }}>Fix: {algoLayer.weakestScene.fix}</div>
                <TahoeBtn onClick={()=>switchTab("timeline")} style={{ marginTop:12 }} accent={T.pink} small>↩ Go fix it</TahoeBtn>
              </TahoeCard>
            )}

            <TahoeCard style={{ padding:"20px 24px", borderLeft:`3px solid ${T.mint}`, boxShadow:`${T.shadowMd}, 0 0 30px rgba(48,209,88,0.12)` }}>
              <div style={{ fontSize:11, fontWeight:600, color:T.mint, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Series Retention Strategy</div>
              <div style={{ fontSize:13, color:T.textMuted, lineHeight:1.7 }}>{algoLayer.seriesRetentionStrategy}</div>
            </TahoeCard>
          </div>
        )}

        {tab==="algo" && !algoLayer && <EmptyState msg="Run algorithm analysis from the Timeline tab." cta="Go to Timeline" onCta={()=>switchTab("timeline")} />}

        {/* ── EXPORT ── */}
        {tab==="export" && (
          <div style={{ maxWidth:700, margin:"0 auto", padding:"36px 24px" }}>
            {episode ? (
              <>
                <TahoeCard style={{ padding:"28px 32px", marginBottom:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:g.color, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6, padding:"3px 10px", background:`${g.color}18`, borderRadius:T.pill, display:"inline-block", border:`1px solid ${g.color}40` }}>
                    EP{episode.episodeNumber} · {episode.totalDuration}
                  </div>
                  <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em", color:T.textPrimary, margin:"10px 0 22px", fontFamily:FONT_ROUND }}>
                    {episode.episodeTitle}
                  </h2>
                  {[
                    { icon:"↓", label:"Download full script + prompts (.txt)", color:T.mint, fn:exportTxt, btn:"Download" },
                    { icon:"◈", label:"Copy master style prompt", color:T.purple, fn:()=>navigator.clipboard.writeText(episode.stylePrompt), btn:"Copy" },
                    { icon:"◈", label:"Copy all image prompts", color:T.orange, fn:()=>navigator.clipboard.writeText(scenes.map(s=>`SCENE ${s.id} [${s.type}]:\n${s.imagePrompt}`).join("\n\n---\n\n")), btn:"Copy" },
                    { icon:"◈", label:"Copy all hashtags", color:T.cyan, fn:()=>navigator.clipboard.writeText(episode.hashtags?.join(" ")||""), btn:"Copy" },
                    { icon:"◈", label:"Copy all captions", color:T.pink, fn:()=>navigator.clipboard.writeText(scenes.map(s=>`SC${s.id}: ${s.caption}`).join("\n")), btn:"Copy" },
                  ].map((row,i)=><ExportRow key={i} {...row} />)}
                </TahoeCard>

                <TahoeCard style={{ padding:"28px 32px", borderLeft:`3px solid ${T.mint}`, boxShadow:`${T.shadowLg}, 0 0 40px rgba(48,209,88,0.12)` }}>
                  <div style={{ fontSize:11, fontWeight:600, color:T.mint, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Generate Episode {episode.episodeNumber+1}</div>
                  <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.7, marginBottom:16 }}>The Enhancement Engine compresses this episode into a structured context object. Characters remember. Unresolved threads carry forward.</p>
                  <PillLabel style={{ marginBottom:8 }}>Episode summary — editable</PillLabel>
                  <textarea
                    value={ep2Draft || `EP${episode.episodeNumber} "${episode.episodeTitle}": ${episode.overallStorybeatSummary} Hook: ${episode.seriesHook}`}
                    onChange={e=>setEp2Draft(e.target.value)}
                    rows={4}
                    style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:`1px solid ${T.border2}`, borderRadius:T.r2, color:T.mint, fontSize:12, lineHeight:1.7, padding:"14px 16px", resize:"vertical", marginBottom:16, fontFamily:FONT, outline:"none" }}
                  />
                  <button onClick={loadSequel} className="cta-main" style={{
                    width:"100%", padding:"16px 0",
                    background:`linear-gradient(135deg, ${T.mint}CC, ${T.cyan}99)`,
                    border:"none", borderRadius:T.r2, color:"#fff",
                    fontSize:14, fontWeight:600, letterSpacing:"-0.01em",
                    cursor:"pointer", fontFamily:FONT,
                    boxShadow:`0 8px 32px rgba(48,209,88,0.3), inset 0 1px 0 rgba(255,255,255,0.25)`,
                  }}>
                    Continue Story — Episode {episode.episodeNumber+1}
                  </button>
                </TahoeCard>
              </>
            ) : (
              <EmptyState msg="No episode generated yet." cta="Go to Setup" onCta={()=>switchTab("setup")} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scene Card ────────────────────────────────────────────────
function SceneCard({ scene, idx, total, genreColor, genreGlow, loading, onRegen }: any) {
  const [custom, setCustom]     = useState("");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);
  const sc = SCENE_COLORS[scene.type] || { color:T.textMuted, glow:"rgba(255,255,255,0.1)" };

  return (
    <div className="scene-card" style={{
      background:T.glass2,
      backdropFilter:"blur(48px) saturate(200%)",
      WebkitBackdropFilter:"blur(48px) saturate(200%)",
      border:`1px solid ${T.border1}`,
      borderLeft:`3px solid ${sc.color}`,
      borderRadius:`0 ${T.r3} ${T.r3} 0`,
      padding:"20px 26px", marginBottom:12,
      boxShadow:`${T.shadowMd}, 0 0 30px ${sc.glow}22`,
      opacity:loading?0.4:1,
      transition:"opacity 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
    }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ background:`${sc.color}20`, color:sc.color, fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:T.pill, letterSpacing:"0.08em", textTransform:"uppercase", border:`1px solid ${sc.color}40`, boxShadow:`0 0 12px ${sc.glow}` }}>
            {scene.type}
          </span>
          <span style={{ fontSize:14, color:T.textPrimary, fontWeight:600, letterSpacing:"-0.01em" }}>{scene.title}</span>
          <span style={{ fontSize:11, color:T.textDim }}>{scene.duration}</span>
          <span style={{ fontSize:11, color:T.textDim, borderLeft:`1px solid ${T.border2}`, paddingLeft:8 }}>{scene.arcPosition}</span>
        </div>
        <button onClick={()=>setExpanded(e=>!e)} className="ghost-pill" style={{ background:"rgba(255,255,255,0.08)", border:`1px solid ${T.border2}`, borderRadius:T.pill, color:T.textMuted, fontSize:11, padding:"5px 12px", cursor:"pointer", fontFamily:FONT }}>
          {expanded?"↑ Less":"↓ More"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:12 }}>
        <SceneField label="Visual" value={scene.visual} />
        <SceneField label="Dialogue" value={scene.dialogue} italic />
      </div>

      <div style={{ padding:"9px 14px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, fontSize:12, color:T.textMuted, marginBottom:12, border:`1px solid ${T.border2}` }}>
        <span style={{ color:T.textDim, marginRight:6 }}>📱</span>{scene.caption}
      </div>

      <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${T.purple}15`, border:`1px solid ${T.purple}30`, borderRadius:T.pill, padding:"4px 12px", marginBottom:expanded?14:0, boxShadow:`0 0 12px rgba(191,90,242,0.2)` }}>
        <span style={{ fontSize:9, color:T.purple }}>⚡</span>
        <span style={{ fontSize:11, color:T.purple }}>{scene.algoTactic}</span>
      </div>

      {expanded && (
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border2}` }}>
          <SceneField label="Engagement Hook" value={scene.engagementHook} />
          <SceneField label="Story Role" value={scene.storyRole} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <SceneField label="🎞 Animation" value={scene.animationNote} />
            <SceneField label="🎙 Voice" value={scene.voiceNote} />
          </div>
          <div style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border1}`, borderRadius:T.r2, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
              <span style={{ fontSize:10, fontWeight:600, color:T.textDim, letterSpacing:"0.08em", textTransform:"uppercase" }}>Image Prompt → Midjourney / DALL·E</span>
              <button onClick={()=>{ navigator.clipboard.writeText(scene.imagePrompt); setCopied(true); setTimeout(()=>setCopied(false),1600); }} style={{ background:"none", border:`1px solid ${copied?T.mint:T.border1}`, borderRadius:T.pill, color:copied?T.mint:T.textDim, fontSize:10, padding:"3px 10px", cursor:"pointer", fontFamily:FONT, transition:"all 0.15s" }}>
                {copied?"✓ Copied":"Copy"}
              </button>
            </div>
            <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.7 }}>{scene.imagePrompt}</div>
          </div>
        </div>
      )}

      {/* Custom direction + regen */}
      <div style={{ marginTop:16, display:"flex", gap:8, alignItems:"flex-end" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:T.textDim, marginBottom:6 }}>Direction — Enhancement Engine expands this to fit the full arc</div>
          <input
            value={custom}
            onChange={e=>setCustom(e.target.value)}
            placeholder={'e.g. "make it darker" · "add a twist" · "change punchline"'}
            className="tahoe-input"
            style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:`1px solid ${T.border2}`, borderRadius:T.r2, color:T.textPrimary, fontSize:12, padding:"10px 14px", fontFamily:FONT, outline:"none", transition:"border-color 0.15s, box-shadow 0.15s" }}
            onFocus={e=>{ e.target.style.borderColor=genreColor+"70"; e.target.style.boxShadow=`0 0 0 4px ${genreGlow}`; }}
            onBlur={e=>{ e.target.style.borderColor=T.border2; e.target.style.boxShadow="none"; }}
          />
        </div>
        <button onClick={()=>onRegen(idx,custom)} disabled={!!loading} style={{
          padding:"10px 18px", background:loading?"rgba(255,255,255,0.06)":`${genreColor}20`,
          border:`1px solid ${loading?T.border2:genreColor+"50"}`,
          borderRadius:T.r2, color:loading?T.textDim:genreColor,
          fontSize:12, fontWeight:600, letterSpacing:"-0.01em",
          cursor:loading?"not-allowed":"pointer", whiteSpace:"nowrap",
          transition:"all 0.15s ease", fontFamily:FONT,
          boxShadow:loading?"none":`0 0 16px ${genreGlow}`,
        }}>
          {loading?"…":"↺ Regen"}
        </button>
      </div>
    </div>
  );
}

// ─── Micro components ──────────────────────────────────────────
function TahoeCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background:T.glass2,
      backdropFilter:"blur(48px) saturate(200%)",
      WebkitBackdropFilter:"blur(48px) saturate(200%)",
      border:`1px solid ${T.border1}`,
      borderRadius:T.r3,
      boxShadow:T.shadowMd,
      ...style,
      padding:(style as any)?.padding ?? "24px 28px",
    }}>
      {children}
    </div>
  );
}

function TahoeBtn({ children, onClick, disabled, accent, small, style: s }: { children:ReactNode; onClick?:()=>void; disabled?:boolean; accent?:string; small?:boolean; style?:CSSProperties }) {
  const c=accent||T.textMuted;
  return (
    <button onClick={onClick} disabled={disabled} className="ghost-pill" style={{
      padding:small?"5px 12px":"8px 16px",
      background:`${c}14`, border:`1px solid ${c}40`,
      borderRadius:T.pill, color:c,
      fontSize:small?11:12, fontWeight:500, letterSpacing:"-0.01em",
      cursor:disabled?"not-allowed":"pointer", fontFamily:FONT,
      transition:"all 0.15s ease", opacity:disabled?0.4:1,
      boxShadow:`0 0 16px ${c}20`,
      ...s,
    }}>
      {children}
    </button>
  );
}

function PillLabel({ children, color, style: s }: { children:ReactNode; color?:string; style?:CSSProperties }) {
  return (
    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:color||T.textDim, ...s }}>
      {children}
    </div>
  );
}

function SceneField({ label, value, italic }: { label:string; value:string; italic?:boolean }) {
  return (
    <div>
      <div style={{ fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:12, color:italic?T.orange:T.textSecondary, lineHeight:1.65, fontStyle:italic?"italic":"normal" }}>{value}</div>
    </div>
  );
}

function AlgoSection({ title, sub, children, compact }: { title:string; sub?:string; children:ReactNode; compact?:boolean }) {
  return (
    <TahoeCard style={{ padding:compact?"16px 18px":"20px 22px", marginBottom:compact?0:14 }}>
      <div style={{ fontSize:compact?12:13, fontWeight:700, letterSpacing:"-0.01em", color:T.textPrimary, marginBottom:sub?4:12, fontFamily:FONT_ROUND }}>{title}</div>
      {sub && <div style={{ fontSize:11, color:T.textDim, marginBottom:12 }}>{sub}</div>}
      {children}
    </TahoeCard>
  );
}

function AlgoPill({ label, value, color }: { label:string; value:string; color:string }) {
  return (
    <div style={{ padding:"10px 14px", background:"rgba(255,255,255,0.05)", borderRadius:T.r2, border:`1px solid ${T.border2}`, boxShadow:`0 0 16px ${color}20` }}>
      <div style={{ fontSize:9, fontWeight:700, color:T.textDim, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:600, color, textShadow:`0 0 16px ${color}60` }}>{value}</div>
    </div>
  );
}

function CopyBtn({ text, style: s }: { text:string; style?:CSSProperties }) {
  const [done,setDone]=useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(text); setDone(true); setTimeout(()=>setDone(false),1500); }} style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"4px 12px",background:"none",border:`1px solid ${done?T.mint:T.border1}`,borderRadius:T.pill,color:done?T.mint:T.textDim,fontSize:11,fontFamily:FONT,cursor:"pointer",transition:"all 0.15s",...s }}>
      {done?"✓ Copied":"Copy"}
    </button>
  );
}

function ExportRow({ icon, label, color, fn, btn }: any) {
  const [done,setDone]=useState(false);
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",background:"rgba(255,255,255,0.04)",borderRadius:T.r2,marginBottom:8,border:`1px solid ${T.border2}` }}>
      <div style={{ fontSize:13,color:T.textSecondary }}><span style={{ marginRight:8,color:T.textDim }}>{icon}</span>{label}</div>
      <button onClick={()=>{ fn(); setDone(true); setTimeout(()=>setDone(false),1800); }} style={{ padding:"7px 16px",background:done?`${T.mint}14`:`${color}14`,border:`1px solid ${done?T.mint:color}40`,borderRadius:T.pill,color:done?T.mint:color,fontSize:11,fontWeight:600,letterSpacing:"-0.01em",fontFamily:FONT,cursor:"pointer",transition:"all 0.15s",boxShadow:`0 0 14px ${done?`rgba(48,209,88,0.3)`:`${color}25`}` }}>
        {done?"✓ Done":btn}
      </button>
    </div>
  );
}

function EmptyState({ msg,cta,onCta }:{ msg:string;cta:string;onCta:()=>void }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:320,gap:18 }}>
      <div style={{ fontSize:13,color:T.textMuted }}>{msg}</div>
      <TahoeBtn onClick={onCta}>{cta}</TahoeBtn>
    </div>
  );
}

// ─── Global styles + animated background ──────────────────────
function TahoeStyles({ accentColor, accentGlow }: { accentColor:string; accentGlow:string }) {
  return (
    <style>{`
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 100px; }

      /* Animated fluid background */
      .fluid-bg {
        position: fixed; inset: 0; z-index: 0; pointer-events: none;
        background:
          radial-gradient(ellipse 80% 60% at 20% 20%, rgba(10,132,255,0.28) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 80% 80%, rgba(94,92,230,0.25) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 60% 10%, rgba(90,200,250,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 50% 70% at 10% 80%, rgba(191,90,242,0.15) 0%, transparent 55%),
          linear-gradient(160deg, #060A18 0%, #0D1428 40%, #080E20 100%);
        background-size: 200% 200%, 200% 200%, 200% 200%, 200% 200%, 100% 100%;
        animation: fluidShift 20s ease-in-out infinite;
      }
      @keyframes fluidShift {
        0%   { background-position: 0% 0%, 100% 100%, 50% 0%, 0% 100%, center; }
        25%  { background-position: 50% 25%, 50% 75%, 100% 50%, 50% 50%, center; }
        50%  { background-position: 100% 50%, 0% 50%, 0% 100%, 100% 0%, center; }
        75%  { background-position: 50% 75%, 50% 25%, 50% 50%, 50% 100%, center; }
        100% { background-position: 0% 0%, 100% 100%, 50% 0%, 0% 100%, center; }
      }

      /* Ensure content is above background */
      nav, .fluid-bg ~ div { position: relative; z-index: 1; }

      @keyframes spin { to { transform: rotate(360deg); } }
      .spin { animation: spin 0.7s linear infinite; display: inline-block; }

      @keyframes tabEnter { from { opacity:0; transform:translateY(8px) scale(0.99); } to { opacity:1; transform:translateY(0) scale(1); } }
      @keyframes tabExit  { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-5px); } }
      .tab-enter { animation: tabEnter 0.25s cubic-bezier(0.34,1.2,0.64,1) both; }
      .tab-exit  { animation: tabExit  0.15s ease both; }

      .scene-card:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 40px ${accentGlow} !important;
      }

      .tahoe-chip:hover { transform: translateY(-1px); filter: brightness(1.1); }
      .ghost-pill:hover { filter: brightness(1.2); transform: translateY(-1px); }
      .cta-main:hover   { transform: translateY(-2px); filter: brightness(1.08); }
      .cta-main:active  { transform: translateY(0); }

      .tahoe-input::placeholder { color: rgba(255,255,255,0.22); }

      details > summary { list-style: none; }
      details > summary::-webkit-details-marker { display: none; }
    `}</style>
  );
}
