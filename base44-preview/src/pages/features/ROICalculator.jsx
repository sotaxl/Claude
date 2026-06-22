import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ROICalculator() {
  const navigate = useNavigate();
  const [missed,  setMissed]  = useState(12);   // enquiries missed per week
  const [value,   setValue]   = useState(85);   // avg job value £
  const [admin,   setAdmin]   = useState(6);    // admin hours per week

  const weeklyRevLost  = missed * value;
  const monthlyRevLost = weeklyRevLost * 4.33;
  const annualRevLost  = monthlyRevLost * 12;
  const adminCostWeek  = admin * 15; // £15/hr approx
  const adminCostYear  = adminCostWeek * 52;
  const totalAnnual    = annualRevLost + adminCostYear;

  const SliderRow = ({ label, min, max, step, value: val, onChange, prefix, suffix, color }) => (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: color || '#0a1a0f', letterSpacing: '-0.5px' }}>
          {prefix}{val.toLocaleString()}{suffix}
        </span>
      </div>
      <div style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, background: '#e5e7eb' }} />
        <div style={{ position: 'absolute', left: 0, width: `${((val - min) / (max - min)) * 100}%`, height: 6, borderRadius: 3, background: color || '#10b981' }} />
        <input
          type="range" min={min} max={max} step={step} value={val}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'relative', width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', zIndex: 1 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
        <span>{prefix}{min}{suffix}</span>
        <span>{prefix}{max}{suffix}</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up .5s cubic-bezier(.23,1,.32,1) both; }
        input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: white; border: 3px solid #10b981;
          box-shadow: 0 2px 8px rgba(16,185,129,.4); cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: white; border: 3px solid #10b981; cursor: pointer;
        }
      `}</style>

      {/* Sticky mini header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', boxShadow: '0 1px 8px rgba(0,0,0,.06)',
      }}>
        <img src="/toggle-logo.svg" alt="LocAI" style={{ width: 44, height: 22 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>ROI Calculator</span>
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
            Your numbers
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#0a1a0f', marginBottom: 12 }}>
            Calculate your AI return on investment
          </h1>
          <p style={{ fontSize: 17, color: '#4b5563', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Drag the sliders to match your business. See exactly how much you're leaving on the table each year.
          </p>
        </div>

        <div className="fade-up" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: 24, alignItems: 'start' }}>

          {/* Sliders panel */}
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a1a0f', marginBottom: 28 }}>Tell us about your business</h2>

            <SliderRow
              label="Enquiries missed per week (calls, messages, DMs)"
              min={1} max={50} step={1}
              value={missed} onChange={setMissed}
              suffix=" enquiries"
              color="#ef4444"
            />
            <SliderRow
              label="Average job / booking value"
              min={20} max={500} step={5}
              value={value} onChange={setValue}
              prefix="£"
              color="#10b981"
            />
            <SliderRow
              label="Admin hours spent per week (scheduling, chasing)"
              min={1} max={20} step={1}
              value={admin} onChange={setAdmin}
              suffix=" hrs/week"
              color="#f59e0b"
            />

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#991b1b', fontWeight: 600, marginTop: 8 }}>
              Based on your numbers, you're currently losing an estimated{' '}
              <strong>£{weeklyRevLost.toLocaleString()}/week</strong> in missed revenue alone.
            </div>
          </div>

          {/* Results panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Revenue lost */}
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Annual revenue lost</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#7f1d1d', letterSpacing: '-2px', lineHeight: 1 }}>
                £{annualRevLost.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: '#b91c1c', marginTop: 6 }}>{missed} missed enquiries × £{value} × 52 weeks</div>
            </div>

            {/* Admin cost */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Admin time cost</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#78350f', letterSpacing: '-2px', lineHeight: 1 }}>
                £{adminCostYear.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: '#b45309', marginTop: 6 }}>{admin} hrs/week × £15/hr × 52 weeks</div>
            </div>

            {/* Total */}
            <div style={{ background: 'linear-gradient(135deg,#065f46,#047857)', borderRadius: 20, padding: '24px', boxShadow: '0 8px 32px rgba(16,185,129,.3)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Total annual opportunity</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
                £{totalAnnual.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: '#a7f3d0', marginTop: 6 }}>LocAI costs a fraction of this</div>
              <button
                onClick={() => navigate('/app')}
                style={{ marginTop: 20, width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'white', color: '#065f46', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >
                Reclaim this revenue →
              </button>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 13, color: '#9ca3af' }}>
          Conservative estimates based on industry averages · No credit card required to get started
        </div>
      </div>
    </>
  );
}
