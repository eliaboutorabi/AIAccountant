# Five-day curriculum and evidence map

All modules below are planned. The budgets total 330 minutes of modules plus 30 minutes of cumulative retrieval and reflection per day: 1,800 minutes overall. Practice is included in each module's time. Do not add all assignments on top of these budgets and still call it a 30-hour course.

The core has no programming prerequisite. Reading a small table and basic arithmetic are enough to start; essential accounting refreshers are included. Guided spreadsheet and code inspection appear later. Installing a development environment and becoming fluent in a language belong to the engineering extension, not an unexplained prerequisite on day five.

Each module will contain two to four purposeful sections, rather than a mandatory number of identical lesson cards. Reading, worked examples, and experimentation should each occupy a meaningful share. These budgets require learner testing.

## Day 1 — From accounting questions to learning problems

### M01 · AI history and choosing an approach · 50 minutes

Teach the difference between automation, symbolic reasoning, statistical learning, and generative models. Trace early neurons, the 1956 AI meeting, perceptrons, expert systems, renewed multilayer learning, and later scale. Show overlapping traditions rather than a story in which each new method makes its predecessors obsolete.

Work through an expense-policy rule, a duplicate-invoice match, and a learned document classifier. Give the actual inputs and outputs. The learner chooses approaches for five finance requests, then receives a changed requirement that breaks one choice.

Deliver: a decision table stating what is specified, what is learned, what data is needed, and how success is checked. Refresher: invoice, receipt, payment, and approval are different events. Transfer question: a rule works on one invoice layout; what changes when layouts vary?

### M02 · Financial data, targets, and leakage · 70 minutes

Teach rows, columns, grain, keys, features, targets, population, units, missingness, and provenance. Contrast predicting whether an invoice will be late with finding an already overdue invoice. Explain the decision-time cutoff and why a statistically useful field can be unavailable in practice.

The worked data pack has repeat customers, partial payments, later corrections, and a future-only field. The learner compares row, customer, and chronological splits, then builds a feature-availability timeline. Scaling and imputation are fitted on training data only.

Deliver: a data contract and a corrected modeling table with an exclusion rationale. Refresher: AP/AR, due date, outstanding amount, and as-of date. Assessment requires identifying subtle leakage such as a post-outcome collection status, not merely a column named “answer.”

### M03 · How training changes a model · 75 minutes

Teach prediction, residual, loss, parameter, learning rate, iteration, and baseline through a small cost-estimation problem. Distinguish fitting parameters from selecting hyperparameters. Explain gradient descent as measuring which adjustments reduce a chosen error, with one inspectable numerical update.

Fit a line to handling cost versus invoice volume. Inspect every residual and the contribution to loss. Vary starting weights and learning rate; observe improvement, slow progress, and overshoot. Compare MAE and squared error using an outlier.

Deliver: an annotated training trace explaining why one parameter moved. Refresher: fixed versus variable costs, with limits of that model. Transfer: the lowest squared error is not necessarily the best operational choice when large misses have asymmetric consequences.

### M04 · Generalization and independent evidence · 75 minutes

Teach training, validation, test, underfitting, overfitting, bias/variance intuition, regularization, early stopping, and representative data. Show why more data helps only under relevant conditions.

First inspect a fully worked example with all splits visible. Then run a separate challenge: choose complexity, sample size, and penalty using training/validation, commit a rationale, and reveal new test cases. Repeat under fresh seeds and a shifted customer mix. Label a consulted test set as exploratory evidence if the learner retunes.

Deliver: a model-selection memo including the simple baseline and uncertainty about the final score. Assessment: diagnose three distinct learning-curve patterns, including distribution mismatch that regularization alone will not fix.

### M05 · Classification, uncertainty, and decisions · 60 minutes

Teach confusion counts, precision, recall, class prevalence, threshold, calibration, and business costs. Use 100 visible invoices and then a larger fixture. Contrast ranking cases, estimating probabilities, and making review decisions.

