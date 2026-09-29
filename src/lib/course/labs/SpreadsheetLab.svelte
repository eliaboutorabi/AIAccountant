<script lang="ts">
	import { onMount } from 'svelte';
	import {
		calculateSheet,
		workbooks,
		verifyWorkbook,
		address,
		locate,
		formulaFunctions,
		type Cells
	} from '$lib/engines/spreadsheet';
	import Icon from '$lib/components/Icon.svelte';
	import DataLens from './DataLens.svelte';
	let preset = $state(0);
	let cells = $state<Cells>(workbooks[0].cells.map((r) => [...r]));
	let selected = $state<[number, number]>([0, 0]);
	let editing = $state('');
	let checked = $state(false);
	let showFormulas = $state(false);
	let storage = $state(true);
	let notice = $state('');
	const book = $derived(workbooks[preset]);
	const values = $derived(calculateSheet(cells));
	const results = $derived(checked ? verifyWorkbook(book, cells) : []);
	const taskCells = $derived(new Set(book.tasks.map((t) => t.cell)));
	const current = $derived(address(...selected));
	function save() {
		try {
			localStorage.setItem(`ai-accountant-sheet-${book.id}`, JSON.stringify(cells));
		} catch {
			storage = false;
		}
	}
	function restore() {
		try {
			const raw = localStorage.getItem(`ai-accountant-sheet-${book.id}`);
			if (raw) {
				const data: unknown = JSON.parse(raw);
				if (
					Array.isArray(data) &&
					data.length === book.cells.length &&
					data.every(
						(row) =>
							Array.isArray(row) &&
							row.length === 6 &&
							row.every((c) => typeof c === 'string' && c.length <= 500)
					)
				)
					cells = data as Cells;
			}
		} catch {
			storage = false;
		}
	}
	function choose(index: number) {
		preset = index;
		cells = workbooks[index].cells.map((r) => [...r]);
		selected = [0, 0];
		editing = '';
		checked = false;
		notice = '';
		restore();
	}
	function setCell(row: number, col: number, value: string) {
		cells[row][col] = value.slice(0, 500);
		save();
	}
	function select(row: number, col: number) {
		selected = [row, col];
		editing = cells[row][col];
	}
	function commit() {
		setCell(selected[0], selected[1], editing);
		notice = `${current} updated.`;
	}
	function display(r: number, c: number) {
		const raw = cells[r][c];
		if (raw === '') return '';
		if (showFormulas) return raw;
		const v = values[r][c];
		return typeof v === 'number'
			? Number(v.toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 6 })
			: String(v);
	}
	function reset() {
		cells = book.cells.map((r) => [...r]);
		checked = false;
		editing = cells[selected[0]][selected[1]];
		save();
		notice = 'Workbook reset to the source data.';
	}
	function paste(event: ClipboardEvent, row: number, col: number) {
		const text = event.clipboardData?.getData('text/plain');
		if (!text || !/[\t\n]/.test(text)) return;
		event.preventDefault();
		const rows = text.replace(/\r/g, '').trimEnd().split('\n');
		for (let r = 0; r < rows.length && row + r < cells.length; r++) {
			const entries = rows[r].split('\t');
			for (let c = 0; c < entries.length && col + c < 6; c++)
				cells[row + r][col + c] = entries[c].slice(0, 500);
		}
		save();
		notice = 'Pasted cells and recalculated the sheet.';
	}
	function download(formulas: boolean) {
		const rows = formulas ? cells : values;
		const content = rows
			.map((row) =>
				row.map((c) => String(c).replaceAll('\t', ' ').replaceAll('\n', ' ')).join('\t')
			)
			.join('\n');
		const blob = new Blob([content], { type: 'text/tab-separated-values' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `willow-${book.id}-${formulas ? 'formulas' : 'values'}.tsv`;
		link.click();
		URL.revokeObjectURL(link.href);
	}
	onMount(restore);
</script>

<div class="sheet-lab">
	<div class="workbook-tabs" role="group" aria-label="Choose workbook">
		{#each workbooks as item, i (item.id)}<button
				class:active={preset === i}
				aria-pressed={preset === i}
				onclick={() => choose(i)}><Icon name="calculator" size={16} />{item.title}</button
			>{/each}
	</div>
	<div class="sheet-intro">
		<p class="eyebrow">WILLOW ANALYSIS WORKBOOK</p>
		<h2>{book.title}</h2>
		<p>{book.description}</p>
		<small>{book.units}</small>
	</div>
	<div class="sheet-toolbar">
		<label><input type="checkbox" bind:checked={showFormulas} />Show formulas</label><button
			onclick={() => download(false)}><Icon name="download" size={14} />Export values</button
		><button onclick={() => download(true)}>Export formulas</button><button onclick={reset}
			><Icon name="reset" size={14} />Reset workbook</button
		>
	</div>
	<form
		class="formula-bar"
		onsubmit={(event) => {
			event.preventDefault();
			commit();
		}}
	>
		<span class="cell-address">{current}</span><label for="formula-input">ƒx</label><input
			id="formula-input"
			aria-label={`Formula or value for ${current}`}
			bind:value={editing}
			placeholder="Select a cell, then enter a value or formula starting with ="
		/><button type="submit">Apply</button>
	</form>
	<div class="sheet-scroll">
		<table class="sheet">
			<caption class="sr-only"
				>Editable spreadsheet. Select a cell to edit its formula above, or type directly. Paste
				tab-separated data into a cell.</caption
			><thead
				><tr
					><th aria-label="Row number"></th>{#each ['A', 'B', 'C', 'D', 'E', 'F'] as col (col)}<th
							scope="col">{col}</th
						>{/each}</tr
				></thead
			><tbody
				>{#each cells as row, r (r)}<tr
						><th scope="row">{r + 1}</th>{#each row as cell, c (c)}<td
								class:task-cell={taskCells.has(address(r, c))}
								class:selected={selected[0] === r && selected[1] === c}
								class:error-cell={String(values[r][c]).startsWith('#')}
								><input
									aria-label={`${address(r, c)}${taskCells.has(address(r, c)) ? ' exercise cell' : ''}`}
									value={selected[0] === r && selected[1] === c ? cell : display(r, c)}
									onfocus={() => select(r, c)}
									onchange={(event) => {
										setCell(r, c, event.currentTarget.value);
										editing = event.currentTarget.value;
									}}
									onpaste={(event) => paste(event, r, c)}
									spellcheck="false"
									autocomplete="off"
								/></td
							>{/each}</tr
					>{/each}</tbody
			>
		</table>
	</div>
	<p class="sheet-status" aria-live="polite">
		{notice || 'Mint cells are your formula exercises. Select any cell to inspect or edit it.'}
		{storage
			? 'Changes save on this device.'
			: 'Storage unavailable; export your work before leaving.'}
	</p>
	<div class="exercise-heading">
		<div>
			<p class="eyebrow">FORMULAS, NOT MEMORIZED ANSWERS</p>
			<h3>Complete the worksheet</h3>
		</div>
		<button class="button primary" onclick={() => (checked = true)}
			><Icon name="check" size={17} />Check formulas</button
		>
	</div>
	<p class="scope">
		The checker verifies the original case and a changed source amount. Use cell references so your
		analysis updates. Checks use the original source pack; reset after experimenting with input
		values to assess the assigned case.
	</p>
	<div class="sheet-tasks">
		{#each book.tasks as task, i (task.cell)}<div
				class="sheet-task"
				class:passed={results[i]?.correct}
			>
				<button
					class="task-ref"
					onclick={() => {
						const [r, c] = locate(task.cell);
						select(r, c);
						document.getElementById('formula-input')?.focus();
					}}>{task.cell}</button
				>
				<div>
					<h4>{task.instruction}</h4>
					{#if checked}<p class="result">
							{results[i]?.correct
								? '✓ Formula responds correctly in both cases.'
								: 'Check this formula and its dependencies.'} Current result: {String(
								results[i]?.value
							)}
						</p>{/if}
					<details>
						<summary>Hint & worked formula</summary>
						<p>{task.explanation}</p>
						<code>{task.formula}</code>
						<p>
							Type the formula yourself, then explain each reference. An equivalent formula is
							accepted when it passes both cases.
						</p>
					</details>
				</div>
			</div>{/each}
	</div>
	<details class="formula-help">
		<summary>Supported formula reference & scope</summary>
		<p>
			This teaching sheet uses the MIT-licensed fast-formula-parser engine. It is not Microsoft
			Excel and does not run macros, external workbook links, network calls, or every Excel
			function. Cells use A1 references, ranges use A1:B3, text uses double quotes, and formulas
			begin with =.
		</p>
		<p>Enabled functions: {formulaFunctions.join(', ')}.</p>
		<p>
			Amounts use JavaScript decimal arithmetic; apply ROUND where the task requires monetary
			rounding. Critical transaction tools on Day 4 use integer minor units. Full-column ranges and
			sheets above 100 rows or 26 columns are outside this bounded teaching interface.
		</p>
	</details>
</div>
<DataLens />

<style>
	.sheet-lab {
		border: 1px solid #dbe4d6;
		border-radius: 20px;
		overflow: hidden;
		background: #fff;
	}
	.workbook-tabs {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
		padding: 14px;
		background: #edf2e9;
		border-bottom: 1px solid #dbe4d6;
	}
	.workbook-tabs button {
		display: flex;
		align-items: center;
		gap: 8px;
		border: 0;
		padding: 11px 15px;
		border-radius: 9px;
		background: transparent;
		font-size: 13px;
		font-weight: 650;
	}
	.workbook-tabs button.active {
		background: var(--green);
		color: #fff;
	}
	.sheet-intro {
		padding: 28px;
	}
	.sheet-intro h2 {
		font-size: 26px;
		margin: 10px 0 14px;
	}
	.sheet-intro p:not(.eyebrow) {
		line-height: 1.75;
		color: var(--muted);
		font-size: 15px;
	}
	.sheet-intro small {
		display: block;
		margin-top: 12px;
		font-size: 12px;
		color: var(--muted);
	}
	.sheet-toolbar {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
		padding: 12px 20px;
		background: #f7f8f4;
		border-block: 1px solid var(--line);
		font-size: 11px;
	}
	.sheet-toolbar label {
		display: flex;
		gap: 7px;
		align-items: center;
		margin-right: auto;
	}
	.sheet-toolbar button {
		display: flex;
		gap: 5px;
		align-items: center;
		border: 0;
		background: transparent;
		font-size: 11px;
		padding: 5px;
	}
	.formula-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 15px;
		background: white;
		border-bottom: 1px solid var(--line);
	}
	.cell-address {
		width: 46px;
		padding: 8px;
		text-align: center;
		font-weight: 700;
		font-size: 12px;
		background: #edf2e8;
		border-radius: 6px;
	}
	.formula-bar label {
		font-style: italic;
		color: #586d4d;
	}
	.formula-bar input {
		min-width: 0;
		flex: 1;
		border: 1px solid #e0e5db;
		border-radius: 6px;
		padding: 9px;
		font-family: monospace;
		font-size: 12px;
	}
	.formula-bar button {
		font-size: 12px;
		border: 0;
		padding: 9px 13px;
		background: var(--green);
		color: white;
		border-radius: 6px;
	}
	.sheet-scroll {
		overflow: auto;
	}
	.sheet {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		min-width: 780px;
		font-size: 12px;
	}
	.sheet th {
		background: #f0f3ec;
		font-weight: 500;
		border: 1px solid #dee4d8;
		height: 30px;
		text-align: center;
		color: #65735b;
	}
	.sheet th:first-child {
		width: 35px;
	}
	.sheet td {
		border: 1px solid #e3e8df;
		padding: 0;
		height: 37px;
		position: relative;
		background: white;
	}
	.sheet td.task-cell {
		background: #f0f8e9;
	}
	.sheet td.selected {
		outline: 2px solid #468657;
		outline-offset: -2px;
		z-index: 1;
		background: #edf6e5;
	}
	.sheet td.error-cell {
		background: #fff0e8;
	}
	.sheet input {
		width: 100%;
		height: 36px;
		border: 0;
		background: transparent;
		padding: 8px;
		outline-offset: -3px;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
	.sheet-status {
		padding: 12px 20px;
		background: #f1f4ec;
		color: #60705a;
		font-size: 11px;
		line-height: 1.6;
		border-top: 1px solid var(--line);
	}
	.exercise-heading {
		padding: 32px 28px 14px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		flex-wrap: wrap;
	}
	.exercise-heading h3 {
		font-size: 21px;
		margin-top: 9px;
	}
	.scope {
		font-size: 13px;
		line-height: 1.7;
		color: var(--muted);
		padding: 0 28px 20px;
	}
	.sheet-tasks {
		padding: 0 28px;
		display: grid;
		gap: 12px;
	}
	.sheet-task {
		display: flex;
		align-items: start;
		gap: 16px;
		padding: 20px;
		background: #f7f8f4;
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	.sheet-task.passed {
		border-color: #aec8a5;
		background: #f0f7e9;
	}
	.task-ref {
		flex-shrink: 0;
		border: 1px solid #d1dcc9;
		background: #fff;
		border-radius: 7px;
		font-family: monospace;
		padding: 8px;
		font-weight: 700;
	}
	.sheet-task h4 {
		font-size: 14px;
		line-height: 1.6;
	}
	.sheet-task details {
		margin-top: 13px;
		font-size: 12px;
	}
	.sheet-task summary {
		cursor: pointer;
		font-weight: 600;
	}
	.sheet-task details p {
		line-height: 1.7;
		margin: 13px 0;
	}
	.sheet-task code {
		background: #e5ecdf;
		padding: 7px 10px;
		border-radius: 6px;
		display: inline-block;
		font-size: 12px;
	}
	.result {
		font-size: 12px;
		margin-top: 12px;
		line-height: 1.6;
	}
	.formula-help {
		margin: 25px 28px 30px;
		border-top: 1px solid var(--line);
		padding-top: 20px;
	}
	.formula-help summary {
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	.formula-help p {
		font-size: 12px;
		line-height: 1.8;
		margin-top: 15px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
	}
	@media (max-width: 600px) {
		.sheet-intro,
		.exercise-heading {
			padding: 22px;
		}
		.sheet-tasks {
			padding: 0 16px;
		}
		.scope {
			padding: 0 22px 20px;
		}
		.sheet-task {
			padding: 15px;
			gap: 12px;
		}
		.formula-help {
			margin: 20px;
		}
		.formula-bar {
			gap: 6px;
			padding: 10px 8px;
		}
	}
</style>
