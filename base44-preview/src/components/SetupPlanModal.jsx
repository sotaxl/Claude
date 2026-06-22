import React, { useState } from 'react';
import { INDUSTRY_CATEGORIES, INDUSTRIES } from '@/data/industryData';

const NEEDS = [
  { id: 'booking',    label: 'Booking & Scheduling',          icon: '📅' },
  { id: 'followup',   label: 'Customer Follow-Ups',           icon: '💬' },
  { id: 'social',     label: 'Social Media & Content',        icon: '📣' },
  { id: 'invoicing',  label: 'Invoicing & Payments',          icon: '🧾' },
  { id: 'reviews',    label: 'Review Management',             icon: '⭐' },
  { id: 'chatbot',    label: 'AI Chatbot & Customer Service', icon: '🤖' },
  { id: 'inventory',  label: 'Inventory & Stock',             icon: '📦' },
  { id: 'leads',      label: 'Lead Generation & Marketing',   icon: '🎯' },
  { id: 'routing',    label: 'Route & Delivery Optimisation', icon: '🗺️' },
  { id: 'staff',      label: 'Staff Scheduling',              icon: '👥' },
];

const GOALS = [
  { id: 'time',       label: 'Save time on admin',                  desc: 'Automate the repetitive tasks eating your day',      icon: '⏱️' },
  { id: 'customers',  label: 'Get more customers',                  desc: 'Reach new people and convert more enquiries',        icon: '📈' },
  { id: 'retention',  label: 'Keep existing customers coming back', desc: 'Automated follow-ups, loyalty and rebooking',        icon: '🔄' },
  { id: 'noshows',    label: 'Reduce no-shows',                     desc: 'Smart reminders that keep your schedule full',       icon: '📵' },
  { id: 'revenue',    label: 'Increase revenue per customer',       desc: 'Upsells, add-ons and packages on autopilot',         icon: '💰' },
  { id: 'experience', label: 'Improve customer experience',         desc: 'Instant replies, status updates and personal touch', icon: '✨' },
];

const STEPS = ['Industry', 'Needs', 'Goals', 'Contact', 'Done'];

function ProgressBar({ step }) {
  const pct = ((step) / (STEPS.length - 1)) * 100;
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-1">
      <div
        className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function SetupPlanModal({ onClose, initialIndustry = null }) {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState(initialIndustry);
  const [needs, setNeeds] = useState([]);
  const [goals, setGoals] = useState([]);
  const [contact, setContact] = useState({ name: '', business: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const toggleNeed = (id) =>
    setNeeds(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);

  const toggleGoal = (id) =>
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const canNext = [
    !!industry,
    needs.length > 0,
    goals.length > 0,
    contact.name && contact.email && contact.phone,
  ][step] ?? true;

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setStep(4);
  };

  const selectedIndustry = INDUSTRIES.find(i => i.slug === industry);
  const selectedGoals = GOALS.filter(g => goals.includes(g.id));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-gray-900/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <img src="/locai-logo.svg" alt="LocAI" className="w-8 h-8" />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">Setup Plan</p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {step === 0 && "What industry are you in?"}
                  {step === 1 && "What do you need help with?"}
                  {step === 2 && "What are your main goals?"}
                  {step === 3 && "How do we reach you?"}
                  {step === 4 && "You're all set! 🎉"}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {step < 4 && (
            <>
              <ProgressBar step={step} />
              <div className="flex justify-between mt-2">
                {STEPS.slice(0, -1).map((s, i) => (
                  <span key={s} className={`text-xs font-medium transition-colors ${i === step ? 'text-green-600' : i < step ? 'text-green-400' : 'text-gray-300 dark:text-gray-600'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Step 0 — Industry */}
          {step === 0 && (
            <div className="space-y-5">
              {INDUSTRY_CATEGORIES.map(cat => (
                <div key={cat.category}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs">{cat.icon}</span>
                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{cat.category}</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {cat.industries.map(ind => (
                      <button
                        key={ind.slug}
                        onClick={() => setIndustry(ind.slug)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-center ${
                          industry === ind.slug
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/30 shadow-md shadow-green-100'
                            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <span className="text-lg leading-none">{ind.icon}</span>
                        <span className={`text-[9px] font-semibold leading-tight ${industry === ind.slug ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {ind.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 1 — Needs */}
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Select everything that applies — you can always add more later.</p>
              {NEEDS.map(need => {
                const active = needs.includes(need.id);
                return (
                  <button
                    key={need.id}
                    onClick={() => toggleNeed(need.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      active
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-xl w-8 text-center shrink-0">{need.icon}</span>
                    <span className={`text-sm font-semibold flex-1 ${active ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {need.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      active ? 'border-green-400 bg-green-400' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {active && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2 — Goals (multi-select) */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Pick all that apply — we'll tailor your plan around them.</p>
              {GOALS.map(g => {
                const active = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-[1.01] ${
                      active
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20 shadow-md shadow-green-100'
                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl mt-0.5 shrink-0">{g.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${active ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>{g.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{g.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      active ? 'border-green-400 bg-green-400' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {active && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3 — Contact */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary pill */}
              <div className="flex flex-wrap gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/40 mb-2">
                {selectedIndustry && (
                  <span className="text-xs font-semibold bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                    {selectedIndustry.icon} {selectedIndustry.name}
                  </span>
                )}
                {selectedGoals.map(g => (
                  <span key={g.id} className="text-xs font-semibold bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                    {g.icon} {g.label}
                  </span>
                ))}
                <span className="text-xs font-semibold bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                  {needs.length} automation{needs.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              {[
                { key: 'name',     label: 'Your name',     type: 'text',  placeholder: 'Jane Smith' },
                { key: 'business', label: 'Business name', type: 'text',  placeholder: "Jane's Bakery" },
                { key: 'email',    label: 'Email address', type: 'email', placeholder: 'jane@yourbusiness.com' },
                { key: 'phone',    label: 'Phone number',  type: 'tel',   placeholder: '+44 7700 900000' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    {field.label} {['name','email','phone'].includes(field.key) && <span className="text-green-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={contact[field.key]}
                    onChange={e => setContact(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-green-400 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Anything else we should know? <span className="text-gray-300 dark:text-gray-600 normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="e.g. I'm open Monday–Friday, would love a call this week…"
                  value={contact.notes}
                  onChange={e => setContact(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-green-400 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request received!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                We'll review your setup plan and reach out to <strong className="text-gray-700 dark:text-gray-300">{contact.email}</strong> within 24 hours.
              </p>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 text-left space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Industry</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{selectedIndustry?.icon} {selectedIndustry?.name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Goals</span>
                  <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                    {selectedGoals.map(g => (
                      <span key={g.id} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold px-2 py-0.5 rounded-lg">{g.icon} {g.label}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Automations</span>
                  <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                    {needs.map(id => {
                      const n = NEEDS.find(n => n.id === id);
                      return <span key={id} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold px-2 py-0.5 rounded-lg">{n?.icon} {n?.label}</span>;
                    })}
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Contact</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{contact.name} · {contact.phone}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-green-200"
              >
                Explore More Industries
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 4 && (
          <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between gap-3">
            <button
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext}
                className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-2xl transition-all ${
                  canNext
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow hover:shadow-md hover:opacity-90'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext || submitting}
                className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-2xl transition-all ${
                  canNext && !submitting
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow hover:shadow-md hover:opacity-90'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    Send My Plan
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
