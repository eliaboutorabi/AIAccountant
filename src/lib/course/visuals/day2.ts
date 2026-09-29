import type { TeachingVisual } from './types';

const artSource =
	'Original generated illustration of the module’s worked example. Authored teaching data, not measured model performance.';
const nativeSource =
	'Original native diagram based on the module’s stated worked example. Values are authored teaching data, not measurements from the live lab.';

export const day2Visuals: TeachingVisual[] = [
	{
		id: 'm06-art-forward-pass',
		module: 'M06',
		section: 'one-forward-pass',
		kind: 'art',
		image: '/images/visuals/m06-forward-pass.webp',
		width: 1536,
		height: 1024,
		title: 'A forward pass changes values',
		lead: 'Follow one case through fixed parameters. The changing quantities are the intermediate values, not the weights.',
		alt: 'Age 0.8 and history 0.2 connect to two hidden ReLU units with outputs 0.45 and 0. Both feed a final score of about 0.554. Parameters remain fixed.',
		transcript: [
			{
				label: 'Input values',
				explanation:
					'The authored example uses scaled age 0.8 and earlier late-payment share 0.2. Both inputs contribute to each hidden unit.'
			},
			{
				label: 'ReLU A: 0.45',
				explanation:
					'Its weighted contributions are 0.40 and −0.05, with bias 0.10. Their sum is 0.45, which ReLU keeps.'
			},
			{
				label: 'ReLU B: 0',
				explanation:
					'Its weighted contributions are −0.16 and 0.12, with zero bias. Their sum is −0.04, which ReLU maps to zero.'
			},
			{
				label: 'Score approximately 0.554',
				explanation:
					'The output combines 0.45 times 0.7, zero times −0.4, and bias −0.1 to get 0.215. A sigmoid transforms that value to about 0.554.'
			},
			{
				label: 'Parameters stay fixed',
				explanation:
					'This is inference through illustrative hand-worked weights. It does not update the parameters and does not establish the score as a calibrated probability. The live lab’s trained network uses a separate dataset and tanh hidden units.'
			}
		],
		takeaway:
			'Inputs become intermediate representations and then an output through explicit numerical operations. A hidden unit is a computation, not an accounting opinion.',
		question:
			'If the age input changes while every weight stays fixed, is the new output evidence of training?',
		answer:
			'No. It is another forward pass with a different input. Training would use a loss and a procedure to change parameter values.',
		sourceNote: artSource
	},
	{
		id: 'm06-nonlinearity',
		module: 'M06',
		section: 'nonlinearity',
		kind: 'diagram',
		layout: 'compare',
		title: 'Why a bend changes expressive power',
		lead: 'Stacking linear transformations alone does not create a nonlinear relationship.',
		nodes: [
			{
				label: 'Two linear stages',
				detail: 'First double x and add 1; then multiply the result by 3.',
				value: 'x → 2x + 1 → 6x + 3'
			},
			{
				label: 'One equivalent stage',
				detail: 'The same result comes from multiplying x by 6 and adding 3.',
				value: 'Still one straight relationship'
			},
			{
				label: 'ReLU below zero',
				detail: 'A negative combined value is replaced with zero.',
				value: '−0.04 → 0'
			},
			{
				label: 'ReLU above zero',
				detail: 'A positive combined value passes through unchanged.',
				value: '0.45 → 0.45'
			}
		],
		alt: 'Two linear stages collapse to 6x plus 3. ReLU instead treats negative and positive combined values differently, introducing a bend at zero.',
		takeaway:
			'The change in behavior at zero lets combinations of units represent more than one globally straight relationship. More expressive does not mean automatically well trained or well generalized.',
		question:
			'Would fifty linear layers, without intervening nonlinear operations, automatically solve a nonlinear classification pattern?',
		answer:
			'No. Their composition remains a linear or affine transformation. Appropriate nonlinear operations change the family of relationships the network can represent.',
		sourceNote: nativeSource
	},
	{
		id: 'm06-learning-cycle',
		module: 'M06',
		section: 'backward-pass',
		kind: 'diagram',
		layout: 'cycle',
		title: 'One learning cycle, two directions',
		lead: 'Forward computation supplies the loss; backward sensitivities guide the parameter update.',
		nodes: [
			{
				label: 'Forward',
				detail: 'Inputs pass through the current parameters to produce an output.',
				value: 'Input → output'
			},
			{
				label: 'Measure',
				detail: 'Compare that output with the training target using the declared loss.',
				value: 'Output + target → loss'
			},
			{
				label: 'Backpropagate',
				detail: 'Trace sensitivity through the operations to find how each parameter affects loss.',
				value: 'Loss → earlier parameters'
			},
			{
				label: 'Update',
				detail:
					'The optimizer changes parameters using these sensitivities and its step-size controls.',
				value: 'New parameter values'
			},
			{
				label: 'Recompute',
				detail: 'Run the new parameters forward again; evaluate on appropriate separate cases.',
				value: 'New output, then repeat'
			}
		],
		alt: 'A cycle runs forward computation, loss measurement, backward sensitivity propagation, optimizer update, and recomputation.',
		takeaway:
			'Backpropagation computes sensitivities; the optimizer uses them to change parameters. The target is not sent backward as a replacement for the inputs.',
		question:
			'Why must the next forward pass use the updated parameters before you can say whether the step helped?',
		answer:
			'The gradient is local guidance, not a guarantee for an arbitrary step. Recomputing measures the actual effect of that parameter change.',
		sourceNote: nativeSource
	},
	{
		id: 'm07-art-representations',
		module: 'M07',
		section: 'representation',
		kind: 'art',
		image: '/images/visuals/m07-representations.webp',
		width: 1536,
		height: 1024,
		title: 'Representations change what is easy',
		lead: 'The same record can become a representation that makes a particular prediction easier to compute.',
		alt: 'An invoice document is transformed into a six-component numerical representation, shown as glass bars, then supplied to a task-specific document sorter.',
		transcript: [
			{
				label: 'Source record',
				explanation:
					'The original document contains layout and content. Its raw format is not automatically the most useful representation for a model’s task.'
			},
			{
				label: 'Learned representation',
				explanation:
					'Training can produce a list of numbers that preserves distinctions helpful for an objective. The six bars are an illustrative vector, not measured coordinates or a statistical chart.'
			},
			{
				label: 'Task prediction',
				explanation:
					'A later computation uses the representation to predict an output such as a reviewed document category. Its quality must be evaluated on appropriate examples.'
			},
			{
				label: 'Useful for a task',
				explanation:
					'An individual coordinate need not correspond to a named accounting idea. Usefulness depends on the training signal and the downstream conditions; it is not a universal guarantee of understanding.'
			}
		],
		takeaway:
			'Representation learning changes the way information is encoded. It does not remove the need for a clear target, reliable labels, or a business data contract.',
		question: 'Can you assume the tallest vector component means “high expense” or “fraud”?',
		answer:
			'No. Learned coordinates are generally not individually labeled business concepts. Investigate their task behavior instead of assigning a convenient story to one number.',
		sourceNote: artSource
	},
	{
		id: 'm07-learning-signals',
		module: 'M07',
		section: 'tasks',
		kind: 'diagram',
		layout: 'compare',
		title: 'Where the learning signal comes from',
		lead: 'The distinction concerns the training task and its feedback, not whether someone owns the source file.',
		nodes: [
			{
				label: 'Supervised',
				detail: 'A reviewed target accompanies each example, such as the correct expense category.',
				value: 'Input + target'
			},
			{
				label: 'Self-supervised',
				detail:
					'Construct a prediction target from the data itself, such as a withheld or next token.',
				value: 'Data supplies a target'
			},
			{
				label: 'Unsupervised',
				detail:
					'Seek structure without a supplied target for each example, such as grouping similar records.',
				value: 'Structure in examples'
			}
		],
		alt: 'Three learning settings compare reviewed targets, targets constructed from the data, and structure seeking without a per-example target.',
		takeaway:
			'Self-supervised learning still has a defined objective and a target-producing procedure. Unsupervised clusters do not automatically become approved account categories.',
		question:
			'If a model groups invoice descriptions into clusters, may you treat the cluster numbers as an approved chart of accounts?',
		answer:
			'No. Similarity groups reflect the representation and grouping procedure. A chart of accounts reflects business reporting design, definitions, and governance.',
		sourceNote: nativeSource
	},
	{
		id: 'm07-transfer-evidence',
		module: 'M07',
		section: 'transfer',
		kind: 'diagram',
		layout: 'bars',
		unit: 'Percent correct within each stated cohort',
		title: 'Transfer helps some conditions, not all',
		lead: 'Both methods use 200 labeled target-training receipts. Compare them on the same cases within each cohort.',
		nodes: [
			{
				label: 'Ordinary · scratch',
				detail: '72 correct among the common 100 ordinary holdout receipts.',
				amount: 72,
				value: '72/100'
			},
			{
				label: 'Ordinary · reused',
				detail: '84 correct on those same 100 holdout receipts.',
				amount: 84,
				value: '84/100'
			},
			{
				label: 'Handwritten · scratch',
				detail: '7 correct among a separate 20-receipt handwriting challenge.',
				amount: 35,
				value: '7/20'
			},
			{
				label: 'Handwritten · reused',
				detail: '8 correct on those same 20 challenging receipts.',
				amount: 40,
				value: '8/20'
			}
		],
		alt: 'Ordinary receipt accuracy rises from 72 to 84 percent with reuse, while handwriting remains weak at 35 versus 40 percent.',
		takeaway:
			'The authored comparison supports an improvement on this ordinary cohort, while preserving a serious handwriting gap. It does not demonstrate that transfer solves every condition.',
		question: 'Why would reporting only 84% hide a material deployment issue?',
		answer:
			'It omits the separate handwritten condition where only 8 of 20 cases were correct. The relevant operating population and its difficult segments determine the claim.',
		sourceNote: nativeSource
	},
	{
		id: 'm08-art-origins',
		module: 'M08',
		section: 'rolling-origins',
		kind: 'art',
		image: '/images/visuals/m08-forecast-origin.webp',
		width: 1536,
		height: 1024,
		title: 'Forecast from the information you had',
		lead: 'Advance the origin while keeping the forecast horizon fixed. The available history expands only as time advances.',
		alt: 'Three staggered forecast rows each end an observed-history window at an origin and point forward by the same horizon to a future target.',
		transcript: [
			{
				label: 'Observed history',
				explanation:
					'At each origin, fit or compute the method using observations available by that time. Later realized values cannot enter that earlier forecast.'
			},
			{
				label: 'Origin',
				explanation:
					'The origin is when the forecast is made. Lower rows move this decision point later, creating additional eligible history.'
			},
			{
				label: 'Same horizon',
				explanation:
					'Keep the ahead-distance comparable, such as one month ahead. A three-month-ahead task is a different evaluation question.'
			},
			{
				label: 'Future target',
				explanation:
					'Score the stored forecast once the target outcome becomes observable. That outcome may become history at a later origin, but it was unavailable to the earlier one.'
			}
		],
		takeaway:
			'Rolling evaluation replays the information constraints of deployment. Randomly shuffling future months into training answers a different question.',
		question: 'Can June actual sales be an input to a forecast made at March month-end?',
		answer:
			'No. Unless the task uses a genuinely known value at March, it would leak the future. A planned or separately forecast driver is different and carries its own uncertainty.',
		sourceNote: artSource
	},
	{
		id: 'm08-baselines',
		module: 'M08',
		section: 'patterns-and-baselines',
		afterBlock: 2,
		kind: 'diagram',
		layout: 'bars',
		unit: 'Forecast August collections · USD thousands',
		title: 'Three baselines, one August target',
		lead: 'At July month-end, May–July collections are 120, 130, 150; the previous August was 100.',
		nodes: [
			{
				label: 'Last observed value',
				detail: 'Use July’s observed collections.',
				amount: 150,
				value: '150'
			},
			{
				label: 'Trailing three-month mean',
				detail: 'Average 120, 130, and 150.',
				amount: 133.3333333333,
				value: '133.33'
			},
			{
				label: 'Seasonal naive',
				detail: 'Use the previous August’s collections.',
				amount: 100,
				value: '100'
			}
		],
		alt: 'Three August baseline forecasts are 150, 133.33, and 100 thousand dollars from last value, trailing mean, and seasonal naive respectively.',
		takeaway:
			'The predictions differ because the methods carry different assumptions forward. Their attractive shapes or familiar names do not establish which will win.',
		question: 'Does July’s high value prove that 150 is the best forecast?',
		answer:
			'No. It could reflect a changed level, a one-off receipt, or seasonality. Compare methods on the same relevant past origins and horizons.',
		sourceNote: nativeSource
	},
	{
		id: 'm08-interval-coverage',
		module: 'M08',
		section: 'uncertainty-and-change',
		kind: 'diagram',
		layout: 'compare',
		title: 'An interval meets a different period',
		lead: 'Separate how a band was built from how often it covered later outcomes.',
		nodes: [
			{
				label: 'Calibration',
				detail:
					'Nine of ten earlier absolute errors are at most 12. The nearest-rank 90th-percentile width is 12.',
				value: '9/10 earlier errors'
			},
			{
				label: 'Next forecast band',
				detail: 'Forecast 140; subtract and add the width of 12. Units are USD thousands.',
				value: '128 ← 140 → 152'
			},
			{
				label: 'Later observation',
				detail: 'Later absolute errors 5, 10, 20, 16: only the first two fit within width 12.',
				value: '2/4 covered = 50%'
			}
		],
		alt: 'A calibration sample gives a plus-or-minus 12 band around a forecast of 140, but only two of four later errors fit within that width.',
		takeaway:
			'A historical 90% calibration fraction is not proof of a 90% probability for the next case. A small sample and changed conditions limit what the interval supports.',
		question: 'What should you investigate after the later 50% coverage observation?',
		answer:
			'Check whether the horizon, process, customer mix, or regime changed and whether the earlier sample was adequate. Recalibrate on appropriate development evidence, then assess new later outcomes.',
		sourceNote: nativeSource
	},
	{
		id: 'm09-art-join',
		module: 'M09',
		section: 'join-explosion',
		kind: 'art',
		image: '/images/visuals/m09-join-multiplication.webp',
		width: 1536,
		height: 1024,
		title: 'A join can multiply the money',
		lead: 'Two line records paired with two payment records produce four combinations, not four independent invoices.',
		alt: 'Invoice lines 80 and 40 pair with payments 50 and 70 to create 80/50, 80/70, 40/50, and 40/70. Both joined sums become 240 although both source totals are 120 USD.',
		transcript: [
			{
				label: 'Original invoice lines',
				explanation: 'I-201 has line amounts USD 80 and USD 40, totaling USD 120.'
			},
			{
				label: 'Original payment events',
				explanation:
					'The same invoice has two payment events, USD 50 and USD 70, also totaling USD 120.'
			},
			{
				label: 'Four joined combinations',
				explanation:
					'Joining both child tables directly on invoice ID pairs each of the two lines with each of the two payments: 80/50, 80/70, 40/50, 40/70.'
			},
			{
				label: 'Two corrupted sums',
				explanation:
					'The joined line column sums to 80 + 80 + 40 + 40 = 240. The joined payment column sums to 50 + 70 + 50 + 70 = 240.'
			},
			{
				label: 'Independent source control',
				explanation:
					'Both sums agree with each other but contradict their source totals of USD 120. Aggregate each child table to the intended invoice grain before joining.'
			}
		],
		takeaway:
			'Agreement between two inflated totals is not reconciliation. Check cardinality and compare against independent source records.',
		question: 'Would removing every repeated amount be a safe general repair?',
		answer:
			'No. Distinct legitimate events may share an amount. Repair grain and relationships using stable identities, rather than erasing repeated values indiscriminately.',
		sourceNote: artSource
	},
	{
		id: 'm09-output-grain',
		module: 'M09',
		section: 'query-paths',
		kind: 'diagram',
		layout: 'flow',
		title: 'Preserve the output grain',
		lead: 'The desired result is one row per invoice at September 30, not one row per raw joined event.',
		nodes: [
			{
				label: 'Keep sources separate',
				detail: 'Validate invoice keys and payment-event keys before transformation.',
				value: 'Invoices + events'
			},
			{
				label: 'Filter the cutoff',
				detail: 'Exclude P-04 received October 2 from the September snapshot.',
				value: 'Eligible payments: $180'
			},
			{
				label: 'Group payments',
				detail: 'Sum eligible events by invoice: I-201 120, I-202 60.',
				value: 'One row per invoice key'
			},
			{
				label: 'Join to all invoices',
				detail:
					'Preserve unpaid I-203. In this complete event dataset, absent eligible payments mean zero paid.',
				value: 'Three invoice rows'
			},
			{
				label: 'Reconcile',
				detail:
					'Invoice 400 less eligible payments 180 leaves outstanding 220; inspect row-level allocations too.',
				value: '$400 − $180 = $220'
			}
		],
		alt: 'A preparation flow validates sources, filters payments by cutoff, aggregates to invoice grain, preserves all invoices, and reconciles 400 less 180 to 220.',
		takeaway:
			'A left join preserves the left records but can still multiply rows. Aggregating the right side to one matching row is what protects this invoice-level calculation.',
		question: 'Why must the October payment stay excluded even when you run the report later?',
		answer:
			'The report describes September 30. Including the later event silently changes the as-of question and understates that historical outstanding balance.',
		sourceNote: nativeSource
	},
	{
		id: 'm09-filter-context',
		module: 'M09',
		section: 'power-bi',
		kind: 'diagram',
		layout: 'bars',
		unit: 'USD outstanding at September 30',
		title: 'Different filters, different denominators',
		lead: 'The all-customer bar is the total; Cedar and Juniper are its two parts. Do not add all three bars.',
		nodes: [
			{
				label: 'All customers',
				detail: 'Paid share uses 180 paid / 400 invoiced = 45%.',
				amount: 220,
				value: '$220 outstanding'
			},
			{
				label: 'Cedar selected',
				detail: 'Paid share uses 180 paid / 320 invoiced = 56.25%.',
				amount: 140,
				value: '$140 outstanding'
			},
			{
				label: 'Juniper selected',
				detail: 'Paid share uses 0 paid / 80 invoiced = 0%.',
				amount: 80,
				value: '$80 outstanding'
			}
		],
		alt: 'Outstanding receivables are 220 for all customers, 140 under Cedar, and 80 under Juniper; each filter also changes the paid-share denominator.',
		takeaway:
			'A measure answers the current filtered question. Ratio of totals, 180/400 = 45%, differs from the equally weighted average of invoice percentages, 43.33%.',
		question:
			'Why does Cedar’s paid share exceed the all-customer share even though the paid amount stays 180?',
		answer:
			'Filtering to Cedar reduces the invoiced denominator from 400 to 320. Juniper contributes 80 invoiced and no eligible payment to the all-customer result.',
		sourceNote: nativeSource
	},
	{
		id: 'm10-art-process',
		module: 'M10',
		section: 'process-map',
		kind: 'art',
		image: '/images/visuals/m10-whole-process.webp',
		width: 1536,
		height: 1024,
		title: 'Measure the whole process',
		lead: 'A six-minute drafting improvement becomes a three-minute overall improvement once the other stages are included.',
		alt: 'Current preparation, drafting, review, and correction take 3, 8, 4, and 1 minutes, totaling 16. Proposed stages take 4, 2, 5, and 2 minutes, totaling 13.',
		transcript: [
			{
				label: 'Prepare',
				explanation:
					'Input preparation rises from 3 to 4 minutes per case in the authored proposal.'
			},
			{
				label: 'Draft',
				explanation: 'Drafting falls from 8 to 2 minutes, a saving of 6 minutes at this stage.'
			},
			{
				label: 'Review',
				explanation: 'Review rises from 4 to 5 minutes. This work still belongs in the comparison.'
			},
			{
				label: 'Correct',
				explanation:
					'Correction rises from 1 to 2 minutes. Faster generation does not make correction disappear.'
			},
			{
				label: 'Whole process',
				explanation:
					'The current total is 16 minutes and proposed total is 13: a net saving of 3 minutes per case. These are stated scenario assumptions, not measured pilot results or realized cash savings.'
			}
		],
		takeaway:
			'Measure resources per acceptable completed result across the same case population, including preparation, checking, correction, and exceptions.',
		question:
			'Why would reporting “six minutes saved per case” overstate this proposal’s ordinary-work improvement?',
		answer:
			'It counts only drafting. The other three stages each add one minute, reducing the whole-process saving to three minutes.',
		sourceNote: artSource
	},
	{
		id: 'm10-full-economics',
		module: 'M10',
		section: 'worked-economics',
		kind: 'diagram',
		layout: 'bars',
		unit: 'USD per month under stated assumptions',
		title: 'The economics after all stages',
		lead: 'At 500 cases per month, three minutes released per case equals 25 staff hours.',
		nodes: [
			{
				label: 'Capacity-equivalent value',
				detail: '25 hours at a loaded rate of $60 per hour.',
				amount: 1500,
				value: '$1,500'
			},
			{
				label: 'Recurring operating cost',
				detail: '$700 software/model cost plus $400 maintenance.',
				amount: 1100,
				value: '$1,100'
			},
			{
				label: 'Net capacity-equivalent benefit',
				detail: 'Subtract recurring cost from the valued time released.',
				amount: 400,
				value: '$400'
			}
		],
		alt: 'Monthly valued capacity of 1,500 dollars less recurring cost of 1,100 leaves 400 dollars of net capacity-equivalent benefit.',
		takeaway:
			'Under a stable, realizable $400 monthly benefit, $6,000 setup implies 15-month simple payback. At half the volume, the recurring comparison becomes negative $350 per month.',
		question: 'Can the $1,500 capacity value automatically be booked as cash savings?',
		answer:
			'No. If staffing and other payments do not change, it is released capacity. Explain how it will support growth, improve service, or lead to an actual cost change.',
		sourceNote: nativeSource
	},
	{
		id: 'm10-future-conditions',
		module: 'M10',
		section: 'future',
		kind: 'diagram',
		layout: 'compare',
		title: 'Future capability depends on conditions',
		lead: 'Read these as conditional operating designs, not a predicted adoption timetable.',
		nodes: [
			{
				label: 'Assisted analysis',
				detail:
					'Tools draft and summarize while a person verifies sources, calculations, and decisions.',
				value: 'Needs reliable evidence'
			},
			{
				label: 'Controlled execution',
				detail:
					'A bounded workflow performs allowed steps with validation, recovery, and reviewer authority.',
				value: 'Needs dependable interfaces'
			},
			{
				label: 'Connected finance systems',
				detail:
					'Several components coordinate across records and processes with monitored outcomes and explicit ownership.',
				value: 'Needs system-level evaluation'
			}
		],
		alt: 'Three conditional designs compare assisted analysis, controlled execution, and connected finance systems, each with additional evidence and operating requirements.',
		takeaway:
			'Broader model capability is only one condition. Data access, contracts, evaluation, operating controls, and adoption determine which work can be delegated usefully.',
		question:
			'A model writes more fluent explanations. Does that alone justify allowing it to post ledger entries?',
		answer:
			'No. Fluency does not establish source accuracy, accounting treatment, permissions, recovery behavior, or authorization. Evaluate the actual delegated capability and its effects.',
		sourceNote:
			'Original conditional-scenario diagram based on M10. These are possibilities and prerequisites, not dated predictions or claims of universal current adoption.'
	}
];
