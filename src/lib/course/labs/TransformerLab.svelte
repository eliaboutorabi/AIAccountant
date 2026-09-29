<script lang="ts">
	import { onMount } from 'svelte';
	import {
		readFinalExposure,
		markFinalExposure,
		type FinalExposure
	} from '$lib/engines/final-exposure';
	import Icon from '$lib/components/Icon.svelte';
	import { FinanceTransformer, TRANSFORMER_PROVENANCE } from '$lib/engines/finance-transformer';
	import { FINANCE_CORPUS, CHARACTER_VOCABULARY } from '$lib/engines/finance-corpus';
	const id = $props.id();
	type History = { step: number; train: number; validation: number };
	let model: FinanceTransformer | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let runId = 0;
	let tab = $state<'train' | 'inspect' | 'generate'>('train');
	let seed = $state(42);
	let rate = $state(0.004);
	let running = $state(false);
	let status = $state('Preparing a fresh character model…');
	let error = $state('');
	let history = $state.raw<History[]>([]);
	let metrics = $state.raw<ReturnType<FinanceTransformer['metrics']> | null>(null);
	let trace = $state.raw<ReturnType<FinanceTransformer['inspect']> | null>(null);
	let example = $state.raw<ReturnType<FinanceTransformer['trainingExample']> | null>(null);
	let final = $state.raw<ReturnType<FinanceTransformer['commitFinal']> | null>(null);
	let activeConfig = $state.raw<FinanceTransformer['config'] | null>(null);
	let selectedDocument = $state(0);
	let inspectText = $state('cash is due.');
	let position = $state(4);
	let head = $state(0);
	let prompt = $state('cash ');
	let temperature = $state(0.8);
	let sampleSeed = $state(31);
	let generated = $state.raw<ReturnType<FinanceTransformer['generate']> | null>(null);
	let generating = $state(false);
	let hasRevealed = $state(false);
	let exposure = $state.raw<FinalExposure | null>(null);
	let exposureBeforeReveal = $state.raw<FinalExposure | null>(null);
	const pending = $derived(
		activeConfig && (activeConfig.seed !== seed || activeConfig.learningRate !== rate)
	);
	const chartMax = $derived(
		Math.max(1, ...history.flatMap((row) => [row.train, row.validation])) * 1.07
	);
	const lastStep = $derived(Math.max(20, metrics?.step ?? 0));
	const query = $derived(Math.min(position, (trace?.tokens.length ?? 1) - 1));
	const topTokens = $derived(
		trace
			? trace.probabilities[query]
					.map((probability, token) => ({
						probability,
						id: token,
						piece: CHARACTER_VOCABULARY[token],
						logit: trace!.logits[query][token]
					}))
					.sort((a, b) => b.probability - a.probability)
					.slice(0, 10)
			: []
	);
	const tokenLabel = (piece: string) => (piece === ' ' ? '␣' : piece === '\n' ? '↵' : piece);
	const tokenName = (piece: string) =>
		piece === ' '
			? 'space'
			: piece === '\n'
				? 'newline'
				: piece === '\uFFFD'
					? 'unknown character'
					: piece;
	function line(key: 'train' | 'validation') {
		return history
			.map(
				(row, i) =>
					`${i ? 'L' : 'M'}${48 + (row.step / lastStep) * 540},${186 - (row[key] / chartMax) * 158}`
			)
			.join(' ');
	}
	function inspect() {
		if (model) trace = model.inspect(inspectText);
	}
	function refresh() {
		if (!model) return;
		metrics = model.metrics();
		history = [
			...history,
			{ step: metrics.step, train: metrics.train.loss, validation: metrics.validation.loss }
		];
		inspect();
		example = model.trainingExample(selectedDocument);
	}
	function pause(announce = true) {
		runId++;
		clearTimeout(timer);
		running = false;
		generating = false;
		if (announce && model)
			status = `Paused at update ${model.step}. These learned weights are retained.`;
	}
	function reset() {
		pause(false);
		try {
			if (final) hasRevealed = true;
			model = new FinanceTransformer({ seed, learningRate: rate });
			activeConfig = model.config;
			exposure = readFinalExposure(FINANCE_CORPUS.version, 'fixed');
			exposureBeforeReveal = null;
			hasRevealed ||= exposure.state === 'recorded';
			history = [];
			final = null;
			generated = null;
			error = '';
			refresh();
			status = 'Fresh random parameters. Train the model to observe measured changes.';
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not create this model.';
		}
	}
	function train(updates: number) {
		if (!model || running || generating || final) return;
		const token = ++runId;
		const end = Math.min(3000, model.step + updates);
		running = true;
		error = '';
		status = `Training toward update ${end}. Each update uses two windows from training sentences only.`;
		const chunk = () => {
			if (token !== runId || !model) return;
			try {
				model.train(Math.min(5, end - model.step));
				if (model.step % 20 === 0 || model.step === end) refresh();
				if (model.step < end) timer = setTimeout(chunk, 20);
				else {
					running = false;
					status = `Finished ${model.step} updates. Inspect the changed probabilities, then generate with these frozen weights.`;
				}
			} catch (reason) {
				pause(false);
				error = reason instanceof Error ? reason.message : 'Training stopped.';
			}
		};
		timer = setTimeout(chunk, 0);
	}
	function commit() {
		if (!model) return;
		pause(false);
		refresh();
		exposureBeforeReveal = readFinalExposure(FINANCE_CORPUS.version, 'fixed');
		hasRevealed ||= exposureBeforeReveal.state === 'recorded';
		final = model.commitFinal();
		exposure = markFinalExposure(FINANCE_CORPUS.version, 'fixed');
		status = `Committed at update ${final.step}. Final prediction loss is now visible; further training is locked.`;
	}
	function generate() {
		if (!model || running || generating) return;
		error = '';
		generating = true;
		const token = ++runId;
		status = 'Generating 80 characters from the current learned weights…';
		timer = setTimeout(() => {
			if (token !== runId || !model) return;
			try {
				generated = model.generate(prompt, { tokens: 80, temperature, seed: sampleSeed });
				status = `Generated 80 characters at update ${model.step}. No model parameters were updated.`;
			} catch (reason) {
				error = reason instanceof Error ? reason.message : 'Generation stopped.';
			}
			generating = false;
		}, 10);
	}
	function exportEvidence() {
		if (!model) return;
		const result = {
			provenance: TRANSFORMER_PROVENANCE,
			finalExposure: exposure,
			exposureBeforeReveal,
			priorFinalCasesKnown: hasRevealed,
			config: activeConfig,
			step: model.step,
			metrics,
			history,
			final,
			inspection: trace,
			generation: generated
		};
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
		);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'willow-transformer-experiment.json';
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
	onMount(() => {
		reset();
		const visibility = () => {
			if (document.hidden && running) {
				pause();
				refresh();
			}
		};
		document.addEventListener('visibilitychange', visibility);
		return () => {
			pause(false);
			document.removeEventListener('visibilitychange', visibility);
		};
	});
