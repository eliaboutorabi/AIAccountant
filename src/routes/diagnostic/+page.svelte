<script lang="ts">
	import { resolve } from '$app/paths';
	import Notebook from '$lib/course/components/Notebook.svelte';
	let phase = $state<'start' | 'return'>('start');
	const cases = {
		start: [
			{
				title: 'A report that does not reconcile',
				evidence:
					'Invoice A: USD 100. Invoice B: USD 200. A has two payments: USD 30 and USD 20. B has one payment: USD 50. A join produces A/100/30, A/100/20, B/200/50.',
				question:
					'What are the true invoice total, payment total, and outstanding balance? What would summing the joined invoice column do, and how would you repair it?',
				answer:
					'Invoices total 300; payments total 100; outstanding is 200. Summing the joined header gives 400 because A is repeated. Aggregate payments to one row per invoice before joining, then reconcile source totals and invoice-level balances. Changing a chart cannot fix duplicated records.',
				module: 'M09',
				rubric:
					'Explain the row grain, calculate 300/100/200, and name a transformation plus an independent check.'
			},
			{
				title: 'A model that seems exceptional',
				evidence:
					'Predict late payment when an invoice is issued. Inputs: payment terms, customer history as of issue, actual settlement date. Training accuracy 99%; a random row split gives 98%.',
				question:
					'Which input is a problem? Does a high score resolve it? Describe a better test and a baseline.',
				answer:
					'Actual settlement date is future information that reveals the outcome. Remove it and construct other features only from information known at issue. Evaluate on an appropriate later period, with customer overlap handled for the deployment question. Compare with a simple policy or majority baseline and review confusion counts and consequences; accuracy alone may obscure rare late payments.',
				module: 'M02',
				rubric:
					'Identify availability at the decision date, explain why the score is misleading, and propose a realistic validation design.'
			},
			{
				title: 'A fluent explanation',
				evidence:
					'Budget revenue 1,000; COGS 600. Actual revenue 1,200; COGS 780. Units: USD thousands. Draft: “Profit fell because freight rose. Margin fell by 5%.” No freight record was supplied.',
				question:
					'Correct the amounts and distinguish arithmetic, an unsupported cause, and missing information.',
				answer:
					'Gross profit rises from 400 to 420, or 5%. Gross margin falls from 40% to 35%: five percentage points, a 12.5% relative fall. Freight is not supported by the provided totals. Request the breakdown and operational evidence; a plausible sentence is not a verified explanation.',
				module: 'M14',
				rubric:
					'Compute profit and margin separately, use percentage points correctly, and identify the missing causal evidence.'
			},
			{
				title: 'A tool timeout',
				evidence:
					'A model requests create_review_item with key REV-7. The server creates item Q41 but its response is lost. The model says “failed” and proposes a new request with key REV-8.',
				question:
					'What do you know and not know? How should the system recover, and is an instruction to be careful enough?',
				answer:
					'A missing response does not prove the operation failed. Inspect operation state and retry under the original stable key if the tool enforces idempotency. A new key can create a duplicate. The application must enforce permissions, state checks, and bounded retries; a model instruction alone is not a guarantee.',
				module: 'M19',
				rubric:
					'Separate observed response from resulting state and explain a concrete idempotency/recovery mechanism.'
			}
		],
		return: [
			{
				title: 'A changed reporting problem',
				evidence:
					'Order X: USD 180, with three detail lines. Order Y: USD 120, with one line. X has two payment allocations of USD 40 and USD 50; Y has USD 120. The report joins headers, lines, and allocations directly.',
				question:
					'Calculate true outstanding and the joined row count. Explain why a familiar aggregate-before-join fix must consider both child tables.',
				answer:
					'Invoices total 300 and payments total 210; outstanding is 90. X creates 3 × 2 = 6 rows and Y creates 1, for seven joined rows. Aggregate each relevant child table to the order grain separately before joining; otherwise line or payment values still multiply. Reconcile record-level and total controls.',
				module: 'M09',
				rubric:
					'Compute 90 outstanding and seven joined rows; explain both one-to-many relationships rather than applying a memorized SUM.'
			},
			{
				title: 'A changed decision constraint',
				evidence:
					'A 200-case sample has 20 true exceptions. A model flags 30, of which 15 are exceptions. Each review costs USD 10; each missed exception has assumed expected cost USD 200. The team can review only 20.',
				question:
					'Calculate precision, recall, and modeled cost for the 30-review policy. What additional evidence do you need before recommending a 20-review policy?',
				answer:
					'Precision is 15/30 = 50%; recall is 15/20 = 75%. Cost is 30 × 10 + 5 × 200 = 1,300, assuming review finds/remedies each true flagged issue. Capacity is exceeded. Reevaluate the top 20 or a changed threshold using actual ranked cases and consequences; do not assume removing ten reviews preserves recall. Validate the chosen policy on fresh appropriate cases.',
				module: 'M05',
				rubric:
					'Compute the metrics, state the loss assumptions, and respond to capacity using actual evidence rather than scaling averages.'
			},
			{
				title: 'A changed evidence problem',
				evidence:
					'April policy: expense cap USD 200, effective April 1. July policy: cap USD 250, effective July 1. Expense date June 20, amount USD 230. A retrieved July excerpt is cited in an answer approving it.',
				question:
					'Is a citation enough? Separate retrieval, calculation, and authorization. Explain what lower temperature would change.',
				answer:
					'The June expense needs the policy applicable then: the April cap of 200. The amount exceeds that cap by 30 under this fixture. Retrieval returned the wrong effective version; citation presence does not repair applicability. Approval authority remains a separate system rule. Lower temperature alters sampling behavior and cannot supply the missing correct evidence or permission.',
				module: 'M16',
				rubric:
					'Use the event date, verify source support, distinguish the exact comparison from authority, and explain decoding limits.'
			},
			{
				title: 'A changed system failure',
				evidence:
					'A pipeline passes 8 of 10 frozen cases. You inspect the two failures, edit the prompt and retry logic, then pass all ten. One rerun includes a duplicated review item, although its final explanation is accurate.',
				question:
					'Describe the evidence honestly. What should fail, what becomes a regression case, and what should the next assessment contain?',
				answer:
					'The original 8/10 is the preserved result for the frozen procedure. The revised 10/10 cannot be an independent final estimate because those cases guided repair; the duplicated item should fail a state-based control despite accurate prose. Preserve both versions and traces, add regression checks, freeze the repair, and evaluate fresh cases including lost responses and duplicates.',
				module: 'M22',
				rubric:
					'Preserve the original evidence, grade actual state, and distinguish successful repair from independent generalization.'
			}
		]
	};
