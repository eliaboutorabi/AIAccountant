<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { days } from '$lib/course/days';
	import { modules } from '$lib/course';
	import Icon from '$lib/components/Icon.svelte';
	import Notebook from '$lib/course/components/Notebook.svelte';
	const labs = ['generalization', 'spreadsheet', 'language-training', 'harness', 'capstone'];
	const checks = [
		[
			'Define one prediction or decision time and the information available then.',
			'Compare a rules baseline with a learned approach using independent evidence.',
			'Explain how review capacity and missed-case consequences affect the threshold.'
		],
		[
			'Reconcile formulas to source records and preserve units.',
			'Compare forecasts at the relevant horizon using only past information.',
			'Show how a join or filter changes the analytical population.'
		],
		[
			'Trace token IDs, representations, attention, and next-token selection without claiming human reasoning.',
			'Separate verified calculations, supported claims, and hypotheses in the memo.',
			'Record a real experiment and the limits of what its loss or output establishes.'
		],
		[
			'Identify the policy version and source passage supporting a claim.',
			'Show validated tool arguments, actual results, and a rejected request.',
			'Distinguish skill instructions from harness enforcement and demonstrate recovery.'
		],
		[
			'Reproduce the exact pipeline controls and retain exceptions.',
			'Commit a configuration, preserve its first changed-case result, and explain a repair.',
			'Defend the source-to-decision trace and identify a remaining professional skill gap.'
		]
	];
	const files = [
		{ name: 'portfolio-guide.md', label: 'Portfolio guide & role extensions' },
		{ name: 'willow-pipeline.mjs', label: 'Runnable Node.js reconciliation starter' },
		{ name: 'pipeline-data.json', label: 'Invoices & payments · PIPE-01' },
		{ name: 'policies.json', label: 'Versioned policy source documents' },
		{ name: 'collections-72.csv', label: '72-month forecast series · seed 42' },
		{ name: 'variance.csv', label: 'September variance source records' },
		{ name: 'data-manifest.json', label: 'Data provenance, units & control totals' },
		{ name: 'reviewed-solutions.md', label: 'Reviewed solutions · open after your attempt' }
	];
</script>

<svelte:head
	><title>Your five-day portfolio · AI Accountant</title><meta
		name="description"
		content="Create five connected finance artifacts, download original datasets and a runnable starter, and defend your evidence with explicit review criteria."
	/></svelte:head
