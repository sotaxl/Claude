import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BeforeAfter() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up .5s cubic-bezier(.23,1,.32,1) both; }
      `}</style>

      {/* Sticky mini header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,.06)',
      }}>
        <img src="/toggle-logo.svg" alt="LocAI" style={{ width: 44, height: 22 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>Before &amp; After</span>
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
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            <img src="/toggle-logo.svg" alt="" style={{ width: 16, height: 8, marginRight: 6, verticalAlign: 'middle', filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(385%) hue-rotate(115deg) brightness(94%) contrast(91%)' }} />
            The difference
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#0a1a0f', marginBottom: 12 }}>
            See the difference in real time
          </h1>
          <p style={{ fontSize: 17, color: '#4b5563', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Same customer. Same message. Completely different outcome. This is what LocAI does for your business every single night.
          </p>
        </div>

        {/* Before / After Grid */}
        <div className="fade-up" style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, alignItems: 'center' }}>

          {/* LEFT PHONE — Without AI */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              Without AI
            </div>
            <div style={{ width: 300, borderRadius: 44, background: '#1c1c1e', boxShadow: '0 32px 80px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.08)', padding: '12px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, background: '#1c1c1e', borderRadius: '0 0 18px 18px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2c2c2e' }} />
                <div style={{ width: 60, height: 6, borderRadius: 10, background: '#2c2c2e' }} />
              </div>
              <div style={{ borderRadius: 36, overflow: 'hidden', background: '#000', minHeight: 480 }}>
                <div style={{ background: '#000', padding: '14px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>9:41</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 22, height: 11, borderRadius: 3, border: '1.5px solid rgba(255,255,255,.5)', padding: 1.5, display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '30%', height: '100%', background: '#ef4444', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
                <div style={{ margin: '4px 8px 0', background: 'rgba(28,28,30,.95)', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,.08)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l1.91-1.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 1 }}>Phone · Missed Call</div>
                    <div style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>Unknown Number</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>now</div>
                </div>
                <div style={{ background: '#000', padding: '20px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Messages</span>
                  <div style={{ background: '#ef4444', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>8</div>
                </div>
                <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { name: 'Sarah M.',  msg: 'Hi, are you available Thursday?',   time: '2d', unread: true, urgent: false },
                    { name: 'Mike B.',   msg: 'Can I book for next week?',          time: '1d', unread: true, urgent: false },
                    { name: 'Emma W.',   msg: 'Still waiting for a reply...',       time: '1d', unread: true, urgent: false },
                    { name: 'Tom H.',    msg: 'URGENT: Need a quote ASAP',          time: '3h', unread: true, urgent: true },
                    { name: 'Lisa R.',   msg: 'Hello? Anyone there?',              time: '2h', unread: true, urgent: false },
                    { name: 'James K.',  msg: 'Going with someone else, sorry',     time: '1h', unread: true, urgent: false },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `hsl(${i * 47 + 10},45%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0, position: 'relative' }}>
                        {m.name[0]}
                        {m.unread && <div style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#ef4444', border: '2px solid #000' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: m.unread ? 700 : 500, color: 'white' }}>{m.name}</span>
                          <span style={{ fontSize: 11, color: m.urgent ? '#ef4444' : 'rgba(255,255,255,.35)' }}>{m.time}</span>
                        </div>
                        <div style={{ fontSize: 12, color: m.urgent ? '#fca5a5' : 'rgba(255,255,255,.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '12px 18px', fontSize: 13, color: '#991b1b', fontWeight: 600, textAlign: 'center', maxWidth: 280 }}>
              💸 Avg. business loses <strong>£2,800/mo</strong> to missed enquiries
            </div>
          </div>

          {/* CENTER DIVIDER */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '0 28px' }}>
            <div style={{ width: 1, height: 80, background: 'linear-gradient(to bottom,transparent,#d1d5db)' }} />
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(16,185,129,.45)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
            <div style={{ width: 1, height: 80, background: 'linear-gradient(to bottom,#d1d5db,transparent)' }} />
          </div>

          {/* RIGHT PHONE — With LocAI */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              With LocAI
            </div>
            <div style={{ width: 300, borderRadius: 44, background: '#1c1c1e', boxShadow: '0 32px 80px rgba(16,185,129,.18), 0 0 0 1px rgba(16,185,129,.2), inset 0 0 0 1px rgba(255,255,255,.08)', padding: '12px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, background: '#1c1c1e', borderRadius: '0 0 18px 18px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2c2c2e' }} />
                <div style={{ width: 60, height: 6, borderRadius: 10, background: '#2c2c2e' }} />
              </div>
              <div style={{ borderRadius: 36, overflow: 'hidden', background: '#000', minHeight: 480 }}>
                <div style={{ background: '#000', padding: '14px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>9:41</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 22, height: 11, borderRadius: 3, border: '1.5px solid rgba(255,255,255,.5)', padding: 1.5, display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '85%', height: '100%', background: '#10b981', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
                <div style={{ margin: '4px 8px 0', background: 'rgba(16,185,129,.15)', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(16,185,129,.3)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 1 }}>LocAI · New booking</div>
                    <div style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>Thursday 2pm confirmed ✓</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(16,185,129,.7)' }}>now</div>
                </div>
                <div style={{ background: '#000', padding: '16px 12px 8px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'hsl(10,45%,35%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>S</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Sarah M.</div>
                    <div style={{ fontSize: 11, color: '#10b981' }}>AI replied · just now</div>
                  </div>
                </div>
                <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8, background: '#000' }}>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                    <div style={{ background: '#3a3a3c', borderRadius: '18px 18px 18px 4px', padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, color: 'white', lineHeight: 1.4 }}>Hi, are you available Thursday? Need a cut and colour 💇‍♀️</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4, marginLeft: 4 }}>11:47 PM</div>
                  </div>
                  <div style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
                    <div style={{ background: '#10b981', borderRadius: '18px 18px 4px 18px', padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, color: 'white', lineHeight: 1.4 }}>Hi Sarah! Yes, Thursday works great. I've got 10am or 2pm free — which would suit you? 😊</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4, textAlign: 'right', marginRight: 4 }}>11:47 PM</div>
                  </div>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                    <div style={{ background: '#3a3a3c', borderRadius: '18px 18px 18px 4px', padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, color: 'white', lineHeight: 1.4 }}>2pm please!</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4, marginLeft: 4 }}>11:48 PM</div>
                  </div>
                  <div style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
                    <div style={{ background: '#10b981', borderRadius: '18px 18px 4px 18px', padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, color: 'white', lineHeight: 1.4 }}>Booked! Thursday at 2pm — I've added it to the calendar and sent you a confirmation. See you then! 🗓️</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4, textAlign: 'right', marginRight: 4 }}>11:48 PM</div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 10, color: 'rgba(16,185,129,.6)', background: 'rgba(16,185,129,.08)', borderRadius: 8, padding: '3px 10px', fontWeight: 600 }}>
                      ✓ Booking confirmed while you slept
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '12px 18px', fontSize: 13, color: '#065f46', fontWeight: 600, textAlign: 'center', maxWidth: 280 }}>
              ✅ <strong>100% of enquiries answered</strong>, 24/7 — even at midnight
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 24 }}>Ready to never miss another enquiry?</p>
          <button onClick={() => navigate('/app')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 14, border: 'none', background: '#10b981', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,.4)', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = ''; }}
          >
            Get LocAI for my business
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
