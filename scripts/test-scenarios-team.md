# NRI Tax Suite — Complete Test Scenarios & QA Guide

## Credentials & URLs

| Environment | URL |
|------------|-----|
| **Production** | https://nri-tax-lw2nnr5ga-cacscmamayankwadhera-maxs-projects.vercel.app |
| **Local** | http://localhost:3000 |
| **Supabase** | https://supabase.com/dashboard/project/zihohbpsjxujjuoglera |
| **GitHub** | https://github.com/cacscmamayankwadhera-max/nri-tax-app |

### Test Accounts (create via /signup)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mkwadvisors.com | Test@Admin2026 |
| Preparer | preparer@mkwadvisors.com | Test@Prep2026 |

---

# PART A — PROPERTY SALE SCENARIOS (22 Tests)

## A1: Standard Property Sale — Pre-July 2024 Acquisition (UK NRI)

**Narrative:**
```
I work in London since 2021, came to India for 38 days. Sold a residential flat in Mumbai for ₹80 lakhs, purchased in 2018 for ₹30 lakhs. NRO FD interest ₹1.4 lakhs, NRE savings ₹50,000. UK salary GBP 72,000, UK tax paid.
```

| Check | Expected |
|-------|----------|
| Classification | Amber or Red |
| Option A (20% indexed) | LTCG ₹39,71,429 → Tax ₹8,26,057 |
| Option B (12.5% flat) | LTCG ₹50,00,000 → Tax ₹6,50,000 |
| Better option | B (saves ₹1,76,057) |
| TDS u/s 195 | ~₹18,30,400 (20% of ₹80L + surcharge + cess) |
| Refund | ~₹11,80,400 |
| NRE interest | NOT included in taxable income (Section 10(4) exempt) |
| Foreign salary | NOT taxable (NR) |
| CG DOCX | All above numbers match |

## A2: Standard Property Sale — Post-July 2024 Acquisition

**Narrative:**
```
I work in Dubai. Bought a flat in Gurgaon in September 2024 for ₹1.2 crore. Sold it in February 2026 for ₹1.5 crore.
```

| Check | Expected |
|-------|----------|
| Only 12.5% flat rate | No dual option (acquired post-July 2024) |
| Holding period | ~17 months → Check if STCG (<24 months) |
| If STCG | Slab rates, NOT 12.5% |
| AI should flag | "Property held less than 24 months — STCG at slab rates" |

## A3: High-Value Property (Surcharge Kicks In)

**Narrative:**
```
UK NRI. Sold flat in South Mumbai for ₹3.5 crore, purchased in 2012 for ₹80 lakhs.
```

| Check | Expected |
|-------|----------|
| Option B LTCG | ₹2,70,00,000 |
| Surcharge | 15% (LTCG > ₹1Cr, capped) |
| TDS u/s 195 | 20% of ₹3.5Cr × 1.15 × 1.04 = ~₹83,72,000 |
| Section 54 | Should be flagged prominently |
| Section 54EC | ₹50L bond cap → saves significant amount |

## A4: Inherited Property

**Narrative:**
```
I work in Toronto since 2015. My father passed away in 2023. I inherited his flat in Pune — he bought it in 2005 for ₹12 lakhs. I sold it for ₹85 lakhs.
```

| Check | Expected |
|-------|----------|
| Cost basis | Father's cost: ₹12L |
| Indexation from | FY 2005-06 (CII = 117) |
| Option A indexed cost | ₹12L × 376/117 = ₹38,56,410 |
| Option A LTCG | ₹46,43,590 → Option A BETTER here |
| AI note | "Inherited property: cost to previous owner" |

## A5: Gifted Property

**Narrative:**
```
Singapore NRI. Received a plot as gift from uncle in 2020. Uncle purchased it in 2010 for ₹15 lakhs. I sold it for ₹60 lakhs.
```

| Check | Expected |
|-------|----------|
| Cost basis | Uncle's cost: ₹15L |
| Indexation from | FY 2010-11 (CII = 167) |
| Same as inherited | Gift = same cost basis rules |

