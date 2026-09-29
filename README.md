# AI Accountant

A substantive visual course in AI for accounting and finance. Built with Svelte 5, SvelteKit, TypeScript, and Three.js.

**Course:** [AI Accountant](https://eliaboutorabi.github.io/AIAccountant/)

## What learners do

- Follow 25 connected modules across five study days: 30 planned active hours including practice and review. The estimate is an authoring budget, not a measured learner completion time.
- Work through AI history, machine learning, generalization, neural networks, forecasting, spreadsheet analysis, tokens, transformers, pretraining/adaptation, generative models, retrieval, tools, agents, skills, harnesses, and evaluation.
- Explore 82 in-chapter teaching figures: 25 original generated infographics, 50 responsive diagrams, and seven interactive explanations. Search the [visual atlas](https://eliaboutorabi.github.io/AIAccountant/visuals/) or inspect the [complete inventory](docs/visual-expansion/inventory.md). Full-resolution image zoom, text companions, and prediction questions accompany the figures.
- Answer 150 explained concept checks, 25 additional changed-case checks, 30 cumulative review prompts, and substantive written cases. First attempts, hints, solution reveals, and written self-assessment remain distinct.
- Train real models, inspect their parameters and attention, compare held-out results, and build an executable synthetic finance pipeline. The 3D network uses the actual trained weights and activations.
- Enter spreadsheet formulas; diagnose join multiplication and filter context; reconcile a variance memo; preserve source evidence and units.
- Produce five connected portfolio submissions, download original data and a runnable Node.js starter, and defend cases through the interview studio.
- Open linked technical definitions by hover, touch, or keyboard. Save notes, bookmarks, and learning evidence locally; export and merge records without discarding the original edition's notes.

All chapters are open from the start. Written rubrics are self-assessment; this is not an accredited qualification or a promise of readiness for every interview. The before/after diagnostic and role extensions help identify further practice.

## Run and verify

Use Node.js 24 and npm.

```sh
npm ci
npx playwright install chromium
npm run dev
npm run check
npm run lint
npm run test:unit -- --run
npm run test:e2e
npm run build
npm run preview
```

Use `BASE_PATH=/AIAccountant` to verify the GitHub Pages subdirectory. The workflow installs the browser runtime before both component and end-to-end tests. Development and test dependency caches are isolated. The Vitest component runner is served at the origin root; end-to-end tests verify the actual production base path and canonical trailing-slash URLs. Restart a manually running preview after rebuilding; otherwise its in-memory server manifest may reference earlier assets.

The optional local language-model verification is separate from normal tests because it downloads approximately 600 MB and requires suitable WebGPU hardware. See [model verification and limitations](docs/rebuild/local-model-verification.md). No model download occurs in normal CI.

## Implementation map

- `src/lib/course/days/`: complete authored explanations, finance cases, six concept checks per module, interview follow-ups, and primary references.
- `src/lib/course/transfer.ts`, `days.ts`: changed-case checks and cumulative review.
- `src/lib/course/components/`: reader, worked evidence, linked definitions, assessments, and notebook.
- `src/lib/course/visuals/`: typed figure catalogs, accessible renderer, real tokenization and calculated inline experiments; `static/images/visuals/` contains optimized original illustrations.
- `src/lib/course/progress.svelte.ts`: per-app learning state, validated imports, first-attempt and assistance history, and merge behavior.
- `src/lib/course/labs/`: learner interfaces and experiment-specific evidence exports.
- `src/lib/engines/`: original numerical and workflow engines; [mechanisms and provenance](src/lib/engines/README.md).
- `src/routes/downloads/[file]/+server.ts`: prerendered case briefs, datasets, reviewed solutions, and runnable starter.
- `src/routes/diagnostic/`: optional starting-point and changed return cases.
- `src/lib/data/` and `/learn/`: preserved introductory edition; archive banners point to the expanded chapters.
- `docs/rebuild/`: approved design, source register, independent agent reviews, and release evidence.
- `docs/art-direction.md`: original generated artwork and prompt provenance.
- `docs/visual-expansion/`: the complete visual inventory, exact image-generation prompts, independent educational reviews, and release checks.

The chapter content is independent of presentation. A new concept needs an explanation, a concrete case, appropriate practice, a check of transfer, and a source where applicable; a larger word count alone is not the acceptance test.

The [visual and interaction audit](docs/visual-audit/README.md) records the course-wide image review, desktop/mobile checks, defects repaired, and verification limits.

## Computation and privacy

The core numerical engines train locally on small original synthetic datasets. Formulas, forecast errors, token IDs, retrieval scores, tool validation, queue state, and evaluation grades are computed from declared inputs. Authored extraction candidates, agent decision traces, proxy-reward examples, and trial fixtures are explicitly labeled. The tiny transformer and point denoiser teach mechanisms; they are not competent finance assistants or a full image diffusion system.

The optional Qwen3 experiment deliberately downloads public model assets and runs inference on compatible local hardware in a bounded worker. No API key is embedded and no inference API is called. Incorrect or malformed model behavior stays visible. Its development observations do not establish a reliability rate.

There is no account, analytics script, or advertising. Learning records and experiment state use browser-local storage. Export the course notebook and lab evidence separately before clearing storage. Hosting and deliberately opened external references/model downloads involve ordinary requests to their respective providers. No real financial records are included.

## Deployment and credits

GitHub Actions validates types, formatting, numerical/component tests, desktop/mobile interactions and accessibility, then prerenders the course under `/AIAccountant` and deploys GitHub Pages. The old 36 lesson URLs remain reachable; old completion marks do not imply completion of the expanded course.

[Jaxverse](https://github.com/NeoVand/jaxverse) and [Pattern](https://github.com/NeoVand/pattern) inspired experiment-first teaching and inspectable model behavior. Their code and artwork were not copied. The project uses Three.js, fast-formula-parser, gpt-tokenizer, Transformers.js, Lucide, and the Svelte ecosystem under their respective licenses. The reference desk identifies tools, sources, image provenance, and the limits of each demonstration.
