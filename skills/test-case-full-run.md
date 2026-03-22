# NRI Tax Suite — Test Case: Full Workflow Run

## Test Case Profile

**Client:** Rajesh Mehta  
**Country of Residence:** United Kingdom  
**Citizenship:** Indian  
**Assessment Year:** AY 2025-26 (FY 2024-25)  
**Occupation:** Senior IT Manager at a UK-based MNC  
**Prior Filing:** Filed ITR in India for FY 2022-23 and FY 2023-24  

**Facts provided by client:**
- Working in UK since August 2021
- Visited India approximately 38 days during FY 2024-25 (Diwali trip + family medical emergency)
- Owns one flat in Pune, rented out at Rs 25,000/month
- Sold a residential plot in Nashik in November 2024 for Rs 68 lakhs (purchased in 2017 for approximately Rs 22 lakhs)
- NRO savings account with SBI, interest around Rs 1.4 lakhs
- FD with HDFC Bank, interest around Rs 85,000
- Mutual fund SIP — no redemption during the year
- UK salary approximately GBP 72,000 per annum
- UK income tax paid on salary
- Wants to know if he can claim foreign tax credit
- TDS deducted by plot buyer — exact amount not confirmed
- AIS downloaded but not reviewed
- No prior notices

---

## Module 1 — NRI Case Intake

### Intake Summary
- Client profile: Salaried NRI working in UK (IT sector)
- Year involved: FY 2024-25 / AY 2025-26
- Residence country: United Kingdom
- Stated objective: Indian ITR filing for rental income, plot sale capital gains, bank/FD interest, and foreign tax credit query

### Facts Captured
- Client states he stayed in India for approximately 38 days during FY 2024-25.
- Working in UK full-time since August 2021.
- One rented flat in Pune generating Rs 25,000/month.
- One residential plot in Nashik sold in November 2024 for Rs 68 lakhs (acquired 2017, cost stated ~Rs 22 lakhs).
- NRO savings interest approximately Rs 1.4 lakhs.
- HDFC FD interest approximately Rs 85,000.
- MF SIP exists — no redemption during the year.
- UK salary approximately GBP 72,000.
- UK income tax paid on salary.
- TDS deducted by plot buyer — amount not yet confirmed.
- AIS downloaded but not reviewed by client.
- No prior notices or proceedings.

### Income / Transaction Map
- House property: rental income from Pune flat
- Capital gains: plot sale in Nashik
- Other sources: NRO savings interest + HDFC FD interest
- Foreign / cross-border: UK salary + UK tax paid (FTC query)

### Missing Information
- Exact India stay days (38 is approximate)
- Preceding-year India stay details
- Sale deed for Nashik plot
- Purchase deed / registration papers from 2017
- Cost of improvement details if any
- Exact TDS deducted by buyer and Form 16B
- Rent agreement or tenant confirmation
- AIS / 26AS / TIS review not done
- UK tax certificate or P60 / payslips
- Passport travel pages

### Initial Risk Flags
- Capital gains from plot sale is material (~Rs 68 lakhs consideration) — cannot be assessed without transaction papers
- TDS amount on plot sale is unconfirmed — reconciliation risk
- FTC query exists but no UK tax support document provided yet
- Stay days are estimated, not passport-verified

### Complexity Classification
- **Amber**
- Why: material capital gains transaction, FTC/DTAA query, multiple income heads, and several missing documents make this more than a basic filing

### Document Request List
- PAN copy
- Passport travel pages / stay summary for FY 2024-25
- Sale deed for Nashik plot
- Purchase deed / registration from 2017
- Cost of improvement documents (if any)
- TDS certificate / Form 16B from buyer
- Rent agreement / tenant details for Pune flat
- NRO bank statement / interest certificate (SBI)
- HDFC FD interest certificate
- AIS / 26AS / TIS copies
- MF account statement (to confirm no redemption)
- UK P60 or employer tax summary
- UK tax return copy or tax certificate (for FTC)
- Passport copy

### Recommended Next Module
- residential-status-analyzer

---

## Module 2 — Residential Status Analyzer

