'use client';
import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   SHARED DATA
   ───────────────────────────────────────────────────────────── */

const STATS = [
  { value: '2,800+', label: 'NRI Clients Served' },
  { value: '18+', label: 'Countries Covered' },
  { value: '₹120Cr+', label: 'Tax Computed' },
  { value: '99.7%', label: 'Filing Accuracy' },
];

const STEPS = [
  { n: '1', t: 'Describe Your Situation', d: 'Type in plain English or fill a simple form. AI extracts and organizes everything.', ic: '📋' },
  { n: '2', t: 'AI Analyzes', d: '10 specialist modules review residency, income, capital gains, DTAA, and more.', ic: '🤖' },
  { n: '3', t: 'Get Deliverables', d: 'Download professional computation sheets, advisory memos, and engagement documents.', ic: '📄' },
  { n: '4', t: 'File with Confidence', d: 'Expert-reviewed filing with pre-filing risk check and post-filing support.', ic: '✅' },
];

const FEATURES = [
  { t: 'Property Sale Tax', d: 'Dual computation (20% indexed vs 12.5% flat), Section 54/54EC planning', ic: '🏠' },
  { t: 'Residential Status', d: 'Stay-day analysis, RNOR review, deemed resident check', ic: '🌍' },
  { t: 'DTAA / FTC', d: 'Treaty benefit analysis, foreign tax credit eligibility', ic: '🌐' },
  { t: 'Rental Income', d: 'House property computation, standard deduction, loan interest', ic: '🏢' },
  { t: 'Investments', d: 'NRO/FD interest, dividends, MF gains, ESOP/RSU', ic: '📈' },
  { t: 'AIS Reconciliation', d: 'Mismatch detection, TDS credit verification', ic: '🔍' },
];

const PRICING = [
  { t: 'Basic Filing', p: '₹8,000–15,000', d: 'Simple profile, 1-2 income sources', tag: 'Green', c: 'var(--green)' },
  { t: 'Advisory Filing', p: '₹18,000–30,000', d: 'Residency review, multiple income heads', tag: 'Amber', c: 'var(--amber)' },
  { t: 'Premium', p: '₹35,000–75,000', d: 'Property sale, ESOP, dual CG, DTAA', tag: 'Popular', c: 'var(--red)', pop: true },
  { t: 'Retainer', p: '₹1,00,000+/yr', d: 'HNI, ongoing planning, priority', tag: 'Premium', c: 'var(--text-primary)' },
];


/* ─────────────────────────────────────────────────────────────
   HOME PAGE
   ───────────────────────────────────────────────────────────── */

