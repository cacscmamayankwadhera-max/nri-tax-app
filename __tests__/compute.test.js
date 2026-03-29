import { describe, it, expect } from 'vitest';
import {
  CII,
  computeCapitalGains,
  computeEquityCG,
  computeSection54,
  computeAdvanceTax,
  computeOldRegimeTax,
  computeSurcharge,
  computeESOPRSU,
  computeCryptoVDA,
  classifyCase,
  getDTAARate,
  computeSection234A,
  computeCGLossSetOff,
  computeHouseProperty,
  computeSection54F,
  computeSTCGProperty,
  computeInheritedPropertyCG,
  computeLossSetOff,
  computeUnlistedSharesCG,
  computeDebtMFCG,
  computeDeemedLetOut,
  computeSection234B,
  computeSection234C,
  computeDividendTax,
  formatINR,
  computeHRAExemption,
} from '../lib/compute.js';

// ──────────────────────────────────────────────
// Helper: tolerate rounding within Rs 100
// ──────────────────────────────────────────────
function expectClose(actual, expected, tolerance = 100) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

// ════════════════════════════════════════════════
// 1. computeCapitalGains — Property sale
// ════════════════════════════════════════════════
describe('computeCapitalGains', () => {
  // Sale 68L, Purchase 22L, Acq 2017-18, Sale 2025-26
  // CII 2017-18=272, CII 2025-26=376
  // Option A: indexedCost = round(22L * 376/272) = round(2200000 * 1.382352...) = 3041176
  //   LTCG_A = 6800000 - 3041176 = 3758824. Tax_A = round(3758824 * 0.20) = 751765. Cess_A = round(751765*0.04)=30071. Total_A=781836
  // Option B: LTCG_B = 6800000 - 2200000 = 4600000. Tax_B = round(4600000*0.125) = 575000. Cess_B = round(575000*0.04)=23000. Total_B=598000
  // Better = B (598000 < 781836)
  it('computes dual option correctly for a typical property sale', () => {
    const r = computeCapitalGains(6800000, 2200000, '2017-18', '2025-26');

    // CII values
    expect(r.ciiAcq).toBe(272);
    expect(r.ciiSale).toBe(376);

    // Indexed cost
    const expectedIndexed = Math.round(2200000 * 376 / 272);
    expect(r.indexedCost).toBe(expectedIndexed); // 3041176

    // Option A
    const expectedLtcgA = 6800000 - expectedIndexed; // 3758824
    expect(r.optionA.ltcg).toBe(expectedLtcgA);
    expect(r.optionA.tax).toBe(Math.round(expectedLtcgA * 0.20)); // 751765
    expect(r.optionA.cess).toBe(Math.round(r.optionA.tax * 0.04));
    expect(r.optionA.total).toBe(r.optionA.tax + r.optionA.cess);

    // Option B
    expect(r.optionB.ltcg).toBe(4600000);
    expect(r.optionB.tax).toBe(575000);
    expect(r.optionB.cess).toBe(23000);
    expect(r.optionB.total).toBe(598000);

    // Better option
    expect(r.better).toBe('B');
    expect(r.savings).toBe(r.optionA.total - r.optionB.total);
  });

  it('applies Section 50C when stamp duty exceeds sale price', () => {
    // Stamp duty value 75L > sale price 68L => use 75L as deemed sale price
    const r = computeCapitalGains(6800000, 2200000, '2017-18', '2025-26', 0, 7500000);
    expect(r.sec50cApplied).toBe(true);
    // Option B LTCG should use 75L not 68L
    expect(r.optionB.ltcg).toBe(7500000 - 2200000);
  });

  it('handles zero improvement and transfer expenses', () => {
    const r = computeCapitalGains(5000000, 3000000, '2020-21', '2025-26', 0, 0, 0);
    expect(r.optionB.ltcg).toBe(2000000);
  });

  it('deducts transfer expenses from sale consideration', () => {
    const r = computeCapitalGains(6800000, 2200000, '2017-18', '2025-26', 0, 0, 100000);
    // Net sale = 68L - 1L = 67L
    expect(r.optionB.ltcg).toBe(6700000 - 2200000);
  });

  it('computes TDS under Section 195 on sale consideration', () => {
    const r = computeCapitalGains(6800000, 2200000, '2017-18', '2025-26');
    // Sale 68L > 50L => surcharge 10%
    expect(r.surchargeRate).toBe(0.10);
    // TDS = round(68L * 0.20 * 1.10 * 1.04)
    const expectedTDS = Math.round(6800000 * 0.20 * 1.10 * 1.04);
    expect(r.tds195).toBe(expectedTDS);
  });

  it('computes Section 54EC bond exemption', () => {
    const r = computeCapitalGains(6800000, 2200000, '2017-18', '2025-26');
    // Better is B, LTCG_B = 46L. 54EC max = min(46L, 50L) = 46L
    expect(r.sec54ecExemption).toBe(Math.min(r.optionB.ltcg, 5000000));
  });

  it('caps LTCG at zero when cost exceeds sale price', () => {
    const r = computeCapitalGains(2000000, 5000000, '2017-18', '2025-26');
    expect(r.optionA.ltcg).toBe(0);
    expect(r.optionB.ltcg).toBe(0);
  });
});