### Residency Analysis Snapshot
- Relevant year: FY 2024-25
- Country of current residence: United Kingdom
- Stay-data source quality: self-declared estimate, not yet verified from passport

### Facts Considered
- Client states he has been working full-time in UK since August 2021.
- Client estimates India stay at approximately 38 days during FY 2024-25.
- Preceding-year stay details not yet provided but client filed Indian ITR for FY 2022-23 and FY 2023-24 (suggesting regular filing pattern).
- No India-based employment or business indicated.
- Family / property connections exist (flat in Pune, plot in Nashik until sale).

### Preliminary Residency View
- A preliminary non-resident view appears strongly possible based on current narrative. Client has been abroad since 2021 and reports only a short India visit in the relevant year.
- However, final confirmation should not be locked without passport-based stay verification and preceding-year stay data review.

### Confidence Level
- **High preliminary confidence**
- Rationale: stay days reported are well below threshold levels, continuous UK employment since 2021, and no contrary indicators have emerged.

### Assumptions Used
- Current year India stay is assumed to be close to the client's estimate of 38 days.
- No contrary travel pattern or extended India presence has yet emerged.
- Preceding years' stay pattern is assumed consistent with UK-based employment since 2021.

### Missing Data Required for Confirmation
- Passport travel record summary for FY 2024-25
- Preceding-year India stay data (at least 4 years)
- UK tax residency evidence if needed for DTAA / FTC

### Risk Flags
- Stay-day count is estimated, not passport-verified — low risk given the margin but should still be confirmed
- No material risk visible at this stage, but filing should technically await stay confirmation

### Workflow Impact
- Income mapping can proceed with reasonable confidence.
- Non-resident view supports limiting India taxability scope to Indian-source income.
- DTAA / FTC module should be activated given UK salary and tax payment context.
- Pricing can proceed as Amber — no residency-driven upgrade needed at this point.

### Recommended Next Step
- income-source-mapper

---

## Module 3 — Income Source Mapper

### Income Map Snapshot
- Relevant year: FY 2024-25
- Preliminary residency context: high-confidence preliminary non-resident view
- Number of visible income / transaction buckets: 4

### Income Head Mapping
- **Salary / employment-linked:** No Indian salary. UK salary noted for DTAA / FTC context only.
- **House property:** Rental income from Pune flat (Rs 25,000/month = ~Rs 3,00,000 gross annual).
- **Capital gains:** Plot sale in Nashik — Rs 68 lakhs consideration, acquired 2017 for ~Rs 22 lakhs. Likely long-term capital gains. Transaction papers pending.
- **Other sources:** NRO savings interest (~Rs 1,40,000) + HDFC FD interest (~Rs 85,000) = ~Rs 2,25,000 passive income.
- **Business / profession:** None visible.
- **Foreign / cross-border relevance:** UK salary (~GBP 72,000), UK income tax paid. Client has asked about FTC. Relevant for DTAA / FTC issue spotting but not for Indian taxability computation under preliminary NR view.

### Key Classification Notes
- Plot sale is the dominant transaction — requires capital gains computation with indexed cost, holding period verification, and TDS mapping.
- Rental income is straightforward but needs rent summary confirmation.
- Passive interest income is routine but must be reconciled with AIS / 26AS.
- UK salary is not taxable in India under preliminary NR view, but the FTC query needs to be addressed through the DTAA module — client may be confusing FTC (which applies to income taxable in both jurisdictions) with general tax paid abroad.

### Likely Review Areas
- Capital gains computation (plot sale — primary complexity driver)
- Rental income detail verification
- TDS credit mapping (buyer TDS on plot + bank/FD TDS)
- DTAA / FTC issue spotting (UK salary + tax context)
- AIS / 26AS reconciliation

### Missing Data / Documents
- Sale deed, purchase deed, cost/improvement records for plot
- TDS certificate / Form 16B from buyer
- Rent agreement / tenant summary
- Bank interest certificates
- AIS / 26AS / TIS review
- UK P60 / tax certificate

