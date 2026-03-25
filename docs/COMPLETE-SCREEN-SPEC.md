I now have a comprehensive view of all 16 files. Let me compile the definitive spec.

---

# NRI TAX SUITE — COMPLETE SCREEN-BY-SCREEN SPECIFICATION

## SHARED COMPONENTS

---

### NAVBAR (`app/components/NavBar.js`)

**Props:** `variant` — default `'solid'`; also accepts `'transparent'`

**Behavior:**
- Sticky, `z-50`. When `variant='transparent'` and scroll `< 40px`, background is transparent and no shadow. After scrolling 40px, transitions to `var(--bg-nav)` with `blur(12px)` backdrop filter.
- Route changes auto-close mobile drawer.
- Escape key closes mobile drawer.
- Body scroll locked (`overflow: hidden`) when drawer is open.

**Desktop layout (md and above):**
- Logo left: circular badge "NT" (gold border, gold text) + serif text "NRI Tax Suite"
- Center links (4 items, with icon + label, active state highlighted in gold):
  - "Knowledge Hub" → `/blog` (BookOpen icon)
  - "Start Filing" → `/client` (FileText icon)
  - "Track Case" → `/portal` (Search icon)
  - "My Cases" → `/my-cases` (User icon)
- Right side:
  - Theme toggle button (circular, Sun/Moon icon, gold)
  - Vertical divider (1px)
  - "Team" link → `/login` (LogIn icon, faint border, muted color)

**Mobile layout:**
- Logo left
- Right: theme toggle button + hamburger menu button (Menu icon, 20px)
- Drawer slides in from right (280px wide, z-70)
  - Drawer header: "Menu" text + X close button
  - Section "FOR NRI CLIENTS" (uppercase, faint label):
    - "Start Filing" → `/client` — desc: "Begin your tax assessment"
    - "Track Your Case" → `/portal` — desc: "Check case progress"
    - "My Cases" → `/my-cases` — desc: "View all your cases"
    - "Knowledge Hub" → `/blog` — desc: "100+ tax guides"
  - Section "FOR TEAM":
    - "Team Login" → `/login`
  - Bottom CTA: "Start Filing →" (gold background, dark text)
  - Tagline: "MKW Advisors · CA · CS · CMA"
  - Backdrop: semi-transparent black blur overlay, click to close

---

### FOOTER (`app/components/Footer.js`)

**Layout:** 3-column grid (`md:grid-cols-3`), then a bottom bar.

**Column 1 — Branding:**
- Logo: circular "NT" badge + serif "NRI Tax Suite" (gold)
- Tagline: "AI-Assisted NRI Tax Filing, Advisory & Compliance"
- Credential line: "CA | CS | CMA | IBBI Registered Valuer"

**Column 2 — Quick Links:**
- Heading: "QUICK LINKS" (uppercase, small)
- Links (all hover to gold):
  - Home → `/`
  - Start Filing → `/client`
  - Knowledge Hub → `/blog`
  - Track Case → `/portal`
  - Team Login → `/login`

**Column 3 — Contact:**
- Heading: "CONTACT" (uppercase, small)
- Email icon + `tax@mkwadvisors.com` (mailto link, hover gold)
- WhatsApp icon + "+91 96677 44073" (link: `https://wa.me/919667744073`, `_blank`)
- Clock icon + "Mon–Sat 10AM–7PM IST" (plain text)

**Bottom bar:**
- Left: "© 2026 MKW Advisors. All rights reserved."
- Right: "Privacy" → `/privacy` | "Terms" → `/terms` (hover gold)

---

## SCREEN 1: HOMEPAGE (`app/page.js`)

**Nav:** NavBar with `variant="transparent"` (transparent until scroll)

**State:**
- `vis` (boolean) — triggers CSS opacity/translateY entrance animation
- `hasDraft` (boolean) — set if `localStorage['nri-intake-draft']` is non-empty
- `hasSession` (boolean) — set if `sessionStorage['nri-mycases-session']` exists

---

### SECTION 1 — HERO

**Return visitor banners (conditional, shown above badge):**
- If `hasDraft`: pill link "↩ Continue your assessment" → `/client` (gold border, gold text)
- If `hasSession && !hasDraft`: pill link "↩ View your cases" → `/my-cases` (green border, green text)

**Badge:** `FY 2025-26 · AY 2026-27 · CII 376` (pill, `var(--bg-badge)` / `var(--text-badge)`)

**H1:** "NRI Tax Filing, Advisory" + line break + "&amp; Compliance — Done Right" (accent color for second line)

**Gold decorative line:** 16px wide, gradient, centered

**Subtext:** "Expert-led, AI-assisted tax filing for Non-Resident Indians — because your cross-border finances deserve more than a generalist CA."

**Buttons (flex row, col on mobile):**
- "Start Your Tax Filing →" → `/client` (`btn-premium` class)
- "How It Works" → `#how` anchor (outline with gold border, hover fill)

**Micro-copy below buttons:** "Free diagnostic · No obligation · Results in minutes"

**Dark theme:** radial gold gradient glow behind hero. Light theme: subtle cross-hatch SVG texture.

---

### SECTION 2 — STATS STRIP (bg-secondary)

4 stats in a 2×2 (mobile) / 1×4 (desktop) grid:
- `2,800+` — NRI Clients Served
- `18+` — Countries Covered
- `₹120Cr+` — Tax Computed
- `99.7%` — Filing Accuracy

---

### SECTION 3 — PAIN POINTS (hard-coded dark `#0f0f0f` background)

**Section label:** AlertTriangle icon (red) + "COMMON NRI TAX PROBLEMS" (red, uppercase)

**H2:** "Why NRIs Lose Money on Indian Taxes"

**Subtext:** "These aren't hypothetical scenarios. We see every single one of these every week."

**2×2 card grid** (left red border `#dc2626`, hover brightens to `#f87171`):

| Card | Headline | Detail | Stat pill |
|---|---|---|---|
| 1 | Wrong TDS Deducted by Buyer | Buyer deducted 1% TDS instead of 20% + surcharge. Now a shortfall notice. | "78% of NRI property sellers face this" |
| 2 | Filed as Resident by Mistake | CA filed you as Resident. Worldwide income taxable — notice demands explanation. | "Most common NRI filing error" |
| 3 | ₹15L+ Locked in Excess TDS | Excess TDS deducted on property sale, no refund filed. Money sits with govt. | "Average excess: ₹12–18 lakhs" |
| 4 | Missed Section 54 Deadline | Sold property but missed reinvestment window. Entire LTCG taxable. | "Deadline: 2 years (purchase) / 3 years (construct)" |

**Resolution CTA:** CheckCircle icon (gold) + "We fix all of this. Every single case." pill + "Get Your Free Diagnostic →" button → `/client`

---

### SECTION 4 — HOW IT WORKS (id="how", bg-primary)

**Section label:** "OUR PROCESS" (accent, uppercase)

**H2:** "How It Works"

**4-column card grid** (each card has gold icon in square, step number, title, description):

| Step | Title | Description |
|---|---|---|
| 1 | Describe Your Situation | Type in plain English or fill a simple form. AI extracts and organizes everything. |
| 2 | AI Analyzes | 10 specialist modules review residency, income, capital gains, DTAA, and more. |
| 3 | Get Deliverables | Download professional computation sheets, advisory memos, and engagement documents. |
| 4 | File with Confidence | Expert-reviewed filing with pre-filing risk check and post-filing support. |

Icons: ClipboardList, Bot, FileText, CheckCircle (lucide-react)

---

### SECTION 5 — WHAT WE HANDLE (bg-secondary)

**Section label:** "OUR SERVICES" (accent-secondary)

**H2:** "What We Handle"

**Top 2 large cards** (icons: HomeIcon, Globe):
- "Property Sale Tax" — Dual computation (20% indexed vs 12.5% flat), Section 54/54EC planning
- "Residential Status" — Stay-day analysis, RNOR review, deemed resident check

**Bottom 4 smaller cards** (icons: Shield, Building2, BarChart3, Search):
- "DTAA / FTC" — Treaty benefit analysis, foreign tax credit eligibility
- "Rental Income" — House property computation, standard deduction, loan interest
- "Investments" — NRO/FD interest, dividends, MF gains, ESOP/RSU
- "AIS Reconciliation" — Mismatch detection, TDS credit verification

