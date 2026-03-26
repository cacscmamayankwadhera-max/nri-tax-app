import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat } from 'docx';
import { computeCapitalGains, computeHouseProperty, computeTotalIncome, computeAdvanceTax, computeSurcharge, formatINR, FY_CONFIG, CII } from '@/lib/compute';
import { logActivity } from '@/lib/activity-log';

const FIRM = process.env.FIRM_NAME || 'MKW Advisors';
const TAG = process.env.FIRM_TAGLINE || 'NRI Tax Filing · Advisory · Compliance';

// ── Shared doc builders ──
const bdr = { style: BorderStyle.SINGLE, size: 1, color: "D4CDC0" };
const bdrs = { top:bdr, bottom:bdr, left:bdr, right:bdr };
const noBdr = { style: BorderStyle.NONE, size: 0 };
const noBdrs = { top:noBdr, bottom:noBdr, left:noBdr, right:noBdr };
const cm = { top:80, bottom:80, left:120, right:120 };
const TW = 9648;

const numbering = { config: [
  { reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 }}}}]},
  { reference:"numbers", levels:[{ level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:720, hanging:360 }}}}]},
]};

const styles = {
  default:{ document:{ run:{ font:"Arial", size:22, color:"1A1A1A" }}},
  paragraphStyles:[
    { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:32, bold:true, font:"Georgia", color:"1A1A1A" }, paragraph:{ spacing:{ before:360, after:200 }, outlineLevel:0 }},
    { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:26, bold:true, font:"Georgia", color:"1A1A1A" }, paragraph:{ spacing:{ before:280, after:160 }, outlineLevel:1 }},
    { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true, run:{ size:22, bold:true, font:"Arial", color:"2E5E8C" }, paragraph:{ spacing:{ before:200, after:120 }, outlineLevel:2 }},
  ]
};
const pageProps = { page:{ size:{ width:12240, height:15840 }, margin:{ top:1440, right:1296, bottom:1296, left:1296 }}};

function h2(t){ return new Paragraph({ heading:HeadingLevel.HEADING_2, children:[new TextRun(t)] }); }
function h3(t){ return new Paragraph({ heading:HeadingLevel.HEADING_3, children:[new TextRun(t)] }); }
function p(t,o={}){ return new Paragraph({ spacing:{after:100}, children:[new TextRun({ text:t, size:o.sz||22, bold:!!o.b, color:o.c||"1A1A1A", italics:!!o.i })] }); }
function bullet(t){ return new Paragraph({ numbering:{reference:"bullets",level:0}, spacing:{after:60}, children:[new TextRun({ text:t, size:22 })] }); }
function num(t){ return new Paragraph({ numbering:{reference:"numbers",level:0}, spacing:{after:60}, children:[new TextRun({ text:t, size:22 })] }); }
function gap(n=160){ return new Paragraph({ spacing:{after:n}, children:[] }); }
function rule(){ return new Paragraph({ border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:"C49A3C", space:1 }}, spacing:{after:200}, children:[] }); }

function cell(text, opts={}){
  return new TableCell({
    borders: opts.nb ? noBdrs : bdrs,
    width: { size: opts.w || 2400, type: WidthType.DXA },
    margins: cm,
    shading: opts.bg ? { fill:opts.bg, type:ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), size: opts.sz||22, bold:!!opts.b, color: opts.c||"1A1A1A" })]
    })]
  });
}

function dataTable(headers, rows, colWidths){
  const total = colWidths.reduce((a,b)=>a+b,0);
  return new Table({ width:{size:total,type:WidthType.DXA}, columnWidths:colWidths, rows:[
    new TableRow({ children: headers.map((h,i) => cell(h, { w:colWidths[i], b:true, bg:"E8E0D4", sz:20 })) }),
    ...rows.map(r => new TableRow({ children: r.map((v,i) => cell(v, { w:colWidths[i], align:i>0?AlignmentType.RIGHT:AlignmentType.LEFT })) }))
  ]});
}

function alertBox(text, type="green"){
  const bg = type==="green"?"E8F5E9":type==="red"?"FFEBEE":"FFF8E1";
  const c = type==="green"?"2E7D32":type==="red"?"C62828":"F57F17";
  return new Table({ width:{size:TW,type:WidthType.DXA}, columnWidths:[TW], rows:[
    new TableRow({ children:[new TableCell({ borders:bdrs, width:{size:TW,type:WidthType.DXA}, margins:{top:120,bottom:120,left:160,right:160},
      shading:{fill:bg,type:ShadingType.CLEAR}, children:[new Paragraph({ children:[new TextRun({ text, size:22, bold:true, color:c })] })] })] })
  ]});
}

