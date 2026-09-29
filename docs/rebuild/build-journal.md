# Implementation journal

The substantive rebuild is active. The specification in this directory is approved.

- Persistent goal: fully implement, independently review, commit, push, and verify all 25 modules and required labs.
- Continuation heartbeat: `finish-ai-accountant-rebuild`, every 30 minutes, attached to this chat. Delete once the goal is complete.
- Current baseline: main, f010bf1. Keep all existing notes and lesson URLs usable.
- Professional review agent: `professional_education`; novice/prerequisite review agent: `novice_education`.
- Content contract: `src/lib/course/types.ts`. Main agent owns common types, rendering, routes, progress, and integration.

## Work remaining

1. Author all 25 modules as substantial connected instruction, real worked cases, rigorous checks and written assignments.
2. Implement course reader, five-day navigation, accessible linked terms, progress evidence and export.
3. Implement genuine train/test model labs, spreadsheet formula exercises, forecasting, token/transformer mechanics, retrieval/tools/agent experiments and capstone.
4. Add meaningful original visual explanations and artwork; retain provenance and external licenses.
5. Run professional and novice reviews, repair gaps, validate numerical and interaction behavior, check desktop/mobile/accessibility.
6. Commit coherent increments, deploy the completed edition to GitHub Pages, verify live routes and labs.

Completion is not established by a successful software build. Keep educational review evidence separate from tests and unperformed learner pilots.

## September 29 implementation checkpoint

- All25 authored modules now exist in `src/lib/course/days/` (days1,2,4,5 by reviewers; day3 by main agent). Cross-review is actively repairing gaps. Content is not yet a completed release.
- New reader, rich blocks, worked feedback, written notebook, self-assessment, linked term popovers, five-day home/path are implemented and being integrated. New progress uses its own v2 key; legacy data remains untouched.
- Real MLP and tiny transformer engines pass numerical gradient/learning/masking tests. Their standalone Svelte labs also pass desktop/mobile interactions and axe. The learning_engines agent is now building representations and denoising.
- Spreadsheet engine and first two presets pass formula, cycle, error, and changed-input checks. Spreadsheet UI and actual o200k_base token explorer exist. Additional M09 preset, data join/filter experiment, document inspection, and ROI lab remain root-owned.
- professional_education is implementing WorkflowLab + workflow engine/tests for retrieval/tools/agents/harness/evaluation/pipeline/capstone.
- novice_education is finishing cross-review and six daily cumulative questions, then owns ForecastLab + forecast engine/tests.
- Two inspected original generated images are saved under static/images: analytics-atelier.webp and systems-atelier.webp. Full prompts/provenance are in docs/art-direction.md.
- Root still needs lab routes/catalog, legacy lesson upgrade links, new interview/projects/glossary/progress/resources, course integrity checks, browser verification and actual deployment. Do not report complete before those gates and the remaining detailed plan are fulfilled.

## Integration checkpoint after first full browser pass

- Curriculum content and original images committed as dfc7e36. Main has not yet been pushed; the completed release is still under verification.
- All expanded routes, 25 chapters, 22 lab entries (including newly added adaptation), interview studio, portfolio/downloads, glossary, progress migration, and diagnostic exist.
- First integrated desktop/mobile suite: 20 tests passed. It traverses every chapter, loads each lab component, performs spreadsheet/regression actions, checks legacy import and denied storage, and audits principal pages with axe. Accessibility repairs include readable label contrast, keyboard-scrollable evidence, and mobile notebook actions.
- Assessment now retains first attempts, hints, reveals, and written snapshots. Novice reviewer authored 25 separate changed cases; they do not inflate the 150 concept-check count. The current implementation uses module-level changed cases rather than one numerical variant for every concept check.
- Genuine optional local-model inference was exercised on Apple WebGPU; raw failures and actual tool calls are retained in docs/rebuild/evidence. It is a development observation, not a reliability benchmark.
- Remaining substantive work: professional agent is finishing general-to-finance adaptation QA and M13 instructions; novice agent is separating capstone final cases from earlier practice; learning agent is persisting final-case exposure across revisits. Root is finishing publication docs, editorial cleanup, final base-path build/test/lint, commits, push, deployment verification.
- Heartbeat and goal remain active until deployment is verified. No learner timing pilot or external certification has been performed.

## Final implementation gate

- All remaining implementation and educational review work from the checkpoints above is complete, including adaptation, distinct capstone final cases, persistent model-case exposure, and novice prerequisite repairs.
- Type checking: zero errors and zero warnings. Prettier and ESLint passed. Official Svelte autofixer: 34 changed files, zero issues and zero suggestions.
- Final base-path tests: 127 unit/component tests in 19 files and all 20 desktop/mobile end-to-end tests passed. Every expanded chapter was checked for accessibility and viewport overflow.
- The compiled optional model ran under `/AIAccountant/` with actual downloads and inference. Asset loading and guard behavior passed; malformed model output stayed visible and was rejected. This is not a model quality benchmark.
- The implementation is ready for publication. Only commit/push, hosted deployment verification, and closing the continuation loop remain. The 30-hour schedule remains an authored study budget, not a measured learner completion time.
