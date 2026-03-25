'use client';
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useTheme } from '@/app/theme-provider';
import { useSearchParams } from 'next/navigation';
import { computeCapitalGains, formatINR, FY_CONFIG } from '@/lib/compute';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

// ═══ Constants ═══

const STAGES = [
  { key: 'intake',         label: 'Intake Received',         icon: '\uD83D\uDCCB', desc: 'Your information has been securely received.' },
  { key: 'analysis',       label: 'AI Analysis in Progress', icon: '\uD83E\uDD16', desc: 'Our AI is reviewing your case across 9 specialist modules.' },
  { key: 'review',         label: 'Expert Review',           icon: '\uD83D\uDC68\u200D\uD83D\uDCBC', desc: 'A senior tax advisor is reviewing the analysis.' },
  { key: 'findings_ready', label: 'Findings Ready',          icon: '\uD83D\uDCCA', desc: 'Your tax position analysis is complete.' },
  { key: 'filing',         label: 'Filing in Progress',      icon: '\uD83D\uDCDD', desc: 'Your return is being prepared and filed.' },
  { key: 'filed',          label: 'Filed & Delivered',       icon: '\u2705', desc: 'Your return has been successfully filed.' },
];

const MODULE_NAMES = [
  { id: 'residency', label: 'Checking Your Tax Residency' },
  { id: 'income',    label: 'Mapping Your Income Sources' },
  { id: 'pricing',   label: null }, // internal — hidden from client
  { id: 'recon',     label: 'Verifying Your Tax Records' },
  { id: 'filing',    label: 'Choosing the Right Tax Form' },
  { id: 'cg',        label: 'Computing Your Capital Gains' },
  { id: 'dtaa',      label: 'Checking Double-Tax Protection' },
  { id: 'prefiling', label: 'Final Quality Review' },
  { id: 'memo',      label: 'Preparing Your Advisory Report' },
];

const MODULE_DESCRIPTIONS = {
  residency: 'We verified your Non-Resident status based on your stay days',
  income: 'All your income sources have been classified under Indian tax heads',
  recon: 'Your AIS/26AS records have been cross-checked',
  filing: 'We identified the right ITR form and schedules for your case',
  cg: 'Both computation options analyzed — we picked the one that saves you more',
  dtaa: 'Treaty benefits between India and your country have been reviewed',
  prefiling: 'All checks passed — your case is ready for filing',
  memo: 'Your personalized advisory report is being prepared',
};

const CLS_COLORS = { Green: '#2A6B4A', Amber: '#B07D3A', Red: '#A04848' };
const CLS_MEANINGS = {
  Green: 'Straightforward case \u2014 simple filing with limited complexity.',
  Amber: 'Moderate complexity \u2014 advisory review recommended alongside filing.',
  Red:   'Significant complexity \u2014 premium compliance service recommended.',
};

const NEXT_STEPS = [
  '', // placeholder for 0-index
  'Our AI is analyzing your case across 9 specialist modules. You will see results here within minutes.',
  'Our AI is analyzing your case across 9 specialist modules. You will see results here within minutes.',
  'A senior tax advisor is reviewing the AI analysis. Expect findings within 1 business day.',
  'Review your findings above. Your advisor will reach out to discuss next steps and confirm engagement.',
  'Your return is being prepared and will be filed on the Income Tax portal.',
  'Your return has been filed. Keep this page bookmarked for refund tracking.',
];

// ═══ Helper: determine current stage index (1-6) from case data ═══
function determineStage(caseData, modulesCompleted) {
  const status = caseData?.status || 'intake';
  const mc = modulesCompleted || 0;

  if (status === 'filed' || status === 'closed') return 6;
  if (status === 'filing') return 5;
  if (status === 'findings_ready') return 4;
  if (status === 'review' || mc >= 9) return 3;
  if (status === 'in_progress' || mc >= 1) return 2;
  return 1;
}

// ═══ Helper: compute key findings from intake data ═══
function computeFindings(intakeData, fy) {
  if (!intakeData) return null;

  const f = intakeData;
  const findings = {};

  // Capital gains savings
  if (f.salePrice && f.purchaseCost) {
    try {
      const cg = computeCapitalGains(
        Number(f.salePrice),
        Number(f.purchaseCost),
        f.propertyAcqFY || '2017-18',
        fy || '2025-26'
      );
      if (cg.savings > 0) {
        findings.cgSavings = cg.savings;
        findings.cgBetter = cg.better;
        findings.tdsRefund = cg.tdsRefund;
      }
    } catch (e) { /* skip CG findings if computation fails */ }
  }

  // Residency status
  findings.residencyStatus = 'Non-Resident (preliminary)';

  return findings;
}

