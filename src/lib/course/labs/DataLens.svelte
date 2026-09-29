<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	let aggregate = $state(false);
	let customer = $state('All customers');
	const invoices = [
		{ id: 'I-201', customer: 'Cedar', amount: 120 },
		{ id: 'I-202', customer: 'Cedar', amount: 200 },
		{ id: 'I-203', customer: 'Juniper', amount: 80 }
	];
	const payments = [
		{ id: 'P-01', invoice: 'I-201', amount: 50 },
		{ id: 'P-02', invoice: 'I-201', amount: 70 },
		{ id: 'P-03', invoice: 'I-202', amount: 60 }
	];
	const rows = $derived(
		invoices
			.filter((i) => customer === 'All customers' || i.customer === customer)
			.flatMap((i) => {
				const paid = payments.filter((p) => p.invoice === i.id);
				return aggregate
					? [
							{
								...i,
								paymentId: paid.map((p) => p.id).join(', ') || 'none',
								paid: paid.reduce((s, p) => s + p.amount, 0)
							}
						]
					: paid.length
						? paid.map((p) => ({ ...i, paymentId: p.id, paid: p.amount }))
						: [{ ...i, paymentId: 'none', paid: 0 }];
			})
	);
	const total = $derived(rows.reduce((s, r) => s + r.amount, 0));
	const collected = $derived(rows.reduce((s, r) => s + r.paid, 0));
	const actualInvoices = $derived(
		invoices.filter((i) => customer === 'All customers' || i.customer === customer)
	);
	const correctTotal = $derived(actualInvoices.reduce((s, r) => s + r.amount, 0));
	const correctPaid = $derived(
		actualInvoices.reduce(
			(s, r) => s + payments.filter((p) => p.invoice === r.id).reduce((n, p) => n + p.amount, 0),
			0
		)
	);
	const averageRate = $derived(
		actualInvoices.reduce(
			(s, r) =>
				s + payments.filter((p) => p.invoice === r.id).reduce((n, p) => n + p.amount, 0) / r.amount,
			0
		) / actualInvoices.length
	);
	const sql = $derived(
		aggregate
			? `WITH paid AS (\n  SELECT invoice_id, SUM(amount) AS paid\n  FROM payments\n  GROUP BY invoice_id\n)\nSELECT i.id, i.customer, i.amount,\n       COALESCE(p.paid, 0) AS paid,\n       i.amount - COALESCE(p.paid, 0) AS outstanding\nFROM invoices i\nLEFT JOIN paid p ON p.invoice_id = i.id;`
			: `SELECT i.id, i.customer, i.amount,\n       p.id AS payment_id, COALESCE(p.amount,0) AS paid\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id;`
	);
</script>

