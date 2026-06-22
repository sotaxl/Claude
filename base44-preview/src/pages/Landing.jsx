import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SetupPlanModal from '@/components/SetupPlanModal';
import { LOCAL_BUSINESSES, POPULAR_CITIES } from '@/data/localBusinessData';
import { INDUSTRY_CATEGORIES, INDUSTRIES } from '@/data/industryData';
import { useTheme } from '@/lib/ThemeContext';
import E3D from '@/components/E3D';

/* ── postcode → city mapping ──────────────────────────────────────────────── */
const PC_MAP = {
  SW:'london',SE:'london',EC:'london',WC:'london',W:'london',N:'london',NW:'london',E:'london',
  M:'manchester',B:'birmingham',LS:'manchester',S:'manchester',L:'manchester',
  G:'london',EH:'london',BS:'london',OX:'london',CB:'london',NG:'birmingham',CV:'birmingham',
  CF:'london',YO:'manchester',HG:'manchester',DN:'manchester',SY:'manchester',
};
function getRegion(pc) {
  const clean = pc.trim().toUpperCase().replace(/\s+/g,'');
  const two = clean.slice(0,2).match(/^[A-Z]{2}/)?.[0] || '';
  const one = clean[0] || '';
  return PC_MAP[two] || PC_MAP[one] || 'london';
}

/* ── inline SVG icons ─────────────────────────────────────────────────────── */
const I = {
  bolt:     (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  check:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><path d="M20 6 9 17l-5-5"/></svg>,
  arrow:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><path d="m9 18 6-6-6-6"/></svg>,
  star:     (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={p.c||''}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  calendar: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
  message:  (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>,
  chart:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  shield:   (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>,
  zap:      (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>,
  clock:    (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  menu:     (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  x:        (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.c||''}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  play:     (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor" className={p.c||''}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
};

/* ── local offers by region ───────────────────────────────────────────────── */
const LOCAL_OFFERS = {
  london: [
    { id:'lo-1', biz:'The Kettle Bakehouse', area:'Hackney', industry:'Bakery', offer:'Free pastry with any coffee order', badge:'New customer', expires:'31 May', icon:'🥐', color:'#f59e0b', light:'#fffbeb' },
    { id:'lo-2', biz:'Prime Auto Garage', area:'Brixton', industry:'Auto Repair', offer:'Free vehicle health check (worth £60)', badge:'This week only', expires:'25 May', icon:'🔧', color:'#059669', light:'#f0fdf4' },
    { id:'lo-3', biz:'Silk & Shears Studio', area:'Islington', industry:'Hair Salon', offer:'20% off your first cut & colour', badge:'New clients', expires:'30 Jun', icon:'✂️', color:'#34d399', light:'#f0fdf4' },
    { id:'lo-4', biz:'GreenThumb Gardens', area:'Wimbledon', industry:'Landscaper', offer:'Free spring tidy-up quote + 10% off', badge:'Limited', expires:'15 Jun', icon:'🌿', color:'#10b981', light:'#f0fdf4' },
  ],
  manchester: [
    { id:'lo-5', biz:'Northern Star Bakery', area:'Ancoats', industry:'Bakery', offer:'Buy 6 pastries, get 2 free', badge:'Loyalty deal', expires:'31 May', icon:'🥐', color:'#f59e0b', light:'#fffbeb' },
    { id:'lo-6', biz:'City Auto Centre', area:'Salford', industry:'Auto Repair', offer:'Free MOT reminder + £20 off repairs', badge:'New customer', expires:'30 Jun', icon:'🔧', color:'#059669', light:'#f0fdf4' },
    { id:'lo-7', biz:'The Hair Loft', area:'Northern Quarter', industry:'Hair Salon', offer:'First blow-dry free with any treatment', badge:'This month', expires:'31 May', icon:'✂️', color:'#34d399', light:'#f0fdf4' },
    { id:'lo-8', biz:'Pure Motion Yoga', area:'Didsbury', industry:'Yoga Studio', offer:'First class free — no card required', badge:'Try us out', expires:'30 Jun', icon:'🧘', color:'#10b981', light:'#f0fdf4' },
  ],
  birmingham: [
    { id:'lo-9', biz:'Jewellery Quarter Café', area:'Jewellery Quarter', industry:'Café', offer:'Free loyalty card — 10th drink free', badge:'Walk-in offer', expires:'31 May', icon:'☕', color:'#f59e0b', light:'#fffbeb' },
    { id:'lo-10', biz:'Midland Auto Repairs', area:'Digbeth', industry:'Auto Repair', offer:'Free tyre pressure & fluid check', badge:'Any visit', expires:'ongoing', icon:'🔧', color:'#059669', light:'#f0fdf4' },
    { id:'lo-11', biz:'Moseley Pet Spa', area:'Moseley', industry:'Pet Groomer', offer:'10% off first groom — any breed', badge:'New pets', expires:'30 Jun', icon:'🐾', color:'#10b981', light:'#f0fdf4' },
    { id:'lo-12', biz:'Urban Blooms', area:'Harborne', industry:'Florist', offer:'Free card & wrapping on any bouquet', badge:'This week', expires:'25 May', icon:'🌸', color:'#34d399', light:'#f0fdf4' },
  ],
};

/* ── city stats for 3D view ──────────────────────────────────────────────── */
const CITY_STATS = {
  london:     { name:'London',     adoption:68, count:81,  avgIncrease:'+34%', topFeature:'AI Booking',        color:'#10b981' },
  manchester: { name:'Manchester', adoption:54, count:34,  avgIncrease:'+28%', topFeature:'Customer Comms',    color:'#34d399' },
  birmingham: { name:'Birmingham', adoption:48, count:23,  avgIncrease:'+31%', topFeature:'Review Management', color:'#059669' },
  'new-york': { name:'New York',   adoption:72, count:52,  avgIncrease:'+38%', topFeature:'AI Booking',        color:'#f59e0b' },
  sydney:     { name:'Sydney',     adoption:61, count:27,  avgIncrease:'+32%', topFeature:'Social Content',    color:'#06b6d4' },
  default:    { name:'your area',  adoption:45, count:18,  avgIncrease:'+27%', topFeature:'Customer Comms',    color:'#10b981' },
};

/* ── journey carousel slides ─────────────────────────────────────────────── */
const REPORT_SLIDES = [
  { icon:'📄', title:'Personalised AI report', sub:'Tailored to your exact business type & trade' },
  { icon:'📊', title:'Time & cost savings', sub:'See exactly where you save most per week' },
  { icon:'💰', title:'Revenue forecast', sub:'Estimated monthly uplift if you join LocAI' },
  { icon:'📧', title:'Straight to your inbox', sub:'Free, instant, zero commitment' },
];
const PACKAGE_SLIDES = [
  { icon:'🎯', title:'Pick your features', sub:'Only pay for what your business actually needs' },
  { icon:'💷', title:'Bespoke pricing', sub:'Custom plans built around your business — no generic subscriptions' },
  { icon:'🚀', title:'Live in 48 hours', sub:'Our team handles the entire setup for you' },
  { icon:'🛡️', title:'Cancel any time', sub:'Month-to-month — no long contracts, ever' },
];

/* ── per-business-type estimates (for free report) ──────────────────────── */
const ESTIMATES = {
  bakery:       { timePerWeek:'4–6 hrs', revenuePerMonth:'£800–£1,400', bestFeature:'Order chatbot + loyalty reminders', topSaving:'Reorder messages & social posting' },
  'auto-repair':{ timePerWeek:'6–9 hrs', revenuePerMonth:'£1,200–£2,000', bestFeature:'Booking reminders + review AI', topSaving:'Phone call handling & scheduling' },
  'hair-salon': { timePerWeek:'5–8 hrs', revenuePerMonth:'£900–£1,600', bestFeature:'AI rebooking + social content', topSaving:'Appointment management & follow-ups' },
  plumber:      { timePerWeek:'7–10 hrs', revenuePerMonth:'£1,400–£2,400', bestFeature:'24/7 lead capture + call AI', topSaving:'Missed call follow-up (5 hrs/wk)' },
  'pet-groomer':{ timePerWeek:'4–6 hrs', revenuePerMonth:'£700–£1,200', bestFeature:'Breed-aware rebooking + photos', topSaving:'Appointment reminders & rebooking' },
  dentist:      { timePerWeek:'8–12 hrs', revenuePerMonth:'£2,000–£3,500', bestFeature:'Patient recall + intake AI', topSaving:'Front-desk admin & scheduling' },
  landscaper:   { timePerWeek:'5–7 hrs', revenuePerMonth:'£1,000–£1,800', bestFeature:'Route optimisation + seasonal upsells', topSaving:'Scheduling & customer follow-up' },
  florist:      { timePerWeek:'3–5 hrs', revenuePerMonth:'£600–£1,100', bestFeature:'Occasion reminders + order chatbot', topSaving:'Manual order taking & follow-ups' },
  default:      { timePerWeek:'5–8 hrs', revenuePerMonth:'£900–£1,600', bestFeature:'AI booking + customer comms', topSaving:'Routine messages & appointment reminders' },
};

const PACKAGE_FEATURES = [
  { id:'booking',   icon:'📅', label:'AI Booking & Scheduling', desc:'Capture appointments 24/7, cut no-shows 50%', price:25 },
  { id:'comms',     icon:'💬', label:'Smart Customer Comms', desc:'Auto-reply to enquiries, follow-ups, reviews', price:20 },
  { id:'analytics', icon:'📊', label:'Revenue Analytics', desc:'Dashboard showing what makes you money', price:15 },
  { id:'reputation',icon:'⭐', label:'Reputation Management', desc:'Monitor & reply to every Google/Yelp review', price:20 },
  { id:'social',    icon:'📸', label:'Social Content AI', desc:'Auto-generate posts from your photos', price:15 },
];

/* ── OptionCarousel sub-component ────────────────────────────────────────── */
function OptionCarousel({ slides, accent }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % slides.length), 3600);
    return () => clearInterval(t);
  }, [slides.length]);
  const s = slides[active];
  return (
    <div style={{padding:'20px 20px 14px',flex:1,display:'flex',flexDirection:'column',gap:12}}>
      <div key={active} style={{animation:'cFadeIn .4s ease both',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:8,minHeight:90}}>
        <E3D emoji={s.icon} size={36} delay={active * 80} />
        <div style={{fontWeight:700,fontSize:15,color:'#111'}}>{s.title}</div>
        <div style={{fontSize:13,color:'#6b7280',lineHeight:1.5}}>{s.sub}</div>
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:5,marginTop:4}}>
        {slides.map((_,i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{border:'none',cursor:'pointer',borderRadius:100,transition:'all .25s',
              width: active===i ? 18 : 6, height:6,
              background: active===i ? accent : '#d1d5db'}} />
        ))}
      </div>
    </div>
  );
}

/* ── CityCanvas 3D isometric city ────────────────────────────────────────── */
function CityCanvas({ region }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const seed = (region||'london').split('').reduce((a,c) => a+c.charCodeAt(0), 0);
    let s = seed;
    const rng = () => { s=(s*9301+49297)%233280; return s/233280; };
    const GRID=7, TW=48, TH=24;
    const OX=W/2, OY=H*0.28;
    const stats = CITY_STATS[region]||CITY_STATS.default;
    const adoptRate = stats.adoption/100;
    const buildings=[];
    for(let gx=0;gx<GRID;gx++) for(let gy=0;gy<GRID;gy++){
      const dist=Math.sqrt((gx-3)**2+(gy-3)**2);
      const h=Math.max(8,(4.2-dist)*22+(rng()-0.5)*22);
      const isAI=rng()<adoptRate;
      const skip=dist>3.3&&rng()<0.35;
      buildings.push({gx,gy,h:Math.max(6,h),isAI,skip});
    }
    buildings.sort((a,b)=>(a.gx+a.gy)-(b.gx+b.gy));
    let prog=0, animId;
    function drawB(gx,gy,bh,isAI){
      const sx=OX+(gx-gy)*TW/2, sy=OY+(gx+gy)*TH/2;
      const top=isAI?'#6ee7b7':'#e2e8f0';
      const right=isAI?'#10b981':'#94a3b8';
      const left=isAI?'#059669':'#64748b';
      // left wall
      ctx.fillStyle=left; ctx.beginPath();
      ctx.moveTo(sx-TW/2,sy+TH/2); ctx.lineTo(sx-TW/2,sy+TH/2-bh);
      ctx.lineTo(sx,sy+TH-bh); ctx.lineTo(sx,sy+TH); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.1)'; ctx.lineWidth=.5; ctx.stroke();
      // right wall
      ctx.fillStyle=right; ctx.beginPath();
      ctx.moveTo(sx+TW/2,sy+TH/2); ctx.lineTo(sx+TW/2,sy+TH/2-bh);
      ctx.lineTo(sx,sy+TH-bh); ctx.lineTo(sx,sy+TH); ctx.closePath(); ctx.fill(); ctx.stroke();
      // top face
      ctx.fillStyle=top; ctx.beginPath();
      ctx.moveTo(sx,sy-bh); ctx.lineTo(sx+TW/2,sy+TH/2-bh);
      ctx.lineTo(sx,sy+TH-bh); ctx.lineTo(sx-TW/2,sy+TH/2-bh); ctx.closePath(); ctx.fill(); ctx.stroke();
      // lit windows on AI buildings
      if(isAI&&bh>22){ const rows=Math.floor(bh/16);
        for(let r=0;r<rows;r++){ const wy=sy+TH/2-bh+10+r*14;
          ctx.fillStyle='rgba(253,246,178,.75)';
          ctx.fillRect(sx+5,wy-2,5,4); if(bh>38)ctx.fillRect(sx+14,wy-2,5,4);
        }
      }
    }
    function frame(){
      prog=Math.min(1,prog+0.022);
      const p=1-(1-prog)**3;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,W,H);
      // ground tiles
      for(const b of buildings){ if(b.skip)continue;
        const sx=OX+(b.gx-b.gy)*TW/2, sy=OY+(b.gx+b.gy)*TH/2;
        ctx.fillStyle=b.isAI?'rgba(16,185,129,.1)':'rgba(255,255,255,.03)';
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+TW/2,sy+TH/2);
        ctx.lineTo(sx,sy+TH); ctx.lineTo(sx-TW/2,sy+TH/2); ctx.closePath(); ctx.fill();
      }
      for(const b of buildings){ if(!b.skip) drawB(b.gx,b.gy,b.h*p,b.isAI); }
      if(prog<1) animId=requestAnimationFrame(frame);
    }
    animId=requestAnimationFrame(frame);
    return ()=>cancelAnimationFrame(animId);
  },[region]);
  return <canvas ref={canvasRef} width={460} height={290} style={{borderRadius:12,display:'block',maxWidth:'100%'}} />;
}

/* ── Steps Flow Banner ────────────────────────────────────────────────────── */
const SFB_SCENES = [
  /* 1 – Your Business */
  <svg key="sc1" viewBox="0 0 80 64" fill="none" style={{display:'block',width:'100%',height:'auto'}}>
    <rect width="80" height="64" fill="#f0fdf4"/>
    <ellipse cx="40" cy="62" rx="28" ry="3" fill="#a7f3d0" opacity="0.5"/>
    <rect x="12" y="30" width="56" height="32" fill="#10b981" rx="2"/>
    <polygon points="7,32 40,9 73,32" fill="#059669"/>
    <polygon points="35,13 40,9 45,13" fill="#047857"/>
    <rect x="58" y="17" width="7" height="13" fill="#047857" rx="1"/>
    <rect x="56" y="15" width="11" height="4" fill="#065f46" rx="1"/>
    <rect x="30" y="43" width="20" height="19" fill="#065f46" rx="3"/>
    <rect x="30" y="43" width="20" height="9" fill="#047857" rx="3"/>
    <circle cx="48" cy="52" r="2" fill="#34d399"/>
    <rect x="14" y="36" width="12" height="10" fill="#a7f3d0" rx="2"/>
    <rect x="54" y="36" width="12" height="10" fill="#a7f3d0" rx="2"/>
    <line x1="20" y1="36" x2="20" y2="46" stroke="#10b981" strokeWidth="0.8"/>
    <line x1="14" y1="41" x2="26" y2="41" stroke="#10b981" strokeWidth="0.8"/>
    <line x1="60" y1="36" x2="60" y2="46" stroke="#10b981" strokeWidth="0.8"/>
    <line x1="54" y1="41" x2="66" y2="41" stroke="#10b981" strokeWidth="0.8"/>
    <rect x="26" y="30" width="28" height="6" fill="#34d399" rx="1.5"/>
    <rect x="29" y="32" width="22" height="2" fill="white" opacity="0.6" rx="1"/>
    <rect x="0" y="59" width="80" height="5" fill="#dcfce7"/>
    <rect x="26" y="57" width="28" height="2" fill="#a7f3d0" rx="0.5"/>
    <circle cx="68" cy="10" r="1.5" fill="#a7f3d0"/><circle cx="74" cy="19" r="1" fill="#d1fae5"/>
  </svg>,
  /* 2 – Needs Survey */
  <svg key="sc2" viewBox="0 0 80 64" fill="none" style={{display:'block',width:'100%',height:'auto'}}>
    <rect width="80" height="64" fill="#f0fdf4"/>
    <rect x="13" y="9" width="56" height="53" fill="#d1fae5" rx="8"/>
    <rect x="10" y="6" width="56" height="53" fill="white" rx="8" stroke="#e5e7eb" strokeWidth="0.5"/>
    <rect x="10" y="6" width="56" height="14" fill="#10b981" rx="8"/>
    <rect x="10" y="14" width="56" height="6" fill="#10b981"/>
    <rect x="30" y="1" width="20" height="11" fill="#059669" rx="5"/>
    <rect x="30" y="7" width="20" height="5" fill="#059669"/>
    <rect x="33" y="2.5" width="14" height="6" fill="#34d399" rx="3"/>
    <rect x="18" y="10" width="26" height="3" fill="white" opacity="0.65" rx="1.5"/>
    <rect x="14" y="24" width="52" height="3.5" fill="#d1fae5" rx="1.75"/>
    <rect x="14" y="24" width="35" height="3.5" fill="#10b981" rx="1.75"/>
    <circle cx="49" cy="25.75" r="4.5" fill="#059669" stroke="white" strokeWidth="1.5"/>
    <rect x="14" y="32" width="9" height="9" fill="#10b981" rx="2.5"/>
    <path d="M16 36.5 L18.5 39 L23 33.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="26" y="34" width="30" height="2.5" fill="#d1fae5" rx="1.25"/>
    <rect x="26" y="38.5" width="20" height="2" fill="#e5e7eb" rx="1"/>
    <rect x="14" y="44" width="9" height="9" fill="#10b981" rx="2.5"/>
    <path d="M16 48.5 L18.5 51 L23 45.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="26" y="46" width="34" height="2.5" fill="#d1fae5" rx="1.25"/>
    <rect x="26" y="50.5" width="24" height="2" fill="#e5e7eb" rx="1"/>
    <rect x="14" y="56" width="9" height="4" fill="#d1fae5" rx="2"/>
    <rect x="26" y="57" width="20" height="2" fill="#e5e7eb" rx="1"/>
  </svg>,
  /* 3 – AI Opportunity Map */
  <svg key="sc3" viewBox="0 0 80 64" fill="none" style={{display:'block',width:'100%',height:'auto'}}>
    <rect width="80" height="64" fill="#f0fdf4"/>
    <rect x="4" y="4" width="72" height="56" fill="white" rx="6" stroke="#d1fae5" strokeWidth="1"/>
    <rect x="4" y="4" width="72" height="14" fill="#f0fdf4" rx="6"/>
    <rect x="4" y="12" width="72" height="6" fill="#f0fdf4"/>
    <line x1="4" y1="32" x2="76" y2="32" stroke="#e5e7eb" strokeWidth="4"/>
    <line x1="38" y1="4" x2="38" y2="60" stroke="#e5e7eb" strokeWidth="3"/>
    <line x1="4" y1="32" x2="76" y2="32" stroke="white" strokeWidth="1.4" strokeDasharray="5 4"/>
    <line x1="38" y1="4" x2="38" y2="60" stroke="white" strokeWidth="1.4" strokeDasharray="5 4"/>
    <line x1="22" y1="18" x2="52" y2="32" stroke="#a7f3d0" strokeWidth="1.6"/>
    <line x1="52" y1="32" x2="36" y2="50" stroke="#a7f3d0" strokeWidth="1.6"/>
    <line x1="22" y1="18" x2="36" y2="50" stroke="#a7f3d0" strokeWidth="1" strokeDasharray="3 2.5"/>
    <line x1="52" y1="32" x2="68" y2="18" stroke="#a7f3d0" strokeWidth="1.5"/>
    <line x1="22" y1="18" x2="9" y2="46" stroke="#a7f3d0" strokeWidth="1" strokeDasharray="3 2.5"/>
    <circle cx="52" cy="32" r="14" fill="#10b981" opacity="0.07"><animate attributeName="r" values="14;17;14" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.07;0.02;0.07" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="52" cy="32" r="9" fill="#10b981" opacity="0.11"/>
    <circle cx="22" cy="18" r="6" fill="#10b981"/><circle cx="22" cy="18" r="3" fill="white"/>
    <circle cx="52" cy="32" r="8.5" fill="#059669"/><circle cx="52" cy="32" r="4" fill="white"/>
    <circle cx="36" cy="50" r="5.5" fill="#34d399"/><circle cx="36" cy="50" r="2.5" fill="white"/>
    <circle cx="68" cy="18" r="4.5" fill="#10b981"/><circle cx="68" cy="18" r="2" fill="white"/>
    <circle cx="9" cy="46" r="3.5" fill="#a7f3d0"/><circle cx="9" cy="46" r="1.5" fill="white"/>
    <rect x="42" y="21" width="16" height="8" fill="#065f46" rx="4"/>
    <rect x="44" y="23.5" width="12" height="3" fill="#34d399" rx="1.5" opacity="0.8"/>
  </svg>,
  /* 4 – Recommendation */
  <svg key="sc4" viewBox="0 0 80 64" fill="none" style={{display:'block',width:'100%',height:'auto'}}>
    <rect width="80" height="64" fill="#f0fdf4"/>
    <rect x="11" y="8" width="58" height="54" fill="#d1fae5" rx="8"/>
    <rect x="8" y="5" width="58" height="54" fill="white" rx="8" stroke="#e5e7eb" strokeWidth="0.5"/>
    <rect x="8" y="5" width="58" height="19" fill="#065f46" rx="8"/>
    <rect x="8" y="18" width="58" height="6" fill="#065f46"/>
    <circle cx="20" cy="14" r="6.5" fill="#10b981"/>
    <path d="M20 10 L21.3 13.3 L25 14 L21.3 14.7 L20 18 L18.7 14.7 L15 14 L18.7 13.3 Z" fill="white"/>
    <rect x="30" y="10.5" width="24" height="2.5" fill="#a7f3d0" rx="1.25" opacity="0.85"/>
    <rect x="30" y="15.5" width="16" height="2" fill="#065f46" opacity="0.5" rx="1"/>
    <rect x="12" y="29" width="24" height="18" fill="#f0fdf4" rx="4"/>
    <text x="24" y="41" textAnchor="middle" fontSize="15" fontWeight="900" fill="#10b981" fontFamily="system-ui,sans-serif">94</text>
    <rect x="12" y="48" width="24" height="2.5" fill="#d1fae5" rx="1.25"/>
    <rect x="10" y="51" width="28" height="2" fill="#e5e7eb" rx="1"/>
    <rect x="40" y="29" width="22" height="3" fill="#10b981" rx="1.5"/>
    <rect x="40" y="35" width="16" height="3" fill="#a7f3d0" rx="1.5"/>
    <rect x="40" y="41" width="20" height="3" fill="#d1fae5" rx="1.5"/>
    <rect x="40" y="47" width="13" height="2.5" fill="#e5e7eb" rx="1.25"/>
    <rect x="10" y="55" width="54" height="2" fill="#d1fae5" rx="1"/>
  </svg>,
  /* 5 – Build Package */
  <svg key="sc5" viewBox="0 0 80 64" fill="none" style={{display:'block',width:'100%',height:'auto'}}>
    <rect width="80" height="64" fill="#f0fdf4"/>
    <rect x="19" y="3" width="42" height="60" fill="white" rx="10" stroke="#10b981" strokeWidth="1.5"/>
    <rect x="29" y="-1" width="22" height="9" fill="#10b981" rx="4.5"/>
    <rect x="29" y="4" width="22" height="5" fill="#10b981"/>
    <rect x="32" y="0.5" width="16" height="5.5" fill="#34d399" rx="2.75"/>
    <rect x="23" y="13" width="34" height="3.5" fill="#d1fae5" rx="1.75"/>
    <rect x="26" y="19" width="28" height="7" fill="#10b981" rx="3.5"/>
    <rect x="30" y="21.5" width="20" height="2.5" fill="white" opacity="0.65" rx="1.25"/>
    <rect x="23" y="30" width="34" height="1" fill="#e5e7eb" rx="0.5"/>
    <circle cx="27" cy="37" r="4.5" fill="#10b981"/><circle cx="27" cy="37" r="2.2" fill="white"/>
    <rect x="34" y="35" width="20" height="2.5" fill="#d1fae5" rx="1.25"/>
    <circle cx="27" cy="46" r="4.5" fill="#10b981"/><circle cx="27" cy="46" r="2.2" fill="white"/>
    <rect x="34" y="44" width="24" height="2.5" fill="#d1fae5" rx="1.25"/>
    <circle cx="27" cy="55" r="4.5" fill="#10b981"/><circle cx="27" cy="55" r="2.2" fill="white"/>
    <rect x="34" y="53" width="16" height="2.5" fill="#d1fae5" rx="1.25"/>
    <circle cx="67" cy="12" r="2.5" fill="#34d399"/><circle cx="13" cy="36" r="1.5" fill="#a7f3d0"/>
  </svg>,
  /* 6 – Go Live */
  <svg key="sc6" viewBox="0 0 80 64" fill="none" style={{display:'block',width:'100%',height:'auto'}}>
    <rect width="80" height="64" fill="#f0fdf4"/>
    <circle cx="40" cy="29" r="28" fill="#10b981" opacity="0.05"><animate attributeName="r" values="28;32;28" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.05;0.01;0.05" dur="2s" repeatCount="indefinite"/></circle>
    <circle cx="40" cy="29" r="21" fill="#10b981" opacity="0.08"/>
    <circle cx="40" cy="29" r="15" fill="#10b981" opacity="0.13"/>
    <circle cx="40" cy="29" r="14" fill="#10b981"/>
    <path d="M31 29 L37.5 35.5 L50 22" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M10 10 L10.7 11.8 L12.5 12.5 L10.7 13.2 L10 15 L9.3 13.2 L7.5 12.5 L9.3 11.8 Z" fill="#34d399"/>
    <path d="M70 7 L70.6 8.6 L72.2 9.2 L70.6 9.8 L70 11.4 L69.4 9.8 L67.8 9.2 L69.4 8.6 Z" fill="#10b981" opacity="0.8"/>
    <circle cx="72" cy="50" r="1.8" fill="#a7f3d0"/><circle cx="8" cy="48" r="2" fill="#34d399" opacity="0.7"/>
    <circle cx="65" cy="28" r="1.2" fill="#a7f3d0"/><circle cx="15" cy="30" r="1" fill="#d1fae5"/>
    <rect x="26" y="48" width="28" height="12" fill="#047857" rx="6"/>
    <circle cx="33.5" cy="54" r="3.5" fill="#34d399"/><circle cx="33.5" cy="54" r="1.6" fill="white"/>
    <rect x="39" y="52" width="11" height="2.5" fill="white" opacity="0.7" rx="1.25"/>
    <rect x="39" y="56" width="7" height="2" fill="white" opacity="0.4" rx="1"/>
    <rect x="13" y="16" width="5" height="2" fill="#34d399" rx="1" transform="rotate(-20 13 16)"/>
    <rect x="60" y="15" width="5" height="2" fill="#a7f3d0" rx="1" transform="rotate(20 60 15)"/>
    <rect x="17" y="43" width="4" height="1.5" fill="#10b981" rx="0.75" transform="rotate(15 17 43)"/>
    <rect x="61" y="41" width="4" height="1.5" fill="#34d399" rx="0.75" transform="rotate(-15 61 41)"/>
  </svg>,
];

