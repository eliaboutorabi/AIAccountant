<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head><title>A little detour · AI Accountant</title></svelte:head>
<div class="page-wrap">
	<div class="empty-state panel">
		<Icon name="compass" size={40} />
		<p class="eyebrow">{page.status} · A LITTLE DETOUR</p>
		<h1>Let’s find your path again.</h1>
		<p>
			{page.status === 404
				? 'This page isn’t on the learning path. Your next good idea is still waiting.'
				: 'Something interrupted this page. Try returning to your learning path.'}
		</p>
		<a class="button primary" href={resolve('/path/')}
			>Back to the learning path<Icon name="arrow" size={17} /></a
		>
	</div>
</div>

<style>
	.empty-state {
		margin: 40px auto;
		max-width: 700px;
	}
	.empty-state :global(svg) {
		margin: 0 auto 20px;
	}
	.empty-state h1 {
		font-size: 30px;
		letter-spacing: -1px;
		margin-bottom: 20px;
	}
	.empty-state .button :global(svg) {
		margin: 0;
	}
	.eyebrow {
		margin-top: 20px;
	}
</style>
