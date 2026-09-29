# AI Accountant

A visual, beginner-friendly field guide to AI for accounting and finance. Built with Svelte 5, SvelteKit, TypeScript, and Three.js.

**Live course:** https://eliaboutorabi.github.io/AIAccountant/

## The learning experience

- 12 connected chapters, 36 lessons, and 72 explained knowledge checks.
- AI history, symbolic AI, machine learning, deep learning, language models, generative AI, tokens, transformers, applications, agents, tools, skills, harnesses, and prompt/harness engineering.
- Accounting refreshers, fictional finance examples, misconception correction, and primary-source further reading.
- Five interactive labs: a 3D neural network, polynomial model fitting, rolling cash forecasting, classification thresholds, and a prompt workshop.
- 18 interview scenarios across finance transformation, analytics advisory, data science, AI engineering, and agent engineering.
- Three portfolio project briefs with downloadable data, expected controls, a runnable reconciliation starter, and agent evaluation cases.
- Searchable glossary, lesson bookmarks, notes, progress tracking, export and restore.
- Original generated artwork; locally served fonts; reduced-motion support; keyboard-friendly controls; responsive layouts.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
npm run check
npm run lint
npm run test:unit -- --run
npm run test:e2e
npm run build
npm run preview
```

Set `BASE_PATH=/AIAccountant` when testing the production subdirectory. The Pages workflow applies this automatically. Every lesson is prerendered to an HTML directory so deep links work directly on GitHub Pages.

## Content and maintenance

- `src/lib/data/course.ts`: course hierarchy, explanations, refreshers, and questions.
- `src/lib/data/resources.ts`: glossary and primary references, reviewed September 28, 2026.
- `src/lib/data/interview.ts`: worked scenarios and self-assessment criteria.
- `src/lib/data/projects.ts`: project briefs and rubrics.
- `src/lib/lab-math.ts`: deterministic teaching calculations.
- `src/lib/network-scene.ts`: lazy-loaded Three.js scene and resource cleanup.
- `src/lib/progress.svelte.ts`: per-app, browser-local learning record and validation.
- `static/data`: fictional datasets, project briefs, and example scripts.
- `docs/art-direction.md`: final image-generation prompts and asset provenance.

The course develops conceptual fluency and a bridge to practical projects. It does not promise readiness for every technical interview or provide an accredited qualification. Accounting examples are general teaching cases, not transaction-specific guidance. Future applications are labeled scenarios. Vendor examples describe particular deployments rather than universal outcomes.

## Privacy and simulation boundaries

There are no accounts, analytics scripts, advertising scripts, or live AI calls. Progress and lesson notes are stored only in local storage for the current browser profile and can be exported or reset. Export before clearing browser data. The interview scratchpad is ephemeral. GitHub Pages may process standard hosting requests; external references have their own privacy policies.

All finance datasets are fictional. The neural network uses hand-set weights and is not a trained or calibrated model. Other labs compute real results on small teaching fixtures. The prompt workshop assembles a local template; interview review is self-assessment.

## Deployment

GitHub Pages uses the Actions build type. The deployment workflow installs dependencies, checks types, runs unit and browser tests, builds with the repository base path, and deploys the static output. The repository requires Pages to be enabled under Settings → Pages → GitHub Actions.