### Complexity Indicators
- Material capital gains transaction (Rs 68 lakhs)
- Multiple income categories (4 active buckets)
- Cross-border context with FTC query
- Several missing documents

### Workflow Impact
- This file should not be treated as a basic filing case.
- Capital gains module must be invoked before filing architecture is locked.
- DTAA / FTC module should be invoked to properly address the client's FTC query.

### Recommended Next Step
- pricing-scope-classifier

---

## Module 4 — Pricing & Scope Classifier

### Commercial Classification Snapshot
- Intake category: Amber
- Technical complexity view: Moderate-to-high — material plot sale, multiple income heads, FTC query
- Urgency level: Normal (no compressed deadline indicated)

### Recommended Service Tier
- **Tier 3 — Premium Compliance / Complex Filing**
- Why: material capital gains transaction requires deeper review, multiple income heads need mapping, DTAA/FTC query needs structured response, reconciliation with AIS/26AS is pending, and several key documents are still missing.

### Recommended Pricing Band
- **Band C**
- Why: transaction-heavy case with capital gains computation, multi-head income mapping, cross-border advisory element, and document-dependent workflow. Not a quick filing.

### Proposed Scope Inclusions
- Full case review across intake, residency, income mapping
- Capital gains computation support for plot sale
- Rental income and passive income review
- AIS / 26AS / TIS reconciliation
- DTAA / FTC advisory note addressing client's UK tax credit query
- Return preparation and filing support
- Structured advisory summary

### Proposed Exclusions / Assumptions
- No notice representation included
- No multi-year review or regularization included
- Pricing assumes timely receipt of sale deed, purchase deed, and UK tax documents
- Detailed UK tax advisory or UK return support is not included
- Re-scoping may be needed if additional transactions or complications emerge from AIS review

### Review Path
- Senior reviewer with partner escalation if capital gains computation or FTC position becomes ambiguous

### Upsell or Add-On Opportunities
- Detailed capital gains advisory note (standalone)
- Post-filing notice support package
- Annual NRI tax planning retainer
- UK-India cross-border structuring consultation

### Recommended Next Step
- ais-26as-tis-reconciliation

---

## Module 5 — AIS / 26AS / TIS Reconciliation

### Reconciliation Snapshot
- Department data sources reviewed: AIS (downloaded by client, reviewed by team), 26AS, TIS
- Income map reference: rental income + plot sale capital gains + NRO interest + FD interest
- Overall mismatch risk view: Moderate — plot sale signal and TDS mapping require verification

### Matched Items
- NRO savings interest entry in AIS broadly aligns with client's stated Rs 1.4 lakhs
- FD interest entry in AIS broadly aligns with client's stated Rs 85,000
- One TDS credit entry visible in 26AS appears to relate to NRO interest TDS

### Unmatched / Mismatch Items
- Property transaction signal visible in AIS — shows Nashik plot transaction with consideration of Rs 68 lakhs. Client has confirmed this sale but sale deed and purchase papers are still pending.
- TDS linked to property transaction appears in 26AS (buyer-deducted TDS) — amount visible is approximately Rs 68,000 (1% of Rs 68 lakhs). Client had not confirmed this amount. Needs Form 16B verification.
- Rental income signal not visible in AIS (common for smaller rental amounts where tenant may not have reported). No mismatch risk — but rental details still need confirmation from client.
- One small mutual fund dividend entry (~Rs 3,200) visible in AIS — client did not mention this. Likely minor but needs confirmation.

### Severity Classification
- **Level 1 items:** small MF dividend entry (~Rs 3,200) not mentioned by client — likely minor, needs confirmation
- **Level 2 items:** property TDS amount needs Form 16B verification; rental income details not yet documented
- **Level 3 items:** none currently, provided plot sale papers are received and reconciled

### Missing Support / Documents Required
- Sale deed for Nashik plot (to reconcile AIS property signal)
- Purchase deed / registration papers
- Form 16B from buyer (to reconcile TDS amount)
- Rent agreement / tenant details
- MF account statement (to confirm dividend entry and no redemption)

