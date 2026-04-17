# NRI Tax Suite

**AI-Assisted NRI Tax Filing, Advisory & Compliance Platform**

A complete product for serving Non-Resident Indian taxpayers — from the moment a client lands on your website to the final advisory memo in their inbox. Built with Next.js, Claude AI, Supabase, and docx-js.

---

## What This Product Does

Two sides, one connected system:

### Client Side (what your NRI clients see)
- A professional **landing page** with pricing, services, and "Start Filing" button
- A **5-step smart wizard** where clients describe their situation in plain English — AI fills the form
- An instant **tax diagnostic** showing case complexity (Green/Amber/Red) and capital gains savings preview
- Contact buttons to engage your firm

### Team Side (what you and your team use)
- **Login/signup** with role-based access (Admin, Partner, Senior, Preparer)
- **Case dashboard** showing all submitted cases with classification, progress, and status
- **10 AI analysis modules** — auto-run on submission, or run manually one by one
- **4 downloadable DOCX deliverables** — real branded documents with actual tax computations
- Human checkpoint system at critical review stages

---

## The Complete Flow

```
NRI CLIENT JOURNEY                           YOUR TEAM JOURNEY
═══════════════════                          ═══════════════════

1. Client finds you
   (Google, referral, WhatsApp)

2. Opens yourdomain.com
   Sees landing page with
   pricing and services

3. Clicks "Start Filing"
   → /client wizard opens
   → Types situation in plain English
   → AI auto-fills the form
   → Walks through 5 steps

4. Submits intake
   → Sees instant diagnostic:
   "Amber — Option B saves ₹1,83,836"
   → Clicks "Email Us" or "WhatsApp"

5. Case saved to database ──────────────────→ 6. You log into /dashboard
   Auto-run pipeline starts ─────────────────→    See new case appear
   (all 9 AI modules run                         Classification: Amber
    automatically in background)                  All modules: DONE

                                              7. Review AI analysis
                                                 All 9 modules already
                                                 completed by auto-run.
                                                 Review & approve results.
                                                 (Or re-run any module
                                                  manually if needed)

                                              8. Generate deliverables
                                                 Click "Download DOCX" →
                                                 Real Word doc downloads

9. Client receives:                          ← 9. You email/share:
   - Advisory Memo                              - Advisory Memo
   - CG Computation Sheet                       - CG Computation Sheet
   - Engagement Quote                            - Engagement Quote
   - Tax Position Report                         - Tax Position Report

10. Client pays, you file                     10. File return on portal
    the return, done.                             Mark case as filed
```

---

## Pages

| URL | Who sees it | Login needed | What it does |
|-----|------------|--------------|-------------|
| `/` | Everyone | No | Landing page — services, pricing, how-it-works, CTAs |
| `/client` | NRI clients | No | 5-step intake wizard with AI auto-fill |
| `/client` (after submit) | NRI clients | No | Diagnostic result — classification, CG preview, contact buttons |
| `/login` | Team | No | Email + password login |
| `/signup` | Team | No | Create team account with role selection |
| `/dashboard` | Team | Yes | Full case management, AI modules, DOCX downloads |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  CLIENT PAGES (public, no auth)                              │
│  /              Landing page with marketing + CTAs           │
│  /client        Smart wizard → diagnostic → contact          │
├──────────────────────────────────────────────────────────────┤
│  TEAM PAGES (auth required)                                  │
│  /login         Email + password authentication              │
│  /signup        Team account creation with roles             │
│  /dashboard     Case management + AI modules + deliverables  │
├──────────────────────────────────────────────────────────────┤
│  AUTH MIDDLEWARE (middleware.js)                              │
│  Protects /dashboard — redirects to /login if no session     │
├──────────────────────────────────────────────────────────────┤
│  API ROUTES (server-side)                                    │
│  /api/ai             Run any of 10 AI skill modules          │
│  /api/ai/parse       Narrative → structured data (AI)        │
│  /api/deliverables   Generate DOCX with real computations    │
│  /api/cases/public   Save client intake (no auth needed)     │
│  /api/auto-run       Chain all 9 modules automatically       │
├──────────────────────────────────────────────────────────────┤
│  COMPUTATION ENGINE (lib/compute.js)                         │
│  CII table (2001-2026) · Dual CG computation · HP calc      │
│  Case classification · Currency formatting                   │
├──────────────────────────────────────────────────────────────┤
│  SKILL MODULES (lib/skills.js)                               │
│  10 FY-aware system prompts for Claude AI                    │
│  Context builder that chains all module outputs              │
├──────────────────────────────────────────────────────────────┤
│  DATABASE (Supabase PostgreSQL)                              │
│  cases · module_outputs · deliverables · profiles            │
│  Row-level security · Team role policies                     │
├──────────────────────────────────────────────────────────────┤
│  SKILL PACK (skills/)                                        │
│  10 reference modules + 4 support assets                     │
│  The complete NRI tax advisory knowledge base                │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude Sonnet 4 (via official SDK, server-side)
- **Database:** Supabase (PostgreSQL + Auth + Row Level Security + Storage)
- **Documents:** docx-js (server-side DOCX generation)
- **Icons:** Lucide React
- **Deployment:** Vercel (recommended) or any Node.js host

