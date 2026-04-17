# NRI Tax Suite — Complete Production Setup Guide

## What This Is

A production-ready NRI tax filing, advisory, and compliance platform powered by AI. It takes client intake through a smart wizard, runs 10 analysis modules using Claude, performs real tax computations (capital gains dual-option, house property, etc.), and generates downloadable professional DOCX deliverables.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  FRONTEND (Next.js + Tailwind)                  │
│  Smart Wizard → Module Runner → Deliverables    │
├─────────────────────────────────────────────────┤
│  API ROUTES (Next.js Server)                    │
│  /api/ai       → Claude Anthropic SDK           │
│  /api/ai/parse → Narrative-to-structured data   │
│  /api/deliverables → DOCX generation (docx-js)  │
├─────────────────────────────────────────────────┤
│  DATABASE (Supabase)                            │
│  cases, module_outputs, deliverables, profiles  │
├─────────────────────────────────────────────────┤
│  COMPUTATION ENGINE (lib/compute.js)            │
│  CG dual computation, HP computation, CII table │
├─────────────────────────────────────────────────┤
│  SKILL MODULES (lib/skills.js)                  │
│  10 FY-aware system prompts for AI modules      │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Lucide icons
- **Backend:** Next.js API Routes (serverless)
- **AI:** Anthropic Claude Sonnet 4 via official SDK
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Documents:** docx-js for DOCX generation
- **Deployment:** Vercel (recommended) or any Node.js host

---

## Local Setup — Step by Step

### Prerequisites

- Node.js 18+ (check: `node --version`)
- npm or yarn
- Git
- A Supabase account (free tier works)
- An Anthropic API key

### Step 1: Clone or Extract the Project

If you downloaded the zip:
```bash
unzip nri-tax-app.zip
cd nri-tax-app
```

Or if starting from git:
```bash
git clone https://github.com/YOUR_USERNAME/nri-tax-suite.git
cd nri-tax-suite
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `nri-tax-suite`
3. Set a database password (save it)
4. Region: Mumbai (ap-south-1) for lowest latency
5. Wait for project to provision (~2 minutes)

Once ready:
6. Go to **SQL Editor** in the Supabase dashboard
7. Copy the entire contents of `supabase/schema.sql`
8. Paste and click **Run**
9. You should see all tables created successfully

Get your keys:
10. Go to **Settings → API**
11. Copy: `Project URL` → this is your SUPABASE_URL
12. Copy: `anon/public` key → this is your SUPABASE_ANON_KEY
13. Copy: `service_role` key → this is your SUPABASE_SERVICE_ROLE_KEY

### Step 4: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add credits ($5–10 is enough for testing)

### Step 5: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
FIRM_NAME=MKW Advisors
FIRM_TAGLINE=NRI Tax Filing · Advisory · Compliance
```

### Step 6: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Git Setup — Push to Repository

### First Time Setup

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# First commit
git commit -m "feat: NRI Tax Suite v1 — complete production app"

# Create repo on GitHub (go to github.com/new)
# Then connect:
git remote add origin https://github.com/YOUR_USERNAME/nri-tax-suite.git
git branch -M main
git push -u origin main
```

### Ongoing Workflow

```bash
# Check what changed
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "fix: update CII table for FY 2026-27"

# Push
git push
```

### Recommended Branch Strategy

```bash
# Feature branches
git checkout -b feature/document-upload
# ... make changes ...
git commit -m "feat: add AIS PDF upload and parsing"
git push -u origin feature/document-upload
# Create Pull Request on GitHub → merge to main

# Hotfixes
git checkout -b fix/cg-computation-cess
git commit -m "fix: correct cess calculation rounding"
git push -u origin fix/cg-computation-cess
```

---

## Production Deployment (Vercel)

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project" → connect your GitHub repo
3. Framework: Next.js (auto-detected)

### Step 2: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `FIRM_NAME` | MKW Advisors |
| `FIRM_TAGLINE` | NRI Tax Filing · Advisory · Compliance |

### Step 3: Deploy

Click "Deploy" — Vercel builds and deploys automatically.

Your app will be live at: `https://nri-tax-suite.vercel.app` (or your custom domain).

### Step 4: Custom Domain (Optional)

1. In Vercel → Settings → Domains
2. Add: `tax.mkwadvisors.com` (or whatever you want)
3. Update DNS as instructed
4. SSL is automatic

---

## Project Structure

