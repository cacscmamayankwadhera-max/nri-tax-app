// ═══ Cost Inflation Index Table ═══
export const CII = {
  "2001-02":100,"2002-03":105,"2003-04":109,"2004-05":113,"2005-06":117,
  "2006-07":122,"2007-08":129,"2008-09":137,"2009-10":148,"2010-11":167,
  "2011-12":184,"2012-13":200,"2013-14":220,"2014-15":240,"2015-16":254,
  "2016-17":264,"2017-18":272,"2018-19":280,"2019-20":289,"2020-21":301,
  "2021-22":317,"2022-23":331,"2023-24":348,"2024-25":363,"2025-26":376
};

export const FY_CONFIG = {
  "2025-26": { ay:"2026-27", cii:376, due:"31 July 2026" },
  "2024-25": { ay:"2025-26", cii:363, due:"31 July 2025" }
};

// ═══ Capital Gains Dual Computation (NRI — Section 195 TDS) ═══
// NRIs ARE individuals — they get the dual option (20% indexed vs 12.5% flat)
// for properties acquired before 23 July 2024 per Finance (No.2) Act 2024 proviso.
// TDS under Section 195: Buyer deducts 20% of SALE CONSIDERATION + surcharge + cess.
// This is the DEFAULT rate without a Section 197 lower TDS certificate.
// The NRI claims refund of excess TDS (TDS deducted minus actual tax) in ITR.
export function computeCapitalGains(salePrice, purchaseCost, acqFY, saleFY, improvement = 0) {
  const ciiAcq = CII[acqFY] || 272;
  const ciiSale = CII[saleFY] || 376;

  // Option A: 20% with indexation (available for pre-July 2024 properties)
  const indexedCost = Math.round((purchaseCost + improvement) * ciiSale / ciiAcq);
  const ltcgA = Math.max(0, salePrice - indexedCost);
  const taxA = Math.round(ltcgA * 0.20);
  const cessA = Math.round(taxA * 0.04);
  const totalA = taxA + cessA;

  // Option B: 12.5% without indexation
  const ltcgB = Math.max(0, salePrice - purchaseCost - improvement);
  const taxB = Math.round(ltcgB * 0.125);
  const cessB = Math.round(taxB * 0.04);
  const totalB = taxB + cessB;

  // Recommend whichever produces lower tax
  const better = totalB < totalA ? "B" : "A";
  const savings = Math.abs(totalA - totalB);
  const betterLtcg = better === "B" ? ltcgB : ltcgA;
  const betterTax = better === "B" ? totalB : totalA;

  // ── TDS under Section 195 (NRI property sale) ──
  // DEFAULT: Buyer deducts 20% of SALE CONSIDERATION + surcharge + cess
  // This is what's actually deducted when lower TDS certificate is NOT obtained.
  // Surcharge on sale consideration (conservative — buyer applies on full amount):
  let surchargeRate = 0;
  if (salePrice > 10000000) surchargeRate = 0.15;       // >1Cr, 15% surcharge (capped for LTCG)
  else if (salePrice > 5000000) surchargeRate = 0.10;    // >50L, 10% surcharge
  const tds195 = Math.round(salePrice * 0.20 * (1 + surchargeRate) * 1.04);
  // Refund = TDS deducted minus actual tax at chosen option
  const tdsRefund = tds195 - betterTax;

  // Backward compat alias
  const tds194IA = tds195;

  // ── Section 54EC ──
  // Invest up to ₹50L in NHAI/REC bonds within 6 months of sale
  // Tax saved = tax on exempted amount at the chosen option's rate
  const ec54Amount = Math.min(betterLtcg, 5000000);
  const remainingGain54EC = Math.max(0, betterLtcg - ec54Amount);
  const betterRate = better === "A" ? 0.20 : 0.125;
  const taxWith54EC = Math.round(remainingGain54EC * betterRate * 1.04);
  const sec54ecSaved = betterTax - taxWith54EC;

  return {
    ciiAcq, ciiSale, indexedCost,
    optionA: { ltcg: ltcgA, tax: taxA, cess: cessA, total: totalA },
    optionB: { ltcg: ltcgB, tax: taxB, cess: cessB, total: totalB },
    better, savings,
    // TDS — Section 195 — 20% of sale consideration (default without lower TDS certificate)
    tds195,
    tdsRefund,
    tds194IA,           // backward compat alias
    surchargeRate,
    // Section 54EC
    sec54ecSaved,
    sec54ecTaxWith: taxWith54EC,
    sec54ecExemption: ec54Amount,
    // Net position
    netTax: betterTax,
    netAfterTDS: betterTax - tds195,
    // Section 54 full exemption scenario
    withSec54Full: 0,
    refundWithSec54: tds195,
  };
}

