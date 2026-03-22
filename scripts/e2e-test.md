# NRI Tax Suite — End-to-End Test Checklist

Run this test before any production release.

## Pre-requisites
- [ ] App running locally (`npm run dev`) or on Vercel
- [ ] Supabase project with schema applied
- [ ] Anthropic API key with credits
- [ ] .env.local configured

## Test 1: Landing Page
- [ ] Open / — landing page loads
- [ ] Theme toggle works (sun/moon button)
- [ ] "Start Filing" button → navigates to /client
- [ ] "Team Login" → navigates to /login
- [ ] Pricing section shows 4 tiers
- [ ] Footer shows MKW Advisors branding

## Test 2: Client Wizard
- [ ] /client loads with Step 1/5
- [ ] Type narrative: "I work in London, sold a flat in Mumbai for 80 lakhs bought in 2018 for 30 lakhs, NRO interest 1.4 lakhs"
- [ ] Click "Auto-Fill" — fields populate (name may be empty, country should be UK, salePrice=8000000)
- [ ] Fill in missing fields (name, country if not populated)
- [ ] Walk through all 5 steps — each renders correctly
- [ ] Step 5 (Review): Classification badge appears (should be Amber or Red)
- [ ] CG preview shows: Option B saves money, TDS refund amount
- [ ] Click "Get My Tax Diagnostic"
- [ ] Diagnostic page shows: classification, CG savings, recommended service
- [ ] Case reference code appears
- [ ] "Track your case" link works
- [ ] WhatsApp button opens wa.me/919667744073
- [ ] Email button opens mailto

## Test 3: Team Signup & Login
- [ ] /signup — create account (name, email, password)
- [ ] Check email for Supabase confirmation link
- [ ] Click confirmation → account confirmed
- [ ] /login — sign in with email + password
- [ ] Redirects to /dashboard

## Test 4: Dashboard
- [ ] Dashboard loads with case list
- [ ] The case from Test 2 should appear (if auto-run worked)
- [ ] Click the case → case view opens
- [ ] Sidebar shows 10 modules + 5 deliverables
- [ ] If auto-run completed: modules show ✓ checkmarks
- [ ] If not: click "Run Residency" → loading spinner → output appears
- [ ] Run at least 3 modules to verify AI works
- [ ] Module output shows structured analysis with headings

## Test 5: Deliverables
- [ ] After CG module is done: "CG Computation Sheet" becomes clickable
- [ ] Click → preview shows inline
- [ ] Click "Download DOCX" → .docx file downloads
- [ ] Open DOCX in Word — formatting correct, numbers match
- [ ] Repeat for Advisory Memo (after memo module)

## Test 6: Client Portal
- [ ] Copy portal link from dashboard sidebar
- [ ] Open in incognito/new browser
- [ ] Portal loads with case timeline
- [ ] Current stage shown correctly
- [ ] Key findings section appears (if stage 3+)
- [ ] Contact bar shows real phone number

## Test 7: Status Update
- [ ] In dashboard, change status dropdown to "Findings Ready"
- [ ] Check portal — stage should update to 4
- [ ] Change to "Filed" — portal shows stage 6

## Test 8: Computation Verification
- [ ] Open browser console
- [ ] Run: `fetch('/api/deliverables', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'cg_sheet',caseData:{name:'Test',country:'UK',classification:'Amber',formData:{salePrice:8000000,purchaseCost:3000000,propertyAcqFY:'2018-19',propertySale:true}},fy:'2025-26',moduleOutputs:{}})}).then(r=>r.blob()).then(b=>console.log('DOCX size:',b.size,'bytes'))`
- [ ] Should return DOCX with size > 5000 bytes
- [ ] Option B tax should be ₹6,50,000
- [ ] TDS should be ₹18,30,400
- [ ] Refund should be ₹11,80,400

## Test 9: Error Handling
- [ ] /api/health returns 200 with status "ok"
- [ ] /portal?ref=INVALID → shows "Case not found"
- [ ] /api/ai with empty body → returns 400
- [ ] /api/auto-run without secret → returns 401 (in production)

## Test 10: Legal Pages
- [ ] /terms loads with Terms of Service content
- [ ] /privacy loads with Privacy Policy content
- [ ] Both have nav bar and footer