</script>

<div class="transformer-workbench">
	<div class="intro">
		<span class="live-label"
			><Icon name="sparkles" size={16} />A REAL MODEL, SMALL ENOUGH TO SEE</span
		>
		<h2>From random weights to the next character.</h2>
		<p>
			Train a causal transformer on original finance sentences. Follow the actual attention
			calculation. Then watch it generate one character at a time.
		</p>
		<div class="model-tags">
			<span>5,761 learned numbers</span><span>32-character context</span><span
				>2 attention heads</span
			><span>CPU · no download</span>
		</div>
	</div>
	<div class="switcher" aria-label="Experiment views">
		<button
			class:chosen={tab === 'train'}
			aria-pressed={tab === 'train'}
			onclick={() => (tab = 'train')}
			><span>01</span><Icon name="chart" size={17} />Train a model</button
		><button
			class:chosen={tab === 'inspect'}
			aria-pressed={tab === 'inspect'}
			onclick={() => {
				tab = 'inspect';
				inspect();
			}}><span>02</span><Icon name="search" size={17} />Look inside</button
		><button
			class:chosen={tab === 'generate'}
			aria-pressed={tab === 'generate'}
			onclick={() => (tab = 'generate')}
			><span>03</span><Icon name="messages" size={17} />Generate text</button
		>
	</div>
	<p class="status" role="status">{status}</p>
	{#if error}<p class="error" role="alert">{error}</p>{/if}
	{#if metrics && trace && activeConfig}
		{#if tab === 'train'}
			<section class="training-controls">
				<div class="control-fields">
					<label
						>Random seed<input
							type="number"
							min="0"
							max="99999"
							step="1"
							bind:value={seed}
							disabled={running || generating}
						/></label
					><label
						>Learning rate<select bind:value={rate} disabled={running || generating}
							><option value={0.001}>0.001 · smaller updates</option><option value={0.004}
								>0.004 · default</option
							><option value={0.015}>0.015 · larger updates</option></select
						></label
					>
					<div class="training-fact">
						<strong>40 training sentences</strong><span
							>8 validation sentences · 8 sealed final sentences</span
						>
					</div>
				</div>
				<div class="toolbar">
					<button
						class="primary"
						onclick={() => train(100)}
						disabled={running || generating || !!final || metrics.step >= 3000}
						><Icon name="play" size={15} />Train 100 updates</button
					><button
						onclick={() => train(500)}
						disabled={running || generating || !!final || metrics.step >= 3000}>Train 500</button
					><button
						onclick={() => {
							pause();
							refresh();
						}}
						disabled={!running}><Icon name="pause" size={15} />Pause</button
					><button onclick={reset}
						><Icon name="reset" size={15} />{pending
							? 'Apply settings & reset'
							: 'Reset model'}</button
					><button onclick={exportEvidence}><Icon name="download" size={15} />Save evidence</button>
				</div>
				{#if pending}<p class="note">
						New settings apply only after reset. The displayed model still uses seed {activeConfig.seed}
						and learning rate {activeConfig.learningRate}.
					</p>{/if}{#if hasRevealed}<p class="note">
						Final cases have already been viewed in this browser. These sentences stay the same
						across model seeds, so resetting or changing the seed does not make them independent
						test evidence.
					</p>{/if}
				{#if exposure?.state === 'unavailable'}<p class="note">
						Earlier final-case reveals cannot be verified in browser storage. Prior exposure is
						unknown; save your evidence and do not claim a fresh independent test.
					</p>{/if}
			</section>
			<div class="metrics">
				<div>
					<span>PARAMETER UPDATES</span><strong>{metrics.step}</strong><small
						>One update averages two windows</small
					>
				</div>
				<div>
					<span>TRAINING LOSS</span><strong>{metrics.train.loss.toFixed(3)}</strong><small
						>{metrics.train.targetTokens} target characters</small
					>
				</div>
				<div>
					<span>VALIDATION LOSS</span><strong>{metrics.validation.loss.toFixed(3)}</strong><small
						>{metrics.validation.targetTokens} held-out characters</small
					>
				</div>
			</div>
			<section class="loss-panel">
				<div class="panel-heading">
					<h3>Learning is a change you can measure.</h3>
					<span>MEAN NEXT-CHARACTER CROSS-ENTROPY</span>
				</div>
				<svg viewBox="0 0 620 225" role="img" aria-labelledby={`${id}-loss`}
					><title id={`${id}-loss`}
						>Training loss {metrics.train.loss.toFixed(3)} and validation loss {metrics.validation.loss.toFixed(
							3
						)} at update {metrics.step}.</title
					>{#each [0, 1, 2, 3] as tick (tick)}<line
							x1="48"
							x2="588"
							y1={186 - (tick / 3) * 158}
							y2={186 - (tick / 3) * 158}
							stroke="#e6e2eb"
						/><text x="39" y={190 - (tick / 3) * 158} text-anchor="end"
							>{((tick / 3) * chartMax).toFixed(1)}</text
						>{/each}<path d={line('train')} stroke="#286a51" stroke-width="3" fill="none" /><path
						d={line('validation')}
						stroke="#8460a6"
						stroke-width="3"
						stroke-dasharray="7 4"
						fill="none"
					/><text x="48" y="207">0</text><text x="588" y="207" text-anchor="end"
						>{lastStep} updates</text
					></svg
				>
				<div class="legend">
					<span><i class="green"></i>Training</span><span><i class="purple"></i>Validation</span>
				</div>
				<p>
					Lower loss means more probability assigned to the actual next characters. It does not
					establish that a generated financial statement is true. Watch both curves: fitting the
					training sentences and predicting unseen sentences are different achievements.
				</p>
			</section>
			<section class="training-example">
				<div class="panel-heading"><h3>Where does the teaching signal come from?</h3></div>
				<label
					>Inspect a training sentence<select
						value={selectedDocument}
						onchange={(e) => {
							selectedDocument = Number(e.currentTarget.value);
							example = model!.trainingExample(selectedDocument);
						}}
						>{#each FINANCE_CORPUS.train as sentence, i (i)}<option value={i}
								>{i + 1}. {sentence}</option
							>{/each}</select
					></label
				>{#if example}<div class="shifted-sequence">
						<div><span>INPUT</span><code>{example.inputText.replaceAll('\n', '↵')}</code></div>
						<div>
							<span>NEXT-CHARACTER TARGET</span><code
								>{example.targetText.replaceAll('\n', '↵')}</code
							>
						</div>
					</div>
					<p>
						At each input position, the model must predict the target directly below it. The target
						is shifted one place. A causal mask prevents earlier positions from using later input
						characters. Errors across the window provide gradients that change embeddings, attention
						projections and feed-forward weights.
					</p>{/if}
				<div class="process-strip">
					<span><b>1</b>Predict characters</span><Icon name="arrow" size={14} /><span
						><b>2</b>Measure loss</span
					><Icon name="arrow" size={14} /><span><b>3</b>Backpropagate</span><Icon
						name="arrow"
						size={14}
					/><span><b>4</b>Update weights</span>
				</div>
			</section>
			<section class="final-card">
				<Icon name="shield" size={25} />
				<div>
					<h3>{final ? 'Final corpus evaluated.' : 'Keep one set of sentences untouched.'}</h3>
					{#if final}<p>
							At update <strong>{final.step}</strong>, final cross-entropy was
							<strong>{final.score.loss.toFixed(3)}</strong>
							on {final.score.targetTokens} characters from eight separate sentences. Perplexity was {final.score.perplexity.toFixed(
								2
							)}; it is the exponential of loss, not a truth score. This model is frozen for further
							training.
						</p>{:else}<p>
							Use validation to choose the update count and learning rate. Commit once to reveal the
							final next-character prediction loss.
						</p>
						<button onclick={commit} disabled={running || metrics.step === 0}
							>Commit & reveal final loss <Icon name="arrow" size={16} /></button
						>{/if}
				</div>
			</section>
			<details>
				<summary>Read loss history and original corpus</summary>
				<div class="table-scroll">
					<table>
						<caption>Measured evaluation checkpoints</caption><thead
							><tr
								><th scope="col">Update</th><th scope="col">Training loss</th><th scope="col"
									>Validation loss</th
								></tr
							></thead
						><tbody
							>{#each history as row, i (i)}<tr
									><th scope="row">{row.step}</th><td>{row.train.toFixed(5)}</td><td
										>{row.validation.toFixed(5)}</td
									></tr
								>{/each}</tbody
						>
					</table>
				</div>
				<h4>Training documents</h4>
				<ol class="corpus-list">
					{#each FINANCE_CORPUS.train as sentence, i (i)}<li>{sentence}</li>{/each}
				</ol>
				<h4>Validation documents</h4>
				<ol class="corpus-list">
					{#each FINANCE_CORPUS.validation as sentence, i (i)}<li>{sentence}</li>{/each}
				</ol>
				{#if final}<h4>Final documents, now revealed</h4>
					<ol class="corpus-list">
						{#each FINANCE_CORPUS.test as sentence, i (i)}<li>{sentence}</li>{/each}
					</ol>{/if}
			</details>
		{:else if tab === 'inspect'}
			<section class="inspector-controls">
				<label
					>Text to pass through this model<input
						type="text"
						maxlength="300"
						value={inspectText}
						oninput={(e) => {
							inspectText = e.currentTarget.value;
							inspect();
						}}
					/></label
				>
				<p>
					Spaces are shown as ␣ and newline as ↵. This lab uses an explicitly limited character
					tokenizer; it is not a commercial LLM tokenizer.
				</p>
				{#if trace.truncated}<p class="note">
						Only the last 32 characters fit in this model’s context. Position embeddings restart at
						zero for this window.
					</p>{/if}{#if trace.tokens.some((t) => t.unknown)}<p class="note">
						Some characters are outside the fixed ASCII vocabulary. They are explicitly mapped to
						the unknown token �; their original values are retained in the token table.
					</p>{/if}
				<div class="token-ribbon" aria-label="Choose a query token">
					{#each trace.tokens as token, i (i)}<button
							aria-pressed={query === i}
							class:selected={query === i}
							onclick={() => (position = i)}
							aria-label={`Inspect position ${i}: ${tokenName(token.piece)}, ID ${token.id}`}
							><strong>{tokenLabel(token.piece)}</strong><small>{i} · ID {token.id}</small></button
						>{/each}
				</div>
			</section>
			<div class="attention-heading">
				<div>
					<h3>Where does position {query} look?</h3>
					<p>
						Attention is a temporary distribution for this input, computed from learned query and
						key projections.
					</p>
				</div>
				<label
					>Attention head<select bind:value={head}
						><option value={0}>Head 1</option><option value={1}>Head 2</option></select
					></label
				>
			</div>
			<div class="table-scroll attention-scroll">
				<table class="attention-table">
					<caption
						>Actual attention weights · head {head + 1}. Rows are query positions; columns are key
						positions. Select a row to inspect it. Future positions are masked.</caption
					><thead
						><tr
							><th scope="col">Query ↓ / key →</th>{#each trace.tokens as token, i (i)}<th
									scope="col"><strong>{tokenLabel(token.piece)}</strong><small>{i}</small></th
								>{/each}</tr
						></thead
					><tbody
						>{#each trace.attention[head] as row, r (r)}<tr class:active-query={query === r}
								><th scope="row"
									><button onclick={() => (position = r)} aria-pressed={query === r}
										>{r} · {tokenLabel(trace.tokens[r].piece)}</button
									></th
								>{#each row as weight, c (c)}<td
										class:masked={c > r}
										style:background={c > r ? undefined : `hsl(150 24% ${97 - weight * 35}%)`}
										style:color="#183b2b"
										>{c > r ? '—' : (weight * 100).toFixed(1)}<span class="sr-only"
											>{c > r ? 'masked' : ' percent'}</span
										></td
									>{/each}</tr
							>{/each}</tbody
					>
				</table>
			</div>
			<section class="attention-row">
				<p class="eyebrow">ONE ROW, UNPACKED</p>
				<h3>Query {query}: “{tokenName(trace.tokens[query].piece)}”</h3>
				<div class="weight-bars">
					{#each trace.attention[head][query] as weight, i (i)}<div class:future={i > query}>
							<span>{i} · {tokenLabel(trace.tokens[i].piece)}</span>
							<div class="bar-track"><i style:width={`${weight * 100}%`}></i></div>
							<strong>{i > query ? 'Masked' : `${(weight * 100).toFixed(2)}%`}</strong>
						</div>{/each}
				</div>
				<p>
					Visible scores are normalized to weights that sum to 100%. The model uses them to mix <strong
						>value vectors</strong
					>, not to vote on whether a sentence is true. A high attention weight does not by itself
					explain why an answer is correct.
				</p>
			</section>
			<section class="mechanism">
				<h3>Follow that token all the way through.</h3>
				<div class="mechanism-cards">
					<div>
						<b>01</b>
						<h4>Represent</h4>
						<p>
							Token ID {trace.tokens[query].id} selects a learned 16-number embedding. A learned position
							vector for position {query} is added.
						</p>
					</div>
					<div>
						<b>02</b>
						<h4>Consult earlier positions</h4>
						<p>
							Normalized values are projected into Q, K and V. Two masked attention heads mix
							available values. A projection combines their outputs.
						</p>
					</div>
					<div>
						<b>03</b>
						<h4>Transform & preserve</h4>
						<p>
							The attention result is added to the residual stream. A normalized feed-forward layer
							expands 16 values to 32, applies ReLU and contracts to 16; another residual is added.
						</p>
					</div>
					<div>
						<b>04</b>
						<h4>Score the vocabulary</h4>
						<p>
							Final normalization and a learned projection produce 97 logits. Softmax converts them
							to the next-character distribution below.
						</p>
					</div>
				</div>
				<details>
					<summary>Inspect all 16 values at position {query}</summary>
					<div class="table-scroll">
						<table>
							<caption
								>Measured forward trace. Dimensions are features; embedding ID proximity has no
								semantic meaning.</caption
							><thead
								><tr
									><th scope="col">Dim.</th><th scope="col">Token vector</th><th scope="col"
										>Position vector</th
									><th scope="col">Combined input</th><th scope="col">Query</th><th scope="col"
										>Key</th
									><th scope="col">Value</th><th scope="col">Weighted values</th><th scope="col"
										>Mixed attention</th
									><th scope="col">First residual</th><th scope="col">Feed-forward</th><th
										scope="col">Final residual</th
									></tr
								></thead
							><tbody
								>{#each trace.embedded[query] as embeddingValue, d (d)}<tr
										><th scope="row">{d + 1}</th><td
											>{trace.tokenEmbeddings[query][d].toFixed(4)}</td
										><td>{trace.positionEmbeddings[query][d].toFixed(4)}</td><td
											>{embeddingValue.toFixed(4)}</td
										><td>{trace.queries[query][d].toFixed(4)}</td><td
											>{trace.keys[query][d].toFixed(4)}</td
										><td>{trace.values[query][d].toFixed(4)}</td><td
											>{trace.attentionOutput[query][d].toFixed(4)}</td
										><td>{trace.attentionMixed[query][d].toFixed(4)}</td><td
											>{trace.attentionResidual[query][d].toFixed(4)}</td
										><td>{trace.feedForward[query][d].toFixed(4)}</td><td
											>{trace.finalResidual[query][d].toFixed(4)}</td
										></tr
									>{/each}</tbody
							>
						</table>
					</div>
					<p>Feed-forward expansion (32 values, after ReLU):</p>
					<code class="vector-values"
						>{trace.feedForwardHidden[query].map((value) => value.toFixed(3)).join(' · ')}</code
					>
				</details>
			</section>
			<section class="next-distribution">
				<div class="panel-heading">
					<h3>What comes after position {query}?</h3>
					<span>ACTUAL DISTRIBUTION AT UPDATE {trace.step}</span>
				</div>
				<p>
					The model sees only positions 0 through {query} when computing this row, even though the whole
					input is shown above.
				</p>
				<div class="probability-list">
					{#each topTokens as token (token.id)}<div>
							<code>{tokenLabel(token.piece)}</code>
							<div class="probability-track">
								<i style:width={`${(token.probability / topTokens[0].probability) * 100}%`}></i>
							</div>
							<strong>{(token.probability * 100).toFixed(2)}%</strong><span
								>logit {token.logit.toFixed(3)}</span
							>
						</div>{/each}
				</div>
				<p class="caption">
					Top ten of 97 possible tokens. Bars are scaled relative to the largest of these
					probabilities; printed percentages give absolute probability. This is token likelihood,
					not the chance that a financial claim is correct.
				</p>
			</section>
			<details>
				<summary>Token IDs, original characters and exact attention scores</summary>
				<div class="table-scroll">
					<table>
						<caption>Selected attention row before and after normalization</caption><thead
							><tr
								><th scope="col">Position</th><th scope="col">Original character</th><th scope="col"
									>Token ID</th
								><th scope="col">Scaled Q·K score</th><th scope="col">Weight</th></tr
							></thead
						><tbody
							>{#each trace.tokens as token, i (i)}<tr
									><th scope="row">{i}</th><td>{tokenName(token.original)}</td><td
										>{token.id}{token.unknown ? ' (unknown)' : ''}</td
									><td
										>{i > query
											? '−∞ (masked)'
											: trace.attentionScores[head][query][i].toFixed(6)}</td
									><td>{(trace.attention[head][query][i] * 100).toFixed(4)}%</td></tr
								>{/each}</tbody
						>
					</table>
				</div>
			</details>
		{:else}
			<section class="generation-controls">
				<div class="panel-heading">
					<h3>Freeze the weights. Extend the context.</h3>
					<span>MODEL UPDATE {metrics.step}</span>
				</div>
				<label
					>Starting context<textarea rows="3" maxlength="200" bind:value={prompt}></textarea></label
				>
				<div class="generation-settings">
					<label
						>Temperature <strong>{temperature.toFixed(1)}</strong><input
							type="range"
							min="0"
							max="1.6"
							step="0.1"
							bind:value={temperature}
						/></label
					><label
						>Sampling seed<input
							type="number"
							min="0"
							max="99999"
							step="1"
							bind:value={sampleSeed}
						/></label
					><button class="primary" onclick={generate} disabled={running || generating}
						><Icon name="sparkles" size={16} />{generating
							? 'Generating…'
							: 'Generate 80 characters'}</button
					>
				</div>
				<p>
					Temperature 0 selects the most likely token. Higher values spread selection across more
					alternatives. Keep the prompt, trained weights and seed fixed to compare one setting at a
					time.
				</p>
				{#if metrics.step === 0}<p class="note">
						This model still has random weights. Its output should be nonsensical. Train it first to
						see what a small corpus can—and cannot—teach it.
					</p>{/if}{#if running}<p class="note">
						Training is still running. Pause it in the Train view before generating a controlled
						sample.
					</p>{/if}
			</section>
			{#if generated}<section class="generated-card">
					<span class="generated-label"
						><Icon name="messages" size={15} />ACTUAL LOCAL MODEL OUTPUT · UPDATE {generated.step}</span
					>
					<div class="generated-text">
						<span class="prompt-text">{generated.prompt}</span><span>{generated.continuation}</span>
					</div>
					<div class="sample-meta">
						<span>80 selected characters</span><span
							>Temperature {generated.temperature.toFixed(1)}</span
						><span>No parameter updates</span>
					</div>
					<p>
						Fluency, repetition, mistakes and nonsense are all authentic observations. This tiny
						model is not instruction tuned and its output is not accounting advice. Improved
						sentence patterns do not establish factual reliability.
					</p>
					<details>
						<summary>Inspect each generated token and its selection probability</summary>
						<div class="table-scroll">
							<table>
								<caption
									>Model probability uses temperature 1. Sampling probability uses the selected
									temperature.</caption
								><thead
									><tr
										><th scope="col">Step</th><th scope="col">Character</th><th scope="col"
											>Token ID</th
										><th scope="col">Model probability</th><th scope="col">Sampling probability</th
										></tr
									></thead
								><tbody
									>{#each generated.tokens as token, i (i)}<tr
											><th scope="row">{i + 1}</th><td>{tokenName(token.piece)}</td><td
												>{token.id}</td
											><td>{(token.modelProbability * 100).toFixed(3)}%</td><td
												>{(token.samplingProbability * 100).toFixed(3)}%</td
											></tr
										>{/each}</tbody
								>
							</table>
						</div>
					</details>
				</section>{:else}<div class="generation-empty">
					<Icon name="messages" size={38} />
					<h3>Your first continuation will appear here.</h3>
					<p>
						Predict what changing the temperature will affect before you run it. Will it supply
						missing company facts?
					</p>
				</div>{/if}
			<div class="generation-cycle">
				<span>Context</span><Icon name="arrow" size={17} /><span>Transformer</span><Icon
					name="arrow"
					size={17}
				/><span>Token probabilities</span><Icon name="arrow" size={17} /><span
					>Select one token</span
				><Icon name="arrow" size={17} /><span>Append & repeat</span>
			</div>
			<p class="caption">
				The same forward pass is repeated for each generated character. Once the context grows
				beyond 32 characters, the oldest characters fall outside this model’s input window.
			</p>
		{/if}
	{/if}
	<details class="provenance">
		<summary>Model card: what this experiment computes</summary>
		<p>
			{TRANSFORMER_PROVENANCE.architecture} The 97-token vocabulary contains printable ASCII, newline
			and an explicit unknown character. There is one decoder block; modern large language models use
			much larger and varied architectures.
		</p>
		<p>
			{TRANSFORMER_PROVENANCE.objective} Evaluation is token-weighted over fixed nonoverlapping windows.
			Documents never cross split boundaries. Validation does not contribute gradients; repeated use to
			choose settings makes it development evidence.
		</p>
		<p>
			{TRANSFORMER_PROVENANCE.limitations} Corpus: {FINANCE_CORPUS.version}. All sentences are
			original teaching material. No API, model download or GPU is required. Training stops at 3,000
			updates per run and pauses when the tab is hidden. This browser session resets on navigation;
			use Save evidence in the Train view before leaving.
		</p>
	</details>
</div>

<style>
	.transformer-workbench {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 20px;
		min-width: 0;
		color: var(--ink);
	}
	.intro {
		background: linear-gradient(125deg, #eee9f6, #f7f4ed);
		border: 1px solid #e5dfee;
		border-radius: 20px;
		padding: 29px 31px;
	}
	.live-label {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 10px;
		letter-spacing: 1.3px;
		color: #72578f;
		font-weight: 750;
	}
	.intro h2 {
		font-size: clamp(23px, 3vw, 32px);
		line-height: 1.3;
		letter-spacing: -1px;
		margin: 13px 0 10px;
	}
	.intro p,
	p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
	}
	.model-tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 20px;
	}
	.model-tags span {
		background: #ffffff9c;
		border: 1px solid #e4dde9;
		border-radius: 6px;
		font-size: 10px;
		padding: 6px 9px;
		color: #5c5065;
	}
	.switcher {
		display: flex;
		gap: 8px;
		padding: 6px;
		border: 1px solid var(--line);
		background: #f3f5ef;
		border-radius: 14px;
	}
	.switcher button {
		flex: 1;
		border-color: transparent;
		background: transparent;
		min-height: 48px;
		font-size: 12px;
	}
	.switcher button span {
		font-size: 10px;
		color: #73806b;
		margin-right: 2px;
	}
	.switcher button.chosen {
		background: #fff;
		box-shadow: 0 2px 8px #263e3310;
		border-color: #dde5d8;
	}
	.status {
		font-size: 12px;
		min-height: 22px;
	}
	.error,
	.note {
		border-radius: 10px;
		background: #fbf0df;
		padding: 12px 15px;
		font-size: 12px;
		line-height: 1.75;
		margin-top: 12px;
	}
	.error {
		color: #923f31;
		background: #fceae3;
		margin: 0;
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		min-height: 42px;
		border: 1px solid #dcdfe4;
		background: #fff;
		border-radius: 9px;
		padding: 11px 14px;
		font-size: 12px;
		font-weight: 650;
	}
	button:hover:not(:disabled) {
		background: #f1ecf7;
	}
	.primary {
		background: #675082;
		border-color: #675082;
		color: white;
	}
	.primary:hover:not(:disabled) {
		background: #513e6b;
	}
	label {
		font-size: 11px;
		font-weight: 650;
		display: grid;
		gap: 8px;
	}
	input[type='text'],
	input[type='number'],
	textarea,
	select {
		font-size: 12px;
		background: #fff;
		border: 1px solid #dce1d6;
		border-radius: 9px;
		padding: 11px;
		min-height: 42px;
		width: 100%;
	}
	textarea {
		resize: vertical;
		line-height: 1.8;
	}
	.control-fields {
		display: grid;
		grid-template-columns: 120px 200px 1fr;
		gap: 16px;
		align-items: center;
	}
	.training-fact {
		margin-left: auto;
		text-align: right;
	}
	.training-fact strong {
		display: block;
		font-size: 12px;
	}
	.training-fact span {
		font-size: 10px;
		color: var(--muted);
		display: block;
		margin-top: 5px;
	}
	.toolbar {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 17px;
	}
	.metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 1px solid var(--line);
		border-radius: 16px;
		background: #fff;
		overflow: hidden;
	}
	.metrics > div {
		padding: 20px;
		border-right: 1px solid var(--line);
	}
	.metrics > div:last-child {
		border-right: 0;
	}
	.metrics span {
		font-size: 9px;
		letter-spacing: 1px;
		font-weight: 700;
		color: #687062;
	}
	.metrics strong {
		display: block;
		font-family: 'Manrope Variable', sans-serif;
		font-size: 31px;
		margin: 6px 0;
		letter-spacing: -1px;
	}
	.metrics small {
		font-size: 10px;
		color: var(--muted);
	}
	.loss-panel,
	.training-example,
	.attention-row,
	.mechanism,
	.next-distribution,
	.generation-controls {
		border: 1px solid var(--line);
		border-radius: 17px;
		background: #fff;
		padding: 24px;
		min-width: 0;
	}
	.panel-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 15px;
		margin-bottom: 15px;
	}
	.panel-heading h3,
	.attention-heading h3,
	.mechanism h3,
	.attention-row h3,
	.final-card h3,
	.generation-empty h3 {
		font-size: 17px;
		line-height: 1.5;
		letter-spacing: -0.4px;
	}
	.panel-heading > span {
		font-size: 8px;
		letter-spacing: 0.6px;
		color: #79638a;
		white-space: nowrap;
		font-weight: 650;
	}
	.loss-panel svg {
		width: 100%;
		max-height: 310px;
		display: block;
	}
	.loss-panel svg text {
		font-size: 11px;
		fill: #647064;
	}
	.legend {
		display: flex;
		gap: 17px;
		font-size: 11px;
		margin: 6px 0 13px;
	}
	.legend span {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.legend i {
		height: 3px;
		width: 21px;
		display: block;
	}
	.green {
		background: #286a51;
	}
	.purple {
		background: #8460a6;
	}
	.shifted-sequence {
		background: #f6f4fa;
		padding: 17px;
		border-radius: 11px;
		margin: 18px 0;
		overflow: auto;
	}
	.shifted-sequence > div {
		display: grid;
		grid-template-columns: 165px 1fr;
		gap: 14px;
		align-items: center;
		margin: 9px 0;
		min-width: 490px;
	}
	.shifted-sequence span {
		font-size: 9px;
		letter-spacing: 0.7px;
		color: #746583;
	}
	.shifted-sequence code {
		white-space: pre;
		font-size: 13px;
		letter-spacing: 1px;
		color: #4a3c5b;
	}
	.process-strip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 9px;
		flex-wrap: wrap;
		margin-top: 20px;
	}
	.process-strip span {
		font-size: 10px;
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.process-strip b {
		background: #ece9f1;
		border-radius: 50%;
		height: 22px;
		width: 22px;
		display: grid;
		place-items: center;
		font-size: 9px;
		color: #735b8c;
	}
	.final-card {
		display: flex;
		align-items: flex-start;
		gap: 17px;
		background: #eaf1e5;
		border: 1px solid #dce7d5;
		border-radius: 16px;
		padding: 23px;
	}
	.final-card h3 {
		margin-bottom: 8px;
	}
	.final-card button {
		background: #286a51;
		border-color: #286a51;
		color: white;
		margin-top: 16px;
	}
	.final-card button:hover:not(:disabled) {
		background: #1e533e;
	}
	details {
		border: 1px solid var(--line);
		border-radius: 12px;
		background: #f8f8f4;
		padding: 17px 19px;
		min-width: 0;
	}
	summary {
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}
	details p {
		margin-top: 13px;
		font-size: 12px;
	}
	details h4 {
		font-size: 13px;
		margin-top: 22px;
	}
	.corpus-list {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.9;
		padding-left: 22px;
	}
	.table-scroll {
		min-width: 0;
		max-width: 100%;
		overflow: auto;
		max-height: 400px;
		margin-top: 16px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		background: #fff;
	}
	caption {
		font-size: 11px;
		text-align: left;
		padding: 8px 0 12px;
		color: var(--muted);
		line-height: 1.75;
	}
	th,
	td {
		border-bottom: 1px solid var(--line);
		padding: 10px 12px;
		white-space: nowrap;
		text-align: right;
	}
	th:first-child {
		text-align: left;
	}
	thead th {
		background: #eeeaf5;
		position: sticky;
		top: 0;
	}
	tbody th {
		font-weight: 500;
	}
	.inspector-controls > p {
		font-size: 12px;
		margin-top: 9px;
	}
	.token-ribbon {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-top: 20px;
	}
	.token-ribbon button {
		display: grid;
		gap: 5px;
		min-width: 48px;
		padding: 9px;
		background: #fff;
		min-height: 65px;
	}
	.token-ribbon button strong {
		font-family: monospace;
		font-size: 20px;
		font-weight: 500;
	}
	.token-ribbon button small {
		font-size: 8px;
		font-weight: 450;
		color: var(--muted);
	}
	.token-ribbon button.selected {
		background: #ece5f4;
		border-color: #8d75a5;
		box-shadow: 0 0 0 1px #8d75a5;
	}
	.attention-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 22px;
	}
	.attention-heading p {
		font-size: 12px;
		margin-top: 4px;
	}
	.attention-heading label {
		min-width: 125px;
	}
	.attention-scroll {
		margin: 0;
		border: 1px solid var(--line);
		border-radius: 12px;
		max-height: 560px;
	}
	.attention-table {
		width: auto;
		min-width: 100%;
		font-size: 10px;
	}
	.attention-table caption {
		padding: 13px 17px;
		background: #fff;
		min-width: 300px;
		white-space: normal;
	}
	.attention-table th,
	.attention-table td {
		position: relative;
		padding: 9px 10px;
		text-align: center;
		min-width: 43px;
		border: 1px solid #fff;
	}
	.attention-table th:first-child {
		text-align: left;
		position: sticky;
		left: 0;
		background: #f0ecef;
		z-index: 1;
	}
	.attention-table thead th:first-child {
		z-index: 2;
	}
	.attention-table th strong {
		font-family: monospace;
		font-size: 14px;
		display: block;
	}
	.attention-table th small {
		display: block;
		font-weight: 400;
		font-size: 8px;
		margin-top: 4px;
	}
	.attention-table th button {
		padding: 5px 8px;
		min-height: 30px;
		font-size: 10px;
		border: 0;
		background: transparent;
	}
	.attention-table tr.active-query th button {
		background: #6a5083;
		color: #fff;
	}
	.attention-table .active-query td {
		box-shadow:
			inset 0 2px #927ca6,
			inset 0 -2px #927ca6;
	}
	.attention-table td.masked {
		background: repeating-linear-gradient(135deg, #f5f4f1, #f5f4f1 4px, #eeece9 4px, #eeece9 5px);
		color: #8e8a8a;
	}
	.eyebrow {
		font-size: 9px !important;
		letter-spacing: 1.2px;
		color: #7a638e !important;
		font-weight: 700;
		margin-bottom: 7px;
	}
	.weight-bars {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px 28px;
		margin: 18px 0;
	}
	.weight-bars > div {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 11px;
	}
	.weight-bars > div > span {
		width: 44px;
		font-family: monospace;
		flex-shrink: 0;
	}
	.weight-bars strong {
		width: 61px;
		text-align: right;
		font-size: 10px;
		font-weight: 550;
	}
	.bar-track {
		height: 11px;
		flex: 1;
		background: #f0f2eb;
		border-radius: 4px;
		overflow: hidden;
	}
	.bar-track i {
		display: block;
		height: 100%;
		background: #60947b;
	}
	.weight-bars .future {
		color: #63705e;
	}
	.mechanism-cards {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 15px;
		margin: 19px 0;
	}
	.mechanism-cards > div {
		background: #f5f4f9;
		border-radius: 11px;
		padding: 17px;
	}
	.mechanism-cards b {
		font-size: 10px;
		color: #73558e;
	}
	.mechanism-cards h4 {
		font-size: 13px;
		margin: 10px 0;
	}
	.mechanism-cards p {
		font-size: 11px;
	}
	.vector-values {
		display: block;
		font-size: 11px;
		color: #695278;
		background: #f0eaf5;
		padding: 12px;
		border-radius: 8px;
		line-height: 2;
		overflow-wrap: anywhere;
		margin-top: 8px;
	}
	.probability-list {
		display: grid;
		gap: 12px;
		margin-top: 20px;
	}
	.probability-list > div {
		display: flex;
		gap: 12px;
		align-items: center;
		font-size: 11px;
	}
	.probability-list code {
		width: 30px;
		text-align: center;
		background: #f1edf5;
		border-radius: 5px;
		padding: 5px;
		font-size: 15px;
	}
	.probability-track {
		height: 17px;
		background: #f4f1f6;
		flex: 1;
		border-radius: 4px;
		overflow: hidden;
	}
	.probability-track i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #d3c1e3, #8a6ba6);
		border-radius: 4px;
	}
	.probability-list strong {
		font-size: 11px;
		width: 62px;
		text-align: right;
		font-weight: 550;
	}
	.probability-list span {
		width: 83px;
		text-align: right;
		font-size: 10px;
		color: var(--muted);
	}
	.caption {
		font-size: 11px !important;
		margin-top: 15px;
	}
	.generation-settings {
		display: grid;
		grid-template-columns: 1fr 130px auto;
		gap: 22px;
		align-items: end;
		margin: 18px 0;
	}
	.generation-settings label strong {
		float: right;
	}
	.generation-settings input[type='range'] {
		margin: 5px 0 10px;
	}
	.generated-card {
		border: 1px solid #dbd3e4;
		background: #f4eff8;
		border-radius: 17px;
		padding: 24px;
		min-width: 0;
	}
	.generated-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.7px;
		color: #745a8c;
	}
	.generated-text {
		font-family: monospace;
		font-size: 19px;
		line-height: 1.85;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		color: #574369;
		min-height: 125px;
		margin: 23px 0;
	}
	.prompt-text {
		color: #5f7161;
		background: #e5ecdf;
	}
	.sample-meta {
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
		font-size: 10px;
		color: #786786;
		border-top: 1px solid #e3dbea;
		padding-top: 14px;
		margin-bottom: 14px;
	}
	.generated-card details {
		margin-top: 18px;
		background: #ffffff9c;
	}
	.generation-empty {
		padding: 46px;
		text-align: center;
		background: #f6f5f1;
		border: 1px dashed #d9d4de;
		border-radius: 16px;
		color: #aa94b8;
	}
	.generation-empty h3 {
		color: #5d5364;
		margin: 16px 0 10px;
	}
	.generation-empty p {
		max-width: 500px;
		margin: auto;
	}
	.generation-cycle {
		display: flex;
		gap: 11px;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}
	.generation-cycle span {
		padding: 10px 13px;
		background: #edf1e7;
		border-radius: 8px;
		font-size: 11px;
	}
	.provenance {
		background: #f7f4eb;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	@media (max-width: 1000px) {
		.control-fields {
			grid-template-columns: 120px 1fr;
		}
		.training-fact {
			grid-column: 1/-1;
			text-align: left;
			margin: 0;
		}
		.mechanism-cards {
			grid-template-columns: repeat(2, 1fr);
		}
		.generation-settings {
			grid-template-columns: 1fr 120px;
		}
		.generation-settings button {
			grid-column: 1/-1;
		}
		.panel-heading > span {
			white-space: normal;
			text-align: right;
			max-width: 140px;
		}
	}
	@media (max-width: 600px) {
		.intro {
			padding: 22px;
		}
		.switcher {
			gap: 2px;
			padding: 4px;
		}
		.switcher button {
			font-size: 10px;
			padding: 10px 5px;
			gap: 5px;
			flex-wrap: wrap;
		}
		.switcher button span {
			display: none;
		}
		.metrics > div {
			padding: 14px;
		}
		.metrics span {
			font-size: 7px;
			letter-spacing: 0.6px;
		}
		.metrics strong {
			font-size: 26px;
		}
		.metrics small {
			font-size: 9px;
			line-height: 1.6;
		}
		.loss-panel,
		.training-example,
		.attention-row,
		.mechanism,
		.next-distribution,
		.generation-controls,
		.generated-card {
			padding: 18px;
		}
		.panel-heading > span {
			display: none;
		}
		.toolbar button {
			flex: 1;
			font-size: 11px;
			padding: 10px;
		}
		.process-strip {
			justify-content: flex-start;
		}
		.weight-bars {
			grid-template-columns: 1fr;
		}
		.attention-heading {
			align-items: flex-start;
			gap: 12px;
		}
		.attention-heading h3 {
			font-size: 16px;
		}
		.attention-heading label {
			min-width: 100px;
		}
		.attention-heading p {
			font-size: 11px;
		}
		.mechanism-cards {
			gap: 10px;
		}
		.mechanism-cards > div {
			padding: 13px;
		}
		.mechanism-cards h4 {
			font-size: 12px;
		}
		.probability-list > div {
			gap: 8px;
		}
		.probability-list span {
			display: none;
		}
		.token-ribbon {
			gap: 5px;
		}
		.token-ribbon button {
			min-width: 40px;
			padding: 8px 5px;
		}
		.token-ribbon button small {
			font-size: 7px;
		}
		.generation-empty {
			padding: 28px;
		}
		.generated-text {
			font-size: 16px;
		}
		.generation-cycle {
			gap: 7px;
		}
		.generation-cycle span {
			padding: 8px;
			font-size: 10px;
		}
		.final-card {
			padding: 18px;
			gap: 12px;
		}
	}
</style>
