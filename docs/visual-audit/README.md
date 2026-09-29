# Visual and interaction audit

Reviewed on 2026-09-29. This pass addressed presentation artifacts, confusing connectors, misleading playback cues, and defects in the course’s interactive learning tools.

## Coverage

| Area                   | Scope                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raster art             | All 31 assets: 25 teaching infographics and six original decorative images; full-resolution inspection. Eight corrected assets receive a second independent inspection. |
| Native figures         | All 50 diagrams across the 25 modules, visually inspected at 1440 × 1000 and 390 × 844.                                                                                 |
| Inline experiments     | All seven, including changed controls and terminal/empty states on desktop and mobile.                                                                                  |
| Standalone workbenches | All 22 registered routes, representative functional states, mobile accessibility, and expanded numeric disclosures.                                                     |
| Main navigation        | Ten principal pages on desktop and mobile, checked for presentation, missing images, page errors, and document overflow.                                                |
| Archived edition       | All 36 legacy lessons on desktop and mobile; both questions and completion controls exercised on every lesson.                                                          |

## Repairs

- Corrected eight infographics: independent data inputs, training order, a stray post-training connector, profit contribution wording, an overcrowded denominator diagram, and malformed markings on decorative props.
- Replaced detached cycle arrows with an explicit return destination. Enlarged chart labels and provided keyboard-scrollable charts and tables where a small screen cannot fit the full figure legibly.
- Removed decorative play buttons and all play glyphs. Actions now use calculator, workflow, rotate, or controls icons; the real interview countdown has explicit Start, Pause, and Resume labels.
- Repaired the cramped mobile study-plan note and portfolio header; improved metric wrapping and inline experiment terminal states.
- Removed whitespace artifacts before glossary punctuation and restored focus when a definition closes.
- Fixed the spreadsheet formula bar’s initial, restored, and pasted values; pausing adaptation now refreshes the displayed checkpoint; changed workflow settings clearly mark an earlier evaluation as stale.
- Regression plots now display negative predictions on their actual signed scale and preserve the last successful checkpoint when a later training update fails. The value calculator rejects values outside its displayed limits.

## Detailed records

- [Raster review and findings](images.md)
- [Exact correction prompts and accepted image sources](image-corrections.md)
- [All native diagrams and inline experiments](native-figures.md)
- [Standalone lab interaction review](interactions.md)

## Verification

- Full unit/component suite: **165 passing tests across 23 files**. Final image inventory rerun: **2 passing checks** after all eight image replacements.
- Production browser suite: 23/24 passed initially, identifying the transformer subtitle contrast defect. After its repair, both desktop and mobile page/workbench accessibility tests passed. The deployment workflow reruns all 24 browser cases.
- `npm run check`: zero errors and warnings. `npm run lint` and `git diff --check`: clean. Official Svelte autofixers reported no issues or suggestions for changed components.
- Manual interaction checks include the countdown’s Start/Pause/Resume/Reset behavior, glossary close/focus, all 36 archived lessons’ quizzes/completion, all seven inline experiments, all 22 workbench routes, and 12 evidence export actions.
- Public deployment verification will be appended after publication. Local screenshot and browser evidence is retained under the ignored `.work/` directory.

## Limits

These are bounded Chromium checks on desktop and mobile viewports, not certification across every device or every possible learner input. The optional downloadable local language model was not run for inference in this audit: the available browser adapter lacks the required `shader-f16` support. Its surrounding controls and worker tests were checked; a compatible GPU remains necessary to verify that optional inference path. Deliberately simplified diagrams retain their stated scope and text companions.
