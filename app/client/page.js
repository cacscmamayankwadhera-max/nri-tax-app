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
  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const cfg = FY_CONFIG[fy];
  const cgData = (f.salePrice && f.purchaseCost) ? computeCapitalGains(f.salePrice, f.purchaseCost, f.propertyAcqFY || '2017-18', fy) : null;

  async function doParse() {
    if (!narr.trim()) return;
    setPrs(true);
    try {
      const res = await fetch('/api/ai/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ narrative: narr }) });
      const { parsed } = await res.json();
      if (parsed) setF(prev => ({ ...prev, ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== false && v !== '' && v !== 0)) }));
    } catch (e) { /* continue manually */ }
    setPrs(false);
    setStep(1);
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
      <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
      {children || <input type={type || 'text'} value={v || ''} onChange={e => ch(e.target.value)} placeholder={ph}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-300 outline-none" />}
      {tip && <p className="text-[10px] text-gray-400 mt-0.5">{tip}</p>}
    </div>
  );
  const S = ({ v, ch, o, ph }) => (
    <select value={v || ''} onChange={e => ch(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-300 outline-none">
      <option value="">{ph || 'Select'}</option>
      {o.map(x => typeof x === 'string' ? <option key={x}>{x}</option> : <option key={x.v} value={x.v}>{x.l}</option>)}
    </select>
  );
  const C = ({ l, c, ch }) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
      <input type="checkbox" checked={!!c} onChange={e => ch(e.target.checked)} className="accent-amber-500 w-4 h-4" />{l}
    </label>
  );

  // ── SUBMITTED: Show diagnostic ──
  if (submitted) {
    const cls = classifyCase(f);
    return (
      <div className="min-h-screen bg-[#f5f2ec]">
        <nav className="bg-[#1a1a1a] px-6 h-14 flex items-center">
          <a href="/" className="font-serif text-[#C49A3C] font-bold">NRI TAX SUITE</a>
        </nav>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="font-serif text-3xl font-bold">Your Tax Diagnostic is Ready</h1>
            <p className="text-gray-500 mt-2">Here's what we found from your intake</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="font-serif text-lg font-bold">Case Classification</div>
              <span className="text-lg font-bold px-6 py-1.5 rounded-full" style={{
                background: { Green: '#2A6B4A18', Amber: '#B07D3A18', Red: '#A0484818' }[cls],
                color: { Green: '#2A6B4A', Amber: '#B07D3A', Red: '#A04848' }[cls]
              }}>{cls}</span>
            </div>
            <p className="text-sm text-gray-600">
              {cls === 'Green' && 'Your case appears straightforward. Simple filing with limited complexity.'}
              {cls === 'Amber' && 'Your case has moderate complexity — advisory review recommended alongside filing.'}
              {cls === 'Red' && 'Your case involves significant complexity — premium compliance service recommended.'}
            </p>
          </div>

          {cgData && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
              <h3 className="font-serif font-bold text-green-800 mb-2">Capital Gains Analysis Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-gray-500">Option A (20% with indexation)</div>
                  <div className="font-bold text-lg">{formatINR(cgData.optionA.total)}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-gray-500">Option B (12.5% flat)</div>
                  <div className="font-bold text-lg">{formatINR(cgData.optionB.total)}</div>
                </div>
              </div>
              <div className="mt-3 bg-green-100 rounded-lg p-3 text-center">
                <div className="text-green-800 font-bold">Option {cgData.better} saves you {formatINR(cgData.savings)}</div>
                <div className="text-green-600 text-xs mt-1">Plus Section 54/54EC could reduce this further or eliminate it entirely</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h3 className="font-serif font-bold mb-3">Recommended Service</h3>
            <div className="text-sm text-gray-600 space-y-2">
              {cls === 'Green' && <p><strong>Basic Filing</strong> — ₹8,000–15,000. Includes return preparation, filing, and computation summary.</p>}
              {cls === 'Amber' && <p><strong>Advisory Filing</strong> — ₹18,000–30,000. Includes filing plus advisory review, residency analysis, and structured advisory note.</p>}
              {cls === 'Red' && <p><strong>Premium Compliance</strong> — ₹35,000–75,000. Includes detailed review, dual CG computation, DTAA analysis, Section 54 planning, advisory memo, and senior review.</p>}
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-[#C49A3C] rounded-xl p-6 text-center">
            <h3 className="font-serif text-xl font-bold mb-2">Ready to Proceed?</h3>
            <p className="text-sm text-gray-600 mb-4">Our team will review your intake and prepare a detailed engagement scope within 24 hours.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="mailto:tax@mkwadvisors.com?subject=NRI Tax Filing — {f.name}&body=Hi, I just completed the intake on your platform. My classification is {cls}. Please contact me to proceed."
                className="bg-[#C49A3C] text-[#1a1a1a] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-amber-400 transition">
                Email Us to Proceed →
              </a>
              <a href="https://wa.me/91XXXXXXXXXX?text=Hi, I completed the NRI Tax intake. Classification: {cls}. Please contact me."
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition">
                WhatsApp Us
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-3">Or call: +91-XXXXX XXXXX</p>
          </div>
        </div>
      </div>
    );
  }

  // ── WIZARD ──
  const titles = ['Describe Your Situation', 'India Connections', 'Income & Transactions', 'Documents & Context', 'Review & Submit'];
  return (
    <div className="min-h-screen bg-[#f5f2ec]">
      <nav className="bg-[#1a1a1a] px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-serif text-[#C49A3C] font-bold">NRI TAX SUITE</a>
        <a href="/login" className="text-gray-400 text-xs hover:text-white">Team Login</a>
      </nav>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 0 ? setStep(step - 1) : window.location.href = '/'} className="text-gray-400 hover:text-gray-600 text-xl">‹</button>
          <div className="flex-1">
            <div className="font-serif text-lg font-bold">{titles[step]}</div>
            <div className="text-xs text-gray-400">Free NRI Tax Diagnostic · FY {fy}</div>
          </div>
          <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">Step {step + 1}/5</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full mb-6"><div className="h-1.5 bg-[#C49A3C] rounded-full transition-all" style={{ width: `${(step + 1) / 5 * 100}%` }} /></div>

        {/* Step 0 */}
        {step === 0 && <div>
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3"><span className="text-xl">✨</span><span className="text-sm font-semibold text-amber-700">Just describe your situation — our AI will do the rest</span></div>
            <textarea value={narr} onChange={e => setNarr(e.target.value)} rows={4}
              placeholder="Example: I work in London since 2021, came to India for about 38 days. I sold a plot in Nashik for ₹68 lakhs (bought in 2017 for ₹22 lakhs). I also have a flat in Pune rented at ₹25,000/month. NRO interest around ₹1.4 lakhs, FD interest ₹85,000. UK salary about GBP 72,000, UK tax paid. I want to know about property tax savings and foreign tax credit."
              className="w-full p-3 border border-amber-200 rounded-lg text-sm resize-y" />
            <button onClick={doParse} disabled={prs || !narr.trim()}
              className="mt-3 bg-[#C49A3C] text-[#1a1a1a] px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-amber-400 transition">
              {prs ? 'AI is reading...' : '✨ Auto-Fill My Details'}
            </button>
          </div>
          <div className="text-center text-xs text-gray-400 my-4">— or fill in step by step —</div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <I l="Your Full Name *" v={f.name} ch={v => u('name', v)} ph="Rajesh Mehta" />
              <I l="Country of Residence *"><S v={f.country} ch={v => u('country', v)} o={COUNTRIES} /></I>
              <I l="Occupation" v={f.occupation} ch={v => u('occupation', v)} ph="e.g. IT Manager" />
              <I l="Years Abroad"><S v={f.yearsAbroad} ch={v => u('yearsAbroad', v)} o={['Less than 1 year', '1-3 years', '3-5 years', '5+ years']} /></I>
              <I l="Email" v={f.email} ch={v => u('email', v)} ph="your@email.com" type="email" />
              <I l="Phone" v={f.phone} ch={v => u('phone', v)} ph="+44 / +91..." />
            </div>
          </div>
          <button onClick={() => setStep(1)} disabled={!f.name || !f.country}
            className="w-full mt-4 bg-[#1a1a1a] text-white py-3 rounded-xl font-semibold disabled:opacity-30 hover:bg-gray-800 transition">Continue →</button>
        </div>}

        {/* Step 1 */}
        {step === 1 && <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <I l="Days in India this year" v={f.stayDays} ch={v => u('stayDays', v)} ph="38" tip="Approximate is fine — we verify later" />
              <I l="How do you know?"><S v={f.staySource} ch={v => u('staySource', v)} o={['Self-estimate', 'Passport records', 'Travel summary']} /></I>
              <I l="Family / home in India?"><S v={f.familyInIndia} ch={v => u('familyInIndia', v)} o={['Yes', 'No', 'Partly']} /></I>
              <I l="Did you sell property this year?"><S v={f.propertySale ? 'Yes' : 'No'} ch={v => { u('propertySale', v === 'Yes'); u('cgProperty', v === 'Yes'); }} o={['No', 'Yes']} /></I>
              {f.propertySale && <>
                <I l="When was it purchased?" tip="This determines which tax option applies"><S v={f.propertyAcqFY} ch={v => u('propertyAcqFY', v)} o={Object.keys(CII).filter(k => parseInt(k) >= 2005).map(k => ({ v: k, l: 'FY ' + k }))} /></I>
                <I l="Sale price (₹)" v={f.salePrice} ch={v => u('salePrice', parseInt(v) || 0)} ph="6800000" type="number" />
                <I l="Purchase cost (₹)" v={f.purchaseCost} ch={v => u('purchaseCost', parseInt(v) || 0)} ph="2200000" type="number" />
                <I l="City / Location" v={f.propertyLocation} ch={v => u('propertyLocation', v)} ph="Nashik" />
                <I l="Bought or planning to buy new house?" wide tip="Important — this can eliminate your capital gains tax entirely">
                  <S v={f.section54} ch={v => u('section54', v)} o={['Not sure', 'Yes — bought new house', 'Planning to buy', 'Considering government bonds', 'No']} />
                </I>
              </>}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 bg-white py-2.5 rounded-xl font-medium hover:bg-gray-50">← Back</button>
            <button onClick={() => setStep(2)} className="flex-[2] bg-[#1a1a1a] text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800">Continue →</button>
          </div>
        </div>}

        {/* Step 2 */}
        {step === 2 && <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="text-sm font-semibold mb-3">What Indian income do you have? <span className="text-gray-400 font-normal">(tick all that apply)</span></div>
            <div className="grid grid-cols-2 gap-1">
              {[['salary', 'Salary in India'], ['rent', 'Rental income'], ['interest', 'Bank / FD interest'], ['dividend', 'Dividends'], ['cgShares', 'Sold shares'], ['cgMF', 'Sold mutual funds'], ['cgESOPRSU', 'ESOP / RSU sale'], ['business', 'Business / consulting']].map(([k, l]) =>
                <C key={k} l={l} c={f[k]} ch={v => u(k, v)} />
              )}
            </div>
          </div>
          {(f.rent || f.interest) && <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="text-sm font-semibold mb-3">Quick amounts <span className="text-gray-400 font-normal">(approximate is fine)</span></div>
            {f.rent && <I l="Monthly rent amount (₹)" v={f.rentalMonthly} ch={v => u('rentalMonthly', parseInt(v) || 0)} ph="25000" type="number" />}
            {f.interest && <div className="grid grid-cols-2 gap-3 mt-3">
              <I l="NRO interest (₹/year)" v={f.nroInterest} ch={v => u('nroInterest', parseInt(v) || 0)} ph="140000" type="number" />
              <I l="FD interest (₹/year)" v={f.fdInterest} ch={v => u('fdInterest', parseInt(v) || 0)} ph="85000" type="number" />
            </div>}
          </div>}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="text-sm font-semibold mb-3">Foreign income</div>
            <div className="grid grid-cols-2 gap-1">
              <C l="I earn salary abroad" c={f.foreignSalary} ch={v => u('foreignSalary', v)} />
              <C l="I pay tax abroad" c={f.foreignTaxPaid} ch={v => u('foreignTaxPaid', v)} />
            </div>
            {f.foreignSalary && <div className="mt-3"><I l="Details" v={f.foreignDetails} ch={v => u('foreignDetails', v)} ph="e.g. UK salary GBP 72,000, UK tax paid" wide /></div>}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 bg-white py-2.5 rounded-xl font-medium">← Back</button>
            <button onClick={() => setStep(3)} className="flex-[2] bg-[#1a1a1a] text-white py-2.5 rounded-xl font-semibold">Continue →</button>
          </div>
        </div>}

        {/* Step 3 */}
        {step === 3 && <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <I l="Do you have AIS?"><S v={f.ais} ch={v => u('ais', v)} o={['Yes', 'Downloaded but not reviewed', 'No', "Don't know what this is"]} /></I>
              <I l="Total Indian assets?"><S v={f.indianAssets} ch={v => u('indianAssets', v)} o={['Below ₹50 Lakhs', '₹50L – ₹1 Crore', 'Above ₹1 Crore', 'Not sure']} /></I>
              <I l="Any prior tax notices?"><S v={f.priorNotices} ch={v => u('priorNotices', v)} o={['None', 'Yes', 'Not sure']} /></I>
              <I l="What help do you need?"><S v={f.serviceNeed} ch={v => u('serviceNeed', v)} o={['Just file my return', 'Filing + advice on my situation', 'Tax planning + filing', 'Just want to understand what I owe']} /></I>
            </div>
            <div className="mt-4"><I l="Anything else we should know?" wide>
              <textarea value={f.notes || ''} onChange={e => u('notes', e.target.value)} rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-y" placeholder="Any specific questions, transaction details, or concerns..." />
            </I></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 bg-white py-2.5 rounded-xl font-medium">← Back</button>
            <button onClick={() => setStep(4)} className="flex-[2] bg-[#1a1a1a] text-white py-2.5 rounded-xl font-semibold">Review →</button>
          </div>
        </div>}

        {/* Step 4: Review */}
        {step === 4 && <div>
          <div className="rounded-xl p-5 mb-4 border-2" style={{
            background: { Green: '#2A6B4A08', Amber: '#B07D3A08', Red: '#A0484808' }[classifyCase(f)],
            borderColor: { Green: '#2A6B4A40', Amber: '#B07D3A40', Red: '#A0484840' }[classifyCase(f)]
          }}>
            <div className="flex justify-between items-center">
              <div><div className="font-bold">Your Case Complexity</div><div className="text-xs text-gray-500">Auto-classified from your inputs</div></div>
              <span className="text-lg font-bold px-6 py-1.5 rounded-full" style={{
                background: { Green: '#2A6B4A20', Amber: '#B07D3A20', Red: '#A0484820' }[classifyCase(f)],
                color: { Green: '#2A6B4A', Amber: '#B07D3A', Red: '#A04848' }[classifyCase(f)]
              }}>{classifyCase(f)}</span>
            </div>
          </div>

          {cgData && <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="font-bold text-green-800 text-sm">Capital Gains Preview</div>
            <div className="text-green-700 text-xs mt-1">Option {cgData.better} saves {formatINR(cgData.savings)} → Tax: {formatINR(cgData.better === 'B' ? cgData.optionB.total : cgData.optionA.total)} (before exemptions)</div>
          </div>}

          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[['Name', f.name], ['Country', f.country], ['Stay', '~' + (f.stayDays || '?') + ' days'], ['Email', f.email], ['Service', f.serviceNeed], ['Assets', f.indianAssets]].filter(([, v]) => v).map(([l, v], i) =>
                <div key={i}><span className="text-gray-400">{l}:</span> <strong>{v}</strong></div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(3)} className="flex-1 border border-gray-300 bg-white py-2.5 rounded-xl font-medium">← Back</button>
            <button onClick={handleSubmit} className="flex-[2] bg-[#C49A3C] text-[#1a1a1a] py-3 rounded-xl font-bold text-base hover:bg-amber-400 transition">Get My Tax Diagnostic →</button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">Free · No obligation · Your data is confidential</p>
        </div>}
      </div>
    </div>
  );
}
