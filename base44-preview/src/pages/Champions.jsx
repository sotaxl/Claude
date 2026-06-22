const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SetupPlanModal from '@/components/SetupPlanModal';
import LocationPickerModal from '@/components/LocationPickerModal';
import { LOCAL_BUSINESSES, POPULAR_CITIES } from '@/data/localBusinessData';
import E3D from '@/components/E3D';

/* ── custom icons ─────────────────────────────────────────────────────────── */

const Ic = {
  bolt: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  ),
  pin: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  compass: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
  ),
  star: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  ),
  gem: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
  ),
  layers: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2z"/><path d="M12 22v-6.5"/><path d="m22 8.5-10 7-10-7"/></svg>
  ),
  wrench: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ),
  utensils: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  ),
  sparkles: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
  palette: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
  ),
  store: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>
  ),
  gear: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  trendUp: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  ),
  currency: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
  clock: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  message: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
  ),
  bulb: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
  ),
  hand: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
  ),
  search: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
  ),
  building: ({size=16,className=''}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  ),
};

/* ── card icons ──────────────────────────────────────────────────────────── */

const CARD_ICONS = {
  'local-bakery': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="42" rx="12" ry="2.5" fill="rgba(6,95,70,.2)"/>
      <path d="M12 28 L12 40 Q12 42 15 42 L33 42 Q36 42 36 40 L36 28 Z" fill="#047857"/>
      <path d="M12 26 Q12 14 24 12 Q36 14 36 26 L36 40 Q36 42 33 42 L15 42 Q12 42 12 40 Z" fill="#10b981"/>
      <ellipse cx="24" cy="26" rx="12" ry="5" fill="#34d399"/>
      <path d="M17 31 Q24 29 31 31" stroke="rgba(255,255,255,.5)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M16 36 Q24 34 32 36" stroke="rgba(255,255,255,.35)" strokeWidth="1.1" strokeLinecap="round"/>
      <ellipse cx="19" cy="21" rx="3" ry="1.8" fill="rgba(255,255,255,.4)"/>
      <path d="M20 10 C20 8 21 7 20 5" stroke="#a7f3d0" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M24 9 C24 7 25 6 24 4" stroke="#a7f3d0" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M28 10 C28 8 29 7 28 5" stroke="#a7f3d0" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  'auto-repair': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <g transform="translate(24,24) rotate(-40) translate(-24,-24)">
        <rect x="21.5" y="22" width="5" height="22" rx="2.5" fill="#047857"/>
        <rect x="21.5" y="22" width="3.5" height="22" rx="2" fill="#059669"/>
        <path d="M15 8 Q15 4 24 4 Q33 4 33 8 L33 16 Q33 20 24 20 Q15 20 15 16 Z" fill="#047857"/>
        <path d="M15 8 Q15 4 24 4 Q33 4 33 8 L33 12 Q33 16 24 16 Q15 16 15 12 Z" fill="#10b981"/>
        <ellipse cx="24" cy="10" rx="5" ry="3.5" fill="#dcfce7"/>
        <path d="M17 6 Q24 5 31 6" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  ),
  'hair-salon': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <g transform="translate(24,24) rotate(20) translate(-24,-24)">
        <rect x="22" y="10" width="5" height="26" rx="2.5" fill="#059669"/>
        <rect x="22" y="10" width="3" height="26" rx="1.5" fill="#34d399"/>
        <rect x="23" y="10" width="1.5" height="22" rx=".75" fill="rgba(255,255,255,.4)"/>
        <circle cx="24" cy="36" r="5" fill="#059669"/>
        <circle cx="24" cy="36" r="2.5" fill="#dcfce7"/>
      </g>
      <g transform="translate(24,24) rotate(-20) translate(-24,-24)">
        <rect x="22" y="10" width="5" height="26" rx="2.5" fill="#047857"/>
        <rect x="22" y="10" width="3" height="26" rx="1.5" fill="#10b981"/>
        <rect x="23" y="10" width="1.5" height="22" rx=".75" fill="rgba(255,255,255,.25)"/>
        <circle cx="24" cy="36" r="5" fill="#047857"/>
        <circle cx="24" cy="36" r="2.5" fill="#dcfce7"/>
      </g>
      <circle cx="24" cy="20" r="3" fill="#065f46"/>
      <circle cx="24" cy="20" r="1.5" fill="#a7f3d0"/>
    </svg>
  ),
  'plumber': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <rect x="20" y="6" width="8" height="28" rx="2" fill="#047857"/>
      <rect x="20" y="6" width="5" height="28" rx="2" fill="#10b981"/>
      <rect x="21" y="8" width="2" height="24" rx="1" fill="rgba(255,255,255,.2)"/>
      <rect x="18" y="14" width="12" height="5" rx="1.5" fill="#065f46"/>
      <rect x="18" y="14" width="12" height="3" rx="1.5" fill="#059669"/>
      <rect x="20" y="34" width="16" height="8" rx="4" fill="#047857"/>
      <rect x="20" y="34" width="16" height="5" rx="3" fill="#10b981"/>
      <rect x="22" y="35" width="12" height="2" rx="1" fill="rgba(255,255,255,.2)"/>
      <circle cx="36" cy="38" r="4" fill="#059669"/>
      <circle cx="36" cy="38" r="2" fill="#a7f3d0"/>
    </svg>
  ),
  'pet-groomer': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="11" ry="2" fill="rgba(6,95,70,.18)"/>
      <ellipse cx="24" cy="34" rx="10" ry="8" fill="#047857"/>
      <ellipse cx="24" cy="33" rx="10" ry="8" fill="#10b981"/>
      <ellipse cx="13" cy="23" rx="4" ry="5" fill="#047857"/>
      <ellipse cx="13" cy="22" rx="4" ry="5" fill="#34d399"/>
      <ellipse cx="20" cy="19" rx="4" ry="5" fill="#047857"/>
      <ellipse cx="20" cy="18" rx="4" ry="5" fill="#34d399"/>
      <ellipse cx="28" cy="19" rx="4" ry="5" fill="#047857"/>
      <ellipse cx="28" cy="18" rx="4" ry="5" fill="#34d399"/>
      <ellipse cx="35" cy="23" rx="4" ry="5" fill="#047857"/>
      <ellipse cx="35" cy="22" rx="4" ry="5" fill="#34d399"/>
      <ellipse cx="20" cy="30" rx="4" ry="3" fill="rgba(255,255,255,.3)"/>
    </svg>
  ),
  'florist': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="9" ry="2" fill="rgba(6,95,70,.18)"/>
      <path d="M24 42 L24 28" stroke="#047857" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 36 Q18 30 16 34 Q20 36 24 36 Z" fill="#10b981"/>
      <path d="M24 36 Q30 30 32 34 Q28 36 24 36 Z" fill="#059669"/>
      <circle cx="24" cy="16" r="5" fill="#047857"/>
      <circle cx="15" cy="22" r="5" fill="#047857"/>
      <circle cx="33" cy="22" r="5" fill="#047857"/>
      <circle cx="15" cy="12" r="5" fill="#047857"/>
      <circle cx="33" cy="12" r="5" fill="#047857"/>
      <circle cx="24" cy="15" r="5" fill="#34d399"/>
      <circle cx="15" cy="21" r="5" fill="#34d399"/>
      <circle cx="33" cy="21" r="5" fill="#34d399"/>
      <circle cx="15" cy="11" r="5" fill="#34d399"/>
      <circle cx="33" cy="11" r="5" fill="#34d399"/>
      <circle cx="24" cy="17" r="7" fill="#10b981"/>
      <circle cx="24" cy="16" r="7" fill="#059669"/>
      <circle cx="24" cy="16" r="4.5" fill="#a7f3d0"/>
      <circle cx="22" cy="14" r="2" fill="rgba(255,255,255,.5)"/>
    </svg>
  ),
  'dry-cleaner': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <path d="M24 6 Q30 6 30 12" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M11 19 Q24 12 37 19" stroke="#047857" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M11 19 Q24 11 37 19" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M13 20 L10 28 L14 28 L14 42 L34 42 L34 28 L38 28 L35 20 Z" fill="#047857"/>
      <path d="M13 19 L10 27 L14 27 L14 41 L34 41 L34 27 L38 27 L35 19 Q30 15 27 19 Q24 22 21 19 Q18 15 13 19 Z" fill="#10b981"/>
      <path d="M20 19 Q24 24 28 19" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <line x1="24" y1="24" x2="24" y2="40" stroke="rgba(255,255,255,.3)" strokeWidth="1" strokeDasharray="2 2"/>
      <rect x="27" y="27" width="5" height="4" rx="1" fill="rgba(255,255,255,.2)"/>
      <path d="M15 22 Q18 20 20 23" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  'dentist': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="9" ry="2" fill="rgba(6,95,70,.18)"/>
      <path d="M18 32 Q16 44 18 46" stroke="#047857" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M30 32 Q32 44 30 46" stroke="#047857" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M18 32 Q16 43 18 45" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M30 32 Q32 43 30 45" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M12 18 Q12 8 24 8 Q36 8 36 18 L34 32 Q32 34 24 34 Q16 34 14 32 Z" fill="#047857"/>
      <path d="M13 16 Q13 6 24 6 Q35 6 35 16 L33 30 Q31 33 24 33 Q17 33 15 30 Z" fill="#10b981"/>
      <path d="M15 14 Q18 8 21 14 Q24 8 27 14 Q30 8 33 14" fill="#34d399"/>
      <ellipse cx="19" cy="16" rx="3.5" ry="4" fill="rgba(255,255,255,.35)"/>
      <path d="M38 8 L39 5 L40 8 L43 9 L40 10 L39 13 L38 10 L35 9 Z" fill="#a7f3d0"/>
    </svg>
  ),
  'landscaper': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <path d="M16 34 L18 44 L30 44 L32 34 Z" fill="#047857"/>
      <rect x="14" y="31" width="20" height="4" rx="2" fill="#065f46"/>
      <path d="M16 33 L18 43 L30 43 L32 33 Z" fill="#059669"/>
      <rect x="14" y="30" width="20" height="4" rx="2" fill="#10b981"/>
      <ellipse cx="24" cy="32" rx="8" ry="2.5" fill="#065f46"/>
      <path d="M24 32 L24 20" stroke="#047857" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 26 Q14 20 14 12 Q20 16 24 24 Z" fill="#10b981"/>
      <path d="M24 26 Q34 20 34 12 Q28 16 24 24 Z" fill="#059669"/>
      <path d="M24 22 Q18 16 20 8 Q24 14 24 22 Z" fill="#34d399"/>
      <path d="M24 22 Q30 16 28 8 Q24 14 24 22 Z" fill="#10b981"/>
    </svg>
  ),
  'tailor': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="20" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <ellipse cx="20" cy="40" rx="11" ry="4" fill="#047857"/>
      <rect x="12" y="22" width="16" height="18" rx="1" fill="#059669"/>
      <rect x="12" y="22" width="12" height="18" rx="1" fill="#10b981"/>
      <line x1="12" y1="26" x2="28" y2="26" stroke="#34d399" strokeWidth="1.5"/>
      <line x1="12" y1="30" x2="28" y2="30" stroke="#34d399" strokeWidth="1.5"/>
      <line x1="12" y1="34" x2="28" y2="34" stroke="#34d399" strokeWidth="1.5"/>
      <line x1="12" y1="38" x2="28" y2="38" stroke="#34d399" strokeWidth="1.5"/>
      <ellipse cx="20" cy="22" rx="11" ry="4" fill="#10b981"/>
      <ellipse cx="20" cy="21" rx="11" ry="4" fill="#34d399"/>
      <rect x="14" y="23" width="4" height="16" rx=".5" fill="rgba(255,255,255,.15)"/>
      <line x1="32" y1="6" x2="38" y2="40" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="32" y1="6" x2="38" y2="40" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="31" cy="8" rx="2.5" ry="4" fill="#34d399" transform="rotate(-10 31 8)"/>
      <ellipse cx="31" cy="8" rx="1" ry="1.8" fill="#dcfce7" transform="rotate(-10 31 8)"/>
      <path d="M30 12 Q25 18 20 22" stroke="#34d399" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2"/>
    </svg>
  ),
  'bookstore': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="13" ry="2" fill="rgba(6,95,70,.18)"/>
      <rect x="30" y="12" width="10" height="30" rx="2" fill="#047857"/>
      <rect x="30" y="10" width="10" height="30" rx="2" fill="#059669"/>
      <line x1="33" y1="14" x2="33" y2="36" stroke="rgba(255,255,255,.2)" strokeWidth="1"/>
      <rect x="19" y="14" width="13" height="28" rx="2" fill="#065f46"/>
      <rect x="19" y="12" width="13" height="28" rx="2" fill="#10b981"/>
      <line x1="22" y1="16" x2="22" y2="36" stroke="rgba(255,255,255,.2)" strokeWidth="1"/>
      <rect x="8" y="16" width="13" height="26" rx="2" fill="#047857"/>
      <rect x="8" y="14" width="13" height="26" rx="2" fill="#34d399"/>
      <line x1="11" y1="18" x2="11" y2="36" stroke="rgba(255,255,255,.25)" strokeWidth="1.5"/>
      <line x1="13" y1="20" x2="19" y2="20" stroke="rgba(255,255,255,.5)" strokeWidth="1"/>
      <line x1="13" y1="23" x2="19" y2="23" stroke="rgba(255,255,255,.5)" strokeWidth="1"/>
      <line x1="13" y1="26" x2="17" y2="26" stroke="rgba(255,255,255,.5)" strokeWidth="1"/>
    </svg>
  ),
  'electrician': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <ellipse cx="24" cy="24" rx="16" ry="20" fill="rgba(52,211,153,.08)"/>
      <path d="M29 4 L16 26 L22 26 L19 44 L32 22 L26 22 Z" fill="#047857" transform="translate(2,2)"/>
      <path d="M29 4 L16 26 L22 26 L19 44 L32 22 L26 22 Z" fill="#10b981"/>
      <path d="M29 4 L22 20 L25 20 Z" fill="#34d399"/>
      <path d="M22 26 L21 34 L24 28 L22 28 Z" fill="#34d399"/>
      <circle cx="36" cy="12" r="2" fill="#a7f3d0"/>
      <circle cx="10" cy="18" r="1.5" fill="#a7f3d0"/>
      <circle cx="38" cy="28" r="1.5" fill="#a7f3d0"/>
    </svg>
  ),
  'yoga-studio': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="11" ry="2" fill="rgba(6,95,70,.18)"/>
      <circle cx="24" cy="22" r="18" fill="rgba(52,211,153,.07)"/>
      <circle cx="24" cy="22" r="13" fill="rgba(52,211,153,.07)"/>
      <path d="M24 30 Q15 32 12 38 L18 38 Q22 34 24 32 Q26 34 30 38 L36 38 Q33 32 24 30 Z" fill="#047857"/>
      <path d="M24 29 Q15 31 12 37 L18 37 Q22 33 24 31 Q26 33 30 37 L36 37 Q33 31 24 29 Z" fill="#10b981"/>
      <path d="M20 20 Q24 18 28 20 L28 30 Q24 32 20 30 Z" fill="#059669"/>
      <path d="M20 19 Q24 17 28 19 L28 29 Q24 31 20 29 Z" fill="#10b981"/>
      <path d="M20 22 Q12 20 10 24 Q14 24 20 24" fill="#059669"/>
      <path d="M28 22 Q36 20 38 24 Q34 24 28 24" fill="#047857"/>
      <path d="M20 21 Q12 19 10 23 Q14 23 20 23" fill="#10b981"/>
      <path d="M28 21 Q36 19 38 23 Q34 23 28 23" fill="#10b981"/>
      <circle cx="24" cy="13" r="6" fill="#047857"/>
      <circle cx="24" cy="12" r="6" fill="#34d399"/>
      <ellipse cx="22" cy="10" rx="2.5" ry="2" fill="rgba(255,255,255,.3)"/>
      <circle cx="24" cy="5" r="1.5" fill="#a7f3d0"/>
      <circle cx="19" cy="7" r="1" fill="#a7f3d0"/>
      <circle cx="29" cy="7" r="1" fill="#a7f3d0"/>
    </svg>
  ),
  'locksmith': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(6,95,70,.18)"/>
      <circle cx="16" cy="16" r="12" fill="#047857"/>
      <circle cx="16" cy="14" r="12" fill="#059669"/>
      <circle cx="16" cy="14" r="8" fill="#dcfce7"/>
      <circle cx="16" cy="14" r="4" fill="#059669"/>
      <ellipse cx="12" cy="10" rx="3" ry="2.5" fill="rgba(255,255,255,.4)"/>
      <rect x="24" y="20" width="22" height="7" rx="3.5" fill="#047857"/>
      <rect x="24" y="18" width="22" height="7" rx="3.5" fill="#10b981"/>
      <rect x="25" y="19" width="18" height="3" rx="1.5" fill="rgba(255,255,255,.2)"/>
      <rect x="30" y="25" width="4" height="5" rx="1" fill="#047857"/>
      <rect x="38" y="25" width="4" height="5" rx="1" fill="#047857"/>
      <rect x="30" y="24" width="4" height="5" rx="1" fill="#059669"/>
      <rect x="38" y="24" width="4" height="5" rx="1" fill="#059669"/>
    </svg>
  ),
  'caterer': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="13" ry="2" fill="rgba(6,95,70,.18)"/>
      <ellipse cx="24" cy="40" rx="15" ry="4" fill="#047857"/>
      <ellipse cx="24" cy="38" rx="15" ry="4" fill="#10b981"/>
      <ellipse cx="24" cy="38" rx="11" ry="3" fill="rgba(255,255,255,.15)"/>
      <path d="M10 36 Q10 16 24 14 Q38 16 38 36 Z" fill="#047857"/>
      <path d="M10 34 Q10 14 24 12 Q38 14 38 34 Z" fill="#059669"/>
      <path d="M11 34 Q11 15 24 13 Q37 15 37 34 Z" fill="none" stroke="#34d399" strokeWidth=".5" opacity=".4"/>
      <ellipse cx="18" cy="22" rx="4" ry="5" fill="rgba(255,255,255,.18)" transform="rotate(-20 18 22)"/>
      <circle cx="24" cy="13" r="4" fill="#047857"/>
      <circle cx="24" cy="11" r="4" fill="#34d399"/>
      <circle cx="23" cy="10" r="1.5" fill="rgba(255,255,255,.4)"/>
      <path d="M18 8 C18 6 19 5 18 3" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 6 C24 4 25 3 24 1" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 8 C30 6 31 5 30 3" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'photographer': () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="44" rx="13" ry="2" fill="rgba(6,95,70,.18)"/>
      <rect x="9" y="20" width="36" height="24" rx="4" fill="#047857" transform="translate(0,2)"/>
      <rect x="7" y="18" width="36" height="24" rx="4" fill="#059669"/>
      <rect x="7" y="18" width="36" height="8" rx="4" fill="#10b981"/>
      <rect x="28" y="12" width="10" height="8" rx="2" fill="#047857"/>
      <rect x="28" y="10" width="10" height="8" rx="2" fill="#059669"/>
      <rect x="10" y="12" width="8" height="5" rx="1.5" fill="#34d399"/>
      <rect x="11" y="11" width="6" height="4" rx="1" fill="#a7f3d0"/>
      <circle cx="24" cy="31" r="10" fill="#047857"/>
      <circle cx="24" cy="30" r="10" fill="#065f46"/>
      <circle cx="24" cy="30" r="7.5" fill="#10b981"/>
      <circle cx="24" cy="30" r="5" fill="#065f46"/>
      <circle cx="24" cy="29" r="5" fill="#034a35"/>
      <ellipse cx="21" cy="27" rx="2.5" ry="2" fill="rgba(255,255,255,.4)"/>
      <circle cx="27" cy="32" r="1" fill="rgba(255,255,255,.2)"/>
      <circle cx="36" cy="19" r="3" fill="#10b981"/>
      <circle cx="36" cy="18" r="3" fill="#34d399"/>
    </svg>
  ),
};

