# Native figure and inline interaction audit

Reviewed the running course at `http://127.0.0.1:4180/` on 2026-09-29. Scope: all 50 native teaching diagrams across M01–M25, all seven inline experiments, and their shared renderer. Generated raster artwork and standalone labs were assigned separate reviews.

## Method and evidence

- Captured and visually read every native diagram at 1440 × 1000 and 390 × 844, including all card labels, connectors, numerical scales, matrices, and captions inside the diagram: 100 figure captures.
- Exercised every inline experiment on both viewports, captured the initial and changed states, and separately checked empty-token and denied/approved/blocked workflow states. Rechecked affected figures and all seven inline experiments after the repairs.
- DOM measurements supplement the visual review: no native figure overflow or empty output, and no inline/page overflow in the exercised states; no page errors in either complete capture pass. Overflow on individual flow nodes is expected because the connector deliberately occupies the gap between nodes.
- Local, ignored evidence is in `.work/native-audit/` and `.work/native-audit-after/`; native contact sheets cover all 50 diagrams, and inline pairs preserve before/after control states. Capture scripts are `.work/native-audit-capture.mjs`, `.work/inline-audit.mjs`, and `.work/cycle-audit-after.mjs`. These are review evidence, not published learning assets.

## Concrete repairs

1. **M06 and M15 cycle return:** the last arrow floated in a broken dashed footer without visibly connecting to step 01. Removed the detached connector and ornamental dashed line. A clean return band explicitly identifies the first step by number and label. Intermediate arrows still follow the numbered sequence, including downward turns on desktop and a top-to-bottom sequence on mobile.
2. **Mobile chart labels:** the 560-unit SVG viewBox shrank 10-unit tick labels to about 5 screen pixels. Added responsive SVG text sizes, a taller bottom margin, and separated axis captions from date/value ticks. The plotted data and calculations are unchanged.
3. **Mobile metric cards:** three narrow columns split “Undefined” into a lone final letter. A two-column arrangement with a full-width final metric preserves complete labels and values.
4. **Classification and attention readability:** enlarged outcome/category and weighted-contribution labels; mobile classification cases now have enough width to read the known outcome and threshold decision distinctly.
5. **Join selector:** shortened the aggregation option to “Aggregate, then invoice key,” so its operative instruction is visible on mobile. The result remains labeled invoice grain and the accompanying explanation identifies payment aggregation.
6. **Workflow end state:** a successful local posting previously remained styled as the current incomplete fifth step, while a blocked workflow retained an active-looking step. Completed workflows now show all five completed steps; terminal buttons say “Workflow complete” or “Blocked by scope.” The approval gate and arithmetic are unchanged.
7. **Action icon meaning:** learning updates use a calculator glyph and workflow steps use a workflow glyph. The shared interactive figure already uses a flask. No video/play promise remains in these owned components.
8. **Small token wording:** “1 token” now uses the singular. Actual local encoding, selection, empty state and exact full-sequence round trip were already working; no tokenizer mechanics were altered.

## Complete native coverage

Every row below was visually checked on **both desktop and mobile**. “Pass” means the reviewed presentation had no remaining directional, truncation, scale, or mechanism mismatch in that scope.