---

## AI Modules (10 Total)

| # | Module | What it does | Deliverable it feeds |
|---|--------|-------------|---------------------|
| 1 | Case Intake | Classifies case Green/Amber/Red, generates document list | — |
| 2 | Residency Analyzer | Determines NR/RNOR/Resident view with confidence level | Tax Position Report |
| 3 | Income Source Mapper | Maps income into tax heads, flags complexity | Tax Position Report |
| 4 | Pricing & Scope | Assigns service tier (T1-T4) and pricing band (A-D) | Engagement Quote |
| 5 | AIS/26AS Reconciliation | Compares taxpayer data with department records | — |
| 6 | ITR Form Selector | Identifies return form and schedules needed | — |
| 7 | Capital Gains Analyzer | Dual computation (20% indexed vs 12.5% flat) | CG Computation Sheet |
| 8 | DTAA/FTC Spotter | Flags treaty issues, addresses FTC misconceptions | Advisory Memo |
| 9 | Pre-Filing Review | Final readiness gate (Ready/Conditional/Not Ready) | — |
| 10 | Advisory Memo | Generates client-ready memo with all findings | Advisory Memo |

### Auto-Run Pipeline
When a client submits their intake on `/client`, the system automatically runs all 9 AI modules (skipping intake) in sequence via `/api/auto-run`. Each module receives context from all prior modules. Results are saved to Supabase progressively. Case status moves from `intake` → `in_progress` → `review`. By the time your team opens the case, analysis is already complete.

### Human Checkpoints
Module 5 (Reconciliation) and Module 9 (Pre-Filing) have **mandatory human review markers**. The AI runs the analysis, but a senior reviewer must validate before proceeding.

---

## Deliverables (4 Downloadable DOCX)

| Document | Contains | When available |
|----------|---------|---------------|
| **CG Computation Sheet** | Transaction details table, Option A (20% indexed) full computation, Option B (12.5% flat) full computation, comparison with recommendation, Section 54/54EC planning with tax-saved amounts, TDS position, net tax summary with 3 scenarios | After Module 7 |
| **Client Advisory Memo** | Facts, assumptions, key issues (numbered), CG dual comparison embedded, FTC clarification, rental computation, risk flags, numbered action items | After Module 10 |
| **Tax Position Report** | Client profile, residency assessment, income summary table, key issues, recommended approach | After Modules 3+4 |
| **Engagement Quote** | Service tier, fee band, turnaround, scope inclusions/exclusions, deliverables list | After Module 4 |

All documents generate with **MKW Advisors branding**, professional formatting, tables with real computed numbers, and a legal disclaimer.

---

## FY 2025-26 Compliance

The system is built for FY 2025-26 (AY 2026-27) with these rules baked in:

