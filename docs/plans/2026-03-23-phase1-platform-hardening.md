# Phase 1: Platform Hardening — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Raise all platform scores to ~8.5+ average — fix security, add monitoring, improve AI reliability, add missing intake fields, and add legal pages.

**Architecture:** Targeted fixes across existing files. No new frameworks. Add Sentry for monitoring, harden middleware with real JWT validation, add rate limiting via in-memory store, add missing form fields to intake, add legal pages.

**Tech Stack:** Next.js 14, Supabase SSR, Sentry (free), existing compute.js

---

### Task 1: Increase AI Token Limit

**Files:**
- Modify: `app/api/ai/route.js`
- Modify: `app/api/auto-run/route.js`

Change `max_tokens: 3000` to `max_tokens: 4096` in both files. Complex CG and memo modules truncate at 3000.

---

### Task 2: Add Sale Date + NRE/NRO + Improvement Cost to Intake

**Files:**
- Modify: `app/client/page.js` (client wizard)
- Modify: `app/dashboard/page.js` (dashboard wizard)
- Modify: `lib/skills.js` (buildCaseContext)

**Client wizard — add 3 fields in the property sale section (Step 1):**
- Sale date: `<input type="date">` → `f.saleDate`
- Improvement cost: `<input type="number">` → `f.improvementCost`

**Client wizard — add NRE/NRO selector in Step 2 (interest section):**
- When `f.interest` is checked, add a dropdown: "Interest type" → "NRO (taxable)" / "NRE (tax-free)"
- Map to `f.interestType` — default "NRO"
- In computeTotalIncome: if interestType === "NRE", exclude from taxable income

**buildCaseContext — pass new fields:**
- Add sale date, improvement cost to property sale section
- Add NRE/NRO distinction note

---

### Task 3: Security — Real JWT Validation in Middleware

**Files:**
- Modify: `middleware.js`
- Modify: `package.json` (no new deps needed — @supabase/ssr already installed)

Replace cookie-name-check with proper Supabase session validation:
```javascript
import { createServerClient } from '@supabase/ssr';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/dashboard')) return NextResponse.next();

  // Dev mode escape
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name, value, options) => { response.cookies.set({ name, value, ...options }); },
      remove: (name, options) => { response.cookies.set({ name, value: '', ...options }); },
    },
  });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(new URL('/login', request.url));
  return response;
}
```

---

### Task 4: Security — Rate Limiting on AI Endpoints

**Files:**
- Create: `lib/rate-limit.js`
- Modify: `app/api/ai/route.js`
- Modify: `app/api/ai/parse/route.js`
- Modify: `app/api/cases/public/route.js`

Simple in-memory rate limiter (no Redis needed for <1000 users):
```javascript
// lib/rate-limit.js
const store = new Map();
export function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const record = store.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) { record.count = 0; record.resetAt = now + windowMs; }
  record.count++;
  store.set(key, record);
  return record.count <= maxRequests;
}
```

Apply to each endpoint using IP as key: `rateLimit(request.headers.get('x-forwarded-for') || 'unknown')`

---

### Task 5: Security — Fix Signup (Remove Self-Assignable Admin Role)

**Files:**
- Modify: `app/signup/page.js`

Remove the role dropdown entirely. All new signups get default role "preparer". Admin assigns roles after account creation via Supabase dashboard.

---

### Task 6: Security — Unguessable Portal Token

**Files:**
- Modify: `app/api/cases/public/route.js`
- Modify: `app/api/portal/route.js`
- Modify: `supabase/schema.sql`

Add `portal_token` column to cases table (random 24-char alphanumeric string, unique).
Generate on case creation. Use for portal lookup instead of UUID prefix.

---

### Task 7: Error Monitoring — Add Sentry

**Files:**
- Create: `sentry.client.config.js`
- Create: `sentry.server.config.js`
- Modify: `next.config.js`
- Modify: `package.json`
- Modify: `.env.example`

Install `@sentry/nextjs`. Initialize with DSN from env var. Captures all unhandled errors + API route errors.

---

### Task 8: Legal Pages — Terms + Privacy

**Files:**
- Create: `app/terms/page.js`
- Create: `app/privacy/page.js`

Static pages with professional legal content for a tax advisory platform. Include data handling, client confidentiality, AI disclaimer, limitation of liability.

---

### Task 9: Health Check Endpoint

**Files:**
- Create: `app/api/health/route.js`

GET endpoint that checks: Supabase connection, Anthropic API key validity, returns platform version and status.

---

### Task 10: E2E Manual Test Script

**Files:**
- Create: `scripts/e2e-test.md`

Step-by-step manual test: signup → login → create case from /client → check dashboard → run 1 module → download 1 DOCX → check portal. With expected results at each step.

---

## Execution Order

Tasks 1, 5, 8, 9, 10 are independent — can run in parallel.
Tasks 2, 3, 4, 6, 7 each touch different files — can also run in parallel.

All 10 tasks are independent. Maximum parallelism.
