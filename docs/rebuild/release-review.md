# Expanded course release evidence

## Delivered learning experience

The expanded edition has 25 substantive modules, 150 concept checks with all-option reasoning, 25 separate changed-case checks, 30 cumulative retrieval prompts, written assignments with reviewed solutions, and case interview follow-ups. Five daily submissions culminate in an executable synthetic finance-system portfolio. An optional eight-case before/after diagnostic sits outside the 30-hour core estimate.

The module budgets total 330 minutes per day plus 30 minutes of cumulative review: 1,800 active minutes, excluding breaks. They have not been validated in a learner timing pilot. Independent professional and novice **agent** reviews are documented in professional-review.md and novice-review.md; they are not accounting-practitioner or learner field trials.

## Changes from the original specification

- Transfer is organized as one substantive new case per module, reinforced by assignments, interview follow-ups, and daily reviews. There is not an additional numeric variant for every individual concept-check option. The interface reports 150 concept checks and 25 transfer cases separately.
- The chapter reader has five or six sections per module rather than the originally suggested two to four. Reading, notebook work, and self-assessed case evidence remain separate.
- The main time series is 72 synthetic monthly **collections** observations, with five forecasting methods, three horizons, rolling-origin evaluation, causal interval calibration, and a disclosed regime-change scenario. It is not a complete 72-month real financial-statement dataset.
- The data pack consists of purpose-specific, labeled cohorts: M09 customer-ledger records, September variance records, PIPE-01 practice reconciliation, original policies/documents, and WILLOW-FINAL-02 final cohorts. Cross-case bridges identify where a different cohort or unit system is being introduced.
- The core spreadsheet interface evaluates actual formulas and exports formula/value TSV files. The join/filter workbench executes equivalent JavaScript transformations and displays SQL, Power Query, and DAX guidance; it does not claim to embed those vendor runtimes.
- The micro-transformer runs a real CPU training loop. The separate adaptation workbench preserves parameters and Adam/RNG state across general-to-finance training, compares both validation domains, and freezes both final sets. The proxy-reward selector is an authored explanatory activity, not an RL training engine.
- The retrieval workbench computes keyword and TF-IDF term-vector search over original versioned documents. These vectors are not learned neural embeddings. Model-based retrieval concepts are taught separately.
- The denoising engine learns on two-dimensional points, with measured errors and source distributions. It is not a complete image diffusion model. Document extraction candidates are authored fixtures; learner field validation is actual computation.
- The default agent trace and some repeated trial outcomes are authored and labeled. Core tools, workflow state, failure injection, retries, and graders execute. The optional Qwen3 experiment performs genuine local inference on supported hardware; its observed mistakes and actual tool calls are retained in local-model-verification.md.
- Original generated artwork supplies visual metaphors; measurements come from computed charts and tables. No code or artwork was copied from the reference repositories.
- The old polynomial playground is no longer routed from the course. Original introductory lessons and notes remain accessible with explicit expanded-edition links. Its old solver is not reused by the new training or forecasting engines.

## Assessment and evaluation integrity

First submitted answers, revisions, hints, and solution reveals have separate records. Written responses can preserve a first snapshot, while rubric completion remains explicitly self-assessed. Imports validate structure and merge event histories without presenting old unknown assistance history as independent success. A blank or long response cannot automatically establish competence.

Model final-case exposure is stored by dataset identity. Reopening a fixed corpus or changing a model initialization does not make those documents independent again. Missing, corrupt, or blocked storage produces an unknown-history message. Public browser cases are instructional, not securely proctored.

The capstone's eight WILLOW-FINAL-02 cases are distinct from the public PIPE-01 development cases and combine changed amounts, sources, policy conditions, and recovery failures. The first commitment and result persist. A repaired rerun is visibly consulted-case evidence. A walkthrough intentionally obtained 0/8, repaired to 8/8, reloaded, and verified that the first 0/8 remained in both the UI and export. The lost-response trace inspected actual state and retried the stable key without creating another queue item.

## Software verification

The verification commands are run against the exact implementation before publication, including the `/AIAccountant` base path:

```sh
npm run check
npm run lint
npm run test:unit -- --run
npm run test:e2e
npm run build
```

Before the final base-path gate, the integrated test suite passed all 127 numerical, contract, state, and component tests. The 20 end-to-end tests cover every expanded chapter, each laboratory implementation, formula updates, model commitment, keyboard definitions, downloads, legacy import, denied storage, and desktop/mobile accessibility. An additional all-chapter accessibility/overflow pass exposed and repaired a mobile reading-width issue. A pre-hydration note-entry race was repaired by enabling the notebook after its state is loaded.

Official Svelte MCP autofixer checks are run for every authored Svelte component. Desktop/mobile screenshots of the reader, forecast, neural/transformer, representation, denoising, adaptation, and capstone were inspected. Numerical tests include gradient checks, causal masking, actual held-out behavior, exact reconciliation controls, and information-at-origin invariance. These software checks do not prove educational effectiveness.

Final local release gate: `npm run check` reported zero errors and zero warnings; formatting and ESLint passed; all 127 tests across 19 unit/component files passed; all 20 desktop/mobile end-to-end tests passed with `BASE_PATH=/AIAccountant`. The browser suite builds the production artifact. All 34 changed Svelte files passed the official autofixer with zero issues and zero suggestions.

The compiled optional local-model worker was also verified separately under `/AIAccountant/`: worker/WASM assets loaded successfully, real inference executed, tool/evidence gates rejected invalid output, and the verification observed no page errors or network requests after model initialization. This is execution evidence, not a claim of answer reliability; the recorded model failures remain in `local-model-verification.md`.

Publication status is appended after deployment finishes. The retained source includes reproducible tests and the original worked cases; transient build logs and screenshots live in the ignored `.work` directory.