| Parameter | Value |
|-----------|-------|
| Cost Inflation Index | 376 |
| Default tax regime | New (Section 115BAC) |
| Basic exemption (new regime) | ₹4,00,000 |
| Section 87A rebate | ₹60,000 (residents only — **NRIs do NOT get this**) |
| LTCG property (pre July 23, 2024) | Taxpayer chooses: 20% with indexation OR 12.5% without |
| LTCG property (post July 23, 2024) | 12.5% flat, no indexation |
| LTCG listed equity | 12.5% above ₹1.25L |
| NRI asset disclosure | Required if Indian assets exceed ₹1 Crore |
| ITR-1/ITR-2 due date | 31 July 2026 |
| Standard deduction (salaried) | ₹75,000 |

Also supports FY 2024-25 (AY 2025-26) via year selector.

---

## Local Setup — Step by Step

### What you need first

1. **Node.js** — go to nodejs.org, download LTS, install
2. **Supabase account** — go to supabase.com, sign up free
3. **Anthropic API key** — go to console.anthropic.com, create key, add $5 credits

### Setup commands

```bash
# 1. Extract and enter project
unzip nri-tax-app-complete.zip
cd nri-tax-app

# 2. Install packages
npm install

# 3. Create environment file
cp .env.example .env.local
```

### Configure `.env.local`

Open the file in any text editor and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
FIRM_NAME=MKW Advisors
FIRM_TAGLINE=NRI Tax Filing · Advisory · Compliance
```

**Where to find Supabase keys:**
- Go to your Supabase project → Settings → API
- Project URL = `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key = `SUPABASE_SERVICE_ROLE_KEY`

### Set up database

1. Go to Supabase dashboard → SQL Editor
2. Open `supabase/schema.sql` from the project
3. Copy ALL the content
4. Paste into SQL Editor
5. Click Run
6. You should see "Success" — all tables created

### Run the app

```bash
npm run dev
```

Open browser → go to `http://localhost:3000`

You should see the landing page with "NRI Tax Filing Done Right" heading.

### Test it

1. Click "Start Filing" → fills the client wizard
2. Open a new tab → go to `localhost:3000/login`
3. Go to `localhost:3000/signup` first to create your admin account
4. Login → see the dashboard
5. The case submitted from client wizard should appear with all modules auto-completed

---

## Push to GitHub

```bash
# First time
git init
git add .
git commit -m "NRI Tax Suite v1 — complete product"
git remote add origin https://github.com/YOUR_USERNAME/nri-tax-suite.git
git branch -M main
git push -u origin main
```

```bash
# After making changes
git add .
git commit -m "description of what changed"
git push
```

---

## Deploy to Production (Vercel)

1. Go to vercel.com — sign in with GitHub
2. Click "Import Project" — select `nri-tax-suite` repo
3. Framework: Next.js (auto-detected)
4. Add environment variables (same values from `.env.local`)
5. Click Deploy — wait 2-3 minutes
6. Live at `https://nri-tax-suite.vercel.app`

**Note:** The auto-run pipeline runs 9 AI modules sequentially (~60-120 seconds). On Vercel Hobby plan, serverless functions timeout at 60 seconds. For production, use Vercel Pro plan (300s timeout) or configure the function duration in `vercel.json`.

### Custom domain

1. In Vercel → Settings → Domains
2. Add your domain (e.g., `tax.mkwadvisors.com`)
3. Update DNS as instructed
4. SSL is automatic

---

## Project Structure