## A6: Plot/Land Sale (Not Residential — Section 54F)

**Narrative:**
```
US NRI. Sold an agricultural plot (urban area) in Bangalore for ₹1.2 crore, purchased in 2016 for ₹35 lakhs. Planning to buy a flat for ₹80 lakhs.
```

| Check | Expected |
|-------|----------|
| Section 54 | NOT applicable (not residential property) |
| Section 54F | Applicable — proportional exemption |
| 54F exemption | LTCG × (₹80L / ₹1.2Cr) = proportional |
| AI should note | "Non-residential asset — Section 54F, not Section 54" |

## A7: Commercial Property Sale

**Narrative:**
```
UAE NRI. Sold a shop in Ahmedabad for ₹45 lakhs, purchased in 2014 for ₹18 lakhs.
```

| Check | Expected |
|-------|----------|
| Section 54 | NOT applicable |
| Section 54F | Applicable if buying residential house |
| CG computation | Same dual option as residential |

## A8: Multiple Property Sales

**Narrative:**
```
UK NRI. Sold two properties this year — (1) Flat in Delhi for ₹1 crore, bought 2015 for ₹40 lakhs. (2) Plot in Noida for ₹50 lakhs, bought 2019 for ₹25 lakhs.
```

| Check | Expected |
|-------|----------|
| Separate CG for each | Both computed independently |
| Section 54 | Can use for BOTH if buying 1 new house (but exemption on only ONE) |
| AI should flag | Multiple transactions need separate treatment |

## A9: Property Held Less Than 24 Months (STCG)

**Narrative:**
```
Singapore NRI. Bought flat in Hyderabad in April 2024, sold in January 2026 for ₹70 lakhs. Purchase cost ₹55 lakhs.
```

| Check | Expected |
|-------|----------|
| Holding | ~21 months → STCG |
| Tax rate | Slab rates (NOT 12.5%) |
| TDS | 30% + surcharge + cess (higher for STCG NRI) |
| Section 54 | NOT available for STCG |

## A10: Joint Property Sale

**Narrative:**
```
UK NRI. Sold jointly owned flat with spouse — 60% my share, 40% spouse. Total sale ₹90 lakhs, purchased 2017 for ₹35 lakhs.
```

| Check | Expected |
|-------|----------|
| My CG | 60% of total LTCG |
| TDS | On full consideration, but proportional to share |
| AI should note | "Joint property — each co-owner computes separately" |

## A11: Property with Improvement Cost

**Narrative:**
```
UK NRI. Sold flat in Pune for ₹75 lakhs, purchased 2016 for ₹30 lakhs. Spent ₹8 lakhs on renovation in 2020.
```

| Check | Expected |
|-------|----------|
| Improvement cost | ₹8L indexed from 2020-21 |
| Option A | Indexed (purchase + improvement) |
| Option B | ₹75L - ₹30L - ₹8L = ₹37L LTCG |

## A12: Section 54 — House Already Purchased

**Narrative:**
```
UK NRI. Sold flat for ₹80 lakhs (₹30L cost, 2018). Already bought new flat for ₹45 lakhs.
```

| Check | Expected |
|-------|----------|
| Section 54 exempt | min(LTCG, ₹45L, ₹10Cr) = ₹45L |
| Taxable after 54 | ₹5L |
| Tax | ₹5L × 12.5% + cess = ₹65,000 |

## A13: Section 54 — Planning to Buy

| Check | Expected |
|-------|----------|
| AI advice | "Must purchase within 2 years or construct within 3 years" |
| CGAS flag | "If not bought before ITR due date, deposit in CGAS" |

## A14: Section 54 — ₹10Cr Cap Hit

**Narrative:**
```
Sold property for ₹15 crore, LTCG ₹12 crore. Bought new house for ₹14 crore.
```

| Check | Expected |
|-------|----------|
| Exempt | Capped at ₹10Cr (not ₹12Cr) |
| Taxable | ₹2Cr |

