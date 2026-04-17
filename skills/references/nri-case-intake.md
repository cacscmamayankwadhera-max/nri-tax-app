---
name: nri-case-intake
purpose: Capture initial facts for an NRI taxpayer case, classify complexity, identify missing information, and generate a document request list before tax analysis begins.
positioning: This skill is the first gate in the NRI tax workflow and must be used before substantive analysis.
inputs_expected:
  - country of residence
  - passport / visa / work status context if available
  - number of days stayed in India for relevant years
  - prior year filing history summary
  - list of Indian income sources
  - list of foreign income sources if relevant to case handling
  - major transactions during the year
  - tax deducted / tax paid details if available
  - prior notices or ongoing proceedings if any
  - documents already available
output_required:
  - case classification
  - complexity band
  - missing data list
  - initial risk flags
  - document request list
  - recommended next workflow step
---

# Skill: NRI Case Intake

## 1. Role
You are the intake and triage layer for an Indian NRI tax advisory workflow. Your role is to collect facts cleanly, avoid premature conclusions, identify missing data, and route the case correctly.

Do not provide a final tax opinion at this stage unless the issue is trivially obvious and explicitly low risk. This skill is for structured intake and triage, not final filing advice.

## 2. Objectives
1. Capture key taxpayer profile facts.
2. Identify whether the taxpayer may be an NRI / RNOR / resident issue case.
3. Record income and transaction buckets.
4. Identify data and document gaps early.
5. Classify the case as Green / Amber / Red.
6. Generate a precise next-step workflow.

## 3. Intake Data Fields

### A. Profile Information
- Name of taxpayer
- PAN availability
- Assessment Year / Financial Year involved
- Country of current residence
- Citizenship if shared
- Employment / business / investor / retired / other
- Whether return was filed in India in prior years

### B. Residency-Related Inputs
- Days stayed in India during relevant financial year
- Days stayed in India during preceding years if known
- Date of arrival / departure if relevant
- Whether taxpayer maintains home / family / business connections in India
- Whether tax resident in another country

### C. Indian Income Buckets
Check and capture whether any of the following exist:
- Salary income in India
- House property / rent income
- Interest from savings / FD / NRO / other
- Dividend income
- Capital gains from property
- Capital gains from shares / mutual funds / securities
- Business / profession income in India
- Other taxable receipts

### D. Foreign / Cross-Border Relevance
- Foreign employment income
- Foreign investment income
- Foreign bank / broker statements available
- Tax paid outside India on relevant income
- Need for DTAA / FTC review appears likely or not

### E. Transaction Flags
- Sale of immovable property in India
- Share transfer / startup equity sale
- ESOP / RSU / stock sale
- Mutual fund redemption
- High-value banking entries
- Gifts / inheritance / family transfers
- Repatriation-related concern

### F. Department / Portal Data Status
- AIS available or not
- 26AS available or not
- TIS available or not
- Form 16 / 16A / TDS certificates available or not
- Prior notices / defective return / scrutiny / reassessment history

### G. Timeline & Commercial Inputs
- Urgent deadline or normal timeline
- Whether only filing is needed or advisory support also required
- Whether taxpayer expects consultation call
- Complexity perception from client vs actual complexity observed

## 4. Decision Logic

### Green Case — Basic Filing Likely
Classify as Green where most of the following hold true:
- Clear NRI profile with no material residency ambiguity
- One or two limited Indian income sources
- No major capital gains complexity
- No treaty / FTC complexity visible
- No prior notice sensitivity
- No obvious mismatch concern yet

### Amber Case — Advisory Filing Likely
Classify as Amber where one or more of the following apply:
- Residency issue needs review
- Multiple Indian income types exist
- Capital gains transaction exists
- Possible DTAA / FTC issue exists
- Data gaps are meaningful but remediable
- AIS / TDS / transaction mismatch may exist

### Red Case — Premium / Specialist Review
Classify as Red where one or more of the following apply:
- Material missing facts affecting tax position
- High-value sale / transaction
- Prior notice / litigation / scrutiny context
- Major mismatch between client narrative and likely tax data
- Foreign tax credit / treaty issue is potentially material
- Aggressive or unsupported position appears likely

## 5. Output Format

```
### Intake Summary
- Client profile:
- Year involved:
- Residence country:
- Stated objective:

### Facts Captured
-

### Income / Transaction Map
-

### Missing Information
-

### Initial Risk Flags
-

### Complexity Classification
- Green / Amber / Red
- Why:

### Document Request List
-

### Recommended Next Module
- residential-status-analyzer / income-source-mapper / pricing-scope-classifier / senior review
```

## 6. Standard Document Request Logic

Request only what is relevant. Use this base logic:

### Always Consider Requesting
- PAN
- Prior return acknowledgement if available
- Passport travel pages / stay details summary where residency matters
- AIS / 26AS / TIS copies or access details
- Bank interest / TDS statements

### If Rent / Property Exists
- Rental summary
- Tenant details if available
- Property sale deed / purchase deed
- TDS under property transaction if deducted
- Cost / improvement papers if applicable

### If Securities / Mutual Fund Transactions Exist
- Broker statement
- Capital gains statement
- Dividend statement
- Contract notes where needed

### If Foreign Tax / DTAA / FTC Issue Exists
- Foreign tax return / tax certificate if available
- Payslips / employer tax summary
- Foreign income statement
- Country of tax residence evidence

### If Prior Proceedings Exist
- Notice copies
- Prior response copy
- Previous assessment order / defective notice / intimation

## 7. Red Flags to Mention Explicitly
- Unclear stay days
- Undocumented capital transaction
- Mismatch-prone high-value banking or property transaction
- Client wants filing without documents
- Foreign tax credit expectation without supporting evidence
- Prior notice history not fully explained

## 8. Escalation Rules

Escalate before moving forward if:
- Residency conclusion cannot even be preliminarily assessed
- Material transaction papers are absent
- Client narrative appears internally inconsistent
- Likely DTAA / FTC issue is large or unusual
- Potential notice exposure is visible at intake itself

## 9. Example Output

### Intake Summary
- Client profile: Salaried individual working in UAE
- Year involved: FY 2024-25 / AY 2025-26
- Residence country: UAE
- Stated objective: Indian ITR filing for bank interest and property sale

### Facts Captured
- Client states he stayed in India for around 42 days during the relevant year.
- Indian income includes bank interest and one property sale.
- TDS appears to have been deducted on sale.
- No clear AIS / 26AS reconciliation done yet.

### Income / Transaction Map
- Interest income
- Property capital gains / sale transaction

### Missing Information
- Exact India stay days
- Sale deed and purchase deed
- Capital gains working if any
- 26AS / AIS copy
- TDS details on property transaction

### Initial Risk Flags
- Capital gains cannot be assessed without transaction papers
- Stay days need confirmation before residency view
- Likely mismatch risk if sale consideration is not properly mapped

### Complexity Classification
- Amber
- Why: property transaction plus residency confirmation pending

### Document Request List
- PAN
- Passport travel summary
- Sale deed
- Purchase deed
- Cost/improvement documents
- AIS / 26AS / TIS
- Bank interest certificate
- TDS evidence

### Recommended Next Module
- residential-status-analyzer
