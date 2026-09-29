<script lang="ts">
	import {
		FileSpreadsheet,
		GitBranch,
		Workflow,
		AudioLines,
		Route,
		RotateCcw,
		Download,
		Calculator,
		ShieldCheck,
		Braces,
		Check,
		ArrowRight,
		Square,
		RefreshCw
	} from '@lucide/svelte';
	import {
		buildDocument,
		documentFixture,
		safeTsv,
		evidenceAnalysis,
		canonicalMillions,
		initialRuntime,
		initialRuntimeStore,
		runtimeFixture,
		dispatchRuntime,
		executeRuntime,
		cancelRuntime,
		checkpointRuntime,
		reconnectRuntime,
		initialVoice,
		voiceWords,
		WORD_MS,
		generateVoice,
		hearVoice,
		interruptVoice,
		startNextVoice,
		resolveVoiceTool,
		defaultRouting,
		compareRoutes,
		type BuilderMode,
		type NumberConvention,
		type CellCorrection,
		type RoutingConfig
	} from '$lib/engines/builder';
	import './builder-lab.css';
	let { mode = 'documents' }: { mode?: BuilderMode } = $props();
	const uid = $props.id();
	const descriptions = {
		documents: {
			icon: FileSpreadsheet,
			step: '01',
			title: 'From a page to a typed artifact',
			lead: 'Reconstruct merged headers. Preserve the source. Correct a real discrepancy without turning an unknown into a zero.',
			scope:
				'Authored OCR and source fixtures · actual grid reconstruction, typing and cent arithmetic'
		},
		evidence: {
			icon: GitBranch,
			step: '02',
			title: 'The denominator has a history',
			lead: 'A plausible growth rate can compare incompatible businesses. Follow each value to its period, basis, unit and revision.',
			scope:
				'Fictional disclosures · actual growth, CAGR, unit conversion and denominator selection'
		},
		runtime: {
			icon: Workflow,
			step: '03',
			title: 'An effect can outlive its reply',
			lead: 'Deliver tool calls out of order, lose a response, and recover without adding the same review twice.',
			scope:
				'Authored tool proposals · real local state transitions · no secure server or external actions'
		},
		voice: {
			icon: AudioLines,
			step: '04',
			title: 'Interrupt the right response',
			lead: 'What was generated is not always what was heard. Cancel a generation, clear its buffer, and route a late tool result.',
			scope:
				'Deterministic event simulator · authored words · no microphone, audio playback or provider inference'
		},
		routing: {
			icon: Route,
			step: '05',
			title: 'Choose a route you can defend',
			lead: 'Compare capability, context, cost and observed mistakes. The cheapest call need not produce the lowest total cost.',
			scope:
				'Authored synthetic provider measurements · computed comparisons · not real provider benchmarks'
		}
	};
	const description = $derived(descriptions[mode]);
	let notice = $state('');
	let documentStyle = $state('dot');
	let convention = $state<NumberConvention>('dot');
	let corrections = $state<CellCorrection[]>([]);
	let correctionCell = $state('5:1');
	let correctionValue = $state('50.00');
	let correctionReason = $state('Authored source line for account 0101 reads 50.00.');
	let correctionError = $state('');
	const document = $derived(buildDocument(documentStyle === 'comma', convention, corrections));
	const sourceRows = $derived(document.authoredSourceRows);
	const correctionOptions = [
		{ value: '5:1', label: 'B6 · 2025 account 0101 (OCR 60)' },
		{ value: '4:2', label: 'C5 · 2024 account 0088 (blank)' },
		{ value: '2:1', label: 'B3 · 2025 account 0012' },
		{ value: '6:1', label: 'B7 · 2025 printed total' }
	];
	function changeDocumentStyle(value: string) {
		documentStyle = value;
		corrections = [];
		correctionError = '';
		notice = 'Loaded another authored number convention. Check the conversion setting.';
	}
	function applyCorrection() {
		const [row, col] = correctionCell.split(':').map(Number);
		try {
			const next = [
				...corrections,
				{ row, col, value: correctionValue, reason: correctionReason.trim() }
			];
			const preview = buildDocument(documentStyle === 'comma', convention, next);
			if (preview.typed[row][col].kind === 'unresolved')
				throw new Error(preview.typed[row][col].issue);
			corrections = next;
			correctionError = '';
			notice = 'Correction recorded. Original OCR text remains in the artifact.';
		} catch (error) {
			correctionError = (error as Error).message;
		}
	}
	let comparison = $state('restated');
	let cloverValue = $state('');
	let currentRevenue = $state(101.2);
	let evidenceUnit = $state('million');
	const evidence = $derived.by(() => {
		try {
			const clover = cloverValue.trim() === '' ? null : Number(cloverValue);
			return {
				ok: true as const,
				value: evidenceAnalysis(comparison === 'restated', clover, currentRevenue)
			};
		} catch (error) {
			return { ok: false as const, error: (error as Error).message };
		}
	});
	const revenueLabel = (value: number | null) =>
		value === null
			? 'Not disclosed'
			: `${(value * (evidenceUnit === 'thousand' ? 1000 : 1)).toLocaleString('en-US', { maximumFractionDigits: 3 })}`;
	let runtime = $state(initialRuntime());
	let store = $state(initialRuntimeStore());
	let proposal = $state(JSON.stringify(runtimeFixture[0], null, 2));
	let selectedCall = $state('call-read');
	let allowWrite = $state(true);
	let checkpoint = $state('');
	let runtimeError = $state('');
	const selectedRequest = $derived(runtime.calls.find((call) => call.callId === selectedCall));
	function loadProposal(index: number) {
		proposal = JSON.stringify(runtimeFixture[index], null, 2);
		notice = 'Authored proposal loaded. Dispatch validates it; no tool has executed yet.';
	}
	function dispatch() {
		try {
			runtime = dispatchRuntime(runtime, JSON.parse(proposal));
			selectedCall = runtime.calls.at(-1)?.callId ?? selectedCall;
			runtimeError = '';
		} catch {
			runtimeError = 'This is not valid JSON. Repair the request before dispatching.';
		}
	}
	function deliver(callId = selectedCall, loseReply = false) {
		const result = executeRuntime(runtime, store, callId, allowWrite, loseReply);
		runtime = result.state;
		store = result.store;
	}
	function saveCheckpoint() {
		checkpoint = checkpointRuntime(runtime);
		notice = 'Working-state checkpoint saved in this tab. The effect store is a separate object.';
	}
	function reconnect() {
		try {
			runtime = reconnectRuntime(checkpoint);
			runtimeError = '';
			notice = 'Reconnected. Deliver the pending call to inspect receipt reuse.';
		} catch (error) {
			runtimeError = (error as Error).message;
		}
	}
	function concurrentEdit() {
		store = { ...store, revision: store.revision + 1 };
		runtime = {
			...runtime,
			events: [
				...runtime.events.slice(-29),
				`Another editor changed the artifact to revision ${store.revision}. Pending expectedRevision values did not change.`
			]
		};
	}
	let voice = $state(initialVoice());
	let selectedVoiceCall = $state('voice-call-1');
	let routing = $state<RoutingConfig>({ ...defaultRouting });
	const routeResults = $derived.by(() => {
		try {
			return { ok: true as const, value: compareRoutes(routing) };
		} catch (error) {
			return { ok: false as const, error: (error as Error).message };
		}
	});
	const usd = (value: number, digits = 2) =>
		value.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: digits,
			maximumFractionDigits: digits
		});
	const percentage = (value: number | null) =>
		value === null ? 'Unavailable' : `${(100 * value).toFixed(2)}%`;
	function reset() {
		notice = 'Experiment reset. Nothing was sent to a server.';
		if (mode === 'documents') {
			documentStyle = 'dot';
			convention = 'dot';
			corrections = [];
			correctionCell = '5:1';
			correctionValue = '50.00';
			correctionReason = 'Authored source line for account 0101 reads 50.00.';
			correctionError = '';
		}
		if (mode === 'evidence') {
			comparison = 'restated';
			cloverValue = '';
			currentRevenue = 101.2;
			evidenceUnit = 'million';
		}
		if (mode === 'runtime') {
			runtime = initialRuntime();
			store = initialRuntimeStore();
			proposal = JSON.stringify(runtimeFixture[0], null, 2);
			selectedCall = 'call-read';
			allowWrite = true;
			checkpoint = '';
			runtimeError = '';
		}
		if (mode === 'voice') {
			voice = initialVoice();
			selectedVoiceCall = 'voice-call-1';
		}
		if (mode === 'routing') routing = { ...defaultRouting };
	}
	function download(tsv = false) {
		const payload =
			mode === 'documents'
				? document
				: mode === 'evidence'
					? evidence.ok
						? evidence.value
						: evidence
					: mode === 'runtime'
						? {
								schema: 'teaching-runtime-v1',
								runtime,
								store,
								checkpoint: checkpoint ? JSON.parse(checkpoint) : null
							}
						: mode === 'voice'
							? { schema: 'teaching-voice-v1', words: voiceWords, wordMilliseconds: WORD_MS, voice }
							: routeResults.ok
								? routeResults.value
								: routeResults;
		const content = tsv
			? safeTsv(document.typed.map((row) => row.map((cell) => (cell.covered ? null : cell.value))))
			: JSON.stringify(payload, null, 2);
		const blob = new Blob([content], {
			type: tsv ? 'text/tab-separated-values;charset=utf-8' : 'application/json'
		});
		const url = URL.createObjectURL(blob),
			anchor = window.document.createElement('a');
		anchor.href = url;
		anchor.download = `builder-${mode}.${tsv ? 'tsv' : 'json'}`;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		notice = `Exported the current ${tsv ? 'flat TSV' : 'JSON snapshot'}. ${tsv ? 'Use JSON to preserve cell types, source and corrections.' : 'This is a local teaching artifact.'}`;
	}