/* ── data ─────────────────────────────────────────────────────────────────── */

const CHAMPIONS = [
  { name:'Local Bakery',  slug:'local-bakery',  title:'Artisan Bread & Pastries',       automation:72, category:'Food & Beverage',   emoji:'🥐', free:false },
  { name:'Auto Repair',   slug:'auto-repair',   title:'Neighborhood Mechanic Shop',      automation:65, category:'Home & Trades',      emoji:'🔧', free:true  },
  { name:'Hair Salon',    slug:'hair-salon',    title:'Cut, Color & Style Studio',       automation:81, category:'Wellness & Beauty',  emoji:'✂️', free:false },
  { name:'Plumber',       slug:'plumber',       title:'Emergency Pipe & Drain Fixes',    automation:58, category:'Home & Trades',      emoji:'🪠', free:true  },
  { name:'Pet Groomer',   slug:'pet-groomer',   title:'Pamper Your Furry Friend',        automation:76, category:'Wellness & Beauty',  emoji:'🐾', free:false },
  { name:'Florist',       slug:'florist',       title:'Fresh Blooms for Every Occasion', automation:69, category:'Food & Beverage',   emoji:'🌸', free:true  },
  { name:'Dry Cleaner',   slug:'dry-cleaner',   title:'Garment Care & Alterations',      automation:74, category:'Retail & Creative', emoji:'👔', free:false },
  { name:'Dentist',       slug:'dentist',       title:'Family Dental Clinic',            automation:83, category:'Wellness & Beauty',  emoji:'🦷', free:true  },
  { name:'Landscaper',    slug:'landscaper',    title:'Lawn Care & Garden Design',       automation:62, category:'Home & Trades',      emoji:'🌿', free:false },
  { name:'Tailor',        slug:'tailor',        title:'Custom Fits & Alterations',       automation:67, category:'Retail & Creative', emoji:'🧵', free:true  },
  { name:'Bookstore',     slug:'bookstore',     title:'Independent Local Bookshop',      automation:71, category:'Retail & Creative', emoji:'📚', free:false },
  { name:'Electrician',   slug:'electrician',   title:'Residential Wiring & Repairs',    automation:60, category:'Home & Trades',      emoji:'⚡', free:true  },
  { name:'Yoga Studio',   slug:'yoga-studio',   title:'Mindful Movement & Wellness',     automation:88, category:'Wellness & Beauty',  emoji:'🧘', free:false },
  { name:'Locksmith',     slug:'locksmith',     title:'Keys, Locks & Security',          automation:55, category:'Home & Trades',      emoji:'🔑', free:true  },
  { name:'Caterer',       slug:'caterer',       title:'Events & Private Dining',         automation:70, category:'Food & Beverage',   emoji:'🍽️', free:false },
  { name:'Photographer',  slug:'photographer',  title:'Portraits & Local Events',        automation:73, category:'Retail & Creative', emoji:'📷', free:true  },
];

