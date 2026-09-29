<script lang="ts">
	import { resolve } from '$app/paths';
	import { courseStats, modules } from '$lib/course';
	import SourceLink from '$lib/course/components/SourceLink.svelte';
	import Icon from '$lib/components/Icon.svelte';
	const sources = [
		...new Map(
			modules.flatMap((m) => m.sources.map((s) => [s.url, { ...s, module: m.id }] as const))
		).values()
	];
	let query = $state('');
	const filtered = $derived(
		sources.filter((s) => `${s.label} ${s.note ?? ''}`.toLowerCase().includes(query.toLowerCase()))
	);
	const credits = [
		{
			label: 'Three.js',
			url: 'https://github.com/mrdoob/three.js/blob/dev/LICENSE',
			note: 'MIT · actual trained-network geometry and activation rendering.'
		},
		{
			label: 'fast-formula-parser',
			url: 'https://github.com/LesterLyu/fast-formula-parser',
			note: 'MIT · bounded local spreadsheet formula evaluation.'
		},
		{
			label: 'gpt-tokenizer',
			url: 'https://github.com/niieani/gpt-tokenizer',
			note: 'MIT · real o200k_base tokenization.'
		},
		{
			label: 'Transformers.js',
			url: 'https://github.com/huggingface/transformers.js',
			note: 'Apache 2.0 · optional browser model inference.'
		},
		{
			label: 'Jaxverse',
			url: 'https://github.com/NeoVand/jaxverse',
			note: 'Inspiration for experiment-first teaching and inspectable model behavior. No source code or artwork copied.'
		},
		{
			label: 'Pattern',
			url: 'https://github.com/NeoVand/pattern',
			note: 'Inspiration for learning by changing a model and observing its behavior. This course uses original implementations.'
		}
	];
</script>