### Recommended Pre-Filing Actions
- Obtain and verify plot sale and purchase papers
- Confirm Form 16B amount matches 26AS TDS entry
- Confirm MF dividend entry and include in income disclosure
- Document rental income details

### Filing Impact
- Return architecture should remain provisional until plot sale papers are verified against AIS signal.
- TDS credit on property should not be finalized without Form 16B.
- Minor MF dividend should be included once confirmed.

### Escalation Flags
- None currently — provided documents are received in reasonable time.
- If plot papers show a materially different transaction profile than AIS signal, escalate to senior.

### Recommended Next Step
- itr-form-schedule-selector

---

## Module 6 — ITR Form & Schedule Selector

### Filing Blueprint Snapshot
- Relevant year: FY 2024-25
- Preliminary residency status dependency: stable — high-confidence NR view
- Complexity level: moderate-to-high

### Likely Return Pathway
- **ITR-2** is the most likely form pathway.
- Why: NRI with capital gains (plot sale), house property income, and interest income. No business/profession income. ITR-2 covers salary (not applicable here but form accommodates NRI capital gains and house property), capital gains, house property, and other sources.

### Schedule / Reporting Areas Requiring Review
- **Schedule CG (Capital Gains):** plot sale — long-term capital gains computation with indexed cost. This is the critical schedule.
- **Schedule HP (House Property):** rental income from Pune flat. Standard computation needed.
- **Schedule OS (Other Sources):** NRO interest + FD interest + minor MF dividend.
- **Schedule TDS:** TDS credits — buyer-deducted TDS on plot + bank TDS on interest/FD. Must be fully mapped.
- **Schedule FSI / TR (Foreign Source Income / Tax Relief):** may be relevant if FTC is claimed. Needs DTAA module output first. If no FTC is ultimately applicable (likely outcome given NR status and India-only income taxation), these schedules may not be needed.
- **Tax on total income computation:** ensure NR-applicable rates are used for capital gains and other income.

### Dependencies Before Final Form Lock
- Plot sale deed and purchase deed (for CG computation)
- Form 16B (for TDS credit verification)
- Rent agreement / tenant summary (for HP computation)
- DTAA / FTC module output (to determine whether FSI/TR schedules are needed)
- Passport stay verification (already high-confidence but technically pending)

### Reconciliation-Driven Cautions
- AIS property signal must be reconciled with actual sale deed before CG schedule is finalized.
- Minor MF dividend entry to be included in OS schedule.
- TDS credit mapping must be complete before filing.

### Filing Team Notes
- Do not finalize CG schedule until transaction papers are reviewed and computation is prepared.
- Confirm with DTAA module whether FSI/TR schedules are needed before final form preparation.
- NR-specific rate considerations apply — ensure no resident-rate default.
- This is not a basic filing case — senior reviewer should check computation before filing.

### Recommended Next Step
- capital-gains-analyzer (for plot sale) → dtaa-ftc-issue-spotter (for UK FTC query) → pre-filing-risk-review

---

## Module 7 — Capital Gains Analyzer

### Transaction Review Snapshot
- Relevant year: FY 2024-25
- Transaction category: immovable property (residential plot) sale
- Materiality view: high — Rs 68 lakhs consideration

### Transaction Classification
- One residential plot in Nashik sold in November 2024.
- Consideration: Rs 68 lakhs.
- Acquisition: 2017, cost stated approximately Rs 22 lakhs.
- Holding period: approximately 7 years — likely long-term capital asset.
- Buyer-deducted TDS: approximately Rs 68,000 (1% of consideration) per 26AS. Form 16B not yet received.

