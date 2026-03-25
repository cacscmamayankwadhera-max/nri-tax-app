'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/theme-provider';
import { computeCapitalGains, formatINR, classifyCase, FY_CONFIG, CII } from '@/lib/compute';
import { CheckCircle } from 'lucide-react';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

const COUNTRIES = ["United Kingdom","United States","UAE","Singapore","Canada","Australia","Germany","Saudi Arabia","Qatar","Hong Kong","New Zealand","Other"];

// ═══ Reusable form components — defined at module scope to avoid remounts ═══
const I = ({ l, v, ch, ph, type, tip, wide, children }) => (
  <div className={wide ? 'col-span-2' : ''}>
    <label className="block text-xs font-semibold text-theme-muted mb-1.5 uppercase tracking-wide">{l}</label>
    {children || <input type={type || 'text'} value={v || ''} onChange={e => ch(e.target.value)} placeholder={ph}
      className="input-theme py-3 px-4" />}
    {tip && <p className="text-[10px] text-theme-muted mt-1">{tip}</p>}
  </div>
);
const S = ({ v, ch, o, ph }) => (
  <select value={v || ''} onChange={e => ch(e.target.value)} className="input-theme py-3 px-4">
    <option value="">{ph || 'Select'}</option>
    {o.map(x => typeof x === 'string' ? <option key={x}>{x}</option> : <option key={x.v} value={x.v}>{x.l}</option>)}
  </select>
);
const C = ({ l, c, ch }) => (
  <label className="flex items-center gap-2.5 text-sm cursor-pointer py-1.5 text-theme hover:text-theme-accent transition-colors">
    <input type="checkbox" checked={!!c} onChange={e => ch(e.target.checked)} className="accent-[#C49A3C] w-4 h-4" />{l}
  </label>
);

