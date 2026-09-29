<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { modules } from '$lib/course';
	import { useBook } from '$lib/course/progress.svelte';
	import Notebook from '$lib/course/components/Notebook.svelte';
	import RichText from '$lib/course/components/RichText.svelte';
	import Icon from '$lib/components/Icon.svelte';
	const book = useBook();
	let selectedId = $state('M01'),
		day = $state(0),
		running = $state(false),
		seconds = $state(120);
	let timer: ReturnType<typeof setInterval> | undefined;
	const selected = $derived(modules.find((m) => m.id === selectedId) ?? modules[0]);
	const candidates = $derived(modules.filter((m) => day === 0 || m.day === day));
	function select(id: string) {
		selectedId = id;
		running = false;
		seconds = 120;
	}
	function filter() {
		const first = modules.find((m) => day === 0 || m.day === day);
		if (first) select(first.id);
	}
	onMount(() => {
		timer = setInterval(() => {
			if (running && seconds > 0) seconds -= 1;
			else if (seconds === 0) running = false;
		}, 1000);
		return () => clearInterval(timer);
	});
</script>

<svelte:head
	><title>Interview studio · AI Accountant</title><meta
		name="description"
		content="Practice 35 professional AI and finance interview defenses, changed-constraint follow-ups, worked case exhibits, and evidence-based self-assessment."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">EXPLAIN THE MECHANISM. DEFEND THE DECISION.</p>
		<h1>Bring evidence<br />to the conversation.</h1>
		<p>
			Practice a clear two-minute answer, then handle the follow-up. Use a worked case to show that
			your knowledge survives a change in the numbers or constraints.
		</p>
	</div>
	<div class="interview-setup">
		<div>
			<Icon name="mic" size={27} />
			<p>
				<strong>A strong answer connects four things.</strong><br />The business decision, the
				mechanism, the evidence, and the limitation. Answer aloud before reading the model response.
			</p>
		</div>
		<label
			>Focus area<select bind:value={day} onchange={filter}
				><option value={0}>All {modules.length} modules</option><option value={1}
					>Day 1 · data & learning</option
				><option value={2}>Day 2 · models & analysis</option><option value={3}
					>Day 3 · LLMs & evidence</option
				><option value={4}>Day 4 · applications & agents</option><option value={5}
					>Day 5 · delivery & defense</option
				><option value={6}>Day 6 · document & agent engineering</option><option value={7}
					>Day 7 · evidence, voice & delivery</option
				></select
			></label
		>
	</div>
	<div class="interview-layout">
		<nav aria-label="Interview topics">
			{#each candidates as module (module.id)}<button
					class:active={selectedId === module.id}
					aria-pressed={selectedId === module.id}
					onclick={() => select(module.id)}
					><span>{module.id}</span><strong>{module.title}</strong>{#if book
						.get(module.id)
						.responses.interview?.trim()}<Icon name="check" size={13} />{/if}</button
				>{/each}
		</nav>
		<div class="interview-content">
			{#key selected.id}<article class="interview-card">
					<div class="question-meta">
						<span>DAY {selected.day} · {selected.id}</span>
						<div class="timer" aria-label="Optional practice timer">
							<span aria-live="off"
								>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span
							><button
								aria-label={running
									? 'Pause timer'
									: seconds > 0 && seconds < 120
										? 'Resume timer'
										: 'Start two-minute timer'}
								onclick={() => {
									if (seconds === 0) seconds = 120;
									running = !running;
								}}
								><Icon name={running ? 'pause' : 'timer'} size={15} />{running
									? 'Pause'
									: seconds > 0 && seconds < 120
										? 'Resume'
										: 'Start'}</button
							><button
								aria-label="Reset timer"
								onclick={() => {
									running = false;
									seconds = 120;
								}}><Icon name="reset" size={15} /></button
							>
						</div>
					</div>
					<h2>{selected.interview.question}</h2>
					<Notebook
						moduleId={selected.id}
						field="interview"
						label="Your answer, before the worked response"
						hint="Lead with your recommendation. Explain why, use a concrete example, and name what you would verify."
						rows={8}
					/>
					<details>
						<summary>Study a strong answer</summary
						>{#each selected.interview.strongAnswer as text, i (i)}<p><RichText {text} /></p>{/each}
					</details>
					<h3 class="follow-up-title">Now the interviewer changes the conditions.</h3>
					{#each selected.interview.followUps as item, i (i)}<div class="follow-up">
							<span class="eyebrow">FOLLOW-UP 0{i + 1}</span><Notebook
								moduleId={selected.id}
								field={`followup-${i}`}
								label={item.question}
								rows={4}
							/>
							<details>
								<summary>Compare the reasoning</summary>
								<p><RichText text={item.answer} /></p>
							</details>
						</div>{/each}
					<details class="case-exhibit">
						<summary>Work the case behind this answer</summary>
						<h3>{selected.assignment.title}</h3>
						<p><RichText text={selected.assignment.scenario} /></p>
						<ol>
							{#each selected.assignment.tasks as text, i (i)}<li><RichText {text} /></li>{/each}
						</ol>
						<p><strong>Deliverable:</strong> {selected.assignment.deliverable}</p>
						<a
							class="button secondary"
							href={resolve('/course/[slug]', { slug: selected.id.toLowerCase() })}
							>Study the records and complete the case <Icon name="arrow" size={15} /></a
						>
					</details>
					<div class="self-review">
						<h3>Before calling the answer ready</h3>
						<ul>
							<li>Could a colleague follow the mechanism without filling in missing steps?</li>
							<li>Did you state what evidence supports the claim and what remains unknown?</li>
							<li>Did you address the changed constraint rather than repeat your first answer?</li>
							<li>
								Could you show a calculation, record, or experiment supporting your recommendation?
							</li>
						</ul>
						<p>
							This is practice with worked guidance. There is no automatic AI grading or claim of
							interview certification.
						</p>
					</div>
					<a class="text-link" href={resolve('/course/[slug]', { slug: selected.id.toLowerCase() })}
						>Return to the complete lesson <Icon name="arrow" size={16} /></a
					>
				</article>{/key}
		</div>
	</div>
	<section class="role-note">
		<Icon name="graduation" size={27} />
		<div>
			<h2>Choose your next specialization.</h2>
			<p>
				Finance transformation emphasizes process, controls, economics, and stakeholder judgment.
				Analytics roles need stronger SQL, data modeling, and statistical validation. Data science
				and AI engineering roles need deeper mathematics, coding, evaluation, and deployment
				practice beyond this core.
			</p>
			<a class="text-link" href={resolve('/course/[slug]', { slug: 'm25' })}
				>Open the role pathways and defense rubric <Icon name="arrow" size={16} /></a
			>
		</div>
	</section>
</div>

<style>
	.interview-setup {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 25px;
		background: #f4eedf;
		border: 1px solid #e8dfc9;
		border-radius: 16px;
		padding: 25px;
		margin: 30px 0;
	}
	.interview-setup > div {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.interview-setup p {
		font-size: 13px;
		line-height: 1.8;
	}
	.interview-setup label {
		font-size: 11px;
		font-weight: 700;
		display: grid;
		gap: 8px;
		flex-shrink: 0;
	}
	.interview-setup select {
		padding: 10px;
		border: 1px solid #dfd7c1;
		border-radius: 8px;
		background: white;
		font-size: 12px;
	}
	.interview-layout {
		display: grid;
		grid-template-columns: 230px minmax(0, 1fr);
		gap: 25px;
	}
	.interview-layout > nav {
		display: grid;
		align-content: start;
		gap: 7px;
	}
	.interview-layout > nav button {
		display: flex;
		align-items: start;
		gap: 9px;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 9px;
		text-align: left;
		padding: 14px 12px;
	}
	.interview-layout > nav button.active {
		background: #eaf1e1;
		border-color: #afc29e;
	}
	.interview-layout > nav span {
		font-size: 9px;
		color: var(--muted);
		padding-top: 4px;
	}
	.interview-layout > nav strong {
		font-size: 11px;
		line-height: 1.7;
		flex: 1;
	}
	.interview-card {
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 18px;
		padding: 30px;
	}
	.question-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
	}
	.question-meta > span {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: #657b53;
	}
	.timer {
		display: flex;
		align-items: center;
		gap: 7px;
		background: #f3f1e9;
		border-radius: 8px;
		padding: 8px 10px;
	}
	.timer span {
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		margin-right: 5px;
	}
	.timer button {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-height: 32px;
		border: 0;
		background: transparent;
		padding: 3px;
		display: flex;
	}
	.interview-card h2 {
		font-size: 27px;
		letter-spacing: -0.5px;
		line-height: 1.5;
		margin: 22px 0;
	}
	.interview-card details {
		padding: 20px;
		border: 1px solid #dfdfd4;
		border-radius: 12px;
		background: #fafbf7;
	}
	.interview-card summary {
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	.interview-card details p,
	.interview-card details li {
		font-size: 14px;
		line-height: 1.85;
		margin-top: 16px;
	}
	.follow-up-title {
		font-size: 19px;
		margin: 35px 0 22px;
		line-height: 1.5;
	}
	.follow-up {
		border-top: 1px solid var(--line);
		padding-top: 25px;
		margin-top: 25px;
	}
	.case-exhibit {
		margin-top: 30px;
	}
	.case-exhibit h3 {
		font-size: 19px;
		margin-top: 23px;
	}
	.case-exhibit ol {
		padding-left: 20px;
	}
	.case-exhibit .button {
		font-size: 12px;
		margin-top: 20px;
	}
	.self-review {
		padding: 23px;
		background: #efedf7;
		border-radius: 13px;
		margin: 27px 0;
	}
	.self-review h3 {
		font-size: 16px;
	}
	.self-review ul {
		padding-left: 18px;
		font-size: 13px;
		line-height: 1.9;
	}
	.self-review p {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted);
		margin-top: 15px;
	}
	.role-note {
		display: flex;
		gap: 20px;
		padding: 28px;
		background: #edf2e5;
		border-radius: 16px;
		margin-top: 35px;
	}
	.role-note h2 {
		font-size: 22px;
		margin-bottom: 15px;
	}
	.role-note p {
		font-size: 14px;
		line-height: 1.85;
		color: var(--muted);
	}
	.role-note .text-link {
		margin-top: 18px;
		font-size: 12px;
	}
	@media (max-width: 1000px) {
		.interview-layout {
			grid-template-columns: 1fr;
		}
		.interview-layout > nav {
			grid-template-columns: repeat(3, 1fr);
			max-height: 230px;
			overflow: auto;
		}
		.interview-setup {
			flex-wrap: wrap;
		}
	}
	@media (max-width: 600px) {
		.interview-layout > nav {
			grid-template-columns: repeat(2, 1fr);
		}
		.interview-card {
			padding: 22px;
		}
		.interview-card h2 {
			font-size: 23px;
		}
		.interview-setup {
			padding: 22px;
		}
		.role-note {
			padding: 22px;
		}
		.question-meta {
			align-items: start;
		}
	}
</style>
