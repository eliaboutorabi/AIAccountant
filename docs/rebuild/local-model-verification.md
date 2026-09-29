# Optional local model experiment

This experiment is separate from the core deterministic labs. `LocalAgentLab.svelte` loads a real Qwen3-0.6B model only after an explicit button press. It requires an available WebGPU adapter with `shader-f16`. Unsupported hardware leaves the core course fully usable. There is no inference API or API key.

## Model and runtime provenance

- Transformers.js **4.3.0**, inspected from the installed primary package source. It uses its real text-generation pipeline, tokenizer chat template, native tool definitions, greedy decoding, and a Web Worker.
- [Community ONNX conversion](https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX), pinned revision `da1453100cf3ff33ef56d17983fc7a8648706db6`; q4f16 weight file **569,789,750 bytes**. The repository API metadata was checked September 29, 2026. The tokenizer JSON adds about 9.1 MB; runtime and other files also download. The interface estimates about 600 MB and makes no universal GPU-memory claim.
- The [Qwen3-0.6B base model](https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE) declares Apache 2.0. The community conversion card references that model but does not declare a separate license in its metadata. We do not redistribute the weight file in this repository.
- The [primary WebGPU guide](https://huggingface.co/docs/transformers.js/guides/webgpu) explains the runtime path. Browser support alone does not establish that an adapter with the required feature is available.

The worker loads public model assets, then disables remote-model loading. Prompts, record lookups, calculations and retrieval execute locally. Model output is displayed as text and never executed as code. A main-thread deadline can terminate the entire worker, including an unresponsive generation. Idle unloading calls the model's disposal method; component unmount terminates its worker. Browser caches may retain public model files; a cache failure does not fabricate model availability.

## Protocol and boundaries

The native Qwen `<tool_call>` protocol and exact JSON requests are parsed without repairing malformed output, stripping arbitrary prose, merging multiple calls, or substituting an authored answer. Every actual request crosses a read-only allowlist. The existing invoice and integer-cent calculator contracts remain the execution boundary; payment preparation and version-filtered policy retrieval are real local functions. The invoice final-answer gate requires observed invoice/payment results and a matching later calculator result. This gate does not certify the semantics of the model's final prose.

The current limits are at most eight model turns, 256 generated tokens per turn, 120 seconds per run, and a five-minute load deadline. Tools cannot create drafts, post journals, pay, send externally, or execute arbitrary code. Raw model text, native proposals, actual tool results, harness rejections, configuration, supplied evidence, and reflection are exportable. The exercise explains that a citation can be present while its associated claim is unsupported.

## Observed development runs

Actual inference was exercised in headless Chromium with `--enable-unsafe-webgpu --use-angle=metal`. The reported adapter was **Apple / metal-3**, with `shader-f16`. Default headless Chromium exposed no adapter; that unsupported state was also browser-tested. These flags are a verification environment, not a promise that every user's browser requires or supports them.

The pinned model downloaded and initialized, generally in about 15 seconds in this environment. Requests were monitored through the browser context: **no requests occurred after loading during the three-case inference runs**, and no page errors occurred. These are observations of this implementation/environment, not a general browser privacy certification.

The runs exposed substantive model limitations. Early ad hoc schema instructions produced placeholder copying or fenced/multiple JSON objects. Moving to the model's native tool protocol enabled genuine tool requests. In one six-turn run the model repeatedly attempted unsupported final answers; the harness rejected them, after which the model actually called `read_invoice`, `read_payments`, and `calculate_outstanding`. The calculator returned 50,000 cents. The turn limit then ended without a final answer. Another run executed invoice lookup but emitted unstructured prose, which stopped the loop visibly.

A policy run with evidence produced the correct USD 110 limit and receipt requirement, while some versions misinterpreted the effective date or added unnecessary caveats. The context now includes explicit start/end-date semantics, and retrieval uses the question's reference date. Withheld-evidence runs sometimes admitted missing evidence and sometimes produced malformed/unsupported statements that were rejected. We retain these observations instead of claiming all cases succeeded. Changes to prompts and the harness after seeing these cases make them **development evidence**, not an independent reliability benchmark or an estimate of success rate.

## Repeat the optional check

Start a dev server and explicitly opt in. This script is not included in ordinary CI and will not download a model without the environment flag:

```sh
RUN_LOCAL_MODEL=1 LOCAL_AGENT_FLAGS='--enable-unsafe-webgpu,--use-angle=metal' node scripts/verify-local-agent.mjs
```

Set `LOCAL_AGENT_URL` if the server uses another address. Omit `LOCAL_AGENT_FLAGS` to inspect the browser's normal hardware path. Artifacts are saved under `.work/local-agent-verification/`. Run against a stable server: development hot reloads legitimately dispose the worker and interrupt a download. A successful script means real inference ran; the exported answers must still be reviewed for correctness.

Normal automated tests use explicitly labeled generation test doubles only to verify parser, schema, allowlist, state, time/turn bounds, evidence withholding, and final-answer gating. The browser test checks the no-download unsupported state, accessibility and narrow layout. Those tests make no live-model quality claim.

The retained [development export](evidence/local-model-development.json) contains the actual raw outputs, rejected proposals, executed local lookup, and three case outcomes from the final observed development batch. It records the prompt/configuration at that time; subsequent harness/metadata repairs are described above. It is an audit artifact, never replayed as a live lab answer.

## Compiled GitHub Pages path verification — September 29, 2026

The opt-in script was rerun against the completed production build at `http://127.0.0.1:4180/AIAccountant/lab/local-agent/`, using the same temporary Chromium flags and Apple / metal-3 adapter. An initial stale preview process mixed asset versions; restarting it against the completed build resolved that preview-only mismatch without a code change. The subsequent page-load probe recorded no HTTP errors or page errors; the compiled worker and bundled WASM paths returned HTTP 200. The real model downloaded and initialized from this build, and all three development cases executed.

The invoice run rejected a premature final answer with `MISSING_EVIDENCE`, executed the model's native `read_invoice` request successfully, then stopped on malformed model prose. The evidence-on travel run proposed the USD 110 limit and receipt requirement with TRAVEL-02; the evidence-off run stopped on malformed output. These observations verify compiled worker loading, actual inference, and the tool/answer boundaries—not general answer quality. The browser recorded **zero inference-time network requests and zero page errors**. The verification browser closed and its model was unloaded; the root preview was left running. Local artifacts are in `.work/local-agent-verification/`.
