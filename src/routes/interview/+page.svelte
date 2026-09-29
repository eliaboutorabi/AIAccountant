<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { interviewQuestions } from '$lib/data/interview';
	import { lessonPath } from '$lib/data/course';
	import { useProgress } from '$lib/context';
	import Icon from '$lib/components/Icon.svelte';
	const progress = useProgress();
	let role = $state('All roles');
	let selected = $state(0);
	let revealed = $state(false);
	let response = $state('');
	let checked = $state<string[]>([]);
	const roles = ['All roles', ...new Set(interviewQuestions.map((q) => q.role))];
	const questions = $derived(
		interviewQuestions.filter((q) => role === 'All roles' || q.role === role)
	);
	const question = $derived(questions[selected] ?? questions[0]);
	function choose(index: number) {
		selected = index;
		revealed = false;
		response = '';
		checked = [];
	}
	function filter(value: string) {
		role = value;
		choose(0);
	}
</script>

<svelte:head
	><title>Interview studio · AI Accountant</title><meta
		name="description"
		content="Practice finance transformation, analytics, data science, AI engineering, and agent engineering interviews with 18 worked scenarios and self-assessment rubrics."
	/></svelte:head
>
<div class="page-wrap">
	<div class="interview-hero">
		<div class="page-title">
			<p class="eyebrow">CONFIDENCE COMES FROM PRACTICE</p>
			<h1>You know more than you think.<br />Let’s find the words.</h1>
			<p>
				A quiet space to practice the questions that matter. Think it through, say it in your own
				words, then explore a thoughtful answer.
			</p>
			<span class="tag"><Icon name="mic" size={14} />18 real-world scenarios · 5 role families</span
			>
		</div>
		<img
			src={asset('/images/language.webp')}
			alt="Playful speech bubbles around a network of ideas"
			width="960"
			height="640"
		/>
	</div>
	<div class="chip-row">
		{#each roles as r (r)}<button class="chip" class:selected={role === r} onclick={() => filter(r)}
				>{r}</button
			>{/each}
	</div>
	<div class="studio-grid">
		<aside class="question-list">
			<p class="micro-label">PICK A CONVERSATION</p>
			{#each questions as item, i (item.title)}<button
					class:current={selected === i}
					onclick={() => choose(i)}
					><span>{String(i + 1).padStart(2, '0')}</span><span>{item.title}</span
					>{#if progress.data.reviewed.includes(item.title)}<Icon
							name="circleCheck"
							size={15}
						/>{/if}</button
				>{/each}
		</aside>
		<section class="panel practice-card">
			<div class="practice-meta">
				<span class="tag">{question.role}</span><span>{selected + 1} / {questions.length}</span>
			</div>
			<h2>{question.title}</h2>
			<p class="interview-question">{question.question}</p>
			<label class="field-label" for="practice-answer">Your first thoughts</label><textarea
				id="practice-answer"
				class="field"
				rows="5"
				bind:value={response}
				placeholder="Start with the problem. Explain your approach. Name the tradeoffs. No perfect words needed."
			></textarea>
			<p class="draft-note">
				A scratchpad for this question. Your draft clears when you switch questions; it is never
				sent anywhere.
			</p>
			{#if !revealed}<button class="button primary" onclick={() => (revealed = true)}
					>Explore a strong answer<Icon name="sparkles" size={16} /></button
				>{:else}<div class="worked-answer">
					<p class="micro-label">ONE THOUGHTFUL WAY TO ANSWER</p>
					<p>{question.answer}</p>
				</div>
				<div class="rubric">
					<h3>How did your answer connect?</h3>
					<p>
						Self-assessment, not an automated grade. Compare your explanation with these three
						ingredients.
					</p>
					{#each question.rubric as item (item)}<label
							><input type="checkbox" bind:group={checked} value={item} /><span>{item}</span></label
						>{/each}
				</div>
				<div class="practice-actions">
					<button
						class="button primary"
						onclick={() => progress.review(question.title)}
						disabled={progress.data.reviewed.includes(question.title)}
						><Icon name="check" size={16} />{progress.data.reviewed.includes(question.title)
							? 'Practice recorded'
							: 'Mark as practiced'}</button
					><a class="text-link" href={resolve(lessonPath(question.chapter))}
						>Revisit the idea<Icon name="arrow" size={15} /></a
					>
				</div>{/if}
			<div class="question-nav">
				<button
					class="button secondary small"
					disabled={selected === 0}
					onclick={() => choose(selected - 1)}><Icon name="back" size={14} />Previous</button
				><button
					class="button secondary small"
					disabled={selected === questions.length - 1}
					onclick={() => choose(selected + 1)}>Next question<Icon name="arrow" size={14} /></button
				>
			</div>
		</section>
	</div>
	<div class="callout studio-note">
		<Icon name="sprout" />
		<div>
			<strong>Your experience is part of the answer.</strong>Use your own examples and explain your
			assumptions. These scenarios build conceptual confidence; technical roles also need practical
			statistics, SQL, coding, and domain experience. Bring a
			<a class="text-link" href={resolve('/projects/')}>portfolio project</a> to make your learning tangible.
		</div>
	</div>
</div>

<style>
	.interview-hero {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
		overflow: hidden;
		background: #eeedf4;
		border-radius: 18px;
	}
	.interview-hero .page-title {
		padding: 32px;
		flex: 1;
	}
	.interview-hero h1 {
		font-size: 30px;
	}
	.interview-hero .page-title > p:not(.eyebrow) {
		font-size: 12px;
	}
	.interview-hero .tag {
		margin-top: 17px;
		background: #ffffff90;
		font-size: 9px;
	}
	.interview-hero > img {
		width: 32%;
		height: 290px;
		object-fit: cover;
		mix-blend-mode: multiply;
		mask-image: linear-gradient(90deg, transparent, #000 30%);
	}
	.chip-row {
		margin-top: 24px;
	}
	.studio-grid {
		display: grid;
		grid-template-columns: 230px minmax(0, 1fr);
		gap: 25px;
	}
	.question-list {
		padding-right: 15px;
		border-right: 1px solid var(--line);
	}
	.question-list > .micro-label {
		display: block;
		margin-bottom: 16px;
	}
	.question-list button {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		text-align: left;
		width: 100%;
		font-size: 11px;
		line-height: 1.8;
		padding: 12px 10px;
		border: 0;
		border-radius: 8px;
		background: none;
		color: #5f6853;
		margin-bottom: 4px;
	}
	.question-list button > span:first-child {
		font-size: 8px;
		color: #5f6853;
		padding-top: 3px;
	}
	.question-list button.current {
		background: #eaf0e1;
		color: #426b39;
		font-weight: 600;
	}
	.question-list button:hover {
		background: #f0f3e9;
	}
	.question-list button > :global(svg) {
		margin-left: auto;
	}
	.practice-card {
		align-self: start;
	}
	.practice-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 10px;
		color: var(--muted);
		margin-bottom: 24px;
	}
	.practice-card h2 {
		font-size: 27px;
		line-height: 1.5;
	}
	.interview-question {
		font-size: 15px;
		line-height: 1.9;
		margin: 17px 0 27px;
		color: #58684f;
	}
	.practice-card textarea {
		font-size: 12px;
		line-height: 1.9;
		resize: vertical;
	}
	.draft-note {
		font-size: 9px;
		line-height: 1.8;
		color: #5d674f;
		margin: 10px 0 22px;
	}
	.worked-answer {
		padding: 23px;
		background: #eef3e7;
		border-radius: 12px;
		margin-top: 22px;
	}
	.worked-answer > p:last-child {
		font-size: 13px;
		line-height: 1.95;
		color: #506b42;
		margin-top: 15px;
	}
	.rubric {
		margin: 28px 0;
	}
	.rubric > p {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted);
		margin: 10px 0 15px;
	}
	.rubric label {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 12px;
		line-height: 1.9;
		margin: 12px 0;
	}
	.rubric input {
		margin-top: 5px;
	}
	.practice-actions {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
	}
	.question-nav {
		display: flex;
		justify-content: space-between;
		border-top: 1px solid var(--line);
		padding-top: 20px;
		margin-top: 28px;
	}
	.studio-note {
		margin-top: 30px;
	}
	@media (max-width: 1050px) {
		.studio-grid {
			grid-template-columns: 180px minmax(0, 1fr);
		}
		.question-list button {
			font-size: 10px;
		}
		.practice-card h2 {
			font-size: 23px;
		}
		.interview-hero h1 {
			font-size: 26px;
		}
		.interview-hero > img {
			width: 25%;
			height: 310px;
		}
	}
	@media (max-width: 740px) {
		.studio-grid {
			grid-template-columns: 1fr;
		}
		.question-list {
			display: flex;
			overflow: auto;
			border: 0;
			gap: 7px;
			padding: 0 0 8px;
		}
		.question-list > .micro-label {
			display: none;
		}
		.question-list button {
			width: 180px;
			flex-shrink: 0;
			font-size: 10px;
			padding: 12px;
			background: #f1f4e9;
		}
		.interview-hero > img {
			display: none;
		}
		.interview-hero .page-title {
			padding: 25px;
		}
		.interview-hero h1 {
			font-size: 26px;
		}
		.interview-question {
			font-size: 13px;
		}
		.practice-card h2 {
			font-size: 23px;
		}
		.worked-answer {
			padding: 20px;
		}
		.worked-answer > p:last-child {
			font-size: 12px;
		}
	}
</style>