export default function Home() {
  const [vis, setVis] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setVis(true);
    const saved = localStorage.getItem('nri-theme') || 'light';
    setTheme(saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nri-theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
  }

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>

      {/* ══════════════════════════════════════════════════════════
         NAV
         ══════════════════════════════════════════════════════════ */}
      <nav style={{ background: 'var(--bg-nav)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ border: '1px solid var(--accent)' }}
            >
              <span className="text-xs font-bold" style={{ color: 'var(--accent)', fontFamily: 'system-ui' }}>NT</span>
            </div>
            <span className="font-serif text-lg tracking-wide" style={{ color: 'var(--text-nav)' }}>
              NRI Tax Suite
            </span>
          </div>

          <div className="flex gap-3 items-center">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 hover:scale-110"
              style={{
                background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(196,154,60,0.3)',
              }}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to Luxury Consultancy theme' : 'Switch to Premium Financial theme'}
            >
              {isDark ? '\u2600' : '\u263D'}
            </button>

            <a href="/blog" className="text-sm transition hidden sm:inline-block" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-on-dark)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >
              Knowledge Hub
            </a>
            <a href="/login" className="text-sm transition hidden sm:inline-block" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-on-dark)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >
              Team Login
            </a>
            <a
              href="/client"
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: 'var(--bg-cta)',
                color: 'var(--text-on-cta)',
              }}
            >
              Start Filing &rarr;
            </a>
          </div>
        </div>
      </nav>


      {/* ══════════════════════════════════════════════════════════
         HERO
         ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Radial glow for dark theme, subtle texture for light */}
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
          {/* Badge */}
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

          {/* Heading */}
          <h1
            className="font-serif text-4xl md:text-6xl leading-[1.15] mb-6"
            style={{ color: 'var(--text-primary)', fontWeight: 400, transition: 'color 0.3s ease' }}
          >
            NRI Tax Filing, Advisory
            <br />
            <span style={{ color: 'var(--stat-number)' }}>&amp; Compliance — Done Right</span>
          </h1>

          {/* Decorative line */}
          <div className="w-24 h-px mx-auto mb-6" style={{ background: 'var(--accent)', opacity: 0.6 }} />

          {/* Subtext */}
          <p
            className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontWeight: 300, transition: 'color 0.3s ease' }}
          >
            AI-assisted tax advisory for Non-Resident Indians. From residential status review to capital gains dual-option computation.
          </p>

          {/* CTA Buttons */}
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


      {/* ══════════════════════════════════════════════════════════
         STATS STRIP
         ══════════════════════════════════════════════════════════ */}
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


      {/* ══════════════════════════════════════════════════════════
         HOW IT WORKS
         ══════════════════════════════════════════════════════════ */}
      <div id="how" style={{ background: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          {/* Section label */}
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
                <div className="text-3xl mb-3">{s.ic}</div>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--accent)' }}>STEP {s.n}</div>
                <h3 className="font-serif font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.t}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
         WHAT WE HANDLE (always dark section)
         ══════════════════════════════════════════════════════════ */}
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
                <div className="text-2xl mb-3">{s.ic}</div>
                <h3 className="font-bold text-sm mb-1" style={{ color: '#ffffff' }}>{s.t}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
         PRICING
         ══════════════════════════════════════════════════════════ */}
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

                {/* Tag dot + label */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.c }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {s.tag}
                  </span>
                </div>

                <h3 className="font-serif font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{s.t}</h3>
                <div className="font-bold text-xl mb-2 font-serif" style={{ color: 'var(--text-primary)' }}>{s.p}</div>
                <p className="text-xs flex-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.d}</p>

                <button
                  className="mt-4 w-full py-2.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-all duration-300"
                  style={s.pop ? {
                    background: 'var(--bg-cta)',
                    color: 'var(--text-on-cta)',
                    fontFamily: 'system-ui',
                  } : {
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    background: 'transparent',
                    fontFamily: 'system-ui',
                  }}
                >
                  Select Plan
                </button>
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


      {/* ══════════════════════════════════════════════════════════
         CTA BANNER (gold in both themes)
         ══════════════════════════════════════════════════════════ */}
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
            Our dual-option computation saves NRI clients ₹1.5L+ per property transaction on average.
          </p>
          <a
            href="/client"
            className="inline-block px-8 py-3.5 rounded-lg font-bold transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            Start Now — Free to Begin
          </a>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
         TESTIMONIAL (light theme only, matches Style C)
         ══════════════════════════════════════════════════════════ */}
      <div
        className="py-16"
        style={{
          background: 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="text-4xl font-serif mb-5" style={{ color: 'var(--accent)' }}>&ldquo;</div>
          <p
            className="text-lg md:text-xl leading-relaxed mb-6 font-serif italic"
            style={{ color: 'var(--text-primary)' }}
          >
            After years of struggling with cross-border compliance, this team brought clarity and peace of mind. Their attention to detail on my property sale was exceptional.
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Rajesh K., Software Engineer &mdash; Singapore
          </p>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
         FOOTER (always dark)
         ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: 'var(--bg-footer)', transition: 'background-color 0.3s ease' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-wrap justify-between items-start gap-8">
            <div>
              <div className="font-serif text-lg font-bold" style={{ color: 'var(--accent)' }}>MKW Advisors</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>NRI Tax Filing &middot; Advisory &middot; Compliance</div>
              <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>CA | CS | CMA | IBBI Registered Valuer</div>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Services</div>
              <div>NRI ITR Filing</div>
              <div>Capital Gains Advisory</div>
              <div>DTAA / FTC Review</div>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Quick Links</div>
              <a href="/client" className="block hover:text-white transition">Start Filing</a>
              <a href="/login" className="block hover:text-white transition">Team Login</a>
            </div>
          </div>
          <div
            className="mt-8 pt-6 text-center text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            &copy; {new Date().getFullYear()} MKW Advisors. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
