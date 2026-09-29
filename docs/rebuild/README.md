# AI Accountant: the substantive course rebuild

Status: implemented expanded edition; publication verification is recorded in [release evidence](release-review.md).
Original specification prepared September 28, 2026 against baseline 6c6d54b. Implementation and independent agent reviews completed September 29–30, 2026. Human learner timing remains unpiloted.

## The product we are building

A rigorous, approachable course for adults in accounting and finance who want to understand, use, evaluate, and help build AI systems. The teaching must develop a mental model, let the learner test it, then require its application to an unfamiliar financial problem. Attractive pages and correct definitions are necessary but insufficient.

The implemented core is **30 hours of active learning over five study days**, excluding breaks. A study day means about six focused hours, normally seven to eight hours with breaks. These are authoring budgets to validate with learners, not measured completion times. Reading quickly must not be confused with completing the experiments and assignments. Do not enforce waiting periods, pad prose, or artificially lock days.

Preserve the existing visual identity, responsive navigation, local notes, accessibility work, and original artwork. Replace the thin instruction, uniformly easy questions, and unsupported completion estimates. Adults can encounter difficult ideas with a supportive explanation. Remove diminutive language such as “a little check-in,” “next little step,” and congratulatory feedback that overstates understanding.

## Read the specification

1. [Reference review and research](research.md): what was inspected in Jaxverse and Pattern, exact source locations, external evidence, and reuse decisions.
2. [Five-day curriculum](curriculum.md): 25 modules, prerequisites, worked cases, experiments, assessment evidence, and the mapping to the original brief.
3. [LLM benchmark specification](llm-benchmark.md): a four-and-a-half-hour learning sequence, mechanisms to teach, lab contracts, and an authored finance case with worked answers.
4. [Assessment and implementation](delivery.md): assessment design, role pathways, content architecture, progress migration, numerical verification, and release gates.
5. [Machine-readable schedule](schedule.json): the module and daily review budgets. The authored budgets match the implemented modules.

## What the audit found

The September 28 introductory edition contained 36 lessons and 72 questions, but only 4,015 words in the main explanation paragraphs. Its entire LLM chapter had 342 such words. Every lesson has exactly two explanation paragraphs and two multiple-choice questions. The 18 interview answers average 47 words. Those counts exclude examples, refreshers, quiz explanations, and other UI text; they are a narrow measure of the core prose, not a claim about total site word count.

The more important baseline gaps were qualitative (the implementation repairs and design refinements are documented in the release evidence):

- Definitions are stated without enough intermediate reasoning, comparisons, counterexamples, or changes in conditions.
- Most financial examples name a task without supplying the records, calculation, draft output, or complete solution.
- Learners can often eliminate absurd answer choices without understanding the concept.
- The neural network has hand-set weights; it demonstrates inference, not learning.
- Model fitting has training and validation, but no learner commitment followed by an independent final assessment.
- The forecast compares three useful baselines, but gives little practice with horizons, changing conditions, uncertainty, or downstream decisions.
- The prompt workshop assembles a template. It does not measure the effect of a prompt change.
- Portfolio briefs request substantial work that the preceding lessons do not yet teach step by step.
- Successful software tests were incorrectly treated as enough evidence to declare the educational product complete.

Keep tested calculations where appropriate, but reassess every claim they support. An accurate toy calculation does not automatically make a sufficiently instructive lab.

## What five days should produce

| Day | Main question                                                                 | Evidence the learner produces                                                                |
| --- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | When should we use rules, statistics, or learned models?                      | A data contract, a leakage diagnosis, and a defended model/threshold choice                  |
| 2   | How do models learn, and how do we turn their outputs into finance decisions? | An inspected training run, a rolling forecast comparison, and reconciled analytical measures |
| 3   | How does an LLM turn text into an answer, and how should we evaluate it?      | A generation/training explanation and a source-supported variance analysis                   |
| 4   | How do we turn a model into a controlled working application?                 | A retrieval evaluation, executable tool contract, versioned skill, and inspected agent trace |
| 5   | Can we build and defend a small finance system?                               | A reproducible prototype, evaluation report, incident analysis, and oral defense             |

The full core builds substantive AI fluency and a first integrated portfolio artifact. It should support finance transformation and analytics interviews with evidence of applied reasoning. Advanced data science and AI engineering interviews also require role-specific SQL, Python, statistics, deployment, and engineering practice. Those receive explicit extensions rather than an unsupported promise that one five-day course makes every learner ready for every role.

## The learning method

Each module has a business question and observable learning outcomes. Instruction follows a sequence that can vary in length:

