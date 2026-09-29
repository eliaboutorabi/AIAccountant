<script lang="ts">
	import { onMount } from 'svelte';
	import {
		readFinalExposure,
		markFinalExposure,
		type FinalExposure
	} from '$lib/engines/final-exposure';
	import Icon from '$lib/components/Icon.svelte';
	import {
		DenoisingExperiment,
		DENOISING_PROVENANCE,
		type DenoisingPair
	} from '$lib/engines/denoising';
	import './numerical-labs.css';
	const id = $props.id();
	let engine: DenoisingExperiment | undefined;
	let initial: DenoisingExperiment | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let runId = 0;
	let seed = $state(42);
	let trainingNoise = $state(1);
	let activeSeed = $state(42);
	let activeTrainingNoise = $state(1);
	let noise = $state(0.4);
	let selected = $state(0);
	let running = $state(false);
	let status = $state('Preparing the denoising model…');
	let error = $state('');
	let metrics = $state.raw<ReturnType<DenoisingExperiment['metrics']> | null>(null);
	let pairs = $state.raw<DenoisingPair[]>([]);
	let initialMse = $state(0);
	let comparisons = $state.raw<
		{ noise: number; initial: number; current: number; noisy: number }[]
	>([]);
	let final = $state.raw<ReturnType<DenoisingExperiment['commitFinal']> | null>(null);
	let previouslyRevealed = $state(false);
	let exposure = $state.raw<FinalExposure | null>(null);
	let exposureBeforeReveal = $state.raw<FinalExposure | null>(null);
	const point = $derived(pairs[selected]);
	const extent = $derived(
		Math.max(1.4, ...pairs.flatMap((p) => [...p.clean, ...p.noisy, ...p.predicted].map(Math.abs))) *
			1.08
	);
	const positions = ['clean', 'noisy', 'predicted'] as const;
	const plotNames = {
		clean: 'Original clean points',
		noisy: 'Corrupted observations',
		predicted: 'Model estimates'
	};
	const projectX = (n: number) => 35 + ((n + extent) / (2 * extent)) * 240;
	const projectY = (n: number) => 258 - ((n + extent) / (2 * extent)) * 225;
	function refresh() {
		if (!engine || !initial) return;
		metrics = engine.metrics(noise);
		pairs = engine.validationPairs(noise);
		initialMse = initial.metrics(noise).validation.mse;
		comparisons = [0.1, 0.4, 0.8, 1.2].map((level) => {
			const score = engine!.metrics(level);
			return {
				noise: level,
				initial: initial!.metrics(level).validation.mse,
				current: score.validation.mse,
				noisy: score.validation.noisyMse
			};
		});
	}
	function pause(announce = true) {
		runId++;
		clearTimeout(timer);
		running = false;
		if (announce) status = 'Paused. The fitted denoiser is retained.';
	}
	function reset() {
		pause(false);
		try {
			if (final) previouslyRevealed = true;
			const next = new DenoisingExperiment({ seed, maxTrainingNoise: trainingNoise });
			engine = next;
			initial = new DenoisingExperiment(next.config);
			activeSeed = seed;
			activeTrainingNoise = trainingNoise;
			exposure = readFinalExposure(DENOISING_PROVENANCE.version, activeSeed);
			exposureBeforeReveal = null;
			previouslyRevealed ||= exposure.state === 'recorded';
			final = null;
			error = '';
			refresh();
			status =
				'Fresh random weights. The clean reference and fixed corruption draws are ready for comparison.';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not initialize the model.';
		}
	}
	function train(count: number) {
		if (!engine || running || final) return;
		const token = ++runId;
		const end = Math.min(engine.step + count, 1000);
		running = true;
		error = '';
		status = 'Learning clean-coordinate estimates from newly corrupted training points…';
		const chunk = () => {
			if (token !== runId || !engine) return;
			try {
				engine.train(Math.min(10, end - engine.step));
				refresh();
				if (engine.step < end) timer = setTimeout(chunk, 25);
				else {
					running = false;
					status = `Finished ${engine.step} updates. Validation points have supplied no gradients.`;
				}
			} catch (reason) {
				pause(false);
				error = reason instanceof Error ? reason.message : 'Training stopped.';
			}
		};
		timer = setTimeout(chunk, 0);
	}
	function changeNoise(value: number) {
		noise = value;
		refresh();
	}
	function commit() {
		if (!engine) return;
		pause(false);
		exposureBeforeReveal = readFinalExposure(DENOISING_PROVENANCE.version, activeSeed);
		previouslyRevealed ||= exposureBeforeReveal.state === 'recorded';
		final = engine.commitFinal(noise);
		exposure = markFinalExposure(DENOISING_PROVENANCE.version, activeSeed);
		status = `Final cases revealed at noise ${final.noise.toFixed(2)}. Training is frozen.`;
	}
	function save() {
		if (!engine) return;
		const result = {
			provenance: DENOISING_PROVENANCE,
			finalExposure: exposure,
			exposureBeforeReveal,
			priorFinalCasesKnown: previouslyRevealed,
			config: engine.config,
			metrics,
			initialMse,
			comparisons,
			final,
			validationPairs: pairs,
			parameters: engine.weights()
		};
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
		);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'denoising-evidence.json';
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
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

