'use client';

import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   SHARED DATA
   ───────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: '🏠', title: 'Property Sale Tax', desc: 'Dual computation under Indian & foreign law, capital gains indexation, and Section 54/54EC reinvestment planning.' },
  { icon: '📍', title: 'Residential Status', desc: 'Stay-day analysis across fiscal years, RNOR qualification review, and status change impact assessment.' },
  { icon: '🌐', title: 'DTAA / FTC', desc: 'Treaty-by-treaty analysis for 90+ countries, foreign tax credit computation, and relief under Section 90/91.' },
  { icon: '🏢', title: 'Rental Income', desc: 'House property income computation, municipal tax deductions, standard deduction, and co-owner allocation.' },
  { icon: '📈', title: 'Investments', desc: 'NRO/FD interest taxation, mutual fund capital gains, ESOP perquisite valuation, and RSU vesting analysis.' },
  { icon: '🔍', title: 'AIS Reconciliation', desc: 'Automated mismatch detection against AIS/TIS data, TDS credit verification, and discrepancy resolution.' },
];

const PRICING = [
  { tier: 'Basic Filing', price: '₹8,000–15,000', period: 'one-time', tag: 'green', desc: 'Standard ITR filing for NRIs with salary and interest income. Includes Form 67 and basic DTAA.', bullets: ['ITR-2 preparation & filing', 'Basic DTAA relief', 'AIS reconciliation', 'Email support'] },
  { tier: 'Advisory Filing', price: '₹18,000–30,000', period: 'one-time', tag: 'amber', desc: 'For NRIs with property sales, capital gains, ESOPs, or multi-country income requiring advisory.', bullets: ['Everything in Basic', 'Capital gains computation', 'ESOP / RSU analysis', 'Dedicated advisor call'] },
  { tier: 'Premium Compliance', price: '₹35,000–75,000', period: 'one-time', tag: 'red', popular: true, desc: 'Comprehensive compliance for complex cross-border situations with proactive planning.', bullets: ['Everything in Advisory', 'Full DTAA treaty analysis', 'Property sale Section 54 planning', 'Priority WhatsApp support'] },
  { tier: 'Annual Retainer', price: '₹1,00,000+', period: '/year', tag: 'gold', desc: 'Year-round advisory, quarterly reviews, and proactive compliance for HNI NRIs.', bullets: ['Everything in Premium', 'Quarterly review calls', 'Advance tax planning', 'Unlimited consultations'] },
];

const STATS = [
  { value: '2,800+', label: 'NRI Clients Served' },
  { value: '18+', label: 'Countries Covered' },
  { value: '₹120Cr+', label: 'Tax Computed' },
  { value: '99.7%', label: 'Filing Accuracy' },
];


/* ═════════════════════════════════════════════════════════════
   STYLE A — PREMIUM FINANCIAL SERVICES
   ═════════════════════════════════════════════════════════════ */

