<script lang="ts">
	import { onMount } from 'svelte';
	import {
		readFinalExposure,
		markFinalExposure,
		type FinalExposure
	} from '$lib/engines/final-exposure';
	import Icon from '$lib/components/Icon.svelte';
	import { FinanceMLP, INVOICE_DATA_PROVENANCE, type InvoicePoint } from '$lib/engines/finance-mlp';
	import type { createTrainedNetworkScene } from '$lib/engines/trained-network-scene';
	const id = $props.id();
	type History = { step: number; train: number; validation: number };
	let model: FinanceMLP | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let runId = 0;
	let scene: ReturnType<typeof createTrainedNetworkScene> | undefined;
	let hiddenSize = $state(6);
	let learningRate = $state(0.025);
	let regularization = $state(0.001);
	let trainCount = $state(96);
	let seed = $state(42);
	let threshold = $state(0.5);
	let reviewCost = $state(5);
	let missCost = $state(100);
	let capacity = $state(20);
	const validCosts = $derived(
		Number.isFinite(reviewCost) &&
			reviewCost >= 0 &&
			Number.isFinite(missCost) &&
			missCost >= 0 &&
			Number.isInteger(capacity) &&
			capacity >= 0
	);
	let overdue = $state(54);
	let mismatch = $state(5);
	let rotation = $state(0);
	let motion = $state(false);
	let running = $state(false);
	let status = $state('Preparing a fresh, untrained model…');
	let error = $state('');
	let viewSplit = $state<'train' | 'validation'>('train');
	let sceneStatus = $state('Loading the 3D view…');
	let metrics = $state.raw<ReturnType<FinanceMLP['metrics']> | null>(null);
	let trace = $state.raw<ReturnType<FinanceMLP['inspect']> | null>(null);
	let activeConfig = $state.raw<FinanceMLP['config'] | null>(null);
	let final = $state.raw<ReturnType<FinanceMLP['commitFinal']> | null>(null);
	let history = $state.raw<History[]>([]);
	let points = $state.raw<{ train: InvoicePoint[]; validation: InvoicePoint[] }>({
		train: [],
		validation: []
	});
	let surface = $state.raw<{ x: number; y: number; score: number }[]>([]);
	let scoredPoints = $state.raw<
		{ id: string; days: number; mismatch: number; label: number; score: number; split: string }[]
	>([]);
	let priorFinal = $state(false);
	let exposure = $state.raw<FinalExposure | null>(null);
	let exposureBeforeReveal = $state.raw<FinalExposure | null>(null);
	const pending = $derived(
		activeConfig &&
			(activeConfig.hiddenSize !== hiddenSize ||
				activeConfig.learningRate !== learningRate ||
				activeConfig.regularization !== regularization ||
				activeConfig.trainCount !== trainCount ||
				activeConfig.seed !== seed)
	);
	const chartMax = $derived(
		Math.max(0.8, ...history.flatMap((p) => [p.train, p.validation])) * 1.1
	);
	const lastStep = $derived(Math.max(20, metrics?.step ?? 0));
	const fmt = (value: number | null) =>
		value === null ? 'Undefined' : `${(value * 100).toFixed(1)}%`;
	function lossPath(key: 'train' | 'validation') {
		return history
			.map(
				(point, i) =>
					`${i ? 'L' : 'M'}${48 + (point.step / lastStep) * 540},${186 - (point[key] / chartMax) * 158}`
			)
			.join(' ');
	}
	function syncScene() {
		if (trace) scene?.update(trace, rotation, motion);
	}
	function inspect() {
		if (!model) return;
		trace = model.inspect([overdue / 90, mismatch / 25]);
		syncScene();
	}
	function refresh(addHistory = true) {
		if (!model) return;
		metrics = model.metrics(threshold);
		if (addHistory)
			history = [
				...history,
				{ step: metrics.step, train: metrics.train.loss, validation: metrics.validation.loss }
			];
		surface = Array.from({ length: 24 * 24 }, (_, i) => ({
			x: i % 24,
			y: Math.floor(i / 24),
			score: model!.predict([((i % 24) + 0.5) / 24, (Math.floor(i / 24) + 0.5) / 24])
		}));
		scoredPoints = [...points.train, ...points.validation].map((point) => ({
			id: point.id,
			days: point.inputs[0] * 90,
			mismatch: point.inputs[1] * 25,
			label: point.label,
			score: model!.predict(point.inputs),
			split: point.split
		}));
		inspect();
	}
	function pause(announce = true) {
		runId++;
		clearTimeout(timer);
		running = false;
		if (announce && model) status = `Paused at update ${model.step}. Parameters are retained.`;
	}
	function reset() {
		pause(false);
		try {
			if (final) priorFinal = true;
			model = new FinanceMLP({ hiddenSize, learningRate, regularization, trainCount, seed });
			activeConfig = model.config;
			exposure = readFinalExposure(INVOICE_DATA_PROVENANCE.version, activeConfig.seed);
			exposureBeforeReveal = null;
			priorFinal ||= exposure.state === 'recorded';
			final = null;
			history = [];
			error = '';
			points = model.data;
			refresh();
			status = 'Fresh random weights. No training has happened yet.';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not create the model.';
		}
	}
	function train(count: number) {
		if (!model || running || final) return;
		error = '';
		running = true;
		const token = ++runId;
		const end = Math.min(model.step + count, 2000);
		const chunk = () => {
			if (token !== runId || !model) return;
			try {
				model.train(Math.min(10, end - model.step));
				refresh();
				if (model.step < end) timer = setTimeout(chunk, 40);
				else {
					running = false;
					status = `Finished ${model.step} updates. Compare training and validation loss before choosing your next change.`;
				}
			} catch (reason) {
				pause(false);
				error = reason instanceof Error ? reason.message : 'Training stopped.';
			}
		};
		status = `Training toward update ${end}; only training records enter the updates.`;
		timer = setTimeout(chunk, 0);
	}
	function commit() {
		if (!model) return;
		pause(false);
		exposureBeforeReveal = readFinalExposure(INVOICE_DATA_PROVENANCE.version, model.config.seed);
		priorFinal ||= exposureBeforeReveal.state === 'recorded';
		final = model.commitFinal(threshold);
		exposure = markFinalExposure(INVOICE_DATA_PROVENANCE.version, model.config.seed);
		status = `Model and threshold committed at update ${final.step}. Final cases revealed; further training is locked.`;
	}
	function exportRun() {
		if (!model) return;
		const blob = new Blob(
			[
				JSON.stringify(
					{
						model: 'FinanceMLP',
						provenance: INVOICE_DATA_PROVENANCE,
						finalExposure: exposure,
						exposureBeforeReveal,
						priorFinalCasesKnown: priorFinal,
						config: activeConfig,
						metrics,
						threshold,
						decisionAssumptions: {
							reviewCost,
							missCost,
							capacity,
							scope: '64 validation records; hypothetical USD costs; effective review assumed'
						},
						history,
						final,
						inspection: trace,
						data: scoredPoints
					},
					null,
					2
				)
			],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'willow-neural-experiment.json';
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
	function attachScene(canvas: HTMLCanvasElement) {
		let disposed = false;
		let current: ReturnType<typeof createTrainedNetworkScene> | undefined;
		import('$lib/engines/trained-network-scene')
			.then(({ createTrainedNetworkScene }) => {
				if (disposed) return;
				try {
					current = createTrainedNetworkScene(canvas);
					scene = current;
					syncScene();
					sceneStatus = '';
				} catch {
					sceneStatus =
						'3D is unavailable here. All weights and activations remain in the table below.';
				}
			})
			.catch(() => {
				if (!disposed) sceneStatus = 'The numerical view below is available without 3D.';
			});
		return () => {
			disposed = true;
			current?.dispose();
			if (scene === current) scene = undefined;
		};
	}
	onMount(() => {
		reset();
		const visibility = () => {
			if (document.hidden && running) pause();
		};
		document.addEventListener('visibilitychange', visibility);
		return () => {
			pause(false);
			document.removeEventListener('visibilitychange', visibility);
		};
	});
</script>

<div class="model-workbench">
	<div class="lab-intro">
		<span class="lab-badge"><Icon name="network" size={16} />LIVE CPU EXPERIMENT</span>
		<h2>Watch a network learn to spot exceptions.</h2>
		<p>
			Train on fictional invoice records. Then ask whether the pattern holds up on records the
			optimizer never saw.
		</p>
	</div>
	<div class="experiment-settings">
		<label
			>Hidden units<select bind:value={hiddenSize} disabled={running}
				><option value={2}>2 · compact</option><option value={6}>6 · balanced</option><option
					value={12}>12 · flexible</option
				></select
			></label
		>
		<label
			>Training records<select bind:value={trainCount} disabled={running}
				><option value={16}>16 records</option><option value={48}>48 records</option><option
					value={96}>96 records</option
				><option value={192}>192 records</option></select
			></label
		>
		<label
			>Learning rate<select bind:value={learningRate} disabled={running}
				><option value={0.005}>0.005 · smaller steps</option><option value={0.025}
					>0.025 · default</option
				><option value={0.1}>0.100 · larger steps</option></select
			></label
		>
		<label
			>L2 penalty<select bind:value={regularization} disabled={running}
				><option value={0}>0 · none</option><option value={0.001}>0.001 · light</option><option
					value={0.03}>0.030 · stronger</option
				><option value={0.2}>0.200 · heavy</option></select
			></label
		>
		<label
			>Random seed<input
				type="number"
				min="0"
				max="99999"
				step="1"
				bind:value={seed}
				disabled={running}
			/></label
		>
	</div>
	<div class="toolbar">
		<button
			class="run-button"
			onclick={() => train(200)}
			disabled={!metrics || running || !!final || metrics.step >= 2000}
			><Icon name="play" size={16} />Train 200 updates</button
		><button
			onclick={() => train(1)}
			disabled={!metrics || running || !!final || metrics.step >= 2000}>One update</button
		><button onclick={() => pause()} disabled={!running}
			><Icon name="pause" size={15} />Pause</button
		><button onclick={reset}
			><Icon name="reset" size={15} />{pending ? 'Apply settings & reset' : 'Reset weights'}</button
		><button class="export" onclick={exportRun} disabled={!metrics}
			><Icon name="download" size={15} />Save evidence</button
		>
	</div>
	{#if pending}<p class="setting-note">
			These settings are pending. Apply them to start a fresh experiment; the current model still
			uses its previous settings.
		</p>{/if}
	<p class="run-status" role="status">{status}</p>
	{#if error}<p class="lab-error" role="alert">{error}</p>{/if}
	{#if priorFinal}<p class="setting-note">
			You have already viewed final cases in this browser or this run. Reusing their results to
			choose a model turns them into development evidence, even after a reset.
		</p>{/if}
	{#if exposure?.state === 'unavailable'}<p class="setting-note">
			Earlier final-case reveals cannot be verified in browser storage. Prior exposure is unknown;
			save your evidence and do not claim a fresh independent test.
		</p>{/if}
	{#if metrics && trace && activeConfig}
		<div class="score-strip">
			<div>
				<span>UPDATES</span><strong>{metrics.step}</strong><small
					>{activeConfig.hiddenSize * 4 + 1} trainable values</small
				>
			</div>
			<div>
				<span>TRAINING LOSS</span><strong>{metrics.train.loss.toFixed(3)}</strong><small
					>{metrics.train.count} fitted records</small
				>
			</div>
			<div>
				<span>VALIDATION LOSS</span><strong>{metrics.validation.loss.toFixed(3)}</strong><small
					>64 separate records</small
				>
			</div>
			<div>
				<span>VALIDATION ACCURACY</span><strong>{fmt(metrics.validation.accuracy)}</strong><small
					>at threshold {threshold.toFixed(2)}</small
				>
			</div>
		</div>
		<div class="chart-grid">
			<section class="chart-card">
				<div class="card-heading">
					<h3>Does learning carry over?</h3>
					<span class="chart-kicker">LOWER LOSS IS BETTER</span>
				</div>
				<svg viewBox="0 0 620 225" role="img" aria-labelledby={`${id}-loss-title`}
					><title id={`${id}-loss-title`}
						>Measured cross-entropy loss across training updates. Training {metrics.train.loss.toFixed(
							3
						)}, validation {metrics.validation.loss.toFixed(3)}.</title
					>{#each [0, 1, 2, 3] as tick (tick)}<line
							x1="48"
							x2="588"
							y1={186 - (tick / 3) * 158}
							y2={186 - (tick / 3) * 158}
							stroke="#e4e8e2"
						/><text x="39" y={190 - (tick / 3) * 158} text-anchor="end"
							>{((tick / 3) * chartMax).toFixed(2)}</text
						>{/each}<path
						d={lossPath('train')}
						fill="none"
						stroke="#286a51"
						stroke-width="3"
					/><path
						d={lossPath('validation')}
						fill="none"
						stroke="#8061a5"
						stroke-width="3"
						stroke-dasharray="7 4"
					/><text x="48" y="206">0</text><text x="588" y="206" text-anchor="end"
						>{lastStep} updates</text
					></svg
				>
				<div class="chart-legend">
					<span><i class="green"></i>Training</span><span><i class="purple"></i>Validation</span>
				</div>
				<p>
					A widening gap can indicate overfitting. Compare models using validation; the final cases
					stay sealed until you commit.
				</p>
			</section>
			<section class="chart-card">
				<div class="card-heading">
					<h3>The pattern it has learned</h3>
					<label class="compact-label"
						>Show<select bind:value={viewSplit}
							><option value="train">Training points</option><option value="validation"
								>Validation points</option
							></select
						></label
					>
				</div>
				<svg
					class="decision-chart"
					viewBox="0 0 380 285"
					role="img"
					aria-labelledby={`${id}-surface-title`}
					><title id={`${id}-surface-title`}
						>Learned score over days overdue and amount mismatch. Filled circles require
						investigation; hollow circles do not. The cross marks your input below.</title
					>{#each surface as cell, i (i)}<rect
							x={48 + cell.x * 12}
							y={242 - (cell.y + 1) * 9}
							width="12.2"
							height="9.2"
							fill={`hsl(${45 + cell.score * 110} ${20 + cell.score * 14}% ${96 - cell.score * 27}%)`}
						/>{/each}{#each points[viewSplit] as point (point.id)}<circle
							cx={48 + point.inputs[0] * 288}
							cy={242 - point.inputs[1] * 216}
							r="3.4"
							fill={point.label ? '#28573f' : '#fff8ee'}
							stroke={point.label ? '#28573f' : '#927146'}
							stroke-width="1.3"
						/>{/each}<path
						d={`M${48 + (overdue / 90) * 288 - 6},${242 - (mismatch / 25) * 216}h12M${48 + (overdue / 90) * 288},${242 - (mismatch / 25) * 216 - 6}v12`}
						stroke="#302744"
						stroke-width="2.3"
					/><text x="48" y="260">0</text><text x="336" y="260" text-anchor="end"
						>90 days overdue →</text
					><text x="38" y="245" text-anchor="end">0%</text><text x="38" y="32" text-anchor="end"
						>25%</text
					><text x="49" y="16">Amount mismatch ↑</text></svg
				>
				<div class="chart-legend">
					<span><b>●</b>Investigate</span><span><b>○</b>No investigation</span><span
						><b>+</b>Your input</span
					>
				</div>
				<p>
					Background shading shows score, from pale (0) to green (1). Dots show the synthetic
					labels, not the model’s decisions.
				</p>
			</section>
		</div>
		<section class="network-section">
			<div class="section-heading">
				<span class="step-number">01</span>
				<div>
					<h3>Follow one invoice through the trained network</h3>
					<p>Change the inputs while keeping the learned weights fixed.</p>
				</div>
			</div>
			<div class="network-stage">
				<canvas
					{@attach attachScene}
					aria-label="Three-dimensional view of the actual trained network. A numerical table follows."
				></canvas>{#if sceneStatus}<p class="scene-status">{sceneStatus}</p>{/if}
				<div class="network-columns">
					<span>TWO INPUTS</span><span>{activeConfig.hiddenSize} HIDDEN UNITS</span><span
						>REVIEW SCORE</span
					>
				</div>
			</div>
			<div class="input-grid">
				<label
					>Days overdue <strong>{overdue} days</strong><input
						type="range"
						min="0"
						max="90"
						step="1"
						value={overdue}
						oninput={(e) => {
							overdue = Number(e.currentTarget.value);
							inspect();
						}}
					/></label
				><label
					>Amount mismatch <strong>{mismatch.toFixed(1)}%</strong><input
						type="range"
						min="0"
						max="25"
						step="0.5"
						value={mismatch}
						oninput={(e) => {
							mismatch = Number(e.currentTarget.value);
							inspect();
						}}
					/></label
				>
				<div class="prediction-card">
					<span>ACTUAL MODEL SCORE</span><strong>{trace.probability.toFixed(3)}</strong><small
						>{trace.probability >= threshold ? 'Flag for investigation' : 'Do not flag'} at {threshold.toFixed(
							2
						)}</small
					>
				</div>
			</div>
			<div class="view-controls">
				<label
					>Rotate view<input
						type="range"
						min="-0.8"
						max="0.8"
						step="0.02"
						value={rotation}
						oninput={(e) => {
							rotation = Number(e.currentTarget.value);
							syncScene();
						}}
					/></label
				><button
					onclick={() => {
						motion = !motion;
						syncScene();
					}}
					aria-pressed={motion}
					><Icon name={motion ? 'pause' : 'play'} size={14} />{motion
						? 'Pause motion'
						: 'Gentle motion'}</button
				>
			</div>
			<p class="caption">
				Green connections are positive weights; purple connections are negative. Thickness
				represents weight magnitude, capped at 3 for readability. Node size represents activation
				magnitude; biases appear in the table. Motion is decorative. Hidden activations can be
				negative because this network uses tanh.
			</p>
			<details>
				<summary>Inspect every weight, bias and activation</summary>
				<div class="table-scroll">
					<table>
						<caption
							>Actual forward pass · update {metrics.step}. Inputs are scaled to −1…1: {trace.scaledInput
								.map((n) => n.toFixed(3))
								.join(', ')}.</caption
						><thead
							><tr
								><th scope="col">Unit</th><th scope="col">Overdue weight</th><th scope="col"
									>Mismatch weight</th
								><th scope="col">Bias</th><th scope="col">Activation</th><th scope="col"
									>Weight to output</th
								></tr
							></thead
						><tbody
							>{#each trace.hidden as activation, h (h)}<tr
									><th scope="row">Hidden {h + 1}</th><td
										>{trace.weights[0].values[h].toFixed(4)}</td
									><td>{trace.weights[0].values[h + activeConfig.hiddenSize].toFixed(4)}</td><td
										>{trace.weights[1].values[h].toFixed(4)}</td
									><td>{activation.toFixed(4)}</td><td>{trace.weights[2].values[h].toFixed(4)}</td
									></tr
								>{/each}</tbody
						>
					</table>
				</div>
				<p>
					Output bias {trace.weights[3].values[0].toFixed(4)}. Weighted hidden values plus this bias
					produce logit {trace.logit.toFixed(4)}; sigmoid maps that to score {trace.probability.toFixed(
						4
					)}. Training changes weights and biases. Moving the input sliders does not.
				</p>
			</details>
		</section>
		<section class="threshold-section">
			<div class="section-heading">
				<span class="step-number">02</span>
				<div>
					<h3>Turn a score into a decision</h3>
					<p>Choose a threshold using validation records and the costs of mistakes.</p>
				</div>
			</div>
			<label class="threshold-control"
				>Flag when the score is at least <strong>{threshold.toFixed(2)}</strong><input
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={threshold}
					disabled={!!final}
					oninput={(e) => {
						threshold = Number(e.currentTarget.value);
						refresh(false);
					}}
				/></label
			>
			<div class="decision-costs">
				<label
					>Cost per review (USD)<input
						type="number"
						min="0"
						max="100000"
						bind:value={reviewCost}
					/></label
				><label
					>Expected loss per missed exception (USD)<input
						type="number"
						min="0"
						max="1000000"
						bind:value={missCost}
					/></label
				><label
					>Review capacity (this 64-case cohort)<input
						type="number"
						min="0"
						max="64"
						step="1"
						bind:value={capacity}
					/></label
				>
			</div>
			{#if validCosts}<p class="numerical-note">
					<strong>{metrics.validation.tp + metrics.validation.fp} reviews</strong> cost USD {(
						(metrics.validation.tp + metrics.validation.fp) *
						reviewCost
					).toFixed(2)}. Missed-case expected loss is USD {(
						metrics.validation.fn * missCost
					).toFixed(2)}. Total modeled cost:
					<strong
						>USD {(
							(metrics.validation.tp + metrics.validation.fp) * reviewCost +
							metrics.validation.fn * missCost
						).toFixed(2)}</strong
					>. The always-negative baseline costs USD {(
						(metrics.validation.tp + metrics.validation.fn) *
						missCost
					).toFixed(2)} under these same assumptions. {metrics.validation.tp +
						metrics.validation.fp >
					capacity
						? `The queue exceeds capacity by ${metrics.validation.tp + metrics.validation.fp - capacity} reviews. Reconsider the policy using actual counts.`
						: 'The queue fits the entered capacity.'}
				</p>{:else}<p role="alert">
					Enter nonnegative finite costs and a whole-number capacity.
				</p>{/if}
			<p class="numerical-note">
				These are hypothetical costs for this validation cohort. The calculation assumes each
				reviewed true exception is effectively resolved, with no residual loss. It does not estimate
				causal treatment effects or guarantee recovered money. A policy can fit capacity and still
				be inappropriate; explain labels, consequences, and representativeness.
			</p>
			<div class="confusion-grid">
				<div>
					<span>Correct flags</span><strong>{metrics.validation.tp}</strong><small
						>True positives</small
					>
				</div>
				<div>
					<span>Unnecessary reviews</span><strong>{metrics.validation.fp}</strong><small
						>False positives</small
					>
				</div>
				<div>
					<span>Missed exceptions</span><strong>{metrics.validation.fn}</strong><small
						>False negatives</small
					>
				</div>
				<div>
					<span>Correct non-flags</span><strong>{metrics.validation.tn}</strong><small
						>True negatives</small
					>
				</div>
			</div>
			<p class="metric-explanation">
				Precision: <strong>{fmt(metrics.validation.precision)}</strong> of flagged cases need
				investigation. Recall: <strong>{fmt(metrics.validation.recall)}</strong> of actual exceptions
				are flagged. “Undefined” means there is no denominator, not a perfect score.
			</p>
		</section>
		<section class="commit-card">
			<Icon name="shield" size={25} />
			<div>
				<h3>{final ? 'Your final result is now evidence.' : 'Ready to make a commitment?'}</h3>
				{#if final}<p>
						Frozen at update <strong>{final.step}</strong>, threshold
						<strong>{final.threshold.toFixed(2)}</strong>. On 192 separate final records: loss
						<strong>{final.score.loss.toFixed(3)}</strong>, accuracy
						<strong>{fmt(final.score.accuracy)}</strong>, precision
						<strong>{fmt(final.score.precision)}</strong>, recall
						<strong>{fmt(final.score.recall)}</strong>.
					</p>
					<p>
						Do not keep tuning against this result and still call it an independent test. Resetting
						can support a new exploration, but cannot erase what you have learned from these cases.
					</p>{:else}<p>
						Choose your configuration and threshold first. Committing freezes this model and reveals
						performance on 192 separate cases.
					</p>
					<button onclick={commit} disabled={running || metrics.step === 0}
						>Commit model & reveal final cases <Icon name="arrow" size={16} /></button
					>{/if}
			</div>
		</section>
		<details>
			<summary>Read the measured results as tables</summary>
			<div class="table-scroll">
				<table>
					<caption>Loss checkpoints · cross-entropy without the L2 training penalty</caption><thead
						><tr
							><th scope="col">Update</th><th scope="col">Training loss</th><th scope="col"
								>Validation loss</th
							></tr
						></thead
					><tbody
						>{#each history as point, i (i)}<tr
								><th scope="row">{point.step}</th><td>{point.train.toFixed(5)}</td><td
									>{point.validation.toFixed(5)}</td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<div class="table-scroll">
				<table>
					<caption>Every displayed record and its current score</caption><thead
						><tr
							><th scope="col">Record</th><th scope="col">Days overdue</th><th scope="col"
								>Mismatch</th
							><th scope="col">Actual label</th><th scope="col">Model score</th></tr
						></thead
					><tbody
						>{#each scoredPoints as point (point.id)}<tr
								><th scope="row">{point.id}</th><td>{point.days.toFixed(1)}</td><td
									>{point.mismatch.toFixed(2)}%</td
								><td>{point.label ? 'Investigate' : 'No investigation'}</td><td
									>{point.score.toFixed(4)}</td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
		</details>
	{/if}
	<details class="provenance">
		<summary>What is real here, and what are its limits?</summary>
		<p>
			This is a real 2-input neural classifier with one tanh hidden layer and a sigmoid output. Each
			update uses a 32-record minibatch, computes cross-entropy gradients and changes parameters
			with Adam. Training and validation curves are measured, not animations.
		</p>
		<p>{INVOICE_DATA_PROVENANCE.limitations} {INVOICE_DATA_PROVENANCE.rule}</p>
		<p>
			Validation and final records use separate seeded streams. The seed controls both generated
			data and model initialization; changing it changes both. Changing only the training count
			preserves the validation and final records. CPU training stops at 2,000 updates per run. The
			session is local and resets on navigation; save your evidence before leaving.
		</p>
	</details>
</div>

<style>
	.decision-costs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 15px;
		margin: 20px 0;
	}
	.decision-costs label {
		display: grid;
		gap: 8px;
		font-size: 13px;
		line-height: 1.6;
	}
	.decision-costs input {
		width: 100%;
		padding: 10px;
		border: 1px solid #ccd6c3;
		border-radius: 8px;
		background: #fff;
	}
	@media (max-width: 650px) {
		.decision-costs {
			grid-template-columns: 1fr;
		}
	}

	.model-workbench {
		--lab-green: #286a51;
		--lab-purple: #8061a5;
		display: grid;
		gap: 20px;
		min-width: 0;
		color: var(--ink);
	}
	.lab-intro {
		padding: 27px 30px;
		background: linear-gradient(120deg, #e8f1e8, #f7f5ed);
		border: 1px solid #dde8da;
		border-radius: 20px;
	}
	.lab-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 10px;
		letter-spacing: 1.4px;
		font-weight: 750;
		color: #386751;
	}
	.lab-intro h2 {
		font-size: clamp(23px, 3vw, 32px);
		letter-spacing: -1px;
		line-height: 1.3;
		margin: 13px 0 10px;
	}
	.lab-intro p,
	.chart-card p,
	.section-heading p,
	.caption,
	.metric-explanation,
	.commit-card p,
	details p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
	}
	.experiment-settings {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 12px;
	}
	.experiment-settings label,
	.compact-label {
		display: grid;
		gap: 7px;
		font-size: 11px;
		font-weight: 650;
	}
	select,
	input[type='number'] {
		width: 100%;
		border: 1px solid #dce3d8;
		background: #fff;
		border-radius: 9px;
		padding: 11px 10px;
		min-height: 42px;
		font-size: 12px;
	}
	.toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border: 1px solid #dce4d9;
		background: #fff;
		border-radius: 9px;
		padding: 11px 14px;
		font-size: 12px;
		font-weight: 650;
		min-height: 42px;
	}
	button:hover:not(:disabled) {
		background: #edf3e9;
	}
	.run-button {
		background: var(--lab-green);
		border-color: var(--lab-green);
		color: #fff;
	}
	.run-button:hover:not(:disabled) {
		background: #1e563f;
	}
	.export {
		margin-left: auto;
	}
	.run-status {
		font-size: 12px;
		color: #516452;
		min-height: 22px;
	}
	.setting-note,
	.lab-error {
		border-radius: 10px;
		background: #fcf0df;
		padding: 12px 16px;
		font-size: 12px;
		line-height: 1.7;
	}
	.lab-error {
		background: #fcebe6;
		color: #8b3b2c;
	}
	.score-strip {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border: 1px solid var(--line);
		border-radius: 15px;
		overflow: hidden;
		background: #fff;
	}
	.score-strip > div {
		padding: 19px;
		border-right: 1px solid var(--line);
	}
	.score-strip > div:last-child {
		border-right: 0;
	}
	.score-strip span,
	.prediction-card > span {
		font-size: 9px;
		letter-spacing: 1px;
		font-weight: 700;
		color: #657268;
	}
	.score-strip strong {
		display: block;
		font-family: 'Manrope Variable', sans-serif;
		font-size: 29px;
		letter-spacing: -1px;
		margin: 6px 0;
	}
	.score-strip small {
		font-size: 10px;
		color: var(--muted);
	}
	.chart-grid {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		gap: 18px;
	}
	.chart-card {
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 20px;
		min-width: 0;
	}
	.card-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 43px;
	}
	.card-heading h3,
	.section-heading h3,
	.commit-card h3 {
		font-size: 16px;
		line-height: 1.5;
		letter-spacing: -0.35px;
	}
	.chart-kicker {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.7px;
		white-space: nowrap;
		color: var(--muted);
	}
	.chart-card svg {
		width: 100%;
		height: auto;
		display: block;
		margin-top: 10px;
	}
	.chart-card svg text {
		font-size: 11px;
		fill: #55655c;
	}
	.compact-label {
		font-size: 9px;
		gap: 2px;
	}
	.compact-label select {
		padding: 6px;
		min-height: 32px;
		font-size: 10px;
	}
	.chart-legend {
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
		font-size: 10px;
		align-items: center;
		margin: 9px 0 12px;
	}
	.chart-legend span {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.chart-legend i {
		height: 3px;
		width: 20px;
		display: block;
	}
	.green {
		background: var(--lab-green);
	}
	.purple {
		background: var(--lab-purple);
	}
	.chart-legend b {
		font-size: 16px;
	}
	.chart-card p {
		font-size: 11px;
	}
	.section-heading {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 13px;
		margin-bottom: 18px;
	}
	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 37px;
		height: 37px;
		border-radius: 12px;
		background: #e8eee0;
		color: #47613c;
		font-size: 12px;
		font-weight: 750;
	}
	.network-section,
	.threshold-section {
		background: #fff;
		border: 1px solid var(--line);
		padding: 23px;
		border-radius: 18px;
	}
	.network-stage {
		position: relative;
		height: 320px;
		border-radius: 14px;
		background: radial-gradient(ellipse at 55% 40%, #e4e9df, #f7f5ed);
		overflow: hidden;
	}
	.network-stage canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
	.scene-status {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30px;
		text-align: center;
		font-size: 12px;
		color: var(--muted);
	}
	.network-columns {
		position: absolute;
		bottom: 16px;
		left: 10%;
		right: 10%;
		display: flex;
		justify-content: space-between;
		pointer-events: none;
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 1px;
		color: #586c5c;
	}
	.input-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 0.85fr;
		gap: 25px;
		align-items: center;
		margin-top: 23px;
	}
	.input-grid label,
	.threshold-control {
		font-size: 12px;
		font-weight: 550;
	}
	.input-grid label strong,
	.threshold-control strong {
		float: right;
		color: var(--lab-green);
	}
	input[type='range'] {
		display: block;
		margin-top: 12px;
	}
	.prediction-card {
		padding: 16px;
		background: #eeeaf5;
		border-radius: 12px;
	}
	.prediction-card > span {
		color: #594869;
	}
	.prediction-card strong {
		font-family: 'Manrope Variable', sans-serif;
		display: block;
		font-size: 34px;
		color: #614d7a;
		letter-spacing: -1px;
	}
	.prediction-card small {
		font-size: 10px;
		color: #62536e;
	}
	.view-controls {
		display: flex;
		align-items: center;
		gap: 18px;
		margin: 16px 0;
	}
	.view-controls label {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 10px;
	}
	.view-controls input {
		width: 130px;
		margin: 0;
	}
	.view-controls button {
		font-size: 10px;
		min-height: 35px;
		padding: 7px 10px;
	}
	.caption {
		font-size: 11px;
	}
	.threshold-control {
		display: block;
		max-width: 500px;
		margin-bottom: 20px;
	}
	.confusion-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
	}
	.confusion-grid > div {
		background: #f1f5ed;
		padding: 16px;
		border-radius: 12px;
	}
	.confusion-grid > div:nth-child(2),
	.confusion-grid > div:nth-child(3) {
		background: #fbf0e5;
	}
	.confusion-grid span {
		font-size: 11px;
	}
	.confusion-grid strong {
		display: block;
		font-size: 28px;
		margin: 6px 0;
	}
	.confusion-grid small {
		font-size: 10px;
		color: var(--muted);
	}
	.metric-explanation {
		margin-top: 17px;
	}
	.commit-card {
		padding: 24px;
		display: flex;
		align-items: flex-start;
		gap: 18px;
		background: #eeeaf6;
		border: 1px solid #e3dcee;
		border-radius: 16px;
	}
	.commit-card h3 {
		margin-bottom: 7px;
	}
	.commit-card p + p {
		margin-top: 9px;
	}
	.commit-card button {
		margin-top: 17px;
		background: #5e4c7a;
		color: white;
		border-color: #5e4c7a;
	}
	.commit-card button:hover:not(:disabled) {
		background: #493962;
	}
	details {
		padding: 16px 18px;
		background: #f7f8f3;
		border: 1px solid var(--line);
		border-radius: 12px;
		min-width: 0;
	}
	details summary {
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}
	details p {
		margin-top: 14px;
		font-size: 12px;
	}
	.network-section details {
		margin-top: 17px;
	}
	.table-scroll {
		overflow: auto;
		max-height: 350px;
		margin-top: 16px;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		background: #fff;
	}
	caption {
		text-align: left;
		font-size: 11px;
		padding: 8px 0 12px;
		line-height: 1.7;
		color: var(--muted);
	}
	th,
	td {
		padding: 10px 12px;
		text-align: right;
		border-bottom: 1px solid var(--line);
		white-space: nowrap;
	}
	th:first-child {
		text-align: left;
	}
	thead th {
		background: #eaf0e4;
		position: sticky;
		top: 0;
	}
	tbody th {
		font-weight: 500;
	}
	.provenance {
		background: #f7f4ec;
	}
	@media (max-width: 1000px) {
		.experiment-settings {
			grid-template-columns: repeat(3, 1fr);
		}
		.chart-grid {
			grid-template-columns: 1fr;
		}
		.decision-chart {
			max-height: 340px;
		}
		.score-strip strong {
			font-size: 25px;
		}
		.chart-kicker {
			font-size: 8px;
		}
	}
	@media (max-width: 600px) {
		.lab-intro {
			padding: 22px;
		}
		.experiment-settings {
			grid-template-columns: repeat(2, 1fr);
		}
		.toolbar {
			gap: 7px;
		}
		.toolbar button {
			flex: 1 1 auto;
			font-size: 11px;
			padding: 10px;
		}
		.export {
			margin: 0;
		}
		.score-strip {
			grid-template-columns: repeat(2, 1fr);
		}
		.score-strip > div {
			padding: 15px;
			border-bottom: 1px solid var(--line);
		}
		.score-strip > div:nth-child(2) {
			border-right: 0;
		}
		.chart-card,
		.network-section,
		.threshold-section {
			padding: 16px;
		}
		.chart-kicker {
			display: none;
		}
		.network-stage {
			height: 250px;
		}
		.network-columns {
			left: 6%;
			right: 6%;
			font-size: 6px;
			letter-spacing: 0.6px;
		}
		.input-grid {
			grid-template-columns: 1fr 1fr;
			gap: 18px;
		}
		.prediction-card {
			grid-column: 1/-1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
			flex-wrap: wrap;
		}
		.prediction-card strong {
			font-size: 26px;
		}
		.prediction-card > span {
			font-size: 8px;
		}
		.confusion-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.commit-card {
			padding: 19px;
			gap: 12px;
		}
		.view-controls {
			flex-wrap: wrap;
		}
		.card-heading h3 {
			font-size: 15px;
		}
		.section-heading p {
			font-size: 12px;
		}
	}
</style>
