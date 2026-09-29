<script lang="ts">
	import { onMount } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import type { CourseModule } from '../types';
	import { useBook } from '../progress.svelte';
	import ContentBlock from './ContentBlock.svelte';
	import Assessment from './Assessment.svelte';
	import RichText from './RichText.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SourceLink from './SourceLink.svelte';
	import TeachingFigure from '../visuals/TeachingFigure.svelte';
	import { moduleVisuals, visualsAt } from '../visuals';
	let {
		module,
		previous,
		next
	}: {
		module: CourseModule;
		previous?: { id: string; title: string };
		next?: { id: string; title: string };
	} = $props();
	const book = useBook();
	const evidence = $derived(book.get(module.id));
	const visualGuide = $derived(moduleVisuals(module.id));
	const image = $derived(
		module.day === 1
			? 'foundations'
			: module.day === 2
				? 'analytics-atelier'
				: module.day === 3
					? 'language'
					: module.day === 4
						? 'agents'
						: 'systems-atelier'
	);
	let contentsOpen = $state(false);
	onMount(() => {
		book.load();
		book.update(module.id, () => {});
	});
	function exportNotes() {
		const blob = new Blob(
			[
				JSON.stringify(
					{ module: module.id, title: module.title, evidence: book.get(module.id) },
					null,
					2
				)
			],
			{ type: 'application/json' }
		);
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `ai-accountant-${module.id}-notebook.json`;
		a.click();
		URL.revokeObjectURL(a.href);
	}
</script>

<svelte:head
	><title>{module.title} · AI Accountant</title><meta
		name="description"
		content={module.subtitle}
	/></svelte:head