function StepIndicator({ step, stepLabels }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {stepLabels.map((label, i) => {
        const isCompleted = i < step;
        const isActive = i === step;
        const isFuture = i > step;
        return (
          <div key={i} className="flex items-center" style={{ flex: i < 4 ? 1 : 'none' }}>
            <div className="flex flex-col items-center" style={{ minWidth: 48 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                style={{
                  background: isCompleted ? 'var(--green)' : isActive ? 'var(--accent)' : 'transparent',
                  color: isCompleted || isActive ? '#fff' : 'var(--text-muted)',
                  border: isFuture ? '2px solid var(--border)' : 'none',
                  boxShadow: isActive ? '0 0 0 4px rgba(196, 154, 60, 0.2)' : 'none'
                }}
              >
                {isCompleted ? '\u2713' : i + 1}
              </div>
              <span className="text-[10px] mt-1.5 font-medium" style={{
                color: isActive ? 'var(--accent)' : isCompleted ? 'var(--green)' : 'var(--text-muted)'
              }}>{label}</span>
            </div>
            {i < 4 && (
              <div className="flex-1 h-0.5 mx-1 rounded-full" style={{
                background: isCompleted ? 'var(--green)' : 'var(--border)',
                marginTop: '-12px'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ClientIntake() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({});
  const [fy] = useState('2025-26');

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nri-intake-draft');
      if (saved) setF(JSON.parse(saved));
    } catch (e) {}
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
  const { theme, toggleTheme } = useTheme();
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  // Parse Indian-format numbers safely: strip commas before parsing
  const parseNum = (v, fallback = 0) => {
    const cleaned = String(v).replace(/,/g, '');
    const n = parseInt(cleaned);
    return isNaN(n) ? fallback : n;
  };
  const cfg = FY_CONFIG[fy];
  const cgData = (f.salePrice && f.purchaseCost) ? computeCapitalGains(f.salePrice, f.purchaseCost, f.propertyAcqFY || '2017-18', fy) : null;

  const isDark = theme === 'dark';

  function goStep(n) {
    setFadeDir('out');
    setTimeout(() => {
      setStep(n);
      setFadeDir('in');
    }, 150);
  }

  async function doParse() {
    if (!narr.trim()) return;
    setPrs(true);
    try {
      const res = await fetch('/api/ai/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ narrative: narr }) });
      const { parsed } = await res.json();
      if (parsed) setF(prev => ({ ...prev, ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== false && v !== '' && v !== 0)) }));
    } catch (e) { /* continue manually */ }
    setPrs(false);
    setParseDone(true);
    setTimeout(() => {
      setParseDone(false);
      // Only advance to next step if mandatory fields are filled
      setF(prev => {
        if (prev.name && prev.country) goStep(1);
        return prev;
      });
    }, 1200);
  }

  async function handleSubmit() {
    if (submitting) return; // prevent double-submit
    setSubmitting(true);
    let ref = null;
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
      }
    } catch (e) {
      console.error('Submission error:', e);
    }
    setCaseRef(ref);
    setSubmitted(true);
    setSubmitting(false);
    // Clear draft after successful submission
    localStorage.removeItem('nri-intake-draft');
  }

  const stepLabels = ['Details', 'India', 'Income', 'Documents', 'Review'];

  // -- SUBMITTED: Show diagnostic --
  if (submitted) {
    const cls = classifyCase(f);
    const clsColors = { Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' };
    const clsColor = clsColors[cls];
    const mailSubject = encodeURIComponent(`NRI Tax Filing \u2014 ${f.name || 'Client'} \u2014 ${cls}`);
    const mailBody = encodeURIComponent(`Hi,\n\nI just completed the intake on your platform.\n\nName: ${f.name || ''}\nCountry: ${f.country || ''}\nClassification: ${cls}\nFY: ${fy}\n\nPlease contact me to proceed.\n\nRegards,\n${f.name || ''}`);
    const waText = encodeURIComponent(`Hi, I completed the NRI Tax intake.\n\nName: ${f.name || ''}\nClassification: ${cls}\nFY: ${fy}\n\nPlease contact me to proceed.`);

    // Classification factors
    const factors = [];
    if (f.cgProperty || f.propertySale) factors.push('Property sale detected');
    if (f.cgShares || f.cgESOPRSU) factors.push('Equity/ESOP income');
    if (f.crypto) factors.push('Crypto/VDA transactions');
    if (f.foreignTaxPaid) factors.push('Foreign tax paid \u2014 DTAA review needed');
    if (f.business) factors.push('Business/professional income');
    if (f.priorNotices === 'Yes') factors.push('Prior tax notices');

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
          <div className="text-center mb-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ background: 'color-mix(in srgb, var(--green) 15%, var(--bg-primary))', animation: 'pulse-gold 2s ease-in-out' }}>
              <CheckCircle size={40} style={{ color: 'var(--green)' }} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-theme mb-2">Assessment Complete!</h2>
            <p className="text-theme-muted text-sm">Your case has been submitted to our tax desk</p>
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
              <div className="text-5xl mb-4" aria-hidden="true">{'\u2705'}</div>
              <h1 className="font-serif text-3xl font-bold text-theme">Your Tax Diagnostic is Ready</h1>
              <p className="text-theme-secondary mt-2">Here is what we found from your intake</p>
            </div>
          )}

          {/* Personalized insights for non-property cases */}
          {!cgData && (
            <div className="card-theme p-6 mb-6 text-center" style={{ borderColor: 'var(--green)', borderWidth: '1px' }}>
              <div className="text-3xl font-serif font-bold mb-2" style={{ color: 'var(--green)' }}>
                {[f.salary, f.rent, f.interest, f.dividend, f.cgShares, f.cgMF, f.cgESOPRSU, f.business, f.crypto].filter(Boolean).length} Income Sources Identified
              </div>
              <p className="text-theme-muted text-sm">Our AI will analyze each for optimization opportunities</p>
              {f.foreignSalary && <p className="text-sm mt-2" style={{ color: 'var(--green)' }}>Your foreign salary is NOT taxable in India — confirmed</p>}
              {f.section80C > 0 && <p className="text-sm mt-1" style={{ color: 'var(--green)' }}>&#8377;{(f.section80C || 0).toLocaleString('en-IN')} in deductions to review</p>}
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
            {/* Classification factors */}
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
            {/* Timeline estimate */}
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

          {/* Pricing / Recommended Service */}
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
                className="btn-primary px-8 py-3 rounded-xl text-sm inline-block">
                Email Us to Proceed {'\u2192'}
              </a>
              <a href={`https://wa.me/919667744073?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="px-8 py-3 rounded-xl font-bold text-sm inline-block transition-all" style={{ background: 'var(--green)', color: '#fff' }}>
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

  // -- WIZARD --
  const titles = ['Describe Your Situation', 'India Connections', 'Income & Transactions', 'Documents & Context', 'Review & Submit'];
  return (
    <div className="min-h-screen bg-theme">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
        @keyframes pulse-reading { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes flash-success { 0% { opacity: 0; transform: scale(0.95); } 20% { opacity: 1; transform: scale(1); } 80% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.95); } }
        .step-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .step-fade-out { animation: fadeOut 0.15s ease-in forwards; }
        .pulse-reading { animation: pulse-reading 1.5s ease-in-out infinite; }
        .flash-success { animation: flash-success 1.2s ease-out forwards; }
      `}</style>

      <NavBar />

      <div className="max-w-2xl mx-auto py-8 px-5 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button onClick={() => step > 0 ? goStep(step - 1) : window.location.href = '/'} className="text-theme-muted hover:text-theme-secondary text-2xl transition-colors" aria-label="Go back">{'\u2039'}</button>
          <div className="flex-1">
            <div className="font-serif text-xl font-bold text-theme">{titles[step]}</div>
            <div className="text-xs text-theme-muted mt-0.5">Free NRI Tax Diagnostic &middot; FY {fy}</div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator step={step} stepLabels={stepLabels} />
        {/* Time estimate per step */}
        <p className="text-center text-xs text-theme-muted mb-4">
          Step {step + 1} of 5 &middot; About {[3, 2, 3, 1, 1][step]} minutes
        </p>

        {/* Step content with transitions */}
        <div className={fadeDir === 'in' ? 'step-fade-in' : 'step-fade-out'}>

        {/* Step 0 */}
        {step === 0 && <div>
          {/* AI Hero Section */}
          <div className="rounded-2xl p-8 mb-6 relative overflow-hidden" style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, var(--bg-card)), color-mix(in srgb, var(--accent) 14%, var(--bg-card)))`,
            border: '2px solid var(--accent)'
          }}>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl" aria-hidden="true">{'\u2728'}</span>
                <h2 className="font-serif text-lg font-bold text-theme">AI-Powered Intake</h2>
              </div>
              <p className="text-sm text-theme-secondary mb-5">Describe your situation in plain English. Our AI will extract all the details and fill in the form for you.</p>

              <textarea value={narr} onChange={e => setNarr(e.target.value)} rows={6}
                placeholder={"Example: I work in London since 2021, came to India for about 38 days. I sold a plot in Nashik for \u20B968 lakhs (bought in 2017 for \u20B922 lakhs). I also have a flat in Pune rented at \u20B925,000/month. NRO interest around \u20B91.4 lakhs, FD interest \u20B985,000. UK salary about GBP 72,000, UK tax paid. I want to know about property tax savings and foreign tax credit."}
                className="input-theme p-4 resize-y text-sm placeholder:leading-relaxed"
                style={{ border: '2px solid color-mix(in srgb, var(--accent) 30%, var(--border))' }}
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

              {/* Parse success flash */}
              {parseDone && (
                <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center flash-success" style={{ background: 'color-mix(in srgb, var(--green) 8%, var(--bg-card) 95%)' }}>
                  <div className="text-5xl mb-3">{'\u2705'}</div>
                  <div className="font-serif text-lg font-bold" style={{ color: 'var(--green)' }}>Fields auto-filled!</div>
                  <p className="text-sm" style={{ color: 'var(--green)' }}>Taking you to the next step...</p>
                </div>
              )}

              {!prs && !parseDone && (
                <button onClick={doParse} disabled={prs || !narr.trim()}
                  className="btn-primary mt-4 px-8 py-3 rounded-xl text-sm hover:shadow-md">
                  {'\u2728'} Auto-Fill My Details
                </button>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
            <span className="text-xs text-theme-muted font-medium uppercase tracking-wider">or fill manually</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
          </div>

          {/* Manual form */}
          <div className="card-theme p-8">
            <div className="grid grid-cols-2 gap-5 stagger-children">
              <div>
                <I l="Your Full Name *" v={f.name} ch={v => u('name', v)} ph="Rajesh Mehta" />
                {parseDone && !f.name && (
                  <p className="text-xs text-red-500 mt-1">Please enter your name — AI couldn't extract it</p>
                )}
              </div>
              <div>
                <I l="Country of Residence *" tip="Your country of residence determines which DTAA (tax treaty) applies"><S v={f.country} ch={v => u('country', v)} o={COUNTRIES} /></I>
                {parseDone && !f.country && (
                  <p className="text-xs text-red-500 mt-1">Please select your country — AI couldn't extract it</p>
                )}
              </div>
              <I l="Occupation" v={f.occupation} ch={v => u('occupation', v)} ph="e.g. IT Manager" />
              <I l="Years Abroad" tip="Helps determine residential status history"><S v={f.yearsAbroad} ch={v => u('yearsAbroad', v)} o={['Less than 1 year', '1-3 years', '3-5 years', '5+ years']} /></I>
              <I l="Email" v={f.email} ch={v => u('email', v)} ph="your@email.com" type="email" />
              <I l="Phone" v={f.phone} ch={v => u('phone', v)} ph="+44 / +91..." />
              <I l="PAN Number" v={f.pan} ch={v => u('pan', v)} ph="ABCDE1234F" tip="Required for ITR filing. Unlinked PAN attracts higher TDS rates" />
              <I l="Aadhaar Number (if available)" v={f.aadhaarNumber} ch={v => u('aadhaarNumber', v)} ph="1234 5678 9012" />
              <I l="PAN-Aadhaar Linked"><S v={f.panAadhaarLinked} ch={v => u('panAadhaarLinked', v)} o={['Yes', 'No', 'Not sure']} /></I>
              <I l="Date of Birth" v={f.dob} ch={v => u('dob', v)} type="date" tip="Determines eligibility for senior citizen tax benefits (60+)" />
              <I l="Citizenship" tip="OCI/PIO holders have same tax treatment but different FEMA rules"><S v={f.citizenship} ch={v => u('citizenship', v)} o={['Indian Citizen', 'OCI Holder', 'PIO']} /></I>
            </div>
          </div>
          <button onClick={() => goStep(1)} disabled={!f.name || !f.country}
            className="btn-dark w-full mt-5 py-3.5 rounded-xl text-base">Continue {'\u2192'}</button>
        </div>}

        {/* Step 1 */}
        {step === 1 && <div>
          <div className="card-theme p-8">
            <div className="grid grid-cols-2 gap-5 stagger-children">
              <I l="Days in India this year" v={f.stayDays} ch={v => u('stayDays', v)} ph="38" tip="Approximate is fine \u2014 we verify later" />
              <I l="How do you know?"><S v={f.staySource} ch={v => u('staySource', v)} o={['Self-estimate', 'Passport records', 'Travel summary']} /></I>
              <I l="Family / home in India?"><S v={f.familyInIndia} ch={v => u('familyInIndia', v)} o={['Yes', 'No', 'Partly']} /></I>
              <I l="Total India stay in preceding 4 years (days)" v={f.stayDays4yr} ch={v => u('stayDays4yr', parseNum(v))} ph="300" type="number" tip="Used with 60-day rule to determine residency. 60 days + 365 days in prior 4 years = Resident" />
              <I l="Total India stay in preceding 7 years (days)" v={f.stayDays7yr} ch={v => u('stayDays7yr', parseNum(v))} ph="500" type="number" tip="RNOR test: if total stay ≤729 days in preceding 7 years, foreign income stays tax-free" />
              <I l="Number of properties owned in India" tip="If you own 2+ properties, only 1 can be self-occupied. Others are deemed let-out at notional rent"><S v={f.propertiesOwned} ch={v => u('propertiesOwned', v)} o={['0', '1', '2', '3+']} /></I>
              <I l="Did you sell property this year?"><S v={f.propertySale ? 'Yes' : 'No'} ch={v => { u('propertySale', v === 'Yes'); u('cgProperty', v === 'Yes'); }} o={['No', 'Yes']} /></I>
              {f.propertySale && <>
                {/* Educational guide link */}
                <div className="col-span-2">
                  <a href="/blog/nri-property-sale-capital-gains" className="text-xs text-theme-accent hover:underline">{"\uD83D\uDCD6"} Read our property sale guide</a>
                </div>
                <I l="When was it purchased?" tip="Properties acquired before July 2024 get dual computation — could save you lakhs"><S v={f.propertyAcqFY} ch={v => u('propertyAcqFY', v)} o={Object.keys(CII).filter(k => parseInt(k) >= 2005).map(k => ({ v: k, l: 'FY ' + k }))} /></I>
                <I l="Sale price (\u20B9)" v={f.salePrice} ch={v => u('salePrice', parseNum(v))} ph="6800000" type="number" />
                <I l="Purchase cost (\u20B9)" v={f.purchaseCost} ch={v => u('purchaseCost', parseNum(v))} ph="2200000" type="number" />
                <I l="City / Location" v={f.propertyLocation} ch={v => u('propertyLocation', v)} ph="Nashik" />
                <I l="Date of sale" v={f.saleDate} ch={v => u('saleDate', v)} type="date" tip="Needed for Section 54 timelines and advance tax" />
                <I l="Improvement cost (\u20B9)" v={f.improvementCost} ch={v => u('improvementCost', parseNum(v))} ph="0" type="number" tip="Renovations, additions \u2014 if any" />
                <I l="Bought or planning to buy new house?" wide tip="Important \u2014 this can eliminate your capital gains tax entirely">
                  <S v={f.section54} ch={v => u('section54', v)} o={['Not sure', 'Yes \u2014 bought new house', 'Planning to buy', 'Considering government bonds', 'No']} />
                </I>
                <I l="Acquisition type" tip="If inherited/gifted, we use the previous owner's purchase cost for tax computation">
                  <S v={f.acquisitionType} ch={v => u('acquisitionType', v)} o={['Self-purchased', 'Inherited', 'Gifted', 'Partition/Settlement']} />
                </I>
                <I l="Holding period" tip="Less than 24 months = Short-Term Capital Gain (taxed at higher slab rates)">
                  <S v={f.holdingPeriod} ch={v => u('holdingPeriod', v)} o={['Less than 24 months', '24 months or more', 'Not sure']} />
                </I>
                <I l="Joint ownership?" wide>
                  <S v={f.jointOwnership} ch={v => u('jointOwnership', v)} o={['No \u2014 sole owner', 'Yes \u2014 joint with spouse', 'Yes \u2014 joint with others']} />
                </I>
                {f.jointOwnership && f.jointOwnership !== 'No \u2014 sole owner' && (
                  <I l="Your ownership %" v={f.ownershipPercent || 100} ch={v => u('ownershipPercent', parseNum(v, 100))} ph="100" type="number" />
                )}
                {f.jointOwnership && f.jointOwnership !== 'No \u2014 sole owner' && <>
                  <I l="Co-owner Name" v={f.coOwnerName} ch={v => u('coOwnerName', v)} />
                  <I l="Co-owner PAN" v={f.coOwnerPAN} ch={v => u('coOwnerPAN', v)} ph="ABCDE1234F" />
                </>}
                <I l="Property type" tip="Rural agricultural land is NOT a capital asset — no capital gains tax at all"><S v={f.propertyType} ch={v => u('propertyType', v)} o={['Residential Flat', 'Residential Plot', 'Commercial Property', 'Agricultural Land (Urban)', 'Agricultural Land (Rural)']} /></I>
                <I l="Stamp duty value (\u20B9)" v={f.stampDutyValue} ch={v => u('stampDutyValue', parseNum(v))} ph="7000000" type="number" tip="If stamp duty exceeds sale price, the higher value is used for tax computation (Section 50C)" />
                <I l="Registration & stamp duty expenses (\u20B9)" v={f.registrationExpenses} ch={v => u('registrationExpenses', parseNum(v))} ph="350000" type="number" tip="Stamp duty, registration, brokerage — all deductible as cost of transfer" />
                <I l="TDS deducted by buyer (\u20B9)" v={f.tdsDeductedBuyer} ch={v => u('tdsDeductedBuyer', parseNum(v))} ph="1360000" type="number" tip="NRI sellers face 20% TDS under Section 195. Check if buyer deducted correctly — 1% means wrong section was used" />
                <I l="Section 197 lower TDS certificate" tip="A lower TDS certificate avoids locking up excess cash. Apply BEFORE the sale"><S v={f.section197} ch={v => u('section197', v)} o={['Not applied', 'Applied \u2014 pending', 'Obtained', 'Not applicable']} /></I>
                <I l="Was property acquired before April 2001?" tip="You can use Fair Market Value as of 01/04/2001 as cost — usually MUCH higher than original price"><S v={f.preApril2001} ch={v => u('preApril2001', v)} o={['No', 'Yes \u2014 will use FMV as of 01/04/2001']} /></I>
              </>}
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(0)} className="btn-secondary flex-1 py-3 rounded-xl">{'\u2190'} Back</button>
            <button onClick={() => goStep(2)} className="btn-dark flex-[2] py-3 rounded-xl">Continue {'\u2192'}</button>
          </div>
        </div>}

        {/* Step 2 */}
        {step === 2 && <div>
          <div className="card-theme p-8 mb-5">
            <div className="text-sm font-semibold text-theme mb-4">What Indian income do you have? <span className="text-theme-muted font-normal">(tick all that apply)</span></div>
            <div className="grid grid-cols-2 gap-1">
              {[['salary', 'Salary in India'], ['rent', 'Rental income'], ['interest', 'Bank / FD interest'], ['dividend', 'Dividends'], ['cgShares', 'Sold shares'], ['cgMF', 'Sold mutual funds'], ['cgESOPRSU', 'ESOP / RSU sale'], ['business', 'Business / consulting'], ['crypto', 'Crypto / Virtual Digital Assets'], ['epf', 'EPF/PF Withdrawal'], ['gratuity', 'Gratuity received'], ['leaveEncash', 'Leave encashment'], ['npsWithdraw', 'NPS withdrawal'], ['pension', 'Pension from India'], ['reitInvit', 'REIT/InvIT income']].map(([k, l]) =>
                <C key={k} l={l} c={f[k]} ch={v => u(k, v)} />
              )}
            </div>
          </div>
          {f.salary && <div className="card-theme p-8 mb-5">
            <I l="Annual Indian salary (\u20B9)" v={f.salaryAmount} ch={v => u('salaryAmount', parseNum(v))} ph="1200000" type="number" tip="From Form 16 \u2014 gross salary from Indian employer" />
          </div>}
          {(f.epf || f.gratuity || f.leaveEncash || f.npsWithdraw) && <div className="card-theme p-8 mb-5">
            <div className="text-sm font-semibold text-theme mb-4">Retirement & employment benefits <span className="text-theme-muted font-normal">(amounts received)</span></div>
            <div className="grid grid-cols-2 gap-5">
              {f.epf && <I l="EPF withdrawal amount (\u20B9)" v={f.epfAmount} ch={v => u('epfAmount', parseNum(v))} ph="0" type="number" />}
              {f.gratuity && <I l="Gratuity amount (\u20B9)" v={f.gratuityAmount} ch={v => u('gratuityAmount', parseNum(v))} ph="0" type="number" />}
              {f.leaveEncash && <I l="Leave encashment amount (\u20B9)" v={f.leaveEncashAmount} ch={v => u('leaveEncashAmount', parseNum(v))} ph="0" type="number" />}
              {f.npsWithdraw && <I l="NPS withdrawal amount (\u20B9)" v={f.npsWithdrawAmount} ch={v => u('npsWithdrawAmount', parseNum(v))} ph="0" type="number" />}
            </div>
          </div>}
          {(f.rent || f.interest) && <div className="card-theme p-8 mb-5">
            <div className="text-sm font-semibold text-theme mb-4">Quick amounts <span className="text-theme-muted font-normal">(approximate is fine)</span></div>
            {f.rent && <I l="Monthly rent amount (\u20B9)" v={f.rentalMonthly} ch={v => u('rentalMonthly', parseNum(v))} ph="25000" type="number" />}
            {f.interest && <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <I l="NRO interest (\u20B9/year)" v={f.nroInterest} ch={v => u('nroInterest', parseNum(v))} ph="140000" type="number" />
                <I l="FD interest (\u20B9/year)" v={f.fdInterest} ch={v => u('fdInterest', parseNum(v))} ph="85000" type="number" />
              </div>
              <div className="mt-4">
                <I l="Interest account type">
                  <S v={f.interestType} ch={v => u('interestType', v)} o={['NRO (Taxable)', 'NRE (Tax-Free)', 'Both NRO + NRE']} />
                </I>
                <p className="text-[10px] text-theme-muted mt-1">NRE interest is completely tax-free under Section 10(4). NRO interest is taxable at 30%.</p>
              </div>
              {/* Educational guide link */}
              <div className="mt-3">
                <a href="/blog/nre-nro-fcnr-banking" className="text-xs text-theme-accent hover:underline">{"\uD83D\uDCD6"} NRE vs NRO tax treatment</a>
              </div>
            </div>}
          </div>}
          {(f.cgShares || f.cgMF || f.cgESOPRSU) && (
            <div className="card-theme p-8 mb-6">
              <div className="text-sm font-semibold text-theme mb-3">Capital gains amounts <span className="text-theme-muted font-normal">(from broker/demat statement)</span></div>
              <div className="grid grid-cols-2 gap-5">
                {f.cgShares && <>
                  <I l="Listed shares LTCG (\u20B9)" v={f.sharesLTCG} ch={v => u('sharesLTCG', parseNum(v))} ph="0" type="number" tip="Gains on shares held >12 months" />
                  <I l="Listed shares STCG (\u20B9)" v={f.sharesSTCG} ch={v => u('sharesSTCG', parseNum(v))} ph="0" type="number" tip="Gains on shares held \u226412 months" />
                </>}
                {f.cgMF && <>
                  <I l="MF LTCG (\u20B9)" v={f.mfLTCG} ch={v => u('mfLTCG', parseNum(v))} ph="0" type="number" tip="Equity MF held >12 months, Debt MF >24 months" />
                  <I l="MF STCG (\u20B9)" v={f.mfSTCG} ch={v => u('mfSTCG', parseNum(v))} ph="0" type="number" tip="Short-term MF gains" />
                </>}
                {f.cgESOPRSU && <>
                  <I l="Employer Company Name" v={f.esopEmployer} ch={v => u('esopEmployer', v)} tip="Foreign employer ESOPs may have India-service apportionment — only India portion is taxable" />
                  <I l="Stock Listing Status" tip="Listed shares: 12-month LTCG threshold. Unlisted: 24 months"><S v={f.stockListing} ch={v => u('stockListing', v)} o={['Listed in India', 'Listed abroad', 'Unlisted (startup/private)']} /></I>
                  <I l="ESOP/RSU Type"><S v={f.esopType} ch={v => u('esopType', v)} o={['RSU (Restricted Stock Units)', 'Stock Options (ESOP)', 'Both', 'Not sure']} /></I>
                  <I l="ESOP/RSU perquisite value (\u20B9)" v={f.esopPerquisite} ch={v => u('esopPerquisite', parseNum(v))} ph="0" type="number" tip="FMV at exercise minus exercise price" />
                  <I l="ESOP/RSU sale gain (\u20B9)" v={f.esopSaleGain} ch={v => u('esopSaleGain', parseNum(v))} ph="0" type="number" tip="Sale price minus FMV at exercise" />
                  {/* Educational guide link */}
                  <div className="col-span-2">
                    <a href="/blog/nri-esop-rsu-taxation" className="text-xs text-theme-accent hover:underline">{"\uD83D\uDCD6"} Read our ESOP taxation guide</a>
                  </div>
                </>}
              </div>
            </div>
          )}
          <div className="card-theme p-8 mb-5">
            <div className="text-sm font-semibold text-theme mb-4">Foreign income</div>
            <div className="grid grid-cols-2 gap-1">
              <C l="I earn salary abroad" c={f.foreignSalary} ch={v => u('foreignSalary', v)} />
              <C l="I pay tax abroad" c={f.foreignTaxPaid} ch={v => u('foreignTaxPaid', v)} />
            </div>
            {f.foreignSalary && <div className="mt-4"><I l="Details" v={f.foreignDetails} ch={v => u('foreignDetails', v)} ph="e.g. UK salary GBP 72,000, UK tax paid" wide /></div>}
          </div>
          {f.dividend && (
            <div className="card-theme p-8 mb-6">
              <I l="Total Indian dividends received (\u20B9)" v={f.dividendAmount} ch={v => u('dividendAmount', parseNum(v))} ph="50000" type="number" tip="Dividends from Indian companies \u2014 taxable at slab rate" />
            </div>
          )}
          {f.crypto && (
            <div className="card-theme p-8 mb-6">
              <div className="text-sm font-semibold text-theme mb-3">Crypto / VDA</div>
              <div className="grid grid-cols-2 gap-5">
                <I l="Sale/transfer value (\u20B9)" v={f.cryptoSale} ch={v => u('cryptoSale', parseNum(v))} ph="0" type="number" />
                <I l="Cost of acquisition (\u20B9)" v={f.cryptoCost} ch={v => u('cryptoCost', parseNum(v))} ph="0" type="number" />
              </div>
              <p className="text-xs text-theme-muted mt-2">Taxed at 30% flat rate. No deductions except cost. 1% TDS under Section 194S.</p>
            </div>
          )}
          <div className="card-theme p-8 mb-5">
            <div className="text-sm font-semibold text-theme mb-4">Deductions & Investments</div>
            {/* Educational guide link */}
            <div className="mb-4">
              <a href="/blog/nri-tax-saving-strategies" className="text-xs text-theme-accent hover:underline">{"\uD83D\uDCD6"} Which deductions can NRIs claim?</a>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <I l="Section 80C total (\u20B9)" v={f.section80C} ch={v => u('section80C', parseNum(v))} ph="150000" type="number" tip="PPF + ELSS + LIC + home loan principal + tuition fees" />
              <I l="Health insurance premium \u2014 self (\u20B9)" v={f.healthInsuranceSelf} ch={v => u('healthInsuranceSelf', parseNum(v))} ph="25000" type="number" />
              <I l="Health insurance premium \u2014 parents (\u20B9)" v={f.healthInsuranceParents} ch={v => u('healthInsuranceParents', parseNum(v))} ph="25000" type="number" />
              <I l="NPS contribution (\u20B9)" v={f.npsContribution} ch={v => u('npsContribution', parseNum(v))} ph="50000" type="number" tip="Section 80CCD(1B) additional deduction" />
              <I l="Education loan interest (\u20B9)" v={f.educationLoanInterest} ch={v => u('educationLoanInterest', parseNum(v))} ph="0" type="number" tip="Section 80E \u2014 no cap, max 8 years" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(1)} className="btn-secondary flex-1 py-3 rounded-xl">{'\u2190'} Back</button>
            <button onClick={() => goStep(3)} className="btn-dark flex-[2] py-3 rounded-xl">Continue {'\u2192'}</button>
          </div>
        </div>}

        {/* Step 3 */}
        {step === 3 && <div>
          <div className="card-theme p-8">
            <div className="grid grid-cols-2 gap-5 stagger-children">
              <I l="Do you have AIS?" tip="Download from incometax.gov.in → e-File → Income Tax Returns → AIS. Shows all your financial transactions"><S v={f.ais} ch={v => u('ais', v)} o={['Yes', 'Downloaded but not reviewed', 'No', "Don't know what this is"]} /></I>
              <I l="Total Indian assets?"><S v={f.indianAssets} ch={v => u('indianAssets', v)} o={['Below \u20B950 Lakhs', '\u20B950L \u2013 \u20B91 Crore', 'Above \u20B91 Crore', 'Not sure']} /></I>
              <I l="Any prior tax notices?"><S v={f.priorNotices} ch={v => u('priorNotices', v)} o={['None', 'Yes', 'Not sure']} /></I>
              <I l="What help do you need?"><S v={f.serviceNeed} ch={v => u('serviceNeed', v)} o={['Just file my return', 'Filing + advice on my situation', 'Tax planning + filing', 'Just want to understand what I owe']} /></I>
            </div>
            <div className="mt-5">
              <I l="Home loan interest on rented property (\u20B9/year)" v={f.homeLoanInterest} ch={v => u('homeLoanInterest', parseNum(v))} ph="0" type="number" tip="Deductible against rental income \u2014 no cap for let-out property" />
            </div>
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-5">
                <I l="Advance tax paid this year (\u20B9)" v={f.advanceTaxPaid} ch={v => u('advanceTaxPaid', parseNum(v))} ph="0" type="number" tip="If you already paid advance tax via Challan 280, enter total here — reduces your balance payable" />
                <I l="TCS paid on LRS remittances (\u20B9)" v={f.tcsPaidLRS} ch={v => u('tcsPaidLRS', parseNum(v))} ph="0" type="number" tip="20% TCS on foreign remittances above \u20B97L" />
              </div>
              <div className="mt-3">
                <C l="15CA/15CB already filed for prior remittances" c={f.filed15CA15CB} ch={v => u('filed15CA15CB', v)} />
                <p className="text-[10px] text-theme-muted mt-1 ml-6">Required before remitting money from India. If you've done this before, your CA has the records</p>
              </div>
            </div>
            <div className="mt-5"><I l="Anything else we should know?" wide>
              <textarea value={f.notes || ''} onChange={e => u('notes', e.target.value)} rows={3}
                className="input-theme p-4 resize-y text-sm" placeholder="Any specific questions, transaction details, or concerns..." />
            </I></div>
            <div className="mt-5">
              <div className="text-sm font-semibold text-theme mb-4">NRO/NRE Bank Details <span className="text-theme-muted font-normal">(for refund processing)</span></div>
              <div className="grid grid-cols-2 gap-5">
                <I l="NRO Account Number" v={f.nroAccountNumber} ch={v => u('nroAccountNumber', v)} ph="For refund credit" tip="NRI tax refunds are credited to NRO account only" />
                <I l="Bank Name & IFSC" v={f.bankNameIFSC} ch={v => u('bankNameIFSC', v)} ph="SBI / SBIN0001234" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(2)} className="btn-secondary flex-1 py-3 rounded-xl">{'\u2190'} Back</button>
            <button onClick={() => goStep(4)} className="btn-dark flex-[2] py-3 rounded-xl">Review {'\u2192'}</button>
          </div>
        </div>}

        {/* Step 4: Review */}
        {step === 4 && <div className="animate-fade-in-up">
          {/* Classification badge -- prominent */}
          <div className="rounded-2xl p-8 mb-5 border-2" style={{
            background: `color-mix(in srgb, ${{ Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' }[classifyCase(f)]} 5%, var(--bg-card))`,
            borderColor: `color-mix(in srgb, ${{ Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' }[classifyCase(f)]} 25%, transparent)`
          }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-serif text-lg font-bold text-theme">Your Case Complexity</div>
                <div className="text-xs text-theme-muted mt-0.5">Auto-classified from your inputs</div>
              </div>
              <span className="text-2xl font-bold px-8 py-2.5 rounded-full" style={{
                background: `color-mix(in srgb, ${{ Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' }[classifyCase(f)]} 12%, var(--bg-card))`,
                color: { Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' }[classifyCase(f)],
                border: `2px solid color-mix(in srgb, ${{ Green: 'var(--green)', Amber: 'var(--amber)', Red: 'var(--red)' }[classifyCase(f)]} 20%, transparent)`
              }}>{classifyCase(f)}</span>
            </div>
          </div>

          {/* CG savings card -- highlighted */}
          {cgData && <div className="rounded-2xl p-6 mb-5" style={{ background: 'color-mix(in srgb, var(--green) 6%, var(--bg-card))', border: '2px solid color-mix(in srgb, var(--green) 30%, transparent)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif font-bold text-base" style={{ color: 'var(--green)' }}>Capital Gains Preview</div>
                <div className="text-sm mt-1" style={{ color: 'var(--green)' }}>Option {cgData.better} is more favourable</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium" style={{ color: 'var(--green)' }}>You could save</div>
                <div className="font-serif text-3xl font-bold" style={{ color: 'var(--green)' }}>{formatINR(cgData.savings)}</div>
              </div>
            </div>
            <div className="mt-3 text-xs" style={{ color: 'var(--green)' }}>Tax: {formatINR(cgData.better === 'B' ? cgData.optionB.total : cgData.optionA.total)} (before exemptions)</div>
          </div>}

          {/* Details summary */}
          <div className="card-theme p-8 mb-5">
            <div className="font-serif text-base font-bold text-theme mb-4">Your Details</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Name', f.name], ['Country', f.country], ['Stay', '~' + (f.stayDays || '?') + ' days'], ['Email', f.email], ['Service', f.serviceNeed], ['Assets', f.indianAssets]].filter(([, v]) => v).map(([l, v], i) =>
                <div key={i} className="flex gap-2">
                  <span className="text-theme-muted shrink-0">{l}:</span>
                  <strong className="text-theme">{v}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(3)} className="btn-secondary flex-1 py-3 rounded-xl">{'\u2190'} Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-[2] py-3.5 rounded-xl text-base hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Submitting...' : 'Get My Tax Diagnostic \u2192'}
            </button>
          </div>
          <p className="text-xs text-theme-muted text-center mt-4">Free &middot; No obligation &middot; Your data is confidential</p>
        </div>}

        </div>{/* end fade wrapper */}
      </div>
      <Footer />
    </div>
  );
}