function StyleA() {
  return (
    <div style={{ fontFamily: 'Georgia, serif' }} className="min-h-screen bg-[var(--accent-tertiary)] text-white">

      {/* ── NAV ── */}
      <nav className="border-b border-[rgba(var(--accent-rgb),0.2)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-theme-accent flex items-center justify-center">
              <span className="text-theme-accent text-xs font-bold" style={{ fontFamily: 'system-ui' }}>NT</span>
            </div>
            <span className="text-lg tracking-wide">NRI Tax Suite</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm tracking-widest uppercase text-theme-secondary">
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Services</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Advisory</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Pricing</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">About</a>
          </div>
          <button className="border border-theme-accent text-theme-accent px-5 py-2 text-xs tracking-widest uppercase hover:bg-theme-accent hover:text-[var(--text-on-cta)] transition-all">
            Client Portal
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(var(--accent-rgb),0.08) 0%, transparent 70%)',
        }} />
        <div className="max-w-4xl mx-auto text-center px-6 pt-28 pb-20 relative z-10">
          <p className="text-theme-accent text-xs tracking-[0.35em] uppercase mb-8">
            NRI Tax Advisory &middot; FY 2025-26
          </p>
          <h1 className="text-5xl md:text-7xl leading-[1.15] mb-8" style={{ fontWeight: 400 }}>
            Precision Tax Advisory
            <br />
            <span style={{ color: 'var(--accent-hover)' }}>for Non-Resident Indians</span>
          </h1>
          <div className="w-24 h-px bg-theme-accent mx-auto mb-8" />
          <p className="text-theme-secondary text-lg max-w-xl mx-auto mb-12" style={{ fontFamily: 'system-ui', fontWeight: 300, lineHeight: 1.8 }}>
            Navigate India&rsquo;s tax complexities with confidence. Bespoke advisory for cross-border income, property transactions, and global compliance.
          </p>
          <div className="flex items-center justify-center gap-5">
            <button className="bg-theme-accent text-[var(--text-on-cta)] px-8 py-3.5 text-sm tracking-widest uppercase font-semibold hover:bg-[var(--accent-hover)] transition-colors" style={{ fontFamily: 'system-ui' }}>
              Begin Your Assessment &rarr;
            </button>
            <button className="border border-theme-accent text-theme-accent px-8 py-3.5 text-sm tracking-widest uppercase hover:bg-theme-accent/10 transition-colors" style={{ fontFamily: 'system-ui' }}>
              View Services
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-[rgba(var(--accent-rgb),0.2)]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center py-10" style={{ columnGap: '0', rowGap: '0' }}>
          {STATS.map((s, i) => (
            <div key={i} className="px-10 py-2 text-center">
              <div className="text-3xl mb-1" style={{ color: 'var(--accent-hover)' }}>{s.value}</div>
              <div className="text-xs tracking-widest uppercase text-theme-secondary" style={{ fontFamily: 'system-ui' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-theme-accent text-xs tracking-[0.35em] uppercase text-center mb-4">Our Expertise</p>
        <h2 className="text-3xl md:text-4xl text-center mb-4">Comprehensive NRI Tax Services</h2>
        <div className="w-16 h-px bg-theme-accent mx-auto mb-16" />
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[var(--accent-tertiary)] border-t-2 border-theme-accent/60 p-8 hover:border-[var(--accent-hover)] transition-colors group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg mb-3 text-white transition-colors group-hover:text-[var(--accent-hover)]">{f.title}</h3>
              <p className="text-[var(--text-on-dark)] text-sm leading-relaxed" style={{ fontFamily: 'system-ui', fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="border-t border-[rgba(var(--accent-rgb),0.2)] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-theme-accent text-xs tracking-[0.35em] uppercase text-center mb-4">Engagement Models</p>
          <h2 className="text-3xl md:text-4xl text-center mb-4">Transparent Fee Structure</h2>
          <div className="w-16 h-px bg-theme-accent mx-auto mb-16" />
          <div className="grid md:grid-cols-4 gap-5">
            {PRICING.map((p, i) => {
              const tagColors = { green: 'var(--accent)', amber: 'var(--accent-hover)', red: 'var(--accent-tertiary)', gold: 'var(--accent)' };
              return (
                <div key={i} className={`relative bg-[var(--accent-tertiary)] border ${p.popular ? 'border-theme-accent' : 'border-[rgba(var(--accent-rgb),0.2)]'} p-7 flex flex-col`}>
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-theme-accent text-[var(--text-on-cta)] px-4 py-1 text-[10px] tracking-widest uppercase font-bold" style={{ fontFamily: 'system-ui' }}>
                      Most Popular
                    </div>
                  )}
                  <div className="w-3 h-3 rounded-full mb-5" style={{ backgroundColor: tagColors[p.tag] }} />
                  <h3 className="text-sm tracking-widest uppercase text-theme-secondary mb-2" style={{ fontFamily: 'system-ui' }}>{p.tier}</h3>
                  <div className="text-2xl text-white mb-1">{p.price}</div>
                  <div className="text-xs text-theme-secondary mb-4" style={{ fontFamily: 'system-ui' }}>{p.period}</div>
                  <p className="text-sm text-theme-secondary mb-6 flex-1" style={{ fontFamily: 'system-ui', fontWeight: 300, lineHeight: 1.7 }}>{p.desc}</p>
                  <ul className="space-y-2 mb-8">
                    {p.bullets.map((b, j) => (
                      <li key={j} className="text-xs text-theme-muted flex items-start gap-2" style={{ fontFamily: 'system-ui' }}>
                        <span className="text-theme-accent mt-0.5">&#9670;</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 text-xs tracking-widest uppercase transition-all ${
                    p.popular
                      ? 'bg-theme-accent text-[var(--text-on-cta)] hover:bg-[var(--accent-hover)]'
                      : 'border border-theme-accent/40 text-theme-accent hover:bg-theme-accent/10'
                  }`} style={{ fontFamily: 'system-ui' }}>
                    Select Plan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="border-t border-[rgba(var(--accent-rgb),0.2)]">
        <div className="max-w-4xl mx-auto text-center px-6 py-24">
          <p className="text-theme-accent text-xs tracking-[0.35em] uppercase mb-6">Begin Today</p>
          <h2 className="text-3xl md:text-5xl mb-6">Your Cross-Border Tax<br />Clarity Awaits</h2>
          <div className="w-16 h-px bg-theme-accent mx-auto mb-8" />
          <p className="text-theme-secondary max-w-lg mx-auto mb-10" style={{ fontFamily: 'system-ui', fontWeight: 300 }}>
            Schedule a confidential consultation with our NRI tax specialists. No obligations, complete discretion.
          </p>
          <button className="bg-theme-accent text-[var(--text-on-cta)] px-10 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-[var(--accent-hover)] transition-colors" style={{ fontFamily: 'system-ui' }}>
            Schedule Consultation &rarr;
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(var(--accent-rgb),0.2)] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="text-sm tracking-wide">NRI Tax Suite</span>
            <p className="text-xs text-theme-secondary mt-1" style={{ fontFamily: 'system-ui' }}>&copy; 2026 NRI Tax Suite. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-xs tracking-widest uppercase text-theme-secondary" style={{ fontFamily: 'system-ui' }}>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Privacy</a>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Terms</a>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* ═════════════════════════════════════════════════════════════
   STYLE B — MODERN SAAS
   ═════════════════════════════════════════════════════════════ */

function StyleB() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }} className="min-h-screen bg-[var(--bg-secondary)] text-theme">

      {/* ── NAV ── */}
      <nav className="border-b border-theme">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center">
              <span className="text-white text-sm font-bold">NT</span>
            </div>
            <span className="text-lg font-bold">NRI Tax Suite</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-theme-secondary font-medium">
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Features</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Pricing</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Reviews</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-theme-secondary hover:text-theme-accent transition-colors px-3 py-2">
              Log in
            </button>
            <button className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none" style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(var(--accent-rgb),0.12) 0%, transparent 50%), radial-gradient(circle at 90% 60%, rgba(var(--accent-rgb),0.08) 0%, transparent 40%)',
        }} />
        {/* Dots pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 relative z-10">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[rgba(var(--accent-rgb),0.08)] border border-[rgba(var(--accent-rgb),0.15)] px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] animate-pulse" />
              <span className="text-xs font-semibold text-theme-accent">FY 2025-26 &middot; AI-Powered</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-center leading-[1.08] mb-6">
            NRI Tax Filing,
            <br />
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">Simplified by AI</span>
          </h1>
          <p className="text-lg text-theme-secondary text-center max-w-xl mx-auto mb-10 leading-relaxed">
            The smartest way to file your Indian taxes from anywhere in the world. AI-powered analysis, expert review, and seamless compliance.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16">
            <button className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white px-8 py-3.5 rounded-full text-sm font-semibold shadow-lg shadow-[0_20px_40px_rgba(var(--accent-rgb),0.16)] hover:shadow-xl hover:shadow-[0_24px_48px_rgba(var(--accent-rgb),0.18)] hover:scale-[1.02] transition-all">
              Start Free Assessment &rarr;
            </button>
            <button className="border-2 border-theme text-theme px-8 py-3.5 rounded-full text-sm font-semibold hover:border-theme-accent hover:text-theme-accent transition-all">
              See How It Works
            </button>
          </div>
          {/* Stats card */}
          <div className="bg-[rgba(var(--accent-rgb),0.08)] border border-[rgba(var(--accent-rgb),0.15)] rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-extrabold text-theme-accent">{s.value}</div>
                  <div className="text-xs text-theme-secondary mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-[var(--bg-elevated)] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[rgba(var(--accent-rgb),0.08)] border border-[rgba(var(--accent-rgb),0.15)] px-4 py-1.5 rounded-full mb-6">
              <span className="text-xs font-semibold text-theme-accent">Comprehensive Coverage</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything NRIs Need</h2>
            <p className="text-theme-secondary max-w-lg mx-auto">From simple salary filings to complex cross-border transactions, we handle it all.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-[var(--bg-secondary)] rounded-2xl p-7 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-theme group">
                <div className="w-12 h-12 rounded-xl bg-[rgba(var(--accent-rgb),0.08)] flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-theme-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[rgba(var(--accent-rgb),0.08)] border border-[rgba(var(--accent-rgb),0.15)] px-4 py-1.5 rounded-full mb-6">
              <span className="text-xs font-semibold" style={{ color: 'var(--accent-hover)' }}>Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Choose Your Plan</h2>
            <p className="text-theme-secondary max-w-lg mx-auto">Transparent pricing. No hidden fees. Pay only for what you need.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {PRICING.map((p, i) => {
              const tagColors = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', gold: 'var(--accent)' };
              return (
                <div key={i} className={`relative bg-[var(--bg-secondary)] rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  p.popular
                    ? 'ring-2 ring-[var(--accent)] shadow-xl shadow-blue-100'
                    : 'border border-theme shadow-md hover:shadow-xl'
                }`}>
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white px-4 py-1 rounded-full text-[11px] font-bold shadow-md">
                      Most Popular
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tagColors[p.tag] }} />
                    <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wide">{p.tier}</h3>
                  </div>
                  <div className="text-2xl font-extrabold mb-0.5">{p.price}</div>
                  <div className="text-xs text-theme-secondary mb-4">{p.period}</div>
                  <p className="text-sm text-theme-secondary mb-6 flex-1 leading-relaxed">{p.desc}</p>
                  <ul className="space-y-2.5 mb-8">
                    {p.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-theme-secondary flex items-start gap-2.5">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-theme-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-full text-sm font-semibold transition-all ${
                    p.popular
                      ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white shadow-lg shadow-blue-200 hover:shadow-xl'
                      : 'bg-[var(--bg-elevated)] text-theme hover:bg-[var(--bg-secondary)]'
                  }`}>
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Simplify<br />Your NRI Tax Filing?</h2>
              <p className="text-blue-100 max-w-md mx-auto mb-8">
                Join thousands of NRIs who file with confidence. Start your free assessment today.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="bg-[var(--bg-secondary)] text-theme-accent px-8 py-3.5 rounded-full text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
                  Start Free &rarr;
                </button>
                <button className="border-2 border-[rgba(var(--text-on-cta),0.2)] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[rgba(255,255,255,0.1)] transition-all">
                  Talk to Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-theme py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">NT</span>
            </div>
            <div>
              <span className="text-sm font-bold">NRI Tax Suite</span>
              <p className="text-xs text-theme-secondary">&copy; 2026 All rights reserved.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-theme-secondary font-medium">
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Privacy</a>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Terms</a>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Support</a>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* ═════════════════════════════════════════════════════════════
   STYLE C — LUXURY CONSULTANCY (ELEVATED CURRENT)
   ═════════════════════════════════════════════════════════════ */

function StyleC() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--accent-tertiary)]">

      {/* ── NAV ── */}
      <nav className="border-b border-theme">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <span className="text-xl tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>NRI Tax Suite</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-theme-secondary font-medium">
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Services</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Our Approach</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Pricing</a>
            <a className="hover:text-theme-accent transition-colors cursor-pointer">Contact</a>
          </div>
          <button className="bg-[var(--accent-tertiary)] text-white px-5 py-2.5 text-sm rounded-md hover:bg-[var(--accent-hover)] transition-colors">
            Client Login
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative">
        {/* Subtle texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="max-w-3xl mx-auto text-center px-6 pt-28 pb-20 relative z-10">
          <p className="text-theme-accent text-sm mb-10 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            &mdash; NRI Tax Advisory &middot; FY 2025-26 &mdash;
          </p>
          <h1 className="text-4xl md:text-6xl leading-[1.2] mb-8" style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>
            Tax Advisory That
            <br />
            Respects Your Time
          </h1>
          <p className="text-lg text-theme-secondary max-w-lg mx-auto mb-12 leading-relaxed" style={{ fontWeight: 400 }}>
            Expert-led cross-border tax compliance for discerning NRIs. Thoughtful analysis, clear communication, and meticulous execution.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16">
            <button className="bg-[var(--accent-tertiary)] text-white px-8 py-3.5 rounded-md text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
              Begin Your Filing &rarr;
            </button>
            <button className="border-2 border-[var(--accent-tertiary)] text-[var(--accent-tertiary)] px-8 py-3.5 rounded-md text-sm font-medium hover:bg-[var(--accent-tertiary)] hover:text-white transition-all">
              Our Approach
            </button>
          </div>
          {/* Inline stats */}
          <p className="text-base text-theme-secondary" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-theme-accent font-semibold">2,800+</span> NRIs served
            <span className="mx-3 text-theme-accent">&middot;</span>
            <span className="text-theme-accent font-semibold">18+</span> countries
            <span className="mx-3 text-theme-accent">&middot;</span>
            <span className="text-theme-accent font-semibold">₹120Cr+</span> computed
            <span className="mx-3 text-theme-accent">&middot;</span>
            <span className="text-theme-accent font-semibold">99.7%</span> accuracy
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-theme-accent text-sm mb-4 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>&mdash; Our Services &mdash;</p>
            <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Tailored to Your Situation</h2>
            <p className="text-theme-secondary max-w-md mx-auto">Every NRI&rsquo;s tax situation is unique. Our services adapt to your specific cross-border complexities.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-[var(--bg-secondary)] border border-theme rounded-lg p-7 hover:border-theme-accent transition-all duration-300 group">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>{f.title}</h3>
                <p className="text-sm text-theme-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-theme-accent text-sm mb-4 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>&mdash; Engagement Options &mdash;</p>
            <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>Clear, Considered Pricing</h2>
            <p className="text-theme-secondary max-w-md mx-auto">Our fees reflect the depth of expertise applied to your situation. No surprises.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {PRICING.map((p, i) => {
              const tagColors = { green: 'var(--accent)', amber: 'var(--accent-hover)', red: 'var(--accent-tertiary)', gold: 'var(--accent)' };
              return (
                <div key={i} className={`relative rounded-lg p-7 flex flex-col border transition-all duration-300 hover:border-theme-accent ${
                  p.popular
                    ? 'bg-[var(--bg-elevated)] border-theme-accent'
                    : 'bg-[var(--bg-secondary)] border-theme'
                }`}>
                  {p.popular && (
                    <div className="absolute -top-3 left-6 bg-theme-accent text-white px-3 py-0.5 rounded text-[11px] font-semibold tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                      Recommended
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tagColors[p.tag] }} />
                    <h3 className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">{p.tier}</h3>
                  </div>
                  <div className="text-2xl font-semibold mb-0.5" style={{ fontFamily: 'Georgia, serif' }}>{p.price}</div>
                  <div className="text-xs text-theme-secondary mb-4">{p.period}</div>
                  <p className="text-sm text-theme-secondary mb-6 flex-1 leading-relaxed">{p.desc}</p>
                  <ul className="space-y-2.5 mb-8">
                    {p.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-theme-secondary flex items-start gap-2">
                        <span className="text-theme-accent mt-0.5 text-xs">&#9679;</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-md text-sm font-medium transition-all ${
                    p.popular
                      ? 'bg-[var(--accent-tertiary)] text-white hover:bg-[var(--accent-hover)]'
                      : 'border border-[var(--accent-tertiary)] text-[var(--accent-tertiary)] hover:bg-[var(--accent-tertiary)] hover:text-white'
                  }`}>
                    Select Plan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-theme-accent text-sm mb-6 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>&mdash; Begin &mdash;</p>
          <h2 className="text-3xl md:text-5xl mb-6" style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>
            Let Us Handle the<br />Complexity
          </h2>
          <p className="text-theme-secondary max-w-md mx-auto mb-10 leading-relaxed">
            Book a conversation with our team. We&rsquo;ll understand your situation, outline the approach, and handle everything from there.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="bg-[var(--accent-tertiary)] text-white px-10 py-4 rounded-md text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
              Book a Conversation &rarr;
            </button>
          </div>
          <p className="text-xs text-theme-secondary mt-6">No obligations. Typically responds within 4 hours.</p>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="bg-[var(--bg-secondary)] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="text-4xl text-theme-accent mb-6" style={{ fontFamily: 'Georgia, serif' }}>&ldquo;</div>
          <p className="text-xl text-[var(--accent-tertiary)] leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            After years of struggling with cross-border compliance, this team brought clarity and peace of mind. Their attention to detail on my property sale was exceptional.
          </p>
          <p className="text-sm text-theme-secondary font-medium">Rajesh K., Software Engineer &mdash; Singapore</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-theme py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="text-base" style={{ fontFamily: 'Georgia, serif' }}>NRI Tax Suite</span>
            <p className="text-xs text-theme-secondary mt-1">&copy; 2026 NRI Tax Suite. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-theme-secondary">
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Privacy Policy</a>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Terms of Service</a>
            <a className="hover:text-theme-accent cursor-pointer transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* ═════════════════════════════════════════════════════════════
   MAIN PREVIEW PAGE
   ═════════════════════════════════════════════════════════════ */

const STYLE_META = {
  A: { name: 'Premium Financial Services', subtitle: 'Dark navy, gold accents, serif typography, private-banking gravitas', color: 'var(--accent)' },
  B: { name: 'Modern SaaS', subtitle: 'White & blue, bold sans-serif, rounded cards, fintech energy', color: 'var(--accent)' },
  C: { name: 'Luxury Consultancy', subtitle: 'Warm cream, editorial serif, charcoal & gold, trusted-advisor sophistication', color: 'var(--accent-tertiary)' },
};

export default function Preview() {
  const [style, setStyle] = useState('A');
  const meta = STYLE_META[style];

  return (
    <div className="min-h-screen bg-[var(--bg-elevated)]">
      {/* ── STICKY TAB BAR ── */}
      <div className="sticky top-0 z-50 bg-[rgba(var(--bg-secondary-rgb),0.95)] backdrop-blur-md border-b border-theme shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-theme">NRI Tax Suite</span>
            <span className="text-theme-secondary">|</span>
            <span className="text-xs text-theme-secondary">Design Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {['A', 'B', 'C'].map(s => (
              <button
                key={s}
                onClick={() => { setStyle(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  style === s
                    ? 'text-white shadow-md scale-105'
                    : 'bg-[var(--bg-elevated)] text-theme-secondary hover:bg-[var(--bg-secondary)] hover:text-theme'
                }`}
                style={style === s ? { backgroundColor: STYLE_META[s].color } : undefined}
              >
                Style {s}
              </button>
            ))}
          </div>
        </div>
        {/* Description strip */}
        <div className="border-t border-theme bg-[rgba(var(--bg-elevated-rgb),0.8)]">
          <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
            <span className="text-xs font-semibold text-theme">{meta.name}</span>
            <span className="text-xs text-theme-secondary">&mdash; {meta.subtitle}</span>
          </div>
        </div>
      </div>

      {/* ── RENDERED STYLE ── */}
      <div>
        {style === 'A' && <StyleA />}
        {style === 'B' && <StyleB />}
        {style === 'C' && <StyleC />}
      </div>
    </div>
  );
}
