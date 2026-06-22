import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const INDUSTRIES = [
  {
    name: 'Hair Salon',
    icon: '✂️',
    timeSaved: 8,
    inquiry: 'Hi, are you free Thursday for a cut and colour? 💇‍♀️',
    aiReply: "Hi! Yes, Thursday works great — I've got 10am or 2pm available. Which suits you? 😊",
    customer: 'Sarah M.',
    booking: 'Thursday 2pm – Cut & Colour',
  },
  {
    name: 'Plumber',
    icon: '🔧',
    timeSaved: 10,
    inquiry: 'Urgent — burst pipe in kitchen, need someone ASAP',
    aiReply: "I can get someone to you within the hour. Can you confirm your postcode so I can route the nearest engineer? 🔧",
    customer: 'Mike T.',
    booking: 'Emergency callout – today',
  },
  {
    name: 'Restaurant',
    icon: '🍽️',
    timeSaved: 12,
    inquiry: 'Table for 4 Saturday night, around 7:30?',
    aiReply: "Saturday at 7:30 for 4 — perfect! I've reserved your table. Any dietary requirements or special occasions? 🎉",
    customer: 'Emma & family',
    booking: 'Sat 7:30pm – Table for 4',
  },
  {
    name: 'Personal Trainer',
    icon: '💪',
    timeSaved: 6,
    inquiry: 'Looking to start sessions, what do you offer?',
    aiReply: "Great timing! I offer 1-to-1 PT, online coaching, and nutrition plans. Want to book a free 15-min consultation to see what fits? 🏋️",
    customer: 'James K.',
    booking: 'Free consultation – Friday 6pm',
  },
  {
    name: 'Accountant',
    icon: '📊',
    timeSaved: 9,
    inquiry: 'Need help with my self-assessment tax return',
    aiReply: "Happy to help! Our fixed-fee self-assessment package starts at £199. Want to book a quick call to go over the details? 📋",
    customer: 'Lisa R.',
    booking: 'Discovery call – Mon 10am',
  },
  {
    name: 'Electrician',
    icon: '⚡',
    timeSaved: 11,
    inquiry: 'Need a full rewire quote for a 3-bed house',
    aiReply: "Sure! A 3-bed rewire typically takes 3-5 days. I can arrange a free site survey — what area are you in? ⚡",
    customer: 'Tom H.',
    booking: 'Free site survey – Thu 9am',
  },
];

