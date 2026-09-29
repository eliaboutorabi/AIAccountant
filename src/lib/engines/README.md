# Measured learning engines

These are original TypeScript implementations for AI Accountant. They do not download a model, call an API, fabricate learning curves or replay saved weights. A new instance starts from seeded random parameters. Training changes those parameters through reverse-mode differentiation and Adam. All core computation runs on the CPU with typed arrays.

The existing visual-reference projects informed the decision to expose real computation and keep training distinct from inference. No source from those repositories was copied into these files, and no new package was required.

## Invoice investigation classifier

```ts
import { FinanceMLP } from '$lib/engines/finance-mlp';

const model = new FinanceMLP({
	seed: 42,
	hiddenSize: 6,
	learningRate: 0.025,
	regularization: 0.001,
	trainCount: 96
});

model.train(10); // Ten actual 32-record minibatch updates.
model.metrics(); // Step, train and validation scores; never a final-test score.
model.inspect([0.6, 0.2]); // 54 overdue days and a 5% amount mismatch.
model.weights(); // Names, matrix dimensions and copied parameter values.
model.commitFinal(0.5); // Commit threshold and model; reveal final score and lock training.
```

The network has two normalized inputs, one tanh hidden layer and a sigmoid output. The default network has 25 trainable numbers. Inputs to public prediction and inspection methods lie in `[0, 1]`; the network scales them to `[-1, 1]`. Hidden activations, the output logit, probability and displayed weights come from one forward pass. The loss is binary cross-entropy. L2 regularization applies to weight matrices, excluding biases. The optimizer clips the global gradient norm to 5.

The original synthetic dataset represents requests for invoice investigation. It is not a fraud dataset. A disclosed nonlinear rule combines days overdue and amount mismatch; 4% of labels are independently flipped. There are 96 training, 64 validation and 192 final cases by default. Independent seeded streams generate the splits, so changing the training count does not change validation or final cases. UI-facing data returns copies and excludes final rows. The generator is exported for reproducibility; the final-case gate is an instructional commitment device, not a security boundary.

`metrics(threshold)` reports count, unpenalized cross-entropy, accuracy, true/false positives/negatives, precision and recall for training and validation. Precision or recall is `null` when its denominator is zero. A sigmoid score is not automatically a calibrated probability; this dataset cannot establish production risk performance.

`commitFinal(threshold)` returns a copied `{step, threshold, score}` record and keeps that exact commitment on repeated calls. Further training throws. Starting a new experiment permits another run, but using prior final results to choose the next configuration makes those cases part of development. The UI should explain this rather than claiming a fresh independent test after every reset.

## Character transformer

```ts
import { FinanceTransformer } from '$lib/engines/finance-transformer';

const model = new FinanceTransformer({ seed: 42, learningRate: 0.004 });
const before = model.inspect('cash ');
const example = model.trainingExample(0, 0);
model.train(5); // Five actual updates; two training windows per update.
const after = model.inspect('cash ');
const result = model.generate('cash ', { tokens: 60, temperature: 0.8, seed: 31 });
const scores = model.metrics();
```

Default architecture:

- Fixed vocabulary: 95 printable ASCII characters, newline, and an explicit unknown-character token (97 entries). It is declared before considering any corpus split.
- Context: at most 32 character tokens, with learned token and position embeddings of width 16.
- One decoder block with two causal attention heads, each of width 8. It uses separate query, key and value projections, head concatenation and an output projection.
- RMS normalization without learned gain; residual addition around attention and feed-forward sublayers. The feed-forward layer expands to width 32, uses ReLU, then contracts to width 16.
- Final RMS normalization, vocabulary projection and vocabulary bias: **5,761 trainable values** in total.
- Mean next-character cross-entropy, Adam with bias correction, global gradient norm clipping at 1. The learning rate is fixed during one experiment.

