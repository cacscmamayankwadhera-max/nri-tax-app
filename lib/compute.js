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
export function computeCapitalGains(salePrice, purchaseCost, acqFY, saleFY, improvement = 0) {
  const ciiAcq = CII[acqFY] || 272;
  const ciiSale = CII[saleFY] || 376;

  // Option A: 20% with indexation
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

  const better = totalB < totalA ? "B" : "A";
  const savings = Math.abs(totalA - totalB);
  const betterLtcg = better === "B" ? ltcgB : ltcgA;
  const betterTax = better === "B" ? totalB : totalA;

  // ── Fix 1: TDS under Section 195 (NRI property sale) ──
  // Buyer deducts TDS at 20% of sale consideration + 4% cess = 20.8%
  // This is the standard safe-harbor rate under Section 195 for NRI sellers
  const tds195 = Math.round(salePrice * 0.208);
  const tdsRefund = tds195 - betterTax; // NRIs overpay TDS massively — refund is the key insight

  // Backward compat alias (old field name kept so existing UI references don't break)
  const tds194IA = tds195;

  // ── Fix 3: Section 54EC — correct tax-saved computation ──
  // Exemption: invest up to Rs 50L in NHAI/REC bonds within 6 months
  // Reduces LTCG by the invested amount; tax saved = difference
  const ec54Amount = Math.min(betterLtcg, 5000000);
  const remainingGain54EC = Math.max(0, betterLtcg - ec54Amount);
  const taxWith54EC = Math.round(
    remainingGain54EC * (better === "A" ? 0.20 : 0.125) * 1.04
  );
  const sec54ecSaved = betterTax - taxWith54EC;

  return {
    ciiAcq, ciiSale, indexedCost,
    optionA: { ltcg: ltcgA, tax: taxA, cess: cessA, total: totalA },
    optionB: { ltcg: ltcgB, tax: taxB, cess: cessB, total: totalB },
    better, savings,
    // TDS — Section 195 (NRI)
    tds195,
    tdsRefund,
    tds194IA,           // backward compat alias → same as tds195
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

// ═══ Fix 2: Section 54 — Residential Property Exemption ═══
export function computeSection54(ltcg, newHousePrice, section54Status) {
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

  // Exemption = lower of (LTCG, cost of new house)
  const exemptAmount = Math.min(Math.max(0, ltcg), Math.max(0, newHousePrice || 0));
  const taxableAfterExemption = Math.max(0, ltcg - exemptAmount);

  // Tax on remaining at 20% + 4% cess (Option A rate; caller can adjust)
  const taxOnRemaining = Math.round(taxableAfterExemption * 0.20);
  const cessOnRemaining = Math.round(taxOnRemaining * 0.04);
  const totalAfterExemption = taxOnRemaining + cessOnRemaining;

  // Original tax (before exemption) at 20% + cess
  const originalTax = Math.round(ltcg * 0.20);
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

// ═══ Fix 4: Advance Tax Computation ═══
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
      { date: '15 June ' + year1,      percent: 15,  amount: Math.round(balance * 0.15) },
      { date: '15 September ' + year1, percent: 45,  amount: Math.round(balance * 0.45) },
      { date: '15 December ' + year1,  percent: 75,  amount: Math.round(balance * 0.75) },
      { date: '15 March ' + year2,     percent: 100, amount: balance },
    ],
    note: 'Interest under Section 234B (non-payment) and 234C (deferment) applies if advance tax is not paid on schedule.',
    ay: cfg.ay,
  };
}

// ═══ House Property Computation ═══
export function computeHouseProperty(annualRent, municipalTax = 0, loanInterest = 0) {
  const nav = annualRent - municipalTax;
  const standardDeduction = Math.round(nav * 0.30);
  const interestDeduction = Math.min(loanInterest, 200000);
  const taxableIncome = nav - standardDeduction - interestDeduction;

  return {
    grossRent: annualRent, municipalTax, nav,
    standardDeduction, interestDeduction, taxableIncome
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

// ═══ Fix 5: Total Income Assembly (NRI) ═══
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
    const betterLtcg = cgResult.better === 'A' ? cgResult.optionA.ltcg : cgResult.optionB.ltcg;
    heads.push({
      head: 'Capital Gains (LTCG)',
      source: 'Property sale',
      amount: betterLtcg,
      computation: cgResult,
      note: `Option ${cgResult.better} chosen (saves ${formatINR(cgResult.savings)})`,
    });
    grossTotal += betterLtcg;
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
  const cgHead = heads.find(h => h.head.includes('Capital Gains'));
  const cgTax = cgResult
    ? (cgResult.better === 'A' ? cgResult.optionA.total : cgResult.optionB.total)
    : 0;
  const cgAmount = cgHead ? cgHead.amount : 0;
  const nonCGIncome = Math.max(0, taxableIncome - cgAmount);
  const slabTax = computeSlabTax(nonCGIncome);
  const totalTax = cgTax + slabTax;
  const cess = Math.round(totalTax * 0.04);
  const totalWithCess = totalTax + cess;

  // TDS
  const tds195 = f.propertySale ? Math.round((f.salePrice || 0) * 0.208) : 0;
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