## A15: Section 54EC Bonds

| Check | Expected |
|-------|----------|
| Max investment | ₹50L in NHAI/REC bonds |
| Lock-in | 5 years |
| Timeline | Within 6 months of sale |
| Tax saved | LTCG up to ₹50L exempt |

## A16: Section 197 Lower TDS Certificate

| Check | Expected |
|-------|----------|
| AI should flag | "Apply for Section 197 lower TDS certificate before sale to avoid cash flow impact" |
| Saving | TDS at actual tax rate instead of 20% |

## A17: Form 15CA/15CB for Repatriation

| Check | Expected |
|-------|----------|
| AI should flag | "Form 15CA/15CB required for remitting sale proceeds abroad" |
| FEMA limit | USD 1 million per FY |

## A18: Under-Construction Property

**Narrative:**
```
Sold an under-construction flat in Noida.
```

| Check | Expected |
|-------|----------|
| Section 54 | NOT available (not a completed "residential house") |
| AI should flag | "Under-construction — Section 54 not applicable until completion" |

## A19: Agricultural Land (Rural — Exempt)

| Check | Expected |
|-------|----------|
| If rural | Exempt from capital gains entirely |
| AI should ask | "Is the land within municipality limits?" |

## A20: Agricultural Land (Urban — Taxable)

| Check | Expected |
|-------|----------|
| If within municipal limits | Taxable as regular CG |

## A21: Property Sale — Advance Tax Check

| Check | Expected |
|-------|----------|
| If sale in Q1 (Apr-Jun) | 15% by 15 June |
| If sale in Q2 (Jul-Sep) | 45% cumulative by 15 September |
| Interest 234B/234C | Flagged if not paid on time |

## A22: Property Sale — Both Spouses NRI

| Check | Expected |
|-------|----------|
| Each files separately | Separate CG per ownership % |
| Each gets TDS credit | Proportional to share |

---

# PART B — RENTAL INCOME SCENARIOS (6 Tests)

## B1: Single Rental Property

**Narrative:**
```
Singapore NRI. Flat in Chennai rented at ₹35,000/month. No home loan.
```

| Check | Expected |
|-------|----------|
| Gross rent | ₹4,20,000 |
| 30% SD | ₹1,26,000 |
| Taxable | ₹2,94,000 |

## B2: Rental with Home Loan (Let-Out — No Cap)

**Narrative:**
```
Same as B1 but home loan interest ₹4 lakhs/year.
```

| Check | Expected |
|-------|----------|
| Interest deduction | ₹4,00,000 (NO CAP for let-out) |
| Taxable | ₹4,20,000 - ₹1,26,000 - ₹4,00,000 = -₹1,06,000 (LOSS) |
| Loss set-off | Up to ₹2L against other income |

## B3: Self-Occupied Property (No Rent)

| Check | Expected |
|-------|----------|
| Gross rent | ₹0 (self-occupied) |
| Interest cap | ₹2,00,000 maximum |
| NAV | ₹0, but interest creates loss |

## B4: Deemed Let-Out (Multiple Properties)

**Narrative:**
```
NRI owns 3 flats. One in Mumbai (self-occupied when visiting), one in Pune (rented ₹25K/month), one in Goa (vacant).
```

| Check | Expected |
|-------|----------|
| Mumbai | Self-occupied (₹2L interest cap) |
| Pune | Let-out (actual rent, no interest cap) |
| Goa | Deemed let-out (notional rent must be computed) |
| AI should flag | "Vacant property deemed let-out — compute expected rent" |

## B5: Rental with Municipal Tax

| Check | Expected |
|-------|----------|
| NAV | Gross rent MINUS municipal tax paid |
| 30% SD | Applied on NAV (not gross rent) |

## B6: Unrealized Rent / Arrears

| Check | Expected |
|-------|----------|
| AI should flag | "Section 25A — unrealized rent can be excluded from HP income" |

---

# PART C — INVESTMENT INCOME SCENARIOS (12 Tests)

## C1: NRO Savings + FD Interest

