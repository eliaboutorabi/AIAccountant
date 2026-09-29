<script lang="ts">
	import ChartViewport from './ChartViewport.svelte';
	import { onMount } from 'svelte';
	import {
		readFinalExposure,
		markFinalExposure,
		type FinalExposure
	} from '$lib/engines/final-exposure';
	let exposure = $state<FinalExposure | null>(null);
	onMount(() => {
		exposure = readFinalExposure('collections-linear-v1', 'seed-7001');
		revealed = exposure.state === 'recorded';
	});
	function exportEvidence() {
		const blob = new Blob(
			[
				JSON.stringify(
					{
						version: 'collections-linear-v1',
						units: 'USD thousands',
						dataSeeds: { train: 71, validation: 701, final: 7001 },
						params,
						learningRate: rate,
						train,
						validation,
						history,
						final,
						exposure
					},
					null,
					2
				)
			],
			{ type: 'application/json' }
		);
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'willow-regression-evidence.json';
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}

	import {
		regressionData,
		regressionMetrics,
		regressionStep,
		predictCollection,
		regressionFinal,
		type LinearParameters
	} from '$lib/engines/regression';
	import Icon from '$lib/components/Icon.svelte';
	let params = $state<LinearParameters>({ weight: 0, bias: 0, step: 0 });
	let rate = $state(0.2);
	let row = $state(0);
	let update = $state<ReturnType<typeof regressionStep> | null>(null);
	let final = $state<ReturnType<typeof regressionFinal> | null>(null);
	let revealed = $state(false);
	let error = $state('');
	let history = $state<{ step: number; train: number; validation: number }[]>([]);
	const train = $derived(regressionMetrics(params, regressionData.train));
	const validation = $derived(regressionMetrics(params, regressionData.validation));
	const inspected = $derived(regressionData.train[row]);
	const prediction = $derived(predictCollection(params, inspected.receivable));
	const plotMax = $derived(
		Math.max(150, predictCollection(params, 140), predictCollection(params, 40))
	);
	const plotMin = $derived(
		Math.min(0, predictCollection(params, 40), predictCollection(params, 140))
	);
	const plotY = (value: number) => 260 - ((value - plotMin) / (plotMax - plotMin)) * 240;
	const axisLabel = (n: number) => (Math.abs(n) >= 10000 ? n.toExponential(1) : fmt(n, 0));
	function step(count: number) {
		if (final) return;
		error = '';
		const initialStep = params.step;
		try {
			for (let i = 0; i < count; i++) {
				update = regressionStep(params, rate);
				params = update.next;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Training failed';
		} finally {
			// Keep the last successful weights visible even when a later update is rejected.
			if (params.step > initialStep)
				history = [...history, { step: params.step, train: train.mse, validation: validation.mse }];
		}
	}
	function reset() {
		params = { weight: 0, bias: 0, step: 0 };
		update = null;
		history = [];
		final = null;
		error = '';
	}
	const fmt = (n: number, digits = 3) =>
		n.toLocaleString('en-US', { maximumFractionDigits: digits });
</script>

<div class="regression-lab">
	<header>
		<p class="eyebrow">REAL GRADIENT UPDATES · TWO TRAINABLE PARAMETERS</p>
		<h2>Watch a model learn to estimate collections.</h2>
		<p>
			Each synthetic record is a customer’s opening receivable and cash collected in the following
			month. Amounts are USD thousands. Training uses 24 records; 16 independent records provide
			validation. This is a learning-mechanism experiment, not a production cash forecast.
		</p>
	</header>
	<div class="controls">
		<label
			>Learning rate<select bind:value={rate} disabled={!!final}
				><option value={0.01}>0.01 · cautious</option><option value={0.2}>0.2 · moderate</option
				><option value={0.5}>0.5 · larger</option><option value={2}
					>2.0 · investigate instability</option
				></select
			></label
		><button class="button primary" disabled={!!final} onclick={() => step(1)}
			>One update <Icon name="arrow" size={16} /></button
		><button class="button secondary" disabled={!!final} onclick={() => step(25)}
			>Train 25 updates</button
		><button class="button secondary" onclick={reset}><Icon name="reset" size={15} />Reset</button>
	</div>
	{#if error}<p class="error" role="alert">{error}</p>{/if}
	{#if exposure?.state === 'unavailable'}<p class="provenance">
			Exposure storage is unavailable. Keep your exported evidence: this browser cannot tell whether
			you have already used these final cases.
		</p>{/if}
	<button class="button secondary" onclick={exportEvidence}
		><Icon name="download" size={15} />Export experiment evidence</button
	>
	<div class="metrics">
		<div><strong>{params.step}</strong><span>updates</span></div>
		<div>
			<strong>{fmt(params.weight)}</strong><span>slope · collected per receivable dollar</span>
		</div>
		<div><strong>{fmt(params.bias * 100)}</strong><span>intercept · USD thousands</span></div>
		<div><strong>{fmt(validation.mae, 2)}</strong><span>validation MAE · USD thousands</span></div>
	</div>
	<figure>
		<ChartViewport label="Collections regression chart" minimum={520}>
			<svg
				viewBox="0 0 620 300"
				role="img"
				aria-label="Opening receivables against subsequent collections, with the actual learned regression line"
				><rect
					x="50"
					y="15"
					width="545"
					height="245"
					rx="12"
					fill="#f5f7f0"
				/>{#each [0, 1, 2, 3] as t (t)}<line
						x1="50"
						x2="595"
						y1={260 - t * 75}
						y2={260 - t * 75}
						stroke="#dfe7d8"
					/><text x="40" y={264 - t * 75} text-anchor="end"
						>{axisLabel(plotMin + ((plotMax - plotMin) * t * 75) / 240)}</text
					>{/each}<line
					x1="50"
					x2="595"
					y1={plotY(0)}
					y2={plotY(0)}
					stroke="#65705e"
					stroke-dasharray="4 4"
				/>{#each regressionData.train as point (point.id)}<circle
						cx={50 + ((point.receivable - 40) / 100) * 545}
						cy={plotY(point.collected)}
						r="4"
						fill="#37764b"
					/>{/each}{#each regressionData.validation as point (point.id)}<circle
						cx={50 + ((point.receivable - 40) / 100) * 545}
						cy={plotY(point.collected)}
						r="4"
						fill="#8871ad"
					/>{/each}<line
					x1="50"
					x2="595"
					y1={plotY(predictCollection(params, 40))}
					y2={plotY(predictCollection(params, 140))}
					stroke="#c37532"
					stroke-width="3"
				/><text x="50" y="282">40</text><text x="575" y="282">140</text><text
					x="320"
					y="297"
					text-anchor="middle">Opening receivables · USD thousands</text
				></svg
			>
		</ChartViewport>
		<figcaption>
			Green: training customers. Lavender: validation customers. Gold: current prediction. The
			vertical scale expands to include negative predictions; the dashed line marks zero. Extreme
			learning rates can compress the data points as predictions diverge. Vertical axis: collections
			in USD thousands.
		</figcaption>
	</figure>
	<div class="trace">
		<label for="regression-row">Inspect a training record</label><select
			id="regression-row"
			bind:value={row}
			>{#each regressionData.train as item, i (item.id)}<option value={i}
					>{item.id} · receivable {fmt(item.receivable, 1)}</option
				>{/each}</select
		>
		<div class="trace-grid">
			<div><small>Input receivable</small><strong>{fmt(inspected.receivable, 2)}</strong></div>
			<div><small>Predicted collection</small><strong>{fmt(prediction, 2)}</strong></div>
			<div><small>Observed collection</small><strong>{fmt(inspected.collected, 2)}</strong></div>
			<div>
				<small>Residual · prediction − observed</small><strong
					>{fmt(prediction - inspected.collected, 2)}</strong
				>
			</div>
		</div>
		<p>
			The model computes intercept + slope × receivable. Internally inputs and targets are divided
			by 100 for stable optimization. The mean squared loss shown below is converted back to squared
			USD-thousand units.
		</p>
	</div>
	{#if update}<div class="last-update">
			<h3>The last actual parameter update</h3>
			<p>
				Slope: {fmt(update.before.weight, 6)} − {update.rate} × {fmt(update.gradient.weight, 6)} =
				<strong>{fmt(params.weight, 6)}</strong>
			</p>
			<p>
				Normalized intercept: {fmt(update.before.bias, 6)} − {update.rate} × {fmt(
					update.gradient.bias,
					6
				)} = <strong>{fmt(params.bias, 6)}</strong>
			</p>
			<p>
				Gradients are computed from training residuals only. Compare the new training loss ({fmt(
					train.mse,
					2
				)}) and validation loss ({fmt(validation.mse, 2)}); neither a single update nor a lower
				training loss proves generalization.
			</p>
		</div>{/if}
	<details>
		<summary>Training checkpoints & exact record table</summary>
		<!-- Keyboard focus supports horizontal table inspection. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="table-scroll"
			role="region"
			aria-label="Regression checkpoints and record data"
			tabindex="0"
		>
			<table>
				<thead><tr><th>Update</th><th>Training MSE</th><th>Validation MSE</th></tr></thead><tbody
					>{#each history as item, i (i)}<tr
							><td>{item.step}</td><td>{fmt(item.train, 3)}</td><td>{fmt(item.validation, 3)}</td
							></tr
						>{/each}</tbody
				>
			</table>
			<table>
				<thead
					><tr
						><th>Record</th><th>Split</th><th>Receivable</th><th>Observed</th><th>Predicted</th><th
							>Residual</th
						></tr
					></thead
				><tbody
					>{#each [...regressionData.train, ...regressionData.validation] as item (item.id)}<tr
							><td>{item.id}</td><td>{item.id.split('-')[0]}</td><td>{fmt(item.receivable, 2)}</td
							><td>{fmt(item.collected, 2)}</td><td
								>{fmt(predictCollection(params, item.receivable), 2)}</td
							><td>{fmt(predictCollection(params, item.receivable) - item.collected, 2)}</td></tr
						>{/each}</tbody
				>
			</table>
		</div>
	</details>
	<div class="commit">
		<h3>Commit before seeing the final 40 customers.</h3>
		<p>
			Choose the training duration using validation evidence. Final scoring locks this run. If you
			reuse the revealed cases to choose another run, treat them as development evidence.
		</p>
		<button
			class="button primary"
			disabled={!!final}
			onclick={() => {
				final = regressionFinal(params);
				exposure = markFinalExposure('collections-linear-v1', 'seed-7001');
				revealed = true;
			}}>Commit model & reveal final score</button
		>{#if final}<p role="status">
				Final MAE: <strong>{fmt(final.mae, 2)} USD thousands</strong>. Final MSE: {fmt(
					final.mse,
					2
				)}. Training is locked.
			</p>{:else if revealed}<p>
				These final cases have been viewed before in this browser or session. A reset does not make
				them fresh evidence.
			</p>{/if}
	</div>
	<p class="provenance">
		Original synthetic data: receivables range 40–140; expected collections follow 8 +
		0.55×receivable with independent uniform noise of ±4 (USD thousands). Do not extrapolate the
		intercept to a customer with zero receivables. This one-feature model omits payment terms,
		aging, disputes, seasonality, and many real drivers.
	</p>
</div>

<style>
	.regression-lab {
		background: #fff;
		border: 1px solid #dce5d5;
		border-radius: 20px;
		padding: 30px;
	}
	.regression-lab h2 {
		font-size: 28px;
		margin: 12px 0 18px;
		line-height: 1.35;
	}
	.regression-lab header > p:last-child,
	.provenance {
		font-size: 13px;
		line-height: 1.85;
		color: var(--muted);
	}
	.controls {
		display: flex;
		align-items: end;
		gap: 12px;
		flex-wrap: wrap;
		margin: 25px 0;
	}
	.controls label,
	.trace > label {
		font-size: 12px;
		font-weight: 700;
		display: grid;
		gap: 8px;
	}
	select {
		border: 1px solid #d8e1d2;
		border-radius: 8px;
		background: #fff;
		padding: 11px;
		font-size: 12px;
	}
	.metrics {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}
	.metrics > div {
		background: #eff4e9;
		border-radius: 12px;
		padding: 19px;
	}
	.metrics strong {
		display: block;
		font-size: 24px;
	}
	.metrics span {
		display: block;
		font-size: 10px;
		line-height: 1.6;
		margin-top: 7px;
		color: var(--muted);
	}
	figure {
		margin: 25px 0;
	}
	svg {
		width: 100%;
		max-height: 420px;
	}
	svg text {
		font-size: 16px;
		fill: #5d7055;
	}
	figcaption {
		font-size: 11px;
		line-height: 1.7;
		color: var(--muted);
	}
	.trace,
	.last-update,
	.commit {
		padding: 25px;
		background: #f3f1f9;
		border-radius: 14px;
		margin: 22px 0;
	}
	.trace > select {
		margin-top: 10px;
	}
	.trace-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 15px;
		margin: 22px 0;
	}
	.trace-grid small {
		display: block;
		font-size: 10px;
		line-height: 1.6;
	}
	.trace-grid strong {
		display: block;
		margin-top: 8px;
		font-size: 17px;
	}
	.trace p,
	.last-update p,
	.commit p {
		font-size: 13px;
		line-height: 1.85;
		margin: 12px 0;
	}
	.last-update {
		background: #eff4e9;
	}
	.last-update h3,
	.commit h3 {
		font-size: 17px;
	}
	.table-scroll {
		overflow: auto;
	}
	table {
		border-collapse: collapse;
		font-size: 12px;
		width: 100%;
		margin: 16px 0;
	}
	th,
	td {
		text-align: right;
		border-bottom: 1px solid var(--line);
		padding: 10px;
	}
	th:first-child,
	td:first-child {
		text-align: left;
	}
	details {
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 18px;
		margin: 20px 0;
	}
	summary {
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	.commit {
		background: #fbf0df;
	}
	.commit .button {
		margin: 10px 0;
	}
	.error {
		background: #fff0dd;
		padding: 16px;
		border-radius: 10px;
		font-size: 13px;
	}
	.provenance {
		font-size: 11px;
	}
	@media (max-width: 600px) {
		.regression-lab {
			padding: 22px;
		}
		.metrics,
		.trace-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.trace,
		.last-update,
		.commit {
			padding: 20px;
		}
		.controls .button {
			font-size: 12px;
		}
	}
</style>