### Support and Computation Dependencies
- **Sale deed required:** to confirm date of sale, consideration received, buyer details, and terms.
- **Purchase deed / registration required:** to confirm date of acquisition and actual purchase cost.
- **Cost of improvement:** client has not mentioned improvements — needs explicit confirmation of nil or documented cost.
- **Indexed cost computation:** Cost Inflation Index for FY 2017-18 (acquisition) to FY 2024-25 (sale) will be needed. CII for 2017-18 is 272; CII for 2024-25 is 363. Indexed cost of acquisition = Rs 22,00,000 × (363/272) = approximately Rs 29,35,294.
- **Preliminary LTCG estimate:** Rs 68,00,000 − Rs 29,35,294 = approximately Rs 38,64,706 (subject to verification of actual purchase cost and any improvement costs).
- **TDS verification:** Form 16B from buyer required to confirm Rs 68,000 TDS and claim credit.
- **Section 54 / 54F exemption:** client has not mentioned purchase of new residential property or investment in capital gains bonds. Should be explicitly asked — significant tax savings possible if applicable.

### Reporting Sensitivities
- AIS shows the transaction — filing must be consistent with department-visible data.
- TDS credit should not be finalized without Form 16B.
- If actual purchase cost differs from client's estimate, computation changes materially.
- If Section 54/54F exemption is available but not claimed, client misses substantial tax benefit.

### Key Risk Flags
- Sale deed and purchase deed not yet received — computation is currently estimated, not verified.
- Section 54/54F exemption opportunity has not been explored with client.
- If CII or actual acquisition cost differs, LTCG changes substantially.

### Documentation Gaps
- Sale deed
- Purchase deed / registration
- Cost of improvement confirmation (nil or documented)
- Form 16B from buyer
- Client confirmation on Section 54/54F — has any new residential property been purchased or are capital gains bonds being considered?

### Escalation Requirement
- **client-clarification-round**
- Why: transaction papers missing; Section 54/54F opportunity must be discussed with client before final computation.

### Recommended Next Step
- dtaa-ftc-issue-spotter (parallel) → client-clarification-round → pre-filing-risk-review

---

## Module 8 — DTAA / FTC Issue Spotter

### Cross-Border Issue Snapshot
- Relevant year: FY 2024-25
- Residency context: high-confidence preliminary non-resident view
- Cross-border materiality view: moderate — client has asked about FTC but the applicability needs clarification

### Likely DTAA / FTC Relevance Areas
- Client earns UK salary (~GBP 72,000) and pays UK income tax. He has asked whether he can claim foreign tax credit in India.
- **Key clarification needed:** Under a preliminary NR view, the client's UK salary is NOT taxable in India (only Indian-source income is taxable for NRIs). Therefore, FTC in the traditional sense (claiming credit for foreign tax paid against Indian tax on the same income) is unlikely to be applicable here.
- FTC under Section 90/91 and Rule 128 applies where income is taxable in BOTH jurisdictions. Since UK salary is not taxable in India for a non-resident, there is no double taxation to relieve.
- However, if the India-UK DTAA is relevant for any other reason (e.g., if residency changes, or if any specific Indian-source income is also taxed in UK), it should be flagged.
- The client's FTC query appears to stem from a common NRI misconception. This should be addressed clearly in the advisory memo.

### Missing Support / Dependency List
- UK P60 or employer tax summary (useful to have on file even if FTC is not applicable)
- UK tax return copy (optional, for completeness)
- Confirmation that no Indian-source income has been taxed in UK (unlikely but should be ruled out)

### Key Advisory-Sensitive Flags
- Client expects FTC but it is likely not applicable under NR status for UK salary.
- This must be communicated carefully to avoid client disappointment or confusion.
- If residency view changes (unlikely), FTC position would need complete reassessment.

### Filing Caution Notes
- Do not include FSI/TR schedules unless there is actual double taxation to relieve.
- If client insists on claiming FTC for UK tax on UK salary against Indian tax liability, explain that this is not how the mechanism works for non-residents.
- Document the advisory position clearly in the memo.

### Escalation Requirement
- **None** — this is a clarification and advisory communication issue, not a technical escalation.
- If client pushes back or if any Indian-source income turns out to be taxed in UK, escalate to senior.

### Recommended Next Step
- pre-filing-risk-review

---

## Module 9 — Pre-Filing Risk Review

### Pre-Filing Review Snapshot
- Relevant year: FY 2024-25
- Case complexity: Amber — plot sale + multiple income heads + FTC query
- Upstream modules completed: intake, residency, income map, pricing, reconciliation, filing blueprint, capital gains analyzer, DTAA/FTC issue spotter