// ════════════════════════════════════════════════
// 2. computeSurcharge — Multiple brackets + marginal relief
// ════════════════════════════════════════════════
describe('computeSurcharge', () => {
  it('returns zero surcharge for income <= 50L', () => {
    // Income 40L => no surcharge
    const tax = 600000; // approximate slab tax placeholder
    const r = computeSurcharge(tax, 4000000);
    expect(r.surcharge).toBe(0);
    expect(r.surchargeRate).toBe(0);
  });

  it('applies 10% surcharge for income above 50L', () => {
    // Income 55L => 10% bracket
    const income = 5500000;
    const tax = 150000; // placeholder
    const r = computeSurcharge(tax, income);
    expect(r.surchargeRate).toBe(0.10);
  });

  it('applies 15% surcharge for income above 1Cr', () => {
    const income = 10500000;
    const tax = 500000;
    const r = computeSurcharge(tax, income, false, false);
    expect(r.surchargeRate).toBe(0.15);
  });

  it('applies marginal relief when surcharge causes excess', () => {
    // Income slightly above 50L — marginal relief should kick in
    const income = 5100000;
    const tax = 150000;
    const r = computeSurcharge(tax, income);
    // surchargeRate = 10% since > 50L
    expect(r.surchargeRate).toBe(0.10);
    // marginalRelief should be >= 0
    expect(r.marginalRelief).toBeGreaterThanOrEqual(0);
  });

  it('caps LTCG surcharge at 15% even for very high income', () => {
    // Income 3Cr => would be 25% surcharge normally, but LTCG caps at 15%
    const income = 30000000;
    const tax = 2000000;
    const r = computeSurcharge(tax, income, true, false);
    expect(r.surchargeRate).toBe(0.15);
    // Without cap it would be 25%
  });

  it('caps new regime surcharge at 25% for income above 5Cr', () => {
    const income = 60000000;
    const tax = 5000000;
    const r = computeSurcharge(tax, income, false, true);
    // Without new-regime cap: 37%. With cap: 25%.
    expect(r.surchargeRate).toBe(0.25);
  });
});

// ════════════════════════════════════════════════
// 3. computeSection54 — Full and partial exemption
// ════════════════════════════════════════════════
describe('computeSection54', () => {
  it('grants full exemption when new house >= LTCG', () => {
    const r = computeSection54(4000000, 5000000, 'Yes — bought new house');
    expect(r.eligible).toBe(true);
    expect(r.exemptAmount).toBe(4000000);
    expect(r.taxableAfterExemption).toBe(0);
    expect(r.totalAfterExemption).toBe(0);
    expect(r.note).toContain('Full exemption');
  });

  it('grants partial exemption when new house < LTCG', () => {
    const r = computeSection54(4000000, 2500000, 'Yes — bought new house');
    expect(r.eligible).toBe(true);
    expect(r.exemptAmount).toBe(2500000);
    expect(r.taxableAfterExemption).toBe(1500000);
    // Tax = round(1500000 * 0.125) = 187500. Cess = round(187500*0.04) = 7500. Total = 195000
    expect(r.taxOnRemaining).toBe(187500);
    expect(r.cessOnRemaining).toBe(7500);
    expect(r.totalAfterExemption).toBe(195000);
  });

  it('caps exemption at Rs 10 Crore', () => {
    const r = computeSection54(4000000, 1500000000, 'Yes — bought new house');
    // LTCG 40L, house 15Cr => exempt = min(40L, 15Cr, 10Cr) = 40L
    expect(r.exemptAmount).toBe(4000000);
    // Now test with LTCG > 10Cr
    const r2 = computeSection54(150000000, 2000000000, 'Yes — bought new house');
    // exempt = min(15Cr, 200Cr, 10Cr) = 10Cr
    expect(r2.exemptAmount).toBe(100000000);
    expect(r2.taxableAfterExemption).toBe(50000000);
  });

  it('returns not eligible for status "No"', () => {
    const r = computeSection54(4000000, 5000000, 'No');
    expect(r.eligible).toBe(false);
    expect(r.planningOpportunity).toBe(true);
    expect(r.exemptAmount).toBe(0);
  });

  it('uses custom chosenRate for tax computation', () => {
    const r = computeSection54(4000000, 2500000, 'Yes — bought new house', 0.20);
    // taxableAfterExemption = 15L. Tax = round(1500000*0.20) = 300000
    expect(r.taxOnRemaining).toBe(300000);
  });

  it('computes savings correctly', () => {
    const r = computeSection54(4000000, 2500000, 'Yes — bought new house', 0.125);
    // originalTax = round(4000000*0.125)=500000. originalCess=round(500000*0.04)=20000. originalTotal=520000
    // afterTax = 195000
    expect(r.savings).toBe(520000 - 195000);
  });
});

// ════════════════════════════════════════════════
// 4. computeOldRegimeTax — With deductions
// ════════════════════════════════════════════════
describe('computeOldRegimeTax', () => {
  it('computes old regime slab tax with 80C and 80D deductions', () => {
    // income 15L, 80C = 1.5L, 80D = 25000
    // totalDeductions = min(1.5L,1.5L) + min(25K,25K) + 0 + 0 + 0 + 0 + 0 = 175000
    // taxableIncome = 1500000 - 175000 = 1325000
    // Slabs: 0-2.5L=0, 2.5L-5L = 12500, 5L-10L = 100000, 10L-13.25L = 97500
    // Total = 12500 + 100000 + 97500 = 210000
    const r = computeOldRegimeTax(1500000, { sec80C: 150000, sec80D: 25000 });
    expect(r.totalDeductions).toBe(175000);
    expect(r.taxableIncome).toBe(1325000);
    expect(r.tax).toBe(210000);
    expect(r.cess).toBe(Math.round(210000 * 0.04)); // 8400
    expect(r.total).toBe(210000 + 8400);
  });

  it('returns zero tax for income below 2.5L', () => {
    const r = computeOldRegimeTax(200000);
    expect(r.tax).toBe(0);
    expect(r.total).toBe(0);
  });

  it('handles 80D senior citizen caps correctly', () => {
    // Senior citizen: self 50K cap, parent senior: 50K cap
    const r = computeOldRegimeTax(2000000, {
      sec80C: 150000,
      sec80DSelf: 60000,
      sec80DParents: 60000,
      isSenior: true,
      parentsSenior: true,
    });
    // 80D: min(60K,50K) + min(60K,50K) = 100000
    // 80C: min(150000,150000) = 150000
    // total = 250000
    expect(r.totalDeductions).toBe(250000);
  });

  it('handles Section 80CCD NPS deductions', () => {
    const r = computeOldRegimeTax(2000000, {
      sec80C: 100000,
      sec80CCD1: 200000,
      salary: 2000000,
      sec80CCD1B: 60000,
    });
    // CCD(1) = min(200000, round(2000000*0.10)) = min(200000,200000) = 200000
    // 80C aggregate = min(100000+200000, 150000) = 150000
    // CCD(1B) = min(60000, 50000) = 50000
    // totalDeductions = 150000 + 0(80D) + 0(80TTA) + 0 + 0 + 0 + 50000 = 200000
    expect(r.totalDeductions).toBe(200000);
  });

  it('caps 80TTA at 10K for non-senior, 50K for senior', () => {
    const rNonSenior = computeOldRegimeTax(1000000, { sec80TTA: 30000, isSenior: false });
    // interestDeduction = min(30000, 10000) = 10000
    expect(rNonSenior.totalDeductions).toBe(10000);

    const rSenior = computeOldRegimeTax(1000000, { sec80TTA: 60000, isSenior: true });
    // interestDeduction = min(60000, 50000) = 50000
    expect(rSenior.totalDeductions).toBe(50000);
  });
});

