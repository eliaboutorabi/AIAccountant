# LLM benchmark: the standard for the rebuild

Status: detailed specification plus an authored worked case. The expanded chapter and its labs are not implemented.

The LLM learning sequence spans M11–M14: **270 minutes**, followed by generative/multimodal learning in M15. It should feel like a substantial illustrated book chapter with experiments and assignments. A learner should be able to reconstruct the explanation, not merely recognize the terms.

## Outcomes and teaching sequence

| Module                             | Explanation and worked examples | Experiment | Assessment | Total   |
| ---------------------------------- | ------------------------------- | ---------- | ---------- | ------- |
| M11 · Language, tokens, embeddings | 25 min                          | 20 min     | 10 min     | 55 min  |
| M12 · Transformer and generation   | 35 min                          | 30 min     | 15 min     | 80 min  |
| M13 · Training and adaptation      | 30 min                          | 25 min     | 15 min     | 70 min  |
| M14 · Context and evidence         | 20 min                          | 25 min     | 20 min     | 65 min  |
| Total                              | 110 min                         | 100 min    | 60 min     | 270 min |

Prerequisites are the earlier learning/representation modules and basic table interpretation. For a standalone preview, provide a brief prerequisite recap with links; do not pretend it substitutes for all prior practice.

### 1. Why predicting language is a learning problem

Begin with several real-looking, fictional finance sentences. Let a learner compare plausible continuations before naming a language model. Explain why a distribution contains multiple possible continuations, and why predicting the recorded next token gives a learning signal.

Move from counting short sequences to shared learned representations. Explain what a count-based model cannot share across rarely observed phrases. Teach “parameter” as a learned number in a computation, with a visible example inherited from the neural-network module. Do not describe parameters as a filing cabinet containing individually retrievable source documents.

The explanatory bridge must address the difficult question: how can repeated prediction support summarization, code, and following instructions? Show how the training task rewards patterns across grammar, relationships, and structured sequences, while clearly separating that account from a guarantee of factual reasoning or any claim that every capability is fully understood.

### 2. What the model actually receives

Teach the sequence from text to tokens, IDs, and vectors. Inspect a date, invoice number, negative amount, decimal, and currency symbol. Show whitespace and a multilingual example. A tokenizer ID is a lookup key; numerical proximity of IDs has no semantic meaning.

Use actual output from one named tokenizer. The instructional character tokenizer is a second, separately labeled example. Explain that vocabulary and tokenizer choices affect length and representability; do not present token counts as universal billing estimates.

Introduce embeddings as learned lists of numbers used in computation. Illustrate why “bank” can play different roles in different sentences. Any two- or three-dimensional view is a projection, with rankings calculated in the full space when claiming actual similarity.

### 3. Following one token through a transformer

Show a complete information path, not an isolated web of glowing lines:

1. Token and position representation.
2. Query, key, and value projections, explained as learned comparisons and carried information.
3. A row of similarity scores and its normalized weights.
4. The causal mask: current and earlier positions are available, later positions are hidden.
5. A weighted combination of values.
6. Multiple heads, output mixing, a residual path, and a feed-forward transformation.
7. Repetition across blocks, final vocabulary scores, and a probability distribution.
8. Selection of a token, appending it to context, and the next step.

Explain why weights used for learning are different from the temporary attention weights computed for a particular sequence. Show an encoder-only contrast and the historical encoder-decoder transformer. Avoid saying every modern model uses the original design unchanged.

The analogy to colleagues consulting information is optional and bounded: the computation does not contain people, intentions, or independent accounting judgment.

### 4. Training versus inference, and what post-training changes

Animate one input/target shift in the training corpus. Predict at many positions under a causal mask, calculate loss, and update parameters. Then freeze parameters and generate a continuation one token at a time. Track parameter changes separately from the growing context.

Explain pretraining, instruction demonstrations, preferences, and the objective actually optimized. Include a failed reward proxy: a response selector rewarded for confident wording learns to prefer unsupported certainty. Label that experiment as a small analogy; it is not secretly a full RLHF-trained LLM.

Compare prompt examples, retrieval, and fine-tuning on business requirements. Fine-tuning can affect behavior and knowledge; retrieval can be wrong or stale. Avoid the overly absolute rule that one is “only style” and the other “always facts.”

Show training/validation loss and sample quality separately. Better prediction loss is useful evidence about the training objective, not proof of correct finance advice. Distinguish training from saved checkpoint loading, and make device limitations visible.