**Narrative:**
```
UAE NRI. NRO savings interest ₹2 lakhs. FD interest ₹1.5 lakhs.
```

| Check | Expected |
|-------|----------|
| Total taxable | ₹3,50,000 |
| TDS at 30% | ₹1,05,000 |
| DTAA (UAE) | Limited application (no personal tax in UAE) |

## C2: NRE Interest (Tax-Free)

| Check | Expected |
|-------|----------|
| Tax | ₹0 (exempt under Section 10(4)) |
| Should NOT appear | In taxable income computation |

## C3: Both NRO + NRE Interest

| Check | Expected |
|-------|----------|
| Only NRO taxed | NRE excluded |
| Interest type dropdown | Correctly distinguishes the two |

## C4: Listed Shares — LTCG (Above ₹1.25L Threshold)

**Narrative:**
```
US NRI. Sold listed shares — LTCG ₹5 lakhs.
```

| Check | Expected |
|-------|----------|
| Exemption | ₹1,25,000 (Section 112A threshold) |
| Taxable | ₹3,75,000 |
| Tax rate | 12.5% |
| Tax | ₹46,875 + cess |

## C5: Listed Shares — LTCG (Below Threshold)

**Narrative:**
```
LTCG on shares only ₹1 lakh.
```

| Check | Expected |
|-------|----------|
| Tax | ₹0 (below ₹1.25L exemption) |

## C6: Listed Shares — STCG

**Narrative:**
```
Sold listed shares held 3 months — STCG ₹2 lakhs.
```

| Check | Expected |
|-------|----------|
| Tax rate | 20% (Section 111A) |
| Tax | ₹40,000 + cess |

## C7: Mutual Funds — Equity (LTCG)

| Check | Expected |
|-------|----------|
| Holding period for LTCG | >12 months |
| Rate | 12.5% above ₹1.25L (Section 112A) |
| Same as listed shares | Yes |

## C8: Mutual Funds — Debt (LTCG)

| Check | Expected |
|-------|----------|
| Holding period for LTCG | >24 months (debt MF) |
| Rate | 12.5% (Section 112, no ₹1.25L exemption) |
| AI should note | "Debt MF: different holding period from equity MF" |

## C9: Unlisted Shares — LTCG

**Narrative:**
```
Sold unlisted startup shares — held 30 months, gain ₹7 lakhs.
```

| Check | Expected |
|-------|----------|
| Rate | 12.5% (Section 112) |
| NO ₹1.25L exemption | That's only for listed (Section 112A) |
| Tax | ₹87,500 + cess |

## C10: Dividends from Indian Companies

**Narrative:**
```
Received dividends of ₹2 lakhs from TCS and Infosys.
```

| Check | Expected |
|-------|----------|
| Tax | Slab rates (added to Other Sources) |
| TDS | 20% for NRI under Section 195 |
| DTAA | May reduce TDS to 10-15% |

## C11: ESOP/RSU — Full Lifecycle

**Narrative:**
```
US NRI. ESOP from Indian company — 500 shares, exercise price ₹200, FMV at exercise ₹800. Sold at ₹1200 after 14 months.
```

| Check | Expected |
|-------|----------|
| Perquisite (salary head) | 500 × (₹800-₹200) = ₹3,00,000 |
| CG (from FMV to sale) | 500 × (₹1200-₹800) = ₹2,00,000 |
| CG type | LTCG (14 months > 12) |
| CG rate | 12.5% above ₹1.25L (Section 112A) |
| Two Form 16 entries | Perquisite from employer + CG separately |

## C12: Crypto / Virtual Digital Assets

**Narrative:**
```
Germany NRI. Traded crypto — total sales ₹8 lakhs, total cost ₹5 lakhs.
```

| Check | Expected |
|-------|----------|
| Gain | ₹3,00,000 |
| Tax | 30% = ₹90,000 + cess ₹3,600 = ₹93,600 |
| TDS (Section 194S) | 1% of sales = ₹8,000 |
| NO loss set-off | Even if loss, cannot set off against anything |
| NO deductions | Only cost of acquisition allowed |

