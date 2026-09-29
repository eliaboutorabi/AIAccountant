<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy } from 'svelte';
	import type { Term } from '../terms';
	let { entry, text }: { entry: Term; text: string } = $props();
	let open = $state(false);
	let left = $state(16);
	let top = $state(80);
	let wrapper: HTMLElement;
	let timer: ReturnType<typeof setTimeout>;
	const id = $props.id();
	function show() {
		clearTimeout(timer);
		const rect = wrapper.getBoundingClientRect();
		left = Math.max(16, Math.min(rect.left, window.innerWidth - 372));
		top = Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - 360));
		open = true;
	}
	function leave() {
		timer = setTimeout(() => (open = false), 220);
	}
	function close() {
		clearTimeout(timer);
		open = false;
		wrapper.querySelector<HTMLButtonElement>('.technical-term')?.focus();
	}
	onDestroy(() => clearTimeout(timer));
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && open) close();
	}}
	onpointerdown={(event) => {
		if (open && event.target instanceof Node && !wrapper.contains(event.target)) open = false;
	}}
/>
<span
	{@attach (node) => {
		wrapper = node;
	}}
	class="term-wrap"
	role="group"
	onpointerenter={(event) => {
		if (event.pointerType === 'mouse') show();
	}}
	onpointerleave={leave}
>
	<button class="technical-term" aria-expanded={open} aria-controls={id} onclick={show}
		>{text}</button
	>{#if open}<span
			class="definition"
			style:left={`${left}px`}
			style:top={`${top}px`}
			{id}
			onpointerenter={() => clearTimeout(timer)}
			onpointerleave={leave}
			role="group"
			aria-label={`Definition of ${entry.term}`}
			><strong>{entry.term}</strong><span>{entry.definition}</span><em>{entry.example}</em><a
				href={resolve('/course/[slug]', { slug: entry.module.toLowerCase() })}
				>Study this concept · {entry.module} →</a
			><button class="close-term" onclick={close} aria-label={`Close definition of ${entry.term}`}
				>×</button
			></span
		>{/if}
</span>

<style>
	.term-wrap {
		display: inline;
	}
	.technical-term {
		display: inline;
		border: 0;
		border-bottom: 1px dotted #7e9a89;
		padding: 0;
		background: transparent;
		font: inherit;
		color: inherit;
		line-height: inherit;
		text-align: inherit;
		cursor: help;
	}
	.technical-term:hover {
		color: var(--green);
		background: var(--mint);
	}
	.definition {
		position: fixed;
		z-index: 80;
		width: min(356px, calc(100vw - 32px));
		max-height: calc(100vh - 32px);
		overflow: auto;
		display: grid;
		gap: 10px;
		padding: 22px;
		border: 1px solid #d6e1d6;
		border-radius: 14px;
		background: #fff;
		box-shadow: 0 12px 40px #193a3020;
		color: var(--ink);
		font-size: 14px;
		line-height: 1.6;
		font-weight: 400;
		text-align: left;
		white-space: normal;
	}
	.definition strong {
		font-size: 16px;
		padding-right: 15px;
	}
	.definition em {
		color: var(--muted);
		font-style: normal;
		border-left: 2px solid #d5cbe8;
		padding-left: 12px;
	}
	.definition a {
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.close-term {
		position: absolute;
		right: 8px;
		top: 8px;
		background: transparent;
		border: 0;
		font-size: 21px;
		width: 28px;
		height: 28px;
	}
	@media (max-width: 600px) {
		.definition {
			left: 16px !important;
			right: 16px;
			bottom: 24px;
			top: auto !important;
			width: calc(100vw - 32px);
			max-height: 70vh;
		}
	}
</style>
