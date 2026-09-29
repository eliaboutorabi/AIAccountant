# Professional education review

Reviewer: dedicated professional-education agent. Review date: September 28, 2026.
Review basis: the five rebuild specifications, the existing course data, interview cards, and project briefs. This is an editorial and instructional-design review, not an external accountant pilot or a hiring-outcome study. No rebuilt module has passed this review merely because it appears in the plan.

## Finding

The existing edition is a useful orientation, but insufficient preparation for a substantive finance transformation, analytics, data science, or AI systems interview. Its definitions are mostly sound. The problem is that learners are rarely required to reason from records, perform a calculation, diagnose a failure, compare defensible alternatives, or revise a recommendation when circumstances change. The approved rebuild can address those gaps if the specification becomes actual instruction, inspectable experiments, and assessed work.

The LLM benchmark is an appropriate minimum standard. It develops a mechanism, follows complete records, supplies a flawed output worth investigating, shows intermediate calculations, and asks for a changed-case explanation. Its distinction between an accounting bridge and a causal explanation should recur across the course.

## Release gates

These are checks on observable course content. They are not a demand for a particular word count.

| Gate                          | Evidence required in the finished course                                                                                    | Failure that must be repaired                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A decision, not a topic label | Each module names the decision a finance professional can make more competently after it                                    | The opening only promises to “understand AI”                                       |
| Mechanism                     | The explanation follows an input through intermediate steps to an output and explains why each step exists                  | An analogy or diagram labels components without explaining their interaction       |
| Complete worked evidence      | At least one case per module supplies enough records, assumptions, calculations, and source IDs to reproduce its conclusion | “Imagine forecasting cash” without dates, amounts, a method, or errors             |
| Transfer                      | A new case changes at least one consequential condition and asks the learner to reconsider                                  | The same answer with different numbers or shuffled letters                         |
| Consequences                  | Model and system choices connect to review effort, money, timeliness, business decisions, or control outcomes               | “Use accuracy, cost, and safety” without an operational meaning                    |
| Defensible alternatives       | Feedback explains why plausible alternatives are weaker under the stated assumptions, and when they might become preferable | Wrong choices are absurd or a favored architecture is universally right            |
| Honesty about evidence        | Measured, authored, illustrative, self-assessed, and independently tested evidence are labeled separately                   | A simulated trace is called a live agent, or a completed textbox is called mastery |
| Reproducibility               | A learner can recreate the result with supplied browser tools/downloads and see the same declared data version              | A portfolio assignment depends on unexplained setup or unspecified external data   |
| Professional communication    | The learner produces a short recommendation with evidence, assumptions, limitation, and next action                         | The final task is a list of memorized definitions                                  |
| Connected progression         | At least one earlier concept is used materially in each later-day artifact                                                  | Each page starts from scratch and earlier learning never affects a decision        |

Every module should have the following identifiable sequence, although it need not use those labels: problem → explanation → worked reasoning → independent attempt → feedback → changed-case application. Six questions beside shallow prose will not satisfy this gate.

## Priority gaps to repair

1. **Classification needs an actual operational decision.** The current 99% accuracy question is correct but too easy once the slogan is known. Supply confusion counts, prevalence, review capacity, and cost assumptions. Require the learner to calculate precision and expected workload, explain an imbalanced baseline, and defend a threshold. Then change prevalence or capacity. Explain that the assumed cost of a missed exception is not necessarily its invoice amount.
2. **Model selection needs independent evidence.** Show exactly which rows trained the parameters, which selected the settings, and which were untouched until commitment. After a learner consults the final results and retunes, label subsequent results as development evidence. Include a data shift that regularization does not cure.
3. **Forecasting needs horizons and decisions.** Compute forecasts only from information available at each origin. Report dollar error and signed bias by horizon. Explain what an error band covers and how it was estimated. Ask whether a reserve decision changes; do not imply a lower average error always avoids a cash shortfall.
4. **Analytics needs traceable grain.** Show invoice, line, and payment rows that multiply when joined. Make the wrong total visible, then reconcile the corrected result. A dashboard lesson must explain how a relationship or filter changes a measure, not just recommend a star schema.
5. **LLMs need a full computational story.** Keep token IDs, embeddings, model parameters, attention weights, vocabulary scores, probabilities, context, and retrieved documents distinct. Follow a sequence through the mechanism, and require the learner to explain what changes during training versus generation. Include evidence that fluent prose can be unsupported even when its arithmetic is correct.
6. **Agents need state, not only transcripts.** An apparently sensible final response can conceal a failed lookup or duplicated action. Compare intended action, observed tool request, actual result, resulting state, and final communication. A timeout must not be taught as proof that no action occurred.
7. **Business cases need net value.** Include current preparation, review and correction time, new operating cost, exception rate, and volume. Calculate net savings under stated assumptions. Then test the sensitivity to a worse review rate. A vendor deployment story is not evidence that Willow will achieve the same return.
8. **Capstones need scaffolding and a minimum deliverable.** Novices should integrate and modify supplied components. They cannot be expected to invent deployment, data engineering, testing, and application architecture in 80 minutes. An optional engineering extension can ask for a blank-repository implementation.
9. **Interviews need probing follow-ups.** Every major interview case should move from explanation to records to changed constraints to a defended recommendation. A polished answer displayed after a button press is reference material, not interview practice.
10. **Completion claims need scope.** The course can provide substantive foundational fluency and evidence of applied reasoning. It cannot establish qualification for every data science or engineering role in five days. Make the core/extension boundary and self-assessment status visible.