---

### SECTION 6 — TESTIMONIALS + AUTHORITY (bg-elevated, gold divider line above)

**Section label:** "CLIENT STORIES" (accent)

**H2:** "Trusted by NRIs Across 18+ Countries"

**Country flags row:** 6 flag images (US, GB, UAE, SG, CA, AU) + "& more" text

**3 testimonial cards** (each with Quote icon, quote text, flag, name, role, country):

| Quote | Name | Role | Country |
|---|---|---|---|
| "After years of struggling with cross-border compliance, this team brought clarity and peace of mind. Their attention to detail on my property sale was exceptional." | Rajesh K. | Software Engineer | Singapore |
| "I had excess TDS of ₹17 lakhs stuck for two years. They not only filed the refund but restructured my entire India portfolio to be tax-efficient going forward." | Priya M. | Investment Banker | London |
| "My previous CA filed me as Resident and I was facing global income tax liability. They corrected my status, filed revised returns, and saved me over ₹24 lakhs." | Amit S. | Business Owner | Dubai |

---

### SECTION 7 — PRICING (bg-primary)

**Section label:** "ENGAGEMENT MODELS" (accent, uppercase)

**H2:** "Simple, Transparent Pricing"

**3-column pricing tier cards:**

| Tier | Price | Tagline | Features |
|---|---|---|---|
| Standard | ₹8,000 – 30,000 | Filing & Advisory | ITR preparation & e-filing; Residential status determination; Up to 3 income heads; Email support |
| Premium | ₹35,000 – 75,000 | Most Popular (gold "POPULAR" tag, highlighted) | Everything in Standard + Property sale dual CG computation + DTAA treaty benefit analysis + ESOP/RSU taxation + Section 54/54EC planning + Dedicated advisor + priority support |
| Retainer | ₹1,00,000+ / yr | HNI & Ongoing | Everything in Premium + Year-round tax planning + Quarterly portfolio reviews + Priority response within 4 hours |

**CTA below pricing:** "Not sure which tier fits? Start with our free diagnostic." + "Get Free Diagnostic →" → `/client`

---

### SECTION 8 — FINAL CTA (bg-primary)

(Two-column layout with image/illustration placeholder on desktop)

**Left column:**
- "Ready to Sort Your NRI Taxes?" (serif H2)
- Bullet points:
  - "Free AI diagnostic in under 2 minutes"
  - "Professional computation sheets"
  - "CA-reviewed filing"
  - "Used by 2,800+ NRIs across 18+ countries"
- Buttons:
  - "Start Your Assessment →" → `/client` (`btn-premium`)
  - "Track an existing case" → `/portal` (text link, gold)

**Micro-copy:** "Free diagnostic · No credit card required · Response within 24 hours"

---

**Footer:** Standard shared Footer component

---

## SCREEN 2: SMART ASSESSMENT / CLIENT INTAKE (`app/client/page.js`)

**Nav:** NavBar (solid)

**State (localStorage persistence):** All form data `f` saved to `localStorage['nri-intake-draft']` on every change. Restored on mount.

**State variables:** `step` (0–3), `f` (form object), `narr` (narrative text), `prs` (parsing), `submitted`, `caseRef`, `portalToken`, `parseDone`, `fadeDir`, `submitting`, `copied`

**Step progress bar:** Full-width gold bar, fills `(step+1)*25%`

**Step label below bar:** One of: "Where are you?", "What's happening?", "Your preview", "Get your diagnostic"

**Back button:** Left of title "Smart Tax Assessment" / "Free NRI Tax Diagnostic · FY 2025-26"

---

### STEP 0 — WHERE ARE YOU?

**H2:** "Where do you live?"
**Subtext:** "Your country determines which tax treaty applies and how much TDS you should actually be paying."

**Country grid (3 cols / 4 cols on sm)** — 12 options, toggle selection with gold border/background:
United Kingdom, United States, UAE, Singapore, Canada, Australia, Germany, Saudi Arabia, Qatar, Hong Kong, New Zealand, Other

**Country-specific insights panel** (appears after selection, gold left-border card):
- Label: "Tax insights for NRIs in [Country]"
- 3 bullet points per country (country-specific DTAA rates, filing obligations, key traps)
- Examples for UAE: "No income tax in UAE — but DTAA credit mechanism has limited application"; "Tax Residency Certificate (TRC) from UAE confirms non-residency for India"; "NRO interest still taxed at 30% in India — no UAE offset available"

**Continue button** (appears after country selected): "Continue →" (`btn-premium`, full width)

---

### STEP 1 — WHAT'S HAPPENING?

**H2:** "What's happening with your India finances?"
**Subtext:** "Select everything that applies. We will show you exactly what you can save."

**6 scenario toggle cards** (2-column grid, tap to select/deselect):

| Icon | Title | Hook |
|---|---|---|
| 🏠 | Sold or selling property | Most NRIs overpay Rs.2-8L on property tax |
| 🏢 | Earning rent from India | 30% standard deduction -- are you claiming it? |
| 💰 | NRO/FD interest | Banks deduct 30% TDS -- your DTAA rate may be 10-15% |
| 📊 | ESOP/RSU from employer | Two-stage taxation -- most get this wrong |
| 📋 | Need to file ITR | NRIs must file if Indian income exceeds Rs.4L |
| 🤷 | I'm not sure | Describe your situation -- AI will help |

Selected cards show CheckCircle icon (gold). Gold border + faint gold background when selected.

**AI narrative textarea** (conditional — shown only when "I'm not sure" is selected):
- Label: "Describe your situation"
- Subtext: "Our AI will read your description and figure out which scenarios apply."
- Placeholder: "Example: I work in London since 2021, came to India for about 38 days. I sold a plot in Nashik for ₹68 lakhs (bought in 2017 for ₹22 lakhs). I also have a flat in Pune rented at ₹25,000/month. NRO interest around ₹1.4 lakhs."
- Rows: 5, resizable
- **Parsing overlay** (when `prs=true`): full overlay with pulsing ✨ + "Reading your situation..." + "Extracting details from your description"
- **Success state** (`parseDone`): green banner "Fields extracted. Review the scenarios above and continue."
- **Analyze button** (shown when text entered, not parsing): "✨ Analyze My Situation" → calls `/api/ai/parse` POST
- API call: POST `/api/ai/parse`, body: `{ narrative }`, response: `{ parsed }` — merged into form state

**Continue button** (shown when at least one scenario selected): "See what we can do for you →"

---

### STEP 2 — YOUR PREVIEW (live form + real-time computation)

**H2:** "Here's what we found"
**Subtext:** "Enter a few numbers below. We compute your tax position live."

**Property Sale section** (shown if `f.propertySale`):
- H3: "Property Sale Details"
- Subtext: "Just 3 numbers -- we will show you both tax options instantly"
- 3-column grid:
  - Input: "SALE PRICE" (number, placeholder: "6800000")
  - Input: "PURCHASE COST" (number, placeholder: "2200000")
  - Select: "YEAR OF PURCHASE" (FY 2005-06 through FY 2025-26, from CII data)
- **Live computation preview** (appears when salePrice and purchaseCost filled):
  - Label: "LIVE TAX PREVIEW" (gold, uppercase)
  - H2: "You could save [formatINR(savings)]" (green, serif)
  - Text: "Without expert filing: [optionA.total] tax. With dual computation: [min(optionA, optionB)]. That's [savings] saved."
  - TDS warning box (red left border): "Important: Buyer deducts ~[tds195] TDS (20% of sale price for NRIs). Your actual tax is only [netTax]. We file a refund for the difference."

**Additional fields per scenario (conditional):**
- Rent: "Monthly Rent (₹/month)", "Rental Details" textarea
- Interest: "NRO Interest (₹/yr)", "FD Interest (₹/yr)"
- ESOP/RSU: "ESOP Employer", "Grant Date"
- DTAA data panel (if country selected and `dtaaData` exists): shows DTAA rate for that country

