'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/theme-provider';
import {
  ClipboardList, Bot, FileText, CheckCircle,
  Home as HomeIcon, Globe, Shield, Building2, BarChart3, Search,
  AlertTriangle, Quote, MapPin, Users, Award,
} from 'lucide-react';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

/* ─────────────────────────────────────────────────────────────
   SHARED DATA
   ───────────────────────────────────────────────────────────── */

const STATS = [
  { value: '2,800+', label: 'NRI Clients Served' },
  { value: '18+', label: 'Countries Covered' },
  { value: '\u20B9120Cr+', label: 'Tax Computed' },
  { value: '99.7%', label: 'Filing Accuracy' },
];

const PAIN_POINTS = [
  {
    headline: 'Wrong TDS Deducted by Buyer',
    detail: 'Buyer deducted 1% TDS instead of the mandatory 20% + surcharge for NRI sellers. Now you face a shortfall notice from the department.',
    stat: '78% of NRI property sellers face this',
  },
  {
    headline: 'Filed as Resident by Mistake',
    detail: 'Your CA filed you as a Resident Indian. Now your worldwide income is taxable in India \u2014 and the notice demands explanation.',
    stat: 'Most common NRI filing error',
  },
  {
    headline: '\u20B915L+ Locked in Excess TDS',
    detail: 'Excess TDS was deducted on your property sale but no refund was filed. Your money sits with the government, earning nothing.',
    stat: 'Average excess: \u20B912\u201318 lakhs',
  },
  {
    headline: 'Missed Section 54 Deadline',
    detail: 'You sold property but didn\u2019t reinvest within the window. Now the entire long-term capital gain is taxable without exemption.',
    stat: 'Deadline: 2 years (purchase) / 3 years (construct)',
  },
];

const STEP_ICONS = [ClipboardList, Bot, FileText, CheckCircle];
const STEPS = [
  { n: '1', t: 'Describe Your Situation', d: 'Type in plain English or fill a simple form. AI extracts and organizes everything.' },
  { n: '2', t: 'AI Analyzes', d: '10 specialist modules review residency, income, capital gains, DTAA, and more.' },
  { n: '3', t: 'Get Deliverables', d: 'Download professional computation sheets, advisory memos, and engagement documents.' },
  { n: '4', t: 'File with Confidence', d: 'Expert-reviewed filing with pre-filing risk check and post-filing support.' },
];

const FEATURE_ICONS = [HomeIcon, Globe, Shield, Building2, BarChart3, Search];
const FEATURES = [
  { t: 'Property Sale Tax', d: 'Dual computation (20% indexed vs 12.5% flat), Section 54/54EC planning' },
  { t: 'Residential Status', d: 'Stay-day analysis, RNOR review, deemed resident check' },
  { t: 'DTAA / FTC', d: 'Treaty benefit analysis, foreign tax credit eligibility' },
  { t: 'Rental Income', d: 'House property computation, standard deduction, loan interest' },
  { t: 'Investments', d: 'NRO/FD interest, dividends, MF gains, ESOP/RSU' },
  { t: 'AIS Reconciliation', d: 'Mismatch detection, TDS credit verification' },
];