function header(title, subtitle, caseData, fy){
  const today = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const iW=[3200,TW-3200];
  return [
    p(FIRM, {b:true, sz:28, c:"C49A3C"}), p(TAG, {i:true, sz:18, c:"6B6256"}), rule(),
    new Paragraph({ spacing:{after:60}, children:[new TextRun({ text:title, font:"Georgia", size:36, bold:true })] }),
    p(subtitle, {c:"6B6256"}), gap(100),
    new Table({ width:{size:TW,type:WidthType.DXA}, columnWidths:iW, rows:
      [["Client",caseData.name],["Assessment Year",FY_CONFIG[fy]?.ay||"AY 2026-27"],["Date",today],["Classification",caseData.classification||"—"],["Prepared By",FIRM+" — NRI Tax Desk"]].map(([l,v])=>
        new TableRow({ children:[cell(l,{w:iW[0],nb:true,b:true,c:"6B6256",sz:20}),cell(v,{w:iW[1],nb:true})] })
      )
    }), gap(), rule(),
  ];
}

function disclaimer(){
  return [gap(), rule(),
    p("Disclaimer",{b:true,c:"6B6256",sz:20}),
    p("This document is based on information available as of the date above. The advisory position may change if additional facts, documents, or regulatory developments emerge. This is not a formal legal opinion.",{i:true,c:"6B6256",sz:18}),
    new Paragraph({ children: [new TextRun({ text: 'Disclaimer: This document is generated using AI-assisted analysis and is for reference purposes only. All computations are subject to review and verification by a qualified Chartered Accountant. This does not constitute professional tax advice.', size: 16, color: '999999', italics: true })], spacing: { before: 400 } }),
    p("© "+new Date().getFullYear()+" "+FIRM+". Confidential.",{c:"6B6256",sz:18}),
  ];
}

