const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

// ── Brand ─────────────────────────────────────
const B = { firm:"MKW Advisors", tag:"NRI Tax Filing · Advisory · Compliance", gold:"D4A853", dark:"1A1A1A", gray:"6B6256", light:"F5F2EC", green:"2D6A4F", red:"B85C5C", blue:"2E5E8C" };

// ── CII Table ─────────────────────────────────
const CII = {"2001-02":100,"2002-03":105,"2003-04":109,"2004-05":113,"2005-06":117,"2006-07":122,"2007-08":129,"2008-09":137,"2009-10":148,"2010-11":167,"2011-12":184,"2012-13":200,"2013-14":220,"2014-15":240,"2015-16":254,"2016-17":264,"2017-18":272,"2018-19":280,"2019-20":289,"2020-21":301,"2021-22":317,"2022-23":331,"2023-24":348,"2024-25":363,"2025-26":376};

// ── Reusable builders ─────────────────────────
const bdr = { style: BorderStyle.SINGLE, size: 1, color: "D4CDC0" };
const bdrs = { top: bdr, bottom: bdr, left: bdr, right: bdr };
const noBdr = { style: BorderStyle.NONE, size: 0 };
const noBdrs = { top: noBdr, bottom: noBdr, left: noBdr, right: noBdr };
const cm = { top: 80, bottom: 80, left: 120, right: 120 };
const numbering = { config: [
  { reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 }}}}]},
  { reference:"numbers", levels:[{ level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 }}}}]},
]};
const styles = {
  default: { document: { run: { font:"Arial", size:22, color:B.dark }}},
  paragraphStyles: [
    { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:32, bold:true, font:"Georgia", color:B.dark }, paragraph:{ spacing:{ before:360, after:200 }, outlineLevel:0 }},
    { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:26, bold:true, font:"Georgia", color:B.dark }, paragraph:{ spacing:{ before:280, after:160 }, outlineLevel:1 }},
    { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:22, bold:true, font:"Arial", color:B.blue }, paragraph:{ spacing:{ before:200, after:120 }, outlineLevel:2 }},
  ]
};
const pageProps = { page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1296, bottom:1296, left:1296 }}};
const TW = 9648; // content width

function h1(t){ return new Paragraph({ heading:HeadingLevel.HEADING_1, children:[new TextRun(t)] }); }
function h2(t){ return new Paragraph({ heading:HeadingLevel.HEADING_2, children:[new TextRun(t)] }); }
function h3(t){ return new Paragraph({ heading:HeadingLevel.HEADING_3, children:[new TextRun(t)] }); }
function p(t,o={}){ return new Paragraph({ spacing:{after:100}, ...o.pp, children: Array.isArray(t) ? t : [new TextRun({ text:t, size:o.sz||22, ...(o.b&&{bold:true}), ...(o.c&&{color:o.c}), ...(o.i&&{italics:true}) })] }); }
function pBold(t,c){ return p(t,{b:true,c}); }
function bullet(t){ return new Paragraph({ numbering:{reference:"bullets",level:0}, spacing:{after:60}, children:[new TextRun({ text:t, size:22 })] }); }
function num(t){ return new Paragraph({ numbering:{reference:"numbers",level:0}, spacing:{after:60}, children:[new TextRun({ text:t, size:22 })] }); }
function gap(n=160){ return new Paragraph({ spacing:{after:n}, children:[] }); }
function rule(){ return new Paragraph({ border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:B.gold, space:1 }}, spacing:{after:200}, children:[] }); }
function fmt(n){ return '₹' + n.toLocaleString('en-IN'); }
function fmtL(n){ return '₹' + (n/100000).toFixed(2) + ' L'; }

function cell(text, opts={}){
  return new TableCell({
    borders: opts.nb ? noBdrs : bdrs,
    width: { size: opts.w || 2400, type: WidthType.DXA },
    margins: cm,
    shading: opts.bg ? { fill:opts.bg, type:ShadingType.CLEAR } : undefined,
    verticalAlign: opts.va || undefined,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), size: opts.sz||22, bold:!!opts.b, color: opts.c||B.dark, font: opts.font||"Arial" })]
    })]
  });
}

