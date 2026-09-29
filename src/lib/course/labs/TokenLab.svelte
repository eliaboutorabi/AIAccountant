<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	let text = $state('Accounts receivable: WIL-2026-009381 is overdue.');
	let tokenizer: typeof import('gpt-tokenizer/encoding/o200k_base') | undefined;
	let tokens = $state<{ id: number; piece: string }[]>([]);
	let decoded = $state('');
	let loading = $state(true);
	let error = $state('');
	let vocabulary = $state(0);
	function run() {
		if (!tokenizer) return;
		try {
			const ids = tokenizer.encode(text);
			tokens = ids.map((id) => ({ id, piece: tokenizer!.decode([id]) }));
			decoded = tokenizer.decode(ids);
			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Encoding failed.';
		}
	}
	onMount(() => {
		let active = true;
		import('gpt-tokenizer/encoding/o200k_base')
			.then((value) => {
				if (!active) return;
				tokenizer = value;
				vocabulary = value.vocabularySize;
				loading = false;
				run();
			})
			.catch(() => {
				if (active) {
					loading = false;
					error =
						'The tokenizer could not load. Reload to retry; no estimated tokens are substituted.';
				}
			});
		return () => {
			active = false;
		};
	});
	const examples = [
		'accounts receivable',
		'Accounts receivable',
		' accounts receivable',
		'WIL-2026-009381',
		'Café Müller received €1,208.00.',
		'株式会社 Willow: 売上高'
	];
</script>

<div class="token-lab">
	<header>
		<p class="eyebrow">ACTUAL TEXT ENCODING · o200k_base</p>
		<h2>Look inside the sentence.</h2>
		<p>
			A token is a vocabulary entry. Change the text and inspect the exact pieces and IDs from this
			named tokenizer.
		</p>
	</header>
	<label for="token-input">Your text</label><textarea
		id="token-input"
		bind:value={text}
		maxlength={3000}
		rows={4}
		oninput={run}></textarea>
	<div class="examples" role="group" aria-label="Tokenizer examples">
		{#each examples as example (example)}<button
				onclick={() => {
					text = example;
					run();
				}}>{example}</button
			>{/each}
	</div>
	{#if loading}<p class="status">Loading the local tokenizer vocabulary…</p>{:else if error}<p
			class="status"
			role="alert"
		>
			{error}
		</p>{:else}<div class="token-metrics">
			<div><strong>{tokens.length}</strong><span>tokens</span></div>
			<div><strong>{[...text].length}</strong><span>Unicode characters</span></div>
			<div>
				<strong>{text.trim() ? text.trim().split(/\s+/).length : 0}</strong><span
					>whitespace-separated pieces</span
				>
			</div>
			<div>
				<strong>{decoded === text ? 'Exact' : 'Different'}</strong><span
					>full-sequence round trip</span
				>
			</div>
		</div>
		<div class="tokens" aria-label="Token pieces and IDs">
			{#each tokens as token, i (i)}<span class={`token color-${i % 5}`}
					><code>{token.piece.replaceAll(' ', '·').replaceAll('\n', '↵')}</code><small
						>{token.id}</small
					></span
				>{/each}
		</div>
		<div class="decoded">
			<strong><Icon name="check" size={15} />Decode the complete sequence</strong>
			<pre>{decoded || '(empty input)'}</pre>
		</div>
		<p class="explain">
			Spaces appear as · and newlines as ↵ in the token tiles. A single token can contain partial
			UTF-8 bytes, so decoding it alone may show a replacement character. The full sequence above is
			the round-trip check. IDs are indexes, not meaning scores.
		</p>
		<details>
			<summary>Encoding scope and a useful comparison</summary>
			<p>
				This uses gpt-tokenizer’s o200k_base encoding, with {vocabulary.toLocaleString()} vocabulary entries
				as reported by the library. It is not a universal tokenizer and does not include chat-message
				overhead, provider-specific image accounting, or pricing.
			</p>
			<p>
				The trainable transformer in the neighboring lab intentionally uses a much smaller character
				vocabulary. Its context lengths and IDs are not comparable to these subword token counts.
			</p>
			<p>
				Try two invoice IDs with the same character count and different digits. Predict their token
				counts first. Then explain why a rough “tokens per word” rule cannot verify an actual
				request length.
			</p>
		</details>{/if}
</div>

<style>
	.token-lab {
		padding: 32px;
		background: linear-gradient(140deg, #f1eef8, #fcfcf8);
		border: 1px solid #dfdaeb;
		border-radius: 20px;
	}
	.token-lab header h2 {
		font-size: 30px;
		letter-spacing: -0.7px;
		margin: 12px 0 16px;
	}
	.token-lab header > p:last-child {
		font-size: 15px;
		line-height: 1.8;
		color: var(--muted);
		max-width: 650px;
	}
	.token-lab > label {
		display: block;
		font-size: 12px;
		font-weight: 700;
		margin: 28px 0 10px;
	}
	.token-lab textarea {
		width: 100%;
		resize: vertical;
		background: white;
		border: 1px solid #d9d3e5;
		border-radius: 13px;
		padding: 19px;
		font-size: 18px;
		line-height: 1.7;
	}
	.examples {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 15px 0;
	}
	.examples button {
		padding: 8px 11px;
		border: 1px solid #dfd9e9;
		border-radius: 8px;
		background: #fff;
		font-size: 11px;
	}
	.token-metrics {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin: 28px 0;
	}
	.token-metrics > div {
		background: #ffffff99;
		border: 1px solid #e4dfec;
		border-radius: 12px;
		padding: 18px;
	}
	.token-metrics strong {
		display: block;
		font-size: 24px;
		color: #514b70;
	}
	.token-metrics span {
		display: block;
		font-size: 10px;
		color: #65606d;
		line-height: 1.6;
		margin-top: 7px;
	}
	.tokens {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		padding: 22px;
		background: white;
		border: 1px solid #dfdae8;
		border-radius: 14px;
		min-height: 100px;
	}
	.token {
		display: flex;
		flex-direction: column;
		border-radius: 7px;
		padding: 10px 12px;
		min-width: 42px;
		justify-content: space-between;
		gap: 10px;
	}
	.token code {
		font-size: 15px;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.token small {
		font-size: 9px;
		color: #42573d;
	}
	.color-0 {
		background: #e2eddd;
	}
	.color-1 {
		background: #e9e2f5;
	}
	.color-2 {
		background: #fae7d4;
	}
	.color-3 {
		background: #e0efed;
	}
	.color-4 {
		background: #f4edcc;
	}
	.decoded {
		padding: 20px;
		background: #edf3e6;
		border-radius: 13px;
		margin-top: 20px;
	}
	.decoded strong {
		font-size: 12px;
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.decoded pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 14px;
		line-height: 1.8;
		margin: 13px 0 0;
	}
	.explain,
	.token-lab details p {
		font-size: 13px;
		line-height: 1.85;
		margin-top: 20px;
		color: var(--muted);
	}
	.token-lab details {
		margin-top: 25px;
		border-top: 1px solid #dcd7e6;
		padding-top: 20px;
	}
	.token-lab summary {
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	.status {
		padding: 25px;
		font-size: 14px;
	}
	@media (max-width: 600px) {
		.token-lab {
			padding: 22px;
		}
		.token-metrics {
			grid-template-columns: repeat(2, 1fr);
		}
		.token-lab textarea {
			font-size: 16px;
		}
		.tokens {
			padding: 16px;
		}
	}
</style>