Compute the all-negative baseline. Move the threshold and show which exact invoices change category. Introduce a fixed daily review capacity and a cost for missed exceptions. Explain why a risk score is not automatically a calibrated probability. Revisit the same model under a different prevalence.

Deliver: a review-queue recommendation, numerical evidence, and a cost assumption. Refresher: an exception is not proven fraud. Transfer: explain why 99% accuracy can be unhelpful and why high recall can still produce an impractical queue.

**Day 1 review · 30 minutes:** six mixed prompts using a new invoice cohort, a short explanation from memory, and revision of the data contract. Preserve the first attempt separately from corrected work.

## Day 2 — Learning mechanisms and financial analysis

### M06 · Inside a trainable neural network · 70 minutes

Teach weighted contributions, bias, activation, hidden layers, forward pass, backpropagation, and optimization without requiring derivatives. Show that a model's architecture specifies possible computations and training chooses parameters.

Train a small network on a synthetic collections problem. The 3D view and accessible table share the actual weights and activations. Inspect one customer, change an input, step a training update, and compare hidden features before and after training. Contrast this with the current hand-set demonstration.

Deliver: a narrated forward/training pass. Assessment: explain why changing an input is not training, and why stacking only linear transformations does not create arbitrary nonlinear behavior. A clear two-dimensional pattern illustrates the latter before the financial case.

### M07 · Deep learning and representations · 70 minutes

Teach learned representations, depth, feature engineering, embeddings, supervised/self-supervised learning, transfer, and the roles of convolutional, recurrent, and transformer architectures. Introduce clustering and anomaly detection as distinct tasks; avoid equating “unlabeled” with “unstructured.”

Compare raw features, an engineered feature, a tree, and a small network on the same task. Inspect a document-image feature hierarchy and an embedding neighborhood. A separate small transfer comparison uses the same labeled sample and held-out cases on both sides.

Deliver: a model-family choice with data-size and interpretability tradeoffs. Refresher: transaction categories are business definitions, not necessarily natural clusters. Transfer: a model trained on clean printed receipts meets rotated, handwritten, and unfamiliar documents.

### M08 · Forecasting over time · 70 minutes

Teach forecast versus budget versus scenario; trend, seasonality, horizon, chronological evaluation, rolling origins, MAE/RMSE, bias, and uncertainty. Explain the problem with percentage errors near zero and distinguish an interval from a guarantee.

Use 72 synthetic months. Compare last-value, seasonal-naive, moving-average, trend, and seasonal-regression forecasts. Show results by horizon and across several origins. Add a regime change. Calibrate an illustrative error band on earlier residuals and measure later coverage.

Deliver: a forecast comparison and a decision about liquidity review. Refresher: revenue and cash collections differ. Assessment: repair a backtest that used future outcomes in preprocessing or driver features.

### M09 · Excel, Power Query, SQL, and Power BI · 70 minutes

Teach a single analytical problem through consistent stages: preserve source records, validate types, aggregate at a stated grain, join, calculate measures, reconcile, and present. Explain relational cardinality and filter context with actual small tables.

A fully worked invoice/payment example shows why joining two one-to-many tables multiplies revenue. Provide Excel formulas, Power Query steps, readable SQL, and a Power BI model diagram for the same reviewed totals. Let learners choose a tool path, with equivalent browser exercises if the product is unavailable.

Deliver: a reconciled result and an explanation of the model. Refresher: control totals and reconciliation. This is a guided bridge, not a claim of SQL or DAX fluency; extended building practice is separately scoped.

### M10 · Finance applications, value, and future scenarios · 50 minutes

Compare documented current uses: forecasting, reconciliation assistance, collections prioritization, document review, and commentary. Distinguish a publisher's account of its own deployment from independent evidence or a guaranteed outcome elsewhere.

Build a business case using total preparation, execution, review, and correction time. Include integration and maintenance costs. Separate measurable productivity from decision quality. Examine future scenarios such as coordinated close assistants with explicit prerequisites, constraints, and reasons adoption might stall.

