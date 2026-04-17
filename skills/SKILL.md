---
name: nri-tax-suite
summary: AI-assisted operating system for NRI tax return filing, advisory, tax planning, and compliance workflows in the Indian income-tax context.
description: >
  Use this skill whenever the user asks about NRI tax filing, NRI ITR, residential status review,
  NRI income classification, AIS/TIS/26AS reconciliation for NRIs, NRI capital gains, DTAA/FTC
  issues, NRI tax planning, NRI advisory memos, NRI client intake, NRI pricing/scoping, or any
  Indian income-tax workflow involving Non-Resident Indians. Also trigger when the user mentions
  any module name from this suite. Trigger even for casual phrasing like "run the NRI intake",
  "check residency for this client", "price this NRI file", "reconcile AIS for NRI", or
  "draft the advisory memo". If NRI + Indian tax context exists, use this skill.
version: 1.0
owner: MKW / Tax Advisory Team
use_cases:
  - NRI ITR filing
  - residential status review
  - Indian-source income classification
  - AIS / TIS / 26AS reconciliation
  - capital gains issue spotting
  - DTAA / FTC issue spotting
  - pre-filing QC
  - advisory memo generation
principles:
  - Do not assume facts where the client has not provided data.
  - Separate legal position from practical filing recommendation.
  - Highlight uncertainty, missing data, and ambiguity clearly.
  - Distinguish simple filing cases from advisory-heavy or specialist-review cases.
  - Treat department-visible data mismatches as high-priority review items.
  - Never present speculative tax conclusions as final.
  - Always document assumptions used in analysis.
output_standard:
  tone: professional, precise, advisory-led
  structure:
    - facts captured
    - assumptions
    - issue summary
    - analysis
    - risk flags
    - next action
suite_modules:
  - nri-case-intake
  - residential-status-analyzer
  - income-source-mapper
  - pricing-scope-classifier
  - ais-26as-tis-reconciliation
  - itr-form-schedule-selector
  - pre-filing-risk-review
  - capital-gains-analyzer
  - dtaa-ftc-issue-spotter
  - advisory-memo-generator
---

# NRI Tax Suite

An AI-assisted operating system for Indian NRI tax return filing, advisory, tax planning, and compliance.

## How This Skill Works

This is a **multi-module skill**. The master file (this document) defines the workflow, principles, and routing. Each module lives in `references/` and should be read when that step is active. Support assets live in `assets/`.

**Before starting any NRI tax workflow**, read this file first. Then read the relevant module from `references/` based on where the case stands.

## Workflow Sequence

Read the relevant `references/<module>.md` file at each step.

| Step | Module File | Objective |
|------|------------|-----------|
| 1 | `references/nri-case-intake.md` | Classify case type, collect facts, generate document list |
| 2 | `references/residential-status-analyzer.md` | Determine likely tax residency position and missing data |
| 3 | `references/income-source-mapper.md` | Map income heads and identify schedules / complexity |
| 4 | `references/pricing-scope-classifier.md` | Assign service tier and likely pricing band |
| 5 | `references/ais-26as-tis-reconciliation.md` | Reconcile taxpayer data with department-visible data |
| 6 | `references/itr-form-schedule-selector.md` | Identify probable return form and schedules requiring review |
| 7 | `references/capital-gains-analyzer.md` | Review transaction-heavy cases and sale/investment issues |
| 8 | `references/dtaa-ftc-issue-spotter.md` | Flag treaty and foreign tax credit review need |
| 9 | `references/pre-filing-risk-review.md` | Final readiness and defensibility review |
| 10 | `references/advisory-memo-generator.md` | Generate client-facing or file-note summary |

Steps 7–8 are specialist modules — invoke when the case involves capital transactions or cross-border complexity.

## Support Assets

| Asset | File |
|-------|------|
| Client Intake Questionnaire | `assets/intake-questionnaire.md` |
| Document Checklist | `assets/document-checklist.md` |
| Pricing Policy | `assets/pricing-policy.md` |
| Delivery SOP | `assets/delivery-sop.md` |

## Case Segmentation

### Green — Basic Filing
**Indicators:** limited Indian income sources, no major mismatch indicators, no substantial capital gains complexity, no treaty or FTC complications apparent.
**Action:** Standard filing workflow.

### Amber — Advisory Filing
**Indicators:** residency ambiguity, capital gains or multiple income types, reconciliation gaps, possible DTAA / FTC angle.
**Action:** Filing plus advisory review.

### Red — Premium / Specialist Review
**Indicators:** high-value transactions, complex disclosures, unresolved data mismatch, potential notice exposure, legal ambiguity or litigation sensitivity.
**Action:** Partner review before filing.

## Hard Stops

Do not allow filing lock if any of these remain unresolved:
- Missing stay-period data where residency conclusion is required
- Missing transaction data for a material capital gains event
- Major AIS / 26AS mismatch unresolved
- Client seeks definitive position despite material missing facts
- Possible foreign disclosure / treaty / FTC issue without sufficient documents
- Potential notice-sensitive case without senior review

## Universal Red Flags

- Client facts inconsistent across questionnaires / documents
- TDS claimed without matching support
- Property transaction amounts inconsistent with available papers
- Department data showing income not disclosed by client
- Capital gains events lacking acquisition details or cost base support
- Client requests aggressive filing without documentation
- Unclear residency days or dual-jurisdiction tax position

## Escalation Rules

Escalate to senior if:
- Ambiguity materially changes tax position
- Case involves treaty interpretation
- Foreign tax credit claim may be material
- High-value capital transaction exists
- Prior notice / reassessment / scrutiny history exists
- Filing is time-sensitive but facts are incomplete

## Default Output Template

```
### Case Snapshot
- Client type:
- Likely category:
- Current stage:

### Facts Captured
-

### Missing / Unclear Data
-

### Key Issues
-

### Preliminary View
-

### Risk Flags
-

### Recommended Next Step
-
```

## QA Protocol

1. Confirm facts before conclusion.
2. List assumptions explicitly.
3. Separate issue spotting from final opinion.
4. Flag anything requiring partner review.
5. Ensure next step is action-oriented.