const CAT_PALETTE = {
  'Food & Beverage':   { thumb:'linear-gradient(145deg,#fffbeb,#fef3c7,#fde68a)', pillBg:'#fef9c3', pillBorder:'#fde68a', pillText:'#78350f', dot:'#f59e0b' },
  'Home & Trades':     { thumb:'linear-gradient(145deg,#eff6ff,#dbeafe,#bfdbfe)', pillBg:'#dbeafe', pillBorder:'#bfdbfe', pillText:'#1e40af', dot:'#3b82f6' },
  'Wellness & Beauty': { thumb:'linear-gradient(145deg,#fff1f2,#ffe4e6,#fecdd3)', pillBg:'#ffe4e6', pillBorder:'#fecdd3', pillText:'#9f1239', dot:'#f43f5e' },
  'Retail & Creative': { thumb:'linear-gradient(145deg,#f5f3ff,#ede9fe,#ddd6fe)', pillBg:'#ede9fe', pillBorder:'#ddd6fe', pillText:'#4c1d95', dot:'#8b5cf6' },
};

const CAT_LIST = [
  /* ─ all ─ */
  { name:'All Industries',    key:'All',                Icon:Ic.layers,   match:()=>true },
  /* ─ main categories ─ */
  { _section:'By Industry' },
  { name:'Home & Trades',     key:'Home & Trades',      Icon:Ic.wrench,   match:c=>c.category==='Home & Trades' },
  { name:'Food & Beverage',   key:'Food & Beverage',    Icon:Ic.utensils, match:c=>c.category==='Food & Beverage' },
  { name:'Wellness & Beauty', key:'Wellness & Beauty',  Icon:Ic.sparkles, match:c=>c.category==='Wellness & Beauty' },
  { name:'Retail & Creative', key:'Retail & Creative',  Icon:Ic.palette,  match:c=>c.category==='Retail & Creative' },
  /* ─ subcategories ─ */
  { _section:'Subcategories' },
  { name:'Trades & Repairs',  key:'Trades & Repairs',   Icon:Ic.gear,     match:c=>['auto-repair','plumber','electrician','locksmith'].includes(c.slug) },
  { name:'Health & Body',     key:'Health & Body',      Icon:Ic.hand,     match:c=>['hair-salon','dentist','yoga-studio','pet-groomer'].includes(c.slug) },
  { name:'Events & Occasions',key:'Events & Occasions', Icon:Ic.clock,    match:c=>['caterer','florist','photographer'].includes(c.slug) },
  /* ─ quick filters ─ */
  { _section:'Quick Filters' },
  { name:'High Automation',   key:'High Automation',    Icon:Ic.trendUp,  match:c=>c.automation>=70 },
  { name:'Free Tier',         key:'Free Tier',          Icon:Ic.star,     match:c=>c.free===true },
];

const NAV_TABS = [
  { id:'discover',     Icon:Ic.bolt,    label:'Discover',       sub:'AI blueprints for every local business type' },
  { id:'near-you',     Icon:Ic.pin,     label:'Near You',        sub:'See which local businesses are already winning with AI' },
  { id:'how-it-works', Icon:Ic.compass, label:'How It Works',    sub:'Three steps from sign-up to live AI in 48 hours' },
  { id:'stories',      Icon:Ic.star,    label:'Success Stories', sub:'Real owners, real numbers, real cities' },
  { id:'plans',        Icon:Ic.gem,     label:'Plans',           sub:'Simple month-to-month pricing, full setup included' },
];

const STEPS = [
  { id:'hiw-step-0', num:'01', Icon:Ic.store,   time:'3 min',  title:'Tell us about your business', desc:'Pick your industry and answer 5 quick questions about your current tools and goals. No tech skills required.', detail:'We just need to know what\'s working, what\'s not, and what a brilliant week looks like for you.' },
  { id:'hiw-step-1', num:'02', Icon:Ic.gear,    time:'48 hrs', title:'We configure your AI',         desc:'Our team sets up AI tools wired directly to your workflow — booking software, Google profile, social accounts.',detail:'No generic templates. We connect to wherever your customers already find you.' },
  { id:'hiw-step-2', num:'03', Icon:Ic.trendUp, time:'Day 1',  title:'Go live & watch it work',      desc:'Your AI starts handling enquiries, bookings, reviews, and content automatically from day one.',               detail:'Most clients capture their first AI-handled lead within 24 hours. Your dashboard tracks every win.' },
];

const FAQS = [
  { q:'Do I need any technical knowledge?',          a:'None. We handle the entire setup. Fill in a short form about your business and we configure everything. Most clients never touch a line of code.' },
  { q:'How long does it take to go live?',           a:'Most businesses are fully live within 48 hours. Custom integrations with legacy systems typically take 3–5 business days.' },
  { q:'What if I already use booking software?',     a:'Great — we integrate with it. LocAI works alongside Fresha, Calendly, Mindbody, and most popular CRMs. Your existing data is always preserved.' },
  { q:'Can I cancel anytime?',                       a:'Yes. All plans are month-to-month with no lock-in. Cancel with 30 days\' notice and we\'ll wrap up cleanly, exporting your data on request.' },
  { q:'What results can I realistically expect?',    a:'Based on current clients: average 38% fewer no-shows, 6 hours saved on admin per week, and £1,200+ in additional monthly revenue within 90 days.' },
  { q:'Do you cover industries not listed here?',    a:'The 16 in Discover are our deepest specialisms, but we work with most local service businesses. Get in touch and we\'ll tell you what\'s possible.' },
];

const PLAN_ROWS = [
  { name:'AI chatbot & auto-replies',   s:true,      g:true,             p:true        },
  { name:'Google review management',    s:true,      g:true,             p:true        },
  { name:'Social content (3×/week)',    s:true,      g:true,             p:true        },
  { name:'Appointment reminders',       s:true,      g:true,             p:true        },
  { name:'AI booking & scheduling',     s:false,     g:true,             p:true        },
  { name:'Follow-up sequences',         s:false,     g:true,             p:true        },
  { name:'CRM integration',            s:false,     g:true,             p:true        },
  { name:'Analytics',                   s:'Basic',   g:'Weekly reports', p:'Real-time' },
  { name:'Custom API integrations',     s:false,     g:false,            p:true        },
  { name:'Dedicated account manager',   s:false,     g:false,            p:true        },
  { name:'Support',                     s:'Email',   g:'Priority email', p:'Slack + phone'},
];

const ALL_STORIES = Object.entries(LOCAL_BUSINESSES)
  .flatMap(([region, list]) => list.map(b => ({ ...b, region })));

/* ── helpers ──────────────────────────────────────────────────────────────── */

const Check = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 shrink-0">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M20 6 9 17l-5-5"/></svg>
  </span>
);

