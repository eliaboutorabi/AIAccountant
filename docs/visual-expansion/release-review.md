# Visual teaching expansion — release review

## Delivered scope

The expanded reader now contains 82 substantive teaching figures: 25 original generated infographics, 50 responsive native diagrams, and seven inline interactive figures. Each of the 25 modules has an infographic and two additional diagrams placed in three different relevant sections. Inline experiments add a fourth figure in seven modules. Existing prose, worked cases, labs, assessments, and learning records are preserved.

The searchable `/visuals/` atlas filters by study day, format, or concept and links directly to figure anchors in lessons. The reader's “See the ideas” guide exposes the same chapter figures. Infographics have equivalent text, captioned assumptions, a reasoning question with an explanation, lazy loading, intrinsic dimensions, and an accessible modal viewer. Its fit view preserves the complete image; original-size mode permits keyboard scrolling. Escape restores focus to the opener.

## Content and image review

All images were generated individually with the built-in image-generation tool, inspected, and encoded as WebP. No named model is claimed because the tool exposes no model selector. Exact initial and correction prompts, original source paths, and selection notes are recorded in the five prompt documents. No online artwork was copied.

The educational reviewers checked novice prerequisites, conceptual distinctions, arithmetic, units, and business decision boundaries. See the [novice review](novice-review.md) and [professional review](professional-review.md), which distinguish independent review from self-verification. The parent also inspected all ten Day 4/5 final images, including invoice identity, retrieval dates, permission gates, incident recovery, and evaluation denominators. Generated mistakes were corrected or rejected before selection: signed versus absolute error, misleading individual join connectors, invented dated tax wording, source verification versus authorization, and a missing Tools label.

The selected 25 WebPs total **3,831,544 bytes**, with a maximum file size of **245,888 bytes**. Every image is 1536 × 1024. Generated scenes and authored distributions are explicitly illustrative. The inline tokenizer uses actual `o200k_base` IDs; its example embedding vector is explicitly illustrative. Attention weights, masking, vector contributions, model updates, forecast errors, threshold outcomes, join totals, and bounded workflow transitions are computed from declared inputs.

## Local verification

- `npm run check`: zero errors and zero warnings.
- `npm run test:unit -- --run` with the production base: **157 tests passed** across 22 files. Includes image dimensions/payloads/placement, exact attention and workflow calculations, browser component interactions, zoom/focus behavior, and the prior numerical/learning-state suite.
- Desktop and 390px mobile browser tests load all 25 chapters and 18 lab routes without client errors. All chapter images load. The 25 chapters, principal pages, and seven core lab pages pass WCAG A/AA axe and document-overflow checks; principal-page audits include the new atlas.
- Atlas filtering, lesson anchors, original-resolution zoom, keyboard scrolling, Escape/focus restoration, real tokenizer round-trip, and causal masking were exercised through production routes. Two test-author assumptions were corrected: interactive IDs use uppercase module prefixes, and the attention experiment has four positions. These were locator/expectation corrections, not changes to computed behavior.
- Svelte MCP autofixer reports no issues or suggestions for the modified reader/layout/resources/atlas and the new Svelte visual components. Prettier, ESLint, and patch whitespace checks pass.
- Integrated visual review at 1440px and 390px passes for the atlas, M11 tokenizer, M12 attention, M14 signed contributions, and M01 timeline. The mobile image viewer retains the true 1536px image; arrow-key panning and return focus work. Reading continuity, section links, intact timeline labels, and the common zero axis were inspected in screenshots. No source regression remains.
- GitHub Pages base-path production build succeeds. Existing large library/vocabulary chunk warnings remain; optional model assets are not downloaded in routine tests.

The reviews and tests establish the inspected artifacts' behavior and consistency. They do not establish measured learner retention, a completion-time study, or universal interview readiness.

## Publication

The release is deployed through the repository's required verification workflow. Final workflow identity and public URL verification are recorded after deployment.