<section class="data-lens">
	<p class="eyebrow">EXCEL · POWER QUERY · SQL · POWER BI</p>
	<h2>One business question. Three views of the data.</h2>
	<p class="intro">
		All amounts are USD, as of September 30, 2026. These are the eligible M09 payments; the October
		2 allocation P-04 is excluded before this join. The invoice table has one row per invoice. The
		payment table has one row per allocation. Predict what happens to invoice totals when you join
		them directly.
	</p>
	<div class="source-grid">
		<div>
			<h3>Invoices · expected total 400</h3>
			<table>
				<thead><tr><th>ID</th><th>Customer</th><th>Amount</th></tr></thead><tbody
					>{#each invoices as row (row.id)}<tr
							><td>{row.id}</td><td>{row.customer}</td><td>{row.amount}</td></tr
						>{/each}</tbody
				>
			</table>
		</div>
		<div>
			<h3>Payments · expected total 180</h3>
			<table>
				<thead><tr><th>ID</th><th>Invoice</th><th>Paid</th></tr></thead><tbody
					>{#each payments as row (row.id)}<tr
							><td>{row.id}</td><td>{row.invoice}</td><td>{row.amount}</td></tr
						>{/each}</tbody
				>
			</table>
		</div>
	</div>
	<div class="controls">
		<label
			><input type="checkbox" bind:checked={aggregate} />Aggregate payments by invoice before
			joining</label
		><label
			>Customer filter<select bind:value={customer}
				><option>All customers</option><option>Cedar</option><option>Juniper</option></select
			></label
		>
	</div>
	<!-- Keyboard focus is required to scroll the evidence table on narrow displays. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="table-scroll" role="region" aria-label="Joined records" tabindex="0">
		<table>
			<caption>Actual result of the selected browser transformation</caption><thead
				><tr
					><th>Invoice</th><th>Customer</th><th>Invoice amount</th><th>Payment references</th><th
						>Paid</th
					><th>Amount − paid</th></tr
				></thead
			><tbody
				>{#each rows as row, i (i)}<tr
						><td>{row.id}</td><td>{row.customer}</td><td>{row.amount}</td><td>{row.paymentId}</td
						><td>{row.paid}</td><td>{row.amount - row.paid}</td></tr
					>{/each}</tbody
			><tfoot
				><tr
					><th colspan="2">Displayed sums</th><td>{total}</td><td>{rows.length} rows</td><td
						>{collected}</td
					><td>{total - collected}</td></tr
				></tfoot
			>
		</table>
	</div>
	<p class="diagnosis" class:correct={aggregate}>
		<Icon name={aggregate ? 'check' : 'bulb'} size={20} />{aggregate
			? `One row per invoice is restored. Outstanding is ${correctTotal - correctPaid} for the selected customer scope.`
			: total === correctTotal
				? `This customer filter does not expose the multiplication. Select Cedar or All customers to see the duplicate invoice amount.`
				: `The raw join repeats invoice I-201 once for each payment. Under the current filter, invoice sum ${total} should be ${correctTotal}. A left join preserves unpaid invoices but does not prevent multiplication.`}
	</p>
	<details>
		<summary>Equivalent SQL and Power Query steps</summary>
		<!-- Keyboard focus lets readers scroll the code example. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<pre tabindex="0"><code>{sql}</code></pre>
		<p>
			Power Query: group payments by invoice ID and sum amount, then left-merge that result into
			invoices, expand the single paid column, replace missing paid amounts with 0, and add
			outstanding. The interactive result above executes an equivalent JavaScript transformation
			over the visible data; this panel is SQL/M learning guidance, not a live SQL or Power Query
			runtime.
		</p>
	</details>
	<div class="semantic">
		<p class="eyebrow">THE SEMANTIC MODEL · FILTER CONTEXT</p>
		<h3>Which “collection rate” did the dashboard mean?</h3>
		<div class="rate-cards">
			<div>
				<strong>{((correctPaid / correctTotal) * 100).toFixed(2)}%</strong><span
					>Ratio of sums: accepted payments ÷ invoice amounts</span
				>
			</div>
			<div>
				<strong>{(averageRate * 100).toFixed(2)}%</strong><span
					>Unweighted average of the individual invoice collection percentages</span
				>
			</div>
		</div>
		<p>
			Change the customer filter. Both calculations react to the selected invoice population, but
			they answer different questions. The first weights by dollars; the second gives each invoice
			equal weight. A measure must match the business definition. Avoid averaging percentages
			without deciding which weighting is intended.
		</p>
		<!-- Keyboard focus lets readers scroll the code example. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<pre tabindex="0"><code
				>Collection Rate = DIVIDE(SUM(Invoices[Paid]), SUM(Invoices[Amount]))</code
			></pre>
		<p>
			This is a DAX-style measure for a model with paid amounts already aggregated at invoice grain.
			In a separate payment fact table, relationship direction and allocation logic need their own
			design. Do not paste the measure into an unrelated model and assume its meaning is preserved.
		</p>
	</div>
</section>

<style>
	.data-lens {
		padding: 30px;
		border: 1px solid #dce3d3;
		border-radius: 18px;
		background: white;
		margin-top: 28px;
	}
	.data-lens h2 {
		font-size: 27px;
		line-height: 1.4;
		margin: 12px 0 18px;
	}
	.intro,
	.data-lens p:not(.eyebrow) {
		font-size: 13px;
		line-height: 1.85;
		color: var(--muted);
	}
	.source-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin: 25px 0;
	}
	.source-grid > div {
		padding: 20px;
		background: #f1f4eb;
		border-radius: 12px;
	}
	.source-grid h3 {
		font-size: 14px;
		margin-bottom: 15px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 12px;
	}
	th,
	td {
		padding: 12px 9px;
		text-align: left;
		border-bottom: 1px solid #dfe5d8;
		font-variant-numeric: tabular-nums;
	}
	th {
		font-size: 11px;
	}
	.table-scroll {
		overflow: auto;
	}
	.table-scroll table {
		min-width: 650px;
	}
	caption {
		text-align: left;
		font-size: 12px;
		font-weight: 700;
		padding: 15px 0;
	}
	tfoot {
		background: #eff2e8;
		font-weight: 700;
	}
	.controls {
		display: flex;
		gap: 20px;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		padding: 20px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: #f8f9f5;
	}
	.controls label {
		display: flex;
		gap: 10px;
		align-items: center;
		font-size: 12px;
		font-weight: 600;
	}
	.controls select {
		padding: 9px;
		border: 1px solid #d6dfcc;
		border-radius: 7px;
		background: white;
	}
	.diagnosis {
		display: flex;
		gap: 12px;
		align-items: start;
		background: #fff1dd;
		padding: 20px;
		border-radius: 12px;
		margin: 20px 0;
	}
	.diagnosis.correct {
		background: #edf4e6;
	}
	details {
		padding: 20px;
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	summary {
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	pre {
		padding: 20px;
		border-radius: 10px;
		background: #263e35;
		color: #eaf1e1;
		overflow: auto;
		font-size: 12px;
		line-height: 1.8;
		margin: 18px 0;
	}
	.semantic {
		margin-top: 30px;
		padding: 27px;
		background: #efedf7;
		border-radius: 14px;
	}
	.semantic h3 {
		font-size: 21px;
		margin: 12px 0;
	}
	.rate-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin: 20px 0;
	}
	.rate-cards > div {
		padding: 20px;
		background: #ffffffb8;
		border-radius: 12px;
	}
	.rate-cards strong {
		font-size: 28px;
		display: block;
	}
	.rate-cards span {
		font-size: 11px;
		line-height: 1.7;
		display: block;
		margin-top: 10px;
	}
	@media (max-width: 650px) {
		.data-lens {
			padding: 22px;
		}
		.source-grid,
		.rate-cards {
			grid-template-columns: 1fr;
		}
		.semantic {
			padding: 20px;
		}
		.source-grid {
			gap: 12px;
		}
	}
</style>