**Personal info section (shown when any scenario selected):**
- 2-column grid:
  - Input: "YOUR NAME" (text, placeholder: "Rajesh Mehta")
  - Input: "EMAIL" (email, placeholder: "you@email.com") — tip: "We send you a copy of this analysis"
  - Input: "PHONE" (tel, placeholder: "+91 98765 43210") — tip: "WhatsApp for updates + case tracking"
  - Select: "FINANCIAL YEAR" (2025-26, 2024-25)
  - Input: "APPROX. DAYS IN INDIA" (number, placeholder: "38") — tip: "For residency assessment. Estimate is fine."
  - Select: "OCCUPATION" (IT Professional, Business Owner, Finance/Banking, Doctor/Healthcare, Engineer, Other Professional)
  - Select: "YEARS ABROAD" (<1yr, 1-3yr, 3-5yr, 5+yr)

**Contextual CTA button** (full width, shown when name + email entered):
- Property sale: "Get Your CG Computation + Refund Estimate"
- Rent: "Get Your HP Tax Position"
- ESOP/RSU: "Get Your ESOP Tax Breakdown"
- Default: "Get Your Tax Diagnostic"

---

### STEP 3 — GET YOUR DIAGNOSTIC (review + submit)

**H2:** "Review &amp; Submit"
**Subtext:** "We will create your case file and start the AI analysis immediately."

**Classification badge** (computed from form data):
- Green: simple case
- Amber: moderate
- Red: complex (property sale, ESOP, DTAA)

**Classification description** (below badge, matching text)

**CG preview card** (shown if `cgData` exists):
- Shows Option A (20% indexed) vs Option B (12.5% flat) comparison
- "Option [X] saves [amount]"

**DTAA insight card** (if country with DTAA data):
- Shows applicable treaty rate

**"What happens next" list:**
- AI analysis in 2-5 minutes
- CA review within 1 business day
- Deliverables: computation sheet, advisory memo, engagement quote

**Submit button:** contextual label (from `getContextualCTA(f)`) → calls `handleSubmit()`
- API call: POST `/api/cases/public`, body: `{ formData: f, fy, classification }`, response: `{ success, caseRef, portalToken }`
- On success: clears `localStorage['nri-intake-draft']`, sets `submitted=true`
- Loading state: button shows "Submitting..." (disabled)
- Error state: no explicit error UI shown (silent fail, button re-enables)

---

### SUBMITTED STATE

**Entrance animation:** CheckCircle icon (40px, green) in pulsing circle

**H2:** "Assessment Complete!"
**Subtext:** "Your case has been submitted to our tax desk"

**AI Analysis notice card:** "AI Analysis in Progress" — "Our 9 specialist modules are analyzing your case. This typically takes 2-5 minutes." — "You will receive a WhatsApp notification when your findings are ready."

**Tracking code card** (shown if `portalToken` exists):
- Label: "Your Tracking Code"
- Large monospace code (e.g. `ABCD1234EFGH5678IJKL9012`)
- "Copy" button (inline) → copies to clipboard, shows "Copied!" for 2 seconds
- Link: "Track your case status →" → `/portal?ref=[token]`
- Subtext: "Save this code to check your case progress anytime"

**No token fallback card:** "Case Submitted" — "Our team will contact you at [email/phone] within 24 hours." — link to `/my-cases`

**Hero savings banner** (shown if `cgData`):
- Large green: "Potential Tax Savings Identified" + "₹[savings]" (serif, 5xl)
- "Option [X] is more favourable for you"

**H1:** "Your Tax Diagnostic is Ready"

**Classification card:**
- Title: "Case Classification" + colored badge (Green/Amber/Red)
- Description matching classification
- Factor pills: "Property sale detected", "ESOP/RSU income", "Foreign tax paid — DTAA review needed", "NRO/FD interest — TDS optimization", "Rental income — HP deductions"
- Timeline: Green=5-7 days, Amber=8-12 days, Red=10-15 days

**CG Analysis preview card** (if `cgData`):
- Side-by-side: Option A (20%) vs Option B (12.5%)
- "Option [X] saves you [amount]"
- "Plus Section 54/54EC could reduce this further or eliminate it entirely"

**What You Will Get (4 cards, 2×2 grid):**
- 📄 CG Computation Sheet — "Dual-option working with indexation comparison"
- 📝 Client Advisory Memo — "Professional analysis of your tax position"
- 📈 Tax Position Report — "Full diagnostic summary with recommendations"
- 📋 Engagement Quote — "Clear scope, timeline & transparent pricing"

**Recommended Service card** (matches classification):
- Green: "Basic Filing · ₹8,000 – ₹15,000" + 3 bullet points
- Amber: "Advisory Filing · ₹18,000 – ₹30,000" + 5 bullet points
- Red: "Premium Compliance · ₹35,000 – ₹75,000" + 6 bullet points

**Ready to Proceed? CTA card** (gold border, gold background tint):
- H3: "Ready to Proceed?"
- Subtext: "Our team will review your intake and prepare a detailed engagement scope within 24 hours."
- Button 1: "Email Us to Proceed →" (`mailto:tax@mkwadvisors.com` with pre-filled subject/body)
- Button 2: "WhatsApp Us" (green, opens `https://wa.me/919667744073` with pre-filled text)
- "Or call: +91-96677 44073"

**Confidentiality footer:** "🔒 Your data is encrypted and confidential. We respond within 24 hours."

**Footer:** Standard Footer component

---

## SCREEN 3: CLIENT PORTAL — CASE TRACKER (`app/portal/page.js`)

**Nav:** NavBar (solid)

**Gold gradient line at top** (decorative)

**State machine:** verification-required → lookup form → loading → dashboard

**Polling:** Every 15 seconds while case stage < 4 (auto-refreshes status)

**URL behavior:** `?ref=` query param auto-triggers case lookup on load

---

### LOADING STATE (Suspense fallback)

Spinner (40px, gold top border animation) + "Loading portal..."

---

### LOOKUP FORM STATE

**Header:**
- 🔍 emoji (4xl)
- H1: "Track Your Case"
- Subtext: "Enter the case reference you received after submitting your intake."

**Form card:**
- Label: "CASE REFERENCE" (uppercase)
- Input: monospace, large font, `tracking-widest`, centered, `text-lg`, uppercase transform, `maxLength=30`, placeholder: "e.g. ABCD1234EFGH5678IJKL9012", hint: "Enter your 24-character tracking code"
- Button: "Look Up My Case" (disabled if input < 10 chars)
- Error state: red box with error message. If "not found": inline link "Submit a new intake" → `/client`

**Below form:** "Don't have a reference? Start your intake here" → `/client`

---

### VERIFICATION STATE (identity check)

**Card (centered):**
- Lock icon (🔒, 3xl)
- H3: "Verify Your Identity"
- Text: "For your security, please enter the last 4 digits of your registered phone number."
- Input: numeric only, `maxLength=4`, centered, `text-lg`, `tracking-wider`, auto-focus
- Error box (red, if error)
- Button: "Verify & View Case"
- Back link: "Back to lookup" (clears verification state)

---

### PORTAL DASHBOARD STATE

**Case ref header:**
- Label: "CASE REFERENCE" (muted, uppercase)
- Value: first 8 chars of ID (uppercase, monospace)
- If refreshing: spinner + "Refreshing..."

**Section 1 — Case Summary Card:**
- H2: Client name
- Metadata row: Country | FY [fy] (AY [ay]) | Submitted [date]
- Classification badge: colored pill (Green/Amber/Red), e.g. "Green Case"
- Subtext: classification meaning ("Straightforward case — simple filing with limited complexity")

**Section 2 — Process Timeline:**
- H3: "Your Case Progress"
- 6-stage vertical timeline (icon circle + connector line):
  1. 📋 Intake Received — "Your information has been securely received."
  2. 🤖 AI Analysis in Progress — "Our AI is reviewing your case across 9 specialist modules."
  3. 👨‍💼 Expert Review — "A senior tax advisor is reviewing the analysis."
  4. 📊 Findings Ready — "Your tax position analysis is complete."
  5. 📝 Filing in Progress — "Your return is being prepared and filed."
  6. ✅ Filed & Delivered — "Your return has been successfully filed."
  
  - Completed stages: green filled circle with checkmark
  - Current stage: gold circle, `animate-pulse-gold`, "CURRENT" pill (pulsing dot)
  - Future stages: `opacity-40`, gray circle
  - Connector lines: green if completed, gray if not
  - Completed stage shows timestamp if available

