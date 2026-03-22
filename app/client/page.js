'use client';
import { useState } from 'react';
import { computeCapitalGains, formatINR, classifyCase, FY_CONFIG, CII } from '@/lib/compute';

const COUNTRIES = ["United Kingdom","United States","UAE","Singapore","Canada","Australia","Germany","Saudi Arabia","Qatar","Hong Kong","New Zealand","Other"];

export default function ClientIntake() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({});
  const [fy] = useState('2025-26');
  const [narr, setNarr] = useState('');
  const [prs, setPrs] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [parseDone, setParseDone] = useState(false);
  const [fadeDir, setFadeDir] = useState('in');
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const cfg = FY_CONFIG[fy];
  const cgData = (f.salePrice && f.purchaseCost) ? computeCapitalGains(f.salePrice, f.purchaseCost, f.propertyAcqFY || '2017-18', fy) : null;

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
      goStep(1);
    }, 1200);
  }

  async function handleSubmit() {
    // Save case via API (no auth required for initial submission)
    try {
      await fetch('/api/cases/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: f, fy, classification: classifyCase(f) })
      });
    } catch (e) { /* continue even if save fails */ }
    setSubmitted(true);
  }

  const I = ({ l, v, ch, ph, type, tip, wide, children }) => (
    <div className={wide ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{l}</label>
      {children || <input type={type || 'text'} value={v || ''} onChange={e => ch(e.target.value)} placeholder={ph}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#C49A3C] focus:border-[#C49A3C] outline-none transition-shadow" />}
      {tip && <p className="text-[10px] text-gray-400 mt-1">{tip}</p>}
    </div>
  );
  const S = ({ v, ch, o, ph }) => (
    <select value={v || ''} onChange={e => ch(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#C49A3C] focus:border-[#C49A3C] outline-none transition-shadow">
      <option value="">{ph || 'Select'}</option>
      {o.map(x => typeof x === 'string' ? <option key={x}>{x}</option> : <option key={x.v} value={x.v}>{x.l}</option>)}
    </select>
  );
  const C = ({ l, c, ch }) => (
    <label className="flex items-center gap-2.5 text-sm cursor-pointer py-1.5 hover:text-[#C49A3C] transition-colors">
      <input type="checkbox" checked={!!c} onChange={e => ch(e.target.checked)} className="accent-[#C49A3C] w-4 h-4" />{l}
    </label>
  );

  const stepLabels = ['Details', 'India', 'Income', 'Documents', 'Review'];

  // ── Step indicator component ──
  const StepIndicator = () => (
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
                  background: isCompleted ? '#2A6B4A' : isActive ? '#C49A3C' : 'transparent',
                  color: isCompleted || isActive ? '#fff' : '#9ca3af',
                  border: isFuture ? '2px solid #d1d5db' : 'none',
                  boxShadow: isActive ? '0 0 0 4px rgba(196, 154, 60, 0.2)' : 'none'
                }}
              >
                {isCompleted ? '\u2713' : i + 1}
              </div>
              <span className="text-[10px] mt-1.5 font-medium" style={{
                color: isActive ? '#C49A3C' : isCompleted ? '#2A6B4A' : '#9ca3af'
              }}>{label}</span>
            </div>
            {i < 4 && (
              <div className="flex-1 h-0.5 mx-1 rounded-full" style={{
                background: isCompleted ? '#2A6B4A' : '#e5e7eb',
                marginTop: '-12px'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── SUBMITTED: Show diagnostic ──
  if (submitted) {
    const cls = classifyCase(f);
    const clsColors = { Green: '#2A6B4A', Amber: '#B07D3A', Red: '#A04848' };
    const clsColor = clsColors[cls];
    const mailSubject = encodeURIComponent(`NRI Tax Filing \u2014 ${f.name || 'Client'} \u2014 ${cls}`);
    const mailBody = encodeURIComponent(`Hi,\n\nI just completed the intake on your platform.\n\nName: ${f.name || ''}\nCountry: ${f.country || ''}\nClassification: ${cls}\nFY: ${fy}\n\nPlease contact me to proceed.\n\nRegards,\n${f.name || ''}`);
    const waText = encodeURIComponent(`Hi, I completed the NRI Tax intake.\n\nName: ${f.name || ''}\nClassification: ${cls}\nFY: ${fy}\n\nPlease contact me to proceed.`);

    return (
      <div className="min-h-screen bg-[#f5f2ec]">
        <nav className="bg-[#1a1a1a] px-6 h-14 flex items-center">
          <a href="/" className="font-serif text-[#C49A3C] font-bold tracking-wide">NRI TAX SUITE</a>
        </nav>
        <div className="bg-[#1a1a1a] text-center py-1.5">
          <span className="text-[11px] text-gray-400 tracking-wide">Trusted by 500+ NRIs across 15+ countries &nbsp;|&nbsp; CA &middot; CS &middot; CMA Certified</span>
        </div>

        <div className="max-w-2xl mx-auto py-10 px-4">
          {/* Hero savings or completion banner */}
          {cgData ? (
            <div className="text-center mb-10">
              <div className="inline-block bg-green-50 border-2 border-green-200 rounded-2xl px-10 py-8 mb-4">
                <div className="text-sm text-green-700 font-semibold mb-1">Potential Tax Savings Identified</div>
                <div className="font-serif text-5xl font-bold text-green-800 tracking-tight">{formatINR(cgData.savings)}</div>
                <div className="text-sm text-green-600 mt-2">Option {cgData.better} is more favourable for you</div>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1a1a1a] mt-4">Your Tax Diagnostic is Ready</h1>
              <p className="text-gray-500 mt-2">Here is what we found from your intake</p>
            </div>
          ) : (
            <div className="text-center mb-10">
              <div className="text-5xl mb-4" aria-hidden="true">{'\u2705'}</div>
              <h1 className="font-serif text-3xl font-bold text-[#1a1a1a]">Your Tax Diagnostic is Ready</h1>
              <p className="text-gray-500 mt-2">Here is what we found from your intake</p>
            </div>
          )}

          {/* Classification card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="font-serif text-xl font-bold text-[#1a1a1a]">Case Classification</div>
              <span className="text-xl font-bold px-8 py-2 rounded-full" style={{
                background: clsColor + '15',
                color: clsColor,
                border: `2px solid ${clsColor}40`
              }}>{cls}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {cls === 'Green' && 'Your case appears straightforward. Simple filing with limited complexity.'}
              {cls === 'Amber' && 'Your case has moderate complexity \u2014 advisory review recommended alongside filing.'}
              {cls === 'Red' && 'Your case involves significant complexity \u2014 premium compliance service recommended.'}
            </p>
          </div>

          {/* CG Analysis */}
          {cgData && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-5">
              <h3 className="font-serif text-lg font-bold text-green-800 mb-4">Capital Gains Analysis Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="text-xs text-gray-500 mb-1">Option A (20% with indexation)</div>
                  <div className="font-bold text-xl">{formatINR(cgData.optionA.total)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="text-xs text-gray-500 mb-1">Option B (12.5% flat)</div>
                  <div className="font-bold text-xl">{formatINR(cgData.optionB.total)}</div>
                </div>
              </div>
              <div className="mt-4 bg-green-100 rounded-xl p-4 text-center">
                <div className="text-green-800 font-bold">Option {cgData.better} saves you {formatINR(cgData.savings)}</div>
                <div className="text-green-600 text-xs mt-1">Plus Section 54/54EC could reduce this further or eliminate it entirely</div>
              </div>
            </div>
          )}

          {/* What You'll Get */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-5 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-5">What You Will Get</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['\uD83D\uDCC4', 'CG Computation Sheet', 'Dual-option working with indexation comparison'],
                ['\uD83D\uDCDD', 'Client Advisory Memo', 'Professional analysis of your tax position'],
                ['\uD83D\uDCC8', 'Tax Position Report', 'Full diagnostic summary with recommendations'],
                ['\uD83D\uDCCB', 'Engagement Quote', 'Clear scope, timeline & transparent pricing']
              ].map(([icon, title, desc], i) => (
                <div key={i} className="bg-[#f5f2ec] rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
                  <div className="font-semibold text-sm text-[#1a1a1a]">{title}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing / Recommended Service */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-5 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-4">Recommended Service</h3>
            {cls === 'Green' && (
              <div>
                <div className="text-lg font-bold text-[#1a1a1a] mb-1">Basic Filing</div>
                <div className="text-[#C49A3C] font-bold text-xl mb-3">{'\u20B9'}8,000 \u2013 {'\u20B9'}15,000</div>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li>{'\u2022'} Return preparation and filing</li>
                  <li>{'\u2022'} Income computation summary</li>
                  <li>{'\u2022'} Basic compliance check</li>
                </ul>
              </div>
            )}
            {cls === 'Amber' && (
              <div>
                <div className="text-lg font-bold text-[#1a1a1a] mb-1">Advisory Filing</div>
                <div className="text-[#C49A3C] font-bold text-xl mb-3">{'\u20B9'}18,000 \u2013 {'\u20B9'}30,000</div>
                <ul className="text-sm text-gray-600 space-y-1.5">
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
                <div className="text-lg font-bold text-[#1a1a1a] mb-1">Premium Compliance</div>
                <div className="text-[#C49A3C] font-bold text-xl mb-3">{'\u20B9'}35,000 \u2013 {'\u20B9'}75,000</div>
                <ul className="text-sm text-gray-600 space-y-1.5">
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
          <div className="bg-amber-50 border-2 border-[#C49A3C] rounded-2xl p-8 text-center mb-5">
            <h3 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-2">Ready to Proceed?</h3>
            <p className="text-sm text-gray-600 mb-6">Our team will review your intake and prepare a detailed engagement scope within 24 hours.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href={`mailto:tax@mkwadvisors.com?subject=${mailSubject}&body=${mailBody}`}
                className="bg-[#C49A3C] text-[#1a1a1a] px-8 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 transition inline-block">
                Email Us to Proceed {'\u2192'}
              </a>
              <a href={`https://wa.me/919876543210?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition inline-block">
                WhatsApp Us
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">Or call: <strong>+91-98765 43210</strong></p>
          </div>

          {/* Confidentiality footer */}
          <div className="text-center py-6 border-t border-gray-200 mt-8">
            <p className="text-xs text-gray-400">{'\uD83D\uDD12'} Your data is encrypted and confidential. We respond within 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── WIZARD ──
  const titles = ['Describe Your Situation', 'India Connections', 'Income & Transactions', 'Documents & Context', 'Review & Submit'];
  return (
    <div className="min-h-screen bg-[#f5f2ec]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
        @keyframes pulse-gold { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes flash-success { 0% { opacity: 0; transform: scale(0.95); } 20% { opacity: 1; transform: scale(1); } 80% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.95); } }
        .step-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .step-fade-out { animation: fadeOut 0.15s ease-in forwards; }
        .pulse-reading { animation: pulse-gold 1.5s ease-in-out infinite; }
        .flash-success { animation: flash-success 1.2s ease-out forwards; }
      `}</style>

      <nav className="bg-[#1a1a1a] px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-serif text-[#C49A3C] font-bold tracking-wide">NRI TAX SUITE</a>
        <a href="/login" className="text-gray-400 text-xs hover:text-white transition-colors">Team Login</a>
      </nav>

      {/* Trust bar */}
      <div className="bg-[#1a1a1a] border-t border-gray-800 text-center py-1.5">
        <span className="text-[11px] text-gray-400 tracking-wide">Trusted by 500+ NRIs across 15+ countries &nbsp;|&nbsp; CA &middot; CS &middot; CMA Certified</span>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 0 ? goStep(step - 1) : window.location.href = '/'} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors" aria-label="Go back">{'\u2039'}</button>
          <div className="flex-1">
            <div className="font-serif text-xl font-bold text-[#1a1a1a]">{titles[step]}</div>
            <div className="text-xs text-gray-400 mt-0.5">Free NRI Tax Diagnostic &middot; FY {fy}</div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Step content with transitions */}
        <div className={fadeDir === 'in' ? 'step-fade-in' : 'step-fade-out'}>

        {/* Step 0 */}
        {step === 0 && <div>
          {/* AI Hero Section */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-[#C49A3C] rounded-2xl p-8 mb-6 relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl" aria-hidden="true">{'\u2728'}</span>
                <h2 className="font-serif text-lg font-bold text-[#1a1a1a]">AI-Powered Intake</h2>
              </div>
              <p className="text-sm text-gray-600 mb-5">Describe your situation in plain English. Our AI will extract all the details and fill in the form for you.</p>

              <textarea value={narr} onChange={e => setNarr(e.target.value)} rows={6}
                placeholder={"Example: I work in London since 2021, came to India for about 38 days. I sold a plot in Nashik for \u20B968 lakhs (bought in 2017 for \u20B922 lakhs). I also have a flat in Pune rented at \u20B925,000/month. NRO interest around \u20B91.4 lakhs, FD interest \u20B985,000. UK salary about GBP 72,000, UK tax paid. I want to know about property tax savings and foreign tax credit."}
                className="w-full p-4 border-2 border-amber-200 rounded-xl text-sm resize-y bg-white/80 focus:ring-2 focus:ring-[#C49A3C] focus:border-[#C49A3C] outline-none transition-shadow placeholder:text-gray-400 placeholder:leading-relaxed"
                disabled={prs}
              />

              {/* Parsing state */}
              {prs && (
                <div className="absolute inset-0 bg-amber-50/90 rounded-2xl flex flex-col items-center justify-center">
                  <div className="pulse-reading text-4xl mb-3">{'\u2728'}</div>
                  <div className="font-serif text-lg font-bold text-[#C49A3C]">Reading your situation...</div>
                  <p className="text-sm text-gray-500 mt-1">Extracting details from your description</p>
                </div>
              )}

              {/* Parse success flash */}
              {parseDone && (
                <div className="absolute inset-0 bg-green-50/95 rounded-2xl flex flex-col items-center justify-center flash-success">
                  <div className="text-5xl mb-3">{'\u2705'}</div>
                  <div className="font-serif text-lg font-bold text-green-700">Fields auto-filled!</div>
                  <p className="text-sm text-green-600 mt-1">Taking you to the next step...</p>
                </div>
              )}

              {!prs && !parseDone && (
                <button onClick={doParse} disabled={prs || !narr.trim()}
                  className="mt-4 bg-[#C49A3C] text-[#1a1a1a] px-8 py-3 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-amber-400 transition-all hover:shadow-md">
                  {'\u2728'} Auto-Fill My Details
                </button>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or fill manually</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Manual form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-2 gap-5">
              <I l="Your Full Name *" v={f.name} ch={v => u('name', v)} ph="Rajesh Mehta" />
              <I l="Country of Residence *"><S v={f.country} ch={v => u('country', v)} o={COUNTRIES} /></I>
              <I l="Occupation" v={f.occupation} ch={v => u('occupation', v)} ph="e.g. IT Manager" />
              <I l="Years Abroad"><S v={f.yearsAbroad} ch={v => u('yearsAbroad', v)} o={['Less than 1 year', '1-3 years', '3-5 years', '5+ years']} /></I>
              <I l="Email" v={f.email} ch={v => u('email', v)} ph="your@email.com" type="email" />
              <I l="Phone" v={f.phone} ch={v => u('phone', v)} ph="+44 / +91..." />
            </div>
          </div>
          <button onClick={() => goStep(1)} disabled={!f.name || !f.country}
            className="w-full mt-5 bg-[#1a1a1a] text-white py-3.5 rounded-xl font-semibold disabled:opacity-30 hover:bg-gray-800 transition-all text-base">Continue {'\u2192'}</button>
        </div>}

        {/* Step 1 */}
        {step === 1 && <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-2 gap-5">
              <I l="Days in India this year" v={f.stayDays} ch={v => u('stayDays', v)} ph="38" tip="Approximate is fine \u2014 we verify later" />
              <I l="How do you know?"><S v={f.staySource} ch={v => u('staySource', v)} o={['Self-estimate', 'Passport records', 'Travel summary']} /></I>
              <I l="Family / home in India?"><S v={f.familyInIndia} ch={v => u('familyInIndia', v)} o={['Yes', 'No', 'Partly']} /></I>
              <I l="Did you sell property this year?"><S v={f.propertySale ? 'Yes' : 'No'} ch={v => { u('propertySale', v === 'Yes'); u('cgProperty', v === 'Yes'); }} o={['No', 'Yes']} /></I>
              {f.propertySale && <>
                <I l="When was it purchased?" tip="This determines which tax option applies"><S v={f.propertyAcqFY} ch={v => u('propertyAcqFY', v)} o={Object.keys(CII).filter(k => parseInt(k) >= 2005).map(k => ({ v: k, l: 'FY ' + k }))} /></I>
                <I l="Sale price (\u20B9)" v={f.salePrice} ch={v => u('salePrice', parseInt(v) || 0)} ph="6800000" type="number" />
                <I l="Purchase cost (\u20B9)" v={f.purchaseCost} ch={v => u('purchaseCost', parseInt(v) || 0)} ph="2200000" type="number" />
                <I l="City / Location" v={f.propertyLocation} ch={v => u('propertyLocation', v)} ph="Nashik" />
                <I l="Bought or planning to buy new house?" wide tip="Important \u2014 this can eliminate your capital gains tax entirely">
                  <S v={f.section54} ch={v => u('section54', v)} o={['Not sure', 'Yes \u2014 bought new house', 'Planning to buy', 'Considering government bonds', 'No']} />
                </I>
              </>}
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(0)} className="flex-1 border border-gray-300 bg-white py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">{'\u2190'} Back</button>
            <button onClick={() => goStep(2)} className="flex-[2] bg-[#1a1a1a] text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">Continue {'\u2192'}</button>
          </div>
        </div>}

        {/* Step 2 */}
        {step === 2 && <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-5 shadow-sm">
            <div className="text-sm font-semibold mb-4">What Indian income do you have? <span className="text-gray-400 font-normal">(tick all that apply)</span></div>
            <div className="grid grid-cols-2 gap-1">
              {[['salary', 'Salary in India'], ['rent', 'Rental income'], ['interest', 'Bank / FD interest'], ['dividend', 'Dividends'], ['cgShares', 'Sold shares'], ['cgMF', 'Sold mutual funds'], ['cgESOPRSU', 'ESOP / RSU sale'], ['business', 'Business / consulting']].map(([k, l]) =>
                <C key={k} l={l} c={f[k]} ch={v => u(k, v)} />
              )}
            </div>
          </div>
          {(f.rent || f.interest) && <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-5 shadow-sm">
            <div className="text-sm font-semibold mb-4">Quick amounts <span className="text-gray-400 font-normal">(approximate is fine)</span></div>
            {f.rent && <I l="Monthly rent amount (\u20B9)" v={f.rentalMonthly} ch={v => u('rentalMonthly', parseInt(v) || 0)} ph="25000" type="number" />}
            {f.interest && <div className="grid grid-cols-2 gap-4 mt-4">
              <I l="NRO interest (\u20B9/year)" v={f.nroInterest} ch={v => u('nroInterest', parseInt(v) || 0)} ph="140000" type="number" />
              <I l="FD interest (\u20B9/year)" v={f.fdInterest} ch={v => u('fdInterest', parseInt(v) || 0)} ph="85000" type="number" />
            </div>}
          </div>}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-5 shadow-sm">
            <div className="text-sm font-semibold mb-4">Foreign income</div>
            <div className="grid grid-cols-2 gap-1">
              <C l="I earn salary abroad" c={f.foreignSalary} ch={v => u('foreignSalary', v)} />
              <C l="I pay tax abroad" c={f.foreignTaxPaid} ch={v => u('foreignTaxPaid', v)} />
            </div>
            {f.foreignSalary && <div className="mt-4"><I l="Details" v={f.foreignDetails} ch={v => u('foreignDetails', v)} ph="e.g. UK salary GBP 72,000, UK tax paid" wide /></div>}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(1)} className="flex-1 border border-gray-300 bg-white py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">{'\u2190'} Back</button>
            <button onClick={() => goStep(3)} className="flex-[2] bg-[#1a1a1a] text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">Continue {'\u2192'}</button>
          </div>
        </div>}

        {/* Step 3 */}
        {step === 3 && <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-2 gap-5">
              <I l="Do you have AIS?"><S v={f.ais} ch={v => u('ais', v)} o={['Yes', 'Downloaded but not reviewed', 'No', "Don't know what this is"]} /></I>
              <I l="Total Indian assets?"><S v={f.indianAssets} ch={v => u('indianAssets', v)} o={['Below \u20B950 Lakhs', '\u20B950L \u2013 \u20B91 Crore', 'Above \u20B91 Crore', 'Not sure']} /></I>
              <I l="Any prior tax notices?"><S v={f.priorNotices} ch={v => u('priorNotices', v)} o={['None', 'Yes', 'Not sure']} /></I>
              <I l="What help do you need?"><S v={f.serviceNeed} ch={v => u('serviceNeed', v)} o={['Just file my return', 'Filing + advice on my situation', 'Tax planning + filing', 'Just want to understand what I owe']} /></I>
            </div>
            <div className="mt-5"><I l="Anything else we should know?" wide>
              <textarea value={f.notes || ''} onChange={e => u('notes', e.target.value)} rows={3}
                className="w-full p-4 border border-gray-200 rounded-lg text-sm resize-y bg-white focus:ring-2 focus:ring-[#C49A3C] focus:border-[#C49A3C] outline-none transition-shadow" placeholder="Any specific questions, transaction details, or concerns..." />
            </I></div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(2)} className="flex-1 border border-gray-300 bg-white py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">{'\u2190'} Back</button>
            <button onClick={() => goStep(4)} className="flex-[2] bg-[#1a1a1a] text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">Review {'\u2192'}</button>
          </div>
        </div>}

        {/* Step 4: Review */}
        {step === 4 && <div>
          {/* Classification badge — prominent */}
          <div className="rounded-2xl p-8 mb-5 border-2 shadow-sm" style={{
            background: { Green: '#2A6B4A08', Amber: '#B07D3A08', Red: '#A0484808' }[classifyCase(f)],
            borderColor: { Green: '#2A6B4A40', Amber: '#B07D3A40', Red: '#A0484840' }[classifyCase(f)]
          }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-serif text-lg font-bold text-[#1a1a1a]">Your Case Complexity</div>
                <div className="text-xs text-gray-500 mt-0.5">Auto-classified from your inputs</div>
              </div>
              <span className="text-2xl font-bold px-8 py-2.5 rounded-full" style={{
                background: { Green: '#2A6B4A20', Amber: '#B07D3A20', Red: '#A0484820' }[classifyCase(f)],
                color: { Green: '#2A6B4A', Amber: '#B07D3A', Red: '#A04848' }[classifyCase(f)],
                border: `2px solid ${{ Green: '#2A6B4A', Amber: '#B07D3A', Red: '#A04848' }[classifyCase(f)]}30`
              }}>{classifyCase(f)}</span>
            </div>
          </div>

          {/* CG savings card — highlighted */}
          {cgData && <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif font-bold text-green-800 text-base">Capital Gains Preview</div>
                <div className="text-green-700 text-sm mt-1">Option {cgData.better} is more favourable</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600 font-medium">You could save</div>
                <div className="font-serif text-3xl font-bold text-green-800">{formatINR(cgData.savings)}</div>
              </div>
            </div>
            <div className="mt-3 text-green-700 text-xs">Tax: {formatINR(cgData.better === 'B' ? cgData.optionB.total : cgData.optionA.total)} (before exemptions)</div>
          </div>}

          {/* Details summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-5 shadow-sm">
            <div className="font-serif text-base font-bold text-[#1a1a1a] mb-4">Your Details</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Name', f.name], ['Country', f.country], ['Stay', '~' + (f.stayDays || '?') + ' days'], ['Email', f.email], ['Service', f.serviceNeed], ['Assets', f.indianAssets]].filter(([, v]) => v).map(([l, v], i) =>
                <div key={i} className="flex gap-2">
                  <span className="text-gray-400 shrink-0">{l}:</span>
                  <strong className="text-[#1a1a1a]">{v}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => goStep(3)} className="flex-1 border border-gray-300 bg-white py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">{'\u2190'} Back</button>
            <button onClick={handleSubmit} className="flex-[2] bg-[#C49A3C] text-[#1a1a1a] py-3.5 rounded-xl font-bold text-base hover:bg-amber-400 transition-all hover:shadow-md">Get My Tax Diagnostic {'\u2192'}</button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">Free &middot; No obligation &middot; Your data is confidential</p>
        </div>}

        </div>{/* end fade wrapper */}
      </div>
    </div>
  );
}
