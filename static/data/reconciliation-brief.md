# The reconciliation detective.

Make every unmatched amount tell a traceable story.

Fictional learning project for AI Accountant. Suggested time: 2–3 hours. Tools: Excel Power Query · SQL · optional JavaScript.

## Outcome

A reconciled exception table, a control summary, and a repeatable transformation.

## Steps

### 1. Preserve the raw records

Download invoices.csv and payments.csv. An invoice row represents one invoice; a payment row represents a payment record. Keep untouched originals and an ingestion log. Amounts are fictional USD.

### 2. Validate before joining

Check invoice keys, payment IDs, currencies, amounts, and dates. The fixture deliberately contains a duplicate payment ID. Quarantine it rather than silently double-counting. Preserve the rejected record and explain your policy.

### 3. Match at the right grain

Aggregate accepted payments by invoice ID, supplier, and currency before joining to invoices. Keep unmatched payments and unpaid or partially paid invoices. An absent invoice reference is an exception, not an invitation to invent one.

### 4. Reconcile and investigate

Compare your result with expected-controls.json and run the supplied dependency-free reconciliation-starter.mjs using Node.js. Explain the partial payment, missing payments, and unmatched bank record. Classification of the bank record still needs evidence.

## Definition of done

- [ ] The duplicate payment row is quarantined and reported
- [ ] Invoice totals are not multiplied by payment joins
- [ ] Unpaid, partial, and unmatched records are retained
- [ ] Counts and amounts agree with the expected control fixture

## Stretch

Build a Power BI star schema with separate invoice and payment facts. Add a reviewer status and evidence reference without changing source records.

## Present your work

Show the business question, the data grain, your assumptions, a simple baseline, the checks you ran, one failure you found, and the limits of the result. Include a source-to-output diagram and a short README so another person can reproduce the work.

All data are fictional. These tiny fixtures support learning, not production model training or real financial decisions. No professional qualification is awarded.
