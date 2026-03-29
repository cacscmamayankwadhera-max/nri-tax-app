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
export function computeCapitalGains(salePrice, purchaseCost, acqFY, saleFY, improvement = 0, stampDutyValue = 0, transferExpenses = 0) {
  const ciiAcq = CII[acqFY] || 272;
  const ciiSale = CII[saleFY] || 376;

  // Fix 4: Section 50C — if stamp duty value exceeds sale price, use stamp duty value as deemed sale consideration
  const effectiveSalePrice = (stampDutyValue > 0 && stampDutyValue > salePrice) ? stampDutyValue : salePrice;
  // Fix 5: Transfer expenses deducted from sale consideration
  const netSaleConsideration = effectiveSalePrice - transferExpenses;

  // Option A: 20% with indexation (available for pre-July 2024 properties)
  const indexedCost = Math.round((purchaseCost + improvement) * ciiSale / ciiAcq);
  const ltcgA = Math.max(0, netSaleConsideration - indexedCost);
  const taxA = Math.round(ltcgA * 0.20);
  const cessA = Math.round(taxA * 0.04);
  const totalA = taxA + cessA;

  // Option B: 12.5% without indexation
  const ltcgB = Math.max(0, netSaleConsideration - purchaseCost - improvement);
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
    // Section 50C
    sec50cApplied: effectiveSalePrice !== salePrice,
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
export function computeAdvanceTax(totalTax, tds, fy, actualPaid = {}) {
  const balance = Math.max(0, totalTax - tds);
  if (balance < 10000) return null; // no advance tax obligation if balance < Rs 10K

  const cfg = FY_CONFIG[fy] || FY_CONFIG["2025-26"];
  const year1 = fy.split('-')[0];
  const year2 = String(parseInt(year1) + 1);

  const schedule = [
    { date: '15 June ' + year1,      percent: 15, installment: 15, amount: Math.round(balance * 0.15), cumulative: Math.round(balance * 0.15), paid: actualPaid.q1Paid||0 },
    { date: '15 September ' + year1, percent: 45, installment: 30, amount: Math.round(balance * 0.30), cumulative: Math.round(balance * 0.45), paid: actualPaid.q2Paid||0 },
    { date: '15 December ' + year1,  percent: 75, installment: 30, amount: Math.round(balance * 0.30), cumulative: Math.round(balance * 0.75), paid: actualPaid.q3Paid||0 },
    { date: '15 March ' + year2,     percent: 100, installment: 25, amount: Math.round(balance * 0.25), cumulative: balance, paid: actualPaid.q4Paid||0 },
  ];

  let runningPaid = 0;
  schedule.forEach(q => {
    runningPaid += (q.paid || 0);
    q.shortfall = Math.max(0, q.cumulative - runningPaid);
  });
  const totalPaid = (actualPaid.q1Paid||0)+(actualPaid.q2Paid||0)+(actualPaid.q3Paid||0)+(actualPaid.q4Paid||0);
  const totalShortfall = Math.max(0, balance - totalPaid);

  return {
    required: true,
    totalLiability: totalTax,
    tdsCredit: tds,
    balancePayable: balance,
    schedule,
    totalPaid,
    totalShortfall,
    note: 'Interest under Section 234B (non-payment) and 234C (deferment) applies if advance tax is not paid on schedule.',
    ay: cfg.ay,
  };
}

// ═══ House Property Computation ═══
// Fix 6: Added isSelfOccupied parameter. Interest cap of Rs 2L applies ONLY to self-occupied property.
//        Let-out property has no cap on interest deduction.
export function computeHouseProperty(annualRent, municipalTax = 0, loanInterest = 0, isSelfOccupied = false, preConstructionInterest = 0, preConstructionYear = 0) {
  const nav = annualRent - municipalTax;
  const standardDeduction = Math.round(nav * 0.30);
  // Fix 9: Pre-construction interest spread over 5 years from year of completion
  const preConstDeduction = preConstructionInterest > 0 ? Math.round(preConstructionInterest / 5) : 0;
  // Fix 6: Rs 2L cap only for self-occupied property; no cap for let-out property
  const totalInterest = loanInterest + preConstDeduction;
  const interestDeduction = isSelfOccupied ? Math.min(totalInterest, 200000) : totalInterest;
  const taxableIncome = nav - standardDeduction - interestDeduction;

  return {
    grossRent: annualRent, municipalTax, nav,
    standardDeduction, interestDeduction, preConstDeduction, taxableIncome,
    isSelfOccupied
  };
}

// ═══ New Regime Slab Tax (FY 2025-26 under Section 115BAC) ═══
// NOTE: Section 87A rebate (₹60,000) is deliberately EXCLUDED — NRIs are not eligible.
// Residents get zero tax up to ₹12L due to this rebate; NRIs do not.
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

// ═══ HRA Exemption — Section 10(13A) ═══
// Minimum of three rules:
//   Rule 1: Actual HRA received
//   Rule 2: 50% of basic salary (metro) or 40% (non-metro)
//   Rule 3: Rent paid minus 10% of basic salary
export function computeHRAExemption(basicSalary, hraReceived, rentPaid, isMetro) {
  const rule2 = Math.round(basicSalary * (isMetro ? 0.50 : 0.40));
  if (hraReceived <= 0) return { exempt: 0, taxable: 0, rule1: 0, rule2, rule3: 0, appliedRule: null, isMetro };
  // No rent paid → rule3 = 0 → exempt = 0, label null (not rule3, which would be misleading)
  if (rentPaid <= 0) return { exempt: 0, taxable: hraReceived, rule1: hraReceived, rule2, rule3: 0, appliedRule: null, isMetro };

  const rule1 = hraReceived;
  const rule3 = Math.max(0, rentPaid - Math.round(basicSalary * 0.10));

  const exempt = Math.min(rule1, rule2, rule3);
  const taxable = hraReceived - exempt;

  // Identify the binding rule (lowest value wins; rule3 wins ties with rule2, rule1 wins ties with rule2)
  let appliedRule;
  if (exempt === rule3 && rule3 <= rule1 && rule3 <= rule2) appliedRule = 'rule3';
  else if (exempt === rule2 && rule2 <= rule1) appliedRule = 'rule2';
  else appliedRule = 'rule1';

  return { exempt, taxable, rule1, rule2, rule3, appliedRule, isMetro };
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
    const salaryAmount = f.salaryAmount || 0;
    let grossSalary = salaryAmount;
    let hraNotes = '';
    let hraResult = null;
    // HRA exemption only available under Old Regime (Section 10(13A) not available under 115BAC New Regime)
    const isOldRegime = (f.taxRegime || '').toLowerCase().includes('old');
    if (isOldRegime && f.basicSalary && f.hraReceived) {
      hraResult = computeHRAExemption(f.basicSalary, f.hraReceived, f.annualRentPaid || 0, f.isMetroCity || false);
      // Clamp: exemption cannot exceed gross salary (guards against data entry errors)
      const clampedExempt = Math.min(hraResult.exempt, salaryAmount);
      if (clampedExempt < hraResult.exempt) hraResult = { ...hraResult, exempt: clampedExempt, taxable: hraResult.hraReceived - clampedExempt };
      grossSalary = Math.max(0, salaryAmount - hraResult.exempt);
      hraNotes = ` | HRA: received=₹${f.hraReceived}, exempt=₹${hraResult.exempt} (Rule ${hraResult.appliedRule || 'none'}), taxable HRA=₹${hraResult.taxable}`;
    } else if (f.basicSalary && f.hraReceived && !isOldRegime) {
      hraNotes = ' | HRA exemption not available under New Regime';
    }
    heads.push({
      head: 'Salary',
      source: 'Indian employer',
      amount: grossSalary,
      note: (salaryAmount ? 'From Form 16' : 'Amount to be entered from Form 16') + hraNotes,
      hraComputation: hraResult,
    });
    grossTotal += grossSalary;
  }

  // Head 2: House Property
  if (f.rent || f.rentalMonthly) {
    const hp = computeHouseProperty((f.rentalMonthly || 0) * 12, f.municipalTax || 0, f.homeLoanInterest || 0, f.isSelfOccupied || false);
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
    // Check if rural agricultural land — NOT a capital asset under Section 2(14)
    if (f.propertyType === 'Agricultural (Rural)') {
      heads.push({
        head: 'Property Sale — NOT Taxable',
        source: 'Rural agricultural land',
        amount: 0,
        note: 'Sale of rural agricultural land is NOT a capital asset under Section 2(14). No capital gains tax applies.',
      });
    } else {
    // Determine holding period — LTCG if held > 24 months
    // NOTE: This uses FY-year difference as a proxy for 24-month holding period.
    // Edge case: property acquired late in a FY (e.g. Feb 2025) and sold early in next FY
    // (e.g. May 2025) = ~3 months but FY diff = 0, correctly classified as STCG.
    // For precise calculation, collect actual acquisition date and sale date.
    const acqYear = parseInt(f.propertyAcqFY) || 2020;
    const saleYear = parseInt(fy) || 2025;
    const holdingYears = saleYear - acqYear;
    const isLTCG = holdingYears >= 2; // 24 months ≈ 2 financial years

    if (isLTCG) {
      cgResult = computeCapitalGains(
        f.salePrice, f.purchaseCost,
        f.propertyAcqFY || '2020-21', fy,
        f.improvementCost || 0, f.stampDutyValue || 0, f.transferExpenses || f.registrationExpenses || 0
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
    } else {
      // Short-term — use computeSTCGProperty
      const stcgResult = computeSTCGProperty(f.salePrice, f.purchaseCost, f.improvementCost || 0);
      heads.push({
        head: 'Capital Gains (STCG — Property)',
        source: 'Property sale (held < 24 months)',
        amount: stcgResult.stcg,
        computation: stcgResult,
        note: 'Short-term capital gain — taxed at slab rates',
      });
      grossTotal += stcgResult.stcg;
      // No cgResult for STCG — it goes to slab income
    }
    } // end else (non-rural agricultural land)
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

  // Surcharge on slab tax (non-CG income)
  const slabSurcharge = computeSurcharge(slabTax, taxableIncome, false, true);
  // Surcharge on CG tax — LTCG surcharge capped at 15%
  const cgSurcharge = cgTax > 0 ? computeSurcharge(cgTax, taxableIncome, true, true) : { surcharge: 0, marginalRelief: 0 };
  const totalSurcharge = slabSurcharge.surcharge + cgSurcharge.surcharge;

  const taxPlusSurcharge = totalTax + totalSurcharge;
  const cess = Math.round(taxPlusSurcharge * 0.04); // Cess applied on tax + surcharge
  const totalWithCess = taxPlusSurcharge + cess;

  // Fix 11: Brought-forward CG losses — can only set off against CG
  const bfLoss = f.broughtForwardLoss || 0;
  const bfLossApplied = Math.min(bfLoss, cgAmount); // BF CG loss can only set off against CG
  const adjustedTotal = Math.max(0, totalWithCess - Math.round(bfLossApplied * (cgResult ? (cgResult.better === 'A' ? 0.20 : 0.125) : 0) * 1.04));

  // Fix 2 (continued): TDS under Section 195 computed on LTCG at 12.5% + surcharge + cess
  // Uses the same corrected TDS from computeCapitalGains
  const tds195 = (f.propertySale && cgResult) ? cgResult.tds195 : 0;
  const tdsInterest = Math.round(otherSources * 0.30); // 30% TDS on NRO interest for NRI (before DTAA)
  const tcsLRS = f.tcsPaidLRS || f.tcsOnLRS || 0; // TCS on LRS remittances — claimable as credit
  const totalTDS = tds195 + tdsInterest + tcsLRS;

  const refundOrPayable = totalTDS - adjustedTotal;

  return {
    heads,
    grossTotal,
    deductions,
    taxableIncome,
    cgTax,
    slabTax,
    totalTax,
    surcharge: totalSurcharge,
    surchargeDetail: { slab: slabSurcharge, cg: cgSurcharge },
    cess,
    totalWithCess: adjustedTotal,
    bfLossApplied,
    bfLossRemaining: bfLoss - bfLossApplied,
    tds: { property: tds195, interest: tdsInterest, tcsLRS, total: totalTDS },
    refundOrPayable,
    isRefund: totalTDS > adjustedTotal,
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
  if (f.crypto) score += 2; // 30% flat, 194S reconciliation, loss set-off restrictions
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

// ═══ Surcharge Computation (Section 2(9) / Finance Act) ═══
// Surcharge brackets on income tax, with marginal relief.
// LTCG (Section 112/112A): surcharge CAPPED at 15%.
// New regime (Section 115BAC): surcharge capped at 25% (not 37%).
export function computeSurcharge(taxAmount, totalIncome, isLTCG = false, isNewRegime = false) {
  // Determine applicable surcharge rate based on total income
  let surchargeRate = 0;
  let thresholdIncome = 0;
  if (totalIncome > 50000000) {
    surchargeRate = 0.37; thresholdIncome = 50000000;
  } else if (totalIncome > 20000000) {
    surchargeRate = 0.25; thresholdIncome = 20000000;
  } else if (totalIncome > 10000000) {
    surchargeRate = 0.15; thresholdIncome = 10000000;
  } else if (totalIncome > 5000000) {
    surchargeRate = 0.10; thresholdIncome = 5000000;
  }

  // Cap for LTCG under Section 112/112A — surcharge max 15%
  if (isLTCG && surchargeRate > 0.15) {
    surchargeRate = 0.15;
  }

  // Cap for new regime — surcharge max 25%
  if (isNewRegime && surchargeRate > 0.25) {
    surchargeRate = 0.25;
  }

  let surcharge = Math.round(taxAmount * surchargeRate);

  // ── Marginal Relief ──
  // Tax + surcharge at current bracket cannot exceed:
  //   (income - threshold) + tax at threshold
  // where threshold = the income level that triggers the current surcharge bracket.
  let marginalRelief = 0;
  if (surchargeRate > 0 && thresholdIncome > 0) {
    // Tax at threshold income (approximate using slab tax for non-CG portion)
    const taxAtThreshold = computeSlabTax(thresholdIncome);
    // Determine surcharge rate applicable just below this bracket
    let prevRate = 0;
    if (thresholdIncome === 50000000) prevRate = 0.25;
    else if (thresholdIncome === 20000000) prevRate = 0.15;
    else if (thresholdIncome === 10000000) prevRate = 0.10;
    else if (thresholdIncome === 5000000) prevRate = 0;
    const surchargeAtThreshold = Math.round(taxAtThreshold * prevRate);
    const totalAtThreshold = taxAtThreshold + surchargeAtThreshold;

    const excessIncome = totalIncome - thresholdIncome;
    const maxAllowed = totalAtThreshold + excessIncome;
    const currentTotal = taxAmount + surcharge;

    if (currentTotal > maxAllowed) {
      marginalRelief = currentTotal - maxAllowed;
      surcharge = surcharge - marginalRelief;
      if (surcharge < 0) surcharge = 0;
    }
  }

  return {
    surcharge,
    marginalRelief,
    effectiveSurcharge: taxAmount > 0 ? surcharge / taxAmount : 0,
    surchargeRate,
  };
}

// ═══ Section 54F — Exemption on Non-Residential Asset Sale Reinvested in House ═══
// Applies to sale of ANY long-term capital asset OTHER THAN residential house.
// Seller must not own more than 1 residential house (other than the new one) on date of transfer.
// Exemption = LTCG x (cost of new house / net sale consideration). Cap: Rs 10 Crore.
export function computeSection54F(ltcg, netSaleConsideration, newHousePrice, chosenRate = 0.125) {
  if (!newHousePrice || newHousePrice <= 0) return { eligible: false, exemptAmount: 0, savings: 0, note: 'No new house investment specified for Section 54F.' };
  const proportionalExemption = Math.round(ltcg * Math.min(1, newHousePrice / netSaleConsideration));
  const exemptAmount = Math.min(proportionalExemption, 100000000); // ₹10Cr cap
  const taxableAfter = Math.max(0, ltcg - exemptAmount);
  const taxOnRemaining = Math.round(taxableAfter * chosenRate * 1.04);
  const originalTax = Math.round(ltcg * chosenRate * 1.04);
  return { eligible: true, exemptAmount, taxableAfterExemption: taxableAfter, taxOnRemaining, savings: originalTax - taxOnRemaining, note: exemptAmount >= ltcg ? 'Full exemption under Section 54F.' : `Partial exemption of ${formatINR(exemptAmount)}.` };
}

// ═══ STCG on Property (held < 24 months) ═══
// Short-term capital gain on property is taxed at slab rates (no special rate).
// TDS under Section 195: Buyer deducts 30% on SALE CONSIDERATION (not gain) for NRI.
// The buyer does not know the seller's cost — TDS is always on gross payment.
export function computeSTCGProperty(salePrice, purchaseCost, improvement = 0) {
  const stcg = Math.max(0, salePrice - purchaseCost - improvement);
  // TDS under Section 195: 30% of SALE CONSIDERATION + 4% cess for NRI
  // Buyer deducts on the payment amount, not on computed gain
  const tds195 = Math.round(salePrice * 0.30 * 1.04);
  return { stcg, tds195, taxRate: 'Slab rates (added to normal income)', note: 'Property held less than 24 months — Short-Term Capital Gain taxed at slab rates. TDS u/s 195 deducted at 30% on sale consideration.' };
}

// ═══ Inherited/Gifted Property Capital Gains ═══
// Cost of acquisition = cost to PREVIOUS owner. Indexation from PREVIOUS owner's acquisition year.
export function computeInheritedPropertyCG(salePrice, originalPurchaseCost, originalAcqFY, saleFY, improvement = 0) {
  // Same computation as regular CG but with previous owner's cost and acquisition year
  const result = computeCapitalGains(salePrice, originalPurchaseCost, originalAcqFY, saleFY, improvement);
  result.note = 'Inherited/gifted property: Cost of acquisition = cost to previous owner. Indexation from previous owner\'s acquisition year.';
  result.acquisitionType = 'inherited_or_gifted';
  return result;
}

// ═══ Old Regime Tax Computation (FY 2025-26) ═══
// For comparison with new regime. NRIs DO get basic exemption under old regime.
export function computeOldRegimeTax(totalIncome, deductions = {}) {
  const {
    sec80C = 0, sec80D = 0, sec80TTA = 0, sec80TTB = 0, sec80E = 0, sec80G = 0, other = 0,
    // Fix 4: Proper 80D handling with senior citizen flags
    sec80DSelf = 0, sec80DParents = 0,
    isSenior = false, parentsSenior = false,
    // Fix 5: Section 80CCD (NPS)
    sec80CCD1 = 0, salary = 0, sec80CCD1B = 0,
  } = deductions;

  // Fix 4: Section 80D — Self/family: ₹25K (₹50K if senior). Parents: ₹25K (₹50K if parents senior).
  let deduction80D;
  if (sec80DSelf > 0 || sec80DParents > 0) {
    // New granular path
    const selfCap = isSenior ? 50000 : 25000;
    const parentsCap = parentsSenior ? 50000 : 25000;
    deduction80D = Math.min(sec80DSelf, selfCap) + Math.min(sec80DParents, parentsCap);
  } else {
    // Legacy path — single sec80D value; apply senior-aware cap
    const combinedCap = (isSenior ? 50000 : 25000) + (parentsSenior ? 50000 : 25000);
    deduction80D = Math.min(sec80D, combinedCap);
  }

  // Fix 5: Section 80CCD — NPS
  // 80CCD(1): up to 10% of salary (included in 80C aggregate limit of ₹1.5L)
  const ccd1 = Math.min(sec80CCD1, Math.round(salary * 0.10));
  // 80CCD(1B): additional ₹50,000 (over and above 80C limit)
  const ccd1B = Math.min(sec80CCD1B, 50000);

  // 80C aggregate: sec80C + 80CCD(1) combined cap ₹1.5L
  const deduction80C = Math.min(sec80C + ccd1, 150000);

  // 80TTA: savings interest only, non-seniors, cap ₹10K
  // 80TTB: ALL interest, seniors only, cap ₹50K (replaces 80TTA for seniors)
  const interestDeduction = isSenior
    ? Math.min(sec80TTB || sec80TTA, 50000)  // seniors: use 80TTB if provided, fallback to sec80TTA for backward compat
    : Math.min(sec80TTA, 10000);              // non-seniors: 80TTA only
  const totalDeductions = deduction80C + deduction80D + interestDeduction + sec80E + sec80G + other + ccd1B;
  const taxableIncome = Math.max(0, totalIncome - totalDeductions);

  // Old regime slabs FY 2025-26 (NRI — NRIs DO get ₹2.5L basic exemption under old regime)
  let tax = 0;
  const slabs = [
    [0, 250000, 0],
    [250000, 500000, 0.05],
    [500000, 1000000, 0.20],
    [1000000, Infinity, 0.30],
  ];
  for (const [from, to, rate] of slabs) {
    if (taxableIncome <= from) break;
    const taxable = Math.min(taxableIncome, to) - from;
    if (taxable > 0) tax += taxable * rate;
  }
  tax = Math.round(tax);
  const cess = Math.round(tax * 0.04);

  return { taxableIncome, totalDeductions, tax, cess, total: tax + cess, slabs: 'Old Regime', note: 'NRIs do NOT get Section 87A rebate under old regime either.' };
}

// ═══ Old vs New Regime Comparison ═══
export function computeRegimeComparison(formData, fy) {
  const ti = computeTotalIncome(formData, fy); // new regime
  const nonCGIncome = ti.grossTotal - (ti.heads.find(h => h.head.includes('Capital Gains'))?.amount || 0);

  // Pass HP interest deduction and all old-regime deductions properly
  const oldRegime = computeOldRegimeTax(nonCGIncome, {
    sec80C: formData.deductions80C || 0,
    sec80D: formData.deductions80D || 0,
    sec80DSelf: formData.sec80DSelf || 0,
    sec80DParents: formData.sec80DParents || 0,
    isSenior: formData.isSenior || false,
    parentsSenior: formData.parentsSenior || false,
    sec80TTA: Math.min(formData.nroInterest || 0, 10000),
    sec80TTB: formData.sec80TTB || 0,
    sec80CCD1: formData.sec80CCD1 || 0,
    sec80CCD1B: formData.sec80CCD1B || 0,
    salary: formData.salaryAmount || 0,
    sec80E: formData.sec80E || 0,
    sec80G: formData.sec80G || 0,
    other: (formData.salary || formData.salaryAmount ? 75000 : 0), // Standard deduction ₹75K for salaried (FY 2025-26, both regimes)
  });

  const newRegimeTax = ti.totalWithCess;

  // CG tax is same in both regimes (special rate), so compute CG pre-cess tax
  const cgPreCessTax = ti.heads.find(h => h.head.includes('Capital Gains'))?.computation
    ? (ti.heads.find(h => h.head.includes('Capital Gains')).computation.better === 'A'
      ? ti.heads.find(h => h.head.includes('Capital Gains')).computation.optionA.tax
      : ti.heads.find(h => h.head.includes('Capital Gains')).computation.optionB.tax)
    : 0;

  // Add surcharge to old regime tax
  const oldSlabSurcharge = computeSurcharge(oldRegime.tax, nonCGIncome, false, false);
  const oldCGSurcharge = cgPreCessTax > 0 ? computeSurcharge(cgPreCessTax, nonCGIncome, true, false) : { surcharge: 0 };
  const oldTotalSurcharge = oldSlabSurcharge.surcharge + oldCGSurcharge.surcharge;
  const oldTaxPlusSurcharge = oldRegime.tax + cgPreCessTax + oldTotalSurcharge;
  const oldCess = Math.round(oldTaxPlusSurcharge * 0.04);
  const oldTotal = oldTaxPlusSurcharge + oldCess;

  return {
    newRegime: { tax: newRegimeTax, surcharge: ti.surcharge || 0, label: 'New Regime (Section 115BAC)' },
    oldRegime: { tax: oldTotal, surcharge: oldTotalSurcharge, deductions: oldRegime.totalDeductions, label: 'Old Regime' },
    recommended: newRegimeTax <= oldTotal ? 'New' : 'Old',
    savings: Math.abs(newRegimeTax - oldTotal),
    note: `${newRegimeTax <= oldTotal ? 'New' : 'Old'} regime saves ${formatINR(Math.abs(newRegimeTax - oldTotal))}`,
  };
}

// ═══ Section 234F — Late Filing Fee ═══
// ₹5,000 if total income > ₹5L, ₹1,000 if total income ≤ ₹5L.
// Not applicable if return filed on or before due date.
export function computeSection234F(totalIncome, filingDate, dueDate = '2026-07-31') {
  if (!filingDate || new Date(filingDate) <= new Date(dueDate)) return null; // Filed on time
  const penalty = totalIncome > 500000 ? 5000 : 1000;
  return { penalty, note: `Section 234F: Late filing fee \u20b9${penalty.toLocaleString('en-IN')} (filed after ${dueDate})` };
}

// ═══ House Property Loss Set-Off ═══
// HP loss can be set off against other income, capped at Rs 2L under both regimes.
export function computeLossSetOff(hpLoss, otherIncome) {
  const maxSetOff = 200000; // ₹2L cap under both regimes
  const setOff = Math.min(Math.abs(hpLoss), maxSetOff, otherIncome);
  const carryForward = Math.max(0, Math.abs(hpLoss) - setOff);
  return { hpLoss: Math.abs(hpLoss), setOff, carryForward, carryForwardYears: 8, incomeAfterSetOff: otherIncome - setOff, note: carryForward > 0 ? `${formatINR(carryForward)} HP loss carried forward for 8 years.` : 'Full HP loss set off in current year.' };
}

// ═══ Crypto / Virtual Digital Assets (Section 115BBH) ═══
// 30% flat + 4% cess, no deductions except cost of acquisition, 1% TDS under 194S.
export function computeCryptoVDA(salePrice, purchaseCost) {
  const gain = Math.max(0, salePrice - purchaseCost);
  const tax = Math.round(gain * 0.30);
  const cess = Math.round(tax * 0.04);
  const tds194S = Math.round(salePrice * 0.01); // 1% TDS on consideration
  return { gain, tax, cess, total: tax + cess, tds194S, refundOrPayable: tds194S - (tax + cess), note: 'Section 115BBH: 30% flat rate, no deductions except cost of acquisition. No set-off of losses against any income.' };
}

// ═══ Unlisted Shares Capital Gains ═══
// LTCG if held >24 months: 12.5% flat (Section 112), NO ₹1.25L exemption (that's only Section 112A for listed).
// STCG: taxed at slab rates.
export function computeUnlistedSharesCG(salePrice, purchaseCost, holdingMonths, acqFY, saleFY) {
  const isLTCG = holdingMonths > 24;
  if (isLTCG) {
    // LTCG on unlisted — 12.5% flat, NO ₹1.25L exemption (that's only Section 112A for listed)
    const ltcg = Math.max(0, salePrice - purchaseCost);
    const tax = Math.round(ltcg * 0.125);
    const cess = Math.round(tax * 0.04);
    return { type: 'LTCG', gain: ltcg, tax, cess, total: tax + cess, rate: '12.5% (Section 112)', note: 'Unlisted shares: No ₹1.25L exemption (Section 112A exemption is only for listed equity).' };
  } else {
    // STCG on unlisted — slab rates
    const stcg = Math.max(0, salePrice - purchaseCost);
    return { type: 'STCG', gain: stcg, tax: 0, total: 0, rate: 'Slab rates', note: 'Unlisted shares STCG — added to normal income, taxed at applicable slab rate.' };
  }
}

// ═══ ESOP/RSU Two-Stage Taxation ═══
// Stage 1: Perquisite at exercise/vesting (FMV minus exercise price) — taxed as salary at slab rates.
//   NOTE: For foreign employer ESOPs, perquisite taxable in India only to extent of India service days
//         during vesting period (proportionate basis per CBDT Circular 4/2007 and DTAA provisions).
// Stage 2: Capital gain from FMV at exercise to sale price.
//   LTCG threshold: 12 months for LISTED shares, 24 months for UNLISTED (e.g., foreign startup ESOPs).
export function computeESOPRSU(exercisePrice, fmvAtExercise, salePrice, holdingMonths, isListed = true, ltcgExemptionUsed = 0) {
  // Stage 1: Perquisite (taxed as salary at slab rates)
  const perquisite = Math.max(0, fmvAtExercise - exercisePrice);

  // Stage 2: Capital gain (from FMV at exercise to sale price)
  const gain = Math.max(0, salePrice - fmvAtExercise);
  const ltcgThreshold = isListed ? 12 : 24; // Listed: 12 months, Unlisted: 24 months
  const isLTCG = holdingMonths > ltcgThreshold;

  let cgTax, cgRate;
  if (isLTCG) {
    // Fix 6: Section 112A ₹1.25L exemption shared across all LTCG — avoid double-counting
    const remainingExemption = Math.max(0, 125000 - ltcgExemptionUsed);
    const taxableGain = Math.max(0, gain - remainingExemption);
    cgTax = Math.round(taxableGain * 0.125 * 1.04);
    cgRate = '12.5% above ₹1.25L (Section 112A)';
  } else {
    // Section 111A: 20%
    cgTax = Math.round(gain * 0.20 * 1.04);
    cgRate = '20% (Section 111A)';
  }

  return {
    perquisite, perquisiteNote: 'Taxed as salary income at slab rates on exercise/vesting',
    capitalGain: gain, cgType: isLTCG ? 'LTCG' : 'STCG', cgTax, cgRate,
    totalTaxableIncome: perquisite, // perquisite added to salary head
    totalCGTax: cgTax,
    note: 'ESOP/RSU: Two-stage taxation. (1) Perquisite = FMV at exercise minus exercise price → taxed as salary. (2) Gain from FMV to sale → capital gain.',
  };
}

// ═══ Dividend Tax (NRI) ═══
// Dividends taxable at slab rate. TDS at 20% for NRIs under Section 195. DTAA may reduce TDS rate.
export function computeDividendTax(amount) {
  const tds = Math.round(amount * 0.20); // 20% TDS under Section 195 for NRI dividends
  return { amount, tds, taxRate: 'Slab rates (added to Other Sources)', note: 'Dividends taxable at slab rate. TDS at 20% for NRIs under Section 195. DTAA may reduce TDS rate.' };
}

// ═══ Section 234A — Interest for Late Filing ═══
// Interest at 1% per month (part of month = full month) on outstanding tax from due date to filing date.
// Outstanding = tax payable minus TDS minus advance tax paid.
export function computeSection234A(taxPayable, tds, filingDate, dueDate, advanceTax = 0) {
  const outstanding = Math.max(0, taxPayable - tds - advanceTax);
  if (outstanding <= 0) return { interest: 0, months: 0, outstanding: 0, note: 'No interest under Section 234A — no outstanding tax.' };

  const due = new Date(dueDate);
  const filed = new Date(filingDate);
  if (filed <= due) return { interest: 0, months: 0, outstanding, note: 'Filed on or before due date — no Section 234A interest.' };

  // Calculate months: part of month = full month
  let months = (filed.getFullYear() - due.getFullYear()) * 12 + (filed.getMonth() - due.getMonth());
  if (filed.getDate() > due.getDate()) months += 1; // part month counts as full
  if (months < 1) months = 1; // minimum 1 month if filed after due date

  const interest = Math.round(outstanding * 0.01 * months); // 1% per month

  return {
    interest,
    months,
    outstanding,
    ratePerMonth: '1%',
    note: `Interest u/s 234A: ${months} month(s) at 1% on outstanding ${formatINR(outstanding)}`,
  };
}

// ═══ Debt Mutual Fund Capital Gains (Post Finance Act 2023) ═══
// Post Finance Act 2023 (effective 1 April 2023), debt MF gains are ALWAYS taxed at slab rates
// regardless of holding period. No indexation benefit. No LTCG/STCG distinction.
export function computeDebtMFCG(salePrice, purchaseCost) {
  const gain = Math.max(0, salePrice - purchaseCost);
  return {
    gain,
    taxRate: 'Slab rates',
    indexation: false,
    note: 'Post Finance Act 2023: Debt MF gains taxed at slab rates regardless of holding period. No indexation. Added to total income under "Other Sources" or "Capital Gains" as applicable.',
  };
}

// ═══ FIX 2: Deemed Let-Out Property Computation ═══
// When a second property is not let out, it is treated as "deemed let-out" under Section 23(1)(a).
export function computeDeemedLetOut(municipalValue = 0, fairRent = 0, standardRent = 0) {
  // Annual Lettable Value = higher of municipal value and fair rent, but capped at standard rent
  const expectedRent = Math.max(municipalValue, fairRent);
  const alv = standardRent > 0 ? Math.min(expectedRent, standardRent) : expectedRent;
  const standardDeduction = Math.round(alv * 0.30);
  return { annualLettableValue: alv, standardDeduction, taxableIncome: alv - standardDeduction, note: 'Deemed let-out: property treated as rented at notional value (Section 23(1)(a))' };
}

// ═══ FIX 6: Section 234B — Interest on Shortfall in Advance Tax ═══
export function computeSection234B(totalTax, tds, advanceTaxPaid = 0) {
  const assessedTax = Math.max(0, totalTax - tds);
  if (advanceTaxPaid >= assessedTax * 0.90) return null; // no 234B if >=90% paid
  const shortfall = assessedTax - advanceTaxPaid;
  // Interest: 1% per month from April 1 of AY to date of assessment (assume 12 months max)
  const months = 12; // conservative — actual depends on assessment date
  const interest = Math.round(shortfall * 0.01 * months);
  return { shortfall, months, interestRate: '1% per month', interest, note: 'Section 234B: Interest on shortfall in advance tax payment' };
}

// ═══ FIX 7: Section 234C — Interest on Deferment of Advance Tax Installments ═══
export function computeSection234C(totalTax, tds, _advanceTaxPaid = 0, installmentsPaid = {}) {
  // _advanceTaxPaid reserved for future use; installmentsPaid has per-date breakdown
  const balance = Math.max(0, totalTax - tds);
  if (balance < 10000) return null;
  const schedule = [
    { date: '15 June', cumPercent: 15, amount: Math.round(balance * 0.15) },
    { date: '15 September', cumPercent: 45, amount: Math.round(balance * 0.45) },
    { date: '15 December', cumPercent: 75, amount: Math.round(balance * 0.75) },
    { date: '15 March', cumPercent: 100, amount: balance },
  ];
  let totalInterest = 0;
  const details = schedule.map((s, i) => {
    const paid = installmentsPaid[s.date] || 0;
    const shortfall = Math.max(0, s.amount - paid);
    const months = [3, 3, 3, 1][i]; // months until next installment
    const interest = Math.round(shortfall * 0.01 * months);
    totalInterest += interest;
    return { ...s, paid, shortfall, interest };
  });
  return { details, totalInterest, note: 'Section 234C: Interest on deferment of advance tax installments' };
}

// ═══ FIX 8: DTAA Treaty-Rate Lookup ═══
const DTAA_RATES = {
  'United Kingdom': { interest: 15, dividend: 15, royalty: 15 },
  'United States': { interest: 15, dividend: 15, royalty: 15 },
  'Canada': { interest: 15, dividend: 15, royalty: 15 },
  'Australia': { interest: 15, dividend: 15, royalty: 15 },
  'Singapore': { interest: 15, dividend: 15, royalty: 10 },
  'Germany': { interest: 10, dividend: 10, royalty: 10 },
  'UAE': { interest: 12.5, dividend: 10, royalty: 10 },
  'Saudi Arabia': { interest: 10, dividend: 5, royalty: 10 },
  'Qatar': { interest: 10, dividend: 10, royalty: 10 },
  'Hong Kong': { interest: 10, dividend: 5, royalty: 10 },
  'New Zealand': { interest: 10, dividend: 15, royalty: 10 },
};

export function getDTAARate(country, incomeType = 'interest') {
  const rates = DTAA_RATES[country];
  if (!rates) return { rate: 30, hasDTAA: false, note: 'No DTAA — domestic rate applies. Consider Section 91 unilateral relief.' };
  const rate = rates[incomeType] || 30;
  return { rate, hasDTAA: true, domesticRate: 30, saving: 30 - rate, note: `DTAA with ${country}: ${incomeType} at ${rate}% (domestic: 30%)` };
}

// ═══ Intake Form Validation ═══
export function validateIntakeForm(f) {
  const errors = {};
  if (f.pan) {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(f.pan).trim().toUpperCase())) {
      errors.pan = 'PAN format invalid (e.g. ABCDE1234F)';
    }
  }
  if (f.aadhaar) {
    const clean = String(f.aadhaar).replace(/\s/g, '');
    if (!/^\d{12}$/.test(clean)) {
      errors.aadhaar = 'Aadhaar must be exactly 12 digits';
    }
  }
  if (f.stayDays !== undefined && f.stayDays !== null && f.stayDays !== '') {
    const days = parseInt(f.stayDays);
    if (isNaN(days) || days < 0 || days > 365) {
      errors.stayDays = 'Stay days must be between 0 and 365';
    }
  }
  if (f.propertyAcqFY && f.saleFY) {
    const acqYear = parseInt(f.propertyAcqFY);
    const saleYear = parseInt(f.saleFY);
    if (!isNaN(acqYear) && !isNaN(saleYear) && acqYear > saleYear) {
      errors.acqFY = 'Acquisition FY cannot be after sale FY';
    }
  }
  return errors;
}

// ═══ Compliance Flags ═══
export function computeComplianceFlags(formData, residencyStatus) {
  const f = formData;
  const totalIncome = f.totalIncome || 0;
  const flags = {};
  flags.scheduleALRequired = totalIncome > 5000000;
  flags.scheduleFARequired = residencyStatus === 'RNOR' || residencyStatus === 'Resident';
  flags.form15CARequired = !!(f.propertySale && f.repatriationNeeded);
  const planningStatuses = ['Planning to buy', 'Considering government bonds'];
  flags.cgasRequired = planningStatuses.some(s => (f.section54 || '').toLowerCase().startsWith(s.toLowerCase().slice(0, 8)));
  if (f.saleDate && f.sec54ecInvestDate === undefined && f.section54 && (f.section54 || '').toLowerCase().includes('bond')) {
    const saleDate = new Date(f.saleDate);
    const deadline = new Date(saleDate);
    deadline.setMonth(deadline.getMonth() + 6);
    flags.sec54ecDeadline = deadline.toISOString().split('T')[0];
    flags.sec54ecOverdue = new Date() > deadline;
  }
  return flags;
}

// ═══ FIX 10: Capital Gains Loss Set-Off Matrix ═══
// STCL can set off against STCG first, then LTCG. LTCL can only set off against LTCG.
export function computeCGLossSetOff(stcg = 0, ltcg = 0, stcl = 0, ltcl = 0) {
  // STCL can set off against STCG first, then LTCG
  let remainSTCL = Math.abs(stcl);
  let netSTCG = stcg;
  let netLTCG = ltcg;
  if (remainSTCL > 0 && netSTCG > 0) {
    const setOff = Math.min(remainSTCL, netSTCG);
    netSTCG -= setOff; remainSTCL -= setOff;
  }
  if (remainSTCL > 0 && netLTCG > 0) {
    const setOff = Math.min(remainSTCL, netLTCG);
    netLTCG -= setOff; remainSTCL -= setOff;
  }
  // LTCL can set off only against LTCG
  let remainLTCL = Math.abs(ltcl);
  if (remainLTCL > 0 && netLTCG > 0) {
    const setOff = Math.min(remainLTCL, netLTCG);
    netLTCG -= setOff; remainLTCL -= setOff;
  }
  return {
    netSTCG, netLTCG,
    stclCarryForward: remainSTCL, ltclCarryForward: remainLTCL,
    carryForwardYears: 8,
    note: 'CG loss set-off per Section 70/71: STCL → STCG then LTCG; LTCL → LTCG only. Carry forward 8 years.'
  };
}
