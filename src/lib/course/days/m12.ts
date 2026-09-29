import type { CourseModule } from '../types';
import { p, note, table, worked, steps, reflect, lab, section, check } from './content-helpers';
export const m12: CourseModule = {
	id: 'M12',
	day: 3,
	title: 'Transformers and autoregressive generation',
	subtitle: 'Trace information through attention, a transformer block, and the next-token loop.',
	minutes: 80,
	prerequisites: ['M11'],
	objectives: [
		'Trace a token through embeddings, position information, attention, feed-forward transformation, residual paths, and output scores.',
		'Explain queries, keys, and values using an actual weighted mixture, including what the analogy does not establish.',
		'Distinguish causal masking from causal inference, and attention weights from faithful explanations.',
		'Separate model probabilities, token selection, generation, and training.',
		'Predict how context, temperature, and model parameters affect a generation experiment.'
	],
	why: 'An interviewer asks why a transformer can use information from different parts of a report. “It pays attention to important words” is not enough. You need a mechanism you can trace, and a clear account of what that mechanism cannot guarantee.',
	sections: [
		section(
			'context',
			'Why isolated words are not enough',
			'Start with an accounting ambiguity, then ask what information must move.',
			p(
				'Compare “The customer paid the invoice after it became overdue” with “The customer disputed the invoice because it was incorrect.” The word “it” needs context to be useful. A model receives numerical token representations, not a human annotation linking each pronoun to a document. It must learn transformations that make its next-token predictions useful across examples. Attention is one way a representation at one position can draw information from other positions.',
				'Order also matters. “Willow owes Cedar” and “Cedar owes Willow” have the same three names and verb but reverse the obligation. A bag of token embeddings without order information cannot capture that distinction on its own. Transformers therefore incorporate positional information. The original paper added position encodings; many later architectures use different mechanisms, including relative or rotary position methods. The common requirement is that the model can respond to sequence position and relationships, not merely token membership.',
				'The 2017 transformer paper described an encoder–decoder architecture for tasks such as translation. An encoder forms representations of an input sequence; a decoder generates an output sequence while using permitted context. Many current generative text models are decoder-only: they predict continuations of an input and generated prefix. Encoder-only models are often used for representation tasks. “Transformer” names a family of architectures; it does not mean every model has the same blocks, training objective, or direction of information access.'
			),
			note(
				'mechanism',
				'Keep the representation in mind',
				'At each token position, the model carries an ordered list of numbers. A block transforms those lists. The diagrams may use words to orient you, but the actual operations work on numbers. A line between two tokens means a permitted computation, not a human mental association.'
			)
		),
		section(
			'qkv',
			'Queries, keys, and values are three learned views',
			'First understand matching and mixing; then attach the abbreviations.',
			p(
				'Imagine reading a note about a payment. At one position, you need to decide which other positions contain useful context. The model transforms the current representation into a query: a numerical pattern used to score possible sources. It transforms each available source representation into a key: another numerical pattern to compare with that query. It also transforms each source into a value: the information that can be mixed into the current position. These are learned projections, not hand-written SQL queries, database keys, or monetary values.',
				'A query is compared with each permitted key to produce a compatibility score. In standard scaled dot-product attention, the comparison combines matching dimensions and rescales the result. You do not need to compute the dot product to understand the next step: higher scores favor greater contribution. Softmax turns the permitted scores into positive shares that sum to one. The output is a weighted mixture of the value vectors using those shares.',
				'The distinction between keys and values matters. Keys help determine how much to take from a source; values determine what numerical information is taken. A model can learn different transformations for those roles. If they were all simply the original words, the explanation would miss the trainable mechanism. During training, gradients update the projection parameters to improve the overall prediction objective. Nobody has to tell each head “look for the invoice number”, and a head is not guaranteed to develop that tidy function.',
				'Two different quantities are often called weights. The projection weights are learned parameters stored in the model; ordinary inference keeps them fixed. Attention weights are temporary mixing shares calculated from this particular input at this layer and head. Changing the sentence can change those shares without training anything. Inspecting a different attention grid is therefore not evidence that the model updated its learned parameters.'
			),
			worked(
				'A weighted mixture you can audit',
				'An illustrative attention head assigns shares of 0.6, 0.3, and 0.1 to three permitted source positions. Their two-dimensional value vectors are [2, 0], [0, 4], and [1, 1]. These are authored numbers to teach the operation, not measurements from a trained model.',
				[
					'For the first output coordinate, combine 60% of 2, 30% of 0, and 10% of 1: 1.2 + 0 + 0.1 = 1.3.',
					'For the second coordinate, combine 60% of 0, 30% of 4, and 10% of 1: 0 + 1.2 + 0.1 = 1.3.',
					'The output of this head at this position is [1.3, 1.3]. Each coordinate uses the same attention shares but different source values.',
					'If the shares change to 0.1, 0.8, and 0.1, the output becomes [0.3, 3.3]. Changing relevance changes the information mixture.'
				],
				'Attention is a computed mixture of learned numerical representations. Its shares are not percentages of accounting truth, causal responsibility, or human confidence.'
			),
			table(
				'Do not carry the analogy too far',
				['Term', 'Role in attention', 'What it is not'],
				[
					[
						'Query',
						'Learned representation used to score source positions',
						'A literal user question or SQL statement'
					],
					[
						'Key',
						'Learned representation compared with the query',
						'A primary key identifying a unique business record'
					],
					[
						'Value',
						'Learned information to combine',
						'An invoice amount or verified factual claim'
					],
					[
						'Attention share',
						'Normalized contribution within one head and position',
						'A reliable explanation of why the whole model answered'
					]
				]
			),
			reflect(
				'If the highest attention share is on “freight”, may we conclude freight caused the gross-margin decline?',
				'Separate a model computation from a business causal claim.',
				'No. The share describes one weighted mixture in one layer and head. The full output depends on other heads, layers, residual paths, and values. Business causation needs financial records and an investigation design. Even an arithmetic cost bridge establishes contribution, not necessarily the underlying cause.'
			)
		),
		section(
			'mask',
			'The model must not look at tomorrow’s answer',
			'Masking enforces the information boundary of the prediction task.',
			p(
				'During training, the complete example text is available in memory. That is convenient, because the model can calculate losses for many positions in parallel. It also creates a risk: if the representation used to predict the next token can read that token directly, the task becomes cheating. A causal mask prevents each position from attending to later positions in the sequence. It normally permits the current token and earlier tokens. The target is shifted one position forward.',
				'For the sequence “cash was collected”, the representation at “was” may use “cash” and “was” to predict “collected”. It cannot use “collected” as an attention source for that prediction. The model may calculate all such position-wise predictions together during training because the known example is supplied, but the mask preserves the boundary for each one. This is a specific instance of the no-future-information principle you learned for forecasting and leakage.',
				'In this phrase, “causal” describes left-to-right access. It does not mean the model has discovered the cause of collections or established a counterfactual business explanation. Confusing the two meanings can create an impressive-sounding but false interview answer. You can state the real mechanism plainly: later tokens are unavailable to a position’s attention calculation.'
			),
			table(
				'Permitted sources in a three-token causal model',
				['Position used for prediction', 'May use', 'May not use', 'Observed training target'],
				[
					['“cash”', 'cash', 'was; collected', 'was'],
					['“was”', 'cash; was', 'collected', 'collected'],
					[
						'“collected”',
						'cash; was; collected',
						'Any later token',
						'Whatever follows in the example'
					]
				]
			),
			note(
				'warning',
				'Training parallelism and generation are different',
				'Known example tokens allow many masked position losses to be computed in parallel during training. At generation time, the next output token does not exist yet. It must be selected before it can become part of the context for the following step. Parallel training does not mean an autoregressive model writes all future tokens independently at once.'
			)
		),
		section(
			'block',
			'Attention is one part of the transformer block',
			'Follow the whole path so that the diagram does not become a vocabulary list.',
			p(
				'One attention head produces one kind of mixture. Multi-head attention uses several learned sets of query, key, and value projections, allowing different mixtures at the same positions. Their outputs are combined and projected into the representation carried by the block. Multiple heads create capacity for different relationships, but “one head for grammar and one for accounting” is an illustration, not a reliable architectural guarantee.',
				'The feed-forward sublayer then transforms each position’s representation through learned layers and a nonlinear activation. It operates separately at each position in a standard block, using the contextual information already assembled by attention. Think of attention as moving and combining information across positions, and the feed-forward part as further transforming that information within each position. Both are learned, and both affect the output.',
				'Residual connections add a sublayer’s change to the representation entering it. This provides a path through which information and learning signals can pass across many layers. Normalization controls aspects of the scale of intermediate values and supports stable computation and training. The precise ordering and kind of normalization vary by architecture. It is more useful to understand these roles than to memorize one diagram as the only transformer that exists.',
				'A model repeats such blocks. The representation after one block becomes the input to the next, allowing successive transformations of context. At the final position, an output projection produces a logit for each vocabulary token. Softmax converts those scores to a distribution. That distribution is the model’s prediction about continuation; it is not a calibrated probability that a complete financial answer will be correct.'
			),
			steps('Trace a decoder-style text model', [
				[
					'Input representations',
					'Token IDs select learned embeddings, and the model includes positional information.'
				],
				[
					'Masked multi-head attention',
					'Queries compare with permitted keys. Normalized shares mix value vectors in several heads.'
				],
				[
					'Residual and normalization operations',
					'The architecture preserves paths for existing information and manages representation scale. Exact ordering varies.'
				],
				[
					'Feed-forward transformation',
					'Learned layers and nonlinearity transform the contextual representation at each position. Residual paths connect sublayers.'
				],
				['Repeat blocks', 'Later blocks work with representations built by earlier blocks.'],
				[
					'Output scores',
					'A vocabulary projection gives logits. Softmax gives next-token probabilities. A decoding policy selects a token.'
				]
			]),
			lab(
				'transformer',
				'Inspect a real small transformer',
				'Select an input position and inspect the attention row, token representations, and next-token distribution from the same forward pass. Compare an early position with the final position. Train the small model, then inspect what changed.',
				'Will an early position place any attention on later positions? Will selecting a different input leave its contextual representations unchanged?',
				[
					'Check that forbidden future-position weights are zero and permitted weights sum to approximately one.',
					'Record one attention row and its selected layer/head/position, rather than calling it “the model’s explanation”.',
					'Compare the output distribution before and after a training update using the same input.'
				],
				'This is a tiny local educational transformer, not a frontier LLM. Attention is a measured internal computation; interpreting it as a complete explanation of behavior would exceed the evidence.'
			)
		),
		section(
			'generation',
			'Generation is a loop around the model',
			'Scores do not write a sentence until a selection rule chooses a continuation.',
			p(
				'After the model computes a next-token distribution, the application must select a token. Greedy decoding chooses the highest-probability token. Sampling draws from a distribution, so a lower-probability token can sometimes be selected. Temperature rescales logits before sampling: lower positive values make the distribution more concentrated, and higher values flatten it. The effect depends on the starting scores. Temperature zero is commonly implemented as a greedy special case; it is not evaluated by dividing logits by zero.',
				'The chosen token is appended to the context, then the model predicts again. This is autoregressive generation. A choice early in the answer changes the input to later steps, which is one reason two sampled runs can diverge. Generation stops at a stopping condition such as a designated end token, an output limit, or an application rule. A model can also generate a proposed structured tool call; the application must validate and execute it separately, as Day 4 explains.',
				'Temperature changes selection behavior; it does not update learned parameters. Supplying a corrected September table changes context; it does not ordinarily update weights either. Training changes parameters through an optimization procedure. Keep these three levers distinct: input evidence, model parameters, and decoding policy. A low temperature can make an unsupported answer more repeatable without making it true.',
				'Many implementations cache keys and values for previous positions during generation. A KV cache avoids recomputing some earlier work when adding a new token. It is an inference efficiency technique, not new training or a permanent store of approved company knowledge. The application still has to manage context, memory limits, and source freshness.'
			),
			worked(
				'Which lever did you change?',
				'An analyst performs three experiments on the same assistant.',
				[
					'Experiment A supplies a revised policy excerpt while keeping the model fixed. This changes the input context.',
					'Experiment B trains on approved examples, saving updated parameters. This changes the model through training.',
					'Experiment C keeps the input and parameters fixed but increases sampling temperature. This changes the token-selection distribution.'
				],
				'All three may change the output. Observing a changed answer alone does not identify which mechanism changed.'
			),
			reflect(
				'Your manager asks for “temperature zero so the figures are guaranteed correct.” How do you respond?',
				'Acknowledge the useful part, then explain the missing control.',
				'Greedy selection can reduce sampling variation, which may help repeatability. It does not establish factual correctness or exact arithmetic. I would supply authoritative records, use a tested calculation tool, validate numeric fields, and evaluate unsupported claims. Repeatability and correctness are different properties.'
			)
		),
		section(
			'professional',
			'Explain enough to guide a design decision',
			'Technical fluency becomes useful when it changes the questions you ask.',
			p(
				'Suppose Willow’s model fails to use a definition located far from the variance table. You now have several plausible investigation paths: the input may have been truncated; the relevant clause may be ambiguous; conflicting examples may dominate the context; the model may struggle with the task; or the application may have supplied the wrong version. A colorful attention image alone cannot distinguish all of these. Start with the exact input and expected evidence, then run controlled comparisons.',
				'In a technical interview, give the mechanism in a connected order. Say that embeddings and position information enter repeated blocks; queries and keys produce compatibility scores; masked softmax shares mix values; feed-forward transformations and residual paths update representations; output logits and a decoding rule select the next token; and the loop repeats. Then state the limits: attention is not truth verification, masking is not causal discovery, and a generated tool request is not execution. This is substantially more useful than claiming that the model “understands everything in the prompt”.'
			)
		)
	],
	checks: [
		check(
			'm12-q1',
			1,
			'Attention shares are 0.5 and 0.5, and value vectors are [2,4] and [6,0]. What is the weighted output?',
			['[8,4]', '[4,2]', '[2,0]'],
			1,
			[
				'This sums the vectors without applying the shares.',
				'Correct: half of each vector gives [1+3,2+0] = [4,2].',
				'This selects or truncates values instead of forming the weighted mixture.'
			]
		),
		check(
			'm12-q2',
			2,
			'At the second position in a standard causal decoder, which sources are permitted?',
			[
				'Only the first position',
				'All positions because the training text is known',
				'The first and second positions'
			],
			2,
			[
				'The current input token is generally available too; the prediction target is the next token.',
				'Allowing later tokens would leak information about the prediction target.',
				'Correct. The position can use itself and earlier positions, while later positions are masked.'
			]
		),
		check(
			'm12-q3',
			0,
			'What does the feed-forward part add after attention?',
			[
				'A learned nonlinear transformation at each position',
				'A guarantee that statements are factually correct',
				'A replacement for tokenization'
			],
			0,
			[
				'Correct. It transforms the contextual representations produced by earlier operations.',
				'No sublayer checks truth without an appropriate task, evidence, and evaluation.',
				'Tokenization precedes embedding lookup; a feed-forward sublayer works on numerical representations.'
			]
		),
		check(
			'm12-q4',
			3,
			'You increase temperature and get a different answer. What has necessarily changed?',
			[
				'The model weights',
				'The distribution used for token selection',
				'The approved financial source'
			],
			1,
			[
				'Decoding temperature does not itself train the model.',
				'Correct. Rescaling logits affects selection probabilities; it does not guarantee a particular different token on every draw.',
				'The source data may be identical. Output variation alone does not imply changed evidence.'
			]
		),
		check(
			'm12-q5',
			2,
			'A head places high attention on a cost line. Which claim is justified?',
			[
				'That cost line caused the variance',
				'The full model relied only on that line',
				'That position received a large mixing coefficient in this head'
			],
			2,
			[
				'Business cause is not established by an attention weight.',
				'Other heads, layers, paths, and values also affect the output.',
				'Correct. The large attention share is a mixing coefficient. The resulting contribution also depends on the value vector, so a large share alone does not establish a large output effect.'
			]
		),
		check(
			'm12-q6',
			4,
			'Why can masked training score many positions in parallel while generation proceeds token by token?',
			[
				'The training example already supplies the prefix tokens for each position',
				'Generation disables the transformer',
				'Training uses no next-token targets'
			],
			0,
			[
				'Correct. Known input tokens plus masking permit parallel position calculations; future generated tokens do not yet exist.',
				'The transformer still computes the next-token distributions during generation.',
				'Next-token targets are central to this training setup, with the target sequence shifted by one.'
			]
		)
	],
	assignment: {
		title: 'Trace and diagnose a transformer-assisted draft',
		scenario:
			'Willow’s assistant says freight caused the margin decline. The team presents a heatmap showing attention on “freight” as proof. They also suggest lowering temperature to eliminate errors.',
		tasks: [
			'Trace the complete route from a report sentence to one generated token.',
			'Calculate the illustrative mixture for shares [0.2,0.8] and values [5,0], [0,10].',
			'Explain why the heatmap and temperature proposal do not establish financial correctness.',
			'Design a controlled comparison that tests whether the supplied cost table affects the answer appropriately.'
		],
		deliverable:
			'A one-page technical explanation plus a small experiment plan with fixed and changed inputs.',
		rubric: [
			{
				criterion: 'Mechanism is complete',
				evidence:
					'Includes representations, position, Q/K/V, masking, feed-forward/residual roles, output scores, and selection.'
			},
			{
				criterion: 'Arithmetic is reproducible',
				evidence: 'The mixture is [1,8], with separate coordinate calculations.'
			},
			{
				criterion: 'Claims match evidence',
				evidence: 'Separates attention, causal evidence, repeatability, and correctness.'
			},
			{
				criterion: 'Experiment isolates a change',
				evidence:
					'Keeps the model and decoding settings fixed while changing one source fact; defines the expected answer and checks.'
			}
		],
		workedSolution: [
			'For the mixture, the first coordinate is 0.2×5 + 0.8×0 = 1. The second is 0.2×0 + 0.8×10 = 8. These are transformed numerical features, not financial amounts unless we explicitly defined them that way.',
			'Text is tokenized into IDs; embeddings and position information become model representations. Repeated blocks use masked attention to mix values according to query–key scores, and use feed-forward transformations, residual paths, and normalization. Final logits become a next-token distribution; a decoding policy selects one token and the loop repeats.',
			'The heatmap shows one internal contribution pattern. It does not prove a business cause or isolate the entire model’s reasoning. Lower temperature changes sampling behavior and may improve repeatability; it is not a financial control.',
			'Use two otherwise identical cases with reconciled but different freight values and stable model/settings. Require the narrative to reflect the changed arithmetic while avoiding unsupported causes. Verify numbers with a calculation tool and score source support. Repeat runs if stochastic behavior is part of the intended deployment.'
		]
	},
	interview: {
		question: 'Explain a transformer without calling it a black box.',
		strongAnswer: [
			'The model turns token IDs into vectors and represents their positions. In attention, a position’s query is compared with permitted keys; normalized scores determine how value vectors are mixed. Multiple heads provide multiple learned mixtures.',
			'Feed-forward transformations, residual connections, and normalization process those representations through repeated blocks. A final projection produces vocabulary scores. The decoding rule selects a token, adds it to context, and repeats. A causal mask prevents access to later input positions during next-token training.',
			'This explains information flow, not guaranteed truth or business causation. I would evaluate answers against approved evidence and inspect tool execution separately from generated requests.'
		],
		followUps: [
			{
				question: 'What changes if you append a new policy paragraph?',
				answer:
					'The token sequence and contextual representations change during inference. The learned parameters ordinarily remain fixed. If the policy creates a conflict, the application still needs version and authority rules plus evaluation.'
			},
			{
				question: 'Are attention weights a faithful explanation?',
				answer:
					'They are real intermediate computations in a specified head and layer. They can be informative to inspect, but they do not alone establish which evidence causally determines an output or whether a business claim is true.'
			}
		]
	},
	sources: [
		{
			label: 'Vaswani et al. (2017): Attention Is All You Need',
			url: 'https://arxiv.org/abs/1706.03762',
			note: 'Original encoder–decoder transformer; later architectures differ in normalization, positions, and block design.'
		},
		{
			label: 'Google: Large language models',
			url: 'https://developers.google.com/machine-learning/crash-course/llm'
		},
		{
			label: 'Jain & Wallace (2019): Attention is not Explanation',
			url: 'https://aclanthology.org/N19-1357/',
			note: 'Evidence against treating attention weights as universally faithful explanations; not a claim that internal inspection has no value.'
		}
	]
};