// ════════════════════════════════════════════════
// 5. computeSlabTax (new regime) — FY 2025-26 slabs
//    Note: computeSlabTax is not exported directly;
//    we test it indirectly via computeTotalIncome or
//    directly via computeSurcharge which calls it internally.
//    We verify via computeOldRegimeTax comparison and
//    use computeTotalIncome for slab-tax verification.
// ════════════════════════════════════════════════
// Since computeSlabTax is NOT exported, we test the new regime
// slabs via computeTotalIncome with minimal inputs.
import { computeTotalIncome } from '../lib/compute.js';

describe('New Regime Slab Tax (FY 2025-26) — via computeTotalIncome', () => {
  it('income 4L => tax = 0 (below first slab)', () => {
    const r = computeTotalIncome({ nroInterest: 400000 }, '2025-26');
    // Non-CG income = 4L. Slab tax = 0. CG tax = 0.
    expect(r.slabTax).toBe(0);
  });

  it('income 8L => slab tax = Rs 20,000', () => {
    // 4L-8L at 5% = 4L*0.05 = 20000
    const r = computeTotalIncome({ nroInterest: 800000 }, '2025-26');
    expect(r.slabTax).toBe(20000);
  });

  it('income 12L => slab tax = Rs 60,000', () => {
    // 4L-8L at 5% = 20000, 8L-12L at 10% = 40000 => 60000
    const r = computeTotalIncome({ nroInterest: 1200000 }, '2025-26');
    expect(r.slabTax).toBe(60000);
  });

  it('income 25L => slab tax = Rs 2,10,000', () => {
    // 4L-8L: 20000, 8L-12L: 40000, 12L-16L: 60000, 16L-20L: 80000, 20L-24L: 100000, 24L-25L: 30000
    // Total = 20000+40000+60000+80000+100000+30000 = 330000
    // Wait — let me recompute:
    // 4-8L at 5% = 200000
    // Nope. 4L range at 5% = 4,00,000*0.05 = 20,000
    // 8-12L at 10% = 4,00,000*0.10 = 40,000
    // 12-16L at 15% = 4,00,000*0.15 = 60,000
    // 16-20L at 20% = 4,00,000*0.20 = 80,000
    // 20-24L at 25% = 4,00,000*0.25 = 1,00,000
    // 24-25L at 30% = 1,00,000*0.30 = 30,000
    // Total = 20K + 40K + 60K + 80K + 1L + 30K = 3,30,000
    const r = computeTotalIncome({ nroInterest: 2500000 }, '2025-26');
    expect(r.slabTax).toBe(330000);
  });

  it('income 0 => tax = 0', () => {
    const r = computeTotalIncome({}, '2025-26');
    expect(r.slabTax).toBe(0);
    expect(r.totalWithCess).toBe(0);
  });
});

// ════════════════════════════════════════════════
// 6. computeAdvanceTax — Schedule
// ════════════════════════════════════════════════
describe('computeAdvanceTax', () => {
  it('computes advance tax schedule from total tax and TDS', () => {
    // totalTax 5L, TDS 1L => balance 4L
    const r = computeAdvanceTax(500000, 100000, '2025-26');
    expect(r).not.toBeNull();
    expect(r.required).toBe(true);
    expect(r.balancePayable).toBe(400000);

    // Installments: 15%=60K, 30%=120K, 30%=120K, 25%=100K
    expect(r.schedule[0].amount).toBe(60000);  // June
    expect(r.schedule[1].amount).toBe(120000); // September
    expect(r.schedule[2].amount).toBe(120000); // December
    expect(r.schedule[3].amount).toBe(100000); // March

    // Cumulative: 60K, 180K, 300K, 400K
    expect(r.schedule[0].cumulative).toBe(60000);
    expect(r.schedule[1].cumulative).toBe(180000);
    expect(r.schedule[2].cumulative).toBe(300000);
    expect(r.schedule[3].cumulative).toBe(400000);
  });

  it('returns null when balance < Rs 10,000', () => {
    const r = computeAdvanceTax(15000, 8000, '2025-26');
    // balance = 7000 < 10000
    expect(r).toBeNull();
  });

  it('returns null when TDS exceeds total tax', () => {
    const r = computeAdvanceTax(100000, 200000, '2025-26');
    // balance = 0 < 10000
    expect(r).toBeNull();
  });

  it('uses correct FY dates in schedule', () => {
    const r = computeAdvanceTax(500000, 100000, '2025-26');
    expect(r.schedule[0].date).toBe('15 June 2025');
    expect(r.schedule[1].date).toBe('15 September 2025');
    expect(r.schedule[2].date).toBe('15 December 2025');
    expect(r.schedule[3].date).toBe('15 March 2026');
    expect(r.ay).toBe('2026-27');
  });
});

