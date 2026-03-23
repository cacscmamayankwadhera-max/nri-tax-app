# NRI Tax Suite — Domain Team Testing Guide

## READ THIS FIRST

This document tells you exactly how to test every feature of the NRI Tax Suite platform. Follow each step precisely. Do not skip steps. If something doesn't match what's written here, that's a bug — report it.

---

## URLS & CREDENTIALS

```
PRODUCTION URL: https://nri-tax-app-cacscmamayankwadhera-maxs-projects.vercel.app

LOGIN PAGE:     /login
SIGNUP PAGE:    /signup
CLIENT WIZARD:  /client
DASHBOARD:      /dashboard
PORTAL:         /portal
TERMS:          /terms
PRIVACY:        /privacy
HEALTH CHECK:   /api/health

ADMIN ACCOUNT:
  Email:    admin@mkwadvisors.com
  Password: MKW@Admin2026

PREPARER ACCOUNT:
  Email:    preparer@mkwadvisors.com
  Password: MKW@Prep2026
```

---

## HOW TO OPEN PAGES

1. Open your browser (Chrome recommended)
2. Paste the production URL in the address bar
3. Add the page path after it

Example:
- Landing page: `https://nri-tax-app-cacscmamayankwadhera-maxs-projects.vercel.app/`
- Client wizard: `https://nri-tax-app-cacscmamayankwadhera-maxs-projects.vercel.app/client`
- Login: `https://nri-tax-app-cacscmamayankwadhera-maxs-projects.vercel.app/login`

---

# TEST 1: LANDING PAGE

**Time required:** 5 minutes
**Page:** Open the production URL (just the base URL, no path)

### Step 1.1: Page Load
- [ ] Page loads without errors
- [ ] You see "NRI Tax Filing, Advisory & Compliance — Done Right" as the main heading
- [ ] Gold badge shows "FY 2025-26 · AY 2026-27 · CII 376"
- [ ] Stats section shows numbers (2,800+ NRI Clients, 18+ Countries, etc.)

### Step 1.2: Navigation
- [ ] "Start Your Tax Filing →" button exists (gold colored)
- [ ] Click it → takes you to `/client` page
- [ ] Go back to landing page
- [ ] "Team Login" link exists
- [ ] Click it → takes you to `/login` page
- [ ] Go back to landing page

### Step 1.3: Theme Toggle
- [ ] Find the sun/moon button in the top navigation bar (small circle)
- [ ] Click it once → page colors change (cream → dark navy, or dark → cream)
- [ ] All text is readable in both themes (no white text on white background)
- [ ] Click it again → goes back to original theme
- [ ] Refresh the page → theme stays the same (it remembers your choice)

### Step 1.4: Sections
Scroll down the page and verify each section exists:
- [ ] "How It Works" — 4 step cards (Describe, AI Analyzes, Deliverables, File)
- [ ] "What We Handle" — 6 service cards (dark background section)
- [ ] "Transparent Pricing" — 4 pricing tiers (Basic ₹8-15K through Retainer ₹1L+)
- [ ] "Most Popular" badge on the Premium tier
- [ ] Gold CTA banner: "Sold Property in India? Don't Overpay Tax."
- [ ] Testimonial quote
- [ ] Footer with "MKW Advisors" and "CA | CS | CMA | IBBI Registered Valuer"

### Step 1.5: Legal Links
- [ ] Open `/terms` — Terms of Service page loads with content
- [ ] Open `/privacy` — Privacy Policy page loads with content
- [ ] Both pages have navigation bar and footer

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 2: CLIENT WIZARD — UK NRI PROPERTY SALE

**Time required:** 15 minutes
**Page:** Open `/client`

This is the most important test. This simulates a real UK NRI client who sold property.

### Step 2.1: AI Auto-Fill

- [ ] You see Step 1/5 with a large text area and "Auto-Fill My Details" button
- [ ] Trust bar below navigation shows "Trusted by 500+ NRIs" (or similar)

Copy-paste this EXACT text into the text area:
```
I work in London since 2021, came to India for about 38 days. I sold a residential flat in Mumbai for 80 lakhs, purchased in 2018 for 30 lakhs. I also have a flat in Pune rented at 25,000 per month. NRO interest around 1.4 lakhs, FD interest 85,000. NRE savings interest 50,000. UK salary about GBP 72,000, UK tax paid. I want to know about property tax savings and foreign tax credit.
```

- [ ] Click "Auto-Fill My Details"
- [ ] Button changes to loading state ("Reading..." or similar)
- [ ] After 5-10 seconds, fields below get populated
- [ ] Step advances to Step 2

### Step 2.2: Verify Auto-Filled Data

Go back to Step 1 if needed. Check these fields:

| Field | Expected Value | Actual Value | Match? |
|-------|---------------|-------------|--------|
| Name | May be empty (fill manually) | | ☐ |
| Country | United Kingdom (or UK) | | ☐ |
| Occupation | May show something | | ☐ |

Fill in any missing fields:
- Name: `Rajesh Mehta` (type this manually if empty)
- Country: `United Kingdom` (select from dropdown if not auto-filled)
- Stay days: `38` (on Step 2)

