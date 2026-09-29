import type { CourseModule } from '../types';

export const day2Modules: CourseModule[] = [
	{
		id: 'M06',
		day: 2,
		title: 'Inside a trainable neural network',
		subtitle: 'Follow one case forward and one learning signal backward.',
		minutes: 70,
		prerequisites: ['M03', 'M04', 'M05'],
		objectives: [
			'Trace weighted contributions, bias, activation, and a forward pass.',
			'Explain how backpropagation and optimization update a network.',
			'Distinguish architecture, trained parameters, activations, and evidence of generalization.'
		],
		why: 'The same building blocks support modern deep learning. Understanding a small network makes later language-model explanations concrete rather than mysterious.',
		sections: [
			{
				id: 'from-line-to-network',
				title: 'From one prediction rule to connected computations',
				lead: 'A neural network expands the adjustable calculation you trained yesterday.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'In M03, a model combined an input with a fitted variable amount and added a fixed amount. A neural-network unit begins similarly: multiply inputs by weights, add the contributions and a bias, then apply an activation function. Connecting many such units lets later computations use combinations produced earlier. A hidden layer is an intermediate collection of units between input and output.',
							'The architecture describes that arrangement: how many inputs, layers, units, connections, and kinds of transformation are allowed. Parameters are the learned weights and biases within it. Activations are the values produced for a particular input. A trained parameter can be reused across thousands of invoices while each invoice produces a different pattern of activations.',
							'For a collections model, inputs might include days overdue and a customer’s past late-payment share. A hidden unit might respond to one combination of those signals while another responds differently. Do not assign a convenient accounting name to every unit as if it were an explicit policy rule. Internal representations can be distributed across units and change across training runs.'
						]
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'A collections prediction is conditional on a cutoff',
						paragraphs: [
							'This module’s hypothetical task is to estimate whether an already outstanding invoice remains unpaid 30 days after today’s review date. Days overdue is therefore known today. It would not be an allowed feature for the issue-date task in M02. A feature is not inherently leaked or safe; its availability depends on the defined decision time.',
							'Past late-payment share means the proportion of eligible prior invoices that met the declared late definition. Specify the lookback period, mature outcomes, and treatment of a customer with no history.'
						]
					}
				]
			},
			{
				id: 'one-forward-pass',
				title: 'Trace one case through two hidden units',
				lead: 'Every line in the diagram represents a numerical contribution.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Illustrative hand-worked parameters for teaching, separate from the lab’s trained weights. Inputs are scaled age 0.8 and past late-payment share 0.2.',
						headers: [
							'Unit',
							'Age contribution',
							'History contribution',
							'Bias',
							'Before activation',
							'After ReLU'
						],
						rows: [
							['Hidden A', '0.8 × 0.5 = 0.40', '0.2 × −0.25 = −0.05', '0.10', '0.45', '0.45'],
							['Hidden B', '0.8 × −0.2 = −0.16', '0.2 × 0.6 = 0.12', '0', '−0.04', '0']
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'A positive weight makes a larger input raise that unit’s pre-activation value when other inputs stay fixed. A negative weight makes it lower the value. The bias is an offset, analogous to the fixed amount in our regression. It is not the same meaning of “bias” as unfair treatment or systematic forecast error. Context tells you which technical meaning applies.',
							'ReLU, short for rectified linear unit, returns zero for a negative input and otherwise keeps the value. Hidden A therefore passes 0.45; hidden B passes zero. This small change in behavior at zero is a nonlinearity. Other activations behave differently. The design choice affects what the network can represent and how it trains.',
							'Suppose the output combines hidden A with weight 0.7, hidden B with weight −0.4, and bias −0.1. The combined value is 0.45 × 0.7 + 0 × −0.4 − 0.1 = 0.215. A sigmoid transformation maps it to a number between zero and one, approximately 0.554. That is a model score that can be trained toward a binary outcome. Its interpretation as a calibrated probability still needs M05’s evidence.',
							'The forward pass is this complete computation from input to output. No parameter changed while we followed the case. If age changes, the same parameters may produce different hidden values and a different output; that is another inference, not training.'
						]
					}
				]
			},
			{
				id: 'nonlinearity',
				title: 'Why activation is more than decoration',
				lead: 'A stack of straight transformations is still a straight transformation.',
				blocks: [
					{
						kind: 'worked',
						title: 'Two linear layers collapse into one',
						problem:
							'A first unit doubles an input and adds 1. A second triples that result and subtracts 4. Consider input values 0, 1, and 2.',
						steps: [
							'The first unit produces 1, 3, and 5.',
							'The second produces −1, 5, and 11.',
							'A single unit that multiplies the original input by 6 and subtracts 1 gives exactly the same three results—and the same relationship for every input.',
							'Adding more such purely linear/affine layers does not create arbitrary curved decision boundaries. Nonlinear activation changes that expressive possibility.'
						],
						conclusion:
							'Depth without appropriate nonlinear transformations is not the same as a rich nonlinear model.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'A useful geometric example has four corners: two opposite corners in one class and the other two in another class. A single straight boundary cannot separate those alternating classes. A small network with nonlinear hidden units can combine several regions to represent the pattern. This is a teaching shape, not a claim that a finance process must follow that pattern.',
							'Expressive ability does not guarantee that training finds a useful solution or that the data support it. Additional units give the model more ways to fit. They can help represent real interactions, but can also fit accidental detail. Architecture selection returns us to validation, regularization, and representative evidence rather than replacing them.'
						]
					}
				]
			},
			{
				id: 'backward-pass',
				title: 'How an error changes earlier connections',
				lead: 'Backpropagation computes sensitivities; the optimizer uses them.',
				blocks: [
					{
						kind: 'steps',
						title: 'One learning cycle',
						steps: [
							{
								title: 'Forward',
								text: 'Run a batch of known examples through the current network and retain intermediate values.'
							},
							{
								title: 'Measure',
								text: 'Compare predictions with their targets using the declared loss.'
							},
							{
								title: 'Propagate sensitivity backward',
								text: 'Work from output toward earlier layers, combining how each local calculation affects the next. This efficiently computes how each parameter affects loss.'
							},
							{
								title: 'Update',
								text: 'The optimizer uses those gradients and its learning-rate settings to change parameters.'
							},
							{
								title: 'Recompute and evaluate',
								text: 'A new forward pass uses the changed parameters. Separately inspect validation evidence without fitting to it.'
							}
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'Backpropagation is an efficient application of the chain rule through connected computations. You do not need to manipulate derivatives to understand the responsibility chain: an early weight affects a hidden value; that hidden value affects the output; the output affects loss. Combining those local effects tells us how changing the early weight would change loss nearby.',
							'The optimizer and backpropagation are distinct. Backpropagation computes gradients. An optimizer such as gradient descent chooses the actual update using them. It does not assign blame in a human sense, and it does not reveal the business cause of an outcome. A sensitivity inside the model is about its computation, not necessarily about the world.',
							'Some paths transmit little or no sensitivity for a particular example. A ReLU unit below zero has a locally flat output, so that example may not update its incoming weights through that path. Initialization, data scaling, activation design, and optimization settings therefore matter. The network is not guaranteed to improve on every individual case after a batch update; the update targets an aggregate objective.'
						]
					}
				]
			},
			{
				id: 'train-and-inspect',
				title: 'Inspect an actual trained model',
				lead: 'Keep the picture, numerical table, and predictions tied to the same snapshot.',
				blocks: [
					{
						kind: 'lab',
						id: 'network',
						title: 'The trainable network studio',
						task: 'The live lab uses a separate synthetic invoice-investigation task with overdue days and amount mismatch as inputs. Its hidden units use tanh, a smooth activation that maps their weighted totals between −1 and 1, rather than the ReLU in the worked trace. Its output still uses a sigmoid. Inspect one case, run training updates, and compare actual parameters, activations, and predictions. Use the numerical table alongside the 3D view. The mechanics transfer, but the task labels and activation differ.',
						prediction:
							'Which output will change when an input moves? Which stored values should change only after a training update?',
						evidence: [
							'Record one input, hidden activation, and output before training.',
							'Run updates and identify a parameter that changed.',
							'Compare training and held-out behavior, not just the animation.'
						],
						limitation:
							'The labels identify synthetic investigation cases, not confirmed fraud or real future collections. Its score is not established as a calibrated business probability. Internal activity is not a full causal explanation, and a good toy result does not establish production performance.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Reset with the same seed to make a comparison easier. Change one training setting at a time and preserve the observed loss trace. If a larger learning rate makes training unstable, describe that observation without treating the largest jump as “more learning.” If the network is stopped halfway through, inspect the actual saved state rather than assuming completion.',
							'The 3D view helps locate paths and layers, while the table allows precise comparison. Connection brightness or thickness should encode a stated quantity such as weight magnitude, not an invented importance score. Negative and positive contributions must remain distinguishable. A larger activation does not by itself establish that a feature caused the real financial outcome.'
						]
					}
				]
			},
			{
				id: 'explain-and-transfer',
				title: 'Explain what the network has learned',
				lead: 'Move from a visual impression to a defensible account.',
				blocks: [
					{
						kind: 'reflection',
						prompt:
							'Two networks predict almost the same outputs but their hidden-unit colors look different. Must one visualization be wrong?',
						guidance: 'Consider whether useful representations have a unique arrangement.',
						modelAnswer:
							'No. Different parameter configurations or hidden-unit permutations can produce similar functions. I would compare actual predictions, losses, and stated visualization mappings rather than expect every hidden unit to have a unique human meaning.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'A clear explanation names the task, input availability, architecture, output, loss, optimization, and independent evaluation. For example: “This two-input network transforms today’s allowed collections features through nonlinear hidden units. Training adjusts its parameters to reduce a binary prediction loss. We evaluate ranking and calibration separately on later eligible invoices.” That is more useful than saying the model “thinks like a brain.”',
							'In M07, we will treat hidden values as representations: information arranged so later computations can use it. In M12, attention and feed-forward transformations will build richer representations of token sequences. The mechanisms grow, but the distinction between parameters, activations, training, and inference remains.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M06-C1',
				objective: 0,
				prompt:
					'A unit receives input 0.8 with weight 0.5, input 0.2 with weight −0.25, and bias 0.1. What is its pre-activation value?',
				options: ['0.45.', '0.55.', '0.30.'],
				answer: 0,
				rationales: [
					'0.40 − 0.05 + 0.10 = 0.45.',
					'This treats the negative contribution as positive.',
					'This does not include the stated signed contributions and offset correctly.'
				]
			},
			{
				id: 'M06-C2',
				objective: 0,
				prompt: 'What does ReLU return for −0.04?',
				options: ['−0.04.', '0.04.', '0.'],
				answer: 2,
				rationales: [
					'That would pass the negative value unchanged.',
					'That is an absolute-value transformation, not ReLU.',
					'ReLU clips negative inputs to zero.'
				]
			},
			{
				id: 'M06-C3',
				objective: 1,
				prompt: 'Which statement separates backpropagation from optimization accurately?',
				options: [
					'Backpropagation computes parameter sensitivities; the optimizer uses them to update parameters.',
					'Backpropagation checks whether the finance policy is correct.',
					'The optimizer generates the target labels from the current predictions.'
				],
				answer: 0,
				rationales: [
					'These are related but distinct computational responsibilities.',
					'It operates on the defined computation and objective, not business-policy truth.',
					'Targets must come from the declared learning task; inventing them this way is not the supervised procedure described.'
				]
			},
			{
				id: 'M06-C4',
				objective: 2,
				prompt: 'You select another invoice without training. Which quantities can change?',
				options: [
					'Activations and output, while fitted parameters remain fixed.',
					'The number of hidden layers automatically increases.',
					'All weights must update to store the invoice.'
				],
				answer: 0,
				rationales: [
					'The same computation receives different inputs.',
					'Architecture does not change merely because an input changes.',
					'Ordinary inference does not fit weights to every request.'
				]
			},
			{
				id: 'M06-C5',
				objective: 0,
				prompt: 'Why add nonlinear activations between layers?',
				options: [
					'They guarantee every prediction is correct.',
					'They allow compositions beyond a single affine transformation.',
					'They remove the need for validation.'
				],
				answer: 1,
				rationales: [
					'Expressive ability is not a correctness guarantee.',
					'Pure affine compositions collapse into another affine mapping; nonlinearity expands possible functions.',
					'Generalization still needs independent evidence.'
				]
			},
			{
				id: 'M06-C6',
				objective: 2,
				prompt:
					'A bright hidden unit appears when an invoice is predicted late. What can you conclude?',
				options: [
					'It proves the operational cause of late payment.',
					'It shows an internal value under the visualization’s stated mapping.',
					'It is necessarily a human-readable collections rule.'
				],
				answer: 1,
				rationales: [
					'Internal sensitivity or activation is not causal business evidence.',
					'Interpret the displayed quantity precisely and connect it to the actual computation.',
					'Learned representations need not align with named accounting rules.'
				]
			}
		],
		assignment: {
			title: 'Narrate the model without the diagram',
			scenario:
				'Use the hand-worked two-hidden-unit trace, then compare it with a trained snapshot from the studio.',
			tasks: [
				'Explain weighted contributions, bias, activation, and output for the worked input.',
				'Identify which quantities changed during your training run and which changed only when selecting a case.',
				'State how you would evaluate the model for today’s collections review task.'
			],
			deliverable: 'A forward-pass table and a 200-word training/evaluation explanation.',
			rubric: [
				{
					criterion: 'Mechanism',
					evidence: 'Numerical stages reconcile and activations are distinguished from parameters.'
				},
				{
					criterion: 'Learning',
					evidence: 'Separates gradient computation from parameter update.'
				},
				{ criterion: 'Task', evidence: 'States cutoff, horizon, and allowed features.' },
				{
					criterion: 'Evidence',
					evidence: 'Includes held-out ranking/calibration and avoids causal overclaims.'
				}
			],
			workedSolution: [
				'Hidden A is 0.45 after ReLU; hidden B is zero. The output pre-sigmoid value is 0.215, producing approximately 0.554. These are illustrative chosen parameters, not a reported training result.',
				'During inference the inputs, activations, and output may change while weights remain fixed. During training, the optimizer changes parameters using gradients from the defined loss; a new forward pass then reveals the effect. Record the studio’s actual values separately.',
				'Define remaining unpaid 30 days after today’s cutoff, construct only available features, and use later mature outcomes for evaluation. Compare a simple baseline and inspect review capacity, discrimination, calibration, and shift.'
			]
		},
		interview: {
			question: 'What actually happens when a neural network learns?',
			strongAnswer: [
				'It computes predictions through weighted connections and nonlinear transformations, measures a loss against the task’s targets, computes gradients through the network, and updates parameters using an optimizer. Hidden activations are input-specific; parameters are the reusable values being fitted.',
				'I would inspect whether the optimization is stable and whether the resulting function generalizes. A vivid network picture or low training loss does not establish that the model is calibrated, useful under review capacity, or causal.'
			],
			followUps: [
				{
					question: 'Why are hidden layers useful?',
					answer:
						'They can learn intermediate nonlinear representations that later layers combine. Their usefulness depends on data and training; depth alone is not evidence of better performance.'
				},
				{
					question: 'Is a neural network’s weight the same as its attention weight?',
					answer:
						'A learned connection parameter is stored and changed by training. Attention weights are typically temporary mixing values computed for a particular sequence from learned projections; M12 traces that distinction.'
				}
			]
		},
		sources: [
			{
				label: 'Google: neural networks',
				url: 'https://developers.google.com/machine-learning/crash-course/neural-networks',
				note: 'Units, activations, and connected computation.'
			},
			{
				label:
					'Rumelhart, Hinton, and Williams: learning representations by back-propagating errors',
				url: 'https://doi.org/10.1038/323533a0',
				note: 'Historically influential 1986 account; not a claim that no earlier related work existed.'
			}
		]
	},
	{
		id: 'M07',
		day: 2,
		title: 'Deep learning and representations',
		subtitle: 'Understand what changes when useful features are learned.',
		minutes: 70,
		prerequisites: ['M06'],
		objectives: [
			'Explain learned representations, embeddings, and projection limits.',
			'Distinguish supervised, self-supervised, and unsupervised tasks.',
			'Choose model families and transfer strategies using data and evaluation needs.'
		],
		why: 'A finance conversation about “deep learning” should explain why a representation helps the task, not merely name a large architecture.',
		sections: [
			{
				id: 'representation',
				title: 'The same record can be represented in different ways',
				lead: 'Learning depends on what the next computation can see.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Consider a supplier invoice. It can be represented as raw image pixels, a sequence of extracted characters, a table of amounts and dates, or a numerical vector summarizing aspects of its content. Each representation preserves some information and makes particular computations easier. A total amount is excellent for summing spend but discards the wording needed to interpret a service description.',
							'A representation is the form in which information is supplied to a computation. Feature engineering means designing useful inputs explicitly, such as days past due or invoice amount divided by a customer’s typical amount. Representation learning lets a model discover intermediate forms from data. In M06, hidden activations were a learned representation used by later units.',
							'Deep learning uses neural networks with multiple successive learned transformations. Depth can support composing simpler patterns into more useful ones. In an image task, early computations may respond to local edges or textures, while later ones combine broader structures. That is an intuition about learned processing, not a guarantee that each layer has a neat human label or that more layers always help.'
						]
					},
					{
						kind: 'worked',
						title: 'A useful engineered feature',
						problem:
							'Customer A usually receives USD 100 invoices; customer B usually receives USD 10,000 invoices. Each receives a USD 1,000 invoice. Compare raw amount with amount relative to the customer’s earlier typical amount.',
						steps: [
							'The raw amount is identical: USD 1,000. A model using only that number cannot distinguish the two situations.',
							'Relative to the earlier typical amount, A’s invoice is ten times typical while B’s is one tenth of typical.',
							'That ratio may help an anomaly or review task, but it does not prove an error. A may have placed a valid larger order.',
							'Calculate the typical amount using only earlier eligible records and handle missing or zero history explicitly. Otherwise the engineered feature can leak or become undefined.'
						],
						conclusion:
							'A representation can make a useful contrast visible while still requiring evidence and evaluation.'
					}
				]
			},
			{
				id: 'tasks',
				title: 'What supplies the learning signal?',
				lead: 'Label availability and data format are different dimensions.',
				blocks: [
					{
						kind: 'compare',
						title: 'Three learning settings',
						items: [
							{
								label: 'Supervised learning',
								text: 'Examples have task targets, such as a reviewed expense category or whether an invoice was paid late. Training relates inputs to those targets.'
							},
							{
								label: 'Self-supervised learning',
								text: 'Targets are constructed from the data itself, such as predicting a held-out next token. Large amounts of raw material can provide many training examples without a person labeling each target.'
							},
							{
								label: 'Unsupervised learning',
								text: 'The task looks for structure without the same supplied prediction labels, such as grouping similar transaction descriptions. The resulting groups still need interpretation and evaluation for use.'
							}
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'Structured data is organized in a declared format, often rows and typed columns. Unstructured data includes material such as free text or images whose useful organization is not already expressed in that table. An unlabeled table remains structured. A labeled invoice image remains image data. Do not use “unsupervised” as a synonym for “unstructured.”',
							'Clustering groups cases under a chosen representation and similarity rule. It may reveal supplier-description patterns or customer segments, but the clusters are not automatically account codes, credit policies, or causal categories. A clustering method can always produce groups under its settings; usefulness depends on stability, interpretability, and the decision it supports.',
							'Anomaly detection identifies cases unusual relative to a reference pattern. Rare is not equivalent to wrong. A new supplier, a seasonal bulk order, or a valid foreign-currency invoice may be unusual. Review labels and downstream outcomes help assess whether the anomaly signal is useful. A detector that floods the queue with harmless novelty may have little business value.'
						]
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'A chart of accounts is a business design',
						paragraphs: [
							'Account categories reflect reporting, control, and analytical requirements. They are not necessarily the same as clusters of similar language. “Cloud hosting” and “warehouse rent” may both describe recurring services yet belong in different reporting categories. A model needs the actual category definitions and reviewed examples.'
						]
					}
				]
			},
			{
				id: 'architectures',
				title: 'Architectures express useful assumptions',
				lead: 'Match the structure to the data and task.',
				blocks: [
					{
						kind: 'table',
						caption: 'Model families are design choices, not a universal performance ranking.',
						headers: ['Family', 'Useful structural idea', 'Finance example', 'Question to test'],
						rows: [
							[
								'Linear model',
								'A direct combination of inputs',
								'Transparent cost baseline',
								'Are interactions or curves important?'
							],
							[
								'Decision tree / tree ensemble',
								'Conditional partitions of feature space',
								'Tabular late-payment prediction',
								'Does it generalize across time and customer groups?'
							],
							[
								'Convolutional network',
								'Reuse local pattern detectors across an image',
								'Document or receipt-image processing',
								'Do rotations, layouts, and scan quality change behavior?'
							],
							[
								'Recurrent network',
								'Carry a state through a sequence',
								'Historical sequence modeling',
								'Can it retain the dependencies the task needs?'
							],
							[
								'Transformer',
								'Mix information across positions using learned attention',
								'Language and multimodal representations',
								'What context, compute, and evaluation does the task require?'
							]
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'A decision tree asks a sequence of feature questions, such as whether an amount exceeds a threshold and whether terms are unusually long. A tree ensemble combines multiple trees. These can be strong candidates for tabular business data. Their existence is a reminder that a neural network is not the default winner merely because its diagram looks sophisticated.',
							'Convolution reuses local transformations across positions, which can help with visual patterns appearing in different locations. Recurrence processes a sequence while carrying a state from earlier steps. Attention lets positions combine information from other permitted positions. These are simplified descriptions of families whose practical variants differ. We will inspect transformer mechanics rather than treating its name as an explanation.',
							'A fair comparison uses the same target, allowed information, training sample, and evaluation cases. If one model receives better features or more data, an improvement cannot be attributed solely to architecture. Consider compute, latency, maintenance, interpretability, and how failures can be investigated alongside predictive metrics.'
						]
					}
				]
			},
			{
				id: 'embedding',
				title: 'An embedding is a learned list of numbers',
				lead: 'Similarity comes from the space and task, not from the picture alone.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'A vector is an ordered list of numbers. An embedding represents an item—such as a token, document, or image—as a vector used in computation. Training shapes the space so relationships useful to its objective can be represented. An embedding is not a dictionary definition, an original document, or proof of a fact. You still need source records for evidence.',
							'Similarity requires a rule. A common cosine similarity compares direction rather than raw length. Other tasks use distance or learned scoring. The same two items can be near under one representation and far under another. A model trained for broad language similarity may group related topics without distinguishing the precise policy exception your finance query requires.',
							'A two- or three-dimensional projection helps inspect a high-dimensional space, but it discards information. Apparent neighbors in a picture may not be nearest under the actual full-space metric. If a lab claims actual retrieval rankings, those must come from the declared vectors and metric rather than the screen coordinates. An illustrative hand-arranged plot can teach an idea, provided it is labeled as such.',
							'Static token embeddings and contextual representations also differ. A token begins with a learned representation, then later layers can alter it using surrounding tokens. “Bank” in a river report and a cash-management note can acquire different contextual representations. M11 and M12 will follow that process more closely.'
						]
					},
					{
						kind: 'lab',
						id: 'representations',
						title: 'Inspect learned representations and compare models',
						task: 'Use the synthetic model comparison to inspect raw-feature and engineered-feature baselines, a small tree, and a neural network on the same split. Inspect actual hidden activations, and compare source-trained versus randomly initialized networks using the same limited target-domain examples.',
						prediction:
							'Will added complexity or a source-trained starting point always improve target-domain held-out performance?',
						evidence: [
							'Record which information and target examples each candidate received.',
							'Compare held-out results and inspect the learned hidden representation.',
							'If a projection is displayed, separate its visual geometry from the original activation values.',
							'Compare transfer and scratch training under the same target-data budget.'
						],
						limitation:
							'These are small synthetic domains, not pretrained document models or a benchmark of modern commercial AI. Transfer can help or hurt; a projection may distort relationships and cannot establish accounting categories.'
					}
				]
			},
			{
				id: 'transfer',
				title: 'Reuse a representation, then test the new task',
				lead: 'Transfer learning can reduce the amount of task-specific fitting needed.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Transfer learning reuses information learned in one setting for another. A document model may begin with representations learned from broad image or text data, then adapt to reviewed invoice examples. One approach freezes the earlier representation and trains a new output layer. Another updates some or all of the earlier parameters too. Fine-tuning is a form of further parameter training, not simply attaching a document to a prompt.',
							'Why might reuse help? Earlier learning may already represent patterns such as printed characters, layout features, or common language relationships. The new task can build on them instead of learning everything from a small local sample. Why might it fail? The old representation may ignore distinctions important to the new task or reflect a domain that differs substantially.',
							'Compare transfer and training from scratch with the same labeled sample and held-out cases, and state the earlier training exposure. Measure performance on important conditions such as unfamiliar suppliers or poor scans. An improvement on clean documents is not evidence that rotated handwritten receipts are solved. More adaptation can also damage previously useful behavior, so preserve relevant general cases when evaluating the change.'
						]
					},
					{
						kind: 'worked',
						title: 'Interpret a controlled transfer comparison',
						problem:
							'An authored experiment summary uses 200 labeled training receipts and the same 100 held-out receipts for two models. A from-scratch model gets 72 reviewed categories correct; a model using a reused representation gets 84. On a separate 20-handwritten-receipt challenge, they get 7 and 8 correct.',
						steps: [
							'On the common ordinary holdout, the reused representation performs better in this sample: 84% versus 72%.',
							'The handwriting challenge shows weak results for both: 35% and 40%. It does not support a claim that transfer solved that condition.',
							'Check that neither model saw held-out labels during selection and that the representation’s earlier data did not contain those exact evaluation records.',
							'Repeat or expand relevant evaluation before attributing a stable improvement to the strategy. The summary illustrates how to reason; it is not a measured result from the browser lab.'
						],
						conclusion:
							'Transfer can be useful while leaving a critical deployment gap. Report both findings.'
					}
				]
			},
			{
				id: 'family-choice',
				title: 'Choose a model family with a reason',
				lead: 'A good recommendation includes the evidence that could change it.',
				blocks: [
					{
						kind: 'reflection',
						prompt:
							'Willow has 2,000 labeled invoices with clean tabular fields and wants an explainable late-payment baseline. Should it begin with a deep image model?',
						guidance:
							'Name what information is actually needed and what comparison would justify added complexity.',
						modelAnswer:
							'I would begin with suitable tabular baselines such as a linear model and tree-based method, using the same issue-date features and temporal evaluation. An image model may add value if document appearance carries necessary information unavailable in the table, but that benefit must be tested against data, cost, and maintenance requirements.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Your representation choice is part of the data contract. State what is being represented, where the representation came from, when it is fitted, and how it is evaluated. That record becomes essential when embeddings support retrieval on day four: “similar” and “supports this answer” will remain different claims.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M07-C1',
				objective: 1,
				prompt:
					'A table has customer amounts and dates but no target labels. Which description is accurate?',
				options: [
					'It is structured data that may support an unsupervised task.',
					'It becomes unstructured because labels are absent.',
					'It cannot be used by any learning method.'
				],
				answer: 0,
				rationales: [
					'Organization and label availability are separate properties.',
					'A table retains its schema regardless of targets.',
					'Clustering or other suitable tasks may use it, with appropriate evaluation.'
				]
			},
			{
				id: 'M07-C2',
				objective: 0,
				prompt:
					'Two descriptions are close in a two-dimensional projection. What can you conclude safely?',
				options: [
					'They must have the same account code.',
					'The plot suggests a relationship that should be checked using the declared full representation and task.',
					'They are authoritative evidence for each other’s claims.'
				],
				answer: 1,
				rationales: [
					'Semantic proximity does not define accounting categories.',
					'Projection can distort distances; inspect actual similarity and task relevance.',
					'Similarity is not source support.'
				]
			},
			{
				id: 'M07-C3',
				objective: 1,
				prompt:
					'A model predicts a next token taken from its training text. Why is this self-supervised?',
				options: [
					'A human must label every next token separately.',
					'The data sequence supplies the target without a separate manual label for each prediction.',
					'No objective is used during training.'
				],
				answer: 1,
				rationales: [
					'The target can be constructed directly from the sequence.',
					'The learning signal is derived from the material itself.',
					'There is still a defined objective and parameter update process.'
				]
			},
			{
				id: 'M07-C4',
				objective: 2,
				prompt:
					'A neural model beats a tree after receiving ten times more labeled data and extra features. What can the comparison establish?',
				options: [
					'Neural architecture alone caused the improvement.',
					'The complete tested setup did better; architecture’s isolated effect is not established.',
					'The result must be invalid regardless of purpose.'
				],
				answer: 1,
				rationales: [
					'Data and features changed too.',
					'The comparison is useful if its scope is stated, but not a controlled architecture attribution.',
					'It can compare available systems, provided the differing conditions are transparent.'
				]
			},
			{
				id: 'M07-C5',
				objective: 2,
				prompt:
					'Transfer improves ordinary receipt accuracy but both models fail on handwriting. What is the best next action?',
				options: [
					'Claim all receipt formats are solved.',
					'Report the improvement and the remaining handwriting gap separately.',
					'Hide handwriting because it is a small group.'
				],
				answer: 1,
				rationales: [
					'The challenge evidence contradicts that scope.',
					'Useful transfer and a critical limitation can both be true.',
					'A small operationally important group still matters.'
				]
			},
			{
				id: 'M07-C6',
				objective: 0,
				prompt:
					'A customer-relative amount feature uses the customer’s average over the entire year to predict invoices issued in January. What is the concern?',
				options: [
					'Engineered features cannot leak.',
					'The reference average includes future information.',
					'Ratios are always invalid features.'
				],
				answer: 1,
				rationales: [
					'Feature engineering is part of the evaluated pipeline and can leak.',
					'Reconstruct the reference using information available before each prediction.',
					'A ratio may be useful with suitable definitions, units, and time isolation.'
				]
			}
		],
		assignment: {
			title: 'Choose a representation for document review',
			scenario:
				'Willow has 300 reviewed invoice images, 5,000 tabular invoices, and a new handwritten supplier format. It needs account-category suggestions and an exception queue.',
			tasks: [
				'Separate the tasks and propose baselines for each data form.',
				'Explain where engineered features or a reused representation could help.',
				'Design a comparison that exposes the handwritten-format gap and avoids leakage.'
			],
			deliverable:
				'A model-family recommendation with a comparison table and limitation statement.',
			rubric: [
				{ criterion: 'Representation', evidence: 'Connects preserved information with each task.' },
				{ criterion: 'Comparison', evidence: 'Uses common targets and evaluation cases.' },
				{ criterion: 'Transfer', evidence: 'Explains both possible benefit and domain mismatch.' },
				{
					criterion: 'Scope',
					evidence:
						'Keeps new-format evidence visible and avoids equating clusters with categories.'
				}
			],
			workedSolution: [
				'Use reviewed category definitions and separate document extraction from category suggestion. Try tabular/text baselines where reliable fields exist; consider a reused document representation for image information that the table omits.',
				'Compare candidates on the same held-out records, with preparation and feature history fitted only from allowed training data. Report ordinary and handwritten formats separately, and preserve a baseline for cost and interpretability.',
				'Transfer may reuse useful visual/text patterns, but the small handwriting group needs targeted data and evaluation. Route uncertain cases to review. Similarity or clusters can suggest investigation but do not replace the chart-of-accounts definition.'
			]
		},
		interview: {
			question: 'When would you use deep learning instead of a simpler model in finance?',
			strongAnswer: [
				'I would ask what information the task needs and whether learning representations from images, language, or complex sequences provides a measurable advantage. For modest tabular datasets, strong simpler baselines can be competitive and easier to maintain. I would compare complete procedures using consistent information and deployment-relevant held-out cases.',
				'Transfer learning can help when labeled local data are scarce, but I would examine prior training exposure and domain mismatch. An overall improvement must not hide failure on a new supplier format or other important subgroup.'
			],
			followUps: [
				{
					question: 'Are embeddings a database of facts?',
					answer:
						'They are numerical representations used for comparison or computation. They do not replace source documents or establish the truth of a retrieved claim.'
				},
				{
					question: 'What makes a fair transfer-learning comparison?',
					answer:
						'Use the same task-specific labels and evaluation cases, disclose the reused model’s prior exposure, keep final cases out of selection, and inspect both ordinary and shifted conditions.'
				}
			]
		},
		sources: [
			{
				label: 'Google: embeddings',
				url: 'https://developers.google.com/machine-learning/crash-course/embeddings',
				note: 'Representations and embedding-space intuition.'
			},
			{
				label: 'TensorFlow: transfer learning',
				url: 'https://www.tensorflow.org/tutorials/images/transfer_learning',
				note: 'Feature extraction and fine-tuning are different adaptation procedures.'
			},
			{
				label: 'scikit-learn: decision trees',
				url: 'https://scikit-learn.org/stable/modules/tree.html',
				note: 'A contrasting model family for structured features.'
			}
		]
	},
	{
		id: 'M08',
		day: 2,
		title: 'Forecasting over time',
		subtitle: 'Rehearse the future using only what the past actually knew.',
		minutes: 70,
		prerequisites: ['M04'],
		objectives: [
			'Distinguish forecast, budget, and scenario and define origin and horizon.',
			'Compare baselines using rolling-origin errors without future leakage.',
			'Interpret bias, intervals, and regime changes in a cash-planning decision.'
		],
		why: 'Forecasting is an evaluation problem as much as a modeling problem. A convincing backtest must recreate the information available when the forecast would have been made.',
		sections: [
			{
				id: 'question-and-horizon',
				title: 'What are we forecasting, and when?',
				lead: 'A useful forecast begins with a decision and a deadline.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Willow’s treasury team wants to know whether it should arrange additional liquidity for the next three months. Start by naming the quantity: monthly customer cash collections in USD thousands, measured by receipt date. That differs from revenue recognized in the income statement. Customers can pay before or after recognition, and timing differences can dominate a cash decision.',
							'A forecast estimates a future outcome using available information and assumptions. A budget is an approved plan or target. A scenario asks what might happen under stated conditions, such as a major customer paying 30 days later. These can inform one another without being interchangeable. A forecast should not be forced to equal a target simply because the target is desirable.',
							'The forecast origin is the time at which the forecast is issued. The horizon is how far ahead the target lies. A forecast made at the end of June for July is one month ahead; for September it is three months ahead. A method excellent one month ahead may be unsuitable three months ahead. Measure performance for the horizon that drives the decision.'
						]
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'Revenue is not cash collections',
						paragraphs: [
							'A credit sale can recognize revenue and create a receivable before cash arrives. A later receipt reduces the receivable without necessarily creating new revenue then. A cash forecast should use the relevant cash timing and reconcile with opening cash, other receipts, payments, and financing when assessing liquidity.',
							'The course’s collection series is synthetic. It is a mechanism-learning dataset, not a forecast of Willow’s real future or advice about financing a business.'
						]
					}
				]
			},
			{
				id: 'patterns-and-baselines',
				title: 'Let simple methods compete',
				lead: 'Trend and seasonality are different patterns.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Five useful starting methods. Each must be fitted or computed using only data available at the origin.',
						headers: ['Method', 'What it does', 'When to investigate it', 'Common limitation'],
						rows: [
							[
								'Last value',
								'Uses the latest observed month',
								'A stable level or rapidly changing recent level',
								'Carries a one-off shock forward'
							],
							[
								'Seasonal naive',
								'Uses the corresponding month in the previous year',
								'Annual seasonal pattern',
								'Misses a changed level or disrupted season'
							],
							[
								'Moving average',
								'Averages a chosen recent window',
								'Noisy series with a relatively stable local level',
								'Lags a rising or falling trend'
							],
							[
								'Trend',
								'Extends a fitted time relationship',
								'Persistent directional movement',
								'Extrapolates a relationship that may stop'
							],
							[
								'Seasonal regression',
								'Fits time and seasonal indicators together',
								'A trend plus recurring month effects',
								'Needs enough relevant history and may overfit or miss change'
							]
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'Trend is a longer-direction movement in the level. Seasonality is a recurring calendar-related pattern, such as a busy quarter end. A series can have both, one, or neither. Apparent patterns in a small sample can also be noise. Plot values over time and connect proposed patterns with the business process before committing to a complicated model.',
							'A baseline is not a token exercise. A seasonal-naive forecast can be difficult to beat when seasonality is stable. A moving average may smooth noise but systematically underpredict growth. Compare methods on the same forecast targets rather than choosing one because its fitted curve looks attractive.',
							'An explanatory forecast may use drivers such as invoice schedules, customer payment behavior, or planned promotions. The key is whether those driver values were known at the origin. Using actual future sales to predict future collections in a backtest creates an easier task than forecasting with only planned sales. If a driver is itself forecast, its uncertainty also affects the downstream forecast.'
						]
					},
					{
						kind: 'worked',
						title: 'Three forecasts from the same origin',
						problem:
							'At July month-end, collections for May, June, and July were 120, 130, and 150 in USD thousands. Last August’s collections were 100. Forecast August using three simple methods.',
						steps: [
							'Last value predicts 150.',
							'The three-month moving average predicts (120 + 130 + 150) / 3 = 133.33.',
							'Seasonal naive predicts 100, using the previous August.',
							'These differ because they encode different assumptions. July may reflect growth, an unusual receipt, or a seasonal peak. The observed values alone do not select the best future method.'
						],
						conclusion:
							'Backtesting comparable origins helps assess which assumption has been useful for the relevant horizon.'
					}
				]
			},
			{
				id: 'rolling-origins',
				title: 'Replay the forecast as it would have happened',
				lead: 'At every origin, hide everything that was not yet available.',
				blocks: [
					{
						kind: 'steps',
						title: 'A rolling-origin evaluation',
						steps: [
							{
								title: 'Choose an initial history',
								text: 'Use enough earlier observations to fit every candidate method reasonably.'
							},
							{
								title: 'Freeze an origin',
								text: 'At June month-end, fit preparation and models using only data available through June.'
							},
							{
								title: 'Forecast each required horizon',
								text: 'Save July, August, and September predictions separately as horizons one, two, and three.'
							},
							{
								title: 'Move the origin',
								text: 'At July month-end, refit using the newly available July value and forecast August through October.'
							},
							{
								title: 'Score comparable targets',
								text: 'Compare methods within each horizon across origins. Preserve signed errors and relevant seasonal or regime groups.'
							}
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'This is time-series cross-validation with a rolling origin. An expanding window retains all earlier observations; a rolling window keeps only a recent history. The choice trades historical coverage against responsiveness to change. It is a model-selection setting to assess, not a universal rule.',
							'Do not randomize months and call the result a future forecast test. Training on December to predict an earlier August gives the model a view that the business did not have. Even a chronological split can leak if a scaler, seasonal average, outlier treatment, or driver was computed using the entire series before splitting.',
							'A single train/test boundary can overemphasize one unusual period. Multiple origins reveal whether performance varies across seasons and horizons. They do not produce fully independent errors in every case: forecast windows can overlap. Interpret uncertainty accordingly and reserve a later final period after selecting the method.'
						]
					}
				]
			},
			{
				id: 'metrics',
				title: 'Measure direction as well as size',
				lead: 'A small average error can hide a persistent cash shortfall.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Illustrative one-month-ahead forecasts in USD thousands. Signed error is forecast minus actual.',
						headers: ['Target month', 'Actual', 'Forecast', 'Signed error', 'Absolute error'],
						rows: [
							['A', '100', '110', '+10', '10'],
							['B', '120', '110', '−10', '10'],
							['C', '110', '120', '+10', '10'],
							['D', '140', '120', '−20', '20']
						]
					},
					{
						kind: 'worked',
						title: 'Interpret the forecast errors',
						problem: 'Calculate MAE, mean signed error, and RMSE for the displayed four forecasts.',
						steps: [
							'MAE is (10 + 10 + 10 + 20) / 4 = 12.5, meaning USD 12,500 in these units.',
							'Mean signed error is (10 − 10 + 10 − 20) / 4 = −2.5, indicating average underforecasting of USD 2,500 for this sample.',
							'RMSE is the square root of (100 + 100 + 100 + 400) / 4, approximately 13.23. It gives more influence to the larger miss.',
							'The average bias is modest while individual errors are larger. Inspect the largest misses and their timing before using the forecast for a liquidity buffer.'
						],
						conclusion:
							'Error magnitude, direction, and business timing answer different questions. Report units and the sign convention.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Percentage errors divide by actual values. When actual collections are near zero, a small dollar error can produce an enormous percentage; at zero, some percentage metrics are undefined. Returns or negative net flows create further interpretation problems. Dollar errors and suitable scaled measures may be more useful, depending on the comparison.',
							'Aggregate errors can conceal an important segment. A model may overforecast one customer and underforecast another by the same amount. The total looks right while the collection actions are wrong. Reconcile overall totals, but inspect groups and large exposures where the decision depends on them.'
						]
					}
				]
			},
			{
				id: 'uncertainty-and-change',
				title: 'An interval is an evaluated statement, not a guarantee',
				lead: 'Past errors help describe uncertainty only under relevant conditions.',
				blocks: [
					{
						kind: 'worked',
						title: 'An empirical band meets a changed period',
						problem:
							'For a teaching example, ten earlier absolute forecast errors are 0, 2, 3, 5, 5, 8, 8, 12, 12, and 18 in USD thousands. A nearest-rank 90th-percentile rule selects 12. The next forecast is 140.',
						steps: [
							'Construct the illustrative symmetric interval from 128 to 152 by adding and subtracting 12. Nine of the ten calibration errors fit inside that width.',
							'Do not claim that this proves a 90% chance for the next individual outcome. Ten observations provide limited evidence, and the rule assumes earlier errors are relevant.',
							'Later absolute errors are 5, 10, 20, and 16. Only two of four are inside the width, giving observed coverage of 50% on this later sample.',
							'Investigate whether conditions changed, the horizon differs, or the earlier sample was too small. Recalibrate using appropriate development evidence and assess new later outcomes.'
						],
						conclusion:
							'State how the band was built, what coverage was observed, and why that evidence may not carry forward.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'A regime change is a substantial shift in the process, such as revised customer terms, a business acquisition, or a disruption in collections. A model can continue producing smooth numbers after its assumptions stop fitting. Monitor errors, bias, coverage, and business events rather than waiting for a model to announce that it is confused.',
							'A scenario complements an interval. “What if the largest customer pays a month late?” is a specified stress case, not automatically a probability statement. A useful treasury recommendation distinguishes the central forecast, measured uncertainty, and explicit stresses, then connects them to cash thresholds and available responses.'
						]
					}
				]
			},
			{
				id: 'forecast-lab',
				title: 'Run the full comparison',
				lead: 'Use the 72-month synthetic series to test the procedure, not just admire a curve.',
				blocks: [
					{
						kind: 'lab',
						id: 'forecast',
						title: 'The rolling forecast workbench',
						task: 'Compare the available baseline methods on the same rolling origins and horizons. Inspect case-level errors and the effect of a changed regime. Compare an error band fitted on earlier residuals with later observed coverage.',
						prediction:
							'Which method do you expect to handle stable seasonality best, and which assumption is most vulnerable to a level change?',
						evidence: [
							'Record method, history window, origin range, and horizon.',
							'Compare MAE and signed bias at the same horizon.',
							'Inspect later coverage and at least one consequential miss.'
						],
						limitation:
							'The series and changes are synthetic. Small-sample coverage and a winning backtest do not guarantee real cash outcomes; driver availability and current business context still matter.'
					},
					{
						kind: 'reflection',
						prompt:
							'A vendor shows an almost perfect cash forecast after using actual next-month revenue as an input. What do you ask?',
						guidance: 'Reconstruct the information available at the historical forecast origin.',
						modelAnswer:
							'Was that revenue actually known at the origin, or was it inserted after the month ended? If it was unknown, the backtest answers a conditional prediction question rather than the operational forecast. I would rerun using the planned or forecast driver available then and include its uncertainty.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Keep your comparison with the data contract and threshold memo. The day-two analytical pack should explain both what the forecast suggests and why the decision maker should believe its evaluation. That evidence matters more than whether the model is called statistical, machine learning, or AI.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M08-C1',
				objective: 0,
				prompt: 'At June month-end you predict September collections. What is the horizon?',
				options: [
					'One month because the forecast is made once.',
					'Three months ahead.',
					'September is the origin.'
				],
				answer: 1,
				rationales: [
					'Frequency of issuing a forecast differs from how far ahead the target lies.',
					'July, August, September are one, two, and three months ahead.',
					'June month-end is the origin; September is the target period.'
				]
			},
			{
				id: 'M08-C2',
				objective: 1,
				prompt: 'Which backtest most closely represents monthly operational forecasting?',
				options: [
					'Randomly shuffle months before splitting.',
					'Fit at successive historical origins using only then-available information.',
					'Fit seasonal effects from all 72 months before evaluating early origins.'
				],
				answer: 1,
				rationales: [
					'It can expose future conditions to earlier forecasts.',
					'This recreates the information boundary at each decision.',
					'Earlier forecasts would use seasonal information estimated from their future.'
				]
			},
			{
				id: 'M08-C3',
				objective: 0,
				prompt:
					'The approved budget is 150; the best current estimate is 130; a delayed-customer stress gives 100. Which labels fit?',
				options: [
					'Budget 150, forecast 130, scenario 100.',
					'All three are competing actual results.',
					'The forecast must be changed to 150 because it is approved.'
				],
				answer: 0,
				rationales: [
					'Target, estimate, and conditional stress serve distinct purposes.',
					'They are not observed outcomes.',
					'Approval of a target does not make it the best current estimate.'
				]
			},
			{
				id: 'M08-C4',
				objective: 2,
				prompt:
					'Forecast-minus-actual errors are +10, −10, +10, and −20. What are MAE and mean signed error?',
				options: [
					'MAE 2.5; bias 12.5.',
					'MAE 12.5; bias −2.5.',
					'Both zero because errors can cancel.'
				],
				answer: 1,
				rationales: [
					'Magnitude and direction have been confused.',
					'Absolute errors average 12.5; signed errors average −2.5.',
					'They do not cancel here, and cancellation would not remove absolute error.'
				]
			},
			{
				id: 'M08-C5',
				objective: 2,
				prompt:
					'An interval covered nine of ten earlier errors but only two of four later outcomes. What follows?',
				options: [
					'It guarantees 90% future coverage because that was the design target.',
					'Observed later coverage is 50%; investigate sample size and changed conditions.',
					'Intervals are never useful.'
				],
				answer: 1,
				rationales: [
					'A target and small calibration sample do not guarantee later coverage.',
					'Report actual evidence and diagnose whether the assumptions remain relevant.',
					'Intervals can help when their construction and limits are understood.'
				]
			},
			{
				id: 'M08-C6',
				objective: 1,
				prompt:
					'A three-month forecast uses actual sales from those future months as drivers. What is the key question?',
				options: [
					'Whether those values were genuinely available at the origin.',
					'Whether the fitted line has enough colors.',
					'Whether the model was trained for enough iterations.'
				],
				answer: 0,
				rationales: [
					'Unknown future drivers create leakage relative to the operational forecasting task.',
					'Presentation does not repair information availability.',
					'More training cannot make future information available historically.'
				]
			}
		],
		assignment: {
			title: 'Write a liquidity forecast recommendation',
			scenario:
				'A seasonal baseline has lower one-month MAE than a trend model, but trend has lower three-month MAE. A recent terms change increases customer payment delay. Earlier interval coverage is 90% on ten cases; later coverage is 50% on four cases.',
			tasks: [
				'Select evidence relevant to a three-month liquidity decision.',
				'Explain how the terms change could affect the comparison and the interval.',
				'Specify a new evaluation and a stress scenario without inventing a guaranteed outcome.'
			],
			deliverable: 'A one-page forecast note with method, horizon, uncertainty, and action.',
			rubric: [
				{
					criterion: 'Decision alignment',
					evidence: 'Uses the required horizon rather than the most attractive score.'
				},
				{
					criterion: 'Temporal validity',
					evidence: 'Preserves origin-specific information and preparation.'
				},
				{ criterion: 'Uncertainty', evidence: 'States observed coverage and small-sample limits.' },
				{
					criterion: 'Business response',
					evidence: 'Separates estimate, stress, and response threshold.'
				}
			],
			workedSolution: [
				'Use the three-month comparison for the stated decision, preserving the seasonal baseline as a reference. Do not choose from one-month results alone.',
				'The terms change can alter collection timing and invalidate historical error behavior. Report 50% later coverage and investigate the new regime; ten earlier cases do not establish reliable 90% coverage.',
				'Evaluate forecasts issued after the change with then-available invoice schedules and driver assumptions. Add an explicit major-customer delay scenario and connect projected cash to a declared review threshold. Keep the revised method’s development cases separate from a later final assessment.'
			]
		},
		interview: {
			question: 'How would you evaluate a cash forecast?',
			strongAnswer: [
				'I would define the cash quantity, decision origin, horizon, and information available then. I would compare simple baselines and candidates across rolling historical origins, fitting all preparation within each origin. I would report horizon-specific dollar errors, bias, significant exposures, and interval coverage rather than only fitted accuracy.',
				'I would examine driver availability and changes in customer terms or business conditions. A forecast, budget, and stress scenario answer different questions; the recommendation should show how each informs liquidity action without promising an outcome.'
			],
			followUps: [
				{
					question: 'Why not randomly split the monthly series?',
					answer:
						'It can let future conditions influence a prediction supposedly made earlier and does not recreate the operational forecasting problem.'
				},
				{
					question: 'What if the best model changes by horizon?',
					answer:
						'That is plausible. I would select for the horizon relevant to the decision or use a documented horizon-specific approach, with selection and final evaluation kept separate.'
				}
			]
		},
		sources: [
			{
				label: 'Forecasting: Principles and Practice — time-series cross-validation',
				url: 'https://otexts.com/fpp3/tscv.html',
				note: 'Rolling origins and horizon-specific evaluation.'
			},
			{
				label: 'Forecasting: Principles and Practice — prediction intervals',
				url: 'https://otexts.com/fpp3/prediction-intervals.html',
				note: 'Uncertainty around forecasts; the empirical band here is an explicitly simplified teaching method.'
			}
		]
	},
	{
		id: 'M09',
		day: 2,
		title: 'Excel, Power Query, SQL, and Power BI',
		subtitle: 'One reconciled analysis, several ways to implement it.',
		minutes: 70,
		prerequisites: ['M02', 'M08'],
		objectives: [
			'Enter and explain formulas using cell references, ranges, and explicit error handling.',
			'Prevent join multiplication by declaring grain and aggregating appropriately.',
			'Explain how a reusable query and a filtered analytical measure preserve the same financial meaning.'
		],
		why: 'Tools change; the accounting and data logic should survive the change. This module teaches a complete small analysis, with a browser path if Microsoft products are unavailable.',
		sections: [
			{
				id: 'source-records',
				title: 'Preserve the records before calculating',
				lead: 'We need one receivables snapshot as of September 30.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Synthetic invoices, all USD. No credits or adjustments in this worked example.',
						headers: ['Invoice', 'Customer', 'Issue date', 'Due date', 'Amount'],
						rows: [
							['I-201', 'Cedar', '2026-09-04', '2026-09-15', '120'],
							['I-202', 'Cedar', '2026-09-06', '2026-09-20', '200'],
							['I-203', 'Juniper', '2026-09-08', '2026-10-08', '80']
						]
					},
					{
						kind: 'table',
						caption:
							'Payment events are separate records; the last payment is after the reporting cutoff.',
						headers: ['Payment key', 'Invoice', 'Received date', 'Amount'],
						rows: [
							['P-01', 'I-201', '2026-09-09', '50'],
							['P-02', 'I-201', '2026-09-18', '70'],
							['P-03', 'I-202', '2026-09-21', '60'],
							['P-04', 'I-202', '2026-10-02', '40']
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'The invoice table has one row per invoice. The payment table has one row per receipt event. The required output has one row per invoice at September 30. Before calculating, check unique invoice keys and payment keys, valid dates, numeric amounts, currency, and whether every payment refers to an existing invoice. A missing link is an exception to investigate, not a row to silently discard.',
							'Preserve raw data and make a separate prepared output. Filter payments to the cutoff: P-04 is excluded from the September snapshot even though it is now known. The invoice total is USD 400. Eligible payments total USD 180, leaving USD 220 outstanding. This identity is a control total; we must also explain the row-level differences.',
							'Outstanding and overdue differ. I-202 has USD 140 outstanding and is overdue at September 30. I-203 has USD 80 outstanding but is not due until October 8. A measure labeled “overdue receivables” must not include both simply because neither is fully paid. These distinctions should be explicit before an AI assistant writes a formula or query.'
						]
					}
				]
			},
			{
				id: 'spreadsheet',
				title: 'Build the answer with formulas',
				lead: 'A formula is executable logic that should remain inspectable.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Put these headers in row 1 of the exercise sheet. Amounts and paid values are numbers, not strings containing currency symbols.',
						headers: [
							'A: Invoice',
							'B: Customer',
							'C: Amount',
							'D: Paid by cutoff',
							'E: Outstanding'
						],
						rows: [
							['I-201', 'Cedar', '120', '120', '=C2-D2'],
							['I-202', 'Cedar', '200', '60', '=C3-D3'],
							['I-203', 'Juniper', '80', '0', '=C4-D4']
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'A cell address combines a column letter and row number. C2 refers to the first invoice amount. A formula begins with an equals sign. Enter =C2-D2 in E2 to subtract paid amount from invoice amount; its result should be zero. Enter the corresponding formulas in E3 and E4 to obtain 140 and 80. A range such as E2:E4 includes all three cells.',
							'Use =SUM(C2:C4), =SUM(D2:D4), and =SUM(E2:E4) to verify 400, 180, and 220. Avoid typing 220 as the result: a hardcoded answer will not update when source values change. The formula expresses the relationship and makes later review possible.',
							'A relative reference changes when copied in a spreadsheet. Copying =C2-D2 down one row normally becomes =C3-D3. An absolute reference such as $H$2 stays anchored when copied. If H2 stores the review threshold, =IF(E2>$H$2,"Review","Routine") compares every row with the same threshold. The course browser exposes columns A–F, so use an available cell instead: put 100 in F10 and enter =IF(E3>$F$10,"Review","Routine") in F11. The initial I-202 balance of 140 returns Review; a balance of exactly 100 returns Routine. Greater than excludes equality. Where the browser does not offer fill-down, enter each formula explicitly; the meaning of the references is the same.',
							'A function has named behavior and arguments. SUM adds a range. IF chooses between results based on a condition. SUMIF selects rows matching one criterion and adds a corresponding range. With our sheet, =SUMIF(B2:B4,"Cedar",E2:E4) returns 140. The criteria range and summed range must align row by row. This is a conditional total, not a lookup returning one invoice.'
						]
					},
					{
						kind: 'callout',
						tone: 'mechanism',
						title: 'An error is information',
						paragraphs: [
							'A blank value, a text amount, and a true numeric zero are not the same. A formula error may reveal a missing field, an invalid reference, or division by zero. Investigate it before hiding it with a broad error handler. A zero displayed in place of a failed calculation can look like a legitimate financial result.',
							'For a ratio, decide what a zero denominator means. “Not applicable” may be more honest than 0%. Rounding belongs at a declared stage; rounding every intermediate value can differ from rounding the final total.'
						]
					},
					{
						kind: 'lab',
						id: 'spreadsheet',
						title: 'The formula workbench',
						task: 'In the spreadsheet workbench, select the Customer ledger tab for this M09 case. The three invoice rows already contain paid-as-of amounts aggregated from accepted payments. Enter outstanding and total formulas, reconcile the result, then change a paid amount to verify dependencies. The separate Receivables & collections tab is another cohort for practicing SUMIF; its starting totals differ. Use the data views below the sheet to compare a raw join with pre-aggregation and then change the customer filter.',
						prediction:
							'If I-202’s paid amount increases from 60 to 100, which cells should change, and by how much?',
						evidence: [
							'Keep the formulas as well as the displayed values.',
							'Verify the initial total outstanding of 220 for this worked dataset.',
							'Change the paid amount and explain the new total of 180.',
							'Try a bad reference or zero denominator and diagnose the reported error.'
						],
						limitation:
							'The browser teaches a supported subset of spreadsheet behavior, not every Excel function or workbook feature. Read its function list and use a full spreadsheet for unsupported extensions.'
					}
				]
			},
			{
				id: 'join-explosion',
				title: 'See a join multiply the money',
				lead: 'Two one-to-many relationships can create every pair.',
				blocks: [
					{
						kind: 'table',
						caption:
							'I-201 has two invoice lines, 80 and 40, and two payments, 50 and 70. Joining both child tables directly on invoice ID produces these four rows.',
						headers: ['Invoice', 'Line amount', 'Payment amount', 'Repeated header amount'],
						rows: [
							['I-201', '80', '50', '120'],
							['I-201', '80', '70', '120'],
							['I-201', '40', '50', '120'],
							['I-201', '40', '70', '120']
						]
					},
					{
						kind: 'worked',
						title: 'Equal totals can both be wrong',
						problem:
							'Sum the displayed line, payment, and header columns, then compare with the original records.',
						steps: [
							'The line sum is 80 + 80 + 40 + 40 = 240, although original invoice lines total 120.',
							'The payment sum is 50 + 70 + 50 + 70 = 240, although original payments total 120.',
							'The header amount repeats four times and sums to 480.',
							'The line and payment totals match each other at 240, but both are doubled. Matching two corrupted totals is not reconciliation.',
							'Aggregate each child table to one row per invoice before joining to an invoice-level output, or preserve separate fact tables with correctly designed analytical relationships.'
						],
						conclusion:
							'Declare the output grain, examine join cardinality, and reconcile against independent source totals.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Cardinality describes how records relate: one customer can have many invoices, and one invoice can have many payments. A left join keeps each row from the left table and matches right-side rows where keys agree; it may still create multiple output rows per left record. “Left join” does not mean “no duplication.”',
							'Deduplicating afterward is not a general repair. Two legitimate payments can have the same amount, and two invoice lines can look identical. Removing repeated values may erase real events. Fix the relationship and grain, using stable identifiers and an explicit aggregation rule.'
						]
					}
				]
			},
			{
				id: 'query-paths',
				title: 'Turn the steps into a repeatable query',
				lead: 'Power Query and SQL express the same reviewed transformation.',
				blocks: [
					{
						kind: 'steps',
						title: 'Power Query path',
						steps: [
							{
								title: 'Import separately',
								text: 'Load invoice and payment tables. Set keys to text, dates to dates, and amounts to an appropriate numeric type; inspect conversion errors.'
							},
							{
								title: 'Filter the event cutoff',
								text: 'Keep received dates on or before September 30 for this snapshot. Preserve excluded records for traceability.'
							},
							{
								title: 'Group payments',
								text: 'Group by invoice key and sum amount, creating one payment-total row per invoice.'
							},
							{
								title: 'Merge at the output grain',
								text: 'Left-merge invoices with grouped payments on invoice key. Confirm the invoice row count remains three.'
							},
							{
								title: 'Handle absent payments explicitly',
								text: 'For a valid invoice with no matching payment events in the complete source, use paid amount zero. Do not apply that rule to an incomplete or failed extract.'
							},
							{
								title: 'Calculate and reconcile',
								text: 'Subtract paid from amount and verify the three control totals before loading the result.'
							}
						]
					},
					{
						kind: 'code',
						language: 'sql',
						title: 'The same logic in readable SQL',
						code: `WITH paid AS (
  SELECT invoice_id, SUM(amount) AS paid_amount
  FROM payments
  WHERE received_date <= '2026-09-30'
  GROUP BY invoice_id
)
SELECT i.invoice_id, i.customer, i.amount,
       COALESCE(p.paid_amount, 0) AS paid_amount,
       i.amount - COALESCE(p.paid_amount, 0) AS outstanding
FROM invoices AS i
LEFT JOIN paid AS p ON p.invoice_id = i.invoice_id
WHERE i.issue_date <= '2026-09-30';`,
						explanation:
							'The temporary result named paid has one row per invoice because GROUP BY defines that grain. COALESCE uses zero when no payment-total row exists, under the declared complete-source assumption. This example uses ISO date strings; confirm date types and syntax in the target database.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'SQL describes a query over tables. SELECT names output fields, WHERE filters records, GROUP BY forms aggregation groups, and JOIN relates records. You do not need to memorize all syntax to review the essential accounting logic: what rows are included, what one output row represents, and whether amounts repeat.',
							'Ask an AI assistant for a query with the schema, key constraints, cutoff, expected grain, and control totals. Then review the actual query and run known cases. A prompt saying “do not double count” is weaker than a concrete test with two payments and two lines that would expose the mistake. This is your first bridge to the pipeline engineering on day five.'
						]
					}
				]
			},
			{
				id: 'power-bi',
				title: 'A measure answers the current filtered question',
				lead: 'The data model determines which rows are summarized.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'A star schema separates facts—events or measured amounts—from dimensions used to describe and filter them. For our fixed September 30 snapshot, the invoice snapshot is a fact table at one row per invoice. A customer dimension has one unique customer row and relates to many invoice rows. A date dimension can support a declared date role, such as invoice issue date. Multiple date roles require explicit modeling; “September invoices” and “payments received in September” are different populations.',
							'Filter context is the set of filters affecting a calculation. With no customer filter, our outstanding total is 220. Selecting Cedar includes I-201 and I-202 and gives 140. Selecting Juniper includes I-203 and gives 80. A measure is calculated for the current filtered set. A calculated column typically produces a value for each row during processing; it serves a different role.',
							'Consider a paid share for this invoice cohort. Total paid divided by total invoiced is 180 / 400 = 45%. The average of row percentages is (100% + 30% + 0%) / 3 = 43.33%. The difference arises because equal weighting of invoices differs from weighting by amount. Choose the measure that answers the business question and label it precisely; neither is a generic “collection performance” measure without a cohort and cutoff.'
						]
					},
					{
						kind: 'code',
						language: 'dax',
						title: 'Measures for the prepared snapshot',
						code: `Outstanding = SUM(InvoiceSnapshot[Outstanding])

Paid Share = DIVIDE(
    SUM(InvoiceSnapshot[PaidAmount]),
    SUM(InvoiceSnapshot[Amount])
)`,
						explanation:
							'DIVIDE handles a zero denominator by returning blank unless an alternative is supplied. Under a Cedar filter, Paid Share is 180/320 = 56.25%; under Juniper it is 0/80 = 0%. The snapshot must already have the declared cutoff and grain.'
					},
					{
						kind: 'reflection',
						prompt:
							'A dashboard total matches the ledger but its customer rows do not. Is it reconciled?',
						guidance: 'Think about offsetting mistakes and filter relationships.',
						modelAnswer:
							'No. Equal grand totals can conceal offsetting misallocations, incorrect relationships, or duplicated and omitted rows. I would reconcile by stable invoice/customer keys and inspect filter propagation, not accept a matching headline alone.'
					}
				]
			},
			{
				id: 'analytical-review',
				title: 'Review the result like an analyst',
				lead: 'A good workbook carries its reasoning with it.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Choose one execution path for the core exercise. The spreadsheet workbench is sufficient to calculate the small example; Power Query, SQL, and Power BI show how the same logic scales and changes representation. This module is a guided bridge, not a claim that you have mastered all four products. The role extensions provide deeper practice.',
							'Your analytical pack should preserve source records, declare the cutoff and grain, expose calculations, reconcile counts and amounts, and explain exceptions. Include a changed-case check: add another payment, a missing customer, a duplicate key, or an after-cutoff receipt. Predict the expected effect before running it. That habit protects you when an AI coding assistant proposes a plausible but incorrect formula.',
							'In M14 the same discipline will support variance commentary. In M21 the workbook logic becomes a reproducible pipeline. The technology can change while the financial meaning, source lineage, and tests stay recognizable.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M09-C1',
				objective: 0,
				prompt:
					'C3 contains invoice amount 200 and D3 contains eligible payments 60. Which formula calculates outstanding?',
				options: [
					'=C3-D3, giving 140.',
					'=C3+D3, giving 260.',
					'=200-60, which is equally maintainable under source changes.'
				],
				answer: 0,
				rationales: [
					'The references preserve the relationship to source cells.',
					'Adding receipts increases rather than reduces outstanding.',
					'The result is initially correct but hardcoded values do not track changed source cells.'
				]
			},
			{
				id: 'M09-C2',
				objective: 1,
				prompt:
					'Two invoice lines are directly joined to two payments on invoice ID. How many matched pairs result?',
				options: [
					'Two, because there are two payments.',
					'Four, one for each line/payment combination.',
					'One, because the invoice ID is the same.'
				],
				answer: 1,
				rationales: [
					'Each payment matches both lines.',
					'A two-by-two combination produces four rows.',
					'The repeated key does not automatically aggregate records.'
				]
			},
			{
				id: 'M09-C3',
				objective: 1,
				prompt: 'What is the safest repair for the worked join explosion?',
				options: [
					'Remove every repeated amount afterward.',
					'Aggregate each child table to the required invoice grain before joining.',
					'Accept the result if payment and line totals match.'
				],
				answer: 1,
				rationales: [
					'Legitimate events can share amounts; deleting them can lose real records.',
					'This preserves the declared output grain and allows independent reconciliation.',
					'Both totals can be multiplied by the same factor and still match.'
				]
			},
			{
				id: 'M09-C4',
				objective: 0,
				prompt: 'Why use $H$2 for a shared threshold when copying formulas?',
				options: [
					'It keeps the reference to the same threshold cell.',
					'It converts the threshold to dollars automatically.',
					'It prevents the cell’s value from ever being edited.'
				],
				answer: 0,
				rationales: [
					'Absolute references stay anchored during copying.',
					'The dollar signs control reference behavior, not currency format.',
					'Reference anchoring is not an edit permission.'
				]
			},
			{
				id: 'M09-C5',
				objective: 2,
				prompt:
					'Cedar has invoice amounts 120 and 200, with paid amounts 120 and 60. What is the cohort paid share?',
				options: [
					'65%, the average of 100% and 30%.',
					'56.25%, from 180 divided by 320.',
					'45%, because a customer filter cannot affect a measure.'
				],
				answer: 1,
				rationales: [
					'That equally weights invoices; the stated cohort share is a ratio of summed amounts.',
					'This weights by invoice amount and uses only the filtered Cedar cohort.',
					'45% is the all-customer share; measures respond to their filter context.'
				]
			},
			{
				id: 'M09-C6',
				objective: 2,
				prompt: 'The October 2 payment is known today. Should it reduce the September 30 snapshot?',
				options: [
					'Yes, because the current extract includes it.',
					'No, the event is after the declared cutoff.',
					'Only if an AI assistant recommends including it.'
				],
				answer: 1,
				rationales: [
					'Current knowledge does not change when the cash event occurred.',
					'The as-of report must preserve its stated time boundary.',
					'The accounting definition, not the assistant’s preference, determines inclusion.'
				]
			}
		],
		assignment: {
			title: 'Produce a reconciled receivables view',
			scenario:
				'Use the supplied three invoices and four payments. The report is as of September 30. Then change P-03 from 60 to 100 and assess the effect.',
			tasks: [
				'Calculate invoice-level paid and outstanding amounts with formulas or a reviewed query.',
				'Reconcile initial totals and explain why P-04 is excluded.',
				'Calculate customer totals and the ratio-of-sums paid share.',
				'Recompute after the changed payment and explain which measures move.'
			],
			deliverable: 'A reproducible sheet or query, control totals, and a short review note.',
			rubric: [
				{
					criterion: 'Grain and cutoff',
					evidence: 'One row per invoice; only eligible payments included.'
				},
				{ criterion: 'Formula logic', evidence: 'References and aggregations remain executable.' },
				{ criterion: 'Reconciliation', evidence: 'Explains rows as well as total amounts.' },
				{
					criterion: 'Measure interpretation',
					evidence: 'Distinguishes filtered ratio of sums from average percentages.'
				}
			],
			workedSolution: [
				'Initial invoice amounts are 120, 200, 80; eligible paid amounts are 120, 60, 0; outstanding amounts are 0, 140, 80. Totals are 400, 180, and 220. P-04 occurs after the cutoff and is excluded.',
				'Cedar outstanding is 140, Juniper 80. Overall paid share is 45%; Cedar’s is 56.25%. Outstanding does not mean overdue: Juniper’s invoice is not yet due.',
				'Changing P-03 to 100 raises eligible paid to 220 and reduces outstanding to 180. Cedar outstanding becomes 100, its paid share becomes 220/320 = 68.75%, and overall paid share becomes 55%. Invoice total remains 400.'
			]
		},
		interview: {
			question: 'An AI-generated Power BI report double-counts revenue. How do you investigate?',
			strongAnswer: [
				'I would trace the measure back to source grain, key uniqueness, and relationships. A direct join of two one-to-many child tables can multiply amounts while still producing plausible totals. I would inspect a small invoice with multiple lines and payments, aggregate at the intended grain, and reconcile against independent source totals.',
				'Then I would examine filter context and whether the measure is a ratio of sums or an average of ratios. I would preserve the cutoff and date role, add a regression case for the duplicate pattern, and review the actual generated logic rather than rely on a prompt promising accuracy.'
			],
			followUps: [
				{
					question: 'What if the grand total matches?',
					answer:
						'I would still reconcile row-level and subgroup results. Offsetting errors or equally multiplied totals can conceal incorrect allocation.'
				},
				{
					question: 'What is the difference between a column and a measure?',
					answer:
						'A calculated column defines a value per row; a measure computes an answer under the current filter context. The choice must match the intended grain and analytical question.'
				}
			]
		},
		sources: [
			{
				label: 'Microsoft: SUMIF function',
				url: 'https://support.microsoft.com/en-us/excel/functions/sumif-function',
				note: 'Formula syntax; browser exercise supports a documented subset.'
			},
			{
				label: 'Microsoft: Table.Group',
				url: 'https://learn.microsoft.com/en-us/powerquery-m/table-group',
				note: 'Grouping before merges supports the declared grain.'
			},
			{
				label: 'Microsoft: star schema guidance',
				url: 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema',
				note: 'Facts, dimensions, relationships, and measures.'
			},
			{
				label: 'Microsoft: DAX DIVIDE',
				url: 'https://learn.microsoft.com/en-us/dax/divide-function-dax',
				note: 'Zero-denominator handling.'
			}
		]
	},
	{
		id: 'M10',
		day: 2,
		title: 'Finance applications, value, and future scenarios',
		subtitle: 'Turn a promising capability into a defensible pilot.',
		minutes: 50,
		prerequisites: ['M05', 'M07', 'M09'],
		objectives: [
			'Distinguish documented deployment examples from generalizable evidence and future scenarios.',
			'Calculate total workflow benefit with preparation, review, correction, and recurring costs.',
			'Design a bounded pilot with an owner, baseline, acceptance criteria, and stop condition.'
		],
		why: 'Professional fluency includes deciding whether a system is worth building. The strongest business conversation connects capability, evidence, operating costs, and organizational responsibility.',
		sections: [
			{
				id: 'current-use',
				title: 'What is being used now?',
				lead: 'Use deployment accounts as evidence of possibilities, with their scope visible.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Microsoft’s Finance organization describes applications involving forecasting, reconciliation, collections, document handling, and analysis on its AI in Finance site. This is a first-party account of its own work, reviewed for this course in September 2026. It demonstrates that these are practical areas of activity; it does not independently establish the return another organization will achieve.',
							'ACCA and Chartered Accountants ANZ’s 2026 work on enabling finance insight discusses data and skills gaps in AI-enabled finance. Its relevance is the connection between analytical tools, data foundations, and professional capability. A survey or publisher’s deployment story can motivate a pilot, but does not replace evidence from the process being changed.',
							'Capabilities should be described at the task level. “An assistant prepares reconciliation exceptions” is narrower than “AI performs the close.” “A forecast helps prioritize liquidity review” differs from “AI knows future cash.” The narrower descriptions let us inspect what inputs are available, what is actually computed, and who makes the consequential decision.'
						]
					},
					{
						kind: 'table',
						caption:
							'Applications to assess, not claims that every organization has deployed them successfully.',
						headers: [
							'Use case',
							'Potential contribution',
							'Evidence needed locally',
							'Common hidden burden'
						],
						rows: [
							[
								'Document intake',
								'Extract fields and classify documents',
								'Reviewed transcriptions and new-format cases',
								'Correcting ambiguous or missing fields'
							],
							[
								'Reconciliation assistance',
								'Match records and explain exceptions',
								'Source totals, stable keys, unmatched cases',
								'Investigating offsetting errors and duplicate ingestion'
							],
							[
								'Collections prioritization',
								'Rank cases for intervention',
								'Mature outcomes, capacity, intervention effects',
								'False alarms, customer impact, changing prevalence'
							],
							[
								'Forecasting',
								'Compare future cash estimates and scenarios',
								'Rolling-origin errors and driver availability',
								'Maintaining assumptions under changed conditions'
							],
							[
								'Variance commentary',
								'Draft supported explanations',
								'Reconciled numbers and claim/source mapping',
								'Verifying causation and removing invented facts'
							]
						]
					}
				]
			},
			{
				id: 'process-map',
				title: 'Map the work before measuring the benefit',
				lead: 'A fast model call may be a small part of the total process.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Write the current process in observable stages: obtain records, prepare inputs, perform the analysis, review, correct, resolve exceptions, and communicate. Include waiting and handoffs separately from active work. A five-minute drafting improvement may be useful, but it will not necessarily reduce a three-day delay caused by unavailable source evidence.',
							'Specify the unit of comparison. A case could be an invoice, reconciliation account, forecast cycle, or variance note. The case definition should remain stable between baseline and pilot. If the new system excludes the difficult cases and reports only the easy ones, the apparent average improvement may reflect selection rather than useful automation.',
							'Identify different outcomes. Productivity concerns resources per acceptable result. Quality concerns whether the result meets its criteria. Decision value concerns what a person does differently because of it. Risk and accountability concern failures and boundaries. These dimensions can move in different directions; compressing them into one unexamined “AI ROI” number can hide tradeoffs.'
						]
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'Capacity released is not automatically cash saved',
						paragraphs: [
							'If a team finishes the same work sooner but staffing and other costs remain unchanged, the immediate benefit is capacity. It may support growth, faster service, better analysis, or a later cost change. State the intended realization path rather than booking all saved minutes as cash savings.',
							'Keep implementation costs, recurring operating costs, and benefits on comparable periods. A monthly benefit cannot be compared directly with an annual subscription without conversion.'
						]
					}
				]
			},
			{
				id: 'worked-economics',
				title: 'Calculate a complete illustrative business case',
				lead: 'Make every assumption visible enough to challenge.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Original synthetic scenario: 500 variance-note cases per month. Minutes per case include all ordinary work under the stated assumptions.',
						headers: ['Stage', 'Current process', 'Proposed process'],
						rows: [
							['Prepare inputs', '3', '4'],
							['Draft / execute', '8', '2'],
							['Review', '4', '5'],
							['Correction', '1', '2'],
							['Total', '16', '13']
						]
					},
					{
						kind: 'worked',
						title: 'From minutes to a bounded value estimate',
						problem:
							'Loaded staff cost is USD 60 per hour. Recurring model/software costs are USD 700 per month, maintenance is USD 400 per month, and initial implementation is USD 6,000. Compare the two processes at 500 cases per month.',
						steps: [
							'Time saved per case is 16 − 13 = 3 minutes. At 500 cases, that is 1,500 minutes or 25 hours per month.',
							'At USD 60 per hour, released capacity is valued at USD 1,500 per month under the stated costing assumption.',
							'Recurring costs total USD 1,100 per month. Net monthly capacity-equivalent benefit is USD 400.',
							'A simple payback calculation is 6,000 / 400 = 15 months if the benefit is realizable and stable. This ignores financing, tax, discounting, and changes over time. It is a teaching screening calculation, not a complete investment appraisal.',
							'At only 250 cases, time benefit is USD 750 while recurring costs remain USD 1,100, giving negative USD 350 per month. Volume matters.',
							'If review/correction adds two further minutes per case at 500 cases, only one minute is saved. That is about 8.33 hours or USD 500 of capacity value, below recurring costs by USD 600.'
						],
						conclusion:
							'The attractive drafting reduction survives only if the full workflow and adoption volume support it. Test the sensitive assumptions first.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'The example does not price every consequence. A missed material error, an unsupported narrative, an incorrect customer contact, or a delayed close can dominate time savings. Some consequences are difficult to reduce to a single expected-dollar estimate. Use explicit acceptance boundaries and scenario analysis rather than assuming unpriced effects are zero.',
							'Also inspect variation. An average of 13 minutes can hide a small group requiring an hour of rework. Record distributions, error categories, and difficult cases. A pilot that makes routine work faster but creates unpredictable high-severity incidents needs a different operating design.'
						]
					}
				]
			},
			{
				id: 'pilot',
				title: 'Design a pilot that can change your mind',
				lead: 'Decide what evidence would stop or revise the proposal.',
				blocks: [
					{
						kind: 'steps',
						title: 'A bounded pilot charter',
						steps: [
							{
								title: 'Scope',
								text: 'Choose one team, defined records, and a clear output, such as a draft review packet. State what actions are outside the pilot.'
							},
							{
								title: 'Baseline',
								text: 'Measure the current process on comparable cases, including preparation, review, correction, quality, and elapsed time.'
							},
							{
								title: 'Data and owner',
								text: 'Name source owners, allowed inputs, cutoff/version rules, and the person accountable for accepting outputs.'
							},
							{
								title: 'Acceptance criteria',
								text: 'Specify task correctness, evidence support, workflow time, and operational constraints before seeing results.'
							},
							{
								title: 'Failure handling',
								text: 'Route unsupported or invalid cases to a visible exception state; preserve source material and the actual output.'
							},
							{
								title: 'Decision rule',
								text: 'Choose when to expand, revise, or stop, and retain a rollback path to the established process.'
							}
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'Avoid changing several components at once unless the goal is explicitly to compare whole systems. If a new model, prompt, dataset, and review checklist all arrive together, you may observe a better outcome without knowing which change caused it. Controlled comparisons can isolate an intervention; broader pilots can assess end-to-end value. State which question the design answers.',
							'A pilot can begin in shadow mode: the system prepares outputs alongside the existing process while reviewers compare them before operational reliance. That provides learning with a bounded role, though it adds work during evaluation. Later assisted use can measure actual adoption and review effort. A successful shadow test is not automatically evidence that staff will use the system well under deadlines.',
							'Select cases representative of the intended scope, including missing data, new formats, borderline thresholds, and contradictory evidence. Keep final assessment cases out of iterative tuning. The same distinction between validation and test that governed M04 applies to a business process built around prompts and tools.'
						]
					},
					{
						kind: 'lab',
						id: 'value',
						title: 'Stress-test the business case',
						task: 'Change case volume, time spent on preparation/review/correction, and operating costs. The browser model uses weekly periods; the preceding worked example uses months. Keep every volume and recurring cost on the same period when entering your own case. The browser also allocates setup over a selected number of weeks, so its net figure includes that allocation and differs from the recurring-only net used for simple payback. Recalculate total effort and identify the assumption most likely to reverse the recommendation.',
						prediction:
							'Will a faster drafting step necessarily produce a positive net monthly benefit?',
						evidence: [
							'State all time and cost assumptions.',
							'Separate released capacity from cash realization.',
							'Test a lower-volume and higher-review scenario.',
							'Record a stop or redesign condition.'
						],
						limitation:
							'The figures are illustrative and omit some economic and risk factors. This is a pilot-screening exercise, not a valuation or investment recommendation.'
					}
				]
			},
			{
				id: 'future',
				title: 'Discuss the future as conditional scenarios',
				lead: 'Be ambitious about possibilities and precise about what must become true.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Imagine a close assistant that notices an unmatched receipt, retrieves the purchase order and applicable policy, calculates the difference, prepares an explanation, and places a packet in the correct review queue. That is a coherent system scenario. Its usefulness depends on reliable data access, correct identities and dates, tested calculations, source-supported language, recovery after failures, and actual review capacity.',
							'A more autonomous version might choose which evidence to inspect next. That can help when investigation paths vary, but adds uncertainty about execution order, cost, and stopping. Some activities remain better expressed as fixed rules or deterministic transformations. The most advanced model available is not necessarily the best system for a repeatable controlled process.',
							'Adoption can stall even when model capability improves. Missing source ownership, incompatible systems, unclear accountability, costly review, low user trust, or failure to redesign work can limit value. Conversely, improved data infrastructure and carefully scoped tools can make modest models useful. A future forecast should state these dependencies rather than promise a date when accountants disappear.',
							'Professionals can prepare by developing connected skills: accounting judgment, data modeling, evaluation, communication, and system design. The goal is to ask better questions and produce evidence that colleagues can inspect. On day three, we will examine language models deeply enough to understand both their useful flexibility and the limits of fluent output.'
						]
					}
				]
			},
			{
				id: 'proposal',
				title: 'Make the recommendation reviewable',
				lead: 'Separate what is observed, what is assumed, and what you propose.',
				blocks: [
					{
						kind: 'reflection',
						prompt:
							'A vendor claims an 80% reduction in drafting time. Your CFO asks whether to budget for an 80% reduction in the team’s cost. What do you say?',
						guidance: 'Distinguish a component metric, total workflow effort, and realized cash.',
						modelAnswer:
							'The drafting claim covers one stage and may come from another setting. I would measure local preparation, review, correction, exceptions, and recurring costs, then identify how released capacity would be used or realized. An 80% drafting improvement does not imply an 80% team-cost reduction.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'A clear final proposal has three layers. Observed evidence includes measured baseline and pilot outcomes with case coverage. Assumptions include future volume, staff-cost valuation, maintenance, and expected error consequences. The recommendation states a bounded next step and the conditions for continuing. Keeping those layers separate makes the proposal easier to challenge and improve.',
							'Do not hide an unfavorable finding. A pilot that shows no net time saving may still improve consistency or expose a data problem worth fixing. Report that specific outcome rather than declaring victory because generated text looks polished. The course’s recurring standard is evidence tied to a decision, not a predetermined conclusion that AI must be adopted.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M10-C1',
				objective: 0,
				prompt:
					'A company publishes a successful AI reconciliation story. What does it most directly establish?',
				options: [
					'A reported use in that company’s setting.',
					'The same return is guaranteed for Willow.',
					'No local evaluation is needed if the publisher is well known.'
				],
				answer: 0,
				rationales: [
					'It is useful first-party evidence with a specific scope.',
					'Data, controls, costs, and adoption differ across organizations.',
					'Reputation does not replace a local baseline and measured pilot.'
				]
			},
			{
				id: 'M10-C2',
				objective: 1,
				prompt:
					'A process falls from 16 to 13 minutes for 500 monthly cases. How much time is released?',
				options: ['25 hours per month.', '1,500 hours per month.', 'Three hours per month.'],
				answer: 0,
				rationales: [
					'3 × 500 = 1,500 minutes, divided by 60 gives 25 hours.',
					'This fails to convert minutes to hours.',
					'Three minutes is the per-case change, not the monthly total.'
				]
			},
			{
				id: 'M10-C3',
				objective: 1,
				prompt:
					'Released capacity is valued at USD 1,500 monthly; recurring costs are USD 1,100; setup is USD 6,000. What is simple payback under stable realizable benefits?',
				options: [
					'Four months, using gross benefit only.',
					'Fifteen months, using USD 400 net monthly benefit.',
					'Immediate, because setup is a one-time cost.'
				],
				answer: 1,
				rationales: [
					'This omits recurring costs.',
					'6,000 / (1,500 − 1,100) = 15, subject to the stated simplifications.',
					'One-time costs still require resources and affect the comparison.'
				]
			},
			{
				id: 'M10-C4',
				objective: 1,
				prompt:
					'The team saves time but staffing and other cash costs stay unchanged. What should be claimed first?',
				options: [
					'Released capacity with a stated use, not automatic cash savings.',
					'An identical reduction in cash expenses.',
					'No benefit of any kind.'
				],
				answer: 0,
				rationales: [
					'Capacity can be valuable, but its realization path should be explicit.',
					'Time release does not mechanically remove a cash payment.',
					'Improved service, growth capacity, or analysis may create value.'
				]
			},
			{
				id: 'M10-C5',
				objective: 2,
				prompt: 'Which pilot criterion is most reviewable?',
				options: [
					'The system should feel intelligent.',
					'On declared representative cases, meet defined correctness/evidence criteria and reduce total reviewed effort within a stated cost cap.',
					'Use the largest available model.'
				],
				answer: 1,
				rationales: [
					'The phrase does not define an observable outcome.',
					'It specifies evidence and operational constraints that can change the decision.',
					'Model size is an implementation property, not a success criterion.'
				]
			},
			{
				id: 'M10-C6',
				objective: 0,
				prompt:
					'How should you present an autonomous close assistant that is not yet deployed at Willow?',
				options: [
					'As a scenario with explicit data, control, reliability, and economic dependencies.',
					'As an inevitable near-term outcome.',
					'As impossible because current pilots have limitations.'
				],
				answer: 0,
				rationales: [
					'Conditional scenarios can be useful without overstating evidence.',
					'The timetable and success are not established.',
					'Current limitations inform the conditions, not an absolute impossibility claim.'
				]
			}
		],
		assignment: {
			title: 'Write a pilot proposal that could be rejected',
			scenario:
				'Willow’s controller wants AI variance notes. There are 500 cases monthly. Use the worked 16-to-13-minute process, USD 60 hourly cost, USD 1,100 recurring monthly cost, and USD 6,000 setup. Some source reports are occasionally late.',
			tasks: [
				'Calculate the base case and one adverse scenario.',
				'Define scope, owner, baseline, evidence criteria, and stop condition.',
				'Explain how missing source reports should affect generation and the benefit claim.'
			],
			deliverable: 'A one-page pilot charter with a transparent benefits table.',
			rubric: [
				{
					criterion: 'Economics',
					evidence: 'Uses whole-workflow net benefit and comparable periods.'
				},
				{
					criterion: 'Evidence',
					evidence: 'Distinguishes measured facts from assumptions and published examples.'
				},
				{
					criterion: 'Operating design',
					evidence: 'Names review responsibility and missing-evidence behavior.'
				},
				{
					criterion: 'Decision discipline',
					evidence: 'Contains a genuine condition for stopping or redesigning.'
				}
			],
			workedSolution: [
				'Base capacity value is USD 1,500 monthly, net of recurring cost USD 400, with 15-month simple payback under stable realizable benefits. At 250 cases the net is negative USD 350 monthly. These are screening estimates, not guaranteed savings.',
				'Pilot draft notes for a defined team and report set. Measure preparation, drafting, review, correction, unsupported claims, numerical correctness, and exception effort against the current process. Assign a finance owner for accepting the evidence.',
				'If a required source is late, show a missing-evidence status and produce only supported observations; do not invent causes. Stop or redesign if evidence/numeric criteria fail or review/correction removes the expected net benefit. Preserve a rollback to the current process.'
			]
		},
		interview: {
			question: 'How would you build a business case for AI in finance?',
			strongAnswer: [
				'I would define a bounded outcome and measure the current end-to-end process, including preparation, review, corrections, and exceptions. I would compare a representative pilot, include recurring and implementation costs, and distinguish released capacity from realized cash savings. I would test sensitive assumptions such as volume and review effort.',
				'I would treat published deployments as context, not a guarantee. The proposal would name an accountable owner, evidence and correctness criteria, failure handling, and conditions for expansion or stopping. Future scenarios would remain conditional on data, reliability, controls, and economics.'
			],
			followUps: [
				{
					question: 'What if drafting is much faster but overall time barely improves?',
					answer:
						'I would locate the shifted workload and test whether input preparation or review design can improve. I would report the small net result honestly and avoid equating a component gain with end-to-end value.'
				},
				{
					question: 'What does a good pilot failure teach?',
					answer:
						'It identifies an assumption that did not hold—such as data availability, user adoption, or acceptable review cost—and supports a concrete redesign or stop decision. Preserving failures makes the learning usable.'
				}
			]
		},
		sources: [
			{
				label: 'Microsoft Frontier Finance: AI in Finance',
				url: 'https://www.microsoft.com/en-us/frontierfinance/ai-in-finance.aspx',
				note: 'First-party account reviewed September 2026; not independent evidence of transferable ROI.'
			},
			{
				label: 'ACCA / Chartered Accountants ANZ: Enabling finance insight (2026)',
				url: 'https://www.accaglobal.com/policy-and-insights/reports/2026/enabling-finance-insight.html',
				note: 'Skills and data context; landing-page findings, not a causal trial of this course or Willow.'
			}
		]
	}
];
