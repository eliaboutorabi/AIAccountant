<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { Block } from '../types';
	import RichText from './RichText.svelte';
	import Notebook from './Notebook.svelte';
	import Icon from '$lib/components/Icon.svelte';
	let { block, moduleId, index }: { block: Block; moduleId: string; index: string } = $props();
</script>

{#if block.kind === 'prose'}
	<div class="prose-block">
		{#each block.paragraphs as text, i (i)}<p><RichText {text} /></p>{/each}
	</div>
{:else if block.kind === 'callout'}
	<aside class="concept-callout {block.tone}">
		<p class="block-label">
			<Icon
				name={block.tone === 'accounting'
					? 'calculator'
					: block.tone === 'warning'
						? 'bulb'
						: 'sparkles'}
				size={17}
			/>{block.tone === 'accounting'
				? 'Accounting refresher'
				: block.tone === 'warning'
					? 'A distinction that matters'
					: 'Inside the mechanism'}
		</p>
		<h3>{block.title}</h3>
		{#each block.paragraphs as text, i (i)}<p><RichText {text} /></p>{/each}
	</aside>
{:else if block.kind === 'table'}
	<!-- Focus is necessary to scroll wide evidence with a keyboard. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="data-table" role="region" aria-label={block.caption} tabindex="0">
		<table>
			<caption>{block.caption}</caption><thead
				><tr
					>{#each block.headers as header, i (i)}<th scope="col">{header}</th>{/each}</tr
				></thead
			><tbody
				>{#each block.rows as row, i (i)}<tr
						>{#each row as cell, j (j)}{#if j === 0}<th scope="row">{cell}</th>{:else}<td>{cell}</td
								>{/if}{/each}</tr
					>{/each}</tbody
			>
		</table>
	</div>
{:else if block.kind === 'steps'}
	<div class="mechanism">
		<h3>{block.title}</h3>
		<ol>
			{#each block.steps as step, i (i)}<li>
					<span class="step-no">{i + 1}</span>
					<div>
						<h4>{step.title}</h4>
						<p><RichText text={step.text} /></p>
					</div>
				</li>{/each}
		</ol>
	</div>
{:else if block.kind === 'worked'}
	<div class="worked">
		<p class="block-label"><Icon name="calculator" size={17} />Worked example</p>
		<h3>{block.title}</h3>
		<p><RichText text={block.problem} /></p>
		<ol>
			{#each block.steps as text, i (i)}<li><RichText {text} /></li>{/each}
		</ol>
		<div class="conclusion">
			<strong>What the result tells us</strong>
			<p><RichText text={block.conclusion} /></p>
		</div>
	</div>
{:else if block.kind === 'compare'}
	<div class="comparison">
		<h3>{block.title}</h3>
		<div>
			{#each block.items as item, i (i)}<section>
					<h4>{item.label}</h4>
					<p><RichText text={item.text} /></p>
				</section>{/each}
		</div>
	</div>
{:else if block.kind === 'lab'}
	<div class="lab-brief">
		<p class="block-label"><Icon name="flask" size={18} />Experiment · predict, run, explain</p>
		<h3>{block.title}</h3>
		<p><RichText text={block.task} /></p>
		<Notebook
			{moduleId}
			field={`${index}-prediction`}
			label="Before you run it"
			hint={block.prediction}
			rows={3}
		/><a class="button primary" href={resolve('/lab/[slug]', { slug: block.id })}
			>Open the experiment <Icon name="arrow" size={16} /></a
		>
		<h4>Evidence to bring back</h4>
		<ul>
			{#each block.evidence as text, i (i)}<li><RichText {text} /></li>{/each}
		</ul>
		<Notebook
			{moduleId}
			field={`${index}-evidence`}
			label="Your observations and explanation"
			hint="Record settings, measured results, what changed, and what you would investigate next."
		/>
		<p class="limitation"><strong>Scope of this experiment.</strong> {block.limitation}</p>
	</div>
{:else if block.kind === 'figure'}
	<figure>
		<img src={asset(`/${block.image}`)} alt={block.alt} loading="lazy" />
		<figcaption>{block.caption}</figcaption>
	</figure>
{:else if block.kind === 'code'}
	<div class="code-block">
		<p class="block-label">{block.language} · {block.title}</p>
		<!-- Keyboard readers can scroll long code lines. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<pre tabindex="0" role="region" aria-label={block.title}><code>{block.code}</code></pre>
		<p><RichText text={block.explanation} /></p>
	</div>
{:else if block.kind === 'reflection'}
	<div class="reflection">
		<Notebook {moduleId} field={index} label={block.prompt} hint={block.guidance} />
		<details>
			<summary>Compare with a worked response</summary>
			<p><RichText text={block.modelAnswer} /></p>
		</details>
	</div>
{/if}

<style>
	.prose-block p {
		margin: 20px 0;
		font-size: 17px;
		line-height: 1.9;
	}
	.block-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px !important;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.11em;
		color: var(--green);
		margin-bottom: 14px !important;
	}
	h3 {
		font-size: 21px;
		line-height: 1.4;
		margin-bottom: 16px;
	}
	h4 {
		font-size: 16px;
		line-height: 1.5;
		margin-bottom: 8px;
	}
	p,
	li {
		line-height: 1.85;
		font-size: 16px;
	}
	p + p {
		margin-top: 15px;
	}
	.concept-callout,
	.worked,
	.lab-brief,
	.mechanism,
	.comparison,
	.reflection,
	.code-block {
		margin: 32px 0;
		border-radius: 18px;
		padding: 30px;
	}
	.concept-callout.accounting {
		background: #edf2e5;
		border: 1px solid #dce5d2;
	}
	.concept-callout.mechanism {
		background: #eeedf8;
		border: 1px solid #dedbec;
	}
	.concept-callout.warning {
		background: #fcf0e2;
		border: 1px solid #efdfc6;
	}
	.data-table {
		overflow-x: auto;
		margin: 30px 0;
		border: 1px solid var(--line);
		border-radius: 14px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
		font-size: 14px;
		min-width: 420px;
	}
	caption {
		text-align: left;
		padding: 18px;
		background: #f0f4ed;
		font-weight: 700;
	}
	th,
	td {
		padding: 14px 16px;
		border-bottom: 1px solid var(--line);
		text-align: left;
		line-height: 1.6;
	}
	thead th {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		background: #fafbf8;
	}
	tbody th {
		font-weight: 600;
	}
	tbody tr:last-child td,
	tbody tr:last-child th {
		border: 0;
	}
	.mechanism {
		background: #f4f6f1;
		border: 1px solid var(--line);
	}
	.mechanism ol {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 24px;
	}
	.mechanism li {
		display: flex;
		gap: 16px;
	}
	.step-no {
		display: grid;
		place-items: center;
		flex: 0 0 30px;
		width: 30px;
		height: 30px;
		background: var(--green);
		color: white;
		border-radius: 50%;
		font-size: 12px;
		font-weight: 700;
	}
	.worked {
		border: 1px solid #d7ded2;
		background: #fff;
	}
	.worked ol {
		padding-left: 24px;
		display: grid;
		gap: 16px;
	}
	.conclusion {
		background: #f0f4ea;
		border-radius: 12px;
		padding: 20px;
		margin-top: 20px;
	}
	.conclusion strong {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.07em;
	}
	.conclusion p {
		margin-top: 9px;
	}
	.comparison {
		padding: 0;
	}
	.comparison > div {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 12px;
	}
	.comparison section {
		padding: 23px;
		background: #f7f7f2;
		border: 1px solid var(--line);
		border-radius: 14px;
	}
	.lab-brief {
		background: linear-gradient(135deg, #edf4ed, #f3f1fa);
		border: 1px solid #d8e0d5;
	}
	.lab-brief h4 {
		margin-top: 25px;
	}
	.lab-brief ul {
		padding-left: 20px;
	}
	.limitation {
		font-size: 13px;
		margin-top: 22px;
		color: var(--muted);
	}
	figure {
		margin: 30px 0;
	}
	figure img {
		border-radius: 18px;
		width: 100%;
	}
	figcaption {
		font-size: 12px;
		color: var(--muted);
		line-height: 1.6;
		margin-top: 12px;
	}
	.code-block {
		background: #f3f5ef;
	}
	.code-block pre {
		white-space: pre;
		overflow: auto;
		padding: 22px;
		border-radius: 12px;
		background: #203a33;
		color: #e6efdc;
		font-size: 13px;
		line-height: 1.8;
	}
	.code-block > p:last-child {
		margin-top: 18px;
	}
	.reflection {
		padding: 0;
	}
	details {
		border: 1px solid var(--line);
		padding: 18px;
		border-radius: 12px;
		background: white;
	}
	summary {
		cursor: pointer;
		font-weight: 700;
		font-size: 14px;
	}
	details p {
		margin-top: 18px;
	}
	@media (max-width: 600px) {
		.concept-callout,
		.worked,
		.lab-brief,
		.mechanism,
		.code-block {
			padding: 22px;
		}
		.prose-block p {
			font-size: 16px;
		}
		.mechanism li {
			gap: 12px;
		}
	}
</style>