// ═══ Equity/MF Capital Gains (FY 2025-26) ═══
// STCG on listed equity/MF: 20% u/s 111A (raised from 15% by Finance No.2 Act 2024)
// LTCG on listed equity/MF: 12.5% u/s 112A above ₹1.25L exemption threshold
export function computeEquityCG(stcgAmount = 0, ltcgAmount = 0) {
  // STCG — Section 111A — flat 20% + cess
  const stcgTax = Math.round(stcgAmount * 0.20);
  const stcgCess = Math.round(stcgTax * 0.04);
  const stcgTotal = stcgTax + stcgCess;

  // LTCG — Section 112A — 12.5% above ₹1.25L exemption
  const ltcgExemption = 125000;
  const ltcgTaxable = Math.max(0, ltcgAmount - ltcgExemption);
  const ltcgTax = Math.round(ltcgTaxable * 0.125);
  const ltcgCess = Math.round(ltcgTax * 0.04);
  const ltcgTotal = ltcgTax + ltcgCess;

  return {
    stcg: { amount: stcgAmount, tax: stcgTax, cess: stcgCess, total: stcgTotal, rate: '20% (Section 111A)' },
    ltcg: { amount: ltcgAmount, exemption: ltcgExemption, taxable: ltcgTaxable, tax: ltcgTax, cess: ltcgCess, total: ltcgTotal, rate: '12.5% above ₹1.25L (Section 112A)' },
    totalTax: stcgTotal + ltcgTotal,
  };
}

// ═══ Section 54 — Residential Property Exemption ═══
// Fix 3: Added Rs 10Cr cap per Finance Act 2023 (effective FY 2023-24 onwards).
// Fix 4: Tax rate changed from 20% to 12.5% for NRIs post July 2024.
export function computeSection54(ltcg, newHousePrice, section54Status, chosenRate = 0.125) {
  // Determine eligibility from status
  const eligibleStatuses = [
    'Yes — bought new house',
    'Yes - bought new house',
    'Planning to buy',
    'Considering government bonds',
  ];
  const notEligibleStatuses = ['No', 'Not sure'];

  const statusNorm = (section54Status || '').trim();
  const eligible = eligibleStatuses.some(s =>
    statusNorm.toLowerCase().startsWith(s.toLowerCase())
  );
  const planningOpportunity = notEligibleStatuses.some(s =>
    statusNorm.toLowerCase() === s.toLowerCase()
  );

  if (!eligible) {
    return {
      eligible: false,
      planningOpportunity,
      exemptAmount: 0,
      taxableAfterExemption: ltcg,
      taxOnRemaining: 0,
      cessOnRemaining: 0,
      totalAfterExemption: 0,
      savings: 0,
      note: planningOpportunity
        ? 'Section 54 exemption not currently claimed. Consider purchasing a residential house within 2 years (or 1 year before sale) or constructing within 3 years to avail exemption.'
        : 'Section 54 status not provided.',
    };
  }

  // Fix 3: Exemption = lower of (LTCG, cost of new house, Rs 10 Crore cap)
  const exemptAmount = Math.min(Math.max(0, ltcg), Math.max(0, newHousePrice || 0), 100000000);
  const taxableAfterExemption = Math.max(0, ltcg - exemptAmount);

  // Tax on remaining gain at the CHOSEN option's rate (20% if Option A, 12.5% if Option B)
  const taxRate = chosenRate;
  const taxOnRemaining = Math.round(taxableAfterExemption * taxRate);
  const cessOnRemaining = Math.round(taxOnRemaining * 0.04);
  const totalAfterExemption = taxOnRemaining + cessOnRemaining;

  // Original tax (before exemption) at the same chosen rate
  const originalTax = Math.round(ltcg * taxRate);
  const originalCess = Math.round(originalTax * 0.04);
  const originalTotal = originalTax + originalCess;
  const savingsAmount = originalTotal - totalAfterExemption;

  return {
    eligible: true,
    planningOpportunity: false,
    exemptAmount,
    taxableAfterExemption,
    taxOnRemaining,
    cessOnRemaining,
    totalAfterExemption,
    savings: savingsAmount,
    note: exemptAmount >= ltcg
      ? 'Full exemption under Section 54. Entire LTCG is exempt.'
      : `Partial exemption of ${formatINR(exemptAmount)}. Remaining ${formatINR(taxableAfterExemption)} is taxable.`,
  };
}