## Quantitative standards to use during authoring

### Classification interview: make the trade-off concrete

An original teaching fixture has 1,000 invoices and 50 confirmed exceptions. At a candidate threshold the model flags 120: 40 are confirmed exceptions and 80 are not. It misses 10 exceptions and correctly leaves 870 other invoices unflagged.

The complete solution is: accuracy 91%; precision 40/120 = 33.3%; recall 40/50 = 80%; false-positive rate 80/950 = 8.4%; review queue 120. An always-negative classifier has 95% accuracy and zero recall. This model's lower accuracy is not sufficient reason to reject it; its value depends on what caught exceptions are worth and how expensive review is.

If each review costs $8 and each missed exception is assumed to impose $300 of avoidable expected loss, the modeled cost is 120 × $8 + 10 × $300 = $3,960. The always-negative modeled cost is 50 × $300 = $15,000. These are expected-cost assumptions for teaching, not verified loss estimates. If reviewers can handle only 60 cases, the 120-case policy is not feasible unchanged. The learner needs the scores/ranking or another threshold's counts to evaluate a 60-case policy; they cannot simply assume it catches half the exceptions.

A good follow-up changes exception prevalence or the relative cost of misses and false alarms. It asks which quantities can be recalculated from supplied data and which require new evidence. Do not assume calibrated probabilities from the presence of a 0–1 score.

### Join interview: make the wrong answer reproducible

Invoice A has a $1,000 header, two lines of $600 and $400, and two payments of $300 and $200. Joining lines and payments directly on invoice ID creates four rows. Summing repeated header amounts gives $4,000; summing line amounts gives $2,000; summing payments gives $1,000. The correct invoice total is $1,000, accepted payments $500, and outstanding balance $500. Demonstrate why pre-aggregating payments at invoice grain or using separate fact tables repairs the intended measures. “Remove duplicates” is not an adequate generic fix: legitimate repeated line amounts must survive.

### Forecast interview: make the uncertainty consequential

Supply origin dates, horizon, actual collections, and each candidate forecast. Require at least one individual error calculation before showing aggregate scores. If a liquidity decision depends on the lower tail, explain why MAE alone does not quantify shortfall risk. Any empirical interval needs an earlier calibration window and a later coverage check; a small sample makes coverage evidence imprecise. Changing the forecast horizon must change the evaluation, not just the chart title.

### LLM interview: preserve the benchmark's hard distinctions

The September margin case must reconcile exactly: budget revenue 1,200; cost 720; gross profit 480; margin 40%. Actual revenue 1,140; cost 741; gross profit 399; margin 35%. Gross profit decreases 81, or 16.875% of budget gross profit. Margin falls five percentage points, or 12.5% relative to the budget margin rate. None of these figures establishes cash movement. The later materials/freight/warehouse breakdown explains contributions to cost, not operational causation. A strong interview answer requests specific missing evidence and explains which tool or system component would supply it.

## Case-interview format and scoring

Each case should provide the initial question, a source exhibit, two changed constraints, a challenge to the learner's assumption, and a worked debrief. The questions should be answerable from the supplied course; role extensions may be marked separately.

Score each dimension 0–3: incorrect/absent, partial, correct with evidence, or correct with evidence and a relevant limitation/transfer insight.

