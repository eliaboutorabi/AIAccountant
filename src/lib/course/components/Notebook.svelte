<script lang="ts">
	import { onMount } from 'svelte';
	import { useBook } from '../progress.svelte';
	let {
		moduleId,
		field,
		label,
		hint = '',
		rows = 5
	}: { moduleId: string; field: string; label: string; hint?: string; rows?: number } = $props();
	const book = useBook();
	const id = $props.id();
	onMount(() => book.load());
</script>

<div class="notebook">
	<label for={id}>{label}</label>{#if hint}<p id={`${id}-hint`}>{hint}</p>{/if}<textarea
		{id}
		{rows}
		disabled={!book.loaded}
		aria-describedby={hint ? `${id}-hint` : undefined}
		value={book.get(moduleId).responses[field] ?? ''}
		oninput={(e) => book.response(moduleId, field, e.currentTarget.value)}
		placeholder="Record your reasoning and evidence…"></textarea><small
		>{book.storageAvailable
			? 'Saved on this device as you write. Export your notebook to keep a copy.'
			: 'Browser storage is unavailable. Keep this page open and export your notebook.'}</small
	>
</div>

<style>
	.notebook {
		margin: 24px 0;
		display: grid;
		gap: 9px;
	}
	.notebook label {
		font-weight: 700;
	}
	.notebook p,
	.notebook small {
		color: var(--muted);
		font-size: 13px;
		line-height: 1.6;
	}
	.notebook textarea {
		width: 100%;
		resize: vertical;
		border: 1px solid #d6dfd5;
		border-radius: 12px;
		padding: 16px;
		background: #fffdf8;
		line-height: 1.7;
		min-height: 120px;
	}
</style>
