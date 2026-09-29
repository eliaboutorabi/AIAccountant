import {
	LOCAL_MODEL,
	LOCAL_AGENT_TOOLS,
	boundedConfig,
	runLocalAgent,
	type AgentWorkerInput,
	type AgentWorkerOutput
} from './local-agent';
import type { TextGenerationPipeline } from '@huggingface/transformers';

let generator: TextGenerationPipeline | null = null;
let busy = false;
const send = (message: AgentWorkerOutput) => postMessage(message);
self.onmessage = async (event: MessageEvent<AgentWorkerInput>) => {
	if (busy) {
		send({
			type: 'error',
			message: 'The worker is already busy. Stop and unload before starting another operation.'
		});
		return;
	}
	busy = true;
	try {
		if (event.data.type === 'load') {
			const adapter = await navigator.gpu?.requestAdapter();
			if (!adapter || !adapter.features.has('shader-f16'))
				throw new Error(
					'This experiment needs an available WebGPU adapter with shader-f16 support. No weights were requested. The core course does not need WebGPU.'
				);
			const { pipeline, env } = await import('@huggingface/transformers');
			env.allowLocalModels = false;
			env.allowRemoteModels = true;
			env.useBrowserCache = true;
			generator = await pipeline('text-generation', LOCAL_MODEL.id, {
				device: 'webgpu',
				dtype: LOCAL_MODEL.dtype,
				revision: LOCAL_MODEL.revision,
				progress_callback: (progress) => {
					if ('file' in progress)
						send({
							type: 'progress',
							file: String(progress.file),
							progress:
								'progress' in progress && typeof progress.progress === 'number'
									? progress.progress
									: null,
							...('loaded' in progress && typeof progress.loaded === 'number'
								? { loaded: progress.loaded }
								: {}),
							...('total' in progress && typeof progress.total === 'number'
								? { total: progress.total }
								: {})
						});
				}
			});
			// Model files are ready. Inference uses resident tensors; no remote model fallback is allowed.
			env.allowRemoteModels = false;
			send({ type: 'ready' });
		} else if (event.data.type === 'dispose') {
			await generator?.dispose();
			generator = null;
			send({ type: 'disposed' });
		} else {
			if (!generator) throw new Error('Load the optional model before running it.');
			const { TextStreamer } = await import('@huggingface/transformers');
			const config = boundedConfig(event.data.config);
			const model = generator;
			const outcome = await runLocalAgent(
				config,
				async (messages, maxTokens, turn) => {
					const response = await model(messages, {
						max_new_tokens: maxTokens,
						tools: LOCAL_AGENT_TOOLS,
						do_sample: false,
						tokenizer_encode_kwargs: { enable_thinking: false },
						streamer: new TextStreamer(model.tokenizer, {
							skip_prompt: true,
							skip_special_tokens: true,
							callback_function: (text) => send({ type: 'token', turn, text })
						})
					});
					const generated = response[0]?.generated_text;
					if (!Array.isArray(generated))
						throw new Error('Unexpected model output format. No tool was executed.');
					const content = generated.at(-1)?.content;
					if (typeof content !== 'string')
						throw new Error('The model returned no text. No tool was executed.');
					return content;
				},
				(event) => send({ type: 'trace', event })
			);
			send({ type: 'done', outcome });
		}
	} catch (error) {
		send({ type: 'error', message: error instanceof Error ? error.message : String(error) });
	} finally {
		busy = false;
	}
};