---

# PART D — SALARY & FOREIGN INCOME SCENARIOS (6 Tests)

## D1: Foreign Salary Only (Standard NRI)

| Check | Expected |
|-------|----------|
| Indian tax | ₹0 (NR — foreign salary not taxable) |
| FTC | NOT applicable (income not taxed in India) |

## D2: Indian Salary (Partial Year)

**Narrative:**
```
Worked in India Jan-Mar 2026, then moved to UK. Indian salary ₹6 lakhs for 3 months.
```

| Check | Expected |
|-------|----------|
| Taxable | ₹6L (accrued in India) |
| Standard deduction | ₹75,000 (new regime) |
| Form 16 | Should be available from Indian employer |

## D3: Both Indian + Foreign Salary

| Check | Expected |
|-------|----------|
| Indian salary | Taxable |
| Foreign salary | NOT taxable (NR) |
| AI should clarify | "Only Indian-sourced salary is taxable for Non-Residents" |

## D4: Foreign Pension (NR)

| Check | Expected |
|-------|----------|
| Tax | NOT taxable if accrued outside India and NR status |

## D5: Indian Pension

| Check | Expected |
|-------|----------|
| Tax | Slab rates, TDS under 194A |

## D6: Royalty / Fees for Technical Services

| Check | Expected |
|-------|----------|
| Rate | 10% under Section 115A for NRI |
| AI should note | "DTAA may provide lower rate" |

---

# PART E — DTAA / FTC SCENARIOS (8 Tests)

## E1: UK NRI — FTC Not Applicable

| Check | Expected |
|-------|----------|
| Foreign salary | Not taxable in India → No FTC needed |
| AI must clarify | "FTC applies only when same income taxed in BOTH countries" |

## E2: US NRI — DTAA Interest Rate

| Check | Expected |
|-------|----------|
| NRO interest TDS | Can be reduced to 15% under India-US DTAA |
| Requirement | TRC from US + Form 10F |

## E3: UAE NRI — No Personal Tax

| Check | Expected |
|-------|----------|
| DTAA credit | Limited (UAE has no personal income tax) |
| Primary use | TRC for confirming NR status |

## E4: Singapore NRI

| Check | Expected |
|-------|----------|
| Interest rate under DTAA | 15% |
| Form 67 | MANDATORY if claiming FTC |

## E5: Canada NRI

| Check | Expected |
|-------|----------|
| Capital gains | India has first right to tax |
| Canada credits Indian tax | Under DTAA |

## E6: Australia NRI

| Check | Expected |
|-------|----------|
| Interest DTAA rate | 15% |
| Property CG | India taxes, Australia provides credit |

## E7: Non-DTAA Country (Section 91)

| Check | Expected |
|-------|----------|
| Unilateral relief | Section 91 — deduction of foreign tax paid |
| More restrictive | Than DTAA relief under Section 90 |

## E8: Form 67 Not Filed

| Check | Expected |
|-------|----------|
| Pre-filing should flag | "Form 67 MANDATORY for FTC claim — non-filing = FTC denied" |

---

# PART F — RESIDENCY SCENARIOS (6 Tests)

## F1: Clear NR (< 60 Days)

**Narrative:** UK NRI, 38 days in India

| Check | Expected |
|-------|----------|
| Status | Non-Resident (High Confidence) |

## F2: Borderline NR (60-182 Days)

**Narrative:** NRI with 120 days in India, Indian income ₹20L

| Check | Expected |
|-------|----------|
| Modified 60-day rule | 120 days + income > ₹15L → Could be Resident |
| AI should flag | "Borderline — verify exact stay days with passport stamps" |

## F3: Clearly Resident (> 182 Days)

**Narrative:** Was abroad, returned to India, stayed 200 days

| Check | Expected |
|-------|----------|
| Status | Resident |
| Check RNOR | Was NRI in prior years? |

## F4: Returning NRI — RNOR

