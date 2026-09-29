<script lang="ts">
	import { resolve } from '$app/paths';
	import { terms } from '$lib/course/terms';
	import { modules } from '$lib/course';
	const glossary = terms.map((t) => ({
		...t,
		category: `Day ${modules.find((m) => m.id === t.module)?.day ?? 1}`
	}));
	import Icon from '$lib/components/Icon.svelte';
	let query = $state('');
	let category = $state('Everything');
	const categories = ['Everything', ...new Set(glossary.map((g) => g.category))];
	const results = $derived(
		glossary
			.filter(
				(g) =>
					(category === 'Everything' || g.category === category) &&
					`${g.term} ${g.definition}`.toLowerCase().includes(query.toLowerCase())
			)
			.sort((a, b) => a.term.localeCompare(b.term))
	);
</script>

<svelte:head
	><title>Technical glossary · AI Accountant</title><meta
		name="description"
		content="Friendly definitions of AI, data science, accounting, and agent engineering concepts, each with a finance example."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">PRECISE WORDS. CLEAR EXPLANATIONS.</p>
		<h1>A friend for every unfamiliar word.</h1>
		<p>
			No jargon left behind. A plain-language guide to the words you’ll meet along the way, with
			finance examples and links to the full teaching. Hover over an underlined term in a lesson, or
			select it with a keyboard or touch, to open its definition.
		</p>
	</div>
	<label class="glossary-search"
		><Icon name="search" /><input
			class="field"
			aria-label="Find a term"
			placeholder="What’s that word again?"
			bind:value={query}
		/><span>{results.length} terms</span></label
	>
	<div class="chip-row">
		{#each categories as c (c)}<button
				class="chip"
				class:selected={category === c}
				onclick={() => (category = c)}>{c}</button
			>{/each}
	</div>
	<div class="glossary-grid">
		{#each results as term (term.term)}<article
				class="term-card"
				id={term.term.toLowerCase().replaceAll(' ', '-')}
			>
				<span class="micro-label">{term.category}</span>
				<h2>{term.term}</h2>
				<p>{term.definition}</p>
				<div class="term-example"><Icon name="bulb" size={16} />{term.example}</div>
				<a class="text-link" href={resolve('/course/[slug]', { slug: term.module.toLowerCase() })}
					>Study the concept <Icon name="arrow" size={14} /></a
				>
			</article>{:else}<div class="empty-state">
				<h3>We haven’t met that word yet.</h3>
				<p>Try a shorter search or choose “Everything”.</p>
				<button
					class="button secondary"
					onclick={() => {
						query = '';
						category = 'Everything';
					}}>Reset filters</button
				>
			</div>{/each}
	</div>
</div>

<style>
	.glossary-search {
		position: relative;
		display: flex;
		align-items: center;
		margin-bottom: 22px;
	}
	.glossary-search > :global(svg) {
		position: absolute;
		left: 16px;
		color: #5d674e;
	}
	.glossary-search input {
		padding: 16px 100px 16px 49px;
		background: #fff;
	}
	.glossary-search > span {
		position: absolute;
		right: 15px;
		font-size: 11px;
		color: var(--muted);
	}
	.glossary-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 18px;
	}
	.term-card {
		padding: 25px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: #fff;
		scroll-margin-top: 25px;
		display: flex;
		flex-direction: column;
	}
	.term-card:target {
		outline: 3px solid #c6d9a1;
		background: #fafcf7;
	}
	.term-card h2 {
		font-size: 22px;
		letter-spacing: -0.6px;
		margin: 10px 0;
	}
	.term-card > p {
		font-size: 13px;
		line-height: 1.85;
		color: var(--muted);
	}
	.term-example {
		display: flex;
		gap: 9px;
		font-size: 11px;
		line-height: 1.8;
		padding: 14px;
		background: #f5f6ee;
		border-radius: 8px;
		margin: 20px 0;
		color: #5d674d;
	}
	.term-example > :global(svg) {
		margin-top: 2px;
	}
	.term-card .text-link {
		margin-top: auto;
	}
	@media (max-width: 850px) {
		.glossary-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