### Readiness Status
- **Conditionally Ready**
- Why: core analysis and workflow are complete. Residency is high-confidence NR. Income mapping is clear. DTAA/FTC position is resolved (FTC not applicable). Filing architecture (ITR-2) is identified. However, three critical items remain pending before filing can be locked.

### Unresolved Blockers
1. Plot sale deed and purchase deed not yet received — capital gains computation is estimated, not verified.
2. Form 16B from buyer not received — TDS credit cannot be finalized.
3. Section 54/54F opportunity not yet discussed with client — if applicable, it materially reduces tax liability.

### Key Risk Flags
- Filing without verified sale/purchase documents is defensibly weak.
- If actual acquisition cost differs from client estimate, LTCG changes materially.
- Missing Section 54/54F discussion could result in client overpaying tax.
- Minor MF dividend (~Rs 3,200) from AIS needs to be included.

### Documentation Gaps
- Sale deed (Nashik plot)
- Purchase deed / registration (2017)
- Cost of improvement confirmation
- Form 16B from plot buyer
- Rent agreement / tenant details (Pune flat)
- Client response on Section 54/54F

### Escalation Requirement
- **client-clarification-round**
- Why: critical transaction documents and Section 54/54F discussion are pending.

### Filing Recommendation
- **Hold until:**
  1. Plot sale and purchase papers are received and capital gains computation is verified.
  2. Form 16B is obtained and TDS credit is confirmed.
  3. Section 54/54F applicability is discussed with client.
- Once these three items are resolved, the file can move to return preparation with senior reviewer sign-off.

### Recommended Next Step
- client-clarification-round → capital-gains-computation-finalization → filing-lock → advisory-memo-generator

---

## Module 10 — Advisory Memo Generator

### Advisory Memo

**Client:** Rajesh Mehta  
**Assessment Year:** AY 2025-26  
**Date:** [current date]  
**Memo Type:** Client Advisory  
**Prepared By:** [NRI Tax Desk]  

---

### Facts Captured
- You are currently resident in the United Kingdom and have been working there full-time since August 2021.
- Your India stay during FY 2024-25 is estimated at approximately 38 days.
- Your Indian income for the year includes: rental income from a flat in Pune (~Rs 3,00,000 annual), interest from NRO savings account (~Rs 1,40,000), interest from HDFC FD (~Rs 85,000), a minor mutual fund dividend (~Rs 3,200), and capital gains from the sale of a residential plot in Nashik (consideration Rs 68,00,000).
- TDS has been deducted by the plot buyer (approximately Rs 68,000 per preliminary 26AS review).
- You earn a UK salary of approximately GBP 72,000 and pay UK income tax on it.

### Assumptions
- Based on your reported India stay of approximately 38 days and continuous UK employment since 2021, a preliminary non-resident status has been adopted for this assessment. This is subject to final confirmation once passport travel records are reviewed.
- The plot acquisition cost is assumed to be approximately Rs 22,00,000 based on your statement. This is subject to verification from the purchase deed.
- No cost of improvement has been assumed unless you confirm otherwise.

### Key Issues

**1. Capital Gains from Plot Sale**
The sale of your Nashik plot is a material transaction. Based on preliminary estimates using indexed cost, your long-term capital gains could be approximately Rs 38–39 lakhs. However, this computation cannot be finalized until your sale deed and purchase deed are reviewed. There may also be an opportunity to reduce or defer this tax liability — please see the action items below.

**2. Section 54 / 54F Exemption Opportunity**
If you have purchased or plan to purchase a new residential property in India within the prescribed time limits, or if you invest the capital gains amount in specified capital gains bonds (Section 54EC) within 6 months of the sale, you may be eligible for a significant exemption from capital gains tax. This is an important planning opportunity we should discuss before finalizing the return.

