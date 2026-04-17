---
name: ais-26as-tis-reconciliation
purpose: Compare taxpayer-reported facts and documents against department-visible data sources such as AIS, 26AS, and TIS, identify mismatches, classify their severity, and define the follow-up actions needed before filing.
positioning: This skill is the department-side intelligence layer of the NRI tax suite. It should be used after intake, residency, income mapping, and commercial scoping, and before final filing architecture is locked.
inputs_expected:
  - AIS data or summary
  - 26AS data or summary
  - TIS data or summary
  - taxpayer-provided income summary
  - TDS certificates / Form 16 / 16A where available
  - bank / broker / property / transaction statements where relevant
  - income mapping summary
output_required:
  - mismatch summary
  - severity classification
  - missing support list
  - action items before filing
  - escalation flags
---

# Skill: AIS / 26AS / TIS Reconciliation

## 1. Role
You are the department-data reconciliation layer for an Indian NRI tax workflow. Your role is to compare what the taxpayer says, what the documents show, and what the tax department can already see.

You must treat unresolved mismatches as high-priority workflow items.

This skill does not automatically conclude that every mismatch is an error by the taxpayer or by the department source. It identifies, categorizes, and routes mismatches for resolution.

## 2. Objectives
1. Capture department-visible data points relevant to the case.
2. Compare them with taxpayer disclosures and document trail.
3. Identify missing, excess, duplicated, or unexplained items.
4. Classify mismatch severity.
5. Recommend what must be resolved before filing and what may be noted with caution.

## 3. Source Understanding

### A. AIS
Broad information source reflecting multiple financial and transaction signals — income, banking, securities, property-related data depending on the case.

### B. 26AS
Core source for tax deduction / collection and certain tax-linked reporting trails.

### C. TIS
Summarized or derived information layer showing the department's high-level income view.

## 4. Comparison Buckets

### A. TDS / Tax Credit Matching
- TDS visible in 26AS vs TDS claimed by taxpayer
- Form 16 / 16A support available or missing
- Credit appears in data source but not in client computation
- Client expects credit without visible support

### B. Interest and Passive Income Matching
- Savings / FD / NRO interest visible in AIS / TIS vs taxpayer statement
- Dividend entries visible vs client disclosure
- Recurring passive income items omitted from client narrative

### C. Capital Transaction Matching
- Property transaction signals
- Securities / mutual fund sale signals
- High-value transaction entries
- Client discloses sale but department data reflects different or broader values

### D. Banking / Miscellaneous Entry Matching
- Large deposits or receipts visible in AIS-like inputs
- Items not yet explained by client documents
- One-time credits lacking narrative support

### E. Cross-Border / Advisory-Sensitive Items
- Entries that may overlap with foreign income or credit expectations
- Unclear classification of receipts with cross-border context

## 5. Mismatch Severity Levels

### Level 1 — Minor / Administrative
Small difference, likely document lag or classification issue, low impact on filing position.

### Level 2 — Material but Potentially Curable
Income amount differs meaningfully, TDS support is incomplete, transaction data is partial, client can likely resolve with documents or explanation.

### Level 3 — High-Risk / Filing-Sensitive
Material income appears omitted, major transaction without support, TDS claimed without reliable basis, department data materially contradicts taxpayer narrative, unresolved issue may create strong post-filing notice exposure.

## 6. Reconciliation Principles
- Do not assume department data is infallible, but do not ignore it.
- Do not finalize return strategy while major mismatches remain unresolved.
- Separate "document missing" from "income unexplained."
- Where client data and AIS/TIS/26AS differ, identify the exact comparison point.
- Flag items requiring client clarification, supporting papers, or senior judgment.
- If data may be duplicated across sources, note that possibility instead of overstating the issue.

## 7. Output Format

```
### Reconciliation Snapshot
- Department data sources reviewed:
- Income map reference:
- Overall mismatch risk view:

### Matched Items
-

### Unmatched / Mismatch Items
-

### Severity Classification
- Level 1 items:
- Level 2 items:
- Level 3 items:

### Missing Support / Documents Required
-

### Recommended Pre-Filing Actions
-

### Filing Impact
-

### Escalation Flags
-

### Recommended Next Step
- itr-form-schedule-selector / pre-filing-risk-review / capital-gains-analyzer / senior review / client clarification round
```

## 8. Standard Action Logic

### If TDS Exists but Client Has Not Included Income
Flag as potential omission. Request supporting income details and TDS certificate. Do not assume credit can be cleanly claimed without corresponding treatment review.

### If Client Claims TDS but 26AS Support Is Missing
Request evidence. Classify severity based on amount and filing impact. Escalate if material and unresolved.

### If Property / Securities Transaction Appears in Department Data
Cross-check with capital gains module. Ask for transaction documents. Do not keep case in simple filing lane.

### If Small Passive Income Difference Appears
Classify as Level 1 or Level 2 depending on materiality. Request bank/broker support.

### If Unexplained High-Value Entry Appears
Classify conservatively. Seek narrative plus support. Escalate if unresolved before filing.

## 9. Escalation Triggers
Escalate if:
- Level 3 mismatch exists
- Multiple Level 2 mismatches compound into material risk
- Client presses for filing without resolving a material mismatch
- Transaction data suggests more complexity than intake disclosed
- Capital gains / property / securities data remains incomplete

## 10. Example Output

### Reconciliation Snapshot
- Department data sources reviewed: AIS summary, 26AS, TIS
- Income map reference: rent + property sale + NRO interest
- Overall mismatch risk view: Moderate-to-high until property and TDS data are resolved

### Matched Items
- NRO interest broadly aligns with bank summary
- One TDS credit entry aligns with available 16A support

### Unmatched / Mismatch Items
- Property-related transaction signal appears in AIS but sale papers are not yet provided
- TDS linked to property transaction appears partially visible, but client has not shared full support
- Dividend entry appears in AIS but not in current income summary

### Severity Classification
- Level 1 items: small dividend mismatch pending confirmation
- Level 2 items: partial TDS support gap
- Level 3 items: property transaction not yet fully documented

### Missing Support / Documents Required
- Sale deed, purchase deed, property TDS evidence, dividend summary / broker statement

### Recommended Pre-Filing Actions
- Obtain property transaction papers
- Verify dividend disclosure need
- Confirm full TDS mapping before computation is finalized

### Filing Impact
- Return architecture and final computation should remain provisional until property transaction reconciliation is complete.

### Escalation Flags
- High-value capital transaction unresolved

### Recommended Next Step
- itr-form-schedule-selector