// ══════ GENERATORS ══════
function generateCGSheet(caseData, fy){
  const fd = caseData.formData || caseData;
  const cg = computeCapitalGains(fd.salePrice||0, fd.purchaseCost||0, fd.propertyAcqFY||"2020-21", fy, fd.improvementCost||0, fd.stampDutyValue||0, fd.transferExpenses||fd.registrationExpenses||0);
  const cw3=[4000,2824,2824], cw2=[5400,TW-5400];
  
  const children = [
    ...header("Capital Gains Computation Sheet", `Property Sale — FY ${fy}`, caseData, fy),
    h2("1. Transaction Details"),
    (() => {
      const acqYear = parseInt(fd.propertyAcqFY) || 2020;
      const preJuly2024 = acqYear < 2024 || (acqYear === 2024 && !fd.postJuly2024);
      return dataTable(["Particulars","Details"],[["Asset",fd.propertyType||"Residential Plot"],["Location",fd.propertyLocation||"—"],["Acquired","FY "+(fd.propertyAcqFY||"2020-21")],["Sold","FY "+fy],["Holding",((parseInt(fy)-parseInt(fd.propertyAcqFY||"2020"))||7)+" years (Long-Term)"],["Pre July 2024?",preJuly2024 ? "Yes — Dual computation available" : "No — 12.5% flat rate only"]],cw2);
    })(), gap(),
    h2("2. Key Amounts"),
    dataTable(["Particulars","Amount"],[["Sale Consideration",formatINR(fd.salePrice||0)],["Cost of Acquisition",formatINR(fd.purchaseCost||0)],["Cost of Improvement",formatINR(0)]],cw2), gap(),
    h2("3. Dual Tax Computation"),
    p("For property acquired before July 23, 2024, the taxpayer may choose the lower-tax option:",{b:true}),
    h3("Option A — 20% LTCG with Indexation"),
    dataTable(["Particulars","Working","Amount"],[
      ["CII — Acquisition ("+(fd.propertyAcqFY||"2020-21")+")","",String(cg.ciiAcq)],["CII — Sale ("+fy+")","",String(cg.ciiSale)],
      ["Cost of Acquisition","",formatINR(fd.purchaseCost||0)],
      ["Indexed Cost",formatINR(fd.purchaseCost||0)+" × "+cg.ciiSale+"/"+cg.ciiAcq,formatINR(cg.indexedCost)],
      ["Sale Consideration","",formatINR(fd.salePrice||0)],
      ["LTCG",formatINR(fd.salePrice||0)+" − "+formatINR(cg.indexedCost),formatINR(cg.optionA.ltcg)],
      ["Tax @ 20%","",formatINR(cg.optionA.tax)],["Cess @ 4%","",formatINR(cg.optionA.cess)],
      ["Total Tax (Option A)","",formatINR(cg.optionA.total)]
    ],cw3), gap(),
    h3("Option B — 12.5% LTCG without Indexation"),
    dataTable(["Particulars","Working","Amount"],[
      ["Cost of Acquisition","",formatINR(fd.purchaseCost||0)],["Sale Consideration","",formatINR(fd.salePrice||0)],
      ["LTCG",formatINR(fd.salePrice||0)+" − "+formatINR(fd.purchaseCost||0),formatINR(cg.optionB.ltcg)],
      ["Tax @ 12.5%","",formatINR(cg.optionB.tax)],["Cess @ 4%","",formatINR(cg.optionB.cess)],
      ["Total Tax (Option B)","",formatINR(cg.optionB.total)]
    ],cw3), gap(),
    h2("4. Comparison & Recommendation"),
    alertBox(`RECOMMENDED: Option ${cg.better} (${cg.better==="B"?"12.5% flat":"20% indexed"}) — saves ${formatINR(cg.savings)} in tax`,"green"), gap(80),
    (() => {
      // Compute surcharge on LTCG tax if applicable
      const surchargeA = computeSurcharge(cg.optionA.tax, cg.optionA.ltcg, true);
      const surchargeB = computeSurcharge(cg.optionB.tax, cg.optionB.ltcg, true);
      const totalA = cg.optionA.total + surchargeA.surcharge;
      const totalB = cg.optionB.total + surchargeB.surcharge;
      const compRows = [
        ["Capital Gain",formatINR(cg.optionA.ltcg),formatINR(cg.optionB.ltcg)],
        ["Tax + Cess",formatINR(cg.optionA.total),formatINR(cg.optionB.total)],
      ];
      if (surchargeA.surcharge > 0 || surchargeB.surcharge > 0) {
        compRows.push(["Surcharge",formatINR(surchargeA.surcharge),formatINR(surchargeB.surcharge)]);
        compRows.push(["Total (incl. Surcharge)",formatINR(totalA),formatINR(totalB)]);
      }
      compRows.push(["","",cg.better==="B"?"Saves "+formatINR(cg.savings):""]);
      return dataTable(["","Option A (20% Indexed)","Option B (12.5% Flat)"], compRows, [3200,3224,3224]);
    })(), gap(),
    h2("5. Exemption Planning"),
    alertBox("ACTION REQUIRED: Discuss exemptions with client BEFORE filing.","red"), gap(80),
    h3("Section 54 — New Residential Property"),
    bullet("Purchase new house within 2 years (or construct within 3 years) of sale"),
    bullet("Full exemption if new property cost ≥ LTCG"),
    bullet("Potential tax saved: "+formatINR(cg.netTax)),
    bullet("Client status: "+(fd.section54||"NOT YET DISCUSSED")),
    gap(),
    h3("Section 54EC — Capital Gains Bonds"),
    bullet("Invest in NHAI/REC bonds within 6 months of sale"),
    bullet("Maximum: ₹50,00,000. Lock-in: 5 years"),
    bullet("Tax saved: "+formatINR(cg.sec54ecSaved)),
    p("Note: If the property was sold in Q3/Q4 (October\u2013March), the \u20B950L limit applies per financial year. By investing \u20B950L in the sale FY and \u20B950L in the next FY (within 6 months of sale), a total exemption of \u20B91 Crore is possible.", { i: true, sz: 18, color: "666666" }),
    gap(),
    h2("6. TDS Position (Section 195 — NRI)"),
    dataTable(["","Details"],[["Section","195 (NRI seller — 20% + cess on sale price)"],["Est. TDS deducted by buyer",formatINR(cg.tds195)],["Actual tax liability",formatINR(cg.netTax)],["Est. TDS refund",formatINR(cg.tdsRefund)],["Form 16B / 27Q","Required from buyer"]],cw2), gap(),
    alertBox(`KEY INSIGHT: TDS of ${formatINR(cg.tds195)} deducted but actual tax is only ${formatINR(cg.netTax)}. Estimated refund: ${formatINR(cg.tdsRefund)}`,"blue"), gap(80),
    h2("7. Net Tax Summary"),
    dataTable(["Scenario","Tax","TDS Paid","Refund / Payable"],[
      ["Option "+cg.better+", no exemption",formatINR(cg.netTax),formatINR(cg.tds195),"Refund "+formatINR(cg.tdsRefund)],
      ["Full Section 54","₹0",formatINR(cg.tds195),"Refund "+formatINR(cg.tds195)],
    ],[2400,2400,2424,2424]),
    ...disclaimer(),
  ];
  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

function generateMemo(caseData, fy, moduleOutputs){
  const fd = caseData.formData || caseData;
  const cg = (fd.salePrice&&fd.purchaseCost)?computeCapitalGains(fd.salePrice,fd.purchaseCost,fd.propertyAcqFY||"2020-21",fy,fd.improvementCost||0,fd.stampDutyValue||0,fd.transferExpenses||fd.registrationExpenses||0):null;
  const hp = fd.rentalMonthly ? computeHouseProperty(fd.rentalMonthly*12) : null;
  const cw2=[5400,TW-5400];
  
  const facts = [
    `Currently resident in ${caseData.country||fd.country||"abroad"}, working there ${fd.yearsAbroad||"for several years"}.`,
    `India stay during FY ${fy}: approximately ${fd.stayDays||"?"} days.`,
    fd.rent?`Rental income from property (~${formatINR(fd.rentalMonthly?fd.rentalMonthly*12:300000)}/year).`:null,
    fd.interest?`Interest income: NRO ~${formatINR(fd.nroInterest||0)}, FD ~${formatINR(fd.fdInterest||0)}.`:null,
    fd.propertySale?`Sold ${fd.propertyType||"property"} in ${fd.propertyLocation||"India"} for ${formatINR(fd.salePrice||0)}, acquired FY ${fd.propertyAcqFY||"?"} for ~${formatINR(fd.purchaseCost||0)}.`:null,
    fd.foreignSalary?`Earns foreign salary in ${caseData.country||fd.country}. ${fd.foreignTaxPaid?"Tax paid abroad. ":""}Asked about FTC.`:null,
  ].filter(Boolean);
  
  const actions = [
    fd.propertySale?"Provide sale deed and purchase deed for the property transaction.":null,
    fd.propertySale?"Confirm Section 54/54EC exemption status — have you purchased or plan to purchase a new house?":null,
    "Provide Form 16B from buyer for TDS credit.",
    fd.rent?"Share rent agreement or rental receipt summary.":null,
    "Share passport travel pages for FY "+fy+".",
    fd.foreignSalary?`Share ${caseData.country||fd.country} P60 or employer tax summary.`:null,
  ].filter(Boolean);

  const children = [
    ...header("Client Advisory Memo", `NRI Tax Advisory — FY ${fy}`, caseData, fy),
    h2("Facts Captured"), ...facts.map(f=>bullet(f)), gap(),
    h2("Assumptions"),
    num(`Preliminary Non-Resident status adopted based on ~${fd.stayDays||"?"} days stay.`),
    fd.purchaseCost?num(`Property cost assumed at ${formatINR(fd.purchaseCost)} — pending deed verification.`):null,
    num("New tax regime (Section 115BAC) assumed as default."),
    gap(),
    ...(cg ? [
      h2("Key Issue — Capital Gains"),
      p(`Dual computation shows Option ${cg.better} saves ${formatINR(cg.savings)}:`,{b:true}),
      dataTable(["","Option A (20% Indexed)","Option B (12.5% Flat)"],[
        ["LTCG",formatINR(cg.optionA.ltcg),formatINR(cg.optionB.ltcg)],
        ["Tax + Cess",formatINR(cg.optionA.total),formatINR(cg.optionB.total)],
      ],[3200,3224,3224]),
      alertBox(`Section 54 planning: ${fd.section54||"NOT DISCUSSED"} — could eliminate tax entirely.`,"red"),
      gap(),
    ] : []),
    ...(fd.foreignTaxPaid ? [
      h2("FTC Clarification"),
      p(`Since you are Non-Resident, your ${caseData.country||fd.country} salary is not taxable in India. FTC applies only when the same income is taxed in both countries. FTC is not applicable in your case.`,{b:true}),
      gap(),
    ] : []),
    ...(hp ? [
      h2("Rental Income"),
      dataTable(["","Amount"],[["Gross Annual Rent",formatINR(hp.grossRent)],["Standard Deduction (30%)","("+formatINR(hp.standardDeduction)+")"],["Taxable",formatINR(hp.taxableIncome)]],cw2),
      gap(),
    ] : []),
    h2("Risk Flags"),
    fd.propertySale?bullet("Filing should NOT be finalized until sale/purchase documents are verified."):null,
    fd.propertySale?bullet("Section 54/54EC planning must happen before filing."):null,
    bullet("TDS credits must be verified against 26AS."),
    gap(),
    h2("Recommended Actions"), ...actions.map(a=>num(a)),
    ...(fd.propertySale ? [
      gap(),
      h2("Repatriation — Form 15CA/15CB"),
      p("For remitting property sale proceeds outside India, the following steps are mandatory:"),
      num("Obtain CA certificate in Form 15CB — assessing TDS adequacy and DTAA applicability"),
      num("File Form 15CA online at incometax.gov.in (Part C for amounts exceeding \u20B95 lakhs)"),
      num("Submit Form 15CA acknowledgement to your bank with the remittance request"),
      num("Bank processes remittance after verification of 15CA/15CB and FIRS certificate"),
      p("Note: Form 15CA/15CB must be filed BEFORE the remittance. Banks will not process without it.", { i: true }),
    ] : []),
    ...disclaimer(),
  ].filter(Boolean);

  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

function generateQuote(caseData, fy){
  const fd = caseData.formData || caseData;
  const c = caseData.classification || "Amber";
  const tierMap = {
    Green: "Tier 1 — Basic Filing (₹8,000–15,000)",
    Amber: "Tier 2 — Advisory Filing (₹18,000–30,000)",
    Red: "Tier 3 — Premium Compliance (₹35,000–75,000)",
  };
  const tier = tierMap[c] || tierMap.Amber;
  const cw2=[3200,TW-3200];
  
  const inclusions = [
    "Residential status review and confirmation",
    "Income classification across all applicable heads",
    "AIS / 26AS / TIS reconciliation review",
    "ITR form selection and schedule blueprint",
    fd.propertySale?"Capital gains dual-option computation + Section 54 planning":null,
    fd.foreignTaxPaid?"DTAA / FTC applicability review":null,
    "Pre-filing risk review",
    "Return preparation and e-filing",
    "Client Advisory Memo",
    fd.propertySale?"CG Computation Sheet":null,
  ].filter(Boolean);
  
  const children = [
    ...header("Engagement Scope & Fee Quote", `NRI Tax Services — FY ${fy}`, caseData, fy),
    h2("Service Overview"),
    dataTable(["Parameter","Details"],[["Classification",c],["Service Tier",tier],["Turnaround",(c==="Green"?"5–7":"8–12")+" business days"],["Review","Senior Reviewer"+(c!=="Green"?" + Partner sign-off":"")]],cw2), gap(),
    h2("Scope — Included"), ...inclusions.map(i=>num(i)), gap(),
    h2("Scope — Excluded"),
    bullet("Notice representation or response drafting"),
    bullet("Multi-year return filing or regularization"),
    bullet("Foreign country tax return preparation"),
    bullet("Representation before tax authorities"),
    gap(),
    h2("Deliverables"),
    num("Client Advisory Memo"),
    fd.propertySale?num("Capital Gains Computation Sheet"):null,
    num("Filed ITR with acknowledgement"),
    num("Tax computation summary"),
    gap(),
    h2("Next Steps"),
    num("Review and confirm this scope."),
    num("Provide documents as listed in our Document Request."),
    num("We will begin analysis upon document receipt."),
    ...disclaimer(),
  ].filter(Boolean);
  
  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

function generatePositionReport(caseData, fy){
  const fd = caseData.formData || caseData;
  const ti = computeTotalIncome(fd, fy);
  const scheduleALRequired = ti.grossTotal > 5000000;
  const cw4=[2200,2600,2600,TW-7400];
  
  const incomeRows = [
    fd.rent?["House Property",fd.rentalDetails||"Rental",formatINR(fd.rentalMonthly?fd.rentalMonthly*12:0),"Taxable (30% SD)"]:null,
    fd.propertySale?["Capital Gains","Property sale",formatINR(fd.salePrice||0),"LTCG dual computation"]:null,
    fd.nroInterest?["Other Sources","NRO interest",formatINR(fd.nroInterest),"Taxable, TDS"]:null,
    fd.fdInterest?["Other Sources","FD interest",formatINR(fd.fdInterest),"Taxable, TDS"]:null,
    fd.foreignSalary?["Foreign",(caseData.country||fd.country)+" salary","—","Not taxable (NR)"]:null,
  ].filter(Boolean);

  const children = [
    ...header("NRI Tax Position Report", `Diagnostic Assessment — FY ${fy}`, caseData, fy),
    h2("1. Residential Status"),
    (() => {
      const stayDays = parseInt(fd.stayDays) || 0;
      const residencyView = stayDays >= 182
        ? "Resident — stay days >= 182. VERIFY — this changes the entire tax position."
        : stayDays >= 120 && (fd.indianIncome || 0) > 1500000
          ? "Potentially Deemed Resident — 120+ days with Indian income > Rs 15L. VERIFY."
          : `Preliminary Non-Resident (${stayDays > 0 ? 'Stay: ' + stayDays + ' days' : 'Stay days not provided'})`;
      return p("Preliminary View: " + residencyView, {b:true});
    })(),
    p(`Based on ~${fd.stayDays||"?"} days stay and continuous overseas employment.`),
    alertBox("The ₹12 lakh tax-free benefit (Section 87A) does NOT apply to NRIs.","red"),
    gap(),
    h2("2. Income Summary"),
    dataTable(["Head","Source","Amount","Taxability"], incomeRows, cw4),
    gap(),
    h2("3. Key Issues"),
    fd.propertySale?num("Capital gains from property sale — dual computation needed. See CG Computation Sheet."):null,
    fd.foreignTaxPaid?num("FTC query — not applicable under NR status for foreign salary."):null,
    scheduleALRequired?num(`Schedule AL mandatory — total income ${formatINR(ti.grossTotal)} exceeds ₹50L. Must disclose immovable property, movable property, bank balances, shares, cash in hand.`):null,
    gap(),
    h2("4. Recommended Approach"),
    bullet("Return Form: ITR-2"),
    bullet("Tax Regime: New (default)"),
    bullet(`Key Schedules: CG, HP, OS, TDS${scheduleALRequired?", Schedule AL (Assets & Liabilities)":""}`),
    gap(),
    h2("5. Action Items"),
    fd.propertySale?num("Provide sale deed, purchase deed, Form 16B."):null,
    fd.propertySale?num("Confirm Section 54/54F/54EC status."):null,
    num("Share passport travel pages."),
    num("Review Engagement Quote and confirm."),
    gap(),
    h2("6. Required Documents"),
    p("Based on this client's income profile, the following documents are needed:"),
    bullet("PAN card copy"),
    bullet("Passport (first + last page, visa stamps for stay days)"),
    fd.salary ? bullet("Form 16 from Indian employer") : null,
    fd.propertySale ? bullet("Sale deed + registration documents") : null,
    fd.propertySale ? bullet("Purchase deed (original acquisition)") : null,
    fd.propertySale ? bullet("Form 16B (TDS certificate from buyer)") : null,
    fd.rent ? bullet("Rent agreement + tenant details") : null,
    (fd.nroInterest || fd.fdInterest) ? bullet("NRO/FD bank statements + interest certificates") : null,
    fd.cgShares || fd.cgMF ? bullet("Demat/broker capital gains statement") : null,
    fd.cgESOPRSU ? bullet("ESOP/RSU vesting and exercise statements") : null,
    fd.foreignTaxPaid ? bullet("Foreign tax return + TRC (Tax Residency Certificate)") : null,
    bullet("26AS / AIS download from incometax.gov.in"),
    fd.propertySale ? bullet("Form 15CA/15CB (for repatriation)") : null,
    bullet("Prior year ITR acknowledgements (if any)"),
    ...disclaimer(),
  ].filter(Boolean);

  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

// ══════ TOTAL INCOME COMPUTATION ══════
function generateTotalIncome(caseData, fy){
  const fd = caseData.formData || caseData;
  const ti = computeTotalIncome(fd, fy);
  const cw2=[5400,TW-5400], cw3=[4000,2824,2824];

  // ── Capital gains reference ──
  const cgHead = ti.heads.find(h=>h.head.includes("Capital Gains"));
  const cg = cgHead ? cgHead.computation : null;

  // ── House property reference ──
  const hpHead = ti.heads.find(h=>h.head==="House Property");
  const hp = hpHead ? hpHead.computation : null;

  // ── Income summary rows ──
  const incomeRows = [];
  if (fd.salary) incomeRows.push(["Salary","Indian employer",formatINR(0)+"*"]);
  if (hp) incomeRows.push(["House Property","Rental income",formatINR(hp.taxableIncome)]);
  if (cg){
    const betterLtcg = cg.better==="B" ? cg.optionB.ltcg : cg.optionA.ltcg;
    incomeRows.push(["Capital Gains (LTCG)","Property sale — Option "+cg.better,formatINR(betterLtcg)]);
  }
  if (fd.nroInterest) incomeRows.push(["Other Sources","NRO interest",formatINR(fd.nroInterest)]);
  if (fd.fdInterest) incomeRows.push(["Other Sources","FD interest",formatINR(fd.fdInterest)]);
  if (fd.dividendAmount) incomeRows.push(["Other Sources","Dividends",formatINR(fd.dividendAmount)]);
  if (fd.business) incomeRows.push(["Business/Profession","As declared",formatINR(0)+"*"]);
  incomeRows.push(["GROSS TOTAL INCOME","",formatINR(ti.grossTotal)]);

  // ── Slab tax breakdown ──
  const cgAmount = cgHead ? cgHead.amount : 0;
  const nonCG = Math.max(0, ti.taxableIncome - cgAmount);
  const slabRows = [];
  const slabs = [
    { upto:400000, rate:0 }, { upto:800000, rate:5 }, { upto:1200000, rate:10 },
    { upto:1600000, rate:15 }, { upto:2000000, rate:20 }, { upto:2400000, rate:25 },
    { upto:Infinity, rate:30 },
  ];
  let rem = nonCG, prev = 0;
  for (const slab of slabs){
    const bracket = slab.upto === Infinity ? rem : slab.upto - prev;
    const taxable = Math.min(rem, bracket);
    if (taxable > 0){
      const label = slab.upto === Infinity
        ? "Above "+formatINR(prev)
        : formatINR(prev)+" — "+formatINR(slab.upto);
      slabRows.push([label, slab.rate+"%", formatINR(taxable), formatINR(Math.round(taxable*slab.rate/100))]);
      rem -= taxable;
    }
    prev = slab.upto;
    if (rem <= 0) break;
  }

  // ── Advance tax ──
  const advTax = computeAdvanceTax(ti.totalWithCess, ti.tds.total, fy);

  // ── Build document ──
  const children = [
    ...header("Computation of Total Income", `NRI Tax Statement — FY ${fy} (AY ${FY_CONFIG[fy]?.ay||"2026-27"})`, caseData, fy),
    p("Tax Regime: New Regime (Section 115BAC)", {b:true, c:"2E5E8C"}),
    p("Status: Non-Resident", {b:true}),
    gap(),

    // ─── 1. Income under each head ───
    h2("1. Income Under Each Head"),

    ...(hp ? [
      h3("A. House Property"),
      dataTable(["Particulars","Amount"],[
        ["Gross Annual Rent", formatINR(hp.grossRent)],
        ["Less: Standard Deduction (30%)", "("+formatINR(hp.standardDeduction)+")"],
        ["Net Taxable (House Property)", formatINR(hp.taxableIncome)],
      ], cw2), gap(80),
    ] : []),

    ...(cg ? [
      h3("B. Capital Gains (LTCG — Property)"),
      dataTable(["Particulars","Option A (20% Indexed)","Option B (12.5% Flat)"],[
        ["Cost of Acquisition", formatINR(fd.purchaseCost||0), formatINR(fd.purchaseCost||0)],
        ["Indexed Cost", formatINR(cg.indexedCost), "N/A"],
        ["Sale Consideration", formatINR(fd.salePrice||0), formatINR(fd.salePrice||0)],
        ["LTCG", formatINR(cg.optionA.ltcg), formatINR(cg.optionB.ltcg)],
        ["Tax", formatINR(cg.optionA.tax), formatINR(cg.optionB.tax)],
      ], cw3),
      alertBox(`CHOSEN: Option ${cg.better} — LTCG ${formatINR(cg.better==="B"?cg.optionB.ltcg:cg.optionA.ltcg)} (saves ${formatINR(cg.savings)})`, "green"),
      gap(80),
    ] : []),

    ...((fd.nroInterest||fd.fdInterest||fd.dividendAmount) ? [
      h3("C. Other Sources"),
      dataTable(["Source","Amount"],[
        ...(fd.nroInterest ? [["NRO Savings Interest", formatINR(fd.nroInterest)]] : []),
        ...(fd.fdInterest ? [["Fixed Deposit Interest", formatINR(fd.fdInterest)]] : []),
        ...(fd.dividendAmount ? [["Dividends", formatINR(fd.dividendAmount)]] : []),
        ["Total — Other Sources", formatINR((fd.nroInterest||0)+(fd.fdInterest||0)+(fd.dividendAmount||0))],
      ], cw2), gap(80),
    ] : []),

    ...(fd.foreignSalary ? [
      h3("D. Foreign Salary"),
      alertBox("Foreign salary is NOT taxable in India — taxpayer is Non-Resident. Not included in total income.", "amber"),
      gap(80),
    ] : []),

    h3("Summary — All Heads"),
    dataTable(["Head","Source","Amount"], incomeRows, cw3), gap(),

    // ─── 2. Deductions ───
    h2("2. Deductions"),
    dataTable(["Deduction","Section","Amount"],[
      ...(fd.salary ? [["Standard Deduction (Salaried)","New Regime",formatINR(75000)]] : []),
      ["Chapter VI-A (New Regime)","Limited / Nil",formatINR(0)],
      ["TOTAL DEDUCTIONS","",formatINR(ti.deductions)],
    ], cw3), gap(80),
    alertBox("TOTAL INCOME: "+formatINR(ti.taxableIncome), "green"), gap(),

    // ─── 3. Tax Computation ───
    h2("3. Tax Computation"),

    h3("A. Tax on Normal Income (Slab Rates — New Regime FY 2025-26)"),
    p("Taxable normal income (excluding LTCG): "+formatINR(nonCG), {b:true}),
    dataTable(["Slab","Rate","Taxable Amount","Tax"], slabRows, [2800,1200,2824,2824]),
    p("Tax on normal income: "+formatINR(ti.slabTax), {b:true}), gap(80),

    ...(cg ? [
      h3("B. Tax on LTCG"),
      p(`Option ${cg.better}: ${cg.better==="B"?"12.5%":"20%"} on ${formatINR(cg.better==="B"?cg.optionB.ltcg:cg.optionA.ltcg)} = ${formatINR(ti.cgTax)}`, {b:true}),
      gap(80),
    ] : []),

    dataTable(["Component","Amount"],[
      ["Tax on normal income (slab rates)", formatINR(ti.slabTax)],
      ...(cg ? [["Tax on LTCG (Option "+cg.better+")", formatINR(ti.cgTax)]] : []),
      ["Total Tax", formatINR(ti.totalTax)],
      ["Health & Education Cess (4%)", formatINR(ti.cess)],
      ["TOTAL TAX PAYABLE", formatINR(ti.totalWithCess)],
    ], cw2), gap(),
    alertBox("Section 87A rebate is NOT available to Non-Resident Indians.", "red"), gap(),

    // ─── 4. TDS Credit ───
    h2("4. TDS Credit"),
    dataTable(["Section","Source","TDS Rate","Amount"],[
      ...(ti.tds.property > 0 ? [["195","Property sale (NRI)","20.8% of sale price",formatINR(ti.tds.property)]] : []),
      ...(ti.tds.interest > 0 ? [["194A / 195","NRO / FD interest","30%",formatINR(ti.tds.interest)]] : []),
      ...(ti.tds.tcsLRS > 0 ? [["206C(1G)","TCS on LRS remittances","20% above \u20B97L",formatINR(ti.tds.tcsLRS)]] : []),
      ["","TOTAL TDS / TCS CREDIT","",formatINR(ti.tds.total)],
    ], [1600,3200,1600,TW-6400]), gap(),

    // ─── 5. Net Tax Position ───
    h2("5. Net Tax Position"),
    dataTable(["Particulars","Amount"],[
      ["Total Tax Payable", formatINR(ti.totalWithCess)],
      ["Less: TDS Credit", "("+formatINR(ti.tds.total)+")"],
      [ti.isRefund ? "REFUND DUE" : "BALANCE PAYABLE", formatINR(Math.abs(ti.refundOrPayable))],
    ], cw2), gap(80),
    alertBox(
      ti.isRefund
        ? "REFUND DUE: "+formatINR(Math.abs(ti.refundOrPayable))+" — File ITR to claim refund"
        : "BALANCE PAYABLE: "+formatINR(Math.abs(ti.refundOrPayable)),
      ti.isRefund ? "green" : "red"
    ), gap(),

    // ─── 6. Advance Tax Schedule ───
    ...(advTax && advTax.required ? [
      h2("6. Advance Tax Schedule"),
      p("Balance payable exceeds Rs 10,000 — advance tax is applicable under Section 208.", {b:true}),
      dataTable(["Installment Date","Cumulative %","Amount Due"],[
        ...advTax.schedule.map(s => [s.date, s.percent+"%", formatINR(s.amount)]),
      ], cw3),
      p("Interest under Section 234B (non-payment) and Section 234C (deferment) applies if advance tax is not paid on schedule.", {i:true, c:"6B6256", sz:20}),
      gap(),
    ] : [
      h2("6. Advance Tax"),
      p("No advance tax obligation — balance payable is below Rs 10,000 or a refund is due.", {c:"2E7D32", b:true}),
      gap(),
    ]),

    // ─── 7. Important Notes ───
    h2("7. Important Notes"),
    bullet("Section 87A rebate is NOT available to Non-Resident Indians. Tax is payable from the first rupee of taxable income under applicable slab rates."),
    ...(fd.foreignSalary ? [bullet("Foreign salary earned in "+((caseData.country||fd.country)||"abroad")+" is not taxable in India as the taxpayer is a Non-Resident. This income is excluded from the computation.")] : []),
    ...(cg ? [bullet("Section 54/54EC planning: "+(fd.section54||"NOT YET DISCUSSED")+". If a new residential property is purchased within 2 years (or constructed within 3 years) of sale, LTCG can be fully or partially exempt under Section 54.")] : []),
    bullet("Form 15CA/15CB is required before remitting sale proceeds or other taxable income outside India. Ensure these are filed before repatriation."),
    bullet("This computation is based on information provided to date. Final figures may change upon receipt of sale deed, 26AS/AIS reconciliation, and document verification."),
    ...disclaimer(),
  ].filter(Boolean);

  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

// ═══ Auth helper ═══
async function verifyAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const { cookies } = await import('next/headers');
  const { createServerClient: createSSR } = await import('@supabase/ssr');
  const cookieStore = cookies();
  const supabase = createSSR(supabaseUrl, supabaseKey, {
    cookies: { get(name) { return cookieStore.get(name)?.value; } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ═══ API HANDLER ═══
export async function POST(request) {
  // Auth check — deliverables contain confidential client data
  const user = await verifyAuth();
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, caseData, fy, moduleOutputs } = await request.json();

    let doc;
    switch(type) {
      case 'cg_sheet': doc = generateCGSheet(caseData, fy); break;
      case 'memo': doc = generateMemo(caseData, fy, moduleOutputs); break;
      case 'quote': doc = generateQuote(caseData, fy); break;
      case 'position': doc = generatePositionReport(caseData, fy); break;
      case 'total_income': doc = generateTotalIncome(caseData, fy); break;
      default: return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }

    const buffer = await Packer.toBuffer(doc);

    logActivity(null, null, 'deliverable_generated', { type }).catch(() => {});

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${(caseData.name||'client').toLowerCase().replace(/[^a-z0-9]/g,'-')}-${type}.docx"`,
      },
    });

  } catch (error) {
    console.error('DOCX generation error:', error);
    return NextResponse.json({ error: 'Document generation failed. Please try again.' }, { status: 500 });
  }
}
