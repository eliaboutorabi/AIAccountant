<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { projects } from '$lib/data/projects';
	import { lessonPath } from '$lib/data/course';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head
	><title>Portfolio projects · AI Accountant</title><meta
		name="description"
		content="Build a cash forecast, a reconciliation pipeline, and a controlled finance agent with downloadable fictional data, project briefs, and review criteria."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">MAKE YOUR LEARNING TANGIBLE</p>
		<h1>Something you can point to<br />and say, “I built that.”</h1>
		<p>
			Three practical projects, from a first forecast to a controlled finance assistant. Download
			the materials, build at your pace, and make your thinking visible.
		</p>
	</div>
	{#each projects as project, i (project.id)}<section class="project panel" id={project.id}>
			<div class="project-head">
				<div>
					<span class="micro-label">PROJECT 0{i + 1} · {project.level}</span>
					<h2>{project.title}</h2>
					<p>{project.subtitle}</p>
					<div class="project-tags">
						<span class="tag"><Icon name="clock" size={13} />{project.time}</span><span class="tag"
							>{project.tools}</span
						>
					</div>
				</div>
				<img
					src={asset(`/images/${project.image}.webp`)}
					alt=""
					width="960"
					height="640"
					loading="lazy"
				/>
			</div>
			<div class="project-outcome">
				<Icon name="folder" size={20} />
				<div>
					<strong>You’ll come away with</strong>
					<p>{project.outcome}</p>
				</div>
			</div>
			<div class="project-steps">
				{#each project.steps as step, si (step.title)}<div>
						<span class="step-number">0{si + 1}</span>
						<div>
							<h3>{step.title}</h3>
							<p>{step.body}</p>
						</div>
					</div>{/each}
			</div>
			<details class="disclosure">
				<summary
					><Icon name="list" size={18} />Your definition of “done”<Icon
						name="down"
						size={16}
					/></summary
				>
				<ul class="plain-list">
					{#each project.rubric as item (item)}<li><Icon name="check" size={16} />{item}</li>{/each}
				</ul>
				<p class="stretch"><strong>A little further:</strong> {project.stretch}</p>
			</details>
			<div class="project-downloads">
				<a class="button primary" href={asset(`/data/${project.download}`)} download
					><Icon name="download" size={16} />Project brief</a
				><a class="button secondary" href={asset(`/data/${project.data}`)} download
					><Icon name="download" size={16} />{project.data.endsWith('.csv')
						? 'Sample data'
						: 'Evaluation cases'}</a
				><a class="text-link" href={resolve(lessonPath(project.chapter))}
					>Brush up on the ideas<Icon name="arrow" size={15} /></a
				>
			</div>
			{#if project.id === 'reconcile'}<div class="support-files">
					<span>Also in your toolkit:</span><a href={asset('/data/payments.csv')} download
						>payments.csv</a
					><a href={asset('/data/expected-controls.json')} download>expected-controls.json</a><a
						href={asset('/data/reconciliation-starter.mjs')}
						download>Runnable starter</a
					>
				</div>{/if}
		</section>{/each}
	<div class="callout">
		<Icon name="shield" />
		<div>
			<strong>A safe place to practice.</strong>All datasets are fictional, deliberately small
			teaching fixtures. Use the capstone brief’s evaluation criteria to check your work. They are
			not representative production datasets or professional certification assessments.
		</div>
	</div>
</div>

<style>
	.project {
		margin-bottom: 28px;
		scroll-margin-top: 20px;
		overflow: hidden;
	}
	.project-head {
		display: flex;
		justify-content: space-between;
		gap: 25px;
		align-items: center;
	}
	.project-head > div {
		flex: 1;
	}
	.project-head h2 {
		font-size: 29px;
		margin: 13px 0;
		line-height: 1.4;
	}
	.project-head > div > p {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.8;
	}
	.project-head img {
		width: 210px;
		height: 165px;
		object-fit: cover;
		border-radius: 12px;
	}
	.project-tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin: 17px 0;
	}
	.project-tags .tag {
		font-size: 8px;
	}
	.project-outcome {
		display: flex;
		gap: 13px;
		align-items: center;
		padding: 19px 22px;
		background: #f0f3e8;
		border-radius: 12px;
		margin: 23px 0;
	}
	.project-outcome strong {
		font-size: 12px;
	}
	.project-outcome p {
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
		margin-top: 5px;
	}
	.project-steps {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 25px;
		margin: 29px 0;
	}
	.project-steps > div {
		display: flex;
		gap: 13px;
	}
	.step-number {
		width: 27px;
		height: 27px;
		background: #e8efdc;
		border-radius: 50%;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		color: #4f6d3d;
		font-size: 10px;
	}
	.project-steps h3 {
		font-size: 14px;
		margin: 3px 0 9px;
	}
	.project-steps p {
		font-size: 12px;
		line-height: 1.95;
		color: var(--muted);
	}
	.project-downloads {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 24px;
	}
	.project-downloads > .text-link {
		margin-left: auto;
	}
	.support-files {
		display: flex;
		flex-wrap: wrap;
		gap: 13px;
		font-size: 10px;
		margin-top: 21px;
		color: #5c694a;
	}
	.support-files a {
		text-decoration: underline;
	}
	.stretch {
		padding-top: 12px !important;
	}
	.plain-list {
		margin-bottom: 8px;
	}
	@media (max-width: 1050px) {
		.project-head h2 {
			font-size: 24px;
		}
		.project-head img {
			width: 150px;
			height: 150px;
		}
		.project-downloads > .text-link {
			width: 100%;
			margin-left: 0;
			margin-top: 7px;
		}
	}
	@media (max-width: 740px) {
		.project-head {
			flex-direction: column-reverse;
			align-items: stretch;
			gap: 22px;
		}
		.project-head img {
			width: 100%;
			height: 180px;
		}
		.project-head h2 {
			font-size: 25px;
		}
		.project-steps {
			grid-template-columns: 1fr;
		}
		.project-downloads .button {
			font-size: 10px;
		}
		.project-outcome {
			padding: 17px;
		}
		.project-outcome p {
			font-size: 11px;
		}
	}
</style>
