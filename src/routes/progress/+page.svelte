<script lang="ts">
	import { resolve } from '$app/paths';
	import { modules, status, legacyModules } from '$lib/course';
	import { useBook, mergeBook } from '$lib/course/progress.svelte';
	import { useProgress } from '$lib/context';
	import { sanitizeProgress } from '$lib/progress.svelte';
	import { allLessons, lessonPath } from '$lib/data/course';
	import Icon from '$lib/components/Icon.svelte';
	const book = useBook(),
		legacy = useProgress();
	const summary = $derived(
		modules.map((module) => ({ module, ...status(module, book.get(module.id)) }))
	);
	const studied = $derived(summary.filter((s) => s.studied).length);
	const practiced = $derived(summary.filter((s) => s.practiced).length);
	const selfAssessed = $derived(summary.filter((s) => s.selfAssessed).length);
	const correct = $derived(summary.reduce((n, s) => n + s.checksCorrect, 0));
	const saved = $derived(modules.filter((m) => book.get(m.id).bookmarked));
	const oldNotes = $derived(allLessons.filter((l) => legacy.data.notes[l.id]?.trim()));
	let notice = $state(''),
		confirmReset = $state(false);
	function download() {
		const content = {
			course: 'AI Accountant',
			version: 2,
			exportedAt: new Date().toISOString(),
			book: book.data,
			legacy: legacy.data
		};
		const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'ai-accountant-learning-record-v2.json';
		a.click();
		URL.revokeObjectURL(a.href);
		notice =
			'Course notebook and legacy learning record exported. Use each lab’s export for its experiment data.';
	}
	async function restore(event: Event) {
		const input = event.currentTarget as HTMLInputElement,
			file = input.files?.[0];
		if (!file) return;
		try {
			if (file.size > 10000000) throw new Error('Choose a learning record under 10 MB.');
			const raw = JSON.parse(await file.text());
			if (raw.course !== 'AI Accountant' || ![1, 2].includes(raw.version))
				throw new Error('This is not a supported AI Accountant learning record.');
			if (raw.version === 2 && raw.book) {
				book.restore(mergeBook(book.data, raw.book));
			}
			const prior = raw.version === 1 ? raw.progress : raw.legacy;
			if (prior) {
				const incoming = sanitizeProgress(prior);
				legacy.data = sanitizeProgress({
					...legacy.data,
					completed: [...legacy.data.completed, ...incoming.completed],
					bookmarks: [...legacy.data.bookmarks, ...incoming.bookmarks],
					answers: { ...incoming.answers, ...legacy.data.answers },
					notes: { ...incoming.notes, ...legacy.data.notes },
					reviewed: [...legacy.data.reviewed, ...incoming.reviewed]
				});
				legacy.save();
			}
			notice =
				'Learning records merged. Current notes and answers take precedence when both records contain the same field.';
		} catch (e) {
			notice = e instanceof Error ? e.message : 'Unable to restore the record.';
		}
		input.value = '';
	}
</script>

