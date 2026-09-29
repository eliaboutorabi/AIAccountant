export const projects = [
	{
		id: 'cash',
		title: 'A clearer view of cash.',
		subtitle: 'Build a cash-collections forecast you can explain.',
		image: 'foundations',
		level: 'Your first project',
		time: '90–150 min',
		tools: 'Excel · Power BI · optional Python',
		chapter: 'machine-learning',
		download: 'cash-forecast-brief.md',
		data: 'collections.csv',
		outcome:
			'A forecast workbook, a small dashboard, and a one-page explanation of your assumptions.',
		steps: [
			{
				title: 'Meet the data',
				body: 'Import collections.csv. One row is one month, in USD thousands. Check date parsing, missing months, duplicates, and the total. There are 24 fictional months; 24 rows is very little seasonal evidence.'
			},
			{
				title: 'Build three honest baselines',
				body: 'In Excel, keep date in column A and collections_usd_thousands in B. For month 19 (row 20), last month is =B19, the prior-three-month average is =AVERAGE(B17:B19), and the prior-year month is =B8. Fill down through row 25. Each formula sees only earlier outcomes.'
			},
			{
				title: 'Compare errors, then explain',
				body: 'Calculate absolute error with =ABS(actual_cell-forecast_cell), then average the six validation errors. Inspect bias and the size of misses. Comparing methods uses this period for validation; a final untouched future period would be needed after selection.'
			},
			{
				title: 'Tell the story visually',
				body: 'Build an actual-versus-forecast chart. In Power BI, use a date dimension with unique dates and the monthly fact at its stated grain. State currency and units. Explain what the forecast cannot establish, including uncertainty and causal drivers.'
			}
		],
		rubric: [
			'All 24 dates are unique and amounts reconcile to the source',
			'Validation forecasts use only earlier observations',
			'All three baseline MAEs are independently reproducible',
			'The narrative distinguishes a forecast, a scenario, and a budget'
		],
		stretch:
			'Add payment-term and customer drivers only if available at each historical cutoff. Compare rolling windows, discuss uncertainty, and test on a fresh later period.'
	},
	{
		id: 'reconcile',
		title: 'The reconciliation detective.',
		subtitle: 'Make every unmatched amount tell a traceable story.',
		image: 'language',
		level: 'Build your analytical muscles',
		time: '2–3 hours',
		tools: 'Excel Power Query · SQL · optional JavaScript',
		chapter: 'applications-agents',
		download: 'reconciliation-brief.md',
		data: 'invoices.csv',
		outcome: 'A reconciled exception table, a control summary, and a repeatable transformation.',
		steps: [
			{
				title: 'Preserve the raw records',
				body: 'Download invoices.csv and payments.csv. An invoice row represents one invoice; a payment row represents a payment record. Keep untouched originals and an ingestion log. Amounts are fictional USD.'
			},
			{
				title: 'Validate before joining',
				body: 'Check invoice keys, payment IDs, currencies, amounts, and dates. The fixture deliberately contains a duplicate payment ID. Quarantine it rather than silently double-counting. Preserve the rejected record and explain your policy.'
			},
			{
				title: 'Match at the right grain',
				body: 'Aggregate accepted payments by invoice ID, supplier, and currency before joining to invoices. Keep unmatched payments and unpaid or partially paid invoices. An absent invoice reference is an exception, not an invitation to invent one.'
			},
			{
				title: 'Reconcile and investigate',
				body: 'Compare your result with expected-controls.json and run the supplied dependency-free reconciliation-starter.mjs using Node.js. Explain the partial payment, missing payments, and unmatched bank record. Classification of the bank record still needs evidence.'
			}
		],
		rubric: [
			'The duplicate payment row is quarantined and reported',
			'Invoice totals are not multiplied by payment joins',
			'Unpaid, partial, and unmatched records are retained',
			'Counts and amounts agree with the expected control fixture'
		],
		stretch:
			'Build a Power BI star schema with separate invoice and payment facts. Add a reviewer status and evidence reference without changing source records.'
	},
	{
		id: 'agent',
		title: 'A helpful agent. A thoughtful system.',
		subtitle: 'Design a controlled exception-investigation assistant.',
		image: 'agents',
		level: 'Your capstone',
		time: '4–6 hours',
		tools: 'Your chosen AI coding tool · TypeScript or Python',
		chapter: 'harnesses',
		download: 'agent-capstone-brief.md',
		data: 'agent-cases.json',
		outcome:
			'A small demonstrable application, an evaluation report, and a clear architecture diagram.',
		steps: [
			{
				title: 'Define the contract',
				body: 'Use the reconciliation data and define three capabilities: read an allowed record, calculate an amount, and prepare a reviewer note. Document schemas, permissions, source references, and error behavior. Keep posting and payment tools out of the prototype.'
			},
			{
				title: 'Build the deterministic core',
				body: 'Implement source validation and exact calculations before adding generation. Keep secrets in a server environment, never in browser code. A local mock model is enough to test orchestration before connecting an approved service.'
			},
			{
				title: 'Add the working environment',
				body: 'Track task IDs, state, evidence, tool results, and a review status. Apply step and cost limits, bounded retries, and a clear escalation state. If you add write operations later, require authorization and idempotency.'
			},
			{
				title: 'Prove the boundaries',
				body: 'Use agent-cases.json to test missing records, unauthorized access, duplicate input, tool failure, and prompt injection. Score evidence, amounts, permissions, and escalation separately. Record what failed and show a reviewer how to reproduce it.'
			}
		],
		rubric: [
			'No unauthorized records or consequential actions are exposed',
			'Every monetary claim is tied to a deterministic calculation and source',
			'Missing evidence and failed tools lead to bounded escalation',
			'A repeatable evaluation covers normal and adversarial cases'
		],
		stretch:
			'Add versioned skills, a persistent review queue, regression evaluations, and simulated recovery after interruption. Explain the control implications of each new capability.'
	}
];