// ═══ Advance Tax Computation ═══
// Fix 7: Changed from cumulative to incremental installment amounts, with cumulative field added.
export function computeAdvanceTax(totalTax, tds, fy) {
  const balance = Math.max(0, totalTax - tds);
  if (balance < 10000) return null; // no advance tax obligation if balance < Rs 10K

  const cfg = FY_CONFIG[fy] || FY_CONFIG["2025-26"];
  const year1 = fy.split('-')[0];
  const year2 = String(parseInt(year1) + 1);

  return {
    required: true,
    totalLiability: totalTax,
    tdsCredit: tds,
    balancePayable: balance,
    schedule: [
      { date: '15 June ' + year1,      percent: 15, installment: 15, amount: Math.round(balance * 0.15), cumulative: Math.round(balance * 0.15) },
      { date: '15 September ' + year1, percent: 45, installment: 30, amount: Math.round(balance * 0.30), cumulative: Math.round(balance * 0.45) },
      { date: '15 December ' + year1,  percent: 75, installment: 30, amount: Math.round(balance * 0.30), cumulative: Math.round(balance * 0.75) },
      { date: '15 March ' + year2,     percent: 100, installment: 25, amount: Math.round(balance * 0.25), cumulative: balance },
    ],
    note: 'Interest under Section 234B (non-payment) and 234C (deferment) applies if advance tax is not paid on schedule.',
    ay: cfg.ay,
  };
}

// ═══ House Property Computation ═══
// Fix 6: Added isSelfOccupied parameter. Interest cap of Rs 2L applies ONLY to self-occupied property.
//        Let-out property has no cap on interest deduction.
export function computeHouseProperty(annualRent, municipalTax = 0, loanInterest = 0, isSelfOccupied = false) {
  const nav = annualRent - municipalTax;
  const standardDeduction = Math.round(nav * 0.30);
  // Fix 6: Rs 2L cap only for self-occupied property; no cap for let-out property
  const interestDeduction = isSelfOccupied ? Math.min(loanInterest, 200000) : loanInterest;
  const taxableIncome = nav - standardDeduction - interestDeduction;

  return {
    grossRent: annualRent, municipalTax, nav,
    standardDeduction, interestDeduction, taxableIncome,
    isSelfOccupied
  };
}

// ═══ New Regime Slab Tax (FY 2025-26 under Section 115BAC) ═══
function computeSlabTax(income) {
  if (income <= 400000) return 0;
  let tax = 0;
  const slabs = [
    [400000,  800000,  0.05],
    [800000,  1200000, 0.10],
    [1200000, 1600000, 0.15],
    [1600000, 2000000, 0.20],
    [2000000, 2400000, 0.25],
    [2400000, Infinity, 0.30],
  ];
  for (const [from, to, rate] of slabs) {
    if (income <= from) break;
    const taxable = Math.min(income, to) - from;
    if (taxable > 0) tax += taxable * rate;
  }
  return Math.round(tax);
}