function StepsFlowBanner() {
  const [hoveredStep, setHoveredStep] = useState(null);
  const [openPanel,   setOpenPanel]   = useState(null);
  const stepRefs    = useRef([]);
  const floatRefs   = useRef([]);

  const FLOW_STEPS = [
    { num:1, title:'Your Business',      hover:'Tell us about you',
      panel:[{l:'What do we need?',d:'Name, type, area & team size — 2 min'},{l:'Why it personalises results',d:'Every recommendation is shaped by your profile'},{l:'See example profiles',d:'Browse similar businesses'}] },
    { num:2, title:'Needs Survey',       hover:'Find your gaps',
      panel:[{l:'What is the survey?',d:'12 questions about how you operate today'},{l:'Survey categories',d:'Booking, comms, reviews, social & analytics'},{l:'View a sample',d:'See a completed assessment first'}] },
    { num:3, title:'AI Opportunity Map', hover:'See your potential',
      panel:[{l:'What is AI mapping?',d:'Pinpoints exactly where AI saves time & money'},{l:'By industry',d:'Opportunities specific to your trade'},{l:'Real examples',d:'Results from businesses like yours'}] },
    { num:4, title:'Recommendation',     hover:'Tailored for you',
      panel:[{l:'How it\'s built',d:'From your survey, profile & local data'},{l:'Sample report',d:'See what your AI report looks like'},{l:'Features explained',d:'Everything in plain English'}] },
    { num:5, title:'Build Package',      hover:'Design your plan',
      panel:[{l:'What\'s included?',d:'Custom plan built around your workflows'},{l:'Done For You option',d:'We build & run everything for you'},{l:'Discovery call',d:'Talk to us before committing'}] },
    { num:6, title:'Go Live',            hover:'48 hrs to launch',
      panel:[{l:'Onboarding',d:'We handle everything, you review & approve'},{l:'Purchase',d:'Secure checkout — live in 48 hours'},{l:'Free consultation',d:'Talk to us before committing'}] },
  ];

  const handleEnter = (i) => {
    const f = floatRefs.current[i];
    if (f) f.style.animationPlayState = 'paused';
    setHoveredStep(i);
  };
  const handleMove = (e, i) => {
    const el = stepRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    el.style.transform = `perspective(520px) rotateX(${(-y*9).toFixed(2)}deg) rotateY(${(x*11).toFixed(2)}deg) translateY(-6px) scale(1.06)`;
    el.style.filter    = 'drop-shadow(0 0 18px rgba(16,185,129,0.6)) drop-shadow(0 8px 22px rgba(0,0,0,0.1))';
  };
  const handleLeave = (i) => {
    const el = stepRefs.current[i];
    const f  = floatRefs.current[i];
    if (el) {
      el.style.transition = 'transform 420ms cubic-bezier(0.23,1,0.32,1),filter 280ms ease';
      el.style.transform  = '';
      el.style.filter     = '';
      setTimeout(() => { if (el) el.style.transition = ''; }, 440);
    }
    if (f) setTimeout(() => { f.style.animationPlayState = 'running'; }, 440);
    setHoveredStep(null);
  };

  useEffect(() => {
    const close = () => setOpenPanel(null);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div style={{width:'100%',padding:'6px 0 14px'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        {FLOW_STEPS.map((step, i) => {
          const isHov       = hoveredStep === i;
          const isPanelOpen = openPanel   === i;
          return (
            <React.Fragment key={step.num}>
              <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 4px',position:'relative'}}>
                {/* Float wrapper (animates Y only — separate from 3D tilt) */}
                <div ref={el => floatRefs.current[i] = el}
                  style={{width:'100%',animation:`sfbFloat ${3.4+i*0.15}s ease-in-out ${i*0.36}s infinite`}}>
                  {/* 3D tilt + glow target */}
                  <div
                    ref={el => stepRefs.current[i] = el}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseMove={e => handleMove(e, i)}
                    onMouseLeave={() => handleLeave(i)}
                    onClick={e => { e.stopPropagation(); setOpenPanel(p => p===i ? null : i); }}
                    style={{
                      width:'100%',borderRadius:12,overflow:'hidden',cursor:'pointer',
                      filter: isPanelOpen ? 'drop-shadow(0 0 18px rgba(16,185,129,0.65)) drop-shadow(0 4px 12px rgba(0,0,0,0.09))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.07))',
                      willChange:'transform',position:'relative',
                    }}
                  >
                    <div style={{
                      position:'absolute',top:7,left:7,zIndex:3,
                      width:18,height:18,borderRadius:'50%',
                      background: isPanelOpen ? '#047857' : '#059669',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:8,fontWeight:800,color:'white',fontFamily:'monospace',
                      boxShadow:'0 1px 5px rgba(16,185,129,0.55)',
                      transition:'background 200ms ease',
                    }}>{step.num}</div>
                    {SFB_SCENES[i]}
                  </div>
                </div>
                {/* Sliding label */}
                <div style={{position:'relative',height:34,width:'100%',overflow:'hidden',marginTop:7,textAlign:'center'}}>
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:3,
                    transition:'transform 220ms cubic-bezier(0.23,1,0.32,1),opacity 140ms ease',
                    transform:isHov?'translateY(-110%)':'translateY(0)',opacity:isHov?0:1}}>
                    <span style={{fontSize:10,fontWeight:600,color:'#6b7280',letterSpacing:'0.02em',lineHeight:1.4}}>{step.title}</span>
                  </div>
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:3,
                    transition:'transform 220ms cubic-bezier(0.23,1,0.32,1),opacity 140ms ease',
                    transform:isHov?'translateY(0)':'translateY(110%)',opacity:isHov?1:0}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#059669',letterSpacing:'0.02em',lineHeight:1.4}}>{step.hover}</span>
                  </div>
                </div>
                {/* Dropdown panel */}
                {isPanelOpen && (
                  <div onClick={e=>e.stopPropagation()} style={{
                    position:'absolute',top:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',
                    zIndex:500,width:236,background:dk.bgCard,
                    border:'1px solid rgba(16,185,129,0.2)',borderRadius:14,
                    boxShadow:'0 8px 32px rgba(0,0,0,0.1),0 0 0 1px rgba(16,185,129,0.06)',
                    overflow:'hidden',animation:'stepPanelIn 260ms cubic-bezier(0.23,1,0.32,1) both',
                  }}>
                    <div style={{padding:'9px 13px 7px',borderBottom:'1px solid #f3f4f6',background:dk.bgCardAlt}}>
                      <div style={{fontSize:8,fontWeight:800,color:'#10b981',textTransform:'uppercase',letterSpacing:1.6,marginBottom:1}}>Step {step.num}</div>
                      <div style={{fontSize:11,fontWeight:700,color:'#111827'}}>{step.title}</div>
                    </div>
                    {step.panel.map((item,si) => (
                      <button key={si} style={{display:'block',width:'100%',textAlign:'left',
                        padding:'9px 13px',border:'none',
                        borderBottom:si<step.panel.length-1?'1px solid #f9fafb':'none',
                        background:'none',cursor:'pointer',transition:'background 130ms ease',
                        animation:`stepItemIn 180ms ${50+si*45}ms ease-out both`,
                      }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
                        onMouseLeave={e=>e.currentTarget.style.background='none'}
                      >
                        <div style={{fontSize:10,fontWeight:600,color:'#374151',marginBottom:2}}>{item.l}</div>
                        <div style={{fontSize:9,color:'#9ca3af',lineHeight:1.4}}>{item.d}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Map road connector */}
              {i < FLOW_STEPS.length - 1 && (
                <div style={{flexShrink:0,width:38,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:32}}>
                  <svg width="38" height="20" viewBox="0 0 38 20" fill="none">
                    <path d="M0 10 C6 2,12 18,19 10 S32 2,38 10" stroke="#d1fae5" strokeWidth="7" fill="none" strokeLinecap="round"/>
                    <path d="M0 10 C6 2,12 18,19 10 S32 2,38 10" stroke="#a7f3d0" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M0 10 C6 2,12 18,19 10 S32 2,38 10" stroke="white" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeDasharray="3.5 3"/>
                    <path d="M31 6.5 L38 10 L31 13.5" stroke="#10b981" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── data ─────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>
      </svg>
    ),
    dark: true,
    title: 'AI Booking & Scheduling',
    body: 'Capture appointments 24/7. AI fills gaps, sends reminders, and cuts no-shows by up to 50% — without you lifting a finger.',
    stat: '−50% no-shows',
    float: { label: 'Booking confirmed', sub: 'Sarah J. · just now' },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
        <path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>
      </svg>
    ),
    dark: false,
    title: 'Smart Customer Comms',
    body: 'AI handles every enquiry, follow-up, and review reply — instantly, personally, and always on-brand. Six hours saved every week.',
    stat: '6 hrs/wk saved',
    float: { label: 'Reply sent by AI', sub: '0.3 s · 2 min ago' },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    dark: false,
    title: 'Revenue Analytics',
    body: 'See exactly which services make you money, when your peak hours are, and where leads drop off — in a dashboard built for owners, not analysts.',
    stat: '+38% revenue',
    float: { label: 'Revenue up +£1,240', sub: 'this month · vs last' },
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="m12 2-3.09 6.26L2 9.27l5 4.87L5.82 21 12 17.77 18.18 21 17 14.14l5-4.87-6.91-1.01L12 2z"/>
      </svg>
    ),
    dark: false,
    title: 'Reputation Management',
    body: 'AI monitors Google, Yelp, and social — drafting personalised replies to every review and alerting you when something needs your attention.',
    stat: '4.8→4.9★ avg',
    float: { label: '5-star review received', sub: 'Google · 4 min ago' },
  },
];

const IND_ICONS = {
  'local-bakery': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M6 10C6 7 8.686 4 12 4s6 3 6 6"/>
      <rect x="3" y="10" width="18" height="4" rx="1"/>
      <path d="M5 14v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/>
      <path d="M9 14v5"/><path d="M15 14v5"/>
    </svg>
  ),
  'auto-repair': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  'hair-salon': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  ),
  'plumber': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M12 22V12"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
      <path d="M8 12a4 4 0 0 1 8 0"/>
      <path d="M12 12V2"/>
    </svg>
  ),
  'pet-groomer': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/>
      <circle cx="20" cy="16" r="2"/><circle cx="4" cy="8" r="2"/>
      <circle cx="4" cy="16" r="2"/>
      <path d="M12 17c-2.8 0-5-2.2-5-5 0-1.7.9-3.2 2.2-4.1"/>
      <path d="M12 17c2.8 0 5-2.2 5-5 0-1.7-.9-3.2-2.2-4.1"/>
      <path d="M8.5 21.5A3.5 3.5 0 0 1 12 19a3.5 3.5 0 0 1 3.5 2.5"/>
    </svg>
  ),
  'florist': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M12 22V13"/><path d="M12 13a5 5 0 0 0 5-5c0-2.76-2.24-5-5-5S7 5.24 7 8a5 5 0 0 0 5 5z"/>
      <path d="M12 13c-1.1-2.3-3.7-3.5-6-2.5"/>
      <path d="M12 13c1.1-2.3 3.7-3.5 6-2.5"/>
      <path d="M7 22h10"/>
    </svg>
  ),
  'dentist': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M12 2c-1.6 0-3 .8-3.8 2.1C7.4 3 6.2 2.5 5 2.5 3.1 2.5 2 4 2 5.8 2 10 7 15 12 22c5-7 10-12 10-16.2C22 4 20.9 2.5 19 2.5c-1.2 0-2.4.5-3.2 1.6C14.9 2.8 13.6 2 12 2z"/>
    </svg>
  ),
  'landscaper': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M12 22V10"/><path d="M5 22V16"/><path d="M19 22V16"/>
      <path d="M12 10C12 10 7 8 7 4a5 5 0 0 1 10 0c0 4-5 6-5 6z"/>
      <path d="M5 16c0-2 2-4 7-4"/>
      <path d="M19 16c0-2-2-4-7-4"/>
    </svg>
  ),
  'yoga-studio': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <circle cx="12" cy="3" r="1.5"/>
      <path d="M12 5v6l-4 3"/><path d="M12 11l4 3"/>
      <path d="M8 14l-2 6"/><path d="M16 14l2 6"/>
      <path d="M6 20h4"/><path d="M14 20h4"/>
    </svg>
  ),
  'electrician': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  'caterer': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M3 11c0-4.4 4-8 9-8s9 3.6 9 8"/>
      <line x1="2" y1="11" x2="22" y2="11"/>
      <path d="M12 11v4"/><path d="M8 19h8"/><path d="M9 15h6a1 1 0 0 1 1 1v3H8v-3a1 1 0 0 1 1-1z"/>
    </svg>
  ),
  'photographer': (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  ),
};

// INDUSTRIES imported from @/data/industryData

const TESTIMONIALS = [
  {
    quote: "I was answering booking messages until 11pm every night. Now I check my dashboard once a day and AI has done everything. First week we had three extra bookings we'd have missed.",
    name: 'Sarah M.', role: 'Owner, hair salon · Manchester',
    avatar: 'SM', stars: 5,
  },
  {
    quote: "I was sceptical — I'm a plumber, not a tech person. But the setup was just a phone call. Two days later AI was answering my leads and I was fitting an extra two jobs a week.",
    name: 'Dave K.', role: 'Owner, plumbing business · London',
    avatar: 'DK', stars: 5,
  },
  {
    quote: "Our no-show rate went from 22% down to 8% in the first month. That's the equivalent of hiring a full-time receptionist for £49 a month.",
    name: 'Priya S.', role: 'Practice manager, dental clinic · Birmingham',
    avatar: 'PS', stars: 5,
  },
];

const STEPS = [
  { num: '01', title: 'Tell us about your business', body: 'Fill in a 3-minute form about your industry, current tools, and goals. No tech knowledge needed.', time: '3 min' },
  { num: '02', title: 'We configure your AI',        body: 'Our team builds and connects your AI tools to your booking system, Google profile, and social accounts.', time: '48 hrs' },
  { num: '03', title: 'Go live and grow',             body: 'Your AI handles bookings, messages, reviews, and content from day one. You just check the dashboard.', time: 'Day 1' },
];

const OFFERINGS = [
  {
    tag: 'Custom Plan',
    headline: 'Your bespoke AI blueprint',
    sub: 'We audit your business, design the exact AI stack you need, and hand you a step-by-step integration plan — built around how you actually work.',
    price: 'Priced per project',
    highlight: false,
    cta: 'Get my custom plan →',
    ctaAction: 'setup',
    features: [
      'Full business & workflow audit',
      'Custom AI stack design (booking, comms, social, reviews)',
      'Tool-by-tool setup guide tailored to your industry',
      'Ongoing optimisation recommendations',
      'Priority email support',
    ],
  },
  {
    tag: 'Done For You',
    headline: 'We build & run it for you',
    sub: 'Hand us the keys. Our team integrates, connects, and manages your entire AI operation — you focus on running your business.',
    price: 'Reach out first',
    highlight: true,
    cta: 'Book a discovery call →',
    ctaAction: 'contact',
    badge: 'Most requested',
    features: [
      'Everything in Custom Plan',
      'Full technical build & integration by our team',
      'Connected to your existing tools & accounts',
      'Dedicated account manager',
      'Ongoing management, reporting & optimisation',
      'Phone & Slack support',
    ],
  },
];

/* ── component ────────────────────────────────────────────────────────────── */

const INDUSTRY_NAV = [
  { label: 'Salons & Beauty',       key: 'salon' },
  { label: 'Trades & Plumbing',     key: 'trades' },
  { label: 'Restaurants',           key: 'restaurant' },
  { label: 'Retail & Shops',        key: 'retail' },
  { label: 'Health & Fitness',      key: 'health' },
  { label: 'Professional Services', key: 'professional' },
];

const INDUSTRY_TIMELINE = {
  salon: [
    { time:'8:00am', icon:'📱', event:'3 overnight booking requests confirmed automatically. Your morning is already full.' },
    { time:'9:30am', icon:'💇', event:'A client asks about pricing. AI replies instantly with your menu and books them in.' },
    { time:'12:00pm', icon:'⭐', event:'Review request sent to this morning\'s client. They leave a 5-star review on Google.' },
    { time:'2:00pm', icon:'📸', event:'AI posts a before/after photo to your Instagram with a caption and hashtags.' },
    { time:'5:00pm', icon:'🏠', event:'You finish for the day. AI keeps taking bookings.' },
    { time:'8:30pm', icon:'📅', event:'3 evening booking requests handled. All confirmed.' },
    { time:'11:58pm', icon:'🌙', event:'Late-night booking request answered and confirmed. Client booked for next week.' },
  ],
  trades: [
    { time:'8:00am', icon:'🔧', event:'2 emergency plumbing enquiries from overnight — AI replied instantly, 1 booked.' },
    { time:'9:30am', icon:'💷', event:'A customer asks for a quote. AI sends your standard pricing and books an inspection.' },
    { time:'12:00pm', icon:'⭐', event:'Review request sent to this morning\'s job. 5-star review received.' },
    { time:'2:00pm', icon:'📱', event:'AI follows up on an unanswered quote from yesterday. Customer confirms.' },
    { time:'5:00pm', icon:'🏠', event:'You finish the last job. AI keeps handling calls.' },
    { time:'8:30pm', icon:'🚨', event:'Emergency call at 8:30pm — AI captures details and confirms your callout fee.' },
    { time:'11:58pm', icon:'🌙', event:'Late-night enquiry answered. Customer booked for tomorrow morning.' },
  ],
  restaurant: [
    { time:'8:00am', icon:'🍽️', event:'6 reservation requests from yesterday evening — all confirmed automatically.' },
    { time:'9:30am', icon:'💬', event:'Customer asks about allergens. AI replies with your full menu information.' },
    { time:'12:00pm', icon:'⭐', event:'Review follow-up sent to last night\'s table. 5-star Google review received.' },
    { time:'2:00pm', icon:'📸', event:'AI posts today\'s specials to Instagram and Facebook.' },
    { time:'5:00pm', icon:'📅', event:'Evening rush begins. AI handles all reservation confirmations.' },
    { time:'8:30pm', icon:'🎉', event:'Private dining enquiry received. AI sends your packages and books a call.' },
    { time:'11:58pm', icon:'🌙', event:'Late-night booking for next Saturday confirmed. You\'re now fully booked.' },
  ],
  default: [
    { time:'8:00am', icon:'📱', event:'Morning booking requests answered overnight — 4 new confirmed.' },
    { time:'9:30am', icon:'💬', event:'A customer asks for a quote. AI replies with pricing details instantly.' },
    { time:'12:00pm', icon:'⭐', event:'Review request sent to this morning\'s customer. They leave 5 stars.' },
    { time:'2:00pm', icon:'📸', event:'Social post goes live on Instagram — AI wrote and scheduled it.' },
    { time:'5:00pm', icon:'🏠', event:'You finish for the day. AI keeps working.' },
    { time:'8:30pm', icon:'📅', event:'3 evening enquiries handled. 2 bookings confirmed.' },
    { time:'11:58pm', icon:'🌙', event:'Late-night message answered instantly. Customer books for next week.' },
  ],
};

