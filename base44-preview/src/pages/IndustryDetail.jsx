import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SetupPlanModal from '@/components/SetupPlanModal';
import E3D from '@/components/E3D';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DATA                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

const SLUG_ORDER = [
  'local-bakery','auto-repair','hair-salon','plumber','pet-groomer','florist',
  'dry-cleaner','dentist','landscaper','tailor','bookstore','electrician',
  'yoga-studio','locksmith','caterer','photographer',
];

const CATEGORIES = {
  'local-bakery':  'Food & Beverage',
  'auto-repair':   'Home & Trades',
  'hair-salon':    'Wellness & Beauty',
  'plumber':       'Home & Trades',
  'pet-groomer':   'Wellness & Beauty',
  'florist':       'Food & Beverage',
  'dry-cleaner':   'Retail & Creative',
  'dentist':       'Wellness & Beauty',
  'landscaper':    'Home & Trades',
  'tailor':        'Retail & Creative',
  'bookstore':     'Retail & Creative',
  'electrician':   'Home & Trades',
  'yoga-studio':   'Wellness & Beauty',
  'locksmith':     'Home & Trades',
  'caterer':       'Food & Beverage',
  'photographer':  'Retail & Creative',
};

const EMOJIS = {
  'local-bakery':'🥐','auto-repair':'🔧','hair-salon':'✂️','plumber':'🪠',
  'pet-groomer':'🐾','florist':'🌸','dry-cleaner':'👔','dentist':'🦷',
  'landscaper':'🌿','tailor':'🧵','bookstore':'📚','electrician':'⚡',
  'yoga-studio':'🧘','locksmith':'🔑','caterer':'🍽️','photographer':'📷',
};

