<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import {
		ForecastExperiment,
		FORECAST_METHODS,
		FORECAST_PROVENANCE,
		type ForecastMethod,
		type ForecastHorizon,
		type ForecastScenario,
		type ForecastCommitment,
		type ForecastRow
	} from '$lib/engines/forecast';
	const id = $props.id();
	const storageKey = 'ai-accountant-forecast-v1';
	let run = $state.raw(new ForecastExperiment());
	let seed = $state(42);
	let horizon = $state<ForecastHorizon>(1);
	let method = $state<ForecastMethod>('seasonal');
	let rationale = $state('');
	let interpretation = $state('');
	let commitment = $state.raw<ForecastCommitment | null>(null);
	let scenario = $state<ForecastScenario>('stable');
	let phase = $state<'validation' | 'final'>('validation');
	let detailIndex = $state(0);
	let consultedSeeds = $state<number[]>([]);
	let firstCommitment = $state.raw<ForecastCommitment | null>(null);
	let status = $state(
		'Compare five methods on the same eighteen validation targets. Final outcomes are hidden.'
	);
	let error = $state('');
	let storageWarning = $state('');
	const pending = $derived(seed !== run.seed || horizon !== run.horizon);
	const validation = $derived(run.validation());
	const selectedValidation = $derived(validation.find((result) => result.method === method)!);
	const finalResult = $derived(commitment ? run.final(scenario) : null);
	const visibleSeries = $derived(run.observed(scenario));
	const displayed = $derived(phase === 'final' && finalResult ? finalResult : selectedValidation);
	const inspected = $derived(displayed.rows[Math.min(detailIndex, displayed.rows.length - 1)]);
	const plotted = $derived([...selectedValidation.rows, ...(finalResult?.rows ?? [])]);
	const chartMin = $derived(
		Math.floor(
			(Math.min(
				...visibleSeries.map((row) => row.value),
				...plotted.map((row) => row.lower ?? row.forecast)
			) -
				8) /
				20
		) * 20
	);
	const chartMax = $derived(
		Math.ceil(
			(Math.max(
				...visibleSeries.map((row) => row.value),
				...plotted.map((row) => row.upper ?? row.forecast)
			) +
				8) /
				20
		) * 20
	);
	const methodDescription = $derived(FORECAST_METHODS.find((item) => item.id === method)!);
	const fmt = (value: number) => value.toFixed(2);
	const pct = (value: number | null) =>
		value === null ? 'Not available' : `${(100 * value).toFixed(1)}%`;
	const x = (index: number) => 56 + (index / 71) * 808;
	const y = (value: number) => 270 - ((value - chartMin) / (chartMax - chartMin)) * 220;
	function line(points: { index: number; value: number }[]) {
		return points
			.map((point, index) => `${index ? 'L' : 'M'}${x(point.index)},${y(point.value)}`)
			.join(' ');
	}
	function band(rows: ForecastRow[]) {
		const valid = rows.filter((row) => row.lower !== null && row.upper !== null);
		return valid.length
			? `${valid.map((row, i) => `${i ? 'L' : 'M'}${x(row.target)},${y(row.upper!)}`).join(' ')} ${[
					...valid
				]
					.reverse()
					.map((row) => `L${x(row.target)},${y(row.lower!)}`)
					.join(' ')} Z`
			: '';
	}
	function persist() {
		try {
			localStorage.setItem(
				storageKey,
				JSON.stringify({
					version: 1,
					seed: run.seed,
					horizon: run.horizon,
					method,
					rationale,
					interpretation,
					commitment,
					scenario,
					consultedSeeds,
					firstCommitment
				})
			);
			storageWarning = '';
		} catch {
			storageWarning =
				'This browser could not save the experiment. You can continue and export your evidence.';
		}
	}
	function reset() {
		try {
			const fresh = new ForecastExperiment(seed, horizon);
			run = fresh;
			commitment = null;
			scenario = 'stable';
			phase = 'validation';
			detailIndex = 0;
			rationale = '';
			interpretation = '';
			error = '';
			status = consultedSeeds.includes(seed)
				? 'New development run. Final cases for this seed have already been viewed; later scores are consulted evidence.'
				: 'Fresh seeded dataset. Compare validation evidence, then record a selection rationale.';
			persist();
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not create the experiment.';
		}
	}
	function commit() {
		try {
			if (pending)
				throw new Error('Apply the pending seed or horizon with a new run before committing.');
			commitment = run.commit(method, rationale);
			firstCommitment ??= { ...commitment };
			if (!consultedSeeds.includes(run.seed)) consultedSeeds = [...consultedSeeds, run.seed];
			phase = 'final';
			detailIndex = 0;
			error = '';
			status = `Committed ${methodDescription.label} at a ${run.horizon}-month horizon. ${run.final().metrics.count} final targets are now visible; configuration is frozen.`;
			persist();
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not commit the method.';
		}
	}
	function chooseScenario(value: ForecastScenario) {
		if (!commitment) return;
		scenario = value;
		phase = 'final';
		detailIndex = 0;
		status =
			value === 'shift'
				? 'Authored regime-change stress: the first sixty months are unchanged. The committed method remains fixed.'
				: 'Original synthetic final period restored. The committed method remains fixed.';
		persist();
	}
	function exportEvidence() {
		const first = firstCommitment
			? new ForecastExperiment(firstCommitment.seed, firstCommitment.horizon)
			: null;
		if (first && firstCommitment) first.commit(firstCommitment.method, firstCommitment.rationale);
		const report = {
			...run.report(scenario),
			interpretation,
			consultedSeeds,
			firstCommittedRun: first?.report() ?? null,
			progressMeaning:
				'Written rationale and interpretation are self-assessed; calculated metrics do not grade the reasoning.'
		};
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
		);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'willow-forecast-evidence.json';
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
	onMount(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (!raw) return;
			const saved = JSON.parse(raw);
			if (saved.version !== 1 || !FORECAST_METHODS.some((item) => item.id === saved.method)) return;
			const restored = new ForecastExperiment(saved.seed, saved.horizon);
			run = restored;
			seed = restored.seed;
			horizon = restored.horizon;
			method = saved.method;
			rationale = typeof saved.rationale === 'string' ? saved.rationale.slice(0, 5000) : '';
			interpretation =
				typeof saved.interpretation === 'string' ? saved.interpretation.slice(0, 10000) : '';
			consultedSeeds = Array.isArray(saved.consultedSeeds)
				? saved.consultedSeeds.filter(
						(n: unknown) => Number.isInteger(n) && Number(n) > 0 && Number(n) <= 999999
					)
				: [];
			if (
				saved.commitment &&
				saved.commitment.method === method &&
				saved.commitment.seed === seed &&
				saved.commitment.horizon === horizon
			) {
				commitment = restored.commit(method, rationale);
				phase = 'final';
				scenario = saved.scenario === 'shift' ? 'shift' : 'stable';
			}
			if (saved.firstCommitment && typeof saved.firstCommitment.rationale === 'string') {
				const first = new ForecastExperiment(
					saved.firstCommitment.seed,
					saved.firstCommitment.horizon
				);
				firstCommitment = first.commit(
					saved.firstCommitment.method,
					saved.firstCommitment.rationale
				);
			}
			status = commitment
				? 'Restored your committed forecast and original rationale. Final evidence remains revealed.'
				: 'Restored your development run and notes. Final outcomes remain hidden.';
		} catch {
			storageWarning =
				'Saved experiment data could not be restored completely. Start a new run or export the current state.';
		}
	});