// ═══ Total Income Assembly (NRI) ═══
// Fix 5: Cess double-counting corrected. CG .total includes cess already, so we use .tax (pre-cess)
//        and apply cess once on the combined (cgTax + slabTax).
// Fix 2 (continued): TDS in this function also updated to match corrected Section 195 computation.
export function computeTotalIncome(formData, fy) {
  const cfg = FY_CONFIG[fy] || FY_CONFIG["2025-26"];
  const f = formData;
  const heads = [];
  let grossTotal = 0;

  // Head 1: Salary (India only — NR foreign salary NOT taxable)
  if (f.salary) {
    heads.push({
      head: 'Salary',
      source: 'Indian employer',
      amount: 0,
      note: 'Amount to be entered from Form 16',
    });
  }

  // Head 2: House Property
  if (f.rent || f.rentalMonthly) {
    const hp = computeHouseProperty((f.rentalMonthly || 0) * 12);
    heads.push({
      head: 'House Property',
      source: 'Rental income',
      amount: hp.taxableIncome,
      computation: hp,
    });
    grossTotal += hp.taxableIncome;
  }

  // Head 3: Capital Gains
  let cgResult = null;
  if (f.propertySale && f.salePrice && f.purchaseCost) {
    cgResult = computeCapitalGains(
      f.salePrice, f.purchaseCost,
      f.propertyAcqFY || '2017-18', fy
    );
    // Use whichever option produces lower tax (NRIs are individuals, get the dual option)
    const chosenLtcg = cgResult.better === 'A' ? cgResult.optionA.ltcg : cgResult.optionB.ltcg;
    heads.push({
      head: 'Capital Gains (LTCG)',
      source: 'Property sale',
      amount: chosenLtcg,
      computation: cgResult,
      note: `Option ${cgResult.better} chosen (saves ${formatINR(cgResult.savings)})`,
    });
    grossTotal += chosenLtcg;
  }

  // Head 3b: Capital Gains — Listed Equity/MF (STCG u/s 111A at 20%, LTCG u/s 112A at 12.5% above ₹1.25L)
  // These are placeholder entries — actual amounts need to come from broker statements
  // The intake form collects flags (cgShares, cgMF, cgESOPRSU) but no amounts yet
  let equityCGTax = 0;
  if (f.cgShares || f.cgMF || f.cgESOPRSU) {
    heads.push({
      head: 'Capital Gains (Equity/MF)',
      source: [f.cgShares && 'Shares', f.cgMF && 'Mutual Funds', f.cgESOPRSU && 'ESOP/RSU'].filter(Boolean).join(', '),
      amount: 0,
      note: 'STCG u/s 111A: 20%. LTCG u/s 112A: 12.5% above ₹1.25L exemption. Amounts to be computed from broker/demat statements.',
    });
    // Tax will be computed when actual amounts are provided
    // For now, flag it as a pending computation item
  }

  // Head 4: Other Sources (NRO/FD interest)
  let otherSources = 0;
  if (f.nroInterest) { otherSources += f.nroInterest; }
  if (f.fdInterest) { otherSources += f.fdInterest; }
  if (otherSources > 0) {
    heads.push({
      head: 'Other Sources',
      source: 'NRO/FD Interest',
      amount: otherSources,
    });
    grossTotal += otherSources;
  }

  // Head 5: PGBP
  if (f.business) {
    heads.push({
      head: 'Business/Profession',
      source: 'As declared',
      amount: 0,
      note: 'Amount to be computed from books',
    });
  }

  // Foreign salary — NOT taxable for Non-Resident
  const foreignNote = f.foreignSalary
    ? 'Foreign salary: NOT taxable in India (Non-Resident)'
    : null;

  // Deductions — new regime has limited deductions
  const deductions = f.salary ? 75000 : 0; // Standard deduction for salaried (new regime)
  const taxableIncome = Math.max(0, grossTotal - deductions);

  // Tax computation — LTCG taxed at special rates, rest at slab rates
  // Fix 5: Use pre-cess tax amount (.tax) from CG, NOT .total which includes cess.
  //        Cess is applied once on the combined (cgTax + slabTax).
  const cgHead = heads.find(h => h.head.includes('Capital Gains'));
  const cgTax = cgResult
    ? (cgResult.better === 'A' ? cgResult.optionA.tax : cgResult.optionB.tax) // use chosen option's pre-cess tax
    : 0;
  const cgAmount = cgHead ? cgHead.amount : 0;
  const nonCGIncome = Math.max(0, taxableIncome - cgAmount);
  const slabTax = computeSlabTax(nonCGIncome);
  const totalTax = cgTax + slabTax;
  const cess = Math.round(totalTax * 0.04); // Cess applied once on combined tax
  const totalWithCess = totalTax + cess;

  // Fix 2 (continued): TDS under Section 195 computed on LTCG at 12.5% + surcharge + cess
  // Uses the same corrected TDS from computeCapitalGains
  const tds195 = (f.propertySale && cgResult) ? cgResult.tds195 : 0;
  const tdsInterest = Math.round(otherSources * 0.30); // 30% TDS on NRO interest for NRI (before DTAA)
  const totalTDS = tds195 + tdsInterest;

  const refundOrPayable = totalTDS - totalWithCess;

  return {
    heads,
    grossTotal,
    deductions,
    taxableIncome,
    cgTax,
    slabTax,
    totalTax,
    cess,
    totalWithCess,
    tds: { property: tds195, interest: tdsInterest, total: totalTDS },
    refundOrPayable,
    isRefund: totalTDS > totalWithCess,
    foreignNote,
    regime: 'New Regime (Section 115BAC)',
    fy,
    ay: cfg.ay,
  };
}

// ═══ Case Classification ═══
export function classifyCase(formData) {
  let score = 0;
  const f = formData;

  if (f.cgProperty || f.propertySale) score += 3;
  if (f.cgShares || f.cgESOPRSU) score += 2;
  if (f.foreignTaxPaid) score += 2;
  if (f.business) score += 2;
  if (f.priorNotices === "Yes") score += 3;
  if (!f.stayDays) score += 1;

  const incomeCount = [
    f.salary, f.rent, f.interest, f.dividend,
    f.cgProperty, f.cgShares, f.cgMF, f.cgESOPRSU, f.business
  ].filter(Boolean).length;
  if (incomeCount >= 3) score += 1;
  if (f.indianAssets === "Above ₹1 Crore") score += 1;

  if (score <= 2) return "Green";
  if (score <= 5) return "Amber";
  return "Red";
}

// ═══ Format currency ═══
export function formatINR(n) {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}
