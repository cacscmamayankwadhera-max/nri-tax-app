'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/app/theme-provider';
import { computeCapitalGains, formatINR, classifyCase, FY_CONFIG, CII, getDTAARate } from '@/lib/compute';
import { CheckCircle, User, Mail, Phone } from 'lucide-react';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

const COUNTRIES = ["United Kingdom","United States","UAE","Singapore","Canada","Australia","Germany","Saudi Arabia","Qatar","Hong Kong","New Zealand","Other"];

const COUNTRY_INSIGHTS = {
  'United Kingdom': [
    'DTAA rate: 15% on interest (vs 30% default) -- you may be overpaying TDS',
    'UK self-assessment deadline is Jan 31 -- but Indian ITR due Jul 31',
    'UK CGT on Indian property must be reported within 60 days of sale',
  ],
  'United States': [
    'FBAR filing required if Indian accounts exceed $10,000 aggregate',
    'Indian mutual funds are classified as PFICs -- special US reporting needed',
    'DTAA rate: 15% on interest and dividends',
  ],
  'UAE': [
    'No income tax in UAE -- but DTAA credit mechanism has limited application',
    'Tax Residency Certificate (TRC) from UAE confirms non-residency for India',
    'NRO interest still taxed at 30% in India -- no UAE offset available',
  ],
  'Singapore': [
    'No capital gains tax in Singapore -- no FTC needed for most NRIs',
    'DTAA rate: 15% on interest -- claim this to reduce TDS',
    'CPF contributions have specific treatment when returning to India',
  ],
  'Canada': [
    'Departure tax: deemed disposition on emigration -- plan before moving',
    'T1135 foreign property reporting for Indian assets over CAD $100K',
    'DTAA rate: 15% on interest and dividends',
  ],
  'Australia': [
    'CGT discount (50%) does NOT apply to non-residents selling Indian property',
    'Superannuation has specific treatment under India-Australia DTAA',
    'DTAA rate: 15% on interest and dividends',
  ],
  'Germany': [
    'Worldwide income taxed in Germany -- Indian income must be declared',
    'DTAA rate: 10% on interest -- significant reduction from 30% default',
    'Progressionsvorbehalt: Indian income can affect your German tax bracket',
  ],
  'Saudi Arabia': [
    'No personal income tax in Saudi Arabia -- similar to UAE position',
    'No DTAA with India -- Section 91 unilateral relief may apply',
    'NRO interest taxed at full 30% in India -- no treaty benefit available',
  ],
  'Qatar': [
    'No personal income tax in Qatar -- no FTC offset for Indian tax',
    'DTAA rate: 10% on interest and dividends -- claim this benefit',
    'Tax Residency Certificate from Qatar needed for DTAA claims',
  ],
  'Hong Kong': [
    'Territorial taxation in HK -- only HK-source income taxed there',
    'DTAA rate: 10% on interest -- reduces your TDS significantly',
    'No CGT in Hong Kong -- no foreign tax credit for Indian capital gains',
  ],
  'New Zealand': [
    'Transitional resident exemption may apply for first 4 years',
    'DTAA rate: 10% on interest -- claim this to reduce TDS',
    'FIF rules: Indian investments over NZD $50K need annual reporting',
  ],
  '_default': [
    'NRIs pay tax only on India-sourced income -- foreign salary is NOT taxable',
    'Section 195 TDS at 20% on property sales -- often refundable',
    'Standard deduction of Rs.75,000 available under new regime if Indian salary exists',
  ],
};

const SCENARIOS = [
  { id: 'propertySale', icon: '\uD83C\uDFE0', title: 'Sold or selling property', hook: 'Most NRIs overpay Rs.2-8L on property tax', color: '#2A6B4A' },
  { id: 'rent', icon: '\uD83C\uDFE2', title: 'Earning rent from India', hook: '30% standard deduction -- are you claiming it?', color: '#B07D3A' },
  { id: 'interest', icon: '\uD83D\uDCB0', title: 'NRO/FD interest', hook: 'Banks deduct 30% TDS -- your DTAA rate may be 10-15%', color: '#5670A8' },
  { id: 'esopRsu', icon: '\uD83D\uDCCA', title: 'ESOP/RSU from employer', hook: 'Two-stage taxation -- most get this wrong', color: '#7B5FA0' },
  { id: 'filing', icon: '\uD83D\uDCCB', title: 'Need to file ITR', hook: 'NRIs must file if Indian income exceeds Rs.4L', color: '#3D7D8F' },
  { id: 'notSure', icon: '\uD83E\uDD37', title: "I'm not sure", hook: 'Describe your situation -- AI will help', color: '#9ca3af' },
];