// ════════════════════════════════════════════════
// 7. computeEquityCG — STCG + LTCG
// ════════════════════════════════════════════════
describe('computeEquityCG', () => {
  it('computes STCG at 20% and LTCG at 12.5% above 1.25L exemption', () => {
    const r = computeEquityCG(200000, 300000);

    // STCG: 2L * 20% = 40000, cess = 1600, total = 41600
    expect(r.stcg.amount).toBe(200000);
    expect(r.stcg.tax).toBe(40000);
    expect(r.stcg.cess).toBe(1600);
    expect(r.stcg.total).toBe(41600);

    // LTCG: taxable = 3L - 1.25L = 1.75L. Tax = round(175000*0.125)=21875. Cess=round(21875*0.04)=875
    expect(r.ltcg.amount).toBe(300000);
    expect(r.ltcg.exemption).toBe(125000);
    expect(r.ltcg.taxable).toBe(175000);
    expect(r.ltcg.tax).toBe(21875);
    expect(r.ltcg.cess).toBe(875);
    expect(r.ltcg.total).toBe(22750);

    // Total tax
    expect(r.totalTax).toBe(41600 + 22750);
  });

  it('returns zero LTCG tax when amount is below exemption', () => {
    const r = computeEquityCG(0, 100000);
    expect(r.ltcg.taxable).toBe(0);
    expect(r.ltcg.tax).toBe(0);
    expect(r.ltcg.total).toBe(0);
  });

  it('handles zero inputs', () => {
    const r = computeEquityCG();
    expect(r.stcg.total).toBe(0);
    expect(r.ltcg.total).toBe(0);
    expect(r.totalTax).toBe(0);
  });
});

// ════════════════════════════════════════════════
// 8. computeESOPRSU — Two-stage taxation
// ════════════════════════════════════════════════
describe('computeESOPRSU', () => {
  it('computes perquisite and LTCG for listed ESOP held > 12 months', () => {
    // exercise = Rs 100, FMV = Rs 500, sale = Rs 800, held 15 months, listed
    const r = computeESOPRSU(100, 500, 800, 15, true, 0);
    // Perquisite = 500 - 100 = 400
    expect(r.perquisite).toBe(400);
    // CG = 800 - 500 = 300. LTCG (>12m listed).
    expect(r.capitalGain).toBe(300);
    expect(r.cgType).toBe('LTCG');
    // Taxable = max(0, 300 - 125000) = 0 (gain too small for exemption to matter)
    // Tax = round(0 * 0.125 * 1.04) = 0
    expect(r.cgTax).toBe(0);
  });

  it('computes LTCG with larger amounts and exemption', () => {
    // exercise 1L, FMV 5L, sale 8L, held 15 months, listed
    const r = computeESOPRSU(100000, 500000, 800000, 15, true, 0);
    expect(r.perquisite).toBe(400000);
    expect(r.capitalGain).toBe(300000);
    expect(r.cgType).toBe('LTCG');
    // Taxable = 300000 - 125000 = 175000
    const expectedTax = Math.round(175000 * 0.125 * 1.04); // 22750
    expect(r.cgTax).toBe(expectedTax);
  });

  it('computes STCG for listed ESOP held <= 12 months', () => {
    const r = computeESOPRSU(100000, 500000, 800000, 10, true, 0);
    expect(r.cgType).toBe('STCG');
    // STCG = 300000 at 20%
    const expectedTax = Math.round(300000 * 0.20 * 1.04);
    expect(r.cgTax).toBe(expectedTax);
  });

  it('uses 24-month threshold for unlisted shares', () => {
    // 15 months holding of unlisted => STCG
    const r = computeESOPRSU(100000, 500000, 800000, 15, false, 0);
    expect(r.cgType).toBe('STCG');

    // 25 months holding of unlisted => LTCG
    const r2 = computeESOPRSU(100000, 500000, 800000, 25, false, 0);
    expect(r2.cgType).toBe('LTCG');
  });

  it('accounts for already-used LTCG exemption', () => {
    // 125000 exemption already used elsewhere
    const r = computeESOPRSU(100000, 500000, 800000, 15, true, 125000);
    // Remaining exemption = max(0, 125000-125000) = 0. Full 300000 taxable.
    const expectedTax = Math.round(300000 * 0.125 * 1.04);
    expect(r.cgTax).toBe(expectedTax);
  });
});

// ════════════════════════════════════════════════
// 9. computeCryptoVDA
// ════════════════════════════════════════════════
describe('computeCryptoVDA', () => {
  it('computes 30% flat tax + cess and 1% TDS', () => {
    const r = computeCryptoVDA(500000, 200000);
    // Gain = 3L. Tax = 90000. Cess = 3600. Total = 93600. TDS = 5000.
    expect(r.gain).toBe(300000);
    expect(r.tax).toBe(90000);
    expect(r.cess).toBe(3600);
    expect(r.total).toBe(93600);
    expect(r.tds194S).toBe(5000);
    expect(r.refundOrPayable).toBe(5000 - 93600);
  });

  it('returns zero gain when cost exceeds sale price', () => {
    const r = computeCryptoVDA(100000, 500000);
    expect(r.gain).toBe(0);
    expect(r.tax).toBe(0);
    expect(r.total).toBe(0);
    // TDS still applies on sale consideration
    expect(r.tds194S).toBe(1000);
  });

  it('handles zero inputs', () => {
    const r = computeCryptoVDA(0, 0);
    expect(r.gain).toBe(0);
    expect(r.tax).toBe(0);
    expect(r.tds194S).toBe(0);
  });
});