**Narrative:** Returned after 12 years abroad, 200 days this FY

| Check | Expected |
|-------|----------|
| Status | Resident but RNOR |
| RNOR test | NRI in ≥9 of preceding 10 years → RNOR |
| Tax impact | Foreign income NOT taxable |
| Schedule FA | MANDATORY (resident with foreign assets) |

## F5: Deemed Resident

**Narrative:** Indian citizen, not resident anywhere, Indian income ₹20L

| Check | Expected |
|-------|----------|
| Section 6(1A) | Indian income > ₹15L + not tax resident elsewhere → Deemed Resident |
| Tax impact | GLOBAL income taxable (treated as Ordinary Resident) |
| AI should flag | "Deemed resident — significantly higher tax exposure" |

## F6: OCI / PIO Cardholder

| Check | Expected |
|-------|----------|
| Tax treatment | Same as NRI for income tax |
| FEMA | Different rules for property purchase |

---

# PART G — COMPLIANCE & SPECIAL SCENARIOS (10 Tests)

## G1: Schedule AL (Assets > ₹50L Income)

| Check | Expected |
|-------|----------|
| Trigger | Total income > ₹50L |
| Pre-filing flag | "Schedule AL mandatory" |

## G2: Advance Tax — Property Sale in Q1

| Check | Expected |
|-------|----------|
| 15 June installment | 15% of balance payable |
| Interest 234C | Applies if not paid on time |

## G3: Belated Return (After Due Date)

| Check | Expected |
|-------|----------|
| Consequence | No loss carry-forward |
| Interest | 234A (late filing) + 234B (non-payment) |
| AI should flag | Clearly state consequences |

## G4: Old Regime vs New Regime Comparison

**Narrative:** NRI with ₹8L NRO interest + ₹1.5L Section 80C investments

| Check | Expected |
|-------|----------|
| New regime tax | Slab on ₹8L (no deductions except ₹75K SD if salaried) |
| Old regime tax | Slab on (₹8L - ₹1.5L) with 80C |
| AI should recommend | Whichever is lower |

## G5: Loss Set-Off — HP Loss Against Interest

| Check | Expected |
|-------|----------|
| HP loss | Up to ₹2L set off against other income |
| Excess | Carry forward 8 years |
| CG loss | Cannot set off against other heads |

## G6: Notice Under 148A (Reassessment)

| Check | Expected |
|-------|----------|
| Pre-filing flag | "ESCALATION REQUIRED — reassessment proceedings" |
| Action | Partner review before filing current year |

## G7: Black Money Act — Undisclosed Foreign Assets

| Check | Expected |
|-------|----------|
| Pre-filing flag | "ESCALATION REQUIRED — undisclosed foreign assets" |
| Penalty | 30% tax + 90% penalty on undisclosed income |

## G8: Transfer Pricing (Related Party Transactions)

| Check | Expected |
|-------|----------|
| Pre-filing flag | "ESCALATION REQUIRED — TP provisions may apply" |

## G9: Multiple Year Non-Filing

**Narrative:** NRI hasn't filed for 3 years

| Check | Expected |
|-------|----------|
| Pre-filing flag | "ESCALATION — assess exposure before filing current year" |
| Risk | Potential notices, penalties, interest accumulation |

## G10: Revised Return

| Check | Expected |
|-------|----------|
| Timeline | Within 31 December of the AY |
| AI should note | Original return must have been filed first |

---

# PART H — PLATFORM FUNCTIONALITY TESTS (16 Tests)

## H1: AI Auto-Fill Accuracy

| Input | Check |
|-------|-------|
| "Sold flat in Mumbai for 80 lakhs bought 2018 for 30 lakhs" | salePrice=8000000, purchaseCost=3000000 |
| "I work in London" | country=UK or United Kingdom |
| "NRO interest 1.4 lakhs" | nroInterest=140000 |
| "UK salary GBP 72,000" | foreignSalary=true |
| Empty narrative | Button disabled / no action |
| Very long narrative (500+ words) | Should still parse within 10 seconds |

