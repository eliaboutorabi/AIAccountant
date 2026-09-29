<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { modules, status } from '$lib/course';
	import { days } from '$lib/course/days';
	import { useBook } from '$lib/course/progress.svelte';
	import Notebook from '$lib/course/components/Notebook.svelte';
	import RichText from '$lib/course/components/RichText.svelte';
	import Icon from '$lib/components/Icon.svelte';
	const book = useBook();
	let filter = $state('All modules');
	const filters = ['All modules', 'Not studied', 'Studied', 'Bookmarked'];
	const next = $derived(modules.find((m) => m.id === book.data.lastModule) ?? modules[0]);
	function visible(id: string) {
		const m = modules.find((m) => m.id === id)!;
		const e = book.get(id);
		const s = status(m, e);
		return (
			filter === 'All modules' ||
			(filter === 'Not studied' && !s.studied) ||
			(filter === 'Studied' && s.studied) ||
			(filter === 'Bookmarked' && e.bookmarked)
		);
	}
</script>

<svelte:head
	><title>The five-day course · AI Accountant</title><meta
		name="description"
		content="A connected 30-hour study plan: 25 modules, real experiments, worked finance cases, cumulative review, and a defended capstone."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">A CONNECTED COURSE, AT YOUR PACE</p>
		<h1>Understand deeply.<br />Put it to work.</h1>
		<p>
			Follow Willow’s finance transformation from the first data question to a working, evaluated
			system. Every day ends with evidence you can explain.
		</p>
	</div>
	<div class="plan-note">
		<Icon name="route" size={25} />
		<div>
			<h3>Five study days · 30 planned active hours</h3>
			<p>
				Each day budgets 5½ hours for modules and 30 minutes for cumulative review. Breaks are
				extra. These are author estimates, not measured completion times. Spread the work across
				more days whenever useful.
			</p>
		</div>
		<a class="button primary" href={resolve('/course/[slug]', { slug: next.id.toLowerCase() })}
			>Continue <Icon name="arrow" size={15} /></a
		>
	</div>
	<p>
		<a class="text-link" href={resolve('/diagnostic/')}
			>Find your starting point with four cases →</a
		>
	</p>
	<div class="filters" role="group" aria-label="Filter modules">
		{#each filters as name (name)}<button
				class:active={filter === name}
				aria-pressed={filter === name}
				onclick={() => (filter = name)}>{name}</button
			>{/each}
	</div>
	{#each days as day (day.day)}<section class="course-day" id={`day-${day.day}`}>
			<header class={day.color}>
				<div>
					<p class="eyebrow">DAY 0{day.day}</p>
					<h2>{day.title}</h2>
					<p>{day.question}</p>
				</div>
				<img src={asset(`/images/${day.image}.webp`)} alt="" loading="lazy" />
			</header>
			<div class="module-list">
				{#each modules.filter((m) => m.day === day.day && visible(m.id)) as module (module.id)}{@const e =
						book.get(module.id)}{@const s = status(module, e)}<a
						class="module-row"
						href={resolve('/course/[slug]', { slug: module.id.toLowerCase() })}
						><span class="module-number">{module.id.slice(1)}</span>
						<div>
							<h3>{module.title}</h3>
							<p>{module.subtitle}</p>
							<div class="module-badges">
								<span><Icon name="clock" size={12} />{module.minutes} min</span><span
									>{module.checks.length} checks + worked case</span
								>{#if s.studied}<span class="earned">Reading studied</span
									>{/if}{#if s.practiced}<span class="earned">Practice recorded</span
									>{/if}{#if s.selfAssessed}<span class="earned">Case self-assessed</span>{/if}
							</div>
						</div>
						<Icon name="arrow" size={20} /></a
					>{:else}<p class="no-modules">No modules match this filter for Day {day.day}.</p>{/each}
			</div>
			<div class="day-artifact">
				<Icon name="folder" size={23} />
				<div>
					<strong>The evidence you’ll leave with</strong>
					<p>{day.artifact}</p>
				</div>
			</div>
			<details class="daily-review">
				<summary
					><span><Icon name="list" size={18} />Day {day.day} cumulative review</span><span
						>30 min · 6 prompts</span
					></summary
				>
				<div class="review-intro">
					<h3>Close the notes. Retrieve the ideas.</h3>
					<p>
						Spend about 20 minutes answering from memory, then 10 minutes comparing with the worked
						responses and revising. Explain the evidence and limitations, not just the term. These
						responses are saved in your course notebook.
					</p>
				</div>
				{#each day.review as review, i (i)}<div class="review-question">
						<Notebook
							moduleId={`M${String(day.day * 5).padStart(2, '0')}`}
							field={`day-review-${i}`}
							label={`${i + 1}. ${review.prompt}`}
							rows={4}
						/>
						<details>
							<summary>Compare with the worked response</summary>
							<p><RichText text={review.answer} /></p>
						</details>
					</div>{/each}
			</details>
		</section>{/each}
	<div class="scope-note">
		<Icon name="graduation" size={25} />
		<div>
			<h3>A strong foundation, with honest boundaries.</h3>
			<p>
				The core develops applied AI fluency and a first finance-system portfolio. Advanced data
				science and AI engineering roles also require deeper statistics, SQL, Python, and deployment
				practice. Day 5 maps those next steps. Reading, exercises, checks, and self-assessment are
				recorded separately; this is not an externally graded certification.
			</p>
		</div>
	</div>
</div>

<style>
	.plan-note {
		display: flex;
		gap: 20px;
		padding: 28px;
		border: 1px solid #dce5d5;
		border-radius: 18px;
		background: #eef3e8;
		align-items: center;
		margin: 30px 0;
	}
	.plan-note h3 {
		font-size: 17px;
	}
	.plan-note p {
		font-size: 13px;
		line-height: 1.8;
		margin-top: 10px;
		color: var(--muted);
	}
	.plan-note .button {
		flex-shrink: 0;
	}
	.filters {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin: 25px 0 35px;
	}
	.filters button {
		border: 1px solid var(--line);
		background: white;
		padding: 10px 15px;
		border-radius: 30px;
		font-size: 12px;
		font-weight: 600;
	}
	.filters button.active {
		background: var(--green);
		color: white;
		border-color: var(--green);
	}
	.course-day {
		margin: 0 0 38px;
		scroll-margin-top: 90px;
		border: 1px solid var(--line);
		border-radius: 20px;
		overflow: hidden;
		background: white;
	}
	.course-day header {
		position: relative;
		min-height: 210px;
		padding: 32px;
		overflow: hidden;
		display: flex;
		align-items: center;
	}
	.course-day header > div {
		z-index: 1;
		position: relative;
		max-width: 65%;
	}
	.course-day header h2 {
		font-size: 26px;
		line-height: 1.35;
		margin: 12px 0;
	}
	.course-day header p:not(.eyebrow) {
		font-size: 14px;
		line-height: 1.7;
		max-width: 500px;
	}
	.course-day header img {
		position: absolute;
		right: 0;
		top: 0;
		width: 40%;
		height: 100%;
		object-fit: cover;
		mask-image: linear-gradient(90deg, transparent, #000 35%);
	}
	.module-row {
		display: flex;
		gap: 22px;
		padding: 27px 32px;
		border-bottom: 1px solid var(--line);
		align-items: center;
	}
	.module-row:hover {
		background: #f9fbf6;
	}
	.module-row > div {
		flex: 1;
	}
	.module-number {
		font-size: 12px;
		font-weight: 700;
		color: #526847;
		align-self: flex-start;
		padding-top: 6px;
	}
	.module-row h3 {
		font-size: 17px;
		line-height: 1.5;
	}
	.module-row p {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.7;
		margin-top: 8px;
	}
	.module-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		margin-top: 14px;
	}
	.module-badges > span {
		display: flex;
		gap: 5px;
		align-items: center;
		font-size: 10px;
		color: #68785f;
	}
	.module-badges > span.earned {
		background: #edf3e5;
		border-radius: 5px;
		padding: 3px 7px;
		color: #31582b;
	}
	.day-artifact {
		padding: 24px 32px;
		display: flex;
		gap: 17px;
		background: #fafbf7;
	}
	.day-artifact strong {
		font-size: 12px;
	}
	.day-artifact p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
		margin-top: 8px;
	}
	.daily-review {
		border-top: 1px solid var(--line);
	}
	.daily-review > summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 15px;
		cursor: pointer;
		padding: 23px 32px;
		background: #f1f3ec;
		font-size: 12px;
		font-weight: 700;
	}
	.daily-review > summary > span:first-child {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.daily-review > summary > span:last-child {
		font-size: 10px;
		font-weight: 500;
		color: var(--muted);
	}
	.review-intro,
	.review-question {
		padding: 25px 32px;
	}
	.review-intro h3 {
		font-size: 21px;
		margin-bottom: 13px;
	}
	.review-intro p,
	.review-question details p {
		font-size: 14px;
		line-height: 1.8;
		color: var(--muted);
	}
	.review-question {
		padding-top: 0;
	}
	.review-question details {
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 17px;
	}
	.review-question summary {
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	.review-question details p {
		margin-top: 16px;
	}
	.scope-note {
		display: flex;
		gap: 20px;
		background: #f0edf7;
		border-radius: 18px;
		padding: 28px;
	}
	.scope-note h3 {
		font-size: 18px;
		margin-bottom: 13px;
	}
	.scope-note p {
		font-size: 13px;
		line-height: 1.85;
	}
	.no-modules {
		padding: 25px;
		color: var(--muted);
		font-size: 14px;
	}
	@media (max-width: 650px) {
		.plan-note {
			flex-wrap: wrap;
			padding: 23px;
		}
		.plan-note > div {
			flex: 1;
		}
		.plan-note .button {
			margin-left: 40px;
		}
		.course-day header {
			padding: 25px;
			min-height: 220px;
		}
		.course-day header > div {
			max-width: 83%;
		}
		.course-day header h2 {
			font-size: 23px;
		}
		.course-day header img {
			opacity: 0.45;
		}
		.module-row {
			padding: 22px;
			gap: 13px;
		}
		.module-row h3 {
			font-size: 16px;
		}
		.module-badges {
			gap: 10px;
		}
		.day-artifact,
		.review-intro,
		.review-question,
		.daily-review > summary {
			padding: 23px;
		}
		.daily-review > summary {
			align-items: start;
			flex-direction: column;
		}
		.scope-note {
			padding: 23px;
			gap: 14px;
		}
	}
</style>
