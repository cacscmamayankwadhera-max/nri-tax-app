# NRI Tax Suite — Team Testing Guide

## Credentials & URLs

| Environment | URL | Notes |
|------------|-----|-------|
| **Production** | https://nri-tax-lw2nnr5ga-cacscmamayankwadhera-maxs-projects.vercel.app | Auto-deploys from GitHub |
| **Local** | http://localhost:3000 | Run `npm run dev` |
| **Supabase** | https://supabase.com/dashboard/project/zihohbpsjxujjuoglera | Database admin |
| **GitHub** | https://github.com/cacscmamayankwadhera-max/nri-tax-app | Source code |

### Test Accounts

Create these accounts via `/signup` before testing:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@mkwadvisors.com | Test@Admin2026 | Full dashboard access |
| Preparer | preparer@mkwadvisors.com | Test@Prep2026 | Case processing |

> **Note:** After creating accounts, confirm via email link in inbox. Supabase sends confirmation emails.

---

## Test Scenario 1: UK NRI — Property Sale (Most Common Case)

**Client Profile:** Rajesh Mehta, IT Manager, London, UK since 2021

### Step 1: Client Intake
1. Open `/client`
2. In the AI auto-fill box, type:
   ```
   I work in London since 2021. I came to India for about 38 days this year. I sold a residential flat in Mumbai for ₹80 lakhs, purchased in 2018 for ₹30 lakhs. I also have a flat in Pune rented at ₹25,000/month. NRO FD interest about ₹1.4 lakhs, NRE savings interest ₹50,000. UK salary GBP 72,000, UK tax paid. Want to know about property tax savings and foreign tax credit.
   ```
3. Click "Auto-Fill My Details"

**Expected Results:**
| Field | Expected Value |
|-------|---------------|
| Country | United Kingdom (or UK) |
| Sale Price | 8000000 |
| Purchase Cost | 3000000 |
| Foreign Salary | true |
| Rent | true |
| Interest | true |

4. Fill any missing fields manually (name, stay days = 38)
5. Complete all 5 steps
6. On Step 5 (Review):
   - Classification should be: **Amber or Red**
   - CG Preview should show: **Option B saves money**

### Step 2: Submit & Check Diagnostic
7. Click "Get My Tax Diagnostic"

**Expected Diagnostic:**
| Item | Expected |
|------|----------|
| Classification | Amber or Red |
| Option B (12.5%) tax | ₹6,50,000 |
| TDS u/s 195 (20%) | ~₹18,30,400 |
| Potential refund | ~₹11,80,400 |
| Tracking code | 24-character hex string |
| WhatsApp link | Opens wa.me/919667744073 |

### Step 3: Team Dashboard
8. Login at `/login` with admin credentials
9. Check dashboard — new case should appear
10. Click the case → sidebar shows 10 modules

**If auto-run worked (may timeout on Hobby plan):**
- All 9 modules should show ✓ checkmarks
- Status should be "review"

**If auto-run didn't complete:**
- Click "Run Residency" → wait for output
- Run at least: Residency, Income Map, Capital Gains, Advisory Memo

### Step 4: Verify Module Outputs
11. **Residency module** should say: Non-Resident (High Confidence), ~38 days
12. **Income Map** should identify: HP (rental), CG (property), Other Sources (NRO interest), Foreign salary (NOT taxable)
13. **Capital Gains** should reference VERIFIED COMPUTATION numbers:
    - Option A: 20% indexed
    - Option B: 12.5% flat
    - Should recommend Option B
    - Should mention TDS refund
    - Should mention Section 54, 54EC
14. **DTAA/FTC** should clarify: Foreign salary NOT taxable for NR, FTC not applicable

### Step 5: Download Deliverables
15. Click "CG Computation Sheet" → Download DOCX

**Verify in Word document:**
| Item | Expected Value |
|------|---------------|
| Option B LTCG | ₹50,00,000 |
| Option B Tax (12.5% + cess) | ₹6,50,000 |
| TDS u/s 195 | ~₹18,30,400 |
| TDS Refund | ~₹11,80,400 |
| Section 54EC savings | ₹6,50,000 (if full ₹50L invested) |
| Firm name | MKW Advisors |

