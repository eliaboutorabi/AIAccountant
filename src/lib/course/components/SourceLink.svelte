<script lang="ts">
	import type { Snippet } from 'svelte';
	let { url, children }: { url: string; children: Snippet } = $props();
	const link = $derived({ href: url, target: '_blank', rel: 'noreferrer' });
</script>

<a {...link}>{@render children()}</a>
