'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/theme-provider';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

// ═══ Constants ═══

const STAGES = [
  { key: 'intake',         label: 'Intake Received',         icon: '\uD83D\uDCCB' },
  { key: 'analysis',       label: 'AI Analysis',             icon: '\uD83E\uDD16' },
  { key: 'review',         label: 'Expert Review',           icon: '\uD83D\uDC68\u200D\uD83D\uDCBC' },
  { key: 'findings_ready', label: 'Findings Ready',          icon: '\uD83D\uDCCA' },
  { key: 'filing',         label: 'Filing in Progress',      icon: '\uD83D\uDCDD' },
  { key: 'filed',          label: 'Filed & Delivered',       icon: '\u2705' },
];

const MODULE_NAMES = [
  { id: 'residency', label: 'Tax Residency Check' },
  { id: 'income',    label: 'Income Source Mapping' },
  { id: 'recon',     label: 'Tax Record Verification' },
  { id: 'filing',    label: 'ITR Form Selection' },
  { id: 'cg',        label: 'Capital Gains Computation' },
  { id: 'dtaa',      label: 'Double-Tax Protection' },
  { id: 'prefiling', label: 'Final Quality Review' },
  { id: 'memo',      label: 'Advisory Report' },
];

const CLS_COLORS = { Green: '#2A6B4A', Amber: '#B07D3A', Red: '#A04848' };

const SESSION_KEY = 'nri-mycases-session';

// ═══ Helpers ═══

