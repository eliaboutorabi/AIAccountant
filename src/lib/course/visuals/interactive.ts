import type { TeachingVisual } from './types';
export const interactiveVisuals: TeachingVisual[] = [
	{
		id: 'M03-interactive-update',
		module: 'M03',
		section: 'one-update',
		afterBlock: 0,
		kind: 'interactive',
		interaction: 'training',
		title: 'A learning update you can see',
		lead: 'Move a prediction line using the errors in 24 synthetic training rows. The validation rows never push the line.',
		alt: 'A scatterplot of receivables and collections with a trainable line, gradient values and independent validation error.',
		takeaway:
			'Training changes parameters. Validation measures how those parameters behave on separate examples.',
		question: 'If validation error improves, did validation rows train the model?',
		answer:
			'No. Every gradient here uses the 24 training rows only. Validation error is measured after the update; using it to choose settings still makes it development evidence, not a final test.',
		sourceNote:
			'Actual full-batch gradient descent using the course regression engine. Synthetic amounts in USD thousands; no real customer records.'
	},
	{
		id: 'M05-interactive-threshold',
		module: 'M05',
		section: 'threshold',
		afterBlock: 0,
		kind: 'interactive',
		interaction: 'threshold',
		title: 'One score, several possible decisions',
		lead: 'Move the review threshold. Watch which exceptions are missed and which ordinary items take up review time.',
		alt: 'Ten scored cases move between review and pass decisions as the threshold changes, with a confusion matrix and error cost.',
		takeaway:
			'The threshold is an operating choice. Changing it changes decisions without retraining the scoring model.',
		question: 'Does reviewing every case give perfect precision?',
		answer:
			'No. Reviewing all ten finds all four exceptions (100% recall), but six ordinary items also enter review. Precision is 4 ÷ 10 = 40%.',
		sourceNote:
			'Ten authored synthetic scores and outcomes; scores are not a fitted or calibrated probability model. Costs are illustrative: USD 10 per false alert and USD 100 per missed exception.'
	},
	{
		id: 'M08-interactive-origin',
		module: 'M08',
		section: 'rolling-origins',
		afterBlock: 0,
		kind: 'interactive',
		interaction: 'forecast',
		title: 'Stand at the forecast origin',
		lead: 'Choose a month, then make a one-month-ahead forecast using only what was known by that date.',
		alt: 'A time-series chart separates historical collections from the following month and compares real forecast methods.',
		takeaway:
			'A forecast must be built from the history available at its origin. A good-looking fit to future data is not a forecast.',
		question: 'May the next month help fit the line before we score it?',
		answer:
			'No. That would leak the answer into the prediction. Each method here receives only the prefix through the selected origin; the next observation is used only to measure the error.',
		sourceNote:
			'Seeded synthetic monthly cash collections in USD thousands. Actual last-value, seasonal-naive and moving-average calculations; this compact example is exploratory, not a reserved final test.'
	},
	{
		id: 'M09-interactive-join',
		module: 'M09',
		section: 'join-explosion',
		afterBlock: 0,
		kind: 'interactive',
		interaction: 'join',
		title: 'Watch a join multiply money',
		lead: 'Two invoices. Three payments. Change the join grain and follow the rows before trusting the total.',
		alt: 'Invoice and payment tables feed a joined table. Switching between customer, invoice and aggregated invoice joins changes repeated amounts.',
		takeaway:
			'A correct key is necessary, but the grain still matters. Aggregate payments to invoice grain before adding invoice-level amounts.',
		question: 'Does joining on invoice ID alone make invoice totals safe to sum?',
		answer:
			'No. INV-01 has two payments, so its USD 100 invoice amount appears twice even with the correct invoice key. Aggregate the payments to one row per invoice before joining for an invoice-grain total.',
		sourceNote:
			'Exact joins over five invented records. Amounts are USD. The example demonstrates row multiplicity, not a complete receivables reconciliation.'
	},
	{
		id: 'M11-interactive-token-ids',
		module: 'M11',
		section: 'tokens',
		afterBlock: 0,
		kind: 'interactive',
		interaction: 'tokenizer',
		title: 'From text, to token IDs, to vectors',
		lead: 'Edit the sentence. Click a token to trace its real vocabulary ID into an explicitly illustrative embedding lookup.',
		alt: 'Colored actual o200k_base token pieces show integer IDs. Selecting one illustrates lookup of a vector rather than using the numeric ID as a meaning score.',
		takeaway:
			'The tokenizer chooses IDs. A model then looks up learned vectors for those IDs. An ID’s magnitude is not its meaning.',
		question: 'If one token ID is twice another, is its meaning twice as large?',
		answer:
			'No. IDs are vocabulary addresses. They are not numerical measurements of meaning. The model’s learned embedding table supplies the vector; the vector shown here is a teaching illustration, not a recovered production-model embedding.',
		sourceNote:
			'Actual local o200k_base encoding from gpt-tokenizer. Embedding vectors below are labeled illustrations. No model inference, chat overhead, or price estimate.'
	},
	{
		id: 'M12-interactive-mixture',
		module: 'M12',
		section: 'qkv',
		afterBlock: 0,
		kind: 'interactive',
		interaction: 'attention',
		title: 'Attention is a weighted mixture',
		lead: 'Choose the query position. Its query meets the available keys; normalized weights mix the value vectors.',
		alt: 'An exact causal attention row shows Q and K compatibility, zero future weights, V contributions and their summed output.',
		takeaway:
			'Q and K determine weights; V supplies what is mixed. Future positions have exactly zero weight under this causal mask.',
		question: 'At “invoice”, can the output use the value of “overdue”?',
		answer:
			'No. “Overdue” lies to the right. The causal mask excludes it before softmax, so its weight and contribution are exactly zero. The visible output is only the mixture of “The” and “invoice”.',
		sourceNote:
			'Exact scaled dot-product attention with two-dimensional, hand-authored Q/K/V vectors and one head. These are illustrative vectors, not a trained language model or an explanation of its reasoning.'
	},
	{
		id: 'M18-interactive-agent-gates',
		module: 'M18',
		section: 'loop',
		afterBlock: 0,
		kind: 'interactive',
		interaction: 'agents',
		title: 'A loop with real permission gates',
		lead: 'Step through a tiny invoice workflow. The tool result updates state; a proposed write waits for your approval.',
		alt: 'A finite-state workflow reads an invoice, calculates an amount, drafts a posting, waits for approval, and records a local result. An unsafe proposal is blocked.',
		takeaway:
			'A proposed action is not permission. The harness checks scope and approval before a tool can change state.',
		question: 'Does an invoice telling the agent to upload data grant upload permission?',
		answer:
			'No. An invoice is untrusted task data. The injected instruction may influence a model’s proposal, so the harness still needs an independent allowlist and approval checks. This demonstration blocks the out-of-scope action.',
		sourceNote:
			'A real local finite-state demonstration with exact integer-cent arithmetic and enforced gates. Planner choices are authored illustrations; no LLM, external upload, bank action or production ledger is connected.'
	}
];
