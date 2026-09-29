<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		label,
		minimum = 520,
		children
	}: { label: string; minimum?: number; children: Snippet } = $props();
</script>

<div class="chart-viewport" style:--chart-minimum={`${minimum}px`}>
	<p class="chart-scroll-help">
		On a narrow screen, scroll the chart sideways to read every label. Keyboard: focus the chart,
		then use the arrow keys.
	</p>
	<!-- The region is keyboard-scrollable because the diagram preserves readable label sizes. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="chart-scroll-region" role="region" aria-label={label} tabindex="0">
		{@render children()}
	</div>
</div>

<style>
	.chart-viewport {
		min-width: 0;
		max-width: 100%;
	}
	.chart-scroll-region {
		overflow-x: auto;
		max-width: 100%;
		overscroll-behavior-inline: contain;
		border-radius: 12px;
	}
	.chart-scroll-region:focus-visible {
		outline: 3px solid #8871ad;
		outline-offset: 3px;
	}
	.chart-scroll-region :global(svg) {
		display: block;
		width: 100%;
		min-width: var(--chart-minimum);
		height: auto;
	}
	.chart-scroll-region :global(svg text) {
		font-size: 16px;
	}
	.chart-scroll-help {
		color: #59665e;
		font-size: 12px;
		line-height: 1.6;
		margin: 8px 0;
	}
	@media (min-width: 1100px) {
		.chart-scroll-help {
			display: none;
		}
	}
</style>