**3. Foreign Tax Credit Query**
You asked about claiming foreign tax credit for UK tax paid. Since you are being treated as a non-resident for Indian tax purposes, your UK salary is not taxable in India. Foreign tax credit applies only where the same income is taxed in both countries. Since your UK salary is outside India's tax net under your NR status, FTC is not applicable in this case. This is a common question among NRIs and does not create any filing issue — it simply means no additional credit or schedule is needed.

**4. Rental Income**
Your Pune flat rental income of approximately Rs 3,00,000 will be computed under the house property head after allowing for standard deduction. We will need your rent agreement or a summary of rental receipts to finalize this.

**5. Interest and Passive Income**
Your NRO and FD interest totaling approximately Rs 2,25,000 plus a minor MF dividend (~Rs 3,200) will be included under income from other sources. TDS has been deducted on these — we will map the credits from your 26AS.

### Advisory Summary
- You are likely to be treated as a non-resident for FY 2024-25.
- Your Indian income will include rental income, capital gains from the plot sale, and interest/dividend income.
- The return form will be ITR-2.
- The most significant item is the plot sale capital gains. Final computation and any exemption claim depend on documents you need to provide.
- Foreign tax credit is not applicable in your situation.

### Risk Flags
- Filing should not be finalized until plot sale and purchase documents are received and the capital gains computation is verified.
- Section 54/54F exemption discussion should happen before the return is filed — missing this could result in unnecessary tax payment.
- AIS reconciliation is largely clean but Form 16B from the plot buyer must be obtained to confirm TDS credit.

### Recommended Actions
**Please provide at your earliest convenience:**
1. Sale deed for the Nashik plot
2. Purchase deed / registration papers from 2017
3. Confirmation on whether any improvement costs were incurred on the plot
4. Form 16B from the plot buyer
5. Rent agreement or rental receipt summary for the Pune flat
6. Passport travel pages for FY 2024-25
7. UK P60 or employer tax summary (for our records)

**Please confirm:**
8. Have you purchased or do you plan to purchase a new residential property in India? (relevant for Section 54 exemption)
9. Are you considering investing in capital gains bonds? (relevant for Section 54EC — must be done within 6 months of sale)

Once we receive these documents and your responses, we will finalize the computation, prepare the return, and share a summary before filing.

### Usage Note
- This memo is based on information available as of the date above. The advisory position may change if additional facts, documents, or regulatory developments emerge. This is not a formal legal opinion. Engagement scope as agreed applies.

---

## Test Run Summary

| Module | Status | Key Finding |
|--------|--------|-------------|
| 1. Case Intake | Complete | Amber classification — plot sale + FTC query + multiple heads |
| 2. Residency Analyzer | Complete | High-confidence NR view, pending passport confirmation |
| 3. Income Source Mapper | Complete | 4 active income buckets, CG is primary complexity driver |
| 4. Pricing & Scope | Complete | Tier 3, Band C — premium compliance |
| 5. Reconciliation | Complete | AIS property signal matched, TDS needs Form 16B, minor MF dividend found |
| 6. Form & Schedule Selector | Complete | ITR-2, CG schedule is critical, FSI/TR likely not needed |
| 7. Capital Gains Analyzer | Complete | ~Rs 38.6L estimated LTCG, Section 54/54F opportunity flagged |
| 8. DTAA/FTC Issue Spotter | Complete | FTC not applicable under NR status — client misconception addressed |
| 9. Pre-Filing Risk Review | Conditionally Ready | Blocked on 3 items: sale/purchase papers, Form 16B, Section 54/54F discussion |
| 10. Advisory Memo | Complete | Client-ready memo with clear actions, risk flags, and planning opportunity |

### Validation Notes
- All 10 modules produced structured output following their defined formats.
- Each module correctly routed to the next module in sequence.
- Hard stops were respected — filing was not marked Ready due to missing documents.
- The DTAA/FTC module correctly identified that the client's FTC expectation was a misconception and addressed it constructively.
- The Capital Gains module flagged Section 54/54F — a real-world planning opportunity that a basic filing workflow would miss.
- The reconciliation module caught a minor MF dividend (~Rs 3,200) from AIS that the client had not mentioned.
- The advisory memo was written in client-appropriate language with clear action items.