**Section 3 — Key Findings** (shown only at stage 3+, if `findings` exist):
- H3: "Key Findings"
- 2-column grid of FindingCard components:
  - "Tax Savings Identified" — `₹[cgSavings] savings via Option [cgBetter]` (green)
  - "Estimated TDS Refund" — `₹[tdsRefund] refund expected` (green)
  - "Residency Status" — "Non-Resident (preliminary)"
  - "Service Tier" — Basic/Advisory/Premium (colored by classification)

**Section 4 — What We Are Doing (modules):**
- H3: "What We Are Doing"
- Right: "X of Y complete"
- Progress bar (gold while in progress, green when complete)
- 8 visible module rows (pricing module hidden):
  1. Checking Your Tax Residency
  2. Mapping Your Income Sources
  3. Verifying Your Tax Records
  4. Choosing the Right Tax Form
  5. Computing Your Capital Gains
  6. Checking Double-Tax Protection
  7. Final Quality Review
  8. Preparing Your Advisory Report
  
  - Complete: green circle with checkmark + description text
  - Current: gold ring with pulsing dot + "In progress..." label (gold)
  - Future: gray circle, muted text

**Section 5 — Documents** (shown at stage 4+):
- H3: "Documents"
- If stage 6: list of 3 docs (CG Computation Sheet, Client Advisory Memo, Tax Position Report) each with green checkmark + "Prepared" label + "Request Documents via WhatsApp" button → `wa.me`
- If stage 4-5: "Your advisor will share documents once the review is complete." (placeholder state)

**Section 6 — While You Wait:**
- H3: "While You Wait — Learn More"
- Conditional links to relevant blog posts:
  - If property sale → `/blog/nri-property-sale-capital-gains`
  - If country → `/blog/[country-slug]-nri-tax-guide`
  - Always → `/blog/nri-income-tax-filing-guide`

**Section 7 — What Happens Next:**
- H3: "What Happens Next"
- Dynamic text based on stage (1-6)
- If stage ≤ 2: animated pulse dot + "This page updates automatically every 15 seconds"
- "This page auto-refreshes every 15 seconds. Bookmark it to check anytime."

**ContactBar component** (fixed bottom or inline)

**Footer:** Standard Footer component

---

## SCREEN 4: MY CASES — CLIENT PORTAL DASHBOARD (`app/my-cases/ClientPortalDashboard.js`)

**Session storage key:** `nri-mycases-session`

**State machine:** `screen` — `'login'` | `'verifying'` | `'dashboard'`

**Session restore:** On mount, checks sessionStorage. If valid session exists with `verified=true`, jumps directly to dashboard.

---

### LOGIN SCREEN

**Header:**
- User icon (40px circle, gold border, gold stroke)
- H1: "Track Your Cases"
- Subtext: "Enter the email you used during intake to access all your cases"

**Form card:**
- Label: "YOUR EMAIL ADDRESS" (uppercase)
- Input: email, `autoFocus`, `autoComplete="email"`, placeholder: "name@example.com"
- Error box (red, conditional)
- Submit button: "Access My Cases →" (disabled if email invalid or loading)
  - Loading: spinner + "Looking up..."
  - API call: POST `/api/my-cases`, body: `{ email }`, response: `{ count, clientName }`, transitions to `'verifying'` screen

**Below form:**
- "Have a tracking code instead? Track a single case" → `/portal`
- "Need to file? Start your intake here" → `/client`

---

### VERIFYING SCREEN

**Card (centered):**
- Lock icon in gold circle
- H3: "Verify Your Identity"
- "We found [N] case(s) linked to this email."

**If phone on file (default):**
- Text: "For your security, enter the last 4 digits of your registered phone number."
- 4 separate single-digit inputs (auto-advance on input, backspace to previous, paste support)
- Error box (red)
- Button: "Verify & Access →" (disabled if not 4 digits or loading)
  - Loading: spinner + "Verifying..."
  - API call: POST `/api/my-cases/verify`, body: `{ email, phone4 }`
  - Success: saves session to sessionStorage, transitions to `'dashboard'`
  - If `data.noPhone=true`: switches to DOB fallback mode

**If no phone (fallback DOB mode):**
- Text: "No phone number on file. Please verify using your date of birth, or contact us on WhatsApp."
- Date input (YYYY-MM-DD format)
- Hint: "Enter your date of birth (YYYY-MM-DD)"
- Error box
- Button: "Verify & Access →"
- WhatsApp fallback: "Having trouble? Contact us on WhatsApp and we will help you access your cases."

**"← Use a different email" link** (back to login screen)

---

### DASHBOARD SCREEN

**Header row:**
- H1: "Welcome, [clientName]" (serif, 2xl-3xl)
- Email address (secondary text)
- Logout button (right-aligned, red on hover) — clears sessionStorage, resets to login

**Summary bar (4 cards, 2×4 grid):**
- "Total Cases" — count (gold)
- "In Progress" — count of stages 2-5 (amber)
- "Findings Ready" — count of stage 4 (green)
- "Filed" — count of stage 6 (green)

**Cases list** (expandable cards, space-y-4):

Each case card header (clickable, expands):
- Left: Stage indicator circle (emoji or checkmark, gold/green)
- Case reference (monospace, first 8 chars, uppercase)
- Classification badge (colored pill)
- FY, Country, Submission date
- Right: StatusBadge + chevron (rotates 180° when expanded)
- Below: progress bar (modules done / 9) + "X/9 modules" label

**Expanded card content:**
- H4: "Case Progress" — 6-stage vertical timeline (same as portal)
- H4: "Analysis Modules" — checklist of 8 modules with completion status and timestamps
- Footer: "View Full Details →" → `/portal?ref=[portal_token]` (if token exists) OR WhatsApp link

**Empty state** (if no cases):
- 📢 emoji
- H3: "No Cases Found"
- Text: "We could not find any cases linked to your email."
- Link → `/client`

**ContactBar component** at bottom

**Footer:** Standard Footer

---

## SCREEN 5: TEAM DASHBOARD (`app/dashboard/page.js`)

**Auth:** Checks Supabase session on load. Redirects to `/login` if not authenticated.

**State machine:** `view` — `'home'` | `'wizard'` | `'case'` | (deliverable view)

---

### HOME VIEW (case list)

**Nav (custom, not NavBar component):**
- Left: "NRI TAX SUITE" (serif, gold, clickable → home view)
- Right: version badge "v3 · FY [fy]" + ThemeToggle + settings icon (gear, links to `/admin`, shown only for admin/partner roles) + username (email prefix, hidden on mobile) + "Logout" button (red hover)

**Stats row (4 cards):**
- Total — count (primary text color)
- Green — count (green)
- Amber — count (amber)
- Red — count (red)

**Action bar:**
- "+ New NRI Case" button → opens wizard view
- FY selector dropdown: "FY 2025-26" / "FY 2024-25"

**Search/filter/sort bar** (shown if cases.length > 0):
- Text input: "Search by name, email, phone, PAN..." (flex-1)
- Status filter dropdown:
  - All Status
  - Intake
  - In Progress
  - Review
  - Findings Ready
  - Filing
  - Filed
  - Closed
- Sort dropdown: Newest | Oldest

**Cases list** (each row):
- Client name (bold) + urgent red dot (if `formData.priority === 'urgent'`) + email (muted) + phone (muted)
- Country · FY
- Right: classification badge (colored, font-bold, rounded-full) + 🔗 copy portal link button (stops propagation, copies to clipboard, shows toast) + "X/9" modules + "›" chevron
- Click row → loads case into case view (also loads module outputs from Supabase)

**Empty state:**
- Amber warning card: "No cases found" + setup instructions
- 📋 icon + "No cases yet" + "Click 'New NRI Case' to start"

**Toast notification** (fixed bottom-right, auto-dismisses after 4s):
- Success: gold background
- Error: red background
- Has ✕ close button

---

### WIZARD VIEW (new case, 5 steps)

**Nav:** "NRI TAX SUITE" (gold, back to home) + ThemeToggle

**Step titles:** Quick Start | India Connections | Income & Transactions | Documents | Review

**Progress bar + "Step X/5" label**

**Step 0 — Quick Start:**
- "Describe the situation (AI auto-fill)" card with gold left border:
  - Textarea (3 rows, resizable)
  - "AI Auto-Fill" button (disabled if empty or parsing; shows "Reading..." while loading)
  - API call: POST `/api/ai/parse`
