<script lang="ts">
	import { onMount } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import { allLessons, parts, lessonPath, type Chapter, type Lesson } from '$lib/data/course';
	import { sources } from '$lib/data/resources';
	import { useProgress } from '$lib/context';
	import Icon from './Icon.svelte';
	let {
		chapter,
		lesson,
		index,
		chapterIndex,
		id
	}: { chapter: Chapter; lesson: Lesson; index: number; chapterIndex: number; id: string } =
		$props();
	const progress = useProgress();
	const allIndex = $derived(allLessons.findIndex((l) => l.id === id));
	const next = $derived(allLessons[allIndex + 1]);
	const prev = $derived(allLessons[allIndex - 1]);
	const answers = $derived(progress.data.answers[id] ?? [-1, -1]);
	const correct = $derived(lesson.quiz.every((q, i) => answers[i] === q.answer));
	const completed = $derived(progress.data.completed.includes(id));
	let justCompleted = $state(false);
	onMount(() => {
		progress.load();
		progress.visit(id);
	});
	function finish() {
		progress.complete(id);
		justCompleted = true;
	}
</script>

<div class="lesson-top">
	<a class="text-link" href={resolve('/path/')}><Icon name="back" size={16} /> Your learning path</a
	><button
		class="save-button"
		class:saved={progress.data.bookmarks.includes(id)}
		aria-pressed={progress.data.bookmarks.includes(id)}
		onclick={() => progress.bookmark(id)}
		><Icon name="bookmark" size={16} />{progress.data.bookmarks.includes(id)
			? 'Saved for later'
			: 'Save this lesson'}</button
	>
