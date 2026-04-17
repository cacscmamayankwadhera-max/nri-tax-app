'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { computeCapitalGains, computeHouseProperty, formatINR, classifyCase, FY_CONFIG, CII } from '@/lib/compute';

/* ═══ CONSTANTS ═══ */
const COUNTRIES = ["United Kingdom","United States","UAE","Singapore","Canada","Australia","Germany","Saudi Arabia","Qatar","Hong Kong","New Zealand","Other"];
const MODS = [
  { id:"intake", l:"Case Intake", ic:"📋", c:"#C49A3C" },
  { id:"residency", l:"Residency", ic:"🌍", c:"#4A7C5E" },
  { id:"income", l:"Income Map", ic:"📊", c:"#5670A8" },
  { id:"pricing", l:"Pricing", ic:"💰", c:"#B07D3A" },
  { id:"recon", l:"AIS Recon", ic:"🔍", c:"#7B5FA0", cp:"Senior Associate reviews classification and reconciliation readiness" },
  { id:"filing", l:"Form Select", ic:"📄", c:"#3D7D8F" },
  { id:"cg", l:"Capital Gains", ic:"🏠", c:"#A04848" },
  { id:"dtaa", l:"DTAA/FTC", ic:"🌐", c:"#2E6B70" },
  { id:"prefiling", l:"Pre-Filing", ic:"✅", c:"#4D7A2E", cp:"Senior Reviewer / Partner verifies before filing" },
  { id:"memo", l:"Advisory Memo", ic:"📝", c:"#7A6245" },
];
const DELS = [
  { id:"cg_sheet", l:"CG Computation Sheet", n:["cg"], d:"Dual-option tax computation with Section 54 planning", apiType:"cg_sheet" },
  { id:"memo_doc", l:"Client Advisory Memo", n:["memo"], d:"Professional advisory — facts, issues, risk flags, actions", apiType:"memo" },
  { id:"position", l:"Tax Position Report", n:["income","pricing"], d:"Diagnostic: residency, income, scope assessment", apiType:"position" },
  { id:"quote", l:"Engagement Quote", n:["pricing"], d:"Service tier, fee band, scope inclusions/exclusions", apiType:"quote" },
];
const CLS_COLORS = { Green:"#2A6B4A", Amber:"#B07D3A", Red:"#A04848" };

/* ═══ API HELPERS ═══ */
async function runAIModule(moduleId, formData, fy, moduleOutputs) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId, formData, fy, moduleOutputs })
  });
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  const data = await res.json();
  return data.output;
}