// ════════════════════════════════════════════════
// 10. classifyCase — Scoring
// ════════════════════════════════════════════════
describe('classifyCase', () => {
  it('classifies simple interest only as Green', () => {
    const r = classifyCase({ interest: true });
    expect(r).toBe('Green');
  });

  it('classifies property sale + foreign tax as Red', () => {
    // cgProperty=+3, foreignTaxPaid=+2 => score 5 => Amber... need more
    // propertySale=+3, foreignTaxPaid=+2 => 5 => Amber
    // Let's add priorNotices to push to Red
    const r = classifyCase({ propertySale: true, foreignTaxPaid: true, priorNotices: 'Yes' });
    // score = 3 + 2 + 3 = 8 => Red
    expect(r).toBe('Red');
  });

  it('classifies property sale + foreign tax (no notices, no stayDays) as Red', () => {
    const r = classifyCase({ cgProperty: true, foreignTaxPaid: true });
    // score = 3 (cgProperty) + 2 (foreignTax) + 1 (no stayDays) = 6 => Red
    expect(r).toBe('Red');
  });

  it('classifies property sale + foreign tax with stayDays as Amber', () => {
    const r = classifyCase({ cgProperty: true, foreignTaxPaid: true, stayDays: 30 });
    // score = 3 + 2 = 5 => Amber (<=5)
    expect(r).toBe('Amber');
  });

  it('classifies crypto without stayDays as Amber (score = 3)', () => {
    // crypto=2 + no stayDays=1 = 3 => Amber
    const r = classifyCase({ crypto: true });
    expect(r).toBe('Amber');
  });

  it('classifies crypto with stayDays provided as Green (score = 2)', () => {
    const r = classifyCase({ crypto: true, stayDays: 30 });
    // crypto = 2, stayDays present => no extra point. score = 2 => Green
    expect(r).toBe('Green');
  });

  it('scores multiple income sources', () => {
    // salary + rent + interest + dividend + cgShares = 5 sources >=3 => +1
    // cgShares = +2, no stayDays = +1 => total = 4 => Amber
    const r = classifyCase({ salary: true, rent: true, interest: true, dividend: true, cgShares: true });
    expect(r).toBe('Amber');
  });

  it('accounts for high asset value', () => {
    const r = classifyCase({ salary: true, indianAssets: 'Above ₹1 Crore', stayDays: 45 });
    // salary source count = 1 (<3). indianAssets = +1. score = 1 => Green
    expect(r).toBe('Green');
  });
});

// ════════════════════════════════════════════════
// 11. getDTAARate — Treaty lookup
// ════════════════════════════════════════════════
describe('getDTAARate', () => {
  it('returns UK interest rate of 15%', () => {
    const r = getDTAARate('United Kingdom', 'interest');
    expect(r.rate).toBe(15);
    expect(r.hasDTAA).toBe(true);
    expect(r.domesticRate).toBe(30);
    expect(r.saving).toBe(15);
  });

  it('returns Germany interest rate of 10%', () => {
    const r = getDTAARate('Germany', 'interest');
    expect(r.rate).toBe(10);
    expect(r.hasDTAA).toBe(true);
  });

  it('returns 30% for unknown country with hasDTAA false', () => {
    const r = getDTAARate('Narnia', 'interest');
    expect(r.rate).toBe(30);
    expect(r.hasDTAA).toBe(false);
  });

  it('returns correct dividend and royalty rates', () => {
    const rDiv = getDTAARate('Singapore', 'dividend');
    expect(rDiv.rate).toBe(15);
    const rRoy = getDTAARate('Singapore', 'royalty');
    expect(rRoy.rate).toBe(10);
  });

  it('returns UAE rates correctly', () => {
    const r = getDTAARate('UAE', 'interest');
    expect(r.rate).toBe(12.5);
    expect(r.hasDTAA).toBe(true);
  });

  it('returns US rates', () => {
    const r = getDTAARate('United States', 'interest');
    expect(r.rate).toBe(15);
    expect(r.hasDTAA).toBe(true);
  });
});

// ════════════════════════════════════════════════
// 12. computeSection234A — Late filing interest
// ════════════════════════════════════════════════
describe('computeSection234A', () => {
  it('computes interest for 3 months late filing', () => {
    // tax 5L, TDS 3L, filed 3 months late => outstanding 2L => interest = 1% * 2L * 3 = 6000
    const r = computeSection234A(500000, 300000, '2026-10-31', '2026-07-31');
    // Oct 31 vs Jul 31: 3 months exact (same day).
    // months = (2026-2026)*12 + (10-7) = 3. filed.getDate()==due.getDate() so no +1 => 3 months
    expect(r.outstanding).toBe(200000);
    expect(r.months).toBe(3);
    expect(r.interest).toBe(6000);
  });

  it('returns zero interest when filed on time', () => {
    const r = computeSection234A(500000, 300000, '2026-07-31', '2026-07-31');
    expect(r.interest).toBe(0);
  });

  it('returns zero interest when TDS covers tax', () => {
    const r = computeSection234A(300000, 500000, '2026-10-31', '2026-07-31');
    expect(r.interest).toBe(0);
    expect(r.outstanding).toBe(0);
  });

  it('treats part month as full month', () => {
    // Due Jul 31, Filed Nov 5 => months = (11-7)=4, date 5 < 31 so no +1 => 4 months
    const r = computeSection234A(500000, 300000, '2026-11-05', '2026-07-31');
    expect(r.months).toBe(4);
    expect(r.interest).toBe(Math.round(200000 * 0.01 * 4));
  });

  it('accounts for advance tax paid', () => {
    // tax 5L, TDS 2L, advanceTax 1L => outstanding = 5L-2L-1L = 2L
    const r = computeSection234A(500000, 200000, '2026-10-31', '2026-07-31', 100000);
    expect(r.outstanding).toBe(200000);
    expect(r.interest).toBe(Math.round(200000 * 0.01 * 3));
  });
});