Deliver: a bounded pilot proposal with baseline, owner, acceptance criteria, and stop condition. Assessment: challenge an impressive speed claim that omits review effort. Sources include current Microsoft Finance examples and ACCA/CA ANZ's 2026 skills/data report.

**Day 2 review · 30 minutes:** revisit day-one leakage inside a forecast, explain one network mechanism without the diagram, and submit a short analysis pack.

## Day 3 — Language models from mechanism to evidence

The first four modules form the expanded LLM benchmark: 270 minutes, detailed in [the benchmark specification](llm-benchmark.md).

### M11 · Language modeling, tokens, and embeddings · 55 minutes

Start with counts and n-grams, then neural language models and learned representations. Explain self-supervision: the next element in the text supplies a training target. Teach token versus word versus character, token ID versus meaning, and embeddings versus document storage.

Tokenize financial dates, amounts, account names, punctuation, and multilingual text with a named actual tokenizer. Compare a toy character tokenizer for instruction. Inspect learned versus illustrative embedding views with clear labels.

Deliver: a prediction/context explanation and a tokenization comparison. Assessment: diagnose why word counts do not determine token counts and why nearby IDs do not imply similar meanings. Historical transitions are linked to the problems earlier methods faced.

### M12 · Transformers and autoregressive generation · 80 minutes

Walk a short financial sentence through tokenization, embeddings, position information, query/key/value comparisons, masking, weighted information mixing, feed-forward layers, residual paths, and the next-token distribution. Explain decoder-only versus encoder-only versus encoder-decoder families.

Inspect a causal attention grid and then a measured trace from a tiny trained model where supported. Advance one generated token and watch the context and distribution update. Compare temperature and sampling while weights remain fixed.

Deliver: an annotated generation trace. Assessment: explain why training can compute many token losses in parallel while ordinary generation proceeds sequentially, and why an attention visualization does not prove a model's full reasoning or a statement's truth.

### M13 · Pretraining, post-training, and adaptation · 70 minutes

Teach corpus selection, quality, duplication, train/held-out separation, model/data/compute tradeoffs, instruction tuning, preferences, reward proxies, fine-tuning, and in-context examples. Explain RL concepts needed for preference/reward training without treating every post-training method as the same algorithm.

Train a small next-character model on a disclosed corpus; inspect loss and samples, including poor samples. Compare a simple adaptation experiment on general and finance-domain text. Use a clearly labeled response-selection simulation to show the consequences of rewarding confident style rather than supported content.

Deliver: a choice between context, retrieval, and parameter updates for three situations. Assessment: explain forgetting, data contamination, and why parameter count alone is not a purchasing criterion.

### M14 · Context, hallucination, and supported analysis · 65 minutes

Teach context windows, instruction hierarchy at a conceptual level, relevant versus excessive context, unsupported claims, arithmetic versus linguistic fluency, citations, abstention, and calibrated evaluation. Distinguish tokens likely under a model from facts likely true.

Investigate the supplied margin case: actual financial statements, misleading authored commentary, a deterministic calculation, a source ledger, and later evidence. Produce a revised narrative and explain what remains unknown. Compare prompt changes using declared criteria, not whichever output sounds nicer.

Deliver: an evidence-linked variance note and a critique of an alternative. Refresher: percentage points, gross profit, margin, and cash versus accrual. Retrieval infrastructure is developed on day four.

### M15 · Generative and multimodal AI · 60 minutes

Explain generative versus discriminative tasks and introduce image/audio generation, denoising intuition, multimodal representations, and extraction. Avoid implying that all generative systems use one architecture.

Inspect a learned low-dimensional denoising process beside a conceptual image-generation illustration. Work through invoice OCR with a confusing digit, units, line items, and a conflicting total. Compare extraction with validation and generation with evidence.

Deliver: a structured invoice extraction plus a reconciliation report and escalation. Assessment: explain why an attractive generated chart cannot be accepted as numerical evidence and why a readable OCR result can still be wrong.

