<script lang="ts">
	import { resolve } from '$app/paths';
	import { useProgress } from '$lib/context';
	import { allLessons, chapters, parts, lessonPath } from '$lib/data/course';
	import { sanitizeProgress } from '$lib/progress.svelte';
	import Icon from '$lib/components/Icon.svelte';
	const progress = useProgress();
	const saved = $derived(allLessons.filter((l) => progress.data.bookmarks.includes(l.id)));
	const notes = $derived(allLessons.filter((l) => progress.data.notes[l.id]?.trim()));
	let notice = $state('');
	let confirmReset = $state(false);
	function download() {
		const content = JSON.stringify(
			{
				course: 'AI Accountant',
				version: 1,
				exportedAt: new Date().toISOString(),
				progress: progress.data
			},
			null,
			2
		);
		const blob = new Blob([content], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'ai-accountant-learning-record.json';
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		notice = 'Your learning record has been exported.';
	}
	async function restore(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			if (file.size > 2000000) throw new Error('Please choose a learning record under 2 MB.');
			const record = JSON.parse(await file.text());
			if (record.course !== 'AI Accountant' || record.version !== 1 || !record.progress)
				throw new Error('That file is not an AI Accountant learning record.');
			const incoming = sanitizeProgress(record.progress);
			const merged = {
				...progress.data,
				completed: [...progress.data.completed, ...incoming.completed],
				bookmarks: [...progress.data.bookmarks, ...incoming.bookmarks],
				answers: { ...incoming.answers, ...progress.data.answers },
				notes: { ...incoming.notes, ...progress.data.notes },
				reviewed: [...progress.data.reviewed, ...incoming.reviewed]
			};
			for (const id of incoming.completed)
				if (!progress.data.completed.includes(id)) merged.answers[id] = incoming.answers[id];
			progress.data = sanitizeProgress(merged);
			progress.save();
			notice = 'Learning record merged. Existing notes are kept when both records have a note.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Could not restore this record.';
		}
		input.value = '';
	}
</script>

