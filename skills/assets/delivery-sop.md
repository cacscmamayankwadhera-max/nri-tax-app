# NRI Tax Suite — Delivery SOP

## Purpose
This SOP defines the day-to-day operating workflow for delivering NRI tax filing, advisory, and compliance services using the NRI Tax Suite skill pack. It connects intake to final delivery and ensures consistent quality across the team.

## Delivery Stages

### Stage 1 — Lead Receipt & Intake
**Owner:** Intake coordinator / junior team member

1. Send the **Intake Questionnaire** (`assets/intake-questionnaire.md`) to the client.
2. Send the **Document Checklist** (`assets/document-checklist.md`) alongside or immediately after.
3. Once responses are received, run the **NRI Case Intake** module (`references/nri-case-intake.md`).
4. Classify the case as Green / Amber / Red.
5. Generate the document request list for missing items.
6. Log the case in the tracker with: client name, year, classification, missing docs, assigned team member.

**Turnaround target:** Within 1 business day of receiving client responses.

### Stage 2 — Residency & Income Analysis
**Owner:** Preparer / senior associate

1. Run the **Residential Status Analyzer** (`references/residential-status-analyzer.md`).
2. Run the **Income Source Mapper** (`references/income-source-mapper.md`).
3. Document the preliminary residency view with confidence level.
4. Map all income heads and flag complexity indicators.
5. If capital gains or cross-border triggers are visible, note for specialist module routing.

**Turnaround target:** Within 2 business days of intake completion.

### Stage 3 — Commercial Scoping
**Owner:** Senior associate / manager

1. Run the **Pricing & Scope Classifier** (`references/pricing-scope-classifier.md`).
2. Assign service tier (1–4) and pricing band (A–D).
3. Refer to the **Pricing Policy** (`assets/pricing-policy.md`) for guardrails.
4. Prepare scope note with inclusions, exclusions, and assumptions.
5. Issue engagement confirmation / fee quote to client.

**Turnaround target:** Within 1 business day of analysis completion.

### Stage 4 — Reconciliation & Filing Architecture
**Owner:** Senior associate / reviewer

1. Run the **AIS / 26AS / TIS Reconciliation** module (`references/ais-26as-tis-reconciliation.md`).
2. Classify mismatches by severity (Level 1 / 2 / 3).
3. Run the **ITR Form & Schedule Selector** (`references/itr-form-schedule-selector.md`).
4. Produce the filing blueprint with form pathway, schedules, and dependencies.
5. If Level 3 mismatches exist, route for client clarification before proceeding.

**Turnaround target:** Within 2 business days of document receipt.

### Stage 5 — Specialist Review (If Applicable)
**Owner:** Senior reviewer / partner

Invoke these modules only when the case triggers them:

- **Capital Gains Analyzer** (`references/capital-gains-analyzer.md`) — for property sale, securities, startup equity, ESOP transactions.
- **DTAA / FTC Issue Spotter** (`references/dtaa-ftc-issue-spotter.md`) — for cross-border income, foreign tax credit, treaty relevance.

Document findings and route back to the filing lane.

**Turnaround target:** Within 2 business days of routing.

### Stage 6 — Pre-Filing Risk Review
**Owner:** Senior reviewer / partner (for Amber/Red cases)

1. Run the **Pre-Filing Risk Review** (`references/pre-filing-risk-review.md`).
2. Assign readiness status: Ready / Conditionally Ready / Not Ready.
3. If Not Ready, identify specific blockers and route for resolution.
4. If Conditionally Ready, document assumptions and limitations.
5. Only mark Ready when all hard stops are cleared.

**Turnaround target:** Within 1 business day of specialist review completion (or Stage 4 completion for Green cases).

### Stage 6A — Advance Tax Computation & Challan
**Owner:** Senior associate / reviewer
**Trigger:** Estimated total tax liability minus TDS exceeds ₹10,000

1. Compute estimated total tax liability from module outputs (income map, capital gains analyzer, reconciliation).
2. Determine if advance tax is required (total tax liability − TDS already deducted > ₹10,000).
3. If required: identify the next applicable installment date (15 Jun / 15 Sep / 15 Dec / 15 Mar).
4. Prepare Challan 280 details — BSR code, assessment year, tax type (advance tax / self-assessment tax), and PAN.
5. Share payment instruction with client via WhatsApp/email, including amount, due date, and online payment link (tin-nsdl.com or income tax portal).
6. Track payment confirmation from client and update case tracker with challan serial number and date of payment.