`finance-corpus.ts` contains 40 original training sentences, eight validation sentences and eight final sentences. They are fictional instructional material rather than external reports or a downloaded corpus. Entire sentences belong to one split. Training samples windows from training documents only. A leading and trailing newline marks document boundaries; training windows never join documents. Input and target sequences are shifted by exactly one character. Validation and final results use fixed, nonoverlapping windows, token-weighted across documents, so each target is counted once. Context resets at each evaluation window; reported loss therefore depends on that disclosed evaluation protocol.

The fixed character vocabulary round-trips supported financial ASCII text exactly. Unsupported characters such as `€` and Chinese characters are **explicitly mapped to the unknown token**; the inspection result retains the original character and `unknown: true`. This is a deliberately limited character tokenizer, not an implementation of a commercial LLM tokenizer. Character counts here are not provider billing estimates. The separate course token explorer should label its own tokenizer.

`inspect(text)` keeps the last `contextSize` tokens and explicitly reports truncation. Empty text uses a newline start token. It returns the actual token/position embeddings, embedded representations, Q/K/V, normalized attention matrices, masked scores, weighted values, mixed attention, residuals, feed-forward values, logits and softmax probabilities. `next` is the last position's distribution sorted by probability. Attention is `[head][query position][key position]`; masked future weights are exactly zero and scores are negative infinity. The arrays are fresh copies suitable for a table or 3D view. The same forward implementation is used for inspection, training, evaluation and generation, so there is no second explanatory model with different math.

`generate(text, options)` extends context one token at a time. Temperature changes the sampling distribution; zero selects the largest logit. Every generated token reports both its model probability at temperature 1 and the sampling probability after temperature adjustment. The result records the sampling seed separately from the training configuration. Inference never changes parameters, optimizer moments or the training random stream. Reusing a generation seed makes a controlled comparison possible. It does not make text truthful.

This model is intentionally small. It can learn character and short phrase patterns; it is not instruction tuned and cannot reliably answer accounting questions, reason, retrieve company facts or calculate. Loss reductions measure the next-character prediction objective on this particular corpus. Perplexity is `exp(mean cross-entropy)` in natural-log units. Neither is a correctness score for finance advice. Nonsense output at early or later stages is an authentic result, not a failed animation to be replaced with canned text.

## Representation comparison and transfer

```ts
import { RepresentationExperiment } from '$lib/engines/representations';

const experiment = new RepresentationExperiment(42);
experiment.train(100); // Same 32-record minibatches for all differentiable candidates.
experiment.metrics(); // Source train/validation loss and accuracy for all four procedures.
experiment.activations(); // Actual eight-unit validation representations.
experiment.commit('engineered'); // Predeclare the choice; freeze source models; reveal final results.
experiment.startTransfer(24, 'related'); // Reuse actual source weights; fresh optimizers for both.
experiment.trainTransfer(100); // Identical target minibatches and update counts for both.
experiment.transferMetrics();
experiment.transferWeights(); // Copied scratch/reused weights, for evidence export.
experiment.commitTransfer(); // Freeze target procedures; reveal both final scores.
```

`representations.ts` compares four complete procedures: raw logistic regression on x/y (3 parameters), logistic regression with the explicitly engineered x×y interaction (4), a greedy Gini tree of maximum depth 3 with at least 8 training records per leaf, and a 2→8 tanh→sigmoid MLP (33). The tree is fitted once on all source training records. Its leaves use Laplace-smoothed probabilities `(positives + 1) / (count + 2)`. It does not pretend to take gradient steps. The three differentiable models train on identical minibatches with Adam at 0.025, weight-only L2 strength 0.001, and gradient clipping at norm 5. Reported loss is unpenalized binary cross-entropy; accuracy thresholds the score at 0.5.

