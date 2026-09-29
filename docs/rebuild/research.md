# Reference review and research register

Reviewed September 28, 2026. This document distinguishes observed source code, browser observations, publishers' claims, and design decisions. Repository code was inspected but its full training/test suites were not run during this research pass.

## Jaxverse

Repository: [NeoVand/jaxverse](https://github.com/NeoVand/jaxverse).
Inspected revision: ce42dcadc81f9ba3bb80006140e0157135dcf349.

Important inspected locations:

- [Language chapter](https://github.com/NeoVand/jaxverse/blob/ce42dcadc81f9ba3bb80006140e0157135dcf349/src/routes/language/+page.svelte)
- [Transformer model](https://github.com/NeoVand/jaxverse/blob/ce42dcadc81f9ba3bb80006140e0157135dcf349/src/lib/llm/model.ts)
- [Initial next-token illustration](https://github.com/NeoVand/jaxverse/blob/ce42dcadc81f9ba3bb80006140e0157135dcf349/src/lib/components/demos/language/NextTokenGame.svelte)
- [Authoring guide](https://github.com/NeoVand/jaxverse/blob/ce42dcadc81f9ba3bb80006140e0157135dcf349/docs/AUTHORING.md)

The language chapter develops a chain of questions: prediction, representation, word vectors, tokenization, autoregressive modeling, training, and inspection. It alternates prose and experiments, interpreting results after each experiment. The model implementation includes causal attention, learned projections, feed-forward computation, and an inspection path. The first probability illustration is hand-set; later machinery is separate. This distinction matters when adapting it.

Adopt the connected explanation, experiment captions, shared state across related views, and inspectable computations. Finance versions should let learners follow the same invoice or sentence through successive representations. Avoid importing mathematical prerequisites without teaching them. The authoring guide's equation-centered approach is not our core requirement; preserve the underlying concepts through traces, values, and visual explanations.

A conventional live chapter URL returned 404 during this review; no successful live Jaxverse training run is claimed. The observations above are from the pinned source.

## Pattern

Repository: [NeoVand/pattern](https://github.com/NeoVand/pattern).
Inspected revision: 985b74a85f8116421605371ddafbccf596844a46.
Live language interface inspected: [Pattern](https://neovand.github.io/pattern/#language).

Important inspected locations:

- [Learning machinery](https://github.com/NeoVand/pattern/blob/985b74a85f8116421605371ddafbccf596844a46/docs/learning-machinery.md)
- [Activity definitions](https://github.com/NeoVand/pattern/blob/985b74a85f8116421605371ddafbccf596844a46/src/lib/data/challenges.ts)
- [Learning notebook](https://github.com/NeoVand/pattern/blob/985b74a85f8116421605371ddafbccf596844a46/src/lib/components/LessonChallenge.svelte)
- [Generalization experiment](https://github.com/NeoVand/pattern/blob/985b74a85f8116421605371ddafbccf596844a46/src/lib/ml/generalization-challenge.ts)
- [Agent tools](https://github.com/NeoVand/pattern/blob/985b74a85f8116421605371ddafbccf596844a46/src/lib/ai/agent-tools.ts)
- [System-choice capstone](https://github.com/NeoVand/pattern/blob/985b74a85f8116421605371ddafbccf596844a46/src/lib/ml/system-choice.ts)

The inspected notebook asks for predictions, observed evidence, and transfer, and explicitly says written responses are not automatically graded. The generalization code creates separate seeded datasets. The system-choice exercise distinguishes development, final cases, and changed conditions. The tools validate arguments and execute allowlisted functions.

The live language interface separates inference, a conceptual transformer walkthrough, and tiny-model training. Its attention view clearly labels hand-chosen vectors. No API key was entered, large model downloaded, or live inference/training independently verified in this review.

Adopt the separation of experiment modes, evidence-first reflection, argument/result inspection, and commitment before final evidence. Extend the notebook into a scaffolded adult assessment. A filled textbox must never be treated as demonstrated mastery.

## Concrete adaptation map

| Reference pattern                               | Finance adaptation                                                                | Expected learning evidence                                |
| ----------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Jaxverse prose → experiment → interpretation    | Explain a collections predictor, inspect it, interpret one surprising case        | Learner explains the intermediate computation             |
| Jaxverse tokenization feeding language modeling | Change invoice-note tokenization; inspect sequence length and vocabulary          | Learner distinguishes tokenization from training          |
| Jaxverse shared model inspection                | 3D network, activation table, and output read the same model snapshot             | Display values reconcile to model calculations            |
| Pattern prediction/evidence/transfer notebook   | Record a forecast expectation, actual error, and implication for cash planning    | Reasoning cites observed results                          |
| Pattern committed final check                   | Select a model on earlier cases before later customer/month cases are revealed    | Final evidence is distinguishable from selection evidence |
| Pattern rolling forecast comparisons            | Collections baselines, horizon changes, regime shift, empirical interval coverage | A defensible forecast and limitation statement            |
| Pattern retrieval audit                         | Current versus superseded travel policies with document permissions               | Separate retrieval and answer-support diagnoses           |
| Pattern tool transcripts                        | Exact money calculation, ledger reads, and proposed reviewer notes                | Actual results distinguish intention from execution       |
| Pattern system-choice capstone                  | Reconciliation + policy + commentary + review                                     | Reproducible end-to-end evidence and failure analysis     |

These are design adaptations, not assertions that every reference feature is correct or suitable unchanged. Review explanations against primary sources and test each imported calculation. In particular, do not generalize one tokenizer's boundaries to every tokenizer; do not interpret attention as a full explanation; and do not claim a tiny model's behavior predicts all production models.

Neither pinned repository exposes a root license in the inspected file inventory, and GitHub's license field is null. No third-party code or artwork has been copied into the application in this planning pass. For implementation, record the permission/license basis, exact revision, and credits for verbatim imports. Finance-specific prose, datasets, and illustrations should be authored for this course. This does not prevent adopting the interaction ideas now.

## Research register

Sources were opened during this review. Paper abstracts establish high-level provenance; detailed implementation claims must additionally be checked against the relevant full-paper sections while implementing. Avoid claiming a complete literature review.

| ID  | Source                                                                                                                             | Use in the rebuild                                                                | Scope and limitation                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| R01 | [IES: Organizing Instruction and Study](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)                                               | Worked examples, concrete/abstract links, explanatory questions, spaced retrieval | General learning guidance with varying evidence ratings; not a trial of this adult course        |
| R02 | [Google ML Crash Course](https://developers.google.com/machine-learning/crash-course)                                              | Coverage checklist and examples of combined explanation/practice                  | A curriculum reference, not evidence that copying its duration ensures learning                  |
| R03 | [Google: ML exercises](https://developers.google.com/machine-learning/crash-course/exercises)                                      | Variety of applied practice across ML topics                                      | Adapt difficulty and finance context                                                             |
| R04 | [scikit-learn: common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html)                                              | Preprocessing leakage and consistent pipelines                                    | Recheck API details when authoring optional Python exercises                                     |
| R05 | [Forecasting: time-series cross-validation](https://otexts.com/fpp3/tscv.html)                                                     | Rolling origins and horizon-aware evaluation                                      | R examples inform the method; do not imply a browser lab reproduces its datasets                 |
| R06 | [Microsoft: star schema](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema)                                          | Grain, fact/dimension roles, relationships                                        | Broader modeling topic needs worked finance tables                                               |
| R07 | [Computer History Museum: AI timeline](https://www.computerhistory.org/timeline/ai-robotics/)                                      | Historical spine and contextual milestones                                        | Supplement individual foundational claims with original publications where needed                |
| R08 | [Vaswani et al.: Attention Is All You Need](https://arxiv.org/abs/1706.03762)                                                      | 2017 transformer origin and architecture                                          | Original encoder-decoder work; not a universal diagram of every modern LLM                       |
| R09 | [Brown et al.: Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)                                            | In-context examples without parameter updates; historical scale                   | Historical experimental results, not a guarantee for current products                            |
| R10 | [Hoffmann et al.: compute-optimal training](https://arxiv.org/abs/2203.15556)                                                      | Model/data/compute tradeoffs                                                      | Avoid “more parameters always wins” and universalizing the paper's fitted ratios                 |
| R11 | [Ouyang et al.: instruction following with human feedback](https://arxiv.org/abs/2203.02155)                                       | Demonstrations, preferences, and post-training                                    | One historically important approach, not all post-training                                       |
| R12 | [Lewis et al.: Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)                                                   | Retrieval alongside parametric knowledge                                          | Original research design differs from many current retrieval pipelines                           |
| R13 | [Liu et al.: Lost in the Middle](https://arxiv.org/abs/2307.03172)                                                                 | Context utilization as an empirical question                                      | Findings apply to tested models/tasks; do not assert every 2026 model has the same curve         |
| R14 | [Google: embeddings](https://developers.google.com/machine-learning/crash-course/embeddings)                                       | Dense representations and contextual meaning                                      | Clarify learned spaces and projection limitations                                                |
| R15 | [Google: LLM introduction](https://developers.google.com/machine-learning/crash-course/llm)                                        | Language-model vocabulary and prerequisite mapping                                | Use alongside primary papers, not as the sole source                                             |
| R16 | [Google: transformer overview](https://developers.google.com/machine-learning/crash-course/llm/transformers)                       | Encoder/decoder family comparison                                                 | Its broad discussion of masked prediction must not be used to say every LLM trains that way      |
| R17 | [Google: fine-tuning and prompting](https://developers.google.com/machine-learning/crash-course/llm/tuning)                        | Adaptation vocabulary                                                             | Distinguish fine-tuning from prompt context and retrieval                                        |
| R18 | [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)                            | Workflows versus model-directed tool loops                                        | Published December 2024; page points readers to newer tooling material                           |
| R19 | [Anthropic: Managed Agents](https://www.anthropic.com/engineering/managed-agents)                                                  | Sessions, harnesses, execution environments, recovery                             | April 2026 implementation account; not the only valid architecture                               |
| R20 | [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)              | Tasks, trials, graders, traces, outcomes                                          | January 2026 engineering guidance; small teaching suites do not establish production reliability |
| R21 | [Agent Skills specification](https://agentskills.io/specification)                                                                 | Skill packaging and progressive disclosure                                        | A concrete standard, not a universal meaning of “skill”                                          |
| R22 | [MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)                                   | Tool schemas and protocol responsibilities                                        | Versioned reference; MCP is not an agent or a permission guarantee                               |
| R23 | [Microsoft Finance: AI in Finance](https://www.microsoft.com/en-us/frontierfinance/ai-in-finance.aspx)                             | Current application examples in forecasting, collections, documents, and workflow | First-party deployment account; avoid presenting marketing claims as independent ROI evidence    |
| R24 | [ACCA/CA ANZ: Enabling finance insight](https://www.accaglobal.com/policy-and-insights/reports/2026/enabling-finance-insight.html) | Data quality, analytical capability, integration, and critical judgment           | July 2026 report landing page reviewed; survey and qualitative findings are not causal proof     |

## Decisions the research changes

1. Add data preparation and evaluation as major topics before neural networks. Finance capability is not achieved by memorizing model names.
2. Put explanatory graphics next to the exact reasoning they illustrate. Decorative art continues to support atmosphere.
3. Use actual learning where the concept being taught is learning. A changing animation alone is not evidence of training.
4. Make knowledge retrieval, generation, calculation, and authorization separately inspectable.
5. Teach the original transformer architecture and common later variants distinctly.
6. Use a cross-day case portfolio and delayed retrieval. Page completion alone does not show retention or transfer.
7. Teach both system value and its operating costs. Vendor examples motivate questions; the learner still has to build a defensible business case.
8. State explicitly which future applications depend on data access, reliability, economics, accountability, and organizational change.

## Remaining research during implementation

Verify detailed model equations and inspection parity from full papers/implementations before writing the numerical engines. Select and document the tokenizer/model versions, data licenses, supported device budgets, and current Excel/Power BI/Copilot workflows at the time those labs are built. Gather role-specific job requirements for the chosen specialization rather than inventing a universal interview syllabus. Conduct novice and accounting-practitioner walkthroughs once the LLM benchmark is usable.

These are named implementation checks. They are not completed findings and must not be marked verified in the course.