<div class="numerical-lab">
	<header class="lab-cover mint">
		<span class="lab-eyebrow"><Icon name="sparkles" size={16} />DENOISING · A LEARNED ESTIMATE</span
		>
		<h2>Can a model learn to remove noise?</h2>
		<p>
			Train a tiny neural network on original two-dimensional points. Change the corruption level,
			watch its estimates move, and measure the difference between a cleaner picture and a faithful
			reconstruction.
		</p>
		<div class="mini-tags">
			<span>98 trainable parameters</span><span>128 training points</span><span
				>64 validation points</span
			><span>128 sealed final points</span>
		</div>
	</header>
	<p class="lab-note">
		These are dimensionless synthetic coordinates, not financial records or images. This lab trains
		a real denoising objective. A full generative diffusion model also needs a noise schedule and a
		repeated sampling procedure, which this experiment does not implement.
	</p>
	<div class="lab-fields">
		<label class="small"
			>Experiment seed<input
				type="number"
				min="0"
				max="99999"
				step="1"
				bind:value={seed}
				disabled={running}
			/></label
		><label
			>Maximum training noise<select bind:value={trainingNoise} disabled={running}
				><option value={0.3}>0.30 · mostly light corruption</option><option value={1}
					>1.00 · broad corruption range</option
				><option value={1.5}>1.50 · includes strong corruption</option></select
			></label
		>
		<div class="lab-actions">
			<button onclick={reset}
				><Icon name="reset" size={15} />{seed !== activeSeed ||
				trainingNoise !== activeTrainingNoise
					? 'Apply settings & reset'
					: 'Reset model'}</button
			><button onclick={save} disabled={!metrics}
				><Icon name="download" size={15} />Save evidence</button
			>
		</div>
	</div>
	{#if seed !== activeSeed || trainingNoise !== activeTrainingNoise}<p class="caption">
			Pending settings apply on reset. The current run uses seed {activeSeed} and training noise from
			0.03 to {activeTrainingNoise.toFixed(2)}.
		</p>{/if}
	<div class="lab-actions">
		<button
			class="primary"
			onclick={() => train(200)}
			disabled={!metrics || running || !!final || metrics.step >= 1000}
			><Icon name="play" size={15} />Learn for 200 updates</button
		><button
			onclick={() => train(1)}
			disabled={!metrics || running || !!final || metrics.step >= 1000}>One update</button
		><button onclick={() => pause()} disabled={!running}
			><Icon name="pause" size={15} />Pause</button
		>
	</div>
	<p class="lab-status" role="status">{status}</p>
	{#if error}<p class="lab-error" role="alert">{error}</p>{/if}{#if previouslyRevealed}<p
			class="lab-note"
		>
			You have viewed final cases. Resetting the same experiment does not make those cases unseen
			again; do not use their result to tune a new model and claim a fresh final test.
		</p>{/if}
	{#if exposure?.state === 'unavailable'}<p class="lab-note">
			Earlier final-case reveals cannot be verified in browser storage. Prior exposure is unknown;
			save your evidence and do not claim a fresh independent test.
		</p>{/if}
	{#if metrics}
		<section class="lab-panel">
			<div class="panel-top">
				<div>
					<h3>How much information did corruption hide?</h3>
					<p>
						Move the evaluation noise slider. The same validation points and Gaussian draws are used
						at every level, so the corruption comparison is paired. This control does not retrain
						the model.
					</p>
				</div>
				<span class="source-tag">{metrics.step} GRADIENT UPDATES</span>
			</div>
			<label
				>Evaluation noise standard deviation: {noise.toFixed(2)}<input
					type="range"
					min="0"
					max="1.5"
					step="0.05"
					value={noise}
					oninput={(event) => changeNoise(Number(event.currentTarget.value))}
				/></label
			>{#if noise > activeTrainingNoise || noise < 0.03}<p class="lab-note">
					This evaluation noise is outside the model’s training range of 0.03–{activeTrainingNoise.toFixed(
						2
					)}. Improvement here would be an observed result, not a guarantee of extrapolation.
				</p>{/if}
			<div class="lab-grid three" style="margin-top:22px">
				{#each positions as position (position)}<section class="plot-card">
						<h4>{plotNames[position]}</h4>
						<svg viewBox="0 0 310 288" role="img" aria-labelledby={`${id}-${position}`}
							><title id={`${id}-${position}`}
								>{plotNames[position]} for the same 64 validation points at noise {noise.toFixed(
									2
								)}. All three charts use axes from minus {extent.toFixed(2)} to plus {extent.toFixed(
									2
								)}. Record {point?.id} is outlined.</title
							><rect
								x="35"
								y="33"
								width="240"
								height="225"
								rx="9"
								fill={position === 'noisy'
									? '#f9f1e3'
									: position === 'clean'
										? '#eef4e8'
										: '#f1ecf6'}
							/><line x1={projectX(0)} x2={projectX(0)} y1="33" y2="258" stroke="#dce0d5" /><line
								x1="35"
								x2="275"
								y1={projectY(0)}
								y2={projectY(0)}
								stroke="#dce0d5"
							/>{#each pairs as p (p.id)}<circle
									cx={projectX(p[position][0])}
									cy={projectY(p[position][1])}
									r="3.4"
									fill={p.cluster ? '#765292' : '#3d7552'}
									opacity="0.72"
								/>{/each}{#if point}<circle
									cx={projectX(point[position][0])}
									cy={projectY(point[position][1])}
									r="7.5"
									fill="none"
									stroke="#293728"
									stroke-width="2"
								/>{#if position === 'predicted'}<line
										x1={projectX(point.clean[0])}
										y1={projectY(point.clean[1])}
										x2={projectX(point.predicted[0])}
										y2={projectY(point.predicted[1])}
										stroke="#293728"
										stroke-dasharray="3 3"
									/><path
										d={`M${projectX(point.clean[0]) - 4},${projectY(point.clean[1]) - 4}l8,8m-8,0l8,-8`}
										stroke="#293728"
										stroke-width="1.6"
									/>{/if}{/if}<text x="35" y="277">x: −{extent.toFixed(1)}</text><text
								x="275"
								y="277"
								text-anchor="end">+{extent.toFixed(1)}</text
							><text x="35" y="20">y: −{extent.toFixed(1)} to +{extent.toFixed(1)} ↑</text></svg
						>
						<p>
							{position === 'clean'
								? 'The original clean coordinates are known here because we constructed the exercise.'
								: position === 'noisy'
									? 'Clean coordinates plus a scaled Gaussian noise draw; the model receives these coordinates and the noise level.'
									: 'Two predicted clean coordinates from the current weights. A cross marks the selected record’s true clean point.'}
						</p>
					</section>{/each}
			</div>
			<div class="plot-interaction">
				<label
					>Inspect a validation record<select bind:value={selected}
						>{#each pairs as p, i (p.id)}<option value={i}>{p.id}</option>{/each}</select
					></label
				><span class="caption"
					>Point colors show original cluster membership for explanation. The model never receives
					that membership.</span
				>
			</div>
		</section>
		<div
			class="metric-strip"
			aria-label="Validation mean squared error at the selected noise level"
		>
			<div>
				<span>PASS THROUGH NOISY INPUT</span><strong
					>{metrics.validation.noisyMse.toFixed(4)}</strong
				><small>No model · lower is better</small>
			</div>
			<div>
				<span>INITIAL RANDOM MODEL</span><strong>{initialMse.toFixed(4)}</strong><small
					>Before learning · same points</small
				>
			</div>
			<div>
				<span>CURRENT LEARNED MODEL</span><strong>{metrics.validation.mse.toFixed(4)}</strong><small
					>After {metrics.step} updates · same points</small
				>
			</div>
		</div>
		{#if point}<section class="definition-box">
				<h3>Follow {point.id} through the computation.</h3>
				<p>
					Clean reference: ({point.clean[0].toFixed(3)}, {point.clean[1].toFixed(3)}). The fixed
					Gaussian draw is ({point.noise[0].toFixed(3)}, {point.noise[1].toFixed(3)}), multiplied by
					noise {noise.toFixed(2)} and added to that reference. The observed input becomes ({point.noisy[0].toFixed(
						3
					)}, {point.noisy[1].toFixed(3)}).
				</p>
				<p>
					The network receives exactly three values: those two noisy coordinates and {noise.toFixed(
						2
					)}, the known noise level. It produces ({point.predicted[0].toFixed(3)}, {point.predicted[1].toFixed(
						3
					)}). Its squared error, averaged over the two coordinates, is
					<strong>{point.squaredError.toFixed(5)}</strong>.
				</p>
				<p>
					At high corruption, different originals can produce similar observations. A model trained
					to minimize squared error is encouraged toward an average of plausible clean answers. That
					average can lie between the clusters: it need not be a likely original, a recovered fact
					or a generated sample.
				</p>
			</section>{/if}
		<section class="lab-panel">
			<h3>Look across noise levels, not just at one attractive picture.</h3>
			<p>
				Every row below uses the same 64 validation references with paired Gaussian draws. Changing
				training settings requires a new run. Evaluation rows outside the training noise range are
				marked explicitly.
			</p>
			<!-- Keyboard users need focus here to scroll the evidence table. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="table-scroll"
				tabindex="0"
				role="region"
				aria-label="Denoising error across noise levels"
			>
				<table>
					<caption
						>Measured mean squared error per coordinate · lower is better · all coordinates are
						dimensionless</caption
					><thead
						><tr
							><th scope="col">Noise level</th><th scope="col">Noisy input</th><th scope="col"
								>Initial model</th
							><th scope="col">Current model</th><th scope="col">Training coverage</th></tr
						></thead
					><tbody
						>{#each comparisons as row (row.noise)}<tr
								><th scope="row">{row.noise.toFixed(2)}</th><td>{row.noisy.toFixed(5)}</td><td
									>{row.initial.toFixed(5)}</td
								><td>{row.current.toFixed(5)}</td><td
									>{row.noise > activeTrainingNoise
										? 'Outside training range'
										: 'Inside training range'}</td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<p class="caption">
				At the selected noise level, training-set MSE is {metrics.train.mse.toFixed(5)} and validation
				MSE is {metrics.validation.mse.toFixed(5)}. Evaluation uses fixed corruption draws;
				optimization uses fresh corruption drawn only for training points. These MSE values are not
				next-token loss or classification accuracy.
			</p>
		</section>
		<details>
			<summary>Read the coordinates and errors behind every plotted point</summary>
			<!-- Keyboard users need focus here to scroll the evidence table. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="table-scroll"
				tabindex="0"
				role="region"
				aria-label="All validation coordinates and errors"
			>
				<table>
					<caption
						>Validation predictions at noise {noise.toFixed(2)}, update {metrics.step}. Selected
						record {point?.id} is highlighted.</caption
					><thead
						><tr
							><th scope="col">Record</th><th scope="col">Clean x</th><th scope="col">Clean y</th
							><th scope="col">Noisy x</th><th scope="col">Noisy y</th><th scope="col"
								>Estimate x</th
							><th scope="col">Estimate y</th><th scope="col">MSE</th></tr
						></thead
					><tbody
						>{#each pairs as row, i (row.id)}<tr class:selected-row={i === selected}
								><th scope="row">{row.id}</th><td>{row.clean[0].toFixed(4)}</td><td
									>{row.clean[1].toFixed(4)}</td
								><td>{row.noisy[0].toFixed(4)}</td><td>{row.noisy[1].toFixed(4)}</td><td
									>{row.predicted[0].toFixed(4)}</td
								><td>{row.predicted[1].toFixed(4)}</td><td>{row.squaredError.toFixed(5)}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
		</details>
		<section class="commit-panel">
			<Icon name="shield" size={25} />
			<div>
				<h3>
					{final
						? 'The final denoising test is now revealed.'
						: 'Freeze the procedure before opening the final cases.'}
				</h3>
				{#if final}<p>
						At update {final.step} and preselected noise <strong>{final.noise.toFixed(2)}</strong>,
						the 128 independent final points give MSE <strong>{final.mse.toFixed(5)}</strong>.
						Passing their noisy inputs through unchanged gives
						<strong>{final.noisyMse.toFixed(5)}</strong>. Training is frozen; moving the inspection
						slider does not change this stored result.
					</p>{:else}<p>
						Choose the evaluation noise using validation evidence. Committing freezes these weights
						and evaluates 128 separate final points at the currently selected noise {noise.toFixed(
							2
						)}.
					</p>
					<button onclick={commit} disabled={running || metrics.step === 0}
						>Commit & reveal final denoising test</button
					>{/if}
			</div>
		</section>
	{/if}
	<details class="provenance-panel">
		<summary>What this model learns — and what remains outside the experiment</summary>
		<p>{DENOISING_PROVENANCE.architecture} {DENOISING_PROVENANCE.objective}</p>
		<p>
			Training has two Gaussian clusters centered at (−0.65, −0.35) and (+0.65, +0.35), with
			within-cluster standard deviation 0.16. Training, validation and final clean points use
			independent seeded random streams. Each update draws 32 training points with replacement and
			independently sampled corruption, with noise standard deviation uniformly sampled from 0.03 to
			the chosen maximum. Adam uses learning rate 0.008 and gradient clipping at norm 3.
		</p>
		<p>
			For each pair, the two squared coordinate errors are averaged; the reported dataset MSE
			averages those pair errors. The model has no access to the original clean coordinates or
			cluster label when predicting. They are available to the experiment for supervision and
			measurement.
		</p>
		<p>
			{DENOISING_PROVENANCE.limits} Commercial image generation adds far larger data, different architectures,
			conditioning, training objectives and sampling machinery. Repeatedly calling this one-step estimator
			is not a demonstrated diffusion sampler. Save the JSON evidence before navigating; this browser
			experiment does not persist automatically.
		</p>
	</details>
</div>