**Turnaround target:** Within 1 business day of pre-filing review completion. Payment must be made before the next installment deadline.

### Stage 7 — Return Preparation & Filing
**Owner:** Preparer under reviewer oversight

1. Prepare the return based on the filing blueprint.
2. Cross-check computation against income map, reconciliation, and specialist review notes.
3. Verify TDS credit mapping.
4. Senior reviewer / partner sign-off for Amber and Red cases.
5. File the return.
6. Share filing confirmation with client.

**Turnaround target:** Within 2 business days of Ready status.

### Stage 7A — 15CA/15CB Preparation
**Owner:** Senior associate / reviewer
**Trigger:** Property sale cases requiring repatriation of sale proceeds

1. Prepare Form 15CB (Chartered Accountant certificate) with computation of tax liability, applicable DTAA relief, and net remittable amount.
2. File Form 15CA on the income tax portal based on the signed 15CB.
3. Submit Form 15CA and 15CB to the client's bank along with the remittance request.
4. Verify bank processing and confirm remittance execution.

**Turnaround target:** Within 2 business days of filing completion (or as aligned with client's remittance timeline).

### Stage 7B — Form 67 Filing
**Owner:** Senior associate / reviewer
**Trigger:** Foreign Tax Credit (FTC) is claimed in the return

1. Prepare Form 67 with foreign tax payment evidence, including tax deducted/paid certificates from the foreign jurisdiction.
2. File Form 67 before or along with the ITR on the income tax portal.
3. Attach Tax Residency Certificate (TRC) and tax computation from the foreign jurisdiction as supporting documents.

**Turnaround target:** Must be filed before or simultaneously with the ITR.

### Stage 7C — Section 197 Application
**Owner:** Senior associate / reviewer
**Trigger:** Upcoming property sale where lower/nil TDS deduction is sought

1. Prepare Form 13 application for lower or nil TDS deduction certificate under Section 197.
2. File Form 13 with the Assessing Officer (AO) having jurisdiction over the applicant.
3. Track certificate issuance and follow up with the AO if delayed.
4. Share the issued certificate with the buyer before the property transaction so buyer can deduct TDS at the lower/nil rate.

**Turnaround target:** Must be initiated well before the anticipated transaction date. Allow 3–4 weeks for AO processing.

### Stage 8 — Advisory Memo & Delivery
**Owner:** Senior associate / reviewer

1. Run the **Advisory Memo Generator** (`references/advisory-memo-generator.md`).
2. For Tier 2+ engagements, produce a client-facing advisory summary.
3. For all cases, produce an internal file note.
4. Deliver the advisory memo to the client with the filing confirmation.
5. Note any follow-up items or recommended future actions.

**Turnaround target:** Alongside or within 1 business day of filing.

### Stage 9 — Post-Filing & Follow-Up
**Owner:** Account manager / relationship lead

1. Monitor for processing intimation.
2. If notice is received, classify and route (separate notice-handling workflow).
3. Flag upsell opportunities: annual planning, notice support, family filing.
4. Schedule annual touchpoint for next filing cycle.

### Stage 9A — ITR Verification
**Owner:** Preparer / coordinator

1. E-verify the ITR within 30 days of filing using Aadhaar OTP, net banking, DSC, or bank account EVC.
2. If e-verification is not possible, send the signed ITR-V to CPC Bangalore by speed post within 30 days.
3. Confirm verification status on the income tax portal.

**Critical note:** Failure to verify within 30 days renders the filing void. This step is non-negotiable.

**Turnaround target:** Within 1 business day of filing (same day preferred).

### Stage 9B — 143(1) Intimation Review
**Owner:** Senior associate / reviewer

1. Monitor for processing intimation under Section 143(1) — typically issued within 9 months of filing.
2. Review the intimation to confirm whether it shows refund, demand, or nil adjustment.
3. If a demand exists, assess validity and respond within 30 days — either accept, file rectification under Section 154, or file online response disagreeing with the adjustment.
4. If a refund is due, verify bank account details and track credit.
5. Update the case tracker with intimation status.

**Turnaround target:** Within 2 business days of receiving intimation.

### Stage 10 — Notice Response
**Owner:** Senior reviewer / partner

**Trigger:** Notice received under Section 143(2), 148, 142(1), or any other provision.

1. Assess the scope and nature of the notice — determine whether it is a scrutiny, reassessment, information request, or defective return notice.
2. Escalate to Partner immediately for strategic review and response planning.
3. Prepare a detailed response with supporting documents and legal positions.
4. File the response within the deadline specified in the notice (seek adjournment if needed before the deadline).

**Turnaround target:** Response preparation within 3 business days of receipt; filing before the statutory deadline.

## Quality Checkpoints

| Checkpoint | Owner | Trigger |
|-----------|-------|---------|
| Intake completeness | Coordinator | Before analysis begins |
| Residency view documented | Preparer | Before income mapping |
| Scope note issued | Manager | Before work begins beyond intake |
| Reconciliation resolved or flagged | Reviewer | Before filing blueprint |
| Pre-filing gate passed | Reviewer/Partner | Before return preparation |
| Advance tax challan verified | Reviewer | Before filing if liability − TDS > ₹10,000 |
| Computation cross-check | Reviewer | Before filing |
| ITR verified | Coordinator | Within 1 day of filing |
| 15CA/15CB accuracy check | Reviewer | Before submission to bank |
| Form 67 completeness | Reviewer | Before or with ITR filing |
| Advisory memo completed | Reviewer | Before client delivery |
| 143(1) intimation reviewed | Reviewer | Within 2 days of receipt |

## Case Routing Rules

| Classification | Review Path | Pricing | Advisory Memo |
|---------------|-------------|---------|---------------|
| Green | Standard preparer → reviewer sign-off | Band A | Internal note only (unless Tier 2+) |
| Amber | Senior associate → senior reviewer | Band B–C | Client advisory + internal note |
| Red | Senior reviewer → partner sign-off | Band C–D | Full advisory memo + internal note |

## Escalation Protocol

Escalate immediately if:
- Client is pressing for filing but hard stops remain active
- Material facts change after scoping is locked
- Notice-sensitive or litigation context emerges mid-workflow
- Cross-border or treaty issues exceed team capability
- Client relationship tension requires partner involvement

## Communication Standards

**Client communications should:**
- Be professional and clear
- State what has been done, what is pending, and what the client needs to provide
- Not make promises about outcomes (refund amounts, no-notice guarantees)
- Include scope and assumption disclaimers where relevant

**Internal notes should:**
- Be precise and technical
- Flag open items clearly
- Include reviewer observations
- Reference the specific module outputs used

## File Documentation Standard

Every completed case file should contain:
1. Intake summary (from NRI Case Intake)
2. Residency analysis (from Residential Status Analyzer)
3. Income map (from Income Source Mapper)
4. Scope/pricing note (from Pricing & Scope Classifier)
5. Reconciliation summary (from AIS/26AS/TIS Reconciliation)
6. Filing blueprint (from ITR Form & Schedule Selector)
7. Pre-filing review (from Pre-Filing Risk Review)
8. Specialist module outputs (if applicable)
9. Advisory memo (from Advisory Memo Generator)
10. Filing confirmation
11. Client correspondence log
12. Challan 280 receipts for advance tax / self-assessment tax paid
13. Form 16 from Indian employer (if salaried)
14. Form 16A from banks / tenants (TDS certificates)
15. Form 16B from property buyer (Section 194IA / 195 TDS)
16. TCS certificates (for LRS remittances)

## Turnaround Summary

| Stage | Target |
|-------|--------|
| Intake processing | 1 business day |
| Residency + income analysis | 2 business days |
| Commercial scoping | 1 business day |
| Reconciliation + filing blueprint | 2 business days |
| Specialist review (if needed) | 2 business days |
| Pre-filing gate | 1 business day |
| Advance tax computation & challan (if needed) | 1 business day post pre-filing review |
| Return preparation + filing | 2 business days |
| 15CA/15CB preparation (if needed) | 2 business days post-filing |
| Form 67 filing (if FTC claimed) | With ITR filing |
| Section 197 application (if needed) | 3–4 weeks before transaction |
| Advisory memo delivery | With filing or +1 day |
| ITR verification | Same day / within 1 day of filing |
| 143(1) intimation review | Within 2 days of receiving intimation |
| Notice response (if triggered) | Within 3 days; before statutory deadline |

**Total typical turnaround (Green case, complete docs):** 5–7 business days  
**Total typical turnaround (Amber/Red case):** 8–12 business days  
**Note:** All timelines assume timely client document submission.