- Divider: "— or fill manually —"
- Manual form (2-column grid):
  - "Name *" (text, placeholder: "Rajesh Mehta")
  - "Country *" (Select, 12 country options)
  - "Email" (email input, `placeholder: "client@email.com"`)
  - "Phone" (tel input, `placeholder: "+91 98765 43210"`)
  - "Occupation" (text, placeholder: "IT Manager")
  - "Years abroad" (Select: <1yr, 1-3yr, 3-5yr, 5+yr)
- Continue button: "Continue →" (disabled unless name + country filled)

**Step 1 — India Connections:**
- 2-column grid (many fields):
  - "Stay days" (number, tip: "Approximate OK")
  - "Source" (Select: Estimate, Passport, Travel summary)
  - "Family in India?" (Select: Yes, No, Partly)
  - "Property sold?" (Select: No, Yes — toggles property sub-fields)
  - Property sub-fields (shown when propertySale=Yes):
    - "Acquisition FY" (Select, CII years, tip about pre/post Jul 2024)
    - "Sale price ₹" (number)
    - "Purchase cost ₹" (number)
    - "Location" (text, placeholder: "Nashik")
    - "Section 54" (wide, Select: Not discussed, House purchased, Planning purchase, Considering 54EC, Not applicable)
    - "Property type" (Select: Residential Flat, Residential Plot, Commercial, Agricultural Urban, Agricultural Rural)
    - "Stamp duty ₹" (number, tip: "Circle rate")
    - "Registration ₹" (number)
    - "TDS by buyer ₹" (number, tip: "From Form 16B")
    - "Improvement ₹" (number)
    - "Sec 197" (Select: Not applied, Applied, Obtained, N/A)
    - "Pre-2001?" (Select: No, Yes — FMV as cost)
    - "Co-owner" (text, placeholder: "If joint")
    - "Co-owner PAN" (text)
  - "PAN" (text, uppercase transform)
  - "DOB" (date input)
  - "Aadhaar" (text, placeholder: "1234 5678 9012")
  - "Stay 4yr (days)" (number, tip: "Preceding 4 years total")
  - "Stay 7yr (days)" (number, tip: "Preceding 7 years total")
- Navigation: "← Back" + "Continue →"

**Step 2 — Income & Transactions:**
- "Indian Income" card (2-column checkboxes): Salary, Rental, Interest, Dividends, CG-Shares, CG-MF, CG-ESOP, Business
- If `rent || interest`: additional inputs (Monthly rent, NRO interest, FD interest)
- If `salary || cgESOPRSU || rent`: Salary amount, ESOP employer, ESOP listed status, Home loan interest, Municipal tax
- "Cross-Border" card: checkboxes for Foreign salary, Tax paid abroad
- If foreignSalary: "Foreign salary [currency]", "Foreign tax paid ₹"
- "New Tax Regime?" (Select: Yes, No)
- Navigation: Back + Continue

**Step 3 — Documents:**
- Checklist of required documents (checkboxes to mark as available):
  - AIS / Annual Information Statement
  - Form 26AS
  - Form 16 (if salary)
  - Property Sale Deed (if propertySale)
  - Form 16B from buyer (if propertySale)
  - Bank statements (NRO/NRE)
  - Passport travel history
  - Foreign tax documents
- Notes textarea (wide)
- Navigation: Back + Continue

**Step 4 — Review:**
- Classification badge
- CG preview (if applicable)
- "Create Case" button → `startCase()` → saves to Supabase, transitions to case view

---

### CASE VIEW

**Nav:** "NRI TAX SUITE" (back) + ThemeToggle

**Left panel / tabs:**
- 10 module tabs (MODS array): intake, residency, income, pricing, recon, filing, cg, dtaa, prefiling, memo
- Each tab: colored icon + label + completion indicator
- Internal modules (int:true) marked differently

**Right panel — module content:**

For the active module:
- Module header with icon, label, color, and optional checkpoint label
- Run button: "▶ Run [Module Name]" (calls AI, shows loading)
- Output area: `<ModuleOutput>` renders markdown
- Special intake module: shows form summary instead of AI output

**For `cg` module** — live `<CGPreview>` component:
- Full computation sheet with MKW Advisors header
- Transaction Details table
- Key Amounts table
- Option A (20% with indexation) full working
- Option B (12.5% flat) full working
- Comparison table with recommended option + savings callout (green)
- Section 54/54EC action box (red)
- TDS Section 195 table with refund calculation (blue insight)
- Net Tax Summary table
- Disclaimer footer

**For `memo` module** — `<MemoPreview>` component:
- MKW Advisors header
- Facts Captured (bullet list from form data)
- Assumptions (numbered list)
- Key Issue — Capital Gains (if cgData)
- FTC Clarification (if foreignTaxPaid)
- Rental Income (if rentalMonthly)
- Recommended Actions (numbered list)

**Deliverables panel:**
5 deliverable buttons (DELS array):
1. "CG Computation Sheet" — requires `cg` module — downloads `.docx` via `/api/deliverables`
2. "Client Advisory Memo" — requires `memo` module
3. "Tax Position Report" — requires `income`, `pricing` modules
4. "Computation of Total Income" — requires `income`, `cg` modules
5. "Scope & Fee Note" — requires `pricing` module

Each deliverable card:
- Status: locked (modules not run), ready (can download)
- Preview button (shows inline preview)
- Download DOCX button (calls `/api/deliverables` POST, downloads blob as `[name]-[type].docx`)
- Print button (opens new window with styled HTML, calls `window.print()`)

**PAN Verification** (shown when PAN available in form data):
- "Verify PAN" button → POST `/api/verify-pan`, shows result
- Result states: verified (green), not found, error

**Toast:** same as home view

---

## SCREEN 6: ADMIN PANEL (`app/admin/page.js`)

**Auth:** Redirects to `/login` if not authenticated; redirects to `/dashboard` if role is not `admin` or `partner`.

**Loading state:** Gear icon (animated pulse) + "Loading admin panel..."

**Nav:**
- Left: Back arrow → `/dashboard` + "ADMIN SETTINGS" (serif, gold)
- Right: "Admin Panel" badge + ThemeToggle + username + "Logout" button (red hover)

**Layout:** 2-column (sidebar + content) on desktop; mobile tab bar at top.

---

### SIDEBAR (desktop only, 56px wide, bg-secondary)

- Header: gear icon + "Settings" + "Platform Control"
- Nav items (4 tabs, gold left border on active):
  - API Keys (key icon)
  - Team (users icon)
  - Firm Settings (building icon)
  - System (activity icon)
- Footer: "← Back to Dashboard" link

**Mobile tab bar** (fixed below nav, z-40):
- Same 4 tabs, gold bottom border on active

---

### TAB: API KEYS

**H1:** "API Integrations"
**Subtext:** "Configure external service connections. API keys are stored as environment variables on the server." + "Update via Vercel Dashboard" link (external)

**Integration cards** (from `integrations` object, dynamically rendered):

Each card contains:
- Header: StatusDot (green glowing if configured, gray if not) + integration label + "Configured"/"Not configured"
- Optional pricing badge (e.g. "$5/1K tokens")
- Fields (per integration type):
  - `anthropic`: API Key (masked) + Model (read-only text)
  - `supabase`: Project URL (read-only) + Service Role Key (masked)
  - `pan`: API Key (masked)
  - `eri`: API Key (masked) + API URL (read-only)
  - `whatsapp`: API Key (masked) + Sender Number (read-only)
  - `digilocker`: Client ID (masked) + Client Secret (masked)
  - `setu`, `cams`, `resend`, `sentry`, `razorpay`: API Key(s) (masked)
- Env vars list (monospace code chips)
- Test result box (green/red) if test was run
- Footer: "Used for: [description]" + signup URL link (external) + "Test Connection" button (disabled if not configured or testing)

**MaskedInput component:** password-type input with eye/eye-off toggle button, read-only

**StatusDot:** 10px circle, green with glow when configured, gray when not

**How to update API keys instructions** (gold left border card):
4 numbered steps: Vercel Dashboard → Settings → Environment Variables → redeploy

---

### TAB: TEAM

**H1:** "Team Members"
**Subtext:** "[N] member(s) total."