| Module | Native diagrams checked                               | Specific checks                                                                                             | Result                |
| ------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------- |
| M01    | `m01-history`; `m01-review-process`                   | Historical order; amount-rule boundary; source → rule → identity → review sequence.                         | Pass                  |
| M02    | `m02-grain`; `m02-preparation-boundary`               | Customer/invoice/event grain; USD 150 training-only mean versus leaked USD 400 mean.                        | Pass                  |
| M03    | `m03-controls`; `m03-large-miss`                      | Parameter/control distinctions; per-case absolute-error bars 2, 20, 7.                                      | Pass                  |
| M04    | `m04-early-stopping`; `m04-evidence-roles`            | Early-stopping validation values 14, 9, 13; training → selection → frozen final evidence.                   | Pass                  |
| M05    | `m05-score-to-action`; `m05-cost-tradeoff`            | Score versus authorization; modeled costs 420, 360, 180, 240.                                               | Pass                  |
| M06    | `m06-nonlinearity`; `m06-learning-cycle`              | Nonlinearity examples; forward → loss → backpropagation → update → recompute order.                         | Repaired return; pass |
| M07    | `m07-learning-signals`; `m07-transfer-evidence`       | Learning-signal differences; cohort denominators retained while percent bars compare 72, 84, 35, 40.        | Pass                  |
| M08    | `m08-baselines`; `m08-interval-coverage`              | Forecast baselines 150, 133.33, 100; calibrated width versus later 2/4 coverage.                            | Pass                  |
| M09    | `m09-output-grain`; `m09-filter-context`              | Filter → aggregate → join → reconcile; USD 400 − 180 = 220; customer filter context.                        | Pass                  |
| M10    | `m10-full-economics`; `m10-future-conditions`         | Capacity equivalent value versus cash savings; 1500 − 1100 = 400; conditional future uses.                  | Pass                  |
| M11    | `m11-prediction-support`; `m11-three-representations` | Probability values 55/30/15; vocabulary key versus learned row versus contextual state.                     | Pass                  |
| M12    | `m12-causal-mask`; `m12-block-jobs`                   | Causal matrix row/query orientation and permitted diagonal; residual block reading order.                   | Pass                  |
| M13    | `m13-adaptation-levers`; `m13-model-compression`      | Prompt/retrieve/fine-tune mechanisms; distillation versus numerical precision.                              | Pass                  |
| M14    | `m14-claim-findings`; `m14-profit-contributions`      | Supported/contradicted/unknown claims; negative and positive profit bars share a true zero.                 | Pass                  |
| M15    | `m15-generative-modalities`; `m15-denoising-cycle`    | Generative modality distinctions; clean example → noise → estimate → compare/update training cycle.         | Repaired return; pass |
| M16    | `m16-retrieval-gates`; `m16-retrieval-support`        | Retrieval restrictions precede ranking; required source found 4/5 versus supported answer 3/5.              | Pass                  |
| M17    | `m17-money-units`; `m17-retry-identity`               | Exact cent units; event quarantine; timeout → status reconciliation rather than duplicate execution.        | Pass                  |
| M18    | `m18-routing-choice`; `m18-review-effort`             | Code versus model routing; human effort 4, 2, 4.4 minutes.                                                  | Pass                  |
| M19    | `m19-recoverable-state`; `m19-versioned-resume`       | Identity/version/completed-work/uncertain-effect distinctions; historical versus current policy.            | Pass                  |
| M20    | `m20-margin-bridge`; `m20-data-authority`             | Gross-profit versus margin changes; document content → permission gate.                                     | Pass                  |
| M21    | `m21-payment-cohort`; `m21-control-identities`        | Payment identities/duplicate event; raw, accepted-event and invoice-balance control identities.             | Pass                  |
| M22    | `m22-case-trial-grader`; `m22-evidence-graders`       | Case → trial → observation → graders; deterministic checks versus reviewed semantic judgments.              | Pass                  |
| M23    | `m23-provenance-path`; `m23-invoice-evidence`         | Contract → numeric core → retrieval → draft → handoff; source evidence versus unknown cause.                | Pass                  |
| M24    | `m24-conflicting-identity`; `m24-incident-repair`     | Conflicting same-ID amounts both held; incident evidence → containment → repair → regression → fresh cases. | Pass                  |
| M25    | `m25-portfolio-defense`; `m25-join-multiplication`    | Portfolio defense sequence; 2 line × 2 payment matrix has four joined pairs.                                | Pass                  |

## All seven inline experiments

| Module / interaction | Controls and states checked in the real lesson                                                                                                                                             | Result                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| M03 / training       | Initial line; actual learning step; gradient/intercept explanation; training table; changed training and validation MAE.                                                                   | Responsive chart/metric and action-icon repairs verified.                                      |
| M05 / threshold      | Threshold 0.50 and 1.00; case routing; confusion counts; USD 120 → 400 error cost; undefined precision when no case is reviewed.                                                           | Labels and metric wrapping repaired; no misleading numeric substitute for undefined precision. |
| M08 / forecast       | Last-value and seasonal rule; origin moved to November 2025; December target; prior-year input and prior-origin score explanation.                                                         | Chart labels repaired; target remains outside fitting input.                                   |
| M09 / join           | Customer-grain six rows; aggregated two rows; USD 900/600 repeated totals versus USD 300/300 reconciled totals. Existing browser check also covers the invoice-key three-row intermediate. | Selected strategy visible; source/result tables fit mobile.                                    |
| M11 / tokenizer      | Default text; `invoice` → one real token (ID 48401); empty input → zero tokens and no lookup; invoice reference → 14 tokens; selected-ID change; exact decoded sequence.                   | Clean empty state; illustrative embedding label remains explicit; no encoding lag observed.    |
| M12 / attention      | Last-token query; first-token query; all future weights/contributions zero; output [2.000, 0.000]; normalized weights total 1.000.                                                         | Role and contribution labels readable; causal order is preserved.                              |
| M18 / agents         | Source read; calculator; prepared draft; denied write; human approval; local USD 144 posting; reset; injection proposal blocked with no write.                                             | Correct completed/blocked status and action icons; trace and scope note remain explicit.       |

## Verification

- Svelte MCP CLI documentation discovery and relevant Svelte sections were read before edits. Autofixer reported zero issues and zero suggestions for all three edited Svelte components.
- Focused browser/engine run: `npx vitest run src/lib/course/visuals/visuals.svelte.spec.ts src/lib/course/visuals/interactive-math.spec.ts` — 28 passing checks, including mobile axe audits for all seven interactions and all six native layout types. Added assertions protect terminal workflow styling and the explicit cycle return endpoint.
- Post-repair screenshots confirm the cycle return band, readable mobile axes, unbroken “Undefined,” visible selected join wording, causal attention output, and completed workflow steps.

## Scope limit

This is a bounded presentation and instructional-semantics audit at the two stated viewports, supported by Chromium interaction checks. It does not claim exhaustive device/browser certification or re-audit every lesson sentence, real-model lab, or generated image. No new course feature was added and no statistical or financial calculation was changed.
