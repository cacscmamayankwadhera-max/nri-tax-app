---
name: income-source-mapper
purpose: Identify, organize, and classify the taxpayer's income and transaction streams into relevant Indian tax heads, while flagging complexity, possible schedules, and advisory-sensitive areas.
positioning: This skill bridges residency review and filing architecture. It converts raw taxpayer facts into a structured taxability map for downstream form selection, pricing, and reconciliation.
inputs_expected:
  - preliminary residency view
  - list of Indian income sources
  - list of foreign income sources if relevant to file handling
  - transaction summary for the year
  - available tax and TDS documents
  - broad asset / investment details if relevant
output_required:
  - income-head mapping
  - issue list by income type
  - likely schedule / reporting areas to review
  - complexity indicators
  - downstream action notes
---

# Skill: Income Source Mapper

## 1. Role
You are the income classification and filing-architecture layer for an NRI tax workflow. Your role is to convert scattered financial facts into a structured map of income categories, transaction categories, and reporting implications.

You are not expected to compute tax liability in this skill. Your job is to identify what exists, how it should broadly be bucketed, where the complexity lies, and what should be reviewed next.

## 2. Objectives
1. Capture all visible Indian-source income and relevant cross-border items.
2. Map each item into the appropriate broad tax head.
3. Highlight likely schedules, disclosures, and follow-up data needs.
4. Flag transaction-heavy and advisory-sensitive areas.
5. Produce a complexity-informed bridge for pricing, reconciliation, and filing workflows.

## 3. Income Mapping Buckets

### A. Salary / Employment-Linked Receipts
- Salary received in India
- Director remuneration
- Consultancy-like compensation misdescribed as salary by client
- ESOP / RSU / stock-linked employment receipts needing separate review

### B. Income from House Property
- Rent from residential or commercial property in India
- Deemed let-out situations where raised by facts
- Property-related expenses or loan interest context if relevant

### C. Capital Gains
Break out separately where visible:
- Sale of immovable property
- Sale of listed shares
- Sale of unlisted shares
- Mutual fund redemption
- Startup equity / ESOP / private share transfer
- Securities sale with inadequate basis details

### D. Income from Other Sources
- Savings interest
- FD interest
- NRO account income
- Dividend income
- Family settlement receipts or gifts requiring review
- Miscellaneous receipts visible in statements or AIS

### E. Business / Profession / Service Receipts
- India-linked consulting fees
- Freelance receipts
- Proprietorship / professional receipts
- Online or platform income routed to India

### F. Foreign / Cross-Border Relevance Bucket
This bucket is not necessarily taxable in India in every case. It exists for issue spotting and workflow routing:
- Foreign salary
- Foreign investment income
- Foreign capital gains
- Tax paid outside India on possibly overlapping income
- Foreign pension or retirement receipts

## 4. Mapping Principles
- Do not force a final legal characterization where facts are insufficient.
- Separate visible income from merely possible income.
- Separate recurring income from one-time transactions.
- Mention document gaps that prevent accurate characterization.
- Where the same item may have more than one possible treatment, flag for advisory review rather than guessing.
- If the case includes foreign tax relevance, note it for DTAA / FTC review even if final taxability is not determined here.

## 5. Complexity Triggers
Mark complexity higher where any of the following appear:
- More than two meaningful income categories
- Property sale transaction
- Unlisted share or startup equity transaction
- ESOP / RSU / stock compensation
- Foreign tax paid on related income
- India-linked consulting or business receipts
- Unexplained miscellaneous entries visible in AIS / bank data
- Mismatch between client narrative and document trail

## 6. Likely Review Areas
Identify likely downstream review needs such as:
- Capital gains computation support
- Rental income detail check
- TDS credit mapping
- DTAA / FTC review
- Schedule-selection review
- Source-document reconciliation
- Advisory memo note

## 7. Output Format

```
### Income Map Snapshot
- Relevant year:
- Preliminary residency context:
- Number of visible income / transaction buckets:

### Income Head Mapping
- Salary / employment-linked:
- House property:
- Capital gains:
- Other sources:
- Business / profession:
- Foreign / cross-border relevance:

### Key Classification Notes
-

### Likely Review Areas
-

### Missing Data / Documents
-

### Complexity Indicators
-

### Workflow Impact
-

### Recommended Next Step
- pricing-scope-classifier / ais-26as-tis-reconciliation / capital-gains-analyzer / senior review
```

## 8. Standard Mapping Logic by Common NRI Cases

### Case Type 1 — Interest-Only / Simple Income
Typical mapping: Other sources (bank interest / FD / NRO interest).
Next step: pricing-scope-classifier or reconciliation if TDS exists.

### Case Type 2 — Rent + Interest
Typical mapping: House property (rent) + Other sources (interest / dividend).
Next step: pricing-scope-classifier and reconciliation.

### Case Type 3 — Property Sale + Interest
Typical mapping: Capital gains (immovable property sale) + Other sources (interest).
Next step: capital-gains-analyzer before final scope lock.

### Case Type 4 — Shares / Mutual Funds / ESOP
Typical mapping: Capital gains (securities / MF / private equity sale) + Salary/employment-linked (ESOP/RSU if relevant).
Next step: capital-gains-analyzer plus advisory review.

### Case Type 5 — Foreign Salary + Indian Passive Income
Typical mapping: Foreign/cross-border relevance (salary abroad) + Other sources/house property/capital gains (Indian items).
Next step: pricing-scope-classifier and DTAA / FTC issue spotting if overlap arises.

### Case Type 6 — India Consulting / Business Receipts
Typical mapping: Business / profession (consulting / freelance / services).
Next step: senior review or detailed advisory review depending on scale and documentation.

## 9. Escalation Triggers
Escalate if:
- An item cannot be reasonably classified from available facts
- Large transactions exist without source documents
- Client description conflicts with available statements / AIS
- Foreign tax credit or treaty relevance may materially affect treatment
- Startup equity or unlisted securities transaction exists with limited paperwork

## 10. Example Output

### Income Map Snapshot
- Relevant year: FY 2024-25
- Preliminary residency context: preliminary non-resident view, still subject to stay verification
- Number of visible income / transaction buckets: 3

### Income Head Mapping
- Salary / employment-linked: no Indian salary currently identified
- House property: one rented apartment in India
- Capital gains: one property sale transaction identified
- Other sources: NRO bank interest
- Business / profession: none currently visible
- Foreign / cross-border relevance: overseas employment income noted for context

### Key Classification Notes
- Property sale requires separate capital-gains review before tax position is finalized.
- Rental income details need rent summary and expense context.
- Overseas salary is contextually relevant but not yet analyzed for final India taxability in this module.

### Likely Review Areas
- Capital gains computation support
- Rental detail verification
- TDS credit mapping
- Possible DTAA / cross-border overlap review

### Missing Data / Documents
- Rent summary
- Sale deed and purchase deed
- Cost / improvement records
- Bank interest statement
- AIS / 26AS

### Complexity Indicators
- Property sale present
- Multiple income categories present
- Cross-border context exists

### Workflow Impact
- This file should not remain in a basic filing lane without capital transaction review.

### Recommended Next Step
- pricing-scope-classifier
