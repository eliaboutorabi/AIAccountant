<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Cpu,
		Download,
		Workflow,
		Square,
		Search,
		Braces,
		FileCheck2,
		FlaskConical
	} from '@lucide/svelte';
	import {
		LOCAL_MODEL,
		agentPrompt,
		boundedConfig,
		defaultAgent,
		type AgentConfig,
		type AgentOutcome,
		type AgentTrace,
		type AgentWorkerInput,
		type AgentWorkerOutput
	} from '$lib/engines/local-agent';
	const uid = $props.id();
	let support = $state<'checking' | 'available' | 'unavailable'>('checking');
	let supportDetail = $state(
		'Checking this browser’s WebGPU adapter. No model download has started.'
	);
	let status = $state<'unloaded' | 'loading' | 'ready' | 'running' | 'error'>('unloaded');
	let config = $state<AgentConfig>({ ...defaultAgent });
	let loadedFile = $state('');
	let downloadProgress = $state<number | null>(null);
	let message = $state('');
	let trace = $state<AgentTrace[]>([]);
	let partial = $state('');
	let currentTurn = $state(0);
	let outcome = $state<AgentOutcome | null>(null);
	let history = $state<AgentOutcome[]>([]);
	let runConfig = $state<AgentConfig | null>(null);
	let reflection = $state('');
	let worker = $state<Worker | null>(null);
	let deadline: ReturnType<typeof setTimeout> | undefined;
	const busy = $derived(status === 'loading' || status === 'running');
	const preview = $derived(agentPrompt(boundedConfig(config)));
	const unobservedSources = $derived(
		outcome?.sourceIds.filter((id) => !outcome?.evidenceSupplied.includes(id)) ?? []
	);

	onMount(() => {
		let active = true;
		void (async () => {
			try {
				const adapter = await navigator.gpu?.requestAdapter();
				if (!active) return;
				if (adapter?.features.has('shader-f16')) {
					support = 'available';
					supportDetail =
						'WebGPU with shader-f16 is available. You can choose the optional download.';
				} else {
					support = 'unavailable';
					supportDetail =
						'This browser has no available WebGPU adapter with shader-f16. The optional model cannot run here; all core course labs remain available.';
				}
			} catch (error) {
				if (active) {
					support = 'unavailable';
					supportDetail = `WebGPU check failed: ${error instanceof Error ? error.message : String(error)}`;
				}
			}
		})();
		return () => {
			active = false;
			clearTimeout(deadline);
			worker?.terminate();
			worker = null;
		};
	});
	function post(value: AgentWorkerInput) {
		worker?.postMessage(value);
	}
	function stop(
		reason = 'Stopped and unloaded. The observed trace remains; no successful answer was substituted.'
	) {
		clearTimeout(deadline);
		worker?.terminate();
		worker = null;
		status = 'unloaded';
		message = reason;
		if (runConfig && !outcome) {
			outcome = {
				status: 'stopped',
				trace: [...trace],
				sourceIds: [],
				evidenceSupplied: agentPrompt(runConfig).evidenceIds,
				note: reason,
				config: { ...runConfig }
			};
			history = [...history, outcome];
		}
	}
	function receive(event: MessageEvent<AgentWorkerOutput>) {
		const data = event.data;
		if (data.type === 'progress') {
			loadedFile = data.file;
			downloadProgress = data.progress;
		} else if (data.type === 'ready') {
			clearTimeout(deadline);
			status = 'ready';
			message =
				'The model is resident in this worker. You can run the experiment without sending prompts to a server.';
		} else if (data.type === 'token') {
			if (currentTurn !== data.turn) partial = '';
			currentTurn = data.turn;
			partial += data.text;
		} else if (data.type === 'trace') {
			trace = [...trace, data.event];
			partial = '';
		} else if (data.type === 'done') {
			clearTimeout(deadline);
			outcome = data.outcome;
			history = [...history, data.outcome];
			status = 'ready';
			partial = '';
			message = data.outcome.note;
		} else if (data.type === 'disposed') {
			clearTimeout(deadline);
			worker?.terminate();
			worker = null;
			status = 'unloaded';
			message =
				'Model memory released. Browser-cached public model files may remain for a later load.';
		} else {
			clearTimeout(deadline);
			worker?.terminate();
			worker = null;
			status = 'error';
			message = data.message;
		}
	}
	function load() {
		if (support !== 'available' || busy) return;
		worker?.terminate();
		status = 'loading';
		downloadProgress = null;
		loadedFile = '';
		message = 'Downloading public model files and preparing the GPU. You can stop at any time.';
		worker = new Worker(new URL('../../engines/local-agent.worker.ts', import.meta.url), {
			type: 'module'
		});
		worker.onmessage = receive;
		worker.onerror = (event) => {
			stop(
				`The model worker failed: ${event.message || 'unknown browser error'}. No fallback answer was generated.`
			);
			status = 'error';
		};
		deadline = setTimeout(
			() =>
				stop(
					'Loading exceeded five minutes. The worker was stopped; retry only when you want to continue the download.'
				),
			300000
		);
		post({ type: 'load' });
	}
	function run() {
		if (status !== 'ready') return;
		runConfig = boundedConfig(config);
		trace = [];
		outcome = null;
		partial = '';
		currentTurn = 0;
		status = 'running';
		message =
			'Actual model inference is running locally. Each request must pass the read-only tool boundary.';
		deadline = setTimeout(
			() =>
				stop(
					'The wall-clock budget ended. The worker was terminated; partial output did not execute.'
				),
			runConfig.maxSeconds * 1000
		);
		post({ type: 'run', config: { ...runConfig } });
	}
	function unload() {
		if (busy) {
			stop();
			return;
		}
		post({ type: 'dispose' });
		deadline = setTimeout(
			() => stop('The worker was terminated and its local model instance unloaded.'),
			3000
		);
	}
	function exportEvidence() {
		const blob = new Blob(
			[
				JSON.stringify(
					{
						version: 1,
						model: LOCAL_MODEL,
						type: 'Actual optional local model experiment; not a validated benchmark',
						status,
						message,
						supportDetail,
						history: history.map((run) => ({ ...run, prompt: agentPrompt(run.config) })),
						currentTrace: trace,
						partialUnexecutedText: partial,
						reflection
					},
					null,
					2
				)
			],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = 'willow-local-model-evidence.json';
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
</script>

<section class="local-agent" aria-labelledby={uid + '-title'}>
	<header class="intro">
		<div class="eyebrow"><FlaskConical size={17} /> Optional · actual local model</div>
		<h2 id={uid + '-title'}>Let a model choose the next step.</h2>
		<p>
			See the difference between a fixed workflow and a model-directed loop. A small language model
			generates real proposals. The harness validates each one, executes permitted local tools, and
			returns their actual results.
		</p>
		<div class="fact-row">
			<span><Cpu size={16} /> Qwen3 · 0.6B parameters</span><span
				><Braces size={16} /> Read-only tools</span
			><span><Search size={16} /> Evidence comparison</span>
		</div>
	</header>

	<div class="setup-grid">
		<article class="download-card">
			<h3>1. Choose whether to load the model</h3>
			<p>
				<strong>About 600 MB on the first load.</strong> The pinned q4f16 weight file is 570 MB (543 MiB);
				tokenizer and runtime files add to the download. GPU memory needs can exceed file size. This is
				optional and never starts automatically.
			</p>
			<p class="support" role="status">{supportDetail}</p>
			<button
				class="primary"
				onclick={load}
				disabled={support !== 'available' || busy || status === 'ready'}
				><Download size={17} />{status === 'loading'
					? 'Loading model…'
					: 'Download and load optional model'}</button
			>
			{#if status === 'loading'}
				<div class="download-progress">
					<label for={uid + '-download'}>{loadedFile || 'Preparing model runtime'}</label><progress
						id={uid + '-download'}
						max="100"
						value={downloadProgress ?? undefined}
					></progress><small
						>{downloadProgress === null
							? 'Waiting for file progress…'
							: `${Math.round(downloadProgress)}% of this file`}</small
					>
				</div>
			{/if}
			<p class="privacy">
				Public weights come from Hugging Face; runtime assets may come from the package’s CDN. After
				loading, prompts and fictional records are processed in this browser worker. No inference
				API, credentials, or financial-data upload is used. Browser caching may retain downloaded
				files. Use the supplied fictional data.
			</p>
			<details>
				<summary>Model version and licensing</summary>
				<p>
					Transformers.js 4.3.0; Qwen3 ONNX q4f16; revision <code>{LOCAL_MODEL.revision}</code>.
					Metadata checked {LOCAL_MODEL.checked}. The base Qwen3-0.6B model is Apache 2.0. The
					community conversion repository links to that base model and does not declare a separate
					license in its model-card metadata.
				</p>
				<p>
					<a
						href="https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX"
						target="_blank"
						rel="noreferrer">Conversion model card</a
					>
					·
					<a
						href="https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE"
						target="_blank"
						rel="noreferrer">Base model license</a
					>
					·
					<a
						href="https://huggingface.co/docs/transformers.js/guides/webgpu"
						target="_blank"
						rel="noreferrer">WebGPU documentation</a
					>
				</p>
			</details>
		</article>

		<article class="controls-card">
			<h3>2. Set the experiment</h3>
			<label for={uid + '-case'}>Business question</label><select
				id={uid + '-case'}
				bind:value={config.task}
				disabled={busy}
				><option value="invoice">Invoice A: balance and reviewer note</option><option value="travel"
					>September trip: applicable accommodation policy</option
				></select
			>
			<label class="checkbox"
				><input type="checkbox" bind:checked={config.evidence} disabled={busy} /> Supply applicable policy
				evidence</label
			>
			<p class="hint">
				Switch this off for a second run. The same records remain available, but policy retrieval is
				withheld. Does the model admit the missing rule?
			</p>
			<div class="limits">
				<label
					>Maximum turns<select bind:value={config.maxTurns} disabled={busy}
						><option value={3}>3</option><option value={4}>4</option><option value={6}>6</option
						><option value={8}>8</option></select
					></label
				><label
					>Tokens per turn<select bind:value={config.maxTokens} disabled={busy}
						><option value={128}>128</option><option value={192}>192</option><option value={256}
							>256</option
						></select
					></label
				><label
					>Time limit<select bind:value={config.maxSeconds} disabled={busy}
						><option value={45}>45 seconds</option><option value={90}>90 seconds</option><option
							value={120}>120 seconds</option
						></select
					></label
				>
			</div>
			<label for={uid + '-instruction'}>Optional instruction to compare</label><textarea
				id={uid + '-instruction'}
				rows="3"
				maxlength="1000"
				bind:value={config.instruction}
				disabled={busy}
				placeholder="For example: separate the calculated balance from the unknown reason for short payment."
			></textarea>
			<div class="actions">
				<button class="primary" onclick={run} disabled={status !== 'ready'}
					><Workflow size={16} /> Run actual model</button
				><button class="secondary" onclick={unload} disabled={!worker}
					><Square size={15} />{busy ? 'Stop and unload' : 'Unload model'}</button
				>
			</div>
			<p class="hint">
				Greedy decoding; up to eight model turns and 256 new tokens per turn. The browser enforces
				the wall-clock limit. This small model can fail formatting or reasoning; that failure is
				evidence to investigate.
			</p>
		</article>
	</div>
	{#if message}<div class="status" role="status">
			<strong
				>{status === 'running'
					? 'Running locally'
					: status === 'error'
						? 'Model unavailable'
						: 'Experiment status'}</strong
			>
			<p>{message}</p>
		</div>{/if}

	<details class="prompt">
		<summary>Inspect the exact current prompt and available evidence</summary>
		<!-- Keyboard focus supports scrolling exact evidence. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<pre tabindex="0">{JSON.stringify(preview, null, 2)}</pre>
	</details>
	<div class="explain">
		<h3>3. Inspect proposals, effects, and claims separately</h3>
		<p>
			A generated tool name is only a request. Invoice lookup, payment preparation, integer-cent
			arithmetic, and policy search run as real local functions after validation. Payment, posting,
			draft creation, external sending, and arbitrary code are absent from this model’s allowlist.
			For the invoice case, the harness requires actual invoice, payment, and matching calculator
			evidence before accepting a final answer. Its wording and policy interpretation still need a
			correctness review.
		</p>
	</div>
	{#if trace.length || partial}
		<ol class="trace" aria-label="Actual model and tool trace">
			{#each trace as event (event.turn)}
				<li>
					<div class="trace-title">
						<span>Turn {event.turn}</span><span
							>{(event.elapsedMs / 1000).toFixed(1)} seconds elapsed</span
						>
					</div>
					<h4>Raw model output</h4>
					<!-- Keyboard focus supports scrolling exact evidence. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<pre tabindex="0">{event.raw}</pre>
					{#if event.error}<p class="error">{event.error}</p>{/if}{#if event.result}<h4>
							{event.proposal && 'final' in event.proposal
								? 'Harness final-answer check'
								: 'Actual local tool result'}
						</h4>
						<!-- Keyboard focus supports scrolling exact evidence. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<pre tabindex="0">{JSON.stringify(
								event.result,
								null,
								2
							)}</pre>{/if}{#if event.proposal && 'final' in event.proposal}<p class="hint">
							{event.result && !event.result.ok
								? 'The model tried to finish, but the harness rejected the unsupported answer.'
								: 'The model chose to finish. No action is implied by the prose.'}
						</p>{/if}
				</li>
			{/each}
			{#if partial}<li class="stream">
					<div class="trace-title">
						<span
							>Turn {currentTurn} · {status === 'running' ? 'generating' : 'partial output'}</span
						><span>Not executed</span>
					</div>
					<!-- Keyboard focus supports scrolling partial model output. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<pre tabindex="0" aria-live="off">{partial}</pre>
				</li>{/if}
		</ol>
	{:else}
		<div class="empty">
			<Braces size={28} />
			<p>
				No model trace yet. Nothing here is a prerecorded model answer. The core Workflow lab
				provides the deterministic, no-download exercises.
			</p>
		</div>
	{/if}
	{#if outcome}
		<article class="outcome">
			<div class="eyebrow">
				<FileCheck2 size={17} /> Observed outcome · {outcome.status === 'finished'
					? 'final proposed'
					: outcome.status}
			</div>
			<h3>{outcome.final ? 'The model’s final answer' : 'The run ended without a final answer'}</h3>
			{#if outcome.final}<p class="model-answer">{outcome.final}</p>{/if}
			<p>{outcome.note}</p>
			<dl>
				<div>
					<dt>Referenced by model</dt>
					<dd>{outcome.sourceIds.join(', ') || 'None'}</dd>
				</div>
				<div>
					<dt>Actually supplied or returned</dt>
					<dd>{outcome.evidenceSupplied.join(', ') || 'None'}</dd>
				</div>
			</dl>
			{#if unobservedSources.length}<p class="error">
					These cited records or results were not supplied in this run: {unobservedSources.join(
						', '
					)}. Their presence is not evidence.
				</p>{/if}
			<p class="hint">
				A matching source ID is a provenance check, not proof that its text supports every sentence.
				Verify the claim against the actual passage.
			</p>
		</article>
	{/if}
	<article class="reflection">
		<h3>4. Defend what the experiment showed</h3>
		<p>
			Compare evidence-on and evidence-off runs. For invoice A, the independently checked records
			give USD 1,000 invoiced − USD 500 accepted payments = USD 500 outstanding. PARTIAL-02 requires
			investigation; it does not establish why the customer paid less. For the September staff trip,
			TRAVEL-02 gives USD 110 per night and requires receipts. An evidence-off model has not been
			given that rule.
		</p>
		<label for={uid + '-reflection'}>What succeeded, what failed, and what would you change?</label
		><textarea
			id={uid + '-reflection'}
			rows="4"
			bind:value={reflection}
			placeholder="Separate formatting, tool use, arithmetic, citation support, and business interpretation. A failed run is worth explaining."
		></textarea>
		<div class="actions">
			<button class="secondary" onclick={exportEvidence}
				><Download size={16} /> Export actual experiment evidence</button
			><span>{history.length} run{history.length === 1 ? '' : 's'} retained in this session</span>
		</div>
		<p class="hint">
			This is a learning experiment with one small model and synthetic cases, not a benchmark of
			general agent reliability. Changing prompts after seeing results makes later runs development
			evidence.
		</p>
	</article>
</section>

<style>
	.local-agent {
		color: #263b35;
		font-family: var(--font-body, sans-serif);
		background: #f8faf7;
		border: 1px solid #dce6de;
		border-radius: 28px;
		overflow: hidden;
	}
	.intro {
		padding: 32px;
		background: linear-gradient(130deg, #e9f5eb, #eeebfa 85%);
	}
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.72rem;
		font-weight: 800;
		color: #496550;
	}
	h2 {
		font-size: clamp(1.65rem, 4vw, 2.5rem);
		letter-spacing: -0.045em;
		line-height: 1.15;
		margin: 16px 0;
	}
	h3 {
		font-size: 1.08rem;
		letter-spacing: -0.02em;
		margin: 0 0 12px;
	}
	h4 {
		font-size: 0.8rem;
		margin: 14px 0 8px;
	}
	p {
		line-height: 1.7;
		font-size: 0.94rem;
		margin: 10px 0;
	}
	.intro > p {
		max-width: 790px;
	}
	.fact-row,
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
		margin-top: 18px;
	}
	.fact-row span {
		display: flex;
		align-items: center;
		gap: 7px;
		background: #fff9;
		padding: 7px 12px;
		border-radius: 20px;
		font-size: 0.76rem;
	}
	.setup-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 22px;
		padding: 26px;
	}
	article {
		min-width: 0;
	}
	.download-card,
	.controls-card,
	.reflection,
	.outcome {
		padding: 24px;
		background: #fff;
		border: 1px solid #d9e4da;
		border-radius: 19px;
	}
	.controls-card {
		background: #f2f0fa;
		border-color: #ded8ee;
	}
	.support {
		padding: 12px;
		background: #f2f6f0;
		border-radius: 10px;
		font-size: 0.86rem;
	}
	label {
		display: block;
		font-size: 0.8rem;
		font-weight: 700;
		margin: 14px 0 7px;
	}
	select,
	textarea {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #b9c8bd;
		background: #fff;
		border-radius: 10px;
		padding: 11px;
		color: #263b35;
		font: inherit;
		font-size: 0.85rem;
	}
	textarea {
		resize: vertical;
		min-height: 78px;
	}
	.checkbox {
		display: flex;
		align-items: flex-start;
		gap: 9px;
	}
	input[type='checkbox'] {
		accent-color: #3d6846;
		margin-top: 2px;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}
	.limits {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.limits label {
		min-width: 0;
	}
	.limits select {
		margin-top: 7px;
		padding: 9px 6px;
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font: inherit;
		font-size: 0.83rem;
		font-weight: 750;
		border: 0;
		border-radius: 10px;
		padding: 12px 16px;
		cursor: pointer;
		min-height: 44px;
	}
	button:disabled {
		cursor: default;
		opacity: 0.52;
	}
	.primary {
		background: #315d41;
		color: #fff;
	}
	.secondary {
		background: #e9efea;
		color: #2d4c36;
	}
	button:hover:enabled {
		filter: brightness(0.95);
	}
	:is(button, select, textarea, input, a, summary):focus-visible {
		outline: 3px solid #7758a1;
		outline-offset: 3px;
	}
	.hint,
	.privacy {
		color: #526259;
		font-size: 0.79rem;
		line-height: 1.65;
	}
	.privacy {
		margin-top: 16px;
	}
	details {
		margin-top: 18px;
		font-size: 0.84rem;
	}
	summary {
		cursor: pointer;
		font-weight: 700;
		padding: 8px 0;
	}
	a {
		color: #4e437d;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	code {
		overflow-wrap: anywhere;
		font-size: 0.75rem;
	}
	.download-progress {
		margin: 12px 0;
	}
	.download-progress label {
		overflow-wrap: anywhere;
	}
	progress {
		width: 100%;
		height: 10px;
		accent-color: #6b9470;
	}
	small {
		font-size: 0.75rem;
		color: #526259;
	}
	.status {
		margin: 0 26px 22px;
		padding: 18px 22px;
		border-radius: 14px;
		background: #e7f1e7;
	}
	.status > strong {
		font-size: 0.83rem;
	}
	.status > p {
		margin: 5px 0 0;
		font-size: 0.86rem;
	}
	.prompt {
		margin: 0 26px 24px;
		padding: 14px 20px;
		background: #f0eef7;
		border-radius: 14px;
	}
	pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: break-word;
		font-size: 0.76rem;
		line-height: 1.65;
		background: #f0f4f0;
		border: 1px solid #dbe3dc;
		padding: 14px;
		border-radius: 10px;
		max-height: 500px;
		overflow: auto;
	}
	.explain {
		margin: 28px 30px 20px;
	}
	.trace {
		list-style: none;
		padding: 0;
		margin: 0 26px 26px;
		display: grid;
		gap: 14px;
	}
	.trace li {
		border: 1px solid #d6e1d6;
		border-radius: 16px;
		background: #fff;
		padding: 20px;
		min-width: 0;
	}
	.trace-title {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 7px;
		font-size: 0.75rem;
		font-weight: 700;
		color: #506554;
	}
	.trace .stream {
		border-style: dashed;
		background: #f3f0f9;
	}
	.empty {
		margin: 0 26px 24px;
		padding: 28px;
		border: 1px dashed #b7c7ba;
		border-radius: 18px;
		text-align: center;
		color: #506257;
	}
	.empty > p {
		font-size: 0.85rem;
		max-width: 650px;
		margin: 12px auto 0;
	}
	.outcome {
		margin: 0 26px 24px;
		background: #eff7ed;
	}
	.outcome h3 {
		margin: 15px 0;
	}
	.model-answer {
		white-space: pre-wrap;
	}
	dl {
		display: grid;
		gap: 8px;
	}
	dl > div {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 12px;
		font-size: 0.79rem;
		line-height: 1.6;
	}
	dt {
		font-weight: 700;
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
	.error {
		color: #883e30;
		background: #fff1e9;
		border-radius: 9px;
		padding: 10px 12px;
		font-size: 0.84rem;
	}
	.reflection {
		margin: 0 26px 26px;
	}
	.actions > span {
		font-size: 0.78rem;
		color: #526259;
	}
	@media (max-width: 800px) {
		.setup-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 480px) {
		.local-agent {
			border-radius: 20px;
		}
		.intro {
			padding: 23px;
		}
		.setup-grid {
			padding: 15px;
			gap: 15px;
		}
		.download-card,
		.controls-card,
		.reflection,
		.outcome {
			padding: 18px;
		}
		.status,
		.prompt,
		.trace,
		.empty,
		.reflection,
		.outcome {
			margin-left: 15px;
			margin-right: 15px;
		}
		.explain {
			margin-left: 20px;
			margin-right: 20px;
		}
		.limits {
			grid-template-columns: 1fr;
			gap: 0;
		}
		dl > div {
			grid-template-columns: 1fr;
			gap: 0;
		}
		.actions > button {
			width: 100%;
		}
	}
</style>