function dataTable(headers, rows, colWidths){
  const total = colWidths.reduce((a,b)=>a+b,0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h,i) => cell(h, { w:colWidths[i], b:true, bg:"E8E0D4", c:B.dark, sz:20 })) }),
      ...rows.map(row => new TableRow({ children: row.map((val,i) => cell(val, { w:colWidths[i], align: i>0 ? AlignmentType.RIGHT : AlignmentType.LEFT })) }))
    ]
  });
}

function highlightBox(text, color){
  const bgMap = {"2D6A4F":"E8F5E9","B85C5C":"FFEBEE","2E5E8C":"E3F2FD","D4A853":"FFF8E1"};
  const bg = bgMap[color] || "F5F5F5";
  return new Table({
    width: { size: TW, type: WidthType.DXA },
    columnWidths: [TW],
    rows: [new TableRow({ children: [
      new TableCell({ borders: bdrs, width:{size:TW,type:WidthType.DXA}, margins:{top:120,bottom:120,left:160,right:160},
        shading: { fill: bg, type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text, size:22, bold:true, color })] })]
      })
    ]})]
  });
}

function header(title, subtitle, cd){
  const today = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const infoW = [3200, TW-3200];
  return [
    p(B.firm, {b:true, sz:28, c:B.gold}),
    p(B.tag, {i:true, sz:18, c:B.gray}),
    rule(),
    new Paragraph({ spacing:{after:60}, children:[new TextRun({ text:title, font:"Georgia", size:36, bold:true, color:B.dark })] }),
    p(subtitle, {sz:22, c:B.gray}),
    gap(100),
    new Table({ width:{size:TW,type:WidthType.DXA}, columnWidths:infoW, rows:[
      ...[["Client",cd.name],["Assessment Year",cd.ay||"AY 2026-27"],["Date",today],["Case Classification",cd.classification||"—"],["Prepared By",B.firm+" — NRI Tax Desk"]].map(([l,v])=>
        new TableRow({ children:[
          cell(l,{w:infoW[0],nb:true,b:true,c:B.gray,sz:20}),
          cell(v,{w:infoW[1],nb:true})
        ]})
      )
    ]}),
    gap(),
    rule(),
  ];
}

function disclaimer(){
  return [gap(), rule(),
    p("Disclaimer",{b:true,c:B.gray,sz:20}),
    p("This document is based on information available as of the date above. The advisory position may change if additional facts, documents, or regulatory developments emerge. This is not a formal legal opinion. Engagement scope limitations apply.",{i:true,c:B.gray,sz:18}),
    p("© "+new Date().getFullYear()+" "+B.firm+". Confidential.",{c:B.gray,sz:18}),
  ];
}