</script>

<div class="forecast-studio">
	<header class="studio-header">
		<div class="studio-icon"><Icon name="chart" size={26} /></div>
		<div>
			<p class="eyebrow">FORECAST STUDIO · REAL LOCAL CALCULATIONS</p>
			<h2>Rehearse the future.</h2>
			<p>
				Compare five methods, inspect what each origin knew, then commit before opening the final
				year.
			</p>
		</div>
	</header>

	<div class="provenance">
		<Icon name="file" size={18} />
		<p>
			<strong>72 synthetic months · USD thousands · January 2021–December 2026.</strong> This is an original
			teaching dataset. Every curve below comes from computed forecasts; no live financial records or
			generated answers are used.
		</p>
	</div>

	<div class="controls">
		<label for={`${id}-seed`}
			>Dataset seed<input
				id={`${id}-seed`}
				type="number"
				min="1"
				max="999999"
				step="1"
				bind:value={seed}
			/></label
		>
		<label for={`${id}-horizon`}
			>Forecast horizon<select id={`${id}-horizon`} bind:value={horizon}
				><option value={1}>1 month ahead</option><option value={3}>3 months ahead</option><option
					value={6}>6 months ahead</option
				></select
			></label
		>
		<button class="secondary" onclick={reset}><Icon name="reset" size={17} />Start new run</button>
		<button class="secondary" onclick={exportEvidence}
			><Icon name="download" size={17} />Export evidence</button
		>
	</div>
	{#if pending}<p class="notice">
			Pending settings. Start a new run to apply them; the results still use seed {run.seed} and a {run.horizon}-month
			horizon.
		</p>{/if}
	{#if !commitment && consultedSeeds.includes(run.seed)}<p class="notice">
			You have already viewed final cases for this seed. Treat this run as development on consulted
			evidence, even though the reveal is reset.
		</p>{/if}
	{#if storageWarning}<p class="notice">{storageWarning}</p>{/if}
	{#if error}<p class="error" role="alert">{error}</p>{/if}
	<p class="status" role="status">{status}</p>

	<div class="timeline" aria-label="Evaluation timeline">
		<div>
			<span>01 / ESTIMATE</span><strong>Earlier history</strong><small
				>Fit each method again at every origin, using only its observed prefix.</small
			>
		</div>
		<div>
			<span>02 / SELECT</span><strong>Jul 2024–Dec 2025</strong><small
				>18 common validation targets. Compare the horizon needed by your decision.</small
			>
		</div>
		<div class:revealed={!!commitment}>
			<span>03 / COMMIT & TEST</span><strong
				>{commitment ? '2026 outcomes revealed' : '2026 outcomes hidden'}</strong
			><small
				>Origins begin at Dec 2025. This horizon leaves {13 - run.horizon} observable final targets.</small
			>
		</div>
	</div>

	<section class="comparison" aria-labelledby={`${id}-compare`}>
		<div class="section-title">
			<div>
				<p class="eyebrow">01 · CHOOSE WITH VALIDATION</p>
				<h3 id={`${id}-compare`}>Which assumption earns its place?</h3>
			</div>
			<span class="unit">All errors: USD thousands</span>
		</div>
		<!-- Keyboard users need to scroll the overflowing table. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="table-wrap" role="region" aria-label="Validation comparison table" tabindex="0">
			<table>
				<caption
					>Same eighteen validation targets, same {run.horizon}-month horizon. Coverage is observed,
					not guaranteed.</caption
				>
				<thead
					><tr
						><th scope="col">Method</th><th scope="col">MAE</th><th scope="col">RMSE</th><th
							scope="col">Bias</th
						><th scope="col">Band coverage</th></tr
					></thead
				>
				<tbody
					>{#each validation as result (result.method)}<tr
							class:selected={method === result.method}
						>
							<th scope="row"
								><label class="method-choice"
									><input
										type="radio"
										name={`${id}-method`}
										value={result.method}
										checked={method === result.method}
										disabled={!!commitment}
										onchange={() => {
											method = result.method;
											detailIndex = 0;
											persist();
										}}
									/>{FORECAST_METHODS.find((item) => item.id === result.method)?.label}</label
								></th
							>
							<td>{fmt(result.metrics.mae)}</td><td>{fmt(result.metrics.rmse)}</td><td
								>{fmt(result.metrics.bias)}</td
							><td
								>{pct(result.metrics.coverage)}
								<small>({result.metrics.covered}/{result.metrics.bandCount})</small></td
							>
						</tr>{/each}</tbody
				>
			</table>
		</div>
		<p class="explanation">
			<strong>{methodDescription.label}:</strong>
			{methodDescription.description} Signed error is forecast minus actual: negative bias means average
			underforecasting.
		</p>
	</section>

	<figure class="forecast-chart">
		<div class="chart-key">
			<span class="actual-key">Observed collections</span><span class="forecast-key"
				>Selected rolling forecasts</span
			><span class="band-key">Empirical error band</span>
		</div>
		<svg viewBox="0 0 900 320" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}>
			<title id={`${id}-chart-title`}
				>Collections history and {methodDescription.label} forecasts</title
			>
			<desc id={`${id}-chart-desc`}
				>Observed and forecast values in USD thousands. Final-year actuals and forecasts remain
				hidden until commitment. The exact values and origin-specific calibration are provided in
				the table below.</desc
			>
			<rect x={x(42)} y="28" width={x(60) - x(42)} height="242" fill="#f3edf9" />
			<rect
				x={x(60)}
				y="28"
				width={864 - x(60)}
				height="242"
				fill={commitment ? '#fff0df' : '#f1f1eb'}
			/>
			{#each [0, 1, 2, 3, 4] as tick (tick)}{@const value =
					chartMin + ((chartMax - chartMin) * tick) / 4}<line
					x1="56"
					x2="864"
					y1={y(value)}
					y2={y(value)}
					stroke="#d8ddd5"
				/><text x="45" y={y(value) + 4} text-anchor="end">{value.toFixed(0)}</text>{/each}
			<path d={band(selectedValidation.rows)} fill="#d6c5eb" opacity="0.55" />
			{#if finalResult}<path d={band(finalResult.rows)} fill="#f3c99c" opacity="0.55" />{/if}
			<path d={line(visibleSeries)} fill="none" stroke="#246250" stroke-width="2.8" />
			<path
				d={line(selectedValidation.rows.map((row) => ({ index: row.target, value: row.forecast })))}
				fill="none"
				stroke="#725294"
				stroke-width="2.4"
				stroke-dasharray="7 4"
			/>
			{#if finalResult}<path
					d={line(finalResult.rows.map((row) => ({ index: row.target, value: row.forecast })))}
					fill="none"
					stroke="#a85523"
					stroke-width="2.4"
					stroke-dasharray="7 4"
				/>{/if}
			<line
				x1={x(inspected.target)}
				x2={x(inspected.target)}
				y1="28"
				y2="270"
				stroke="#4a5149"
				stroke-dasharray="3 4"
			/>
			<circle
				cx={x(inspected.target)}
				cy={y(inspected.forecast)}
				r="5"
				fill="#725294"
				stroke="white"
				stroke-width="2"
			/>
			<circle
				cx={x(inspected.target)}
				cy={y(inspected.actual)}
				r="5"
				fill="#246250"
				stroke="white"
				stroke-width="2"
			/>
			{#each [{ index: 0, label: 'Jan 2021' }, { index: 24, label: 'Jan 2023' }, { index: 42, label: 'Jul 2024' }, { index: 59, label: 'Dec 2025' }, { index: 71, label: 'Dec 2026' }] as tick (tick.index)}<text
					x={x(tick.index)}
					y="294"
					text-anchor={tick.index === 0 ? 'start' : tick.index === 71 ? 'end' : 'middle'}
					>{tick.label}</text
				>{/each}
			{#if !commitment}<text x={x(65.5)} y="145" text-anchor="middle" class="hidden-label"
					>Final year</text
				><text x={x(65.5)} y="165" text-anchor="middle" class="hidden-label">not yet revealed</text
				>{/if}
		</svg>
		<figcaption>
			Each forecast is refitted using its own past. The purple region contains validation targets;
			the final year begins in the shaded region at right. Band width is calibrated from up to 24
			earlier matured errors, with at least six required.
		</figcaption>
	</figure>

	{#if !commitment}
		<section class="commit-panel" aria-labelledby={`${id}-commit-title`}>
			<div>
				<p class="eyebrow">02 · MAKE A DEFENSIBLE CHOICE</p>
				<h3 id={`${id}-commit-title`}>Write the reason before the reveal.</h3>
				<p>
					Explain why this method fits the decision, cite validation evidence, and predict one
					weakness. A filled note is an attempt, not proof of mastery.
				</p>
			</div>
			<label for={`${id}-rationale`}
				>Your selection rationale<textarea
					id={`${id}-rationale`}
					rows="4"
					maxlength="5000"
					value={rationale}
					oninput={(event) => {
						rationale = event.currentTarget.value;
						persist();
					}}
					placeholder="I choose… because the same-horizon evidence shows… I expect it may fail when…"
				></textarea></label
			>
			<button class="primary" onclick={commit} disabled={!rationale.trim() || pending}
				><Icon name="shield" size={18} />Commit method & reveal final year</button
			>
		</section>
	{:else if finalResult}
		<section class="final-panel" aria-labelledby={`${id}-final-title`}>
			<p class="eyebrow">03 · INDEPENDENT AT FIRST REVEAL</p>
			<h3 id={`${id}-final-title`}>Your choice now meets the next period.</h3>
			<p>
				<strong>Frozen choice:</strong>
				{methodDescription.label}, {run.horizon} months ahead, seed {run.seed}. “{commitment.rationale}”
			</p>
			<div class="metrics">
				<div>
					<small>Final MAE</small><strong>{fmt(finalResult.metrics.mae)}</strong><span
						>USD thousands</span
					>
				</div>
				<div>
					<small>Final RMSE</small><strong>{fmt(finalResult.metrics.rmse)}</strong><span
						>larger misses weigh more</span
					>
				</div>
				<div>
					<small>Final bias</small><strong>{fmt(finalResult.metrics.bias)}</strong><span
						>forecast minus actual</span
					>
				</div>
				<div>
					<small>Observed band coverage</small><strong>{pct(finalResult.metrics.coverage)}</strong
					><span>{finalResult.metrics.covered} of {finalResult.metrics.bandCount} targets</span>
				</div>
			</div>
			<fieldset class="scenario">
				<legend>Change the world, keeping your method fixed</legend><label
					><input
						type="radio"
						name={`${id}-scenario`}
						checked={scenario === 'stable'}
						onchange={() => chooseScenario('stable')}
					/>Original synthetic process</label
				><label
					><input
						type="radio"
						name={`${id}-scenario`}
						checked={scenario === 'shift'}
						onchange={() => chooseScenario('shift')}
					/>Collections slowdown from January 2026</label
				>
			</fieldset>
			{#if scenario === 'shift'}<p class="notice">
					Authored stress: a 36-thousand drop begins in January 2026, followed by an additional
					1.5-thousand drop each month. Earlier history is identical. The model receives changed
					observations only after each one occurs.
				</p>{/if}
			<p class="explanation">
				The 90th-percentile calibration rule is a method, not a promise of 90% future coverage. A
				changed process can break its assumptions. After inspecting these outcomes, further tuning
				against them is development evidence.
			</p>
		</section>
	{/if}

	<section class="inspector" aria-labelledby={`${id}-inspect-title`}>
		<div class="section-title">
			<div>
				<p class="eyebrow">FOLLOW ONE FORECAST</p>
				<h3 id={`${id}-inspect-title`}>What did this origin know?</h3>
			</div>
			{#if commitment}<label for={`${id}-phase`}
					>Evidence period<select
						id={`${id}-phase`}
						value={phase}
						onchange={(event) => {
							phase = event.currentTarget.value as 'validation' | 'final';
							detailIndex = 0;
						}}
						><option value="validation">Validation</option><option value="final"
							>Final period</option
						></select
					></label
				>{/if}
		</div>
		<label for={`${id}-target`}
			>Inspect target {inspected.targetMonth}<input
				id={`${id}-target`}
				type="range"
				min="0"
				max={displayed.rows.length - 1}
				step="1"
				bind:value={detailIndex}
			/></label
		>
		<div class="trace">
			<div>
				<small>1 · Latest available month</small><strong>{inspected.originMonth}</strong><span
					>{inspected.origin + 1} observations available for fitting</span
				>
			</div>
			<div>
				<small>2 · Predict {inspected.targetMonth}</small><strong>{fmt(inspected.forecast)}</strong
				><span>{run.horizon} months after the origin</span>
			</div>
			<div>
				<small>3 · Observe later</small><strong>{fmt(inspected.actual)}</strong><span
					>Signed error {fmt(inspected.error)}</span
				>
			</div>
		</div>
		<p class="explanation">
			The interval uses {inspected.calibrationTargets.length} earlier errors with outcomes known by {inspected.originMonth}.
			Latest calibration target: {inspected.calibrationTargets.length
				? visibleSeries[inspected.calibrationTargets.at(-1)!].month
				: 'none yet'}. The forecast target itself cannot calibrate its own band.
		</p>
		<!-- Keyboard users need to scroll the overflowing table. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="table-wrap" role="region" aria-label="Forecast case evidence table" tabindex="0">
			<table>
				<caption
					>{phase === 'final' && commitment ? 'Committed final' : 'Validation'} case evidence · all amounts
					USD thousands</caption
				><thead
					><tr
						><th scope="col">Origin</th><th scope="col">Target</th><th scope="col">Forecast</th><th
							scope="col">Actual</th
						><th scope="col">Error</th><th scope="col">Earlier-error band</th></tr
					></thead
				><tbody
					>{#each displayed.rows as row (row.target)}<tr
							class:selected={row.target === inspected.target}
							><th scope="row">{row.originMonth}</th><td>{row.targetMonth}</td><td
								>{fmt(row.forecast)}</td
							><td>{fmt(row.actual)}</td><td>{fmt(row.error)}</td><td
								>{row.lower === null || row.upper === null
									? 'Too few earlier errors'
									: `${fmt(row.lower)}–${fmt(row.upper)}`}</td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>
	</section>

	<section class="reflection" aria-labelledby={`${id}-reflect-title`}>
		<p class="eyebrow">MAKE THE FINANCE DECISION</p>
		<h3 id={`${id}-reflect-title`}>What would you tell treasury?</h3>
		<p>
			Compare your prediction with the evidence. Explain one consequential miss, whether the band
			held up, and which next action the forecast supports. Keep forecast, budget, and stress
			scenario distinct.
		</p>
		<label for={`${id}-interpretation`}
			>Your interpretation · self-assessed<textarea
				id={`${id}-interpretation`}
				rows="4"
				maxlength="10000"
				value={interpretation}
				oninput={(event) => {
					interpretation = event.currentTarget.value;
					persist();
				}}
				placeholder="The evidence supports… The main limitation is… I would investigate…"
			></textarea></label
		>
		<details>
			<summary>Review your reasoning</summary>
			<p>
				A defensible answer names the method, horizon, observed MAE/bias, and final target count. It
				explains the interval’s calibration window and observed coverage, identifies the changed
				assumption under the stress, and proposes a liquidity review or additional evidence. The
				lowest average error alone does not establish that a cash threshold is protected.
			</p>
		</details>
	</section>
	<details class="method-notes">
		<summary>Computation, provenance, and limitations</summary>
		<p>{FORECAST_PROVENANCE.generator}</p>
		<p>{FORECAST_PROVENANCE.intervals}</p>
		<p>
			Trend and seasonal regression use ordinary least squares on each observed prefix. All methods
			fit on expanding history. Selection ends at December 2025; final forecasts start from that
			origin, so a six-month horizon has seven observable final targets, not twelve. Overlapping
			forecasts and small samples limit statistical claims.
		</p>
		<p>
			The reveal is an instructional boundary on a static website, not secure exam proctoring. Notes
			are saved on this browser when storage permits. Your first committed configuration is retained
			in the export; changing settings requires a new run.
		</p>
		<a href="https://otexts.com/fpp3/tscv.html" target="_blank" rel="noreferrer"
			>Method reference: Forecasting, Principles and Practice <Icon name="external" size={14} /></a
		>
	</details>
</div>

<style>
	.forecast-studio {
		display: grid;
		gap: 1.5rem;
		color: #263d32;
		min-width: 0;
		font-size: 0.95rem;
		line-height: 1.6;
	}
	.studio-header {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}
	.studio-icon {
		background: #e2ecde;
		border: 1px solid #cddcc8;
		padding: 1rem;
		border-radius: 1.1rem;
		color: #315b40;
		flex-shrink: 0;
	}
	.eyebrow {
		font-size: 0.67rem;
		letter-spacing: 0.12em;
		font-weight: 800;
		color: #62715d;
		margin: 0 0 0.4rem;
	}
	.studio-header h2 {
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		line-height: 1.12;
		letter-spacing: -0.05em;
		margin: 0 0 0.7rem;
	}
	.studio-header p:last-child {
		margin: 0;
		max-width: 660px;
		color: #647065;
	}
	.provenance {
		display: flex;
		gap: 0.7rem;
		align-items: flex-start;
		padding: 1rem 1.2rem;
		background: #f1f4ec;
		border: 1px solid #dfe5d9;
		border-radius: 1rem;
		font-size: 0.81rem;
	}
	.provenance :global(svg) {
		flex-shrink: 0;
		margin-top: 0.2rem;
	}
	.provenance p {
		margin: 0;
	}
	.provenance strong {
		display: block;
		margin-bottom: 0.2rem;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.8rem;
	}
	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.8rem;
		font-weight: 650;
	}
	input[type='number'],
	select,
	textarea {
		border: 1px solid #cdd5c9;
		background: #fffefb;
		border-radius: 0.6rem;
		padding: 0.65rem 0.75rem;
		color: #283d31;
		font: inherit;
		max-width: 100%;
	}
	input[type='number'] {
		width: 130px;
	}
	select {
		min-height: 43px;
	}
	textarea {
		resize: vertical;
		width: 100%;
		line-height: 1.6;
		font-weight: 400;
		box-sizing: border-box;
	}
	input[type='range'] {
		width: 100%;
		accent-color: #436651;
	}
	input[type='radio'] {
		accent-color: #436651;
		flex-shrink: 0;
	}
	button {
		font: inherit;
		border-radius: 0.7rem;
		padding: 0.7rem 1rem;
		font-weight: 650;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		cursor: pointer;
		min-height: 43px;
		border: 1px solid #cbd5c6;
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
	.secondary {
		background: #fffefb;
		color: #3c5742;
	}
	.primary {
		background: #345840;
		color: #fff;
		border-color: #345840;
		justify-self: start;
	}
	.notice {
		padding: 0.8rem 1rem;
		border: 1px solid #e3cdb4;
		background: #fff6e9;
		color: #71502a;
		border-radius: 0.75rem;
		margin: 0;
		font-size: 0.84rem;
	}
	.error {
		background: #fff0eb;
		color: #833b2a;
		padding: 1rem;
		border-radius: 0.8rem;
	}
	.status {
		font-size: 0.84rem;
		color: #4d684f;
		margin: 0;
	}
	.timeline {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px solid #dce2d5;
		border-radius: 1rem;
		overflow: hidden;
	}
	.timeline > div {
		display: grid;
		gap: 0.35rem;
		padding: 1.2rem;
		background: #f3f5ef;
	}
	.timeline > div:nth-child(2) {
		background: #f3eff8;
	}
	.timeline > div:nth-child(3) {
		background: #eeefe9;
	}
	.timeline > div.revealed {
		background: #fff0de;
	}
	.timeline span {
		font-size: 0.61rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		color: #66705f;
	}
	.timeline strong {
		font-size: 0.92rem;
	}
	.timeline small {
		font-size: 0.75rem;
		line-height: 1.5;
		color: #647060;
	}
	.section-title {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}
	h3 {
		font-size: 1.25rem;
		letter-spacing: -0.025em;
		line-height: 1.3;
		margin: 0;
	}
	.unit {
		font-size: 0.72rem;
		color: #677261;
	}
	.table-wrap {
		overflow: auto;
		border: 1px solid #dce2d7;
		border-radius: 0.85rem;
		max-width: 100%;
		background: #fffefb;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.79rem;
		white-space: nowrap;
	}
	caption {
		text-align: left;
		padding: 0.9rem 1rem;
		font-size: 0.72rem;
		color: #62705f;
		background: #f6f7f1;
		white-space: normal;
	}
	th,
	td {
		padding: 0.85rem 0.9rem;
		border-top: 1px solid #e4e8dd;
	}
	thead th {
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: #f6f7f1;
		color: #65735f;
	}
	tbody th {
		font-weight: 600;
	}
	tr.selected {
		background: #eaf1e4;
	}
	td {
		font-variant-numeric: tabular-nums;
	}
	td small {
		font-size: 0.65rem;
		color: #64705f;
	}
	.method-choice {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.79rem;
	}
	.explanation {
		font-size: 0.82rem;
		color: #5f6f5e;
		line-height: 1.65;
		margin: 1rem 0 0;
	}
	.forecast-chart {
		padding: 1.2rem;
		margin: 0;
		background: #fffefb;
		border: 1px solid #dce2d7;
		border-radius: 1.2rem;
		min-width: 0;
	}
	.forecast-chart svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.forecast-chart text {
		font-size: 11px;
		fill: #64715f;
		font-family: inherit;
	}
	.forecast-chart .hidden-label {
		font-size: 10px;
	}
	.chart-key {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.67rem;
		color: #5e6e5c;
		padding: 0.1rem 0.2rem 0.4rem;
	}
	.chart-key span {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.chart-key span:before {
		content: '';
		width: 19px;
		height: 3px;
		border-radius: 2px;
		background: #246250;
	}
	.chart-key .forecast-key:before {
		background: #725294;
	}
	.chart-key .band-key:before {
		height: 10px;
		background: #d6c5eb;
	}
	figcaption {
		font-size: 0.76rem;
		color: #65725f;
		padding: 0.25rem 0.4rem;
		line-height: 1.6;
	}
	.commit-panel,
	.final-panel,
	.reflection {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
		border: 1px solid #dce2d3;
		border-radius: 1.1rem;
		background: #f2f5eb;
	}
	.commit-panel p,
	.final-panel p,
	.reflection p {
		margin: 0;
		font-size: 0.86rem;
	}
	.final-panel {
		background: #fff5e9;
		border-color: #ebd9c4;
	}
	.metrics,
	.trace {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
	}
	.metrics {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
	.metrics > div,
	.trace > div {
		display: grid;
		gap: 0.25rem;
		background: #fffdf8;
		border: 1px solid #e5dfd0;
		border-radius: 0.8rem;
		padding: 1rem;
	}
	.metrics small,
	.trace small {
		font-size: 0.69rem;
		color: #68715e;
	}
	.metrics strong {
		font-size: 1.65rem;
		letter-spacing: -0.035em;
		font-variant-numeric: tabular-nums;
	}
	.metrics span,
	.trace span {
		font-size: 0.7rem;
		color: #68715e;
	}
	.trace {
		margin: 1rem 0;
	}
	.trace > div {
		background: #f5f7f0;
		border-color: #dfe4d7;
	}
	.trace strong {
		font-size: 1.1rem;
		font-variant-numeric: tabular-nums;
	}
	.scenario {
		border: 1px solid #e0cfba;
		border-radius: 0.8rem;
		padding: 0.8rem 1rem;
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.scenario legend {
		font-size: 0.76rem;
		font-weight: 700;
		padding: 0 0.4rem;
	}
	.scenario label {
		display: flex;
		align-items: center;
		font-size: 0.8rem;
		font-weight: 500;
	}
	.inspector {
		min-width: 0;
	}
	.inspector .table-wrap {
		margin-top: 1rem;
	}
	.reflection {
		background: #f5f0f9;
		border-color: #e5daee;
	}
	.method-notes {
		border-top: 1px solid #dce2d5;
		padding-top: 1rem;
		font-size: 0.81rem;
		color: #5e6d5b;
	}
	summary {
		cursor: pointer;
		font-weight: 650;
		padding: 0.3rem 0;
	}
	details p {
		margin: 0.7rem 0;
	}
	details a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: #335c42;
		text-decoration: underline;
	}
	@media (max-width: 640px) {
		.timeline,
		.metrics,
		.trace {
			grid-template-columns: 1fr;
		}
		.timeline > div {
			padding: 1rem;
		}
		.studio-icon {
			padding: 0.7rem;
		}
		.studio-header {
			gap: 0.7rem;
		}
		.controls {
			gap: 0.6rem;
		}
		.controls label {
			flex: 1;
			min-width: 130px;
		}
		.controls button {
			flex: 1;
			font-size: 0.75rem;
		}
		.controls input[type='number'] {
			width: 100%;
			box-sizing: border-box;
		}
		.commit-panel,
		.final-panel,
		.reflection {
			padding: 1.1rem;
		}
		.forecast-chart {
			padding: 0.65rem;
		}
		.section-title {
			align-items: start;
		}
		.primary {
			width: 100%;
			font-size: 0.82rem;
		}
		.scenario {
			display: grid;
		}
		.metrics > div,
		.trace > div {
			padding: 0.8rem;
		}
		.metrics strong {
			font-size: 1.4rem;
		}
		.table-wrap {
			border-radius: 0.65rem;
		}
		.comparison,
		.inspector {
			max-width: 100%;
			min-width: 0;
		}
	}
</style>