Source data are original four-corner abstract inputs with x/y magnitudes uniformly sampled in 0.35–0.95. Category A has equal input signs before independent 3% label flips. There are 128 source training, 96 validation and 192 final records from separate seeded streams. These coordinates have no financial units or implied real fraud, credit or accounting category meaning. The engineered feature explicitly supplies knowledge of a useful interaction, so its advantage is a procedure comparison, not a claim about architecture alone. A shallow greedy tree can struggle with these interactions; the UI shows its measured result rather than choosing a flattering checkpoint.

The hidden scatterplot selects two actual coordinates out of eight. It is neither PCA nor a manufactured embedding, and proximity in the picture is not a measured nearest-neighbor ranking in the complete representation. The synchronized table gives all eight values for all 96 validation records.

Target inputs rotate the original coordinates by 0.4 radians and shift x by 0.08; the `reversed` domain additionally reverses the underlying labels. Target count choices are 16, 24, 48 or 96, with a separate fixed 96-record validation split and 192-record final split. Changing the target training count preserves validation/final data. Capturing a source network locks further source updates. The reused network starts from a copy of the actual source parameters; scratch starts from the original seeded initialization. Both have new Adam optimizer state, receive identical target minibatches and update every parameter. This is full fine-tuning, not frozen feature extraction. Only transfer has the disclosed source training exposure. A single deterministic run can show help, no advantage or negative transfer; it cannot establish a universal ranking.

## Conditional denoising

```ts
import { DenoisingExperiment } from '$lib/engines/denoising';

const denoiser = new DenoisingExperiment({ seed: 42, maxTrainingNoise: 1 });
const before = denoiser.metrics(0.4);
denoiser.train(100);
const after = denoiser.metrics(0.4);
denoiser.validationPairs(0.4); // Clean reference, fixed noise draw, noisy input, estimate and error.
denoiser.commitFinal(0.4); // Commit evaluation noise and weights, then reveal 128 final points.
```

`denoising.ts` learns a real conditional regression problem with 98 parameters: three inputs (noisy x, noisy y, known noise standard deviation), 16 tanh units and two linear clean-coordinate outputs. Clean data are two equally represented Gaussian clusters centered at ±(0.65, 0.35), with within-cluster standard deviation 0.16. The 128 training, 64 validation and 128 final points use independent random streams. Every training update draws 32 clean training points with replacement, fresh Gaussian corruption, and noise standard deviations uniformly between 0.03 and the configured maximum. Adam uses learning rate 0.008 and gradient clipping at norm 3.

The objective is mean squared error per coordinate: average the two squared coordinate errors for each pair, then average the pairs. Validation and final points have fixed independent standard-normal draws. Evaluation multiplies the same draws by each requested noise standard deviation, making comparisons across noise levels paired. Inspection never changes weights or the training stream. The UI keeps a separate untouched model with the same initial weights to report before/after error on identical validation observations. It also reports the no-model baseline of passing noisy coordinates through unchanged. The shared chart extent includes every plotted coordinate; strong corruption is not hidden by clipping.

