<script lang="ts">
	import { onMount } from 'svelte';
	import {
		readFinalExposure,
		markFinalExposure,
		type FinalExposure
	} from '$lib/engines/final-exposure';
	import Icon from '$lib/components/Icon.svelte';
	import {
		RepresentationExperiment,
		CANDIDATES,
		REPRESENTATION_PROVENANCE,
		type Candidate,
		type Domain,
		type RepresentationPoint
	} from '$lib/engines/representations';
	import './numerical-labs.css';
	const id = $props.id();
	let engine: RepresentationExperiment | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let runId = 0;
	let seed = $state(42);
	let activeSeed = $state(42);
	let running = $state(false);
	let status = $state('Preparing comparison models…');
	let error = $state('');
	let selected = $state<Candidate>('engineered');
	let axisA = $state(0);
	let axisB = $state(1);
	let targetCount = $state(24);
	let domain = $state<Domain>('related');
	let metrics = $state.raw<ReturnType<RepresentationExperiment['metrics']> | null>(null);
	let data = $state.raw<RepresentationPoint[]>([]);
	let activations = $state.raw<ReturnType<RepresentationExperiment['activations']>>([]);
	let surfaces = $state.raw<{ id: Candidate; cells: { x: number; y: number; score: number }[] }[]>(
		[]
	);
	let frozen = $state(false);
	let tree = $state('');
	let final = $state.raw<ReturnType<RepresentationExperiment['commit']> | null>(null);
	let transfer = $state.raw<ReturnType<RepresentationExperiment['transferMetrics']>>(null);
	let transferFinal = $state.raw<ReturnType<RepresentationExperiment['commitTransfer']> | null>(
		null
	);
	let targetRows = $state.raw<ReturnType<RepresentationExperiment['transferData']>>(null);
	let transferHistory = $state.raw<{ step: number; scratch: number; reused: number }[]>([]);
	let previouslyRevealed = $state(false);
	let exposure = $state.raw<{ source: FinalExposure; target: FinalExposure } | null>(null);
	let exposureBeforeReveal = $state.raw<{
		source: FinalExposure | null;
		target: FinalExposure | null;
	}>({ source: null, target: null });
	const percent = (n: number) => `${(n * 100).toFixed(1)}%`;
	const historyMax = $derived(
		Math.max(0.8, ...transferHistory.flatMap((row) => [row.scratch, row.reused])) * 1.1
	);
	function lossLine(key: 'scratch' | 'reused') {
		return transferHistory
			.map(
				(row, i) =>
					`${i ? 'L' : 'M'}${45 + (row.step / Math.max(20, transfer?.step ?? 0)) * 510},${175 - (row[key] / historyMax) * 145}`
			)
			.join(' ');
	}
	function refresh() {
		if (!engine) return;
		metrics = engine.metrics();
		activations = engine.activations();
		data = engine.data.validation;
		frozen = engine.isFrozen;
		surfaces = CANDIDATES.map(({ id }) => ({
			id,
			cells: Array.from({ length: 20 * 20 }, (_, i) => ({
				x: i % 20,
				y: Math.floor(i / 20),
				score: engine!.predict(id, [((i % 20) + 0.5) / 10 - 1, (Math.floor(i / 20) + 0.5) / 10 - 1])
			}))
		}));
		tree = JSON.stringify(engine.treeStructure, null, 2);
	}
	function refreshTransfer() {
		if (!engine) return;
		transfer = engine.transferMetrics();
		targetRows = engine.transferData();
		frozen = engine.isFrozen;
		if (transfer)
			transferHistory = [
				...transferHistory,
				{
					step: transfer.step,
					scratch: transfer.scratch.validation.loss,
					reused: transfer.reused.validation.loss
				}
			];
	}
	function pause(announce = true) {
		runId++;
		clearTimeout(timer);
		running = false;
		if (announce) status = 'Paused. All fitted values are retained.';
	}
	function reset() {
		pause(false);
		try {
			if (final || transferFinal) previouslyRevealed = true;
			engine = new RepresentationExperiment(seed);
			activeSeed = seed;
			exposure = {
				source: readFinalExposure(REPRESENTATION_PROVENANCE.version, seed, 'source'),
				target: readFinalExposure(REPRESENTATION_PROVENANCE.version, seed, 'target')
			};
			exposureBeforeReveal = { source: null, target: null };
			previouslyRevealed ||=
				exposure.source.state === 'recorded' || exposure.target.state === 'recorded';
			final = null;
			transfer = null;
			transferFinal = null;
			transferHistory = [];
			targetRows = null;
			error = '';
			refresh();
			status =
				'Source models initialized. Logistic and neural weights are random; the tree is not fitted yet.';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not reset.';
		}
	}
	function run(mode: 'source' | 'target', count: number) {
		if (!engine || running) return;
		const token = ++runId;
		running = true;
		error = '';
		const start = mode === 'source' ? engine.step : transfer!.step;
		const end = Math.min(start + count, mode === 'source' ? 1000 : 400);
		status =
			mode === 'source'
				? 'Fitting all source candidates on the same training minibatches…'
				: 'Updating scratch and reused networks on the identical target minibatches…';
		const chunk = () => {
			if (token !== runId || !engine) return;
			try {
				const step = mode === 'source' ? engine.step : engine.transferMetrics()!.step;
				const n = Math.min(10, end - step);
				if (mode === 'source') {
					engine.train(n);
					refresh();
				} else {
					engine.trainTransfer(n);
					refreshTransfer();
				}
				if (step + n < end) timer = setTimeout(chunk, 25);
				else {
					running = false;
					status = `Finished ${end} ${mode} updates. Compare the measured validation evidence.`;
				}
			} catch (reason) {
				pause(false);
				error = reason instanceof Error ? reason.message : 'Training stopped.';
			}
		};
		timer = setTimeout(chunk, 0);
	}
	function commit() {
		if (!engine) return;
		pause(false);
		exposureBeforeReveal = {
			...exposureBeforeReveal,
			source: readFinalExposure(REPRESENTATION_PROVENANCE.version, activeSeed, 'source')
		};
		previouslyRevealed ||= exposureBeforeReveal.source?.state === 'recorded';
		final = engine.commit(selected);
		exposure = {
			source: markFinalExposure(REPRESENTATION_PROVENANCE.version, activeSeed, 'source'),
			target: readFinalExposure(REPRESENTATION_PROVENANCE.version, activeSeed, 'target')
		};
		frozen = true;
		status = `Committed ${CANDIDATES.find((c) => c.id === final!.selected)!.name} before revealing source final results.`;
	}
	function startTransfer() {
		if (!engine) return;
		try {
			engine.startTransfer(targetCount, domain);
			refreshTransfer();
			status = `Captured the source network at update ${engine.step}. Both target procedures start with fresh optimizer state.`;
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Transfer could not start.';
		}
	}
	function commitTransfer() {
		if (!engine) return;
		pause(false);
		exposureBeforeReveal = {
			...exposureBeforeReveal,
			target: readFinalExposure(REPRESENTATION_PROVENANCE.version, activeSeed, 'target')
		};
		previouslyRevealed ||= exposureBeforeReveal.target?.state === 'recorded';
		transferFinal = engine.commitTransfer();
		exposure = {
			source: readFinalExposure(REPRESENTATION_PROVENANCE.version, activeSeed, 'source'),
			target: markFinalExposure(REPRESENTATION_PROVENANCE.version, activeSeed, 'target')
		};
		status =
			'Both target procedures are frozen. Their separate final-case results are now visible.';
	}
	function save() {
		if (!engine) return;
		const result = {
			provenance: REPRESENTATION_PROVENANCE,
			finalExposure: exposure,
			exposureBeforeReveal,
			priorFinalCasesKnown: previouslyRevealed,
			seed: activeSeed,
			metrics,
			final,
			activations,
			sourceWeights: engine.weights(),
			transferWeights: engine.transferWeights(),
			transfer,
			transferFinal,
			transferHistory,
			targetRows
		};
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
		);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'representation-comparison.json';
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
	<header class="lab-cover">
		<span class="lab-eyebrow"
			><Icon name="layers" size={16} />REPRESENTATIONS · MEASURED, NOT HAND ARRANGED</span
		>
		<h2>Different ways to see the same data.</h2>
		<p>
			Compare a raw baseline, an engineered interaction, a tree and a neural network. Then find out
			whether a learned starting point helps a new task with few labels.
		</p>
		<div class="mini-tags">
			<span>128 source training records</span><span>96 validation records</span><span
				>192 sealed final records</span
			><span>Original synthetic domains</span>
		</div>
	</header>
	<p class="lab-note">
		Here, x and y are dimensionless abstract inputs. Category A occupies two opposite corners of a
		four-corner pattern, with 3% random label flips. This makes an interaction visible; it is not an
		accounting category rule or a fraud model.
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
		>
		<div class="lab-actions">
			<button
				class="primary"
				onclick={() => run('source', 200)}
				disabled={!metrics || running || frozen || metrics.step >= 1000}
				><Icon name="play" size={15} />Fit 200 updates</button
			><button onclick={() => pause()} disabled={!running}
				><Icon name="pause" size={15} />Pause</button
			><button onclick={reset}
				><Icon name="reset" size={15} />{seed !== activeSeed
					? 'Apply seed & reset'
					: 'Reset experiment'}</button
			><button onclick={save} disabled={!metrics}
				><Icon name="download" size={15} />Save evidence</button
			>
		</div>
	</div>
	{#if seed !== activeSeed}<p class="caption">
			The pending seed applies on reset. This run still uses seed {activeSeed}.
		</p>{/if}
	<p class="lab-status" role="status">{status}</p>
	{#if error}<p class="lab-error" role="alert">{error}</p>{/if}{#if previouslyRevealed}<p
			class="lab-note"
		>
			You have viewed final cases. Using their results to choose another run turns those cases into
			development evidence; resetting does not undo that exposure.
		</p>{/if}
	{#if exposure?.source.state === 'unavailable' || exposure?.target.state === 'unavailable'}<p
			class="lab-note"
		>
			Earlier final-case reveals cannot be verified in browser storage. Prior exposure is unknown;
			save your evidence and do not claim a fresh independent test.
		</p>{/if}
	{#if metrics}
		<div class="lab-grid four">
			{#each metrics.candidates as candidate, i (candidate.id)}<section class="plot-card">
					<span class="source-tag"
						>{candidate.id === 'tree'
							? metrics.treeFitted
								? 'TREE FIT COMPLETE'
								: 'TREE NOT FITTED'
							: `${metrics.step} GRADIENT UPDATES`}</span
					>
					<h4>{candidate.name}</h4>
					<svg viewBox="0 0 280 265" role="img" aria-labelledby={`${id}-${candidate.id}`}
						><title id={`${id}-${candidate.id}`}
							>{candidate.name} decision scores on the same source input space. Validation accuracy {percent(
								candidate.validation.accuracy
							)}.</title
						>{#each surfaces[i].cells as cell, j (j)}<rect
								x={28 + cell.x * 11.5}
								y={239 - (cell.y + 1) * 10.5}
								width="11.7"
								height="10.7"
								fill={`hsl(${40 + cell.score * 115} 28% ${96 - cell.score * 28}%)`}
							/>{/each}{#each data as point (point.id)}<circle
								cx={28 + (point.input[0] + 1) * 115}
								cy={239 - (point.input[1] + 1) * 105}
								r="2.4"
								fill={point.label ? '#225a41' : '#fff9ed'}
								stroke={point.label ? '#225a41' : '#967648'}
								stroke-width="1"
							/>{/each}<text x="28" y="254">x = −1</text><text x="258" y="254" text-anchor="end"
							>x = +1</text
						><text x="28" y="18">y: −1 to +1 ↑</text></svg
					>
					<div class="plot-score">
						<span>Validation accuracy</span><strong>{percent(candidate.validation.accuracy)}</strong
						>
					</div>
					<p>Loss {candidate.validation.loss.toFixed(3)}</p>
				</section>{/each}
		</div>
		<div class="chart-legend">
			<span><b>●</b>Category A</span><span><b>○</b>Category B</span><span
				>Background: pale = score 0 · green = score 1</span
			>
		</div>
		<!-- Keyboard users need focus here to scroll the evidence table. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="table-scroll"
			tabindex="0"
			role="region"
			aria-label="Source model validation measurements"
		>
			<table>
				<caption
					>Same allowed raw inputs, training records and evaluation cases. The engineered candidate
					also receives a deliberately designed x × y interaction.</caption
				><thead
					><tr
						><th scope="col">Procedure</th><th scope="col">Training loss</th><th scope="col"
							>Validation loss</th
						><th scope="col">Validation accuracy</th></tr
					></thead
				><tbody
					>{#each metrics.candidates as candidate (candidate.id)}<tr
							><th scope="row">{candidate.name}</th><td>{candidate.train.loss.toFixed(4)}</td><td
								>{candidate.validation.loss.toFixed(4)}</td
							><td>{percent(candidate.validation.accuracy)}</td></tr
						>{/each}</tbody
				>
			</table>
		</div>
		<details>
			<summary>What does each model receive and learn?</summary
			>{#each CANDIDATES as candidate (candidate.id)}<p>
					<strong>{candidate.name}.</strong>
					{candidate.description}
				</p>{/each}
			<p>
				The engineered feature uses knowledge of a useful interaction. An improvement therefore
				compares complete procedures, not architecture alone. Each gradient update gives all three
				differentiable candidates the same 32-record minibatch. The tree is fitted once from all 128
				source training records; its fit is not measured in gradient updates.
			</p>
			{#if metrics.treeFitted}<p>
					The actual fitted tree below shows feature indices 0 = x and 1 = y, thresholds, record
					counts and smoothed leaf probabilities.
				</p>
				<pre class="tree-json">{tree}</pre>{/if}
		</details>
		<section class="lab-panel">
			<div class="panel-top">
				<div>
					<h3>A learned representation is an actual intermediate value.</h3>
					<p>
						These are the neural network’s validation records, displayed using two of its eight
						hidden activations.
					</p>
				</div>
			</div>
			<div class="two-figures">
				<div>
					<svg
						class="activation-chart"
						viewBox="0 0 330 280"
						role="img"
						aria-labelledby={`${id}-hidden`}
						><title id={`${id}-hidden`}
							>Coordinate projection of learned hidden units {axisA + 1} and {axisB + 1}. It omits
							the other six activation dimensions.</title
						><rect x="42" y="24" width="260" height="220" fill="#f0edf5" rx="10" /><line
							x1="172"
							x2="172"
							y1="24"
							y2="244"
							stroke="#d9d1e0"
						/><line
							x1="42"
							x2="302"
							y1="134"
							y2="134"
							stroke="#d9d1e0"
						/>{#each activations as point (point.id)}<circle
								cx={42 + (point.values[axisA] + 1) * 130}
								cy={244 - (point.values[axisB] + 1) * 110}
								r="3.3"
								fill={point.label ? '#755792' : '#eef1d9'}
								stroke={point.label ? '#64457e' : '#768853'}
								stroke-width="1"
							/>{/each}<text x="42" y="262">Hidden {axisA + 1}: −1 to +1 →</text><text x="43" y="16"
							>Hidden {axisB + 1} ↑</text
						></svg
					>
					<div class="inline-selects">
						<label
							>Horizontal unit<select
								value={axisA}
								onchange={(e) => {
									axisA = Number(e.currentTarget.value);
									if (axisA === axisB) axisB = (axisA + 1) % 8;
								}}
								>{#each Array.from({ length: 8 }, (_, i) => i) as index (index)}<option
										value={index}>Hidden {index + 1}</option
									>{/each}</select
							></label
						><label
							>Vertical unit<select
								value={axisB}
								onchange={(e) => {
									axisB = Number(e.currentTarget.value);
									if (axisB === axisA) axisA = (axisB + 1) % 8;
								}}
								>{#each Array.from({ length: 8 }, (_, i) => i) as index (index)}<option
										value={index}>Hidden {index + 1}</option
									>{/each}</select
							></label
						>
					</div>
				</div>
				<div class="definition-box">
					<h4>The picture is a projection, not the whole representation.</h4>
					<p>
						The plotted coordinates are two actual hidden-unit values, with no hand placement and no
						PCA. Changing the chosen units changes the picture while keeping all model parameters
						fixed.
					</p>
					<p>
						Records that appear close in these two coordinates may differ in the six omitted
						dimensions. This view does not calculate full-space nearest neighbors or prove
						accounting categories. The output uses all eight hidden values.
					</p>
					<p>
						Before fitting, these are random transformations. After fitting, they have been adjusted
						to help the training objective. Useful features do not have to acquire neat human names.
					</p>
				</div>
			</div>
			<details>
				<summary>Read all eight hidden activations for every plotted record</summary>
				<!-- Keyboard users need focus here to scroll the evidence table. -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="table-scroll"
					tabindex="0"
					role="region"
					aria-label="All hidden activation values"
				>
					<table>
						<caption>Actual validation forward passes at source update {metrics.step}</caption
						><thead
							><tr
								><th scope="col">Record</th><th scope="col">Category</th><th scope="col">x</th><th
									scope="col">y</th
								>{#each Array.from({ length: 8 }, (_, i) => i) as h (h)}<th scope="col"
										>Hidden {h + 1}</th
									>{/each}</tr
							></thead
						><tbody
							>{#each activations as point (point.id)}<tr
									><th scope="row">{point.id}</th><td>{point.label ? 'A' : 'B'}</td><td
										>{point.input[0].toFixed(3)}</td
									><td>{point.input[1].toFixed(3)}</td>{#each point.values as value, h (h)}<td
											>{value.toFixed(4)}</td
										>{/each}</tr
								>{/each}</tbody
						>
					</table>
				</div>
			</details>
		</section>
		<section class="commit-panel">
			<Icon name="shield" size={25} />
			<div>
				<h3>
					{final
						? 'Source comparison committed.'
						: 'Choose using validation, then reveal the final comparison.'}
				</h3>
				{#if final}<p>
						Your declared choice was <strong
							>{CANDIDATES.find((c) => c.id === final!.selected)?.name}</strong
						>
						at update {final.step}. The 192 final records give it accuracy
						<strong>{percent(final.scores[final.selected].accuracy)}</strong>
						and loss <strong>{final.scores[final.selected].loss.toFixed(3)}</strong>.
					</p>
					<!-- Keyboard users need focus here to scroll the evidence table. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="table-scroll"
						tabindex="0"
						role="region"
						aria-label="Committed source final results"
					>
						<table>
							<caption
								>Post-commitment results for all frozen procedures. Do not relabel a new winner as
								your predeclared choice.</caption
							><thead
								><tr
									><th scope="col">Procedure</th><th scope="col">Final accuracy</th><th scope="col"
										>Final loss</th
									></tr
								></thead
							><tbody
								>{#each CANDIDATES as candidate (candidate.id)}<tr
										><th scope="row">{candidate.name}</th><td
											>{percent(final.scores[candidate.id].accuracy)}</td
										><td>{final.scores[candidate.id].loss.toFixed(3)}</td></tr
									>{/each}</tbody
							>
						</table>
					</div>{:else}<p>
						Commit your selected procedure before viewing final cases. You can still use the trained
						neural network for the separate target-domain experiment below.
					</p>
					<div class="lab-fields">
						<label
							>Declared candidate<select bind:value={selected}
								>{#each CANDIDATES as candidate (candidate.id)}<option value={candidate.id}
										>{candidate.name}</option
									>{/each}</select
							></label
						><button onclick={commit} disabled={running || metrics.step === 0}
							>Commit & reveal source test</button
						>
					</div>{/if}
			</div>
		</section>
		<section class="lab-panel">
			<div class="panel-top">
				<div>
					<span class="source-tag">TRANSFER LEARNING</span>
					<h3>Does an experienced starting point help?</h3>
					<p>
						Compare two identical neural architectures with the same limited target labels. One
						begins at random; one reuses the actual source-trained weights above.
					</p>
				</div>
			</div>
			{#if !transfer}<div class="lab-fields">
					<label
						>Target labeled records<select bind:value={targetCount}
							><option value={16}>16 records</option><option value={24}>24 records</option><option
								value={48}>48 records</option
							><option value={96}>96 records</option></select
						></label
					><label
						>Target relationship<select bind:value={domain}
							><option value="related">Rotated inputs · related target</option><option
								value="reversed">Rotated inputs · reversed labels</option
							></select
						></label
					><button class="primary" onclick={startTransfer} disabled={running || metrics.step === 0}
						>Capture source & begin comparison</button
					>
				</div>
				<p class="caption">
					Capturing fixes the source starting point for this comparison and stops further source
					updates. Both target optimizers are new; reused weights are the only different
					initialization.
				</p>{:else}<p class="lab-note">
					Source exposure: {transfer.sourceCount} labeled records and {transfer.sourceStep} updates. Target
					exposure: the same {transfer.targetCount} labeled records for both procedures. Target domain:
					{transfer.domain === 'related'
						? 'rotated inputs with a related label rule'
						: 'rotated inputs with reversed labels'}. All neural weights are fine-tuned; this is not
					a frozen-feature experiment.
				</p>
				<div class="lab-actions" style="margin:18px 0">
					<button
						class="primary"
						onclick={() => run('target', 100)}
						disabled={running || !!transferFinal || transfer.step >= 400}
						>Adapt both for 100 updates</button
					><button onclick={() => pause()} disabled={!running}>Pause adaptation</button><button
						onclick={commitTransfer}
						disabled={running || !!transferFinal || transfer.step === 0}
						>Freeze both & reveal target test</button
					>
				</div>
				<div class="lab-grid">
					<div class="transfer-card">
						<span class="source-tag">RANDOM INITIALIZATION</span>
						<h4>Train from scratch</h4>
						<strong>{percent(transfer.scratch.validation.accuracy)}</strong><small
							>Target validation accuracy</small
						>
						<p>
							Validation loss {transfer.scratch.validation.loss.toFixed(3)} · training loss {transfer.scratch.train.loss.toFixed(
								3
							)}
						</p>
					</div>
					<div class="transfer-card">
						<span class="source-tag">REUSED SOURCE WEIGHTS</span>
						<h4>Transfer & fine-tune</h4>
						<strong>{percent(transfer.reused.validation.accuracy)}</strong><small
							>Target validation accuracy</small
						>
						<p>
							Validation loss {transfer.reused.validation.loss.toFixed(3)} · training loss {transfer.reused.train.loss.toFixed(
								3
							)}
						</p>
					</div>
				</div>
				<svg
					class="loss-svg"
					viewBox="0 0 590 210"
					role="img"
					aria-label={`Target validation loss after ${transfer.step} updates: scratch ${transfer.scratch.validation.loss.toFixed(3)}, reused ${transfer.reused.validation.loss.toFixed(3)}.`}
					>{#each [0, 1, 2, 3] as tick (tick)}<line
							x1="45"
							x2="555"
							y1={175 - (tick / 3) * 145}
							y2={175 - (tick / 3) * 145}
							stroke="#e5e5df"
						/><text x="38" y={179 - (tick / 3) * 145} text-anchor="end"
							>{((tick / 3) * historyMax).toFixed(2)}</text
						>{/each}<path
						d={lossLine('scratch')}
						fill="none"
						stroke="#2b7155"
						stroke-width="3"
					/><path
						d={lossLine('reused')}
						fill="none"
						stroke="#8462a6"
						stroke-width="3"
						stroke-dasharray="7 4"
					/><text x="45" y="199">0</text><text x="555" y="199" text-anchor="end"
						>{Math.max(20, transfer.step)} target updates</text
					></svg
				>
				<div class="chart-legend">
					<span><i class="marker"></i>Scratch</span><span
						><i class="marker purple"></i>Reused weights</span
					>
				</div>
				{#if transferFinal}<div class="definition-box">
						<h4>Independent target cases, now revealed</h4>
						<p>
							On the same 192 final target cases: scratch accuracy {percent(
								transferFinal.scratch.accuracy
							)}, loss {transferFinal.scratch.loss.toFixed(3)}; reused accuracy {percent(
								transferFinal.reused.accuracy
							)}, loss {transferFinal.reused.loss.toFixed(3)}. Both procedures are frozen. A result
							here describes this data, seed and adaptation budget; it is not a general promise
							about transfer learning.
						</p>
					</div>{/if}
				<details style="margin-top:18px">
					<summary>Check target records and measured loss checkpoints</summary>
					<!-- Keyboard users need focus here to scroll the evidence table. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="table-scroll"
						tabindex="0"
						role="region"
						aria-label="Transfer validation loss history"
					>
						<table>
							<caption
								>Target validation loss history · identical target minibatches at each update</caption
							><thead
								><tr
									><th scope="col">Update</th><th scope="col">Scratch loss</th><th scope="col"
										>Reused loss</th
									></tr
								></thead
							><tbody
								>{#each transferHistory as row, i (i)}<tr
										><th scope="row">{row.step}</th><td>{row.scratch.toFixed(5)}</td><td
											>{row.reused.toFixed(5)}</td
										></tr
									>{/each}</tbody
							>
						</table>
					</div>
					<!-- Keyboard users need focus here to scroll the evidence table. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div class="table-scroll" tabindex="0" role="region" aria-label="Target training records">
						<table>
							<caption>Target labels available to both optimizers</caption><thead
								><tr
									><th scope="col">Record</th><th scope="col">x</th><th scope="col">y</th><th
										scope="col">Category</th
									></tr
								></thead
							><tbody
								>{#each targetRows?.train ?? [] as row (row.id)}<tr
										><th scope="row">{row.id}</th><td>{row.input[0].toFixed(4)}</td><td
											>{row.input[1].toFixed(4)}</td
										><td>{row.label ? 'A' : 'B'}</td></tr
									>{/each}</tbody
							>
						</table>
					</div>
				</details>{/if}
		</section>
	{/if}
	<details class="provenance-panel">
		<summary>Dataset, model choices and interpretation limits</summary>
		<p>{REPRESENTATION_PROVENANCE.rule} {REPRESENTATION_PROVENANCE.limits}</p>
		<p>
			The three gradient-trained models use Adam with learning rate 0.025 and weight-only L2
			strength 0.001. Source and target evaluation records use separate random streams and never
			supply gradients. Target training count changes leave target validation and final records
			fixed. Model comparisons are deterministic for the declared seed and update counts, but a
			single seed does not establish a stable ranking.
		</p>
		<p>
			Transfer starts from the actual eight-unit network above, copying weights but resetting
			optimizer moments. All weights are adapted. Both procedures get identical target minibatches
			and update counts, but only transfer has prior source exposure. Inputs are abstract
			coordinates with no currency or predictive business meaning. Save the JSON evidence before
			navigation; experiments run locally and are not persisted automatically.
		</p>
	</details>
</div>