// ---- Reusable form input at module scope to avoid remounts ----
const Input = ({ label, value, onChange, placeholder, type, tip, wide }) => (
  <div className={wide ? 'col-span-full' : ''}>
    <label className="block text-xs font-semibold text-theme-muted mb-1.5 uppercase tracking-wide">{label}</label>
    <input
      type={type || 'text'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-theme py-3 px-4 w-full"
    />
    {tip && <p className="text-[10px] text-theme-muted mt-1">{tip}</p>}
  </div>
);

const Select = ({ label, value, onChange, options, placeholder, tip }) => (
  <div>
    <label className="block text-xs font-semibold text-theme-muted mb-1.5 uppercase tracking-wide">{label}</label>
    <select value={value || ''} onChange={e => onChange(e.target.value)} className="input-theme py-3 px-4 w-full">
      <option value="">{placeholder || 'Select'}</option>
      {options.map(x => typeof x === 'string'
        ? <option key={x} value={x}>{x}</option>
        : <option key={x.v} value={x.v}>{x.l}</option>
      )}
    </select>
    {tip && <p className="text-[10px] text-theme-muted mt-1">{tip}</p>}
  </div>
);

// ---- Helper: contextual CTA text ----
function getContextualCTA(f) {
  if (f.propertySale) return 'Get Your CG Computation + Refund Estimate';
  if (f.rent) return 'Get Your HP Tax Position';
  if (f.esopRsu) return 'Get Your ESOP Tax Breakdown';
  return 'Get Your Tax Diagnostic';
}

// ---- Helper: classification description ----
function getClassificationDesc(cls) {
  if (cls === 'Green') return 'Straightforward filing -- fast turnaround';
  if (cls === 'Amber') return 'Moderate complexity -- advisory review included';
  if (cls === 'Red') return 'Significant complexity -- premium service recommended';
  return '';
}

export default function ClientIntake() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({});
  const [fy] = useState('2025-26');

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nri-intake-draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setF(parsed);
        // If they already had a country selected, start at step 0 still (let them review)
      }
    } catch (e) { /* ignore corrupt data */ }
  }, []);

  // Save draft to localStorage on every change
  useEffect(() => {
    if (Object.keys(f).length > 0) {
      localStorage.setItem('nri-intake-draft', JSON.stringify(f));
    }
  }, [f]);

  const [narr, setNarr] = useState('');
  const [prs, setPrs] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseRef, setCaseRef] = useState(null);
  const [portalToken, setPortalToken] = useState(null);
  const [parseDone, setParseDone] = useState(false);
  const [fadeDir, setFadeDir] = useState('in');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const u = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Parse Indian-format numbers safely: strip commas before parsing
  const parseNum = (v, fallback = 0) => {
    const cleaned = String(v).replace(/,/g, '');
    const n = parseInt(cleaned);
    return isNaN(n) ? fallback : n;
  };

  const cfg = FY_CONFIG[fy];
  const cgData = (f.salePrice && f.purchaseCost) ? computeCapitalGains(f.salePrice, f.purchaseCost, f.propertyAcqFY || '2017-18', fy) : null;

  // Selected scenarios as a Set for quick lookup
  const selectedScenarios = useMemo(() => {
    const ids = new Set();
    SCENARIOS.forEach(s => { if (f[s.id]) ids.add(s.id); });
    return ids;
  }, [f]);

  const hasAnyScenario = selectedScenarios.size > 0;

  function goStep(n) {
    setFadeDir('out');
    setTimeout(() => {
      setStep(n);
      setFadeDir('in');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  }

  function toggleScenario(id) {
    setF(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // If "not sure" is deselected, we keep things as-is
      // If "not sure" is selected, that's fine -- it just reveals the AI textarea
      // Also set cgProperty flag when propertySale is toggled (for classifyCase compat)
      if (id === 'propertySale') {
        next.cgProperty = next.propertySale;
      }
      return next;
    });
  }

  async function doParse() {
    if (!narr.trim()) return;
    setPrs(true);
    let parsed = null;
    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrative: narr })
      });
      const data = await res.json();
      parsed = data.parsed;
      if (parsed) {
        setF(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(parsed).filter(([, v]) => v !== false && v !== '' && v !== 0)
          )
        }));
      }
    } catch (e) { /* continue manually */ }
    setPrs(false);
    setParseDone(true);
    // Auto-dismiss the success indicator after a moment
    setTimeout(() => setParseDone(false), 2000);
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    let ref = null;
    let success = false;
    try {
      const res = await fetch('/api/cases/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: f, fy, classification: classifyCase(f) })
      });
      const data = await res.json();
      if (data.success) {
        ref = data.caseRef || null;
        if (data.portalToken) setPortalToken(data.portalToken);
        success = true;
      }
    } catch (e) {
      console.error('Submission error:', e);
    }
    setCaseRef(ref);
    setSubmitting(false);
    if (success) {
      localStorage.removeItem('nri-intake-draft');
      setSubmitted(true);
    }
  }

  // Country insights for selected country
  const insights = useMemo(() => {
    if (!f.country) return [];
    return COUNTRY_INSIGHTS[f.country] || COUNTRY_INSIGHTS['_default'];
  }, [f.country]);

  // DTAA data for interest preview
  const dtaaData = useMemo(() => {
    if (!f.country) return null;
    return getDTAARate(f.country);
  }, [f.country]);

  const stepLabels = ['Where are you?', "What's happening?", 'Your preview', 'Get Your Personalized Diagnostic'];

  // ---- SUBMITTED VIEW ----
  if (submitted) {
    const cls = classifyCase(f);
    const clsColors = { Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' };
    const clsColor = clsColors[cls];
    const mailSubject = encodeURIComponent(`NRI Tax Filing \u2014 ${f.name || 'Client'} \u2014 ${cls}`);
    const mailBody = encodeURIComponent(`Hi,\n\nI just completed the intake on your platform.\n\nName: ${f.name || ''}\nCountry: ${f.country || ''}\nClassification: ${cls}\nFY: ${fy}\n\nPlease contact me to proceed.\n\nRegards,\n${f.name || ''}`);
    const waText = encodeURIComponent(`Hi, I completed the NRI Tax intake.\n\nName: ${f.name || ''}\nClassification: ${cls}\nFY: ${fy}\n\nPlease contact me to proceed.`);

    const factors = [];
    if (f.cgProperty || f.propertySale) factors.push('Property sale detected');
    if (f.esopRsu) factors.push('ESOP/RSU income');
    if (f.foreignTaxPaid) factors.push('Foreign tax paid \u2014 DTAA review needed');
    if (f.interest) factors.push('NRO/FD interest \u2014 TDS optimization');
    if (f.rent) factors.push('Rental income \u2014 HP deductions');

    const timelineText = {
      Green: 'Estimated completion: 5-7 business days',
      Amber: 'Estimated completion: 8-12 business days',
      Red: 'Premium handling: 10-15 business days'
    };

    return (
      <div className="min-h-screen bg-theme">
        <NavBar />

        <div className="max-w-2xl mx-auto py-10 px-5 md:px-6 animate-fade-in-up">
          {/* Celebration animation */}
          <div className="text-center mb-6 p-4 md:p-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ background: 'color-mix(in srgb, var(--green) 15%, var(--bg-primary))', animation: 'pulse-gold 2s ease-in-out' }}>
              <CheckCircle size={40} style={{ color: 'var(--green)' }} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-theme mb-2">Assessment Complete!</h2>
            <p className="text-theme-muted text-sm">Your case has been submitted to our tax desk</p>
          </div>

          {/* AI Analysis in Progress notice */}
          <div className="card-theme p-4 mb-6 text-center" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
            <p className="text-sm font-medium text-theme mb-1">AI Analysis in Progress</p>
            <p className="text-xs text-theme-muted">Our 9 specialist modules are analyzing your case. This typically takes 2-5 minutes.</p>
            <p className="text-xs text-theme-muted mt-2">You will receive a WhatsApp notification when your findings are ready.</p>
          </div>

          {/* Case reference link for portal tracking */}
          {portalToken && (
            <div className="card-theme p-6 mb-6 text-center" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
              <div className="text-sm font-semibold text-theme-accent mb-1">Your Tracking Code</div>
              <div className="font-mono text-2xl font-bold text-theme tracking-wider mb-2 flex items-center justify-center">
                {portalToken}
                <button onClick={() => {
                  navigator.clipboard.writeText(portalToken);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }} className="text-xs text-theme-accent hover:underline ml-2">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <a href={`/portal?ref=${portalToken}`} className="text-theme-accent text-sm underline">Track your case status {'\u2192'}</a>
              <p className="text-xs text-theme-muted mt-2">Save this code to check your case progress anytime</p>
            </div>
          )}
          {!portalToken && (
            <div className="card-theme p-5 mb-6 text-center">
              <p className="text-sm font-medium text-theme mb-2">We've Received Your Details</p>
              <p className="text-xs text-theme-muted">Our team will reach out to you at {f.email || f.phone || 'the contact you provided'} within 24 hours to get started.</p>
              <p className="text-xs text-theme-muted mt-2">To track your case later, visit <a href="/my-cases" className="text-theme-accent underline">My Cases</a> using your email.</p>
            </div>
          )}

          {/* Hero savings or completion banner */}
          {cgData ? (
            <div className="text-center mb-10">
              <div className="inline-block rounded-2xl px-10 py-8 mb-4" style={{ background: 'color-mix(in srgb, var(--green) 8%, var(--bg-card))', border: '2px solid color-mix(in srgb, var(--green) 30%, transparent)' }}>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--green)' }}>Potential Tax Savings Identified</div>
                <div className="font-serif text-5xl font-bold tracking-tight" style={{ color: 'var(--green)' }}>{formatINR(cgData.savings)}</div>
                <div className="text-sm mt-2" style={{ color: 'var(--green)' }}>Option {cgData.better} is more favourable for you</div>
              </div>
              <h1 className="font-serif text-3xl font-bold text-theme mt-4">Your Tax Diagnostic is Ready</h1>
              <p className="text-theme-secondary mt-2">Here is what we found from your intake</p>
            </div>
          ) : (
            <div className="text-center mb-10">
              <h1 className="font-serif text-3xl font-bold text-theme">Your Tax Diagnostic is Ready</h1>
              <p className="text-theme-secondary mt-2">Here is what we found from your intake</p>
            </div>
          )}

          {/* Classification card */}
          <div className="card-theme p-8 mb-5">
            <div className="flex justify-between items-center mb-4">
              <div className="font-serif text-xl font-bold text-theme">Case Classification</div>
              <span className="text-xl font-bold px-8 py-2 rounded-full" style={{
                background: `color-mix(in srgb, ${clsColor} 10%, var(--bg-card))`,
                color: clsColor,
                border: `2px solid color-mix(in srgb, ${clsColor} 25%, transparent)`
              }}>{cls}</span>
            </div>
            <p className="text-sm text-theme-secondary leading-relaxed">
              {cls === 'Green' && 'Your case appears straightforward. Simple filing with limited complexity.'}
              {cls === 'Amber' && 'Your case has moderate complexity \u2014 advisory review recommended alongside filing.'}
              {cls === 'Red' && 'Your case involves significant complexity \u2014 premium compliance service recommended.'}
            </p>
            {factors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {factors.map((factor, i) => (
                  <span key={i} className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{
                    background: `color-mix(in srgb, ${clsColor} 10%, var(--bg-card))`,
                    color: clsColor,
                    border: `1px solid color-mix(in srgb, ${clsColor} 20%, transparent)`
                  }}>{factor}</span>
                ))}
              </div>
            )}
            <div className="mt-4 text-xs font-medium" style={{ color: clsColor }}>
              {timelineText[cls]}
            </div>
          </div>

          {/* CG Analysis */}
          {cgData && (
            <div className="rounded-2xl p-8 mb-5" style={{ background: 'color-mix(in srgb, var(--green) 6%, var(--bg-card))', border: '1px solid color-mix(in srgb, var(--green) 25%, transparent)' }}>
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: 'var(--green)' }}>Capital Gains Analysis Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-theme-card rounded-xl p-4 border-theme border">
                  <div className="text-xs text-theme-muted mb-1">Option A (20% with indexation)</div>
                  <div className="font-bold text-xl text-theme">{formatINR(cgData.optionA.total)}</div>
                </div>
                <div className="bg-theme-card rounded-xl p-4 border-theme border">
                  <div className="text-xs text-theme-muted mb-1">Option B (12.5% flat)</div>
                  <div className="font-bold text-xl text-theme">{formatINR(cgData.optionB.total)}</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl p-4 text-center" style={{ background: 'color-mix(in srgb, var(--green) 12%, var(--bg-card))' }}>
                <div className="font-bold" style={{ color: 'var(--green)' }}>Option {cgData.better} saves you {formatINR(cgData.savings)}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--green)' }}>Plus Section 54/54EC could reduce this further or eliminate it entirely</div>
              </div>
            </div>
          )}

          {/* What You'll Get */}
          <div className="card-theme p-8 mb-5">
            <h3 className="font-serif text-xl font-bold text-theme mb-5">What You Will Get</h3>
            <div className="grid grid-cols-2 gap-4 stagger-children">
              {[
                ['\uD83D\uDCC4', 'CG Computation Sheet', 'Dual-option working with indexation comparison'],
                ['\uD83D\uDCDD', 'Client Advisory Memo', 'Professional analysis of your tax position'],
                ['\uD83D\uDCC8', 'Tax Position Report', 'Full diagnostic summary with recommendations'],
                ['\uD83D\uDCCB', 'Engagement Quote', 'Clear scope, timeline & transparent pricing']
              ].map(([icon, title, desc], i) => (
                <div key={i} className="bg-theme rounded-xl p-4 border border-theme animate-fade-in-up">
                  <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
                  <div className="font-semibold text-sm text-theme">{title}</div>
                  <div className="text-xs text-theme-muted mt-1 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Service */}
          <div className="card-theme p-8 mb-5">
            <h3 className="font-serif text-xl font-bold text-theme mb-4">Recommended Service</h3>
            {cls === 'Green' && (
              <div>
                <div className="text-lg font-bold text-theme mb-1">Basic Filing</div>
                <div className="text-theme-accent font-bold text-xl mb-3">{'\u20B9'}8,000 &ndash; {'\u20B9'}15,000</div>
                <ul className="text-sm text-theme-secondary space-y-1.5">
                  <li>{'\u2022'} Return preparation and filing</li>
                  <li>{'\u2022'} Income computation summary</li>
                  <li>{'\u2022'} Basic compliance check</li>
                </ul>
              </div>
            )}
            {cls === 'Amber' && (
              <div>
                <div className="text-lg font-bold text-theme mb-1">Advisory Filing</div>
                <div className="text-theme-accent font-bold text-xl mb-3">{'\u20B9'}18,000 &ndash; {'\u20B9'}30,000</div>
                <ul className="text-sm text-theme-secondary space-y-1.5">
                  <li>{'\u2022'} Return preparation and filing</li>
                  <li>{'\u2022'} Advisory review of your position</li>
                  <li>{'\u2022'} Residency status analysis</li>
                  <li>{'\u2022'} Structured advisory note</li>
                  <li>{'\u2022'} DTAA benefit review</li>
                </ul>
              </div>
            )}
            {cls === 'Red' && (
              <div>
                <div className="text-lg font-bold text-theme mb-1">Premium Compliance</div>
                <div className="text-theme-accent font-bold text-xl mb-3">{'\u20B9'}35,000 &ndash; {'\u20B9'}75,000</div>
                <ul className="text-sm text-theme-secondary space-y-1.5">
                  <li>{'\u2022'} Detailed review by senior practitioner</li>
                  <li>{'\u2022'} Dual capital gains computation</li>
                  <li>{'\u2022'} DTAA analysis and foreign tax credit</li>
                  <li>{'\u2022'} Section 54/54EC planning</li>
                  <li>{'\u2022'} Comprehensive advisory memo</li>
                  <li>{'\u2022'} Return filing and compliance</li>
                </ul>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl p-8 text-center mb-5" style={{ background: 'color-mix(in srgb, var(--accent) 8%, var(--bg-card))', border: '2px solid var(--accent)' }}>
            <h3 className="font-serif text-2xl font-bold text-theme mb-2">Ready to Proceed?</h3>
            <p className="text-sm text-theme-secondary mb-6">Our team will review your intake and prepare a detailed engagement scope within 24 hours.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href={`mailto:tax@mkwadvisors.com?subject=${mailSubject}&body=${mailBody}`}
                className="btn-premium px-8 py-3 rounded-xl text-sm inline-block no-underline">
                Email Us to Proceed {'\u2192'}
              </a>
              <a href={`https://wa.me/919667744073?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="px-8 py-3 rounded-xl font-bold text-sm inline-block transition-all no-underline" style={{ background: 'var(--green)', color: '#fff' }}>
                WhatsApp Us
              </a>
            </div>
            <p className="text-sm text-theme-muted mt-4">Or call: <strong>+91-96677 44073</strong></p>
          </div>

          {/* Confidentiality footer */}
          <div className="text-center py-6 border-t border-theme mt-8">
            <p className="text-xs text-theme-muted">{'\uD83D\uDD12'} Your data is encrypted and confidential. We respond within 24 hours.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ---- SMART ASSESSMENT WIZARD (4 steps: 0-3) ----
  return (
    <div className="min-h-screen bg-theme">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
        @keyframes pulse-reading { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .step-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .step-fade-out { animation: fadeOut 0.15s ease-in forwards; }
        .pulse-reading { animation: pulse-reading 1.5s ease-in-out infinite; }
        .scenario-card { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        .scenario-card:hover { transform: scale(1.02); }
        .scenario-card:active { transform: scale(0.98); }
        .insight-card { border-left: 4px solid var(--accent); }
      `}</style>

      <NavBar />

      <div className="max-w-2xl mx-auto py-8 px-5 md:px-6 page-enter">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button
            onClick={() => step > 0 ? goStep(step - 1) : (window.location.href = '/')}
            className="text-theme-muted hover:text-theme-secondary text-2xl transition-colors"
            aria-label="Go back"
          >{'\u2039'}</button>
          <div className="flex-1">
            <div className="font-serif text-xl font-bold text-theme">Smart Tax Assessment</div>
            <div className="text-xs text-theme-muted mt-0.5">Free NRI Tax Diagnostic &middot; FY {fy}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-4" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(step + 1) * 25}%`, background: 'var(--accent)' }}
          />
        </div>
        <p className="text-center text-xs text-theme-muted mb-8">{stepLabels[step]}</p>

        {/* Step content with transitions */}
        <div className={fadeDir === 'in' ? 'step-fade-in' : 'step-fade-out'}>

        {/* ====== STEP 0: Where are you? ====== */}
        {step === 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-theme mb-2">Where do you live?</h2>
              <p className="text-sm text-theme-secondary">Your country determines which tax treaty applies and how much TDS you should actually be paying.</p>
            </div>

            {/* Country grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {COUNTRIES.map(country => {
                const isSelected = f.country === country;
                return (
                  <button
                    key={country}
                    onClick={() => u('country', country)}
                    className="scenario-card rounded-xl px-3 py-4 text-sm font-medium text-center border-2 transition-all"
                    style={{
                      background: isSelected
                        ? 'color-mix(in srgb, var(--accent) 10%, var(--bg-card))'
                        : 'var(--bg-card)',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    {country}
                  </button>
                );
              })}
            </div>

            {/* Country-specific insights */}
            {f.country && insights.length > 0 && (
              <div className="insight-card card-theme p-6 mb-6 animate-fade-in-up" style={{ borderLeftColor: 'var(--accent)', borderLeftWidth: '4px' }}>
                <p className="text-xs font-bold text-theme-accent uppercase tracking-wide mb-3">
                  Tax insights for NRIs in {f.country}
                </p>
                <ul className="space-y-3">
                  {insights.map((insight, i) => (
                    <li key={i} className="flex gap-2 text-sm text-theme-secondary leading-relaxed">
                      <span className="text-theme-accent mt-0.5 shrink-0">{'\u2022'}</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Continue */}
            {f.country && (
              <button
                onClick={() => goStep(1)}
                className="btn-premium w-full py-4 rounded-xl text-base animate-fade-in-up"
              >
                Continue {'\u2192'}
              </button>
            )}
          </div>
        )}

        {/* ====== STEP 1: What's happening with your India finances this year? ====== */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-theme mb-2">What's happening with your India finances this year?</h2>
              <p className="text-sm text-theme-secondary">Select everything that applies. We will show you exactly what you can save.</p>
            </div>

            {/* Scenario cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {SCENARIOS.map(scenario => {
                const isSelected = !!f[scenario.id];
                return (
                  <button
                    key={scenario.id}
                    onClick={() => toggleScenario(scenario.id)}
                    className="scenario-card rounded-xl p-5 text-left border-2 transition-all"
                    style={{
                      background: isSelected
                        ? 'color-mix(in srgb, var(--accent) 6%, var(--bg-card))'
                        : 'var(--bg-card)',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0" aria-hidden="true">{scenario.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-theme mb-1">{scenario.title}</div>
                        <div className="text-xs text-theme-muted leading-relaxed">{scenario.hook}</div>
                      </div>
                      {isSelected && (
                        <div className="shrink-0 mt-0.5">
                          <CheckCircle size={20} style={{ color: 'var(--accent)' }} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI narrative textarea -- shown when "not sure" is selected */}
            {f.notSure && (
              <div className="card-theme p-6 mb-6 animate-fade-in-up relative overflow-hidden">
                <p className="text-sm font-semibold text-theme mb-2 typing-cursor">Describe your situation</p>
                <p className="text-xs text-theme-muted mb-4">Our AI will read your description and figure out which scenarios apply.</p>
                <textarea
                  value={narr}
                  onChange={e => setNarr(e.target.value)}
                  rows={5}
                  placeholder={"Example: I work in London since 2021, came to India for about 38 days. I sold a plot in Nashik for \u20B968 lakhs (bought in 2017 for \u20B922 lakhs). I also have a flat in Pune rented at \u20B925,000/month. NRO interest around \u20B91.4 lakhs."}
                  className="input-theme p-4 resize-y text-sm w-full"
                  disabled={prs}
                />
                {/* Parsing state */}
                {prs && (
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 6%, var(--bg-card) 90%)' }}>
                    <div className="pulse-reading text-4xl mb-3">{'\u2728'}</div>
                    <div className="font-serif text-lg font-bold text-theme-accent">Reading your situation...</div>
                    <p className="text-sm text-theme-muted mt-1">Extracting details from your description</p>
                  </div>
                )}
                {parseDone && (
                  <div className="mt-3 p-3 rounded-lg animate-fade-in-up" style={{ background: 'color-mix(in srgb, var(--green) 8%, var(--bg-card))' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--green)' }}>Fields extracted. Review the scenarios above and continue.</p>
                  </div>
                )}
                {!prs && !parseDone && narr.trim() && (
                  <button onClick={doParse} className="btn-primary mt-4 px-6 py-2.5 rounded-xl text-sm">
                    {'\u2728'} Analyze My Situation
                  </button>
                )}
              </div>
            )}

            {/* Continue */}
            {hasAnyScenario && (
              <button
                onClick={() => goStep(2)}
                className="btn-premium w-full py-4 rounded-xl text-base animate-fade-in-up"
              >
                See what we can do for you {'\u2192'}
              </button>
            )}
          </div>
        )}

        {/* ====== STEP 2: Here's what we found ====== */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-theme mb-2">Here's what we found</h2>
              <p className="text-sm text-theme-secondary">Enter a few numbers below. We compute your tax position live.</p>
            </div>

            {/* ---- PROPERTY SALE SECTION ---- */}
            {f.propertySale && (
              <div className="mb-8">
                <div className="card-theme p-6">
                  <h3 className="font-serif text-lg font-bold text-theme mb-1">Property Sale Details</h3>
                  <p className="text-sm text-theme-muted mb-5">Just 3 numbers -- we will show you both tax options instantly</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Sale price"
                      value={f.salePrice}
                      onChange={v => u('salePrice', parseNum(v))}
                      placeholder="6800000"
                      type="number"
                    />
                    <Input
                      label="Purchase cost"
                      value={f.purchaseCost}
                      onChange={v => u('purchaseCost', parseNum(v))}
                      placeholder="2200000"
                      type="number"
                    />
                    <Select
                      label="Year of purchase"
                      value={f.propertyAcqFY}
                      onChange={v => u('propertyAcqFY', v)}
                      options={Object.keys(CII).filter(k => parseInt(k) >= 2005).map(k => ({ v: k, l: 'FY ' + k }))}
                    />
                  </div>
                </div>

                {/* Live computation preview */}
                {f.salePrice && f.purchaseCost && cgData && (
                  <div className="card-premium border-glow p-6 mt-4 animate-fade-in-up overflow-x-auto">
                    <p className="text-xs text-theme-accent uppercase tracking-wide mb-2 font-bold">Live Tax Preview</p>
                    <div className="text-2xl font-serif font-bold text-gradient-gold">
                      You could save {formatINR(cgData.savings)}
                    </div>
                    <p className="text-sm text-theme-secondary mt-2">
                      Without expert filing: {formatINR(cgData.optionA.total)} tax.
                      With dual computation: {formatINR(Math.min(cgData.optionA.total, cgData.optionB.total))}.
                      <strong> That's {formatINR(cgData.savings)} saved.</strong>
                    </p>
                    <p className="text-xs text-theme-secondary mt-3 leading-relaxed">
                      Without expert filing, you'd pay {formatINR(cgData.optionA.total)} in tax.{' '}
                      Our dual-computation analysis brings this down to {formatINR(cgData[cgData.better === 'A' ? 'optionA' : 'optionB'].total)}.{' '}
                      That's <strong style={{ color: 'var(--green)' }}>{formatINR(cgData.savings)} saved</strong> &mdash;{' '}
                      money that stays in your pocket, not the government's.
                    </p>
                    {/* TDS warning */}
                    <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(160,72,72,0.08)', borderLeft: '3px solid var(--red)' }}>
                      <p className="text-xs font-bold" style={{ color: 'var(--red)' }}>Important:</p>
                      <p className="text-xs text-theme-secondary">
                        Your buyer should deduct {formatINR(cgData.tds195)} as TDS (Section 195).
                        If they deduct only ~{'\u20B9'}{Math.round(f.salePrice * 0.01).toLocaleString('en-IN')} (wrong section),
                        you may face a department notice. We catch this.
                      </p>
                    </div>
                    <p className="text-xs text-theme-secondary mt-3 italic" style={{ color: 'var(--text-muted)' }}>
                      This is just a preview. The full diagnostic analyzes 9 additional dimensions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ---- RENTAL INCOME SECTION ---- */}
            {f.rent && (
              <div className="mb-8">
                <div className="card-theme p-6">
                  <h3 className="font-serif text-lg font-bold text-theme mb-1">Rental Income</h3>
                  <p className="text-sm text-theme-muted mb-5">Your monthly rent -- we will compute the deduction</p>
                  <Input
                    label="Monthly rent"
                    value={f.rentalMonthly}
                    onChange={v => u('rentalMonthly', parseNum(v))}
                    placeholder="25000"
                    type="number"
                  />
                </div>

                {f.rentalMonthly > 0 && (
                  <div className="card-premium p-5 mt-4 animate-fade-in-up overflow-x-auto">
                    <p className="text-xs text-theme-accent uppercase tracking-wide mb-2 font-bold">Your rental tax position</p>
                    <p className="text-sm text-theme-secondary leading-relaxed">
                      Annual rent: <strong className="text-theme">{formatINR(f.rentalMonthly * 12)}</strong>
                      {' '}{'\u2192'} 30% standard deduction: <strong className="text-theme">{formatINR(Math.round(f.rentalMonthly * 12 * 0.3))}</strong>
                      {' '}{'\u2192'} Taxable: <strong style={{ color: 'var(--green)' }}>{formatINR(Math.round(f.rentalMonthly * 12 * 0.7))}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ---- NRO/FD INTEREST SECTION ---- */}
            {f.interest && (
              <div className="mb-8">
                <div className="card-theme p-6">
                  <h3 className="font-serif text-lg font-bold text-theme mb-1">NRO / FD Interest</h3>
                  <p className="text-sm text-theme-muted mb-5">Banks deduct 30% TDS by default -- your treaty rate may be lower</p>
                  <Input
                    label="NRO/FD interest per year"
                    value={f.nroInterest}
                    onChange={v => u('nroInterest', parseNum(v))}
                    placeholder="140000"
                    type="number"
                  />
                </div>

                {f.nroInterest > 0 && f.country && (
                  dtaaData ? (
                    <div className="card-premium p-5 mt-4 animate-fade-in-up overflow-x-auto">
                      <p className="text-xs text-theme-accent uppercase tracking-wide mb-2 font-bold">TDS on your interest</p>
                      <p className="text-sm text-theme-secondary leading-relaxed">
                        Bank deducts: <strong className="text-theme">{formatINR(Math.round(f.nroInterest * 0.30))}</strong> (30%).
                        {dtaaData.hasDTAA ? (
                          <>
                            {' '}With DTAA ({f.country}): <strong style={{ color: 'var(--green)' }}>{formatINR(Math.round(f.nroInterest * (dtaaData.rate / 100)))}</strong> ({dtaaData.rate}%).
                            {' '}Potential saving: <strong style={{ color: 'var(--green)' }}>{formatINR(Math.round(f.nroInterest * (0.30 - dtaaData.rate / 100)))}</strong>
                          </>
                        ) : (
                          <> No DTAA with {f.country} -- domestic 30% rate applies. Section 91 unilateral relief may be available.</>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="card-theme p-4 mt-3">
                      <p className="text-xs text-theme-muted">No specific DTAA treaty found for {f.country}. Default 30% TDS applies. Our team will check for applicable relief.</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ---- ESOP/RSU SECTION ---- */}
            {f.esopRsu && (
              <div className="mb-8">
                <div className="card-theme p-6">
                  <h3 className="font-serif text-lg font-bold text-theme mb-1">ESOP / RSU Income</h3>
                  <p className="text-sm text-theme-muted mb-5">Two-stage taxation applies: perquisite at exercise + capital gains at sale</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Perquisite value at exercise"
                      value={f.esopPerquisite}
                      onChange={v => u('esopPerquisite', parseNum(v))}
                      placeholder="500000"
                      type="number"
                      tip="FMV at exercise minus exercise price"
                    />
                    <Input
                      label="Sale gain after exercise"
                      value={f.esopSaleGain}
                      onChange={v => u('esopSaleGain', parseNum(v))}
                      placeholder="300000"
                      type="number"
                      tip="Sale price minus FMV at exercise"
                    />
                  </div>
                </div>

                {(f.esopPerquisite > 0 || f.esopSaleGain > 0) && (
                  <div className="card-premium p-5 mt-4 animate-fade-in-up overflow-x-auto">
                    <p className="text-xs text-theme-accent uppercase tracking-wide mb-2 font-bold">ESOP tax overview</p>
                    <p className="text-sm text-theme-secondary leading-relaxed">
                      {f.esopPerquisite > 0 && (
                        <>Perquisite: <strong className="text-theme">{formatINR(f.esopPerquisite)}</strong> taxed as salary income at slab rates. </>
                      )}
                      {f.esopSaleGain > 0 && (
                        <>Sale gain: <strong className="text-theme">{formatINR(f.esopSaleGain)}</strong> taxed as capital gains (rate depends on holding period and listing status). </>
                      )}
                      <strong style={{ color: 'var(--accent)' }}>Our team will compute the exact India-service apportionment if your employer is foreign.</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ---- ITR FILING SECTION ---- */}
            {f.filing && !f.propertySale && !f.rent && !f.interest && !f.esopRsu && (
              <div className="mb-8">
                <div className="card-theme p-6">
                  <h3 className="font-serif text-lg font-bold text-theme mb-1">ITR Filing</h3>
                  <p className="text-sm text-theme-muted">
                    NRIs must file an Indian tax return if total India-sourced income exceeds {'\u20B9'}4,00,000 in a year.
                    Even if TDS has been deducted, filing may unlock refunds.
                  </p>
                  <div className="mt-4 p-4 rounded-xl" style={{ background: 'color-mix(in srgb, var(--accent) 6%, var(--bg-card))', borderLeft: '3px solid var(--accent)' }}>
                    <p className="text-xs text-theme-accent font-bold mb-1">Did you know?</p>
                    <p className="text-xs text-theme-secondary">Most NRIs overpay TDS and never file for a refund. Our diagnostic will tell you exactly how much you can recover.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ---- "Not sure" with no other scenario ---- */}
            {f.notSure && !f.propertySale && !f.rent && !f.interest && !f.esopRsu && !f.filing && (
              <div className="mb-8">
                <div className="card-theme p-6 text-center">
                  <p className="text-sm text-theme-secondary">
                    No problem. Share your details in the next step and our team will analyze your full tax position.
                  </p>
                </div>
              </div>
            )}

            {/* Continue CTA */}
            <button
              onClick={() => goStep(3)}
              className="btn-premium w-full py-4 rounded-xl text-base"
            >
              Get your full diagnostic -- share your details {'\u2192'}
            </button>
          </div>
        )}

        {/* ====== STEP 3: Get your personalized diagnostic ====== */}
        {step === 3 && (
          <div>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-bold text-theme mb-2">Get Your Personalized Diagnostic</h2>
                <p className="text-sm text-theme-secondary">Our team will review your case and call you within 24 hours &mdash; no obligation.</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5 uppercase tracking-wide">Your full name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={f.name || ''}
                      onChange={e => u('name', e.target.value)}
                      placeholder="Rajesh Mehta"
                      className="input-theme py-3 px-4 pl-10 w-full"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted opacity-50">
                      <User size={16} />
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5 uppercase tracking-wide">Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={f.email || ''}
                      onChange={e => u('email', e.target.value)}
                      placeholder="rajesh@email.com"
                      className="input-theme py-3 px-4 pl-10 w-full"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted opacity-50">
                      <Mail size={16} />
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-theme-muted mb-1.5 uppercase tracking-wide">Phone *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={f.phone || ''}
                      onChange={e => u('phone', e.target.value)}
                      placeholder="+44 7700 123456"
                      className="input-theme py-3 px-4 pl-10 w-full"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted opacity-50">
                      <Phone size={16} />
                    </span>
                  </div>
                  <p className="text-[10px] text-theme-muted mt-1">Include country code (e.g. +44 7700 123456)</p>
                </div>
              </div>

              {/* Classification preview */}
              {(() => {
                const cls = classifyCase(f);
                const clsColors = { Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' };
                const clsColor = clsColors[cls] || 'var(--accent)';
                return (
                  <div className="mt-6 p-5 rounded-xl text-center" style={{
                    background: `color-mix(in srgb, ${clsColor} 8%, var(--bg-card))`,
                    border: `2px solid color-mix(in srgb, ${clsColor} 25%, transparent)`
                  }}>
                    <p className="text-xs uppercase tracking-wide mb-1 font-medium" style={{ color: clsColor }}>Your case complexity</p>
                    <p className="text-xl font-serif font-bold" style={{ color: clsColor }}>{cls} Case</p>
                    <p className="text-xs text-theme-muted mt-1">{getClassificationDesc(cls)}</p>
                  </div>
                );
              })()}

              {/* CG savings reminder */}
              {cgData && cgData.savings > 0 && (
                <div className="mt-4 p-4 rounded-xl text-center animate-fade-in-up" style={{
                  background: 'color-mix(in srgb, var(--green) 8%, var(--bg-card))',
                  border: '1px solid color-mix(in srgb, var(--green) 25%, transparent)'
                }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--green)' }}>Potential savings identified</p>
                  <p className="text-xl font-serif font-bold" style={{ color: 'var(--green)' }}>{formatINR(cgData.savings)}</p>
                </div>
              )}

              {/* Legal consent */}
              <label className="flex items-start gap-2.5 text-xs cursor-pointer mt-4">
                <input type="checkbox" checked={!!f.consent} onChange={e => u('consent', e.target.checked)}
                  className="accent-[#C49A3C] w-4 h-4 mt-0.5 flex-shrink-0" />
                <span style={{ color: 'var(--text-secondary)' }}>
                  I understand this is an AI-assisted preliminary assessment, not professional tax advice.
                  Final computations will be reviewed by a qualified Chartered Accountant.
                  I agree to the <a href="/terms" className="text-theme-accent underline">Terms</a> and
                  <a href="/privacy" className="text-theme-accent underline">Privacy Policy</a>.
                </span>
              </label>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !f.name || !f.email || !f.phone || !f.consent}
                className="btn-premium w-full mt-6 py-4 rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : getContextualCTA(f)}
              </button>

              <p className="text-xs text-theme-muted text-center mt-4">
                Free &middot; No obligation &middot; Your data is encrypted and confidential
              </p>
            </div>
          </div>
        )}

        </div>{/* end fade wrapper */}
      </div>
      <Footer />
    </div>
  );
}