export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();
  const dk = {
    bgPage:     isDark ? '#091408' : '#f7fdf9',
    bgCard:     isDark ? '#0f2017' : 'white',
    bgCardAlt:  isDark ? '#0c1a11' : '#f9fafb',
    bgSection:  isDark ? '#0d1f14' : '#f0fdf4',
    bgMuted:    isDark ? '#0c1a11' : '#f3f4f6',
    bgGreenTint:isDark ? 'rgba(16,185,129,.08)' : 'rgba(240,253,244,.5)',
    bgDivider:  isDark ? '#1e3d29' : '#e5e7eb',
    bgError:    isDark ? 'rgba(239,68,68,.12)' : '#fef2f2',
    border:     isDark ? '#1e3d29' : '#e5e7eb',
    borderG:    isDark ? 'rgba(16,185,129,.2)' : '#bbf7d0',
    text:       isDark ? '#f0fdf4' : '#0a1a0f',
    textMuted:  isDark ? '#9ca3af' : '#4b5563',
    textGray:   isDark ? '#d1fae5' : '#374151',
    textGreen:  isDark ? '#34d399' : '#065f46',
  };
  const [showSetup, setShowSetup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const tickerRef = useRef(null);

  // ── 1. Scroll progress bar ──
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── 2. Typewriter badge ──
  const TYPEWRITER_PHRASES = [
    "Let's automate your bakery",
    "Let's automate your salon",
    "Let's automate your garage",
    "Let's automate your restaurant",
    "Let's automate your plumbing business",
    "Let's automate your florist",
    "Let's automate your dental practice",
  ];
  const [twText, setTwText] = useState('');
  const [twPhraseIdx, setTwPhraseIdx] = useState(0);
  const [twDeleting, setTwDeleting] = useState(false);
  const [twHolding, setTwHolding] = useState(false);

  // ── 3. Live counter ──
  const [liveCount, setLiveCount] = useState(847000);


  // ── 7. Tabbed features ──
  const [activeTab, setActiveTab] = useState(0);
  const [roiMissed, setRoiMissed] = useState(12);
  const [roiValue, setRoiValue] = useState(180);
  const [roiAdmin, setRoiAdmin] = useState(15);
  const [tourIndustry, setTourIndustry] = useState(null);
  const [timeSavedHours, setTimeSavedHours] = useState(15);
  const [competitorPostcode, setCompetitorPostcode] = useState('');
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [competitorResult, setCompetitorResult] = useState(null);
  const [pkgTabFeatures, setPkgTabFeatures] = useState({
    booking: true, commsTab: true, reviews: false, social: false, analytics: false, leads: false,
  });
  // Booking sim animation
  const [simPhase, setSimPhase] = useState(0); // 0=idle,1=customer,2=typing,3=reply,4=confirmed
  const [simReply, setSimReply] = useState('');

  // ── Industry Tour tab nav ──
  const [selectedIndustryNav, setSelectedIndustryNav] = useState('salon');

  // ── 8e. Day-in-life timeline ──
  const [accordionOpen, setAccordionOpen] = useState(null);

  // ── Map tooltip ──
  const [mapTooltip, setMapTooltip] = useState(null);

  // Geo-personalisation
  const [geoCity, setGeoCity]       = useState('');   // e.g. "Manchester"
  const [geoReady, setGeoReady]     = useState(false); // true once lookup settles
  const [geoVisible, setGeoVisible] = useState(false); // drives fade-in of city name

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => {
        if (d && d.city) {
          setGeoCity(d.city);
          setGeoReady(true);
          // slight delay so the city fades in after the headline renders
          setTimeout(() => setGeoVisible(true), 120);
        } else {
          setGeoReady(true);
          setGeoVisible(true);
        }
      })
      .catch(() => { setGeoReady(true); setGeoVisible(true); });
  }, []);

  // Journey (morphing container) state
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [jStep, setJStep] = useState('choose');
  const [jHistory, setJHistory] = useState([]);
  const [jH, setJH] = useState(0);
  const [jOpacity, setJOpacity] = useState(1);
  const jInnerRef = useRef(null);
  const jTransitioning = useRef(false);
  const [reportForm, setReportForm] = useState({ type:'', name:'', area:'', size:'solo', challenge:'', email:'' });
  const [pkgFeatures, setPkgFeatures] = useState({ booking:true, comms:true, analytics:false, reputation:false, social:false });
  const [pkgDetails, setPkgDetails] = useState({ name:'', email:'', phone:'' });
  const [journeyPostcode, setJourneyPostcode] = useState('');
  const [journeyRegion, setJourneyRegion] = useState('london');
  const [journeySaved, setJourneySaved] = useState(false);
  const journeyRef = useRef(null);

  function jGoTo(nextStep, addHistory = true) {
    if (jTransitioning.current) return;
    jTransitioning.current = true;
    setJOpacity(0);
    setTimeout(() => {
      if (addHistory) setJHistory(h => [...h, jStep]);
      setJStep(nextStep);
      setTimeout(() => {
        if (jInnerRef.current) setJH(jInnerRef.current.scrollHeight);
        setJOpacity(1);
        jTransitioning.current = false;
      }, 80);
    }, 240);
  }
  function jGoBack() {
    if (jHistory.length === 0) { setJourneyOpen(false); return; }
    const prev = jHistory[jHistory.length - 1];
    jGoTo(prev, false);
    setJHistory(h => h.slice(0, -1));
  }
  function openJourney() {
    setJourneyOpen(true);
    setJStep('choose');
    setJHistory([]);
    setTimeout(() => {
      if (jInnerRef.current) setJH(jInnerRef.current.scrollHeight);
      setJOpacity(1);
      journeyRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 60);
  }

  const pkgPrice = Object.entries(pkgFeatures).filter(([,v])=>v).reduce((a,[k]) => {
    const f = PACKAGE_FEATURES.find(f=>f.id===k);
    return a + (f ? f.price : 0);
  }, 25);
  const reportEst = ESTIMATES[reportForm.type] || ESTIMATES.default;

  // Postcode search state
  const [postcode, setPostcode] = useState('');
  const [searchedPostcode, setSearchedPostcode] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [cityName, setCityName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [postcodeError, setPostcodeError] = useState('');
  const postcodeRef = useRef(null);

  const industries = ['All', ...Array.from(new Set(cityResults.map(b => b.industryLabel)))];
  const filteredResults = selectedIndustry === 'All'
    ? cityResults
    : cityResults.filter(b => b.industryLabel === selectedIndustry);

  // Local offers for the searched region
  const regionOffers = (() => {
    if (!searchedPostcode) return [];
    const region = getRegion(searchedPostcode);
    return LOCAL_OFFERS[region] || LOCAL_OFFERS['london'] || [];
  })();

  function doSearch(code) {
    const clean = code.trim();
    if (!clean || clean.length < 2) { setPostcodeError('Please enter a valid UK postcode'); return; }
    setPostcodeError('');
    const region = getRegion(clean);
    const bizList = LOCAL_BUSINESSES[region] || LOCAL_BUSINESSES['london'] || [];
    const city = POPULAR_CITIES.find(c => c.region === region);
    setCityResults(bizList);
    setCityName(city ? city.name : 'your area');
    setSearchedPostcode(clean.toUpperCase());
    setPostcode(clean.toUpperCase());
    setSelectedIndustry('All');
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 80);
  }

  function handleSearch(e) {
    e && e.preventDefault();
    doSearch(postcode);
  }

  // ── Scroll: header + progress bar + industry nav visibility ──
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Typewriter effect ──
  useEffect(() => {
    let timeout;
    const fullPhrase = (geoCity ? `Hey ${geoCity} — ` : '') + TYPEWRITER_PHRASES[twPhraseIdx];
    if (twHolding) {
      timeout = setTimeout(() => { setTwHolding(false); setTwDeleting(true); }, 1800);
    } else if (twDeleting) {
      if (twText.length === 0) {
        setTwDeleting(false);
        setTwPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length);
      } else {
        timeout = setTimeout(() => setTwText(t => t.slice(0, -1)), 18);
      }
    } else {
      if (twText.length < fullPhrase.length) {
        timeout = setTimeout(() => setTwText(fullPhrase.slice(0, twText.length + 1)), 30);
      } else {
        setTwHolding(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [twText, twDeleting, twHolding, twPhraseIdx, geoCity]);

  // ── Live counter tick ──
  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 4) + 1);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // ── Booking simulation loop ──
  useEffect(() => {
    if (activeTab !== 1) return;
    let t;
    const run = () => {
      setSimPhase(1); setSimReply('');
      t = setTimeout(() => { setSimPhase(2); }, 1400);
      t = setTimeout(() => {
        setSimPhase(3);
        const msg = "Hi! Of course — I've booked you in for tomorrow, 10am. See you then! 😊";
        let i = 0;
        const type = () => {
          if (i <= msg.length) { setSimReply(msg.slice(0, i)); i++; setTimeout(type, 28); }
          else { setTimeout(() => { setSimPhase(4); setTimeout(() => { setSimPhase(0); setTimeout(run, 2200); }, 2600); }, 300); }
        };
        type();
      }, 3000);
    };
    t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ── 1. SCROLL PROGRESS BAR ──────────────────────────────────────── */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:200,height:2,pointerEvents:'none'}}>
        <div style={{height:'100%',width:`${scrollProgress*100}%`,background:'#10b981',transition:'width .1s linear'}} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #111; }
        @keyframes fade-up   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in   { from { opacity:0; } to { opacity:1; } }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ticker    { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes pulse-ring{ 0%{box-shadow:0 0 0 0 rgba(16,185,129,.4)} 70%{box-shadow:0 0 0 12px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
        .animate-fade-up  { animation: fade-up .6s cubic-bezier(.23,1,.32,1) both; }
        .animate-fade-in  { animation: fade-in .5s ease both; }
        .animate-float    { animation: float 4s ease-in-out infinite; }
        .ticker-track     { display:flex; animation: ticker 28s linear infinite; width:max-content; }
        .ticker-track:hover { animation-play-state:paused; }
        .pulse-ring       { animation: pulse-ring 2s ease-out infinite; }
        .card-lift        { transition: transform .28s ease, box-shadow .28s ease; }
        .card-lift:hover  { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.1); }
        @keyframes float-a { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
        @keyframes float-b { 0%,100%{transform:translateY(0) rotate(1deg)}  50%{transform:translateY(-14px) rotate(-1deg)} }
        @keyframes float-c { 0%,100%{transform:translateY(-4px) rotate(0deg)} 50%{transform:translateY(6px) rotate(-2deg)} }
        @keyframes float-d { 0%,100%{transform:translateY(0) rotate(2deg)}  50%{transform:translateY(-8px) rotate(-1deg)} }
        @keyframes toast-in { from{opacity:0;transform:translateY(8px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cFadeIn     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stepPanelIn { from{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes stepItemIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sfbFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .float-a { animation: float-a 4.2s ease-in-out infinite; }
        .float-b { animation: float-b 5.1s ease-in-out infinite; animation-delay:.8s; }
        .float-c { animation: float-c 3.8s ease-in-out infinite; animation-delay:1.6s; }
        .float-d { animation: float-d 4.7s ease-in-out infinite; animation-delay:2.4s; }
        .toast-in { animation: toast-in .5s cubic-bezier(.23,1,.32,1) both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,.3); border-radius: 2px; }
        * { scrollbar-width: thin; scrollbar-color: rgba(16,185,129,.3) transparent; }
        /* ── Dark mode overrides ──
           NOTE: React serialises inline hex colours to rgb() in the DOM style
           attribute, so all attribute selectors below MUST target the rgb()
           form, not the original hex. */
        html.dark body { background: #091408 !important; color: #f0fdf4 !important; }
        html.dark header { background: rgba(5,14,9,.97) !important; border-color: rgba(16,185,129,.15) !important; box-shadow: 0 2px 24px rgba(0,0,0,.4) !important; }
        html.dark header nav button { color: rgba(255,255,255,.85) !important; }
        /* sticky bars (industry nav, search bar) */
        html.dark [style*="position: sticky"], html.dark [style*="position:sticky"] { background: rgba(5,14,9,.97) !important; border-color: rgba(16,185,129,.15) !important; }
        /* nav dropdown (rgba white) */
        html.dark [style*="rgba(255, 255, 255, 0.97)"] { background: rgba(5,14,9,.97) !important; }
        /* section IDs */
        html.dark #explore, html.dark #features, html.dark #pricing, html.dark #results, html.dark #what-we-do, html.dark #industries { background: #091408 !important; }
        /* industries cards */
        html.dark #industries .ind-cat-line { background: #1e3d29 !important; }
        html.dark #industries .ind-card { background: #0f2017 !important; border-color: #1e3d29 !important; }
        html.dark #industries .ind-card:hover { background: #0d2e1a !important; border-color: #10b981 !important; }
        html.dark #industries .ind-card span { color: #d1fae5 !important; }

        /* ── stray light BACKGROUNDS (rgb forms) ── */
        html.dark [style*="background: rgb(255, 255, 255)"] { background: #0f2017 !important; }
        html.dark [style*="background: rgb(247, 253, 249)"] { background: #091408 !important; }   /* #f7fdf9 */
        html.dark [style*="background: rgb(240, 253, 244)"] { background: #0d1f14 !important; }   /* #f0fdf4 */
        html.dark [style*="background: rgb(249, 250, 251)"] { background: #0c1a11 !important; }   /* #f9fafb */
        html.dark [style*="background: rgb(243, 244, 246)"] { background: #0c1a11 !important; }   /* #f3f4f6 */
        html.dark [style*="background: rgb(220, 252, 231)"] { background: rgba(16,185,129,.12) !important; } /* #dcfce7 */
        html.dark [style*="background: rgb(254, 242, 242)"] { background: rgba(239,68,68,.12) !important; }  /* #fef2f2 */
        html.dark [style*="background: rgb(255, 247, 247)"] { background: rgba(239,68,68,.1) !important; }   /* #fff7f7 NOW panel */
        html.dark [style*="background: rgb(255, 251, 235)"] { background: rgba(245,158,11,.1) !important; }  /* #fffbeb offer cards */

        /* ── BORDERS (rgb forms) ── */
        html.dark [style*="solid rgb(229, 231, 235)"] { border-color: #1e3d29 !important; }   /* #e5e7eb */
        html.dark [style*="solid rgb(209, 213, 219)"] { border-color: #1e3d29 !important; }   /* #d1d5db */
        html.dark [style*="solid rgb(243, 244, 246)"] { border-color: #16271c !important; }   /* #f3f4f6 */
        html.dark [style*="solid rgb(187, 247, 208)"] { border-color: rgba(16,185,129,.22) !important; } /* #bbf7d0 */
        html.dark [style*="solid rgb(209, 250, 229)"] { border-color: rgba(16,185,129,.15) !important; } /* #d1fae5 */
        html.dark [style*="solid rgb(249, 250, 251)"] { border-color: #1e3d29 !important; }   /* #f9fafb */
        html.dark [style*="solid rgb(240, 253, 244)"] { border-color: rgba(16,185,129,.15) !important; } /* #f0fdf4 */
        html.dark [style*="solid rgb(254, 202, 202)"] { border-color: rgba(239,68,68,.3) !important; }   /* #fecaca */

        /* ── dark TEXT → light (rgb forms) ── */
        html.dark [style*="color: rgb(10, 26, 15)"]   { color: #f0fdf4 !important; }   /* #0a1a0f headings */
        html.dark [style*="color: rgb(31, 41, 55)"]   { color: #f0fdf4 !important; }   /* #1f2937 */
        html.dark [style*="color: rgb(17, 24, 39)"]   { color: #f0fdf4 !important; }   /* #111827 */
        html.dark [style*="color: rgb(17, 17, 17)"]   { color: #f0fdf4 !important; }   /* #111 */
        html.dark [style*="color: rgb(55, 65, 81)"]   { color: #d1fae5 !important; }   /* #374151 */
        html.dark [style*="color: rgb(75, 85, 99)"]   { color: #9ca3af !important; }   /* #4b5563 */
        html.dark [style*="color: rgb(107, 114, 128)"]{ color: #9ca3af !important; }   /* #6b7280 */
        html.dark [style*="color: rgb(6, 95, 70)"]    { color: #34d399 !important; }   /* #065f46 */
        html.dark [style*="color: rgb(6, 78, 59)"]    { color: #34d399 !important; }   /* #064e3b */
        html.dark [style*="color: rgb(5, 46, 22)"]    { color: #34d399 !important; }   /* #052e16 counter */
        html.dark [style*="color: rgb(5, 150, 105)"]  { color: #34d399 !important; }   /* #059669 */
        html.dark [style*="color: rgb(153, 27, 27)"]  { color: #fca5a5 !important; }   /* #991b1b */
        html.dark [style*="color: rgb(127, 29, 29)"]  { color: #fca5a5 !important; }   /* #7f1d1d */

        /* inputs */
        html.dark input, html.dark textarea, html.dark select { background: #0f2017 !important; color: #f0fdf4 !important; border-color: #1e3d29 !important; }
        html.dark input::placeholder, html.dark textarea::placeholder { color: #6b7280 !important; }
        .gradient-text { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hero-grid { background-image: radial-gradient(circle, rgba(16,185,129,.08) 1px, transparent 1px); background-size:32px 32px; }
        section { scroll-margin-top: 72px; }
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .tw-cursor { display:inline-block; animation: blink 0.9s step-end infinite; }
        @keyframes map-pulse { 0%{r:5;opacity:0.9} 70%{r:11;opacity:0} 100%{r:11;opacity:0} }
        @keyframes map-pulse-gold { 0%{r:7;opacity:1} 70%{r:14;opacity:0} 100%{r:14;opacity:0} }
        @keyframes live-ticker2 { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .live-ticker2 { display:flex; animation: live-ticker2 35s linear infinite; width:max-content; }
        @keyframes booking-card-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)} 50%{box-shadow:0 0 0 10px rgba(16,185,129,0)} }
        .booking-card-pulse { animation: booking-card-pulse 2s ease-in-out infinite; }
        @keyframes msg-drift { 0%{transform:translateY(0)} 100%{transform:translateY(-28px)} }
        .msg-drift { animation: msg-drift 6s linear infinite; }
        input[type=range] { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px; background:#e5e7eb; outline:none; cursor:pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#10b981; cursor:pointer; box-shadow:0 2px 6px rgba(16,185,129,.4); }
        input[type=range]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#10b981; cursor:pointer; border:none; }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <header style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        transition:'background .25s, box-shadow .25s, border-color .25s',
        background: scrolled ? 'rgba(255,255,255,.97)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,.07)' : 'transparent'}`,
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,.06)' : 'none',
      }}>
        <div style={{maxWidth:1160,margin:'0 auto',padding:'0 28px',height:68,display:'flex',alignItems:'center',gap:0}}>

          {/* ── Logo ── */}
          <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})}
            style={{display:'flex',alignItems:'center',gap:10,border:'none',background:'none',cursor:'pointer',flexShrink:0,padding:0,marginRight:40}}>
            <img src="/toggle-logo.svg" alt="LocAI" style={{width:58,height:29,transition:'opacity .15s'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'} />
            <span style={{
              fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',
              color:'#10b981',background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.25)',
              borderRadius:100,padding:'2px 8px',lineHeight:1,
            }}>BETA</span>
          </button>

          {/* ── Desktop nav links ── */}
          <nav style={{display:'flex',alignItems:'center',gap:4}} className="hidden-mobile">
            {[['Features','features'],['Industries','industries'],['How it Works','how-it-works'],['Pricing','pricing']].map(([l,id]) => {
              const linkColor = scrolled ? '#065f46' : 'white';
              const hoverColor = scrolled ? '#064e3b' : 'white';
              return (
                <button key={id} onClick={() => scrollTo(id)}
                  style={{
                    padding:'7px 18px', borderRadius:100,
                    border:'1px solid rgba(16,185,129,.22)',
                    background:'rgba(16,185,129,.07)',
                    backdropFilter:'blur(12px) saturate(180%)',
                    WebkitBackdropFilter:'blur(12px) saturate(180%)',
                    boxShadow:'inset 0 1px 0 rgba(255,255,255,.65), inset 0 -1px 0 rgba(16,185,129,.08), 0 1px 4px rgba(0,0,0,.05)',
                    cursor:'pointer', fontSize:13.5, fontWeight:500, color: linkColor,
                    transition:'all .18s', letterSpacing:'-0.1px', whiteSpace:'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background='rgba(16,185,129,.15)';
                    e.currentTarget.style.borderColor='rgba(16,185,129,.45)';
                    e.currentTarget.style.boxShadow='inset 0 1px 0 rgba(255,255,255,.8), inset 0 -1px 0 rgba(16,185,129,.12), 0 2px 10px rgba(16,185,129,.18)';
                    e.currentTarget.style.color=hoverColor;
                    e.currentTarget.style.transform='translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background='rgba(16,185,129,.07)';
                    e.currentTarget.style.borderColor='rgba(16,185,129,.22)';
                    e.currentTarget.style.boxShadow='inset 0 1px 0 rgba(255,255,255,.65), inset 0 -1px 0 rgba(16,185,129,.08), 0 1px 4px rgba(0,0,0,.05)';
                    e.currentTarget.style.color=linkColor;
                    e.currentTarget.style.transform='';
                  }}
                >{l}</button>
              );
            })}
          </nav>

          <div style={{flex:1}} />

          {/* ── Desktop CTAs ── */}
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}} className="hidden-mobile">
            {/* Live badge */}
            <div style={{display:'flex',alignItems:'center',gap:5,marginRight:8}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 0 2px rgba(16,185,129,.25)',display:'inline-block',animation:'pulse-dot 2s ease-in-out infinite'}} />
              <span style={{fontSize:11,fontWeight:600,color: scrolled ? '#6b7280' : 'rgba(255,255,255,.75)',letterSpacing:'0.02em'}}>Live in 48 hrs</span>
            </div>

            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width:36, height:36, borderRadius:'50%',
                border: `1.5px solid ${scrolled ? (isDark ? 'rgba(16,185,129,.3)' : '#e5e7eb') : 'rgba(255,255,255,.35)'}`,
                background: isDark ? 'rgba(16,185,129,.12)' : 'transparent',
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                color: scrolled ? (isDark ? '#34d399' : '#374151') : 'white',
                transition:'all .2s', flexShrink:0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#10b981'; e.currentTarget.style.background='rgba(16,185,129,.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = scrolled ? (isDark ? 'rgba(16,185,129,.3)' : '#e5e7eb') : 'rgba(255,255,255,.35)'; e.currentTarget.style.background = isDark ? 'rgba(16,185,129,.12)' : 'transparent'; }}
            >
              {isDark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>

            <button onClick={() => navigate('/app')}
              style={{
                padding:'8px 18px', borderRadius:100,
                border: `1.5px solid ${scrolled ? '#e5e7eb' : 'rgba(255,255,255,.45)'}`,
                background:'transparent',
                cursor:'pointer', fontSize:13, fontWeight:600,
                color: scrolled ? '#374151' : 'white',
                transition:'all .15s', letterSpacing:'-0.1px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#10b981'; e.currentTarget.style.color='#059669'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = scrolled ? '#e5e7eb' : 'rgba(255,255,255,.45)'; e.currentTarget.style.color = scrolled ? '#374151' : 'white'; }}
            >Browse industries</button>

            <button onClick={() => setShowSetup(true)}
              style={{
                padding:'9px 22px', borderRadius:100, border:'none',
                background:'linear-gradient(135deg,#10b981 0%,#059669 100%)',
                cursor:'pointer', fontSize:13, fontWeight:700, color:'white',
                boxShadow:'0 2px 12px rgba(16,185,129,.4)',
                transition:'all .2s', letterSpacing:'-0.1px',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 5px 20px rgba(16,185,129,.55)'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 12px rgba(16,185,129,.4)'; e.currentTarget.style.transform=''; }}
            >Get started free →</button>
          </div>

          {/* ── Mobile hamburger ── */}
          <button onClick={() => setMobileMenuOpen(o => !o)}
            style={{display:'none',padding:8,border:'none',background:'none',cursor:'pointer',color:'#374151',borderRadius:8,transition:'background .15s'}}
            className="show-mobile"
            onMouseEnter={e=>e.currentTarget.style.background='#f3f4f6'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}>
            {mobileMenuOpen ? <I.x s={20} /> : <I.menu s={20} />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {mobileMenuOpen && (
          <div style={{
            background:dk.bgCard, borderTop:'1px solid #f3f4f6',
            padding:'8px 20px 20px', display:'flex', flexDirection:'column', gap:2,
            boxShadow:'0 12px 32px rgba(0,0,0,.08)',
          }}>
            {[['Features','features'],['Industries','industries'],['How it Works','how-it-works'],['Pricing','pricing']].map(([l,id]) => (
              <button key={id} onClick={() => { scrollTo(id); setMobileMenuOpen(false); }}
                style={{
                  padding:'12px 12px', border:'none', background:'none', cursor:'pointer',
                  fontSize:15, fontWeight:500, color:'#374151', textAlign:'left',
                  borderRadius:10, transition:'background .15s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                onMouseLeave={e=>e.currentTarget.style.background='none'}
              >{l}</button>
            ))}
            <div style={{height:1,background:dk.bgMuted,margin:'8px 0'}} />
            <button onClick={() => { navigate('/app'); setMobileMenuOpen(false); }}
              style={{padding:'12px',borderRadius:12,border:'1.5px solid #e5e7eb',background:'none',cursor:'pointer',fontSize:14,fontWeight:600,color:'#374151',textAlign:'center',marginBottom:6}}>
              Browse industries
            </button>
            <button onClick={() => { setShowSetup(true); setMobileMenuOpen(false); }}
              style={{padding:'13px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',cursor:'pointer',fontSize:14,fontWeight:700,color:'white',boxShadow:'0 2px 12px rgba(16,185,129,.35)'}}>
              Get started free →
            </button>
          </div>
        )}
      </header>

      <style>{`
        @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 2px rgba(16,185,129,.25)} 50%{box-shadow:0 0 0 4px rgba(16,185,129,.12)} }
        @keyframes geo-pop { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>


      {/* ── INDUSTRY TOUR NAV — visible only on Industry Tour tab ── */}
      <div style={{
        position:'sticky',top:68,zIndex:90,
        background: isDark ? 'rgba(9,20,8,.97)' : 'rgba(255,255,255,.97)',
        backdropFilter:'blur(16px)',
        borderBottom: activeTab===1 ? `1px solid ${isDark?'#1e3d29':'#e5e7eb'}` : 'none',
        maxHeight: activeTab===1 ? '80px' : '0',
        transition:'max-height .35s cubic-bezier(0.23,1,0.32,1), border-color .2s',
        overflow:'hidden',
      }}>
        <div style={{maxWidth:1160,margin:'0 auto',padding:'10px 24px',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none'}}>
          {INDUSTRY_NAV.map(ind => (
            <button key={ind.key} onClick={() => setSelectedIndustryNav(ind.key)}
              style={{flexShrink:0,padding:'7px 18px',borderRadius:100,border:'1.5px solid',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .18s',
                borderColor: selectedIndustryNav===ind.key ? '#10b981' : (isDark?'#1e3d29':'#e5e7eb'),
                background: selectedIndustryNav===ind.key ? '#10b981' : 'transparent',
                color: selectedIndustryNav===ind.key ? 'white' : dk.textMuted,
              }}>
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',position:'relative',overflow:'hidden',background:'linear-gradient(155deg,#052e16 0%,#064e3b 45%,#065f46 100%)'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px)',backgroundSize:'32px 32px',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:'10%',left:'50%',transform:'translateX(-50%)',width:800,height:800,background:'radial-gradient(circle,rgba(52,211,153,.12) 0%,transparent 65%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',bottom:'5%',right:'8%',width:350,height:350,background:'radial-gradient(circle,rgba(16,185,129,.1) 0%,transparent 70%)',pointerEvents:'none'}} />

        <div style={{maxWidth:760,width:'100%',padding:'120px 24px 60px',textAlign:'center',position:'relative'}}>
          {/* Logo — large + centred */}
          <img src="/toggle-logo.svg" alt="LocAI" className="animate-fade-up animate-float"
            style={{width:160,height:80,margin:'0 auto 28px',display:'block',filter:'drop-shadow(0 8px 28px rgba(52,211,153,.5))'}} />

          {/* ── 2. TYPEWRITER BADGE ── */}
          <div className="animate-fade-up" style={{animationDelay:'50ms',display:'inline-flex',alignItems:'center',gap:8,background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.35)',borderRadius:100,padding:'6px 18px',fontSize:13,fontWeight:600,color:'#a7f3d0',marginBottom:28,maxWidth:'90vw',overflowX:'hidden'}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#34d399',flexShrink:0}} className="pulse-ring" />
            <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
              {twText}<span className="tw-cursor">|</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up" style={{animationDelay:'90ms',fontSize:'clamp(34px,5.5vw,64px)',fontWeight:900,lineHeight:1.08,letterSpacing:'-2px',marginBottom:18,color:'white'}}>
            {geoCity ? (
              <>
                Hey,{' '}
                <span style={{
                  color:'#34d399',
                  opacity: geoVisible ? 1 : 0,
                  transform: geoVisible ? 'translateY(0)' : 'translateY(12px)',
                  display:'inline-block',
                  transition:'opacity .45s ease, transform .45s ease',
                }}>
                  {geoCity}.
                </span>
                <br/>
                <span style={{color:'white'}}>Let's get you</span>{' '}
                <span style={{color:'#34d399'}}>automated.</span>
              </>
            ) : (
              <>AI for your<br/><span style={{color:'#34d399'}}>local business</span></>
            )}
          </h1>

          {/* Subheading — industry-aware */}
          <p className="animate-fade-up" style={{animationDelay:'140ms',fontSize:'clamp(15px,2vw,19px)',color:'rgba(255,255,255,.65)',maxWidth:540,margin:'0 auto 48px',lineHeight:1.75}}>
            {geoCity
              ? `We set up and manage AI for local businesses across ${geoCity} — bookings handled, messages answered, reviews growing. Fully live in 48 hours.`
              : 'We introduce, configure, and manage AI for small local businesses — fully done for you in 48 hours. No tech skills, no jargon, just real results.'
            }
          </p>

          {/* ── GET STARTED BOX ── */}
          <div className="animate-fade-up" style={{animationDelay:'200ms',maxWidth:560,margin:'0 auto'}}>
            <button onClick={openJourney}
              style={{width:'100%',padding:'22px 32px',borderRadius:20,border:'2px solid rgba(52,211,153,.35)',background:'rgba(255,255,255,.06)',backdropFilter:'blur(12px)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,transition:'all .25s',boxShadow:'0 8px 40px rgba(0,0,0,.25)'}}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.1)'; e.currentTarget.style.borderColor='rgba(52,211,153,.6)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.borderColor='rgba(52,211,153,.35)'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:800,fontSize:18,color:'white',marginBottom:4}}>
                  Lead your local automation
                </div>
                <div style={{fontSize:14,color:'rgba(255,255,255,.5)'}}>Get a free personalised report — takes 3 minutes</div>
              </div>
              <div style={{flexShrink:0,width:44,height:44,borderRadius:'50%',background:'#10b981',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(16,185,129,.4)'}}>
                <I.arrow s={18} c="text-white" />
              </div>
            </button>
          </div>

        </div>

        <div style={{position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,opacity:.35}}>
          <span style={{fontSize:10,color:'white',letterSpacing:1.5,textTransform:'uppercase',fontWeight:600}}>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-float"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </section>

      {/* ── 3. LIVE COUNTER STRIP ────────────────────────────────────────── */}
      <section style={{background:dk.bgSection,borderTop:'1px solid #d1fae5',borderBottom:'1px solid #d1fae5',padding:'22px 24px'}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',gap:24,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 0 3px rgba(16,185,129,.3)',display:'inline-block'}} className="pulse-ring" />
            <span style={{fontSize:11,fontWeight:800,color:'#059669',letterSpacing:'0.18em',textTransform:'uppercase'}}>LIVE</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
            <img src="/toggle-logo.svg" alt="" style={{width:24,height:12,opacity:.7}} />
            <div style={{fontSize:'clamp(26px,4vw,42px)',fontWeight:900,color:'#052e16',letterSpacing:'-2px',lineHeight:1}}>
              {liveCount.toLocaleString()}
            </div>
          </div>
          <p style={{fontSize:'clamp(13px,1.6vw,15px)',color:'#4b5563',lineHeight:1.4,flexShrink:1,minWidth:200}}>
            businesses using AI — don't be the last in{' '}
            <span style={{color:'#065f46',fontWeight:700}}>{geoCity || 'your area'}</span>
          </p>
          <button onClick={() => setShowSetup(true)}
            style={{display:'inline-flex',alignItems:'center',gap:10,padding:'11px 24px',borderRadius:100,border:'none',background:'#10b981',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(16,185,129,.35)',transition:'all .2s',flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background='#059669';e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#10b981';e.currentTarget.style.transform='';}}
          >Join them →</button>
        </div>
      </section>

      {/* ── 9a. LIVE ACTIVITY TICKER ─────────────────────────────────────── */}
      <div style={{borderTop:'1px solid #d1fae5',borderBottom:'1px solid #d1fae5',background:dk.bgCard,padding:'12px 0',overflow:'hidden'}}>
        <div className="live-ticker2">
          {[...Array(2)].flatMap((_,ci) => [
            '🌿 A florist in Bristol just went live · 2 min ago',
            '🔧 A plumber in Leeds automated their booking · 5 min ago',
            '💇 A salon in Glasgow is now replying 24/7 · 8 min ago',
            '🍽️ A restaurant in Manchester got 3 bookings overnight · 12 min ago',
            '🦷 A dental clinic in Birmingham cut no-shows by 40% · 15 min ago',
            '🏋️ A gym in Liverpool filled 6 empty slots today · 20 min ago',
            '🌸 A florist in Cardiff booked 4 weddings this week · 25 min ago',
            '🔌 An electrician in Sheffield got 2 emergency jobs at midnight · 30 min ago',
            '💈 A barber in Newcastle now never misses a call · 35 min ago',
            '🐾 A pet groomer in Edinburgh tripled their bookings · 40 min ago',
            '🏠 A landscaper in Bristol automated their quote follow-ups · 45 min ago',
            '📸 A photographer in London auto-posts to Instagram daily · 50 min ago',
          ].map((t,i) => (
            <span key={`${ci}-${i}`} style={{display:'inline-flex',alignItems:'center',gap:12,padding:'0 28px',whiteSpace:'nowrap',fontSize:12,color:'#6b7280',fontWeight:500}}>
              <span style={{width:4,height:4,borderRadius:'50%',background:'#10b981',flexShrink:0}} />
              {t}
            </span>
          )))}
        </div>
      </div>

      {/* ── logo divider: counter → before/after ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.18,background:dk.bgPage}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── 4. BEFORE / AFTER SPLIT SECTION ─────────────────────────────── */}
      <section style={{background:dk.bgPage,padding:'80px 24px'}}>
        <div style={{maxWidth:1060,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'inline-block',background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:6,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              The difference
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:900,letterSpacing:'-1.5px',lineHeight:1.1,color:'#0a1a0f'}}>Life before and after LocAI</h2>
            <p style={{fontSize:16,color:'#4b5563',marginTop:12}}>Same customer. Same message. Completely different outcome.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:0,alignItems:'center'}}>

            {/* ── LEFT PHONE — Without AI ── */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
              <div style={{fontSize:13,fontWeight:700,color:'#991b1b',letterSpacing:'0.05em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:'#ef4444',display:'inline-block'}} />
                Without AI
              </div>

              {/* iPhone shell */}
              <div style={{
                width:300, borderRadius:44, background:'#1c1c1e',
                boxShadow:'0 32px 80px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.08)',
                padding:'12px', position:'relative',
              }}>
                {/* Notch */}
                <div style={{position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',width:100,height:28,background:'#1c1c1e',borderRadius:'0 0 18px 18px',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#2c2c2e'}} />
                  <div style={{width:60,height:6,borderRadius:10,background:'#2c2c2e'}} />
                </div>

                {/* Screen */}
                <div style={{borderRadius:36,overflow:'hidden',background:'#000',minHeight:480}}>
                  {/* Status bar */}
                  <div style={{background:'#000',padding:'14px 20px 6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'white',fontSize:13,fontWeight:700}}>9:41</span>
                    <div style={{display:'flex',gap:5,alignItems:'center'}}>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><rect x="0" y="3" width="3" height="7" rx="1"/><rect x="4" y="2" width="3" height="8" rx="1"/><rect x="8" y="0" width="3" height="10" rx="1"/><rect x="12" y="0" width="2" height="10" rx="1" opacity=".3"/></svg>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><path d="M7 2C4.5 2 2.3 3.1 0.8 4.8L0 4 C1.8 2 4.2 0.8 7 0.8s5.2 1.2 7 3.2L13.2 4C11.7 3.1 9.5 2 7 2z M7 5c-1.4 0-2.7.6-3.6 1.5L2.5 5.6C3.7 4.4 5.3 3.6 7 3.6s3.3.8 4.5 2L10.6 6.5C9.7 5.6 8.4 5 7 5z M7 8c-.8 0-1.5.3-2 .8L4 7.8C4.8 7 5.8 6.5 7 6.5s2.2.5 3 1.3L9 8.8C8.5 8.3 7.8 8 7 8z"/></svg>
                      <div style={{display:'flex',alignItems:'center',gap:2}}>
                        <div style={{width:22,height:11,borderRadius:3,border:'1.5px solid rgba(255,255,255,.5)',padding:1.5,display:'flex',alignItems:'center'}}>
                          <div style={{width:'30%',height:'100%',background:'#ef4444',borderRadius:2}} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missed call notification banner */}
                  <div style={{margin:'4px 8px 0',background:'rgba(28,28,30,.95)',backdropFilter:'blur(20px)',borderRadius:16,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,border:'1px solid rgba(255,255,255,.08)'}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'#ef4444',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l1.91-1.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.5)',marginBottom:1}}>Phone · Missed Call</div>
                      <div style={{fontSize:13,color:'white',fontWeight:600}}>Unknown Number</div>
                    </div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>now</div>
                  </div>

                  {/* Messages app header */}
                  <div style={{background:'#000',padding:'20px 16px 8px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{color:'white',fontSize:20,fontWeight:700}}>Messages</span>
                    <div style={{background:'#ef4444',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white'}}>8</div>
                  </div>

                  {/* Message threads — unread piling up */}
                  <div style={{padding:'0 8px',display:'flex',flexDirection:'column',gap:1}}>
                    {[
                      {name:'Sarah M.',    msg:'Hi, are you available Thursday?',    time:'2d',  unread:true,  urgent:false},
                      {name:'Mike B.',     msg:'Can I book for next week?',           time:'1d',  unread:true,  urgent:false},
                      {name:'Emma W.',     msg:'Still waiting for a reply...',        time:'1d',  unread:true,  urgent:false},
                      {name:'Tom H.',      msg:'URGENT: Need a quote ASAP',           time:'3h',  unread:true,  urgent:true},
                      {name:'Lisa R.',     msg:'Hello? Anyone there?',               time:'2h',  unread:true,  urgent:false},
                      {name:'James K.',    msg:'Going with someone else, sorry',      time:'1h',  unread:true,  urgent:false},
                    ].map((m,i) => (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 8px',borderBottom:'1px solid rgba(255,255,255,.05)',background: i===0 ? 'rgba(255,255,255,.04)' : 'transparent'}}>
                        {/* Avatar */}
                        <div style={{width:44,height:44,borderRadius:'50%',background:`hsl(${i*47+10},45%,35%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'white',flexShrink:0,position:'relative'}}>
                          {m.name[0]}
                          {m.unread && <div style={{position:'absolute',top:0,right:0,width:12,height:12,borderRadius:'50%',background:'#ef4444',border:'2px solid #000'}} />}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                            <span style={{fontSize:13,fontWeight: m.unread?700:500,color:'white'}}>{m.name}</span>
                            <span style={{fontSize:11,color: m.urgent?'#ef4444':'rgba(255,255,255,.35)'}}>{m.time}</span>
                          </div>
                          <div style={{fontSize:12,color: m.urgent?'#fca5a5':'rgba(255,255,255,.4)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontWeight: m.unread?500:400}}>{m.msg}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom bar */}
                  <div style={{padding:'16px',textAlign:'center'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>Pull down to refresh</div>
                  </div>
                </div>
              </div>

              {/* Stat below */}
              <div style={{background:dk.bgError,border:'1px solid #fecaca',borderRadius:14,padding:'12px 18px',fontSize:13,color:'#991b1b',fontWeight:600,textAlign:'center',maxWidth:280}}>
                💸 Avg. business loses <strong>£2,800/mo</strong> to missed enquiries
              </div>
            </div>

            {/* ── CENTER DIVIDER ── */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'0 28px'}}>
              <div style={{width:1,height:80,background:'linear-gradient(to bottom,transparent,#d1d5db)'}} />
              <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 24px rgba(16,185,129,.45)'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
              <div style={{width:1,height:80,background:'linear-gradient(to bottom,#d1d5db,transparent)'}} />
            </div>

            {/* ── RIGHT PHONE — With LocAI ── */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
              <div style={{fontSize:13,fontWeight:700,color:'#065f46',letterSpacing:'0.05em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block'}} />
                With LocAI
              </div>

              {/* iPhone shell */}
              <div style={{
                width:300, borderRadius:44, background:'#1c1c1e',
                boxShadow:'0 32px 80px rgba(16,185,129,.18), 0 0 0 1px rgba(16,185,129,.2), inset 0 0 0 1px rgba(255,255,255,.08)',
                padding:'12px', position:'relative',
              }}>
                {/* Notch */}
                <div style={{position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',width:100,height:28,background:'#1c1c1e',borderRadius:'0 0 18px 18px',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#2c2c2e'}} />
                  <div style={{width:60,height:6,borderRadius:10,background:'#2c2c2e'}} />
                </div>

                {/* Screen */}
                <div style={{borderRadius:36,overflow:'hidden',background:'#000',minHeight:480}}>
                  {/* Status bar */}
                  <div style={{background:'#000',padding:'14px 20px 6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'white',fontSize:13,fontWeight:700}}>9:41</span>
                    <div style={{display:'flex',gap:5,alignItems:'center'}}>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><rect x="0" y="3" width="3" height="7" rx="1"/><rect x="4" y="2" width="3" height="8" rx="1"/><rect x="8" y="0" width="3" height="10" rx="1"/><rect x="12" y="0" width="2" height="10" rx="1" opacity=".3"/></svg>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><path d="M7 2C4.5 2 2.3 3.1 0.8 4.8L0 4 C1.8 2 4.2 0.8 7 0.8s5.2 1.2 7 3.2L13.2 4C11.7 3.1 9.5 2 7 2z M7 5c-1.4 0-2.7.6-3.6 1.5L2.5 5.6C3.7 4.4 5.3 3.6 7 3.6s3.3.8 4.5 2L10.6 6.5C9.7 5.6 8.4 5 7 5z M7 8c-.8 0-1.5.3-2 .8L4 7.8C4.8 7 5.8 6.5 7 6.5s2.2.5 3 1.3L9 8.8C8.5 8.3 7.8 8 7 8z"/></svg>
                      <div style={{display:'flex',alignItems:'center',gap:2}}>
                        <div style={{width:22,height:11,borderRadius:3,border:'1.5px solid rgba(255,255,255,.5)',padding:1.5,display:'flex',alignItems:'center'}}>
                          <div style={{width:'85%',height:'100%',background:'#10b981',borderRadius:2}} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LocAI notification banner */}
                  <div style={{margin:'4px 8px 0',background:'rgba(16,185,129,.15)',backdropFilter:'blur(20px)',borderRadius:16,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,border:'1px solid rgba(16,185,129,.3)'}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'#10b981',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.5)',marginBottom:1}}>LocAI · New booking</div>
                      <div style={{fontSize:13,color:'white',fontWeight:600}}>Thursday 2pm confirmed ✓</div>
                    </div>
                    <div style={{fontSize:10,color:'rgba(16,185,129,.7)'}}>now</div>
                  </div>

                  {/* Open conversation — Sarah M. */}
                  <div style={{background:'#000',padding:'16px 12px 8px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <div style={{width:32,height:32,borderRadius:'50%',background:'hsl(10,45%,35%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'white'}}>S</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:'white'}}>Sarah M.</div>
                      <div style={{fontSize:11,color:'#10b981'}}>AI replied · just now</div>
                    </div>
                  </div>

                  {/* Chat bubbles */}
                  <div style={{padding:'16px 12px',display:'flex',flexDirection:'column',gap:8,background:'#000'}}>
                    {/* Customer message */}
                    <div style={{alignSelf:'flex-start',maxWidth:'80%'}}>
                      <div style={{background:'#3a3a3c',borderRadius:'18px 18px 18px 4px',padding:'10px 14px'}}>
                        <div style={{fontSize:13,color:'white',lineHeight:1.4}}>Hi, are you available Thursday? Need a cut and colour 💇‍♀️</div>
                      </div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:4,marginLeft:4}}>11:47 PM</div>
                    </div>

                    {/* AI reply */}
                    <div style={{alignSelf:'flex-end',maxWidth:'82%'}}>
                      <div style={{background:'#10b981',borderRadius:'18px 18px 4px 18px',padding:'10px 14px'}}>
                        <div style={{fontSize:13,color:'white',lineHeight:1.4}}>Hi Sarah! Yes, Thursday works great. I've got 10am or 2pm free — which would suit you? 😊</div>
                      </div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:4,textAlign:'right',marginRight:4,display:'flex',alignItems:'center',justifyContent:'flex-end',gap:4}}>
                        11:47 PM
                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 4l3 3 5-6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>

                    {/* Customer picks time */}
                    <div style={{alignSelf:'flex-start',maxWidth:'80%'}}>
                      <div style={{background:'#3a3a3c',borderRadius:'18px 18px 18px 4px',padding:'10px 14px'}}>
                        <div style={{fontSize:13,color:'white',lineHeight:1.4}}>2pm please!</div>
                      </div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:4,marginLeft:4}}>11:48 PM</div>
                    </div>

                    {/* AI confirms & books */}
                    <div style={{alignSelf:'flex-end',maxWidth:'82%'}}>
                      <div style={{background:'#10b981',borderRadius:'18px 18px 4px 18px',padding:'10px 14px'}}>
                        <div style={{fontSize:13,color:'white',lineHeight:1.4}}>Booked! Thursday at 2pm — I've added it to the calendar and sent you a confirmation. See you then! 🗓️</div>
                      </div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:4,textAlign:'right',marginRight:4,display:'flex',alignItems:'center',justifyContent:'flex-end',gap:4}}>
                        11:48 PM
                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 4l3 3 5-6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>

                    {/* Timestamp footer */}
                    <div style={{textAlign:'center',marginTop:8}}>
                      <span style={{fontSize:10,color:'rgba(16,185,129,.6)',background:'rgba(16,185,129,.08)',borderRadius:8,padding:'3px 10px',fontWeight:600}}>
                        ✓ Booking confirmed while you slept
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat below */}
              <div style={{background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:14,padding:'12px 18px',fontSize:13,color:'#065f46',fontWeight:600,textAlign:'center',maxWidth:280}}>
                ✅ <strong>100% of enquiries answered</strong>, 24/7 — even at midnight
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── logo divider: before/after → map ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.15,background:dk.bgPage}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── 5. INTERACTIVE MAP SECTION ───────────────────────────────────── */}
      <section id="map-section" style={{background:'#020c07',padding:'56px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.02) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}} />
        <div style={{maxWidth:960,margin:'0 auto',position:'relative'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'rgba(16,185,129,.12)',border:'1px solid rgba(52,211,153,.25)',borderRadius:100,padding:'5px 16px',marginBottom:20}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:2,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              <span style={{width:6,height:6,borderRadius:'50%',background:'#34d399',display:'inline-block'}} className="pulse-ring" />
              <span style={{fontSize:11,fontWeight:700,color:'#6ee7b7',letterSpacing:'0.12em',textTransform:'uppercase'}}>Coverage</span>
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'white',lineHeight:1.1,marginBottom:16}}>Live across the UK & beyond</h2>
            <p style={{fontSize:16,color:'rgba(255,255,255,.5)',maxWidth:420,margin:'0 auto'}}>Hover over a city to see live stats</p>
          </div>

          {/* SVG Map */}
          <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:24,padding:'32px',marginBottom:32,position:'relative'}}>
            <svg viewBox="0 0 500 600" style={{width:'100%',maxWidth:420,margin:'0 auto',display:'block',height:'auto'}} xmlns="http://www.w3.org/2000/svg">
              {/* Simplified UK outline */}
              <path d="M200,50 L220,30 L250,25 L270,40 L290,35 L310,55 L320,80 L300,100 L310,130 L300,160 L280,180 L290,210 L310,230 L320,260 L300,290 L280,310 L260,330 L240,360 L220,380 L200,400 L180,420 L160,410 L140,390 L130,360 L120,330 L110,300 L120,270 L130,240 L120,210 L110,180 L120,150 L130,120 L120,90 L140,65 L160,50 L180,45 Z" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5"/>
              {/* Scotland */}
              <path d="M160,50 L170,20 L200,10 L230,15 L250,25 L220,30 L200,50 Z" fill="rgba(16,185,129,.05)" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
              {/* Ireland rough */}
              <path d="M60,200 L80,180 L100,185 L110,210 L100,240 L75,250 L55,235 L50,210 Z" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/>

              {/* City dots */}
              {[
                { name:'London',      x:265, y:360, count:81  },
                { name:'Manchester',  x:195, y:250, count:34  },
                { name:'Birmingham',  x:220, y:310, count:23  },
                { name:'Leeds',       x:215, y:230, count:18  },
                { name:'Glasgow',     x:165, y:110, count:12  },
                { name:'Cardiff',     x:165, y:355, count:9   },
                { name:'Bristol',     x:175, y:370, count:11  },
                { name:'Edinburgh',   x:185, y:125, count:10  },
                { name:'Sheffield',   x:220, y:255, count:14  },
                { name:'Liverpool',   x:178, y:258, count:16  },
                { name:'Newcastle',   x:210, y:185, count:8   },
                { name:'Belfast',     x:100, y:170, count:6   },
              ].map(city => (
                <g key={city.name} style={{cursor:'pointer'}}
                  onMouseEnter={() => setMapTooltip(city)}
                  onMouseLeave={() => setMapTooltip(null)}>
                  {/* Pulse ring */}
                  <circle cx={city.x} cy={city.y} r="5" fill="rgba(16,185,129,0)">
                    <animate attributeName="r" values="5;14;5" dur="2.4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx={city.x} cy={city.y} r="5" fill="#10b981" style={{filter:'drop-shadow(0 0 4px rgba(16,185,129,.8))',transition:'r .2s'}}/>
                  <text x={city.x+9} y={city.y+4} fontSize="9" fill="rgba(255,255,255,.5)" fontFamily="Inter,sans-serif">{city.name}</text>
                </g>
              ))}

              {/* Gold "You are here" dot if geoCity detected */}
              {geoCity && (
                <g style={{cursor:'pointer'}}>
                  <circle cx={240} cy={295} r="7" fill="rgba(251,191,36,0)">
                    <animate attributeName="r" values="7;16;7" dur="1.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx={240} cy={295} r="7" fill="#fbbf24" style={{filter:'drop-shadow(0 0 6px rgba(251,191,36,.9))'}}/>
                  <text x={251} y={299} fontSize="9" fill="#fbbf24" fontWeight="700" fontFamily="Inter,sans-serif">📍 You are here</text>
                </g>
              )}
            </svg>

            {/* Tooltip */}
            {mapTooltip && (
              <div style={{position:'absolute',top:24,right:24,background:'rgba(0,0,0,.9)',border:'1px solid rgba(16,185,129,.3)',borderRadius:14,padding:'14px 18px',minWidth:180,pointerEvents:'none'}}>
                <div style={{fontSize:13,fontWeight:800,color:'white',marginBottom:4}}>{mapTooltip.name}</div>
                <div style={{fontSize:13,color:'#10b981',fontWeight:700}}>{mapTooltip.count} businesses live</div>
                <div style={{display:'flex',alignItems:'center',gap:5,marginTop:6}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',display:'inline-block'}} className="pulse-ring" />
                  <span style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Active now</span>
                </div>
              </div>
            )}
          </div>

          {/* Global flags */}
          <div style={{display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
            {[{flag:'🇬🇧',label:'United Kingdom'},{flag:'🇦🇺',label:'Australia'},{flag:'🇨🇦',label:'Canada'},{flag:'🇺🇸',label:'United States'}].map(c => (
              <div key={c.label} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:100,padding:'8px 18px',fontSize:13,color:'rgba(255,255,255,.7)',fontWeight:600}}>
                <span style={{fontSize:18}}>{c.flag}</span>{c.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── logo divider: map → how-it-works ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.2,background:'#020c07'}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{background:'linear-gradient(160deg,#020c07 0%,#052e16 50%,#064e3b 100%)',padding:'80px 24px',position:'relative',overflow:'hidden'}}>

        {/* Background texture */}
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:900,height:500,background:'radial-gradient(ellipse,rgba(16,185,129,.09) 0%,transparent 65%)',pointerEvents:'none'}} />

        <div style={{maxWidth:1080,margin:'0 auto',position:'relative'}}>

          {/* Header */}
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'rgba(16,185,129,.12)',border:'1px solid rgba(52,211,153,.25)',borderRadius:100,padding:'5px 16px',marginBottom:24}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:2,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              <span style={{width:6,height:6,borderRadius:'50%',background:'#34d399',display:'inline-block',boxShadow:'0 0 0 2px rgba(52,211,153,.3)'}} />
              <span style={{fontSize:11,fontWeight:700,color:'#6ee7b7',letterSpacing:'0.12em',textTransform:'uppercase'}}>How it works</span>
            </div>
            <h2 style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:900,letterSpacing:'-2px',color:'white',lineHeight:1.05,margin:'0 0 20px'}}>
              Zero to AI in{' '}
              <span style={{color:'#34d399'}}>48 hours.</span>
            </h2>
            <p style={{fontSize:17,color:'rgba(255,255,255,.5)',maxWidth:460,margin:'0 auto',lineHeight:1.7}}>
              No engineers. No jargon. No long onboarding. We handle everything — you just go live.
            </p>
          </div>

          {/* Steps grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,position:'relative'}}>

            {/* Connecting line */}
            <div style={{position:'absolute',top:44,left:'16.67%',right:'16.67%',height:1,background:'linear-gradient(90deg,rgba(52,211,153,.0),rgba(52,211,153,.35) 20%,rgba(52,211,153,.35) 80%,rgba(52,211,153,.0))',pointerEvents:'none',zIndex:0}} />

            {[
              {
                num:'01',
                title:'Tell us about your business',
                body:"Fill in a quick 3-minute form. Your industry, how you work today, and what's slowing you down. No tech knowledge needed.",
                time:'3 min',
                icon:(
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                ),
              },
              {
                num:'02',
                title:'We design & build your AI stack',
                body:'Our team maps your workflows, selects the right tools, integrates everything, and tests it — all done for you within 48 hours.',
                time:'24–48 hrs',
                icon:(
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="m12 2-3.09 6.26L2 9.27l5 4.87L5.82 21 12 17.77 18.18 21 17 14.14l5-4.87-6.91-1.01L12 2z"/>
                  </svg>
                ),
                highlight: true,
              },
              {
                num:'03',
                title:'Go live and grow on autopilot',
                body:'Your AI handles bookings, messages, reviews, and content from day one. Check your dashboard — everything is already running.',
                time:'Day 1',
                icon:(
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div key={i} style={{
                position:'relative', zIndex:1,
                padding:'36px 32px',
                background: step.highlight
                  ? 'rgba(16,185,129,.1)'
                  : 'rgba(255,255,255,.03)',
                border: `1px solid ${step.highlight ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.07)'}`,
                borderRadius: i===0 ? '20px 0 0 20px' : i===2 ? '0 20px 20px 0' : '0',
                transition:'background .2s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background=step.highlight?'rgba(16,185,129,.15)':'rgba(255,255,255,.06)'}
                onMouseLeave={e=>e.currentTarget.style.background=step.highlight?'rgba(16,185,129,.1)':'rgba(255,255,255,.03)'}
              >
                {/* Step number + time */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                  <div style={{
                    width:40, height:40, borderRadius:'50%',
                    background: step.highlight ? 'rgba(52,211,153,.2)' : 'rgba(255,255,255,.06)',
                    border: `1px solid ${step.highlight ? 'rgba(52,211,153,.4)' : 'rgba(255,255,255,.1)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {step.icon}
                  </div>
                  <span style={{
                    fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                    color: step.highlight ? '#6ee7b7' : 'rgba(255,255,255,.3)',
                    background: step.highlight ? 'rgba(52,211,153,.12)' : 'rgba(255,255,255,.05)',
                    border: `1px solid ${step.highlight ? 'rgba(52,211,153,.25)' : 'rgba(255,255,255,.08)'}`,
                    borderRadius:100, padding:'3px 10px',
                  }}>{step.time}</span>
                </div>

                {/* Big number */}
                <div style={{fontSize:13,fontWeight:800,color:'rgba(52,211,153,.4)',letterSpacing:'0.08em',marginBottom:10}}>{step.num}</div>

                {/* Title */}
                <h3 style={{fontSize:19,fontWeight:800,color:'white',letterSpacing:'-0.4px',lineHeight:1.25,marginBottom:12}}>{step.title}</h3>

                {/* Body */}
                <p style={{fontSize:14,color:'rgba(255,255,255,.5)',lineHeight:1.72,margin:0}}>{step.body}</p>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{textAlign:'center',marginTop:56,display:'flex',alignItems:'center',justifyContent:'center',gap:16,flexWrap:'wrap'}}>
            <button onClick={() => setShowSetup(true)}
              style={{display:'inline-flex',alignItems:'center',gap:10,padding:'14px 32px',borderRadius:100,border:'none',background:'#10b981',cursor:'pointer',fontSize:15,fontWeight:700,color:'white',boxShadow:'0 4px 24px rgba(16,185,129,.45)',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='#34d399';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#10b981';e.currentTarget.style.transform='';}}
            >
              Get started — it's free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <span style={{fontSize:13,color:'rgba(255,255,255,.35)'}}>No credit card · Live in 48 hrs</span>
          </div>
        </div>
      </section>

      {/* ── ADMIRE THE SIMPLICITY ────────────────────────────────────────── */}
      <section style={{background:dk.bgPage,padding:'56px 24px 52px',textAlign:'center',borderTop:'1px solid #bbf7d0'}}>
        <div style={{maxWidth:680,margin:'0 auto'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:dk.bgSection,border:'1px solid #d1fae5',borderRadius:20,padding:'5px 14px',marginBottom:20}}>
            <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
            <span style={{fontSize:11,fontWeight:700,color:'#059669',letterSpacing:'0.08em',textTransform:'uppercase'}}>Designed for real life</span>
          </div>
          <h2 style={{fontSize:'clamp(32px,5vw,56px)',fontWeight:900,letterSpacing:'-1.5px',color:'#0a1a0f',lineHeight:1.08,margin:'0 0 18px'}}>
            Admire the{' '}
            <span style={{color:'#10b981',position:'relative',display:'inline-block'}}>
              simplicity
              <svg style={{position:'absolute',bottom:-6,left:0,width:'100%',overflow:'visible'}} viewBox="0 0 200 10" preserveAspectRatio="none" height="8">
                <path d="M0 8 Q50 0 100 6 Q150 12 200 4" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p style={{fontSize:16,color:'#4b5563',lineHeight:1.65,margin:'0 auto',maxWidth:480}}>
            No dashboards to learn. No engineers to hire. No jargon. Just tell us about your business and we handle the rest — fully live in 48 hours.
          </p>
        </div>
      </section>

      {/* ── JOURNEY CONTAINER ────────────────────────────────────────────── */}
      <div ref={journeyRef} style={{background:dk.bgPage,borderBottom:'1px solid #bbf7d0'}}>
        <div style={{
          height: journeyOpen ? jH+'px' : '0px',
          overflow:'hidden',
          transition:'height .55s cubic-bezier(0.23,1,0.32,1)',
        }}>
          <div ref={jInnerRef} style={{opacity:jOpacity,transition:'opacity .24s ease',padding:'48px 24px 56px'}}>
            <div style={{maxWidth:860,margin:'0 auto'}}>

              {/* Back + save nav */}
              {jStep !== 'choose' && (
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
                  <button onClick={jGoBack} style={{display:'flex',alignItems:'center',gap:8,border:'none',background:'none',cursor:'pointer',fontSize:14,fontWeight:600,color:'#6b7280',padding:'6px 0'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back
                  </button>
                  <button onClick={() => { setJourneySaved(true); setTimeout(()=>setJourneySaved(false),2500); }}
                    style={{display:'flex',alignItems:'center',gap:6,border:'1.5px solid',borderColor:journeySaved?'#10b981':dk.border,background:journeySaved?'#f0fdf4':dk.bgCard,borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:600,color:journeySaved?'#065f46':dk.textMuted,padding:'7px 14px',transition:'all .2s'}}>
                    <I.check s={13} /> {journeySaved ? 'Saved!' : 'Save progress'}
                  </button>
                </div>
              )}

              {/* STEP: choose ───────────────────────────────────────────── */}
              {jStep === 'choose' && (
                <div>
                  <div style={{textAlign:'center',marginBottom:36}}>
                    <h2 style={{fontSize:'clamp(22px,3.5vw,36px)',fontWeight:800,letterSpacing:'-1px',color:'#111',marginBottom:10}}>What would you like to do?</h2>
                    <p style={{fontSize:16,color:'#6b7280'}}>Both options are free to start — no credit card, no commitment.</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:20}}>
                    {/* Card 1: Report */}
                    <button onClick={() => jGoTo('report')}
                      style={{textAlign:'left',border:'2px solid #e5e7eb',borderRadius:20,background:dk.bgCard,cursor:'pointer',overflow:'hidden',transition:'all .25s',display:'flex',flexDirection:'column',boxShadow:'0 2px 12px rgba(0,0,0,.05)'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#10b981';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(16,185,129,.15)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.05)';}}>
                      <div style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',padding:'24px 24px 8px',borderBottom:'1px solid #e5e7eb'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                          <div style={{width:40,height:40,borderRadius:12,background:'#10b981',display:'flex',alignItems:'center',justifyContent:'center'}}><E3D emoji="📄" size={20} /></div>
                          <div>
                            <div style={{fontWeight:800,fontSize:17,color:'#111'}}>Free AI Report</div>
                            <div style={{fontSize:12,color:'#059669',fontWeight:600}}>No commitment · Instant</div>
                          </div>
                        </div>
                      </div>
                      <OptionCarousel slides={REPORT_SLIDES} accent="#10b981" />
                      <div style={{padding:'0 20px 20px',display:'flex',alignItems:'center',gap:6,fontSize:14,fontWeight:700,color:'#10b981'}}>
                        Get my free report <I.arrow s={14} />
                      </div>
                    </button>

                    {/* Card 2: Package */}
                    <button onClick={() => jGoTo('package')}
                      style={{textAlign:'left',border:'2px solid #e5e7eb',borderRadius:20,background:dk.bgCard,cursor:'pointer',overflow:'hidden',transition:'all .25s',display:'flex',flexDirection:'column',boxShadow:'0 2px 12px rgba(0,0,0,.05)'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#064e3b';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(6,78,59,.15)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.05)';}}>
                      <div style={{background:'linear-gradient(135deg,#052e16,#064e3b)',padding:'24px 24px 8px',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                          <div style={{width:40,height:40,borderRadius:12,background:'rgba(52,211,153,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}><E3D emoji="🚀" size={20} anim="bounce" /></div>
                          <div>
                            <div style={{fontWeight:800,fontSize:17,color:'white'}}>Build a Package</div>
                            <div style={{fontSize:12,color:'#34d399',fontWeight:600}}>Customised · From £49/mo</div>
                          </div>
                        </div>
                      </div>
                      <OptionCarousel slides={PACKAGE_SLIDES} accent="#064e3b" />
                      <div style={{padding:'0 20px 20px',display:'flex',alignItems:'center',gap:6,fontSize:14,fontWeight:700,color:'#064e3b'}}>
                        Build my package <I.arrow s={14} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: report (form) ────────────────────────────────────── */}
              {jStep === 'report' && (
                <div style={{maxWidth:600,margin:'0 auto'}}>
                  <div style={{textAlign:'center',marginBottom:32}}>
                    <div style={{width:52,height:52,borderRadius:16,background:dk.bgSection,border:'2px solid #bbf7d0',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}><E3D emoji="📄" size={24} /></div>
                    <h2 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.5px',color:'#111',marginBottom:8}}>Tell us about your business</h2>
                    <p style={{fontSize:15,color:'#6b7280'}}>We'll generate a personalised AI report showing exactly where you'd save time and increase revenue.</p>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:14}}>
                    {[
                      { label:'Business type', field:'type', type:'select', opts:[['','Select your trade…'],['bakery','Bakery / Café'],['auto-repair','Auto Repair'],['hair-salon','Hair Salon'],['plumber','Plumber'],['pet-groomer','Pet Groomer'],['dentist','Dentist / Dental Clinic'],['landscaper','Landscaper'],['florist','Florist'],['default','Other trade']] },
                      { label:'Business name', field:'name', type:'text', placeholder:'e.g. The Kettle Bakehouse' },
                      { label:'Town or area', field:'area', type:'text', placeholder:'e.g. Manchester' },
                      { label:'Email address', field:'email', type:'email', placeholder:'Where to send your report' },
                    ].map(f => (
                      <div key={f.field}>
                        <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>{f.label}</label>
                        {f.type === 'select' ? (
                          <select value={reportForm[f.field]} onChange={e => setReportForm(r=>({...r,[f.field]:e.target.value}))}
                            style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #d1d5db',fontSize:14,color:'#111',background:dk.bgCard,outline:'none',fontFamily:'Inter,sans-serif'}}>
                            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                          </select>
                        ) : (
                          <input type={f.type} value={reportForm[f.field]} placeholder={f.placeholder}
                            onChange={e => setReportForm(r=>({...r,[f.field]:e.target.value}))}
                            style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #d1d5db',fontSize:14,color:'#111',background:dk.bgCard,outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}} />
                        )}
                      </div>
                    ))}
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Team size</label>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {[['solo','Just me'],['2-5','2–5 people'],['6-15','6–15 people'],['15+','15+ people']].map(([v,l])=>(
                          <button key={v} onClick={()=>setReportForm(r=>({...r,size:v}))}
                            style={{padding:'8px 16px',borderRadius:10,border:'1.5px solid',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .15s',
                              borderColor:reportForm.size===v?'#10b981':'#d1d5db',
                              background:reportForm.size===v?'#f0fdf4':dk.bgCard,
                              color:reportForm.size===v?'#065f46':'#6b7280'}}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { if(reportForm.email&&reportForm.name) jGoTo('report-preview'); }}
                      style={{marginTop:8,padding:'14px',borderRadius:14,border:'none',background:'#10b981',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,.3)',transition:'all .2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='#059669';e.currentTarget.style.transform='translateY(-1px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='#10b981';e.currentTarget.style.transform='translateY(0)';}}>
                      Generate my free report →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: report-preview ───────────────────────────────────── */}
              {jStep === 'report-preview' && (
                <div style={{maxWidth:680,margin:'0 auto'}}>
                  <div style={{background:dk.bgCard,borderRadius:20,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,.07)'}}>
                    {/* Header */}
                    <div style={{background:'linear-gradient(135deg,#052e16,#064e3b)',padding:'28px 32px',position:'relative'}}>
                      <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)',backgroundSize:'20px 20px'}} />
                      <div style={{position:'relative'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                          <img src="/toggle-logo.svg" style={{width:52,height:26}} />
                          <span style={{fontWeight:800,fontSize:15,color:'white'}}>LocAI</span>
                          <span style={{fontSize:11,fontWeight:700,color:'#34d399',background:'rgba(52,211,153,.15)',border:'1px solid rgba(52,211,153,.3)',borderRadius:6,padding:'2px 8px',marginLeft:4}}>FREE REPORT</span>
                        </div>
                        <h3 style={{fontSize:20,fontWeight:800,color:'white',margin:'0 0 4px'}}>AI Opportunity Report</h3>
                        <p style={{fontSize:13,color:'rgba(255,255,255,.5)',margin:0}}>{reportForm.name || 'Your business'} · {reportForm.area || 'Local'}</p>
                      </div>
                    </div>
                    {/* Body */}
                    <div style={{padding:'28px 32px',display:'flex',flexDirection:'column',gap:20}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                        {[
                          { label:'Time saved per week', value:reportEst.timePerWeek, icon:'⏱️', color:'#10b981' },
                          { label:'Est. revenue uplift', value:reportEst.revenuePerMonth, icon:'💰', color:'#10b981' },
                        ].map(s=>(
                          <div key={s.label} style={{background:dk.bgCardAlt,borderRadius:14,padding:'16px',border:'1px solid #f3f4f6'}}>
                            <div style={{marginBottom:6}}><E3D emoji={s.icon} size={20} anim="bounce" /></div>
                            <div style={{fontSize:22,fontWeight:800,color:s.color,letterSpacing:'-0.5px'}}>{s.value}</div>
                            <div style={{fontSize:12,color:'#9ca3af',marginTop:2}}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{background:dk.bgSection,borderRadius:14,padding:'16px',border:'1px solid #bbf7d0'}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Best AI feature for your business</div>
                        <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{reportEst.bestFeature}</div>
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Where you'll save most time</div>
                        {['Booking AI & appointment reminders','Smart customer comms & auto-replies','Review management & reputation'].map((f,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:i<2?'1px solid #f3f4f6':'none'}}>
                            <div style={{width:8,height:8,borderRadius:'50%',background:['#10b981','#34d399','#059669'][i],flexShrink:0}} />
                            <span style={{fontSize:14,color:'#374151'}}>{f}</span>
                            <div style={{marginLeft:'auto',fontSize:12,fontWeight:700,color:'#6b7280'}}>{['−{0}%','−{0}%','−{0}%'][i].replace('{0}',['50','65','70'][i])} manual work</div>
                          </div>
                        ))}
                      </div>
                      <p style={{fontSize:12,color:'#9ca3af',textAlign:'center',margin:0}}>This report is an estimate based on average results across similar businesses. Your results may vary.</p>
                    </div>
                  </div>
                  <div style={{marginTop:20,display:'flex',gap:12,flexWrap:'wrap'}}>
                    <button onClick={() => jGoTo('postcode')}
                      style={{flex:1,padding:'14px',borderRadius:14,border:'none',background:'#10b981',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,.3)'}}>
                      See AI use in my area →
                    </button>
                    <button onClick={() => setShowSetup(true)}
                      style={{flex:1,padding:'14px',borderRadius:14,border:'1.5px solid #10b981',background:dk.bgCard,color:'#10b981',fontSize:15,fontWeight:700,cursor:'pointer'}}>
                      Get this set up for me
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: package (builder) ────────────────────────────────── */}
              {jStep === 'package' && (
                <div style={{maxWidth:660,margin:'0 auto'}}>
                  <div style={{textAlign:'center',marginBottom:28}}>
                    <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#052e16,#064e3b)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}><E3D emoji="🚀" size={24} anim="bounce" /></div>
                    <h2 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.5px',color:'#111',marginBottom:8}}>Build your AI package</h2>
                    <p style={{fontSize:15,color:'#6b7280'}}>Pick the features you want. We'll build and manage everything.</p>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                    {PACKAGE_FEATURES.map(f => (
                      <div key={f.id} onClick={() => setPkgFeatures(p=>({...p,[f.id]:!p[f.id]}))}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'16px 20px',borderRadius:14,border:'2px solid',cursor:'pointer',transition:'all .2s',
                          borderColor:pkgFeatures[f.id]?'#10b981':'#e5e7eb',
                          background:pkgFeatures[f.id]?'#f0fdf4':dk.bgCard}}>
                        <E3D emoji={f.icon} size={24} style={{flexShrink:0}} />
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14,color:'#111'}}>{f.label}</div>
                          <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{f.desc}</div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#10b981'}}>+£{f.price}/mo</div>
                          <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid',marginTop:4,display:'flex',alignItems:'center',justifyContent:'center',borderColor:pkgFeatures[f.id]?'#10b981':'#d1d5db',background:pkgFeatures[f.id]?'#10b981':'transparent',marginLeft:'auto'}}>
                            {pkgFeatures[f.id] && <I.check s={10} c="text-white" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'linear-gradient(135deg,#052e16,#064e3b)',borderRadius:16,padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                    <div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>Your custom package</div>
                      <div style={{fontSize:28,fontWeight:800,color:'#34d399',letterSpacing:'-1px'}}>£{pkgPrice}<span style={{fontSize:14,color:'rgba(255,255,255,.4)'}}>/mo</span></div>
                    </div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.5)'}}>Includes setup · cancel anytime</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
                    {[['name','Your name','text'],['email','Email address','email'],['phone','Phone number','tel']].map(([k,ph,t])=>(
                      <input key={k} type={t} value={pkgDetails[k]} placeholder={ph}
                        onChange={e=>setPkgDetails(p=>({...p,[k]:e.target.value}))}
                        style={{padding:'11px 14px',borderRadius:12,border:'1.5px solid #d1d5db',fontSize:14,fontFamily:'Inter,sans-serif',outline:'none'}} />
                    ))}
                  </div>
                  <button onClick={() => { if(pkgDetails.email) jGoTo('postcode'); }}
                    style={{width:'100%',padding:'14px',borderRadius:14,border:'none',background:'#10b981',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,.3)'}}>
                    Continue — see AI in my area →
                  </button>
                </div>
              )}

              {/* STEP: postcode ─────────────────────────────────────────── */}
              {jStep === 'postcode' && (
                <div style={{maxWidth:520,margin:'0 auto',textAlign:'center'}}>
                  <div style={{marginBottom:16}}><E3D emoji="📍" size={48} anim="bounce" /></div>
                  <h2 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.5px',color:'#111',marginBottom:10}}>Where is your business?</h2>
                  <p style={{fontSize:15,color:'#6b7280',marginBottom:32}}>Enter your postcode and we'll show you a 3D view of AI adoption in your area.</p>
                  <form onSubmit={e=>{ e.preventDefault(); if(journeyPostcode.trim().length>1){ const r=getRegion(journeyPostcode); setJourneyRegion(r); jGoTo('city'); }}}
                    style={{display:'flex',gap:10,background:dk.bgCard,borderRadius:16,padding:8,boxShadow:'0 4px 24px rgba(0,0,0,.09)',border:'1.5px solid #e5e7eb',marginBottom:16}}>
                    <input type="text" value={journeyPostcode} placeholder="Enter postcode, e.g. SW1A or M1 1AD"
                      onChange={e=>setJourneyPostcode(e.target.value)}
                      style={{flex:1,padding:'12px 16px 12px 12px',border:'none',outline:'none',fontSize:15,fontFamily:'Inter,sans-serif',color:'#111'}} />
                    <button type="submit"
                      style={{flexShrink:0,padding:'12px 22px',borderRadius:10,border:'none',background:'#10b981',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 8px rgba(16,185,129,.3)'}}>
                      Show my area →
                    </button>
                  </form>
                  <div style={{display:'flex',justifyContent:'center',gap:8,flexWrap:'wrap'}}>
                    {[{flag:'🇬🇧',city:'London',c:'SW1A'},{flag:'🇬🇧',city:'Manchester',c:'M1'},{flag:'🇬🇧',city:'Birmingham',c:'B1'}].map(p=>(
                      <button key={p.c} onClick={()=>{ setJourneyPostcode(p.c); const r=getRegion(p.c); setJourneyRegion(r); jGoTo('city'); }}
                        style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'#10b981',border:'1px solid #bbf7d0',borderRadius:100,padding:'4px 14px',background:dk.bgSection,cursor:'pointer',fontWeight:600}}>
                        <E3D emoji={p.flag} size={14} anim="float" interactive={false} />{p.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: city (3D view) ────────────────────────────────────── */}
              {jStep === 'city' && (
                <div>
                  <div style={{textAlign:'center',marginBottom:24}}>
                    <h2 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.5px',color:'#111',marginBottom:8}}>
                      AI in <span style={{color:'#10b981'}}>{(CITY_STATS[journeyRegion]||CITY_STATS.default).name}</span>
                    </h2>
                    <p style={{fontSize:14,color:'#6b7280'}}>
                      Green buildings = businesses using AI. The taller the building, the greater the result.
                    </p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:24,alignItems:'start'}}>
                    <div>
                      <CityCanvas region={journeyRegion} />
                      {/* Legend */}
                      <div style={{display:'flex',gap:16,marginTop:12,justifyContent:'center'}}>
                        {[['#10b981','AI-powered'],['#94a3b8','Not yet using AI']].map(([c,l])=>(
                          <div key={l} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#6b7280'}}>
                            <div style={{width:12,height:12,background:c,borderRadius:3}} />{l}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Stats panel */}
                    <div style={{minWidth:200,display:'flex',flexDirection:'column',gap:12}}>
                      {(() => { const cs = CITY_STATS[journeyRegion]||CITY_STATS.default; return (
                        <>
                          <div style={{background:dk.bgCard,borderRadius:16,border:'1px solid #e5e7eb',padding:'16px',boxShadow:'0 2px 12px rgba(0,0,0,.05)'}}>
                            <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>AI adoption</div>
                            <div style={{fontSize:32,fontWeight:800,color:'#10b981',letterSpacing:'-1px'}}>{cs.adoption}%</div>
                            <div style={{height:6,background:dk.bgMuted,borderRadius:3,marginTop:8,overflow:'hidden'}}>
                              <div style={{height:'100%',width:cs.adoption+'%',background:'linear-gradient(90deg,#10b981,#34d399)',borderRadius:3,transition:'width 1s ease'}} />
                            </div>
                          </div>
                          <div style={{background:dk.bgCard,borderRadius:16,border:'1px solid #e5e7eb',padding:'16px'}}>
                            <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>Businesses using AI</div>
                            <div style={{fontSize:24,fontWeight:800,color:'#111'}}>{cs.count}</div>
                          </div>
                          <div style={{background:dk.bgCard,borderRadius:16,border:'1px solid #e5e7eb',padding:'16px'}}>
                            <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>Avg revenue boost</div>
                            <div style={{fontSize:24,fontWeight:800,color:'#10b981'}}>{cs.avgIncrease}</div>
                          </div>
                          <div style={{background:dk.bgCard,borderRadius:16,border:'1px solid #e5e7eb',padding:'16px'}}>
                            <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>Top AI feature</div>
                            <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{cs.topFeature}</div>
                          </div>
                        </>
                      ); })()}
                    </div>
                  </div>
                  <div style={{marginTop:28,display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                    <button onClick={() => setShowSetup(true)}
                      style={{padding:'14px 28px',borderRadius:14,border:'none',background:'#10b981',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,.3)'}}>
                      Get AI for my business →
                    </button>
                    <button onClick={() => { setJourneyOpen(false); window.scrollTo({top:0,behavior:'smooth'}); }}
                      style={{padding:'14px 24px',borderRadius:14,border:'1.5px solid #e5e7eb',background:dk.bgCard,color:'#6b7280',fontSize:15,fontWeight:600,cursor:'pointer'}}>
                      Explore the site
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── EXPLORE: postcode search (moved from hero) ────────────────────── */}
      <section id="explore" style={{padding:'80px 24px',background:dk.bgPage}}>
        <div style={{maxWidth:860,margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'inline-block',background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
            <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:6,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
            Real examples
          </div>
          <h2 style={{fontSize:'clamp(24px,3.5vw,40px)',fontWeight:800,letterSpacing:'-1px',marginBottom:12,lineHeight:1.15,color:'#0a1a0f'}}>
            See AI results near your postcode
          </h2>
          <p style={{fontSize:16,color:'#4b5563',maxWidth:480,margin:'0 auto 32px',lineHeight:1.7}}>
            Real businesses. Real results. Enter your postcode to see which local trades are already using AI and what it's doing for them.
          </p>
          <form onSubmit={handleSearch} style={{maxWidth:560,margin:'0 auto 12px',display:'flex',gap:10,background:dk.bgCard,borderRadius:18,padding:8,boxShadow:'0 6px 32px rgba(0,0,0,.1)',border:'1.5px solid #e5e7eb'}}
            onFocus={e=>e.currentTarget.style.borderColor='#10b981'}
            onBlur={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
            <div style={{flex:1,position:'relative'}}>
              <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><E3D emoji="📍" size={18} anim="bounce" interactive={false} /></span>
              <input ref={postcodeRef} type="text" placeholder="Enter postcode, e.g. SW1A or M1 1AD" value={postcode}
                onChange={e=>{setPostcode(e.target.value);setPostcodeError('');}}
                style={{width:'100%',padding:'13px 13px 13px 44px',border:'none',outline:'none',fontSize:14,color:'#111',background:'transparent',fontFamily:'Inter,sans-serif'}} />
            </div>
            <button type="submit" style={{flexShrink:0,padding:'13px 22px',borderRadius:12,border:'none',background:'#10b981',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              Search <I.arrow s={14} />
            </button>
          </form>
          {postcodeError && <p style={{color:'#ef4444',fontSize:13,marginBottom:8}}>{postcodeError}</p>}
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,flexWrap:'wrap'}}>
            <span style={{fontSize:12,color:'#9ca3af',fontWeight:500}}>Try:</span>
            {[{flag:'🇬🇧',city:'London',code:'SW1A 1AA'},{flag:'🇬🇧',city:'Manchester',code:'M1 1AD'},{flag:'🇬🇧',city:'Birmingham',code:'B1 1BB'}].map(p=>(
              <button key={p.code} onClick={()=>doSearch(p.code)}
                style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,color:'#10b981',border:'1px solid #bbf7d0',borderRadius:100,padding:'4px 12px',background:dk.bgSection,cursor:'pointer',fontWeight:600}}>
                <E3D emoji={p.flag} size={13} anim="float" interactive={false} />{p.city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────────────────────────── */}
      {searchedPostcode && (
        <section id="results" style={{background:dk.bgPage,paddingBottom:80}}>
          {/* Sticky header */}
          <div style={{background:'linear-gradient(135deg,#052e16,#064e3b)',position:'sticky',top:68,zIndex:40,padding:'18px 24px',boxShadow:'0 4px 20px rgba(0,0,0,.2)'}}>
            <div style={{maxWidth:1120,margin:'0 auto',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:0}}>
                <h2 style={{margin:0,fontSize:18,fontWeight:800,color:'white'}}>
                  AI businesses near <span style={{color:'#34d399'}}>{searchedPostcode}</span>
                </h2>
                <p style={{margin:'2px 0 0',fontSize:13,color:'rgba(255,255,255,.5)'}}>{cityName} · {cityResults.length} businesses found</p>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <form onSubmit={handleSearch} style={{display:'flex',gap:6,background:'rgba(255,255,255,.1)',borderRadius:10,padding:'5px 5px 5px 12px',border:'1px solid rgba(255,255,255,.15)'}}>
                  <input value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="New postcode…"
                    style={{background:'none',border:'none',outline:'none',color:'white',fontSize:13,width:140,fontFamily:'Inter,sans-serif'}}
                  />
                  <button type="submit" style={{background:'#10b981',border:'none',color:'white',borderRadius:7,padding:'5px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Go</button>
                </form>
                <button onClick={() => { setSearchedPostcode(''); setCityResults([]); setPostcode(''); window.scrollTo({top:0,behavior:'smooth'}); }}
                  style={{color:'rgba(255,255,255,.6)',background:'none',border:'1px solid rgba(255,255,255,.2)',borderRadius:8,padding:'6px 12px',fontSize:12,cursor:'pointer',fontWeight:500}}>
                  ✕ Clear
                </button>
              </div>
            </div>
          </div>

          {/* Industry filter */}
          <div style={{background:dk.bgCard,borderBottom:'1px solid #e5e7eb',padding:'14px 24px',position:'sticky',top:134,zIndex:39}}>
            <div style={{maxWidth:1120,margin:'0 auto',display:'flex',gap:8,overflowX:'auto',paddingBottom:2}}>
              {industries.map(ind => (
                <button key={ind} onClick={() => setSelectedIndustry(ind)}
                  style={{flexShrink:0,padding:'7px 18px',borderRadius:100,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .15s',
                    background:selectedIndustry===ind ? '#10b981' : '#f3f4f6',
                    color:selectedIndustry===ind ? 'white' : '#6b7280',
                    boxShadow:selectedIndustry===ind ? '0 2px 8px rgba(16,185,129,.3)' : 'none'}}>
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* ── LOCAL OFFERS ── */}
          {regionOffers.length > 0 && (
            <div style={{maxWidth:1120,margin:'0 auto',padding:'28px 24px 0'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <E3D emoji="🏷️" size={20} anim="wiggle" />
                <h3 style={{margin:0,fontSize:18,fontWeight:800,color:'#111'}}>Local offers near <span style={{color:'#10b981'}}>{searchedPostcode}</span></h3>
                <span style={{fontSize:12,fontWeight:700,color:'white',background:'#ef4444',borderRadius:100,padding:'2px 10px',letterSpacing:.5,flexShrink:0}}>EXCLUSIVE</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14,marginBottom:32}}>
                {regionOffers.map(offer => (
                  <div key={offer.id} className="card-lift"
                    style={{background:offer.light,borderRadius:16,border:`1.5px solid ${offer.color}22`,padding:'16px 18px',cursor:'pointer',transition:'border-color .2s',position:'relative',overflow:'hidden'}}
                    onMouseEnter={e => e.currentTarget.style.borderColor=offer.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor=`${offer.color}22`}
                  >
                    {/* Badge top-right */}
                    <div style={{position:'absolute',top:12,right:12,background:offer.color,color:'white',fontSize:10,fontWeight:700,borderRadius:8,padding:'3px 9px',letterSpacing:.4}}>
                      {offer.badge}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{width:40,height:40,borderRadius:12,background:dk.bgCard,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 2px 8px ${offer.color}22`}}>
                        <E3D emoji={offer.icon} size={20} />
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#111',lineHeight:1.2}}>{offer.biz}</div>
                        <div style={{fontSize:11,color:'#6b7280',marginTop:2}}>{offer.area} · {offer.industry}</div>
                      </div>
                    </div>
                    <p style={{fontSize:14,fontWeight:700,color:offer.color,margin:'0 0 8px',lineHeight:1.4}}>{offer.offer}</p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontSize:11,color:'#9ca3af'}}>Expires: {offer.expires}</span>
                      <span style={{fontSize:12,fontWeight:600,color:offer.color}}>Claim →</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Divider */}
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:28}}>
                <div style={{flex:1,height:1,background:dk.bgDivider}} />
                <span style={{fontSize:12,fontWeight:600,color:'#9ca3af',whiteSpace:'nowrap'}}>AI-powered businesses nearby</span>
                <div style={{flex:1,height:1,background:dk.bgDivider}} />
              </div>
            </div>
          )}

          {/* Business grid */}
          <div style={{maxWidth:1120,margin:'0 auto',padding:'0 24px 32px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20,marginBottom:48}}>
              {filteredResults.map((biz, i) => (
                <div key={biz.id} onClick={() => navigate(`/industry/${biz.slug}`)}
                  className="card-lift animate-stagger-in"
                  style={{background:dk.bgCard,borderRadius:20,border:'1px solid #e5e7eb',overflow:'hidden',cursor:'pointer',transition:'border-color .2s',animationDelay:`${i*60}ms`}}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#10b981'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}
                >
                  {/* Image */}
                  <div style={{height:160,position:'relative',overflow:'hidden'}}>
                    <img src={biz.image} alt={biz.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s'}}
                      onMouseEnter={e => e.target.style.transform='scale(1.06)'}
                      onMouseLeave={e => e.target.style.transform='scale(1)'}
                    />
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 60%,transparent 100%)'}} />
                    <div style={{position:'absolute',bottom:12,left:14,right:14}}>
                      <div style={{fontSize:14,fontWeight:700,color:'white'}}>{biz.name}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>{biz.area}</div>
                    </div>
                    {biz.verified && (
                      <div style={{position:'absolute',top:10,right:10,width:22,height:22,background:'#10b981',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(16,185,129,.5)'}}>
                        <I.check s={9} />
                      </div>
                    )}
                  </div>
                  {/* Body */}
                  <div style={{padding:'16px'}}>
                    <span style={{display:'inline-block',fontSize:11,fontWeight:700,color:'#065f46',background:'#dcfce7',borderRadius:6,padding:'3px 9px',marginBottom:10}}>
                      {biz.industryLabel}
                    </span>
                    {/* Key AI result */}
                    <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:8}}>
                      <span style={{fontSize:30,fontWeight:900,color:'#10b981',letterSpacing:'-1px',lineHeight:1}}>{biz.headline}</span>
                      <span style={{fontSize:12,color:'#6b7280',lineHeight:1.3}}>{biz.headlineLabel}</span>
                    </div>
                    <p style={{fontSize:13,color:'#6b7280',lineHeight:1.65,marginBottom:14,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {biz.story}
                    </p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid #f3f4f6'}}>
                      <span style={{fontSize:11,color:'#9ca3af',fontWeight:500}}>{biz.aiTool}</span>
                      <span style={{fontSize:13,color:'#10b981',fontWeight:600}}>See how →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results CTA */}
            <div style={{background:'linear-gradient(145deg,#052e16,#064e3b)',borderRadius:24,padding:'48px 40px',textAlign:'center',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px)',backgroundSize:'24px 24px',pointerEvents:'none'}} />
              <div style={{position:'relative'}}>
                <h3 style={{fontSize:24,fontWeight:800,color:'white',marginBottom:10}}>
                  Want your {cityName} business on this list?
                </h3>
                <p style={{fontSize:15,color:'rgba(255,255,255,.6)',marginBottom:28,maxWidth:420,margin:'0 auto 28px',lineHeight:1.7}}>
                  Every business above went live in under 48 hours — no tech skills, no long contracts.
                </p>
                <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                  <button onClick={() => setShowSetup(true)}
                    style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 28px',borderRadius:14,border:'none',background:'#10b981',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(16,185,129,.4)',transition:'all .2s'}}
                    onMouseEnter={e => { e.currentTarget.style.background='#059669'; e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#10b981'; e.currentTarget.style.transform='translateY(0)'; }}
                  >
                    Get my free AI setup <I.arrow s={15} />
                  </button>
                  <button onClick={() => navigate('/app')}
                    style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 24px',borderRadius:14,border:'1px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.08)',color:'white',fontSize:15,fontWeight:600,cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.15)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.08)'}
                  >
                    Browse all industries
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TICKER / SOCIAL PROOF ────────────────────────────────────────── */}
      <div style={{borderTop:'1px solid #bbf7d0',borderBottom:'1px solid #bbf7d0',background:dk.bgPage,padding:'16px 0',overflow:'hidden'}}>
        <div className="ticker-track" ref={tickerRef}>
          {[...Array(2)].flatMap((_, ci) =>
            ['Manchester · 34 businesses live', '🇬🇧 London · 81 businesses live', '🇺🇸 New York · 52 businesses live', '🇦🇺 Sydney · 27 businesses live', '🇨🇦 Toronto · 19 businesses live', '🇦🇪 Dubai · 14 businesses live', 'Birmingham · 23 businesses live', '🇸🇬 Singapore · 16 businesses live', 'Miami · 21 businesses live'].map((t, i) => (
              <span key={`${ci}-${i}`} style={{display:'inline-flex',alignItems:'center',gap:12,padding:'0 32px',whiteSpace:'nowrap',fontSize:13,color:'#6b7280',fontWeight:500}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:'#10b981',flexShrink:0}} />
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── logo divider: map → features ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.18,background:dk.bgPage}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── 7. TABBED FEATURES SECTION ───────────────────────────────────── */}
      <section id="features" style={{padding:'80px 24px',background:dk.bgPage}}>
        <div style={{maxWidth:1120,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <div style={{display:'inline-block',background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:6,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              What LocAI does
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-0.5px',marginBottom:16,lineHeight:1.15,color:'#0a1a0f'}}>Everything your business needs to run on AI</h2>
          </div>

          {/* Tab bar */}
          <div style={{display:'flex',gap:4,background:dk.bgMuted,borderRadius:16,padding:4,marginBottom:36,overflowX:'auto'}}>
            {['ROI Calculator','Industry Tour','Competitor Check','Build Your Package'].map((tab,i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                style={{flex:1,minWidth:140,padding:'11px 16px',borderRadius:12,border:'none',cursor:'pointer',fontSize:14,fontWeight:700,transition:'all .2s',whiteSpace:'nowrap',
                  background: activeTab===i ? dk.bgCard : 'transparent',
                  color: activeTab===i ? (isDark ? '#34d399' : '#111') : dk.textMuted,
                  boxShadow: activeTab===i ? (isDark ? '0 2px 8px rgba(0,0,0,.4)' : '0 2px 8px rgba(0,0,0,.08)') : 'none',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content wrapper with max-height scroll */}
          <div style={{maxHeight:520,overflowY:'auto',borderRadius:16}}>

          {/* ── Tab 0: ROI Calculator ── */}
          {activeTab === 0 && (() => {
            const monthlyRevLost = Math.round(roiMissed * roiValue * 4.3);
            const adminCost = Math.round(roiAdmin * 25 * 4.3);
            const total = monthlyRevLost + adminCost;
            return (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,alignItems:'start'}}>
                <div style={{background:'#020c07',borderRadius:24,padding:'36px 32px',color:'white'}}>
                  <h3 style={{fontSize:22,fontWeight:800,marginBottom:8,color:'white'}}>How much are you losing right now?</h3>
                  <p style={{fontSize:14,color:'rgba(255,255,255,.5)',marginBottom:32}}>Move the sliders to see your numbers</p>
                  {[
                    {label:'Missed enquiries per week',val:roiMissed,set:setRoiMissed,min:1,max:50,suffix:''},
                    {label:'Average job / order value (£)',val:roiValue,set:setRoiValue,min:10,max:2000,suffix:'£'},
                    {label:'Hours spent on admin per week',val:roiAdmin,set:setRoiAdmin,min:1,max:40,suffix:''},
                  ].map(sl => (
                    <div key={sl.label} style={{marginBottom:24}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <label style={{fontSize:13,color:'rgba(255,255,255,.65)',fontWeight:500}}>{sl.label}</label>
                        <span style={{fontSize:14,fontWeight:800,color:'#34d399'}}>{sl.suffix}{sl.val}</span>
                      </div>
                      <input type="range" min={sl.min} max={sl.max} value={sl.val} onChange={e=>sl.set(Number(e.target.value))}
                        style={{width:'100%',accentColor:'#10b981'}} />
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  {[
                    {label:'💸 Monthly revenue lost',val:`£${monthlyRevLost.toLocaleString()}`,color:'#ef4444'},
                    {label:'⏰ Admin time cost',val:`£${adminCost.toLocaleString()}/mo`,color:'#f59e0b'},
                    {label:'📈 Total monthly opportunity',val:`£${total.toLocaleString()}`,color:'#10b981',big:true},
                  ].map(r => (
                    <div key={r.label} style={{background: r.big ? '#f0fdf4' : '#f9fafb',border:`1.5px solid ${r.big ? '#bbf7d0' : '#e5e7eb'}`,borderRadius:16,padding:'20px 24px'}}>
                      <div style={{fontSize:13,color:'#6b7280',marginBottom:6}}>{r.label}</div>
                      <div style={{fontSize: r.big ? 36 : 28,fontWeight:900,color:r.color,letterSpacing:'-1px',lineHeight:1}}>{r.val}</div>
                    </div>
                  ))}
                  <button onClick={() => setShowSetup(true)}
                    style={{padding:'16px',borderRadius:16,border:'none',background:'#10b981',color:'white',fontSize:16,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(16,185,129,.4)',transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='#059669';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='#10b981';e.currentTarget.style.transform='';}}
                  >Recover £{total.toLocaleString()}/month with LocAI →</button>
                </div>
              </div>
            );
          })()}

          {/* ── Tab 1: Industry Tour ── */}
          {activeTab === 1 && (
            <div style={{display:'flex',flexDirection:'column',gap:40}}>
              {/* A: Industry selector */}
              <div>
                <h3 style={{fontSize:20,fontWeight:800,marginBottom:20,color:'#111'}}>I'm a...</h3>
                <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:tourIndustry ? 24 : 0}}>
                  {[
                    {key:'plumber',label:'🔧 Plumber'},
                    {key:'salon',label:'💇 Salon owner'},
                    {key:'restaurant',label:'🍽️ Restaurant'},
                    {key:'florist',label:'🌸 Florist'},
                    {key:'dentist',label:'🦷 Dentist'},
                    {key:'landscaper',label:'🌿 Landscaper'},
                  ].map(ind => (
                    <button key={ind.key} onClick={() => setTourIndustry(ind.key)}
                      style={{padding:'10px 20px',borderRadius:12,border:'2px solid',cursor:'pointer',fontSize:14,fontWeight:700,transition:'all .2s',
                        borderColor: tourIndustry===ind.key ? '#10b981' : '#e5e7eb',
                        background: tourIndustry===ind.key ? '#f0fdf4' : dk.bgCard,
                        color: tourIndustry===ind.key ? '#065f46' : '#374151',
                      }}>
                      {ind.label}
                    </button>
                  ))}
                </div>
                {tourIndustry && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:8}}>
                    {({
                      plumber:['Emergency call-out AI captures lead instantly','Auto-quote follow-ups chase every unanswered estimate','Review request sent after every completed job'],
                      salon:['24/7 booking — fill every empty slot automatically','AI reminds clients 48hrs before to cut no-shows','Social content posts your before/afters automatically'],
                      restaurant:['Reservation system handles all bookings by message','Review replies managed for every table you serve','Daily specials posted to social without lifting a finger'],
                      florist:['Order chatbot takes orders while you arrange flowers','Occasion reminders re-engage past customers automatically','Instagram posts your arrangements with perfect captions'],
                      dentist:['Patient recall messages bring back lapsed patients','Intake form AI handles new patient enquiries instantly','5-star review follow-up after every appointment'],
                      landscaper:['Quote request chatbot captures every enquiry 24/7','Seasonal upsell reminders grow average order value','Job completion review requests on autopilot'],
                    }[tourIndustry]||[]).map((step,i) => (
                      <div key={i} style={{background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:16,padding:'20px 18px'}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:'#10b981',color:'white',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>{i+1}</div>
                        <div style={{fontSize:14,fontWeight:600,color:'#065f46',lineHeight:1.5}}>{step}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* B: Time saved */}
              <div style={{background:dk.bgCardAlt,border:'1px solid #e5e7eb',borderRadius:20,padding:'32px'}}>
                <h3 style={{fontSize:18,fontWeight:800,marginBottom:20,color:'#111'}}>How many hours/week on admin?</h3>
                <div style={{display:'flex',alignItems:'center',gap:24}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{fontSize:13,color:'#6b7280'}}>Hours per week</span>
                      <span style={{fontSize:16,fontWeight:800,color:'#10b981'}}>{timeSavedHours} hrs</span>
                    </div>
                    <input type="range" min={1} max={40} value={timeSavedHours} onChange={e=>setTimeSavedHours(Number(e.target.value))} style={{width:'100%',accentColor:'#10b981'}} />
                  </div>
                  <div style={{textAlign:'center',background:'#10b981',borderRadius:16,padding:'20px 28px',color:'white',flexShrink:0}}>
                    <div style={{fontSize:32,fontWeight:900,lineHeight:1}}>{timeSavedHours}</div>
                    <div style={{fontSize:11,opacity:.8}}>hrs/week back</div>
                    <div style={{fontSize:13,fontWeight:700,marginTop:4}}>{Math.round(timeSavedHours*52/8)} days/year</div>
                  </div>
                </div>
              </div>

              {/* C: Booking simulation */}
              <div>
                <h3 style={{fontSize:18,fontWeight:800,marginBottom:20,color:'#111'}}>See LocAI in action</h3>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <div style={{width:260,background:'#111',borderRadius:36,padding:'16px 8px',boxShadow:'0 20px 60px rgba(0,0,0,.4)'}}>
                    {/* Phone header */}
                    <div style={{textAlign:'center',color:'white',fontSize:22,fontWeight:700,letterSpacing:'-0.5px',marginBottom:16,paddingTop:4}}>11:58 PM</div>
                    <div style={{background:dk.bgCard,borderRadius:28,padding:'16px',minHeight:260,display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#6b7280',textAlign:'center',marginBottom:4}}>Chat with LocAI</div>
                      {/* Customer message */}
                      {simPhase >= 1 && (
                        <div style={{background:dk.bgDivider,borderRadius:'16px 16px 16px 4px',padding:'10px 12px',fontSize:12,color:'#111',maxWidth:'85%',lineHeight:1.5}}>
                          Hi, can I book a haircut tomorrow at 10am?
                        </div>
                      )}
                      {/* Typing indicator */}
                      {simPhase === 2 && (
                        <div style={{background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:'16px 16px 4px 16px',padding:'10px 14px',fontSize:14,maxWidth:'85%',alignSelf:'flex-end'}}>
                          <span style={{animation:'blink 0.6s infinite'}}>●</span>
                          <span style={{animation:'blink 0.6s 0.2s infinite',margin:'0 3px'}}>●</span>
                          <span style={{animation:'blink 0.6s 0.4s infinite'}}>●</span>
                        </div>
                      )}
                      {/* AI reply */}
                      {simPhase >= 3 && simReply && (
                        <div style={{background:'#10b981',borderRadius:'16px 16px 4px 16px',padding:'10px 12px',fontSize:12,color:'white',maxWidth:'85%',alignSelf:'flex-end',lineHeight:1.5}}>
                          {simReply}
                        </div>
                      )}
                      {/* Booking confirmed */}
                      {simPhase === 4 && (
                        <div style={{background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:12,padding:'10px 12px',marginTop:4}}>
                          <div style={{fontSize:11,fontWeight:700,color:'#065f46'}}>📅 Booking confirmed</div>
                          <div style={{fontSize:11,color:'#374151',marginTop:2}}>Tomorrow · 10:00 AM</div>
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:'center',marginTop:10,fontSize:10,color:'rgba(255,255,255,.5)'}}>All while you were asleep</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 2: Competitor Check ── */}
          {activeTab === 2 && (
            <div style={{maxWidth:600,margin:'0 auto'}}>
              <div style={{textAlign:'center',marginBottom:36}}>
                <h3 style={{fontSize:24,fontWeight:800,color:'#111',marginBottom:8}}>Are your competitors already ahead?</h3>
                <p style={{fontSize:15,color:'#6b7280'}}>Enter your postcode to generate a local AI adoption report</p>
              </div>
              <div style={{display:'flex',gap:10,marginBottom:24,background:dk.bgCard,borderRadius:16,padding:8,boxShadow:'0 4px 20px rgba(0,0,0,.08)',border:'1.5px solid #e5e7eb'}}>
                <input type="text" value={competitorPostcode} onChange={e=>setCompetitorPostcode(e.target.value)} placeholder="Enter postcode, e.g. SW1A or M1"
                  style={{flex:1,padding:'12px 16px',border:'none',outline:'none',fontSize:15,fontFamily:'Inter,sans-serif',color:'#111'}} />
                <button onClick={() => {
                  if (!competitorPostcode.trim()) return;
                  setCompetitorLoading(true); setCompetitorResult(null);
                  setTimeout(() => { setCompetitorLoading(false); setCompetitorResult(competitorPostcode.trim().toUpperCase()); }, 1500);
                }}
                  style={{flexShrink:0,padding:'12px 22px',borderRadius:10,border:'none',background:'#10b981',color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>
                  Check now
                </button>
              </div>
              {competitorLoading && (
                <div style={{background:dk.bgCardAlt,border:'1px solid #e5e7eb',borderRadius:16,padding:'28px',textAlign:'center'}}>
                  <div style={{fontSize:14,color:'#6b7280',marginBottom:16}}>Analysing your area...</div>
                  <div style={{height:6,background:dk.bgDivider,borderRadius:3,overflow:'hidden',maxWidth:300,margin:'0 auto'}}>
                    <div style={{height:'100%',background:'linear-gradient(90deg,#10b981,#34d399)',borderRadius:3,animation:'ticker 1.5s ease-in-out infinite',width:'60%'}} />
                  </div>
                </div>
              )}
              {competitorResult && !competitorLoading && (
                <div style={{background:dk.bgCard,border:'1px solid #e5e7eb',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.07)'}}>
                  <div style={{background:'linear-gradient(135deg,#052e16,#064e3b)',padding:'20px 24px'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#6ee7b7',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>AI Adoption Report</div>
                    <div style={{fontSize:18,fontWeight:800,color:'white'}}>📍 {competitorResult} area</div>
                  </div>
                  <div style={{padding:'24px',display:'flex',flexDirection:'column',gap:14}}>
                    {[
                      {icon:'⚠️',text:'3 businesses in your area are already using AI booking',color:'#f59e0b'},
                      {icon:'⚡',text:'1 competitor responds to enquiries in under 60 seconds',color:'#ef4444'},
                      {icon:'✅',text:'You could be the only one offering instant 24/7 replies',color:'#10b981'},
                    ].map((item,i) => (
                      <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',background:dk.bgCardAlt,borderRadius:12,border:'1px solid #e5e7eb'}}>
                        <span style={{fontSize:20,flexShrink:0}}>{item.icon}</span>
                        <span style={{fontSize:14,color:'#374151',lineHeight:1.5,fontWeight:500}}>{item.text}</span>
                      </div>
                    ))}
                    <button onClick={() => setShowSetup(true)}
                      style={{padding:'14px',borderRadius:14,border:'none',background:'#10b981',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,.3)'}}>
                      Be the first in your postcode to fully automate →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 3: Build Your Package ── */}
          {activeTab === 3 && (() => {
            const pkgTabItems = [
              {key:'booking',  icon:'📅', label:'AI Booking & Scheduling',  benefit:'Never miss a booking again',         checked:true},
              {key:'commsTab', icon:'💬', label:'Smart Customer Replies',    benefit:'Answer every message instantly',     checked:true},
              {key:'reviews',  icon:'⭐', label:'Review Management',         benefit:'Grow your star rating on autopilot', checked:false},
              {key:'social',   icon:'📸', label:'Social Media Content',      benefit:'Post 3×/week without lifting a finger',checked:false},
              {key:'analytics',icon:'📊', label:'Revenue Analytics',         benefit:'Know exactly what\'s working',       checked:false},
              {key:'leads',    icon:'🎯', label:'Lead Follow-ups',           benefit:'Chase every quote automatically',    checked:false},
            ];
            const selected = pkgTabItems.filter(i => pkgTabFeatures[i.key]);
            return (
              <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24,alignItems:'start'}}>
                <div>
                  <h3 style={{fontSize:20,fontWeight:800,marginBottom:20,color:'#111'}}>Pick what matters to your business</h3>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {pkgTabItems.map(item => (
                      <div key={item.key} onClick={() => setPkgTabFeatures(p=>({...p,[item.key]:!p[item.key]}))}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'16px 20px',borderRadius:16,border:'2px solid',cursor:'pointer',transition:'all .2s',
                          borderColor: pkgTabFeatures[item.key] ? '#10b981' : '#e5e7eb',
                          background: pkgTabFeatures[item.key] ? '#f0fdf4' : dk.bgCard,
                        }}>
                        <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{item.label}</div>
                          <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{item.benefit}</div>
                        </div>
                        <div style={{width:22,height:22,borderRadius:'50%',border:'2px solid',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                          borderColor: pkgTabFeatures[item.key] ? '#10b981' : '#d1d5db',
                          background: pkgTabFeatures[item.key] ? '#10b981' : 'transparent',
                        }}>
                          {pkgTabFeatures[item.key] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{background:'linear-gradient(145deg,#052e16,#064e3b)',borderRadius:20,padding:'28px',color:'white',position:'sticky',top:80}}>
                  <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:.5,marginBottom:16}}>Your package</div>
                  {selected.length === 0
                    ? <p style={{fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:20}}>Select features above to build your package</p>
                    : selected.map(i => (
                      <div key={i.key} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                        <span style={{fontSize:16}}>{i.icon}</span>
                        <span style={{fontSize:13,color:'rgba(255,255,255,.8)',fontWeight:600}}>{i.label}</span>
                      </div>
                    ))
                  }
                  <div style={{marginTop:20,padding:'16px',background:'rgba(255,255,255,.06)',borderRadius:12,border:'1px solid rgba(255,255,255,.1)'}}>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:4}}>Pricing</div>
                    <div style={{fontSize:14,fontWeight:700,color:'#34d399'}}>Custom — book a call to confirm scope</div>
                  </div>
                  <button onClick={() => setShowSetup(true)}
                    style={{width:'100%',marginTop:16,padding:'14px',borderRadius:12,border:'none',background:'#10b981',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,.35)'}}>
                    Get started →
                  </button>
                </div>
              </div>
            );
          })()}

          </div>{/* end tab content scroll wrapper */}

          {/* Original features grid (shown below tabs always) */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20,marginTop:48}}>
            {FEATURES.map((f, i) => {
              const floatClass = ['float-a','float-b','float-c','float-d'][i];
              const cardDark = f.dark || isDark; // force dark styling in dark theme
              return (
                <div key={i} className="card-lift" style={{position:'relative',overflow:'visible',borderRadius:24,padding:'32px 28px',display:'flex',flexDirection:'column',gap:20,background:cardDark?'linear-gradient(145deg,#052e16,#064e3b)':'white',border:cardDark?'1.5px solid rgba(16,185,129,.3)':'1px solid #e5e7eb',boxShadow:cardDark?'0 20px 56px rgba(5,46,22,.28)':'0 2px 12px rgba(0,0,0,.04)'}}>
                  {cardDark?(<><div style={{position:'absolute',inset:0,borderRadius:24,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px)',backgroundSize:'20px 20px',pointerEvents:'none'}}/><div style={{position:'absolute',top:-40,right:-40,width:200,height:200,background:'radial-gradient(circle,rgba(52,211,153,.15) 0%,transparent 65%)',pointerEvents:'none'}}/></>):(<div style={{position:'absolute',bottom:0,right:0,width:130,height:130,borderRadius:'0 0 24px 0',background:'radial-gradient(circle at bottom right,rgba(16,185,129,.08),transparent 70%)',pointerEvents:'none'}}/>)}
                  <div className={`${floatClass} toast-in`} style={{position:'absolute',top:-16,right:-12,zIndex:10,background:dk.bgCard,borderRadius:12,boxShadow:'0 8px 28px rgba(0,0,0,.11),0 1px 4px rgba(0,0,0,.06)',border:'1px solid #f0fdf4',padding:'7px 11px',display:'flex',alignItems:'center',gap:8,minWidth:178,animationDelay:`${i*0.4}s`}}>
                    <span style={{width:7,height:7,borderRadius:'50%',background:'#10b981',flexShrink:0,boxShadow:'0 0 0 3px rgba(16,185,129,.2)'}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#111',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{f.float.label}</div>
                      <div style={{fontSize:10,color:'#9ca3af',marginTop:1,whiteSpace:'nowrap'}}>{f.float.sub}</div>
                    </div>
                  </div>
                  <div style={{position:'relative',zIndex:1,width:50,height:50,borderRadius:14,flexShrink:0,background:cardDark?'rgba(16,185,129,.18)':'linear-gradient(135deg,#10b981,#059669)',border:cardDark?'1px solid rgba(52,211,153,.3)':'none',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:cardDark?'inset 0 1px 0 rgba(255,255,255,.12)':'0 4px 14px rgba(16,185,129,.35)'}}>{f.icon}</div>
                  <div style={{position:'relative',zIndex:1,flex:1}}><h3 style={{fontSize:17,fontWeight:700,marginBottom:8,letterSpacing:'-0.5px',color:cardDark?'white':'#0a1a0f'}}>{f.title}</h3><p style={{fontSize:14,lineHeight:1.72,color:cardDark?'rgba(255,255,255,.62)':'#4b5563'}}>{f.body}</p></div>
                  <div style={{position:'relative',zIndex:1,marginTop:'auto',display:'inline-flex',alignItems:'center',gap:6,background:cardDark?'rgba(16,185,129,.14)':'#f0fdf4',border:`1px solid ${cardDark?'rgba(52,211,153,.3)':'#bbf7d0'}`,borderRadius:10,padding:'6px 12px',fontSize:13,fontWeight:700,color:cardDark?'#6ee7b7':'#065f46',width:'fit-content'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>{f.stat}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── logo divider: features → what-we-do ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.18,background:dk.bgPage}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── 8. WHAT WE ACTUALLY DO MEGA SECTION ─────────────────────────── */}
      <section id="what-we-do" style={{padding:'80px 24px 0',background:dk.bgPage}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'inline-block',background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:6,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              The full picture
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:900,letterSpacing:'-0.5px',lineHeight:1.1,marginBottom:16,color:'#0a1a0f'}}>What we actually do</h2>
          </div>

          {/* 8a. 3-Panel Explainer */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:2,marginBottom:80}}>
            {[
              { label:'NOW', color:'#7f1d1d', bg:'#fff7f7', border:'#fecaca', items:['Missed calls while you work','Manual booking via DMs','Chasing reviews manually','Writing social posts yourself','No time for follow-ups'] },
              { label:'DAY 1 WITH LOCAI', color:'#065f46', bg:'#f0fdf4', border:'#bbf7d0', highlight:true, items:['AI answers every message instantly','Appointments booked 24/7 automatically','Review requests sent after every job','Social content posted on schedule','Quote follow-ups handled automatically'] },
              { label:'30 DAYS LATER', color:'#065f46', bg:'#f0fdf4', border:'#bbf7d0', items:['+38% bookings','0 missed calls','4.9★ avg rating','6 hrs/wk saved','Revenue up £1,800/mo'] },
            ].map((panel,i) => (
              <div key={i} style={{background:panel.bg,border:`1.5px solid ${panel.border}`,borderRadius: i===0?'20px 0 0 20px':i===2?'0 20px 20px 0':'0',padding:'32px 28px',position:'relative'}}>
                {panel.highlight && <div style={{position:'absolute',top:-1,left:-1,right:-1,bottom:-1,border:'2px solid #10b981',borderRadius:4,pointerEvents:'none'}} />}
                <div style={{fontSize:10,fontWeight:800,color:panel.color,textTransform:'uppercase',letterSpacing:2,marginBottom:16}}>{panel.label}</div>
                <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10}}>
                  {panel.items.map((item,j) => (
                    <li key={j} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:14,color: i===2 ? '#065f46' : '#374151',fontWeight: i===2 ? 800 : 400,lineHeight:1.5}}>
                      <span style={{flexShrink:0,color:panel.color,fontWeight:700}}>{i===0?'✗':i===1?'✓':'→'}</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 8b. Comparison Table */}
          <div style={{marginBottom:80}}>
            <h3 style={{fontSize:24,fontWeight:800,color:'#0a1a0f',letterSpacing:'-0.5px',marginBottom:32,textAlign:'center'}}>Why not just use Zapier / ChatGPT yourself?</h3>
            <div style={{background:dk.bgCard,borderRadius:20,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.06)'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',background:dk.bgCardAlt,borderBottom:'1px solid #e5e7eb'}}>
                <div style={{padding:'16px 24px',fontSize:13,fontWeight:700,color:'#6b7280'}}>Feature</div>
                <div style={{padding:'16px 24px',fontSize:13,fontWeight:800,color:'#065f46',background:dk.bgSection,textAlign:'center'}}>LocAI</div>
                <div style={{padding:'16px 24px',fontSize:13,fontWeight:700,color:'#6b7280',textAlign:'center'}}>DIY Tools</div>
              </div>
              {[
                ['Setup time','Ready in 48 hours','Weeks of configuration'],
                ['Tech skill needed','None — we handle it','Moderate to advanced'],
                ['Local business focus','Built for local trades','Generic, not tailored'],
                ['Ongoing management','Fully managed by us','You manage everything'],
                ['Support','Dedicated account manager','Community forums'],
                ['Cost','Transparent, custom pricing','Multiple subscriptions add up'],
                ['Time to results','Day 1','Weeks or months'],
              ].map(([feat,locai,diy],i) => (
                <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',borderBottom: i<6?'1px solid #f3f4f6':'none'}}>
                  <div style={{padding:'14px 24px',fontSize:14,color:'#374151',fontWeight:500}}>{feat}</div>
                  <div style={{padding:'14px 24px',fontSize:13,color:'#065f46',fontWeight:600,background:dk.bgGreenTint,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    <span style={{color:'#10b981'}}>✓</span>{locai}
                  </div>
                  <div style={{padding:'14px 24px',fontSize:13,color:'#9ca3af',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    <span style={{color:'#ef4444'}}>✗</span>{diy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8c. Trust Bar */}
          <div style={{marginBottom:80,textAlign:'center'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:1.5,marginBottom:20}}>Connects with the tools you already use</div>
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:10}}>
              {['Google Business','WhatsApp','Instagram','Facebook','Calendly','Square','Booksy','Xero','Mailchimp','Stripe'].map(name => (
                <div key={name} style={{background:dk.bgCard,border:'1.5px solid #bbf7d0',color:'#065f46',borderRadius:100,padding:'8px 20px',fontSize:13,fontWeight:600,boxShadow:'0 1px 4px rgba(16,185,129,.08)',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',flexShrink:0}} />
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* 8d. Objections accordion */}
          <div style={{marginBottom:80}}>
            <h3 style={{fontSize:24,fontWeight:800,color:'#0a1a0f',letterSpacing:'-0.5px',marginBottom:32,textAlign:'center'}}>We hear you.</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                {q:"I've tried AI tools before and they didn't work",a:"LocAI isn't another DIY tool you have to figure out yourself. Our team configures everything, tests it, and manages it for you. Most clients are fully live within 48 hours — with nothing to set up or learn."},
                {q:"I don't have time to learn something new",a:"You don't need to learn anything. Our team handles the entire build. Your only job is a 30-minute onboarding call where we capture how your business works. After that, we take care of everything."},
                {q:"It sounds expensive",a:"Most clients recover the cost within the first month from bookings and time saved alone. We build every package around your budget — and there are no long contracts, so you can cancel any time."},
                {q:"My business is too small for this",a:"60% of our clients are sole traders or 1-3 person teams. AI isn't just for big businesses — in fact, small businesses benefit most because they have the least admin support. Even 5 hours a week saved is a game-changer."},
              ].map((item,i) => (
                <div key={i} style={{background:dk.bgCard,border:`1.5px solid ${accordionOpen===i?'#10b981':'#e5e7eb'}`,borderRadius:16,overflow:'hidden',transition:'border-color .2s'}}>
                  <button onClick={() => setAccordionOpen(p => p===i?null:i)}
                    style={{width:'100%',textAlign:'left',padding:'20px 24px',border:'none',background:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
                    <span style={{fontSize:15,fontWeight:700,color:'#111'}}>{item.q}</span>
                    <span style={{flexShrink:0,width:24,height:24,borderRadius:'50%',background:accordionOpen===i?'#10b981':'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accordionOpen===i?'white':'#6b7280'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {accordionOpen===i?<path d="m18 15-6-6-6 6"/>:<path d="m6 9 6 6 6-6"/>}
                      </svg>
                    </span>
                  </button>
                  {accordionOpen===i && (
                    <div style={{padding:'0 24px 20px',fontSize:14,color:'#6b7280',lineHeight:1.7,animation:'cFadeIn .2s ease both'}}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 8e. Day in the Life Timeline */}
          <div style={{marginBottom:80}}>
            <h3 style={{fontSize:24,fontWeight:800,color:'#0a1a0f',letterSpacing:'-0.5px',marginBottom:8,textAlign:'center'}}>Your business on autopilot — all day</h3>
            <p style={{fontSize:15,color:'#4b5563',textAlign:'center',marginBottom:40}}>Every single day, whether you're there or not.</p>
            <div style={{position:'relative',paddingLeft:24}}>
              <div style={{position:'absolute',left:40,top:0,bottom:0,width:2,background:'linear-gradient(to bottom,#10b981,#d1fae5)',zIndex:0}} />
              {(INDUSTRY_TIMELINE[selectedIndustryNav] || INDUSTRY_TIMELINE.default).map((event,i) => (
                <div key={i} style={{display:'flex',gap:24,marginBottom:28,position:'relative',zIndex:1}}>
                  <div style={{flexShrink:0,width:80,textAlign:'right',paddingTop:10}}>
                    <span style={{fontSize:12,fontWeight:700,color:'#9ca3af'}}>{event.time}</span>
                  </div>
                  <div style={{flexShrink:0,width:40,height:40,borderRadius:'50%',background:dk.bgCard,border:'2px solid #10b981',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(16,185,129,.2)',fontSize:18,flexShrink:0}}>
                    {event.icon}
                  </div>
                  <div style={{flex:1,background:dk.bgCard,borderRadius:16,padding:'14px 18px',border:'1px solid #e5e7eb',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                    <p style={{fontSize:14,color:'#374151',lineHeight:1.6,margin:0}}>{event.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8g. Press bar */}
          <div style={{marginBottom:80,textAlign:'center'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#d1d5db',textTransform:'uppercase',letterSpacing:2,marginBottom:16}}>As featured in</div>
            <div style={{display:'flex',justifyContent:'center',gap:16,flexWrap:'wrap'}}>
              {['The Guardian','TechCrunch','BBC News','The Times','Forbes'].map(p => (
                <div key={p} style={{background:dk.bgCardAlt,border:'1px solid #e5e7eb',borderRadius:10,padding:'8px 20px',fontSize:13,fontWeight:700,color:'#9ca3af',filter:'grayscale(1)'}}>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* 8h. Team */}
          <div style={{marginBottom:80}}>
            <h3 style={{fontSize:22,fontWeight:800,color:'#0a1a0f',letterSpacing:'-0.5px',marginBottom:32,textAlign:'center'}}>Meet the team</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
              {[
                {initials:'EJ',name:'Ellis',role:'Co-Founder',city:'Cardiff',bio:'Helping local businesses compete with enterprise-level AI tools.'},
                {initials:'JJ',name:'Jamal',role:'Co-Founder',city:'Cardiff',bio:'Co-founder on a mission to make AI simple and affordable for every local business.'},
                {initials:'SH',name:'Sam',role:'Head of AI',city:'Manchester',bio:'Ex-Google engineer obsessed with making AI work for small businesses.'},
                {initials:'PP',name:'Priya',role:'Client Success',city:'London',bio:'Onboarded 400+ businesses and counting. Your biggest advocate.'},
              ].map(member => (
                <div key={member.name} style={{background:dk.bgCard,border:'1px solid #e5e7eb',borderRadius:20,padding:'28px 24px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>
                  <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'white',margin:'0 auto 16px',boxShadow:'0 4px 16px rgba(16,185,129,.3)'}}>
                    {member.initials}
                  </div>
                  <div style={{fontWeight:800,fontSize:16,color:'#111',marginBottom:2}}>{member.name}</div>
                  <div style={{fontSize:13,color:'#10b981',fontWeight:600,marginBottom:4}}>{member.role}</div>
                  <div style={{fontSize:12,color:'#9ca3af',marginBottom:12}}>📍 Based in {member.city}</div>
                  <p style={{fontSize:13,color:'#6b7280',lineHeight:1.6,margin:0}}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8f. Guarantee */}
        <div style={{background:'#052e16',padding:'80px 24px',textAlign:'center'}}>
          <div style={{maxWidth:680,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
              <img src="/toggle-logo.svg" alt="LocAI guarantee" style={{width:80,height:40,filter:'drop-shadow(0 0 16px rgba(52,211,153,.6)) drop-shadow(0 4px 12px rgba(16,185,129,.4))'}} />
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'white',marginBottom:16,lineHeight:1.1}}>
              Live in 48 hours — guaranteed.
            </h2>
            <p style={{fontSize:17,color:'rgba(255,255,255,.6)',maxWidth:520,margin:'0 auto 32px',lineHeight:1.7}}>
              If we haven't set up and launched your AI within 48 hours of your onboarding call, you don't pay. Simple.
            </p>
            <div style={{display:'flex',justifyContent:'center',gap:32,flexWrap:'wrap'}}>
              {['No hidden fees','No long contracts','Cancel any time'].map(p => (
                <span key={p} style={{display:'flex',alignItems:'center',gap:6,fontSize:14,color:'#6ee7b7',fontWeight:600}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>{p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── logo divider: what-we-do → pricing (via industries) ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.18,background:dk.bgPage}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── INDUSTRIES ───────────────────────────────────────────────────── */}
      <section id="industries" style={{padding:'80px 24px',background: isDark ? '#091408' : '#f7fdf9'}}>
        <div style={{maxWidth:1120,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'inline-block',background: isDark ? 'rgba(16,185,129,.12)' : '#f0fdf4',border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:6,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              {INDUSTRIES.length}+ industries
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-0.5px',marginBottom:16,lineHeight:1.15,color: isDark ? '#f0fdf4' : '#0a1a0f'}}>
              Deep expertise in every<br/>local trade
            </h2>
            <p style={{fontSize:17,color: isDark ? '#9ca3af' : '#4b5563',maxWidth:480,margin:'0 auto',lineHeight:1.7}}>
              We've built AI playbooks for {INDUSTRIES.length} industries across every local trade. Click any to see exactly how it works.
            </p>
          </div>

          {/* Categorised grid — matches the setup modal style */}
          <div style={{display:'flex',flexDirection:'column',gap:32}}>
            {INDUSTRY_CATEGORIES.map(cat => (
              <div key={cat.category}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                  <span style={{fontSize:13}}>{cat.icon}</span>
                  <span style={{fontSize:10,fontWeight:800,color:'#10b981',textTransform:'uppercase',letterSpacing:2.5}}>{cat.category}</span>
                  <div className="ind-cat-line" style={{flex:1,height:1,background: isDark ? '#1e3d29' : '#e5e7eb',marginLeft:4}} />
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:9}}>
                  {cat.industries.map(ind => (
                    <button
                      key={ind.slug}
                      onClick={() => navigate(`/industry/${ind.slug}`)}
                      className="ind-card card-lift"
                      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:7,padding:'14px 8px',background: isDark ? '#0f2017' : 'white',borderRadius:14,border:`1px solid ${isDark ? '#1e3d29' : '#e5e7eb'}`,cursor:'pointer',textAlign:'center',transition:'all .2s'}}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#10b981'; e.currentTarget.style.background='#f0fdf4'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? '#1e3d29' : '#e5e7eb'; e.currentTarget.style.background = isDark ? '#0f2017' : 'white'; }}
                    >
                      <span style={{fontSize:22,lineHeight:1}}>{ind.icon}</span>
                      <span style={{fontSize:11,fontWeight:600,color: isDark ? '#d1fae5' : '#374151',lineHeight:1.3}}>{ind.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{textAlign:'center',marginTop:48}}>
            <button onClick={() => setShowSetup(true)}
              style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 30px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#10b981 0%,#059669 100%)',cursor:'pointer',fontSize:14,fontWeight:700,color:'white',boxShadow:'0 4px 16px rgba(16,185,129,.35)',transition:'all .2s'}}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 24px rgba(16,185,129,.5)'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(16,185,129,.35)'; e.currentTarget.style.transform=''; }}
            >
              Get your AI plan <I.arrow s={15} />
            </button>
          </div>
        </div>
      </section>

      {/* How it Works white section removed — dark premium version above covers this */}

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section style={{padding:'80px 24px',background:'#020c07',overflow:'hidden'}}>
        <div style={{maxWidth:1120,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#34d399',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:2,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              Real results
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-0.5px',color:'white',lineHeight:1.15}}>
              Business owners who<br/>made the switch
            </h2>
          </div>

          {/* Testimonial cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20,marginBottom:40}}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i}
                className="card-lift"
                onClick={() => setActiveTestimonial(i)}
                style={{padding:'32px',borderRadius:24,border:`1px solid ${activeTestimonial===i ? 'rgba(16,185,129,.35)' : 'rgba(255,255,255,.07)'}`,background: activeTestimonial===i ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.03)',cursor:'pointer',transition:'all .3s',position:'relative',overflow:'hidden'}}>
                {activeTestimonial===i && <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#10b981,#34d399)'}} />}
                {/* Big decorative quote mark */}
                <div style={{fontSize:64,fontWeight:900,lineHeight:1,color:'rgba(16,185,129,.2)',marginBottom:-8,marginTop:-8,fontFamily:'Georgia,serif'}}>&#8220;</div>
                {/* Stars */}
                <div style={{display:'flex',gap:3,marginBottom:14}}>
                  {Array(t.stars).fill(0).map((_,j) => <I.star key={j} s={13} c="text-yellow-400" />)}
                </div>
                {/* Quote */}
                <p style={{fontSize:14,color:'rgba(255,255,255,.78)',lineHeight:1.8,marginBottom:24}}>
                  {t.quote}
                </p>
                {/* Author */}
                <div style={{display:'flex',alignItems:'center',gap:12,paddingTop:16,borderTop:'1px solid rgba(255,255,255,.08)'}}>
                  <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'white',flexShrink:0,boxShadow:'0 0 0 2px rgba(16,185,129,.4)'}}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:'white'}}>{t.name}</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div style={{display:'flex',justifyContent:'center',gap:8}}>
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                style={{width: activeTestimonial===i ? 24 : 8,height:8,borderRadius:100,border:'none',cursor:'pointer',transition:'all .3s',background: activeTestimonial===i ? '#10b981' : 'rgba(255,255,255,.2)'}} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. SOCIAL PROOF SECTION ──────────────────────────────────────── */}
      <section style={{padding:'80px 24px',background:dk.bgPage}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{display:'inline-block',background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:6,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              Proven results
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:900,letterSpacing:'-0.5px',lineHeight:1.1,marginBottom:8,color:'#0a1a0f'}}>Real businesses. Real results.</h2>
          </div>

          {/* 9c. Star rating aggregate */}
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:'clamp(48px,8vw,80px)',fontWeight:900,color:'#111',letterSpacing:'-2px',lineHeight:1}}>4.9 <span style={{fontSize:'0.4em',color:'#9ca3af'}}>/5</span></div>
            <div style={{display:'flex',justifyContent:'center',gap:4,margin:'8px 0 12px'}}>
              {[...Array(5)].map((_,i) => <I.star key={i} s={24} c="text-yellow-400" />)}
            </div>
            <div style={{fontSize:15,color:'#6b7280',marginBottom:16}}>From 340+ verified reviews</div>
            <div style={{display:'flex',justifyContent:'center',gap:10}}>
              {[{name:'Google',color:'#4285F4'},{name:'Trustpilot',color:'#00B67A'}].map(p => (
                <div key={p.name} style={{background:p.color,color:'white',borderRadius:100,padding:'6px 16px',fontSize:13,fontWeight:700}}>{p.name}</div>
              ))}
            </div>
          </div>

          {/* 9b. Case Study Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20,marginBottom:56}}>
            {[
              {biz:"Sarah's Beauty Studio",loc:'Cardiff',stat:'0 missed calls',statSub:'Down from 8/day',quote:"Went from 8 missed calls a day to zero. Bookings up 40% in the first month. I don't know how I managed without it.",avatar:'SB',color:'#10b981'},
              {biz:"Mike's Plumbing",loc:'Manchester',stat:'+£1,800/mo',statSub:'Additional revenue',quote:"Now handles emergency call-outs at 2am automatically. The AI captures every lead while I'm asleep — it's paid for itself 10x over.",avatar:'MP',color:'#059669'},
              {biz:'The Green Fork Restaurant',loc:'Bristol',stat:'12 hrs/wk saved',statSub:'Owner time reclaimed',quote:"AI manages our reservations, review requests, and social posts. I've taken every Friday off for the first time in 4 years.",avatar:'GF',color:'#10b981'},
            ].map(cs => (
              <div key={cs.biz} className="card-lift" style={{background:dk.bgCard,border:'1px solid #e5e7eb',borderRadius:24,padding:'32px',boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                  <div style={{width:48,height:48,borderRadius:'50%',background:`${cs.color}22`,border:`2px solid ${cs.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:cs.color}}>
                    {cs.avatar}
                  </div>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:'#111'}}>{cs.biz}</div>
                    <div style={{fontSize:12,color:'#9ca3af'}}>📍 {cs.loc}</div>
                  </div>
                </div>
                <div style={{background:dk.bgCardAlt,borderRadius:14,padding:'16px',marginBottom:20,textAlign:'center'}}>
                  <div style={{fontSize:32,fontWeight:900,color:cs.color,letterSpacing:'-1px',lineHeight:1}}>{cs.stat}</div>
                  <div style={{fontSize:12,color:'#9ca3af',marginTop:4}}>{cs.statSub}</div>
                </div>
                <div style={{fontSize:56,color:'rgba(0,0,0,.06)',lineHeight:1,fontFamily:'Georgia,serif',marginBottom:-8}}>&#8220;</div>
                <p style={{fontSize:14,color:'#6b7280',lineHeight:1.7}}>{cs.quote}</p>
                <div style={{display:'flex',gap:2,marginTop:12}}>
                  {[...Array(5)].map((_,i) => <I.star key={i} s={12} c="text-yellow-400" />)}
                </div>
              </div>
            ))}
          </div>

          {/* 9d. Results Wall */}
          <div>
            <h3 style={{fontSize:18,fontWeight:800,color:'#0a1a0f',letterSpacing:'-0.5px',marginBottom:20,textAlign:'center'}}>Results across the UK</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
              {[
                {stat:'+£2,400/mo',desc:'Birmingham plumber'},
                {stat:'−60% no-shows',desc:'Leeds salon'},
                {stat:'100% reply rate',desc:'Bristol florist'},
                {stat:'+42 reviews',desc:'Cardiff dentist · 30 days'},
                {stat:'12 hrs/wk saved',desc:'Manchester gym'},
                {stat:'4.6→4.9★',desc:'Glasgow restaurant'},
              ].map(r => (
                <div key={r.stat} style={{background:dk.bgCard,border:'1px solid #bbf7d0',borderRadius:16,padding:'20px 16px',textAlign:'center',transition:'border-color .2s,transform .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#10b981';e.currentTarget.style.transform='translateY(-3px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#bbf7d0';e.currentTarget.style.transform='';}}
                >
                  <div style={{fontSize:22,fontWeight:900,color:'#10b981',letterSpacing:'-0.5px',lineHeight:1,marginBottom:8}}>{r.stat}</div>
                  <div style={{fontSize:12,color:'#9ca3af'}}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── logo divider: what-we-do → pricing ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.18,background:dk.bgPage}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{padding:'80px 24px',background:dk.bgPage}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>

          {/* Header */}
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'inline-block',background:dk.bgSection,border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 16px',fontSize:12,fontWeight:700,color:'#065f46',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>
              <img src="/toggle-logo.svg" alt="" style={{width:16,height:8,marginRight:6,verticalAlign:'middle',filter:'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)'}} />
              How we work
            </div>
            <h2 style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-0.5px',marginBottom:16,lineHeight:1.15,color:'#0a1a0f'}}>
              Bespoke AI, built around<br/>your business
            </h2>
            <p style={{fontSize:17,color:'#4b5563',maxWidth:440,margin:'0 auto',lineHeight:1.7}}>
              No generic subscriptions. Every integration is designed specifically for how your business operates.
            </p>
          </div>

          {/* Offering cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24,alignItems:'stretch'}}>
            {OFFERINGS.map((o) => (
              <div key={o.tag} style={{
                position:'relative',
                background: o.highlight ? 'linear-gradient(145deg,#052e16,#064e3b)' : dk.bgCard,
                borderRadius:28,
                border: o.highlight ? '2px solid rgba(16,185,129,.5)' : '1px solid #e5e7eb',
                padding:'40px 36px',
                display:'flex', flexDirection:'column',
                boxShadow: o.highlight
                  ? '0 24px 64px rgba(5,46,22,.3), 0 0 0 1px rgba(16,185,129,.2)'
                  : '0 2px 16px rgba(0,0,0,.05)',
                transition:'transform .22s, box-shadow .22s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow = o.highlight ? '0 36px 80px rgba(5,46,22,.38)' : '0 8px 32px rgba(0,0,0,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow = o.highlight ? '0 24px 64px rgba(5,46,22,.3), 0 0 0 1px rgba(16,185,129,.2)' : '0 2px 16px rgba(0,0,0,.05)'; }}
              >
                {/* Most requested badge */}
                {o.badge && (
                  <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(90deg,#10b981,#34d399)',color:'white',fontSize:11,fontWeight:800,padding:'5px 20px',borderRadius:100,whiteSpace:'nowrap',boxShadow:'0 4px 14px rgba(16,185,129,.4)',letterSpacing:.5}}>
                    ★ {o.badge.toUpperCase()}
                  </div>
                )}

                {/* Tag */}
                <div style={{display:'inline-flex',alignItems:'center',gap:6,marginBottom:20}}>
                  <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',
                    color: o.highlight ? '#34d399' : '#10b981',
                    background: o.highlight ? 'rgba(52,211,153,.12)' : '#f0fdf4',
                    border: `1px solid ${o.highlight ? 'rgba(52,211,153,.3)' : '#bbf7d0'}`,
                    borderRadius:100, padding:'3px 12px',
                  }}>{o.tag}</span>
                </div>

                {/* Headline */}
                <h3 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',lineHeight:1.2,marginBottom:12,
                  color: o.highlight ? 'white' : '#0a1a0f',
                }}>{o.headline}</h3>

                {/* Sub */}
                <p style={{fontSize:14,lineHeight:1.7,marginBottom:28,
                  color: o.highlight ? 'rgba(255,255,255,.6)' : '#6b7280',
                }}>{o.sub}</p>

                {/* Features */}
                <ul style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32,flex:1}}>
                  {o.features.map(f => (
                    <li key={f} style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:14,
                      color: o.highlight ? 'rgba(255,255,255,.82)' : '#374151',
                    }}>
                      <span style={{
                        width:18, height:18, borderRadius:'50%', flexShrink:0, marginTop:1,
                        background: o.highlight ? 'rgba(52,211,153,.2)' : '#dcfce7',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <I.check s={9} c={o.highlight ? 'text-emerald-300' : 'text-green-600'} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Price label */}
                <div style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${o.highlight ? 'rgba(255,255,255,.1)' : '#f3f4f6'}`}}>
                  <span style={{fontSize:13,fontWeight:600,color: o.highlight ? 'rgba(255,255,255,.45)' : '#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em'}}>{o.price}</span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => o.ctaAction === 'setup' ? setShowSetup(true) : window.location.href='mailto:hello@locai.co.uk?subject=Done For You Enquiry'}
                  style={{
                    width:'100%', padding:'14px', borderRadius:14,
                    border: o.highlight ? 'none' : `1.5px solid ${dk.border}`,
                    background: o.highlight ? '#10b981' : dk.bgCard,
                    cursor:'pointer', fontSize:14, fontWeight:700,
                    color: o.highlight ? 'white' : dk.textGray,
                    transition:'all .2s',
                    boxShadow: o.highlight ? '0 6px 20px rgba(16,185,129,.4)' : 'none',
                  }}
                  onMouseEnter={e => { if(o.highlight){ e.currentTarget.style.background='#059669'; e.currentTarget.style.boxShadow='0 8px 28px rgba(16,185,129,.55)'; } else { e.currentTarget.style.borderColor='#10b981'; e.currentTarget.style.color='#059669'; } }}
                  onMouseLeave={e => { if(o.highlight){ e.currentTarget.style.background='#10b981'; e.currentTarget.style.boxShadow='0 6px 20px rgba(16,185,129,.4)'; } else { e.currentTarget.style.borderColor=dk.border; e.currentTarget.style.color=dk.textGray; } }}
                >{o.cta}</button>
              </div>
            ))}
          </div>

          {/* Done For You note */}
          <div style={{marginTop:32,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <span style={{fontSize:13,color:'#6b7280'}}>
              Done For You requires an initial discovery call — <button onClick={() => window.location.href='mailto:hello@locai.co.uk?subject=Done For You Enquiry'} style={{background:'none',border:'none',cursor:'pointer',color:'#10b981',fontWeight:600,fontSize:13,padding:0}}>reach out to get started</button>
            </span>
          </div>
        </div>
      </section>

      {/* ── logo divider: pricing → final-CTA ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 0',opacity:.18,background:dk.bgPage}}>
        <img src="/toggle-logo.svg" alt="" style={{width:32,height:16}} />
      </div>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section style={{padding:'80px 24px',background:dk.bgPage}}>
        <div style={{maxWidth:860,margin:'0 auto',textAlign:'center'}}>
          <div style={{background:'linear-gradient(145deg,#052e16,#064e3b,#065f46)',borderRadius:36,padding:'72px 48px',position:'relative',overflow:'hidden',boxShadow:'0 32px 80px rgba(5,46,22,.35)'}}>
            {/* Background decoration */}
            <div style={{position:'absolute',top:-80,right:-80,width:300,height:300,background:'radial-gradient(circle,rgba(52,211,153,.15) 0%,transparent 70%)',pointerEvents:'none'}} />
            <div style={{position:'absolute',bottom:-60,left:-60,width:240,height:240,background:'radial-gradient(circle,rgba(16,185,129,.12) 0%,transparent 70%)',pointerEvents:'none'}} />
            <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}} />

            {/* Animated logo */}
            <img src="/toggle-logo.svg" alt="LocAI" style={{width:160,height:80,margin:'0 auto 28px',display:'block',filter:'drop-shadow(0 8px 24px rgba(52,211,153,.5)) brightness(1.1)'}} className="animate-float" />

            <h2 style={{fontSize:'clamp(28px,4vw,46px)',fontWeight:900,letterSpacing:'-1.5px',color:'white',marginBottom:16,lineHeight:1.1,position:'relative'}}>
              Be the best<br/>in town.
            </h2>
            <p style={{fontSize:17,color:'rgba(255,255,255,.65)',maxWidth:460,margin:'0 auto 40px',lineHeight:1.7,position:'relative'}}>
              We build and run the AI that captures every lead and delights every customer — so you become the obvious choice in your area. Takes 3 minutes to start.
            </p>

            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20,position:'relative'}}>
              <button onClick={() => setShowSetup(true)}
                style={{display:'inline-flex',alignItems:'center',gap:12,padding:'17px 40px',borderRadius:18,border:'none',background:'#10b981',cursor:'pointer',fontSize:17,fontWeight:700,color:'white',boxShadow:'0 6px 32px rgba(16,185,129,.45)',transition:'all .2s'}}
                onMouseEnter={e => { e.currentTarget.style.background='#34d399'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 44px rgba(16,185,129,.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#10b981'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 32px rgba(16,185,129,.45)'; }}
              >
                Get my free AI setup
                <I.arrow s={18} />
              </button>

              {/* Trust badges */}
              <div style={{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap',justifyContent:'center'}}>
                {['No credit card', 'Setup in 48 hrs', 'Month-to-month'].map(b => (
                  <span key={b} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'rgba(255,255,255,.55)',fontWeight:500}}>
                    <I.check s={13} c="text-emerald-400" /> {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{background:'#020c07',padding:'64px 24px 40px',color:'rgba(255,255,255,.6)'}}>
        <div style={{maxWidth:1120,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:48}}>

            {/* Brand col */}
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <img src="/toggle-logo.svg" alt="LocAI" style={{width:96,height:48}} />
                <span style={{fontWeight:800,fontSize:18,color:'white',letterSpacing:'-0.3px'}}>LocAI</span>
              </div>
              <p style={{fontSize:14,lineHeight:1.7,maxWidth:260,color:'rgba(255,255,255,.5)'}}>
                AI automation for local businesses — set up by our team, running in 48 hours, no tech skills needed.
              </p>
              <div style={{display:'flex',gap:12,marginTop:20}}>
                {['Twitter','LinkedIn','Instagram'].map(s => (
                  <button key={s} style={{width:36,height:36,borderRadius:10,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.05)',cursor:'pointer',fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:600,transition:'all .2s'}}
                    onMouseEnter={e => e.currentTarget.style.borderColor='rgba(16,185,129,.5)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,.1)'}
                  >{s[0]}</button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.9)',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>Product</div>
              {[['Browse industries', '/app'],['How it works','#how-it-works'],['Pricing','#pricing'],['Success stories','/app']].map(([l,href]) => (
                <button key={l} onClick={() => href.startsWith('#') ? scrollTo(href.slice(1)) : navigate(href)}
                  style={{display:'block',width:'100%',textAlign:'left',fontSize:14,color:'rgba(255,255,255,.5)',padding:'5px 0',border:'none',background:'none',cursor:'pointer',transition:'color .15s'}}
                  onMouseEnter={e => e.target.style.color='rgba(255,255,255,.9)'}
                  onMouseLeave={e => e.target.style.color='rgba(255,255,255,.5)'}
                >{l}</button>
              ))}
            </div>

            {/* Industries */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.9)',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>Industries</div>
              {INDUSTRIES.slice(0,6).map(ind => (
                <button key={ind.slug} onClick={() => navigate(`/industry/${ind.slug}`)}
                  style={{display:'block',width:'100%',textAlign:'left',fontSize:14,color:'rgba(255,255,255,.5)',padding:'5px 0',border:'none',background:'none',cursor:'pointer',transition:'color .15s'}}
                  onMouseEnter={e => e.target.style.color='rgba(255,255,255,.9)'}
                  onMouseLeave={e => e.target.style.color='rgba(255,255,255,.5)'}
                >{ind.name}</button>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.9)',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>Company</div>
              {['About','Blog','Careers','Privacy','Terms'].map(l => (
                <button key={l}
                  style={{display:'block',width:'100%',textAlign:'left',fontSize:14,color:'rgba(255,255,255,.5)',padding:'5px 0',border:'none',background:'none',cursor:'pointer',transition:'color .15s'}}
                  onMouseEnter={e => e.target.style.color='rgba(255,255,255,.9)'}
                  onMouseLeave={e => e.target.style.color='rgba(255,255,255,.5)'}
                >{l}</button>
              ))}
            </div>
          </div>

          <div style={{borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:28,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <span style={{fontSize:13}}>© 2026 LocAI Ltd. All rights reserved.</span>
            <span style={{fontSize:13,display:'flex',alignItems:'center',gap:6}}>
              Made with <E3D emoji="♥" size={16} anim="pulse" interactive={false} style={{color:'#10b981'}} /> for local business owners everywhere
            </span>
          </div>
        </div>
      </footer>

      {showSetup && <SetupPlanModal onClose={() => setShowSetup(false)} />}
    </>
  );
}