**Day 3 review · 30 minutes:** explain the entire path from training data to a response without the UI; resolve a new variance case; revisit test contamination from day one.

## Day 4 — Applications, tools, and agent systems

### M16 · Retrieval and current company knowledge · 70 minutes

Teach document preparation, chunking, metadata, keyword versus vector search, embeddings, similarity, ranking, context assembly, citations, and freshness. Separate retrieval failures from generation failures. Revisit permissions and effective dates as retrieval constraints.

Search a versioned policy collection, alter chunk size/top-k, withhold the only supporting document, and introduce a superseded policy. Inspect required-document recall independently of answer support. Visual projections never determine the actual ranking.

Deliver: a retrieval audit with missing-evidence cases. Assessment: decide whether poor results require better data, retrieval, prompting, or fine-tuning and justify the diagnosis.

### M17 · Tools and execution contracts · 65 minutes

Teach tool names, descriptions, argument schemas, execution, results, errors, and permissions. Distinguish a proposed call from a completed action and an API/protocol from the application that uses it. Introduce MCP as one integration standard, not intelligence or authorization.

Execute exact monetary calculations and read-only ledger lookup. Inspect valid and invalid calls, a missing record, a timeout, and a retry. Use integer minor units or a reviewed decimal representation with explicit rounding.

Deliver: a tool definition, example requests/results, and checks. Assessment: recover from an ambiguous write result in a simulated environment without duplicating a transaction.

### M18 · Workflows and model-directed agents · 65 minutes

Teach model/application distinctions, fixed workflows, routing, tool loops, bounded autonomy, state, termination, and human review. Compare complexity, repeatability, latency, and outcome quality.

Run the same exception investigation as a fixed workflow and, optionally, a real model-directed agent. Inspect each observable request and result. A no-model exercise uses a transparently authored trace for diagnosis, not a pretend live agent.

Deliver: a system choice and a corrected execution trace. Assessment: identify a task where extra autonomy adds no value and a task where variable investigation paths justify it.

### M19 · Skills, harnesses, and recoverable state · 65 minutes

Teach procedural knowledge, skill packaging, progressive disclosure, reusable resources, versioning, sessions, context management, sandboxing, checkpoints, and recovery. Distinguish instructions from trained weights and permissions.

Author a reconciliation skill with prerequisites, steps, evidence requirements, and output criteria. Trace the harness loading it, enforcing tool access, recording progress, and resuming after interruption. Examine a changed policy version.

Deliver: a versioned skill and a recovery design. Assessment: explain why a well-written skill cannot enforce authorization or make a non-idempotent action safe by itself.

### M20 · Prompt and harness engineering · 65 minutes

Teach problem definition, input contracts, context selection, examples, output schemas, decomposition, evaluation, and iteration. Compare changing a prompt with changing retrieval, tools, validation, or execution state.

Start with a weak but plausible finance prompt. State evaluation criteria, revise one component at a time, compare raw outputs, and retain failures. Include instruction-like text inside an untrusted invoice. Test the surrounding controls rather than treating “ignore malicious text” as a guarantee.

Deliver: a versioned prompt/system change with an evaluation rationale. Assessment: diagnose an output problem that cannot be repaired by more emphatic wording.

**Day 4 review · 30 minutes:** reconstruct the application/tool/skill/harness distinctions, diagnose a policy-answer failure, and submit the system-design pack.

## Day 5 — Build, evaluate, and defend

### M21 · Build a financial pipeline with AI assistance · 60 minutes

Teach requirements, input/output contracts, reproducibility, dependency review, secrets, deterministic calculation boundaries, and meaningful tests through a supplied starter application. The core learner edits a bounded transformation and reviews generated changes; the engineering extension starts from a blank repository.

Build raw → validated → normalized → reconciled → analyzed → reviewed outputs. Introduce a duplicate key and a malformed amount. Inspect code and test evidence with an AI coding assistant or the supplied reviewed walkthrough.