</script>

<section class="builder-lab" aria-label={description.title}>
	<header class="builder-header">
		<div class="builder-icon"><description.icon size={27} strokeWidth={1.5} /></div>
		<div class="builder-heading">
			<p class="builder-kicker">Systems bench / {description.step}</p>
			<h2>{description.title}</h2>
			<p>{description.lead}</p>
		</div>
		<div class="builder-actions">
			<button onclick={reset}><RotateCcw size={15} />Reset</button><button
				onclick={() => download()}><Download size={15} />Export snapshot</button
			>
		</div>
	</header>
	<p class="builder-scope"><ShieldCheck size={16} />{description.scope}</p>
	{#if notice}<p class="builder-notice" role="status">{notice}</p>{/if}

	{#if mode === 'documents'}
		<div class="builder-step-row">
			<span>01 Source structure</span><ArrowRight size={16} /><span>02 Typed values</span
			><ArrowRight size={16} /><span>03 Reconcile & review</span>
		</div>
		<div class="builder-split">
			<section class="builder-paper" aria-label="Authored source document">
				<p class="builder-kicker">Fictional source · statement excerpt</p>
				<h3>The page says 50.00</h3>
				<p>
					Source and OCR are separate evidence. The extraction fixture below misreads account 0101
					as 60.00. The blank in 2024 has no established meaning.
				</p>
				<table class="builder-source-table">
					<caption>Authored source, before extraction</caption><tbody
						>{#each sourceRows as row, r (r)}<tr
								>{#each row as cell, c (c)}{#if cell.header}<th
											rowspan={cell.rowSpan}
											colspan={cell.colSpan}
											scope={r === 0 && c === 0 ? 'col' : undefined}>{cell.text}</th
										>{:else}<td class:builder-source-highlight={r === 5 && c === 1}
											>{cell.text || '— blank —'}</td
										>{/if}{/each}</tr
							>{/each}</tbody
					>
				</table>
				<label class="builder-field"
					>Source number style<select
						value={documentStyle}
						onchange={(e) => changeDocumentStyle(e.currentTarget.value)}
						><option value="dot">1,200.00 · dot decimal</option><option value="comma"
							>1.200,00 · comma decimal</option
						></select
					></label
				>
			</section>
			<section class="builder-panel" aria-label="Document conversion controls">
				<p class="builder-kicker">Conversion contract</p>
				<h3>Decide before converting</h3>
				<label class="builder-field"
					>Number convention<select bind:value={convention}
						><option value="dot">Dot decimal, comma grouping</option><option value="comma"
							>Comma decimal, dot grouping</option
						><option value="undecided">Undecided · preserve punctuation as unresolved</option
						></select
					></label
				>
				<p>
					Column A is an identifier: <code>0012</code> stays text. Parentheses mean a negative amount.
					Money is summed as integer cents. A blank has no numeric value.
				</p>
				<div class="builder-mini-grid">
					<div>
						<strong>{document.ocrGrid.length} × {document.ocrGrid[0].length}</strong><span
							>rectangular positions</span
						>
					</div>
					<div><strong>2</strong><span>covered header positions</span></div>
					<div><strong>{corrections.length}</strong><span>recorded corrections</span></div>
				</div>
				<details>
					<summary><Braces size={15} />Inspect the authored OCR structure</summary>
					<p>
						These are provider-shaped JSON inputs. The expansion function uses rowSpan and colSpan;
						covered positions retain an anchor reference, not another copy of the number.
					</p>
					<!-- Bounded source evidence is keyboard-scrollable. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<pre tabindex="0" role="region" aria-label="OCR fixture JSON">{JSON.stringify(
							documentFixture(documentStyle === 'comma'),
							null,
							2
						)}</pre>
				</details>
			</section>
		</div>
		<section class="builder-panel">
			<div class="builder-section-heading">
				<div>
					<p class="builder-kicker">Actual reconstruction</p>
					<h3>One grid, explicit cell types</h3>
				</div>
				<button onclick={() => download(true)}><Download size={15} />Export flat TSV</button>
			</div>
			<p>
				Each position shows its current typed value. A covered header points to its anchor. Raw OCR
				is retained alongside any correction in the JSON export.
			</p>
			<!-- Wide exact tables need keyboard scrolling. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="builder-table-scroll"
				tabindex="0"
				role="region"
				aria-label="Typed grid, scroll horizontally"
			>
				<table>
					<caption>Current typed artifact · cell addresses match the correction controls</caption
					><thead
						><tr
							><th scope="col">Source row</th><th scope="col">A · ID / label</th><th scope="col"
								>B · 2025</th
							><th scope="col">C · 2024</th></tr
						></thead
					><tbody
						>{#each document.typed as row, r (r)}<tr
								><th scope="row">{r + 1}</th>{#each row as cell, c (c)}<td
										class:builder-cell-unresolved={cell.kind === 'unresolved'}
										><span class="builder-cell-address">{String.fromCharCode(65 + c)}{r + 1}</span
										>{#if cell.covered}<span class="builder-muted">Covered → {cell.anchor}</span
											>{:else}<strong
												>{cell.value === null
													? 'Missing'
													: cell.kind === 'money'
														? usd(cell.value as number)
														: cell.value}</strong
											><small>{cell.kind}{cell.correction ? ' · corrected' : ''}</small
											>{#if cell.correction}<small>OCR: {cell.original || '(blank)'}</small
												>{/if}{#if cell.issue}<small>{cell.issue}</small>{/if}{/if}</td
									>{/each}</tr
							>{/each}</tbody
					>
				</table>
			</div>
		</section>
		<div class="builder-split">
			<section class="builder-panel">
				<p class="builder-kicker">Human correction</p>
				<h3>Change a value, keep its history</h3>
				<label class="builder-field"
					>Correction cell<select bind:value={correctionCell}
						>{#each correctionOptions as option (option.value)}<option value={option.value}
								>{option.label}</option
							>{/each}</select
					></label
				><label class="builder-field"
					>Corrected source value<input bind:value={correctionValue} maxlength="40" /></label
				><label class="builder-field"
					>Evidence and reason<textarea bind:value={correctionReason} maxlength="240" rows="2"
					></textarea></label
				><button class="builder-primary" onclick={applyCorrection}
					><Check size={16} />Apply correction</button
				>{#if correctionError}<p role="alert" class="builder-error">{correctionError}</p>{/if}
			</section>
			<section class="builder-panel">
				<p class="builder-kicker">Computed check · USD</p>
				<h3>A reconciled sum is one kind of evidence</h3>
				{#each document.checks as check (check.period)}<div
						class="builder-check"
						class:builder-check-warn={!check.complete || check.differenceMinor !== 0}
					>
						<div>
							<strong>{check.period}</strong><span
								>{check.complete
									? check.differenceMinor === 0
										? 'Reconciled'
										: 'Discrepancy'
									: 'Incomplete evidence'}</span
							>
						</div>
						<dl>
							<div>
								<dt>Known components</dt>
								<dd>{usd(check.knownMinor / 100)}</dd>
							</div>
							<div>
								<dt>Printed total</dt>
								<dd>
									{check.printedMinor === null ? 'Unresolved' : usd(check.printedMinor / 100)}
								</dd>
							</div>
							<div>
								<dt>Difference</dt>
								<dd>
									{check.differenceMinor === null
										? `Withheld · ${check.unavailable} unavailable component(s)`
										: usd(check.differenceMinor / 100)}
								</dd>
							</div>
						</dl>
					</div>{/each}
				<p>
					A zero difference does not certify that the page is true. An unresolved blank prevents a
					complete check; entering 0 is a review decision that needs evidence.
				</p>
			</section>
		</div>
		<p class="builder-takeaway">
			<strong>Builder test:</strong> deliberately choose the wrong number convention, repair it, then
			correct B6. Export JSON and locate both the original 60.00 and the correction reason. TSV is flat
			interchange; it does not retain types, merges, source records, or workbook formatting.
		</p>
	{:else if mode === 'evidence'}
		<div class="builder-control-grid">
			<label class="builder-field"
				>Historical comparator<select bind:value={comparison}
					><option value="restated">Restated · continuing operations</option><option
						value="original">Original · all operations</option
					></select
				></label
			><label class="builder-field"
				>Display unit<select bind:value={evidenceUnit}
					><option value="million">USD million</option><option value="thousand">USD thousand</option
					></select
				></label
			><label class="builder-field"
				>Aster 2025 revenue · USD million<input
					type="number"
					min="0"
					max="100000"
					step="0.1"
					bind:value={currentRevenue}
				/></label
			><label class="builder-field"
				>Clover 2025 revenue · USD million<input
					inputmode="decimal"
					bind:value={cloverValue}
					placeholder="Blank means not disclosed"
				/><small>Enter 20 to add an authored disclosure; blank is not zero.</small></label
			>
		</div>
		{#if !evidence.ok}<p role="alert" class="builder-error">{evidence.error}</p>{:else}
			{@const data = evidence.value}
			<div class="builder-metrics">
				<div>
					<span>2025 versus 2024</span><strong
						>{data.comparable ? percentage(data.growth) : 'Not comparable'}</strong
					><small>{data.series[1].id} → {data.series[2].id}</small>
				</div>
				<div>
					<span>2023 → 2025 CAGR</span><strong
						>{data.comparable ? percentage(data.cagr) : 'Withheld'}</strong
					><small>{data.intervals} year intervals · same-basis endpoints required</small>
				</div>
				<div>
					<span>Share of disclosed observations</span><strong>{percentage(data.share)}</strong
					><small>{data.includedIds.length} of 3 entities in the denominator</small>
				</div>
			</div>
			{#if !data.comparable}<p class="builder-warning" role="status">
					<strong>The raw quotient is {percentage(data.naiveGrowth)}.</strong> It compares current continuing
					operations with earlier all-operations revenue. It is arithmetic, but not a defensible same-basis
					growth headline. Select the restated series to change the denominator and the conclusion.
				</p>{/if}
			<div class="builder-split">
				<section class="builder-panel">
					<p class="builder-kicker">The selected series</p>
					<h3>Shared scale, visible provenance</h3>
					<p>Amounts shown in USD {evidenceUnit}. Each bar starts at zero.</p>
					<div class="builder-bars">
						{#each data.series as observation (observation.id)}<div class="builder-bar-row">
								<div>
									<strong>{observation.year}</strong><span
										>{revenueLabel(canonicalMillions(observation))}</span
									>
								</div>
								<div class="builder-bar-track">
									<div
										style:width={`${(100 * canonicalMillions(observation)!) / Math.max(1, ...data.series.map((row) => canonicalMillions(row)!))}%`}
										class:builder-bar-caution={!data.comparable}
									></div>
								</div>
								<small>{observation.id} · {observation.basis}</small>
							</div>{/each}
					</div>
					<p>
						The 2024 source retains 100. The restatement adds 92 on a different basis. Selecting a
						newer observation must not erase the original.
					</p>
				</section>
				<section class="builder-panel">
					<p class="builder-kicker">Denominator audit</p>
					<h3>Missing is not a competitor with zero revenue</h3>
					<dl class="builder-facts">
						<div>
							<dt>Aster</dt>
							<dd>{revenueLabel(canonicalMillions(data.peers[0]))}</dd>
						</div>
						<div>
							<dt>Birch · originally USD thousand</dt>
							<dd>{revenueLabel(canonicalMillions(data.peers[1]))}</dd>
						</div>
						<div>
							<dt>Clover</dt>
							<dd>{revenueLabel(canonicalMillions(data.peers[2]))}</dd>
						</div>
						<div>
							<dt>Disclosed denominator</dt>
							<dd>{revenueLabel(data.denominator)}</dd>
						</div>
					</dl>
					<p>Included observation IDs: <code>{data.includedIds.join(', ')}</code>.</p>
					<p>
						{data.missingIds.length
							? 'Clover is excluded as missing. This is not market share or a complete-market ranking.'
							: 'All three authored observations are disclosed. This still describes only this selected three-entity set.'}
					</p>
					<p>
						Birch’s 60,000 thousand becomes 60 million before addition. Changing display units does
						not change a ratio.
					</p>
				</section>
			</div>
			<details class="builder-panel">
				<summary><GitBranch size={16} />Inspect every source and revision</summary>
				<!-- Wide exact tables need keyboard scrolling. -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="builder-table-scroll"
					tabindex="0"
					role="region"
					aria-label="Evidence lineage table"
				>
					<table>
						<caption>Fictional observation ledger · earlier records remain immutable</caption><thead
							><tr
								><th scope="col">Observation</th><th scope="col">Period / unit</th><th scope="col"
									>Value</th
								><th scope="col">Basis</th><th scope="col">Source / revision</th></tr
							></thead
						><tbody
							>{#each data.observations as row (row.id)}<tr
									><th scope="row">{row.id}<small>{row.entity}</small></th><td
										>{row.periodEnd}<small>{row.unit}</small></td
									><td>{row.value ?? 'Not disclosed'}</td><td>{row.basis}</td><td
										>{row.source}<small
											>v{row.version}{row.supersedes
												? ` · supersedes ${row.supersedes}`
												: ''}</small
										></td
									></tr
								>{/each}</tbody
						>
					</table>
				</div>
			</details>
			<p class="builder-takeaway">
				<strong>Builder test:</strong> switch to original history, then return to the restatement. Add
				Clover’s 20 and inspect the denominator IDs. A different growth story here reflects a changed
				basis; it does not establish that business performance accelerated.
			</p>
		{/if}
	{:else if mode === 'runtime'}
		<div class="builder-metrics">
			<div>
				<span>Transport</span><strong>{runtime.connected ? 'Connected' : 'Reply lost'}</strong
				><small>{runtime.attempts}/8 proposal attempts</small>
			</div>
			<div>
				<span>Durable review queue</span><strong
					>{store.queue.length} item{store.queue.length === 1 ? '' : 's'}</strong
				><small>Artifact revision {store.revision}</small>
			</div>
			<div>
				<span>Effect receipts</span><strong>{store.receipts.length}</strong><small
					>Separate from working-state checkpoint</small
				>
			</div>
		</div>
		<div class="builder-split">
			<section class="builder-panel">
				<p class="builder-kicker">Authored model proposal</p>
				<h3>Proposal → validation → pending call</h3>
				<div class="builder-actions">
					<button onclick={() => loadProposal(0)}>Load read proposal</button><button
						onclick={() => loadProposal(1)}>Load review proposal</button
					>
				</div>
				<label class="builder-field" for={`${uid}-proposal`}>Tool request JSON</label><textarea
					class="builder-code-input"
					id={`${uid}-proposal`}
					bind:value={proposal}
					rows="11"
					maxlength="2000"
					spellcheck="false"></textarea><button
					class="builder-primary"
					onclick={dispatch}
					disabled={!runtime.connected || runtime.attempts >= 8}
					><Braces size={16} />Validate and dispatch</button
				>
				<p>
					Dispatch records a valid request. Execution checks document scope, current permission,
					expected revision, and a stable operation identity. A call ID routes a reply; an operation
					ID identifies a business effect.
				</p>
			</section>
			<section class="builder-panel">
				<p class="builder-kicker">Controlled execution</p>
				<h3>Choose which reply arrives next</h3>
				<label class="builder-field"
					>Selected call<select bind:value={selectedCall} disabled={!runtime.calls.length}
						>{#if !runtime.calls.length}<option value="call-read">Dispatch a call first</option
							>{/if}{#each runtime.calls as call (call.callId)}<option value={call.callId}
								>{call.callId} · {call.status}</option
							>{/each}</select
					></label
				><label class="builder-checkbox"
					><input type="checkbox" bind:checked={allowWrite} />Allow writes at execution</label
				>
				<div class="builder-actions">
					<button
						class="builder-primary"
						onclick={() => deliver()}
						disabled={!runtime.connected || !selectedRequest}
						><Calculator size={16} />Deliver selected call</button
					><button
						onclick={() => deliver(selectedCall, true)}
						disabled={!runtime.connected || selectedRequest?.status !== 'pending'}
						>Execute, lose reply</button
					><button
						onclick={() => (runtime = cancelRuntime(runtime, selectedCall))}
						disabled={selectedRequest?.status !== 'pending'}
						><Square size={14} />Cancel selected call</button
					>
				</div>
				<div class="builder-actions">
					<button onclick={() => deliver('unknown-call')} disabled={!runtime.connected}
						>Deliver unknown call</button
					><button onclick={concurrentEdit}>Simulate concurrent revision</button>
				</div>
				<p>
					Unchecking writes after dispatch still blocks execution. A stale expectedRevision rejects
					an uncommitted write. An already committed matching receipt can be replayed without a
					second effect.
				</p>
			</section>
		</div>
		<section class="builder-recovery">
			<div>
				<p class="builder-kicker">Try the lost-response case</p>
				<h3>Keep the receipt when the connection disappears</h3>
				<ol>
					<li>Load the review proposal and dispatch it.</li>
					<li>Checkpoint the pending working state.</li>
					<li>Execute, lose reply. The queue changes; the call stays unresolved.</li>
					<li>
						Reconnect from the checkpoint, then deliver the same call. Inspect “Receipt reused”.
					</li>
				</ol>
			</div>
			<div class="builder-actions builder-actions-vertical">
				<button onclick={saveCheckpoint}><Download size={16} />Checkpoint working state</button
				><button onclick={reconnect} disabled={!checkpoint}
					><RefreshCw size={16} />Reconnect from checkpoint</button
				><small
					>{checkpoint ? 'One tab-local working-state checkpoint retained.' : 'No checkpoint yet.'} The
					store and receipt ledger survive this simulated reconnect. Reset clears both.</small
				>
			</div>
		</section>
		{#if runtimeError}<p role="alert" class="builder-error">{runtimeError}</p>{/if}
		<!-- Wide exact tables need keyboard scrolling. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="builder-table-scroll"
			tabindex="0"
			role="region"
			aria-label="Tool call routing table"
		>
			<table>
				<caption>Exact call state · two calls can finish in a different order than dispatch</caption
				><thead
					><tr
						><th scope="col">Call identity</th><th scope="col">Tool</th><th scope="col">State</th
						><th scope="col">Actual result</th></tr
					></thead
				><tbody
					>{#each runtime.calls as call (call.callId)}<tr
							><th scope="row">{call.callId}</th><td>{call.tool}</td><td>{call.status}</td><td
								>{call.result ?? 'No reply recorded'}</td
							></tr
						>{:else}<tr><td colspan="4">No calls have been dispatched.</td></tr>{/each}</tbody
				>
			</table>
		</div>
		<section class="builder-panel">
			<p class="builder-kicker">Execution trace</p>
			<!-- The bounded event trace is keyboard-scrollable. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ol class="builder-trace" tabindex="0" aria-label="Runtime event trace">
				{#each runtime.events as event, i (i)}<li>
						<span>{String(i + 1).padStart(2, '0')}</span>
						<p>{event}</p>
					</li>{/each}
			</ol>
		</section>
		<details class="builder-panel">
			<summary><Braces size={16} />Inspect checkpoint and durable store</summary>
			<h4>Working-state snapshot</h4>
			<!-- Bounded source evidence is keyboard-scrollable. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<pre tabindex="0" role="region" aria-label="Working-state checkpoint">{checkpoint ||
					'No saved checkpoint.'}</pre>
			<h4>Durable store and effect receipts</h4>
			<!-- Bounded source evidence is keyboard-scrollable. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<pre tabindex="0" role="region" aria-label="Durable receipt store">{JSON.stringify(
					store,
					null,
					2
				)}</pre>
		</details>
		<p class="builder-takeaway">
			<strong>Builder test:</strong> reset, dispatch both proposals and deliver the review first. Then
			try denied permission and a concurrent revision. This in-memory lesson demonstrates the protocol;
			a production system needs authenticated server checks, atomic durable writes and trusted storage.
		</p>
	{:else if mode === 'voice'}
		<div class="builder-metrics">
			<div>
				<span>Response identity</span><strong>g{voice.generation}</strong><small
					>{voice.active ? 'Active generation' : 'Cancelled generation'}</small
				>
			</div>
			<div>
				<span>Generated</span><strong>{voice.generated * WORD_MS} ms</strong><small
					>{voice.generated} authored words</small
				>
			</div>
			<div>
				<span>Actually heard</span><strong>{voice.heard * WORD_MS} ms</strong><small
					>{voice.heard} complete authored words</small
				>
			</div>
		</div>
		<section class="builder-panel">
			<p class="builder-kicker">A visible audio-buffer analogue</p>
			<h3>Generated ahead of the listener</h3>
			<p>
				Every authored word occupies exactly {WORD_MS} ms in this teaching fixture. Real audio requires
				provider timestamps and actual playback position; word count alone is not a production timing
				method.
			</p>
			<div class="builder-voice-timeline">
				<div>
					<strong>Generated</strong>
					<div class="builder-bar-track">
						<div style:width={`${(100 * voice.generated) / voiceWords.length}%`}></div>
					</div>
					<span>{voice.generated * WORD_MS} ms</span>
				</div>
				<div>
					<strong>Heard</strong>
					<div class="builder-bar-track">
						<div
							class="builder-heard-bar"
							style:width={`${(100 * voice.heard) / voiceWords.length}%`}
						></div>
					</div>
					<span>{voice.heard * WORD_MS} ms</span>
				</div>
			</div>
			<div
				class="builder-words"
				aria-label="Authored response words; dark words heard, tinted words generated but unheard"
			>
				{#each voiceWords as word, i (i)}<span
						class:builder-word-heard={i < voice.heard}
						class:builder-word-buffered={i >= voice.heard &&
							i < voice.generated &&
							!voice.queueCleared}
						class:builder-word-discarded={i >= voice.heard &&
							i < voice.generated &&
							voice.queueCleared}>{word}</span
					>{/each}
			</div>
			<p class="builder-muted">
				Dark: heard · lavender: buffered · struck through: discarded · gray: not generated.
			</p>
			<div class="builder-actions">
				<button
					class="builder-primary"
					onclick={() => (voice = generateVoice(voice))}
					disabled={!voice.active || voice.generated === voiceWords.length}
					><Calculator size={16} />Generate next six words</button
				><button
					onclick={() => (voice = hearVoice(voice))}
					disabled={!voice.active || voice.heard >= voice.generated}
					>Advance listener by two words</button
				><button onclick={() => (voice = interruptVoice(voice))} disabled={!voice.active}
					><Square size={14} />Barge in</button
				><button
					onclick={() => (voice = startNextVoice(voice))}
					disabled={voice.active || voice.generation >= 5}
					><RefreshCw size={16} />Start next response</button
				>
			</div>
		</section>
		<div class="builder-split">
			<section class="builder-panel">
				<p class="builder-kicker">Conversation context after interruption</p>
				<h3>Keep the heard prefix</h3>
				{#each voice.context as entry (entry.generation)}<div class="builder-context">
						<small>g{entry.generation} · truncated at {entry.heardMs} ms</small>
						<p>{entry.text || '(No assistant words were heard.)'}</p>
					</div>{:else}<p>
						Barge in to record the heard prefix. Buffered words must not be treated as something the
						user was told.
					</p>{/each}
				<p>
					Cancellation, audio-buffer clearing and context truncation are separate actions. A stopped
					visual animation alone would not accomplish them.
				</p>
			</section>
			<section class="builder-panel">
				<p class="builder-kicker">Asynchronous tool result</p>
				<h3>A stale response cannot speak for a new one</h3>
				<label class="builder-field"
					>Tool result identity<select bind:value={selectedVoiceCall}
						>{#each voice.toolCalls as call (call.callId)}<option value={call.callId}
								>{call.callId} · g{call.generation} · {call.status}</option
							>{/each}</select
					></label
				><button onclick={() => (voice = resolveVoiceTool(voice, selectedVoiceCall))}
					>Deliver tool result</button
				>
				<p>
					The fixture tool is read-only: it returns an authored source difference of USD 50.00. A
					response must match both its call ID and the active generation. Stale and duplicate
					results stay in the trace.
				</p>
				<ul class="builder-compact-list">
					{#each voice.toolCalls as call (call.callId)}<li>
							<code>{call.callId}</code><span>{call.status}</span>
						</li>{/each}
				</ul>
			</section>
		</div>
		<section class="builder-panel">
			<p class="builder-kicker">Event timeline</p>
			<!-- The bounded event trace is keyboard-scrollable. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ol class="builder-trace" tabindex="0" aria-label="Voice event trace">
				{#each voice.events as event, i (i)}<li>
						<span>{String(i + 1).padStart(2, '0')}</span>
						<p>{event}</p>
					</li>{/each}
			</ol>
		</section>
		<p class="builder-takeaway">
			<strong>Builder test:</strong> generate twelve words, advance the listener twice, barge in, and
			start g2. Deliver voice-call-1, then voice-call-2. The old result is ignored; only the new identity
			can join the active response. A real write already committed by a tool would need its own receipt/recovery
			policy—voice cancellation cannot undo it.
		</p>
	{:else if mode === 'routing'}
		<div class="builder-control-grid">
			<label class="builder-field"
				>Required capability<select bind:value={routing.capability}
					><option value="text">Text</option><option value="vision">Vision</option></select
				></label
			><label class="builder-field"
				>Input tokens<input
					type="number"
					min="1"
					max="100000"
					step="100"
					bind:value={routing.inputTokens}
				/></label
			><label class="builder-field"
				>Reserved output tokens<input
					type="number"
					min="1"
					max="20000"
					step="100"
					bind:value={routing.outputTokens}
				/></label
			><label class="builder-field"
				>Per-call API budget · USD<input
					type="number"
					min="0"
					max="10"
					step="0.01"
					bind:value={routing.maxCallCost}
				/></label
			><label class="builder-field"
				>Latency limit · seconds<input
					type="number"
					min="0.1"
					max="60"
					step="0.1"
					bind:value={routing.maxLatency}
				/></label
			><label class="builder-field"
				>Critical errors allowed per 100 cases<input
					type="number"
					min="0"
					max="100"
					step="1"
					bind:value={routing.criticalLimit}
				/></label
			><label class="builder-field"
				>Cost per minor mistake · USD<input
					type="number"
					min="0"
					max="10000"
					step="1"
					bind:value={routing.minorCost}
				/></label
			><label class="builder-field"
				>Cost per critical mistake · USD<input
					type="number"
					min="0"
					max="100000"
					step="1"
					bind:value={routing.criticalCost}
				/></label
			>
		</div>
		{#if !routeResults.ok}<p role="alert" class="builder-error">{routeResults.error}</p>{:else}
			{@const result = routeResults.value}
			<p class="builder-routing-verdict" role="status">
				<ShieldCheck size={21} /><span
					>{#if result.winner}<strong
							>{result.rows.find((row) => row.id === result.winner)?.label}</strong
						> has the lowest computed cost per 100 among profiles passing these constraints.{:else}<strong
							>No eligible profile.</strong
						> Inspect the failed constraints before relaxing a requirement.{/if}</span
				>
			</p>
			<div class="builder-provider-grid">
				{#each result.rows as row (row.id)}<section
						class="builder-provider"
						class:builder-provider-selected={row.id === result.winner}
					>
						<p class="builder-kicker">
							{row.id === result.winner
								? 'Selected under these assumptions'
								: row.eligible
									? 'Eligible alternative'
									: 'Excluded by constraints'}
						</p>
						<h3>{row.label}</h3>
						<strong class="builder-provider-cost">{usd(row.totalPer100)}</strong>
						<p>Total per 100 modeled calls + mistakes</p>
						<dl>
							<div>
								<dt>API per call</dt>
								<dd>{usd(row.callCost, 4)}</dd>
							</div>
							<div>
								<dt>API per 100</dt>
								<dd>{usd(row.apiPer100)}</dd>
							</div>
							<div>
								<dt>Mistake cost per 100</dt>
								<dd>{usd(row.reviewCostPer100)}</dd>
							</div>
							<div>
								<dt>Measured fixture latency</dt>
								<dd>{row.latency} s</dd>
							</div>
							<div>
								<dt>Minor / critical errors</dt>
								<dd>{row.minor} / {row.critical}</dd>
							</div>
						</dl>
						{#if row.reasons.length}<ul>
								{#each row.reasons as reason (reason)}<li>{reason}</li>{/each}
							</ul>{:else}<p class="builder-pass">
								<Check size={15} />All current constraints pass
							</p>{/if}
					</section>{/each}
			</div>
			<section class="builder-panel">
				<p class="builder-kicker">Cost decomposition · same scale</p>
				<h3>API spend is only one component</h3>
				<div class="builder-bars">
					{#each result.rows as row (row.id)}<div class="builder-bar-row">
							<div><strong>{row.label}</strong><span>{usd(row.totalPer100)} / 100</span></div>
							<div class="builder-bar-track builder-stacked">
								<div
									class="builder-api-bar"
									style:width={`${(100 * row.apiPer100) / Math.max(1e-9, ...result.rows.map((r) => r.totalPer100))}%`}
								></div>
								<div
									class="builder-loss-bar"
									style:width={`${(100 * row.reviewCostPer100) / Math.max(1e-9, ...result.rows.map((r) => r.totalPer100))}%`}
								></div>
							</div>
						</div>{/each}
				</div>
				<p>
					Green: API cost · apricot: assigned mistake cost. Total = 100 × per-call token cost +
					minor count × minor cost + critical count × critical cost. Error categories are disjoint
					in this fixture.
				</p>
			</section>
			<details class="builder-panel">
				<summary><Braces size={16} />Inspect the synthetic measurement table</summary>
				<!-- Wide exact tables need keyboard scrolling. -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="builder-table-scroll"
					tabindex="0"
					role="region"
					aria-label="Synthetic provider measurements"
				>
					<table>
						<caption
							>Authored profiles · 100 fictional cases each · prices are scenario inputs, not
							current provider prices</caption
						><thead
							><tr
								><th scope="col">Profile</th><th scope="col">Context / output cap</th><th
									scope="col">USD per million input / output</th
								><th scope="col">Latency</th><th scope="col">Correct / minor / critical</th><th
									scope="col">Capability</th
								></tr
							></thead
						><tbody
							>{#each result.rows as row (row.id)}<tr
									><th scope="row">{row.label}</th><td
										>{row.context.toLocaleString()} / {row.maxOutput.toLocaleString()}</td
									><td>{row.inputPerMillion} / {row.outputPerMillion}</td><td>{row.latency} s</td
									><td>{row.cases - row.minor - row.critical} / {row.minor} / {row.critical}</td><td
										>{row.capabilities.join(', ')}</td
									></tr
								>{/each}</tbody
						>
					</table>
				</div>
			</details>
			<p class="builder-warning">
				Zero observed critical errors is not proof of zero risk. This calculation holds the authored
				error counts and measured latency fixed while you change costs and token budgets; it does
				not predict how quality or latency changes on a longer prompt. Rerun a real task-specific
				evaluation before using such a route.
			</p>
			<p class="builder-takeaway">
				<strong>Builder test:</strong> allow five critical errors and set both mistake costs to zero.
				Then restore their costs. Next set input tokens to 8,000: reserving 500 output tokens excludes
				the compact context even though the input alone fits.
			</p>
		{/if}
	{/if}
</section>
