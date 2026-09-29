<script lang="ts">
	import { annotate } from '../terms';
	import Term from './Term.svelte';
	let { text }: { text: string } = $props();
	const pieces = $derived(annotate(text));
</script>

{#each pieces as piece, i (i)}{#if piece.term}<Term
			entry={piece.term}
			text={piece.text}
		/>{:else}{piece.text}{/if}{/each}