Deliver: one working pipeline increment and a change explanation. Assessment: detect a plausible generated join that duplicates balances.

### M22 · Evaluation, monitoring, and release decisions · 60 minutes

Teach cases, trials, graders, outcomes, traces, development versus final evaluation, repeated-run variability, drift, incident review, and rollback. Separate arithmetic correctness, evidence support, task completion, and boundary compliance.

Construct a case suite before improving the assistant. Compare deterministic checks, human rubrics, and optional model grading. Inspect false passes and false failures. Calculate observed pass counts without presenting a small teaching suite as a reliability guarantee.

Deliver: an evaluation report with failure categories and release criteria. Assessment: explain why a good final message can conceal an incorrect system state.

### M23 · Integrate the finance assistant capstone · 80 minutes

Integrate previous artifacts rather than beginning a large application from nothing. The minimum system reads synthetic approved records, produces reconciled amounts, retrieves applicable policy, drafts an exception note, and places it in a review queue.

Learners choose a fixed workflow or bounded agent and justify the choice. They connect the existing components, define acceptance criteria, and produce a traceable demonstration. Core execution can use local deterministic components with clearly labeled authored response fixtures; an optional model connection must preserve actual outputs.

Deliver: a runnable prototype, data contract, architecture diagram, and one complete case trace. Scope is a learning prototype, not a payment or posting system.

### M24 · Unseen cases and incident investigation · 80 minutes

Freeze the proposed system and explain its expected behavior before revealing final variants. Cases include partial payment, duplicate ingestion, outdated policy, missing evidence, altered schema, tool failure, hostile source text, and a changed business condition.

Investigate at least two failures end to end. Explain the failed assumption, locate the responsible component, propose a correction, and add a regression case. Re-evaluating the same revealed cases is development evidence, not a new independent final score.

Deliver: an incident report, corrected artifact, and monitoring/rollback plan. Assessment includes an unfamiliar case that cannot be solved by memorizing the worked examples.

### M25 · Interview defense and next specialization · 50 minutes

Practice explaining mechanism, examining evidence, making a design choice, and responding to a changed constraint. Use short spoken or written defenses with follow-up questions. Score substance and reasoning, not confidence or jargon density.

Deliver: a portfolio walkthrough and competency map showing demonstrated strengths and remaining work. Choose a finance transformation, analytics, data science, or AI/agent engineering extension. A self-assessment is labeled as such; it does not certify professional readiness.

**Day 5 review · 30 minutes:** a cumulative challenge, comparison against the opening diagnostic, and a retention plan with optional later review sessions. The site offers review prompts; it does not claim a reminder has been scheduled.

## Coverage of the original brief

| Requested subject                                    | Main teaching | Revisited in                |
| ---------------------------------------------------- | ------------- | --------------------------- |
| AI, GOFAI, beginnings, early neural networks         | M01           | M06, M10, M18               |
| ML, data splits, fit, regularization, generalization | M02–M05       | M08, M13, M22–M24           |
| Deep learning and neural networks                    | M06–M07       | M11–M13, M15                |
| LLMs                                                 | M11–M14       | M16–M20                     |
| Generative AI                                        | M15           | M13–M14, M20                |
| Tokens                                               | M11           | M12, M14, M16               |
| Transformers                                         | M12           | M13, M15                    |
| LLM applications and agents                          | M18           | M21–M24                     |
| Tools                                                | M17           | M18–M24                     |
| Skills                                               | M19           | M20, M23                    |
| Harnesses                                            | M19           | M20–M24                     |
| Prompt/harness engineering                           | M20           | M21–M24                     |
| Current and future accounting uses                   | M10           | Every worked finance case   |
| Excel, Power BI, modeling, forecasting, pipelines    | M08–M09, M21  | M23–M25 and role extensions |

The chronology is a recurring spine, not a requirement to introduce prerequisites out of order. Tokens appear before transformer mechanics. The course explicitly distinguishes the original 2017 architecture, later decoder-only language models, post-training, and contemporary application systems.
