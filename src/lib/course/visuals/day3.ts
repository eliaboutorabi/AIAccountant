import type { TeachingVisual } from './types';

const schematic =
	'Original teaching schematic. Illustrative values are not a measurement of a commercial model. See this chapter’s primary references.';
const generatedProvenance = 'Original generated illustration, checked against the lesson.';
const willow =
	'Original fictional Willow September case. Monetary amounts are in USD thousands unless stated otherwise.';

export const day3Visuals: TeachingVisual[] = [
	{
		id: 'm11-text-to-vectors',
		module: 'M11',
		section: 'tokens',
		kind: 'art',
		title: 'From text to model inputs',
		lead: 'Keep four objects separate: the text, its pieces, their vocabulary keys, and the learned vectors looked up with those keys.',
		image: 'images/visuals/m11-text-to-vectors.webp',
		width: 1536,
		height: 1024,
		alt: 'Invoice paid becomes three illustrative token pieces, IDs 41, 92 and 7, and three four-component embedding vectors. The IDs are lookup keys, not magnitudes.',
		transcript: [
			{
				label: 'Text',
				explanation:
					'The source sentence is “Invoice paid.” The toy segmentation contains Invoice, a space followed by paid, and the final period. The leading space is not visibly marked on the paid tile.'
			},
			{
				label: 'Vocabulary IDs',
				explanation:
					'In this invented vocabulary those pieces map to 41, 92 and 7. Actual IDs depend on the named tokenizer. Their order or size does not rank meanings.'
			},
			{
				label: 'Embedding lookup',
				explanation:
					'Each ID selects a learned row of numbers. The first illustrative row is [0.2, −0.1, 0.7, 0.4]; the other two rows omit their numbers for simplicity. Four dimensions are shown for readability; these are not real model weights.'
			}
		],
		takeaway:
			'Tokenization chooses pieces and keys. Embedding lookup supplies learned representations. Neither operation verifies the sentence.',
		question:
			'If the ID for “paid” is larger than the ID for “invoice”, does that make paid more important?',
		answer:
			'No. A vocabulary ID is an index. Reassigning the IDs consistently with the embedding rows need not change the represented content.',
		sourceNote: schematic + ' ' + generatedProvenance
	},
	{
		id: 'm11-prediction-support',
		module: 'M11',
		section: 'prediction',
		kind: 'diagram',
		layout: 'bars',
		title: 'A prediction is not a verified fact',
		lead: 'Suppose a toy model continues “The invoice is …”. Its next-token distribution describes possible continuations of this context.',
		alt: 'Illustrative next-token probabilities: paid 55%, overdue 30%, disputed 15%. These probabilities sum to 100% but do not establish payment status.',
		nodes: [
			{
				label: 'paid',
				detail: 'Most likely token in this illustrative distribution.',
				amount: 55,
				value: '55%'
			},
			{ label: 'overdue', detail: 'Another possible continuation.', amount: 30, value: '30%' },
			{ label: 'disputed', detail: 'A third possible continuation.', amount: 15, value: '15%' }
		],
		unit: '% of next-token probability',
		takeaway:
			'“paid” being the most likely next token does not prove that an accepted payment exists. Retrieve the ledger evidence.',
		question: 'Can we report a 55% probability that the customer paid?',
		answer:
			'No. This is an invented language-continuation distribution, not a calibrated financial outcome model. The task and denominator differ.',
		sourceNote: schematic
	},
	{
		id: 'm11-three-representations',
		module: 'M11',
		section: 'embeddings',
		kind: 'diagram',
		layout: 'compare',
		title: 'One token, three different representations',
		lead: 'Follow the role of a token as it moves from a vocabulary entry into the surrounding sentence.',
		alt: 'Vocabulary ID selects an initial learned embedding; transformer layers produce context-dependent hidden representations.',
		nodes: [
			{
				label: 'Vocabulary ID',
				value: 'Lookup key',
				detail:
					'A discrete index into the vocabulary. The integer itself is not a financial amount.',
				icon: 'tag'
			},
			{
				label: 'Initial embedding',
				value: 'Learned row',
				detail: 'At fixed weights, the same token ID starts with the same token embedding.',
				icon: 'layers'
			},
			{
				label: 'Contextual state',
				value: 'Input-dependent',
				detail:
					'Position and permitted context change the representation as it passes through transformer layers.',
				icon: 'network'
			}
		],
		takeaway:
			'The embedding table can stay fixed during inference while the hidden representations change with the input.',
		question: 'Must a model retrain to represent “bank” differently in two sentences?',
		answer:
			'No. The input token embedding may start the same, while later representations incorporate different surrounding context using fixed learned parameters.',
		sourceNote: schematic
	},
	{
		id: 'm12-attention-mixture',
		module: 'M12',
		section: 'qkv',
		kind: 'art',
		title: 'Attention mixes information',
		lead: 'Read the ribbons as one component of a value mixture for the current position, “paid”. The numbers 10, 4 and 8 are value components, not token IDs or attention weights.',
		image: 'images/visuals/m12-attention-mixture.webp',
		width: 1536,
		height: 1024,
		alt: 'Attention weights 20%, 30%, 50% multiply illustrative values 10, 4, 8. Contributions 2, 1.2, 4 sum to 7.2 for the current token position.',
		transcript: [
			{
				label: 'Weights from the query and keys',
				explanation:
					'The current query is compared with eligible keys. Turning these matching scores into a normalized distribution gives the illustrative weights 0.20, 0.30 and 0.50. Those weights total one.'
			},
			{
				label: 'Values carry what is mixed',
				explanation:
					'For one component, the three values are 10, 4 and 8. Their weighted contributions are 2.0, 1.2 and 4.0.'
			},
			{
				label: 'Output',
				explanation:
					'The component of the output mixture is 7.2. A real attention head mixes vectors, and a full transformer contains additional transformations and residual connections.'
			}
		],
		takeaway:
			'Attention weights are input-dependent mixing coefficients. They are different from the trained projection parameters and do not, alone, establish causality.',
		question: 'If all three value components were 10, what would this mixture produce?',
		answer: '10, because normalized weights sum to one: 0.20×10 + 0.30×10 + 0.50×10 = 10.',
		sourceNote: schematic + ' ' + generatedProvenance
	},
	{
		id: 'm12-causal-mask',
		module: 'M12',
		section: 'mask',
		kind: 'diagram',
		layout: 'matrix',
		title: 'The causal mask is a boundary',
		lead: 'Rows are query positions. Columns are source positions. A one permits attention; a zero blocks access to that later position.',
		alt: 'A three-position lower triangular mask: first row 1,0,0; second 1,1,0; third 1,1,1. No query can access a future position.',
		rows: ['invoice', 'was', 'paid'],
		columns: ['invoice', 'was', 'paid'],
		cells: [
			[1, 0, 0],
			[1, 1, 0],
			[1, 1, 1]
		],
		unit: '1 permitted · 0 blocked',
		nodes: [
			{
				label: 'Read a row',
				detail: 'The query at “was” can use “invoice” and itself, but not “paid”.'
			},
			{
				label: 'Not probabilities',
				detail:
					'These entries indicate access. Permitted attention weights must still be calculated and normalized.'
			}
		],
		takeaway:
			'During next-token training, the model must not peek at future answer tokens, even when the whole example is available to the training code.',
		question: 'Why is the diagonal permitted?',
		answer:
			'Each position uses its current input token to predict the next token. It must not access the later target token itself.',
		sourceNote: schematic
	},
	{
		id: 'm12-block-jobs',
		module: 'M12',
		section: 'block',
		kind: 'diagram',
		layout: 'flow',
		title: 'A transformer block has several jobs',
		lead: 'Attention is a component inside a larger computation. This schematic follows the decoder pattern used in the course’s small model.',
		alt: 'Token and position representations enter normalized causal attention, then a residual addition, a normalized feed-forward transformation, another residual addition, and eventual output projection.',
		nodes: [
			{ label: 'Represent', detail: 'Combine token and position information.', icon: 'blocks' },
			{
				label: 'Attend + add',
				detail: 'Normalize, mix permitted values, then add the residual input.',
				icon: 'orbit'
			},
			{
				label: 'Transform + add',
				detail: 'Normalize, apply the feed-forward network, and add another residual.',
				icon: 'network'
			},
			{
				label: 'Predict',
				detail: 'After the stack, project to vocabulary scores and probabilities.',
				icon: 'chart'
			}
		],
		takeaway:
			'Residual paths preserve a route for the input while a block adds learned transformations. Attention alone is not the entire language model.',
		question: 'Do several attention heads necessarily correspond to named accounting jobs?',
		answer:
			'No. Heads are learned subspaces, not preassigned “tax”, “cash” or “grammar” departments. Such names need evidence rather than a diagram label.',
		sourceNote:
			'Schematic of the course decoder architecture; architectures vary. Compare with the actual transformer trace in the linked lab.'
	},
	{
		id: 'm13-training-inference',
		module: 'M13',
		section: 'learning-signal',
		kind: 'art',
		title: 'What changes the model?',
		lead: 'The first two rooms update learned parameters. The third supplies a task and context to an already trained model.',
		image: 'images/visuals/m13-training-inference.webp',
		width: 1536,
		height: 1024,
		alt: 'Pretraining learns from broad data, post-training from selected examples and feedback, and ordinary inference uses current weights plus context.',
		transcript: [
			{
				label: 'Pretraining',
				explanation:
					'Broad training examples supply a predictive learning signal. Optimization changes the model parameters.'
			},
			{
				label: 'Post-training',
				explanation:
					'Selected task examples or feedback can adapt behavior through further parameter updates. Supervised and preference methods differ.'
			},
			{
				label: 'Inference',
				explanation:
					'The question and current approved policy excerpt become input context. The lock symbolizes fixed parameters in this ordinary inference; it does not promise security or correctness.'
			}
		],
		takeaway:
			'Giving an assistant today’s approved policy can change its answer without changing its trained weights.',
		question:
			'Would yesterday’s policy necessarily disappear from learned parameters when a new excerpt is supplied?',
		answer:
			'No. Supplying context is not an erasure or parameter update. The application still needs evidence selection and checks for conflicting or stale information.',
		sourceNote: schematic + ' ' + generatedProvenance
	},
	{
		id: 'm13-adaptation-levers',
		module: 'M13',
		section: 'adaptation',
		kind: 'diagram',
		layout: 'compare',
		title: 'Three ways to adapt an application',
		lead: 'Choose an intervention from the actual problem. These approaches can also be combined.',
		alt: 'Prompting changes supplied instructions, retrieval supplies external evidence, and fine-tuning changes parameters using training examples.',
		nodes: [
			{
				label: 'Prompt',
				value: 'Change the input',
				detail: 'Clarify the task, output contract and useful examples.',
				icon: 'messages'
			},
			{
				label: 'Retrieve',
				value: 'Supply evidence',
				detail: 'Find current authorized records and include relevant passages.',
				icon: 'search'
			},
			{
				label: 'Fine-tune',
				value: 'Update weights',
				detail: 'Train on representative examples; evaluate intended gains and regressions.',
				icon: 'network'
			}
		],
		takeaway:
			'A frequently changing policy is usually an evidence-access problem before it is a model-training problem.',
		question: 'Which of these inherently authorizes a payment?',
		answer:
			'None. A separate application permission and approval process determines which operations may execute.',
		sourceNote: schematic
	},
	{
		id: 'm13-model-compression',
		module: 'M13',
		section: 'deployment',
		kind: 'diagram',
		layout: 'compare',
		title: 'Distillation and quantization change different things',
		lead: 'Both may reduce deployment cost, but they work through different mechanisms and need their own evaluation.',
		alt: 'Distillation teaches a student model from a teacher signal. Quantization represents model numbers with lower precision.',
		nodes: [
			{
				label: 'Distillation',
				value: 'Teacher → student',
				detail:
					'Use teacher outputs or internal signals to train a student. The student does not inherit guaranteed correctness.',
				icon: 'graduation'
			},
			{
				label: 'Quantization',
				value: 'Lower precision',
				detail:
					'Use a more compact numerical representation. Memory savings can come with task-quality trade-offs.',
				icon: 'blocks'
			}
		],
		takeaway:
			'A smaller download or faster response is useful only alongside adequate task quality, supported hardware and a valid evaluation.',
		question: 'Does a four-bit model contain only four learned parameters?',
		answer:
			'No. Four-bit refers to a numerical representation scheme, not the number of learned parameters or a universal guarantee about total runtime memory.',
		sourceNote: schematic
	},
	{
		id: 'm14-evidence-bridge',
		module: 'M14',
		section: 'source-pack',
		kind: 'art',
		title: 'A calculation is not a cause',
		lead: 'Reconcile the movement in gross profit, then distinguish the amount explained from the operational cause still to investigate. These are profit contributions, not cash movements.',
		image: 'images/visuals/m14-evidence-bridge.webp',
		width: 1536,
		height: 1024,
		alt: 'Budget gross profit 480 falls by 60 from revenue and 21 from higher costs to actual 399. The totals do not establish the business cause.',
		transcript: [
			{
				label: 'Approved records',
				explanation:
					'BUD-SEP-01 gives budget gross profit of 480; GL-SEP-01 gives actual gross profit 399. All values here are USD thousands.'
			},
			{
				label: 'Reconciliation',
				explanation:
					'Revenue is 60 below budget and costs are 21 above budget, so 480−60−21=399. Gross profit is 81 below budget.'
			},
			{
				label: 'Missing causal evidence',
				explanation:
					'The records do not establish sales volumes, prices, mix or payment timing. The arithmetic does not prove why results changed or how cash moved.'
			}
		],
		takeaway:
			'An arithmetic bridge can be complete while the business explanation is still incomplete.',
		question: 'Can this bridge establish that cash also fell by 81?',
		answer:
			'No. Cash movement also depends on collection timing, payments and other cash flows. Gross profit is not a cash-flow measure.',
		sourceNote: willow + ' ' + generatedProvenance
	},
	{
		id: 'm14-profit-contributions',
		module: 'M14',
		section: 'cost-bridge',
		kind: 'diagram',
		layout: 'bars',
		title: 'Four movements explain the profit gap',
		lead: 'These bars show each arithmetic contribution to the gross-profit variance, not the causes of those changes.',
		alt: 'Revenue contributes −60, materials−18, freight−16 and warehouse+13 to gross profit. The four contributions sum to−81 thousand dollars.',
		nodes: [
			{ label: 'Revenue', amount: -60, value: '−60', detail: 'Lower revenue reduces profit.' },
			{ label: 'Materials', amount: -18, value: '−18', detail: 'Higher expense reduces profit.' },
			{ label: 'Freight', amount: -16, value: '−16', detail: 'Higher expense reduces profit.' },
			{ label: 'Warehouse', amount: 13, value: '+13', detail: 'Lower expense increases profit.' }
		],
		unit: 'USD thousands · contribution to gross profit',
		takeaway:
			'−60 −18 −16 +13 = −81. Expense movements have the opposite sign when shown as contributions to profit.',
		question: 'Why is the warehouse bar positive when warehouse expense fell?',
		answer:
			'Because this chart measures the effect on profit. Spending 13 less increases gross profit by 13, all else equal.',
		sourceNote: willow
	},
	{
		id: 'm14-claim-findings',
		module: 'M14',
		section: 'draft',
		kind: 'diagram',
		layout: 'compare',
		title: 'Three different findings require different repairs',
		lead: 'Break a polished paragraph into claims and match each claim to the evidence it would need.',
		alt: 'Profit fell 81 is supported; freight rose 17% is contradicted by the 20% calculation; lower sales volume caused the decline remains unknown.',
		nodes: [
			{
				label: 'Supported',
				value: 'Profit fell 81',
				detail: '399−480=−81. State the amount, unit and comparison.',
				icon: 'check'
			},
			{
				label: 'Contradicted',
				value: 'Freight rose 17%',
				detail: '96 versus 80 is a 20% rise. Correct the calculation.',
				icon: 'calculator'
			},
			{
				label: 'Unknown',
				value: 'Volume caused it',
				detail: 'No unit-sales data is supplied. Request the missing evidence.',
				icon: 'search'
			}
		],
		takeaway:
			'An unsupported claim is not automatically proven false. It needs a different response from a contradicted calculation.',
		question:
			'If freight was supplied only in dollars, could its movement prove shipment volume increased?',
		answer:
			'No. Rates, mix, routes and other factors can affect freight expense. The amount alone does not isolate volume.',
		sourceNote: willow
	},
	{
		id: 'm15-document-gates',
		module: 'M15',
		section: 'extraction-case',
		kind: 'art',
		title: 'Reading is only the first gate',
		lead: 'An extracted amount, an arithmetic consistency check, and verified transcription are different results. None alone authorizes payment.',
		image: 'images/visuals/m15-document-gates.webp',
		width: 1536,
		height: 1024,
		alt: 'Invoice components 1,100, 88 and 20 total 1,208, while the authored candidate extraction says 1,203. A 5-dollar discrepancy routes the source for review.',
		transcript: [
			{
				label: 'Source and candidate',
				explanation:
					'INV-SCAN-17 has subtotal USD 1,100, tax 88, freight 20 and verified total 1,208. The authored candidate misreads the total as 1,203.'
			},
			{
				label: 'Arithmetic check',
				explanation:
					'The components sum to 1,208, exposing a 5-dollar difference. An inconsistency does not establish which field is wrong without inspecting the source.'
			},
			{
				label: 'Review boundary',
				explanation:
					'Preserve the original image and candidate. Inspect contributing fields before correcting. Correct transcription still does not establish legitimacy or authorize payment.'
			}
		],
		takeaway: 'An accurate field is useful evidence, not a completed accounting process.',
		question: 'Should software silently replace 1,203 with 1,208?',
		answer:
			'Not from the arithmetic alone. A component, discount, missing page or extracted total may be wrong. Retain the discrepancy and inspect the source.',
		sourceNote:
			'Original fictional INV-SCAN-17 case, USD. The illustrated extraction error is authored, not an observed OCR benchmark.' +
			' ' +
			generatedProvenance
	},
	{
		id: 'm15-generative-modalities',
		module: 'M15',
		section: 'family',
		kind: 'diagram',
		layout: 'compare',
		title: 'Different outputs, different objectives',
		lead: 'Generative AI describes systems that produce content. A chatbot is one interface, not the boundary of the field.',
		alt: 'Text generation predicts language continuations; image generation produces visual content; audio generation produces sound. Each needs task-specific evaluation.',
		nodes: [
			{
				label: 'Text',
				value: 'A continuation',
				detail: 'Useful prose still needs numerical and source checks.',
				icon: 'messages'
			},
			{
				label: 'Image',
				value: 'Visual content',
				detail: 'Inspect labels, spatial relationships and suitability for the intended use.',
				icon: 'sparkles'
			},
			{
				label: 'Audio',
				value: 'Sound or speech',
				detail: 'Check intelligibility, fidelity and the meaning communicated.',
				icon: 'play'
			}
		],
		takeaway:
			'Models can combine modalities, and generative models can be used within classification or extraction applications. Evaluate the actual task.',
		question:
			'Does an attractive generated invoice image provide evidence that a transaction occurred?',
		answer:
			'No. A generated visual is created content, not an authenticated source transaction. Its role and provenance must be clear.',
		sourceNote: schematic
	},
	{
		id: 'm15-denoising-cycle',
		module: 'M15',
		section: 'denoising',
		kind: 'diagram',
		layout: 'cycle',
		title: 'Learning to remove noise',
		lead: 'During training, the clean example supplies a target. Later, an ambiguous noisy observation may have several plausible originals.',
		alt: 'A clean training point is corrupted with noise, a model estimates a clean point, error is measured against the known target, and parameters are updated.',
		nodes: [
			{
				label: 'Known clean point',
				detail: 'Start from a supplied training example.',
				icon: 'target'
			},
			{ label: 'Add noise', detail: 'Apply a specified random corruption.', icon: 'sparkles' },
			{
				label: 'Estimate',
				detail: 'Use current parameters to predict a cleaner point.',
				icon: 'network'
			},
			{
				label: 'Compare + update',
				detail: 'Measure target error and adjust parameters for another training step.',
				icon: 'chart'
			}
		],
		takeaway:
			'Learning a denoising task does not guarantee recovery of the original. The course lab uses real 2D points, not a complete image-diffusion model.',
		question: 'Is the clean target available when denoising a genuinely new observation?',
		answer:
			'Usually not. The known target makes supervised training and held-out evaluation possible; inference must work from the observation and learned patterns.',
		sourceNote:
			'Original schematic of the course’s small supervised point denoiser. It is not a complete diagram of a modern diffusion architecture.'
	}
];