// ════════════════════════════════════════════════
// 13. computeCGLossSetOff
// ════════════════════════════════════════════════
describe('computeCGLossSetOff', () => {
  it('sets off STCL against STCG then LTCG, LTCL against LTCG only', () => {
    // STCG 5L, LTCG 3L, STCL 7L, LTCL 1L
    const r = computeCGLossSetOff(500000, 300000, 700000, 100000);

    // STCL=7L: set off 5L vs STCG => netSTCG=0, remainSTCL=2L
    // remainSTCL=2L vs LTCG=3L => netLTCG=1L, remainSTCL=0
    // LTCL=1L vs netLTCG=1L => netLTCG=0, remainLTCL=0
    expect(r.netSTCG).toBe(0);
    expect(r.netLTCG).toBe(0);
    expect(r.stclCarryForward).toBe(0);
    expect(r.ltclCarryForward).toBe(0);
  });

  it('carries forward excess STCL and LTCL', () => {
    // STCG 2L, LTCG 1L, STCL 5L, LTCL 3L
    const r = computeCGLossSetOff(200000, 100000, 500000, 300000);
    // STCL=5L: set off 2L vs STCG => netSTCG=0, remain=3L
    // remain 3L vs LTCG 1L => netLTCG=0, remain=2L
    // LTCL=3L vs netLTCG=0 => remain=3L
    expect(r.netSTCG).toBe(0);
    expect(r.netLTCG).toBe(0);
    expect(r.stclCarryForward).toBe(200000);
    expect(r.ltclCarryForward).toBe(300000);
    expect(r.carryForwardYears).toBe(8);
  });

  it('handles no losses', () => {
    const r = computeCGLossSetOff(500000, 300000, 0, 0);
    expect(r.netSTCG).toBe(500000);
    expect(r.netLTCG).toBe(300000);
    expect(r.stclCarryForward).toBe(0);
    expect(r.ltclCarryForward).toBe(0);
  });

  it('LTCL cannot set off against STCG', () => {
    // STCG 5L, LTCG 0, STCL 0, LTCL 3L
    const r = computeCGLossSetOff(500000, 0, 0, 300000);
    // LTCL can only set off vs LTCG (which is 0) => carry forward 3L
    expect(r.netSTCG).toBe(500000);
    expect(r.netLTCG).toBe(0);
    expect(r.ltclCarryForward).toBe(300000);
  });
});

// ════════════════════════════════════════════════
// 14. computeHouseProperty
// ════════════════════════════════════════════════
describe('computeHouseProperty', () => {
  it('computes taxable income from rental with standard deduction', () => {
    // Rent 6L, municipal 50K, loan interest 1.5L, not self-occupied
    const r = computeHouseProperty(600000, 50000, 150000, false);
    // NAV = 600000 - 50000 = 550000
    // Standard deduction = round(550000 * 0.30) = 165000
    // Interest = 150000 (no cap for let-out)
    // Taxable = 550000 - 165000 - 150000 = 235000
    expect(r.nav).toBe(550000);
    expect(r.standardDeduction).toBe(165000);
    expect(r.interestDeduction).toBe(150000);
    expect(r.taxableIncome).toBe(235000);
  });

  it('caps interest at Rs 2L for self-occupied property', () => {
    const r = computeHouseProperty(0, 0, 300000, true);
    // Self-occupied: interest cap = 2L
    expect(r.interestDeduction).toBe(200000);
  });

  it('does not cap interest for let-out property', () => {
    const r = computeHouseProperty(600000, 0, 500000, false);
    expect(r.interestDeduction).toBe(500000);
  });

  it('includes pre-construction interest spread over 5 years', () => {
    const r = computeHouseProperty(600000, 0, 100000, false, 500000);
    // preConstDeduction = round(500000/5) = 100000
    // totalInterest = 100000 + 100000 = 200000
    expect(r.preConstDeduction).toBe(100000);
    expect(r.interestDeduction).toBe(200000);
  });
});

// ════════════════════════════════════════════════
// 15. computeSection54F — Non-residential asset
// ════════════════════════════════════════════════
describe('computeSection54F', () => {
  it('computes proportional exemption', () => {
    // LTCG 10L, net sale 20L, new house 15L
    // Exemption = round(10L * min(1, 15L/20L)) = round(10L * 0.75) = 750000
    const r = computeSection54F(1000000, 2000000, 1500000);
    expect(r.eligible).toBe(true);
    expect(r.exemptAmount).toBe(750000);
    expect(r.taxableAfterExemption).toBe(250000);
  });

  it('grants full exemption when house >= net sale consideration', () => {
    const r = computeSection54F(1000000, 2000000, 2500000);
    // ratio = 2500000/2000000 = 1.25 => min(1, 1.25) = 1 => full LTCG exempt
    expect(r.exemptAmount).toBe(1000000);
  });

  it('caps exemption at Rs 10 Crore', () => {
    const r = computeSection54F(200000000, 200000000, 200000000);
    // exempt = min(round(200000000 * 1), 100000000) = 100000000
    expect(r.exemptAmount).toBe(100000000);
  });

  it('returns not eligible when no house investment', () => {
    const r = computeSection54F(1000000, 2000000, 0);
    expect(r.eligible).toBe(false);
    expect(r.exemptAmount).toBe(0);
  });
});

// ════════════════════════════════════════════════
// 16. computeSTCGProperty
// ════════════════════════════════════════════════
describe('computeSTCGProperty', () => {
  it('computes STCG and TDS at 30% on sale consideration', () => {
    const r = computeSTCGProperty(5000000, 3000000);
    expect(r.stcg).toBe(2000000);
    // TDS = round(5000000 * 0.30 * 1.04) = round(1560000) = 1560000
    expect(r.tds195).toBe(1560000);
  });

  it('deducts improvement cost', () => {
    const r = computeSTCGProperty(5000000, 3000000, 500000);
    expect(r.stcg).toBe(1500000);
  });

  it('caps gain at zero', () => {
    const r = computeSTCGProperty(1000000, 3000000);
    expect(r.stcg).toBe(0);
  });
});

// ════════════════════════════════════════════════
// 17. computeInheritedPropertyCG
// ════════════════════════════════════════════════
describe('computeInheritedPropertyCG', () => {
  it('uses previous owner cost and acquisition year', () => {
    const r = computeInheritedPropertyCG(5000000, 1000000, '2010-11', '2025-26');
    // CII 2010-11 = 167, CII 2025-26 = 376
    expect(r.ciiAcq).toBe(167);
    expect(r.ciiSale).toBe(376);
    expect(r.acquisitionType).toBe('inherited_or_gifted');
    // indexedCost = round(1000000 * 376 / 167)
    const expectedIndexed = Math.round(1000000 * 376 / 167);
    expect(r.indexedCost).toBe(expectedIndexed);
  });
});

