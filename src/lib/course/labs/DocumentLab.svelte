<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	const cases = [
		{
			id: 'INV-SCAN-17',
			invoice: 'WIL-0018',
			date: '2026-09-18',
			subtotal: 1100,
			tax: 88,
			freight: 20,
			total: 1208,
			candidate: 'WIL-OO18',
			candidateTotal: 1203
		},
		{
			id: 'INV-SCAN-18',
			invoice: 'WIL-0019',
			date: '2026-09-21',
			subtotal: 960,
			tax: 76.8,
			freight: 15,
			total: 1051.8,
			candidate: 'WIL-00I9',
			candidateTotal: 1057.8
		}
	];
	let index = $state(0),
		invoice = $state(cases[0].candidate),
		subtotal = $state(String(cases[0].subtotal)),
		tax = $state(String(cases[0].tax)),
		freight = $state(String(cases[0].freight)),
		total = $state(String(cases[0].candidateTotal)),
		action = $state('review'),
		checked = $state(false),
		zoom = $state(false),
		note = $state('');
	const source = $derived(cases[index]);
	const numbers = $derived([subtotal, tax, freight, total].map(Number));
	const valid = $derived(
		[subtotal, tax, freight, total].every(
			(v) =>
				v.trim() !== '' &&
				/^\d+(\.\d{1,2})?$/.test(v) &&
				Number.isSafeInteger(Math.round(Number(v) * 100))
		) &&
			Number.isSafeInteger(
				numbers.slice(0, 3).reduce((sum, value) => sum + Math.round(value * 100), 0)
			)
	);
	const sum = $derived(
		numbers.slice(0, 3).reduce((sum, value) => sum + Math.round(value * 100), 0) / 100
	);
	const match = $derived(
		valid &&
			invoice === source.invoice &&
			numbers.every((v, i) => v === [source.subtotal, source.tax, source.freight, source.total][i])
	);
	const money = (n: number) =>
		n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	function select(i: number) {
		index = i;
		invoice = cases[i].candidate;
		subtotal = String(cases[i].subtotal);
		tax = String(cases[i].tax);
		freight = String(cases[i].freight);
		total = String(cases[i].candidateTotal);
		checked = false;
		note = '';
		action = 'review';
	}
	function download() {
		const data = {
			source: source.id,
			extracted: { invoice, subtotal, tax, freight, total },
			decision: action,
			evidence: note,
			arithmeticValid: valid && sum === numbers[3],
			comparedToTranscription: checked,
			transcriptionMatches: checked ? match : null
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `${source.id}-review.json`;
		a.click();
		URL.revokeObjectURL(a.href);
	}
</script>

<section class="document-lab">
	<p class="eyebrow">DOCUMENT EVIDENCE · AUTHORED EXTRACTION FIXTURES</p>
	<h2>Read the record. Preserve the uncertainty.</h2>
	<p class="intro">
		The source invoices and candidate OCR errors are authored teaching examples. No OCR or vision
		model is being run. You inspect the document and correct fields; the arithmetic and comparison
		checks execute on your actual entries.
	</p>
	<div class="document-tabs" role="group" aria-label="Document case">
		{#each cases as item, i (item.id)}<button
				class:active={index === i}
				aria-pressed={index === i}
				onclick={() => select(i)}>{i === 0 ? 'Worked case' : 'Changed case'} · {item.id}</button
			>{/each}
	</div>
	<div class="document-workspace">
		<div class="source-document">
			<div class="source-toolbar">
				<span>Original document</span><button onclick={() => (zoom = !zoom)}
					><Icon name="search" size={14} />{zoom ? 'Fit page' : 'Enlarge'}</button
				>
			</div>
			<!-- Keyboard focus enables panning the enlarged source document. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="scan-scroll" role="region" aria-label="Source document viewer" tabindex="0">
				<svg
					viewBox="0 0 420 535"
					class:zoom
					role="img"
					aria-label={`Fictional supplier invoice ${source.id}. A complete accessible transcription is available below.`}
					><defs
						><filter id="paper-shadow"
							><feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.07" /></filter
						></defs
					><rect
						x="12"
						y="10"
						width="396"
						height="514"
						rx="3"
						fill="#fffdf5"
						filter="url(#paper-shadow)"
					/><text x="38" y="53" font-size="22" font-weight="700" fill="#305744">CEDAR SUPPLY</text
					><text x="38" y="73" font-size="9" fill="#718071"
						>Industrial supplies · Fictional teaching document</text
					><line x1="38" y1="95" x2="380" y2="95" stroke="#d3dcce" /><text
						x="38"
						y="123"
						font-size="12"
						fill="#294436">BILL TO: WILLOW & CO.</text
					><text x="38" y="144" font-size="10" fill="#62715b">Currency: USD</text><text
						x="256"
						y="123"
						font-size="10"
						fill="#62715b">Invoice: {source.invoice}</text
					><text x="256" y="144" font-size="10" fill="#62715b">Date: {source.date}</text><rect
						x="38"
						y="178"
						width="342"
						height="28"
						fill="#edf1e6"
					/><text x="49" y="196" font-size="9" fill="#48613d">DESCRIPTION</text><text
						x="366"
						y="196"
						text-anchor="end"
						font-size="9"
						fill="#48613d">AMOUNT</text
					><text x="49" y="234" font-size="11" fill="#364e31">Warehouse consumables</text><text
						x="366"
						y="234"
						text-anchor="end"
						font-size="11"
						fill="#364e31">{money(source.subtotal)}</text
					><line
						x1="38"
						y1="253"
						x2="380"
						y2="253"
						stroke="#e0e5d7"
					/>{#each [['Subtotal', source.subtotal], ['Tax', source.tax], ['Freight', source.freight]] as pair, i (i)}<text
							x="213"
							y={290 + i * 30}
							font-size="11"
							fill="#596b50">{pair[0]}</text
						><text x="366" y={290 + i * 30} text-anchor="end" font-size="12" fill="#364e31"
							>{money(Number(pair[1]))}</text
						>{/each}<rect x="202" y="372" width="178" height="42" fill="#e9eedf" /><text
						x="215"
						y="398"
						font-size="12"
						font-weight="700"
						fill="#294436">TOTAL</text
					><text x="366" y="398" text-anchor="end" font-size="16" font-weight="700" fill="#294436"
						>{money(source.total)}</text
					><text x="38" y="460" font-size="10" fill="#718071">Document reference: {source.id}</text
					><text x="38" y="482" font-size="9" fill="#718071"
						>Source transcription is not payment authorization.</text
					></svg
				>
			</div>
			<details>
				<summary>Accessible source transcription</summary>
				<p>
					Supplier Cedar Supply; billed to Willow & Co.; invoice {source.invoice}; date {source.date};
					currency USD. Subtotal {money(source.subtotal)}; tax {money(source.tax)}; freight {money(
						source.freight
					)}; total {money(source.total)}.
				</p>
			</details>
		</div>
		<div class="extraction">
			<p class="eyebrow">CANDIDATE FIELDS · EDIT TO CORRECT</p>
			<label>Invoice ID<input bind:value={invoice} /></label>
			<div class="amount-fields">
				<label>Subtotal (USD)<input inputmode="decimal" bind:value={subtotal} /></label><label
					>Tax (USD)<input inputmode="decimal" bind:value={tax} /></label
				><label>Freight (USD)<input inputmode="decimal" bind:value={freight} /></label><label
					>Total (USD)<input inputmode="decimal" bind:value={total} /></label
				>
			</div>
			<div class="arithmetic" aria-live="polite">
				{#if valid}<strong
						>{sum === numbers[3] ? '✓ Components reconcile' : 'Components do not reconcile'}</strong
					>
					<p>
						Subtotal + tax + freight = ${money(sum)}. Entered total = ${money(numbers[3])}.
						Difference = ${money(numbers[3] - sum)}.
					</p>{:else}<p>
						Enter nonnegative decimal amounts with up to two decimal places, without commas, within
						safe integer-cent precision.
					</p>{/if}
			</div>
			<label
				>Next workflow step<select bind:value={action}
					><option value="review">Hold / request clarification</option><option value="validate"
						>Proceed to record matching and policy review</option
					><option value="pay">Authorize payment solely from this extraction</option></select
				></label
			><label
				>Evidence and unresolved questions<textarea
					bind:value={note}
					rows={5}
					placeholder="Name the source, original candidate, correction, and why the next step is justified."
				></textarea></label
			><button class="button primary" onclick={() => (checked = true)}
				>Compare to verified case transcription</button
			>{#if checked}<div class="comparison" role="status">
					<strong
						>{match
							? 'The entered fields match this teaching source.'
							: 'At least one field differs from the verified source.'}</strong
					>
					<p>
						{action === 'pay'
							? 'Accurate extraction does not authorize payment. Record legitimacy, matching, duplicate checks, policy, and approval remain separate.'
							: match && action === 'validate'
								? 'Proceeding to matching and policy review is appropriate; no payment has been authorized.'
								: 'Preserving ambiguity and requesting evidence is appropriate whenever a critical field remains unresolved.'}
					</p>
					<p>
						Arithmetic cannot catch every plausible identifier error. Never replace all letters O
						with zero across every supplier format.
					</p>
				</div>{/if}<button class="button secondary" onclick={download}
				><Icon name="download" size={16} />Export extraction review</button
			>
		</div>
	</div>
</section>

<style>
	.document-lab {
		border: 1px solid #dce1d2;
		border-radius: 20px;
		background: #fff;
		padding: 30px;
	}
	.document-lab h2 {
		font-size: 28px;
		margin: 12px 0 18px;
		line-height: 1.4;
	}
	.intro {
		font-size: 14px;
		line-height: 1.85;
		color: var(--muted);
	}
	.document-tabs {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin: 25px 0;
	}
	.document-tabs button {
		border: 1px solid #d9dfd0;
		border-radius: 8px;
		padding: 12px 15px;
		background: #f4f6ef;
		font-size: 12px;
	}
	.document-tabs button.active {
		background: var(--green);
		color: white;
		border-color: var(--green);
	}
	.document-workspace {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 28px;
		align-items: start;
	}
	.source-document {
		border: 1px solid #e0e3d8;
		background: #f2f0e8;
		border-radius: 12px;
		overflow: hidden;
	}
	.source-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 13px 17px;
		background: #e9ecdf;
		font-size: 11px;
		font-weight: 650;
	}
	.source-toolbar button {
		display: flex;
		gap: 6px;
		align-items: center;
		background: white;
		border: 1px solid #d2dac7;
		border-radius: 6px;
		padding: 7px;
		font-size: 10px;
	}
	.scan-scroll {
		overflow: auto;
		max-height: 680px;
		padding: 12px;
	}
	.scan-scroll svg {
		width: 100%;
		min-width: 300px;
		display: block;
		font-family: 'DM Sans Variable', sans-serif;
	}
	.scan-scroll svg.zoom {
		width: 720px;
		max-width: none;
	}
	.source-document details {
		padding: 17px;
		background: white;
	}
	.source-document summary {
		font-size: 11px;
		cursor: pointer;
		font-weight: 700;
	}
	.source-document details p {
		font-size: 12px;
		line-height: 1.8;
		margin-top: 12px;
	}
	.extraction {
		display: grid;
		gap: 17px;
	}
	.extraction label {
		display: grid;
		gap: 8px;
		font-size: 11px;
		font-weight: 700;
	}
	.extraction input,
	.extraction select,
	.extraction textarea {
		min-width: 0;
		width: 100%;
		padding: 12px;
		border: 1px solid #d8dfd0;
		border-radius: 8px;
		background: #fff;
		font-size: 13px;
	}
	.extraction textarea {
		resize: vertical;
		line-height: 1.7;
	}
	.amount-fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.arithmetic {
		padding: 19px;
		background: #f7f1df;
		border-radius: 10px;
		font-size: 12px;
	}
	.arithmetic p,
	.comparison p {
		line-height: 1.8;
		margin-top: 10px;
	}
	.comparison {
		padding: 20px;
		background: #eeedf7;
		border-radius: 11px;
		font-size: 12px;
	}
	.extraction .button {
		justify-content: center;
		font-size: 12px;
	}
	.extraction .button.secondary {
		background: white;
	}
	@media (max-width: 1000px) {
		.document-workspace {
			grid-template-columns: 1fr;
		}
		.scan-scroll svg {
			max-width: 450px;
			margin: auto;
		}
	}
	@media (max-width: 600px) {
		.document-lab {
			padding: 22px;
		}
		.document-workspace {
			gap: 22px;
		}
		.amount-fields {
			gap: 10px;
		}
	}
</style>