</div>
<div class="lesson-grid">
	<article>
		<div class="lesson-heading">
			<p class="eyebrow">
				CHAPTER {String(chapterIndex + 1).padStart(2, '0')} · LESSON {index + 1} OF {chapter.lessons
					.length}
			</p>
			<h1>{lesson.title}</h1>
			<p>{lesson.subtitle}</p>
			<div class="lesson-meta">
				<span><Icon name="clock" size={14} /> 8 min with practice</span><span
					><Icon name="circleCheck" size={14} /> 2 knowledge checks</span
				><span><Icon name="sprout" size={14} /> Beginner friendly</span>
			</div>
		</div>
		<div class="lesson-cover">
			<img
				src={asset(`/images/${parts[chapter.part].image}.webp`)}
				alt={parts[chapter.part].title + ' illustrated as a miniature world'}
				width="960"
				height="640"
			/>
			<div class="cover-caption"><Icon name={chapter.icon} size={17} />{chapter.title}</div>
		</div>
		<div class="content-prose">
			<h2>Let’s make it click.</h2>
			{#each lesson.paragraphs as paragraph (paragraph)}<p>{paragraph}</p>{/each}
		</div>
		<div class="flow" aria-label="Concept flow">
			{#each lesson.flow as node, i (node)}{#if i > 0}<Icon name="arrow" size={18} />{/if}
				<div class="flow-node"><span>0{i + 1}</span>{node}</div>{/each}
		</div>
		<section class="example-panel">
			<div class="callout-label">
				<Icon name="calculator" size={18} /><span>LET’S BRING IT BACK TO FINANCE</span>
			</div>
			<h3>Picture this at Willow & Co.</h3>
			<p>{lesson.example}</p>
			<small>A fictional company. A very real way to think.</small>
		</section>
		<details class="disclosure refresher">
			<summary
				><span class="icon-tile butter"><Icon name="book" size={19} /></span><span
					>A little accounting refresher<br /><small>{lesson.refresher[0]}</small></span
				><Icon name="down" size={17} /></summary
			>
			<p>{lesson.refresher[1]}</p>
		</details>
		<section class="myth-panel">
			<div class="callout-label">
				<Icon name="bulb" size={18} /><span>A LITTLE MYTH-BUSTING</span>
			</div>
			<p class="myth">“{lesson.myth[0]}”</p>
			<p>{lesson.myth[1]}</p>
		</section>
		<section class="knowledge" id="knowledge-check">
			<p class="eyebrow">LET’S SEE WHAT STUCK</p>
			<h2>A little check-in.</h2>
			<p class="knowledge-intro">No pressure. Getting something wrong is a lovely way to learn.</p>
			{#each lesson.quiz as question, qi (question.prompt)}<fieldset class="question">
					<legend><span>0{qi + 1}</span>{question.prompt}</legend>
					<div class="options">
						{#each question.options as option, oi (option)}<label
								class="option"
								class:chosen={answers[qi] === oi}
								class:correct={answers[qi] === oi && oi === question.answer}
								class:incorrect={answers[qi] === oi && oi !== question.answer}
								><input
									type="radio"
									name={`question-${id}-${qi}`}
									value={oi}
									checked={answers[qi] === oi}
									onchange={() => progress.answer(id, qi, oi)}
								/><span class="option-letter">{String.fromCharCode(65 + oi)}</span><span
									>{option}</span
								>{#if answers[qi] === oi}<Icon
										name={oi === question.answer ? 'circleCheck' : 'help'}
										size={18}
									/>{/if}</label
							>{/each}
					</div>
					{#if answers[qi] >= 0}<div
							class="answer-feedback"
							class:needs-review={answers[qi] !== question.answer}
							aria-live="polite"
						>
							<Icon name={answers[qi] === question.answer ? 'circleCheck' : 'bulb'} size={19} />
							<div>
								<strong
									>{answers[qi] === question.answer
										? 'That’s it. You’ve got this.'
										: 'A useful pause. Let’s unpack it.'}</strong
								>
								<p>{question.explanation}</p>
								{#if answers[qi] !== question.answer}<small
										>Try another answer when you’re ready.</small
									>{/if}
							</div>
						</div>{/if}
				</fieldset>{/each}
		</section>
		<div class="takeaway">
			<Icon name="sparkles" size={24} />
			<div>
				<span class="micro-label">ONE THING TO TAKE WITH YOU</span>
				<p>{lesson.takeaway}</p>
			</div>
		</div>
		<section class="notes-section">
			<label class="field-label" for="lesson-notes"
				><Icon name="file" size={17} /> A thought worth keeping?</label
			><textarea
				id="lesson-notes"
				class="field"
				rows="3"
				maxlength="10000"
				placeholder="An aha moment, a question, an idea for your own work…"
				value={progress.data.notes[id] ?? ''}
				oninput={(e) => progress.note(id, e.currentTarget.value)}></textarea>
			<p class="note-status" aria-live="polite">
				{progress.storageAvailable
					? 'Saved automatically in this browser. Your notes stay yours.'
					: 'Browser storage is unavailable. Notes and progress last only for this visit.'}
			</p>
		</section>
		<div class="lesson-completion" aria-live="polite">
			{#if completed}<div class="completion-message">
					<Icon name="circleCheck" size={24} />
					<div>
						<h3>
							{justCompleted
								? 'A little more confident. A little further along.'
								: 'You’ve explored this lesson.'}
						</h3>
						<p>Your progress is saved. Take a breath, or take the next step.</p>
					</div>
				</div>{:else}<p>Answer both checks correctly, then mark this lesson complete.</p>
				<button class="button primary" disabled={!correct} onclick={finish}
					>Mark lesson complete <Icon name="check" size={17} /></button
				>{/if}
		</div>
		<nav class="lesson-navigation" aria-label="Between lessons">
			{#if prev}<a
					class="button secondary"
					href={resolve(lessonPath(prev.chapter.slug, prev.lessonIndex + 1))}
					><Icon name="back" size={15} />Previous lesson</a
				>{:else}<span></span>{/if}{#if next}<a
					class="button primary"
					href={resolve(lessonPath(next.chapter.slug, next.lessonIndex + 1))}
					>Next little step<Icon name="arrow" size={15} /></a
				>{:else}<a class="button primary" href={resolve('/projects/')}
					>Build your next chapter <Icon name="arrow" size={15} /></a
				>{/if}
		</nav>
		<div class="lesson-sources">
			<h3>Curious to go a little deeper?</h3>
			{#each chapter.sources as source (source)}<a
					class="source-link"
					href={sources[source].url}
					target="_blank"
					rel="external noreferrer">{sources[source].title}<Icon name="external" size={13} /></a
				>{/each}
		</div>
	</article>
	<aside class="lesson-aside">
		<div class="lesson-outline">
			<p class="micro-label">IN THIS CHAPTER</p>
			<h3>{chapter.title}</h3>
			{#each chapter.lessons as item, li (item.title)}<a
					href={resolve(lessonPath(chapter.slug, li + 1))}
					class:current={index === li}
					aria-current={index === li ? 'page' : undefined}
					><span
						>{progress.data.completed.includes(`${chapter.slug}/${li + 1}`)
							? '✓'
							: String(li + 1).padStart(2, '0')}</span
					>{item.title}</a
				>{/each}
			<div class="outline-note">
				<Icon name="coffee" size={21} />
				<p>You don’t have to get it all at once. The ideas will connect.</p>
			</div>
			{#if chapter.lab}<a
					class="button secondary small lab-link"
					href={resolve(`/playground/#${chapter.lab}`)}
					><Icon name="flask" size={16} />Try it in the playground</a
				>{/if}
		</div>
	</aside>
</div>

<style>
	.lesson-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 5px 0 32px;
	}
	.save-button {
		display: flex;
		align-items: center;
		gap: 7px;
		background: none;
		border: 0;
		font-size: 10px;
		color: var(--muted);
	}
	.save-button.saved {
		color: #467243;
	}
	.lesson-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 225px;
		gap: 40px;
	}
	.lesson-heading h1 {
		font-size: 36px;
		letter-spacing: -1.5px;
		font-weight: 600;
		line-height: 1.3;
	}
	.lesson-heading > p:not(.eyebrow) {
		font-size: 15px;
		color: var(--muted);
		margin: 13px 0 20px;
	}
	.lesson-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		color: #5e6754;
		font-size: 9px;
		margin-bottom: 25px;
	}
	.lesson-meta > span {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.lesson-cover {
		height: 270px;
		position: relative;
		border-radius: 17px;
		overflow: hidden;
	}
	.lesson-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 45%;
	}
	.cover-caption {
		position: absolute;
		bottom: 17px;
		left: 17px;
		display: flex;
		align-items: center;
		gap: 8px;
		background: #ffffffe8;
		padding: 10px 13px;
		border-radius: 8px;
		font-size: 11px;
	}
	.lesson-outline {
		position: sticky;
		top: 25px;
		border-left: 1px solid var(--line);
		padding-left: 24px;
	}
	.lesson-outline h3 {
		font-size: 15px;
		line-height: 1.7;
		margin: 12px 0 21px;
	}
	.lesson-outline > a:not(.button) {
		display: flex;
		gap: 12px;
		padding: 12px 0;
		font-size: 11px;
		line-height: 1.7;
		color: var(--muted);
	}
	.lesson-outline > a.current {
		color: var(--green);
		font-weight: 700;
	}
	.lesson-outline > a > span {
		font-size: 9px;
		min-width: 17px;
		padding-top: 1px;
		color: #596943;
	}
	.outline-note {
		background: #f1f2e6;
		padding: 18px;
		border-radius: 12px;
		margin-top: 22px;
		color: #60684c;
	}
	.outline-note p {
		font-size: 11px;
		line-height: 1.9;
		margin-top: 8px;
	}
	.lab-link {
		margin-top: 16px;
		width: 100%;
		font-size: 9px;
	}
	.example-panel {
		padding: 26px;
		border: 1px solid #e3e9d7;
		background: #f1f4e8;
		border-radius: 14px;
	}
	.callout-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 8px;
		letter-spacing: 1.3px;
		font-weight: 650;
		color: #596a3e;
		margin-bottom: 16px;
	}
	.example-panel h3 {
		font-size: 19px;
		letter-spacing: -0.5px;
		margin-bottom: 13px;
	}
	.example-panel p,
	.myth-panel > p {
		font-size: 13px;
		line-height: 1.9;
		color: #5a694e;
	}
	.example-panel small {
		font-size: 9px;
		display: block;
		color: #606754;
		margin-top: 18px;
	}
	.refresher {
		margin-top: 20px;
		background: #fffdf7;
	}
	.refresher summary {
		font-size: 12px;
		gap: 13px;
	}
	.refresher summary small {
		display: block;
		font-weight: 400;
		font-size: 11px;
		color: var(--muted);
		margin-top: 5px;
	}
	.myth-panel {
		margin: 26px 0;
		padding: 25px;
		background: #f4eef7;
		border-radius: 14px;
	}
	.myth-panel .callout-label {
		color: #6d5e73;
	}
	.myth-panel .myth {
		font-size: 17px;
		color: #63506b;
		font-family: 'Manrope Variable', sans-serif;
		font-weight: 600;
		line-height: 1.7;
		margin-bottom: 12px;
	}
	.knowledge {
		margin-top: 43px;
	}
	.knowledge h2 {
		font-size: 28px;
		letter-spacing: -1px;
	}
	.knowledge-intro {
		font-size: 12px;
		color: var(--muted);
		margin-top: 12px;
		margin-bottom: 27px;
	}
	.question {
		border: 0;
		padding: 0;
		margin: 0 0 30px;
		min-width: 0;
	}
	.question legend {
		display: flex;
		gap: 12px;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.8;
		margin-bottom: 15px;
	}
	.question legend > span {
		color: #5b6a44;
		font-size: 10px;
		padding-top: 3px;
	}
	.options {
		display: flex;
		flex-direction: column;
		gap: 9px;
	}
	.option {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		border: 1px solid #dfe6d9;
		background: white;
		padding: 15px;
		border-radius: 10px;
		font-size: 12px;
		cursor: pointer;
		line-height: 1.7;
	}
	.option input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}
	.option:focus-within {
		outline: 3px solid #cc8a44;
		outline-offset: 2px;
	}
	.option:hover {
		background: #f2f5ed;
	}
	.option-letter {
		font-size: 10px;
		border: 1px solid #e0e5d9;
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
		border-radius: 6px;
		color: #5e6852;
		flex-shrink: 0;
	}
	.option > :global(svg) {
		margin-left: auto;
	}
	.option.correct {
		background: #edf5e5;
		border-color: #93b282;
		color: #476e3e;
	}
	.option.incorrect {
		background: #fff6e9;
		border-color: #dcc399;
		color: #7b5e3b;
	}
	.answer-feedback {
		display: flex;
		gap: 11px;
		background: #eff5e8;
		border-radius: 10px;
		padding: 17px;
		margin-top: 13px;
		color: #4b6c3f;
		font-size: 12px;
		line-height: 1.8;
	}
	.answer-feedback > :global(svg) {
		margin-top: 3px;
	}
	.answer-feedback.needs-review {
		background: #fcf2e6;
		color: #7a603a;
	}
	.answer-feedback strong {
		display: block;
		margin-bottom: 4px;
	}
	.answer-feedback small {
		display: block;
		margin-top: 9px;
	}
	.takeaway {
		display: flex;
		gap: 17px;
		background: #254e3c;
		color: #e6efce;
		border-radius: 14px;
		padding: 25px;
		margin: 30px 0;
	}
	.takeaway > :global(svg) {
		color: #cee49c;
		margin-top: 4px;
	}
	.takeaway .micro-label {
		color: #5b6750;
	}
	.takeaway p {
		font-family: 'Manrope Variable', sans-serif;
		font-size: 19px;
		letter-spacing: -0.5px;
		line-height: 1.7;
		margin-top: 8px;
	}
	.field-label {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.note-status {
		font-size: 9px;
		color: #5e6651;
		margin: 8px 0 24px;
	}
	.lesson-completion {
		padding: 23px;
		border: 1px solid var(--line);
		background: #f0f4e9;
		border-radius: 12px;
	}
	.lesson-completion > p {
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
		margin-bottom: 15px;
	}
	.completion-message {
		display: flex;
		gap: 13px;
		align-items: center;
		color: #4c6d3a;
	}
	.completion-message h3 {
		font-size: 15px;
		line-height: 1.7;
	}
	.completion-message p {
		font-size: 11px;
		line-height: 1.8;
		margin-top: 5px;
	}
	.lesson-navigation {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		margin-top: 23px;
	}
	.lesson-sources {
		border-top: 1px solid var(--line);
		padding-top: 25px;
		margin-top: 35px;
	}
	.lesson-sources h3 {
		font-size: 14px;
		margin-bottom: 15px;
	}
	.lesson-sources a {
		margin-top: 10px;
	}
	@media (max-width: 1200px) {
		.lesson-grid {
			grid-template-columns: minmax(0, 1fr) 185px;
			gap: 25px;
		}
		.lesson-outline {
			padding-left: 18px;
		}
		.lesson-heading h1 {
			font-size: 31px;
		}
		.lesson-cover {
			height: 220px;
		}
	}
	@media (max-width: 1000px) {
		.lesson-grid {
			grid-template-columns: 1fr;
		}
		.lesson-aside {
			order: -1;
		}
		.lesson-outline {
			position: static;
			border: 1px solid var(--line);
			padding: 18px;
			border-radius: 12px;
		}
		.lesson-outline h3 {
			margin: 7px 0;
		}
		.lesson-outline > a:not(.button) {
			display: inline-flex;
			margin-right: 16px;
			padding: 8px 0;
			font-size: 10px;
		}
		.outline-note,
		.lab-link {
			display: none;
		}
		.lesson-outline .micro-label {
			font-size: 7px;
		}
	}
	@media (max-width: 740px) {
		.lesson-top {
			margin-bottom: 25px;
		}
		.lesson-top .text-link,
		.save-button {
			font-size: 9px;
		}
		.lesson-heading h1 {
			font-size: 30px;
		}
		.lesson-heading > p:not(.eyebrow) {
			font-size: 13px;
		}
		.lesson-meta {
			gap: 10px;
			font-size: 8px;
		}
		.lesson-cover {
			height: 215px;
		}
		.example-panel,
		.myth-panel {
			padding: 22px;
		}
		.lesson-navigation .button {
			font-size: 9px;
			padding: 12px;
		}
		.takeaway p {
			font-size: 17px;
		}
		.question legend {
			font-size: 13px;
		}
		.option {
			font-size: 11px;
		}
		.lesson-outline > a:not(.button) {
			display: flex;
			padding: 6px 0;
			font-size: 11px;
		}
		.lesson-outline h3 {
			font-size: 14px;
		}
	}
</style>