// ════════════════════════════════════════════════
// 18. computeLossSetOff (House Property)
// ════════════════════════════════════════════════
describe('computeLossSetOff', () => {
  it('sets off HP loss up to Rs 2L cap', () => {
    const r = computeLossSetOff(-300000, 1000000);
    expect(r.setOff).toBe(200000); // capped at 2L
    expect(r.carryForward).toBe(100000);
    expect(r.incomeAfterSetOff).toBe(800000);
    expect(r.carryForwardYears).toBe(8);
  });

  it('sets off full HP loss when below 2L cap', () => {
    const r = computeLossSetOff(-150000, 1000000);
    expect(r.setOff).toBe(150000);
    expect(r.carryForward).toBe(0);
  });

  it('limits set off to other income', () => {
    const r = computeLossSetOff(-300000, 100000);
    // setOff = min(300000, 200000, 100000) = 100000
    expect(r.setOff).toBe(100000);
    expect(r.carryForward).toBe(200000);
  });
});

// ════════════════════════════════════════════════
// 19. computeUnlistedSharesCG
// ════════════════════════════════════════════════
describe('computeUnlistedSharesCG', () => {
  it('computes LTCG for unlisted shares held > 24 months at 12.5%', () => {
    const r = computeUnlistedSharesCG(1000000, 400000, 30, '2022-23', '2025-26');
    expect(r.type).toBe('LTCG');
    expect(r.gain).toBe(600000);
    expect(r.tax).toBe(Math.round(600000 * 0.125)); // 75000
    expect(r.cess).toBe(Math.round(75000 * 0.04)); // 3000
    expect(r.total).toBe(75000 + 3000);
  });

  it('returns STCG at slab rates for unlisted held <= 24 months', () => {
    const r = computeUnlistedSharesCG(1000000, 400000, 20, '2024-25', '2025-26');
    expect(r.type).toBe('STCG');
    expect(r.gain).toBe(600000);
    expect(r.tax).toBe(0); // Slab-rate computation not done here
    expect(r.rate).toBe('Slab rates');
  });
});

// ════════════════════════════════════════════════
// 20. computeCryptoVDA — edge cases
// ════════════════════════════════════════════════
describe('computeCryptoVDA — edge cases', () => {
  it('computes correctly for large amounts', () => {
    const r = computeCryptoVDA(10000000, 3000000);
    expect(r.gain).toBe(7000000);
    expect(r.tax).toBe(2100000);
    expect(r.cess).toBe(84000);
    expect(r.total).toBe(2184000);
    expect(r.tds194S).toBe(100000); // 1% of 1Cr
  });
});

// ════════════════════════════════════════════════
// 21. computeDebtMFCG
// ════════════════════════════════════════════════
describe('computeDebtMFCG', () => {
  it('computes gain at slab rates with no indexation', () => {
    const r = computeDebtMFCG(500000, 300000);
    expect(r.gain).toBe(200000);
    expect(r.taxRate).toBe('Slab rates');
    expect(r.indexation).toBe(false);
  });

  it('caps gain at zero', () => {
    const r = computeDebtMFCG(100000, 500000);
    expect(r.gain).toBe(0);
  });
});

// ════════════════════════════════════════════════
// 22. computeDeemedLetOut
// ════════════════════════════════════════════════
describe('computeDeemedLetOut', () => {
  it('computes ALV as higher of municipal/fair rent, capped at standard rent', () => {
    // municipalValue 3L, fairRent 4L, standardRent 3.5L
    // expectedRent = max(3L, 4L) = 4L. ALV = min(4L, 3.5L) = 3.5L
    const r = computeDeemedLetOut(300000, 400000, 350000);
    expect(r.annualLettableValue).toBe(350000);
    expect(r.standardDeduction).toBe(Math.round(350000 * 0.30));
    expect(r.taxableIncome).toBe(350000 - Math.round(350000 * 0.30));
  });

  it('uses expected rent when no standard rent', () => {
    const r = computeDeemedLetOut(300000, 400000, 0);
    expect(r.annualLettableValue).toBe(400000);
  });
});

// ════════════════════════════════════════════════
// 23. computeSection234B — Interest on shortfall
// ════════════════════════════════════════════════
describe('computeSection234B', () => {
  it('computes 1% per month interest on shortfall', () => {
    // totalTax 5L, TDS 1L, advanceTax 2L
    // assessedTax = 5L-1L = 4L. 90% of assessedTax = 3.6L. advanceTax 2L < 3.6L => applicable.
    // shortfall = 4L - 2L = 2L. interest = round(2L * 0.01 * 12) = 24000
    const r = computeSection234B(500000, 100000, 200000);
    expect(r).not.toBeNull();
    expect(r.shortfall).toBe(200000);
    expect(r.interest).toBe(24000);
  });

  it('returns null when advance tax >= 90% of assessed tax', () => {
    // assessedTax = 5L-1L = 4L. 90% = 3.6L. advanceTax = 3.6L => null
    const r = computeSection234B(500000, 100000, 360000);
    expect(r).toBeNull();
  });

  it('returns null when TDS covers all tax', () => {
    const r = computeSection234B(500000, 600000, 0);
    // assessedTax = max(0, 500000-600000) = 0. advanceTax 0 >= 0*0.90 => null
    expect(r).toBeNull();
  });
});

