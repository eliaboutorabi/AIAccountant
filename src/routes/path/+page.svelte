<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { chapters, parts, lessonPath } from '$lib/data/course';
	import { useProgress } from '$lib/context';
	import Icon from '$lib/components/Icon.svelte';
	const progress = useProgress();
	let filter = $state('All chapters');
	const filters = ['All chapters', 'Not started', 'In progress', 'Completed'];
	function count(slug: string) {
		return progress.data.completed.filter((id) => id.startsWith(`${slug}/`)).length;
	}
	function visible(slug: string) {
		const c = count(slug);
		return (
			filter === 'All chapters' ||
			(filter === 'Not started' && c === 0) ||
			(filter === 'In progress' && c > 0 && c < 3) ||
			(filter === 'Completed' && c === 3)
		);
	}
</script>

<svelte:head
	><title>Your learning path · AI Accountant</title><meta
		name="description"
		content="Explore a connected 12-chapter path from AI history and machine learning to agents, tools, skills, and harness engineering."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">A PATH, NOT A RACE</p>
		<h1>Small steps. Wonderful possibilities.</h1>
		<p>
			Start at the beginning or follow your curiosity. Every chapter connects a big AI idea to your
			world of accounting and finance.
		</p>
	</div>
	<div class="path-overview panel">
		<span class="icon-tile mint"><Icon name="route" size={25} /></span>
		<div>
			<h3>Your next chapter is waiting.</h3>
			<p class="small-text muted">
				{progress.data.completed.length} of 36 lessons complete · {progress.percent}% of your
				journey
			</p>
		</div>
		<a
			class="button primary"
			href={resolve(lessonPath(progress.next.chapter.slug, progress.next.lessonIndex + 1))}
			>{progress.data.completed.length ? 'Keep exploring' : 'Start chapter 01'}<Icon
				name="arrow"
				size={17}
			/></a
		>
	</div>
	<div class="chip-row">
		{#each filters as f (f)}<button
				class="chip"
				class:selected={filter === f}
				onclick={() => (filter = f)}>{f}</button
			>{/each}
	</div>
	{#if !chapters.some((c) => visible(c.slug))}<div class="empty-state panel">
			<Icon name="sprout" size={30} />
			<h3>Room for a little growth.</h3>
			<p>No chapters in this category yet. Every lesson is open whenever you’re ready.</p>
			<button class="button secondary" onclick={() => (filter = 'All chapters')}
				>See all chapters</button
			>
		</div>{/if}
	{#each parts as part, pi (part.title)}
		{#if chapters.some((c) => c.part === pi && visible(c.slug))}<section
				class="path-part"
				id={`part-${pi + 1}`}
			>
				<div class={`path-part-header ${part.color}`}>
					<div>
						<span class="micro-label">PART 0{pi + 1} · CHAPTERS {part.range}</span>
						<h2>{part.title}</h2>
						<p>{part.subtitle}</p>
					</div>
					<img
						src={asset(`/images/${part.image}.webp`)}
						alt=""
						width="960"
						height="640"
						loading="lazy"
					/>
				</div>
				<div class="chapter-list">
					{#each chapters.filter((c) => c.part === pi && visible(c.slug)) as chapter (chapter.slug)}{@const ci =
							chapters.indexOf(chapter)}
						<article class="chapter-row">
							<div class="chapter-index">{String(ci + 1).padStart(2, '0')}</div>
							<div class="chapter-body">
								<div class="chapter-title-row">
									<h3><a href={resolve(lessonPath(chapter.slug))}>{chapter.title}</a></h3>
									<span class="tag">{count(chapter.slug) === 3 ? 'Completed' : chapter.era}</span>
								</div>
								<p>{chapter.description}</p>
								<div class="chapter-lessons">
									{#each chapter.lessons as lesson, li (lesson.title)}<a
											href={resolve(lessonPath(chapter.slug, li + 1))}
											class:done={progress.data.completed.includes(`${chapter.slug}/${li + 1}`)}
											><Icon
												name={progress.data.completed.includes(`${chapter.slug}/${li + 1}`)
													? 'circleCheck'
													: 'play'}
												size={14}
											/><span>{lesson.title}</span><Icon name="right" size={13} /></a
										>{/each}
								</div>
							</div>
						</article>{/each}
				</div>
			</section>{/if}
	{/each}
	<div class="callout">
		<Icon name="compass" size={23} />
		<div>
			<strong>A note about the timeline</strong>The course follows AI’s broad evolution. Chapters 6
			and 7 zoom into tokens and the 2017 transformer architecture that made later language models
			possible. Ideas overlap; progress was never a perfectly straight line.
		</div>
	</div>
</div>

<style>
	.path-overview {
		display: flex;
		align-items: center;
		gap: 19px;
		margin-bottom: 25px;
	}
	.path-overview .button {
		margin-left: auto;
	}
	.path-overview h3 {
		margin-bottom: 6px;
	}
	.path-part {
		margin: 30px 0;
		scroll-margin-top: 20px;
	}
	.path-part-header {
		border: 1px solid #50694110;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 150px;
		border-radius: 16px 16px 0 0;
		overflow: hidden;
		padding-left: 30px;
	}
	.path-part-header h2 {
		font-size: 26px;
		letter-spacing: -1px;
		margin: 10px 0;
	}
	.path-part-header p {
		font-size: 12px;
		color: var(--muted);
	}
	.path-part-header img {
		height: 100%;
		width: 240px;
		object-fit: cover;
		mix-blend-mode: multiply;
		mask-image: linear-gradient(90deg, transparent, #000 35%);
	}
	.chapter-list {
		border: 1px solid var(--line);
		border-top: 0;
		border-radius: 0 0 16px 16px;
		background: white;
	}
	.chapter-row {
		display: flex;
		gap: 23px;
		padding: 28px;
		border-bottom: 1px solid var(--line);
	}
	.chapter-row:last-child {
		border: 0;
	}
	.chapter-index {
		font-size: 18px;
		color: #5c694f;
		font-family: 'Manrope Variable', sans-serif;
		padding-top: 3px;
	}
	.chapter-body {
		flex: 1;
		min-width: 0;
	}
	.chapter-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 15px;
	}
	.chapter-title-row h3 {
		font-size: 18px;
		letter-spacing: -0.5px;
	}
	.chapter-title-row h3 a:hover {
		text-decoration: underline;
	}
	.chapter-body > p {
		font-size: 12px;
		color: var(--muted);
		margin: 10px 0 15px;
		line-height: 1.7;
	}
	.chapter-lessons {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.chapter-lessons a {
		display: flex;
		align-items: center;
		gap: 8px;
		background: #f7f9f3;
		border: 1px solid #edf0e6;
		border-radius: 8px;
		padding: 12px 10px;
		font-size: 10px;
		line-height: 1.7;
	}
	.chapter-lessons a:hover {
		background: #eaf1e1;
	}
	.chapter-lessons a > :global(svg):last-child {
		margin-left: auto;
	}
	.chapter-lessons a.done {
		background: #e6efdf;
		color: #4d6d3f;
	}
	@media (max-width: 1150px) {
		.chapter-lessons {
			grid-template-columns: 1fr;
		}
		.chapter-title-row {
			align-items: flex-start;
		}
		.chapter-title-row h3 {
			font-size: 17px;
		}
		.tag {
			font-size: 8px;
			white-space: nowrap;
		}
	}
	@media (max-width: 740px) {
		.path-overview {
			flex-wrap: wrap;
			gap: 12px;
		}
		.path-overview .button {
			margin-left: 0;
			width: 100%;
		}
		.path-overview h3 {
			font-size: 14px;
		}
		.path-overview .small-text {
			font-size: 10px;
		}
		.path-part-header {
			height: 140px;
			padding-left: 20px;
		}
		.path-part-header h2 {
			font-size: 21px;
		}
		.path-part-header img {
			width: 110px;
		}
		.path-part-header p {
			font-size: 10px;
		}
		.chapter-row {
			padding: 23px 17px;
			gap: 13px;
		}
		.chapter-title-row {
			flex-direction: column;
			gap: 8px;
		}
		.chapter-index {
			font-size: 15px;
		}
		.chapter-title-row h3 {
			font-size: 16px;
		}
		.chapter-lessons a {
			font-size: 11px;
		}
	}
</style>