<svelte:head
	><title>Your progress · AI Accountant</title><meta
		name="description"
		content="Your course progress, saved lessons, and private learning notes. Export or restore your personal learning record."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">LOOK HOW FAR YOUR CURIOSITY CAN GO</p>
		<h1>Every little “aha!” adds up.</h1>
		<p>
			Your journey is your own. Keep the ideas that matter, return to the lessons you love, and
			celebrate the small steps.
		</p>
	</div>
	<section class="progress-hero panel">
		<div class="progress-ring" style={`--p:${progress.percent}%`}>
			<span><strong>{progress.percent}%</strong><small>EXPLORED</small></span>
		</div>
		<div>
			<h2>
				{progress.percent === 100
					? 'A whole new perspective.'
					: progress.percent === 0
						? 'Your story starts with one little step.'
						: 'A little more confident, every day.'}
			</h2>
			<div class="stat-row">
				<div>
					<div class="stat-number">{progress.data.completed.length}<small>/36</small></div>
					<p class="stat-caption">Lessons complete</p>
				</div>
				<div>
					<div class="stat-number">{progress.data.reviewed.length}<small>/18</small></div>
					<p class="stat-caption">Interviews practiced</p>
				</div>
				<div>
					<div class="stat-number">{saved.length}</div>
					<p class="stat-caption">Ideas saved for later</p>
				</div>
			</div>
			<a
				class="button primary"
				href={resolve(lessonPath(progress.next.chapter.slug, progress.next.lessonIndex + 1))}
				>Take the next step<Icon name="arrow" size={17} /></a
			>
		</div>
	</section>
	{#if progress.percent === 100}<div class="completion-banner">
			<Icon name="graduation" size={35} />
			<div>
				<h3>You’ve completed the learning path.</h3>
				<p>
					36 lessons. 72 checks. One wonderful beginning. Your next milestone is a project you can
					explain and defend.
				</p>
				<a class="text-link" href={resolve('/projects/')}
					>Build your portfolio<Icon name="arrow" size={16} /></a
				>
			</div>
		</div>{/if}
	<section class="page-section">
		<h2>Your path, at a glance.</h2>
		<div class="chapter-progress-grid">
			{#each chapters as chapter, i (chapter.slug)}{@const done = progress.data.completed.filter(
					(id) => id.startsWith(`${chapter.slug}/`)
				).length}<a class="chapter-progress" href={resolve(lessonPath(chapter.slug))}
					><span class={`icon-tile ${parts[chapter.part].color}`}><Icon name={chapter.icon} /></span
					>
					<div>
						<span class="micro-label">CHAPTER {String(i + 1).padStart(2, '0')}</span>
						<h3>{chapter.title}</h3>
						<div class="mini-progress">
							<div class="progress-track"><span style:width={`${(done / 3) * 100}%`}></span></div>
							<span>{done}/3</span>
						</div>
					</div></a
				>{/each}
		</div>
	</section>
	<section class="page-section">
		<h2>Saved for a curious day.</h2>
		<div class="saved-list panel">
			{#each saved as lesson (lesson.id)}<a
					href={resolve(lessonPath(lesson.chapter.slug, lesson.lessonIndex + 1))}
					><Icon name="bookmark" size={17} /><span
						><strong>{lesson.title}</strong><small>{lesson.chapter.title}</small></span
					><Icon name="arrow" size={16} /></a
				>{:else}<div class="empty-state">
					<Icon name="bookmark" size={29} />
					<h3>A place for your favorite ideas.</h3>
					<p>Use “Save this lesson” as you explore. It will be waiting here.</p>
				</div>{/each}
		</div>
	</section>
	{#if notes.length}<section class="page-section">
			<h2>Your little collection of thoughts.</h2>
			<div class="notes-grid">
				{#each notes as lesson (lesson.id)}<article class="note-card">
						<a href={resolve(lessonPath(lesson.chapter.slug, lesson.lessonIndex + 1))}
							><h3>{lesson.title}<Icon name="upRight" size={15} /></h3></a
						>
						<p>{progress.data.notes[lesson.id]}</p>
					</article>{/each}
			</div>
		</section>{/if}
	<section class="data-panel panel">
		<Icon name="shield" size={25} />
		<div>
			<h3>Your learning stays with you.</h3>
			<p>
				{progress.storageAvailable
					? 'Progress and notes are saved in this browser, with no account or cloud sync. Export a backup before clearing browser data.'
					: 'Browser storage is unavailable. Export your record to keep this session’s work.'}
			</p>
			<div class="data-actions">
				<button class="button secondary small" onclick={download}
					><Icon name="download" size={15} />Export learning record</button
				><label class="button secondary small import-label"
					>Restore a record<input
						type="file"
						accept="application/json,.json"
						aria-label="Restore a learning record"
						onchange={restore}
					/></label
				><button class="reset-button" onclick={() => (confirmReset = true)}>Start fresh</button>
			</div>
			<p class="data-notice" aria-live="polite">{notice}</p>
			{#if confirmReset}<div class="reset-confirm">
					<p>
						Clear all completion, quiz answers, saved lessons, notes, and interview practice from
						this browser? Export a backup first if you want to keep them.
					</p>
					<button class="button secondary small" onclick={() => (confirmReset = false)}
						>Keep my progress</button
					><button
						class="button primary small"
						onclick={() => {
							progress.reset();
							confirmReset = false;
							notice = 'Your local learning record has been cleared.';
						}}>Clear my learning record</button
					>
				</div>{/if}
		</div>
	</section>
</div>

<style>
	.progress-hero {
		display: flex;
		align-items: center;
		gap: 35px;
		background: linear-gradient(120deg, #edf2e5, #fcfcf7);
		padding: 35px;
	}
	.progress-ring {
		width: 160px;
		height: 160px;
		flex-shrink: 0;
		background: conic-gradient(#789b58 var(--p), #dfe7d2 0);
		border-radius: 50%;
		padding: 9px;
		display: grid;
		place-items: center;
	}
	.progress-ring > span {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: #f4f7ed;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.progress-ring strong {
		font-size: 39px;
		font-family: 'Manrope Variable', sans-serif;
		letter-spacing: -1.5px;
		color: #4a6d3e;
	}
	.progress-ring small {
		font-size: 7px;
		letter-spacing: 1.5px;
		color: #5c674b;
		margin-top: 6px;
	}
	.progress-hero h2 {
		font-size: 24px;
		line-height: 1.5;
	}
	.stat-number small {
		font-size: 14px;
		color: #5f6855;
		letter-spacing: 0;
	}
	.chapter-progress-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.chapter-progress {
		display: flex;
		gap: 15px;
		padding: 19px;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	.chapter-progress > div {
		flex: 1;
		min-width: 0;
	}
	.chapter-progress h3 {
		font-size: 13px;
		margin-top: 7px;
		margin-bottom: 14px;
	}
	.mini-progress {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 9px;
		color: #5d6949;
	}
	.mini-progress .progress-track {
		flex: 1;
		height: 4px;
	}
	.saved-list {
		padding: 12px 25px;
	}
	.saved-list > a {
		display: flex;
		gap: 13px;
		align-items: center;
		padding: 18px 0;
		border-bottom: 1px solid var(--line);
	}
	.saved-list > a:last-child {
		border: 0;
	}
	.saved-list strong {
		font-size: 13px;
	}
	.saved-list small {
		font-size: 10px;
		display: block;
		color: var(--muted);
		margin-top: 5px;
	}
	.saved-list > a > :global(svg):last-child {
		margin-left: auto;
	}
	.saved-list .empty-state {
		padding: 30px 10px;
	}
	.saved-list .empty-state > :global(svg) {
		margin: 0 auto 17px;
	}
	.saved-list .empty-state h3 {
		font-size: 19px;
	}
	.notes-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 17px;
	}
	.note-card {
		padding: 24px;
		background: #f5f2df;
		border-radius: 13px;
		border: 1px solid #e8e5d2;
	}
	.note-card h3 {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
		line-height: 1.7;
	}
	.note-card > p {
		font-size: 12px;
		line-height: 1.9;
		color: #61664e;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		margin-top: 15px;
	}
	.data-panel {
		display: flex;
		gap: 20px;
		margin-top: 35px;
	}
	.data-panel > div {
		flex: 1;
	}
	.data-panel h3 {
		font-size: 17px;
	}
	.data-panel p {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted);
		margin-top: 10px;
	}
	.data-actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 18px;
		align-items: center;
	}
	.import-label {
		position: relative;
		overflow: hidden;
		cursor: pointer;
	}
	.import-label input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
		width: 100%;
	}
	.import-label:focus-within {
		outline: 3px solid #cc8a44;
		outline-offset: 3px;
	}
	.reset-button {
		margin-left: auto;
		background: none;
		border: 0;
		font-size: 10px;
		color: #765f47;
		text-decoration: underline;
	}
	.reset-confirm {
		padding: 17px;
		background: #fbefe2;
		border-radius: 10px;
		margin-top: 18px;
	}
	.reset-confirm .button {
		margin: 13px 9px 0 0;
	}
	.completion-banner {
		display: flex;
		gap: 20px;
		background: #f3efda;
		padding: 27px;
		border-radius: 15px;
		margin-top: 25px;
	}
	.completion-banner h3 {
		font-size: 20px;
	}
	.completion-banner p {
		font-size: 12px;
		line-height: 1.8;
		margin: 12px 0;
	}
	.data-notice:empty {
		display: none;
	}
	@media (max-width: 1000px) {
		.progress-hero {
			gap: 25px;
			padding: 25px;
		}
		.progress-ring {
			width: 125px;
			height: 125px;
		}
		.progress-hero h2 {
			font-size: 20px;
		}
		.stat-row {
			gap: 25px;
		}
		.stat-caption {
			font-size: 9px;
		}
		.chapter-progress h3 {
			font-size: 12px;
		}
	}
	@media (max-width: 740px) {
		.progress-hero {
			flex-direction: column;
			align-items: flex-start;
		}
		.progress-ring {
			width: 100px;
			height: 100px;
		}
		.progress-ring strong {
			font-size: 28px;
		}
		.progress-hero h2 {
			font-size: 23px;
		}
		.chapter-progress-grid,
		.notes-grid {
			grid-template-columns: 1fr;
		}
		.chapter-progress h3 {
			font-size: 14px;
		}
		.data-panel {
			padding: 20px;
			gap: 12px;
		}
		.data-panel > :global(svg) {
			width: 18px;
		}
		.data-actions {
			align-items: flex-start;
			gap: 10px;
		}
		.reset-button {
			margin: 10px 0;
		}
		.completion-banner h3 {
			font-size: 18px;
		}
	}
</style>