</script>

<svelte:head
	><title>Starting point & return assessment · AI Accountant</title><meta
		name="description"
		content="Four substantive cases locate your starting point; changed cases revisit your reasoning after the foundation course."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">BEFORE AND AFTER THE COURSE</p>
		<h1>Find your starting point.</h1>
		<p>
			Allow about 15–20 minutes. Explain your reasoning before opening the debrief. “I’m not sure
			yet” is useful evidence: name the missing concept or information. This diagnostic is optional
			and sits outside the 30-hour core budget.
		</p>
	</div>
	<div class="chip-row">
		<button class="chip" class:selected={phase === 'start'} onclick={() => (phase = 'start')}
			>Before the course</button
		><button class="chip" class:selected={phase === 'return'} onclick={() => (phase = 'return')}
			>Return after day five</button
		>
	</div>
	<p class="context">
		{phase === 'start'
			? 'Save a first explanation you can revisit. These questions locate gaps; they do not restrict access to any lesson.'
			: 'Use these changed cases before rereading the original solutions. A better explanation on a new problem is more informative than remembering a familiar answer.'}
	</p>
	{#each cases[phase] as item, i (`${phase}-${i}`)}<section class="diagnostic-case panel">
			<p class="micro-label">
				CASE {i + 1} · {phase === 'start' ? 'STARTING POINT' : 'CHANGED CONDITIONS'}
			</p>
			<h2>{item.title}</h2>
			<div class="exhibit">
				<strong>Evidence provided</strong>
				<p>{item.evidence}</p>
			</div>
			<p>{item.question}</p>
			<Notebook
				moduleId={phase === 'start' ? 'M01' : 'M25'}
				field={`diagnostic-${phase}-${i}`}
				label="Your explanation before the debrief"
				hint="Include calculations, assumptions, and what you would check next."
			/>
			<details class="disclosure">
				<summary>Compare your reasoning with the debrief</summary>
				<p>{item.answer}</p>
				<p><strong>Self-assessment:</strong> {item.rubric}</p>
				<a class="text-link" href={resolve('/course/[slug]', { slug: item.module.toLowerCase() })}
					>Study this concept · {item.module} →</a
				>
			</details>
		</section>{/each}
	<a class="button primary" href={resolve('/path/')}>Continue to the complete path →</a>
</div>

<style>
	.context {
		line-height: 1.8;
		color: var(--muted);
		margin: 20px 0;
	}
	.diagnostic-case {
		margin: 24px 0;
		padding: 30px;
	}
	.diagnostic-case h2 {
		font-size: 26px;
		margin: 14px 0;
	}
	.diagnostic-case p {
		line-height: 1.9;
		margin: 12px 0;
	}
	.exhibit {
		padding: 20px;
		background: #f2f4e9;
		border-radius: 14px;
		margin: 24px 0;
	}
	.diagnostic-case .text-link {
		display: inline-block;
		margin-top: 16px;
	}
	@media (max-width: 600px) {
		.diagnostic-case {
			padding: 20px;
		}
	}
</style>