**Invite Team Member form:**
- 4-column grid (md):
  - Email address * (required)
  - Full name (text)
  - Role selector: Preparer | Senior Associate | Partner
  - "Send Invite" button (disabled if no email, shows "Sending...")
  - API call: PUT `/api/admin/team`, body: `{ email, fullName, role }`
- Success/error message below form

**Team members table (header row):** Member | Role | Cases | Status | Joined

**Each team member card:**
- Avatar (initials circle, colored by role)
- Name + email
- Role selector (inline dropdown, onChange calls POST `/api/admin/team` with `{ memberId, role }`)
- Cases count
- Status (Active/Deactivated)
- Joined date

**Role colors:**
- admin: gold
- partner: green
- senior: blue (#5670A8)
- preparer: brown (#6b6256)
- client: gray
- deactivated: red

**Empty state:** Users icon (large, faint) + "No team members found" + "Team members appear here after signing up"

---

### TAB: FIRM SETTINGS

**H1:** "Firm Settings"

Form fields (from `firmForm` state, all editable):
- Firm Name
- GST Number
- CA Registration Number
- Address (textarea)
- Primary Email
- Primary Phone
- WhatsApp Number
- Website URL

**Save button:** "Save Settings" (calls POST `/api/admin/settings`, shows "Saving..."; toast on success/error)

---

### TAB: SYSTEM

**H1:** "System Status"

**Stats cards** (from `stats` API):
- Total Cases
- Cases This Month
- AI Modules Run
- Documents Generated

**Database status card:** connection indicator

**Quick actions:**
- "View All Cases" → `/dashboard`
- "Clear Cache" (if applicable)

---

## SCREEN 7: LOGIN (`app/login/page.js`)

**Nav:** NavBar (solid)

**State:** `email`, `password`, `error`, `loading`, `resetMode`, `resetSent`

**Header (centered, with entrance animation):**
- H1: "Welcome Back" (serif, 3xl)
- Subtext: "Sign in to your account"
- Gold accent bar (3px tall, 16px wide, gradient)

**Card (max-w-md, centered, `p-8`):**

**Login mode (default):**
- Label: "EMAIL" (uppercase, tracking-wide, xs, secondary color)
  - Input: email type, placeholder: `you@email.com`, required
- Label: "PASSWORD" (uppercase)
  - Input: password type, placeholder: "••••••••" (bullet chars), required
- "Forgot password?" button (right-aligned, text only, accent color) → sets `resetMode=true`
- Error box (red, conditional): shows API error message
- Submit button: "Sign In" / "Signing in..." (disabled while loading, full-width, `btn-dark`)

**Below card links:**
- "Need team access? Contact your administrator" (mailto: `tax@mkwadvisors.com`)
- "NRI client? Start filing directly →" → `/client`

**On successful login:**
- Fetches Supabase user profile
- If `role === 'client'`: redirects to `/client`
- Otherwise: redirects to `/dashboard`

**Reset mode:**
- Label: "EMAIL" + input
- Error box (conditional)
- Submit button: "Send Reset Link" / "Sending..."
- "Back to login" link
- API call: `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/login' })`

**Reset sent state:**
- Green success box: "Password reset email sent. Check your inbox."
- "Back to login" button

**Footer trust text:**
- Lock icon + "Protected by enterprise-grade encryption"

---

## SCREEN 8: SIGNUP / ACCESS REQUEST (`app/signup/page.js`)

**Nav:** NavBar (solid)

**Single centered card (max-w-md):**
- H1: "Team Access" (serif, 2xl)
- Text: "Team accounts are created by the administrator. If you need access to the NRI Tax Suite dashboard, please contact your team lead."
- "Request Access" button (`btn-primary`, `mailto:tax@mkwadvisors.com`)
- "Already have access? Login here" → `/login`

No form. No inputs. No API calls. Static informational page only.

---

## SCREEN 9: BLOG HUB (`app/blog/BlogHubClient.js`)

**Nav:** NavBar (solid)

**State:** `activeTopic` ('all' or topic id), `searchQuery`, `email` (lead capture), `leadSubmitted`

**Data:** Receives `blogs` array as prop (from server component). Auto-computes `featured`, filtered by topic/search, grouped by topic.

---

### HERO SECTION

**Badge:** "NRI Knowledge Hub · FY 2025-26 · Updated March 2026"

**H1:** "The NRI Tax " + "Knowledge Hub" (accent color)

**Subtext:** "India's most comprehensive NRI tax resource. Expert guides by CA Mayank Wadhera covering every aspect of NRI taxation, compliance, and financial planning."

**Stats bar (4 cards, 2×4 grid):**
- [dynamic blog count] — Expert Guides
- 576K+ — Words of Content
- 30+ — Countries Covered
- FY 2025-26 — All Numbers Verified

---

### FEATURED SLIDER (shown only when `activeTopic='all'` and no search)

**H2:** "Featured Guides"

**Slider card (auto-advances every 6 seconds):**
- Entire card is an `<a>` link to the blog post
- Left column: icon (3xl) + category badge (colored) + read time + H3 title + subtitle (accent) + excerpt + "QUICK ANSWER" panel (colored left border)
- Right column (md:w-64): grid of key numbers (up to 4) + "Read Full Guide →" CTA button

**Slider dots:** one per featured blog, click to jump, active dot scales 1.3x

---

### COUNTRY QUICK-ACCESS (shown only when `activeTopic='all'` and no search)

**H2:** "Guides by Country"
**Subtext:** "Country-specific tax guides tailored to your jurisdiction."

**Horizontally scrollable row** (hidden scrollbar, smooth scroll):
11 country cards (each 144px wide):
- Flag image (32×22, rounded)
- Country name (bold)
- Stat badge (accent color): e.g. "FBAR + FATCA + PFIC", "Zero-Tax Trap", "DTAA 15%"

Countries: USA, UAE/Dubai, UK, Canada, Australia, Singapore, Germany, Saudi/GCC, Qatar, Oman, Kuwait

**Left/right arrow buttons** (hidden on mobile, scroll row by 300px on click)

---

### LEAD CAPTURE (shown only when `activeTopic='all'` and no search)

**Section (gold tint background):**
- 📋 emoji
- H3: "Free NRI Tax Checklist 2026"
- Text: "Get our comprehensive 47-point NRI tax compliance checklist..."
- Bullet list:
  - "✓ Pre-filing checklist (AIS/26AS reconciliation)"
  - "✓ TDS optimization guide"
  - "✓ Country-specific DTAA quick-reference card"
  - "✓ Property sale tax computation template"
- Right side (md:w-80):
  - Email input (placeholder: "Your email address")
  - "Download Free Checklist →" button
  - "No spam. Unsubscribe anytime."
  - API call on submit: POST `/api/leads`, body: `{ email, source: 'blog-hub' }`; fallback to localStorage `nri-leads` array
  - **Success state:** ✅ emoji + "Thank you!" + "Start Assessment →" CTA → `/client`

---

### INTERACTIVE TOOLS (shown only when `activeTopic='all'` and no search)

**H2:** "Interactive Tools"
**Subtext:** "Answer your most pressing NRI tax questions in under 3 minutes — no signup required."

3 tool cards (from `ASSESSMENTS` data), each links to `/blog/assess/[slug]`:
- Icon + Title + Subtitle (accent) + Description + question count badge + time badge

---

### SEARCH + TOPIC FILTERS

**Search input:** full width, placeholder "Search 97 guides... (try: property sale, TDS, FBAR, DTAA, NRE, FEMA, ESOP)", 🔍 icon right

**Topic filter buttons** (wrapping row):
- All (includes all)
- Each topic (id, icon, label) — active state: gold background, white text
- Clicking sets `activeTopic`

**Topics include:** property, country, filing, income, banking, planning, compliance (and 'all')

---

### CONTENT AREA

**Search results mode:**
- H2: "Results for '[query]'" + count
- Empty state: 🔍 emoji + "No guides found for '[query]'" + tip text
- Results: 2-3 column BlogCard grid

**Specific topic mode:**
- Topic header card (colored top border, icon, label, description, guide count badge)
- Empty state (similar)
- 2-3 column BlogCard grid

**Curated homepage (all + no search):**
- 3 Spotlight Sections (property, country, filing — top 3 blogs each):
  - Section heading (icon + text) + "View all [N] →" button (sets activeTopic)
  - 3 BlogCard grid
- "Browse All Topics" grid of topic nav cards (each with colored top border, icon, label, description, guide count)

---

### BlogCard component:

- Colored 4px top bar
- Category badge (colored) + read time (right)
- Title (serif, hover underline)
- Excerpt (1-line clamp)
- Divider line
- Up to 2 key numbers with value (gold) + label

---

## SCREEN 10: BLOG POST (`app/blog/[slug]/BlogPostClient.js`)

**Custom inline nav (not NavBar component):**
- Left: circular "NT" logo + "NRI Tax Suite" → `/`
- Center-right: "Knowledge Hub" → `/blog` + theme toggle + "Free Assessment →" → `/client`

**Reading progress bar:** fixed top, 4px tall, colored (blog.color), fills as user scrolls

---

### ARTICLE HEADER

**Breadcrumb:** "Knowledge Hub" (accent, link → `/blog`) / "[Category]"

**Meta row:** blog.icon (3xl) + category badge (colored) + read time

**H1:** blog.title (serif, 3xl-4xl)

**Subtitle:** blog.subtitle (accent color, lg, font-medium)

**Author row (with bottom border):**
- Gold circle avatar "MW"
- "CA Mayank Wadhera" (bold)
- "CA | CS | CMA | IBBI Registered Valuer · MKW Advisors" (muted)
- "Updated March 2026" (right-aligned, muted)

**Key Numbers grid (2-4 columns):**
- Each: value (gold, bold) + label (muted)

**Quick Answer box** (blog.color left border):
- "QUICK ANSWER" label (colored)
- blog.quickAnswer text

---

### ARTICLE BODY

**Excerpt paragraph** (secondary text)

**Tags row:** pill chips (bg-card, border)

**Full blog content:** ReactMarkdown with custom components:
- h1, h2, h3, h4, p, strong, a (internal vs external), ul, ol, li
- blockquote: gold left border, gold tint background
- table: overflow-x-auto, rounded, bordered
- code (inline vs block): different styles
- pre: dark background
- hr: themed border

**Empty state** (if no blogContent): "Content coming soon" + "This guide is being written by our tax experts."

**Mid-article CTA box** (gold tint):
- 💡 emoji
- "Need personalized advice?"
- "Every NRI situation is unique. Our AI-powered tool analyzes your specific case in under 2 minutes."
- "Start Your Free Assessment" button → `/client`

**Share buttons row:**
- "SHARE:" label
- WhatsApp (green #25D366)
- Twitter (blue #1DA1F2)
- LinkedIn (blue #0077B5)
- "Copy Link" / "Link copied!" (toggles after 2s)

**Email this guide box:**
- "Email this guide to yourself" + "Get a copy + our free NRI tax checklist"
- Email input + "Send →" button
- API call: POST `/api/leads`, body: `{ email: resultEmail, source: 'blog-[slug]' }`, fallback to localStorage
- **Success state:** ✅ "Saved! Check your email for the guide + bonus tax checklist."

**Related Guides section** (up to 6 blogs, same category or matching tags):
- H2: "Keep Reading"
- Subtext: "Related guides you might find useful"
- 3-column grid of mini blog cards (colored top bar, icon, read time, title, excerpt 2-line clamp)

**Prev/Next navigation (2-column grid):**
- Prev: "← Previous" label + icon + title
- Next: "Next →" label + title + icon

**Author Bio card:**
- Gold circle avatar "MW" (14px, 56px circle)
- H3: "CA Mayank Wadhera"
- "CA | CS | CMA | IBBI Registered Valuer" (accent)
- Bio text: "Founder of MKW Advisors, specializing in NRI taxation, cross-border advisory, and capital gains planning. Part of the Legal Suvidha & DigiComply professional services ecosystem. Serving NRIs across 30+ countries."
- 3 buttons:
  - "WhatsApp" → `https://wa.me/919667744073` (external)
  - "Email" → `mailto:contact@mkwadvisors.com`
  - "Book Consultation" → `/client` (gold, bold)

**Bottom CTA block (dark bg):**
- H2: "Get Expert Help with Your NRI Taxes" (light text)
- "Our AI analyzes your situation in under 2 minutes. CA-reviewed computation. Professional deliverables."
- "Start Free Assessment →" button → `/client`

**Custom footer (inline, not shared Footer):**
- "© 2026 MKW Advisors. CA | CS | CMA | IBBI Registered Valuer"
- Links: Knowledge Hub → `/blog` | Start Filing → `/client` | Terms → `/terms` | Privacy → `/privacy`

---

## SCREEN 11: ASSESSMENT TOOLS (`app/blog/assess/[tool]/page.js`)

**Three tool definitions via `TOOLS` object:**

---

### TOOL 1: `residency-check` — "Am I an NRI?"

**Icon:** 🛂 | **Subtitle:** "Residency Status Quick Check — FY 2025-26"

**5 sequential questions (Select dropdowns):**

1. "How many days were you physically present in India during FY 2025-26?"
   - Less than 60 days (`lt60`)
   - 60 to 120 days (`60to120`)
   - 121 to 181 days (`121to181`)
   - 182 days or more (`gte182`)

2. "Are you an Indian citizen who left India for employment abroad during this FY?"
   - Yes — I left India for employment abroad (`yes`)
   - No — I was already abroad / other reason (`no`)

3. "How many days were you in India during the preceding 4 financial years combined?"
   - Less than 365 days (`lt365`)
   - 365 to 729 days (`365to729`)
   - 730 days or more (`gte730`)

4. "Is your total Indian income (before deductions) more than ₹15 lakh in this FY?"
   - Yes — more than ₹15 lakh (`yes`)
   - No — ₹15 lakh or less (`no`)
   - Not sure (`unsure`)

5. "Were you NRI (Non-Resident) in India for 9 out of the 10 preceding financial years?"
   - Yes — NRI in 9+ of last 10 years (`yes`)
   - No — I was Resident in some of those years (`no`)
   - Not sure (`unsure`)

**Result types:**

| Status | Color | Trigger |
|---|---|---|
| NRI — Clear | Green (#059669) | < 60 days |
| NRI — Employment Abroad | Green (#059669) | 60-120 days + left for employment |
| Borderline — Possible Deemed Resident | Amber (#F59E0B) | 60-120 days + high income + 365+ prev days |
| NRI — Likely | Green (#059669) | 60-120 days, no high income trigger |
| NRI — Employment Relaxation | Green (#059669) | 121-181 days + left for employment |
| HIGH RISK — Likely Resident/Deemed | Red (#DC2626) | 121-181 days + high income |
| NRI — Close to Borderline | Amber (#F59E0B) | 121-181 days, income ≤ 15L |
| RNOR | Amber (#F59E0B) | 182+ days + NRI in 9/10 prior years |
| ROR — Global income taxable | Red (#DC2626) | 182+ days, not qualifying for RNOR |
| Consult CA | Purple (#6366F1) | Fallback |

Each result shows: status badge, title, summary, tax impact, actions list (3-5 specific action items)

---

### TOOL 2: `property-tax-calculator` — "Property Sale Tax Calculator"

**Icon:** 🧮 | **Subtitle:** "Compare Both Options — 20% Indexed vs 12.5% Flat"

**6 sequential questions:**

1. "Sale price of the property (₹)" — number input, placeholder: "e.g. 8000000 for ₹80 lakh"
2. "Original purchase price (₹)" — number input
3. "Financial year of purchase" — Select with ~26 options (Before 2001-02 through 2025-26)
4. "Was the property held for more than 24 months?" — Select: Yes (LTCG) / No (STCG)
5. "Cost of improvement/renovation (₹), if any" — number input, placeholder: "0 if none"
6. "Are you planning to reinvest in another house (Section 54)?" — Select: Yes / No / Considering Section 54EC bonds

**Results:**
- STCG path (held < 24 months): STCG amount, 30% tax + cess, TDS, refund estimate, table of values
- LTCG path (held > 24 months): dual computation — Option A (20% with CII indexation) and Option B (12.5% flat), comparison table, recommended option, TDS refund estimate, Section 54/54EC impact note

---

### TOOL 3 (inferred from `ASSESSMENTS` data in BlogHubClient):

Additional assessment tools are linked from blog hub via `ASSESSMENTS` array (imported from `./data`), minimum including the residency check and property calculator.

**Tool UI pattern (shared):**

- Full-page layout with custom inline nav (same as blog post nav)
- Step-by-step question flow
- Question counter: "Question X of Y"
- Back button (returns to previous question)
- Large select cards or number inputs (varies by question type)
- Progress: fills `(currentStep / total) * 100%`
- Results page with:
  - Colored status badge
  - Title + summary + tax impact text
  - Actions list (bullet points)
  - Optional table (for calculator)
  - "Start Your Free Assessment" CTA → `/client`
  - "Share results" section
  - Related blog links

---

## SCREEN 12: TERMS OF SERVICE (`app/terms/page.js`)

**Custom inline nav (not NavBar component):**
- Left: "NRI TAX SUITE" (serif, gold) → `/`
- Right: theme toggle + "← Back to Home" link → `/`

**Content (max-w-3xl, centered):**
- H1: "Terms of Service"
- Last updated: "23 March 2026"

**9 sections**, each with gold-underlined serif H2:

1. **Service Description** — AI-assisted advisory, not substitute for CA, all AI reviewed by professionals
2. **User Obligations** — 5 bullet points: accurate info, timely docs, review deliverables, notify errors, no unlawful use
3. **Limitation of Liability** — 4 bullet points: final responsibility with client/CA, no liability for incorrect info provided, liability capped at fees paid, no outcome guarantees
4. **AI Disclaimer** — 4 bullet points: AI is starting point, reviewed by professionals, no AI output filed without review, don't rely solely on AI output
5. **Data Handling** — 4 bullet points: encrypted cloud (Supabase), not shared with third parties (except AI analysis), access controlled, 7-year retention; link to Privacy Policy
6. **Payment Terms** — 5 bullet points: fees per engagement scope, 50%/50% payment, non-refundable after work commences, scope changes need approval, GST additional
7. **Governing Law** — India law, Delhi courts jurisdiction
8. **Changes to Terms** — Right to update, email notification for material changes
9. **Contact** — Card with: "MKW Advisors — NRI Tax Desk" + `tax@mkwadvisors.com` (mailto)

**Custom inline footer:**
- "MKW Advisors" (gold, serif, bold)
- "NRI Tax Desk · CA · CS · CMA Certified"
- Links: Terms of Service (accent, current) | Privacy Policy
- "© [year] MKW Advisors. All rights reserved."

---

## SCREEN 13: PRIVACY POLICY (`app/privacy/page.js`)

**Same nav and footer pattern as Terms page.**

**H1:** "Privacy Policy" | Last updated: "23 March 2026"

**9 sections:**

1. **Data We Collect** — 5 bullet categories: personal identifiers, financial details, tax documents, residency info, communication records
2. **Purpose of Data Collection** — 4 uses: tax computation, advisory services, return filing, client communication
3. **Data Storage** — Supabase, 5 security measures: AES-256 at rest, TLS 1.2+ in transit, row-level security, automated backups, SOC 2 Type II certified
4. **Data Retention** — 7 years minimum (Indian tax law), reasons, then secure deletion/anonymization
5. **Third-Party Data Sharing** — Card: "Anthropic AI (Claude)" — case data sent for analysis, no personal identifiers retained by AI, not used for training, always reviewed. Statement: do NOT sell/share for any other purpose
6. **Your Rights** — 4 rights: Access, Correction, Deletion (subject to 7-year obligation), Portability. Email `tax@mkwadvisors.com`, 30-day response
7. **Cookies** — Minimal: auth session cookie (required), theme preference (localStorage). No analytics/tracking/advertising/third-party cookies
8. **Changes to This Policy** — Material changes via email, "Last updated" date reflects latest
9. **Contact** — Card: "MKW Advisors — NRI Tax Desk" + email + phone: `+91-96677 44073`

---

## SCREEN 14: PRODUCT TOUR / PREVIEW (`app/preview/page.js`)

This file contains **Style A** and **Style B** design variants — these are UI preview/comparison pages, not production user-facing screens.

**Style A — "Premium Financial Services"** (hard-coded dark `#0a0f1a` background, Georgia serif):

**Nav:** NT badge (gold border) + "NRI Tax Suite" | Center: Services, Advisory, Pricing, About (uppercase, spaced) | Right: "Client Portal" button (gold border)

**Hero:**
- "NRI Tax Advisory · FY 2025-26" (gold, uppercase, tracking)
- H1: "Precision Tax Advisory / for Non-Resident Indians" (D4AF37 accent)
- Gold horizontal rule (24px)
- Subtext: "Navigate India's tax complexities with confidence. Bespoke advisory..."
- 2 buttons: "Begin Your Assessment →" (gold fill) + "View Services" (gold outline)

**Stats strip** (divided row): 2,800+ NRI Clients | 18+ Countries | ₹120Cr+ Tax Computed | 99.7% Filing Accuracy

**Features grid (3 columns):**
6 service cards (top border 2px gold), icon + title (hover turns gold) + description

**Pricing grid (4 columns):** Basic Filing | Advisory Filing | Premium Compliance (Popular badge) | Annual Retainer
Each: colored dot + tier name + price + period + description + feature bullets + "Select Plan" button

**CTA banner:** "Your Cross-Border Tax / Clarity Awaits" + consultation button

**Footer:** simple flex row, nav links (Privacy/Terms/Contact)

**Style B** begins at line 200 — Modern SaaS variant (not fully read, but follows a contemporary design pattern).

---

## SUMMARY: API CALLS MADE ACROSS ALL SCREENS

| Endpoint | Method | From | Purpose |
|---|---|---|---|
| `/api/ai/parse` | POST | Client intake, Dashboard wizard | AI parses narrative text into structured form fields |
| `/api/cases/public` | POST | Client intake | Submits new case (public, no auth) |
| `/api/cases` | GET | Dashboard | Loads all cases (team auth) |
| `/api/portal` | GET | Portal tracker | Fetches case status by ref (no PII until verified) |
| `/api/portal` | POST | Portal tracker | Verifies identity with phone4, returns full case data |
| `/api/my-cases` | POST | My Cases | Email lookup (returns count + clientName) |
| `/api/my-cases/verify` | POST | My Cases | Verifies phone4 or DOB, returns cases array |
| `/api/ai` | POST | Dashboard | Runs specific AI module for active case |
| `/api/deliverables` | POST | Dashboard | Generates and downloads DOCX file |
| `/api/verify-pan` | POST | Dashboard | Verifies PAN via external API |
| `/api/leads` | POST | Blog hub, Blog post | Captures email lead (fallback: localStorage) |
| `/api/admin/settings` | GET | Admin | Loads API key configuration + integration status |
| `/api/admin/settings` | POST | Admin | Saves firm settings |
| `/api/admin/settings?test=[id]` | GET | Admin | Tests a specific API integration |
| `/api/admin/stats` | GET | Admin | Loads system statistics |
| `/api/admin/team` | GET | Admin | Lists team members |
| `/api/admin/team` | POST | Admin | Updates team member role |
| `/api/admin/team` | PUT | Admin | Invites new team member |

---

## SUMMARY: DATA PERSISTENCE

| Storage | Key | What | When |
|---|---|---|---|
| `localStorage` | `nri-intake-draft` | Form data object (`f`) | Every change during client intake; cleared on successful submission |
| `localStorage` | `nri-leads` | Array of `{ email, source, ts }` | When `/api/leads` POST fails (blog hub, blog post email captures) |
| `sessionStorage` | `nri-mycases-session` | `{ verified, email, clientName, cases, savedAt }` | After successful verification in My Cases; cleared on logout |
| `Supabase` | `cases` table | All case records | Dashboard case save, public intake submission |
| `Supabase` | `module_outputs` table | AI module outputs | After each module runs in dashboard |
| `Supabase` | `profiles` table | User role | Read on login and dashboard load |
| Theme | `localStorage` (via theme-provider) | `'dark'` / `'light'` | Theme toggle on any screen |

---

## ESSENTIAL FILES

- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/client/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/portal/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/my-cases/ClientPortalDashboard.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/dashboard/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/admin/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/login/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/signup/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/blog/BlogHubClient.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/blog/[slug]/BlogPostClient.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/blog/assess/[tool]/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/terms/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/privacy/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/preview/page.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/components/NavBar.js`
- `/Users/rakeshanita/Downloads/nri-tax-suite/nri-tax-app/app/components/Footer.js`