<svelte:head
	><title>Sources & course methods · AI Accountant</title><meta
		name="description"
		content="Primary research, technical documentation, educational methods, model provenance, and privacy for the expanded AI Accountant course."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">FOLLOW THE EVIDENCE</p>
		<h1>Understand the idea.<br />Inspect its foundations.</h1>
		<p>
			Research papers and official documentation support the teaching. Each chapter also explains
			why its sources matter, so a bibliography becomes a route into deeper study.
		</p>
	</div>
	<div class="callout">
		<Icon name="book" />
		<div>
			<strong>A living technical subject</strong>
			<p>
				Sources reviewed during the September 2026 rebuild. Historical claims and mechanisms are
				separated from changing product features. Check linked vendor documentation before using a
				feature in a real system.
			</p>
		</div>
	</div>
	<label class="search"
		>Search primary sources<input
			class="field"
			bind:value={query}
			placeholder="Attention, evaluation, accounting, Power BI…"
		/></label
	>
	<p class="micro-label">{filtered.length} REFERENCES</p>
	<div class="source-grid">
		{#each filtered as source (source.url)}<article class="source panel">
				<h2><SourceLink url={source.url}>{source.label}</SourceLink></h2>
				<p>{source.note ?? 'Primary reference for the linked chapter.'}</p>
				<a class="text-link" href={resolve('/course/[slug]', { slug: source.module.toLowerCase() })}
					>Read the chapter · {source.module} →</a
				>
			</article>{/each}
	</div>
	<section class="page-section">
		<p class="eyebrow">HOW TO READ THIS COURSE</p>
		<h2>Methods, provenance, and limits</h2>
		<div class="notes">
			<details class="disclosure" open>
				<summary>Depth, assessment, and the seven-day estimate</summary>
				<p>
					The course contains {courseStats.modules} substantive modules, worked finance cases, {courseStats.checks}
					module checks, cumulative reviews, changed-case practice, and portfolio assignments. Five foundation
					days lead into two application-building days. The {courseStats.hours}-hour schedule
					includes doing the guided work, recording evidence, and explaining decisions; independent
					builds take additional time. It is an authoring estimate; learner completion times have
					not yet been piloted. Written rubrics are self-assessment. Neither completion nor a quiz
					score is an accredited qualification or a promise of readiness for every role.
				</p>
				<p>
					The professional and novice reviews are independent agent reviews of the authored course,
					not human learner pilots. Use the diagnostic to locate your starting point and the role
					extensions to identify further practice.
				</p>
				<a class="text-link" href={resolve('/diagnostic/')}>Start with the diagnostic →</a>
			</details>
			<details class="disclosure">
				<summary>What actually runs in the browser</summary>
				<p>
					Regression, classification, neural-network learning, representation/transfer experiments,
					and tiny transformer training update real parameters. Forecasts, formulas, token IDs,
					retrieval scores, tool results, and workflow controls are computed from the displayed
					inputs. The 3D network visualizes the trained model; its tables are an equivalent
					numerical view.
				</p>
				<p>
					Document-extraction candidates, model-routing measurements, agent proposals, and some
					evaluation trials are authored fixtures and are labeled as such. The denoiser learns on
					two-dimensional points; it is not a full image diffusion model. The tiny transformer
					teaches mechanics and does not provide competent finance advice. An optional downloadable
					language model produces genuine local outputs on supported WebGPU hardware; failure
					remains visible rather than being replaced by an authored answer.
				</p>
				<p>
					The builder labs compute table expansion, typed values, evidence comparisons, execution
					controls, routing economics, and voice-session state from authored fixtures. They do not
					perform OCR, call paid providers, or record a microphone. The downloadable Node.js starter
					runs a real local HTTP service with exact-money reconciliation, durable operation
					receipts, and replayable server events. Its guide explains how to run and test it.
				</p>
			</details>
			<details class="disclosure">
				<summary>Progress, privacy, and downloads</summary>
				<p>
					The course has no login, advertising, analytics script, or embedded AI API key. Notes,
					check attempts, bookmarks, and lab state are stored locally in this browser. Other users
					of the same browser profile can see them. Export the course notebook and each lab's
					evidence before clearing storage. The original edition's notes remain accessible in the
					archive.
				</p>
				<p>
					Ordinary core exercises execute locally. Selecting the optional language-model download
					requests model files from Hugging Face and runtime assets from their configured hosts. Its
					instructions describe the model size before you opt in. Model inference then runs on your
					device; prompts are not sent to an AI API. GitHub Pages and external source/download hosts
					process normal network requests under their own policies.
				</p>
			</details>
			<details class="disclosure">
				<summary>Accounting and interview scope</summary>
				<p>
					Willow & Co. and all course datasets are fictional. Units, cutoffs, labels, thresholds,
					and loss assumptions are stated in each case. Accounting reminders teach the concepts
					needed for the exercise; they do not determine the treatment of a real transaction under a
					particular jurisdiction's standards. Future applications are scenarios to evaluate, not
					guaranteed predictions.
				</p>
				<p>
					The core develops reasoning across finance transformation, analytics, data science, and AI
					engineering. Professional fluency also requires deeper coding, statistics, domain
					practice, and supervised experience. The portfolio asks you to name the skills you
					demonstrated and the ones you still need to develop.
				</p>
			</details>
			<details class="disclosure">
				<summary>Accessibility and educational visuals</summary>
				<p>
					Lessons remain readable without 3D or WebGPU. Controls offer keyboard operation, and
					experiments provide text and tables alongside computed charts. No timer, streak, payment,
					or score locks a chapter. Hover definitions also open by touch or keyboard. Study at your
					own pace and take breaks outside the estimated activity time.
				</p>
				<p>
					The original chapter art now includes 35 generated teaching infographics. Their labels,
					arithmetic, and relationships are checked against the lessons. Each has a text companion
					and an enlarged view. Seventy native diagrams and seven inline interactive figures make
					mechanisms visible within the reading flow. Illustrative examples are labeled; model and
					financial measurements come from computations. Public case data and teaching prose are
					original.
				</p>
				<a class="button secondary" href={resolve('/visuals')}
					>Browse the visual atlas <Icon name="arrow" size={16} /></a
				>
			</details>
		</div>
	</section>
	<section class="page-section">
		<h2>Tools and inspiration</h2>
		<div class="source-grid">
			{#each credits as item (item.label)}<article class="source panel">
					<h3><SourceLink url={item.url}>{item.label}</SourceLink></h3>
					<p>{item.note}</p>
				</article>{/each}
		</div>
	</section>
</div>

<style>
	.search {
		display: grid;
		gap: 10px;
		margin: 30px 0 20px;
		font-weight: 700;
	}
	.source-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
		margin-top: 20px;
	}
	.source h2,
	.source h3 {
		font-size: 18px;
		line-height: 1.6;
	}
	.source p,
	.notes p {
		font-size: 14px;
		line-height: 1.9;
		color: var(--muted);
		margin: 14px 0;
	}
	.source {
		padding: 24px;
		overflow-wrap: anywhere;
	}
	.notes {
		display: grid;
		gap: 14px;
		margin-top: 20px;
	}
	.notes .text-link {
		display: inline-block;
		margin-top: 12px;
	}
	@media (max-width: 720px) {
		.source-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
