# Assessment, architecture, and delivery

Status: original implementation specification, now delivered with the explicit refinements in release-review.md. The release record distinguishes tested functionality, independent agent review, and unperformed human learner pilots.

## Assessment is part of the instruction

Begin with a short diagnostic containing an unfamiliar data table, a model-selection problem, a generated claim, and a system-design question. Let the learner state uncertainty. Revisit equivalent concepts on day five with different cases. Do not interpret a higher score on repeated identical questions as proof of transfer.

Create an assessment bank of approximately 150 module activities, 30 cumulative review prompts, and 10 capstone tasks. These are an authoring allocation, not a marketing claim or a requirement to invent filler. A module's six activities can mix numerical checks, evidence selection, counterexamples, fault diagnosis, short explanation, and transfer. The type should follow the learning objective. Time is included in the module budgets.

Every activity has:

- Stable ID, associated objective, prerequisites, and a difficulty rationale.
- The complete information needed to solve it, including units and assumptions.
- A reviewed solution with intermediate reasoning.
- A reason each plausible alternative is weaker or wrong under the stated conditions.
- A hint sequence that reveals progressively more help.
- A new-case variant, not merely shuffled answer letters.
- An explicit grading method: deterministic, self-assessed, or human-reviewed.

Use plausible mistakes: a random split when forecasting, selecting a threshold from accuracy, mixing percentages and percentage points, confusing retrieval with fine-tuning, and trusting a citation without checking its support. Avoid joke alternatives such as “make the prompt more polite” unless the wording itself is the concept under discussion.

## Three different kinds of progress

1. **Studied:** the learner has visited/marked the explanation and worked example.
2. **Practiced:** the learner has attempted the experiment and associated task.
3. **Demonstrated:** an explicit objective has evidence from reviewed checks and a transfer task.

Written self-assessment remains labeled self-assessment. Text length, keywords, or pressing “reveal solution” cannot automatically establish mastery. A human or optional model grader needs a rubric and calibration; model judgment is never quietly presented as objective certification.

Store the first attempt, hints used, corrected response, and self-assessment separately. Unlimited retry is useful for learning, but the final green state must not erase the evidence that the answer was revealed.

The application may hide final case results until commitment for instructional reasons. Since GitHub Pages serves client assets, this is not secure exam proctoring. Do not claim that cases are inaccessible to someone inspecting the source.

## Daily submissions

| Day | Submission                        | Essential checks                                                                            |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Data contract and model decision  | Decision-time features, justified split, baseline, threshold consequences                   |
| 2   | Analytical workbook/report        | Totals reconcile; forecast uses past information; measures preserve grain and units         |
| 3   | LLM explanation and variance memo | Correct mechanism; supported claims; correct amounts; appropriate unknowns                  |
| 4   | System design pack                | Retrieval evidence; valid tool contracts; distinct skill/harness responsibilities; recovery |
| 5   | Prototype and defense             | Reproducible execution; evaluation evidence; incident diagnosis; justified limits           |

A daily review should draw from prior days as well as the latest material. Retention prompts at roughly one and several weeks can be offered as optional study tasks. The actual value and interval should be reviewed through learner use; a five-day schedule alone does not prove durable learning.

## Interview studio redesign

Replace answer-reveal cards as the primary experience with case interviews. Each case supplies source material and moves through:

1. A two-minute initial explanation.
2. A concrete dataset/output/trace to inspect.
3. A changed constraint.
4. A challenge to an assumption.
5. A proposed experiment or implementation.
6. A rubric-based debrief with examples of weak, competent, and strong reasoning.

Example: “Your overdue classifier has 92% recall.” Follow with the class prevalence, review capacity, calibration plot, and dollar cost of false alarms. Then change the customer mix. A strong learner must reconsider the decision; repeating a definition of recall is insufficient.

### Role expectations and extensions

| Role                    | Evidence from the core                                                       | Additional guided practice                                                                              |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Finance transformation  | Process choice, reconciled analysis, business case, review controls          | 6–8 hours: process mapping, requirements workshop, adoption plan, benefits measurement                  |
| Analytics advisory      | Grain, joins, metrics, forecast validation, clear narrative                  | 8–12 hours: Power Query, SQL joins/windows, DAX/filter context, dashboard reconstruction                |
| Data science in finance | Leakage, evaluation, baselines, calibration, forecasting rationale           | 12–20 hours: Python/pandas, pipelines, statistical inference, feature engineering, model diagnostics    |
| AI engineering          | Context/retrieval/tool distinctions, evaluation design, prototype boundaries | 12–20 hours: APIs, schemas, authentication, deployment, observability, performance/cost measurement     |
| Agent engineering       | Trace analysis, bounded execution, skills/harnesses, recovery reasoning      | 12–20 hours: persistent state, retries/idempotency, sandboxing, regression suites, multi-step incidents |

