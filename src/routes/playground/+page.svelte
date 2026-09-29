<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import { labs } from '$lib/course/labs';
	import Icon from '$lib/components/Icon.svelte';
	let filter = $state('All experiments');
	const filters = ['All experiments', 'Learning', 'Language', 'Finance', 'Systems'];
	const visible = $derived(
		labs.filter((l) => filter === 'All experiments' || l.category === filter)
	);
</script>

<svelte:head
	><title>The learning laboratory · AI Accountant</title><meta
		name="description"
		content="Run real model training, inspect transformers, write spreadsheet formulas, and evaluate financial systems in a browser-based learning laboratory."
	/></svelte:head
>
<div class="page-wrap">
	<header class="lab-hero">
		<div>
			<p class="eyebrow">MAKE A PREDICTION. FOLLOW THE EVIDENCE.</p>
			<h1>Ideas you can<br /><em>experiment with.</em></h1>
			<p>
				Train actual models. Inspect their internal calculations. Build financial workflows and test
				what happens when the assumptions change.
			</p>
		</div>
		<img
			src={asset('/images/analytics-atelier.webp')}
			alt="A sculptural ledger surrounded by glass patterns and data points"
		/>
	</header>
	<div class="lab-note">
		<Icon name="flask" size={23} />
		<p>
			Every experiment labels what is computed, what is an authored example, and what the result
			cannot establish. Core labs run locally without a paid model account. The optional
			model-directed agent requires an explicit model download and compatible hardware.
		</p>
	</div>
	<div class="lab-filters" role="group" aria-label="Filter experiments">
		{#each filters as name (name)}<button
				class:active={filter === name}
				aria-pressed={filter === name}
				onclick={() => (filter = name)}>{name}</button
			>{/each}
	</div>
	<div class="lab-cards">
		{#each visible as lab (lab.id)}<a
				href={resolve('/lab/[slug]', { slug: lab.id })}
				class="experiment-card"
				><div class="card-top">
					<span
						class={`icon-tile ${lab.category === 'Language' ? 'lavender' : lab.category === 'Finance' ? 'butter' : lab.category === 'Systems' ? 'peach' : 'mint'}`}
						><Icon name={lab.icon} size={24} /></span
					><span>{lab.category} · {lab.module}</span><Icon name="upRight" size={17} />
				</div>
				<h2>{lab.title}</h2>
				<p>{lab.subtitle}</p>
				<small>{lab.provenance}</small><span class="open-lab"
					>Open experiment <Icon name="arrow" size={15} /></span
				></a
			>{/each}
	</div>
	<section class="experiment-method">
		<p class="eyebrow">HOW TO LEARN FROM AN EXPERIMENT</p>
		<div>
			{#each [{ title: 'Predict', text: 'State what you expect to change and why.' }, { title: 'Run', text: 'Change one factor and inspect the relevant measurements.' }, { title: 'Explain', text: 'Use the mechanism to connect the change to the evidence.' }, { title: 'Transfer', text: 'Apply the idea to different records or a changed requirement.' }] as step, i (step.title)}<article
				>
					<span>0{i + 1}</span>
					<h3>{step.title}</h3>
					<p>{step.text}</p>
				</article>{/each}
		</div>
	</section>
</div>

<style>
	.lab-hero {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		align-items: center;
		gap: 30px;
		overflow: hidden;
		border-radius: 22px;
		background: #f0f2e9;
		min-height: 320px;
	}
	.lab-hero > div {
		padding: 35px;
	}
	.lab-hero h1 {
		font-size: clamp(32px, 3.8vw, 48px);
		letter-spacing: -1.7px;
		line-height: 1.18;
		margin: 17px 0 23px;
	}
	.lab-hero h1 em {
		font-style: normal;
		color: #6f8158;
	}
	.lab-hero p:not(.eyebrow) {
		font-size: 15px;
		line-height: 1.8;
		color: var(--muted);
	}
	.lab-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		min-height: 320px;
	}
	.lab-note {
		display: flex;
		gap: 15px;
		align-items: start;
		padding: 25px;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 14px;
		margin: 28px 0;
	}
	.lab-note p {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted);
	}
	.lab-filters {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin: 30px 0;
	}
	.lab-filters button {
		border: 1px solid var(--line);
		border-radius: 25px;
		background: white;
		padding: 10px 15px;
		font-size: 12px;
		font-weight: 650;
	}
	.lab-filters button.active {
		background: var(--green);
		color: white;
		border-color: var(--green);
	}
	.lab-cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
	}
	.experiment-card {
		display: flex;
		flex-direction: column;
		padding: 26px;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 17px;
	}
	.experiment-card:hover {
		box-shadow: 0 10px 30px #3653280c;
		border-color: #c2d1b6;
		transform: translateY(-2px);
	}
	.card-top {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.card-top > span:nth-child(2) {
		flex: 1;
		font-size: 10px;
		color: var(--muted);
		font-weight: 600;
	}
	.experiment-card h2 {
		font-size: 21px;
		margin: 22px 0 13px;
		letter-spacing: -0.4px;
	}
	.experiment-card > p {
		font-size: 14px;
		line-height: 1.75;
		color: var(--muted);
	}
	.experiment-card > small {
		font-size: 10px;
		line-height: 1.7;
		color: #647b57;
		margin: 18px 0 23px;
	}
	.open-lab {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 700;
		margin-top: auto;
		padding-top: 15px;
		border-top: 1px solid #edf0e8;
	}
	.experiment-method {
		margin-top: 45px;
		padding: 30px;
		background: #f1eef7;
		border-radius: 18px;
	}
	.experiment-method > div {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 25px;
		margin-top: 23px;
	}
	.experiment-method article > span {
		font-size: 10px;
		color: #76648b;
	}
	.experiment-method h3 {
		font-size: 16px;
		margin: 12px 0;
	}
	.experiment-method article > p {
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
	}
	@media (max-width: 750px) {
		.lab-hero {
			grid-template-columns: 1fr;
		}
		.lab-hero img {
			max-height: 220px;
			min-height: 0;
		}
		.lab-hero > div {
			padding: 28px;
		}
		.lab-cards {
			grid-template-columns: 1fr;
		}
		.experiment-method > div {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 400px) {
		.experiment-method > div {
			grid-template-columns: 1fr;
		}
	}
</style>
