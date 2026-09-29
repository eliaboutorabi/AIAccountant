<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { modules } from '$lib/course';
	import { teachingVisuals } from '$lib/course/visuals';
	import Icon from '$lib/components/Icon.svelte';
	let query = $state('');
	let day = $state('all');
	let kind = $state('all');
	const kinds = [
		{ value: 'all', label: 'All visuals' },
		{ value: 'art', label: 'Infographics' },
		{ value: 'diagram', label: 'Diagrams' },
		{ value: 'interactive', label: 'Interactive' }
	];
	const results = $derived(
		teachingVisuals.filter(
			(v) =>
				(kind === 'all' || v.kind === kind) &&
				(day === 'all' || modules.find((m) => m.id === v.module)?.day === Number(day)) &&
				`${v.title} ${v.lead} ${v.alt} ${v.module}`
					.toLowerCase()
					.includes(query.trim().toLowerCase())
		)
	);
	const groups = $derived(
		modules
			.map((module) => ({ module, visuals: results.filter((v) => v.module === module.id) }))
			.filter((group) => group.visuals.length)
	);
</script>

<svelte:head>
	<title>Visual atlas · AI Accountant</title>
	<meta
		name="description"
		content="Explore the entire AI Accountant course through illustrated mechanisms, beautiful infographics and interactive figures, each linked to its full lesson."
	/>
</svelte:head>

