<script lang="ts">
	import ModuleReader from '$lib/course/components/ModuleReader.svelte';
	let { data } = $props();
</script>

{#key data.module.id}<ModuleReader
		module={data.module}
		previous={data.previous}
		next={data.next}
	/>{/key}
