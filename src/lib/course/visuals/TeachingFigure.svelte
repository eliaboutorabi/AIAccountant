<script lang="ts">
	import { base } from '$app/paths';
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import InlineExperiment from './InlineExperiment.svelte';
	import type { TeachingVisual } from './types';
	let { visual }: { visual: TeachingVisual } = $props();
	let dialog: HTMLDialogElement | undefined;
	let imageRegion: HTMLDivElement | undefined;
	let zoom = $state(false);
	async function toggleZoom() {
		zoom = !zoom;
		await tick();
		if (zoom) imageRegion?.focus();
	}
	const uid = $props.id();
	const imagePath = (path: string) =>
		/^(https?:|data:)/.test(path) ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
	const barMin = $derived(
		visual.kind === 'diagram' ? Math.min(0, ...visual.nodes.map((n) => n.amount ?? 0)) : 0
	);
	const barMax = $derived(
		visual.kind === 'diagram' ? Math.max(0, ...visual.nodes.map((n) => n.amount ?? 0)) : 0
	);
	const barSpan = $derived(barMax - barMin || 1);
	const matrixMax = $derived(
		visual.kind === 'diagram' ? Math.max(1e-12, ...(visual.cells ?? []).flat().map(Math.abs)) : 1
	);
	const flowColumns = $derived(
		visual.kind === 'diagram'
			? visual.nodes.length === 4
				? 2
				: Math.min(3, visual.nodes.length)
			: 1
	);
	const colors = ['#dce9db', '#e7e0f2', '#f5dfca', '#dcebed', '#f1e8ca', '#e8e9dd'];
</script>

