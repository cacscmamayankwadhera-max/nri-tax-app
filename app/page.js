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
import { useScrollReveal } from '@/app/hooks/useScrollReveal';

/* -----------------------------------------------------------------
   SHARED DATA
   ----------------------------------------------------------------- */

const STATS = [
  { value: '2,800+', label: 'NRI Clients Served' },
  { value: '18+', label: 'Countries Covered' },
  { value: '\u20B9120Cr+', label: 'Tax Computed' },
  { value: '99.7%', label: 'Filing Accuracy' },
];

const PAIN_POINTS = [
  {
    headline: 'Buyer Deducted Wrong TDS',
    detail: 'Buyer deducted 1% TDS instead of the mandatory 20% + surcharge for NRI sellers. Now you face a shortfall notice from the department.',
    stat: 'This happens in 4 out of 5 NRI property sales',
  },
  {
    headline: 'Filed as Resident — Global Tax Triggered',
    detail: 'Your CA filed you as a Resident Indian. Now your worldwide income is taxable in India \u2014 and the notice demands explanation. This turns a ₹0 India tax liability into ₹15L+ overnight.',
    stat: 'Most common NRI filing error',
  },
  {
    headline: '\u20B915L+ Stuck in Excess TDS',
    detail: 'Excess TDS was deducted on your property sale but no refund was filed. Your money sits with the government, earning nothing.',
    stat: 'Average refund recovered: \u20B914 lakhs',
  },
  {
    headline: 'Missed the Section 54 Window',
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
  { name: 'United States', code: 'us', flag: 'https://flagcdn.com/w40/us.png' },
  { name: 'United Kingdom', code: 'gb', flag: 'https://flagcdn.com/w40/gb.png' },
  { name: 'UAE', code: 'ae', flag: 'https://flagcdn.com/w40/ae.png' },
  { name: 'Singapore', code: 'sg', flag: 'https://flagcdn.com/w40/sg.png' },
  { name: 'Canada', code: 'ca', flag: 'https://flagcdn.com/w40/ca.png' },
  { name: 'Australia', code: 'au', flag: 'https://flagcdn.com/w40/au.png' },
];

const TESTIMONIALS = [
  {
    quote: 'After years of struggling with cross-border compliance, this team brought clarity and peace of mind. Their attention to detail on my property sale was exceptional.',
    name: 'Rajesh K.',
    role: 'Software Engineer',
    country: 'Singapore',
    flag: 'https://flagcdn.com/w40/sg.png',
  },
  {
    quote: 'I had excess TDS of \u20B917 lakhs stuck for two years. They not only filed the refund but restructured my entire India portfolio to be tax-efficient going forward.',
    name: 'Priya M.',
    role: 'Investment Banker',
    country: 'London',
    flag: 'https://flagcdn.com/w40/gb.png',
  },
  {
    quote: 'My previous CA filed me as Resident and I was facing global income tax liability. They corrected my status, filed revised returns, and saved me over \u20B924 lakhs.',
    name: 'Amit S.',
    role: 'Business Owner',
    country: 'Dubai',
    flag: 'https://flagcdn.com/w40/ae.png',
  },
];

/* Consolidated pricing for 3-tier display */
const PRICING_TIERS = [
  {
    name: 'Standard',
    price: '\u20B98,000 \u2013 30,000',
    tagline: 'Filing & Advisory',
    features: [
      'ITR preparation & e-filing',
      'Residential status determination',
      'Up to 3 income heads',
      'Email support',
    ],
  },
  {
    name: 'Premium',
    price: '\u20B935,000 \u2013 75,000',
    tagline: 'Most Popular',
    featured: true,
    features: [
      'Everything in Standard',
      'Property sale dual CG computation',
      'DTAA treaty benefit analysis',
      'ESOP / RSU taxation',
      'Section 54/54EC planning',
      'Dedicated advisor + priority support',
    ],
  },
  {
    name: 'Retainer',
    price: '\u20B91,00,000+ / yr',
    tagline: 'HNI & Ongoing',
    features: [
      'Everything in Premium',
      'Year-round tax planning',
      'Quarterly portfolio reviews',
      'Priority response within 4 hours',
    ],
  },
];


/* -----------------------------------------------------------------
   HOME PAGE
   ----------------------------------------------------------------- */

export default function Home() {
  const [vis, setVis] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const { theme } = useTheme();
  useScrollReveal();

  useEffect(() => {
    setVis(true);
    // Check for in-progress assessment draft
    try {
      const draft = localStorage.getItem('nri-intake-draft');
      if (draft && Object.keys(JSON.parse(draft)).length > 0) setHasDraft(true);
    } catch (e) {}
    // Check for verified client session
    try {
      const session = sessionStorage.getItem('nri-mycases-session');
      if (session) setHasSession(true);
    } catch (e) {}
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <NavBar variant="solid" />


      {/* ============================================================
          S1 — HERO: Centered with Premium Polish
          ============================================================ */}
      <section id="main-content" className="relative overflow-hidden">
        {/* Background layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(4,107,210,0.06) 0%, transparent 70%)'
              : 'var(--bg-hero)',
          }}
        />
        {/* Subtle diamond/rhombus geometric pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50Z' fill='none' stroke='%23B48A30' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }} />

        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-28 pb-20 md:pt-36 md:pb-24 relative z-10">
          <div
            className={`text-center transition-all duration-1000 ${
              vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="hero-panel mx-auto max-w-5xl p-8 md:p-12 rounded-[2rem]">
            {/* Return visitor banner */}
            {(hasDraft || hasSession) && (
              <div className="mb-6 animate-fade-in-up">
                {hasDraft && (
                  <a href="/client" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(4,107,210,0.1)', border: '1px solid rgba(4,107,210,0.3)', color: 'var(--accent)' }}>
                    &#8617; Continue your assessment
                  </a>
                )}
                {hasSession && !hasDraft && (
                  <a href="/my-cases" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(42,107,74,0.1)', border: '1px solid rgba(42,107,74,0.3)', color: 'var(--green)' }}>
                    &#8617; View your cases
                  </a>
                )}
              </div>
            )}

            {/* Badge */}
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-8"
              style={{
                background: 'var(--bg-badge)',
                color: 'var(--text-badge)',
              }}
            >
              FY 2025-26 &middot; AY 2026-27 &middot; CII 376
            </div>

            {/* Heading */}
            <h1 className="text-display font-serif text-3xl sm:text-4xl md:text-6xl mb-6 leading-tight">
              NRI Tax Filing, Advisory
              <br />
              <span className="text-gradient-gold">
                &amp; Compliance &mdash; Done Right
              </span>
            </h1>

            {/* Gold decorative line */}
            <div
              className="w-16 h-0.5 mx-auto mb-6"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
              }}
            />

            {/* Subtext */}
            <p
              className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontWeight: 300 }}
            >
              Your cross-border finances deserve more than a generalist CA.
              Expert-led, AI-powered tax advisory &mdash; from residency review
              to &nbsp;&#8377;1.5L+ savings on property transactions.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
              <a href="/client" className="btn-premium">
                Get Your Free Assessment &rarr;
              </a>
              <a href="#how" className="btn-outline">
                See How It Works
              </a>
            </div>

            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Free diagnostic &middot; No obligation &middot; Results in minutes
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse"
              style={{ background: 'rgba(160,72,72,0.08)', border: '1px solid rgba(160,72,72,0.2)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--red)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--red)' }}>
                ITR deadline: 31 July 2026 — {Math.max(0, Math.ceil((new Date('2026-07-31') - new Date()) / (1000 * 60 * 60 * 24)))} days remaining
              </span>
            </div>
          </div>
        </div>
      </div>
      </section>


      {/* ============================================================
          S2 — STATS STRIP: Clean 4-Stat Row
          ============================================================ */}
      <section
        className="reveal"
        style={{
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div
          className="h-px w-full"
          style={{ background: 'var(--border)' }}
        />

        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-14">
          <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-6 md:gap-10 reveal-stagger">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-stat text-3xl md:text-4xl mb-1"
                  style={{ color: 'var(--stat-number)' }}
                >
                  {s.value}
                </div>
                <div
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="h-px w-full"
          style={{ background: 'var(--border)' }}
        />
      </section>


      {/* ============================================================
          S3 — PAIN POINTS: Dark Section, 2x2 Card Grid
          ============================================================ */}
      <section className="reveal" style={{ background: '#0f0f0f' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-24">
          {/* Section heading — centered */}
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-5">
              <AlertTriangle size={14} style={{ color: '#f87171' }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#f87171' }}
              >
                Common NRI Tax Problems
              </span>
            </div>
            <h2
              className="font-serif text-3xl md:text-4xl mb-4"
              style={{ color: '#ffffff', fontWeight: 400 }}
            >
              Why NRIs Lose Money on Indian Taxes
            </h2>
            <p
              className="text-sm leading-relaxed max-w-lg mx-auto"
              style={{ color: '#9ca3af' }}
            >
              These aren&rsquo;t hypothetical scenarios. We see every single
              one of these every week.
            </p>
          </div>

          {/* 2x2 Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14 reveal-stagger">
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-6 md:p-7 transition-all duration-300"
                style={{
                  background: '#1a1a1a',
                  borderLeft: '3px solid #dc2626',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeftWidth: '3px',
                  borderLeftColor: '#dc2626',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = '#f87171';
                  e.currentTarget.style.background = '#1f1f1f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = '#dc2626';
                  e.currentTarget.style.background = '#1a1a1a';
                }}
              >
                <h3
                  className="font-serif text-lg md:text-xl mb-3"
                  style={{ color: '#ffffff', fontWeight: 400 }}
                >
                  {p.headline}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: '#9ca3af' }}
                >
                  {p.detail}
                </p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: 'rgba(220,38,38,0.12)',
                    color: '#f87171',
                  }}
                >
                  {p.stat}
                </span>
              </div>
            ))}
          </div>

          {/* Resolution CTA — centered */}
          <div className="text-center">
            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-6"
              style={{
                background: 'rgba(4,107,210,0.08)',
                border: '1px solid rgba(4,107,210,0.25)',
              }}
            >
              <CheckCircle size={18} style={{ color: '#C49A3C' }} />
              <span
                className="text-sm font-semibold"
                style={{ color: '#C49A3C' }}
              >
                We fix all of this. Every single case.
              </span>
            </div>
            <div>
              <a
                href="/client"
                className="btn-premium inline-flex"
                style={{ background: '#C49A3C', color: '#0f0f0f' }}
              >
                Get Your Free Diagnostic &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          S4 — HOW IT WORKS: Clean 4-Column Card Grid
          ============================================================ */}
      <section
        id="how"
        className="reveal"
        style={{
          background: 'var(--bg-primary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-24">
          {/* Section heading — centered */}
          <div className="text-center mb-14">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent)' }}
            >
              Our Process
            </span>
            <h2
              className="font-serif text-3xl md:text-4xl"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              How It Works
            </h2>
          </div>

          {/* 4-column card grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 stagger-premium reveal-stagger">
            {STEPS.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div
                  key={i}
                  className="card-premium p-6 md:p-7 animate-reveal text-center"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'rgba(4,107,210,0.08)',
                      border: '1px solid rgba(4,107,210,0.15)',
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                  <div
                    className="text-stat text-2xl mb-2"
                    style={{ color: 'var(--stat-number)' }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="font-serif text-base md:text-lg mb-2"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 400,
                    }}
                  >
                    {s.t}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {s.d}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ============================================================
          S5 — WHAT WE HANDLE: Asymmetric Feature Grid
          ============================================================ */}
      <section
        className="reveal"
        style={{
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-24">
          {/* Section heading — centered with teal label */}
          <div className="text-center mb-14">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Our Services
            </span>
            <h2
              className="font-serif text-3xl md:text-4xl"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              What We Handle
            </h2>
          </div>

          {/* Asymmetric grid: 2 large on top, 4 small below */}
          <div className="grid md:grid-cols-2 gap-5 mb-5 reveal-stagger">
            {FEATURES.slice(0, 2).map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={i} className="card-premium p-8 md:p-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'rgba(4,107,210,0.08)',
                      border: '1px solid rgba(4,107,210,0.15)',
                    }}
                  >
                    <Icon
                      size={24}
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                  <h3
                    className="font-serif text-xl md:text-2xl mb-3"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 400,
                    }}
                  >
                    {f.t}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-md"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {f.d}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 reveal-stagger">
            {FEATURES.slice(2).map((f, i) => {
              const Icon = FEATURE_ICONS[i + 2];
              return (
                <div key={i} className="card-premium p-6">
                  <Icon
                    size={20}
                    style={{ color: 'var(--accent)' }}
                    className="mb-4"
                  />
                  <h3
                    className="font-serif text-base mb-2"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 400,
                    }}
                  >
                    {f.t}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {f.d}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ============================================================
          S6 — TESTIMONIALS + AUTHORITY: Combined Clean Section
          ============================================================ */}
      <section
        className="reveal"
        style={{
          background: 'var(--bg-elevated)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="divider-diamond my-8"><span>&#9670;</span></div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-24">
          {/* Section heading — centered */}
          <div className="text-center mb-10">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent)' }}
            >
              Client Stories
            </span>
            <h2
              className="font-serif text-3xl md:text-4xl"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              Trusted by NRIs Across 18+ Countries
            </h2>
          </div>

          {/* Country flags row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12 overflow-x-auto">
            {COUNTRIES.map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="inline-flex items-center"
              >
                <img src={c.flag} alt={c.name} width={32} height={22} className="rounded-sm" />
              </span>
            ))}
            <span
              className="text-xs font-semibold tracking-wide ml-2"
              style={{ color: 'var(--text-muted)' }}
            >
              &amp; more
            </span>
          </div>

          {/* 3 testimonial cards in a clean grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 reveal-stagger">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-premium p-7">
                <Quote
                  size={20}
                  style={{ color: 'var(--accent)', opacity: 0.4 }}
                  className="mb-4"
                />
                <p
                  className="text-editorial text-sm leading-relaxed mb-6"
                  style={{ color: 'var(--text-primary)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.flag} alt={t.country} width={24} height={16} className="rounded-sm" />
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t.role} &mdash; {t.country}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Industry trust strip */}
          <div className="text-center">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Trusted by software engineers, investment bankers, business owners &amp; HNIs worldwide
            </p>
          </div>

          {/* About the Founder */}
          <div className="mt-16 max-w-2xl mx-auto text-center reveal">
            <div className="divider-diamond mb-8"><span>&#9670;</span></div>
            <h3 className="font-serif text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>Led by CA Mayank Wadhera</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Chartered Accountant, Company Secretary, Cost &amp; Management Accountant, and IBBI Registered Valuer.
              Specializing in NRI taxation since 2015, with expertise in cross-border compliance across 18+ countries.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['CA', 'CS', 'CMA', 'IBBI RV'].map((badge, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(4,107,210,0.08)', color: 'var(--accent)', border: '1px solid rgba(4,107,210,0.2)' }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="divider-diamond my-8"><span>&#9670;</span></div>
      </section>


      {/* ============================================================
          S7 — PRICING: Premium Tier Dominates (3-Column)
          ============================================================ */}
      <section
        className="reveal"
        style={{
          background: 'var(--bg-primary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-24">
          {/* Section heading — centered */}
          <div className="text-center mb-14">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent)' }}
            >
              Engagement Options
            </span>
            <h2
              className="font-serif text-3xl md:text-4xl mb-4"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              Transparent Pricing
            </h2>
            <p
              className="max-w-md mx-auto text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Our fees reflect the depth of expertise applied to your
              situation. No surprises.
            </p>
          </div>

          {/* 3-column pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 items-start reveal-stagger">
            {PRICING_TIERS.map((tier, i) => (
              <div
                key={i}
                className={
                  tier.featured
                    ? 'card-featured glow-gold p-6 md:p-7'
                    : 'card-premium p-6 md:p-7'
                }
              >
                {tier.featured && (
                  <div
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--text-on-cta)',
                    }}
                  >
                    {tier.tagline}
                  </div>
                )}
                {!tier.featured && (
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {tier.tagline}
                  </div>
                )}

                <h3
                  className="font-serif text-lg md:text-xl mb-1"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 400,
                  }}
                >
                  {tier.name}
                </h3>

                <div
                  className="font-serif text-2xl md:text-3xl font-bold mb-5"
                  style={{
                    color: tier.featured
                      ? 'var(--stat-number)'
                      : 'var(--text-primary)',
                  }}
                >
                  {tier.price}
                </div>

                {/* Feature checklist */}
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((feat, fi) => (
                    <li
                      key={fi}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <CheckCircle
                        size={15}
                        className="shrink-0 mt-0.5"
                        style={{
                          color: tier.featured
                            ? 'var(--accent)'
                            : 'var(--green)',
                        }}
                      />
                      <span
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/client"
                  className="btn-primary w-full text-center block py-3 rounded-lg text-sm font-bold"
                  style={tier.featured ? {
                    boxShadow: '0 4px 16px rgba(4,107,210,0.25)',
                  } : {}}
                >
                  {tier.featured
                    ? 'Start Premium Filing \u2192'
                    : 'Get Started \u2192'}
                </a>
              </div>
            ))}
          </div>

          {/* Feature comparison */}
          <div className="mt-12 overflow-x-auto reveal">
            <table className="w-full text-xs border-collapse" style={{ minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th className="text-left py-3 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>What's Included</th>
                  <th className="text-center py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Standard</th>
                  <th className="text-center py-3 px-2 font-bold" style={{ color: 'var(--accent)' }}>Premium</th>
                  <th className="text-center py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Retainer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['ITR preparation & e-filing', true, true, true],
                  ['Residential status determination', true, true, true],
                  ['Up to 3 income heads', true, true, true],
                  ['Property sale dual CG computation', false, true, true],
                  ['DTAA treaty benefit analysis', false, true, true],
                  ['ESOP/RSU two-stage taxation', false, true, true],
                  ['Section 54/54EC planning', false, true, true],
                  ['Branded advisory memo', false, true, true],
                  ['Dedicated advisor', false, true, true],
                  ['Year-round tax planning', false, false, true],
                  ['Quarterly portfolio reviews', false, false, true],
                  ['Priority response (4 hours)', false, false, true],
                ].map(([feature, std, prem, ret], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{feature}</td>
                    <td className="text-center py-2.5">{std ? <span style={{ color: 'var(--green)' }}>&#10003;</span> : <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>&mdash;</span>}</td>
                    <td className="text-center py-2.5 font-medium">{prem ? <span style={{ color: 'var(--accent)' }}>&#10003;</span> : <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>&mdash;</span>}</td>
                    <td className="text-center py-2.5">{ret ? <span style={{ color: 'var(--green)' }}>&#10003;</span> : <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>&mdash;</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* "Which plan" link */}
          <div className="text-center mt-10">
            <a
              href="/client"
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--accent-hover)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--accent)';
              }}
            >
              Not sure which plan is right for you? Start with a free
              diagnostic &rarr;
            </a>
          </div>
        </div>
      </section>


      {/* ============================================================
          S8 — FINAL CTA: Full-Bleed Gold Banner
          ============================================================ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--accent)' }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(0,0,0,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 text-center relative z-10">
          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl mb-5"
            style={{ color: 'var(--text-on-cta)', fontWeight: 400 }}
          >
            Sold Property in India?
            <br />
            Don&rsquo;t Overpay Tax.
          </h2>
          <p
            className="text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-on-cta)', opacity: 0.75 }}
          >
            Our dual-option computation saves NRI clients &#8377;1.5L+ per
            property transaction on average.
          </p>
          <a
            href="/client"
            className="inline-block px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          >
            Start Now &mdash; Free to Begin
          </a>
        </div>
      </section>


      {/* ============================================================
          FOOTER
          ============================================================ */}
      <Footer />
    </div>
  );
}