| Dimension              | What a strong answer does                                                       |
| ---------------------- | ------------------------------------------------------------------------------- |
| Problem framing        | Names the decision, user, timing, and cost of error                             |
| Mechanism              | Explains how inputs become outputs without hiding behind terminology            |
| Quantitative reasoning | Computes the required quantities with correct units and checks reconciliation   |
| Evidence quality       | Distinguishes observed evidence, assumptions, missing data, and causal claims   |
| Design judgment        | Compares alternatives, constraints, failure modes, and a useful next experiment |
| Communication          | Gives a concise recommendation and responds coherently to a changed condition   |

Supply weak, competent, and strong examples for at least the main capstone defense. A “strong” sample should be useful, specific, and appropriately qualified; it need not be longer or full of terminology. Written or spoken self-scores stay labeled as self-assessment. Do not convert this editorial rubric into a validated professional certification.

## What I will review in the implemented edition

For each assigned module, trace every outcome to both teaching and a meaningful check. Recalculate worked figures. Attempt independent cases using only the supplied information. Inspect whether solutions explain mistakes and whether a plausible professional alternative is unfairly marked wrong. Check that one can distinguish reading completion from demonstrated reasoning. Record concrete issues with module/section/activity IDs and their corrections.

Before release, inspect all five daily artifacts end to end. Ask whether a learner can defend each artifact in a business conversation: What was the decision? What evidence did you use? What did you compute? Why this approach? What changed your conclusion? What could fail? What would you do next? A course that answers those questions with concrete work will have materially more professional value than the current orientation.

Status after this audit: **plan acceptable as an implementation basis; existing course fails the professional-depth gate; rebuilt content review pending.**

## Day 4–5 authoring and self-review record — September 29, 2026

The reviewer subsequently authored M16–M25 in `src/lib/course/days/day4.ts` and `day5.ts`. This creates a potential self-review limitation: the checks below are an author walkthrough, not an independent educational approval or learner pilot. A separate novice reviewer has been asked to inspect prerequisite coverage.

The ten modules now contain 60 connected sections, 60 multiple-choice checks with a rationale for every option, ten written assignments with complete worked solutions and rubrics, ten interview defenses, and twenty probing follow-ups. Module lengths are approximately 2,000–2,340 whitespace-separated words in serialized content. Length is reported as a scope check, not as evidence of learning. Each day retains 330 module minutes plus the separately authored 30-minute cumulative review.

The author walkthrough checked that each module has a decision, complete evidence, intermediate reasoning, changed-condition questions, and a deliverable. The content defines technical concepts before using them in the core tasks and explicitly labels authored traces, evaluation fixtures, and draft templates. Actual-model behavior is never claimed for those fixtures.

Numerical review reproduced:

- PIPE-01: invoices USD 2,000; raw payments 1,450; quarantined identical duplicate 200; accepted payments 1,250; matched 1,100; unmatched 150; outstanding 900. All three declared control identities reconcile.
- INT-01: 91% accuracy, 33.3% precision, 80% recall, and USD 3,960 modeled cost under the stated review/loss assumptions. The all-negative baseline has 95% accuracy and USD 15,000 modeled missed-loss cost.
- M22 trial table: seven of twelve trials pass; one of four cases passes all three trials. An initial eight-pass tally was found and corrected before handoff.
- M18 effort comparison: agent review effort becomes 4.4 minutes when 40% of cases need six additional correction minutes.
- The September margin explanation remains consistent with the approved benchmark and does not infer cash movement or operational causation.

Scoped TypeScript compilation passed. Structural checks confirmed module counts, each day's 330-minute allocation, unique section IDs, valid answer indices, complete option rationales, and valid objective indices. These are content/structure checks; the interactive lab implementations, rendered page navigation, accessibility, and deployed behavior still require integration verification by the main build.

Remaining educational release checks: cross-review the novice path; verify every linked lab actually provides the declared evidence; inspect the five-day cumulative reviews and interview interface; attempt the final cases through the working UI; keep the absence of an external learner or practitioner pilot visible. Do not convert this authoring record into a claim of validated interview readiness.

## Independent content cross-review — September 29, 2026

This review is distinct from the M16–M25 author walkthrough above. The professional reviewer inspected the other authors’ Day 1 (M01–M05) and M11–M15 content, including mechanism explanations, complete numerical cases, assessment rationales, assignments, and interview follow-ups. The reviewer did not author those modules. This is an editorial review, not an external learner/practitioner validation.

No incorrect arithmetic was found in the worked cases reviewed. Day 1 supplies consequential business decisions and connects the rule/model distinction, label quality, sampling, error costs, and a later independent test. The LLM sequence substantially exceeds the former orientation: it distinguishes tokenization, embeddings and context; follows attention and generation; explains pretraining and adaptation; handles retrieval and causality limits; and asks learners to defend results from supplied records.

