import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    id: 'booking',
    icon: '📅',
    title: '24/7 Booking AI',
    desc: 'Handles all booking enquiries around the clock',
    price: 0,
    included: true,
  },
  {
    id: 'sms',
    icon: '💬',
    title: 'SMS & WhatsApp',
    desc: 'Reply to texts and WhatsApp messages instantly',
    price: 0,
    included: true,
  },
  {
    id: 'reminders',
    icon: '🔔',
    title: 'Appointment Reminders',
    desc: 'Automated reminders to reduce no-shows',
    price: 29,
    included: false,
  },
  {
    id: 'reviews',
    icon: '⭐',
    title: 'Review Collection',
    desc: 'Auto-request 5-star reviews after each booking',
    price: 19,
    included: false,
  },
  {
    id: 'followup',
    icon: '📩',
    title: 'Follow-up Sequences',
    desc: 'Automated messages to win back lost leads',
    price: 24,
    included: false,
  },
  {
    id: 'analytics',
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'See bookings, revenue, and AI performance at a glance',
    price: 19,
    included: false,
  },
  {
    id: 'voice',
    icon: '📞',
    title: 'AI Voice Answering',
    desc: 'Never miss a phone call — AI answers and books',
    price: 39,
    included: false,
  },
  {
    id: 'multichannel',
    icon: '🌐',
    title: 'Multi-channel Inbox',
    desc: 'Facebook, Instagram DMs, Google messages in one place',
    price: 34,
    included: false,
  },
];

const BASE_PRICE = 49;

export default function BuildPackage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set(['booking', 'sms']));

  const toggle = (id) => {
    const f = FEATURES.find(f => f.id === id);
    if (f.included) return; // can't deselect base features
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addons = FEATURES.filter(f => !f.included && selected.has(f.id));
  const addonTotal = addons.reduce((sum, f) => sum + f.price, 0);
  const totalMonthly = BASE_PRICE + addonTotal;
  const selectedFeatures = FEATURES.filter(f => selected.has(f.id));

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
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>Build Package</span>
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
          <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Build your package
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#0a1a0f', marginBottom: 12 }}>
            Build your custom AI package
          </h1>
          <p style={{ fontSize: 17, color: '#4b5563', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Start with the essentials and add the features that matter most to your business.
          </p>
        </div>

        <div className="fade-up" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>

          {/* Feature cards */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Every plan includes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {FEATURES.filter(f => f.included).map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                  borderRadius: 14, padding: '14px 18px',
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{f.desc}</div>
                  </div>
                  <div style={{ background: '#10b981', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>Included</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Power-ups — add what you need</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES.filter(f => !f.included).map(f => {
                const isOn = selected.has(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggle(f.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: isOn ? '#f0fdf4' : 'white',
                      border: isOn ? '1.5px solid #10b981' : '1.5px solid #e5e7eb',
                      borderRadius: 14, padding: '14px 18px',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all .2s',
                      boxShadow: isOn ? '0 0 0 3px rgba(16,185,129,.12)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{f.desc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>+£{f.price}/mo</div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: isOn ? '#10b981' : 'transparent',
                        border: isOn ? '2px solid #10b981' : '2px solid #d1d5db',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s', flexShrink: 0,
                      }}>
                        {isOn && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary panel */}
          <div style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0a1a0f', marginBottom: 16 }}>Your package</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                  <span>Base plan</span>
                  <span style={{ fontWeight: 600, color: '#0a1a0f' }}>£{BASE_PRICE}/mo</span>
                </div>
                {addons.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                    <span>{f.icon} {f.title}</span>
                    <span style={{ fontWeight: 600, color: '#0a1a0f' }}>+£{f.price}/mo</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>Total</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#10b981', letterSpacing: '-1px' }}>£{totalMonthly}/mo</span>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>
                  Cancel anytime · No setup fee
                </div>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 8 }}>What you're getting:</div>
                {selectedFeatures.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', marginBottom: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f.title}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/app')}
                style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#10b981', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 4px 16px rgba(16,185,129,.4)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#059669'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; }}
              >
                Get started for £{totalMonthly}/mo →
              </button>

              <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
                14-day free trial · No card required
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
