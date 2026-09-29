<script lang="ts">
	import type { CourseModule, Check } from '../types';
	import { useBook } from '../progress.svelte';
	import { checkGuidance, status } from '../index';
	import { transferChecks, transferSections } from '../transfer';
	import RichText from './RichText.svelte';
	import Notebook from './Notebook.svelte';
	import Icon from '$lib/components/Icon.svelte';
	let { module }: { module: CourseModule } = $props();
	const instance = $props.id();
	const book = useBook();
	let drafts = $state<Record<string, number>>({});
	const record = $derived(book.get(module.id));
	const summary = $derived(status(module, record));
	const transfer = $derived(transferChecks.find((check) => check.moduleId === module.id));
	const optionName = (index: number) => `Option ${String.fromCharCode(65 + index)}`;
	function chosen(check: Check) {
		return drafts[check.id] ?? record.answers[check.id];
	}
	function submit(check: Check) {
		const value = chosen(check);
		if (Number.isInteger(value) && value >= 0 && value < check.options.length)
			book.answer(module.id, check.id, value);
	}
</script>

{#snippet question(check: Check, ordinal: string, sectionId?: string)}
	{@const history = record.checkHistory?.[check.id]}
	{@const first = history?.attempts[0]}
	{@const help = checkGuidance(module, check, sectionId)}
	{@const current = record.answers[check.id]}
	{@const currentValid = current !== undefined && current < check.options.length}
	{@const hintOne = history?.hints.some((hint) => hint.level === 1)}
	{@const hintTwo = history?.hints.some((hint) => hint.level === 2)}
	{@const solutionSeen = history?.reveals.some((reveal) => reveal.kind === 'solution')}
	<fieldset>
		<legend><span>{ordinal}</span>{check.prompt}</legend>
		<div class="hint-controls">
			{#if !hintOne}<button class="hint-button" onclick={() => book.hint(module.id, check.id, 1)}
					><Icon name="sparkles" size={14} />Hint 1 · locate the idea</button
				>{/if}{#if hintOne && !hintTwo}<button
					class="hint-button"
					onclick={() => book.hint(module.id, check.id, 2)}>Hint 2 · plan your reasoning</button
				>{/if}<span>Hints remain in your practice record.</span>
		</div>
		{#if hintOne}<div class="hint">
				<strong>Start with the learning objective.</strong>
				<p>{help.objective}</p>
				{#if help.section}<a href={`#${help.section.id}`}
						>Revisit: {help.section.title} <span aria-hidden="true">↗</span></a
					>{/if}
			</div>{/if}
		{#if hintTwo}<div class="hint">
				<strong>Build a reason before choosing a letter.</strong>
				<p>{help.strategy}</p>
				<p>
					Try to explain why each alternative fails under the stated conditions. The hint does not
					select an answer for you.
				</p>
			</div>{/if}
		<div class="options">
			{#each check.options as option, j (j)}<label class:selected={chosen(check) === j}
					><input
						type="radio"
						name={`${instance}-${module.id}-${check.id}`}
						value={j}
						checked={chosen(check) === j}
						onchange={() => (drafts[check.id] = j)}
					/><span><small>{optionName(j)}</small>{option}</span></label
				>{/each}
		</div>
		<div class="submit-row">
			<button
				class="check-button"
				onclick={() => submit(check)}
				disabled={chosen(check) === undefined || chosen(check) === current}
				>{currentValid ? 'Check revised answer' : 'Check my answer'}</button
			>{#if chosen(check) !== undefined && chosen(check) !== current}<span
					>Your selection is a draft until you check it.</span
				>{/if}
		</div>
		{#if first || history?.legacyAnswer !== undefined || hintOne || solutionSeen}<div
				class="attempt-evidence"
				aria-label={`Practice evidence for ${check.id}`}
			>
				{#if first}<p>
						<strong>First recorded answer:</strong>
						{optionName(first.answer)} · {first.answer === check.answer
							? 'correct'
							: 'not correct'}. {first.hints.length
							? `${first.hints.length} hint level${first.hints.length === 1 ? '' : 's'} used before this attempt.`
							: 'No hints recorded before this attempt.'}{first.priorFeedback
							? ' Earlier feedback had been viewed.'
							: ''}{first.priorSolution ? ' The solution had already been opened.' : ''}
					</p>{/if}
				{#if history?.legacyAnswer !== undefined}<p>
						An earlier saved answer exists. Its original attempt and help history were not recorded;
						this is not evidence of an unaided first attempt.
					</p>{/if}
				{#if first?.priorHistoryUnknown || history?.merged}<p>
						This record includes earlier or merged activity with incomplete context. Timestamps come
						from the learner’s devices.
					</p>{/if}
				<div class="evidence-tags">
					<span
						>{history?.attempts.length ?? 0}
						{history?.trimmed ? 'retained' : 'recorded'} attempts</span
					><span>{history?.hints.length ?? 0}/2 hint levels used</span>{#if solutionSeen}<span
							class="revealed">Solution opened</span
						>{/if}
				</div>
				{#if history?.trimmed}<p>
						To keep browser storage bounded, the first attempt and the latest 199 attempts are
						retained.
					</p>{/if}
				{#if (history?.attempts.length ?? 0) > 1}<details class="attempt-list">
						<summary>Compare the recorded attempts</summary>
						<ol>
							{#each history?.attempts ?? [] as attempt (attempt.id)}<li>
									<strong>{optionName(attempt.answer)}</strong> · {attempt.answer === check.answer
										? 'correct'
										: 'not correct'} · {attempt.hints.length} hint levels{attempt.priorFeedback
										? ' · after feedback'
										: ''}{attempt.priorSolution
										? ' · after solution reveal'
										: ''}{attempt.priorHistoryUnknown ? ' · prior history unknown' : ''}
								</li>{/each}
						</ol>
					</details>{/if}
			</div>{/if}
		{#if currentValid}<div
				class="feedback"
				class:correct={current === check.answer}
				aria-live="polite"
			>
				<strong
					>{current === check.answer
						? 'Your submitted answer is correct.'
						: 'Revisit the distinction.'}</strong
				>
				<p class="submitted">
					Current submitted answer: {optionName(current)}{chosen(check) !== current
						? ' · You have an unchecked revision.'
						: ''}
				</p>
				<p><RichText text={check.rationales[current]} /></p>
				<details
					ontoggle={(event) => {
						if (event.currentTarget.open) book.revealCheck(module.id, check.id);
					}}
				>
					<summary>Reason through every option · records a solution reveal</summary
					>{#each check.options as option, j (j)}<div>
							<strong>{j === check.answer ? '✓ ' : ''}{optionName(j)}: {option}</strong>
							<p><RichText text={check.rationales[j]} /></p>
						</div>{/each}
				</details>
			</div>{/if}
	</fieldset>
{/snippet}

{#snippet writtenEvidence(field: string)}
	{@const history = record.writtenHistory?.[field]}
	<div class="written-evidence">
		{#if !history?.first}<button
				class="snapshot-button"
				onclick={() => book.captureResponse(module.id, field)}
				disabled={!record.responses[field]?.trim()}>Save first response for comparison</button
			>
			<p>
				Your current draft keeps saving as you edit. Save a first response when it expresses your
				reasoning; later corrections stay separate.
			</p>{:else}<p>
				<Icon name="file" size={15} /><strong>First response preserved.</strong>
				{history.first.trigger === 'before-solution'
					? 'Captured when you first opened the worked answer.'
					: 'Saved before later edits.'}
			</p>
			<details>
				<summary>Compare with your first saved response</summary>
				<p class="saved-writing">
					{history.first.text.trim()
						? history.first.text
						: 'No written response was present when this snapshot was recorded.'}
				</p>
			</details>{/if}
		{#if history?.reveals.length}<p class="reveal-note">
				Worked answer opened. This remains assisted practice after you revise your response or tick
				the rubric.
			</p>{/if}
		{#if history?.legacyResponse !== undefined || history?.first?.priorHistoryUnknown}<p>
				An earlier saved draft has unknown attempt and assistance history.
			</p>{/if}
		{#if history?.merged}<p>
				Multiple saved histories were merged; the earliest recorded snapshot is shown using device
				timestamps.
			</p>{/if}
	</div>
{/snippet}

<section id="knowledge-check" class="assessment">
	<p class="eyebrow">RETRIEVE · REASON · TRANSFER</p>
	<h2>Put your understanding to work.</h2>
	<p class="intro">
		Choose an answer, then check it to see the feedback. Use a hint when you need one. Revisions are
		welcome: your first recorded attempt and the help you used stay visible.
	</p>
	<div class="score">
		<Icon name="check" size={19} />
		<div>
			<strong>{summary.checksCorrect} of {module.checks.length} checks currently correct</strong
			><span
				>{summary.firstAttemptCorrect} correct across {summary.firstAttemptTracked} first recorded attempts
				· {summary.checksWithHints} checks with hints · {summary.checksWithSolutions} solutions opened</span
			>
		</div>
	</div>
	<p class="small-text">
		These are practice records, not a proctored examination. A corrected answer, opened explanation
		or completed text field does not establish independent mastery.
	</p>
	{#each module.checks as check, i (check.id)}{@render question(
			check,
			String(i + 1).padStart(2, '0')
		)}{/each}
</section>
{#if transfer}<section id="transfer-check" class="transfer-check">
		<p class="eyebrow">A CHANGED CASE · SEPARATE EVIDENCE</p>
		<h2>Use the idea in a different situation.</h2>
		<p class="intro">
			Apply the mechanism to a new set of conditions. This case is recorded separately from the
			module’s {module.checks.length} checks. It becomes familiar practice once its feedback or solution
			has been seen.
		</p>
		{@render question(transfer, 'T', transferSections[module.id])}
	</section>{/if}
<section id="assignment" class="assignment">
	<p class="eyebrow">YOUR ENGAGEMENT NOTE</p>
	<h2>{module.assignment.title}</h2>
	<p class="intro"><RichText text={module.assignment.scenario} /></p>
	<ol>
		{#each module.assignment.tasks as text, i (i)}<li><RichText {text} /></li>{/each}
	</ol>
	<div class="deliverable">
		<strong>What to produce</strong>
		<p>{module.assignment.deliverable}</p>
	</div>
	<Notebook
		moduleId={module.id}
		field="assignment"
		label="Your case response"
		hint="Write your answer before opening the solution. Include calculations, assumptions, supporting record IDs, and what the evidence cannot establish."
		rows={12}
	/>
	{@render writtenEvidence('assignment')}
	<details
		class="solution"
		ontoggle={(event) => {
			if (event.currentTarget.open) book.revealWritten(module.id, 'assignment');
		}}
	>
		<summary>Study the complete worked solution · records assistance</summary
		>{#each module.assignment.workedSolution as text, i (i)}<p><RichText {text} /></p>{/each}
	</details>
	<h3>Assess your evidence</h3>
	<p class="small-text">
		This is self-assessment, not external grading. Check a criterion only when you can point to the
		evidence in your response. The rubric records your judgment; it does not erase earlier help or
		assess your writing automatically.
	</p>
	<div class="rubric">
		{#each module.assignment.rubric as item, i (i)}<label
				><input
					type="checkbox"
					checked={record.rubric.includes(String(i))}
					onchange={() => book.toggle(module.id, 'rubric', String(i))}
				/><span><strong>{item.criterion}</strong><span>{item.evidence}</span></span></label
			>{/each}
	</div>
</section>
<section id="interview" class="interview">
	<p class="eyebrow">EXPLAIN IT IN A BUSINESS CONVERSATION</p>
	<h2>{module.interview.question}</h2>
	<Notebook
		moduleId={module.id}
		field="interview"
		label="Your two-minute answer"
		hint="Lead with a decision, explain the mechanism, use evidence, and name the limitation."
	/>{@render writtenEvidence('interview')}
	<details
		ontoggle={(event) => {
			if (event.currentTarget.open) book.revealWritten(module.id, 'interview');
		}}
	>
		<summary>What a strong answer covers · records assistance</summary
		>{#each module.interview.strongAnswer as text, i (i)}<p><RichText {text} /></p>{/each}
	</details>
	<h3>Now handle the follow-up.</h3>
	{#each module.interview.followUps as follow, i (i)}<div class="follow-up">
			<Notebook
				moduleId={module.id}
				field={`followup-${i}`}
				label={follow.question}
				rows={3}
			/>{@render writtenEvidence(`followup-${i}`)}
			<details
				ontoggle={(event) => {
					if (event.currentTarget.open) book.revealWritten(module.id, `followup-${i}`);
				}}
			>
				<summary>Compare your reasoning · records assistance</summary>
				<p><RichText text={follow.answer} /></p>
			</details>
		</div>{/each}
</section>

<style>
	section {
		scroll-margin-top: 95px;
		margin-top: 65px;
		padding-top: 45px;
		border-top: 1px solid var(--line);
		min-width: 0;
	}
	h2 {
		font-size: 29px;
		line-height: 1.4;
		margin: 12px 0 20px;
	}
	h3 {
		font-size: 20px;
		margin: 30px 0 12px;
	}
	.intro,
	li {
		font-size: 16px;
		line-height: 1.85;
	}
	.score {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 18px;
		background: var(--mint);
		border-radius: 12px;
		margin: 25px 0 15px;
		font-size: 14px;
	}
	.score > div {
		display: grid;
		gap: 8px;
	}
	.score span {
		font-size: 11px;
		line-height: 1.7;
		font-weight: 500;
		color: #52654e;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 38px 0 0;
		min-width: 0;
	}
	legend {
		font-size: 17px;
		line-height: 1.7;
		font-weight: 700;
		display: flex;
		gap: 12px;
		margin-bottom: 15px;
	}
	legend > span {
		color: #52664b;
		font-size: 12px;
	}
	.options {
		display: grid;
		gap: 9px;
	}
	.options label {
		border: 1px solid #dfe5d9;
		border-radius: 11px;
		padding: 16px;
		display: flex;
		gap: 12px;
		background: white;
		line-height: 1.6;
		cursor: pointer;
	}
	.options label.selected {
		border-color: #809c7b;
		background: #f0f4ea;
	}
	.options small {
		display: block;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.07em;
		color: #64735f;
		margin-bottom: 4px;
	}
	input {
		accent-color: var(--green);
		flex-shrink: 0;
		margin-top: 5px;
	}
	.feedback {
		margin-top: 14px;
		padding: 22px;
		border: 1px solid #ead8ba;
		border-radius: 12px;
		background: #fff6e8;
	}
	.feedback.correct {
		background: #edf4e8;
		border-color: #d9e5cd;
	}
	.feedback p,
	details p {
		font-size: 15px;
		line-height: 1.8;
		margin: 14px 0;
	}
	.feedback .submitted {
		font-size: 12px;
		margin: 10px 0;
	}
	.feedback details {
		border: 0;
		background: transparent;
		padding: 14px 0 0;
	}
	.feedback details > div {
		margin-top: 20px;
	}
	.feedback details > div strong {
		font-size: 14px;
	}
	.assignment ol {
		padding-left: 22px;
		display: grid;
		gap: 15px;
	}
	.deliverable {
		padding: 23px;
		background: #eeedf7;
		border-radius: 14px;
		margin-top: 26px;
	}
	.deliverable p {
		margin-top: 10px;
		line-height: 1.7;
	}
	details {
		padding: 20px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: #fff;
	}
	summary {
		font-weight: 700;
		cursor: pointer;
		font-size: 14px;
		line-height: 1.6;
	}
	.rubric {
		display: grid;
		gap: 12px;
		margin-top: 20px;
	}
	.rubric label {
		display: flex;
		gap: 14px;
		cursor: pointer;
		padding: 19px;
		background: #f4f6ef;
		border-radius: 10px;
	}
	.rubric label span span {
		display: block;
		font-size: 14px;
		line-height: 1.7;
		margin-top: 5px;
	}
	.follow-up {
		margin: 30px 0;
	}
	.small-text {
		line-height: 1.8;
		color: var(--muted);
		font-size: 13px;
	}
	.hint-controls {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.hint-controls > span,
	.submit-row > span {
		font-size: 11px;
		color: var(--muted);
		line-height: 1.7;
	}
	button {
		border: 1px solid #d8dfd1;
		border-radius: 8px;
		padding: 10px 13px;
		font-size: 12px;
		min-height: 40px;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: #fff;
		line-height: 1.6;
	}
	.hint-button {
		background: #f0edf6;
		color: #5f4c79;
		border-color: #e1daeb;
	}
	.hint {
		background: #f3eff8;
		border-left: 3px solid #b4a0c8;
		border-radius: 0 9px 9px 0;
		padding: 15px 17px;
		margin-bottom: 14px;
		font-size: 13px;
		line-height: 1.85;
	}
	.hint p {
		margin: 7px 0;
	}
	.hint a {
		color: #59416f;
		text-decoration: underline;
		text-underline-offset: 3px;
		font-size: 12px;
	}
	.submit-row {
		display: flex;
		align-items: center;
		gap: 13px;
		flex-wrap: wrap;
		margin-top: 15px;
	}
	.check-button {
		background: #304e35;
		border-color: #304e35;
		color: #fff;
		font-weight: 650;
	}
	.attempt-evidence {
		margin-top: 15px;
		padding: 15px 17px;
		border: 1px solid #e4dfcf;
		background: #faf6ec;
		border-radius: 11px;
	}
	.attempt-evidence p {
		font-size: 12px;
		line-height: 1.8;
		margin-bottom: 9px;
	}
	.evidence-tags {
		display: flex;
		gap: 7px;
		flex-wrap: wrap;
	}
	.evidence-tags span {
		padding: 5px 8px;
		background: #fff;
		border: 1px solid #e6e1d5;
		border-radius: 5px;
		font-size: 10px;
	}
	.evidence-tags .revealed {
		color: #6b4d7e;
		background: #eee7f6;
		border-color: #dfd1ec;
	}
	.attempt-evidence details {
		margin-top: 12px;
		padding: 12px;
		background: transparent;
	}
	.attempt-list li {
		font-size: 12px;
	}
	.attempt-list ol {
		padding-left: 20px;
		margin-top: 10px;
	}
	.written-evidence {
		margin: 0 0 20px;
	}
	.written-evidence > p {
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
		margin: 10px 0;
		display: flex;
		gap: 6px;
		align-items: center;
		flex-wrap: wrap;
	}
	.written-evidence .reveal-note {
		color: #684c78;
		background: #f0eaf6;
		padding: 11px 14px;
		border-radius: 8px;
		display: block;
	}
	.written-evidence .saved-writing {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.written-evidence details {
		margin: 12px 0;
	}
	.snapshot-button {
		background: #f5f1e7;
	}
	.transfer-check {
		background: #f2f4ed;
		padding: 28px;
		border: 1px solid #dde5d5;
		border-radius: 16px;
	}
	.transfer-check h2 {
		font-size: 25px;
	}
	.transfer-check fieldset {
		margin-top: 25px;
	}
	@media (max-width: 600px) {
		h2 {
			font-size: 25px;
		}
		legend {
			font-size: 16px;
		}
		.options label {
			padding: 13px;
			font-size: 14px;
		}
		.feedback {
			padding: 17px;
		}
		.hint-controls {
			gap: 8px;
		}
		.transfer-check {
			padding: 20px;
		}
		.score {
			align-items: flex-start;
		}
		.written-evidence > p {
			display: block;
		}
		.written-evidence > p :global(svg) {
			vertical-align: middle;
			margin-right: 5px;
		}
		.hint {
			padding: 13px;
		}
		.attempt-evidence {
			padding: 13px;
		}
		.submit-row {
			gap: 8px;
		}
	}
</style>
