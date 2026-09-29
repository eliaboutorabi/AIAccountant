<script lang="ts">
	import { toyNetwork } from '$lib/lab-math';
	import Icon from './Icon.svelte';
	import type { createNetworkScene } from '$lib/network-scene';
	let age = $state(40);
	let history = $state(30);
	let angle = $state(0);
	let playing = $state(true);
	let available = $state(true);
	let loading = $state(true);
	let scene: ReturnType<typeof createNetworkScene> | undefined;
	const result = $derived(toyNetwork(age / 100, history / 100));
	function attach(canvas: HTMLCanvasElement) {
		let detached = false;
		let current: ReturnType<typeof createNetworkScene> | undefined;
		import('$lib/network-scene')
			.then(({ createNetworkScene }) => {
				if (detached) return;
				try {
					current = createNetworkScene(canvas);
					scene = current;
					syncScene();
				} catch {
					available = false;
				}
				loading = false;
			})
			.catch(() => {
				if (!detached) {
					available = false;
					loading = false;
				}
			});
		return () => {
			detached = true;
			current?.dispose();
		};
	}
	function syncScene() {
		scene?.update([age / 100, history / 100], result.hidden, result.score, playing, angle);
	}
</script>

<div class="network-lab">
	<div class="network-view">
		<canvas
			{@attach attach}
			aria-label="A neural network with two inputs, four hidden units, and one output. Node size follows activation."
		></canvas>{#if loading}<p class="canvas-status">
				Growing a little network…
			</p>{:else if !available}<div class="canvas-fallback">
				<Icon name="network" size={55} />
				<p>The 3D view isn’t supported here.<br />The controls and numerical results still work.</p>
			</div>{/if}
		<div class="network-labels">
			<span>YOUR INPUTS</span><span>HIDDEN CONNECTIONS</span><span>TOY SCORE</span>
		</div>
		<button
			class="animation-toggle"
			onclick={() => {
				playing = !playing;
				syncScene();
			}}
			aria-pressed={!playing}
			><Icon name={playing ? 'pause' : 'orbit'} size={14} />{playing
				? 'Pause motion'
				: 'Resume motion'}</button
		>
	</div>
	<div class="network-controls">
		<div>
			<label for="age">Invoice age <strong>{age} days</strong></label><input
				id="age"
				type="range"
				min="0"
				max="100"
				value={age}
				oninput={(e) => {
					age = Number(e.currentTarget.value);
					syncScene();
				}}
			/><label for="history">Prior average delay <strong>{history} days</strong></label><input
				id="history"
				type="range"
				min="0"
				max="100"
				value={history}
				oninput={(e) => {
					history = Number(e.currentTarget.value);
					syncScene();
				}}
			/><label for="rotation">Explore the view <span>Rotate</span></label><input
				id="rotation"
				type="range"
				min="-0.7"
				max="0.7"
				step="0.01"
				value={angle}
				oninput={(e) => {
					angle = Number(e.currentTarget.value);
					syncScene();
				}}
			/>
		</div>
		<div class="network-output">
			<span class="micro-label">ILLUSTRATIVE OUTPUT</span><strong
				>{Math.round(result.score * 100)}<small> / 100</small></strong
			>
			<p>This score changes as the signals move through four hidden units.</p>
		</div>
	</div>
	<details class="disclosure">
		<summary
			><Icon name="help" size={18} />What am I actually looking at?<Icon
				name="down"
				size={16}
			/></summary
		>
		<p>
			This is a deterministic teaching network with hand-set weights and sigmoid activations, not a
			trained payment model. Inputs are divided by 100; the two signals are combined differently by
			four hidden units, then combined into one output. The visible connections are real operations
			in this toy computation. Motion is decorative; size reflects activation. The score is not a
			calibrated probability and must not be used for financial decisions.
		</p>
	</details>
</div>

<style>
	.network-view {
		height: 310px;
		position: relative;
		border-radius: 14px;
		background: radial-gradient(ellipse at 50% 45%, #e4efdc, #f5f8f0);
		overflow: hidden;
	}
	.network-view canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
	.network-labels {
		position: absolute;
		bottom: 20px;
		left: 9%;
		right: 8%;
		display: flex;
		justify-content: space-between;
		font-size: 7px;
		font-weight: 600;
		letter-spacing: 1px;
		color: #556a46;
		pointer-events: none;
	}
	.animation-toggle {
		position: absolute;
		right: 13px;
		top: 12px;
		border: 1px solid #d6e0cc;
		background: #ffffffad;
		border-radius: 6px;
		display: flex;
		gap: 6px;
		align-items: center;
		padding: 6px 9px;
		font-size: 9px;
	}
	.network-controls {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: 30px;
		padding: 26px 4px;
	}
	.network-controls label {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		margin: 15px 0 8px;
	}
	.network-controls label:first-child {
		margin-top: 0;
	}
	.network-controls label strong,
	.network-controls label span {
		color: #576a42;
		font-size: 10px;
	}
	.network-output {
		background: #f3f4e6;
		border-radius: 13px;
		padding: 25px;
		align-self: start;
	}
	.network-output > strong {
		display: block;
		font-size: 44px;
		font-family: 'Manrope Variable', sans-serif;
		letter-spacing: -2px;
		margin-top: 10px;
		color: #476d44;
	}
	.network-output strong small {
		font-size: 14px;
		letter-spacing: 0;
		color: #5f6753;
		font-weight: 400;
	}
	.network-output p {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted);
		margin-top: 10px;
	}
	.canvas-status,
	.canvas-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 17px;
		text-align: center;
		font-size: 12px;
		color: var(--muted);
		pointer-events: none;
	}
	.network-lab .disclosure {
		background: #fafbf7;
	}
	@media (max-width: 740px) {
		.network-view {
			height: 240px;
		}
		.network-controls {
			gap: 15px;
			grid-template-columns: 1.3fr 1fr;
		}
		.network-output {
			padding: 18px 12px;
		}
		.network-output > strong {
			font-size: 34px;
		}
		.network-output p {
			font-size: 10px;
		}
		.network-labels {
			font-size: 5px;
			left: 7%;
			right: 7%;
		}
		.network-controls label {
			font-size: 10px;
		}
		.network-controls label strong {
			font-size: 9px;
		}
	}
</style>
