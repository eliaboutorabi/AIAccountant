<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import NetworkLab from '$lib/components/NetworkLab.svelte';
	import {
		fitPolynomial,
		trainingPoints,
		validationPoints,
		mae,
		classificationMetrics,
		invoiceScores,
		monthlyCollections,
		evaluateForecast,
		forecastBaseline
	} from '$lib/lab-math';
	const labs = [
		{
			id: 'network',
			title: 'A little neural network',
			icon: 'network',
			chapter: 'neural-networks'
		},
		{ id: 'fit', title: 'The Goldilocks fit', icon: 'chart', chapter: 'machine-learning' },
		{ id: 'forecast', title: 'Forecasting studio', icon: 'compass', chapter: 'machine-learning' },
		{ id: 'threshold', title: 'Catch or over-catch?', icon: 'target', chapter: 'machine-learning' },
		{ id: 'prompt', title: 'The prompt workshop', icon: 'sparkles', chapter: 'prompt-engineering' }
	];
	const active = $derived(
		(mounted ? labs.find((l) => l.id === page.url.hash.slice(1)) : undefined) ?? labs[0]
	);
	let degree = $state(2);
	let penalty = $state(0);
	const predict = $derived(fitPolynomial(trainingPoints, degree, penalty));
	const trainError = $derived(mae(trainingPoints, predict));
	const validationError = $derived(mae(validationPoints, predict));
	const curve = $derived(
		Array.from(
			{ length: 101 },
			(_, i) =>
				`${i === 0 ? 'M' : 'L'}${55 + i * 4.9},${265 - Math.max(0, Math.min(70, predict(i / 100))) * 3}`
		).join(' ')
	);
	let method = $state('last');
	const forecastRows = $derived(evaluateForecast(method));
	const forecastError = $derived(
		forecastRows.reduce((s, r) => s + Math.abs(r.actual - r.predicted), 0) / forecastRows.length
	);
	const collectionPath = monthlyCollections
		.map((v, i) => `${i ? 'L' : 'M'}${45 + i * 22},${265 - v * 1.15}`)
		.join(' ');
	const predictionPath = $derived(
		forecastRows
			.map((v, i) => `${i ? 'L' : 'M'}${45 + (i + 18) * 22},${265 - v.predicted * 1.15}`)
			.join(' ')
	);
	let threshold = $state(0.5);
	const metrics = $derived(classificationMetrics(threshold));
	let task = $state('Draft a concise Q2 expense variance commentary for the finance manager.');
	let evidence = $state(
		'Use the approved actual-versus-budget table. Amounts are USD. Include the reporting period and source row for every figure.'
	);
	let constraints = $state(
		'Separate observed differences from unverified causes. Do not invent explanations. Identify missing evidence.'
	);
	let output = $state(
		'A 150-word summary, followed by a table of material variances and questions for the reviewer.'
	);
	let checks = $state(
		'Recalculate totals with a calculation tool. Check signs, units, and period. Flag inconsistencies for human review.'
	);
	const prompt = $derived(
		`TASK\n${task.trim()}\n\nEVIDENCE & CONTEXT\n${evidence.trim()}\n\nBOUNDARIES\n${constraints.trim()}\n\nOUTPUT\n${output.trim()}\n\nACCEPTANCE CHECKS\n${checks.trim()}`
	);
	const fields = $derived(
		[task, evidence, constraints, output, checks].filter((v) => v.trim()).length
	);
	let copyMessage = $state('');
	async function copy() {
		try {
			await navigator.clipboard.writeText(prompt);
			copyMessage = 'Copied. Ready for your approved AI tool.';
		} catch {
			copyMessage = 'Copy isn’t available here. Select the prompt text below to copy it.';
		}
	}
</script>

