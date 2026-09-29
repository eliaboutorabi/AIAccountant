<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	const uid = $props.id();
	let input = $state('The invoice is overdue.');
	let tokenizer: typeof import('gpt-tokenizer/encoding/o200k_base') | undefined;
	let tokens = $state<{ id: number; piece: string }[]>([]);
	let decoded = $state('');
	let selected = $state(0);
	let pending = $state(true);
	let error = $state('');
	const vector = [-0.38, 0.72, 0.16, -0.51];
	function encode() {
		if (!tokenizer) return;
		try {
			const ids = tokenizer.encode(input);
			tokens = ids.map((id) => ({ id, piece: tokenizer!.decode([id]) }));
			decoded = tokenizer.decode(ids);
			selected = Math.min(selected, Math.max(0, tokens.length - 1));
			error = '';
		} catch {
			error = 'This text could not be encoded. No estimated IDs are substituted.';
		}
	}
	onMount(() => {
		let active = true;
		import('gpt-tokenizer/encoding/o200k_base')
			.then((module) => {
				if (!active) return;
				tokenizer = module;
				pending = false;
				encode();
			})
			.catch(() => {
				if (active) {
					pending = false;
					error = 'The tokenizer vocabulary could not load. Reload to try again.';
				}
			});
		return () => {
			active = false;
		};
	});
</script>

<div class="ie-tokenizer">
	<label class="ie-label" for={`${uid}-input`}>1 · Text to encode</label>
	<textarea
		id={`${uid}-input`}
		class="ie-input"
		rows={2}
		maxlength={220}
		bind:value={input}
		oninput={encode}></textarea>
	<div class="ie-actions" aria-label="Token examples">
		<button
			class="ie-button ie-small"
			onclick={() => {
				input = 'invoice';
				encode();
			}}>invoice</button
		><button
			class="ie-button ie-small"
			onclick={() => {
				input = ' invoice';
				encode();
			}}>␣invoice</button
		><button
			class="ie-button ie-small"
			onclick={() => {
				input = 'INV-2026-009381: €1,208.00';
				encode();
			}}>An invoice reference</button
		>
	</div>
	{#if pending}<p class="ie-note" role="status">
			Loading the real o200k_base vocabulary…
		</p>{:else if error}<p class="ie-note" role="alert">{error}</p>{:else}
		<div class="ie-token-heading">
			<strong>2 · Vocabulary lookup</strong><span
				>{tokens.length}
				{tokens.length === 1 ? 'token' : 'tokens'} · {[...input].length} Unicode characters</span
			>
		</div>
		<div class="ie-token-stream" role="group" aria-label="Actual token pieces and vocabulary IDs">
			{#each tokens as token, i (i)}<button
					class={`ie-token ie-tint-${i % 5}`}
					class:ie-selected={selected === i}
					aria-pressed={selected === i}
					aria-label={`Token ${i + 1}: ${token.piece}, ID ${token.id}`}
					onclick={() => (selected = i)}
					><code>{token.piece.replaceAll(' ', '·').replaceAll('\n', '↵') || '∅'}</code><span
						>ID {token.id}</span
					></button
				>{/each}
			{#if !tokens.length}<p class="ie-note">Empty input produces zero tokens.</p>{/if}
		</div>
		{#if tokens[selected]}
			<div class="ie-lookup">
				<div class="ie-address">
					<span>Actual integer ID</span><strong>{tokens[selected].id}</strong><code
						>{JSON.stringify(tokens[selected].piece)}</code
					>
				</div>
				<div class="ie-lookup-arrow"><Icon name="arrow" size={26} /><span>select a row</span></div>
				<div class="ie-vector">
					<strong>3 · Embedding table → a vector</strong>
					<div class="ie-vector-cells">
						{#each vector as value, i (i)}<div>
								<span>d{i + 1}</span><b style={`background:${value < 0 ? '#e7ddef' : '#dce7d1'}`}
									>{value.toFixed(2)}</b
								>
							</div>{/each}
					</div>
					<span class="ie-tag">Illustrative values · 4 dimensions shown</span>
				</div>
			</div>
		{/if}
		<p class="ie-note">
			<strong>Different jobs:</strong> the token tiles and IDs above are real. The same example vector
			is shown for any selected ID because production embedding weights are not loaded. In a trained model,
			each ID selects its own learned row; position information is added separately.
		</p>
		<details class="ie-details">
			<summary>Verify the full text & understand the scope</summary>
			<p>
				<strong>{decoded === input ? 'Exact round trip.' : 'Round trip differs.'}</strong> Decoding the
				complete ID sequence returns:
			</p>
			<pre>{decoded || '(empty text)'}</pre>
			<p>
				Spaces are · and newlines are ↵ in tiles. Some tokens contain partial UTF-8 bytes; a token
				decoded alone can show �. The complete decoded sequence is the validity check. o200k_base is
				a specific encoding, not a universal token count or a chat-request size estimate.
			</p>
		</details>
	{/if}
</div>