const industries = {
  'local-bakery': {
    name: 'Local Bakery', tagline: 'From dough to data — bake smarter, not harder.',
    description: 'Artisan bakeries thrive on consistency, timing, and loyal regulars. AI handles the repetitive admin so you can stay behind the oven.',
    automation: 72,
    uses: [
      { icon: '📦', title: 'Inventory & Waste Reduction', body: 'AI predicts daily demand by analysing past sales, weather, and local events — so you bake exactly what you\'ll sell and throw nothing away.' },
      { icon: '💬', title: 'Customer Loyalty Chatbot', body: 'An AI assistant answers hours, takes custom cake orders, and follows up on special occasions — 24/7 without lifting a finger.' },
      { icon: '📣', title: 'Social Media Content', body: 'AI generates mouth-watering captions, hashtag sets, and posting schedules from a single photo of your latest batch.' },
      { icon: '⭐', title: 'Review Management', body: 'AI monitors Google and Yelp reviews, drafts personalised thank-you replies, and flags negative feedback for you to handle quickly.' },
    ],
    stats: [{ label: 'Less food waste', value: '30%' }, { label: 'Time saved weekly', value: '8 hrs' }, { label: 'More repeat customers', value: '2×' }],
  },
  'auto-repair': {
    name: 'Auto Repair', tagline: 'Keep every bay full and every customer informed.',
    description: 'Auto shops live and die by scheduling and trust. AI keeps your bays full, communicates repair status automatically, and wins you five-star reviews.',
    automation: 65,
    uses: [
      { icon: '🗓️', title: 'Smart Appointment Booking', body: 'AI fills gaps in your schedule automatically, sends reminders, and reduces no-shows by up to 40%.' },
      { icon: '🔧', title: 'Repair Estimate Assistant', body: 'Customers describe the problem in plain language; AI translates it into a preliminary estimate and books the right technician.' },
      { icon: '📱', title: 'Automated Status Updates', body: 'AI texts customers when their car is in, midway through, and ready — zero phone tag, zero chasing.' },
      { icon: '📊', title: 'Parts & Labour Analytics', body: 'AI spots which services are most profitable, which parts are always running out, and when your slowest days are.' },
    ],
    stats: [{ label: 'Fewer no-shows', value: '40%' }, { label: 'Hours saved on calls/week', value: '6 hrs' }, { label: 'Review score lift', value: '+0.4★' }],
  },
  'hair-salon': {
    name: 'Hair Salon', tagline: 'Fill your chair, delight every client.',
    description: 'Salons run on relationships and timing. AI handles the booking hustle and client follow-ups so your stylists can focus entirely on the chair.',
    automation: 81,
    uses: [
      { icon: '📅', title: '24/7 Online Booking', body: 'AI books, reschedules, and cancels appointments around the clock — capturing clients who browse at midnight.' },
      { icon: '💇', title: 'Personalised Style Suggestions', body: 'Before each visit, AI asks clients about their mood and lifestyle, then briefs your stylist so the consultation is already half done.' },
      { icon: '🎁', title: 'Rebooking & Retention', body: 'AI automatically messages clients 4–6 weeks after their visit with a personalised rebooking nudge and a loyalty perk.' },
      { icon: '📸', title: 'Instagram Content Pipeline', body: 'AI turns your before/after photos into ready-to-post reels, captions, and stories — keeping your feed alive between clients.' },
    ],
    stats: [{ label: 'Reduction in empty slots', value: '35%' }, { label: 'Client retention lift', value: '28%' }, { label: 'Admin hours saved/week', value: '5 hrs' }],
  },
  'plumber': {
    name: 'Plumber', tagline: 'More jobs, less paperwork, zero missed calls.',
    description: 'Every missed call is a lost job. AI answers for you, qualifies the lead, books the slot, and follows up — so you can focus on the pipe in front of you.',
    automation: 58,
    uses: [
      { icon: '📞', title: 'AI Call & Message Handling', body: 'An AI assistant answers calls and texts 24/7, qualifies emergencies, and books non-urgent jobs into your calendar automatically.' },
      { icon: '📋', title: 'Instant Quote Generation', body: 'Customers describe the job; AI generates a ballpark quote and collects photos — so you arrive prepared and close the job on the spot.' },
      { icon: '🗺️', title: 'Route & Schedule Optimisation', body: 'AI clusters nearby jobs together and plans your day to minimise drive time, fitting in more jobs per day.' },
      { icon: '🧾', title: 'Automated Invoicing', body: 'Job done? AI generates and sends the invoice automatically, then follows up politely if payment is overdue.' },
    ],
    stats: [{ label: 'More jobs per week', value: '+3–5' }, { label: 'Missed calls converted', value: '90%' }, { label: 'Faster invoice payment', value: '2×' }],
  },
  'pet-groomer': {
    name: 'Pet Groomer', tagline: 'Happy pets, happy owners, a full book.',
    description: 'Pet owners are fiercely loyal when they trust you with their animals. AI keeps communication warm and personal while handling all the scheduling.',
    automation: 76,
    uses: [
      { icon: '🐾', title: 'Pet Profile Memory', body: 'AI stores each pet\'s breed, coat type, temperament, and special needs — so every groomer is briefed perfectly before the appointment.' },
      { icon: '📅', title: 'Smart Rebooking', body: 'AI tracks each dog\'s grooming schedule and auto-messages owners at exactly the right interval to rebook — before they forget.' },
      { icon: '📷', title: 'After-Groom Photo Delivery', body: 'AI automatically sends owners a cute after-photo with a personalised message, generating organic social shares for your salon.' },
      { icon: '🛍️', title: 'Product Upsell Suggestions', body: 'Based on each pet\'s coat condition, AI suggests the right shampoo or treatment add-on at booking — increasing average ticket size.' },
    ],
    stats: [{ label: 'Rebooking rate lift', value: '+45%' }, { label: 'Average ticket increase', value: '22%' }, { label: 'Owner satisfaction', value: '4.9★' }],
  },
  'florist': {
    name: 'Florist', tagline: 'Sell beauty — let AI handle the rest.',
    description: 'Florists are creatives, not marketers. AI drives footfall, manages seasonal demand, and reminds customers about the moments that matter.',
    automation: 69,
    uses: [
      { icon: '🌹', title: 'Occasion & Anniversary Reminders', body: 'AI remembers every customer\'s key dates — birthdays, anniversaries, Valentine\'s — and sends a timely nudge to order flowers.' },
      { icon: '🌿', title: 'Seasonal Demand Forecasting', body: 'AI predicts stems and supplies needed for peak seasons like Mother\'s Day and Christmas — so you\'re never over or under-stocked.' },
      { icon: '🎨', title: 'Custom Arrangement Chatbot', body: 'Customers describe the vibe, occasion, and budget; AI translates that into a clear brief for your team and confirms the order.' },
      { icon: '📦', title: 'Same-Day Delivery Coordination', body: 'AI optimises delivery routes in real time and sends tracking updates to recipients — making your service feel premium.' },
    ],
    stats: [{ label: 'Repeat purchase lift', value: '+38%' }, { label: 'Waste reduction', value: '25%' }, { label: 'Orders from reminders', value: '1 in 3' }],
  },
  'dry-cleaner': {
    name: 'Dry Cleaner', tagline: 'Ready when promised — every time.',
    description: 'Dry cleaners compete on reliability and convenience. AI automates customer communication, pickup coordination, and repeat business effortlessly.',
    automation: 74,
    uses: [
      { icon: '🧺', title: 'Order Status Notifications', body: 'AI automatically texts customers when their items are received, cleaned, and ready — eliminating "is it ready yet?" calls entirely.' },
      { icon: '🚐', title: 'Pickup & Delivery Scheduling', body: 'AI manages a pickup/drop-off service, optimising routes and sending ETA updates so customers never have to wonder.' },
      { icon: '🔁', title: 'Subscription Nudges', body: 'AI identifies high-frequency customers and offers them a monthly subscription plan — locking in predictable revenue.' },
      { icon: '⚠️', title: 'Damage Alert System', body: 'Staff flag delicate items; AI immediately notifies the customer with care instructions and an acknowledgment — building trust before problems arise.' },
    ],
    stats: [{ label: 'Customer service calls', value: '−60%' }, { label: 'Subscription conversion', value: '18%' }, { label: 'On-time satisfaction', value: '97%' }],
  },
  'dentist': {
    name: 'Dentist', tagline: 'Healthier smiles, a fuller schedule.',
    description: 'Dental practices lose thousands monthly to no-shows and lapsed patients. AI fills gaps, recalls patients at the right time, and handles front-desk work automatically.',
    automation: 83,
    uses: [
      { icon: '🦷', title: 'Intelligent Recall System', body: 'AI tracks every patient\'s last visit and treatment plan, then sends personalised reminders at the medically appropriate interval.' },
      { icon: '📋', title: 'Pre-Appointment Intake', body: 'AI collects medical history updates, insurance details, and chief complaints before the appointment, saving 10+ minutes of chair time per patient.' },
      { icon: '📉', title: 'No-Show Reduction', body: 'AI sends a sequence of reminders (text, email, voice) and allows patients to confirm or reschedule instantly — reducing no-shows by up to 50%.' },
      { icon: '💳', title: 'Treatment Plan Follow-Up', body: 'When a patient declines a treatment, AI follows up 30 and 60 days later with educational content and a rebooking offer.' },
    ],
    stats: [{ label: 'Fewer no-shows', value: '50%' }, { label: 'Lapsed patients/mo reactivated', value: '12–20' }, { label: 'Front-desk time saved/day', value: '2 hrs' }],
  },
  'landscaper': {
    name: 'Landscaper', tagline: 'More yards, less windshield time.',
    description: 'Landscapers waste hours on driving, estimating, and chasing payments. AI tightens your route, speeds up quoting, and keeps clients on recurring schedules.',
    automation: 62,
    uses: [
      { icon: '🌱', title: 'AI-Powered Quoting', body: 'Customers submit photos; AI analyses yard size and complexity, generates a price range, and schedules a site visit automatically.' },
      { icon: '🗺️', title: 'Route Optimisation', body: 'AI groups jobs by neighbourhood and sequences your day to cut drive time by 30%, letting you fit in one or two extra jobs each week.' },
      { icon: '🔄', title: 'Seasonal Service Reminders', body: 'AI automatically upsells aeration in spring, leaf clearing in autumn, and holiday lighting installs — right when customers start thinking about it.' },
      { icon: '📸', title: 'Before & After Portfolio', body: 'AI compiles your job photos into a polished portfolio and generates targeted ads for similar neighbourhoods — filling your pipeline with lookalike leads.' },
    ],
    stats: [{ label: 'Drive time reduction', value: '30%' }, { label: 'Recurring clients increase', value: '40%' }, { label: 'Quote-to-close time', value: '−70%' }],
  },
  'tailor': {
    name: 'Tailor', tagline: 'The perfect fit — for your business too.',
    description: 'Tailoring is personal and high-trust. AI helps you manage complex order timelines, communicate proactively, and market your craft to the right audience.',
    automation: 67,
    uses: [
      { icon: '📐', title: 'Order & Timeline Tracker', body: 'AI manages each garment\'s production stages and automatically messages customers with progress updates and collection reminders.' },
      { icon: '👔', title: 'Style Consultation Assistant', body: 'Customers answer a few questions; AI generates a mood board brief so every consultation starts productively.' },
      { icon: '📣', title: 'Targeted Local Marketing', body: 'AI identifies local wedding, graduation, and event seasons and runs geo-targeted ads timed to when people are actively searching for formal attire.' },
      { icon: '🔄', title: 'Alteration Upsell Sequences', body: 'After completing a garment, AI follows up with care tips and nudges the customer to bring in other items for alterations.' },
    ],
    stats: [{ label: 'Communication time saved', value: '−50%' }, { label: 'Upsell conversion', value: '25%' }, { label: 'On-time delivery rate', value: '99%' }],
  },
  'bookstore': {
    name: 'Bookstore', tagline: 'Every reader finds their next favourite — automatically.',
    description: 'Independent bookstores compete on curation and community. AI supercharges your recommendations engine and keeps regulars coming back with personalised discovery.',
    automation: 71,
    uses: [
      { icon: '📚', title: 'Personalised Recommendations', body: 'AI learns each customer\'s reading history and generates tailored "You\'d love this" picks — by email, SMS, or at the till.' },
      { icon: '🎉', title: 'Event & Author Night Promotion', body: 'AI drafts event copy, manages RSVPs, sends reminders, and follows up with attendees to sell signed copies afterwards.' },
      { icon: '🔍', title: 'Inventory Intelligence', body: 'AI tracks which genres fly off the shelves vs. gather dust, and suggests reorder quantities — reducing dead stock by a third.' },
      { icon: '🤝', title: 'Community Newsletter', body: 'AI curates a weekly newsletter with staff picks, local events, and new arrivals — written in your store\'s voice, ready to send in minutes.' },
    ],
    stats: [{ label: 'Average basket size', value: '+30%' }, { label: 'Email open rate', value: '42%' }, { label: 'Dead stock reduction', value: '35%' }],
  },
  'electrician': {
    name: 'Electrician', tagline: 'Never miss a lead — even when you\'re up a ladder.',
    description: 'Electrical work is high-stakes and highly scheduled. AI captures every enquiry, builds trust through fast communication, and keeps your pipeline full.',
    automation: 60,
    uses: [
      { icon: '⚡', title: 'Lead Capture & Qualification', body: 'AI answers enquiries instantly, collects job details, photos, and location, and pre-qualifies leads — so you only visit jobs worth quoting.' },
      { icon: '📋', title: 'Compliance Documentation', body: 'AI generates standardised job reports, certificate templates, and inspection checklists — keeping you compliant without the paperwork headache.' },
      { icon: '🔒', title: 'Safety Follow-Ups', body: 'After every job, AI sends a safety checklist and follow-up message offering annual inspection reminders — building long-term client relationships.' },
      { icon: '🌐', title: 'Local SEO Content', body: 'AI writes location-specific service pages and Google Business posts that push you to the top of "electrician near me" searches.' },
    ],
    stats: [{ label: 'Leads captured outside hours', value: '60%' }, { label: 'Quote conversion lift', value: '+35%' }, { label: 'Paperwork time saved/week', value: '4 hrs' }],
  },
  'yoga-studio': {
    name: 'Yoga Studio', tagline: 'Fill every class. Retain every member.',
    description: 'Studios live on memberships and class attendance. AI predicts churn before it happens, fills empty spots, and builds the community that keeps people coming back.',
    automation: 88,
    uses: [
      { icon: '🧘', title: 'Churn Prediction & Intervention', body: 'AI spots members whose attendance is dropping and triggers a personalised outreach — a check-in message, a free guest pass, or a new class suggestion.' },
      { icon: '📅', title: 'Class Waitlist Management', body: 'AI manages waitlists intelligently, notifies the right person when a spot opens, and fills cancellations within minutes.' },
      { icon: '🎯', title: 'New Member Onboarding', body: 'AI sends a structured 30-day welcome sequence — intro classes, tips, instructor intros — turning trial members into committed regulars.' },
      { icon: '💬', title: 'Community Engagement', body: 'AI generates weekly challenge prompts, workshop announcements, and motivational content that keeps members engaged between visits.' },
    ],
    stats: [{ label: 'Member retention lift', value: '32%' }, { label: 'Class fill rate', value: '94%' }, { label: 'Trial-to-member conversion', value: '+28%' }],
  },
  'locksmith': {
    name: 'Locksmith', tagline: 'First to respond wins the job.',
    description: 'Locksmithing is an emergency business — the fastest responder wins. AI ensures you\'re always first to reply, even at 2am, and builds trust through transparent pricing.',
    automation: 55,
    uses: [
      { icon: '🔑', title: 'Instant Emergency Response', body: 'AI answers emergency calls and messages in seconds, confirms availability, gives an ETA, and dispatches you — before the competitor even picks up.' },
      { icon: '💰', title: 'Transparent Pricing Chatbot', body: 'AI provides instant ballpark quotes based on lock type and situation — building trust and reducing sticker-shock on arrival.' },
      { icon: '📍', title: 'Real-Time Location Sharing', body: 'When dispatched, AI sends the customer your live ETA and a tracking link — a premium experience that gets five-star reviews.' },
      { icon: '🏢', title: 'Commercial Contract Pipeline', body: 'AI identifies local property managers and sends automated outreach for maintenance contracts — building a predictable B2B revenue stream.' },
    ],
    stats: [{ label: 'Response time advantage', value: '10×' }, { label: 'Emergency call conversion', value: '85%' }, { label: 'Commercial leads/mo', value: '15–25' }],
  },
  'caterer': {
    name: 'Caterer', tagline: 'Every event perfect — and profitably priced.',
    description: 'Catering is high-margin but complex. AI streamlines enquiry handling, automates proposals, and makes sure every event is staffed, sourced, and profitable.',
    automation: 70,
    uses: [
      { icon: '🍽️', title: 'Automated Proposal Generation', body: 'Client fills in event details; AI generates a branded proposal with menu options, staffing, and pricing within minutes.' },
      { icon: '📊', title: 'Food Cost & Profitability', body: 'AI analyses ingredient costs per dish and flags which menu items are margin killers — helping you price every event to hit your target margin.' },
      { icon: '👨‍🍳', title: 'Staff Scheduling Assistant', body: 'AI matches events to available staff, sends shift confirmations, and chases non-responses — eliminating the group-chat chaos.' },
      { icon: '🌟', title: 'Post-Event Review Harvesting', body: 'AI sends a personalised thank-you to the event organiser with a review request — capturing testimonials while the meal is still fresh in memory.' },
    ],
    stats: [{ label: 'Proposal turnaround', value: '−80%' }, { label: 'Margin visibility', value: '100%' }, { label: 'Review collection rate', value: '3×' }],
  },
  'photographer': {
    name: 'Photographer', tagline: 'Spend more time behind the lens.',
    description: 'Photographers lose hours to enquiries, contracts, and culling. AI handles client communication, automates delivery, and markets your portfolio so you can stay creative.',
    automation: 73,
    uses: [
      { icon: '📸', title: 'Enquiry & Booking Automation', body: 'AI qualifies leads, checks availability, sends pricing guides, and books discovery calls — converting website visitors into paying clients while you shoot.' },
      { icon: '📝', title: 'Contract & Invoice Generation', body: 'AI creates customised contracts, sends them for e-signature, and issues invoices automatically on key milestones.' },
      { icon: '🖼️', title: 'Smart Gallery Delivery', body: 'AI curates your best shots from a batch, notifies clients when their gallery is ready, and upsells prints or albums within the delivery experience.' },
      { icon: '📣', title: 'Portfolio & Social Marketing', body: 'AI identifies your highest-engagement portfolio pieces and runs targeted ads to your ideal clients — whoever matches your niche.' },
    ],
    stats: [{ label: 'Admin time saved/week', value: '7 hrs' }, { label: 'Lead response time', value: '< 2 min' }, { label: 'Print/album upsell rate', value: '+40%' }],
  },
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TINY ICON HELPERS                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

const ChevL = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const ChevR = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const CheckIc = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SIDEBAR SUB-COMPONENTS                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const SbLabel = ({ text }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.09em',
    padding: '14px 20px 6px',
  }}>
    {text}
  </div>
);

