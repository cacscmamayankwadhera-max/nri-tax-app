'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [vis, setVis] = useState(false);
  useEffect(() => setVis(true), []);

  return (
    <div className="min-h-screen bg-[#f5f2ec]">
      <nav className="bg-[#1a1a1a] px-6 md:px-12 h-14 flex items-center justify-between">
        <span className="font-serif text-[#C49A3C] font-bold tracking-wide">NRI TAX SUITE</span>
        <div className="flex gap-3 items-center">
          <a href="/login" className="text-gray-400 text-sm hover:text-white transition">Team Login</a>
          <a href="/client" className="bg-[#C49A3C] text-[#1a1a1a] px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-400 transition">Start Filing →</a>
        </div>
      </nav>

      <div className={`max-w-5xl mx-auto px-6 pt-20 pb-16 text-center transition-all duration-700 ${vis?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
        <div className="inline-block bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-xs font-bold mb-6">FY 2025-26 · AY 2026-27 · CII 376</div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight">NRI Tax Filing, Advisory<br/>& Compliance — Done Right</h1>
        <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">AI-assisted tax advisory for Non-Resident Indians. From residential status review to capital gains dual-option computation.</p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <a href="/client" className="bg-[#C49A3C] text-[#1a1a1a] px-8 py-3 rounded-lg text-base font-bold hover:bg-amber-400 transition shadow-lg">Start Your Tax Filing →</a>
          <a href="#how" className="border-2 border-[#1a1a1a] text-[#1a1a1a] px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#1a1a1a] hover:text-white transition">How It Works</a>
        </div>
        <p className="mt-4 text-xs text-gray-400">Free diagnostic · No obligation · Results in minutes</p>
      </div>

      <div className="bg-white border-y border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-center">
          {[{n:"500+",l:"NRI Cases"},{n:"15+",l:"Countries"},{n:"₹50Cr+",l:"CG Computed"},{n:"100%",l:"Compliance"}].map((s,i)=>(
            <div key={i}><div className="font-serif text-2xl font-bold">{s.n}</div><div className="text-xs text-gray-400 mt-1">{s.l}</div></div>
          ))}
        </div>
      </div>

      <div id="how" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[{n:"1",t:"Describe Your Situation",d:"Type in plain English or fill a simple form. AI extracts and organizes everything.",ic:"📋"},{n:"2",t:"AI Analyzes",d:"10 specialist modules review residency, income, capital gains, DTAA, and more.",ic:"🤖"},{n:"3",t:"Get Deliverables",d:"Download professional computation sheets, advisory memos, and engagement documents.",ic:"📄"},{n:"4",t:"File with Confidence",d:"Expert-reviewed filing with pre-filing risk check and post-filing support.",ic:"✅"}].map((s,i)=>(
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition">
              <div className="text-3xl mb-3">{s.ic}</div>
              <div className="text-[10px] font-bold text-[#C49A3C] mb-1">STEP {s.n}</div>
              <h3 className="font-serif font-bold mb-2">{s.t}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a1a] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-white text-center mb-10">What We Handle</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[{t:"Property Sale Tax",d:"Dual computation (20% indexed vs 12.5% flat), Section 54/54EC planning",ic:"🏠"},{t:"Residential Status",d:"Stay-day analysis, RNOR review, deemed resident check",ic:"🌍"},{t:"DTAA / FTC",d:"Treaty benefit analysis, foreign tax credit eligibility",ic:"🌐"},{t:"Rental Income",d:"House property computation, standard deduction, loan interest",ic:"🏢"},{t:"Investments",d:"NRO/FD interest, dividends, MF gains, ESOP/RSU",ic:"📈"},{t:"AIS Reconciliation",d:"Mismatch detection, TDS credit verification",ic:"🔍"}].map((s,i)=>(
              <div key={i} className="bg-[#252525] rounded-lg border border-gray-700 p-5 hover:border-[#C49A3C] transition">
                <div className="text-2xl mb-2">{s.ic}</div>
                <h3 className="font-bold text-white text-sm mb-1">{s.t}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl font-bold text-center mb-10">Transparent Pricing</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[{t:"Basic Filing",p:"₹8,000–15,000",d:"Simple profile, 1-2 income sources",tag:"Green",c:"#2A6B4A"},{t:"Advisory Filing",p:"₹18,000–30,000",d:"Residency review, multiple income heads",tag:"Amber",c:"#B07D3A"},{t:"Premium",p:"₹35,000–75,000",d:"Property sale, ESOP, dual CG, DTAA",tag:"Popular",c:"#A04848",pop:true},{t:"Retainer",p:"₹1,00,000+/yr",d:"HNI, ongoing planning, priority",tag:"Premium",c:"#1a1a1a"}].map((s,i)=>(
            <div key={i} className={`bg-white rounded-xl p-5 ${s.pop?'border-2 border-[#C49A3C] shadow-lg relative':'border border-gray-200'}`}>
              {s.pop&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C49A3C] text-[#1a1a1a] px-3 py-0.5 rounded-full text-[10px] font-bold">MOST POPULAR</div>}
              <div className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2" style={{background:s.c+'18',color:s.c}}>{s.tag}</div>
              <h3 className="font-serif font-bold mb-1">{s.t}</h3>
              <div className="font-bold text-lg mb-2">{s.p}</div>
              <p className="text-xs text-gray-500">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8"><a href="/client" className="bg-[#C49A3C] text-[#1a1a1a] px-10 py-3 rounded-lg font-bold hover:bg-amber-400 transition inline-block">Get Your Free Diagnostic →</a></div>
      </div>

      <div className="bg-[#C49A3C] py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-3">Sold Property in India? Don't Overpay Tax.</h2>
          <p className="text-[#1a1a1a]/70 mb-6">Our dual-option computation saves NRI clients ₹1.5L+ per property transaction on average.</p>
          <a href="/client" className="bg-[#1a1a1a] text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition inline-block">Start Now — Free to Begin</a>
        </div>
      </div>

      <footer className="bg-[#1a1a1a] py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-between items-start gap-8">
          <div><div className="font-serif text-[#C49A3C] font-bold text-lg">MKW Advisors</div><div className="text-gray-500 text-xs mt-1">NRI Tax Filing · Advisory · Compliance</div><div className="text-gray-600 text-xs mt-3">CA | CS | CMA | IBBI Registered Valuer</div></div>
          <div className="text-xs text-gray-500"><div className="font-bold text-gray-400 mb-2">Services</div><div>NRI ITR Filing</div><div>Capital Gains Advisory</div><div>DTAA / FTC Review</div></div>
          <div className="text-xs text-gray-500"><div className="font-bold text-gray-400 mb-2">Quick Links</div><a href="/client" className="block hover:text-white">Start Filing</a><a href="/login" className="block hover:text-white">Team Login</a></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-600">© {new Date().getFullYear()} MKW Advisors. All rights reserved.</div>
      </footer>
    </div>
  );
}
