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

// ═══ Capital Gains Dual Computation ═══
export function computeCapitalGains(salePrice, purchaseCost, acqFY, saleFY, improvement = 0) {
  const ciiAcq = CII[acqFY] || 272;
  const ciiSale = CII[saleFY] || 376;
  
  // Option A: 20% with indexation
  const indexedCost = Math.round((purchaseCost + improvement) * ciiSale / ciiAcq);
  const ltcgA = salePrice - indexedCost;
  const taxA = Math.round(ltcgA * 0.20);
  const cessA = Math.round(taxA * 0.04);
  const totalA = taxA + cessA;
  
  // Option B: 12.5% without indexation
  const ltcgB = salePrice - purchaseCost - improvement;
  const taxB = Math.round(ltcgB * 0.125);
  const cessB = Math.round(taxB * 0.04);
  const totalB = taxB + cessB;
  
  const better = totalB < totalA ? "B" : "A";
  const savings = Math.abs(totalA - totalB);
  
  // TDS estimate
  const tds194IA = Math.round(salePrice * 0.01);
  
  // Section 54EC max savings
  const sec54ecMax = 5000000;
  const sec54ecSaved = Math.round(
    Math.min(better === "B" ? ltcgB : ltcgA, sec54ecMax) * 
    (better === "B" ? 0.125 : 0.20) * 1.04
  );

  return {
    ciiAcq, ciiSale, indexedCost,
    optionA: { ltcg: ltcgA, tax: taxA, cess: cessA, total: totalA },
    optionB: { ltcg: ltcgB, tax: taxB, cess: cessB, total: totalB },
    better, savings, tds194IA, sec54ecSaved,
    netTax: better === "B" ? totalB : totalA,
    netAfterTDS: (better === "B" ? totalB : totalA) - tds194IA,
    withSec54Full: 0,
    refundWithSec54: tds194IA,
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