export default function IndustryTour() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [simPhase, setSimPhase] = useState(0); // 0=idle, 1=typing, 2=replied, 3=booked
  const [timeSaved, setTimeSaved] = useState(8);
  const timerRef = useRef(null);
  const ind = INDUSTRIES[selected];

  useEffect(() => {
    setTimeSaved(ind.timeSaved);
  }, [selected]);

  const runSim = () => {
    setSimPhase(1);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSimPhase(2);
      timerRef.current = setTimeout(() => {
        setSimPhase(3);
      }, 1200);
    }, 1400);
  };

  const selectIndustry = (i) => {
    setSelected(i);
    setSimPhase(0);
    clearTimeout(timerRef.current);
  };

  useEffect(() => {
    // Auto-run sim on first load
    const t = setTimeout(runSim, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const annualSaved = timeSaved * 52 * 15; // £15/hr

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slide-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes typing-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        .fade-up { animation: fade-up .5s cubic-bezier(.23,1,.32,1) both; }
        .slide-in { animation: slide-in .35s cubic-bezier(.23,1,.32,1) both; }
      `}</style>

      {/* Sticky mini header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,.06)',
      }}>
        <img src="/toggle-logo.svg" alt="LocAI" style={{ width: 44, height: 22 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>Industry Tour</span>
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6b7280', padding: '6px 10px', borderRadius: 8, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
      </header>

      <div style={{ background: '#f7fdf9', minHeight: 'calc(100vh - 56px)', padding: '60px 24px 80px' }}>
        {/* Heading */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Your industry
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#0a1a0f', marginBottom: 12 }}>
            See exactly how AI works for your industry
          </h1>
          <p style={{ fontSize: 17, color: '#4b5563', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Pick your trade below and watch LocAI handle a real enquiry in seconds.
          </p>
        </div>

        {/* Industry picker */}
        <div className="fade-up" style={{ maxWidth: 780, margin: '0 auto 36px', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {INDUSTRIES.map((ind, i) => (
            <button
              key={ind.name}
              onClick={() => selectIndustry(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                borderRadius: 100, border: selected === i ? '2px solid #10b981' : '1.5px solid #e5e7eb',
                background: selected === i ? '#f0fdf4' : 'white',
                color: selected === i ? '#065f46' : '#374151',
                fontSize: 14, fontWeight: selected === i ? 700 : 500,
                cursor: 'pointer', transition: 'all .2s',
                boxShadow: selected === i ? '0 0 0 3px rgba(16,185,129,.15)' : 'none',
              }}
            >
              <span style={{ fontSize: 18 }}>{ind.icon}</span>
              {ind.name}
            </button>
          ))}
        </div>

        {/* Main demo area */}
        <div className="fade-up" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>

          {/* Phone sim */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: '100%', maxWidth: 320, borderRadius: 28, background: '#1c1c1e', boxShadow: '0 20px 60px rgba(0,0,0,.3)', padding: '10px', position: 'relative' }}>
              <div style={{ borderRadius: 22, overflow: 'hidden', background: '#000', minHeight: 400 }}>
                {/* Chat header */}
                <div style={{ background: '#1c1c1e', padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'hsl(210,50%,35%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {ind.customer[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{ind.customer}</div>
                    <div style={{ fontSize: 11, color: simPhase >= 2 ? '#10b981' : 'rgba(255,255,255,.4)' }}>
                      {simPhase === 0 ? 'Waiting...' : simPhase === 1 ? 'Customer typing...' : simPhase === 2 ? 'AI replied instantly' : 'Booking confirmed ✓'}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 300 }}>
                  {/* Customer message */}
                  {simPhase >= 1 && (
                    <div className="slide-in" style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                      <div style={{ background: '#3a3a3c', borderRadius: '18px 18px 18px 4px', padding: '10px 14px' }}>
                        <div style={{ fontSize: 13, color: 'white', lineHeight: 1.45 }}>{ind.inquiry}</div>
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 3, marginLeft: 4 }}>just now</div>
                    </div>
                  )}

                  {/* AI typing indicator */}
                  {simPhase === 1 && (
                    <div className="slide-in" style={{ alignSelf: 'flex-end' }}>
                      <div style={{ background: 'rgba(16,185,129,.2)', borderRadius: '18px 18px 4px 18px', padding: '10px 18px', display: 'flex', gap: 4, alignItems: 'center' }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'typing-blink 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI reply */}
                  {simPhase >= 2 && (
                    <div className="slide-in" style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                      <div style={{ background: '#10b981', borderRadius: '18px 18px 4px 18px', padding: '10px 14px' }}>
                        <div style={{ fontSize: 13, color: 'white', lineHeight: 1.45 }}>{ind.aiReply}</div>
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 3, textAlign: 'right', marginRight: 4 }}>AI · just now</div>
                    </div>
                  )}

                  {/* Booking confirmation */}
                  {simPhase >= 3 && (
                    <div className="slide-in" style={{ textAlign: 'center', marginTop: 8 }}>
                      <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 12, padding: '10px 14px', display: 'inline-block' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>✓ Booking added to calendar</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{ind.booking}</div>
                      </div>
                    </div>
                  )}

                  {/* Idle prompt */}
                  {simPhase === 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 }}>
                      <div style={{ fontSize: 32 }}>{ind.icon}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', textAlign: 'center' }}>Tap below to see AI in action</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={runSim}
              style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: '#10b981', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 16px rgba(16,185,129,.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#059669'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; }}
            >
              ▶ Run simulation
            </button>
          </div>

          {/* Stats panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a1a0f', marginBottom: 20 }}>
                {ind.icon} {ind.name} — what LocAI saves you
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Admin time saved per week', value: `${timeSaved} hours`, color: '#10b981', icon: '⏱️' },
                  { label: 'Annual admin cost saved', value: `£${annualSaved.toLocaleString()}`, color: '#10b981', icon: '💰' },
                  { label: 'Response time', value: 'Under 10 sec', color: '#10b981', icon: '⚡' },
                  { label: 'Hours AI is available', value: '24 / 7 / 365', color: '#10b981', icon: '🤖' },
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{stat.icon}</span>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{stat.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg,#065f46,#047857)', borderRadius: 20, padding: '24px', color: 'white' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#a7f3d0', marginBottom: 6 }}>What happens at 11pm when a customer messages?</div>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>
                Without LocAI: they wait until morning, then book someone else.<br />
                <span style={{ color: '#34d399' }}>With LocAI: booked in 10 seconds while you sleep.</span>
              </div>
            </div>

            <button onClick={() => navigate('/app')}
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#10b981', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,.4)', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = ''; }}
            >
              Get LocAI for my {ind.name} →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