<figure id={visual.id} class="tf-figure" data-kind={visual.kind} aria-labelledby={`${uid}-title`}>
	<header class="tf-header">
		<div class="tf-eyebrow">
			<Icon
				name={visual.kind === 'interactive'
					? 'flask'
					: visual.kind === 'art'
						? 'palette'
						: 'network'}
				size={15}
			/><span
				>{visual.kind === 'interactive'
					? 'TRY THE IDEA'
					: visual.kind === 'art'
						? 'SEE THE IDEA'
						: 'FOLLOW THE MECHANISM'}</span
			>
		</div>
		<h3 id={`${uid}-title`}>{visual.title}</h3>
		<p>{visual.lead}</p>
	</header>
	{#if visual.kind === 'art'}
		<div class="tf-art">
			<img
				src={imagePath(visual.image)}
				alt={visual.alt}
				width={visual.width}
				height={visual.height}
				loading="lazy"
				decoding="async"
			/>
			<button
				class="tf-enlarge"
				onclick={() => {
					zoom = false;
					dialog?.showModal();
				}}
				aria-label={`Enlarge: ${visual.title}`}
				><Icon name="search" size={16} /> Explore full image</button
			>
		</div>
		<details class="tf-companion">
			<summary>Read the visual explanation</summary>
			<dl>
				{#each visual.transcript as item (item.label)}<div>
						<dt>{item.label}</dt>
						<dd>{item.explanation}</dd>
					</div>{/each}
			</dl>
		</details>
		<dialog
			{@attach (element) => {
				dialog = element;
				return () => {
					dialog = undefined;
				};
			}}
			class="tf-dialog"
			aria-labelledby={`${uid}-dialog-title`}
		>
			<div class="tf-dialog-top">
				<h4 id={`${uid}-dialog-title`}>{visual.title}</h4>
				<div class="tf-dialog-controls">
					<button class="tf-zoom-toggle" onclick={toggleZoom} aria-controls={`${uid}-image-region`}
						><Icon name={zoom ? 'back' : 'search'} size={16} />{zoom
							? 'Fit to window'
							: 'Original size'}</button
					>
					<button class="tf-close" onclick={() => dialog?.close()} aria-label="Close enlarged image"
						><Icon name="x" size={22} /></button
					>
				</div>
			</div>
			<p class="tf-zoom-help" id={`${uid}-zoom-help`} role="status">
				{zoom
					? 'Original size. Use arrow keys, the scrollbars, or swipe to inspect the whole image.'
					: 'Fitted to the window. Choose Original size to inspect small labels; no part of the image is removed.'}
			</p>
			<!-- Keyboard focus enables horizontal and vertical image panning at original size. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				id={`${uid}-image-region`}
				class="tf-dialog-image"
				class:tf-zoomed={zoom}
				role="region"
				aria-label={`${visual.title}: image viewer`}
				aria-describedby={`${uid}-zoom-help`}
				tabindex="0"
				{@attach (element) => {
					imageRegion = element;
					return () => {
						imageRegion = undefined;
					};
				}}
			>
				<img
					src={imagePath(visual.image)}
					alt={visual.alt}
					width={visual.width}
					height={visual.height}
					loading="lazy"
					style={`--tf-original-width:${visual.width ? `${visual.width}px` : 'auto'}`}
				/>
			</div>
			<p>{visual.alt}</p>
		</dialog>
	{:else if visual.kind === 'interactive'}
		<InlineExperiment interaction={visual.interaction} />
	{:else}
		<div class={`tf-diagram tf-layout-${visual.layout}`}>
			<p class="tf-sr">{visual.alt}</p>
			{#if visual.layout === 'bars'}
				<div class="tf-bars" aria-label={visual.alt}>
					{#each visual.nodes as node, i (i)}
						<div class="tf-bar-row">
							<div class="tf-bar-label">
								<Icon name={node.icon ?? 'chart'} size={18} /><strong>{node.label}</strong><span
									>{node.value ??
										`${node.amount ?? 0}${visual.unit ? ` ${visual.unit}` : ''}`}</span
								>
							</div>
							<div class="tf-bar-track" aria-hidden="true">
								<span class="tf-zero" style={`left:${(-barMin / barSpan) * 100}%`}></span><span
									class="tf-bar-fill"
									style={`left:${((Math.min(0, node.amount ?? 0) - barMin) / barSpan) * 100}%;width:${(Math.abs(node.amount ?? 0) / barSpan) * 100}%;background:${colors[i % colors.length]}`}
								></span>
							</div>
							<p>{node.detail}</p>
						</div>
					{/each}
					<div class="tf-axis">
						<span>{barMin.toLocaleString()}</span>{#if barMin < 0 && barMax > 0}<span
								class="tf-axis-zero"
								style={`left:${(-barMin / barSpan) * 100}%`}>0</span
							>{/if}<span>{barMax.toLocaleString()}</span>
					</div>
					<p class="tf-axis-unit">
						Common scale{visual.unit ? ` · ${visual.unit}` : ''}{barMin < 0
							? ' · bars extend from zero'
							: ''}
					</p>
				</div>
			{:else if visual.layout === 'matrix' && visual.cells?.length}
				<!-- Keyboard users need to scroll wider matrices. -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="tf-matrix-scroll"
					role="region"
					aria-label={`${visual.title}: matrix`}
					tabindex="0"
				>
					<table class="tf-matrix">
						<caption>{visual.unit ?? 'Exact values; color intensity indicates magnitude.'}</caption
						><thead
							><tr
								><th scope="col">{visual.rows?.length ? 'Row / column' : 'Position'}</th
								>{#each visual.columns ?? visual.cells[0].map((_, i) => `${i + 1}`) as column, i (i)}<th
										scope="col">{column}</th
									>{/each}</tr
							></thead
						><tbody
							>{#each visual.cells as row, i (i)}<tr
									><th scope="row">{visual.rows?.[i] ?? i + 1}</th>{#each row as cell, j (j)}<td
											style={`background:color-mix(in srgb, ${cell < 0 ? '#e4c2a7' : '#a2bfa3'} ${(Math.abs(cell) / matrixMax) * 72}%, #fffef9)`}
											>{cell}</td
										>{/each}</tr
								>{/each}</tbody
						>
					</table>
				</div>
				<div class="tf-matrix-key">
					{#each visual.nodes as node, i (i)}<p>
							<Icon name={node.icon ?? 'layers'} size={17} /><span
								><strong>{node.label}.</strong> {node.detail}</span
							>
						</p>{/each}
				</div>
			{:else}
				<ol
					class="tf-nodes"
					style={`--tf-count:${visual.nodes.length};--tf-flow-cols:${flowColumns}`}
				>
					{#each visual.nodes as node, i (i)}
						<li
							class="tf-node"
							class:tf-turn={(i + 1) % flowColumns === 0}
							class:tf-back={Math.floor(i / flowColumns) % 2 === 1}
							style={`--tf-node-color:${colors[i % colors.length]};--tf-col:${Math.floor(i / flowColumns) % 2 === 0 ? (i % flowColumns) + 1 : flowColumns - (i % flowColumns)};--tf-row:${Math.floor(i / flowColumns) + 1};--tf-angle:${(i * 360) / visual.nodes.length - 90}deg;--tf-counter-angle:${90 - (i * 360) / visual.nodes.length}deg`}
						>
							<div class="tf-node-top">
								<span class="tf-node-icon"
									><Icon
										name={node.icon ?? (visual.layout === 'timeline' ? 'clock' : 'layers')}
										size={23}
									/></span
								><span class="tf-node-number">{String(i + 1).padStart(2, '0')}</span>
							</div>
							{#if node.value}<span class="tf-node-value">{node.value}</span>{/if}
							<h4>{node.label}</h4>
							<p>{node.detail}</p>
							{#if (visual.layout === 'flow' || visual.layout === 'cycle') && i < visual.nodes.length - 1}<span
									class="tf-connector"
									aria-hidden="true"><Icon name="arrow" size={23} /></span
								>{/if}
						</li>
					{/each}
				</ol>
				{#if visual.layout === 'cycle'}
					<div class="tf-cycle-return">
						<Icon name="reset" size={23} />
						<span>Repeat the cycle from <strong>01 · {visual.nodes[0]?.label}</strong></span>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
	<figcaption>
		<div class="tf-caption">
			<span class="tf-takeaway-icon"><Icon name="bulb" size={19} /></span>
			<p><strong>Carry this forward</strong>{visual.takeaway}</p>
		</div>
		{#if visual.question}<details class="tf-predict">
				<summary
					><Icon name="help" size={18} /><span><small>PAUSE & PREDICT</small>{visual.question}</span
					><Icon name="down" size={17} /></summary
				>
				<p>{visual.answer}</p>
			</details>{/if}
		{#if visual.sourceNote}<p class="tf-source">{visual.sourceNote}</p>{/if}
	</figcaption>
</figure>

<style>
	.tf-figure {
		margin: 38px 0;
		border: 1px solid #dcded2;
		border-radius: 22px;
		background: #fffef9;
		overflow: hidden;
		scroll-margin-top: 100px;
		min-width: 0;
		box-shadow: 0 8px 30px #29473205;
		color: #293b31;
	}
	.tf-header {
		padding: 27px 30px 22px;
	}
	.tf-eyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #59674e;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 1.4px;
	}
	.tf-header h3 {
		font-size: clamp(22px, 3vw, 29px);
		letter-spacing: -0.7px;
		line-height: 1.2;
		margin: 12px 0;
	}
	.tf-header > p {
		font-size: 14px;
		line-height: 1.75;
		color: #5a6359;
		margin: 0;
		max-width: 720px;
	}
	.tf-art {
		padding-bottom: 1px;
		position: relative;
		background: #f4f2e9;
	}
	.tf-art img,
	.tf-dialog img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}
	.tf-enlarge {
		position: static;
		margin: 11px 14px 11px auto;
		border: 1px solid #ccd5c5;
		background: #fffef9ed;
		color: #2c4733;
		border-radius: 30px;
		display: flex;
		gap: 7px;
		align-items: center;
		padding: 10px 14px;
		font-size: 11px;
		font-weight: 750;
		box-shadow: 0 3px 16px #29473216;
		cursor: pointer;
	}
	.tf-companion {
		padding: 18px 30px;
		border-top: 1px solid #e5e7dc;
		font-size: 12px;
	}
	.tf-companion summary {
		cursor: pointer;
		font-weight: 750;
	}
	.tf-companion dl {
		margin: 18px 0 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 17px 24px;
	}
	.tf-companion dt {
		font-weight: 750;
		margin-bottom: 5px;
	}
	.tf-companion dd {
		margin: 0;
		color: #586356;
		line-height: 1.75;
	}
	.tf-dialog {
		margin: auto;
		max-width: min(1200px, 95vw);
		width: 1200px;
		max-height: 94dvh;
		padding: 0;
		border: 1px solid #d7ddd1;
		border-radius: 18px;
		color: #293b31;
		background: #fffef9;
	}
	.tf-dialog::backdrop {
		background: #17251cd9;
		backdrop-filter: blur(7px);
	}
	.tf-dialog-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 16px 24px;
		position: sticky;
		top: 0;
		background: #fffef9f5;
		z-index: 1;
	}
	.tf-dialog-controls {
		display: flex;
		align-items: center;
		gap: 9px;
		flex-shrink: 0;
	}
	.tf-zoom-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		min-height: 40px;
		padding: 10px 13px;
		border: 1px solid #cbd8bd;
		border-radius: 22px;
		background: #eef3e7;
		color: #3b5630;
		font-size: 11px;
		font-weight: 750;
		cursor: pointer;
		white-space: nowrap;
	}
	.tf-dialog > .tf-zoom-help {
		padding: 0 24px 12px;
		margin: 0;
		font-size: 10px;
		line-height: 1.7;
		color: #5d6b52;
	}
	.tf-dialog-image {
		max-height: calc(90dvh - 165px);
		overflow: auto;
		overscroll-behavior: contain;
		background: #f2f0e7;
	}
	.tf-dialog-image:focus-visible {
		outline: 3px solid #92744d;
		outline-offset: -3px;
	}
	.tf-dialog-image img {
		max-height: calc(90dvh - 165px);
		width: 100%;
		height: auto;
		object-fit: contain;
	}
	.tf-dialog-image.tf-zoomed img {
		width: var(--tf-original-width);
		max-width: none;
		max-height: none;
		height: auto;
	}
	.tf-dialog h4 {
		font-size: 18px;
		margin: 0;
	}
	.tf-close {
		border: 1px solid #d8dece;
		background: #fffef9;
		color: #253a2b;
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		cursor: pointer;
		flex-shrink: 0;
	}
	.tf-dialog > p {
		padding: 0 24px 18px;
		font-size: 13px;
		line-height: 1.75;
		color: #586356;
	}
	.tf-diagram {
		padding: 25px 30px 30px;
		background: linear-gradient(130deg, #f3f5ec, #f6f3ed);
		position: relative;
	}
	.tf-nodes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
		gap: 24px;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.tf-layout-flow .tf-nodes,
	.tf-layout-cycle .tf-nodes {
		grid-template-columns: repeat(var(--tf-flow-cols), minmax(0, 1fr));
	}
	.tf-layout-flow .tf-node,
	.tf-layout-cycle .tf-node {
		grid-column: var(--tf-col);
		grid-row: var(--tf-row);
	}
	.tf-layout-flow .tf-back .tf-connector,
	.tf-layout-cycle .tf-back .tf-connector {
		right: auto;
		left: -24px;
		transform: rotate(180deg);
	}
	.tf-layout-flow .tf-turn .tf-connector,
	.tf-layout-cycle .tf-turn .tf-connector {
		right: calc(50% - 12px);
		left: auto;
		top: auto;
		bottom: -24px;
		transform: rotate(90deg);
	}
	.tf-layout-timeline .tf-nodes {
		grid-template-columns: repeat(var(--tf-count), minmax(0, 1fr));
	}
	.tf-layout-timeline .tf-node {
		padding: 14px;
	}
	.tf-layout-timeline .tf-node-value {
		font-size: 16px;
		letter-spacing: -0.3px;
		overflow-wrap: normal;
	}
	.tf-layout-compare .tf-nodes {
		grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
	}
	.tf-node {
		position: relative;
		padding: 19px;
		border: 1px solid #d9ded0;
		background: #fffef9;
		border-radius: 15px;
		min-width: 0;
	}
	.tf-node-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 14px;
	}
	.tf-node-icon {
		display: grid;
		place-items: center;
		background: var(--tf-node-color);
		width: 45px;
		height: 45px;
		border-radius: 13px;
		color: #354d3a;
	}
	.tf-node-number {
		font-size: 10px;
		font-weight: 700;
		color: #5f6d55;
		letter-spacing: 1px;
	}
	.tf-node h4 {
		font-size: 15px;
		line-height: 1.4;
		margin: 7px 0;
	}
	.tf-node p {
		font-size: 12px;
		line-height: 1.8;
		color: #596353;
		margin: 0;
	}
	.tf-node-value {
		display: block;
		font-size: 22px;
		line-height: 1.3;
		font-weight: 800;
		letter-spacing: -0.6px;
		color: #415d3a;
		overflow-wrap: anywhere;
	}
	.tf-connector {
		position: absolute;
		right: -24px;
		top: 35px;
		z-index: 1;
		color: #738768;
		background: #f3f5ec;
	}
	.tf-node:last-child .tf-connector {
		display: none;
	}
	.tf-layout-compare .tf-node {
		border-top: 5px solid var(--tf-node-color);
		padding-top: 15px;
	}
	.tf-layout-timeline .tf-nodes {
		border-top: 2px solid #bbc9ac;
		padding-top: 22px;
	}
	.tf-layout-timeline .tf-node:before {
		content: '';
		position: absolute;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		top: -29px;
		left: 20px;
		background: #547448;
		box-shadow: 0 0 0 5px #edf1e3;
	}
	.tf-cycle-return {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		margin-top: 22px;
		padding: 15px 18px;
		border: 1px solid #c6d3ba;
		border-radius: 13px;
		background: #eaf0e2;
		color: #405836;
	}
	.tf-cycle-return span {
		font-size: 12px;
		line-height: 1.6;
	}
	.tf-cycle-return :global(svg) {
		flex-shrink: 0;
	}
	.tf-bars {
		display: grid;
		gap: 19px;
	}
	.tf-bar-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		margin-bottom: 9px;
	}
	.tf-bar-label strong {
		flex: 1;
	}
	.tf-bar-label > span {
		font-variant-numeric: tabular-nums;
		font-size: 13px;
		font-weight: 800;
	}
	.tf-bar-track {
		position: relative;
		background: #e8ecdf;
		height: 29px;
		border-radius: 6px;
	}
	.tf-bar-fill {
		display: block;
		height: 100%;
		position: absolute;
		box-shadow: inset 0 0 0 1px #43573520;
		border-radius: 6px;
	}
	.tf-zero {
		position: absolute;
		height: 37px;
		top: -4px;
		width: 1px;
		background: #556b48;
		z-index: 1;
	}
	.tf-bar-row > p {
		font-size: 11px;
		line-height: 1.7;
		color: #5e6856;
		margin: 8px 0 0;
	}
	.tf-axis {
		position: relative;
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		color: #57664d;
		border-top: 1px solid #becab2;
		padding-top: 8px;
		gap: 10px;
		font-variant-numeric: tabular-nums;
	}
	.tf-axis-zero {
		position: absolute;
		transform: translateX(-50%);
		top: 8px;
	}
	.tf-axis-unit {
		font-size: 10px;
		color: #57664d;
		text-align: center;
		margin: -6px 0 0;
		line-height: 1.7;
	}
	.tf-matrix-scroll {
		overflow: auto;
		max-width: 100%;
		border-radius: 12px;
		border: 1px solid #ced9c7;
		background: #fffef9;
	}
	.tf-matrix {
		border-collapse: collapse;
		width: 100%;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
	.tf-matrix th,
	.tf-matrix td {
		padding: 14px;
		text-align: center;
		border: 1px solid #e0e5d8;
		min-width: 64px;
	}
	.tf-matrix th {
		font-size: 11px;
		color: #4b5f42;
		background: #f0f4e8;
	}
	.tf-matrix caption {
		text-align: left;
		padding: 12px 15px;
		font-size: 11px;
		color: #5d6656;
		caption-side: bottom;
		line-height: 1.6;
	}
	.tf-matrix-key {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
		gap: 8px 24px;
		margin-top: 18px;
	}
	.tf-matrix-key p {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 12px;
		line-height: 1.75;
		margin: 0;
	}
	.tf-matrix-key :global(svg) {
		flex-shrink: 0;
		margin-top: 3px;
	}
	.tf-caption {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		margin: 0;
		padding: 21px 30px;
		background: #eef2e5;
		border-top: 1px solid #dce3d1;
	}
	.tf-takeaway-icon {
		display: grid;
		place-items: center;
		background: #dae6cd;
		width: 33px;
		height: 33px;
		flex-shrink: 0;
		border-radius: 50%;
		color: #3c5831;
	}
	.tf-caption p {
		font-size: 13px;
		line-height: 1.75;
		margin: 0;
		color: #44573a;
	}
	.tf-caption strong {
		display: block;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.9px;
		margin: 0 0 3px;
	}
	.tf-predict {
		margin: 0 30px;
		padding: 19px 0;
		border-bottom: 1px solid #e4e6dc;
	}
	.tf-predict summary {
		display: flex;
		align-items: center;
		gap: 11px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 650;
		line-height: 1.7;
		list-style: none;
	}
	.tf-predict summary::-webkit-details-marker {
		display: none;
	}
	.tf-predict summary > span {
		flex: 1;
	}
	.tf-predict summary :global(svg) {
		flex-shrink: 0;
	}
	.tf-predict small {
		display: block;
		font-size: 9px;
		letter-spacing: 1px;
		color: #6e6250;
		margin-bottom: 2px;
	}
	.tf-predict > p {
		font-size: 13px;
		line-height: 1.85;
		color: #596253;
		margin: 14px 0 2px;
		padding-left: 29px;
	}
	.tf-predict[open] summary > :global(svg:last-child) {
		transform: rotate(180deg);
	}
	.tf-source {
		font-size: 10px;
		line-height: 1.7;
		color: #6a7165;
		padding: 15px 30px;
		margin: 0;
	}
	.tf-sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.tf-figure :global(button:focus-visible),
	.tf-figure :global(summary:focus-visible),
	.tf-figure :global([tabindex='0']:focus-visible) {
		outline: 3px solid #92744d;
		outline-offset: 4px;
	}
	@media (max-width: 600px) {
		.tf-header {
			padding: 23px 20px 19px;
		}
		.tf-figure {
			margin: 28px 0;
			border-radius: 17px;
		}
		.tf-diagram {
			padding: 22px 20px;
		}
		.tf-layout-flow .tf-nodes,
		.tf-layout-cycle .tf-nodes,
		.tf-layout-timeline .tf-nodes,
		.tf-layout-compare .tf-nodes {
			grid-template-columns: 1fr;
		}
		.tf-layout-flow .tf-node,
		.tf-layout-cycle .tf-node {
			grid-column: auto;
			grid-row: auto;
		}
		.tf-layout-flow .tf-node .tf-connector,
		.tf-layout-cycle .tf-node .tf-connector {
			right: calc(50% - 12px);
			left: auto;
			top: auto;
			bottom: -24px;
			transform: rotate(90deg);
		}
		.tf-nodes {
			grid-template-columns: 1fr;
			gap: 22px;
		}
		.tf-node {
			padding: 17px;
		}
		.tf-node-top {
			margin-bottom: 7px;
		}
		.tf-node-icon {
			width: 36px;
			height: 36px;
			border-radius: 10px;
		}
		.tf-node h4 {
			margin: 5px 0;
		}
		.tf-connector {
			right: calc(50% - 12px);
			top: auto;
			bottom: -24px;
			transform: rotate(90deg);
		}
		.tf-layout-timeline .tf-nodes {
			border-top: 0;
			border-left: 2px solid #bbc9ac;
			padding-top: 0;
			padding-left: 19px;
		}
		.tf-layout-timeline .tf-node:before {
			top: 22px;
			left: -26px;
		}
		.tf-caption {
			padding: 19px 20px;
		}
		.tf-predict {
			margin: 0 20px;
		}
		.tf-source {
			padding: 15px 20px;
		}
		.tf-companion {
			padding: 17px 20px;
		}
		.tf-companion dl {
			grid-template-columns: 1fr;
		}
		.tf-enlarge {
			position: static;
			margin: 12px auto;
		}
		.tf-art {
			padding-bottom: 1px;
		}
		.tf-dialog-top {
			flex-wrap: wrap;
			gap: 12px;
			padding: 14px 16px;
		}
		.tf-dialog-image,
		.tf-dialog-image img {
			max-height: calc(90dvh - 200px);
		}
		.tf-dialog-image.tf-zoomed img {
			max-height: none;
		}
		.tf-dialog > .tf-zoom-help {
			padding: 0 16px 12px;
		}
		.tf-dialog h4 {
			font-size: 16px;
		}
	}
</style>
