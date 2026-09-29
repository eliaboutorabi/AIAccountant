# A clearer view of cash.

Build a cash-collections forecast you can explain.

Fictional learning project for AI Accountant. Suggested time: 90–150 min. Tools: Excel · Power BI · optional Python.

## Outcome

A forecast workbook, a small dashboard, and a one-page explanation of your assumptions.

## Steps

### 1. Meet the data

Import collections.csv. One row is one month, in USD thousands. Check date parsing, missing months, duplicates, and the total. There are 24 fictional months; 24 rows is very little seasonal evidence.

### 2. Build three honest baselines

In Excel, keep date in column A and collections_usd_thousands in B. For month 19 (row 20), last month is =B19, the prior-three-month average is =AVERAGE(B17:B19), and the prior-year month is =B8. Fill down through row 25. Each formula sees only earlier outcomes.

### 3. Compare errors, then explain

Calculate absolute error with =ABS(actual_cell-forecast_cell), then average the six validation errors. Inspect bias and the size of misses. Comparing methods uses this period for validation; a final untouched future period would be needed after selection.

### 4. Tell the story visually

Build an actual-versus-forecast chart. In Power BI, use a date dimension with unique dates and the monthly fact at its stated grain. State currency and units. Explain what the forecast cannot establish, including uncertainty and causal drivers.

## Definition of done

- [ ] All 24 dates are unique and amounts reconcile to the source
- [ ] Validation forecasts use only earlier observations
- [ ] All three baseline MAEs are independently reproducible
- [ ] The narrative distinguishes a forecast, a scenario, and a budget

## Stretch

Add payment-term and customer drivers only if available at each historical cutoff. Compare rolling windows, discuss uncertainty, and test on a fresh later period.

## Present your work

Show the business question, the data grain, your assumptions, a simple baseline, the checks you ran, one failure you found, and the limits of the result. Include a source-to-output diagram and a short README so another person can reproduce the work.

All data are fictional. These tiny fixtures support learning, not production model training or real financial decisions. No professional qualification is awarded.