### 5. Context, generation settings, and evidence

Explain the context window as the material available for a particular computation, including supplied documents and prior interaction retained by the application. Product memory, storage, retrieval, and the model's parameters are separate concepts.

Let the learner change context while keeping the model fixed. Vary decoding in a controlled example. Lower temperature changes sampling behavior; it does not supply absent facts or guarantee truth. Do not equate token likelihood with a calibrated probability that a financial statement is correct.

Develop hallucination through a worked investigation rather than a repeated instruction to “be careful.” Ask what evidence supports each claim, what a calculator can verify, what is missing, and what should remain a hypothesis.

## Lab contracts

| Lab                     | Learner changes                      | What is computed                                              | What must remain explicit                                             |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| Token explorer          | Financial text and tokenizer choice  | Actual tokens, IDs, decoded byte/text pieces                  | Tokenizer name/version; no invented IDs                               |
| Next-token workbench    | Context and sampling settings        | A count-based distribution or tiny trained model distribution | Clearly identify which model produced it                              |
| Transformer walkthrough | Selected token/head and step         | A coherent forward trace                                      | Manual illustrative values labeled; measured trace separately labeled |
| Training workbench      | Training steps, seed, corpus variant | Actual updates, held-out loss, saved samples                  | Small-model limits, no fabricated improvement                         |
| Adaptation comparison   | Training examples and strength       | Changes in a disclosed small model on general/domain cases    | Not a frontier-model benchmark                                        |
| Variance investigation  | Available sources and draft claims   | Exact financial calculations and claim/source mapping         | Authored draft versus actual model output                             |

Each includes a default readable state, a prediction prompt, a controlled change, an explanation of the observed evidence, and a transfer task. Every 3D or canvas result has a corresponding accessible representation.

## Authored case: the margin story that sounds right

This is original fictional teaching material. The flawed draft below is authored for the exercise, not represented as an output obtained from a live model. Currency is USD thousands. Period is September 2026. Budget and actual cover the same entity and period.

### Evidence available at the start

Document BUD-SEP-01 is the approved budget. GL-SEP-01 is the reconciled actual report.

| Measure            | Budget | Actual |
| ------------------ | -----: | -----: |
| Revenue            |  1,200 |  1,140 |
| Cost of goods sold |    720 |    741 |
| Gross profit       |    480 |    399 |
| Gross margin       |    40% |    35% |

An accounting refresher is placed beside the table: gross profit is revenue less cost of goods sold; gross margin expresses gross profit as a share of revenue. Cash receipts can occur in a different period from revenue. A “percentage point” measures the difference between two percentages.

Draft to investigate:

> September gross margin fell 5% because freight costs increased 17%. Profit declined by $81,000, so cash is $81,000 lower. Revenue was weaker because sales volume fell.

The learner first tags each claim as supported, calculable, ambiguous, or unsupported. Do this before revealing the worked solution.

### Work the numbers, one step at a time

Revenue is 60 below budget: 1,140 less 1,200. Relative to budget, that is a 5% shortfall.

Cost of goods sold is 21 above budget. Gross profit therefore moves from 480 to 399: start with 480, subtract the 60 revenue shortfall, and subtract the extra 21 of cost. This arithmetic bridge explains the change in the total without establishing why revenue or costs changed.

Gross margin is 399 divided by 1,140, or 35%. Budget margin is 480 divided by 1,200, or 40%. The difference is **five percentage points**. Relative to the budget margin rate, the decline is 12.5%. Those are two different statements.

Gross profit fell 81, which is 16.875% of the budget gross profit. “Profit” is ambiguous here because the supplied table establishes gross profit, not operating profit or net income.

The cash claim cannot be derived from these records. Receivables, payables, inventory movements, financing, and other cash flows are absent. No model setting can create that missing evidence.

The table does not identify freight, sales volume, selling price, mix, returns, or discounts. A plausible story about any of them is still a hypothesis. A citation to GL-SEP-01 would not make the freight or sales-volume claims supported: that document lacks those details.

### A corrected first response

> September revenue was $1.140 million, $60,000 below budget. Cost of goods sold was $741,000, $21,000 above budget. Together these differences reduced gross profit by $81,000 to $399,000. Gross margin was 35%, five percentage points below budget. The supplied reports do not establish the causes of the revenue and cost changes or their cash-flow effect. We need revenue-driver detail, a cost breakdown, and cash-flow records before making those claims. Sources: BUD-SEP-01 and GL-SEP-01.

