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
  const { theme } = useTheme();

  useEffect(() => {
    setVis(true);
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
      <NavBar variant="transparent" />


      {/* ============================================================
          S1 — HERO: Statement Typography
          ============================================================ */}
      <section className="relative overflow-hidden bg-grain bg-mesh-gold">
        {/* Gradient background layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--bg-hero)' }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 md:pt-36 md:pb-32 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left: Headline */}
            <div
              className={`lg:col-span-7 text-center lg:text-left transition-all duration-1000 ${
                vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-8"
                style={{
                  background: 'var(--bg-badge)',
                  color: 'var(--text-badge)',
                }}
              >
                FY 2025-26 &middot; AY 2026-27 &middot; CII 376
              </div>

              <h1 className="text-display text-5xl md:text-7xl lg:text-8xl mb-8">
                NRI Tax Advisory
                <br />
                <span className="text-editorial">Done Right.</span>
              </h1>

              <p
                className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0"
                style={{ color: 'var(--text-secondary)', fontWeight: 300 }}
              >
                Expert-led, AI-assisted tax filing for Non-Resident Indians
                &mdash; because your cross-border finances deserve more than
                a generalist CA.
              </p>

              <a href="/client" className="btn-premium">
                Start Your Tax Filing &rarr;
              </a>

              <p
                className="mt-5 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Free diagnostic &middot; No obligation &middot; Results in
                minutes
              </p>
            </div>

            {/* Right: Floating stat card */}
            <div
              className={`lg:col-span-5 flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${
                vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div
                className="animate-pulse-gold rounded-2xl p-8 md:p-10 text-center"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-premium)',
                  minWidth: '260px',
                }}
              >
                <div
                  className="text-stat text-6xl md:text-7xl mb-3"
                  style={{ color: 'var(--stat-number)' }}
                >
                  &#8377;120Cr+
                </div>
                <div
                  className="text-sm font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Tax Computed
                </div>
                <div
                  className="w-12 h-px mx-auto my-4"
                  style={{ background: 'var(--accent)', opacity: 0.4 }}
                />
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  99.7% filing accuracy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          S2 — SOCIAL PROOF STRIP: Editorial, Not Generic
          ============================================================ */}
      <section
        style={{
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="divider-gold" />

        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          {/* Top row: stat + flags */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-14">
            {/* Left: Large stat */}
            <div className="text-center md:text-left">
              <div
                className="text-stat text-6xl md:text-7xl mb-2"
                style={{ color: 'var(--stat-number)' }}
              >
                2,800+
              </div>
              <p
                className="text-lg font-light"
                style={{ color: 'var(--text-secondary)' }}
              >
                NRI clients across
              </p>
            </div>

            {/* Right: Country flags flowing */}
            <div className="text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-end gap-3 mb-3">
                {COUNTRIES.map((c, i) => (
                  <span
                    key={i}
                    className="text-3xl md:text-4xl"
                    role="img"
                    aria-label={c.name}
                    title={c.name}
                  >
                    {c.flag}
                  </span>
                ))}
              </div>
              <p
                className="text-sm font-semibold tracking-wide"
                style={{ color: 'var(--accent-secondary)' }}
              >
                18+ countries &middot; 5 continents
              </p>
            </div>
          </div>

          {/* Featured quote */}
          <div className="max-w-3xl mx-auto text-center">
            <Quote
              size={28}
              style={{ color: 'var(--accent)', opacity: 0.5 }}
              className="mx-auto mb-4"
            />
            <p
              className="text-editorial text-xl md:text-2xl leading-relaxed mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              &ldquo;{TESTIMONIALS[1].quote}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">{TESTIMONIALS[1].flag}</span>
              <div>
                <span
                  className="font-semibold text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {TESTIMONIALS[1].name}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {' '}
                  &mdash; {TESTIMONIALS[1].role}, {TESTIMONIALS[1].country}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="divider-gold" />
      </section>


      {/* ============================================================
          S3 — PAIN POINTS: Editorial Stacked Layout
          ============================================================ */}
      <section style={{ background: '#0f0f0f' }}>
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          {/* Section heading — left-aligned */}
          <div className="mb-16 max-w-2xl">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={14} style={{ color: '#f87171' }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#f87171' }}
              >
                Common NRI Tax Problems
              </span>
            </div>
            <h2
              className="font-serif text-3xl md:text-5xl mb-5"
              style={{ color: '#ffffff', fontWeight: 400 }}
            >
              Why NRIs Lose Money on Indian Taxes
            </h2>
            <p
              className="text-base leading-relaxed"
              style={{ color: '#9ca3af' }}
            >
              These aren&rsquo;t hypothetical scenarios. We see every single
              one of these every week.
            </p>
          </div>

          {/* Pain points — stacked editorial rows */}
          <div className="space-y-0 mb-16">
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                className="grid md:grid-cols-12 gap-6 md:gap-8 py-8 transition-all duration-300 group"
                style={{
                  borderLeft: '3px solid #dc2626',
                  paddingLeft: '1.5rem',
                  borderBottom:
                    i < PAIN_POINTS.length - 1
                      ? '1px solid rgba(255,255,255,0.06)'
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = '#f87171';
                  e.currentTarget.style.background =
                    'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = '#dc2626';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Number */}
                <div className="md:col-span-2">
                  <span
                    className="font-serif text-4xl md:text-5xl"
                    style={{ color: 'rgba(255,255,255,0.08)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Content */}
                <div className="md:col-span-10">
                  <h3
                    className="font-serif text-xl md:text-2xl mb-3"
                    style={{ color: '#ffffff', fontWeight: 400 }}
                  >
                    {p.headline}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-3 max-w-xl"
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
              </div>
            ))}
          </div>

          {/* Resolution CTA */}
          <div className="text-center md:text-left">
            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8"
              style={{
                background: 'rgba(196,154,60,0.08)',
                border: '1px solid rgba(196,154,60,0.25)',
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
          S4 — HOW IT WORKS: Vertical Timeline
          ============================================================ */}
      <section
        id="how"
        className="bg-grain"
        style={{
          background: 'var(--bg-primary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          {/* Section heading — left-aligned */}
          <div className="mb-16 max-w-2xl">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent)' }}
            >
              Our Process
            </span>
            <h2
              className="font-serif text-3xl md:text-5xl"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              How It Works
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative stagger-premium">
            {/* Vertical gold line */}
            <div
              className="absolute left-[2.25rem] md:left-[3rem] top-0 bottom-0 w-px hidden md:block"
              style={{
                background:
                  'linear-gradient(180deg, var(--accent), rgba(196,154,60,0.1))',
              }}
            />

            {STEPS.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div
                  key={i}
                  className="animate-reveal grid grid-cols-[4.5rem_1fr] md:grid-cols-[6rem_1fr] gap-4 md:gap-8 mb-12 last:mb-0 items-start"
                >
                  {/* Step number */}
                  <div className="flex flex-col items-center">
                    <span
                      className="text-stat text-4xl md:text-5xl"
                      style={{ color: 'var(--stat-number)' }}
                    >
                      {s.n}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    className="card-premium p-6 md:p-8"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon
                        size={20}
                        style={{ color: 'var(--accent)' }}
                      />
                      <h3
                        className="font-serif text-lg md:text-xl"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: 400,
                        }}
                      >
                        {s.t}
                      </h3>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {s.d}
                    </p>
                  </div>
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
        style={{
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          {/* Section heading — left-aligned with teal label */}
          <div className="mb-16 max-w-2xl">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent-secondary)' }}
            >
              Our Services
            </span>
            <h2
              className="font-serif text-3xl md:text-5xl"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              What We Handle
            </h2>
          </div>

          {/* Asymmetric grid: 2 large on top, 4 small below */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {FEATURES.slice(0, 2).map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={i} className="card-premium p-8 md:p-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'rgba(196,154,60,0.08)',
                      border: '1px solid rgba(196,154,60,0.15)',
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

          <div className="grid md:grid-cols-4 gap-5">
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
          S6 — TESTIMONIALS: Magazine-Style
          ============================================================ */}
      <section
        style={{
          background: 'var(--bg-elevated)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="divider-gold" />

        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          {/* Section heading — centered */}
          <div className="text-center mb-16">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent)' }}
            >
              Client Stories
            </span>
            <h2
              className="font-serif text-3xl md:text-5xl"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              What Our Clients Say
            </h2>
          </div>

          {/* Featured large testimonial */}
          <div
            className="card-premium p-10 md:p-14 mb-8 text-center"
          >
            <div
              className="font-serif text-5xl md:text-6xl leading-none mb-6"
              style={{ color: 'var(--accent)', opacity: 0.3 }}
            >
              &ldquo;
            </div>
            <p
              className="text-editorial text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-3xl mx-auto mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              {TESTIMONIALS[2].quote}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'rgba(196,154,60,0.08)',
                  border: '1px solid rgba(196,154,60,0.15)',
                }}
              >
                {TESTIMONIALS[2].flag}
              </div>
              <div className="text-left">
                <div
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {TESTIMONIALS[2].name}
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {TESTIMONIALS[2].role} &mdash;{' '}
                  {TESTIMONIALS[2].country}
                </div>
              </div>
            </div>
          </div>

          {/* Two smaller testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.slice(0, 2).map((t, i) => (
              <div key={i} className="card-premium p-8">
                <div
                  className="font-serif text-3xl leading-none mb-4"
                  style={{ color: 'var(--accent)', opacity: 0.25 }}
                >
                  &ldquo;
                </div>
                <p
                  className="text-editorial text-base leading-relaxed mb-6"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.flag}</span>
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
        </div>

        <div className="divider-gold" />
      </section>


      {/* ============================================================
          S7 — PRICING: Premium Tier Dominates (3-Column)
          ============================================================ */}
      <section
        style={{
          background: 'var(--bg-primary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          {/* Section heading — centered */}
          <div className="text-center mb-16">
            <span
              className="text-xs font-bold uppercase tracking-widest mb-4 block"
              style={{ color: 'var(--accent)' }}
            >
              Engagement Options
            </span>
            <h2
              className="font-serif text-3xl md:text-5xl mb-4"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              Transparent Pricing
            </h2>
            <p
              className="max-w-md mx-auto"
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
              }}
            >
              Our fees reflect the depth of expertise applied to your
              situation. No surprises.
            </p>
          </div>

          {/* 3-column pricing */}
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING_TIERS.map((tier, i) => (
              <div
                key={i}
                className={
                  tier.featured
                    ? 'card-featured p-8 md:p-10 md:-my-4'
                    : 'card-premium p-7 md:p-8'
                }
              >
                {tier.featured && (
                  <div
                    className="inline-block px-4 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-5"
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
                    className="text-[10px] font-bold uppercase tracking-wider mb-4"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {tier.tagline}
                  </div>
                )}

                <h3
                  className="font-serif text-xl md:text-2xl mb-2"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 400,
                  }}
                >
                  {tier.name}
                </h3>

                <div
                  className="text-stat text-3xl md:text-4xl mb-6"
                  style={{
                    color: tier.featured
                      ? 'var(--stat-number)'
                      : 'var(--text-primary)',
                  }}
                >
                  {tier.price}
                </div>

                {/* Feature checklist */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, fi) => (
                    <li
                      key={fi}
                      className="flex items-start gap-3 text-sm"
                    >
                      <CheckCircle
                        size={16}
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
                  className={
                    tier.featured
                      ? 'btn-premium w-full justify-center text-center'
                      : 'btn-primary w-full text-center block'
                  }
                >
                  {tier.featured
                    ? 'Start Premium Filing \u2192'
                    : 'Get Started \u2192'}
                </a>
              </div>
            ))}
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
          S8 — FINAL CTA: Full-Bleed Gold
          ============================================================ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'var(--accent)',
        }}
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

        <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center relative z-10">
          <h2
            className="font-serif text-3xl md:text-5xl lg:text-6xl mb-5"
            style={{ color: 'var(--text-on-cta)', fontWeight: 400 }}
          >
            Sold Property in India?
            <br />
            Don&rsquo;t Overpay Tax.
          </h2>
          <p
            className="text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
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