```
nri-tax-app/
├── app/
│   ├── page.js                     ← Landing page (public)
│   ├── client/
│   │   └── page.js                 ← Client intake wizard (public)
│   ├── login/
│   │   └── page.js                 ← Team login
│   ├── signup/
│   │   └── page.js                 ← Team signup
│   ├── dashboard/
│   │   └── page.js                 ← Team dashboard (protected)
│   ├── api/
│   │   ├── ai/
│   │   │   ├── route.js            ← AI module runner
│   │   │   └── parse/
│   │   │       └── route.js        ← Narrative parser
│   │   ├── auto-run/
│   │   │   └── route.js            ← Auto-run pipeline (9 modules)
│   │   ├── deliverables/
│   │   │   └── route.js            ← DOCX generator
│   │   └── cases/
│   │       └── public/
│   │           └── route.js        ← Public intake submission
│   ├── layout.js
│   └── globals.css
├── lib/
│   ├── compute.js                  ← Tax computation engine
│   ├── skills.js                   ← 10 AI module prompts
│   ├── supabase-browser.js         ← Client-side Supabase
│   └── supabase-server.js          ← Server-side Supabase
├── skills/                         ← Full NRI Tax Skill Pack
│   ├── SKILL.md                    ← Master control file
│   ├── references/                 ← 10 module skill files
│   │   ├── nri-case-intake.md
│   │   ├── residential-status-analyzer.md
│   │   ├── income-source-mapper.md
│   │   ├── pricing-scope-classifier.md
│   │   ├── ais-26as-tis-reconciliation.md
│   │   ├── itr-form-schedule-selector.md
│   │   ├── capital-gains-analyzer.md
│   │   ├── dtaa-ftc-issue-spotter.md
│   │   ├── pre-filing-risk-review.md
│   │   └── advisory-memo-generator.md
│   └── assets/                     ← Support documents
│       ├── intake-questionnaire.md
│       ├── document-checklist.md
│       ├── pricing-policy.md
│       └── delivery-sop.md
├── supabase/
│   └── schema.sql                  ← Complete database schema
├── scripts/
│   ├── generate-deliverables-v2.js ← Standalone DOCX generator
│   └── test-case-full-run.md       ← Full test case walkthrough
├── middleware.js                    ← Auth protection for /dashboard
├── jsconfig.json                   ← Path alias (@/) configuration
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Key Files Explained

### `app/page.js` — Landing Page
Public marketing page. Shows services, pricing tiers, how-it-works, trust numbers, and two main CTAs: "Start Filing" (→ /client) and "Team Login" (→ /login).

### `app/client/page.js` — Client Intake Wizard
The money page. NRI clients fill this without creating an account. Five steps:
1. **Describe situation** — paste a paragraph, AI extracts all fields
2. **India connections** — stay days, property sale details, acquisition year, sale price
3. **Income** — checkboxes for income types, amounts for rent/interest
4. **Documents** — AIS status, asset value, service preference
5. **Review** — sees classification (Green/Amber/Red) and CG savings preview

After submit: shows diagnostic result with "Email Us" and "WhatsApp Us" buttons. Case is saved to database and auto-run pipeline starts in background.

### `app/dashboard/page.js` — Team Dashboard (783 lines)
The operational engine. Contains:
- **Case list** with classification badges and progress tracking
- **Module runner** — click to run each of 10 AI modules (or review auto-run results)
- **Deliverable viewer** — preview CG computation, advisory memo, etc. inline
- **DOCX download** — click to download real branded Word documents
- **Print** — open print-friendly version for PDF export
- **Supabase integration** — cases auto-save and load from database

### `app/api/auto-run/route.js` — Auto-Run Pipeline
Server-side. When a client submits intake, this endpoint automatically runs all 9 AI modules in sequence. Each module receives accumulated context from prior modules. Results are saved to Supabase progressively. Resilient — if one module fails, the rest continue.

### `app/api/ai/route.js` — AI Module Runner
Server-side. Receives module ID + case data → selects the correct skill prompt → builds context from all prior outputs → calls Claude → returns structured analysis. API key never reaches the browser.

### `app/api/deliverables/route.js` — DOCX Generator (336 lines)
Server-side. Receives deliverable type + case data → runs computation engine for real numbers → builds professional Word document with tables, formatting, branding → returns downloadable file. Four document types: CG sheet, advisory memo, engagement quote, position report.

### `lib/compute.js` — Tax Computation Engine
Pure JavaScript. No AI. Produces exact numbers:
- `computeCapitalGains()` — Option A (20% + indexation) vs Option B (12.5% flat), with Section 54EC savings calculation
- `computeHouseProperty()` — gross rent → 30% SD → net taxable
- `classifyCase()` — Green/Amber/Red based on weighted scoring
- CII table from FY 2001-02 to 2025-26

### `lib/skills.js` — AI Module Prompts
All 10 module system prompts, each aware of FY-specific rules. Includes `buildCaseContext()` which concatenates all prior module outputs so each subsequent module has full case history.

### `supabase/schema.sql` — Database
Five tables: profiles (team users), cases, module_outputs, deliverables, activity_log, plus storage bucket for generated files. Row-level security policies. Team roles (admin/partner/senior/preparer) with appropriate access levels. Public intake submissions allowed without login.

---

## Costs

| Service | Free Tier | Typical Monthly Cost |
|---------|-----------|---------------------|
| Supabase | 50K rows, 500MB, 2GB bandwidth | ₹0 for <200 cases |
| Anthropic API | — | ₹200–500 per case (10 modules) |
| Vercel | 100GB bandwidth, serverless | ₹0 for <1000 cases/month |
| Domain | — | ~₹800/year |

**Cost per NRI case: approximately ₹200–500 in AI calls**
**Revenue per case: ₹8,000–75,000**

---

## Pricing Model (Built Into the System)

| Classification | Service Tier | Fee Range | Typical Cases |
|---------------|-------------|-----------|---------------|
| Green | Basic Filing | ₹8,000–15,000 | Interest only, simple NRI profile |
| Amber | Advisory Filing | ₹18,000–30,000 | Multiple income heads, residency review needed |
| Red (Amber+) | Premium Compliance | ₹35,000–75,000 | Property sale, ESOP, DTAA, complex transactions |
| Red (HNI) | Annual Retainer | ₹1,00,000+/year | Family office, ongoing planning, recurring advisory |

The system auto-classifies every case and recommends the appropriate tier.

---

## FY Update Procedure

When a new financial year starts (e.g., FY 2026-27):

1. Add new CII value to `CII` object in `lib/compute.js`
2. Add new FY entry to `FY_CONFIG` in `lib/compute.js`
3. Update `BASE` prompt in `lib/skills.js` if tax rules change
4. Update year selector in `app/client/page.js` and `app/dashboard/page.js`
5. Test with a sample case
6. Deploy

---

## What to Build Next (Priority Order)

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | **Email notifications** when new case is submitted | 2 hours | Don't miss leads |
| 2 | **Document upload** — AIS/26AS PDF parsing | 3 days | Better reconciliation |
| 3 | **Client portal** — clients log in to track case status | 2 days | Professional feel |
| 4 | **Razorpay payment** — pay engagement fee online | 1 day | Faster conversion |
| 5 | **Email integration** — send deliverables directly | 1 day | Smoother delivery |
| 6 | **Analytics dashboard** — cases by month, revenue, etc. | 1 day | Business intelligence |
| 7 | **Multi-FY support** — FY 2026-27 when announced | 2 hours | Future-ready |
| 8 | **API authentication** — protect AI/deliverables endpoints | Half day | Security |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `npm: command not found` | Install Node.js from nodejs.org, restart terminal |
| `Module not found` | Run `npm install` again |
| `ANTHROPIC_API_KEY not set` | Check `.env.local` — no spaces around `=` |
| `Supabase connection refused` | Check URL and keys in `.env.local` — no trailing spaces |
| `RLS policy violation` | Run the full `schema.sql` in Supabase SQL Editor |
| `DOCX download fails` | Check server logs — likely a `docx` package issue, run `npm install docx` |
| `AI returns error` | Check Anthropic dashboard for credits — add $5 if empty |
| Dashboard shows no cases | Create a test case via `/client` first, or check Supabase table directly |
| Auto-run timeout on Vercel | Hobby plan limits functions to 60s. Use Pro plan or split the pipeline |

---

## License

Proprietary. Built for MKW Advisors / Legal Suvidha ecosystem.

---

*Built with the NRI Tax Suite Skill Pack — 10 AI modules, 4 support assets, FY 2025-26 compliant.*