- [ ] Click "Continue" to go to Step 2

### Step 2.3: Step 2 — India Connections

- [ ] "Days in India this year" — enter `38` if not already filled
- [ ] "How do you know?" — select `Self-estimate`
- [ ] "Did you sell property this year?" — select `Yes`

When you select Yes, additional fields appear:

| Field | What to Enter | Done? |
|-------|--------------|-------|
| When was it purchased? | Select `FY 2018-19` | ☐ |
| Sale price (₹) | `8000000` (80 lakhs) | ☐ |
| Purchase cost (₹) | `3000000` (30 lakhs) | ☐ |
| City / Location | `Mumbai` | ☐ |
| Date of sale | Pick any date in 2025-26 (e.g., 15 Nov 2025) | ☐ |
| Improvement cost (₹) | `0` (leave empty) | ☐ |
| Acquisition type | `Self-purchased` | ☐ |
| Holding period | `24 months or more` | ☐ |
| Joint ownership | `No — sole owner` | ☐ |
| Bought or planning to buy new house? | Select `Planning to buy` | ☐ |

- [ ] Click "Continue" to go to Step 3

### Step 2.4: Step 3 — Income & Transactions

Check these boxes:
- [ ] ☑ Rental income
- [ ] ☑ Bank / FD interest

When you check "Rental income", a field appears:
- [ ] Monthly rent amount: enter `25000`

When you check "Bank / FD interest", fields appear:
- [ ] NRO interest (₹/year): enter `140000`
- [ ] FD interest (₹/year): enter `85000`
- [ ] Interest account type: select `NRO (Taxable)` (NRE interest is tax-free and should not be entered here)

Check foreign income:
- [ ] ☑ I earn salary abroad
- [ ] ☑ I pay tax abroad
- [ ] Details: type `UK salary GBP 72,000, UK tax paid`

- [ ] Click "Continue" to go to Step 4

### Step 2.5: Step 4 — Documents & Context

| Field | What to Select |
|-------|---------------|
| Do you have AIS? | `Downloaded but not reviewed` |
| Total Indian assets? | `₹50L – ₹1 Crore` |
| Any prior tax notices? | `None` |
| What help do you need? | `Filing + advice on my situation` |
| Home loan interest on rented property | `0` (leave empty) |
| Anything else? | Leave empty |

- [ ] Click "Review →" to go to Step 5

### Step 2.6: Step 5 — Review & Submit

VERIFY THESE ITEMS CAREFULLY:

- [ ] **Classification badge** is visible — should show `Amber` or `Red`
  - Green = WRONG for this case (property sale should push score above 2)
  - Amber or Red = CORRECT

- [ ] **Capital Gains Preview** is visible — should show:
  - "Option B saves ₹X" (some amount)
  - Both option tax amounts shown

- [ ] **Summary section** shows:
  - Name: Rajesh Mehta
  - Country: United Kingdom
  - Stay: ~38 days

- [ ] Click **"Get My Tax Diagnostic →"**

### Step 2.7: Diagnostic Result Page

THIS IS THE MOST IMPORTANT PAGE TO VERIFY.

- [ ] Large heading: "Your Tax Diagnostic is Ready" or similar

- [ ] **Classification card** shows Amber or Red with explanation text

- [ ] **Capital Gains section** shows:
  | Item | Expected Value | Actual | Match? |
  |------|---------------|--------|--------|
  | Option A (20% with indexation) tax | ₹8,26,057 | | ☐ |
  | Option B (12.5% flat) tax | ₹6,50,000 | | ☐ |
  | Better option | B | | ☐ |
  | Savings | ₹1,76,057 | | ☐ |

- [ ] **TDS Refund section** (if shown):
  | Item | Expected Value | Actual | Match? |
  |------|---------------|--------|--------|
  | TDS u/s 195 | ~₹18,30,400 | | ☐ |
  | Refund | ~₹11,80,400 | | ☐ |

- [ ] **Recommended Service** shows pricing tier (Advisory Filing ₹18-30K or Premium ₹35-75K)

- [ ] **Tracking code** appears (24-character code like `a1b2c3d4e5f6a7b8c9d0e1f2`)

  **WRITE THIS CODE DOWN:** _______________________________________________

- [ ] "Track your case status →" link visible
- [ ] Click it → opens portal page with your case

- [ ] **WhatsApp button** — click it
  - [ ] Opens WhatsApp with number `+91 96677 44073`

- [ ] **Email button** — click it
  - [ ] Opens email client with `tax@mkwadvisors.com`
  - [ ] Subject line contains client name and classification

- [ ] **Phone number** shown: `+91-96677 44073`

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 3: TEAM LOGIN & DASHBOARD

**Time required:** 10 minutes
**Page:** Open `/login`

### Step 3.1: Login

- [ ] You see "Sign in to your account" heading
- [ ] Theme toggle button visible in top area

Enter credentials:
```
Email:    admin@mkwadvisors.com
Password: MKW@Admin2026
```

