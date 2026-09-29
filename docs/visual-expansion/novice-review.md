# Independent novice review of the visual expansion

## M01–M10 authorship and verification

The novice reviewer authored thirty catalog entries across `src/lib/course/visuals/day1.ts` and `day2.ts`: one generated infographic and two distinct native diagrams in separate relevant sections per module. Every entry has a learning purpose, equivalent description, takeaway, reasoning question and worked answer, with explicit provenance. The ten published images are all 1536 × 1024 WebPs, totaling 1,256,712 bytes. Exact original and corrective prompts, selected source paths, and image-specific inspections are recorded in `prompts-day1.md` and `prompts-day2.md`.

Two images required targeted regeneration after inspection. M03's positive errors were relabeled **absolute error**, preserving the lesson's signed-residual convention. M09's incorrect individual-record connectors were replaced with one group-level 2 × 2-pairs arrow, while preserving the four correct output pairs and independent USD 120 source controls. No image contents were repaired using code; Sharp only encoded the accepted generated outputs.

Validated: thirty unique IDs, thirty valid section/block placements, exactly three entries in different sections per module, all ten published files, all required companions, and native node details of at most twenty-five words. Standalone strict TypeScript and ESLint checks passed. The shared renderer and inline experiments are authored and tested separately by the learning-engines reviewer.

## Independent M11–M15 review

The novice reviewer visually inspected all five published Day3 infographics and read all fifteen Day3 catalog entries. The professional reviewer separately checked financial and mechanism correctness, including the attention arithmetic, transformer block sequence, gross-profit bridge, and invoice extraction discrepancy. No image-regeneration blocker remained in the versions inspected.

Content-only refinements made in `day3.ts`:

- M11 explicitly notes that the toy paid-token tile does not visibly mark its leading space, and that two embedding rows omit numeric coordinates. A vocabulary index remains clearly distinct from a learned vector.
- M12's lead identifies 10, 4 and 8 as **value components**, preventing a novice from mistaking them for the token IDs introduced in M11. The normalization explanation now states that the 0.20, 0.30 and 0.50 mixing coefficients total one. The image's weighted contributions 2.0, 1.2 and 4.0 correctly total 7.2.
- The causal-mask orientation is explicit and correct: rows query, columns source; each row may access itself and earlier positions. Ones indicate permission, not normalized probabilities. The diagonal does not expose the next target token.
- M13 distinguishes parameter-changing training from fixed-parameter ordinary inference. The lock is explained as fixed weights, without an implied security guarantee. Supplied current evidence does not erase older learned information.
- M14's lead states that the bridge concerns **gross profit**, not cash. The expense-contribution signs and USD-thousands units agree with the source case. The bridge establishes the amount of the movement, while the operational cause remains unresolved.
- M15's lead now matches the corrected image's source-review boundary. Extraction, arithmetic consistency, and verified transcription are separate results; none authorizes payment. The USD 5 discrepancy identifies an inconsistency before source review determines which field needs correction.
- All five art entries now explicitly identify built-in generated provenance and point to the Day3 prompt/source record. Minor run-together words in alt text and transcripts were repaired.

These checks establish consistency of the inspected teaching artifacts. They do not substitute for a human novice pilot or establish a measured learning duration, retention improvement, or universal interview readiness.
