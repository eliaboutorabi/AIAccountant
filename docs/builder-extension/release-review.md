# Builder extension review

Reviewed 2026-09-29. This release extends the existing foundation course with M26–M35, five dedicated workbenches, ten original generated illustrations, twenty native diagrams, and a runnable local HTTP/SSE service. The resulting course contains 35 modules, 27 laboratories, 112 teaching figures, 210 concept checks, 35 transfer cases, 42 daily review prompts, and 146 glossary terms.

The seven-day/42-hour schedule is an authoring estimate for guided study and practice. Independent application builds take additional time; completion is not certification or proof of readiness for every professional role.

## Educational review

Two content agents independently reviewed the other agent's chapters after authorship. The professional review checked mechanisms, arithmetic, source claims, lab contracts and architecture defense. The novice review checked prerequisite explanations, connected examples, vocabulary and follow-up reasoning. These were agent reviews, not human learner pilots.

Review refinements included:

- Explain continuing operations/reporting perimeter, latency percentiles, and approximate map coordinates before depending on them.
- Distinguish Promise aggregation from initiating asynchronous operations.
- Interpret OCR calibration only against the score's declared meaning and the tested correctness target.
- Distinguish model proposals, runtime authorization, observed effects, correlated results, durable receipts and checkpoints.
- Preserve the transport-specific difference in realtime interruption handling: generated, received and heard content are different states.
- Label authored model/provider/OCR observations explicitly; do not imply the new workbenches perform hosted inference, OCR or microphone recording.
- Align calculations, changed-case questions, rubrics and diagrams to the actual lab fixtures. Balance option positions while preserving option/rationale pairing.

The downloadable guide was independently compared with the implemented service. Its exact-money calculation, conflicting-identity behavior, serialized single-process writes, persistence, event replay and limits agree with the code. The service has no model calls, credentials, posting, payment, authentication or production security claim.

No source code, data, branding, artwork, names or links from the privately reviewed reference applications are included in the published teaching materials. Examples and implementations are original; chapters link to primary technical documentation.

## Visual and interaction review

All ten generated images were inspected by the root and an independent implementation reviewer. One image was regenerated to replace an unexplained numerical plaque with a neutral label. Accepted assets have full text companions, accessible image enlargement and interpretation questions.

All twenty native diagrams were captured and inspected at 1440-pixel and 390-pixel browser widths. No remaining missing node, spurious connector, numerical mismatch or diagram overflow was identified. Each new chapter places its three figures in different reading sections.

All five new lab routes were exercised at both widths, including changed states, expanded disclosures, reset and keyboard scrolling. Twelve actual JSON/TSV exports were inspected. Two contrast problems were found and corrected. The final ten-route pass reported no WCAG A/AA/2.1 AA axe violations, page overflow or client errors in those tested states.

The full browser pass additionally found and fixed a mobile prose overflow from an unbroken JSON example and an early search click before hydration. The initial course link now uses its canonical trailing slash. A case-sensitive test assertion was also corrected.

## Executed validation

- `npm run check`: zero errors and warnings.
- `npm run lint`: formatting and ESLint pass.
- Official Svelte MCP autofixer: no issues or suggestions for every changed Svelte component.
- `npm run test:unit -- --run`: **189 tests pass** across 25 test files, including 22 new builder engine/component tests and an executed HTTP-service self-test.
- Targeted content, visual-inventory and assessment checks pass again after the final presentation fixes.
- `BASE_PATH=/AIAccountant npm run test:e2e`: **26 tests pass** across desktop Chromium and mobile Chromium emulation. Tests visit all 35 chapters and all 27 labs, check navigation, figure loading, accessibility, downloads, saved writing, legacy imports and builder progress.
- `node course-materials/builder-service.mjs --self-test`: passes actual HTTP requests, exact amounts, duplicate/conflicting identities, concurrent retries, restart recovery and SSE replay.
- Production static build succeeds. The existing large-chunk advisory remains; the build does not fail, and optional model runtimes remain separate lab capabilities.

Public deployment verification is recorded below after GitHub Pages finishes publishing.