const SbDivider = () => (
  <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function IndustryDetail() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const industry    = industries[slug];
  const category    = CATEGORIES[slug] || '';
  const emoji       = EMOJIS[slug] || '🏪';

  const [showSetup, setShowSetup]         = useState(false);
  const [openUses, setOpenUses]           = useState({ 0: true });
  const [activeSection, setActiveSection] = useState('hero');

  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const usesRef = useRef(null);
  const ctaRef  = useRef(null);

  const currentIndex = SLUG_ORDER.indexOf(slug);
  const prevSlug = currentIndex > 0 ? SLUG_ORDER[currentIndex - 1] : null;
  const nextSlug = currentIndex < SLUG_ORDER.length - 1 ? SLUG_ORDER[currentIndex + 1] : null;

  /* reset accordion when slug changes */
  useEffect(() => { setOpenUses({ 0: true }); setActiveSection('hero'); }, [slug]);

  /* scroll spy — root = main scrollable div */
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { root, threshold: 0.35 }
    );
    [heroRef, usesRef, ctaRef].forEach(r => r.current && observer.observe(r.current));
    return () => observer.disconnect();
  }, [slug]);

  /* keyboard navigation */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft'  && prevSlug) navigate(`/industry/${prevSlug}`);
      if (e.key === 'ArrowRight' && nextSlug) navigate(`/industry/${nextSlug}`);
      if (e.key === 'Escape') { if (showSetup) setShowSetup(false); else navigate('/app'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevSlug, nextSlug, showSetup]);

  /* scroll to section helper */
  const scrollTo = (ref, id) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  /* ── 3-D button hover helpers ─────────────────────────────────────────── */
  const btn3dEnter  = e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 0 #047857, 0 8px 20px rgba(16,185,129,.4)'; };
  const btn3dLeave  = e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 0 #047857, 0 6px 16px rgba(16,185,129,.35)'; };
  const btn3dDown   = e => { e.currentTarget.style.transform = 'translateY(3px)';  e.currentTarget.style.boxShadow = '0 1px 0 #047857, 0 2px 6px rgba(16,185,129,.3)'; };
  const btn3dUp     = e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 0 #047857, 0 8px 20px rgba(16,185,129,.4)'; };

  /* ── not found ────────────────────────────────────────────────────────── */
  if (!industry) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}><E3D emoji="🏪" size={48} anim="bounce" /></div>
          <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 20 }}>Industry not found.</p>
          <button onClick={() => navigate('/app')}
            style={{ background: 'linear-gradient(180deg,#34d399,#10b981)', color: 'white', fontWeight: 700, fontSize: 14, padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 0 #047857' }}>
            ← Back to LocAI
          </button>
        </div>
      </div>
    );
  }

  /* ── automation bar width (clamped 40–95) ─────────────────────────────── */
  const autoW = `${Math.min(95, Math.max(40, industry.automation))}%`;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>

      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow   { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.0)} 50%{box-shadow:0 0 0 6px rgba(16,185,129,.12)} }
        .id-fade-in  { animation: fadeSlideIn .45s cubic-bezier(.4,0,.2,1) both; }
        .id-use-card { transition: box-shadow .2s, transform .2s, border-color .2s; }
        .id-use-card:hover { transform: translateY(-2px); }
        .id-nav-pill { transition: background .15s, color .15s, box-shadow .15s, transform .15s; }
        .id-sb-row   { transition: background .15s; }
        .id-sb-row:hover { background: #f9fafb !important; }
        .id-sb-row.active:hover { background: #f0fdf4 !important; }
      `}</style>

      {/* ── FIXED 3D NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 60,
        background: 'linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(248,250,252,.96) 100%)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.6)',
        boxShadow: '0 1px 0 rgba(255,255,255,.9) inset, 0 6px 28px rgba(0,0,0,.11), 0 2px 6px rgba(0,0,0,.07)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
      }}>

        {/* Logo tile */}
        <button onClick={() => navigate('/app')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(145deg,#34d399,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 0 #047857, 0 4px 10px rgba(16,185,129,.4)',
          }}>
            <img src="/locai-logo.svg" style={{ width: 20, height: 20, filter: 'brightness(10)' }} alt="LocAI" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#111', letterSpacing: '-0.3px' }}>LocAI</span>
        </button>

        {/* Breadcrumb separator */}
        <span style={{ color: '#d1d5db', fontSize: 18, lineHeight: 1, userSelect: 'none' }}>›</span>

        {/* Industry name + category pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111', letterSpacing: '-0.2px' }}>{industry.name}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#059669',
            background: '#f0fdf4', border: '1px solid #d1fae5',
            borderRadius: 100, padding: '2px 7px',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>{category}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Recessed prev/next strip */}
        <div style={{
          background: 'rgba(0,0,0,.04)', borderRadius: 14, padding: 3,
          display: 'flex', alignItems: 'center', gap: 2,
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,.08), inset 0 0 0 1px rgba(0,0,0,.05)',
        }}>
          <button
            disabled={!prevSlug}
            onClick={() => prevSlug && navigate(`/industry/${prevSlug}`)}
            className="id-nav-pill"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 11, border: 'none', cursor: prevSlug ? 'pointer' : 'not-allowed',
              opacity: prevSlug ? 1 : 0.3, fontSize: 12, fontWeight: 500, color: '#374151',
              background: prevSlug ? 'white' : 'transparent',
              boxShadow: prevSlug ? '0 2px 8px rgba(0,0,0,.12), 0 1px 0 rgba(255,255,255,.9) inset, 0 -1px 0 rgba(0,0,0,.06) inset' : 'none',
              transform: prevSlug ? 'translateY(-1px)' : 'none',
              whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden',
            }}
          >
            <ChevL />
            <span className="hidden sm:inline" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prevSlug ? industries[prevSlug]?.name : 'Prev'}
            </span>
          </button>
          <span style={{ fontSize: 10, color: '#9ca3af', padding: '0 5px', whiteSpace: 'nowrap' }}>
            {currentIndex + 1}/{SLUG_ORDER.length}
          </span>
          <button
            disabled={!nextSlug}
            onClick={() => nextSlug && navigate(`/industry/${nextSlug}`)}
            className="id-nav-pill"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 11, border: 'none', cursor: nextSlug ? 'pointer' : 'not-allowed',
              opacity: nextSlug ? 1 : 0.3, fontSize: 12, fontWeight: 500, color: '#374151',
              background: nextSlug ? 'white' : 'transparent',
              boxShadow: nextSlug ? '0 2px 8px rgba(0,0,0,.12), 0 1px 0 rgba(255,255,255,.9) inset, 0 -1px 0 rgba(0,0,0,.06) inset' : 'none',
              transform: nextSlug ? 'translateY(-1px)' : 'none',
              whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nextSlug ? industries[nextSlug]?.name : 'Next'}
            </span>
            <ChevR />
          </button>
        </div>

        {/* 3D CTA */}
        <button onClick={() => setShowSetup(true)}
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg,#34d399 0%,#10b981 100%)',
            color: 'white', fontWeight: 700, fontSize: 13,
            padding: '8px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 0 #047857, 0 6px 16px rgba(16,185,129,.35)',
            transition: 'all .12s ease',
          }}
          onMouseEnter={btn3dEnter} onMouseLeave={btn3dLeave}
          onMouseDown={btn3dDown}   onMouseUp={btn3dUp}
        >
          Get Started →
        </button>
      </nav>

      {/* ── TWO-COLUMN SHELL ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', marginTop: 60, overflow: 'hidden' }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <aside style={{
          width: 272, flexShrink: 0,
          background: 'white', borderRight: '1px solid #e5e7eb',
          overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}>

          {/* Industry summary card */}
          <div style={{
            padding: '20px 20px 18px',
            background: 'linear-gradient(135deg,#f8fffe 0%,#f0fdf4 60%,#ecfdf5 100%)',
            borderBottom: '1px solid #f3f4f6',
          }}>
            {/* Emoji icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 16, marginBottom: 12,
              background: 'linear-gradient(145deg,#f0fdf4,#dcfce7)',
              border: '1px solid #d1fae5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16,185,129,.12)',
            }}>
              <E3D emoji={emoji} size={28} anim="bounce" />
            </div>
            {/* Category pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', marginBottom: 8,
              background: '#f0fdf4', border: '1px solid #d1fae5',
              borderRadius: 100, fontSize: 9, fontWeight: 700,
              color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {category}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 5 }}>
              {industry.name}
            </h2>
            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55 }}>{industry.tagline}</p>
          </div>

          {/* Automation score */}
          <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>Automation potential</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>{industry.automation}%</span>
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: autoW,
                background: 'linear-gradient(90deg,#34d399,#10b981)',
                borderRadius: 4,
              }} />
            </div>
          </div>

          {/* Key results */}
          <SbLabel text="Key results" />
          <div style={{ padding: '0 20px 14px' }}>
            {industry.stats.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: '7px 0',
                borderBottom: i < industry.stats.length - 1 ? '1px solid #f9fafb' : 'none',
              }}>
                <span style={{ fontSize: 11, color: '#64748b', flex: 1, lineHeight: 1.4, paddingRight: 8 }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#059669', letterSpacing: '-0.3px', flexShrink: 0 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <SbDivider />

          {/* Section nav */}
          <SbLabel text="On this page" />
          <div style={{ padding: '2px 14px 8px' }}>
            {[
              { id: 'hero', label: 'Overview', ref: heroRef },
              { id: 'uses', label: 'AI Use Cases', ref: usesRef },
              { id: 'cta',  label: 'Get Started', ref: ctaRef  },
            ].map(s => {
              const isActive = activeSection === s.id;
              return (
                <button key={s.id}
                  onClick={() => scrollTo(s.ref, s.id)}
                  className={`id-sb-row${isActive ? ' active' : ''}`}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 10px', borderRadius: 10, border: 'none',
                    background: isActive ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                  }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? '#10b981' : '#d1d5db',
                    transition: 'background .15s',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? '#065f46' : '#6b7280' }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          <SbDivider />

          {/* All industries list */}
          <SbLabel text="All industries" />
          <div style={{ padding: '2px 14px 20px' }}>
            {SLUG_ORDER.map(s => {
              const ind = industries[s];
              const isActive = s === slug;
              return (
                <button key={s}
                  onClick={() => navigate(`/industry/${s}`)}
                  className={`id-sb-row${isActive ? ' active' : ''}`}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', borderRadius: 10, border: 'none',
                    background: isActive ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                    borderLeft: `2px solid ${isActive ? '#10b981' : 'transparent'}`,
                  }}>
                  <E3D emoji={EMOJIS[s]} size={15} interactive={false} style={{flexShrink:0}} />
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? '#065f46' : '#374151', flex: 1 }}>
                    {ind?.name}
                  </span>
                  {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

          {/* HERO — white panel, dot grid, stat chips */}
          <div id="hero" ref={heroRef}
            style={{
              background: 'white', position: 'relative', overflow: 'hidden',
              padding: '44px 48px 36px', borderBottom: '1px solid #f3f4f6',
            }}>
            {/* dot grid */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle,#e5e7eb 1px,transparent 1px)',
              backgroundSize: '24px 24px', opacity: .55, pointerEvents: 'none',
            }} />
            {/* ambient glow top-right */}
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 240, height: 240,
              background: 'radial-gradient(circle,rgba(52,211,153,.14) 0%,transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', maxWidth: 680 }} className="id-fade-in">
              {/* Eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {category}
                </span>
                <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(16,185,129,.2),transparent)', marginLeft: 4 }} />
              </div>

              {/* Heading */}
              <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 12 }}>
                {industry.name}
              </h1>
              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>
                {industry.description}
              </p>

              {/* Stat chips + CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* 3D CTA */}
                <button onClick={() => setShowSetup(true)}
                  style={{
                    background: 'linear-gradient(180deg,#34d399 0%,#10b981 100%)',
                    color: 'white', fontWeight: 700, fontSize: 14,
                    padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 0 #047857, 0 6px 16px rgba(16,185,129,.35)',
                    transition: 'all .12s ease', flexShrink: 0,
                  }}
                  onMouseEnter={btn3dEnter} onMouseLeave={btn3dLeave}
                  onMouseDown={btn3dDown}   onMouseUp={btn3dUp}
                >
                  Get my free setup →
                </button>

                {/* Stat chips */}
                {industry.stats.map((s, i) => (
                  <div key={i} style={{
                    background: '#f0fdf4', border: '1px solid #d1fae5',
                    borderRadius: 12, padding: '8px 14px', textAlign: 'center', flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#065f46', letterSpacing: '-0.4px', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: '#6b7280', marginTop: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* USE CASES */}
          <div id="uses" ref={usesRef} style={{ maxWidth: 820, margin: '0 auto', padding: '40px 40px 8px' }}>

            {/* Section header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                Automation playbook
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  How AI works for your {industry.name.toLowerCase()}
                </h2>
                <button
                  onClick={() => {
                    const allOpen = industry.uses.every((_, i) => openUses[i]);
                    setOpenUses(allOpen ? {} : Object.fromEntries(industry.uses.map((_, i) => [i, true])));
                  }}
                  style={{
                    flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#059669',
                    background: '#f0fdf4', border: '1px solid #d1fae5',
                    borderRadius: 10, padding: '5px 12px', cursor: 'pointer', transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                >
                  {industry.uses.every((_, i) => openUses[i]) ? 'Collapse all ↑' : 'Expand all ↓'}
                </button>
              </div>
            </div>

            {/* 2-column card grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {industry.uses.map((use, i) => {
                const isOpen = !!openUses[i];
                return (
                  <div
                    key={use.title}
                    className="id-use-card"
                    onClick={() => setOpenUses(prev => ({ ...prev, [i]: !prev[i] }))}
                    style={{
                      background: 'white',
                      border: `1px solid ${isOpen ? '#6ee7b7' : '#e5e7eb'}`,
                      borderRadius: 20,
                      padding: '18px 20px',
                      cursor: 'pointer',
                      boxShadow: isOpen
                        ? '0 8px 28px rgba(16,185,129,.14), 0 2px 8px rgba(0,0,0,.05)'
                        : '0 1px 4px rgba(0,0,0,.05)',
                      transform: isOpen ? 'translateY(-2px)' : '',
                    }}
                  >
                    {/* Card header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                        background: isOpen
                          ? 'linear-gradient(145deg,#34d399,#10b981)'
                          : 'linear-gradient(145deg,#f0fdf4,#dcfce7)',
                        border: `1px solid ${isOpen ? 'transparent' : '#d1fae5'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isOpen ? '0 3px 0 #047857, 0 4px 12px rgba(16,185,129,.3)' : '0 1px 4px rgba(0,0,0,.05)',
                        transition: 'all .2s',
                      }}>
                        <E3D emoji={use.icon} size={20} delay={i * 90} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                          Step {i + 1}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isOpen ? '#065f46' : '#0f172a', lineHeight: 1.3, transition: 'color .2s' }}>
                          {use.title}
                        </div>
                      </div>
                      {/* chevron */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#10b981' : '#9ca3af'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s, stroke .2s', marginTop: 2 }}>
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>

                    {/* Body — always visible but greyed when closed */}
                    <p style={{ fontSize: 12, color: isOpen ? '#475569' : '#9ca3af', lineHeight: 1.65, transition: 'color .2s', marginBottom: isOpen ? 12 : 0 }}>
                      {use.body}
                    </p>

                    {/* Chips — only when open */}
                    {isOpen && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: '#f0fdf4', border: '1px solid #d1fae5',
                          color: '#059669', fontSize: 10, fontWeight: 700,
                          padding: '3px 9px', borderRadius: 20,
                        }}>
                          <CheckIc /> AI-automated
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          background: '#f9fafb', border: '1px solid #e5e7eb',
                          color: '#6b7280', fontSize: 10, fontWeight: 500,
                          padding: '3px 9px', borderRadius: 20,
                        }}>
                          No tech skills needed
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setShowSetup(true); }}
                          style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#059669', background: 'none', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#047857'}
                          onMouseLeave={e => e.currentTarget.style.color = '#059669'}
                        >
                          Set this up →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary strip */}
            <div style={{
              background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
              border: '1px solid #d1fae5', borderRadius: 16,
              padding: '16px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              marginBottom: 40,
            }}>
              <div style={{ fontSize: 13, color: '#374151' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{industry.uses.length} AI automations</span>
                {' '}ready for your {industry.name.toLowerCase()} — set up by our team in under 48 hours.
              </div>
              <button onClick={() => setShowSetup(true)}
                style={{
                  flexShrink: 0, background: '#10b981', color: 'white',
                  fontWeight: 700, fontSize: 13, padding: '8px 18px',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
              >
                Get all {industry.uses.length} →
              </button>
            </div>
          </div>

          {/* CTA — dark green banner matching Champions */}
          <div id="cta" ref={ctaRef} style={{ padding: '0 40px 52px', maxWidth: 820, margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(135deg,#052e16,#064e3b)',
              borderRadius: 28, padding: '48px 48px',
              position: 'relative', overflow: 'hidden', textAlign: 'center',
            }}>
              {/* dot grid */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px)',
                backgroundSize: '24px 24px', pointerEvents: 'none',
              }} />
              {/* radial glow */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 480, height: 240,
                background: 'radial-gradient(ellipse,rgba(52,211,153,.18) 0%,transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative' }}>
                {/* Eyebrow badge */}
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(52,211,153,.15)', border: '1px solid rgba(52,211,153,.3)',
                  borderRadius: 100, padding: '4px 14px',
                  fontSize: 10, fontWeight: 700, color: '#6ee7b7',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: 18,
                }}>
                  Ready to automate?
                </div>

                <h2 style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 10 }}>
                  Add AI to your {industry.name.toLowerCase()}
                </h2>
                <p style={{
                  fontSize: 14, color: 'rgba(255,255,255,.6)',
                  maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.65,
                }}>
                  LocAI sets up everything for you. Most {industry.name.toLowerCase()} businesses go live in under 48 hours — no tech skills needed.
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowSetup(true)}
                    style={{
                      background: 'linear-gradient(180deg,#34d399,#10b981)',
                      color: 'white', fontWeight: 700, fontSize: 15,
                      padding: '13px 30px', borderRadius: 14, border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 0 #047857, 0 6px 20px rgba(16,185,129,.4)',
                      transition: 'all .12s',
                    }}
                    onMouseEnter={btn3dEnter} onMouseLeave={btn3dLeave}
                    onMouseDown={btn3dDown}   onMouseUp={btn3dUp}
                  >
                    Get my free setup →
                  </button>
                  <button onClick={() => navigate('/app')}
                    style={{
                      background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.85)',
                      fontWeight: 600, fontSize: 14,
                      padding: '13px 24px', borderRadius: 14,
                      border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                  >
                    Explore other industries
                  </button>
                </div>

                {/* Social proof */}
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 20 }}>
                  ← → arrow keys to browse industries · Esc to go back
                </p>
              </div>
            </div>
          </div>

        </main>
      </div>

      {showSetup && (
        <SetupPlanModal onClose={() => setShowSetup(false)} initialIndustry={slug} />
      )}
    </div>
  );
}