## H2: Classification Scoring

| Inputs | Expected Score | Classification |
|--------|---------------|----------------|
| Interest only | ≤2 | Green |
| Property sale + foreign tax | 5-6 | Amber/Red |
| Property + ESOP + notices + business | 10+ | Red |
| No stay days + property + foreign tax | 6+ | Red |

## H3: DOCX Deliverable Verification

| Deliverable | Available After | Check |
|-------------|----------------|-------|
| CG Computation Sheet | CG module done | Numbers match compute.js |
| Advisory Memo | Memo module done | References verified computation numbers |
| Tax Position Report | Income + Pricing done | Income heads correct |
| Computation of Total Income | Income + CG done | All heads, tax, TDS, refund correct |
| Scope & Fee Note | Pricing done | Tier matches classification |

## H4: Theme Toggle

| Page | Toggle Works | Persists |
|------|-------------|---------|
| `/` Landing | ✓/✗ | ✓/✗ |
| `/client` | ✓/✗ | ✓/✗ |
| `/login` | ✓/✗ | ✓/✗ |
| `/signup` | ✓/✗ | ✓/✗ |
| `/dashboard` | ✓/✗ | ✓/✗ |
| `/portal` | ✓/✗ | ✓/✗ |

## H5: Portal Flow

| Step | Check |
|------|-------|
| Submit intake | Tracking code shown (24-char hex) |
| Open portal link | Case found, timeline shows |
| Stage 1 (intake) | Shown correctly |
| Team changes to "Review" | Portal updates to Stage 3 |
| Team changes to "Filed" | Portal shows Stage 6 |
| Invalid token | "Case not found" message |

## H6: Authentication

| Test | Expected |
|------|----------|
| Access `/dashboard` without login | Redirects to `/login` |
| Signup with weak password (<6 chars) | Error message |
| Login with wrong password | Error message |
| Login with correct credentials | Redirects to `/dashboard` |

## H7: API Security

| Test | Expected |
|------|----------|
| Call `/api/auto-run` without secret | 401 Unauthorized |
| Call `/api/ai` from different origin (production) | 401 Unauthorized |
| Submit >5 cases in 1 minute | 429 Too Many Requests |
| Submit >20 AI calls in 1 minute | 429 Too Many Requests |

## H8: Health Check

| Check | Expected |
|-------|----------|
| `/api/health` | `{"status":"ok","supabase":true,"anthropic":true,"internalSecret":true}` |

## H9: Error Handling

| Test | Expected |
|------|----------|
| AI parse with gibberish | "Could not parse" message, form stays usable |
| DOCX with missing formData | DOCX generates with "—" placeholders |
| Module run with invalid API key | Error shown in module output area |
| Portal with 5-char token | "Invalid case reference" (min 10 chars) |

## H10: Mobile Responsiveness

| Page | Check on Mobile |
|------|----------------|
| Landing | Sections stack, readable |
| Client wizard | Form fields usable, buttons tappable |
| Portal | Timeline readable, contact bar accessible |
| Login/Signup | Form centered, input fields full width |

## H11: WhatsApp & Email Links

| Page | WhatsApp opens | Email opens | Number correct |
|------|---------------|-------------|----------------|
| `/client` (post-submit) | ✓/✗ | ✓/✗ | +91-96677 44073 |
| `/portal` contact bar | ✓/✗ | ✓/✗ | +91-96677 44073 |

## H12: Legal Pages

| Page | Loads | Has nav | Has footer | Content complete |
|------|-------|---------|-----------|-----------------|
| `/terms` | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| `/privacy` | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |

## H13: FY Selector

| Test | Expected |
|------|----------|
| Select FY 2025-26 | AY 2026-27, CII 376 |
| Select FY 2024-25 | AY 2025-26, CII 363 |
| CG computed with correct CII | Numbers change per FY |

## H14: Dashboard Module Execution