>
<div class="page-wrap">
	<div class="page-title">
		<p class="eyebrow">FROM LEARNING TO EVIDENCE</p>
		<h1>Build something<br />you can defend.</h1>
		<p>
			Five connected submissions turn the course into a portfolio. Keep the source records,
			calculations, failed cases, and decisions—not just a polished final screenshot.
		</p>
	</div>
	<div class="callout">
		<Icon name="folder" />
		<div>
			<strong>A complete path without paid tools</strong>
			<p>
				Use the browser laboratories for the core activities. Export their evidence and your course
				notebook. The optional local starter runs with Node.js and needs no packages, API keys, or
				financial-system connection.
			</p>
		</div>
	</div>
	{#each days as day, i (day.day)}<section class="project panel" id={`day-${day.day}`}>
			<header>
				<div>
					<span class="micro-label">DAY 0{day.day} · CONNECTED SUBMISSION</span>
					<h2>{day.artifact}</h2>
					<p>{day.question}</p>
				</div>
				<img
					src={asset(`/images/${day.image}.webp`)}
					alt=""
					loading="lazy"
					width="400"
					height="300"
				/>
			</header>
			<div class="project-body">
				<h3>What a reviewer should be able to check</h3>
				<ul>
					{#each checks[i] as criterion (criterion)}<li>{criterion}</li>{/each}
				</ul>
				<div class="project-actions">
					<a class="button primary" href={resolve('/lab/[slug]', { slug: labs[i] })}
						>Open the workbench <Icon name="arrow" size={15} /></a
					><a
						class="button secondary"
						href={resolve('/downloads/[file]', { file: `day-${day.day}.md` })}
						download><Icon name="download" size={16} />Day {day.day} case brief</a
					>
				</div>
				<details class="disclosure">
					<summary>Connect this submission to its five modules</summary>
					<ul>
						{#each modules.filter((m) => m.day === day.day) as module (module.id)}<li>
								<a
									class="text-link"
									href={resolve('/course/[slug]', { slug: module.id.toLowerCase() })}
									>{module.id} · {module.title}</a
								>
								<p>{module.assignment.deliverable}</p>
							</li>{/each}
					</ul>
				</details>
				<Notebook
					moduleId={`M${String(day.day * 5).padStart(2, '0')}`}
					field="portfolio-submission"
					label="Your submission index"
					hint="Record the files you exported, the results they reproduce, the failure you investigated, and the decision you can defend."
				/>
			</div>
		</section>{/each}
	<section class="page-section">
		<p class="eyebrow">KEEP BUILDING OUTSIDE THE BROWSER</p>
		<h2>Your portfolio materials</h2>
		<p class="materials-intro">
			All data are original fictional teaching fixtures. The manifest identifies each dataset's
			units and controls. The starter is a runnable reconciliation baseline; the browser capstone
			adds retrieval, review-queue state, and changed-case evaluation.
		</p>
		<div class="downloads">
			{#each files as file (file.name)}<a
					href={resolve('/downloads/[file]', { file: file.name })}
					download
					><Icon name="download" size={20} />
					<div><strong>{file.label}</strong><span>{file.name}</span></div></a
				>{/each}
		</div>
		<div class="run-box">
			<h3>Run the local baseline</h3>
			<p>
				Install a current Node.js LTS runtime. Save the starter to a folder, open a terminal there,
				and run:
			</p>
			<pre><code>node willow-pipeline.mjs</code></pre>
			<p>
				The output lists invoice balances in USD cents, the duplicate quarantine, and unmatched
				allocations. The starter checks total outstanding of 90,000 cents (USD 900). Add the
				malformed-amount and conflicting-ID cases described in its comments, then retain the
				observed results.
			</p>
		</div>
	</section>
	<section class="page-section">
		<h2>Prepare the defense, then extend it.</h2>
		<p class="materials-intro">
			Your case is stronger when another person can reproduce it. The portfolio guide includes ten
			capstone tasks and further work for finance transformation, analytics, data science, AI
			engineering, and agent engineering. Estimates for those extensions sit outside the core 30
			hours.
		</p>
		<div class="project-actions">
			<a class="button primary" href={resolve('/interview/')}>Practice your portfolio defense →</a
			><a class="button secondary" href={resolve('/diagnostic/')}
				>Return to the changed diagnostic →</a
			><a class="text-link" href={resolve('/progress/')}>Export your course notebook →</a>
		</div>
	</section>
</div>

<style>
	.project {
		margin: 28px 0;
		padding: 0;
		overflow: hidden;
	}
	.project header {
		display: flex;
		align-items: center;
		background: #f3f4ed;
		gap: 24px;
		padding: 30px;
	}
	.project header > div {
		flex: 1;
	}
	.project h2 {
		font-size: 25px;
		line-height: 1.4;
		margin: 12px 0;
	}
	.project header p {
		line-height: 1.8;
		color: var(--muted);
		font-size: 14px;
	}
	.project img {
		width: 190px;
		height: 160px;
		object-fit: cover;
		border-radius: 14px;
	}
	.project-body {
		padding: 30px;
	}
	.project-body h3 {
		font-size: 17px;
	}
	.project-body ul {
		padding-left: 22px;
		line-height: 1.9;
		font-size: 14px;
	}
	.project-body li {
		margin: 12px 0;
	}
	.project-body li p {
		font-size: 13px;
		color: var(--muted);
		margin-top: 6px;
	}
	.project-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		align-items: center;
		margin: 24px 0;
	}
	.downloads {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
		margin: 25px 0;
	}
	.downloads > a {
		display: flex;
		gap: 15px;
		align-items: center;
		padding: 22px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: #fff;
	}
	.downloads strong {
		font-size: 14px;
		line-height: 1.6;
	}
	.downloads span {
		display: block;
		font-size: 12px;
		color: var(--muted);
		margin-top: 6px;
		overflow-wrap: anywhere;
	}
	.run-box {
		padding: 25px;
		background: #eef2e7;
		border-radius: 15px;
	}
	.run-box p,
	.materials-intro {
		font-size: 14px;
		line-height: 1.9;
		color: var(--muted);
		margin: 15px 0;
	}
	.run-box pre {
		padding: 18px;
		background: #fff;
		border-radius: 9px;
		overflow: auto;
		font-size: 13px;
	}
	@media (max-width: 650px) {
		.project header {
			padding: 23px;
		}
		.project header img {
			width: 90px;
			height: 130px;
		}
		.project h2 {
			font-size: 22px;
		}
		.project-body {
			padding: 23px;
		}
		.downloads {
			grid-template-columns: 1fr;
		}
	}
</style>
