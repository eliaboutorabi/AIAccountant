<script lang="ts">
	import ChartViewport from './ChartViewport.svelte';
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		BookOpen,
		Brain,
		Download,
		LockKeyhole,
		Pause,
		Calculator,
		RotateCcw,
		SlidersHorizontal
	} from '@lucide/svelte';
	import {
		AdaptationExperiment,
		ADAPTATION_PROVENANCE,
		scoreRewardProxy
	} from '$lib/engines/adaptation';
	import { GENERAL_CORPUS, FINANCE_CORPUS } from '$lib/engines/finance-corpus';
	import {
		readFinalExposure,
		markFinalExposure,
		type FinalExposure
	} from '$lib/engines/final-exposure';
	const uid = $props.id();
	let experiment: AdaptationExperiment | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let runIdentity = 0;
	let seed = $state(42),
		rate = $state(0.004),
		chunkSize = $state(50);
	let running = $state(false),
		message = $state('Preparing the same small transformer used in the neural-language-model lab.');
	let report = $state.raw<ReturnType<AdaptationExperiment['report']> | null>(null);
	let rationale = $state(''),
		reflection = $state(''),
		hasRevealed = $state(false);
	let priorExposure = $state.raw<{ general: FinalExposure; finance: FinalExposure } | null>(null);
	let exposureUnknown = $state(false);
	function readExposure() {
		const data = {
			general: readFinalExposure(GENERAL_CORPUS.version, 'fixed'),
			finance: readFinalExposure(FINANCE_CORPUS.version, 'fixed')
		};
		hasRevealed ||= data.general.state === 'recorded' || data.finance.state === 'recorded';
		exposureUnknown = data.general.state === 'unavailable' || data.finance.state === 'unavailable';
		return data;
	}
	let prompt = $state('cash '),
		generated = $state('');
	let confidenceWeight = $state(1),
		groundingWeight = $state(1);
	const rewards = $derived(scoreRewardProxy(confidenceWeight, groundingWeight));
	const bestReward = $derived(Math.max(...rewards.map((row) => row.score)));
	const pending = $derived(
		report && (report.config.seed !== seed || report.config.learningRate !== rate)
	);
	const chartMax = $derived(
		Math.max(1, ...(report?.history.flatMap((p) => [p.general, p.finance]) ?? [])) * 1.08
	);
	const chartSteps = $derived(Math.max(20, report?.step ?? 0));
	const currentStageSteps = $derived(
		report?.phase === 'general' ? report.generalSteps : (report?.financeSteps ?? 0)
	);
	const format = (n: number) => n.toFixed(3);
	const delta = (now: number, before: number) =>
		`${now >= before ? '+' : ''}${(now - before).toFixed(3)}`;
	function line(domain: 'general' | 'finance') {
		return (report?.history ?? [])
			.map(
				(p, i) =>
					`${i ? 'L' : 'M'}${48 + (p.step / chartSteps) * 610},${244 - (p[domain] / chartMax) * 208}`
			)
			.join(' ');
	}
	function refresh() {
		if (experiment) {
			experiment.measure();
			report = experiment.report();
		}
	}
	function pause(announce = true) {
		runIdentity++;
		clearTimeout(timer);
		running = false;
		if (announce && experiment && report?.step !== experiment.model.step) refresh();
		if (announce && experiment)
			message = `Paused at update ${experiment.model.step}. Current weights and Adam state are retained.`;
	}
	function reset() {
		pause(false);
		try {
			experiment = new AdaptationExperiment(seed, rate);
			report = experiment.report();
			generated = '';
			priorExposure = readExposure();
			rationale = '';
			message = 'Fresh random parameters. Both validation domains are scored before any training.';
		} catch (error) {
			message = error instanceof Error ? error.message : String(error);
		}
	}
	function train() {
		if (!experiment || running || report?.phase === 'committed' || pending) return;
		const token = ++runIdentity;
		const target = experiment.model.step + Math.min(chunkSize, 500 - currentStageSteps);
		running = true;
		generated = '';
		message = `Updating weights on ${experiment.model.trainingDomain} training sentences. Validation sentences do not enter these updates.`;
		const work = () => {
			if (token !== runIdentity || !experiment) return;
			try {
				experiment.train(Math.min(5, target - experiment.model.step));
				if (experiment.model.step % 10 === 0 || experiment.model.step === target) refresh();
				if (experiment.model.step < target) timer = setTimeout(work, 15);
				else {
					running = false;
					message =
						'Training chunk complete. Compare both measured validation losses before deciding what to do next.';
				}
			} catch (error) {
				running = false;
				message = error instanceof Error ? error.message : String(error);
				refresh();
			}
		};
		timer = setTimeout(work, 0);
	}
	function adapt() {
		if (!experiment || running) return;
		try {
			experiment.beginFinance();
			report = experiment.report();
			generated = '';
			message =
				'Training documents changed to finance. All weights, optimizer moments, and training step were retained. Switching alone did not improve a score.';
		} catch (error) {
			message = error instanceof Error ? error.message : String(error);
		}
	}
	function commit() {
		if (!experiment || running) return;
		try {
			priorExposure = readExposure();
			experiment.commit(rationale);
			report = experiment.report();
			hasRevealed = true;
			const marked = [
				markFinalExposure(GENERAL_CORPUS.version, 'fixed'),
				markFinalExposure(FINANCE_CORPUS.version, 'fixed')
			];
			exposureUnknown = marked.some((record) => record.state === 'unavailable');
			try {
				localStorage.setItem('willow-adaptation-final-consulted-v1', 'yes');
			} catch {
				/* Session evidence remains available when storage is unavailable. */
			}
			message =
				'Committed weights are frozen. Both separate final sets are now scored. A later reset is development work on consulted examples.';
		} catch (error) {
			message = error instanceof Error ? error.message : String(error);
		}
	}
	function generate() {
		if (!experiment || running) return;
		generated = experiment.model.generate(prompt, { tokens: 48, temperature: 0.8, seed: 31 }).text;
	}
	function download() {
		if (!experiment) return;
		const blob = new Blob(
			[
				JSON.stringify(
					{
						...experiment.report(),
						rationale,
						reflection,
						generated,
						hasRevealed,
						priorExposure,
						exposureUnknown,
						rewardIllustration: {
							kind: 'Authored score selection; no RL training',
							confidenceWeight,
							groundingWeight,
							scores: rewards
						}
					},
					null,
					2
				)
			],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'willow-general-finance-adaptation.json';
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
	onMount(() => {
		try {
			hasRevealed = localStorage.getItem('willow-adaptation-final-consulted-v1') === 'yes';
			if (hasRevealed) {
				if (readFinalExposure(GENERAL_CORPUS.version, 'fixed').state === 'not-recorded')
					markFinalExposure(GENERAL_CORPUS.version, 'fixed');
				if (readFinalExposure(FINANCE_CORPUS.version, 'fixed').state === 'not-recorded')
					markFinalExposure(FINANCE_CORPUS.version, 'fixed');
			}
		} catch {
			/* Device storage is optional. */
		}
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

<section class="adaptation" aria-labelledby={uid + '-title'}>
	<header>
		<div class="eyebrow"><Brain size={17} /> Actual CPU training · M13</div>
		<h2 id={uid + '-title'}>Keep the weights. Change the reading.</h2>
		<p>
			Train a tiny character transformer on general sentences, then continue training the same model
			on finance sentences. Measure what changed in <strong>both</strong> domains. This is a small, real
			example of domain adaptation.
		</p>
		<span class="badge">No API key · no download · no scripted loss curves</span>
	</header>
	<div class="settings">
		<label
			>Initialization seed<input
				type="number"
				bind:value={seed}
				min="1"
				max="999999"
				step="1"
				disabled={running}
			/></label
		><label
			>Learning rate<select bind:value={rate} disabled={running}
				><option value={0.002}>0.002 · gentler</option><option value={0.004}>0.004 · default</option
				><option value={0.008}>0.008 · larger steps</option></select
			></label
		><button class="secondary" onclick={reset} disabled={running}
			><RotateCcw size={16} />Fresh development run</button
		>
	</div>
	{#if pending}<p class="notice">
			Pending seed or rate. Start a fresh run to apply these settings; displayed results still use
			the current configuration.
		</p>{/if}
	{#if hasRevealed}<p class="notice">
			At least one final set has been consulted on this device. Scores on those examples are
			development evidence, even with a different seed. This history is shared with the
			language-model lab.
		</p>{/if}
	{#if exposureUnknown}<p class="notice">
			Prior final-set exposure cannot be verified because device storage is unavailable or
			unreadable. Export the evidence; this run makes no unseen-case claim.
		</p>{/if}
	{#if report}
		<div class="stage-flow">
			<article class:active={report.phase === 'general'}>
				<BookOpen size={22} /><small>01 / GENERAL LANGUAGE</small>
				<h3>Learn recurring character patterns</h3>
				<p>
					{GENERAL_CORPUS.train.length} original training sentences · {report.generalSteps} actual updates
				</p>
			</article>
			<div class="transfer">
				<ArrowRight size={24} /><span
					>{report.parameters.toLocaleString()} parameters<br />retained across the switch</span
				>
			</div>
			<article class:active={report.phase === 'finance'}>
				<Brain size={22} /><small>02 / FINANCE LANGUAGE</small>
				<h3>Continue from learned weights</h3>
				<p>
					{FINANCE_CORPUS.train.length} original training sentences · {report.financeSteps} actual updates
				</p>
			</article>
		</div>
		<div class="controls">
			<label
				>Updates in this chunk<select bind:value={chunkSize} disabled={running}
					><option value={20}>20</option><option value={50}>50</option><option value={100}
						>100</option
					></select
				></label
			><button
				class="primary"
				onclick={train}
				disabled={running || !!pending || report.phase === 'committed' || currentStageSteps >= 500}
				><Calculator size={16} />Train {report.phase === 'general' ? 'general' : 'finance'} stage</button
			><button class="secondary" onclick={() => pause()} disabled={!running}
				><Pause size={16} />Pause</button
			><button
				class="transition"
				onclick={adapt}
				disabled={running || !!pending || report.phase !== 'general' || report.generalSteps < 20}
				><ArrowRight size={16} />Keep weights → switch to finance</button
			>
		</div>
		<p class="hint inset">
			Train at least 20 general updates before switching. Each stage is bounded to 500 updates.
			Continuing the same Adam optimizer is part of this experiment’s declared setup; it is not the
			only possible fine-tuning recipe.
		</p>
		<p class="status" role="status">{message}</p>
		<div class="chart-panel">
			<div class="chart-heading">
				<div>
					<h3>Two held-out domains, one changing model</h3>
					<p>Lower next-character loss is better. Every point is measured from actual weights.</p>
				</div>
				<div class="legend">
					<span class="general">General validation</span><span class="finance"
						>Finance validation</span
					>
				</div>
			</div>
			<ChartViewport label="General and finance validation chart" minimum={600}>
				<svg
					viewBox="0 0 700 280"
					role="img"
					aria-labelledby={uid + '-chart-title ' + uid + '-chart-desc'}
					><title id={uid + '-chart-title'}
						>General and finance validation loss over actual training updates</title
					><desc id={uid + '-chart-desc'}
						>The table below provides current and pre-adaptation values. Vertical dashed line marks
						the switch to finance training. Curves connect measured checkpoints; no outcome is
						guaranteed.</desc
					>{#each [0, 1, 2, 3, 4] as tick (tick)}<line
							x1="48"
							y1={244 - (tick / 4) * 208}
							x2="658"
							y2={244 - (tick / 4) * 208}
							stroke="#dce5dc"
						/><text x="38" y={248 - (tick / 4) * 208} text-anchor="end"
							>{((chartMax * tick) / 4).toFixed(1)}</text
						>{/each}{#if report.before}<line
							x1={48 + (report.before.step / chartSteps) * 610}
							y1="26"
							x2={48 + (report.before.step / chartSteps) * 610}
							y2="244"
							stroke="#977333"
							stroke-dasharray="5 5"
						/>{/if}<path d={line('general')} fill="none" stroke="#356546" stroke-width="3" /><path
						d={line('finance')}
						fill="none"
						stroke="#78579d"
						stroke-width="3"
					/>{#each report.history as point, i (i)}<circle
							cx={48 + (point.step / chartSteps) * 610}
							cy={244 - (point.general / chartMax) * 208}
							r="3"
							fill="#356546"
						/><circle
							cx={48 + (point.step / chartSteps) * 610}
							cy={244 - (point.finance / chartMax) * 208}
							r="3"
							fill="#78579d"
						/>{/each}<text x="48" y="267">0 updates</text><text x="658" y="267" text-anchor="end"
						>{chartSteps} updates</text
					></svg
				>
			</ChartViewport>
			<div class="score-grid">
				{#each ['general', 'finance'] as domain (domain)}{@const key = domain as
						'general' | 'finance'}
					<article>
						<small
							>{domain === 'general' ? 'General-language' : 'Finance-language'} validation</small
						><strong>{format(report.current[key].loss)}</strong><span
							>{report.current[key].documents} held-out sentences · {report.current[key]
								.targetTokens} target characters</span
						>{#if report.before}<p>
								Before adaptation: {format(report.before.scores[key].loss)}<br /><b
									class:worse={report.current[key].loss > report.before.scores[key].loss}
									>Change: {delta(report.current[key].loss, report.before.scores[key].loss)}</b
								>
							</p>{:else}<p>Initial random model: {format(report.initial[key].loss)}</p>{/if}
					</article>{/each}
			</div>
			<details class="measurement-table">
				<summary>Inspect every measured checkpoint</summary>
				<table>
					<caption>Validation loss by domain and update</caption><thead
						><tr
							><th scope="col">Update</th><th scope="col">Training</th><th scope="col">General</th
							><th scope="col">Finance</th></tr
						></thead
					><tbody
						>{#each report.history as point, i (i)}<tr
								><td>{point.step}</td><td>{point.phase}</td><td>{format(point.general)}</td><td
									>{format(point.finance)}</td
								></tr
							>{/each}</tbody
					>
				</table>
			</details>
			<p class="hint">
				These are repeatedly inspected <strong>validation</strong> sets, separate from training sentences.
				The prediction loss penalizes assigning little probability to the character that actually follows.
				It measures character prediction, not factual accuracy, accounting judgment, or interview readiness.
			</p>
		</div>
		<article class="interpret">
			<h3>What would count as forgetting?</h3>
			<p>
				Compare the general validation loss immediately before the switch with the current general
				loss. If it rises after finance updates, the model predicts these general examples less
				well: evidence of a performance trade-off in this run. If both losses fall, report that
				instead. Adaptation can help both domains, and this small corpus does not guarantee
				catastrophic forgetting.
			</p>
			<p>
				Finance improvement alone is insufficient for release. A practical review also checks
				general instructions, finance tasks, evidence handling, and relevant failures on
				appropriately withheld examples. This character model has none of those broader
				qualifications.
			</p>
		</article>
		<details class="corpus">
			<summary>Inspect the original training and validation sentences</summary>
			<div class="corpus-grid">
				{#each [{ label: 'General', data: GENERAL_CORPUS }, { label: 'Finance', data: FINANCE_CORPUS }] as corpus (corpus.label)}<article
					>
						<h3>{corpus.label} corpus</h3>
						<small>{corpus.data.version}</small>
						<h4>Training: {corpus.data.train.length} documents</h4>
						<!-- Keyboard focus supports scrolling the full corpus. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<ol tabindex="0" aria-label={`${corpus.label} training sentences`}>
							{#each corpus.data.train as sentence (sentence)}<li>{sentence}</li>{/each}
						</ol>
						<h4>Validation: {corpus.data.validation.length} separate documents</h4>
						<!-- Keyboard focus supports scrolling the full corpus. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<ol tabindex="0" aria-label={`${corpus.label} validation sentences`}>
							{#each corpus.data.validation as sentence (sentence)}<li>{sentence}</li>{/each}
						</ol>
					</article>{/each}
			</div>
		</details>
		<article class="commit">
			<div class="eyebrow"><LockKeyhole size={17} /> Separate final documents</div>
			<h3>Commit the result before opening the last two sets.</h3>
			<label for={uid + '-rationale'}
				>What do the measured changes justify—and what do they not establish?</label
			><textarea
				id={uid + '-rationale'}
				rows="3"
				bind:value={rationale}
				disabled={report.phase === 'committed'}
				placeholder="Finance validation changed from… to…; general changed from… to… . I would still test…"
			></textarea><button
				class="primary"
				onclick={commit}
				disabled={running ||
					!!pending ||
					report.phase !== 'finance' ||
					report.financeSteps < 1 ||
					!rationale.trim()}
				><LockKeyhole size={16} />Freeze weights and reveal both final sets</button
			>{#if report.final}<div class="score-grid">
					{#each ['general', 'finance'] as domain (domain)}{@const key = domain as
							'general' | 'finance'}
						<article>
							<small>{domain} final loss</small><strong
								>{format(report.final.scores[key].loss)}</strong
							><span
								>{report.final.scores[key].documents} documents · {report.final.scores[key]
									.targetTokens} characters</span
							>
						</article>{/each}
				</div>
				<p>
					The weights at update {report.final.step} are frozen. These final scores assess the current
					adapted model. The before/after comparison above uses validation evidence, not the final documents.
				</p>{/if}
		</article>
		<details class="generation">
			<summary>Generate real characters from the current weights</summary><label
				for={uid + '-prompt'}>Starting text</label
			><input id={uid + '-prompt'} bind:value={prompt} maxlength="160" /><button
				class="secondary"
				onclick={generate}
				disabled={running}>Generate 48 characters</button
			>{#if generated}<pre>{generated}</pre>{/if}
			<p class="hint">
				Actual sampling, seed 31 and temperature 0.8. A tiny model may produce fragments or
				nonsense. Generation changes context, not weights; output is never replaced with a polished
				sample.
			</p>
		</details>
	{/if}
	<article class="reward">
		<div class="eyebrow">
			<SlidersHorizontal size={17} /> Authored proxy-reward illustration · no RL training
		</div>
		<h3>What behavior does your score encourage?</h3>
		<p>
			The available invoice evidence establishes a USD 500 balance, but no reason for the short
			payment. These three responses and their ratings are authored examples. Move the weights to
			see how a poor objective can favor confident speculation.
		</p>
		<div class="reward-controls">
			<label
				>Weight on confident wording: {confidenceWeight}<input
					type="range"
					min="0"
					max="5"
					step="1"
					bind:value={confidenceWeight}
				/></label
			><label
				>Weight on evidence grounding: {groundingWeight}<input
					type="range"
					min="0"
					max="5"
					step="1"
					bind:value={groundingWeight}
				/></label
			>
		</div>
		<div class="reward-grid">
			{#each rewards as candidate (candidate.id)}<article
					class:selected={candidate.score === bestReward}
				>
					<small
						>{candidate.score === bestReward ? 'Highest score / tie' : 'Lower score'} · {candidate.score}
						points</small
					>
					<h4>{candidate.label}</h4>
					<p>{candidate.text}</p>
					<span
						>Authored ratings: confidence {candidate.confidence}/5 · grounding {candidate.grounding}/5</span
					>
					<p class="hint">{candidate.feedback}</p>
				</article>{/each}
		</div>
		<p class="hint">
			<strong>No policy is being trained here.</strong> This selector only multiplies authored ratings
			by chosen weights. Actual reinforcement learning would use a reward signal to update a policy’s
			parameters; the transformer training above instead minimizes next-character prediction loss.
		</p>
	</article>
	<footer>
		<h3>Export a defensible comparison</h3>
		<label for={uid + '-reflection'}>Explain the actual result and a sensible next experiment</label
		><textarea
			id={uid + '-reflection'}
			rows="3"
			bind:value={reflection}
			placeholder="Did general performance deteriorate, improve, or barely change? What does this tiny experiment leave unresolved?"
		></textarea><button class="secondary" onclick={download} disabled={!report}
			><Download size={16} />Export scores, corpora versions and weights</button
		>
		<details>
			<summary>Architecture and measurement provenance</summary>
			<p>{ADAPTATION_PROVENANCE.architecture}</p>
			<p>{ADAPTATION_PROVENANCE.objective}</p>
			<p>
				Here: width 8, two heads, context 16 characters; the vocabulary is fixed before looking at
				any split. Adam uses two sampled windows per update. General and finance corpora each
				contain 40 training, eight validation, and eight final documents, with no exact sentence
				overlap. Final examples are pedagogically concealed; client code is not secure exam
				proctoring.
			</p>
			<p>{ADAPTATION_PROVENANCE.scope}</p>
		</details>
	</footer>
</section>

<style>
	.adaptation {
		background: #f8faf6;
		border: 1px solid #dce6db;
		border-radius: 26px;
		color: #283d32;
		overflow: hidden;
		font-family: var(--font-body, sans-serif);
	}
	header {
		padding: 30px;
		background: linear-gradient(120deg, #e5f1e7, #eeebf8);
	}
	.eyebrow {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #50644b;
	}
	h2 {
		font-size: clamp(1.7rem, 4vw, 2.55rem);
		line-height: 1.15;
		letter-spacing: -0.045em;
		margin: 15px 0;
	}
	h3 {
		font-size: 1.08rem;
		line-height: 1.4;
		margin: 8px 0 12px;
		letter-spacing: -0.02em;
	}
	h4 {
		font-size: 0.86rem;
		margin: 12px 0;
	}
	p {
		font-size: 0.9rem;
		line-height: 1.75;
		margin: 10px 0;
	}
	header p {
		max-width: 800px;
	}
	.badge {
		display: inline-block;
		background: #ffffff99;
		border-radius: 20px;
		padding: 8px 13px;
		font-size: 0.75rem;
		margin-top: 12px;
	}
	.settings,
	.controls {
		display: flex;
		align-items: end;
		gap: 12px;
		flex-wrap: wrap;
		padding: 24px 26px 12px;
	}
	label {
		display: block;
		font-size: 0.8rem;
		font-weight: 700;
		line-height: 1.5;
	}
	input:not([type='range']),
	select,
	textarea {
		display: block;
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #b9c8bb;
		border-radius: 9px;
		padding: 11px;
		background: #fff;
		color: #283d32;
		font: inherit;
		font-size: 0.85rem;
		margin: 7px 0 0;
	}
	.settings input {
		max-width: 150px;
	}
	.settings select {
		max-width: 240px;
	}
	textarea {
		resize: vertical;
		min-height: 78px;
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 0;
		border-radius: 9px;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 750;
		padding: 12px 15px;
		min-height: 44px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.primary {
		background: #315f42;
		color: white;
	}
	.secondary {
		background: #e8eee6;
		color: #2d5138;
	}
	.transition {
		background: #e9e1f5;
		color: #534075;
	}
	:is(button, input, select, textarea, summary):focus-visible {
		outline: 3px solid #8561ac;
		outline-offset: 3px;
	}
	.notice,
	.status {
		margin: 15px 26px;
		padding: 13px 17px;
		border-radius: 11px;
		font-size: 0.83rem;
	}
	.notice {
		background: #fff0d9;
	}
	.status {
		background: #e7f1e6;
	}
	.stage-flow {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 18px;
		align-items: center;
		padding: 20px 26px 4px;
	}
	.stage-flow article {
		border: 1px solid #d6e1d5;
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		min-width: 0;
	}
	.stage-flow article.active {
		border-color: #5d855c;
		background: #f0f6ed;
		box-shadow: 0 0 0 2px #90b28922;
	}
	.stage-flow small {
		display: block;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		font-weight: 800;
		margin-top: 12px;
	}
	.stage-flow p {
		font-size: 0.78rem;
		color: #556552;
	}
	.transfer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
	}
	.transfer span {
		font-size: 0.69rem;
		line-height: 1.6;
		color: #5d6658;
	}
	.hint {
		font-size: 0.78rem;
		line-height: 1.7;
		color: #52614f;
	}
	.inset {
		margin: 0 26px;
	}
	.chart-panel,
	.interpret,
	.commit,
	.reward,
	footer {
		margin: 24px 26px;
		padding: 23px;
		border: 1px solid #d8e2d4;
		border-radius: 18px;
		background: #fff;
	}
	.measurement-table {
		margin: 18px 0;
	}
	.measurement-table table {
		width: 100%;
		font-size: 0.75rem;
		border-collapse: collapse;
		margin-top: 14px;
	}
	.measurement-table th,
	.measurement-table td {
		padding: 9px 5px;
		text-align: left;
		border-bottom: 1px solid #dce5d8;
	}
	.measurement-table caption {
		text-align: left;
		font-size: 0.72rem;
		margin-bottom: 8px;
		color: #52614f;
	}
	.chart-heading {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}
	.chart-heading p {
		font-size: 0.8rem;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		font-size: 0.73rem;
		font-weight: 700;
	}
	.legend span:before {
		content: '';
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		margin-right: 7px;
	}
	.general:before {
		background: #356546;
	}
	.finance:before {
		background: #78579d;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		margin: 10px 0;
	}
	svg text {
		font: 16px sans-serif;
		fill: #576751;
	}
	.score-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin: 17px 0;
	}
	.score-grid article {
		padding: 17px;
		border: 1px solid #dce5d8;
		border-radius: 13px;
		background: #f2f7ef;
		min-width: 0;
	}
	.score-grid article:nth-child(2) {
		background: #f1edf8;
		border-color: #e1d9ed;
	}
	.score-grid small {
		display: block;
		font-size: 0.72rem;
		text-transform: capitalize;
	}
	.score-grid strong {
		display: block;
		font-size: 2rem;
		line-height: 1.4;
		letter-spacing: -0.04em;
	}
	.score-grid span {
		font-size: 0.7rem;
		color: #52614f;
		line-height: 1.5;
		display: block;
	}
	.score-grid p {
		font-size: 0.8rem;
		margin: 8px 0 0;
	}
	.score-grid b {
		color: #356546;
	}
	.score-grid .worse {
		color: #8b4e26;
	}
	.interpret {
		background: #f0f4e9;
	}
	.corpus,
	.generation {
		margin: 24px 26px;
		border-radius: 14px;
		background: #edeaf6;
		padding: 18px 22px;
	}
	summary {
		font-weight: 750;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.corpus-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-top: 16px;
	}
	.corpus-grid article {
		min-width: 0;
	}
	.corpus-grid small {
		font-size: 0.72rem;
		overflow-wrap: anywhere;
	}
	.corpus-grid ol {
		font-size: 0.79rem;
		line-height: 1.8;
		padding-left: 20px;
		max-height: 300px;
		overflow: auto;
	}
	.commit button,
	footer button,
	.generation button {
		margin-top: 15px;
	}
	.commit {
		background: #eff4e9;
	}
	.commit h3 {
		margin-top: 13px;
	}
	.generation input {
		max-width: 460px;
	}
	pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 0.85rem;
		background: #fff;
		padding: 15px;
		border-radius: 9px;
		line-height: 1.7;
	}
	.reward {
		background: #f3eff8;
	}
	.reward-controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 22px;
		margin: 22px 0;
	}
	.reward-controls input {
		display: block;
		width: 100%;
		accent-color: #78579d;
		margin-top: 12px;
	}
	.reward-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 13px;
	}
	.reward-grid article {
		border: 1px solid #d7cfe4;
		background: #fff;
		border-radius: 13px;
		padding: 17px;
		min-width: 0;
	}
	.reward-grid article.selected {
		border-color: #78579d;
		box-shadow: 0 0 0 2px #78579d20;
	}
	.reward-grid small {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 800;
		color: #685183;
	}
	.reward-grid p {
		font-size: 0.8rem;
	}
	.reward-grid span {
		font-size: 0.7rem;
		line-height: 1.5;
		display: block;
		color: #5e6260;
	}
	.reward-grid .hint {
		font-size: 0.73rem;
	}
	footer details {
		margin-top: 22px;
	}
	footer details p {
		font-size: 0.8rem;
	}
	@media (max-width: 850px) {
		.stage-flow {
			grid-template-columns: 1fr;
		}
		.transfer {
			flex-direction: row;
			justify-content: center;
		}
		.transfer :global(svg) {
			width: 24px;
			transform: rotate(90deg);
		}
		.reward-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 520px) {
		header {
			padding: 23px;
		}
		.settings,
		.controls {
			padding-left: 17px;
			padding-right: 17px;
		}
		.stage-flow {
			padding-left: 17px;
			padding-right: 17px;
		}
		.chart-panel,
		.interpret,
		.commit,
		.reward,
		footer {
			margin: 20px 16px;
			padding: 18px;
		}
		.notice,
		.status,
		.corpus,
		.generation {
			margin-left: 16px;
			margin-right: 16px;
		}
		.inset {
			margin-left: 17px;
			margin-right: 17px;
		}
		.score-grid,
		.corpus-grid,
		.reward-controls {
			grid-template-columns: 1fr;
		}
		.controls button {
			width: 100%;
		}
		.settings {
			align-items: stretch;
		}
		.settings label {
			flex: 1;
			min-width: 120px;
		}
		.settings button {
			width: 100%;
		}
		.settings input,
		.settings select {
			max-width: none;
		}
	}
</style>