Extension hours are planning estimates and depend on prior experience. They do not promise professional fluency. The course should say which skills it has actually assessed. It must not promise readiness for every interview or make five days a substitute for substantial software/statistics experience.

## Content architecture

The current two-paragraph object is too restrictive. Use typed module metadata plus section-level content and reusable interactive components.

Proposed structure:

    src/lib/course/
      curriculum.ts            day/module metadata and prerequisites
      objectives.ts            observable outcomes and assessment mapping
      modules/                 authored section blocks
      cases/                   manifests and source references
      assessments/             prompts, feedback, rubrics, variants
      sources.ts               source, date, claim scope, review notes
    src/lib/components/learning/
      ReadingSection.svelte
      WorkedExample.svelte
      ExperimentFrame.svelte
      EvidenceTable.svelte
      ClaimInspector.svelte
      Reflection.svelte
      Assessment.svelte
    src/lib/experiments/
      numerical kernels, seeded data, workers, contracts
    static/course-data/
      versioned datasets, policies, starters, solutions

The exact file names can change during implementation. Keep content independent of presentation so a chapter is not constrained to a generic card template.

Each module records objectives, prerequisites, section order, estimated reading/practice/review time, accounting refreshers, cases, labs, assessments, sources, and version. Each experiment records its engine type, dataset provenance, seed/configuration, actual versus illustrative values, limits, and accessibility alternative.

Source IDs and claim IDs must be stable. References should sit near the claim or visual they support. A list of links at the bottom is not a substitute for checking the material.

## Experiment architecture

Use a small set of coherent engines rather than 25 unrelated demos:

| Engine                           | Shared uses                                       | Required correctness                                                                 |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Data/split engine                | Leakage, model selection, later monitoring        | No future or final-case labels enter training or selection                           |
| Regression/classification engine | Training, fit, regularization, thresholds         | Predictions and chart values come from the same parameters                           |
| Neural-network engine            | Forward pass, learning, representation inspection | Finite-difference/gradient checks; snapshots agree with displayed activations        |
| Forecast engine                  | Baselines, rolling origins, horizon, intervals    | Every fit uses only information available at its origin                              |
| Token/language engine            | Tokenization, generation, optional tiny training  | Round trips, normalized distributions, causal masking, correct training targets      |
| Finance calculation engine       | Variance, reconciliation, tools, capstone         | Exact declared rounding and deterministic control totals                             |
| Evidence/trace engine            | Retrieval, tools, workflow, agents, evaluations   | Actual inputs/results, explicit provenance, bounded execution, no fabricated success |

Run heavy work in cancellable workers. Ensure reset, navigation, dataset switches, and new runs cannot display stale results from previous work. Model weights, random seeds, and dataset versions should be inspectable.

The existing polynomial solver's silent mean fallback on a singular solve deserves review before reuse: a failed fit should not be displayed as a successful chosen model. Replace it with a numerically robust approach or explicit failure state and test difficult configurations. Preserve the original calculation tests, but add tests for the new scientific claims.

Core browser activities should work without paid APIs. Keep numerical labs small enough for ordinary CPU execution where possible. A tiny transformer training experiment may have a WebGPU path and an openly labeled saved-run inspection alternative. A saved run must include its model/configuration/data provenance and cannot pretend to be live training.

Optional actual language-model inference uses a clearly selected local or external provider. Show download size and device requirements before loading large weights. External requests require a deliberate connection and a clear account of what is sent. No developer key is embedded in the static site. A failed live call must remain a failure; no authored response is substituted invisibly.

For a GitHub Pages deployment, any server-only demonstration runs in a downloadable local starter or a separately authorized service. Do not imply the static site can secretly protect a server credential or host a durable production agent.

## Visual and tone changes

Preserve the general shell and color system. Increase the reading width only enough for comfortable prose; allow wider experiment figures with captions and a chapter table of contents. Use clear subheadings, section progress, resumable notes, and “technical detail” disclosures.

Replace:

| Current copy pattern                            | Direction                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| “A little check-in”                             | “Apply the concept”                                                |
| “Next little step”                              | “Next section”                                                     |
| “That’s it. You’ve got this.”                   | Explain specifically what the answer established                   |
| Generic “8 min” on every lesson                 | Reading, experiment, and practice budgets from authored activities |
| Completion based only on two correct selections | Evidence by objective and assessment type                          |