// ════════════════════════════════════════════════
// 24. computeSection234C — Deferment interest
// ════════════════════════════════════════════════
describe('computeSection234C', () => {
  it('computes deferment interest when no installments paid', () => {
    // totalTax 5L, TDS 1L => balance 4L
    const r = computeSection234C(500000, 100000);
    expect(r).not.toBeNull();
    // Schedule: Jun 60K (3mo), Sep 180K (3mo), Dec 300K (3mo), Mar 400K (1mo)
    // No installments paid => shortfall = each schedule amount
    const balance = 400000;
    expect(r.details[0].shortfall).toBe(Math.round(balance * 0.15));
    expect(r.details[0].interest).toBe(Math.round(Math.round(balance * 0.15) * 0.01 * 3));
    expect(r.totalInterest).toBeGreaterThan(0);
  });

  it('returns null when balance < Rs 10,000', () => {
    const r = computeSection234C(15000, 8000);
    // balance = 7000 < 10000
    expect(r).toBeNull();
  });
});

// ════════════════════════════════════════════════
// 25. computeDividendTax
// ════════════════════════════════════════════════
describe('computeDividendTax', () => {
  it('computes 20% TDS on dividend for NRI', () => {
    const r = computeDividendTax(500000);
    expect(r.amount).toBe(500000);
    expect(r.tds).toBe(100000);
  });
});

// ════════════════════════════════════════════════
// 26. formatINR
// ════════════════════════════════════════════════
describe('formatINR', () => {
  it('formats positive numbers with rupee symbol', () => {
    const r = formatINR(1234567);
    expect(r).toContain('12,34,567');
    expect(r.startsWith('₹')).toBe(true);
  });

  it('formats negative numbers as absolute value', () => {
    const r = formatINR(-500000);
    expect(r).toContain('5,00,000');
    expect(r.startsWith('₹')).toBe(true);
  });

  it('formats zero', () => {
    const r = formatINR(0);
    expect(r).toBe('₹0');
  });
});

// ════════════════════════════════════════════════
// 27. CII Table
// ════════════════════════════════════════════════
describe('CII Table', () => {
  it('has correct values for key years', () => {
    expect(CII['2001-02']).toBe(100);
    expect(CII['2017-18']).toBe(272);
    expect(CII['2024-25']).toBe(363);
    expect(CII['2025-26']).toBe(376);
  });

  it('covers FYs from 2001-02 to 2025-26', () => {
    const keys = Object.keys(CII);
    expect(keys.length).toBe(25);
    expect(keys[0]).toBe('2001-02');
    expect(keys[keys.length - 1]).toBe('2025-26');
  });
});

// ════════════════════════════════════════════════
// 28. computeHRAExemption — Section 10(13A)
// ════════════════════════════════════════════════
describe('computeHRAExemption', () => {
  // Metro case:
  // Basic 720000, HRA 240000, Rent 180000, metro=true
  // Rule1 = 240000 (actual HRA received)
  // Rule2 = 360000 (50% of basic for metro)
  // Rule3 = 180000 - 72000 = 108000 (rent paid - 10% of basic)
  // exempt = min(240000, 360000, 108000) = 108000
  // taxable = 240000 - 108000 = 132000
  it('computes metro HRA exemption correctly', () => {
    const r = computeHRAExemption(720000, 240000, 180000, true);
    expect(r.rule1).toBe(240000);
    expect(r.rule2).toBe(360000);
    expect(r.rule3).toBe(108000);
    expect(r.exempt).toBe(108000);
    expect(r.taxable).toBe(132000);
    expect(r.isMetro).toBe(true);
  });

  // Non-metro case:
  // Basic 600000, HRA 180000, Rent 120000, metro=false
  // Rule1 = 180000
  // Rule2 = 240000 (40% of basic for non-metro)
  // Rule3 = 120000 - 60000 = 60000 (rent paid - 10% of basic)
  // exempt = min(180000, 240000, 60000) = 60000
  it('computes non-metro HRA exemption correctly', () => {
    const r = computeHRAExemption(600000, 180000, 120000, false);
    expect(r.rule2).toBe(240000);
    expect(r.rule3).toBe(60000);
    expect(r.exempt).toBe(60000);
    expect(r.isMetro).toBe(false);
  });

  // No rent paid → exempt = 0
  it('returns exempt=0 when no rent is paid', () => {
    const r = computeHRAExemption(600000, 180000, 0, true);
    expect(r.exempt).toBe(0);
    expect(r.taxable).toBe(180000);
  });

  // No HRA received → exempt = 0
  it('returns exempt=0 and taxable=0 when hraReceived <= 0', () => {
    const r = computeHRAExemption(600000, 0, 120000, true);
    expect(r.exempt).toBe(0);
    expect(r.taxable).toBe(0);
  });

  it('identifies the applied (minimum) rule', () => {
    const r = computeHRAExemption(720000, 240000, 180000, true);
    // rule3=108000 is the minimum
    expect(r.appliedRule).toBe('rule3');
  });

  it('returns appliedRule=null when no rent paid (not misleadingly rule3)', () => {
    const r = computeHRAExemption(600000, 180000, 0, true);
    expect(r.appliedRule).toBeNull();
  });

  it('integration: computeTotalIncome deducts HRA exempt from salary under Old Regime', () => {
    // Basic 720000, HRA 240000, Rent 180000 metro → exempt 108000
    // Gross salary 1200000, taxable salary = 1200000 - 108000 = 1092000
    const result = computeTotalIncome({
      salary: true, salaryAmount: 1200000,
      basicSalary: 720000, hraReceived: 240000, annualRentPaid: 180000, isMetroCity: true,
      taxRegime: 'Old',
    }, '2025-26');
    const salaryHead = result.heads.find(h => h.head === 'Salary');
    expect(salaryHead.amount).toBe(1092000);
  });

  it('integration: computeTotalIncome does NOT deduct HRA under New Regime', () => {
    const result = computeTotalIncome({
      salary: true, salaryAmount: 1200000,
      basicSalary: 720000, hraReceived: 240000, annualRentPaid: 180000, isMetroCity: true,
      taxRegime: 'New (default)',
    }, '2025-26');
    const salaryHead = result.heads.find(h => h.head === 'Salary');
    expect(salaryHead.amount).toBe(1200000);
  });
});