| Module | Runs | Output Structured | References Verified Numbers |
|--------|------|-------------------|---------------------------|
| Residency | ✓/✗ | ✓/✗ | N/A (qualitative) |
| Income Map | ✓/✗ | ✓/✗ | N/A (qualitative) |
| Scope & Fee | ✓/✗ | ✓/✗ | N/A (internal) |
| AIS Recon | ✓/✗ | ✓/✗ | N/A (qualitative) |
| Form Select | ✓/✗ | ✓/✗ | N/A (qualitative) |
| Capital Gains | ✓/✗ | ✓/✗ | ✓/✗ (must match compute.js) |
| DTAA/FTC | ✓/✗ | ✓/✗ | N/A (qualitative) |
| Pre-Filing | ✓/✗ | ✓/✗ | N/A (quality gate) |
| Advisory Memo | ✓/✗ | ✓/✗ | ✓/✗ (must match compute.js) |

## H15: Status Workflow

| Status Change | Portal Stage | Dashboard Shows |
|--------------|-------------|----------------|
| intake | 1 | "Intake Received" |
| in_progress | 2 | "Analysis Running" |
| review | 3 | "Under Review" |
| findings_ready | 4 | "Findings Ready" |
| filing | 5 | "Filing in Progress" |
| filed | 6 | "Filed" |

## H16: Print Function

| Test | Expected |
|------|----------|
| Click Print on CG preview | Print window opens with formatted content |
| Click Print on Memo preview | Print window opens with formatted content |

---

# PART I — COMPUTATION VERIFICATION CHEAT SHEET

## Property CG (₹80L sale, ₹30L purchase, FY 2018-19)
```
CII 2018-19 = 280, CII 2025-26 = 376
Option A: Indexed = 30L × 376/280 = ₹40,28,571 → LTCG = ₹39,71,429 → Tax = ₹8,26,057
Option B: LTCG = ₹50,00,000 → Tax = ₹6,50,000
Better: B (saves ₹1,76,057)
TDS: 80L × 20% × 1.10 × 1.04 = ₹18,30,400
Refund: ₹11,80,400
```

## House Property (₹25K/month)
```
Gross = ₹3,00,000 | SD = ₹90,000 | Taxable = ₹2,10,000
```

## Equity CG
```
STCG (Section 111A): 20% flat + cess
LTCG (Section 112A): 12.5% above ₹1.25L + cess
Unlisted LTCG (Section 112): 12.5% full (no ₹1.25L exemption) + cess
```

## Crypto
```
30% flat + 4% cess. No deductions. 1% TDS on sales (Section 194S).
```

## New Regime Slabs
```
₹0-4L: 0% | ₹4-8L: 5% | ₹8-12L: 10% | ₹12-16L: 15% | ₹16-20L: 20% | ₹20-24L: 25% | >₹24L: 30%
```

## TDS Rates (NRI)
```
Property sale (Section 195): 20% of sale consideration + surcharge + cess
NRO interest (Section 195): 30% + surcharge + cess
Dividends (Section 195): 20% + surcharge + cess
```

---

# Bug Report Template

```
SCENARIO: [A1/B2/C5/etc.]
STEP: [which step]
EXPECTED: [what should happen]
ACTUAL: [what actually happened]
SCREENSHOT: [attach]
SEVERITY: Critical / High / Medium / Low
ENVIRONMENT: Local / Production
BROWSER: Chrome / Safari / Firefox
```

---

# Sign-Off

- [ ] Part A (22 property tests) — all critical/high severity bugs fixed
- [ ] Part B (6 rental tests) — verified
- [ ] Part C (12 investment tests) — verified
- [ ] Part D (6 salary/foreign tests) — verified
- [ ] Part E (8 DTAA tests) — verified
- [ ] Part F (6 residency tests) — verified
- [ ] Part G (10 compliance tests) — verified
- [ ] Part H (16 platform tests) — verified
- [ ] Part I (computations verified against cheat sheet)

**Total: 92 test scenarios**

**Tested by:** _______________
**Date:** _______________
**Version:** _______________
**Result:** PASS / FAIL