Two substantive repairs were made directly before handoff:

- **M12, query/key/value explanation:** explicitly distinguish learned projection parameters, which remain fixed during ordinary generation, from input-dependent temporary attention weights. Changing an attention grid is not evidence of model training.
- **M13, adaptation:** define reinforcement-learning “policy,” action, and reward separately from company policy. Explain that reward is a proxy, not truth; a classroom answer selector is not an actual RLHF training run. Explain catastrophic forgetting and the need for both held-out domain tests and general-capability checks before accepting adaptation.

These repairs address professional misunderstandings that can produce superficially fluent but incorrect interview answers. The surrounding explanations and assessments were retained. A separate reviewer is checking novice bridges and prerequisites across later modules; that review remains independent of this record.

## Day 4–5 laboratory verification — September 29, 2026

The reviewer implemented `WorkflowLab.svelte`, `workflow.ts`, and their engine/browser checks. These are author verification results, not independent educational sign-off. The implementation supplies actual keyword and TF–IDF term-vector retrieval with scope, access, and effective-date filters; constrained claim checking separately from required-source recall; strict tool argument validation; exact integer-cent calculations; a real local review queue with idempotent retries and injected response loss; validated browser checkpoints; fixture evaluation; and a configurable PIPE-01 reconciliation with visible records, exceptions, control totals, and provenance. The term vectors are explicitly not learned semantic embeddings. Draft notes and agent traces are clearly identified as authored templates/traces.

The capstone requires a learner prediction and configuration commitment before its first changed-case run. That original configuration and result remain in the evidence export when a later repair is evaluated. All subsequent repair runs are identified as development evidence. The experiment is a learning workflow, not a secure examination system; the dataset and source code are inspectable.

Verification at handoff: **24 checks passed** across engine and browser tests; scoped ESLint passed; Svelte autofixer returned no issues or suggestions. Browser tests exercised retrieval support, malformed money arguments, an actual lost-response/retry/recovery sequence, commitment and changed-case behavior, and all seven views at 390 px. The seven views passed the configured WCAG A/AA axe checks and had no document-level horizontal overflow. These automated checks do not replace keyboard, screen-reader, visual, or learner testing of the integrated pages. The exported dependency-free starter was executed in Node and reproduced invoice balances A=500, B=0, C=400 dollars, the P2 quarantine, and the unmatched P4 payment.

The deterministic lab does not claim live language-model behavior. A separate optional local-model experiment is being verified; its results must be reported separately from these core-engine checks. The core course requires no model download, API key, or GPU.

## M13 adaptation gap closed — September 29, 2026

A final curriculum audit identified that the earlier M13 activity repeated a finance-only transformer exercise and did not actually compare general and domain performance across adaptation. `AdaptationLab.svelte` now replaces that activity within M13's unchanged 70-minute allocation. It trains the real CPU transformer on a new original general-language corpus, retains its 2,289 parameters and Adam/RNG state at the switch, then continues on finance sentences. It records both domains' held-out validation loss before and after, with a complete checkpoint table. Commitment freezes training and reveals both separate final document sets. Exposure to the fixed finance final sentences is shared with the earlier transformer lab; changing a seed does not make those sentences new evidence.

The interface explicitly distinguishes tiny continued language-model pretraining from instruction tuning and RLHF. A separate authored reward-proxy selector demonstrates how confidence weighting can favor unsupported causal claims, and states that it performs no policy training. It does not use the selector as evidence that a real model learned preferences.

An actual browser run at seed 42, learning rate 0.004, 50 general updates followed by 50 finance updates measured general validation loss **3.221 → 3.054** and finance validation loss **3.219 → 3.024**. Both improved. The course therefore does not claim that forgetting occurred in that run or is inevitable. The losses are per-character prediction evidence from eight held-out documents per domain, not business-task success rates. Desktop/mobile visual inspection and the 390 px overflow check passed. Numerical tests check corpus separation, parameter preservation at the switch, actual subsequent updates, unchanged inference/RNG behavior, both final sets, and the final training lock. Browser tests exercise both stages and the commitment flow.

The optional actual GPU model is documented separately in `local-model-verification.md`, including observed native tool requests, model mistakes, rejected malformed outputs, download size and license provenance, and the absence of inference-time network requests in the verified environment. It is optional; those model quality limitations do not prevent the CPU course or its assessed deterministic exercises from running.