// ═══ Main Component ═══
// Suspense wrapper for useSearchParams
export default function ClientPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-theme">
        <div className="gold-gradient-line" />
        <NavBar />
        <div className="max-w-lg mx-auto px-6 pt-32 text-center">
          <div className="inline-block w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-theme-muted mt-4 text-sm">Loading portal...</p>
        </div>
      </div>
    }>
      <ClientPortal />
    </Suspense>
  );
}

function ClientPortal() {
  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';

  const [ref, setRef] = useState(refFromUrl);
  const [inputRef, setInputRef] = useState(refFromUrl);
  const [caseData, setCaseData] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesCompleted, setModulesCompleted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vis, setVis] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationInput, setVerificationInput] = useState('');
  const [pendingCaseData, setPendingCaseData] = useState(null);
  const verifiedRef = useRef(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setVis(true);
  }, []);

  const fetchCase = useCallback(async (caseRef) => {
    if (!caseRef || caseRef.length < 10) {
      setError('Please enter at least 10 characters of your tracking code.');
      return;
    }

    setLoading(true);
    setError('');

    // Only reset case data on initial lookup, not during poll refreshes
    if (!verifiedRef.current) {
      setCaseData(null);
      setModules([]);
    }

    try {
      // If already verified, use GET for status polling; otherwise show verification form
      if (verifiedRef.current) {
        const res = await fetch(`/api/portal?ref=${encodeURIComponent(caseRef.trim())}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Unable to refresh case status.');
          setLoading(false);
          return;
        }
        // Merge status-only data with existing full data for stage/polling
        setCaseData(prev => prev ? { ...prev, status: data.case?.status, modules_completed: data.case?.modules_completed } : prev);
        setModules(data.modules || []);
        setModulesCompleted(data.modulesCompleted || 0);
      } else {
        // First load — check if case exists (GET returns status only, no PII)
        const res = await fetch(`/api/portal?ref=${encodeURIComponent(caseRef.trim())}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Case not found. This could happen if: (1) The tracking code is incorrect — please check and try again, (2) Your submission is being processed — please wait a few minutes and try again, (3) If the issue persists, contact us on WhatsApp.');
          setLoading(false);
          return;
        }
        // Case exists — store status info and require verification
        setPendingCaseData(data);
        setNeedsVerification(true);
      }
    } catch (e) {
      setError('Connection error. Please check your internet and try again.');
    }

    setLoading(false);
  }, []);

  // Auto-fetch if ref is in URL
  useEffect(() => {
    if (refFromUrl && refFromUrl.length >= 10) {
      setRef(refFromUrl);
      setInputRef(refFromUrl);
      fetchCase(refFromUrl);
    }
  }, [refFromUrl, fetchCase]);

  // Poll for updates every 15s while case is in progress
  useEffect(() => {
    if (!caseData || !ref) return;
    const stage = determineStage(caseData, modulesCompleted);
    if (stage >= 4) return; // no need to poll once findings ready or beyond

    const interval = setInterval(() => {
      fetchCase(ref);
    }, 15000);

    return () => clearInterval(interval);
  }, [caseData, modulesCompleted, ref, fetchCase]);

  const handleLookup = (e) => {
    e.preventDefault();
    const trimmed = inputRef.trim().toUpperCase();
    setRef(trimmed);
    // Update URL without reload
    window.history.replaceState(null, '', `/portal?ref=${trimmed}`);
    fetchCase(trimmed);
  };

  async function handleVerification() {
    const input = verificationInput.trim();
    if (!input || input.length !== 4 || !/^\d{4}$/.test(input)) {
      setError('Please enter exactly 4 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: ref.trim(), phone4: input }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check and try again.');
        setLoading(false);
        return;
      }

      // Verification passed — set full case data
      verifiedRef.current = true;
      setCaseData(data.case);
      setModules(data.modules || []);
      setModulesCompleted(data.modulesCompleted || 0);
      setNeedsVerification(false);
      setPendingCaseData(null);
      setVerificationInput('');
      setError('');
    } catch (e) {
      setError('Connection error. Please try again.');
    }

    setLoading(false);
  }

  const stage = caseData ? determineStage(caseData, modulesCompleted) : 0;
  const findings = caseData ? computeFindings(caseData.intake_data, caseData.fy) : null;
  const completedModuleIds = modules.filter(m => m.has_output).map(m => m.module_id);
  const isDark = theme === 'dark';

  // ═══ Render: Verification Step ═══
  if (needsVerification && !caseData) {
    return (
      <div className="min-h-screen bg-theme">
        <div className="gold-gradient-line" />
        <NavBar />
        <div className={`max-w-lg mx-auto px-6 pt-20 pb-16 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="card-theme p-8 text-center shadow-sm">
            <div className="text-3xl mb-3">{'\uD83D\uDD12'}</div>
            <h3 className="font-serif text-xl font-bold text-theme mb-2">Verify Your Identity</h3>
            <p className="text-sm text-theme-secondary mb-6">
              For your security, please enter the last 4 digits of your registered phone number.
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={verificationInput}
              onChange={e => setVerificationInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Last 4 digits of phone"
              maxLength={4}
              className="input-theme py-3 px-4 max-w-xs mx-auto text-center text-lg tracking-wider"
              autoFocus
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
            <button onClick={handleVerification} className="btn-primary mt-4 mx-auto block py-3 px-8">
              Verify & View Case
            </button>
            <button
              onClick={() => {
                setNeedsVerification(false);
                setPendingCaseData(null);
                setVerificationInput('');
                setError('');
              }}
              className="mt-4 text-xs text-theme-muted hover:text-theme-accent transition"
            >
              Back to lookup
            </button>
          </div>
        </div>
        <ContactBar />
        <Footer />
      </div>
    );
  }

  // ═══ Render: Lookup Form (no case loaded) ═══
  if (!caseData && !loading) {
    return (
      <div className="min-h-screen bg-theme">
        <div className="gold-gradient-line" />
        <NavBar />
        <div className={`max-w-lg mx-auto px-6 pt-20 pb-16 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center mb-10">
            <div className="text-4xl mb-4">{'\uD83D\uDD0D'}</div>
            <h1 className="font-serif text-3xl font-bold text-theme mb-2">Track Your Case</h1>
            <p className="text-theme-secondary">Enter the case reference you received after submitting your intake.</p>
          </div>

          <form onSubmit={handleLookup} className="card-theme p-8 shadow-sm">
            <label className="block text-xs font-semibold text-theme-muted mb-2 uppercase tracking-wide">
              Case Reference
            </label>
            <input
              type="text"
              value={inputRef}
              onChange={e => setInputRef(e.target.value.toUpperCase())}
              placeholder="e.g. ABCD1234EFGH5678IJKL9012"
              maxLength={30}
              className="input-theme text-lg font-mono tracking-widest text-center"
              autoFocus
            />
            <p className="text-[10px] text-theme-muted mt-2 text-center">
              Enter your 24-character tracking code
            </p>

            {error && (
              <div className="mt-4 rounded-lg px-4 py-3 text-sm" style={{
                background: 'rgba(160,72,72,0.08)',
                border: '1px solid rgba(160,72,72,0.2)',
                color: 'var(--red)',
              }}>
                {error}
                {error.includes('not found') && (
                  <span className="block mt-1">
                    <a href="/client" className="underline font-semibold" style={{ color: 'var(--red)' }}>Submit a new intake</a>
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={inputRef.trim().length < 10}
              className="btn-primary w-full mt-6 py-3"
            >
              Look Up My Case
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-xs text-theme-muted">
              Do not have a reference? <a href="/client" className="text-theme-accent font-semibold hover:underline">Start your intake here</a>
            </p>
          </div>
        </div>
        <ContactBar />
        <Footer />
      </div>
    );
  }

  // ═══ Render: Loading ═══
  if (loading && !caseData) {
    return (
      <div className="min-h-screen bg-theme">
        <div className="gold-gradient-line" />
        <NavBar />
        <div className="max-w-lg mx-auto px-6 pt-32 text-center">
          <div className="inline-block w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-theme-muted mt-4 text-sm">Looking up your case...</p>
        </div>
      </div>
    );
  }

  // ═══ Render: Portal Dashboard ═══
  return (
    <div className="min-h-screen bg-theme pb-24">
      <div className="gold-gradient-line" />
      <NavBar />

      <div className={`max-w-3xl mx-auto px-5 md:px-8 pt-8 pb-16 transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Case ref header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-theme-muted font-semibold uppercase tracking-wide">Case Reference</div>
            <div className="font-mono text-lg font-bold text-theme tracking-wider">
              {(caseData.id || '').slice(0, 8).toUpperCase()}
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-theme-muted">
              <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
              Refreshing...
            </div>
          )}
        </div>

        {/* -- Section 1: Case Summary Card -- */}
        <div className="card-theme p-6 md:p-8 shadow-sm mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-theme">{caseData.client_name || 'Client'}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-theme-secondary">
                <span>{caseData.country}</span>
                <span className="text-theme-muted">|</span>
                <span>FY {caseData.fy} (AY {caseData.ay})</span>
                <span className="text-theme-muted">|</span>
                <span>Submitted {formatDate(caseData.created_at)}</span>
              </div>
            </div>
            {caseData.classification && (
              <div
                className="text-sm font-bold px-5 py-2 rounded-full whitespace-nowrap self-start"
                style={{
                  background: (CLS_COLORS[caseData.classification] || '#999') + '15',
                  color: CLS_COLORS[caseData.classification] || '#999',
                  border: `2px solid ${(CLS_COLORS[caseData.classification] || '#999')}40`,
                }}
              >
                {caseData.classification} Case
              </div>
            )}
          </div>
          {caseData.classification && (
            <p className="text-xs text-theme-muted mt-3">{CLS_MEANINGS[caseData.classification]}</p>
          )}
        </div>

        {/* -- Section 2: Process Timeline (hero) -- */}
        <div className="card-theme p-6 md:p-8 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <h3 className="font-serif text-lg font-bold text-theme mb-6">Your Case Progress</h3>
          <div className="relative stagger-children">
            {STAGES.map((s, i) => {
              const stageNum = i + 1;
              const isCompleted = stageNum < stage;
              const isCurrent = stageNum === stage;
              const isFuture = stageNum > stage;

              return (
                <div key={s.key} className="flex gap-4 mb-1 last:mb-0 animate-fade-in-up">
                  {/* Vertical line + circle */}
                  <div className="flex flex-col items-center" style={{ minWidth: 40 }}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all duration-500 ${
                        isCurrent ? 'animate-pulse-gold' : ''
                      }`}
                      style={{
                        background: isCompleted ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--border)',
                        color: isCompleted || isCurrent ? '#fff' : 'var(--text-muted)',
                      }}
                      role="img"
                      aria-label={isCompleted ? 'Completed' : isCurrent ? 'In progress' : 'Pending'}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm">{s.icon}</span>
                      )}
                    </div>
                    {/* Connector line */}
                    {i < STAGES.length - 1 && (
                      <div
                        className="w-0.5 flex-1 my-1 rounded-full transition-all duration-500"
                        style={{
                          minHeight: 24,
                          background: isCompleted ? 'var(--green)' : 'var(--border)',
                        }}
                      />
                    )}
                  </div>

                  {/* Label + description */}
                  <div className={`pt-2 pb-4 ${isFuture ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${isCurrent ? 'text-theme-accent' : isCompleted ? 'text-theme' : 'text-theme-muted'}`}>
                        {s.label}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                          color: 'var(--accent)',
                          background: 'rgba(196,154,60,0.1)',
                        }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-theme-secondary mt-0.5 leading-relaxed">{s.desc}</p>
                    {isCompleted && getStageTimestamp(s.key, caseData, modules) && (
                      <p className="text-[10px] text-theme-muted mt-1">
                        Completed {formatDate(getStageTimestamp(s.key, caseData, modules))}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* -- Section 3: Key Findings (stage 3+) -- */}
        {stage >= 3 && findings && (
          <div className="card-theme p-6 md:p-8 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <h3 className="font-serif text-lg font-bold text-theme mb-5">Key Findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {findings.cgSavings > 0 && (
                <FindingCard
                  label="Tax Savings Identified"
                  value={`${formatINR(findings.cgSavings)} savings via Option ${findings.cgBetter}`}
                  accent="var(--green)"
                  bg="rgba(42,107,74,0.06)"
                  border="rgba(42,107,74,0.2)"
                />
              )}
              {findings.tdsRefund > 0 && (
                <FindingCard
                  label="Estimated TDS Refund"
                  value={`${formatINR(findings.tdsRefund)} refund expected`}
                  accent="var(--green)"
                  bg="rgba(42,107,74,0.06)"
                  border="rgba(42,107,74,0.2)"
                />
              )}
              <FindingCard
                label="Residency Status"
                value={findings.residencyStatus}
                accent="var(--text-primary)"
                bg="var(--bg-primary)"
                border="var(--border)"
              />
              {caseData.classification && (
                <FindingCard
                  label="Service Tier"
                  value={
                    caseData.classification === 'Green'
                      ? 'Basic Filing'
                      : caseData.classification === 'Amber'
                      ? 'Advisory Filing'
                      : 'Premium Compliance'
                  }
                  accent={CLS_COLORS[caseData.classification]}
                  bg={(CLS_COLORS[caseData.classification]) + '08'}
                  border={(CLS_COLORS[caseData.classification]) + '30'}
                />
              )}
            </div>
          </div>
        )}

        {/* -- Section 4: What We're Doing (modules) -- */}
        {(() => {
          const visibleModules = MODULE_NAMES.filter(m => m.label !== null);
          const visibleCompleted = visibleModules.filter(m => completedModuleIds.includes(m.id));
          return (
            <div className="card-theme p-6 md:p-8 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg font-bold text-theme">What We Are Doing</h3>
                <span className="text-xs text-theme-muted font-semibold">
                  {visibleCompleted.length} of {visibleModules.length} complete
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full mb-6 overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.round((visibleCompleted.length / visibleModules.length) * 100)}%`,
                    background: visibleCompleted.length === visibleModules.length ? 'var(--green)' : 'var(--accent)',
                  }}
                />
              </div>

              <div className="space-y-3">
                {visibleModules.map((mod, i) => {
                  const isComplete = completedModuleIds.includes(mod.id);
                  // Current module = first incomplete visible module
                  const isCurrent = !isComplete && visibleCompleted.length === i && stage <= 3;
                  const isFuture = !isComplete && !isCurrent;

                  return (
                    <div
                      key={mod.id}
                      className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-colors`}
                      style={{
                        background: isCurrent ? 'rgba(196,154,60,0.08)' : 'transparent',
                      }}
                    >
                      {/* Status indicator */}
                      <div className="pt-0.5">
                        {isComplete ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--green)' }}>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isCurrent ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: '2px solid var(--accent)' }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: 'var(--border)' }} />
                        )}
                      </div>

                      {/* Module name + description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            isComplete ? 'text-theme font-medium' :
                            isCurrent ? 'text-theme-accent font-semibold' :
                            'text-theme-muted'
                          }`}>
                            {mod.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-theme-accent font-semibold ml-auto flex-shrink-0">In progress...</span>
                          )}
                        </div>
                        {isComplete && MODULE_DESCRIPTIONS[mod.id] && (
                          <p className="text-xs text-theme-secondary mt-0.5 leading-relaxed">
                            {MODULE_DESCRIPTIONS[mod.id]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* -- Section 5: Documents Shared (stage 4+) -- */}
        {stage >= 4 && (
          <div className="card-theme p-6 md:p-8 shadow-sm mb-6 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <h3 className="font-serif text-lg font-bold text-theme mb-4">Documents</h3>
            {stage >= 6 ? (
              <div>
                <p className="text-sm text-theme-muted mb-4">Your tax computation documents are ready. Your advisor will share them via WhatsApp or email.</p>
                <div className="space-y-2 mb-4">
                  {['CG Computation Sheet', 'Client Advisory Memo', 'Tax Position Report'].map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span style={{ color: 'var(--green)' }}>{'\u2713'}</span>
                      <span className="text-theme">{doc}</span>
                      <span className="text-xs text-theme-muted ml-auto">Prepared</span>
                    </div>
                  ))}
                </div>
                <a href="https://wa.me/919667744073?text=Hi%2C%20my%20documents%20are%20ready.%20Please%20share%20them."
                  target="_blank" rel="noopener noreferrer"
                  className="btn-primary w-full text-center block py-2.5 rounded-lg text-sm">
                  Request Documents via WhatsApp
                </a>
              </div>
            ) : (
              <div className="rounded-lg px-5 py-6 text-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="text-2xl mb-2">{'\uD83D\uDCC1'}</div>
                <p className="text-sm text-theme-secondary">
                  Your advisor will share documents once the review is complete.
                </p>
              </div>
            )}
          </div>
        )}

        {/* While You Wait — Suggested Reading */}
        <div className="card-theme p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
          <h3 className="font-serif text-base font-bold text-theme mb-3">While You Wait — Learn More</h3>
          <div className="space-y-2">
            {caseData?.intake_data?.propertySale && (
              <a href="/blog/nri-property-sale-capital-gains" className="block text-sm text-theme-accent hover:underline">
                {'\u2192'} How NRI Property Sale Capital Gains Are Computed
              </a>
            )}
            {caseData?.country && (
              <a href={`/blog/${caseData.country.toLowerCase().replace(/\s+/g,'-')}-nri-tax-guide`} className="block text-sm text-theme-accent hover:underline">
                {'\u2192'} Tax Guide for NRIs in {caseData.country}
              </a>
            )}
            <a href="/blog/nri-income-tax-filing-guide" className="block text-sm text-theme-accent hover:underline">
              {'\u2192'} Complete Guide to NRI Tax Filing in India
            </a>
          </div>
        </div>

        {/* -- Section 6: What Happens Next -- */}
        <div className="card-theme-gold-left p-6 md:p-8 mb-6 animate-fade-in-up" style={{ animationDelay: '340ms' }}>
          <h3 className="font-serif text-lg font-bold text-theme mb-3">What Happens Next</h3>
          <p className="text-sm text-theme-secondary leading-relaxed">
            {NEXT_STEPS[stage] || NEXT_STEPS[1]}
          </p>
          {stage <= 2 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-theme-muted">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              This page updates automatically every 15 seconds
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-theme-muted">This page auto-refreshes every 15 seconds. Bookmark it to check anytime.</p>
          </div>
        </div>
      </div>

      <ContactBar />
      <Footer />
    </div>
  );
}

