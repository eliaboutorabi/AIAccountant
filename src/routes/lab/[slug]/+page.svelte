<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	let { data } = $props();
	const loaders = import.meta.glob<{ default: Component<{ mode: string }> }>(
		'../../../lib/course/labs/*Lab.svelte'
	);
	function loadLab(name: string) {
		const loader = Object.entries(loaders).find(([key]) => key.endsWith(`/${name}.svelte`))?.[1];
		if (!loader)
			return Promise.reject(new Error('This experiment is unavailable in the current build.'));
		return loader();
	}
	const component = $derived(loadLab(data.lab.component));
</script>

<svelte:head
	><title>{data.lab.title} · AI Accountant laboratory</title><meta
		name="description"
		content={data.lab.subtitle}
	/></svelte:head
>
<div class="lab-page">
	<nav aria-label="Laboratory breadcrumb" class="lab-breadcrumb">
		<a href={resolve('/playground/')}>Learning laboratory</a><span>/</span><span
			>{data.lab.category}</span
		>
	</nav>
	<header class="lab-title">
		<p class="eyebrow">{data.lab.category.toUpperCase()} · EXPERIMENT</p>
		<h1>{data.lab.title}</h1>
		<p>{data.lab.subtitle}</p>
		<span class="provenance"><Icon name="flask" size={15} />{data.lab.provenance}</span>
	</header>
	<div class="lab-guidance">
		<Icon name="bulb" size={21} />
		<p>
			<strong>Predict before changing a setting.</strong> Record your observations and explanation in
			the linked module notebook. A measured result is useful when you can explain its scope.
		</p>
	</div>
	{#key data.lab.id}{#await component}<div class="loading" role="status">
				Loading the experiment…
			</div>{:then loaded}<loaded.default mode={data.lab.mode ?? data.lab.id} />{:catch error}<div
				class="loading"
				role="alert"
			>
				{error.message} Reload to retry. No simulated result replaces a failed experiment.
			</div>{/await}{/key}
	<footer class="related">
		<h2>Connect the experiment to the lesson</h2>
		{#each data.related as module (module.id)}<a
				href={resolve('/course/[slug]', { slug: module.id.toLowerCase() })}
				><span>{module.id}</span><strong>{module.title}</strong><Icon name="arrow" size={17} /></a
			>{/each}
	</footer>
</div>

<style>
	.lab-page {
		max-width: 1260px;
		padding: 35px 40px 65px;
		margin: auto;
	}
	.lab-breadcrumb {
		display: flex;
		gap: 12px;
		font-size: 12px;
		color: var(--muted);
		margin-bottom: 30px;
	}
	.lab-breadcrumb a:hover {
		text-decoration: underline;
	}
	.lab-title h1 {
		font-size: clamp(31px, 3.4vw, 45px);
		letter-spacing: -1.5px;
		line-height: 1.25;
		margin: 15px 0 20px;
	}
	.lab-title > p:last-of-type {
		font-size: 18px;
		line-height: 1.7;
		color: var(--muted);
		max-width: 760px;
	}
	.provenance {
		display: flex;
		align-items: center;
		gap: 9px;
		font-size: 11px;
		color: #64795a;
		margin: 22px 0;
	}
	.lab-guidance {
		display: flex;
		gap: 13px;
		align-items: start;
		padding: 20px 24px;
		background: #f1f4e9;
		border: 1px solid #e0e7d8;
		border-radius: 13px;
		margin: 27px 0;
	}
	.lab-guidance p {
		font-size: 13px;
		line-height: 1.8;
	}
	.loading {
		padding: 50px;
		background: #f0f2eb;
		border-radius: 15px;
		font-size: 14px;
	}
	.related {
		padding-top: 40px;
		margin-top: 30px;
		border-top: 1px solid var(--line);
	}
	.related h2 {
		font-size: 21px;
		margin-bottom: 20px;
	}
	.related a {
		display: flex;
		align-items: center;
		gap: 16px;
		border: 1px solid var(--line);
		padding: 20px;
		border-radius: 12px;
		margin-top: 10px;
		background: white;
	}
	.related a span {
		font-size: 11px;
		color: var(--muted);
	}
	.related a strong {
		font-size: 14px;
		flex: 1;
		line-height: 1.6;
	}
	@media (max-width: 650px) {
		.lab-page {
			padding: 25px 18px;
		}
		.lab-guidance {
			padding: 18px;
		}
		.provenance {
			line-height: 1.8;
			align-items: start;
		}
		.related a {
			padding: 16px;
			gap: 10px;
		}
	}
</style>