<div class="page-wrap atlas-page">
	<header class="atlas-hero">
		<div class="atlas-intro">
			<p class="eyebrow">THE VISUAL FIELD GUIDE</p>
			<h1>See the idea.<br />Make the connection.</h1>
			<p>
				Follow a token into a model. Watch attention mix information. Trace an invoice into a
				decision. Every visual belongs to a lesson—and every lesson has something to show you.
			</p>
			<div class="atlas-stats">
				<span><strong>{teachingVisuals.length}</strong> teaching figures</span><span
					><strong>25</strong> connected chapters</span
				><span><strong>7</strong> ideas to interact with</span>
			</div>
		</div>
		<a class="atlas-feature" href={resolve('/course/m12/#m12-attention-mixture')}>
			<img
				src={asset('/images/visuals/m12-attention-mixture.webp')}
				alt="An illustrated attention mixture: three weighted information streams combine into one result."
				width="1536"
				height="1024"
			/>
			<span>Inside attention <Icon name="arrow" size={18} /></span>
		</a>
	</header>
	<section class="atlas-controls" aria-label="Filter the visual atlas">
		<label class="atlas-search"
			><Icon name="search" size={20} /><input
				aria-label="Find a visual"
				placeholder="Find an idea: tokens, leakage, cash, agents…"
				bind:value={query}
			/></label
		>
		<label class="atlas-day"
			><span>Study day</span><select aria-label="Select study day" bind:value={day}
				><option value="all">All five days</option>{#each [1, 2, 3, 4, 5] as number (number)}<option
						value={String(number)}>Day {number}</option
					>{/each}</select
			></label
		>
		<div class="atlas-types">
			{#each kinds as filter (filter.value)}<button
					class:active={kind === filter.value}
					aria-pressed={kind === filter.value}
					onclick={() => (kind = filter.value)}>{filter.label}</button
				>{/each}
		</div>
		<p class="atlas-result-count" aria-live="polite">
			{results.length}
			{results.length === 1 ? 'visual' : 'visuals'}
		</p>
	</section>
	{#if !groups.length}
		<div class="atlas-empty">
			<Icon name="search" size={32} />
			<h2>No visual matches yet.</h2>
			<p>Try a broader concept or another study day.</p>
			<button
				class="button secondary"
				onclick={() => {
					query = '';
					day = 'all';
					kind = 'all';
				}}>Show every visual</button
			>
		</div>
	{/if}
	{#each groups as group (group.module.id)}
		<section class="atlas-module" aria-labelledby={`atlas-${group.module.id}`}>
			<div class="atlas-module-heading">
				<span class="atlas-module-number">{group.module.id.slice(1)}</span>
				<div>
					<p class="eyebrow">DAY {group.module.day} · {group.module.id}</p>
					<h2 id={`atlas-${group.module.id}`}>{group.module.title}</h2>
				</div>
				<a href={resolve('/course/[slug]', { slug: group.module.id.toLowerCase() })}
					>Read the chapter <Icon name="arrow" size={16} /></a
				>
			</div>
			<div class="atlas-grid">
				{#each group.visuals as visual (visual.id)}
					<a
						class="visual-card"
						data-kind={visual.kind}
						href={resolve(`/course/${visual.module.toLowerCase()}/#${visual.id}`)}
					>
						{#if visual.kind === 'art'}
							<div class="atlas-art-preview">
								<img
									src={asset(`/${visual.image.replace(/^\/+/, '')}`)}
									alt=""
									width={visual.width}
									height={visual.height}
									loading="lazy"
									decoding="async"
								/>
							</div>
						{:else if visual.kind === 'diagram'}
							<div class="atlas-diagram-preview" aria-hidden="true">
								{#each visual.nodes.slice(0, 3) as node, i (i)}<div style={`--tile-index:${i}`}>
										<Icon name={node.icon ?? 'layers'} size={27} /><span>{node.label}</span>
									</div>{/each}
							</div>
						{:else}
							<div class="atlas-interactive-preview" aria-hidden="true">
								<div class="atlas-interactive-orbit">
									<Icon
										name={visual.interaction === 'tokenizer'
											? 'blocks'
											: visual.interaction === 'attention'
												? 'orbit'
												: 'sliders'}
										size={43}
									/>
								</div>
								<span>Try the controls</span>
							</div>
						{/if}
						<div class="atlas-card-copy">
							<p class="atlas-kind">
								<Icon
									name={visual.kind === 'art'
										? 'sparkles'
										: visual.kind === 'interactive'
											? 'sliders'
											: 'network'}
									size={14}
								/>{visual.kind === 'art'
									? 'Illustrated explanation'
									: visual.kind === 'interactive'
										? 'Interactive figure'
										: 'Mechanism diagram'}
							</p>
							<h3>{visual.title}</h3>
							<p>{visual.lead}</p>
							<span class="atlas-open">Explore in the lesson <Icon name="arrow" size={16} /></span>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}
	<footer class="atlas-footer">
		<Icon name="book" size={25} />
		<div>
			<h2>A visual is a way into the reasoning.</h2>
			<p>
				Read its caption, make a prediction, and test the idea. Illustrated examples are labeled;
				the interactive figures and laboratories expose their computations. Each image also has a
				text companion and an enlarged view.
			</p>
		</div>
		<a class="button secondary" href={resolve('/path')}
			>Follow the full course <Icon name="arrow" size={16} /></a
		>
	</footer>
</div>

<style>
	.atlas-page {
		max-width: 1540px;
	}
	.atlas-hero {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		align-items: center;
		gap: 50px;
		padding: 15px 0 45px;
	}
	.atlas-intro h1 {
		font-size: clamp(34px, 3.7vw, 59px);
		line-height: 1.1;
		letter-spacing: -0.065em;
		margin: 20px 0 22px;
	}
	.atlas-intro > p:not(.eyebrow) {
		font-size: 16px;
		line-height: 1.85;
		color: var(--muted);
		max-width: 580px;
	}
	.atlas-stats {
		display: flex;
		gap: 25px;
		margin-top: 28px;
		flex-wrap: wrap;
	}
	.atlas-stats span {
		display: grid;
		gap: 4px;
		font-size: 11px;
		color: var(--muted);
	}
	.atlas-stats strong {
		font-size: 25px;
		font-weight: 500;
		color: var(--ink);
	}
	.atlas-feature {
		display: block;
		transform: rotate(1.3deg);
		padding: 12px;
		border: 1px solid #e3dfd3;
		border-radius: 18px;
		background: #fffdf8;
		box-shadow: 0 20px 50px #4c503814;
	}
	.atlas-feature img {
		width: 100%;
		height: auto;
		border-radius: 10px;
	}
	.atlas-feature > span {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 15px 8px 4px;
		font-size: 13px;
		font-weight: 700;
	}
	.atlas-controls {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 18px;
		padding: 26px 0;
		border-block: 1px solid var(--line);
		margin-bottom: 45px;
	}
	.atlas-search {
		display: flex;
		align-items: center;
		gap: 12px;
		border: 1px solid #dce2d7;
		border-radius: 12px;
		background: white;
		padding: 0 16px;
		min-width: 0;
	}
	.atlas-search input {
		border: none;
		background: transparent;
		padding: 15px 0;
		min-width: 0;
		width: 100%;
		font-size: 14px;
		outline-offset: 5px;
	}
	.atlas-day {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 12px;
	}
	.atlas-day select {
		border: 1px solid #dce2d7;
		border-radius: 10px;
		padding: 13px;
		background: white;
		color: var(--ink);
		font-size: 13px;
	}
	.atlas-types {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.atlas-types button {
		border: 1px solid var(--line);
		padding: 9px 15px;
		border-radius: 30px;
		background: transparent;
		font-size: 12px;
		color: var(--muted);
	}
	.atlas-types button.active {
		color: #fff;
		background: #285c48;
		border-color: #285c48;
	}
	.atlas-result-count {
		align-self: center;
		justify-self: end;
		font-size: 12px;
		color: var(--muted);
	}
	.atlas-module {
		margin: 0 0 54px;
	}
	.atlas-module-heading {
		display: flex;
		gap: 14px;
		align-items: center;
		margin-bottom: 22px;
	}
	.atlas-module-number {
		width: 46px;
		height: 46px;
		border: 1px solid #dfe6d6;
		border-radius: 13px;
		display: grid;
		place-items: center;
		background: #edf2e5;
		font-size: 18px;
		flex-shrink: 0;
	}
	.atlas-module-heading .eyebrow {
		font-size: 9px;
		margin-bottom: 6px;
	}
	.atlas-module-heading h2 {
		font-size: 21px;
		letter-spacing: -0.04em;
		line-height: 1.35;
	}
	.atlas-module-heading > a {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 8px;
		white-space: nowrap;
		font-size: 12px;
		color: var(--green);
	}
	.atlas-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 18px;
	}
	.visual-card {
		min-width: 0;
		overflow: hidden;
		border: 1px solid #e0e4d9;
		border-radius: 17px;
		background: #fffefa;
		display: flex;
		flex-direction: column;
		transition:
			box-shadow 0.2s,
			transform 0.2s;
	}
	.visual-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 32px #24433212;
	}
	.atlas-art-preview {
		aspect-ratio: 3/2;
		background: #f6f0e4;
		display: grid;
		place-items: center;
	}
	.atlas-art-preview img {
		width: 100%;
		height: auto;
		object-fit: contain;
	}
	.atlas-diagram-preview {
		aspect-ratio: 3/2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 24px 18px;
		background: radial-gradient(at 15% 20%, #e3ecd9, transparent 70%), #f4f2e9;
	}
	.atlas-diagram-preview > div {
		width: 30%;
		min-width: 0;
		align-self: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 13px;
		min-height: 102px;
		padding: 14px 7px;
		border-radius: 13px;
		background: #fffef6;
		border: 1px solid #d6decf;
		box-shadow: 3px 7px 0 #cad5c290;
		transform: translateY(calc((var(--tile-index) - 1) * -10px));
	}
	.atlas-diagram-preview > div:nth-child(2) {
		background: #e9e2f0;
		box-shadow: 3px 7px 0 #d0c6da90;
	}
	.atlas-diagram-preview > div:nth-child(3) {
		background: #f2e1ce;
		box-shadow: 3px 7px 0 #e1cbb290;
	}
	.atlas-diagram-preview span {
		font-size: 10px;
		text-align: center;
		line-height: 1.4;
	}
	.atlas-interactive-preview {
		position: relative;
		aspect-ratio: 3/2;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 18px;
		background: radial-gradient(at 70% 5%, #e4dcef, transparent 70%), #ecf2e8;
	}
	.atlas-interactive-orbit {
		width: 94px;
		height: 94px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		border: 1px solid #c5d0be;
		outline: 1px dashed #b7c7ac;
		outline-offset: 10px;
		background: #fffdf2;
		box-shadow: 0 10px 22px #2f513b12;
	}
	.atlas-interactive-preview > span:last-child {
		font-size: 11px;
		font-weight: 600;
	}
	.atlas-card-copy {
		padding: 22px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.atlas-kind {
		display: flex;
		gap: 7px;
		align-items: center;
		font-size: 10px;
		font-weight: 700;
		color: #486444;
		text-transform: uppercase;
		letter-spacing: 0.055em;
		margin-bottom: 12px;
	}
	.atlas-card-copy h3 {
		font-size: 18px;
		line-height: 1.4;
		letter-spacing: -0.035em;
		margin-bottom: 12px;
	}
	.atlas-card-copy > p:not(.atlas-kind) {
		color: var(--muted);
		font-size: 12px;
		line-height: 1.75;
		margin-bottom: 20px;
	}
	.atlas-open {
		margin-top: auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		font-weight: 700;
	}
	.atlas-empty {
		padding: 60px 20px;
		text-align: center;
		display: grid;
		justify-items: center;
		gap: 15px;
	}
	.atlas-footer {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 30px;
		background: #edf2e7;
		border: 1px solid #dce4d3;
		border-radius: 20px;
	}
	.atlas-footer h2 {
		font-size: 19px;
		margin-bottom: 10px;
	}
	.atlas-footer p {
		max-width: 600px;
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
	}
	.atlas-footer a {
		margin-left: auto;
		flex-shrink: 0;
	}
	@media (max-width: 1150px) {
		.atlas-hero {
			gap: 28px;
		}
		.atlas-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.atlas-footer {
			flex-wrap: wrap;
		}
		.atlas-footer a {
			margin-left: 0;
		}
	}
	@media (max-width: 680px) {
		.atlas-hero {
			grid-template-columns: 1fr;
			gap: 30px;
		}
		.atlas-feature {
			max-width: 520px;
			transform: none;
		}
		.atlas-controls {
			grid-template-columns: 1fr;
		}
		.atlas-result-count {
			justify-self: start;
		}
		.atlas-day {
			justify-content: space-between;
		}
		.atlas-grid {
			grid-template-columns: 1fr;
		}
		.atlas-module-heading {
			flex-wrap: wrap;
		}
		.atlas-module-heading > div {
			flex: 1;
		}
		.atlas-module-heading > a {
			margin-left: 60px;
		}
		.atlas-footer {
			padding: 25px;
		}
		.atlas-card-copy h3 {
			font-size: 20px;
		}
		.atlas-card-copy > p:not(.atlas-kind) {
			font-size: 14px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.visual-card {
			transition: none;
		}
		.visual-card:hover {
			transform: none;
		}
	}
</style>