<svelte:head
	><title>Your learning evidence · AI Accountant</title><meta
		name="description"
		content="Track reading, practice, knowledge checks, and self-assessed case evidence separately. Export your private notebook and retain earlier course notes."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">YOUR LEARNING, WITH EVIDENCE</p>
		<h1>Keep what you can<br />explain and do.</h1>
		<p>
			Studying a section, running an experiment, and defending a case are different achievements.
			Your notebook keeps those distinctions visible.
		</p>
	</div>
	<div class="evidence-stats">
		{#each [{ value: studied, total: 25, label: 'Modules studied', icon: 'book' }, { value: practiced, total: 25, label: 'Modules with written practice', icon: 'file' }, { value: correct, total: modules.reduce((n, m) => n + m.checks.length, 0), label: 'Checks currently correct', icon: 'check' }, { value: selfAssessed, total: 25, label: 'Cases self-assessed against rubric', icon: 'folder' }] as stat (stat.label)}<div
			>
				<Icon name={stat.icon} size={22} /><strong>{stat.value}<small>/{stat.total}</small></strong
				><span>{stat.label}</span>
			</div>{/each}
	</div>
	<p class="status-note">
		Checks can be retried and solutions can be opened. Written reasoning is self-assessed. These
		records are practice evidence, not independent examination results or external certification.
	</p>
	<section class="record-controls">
		<Icon name="shield" size={25} />
		<div>
			<h2>Your private course notebook</h2>
			<p>
				{book.storageAvailable
					? 'Notes and course progress save in this browser profile, with no account or cloud sync. Export a backup before clearing browser data.'
					: 'Browser storage is unavailable. Export this session’s notes before leaving.'} Experiment
				files use the exports inside each lab.
			</p>
			<div class="actions">
				<button class="button primary" disabled={!book.loaded || !legacy.loaded} onclick={download}
					><Icon name="download" size={16} />Export learning record</button
				><label class="button secondary import-label"
					>Restore / merge a record<input
						type="file"
						disabled={!book.loaded || !legacy.loaded}
						accept="application/json,.json"
						onchange={restore}
					/></label
				><button class="reset-link" onclick={() => (confirmReset = true)}
					>Reset course notebook</button
				>
			</div>
			<p class="notice" aria-live="polite">{notice}</p>
			{#if confirmReset}<div class="reset-confirm">
					<p>
						Clear the new course’s section marks, answers, bookmarks, and written responses? This
						keeps your legacy notes and separately saved lab files. Export first if you need a copy.
					</p>
					<button class="button secondary" onclick={() => (confirmReset = false)}
						>Keep my notebook</button
					><button
						class="button primary"
						onclick={() => {
							book.restore({});
							confirmReset = false;
							notice = 'The new course notebook has been cleared.';
						}}>Clear course notebook</button
					>
				</div>{/if}
		</div>
	</section>
	<section class="evidence-list">
		<h2>Your course record</h2>
		{#each summary as item (item.module.id)}<article>
				<a href={resolve('/course/[slug]', { slug: item.module.id.toLowerCase() })}
					><span>{item.module.id}</span><strong>{item.module.title}</strong><Icon
						name="arrow"
						size={16}
					/></a
				>
				<div class="evidence-badges">
					<span class:done={item.studied}>{item.studied ? '✓' : '○'} Studied</span><span
						class:done={item.practiced}>{item.practiced ? '✓' : '○'} Written practice</span
					><span>{item.checksCorrect}/{item.module.checks.length} checks</span><span
						class:done={item.selfAssessed}>{item.selfAssessed ? '✓' : '○'} Case self-assessed</span
					>
				</div>
				{#if Object.values(book.get(item.module.id).responses).some((v) => v.trim())}<details>
						<summary>Read this module’s saved writing</summary
						>{#each Object.entries(book.get(item.module.id).responses).filter( ([, v]) => v.trim() ) as [key, text] (key)}<div
								class="saved-response"
							>
								<h3>{key.replaceAll('-', ' ')}</h3>
								<p>{text}</p>
							</div>{/each}
					</details>{/if}
			</article>{/each}
	</section>
	<section class="bookmarks">
		<h2>Bookmarked modules</h2>
		{#each saved as module (module.id)}<a
				href={resolve('/course/[slug]', { slug: module.id.toLowerCase() })}
				><Icon name="bookmark" size={16} />{module.title}<Icon name="arrow" size={15} /></a
			>{:else}<p>Use “Bookmark module” in the reader to keep a concept close at hand.</p>{/each}
	</section>
	<details class="legacy-record">
		<summary
			>Earlier edition · {legacy.data.completed.length} lesson marks · {oldNotes.length} saved notes</summary
		>
		<p>
			Your earlier learning record remains intact. The expanded course introduces new evidence
			requirements, so old completion marks do not automatically certify the new modules.
		</p>
		{#each oldNotes as lesson (lesson.id)}<article>
				<a href={resolve(lessonPath(lesson.chapter.slug, lesson.lessonIndex + 1))}
					><h3>{lesson.title}</h3></a
				>
				<p class="legacy-note">{legacy.data.notes[lesson.id]}</p>
				<a
					class="upgrade"
					href={resolve('/course/[slug]', {
						slug: (legacyModules[lesson.chapter.slug] ?? 'M01').toLowerCase()
					})}>Study the expanded topic →</a
				>
			</article>{/each}<a
			href={resolve('/learn/[slug]/[lesson]', { slug: 'foundations', lesson: '1' })}
			>Open the preserved introductory edition →</a
		>
	</details>
</div>

<style>
	.evidence-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 15px;
		margin: 30px 0 18px;
	}
	.evidence-stats > div {
		padding: 26px;
		border: 1px solid #dce4d2;
		border-radius: 16px;
		background: #eff4e8;
		display: grid;
		gap: 18px;
	}
	.evidence-stats > div:nth-child(2) {
		background: #f0edf8;
	}
	.evidence-stats > div:nth-child(3) {
		background: #fbf0dc;
	}
	.evidence-stats > div:nth-child(4) {
		background: #f8ede3;
	}
	.evidence-stats strong {
		font-size: 35px;
		letter-spacing: -1px;
	}
	.evidence-stats small {
		font-size: 14px;
		color: var(--muted);
		margin-left: 5px;
		font-weight: 500;
	}
	.evidence-stats span {
		font-size: 11px;
		line-height: 1.7;
	}
	.status-note {
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
		margin-bottom: 30px;
	}
	.record-controls {
		display: flex;
		gap: 20px;
		border: 1px solid var(--line);
		padding: 28px;
		background: #fff;
		border-radius: 17px;
	}
	.record-controls > div {
		flex: 1;
		min-width: 0;
	}
	.record-controls h2 {
		font-size: 20px;
		margin-bottom: 14px;
	}
	.record-controls p {
		font-size: 13px;
		line-height: 1.85;
		color: var(--muted);
	}
	.actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 20px;
	}
	.actions .button {
		font-size: 12px;
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
		width: 100%;
		cursor: pointer;
	}
	.import-label:focus-within {
		outline: 3px solid #cc8a44;
		outline-offset: 4px;
	}
	.reset-link {
		border: 0;
		background: transparent;
		font-size: 11px;
		text-decoration: underline;
	}
	.notice {
		margin-top: 15px;
	}
	.reset-confirm {
		padding: 20px;
		background: #fff1e0;
		border-radius: 12px;
		margin-top: 20px;
	}
	.reset-confirm button {
		font-size: 12px;
		margin: 15px 8px 0 0;
	}
	.evidence-list {
		margin-top: 40px;
	}
	.evidence-list > h2,
	.bookmarks > h2 {
		font-size: 23px;
		margin-bottom: 23px;
	}
	.evidence-list > article {
		padding: 22px 25px;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 13px;
		margin-top: 11px;
	}
	.evidence-list article > a {
		display: flex;
		align-items: center;
		gap: 13px;
	}
	.evidence-list article > a > span {
		font-size: 10px;
		color: var(--muted);
	}
	.evidence-list article > a > strong {
		font-size: 15px;
		flex: 1;
		line-height: 1.6;
	}
	.evidence-badges {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin: 15px 0 0 37px;
	}
	.evidence-badges span {
		font-size: 10px;
		border-radius: 6px;
		padding: 5px 8px;
		background: #f2f4ed;
		color: #67735e;
	}
	.evidence-badges span.done {
		background: #e3efda;
		color: #3a5e2c;
	}
	.evidence-list details {
		border-top: 1px solid var(--line);
		margin-top: 19px;
		padding-top: 15px;
	}
	.evidence-list summary {
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
	}
	.saved-response {
		padding: 20px;
		background: #fffdf5;
		border-radius: 10px;
		margin-top: 15px;
	}
	.saved-response h3 {
		font-size: 11px;
		text-transform: capitalize;
		color: var(--muted);
		margin-bottom: 12px;
	}
	.saved-response p {
		white-space: pre-wrap;
		font-size: 14px;
		line-height: 1.85;
		overflow-wrap: anywhere;
	}
	.bookmarks {
		margin-top: 40px;
	}
	.bookmarks > a {
		display: flex;
		gap: 13px;
		align-items: center;
		padding: 19px;
		background: #f0edf7;
		border-radius: 10px;
		margin-top: 9px;
		font-size: 13px;
	}
	.bookmarks > p {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.8;
	}
	.legacy-record {
		margin-top: 40px;
		border: 1px solid var(--line);
		border-radius: 15px;
		padding: 25px;
		background: #f5f6f1;
	}
	.legacy-record > summary {
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	.legacy-record p {
		font-size: 13px;
		line-height: 1.85;
		margin: 18px 0;
		color: var(--muted);
	}
	.legacy-record article {
		padding: 20px;
		background: white;
		border-radius: 10px;
		margin: 15px 0;
	}
	.legacy-record h3 {
		font-size: 16px;
	}
	.legacy-note {
		white-space: pre-wrap;
	}
	.upgrade,
	.legacy-record > a {
		font-size: 12px;
		text-decoration: underline;
	}
	@media (max-width: 850px) {
		.evidence-stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 600px) {
		.record-controls {
			padding: 22px;
			gap: 13px;
		}
		.evidence-stats {
			gap: 10px;
		}
		.evidence-stats > div {
			padding: 20px;
		}
		.evidence-list > article {
			padding: 20px;
		}
		.evidence-badges {
			margin-left: 0;
		}
	}
</style>