function determineStage(caseData) {
  const status = caseData?.status || 'intake';
  const mc = caseData?.modules_completed || 0;
  if (status === 'filed' || status === 'closed') return 6;
  if (status === 'filing') return 5;
  if (status === 'findings_ready') return 4;
  if (status === 'review' || mc >= 8) return 3;
  if (status === 'in_progress' || mc >= 1) return 2;
  return 1;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

// ═══ Main Component ═══

export default function ClientPortalDashboard() {
  const { theme } = useTheme();

  // State machine: 'login' | 'verifying' | 'dashboard'
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [phone4, setPhone4] = useState('');
  const [caseCount, setCaseCount] = useState(0);
  const [clientName, setClientName] = useState('');
  const [cases, setCases] = useState([]);
  const [expandedCase, setExpandedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vis, setVis] = useState(false);
  const [noPhone, setNoPhone] = useState(false);
  const [dobInput, setDobInput] = useState('');

  // Restore session from sessionStorage
  useEffect(() => {
    setVis(true);
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        if (session.verified && session.cases && session.email) {
          setEmail(session.email);
          setClientName(session.clientName || 'Client');
          setCases(session.cases);
          setScreen('dashboard');
        }
      }
    } catch { /* ignore corrupt session */ }
  }, []);

  // Save session on dashboard load
  const saveSession = useCallback((data) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        verified: true,
        email: data.clientEmail,
        clientName: data.clientName,
        cases: data.cases,
        savedAt: Date.now(),
      }));
    } catch { /* sessionStorage full or unavailable */ }
  }, []);

  // Step 1: Look up email
  const handleEmailLookup = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/my-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No cases found for this email.');
        setLoading(false);
        return;
      }

      setCaseCount(data.count);
      setClientName(data.clientName || 'Client');
      setScreen('verifying');
    } catch {
      setError('Connection error. Please check your internet and try again.');
    }

    setLoading(false);
  };

  // Step 2: Verify phone (or DOB fallback)
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!noPhone && phone4.length !== 4) {
      setError('Please enter exactly 4 digits.');
      return;
    }
    if (noPhone && !dobInput) {
      setError('Please enter your date of birth.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = { email: email.trim().toLowerCase(), phone4 };
      if (noPhone) payload.dob = dobInput;
      const res = await fetch('/api/my-cases/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.noPhone) {
          setNoPhone(true);
          setError('');
          setLoading(false);
          return;
        }
        setError(data.error || 'Verification failed. Please check and try again.');
        setLoading(false);
        return;
      }

      setCases(data.cases || []);
      setClientName(data.clientName || 'Client');
      saveSession(data);
      setScreen('dashboard');
    } catch {
      setError('Connection error. Please check your internet and try again.');
    }

    setLoading(false);
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setScreen('login');
    setEmail('');
    setPhone4('');
    setCases([]);
    setCaseCount(0);
    setClientName('');
    setExpandedCase(null);
    setError('');
  };

  // ═══ Render: Login Screen ═══
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-theme">
        <div className="gold-gradient-line" />
        <NavBar />

        <div className={`max-w-lg mx-auto px-6 pt-20 pb-16 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(196,154,60,0.1)', border: '2px solid rgba(196,154,60,0.2)' }}>
              <svg className="w-7 h-7" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl font-bold text-theme mb-2">Track Your Cases</h1>
            <p className="text-theme-secondary text-sm leading-relaxed">
              Enter the email you used during intake to access all your cases
            </p>
          </div>

          <form onSubmit={handleEmailLookup} className="card-theme p-8 shadow-sm">
            <label className="block text-xs font-semibold text-theme-muted mb-2 uppercase tracking-wide">
              Your Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="input-theme text-base"
              autoFocus
              autoComplete="email"
              required
            />

            {error && (
              <div className="mt-4 rounded-lg px-4 py-3 text-sm" style={{
                background: 'rgba(160,72,72,0.08)',
                border: '1px solid rgba(160,72,72,0.2)',
                color: 'var(--red)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim().includes('@')}
              className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'currentColor' }} />
                  Looking up...
                </>
              ) : (
                'Access My Cases \u2192'
              )}
            </button>
          </form>

          <div className="text-center mt-8 space-y-3">
            <p className="text-xs text-theme-muted">
              Have a tracking code instead?{' '}
              <a href="/portal" className="text-theme-accent font-semibold hover:underline">Track a single case</a>
            </p>
            <p className="text-xs text-theme-muted">
              Need to file?{' '}
              <a href="/client" className="text-theme-accent font-semibold hover:underline">Start your intake here</a>
            </p>
          </div>
        </div>

        <ContactBar />
        <Footer />
      </div>
    );
  }

  // ═══ Render: Verification Screen ═══
  if (screen === 'verifying') {
    return (
      <div className="min-h-screen bg-theme">
        <div className="gold-gradient-line" />
        <NavBar />

        <div className={`max-w-lg mx-auto px-6 pt-20 pb-16 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="card-theme p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(196,154,60,0.1)', border: '2px solid rgba(196,154,60,0.2)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h3 className="font-serif text-xl font-bold text-theme mb-2">Verify Your Identity</h3>
            <p className="text-sm text-theme-secondary mb-1">
              We found <strong className="text-theme-accent">{caseCount} case{caseCount !== 1 ? 's' : ''}</strong> linked to this email.
            </p>

            {noPhone ? (
              <>
                <p className="text-sm text-theme-secondary mb-6">
                  No phone number on file. Please verify using your date of birth, or contact us on WhatsApp.
                </p>
                <form onSubmit={handleVerify}>
                  <input
                    type="date"
                    value={dobInput}
                    onChange={e => setDobInput(e.target.value)}
                    className="input-theme py-3 px-4 max-w-xs mx-auto text-center text-lg mb-4"
                    autoFocus
                  />
                  <p className="text-[10px] text-theme-muted mb-4">Enter your date of birth (YYYY-MM-DD)</p>

                  {error && (
                    <div className="mt-4 mb-4 rounded-lg px-4 py-3 text-sm" style={{
                      background: 'rgba(160,72,72,0.08)',
                      border: '1px solid rgba(160,72,72,0.2)',
                      color: 'var(--red)',
                    }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !dobInput}
                    className="btn-primary py-3 px-8 mx-auto block flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'currentColor' }} />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Access \u2192'
                    )}
                  </button>
                </form>

                <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(196,154,60,0.08)', border: '1px solid rgba(196,154,60,0.2)' }}>
                  <p className="text-sm text-theme-secondary">
                    Having trouble? Contact us on{' '}
                    <a href="https://wa.me/919667744073" target="_blank" rel="noopener noreferrer" className="text-theme-accent font-semibold hover:underline">
                      WhatsApp
                    </a>{' '}
                    and we will help you access your cases.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-theme-secondary mb-6">
                  For your security, enter the last 4 digits of your registered phone number.
                </p>

                <form onSubmit={handleVerify}>
                  <div className="flex justify-center gap-2 mb-4">
                    {[0, 1, 2, 3].map(i => (
                      <input
                        key={i}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="input-theme w-14 h-14 text-center text-2xl font-bold tracking-widest"
                        value={phone4[i] || ''}
                        autoFocus={i === 0}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 1) {
                            const newPhone = phone4.split('');
                            newPhone[i] = val;
                            setPhone4(newPhone.join(''));
                            // Auto-focus next input
                            if (val && i < 3) {
                              const next = e.target.parentElement?.querySelectorAll('input')[i + 1];
                              next?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !phone4[i] && i > 0) {
                            const prev = e.target.parentElement?.querySelectorAll('input')[i - 1];
                            prev?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
                          setPhone4(pasted);
                          // Focus last filled input or the 4th
                          const inputs = e.target.parentElement?.querySelectorAll('input');
                          const focusIdx = Math.min(pasted.length, 3);
                          inputs?.[focusIdx]?.focus();
                        }}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="mt-4 mb-4 rounded-lg px-4 py-3 text-sm" style={{
                      background: 'rgba(160,72,72,0.08)',
                      border: '1px solid rgba(160,72,72,0.2)',
                      color: 'var(--red)',
                    }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || phone4.length !== 4}
                    className="btn-primary py-3 px-8 mx-auto block flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'currentColor' }} />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Access \u2192'
                    )}
                  </button>
                </form>
              </>
            )}

            <button
              onClick={() => {
                setScreen('login');
                setPhone4('');
                setError('');
              }}
              className="mt-5 text-xs text-theme-muted hover:text-theme-accent transition"
            >
              \u2190 Use a different email
            </button>
          </div>
        </div>

        <ContactBar />
        <Footer />
      </div>
    );
  }

  // ═══ Render: Cases Dashboard ═══
  return (
    <div className="min-h-screen bg-theme pb-24">
      <div className="gold-gradient-line" />
      <NavBar />

      <div className={`max-w-3xl mx-auto px-5 md:px-8 pt-8 pb-16 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-theme">
              Welcome, {clientName}
            </h1>
            <p className="text-sm text-theme-secondary mt-1">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <SummaryCard label="Total Cases" value={cases.length} accent="var(--accent)" />
          <SummaryCard
            label="In Progress"
            value={cases.filter(c => {
              const s = determineStage(c);
              return s >= 2 && s <= 5;
            }).length}
            accent="var(--amber)"
          />
          <SummaryCard
            label="Findings Ready"
            value={cases.filter(c => determineStage(c) === 4).length}
            accent="var(--green)"
          />
          <SummaryCard
            label="Filed"
            value={cases.filter(c => determineStage(c) === 6).length}
            accent="var(--green)"
          />
        </div>

        {/* Cases List */}
        <div className="space-y-4 stagger-premium">
          {cases.map((caseItem) => {
            const stage = determineStage(caseItem);
            const isExpanded = expandedCase === caseItem.id;

            return (
              <div
                key={caseItem.id}
                className="card-premium overflow-hidden animate-fade-in-up"
              >
                {/* Case Card Header */}
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : caseItem.id)}
                  className="w-full text-left p-5 md:p-6 transition-colors duration-200"
                  style={{ background: isExpanded ? 'var(--bg-elevated, var(--bg-card))' : 'transparent' }}
                  aria-expanded={isExpanded}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Stage indicator */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                        style={{
                          background: stage >= 6 ? 'var(--green)' : stage >= 4 ? 'rgba(42,107,74,0.12)' : 'rgba(196,154,60,0.1)',
                          color: stage >= 6 ? '#fff' : stage >= 4 ? 'var(--green)' : 'var(--accent)',
                          border: stage >= 6 ? 'none' : `1.5px solid ${stage >= 4 ? 'rgba(42,107,74,0.25)' : 'rgba(196,154,60,0.2)'}`,
                        }}
                      >
                        {stage >= 6 ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          STAGES[stage - 1]?.icon || '\uD83D\uDCCB'
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-theme-accent tracking-wider">
                            {(caseItem.id || '').slice(0, 8).toUpperCase()}
                          </span>
                          {caseItem.classification && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: (CLS_COLORS[caseItem.classification] || '#999') + '15',
                                color: CLS_COLORS[caseItem.classification] || '#999',
                                border: `1px solid ${(CLS_COLORS[caseItem.classification] || '#999')}30`,
                              }}
                            >
                              {caseItem.classification}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span className="font-medium text-theme">FY {caseItem.fy}</span>
                          {caseItem.country && (
                            <>
                              <span className="text-theme-muted">|</span>
                              <span className="text-theme-secondary">{caseItem.country}</span>
                            </>
                          )}
                          <span className="text-theme-muted">|</span>
                          <span className="text-theme-muted text-xs">{formatDate(caseItem.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: status + chevron */}
                    <div className="flex items-center gap-3 sm:flex-shrink-0">
                      <StatusBadge stage={stage} />
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--text-muted)' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Modules progress bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${((caseItem.modulesDone || caseItem.modules_completed || 0) / 9) * 100}%`,
                          background: (caseItem.modulesDone || caseItem.modules_completed || 0) >= 9 ? 'var(--green)' : 'var(--accent)',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-theme-muted font-medium whitespace-nowrap">
                      {caseItem.modulesDone || caseItem.modules_completed || 0}/9 modules
                    </span>
                  </div>
                </button>

                {/* Expanded: Progress Timeline */}
                {isExpanded && (
                  <div
                    className="px-5 md:px-6 pb-5 md:pb-6 border-t animate-fade-in"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="pt-5">
                      {/* Stage Timeline */}
                      <h4 className="font-serif text-base font-bold text-theme mb-4">Case Progress</h4>
                      <div className="relative mb-5">
                        {STAGES.map((s, i) => {
                          const stageNum = i + 1;
                          const isCompleted = stageNum < stage;
                          const isCurrent = stageNum === stage;
                          const isFuture = stageNum > stage;

                          return (
                            <div key={s.key} className="flex gap-3 mb-0.5 last:mb-0">
                              <div className="flex flex-col items-center" style={{ minWidth: 32 }}>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-500 ${
                                    isCurrent ? 'animate-pulse-gold' : ''
                                  }`}
                                  style={{
                                    background: isCompleted ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--border)',
                                    color: isCompleted || isCurrent ? '#fff' : 'var(--text-muted)',
                                  }}
                                >
                                  {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="text-xs">{s.icon}</span>
                                  )}
                                </div>
                                {i < STAGES.length - 1 && (
                                  <div
                                    className="w-0.5 flex-1 my-0.5 rounded-full"
                                    style={{
                                      minHeight: 16,
                                      background: isCompleted ? 'var(--green)' : 'var(--border)',
                                    }}
                                  />
                                )}
                              </div>
                              <div className={`pt-1 pb-3 ${isFuture ? 'opacity-35' : ''}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium text-sm ${
                                    isCurrent ? 'text-theme-accent' :
                                    isCompleted ? 'text-theme' :
                                    'text-theme-muted'
                                  }`}>
                                    {s.label}
                                  </span>
                                  {isCurrent && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                      style={{ color: 'var(--accent)', background: 'rgba(196,154,60,0.1)' }}>
                                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                                      CURRENT
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Module Checklist */}
                      {caseItem.modules && caseItem.modules.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-serif text-base font-bold text-theme mb-3">Analysis Modules</h4>
                          <div className="space-y-2">
                            {MODULE_NAMES.map((mod) => {
                              const moduleData = caseItem.modules.find(m => m.module_id === mod.id);
                              const isComplete = moduleData?.has_output;

                              return (
                                <div key={mod.id} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg"
                                  style={{ background: isComplete ? 'rgba(42,107,74,0.04)' : 'transparent' }}>
                                  {isComplete ? (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--green)' }}>
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: 'var(--border)' }} />
                                  )}
                                  <span className={`text-sm ${isComplete ? 'text-theme font-medium' : 'text-theme-muted'}`}>
                                    {mod.label}
                                  </span>
                                  {isComplete && moduleData?.completed_at && (
                                    <span className="text-[10px] text-theme-muted ml-auto">
                                      {formatDateTime(moduleData.completed_at)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* View Details Link */}
                      <div className="mt-5 pt-4 border-t flex flex-wrap gap-3" style={{ borderColor: 'var(--border)' }}>
                        {caseItem.portal_token ? (
                          <a
                            href={`/portal?ref=${caseItem.portal_token}`}
                            className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2"
                          >
                            View Full Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        ) : (
                          <a href="https://wa.me/919667744073?text=Hi%2C%20I%20need%20help%20accessing%20my%20case"
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs text-theme-accent hover:underline">
                            Contact us for case details
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {cases.length === 0 && (
          <div className="card-theme p-12 text-center">
            <div className="text-4xl mb-4">{'\uD83D\uDCE2'}</div>
            <h3 className="font-serif text-xl text-theme mb-2">No Cases Found</h3>
            <p className="text-sm text-theme-secondary mb-6">
              We could not find any cases linked to your email.
            </p>
            <a href="/client" className="btn-primary inline-block py-3 px-6">
              Start Your Filing
            </a>
          </div>
        )}
      </div>

      <ContactBar />
      <Footer />
    </div>
  );
}

// ═══ Sub-components ═══

function SummaryCard({ label, value, accent }) {
  return (
    <div className="card-theme p-4 text-center">
      <div className="text-2xl font-serif font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-[11px] text-theme-muted font-medium mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function StatusBadge({ stage }) {
  const configs = {
    1: { label: 'Received',    bg: 'rgba(196,154,60,0.1)',  color: 'var(--accent)',  border: 'rgba(196,154,60,0.2)' },
    2: { label: 'Analyzing',   bg: 'rgba(196,154,60,0.1)',  color: 'var(--accent)',  border: 'rgba(196,154,60,0.2)' },
    3: { label: 'In Review',   bg: 'rgba(176,125,58,0.1)',  color: 'var(--amber)',   border: 'rgba(176,125,58,0.2)' },
    4: { label: 'Findings',    bg: 'rgba(42,107,74,0.1)',   color: 'var(--green)',   border: 'rgba(42,107,74,0.2)' },
    5: { label: 'Filing',      bg: 'rgba(42,107,74,0.1)',   color: 'var(--green)',   border: 'rgba(42,107,74,0.2)' },
    6: { label: 'Filed',       bg: 'rgba(42,107,74,0.15)',  color: 'var(--green)',   border: 'rgba(42,107,74,0.3)' },
  };

  const cfg = configs[stage] || configs[1];

  return (
    <span
      className="text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

function ContactBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-theme-nav z-50 py-3 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
        <span className="text-theme-muted text-xs hidden md:inline">Questions?</span>
        <a
          href="https://wa.me/919667744073"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition font-semibold text-xs"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.319 0-4.476-.67-6.31-1.823l-.452-.278-2.65.889.889-2.65-.278-.452A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
          WhatsApp Us
        </a>
        <a href="mailto:tax@mkwadvisors.com" className="transition text-xs" style={{ color: 'var(--text-on-dark)' }}>
          tax@mkwadvisors.com
        </a>
        <a href="tel:+919667744073" className="transition text-xs" style={{ color: 'var(--text-on-dark)' }}>
          +91-96677 44073
        </a>
      </div>
    </div>
  );
}