// ═══ Sub-components ═══

function Nav({ isDark, toggleTheme }) {
  return (
    <nav className="bg-theme-nav px-6 md:px-12 h-14 flex items-center justify-between">
      <a href="/" className="logo-gold-underline font-serif text-theme-accent font-bold tracking-wide">
        NRI TAX SUITE
      </a>
      <div className="flex gap-3 items-center">
        <a href="/client" className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>New Intake</a>
        <a href="/portal" className="text-theme-accent text-sm font-semibold">Track Case</a>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 hover:scale-110 ml-2"
          style={{
            background: 'rgba(196,154,60,0.15)',
            color: 'var(--accent)',
          }}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>
      </div>
    </nav>
  );
}

function TrustBar() {
  return (
    <div className="bg-theme-nav text-center py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="text-[11px] text-theme-muted tracking-wide">
        MKW Advisors &mdash; CA &middot; CS &middot; CMA Certified &nbsp;|&nbsp; Trusted by 500+ NRIs
      </span>
    </div>
  );
}

function FindingCard({ label, value, accent, bg, border }) {
  return (
    <div
      className="rounded-xl p-5 border transition-colors"
      style={{ background: bg, borderColor: border }}
    >
      <div className="text-xs text-theme-muted font-semibold uppercase tracking-wide mb-1">{label}</div>
      <div className="font-bold text-base" style={{ color: accent }}>{value}</div>
    </div>
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
        <a
          href="mailto:tax@mkwadvisors.com"
          className="transition text-xs" style={{ color: 'var(--text-on-dark)' }}
        >
          tax@mkwadvisors.com
        </a>
        <a
          href="tel:+919667744073"
          className="transition text-xs" style={{ color: 'var(--text-on-dark)' }}
        >
          +91-96677 44073
        </a>
      </div>
    </div>
  );
}