1. **Encounter the problem.** Inspect a small, concrete example before learning terminology.
2. **Build the mechanism.** Explain each necessary step. Define technical vocabulary at first use.
3. **Study a worked solution.** Show the actual records, intermediate values, interpretation, and limits.
4. **Predict a change.** Ask what the learner expects before allowing the experiment.
5. **Run and inspect.** Change one factor and examine the relevant evidence.
6. **Explain the result.** Compare prediction with observation and diagnose errors.
7. **Transfer.** Apply the concept to different records or a changed business requirement.
8. **Retrieve later.** Return to the concept on another day in a mixed problem.

This design is informed by the IES guidance on worked examples, concrete and abstract representations, explanatory questions, and spaced retrieval. Its exact effectiveness for this adult course remains to be tested. See [the research register](research.md).

No equation manipulation is required in the core. That does not remove quantitative reasoning. Learners calculate dollar errors, compare probabilities, interpret a loss curve, trace a weighted contribution, and distinguish percent from percentage points. Optional “technical detail” panels expose notation after the intuitive explanation. A glossary entry is a reminder, not a substitute for instruction.

## One connected fictional business

Willow & Co. is a mid-sized distributor. Reuse a coherent company, chart of accounts, dates, customers, document IDs, and approval roles across the course. The learner works through a finance transformation engagement, from problem scoping to a controlled prototype.

Create a documented teaching data pack:

- A small 12–20-row explanation view beside each case, with a larger version for independent practice.
- 72 months of synthetic revenue, cost, and collections, with seasonality and a labeled regime-change experiment.
- Invoice, invoice-line, payment, customer, supplier, and exchange-rate tables with explicit grain and keys.
- Approved budgets and a general-ledger extract that reconcile to displayed variance tables.
- Versioned policy documents with effective dates, access groups, superseded versions, and genuinely missing answers.
- A receipt/invoice image set with authoritative transcriptions, including ambiguous characters and imperfect scans.
- A case manifest separating demonstrations, practice, validation, and final-assessment variants.

Data generation must preserve the accounting identities used by the exercises. Errors and exceptions are inserted intentionally and documented in the instructor solutions. Currency, rounding, cutoffs, units, and sign conventions are stated, not left as traps the course never taught.

Accounting refreshers appear where needed: accrual versus cash, revenue versus receipts, gross profit versus margin, debit/credit orientation, AP/AR, reconciliation, cutoffs, materiality as contextual judgment, and segregation of duties. No jurisdiction-specific standard is asserted without its own source and scope.

## Visual direction

Keep the warm palette and sophisticated illustrations. Add visual explanations that carry information:

- A historical timeline with parallel branches for rules and learning.
- A record-level split explorer and a pipeline showing exactly where future information leaks.
- Actual training curves, data points, residuals, confidence bins, and financial bridges.
- A network whose displayed weights and activations come from the trained model.
- Token pieces and IDs, an embedding view, a causal attention grid, and a stepwise generation loop.
- A side-by-side view of a claim and its supporting source.
- An agent execution trace showing requests, actual tool results, failures, retries, and review.

Use SVG/HTML for precise charts and text. Use Three.js when spatial structure helps, such as inspecting a network or exploring a projection. Provide a synchronized table or stepper so the concept remains learnable without 3D, fine motor control, or WebGPU. AI-generated illustrations explain metaphors or establish a scene; they never stand in for computed evidence.

## Decisions made now

- Five days means 30 hours of planned core learning, not five brief visits.
- Organize by five days and 25 modules; retain a topic index for the original 12 subjects.
- Draft the complete LLM benchmark before expanding the remaining content templates.
- Develop finance-specific implementations informed by the references; do not transplant their generic examples as the finished curriculum.
- Core learning requires no paid model account. Actual small-model learning runs locally where feasible.
- Optional local model inference and optional externally connected inference are distinctly labeled. No canned answer may silently replace a failed live model call.
- Progress records distinguish reading, practice, numerical checks, and self-assessed written reasoning.
- All public lesson routes and existing learner notes receive a migration plan.
- Current adoption examples carry source/date labels. Future possibilities are scenarios with assumptions.

## Definition of a finished course

The rebuild is complete only when all five days have authored instruction, functional experiments, worked solutions, independent tasks, cumulative assessments, and usable downloads. Every learning objective must have both instruction and assessment evidence. Every experiment must explain what is real, what is illustrative, and what the result cannot establish.

Release evidence must separately report content review, numerical correctness, browser/accessibility checks, and learner pilot results. The absence of an external learner pilot must remain visible; software tests cannot substitute for it. Time estimates remain provisional until observed.

The plan itself is complete enough to implement in ordered increments. It does not assert that any of the planned 25 modules, expanded labs, or new assessments are already live.