// ══════════════════════════════════════════════════
// DELIVERABLE 1: CG COMPUTATION SHEET (the real one)
// ══════════════════════════════════════════════════
function buildCGComputation(cd){
  const fd = cd.formData || {};
  // Parse numbers from case data
  const salePriceRaw = fd.salePrice || 6800000;
  const costRaw = fd.purchaseCost || 2200000;
  const acqYear = fd.propertyAcqFY || "2017-18";
  const saleFY = cd.fy || "2025-26";
  const ciiAcq = CII[acqYear] || 272;
  const ciiSale = CII[saleFY] || 376;
  
  // Option A: 20% with indexation
  const indexedCost = Math.round(costRaw * ciiSale / ciiAcq);
  const ltcgA = salePriceRaw - indexedCost;
  const taxA = Math.round(ltcgA * 0.20);
  const cessA = Math.round(taxA * 0.04);
  const totalA = taxA + cessA;
  
  // Option B: 12.5% without indexation
  const ltcgB = salePriceRaw - costRaw;
  const taxB = Math.round(ltcgB * 0.125);
  const cessB = Math.round(taxB * 0.04);
  const totalB = taxB + cessB;
  
  const savings = totalA - totalB;
  const betterOption = totalB < totalA ? "B" : "A";
  const betterLabel = betterOption === "A" ? "20% with Indexation" : "12.5% without Indexation";
  
  // TDS
  const tdsRate = 0.20; // Section 195 (NRI) — 20% of sale consideration
  const tdsAmount = Math.round(salePriceRaw * tdsRate);
  
  // Section 54EC max
  const sec54ecMax = 5000000;
  const sec54ecTaxSaved = Math.round(Math.min(ltcgB, sec54ecMax) * (betterOption==="B" ? 0.125 : 0.20));

  const cw3 = [4000, 2824, 2824];
  const cw2 = [5400, 4248];

  const children = [
    ...header("Capital Gains Computation Sheet", `Property Sale — FY ${saleFY} (AY ${cd.ay||"2026-27"})`, cd),
    
    // ── Transaction Details ──
    h2("1. Transaction Details"),
    dataTable(["Particulars","Details"], [
      ["Asset Type", fd.propertyType || "Residential Plot"],
      ["Location", fd.propertyLocation || "Nashik, Maharashtra"],
      ["Date of Acquisition", fd.purchaseDate || "FY "+acqYear],
      ["Date of Sale", fd.saleDate || "November 2024 (FY "+saleFY+")"],
      ["Holding Period", ((parseInt(saleFY) - parseInt(acqYear)) || 7)+ " years (Long-Term)"],
      ["Acquired Before July 23, 2024?", "Yes — Dual computation applicable"],
    ], cw2),
    gap(),

    // ── Key Amounts ──
    h2("2. Key Amounts"),
    dataTable(["Particulars","Amount (₹)"], [
      ["Sale Consideration (A)", fmt(salePriceRaw)],
      ["Cost of Acquisition (B)", fmt(costRaw)],
      ["Cost of Improvement (C)", fmt(fd.improvementCost || 0)],
      ["Transfer Expenses (D)", fmt(fd.transferExpenses || 0)],
    ], cw2),
    gap(),

    // ── DUAL COMPUTATION ──
    h2("3. Dual Tax Computation"),
    p("For property acquired before July 23, 2024, the taxpayer may choose the option producing lower tax. Both options are computed below.", {b:true}),
    gap(80),

    // Option A
    h3("Option A — 20% LTCG with Indexation"),
    dataTable(["Particulars","Working","Amount (₹)"], [
      ["CII — Year of Acquisition ("+acqYear+")", "", String(ciiAcq)],
      ["CII — Year of Sale ("+saleFY+")", "", String(ciiSale)],
      ["Cost of Acquisition", "", fmt(costRaw)],
      ["Indexed Cost of Acquisition", fmt(costRaw)+" × "+ciiSale+"/"+ciiAcq, fmt(indexedCost)],
      ["Sale Consideration", "", fmt(salePriceRaw)],
      ["Long-Term Capital Gain", fmt(salePriceRaw)+" − "+fmt(indexedCost), fmt(ltcgA)],
      ["Tax @ 20%", fmt(ltcgA)+" × 20%", fmt(taxA)],
      ["Health & Education Cess @ 4%", fmt(taxA)+" × 4%", fmt(cessA)],
      ["Total Tax (Option A)", "", fmt(totalA)],
    ], cw3),
    gap(),

    // Option B
    h3("Option B — 12.5% LTCG without Indexation"),
    dataTable(["Particulars","Working","Amount (₹)"], [
      ["Cost of Acquisition", "", fmt(costRaw)],
      ["Sale Consideration", "", fmt(salePriceRaw)],
      ["Long-Term Capital Gain", fmt(salePriceRaw)+" − "+fmt(costRaw), fmt(ltcgB)],
      ["Tax @ 12.5%", fmt(ltcgB)+" × 12.5%", fmt(taxB)],
      ["Health & Education Cess @ 4%", fmt(taxB)+" × 4%", fmt(cessB)],
      ["Total Tax (Option B)", "", fmt(totalB)],
    ], cw3),
    gap(),

    // ── COMPARISON ──
    h2("4. Comparison & Recommendation"),
    highlightBox(`RECOMMENDED: Option ${betterOption} (${betterLabel}) — saves ${fmt(Math.abs(savings))} in tax`, B.green),
    gap(80),
    dataTable(["","Option A (20% Indexed)","Option B (12.5% Flat)"], [
      ["Capital Gain", fmt(ltcgA), fmt(ltcgB)],
      ["Tax Rate", "20% + 4% cess", "12.5% + 4% cess"],
      ["Tax Payable", fmt(totalA), fmt(totalB)],
      ["Difference", "", betterOption==="B" ? "Saves "+fmt(savings) : "Saves "+fmt(-savings)],
    ], [3200, 3224, 3224]),
    gap(),

    // ── Section 54 ──
    h2("5. Exemption Planning — Section 54 / 54F / 54EC"),
    highlightBox("ACTION REQUIRED: Discuss exemption options with client before filing. Potential to eliminate or significantly reduce capital gains tax.", B.red),
    gap(80),
    
    h3("Section 54 — New Residential Property"),
    bullet("Exemption available if client purchases a new residential house property in India"),
    bullet("Timeline: 1 year before sale OR 2 years after sale (purchase), or 3 years (construction)"),
    bullet("If new property cost ≥ LTCG: full exemption. If less: proportionate exemption."),
    bullet("Potential tax saved if FULL exemption: " + fmt(betterOption==="B" ? totalB : totalA)),
    bullet("Client status: " + (fd.section54 || "NOT YET DISCUSSED — must be raised before filing")),
    gap(),

    h3("Section 54EC — Capital Gains Bonds"),
    bullet("Invest LTCG amount in NHAI/REC bonds within 6 months of sale"),
    bullet("Maximum investment: ₹50,00,000"),
    bullet("Lock-in: 5 years"),
    bullet("Maximum tax saved: " + fmt(sec54ecTaxSaved)),
    bullet("Deadline: " + (fd.saleDate ? "6 months from sale date" : "6 months from date of sale — verify exact date")),
    gap(),

    h3("Section 54F — Any Long-Term Asset"),
    bullet("If the sold asset is not a residential house, Section 54F may apply instead of Section 54"),
    bullet("Requires net sale consideration to be invested in new residential house"),
    bullet("Applicability depends on asset type — verify from sale deed"),
    gap(),

    // ── TDS ──
    h2("6. TDS Position"),
    dataTable(["Particulars","Details"], [
      ["TDS Section", "Section 195 (NRI)"],
      ["TDS Rate (Section 195 — NRI)", "20% of sale consideration"],
      ["Estimated TDS (Section 195 basis)", fmt(tdsAmount)],
      ["Lower TDS", "Apply for certificate u/s 197 to reduce TDS to actual tax liability"],
      ["Form 16B Required", "Yes — must obtain from buyer to claim TDS credit"],
      ["26AS Verification", "TDS amount must match 26AS entry before filing"],
    ], cw2),
    p("Note: If buyer has deducted TDS under Section 195 (NRI rate), the TDS amount will be significantly higher. Verify from Form 16B and 26AS.", {b:true, c:B.red}),
    gap(),

    // ── Summary ──
    h2("7. Net Tax Position Summary"),
    dataTable(["Scenario","Tax Payable","Net After TDS Credit"], [
      ["Option "+betterOption+" (recommended), no exemption", fmt(betterOption==="B"?totalB:totalA), fmt((betterOption==="B"?totalB:totalA)-tdsAmount)],
      ["With full Section 54 exemption", "₹0", "Refund of "+fmt(tdsAmount)],
      ["With ₹50L Section 54EC investment", fmt(Math.max(0,(betterOption==="B"?totalB:totalA)-sec54ecTaxSaved)), "After TDS credit: "+fmt(Math.max(0,(betterOption==="B"?totalB:totalA)-sec54ecTaxSaved-tdsAmount))],
    ], [3200, 3224, 3224]),
    
    ...disclaimer(),
  ];

  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

// ══════════════════════════════════════════════════
// DELIVERABLE 2: CLIENT ADVISORY MEMO
// ══════════════════════════════════════════════════
function buildAdvisoryMemo(cd){
  const fd = cd.formData || {};
  const salePriceRaw = fd.salePrice || 6800000;
  const costRaw = fd.purchaseCost || 2200000;
  const acqYear = fd.propertyAcqFY || "2017-18";
  const ciiAcq = CII[acqYear] || 272;
  const ciiSale = 376;
  const indexedCost = Math.round(costRaw * ciiSale / ciiAcq);
  const ltcgA = salePriceRaw - indexedCost;
  const totalA = Math.round(ltcgA * 0.20 * 1.04);
  const ltcgB = salePriceRaw - costRaw;
  const totalB = Math.round(ltcgB * 0.125 * 1.04);
  const betterOption = totalB < totalA ? "B (12.5% flat)" : "A (20% indexed)";
  const savings = Math.abs(totalA - totalB);
  
  const rentalAnnual = fd.rentalMonthly ? fd.rentalMonthly * 12 : 300000;
  const rentalSD = Math.round(rentalAnnual * 0.30);
  const rentalTaxable = rentalAnnual - rentalSD;
  const interestTotal = (fd.nroInterest||140000) + (fd.fdInterest||85000);

  const children = [
    ...header("Client Advisory Memo", `NRI Tax Advisory — FY ${cd.fy||"2025-26"} (AY ${cd.ay||"2026-27"})`, cd),

    h2("Facts Captured"),
    bullet("You are currently resident in "+cd.country+" and have been working there "+(fd.yearsAbroad||"for several years")+"."),
    bullet("Your India stay during FY "+(cd.fy||"2025-26")+" is estimated at approximately "+(fd.stayDays||"38")+" days."),
    bullet("Indian income includes: rental income from property in "+(fd.rentalLocation||"Pune")+" (~"+fmt(rentalAnnual)+"/year), NRO savings interest (~"+fmt(fd.nroInterest||140000)+"), FD interest (~"+fmt(fd.fdInterest||85000)+")."),
    bullet("You sold a "+(fd.propertyType||"residential plot")+" in "+(fd.propertyLocation||"Nashik")+" for "+fmt(salePriceRaw)+", acquired in FY "+acqYear+" for approximately "+fmt(costRaw)+"."),
    fd.foreignSalary ? bullet("You earn foreign salary and pay tax in "+cd.country+". You have asked about claiming foreign tax credit (FTC) in India.") : gap(0),
    bullet("AIS / 26AS reconciliation has been reviewed. TDS deducted by the plot buyer needs Form 16B confirmation."),
    gap(),

    h2("Assumptions"),
    num("A preliminary Non-Resident status has been adopted based on your reported stay of ~"+(fd.stayDays||"38")+" days and continuous overseas employment. Final confirmation pending passport travel records."),
    num("Plot acquisition cost is assumed at "+fmt(costRaw)+" based on your statement. Subject to verification from purchase deed."),
    num("No cost of improvement has been assumed unless you confirm otherwise."),
    num("New tax regime (Section 115BAC) is assumed as default. The old regime may be evaluated if you have significant deductions."),
    gap(),

    h2("Key Issues"),
    gap(60),
    h3("Issue 1 — Capital Gains from Plot Sale"),
    p("This is the most significant item in your filing. We have computed your capital gains under both available options:"),
    gap(40),
    dataTable(["","Option A (20% Indexed)","Option B (12.5% Flat)"], [
      ["Capital Gain", fmt(ltcgA), fmt(ltcgB)],
      ["Tax + Cess", fmt(totalA), fmt(totalB)],
    ], [3200, 3224, 3224]),
    gap(60),
    highlightBox("Option "+betterOption+" is more favourable, saving you "+fmt(savings)+". Detailed computation is in the attached CG Computation Sheet.", B.green),
    gap(),

    h3("Issue 2 — Section 54 / 54EC Exemption Opportunity"),
    p("If you have purchased or plan to purchase a new residential house in India (within 2 years of the sale), or if you invest up to ₹50 lakhs in capital gains bonds within 6 months of the sale, you may be able to SIGNIFICANTLY reduce or ELIMINATE the capital gains tax entirely.", {b:true}),
    p("This is a critical planning decision that must be made before we finalize the return.", {c:B.red, b:true}),
    gap(),

    fd.foreignTaxPaid ? (() => { return [
      h3("Issue 3 — Foreign Tax Credit (FTC) Clarification"),
      p("You asked whether you can claim credit for tax paid in "+cd.country+" on your foreign salary."),
      p("Since you are being treated as a Non-Resident for Indian tax purposes, your foreign salary is NOT taxable in India. Foreign Tax Credit applies only where the same income is taxed in both countries. Since your "+cd.country+" salary is outside India's tax net, FTC is not applicable here.", {b:true}),
      p("This is a very common question among NRIs and does not create any filing issue. No additional schedule or claim is needed."),
      gap(),
    ]; })() : [],

    h3((fd.foreignTaxPaid ? "Issue 4" : "Issue 3") + " — Rental Income"),
    p("Your rental income of "+fmt(rentalAnnual)+" will be computed under the house property head:"),
    dataTable(["Particulars","Amount (₹)"], [
      ["Gross Annual Rent", fmt(rentalAnnual)],
      ["Less: Standard Deduction (30%)", "("+fmt(rentalSD)+")"],
      ["Taxable Rental Income", fmt(rentalTaxable)],
    ], [5400, 4248]),
    gap(),

    h3((fd.foreignTaxPaid ? "Issue 5" : "Issue 4") + " — Interest & Passive Income"),
    p("Your NRO and FD interest totalling "+fmt(interestTotal)+" will be included under Income from Other Sources. TDS has been deducted — credits will be mapped from 26AS."),
    gap(),

    h2("Advisory Summary"),
    num("You are likely to be treated as a Non-Resident for FY "+(cd.fy||"2025-26")+"."),
    num("Your Indian income includes: rental income ("+fmt(rentalTaxable)+" taxable), capital gains from plot sale ("+fmt(totalB < totalA ? ltcgB : ltcgA)+" under recommended option), and interest income ("+fmt(interestTotal)+")."),
    num("The recommended return form is ITR-2."),
    num("The capital gains tax under the recommended option is "+fmt(Math.min(totalA,totalB))+", but this can be reduced or eliminated with Section 54/54EC planning."),
    num("FTC is not applicable in your case."),
    gap(),

    h2("Risk Flags"),
    bullet("Filing should NOT be finalized until sale deed and purchase deed are received and verified."),
    bullet("Section 54/54F/54EC planning discussion must happen before filing — missing this deadline could mean paying tax unnecessarily."),
    bullet("Form 16B from the plot buyer must be obtained to claim TDS credit."),
    bullet("A minor mutual fund dividend entry (~₹3,200) was found in AIS — needs confirmation and inclusion."),
    gap(),

    h2("Recommended Actions"),
    pBold("Please provide at your earliest convenience:", B.dark),
    num("Sale deed for the "+(fd.propertyLocation||"Nashik")+" plot"),
    num("Purchase deed / registration papers from "+(fd.purchaseDate||"2017")),
    num("Confirmation on any improvement costs incurred on the plot"),
    num("Form 16B from the plot buyer"),
    num("Rent agreement or rental receipt summary for "+(fd.rentalLocation||"Pune")+" flat"),
    num("Passport travel pages for FY "+(cd.fy||"2025-26")),
    fd.foreignSalary ? num(cd.country+" P60 or employer tax summary (for our records)") : gap(0),
    gap(80),
    pBold("Please confirm:", B.dark),
    num("Have you purchased or plan to purchase a new residential house in India? (for Section 54)"),
    num("Are you considering investing in capital gains bonds — NHAI/REC, up to ₹50L? (for Section 54EC — must be within 6 months of sale)"),
    num("Do you have any other income or transactions not mentioned above?"),
    gap(40),
    p("Once we receive these documents and your responses, we will finalize the computation, prepare the return, and share for your review before filing."),

    ...disclaimer(),
  ].flat();

  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

// ══════════════════════════════════════════════════
// DELIVERABLE 3: ENGAGEMENT QUOTE
// ══════════════════════════════════════════════════
function buildEngagementQuote(cd){
  const fd = cd.formData || {};
  const tier = cd.classification === "Red" ? "Tier 3 — Premium Compliance" : cd.classification === "Amber" ? "Tier 3 — Premium Compliance" : "Tier 2 — Advisory Filing";
  const band = cd.classification === "Green" ? "Band A (₹8,000 – ₹15,000)" : cd.classification === "Amber" ? "Band C (₹35,000 – ₹75,000)" : "Band C–D (₹50,000 – ₹1,00,000+)";
  const tat = cd.classification === "Green" ? "5–7" : "8–12";

  const children = [
    ...header("Engagement Scope & Fee Quote", `NRI Tax Services — FY ${cd.fy||"2025-26"}`, cd),

    h2("1. Service Overview"),
    p("Based on our detailed assessment of your case, the recommended engagement structure is outlined below."),
    gap(60),
    dataTable(["Parameter","Details"], [
      ["Case Classification", cd.classification || "Amber"],
      ["Service Tier", tier],
      ["Fee Range", band],
      ["Estimated Turnaround", tat + " business days from complete documents"],
      ["Review Level", "Senior Reviewer" + (cd.classification!=="Green" ? " + Partner sign-off" : "")],
    ], [3200, TW-3200]),
    gap(),

    h2("2. Scope — Included"),
    num("Residential status review and confirmation"),
    num("Income classification across all applicable heads"),
    num("AIS / 26AS / TIS reconciliation and mismatch review"),
    num("ITR form selection and schedule blueprint"),
    fd.propertySale ? num("Capital gains computation with dual-option analysis (20% indexed vs 12.5% flat)") : gap(0),
    fd.propertySale ? num("Section 54 / 54F / 54EC exemption planning discussion") : gap(0),
    fd.foreignTaxPaid ? num("DTAA / FTC applicability review and advisory note") : gap(0),
    num("Pre-filing risk review and readiness assessment"),
    num("Return preparation and e-filing"),
    num("Structured Client Advisory Memo"),
    num("CG Computation Sheet (if property/securities sale involved)"),
    gap(),

    h2("3. Scope — Excluded (Unless Separately Agreed)"),
    bullet("Notice representation or response drafting"),
    bullet("Multi-year return filing or regularization"),
    bullet("Detailed treaty interpretation memo"),
    bullet("Representation before income tax authorities"),
    bullet("Revised return filing for subsequently discovered transactions"),
    bullet("UK / foreign country tax return preparation or advisory"),
    gap(),

    h2("4. Deliverables You Will Receive"),
    num("Client Advisory Memo — comprehensive advisory summary with facts, issues, risk flags, and action items"),
    fd.propertySale ? num("Capital Gains Computation Sheet — dual-option analysis with Section 54/54EC planning") : gap(0),
    num("Filed ITR with acknowledgement"),
    num("Tax computation summary"),
    gap(),

    h2("5. Assumptions & Conditions"),
    bullet("All requested documents are provided within the agreed timeline."),
    bullet("Facts provided at intake are materially accurate and complete."),
    bullet("Scope and fee may need revision if additional complexity is discovered during document review."),
    bullet("Specialist or notice support is separate unless explicitly included above."),
    gap(),

    h2("6. Next Steps"),
    num("Review and confirm this scope by reply."),
    num("Provide documents as listed in our Document Request (sent separately)."),
    num("We will begin detailed analysis upon document receipt."),
    gap(60),
    p("We look forward to working with you on this engagement.", {i:true, c:B.gray}),

    ...disclaimer(),
  ];

  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

// ══════════════════════════════════════════════════
// DELIVERABLE 4: TAX POSITION REPORT
// ══════════════════════════════════════════════════
function buildPositionReport(cd){
  const fd = cd.formData || {};
  const salePriceRaw = fd.salePrice || 6800000;
  const costRaw = fd.purchaseCost || 2200000;
  const rentalAnnual = fd.rentalMonthly ? fd.rentalMonthly * 12 : 300000;
  const interestTotal = (fd.nroInterest||140000) + (fd.fdInterest||85000);

  const children = [
    ...header("NRI Tax Position Report", `Diagnostic Assessment — FY ${cd.fy||"2025-26"} (AY ${cd.ay||"2026-27"})`, cd),

    h2("1. Client Profile"),
    dataTable(["Parameter","Details"], [
      ["Name", cd.name],
      ["Country of Residence", cd.country],
      ["Occupation", fd.occupation || "—"],
      ["Years Abroad", fd.yearsAbroad || "—"],
      ["India Stay (FY "+(cd.fy||"2025-26")+")", "~"+(fd.stayDays||"38")+" days ("+(fd.staySource||"self-estimate")+")"],
      ["Prior Filing", fd.priorFiling || "Yes"],
      ["Case Classification", cd.classification || "Amber"],
    ], [3200, TW-3200]),
    gap(),

    h2("2. Residential Status Assessment"),
    pBold("Preliminary View: Non-Resident (High Confidence)"),
    p("Based on an estimated India stay of ~"+(fd.stayDays||"38")+" days and continuous overseas employment since "+(fd.abroadSince||"2021")+", you are very likely to be classified as a Non-Resident for FY "+(cd.fy||"2025-26")+"."),
    p("This means only your Indian-source income is taxable in India. Your foreign salary and foreign investment income are outside India's tax net."),
    gap(60),
    highlightBox("Important: The ₹12 lakh tax-free income benefit under Section 87A does NOT apply to NRIs. This is a common misconception.", B.red),
    gap(),

    h2("3. Income Summary"),
    dataTable(["Income Head","Source","Estimated Amount (₹)","Taxability"], [
      ["House Property", "Rental — "+(fd.rentalLocation||"Pune")+" flat", fmt(rentalAnnual), "Taxable (after 30% SD)"],
      ["Capital Gains", "Plot sale — "+(fd.propertyLocation||"Nashik"), fmt(salePriceRaw)+" (consideration)", "LTCG — dual computation needed"],
      ["Other Sources", "NRO interest", fmt(fd.nroInterest||140000), "Taxable, TDS deducted"],
      ["Other Sources", "FD interest", fmt(fd.fdInterest||85000), "Taxable, TDS deducted"],
      ["Other Sources", "MF dividend (per AIS)", "~₹3,200", "Taxable — confirm amount"],
      fd.foreignSalary ? ["Foreign (context)", cd.country+" salary", "Not taxable in India", "Outside scope (NR status)"] : ["","","",""],
    ].filter(r=>r[0]!==""), [2200, 2600, 2600, 2248]),
    gap(),

    h2("4. Key Issues & Complexity Factors"),
    num("Capital gains from plot sale is the dominant item — requires dual-option computation and Section 54 planning. See separate CG Computation Sheet."),
    fd.foreignTaxPaid ? num("FTC query — your "+cd.country+" salary is not taxable in India under NR status, so foreign tax credit does not apply. This has been addressed in your Advisory Memo.") : gap(0),
    num("AIS reconciliation shows the property transaction signal — must be matched with actual sale deed."),
    num("Indian assets may exceed ₹1 Crore — asset disclosure schedule required in ITR-2."),
    num("Minor MF dividend (~₹3,200) found in AIS but not reported by you — needs confirmation."),
    gap(),

    h2("5. Recommended Approach"),
    bullet("Return Form: ITR-2"),
    bullet("Tax Regime: New regime (default) — old regime evaluation available if you have significant deductions"),
    bullet("Key Schedules: CG (capital gains), HP (house property), OS (other sources), TDS (tax credits)"),
    bullet("Filing Priority: Collect transaction papers → finalize CG computation → discuss Section 54 → file"),
    gap(),

    h2("6. Immediate Action Items"),
    num("Provide sale deed, purchase deed, and Form 16B for the plot transaction."),
    num("Confirm Section 54/54F/54EC exemption status."),
    num("Share passport travel pages for stay verification."),
    num("Confirm the MF dividend amount from your MF account statement."),
    num("Review the attached Engagement Quote and confirm to proceed."),

    ...disclaimer(),
  ];

  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

// ── Generate all ──────────────────────────────
async function run(){
  const cd = {
    name: "Rajesh Mehta", country: "United Kingdom", fy: "2025-26", ay: "AY 2026-27", classification: "Amber",
    formData: {
      occupation: "Senior IT Manager", yearsAbroad: "4+ years", stayDays: "38", staySource: "Self-estimate",
      abroadSince: "2021", priorFiling: "Yes — filed for FY 2022-23 and FY 2023-24",
      propertySale: true, propertyType: "Residential Plot", propertyLocation: "Nashik",
      propertyAcqFY: "2017-18", purchaseDate: "2017", purchaseCost: 2200000,
      salePrice: 6800000, saleDate: "November 2024", section54: "Not yet discussed",
      rent: true, rentalLocation: "Pune", rentalMonthly: 25000,
      interest: true, nroInterest: 140000, fdInterest: 85000,
      foreignSalary: true, foreignTaxPaid: true, foreignDetails: "UK salary ~GBP 72K, UK tax paid",
      indianAssets: "Above ₹1 Crore",
    }
  };
  const dir = '/mnt/user-data/outputs';
  const slug = 'rajesh-mehta';
  
  const docs = [
    { name:'cg-computation', fn:buildCGComputation, label:'CG Computation Sheet' },
    { name:'advisory-memo', fn:buildAdvisoryMemo, label:'Client Advisory Memo' },
    { name:'engagement-quote', fn:buildEngagementQuote, label:'Engagement Quote' },
    { name:'position-report', fn:buildPositionReport, label:'Tax Position Report' },
  ];
  
  for(const d of docs){
    try {
      const doc = d.fn(cd);
      const buf = await Packer.toBuffer(doc);
      const fp = `${dir}/${slug}-${d.name}-v2.docx`;
      fs.writeFileSync(fp, buf);
      console.log(`✓ ${d.label} → ${slug}-${d.name}-v2.docx`);
    } catch(e){ console.error(`✗ ${d.label}: ${e.message}`); }
  }
}

run();