Explain why this response is useful: it preserves verified calculations, identifies the exact missing evidence, and supports the next investigation. It is not valuable merely because its tone is cautious.

### Reveal additional evidence

Document COST-SEP-02 supplies the reconciled cost breakdown:

| Cost component                   | Budget | Actual | Actual minus budget |
| -------------------------------- | -----: | -----: | ------------------: |
| Materials                        |    600 |    618 |                 +18 |
| Freight                          |     80 |     96 |                 +16 |
| Warehouse costs included in COGS |     40 |     27 |                 −13 |
| Total                            |    720 |    741 |                 +21 |

Now freight is supported as a contributor to higher cost: it rose 16, or 20%, rather than 17%. Materials rose 18 and warehouse costs fell 13. The total increase remains 21.

An updated gross-profit bridge is 480 − 60 − 18 − 16 + 13 = 399. This explains the accounting contributions, but not the operational causes of the freight increase or the revenue decline. Higher freight might reflect rates, routes, volume, timing, or classification; the next request depends on the decision being made.

Do not let the revised answer say freight was the sole cause of the five-percentage-point margin decline. The revenue denominator changed, other cost categories changed, and the evidence does not isolate a causal effect.

### Connect the case to the LLM mechanism

The model may produce fluent continuations that resemble familiar financial explanations. A frequent explanatory pattern is not evidence about Willow's September transactions. Adding COST-SEP-02 changes available context; it does not ordinarily update the model's parameters. A tool can supply the exact arithmetic. Retrieval can locate the current approved report. The application must still check version, scope, and whether the answer's claims follow the evidence.

The learner should explain each of those components and what happens if one fails. That connects the mechanics to professional judgment.

## Assessment: questions with meaningful alternatives

### Example A — Diagnose the intervention

The assistant keeps attributing margin declines to freight when the cost breakdown is missing. Choose the strongest first intervention and justify why the others might not solve this failure:

- Lower temperature while keeping the same inputs.
- Supply the available evidence, distinguish observations from hypotheses, require support for causal claims, and evaluate missing-evidence cases.
- Fine-tune on 100 polished commentary examples without checking their evidential support.
- Use a larger model and keep the same process.

The second is strongest for the specified failure. Lower temperature may change consistency, but does not add evidence. Fine-tuning may reinforce unsupported writing if examples contain it. A larger model might improve some behavior, but must be tested and still lacks missing records. Credit reasoning about the actual failure, not just selecting the second option.

### Example B — Transfer to a new case

A later quarter shows a higher gross profit amount but a lower gross margin. Ask the learner to construct a valid numerical example and explain how both can be true. This checks the accounting concept and prevents memorizing “margin down means profit down.”

### Example C — Explain the mechanism

“You pasted a new cost report, and the assistant revised its answer. Did it learn?”

A good answer distinguishes the everyday meaning of learning from parameter updates, explains the changed context, and notes that storage/training-use policies are separate product questions. A response that only says “no” receives limited credit.

### Example D — Critique an evaluation

The team improves prompts against these same cases 20 times, then reports their final pass rate as an independent estimate. Explain what the cases have become and propose a final assessment. The answer must connect back to validation and test separation, not introduce it as a new warning.

## Rubric for the written finance analysis

Five dimensions, each scored 0–3: absent/incorrect; partly correct; correct with support; correct with support and a relevant limitation or transfer insight.

1. Financial calculations, units, and terminology.
2. Distinguishing observed changes from explanations and causal claims.
3. Source support, scope, and version awareness.
4. Explaining the roles of context, model, retrieval, and calculation.
5. A useful next investigation and clear communication.

A provisional passing criterion is 12/15 with no zero in calculations or evidence. Calibrate this using actual learner answers; it is not a validated certification threshold. Provide marked examples at different levels. Self-scoring is clearly identified, and automated numeric checks do not claim to grade the whole explanation.

## Benchmark acceptance gate

The unit is ready as a quality benchmark when a reader can complete the full sequence, inspect the mechanisms, solve the unseen case, and explain the key distinctions using evidence. All supporting content must be authored, not replaced by “go read this external link.” The author must attempt the case from the supplied materials alone.

Technical verification includes tokenizer round trips, probability normalization, causal masking, training/inspection parity, parameter immutability during inference, split isolation, reproducible fixtures, and exact reconciliation of every monetary result. A beginner walkthrough should expose undefined vocabulary and missing steps. Record whether that walkthrough has actually happened.