async function parseNarrative(text) {
  const res = await fetch('/api/ai/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ narrative: text })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.parsed;
}

async function downloadDocx(type, caseData, fy, moduleOutputs) {
  const res = await fetch('/api/deliverables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, caseData, fy, moduleOutputs })
  });
  if (!res.ok) throw new Error('DOCX generation failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const name = (caseData.name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '-');
  a.download = `${name}-${type}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ═══ MARKDOWN RENDERER ═══ */
function renderMd(text) {
  if (!text || text === 'auto') return '<em class="text-gray-400">Generated from intake form. Proceed to next module.</em>';
  return text
    .replace(/### (.*)/g, '<h3 class="font-serif text-sm font-bold text-gray-900 mt-5 mb-2 pb-1 border-b border-gray-200">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '<div class="pl-4 py-0.5 relative"><span class="absolute left-0 text-amber-500 font-bold">›</span>$1</div>')
    .replace(/\n{2,}/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br/>');
}

/* ═══ CG SHEET PREVIEW COMPONENT ═══ */
function CGPreview({ f, fy, cg }) {
  const today = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const T = ({ h, r }) => (
    <table className="w-full border-collapse my-2 text-xs">
      <thead><tr>{h.map((x,i) => <th key={i} className="bg-gray-200 p-1.5 border border-gray-300 font-bold text-left">{x}</th>)}</tr></thead>
      <tbody>{r.map((row,ri) => <tr key={ri}>{row.map((c,ci) => <td key={ci} className={`p-1.5 border border-gray-300 ${ci>0?'text-right':''} ${String(c).includes('Total')?'font-bold bg-gray-50':''}`}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
  if (!cg) return <p className="text-gray-400 text-sm">Property sale data required for computation.</p>;
  return (
    <div>
      <div className="text-sm font-bold text-amber-600 tracking-wide">MKW ADVISORS</div>
      <div className="text-xs text-gray-500 italic mb-3">NRI Tax Filing · Advisory · Compliance</div>
      <div className="border-b-2 border-amber-500 mb-4" />
      <div className="font-serif text-xl font-bold">Capital Gains Computation Sheet</div>
      <div className="text-gray-500 text-xs mb-3">Property Sale — FY {fy} | {today} | {f.name}</div>
      <div className="border-b-2 border-amber-500 mb-4" />

      <h3 className="font-serif text-sm font-bold mt-4 mb-1">1. Transaction Details</h3>
      <T h={["Particulars","Details"]} r={[["Asset",f.propertyType||"Residential Plot"],["Location",f.propertyLocation||"—"],["Acquired","FY "+(f.propertyAcqFY||"2017-18")],["Sold","FY "+fy],["Pre July 2024?","Yes — Dual computation"]]} />

      <h3 className="font-serif text-sm font-bold mt-4 mb-1">2. Key Amounts</h3>
      <T h={["Particulars","Amount"]} r={[["Sale Consideration",formatINR(f.salePrice||0)],["Cost of Acquisition",formatINR(f.purchaseCost||0)],["Improvement",formatINR(0)]]} />

      <h3 className="font-serif text-sm font-bold mt-4 mb-1">3. Dual Tax Computation</h3>
      <p className="text-xs font-semibold mb-2">Taxpayer may choose the lower-tax option:</p>

      <h4 className="text-xs font-bold text-blue-700 mt-3">Option A — 20% with Indexation</h4>
      <T h={["Particulars","Working","Amount"]} r={[
        ["CII Acquisition ("+(f.propertyAcqFY||"2017-18")+")","",cg.ciiAcq],
        ["CII Sale ("+fy+")","",cg.ciiSale],
        ["Cost","",formatINR(f.purchaseCost||0)],
        ["Indexed Cost",formatINR(f.purchaseCost||0)+"×"+cg.ciiSale+"/"+cg.ciiAcq,formatINR(cg.indexedCost)],
        ["Sale","",formatINR(f.salePrice||0)],
        ["LTCG",formatINR(f.salePrice||0)+"−"+formatINR(cg.indexedCost),formatINR(cg.optionA.ltcg)],
        ["Tax @20%","",formatINR(cg.optionA.tax)],
        ["Cess @4%","",formatINR(cg.optionA.cess)],
        ["Total Tax (A)","",formatINR(cg.optionA.total)]
      ]} />

      <h4 className="text-xs font-bold text-red-700 mt-3">Option B — 12.5% without Indexation</h4>
      <T h={["Particulars","Working","Amount"]} r={[
        ["Cost","",formatINR(f.purchaseCost||0)],
        ["Sale","",formatINR(f.salePrice||0)],
        ["LTCG",formatINR(f.salePrice||0)+"−"+formatINR(f.purchaseCost||0),formatINR(cg.optionB.ltcg)],
        ["Tax @12.5%","",formatINR(cg.optionB.tax)],
        ["Cess @4%","",formatINR(cg.optionB.cess)],
        ["Total Tax (B)","",formatINR(cg.optionB.total)]
      ]} />

      <h3 className="font-serif text-sm font-bold mt-4 mb-1">4. Comparison</h3>
      <div className="bg-green-50 border border-green-300 rounded p-2 my-2 text-xs font-bold text-green-800">
        RECOMMENDED: Option {cg.better} ({cg.better==="B"?"12.5% flat":"20% indexed"}) — saves {formatINR(cg.savings)}
      </div>
      <T h={["","Option A","Option B"]} r={[["Capital Gain",formatINR(cg.optionA.ltcg),formatINR(cg.optionB.ltcg)],["Tax+Cess",formatINR(cg.optionA.total),formatINR(cg.optionB.total)],["","",cg.better==="B"?"Saves "+formatINR(cg.savings):""]]} />

      <h3 className="font-serif text-sm font-bold mt-4 mb-1">5. Section 54/54EC</h3>
      <div className="bg-red-50 border border-red-300 rounded p-2 my-2 text-xs font-bold text-red-800">
        ACTION REQUIRED: Discuss exemptions BEFORE filing. Can eliminate CG tax entirely.
      </div>
      <p className="text-xs"><strong>Section 54:</strong> New house → full exemption. Tax saved: <strong>{formatINR(cg.netTax)}</strong></p>
      <p className="text-xs"><strong>Section 54EC:</strong> Bonds within 6 months. Max ₹50L. Tax saved: <strong>{formatINR(cg.sec54ecSaved)}</strong></p>
      <p className="text-xs"><strong>Status:</strong> {f.section54 || "NOT YET DISCUSSED"}</p>

      <h3 className="font-serif text-sm font-bold mt-4 mb-1">6. TDS</h3>
      <T h={["","Details"]} r={[["Section","194-IA (1%) or 195 (NRI)"],["Est. TDS (194-IA)",formatINR(cg.tds194IA)],["Form 16B","Required from buyer"]]} />

      <h3 className="font-serif text-sm font-bold mt-4 mb-1">7. Net Tax Summary</h3>
      <T h={["Scenario","Tax","After TDS"]} r={[
        ["Option "+cg.better+", no exemption",formatINR(cg.netTax),formatINR(cg.netAfterTDS)],
        ["Full Section 54","₹0","Refund "+formatINR(cg.tds194IA)]
      ]} />

      <div className="mt-6 border-t-2 border-amber-500 pt-3 text-[10px] text-gray-400 italic">
        Based on information as of {today}. Position may change. Not a formal legal opinion. © {new Date().getFullYear()} MKW Advisors.
      </div>
    </div>
  );
}

/* ═══ MEMO PREVIEW ═══ */
function MemoPreview({ f, fy, cg }) {
  const today = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const hp = f.rentalMonthly ? computeHouseProperty(f.rentalMonthly * 12) : null;
  const T = ({ h, r }) => (
    <table className="w-full border-collapse my-2 text-xs">
      <thead><tr>{h.map((x,i) => <th key={i} className="bg-gray-200 p-1.5 border border-gray-300 font-bold text-left">{x}</th>)}</tr></thead>
      <tbody>{r.map((row,ri) => <tr key={ri}>{row.map((c,ci) => <td key={ci} className={`p-1.5 border border-gray-300 ${ci>0?'text-right':''}`}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
  return (
    <div>
      <div className="text-sm font-bold text-amber-600 tracking-wide">MKW ADVISORS</div>
      <div className="text-xs text-gray-500 italic mb-3">NRI Tax Filing · Advisory · Compliance</div>
      <div className="border-b-2 border-amber-500 mb-4" />
      <div className="font-serif text-xl font-bold">Client Advisory Memo</div>
      <div className="text-gray-500 text-xs mb-1">NRI Tax Advisory — FY {fy} | {today}</div>
      <div className="text-xs mb-3"><strong>Client:</strong> {f.name} | <strong>AY:</strong> {FY_CONFIG[fy]?.ay} | <strong>By:</strong> MKW Advisors</div>
      <div className="border-b-2 border-amber-500 mb-4" />

      <h3 className="font-serif text-sm font-bold mt-3">Facts Captured</h3>
      <ul className="text-xs list-disc pl-5 leading-relaxed">
        <li>Resident in {f.country}, {f.yearsAbroad || "several years"} abroad</li>
        <li>India stay FY {fy}: ~{f.stayDays || "?"} days</li>
        {f.rent && <li>Rental: {f.rentalDetails || formatINR(f.rentalMonthly ? f.rentalMonthly*12 : 0)+"/yr"}</li>}
        {f.interest && <li>Interest: NRO {formatINR(f.nroInterest||0)}, FD {formatINR(f.fdInterest||0)}</li>}
        {f.propertySale && <li>Sold {f.propertyType||"property"} in {f.propertyLocation||"India"} for {formatINR(f.salePrice||0)}, acquired FY {f.propertyAcqFY||"?"} for {formatINR(f.purchaseCost||0)}</li>}
        {f.foreignSalary && <li>Foreign salary in {f.country}. {f.foreignTaxPaid?"Tax paid abroad. ":""}Asked about FTC.</li>}
      </ul>

      <h3 className="font-serif text-sm font-bold mt-4">Assumptions</h3>
      <ol className="text-xs list-decimal pl-5 leading-relaxed">
        <li>Non-Resident status (preliminary) based on ~{f.stayDays||"?"} days.</li>
        {f.purchaseCost && <li>Property cost {formatINR(f.purchaseCost)} — pending deed verification.</li>}
        <li>New tax regime (115BAC) assumed as default.</li>
      </ol>

      {cg && <>
        <h3 className="font-serif text-sm font-bold mt-4">Key Issue — Capital Gains</h3>
        <p className="text-xs">Dual computation: <strong>Option {cg.better}</strong> saves <strong>{formatINR(cg.savings)}</strong></p>
        <T h={["","A (indexed)","B (flat)"]} r={[["LTCG",formatINR(cg.optionA.ltcg),formatINR(cg.optionB.ltcg)],["Tax+Cess",formatINR(cg.optionA.total),formatINR(cg.optionB.total)]]} />
        <div className="bg-red-50 border border-red-300 rounded p-2 my-2 text-xs font-bold text-red-800">
          Section 54 planning: {f.section54||"NOT DISCUSSED"} — could eliminate tax entirely
        </div>
      </>}

      {f.foreignTaxPaid && <>
        <h3 className="font-serif text-sm font-bold mt-4">FTC Clarification</h3>
        <p className="text-xs">Your {f.country} salary is <strong>not taxable in India</strong> (NR status). FTC applies only when same income taxed in both countries. <strong>Not applicable here.</strong></p>
      </>}

      {hp && <>
        <h3 className="font-serif text-sm font-bold mt-4">Rental Income</h3>
        <T h={["","Amount"]} r={[["Gross Rent",formatINR(hp.grossRent)],["Std Deduction (30%)","("+formatINR(hp.standardDeduction)+")"],["Taxable",formatINR(hp.taxableIncome)]]} />
      </>}

      <h3 className="font-serif text-sm font-bold mt-4">Recommended Actions</h3>
      <ol className="text-xs list-decimal pl-5 leading-relaxed">
        {f.propertySale && <li>Provide sale deed and purchase deed</li>}
        {f.propertySale && <li>Confirm Section 54/54EC status</li>}
        <li>Provide Form 16B from buyer</li>
        {f.rent && <li>Share rent agreement</li>}
        <li>Share passport travel pages for FY {fy}</li>
        {f.foreignSalary && <li>Share {f.country} P60 / tax summary</li>}
      </ol>

      <div className="mt-6 border-t-2 border-amber-500 pt-3 text-[10px] text-gray-400 italic">
        Based on information as of {today}. Not a formal legal opinion. © {new Date().getFullYear()} MKW Advisors.
      </div>
    </div>
  );
}

/* ═══ SMALL UI COMPONENTS ═══ */
function Inp({ l, v, ch, tip, ph, type, wide, children }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
      {children || <input type={type||'text'} value={v||''} onChange={e=>ch(e.target.value)} placeholder={ph}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none" />}
      {tip && <p className="text-[10px] text-gray-400 mt-0.5">{tip}</p>}
    </div>
  );
}

function Sel({ v, ch, o, ph }) {
  return (
    <select value={v||''} onChange={e=>ch(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-amber-400 outline-none">
      <option value="">{ph||'Select'}</option>
      {o.map(x => typeof x === 'string' ? <option key={x}>{x}</option> : <option key={x.v} value={x.v}>{x.l}</option>)}
    </select>
  );
}

function Chk({ l, c, ch }) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
      <input type="checkbox" checked={!!c} onChange={e=>ch(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />{l}
    </label>
  );
}

/* ═══ MAIN APP ═══ */
export default function Dashboard() {
  const [view, setView] = useState('home');
  const [step, setStep] = useState(0);
  const [fy, setFy] = useState('2025-26');
  const [f, setF] = useState({});
  const [cases, setCases] = useState([]);
  const [ac, setAc] = useState(null);       // active case
  const [mi, setMi] = useState(0);          // active module index
  const [outs, setOuts] = useState({});      // module outputs
  const [ld, setLd] = useState(false);       // loading
  const [narr, setNarr] = useState('');      // narrative text
  const [prs, setPrs] = useState(false);     // parsing narrative
  const [dv, setDv] = useState(null);        // active deliverable view
  const [dlLd, setDlLd] = useState(false);   // downloading docx
  const printRef = useRef(null);
  const supabase = createClient();

  const u = (k, v) => setF(p => ({ ...p, [k]: v }));
  const cfg = FY_CONFIG[fy];
  const cgData = (f.salePrice && f.purchaseCost) ? computeCapitalGains(f.salePrice, f.purchaseCost, f.propertyAcqFY || '2017-18', fy) : null;

  // ── Load cases from Supabase on mount ──
  useEffect(() => {
    async function loadCases() {
      try {
        const { data } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
        if (data) setCases(data.map(c => ({ ...c, name: c.client_name, formData: c.intake_data, modulesDone: c.modules_completed })));
      } catch (e) { /* Supabase not configured yet — use local state */ }
    }
    loadCases();
  }, []);

  // ── Save case to Supabase ──
  async function saveCase(caseObj) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return caseObj; // not logged in, local only
      const { data } = await supabase.from('cases').insert({
        user_id: user.id,
        client_name: caseObj.name,
        client_email: f.email,
        country: caseObj.country,
        fy, ay: cfg.ay,
        classification: caseObj.classification,
        intake_data: f,
      }).select().single();
      return data ? { ...caseObj, dbId: data.id } : caseObj;
    } catch (e) { return caseObj; } // Supabase offline — continue locally
  }

  // ── Save module output to Supabase ──
  async function saveModuleOutput(caseId, moduleId, output) {
    if (!caseId) return;
    try {
      await supabase.from('module_outputs').upsert({ case_id: caseId, module_id: moduleId, output_text: output });
      await supabase.from('cases').update({ modules_completed: Object.keys(outs).length + 1 }).eq('id', caseId);
    } catch (e) { /* continue */ }
  }

  // ── Intake submit ──
  async function startCase() {
    const classification = classifyCase(f);
    const nc = { id: Date.now(), name: f.name || '?', country: f.country || '?', fy, classification, created: new Date().toLocaleDateString('en-IN'), formData: { ...f }, modulesDone: 1 };
    const saved = await saveCase(nc);
    setCases(p => [{ ...nc, dbId: saved.dbId }, ...p]);
    setAc({ ...nc, dbId: saved.dbId });
    setOuts({ intake: 'auto' });
    setMi(0);
    setView('case');
    setDv(null);
  }

  // ── Run AI module ──
  const runMod = useCallback(async (idx) => {
    const mod = MODS[idx];
    if (!mod || mod.id === 'intake') return;
    setLd(true);
    try {
      const output = await runAIModule(mod.id, f, fy, outs);
      setOuts(p => ({ ...p, [mod.id]: output }));
      setAc(p => p ? { ...p, modulesDone: Math.max(p.modulesDone || 1, idx + 1) } : p);
      if (ac?.dbId) saveModuleOutput(ac.dbId, mod.id, output);
    } catch (e) {
      setOuts(p => ({ ...p, [mod.id]: `Error: ${e.message}. Check your ANTHROPIC_API_KEY in .env.local.` }));
    }
    setLd(false);
  }, [f, fy, outs, ac]);

  // ── Parse narrative ──
  async function doParse() {
    if (!narr.trim()) return;
    setPrs(true);
    try {
      const parsed = await parseNarrative(narr);
      if (parsed) setF(prev => ({ ...prev, ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== false && v !== '' && v !== 0)) }));
    } catch (e) { /* continue manually */ }
    setPrs(false);
    setStep(1);
  }

  // ── Download DOCX ──
  async function handleDownload(type) {
    setDlLd(true);
    try {
      await downloadDocx(type, { name: f.name, country: f.country, classification: classifyCase(f), formData: f }, fy, outs);
    } catch (e) {
      alert('Download failed: ' + e.message);
    }
    setDlLd(false);
  }

  // ── Print deliverable ──
  function doPrint() {
    if (!printRef.current) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${dv} — ${f.name}</title><style>body{font-family:Arial,sans-serif;padding:40px 48px;color:#1a1a1a;line-height:1.6;max-width:780px;margin:0 auto}table{border-collapse:collapse;width:100%}th,td{border:1px solid #d4cdc0;padding:5px 8px;font-size:11px}th{background:#e8e0d4;font-weight:700}h3{font-family:Georgia;margin-top:18px;font-size:13px}h4{margin-top:10px;font-size:12px}@media print{body{padding:20px}}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  /* ═══ RENDER: HOME ═══ */
  if (view === 'home') return (
    <div className="min-h-screen bg-[#f5f2ec]">
      <nav className="bg-[#1a1a1a] px-6 h-12 flex items-center justify-between">
        <span className="font-serif text-[#C49A3C] font-bold tracking-wide text-sm">NRI TAX SUITE</span>
        <span className="text-[10px] text-gray-500 border border-gray-700 px-2 py-0.5 rounded">v3 · FY {fy}</span>
      </nav>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#1a1a1a]">NRI Tax Suite</h1>
          <p className="text-gray-500 mt-1 text-sm">AI-Assisted Tax Advisory · Real Deliverables</p>
          <div className="mt-2"><span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">FY {fy} · AY {cfg.ay} · CII {cfg.cii}</span></div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{l:'Total',v:cases.length,c:'text-gray-900'},{l:'Green',v:cases.filter(c=>c.classification==='Green').length,c:'text-green-700'},{l:'Amber',v:cases.filter(c=>c.classification==='Amber').length,c:'text-amber-600'},{l:'Red',v:cases.filter(c=>c.classification==='Red').length,c:'text-red-700'}].map((s,i)=>(
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{s.l}</div>
              <div className={`text-2xl font-bold font-serif ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3 mb-6">
          <button onClick={()=>{setF({});setStep(0);setNarr('');setOuts({});setDv(null);setView('wizard');}} className="bg-[#C49A3C] text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600 transition">+ New NRI Case</button>
          <select value={fy} onChange={e=>setFy(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
          </select>
        </div>
        {cases.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 opacity-30">📋</div>
            <p className="font-semibold">No cases yet</p>
            <p className="text-xs mt-1">Click "New NRI Case" to start</p>
          </div>
        ) : cases.map(c => (
          <div key={c.id || c.dbId} onClick={()=>{setAc(c);setF(c.formData||c.intake_data||{});setFy(c.fy);setOuts({intake:'auto'});setView('case');setDv(null);}}
            className="bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-pointer hover:bg-gray-50 transition flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">{c.name || c.client_name}</div>
              <div className="text-xs text-gray-400">{c.country} · FY {c.fy}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold px-3 py-0.5 rounded-full" style={{background:CLS_COLORS[c.classification]+'18',color:CLS_COLORS[c.classification]}}>{c.classification}</span>
              <span className="text-xs text-gray-400">{c.modulesDone || c.modules_completed || 1}/10</span>
              <span className="text-gray-300">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══ RENDER: WIZARD ═══ */
  if (view === 'wizard') {
    const titles = ['Quick Start', 'India Connections', 'Income & Transactions', 'Documents', 'Review'];
    return (
      <div className="min-h-screen bg-[#f5f2ec]">
        <nav className="bg-[#1a1a1a] px-6 h-12 flex items-center">
          <span className="font-serif text-[#C49A3C] font-bold cursor-pointer text-sm" onClick={()=>setView('home')}>NRI TAX SUITE</span>
        </nav>
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={()=>step>0?setStep(step-1):setView('home')} className="text-gray-400 hover:text-gray-600">‹</button>
            <div className="flex-1 font-serif text-lg font-bold">{titles[step]}</div>
            <span className="text-xs text-gray-400">Step {step+1}/5</span>
          </div>
          <div className="h-1 bg-gray-200 rounded mb-5"><div className="h-1 bg-[#C49A3C] rounded transition-all" style={{width:`${(step+1)/5*100}%`}} /></div>

          {/* Step 0 */}
          {step===0 && <div>
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2"><span className="text-amber-500">✨</span><span className="text-xs font-semibold text-amber-700">Describe the situation (AI auto-fill)</span></div>
              <textarea value={narr} onChange={e=>setNarr(e.target.value)} rows={3} placeholder="e.g. UK client, 38 days stay, sold Nashik plot ₹68L (bought 2017 ₹22L), Pune flat ₹25K/mo rent, NRO ₹1.4L, FD ₹85K, UK salary GBP 72K, tax paid..."
                className="w-full p-2.5 border border-amber-200 rounded text-sm resize-y" />
              <button onClick={doParse} disabled={prs||!narr.trim()}
                className="mt-2 bg-[#C49A3C] text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-40">
                {prs ? 'Reading...' : 'AI Auto-Fill'}
              </button>
            </div>
            <div className="text-center text-xs text-gray-400 my-3">— or fill manually —</div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="grid grid-cols-2 gap-3">
                <Inp l="Name *" v={f.name} ch={v=>u('name',v)} ph="Rajesh Mehta" />
                <Inp l="Country *"><Sel v={f.country} ch={v=>u('country',v)} o={COUNTRIES} /></Inp>
                <Inp l="Occupation" v={f.occupation} ch={v=>u('occupation',v)} ph="IT Manager" />
                <Inp l="Years abroad"><Sel v={f.yearsAbroad} ch={v=>u('yearsAbroad',v)} o={['<1yr','1-3yr','3-5yr','5+yr']} /></Inp>
              </div>
            </div>
            <button onClick={()=>setStep(1)} disabled={!f.name||!f.country}
              className="w-full mt-3 bg-[#1a1a1a] text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-30">Continue →</button>
          </div>}

          {/* Step 1 */}
          {step===1 && <div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="grid grid-cols-2 gap-3">
                <Inp l="Stay days" v={f.stayDays} ch={v=>u('stayDays',v)} ph="38" tip="Approximate OK" />
                <Inp l="Source"><Sel v={f.staySource} ch={v=>u('staySource',v)} o={['Estimate','Passport','Travel summary']} /></Inp>
                <Inp l="Family in India?"><Sel v={f.familyInIndia} ch={v=>u('familyInIndia',v)} o={['Yes','No','Partly']} /></Inp>
                <Inp l="Property sold?"><Sel v={f.propertySale?'Yes':'No'} ch={v=>{u('propertySale',v==='Yes');u('cgProperty',v==='Yes');}} o={['No','Yes']} /></Inp>
                {f.propertySale && <>
                  <Inp l="Acquisition FY" tip="Pre/post Jul 2024 changes tax"><Sel v={f.propertyAcqFY} ch={v=>u('propertyAcqFY',v)} o={Object.keys(CII).filter(k=>parseInt(k)>=2005).map(k=>({v:k,l:'FY '+k}))} /></Inp>
                  <Inp l="Sale price ₹" v={f.salePrice} ch={v=>u('salePrice',parseInt(v)||0)} ph="6800000" type="number" />
                  <Inp l="Purchase cost ₹" v={f.purchaseCost} ch={v=>u('purchaseCost',parseInt(v)||0)} ph="2200000" type="number" />
                  <Inp l="Location" v={f.propertyLocation} ch={v=>u('propertyLocation',v)} ph="Nashik" />
                  <Inp l="Section 54" wide tip="New house? Bonds?"><Sel v={f.section54} ch={v=>u('section54',v)} o={['Not discussed','House purchased','Planning purchase','Considering 54EC','Not applicable']} /></Inp>
                </>}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>setStep(0)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium">← Back</button>
              <button onClick={()=>setStep(2)} className="flex-[2] bg-[#1a1a1a] text-white py-2 rounded-lg text-sm font-semibold">Continue →</button>
            </div>
          </div>}

          {/* Step 2 */}
          {step===2 && <div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-3">
              <div className="text-xs font-semibold mb-2">Indian Income</div>
              <div className="grid grid-cols-2 gap-x-4">
                {[['salary','Salary'],['rent','Rental'],['interest','Interest'],['dividend','Dividends'],['cgShares','CG-Shares'],['cgMF','CG-MF'],['cgESOPRSU','CG-ESOP'],['business','Business']].map(([k,l])=>
                  <Chk key={k} l={l} c={f[k]} ch={v=>u(k,v)} />
                )}
              </div>
            </div>
            {(f.rent||f.interest) && <div className="bg-white rounded-lg border border-gray-200 p-5 mb-3">
              {f.rent && <Inp l="Monthly rent ₹" v={f.rentalMonthly} ch={v=>u('rentalMonthly',parseInt(v)||0)} ph="25000" type="number" />}
              {f.interest && <div className="grid grid-cols-2 gap-3 mt-2">
                <Inp l="NRO int ₹/yr" v={f.nroInterest} ch={v=>u('nroInterest',parseInt(v)||0)} ph="140000" type="number" />
                <Inp l="FD int ₹/yr" v={f.fdInterest} ch={v=>u('fdInterest',parseInt(v)||0)} ph="85000" type="number" />
              </div>}
            </div>}
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-3">
              <div className="text-xs font-semibold mb-2">Cross-Border</div>
              <div className="grid grid-cols-2 gap-x-4">
                <Chk l="Foreign salary" c={f.foreignSalary} ch={v=>u('foreignSalary',v)} />
                <Chk l="Tax paid abroad" c={f.foreignTaxPaid} ch={v=>u('foreignTaxPaid',v)} />
              </div>
              {f.foreignSalary && <div className="mt-2"><Inp l="Details" v={f.foreignDetails} ch={v=>u('foreignDetails',v)} ph="UK GBP 72K" wide /></div>}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>setStep(1)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium">← Back</button>
              <button onClick={()=>setStep(3)} className="flex-[2] bg-[#1a1a1a] text-white py-2 rounded-lg text-sm font-semibold">Continue →</button>
            </div>
          </div>}

          {/* Step 3 */}
          {step===3 && <div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <Inp l="AIS"><Sel v={f.ais} ch={v=>u('ais',v)} o={['Yes','Not reviewed','No']} /></Inp>
                <Inp l="26AS"><Sel v={f.f26as} ch={v=>u('f26as',v)} o={['Yes','No']} /></Inp>
                <Inp l="Indian assets"><Sel v={f.indianAssets} ch={v=>u('indianAssets',v)} o={['Below ₹50L','₹50L-1Cr','Above ₹1 Crore']} /></Inp>
                <Inp l="Notices"><Sel v={f.priorNotices} ch={v=>u('priorNotices',v)} o={['None','Yes']} /></Inp>
                <Inp l="Service"><Sel v={f.serviceNeed} ch={v=>u('serviceNeed',v)} o={['Filing only','Filing+Advisory','Advisory+Planning']} /></Inp>
                <Inp l="Regime"><Sel v={f.taxRegime} ch={v=>u('taxRegime',v)} o={['New (default)','Old','Help decide']} /></Inp>
              </div>
              <div className="mt-3"><Inp l="Notes" wide><textarea value={f.notes||''} onChange={e=>u('notes',e.target.value)} rows={2} className="w-full p-2 border border-gray-300 rounded text-sm resize-y" /></Inp></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>setStep(2)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium">← Back</button>
              <button onClick={()=>setStep(4)} className="flex-[2] bg-[#1a1a1a] text-white py-2 rounded-lg text-sm font-semibold">Review →</button>
            </div>
          </div>}

          {/* Step 4: Review */}
          {step===4 && <div>
            <div className="rounded-lg p-4 mb-3 border" style={{background:CLS_COLORS[classifyCase(f)]+'08',borderColor:CLS_COLORS[classifyCase(f)]+'40'}}>
              <div className="flex justify-between items-center">
                <div className="font-bold text-sm">AI Classification</div>
                <span className="font-bold text-sm px-4 py-1 rounded-full" style={{background:CLS_COLORS[classifyCase(f)]+'20',color:CLS_COLORS[classifyCase(f)]}}>{classifyCase(f)}</span>
              </div>
            </div>
            {cgData && <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <div className="text-xs font-bold text-green-700">CG Preview: Option {cgData.better} saves {formatINR(cgData.savings)}</div>
              <div className="text-[10px] text-green-600">A: {formatINR(cgData.optionA.total)} · B: {formatINR(cgData.optionB.total)}</div>
            </div>}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[['Client',f.name],['Country',f.country],['FY',fy],['Stay','~'+f.stayDays+'d'],['Service',f.serviceNeed],['Assets',f.indianAssets]].filter(([,v])=>v).map(([l,v],i)=>
                  <div key={i}><span className="text-gray-400">{l}:</span> <strong>{v}</strong></div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>setStep(3)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium">← Back</button>
              <button onClick={startCase} className="flex-[2] bg-[#C49A3C] text-white py-2.5 rounded-lg text-sm font-bold">Start Workflow →</button>
            </div>
          </div>}
        </div>
      </div>
    );
  }

  /* ═══ RENDER: CASE ═══ */
  const mod = MODS[mi];
  const modOut = outs[mod?.id];

  return (
    <div className="h-screen flex flex-col bg-[#f5f2ec]">
      <nav className="bg-[#1a1a1a] px-5 h-11 flex items-center justify-between flex-shrink-0">
        <span className="font-serif text-[#C49A3C] font-bold cursor-pointer text-sm" onClick={()=>setView('home')}>NRI TAX SUITE</span>
        <div className="flex gap-1">
          <button onClick={()=>setView('home')} className="text-[10px] text-gray-500 border border-gray-600 px-2 py-0.5 rounded hover:text-white">Home</button>
          <button onClick={()=>{setF({});setStep(0);setNarr('');setOuts({});setDv(null);setView('wizard');}} className="text-[10px] text-amber-400 border border-amber-800 px-2 py-0.5 rounded hover:text-amber-200">+ New</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-52 border-r border-gray-200 bg-[#faf8f4] overflow-y-auto flex-shrink-0">
          <div className="p-3 border-b border-gray-200">
            <div className="font-bold text-xs">{ac?.name}</div>
            <div className="text-[10px] text-gray-400">{ac?.country} · FY {fy}</div>
            <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:CLS_COLORS[ac?.classification]+'20',color:CLS_COLORS[ac?.classification]}}>{ac?.classification}</span>
          </div>

          <div className="py-1">
            <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Modules</div>
            {MODS.map((m, i) => {
              const done = !!outs[m.id];
              const active = i === mi && !dv;
              return (
                <div key={m.id} onClick={()=>{setMi(i);setDv(null);}}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition ${active ? 'bg-white font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  style={{ borderLeft: active ? `3px solid ${m.c}` : '3px solid transparent' }}>
                  <span className={done ? '' : 'opacity-30'}>{done ? '✓' : m.ic}</span>
                  <span>{m.l}</span>
                  {m.cp && !done && <span className="text-amber-500 text-[8px]">⚠</span>}
                </div>
              );
            })}
          </div>

          <div className="py-1 border-t border-gray-200">
            <div className="px-3 py-1 text-[9px] font-bold text-amber-500 uppercase tracking-wider">Deliverables</div>
            {DELS.map(d => {
              const ready = d.n.every(n => !!outs[n]);
              const active = dv === d.id;
              return (
                <div key={d.id} onClick={()=>ready && setDv(d.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs transition ${active ? 'bg-white font-semibold text-gray-900' : ready ? 'text-gray-500 cursor-pointer hover:text-gray-700' : 'text-gray-300 cursor-default'}`}
                  style={{ borderLeft: active ? '3px solid #C49A3C' : '3px solid transparent' }}>
                  <span>{ready ? '📄' : '○'}</span>
                  <span>{d.l}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* DELIVERABLE VIEW */}
          {dv ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-serif text-base font-bold">{DELS.find(d=>d.id===dv)?.l}</div>
                  <div className="text-[10px] text-gray-400">{DELS.find(d=>d.id===dv)?.d}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>handleDownload(DELS.find(d=>d.id===dv)?.apiType)} disabled={dlLd}
                    className="flex items-center gap-1 px-3 py-1.5 border border-amber-400 text-amber-600 rounded text-xs font-semibold hover:bg-amber-50 disabled:opacity-40">
                    {dlLd ? '...' : '⬇'} Download DOCX
                  </button>
                  <button onClick={doPrint} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
                    🖨 Print
                  </button>
                  <button onClick={()=>setDv(null)} className="px-2 py-1 text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div ref={printRef}>
                  {dv === 'cg_sheet' && <CGPreview f={f} fy={fy} cg={cgData} />}
                  {dv === 'memo_doc' && <MemoPreview f={f} fy={fy} cg={cgData} />}
                  {dv === 'position' && <div>
                    <div className="text-sm font-bold text-amber-600">MKW ADVISORS</div>
                    <div className="border-b-2 border-amber-500 my-3" />
                    <div className="font-serif text-xl font-bold">Tax Position Report</div>
                    <div className="text-xs text-gray-400 mb-4">{f.name} · FY {fy} · {classifyCase(f)}</div>
                    <h3 className="font-serif font-bold text-sm mt-4">Residency</h3>
                    <p className="text-xs"><strong>Non-Resident (High Confidence)</strong> — ~{f.stayDays}d stay, overseas employment.</p>
                    <div className="bg-red-50 border border-red-200 rounded p-2 my-2 text-xs font-bold text-red-700">₹12L 87A rebate does NOT apply to NRIs.</div>
                    <h3 className="font-serif font-bold text-sm mt-4">Income</h3>
                    <table className="w-full border-collapse my-2 text-xs"><thead><tr><th className="bg-gray-200 p-1.5 border border-gray-300">Head</th><th className="bg-gray-200 p-1.5 border border-gray-300">Amount</th><th className="bg-gray-200 p-1.5 border border-gray-300">Tax</th></tr></thead><tbody>
                      {f.rent && <tr><td className="p-1.5 border border-gray-300">Rental</td><td className="p-1.5 border border-gray-300 text-right">{formatINR(f.rentalMonthly?f.rentalMonthly*12:0)}</td><td className="p-1.5 border border-gray-300">Taxable</td></tr>}
                      {f.propertySale && <tr><td className="p-1.5 border border-gray-300">CG — Property</td><td className="p-1.5 border border-gray-300 text-right">{formatINR(f.salePrice||0)}</td><td className="p-1.5 border border-gray-300">LTCG dual</td></tr>}
                      {f.nroInterest && <tr><td className="p-1.5 border border-gray-300">NRO Interest</td><td className="p-1.5 border border-gray-300 text-right">{formatINR(f.nroInterest)}</td><td className="p-1.5 border border-gray-300">Taxable</td></tr>}
                      {f.foreignSalary && <tr><td className="p-1.5 border border-gray-300">Foreign Salary</td><td className="p-1.5 border border-gray-300 text-right">—</td><td className="p-1.5 border border-gray-300">Not taxable (NR)</td></tr>}
                    </tbody></table>
                    <h3 className="font-serif font-bold text-sm mt-4">Approach</h3>
                    <p className="text-xs">Form: <strong>ITR-2</strong> · Regime: New · Schedules: CG, HP, OS, TDS</p>
                  </div>}
                  {dv === 'quote' && <div>
                    <div className="text-sm font-bold text-amber-600">MKW ADVISORS</div>
                    <div className="border-b-2 border-amber-500 my-3" />
                    <div className="font-serif text-xl font-bold">Engagement Quote</div>
                    <div className="text-xs text-gray-400 mb-4">{f.name} · FY {fy}</div>
                    <table className="w-full border-collapse my-2 text-xs"><tbody>
                      {[['Classification',classifyCase(f)],['Tier',classifyCase(f)==='Green'?'T2 Advisory (₹18-30K)':'T3 Premium (₹35-75K)'],['Turnaround',(classifyCase(f)==='Green'?'5-7':'8-12')+' business days']].map(([l,v],i)=>
                        <tr key={i}><td className="p-1.5 border border-gray-300 font-bold bg-gray-100">{l}</td><td className="p-1.5 border border-gray-300">{v}</td></tr>
                      )}
                    </tbody></table>
                    <h3 className="font-serif font-bold text-sm mt-4">Included</h3>
                    <ol className="text-xs list-decimal pl-5 leading-relaxed">
                      <li>Residency review</li><li>Income classification</li><li>AIS/26AS reconciliation</li>
                      {f.propertySale && <li>CG dual computation + Section 54 planning</li>}
                      {f.foreignTaxPaid && <li>DTAA/FTC review</li>}
                      <li>Pre-filing review</li><li>Return filing</li><li>Advisory Memo</li>
                    </ol>
                    <h3 className="font-serif font-bold text-sm mt-4">Excluded</h3>
                    <ul className="text-xs list-disc pl-5"><li>Notice representation</li><li>Multi-year filing</li><li>Foreign tax return</li></ul>
                  </div>}
                </div>
              </div>
            </div>
          ) : (
            /* MODULE VIEW */
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{mod.ic}</span>
                  <div>
                    <div className="font-serif text-base font-bold">Step {mi+1}: {mod.l}</div>
                    <div className="text-[10px] text-gray-400">{mod.id==='intake'?'From form':modOut?'Done':'Ready'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!modOut && mod.id !== 'intake' && (
                    <button onClick={()=>runMod(mi)} disabled={ld}
                      className="px-4 py-2 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                      style={{ background: mod.c }}>
                      {ld ? 'Analyzing...' : 'Run ' + mod.l}
                    </button>
                  )}
                  {modOut && mi < 9 && (
                    <button onClick={()=>{setMi(mi+1);setDv(null);}}
                      className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-xs font-semibold">Next →</button>
                  )}
                </div>
              </div>

              {/* Human checkpoint warning */}
              {mod.cp && !modOut && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-700 flex items-center gap-2">
                  <span>⚠</span> Human checkpoint — {mod.cp}
                </div>
              )}

              {/* Loading */}
              {ld && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="text-2xl animate-pulse">🔄</div>
                  <div className="font-semibold mt-3 text-sm">Running {mod.l}...</div>
                  <div className="text-[10px] text-gray-400">FY {fy} · CII {cfg.cii}</div>
                </div>
              )}

              {/* Output */}
              {modOut && !ld && (
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMd(modOut) }} />
                </div>
              )}

              {/* Empty state */}
              {!modOut && !ld && mod.id !== 'intake' && (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <div className="text-3xl opacity-20 mb-2">{mod.ic}</div>
                  <div className="font-semibold text-gray-400 text-sm">Click "Run {mod.l}" to execute</div>
                </div>
              )}

              {/* Deliverable cards */}
              {modOut && !ld && DELS.filter(d => d.n.includes(mod.id) && d.n.every(n => !!outs[n])).map(d => (
                <div key={d.id} onClick={()=>setDv(d.id)}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3 cursor-pointer hover:bg-amber-100 transition flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-xs text-amber-700">{d.l} — Ready</div>
                    <div className="text-[10px] text-amber-500">{d.d}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e=>{e.stopPropagation();handleDownload(d.apiType);}}
                      className="text-[10px] border border-amber-300 text-amber-600 px-2 py-1 rounded hover:bg-amber-200">
                      ⬇ DOCX
                    </button>
                    <span className="text-amber-400">›</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
