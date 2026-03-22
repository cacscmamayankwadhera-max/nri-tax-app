import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat } from 'docx';
import { computeCapitalGains, computeHouseProperty, formatINR, FY_CONFIG, CII } from '@/lib/compute';

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
    p("© "+new Date().getFullYear()+" "+FIRM+". Confidential.",{c:"6B6256",sz:18}),
  ];
}

// ══════ GENERATORS ══════
function generateCGSheet(caseData, fy){
  const fd = caseData.formData || caseData;
  const cg = computeCapitalGains(fd.salePrice||0, fd.purchaseCost||0, fd.propertyAcqFY||"2017-18", fy);
  const cw3=[4000,2824,2824], cw2=[5400,TW-5400];
  
  const children = [
    ...header("Capital Gains Computation Sheet", `Property Sale — FY ${fy}`, caseData, fy),
    h2("1. Transaction Details"),
    dataTable(["Particulars","Details"],[["Asset",fd.propertyType||"Residential Plot"],["Location",fd.propertyLocation||"—"],["Acquired","FY "+(fd.propertyAcqFY||"2017-18")],["Sold","FY "+fy],["Holding",((parseInt(fy)-parseInt(fd.propertyAcqFY||"2017"))||7)+" years (Long-Term)"],["Pre July 2024?","Yes — Dual computation"]],cw2), gap(),
    h2("2. Key Amounts"),
    dataTable(["Particulars","Amount"],[["Sale Consideration",formatINR(fd.salePrice||0)],["Cost of Acquisition",formatINR(fd.purchaseCost||0)],["Cost of Improvement",formatINR(0)]],cw2), gap(),
    h2("3. Dual Tax Computation"),
    p("For property acquired before July 23, 2024, the taxpayer may choose the lower-tax option:",{b:true}),
    h3("Option A — 20% LTCG with Indexation"),
    dataTable(["Particulars","Working","Amount"],[
      ["CII — Acquisition ("+(fd.propertyAcqFY||"2017-18")+")","",String(cg.ciiAcq)],["CII — Sale ("+fy+")","",String(cg.ciiSale)],
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
    dataTable(["","Option A (20% Indexed)","Option B (12.5% Flat)"],[
      ["Capital Gain",formatINR(cg.optionA.ltcg),formatINR(cg.optionB.ltcg)],
      ["Tax + Cess",formatINR(cg.optionA.total),formatINR(cg.optionB.total)],
      ["","",cg.better==="B"?"Saves "+formatINR(cg.savings):""]
    ],[3200,3224,3224]), gap(),
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
    gap(),
    h2("6. TDS Position"),
    dataTable(["","Details"],[["Section","194-IA (1%) or 195 (NRI rate)"],["Est. TDS (194-IA)",formatINR(cg.tds194IA)],["Form 16B","Required from buyer"]],cw2), gap(),
    h2("7. Net Tax Summary"),
    dataTable(["Scenario","Tax","After TDS"],[
      ["Option "+cg.better+", no exemption",formatINR(cg.netTax),formatINR(cg.netAfterTDS)],
      ["Full Section 54","₹0","Refund "+formatINR(cg.tds194IA)],
    ],[3200,3224,3224]),
    ...disclaimer(),
  ];
  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

function generateMemo(caseData, fy, moduleOutputs){
  const fd = caseData.formData || caseData;
  const cg = (fd.salePrice&&fd.purchaseCost)?computeCapitalGains(fd.salePrice,fd.purchaseCost,fd.propertyAcqFY||"2017-18",fy):null;
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
    ...disclaimer(),
  ].filter(Boolean);
  
  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

function generateQuote(caseData, fy){
  const fd = caseData.formData || caseData;
  const c = caseData.classification || "Amber";
  const tier = c==="Green"?"Tier 2 — Advisory Filing (₹18,000–30,000)":"Tier 3 — Premium Compliance (₹35,000–75,000)";
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
    p("Preliminary View: Non-Resident (High Confidence)",{b:true}),
    p(`Based on ~${fd.stayDays||"?"} days stay and continuous overseas employment.`),
    alertBox("The ₹12 lakh tax-free benefit (Section 87A) does NOT apply to NRIs.","red"),
    gap(),
    h2("2. Income Summary"),
    dataTable(["Head","Source","Amount","Taxability"], incomeRows, cw4),
    gap(),
    h2("3. Key Issues"),
    fd.propertySale?num("Capital gains from property sale — dual computation needed. See CG Computation Sheet."):null,
    fd.foreignTaxPaid?num("FTC query — not applicable under NR status for foreign salary."):null,
    fd.indianAssets==="Above ₹1 Crore"?num("Asset disclosure ₹1Cr+ required in ITR-2."):null,
    gap(),
    h2("4. Recommended Approach"),
    bullet("Return Form: ITR-2"),
    bullet("Tax Regime: New (default)"),
    bullet(`Key Schedules: CG, HP, OS, TDS${fd.indianAssets==="Above ₹1 Crore"?", Asset Disclosure":""}`),
    gap(),
    h2("5. Action Items"),
    fd.propertySale?num("Provide sale deed, purchase deed, Form 16B."):null,
    fd.propertySale?num("Confirm Section 54/54F/54EC status."):null,
    num("Share passport travel pages."),
    num("Review Engagement Quote and confirm."),
    ...disclaimer(),
  ].filter(Boolean);
  
  return new Document({ numbering, styles, sections:[{ properties:pageProps, children }] });
}

// ═══ API HANDLER ═══
export async function POST(request) {
  try {
    const { type, caseData, fy, moduleOutputs } = await request.json();
    
    let doc;
    switch(type) {
      case 'cg_sheet': doc = generateCGSheet(caseData, fy); break;
      case 'memo': doc = generateMemo(caseData, fy, moduleOutputs); break;
      case 'quote': doc = generateQuote(caseData, fy); break;
      case 'position': doc = generatePositionReport(caseData, fy); break;
      default: return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
    
    const buffer = await Packer.toBuffer(doc);
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${(caseData.name||'client').toLowerCase().replace(/[^a-z0-9]/g,'-')}-${type}.docx"`,
      },
    });
    
  } catch (error) {
    console.error('DOCX generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