const COUNTRIES = [
  { name: 'United States', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { name: 'United Kingdom', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
  { name: 'UAE', flag: '\uD83C\uDDE6\uD83C\uDDEA' },
  { name: 'Singapore', flag: '\uD83C\uDDF8\uD83C\uDDEC' },
  { name: 'Canada', flag: '\uD83C\uDDE8\uD83C\uDDE6' },
  { name: 'Australia', flag: '\uD83C\uDDE6\uD83C\uDDFA' },
];

const TESTIMONIALS = [
  {
    quote: 'After years of struggling with cross-border compliance, this team brought clarity and peace of mind. Their attention to detail on my property sale was exceptional.',
    name: 'Rajesh K.',
    role: 'Software Engineer',
    country: 'Singapore',
    flag: '\uD83C\uDDF8\uD83C\uDDEC',
  },
  {
    quote: 'I had excess TDS of \u20B917 lakhs stuck for two years. They not only filed the refund but restructured my entire India portfolio to be tax-efficient going forward.',
    name: 'Priya M.',
    role: 'Investment Banker',
    country: 'London',
    flag: '\uD83C\uDDEC\uD83C\uDDE7',
  },
  {
    quote: 'My previous CA filed me as Resident and I was facing global income tax liability. They corrected my status, filed revised returns, and saved me over \u20B924 lakhs.',
    name: 'Amit S.',
    role: 'Business Owner',
    country: 'Dubai',
    flag: '\uD83C\uDDE6\uD83C\uDDEA',
  },
];

const PRICING = [
  { t: 'Basic Filing', p: '\u20B98,000\u201315,000', d: 'Simple profile, 1-2 income sources', tag: 'Green', c: 'var(--green)' },
  { t: 'Advisory Filing', p: '\u20B918,000\u201330,000', d: 'Residency review, multiple income heads', tag: 'Amber', c: 'var(--amber)' },
  { t: 'Premium', p: '\u20B935,000\u201375,000', d: 'Property sale, ESOP, dual CG, DTAA', tag: 'Popular', c: 'var(--red)', pop: true },
  { t: 'Retainer', p: '\u20B91,00,000+/yr', d: 'HNI, ongoing planning, priority', tag: 'Premium', c: 'var(--text-primary)' },
];


/* ─────────────────────────────────────────────────────────────
   HOME PAGE
   ───────────────────────────────────────────────────────────── */

export default function Home() {
  const [vis, setVis] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setVis(true);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>

      {/* ====================================================
         NAV
         ==================================================== */}
      <NavBar variant="transparent" />


      {/* ====================================================
         1. HERO  (kept from original)
         ==================================================== */}
      <section className="relative overflow-hidden">
        {isDark && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(196,154,60,0.08) 0%, transparent 70%)',
          }} />
        )}
        {!isDark && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        )}

        <div className={`max-w-4xl mx-auto px-6 pt-24 pb-20 text-center relative z-10 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-8"
            style={{
              background: 'var(--bg-badge)',
              color: 'var(--text-badge)',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
          >
            FY 2025-26 &middot; AY 2026-27 &middot; CII 376
          </div>

          <h1
            className="font-serif text-4xl md:text-6xl leading-[1.15] mb-6"
            style={{ color: 'var(--text-primary)', fontWeight: 400, transition: 'color 0.3s ease' }}
          >
            NRI Tax Filing, Advisory
            <br />
            <span style={{ color: 'var(--stat-number)' }}>&amp; Compliance &mdash; Done Right</span>
          </h1>

          <div className="w-24 h-px mx-auto mb-6" style={{ background: 'var(--accent)', opacity: 0.6 }} />

          <p
            className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontWeight: 300, transition: 'color 0.3s ease' }}
          >
            AI-assisted tax advisory for Non-Resident Indians. From residential status review to capital gains dual-option computation.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mb-6">
            <a
              href="/client"
              className="px-8 py-3.5 rounded-lg text-sm font-bold transition-all duration-300 shadow-lg hover:scale-[1.03]"
              style={{
                background: 'var(--bg-cta)',
                color: 'var(--text-on-cta)',
              }}
            >
              Start Your Tax Filing &rarr;
            </a>
            <a
              href="#how"
              className="px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(196,154,60,0.1)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; }}
            >
              How It Works
            </a>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Free diagnostic &middot; No obligation &middot; Results in minutes
          </p>
        </div>
      </section>


      {/* ====================================================
         2. STATS STRIP  (kept from original)
         ==================================================== */}
      <div
        className="py-8"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-10 text-center">
          {STATS.map((s, i) => (
            <div key={i} className="px-4 py-1">
              <div className="font-serif text-2xl md:text-3xl font-bold" style={{ color: 'var(--stat-number)', transition: 'color 0.3s ease' }}>
                {s.value}
              </div>
              <div className="text-xs mt-1 tracking-wider uppercase" style={{ color: 'var(--text-muted)', transition: 'color 0.3s ease' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* ====================================================
         3. PAIN POINTS / WHY NRIs STRUGGLE  (NEW)
         Dark background, red accent cards, emotionally compelling
         ==================================================== */}
      <section style={{ background: '#1a1a1a' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <AlertTriangle size={16} style={{ color: '#f87171' }} />
              <span className="text-sm tracking-wide font-serif" style={{ color: '#f87171' }}>
                Common NRI Tax Problems
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: '#ffffff', fontWeight: 400 }}>
              Why NRIs Lose Money on Indian Taxes
            </h2>
            <p className="max-w-lg mx-auto text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
              These aren&rsquo;t hypothetical scenarios. We see these every single week from NRIs who come to us after things went wrong.
            </p>
          </div>

          {/* Pain point cards */}
          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-6 relative transition-all duration-300"
                style={{
                  background: '#252525',
                  border: '1px solid #3a3a3a',
                  borderLeft: '4px solid #dc2626',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderLeftColor = '#f87171';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(220,38,38,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderLeftColor = '#dc2626';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 className="font-serif text-lg font-bold mb-2" style={{ color: '#ffffff' }}>
                  {p.headline}
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#9ca3af' }}>
                  {p.detail}
                </p>
                <div
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171' }}
                >
                  {p.stat}
                </div>
              </div>
            ))}
          </div>

          {/* Resolution CTA */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6" style={{ background: 'rgba(196,154,60,0.1)', border: '1px solid rgba(196,154,60,0.3)' }}>
              <CheckCircle size={18} style={{ color: '#C49A3C' }} />
              <span className="text-sm font-semibold" style={{ color: '#C49A3C' }}>
                We fix all of this. Every single case.
              </span>
            </div>
            <div>
              <a
                href="/client"
                className="inline-block px-10 py-3.5 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-[1.03] shadow-lg"
                style={{
                  background: '#C49A3C',
                  color: '#1a1a1a',
                }}
              >
                Get Your Free Diagnostic &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ====================================================
         4. HOW IT WORKS  (kept from original)
         ==================================================== */}
      <div id="how" style={{ background: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-center text-sm mb-4 tracking-wide font-serif" style={{ color: 'var(--accent)' }}>
            Our Process
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-4" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
            How It Works
          </h2>
          <div className="w-16 h-px mx-auto mb-12" style={{ background: 'var(--accent)', opacity: 0.5 }} />

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-6 text-center transition-all duration-300 group"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="mb-3 flex justify-center">{(() => { const Icon = STEP_ICONS[i]; return <Icon size={28} style={{ color: 'var(--accent)' }} />; })()}</div>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--accent)' }}>STEP {s.n}</div>
                <h3 className="font-serif font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.t}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ====================================================
         5. WHAT WE HANDLE  (kept from original, always dark)
         ==================================================== */}
      <div style={{ background: '#1a1a1a' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-center text-sm mb-4 tracking-wide font-serif" style={{ color: '#C49A3C' }}>
            Our Services
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#ffffff' }}>
            What We Handle
          </h2>
          <div className="w-16 h-px mx-auto mb-12" style={{ background: '#C49A3C', opacity: 0.5 }} />

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((s, i) => (
              <div
                key={i}
                className="rounded-lg p-6 transition-all duration-300"
                style={{
                  background: '#252525',
                  border: '1px solid #3a3a3a',
                  borderTop: '2px solid rgba(196,154,60,0.4)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#C49A3C'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#3a3a3a'}
              >
                <div className="mb-3">{(() => { const Icon = FEATURE_ICONS[i]; return <Icon size={24} style={{ color: '#C49A3C' }} />; })()}</div>
                <h3 className="font-bold text-sm mb-1" style={{ color: '#ffffff' }}>{s.t}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ====================================================
         6. CLIENT AUTHORITY / WHO WE'VE HELPED  (NEW)
         bg-secondary for visual contrast after dark section
         ==================================================== */}
      <section style={{ background: 'var(--bg-secondary)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">

          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Globe size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm tracking-wide font-serif" style={{ color: 'var(--accent)' }}>
                Global Trust
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
              Trusted by NRIs Across 18+ Countries
            </h2>
            <div className="w-16 h-px mx-auto mb-4" style={{ background: 'var(--accent)', opacity: 0.5 }} />
            <p className="max-w-lg mx-auto text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              From Silicon Valley to Singapore, professionals trust us with their most complex Indian tax situations.
            </p>
          </div>

          {/* Country flags row */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {COUNTRIES.map((c, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  minWidth: '110px',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="text-2xl" role="img" aria-label={c.name}>{c.flag}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
              </div>
            ))}
          </div>

          {/* Testimonials - 3 cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-6 flex flex-col transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote size={24} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                </div>

                {/* Quote text */}
                <p
                  className="text-sm leading-relaxed flex-1 mb-5 font-serif italic"
                  style={{ color: 'var(--text-primary)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author line */}
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  {/* Avatar placeholder with flag */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'rgba(196,154,60,0.1)', border: '1px solid rgba(196,154,60,0.2)' }}
                  >
                    {t.flag}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t.role} &mdash; {t.country}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Industry trust strip */}
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
              {['Tech Companies', 'Financial Institutions', 'Healthcare', 'Academia', 'Legal Firms', 'Startups'].map((industry, i) => (
                <span
                  key={i}
                  className="text-sm font-medium px-4 py-1.5 rounded-full"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ====================================================
         7. PRICING  (kept from original)
         ==================================================== */}
      <div style={{ background: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-center text-sm mb-4 tracking-wide font-serif" style={{ color: 'var(--accent)' }}>
            Engagement Options
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-4" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
            Transparent Pricing
          </h2>
          <p className="text-center max-w-md mx-auto mb-14" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Our fees reflect the depth of expertise applied to your situation. No surprises.</p>

          <div className="grid md:grid-cols-4 gap-5">
            {PRICING.map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-6 flex flex-col relative transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: s.pop ? '2px solid var(--accent)' : '1px solid var(--border)',
                  boxShadow: s.pop ? '0 8px 32px rgba(0,0,0,0.08)' : 'none',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={e => {
                  if (!s.pop) e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={e => {
                  if (!s.pop) e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {s.pop && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--text-on-cta)',
                      fontFamily: 'system-ui',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.c }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {s.tag}
                  </span>
                </div>

                <h3 className="font-serif font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{s.t}</h3>
                <div className="font-bold text-xl mb-2 font-serif" style={{ color: 'var(--text-primary)' }}>{s.p}</div>
                <p className="text-xs flex-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.d}</p>

                <a
                  href="/client"
                  className="btn-primary w-full text-center block py-2.5 rounded-lg text-sm font-bold mt-auto"
                >
                  Start Filing &rarr;
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/client"
              className="inline-block px-10 py-3.5 rounded-lg font-bold transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: 'var(--bg-cta)',
                color: 'var(--text-on-cta)',
              }}
            >
              Get Your Free Diagnostic &rarr;
            </a>
          </div>
        </div>
      </div>


      {/* ====================================================
         8. CTA BANNER  (kept from original, gold accent)
         ==================================================== */}
      <div style={{ background: 'var(--accent)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <h2
            className="font-serif text-2xl md:text-3xl font-bold mb-3"
            style={{ color: 'var(--text-on-cta)' }}
          >
            Sold Property in India? Don&rsquo;t Overpay Tax.
          </h2>
          <p
            className="mb-6 leading-relaxed"
            style={{ color: 'var(--text-on-cta)', opacity: 0.75 }}
          >
            Our dual-option computation saves NRI clients &#8377;1.5L+ per property transaction on average.
          </p>
          <a
            href="/client"
            className="inline-block px-8 py-3.5 rounded-lg font-bold transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            Start Now &mdash; Free to Begin
          </a>
        </div>
      </div>


      {/* ====================================================
         9. FOOTER
         ==================================================== */}
      <Footer />
    </div>
  );
}