<svelte:head
	><title>The playground · AI Accountant</title><meta
		name="description"
		content="Explore AI through interactive neural networks, overfitting, forecasting, classification, and prompt design. Friendly hands-on finance examples."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">FOLLOW YOUR “WHAT IF?”</p>
		<h1>Big ideas. A little play.</h1>
		<p>
			Move a slider. Change a choice. Watch the idea take shape. These small experiments turn
			unfamiliar concepts into things you can feel.
		</p>
	</div>
	<nav class="lab-tabs" aria-label="Choose an experiment">
		{#each labs as lab (lab.id)}<a
				id={lab.id}
				class="chip"
				class:selected={active.id === lab.id}
				href={resolve(`/playground/#${lab.id}`)}
				aria-current={active.id === lab.id ? 'page' : undefined}
				><Icon name={lab.icon} size={16} />{lab.title}</a
			>{/each}
	</nav>
	<section class="panel lab-panel">
		<div class="lab-heading">
			<span class="icon-tile lavender"><Icon name={active.icon} size={25} /></span>
			<div>
				<p class="micro-label">AN INTERACTIVE EXPLORATION</p>
				<h2>{active.title}</h2>
			</div>
		</div>
		{#if active.id === 'network'}<p class="lab-intro">
				Two familiar signals go in. A tiny network combines them. Move the sliders and see how the
				connections change the result.
			</p>
			<NetworkLab />
		{:else if active.id === 'fit'}<p class="lab-intro">
				Can a model learn the pattern without memorizing the noise? These fictional customers have a
				prior payment delay and a new outcome. Compare old examples with unseen validation examples.
			</p>
			<div class="lab-controls">
				<label
					>Model flexibility<select class="field" bind:value={degree}
						><option value={0}>Too simple · a constant</option><option value={2}
							>A gentle curve · degree 2</option
						><option value={10}>Very flexible · degree 10</option></select
					></label
				><label for="regularization"
					>Regularization <strong>{penalty.toFixed(2)}</strong><input
						id="regularization"
						type="range"
						min="0"
						max="2"
						step="0.05"
						bind:value={penalty}
					/><small>A penalty on large non-intercept coefficients.</small></label
				>
			</div>
			<div class="chart-wrap">
				<svg
					viewBox="0 0 590 305"
					role="img"
					aria-label={`Polynomial fit. Training mean absolute error ${trainError.toFixed(1)} days; validation error ${validationError.toFixed(1)} days.`}
					><title>Model fit against training and validation examples</title
					>{#each [0, 20, 40, 60] as n (n)}<line
							x1="55"
							x2="550"
							y1={265 - n * 3}
							y2={265 - n * 3}
							stroke="#e1e9d8"
						/><text x="40" y={269 - n * 3} text-anchor="end">{n}</text>{/each}<path
						d={curve}
						fill="none"
						stroke="#487b58"
						stroke-width="3"
					/>{#each trainingPoints as point, i (i)}<circle
							cx={55 + point.x * 490}
							cy={265 - point.y * 3}
							r="5"
							fill="#355e48"
							stroke="#fff"
							stroke-width="1.5"
						/>{/each}{#each validationPoints as point, i (i)}<path
							d={`M${55 + point.x * 490},${260 - point.y * 3} l5,5 -5,5 -5,-5 Z`}
							fill="#e7aa7b"
							stroke="#fff"
							stroke-width="1"
						/>{/each}<text x="300" y="298" text-anchor="middle">Prior average delay →</text><text
						x="57"
						y="20">Next payment delay (days)</text
					></svg
				>
				<div class="chart-legend">
					<span><i class="green-dot"></i>Training examples</span><span
						><i class="orange-dot"></i>Validation examples</span
					><span>Curve: fitted prediction</span>
				</div>
			</div>
			<div class="metric-grid">
				<div>
					<span class="micro-label">TRAINING ERROR</span><strong
						>{trainError.toFixed(1)} <small>days</small></strong
					>
					<p>Average miss on old examples.</p>
				</div>
				<div>
					<span class="micro-label">VALIDATION ERROR</span><strong
						>{validationError.toFixed(1)} <small>days</small></strong
					>
					<p>Average miss on unseen examples.</p>
				</div>
			</div>
			<div class="callout">
				<Icon name="bulb" />
				<div>
					<strong
						>{degree === 0
							? 'Too little flexibility misses the pattern.'
							: validationError > trainError * 1.6
								? 'Notice the gap between practice and new examples.'
								: 'A useful fit follows the pattern, not every dot.'}</strong
					>Try the very flexible model with no regularization, then gently increase the penalty. The
					numbers are computed from a fitted polynomial, not preset scores. This small validation
					set is for exploration; after tuning, a separate test set would be needed. Curves are
					clipped to the plotted 0–70-day range.
				</div>
			</div>
		{:else if active.id === 'forecast'}<p class="lab-intro">
				Forecast fictional monthly cash collections with three simple baselines. Each validation
				forecast uses only the months before it — no peeking into the future.
			</p>
			<label class="field-label" for="forecast-method">Choose your baseline</label><select
				id="forecast-method"
				class="field"
				bind:value={method}
				><option value="last">Last month’s collections</option><option value="average"
					>Average of the last 3 months</option
				><option value="seasonal">Same month last year</option></select
			>
			<div class="chart-wrap">
				<svg
					viewBox="0 0 590 305"
					role="img"
					aria-label={`Collections forecast. Rolling validation mean absolute error ${forecastError.toFixed(1)} thousand dollars.`}
					><title>Monthly collections and rolling forecast comparison</title><rect
						x="430"
						y="38"
						width="130"
						height="232"
						fill="#eee9f6"
						rx="6"
					/><text x="442" y="57">Validation</text>{#each [50, 100, 150, 200] as n (n)}<line
							x1="45"
							x2="560"
							y1={265 - n * 1.15}
							y2={265 - n * 1.15}
							stroke="#e0e7d8"
						/><text x="35" y={269 - n * 1.15} text-anchor="end">{n}</text>{/each}<path
						d={collectionPath}
						fill="none"
						stroke="#3a7151"
						stroke-width="3"
					/><path
						d={predictionPath}
						fill="none"
						stroke="#ca956b"
						stroke-width="3"
						stroke-dasharray="6 4"
					/>{#each forecastRows as r (r.month)}<circle
							cx={45 + r.month * 22}
							cy={265 - r.predicted * 1.15}
							r="4"
							fill="#ca956b"
						/>{/each}<text x="47" y="291">Jan · year 1</text><text x="302" y="291"
						>Jan · year 2</text
					><text x="505" y="291">Dec</text><text x="45" y="20">Collections (USD thousands)</text
					></svg
				>
				<div class="chart-legend">
					<span><i class="green-dot"></i>Actual collections</span><span
						><i class="orange-dot"></i>Rolling predictions</span
					>
				</div>
			</div>
			<div class="metric-grid">
				<div>
					<span class="micro-label">VALIDATION MAE</span><strong
						>${forecastError.toFixed(1)}<small>k</small></strong
					>
					<p>Average absolute miss over the last 6 months.</p>
				</div>
				<div>
					<span class="micro-label">NEXT-MONTH BASELINE</span><strong
						>${forecastBaseline(method, monthlyCollections).toFixed(1)}<small>k</small></strong
					>
					<p>A point estimate, not a certainty or interval.</p>
				</div>
			</div>
			<div class="callout">
				<Icon name="compass" />
				<div>
					<strong>The best baseline depends on the pattern.</strong>This toy data has both trend and
					seasonality. Compare the misses, not the sophistication of the name. Real forecasts need
					more history, driver checks, uncertainty estimates, and a final untouched evaluation
					period. A scenario range is not automatically a statistical prediction interval.
				</div>
			</div>
			<details class="disclosure lab-details">
				<summary>Inspect the validation results<Icon name="down" size={16} /></summary>
				<div class="table-scroll">
					<table>
						<thead
							><tr
								><th>Month</th><th>Actual ($k)</th><th>Forecast ($k)</th><th>Absolute miss ($k)</th
								></tr
							></thead
						><tbody
							>{#each forecastRows as row (row.month)}<tr
									><td>{['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][row.month - 18]} · year 2</td><td
										>{row.actual}</td
									><td>{row.predicted.toFixed(1)}</td><td
										>{Math.abs(row.actual - row.predicted).toFixed(1)}</td
									></tr
								>{/each}</tbody
						>
					</table>
				</div>
			</details>
		{:else if active.id === 'threshold'}<p class="lab-intro">
				A classifier scores invoices for late-payment risk. A threshold decides which ones to flag.
				A lower threshold catches more — and sends more false alarms to the team.
			</p>
			<label class="threshold-label" for="threshold"
				>Flag scores at or above <strong>{Math.round(threshold * 100)}%</strong></label
			><input id="threshold" type="range" min="0" max="1" step="0.05" bind:value={threshold} />
			<div class="invoice-dots">
				{#each invoiceScores as invoice, i (i)}<div
						class:flagged={invoice.score >= threshold}
						class:late={invoice.late}
					>
						<Icon name="file" size={24} /><strong>{Math.round(invoice.score * 100)}%</strong><small
							>{invoice.late ? 'Actually late' : 'On time'}</small
						><span>{invoice.score >= threshold ? 'FLAGGED' : 'NOT FLAGGED'}</span>
					</div>{/each}
			</div>
			<div class="metric-grid three">
				<div>
					<span class="micro-label">PRECISION</span><strong
						>{metrics.precision === null ? '—' : `${Math.round(metrics.precision * 100)}%`}</strong
					>
					<p>
						{metrics.tp} genuinely late / {metrics.flagged} flagged. {metrics.precision === null
							? 'Undefined when nothing is flagged.'
							: ''}
					</p>
				</div>
				<div>
					<span class="micro-label">RECALL</span><strong
						>{Math.round((metrics.recall ?? 0) * 100)}%</strong
					>
					<p>{metrics.tp} caught / {metrics.tp + metrics.fn} actually late.</p>
				</div>
				<div>
					<span class="micro-label">HYPOTHETICAL ERROR COST</span><strong
						>${metrics.fp * 5 + metrics.fn * 75}</strong
					>
					<p>$5 per false alarm + $75 per missed late invoice.</p>
				</div>
			</div>
			<div class="confusion-grid">
				<span><strong>{metrics.tp}</strong> True positives · late and flagged</span><span
					><strong>{metrics.fp}</strong> False positives · on time but flagged</span
				><span><strong>{metrics.fn}</strong> False negatives · late but missed</span><span
					><strong>{metrics.tn}</strong> True negatives · on time, not flagged</span
				>
			</div>
			<div class="callout">
				<Icon name="target" />
				<div>
					<strong>A threshold is a business decision, too.</strong>Our tiny fictional sample and
					made-up costs illustrate the tradeoff. Real thresholds require representative validation,
					reliable probabilities, the costs of errors, and the team’s review capacity. Do not choose
					a threshold on the final test set.
				</div>
			</div>
		{:else}<p class="lab-intro">
				Good prompts look a lot like good work briefs. Shape each ingredient, then take your brief
				to an approved AI tool. This workshop assembles a template locally; it does not call a model
				or evaluate the truth of your prompt.
			</p>
			<div class="prompt-grid">
				<div class="prompt-fields">
					<label>1. The task<textarea class="field" rows="3" bind:value={task}></textarea></label
					><label
						>2. Evidence & context<textarea class="field" rows="3" bind:value={evidence}
						></textarea></label
					><label
						>3. Boundaries<textarea class="field" rows="3" bind:value={constraints}
						></textarea></label
					><label
						>4. Output format<textarea class="field" rows="3" bind:value={output}></textarea></label
					><label
						>5. Acceptance checks<textarea class="field" rows="3" bind:value={checks}
						></textarea></label
					>
				</div>
				<div>
					<div class="prompt-preview">
						<span class="micro-label">YOUR WORK BRIEF · {fields}/5 SECTIONS FILLED</span>
						<pre>{prompt}</pre>
					</div>
					<button class="button primary" onclick={copy}
						><Icon name="file" size={16} />Copy your brief</button
					>
					<p class="copy-status" aria-live="polite">{copyMessage}</p>
				</div>
			</div>
			<div class="callout">
				<Icon name="shield" />
				<div>
					<strong>Clarity creates a better starting point.</strong>Filled sections are a
					completeness check, not a quality score. Replace placeholders with authorized evidence and
					test the output. Never put confidential client data into a tool without your
					organization’s approval.
				</div>
			</div>{/if}
	</section>
	<a class="lab-back text-link" href={resolve(`/learn/${active.chapter}/1/`)}
		>Connect this to the lesson <Icon name="arrow" size={17} /></a
	>
	<p class="lab-footnote">
		Made for understanding. All examples are fictional and all calculations run in your browser.
	</p>
</div>

<style>
	.lab-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 25px;
	}
	.lab-panel {
		max-width: 1000px;
	}
	.lab-heading {
		display: flex;
		align-items: center;
		gap: 15px;
		margin-bottom: 20px;
	}
	.lab-heading h2 {
		font-size: 24px;
		margin-top: 6px;
	}
	.lab-heading .micro-label {
		font-size: 7px;
	}
	.lab-intro {
		font-size: 13px;
		line-height: 1.9;
		color: var(--muted);
		max-width: 800px;
		margin-bottom: 25px;
	}
	.lab-controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 35px;
		align-items: center;
	}
	.lab-controls label {
		font-size: 12px;
	}
	.lab-controls label > select {
		margin-top: 9px;
	}
	.lab-controls label strong {
		float: right;
		color: #516b3e;
	}
	.lab-controls input {
		display: block;
		margin: 20px 0 10px;
	}
	.lab-controls small {
		font-size: 10px;
		color: var(--muted);
	}
	.chart-wrap {
		background: #f8faf5;
		border-radius: 13px;
		margin-top: 25px;
		padding: 15px 12px;
	}
	.chart-wrap svg {
		width: 100%;
		display: block;
		max-height: 370px;
	}
	.chart-wrap text {
		fill: #819273;
		font-size: 10px;
		font-family: 'DM Sans Variable', sans-serif;
	}
	.chart-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		justify-content: center;
		font-size: 9px;
		color: #5a694c;
		margin: 10px 0;
	}
	.chart-legend > span {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.chart-legend i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
	}
	.green-dot {
		background: #355e48;
	}
	.orange-dot {
		background: #e7aa7b;
	}
	.metric-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin: 22px 0;
	}
	.metric-grid > div {
		padding: 22px;
		background: #f0f3e8;
		border-radius: 12px;
	}
	.metric-grid strong {
		font-size: 35px;
		letter-spacing: -1px;
		display: block;
		font-family: 'Manrope Variable', sans-serif;
		margin: 9px 0;
		color: #446e41;
	}
	.metric-grid strong small {
		font-size: 14px;
		letter-spacing: 0;
		font-weight: 400;
	}
	.metric-grid p {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted);
	}
	.metric-grid.three {
		grid-template-columns: repeat(3, 1fr);
	}
	.lab-back {
		margin-top: 24px;
	}
	.lab-footnote {
		font-size: 10px;
		color: #5f6751;
		margin-top: 16px;
	}
	.lab-details {
		margin-top: 20px;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 11px;
		text-align: left;
		margin: 0 0 20px;
	}
	th,
	td {
		padding: 12px;
		border-bottom: 1px solid var(--line);
		white-space: nowrap;
	}
	th {
		font-weight: 600;
		color: #526a43;
		background: #f3f6ee;
	}
	.table-scroll {
		overflow: auto;
	}
	.threshold-label {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		margin-bottom: 16px;
	}
	.threshold-label strong {
		color: #476e3c;
	}
	.invoice-dots {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 10px;
		margin: 25px 0;
	}
	.invoice-dots > div {
		padding: 17px 7px 10px;
		border: 1px solid #e2e7db;
		border-radius: 12px;
		background: #f8f9f4;
		text-align: center;
		color: #5e6751;
	}
	.invoice-dots strong {
		display: block;
		font-size: 16px;
		margin: 8px 0 6px;
	}
	.invoice-dots :global(svg) {
		margin: auto;
	}
	.invoice-dots small {
		display: block;
		font-size: 9px;
	}
	.invoice-dots span {
		display: block;
		margin-top: 10px;
		font-size: 6px;
		font-weight: 700;
		letter-spacing: 0.7px;
	}
	.invoice-dots > div.flagged {
		outline: 2px solid #89a36b;
		background: #ecf3e2;
	}
	.invoice-dots > div.late {
		color: #805c3c;
		background: #fcf0e3;
	}
	.invoice-dots > div.late.flagged {
		background: #f4e5d6;
	}
	.confusion-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-bottom: 25px;
	}
	.confusion-grid > span {
		padding: 16px;
		background: #f6f7ef;
		border-radius: 9px;
		font-size: 11px;
		color: var(--muted);
	}
	.confusion-grid strong {
		font-size: 18px;
		padding-right: 10px;
		color: #4c6d41;
	}
	.prompt-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 27px;
	}
	.prompt-fields label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		margin-bottom: 19px;
	}
	.prompt-fields textarea {
		margin-top: 8px;
		font-size: 11px;
		line-height: 1.8;
		resize: vertical;
	}
	.prompt-preview {
		background: #f1f4eb;
		padding: 23px;
		border-radius: 12px;
		margin-bottom: 16px;
	}
	.prompt-preview pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: 'DM Sans Variable', sans-serif;
		font-size: 11px;
		line-height: 1.9;
		margin: 17px 0 0;
		color: #566a49;
	}
	.copy-status {
		font-size: 11px;
		line-height: 1.8;
		min-height: 40px;
		padding-top: 10px;
		color: #4c6d3d;
	}
	.prompt-grid + .callout {
		margin-top: 15px;
	}
	@media (max-width: 960px) {
		.lab-tabs .chip {
			font-size: 10px;
		}
		.metric-grid.three {
			grid-template-columns: 1fr 1fr;
		}
		.metric-grid.three > div:last-child {
			grid-column: 1/-1;
		}
	}
	@media (max-width: 740px) {
		.lab-controls,
		.prompt-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		.lab-heading h2 {
			font-size: 20px;
		}
		.lab-heading .icon-tile {
			width: 35px;
			height: 35px;
		}
		.lab-intro {
			font-size: 12px;
		}
		.metric-grid > div {
			padding: 17px;
		}
		.metric-grid strong {
			font-size: 29px;
		}
		.metric-grid .micro-label {
			font-size: 6px;
		}
		.invoice-dots {
			grid-template-columns: repeat(3, 1fr);
		}
		.confusion-grid {
			grid-template-columns: 1fr;
		}
		.chart-legend {
			font-size: 7px;
			gap: 12px;
		}
		.chart-wrap {
			padding: 10px 3px;
		}
		.lab-tabs {
			gap: 7px;
		}
		.lab-tabs .chip {
			padding: 8px 10px;
			font-size: 9px;
		}
		.lab-tabs .chip :global(svg) {
			width: 13px;
		}
	}
</style>