>
<div class="reader-wrap">
	<nav class="reader-breadcrumb" aria-label="Course breadcrumb">
		<a href={resolve('/path/')}>Five-day course</a><span>/</span><a
			href={resolve(`/path/#day-${module.day}`)}>Day {module.day}</a
		><span>/</span><span>{module.id}</span>
	</nav>
	<header class="module-header">
		<div>
			<p class="eyebrow">DAY {module.day} · MODULE {module.id.slice(1)}</p>
			<h1>{module.title}</h1>
			<p class="subtitle">{module.subtitle}</p>
			<div class="module-meta">
				<span><Icon name="clock" size={16} />{module.minutes} min study & practice</span><span
					><Icon name="book" size={16} />{module.sections.length} connected sections</span
				>
			</div>
			<p class="timing-note">
				Planned active learning time, including exercises. Learner timing has not yet been piloted.
			</p>
		</div>
		<img src={asset(`/images/${image}.webp`)} alt="" />
	</header>
	<div class="reading-layout">
		<article>
			<div class="orientation">
				<p class="block-label">THE BUSINESS QUESTION</p>
				<p class="why"><RichText text={module.why} /></p>
				<h2>What you’ll be able to do</h2>
				<ol>
					{#each module.objectives as objective, i (i)}<li>{objective}</li>{/each}
				</ol>
				{#if module.prerequisites.length}<div class="prerequisites">
						<strong>Builds on</strong>{#each module.prerequisites as id (id)}<a
								href={resolve('/course/[slug]', { slug: id.toLowerCase() })}
								>{id} <Icon name="arrow" size={13} /></a
							>{/each}
					</div>{/if}
				<p class="term-hint">
					Dotted terms have definitions. Hover, tap, or focus and press Enter to explore them.
				</p>
				<nav class="chapter-visual-guide" aria-label="Visual guide for this module">
					<div>
						<Icon name="sparkles" size={18} /><strong>See the ideas</strong><a
							href={resolve('/visuals')}>Explore the visual atlas <Icon name="arrow" size={14} /></a
						>
					</div>
					<ul>
						{#each visualGuide as visual (visual.id)}<li>
								<a href={`#${visual.id}`}
									><Icon
										name={visual.kind === 'interactive'
											? 'sliders'
											: visual.kind === 'art'
												? 'sparkles'
												: 'network'}
										size={15}
									/>{visual.title}</a
								>
							</li>{/each}
					</ul>
				</nav>
			</div>
			{#each module.sections as section, i (section.id)}<section
					class="chapter-section"
					id={section.id}
				>
					<p class="section-count">
						{String(i + 1).padStart(2, '0')} / {String(module.sections.length).padStart(2, '0')}
					</p>
					<h2>{section.title}</h2>
					<p class="section-lead">{section.lead}</p>
					{#each section.blocks as block, j (j)}<ContentBlock
							{block}
							moduleId={module.id}
							index={`${section.id}-${j}`}
						/>{#each visualsAt(module.id, section.id, j) as visual (visual.id)}<TeachingFigure
								{visual}
							/>{/each}{/each}<label class="read-mark"
						><input
							type="checkbox"
							checked={evidence.read.includes(section.id)}
							onchange={() => book.toggle(module.id, 'read', section.id)}
						/><span>I’ve studied this section and can explain its main idea.</span></label
					>
				</section>{/each}
			<Assessment {module} />
			<section id="sources" class="module-sources">
				<p class="eyebrow">FOLLOW THE EVIDENCE</p>
				<h2>Sources & further study</h2>
				<p>
					Worked business records are fictional teaching examples. These sources support the
					mechanisms and external claims.
				</p>
				{#each module.sources as source, i (i)}<SourceLink url={source.url}
						><div>
							<strong>{source.label}</strong>{#if source.note}<span>{source.note}</span>{/if}
						</div>
						<Icon name="upRight" size={18} /></SourceLink
					>{/each}
			</section>
			<nav class="module-next" aria-label="Adjacent modules">
				{#if previous}<a href={resolve('/course/[slug]', { slug: previous.id.toLowerCase() })}
						><small>← PREVIOUS</small><strong>{previous.title}</strong></a
					>{/if}{#if next}<a href={resolve('/course/[slug]', { slug: next.id.toLowerCase() })}
						><small>NEXT MODULE →</small><strong>{next.title}</strong></a
					>{:else}<a href={resolve('/projects/')}
						><small>KEEP THE EVIDENCE</small><strong>Take your portfolio forward →</strong></a
					>{/if}
			</nav>
		</article>
		<aside class="reader-side">
			<div class="sticky-contents">
				<button
					class="contents-toggle"
					onclick={() => (contentsOpen = !contentsOpen)}
					aria-expanded={contentsOpen}
					><Icon name="list" size={17} />In this module <Icon name="down" size={16} /></button
				>
				<nav class:expanded={contentsOpen} aria-label="Module sections">
					<p class="contents-label">IN THIS MODULE</p>
					{#each module.sections as section, i (section.id)}<a
							href={`#${section.id}`}
							onclick={() => (contentsOpen = false)}
							><span
								>{evidence.read.includes(section.id) ? '✓' : String(i + 1).padStart(2, '0')}</span
							>{section.title}</a
						>{/each}<a href="#knowledge-check"><Icon name="check" size={14} />Knowledge check</a><a
						href="#assignment"><Icon name="folder" size={14} />Your engagement note</a
					><a href="#interview"><Icon name="mic" size={14} />Interview defense</a><a href="#sources"
						><Icon name="library" size={14} />Sources</a
					>
				</nav>
				<div class="notebook-actions">
					<p>{evidence.read.length} / {module.sections.length} sections studied</p>
					<button
						onclick={() =>
							book.update(module.id, (e) => {
								e.bookmarked = !e.bookmarked;
							})}
						><Icon name="bookmark" size={15} />{evidence.bookmarked
							? 'Bookmarked'
							: 'Bookmark module'}</button
					><button onclick={exportNotes}
						><Icon name="download" size={15} />Export module notes</button
					><small>Reading, practice, and self-assessed reasoning are recorded separately.</small>
				</div>
			</div>
		</aside>
	</div>
</div>

<style>
	.chapter-visual-guide {
		margin-top: 26px;
		padding: 22px;
		border: 1px solid #dce4d8;
		border-radius: 16px;
		background: linear-gradient(120deg, #eef4e9, #f1edf8);
	}
	.chapter-visual-guide > div {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.chapter-visual-guide > div > a {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 12px;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.chapter-visual-guide ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
		gap: 10px 20px;
		padding: 0;
		margin: 18px 0 0;
		list-style: none;
	}
	.chapter-visual-guide li a {
		display: flex;
		align-items: center;
		gap: 9px;
		font-size: 13px;
		line-height: 1.5;
		padding: 5px 0;
	}
	.chapter-visual-guide li a:hover {
		color: var(--green);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.reader-wrap {
		max-width: 1250px;
		margin: auto;
		padding: 35px 45px 60px;
	}
	.reader-breadcrumb {
		display: flex;
		gap: 12px;
		font-size: 12px;
		color: var(--muted);
		margin-bottom: 30px;
	}
	.reader-breadcrumb a:hover {
		text-decoration: underline;
	}
	.module-header {
		display: grid;
		grid-template-columns: 1fr 220px;
		align-items: center;
		gap: 25px;
		padding: 30px 0 42px;
		border-bottom: 1px solid var(--line);
	}
	h1 {
		font-size: clamp(31px, 3.4vw, 47px);
		letter-spacing: -1.6px;
		line-height: 1.17;
		margin: 15px 0 20px;
		max-width: 760px;
	}
	.subtitle {
		font-size: 18px;
		line-height: 1.65;
		color: var(--muted);
		max-width: 650px;
	}
	.module-header img {
		border-radius: 50%;
		width: 220px;
		height: 220px;
		object-fit: cover;
		box-shadow: 0 12px 35px #59724c12;
	}
	.module-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		margin-top: 23px;
		font-size: 12px;
		font-weight: 600;
	}
	.module-meta span {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.timing-note {
		font-size: 11px;
		color: var(--muted);
		margin-top: 12px;
	}
	.reading-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 210px;
		gap: 45px;
		align-items: start;
	}
	article {
		width: 100%;
		min-width: 0;
	}
	.orientation {
		padding: 40px 0 0;
	}
	.block-label,
	.section-count {
		font-size: 10px;
		letter-spacing: 0.15em;
		font-weight: 800;
		color: #53694c;
	}
	.why {
		font-size: 19px;
		line-height: 1.85;
		margin-top: 15px;
	}
	.orientation h2 {
		font-size: 17px;
		margin: 28px 0 16px;
	}
	.orientation ol {
		padding-left: 23px;
		display: grid;
		gap: 10px;
		font-size: 15px;
		line-height: 1.7;
	}
	.prerequisites {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		margin: 24px 0;
		font-size: 12px;
	}
	.prerequisites a {
		display: flex;
		gap: 5px;
		align-items: center;
		background: var(--mint);
		border-radius: 7px;
		padding: 6px 9px;
	}
	.term-hint {
		font-size: 12px;
		color: var(--muted);
		border-top: 1px solid var(--line);
		padding-top: 18px;
	}
	.chapter-section {
		margin-top: 55px;
		padding-top: 35px;
		border-top: 1px solid var(--line);
		scroll-margin-top: 90px;
	}
	.chapter-section > h2 {
		font-size: 29px;
		letter-spacing: -0.7px;
		line-height: 1.35;
		margin: 12px 0 18px;
	}
	.section-lead {
		font-size: 18px;
		line-height: 1.8;
		color: #647660;
	}
	.read-mark {
		display: flex;
		align-items: start;
		gap: 10px;
		padding: 17px 0;
		font-size: 12px;
		color: var(--muted);
		line-height: 1.7;
		cursor: pointer;
	}
	.read-mark input {
		margin-top: 3px;
	}
	.reader-side {
		align-self: stretch;
	}
	.sticky-contents {
		position: sticky;
		top: 100px;
		padding-top: 40px;
	}
	.contents-label {
		font-size: 10px;
		letter-spacing: 0.14em;
		font-weight: 800;
		margin-bottom: 17px;
	}
	.sticky-contents nav {
		display: grid;
		gap: 6px;
	}
	.sticky-contents nav a {
		font-size: 12px;
		line-height: 1.6;
		display: flex;
		align-items: baseline;
		gap: 9px;
		padding: 7px 0;
		color: #617360;
	}
	.sticky-contents nav a:hover {
		color: var(--green);
	}
	.sticky-contents nav a > span {
		font-size: 9px;
		flex: 0 0 16px;
	}
	.notebook-actions {
		border-top: 1px solid var(--line);
		margin-top: 20px;
		padding-top: 20px;
		display: grid;
		gap: 12px;
	}
	.notebook-actions p {
		font-size: 11px;
		font-weight: 600;
	}
	.notebook-actions button {
		border: 0;
		background: transparent;
		font-size: 11px;
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 0;
		text-align: left;
	}
	.notebook-actions small {
		font-size: 10px;
		line-height: 1.7;
		color: var(--muted);
	}
	.contents-toggle {
		display: none;
	}
	.module-sources {
		margin-top: 60px;
		padding-top: 35px;
		border-top: 1px solid var(--line);
		scroll-margin-top: 90px;
	}
	.module-sources h2 {
		font-size: 25px;
		margin: 12px 0;
	}
	.module-sources > p:last-of-type {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
		margin-bottom: 20px;
	}
	.module-sources :global(a) {
		display: flex;
		gap: 15px;
		justify-content: space-between;
		padding: 20px 0;
		border-bottom: 1px solid var(--line);
		font-size: 13px;
	}
	.module-sources :global(a span) {
		display: block;
		font-size: 12px;
		color: var(--muted);
		line-height: 1.7;
		margin-top: 6px;
	}
	.module-next {
		margin-top: 45px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.module-next a {
		background: #eff3e9;
		border-radius: 14px;
		padding: 23px;
	}
	.module-next small {
		font-size: 9px;
		letter-spacing: 0.1em;
		display: block;
		margin-bottom: 10px;
	}
	.module-next strong {
		font-size: 14px;
		line-height: 1.6;
		display: block;
	}
	@media (max-width: 1250px) {
		.reader-wrap {
			padding: 30px;
		}
		.reading-layout {
			gap: 28px;
			grid-template-columns: minmax(0, 1fr) 180px;
		}
		.module-header {
			grid-template-columns: 1fr 150px;
		}
		.module-header img {
			width: 150px;
			height: 150px;
		}
	}
	@media (max-width: 1050px) {
		.reading-layout {
			display: flex;
			flex-direction: column;
		}
		.reader-side {
			order: -1;
			width: 100%;
		}
		.sticky-contents {
			position: static;
			padding: 20px 0 0;
		}
		.contents-toggle {
			display: flex;
			align-items: center;
			gap: 10px;
			border: 1px solid var(--line);
			border-radius: 10px;
			background: white;
			padding: 12px;
			width: 100%;
			font-size: 13px;
		}
		.sticky-contents nav {
			display: none;
			margin-top: 15px;
		}
		.sticky-contents nav.expanded {
			display: grid;
		}
		.contents-label {
			display: none;
		}
		.notebook-actions {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 16px;
			margin: 14px 0;
			padding-top: 12px;
		}
		.notebook-actions small {
			width: 100%;
		}
		.orientation {
			padding-top: 10px;
		}
	}
	@media (max-width: 600px) {
		.reader-wrap {
			padding: 24px 20px;
		}
		.module-header {
			grid-template-columns: 1fr;
			padding-top: 10px;
		}
		.module-header img {
			display: none;
		}
		.module-next {
			grid-template-columns: 1fr;
		}
		.chapter-section > h2 {
			font-size: 25px;
		}
		.why {
			font-size: 18px;
		}
	}
</style>