// ═══ Utilities ═══

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function getStageTimestamp(stageKey, caseData, modules) {
  if (!caseData) return null;

  switch (stageKey) {
    case 'intake':
      return caseData.created_at;
    case 'analysis': {
      // First module completion timestamp
      const sorted = modules.filter(m => m.has_output).sort((a, b) =>
        new Date(a.completed_at) - new Date(b.completed_at)
      );
      return sorted.length > 0 ? sorted[sorted.length - 1]?.completed_at : null;
    }
    case 'review':
      // When all modules completed or status changed to review
      if (caseData.status === 'review' || caseData.status === 'findings_ready' ||
          caseData.status === 'filing' || caseData.status === 'filed' || caseData.status === 'closed') {
        const sorted = modules.filter(m => m.has_output).sort((a, b) =>
          new Date(a.completed_at) - new Date(b.completed_at)
        );
        return sorted.length > 0 ? sorted[sorted.length - 1]?.completed_at : null;
      }
      return null;
    case 'findings_ready':
      return caseData.status === 'findings_ready' || caseData.status === 'filing' ||
             caseData.status === 'filed' || caseData.status === 'closed'
        ? caseData.updated_at
        : null;
    case 'filing':
      return caseData.status === 'filing' || caseData.status === 'filed' || caseData.status === 'closed'
        ? caseData.updated_at
        : null;
    case 'filed':
      return caseData.status === 'filed' || caseData.status === 'closed'
        ? caseData.updated_at
        : null;
    default:
      return null;
  }
}
