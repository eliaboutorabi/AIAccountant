<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		Search,
		Calculator,
		Workflow,
		Database,
		ShieldCheck,
		ClipboardCheck,
		Download,
		Play,
		RotateCcw
	} from '@lucide/svelte';
	import {
		applicable,
		assessClaim,
		authoredAgentTrace,
		authoredTrials,
		createEnvironment,
		CAPSTONE_FINAL_PACK,
		CAPSTONE_FINAL_PROVENANCE,
		commitCapstone,
		evaluateCapstoneFinal,
		restoreCapstoneCommitment,
		type CapstoneCommitment,
		type CapstoneFinalCase,
		datasetFor,
		defaultPipeline,
		defaultSearch,
		evaluateWorkflow,
		executeTool,
		gradeTrialFixture,
		money,
		policies,
		retrievalAudit,
		retrievalQuestions,
		restoreQueueCheckpoint,
		runPipeline,
		runWorkflow,
		scenarios,
		searchPolicies,
		starterSource,
		toolExamples,
		type Claim,
		type PipelineConfig,
		type Scenario,
		type SearchOptions,
		type ToolResult,
		type TraceEvent,
		type WorkflowRun
	} from '$lib/engines/workflow';

	let { mode = 'retrieval' }: { mode?: string } = $props();
	const uid = $props.id();
	let view = $derived(mode);
	const views = [
		{ id: 'retrieval', label: 'Evidence', icon: Search },
		{ id: 'tools', label: 'Tools', icon: Calculator },
		{ id: 'agents', label: 'Workflow', icon: Workflow },
		{ id: 'harness', label: 'Recovery', icon: ShieldCheck },
		{ id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
		{ id: 'pipeline', label: 'Pipeline', icon: Database },
		{ id: 'capstone', label: 'Capstone', icon: ClipboardCheck }
	];
	const title = $derived(views.find((v) => v.id === view)?.label ?? 'Evidence');
	let questionId = $state('september');
	let customQuery = $state('');
	let search = $state<SearchOptions>({ ...defaultSearch });
	const question = $derived(
		retrievalQuestions.find((q) => q.id === questionId) ?? retrievalQuestions[0]
	);
	const searchOptions = $derived({ ...search, date: question.date });
	const hits = $derived(searchPolicies(customQuery || question.query, searchOptions));
	let claimMode = $state('expected');
	const claim = $derived.by(() => {
		if (claimMode === 'abstain') return { kind: 'abstain' } as Claim;
		if (claimMode === 'wrong-amount') return { ...question.claim, amountMinor: 9000 } as Claim;
		if (claimMode === 'old-policy')
			return { ...question.claim, sourceId: 'TRAVEL-01', amountMinor: 9000 } as Claim;
		return question.claim;
	});
	const support = $derived(assessClaim(claim, hits, question, searchOptions));
	const audit = $derived(retrievalAudit(search));
	const required = $derived(audit.filter((a) => a.requiredId !== null));
	const found = $derived(required.filter((a) => a.found).length);
	const supported = $derived(audit.filter((a) => a.supported).length);
	let showAudit = $state(false);
	let toolText = $state(JSON.stringify(toolExamples[0].request, null, 2));
	let toolResult = $state<ToolResult | null>(null);
	let toolLog = $state<{ request: unknown; result: ToolResult }[]>([]);
	let environment = createEnvironment();
	let queue = $state<ReturnType<typeof createEnvironment>['queue']>([]);
	let recoveryLog = $state<TraceEvent[]>([]);
	let storageMessage = $state('A checkpoint can be saved on this device.');
	let config = $state<PipelineConfig>({ ...defaultPipeline });
	let scenario = $state<Scenario>('base');
	let result = $state<WorkflowRun | null>(null);
	let inspectedFinal = $state<CapstoneFinalCase | null>(null);
	const dataset = $derived(inspectedFinal?.dataset ?? datasetFor(scenario));
	const preview = $derived(runPipeline(dataset, config));
	let prediction = $state('');
	let reflection = $state('');
	let committed = $state<CapstoneCommitment | null>(null);
	let revealed = $state(false);
	let firstFinal = $state<CapstoneFinalCase[] | null>(null);
	let finalEvaluation = $state<CapstoneFinalCase[] | null>(null);
	let previouslySeen = $state(false);
	let firstExposureWasFresh = $state(false);
	let repairedFinal = $state(false);
	let capstoneStorageMessage = $state(
		'First exposure is recorded on this browser; export your evidence for a portable record.'
	);
	let firstCommit = $state<typeof committed>(null);
	let currentEvaluation = $state<ReturnType<typeof evaluateWorkflow> | null>(null);
	const trialMetrics = gradeTrialFixture();
	let notice = $state('');
	const checkpointKey = 'ai-accountant-workflow-checkpoint-v1';
	const finalKey = 'ai-accountant-capstone-' + CAPSTONE_FINAL_PACK;
	const finalSeenKey = finalKey + '-seen';

	function runTool() {
		try {
			const request: unknown = JSON.parse(toolText);
			toolResult = executeTool(request, environment);
			toolLog = [...toolLog, { request, result: toolResult }];
			queue = [...environment.queue];
		} catch {
			toolResult = {
				ok: false,
				code: 'INVALID_JSON',
				message: 'The request is not valid JSON. Nothing was executed.'
			};
		}
	}
	function recover(action: 'send' | 'status' | 'retry' | 'new') {
		const request =
			action === 'status'
				? { tool: 'draft_status', arguments: { requestId: 'D8' } }
				: {
						tool: 'create_review_draft',
						arguments: {
							requestId: action === 'new' ? 'D9' : 'D8',
							caseId: 'CASE-A',
							outstandingMinor: 50000,
							sourceIds: ['INV-A-v1', 'PAY-09-v1', 'CALC-A-01']
						}
					};
		if (action === 'send') environment.loseNextDraftResponse = true;
		const outcome = executeTool(request, environment);
		queue = [...environment.queue];
		recoveryLog = [
			...recoveryLog,
			{
				step: {
					send: 'Send D8 with injected response loss',
					status: 'Read actual D8 status',
					retry: 'Retry the same D8 identity',
					new: 'Create fresh identity D9'
				}[action],
				request,
				result: outcome,
				state: `${queue.length} actual local draft(s)`,
				provenance: 'Actual local execution; response loss is an explicit injected teaching fault'
			}
		];
	}
	function resetRecovery() {
		environment = createEnvironment();
		queue = [];
		recoveryLog = [];
		storageMessage = 'Local queue reset. A saved checkpoint remains available until replaced.';
	}
	function saveCheckpoint() {
		try {
			localStorage.setItem(
				checkpointKey,
				JSON.stringify({ version: 1, queue: environment.queue, recoveryLog })
			);
			storageMessage =
				'Checkpoint saved on this device with request identities and observed results.';
		} catch {
			storageMessage = 'Device storage is unavailable. Export the evidence to keep your work.';
		}
	}
	function loadCheckpoint() {
		try {
			const raw = localStorage.getItem(checkpointKey);
			if (!raw) {
				storageMessage = 'No saved checkpoint on this device.';
				return;
			}
			const restored = restoreQueueCheckpoint(JSON.parse(raw));
			if (!restored) throw Error('Invalid checkpoint');
			environment = createEnvironment();
			environment.queue = restored;
			queue = [...environment.queue];
			recoveryLog = [];
			storageMessage =
				'Saved local queue restored. Inspect D8 status before deciding whether to repeat an operation.';
		} catch {
			storageMessage = 'The saved checkpoint could not be validated; the current queue was kept.';
		}
	}
	function run() {
		inspectedFinal = null;
		result = runWorkflow(datasetFor(scenario), { ...config });
		notice =
			'Actual local pipeline and tools ran. The note is an authored template filled from checked results.';
	}
	function commit() {
		if (revealed) return;
		committed = commitCapstone({ ...config }, prediction);
		notice = 'Configuration committed. Development practice remains separate from the final pack.';
	}
	function saveFinalEvidence() {
		try {
			localStorage.setItem(finalSeenKey, 'seen');
			localStorage.setItem(
				finalKey,
				JSON.stringify({ version: 1, firstCommit, firstExposureWasFresh })
			);
		} catch {
			capstoneStorageMessage =
				'Browser storage is unavailable. This session retains the first result; export it before leaving. A later visit cannot verify your exposure history.';
		}
	}
	function reveal() {
		if (!committed || revealed) return;
		firstExposureWasFresh = !previouslySeen;
		previouslySeen = true;
		firstCommit = { ...committed, config: { ...committed.config } };
		firstFinal = evaluateCapstoneFinal(firstCommit);
		finalEvaluation = firstFinal;
		revealed = true;
		repairedFinal = false;
		saveFinalEvidence();
		notice =
			'Distinct final pack revealed. Its original configuration and results are preserved; further tuning on it is regression evidence.';
	}
	function repairFinal() {
		if (!revealed) return;
		finalEvaluation = evaluateCapstoneFinal(
			commitCapstone(
				{ ...config },
				prediction.trim() || 'Repaired configuration evaluated on the already revealed pack.'
			)
		);
		repairedFinal = true;
		notice =
			'The original committed results remain in firstFinal. This run uses the current settings on the same already consulted final pack.';
	}
	async function inspectFinal(row: CapstoneFinalCase) {
		inspectedFinal = row;
		result = row.run;
		notice =
			'The source records, amounts, draft, and execution trace above now show ' +
			row.dataset.id +
			'. They retain this assessment run’s configuration.';
		await tick();
		document.getElementById(`${uid}-records`)?.scrollIntoView({ block: 'start' });
	}
	function evaluate() {
		currentEvaluation = evaluateWorkflow({ ...config });
		notice = 'Development suite executed against the current configuration.';
	}
	function download(name: string, text: string, type = 'application/json') {
		const url = URL.createObjectURL(new Blob([text], { type }));
		const a = document.createElement('a');
		a.href = url;
		a.download = name;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
	function exportEvidence() {
		download(
			'willow-learning-evidence.json',
			JSON.stringify(
				{
					version: 1,
					provenance:
						'Synthetic learning exercise; actual local functions; authored draft templates and agent/trial exhibits',
					view,
					search: searchOptions,
					query: customQuery || question.query,
					retrieved: hits,
					claim,
					support,
					audit,
					toolLog,
					recoveryLog,
					queue,
					config,
					scenario,
					result,
					committed,
					firstFinal,
					firstCommit,
					currentEvaluation,
					finalPack: CAPSTONE_FINAL_PACK,
					finalProvenance: CAPSTONE_FINAL_PROVENANCE,
					finalEvaluation,
					previouslySeen,
					firstExposureWasFresh,
					repairedFinal,
					prediction,
					reflection
				},
				null,
				2
			)
		);
		notice = 'Evidence exported. Written reasoning is not automatically graded.';
	}
	onMount(() => {
		try {
			previouslySeen = localStorage.getItem(finalSeenKey) !== null;
			const saved = localStorage.getItem(finalKey);
			if (saved) {
				previouslySeen = true;
				try {
					const state = JSON.parse(saved);
					const restored = restoreCapstoneCommitment(state?.firstCommit);
					if (state?.version !== 1 || !restored) throw Error('Invalid saved commitment');
					firstCommit = restored;
					committed = restored;
					firstFinal = evaluateCapstoneFinal(restored);
					finalEvaluation = firstFinal;
					firstExposureWasFresh = state.firstExposureWasFresh === true;
					revealed = true;
					notice =
						'Previously revealed final pack restored. The first result is recomputed from its saved commitment; these cases are already consulted.';
					config = { ...restored.config };
					prediction = restored.rationale;
				} catch {
					capstoneStorageMessage =
						'This final pack was previously consulted, but its saved commitment cannot be restored. A new run will be labelled previously consulted, not fresh evidence.';
				}
			}
			if (localStorage.getItem(checkpointKey))
				storageMessage =
					'A saved checkpoint is available. Choose Restore checkpoint to inspect it.';
		} catch {
			storageMessage = 'Device storage is unavailable; evidence export still works.';
			previouslySeen = true;
			capstoneStorageMessage =
				'Exposure history cannot be verified because browser storage is unavailable. This run will not claim an unseen first attempt; export evidence before leaving.';
		}
	});
</script>

<section class="workflow-lab" aria-label={`${title} workbench`}>
	<div class="lab-heading">
		<div class="eyebrow">
			<span class="live-dot"></span> COMPUTED LOCALLY · SYNTHETIC WILLOW DATA
		</div>
		<h3>{title} workbench</h3>
		<p>Follow the evidence from a source record to a result you can inspect.</p>
	</div>
	<nav class="view-nav" aria-label="Workflow workbench views">
		{#each views as item (item.id)}<button
				class:active={view === item.id}
				aria-pressed={view === item.id}
				onclick={() => (view = item.id)}><item.icon size={16} />{item.label}</button
			>{/each}
	</nav>

	{#if view === 'retrieval'}
		<div class="controls two-cols">
			<label for={`${uid}-question`}
				>Question exhibit<select
					id={`${uid}-question`}
					bind:value={questionId}
					onchange={() => {
						customQuery = '';
						claimMode = 'expected';
					}}
					>{#each retrievalQuestions as q (q.id)}<option value={q.id}>{q.label}</option
						>{/each}</select
				></label
			>
			<label for={`${uid}-method`}
				>Ranking method<select id={`${uid}-method`} bind:value={search.method}
					><option value="keyword">Keyword occurrence count</option><option value="term-vector"
						>TF-IDF term-vector cosine</option
					></select
				></label
			>
			<label class="span-two" for={`${uid}-query`}
				>Query text<input
					id={`${uid}-query`}
					bind:value={customQuery}
					placeholder={question.query}
				/></label
			>
			<label for={`${uid}-chunks`}
				>Words per chunk: {search.chunkWords}<input
					id={`${uid}-chunks`}
					type="range"
					min="8"
					max="80"
					step="1"
					bind:value={search.chunkWords}
				/></label
			>
			<label for={`${uid}-topk`}
				>Retain top {search.topK} chunks<input
					id={`${uid}-topk`}
					type="range"
					min="1"
					max="10"
					step="1"
					bind:value={search.topK}
				/></label
			>
			<label class="check-label"
				><input type="checkbox" bind:checked={search.enforceDate} /> Filter the applicable date ({question.date})</label
			>
			<label class="check-label"
				><input type="checkbox" bind:checked={search.omitCurrent} /> Withhold TRAVEL-02 to test missing
				evidence</label
			>
		</div>
		<p class="method-note">
			Fixed scope: Willow standard staff. Entity and access restrictions always apply. Chunks retain
			source metadata with five-word overlap. TF-IDF uses term counts and inverse document
			frequency; it is <strong>not a learned semantic embedding</strong>. No LLM is generating these
			answers.
		</p>
		<div class="evidence-grid">
			<div>
				<h4>Retrieved passages <span class="pill">{hits.length}</span></h4>
				{#each hits as hit, i (hit.chunkId)}<article class="source-card">
						<div class="source-meta">
							<strong>{i + 1}. {hit.document.id}</strong><span
								>{search.method === 'keyword' ? 'matches' : 'cosine'} {hit.score.toFixed(3)}</span
							>
						</div>
						<p>{hit.text}</p>
						<small
							>{hit.chunkId} · {hit.document.from} to {hit.document.to ?? 'present'} · {applicable(
								hit.document,
								searchOptions
							)
								? 'Applicable'
								: 'OUTSIDE QUESTION DATE'}</small
						>
					</article>{:else}<p class="empty">
						No matching authorized passage. Increasing top-k cannot retrieve a missing document.
					</p>{/each}
			</div>
			<div class="claim-panel">
				<h4>Does the evidence support the claim?</h4>
				<label for={`${uid}-claim`}
					>Authored claim to check<select id={`${uid}-claim`} bind:value={claimMode}
						><option value="expected">Expected claim for this exhibit</option><option
							value="wrong-amount">Use USD 90 as the limit</option
						><option value="old-policy">Cite TRAVEL-01 and USD 90</option><option value="abstain"
							>State that evidence is missing</option
						></select
					></label
				>
				<pre>{JSON.stringify(claim, null, 2)}</pre>
				<div class:fail={!support.pass} class="result-note">
					<strong
						>{support.pass ? 'Supported under this constrained check' : 'Not supported'}</strong
					>
					<p>{support.reason}</p>
				</div>
				<p class="method-note">
					This grader checks declared claim types and literal supporting clauses. It is not a
					general semantic-entailment model.
				</p>
			</div>
		</div>
		<button class="secondary" onclick={() => (showAudit = !showAudit)}
			>{showAudit ? 'Hide' : 'Run and inspect'} the five-question audit</button
		>
		{#if showAudit}<div class="metrics">
				<div>
					<span>Required-source recall</span><strong>{found}/{required.length}</strong><small
						>Four answerable source requirements</small
					>
				</div>
				<div>
					<span>Supported response fixtures</span><strong>{supported}/{audit.length}</strong><small
						>Includes one appropriate missing-rule response</small
					>
				</div>
			</div>
			<!-- The named overflow region is focusable for keyboard scrolling. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="table-wrap" tabindex="0" role="region" aria-label="Retrieval audit results">
				<table>
					<caption
						>Actual retrieval plus constrained support checks; each question uses its own date.</caption
					><thead
						><tr><th>Case</th><th>Required source</th><th>Retrieved?</th><th>Supported?</th></tr
						></thead
					><tbody
						>{#each audit as row (row.id)}<tr
								><th>{row.id}</th><td>{row.requiredId ?? 'No rule supplied'}</td><td
									>{row.found === null ? 'Not applicable' : row.found ? 'Yes' : 'No'}</td
								><td>{row.supported ? 'Yes' : 'No'}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>{/if}
		<details>
			<summary>Inspect the public teaching policy register</summary>
			<p>
				All data are fictional client-side fixtures. Filtering here demonstrates a mechanism; a
				static site is not production authorization.
			</p>
			{#each policies as policy (policy.id)}<p>
					<strong>{policy.id}</strong> · {policy.entity} · {policy.access} · {policy.from}–{policy.to ??
						'present'}
				</p>{/each}
		</details>
	{:else if view === 'tools'}
		<div class="mini-buttons">
			{#each toolExamples as example (example.label)}<button
					class="secondary"
					onclick={() => {
						toolText = JSON.stringify(example.request, null, 2);
						toolResult = null;
					}}>{example.label}</button
				>{/each}
		</div>
		<div class="evidence-grid">
			<div>
				<label for={`${uid}-request`}
					>Proposed request · edit the JSON<textarea
						id={`${uid}-request`}
						class="code-input"
						rows="12"
						bind:value={toolText}
						spellcheck="false"></textarea></label
				><button class="primary" onclick={runTool}><Play size={16} /> Validate and execute</button>
			</div>
			<div>
				<h4>Actual local result</h4>
				{#if toolResult}<div class:fail={!toolResult.ok} class="result-note">
						<strong>{toolResult.ok ? 'Execution succeeded' : toolResult.code}</strong>
						<pre>{JSON.stringify(toolResult, null, 2)}</pre>
					</div>{:else}<p class="empty">
						A proposed request is not an executed result. Run the tool to see validation and output.
					</p>{/if}
			</div>
		</div>
		<p class="method-note">
			Amounts are nonnegative safe-integer USD cents. The result may be negative for an overpayment.
			Arguments must contain exactly the declared fields. The tool allowlist has no payment,
			posting, external-send, or arbitrary-code capability.
		</p>
		{#if toolLog.length}<details>
				<summary>Inspect {toolLog.length} executed request(s)</summary>
				<pre>{JSON.stringify(toolLog, null, 2)}</pre>
			</details>{/if}
	{:else if view === 'harness'}
		<div class="explanation">
			<h4>Lose a response after a real local effect</h4>
			<p>
				Send D8: the local queue creates a draft, then an explicit teaching fault hides the
				response. Inspect state, retry the same identity, or observe how a new identity creates
				duplicate work.
			</p>
		</div>
		<div class="mini-buttons">
			<button class="primary" onclick={() => recover('send')}
				><Play size={16} /> Send D8 · lose response</button
			><button class="secondary" onclick={() => recover('status')}>Check D8 status</button><button
				class="secondary"
				onclick={() => recover('retry')}>Retry same D8</button
			><button class="secondary" onclick={() => recover('new')}>Try fresh D9</button><button
				class="secondary"
				onclick={resetRecovery}><RotateCcw size={15} /> Reset local queue</button
			>
		</div>
		<div class="metrics">
			<div>
				<span>Actual review tasks</span><strong>{queue.length}</strong><small
					>{queue.length > 1
						? 'Duplicate logical work: inspect request identities'
						: 'No posting or payment is available'}</small
				>
			</div>
			<div>
				<span>Permitted state</span><strong class="word">awaiting_review</strong><small
					>Instructions do not grant approval authority</small
				>
			</div>
		</div>
		<!-- The named overflow region is focusable for keyboard scrolling. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="table-wrap" tabindex="0" role="region" aria-label="Actual local review queue">
			<table>
				<caption>Current local queue state, independent of a final response sentence.</caption
				><thead
					><tr><th>Draft</th><th>Request</th><th>Case</th><th>Outstanding</th><th>State</th></tr
					></thead
				><tbody
					>{#each queue as q (q.id)}<tr
							><th>{q.id}</th><td>{q.requestId}</td><td>{q.caseId}</td><td
								>{money(q.outstandingMinor)}</td
							><td>{q.status}</td></tr
						>{:else}<tr><td colspan="5">No local review tasks.</td></tr>{/each}</tbody
				>
			</table>
		</div>
		{#each recoveryLog as event, i (i)}<details class="trace-card">
				<summary>{i + 1}. {event.step} · {event.result.ok ? 'success' : event.result.code}</summary>
				<p>{event.state}</p>
				<pre>{JSON.stringify({ request: event.request, result: event.result }, null, 2)}</pre>
			</details>{/each}
		<div class="mini-buttons">
			<button class="secondary" onclick={saveCheckpoint}>Save checkpoint on this device</button
			><button class="secondary" onclick={loadCheckpoint}>Restore checkpoint</button>
		</div>
		<p class="method-note" role="status">{storageMessage}</p>
		<details>
			<summary>Inspect the reusable reconciliation skill</summary>
			<pre>name: reconcile-approved-records
version: 1.2
scope: Willow / USD / stated cutoff

Preserve raw source rows and IDs.
Validate keys, money, currency, and versions.
Quarantine identical duplicates; hold conflicting identities.
Aggregate accepted payments before joining invoices.
Retain unpaid invoices and unmatched payments.
Reconcile counts and amounts.
Prepare an evidence-linked reviewer draft.
Do not claim approval, posting, or payment.</pre>
			<p>
				The skill describes a method. Actual tools and application checks enforce the execution
				boundary. Saving this checkpoint does not update model parameters.
			</p>
		</details>
	{:else}
		{#if view === 'agents'}<div class="explanation">
				<h4>A fixed workflow that really executes</h4>
				<p>
					The buttons below run local tools and calculations. The separate agent trace is authored
					for diagnosis; no model is choosing actions here.
				</p>
			</div>{/if}
		{#if view === 'capstone'}<div class="explanation">
				<h4>Build a review packet you can defend</h4>
				<p>
					Practice on the public PIPE-01 development cases, then commit your configuration and
					reasoning. The final pack uses different amounts, record identities, and combinations of
					conditions. Its records and results appear only after commitment and reveal. A filled
					textbox is practice evidence, not automatically demonstrated mastery.
				</p>
			</div>{/if}
		<div class="controls three-cols">
			<label for={`${uid}-duplicate`}
				>Payment identity<select id={`${uid}-duplicate`} bind:value={config.duplicatePolicy}
					><option value="quarantine">Quarantine duplicates; hold conflicts</option><option
						value="keep-all">Accept every row · faulty variant</option
					></select
				></label
			><label for={`${uid}-join`}
				>Invoice retention<select id={`${uid}-join`} bind:value={config.join}
					><option value="preserve">Keep all invoices (left join)</option><option value="inner"
						>Only matched invoices · faulty variant</option
					></select
				></label
			><label for={`${uid}-invalid`}
				>Malformed money<select id={`${uid}-invalid`} bind:value={config.invalid}
					><option value="reject">Reject and preserve uncertainty</option><option value="zero"
						>Substitute zero · faulty variant</option
					></select
				></label
			>
		</div>
		<p class="method-note">
			The faulty variants let you test plausible implementation mistakes. Control identities can
			agree even when accepted records are wrong; the reference grader also checks identity and
			completeness.
		</p>
		<label for={`${uid}-prediction`}
			>Predict the outcome and explain your choice<textarea
				id={`${uid}-prediction`}
				rows="3"
				bind:value={prediction}
				placeholder="Which records should remain? What would make you stop the run?"
			></textarea></label
		>
		<div class="mini-buttons">
			<button class="primary" onclick={run}><Play size={16} /> Run original/local case</button
			><button class="secondary" onclick={commit} disabled={!prediction.trim() || revealed}
				>Commit configuration</button
			>{#if committed && !revealed}<button class="secondary" onclick={reveal}
					>Reveal changed-case assessment</button
				>{/if}<button
				class="secondary"
				onclick={() => download('willow-pipeline.mjs', starterSource(), 'text/javascript')}
				><Download size={15} /> Runnable starter</button
			>
		</div>
		{#if committed}<p class="commit-note">
				<ShieldCheck size={16} /> Committed {committed.time.slice(0, 19).replace('T', ' ')} UTC · {committed
					.config.duplicatePolicy} / {committed.config.join} / {committed.config.invalid}. {revealed
					? 'These revealed cases are now development evidence.'
					: 'Results have not yet been revealed.'}
			</p>{/if}
		<label class="scenario-select" for={`${uid}-scenario`}
			>Development case to investigate<select
				id={`${uid}-scenario`}
				bind:value={scenario}
				onchange={() => {
					inspectedFinal = null;
				}}
				>{#each scenarios as s (s.id)}<option value={s.id}>{s.label}</option>{/each}</select
			></label
		>
		<details id={`${uid}-records`} open={view === 'pipeline' || inspectedFinal !== null}>
			<summary>Inspect the exact input records · {dataset.id}</summary>
			<!-- The named overflow region is focusable for keyboard scrolling. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="table-wrap" tabindex="0" role="region" aria-label="Invoice source records">
				<table>
					<caption
						>Invoices: one row per invoice, USD dollars at {dataset.cutoff ??
							'2026-09-30'}.</caption
					><thead><tr><th>ID</th><th>Amount</th><th>Source</th><th>Memo</th></tr></thead><tbody
						>{#each dataset.invoices as row (row.id)}<tr
								><th>{row.id}</th><td>{row.amount}</td><td>{row.source}</td><td
									>{row.memo ?? '—'}</td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<!-- The named overflow region is focusable for keyboard scrolling. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="table-wrap" tabindex="0" role="region" aria-label="Payment source records">
				<table>
					<caption>Payment events: preserve every raw row, including deliberate defects.</caption
					><thead
						><tr><th>Row</th><th>ID</th><th>Invoice</th><th>Currency</th><th>Raw amount</th></tr
						></thead
					><tbody
						>{#each dataset.payments as row (row.row)}<tr
								><th>{row.row}</th><td>{row.id}</td><td>{row.invoiceId}</td><td>{row.currency}</td
								><td>{row.amount ?? '(missing field)'}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
		</details>
		{#if result}
			<div class="run-banner">
				<strong>Last executed snapshot: {result.datasetId}</strong><span>{result.status}</span>
			</div>
			{#if result.datasetId !== dataset.id || JSON.stringify(result.config) !== JSON.stringify(config)}<p
					class="changed-note"
				>
					Inputs or settings changed. The results below remain the last executed snapshot; run again
					to update them.
				</p>{/if}
			<div class="metrics">
				<div>
					<span>All invoices</span><strong>{money(result.pipeline.controls.invoices)}</strong>
				</div>
				<div>
					<span>Accepted payments</span><strong>{money(result.pipeline.controls.accepted)}</strong>
				</div>
				<div>
					<span>Outstanding</span><strong>{money(result.pipeline.controls.outstanding)}</strong
					><small
						>{result.pipeline.complete
							? 'Reconciled under the fixture rules'
							: 'Provisional: inspect unresolved issues'}</small
					>
				</div>
			</div>
			<!-- The named overflow region is focusable for keyboard scrolling. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="table-wrap" tabindex="0" role="region" aria-label="Reconciled invoice results">
				<table>
					<caption>Calculated balances from the last run · USD.</caption><thead
						><tr
							><th>Invoice</th><th>Invoice amount</th><th>Accepted matched</th><th>Outstanding</th
							></tr
						></thead
					><tbody
						>{#each result.pipeline.rows as row (row.id)}<tr
								><th>{row.id}</th><td>{money(row.invoiceMinor)}</td><td>{money(row.paidMinor)}</td
								><td>{money(row.outstandingMinor)}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<div class="control-list">
				{#each result.pipeline.identities as identity (identity.label)}<div
						class:control-fail={!identity.pass}
					>
						<strong>{identity.pass ? '✓' : '!'} {identity.label}</strong><span
							>{money(identity.left)} = {money(identity.right)}</span
						>
					</div>{/each}
			</div>
			{#if result.pipeline.issues.length}<div class="result-note fail">
					<strong>Issues remain visible</strong>
					<ul>
						{#each result.pipeline.issues as issue (issue)}<li>{issue}</li>{/each}
					</ul>
				</div>{/if}
			<details>
				<summary>Every payment row and its treatment</summary>
				<!-- The named overflow region is focusable for keyboard scrolling. -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div class="table-wrap" tabindex="0" role="region" aria-label="Payment decisions">
					<table>
						<thead><tr><th>Row / ID</th><th>Treatment</th><th>Amount</th><th>Reason</th></tr></thead
						><tbody
							>{#each result.pipeline.decisions as d (d.row.row)}<tr
									><th>{d.row.row} / {d.row.id}</th><td>{d.status}</td><td
										>{d.row.currency} {d.row.amount ?? 'unknown'}</td
									><td>{d.reason}</td></tr
								>{/each}</tbody
						>
					</table>
				</div>
				<p>
					Unmatched accepted payments: {result.pipeline.unmatched.map((p) => p.row.id).join(', ') ||
						'none'} · {money(result.pipeline.controls.unmatched)}. Quarantined parseable USD: {money(
						result.pipeline.controls.quarantinedUsd
					)}. Unparseable or other-currency records cannot be included in a USD total as if their
					value were known.
				</p>
			</details>
			<div class="draft-card">
				<span class="eyebrow">AUTHORED TEMPLATE · FILLED FROM ACTUAL LOCAL RESULTS</span>
				<h4>Reviewer draft</h4>
				<p>{result.draft}</p>
				<small
					>Actual local queue: {result.queue.length} task(s), {result.queue
						.map((q) => q.status)
						.join(', ') || 'none created'}.</small
				>
			</div>
			<details open={view === 'agents'}>
				<summary>Inspect the execution trace · {result.trace.length} observed steps</summary
				>{#each result.trace as event, i (i)}<details class="trace-card">
						<summary
							>{i + 1}. {event.step} · {event.result.ok ? 'success' : event.result.code}</summary
						>
						<p>{event.provenance}</p>
						<pre>{JSON.stringify(
								{ request: event.request, result: event.result, state: event.state },
								null,
								2
							)}</pre>
					</details>{/each}
			</details>
			<div class="grade-grid">
				{#each result.grades as grade (grade.criterion)}<div class:fail={!grade.pass}>
						<strong>{grade.pass ? 'Pass' : 'Investigate'} · {grade.criterion}</strong>
						<p>{grade.reason}</p>
					</div>{/each}
			</div>
		{:else}<p class="empty">
				The source cohort is ready. Predict what will happen, then run it to create actual results
				and a trace. Reference control: {money(preview.controls.invoices)} of source invoices.
			</p>{/if}
		{#if view === 'agents'}<details>
				<summary>Compare an authored model-directed investigation</summary>
				<p>
					This trace is written for teaching. It is not a live agent run. Contrast its variable
					evidence choices with the fixed sequence executed above.
				</p>
				<ol>
					{#each authoredAgentTrace as event (event.step)}<li>
							<strong>{event.choice}</strong>
							<p>{event.reason}</p>
						</li>{/each}
				</ol>
			</details>{/if}
		{#if view === 'evaluation'}<button class="secondary" onclick={evaluate}
				>Run current configuration against all eight cases</button
			>
			<details>
				<summary>Inspect the separate authored repeated-trial exhibit</summary>
				<p>
					These fixed outcomes teach denominators; they are not model measurements. {trialMetrics.passes}/{trialMetrics.trials}
					passing trials; {trialMetrics.consistentCases}/{trialMetrics.cases} cases pass every trial.
				</p>
				<!-- The named overflow region is focusable for keyboard scrolling. -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="table-wrap"
					tabindex="0"
					role="region"
					aria-label="Authored repeated trial results"
				>
					<table>
						<thead><tr><th>Case</th><th>Trial 1</th><th>Trial 2</th><th>Trial 3</th></tr></thead
						><tbody
							>{#each authoredTrials as trial (trial.id)}<tr
									><th>{trial.id}</th>{#each trial.outcomes as pass, i (i)}<td
											>{pass ? 'Pass' : 'Fail'}</td
										>{/each}</tr
								>{/each}</tbody
						>
					</table>
				</div>
			</details>{/if}
		{#if currentEvaluation}<div class="assessment">
				<h4>Development evaluation · public PIPE-01 cases</h4>
				<p>
					{currentEvaluation.filter((c) => c.pass).length}/{currentEvaluation.length} cases meet their
					declared local criteria. Correct escalation counts as success. This small suite does not establish
					production reliability.
				</p>
				{#each currentEvaluation as c (c.id)}<details>
						<summary>{c.pass ? '✓' : '!'} {c.label} · {c.status}</summary
						>{#each c.grades as g (g.criterion)}<p>
								<strong>{g.pass ? 'Pass' : 'Fail'} · {g.criterion}:</strong>
								{g.reason}
							</p>{/each}
					</details>{/each}
			</div>{/if}
		{#if view === 'capstone' || revealed}
			<div class="explanation">
				<h4>Final pack · {CAPSTONE_FINAL_PACK}</h4>
				<p>{CAPSTONE_FINAL_PROVENANCE}</p>
				<p>
					{revealed
						? 'This pack has been consulted. Repairs are regression evidence.'
						: previouslySeen
							? 'This browser has previously consulted this pack; a new commitment is not fresh independent evidence.'
							: 'No final records or outcomes have been revealed in this browser’s recorded history.'}
				</p>
				<p class="method-note">
					{capstoneStorageMessage} This static client-side course is not a proctored exam. Clearing browser
					data or inspecting source code defeats this learning discipline.
				</p>
			</div>
		{/if}
		{#if finalEvaluation && firstFinal && firstCommit}
			<div class="assessment final-assessment" aria-label="Final pack assessment">
				<h4>
					{repairedFinal
						? 'Repaired run · already consulted final pack'
						: 'Revealed changed cases · distinct final pack'}
				</h4>
				<p>
					<strong>{finalEvaluation.filter((c) => c.pass).length}/{finalEvaluation.length}</strong> cases
					meet their declared criteria. A justified stop for missing evidence is a successful boundary,
					not a failure to finish.
				</p>
				<p>
					Preserved first commitment: {firstFinal.filter((c) => c.pass).length}/{firstFinal.length} ·
					{firstCommit.config.duplicatePolicy} / {firstCommit.config.join} / {firstCommit.config
						.invalid}. {firstExposureWasFresh
						? 'First recorded exposure on this browser.'
						: 'Already consulted or exposure history unverified at commitment.'}
				</p>
				{#each finalEvaluation as c (c.id)}
					<details>
						<summary>{c.pass ? '✓' : '!'} {c.label} · {c.status}</summary>
						<p>
							{c.id} · cutoff {c.dataset.cutoff} · {money(c.run.pipeline.controls.invoices)} source invoices.
							These are computed outcomes, not authored model trials.
						</p>
						{#each c.grades as g (g.criterion)}<p>
								<strong>{g.pass ? 'Pass' : 'Fail'} · {g.criterion}:</strong>
								{g.reason}
							</p>{/each}
						<button class="secondary" onclick={() => inspectFinal(c)}
							>Inspect records and execution · {c.dataset.focusInvoiceId}</button
						>
					</details>
				{/each}
				<button class="secondary" onclick={repairFinal}
					>Run repaired configuration · development evidence</button
				>
				<p class="method-note">
					The original committed results remain in the exported firstFinal record and survive a
					normal page reload. Retuning does not overwrite that evidence. The separately labelled
					PIPE-01 development evaluation never substitutes for this pack.
				</p>
			</div>
		{/if}
	{/if}

	<div class="lab-footer">
		<label for={`${uid}-reflection`}
			>Explain what the evidence changed<textarea
				id={`${uid}-reflection`}
				rows="3"
				bind:value={reflection}
				placeholder="What did you predict? What happened? Which claim can you now defend, and what remains unknown?"
			></textarea></label
		><button class="secondary" onclick={exportEvidence}
			><Download size={16} /> Export evidence and reasoning</button
		>
		<p class="method-note">
			Local teaching computation · no paid account · no real company records · written reasoning is
			self-assessed.
		</p>
		<p role="status" class="notice">{notice}</p>
	</div>
</section>

<style>
	.workflow-lab {
		--ink: #203d39;
		--muted: #5c706a;
		--line: #d9e5df;
		color: var(--ink);
		background: #f7faf7;
		border: 1px solid var(--line);
		border-radius: 24px;
		overflow: hidden;
		margin: 1.5rem 0;
		font-size: 0.95rem;
		line-height: 1.6;
	}
	.lab-heading {
		padding: 1.8rem 1.8rem 1rem;
		background: linear-gradient(125deg, #edf5eb, #f0edf9);
	}
	h3 {
		font-size: 1.75rem;
		letter-spacing: -0.04em;
		line-height: 1.2;
		margin: 0.6rem 0;
	}
	h4 {
		font-size: 1.08rem;
		margin: 0 0 0.7rem;
		line-height: 1.4;
	}
	p {
		margin: 0.65rem 0;
	}
	.eyebrow {
		font-size: 0.67rem;
		letter-spacing: 0.1em;
		font-weight: 800;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.live-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #398765;
	}
	.view-nav {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--line);
		background: #fff;
	}
	.view-nav button {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		border: 0;
		background: transparent;
		padding: 0.5rem 0.65rem;
		color: var(--muted);
		font-size: 0.8rem;
		border-radius: 10px;
	}
	.view-nav button.active {
		background: #e5efe6;
		color: #204e3e;
	}
	.workflow-lab > div:not(.lab-heading):not(.view-nav),
	.workflow-lab > p,
	.workflow-lab > button,
	.workflow-lab > details,
	.workflow-lab > label {
		margin: 1.25rem 1.5rem;
	}
	.controls {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 16px;
	}
	.two-cols {
		grid-template-columns: 1fr 1fr;
	}
	.three-cols {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.span-two {
		grid-column: 1/-1;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.81rem;
		font-weight: 650;
		min-width: 0;
	}
	input,
	select,
	textarea {
		font: inherit;
		color: var(--ink);
		border: 1px solid #b9cdc1;
		border-radius: 9px;
		padding: 0.65rem 0.7rem;
		background: white;
		width: 100%;
		box-sizing: border-box;
	}
	textarea {
		resize: vertical;
		line-height: 1.55;
		font-weight: 400;
	}
	input[type='range'] {
		padding: 0;
		accent-color: #397351;
	}
	input[type='checkbox'] {
		width: 16px;
		height: 16px;
		accent-color: #397351;
	}
	.check-label {
		flex-direction: row;
		align-items: center;
		font-weight: 500;
	}
	.method-note {
		color: var(--muted);
		font-size: 0.79rem;
	}
	.evidence-grid {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		gap: 1rem;
	}
	.source-card,
	.claim-panel {
		border: 1px solid var(--line);
		padding: 1rem;
		background: #fff;
		border-radius: 14px;
	}
	.source-card {
		margin: 0.7rem 0;
	}
	.source-meta {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.8rem;
	}
	.source-meta span {
		font-variant-numeric: tabular-nums;
		color: var(--muted);
	}
	small {
		font-size: 0.72rem;
		color: var(--muted);
	}
	.pill {
		font-size: 0.75rem;
		background: #e5efe6;
		padding: 0.15rem 0.4rem;
		border-radius: 20px;
	}
	.result-note {
		padding: 1rem;
		background: #e9f3e9;
		border: 1px solid #c4dcc7;
		border-radius: 12px;
		margin: 1rem 0;
	}
	.result-note p {
		font-size: 0.84rem;
	}
	.fail {
		background: #fff0e8 !important;
		border-color: #edc8b0 !important;
		color: #714228;
	}
	.empty {
		background: #f0f3f0;
		border: 1px dashed #c4d1c6;
		border-radius: 12px;
		padding: 1rem;
		font-size: 0.88rem;
	}
	pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		background: #eef2f0;
		padding: 0.8rem;
		border-radius: 10px;
		font-size: 0.76rem;
		line-height: 1.6;
		text-align: left;
	}
	.code-input {
		font-family: ui-monospace, monospace;
		font-size: 0.78rem;
	}
	.primary,
	.secondary {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		justify-content: center;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 650;
		border-radius: 10px;
		padding: 0.65rem 0.9rem;
		cursor: pointer;
		line-height: 1.4;
	}
	.primary {
		background: #305b45;
		color: #fff;
		border: 1px solid #305b45;
	}
	.secondary {
		background: white;
		border: 1px solid #bfd0c3;
		color: #30513c;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	button:focus-visible,
	input:focus-visible,
	select:focus-visible,
	textarea:focus-visible,
	summary:focus-visible,
	.table-wrap:focus-visible {
		outline: 3px solid #9171c4;
		outline-offset: 3px;
	}
	.mini-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.8rem;
	}
	.metrics > div {
		display: flex;
		flex-direction: column;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 1rem;
	}
	.metrics span {
		font-size: 0.75rem;
		color: var(--muted);
	}
	.metrics strong {
		font-size: 1.6rem;
		letter-spacing: -0.035em;
		font-variant-numeric: tabular-nums;
	}
	.metrics .word {
		font-size: 1rem;
		letter-spacing: 0;
		padding: 0.3rem 0;
	}
	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: white;
		margin: 1rem 0;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.78rem;
		text-align: left;
		min-width: 420px;
	}
	caption {
		text-align: left;
		padding: 0.8rem;
		color: var(--muted);
		font-size: 0.74rem;
	}
	th,
	td {
		padding: 0.65rem 0.8rem;
		border-bottom: 1px solid #e5ece6;
		vertical-align: top;
	}
	thead {
		background: #eaf1ea;
	}
	th {
		font-weight: 650;
	}
	tbody tr:last-child td,
	tbody tr:last-child th {
		border-bottom: 0;
	}
	details {
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 0.8rem 1rem;
		background: #fff;
		margin: 0.7rem 0;
	}
	summary {
		font-weight: 650;
		font-size: 0.85rem;
		cursor: pointer;
	}
	details > p {
		font-size: 0.83rem;
	}
	.trace-card {
		background: #f7f8fc;
	}
	.explanation {
		background: #efecf7;
		padding: 1.1rem;
		border-radius: 14px;
	}
	.commit-note {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		color: #41634a;
		font-size: 0.8rem;
	}
	.scenario-select {
		max-width: 450px;
	}
	.run-banner {
		display: flex;
		gap: 0.6rem;
		justify-content: space-between;
		flex-wrap: wrap;
		padding: 0.75rem 1rem;
		background: #e6eee7;
		border-radius: 10px;
		font-size: 0.78rem;
	}
	.run-banner span {
		font-weight: 700;
	}
	.changed-note {
		border-left: 3px solid #bb7a45;
		padding-left: 0.8rem;
		font-size: 0.82rem;
		color: #77512b;
	}
	.control-list > div {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.65rem 0;
		font-size: 0.8rem;
		border-bottom: 1px solid var(--line);
	}
	.control-list span {
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.control-fail {
		color: #994b2b;
	}
	.draft-card {
		background: #eeeaf7;
		border: 1px solid #d8cfe9;
		border-radius: 16px;
		padding: 1.2rem;
	}
	.draft-card .eyebrow {
		margin-bottom: 0.7rem;
	}
	.draft-card small {
		color: #48564c;
	}
	.grade-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.65rem;
	}
	.grade-grid > div {
		background: #edf4eb;
		border: 1px solid #d6e2d2;
		padding: 0.8rem;
		border-radius: 12px;
		font-size: 0.78rem;
	}
	.grade-grid p {
		margin: 0.4rem 0 0;
	}
	.assessment {
		border: 1px solid #d7cbea;
		border-radius: 16px;
		background: #f2eef9;
		padding: 1rem;
	}
	.lab-footer {
		border-top: 1px solid var(--line);
		padding-top: 1.3rem;
	}
	.lab-footer button {
		margin-top: 0.7rem;
	}
	.notice {
		font-size: 0.8rem;
		color: #3c6250;
		min-height: 1.2rem;
	}
	ul,
	ol {
		padding-left: 1.4rem;
	}
	@media (max-width: 760px) {
		.two-cols,
		.three-cols,
		.evidence-grid,
		.grade-grid {
			grid-template-columns: 1fr;
		}
		.span-two {
			grid-column: auto;
		}
		.lab-heading {
			padding: 1.25rem;
		}
		.workflow-lab > div:not(.lab-heading):not(.view-nav),
		.workflow-lab > p,
		.workflow-lab > button,
		.workflow-lab > details,
		.workflow-lab > label {
			margin: 1rem;
		}
		.view-nav {
			padding: 0.75rem;
		}
		.view-nav button {
			font-size: 0.73rem;
			padding: 0.45rem;
		}
		.control-list > div {
			flex-direction: column;
			gap: 0.2rem;
		}
		.metrics strong {
			font-size: 1.35rem;
		}
		.workflow-lab {
			border-radius: 18px;
		}
	}
</style>