- [ ] Click "Sign In"
- [ ] Page redirects to `/dashboard`
- [ ] If you see "Not configured" → BUG — report immediately with screenshot

### Step 3.2: Dashboard Home

- [ ] "NRI TAX SUITE" logo in navigation bar
- [ ] Theme toggle (sun/moon) visible
- [ ] Stats cards showing: Total, Green, Amber, Red counts
- [ ] "New NRI Case" button exists
- [ ] FY selector shows "2025-26"

### Step 3.3: Find the Case from Test 2

Look at the case list below the stats:

**If the case from Test 2 appears:**
- [ ] Shows client name "Rajesh Mehta"
- [ ] Shows country "United Kingdom"
- [ ] Shows classification badge (Amber or Red)
- [ ] Click on it → opens case view

**If the case does NOT appear:**
- [ ] This is expected if the auto-run or DB save had issues
- [ ] Click "New NRI Case" and create a case manually using the same data from Test 2
- [ ] Fill all 5 wizard steps, click "Start Workflow"

### Step 3.4: Case View — Sidebar

- [ ] Left sidebar shows case name, country, FY, classification
- [ ] **Status dropdown** visible with options (Intake Received, Analysis Running, etc.)
- [ ] **"Copy Client Portal Link"** button visible
- [ ] 10 modules listed:
  1. Case Intake (should show ✓)
  2. Residency
  3. Income Map
  4. Scope & Fee (marked as internal)
  5. AIS Recon (has ⚠ checkpoint marker)
  6. Form Select
  7. Capital Gains
  8. DTAA/FTC
  9. Pre-Filing (has ⚠ checkpoint marker)
  10. Advisory Memo
- [ ] 5 deliverables listed (greyed out until modules complete):
  1. CG Computation Sheet
  2. Client Advisory Memo
  3. Tax Position Report
  4. Computation of Total Income
  5. Scope & Fee Note

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 4: RUN AI MODULES

**Time required:** 30 minutes (AI calls take 5-15 seconds each)
**Page:** Continue in `/dashboard` case view from Test 3

### Step 4.1: Run Residency Module

- [ ] Click "Residency" in sidebar
- [ ] Click "Run Residency" button (gold/accent colored)
- [ ] Loading spinner appears ("Running Residency...")
- [ ] After 5-15 seconds, output appears

**VERIFY OUTPUT CONTAINS:**
- [ ] Heading: "Residency Analysis Snapshot" or similar
- [ ] FY mentioned: FY 2025-26
- [ ] Country: United Kingdom
- [ ] Stay days referenced: ~38 days
- [ ] Preliminary view: **Non-Resident** (if it says Resident → BUG)
- [ ] Confidence level stated (High/Moderate/Low)
- [ ] Missing data section (should mention preceding-year stay data)
- [ ] Risk flags (if any)
- [ ] Checkmark ✓ appears next to Residency in sidebar

### Step 4.2: Run Income Map Module

- [ ] Click "Income Map" in sidebar
- [ ] Click "Run Income Map"
- [ ] Wait for output

