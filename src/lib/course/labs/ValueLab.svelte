<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	let volume = $state(800),
		manual = $state(6),
		prep = $state(0.5),
		review = $state(1.5),
		correctionRate = $state(15),
		correctionTime = $state(4),
		hourly = $state(60),
		modelCost = $state(0.08),
		maintenance = $state(300),
		setup = $state(12000),
		weeks = $state(52);
	const hours = $derived(
		(volume * (manual - prep - review - (correctionRate / 100) * correctionTime)) / 60
	);
	const net = $derived(hours * hourly - volume * modelCost - maintenance - setup / weeks);
	const invalid = $derived(
		[
			volume,
			manual,
			prep,
			review,
			correctionRate,
			correctionTime,
			hourly,
			modelCost,
			maintenance,
			setup,
			weeks
		].some((v) => !Number.isFinite(v) || v < 0) ||
			volume > 100000 ||
			[manual, prep, review, correctionTime].some((v) => v > 60) ||
			correctionRate > 100 ||
			hourly > 1000 ||
			modelCost > 100 ||
			maintenance > 100000 ||
			setup > 1000000 ||
			weeks < 1 ||
			weeks > 520
	);
	const inputs = [
		{ key: 'volume', label: 'Weekly documents' },
		{ key: 'manual', label: 'Baseline minutes per document' }
	];
</script>

<section class="value-lab">
	<p class="eyebrow">BUSINESS CASE · HYPOTHETICAL ASSUMPTIONS</p>
	<h2>A fast draft is only part of the economics.</h2>
	<p class="intro">
		Model the complete weekly workload. These numbers are invented assumptions, not a forecast or
		measured vendor return. Time savings are capacity, not automatically cash savings.
	</p>
	<div class="value-controls">
		<label>{inputs[0].label}<input type="number" min="0" max="100000" bind:value={volume} /></label
		><label
			>{inputs[1].label}<input
				type="number"
				min="0"
				max="60"
				step="0.5"
				bind:value={manual}
			/></label
		><label
			>Preparation minutes / document<input
				type="number"
				min="0"
				max="60"
				step="0.1"
				bind:value={prep}
			/></label
		><label
			>Review minutes / document<input
				type="number"
				min="0"
				max="60"
				step="0.1"
				bind:value={review}
			/></label
		><label
			>Documents needing correction (%)<input
				type="number"
				min="0"
				max="100"
				bind:value={correctionRate}
			/></label
		><label
			>Extra correction minutes<input
				type="number"
				min="0"
				max="60"
				step="0.5"
				bind:value={correctionTime}
			/></label
		><label
			>Capacity value / hour (USD)<input
				type="number"
				min="0"
				max="1000"
				bind:value={hourly}
			/></label
		><label
			>Model cost / document (USD)<input
				type="number"
				min="0"
				max="100"
				step="0.01"
				bind:value={modelCost}
			/></label
		><label
			>Weekly maintenance cost (USD)<input
				type="number"
				min="0"
				max="100000"
				step="10"
				bind:value={maintenance}
			/></label
		><label
			>One-time setup cost (USD)<input
				type="number"
				min="0"
				max="1000000"
				step="100"
				bind:value={setup}
			/></label
		><label
			>Weeks to allocate setup<input type="number" min="1" max="520" bind:value={weeks} /></label
		>
	</div>
	{#if invalid}<p role="alert">
			Enter finite values within the input limits: up to 100,000 documents, 60 minutes per task,
			100% corrections, $1,000 per hour, $100 per model call, $100,000 maintenance, $1,000,000
			setup, and 1–520 weeks.
		</p>{:else}<div class="value-results">
			<div>
				<Icon name="clock" size={25} /><strong>{hours.toFixed(1)} hours</strong><span
					>Weekly net capacity {hours < 0 ? 'consumed' : 'released'}</span
				>
			</div>
			<div class:negative={net < 0}>
				<Icon name="calculator" size={25} /><strong
					>${net.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong
				><span>Illustrative weekly net value after stated costs</span>
			</div>
		</div>
		<div class="bridge">
			<h3>Show your working.</h3>
			<p>
				Per document: {manual} baseline minutes −{prep} preparation −{review} review −({correctionRate}%
				×{correctionTime} correction minutes) =
				<strong
					>{(manual - prep - review - (correctionRate / 100) * correctionTime).toFixed(2)} minutes saved.</strong
				>
			</p>
			<p>
				Weekly capacity value: {hours.toFixed(1)} hours ×${hourly}/hour. Deduct ${volume *
					modelCost} model costs, ${maintenance} maintenance, and ${(setup / weeks).toFixed(2)} allocated
				setup cost.
			</p>
		</div>{/if}
	<div class="limitations">
		<h3>What this model leaves open</h3>
		<p>
			It does not monetize undetected errors, service changes, opportunity costs, staff changes, or
			risk. Add those only with justified assumptions and sensitivity ranges. A pilot should measure
			preparation, review, corrections, critical error outcomes, and downstream workload across
			representative cases.
		</p>
		<p>
			Try doubling review time and correction rate. Then explain the condition under which the
			project stops being worthwhile. The useful business conversation is about which assumptions
			the pilot must resolve.
		</p>
	</div>
</section>

<style>
	.value-lab {
		padding: 30px;
		border: 1px solid #e3dfcb;
		border-radius: 20px;
		background: #fffdf6;
	}
	.value-lab h2 {
		font-size: 28px;
		line-height: 1.4;
		margin: 12px 0 18px;
	}
	.intro,
	.value-lab p {
		font-size: 14px;
		line-height: 1.85;
		color: var(--muted);
	}
	.value-controls {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 17px;
		margin: 28px 0;
	}
	.value-controls label {
		display: grid;
		gap: 9px;
		font-size: 11px;
		font-weight: 650;
		align-content: start;
	}
	.value-controls input {
		width: 100%;
		padding: 12px;
		border: 1px solid #dcdcca;
		border-radius: 9px;
		background: white;
	}
	.value-results {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
		margin: 25px 0;
	}
	.value-results > div {
		background: #eaf1e0;
		border-radius: 14px;
		padding: 25px;
		display: grid;
		gap: 15px;
	}
	.value-results strong {
		font-size: 30px;
		letter-spacing: -0.7px;
	}
	.value-results span {
		font-size: 12px;
		color: var(--muted);
	}
	.value-results > div.negative {
		background: #fbe9d8;
	}
	.bridge,
	.limitations {
		padding: 25px;
		background: #f2f1e7;
		border-radius: 14px;
		margin-top: 25px;
	}
	.bridge h3,
	.limitations h3 {
		font-size: 18px;
		margin-bottom: 16px;
	}
	.bridge p + p,
	.limitations p + p {
		margin-top: 12px;
	}
	.limitations {
		background: #f0edf6;
	}
	@media (max-width: 650px) {
		.value-lab {
			padding: 22px;
		}
		.value-controls,
		.value-results {
			grid-template-columns: 1fr 1fr;
		}
		.value-results > div {
			padding: 18px;
		}
		.value-results strong {
			font-size: 23px;
		}
	}
	@media (max-width: 400px) {
		.value-controls,
		.value-results {
			grid-template-columns: 1fr;
		}
	}
</style>