const Dash = () => <span className="text-gray-300 font-bold text-lg leading-none">—</span>;

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
  const stepRefs  = useRef([]);
  const floatRefs = useRef([]);

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
      panel:[{l:'What\'s included?',d:'Full list from £49/mo, no hidden extras'},{l:'Pricing guide',d:'Month-to-month, cancel anytime'},{l:'Compare features',d:'Find your perfect fit'}] },
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
                {/* Float wrapper (animates Y only) */}
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
                    zIndex:500,width:236,background:'white',
                    border:'1px solid rgba(16,185,129,0.2)',borderRadius:14,
                    boxShadow:'0 8px 32px rgba(0,0,0,0.1),0 0 0 1px rgba(16,185,129,0.06)',
                    overflow:'hidden',animation:'sfbPanelIn 260ms cubic-bezier(0.23,1,0.32,1) both',
                  }}>
                    <div style={{padding:'9px 13px 7px',borderBottom:'1px solid #f3f4f6',background:'#f9fafb'}}>
                      <div style={{fontSize:8,fontWeight:800,color:'#10b981',textTransform:'uppercase',letterSpacing:1.6,marginBottom:1}}>Step {step.num}</div>
                      <div style={{fontSize:11,fontWeight:700,color:'#111827'}}>{step.title}</div>
                    </div>
                    {step.panel.map((item,si) => (
                      <button key={si} style={{display:'block',width:'100%',textAlign:'left',
                        padding:'9px 13px',border:'none',
                        borderBottom:si<step.panel.length-1?'1px solid #f9fafb':'none',
                        background:'none',cursor:'pointer',transition:'background 130ms ease',
                        animation:`sfbItemIn 180ms ${50+si*45}ms ease-out both`,
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

/* ── sidebar collapsibles (outside Champions for stable DOM identity) ──────── */

function SbSection({ text, closed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'13px 20px 5px', background:'none', border:'none', cursor:'pointer',
        textAlign:'left', transition:'opacity .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity='0.6'}
      onMouseLeave={e => e.currentTarget.style.opacity='1'}
    >
      <span style={{fontSize:10, fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.1em'}}>{text}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        style={{flexShrink:0, color:'#c4c4c4', transform: closed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.25s cubic-bezier(.4,0,.2,1)'}}>
        <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function SbCollapse({ closed, children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: closed ? '0fr' : '1fr',
      transition: 'grid-template-rows 0.3s cubic-bezier(.4,0,.2,1)',
    }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          opacity: closed ? 0 : 1,
          transform: closed ? 'translateY(-6px)' : 'translateY(0)',
          transition: closed
            ? 'opacity 0.16s ease, transform 0.16s ease'
            : 'opacity 0.22s 0.08s ease, transform 0.22s 0.08s ease',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── component ────────────────────────────────────────────────────────────── */

export default function Champions() {
  const navigate = useNavigate();
  const [tab, setTab]                       = useState('discover');
  const [knowledge, setKnowledge]           = useState(5);
  const [showSetup, setShowSetup]           = useState(false);
  const [setupIndustry, setSetupIndustry]   = useState(null);
  const [search, setSearch]                 = useState('');
  const [category, setCategory]             = useState('All');
  const [viewMode, setViewMode]             = useState('grid');
  const [location, setLocation]             = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [openFaq, setOpenFaq]               = useState(null);
  const [activeStep, setActiveStep]         = useState(0);
  const [storyCityFilter, setStoryCityFilter] = useState(null);
  const [nearYouSearch, setNearYouSearch]       = useState('');
  const [nearYouVerifiedOnly, setNearYouVerifiedOnly] = useState(false);
  const [nearYouSort, setNearYouSort]           = useState('default');
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [collapsedSecs, setCollapsedSecs]       = useState({});
  const toggleSec = (id) => setCollapsedSecs(p => ({...p, [id]: !p[id]}));
  const isClosed  = (id) => !!collapsedSecs[id];
  const searchRef = useRef(null);
  const mainRef   = useRef(null);

  const recommended = knowledge <= 3 ? 'Starter' : knowledge <= 7 ? 'Growth' : 'Pro';

  const activeCatEntry = CAT_LIST.find(c => !c._section && c.key === category);
  const filtered = CHAMPIONS.filter(c => {
    const q = search.toLowerCase();
    const okSearch = !q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const okCat    = !activeCatEntry || activeCatEntry.match(c);
    return okSearch && okCat;
  });

  const storiesToShow = storyCityFilter
    ? (LOCAL_BUSINESSES[storyCityFilter] || []).map(b => ({ ...b, region: storyCityFilter }))
    : ALL_STORIES.slice(0, 12);

  const nearYouBizRaw = location ? (LOCAL_BUSINESSES[location.region] || []) : [];
  const nearYouBiz = (() => {
    const q = nearYouSearch.toLowerCase();
    let list = nearYouBizRaw.filter(biz => {
      const okSearch = !q || biz.name.toLowerCase().includes(q) || (biz.area||'').toLowerCase().includes(q) || (biz.industryLabel||'').toLowerCase().includes(q);
      const okVerified = !nearYouVerifiedOnly || biz.verified;
      return okSearch && okVerified;
    });
    if (nearYouSort === 'name')    list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    if (nearYouSort === 'verified') list = [...list].sort((a,b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
    return list;
  })();

  const openSetup  = (slug, e) => { if (e) e.stopPropagation(); setSetupIndustry(slug); setShowSetup(true); };
  const closeSetup = () => { setShowSetup(false); setSetupIndustry(null); };

  const goTab = (t) => {
    setTab(t);
    if (mainRef.current) mainRef.current.scrollTop = 0;
    if (t === 'near-you' && !location) setTimeout(() => setShowLocationPicker(true), 150);
  };

  /* scroll-spy for How It Works */
  useEffect(() => {
    if (tab !== 'how-it-works') return;
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => {
      const top = el.scrollTop + 140;
      let cur = 0;
      ['hiw-step-0','hiw-step-1','hiw-step-2','hiw-faq'].forEach((id, i) => {
        const sec = document.getElementById(id);
        if (sec && sec.offsetTop <= top) cur = i;
      });
      setActiveStep(cur);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [tab]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el && mainRef.current) mainRef.current.scrollTo({ top: el.offsetTop - 72, behavior: 'smooth' });
  };

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showSetup)         { closeSetup(); return; }
        if (showLocationPicker){ setShowLocationPicker(false); return; }
        if (search)            { setSearch(''); searchRef.current?.blur(); }
      }
      if (e.key === '/' && tab === 'discover' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSetup, showLocationPicker, search, tab]);

  /* ── sidebar sub-components ─────────────────────────────────────────────── */

  const SbHead = ({ icon: IconCmp, title, sub }) => (
    <div style={{padding:'16px 20px', borderBottom:'1px solid #f3f4f6'}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
        <span style={{color:'#10b981', display:'flex', alignItems:'center'}}>
          {typeof IconCmp === 'function' ? <IconCmp size={15} /> : <span>{IconCmp}</span>}
        </span>
        <span style={{fontWeight:600, fontSize:13, color:'#111'}}>{title}</span>
      </div>
      <p style={{fontSize:11, color:'#9ca3af', lineHeight:1.5, margin:0}}>{sub}</p>
    </div>
  );

  const SbLabel = ({ text }) => (
    <div className="px-5 pt-4 pb-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{text}</span>
    </div>
  );


  const CatCheck = ({ on }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{flexShrink:0, opacity: on ? 1 : 0, transition:'opacity .15s', color:'#10b981'}}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  /* ── SvgE3D: wraps custom SVG card icons with 3D animation + interactivity ── */
  const SvgE3D = ({ children, delay = 0, anim = 'bounce' }) => {
    const [hov, setHov] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    const [popping, setPopping] = React.useState(false);
    const popRef = React.useRef(null);
    const handleUp = () => {
      setPressed(false);
      clearTimeout(popRef.current);
      setPopping(true);
      popRef.current = setTimeout(() => setPopping(false), 500);
    };
    const shadowRest = 'drop-shadow(0 4px 8px rgba(0,0,0,.22)) drop-shadow(0 1px 3px rgba(0,0,0,.14))';
    const shadowHov  = 'drop-shadow(0 14px 24px rgba(16,185,129,.48)) drop-shadow(0 4px 8px rgba(0,0,0,.18)) drop-shadow(0 0 12px rgba(16,185,129,.2))';
    const shadowPress = 'drop-shadow(0 1px 3px rgba(0,0,0,.2))';
    return (
      <span
        className={`e3d e3d-${anim}${popping ? ' e3d-popping' : ''}${hov ? ' e3d-hovered' : ''}${pressed ? ' e3d-pressed' : ''}`}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%',
          animationDelay: `${delay}ms`,
          filter: pressed ? shadowPress : hov ? shadowHov : shadowRest,
          transform: pressed ? 'scale(0.8) translateY(3px)' : hov ? 'scale(1.28) translateY(-8px) rotate(-5deg)' : undefined,
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => { setHov(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={handleUp}
      >{children}</span>
    );
  };

  const SbItem = ({ icon: IconCmp, label, active, onClick, badge, muted }) => (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-sm transition-all border-l-2 text-left ${
        active ? 'bg-green-50 border-green-500 text-green-700 font-semibold'
               : 'border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900'
      } ${muted ? 'opacity-50' : ''}`}
    >
      {IconCmp && (
        <span className={`w-5 shrink-0 flex items-center justify-center leading-none ${active ? 'text-green-600' : 'text-gray-400'}`}>
          {typeof IconCmp === 'function'
            ? <IconCmp size={15} />
            : <E3D emoji={IconCmp} size={16} delay={0} />
          }
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {badge}
        </span>
      )}
    </button>
  );

  const SbDivider = () => <div className="mx-5 my-3 h-px bg-gray-100" />;

  /* ── render ─────────────────────────────────────────────────────────────── */

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; margin:0; }
        @keyframes stagger-in { 0%{opacity:0;transform:translateY(20px) scale(.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fade-in    { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes float-up   { 0%,100%{transform:translateY(0);opacity:.6} 50%{transform:translateY(-10px);opacity:1} }
        @keyframes bounce-soft{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes sfbPanelIn { from{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes sfbItemIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sfbFloat      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .card-icon-wrap { filter:drop-shadow(0 3px 6px rgba(16,185,129,.2)); transition:filter .25s; overflow:visible; }
        .card-group:hover .card-icon-wrap { filter:drop-shadow(0 5px 18px rgba(16,185,129,.55)); }
        .card-group:hover .card-icon-wrap .e3d { animation-play-state: paused; }
        .flip-card-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform .58s cubic-bezier(.4,0,.2,1); }
        .card-group:hover .flip-card-inner { transform:rotateY(180deg); }
        .flip-face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; overflow:hidden; border-radius:17px; display:flex; flex-direction:column; }
        .flip-back { transform:rotateY(180deg); }
        @keyframes autoBarIn  { from{width:0} to{width:var(--auto-w)} }
        @keyframes autoShimmer{ 0%{background-position:200% center} 100%{background-position:-200% center} }
        .auto-bar-track { height:5px; background:#e5e7eb; border-radius:3px; overflow:hidden; }
        .auto-bar-fill  { height:100%; border-radius:3px; background:linear-gradient(90deg,#34d399,#10b981); width:var(--auto-w); transition:box-shadow .25s ease; }
        .card-group:hover .auto-bar-fill { box-shadow:0 0 8px rgba(16,185,129,0.55); background-size:200% auto; animation:autoShimmer 1.4s linear infinite; background-image:linear-gradient(90deg,#34d399,#10b981,#34d399); }
        .card-group:hover .auto-pct { color:#059669; transform:scale(1.08); }
        .auto-pct { font-size:11px; font-weight:800; color:#10b981; transition:color .2s,transform .2s; display:inline-block; transform-origin:right center; }
        .auto-label { font-size:9px; font-weight:500; color:#9ca3af; }
        .animate-stagger-in  { animation: stagger-in .45s cubic-bezier(.23,1,.32,1) both; }
        .animate-fade-in     { animation: fade-in .35s ease both; }
        .animate-float-up    { animation: float-up 3s ease-in-out infinite; }
        .animate-bounce-soft { animation: bounce-soft 2s ease-in-out infinite; }
        .card-hover { transition: transform .3s ease, box-shadow .3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }
        .plan-glow { box-shadow: 0 0 0 2px #10b981, 0 12px 32px rgba(16,185,129,.18); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,0,0,.1); border-radius:10px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#10b981; cursor:pointer; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,.2); }
        .search-kbd { display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;background:rgba(0,0,0,.06);font-size:10px;color:#bbb;font-family:monospace; }
        .tab-active { background:white; box-shadow:0 1px 4px rgba(0,0,0,.1); }
      `}</style>

      {/* ── top nav ───────────────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:50,height:'60px',
        background:'white',
        borderBottom:'1px solid #e5e7eb',
        display:'grid',
        gridTemplateColumns:'auto 1fr auto',
        alignItems:'stretch',
        padding:'0 20px',
      }}>
        {/* ── LEFT: logo ────────────────────────────────────────────────── */}
        <div style={{display:'flex',alignItems:'center',gap:10,paddingRight:20}}>
          <button onClick={() => goTab('discover')} style={{display:'flex',alignItems:'center',gap:9,border:'none',background:'none',cursor:'pointer',padding:0}}>
            <img src="/toggle-logo.svg" style={{width:52,height:26,flexShrink:0}} alt="LocAI" />
            <span style={{fontWeight:700,fontSize:14,color:'#111',letterSpacing:'-0.2px'}}>LocAI</span>
          </button>
          <span style={{
            fontSize:9,fontWeight:600,color:'#6b7280',
            background:'#f3f4f6',border:'1px solid #e5e7eb',
            borderRadius:4,padding:'2px 5px',letterSpacing:'0.04em',lineHeight:1.6,
          }}>BETA</span>
          <div style={{width:1,height:18,background:'#e5e7eb',flexShrink:0,marginLeft:2}} />
        </div>

        {/* ── CENTER: tabs ──────────────────────────────────────────────── */}
        <div style={{display:'flex',alignItems:'stretch'}}>
          {NAV_TABS.map(t => {
            const TabIcon = t.Icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => goTab(t.id)}
                style={{
                  display:'flex',alignItems:'center',gap:6,
                  padding:'0 14px',
                  border:'none',borderBottom: active ? '2px solid #10b981' : '2px solid transparent',
                  background:'none',cursor:'pointer',
                  fontSize:13,fontWeight: active ? 600 : 400,
                  color: active ? '#111' : '#6b7280',
                  whiteSpace:'nowrap',
                  transition:'color .15s, border-color .15s',
                }}
                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.color='#374151'; }}}
                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.color='#6b7280'; }}}
              >
                <span style={{display:'flex',alignItems:'center',color: active ? '#10b981' : 'currentColor',opacity: active ? 1 : 0.6,transition:'color .15s,opacity .15s'}}>
                  <TabIcon size={13}/>
                </span>
                <span>{t.label}</span>
                {t.id === 'near-you' && location && (
                  <E3D emoji={location.flag} size={12} anim="float" interactive={false} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── RIGHT: CTA ────────────────────────────────────────────────── */}
        <div style={{display:'flex',alignItems:'center',paddingLeft:20}}>
          <button onClick={() => openSetup(null)}
            style={{
              background:'#10b981',color:'white',
              fontWeight:600,fontSize:13,
              padding:'7px 16px',borderRadius:8,border:'none',cursor:'pointer',
              transition:'background .15s',
            }}
            onMouseEnter={e=>e.currentTarget.style.background='#059669'}
            onMouseLeave={e=>e.currentTarget.style.background='#10b981'}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── page shell ────────────────────────────────────────────────────── */}
      <div style={{display:'flex',height:'calc(100vh - 64px)',marginTop:'64px',overflow:'hidden'}}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside style={{
          width: sidebarOpen ? 272 : 0,
          minWidth: 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
          background: 'white',
          position: 'relative',
        }}>
        {/* inner scroll container — fixed 272 px so content never reflows */}
        <div style={{width:272,height:'100%',display:'flex',flexDirection:'column',overflowY:'auto',borderRight:'1px solid #e5e7eb'}}>

          {/* DISCOVER sidebar */}
          {tab === 'discover' && (
            <div className="animate-fade-in">
              <SbHead icon={Ic.bolt} title="Discover" sub="Browse AI automation blueprints for 16 local business types. Filter by industry or tech level." />
              <SbSection text="Browse by industry" closed={isClosed('disc-industries')} onToggle={()=>toggleSec('disc-industries')} />
              <SbCollapse closed={isClosed('disc-industries')}> 
                <div style={{padding:'2px 14px 6px'}}>
                  {(() => {
                    let curSec = null;
                    return CAT_LIST.map((cat, ci) => {
                      if (cat._section) {
                        curSec = cat._section;
                        const secId = `catSec:${cat._section}`;
                        const secClosed = isClosed(secId);
                        return (
                          <button key={`sec-${ci}`}
                            onClick={() => toggleSec(secId)}
                            style={{
                              width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                              padding:'8px 6px 3px', background:'none', border:'none', cursor:'pointer',
                              marginTop: ci > 0 ? 4 : 0, transition:'opacity .15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity='0.65'}
                            onMouseLeave={e => e.currentTarget.style.opacity='1'}
                          >
                            <span style={{fontSize:9, fontWeight:800, color:'#d1d5db', textTransform:'uppercase', letterSpacing:'0.1em'}}>{cat._section}</span>
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"
                              style={{transform: secClosed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform .2s', color:'#d1d5db', flexShrink:0}}>
                              <path d="M1 2L4 5L7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        );
                      }
                      if (curSec && isClosed(`catSec:${curSec}`)) return null;
                      const isActive = category === cat.key;
                      const count = CHAMPIONS.filter(cat.match).length;
                      const CatIcon = cat.Icon;
                      const isQuickFilter = ['High Automation','Free Tier'].includes(cat.key);
                      return (
                        <button key={cat.key}
                          onClick={() => setCategory(isActive && cat.key !== 'All' ? 'All' : cat.key)}
                          style={{
                            width:'100%', display:'flex', alignItems:'center', gap:10,
                            padding:'7px 10px', borderRadius:12, border:'none',
                            background: isActive ? '#f0fdf4' : 'transparent',
                            cursor:'pointer', transition:'background .15s', textAlign:'left', marginBottom:2,
                          }}
                          onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='#f9fafb'; }}
                          onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}
                        >
                          <span style={{
                            width:26, height:26, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                            background: isActive ? '#d1fae5' : isQuickFilter ? '#fef9c3' : '#f3f4f6',
                            color: isActive ? '#059669' : isQuickFilter ? '#b45309' : '#9ca3af',
                            flexShrink:0, transition:'all .18s',
                          }}>
                            <CatIcon size={13}/>
                          </span>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:12, fontWeight: isActive ? 700 : 500, color: isActive ? '#065f46' : '#374151', transition:'color .15s', lineHeight:1.3}}>{cat.name}</div>
                            <div style={{fontSize:10, color:'#9ca3af'}}>{count} {isQuickFilter ? 'businesses' : 'industries'}</div>
                          </div>
                          <CatCheck on={isActive} />
                        </button>
                      );
                    });
                  })()}
                </div>
              </SbCollapse>
              <SbDivider />
              <SbSection text="Your tech level" closed={isClosed('disc-tech')} onToggle={()=>toggleSec('disc-tech')} />
              <SbCollapse closed={isClosed('disc-tech')}> 
                <div className="px-5 pb-2">
                  <input type="range" min="1" max="10" value={knowledge}
                    onChange={e => setKnowledge(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-green-500 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Beginner</span><span>Expert</span>
                  </div>
                </div>
                <div className="mx-5 mb-5 mt-2 bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-green-700 mb-0.5">Recommended plan: {recommended}</div>
                  <button onClick={() => goTab('plans')} className="text-xs text-green-600 hover:underline">See Plans tab →</button>
                </div>
              </SbCollapse>
              <SbDivider />
              <SbSection text="View" closed={isClosed('disc-view')} onToggle={()=>toggleSec('disc-view')} />
              <SbCollapse closed={isClosed('disc-view')}> 
                <div className="flex gap-2 px-5 pb-5 pt-2">
                  <button onClick={() => setViewMode('grid')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${viewMode==='grid' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                    Grid
                  </button>
                  <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${viewMode==='list' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>
                    List
                  </button>
                </div>
              </SbCollapse>
            </div>
          )}

          {/* NEAR YOU sidebar */}
          {tab === 'near-you' && (
            <div className="animate-fade-in">
              <SbHead icon={Ic.pin} title="Near You" sub="See which local businesses in your city are using AI and the results they're getting." />
              <SbSection text="Your location" closed={isClosed('ny-location')} onToggle={()=>toggleSec('ny-location')} />
              <SbCollapse closed={isClosed('ny-location')}> 
              <div className="px-5 pb-4">
                {location ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 flex items-center gap-3">
                    <E3D emoji={location.flag} size={28} anim="float" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm">{location.name}</div>
                      <div className="text-xs text-gray-500">{location.country}</div>
                    </div>
                    <button onClick={() => setShowLocationPicker(true)} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold">Change</button>
                  </div>
                ) : (
                  <button onClick={() => setShowLocationPicker(true)}
                    className="w-full bg-green-500 hover:bg-green-400 text-white text-sm font-semibold py-3 rounded-xl transition-colors mb-3 flex items-center justify-center gap-2">
                    <Ic.pin size={14} /> Choose your city
                  </button>
                )}
              </div>
              </SbCollapse>
              <SbDivider />
              <SbSection text="Popular cities" closed={isClosed('ny-cities')} onToggle={()=>toggleSec('ny-cities')} />
              <SbCollapse closed={isClosed('ny-cities')}> 
              {POPULAR_CITIES.slice(0, 9).map(city => (
                <SbItem key={city.region} icon={city.flag} label={city.name}
                  active={location?.region === city.region}
                  badge={(LOCAL_BUSINESSES[city.region] || []).length + ' biz'}
                  onClick={() => setLocation(city)}
                />
              ))}
              </SbCollapse>
              <SbDivider />
              <SbSection text="Filter results" closed={isClosed('ny-filter')} onToggle={()=>toggleSec('ny-filter')} />
              <SbCollapse closed={isClosed('ny-filter')}> 
              <div style={{padding:'2px 14px 14px'}}>
                {/* search input */}
                <div style={{position:'relative',marginBottom:8}}>
                  <Ic.search size={12} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',pointerEvents:'none'}} />
                  <input
                    type="text"
                    placeholder="Name, area or industry…"
                    value={nearYouSearch}
                    onChange={e => setNearYouSearch(e.target.value)}
                    style={{
                      width:'100%', boxSizing:'border-box',
                      paddingLeft:28, paddingRight: nearYouSearch ? 28 : 10,
                      paddingTop:7, paddingBottom:7,
                      borderRadius:10, border:'1px solid #e5e7eb',
                      background:'#f9fafb', fontSize:12,
                      outline:'none', color:'#111',
                      transition:'border-color .15s',
                    }}
                    onFocus={e  => e.target.style.borderColor='#6ee7b7'}
                    onBlur={e   => e.target.style.borderColor='#e5e7eb'}
                  />
                  {nearYouSearch && (
                    <button onClick={() => setNearYouSearch('')}
                      style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',border:'none',background:'none',cursor:'pointer',color:'#9ca3af',fontSize:15,lineHeight:1,padding:0}}>
                      ×
                    </button>
                  )}
                </div>

                {/* verified-only toggle */}
                <button
                  onClick={() => setNearYouVerifiedOnly(v => !v)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:8,
                    padding:'7px 10px', borderRadius:10, cursor:'pointer', transition:'all .15s',
                    border:`1px solid ${nearYouVerifiedOnly ? '#6ee7b7' : '#e5e7eb'}`,
                    background: nearYouVerifiedOnly ? '#f0fdf4' : 'white',
                    marginBottom:8,
                  }}
                >
                  <div style={{
                    width:16, height:16, borderRadius:'50%', flexShrink:0,
                    background: nearYouVerifiedOnly ? '#10b981' : '#e5e7eb',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'background .15s',
                    boxShadow: nearYouVerifiedOnly ? '0 0 0 3px rgba(16,185,129,.15)' : 'none',
                  }}>
                    {nearYouVerifiedOnly && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  </div>
                  <span style={{fontSize:12,fontWeight: nearYouVerifiedOnly ? 600 : 400, color: nearYouVerifiedOnly ? '#065f46' : '#6b7280'}}>Verified only</span>
                </button>

                {/* sort */}
                <div style={{display:'flex',gap:4}}>
                  {[['default','All'],['name','A–Z'],['verified','✓ First']].map(([val,label]) => (
                    <button key={val} onClick={() => setNearYouSort(val)}
                      style={{
                        flex:1, fontSize:10, fontWeight: nearYouSort===val ? 700 : 400,
                        padding:'5px 0', borderRadius:8, border:'none', cursor:'pointer',
                        background: nearYouSort===val ? '#10b981' : '#f3f4f6',
                        color: nearYouSort===val ? 'white' : '#6b7280',
                        transition:'all .15s',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* active-filter count */}
                {(nearYouSearch || nearYouVerifiedOnly || nearYouSort !== 'default') && (
                  <button onClick={() => { setNearYouSearch(''); setNearYouVerifiedOnly(false); setNearYouSort('default'); }}
                    style={{width:'100%',marginTop:8,fontSize:11,color:'#9ca3af',background:'none',border:'none',cursor:'pointer',textAlign:'center',transition:'color .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
                    onMouseLeave={e=>e.currentTarget.style.color='#9ca3af'}
                  >
                    Clear filters
                  </button>
                )}
              </div>
              </SbCollapse>
            </div>
          )}

          {/* HOW IT WORKS sidebar */}
          {tab === 'how-it-works' && (
            <div className="animate-fade-in">
              <SbHead icon={Ic.compass} title="How It Works" sub="Three steps from sign-up to live AI. Most businesses go live in under 48 hours." />
              <SbSection text="Your journey" closed={isClosed('hiw-journey')} onToggle={()=>toggleSec('hiw-journey')} />
              <SbCollapse closed={isClosed('hiw-journey')}> 
                {STEPS.map((step, i) => (
                  <SbItem key={i} icon={step.Icon} label={step.title}
                    active={activeStep === i}
                    badge={step.time}
                    onClick={() => { setActiveStep(i); scrollTo(step.id); }}
                  />
                ))}
                <SbItem icon={Ic.message} label="FAQ" active={activeStep === 3} onClick={() => { setActiveStep(3); scrollTo('hiw-faq'); }} />
              </SbCollapse>
              <SbDivider />
              <div className="px-5 pb-5 space-y-3">
                <button onClick={() => openSetup(null)}
                  className="w-full bg-green-500 hover:bg-green-400 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
                  Start my free setup →
                </button>
                <p className="text-center text-xs text-gray-400">No credit card · No tech skills · 48 hrs</p>
              </div>
              <SbDivider />
              <SbSection text="Time to complete" closed={isClosed('hiw-timing')} onToggle={()=>toggleSec('hiw-timing')} />
              <SbCollapse closed={isClosed('hiw-timing')}> 
                <div className="px-5 pb-5 space-y-2">
                  {[{ label:'Setup form',    time:'3 min' },{ label:'AI configured', time:'48 hrs' },{ label:'First AI win', time:'Day 1–3' }].map(r => (
                    <div key={r.label} className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{r.label}</span>
                      <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{r.time}</span>
                    </div>
                  ))}
                </div>
              </SbCollapse>
            </div>
          )}

          {/* STORIES sidebar */}
          {tab === 'stories' && (
            <div className="animate-fade-in">
              <SbHead icon={Ic.star} title="Success Stories" sub="Real results from real business owners across cities worldwide." />
              <SbSection text="Global impact" closed={isClosed('st-impact')} onToggle={()=>toggleSec('st-impact')} />
              <SbCollapse closed={isClosed('st-impact')}> 
                <div className="px-5 pb-4 space-y-2">
                  {[{ Icon:Ic.store,    v:'2,400+', l:'Businesses live' },
                    { Icon:Ic.currency, v:'£1,200+', l:'Avg monthly uplift' },
                    { Icon:Ic.star,     v:'4.9/5',  l:'Satisfaction' },
                    { Icon:Ic.clock,    v:'6 hrs/wk',l:'Admin saved' }].map(s => (
                    <div key={s.l} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                      <span className="w-6 h-6 flex items-center justify-center text-emerald-600 shrink-0"><s.Icon size={16} /></span>
                      <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight">{s.v}</div>
                        <div className="text-xs text-gray-400">{s.l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SbCollapse>
              <SbDivider />
              <SbSection text="Filter by city" closed={isClosed('st-cities')} onToggle={()=>toggleSec('st-cities')} />
              <SbCollapse closed={isClosed('st-cities')}> 
                <SbItem label="All cities" active={!storyCityFilter} badge={ALL_STORIES.length} onClick={() => setStoryCityFilter(null)} />
                {POPULAR_CITIES.map(city => (
                  <SbItem key={city.region} icon={city.flag} label={city.name}
                    active={storyCityFilter === city.region}
                    badge={(LOCAL_BUSINESSES[city.region] || []).length}
                    onClick={() => setStoryCityFilter(city.region)}
                    muted={!(LOCAL_BUSINESSES[city.region]?.length)}
                  />
                ))}
              </SbCollapse>
            </div>
          )}

          {/* PLANS sidebar */}
          {tab === 'plans' && (
            <div className="animate-fade-in">
              <SbHead icon={Ic.gem} title="Plans" sub="Month-to-month pricing. Cancel anytime. Full setup by our team included in every plan." />
              <SbSection text="Find your fit" closed={isClosed('pl-fit')} onToggle={()=>toggleSec('pl-fit')} />
              <SbCollapse closed={isClosed('pl-fit')}> 
                <div className="px-5 pb-4">
                  <div className="text-xs text-gray-500 mb-2 font-medium">Your tech comfort level</div>
                  <input type="range" min="1" max="10" value={knowledge}
                    onChange={e => setKnowledge(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-green-500 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1 mb-3">
                    <span>Beginner</span><span>Expert</span>
                  </div>
                  <div className={`rounded-xl p-3 border ${recommended==='Pro' ? 'bg-gray-900 border-gray-700' : 'bg-green-50 border-green-200'}`}>
                    <div className={`text-xs font-bold mb-0.5 ${recommended==='Pro' ? 'text-white' : 'text-gray-900'}`}>✓ Recommended: {recommended}</div>
                    <div className={`text-xs ${recommended==='Pro' ? 'text-gray-300' : 'text-gray-500'}`}>{recommended==='Starter'?'£49/mo':recommended==='Growth'?'£99/mo':'£199/mo'} · full setup included</div>
                  </div>
                </div>
              </SbCollapse>
              <SbDivider />
              <SbSection text="Included in all plans" closed={isClosed('pl-included')} onToggle={()=>toggleSec('pl-included')} />
              <SbCollapse closed={isClosed('pl-included')}> 
                <div className="px-5 pb-5 space-y-2.5">
                  {['Full setup by our team','Month-to-month billing','Cancel anytime','All integrations included','Onboarding support'].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-xs text-gray-600">
                      <Check />
                      {f}
                    </div>
                  ))}
                </div>
              </SbCollapse>
              <SbDivider />
              <SbSection text="Quick compare" closed={isClosed('pl-compare')} onToggle={()=>toggleSec('pl-compare')} />
              <SbCollapse closed={isClosed('pl-compare')}> 
                {[{name:'Starter',price:'£49'},{ name:'Growth',price:'£99'},{name:'Pro',price:'£199'}].map(p => (
                  <SbItem key={p.name} label={p.name} active={recommended===p.name} badge={p.price+'/mo'} onClick={() => {}} />
                ))}
              </SbCollapse>
            </div>
          )}
        </div>{/* /inner scroll */}
        </aside>

        {/* ── SIDEBAR TOGGLE STRIP ──────────────────────────────────────────── */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            flexShrink: 0,
            width: 18,
            alignSelf: 'stretch',
            background: 'white',
            border: 'none',
            borderRight: '1px solid #e5e7eb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d1d5db',
            padding: 0,
            outline: 'none',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='#f0fdf4';e.currentTarget.style.color='#10b981';}}
          onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color='#d1d5db';}}
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            {sidebarOpen
              ? <path d="M6 1L2 7L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M2 1L6 7L2 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
        </button>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main ref={mainRef} style={{flex:1,overflowY: tab === 'near-you' && location ? 'hidden' : 'auto',background:'#f9fafb',display:'flex',flexDirection:'column'}}>

          {/* ── DISCOVER ─────────────────────────────────────────────────── */}
          {tab === 'discover' && (
            <div className="animate-fade-in">
              {/* Steps flow banner — header + icons */}
              <div style={{position:'relative'}}>

                {/* Compact hero panel */}
                <div style={{background:'white',position:'relative',overflow:'hidden',padding:'22px 32px 14px',borderBottom:'1px solid #f3f4f6'}}>
                  <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(16,185,129,.05) 1px,transparent 1px)',backgroundSize:'22px 22px',pointerEvents:'none'}} />
                  <div style={{position:'absolute',top:-40,right:-20,width:240,height:240,background:'radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 65%)',pointerEvents:'none'}} />

                  <div style={{position:'relative',maxWidth:'100%'}}>
                    {/* Headline + stats in one tight row */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,flexWrap:'wrap'}}>
                      <div style={{display:'flex',alignItems:'center',gap:16}}>
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                            <span style={{width:5,height:5,borderRadius:'50%',background:'#10b981',display:'inline-block'}} />
                            <span style={{fontSize:9,fontWeight:700,color:'#059669',letterSpacing:'0.14em',textTransform:'uppercase'}}>How it works</span>
                          </div>
                          <h2 style={{fontSize:'clamp(18px,2.4vw,28px)',fontWeight:900,letterSpacing:'-0.8px',color:'#0f172a',lineHeight:1.1,margin:0}}>
                            From sign-up to{' '}
                            <span style={{color:'#10b981',position:'relative',display:'inline-block'}}>
                              live in 48 hrs
                              <svg style={{position:'absolute',bottom:-2,left:0,width:'100%',overflow:'visible'}} viewBox="0 0 220 8" preserveAspectRatio="none" height="5">
                                <path d="M0 6 Q55 1 110 5 Q165 10 220 2" stroke="#a7f3d0" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                              </svg>
                            </span>
                          </h2>
                        </div>
                      </div>

                      {/* Stat chips */}
                      <div style={{display:'flex',gap:8,flexShrink:0}}>
                        {[{num:'6',label:'steps'},{num:'48h',label:'to go live'},{num:'£0',label:'to start'}].map(s=>(
                          <div key={s.num} style={{background:'#f0fdf4',border:'1px solid #d1fae5',borderRadius:12,padding:'8px 14px',textAlign:'center',minWidth:56}}>
                            <div style={{fontSize:16,fontWeight:900,color:'#065f46',letterSpacing:'-0.5px',lineHeight:1}}>{s.num}</div>
                            <div style={{fontSize:8,color:'#6b7280',marginTop:3,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{background:'white',padding:'0 32px 20px'}}>
                  <StepsFlowBanner />
                </div>
              </div>

              {/* search + view toggle bar */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-8 py-3">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                  <div className="relative">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                    <input ref={searchRef} type="text" placeholder="Search industries…" value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 w-56 transition"
                    />
                    {search
                      ? <button onClick={()=>setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
                      : <span className="search-kbd absolute right-2.5 top-1/2 -translate-y-1/2">/</span>
                    }
                  </div>
                  {(search || category !== 'All') && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{filtered.length} result{filtered.length!==1?'s':''}</span>
                      {category !== 'All' && <span className="text-xs bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">{category}<button onClick={()=>setCategory('All')} className="ml-0.5 font-bold">×</button></span>}
                      {search && <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">"{search}"<button onClick={()=>setSearch('')} className="ml-0.5 font-bold">×</button></span>}
                      <button onClick={()=>{setSearch('');setCategory('All');}} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
                    </div>
                  )}
                  <div style={{flex:1}} />
                  {/* view mode toggle */}
                  <div style={{display:'flex',gap:2,background:'#f3f4f6',borderRadius:8,padding:3}}>
                    {[
                      { mode:'grid', icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>, label:'Grid' },
                      { mode:'list', icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1" fill="currentColor" stroke="none"/></svg>, label:'List' },
                    ].map(({mode,icon,label}) => (
                      <button key={mode} onClick={()=>setViewMode(mode)} style={{
                        display:'flex',alignItems:'center',gap:4,
                        padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',
                        background: viewMode===mode ? 'white' : 'transparent',
                        color: viewMode===mode ? '#111' : '#9ca3af',
                        boxShadow: viewMode===mode ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                        fontSize:11,fontWeight:500,transition:'all .15s',
                      }}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-w-5xl mx-auto px-8 py-7">
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center py-24 text-center">
                    <div className="mb-4 text-gray-300 animate-bounce-soft"><Ic.search size={56} /></div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No industries found</h3>
                    <p className="text-sm text-gray-400 mb-5">Try a different search or select All Industries in the sidebar</p>
                    <button onClick={()=>{setSearch('');setCategory('All');}} className="bg-green-500 text-white text-sm font-semibold px-6 py-2.5 rounded-2xl hover:bg-green-400 transition-colors">Reset filters</button>
                  </div>
                )}

                {viewMode === 'grid' && filtered.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((c, i) => (
                      <div key={c.slug} onClick={()=>navigate(`/industry/${c.slug}`)}
                        className="animate-stagger-in card-group"
                        style={{
                          animationDelay:`${i*45}ms`,
                          position:'relative',
                          height:196,
                          background:'linear-gradient(145deg,#f8fffe 0%,#f0fdf4 60%,#ecfdf5 100%)',
                          border:'1px solid #e5e7eb',
                          borderRadius:20,
                          overflow:'hidden',
                          cursor:'pointer',
                          display:'flex',
                          flexDirection:'column',
                          padding:'16px 16px 14px',
                          transition:'box-shadow .22s,transform .22s,border-color .22s',
                          boxShadow:'0 1px 3px rgba(0,0,0,.06)',
                        }}
                        onMouseEnter={e=>{
                          e.currentTarget.style.boxShadow='0 10px 32px rgba(16,185,129,.18),0 2px 8px rgba(0,0,0,.08)';
                          e.currentTarget.style.transform='translateY(-4px) scale(1.015)';
                          e.currentTarget.style.borderColor='#6ee7b7';
                        }}
                        onMouseLeave={e=>{
                          e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.06)';
                          e.currentTarget.style.transform='';
                          e.currentTarget.style.borderColor='#e5e7eb';
                        }}
                      >
                        {/* subtle corner glow */}
                        <div style={{position:'absolute',top:0,right:0,width:80,height:80,background:'radial-gradient(circle at top right,rgba(52,211,153,.18),transparent 70%)',borderRadius:'0 20px 0 0',pointerEvents:'none'}} />

                        {/* top row: icon + automation% */}
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                          <div className="card-icon-wrap" style={{width:48,height:48}}>
                            <SvgE3D delay={i*180} anim="bounce">
                              {CARD_ICONS[c.slug] ? React.createElement(CARD_ICONS[c.slug]) : <E3D emoji={c.emoji} size={28} delay={i*120} />}
                            </SvgE3D>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontSize:17,fontWeight:900,color:'#10b981',letterSpacing:'-0.5px',lineHeight:1}}>{c.automation}%</div>
                            <div style={{fontSize:8,color:'#94a3b8',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',marginTop:1}}>AI</div>
                          </div>
                        </div>

                        {/* name */}
                        <div style={{fontSize:14,fontWeight:800,color:'#0f172a',letterSpacing:'-0.3px',lineHeight:1.2,marginBottom:3}}>{c.name}</div>

                        {/* title / subtitle */}
                        <div style={{fontSize:11,color:'#64748b',lineHeight:1.4,flex:1}}>{c.title}</div>

                        {/* bottom row: pill + bar */}
                        <div style={{display:'flex',alignItems:'center',gap:5,marginTop:10}}>
                          <span style={{fontSize:9,fontWeight:700,color:'#059669',background:'#f0fdf4',border:'1px solid #d1fae5',borderRadius:20,padding:'2px 7px',letterSpacing:'0.04em',textTransform:'uppercase',flexShrink:0}}>{c.category.split(' & ')[0]}</span>
                          {c.free && <span style={{fontSize:9,fontWeight:700,color:'#047857',background:'#d1fae5',border:'1px solid #a7f3d0',borderRadius:20,padding:'2px 6px',flexShrink:0}}>Free</span>}
                          <div style={{flex:1,height:3,background:'rgba(0,0,0,0.08)',borderRadius:2,overflow:'hidden',marginLeft:2}}>
                            <div style={{height:'100%',width:`${c.automation}%`,background:'#10b981',borderRadius:2}} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && filtered.length > 0 && (
                  <div className="space-y-2">
                    {filtered.map((c, i) => (
                      <div key={c.slug} onClick={()=>navigate(`/industry/${c.slug}`)}
                        className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200/80 p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer card-group animate-stagger-in"
                        style={{animationDelay:`${i*30}ms`}}>
                        <div style={{width:52,height:52,borderRadius:12,flexShrink:0,border:'1px solid #d1fae5',background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',display:'flex',alignItems:'center',justifyContent:'center',padding:6}}>
                          <div className="card-icon-wrap" style={{'width':'100%','height':'100%'}}>
                            <SvgE3D delay={i*140} anim="float">
                              {CARD_ICONS[c.slug] ? React.createElement(CARD_ICONS[c.slug]) : <E3D emoji={c.emoji} size={24} delay={i*100} />}
                            </SvgE3D>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-green-600 transition-colors">{c.name}</h3>
                            {c.free && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">EARLY</span>}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{c.title}</p>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full hidden md:block shrink-0">{c.category}</span>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2,flexShrink:0,minWidth:60}}>
                          <span className="auto-pct">{c.automation}%</span>
                          <div className="auto-bar-track" style={{width:56}}>
                            <div className="auto-bar-fill" style={{'--auto-w':`${c.automation}%`}} />
                          </div>
                        </div>
                        <button onClick={e=>openSetup(c.slug,e)} className="shrink-0 bg-green-500 hover:bg-green-400 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">Add AI</button>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-green-400 transition-colors shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── NEAR YOU ─────────────────────────────────────────────────── */}
          {tab === 'near-you' && (
            <div className="animate-fade-in" style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
              {!location ? (
                /* ── empty state ── */
                <div style={{
                  flex:1,display:'flex',flexDirection:'column',
                  alignItems:'center',justifyContent:'center',
                  textAlign:'center',padding:'40px 32px',
                  background:'#f9fafb',
                }}>
                  {/* animated pin */}
                  <div style={{marginBottom:32,animation:'float-up 3s ease-in-out infinite'}}>
                    <svg width="76" height="92" viewBox="0 0 76 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="38" cy="88" rx="14" ry="4" fill="rgba(16,185,129,.15)"/>
                      <path d="M38 4C21.432 4 8 17.432 8 34C8 55 38 84 38 84C38 84 68 55 68 34C68 17.432 54.568 4 38 4Z" fill="#10b981"/>
                      <path d="M38 4C21.432 4 8 17.432 8 34C8 55 38 84 38 84C38 84 68 55 68 34C68 17.432 54.568 4 38 4Z" fill="url(#pinGrad)"/>
                      <defs>
                        <linearGradient id="pinGrad" x1="38" y1="4" x2="38" y2="84" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#34d399"/>
                          <stop offset="100%" stopColor="#059669"/>
                        </linearGradient>
                      </defs>
                      <circle cx="38" cy="34" r="13" fill="white" opacity="0.95"/>
                      <circle cx="38" cy="34" r="6" fill="#10b981"/>
                    </svg>
                  </div>
                  <h2 style={{fontSize:30,fontWeight:800,color:'#111',marginBottom:12,letterSpacing:'-0.5px',lineHeight:1.2}}>
                    See AI wins in your city
                  </h2>
                  <p style={{fontSize:16,color:'#9ca3af',maxWidth:430,lineHeight:1.65,marginBottom:32,margin:'0 auto 32px'}}>
                    Real businesses in your city are already using AI to cut no-shows, capture more leads, and save hours every week.
                  </p>
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    style={{
                      display:'inline-flex',alignItems:'center',gap:10,
                      background:'#10b981',color:'white',
                      fontWeight:700,fontSize:15,
                      padding:'14px 28px',borderRadius:50,
                      border:'none',cursor:'pointer',
                      boxShadow:'0 4px 24px rgba(16,185,129,.4)',
                      transition:'all .18s',
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background='#059669';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(16,185,129,.45)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='#10b981';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 24px rgba(16,185,129,.4)';}}
                  >
                    <Ic.pin size={17} />
                    Choose your city
                  </button>
                  <p style={{fontSize:12,color:'#d1d5db',marginTop:16}}>Or pick a city from the left panel</p>
                </div>
              ) : (
                /* ── map view ── */
                <div style={{position:'relative',flex:1,overflow:'hidden'}}>
                  {/* Full-bleed Google Maps satellite embed */}
                  <iframe
                    key={location.region}
                    title={`Map of ${location.name}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(location.name + ', ' + location.country)}&output=embed&z=14&t=k`}
                    style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  {/* Floating business card panel — top right */}
                  <div style={{
                    position:'absolute',top:16,right:16,
                    width:310,
                    maxHeight:'calc(100% - 32px)',
                    background:'rgba(255,255,255,0.97)',
                    backdropFilter:'blur(16px)',
                    WebkitBackdropFilter:'blur(16px)',
                    borderRadius:18,
                    boxShadow:'0 8px 40px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.08)',
                    display:'flex',flexDirection:'column',
                    overflow:'hidden',
                    border:'1px solid rgba(255,255,255,.8)',
                  }}>
                    {/* Panel header */}
                    <div style={{
                      padding:'14px 16px 12px',
                      borderBottom:'1px solid #f3f4f6',
                      display:'flex',alignItems:'center',justifyContent:'space-between',
                      flexShrink:0,
                    }}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:20,lineHeight:1}}>{location.flag}</span>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:'#111',lineHeight:1.2}}>{location.name}</div>
                          <div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>
                            {nearYouBizRaw.length} {nearYouBizRaw.length === 1 ? 'business' : 'businesses'} using AI
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowLocationPicker(true)}
                        style={{
                          fontSize:11,fontWeight:600,color:'#10b981',
                          background:'#f0fdf4',border:'1px solid #bbf7d0',
                          borderRadius:8,padding:'5px 10px',cursor:'pointer',
                          transition:'all .12s',flexShrink:0,
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.background='#dcfce7';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='#f0fdf4';}}
                      >
                        Change
                      </button>
                    </div>

                    {/* Scrollable business list */}
                    <div style={{flex:1,overflowY:'auto',padding:'6px 0'}}>
                      {nearYouBizRaw.length > 0 ? nearYouBizRaw.map((biz, i) => (
                        <div key={biz.id}
                          onClick={() => navigate(`/industry/${biz.slug}`)}
                          style={{
                            display:'flex',alignItems:'flex-start',gap:11,
                            padding:'10px 16px',cursor:'pointer',
                            transition:'background .12s',
                            borderBottom: i < nearYouBizRaw.length - 1 ? '1px solid #f9fafb' : 'none',
                          }}
                          onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        >
                          <div style={{
                            width:44,height:44,borderRadius:10,
                            background:'#f0fdf4',flexShrink:0,overflow:'hidden',
                          }}>
                            <img src={biz.image} alt={biz.name}
                              style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                              onError={e=>{e.target.style.display='none';}}
                            />
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
                              <span style={{fontSize:12,fontWeight:700,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{biz.name}</span>
                              {biz.verified && (
                                <span style={{flexShrink:0,width:13,height:13,background:'#10b981',borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
                                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                </span>
                              )}
                            </div>
                            <div style={{fontSize:10,color:'#9ca3af',marginBottom:3}}>{biz.area} · {biz.industryLabel}</div>
                            <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                              <span style={{fontSize:15,fontWeight:800,color:'#059669',lineHeight:1}}>{biz.headline}</span>
                              <span style={{fontSize:10,color:'#9ca3af'}}>{biz.headlineLabel}</span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div style={{textAlign:'center',padding:'36px 20px'}}>
                          <div style={{fontSize:32,marginBottom:10}}>📍</div>
                          <div style={{fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>No stories yet for {location.name}</div>
                          <div style={{fontSize:11,color:'#9ca3af',marginBottom:16}}>Be the first business in your city to go live with AI.</div>
                          <button
                            onClick={() => openSetup(null)}
                            style={{background:'#10b981',color:'white',fontWeight:600,fontSize:12,padding:'9px 18px',borderRadius:10,border:'none',cursor:'pointer'}}
                          >
                            Get started →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Panel footer CTA */}
                    {nearYouBizRaw.length > 0 && (
                      <div style={{padding:'12px 16px',borderTop:'1px solid #f3f4f6',flexShrink:0,background:'white'}}>
                        <button
                          onClick={() => openSetup(null)}
                          style={{
                            width:'100%',background:'#10b981',color:'white',
                            fontWeight:700,fontSize:13,padding:'11px',
                            borderRadius:12,border:'none',cursor:'pointer',
                            transition:'background .15s',
                          }}
                          onMouseEnter={e=>e.currentTarget.style.background='#059669'}
                          onMouseLeave={e=>e.currentTarget.style.background='#10b981'}
                        >
                          Get AI for my business →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
          {tab === 'how-it-works' && (
            <div className="animate-fade-in">
              <div style={{background:'linear-gradient(135deg,#052e16,#064e3b)',position:'relative',overflow:'hidden',padding:'48px 32px',textAlign:'center'}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px)',backgroundSize:'24px 24px',pointerEvents:'none'}} />
                <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:300,background:'radial-gradient(ellipse,rgba(52,211,153,.12) 0%,transparent 70%)',pointerEvents:'none'}} />
                <div style={{position:'relative'}}>
                  <div style={{display:'inline-block',background:'rgba(52,211,153,.15)',border:'1px solid rgba(52,211,153,.3)',borderRadius:100,padding:'4px 14px',fontSize:11,fontWeight:700,color:'#6ee7b7',textTransform:'uppercase',letterSpacing:1,marginBottom:16}}>The Process</div>
                  <h2 style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:800,color:'white',marginBottom:12,lineHeight:1.2,letterSpacing:'-0.5px'}}>From "I've heard of AI"<br/>to "AI runs my business"</h2>
                  <p style={{color:'rgba(255,255,255,.55)',fontSize:15,maxWidth:480,margin:'0 auto'}}>Three steps. Zero tech skills. Most businesses go live in under 48 hours.</p>
                </div>
              </div>
              <div className="max-w-3xl mx-auto px-8 py-10 space-y-5">
                {STEPS.map((step, i) => (
                  <div key={step.id} id={step.id}
                    className={`bg-white rounded-3xl border p-8 shadow-sm transition-all duration-300 ${activeStep === i ? 'border-green-300 shadow-md' : 'border-gray-200'}`}>
                    <div className="flex gap-6 items-start">
                      <div className="shrink-0 text-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md"><step.Icon size={26} /></div>
                        <div className="text-xs font-bold text-gray-400 tracking-widest mt-2">{step.num}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                          <span className="shrink-0 bg-green-50 border border-green-200 text-green-700 font-bold text-xs px-3 py-1.5 rounded-xl">{step.time}</span>
                        </div>
                        <p className="text-gray-600 text-base mb-2">{step.desc}</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center py-4">
                  <button onClick={()=>openSetup(null)}
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-md">
                    Start my setup — it's free
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <p className="text-xs text-gray-400 mt-2">No credit card · No tech skills · Go live in 48 hours</p>
                </div>

                <div id="hiw-faq" className="pt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">Frequently asked questions</h3>
                  <div className="space-y-2">
                    {FAQS.map((faq, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
                        <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
                          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                          <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                          <span className={`text-gray-400 text-xl leading-none transition-transform duration-200 shrink-0 ml-4 ${openFaq===i?'rotate-45':''}`}>+</span>
                        </button>
                        {openFaq === i && <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STORIES ──────────────────────────────────────────────────── */}
          {tab === 'stories' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-10 text-center">
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">Real Results</div>
                <h2 className="text-3xl font-bold text-white mb-2">The numbers don't lie</h2>
                <p className="text-gray-400 text-sm">Across {storyCityFilter ? '1 city' : 'every city'} — real business owners, real impact</p>
              </div>
              <div className="max-w-5xl mx-auto px-8 py-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-gray-900">
                    {storyCityFilter
                      ? `Stories from ${POPULAR_CITIES.find(c=>c.region===storyCityFilter)?.name}`
                      : `Businesses across the world using LocAI`}
                    <span className="ml-2 text-gray-400 font-normal text-sm">({storiesToShow.length})</span>
                  </h3>
                  {storyCityFilter && (
                    <button onClick={()=>setStoryCityFilter(null)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      Clear filter ×
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {storiesToShow.map((biz, i) => (
                    <div key={biz.id} onClick={()=>navigate(`/industry/${biz.slug}`)}
                      className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden cursor-pointer hover:border-emerald-300 hover:shadow-xl transition-all duration-300 group animate-stagger-in flex flex-col"
                      style={{animationDelay:`${i*35}ms`}}>
                      <div style={{position:'relative',height:130,overflow:'hidden',flexShrink:0,background:'#f0fdf4'}}>
                        <img src={biz.image} alt={biz.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform .45s ease'}} className="group-hover:scale-105"/>
                        <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,rgba(16,185,129,.2) 0%,transparent 55%)'}} />
                        <div style={{position:'absolute',bottom:0,left:0,right:0,height:36,background:'linear-gradient(to top,white,transparent)'}} />
                        {biz.verified && (
                          <div style={{position:'absolute',top:8,left:8,display:'flex',alignItems:'center',gap:4,background:'#10b981',color:'white',fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:8}}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Verified
                          </div>
                        )}
                        <div style={{position:'absolute',top:8,right:8,background:'rgba(5,150,105,.12)',border:'1px solid rgba(16,185,129,.25)',color:'#065f46',fontSize:9,fontWeight:600,padding:'2px 7px',borderRadius:8,backdropFilter:'blur(4px)'}}>{biz.industryLabel}</div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:1}}>{biz.name}</div>
                        <div style={{fontSize:10,color:'#9ca3af',marginBottom:8}}>{biz.area}</div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-extrabold text-emerald-600 leading-none">{biz.headline}</span>
                          <span className="text-xs text-gray-500 font-medium">{biz.headlineLabel}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{biz.story}</p>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">{biz.owner[0]}</div>
                            <span className="text-xs text-gray-400">{biz.owner} · {biz.since}</span>
                          </div>
                          <span className="text-xs text-emerald-600 font-semibold group-hover:underline">See how →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 text-center">
                  <img src="/toggle-logo.svg" alt="" style={{width:80,height:40,margin:'0 auto 12px'}} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Add your business to this list</h3>
                  <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">Every story here started with a 3-minute setup form.</p>
                  <button onClick={()=>openSetup(null)} className="bg-green-500 hover:bg-green-400 text-white font-bold px-10 py-3 rounded-2xl shadow-md transition-all">Start for free →</button>
                </div>
              </div>
            </div>
          )}

          {/* ── PLANS ────────────────────────────────────────────────────── */}
          {tab === 'plans' && (
            <div className="animate-fade-in">
              <div className="bg-white border-b border-gray-100 px-8 py-10 text-center">
                <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">Transparent Pricing</div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Simple plans, serious results</h2>
                <p className="text-gray-400 text-lg max-w-md mx-auto">Month-to-month · Cancel anytime · Full setup by our team included</p>
              </div>
              <div className="max-w-4xl mx-auto px-8 py-10">
                {/* Plan cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {[
                    { name:'Starter', price:'£49', tagline:'Perfect for businesses new to AI. We handle everything.',       badge:'Best value',   bc:'bg-blue-100 text-blue-700',    features:['AI chatbot & auto-replies','Google review management','Social content 3×/week','Appointment reminders','Monthly report','Email support'] },
                    { name:'Growth',  price:'£99', tagline:'Full workflow automation for businesses ready to scale.',        badge:'Most popular', bc:'bg-emerald-100 text-emerald-700',features:['Everything in Starter','AI booking & scheduling','Follow-up sequences','CRM integration','Weekly analytics','Priority support'] },
                    { name:'Pro',     price:'£199',tagline:'Custom integrations and full-stack automation.',                badge:'Full power',   bc:'bg-purple-100 text-purple-700', features:['Everything in Growth','Custom API integrations','Real-time analytics','Dedicated account manager','Slack & phone support','Daily report'] },
                  ].map(plan => {
                    const isRec = plan.name === recommended;
                    return (
                      <div key={plan.name} className={`bg-white rounded-3xl border p-7 flex flex-col transition-all duration-200 hover:-translate-y-1 ${isRec ? 'plan-glow border-emerald-400' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${plan.bc}`}>{plan.badge}</span>
                        </div>
                        {isRec && <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mb-3"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Recommended for your level</div>}
                        <div className="mb-4"><span className="text-4xl font-extrabold text-gray-900">{plan.price}</span><span className="text-gray-400 text-sm">/mo</span></div>
                        <p className="text-gray-500 text-sm mb-5 leading-relaxed">{plan.tagline}</p>
                        <ul className="space-y-2.5 flex-1 mb-6">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-2 text-sm text-gray-700"><Check />{f}</li>
                          ))}
                        </ul>
                        <button onClick={()=>openSetup(null)}
                          className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${isRec ? 'bg-green-500 hover:bg-green-400 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                          Get started with {plan.name}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Comparison table */}
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-base">Full feature comparison</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                          <th className="text-left px-6 py-3 font-semibold text-gray-500 w-56">Feature</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Starter</th>
                          <th className="text-center px-4 py-3 font-bold text-emerald-700 bg-emerald-50/50">Growth</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Pro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PLAN_ROWS.map((r, i) => (
                          <tr key={r.name} className={`border-b border-gray-50 ${i%2===0?'':'bg-gray-50/30'}`}>
                            <td className="px-6 py-3 text-gray-700 font-medium text-sm">{r.name}</td>
                            {[r.s, r.g, r.p].map((v, j) => (
                              <td key={j} className={`text-center px-4 py-3 ${j===1?'bg-emerald-50/30':''}`}>
                                {v===true ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M20 6 9 17l-5-5"/></svg></span>
                                 : v===false ? <Dash />
                                 : <span className="text-xs text-gray-600 font-medium">{v}</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-5">All prices ex. VAT · Cancel anytime with 30 days' notice · Setup included</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {showSetup && <SetupPlanModal onClose={closeSetup} initialIndustry={setupIndustry} />}
      {showLocationPicker && (
        <LocationPickerModal
          onSelect={(city) => { setLocation(city); setShowLocationPicker(false); }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </>
  );
}