These are dimensionless point coordinates, not financial records or image pixels. Clean references and cluster identities exist for construction, training and evaluation; predictions receive only the noisy coordinates and known noise level. At strong corruption the original becomes ambiguous. Squared-error regression may produce a mean between plausible originals, rather than recover a unique original or generate a sample. The exercise implements neither a full diffusion sampling process nor image generation. It motivates a denoising objective while disclosing the missing noise schedule and repeated sampling machinery. See the primary [Denoising Diffusion Probabilistic Models paper](https://arxiv.org/abs/2006.11239) for the larger generative construction.

## Scheduling and UI contracts

All four engines are synchronous kernels with bounded chunk arguments: MLP 1–200 steps, transformer 1–50, representation/transfer and denoising 1–100. For responsive animation, use much smaller chunks (for example MLP 10 and transformer 5) and yield to the browser between them; terminate or cancel the caller's loop on unmount/reset. `metrics()` evaluates complete training/validation splits and should run at checkpoints, not once for every animation frame. Generation is bounded at 240 characters per call. Long repeated work can run in a worker using these same classes; the kernels do not access the DOM or browser globals.

UI state should record the configuration, corpus/data version, update count and observations. Resetting constructs a new instance. A reset during async orchestration needs a run ID so a previous callback cannot paint stale results. Display a trainable-parameter count rather than implying this toy has the size or capability of a modern LLM. The numerical trace is the accessible alternative to any canvas/3D illustration.

There are no saved or loaded checkpoints in these engines. If a future feature adds them, it must label the checkpoint's training data/configuration/step and must not describe loading as local training.

`ModelTrainingLab.svelte`, `TransformerLab.svelte`, `RepresentationLab.svelte` and `DenoisingLab.svelte` are standalone, client-initialized interfaces with no required props. They use explicit snapshots after operations, pause when the document is hidden, cancel pending callbacks on reset/unmount, and cap a run's total updates. Their JSON downloads record actual local evidence. Final commitments freeze optimization and persist their declared threshold/noise/candidate within the run; reset visibly warns about reusing already seen final cases. These gates teach an evaluation protocol and are not a security boundary or a claim that final results stay independent across repeated experiments.

`trained-network-scene.ts` renders the classifier's actual weights and current activations. Edge sign/width and node activation are explained beside an equivalent numerical table. Rotation and gentle motion are optional; the renderer respects reduced motion, stops when hidden, disposes GPU resources, and falls back to the table if WebGL is unavailable.

`final-exposure.ts` stores a separate, versioned browser record of revealed evaluation data. `readFinalExposure(datasetVersion, dataIdentity = 'fixed', split = 'final')` and `markFinalExposure(...)` return a status (`recorded`, `not-recorded`, or `unavailable`), timestamps and reveal count. The identity follows the data, not the model: generated classifier/representation/denoising splits use the data seed, whereas the fixed language corpus uses `FINANCE_CORPUS.version` and `fixed` across all initialization seeds and adaptation procedures. Representation source and target splits have separate markers; changing target label direction or training count does not reset exposure to the same target cases. UI exports include both the pre-reveal marker and current exposure status.

The marker survives navigation and reloads. Unreadable, corrupt or unwritable storage is reported as unknown prior exposure, never silently treated as an unseen test. It is local teaching evidence, not secure examination infrastructure. A missing marker cannot prove no earlier exposure, and deleting storage does not make a reused case independent. The bounded registry refuses new writes rather than evicting known older exposure records.

## Verification and primary references

`learning-models.spec.ts` checks finite-difference gradients across every transformer parameter family and MLP regularization/biases; actual loss reduction and changed parameters; split isolation; training-target shifts; supported tokenizer round trips; exact causal masking and future-token independence; forward-trace arithmetic; probability normalization; inference immutability; reproducibility across chunk boundaries; and one-time final commitment.

`representation-denoising.spec.ts` checks actual nonlinear learning versus a raw baseline, learned tree splits and leaf/depth constraints, exact source weight transfer, shared target examples and independent split sizes, chunk reproducibility, finite-difference denoising gradients, held-out error improvements, paired noise scaling and final-test locks. The two browser test files exercise train/pause/reset/commit behavior, real inspection and generation, and WCAG A/AA controls plus page overflow at a 390px viewport. Visual QA uses actual trained browser renders on desktop and mobile; chart/table values are produced by the engines, not illustrative saved outputs.

The gradient tape uses matrix-level operations rather than scalar graph objects. It accumulates gradients for shared parameter lookups and averages two transformer windows before each Adam update. Numerical checks include active embedding values so sparse zero-gradient entries cannot create a false sense of coverage.

The core mechanisms follow [Attention Is All You Need](https://arxiv.org/abs/1706.03762), [Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467), and [Adam](https://arxiv.org/abs/1412.6980). This small decoder-only architecture is not a reproduction of the original encoder-decoder transformer or a claim that every current LLM uses these exact components.
