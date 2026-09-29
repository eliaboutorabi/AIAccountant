<script lang="ts">
	import { sources } from '$lib/data/resources';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head
	><title>Sources & learning notes · AI Accountant</title><meta
		name="description"
		content="Primary sources, learning methodology, accessibility and privacy notes for the AI Accountant course."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">CURIOSITY LIKES GOOD SOURCES</p>
		<h1>Keep following the thread.</h1>
		<p>
			The course translates big ideas into everyday language. These primary sources let you go
			deeper, check the foundations, and explore what’s changing.
		</p>
	</div>
	<div class="source-note">
		<Icon name="book" size={18} /><span
			>Sources reviewed September 28, 2026. Products and capabilities evolve; check current vendor
			documentation before implementation.</span
		>
	</div>
	<div class="resources-grid">
		{#each Object.entries(sources) as [id, source] (id)}<a
				class="resource-card"
				href={source.url}
				target="_blank"
				rel="external noreferrer"
				><div>
					<span class="micro-label">{source.publisher}</span><Icon name="external" size={16} />
				</div>
				<h2>{source.title}</h2>
				<p>{source.note}</p>
				<span class="text-link">Follow your curiosity<Icon name="arrow" size={14} /></span></a
			>{/each}
	</div>
	<section class="page-section">
		<h2>A few things about this little learning space.</h2>
		<div class="resource-details">
			<details class="disclosure" open>
				<summary>How the course is designed<Icon name="down" size={17} /></summary>
				<p>
					Each of the 36 lessons builds intuition, connects it to a fictional finance scenario,
					offers an accounting refresher, addresses a misconception, and asks two retrieval-practice
					questions. Three portfolio briefs and 18 interview scenarios support transfer to work. No
					equations are required for the main course. Technical careers also require deeper
					statistics, coding, and supervised domain practice. Completion is a personal learning
					milestone, not an accredited qualification or a guarantee of interview performance.
				</p>
			</details>
			<details class="disclosure">
				<summary>Your privacy and progress<Icon name="down" size={17} /></summary>
				<p>
					There is no account, analytics script, advertising, or AI API call in this course. Quiz
					answers, completion, saved lessons, and lesson notes are stored in this browser’s local
					storage. Other people using the same browser profile can see them. Clearing browser data
					removes them; export a backup on the progress page. If storage is blocked, learning still
					works for the current visit. The interview scratchpad clears when you change questions.
					GitHub Pages serves the website and may process standard hosting request information.
					External source links follow their own privacy policies.
				</p>
			</details>
			<details class="disclosure">
				<summary>Accounting examples and scope<Icon name="down" size={17} /></summary>
				<p>
					Willow & Co. and all financial fixtures are fictional. Examples introduce general
					concepts; they do not establish accounting treatment for a real transaction or replace
					applicable standards, jurisdiction-specific requirements, or professional judgment.
					Monetary amounts, dates, thresholds, and error costs are teaching assumptions. Future AI
					applications are explicitly framed as scenarios rather than assured predictions.
				</p>
			</details>
			<details class="disclosure">
				<summary>Accessible by design<Icon name="down" size={17} /></summary>
				<p>
					Lessons have text explanations alongside diagrams and images. Quizzes and lab controls
					work with a keyboard. The 3D lab honors reduced-motion preferences, offers a pause
					control, and keeps its numerical explanation available without WebGL. All learning content
					is open from the beginning; no timer or streak limits access. If a visual analogy doesn’t
					help you, the plain-language description remains the foundation.
				</p>
			</details>
			<details class="disclosure">
				<summary>Artwork and teaching simulations<Icon name="down" size={17} /></summary>
				<p>
					The miniature worlds were created for this project with image generation. The neural
					network is rendered with Three.js and uses hand-set weights. The fitting, forecasting, and
					classification labs compute real results on tiny fictional fixtures. The prompt workshop
					assembles a template, and interview review is self-assessment. None of these features runs
					a live AI model or makes a real financial prediction.
				</p>
			</details>
		</div>
	</section>
</div>

<style>
	.source-note {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 17px 20px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: #f3f5ed;
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted);
		margin-bottom: 25px;
	}
	.resources-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
	}
	.resource-card {
		border: 1px solid var(--line);
		background: #fff;
		border-radius: 14px;
		padding: 25px;
		display: flex;
		flex-direction: column;
	}
	.resource-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px #234b2310;
	}
	.resource-card > div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #5f6752;
	}
	.resource-card h2 {
		font-size: 18px;
		letter-spacing: -0.5px;
		line-height: 1.6;
		margin: 16px 0 12px;
	}
	.resource-card > p {
		font-size: 12px;
		line-height: 1.9;
		color: var(--muted);
		margin-bottom: 22px;
	}
	.resource-card > .text-link {
		margin-top: auto;
	}
	.resource-details {
		display: flex;
		flex-direction: column;
		gap: 13px;
	}
	@media (max-width: 740px) {
		.resources-grid {
			grid-template-columns: 1fr;
		}
		.source-note {
			font-size: 10px;
		}
		.resource-card {
			padding: 22px;
		}
	}
</style>
