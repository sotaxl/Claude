import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FAKE_RESULTS = [
  { name: 'Sunrise Hair & Beauty',   hasAI: true,  responseTime: '8 sec',    rating: 4.9, bookingsThisWeek: 34 },
  { name: 'The Grooming Lounge',     hasAI: true,  responseTime: '12 sec',   rating: 4.8, bookingsThisWeek: 28 },
  { name: 'Elite Cuts & Styles',     hasAI: false, responseTime: '6 hrs',    rating: 4.2, bookingsThisWeek: 11 },
  { name: 'Perfect Nails Studio',    hasAI: true,  responseTime: '5 sec',    rating: 4.7, bookingsThisWeek: 22 },
  { name: 'Classic Barbers',         hasAI: false, responseTime: 'Next day', rating: 3.9, bookingsThisWeek: 7  },
];

const LOADING_STEPS = [
  'Scanning local businesses...',
  'Checking AI adoption rates...',
  'Analysing response times...',
  'Comparing booking volumes...',
  'Generating your report...',
];

export default function CompetitorCheck() {
  const navigate = useNavigate();
  const [postcode, setPostcode] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | loading | done
  const [loadStep, setLoadStep] = useState(0);
  const [showPostcode, setShowPostcode] = useState('');
  const stepTimer = useRef(null);

  const runCheck = () => {
    if (!postcode.trim()) return;
    setShowPostcode(postcode.trim().toUpperCase());
    setPhase('loading');
    setLoadStep(0);
    let step = 0;
    const advance = () => {
      step++;
      if (step < LOADING_STEPS.length) {
        setLoadStep(step);
        stepTimer.current = setTimeout(advance, 700);
      } else {
        stepTimer.current = setTimeout(() => setPhase('done'), 600);
      }
    };
    stepTimer.current = setTimeout(advance, 700);
  };

  useEffect(() => {
    return () => clearTimeout(stepTimer.current);
  }, []);

  const aiAdopters = FAKE_RESULTS.filter(r => r.hasAI).length;
  const aiPercent  = Math.round((aiAdopters / FAKE_RESULTS.length) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slide-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up .5s cubic-bezier(.23,1,.32,1) both; }
        .slide-in { animation: slide-in .4s cubic-bezier(.23,1,.32,1) both; }
      `}</style>

      {/* Sticky mini header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,.06)',
      }}>
        <img src="/toggle-logo.svg" alt="LocAI" style={{ width: 44, height: 22 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>Competitor Check</span>
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
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Competitor Intel
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#0a1a0f', marginBottom: 12 }}>
            Are your competitors already ahead?
          </h1>
          <p style={{ fontSize: 17, color: '#4b5563', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Enter your postcode to see which local businesses near you are already using AI — and how fast they're responding to enquiries.
          </p>
        </div>

        {/* Search box */}
        <div className="fade-up" style={{ maxWidth: 500, margin: '0 auto 40px' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="e.g. M1 1AE, SW1A 1AA"
              value={postcode}
              onChange={e => setPostcode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runCheck()}
              style={{
                flex: 1, padding: '13px 18px', borderRadius: 12, border: '2px solid #e5e7eb',
                fontSize: 15, fontWeight: 500, color: '#0a1a0f', outline: 'none',
                transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = '#10b981'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={runCheck}
              disabled={phase === 'loading'}
              style={{
                padding: '13px 22px', borderRadius: 12, border: 'none',
                background: phase === 'loading' ? '#9ca3af' : '#10b981', color: 'white',
                fontSize: 14, fontWeight: 700, cursor: phase === 'loading' ? 'default' : 'pointer',
                transition: 'all .2s', whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(16,185,129,.35)',
              }}
            >
              Check now →
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
            We scan public business data — no sign-in required
          </div>
        </div>

        {/* Loading */}
        {phase === 'loading' && (
          <div className="fade-up" style={{ maxWidth: 480, margin: '0 auto', background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.08)', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #e5e7eb', borderTopColor: '#10b981', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0a1a0f', marginBottom: 8 }}>Scanning {showPostcode}…</div>
            {LOADING_STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', opacity: i <= loadStep ? 1 : 0.3, transition: 'opacity .3s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: i < loadStep ? '#10b981' : i === loadStep ? '#10b981' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .3s' }}>
                  {i < loadStep && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  {i === loadStep && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                </div>
                <span style={{ fontSize: 13, color: i <= loadStep ? '#374151' : '#9ca3af', fontWeight: i === loadStep ? 600 : 400, textAlign: 'left' }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {phase === 'done' && (
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            {/* Summary bar */}
            <div className="slide-in" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#991b1b', fontWeight: 600, marginBottom: 2 }}>Near {showPostcode}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#7f1d1d' }}>
                  {aiPercent}% of your local competitors are already using AI
                </div>
              </div>
              <div style={{ background: '#ef4444', color: 'white', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
                ⚠️ Act fast
              </div>
            </div>

            {/* Competitor list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {FAKE_RESULTS.map((r, i) => (
                <div
                  key={r.name}
                  className="slide-in"
                  style={{
                    background: 'white', borderRadius: 16, padding: '16px 20px',
                    border: r.hasAI ? '1.5px solid #bbf7d0' : '1.5px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: r.hasAI ? '#f0fdf4' : '#fef2f2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {r.hasAI ? '🤖' : '😴'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
                        ⭐ {r.rating} · {r.bookingsThisWeek} bookings this week
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Response time</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: r.hasAI ? '#10b981' : '#ef4444' }}>{r.responseTime}</div>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: r.hasAI ? '#f0fdf4' : '#fef2f2',
                      color: r.hasAI ? '#065f46' : '#991b1b',
                    }}>
                      {r.hasAI ? 'AI enabled' : 'No AI'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="slide-in" style={{ background: 'linear-gradient(135deg,#065f46,#047857)', borderRadius: 20, padding: '28px 32px', textAlign: 'center', animationDelay: '0.5s' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 8 }}>
                Don't get left behind
              </div>
              <div style={{ fontSize: 15, color: '#a7f3d0', marginBottom: 24 }}>
                {aiAdopters} competitors near you are already capturing bookings at 3am while you sleep.
              </div>
              <button onClick={() => navigate('/app')}
                style={{ padding: '13px 32px', borderRadius: 14, border: 'none', background: 'white', color: '#065f46', fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >
                Get LocAI — join the AI-first businesses →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
