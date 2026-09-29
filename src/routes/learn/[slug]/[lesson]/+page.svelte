<script lang="ts">
	import Lesson from '$lib/components/Lesson.svelte';
	let { data } = $props();
</script>

<svelte:head
	><title>{data.lesson.title} · AI Accountant</title><meta
		name="description"
		content={data.lesson.subtitle}
	/></svelte:head
>
<div class="page-wrap lesson-page">
	{#key data.id}<Lesson {...data} />{/key}
</div>

<style>
	.lesson-page {
		max-width: 1300px;
	}
</style>
