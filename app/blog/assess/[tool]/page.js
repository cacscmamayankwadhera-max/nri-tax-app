'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

/* ═══════════════════════════════════════════════════════════════
   TOOL DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */

const TOOLS = {
  'residency-check': {
    title: 'Am I an NRI?',
    subtitle: 'Residency Status Quick Check — FY 2025-26',
    icon: '🛂',
    description: 'Determine your residential status under Indian tax law in 5 questions.',
    steps: [
      {
        q: 'How many days were you physically present in India during FY 2025-26 (April 1, 2025 to March 31, 2026)?',
        type: 'select',
        options: [
          { label: 'Less than 60 days', value: 'lt60' },
          { label: '60 to 120 days', value: '60to120' },
          { label: '121 to 181 days', value: '121to181' },
          { label: '182 days or more', value: 'gte182' },
        ],
      },
      {
        q: 'Are you an Indian citizen who left India for employment abroad during this FY?',
        type: 'select',
        options: [
          { label: 'Yes — I left India for employment abroad', value: 'yes' },
          { label: 'No — I was already abroad / other reason', value: 'no' },
        ],
      },
      {
        q: 'How many days were you in India during the preceding 4 financial years combined?',
        type: 'select',
        options: [
          { label: 'Less than 365 days', value: 'lt365' },
          { label: '365 to 729 days', value: '365to729' },
          { label: '730 days or more', value: 'gte730' },
        ],
      },
      {
        q: 'Is your total Indian income (before deductions) more than ₹15 lakh in this FY?',
        type: 'select',
        options: [
          { label: 'Yes — more than ₹15 lakh', value: 'yes' },
          { label: 'No — ₹15 lakh or less', value: 'no' },
          { label: 'Not sure', value: 'unsure' },
        ],
      },
      {
        q: 'Were you NRI (Non-Resident) in India for 9 out of the 10 preceding financial years?',
        type: 'select',
        options: [
          { label: 'Yes — NRI in 9+ of last 10 years', value: 'yes' },
          { label: 'No — I was Resident in some of those years', value: 'no' },
          { label: 'Not sure', value: 'unsure' },
        ],
      },
    ],
    getResult: (answers) => {
      const days = answers[0];
      const leftForEmployment = answers[1] === 'yes';
      const prev4 = answers[2];
      const highIncome = answers[3] === 'yes';
      const nri9of10 = answers[4] === 'yes' || answers[4] === 'unsure';

      if (days === 'gte182') {
        if (nri9of10) {
          return {
            status: 'RNOR',
            color: '#F59E0B',
            title: 'Resident but Not Ordinarily Resident (RNOR)',
            summary: 'You are a Resident of India (182+ days), but qualify for RNOR status because you were NRI in 9 of the 10 preceding years.',
            taxImpact: 'Only Indian-sourced income is taxable. Foreign income is NOT taxable during RNOR years.',
            actions: [
              'File ITR-2 as RNOR — only report Indian income',
              'Plan FCNR maturity during RNOR window for tax-free interest',
              'Liquidate overseas investments during RNOR for zero Indian tax',
              'Schedule FA (Foreign Assets) is mandatory for RNOR',
              'Consult CA for RNOR period calculation — typically 2-3 years',
            ],
          };
        }
        return {
          status: 'Resident',
          color: '#DC2626',
          title: 'Resident and Ordinarily Resident (ROR)',
          summary: 'You are a Resident of India with 182+ days of stay. Your GLOBAL income is taxable in India.',
          taxImpact: 'All worldwide income — Indian + foreign — is taxable in India. Claim DTAA benefits to avoid double taxation.',
          actions: [
            'File ITR with worldwide income disclosure',
            'Claim Foreign Tax Credit (FTC) for taxes paid abroad — file Form 67',
            'Mandatory Schedule FA for all foreign assets',
            'Convert NRE/FCNR accounts to Resident accounts',
            'Consult a CA experienced in cross-border taxation',
          ],
        };
      }

      if (days === 'lt60') {
        return {
          status: 'NRI',
          color: '#059669',
          title: 'Non-Resident (NRI) — Clear',
          summary: 'With less than 60 days in India, you are clearly a Non-Resident under Section 6 of the Income Tax Act.',
          taxImpact: 'Only Indian-sourced income (NRO interest, rent, dividends, capital gains) is taxable. Foreign salary/income is NOT taxable.',
          actions: [
            'File ITR-2 if Indian income exceeds ₹4 lakh (new regime)',
            'Claim TDS refund — NRIs often have excess TDS deducted',
            'NRE interest remains tax-free under Section 10(4)',
            'Foreign salary need NOT be reported in Indian ITR',
            'Apply for Section 197 lower TDS certificate before property sale',
          ],
        };
      }

      // 60-181 days — need deeper analysis
      if (days === '60to120') {
        if (leftForEmployment) {
          return {
            status: 'NRI',
            color: '#059669',
            title: 'Non-Resident (NRI) — Employment Abroad Relaxation',
            summary: 'Indian citizens leaving for employment abroad get the 60-day threshold raised to 182 days. With 60-120 days, you are NRI.',
            taxImpact: 'Only Indian-sourced income is taxable. Foreign salary is NOT taxable in India.',
            actions: [
              'Maintain records of employment abroad (offer letter, visa)',
              'File ITR-2 for Indian income',
              'Keep passport stamps as proof of days in India',
            ],
          };
        }
        if (highIncome && prev4 !== 'lt365') {
          return {
            status: 'Borderline',
            color: '#F59E0B',
            title: 'Borderline — Possible Deemed Resident',
            summary: 'With 60-120 days in India, Indian income > ₹15 lakh, and 365+ days in preceding 4 years, you may be classified as Resident under the modified rule.',
            taxImpact: 'If classified as Resident, your global income becomes taxable. Verify exact day count with passport stamps.',
            actions: [
              'URGENT: Count exact days with passport entry/exit stamps',
              'Consult a qualified CA immediately — this is a high-risk scenario',
              'Gather TRC from country of residence',
              'Do NOT file until residency status is professionally confirmed',
            ],
          };
        }
        return {
          status: 'NRI',
          color: '#059669',
          title: 'Non-Resident (NRI) — Likely',
          summary: 'With 60-120 days and no high-income trigger, you are likely NRI. However, verify exact day count.',
          taxImpact: 'Only Indian-sourced income is taxable.',
          actions: [
            'Verify exact days from passport stamps',
            'File ITR-2 for Indian income if applicable',
            'Maintain day-count register for future years',
          ],
        };
      }

      // 121-181 days
      if (days === '121to181') {
        if (leftForEmployment) {
          return {
            status: 'NRI',
            color: '#059669',
            title: 'Non-Resident (NRI) — Employment Abroad Relaxation',
            summary: 'Indian citizens leaving for employment abroad: 182-day threshold applies instead of 60. With 121-181 days, you remain NRI.',
            taxImpact: 'Only Indian-sourced income is taxable.',
            actions: [
              'Keep employment abroad documentation',
              'File ITR-2 for Indian income only',
              'Be careful next year — crossing 182 days makes you Resident',
            ],
          };
        }
        if (highIncome) {
          return {
            status: 'Borderline',
            color: '#DC2626',
            title: 'HIGH RISK — Likely Resident or Deemed Resident',
            summary: 'With 121-181 days + Indian income > ₹15 lakh, the modified 120-day rule under Section 6(1A) may classify you as Deemed Resident.',
            taxImpact: 'If Deemed Resident, your GLOBAL income is taxable in India. This is a critical determination.',
            actions: [
              'CONSULT A CA IMMEDIATELY — significant tax exposure',
              'Count exact days with passport records',
              'Check if Section 6(1A) deemed resident provisions apply',
              'Obtain TRC from country of residence',
              'Do NOT file without professional guidance',
            ],
          };
        }
        return {
          status: 'NRI',
          color: '#F59E0B',
          title: 'Non-Resident (NRI) — But Close to Borderline',
          summary: 'With 121-181 days and income ≤ ₹15 lakh, you are NRI. But you are close to the threshold — be careful.',
          taxImpact: 'Only Indian-sourced income is taxable. Monitor your days carefully.',
          actions: [
            'Track days in India meticulously',
            'Consider reducing India visits if approaching 182 days',
            'File ITR-2 for Indian income',
          ],
        };
      }

      return {
        status: 'Consult CA',
        color: '#6366F1',
        title: 'Complex Situation — Professional Review Needed',
        summary: 'Your situation requires detailed analysis by a qualified Chartered Accountant.',
        taxImpact: 'Tax impact depends on precise determination of residential status.',
        actions: ['Book a consultation with MKW Advisors for accurate determination'],
      };
    },
  },

  'property-tax-calculator': {
    title: 'Property Sale Tax Calculator',
    subtitle: 'Compare Both Options — 20% Indexed vs 12.5% Flat',
    icon: '🧮',
    description: 'Enter your property details to see LTCG under both options and know your TDS, refund, and best choice.',
    steps: [
      { q: 'Sale price of the property (₹)', type: 'number', placeholder: 'e.g. 8000000 for ₹80 lakh' },
      { q: 'Original purchase price (₹)', type: 'number', placeholder: 'e.g. 3000000 for ₹30 lakh' },
      { q: 'Financial year of purchase', type: 'select', options: [
        { label: 'Before 2001-02', value: '2001' },
        { label: '2001-02', value: '2001' }, { label: '2002-03', value: '2002' },
        { label: '2003-04', value: '2003' }, { label: '2004-05', value: '2004' },
        { label: '2005-06', value: '2005' }, { label: '2006-07', value: '2006' },
        { label: '2007-08', value: '2007' }, { label: '2008-09', value: '2008' },
        { label: '2009-10', value: '2009' }, { label: '2010-11', value: '2010' },
        { label: '2011-12', value: '2011' }, { label: '2012-13', value: '2012' },
        { label: '2013-14', value: '2013' }, { label: '2014-15', value: '2014' },
        { label: '2015-16', value: '2015' }, { label: '2016-17', value: '2016' },
        { label: '2017-18', value: '2017' }, { label: '2018-19', value: '2018' },
        { label: '2019-20', value: '2019' }, { label: '2020-21', value: '2020' },
        { label: '2021-22', value: '2021' }, { label: '2022-23', value: '2022' },
        { label: '2023-24', value: '2023' }, { label: '2024-25 (before Jul 23)', value: '2024pre' },
        { label: '2024-25 (after Jul 23)', value: '2024post' },
        { label: '2025-26', value: '2025' },
      ]},
      { q: 'Was the property held for more than 24 months?', type: 'select', options: [
        { label: 'Yes — more than 24 months (LTCG)', value: 'yes' },
        { label: 'No — less than 24 months (STCG)', value: 'no' },
      ]},
      { q: 'Cost of improvement/renovation (₹), if any', type: 'number', placeholder: '0 if none' },
      { q: 'Are you planning to reinvest in another house (Section 54)?', type: 'select', options: [
        { label: 'Yes — buying another house', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Considering Section 54EC bonds', value: 'bonds' },
      ]},
    ],
    getResult: (answers) => {
      const sale = parseInt(answers[0]) || 0;
      const purchase = parseInt(answers[1]) || 0;
      const purchaseYear = answers[2];
      const isLTCG = answers[3] === 'yes';
      const improvement = parseInt(answers[4]) || 0;
      const reinvest = answers[5];

      const CII = {
        '2001': 100, '2002': 105, '2003': 109, '2004': 113, '2005': 117,
        '2006': 122, '2007': 129, '2008': 137, '2009': 148, '2010': 167,
        '2011': 184, '2012': 200, '2013': 220, '2014': 240, '2015': 254,
        '2016': 264, '2017': 272, '2018': 280, '2019': 289, '2020': 301,
        '2021': 317, '2022': 331, '2023': 348, '2024pre': 363, '2024post': 363, '2025': 376,
      };

      const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
      const saleYear = 376; // CII 2025-26

      if (!isLTCG) {
        const stcg = sale - purchase - improvement;
        const tax = stcg > 0 ? Math.round(stcg * 0.30 * 1.04) : 0;
        const tds = Math.round(sale * 0.30 * 1.04);
        return {
          status: 'STCG',
          color: '#DC2626',
          title: 'Short-Term Capital Gain — Slab Rates Apply',
          summary: `Property held less than 24 months. STCG of ${fmt(stcg)} taxed at slab rates (up to 30%).`,
          taxImpact: `Estimated tax: ${fmt(tax)}. TDS by buyer: ${fmt(tds)}. Section 54 NOT available for STCG.`,
          table: [
            ['Sale Price', fmt(sale)],
            ['Purchase Cost', fmt(purchase)],
            ['Improvement', fmt(improvement)],
            ['STCG', fmt(stcg)],
            ['Tax (30% + cess)', fmt(tax)],
            ['TDS deducted (30% of sale)', fmt(tds)],
            ['Estimated Refund', fmt(Math.max(0, tds - tax))],
          ],
          actions: [
            'Section 54/54EC NOT available for STCG',
            'Apply for Section 197 lower TDS certificate',
            'File ITR to claim TDS refund',
          ],
        };
      }

      // LTCG — dual option
      const postJuly2024 = purchaseYear === '2024post' || purchaseYear === '2025';
      const ciiPurchase = CII[purchaseYear] || 280;

      const indexedCost = Math.round(purchase * saleYear / ciiPurchase);
      const indexedImprovement = improvement; // simplified
      const ltcgA = sale - indexedCost - indexedImprovement;
      const taxA = Math.round(ltcgA * 0.20 * 1.04);

      const ltcgB = sale - purchase - improvement;
      const taxB = Math.round(ltcgB * 0.125 * 1.04);

      const tds = Math.round(sale * 0.20 * 1.10 * 1.04); // 20% + 10% surcharge + 4% cess
      const bestOption = postJuly2024 ? 'B' : (taxA < taxB ? 'A' : 'B');
      const bestTax = bestOption === 'A' ? taxA : taxB;
      const savings = Math.abs(taxA - taxB);
      const refund = Math.max(0, tds - bestTax);

      let sec54Note = '';
      if (reinvest === 'yes') sec54Note = 'Section 54 exemption can reduce LTCG — up to ₹10Cr cap. Consult CA for exact computation.';
      if (reinvest === 'bonds') sec54Note = 'Section 54EC: Invest up to ₹50L in NHAI/REC bonds within 6 months. Tax saved: up to ' + fmt(50_00_000 * 0.125) + '.';

      return {
        status: bestOption === 'A' ? 'Option A Wins' : 'Option B Wins',
        color: '#059669',
        title: postJuly2024
          ? 'Only 12.5% Flat Rate (Post-July 2024 Acquisition)'
          : `${bestOption === 'A' ? '20% with Indexation' : '12.5% Flat Rate'} Saves You ${fmt(savings)}`,
        summary: postJuly2024
          ? 'Properties acquired after July 23, 2024 — only 12.5% flat rate applies, no indexation.'
          : `Comparing both options: Option ${bestOption} gives lower tax. You save ${fmt(savings)}.`,
        taxImpact: `Best tax: ${fmt(bestTax)}. TDS by buyer: ${fmt(tds)}. Estimated refund: ${fmt(refund)}.`,
        table: postJuly2024 ? [
          ['Sale Price', fmt(sale)],
          ['Purchase Cost', fmt(purchase)],
          ['LTCG', fmt(ltcgB)],
          ['Tax (12.5% + cess)', fmt(taxB)],
          ['TDS deducted', fmt(tds)],
          ['Estimated Refund', fmt(refund)],
        ] : [
          ['', 'Option A (20% Indexed)', 'Option B (12.5% Flat)'],
          ['Sale Price', fmt(sale), fmt(sale)],
          ['Cost', fmt(purchase), fmt(purchase)],
          ['CII Adjustment', `${saleYear}/${ciiPurchase}`, 'None'],
          ['Indexed/Actual Cost', fmt(indexedCost), fmt(purchase)],
          ['LTCG', fmt(ltcgA), fmt(ltcgB)],
          ['Tax + Cess', fmt(taxA), fmt(taxB)],
          ['', bestOption === 'A' ? '✅ BETTER' : '', bestOption === 'B' ? '✅ BETTER' : ''],
          ['TDS Deducted', fmt(tds), fmt(tds)],
          ['Refund', fmt(Math.max(0, tds - taxA)), fmt(Math.max(0, tds - taxB))],
        ],
        actions: [
          `Choose Option ${bestOption} — saves ${fmt(savings)}`,
          `Apply for Section 197 certificate to reduce TDS from ${fmt(tds)} to ~${fmt(bestTax)}`,
          'File ITR to claim refund of excess TDS',
          sec54Note,
        ].filter(Boolean),
      };
    },
  },

  'filing-obligation-check': {
    title: 'Do I Need to File ITR?',
    subtitle: 'Filing Obligation Assessment — AY 2026-27',
    icon: '📄',
    description: 'Quick check based on your Indian income sources to determine if filing is mandatory.',
    steps: [
      {
        q: 'What is your residential status for FY 2025-26?',
        type: 'select',
        options: [
          { label: 'Non-Resident (NRI)', value: 'nri' },
          { label: 'Resident but Not Ordinarily Resident (RNOR)', value: 'rnor' },
          { label: 'Resident and Ordinarily Resident', value: 'ror' },
          { label: 'Not sure — check with Residency Tool first', value: 'unsure' },
        ],
      },
      {
        q: 'What are your Indian income sources? (select all that apply)',
        type: 'multi',
        options: [
          { label: 'NRO bank interest / FD interest', value: 'nro_interest' },
          { label: 'Rental income from Indian property', value: 'rental' },
          { label: 'Capital gains (property / shares / MF sale)', value: 'cg' },
          { label: 'Dividends from Indian companies', value: 'dividends' },
          { label: 'NRE bank interest only', value: 'nre_only' },
          { label: 'Indian salary', value: 'salary' },
          { label: 'None — only foreign income', value: 'none' },
        ],
      },
      {
        q: 'Approximate total Indian income (before deductions) in FY 2025-26?',
        type: 'select',
        options: [
          { label: 'Less than ₹3 lakh', value: 'lt3' },
          { label: '₹3 lakh to ₹4 lakh', value: '3to4' },
          { label: '₹4 lakh to ₹10 lakh', value: '4to10' },
          { label: 'More than ₹10 lakh', value: 'gt10' },
          { label: 'Not sure', value: 'unsure' },
        ],
      },
      {
        q: 'Has TDS been deducted on any Indian income?',
        type: 'select',
        options: [
          { label: 'Yes — TDS has been deducted', value: 'yes' },
          { label: 'No TDS deducted', value: 'no' },
          { label: 'Not sure', value: 'unsure' },
        ],
      },
    ],
    getResult: (answers) => {
      const status = answers[0];
      const sources = answers[1] || [];
      const income = answers[2];
      const tds = answers[3];

      const hasIncome = !sources.includes('none') && !sources.includes('nre_only') && sources.length > 0;
      const hasCG = sources.includes('cg');
      const hasTDS = tds === 'yes';
      const highIncome = income === '4to10' || income === 'gt10';
      const aboveExemption = income !== 'lt3';

      if (status === 'unsure') {
        return {
          status: 'Check Status First',
          color: '#F59E0B',
          title: 'Determine Residency Status First',
          summary: 'Your filing obligation depends on your residential status. Use our Residency Check tool first.',
          taxImpact: '',
          actions: ['Use the "Am I an NRI?" tool to determine your status', 'Then come back to check filing obligation'],
        };
      }

      if (!hasIncome && !hasTDS) {
        return {
          status: 'Not Required',
          color: '#059669',
          title: 'ITR Filing Likely NOT Required',
          summary: 'You have no Indian-sourced taxable income and no TDS deducted. Filing is generally not required.',
          taxImpact: 'No Indian tax liability expected.',
          actions: [
            'NRE interest is exempt — no need to report',
            'Filing is still recommended if you plan future property transactions',
            'Keep records of your NRI status for future reference',
          ],
        };
      }

      if (hasTDS && (!aboveExemption || income === 'lt3' || income === '3to4')) {
        return {
          status: 'File for Refund',
          color: '#2563EB',
          title: 'Filing RECOMMENDED — You May Have a TDS Refund',
          summary: 'Your income may be below the taxable threshold, but TDS has been deducted. File ITR to claim your refund.',
          taxImpact: 'Potential refund of excess TDS. NRIs often have ₹50K-₹3L refundable.',
          actions: [
            'File ITR-2 to claim TDS refund',
            'Download Form 26AS to verify all TDS credits',
            'Reconcile AIS before filing',
            'Due date: July 31, 2026',
            hasCG ? 'Capital gains must be reported even if below exemption' : '',
          ].filter(Boolean),
        };
      }

      if (highIncome || hasCG) {
        return {
          status: 'Mandatory',
          color: '#DC2626',
          title: 'ITR Filing is MANDATORY',
          summary: `Your Indian income exceeds the basic exemption limit${hasCG ? ' and you have capital gains' : ''}. Filing is legally required.`,
          taxImpact: 'Non-filing attracts penalty under Section 234F (₹5,000) + interest under 234A/234B.',
          actions: [
            'File ITR-2 before July 31, 2026',
            'Use the new tax regime (default) unless old regime saves more',
            'Reconcile AIS, 26AS, and TIS before filing',
            'Claim all TDS credits from Form 26AS',
            hasCG ? 'Report capital gains with full computation' : '',
            'Section 87A rebate is NOT available for NRIs',
            'Consider MKW Advisors for professional filing (starts ₹2,000)',
          ].filter(Boolean),
        };
      }

      return {
        status: 'Recommended',
        color: '#F59E0B',
        title: 'Filing RECOMMENDED',
        summary: 'Based on your income sources, filing ITR is advisable to claim TDS refunds and maintain a clean compliance record.',
        taxImpact: 'File to recover excess TDS and avoid future notices.',
        actions: [
          'File ITR-2',
          'Claim TDS refund if applicable',
          'Due date: July 31, 2026',
        ],
      };
    },
  },

  'old-vs-new-regime': {
    title: 'Old vs New Regime Calculator',
    subtitle: 'Which Tax Regime Saves You More? — NRI Edition',
    icon: '🔄',
    description: 'Compare your tax under both regimes with NRI-specific rules (no Section 87A rebate).',
    steps: [
      { q: 'Total Indian income (₹) — NRO interest + rental + salary + capital gains + dividends', type: 'number', placeholder: 'e.g. 1200000 for ₹12 lakh' },
      { q: 'Do you have Indian salary income?', type: 'select', options: [
        { label: 'Yes — Indian salary', value: 'yes' },
        { label: 'No — only investment/rental/CG income', value: 'no' },
      ]},
      { q: 'Section 80C investments (₹) — LIC, ELSS, PPF, tuition fees (old regime only)', type: 'number', placeholder: '0 if none (max ₹150000)' },
      { q: 'Section 80D health insurance premium (₹) — self + family + parents', type: 'number', placeholder: '0 if none' },
      { q: 'Home loan interest (₹) — on self-occupied property (old regime: ₹2L cap)', type: 'number', placeholder: '0 if none' },
    ],
    getResult: (answers) => {
      const income = parseInt(answers[0]) || 0;
      const hasSalary = answers[1] === 'yes';
      const sec80c = Math.min(parseInt(answers[2]) || 0, 150000);
      const sec80d = parseInt(answers[3]) || 0;
      const homeLoan = Math.min(parseInt(answers[4]) || 0, 200000);

      const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');

      // NEW REGIME calculation
      const stdDedNew = hasSalary ? 75000 : 0;
      const taxableNew = Math.max(0, income - stdDedNew);
      let taxNew = 0;
      const slabsNew = [[400000,0],[400000,0.05],[400000,0.10],[400000,0.15],[400000,0.20],[400000,0.25],[Infinity,0.30]];
      let rem = taxableNew;
      for (const [slab, rate] of slabsNew) {
        const amt = Math.min(rem, slab);
        taxNew += amt * rate;
        rem -= amt;
        if (rem <= 0) break;
      }
      taxNew = Math.round(taxNew * 1.04); // + 4% cess

      // OLD REGIME calculation
      const stdDedOld = hasSalary ? 50000 : 0;
      const deductions = sec80c + sec80d + homeLoan + stdDedOld;
      const taxableOld = Math.max(0, income - deductions);
      let taxOld = 0;
      const slabsOld = [[250000,0],[250000,0.05],[500000,0.20],[Infinity,0.30]];
      rem = taxableOld;
      for (const [slab, rate] of slabsOld) {
        const amt = Math.min(rem, slab);
        taxOld += amt * rate;
        rem -= amt;
        if (rem <= 0) break;
      }
      taxOld = Math.round(taxOld * 1.04);

      const savings = Math.abs(taxNew - taxOld);
      const winner = taxNew <= taxOld ? 'New' : 'Old';

      return {
        status: `${winner} Regime Wins`,
        color: '#059669',
        title: `${winner} Regime saves you ${fmt(savings)}`,
        summary: `With ${fmt(income)} income${deductions > 0 ? ` and ${fmt(deductions)} deductions` : ''}, the ${winner} Tax Regime gives lower tax.`,
        taxImpact: `New Regime: ${fmt(taxNew)} | Old Regime: ${fmt(taxOld)} | You save: ${fmt(savings)}`,
        table: [
          ['', 'New Regime', 'Old Regime'],
          ['Gross Income', fmt(income), fmt(income)],
          ['Standard Deduction', fmt(stdDedNew), fmt(stdDedOld)],
          ['80C Deduction', 'Not Available', fmt(sec80c)],
          ['80D Deduction', 'Not Available', fmt(sec80d)],
          ['Home Loan Interest', 'Not Available', fmt(homeLoan)],
          ['Taxable Income', fmt(taxableNew), fmt(taxableOld)],
          ['Tax + 4% Cess', fmt(taxNew), fmt(taxOld)],
          ['', taxNew <= taxOld ? '✅ BETTER' : '', taxOld < taxNew ? '✅ BETTER' : ''],
          ['Section 87A Rebate', 'NOT for NRI', 'NOT for NRI'],
        ],
        actions: [
          `Choose ${winner} Regime — saves ${fmt(savings)}`,
          winner === 'Old' ? 'File Form 10-IEA before July 31, 2026 to opt out of new regime' : 'New regime is default — no action needed',
          'Section 87A rebate is NOT available for NRIs under either regime',
          income > 5000000 ? 'Surcharge may apply — consult CA for exact computation' : '',
          'This is an estimate — consult MKW Advisors for precise computation',
        ].filter(Boolean),
      };
    },
  },

  'tds-refund-estimator': {
    title: 'TDS Refund Estimator',
    subtitle: 'How Much Excess TDS Can You Recover?',
    icon: '💰',
    description: 'Enter your TDS deducted and income to estimate your refund. Most NRIs are owed ₹50K-₹5L.',
    steps: [
      { q: 'TDS deducted on NRO interest (₹)', type: 'number', placeholder: 'Check Form 26AS' },
      { q: 'TDS deducted on property sale (₹), if any', type: 'number', placeholder: '0 if no property sale' },
      { q: 'TDS deducted on rent/dividends/other (₹)', type: 'number', placeholder: '0 if none' },
      { q: 'Your total Indian taxable income (₹) — exclude NRE interest', type: 'number', placeholder: 'Total of NRO interest + rent + CG + dividends' },
    ],
    getResult: (answers) => {
      const tdsNRO = parseInt(answers[0]) || 0;
      const tdsProp = parseInt(answers[1]) || 0;
      const tdsOther = parseInt(answers[2]) || 0;
      const totalTDS = tdsNRO + tdsProp + tdsOther;
      const income = parseInt(answers[3]) || 0;

      const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');

      // Estimate tax under new regime
      let tax = 0;
      const slabs = [[400000,0],[400000,0.05],[400000,0.10],[400000,0.15],[400000,0.20],[400000,0.25],[Infinity,0.30]];
      let rem = income;
      for (const [slab, rate] of slabs) {
        const amt = Math.min(rem, slab);
        tax += amt * rate;
        rem -= amt;
        if (rem <= 0) break;
      }
      tax = Math.round(tax * 1.04);

      const refund = Math.max(0, totalTDS - tax);
      const overpayment = totalTDS > 0 ? Math.round((refund / totalTDS) * 100) : 0;

      return {
        status: refund > 0 ? `Refund: ${fmt(refund)}` : 'No Refund',
        color: refund > 0 ? '#059669' : '#F59E0B',
        title: refund > 0 ? `You may be owed ${fmt(refund)} in TDS refund!` : 'Your TDS matches your tax liability',
        summary: refund > 0
          ? `Total TDS of ${fmt(totalTDS)} was deducted, but your estimated tax is only ${fmt(tax)}. That's ${overpayment}% excess TDS locked with the government.`
          : `Your TDS of ${fmt(totalTDS)} is close to your estimated tax of ${fmt(tax)}.`,
        taxImpact: `TDS Deducted: ${fmt(totalTDS)} | Estimated Tax: ${fmt(tax)} | Refund: ${fmt(refund)}`,
        table: [
          ['Source', 'TDS Deducted'],
          ['NRO Interest TDS', fmt(tdsNRO)],
          ['Property Sale TDS', fmt(tdsProp)],
          ['Rent/Dividends/Other TDS', fmt(tdsOther)],
          ['Total TDS', fmt(totalTDS)],
          ['', ''],
          ['Estimated Tax (New Regime)', fmt(tax)],
          ['Estimated Refund', fmt(refund)],
        ],
        actions: refund > 0 ? [
          `File ITR-2 to claim ${fmt(refund)} refund`,
          'Download Form 26AS to verify all TDS credits match',
          'Reconcile AIS before filing — mismatches delay refunds',
          'Pre-validate your NRO bank account on the e-filing portal',
          'E-verify immediately after filing for faster processing (30-90 days)',
          refund > 100000 ? 'Consider MKW Advisors for professional filing to maximize refund' : '',
        ].filter(Boolean) : [
          'Your TDS and tax are aligned — good compliance',
          'Still file ITR if income exceeds ₹4L or you have capital gains',
          'Check if old regime gives lower tax using our Old vs New Regime calculator',
        ],
      };
    },
  },
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AssessmentTool() {
  const { tool: toolSlug } = useParams();
  const [theme, setTheme] = useState('light');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nri-theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : '');
  }, []);

  const isDark = theme === 'dark';
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nri-theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
  };

  const toolDef = TOOLS[toolSlug];
  if (!toolDef) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4">Tool Not Found</h1>
          <a href="/blog" className="text-sm underline" style={{ color: 'var(--accent)' }}>Back to Knowledge Hub</a>
        </div>
      </div>
    );
  }

  const totalSteps = toolDef.steps.length;
  const currentStep = toolDef.steps[step];
  const progress = result ? 100 : ((step / totalSteps) * 100);

  const handleAnswer = (val) => {
    const newAnswers = [...answers];
    newAnswers[step] = val;
    setAnswers(newAnswers);

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setResult(toolDef.getResult(newAnswers));
    }
  };

  const handleMultiAnswer = (val) => {
    const current = answers[step] || [];
    const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    const newAnswers = [...answers];
    newAnswers[step] = updated;
    setAnswers(newAnswers);
  };

  const handleSaveResult = (e) => {
    e.preventDefault();
    if (!email) return;
    const leads = JSON.parse(localStorage.getItem('nri-leads') || '[]');
    leads.push({ email, tool: toolSlug, result: result?.status, ts: new Date().toISOString() });
    localStorage.setItem('nri-leads', JSON.stringify(leads));
    setSaved(true);
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); setSaved(false); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* NAV */}
      <nav style={{ background: 'var(--bg-nav)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--accent)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>NT</span>
            </div>
            <span className="font-serif text-lg tracking-wide" style={{ color: 'var(--text-nav)' }}>NRI Tax Suite</span>
          </a>
          <div className="flex gap-3 items-center">
            <a href="/blog" className="text-sm" style={{ color: 'var(--text-muted)' }}>Knowledge Hub</a>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.12)', color: 'var(--accent)', border: '1px solid rgba(196,154,60,0.3)' }}>
              {isDark ? '\u2600' : '\u263D'}
            </button>
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="h-1" style={{ background: 'var(--border)' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">{toolDef.icon}</span>
          <h1 className="font-serif text-3xl mb-2">{toolDef.title}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{toolDef.subtitle}</p>
        </div>

        {/* ── QUESTIONS ── */}
        {!result && (
          <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {toolDef.steps.map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i <= step ? 'var(--accent)' : 'var(--border)' }} />
              ))}
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Question {step + 1} of {totalSteps}</p>

            <h2 className="font-serif text-xl mb-6">{currentStep.q}</h2>

            {currentStep.type === 'select' && (
              <div className="space-y-3">
                {currentStep.options.map(opt => (
                  <button key={opt.value} onClick={() => handleAnswer(opt.value)} className="w-full text-left px-5 py-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.01]" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentStep.type === 'multi' && (
              <div className="space-y-3">
                {currentStep.options.map(opt => {
                  const selected = (answers[step] || []).includes(opt.value);
                  return (
                    <button key={opt.value} onClick={() => handleMultiAnswer(opt.value)} className="w-full text-left px-5 py-4 rounded-xl text-sm transition-all" style={{ background: selected ? 'rgba(196,154,60,0.1)' : 'var(--bg-primary)', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--text-primary)' }}>
                      {selected ? '☑ ' : '☐ '}{opt.label}
                    </button>
                  );
                })}
                <button onClick={() => handleAnswer(answers[step] || [])} className="w-full mt-4 px-5 py-3 rounded-xl text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                  Continue &rarr;
                </button>
              </div>
            )}

            {currentStep.type === 'number' && (
              <div>
                <input type="number" placeholder={currentStep.placeholder} value={answers[step] || ''} onChange={e => { const n = [...answers]; n[step] = e.target.value; setAnswers(n); }} className="w-full px-5 py-4 rounded-xl text-sm mb-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
                <button onClick={() => handleAnswer(answers[step] || '0')} className="w-full px-5 py-3 rounded-xl text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                  Continue &rarr;
                </button>
              </div>
            )}

            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="mt-4 text-sm underline" style={{ color: 'var(--text-muted)' }}>
                &larr; Back
              </button>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {result && (
          <div>
            {/* Result card */}
            <div className="rounded-2xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
              <div className="p-6 text-center" style={{ background: result.color, color: '#fff' }}>
                <div className="text-sm font-bold uppercase tracking-wider mb-1 opacity-80">Your Result</div>
                <div className="text-3xl font-serif">{result.status}</div>
              </div>
              <div className="p-6" style={{ background: 'var(--bg-card)' }}>
                <h2 className="font-serif text-xl mb-3">{result.title}</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{result.summary}</p>

                {result.taxImpact && (
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-primary)', borderLeft: `4px solid ${result.color}` }}>
                    <p className="text-xs font-bold mb-1" style={{ color: result.color }}>TAX IMPACT</p>
                    <p className="text-sm">{result.taxImpact}</p>
                  </div>
                )}

                {/* Comparison table for property calculator */}
                {result.table && (
                  <div className="overflow-x-auto mb-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>
                    <table className="w-full text-sm">
                      <tbody>
                        {result.table.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', fontWeight: j === 0 || i === 0 ? 600 : 400, color: cell?.includes?.('✅') ? result.color : 'var(--text-primary)', background: i === 0 ? 'var(--bg-primary)' : 'transparent' }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Action items */}
                <div className="mb-4">
                  <p className="text-xs font-bold mb-2 uppercase" style={{ color: 'var(--accent)' }}>Recommended Actions</p>
                  <ul className="space-y-2">
                    {result.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: result.color }}>&#x2022;</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lead capture — email result */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: isDark ? 'rgba(196,154,60,0.06)' : 'rgba(196,154,60,0.04)', border: '1px solid rgba(196,154,60,0.2)' }}>
              {saved ? (
                <div className="text-center">
                  <p className="text-lg mb-1">&#x2705;</p>
                  <p className="text-sm font-bold">Result saved! Check your email.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveResult}>
                  <p className="text-sm font-bold mb-1">Email this result to yourself</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Get a detailed PDF with your assessment + personalized next steps.</p>
                  <div className="flex gap-2">
                    <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
                    <button type="submit" className="px-5 py-3 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                      Send &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-nav)' }}>
              <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--text-on-dark)' }}>Need Expert Advice?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>CA Mayank Wadhera and MKW Advisors can help with your specific situation.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="/client" className="px-6 py-3 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                  Free Detailed Assessment &rarr;
                </a>
                <a href="https://wa.me/919667744073" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg text-sm" style={{ border: '1px solid rgba(196,154,60,0.4)', color: 'var(--accent)' }}>
                  WhatsApp Expert
                </a>
              </div>
            </div>

            {/* Reset */}
            <div className="text-center mt-6">
              <button onClick={reset} className="text-sm underline" style={{ color: 'var(--text-muted)' }}>Start Over</button>
              <span className="mx-3" style={{ color: 'var(--text-muted)' }}>|</span>
              <a href="/blog" className="text-sm underline" style={{ color: 'var(--accent)' }}>Back to Knowledge Hub</a>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center mt-8" style={{ color: 'var(--text-muted)' }}>
          This tool provides general guidance only and does not constitute professional tax advice.
          Consult CA Mayank Wadhera at MKW Advisors for advice specific to your situation.
        </p>
      </div>
    </div>
  );
}