16. Download "Computation of Total Income" DOCX

**Verify:**
| Head | Expected |
|------|----------|
| House Property | ₹2,10,000 (₹3L rent - 30% SD) |
| Capital Gains | ₹50,00,000 (Option B) |
| Other Sources | ₹2,25,000 (₹1.4L NRO + ₹85K FD) |
| Foreign salary | NOT included (NR exempt) |
| NRE interest | NOT included (Section 10(4) exempt) |

### Step 6: Client Portal
17. Copy portal link from dashboard sidebar
18. Open in incognito browser
19. Should show case timeline with current stage
20. Change status in dashboard to "Findings Ready" → portal should update

---

## Test Scenario 2: UAE NRI — Simple Interest Income (Green Case)

**Client Profile:** Ahmed Khan, Engineer, Dubai, UAE

### Intake
```
I work in Dubai since 2019. I came to India for about 20 days for a family wedding. I have an NRO savings account with about ₹2 lakhs interest. FD with ICICI about ₹1.5 lakhs interest. No property transactions. UAE salary about AED 300,000. No Indian salary.
```

**Expected:**
| Item | Expected |
|------|----------|
| Classification | **Green** (simple, interest only) |
| Tax on interest | Slab rate on ₹3.5L (below ₹4L threshold in new regime → NIL tax, BUT NRI doesn't get 87A → tax applies) |
| TDS on NRO interest | 30% = ₹1,05,000 |
| DTAA note | UAE has no personal income tax — DTAA credit mechanism limited |
| FTC | NOT applicable (NR foreign salary not taxable in India) |

---

## Test Scenario 3: US NRI — ESOP/RSU + Property Sale (Red Case)

**Client Profile:** Priya Sharma, VP Engineering, San Francisco, USA

### Intake
```
I work in San Francisco since 2017. Visited India for 15 days this year. I sold a plot in Bangalore for ₹1.5 crore, purchased in 2015 for ₹40 lakhs. I have ESOPs from my Indian company vested in 2022 — FMV at vesting was ₹800 per share, exercise price ₹200, sold 500 shares at ₹1200 each. NRO interest ₹3 lakhs. US salary about USD 280,000, US tax paid. Indian assets above ₹1 crore.
```

**Expected:**
| Item | Expected |
|------|----------|
| Classification | **Red** (property + ESOP + foreign tax + assets >1Cr) |
| Property CG Option B | ₹1,10,00,000 LTCG |
| TDS on property | ~20% of ₹1.5Cr = significant amount |
| ESOP perquisite | 500 × (800-200) = ₹3,00,000 (salary head) |
| ESOP CG | 500 × (1200-800) = ₹2,00,000 LTCG (Section 112A) |
| Schedule AL | REQUIRED (income > ₹50L) |
| DTAA | US treaty — 15% on interest |
| Pre-filing should flag | Section 54/54F planning, advance tax, Form 15CA/15CB |

---

## Test Scenario 4: Singapore NRI — Rental Income Only (Amber Case)

**Client Profile:** Vikram Iyer, Banker, Singapore

### Intake
```
I work in Singapore since 2020. Came to India for about 45 days. I have a flat in Chennai rented at ₹35,000/month. Home loan EMI with ₹4 lakh interest component per year. NRO FD interest about ₹1.8 lakhs. Singapore salary SGD 180,000. No property sale this year.
```

**Expected:**
| Item | Expected |
|------|----------|
| Classification | **Amber** (multiple income heads + foreign tax) |
| HP gross rent | ₹4,20,000/year |
| HP 30% SD | ₹1,26,000 |
| HP loan interest | ₹4,00,000 (NO CAP for let-out property) |
| HP taxable | ₹4,20,000 - ₹1,26,000 - ₹4,00,000 = negative (loss) |
| HP loss set-off | Up to ₹2,00,000 against other income |
| NRO interest TDS | 30% of ₹1.8L = ₹54,000 |
| Singapore DTAA | 15% on interest |

---

## Test Scenario 5: Returning NRI (RNOR)

**Client Profile:** Suresh Nair, returning to India after 12 years in UK

### Intake
```
I returned to India permanently in June 2025 after living in UK for 12 years. I was in India for about 200 days this FY. I still have a UK bank account with interest of GBP 5,000. I sold my UK property (not Indian property). UK pension income of GBP 15,000. Indian FD interest ₹2 lakhs. I had been filing ITR as NRI in prior years.
```

**Expected:**
| Item | Expected |
|------|----------|
| Residency | RESIDENT but likely RNOR (NRI in 9 of 10 preceding years) |
| RNOR significance | Foreign income (UK interest, UK pension) NOT taxable in India |
| Indian FD interest | Taxable at slab rate |
| UK property sale | NOT taxable if RNOR (foreign asset, income accrued outside India) |
| Schedule FA | MANDATORY (resident with foreign assets) |
| Residency module should flag | 200 days → Resident. Check RNOR: was NRI in ≥9 of preceding 10 FYs? |

---

## Test Scenario 6: Inherited Property Sale

**Client Profile:** Kavita Desai, Canada, inherited flat from father

### Intake
```
I work in Toronto since 2015. My father passed away in 2023 and I inherited his flat in Pune. He bought it in 2005 for ₹12 lakhs. I sold it this year for ₹85 lakhs. I have NRO interest of ₹1 lakh. Canadian salary CAD 120,000.
```

**Expected:**
| Item | Expected |
|------|----------|
| Classification | **Red** (property sale + high value) |
| Acquisition type | Inherited — use father's cost (₹12L) and acquisition FY (2005-06) |
| CII for 2005-06 | 117 |
| Indexed cost (Option A) | ₹12L × 376/117 = ₹38,56,410 |
| Option A LTCG | ₹85L - ₹38.56L = ₹46,43,590 |
| Option B LTCG | ₹85L - ₹12L = ₹73,00,000 |
| Better option | **Option A** (lower LTCG) |
| CG module should note | "Inherited property: Cost of acquisition = cost to previous owner" |

---

## Test Scenario 7: Crypto/VDA + Simple Income

**Client Profile:** Arjun Reddy, Germany, crypto trader

### Intake
```
I work in Berlin since 2022. Visited India for 10 days. I traded crypto on Indian exchanges — total sales ₹8 lakhs, total cost ₹5 lakhs. I also have NRO interest of ₹80,000. German salary EUR 75,000.
```

**Expected:**
| Item | Expected |
|------|----------|
| Crypto gain | ₹3,00,000 |
| Crypto tax (30% flat) | ₹90,000 + ₹3,600 cess = ₹93,600 |
| Crypto TDS (1%) | ₹8,000 (1% of sales) |
| AI should flag | "Section 115BBH: 30% flat rate, no deductions except cost, no loss set-off" |
| No loss set-off | Even if crypto loss, cannot set off against NRO interest or any other income |

---

## Test Scenario 8: Multiple Income Types (Comprehensive Red Case)

**Client Profile:** Meera Joshi, Australia, everything at once

### Intake
```
I work in Sydney since 2018. Visited India for 35 days. Sold a commercial plot in Hyderabad for ₹1.2 crore, purchased in 2016 for ₹35 lakhs. Flat in Mumbai rented at ₹40,000/month with home loan interest ₹3 lakhs/year. Sold listed shares — LTCG ₹4 lakhs, STCG ₹2 lakhs. NRO interest ₹2.5 lakhs. FD interest ₹1.5 lakhs (NRO). Dividends from Indian companies ₹1 lakh. Australian salary AUD 200,000, Australian tax paid. Indian assets above ₹1 crore. I had a notice under 148A last year.
```

**Expected:**
| Item | Expected |
|------|----------|
| Classification | **Red** (property + shares + foreign tax + assets + NOTICE) |
| Property CG | Commercial plot → Section 54F applicable (not Section 54) |
| HP taxable | ₹4.8L rent - 30% SD - ₹3L interest = negative (loss) |
| Loss set-off | HP loss up to ₹2L against other income |
| Listed LTCG | 12.5% above ₹1.25L → tax on ₹2.75L |
| Listed STCG | 20% on ₹2L = ₹40,000 |
| Dividends | ₹1L at slab rate, TDS 20% |
| Pre-filing MUST flag | 148A notice → ESCALATION REQUIRED → Partner review |
| Advance tax | Required (large CG) — 4 installment schedule |
| Schedule AL | Mandatory (income > ₹50L) |
| Form 15CA/15CB | Required for repatriation |

---

## Test Scenario 9: NRI Filing for FY 2024-25

**Client Profile:** Late filer for previous year

### Intake
1. Change FY selector to **2024-25** (if available in UI)
2. Use a simple case: UK NRI, NRO interest ₹2L only

**Expected:**
| Item | Expected |
|------|----------|
| AY | 2025-26 |
| CII | 363 |
| Due date | 31 July 2025 (already past → belated return) |
| AI should flag | "Belated return under Section 139(4) — no loss carry-forward, interest under 234A/234B applies" |

---

## Test Scenario 10: Edge Cases & Error Handling

### 10a: Empty narrative
- Go to `/client`, click "Auto-Fill" with empty text box
- **Expected:** Button disabled or nothing happens

### 10b: Invalid portal reference
- Go to `/portal?ref=INVALID123456`
- **Expected:** "Case not found" message

### 10c: Health check
- Open `/api/health`
- **Expected:** JSON with status "ok", supabase: true, anthropic: true

### 10d: Rate limiting
- Run 25 rapid requests to `/api/ai/parse`
- **Expected:** After 20, get 429 "Too many requests"

### 10e: DOCX with missing data
- Call `/api/deliverables` with empty formData
- **Expected:** DOCX generates but with "?" or "—" for missing values (no crash)

### 10f: Theme toggle persistence
- Toggle theme on `/client` → navigate to `/login`
- **Expected:** Theme should persist (both pages in same theme)

---

## Computation Verification Cheat Sheet

Use these to verify DOCX outputs match expected numbers:

### Property CG (₹80L sale, ₹30L purchase, FY 2018-19)
```
CII 2018-19 = 280, CII 2025-26 = 376
Option A: Indexed cost = 30L × 376/280 = ₹40,28,571
          LTCG = 80L - 40.29L = ₹39,71,429
          Tax = 39,71,429 × 20% = ₹7,94,286 + cess = ₹8,26,057
Option B: LTCG = 80L - 30L = ₹50,00,000
          Tax = 50L × 12.5% = ₹6,25,000 + cess = ₹6,50,000
Better: Option B (saves ₹1,76,057)
TDS u/s 195: 80L × 20% × 1.10 × 1.04 = ₹18,30,400
Refund: 18,30,400 - 6,50,000 = ₹11,80,400
```

### House Property (₹25K/month rent)
```
Gross rent: ₹3,00,000
30% SD: ₹90,000
Taxable: ₹2,10,000
```

### NRO Interest TDS
```
Interest: ₹1,40,000 + ₹85,000 = ₹2,25,000
TDS at 30%: ₹67,500
```

### Section 54 (₹40L new house, ₹50L LTCG)
```
Exempt: min(50L, 40L, 10Cr) = ₹40,00,000
Taxable after: ₹10,00,000
Tax at 12.5% + cess: ₹1,30,000
Savings: ₹6,50,000 - ₹1,30,000 = ₹5,20,000
```

---

## Bug Report Template

When reporting bugs, use this format:

```
SCENARIO: [which test scenario]
STEP: [which step number]
EXPECTED: [what should happen]
ACTUAL: [what actually happened]
SCREENSHOT: [attach if possible]
SEVERITY: Critical / High / Medium / Low
```

---

## Sign-Off Checklist

Before marking a release as production-ready:

- [ ] All 10 test scenarios executed without Critical/High bugs
- [ ] At least 3 DOCX deliverables verified with correct numbers
- [ ] Portal link works in incognito browser
- [ ] Theme toggle works on all pages
- [ ] WhatsApp link opens correctly (+91-96677 44073)
- [ ] Login/signup flow works end-to-end
- [ ] Health endpoint returns 200

**Tested by:** _______________
**Date:** _______________
**Version:** _______________
**Result:** PASS / FAIL (with bug list if FAIL)