```
nri-tax-app/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── route.js          # AI module runner (server-side)
│   │   │   └── parse/
│   │   │       └── route.js      # Narrative parser
│   │   └── deliverables/
│   │       └── route.js          # DOCX generator
│   ├── dashboard/
│   │   └── page.js               # Main app UI
│   ├── globals.css
│   ├── layout.js
│   └── page.js                   # Redirects to /dashboard
├── lib/
│   ├── compute.js                # CII, CG, HP computation engine
│   ├── skills.js                 # 10 AI module prompts
│   ├── supabase-browser.js       # Client-side Supabase
│   └── supabase-server.js        # Server-side Supabase
├── supabase/
│   └── schema.sql                # Complete database schema
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## Key Files Explained

### `lib/compute.js` — The Computation Engine
Pure JavaScript functions for tax computation. No AI involved — these produce exact numbers:
- `computeCapitalGains()` — Dual-option CG (20% indexed vs 12.5% flat)
- `computeHouseProperty()` — Rental income computation with 30% SD
- `classifyCase()` — Green/Amber/Red classification
- CII table from 2001-02 to 2025-26

### `lib/skills.js` — AI Module Prompts
All 10 module system prompts, FY-aware:
- Residency, Income, Pricing, Reconciliation, Filing
- Capital Gains, DTAA/FTC, Pre-Filing, Advisory Memo
- Each prompt embeds FY-specific rules (CII, dual computation, 87A non-applicability)

### `app/api/ai/route.js` — AI Module Runner
Server-side API route that:
1. Receives module ID + case data
2. Selects the correct skill prompt
3. Builds case context from all prior module outputs
4. Calls Claude via official SDK (API key stays server-side)
5. Returns structured analysis

### `app/api/deliverables/route.js` — DOCX Generator
Server-side route that:
1. Receives deliverable type + case data
2. Runs computation engine for real numbers
3. Generates professional DOCX with tables, formatting, branding
4. Returns the file as a download

---

## How to Integrate the UI

The `app/dashboard/page.js` currently has a placeholder. To complete it:

1. Copy the UI code from `nri-tax-suite-final.jsx` (the React artifact)
2. Add `'use client';` at the top
3. Replace direct Anthropic API calls with fetch to `/api/ai`:

```javascript
// BEFORE (in artifact — calls Anthropic directly from browser):
const res = await fetch("https://api.anthropic.com/v1/messages", { ... });

// AFTER (in production — calls your own API route):
const res = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ moduleId: 'residency', formData: f, fy, moduleOutputs: outs })
});
const { output } = await res.json();
```

4. Add DOCX download function:

```javascript
async function downloadDeliverable(type) {
  const res = await fetch('/api/deliverables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, caseData: { name: f.name, country: f.country, classification: cls(f), formData: f }, fy, moduleOutputs: outs })
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${f.name.toLowerCase().replace(/\s+/g,'-')}-${type}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

5. Add Supabase persistence:

```javascript
import { createClient } from '@/lib/supabase-browser';
const supabase = createClient();

// Save case after intake
const { data } = await supabase.from('cases').insert({
  user_id: userId,
  client_name: f.name,
  country: f.country,
  fy, ay: FY_CONFIG[fy].ay,
  classification: cls(f),
  intake_data: f,
}).select().single();

// Save module output
await supabase.from('module_outputs').upsert({
  case_id: caseId,
  module_id: moduleId,
  output_text: output,
});

// Load cases on dashboard
const { data: cases } = await supabase.from('cases')
  .select('*')
  .order('created_at', { ascending: false });
```

---

## FY Update Procedure

When a new financial year is announced:

1. **Update CII in `lib/compute.js`:**
   Add the new year's CII value to the CII object.

2. **Update FY_CONFIG in `lib/compute.js`:**
   Add the new FY entry with AY and due date.

3. **Update prompts in `lib/skills.js`:**
   If tax rules change (new rates, new thresholds), update the BASE prompt
   and any module-specific rules.

4. **Update the UI year selector** in the dashboard.

5. **Test with a sample case** using the new FY.

---

## Estimated Costs

| Service | Free Tier | Typical Monthly |
|---------|-----------|-----------------|
| Supabase | 50K rows, 500MB storage, 2GB bandwidth | Free for 100+ cases |
| Anthropic API | — | ~₹200–500 per case (10 modules × ~3K tokens each) |
| Vercel | 100GB bandwidth, serverless | Free for <1000 cases/month |
| Domain | — | ~₹800/year |

**Total cost per NRI case: approximately ₹200–500 in AI calls.**
**Revenue per case: ₹8,000–75,000.**

---

## What to Build Next (Priority Order)

1. **Full UI integration** — Move artifact code into dashboard page (1 day)
2. **Auth flow** — Supabase email+password login (1 day)
3. **Case persistence** — Save/load cases from database (1 day)
4. **DOCX download buttons** — Wire deliverable buttons to API (half day)
5. **Client email templates** — Auto-generate document request emails (1 day)
6. **Document upload** — PDF upload + text extraction for AIS/26AS (3 days)
7. **Client portal** — Read-only view for clients to see deliverables (2 days)
8. **Team roles** — Preparer/reviewer/partner workflow (2 days)
9. **Payment integration** — Razorpay for engagement fee collection (1 day)
10. **Analytics dashboard** — Case stats, revenue tracking (1 day)

**Total to full production: 2-3 weeks of focused development.**