**VERIFY OUTPUT IDENTIFIES THESE INCOME HEADS:**
- [ ] House Property — rental income ₹25,000/month
- [ ] Capital Gains — property sale ₹80 lakhs
- [ ] Other Sources — NRO interest ₹1.4L, FD interest ₹85K
- [ ] Foreign salary — **marked as NOT taxable for NR** (if it says taxable → BUG)
- [ ] NRE interest — **should NOT be included** (it's exempt under Section 10(4))
- [ ] Tax regime impact mentioned

### Step 4.3: Run Scope & Fee Module (Internal)

- [ ] Click "Scope & Fee" in sidebar
- [ ] Click "Run Scope & Fee"
- [ ] Wait for output

**VERIFY:**
- [ ] Service tier recommended (T2 Advisory or T3 Premium)
- [ ] Pricing band mentioned
- [ ] Scope inclusions listed
- [ ] This is marked as an internal module — output should not be shared with client

### Step 4.4: Run Capital Gains Module — MOST CRITICAL

- [ ] Click "Capital Gains" in sidebar
- [ ] Click "Run Capital Gains"
- [ ] Wait for output (may take 10-15 seconds, this is the longest module)

**VERIFY OUTPUT CONTAINS EXACT NUMBERS FROM VERIFIED COMPUTATION:**

The AI should reference "VERIFIED COMPUTATION" numbers. Check:

| Item | Must Show | Shown? |
|------|----------|--------|
| CII for 2018-19 | 280 | ☐ |
| CII for 2025-26 | 376 | ☐ |
| Option A: Indexed cost | ~₹40,28,571 | ☐ |
| Option A: LTCG | ~₹39,71,429 | ☐ |
| Option A: Tax | ~₹8,26,057 | ☐ |
| Option B: LTCG | ₹50,00,000 | ☐ |
| Option B: Tax | ₹6,50,000 | ☐ |
| Recommended option | B (saves ₹1,76,057) | ☐ |
| TDS u/s 195 | ~₹18,30,400 | ☐ |
| Expected refund | ~₹11,80,400 | ☐ |

**CRITICAL CHECKS — IF ANY OF THESE ARE WRONG, IT'S A BUG:**
- [ ] AI does NOT say "NRIs can only use Option B" (NRIs ARE individuals, they get both options)
- [ ] AI does NOT compute TDS at 1% (that's Section 194-IA for residents, NOT NRIs)
- [ ] AI does NOT compute TDS at 12.5% of LTCG (TDS is 20% of sale consideration)
- [ ] AI mentions Section 54 (new house purchase exemption)
- [ ] AI mentions Section 54EC (₹50L bonds, 5-year lock-in, 6-month deadline)
- [ ] AI mentions Section 197 (lower TDS certificate)
- [ ] AI mentions Form 15CA/15CB (for repatriation)
- [ ] AI mentions advance tax deadlines (15 Jun/Sep/Dec/Mar)

### Step 4.5: Run DTAA/FTC Module

- [ ] Click "DTAA/FTC" in sidebar
- [ ] Run the module

**VERIFY:**
- [ ] States clearly: "NR's foreign salary is NOT taxable in India"
- [ ] States: "FTC not applicable because income is not taxed in both countries"
- [ ] Does NOT say "you can claim credit for UK tax paid" (that would be WRONG for NR foreign salary)
- [ ] Mentions UK DTAA treaty rate for interest (15%)
- [ ] If it mentions UAE → should note UAE has no personal income tax, DTAA credit limited
- [ ] Mentions Form 67 requirement if FTC is ever applicable

### Step 4.6: Run Pre-Filing Module

- [ ] Click "Pre-Filing" in sidebar (has ⚠ checkpoint marker)
- [ ] Run the module

**VERIFY READINESS CHECKLIST:**
- [ ] Residency view confirmed?
- [ ] All income mapped?
- [ ] CG dual computation done?
- [ ] Section 54/54F planning discussed?
- [ ] TDS credits verified?
- [ ] Tax regime confirmed?
- [ ] Schedule AL mentioned (if income > ₹50L → mandatory)
- [ ] Form 67 mentioned (if FTC relevant)
- [ ] Advance tax checked?
- [ ] Status: Ready / Conditionally Ready / Not Ready

### Step 4.7: Run Advisory Memo Module

- [ ] Click "Advisory Memo" in sidebar
- [ ] Run the module

**VERIFY THE MEMO:**
- [ ] Professional tone (readable by non-tax-expert client)
- [ ] Client name: Rajesh Mehta
- [ ] AY: 2026-27
- [ ] Date: today's date
- [ ] Prepared By: MKW Advisors — NRI Tax Desk
- [ ] **Facts section** lists: property sale, rental, NRO interest, UK salary
- [ ] **Key Issues** are numbered
- [ ] **CG dual comparison** with exact numbers (must match verified computation)
- [ ] **FTC clarification** — "Foreign salary not taxable for NR"
- [ ] **Rental income** computation (if property rent exists)
- [ ] **87A rebate** — "Section 87A rebate (₹60,000) NOT available to NRIs"
  - [ ] Does NOT say "₹12L rebate" (that's the nil-tax threshold, not the rebate amount)
- [ ] **Risk flags** listed
- [ ] **Recommended actions** numbered and specific
- [ ] **Section 54** planning mentioned
- [ ] **Form 15CA/15CB** mentioned for repatriation

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 5: DOWNLOAD & VERIFY DOCX DELIVERABLES

**Time required:** 20 minutes
**Page:** Continue in `/dashboard` case view

### Step 5.1: CG Computation Sheet

**Pre-requisite:** Capital Gains module must be completed (✓ in sidebar)

- [ ] Click "CG Computation Sheet" in deliverables section of sidebar
- [ ] Preview loads inline on the right
- [ ] Click "Download DOCX" button
- [ ] A `.docx` file downloads to your computer
- [ ] Open the file in Microsoft Word or Google Docs

**VERIFY DOCX CONTENT:**

Page 1 — Header:
- [ ] "MKW Advisors" in gold
- [ ] "NRI Tax Filing · Advisory · Compliance" tagline
- [ ] Title: "CG Computation Sheet" or "Capital Gains Computation"
- [ ] Client: Rajesh Mehta
- [ ] AY: 2026-27
- [ ] Classification: Amber or Red

Transaction Details Table:
- [ ] Sale price: ₹80,00,000
- [ ] Purchase cost: ₹30,00,000
- [ ] Acquisition FY: 2018-19
- [ ] Location: Mumbai

Option A (20% with Indexation) Table:
| Row | Expected Value | Actual | Match? |
|-----|---------------|--------|--------|
| CII (acquisition) | 280 | | ☐ |
| CII (sale) | 376 | | ☐ |
| Indexed cost | ₹40,28,571 | | ☐ |
| LTCG | ₹39,71,429 | | ☐ |
| Tax (20%) | ₹7,94,286 | | ☐ |
| Cess (4%) | ₹31,771 | | ☐ |
| Total | ₹8,26,057 | | ☐ |

Option B (12.5% Flat) Table:
| Row | Expected Value | Actual | Match? |
|-----|---------------|--------|--------|
| LTCG | ₹50,00,000 | | ☐ |
| Tax (12.5%) | ₹6,25,000 | | ☐ |
| Cess (4%) | ₹25,000 | | ☐ |
| Total | ₹6,50,000 | | ☐ |

Comparison:
- [ ] Option B recommended
- [ ] Savings: ₹1,76,057

TDS Section:
- [ ] TDS under Section 195 (NOT Section 194-IA)
- [ ] Rate: 20% of sale consideration (NOT 1%)
- [ ] Amount: ~₹18,30,400
- [ ] Refund amount shown: ~₹11,80,400

Section 54/54EC:
- [ ] Section 54 mentioned with "purchase new house within 2 years" note
- [ ] Section 54EC: ₹50L max in NHAI/REC bonds
- [ ] 6-month deadline for bonds
- [ ] 5-year lock-in period

- [ ] Professional formatting (tables with borders, proper fonts)
- [ ] Legal disclaimer at bottom

### Step 5.2: Client Advisory Memo DOCX

**Pre-requisite:** Advisory Memo module must be completed

- [ ] Click "Client Advisory Memo" in deliverables
- [ ] Download DOCX
- [ ] Open in Word

**VERIFY:**
- [ ] MKW Advisors branding
- [ ] Client name, AY, date
- [ ] Facts section
- [ ] Assumptions section
- [ ] Key Issues (numbered)
- [ ] CG numbers match the CG Computation Sheet (MUST be identical)
- [ ] FTC clarification present
- [ ] Rental income computation present (if rental exists)
- [ ] Professional language (client-readable)

### Step 5.3: Computation of Total Income DOCX

**Pre-requisite:** Income Map + Capital Gains modules must be completed

- [ ] Click "Computation of Total Income" in deliverables
- [ ] Download DOCX
- [ ] Open in Word

**VERIFY INCOME HEADS:**
| Head | Expected | Actual | Match? |
|------|----------|--------|--------|
| House Property | ₹2,10,000 (₹3L rent - 30% SD) | | ☐ |
| Capital Gains (LTCG) | ₹50,00,000 (Option B) | | ☐ |
| Other Sources | ₹2,25,000 (₹1.4L + ₹85K) | | ☐ |
| Foreign salary | NOT included (NR exempt) | | ☐ |
| NRE interest | NOT included (Section 10(4)) | | ☐ |
| GROSS TOTAL | ~₹54,35,000 | | ☐ |

**VERIFY TAX COMPUTATION:**
| Item | Expected | Actual | Match? |
|------|----------|--------|--------|
| LTCG tax (chosen option) | Matches CG sheet | | ☐ |
| Tax on other income | Slab rate on non-CG income | | ☐ |
| Cess (4%) | On total tax | | ☐ |
| Section 87A rebate | NOT applied (NRI) | | ☐ |

**VERIFY TDS:**
| Item | Expected | Actual | Match? |
|------|----------|--------|--------|
| TDS u/s 195 (property) | ~₹18,30,400 | | ☐ |
| TDS on NRO interest (30%) | ~₹67,500 | | ☐ |
| TOTAL TDS | Sum of above | | ☐ |

**VERIFY NET POSITION:**
- [ ] Refund or Payable clearly stated
- [ ] If refund → highlighted in green
- [ ] If payable → highlighted in red

**VERIFY ADVANCE TAX (if shown):**
| Installment | Date | Cumulative % |
|------------|------|-------------|
| 1st | 15 June 2025 | 15% |
| 2nd | 15 September 2025 | 45% |
| 3rd | 15 December 2025 | 75% |
| 4th | 15 March 2026 | 100% |

### Step 5.4: Tax Position Report DOCX

- [ ] Download and verify it contains residency view, income summary, key issues
- [ ] Numbers should be consistent with other documents

### Step 5.5: Scope & Fee Note DOCX (Internal)

- [ ] Download and verify it shows service tier, fee range, scope inclusions/exclusions
- [ ] This is INTERNAL — should not be sent to client

### Step 5.6: Print Function

- [ ] Go back to any deliverable preview in dashboard
- [ ] Click "Print" button
- [ ] Print dialog opens with formatted content
- [ ] Content is readable and properly laid out for printing

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 6: CLIENT PORTAL

**Time required:** 10 minutes

### Step 6.1: Open Portal via Tracking Code

- [ ] Open a NEW browser window (or incognito/private mode)
- [ ] Go to: `https://nri-tax-app-cacscmamayankwadhera-maxs-projects.vercel.app/portal`
- [ ] You see a "Enter your tracking code" input box
- [ ] Enter the tracking code you wrote down in Test 2 Step 2.7
- [ ] Click "Look Up" or press Enter

**If portal shows the case:**
- [ ] Client name shown correctly
- [ ] Country shown
- [ ] FY/AY shown
- [ ] Classification badge visible

**If portal says "Case not found":**
- [ ] Try using the portal link from the dashboard "Copy Client Portal Link" button instead
- [ ] If that also doesn't work → the case may not have saved to database → note as bug

### Step 6.2: Timeline

- [ ] 6-stage timeline visible (vertical)
- [ ] Current stage is highlighted (gold pulsing circle)
- [ ] Completed stages have green checkmarks
- [ ] Future stages are grey

### Step 6.3: Key Findings (Stage 3+)

If the case is at stage 3 or later:
- [ ] CG savings amount shown (if property sale)
- [ ] TDS refund amount shown
- [ ] Service tier shown

### Step 6.4: Module Progress

- [ ] List of 9 modules visible (client-friendly names, NOT internal IDs)
- [ ] Completed modules show green check
- [ ] Progress bar or count shown

### Step 6.5: Status Update (test from dashboard)

Go back to the **dashboard** (logged-in window):
- [ ] In sidebar, change status dropdown to "Findings Ready"
- [ ] Go back to the **portal** (incognito window)
- [ ] Refresh the page
- [ ] Stage should now show "Findings Ready" (Stage 4)

Repeat:
- [ ] Change to "Filing in Progress" in dashboard → portal shows Stage 5
- [ ] Change to "Filed" in dashboard → portal shows Stage 6

### Step 6.6: Contact Bar

At the bottom of the portal page:
- [ ] WhatsApp link visible → opens `wa.me/919667744073`
- [ ] Email link visible → `tax@mkwadvisors.com`
- [ ] Phone number: `+91-96677 44073`

### Step 6.7: No Login Required

- [ ] Verify the portal page works WITHOUT being logged in
- [ ] It should work in incognito mode with just the tracking code
- [ ] Client should NEVER see internal data (pricing, scope, fee details)

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 7: UAE NRI — SIMPLE GREEN CASE

**Time required:** 10 minutes
**Page:** Open `/client`

### Step 7.1: AI Auto-Fill

Paste this:
```
I work in Dubai since 2019. Came to India for about 20 days for a family wedding. I have an NRO savings account with about 2 lakhs interest. FD with ICICI about 1.5 lakhs interest. No property transactions. UAE salary about AED 300,000. No Indian salary.
```

Click "Auto-Fill" and fill any missing fields:
- Name: `Ahmed Khan`
- Country: `UAE`
- Stay days: `20`

### Step 7.2: Walk Through Wizard

- [ ] Step 2: No property sale
- [ ] Step 3: Check "Bank / FD interest", enter NRO ₹200000, FD ₹150000
- [ ] Check "I earn salary abroad"
- [ ] Step 4: Fill basic fields
- [ ] Step 5: Review

**VERIFY:**
- [ ] Classification: **Green** (only interest income, simple profile)
- [ ] No CG preview (no property sale)
- [ ] Submit → Diagnostic shows Green classification
- [ ] Recommended: Basic Filing ₹8,000-15,000

### Step 7.3: Dashboard Verification

Login and open this case:
- [ ] Run Residency → should show NR with high confidence (20 days)
- [ ] Run DTAA → should note: "UAE has no personal income tax — DTAA credit mechanism limited"
- [ ] Should NOT say "FTC applicable" (NR foreign salary not taxable)

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 8: INHERITED PROPERTY — CANADA NRI

**Time required:** 10 minutes
**Page:** Open `/client`

### Step 8.1: AI Auto-Fill

Paste this:
```
I work in Toronto since 2015. My father passed away in 2023 and I inherited his flat in Pune. He bought it in 2005 for 12 lakhs. I sold it this year for 85 lakhs. NRO interest 1 lakh. Canadian salary CAD 120,000.
```

Fill:
- Name: `Kavita Desai`
- Country: `Canada`
- Stay days: `10`

### Step 8.2: Property Section — CRITICAL

In Step 2, for property details:
- [ ] Acquisition type: select **`Inherited`**
- [ ] When purchased: select **`FY 2005-06`** (father's purchase year)
- [ ] Sale price: `8500000`
- [ ] Purchase cost: `1200000` (father's cost, NOT current market value)
- [ ] Holding period: `24 months or more`

### Step 8.3: Review & Submit

**VERIFY on Step 5:**
- [ ] Classification: **Red** (high-value property sale)
- [ ] CG preview shows both options
- [ ] **OPTION A SHOULD BE BETTER HERE** because:
  - Father's cost ₹12L indexed from 2005-06 (CII 117) to 2025-26 (CII 376)
  - Indexed cost = ₹12L × 376/117 = ₹38,56,410
  - Option A LTCG = ₹85L - ₹38.56L = ₹46,43,590 (LOWER)
  - Option B LTCG = ₹85L - ₹12L = ₹73,00,000 (HIGHER)
  - So Option A saves money here

### Step 8.4: Dashboard — CG Module

- [ ] Run Capital Gains module
- [ ] AI should note: "Inherited property — cost of acquisition = cost to previous owner"
- [ ] AI should use CII 117 for 2005-06 (not current year)
- [ ] Numbers should match verified computation

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 9: CRYPTO + SHARES — GERMANY NRI

**Time required:** 10 minutes
**Page:** Open `/client`

### Step 9.1: AI Auto-Fill

Paste this:
```
I work in Berlin since 2022. Visited India for 10 days. I traded crypto on Indian exchanges - total sales 8 lakhs, total cost 5 lakhs. I also sold some listed shares - LTCG of 5 lakhs and STCG of 2 lakhs. NRO interest 80,000. German salary EUR 75,000.
```

### Step 9.2: Income Section

- [ ] Check: Crypto / Virtual Digital Assets
- [ ] Enter: Crypto sale ₹800000, Crypto cost ₹500000
- [ ] Check: Sold shares
- [ ] Enter: Listed shares LTCG ₹500000, Listed shares STCG ₹200000
- [ ] Check: Bank/FD interest → NRO ₹80000

### Step 9.3: Verify AI Module Outputs

In dashboard, after running modules:

**CG module should identify:**
- [ ] Crypto: 30% flat rate, no deductions, 1% TDS
- [ ] Crypto gain: ₹3,00,000 → tax ₹90,000 + cess
- [ ] Listed STCG: 20% (Section 111A)
- [ ] Listed LTCG: 12.5% above ₹1.25L exemption (Section 112A)
- [ ] LTCG taxable: ₹5L - ₹1.25L = ₹3.75L

**Memo should note:**
- [ ] "Section 115BBH: 30% flat rate on crypto, no loss set-off"
- [ ] "Crypto losses cannot be set off against any other income"

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 10: ESOP/RSU — US NRI

**Time required:** 10 minutes
**Page:** Open `/client`

### Step 10.1: Narrative

Paste this:
```
I work in San Francisco since 2017. Visited India for 15 days. I have ESOPs from my Indian company - FMV at vesting was 800 per share, exercise price 200. I sold 500 shares at 1200 each after 14 months. I also sold a plot in Bangalore for 1.5 crore, purchased in 2015 for 40 lakhs. NRO interest 3 lakhs. US salary USD 280,000. Indian assets above 1 crore.
```

### Step 10.2: Fill ESOP Fields

In Step 3:
- [ ] Check: ESOP / RSU sale
- [ ] ESOP perquisite value: `300000` (500 × (800-200))
- [ ] ESOP sale gain: `200000` (500 × (1200-800))

### Step 10.3: Verify

**Classification:** Red (property + ESOP + high assets)

**AI modules should identify:**
- [ ] ESOP: two-stage taxation (perquisite as salary + CG at sale)
- [ ] Perquisite: ₹3,00,000 (salary head)
- [ ] CG: ₹2,00,000 LTCG (14 months > 12 → Section 112A)
- [ ] Property CG: large amount with dual option
- [ ] Schedule AL: mandatory (income > ₹50L)
- [ ] US DTAA: 15% on interest

**Pre-filing module should flag:**
- [ ] Schedule AL mandatory
- [ ] Advance tax required
- [ ] Form 15CA/15CB for repatriation

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 11: RENTAL WITH HOME LOAN LOSS

**Time required:** 10 minutes
**Page:** Open `/client`

### Step 11.1: Narrative

Paste this:
```
I work in Singapore since 2020. Came to India for 45 days. I have a flat in Chennai rented at 35,000 per month. Home loan EMI with 4 lakh interest component per year. NRO FD interest 1.8 lakhs. Singapore salary SGD 180,000. No property sale.
```

### Step 11.2: Fill Fields

- [ ] Step 3: Rental ₹35000/month
- [ ] Step 4: Home loan interest: `400000`
- [ ] Interest type: NRO (Taxable)

### Step 11.3: Verify Domain Logic

**HP Computation (verify in AI output or DOCX):**
| Item | Expected | Actual | Match? |
|------|----------|--------|--------|
| Gross annual rent | ₹4,20,000 | | ☐ |
| 30% standard deduction | ₹1,26,000 | | ☐ |
| Loan interest deduction | ₹4,00,000 (NO CAP — let-out property) | | ☐ |
| Net HP income | ₹4,20,000 - ₹1,26,000 - ₹4,00,000 = **-₹1,06,000 (LOSS)** | | ☐ |

**CRITICAL CHECK:**
- [ ] Interest deduction is ₹4,00,000 (full amount, NOT capped at ₹2,00,000)
- [ ] If it shows ₹2,00,000 cap → **BUG** (₹2L cap is only for self-occupied property)
- [ ] HP loss should be set off against NRO interest income (up to ₹2,00,000 limit)

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 12: PLATFORM SECURITY & ERROR HANDLING

**Time required:** 10 minutes

### Step 12.1: Dashboard Protection

- [ ] Open `/dashboard` in incognito (not logged in)
- [ ] Should redirect to `/login` (NOT show dashboard)
- [ ] If you see the dashboard without logging in → **CRITICAL BUG**

### Step 12.2: Invalid Portal Code

- [ ] Open `/portal`
- [ ] Enter a random code: `INVALID12345678`
- [ ] Should show "Case not found" (NOT crash or show someone else's data)

### Step 12.3: Health Check

- [ ] Open `/api/health` in browser
- [ ] Should show JSON: `{"status":"ok","supabase":true,"anthropic":true,"internalSecret":true}`
- [ ] If any value is false → configuration issue

### Step 12.4: Wrong Login

- [ ] Go to `/login`
- [ ] Enter wrong password: `wrongpassword`
- [ ] Should show error message (NOT crash)
- [ ] Try again with correct password → should work

### Step 12.5: Theme Persistence

- [ ] Toggle theme on `/client` page
- [ ] Navigate to `/login`
- [ ] Theme should be the SAME (persists across pages)
- [ ] Refresh the page → theme still the same

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# TEST 13: MOBILE RESPONSIVENESS

**Time required:** 5 minutes

Open the production URL on your phone (or use Chrome DevTools → toggle device toolbar → select iPhone 14 or similar).

- [ ] Landing page: readable, sections stack vertically
- [ ] `/client` wizard: form fields full width, buttons tappable
- [ ] `/portal`: timeline readable, contact bar accessible
- [ ] `/login`: form centered, inputs usable

**RESULT:** ☐ PASS ☐ FAIL — Notes: _______________

---

# DOMAIN ACCURACY QUICK REFERENCE

Use this to verify numbers in ANY test scenario:

### FY 2025-26 Parameters
```
CII: 376
AY: 2026-27
Due date: 31 July 2026
Default regime: New (Section 115BAC)
Standard deduction (salaried): ₹75,000
87A rebate: ₹60,000 (RESIDENTS ONLY — NRIs do NOT get this)
```

### Capital Gains Rates
```
LTCG property (pre-Jul 2024): 20% indexed OR 12.5% flat (taxpayer chooses)
LTCG property (post-Jul 2024): 12.5% flat only
LTCG listed equity (Section 112A): 12.5% above ₹1.25L
STCG listed equity (Section 111A): 20%
LTCG unlisted shares (Section 112): 12.5% (NO ₹1.25L exemption)
Crypto/VDA (Section 115BBH): 30% flat, NO deductions, NO loss set-off
Cess: 4% on all tax
```

### TDS Rates for NRIs
```
Property sale (Section 195): 20% of SALE CONSIDERATION + surcharge + cess
  Surcharge: 10% (>₹50L), 15% (>₹1Cr, capped for LTCG)
NRO interest (Section 195): 30% + surcharge + cess
NRE interest: EXEMPT (Section 10(4)) — no TDS, no tax
Dividends (Section 195): 20% + surcharge + cess
Crypto (Section 194S): 1% of sale consideration
```

### House Property
```
Standard deduction: 30% of NAV
Interest cap (self-occupied): ₹2,00,000
Interest cap (let-out): NO CAP
```

### Section 54 (Residential Property)
```
Cap: ₹10 crore
Timeline: Buy within 2 years / construct within 3 years
CGAS: Deposit before ITR due date if not yet purchased
```

### New Regime Slabs
```
₹0-4L: 0% | ₹4-8L: 5% | ₹8-12L: 10% | ₹12-16L: 15%
₹16-20L: 20% | ₹20-24L: 25% | >₹24L: 30%
```

---

# BUG REPORT FORMAT

When you find something wrong, write it EXACTLY like this:

```
TEST NUMBER: [e.g., Test 4 Step 4.4]
PAGE: [e.g., /dashboard — Capital Gains module]
WHAT I DID: [e.g., Clicked "Run Capital Gains"]
EXPECTED: [e.g., Option B tax should be ₹6,50,000]
ACTUAL: [e.g., Shows ₹7,80,000]
SCREENSHOT: [attach photo or screenshot]
SEVERITY:
  - CRITICAL: Wrong tax number, wrong legal advice, data exposed
  - HIGH: Feature doesn't work, page crashes
  - MEDIUM: UI issue, confusing text
  - LOW: Typo, cosmetic issue
```

---

# FINAL SIGN-OFF

| Test | Result | Tester | Date | Notes |
|------|--------|--------|------|-------|
| Test 1: Landing Page | ☐ Pass ☐ Fail | | | |
| Test 2: Client Wizard (UK NRI) | ☐ Pass ☐ Fail | | | |
| Test 3: Team Login & Dashboard | ☐ Pass ☐ Fail | | | |
| Test 4: AI Modules | ☐ Pass ☐ Fail | | | |
| Test 5: DOCX Deliverables | ☐ Pass ☐ Fail | | | |
| Test 6: Client Portal | ☐ Pass ☐ Fail | | | |
| Test 7: UAE Green Case | ☐ Pass ☐ Fail | | | |
| Test 8: Inherited Property | ☐ Pass ☐ Fail | | | |
| Test 9: Crypto + Shares | ☐ Pass ☐ Fail | | | |
| Test 10: ESOP/RSU | ☐ Pass ☐ Fail | | | |
| Test 11: Rental + Home Loan | ☐ Pass ☐ Fail | | | |
| Test 12: Security & Errors | ☐ Pass ☐ Fail | | | |
| Test 13: Mobile | ☐ Pass ☐ Fail | | | |

**Overall Result:** ☐ PRODUCTION READY ☐ NEEDS FIXES

**Tested by:** _______________
**Date:** _______________
**Browser:** _______________
**Device:** _______________