Friendly feedback should acknowledge the reasoning and explain the next step. It should not infantilize the learner or imply expertise after one easy answer.

Every new generated image needs a teaching purpose, descriptive alternative text where meaningful, and provenance. Use generated art for case introductions and conceptual metaphors. Use computed charts for measurements. Never bake essential lesson prose into an image.

## Progress and route migration

- Introduce versioned learning records and stable content IDs independent of array indexes.
- Preserve all existing notes and bookmarks with their original lesson references.
- Keep the old 36 URLs reachable through prerendered alias pages or explicit links to the mapped new section.
- Map previous “completed” entries to “studied in the introductory edition,” not automatically to demonstrated objectives in the expanded course.
- Allow export before migration and retain unmapped legacy notes in an accessible archive.
- Preserve the per-app-instance state pattern to avoid shared server-rendering state.
- Test denied storage, malformed imports, repeated imports, partial data, and idempotent migration.

## Ordered implementation increments

### Increment 0 — Research and specification

Deliver this planning package, source register, schedule, reference audit, and complete worked margin case. Status: authored in this planning pass. Duration estimates and educational thresholds remain unvalidated.

### Increment 1 — LLM benchmark and learning components

Author M11–M14 fully before declaring the new content template ready. Build section navigation, worked examples, evidence inspection, richer assessment, and objective records through this unit. Implement the token and generation walkthroughs, then actual small-model training and its fallback. Include prerequisite recaps for preview readers.

Acceptance: every outcome is taught and assessed; all case numbers reconcile; diagrams are accurate; the unit is usable on desktop/mobile and with a keyboard; estimates clearly remain provisional until piloted.

### Increment 2 — Foundations and analytical practice

Build M01–M10 using the reusable components, real training, leakage cases, final-case commitment, rolling forecasts, and equivalent spreadsheet/browser practice. Replace shallow existing text rather than layering the new material beneath it.

Acceptance: the learner has the concepts and practical steps needed for day three and the capstone. Review historical accuracy and accountancy refreshers alongside the numerical engines.

### Increment 3 — Generative systems and application engineering

Build M15–M20: multimodal extraction, retrieval, exact tools, workflows, agents, skills, harnesses, and comparative prompt/system evaluation. Distinguish simulated traces from real inference.

Acceptance: failures and incomplete evidence are inspectable; controls are enforced in code where claimed; every tool result and citation can be traced to a source.

### Increment 4 — Integration and interview practice

Build M21–M25 around artifacts created on prior days. Publish runnable starters, reviewed solutions, the final-case variants, case interview follow-ups, and role extension guides.

Acceptance: a learner can finish with a reproducible portfolio artifact using only the supplied course materials and explicitly documented tools.

### Increment 5 — Educational review and publication

Conduct a full author walkthrough plus, where available, novice and accounting-practitioner pilots. Record completion time, undefined terms, hint use, misconceptions, and performance on changed cases. Revise and repeat the affected portions.

Release checks include types/lint/build, Svelte autofixer, numerical correctness, prerendered deep links under /AIAccountant, mobile/keyboard/screen-reader alternatives, and model/storage failure behavior. Keep educational review distinct from software verification.

Commit coherent increments and push to the existing repository, preserving the authorized GitHub Pages workflow. Label any staged preview as incomplete. Do not advertise the complete five-day curriculum until all core modules and assessments exist.

## Acceptance matrix

| Dimension         | Required evidence                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Depth             | Each objective has explanation, worked example, practice, and a transfer check              |
| Accuracy          | Source/claim review and reproduced numerical results                                        |
| Accounting        | Consistent source records, cutoffs, units, definitions, and reconciled totals               |
| Experiments       | Displayed measurements correspond to actual computation or explicitly labeled illustrations |
| Assessment        | Plausible errors, reasoned solutions, fresh variants, honest grading labels                 |
| Continuity        | Concepts and artifacts recur across days with stated prerequisites                          |
| Accessibility     | Keyboard operation and equivalent textual/tabular evidence without mandatory 3D/WebGPU      |
| Technical quality | Required software checks and deployed-route verification                                    |
| Time estimate     | Explicit authoring budget; pilot observations separately reported                           |
| Claims            | No unsupported certification, “all interviews,” live-model, or five-day completion claim    |

This is a content-and-learning rebuild with a sound existing UI foundation. It requires completion and review of the instructional work, not merely more pages or more quiz counters.
