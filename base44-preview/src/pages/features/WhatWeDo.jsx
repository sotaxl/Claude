import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HOW_STEPS = [
  {
    time: '11:47 PM',
    icon: '💬',
    title: 'Customer sends a message',
    desc: 'Sarah texts your business asking about availability. You\'re fast asleep.',
    color: '#6b7280',
  },
  {
    time: '11:47 PM',
    icon: '🤖',
    title: 'LocAI reads and understands it',
    desc: 'Our AI reads the message, understands the intent, and knows your availability.',
    color: '#10b981',
  },
  {
    time: '11:47 PM',
    icon: '⚡',
    title: 'Reply sent in under 10 seconds',
    desc: 'A personalised, professional reply goes out — in your voice, with your pricing.',
    color: '#10b981',
  },
  {
    time: '11:48 PM',
    icon: '📅',
    title: 'Booking confirmed automatically',
    desc: 'Sarah picks a slot. The booking is added to your calendar. Done.',
    color: '#10b981',
  },
  {
    time: '7:30 AM',
    icon: '☕',
    title: 'You wake up to a full diary',
    desc: 'You check your phone. New booking from Sarah. Three more from overnight. Business is booming.',
    color: '#f59e0b',
  },
];

const COMPARISON = [
  { feature: '24/7 availability',         locai: true,  human: false },
  { feature: 'Under 10-second response',  locai: true,  human: false },
  { feature: 'Handles 100s of chats',     locai: true,  human: false },
  { feature: 'Never takes a sick day',    locai: true,  human: false },
  { feature: 'Costs from £49/mo',         locai: true,  human: false },
  { feature: 'Knows your full calendar',  locai: true,  human: 'sometimes' },
  { feature: 'Personal relationship',     locai: false, human: true  },
  { feature: 'Handles complex disputes',  locai: false, human: true  },
];

const INTEGRATIONS = [
  'Google Calendar', 'iCal', 'Calendly', 'Acuity', 'WhatsApp', 'SMS', 'Instagram DMs',
  'Facebook Messenger', 'Google Messages', 'Stripe', 'Square', 'GoCardless',
];

const FAQS = [
  {
    q: 'Will it sound robotic to my customers?',
    a: 'No — we train LocAI on your tone, your prices, and your personality. Customers often don\'t realise they\'re talking to AI. We have a 97% "felt human" rating.',
  },
  {
    q: 'What happens if AI can\'t answer a question?',
    a: 'For anything complex, LocAI flags the conversation and sends you a notification. You step in only when genuinely needed — which is rare.',
  },
  {
    q: 'How long does setup take?',
    a: 'For most businesses, we\'re live within 48 hours. Our team handles everything — you just answer a few questions about your business.',
  },
  {
    q: 'Does it work with my existing booking system?',
    a: 'Yes. We integrate with Google Calendar, iCal, Calendly, Acuity, and most booking platforms. If yours isn\'t listed, ask — we\'ll probably support it.',
  },
  {
    q: 'Can I control what the AI says?',
    a: 'Absolutely. You have a full dashboard where you can set rules, update pricing, block certain time slots, and review AI responses.',
  },
];

export default function WhatWeDo() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

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
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f' }}>What We Do</span>
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
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            The full picture
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#0a1a0f', marginBottom: 12 }}>
            What LocAI actually does
          </h1>
          <p style={{ fontSize: 17, color: '#4b5563', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Not buzzwords. Not vague "AI magic." Here's exactly what happens when a customer contacts your business through LocAI.
          </p>
        </div>

        {/* 3-panel explainer */}
        <div className="fade-up" style={{ maxWidth: 960, margin: '0 auto 72px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            {
              icon: '💬',
              heading: 'Listens',
              body: 'Every enquiry — SMS, WhatsApp, Instagram DM, Facebook message, or Google Message — is read and understood in real time.',
              color: '#e0f2fe',
              border: '#bae6fd',
            },
            {
              icon: '🧠',
              heading: 'Thinks',
              body: 'LocAI knows your prices, your calendar, your services, your tone of voice, and your business rules — and crafts the perfect reply.',
              color: '#f0fdf4',
              border: '#bbf7d0',
            },
            {
              icon: '📅',
              heading: 'Books',
              body: 'Slots are confirmed, calendars updated, payments (optionally) taken, and confirmation messages sent — while you\'re getting on with life.',
              color: '#fefce8',
              border: '#fde68a',
            },
          ].map(p => (
            <div key={p.heading} style={{ background: p.color, border: `1.5px solid ${p.border}`, borderRadius: 20, padding: '28px' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{p.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0a1a0f', marginBottom: 8 }}>{p.heading}</div>
              <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{p.body}</div>
            </div>
          ))}
        </div>

        {/* Day-in-the-life timeline */}
        <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto 72px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0a1a0f', textAlign: 'center', marginBottom: 36, letterSpacing: '-0.5px' }}>
            A night in the life of your AI
          </h2>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 56, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #10b981, #f0fdf4)' }} />
            {HOW_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 28, position: 'relative' }}>
                <div style={{ width: 56, textAlign: 'right', paddingRight: 8, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', paddingTop: 12 }}>{step.time}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step.color === '#10b981' ? '#10b981' : step.color === '#f59e0b' ? '#f59e0b' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 4, zIndex: 1, border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1, background: 'white', borderRadius: 14, padding: '14px 18px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f', marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LocAI vs Human */}
        <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto 72px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0a1a0f', textAlign: 'center', marginBottom: 28, letterSpacing: '-0.5px' }}>
            LocAI vs a human receptionist
          </h2>
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>Feature</div>
              <div style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#065f46', textAlign: 'center', background: '#f0fdf4' }}>LocAI</div>
              <div style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>Human</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < COMPARISON.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ padding: '12px 20px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{row.feature}</div>
                <div style={{ padding: '12px 20px', textAlign: 'center', background: 'rgba(16,185,129,.04)' }}>
                  {row.locai === true ? <span style={{ color: '#10b981', fontSize: 18 }}>✓</span> :
                   row.locai === false ? <span style={{ color: '#ef4444', fontSize: 18 }}>✕</span> :
                   <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>{row.locai}</span>}
                </div>
                <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                  {row.human === true ? <span style={{ color: '#10b981', fontSize: 18 }}>✓</span> :
                   row.human === false ? <span style={{ color: '#ef4444', fontSize: 18 }}>✕</span> :
                   <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>{row.human}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto 72px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0a1a0f', marginBottom: 8, letterSpacing: '-0.5px' }}>Works with everything you already use</h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 28 }}>No switching tools. We plug into your existing workflow.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {INTEGRATIONS.map(name => (
              <div key={name} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#374151', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ accordion */}
        <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto 72px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0a1a0f', textAlign: 'center', marginBottom: 28, letterSpacing: '-0.5px' }}>
            Common questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.05)', border: openFaq === i ? '1.5px solid #10b981' : '1.5px solid #e5e7eb' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1a0f', paddingRight: 16 }}>{faq.q}</span>
                  <span style={{ color: '#10b981', fontSize: 20, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee block */}
        <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto 48px', background: 'linear-gradient(135deg,#065f46,#047857)', borderRadius: 24, padding: '40px 36px', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>30-day money-back guarantee</h2>
          <p style={{ fontSize: 16, color: '#a7f3d0', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            If LocAI doesn't save you time and win you bookings in the first 30 days, we'll refund every penny. No questions asked.
          </p>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
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
