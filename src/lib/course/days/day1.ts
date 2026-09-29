import type { CourseModule } from '../types';

export const day1Modules: CourseModule[] = [
	{
		id: 'M01',
		day: 1,
		title: 'AI history and choosing an approach',
		subtitle: 'Start with the decision your finance team needs to make.',
		minutes: 50,
		prerequisites: [],
		objectives: [
			'Distinguish explicit automation, symbolic reasoning, learned prediction, and generation.',
			'Explain why rules and neural learning developed as overlapping traditions.',
			'Decompose a finance request into inputs, decisions, evidence, and a baseline.'
		],
		why: 'A credible finance professional can explain why a particular technique belongs in a process. That begins before choosing a product or writing a prompt.',
		sections: [
			{
				id: 'a-business-question',
				title: 'A business question before a model name',
				lead: 'Willow & Co. receives invoices, sells goods, and needs reliable decisions.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Imagine joining Willow, a fictional distributor, for a finance transformation engagement. The controller says, “We need AI to reduce the invoice backlog.” That request names a possible technology, but it does not yet identify the problem. Are people copying figures from documents, deciding who should approve them, investigating duplicates, or waiting for evidence that goods arrived? Each activity has a different uncertainty and a different definition of success.',
							'Artificial intelligence is a broad field of building computational systems for tasks associated with intelligence, including recognizing patterns, reasoning with representations, generating language, and selecting actions. It is not one model or one interface. A chat window can sit in front of a language model, a search system, a collection of exact calculations, or a combination. A system can perform one narrow task well while lacking the information needed for the wider business decision.',
							'Separate the desired outcome from the method. “Create a draft invoice record from an image, with every amount checked against the source” is testable. “Make accounts payable intelligent” is not yet testable. You need an input, an output, the person using it, and the consequence of an error. Throughout the course we will return to that structure before adding more sophisticated machinery.'
						]
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'Four events that should not be confused',
						paragraphs: [
							'An invoice requests payment. A goods receipt records delivery or acceptance. An approval authorizes a specified action under company policy. A payment transfers money. These may occur on different dates and be recorded in different systems. A readable invoice does not establish that delivery happened or that payment is authorized.',
							'From Willow’s perspective, amounts owed to suppliers are accounts payable. Amounts customers owe Willow are accounts receivable. Always state whose records you are examining; the same sale creates different perspectives for buyer and seller.'
						]
					}
				]
			},
			{
				id: 'four-mechanisms',
				title: 'Four mechanisms, four kinds of evidence',
				lead: 'Use the same invoice to compare what is specified and what is learned.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Invoice W-418: supplier Northline, USD 6,200, supplier reference NL-091, scanned document.',
						headers: ['Task', 'Mechanism', 'What determines the result', 'How to check it'],
						rows: [
							[
								'Add line amounts',
								'Explicit calculation',
								'A specified arithmetic procedure',
								'Reconcile lines, tax, and total'
							],
							[
								'Require approval above USD 5,000',
								'Rule / symbolic representation',
								'An explicit threshold and policy facts',
								'Test below, at, and above the boundary'
							],
							[
								'Recognize the amount on varied scans',
								'Learned prediction',
								'Parameters fitted from examples',
								'Compare extraction with reviewed source labels'
							],
							[
								'Draft a reviewer explanation',
								'Generation',
								'A model produces a sequence using supplied context',
								'Check every claim, amount, and requested action'
							]
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'A rule says how a result follows from specified facts. In a symbolic system, meaningful entities such as supplier, invoice, and approval can be represented explicitly, and rules or search procedures operate on those representations. Good old-fashioned AI, often called GOFAI, refers broadly to this tradition. It includes more than simple if-statements: representing relationships and searching through possible solutions can be substantial reasoning tasks.',
							'Machine learning instead fits adjustable values from examples. We do not supply every rule needed to recognize “6,200” across blurred images and unfamiliar layouts. We supply a learning method, training examples, and a way to evaluate errors. The fitted model then predicts on new cases. A prediction can be a number, category, or distribution of possibilities. We will inspect exactly how those adjustable values change in M03 and M06.',
							'Generative models produce new content, such as text, images, or code. Modern language generation usually uses learned models, so “machine learning” and “generative AI” are overlapping descriptions, not competing boxes. Producing a plausible reviewer note differs from establishing that its claims are true. The surrounding application can combine a learned extractor, exact arithmetic, a policy rule, and a generated explanation.'
						]
					}
				]
			},
			{
				id: 'history',
				title: 'Two traditions growing together',
				lead: 'History explains why useful systems combine ideas rather than replace them wholesale.',
				blocks: [
					{
						kind: 'table',
						caption:
							'A selective historical spine, not a claim that one invention alone produced today’s systems.',
						headers: ['Period', 'Development', 'Idea to carry forward'],
						rows: [
							[
								'1943',
								'McCulloch and Pitts described simplified computational neurons',
								'Computation can be composed from connected units; these are not biological brains'
							],
							[
								'1956',
								'The Dartmouth summer project helped establish AI as a named field',
								'Intelligence became an explicit research ambition'
							],
							[
								'Late 1950s',
								'Rosenblatt’s perceptron explored learning a classifier from examples',
								'Some parameters can be fitted rather than individually specified'
							],
							[
								'1960s–1980s',
								'Symbolic programs and expert systems encoded knowledge and rules',
								'Explicit representations can support inspectable domain reasoning'
							],
							[
								'1980s onward',
								'Multilayer learning and backpropagation gained renewed prominence',
								'Internal representations can be learned through connected transformations'
							],
							[
								'2010s onward',
								'Data, computing resources, architectures, and training methods enabled broader deep-learning applications',
								'Scale matters alongside objectives, data, design, and evaluation'
							]
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'The early artificial neuron was a simplified computational object, not a miniature human brain. A perceptron learns a linear decision boundary: a straight separator in two dimensions, extended to more dimensions. Its limits helped motivate richer architectures and training methods. A modern neural network inherits the idea of connected computations but can differ enormously in scale, structure, and training.',
							'Expert systems tried to capture specialist knowledge explicitly. For finance, the attraction is familiar: an approval policy can state conditions and consequences. The difficulty is keeping the representation complete and current, especially when real documents or circumstances do not fit the anticipated categories. Learning systems address some pattern-recognition problems, but require suitable examples and can fail on unfamiliar cases.',
							'There is no clean historical handoff where rules disappear and learning takes over. A current application may use learned document recognition and explicit authorization in the same minute. Historical progress also did not eliminate the distinction between an impressive demonstration and dependable operation. You still need to know which conditions were tested and which were absent.'
						]
					}
				]
			},
			{
				id: 'worked-process',
				title: 'Work the backlog into a process',
				lead: 'Decomposition makes a vague request measurable.',
				blocks: [
					{
						kind: 'worked',
						title: 'Three invoices, three different problems',
						problem:
							'Willow has W-418 for USD 6,200; W-419 for USD 420 with a missing goods receipt; and W-420 for USD 6,200 with the same supplier and reference as W-418. The policy requires an additional approver only when the amount is greater than USD 5,000. Design the first review pass.',
						steps: [
							'Read the source documents and preserve their identifiers. If an amount is unclear, record uncertainty rather than treating an extractor’s output as reviewed fact.',
							'Apply the explicit amount rule: W-418 and W-420 need the additional approver; W-419 does not trigger that particular rule. Exactly USD 5,000 would not trigger a “greater than” rule.',
							'Compare supplier and supplier reference. W-418 and W-420 are a potential duplicate pair. Equal amount alone would be weak evidence because legitimate invoices can share amounts.',
							'Keep the missing goods receipt on W-419 visible. Passing the amount rule does not repair missing delivery evidence. Multiple checks answer different questions.',
							'Prepare a review queue showing document links and reasons. A generated explanation may summarize these results, but it cannot turn a missing receipt into an established delivery or authorize a payment.'
						],
						conclusion:
							'The first useful system is a coordinated set of checks. Exact rules handle specified conditions; learned extraction helps with varied inputs; a reviewer resolves evidence and authority.'
					},
					{
						kind: 'reflection',
						prompt:
							'If suppliers begin sending ten unfamiliar layouts, which stage is most directly affected?',
						guidance:
							'Separate reading the document from applying a policy after its fields are known.',
						modelAnswer:
							'The extraction stage needs renewed evaluation on the new layouts. The USD 5,000 approval rule need not change unless policy changes. I would inspect extraction errors, preserve uncertainty, and verify that a wrong extracted amount cannot silently bypass review.'
					}
				]
			},
			{
				id: 'baseline',
				title: 'The baseline is a serious competitor',
				lead: 'Complexity earns its place through evidence.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'A baseline is a simple reference approach. It might be an exact match, a fixed rule, a previous month’s forecast, or the current manual process. It is useful because it gives an improvement claim a denominator. “The model found 80 duplicates” says little if an existing supplier/reference rule found 78 with fewer false alarms and much less review effort.',
							'Define the boundary of measurement. If drafting falls from ten minutes to two but correction rises from one minute to twelve, the whole activity became slower. Count preparation, execution, checking, correction, and exception handling. Time saved also differs from cash savings: released capacity might improve service or absorb growth without removing a payroll cost.',
							'Start small enough that mistakes can be investigated. A suitable pilot might prepare a read-only exception packet for one supplier group. State success criteria before seeing attractive examples: reviewed accuracy, missed exceptions, review minutes, and whether evidence is retained. Later modules will show why selecting only favorable cases produces misleading evaluation.'
						]
					},
					{
						kind: 'compare',
						title: 'Five requests and sensible starting points',
						items: [
							{
								label: 'Compute a reconciled total',
								text: 'Use a tested calculation over validated records. No learning is required to define addition.'
							},
							{
								label: 'Route an amount under an approved policy',
								text: 'Represent the policy explicitly, including currency, dates, exceptions, and authorization.'
							},
							{
								label: 'Predict late payment at invoice issue',
								text: 'Consider learned prediction only after defining the outcome and information available at issue.'
							},
							{
								label: 'Identify similar invoice descriptions',
								text: 'Compare string matching with learned representations; review what similarity means for the decision.'
							},
							{
								label: 'Draft an investigation note',
								text: 'Use generation with evidence and review criteria, preserving uncertainty where sources are incomplete.'
							}
						]
					}
				]
			},
			{
				id: 'decision-memo',
				title: 'Speak clearly about the proposed system',
				lead: 'Describe the computation and the business boundary in ordinary language.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'A strong proposal can be short without being shallow: “We will read invoice fields, calculate totals, apply the current approval policy, and draft an exception packet. Reviewed source documents will be the reference for extraction. The system will prepare information; authorized staff will decide on unresolved exceptions.” That statement exposes the components and gives colleagues something concrete to challenge.',
							'Avoid treating labels as evidence. “AI-powered” does not tell you whether a result was retrieved, calculated, predicted, or generated. Ask what inputs the component saw, what operation it performed, and how you can verify the output. These questions become more valuable as the systems become more sophisticated.',
							'Your first portfolio artifact is a decision table. It will become the scope section of the day-five prototype. Keep the cases that do not fit neatly: missing evidence, new formats, uncertain duplicates, and changed policy. They will eventually become your evaluation cases.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M01-C1',
				objective: 0,
				prompt:
					'A scanner reads a total and a rule routes amounts above USD 5,000. Which change most directly requires reevaluating the learned component?',
				options: [
					'The finance director changes the approval limit to USD 6,000.',
					'A new supplier sends handwritten invoice totals.',
					'The queue is sorted by supplier name.'
				],
				answer: 1,
				rationales: [
					'The explicit policy rule must change; that alone does not require retraining extraction.',
					'The input distribution for recognizing totals changed, so extraction evidence must be renewed.',
					'Sorting known fields is an explicit operation, although its implementation still needs checking.'
				]
			},
			{
				id: 'M01-C2',
				objective: 0,
				prompt:
					'A language model writes “goods received” from an invoice alone. What is the strongest diagnosis?',
				options: [
					'The generated claim exceeds the supplied evidence.',
					'The claim becomes reliable if generation is deterministic.',
					'Invoice extraction and delivery confirmation are the same task.'
				],
				answer: 0,
				rationales: [
					'An invoice does not establish delivery; locate the receipt or label the claim unverified.',
					'Repeating the same output does not provide missing evidence.',
					'Extraction reads a document; delivery confirmation requires a different event or source.'
				]
			},
			{
				id: 'M01-C3',
				objective: 1,
				prompt: 'Why is a combined rule-and-learning system historically unsurprising?',
				options: [
					'Learned models always reproduce explicit rules exactly.',
					'Symbolic and learning traditions developed in parallel and solve different parts of tasks.',
					'Expert systems were simply early large language models.'
				],
				answer: 1,
				rationales: [
					'A learned approximation need not enforce an exact policy.',
					'Representations, rules, and fitted patterns have long coexisted; combining them is a design choice.',
					'Expert systems encoded knowledge differently from modern learned language models.'
				]
			},
			{
				id: 'M01-C4',
				objective: 2,
				prompt:
					'A pilot cuts drafting from 10 to 2 minutes but increases review from 2 to 13 minutes. What follows for this measured activity?',
				options: [
					'It saves eight minutes because drafting is faster.',
					'It takes three minutes longer overall.',
					'It proves the technology cannot help any finance process.'
				],
				answer: 1,
				rationales: [
					'That omits the additional review work.',
					'The baseline is 12 minutes and the pilot is 15, a three-minute increase.',
					'This result applies to the measured workflow and design, not every possible use.'
				]
			},
			{
				id: 'M01-C5',
				objective: 2,
				prompt:
					'An exact supplier/reference rule catches 78 reviewed duplicates and a model catches 80. What is missing before deciding?',
				options: [
					'Only the model’s parameter count.',
					'False alarms, misses, review effort, and comparable case coverage.',
					'A more impressive title for the project.'
				],
				answer: 1,
				rationales: [
					'Size does not establish useful incremental performance.',
					'The two additional catches must be weighed against errors and operational cost on comparable cases.',
					'Naming does not supply evidence about outcomes.'
				]
			},
			{
				id: 'M01-C6',
				objective: 0,
				prompt:
					'The policy says “greater than USD 5,000.” An invoice for exactly USD 5,000 has no receipt. What should the system conclude?',
				options: [
					'Additional amount-based approval is required automatically.',
					'No amount-based trigger, but missing evidence remains a separate exception.',
					'No review is necessary because the amount rule passes.'
				],
				answer: 1,
				rationales: [
					'Exactly equal is not greater than; changing the boundary silently changes the policy.',
					'Different checks answer different questions and should preserve their separate results.',
					'Passing one rule does not establish delivery or overall approval.'
				]
			}
		],
		assignment: {
			title: 'Write the first system decision table',
			scenario:
				'Willow wants to handle 600 supplier invoices a week. Most are digital PDFs; 40 are scans. Its current exact supplier/reference check finds duplicates, but supplier typos sometimes escape. The team also wants reviewer notes.',
			tasks: [
				'Split the request into extraction, arithmetic, matching, policy, and explanation.',
				'Choose a baseline and evidence for each component.',
				'Describe what changes when a new supplier uses unfamiliar handwritten forms.'
			],
			deliverable: 'A five-row decision table and a 150-word pilot proposal.',
			rubric: [
				{
					criterion: 'Decomposition',
					evidence: 'Each row has a defined input, output, and decision.'
				},
				{
					criterion: 'Method choice',
					evidence: 'Rules and learned methods have task-specific reasons.'
				},
				{
					criterion: 'Evaluation',
					evidence: 'Uses reviewed records and measures false alarms, misses, and review effort.'
				},
				{
					criterion: 'Boundary',
					evidence: 'Separates preparation from authorization and handles missing evidence.'
				}
			],
			workedSolution: [
				'Extraction reads fields and keeps links to documents; reviewed transcriptions are its reference. Exact arithmetic reconciles line and total amounts. Matching starts with supplier/reference rules and evaluates fuzzy alternatives for typos. Policy is explicit and versioned. Draft notes summarize actual exceptions with source links.',
				'The pilot compares the current process with the proposed one on the same representative batch, counting preparation, review, and correction time as well as errors. It prepares a review queue rather than releasing payments.',
				'Handwritten forms change extraction conditions. Evaluate them separately, retain uncertain fields, and route ambiguous amounts for review. The policy boundary remains the approved rule unless the policy itself changes.'
			]
		},
		interview: {
			question:
				'Where would you use AI in accounts payable, and where would you use ordinary software?',
			strongAnswer: [
				'I would separate recognizing uncertain input from computing and enforcing explicit requirements. A learned extractor may help with varied invoice layouts; tested calculations handle totals and an explicit policy handles authorization thresholds. A language model can prepare a supported explanation of exceptions.',
				'I would compare each component with the current baseline on representative records, including review effort and missed exceptions. The end-to-end result matters more than an impressive extraction or drafting demo.'
			],
			followUps: [
				{
					question: 'What if the rule-based baseline is already very accurate?',
					answer:
						'Then the incremental use case may be narrow, such as typos or unfamiliar layouts. I would measure whether additional catches justify false alarms, integration, and maintenance.'
				},
				{
					question: 'What would invalidate your pilot conclusion?',
					answer:
						'A nonrepresentative sample, omitted review costs, different policy versions, or a later change in documents could invalidate generalization. I would state the tested population and monitor changes.'
				}
			]
		},
		sources: [
			{
				label: 'Computer History Museum: AI and robotics timeline',
				url: 'https://www.computerhistory.org/timeline/ai-robotics/',
				note: 'Historical overview; this course’s finance examples are fictional.'
			},
			{
				label: 'Rosenblatt: The perceptron (1958)',
				url: 'https://doi.org/10.1037/h0042519',
				note: 'Foundational learning-model paper.'
			}
		]
	},
	{
		id: 'M02',
		day: 1,
		title: 'Financial data, targets, and leakage',
		subtitle: 'Build the table the decision really allows.',
		minutes: 70,
		prerequisites: ['M01'],
		objectives: [
			'Define grain, keys, features, target, and decision time for a finance dataset.',
			'Identify direct, temporal, group, and preprocessing leakage.',
			'Choose and defend a split that resembles the intended deployment.'
		],
		why: 'Many impressive models answer an easier question than the business actually asked. A data contract prevents that mistake before it reaches a dashboard.',
		sections: [
			{
				id: 'name-the-question',
				title: 'Predicting late payment is not finding overdue invoices',
				lead: 'The date of the decision determines what you are allowed to know.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Willow wants to prioritize collections preparation when it issues an invoice. Define the decision precisely: at 09:00 on the issue date, estimate whether the invoice will remain partly unpaid seven days after its contractual due date. That target gives the outcome a horizon and a condition. “Will it be late?” alone leaves ambiguity about partial payment, disputed invoices, weekends, and how late matters.',
							'A feature is information supplied to the model when it predicts. A target is the outcome used to teach or evaluate it. Historical training rows contain targets because time has passed. A new prediction row cannot contain its future outcome. That asymmetry is intentional: learning relates information available earlier to results observed later.',
							'Finding an invoice already overdue on a reporting date is different. You can compare due date with the as-of date and subtract payments recorded by then. That is a calculation over known events, not a prediction of an unknown future. Both tasks may be useful, but their inputs, evaluation, and decisions differ.'
						]
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'Outstanding balance is an as-of amount',
						paragraphs: [
							'For an invoice of USD 1,000, a USD 400 payment received before September 30 leaves USD 600 outstanding at that cutoff, ignoring credits or adjustments for this example. A later USD 600 payment does not make the September 30 balance zero. An as-of report reconstructs the position at a stated time.',
							'Due date comes from agreed terms. Invoice date, posting date, due date, receipt date, and the date a system learned about an event can differ. A feature may be historically true yet unavailable to the operational system at the moment of prediction.'
						]
					}
				]
			},
			{
				id: 'grain-and-keys',
				title: 'What does one row mean?',
				lead: 'A model cannot repair an ambiguous table design.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Small synthetic invoice explanation view. Outcome is measured seven days after due date.',
						headers: [
							'Invoice key',
							'Customer key',
							'Issue date',
							'Due date',
							'USD amount',
							'Paid by outcome cutoff',
							'Late target'
						],
						rows: [
							['I-101', 'C-01', '2026-06-01', '2026-07-01', '1,000', '1,000', 'No'],
							['I-102', 'C-01', '2026-07-01', '2026-07-31', '1,200', '600', 'Yes'],
							['I-103', 'C-02', '2026-07-02', '2026-08-01', '800', '800', 'No'],
							['I-104', 'C-03', '2026-07-03', '2026-08-02', '500', '0', 'Yes']
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'The grain is what one row represents. Here it is one issued invoice, not one customer, payment, or invoice line. The invoice key uniquely identifies that row. A customer key repeats because a customer can have many invoices. A key is an identifier, not automatically a meaningful numerical quantity: customer 102 is not “twice” customer 51.',
							'Separate event tables preserve meaning. A payment table can have several rows for one invoice. If you join payments directly to invoices, the invoice amount repeats. Aggregating those repeated amounts as if they were new invoices creates overstatement. We will work that failure in M09; for now, write down the grain before joining or summing.',
							'A data contract records the grain, keys, allowed values, currency, units, cutoff, target definition, ownership, and exclusions. It also says what an empty value means. Missing credit limit might mean not supplied, not applicable, or a processing failure; it does not necessarily mean zero available credit. Those interpretations can change a model’s behavior and a reviewer’s decision.'
						]
					}
				]
			},
			{
				id: 'availability',
				title: 'Build an availability timeline',
				lead: 'A field can predict beautifully precisely because it contains the future.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Candidate inputs for I-102 at issue on July 1. “Available” means in the authorized operational system by prediction time.',
						headers: ['Candidate feature', 'Known at issue?', 'Reason'],
						rows: [
							['Agreed terms: 30 days', 'Yes', 'Part of the issued transaction'],
							[
								'Customer delay on invoices settled before July 1',
								'Yes, if calculated from that snapshot',
								'Uses earlier completed events'
							],
							['Final settlement date of I-102', 'No', 'Direct future outcome information'],
							[
								'Collections team status updated August 10',
								'No',
								'A later response to payment trouble'
							],
							[
								'Current customer risk rating extracted in September',
								'Not necessarily',
								'May include later experience or a revision'
							],
							[
								'Historical rating stored with July 1 availability timestamp',
								'Potentially',
								'Requires correct version and permitted use'
							]
						]
					},
					{
						kind: 'worked',
						title: 'A subtle leakage field',
						problem:
							'A dataset has a “contact required” flag. The feature looks administrative, but staff set it after an invoice becomes overdue. A model predicts lateness at issue.',
						steps: [
							'Write the decision time: invoice issue.',
							'Trace when and why the flag is created: staff observe overdue behavior and then set it.',
							'The flag can therefore reveal a consequence of the target. Renaming it or removing the payment date does not remove the leak.',
							'Rebuild the feature from a historical snapshot or exclude it. Re-evaluate the entire preparation-and-model pipeline using only allowed information.'
						],
						conclusion:
							'Leakage is a mismatch between the information used in evaluation and the information available for the intended task. It is not restricted to a column explicitly named “answer”.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Some historical outcomes are not yet mature. An invoice issued yesterday cannot have a trustworthy seven-days-after-due target today. Labeling all currently unpaid young invoices “late” creates a different error: the outcome has not had time to happen. Exclude immature outcomes from that training target or use a method designed for censored time-to-event data, which is beyond the core course. Record the decision rather than quietly inventing a label.'
						]
					}
				]
			},
			{
				id: 'splits',
				title: 'The split is a rehearsal of deployment',
				lead: 'Choose the boundary to match the people and periods you will face.',
				blocks: [
					{
						kind: 'compare',
						title: 'Three splits answer different questions',
						items: [
							{
								label: 'Random invoice split',
								text: 'Distributes rows randomly. Useful under suitable independent, stable sampling assumptions, but customers and future patterns may appear on both sides.'
							},
							{
								label: 'Customer group split',
								text: 'Keeps every invoice for a customer on one side. Helps estimate performance on unseen customers when that is the actual deployment question.'
							},
							{
								label: 'Chronological split',
								text: 'Fits on earlier information and evaluates later invoices. Appropriate for a future deployment question, with feature and label availability checked at each cutoff.'
							}
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'Suppose Willow will score next month’s invoices from existing customers. A chronological test is important, but banning every existing customer from it might answer an unnecessarily different question. Suppose instead Willow is entering a new customer segment. A group or segment holdout becomes directly relevant. There is no universally best split percentage or single split that answers every deployment question.',
							'Repeated entities create dependence: ten invoices from one customer are not ten completely independent experiences of ten businesses. A model may memorize customer-specific behavior, and a random split can make that behavior available on both sides. That is not automatically forbidden if deployment truly concerns the same customers, but the resulting claim must be correspondingly narrow.',
							'Combine constraints when necessary. You might train on earlier invoices from allowed customers and test on later invoices from newly acquired customers. A harder score is useful if it represents the real challenge. Record what population is covered and what is absent; a model evaluated only on one currency or one business unit has not demonstrated equivalent behavior everywhere.'
						]
					}
				]
			},
			{
				id: 'preprocessing',
				title: 'Preparation can learn too',
				lead: 'Averages, scales, and selected features can smuggle in held-out information.',
				blocks: [
					{
						kind: 'worked',
						title: 'A replacement value that has seen the future',
						problem:
							'Training invoice amounts are USD 100, USD 200, and one missing value. A later evaluation invoice is USD 900. For this teaching example, replace missing amounts with the mean of observed training amounts.',
						steps: [
							'Using only training observations gives a replacement of USD 150: (100 + 200) / 2.',
							'Including the later USD 900 changes the replacement to USD 400: (100 + 200 + 900) / 3.',
							'Even if you never use the later target label, evaluation information has influenced the prepared training rows. The historical procedure now differs from what could have been fitted earlier.',
							'Store the USD 150 training replacement and apply it unchanged to later missing values. In real finance work, first investigate why a required amount is missing; mean replacement may be unsuitable for the business field.'
						],
						conclusion:
							'The example teaches split isolation, not a recommendation to invent invoice amounts. Some missing fields should cause rejection or review instead of imputation.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Imputation means replacing a missing value according to a chosen method. Scaling changes numeric inputs to comparable units, such as using a training mean and spread. Feature selection chooses which inputs to retain. If these methods estimate anything from data, fit them on training data and apply the stored result to validation and test. In repeated evaluation, fit them separately inside each training fold.',
							'A pipeline packages preparation and prediction so the same sequence is fitted and applied consistently. It does not guarantee that the sequence is appropriate; a perfectly packaged future-only field still leaks. Inspect both the software boundary and the business availability of every input. Preserve raw records so you can reconstruct how a prepared value was obtained.'
						]
					}
				]
			},
			{
				id: 'contract',
				title: 'Make the modeling table reviewable',
				lead: 'Your data contract is a professional deliverable, not administrative overhead.',
				blocks: [
					{
						kind: 'steps',
						title: 'A reproducible issue-date table',
						steps: [
							{
								title: 'Declare the row',
								text: 'One invoice at issue, with an immutable invoice key and customer key.'
							},
							{
								title: 'Freeze the available inputs',
								text: 'Use source versions and availability timestamps valid at issue; create past-history features using only earlier events.'
							},
							{
								title: 'Wait for the defined outcome',
								text: 'Record whether any amount remains unpaid seven days after due date, handling credits and disputes according to declared rules.'
							},
							{
								title: 'Partition for the real use',
								text: 'Separate earlier/later periods and, where required, customer groups before fitting learned preparation.'
							},
							{
								title: 'Reconcile and document exclusions',
								text: 'Count invoices, unique keys, amounts, missing fields, and excluded immature outcomes. Explain differences from source totals.'
							}
						]
					},
					{
						kind: 'reflection',
						prompt:
							'A manager says the model improved after adding “current balance” from today’s ledger. What would you investigate first?',
						guidance:
							'Ask which moment the prediction is supposed to represent and how the balance was reconstructed.',
						modelAnswer:
							'For issue-date predictions, today’s balance includes later payments and may directly expose the outcome. I would trace the balance’s availability date and reconstruct the issue-date value or exclude the field. If the actual task is prioritizing currently outstanding invoices today, current balance may be appropriate, but that is a different target and evaluation design.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Keep this contract. In M08 it will protect a forecast from future drivers; in M16 it becomes document-version discipline; in M22 it helps identify drift and evaluation contamination. The recurring question is the same: what did the system know when it made the decision?'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M02-C1',
				objective: 0,
				prompt:
					'An invoice has three line items and two payments. What should “one row per invoice at issue” contain?',
				options: [
					'Six rows so every line/payment pair is represented.',
					'One row with invoice-level features available at issue.',
					'Two rows with the final remaining balance repeated.'
				],
				answer: 1,
				rationales: [
					'That is a joined-pair grain and can multiply amounts.',
					'The declared grain is one issued invoice; aggregate or relate child data appropriately.',
					'Payment events and future balance violate the stated grain/time boundary.'
				]
			},
			{
				id: 'M02-C2',
				objective: 1,
				prompt: 'Which field most subtly leaks into an issue-date late-payment model?',
				options: [
					'Terms agreed before issue.',
					'A historical customer rating version stored at issue.',
					'A collector-priority status assigned after the invoice becomes overdue.'
				],
				answer: 2,
				rationales: [
					'This can be available at the decision time.',
					'This may be appropriate if the stored version truly predates prediction.',
					'It reflects later trouble and is unavailable at issue, even without an explicit payment date.'
				]
			},
			{
				id: 'M02-C3',
				objective: 2,
				prompt:
					'Willow will score future invoices for both existing and newly acquired customers. Which evidence is most informative?',
				options: [
					'One random split and no customer breakdown.',
					'A time-based evaluation with separate results for existing and new customers.',
					'Training accuracy because customer IDs are available.'
				],
				answer: 1,
				rationales: [
					'It may mix future patterns and hide weak new-customer performance.',
					'It matches the temporal task and makes the differing customer conditions visible.',
					'Availability of IDs does not establish future performance.'
				]
			},
			{
				id: 'M02-C4',
				objective: 1,
				prompt:
					'A scaler learns its mean from all rows before splitting. Labels are excluded. Is evaluation clean?',
				options: [
					'Yes, only labels can leak.',
					'No, held-out input information influenced preparation.',
					'Yes, if the model is small.'
				],
				answer: 1,
				rationales: [
					'Input distributions can influence fitted transformations even without labels.',
					'Fit the scaler using training inputs, then apply it to held-out rows.',
					'Model size does not repair an invalid evaluation procedure.'
				]
			},
			{
				id: 'M02-C5',
				objective: 0,
				prompt:
					'A USD 1,000 invoice has USD 400 paid by September 30 and USD 600 paid October 4. What is outstanding at September 30 in this simplified case?',
				options: [
					'USD 0 because it eventually settled.',
					'USD 600.',
					'USD 1,000 because partial payments do not count.'
				],
				answer: 1,
				rationales: [
					'The later payment must not change an earlier snapshot.',
					'The amount is 1,000 less the 400 received by the cutoff.',
					'Partial payments reduce the balance unless a different declared accounting treatment applies.'
				]
			},
			{
				id: 'M02-C6',
				objective: 1,
				prompt:
					'Today’s training extract labels yesterday’s invoices late because they are still unpaid. Their terms are net 30 and the target is unpaid seven days after due date. What is wrong?',
				options: [
					'Their target outcomes have not matured.',
					'The labels are valid because payment is missing today.',
					'Only the model’s threshold needs adjustment.'
				],
				answer: 0,
				rationales: [
					'The observation window has not elapsed; exclude or appropriately model incomplete outcomes.',
					'Unpaid today is not the defined future outcome.',
					'The error is in target construction, before threshold choice.'
				]
			}
		],
		assignment: {
			title: 'Repair an attractive but impossible model',
			scenario:
				'A colleague predicts lateness at issue using final settlement date, invoice amount, current customer rating, collector notes, and customer history calculated over the full year. They randomly split invoices and report excellent performance.',
			tasks: [
				'Write the exact grain, target, cutoff, and outcome-maturity rule.',
				'Classify each feature as allowed, excluded, or requiring historical reconstruction.',
				'Design a split for next-quarter invoices and explain how new customers will be assessed.'
			],
			deliverable: 'A data contract and a corrected feature table with exclusion reasons.',
			rubric: [
				{ criterion: 'Decision time', evidence: 'The available information is frozen at issue.' },
				{
					criterion: 'Target',
					evidence: 'Late outcome, partial payments, and maturity are explicit.'
				},
				{
					criterion: 'Leakage diagnosis',
					evidence: 'Explains downstream notes, ratings, and whole-year history.'
				},
				{
					criterion: 'Evaluation',
					evidence: 'Uses future periods and distinguishes customer conditions.'
				}
			],
			workedSolution: [
				'Use one row per issued invoice. Define late as a positive outstanding amount seven days after contractual due date, with declared treatment of credits/disputes. Exclude outcomes whose observation window has not elapsed.',
				'Invoice amount is allowed if available at issue. Final settlement date is excluded. Current rating requires its historical issue-date version. Collector notes written later are excluded; earlier customer-level notes require availability and permitted-use review. Whole-year history must be recomputed from events available before each issue.',
				'Train preparation and the model on earlier mature cases, choose settings on a later validation period, and reserve a subsequent final period. Report existing/new customer performance separately and use an additional group holdout if new-customer generalization is a key claim. Reconcile counts and amounts before and after exclusions.'
			]
		},
		interview: {
			question:
				'Your invoice model performs extremely well offline but poorly after launch. Where do you begin?',
			strongAnswer: [
				'I would first compare the evaluation task with the actual decision time. I would trace whether each field and transformation was available then, particularly post-outcome collection status, revised ratings, and customer-history aggregates. I would also check whether the split mixed future periods or repeated customers in a misleading way.',
				'I would reconstruct a reproducible historical snapshot, fit preparation only on training data, and evaluate on later cases that resemble deployment. I would inspect outcome maturity and changes in the customer population before concluding that a larger model is needed.'
			],
			followUps: [
				{
					question: 'Is a customer ID always leakage?',
					answer:
						'No. It may be known and useful for future invoices of existing customers. It cannot establish performance on new customers, and evaluation must reflect that difference.'
				},
				{
					question: 'Can data leak without target labels?',
					answer:
						'Yes. Fitting imputation, scaling, feature selection, or representations on held-out information can influence the trained procedure. The seriousness depends on the stated learning setting, which must be explicit.'
				}
			]
		},
		sources: [
			{
				label: 'scikit-learn: common pitfalls and data leakage',
				url: 'https://scikit-learn.org/stable/common_pitfalls.html',
				note: 'Preparation and evaluation isolation; examples here are original synthetic finance cases.'
			},
			{
				label: 'Google Machine Learning Crash Course',
				url: 'https://developers.google.com/machine-learning/crash-course',
				note: 'Features, labels, datasets, and generalization foundations.'
			}
		]
	},
	{
		id: 'M03',
		day: 1,
		title: 'How training changes a model',
		subtitle: 'Watch predictions, errors, and parameters change together.',
		minutes: 75,
		prerequisites: ['M02'],
		objectives: [
			'Trace prediction, residual, loss, and an actual parameter update.',
			'Distinguish fitted parameters from selected hyperparameters.',
			'Choose an error measure and baseline that fit a financial decision.'
		],
		why: 'Training becomes understandable when you can inspect one change and its consequences. That understanding will carry from simple regression to neural networks and language models.',
		sections: [
			{
				id: 'predicting-a-number',
				title: 'A model is a calculation with adjustable parts',
				lead: 'Start with a cost estimate you could write in a spreadsheet.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Willow wants to estimate daily invoice-handling cost for staffing analysis. Start with a deliberately small model: a fixed amount plus a variable amount for each hundred invoices processed. If the fixed amount is USD 20 and the variable amount is USD 10, a day with 200 invoices is predicted to cost USD 40. The calculation uses two hundreds, not 200 individual units. Units are part of the model definition.',
							'The fixed and variable amounts are parameters: adjustable values inside the computation. Choosing their values from observed examples is training. Using their current values to produce a prediction is inference. An architecture or model form specifies which calculations are possible; parameters select one particular calculation within that form.',
							'A linear model assumes that an additional hundred invoices changes the prediction by the same amount everywhere in its fitted range. It is a useful starting approximation, not an accounting law. Overtime thresholds, batch processing, and different document complexity can break that assumption. A model’s simplicity is valuable when its errors remain acceptable for the decision.'
						]
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'Fixed and variable cost are modeling descriptions',
						paragraphs: [
							'A fixed cost is approximately unchanged over a stated activity range and time horizon. A variable cost changes with activity under the chosen model. Salaries, software, and overtime may behave differently over a day, a year, or a major expansion. Calling a cost fixed does not mean it can never change.',
							'Here the amounts are synthetic teaching data in USD per day. We are estimating an operational cost, not deciding its financial-statement classification.'
						]
					}
				]
			},
			{
				id: 'error-and-loss',
				title: 'Make every error visible',
				lead: 'A residual says how far one prediction missed; loss summarizes an objective.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Initial parameters: fixed USD 20; variable USD 10 per hundred invoices. Residual means prediction minus actual throughout this module.',
						headers: [
							'Hundreds of invoices',
							'Actual cost USD',
							'Prediction USD',
							'Residual USD',
							'Squared residual'
						],
						rows: [
							['0', '20', '20', '0', '0'],
							['1', '40', '30', '−10', '100'],
							['2', '60', '40', '−20', '400']
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'A negative residual here means underprediction. Some tools use actual minus prediction instead; neither convention is inherently wrong, but changing convention halfway through an analysis is. Adding signed residuals can conceal offsetting errors. An overestimate of USD 10 and an underestimate of USD 10 sum to zero without either prediction being correct.',
							'Mean absolute error, or MAE, ignores direction and averages the size of the misses. In the table it is (0 + 10 + 20) / 3 = USD 10. Mean squared error, or MSE, squares each residual before averaging: (0 + 100 + 400) / 3 = 166.67 squared dollars. Squaring makes large misses contribute disproportionately. Root mean squared error, RMSE, takes the square root so the result is back in dollars; here it is about USD 12.91.',
							'Loss is the objective the training procedure tries to reduce. A displayed business metric need not be the same calculation. We might train with squared error because its mathematical properties are convenient and still report MAE, directional bias, and large misses to the finance team. Always name what improved: lower training loss is a statement about these data and this objective.'
						]
					}
				]
			},
			{
				id: 'one-update',
				title: 'One update, inspected completely',
				lead: 'The direction comes from sensitivity; the learning rate controls the step.',
				blocks: [
					{
						kind: 'worked',
						title: 'Move the variable amount from 10 to 15',
						problem:
							'Use the three rows above. Hold the fixed parameter at USD 20 for this first update, and train the variable parameter using mean squared error.',
						steps: [
							'At variable amount 10, both nonzero-volume rows are underpredicted. Increasing the variable amount raises their predictions, with twice as much effect on the two-hundred row as on the one-hundred row.',
							'The computed local sensitivity of mean squared error to this parameter is −33.33 at this starting point. A negative sensitivity means a small increase in the parameter decreases loss nearby. This sensitivity is called a gradient component.',
							'Use a learning rate of 0.15. Gradient descent subtracts learning rate times the gradient: subtracting 0.15 × −33.33 adds approximately 5. The variable amount becomes 15. The fixed amount remains 20 because this demonstration deliberately held it fixed.',
							'Recompute predictions: 20, 35, and 50. Residuals are 0, −5, and −10. MSE becomes (0 + 25 + 100) / 3 = 41.67. MAE becomes USD 5.',
							'The update improved the chosen training objective. It has not yet established performance on a new day, a new document mix, or a new cost regime.'
						],
						conclusion:
							'Training is a repeated sequence of computation, error measurement, and parameter change. You can audit every part without manually differentiating an equation.'
					},
					{
						kind: 'callout',
						tone: 'mechanism',
						title: 'What the gradient is doing',
						paragraphs: [
							'The gradient tells the optimizer how sensitive the current loss is to small changes in each parameter. Gradient descent uses that local information to propose a step. It does not directly know the globally best setting, and a direction that helps nearby may stop helping if the step is too large.',
							'For this simple squared-error line, the variable-parameter sensitivity is computed from each residual multiplied by its input, averaged and doubled. You need not memorize the formula; connect its meaning to the fact that changing the variable amount affects high-volume predictions more.'
						]
					}
				]
			},
			{
				id: 'controls',
				title: 'Parameters, hyperparameters, and iterations',
				lead: 'Do not confuse what the model learns with how you choose to train it.',
				blocks: [
					{
						kind: 'compare',
						title: 'Different kinds of settings',
						items: [
							{
								label: 'Parameter',
								text: 'The fitted fixed or variable amount. The optimizer changes it using training examples.'
							},
							{
								label: 'Hyperparameter',
								text: 'A chosen setting such as learning rate or model complexity. Validation evidence can help select it.'
							},
							{
								label: 'Iteration',
								text: 'One optimization update. A batch is the examples used for an update; an epoch is a pass through the training dataset.'
							},
							{
								label: 'Seed',
								text: 'A setting controlling a reproducible pseudorandom sequence, such as initialization or sampling. It is not a guarantee that all hardware produces bit-identical results.'
							}
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'A very small learning rate may improve loss so slowly that a short run appears stuck. A very large rate can jump across useful settings, oscillate, or produce unstable values. More iterations cannot automatically repair an unsuitable rate. Inspect the trajectory, not just its final number. If a run fails, a visible failure is more informative than silently substituting an unrelated prediction.',
							'When several parameters change together, one can partly compensate for another. A higher fixed amount and lower variable amount may fit a narrow range of volumes similarly. More varied observations can help identify the relationship, but only if they represent the process you intend to predict. Adding repeated copies of the same narrow examples does not supply new coverage.',
							'Changing a slider for an input is not training. It asks the current model a different question. Changing a parameter manually is an intervention in the model, but it is not evidence that a learning algorithm found that value. In the lab, distinguish your chosen configuration, the optimizer’s updates, and the predictions made using the current snapshot.'
						]
					},
					{
						kind: 'lab',
						id: 'training',
						title: 'Inspect a real training run',
						task: 'Run the small regression experiment. Its synthetic customer records relate opening receivables to next-month collections in USD thousands. This differs from the worked processing-cost example, but uses the same slope, intercept, residual, and update mechanism. Compare a cautious learning rate with a larger one from the same starting state. Inspect initial and later predictions and the loss trace.',
						prediction:
							'Which run will initially improve faster, and what evidence would tell you the step size is too large?',
						evidence: [
							'Record starting parameters, learning rate, and step count.',
							'Compare residuals and loss before and after an update.',
							'Explain one parameter movement using the direction of the errors.'
						],
						limitation:
							'This small synthetic problem illustrates optimization. Its training loss is not evidence about Willow’s actual costs or future performance.'
					}
				]
			},
			{
				id: 'loss-and-decision',
				title: 'The objective decides which mistakes matter',
				lead: 'A mathematical improvement can still be a poor operational tradeoff.',
				blocks: [
					{
						kind: 'worked',
						title: 'One large miss changes the comparison',
						problem:
							'Model A has absolute errors of USD 2, 2, 2, and 20. Model B has errors of USD 7 on each of four cases. Compare the objectives.',
						steps: [
							'A has MAE (2 + 2 + 2 + 20) / 4 = USD 6.50; B has MAE USD 7.',
							'A has MSE (4 + 4 + 4 + 400) / 4 = 103; B has MSE 49.',
							'MAE prefers A while squared error prefers B. Neither calculation is mistaken; they emphasize errors differently.',
							'If the large miss causes a serious capacity shortfall, investigate it explicitly. If underestimation costs more than overestimation, an unsigned symmetric metric alone does not describe the decision.'
						],
						conclusion:
							'Choose metrics with the business consequences in view, and inspect case-level failures instead of selecting whichever aggregate favors your model.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Include a baseline, such as predicting the historical average or using a simple fixed-plus-variable rule already accepted by the team. Compare all candidates on the same held-out cases with the same units and outcomes. A sophisticated fit that barely beats a simple baseline may not justify maintenance or interpretability costs.',
							'Outliers deserve investigation, not automatic deletion. A large handling cost may be a genuine complicated day, a unit error, or a one-off event outside the intended scope. Removing it because it makes the chart unattractive biases the evaluation. Document a business reason for exclusion and report what population the conclusion now covers.'
						]
					}
				]
			},
			{
				id: 'handoff',
				title: 'What an annotated training trace should say',
				lead: 'Explain what changed, what improved, and what remains untested.',
				blocks: [
					{
						kind: 'reflection',
						prompt:
							'After 200 updates the training loss is close to zero. Your manager calls the model ready. How do you respond?',
						guidance: 'Use this module’s mechanism and the next module’s question about new cases.',
						modelAnswer:
							'The optimizer has fitted the training examples well under the chosen loss. I would inspect whether the fit reflects a sensible relationship, compare with a baseline, and evaluate independently on representative new cases. Near-zero training error can arise from memorizing noise or using leaked inputs; it is not a launch criterion by itself.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Your trace should name the model form, input units, initial parameters, objective, update settings, observed changes, and remaining uncertainty. M04 takes that final uncertainty seriously: a model exists to help with cases it has not already fitted.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M03-C1',
				objective: 0,
				prompt:
					'With fixed cost 20 and variable cost 15 per hundred invoices, what prediction is made for 300 invoices?',
				options: ['USD 65.', 'USD 4,520.', 'USD 45.'],
				answer: 0,
				rationales: [
					'Three hundreds contribute 3 × 15 = 45, plus 20 fixed.',
					'This treats individual invoices as hundreds and breaks the input units.',
					'This omits the fixed component.'
				]
			},
			{
				id: 'M03-C2',
				objective: 0,
				prompt: 'Predictions are 90 and 110 while both actual values are 100. What is MAE?',
				options: [
					'USD 0 because the signed errors cancel.',
					'USD 10.',
					'USD 20 because both errors are added without averaging.'
				],
				answer: 1,
				rationales: [
					'Cancellation describes mean signed error, not error magnitude.',
					'The absolute errors are 10 and 10, averaging 10.',
					'That is the sum of absolute errors, not their mean.'
				]
			},
			{
				id: 'M03-C3',
				objective: 1,
				prompt: 'Which is a hyperparameter in the worked training example?',
				options: [
					'The current variable-cost estimate.',
					'The chosen learning rate.',
					'The actual handling cost recorded for a day.'
				],
				answer: 1,
				rationales: [
					'The optimizer fits this parameter.',
					'It controls the update procedure and is chosen outside the parameter-fitting step.',
					'That is a target observation, not a training setting.'
				]
			},
			{
				id: 'M03-C4',
				objective: 0,
				prompt:
					'You increase invoice volume while keeping all fitted values unchanged. What happened?',
				options: [
					'An inference input changed.',
					'The model was retrained.',
					'Its validation set became training data.'
				],
				answer: 0,
				rationales: [
					'The same fitted computation is being evaluated for a new input.',
					'Training requires parameter updates driven by an objective and data.',
					'No split changed merely because the input changed.'
				]
			},
			{
				id: 'M03-C5',
				objective: 2,
				prompt:
					'A model has lower MAE but occasionally makes much larger misses than its competitor. What is the strongest next step?',
				options: [
					'Ignore the misses because MAE already chose a winner.',
					'Inspect large misses and compare their business consequences alongside other metrics.',
					'Delete those cases from both datasets.'
				],
				answer: 1,
				rationales: [
					'An aggregate does not capture every consequence relevant to the decision.',
					'Different metrics emphasize different error patterns; investigate the operational tradeoff.',
					'Exclusion needs a defensible scope or data-quality reason, not convenience.'
				]
			},
			{
				id: 'M03-C6',
				objective: 0,
				prompt:
					'Loss rises sharply and oscillates after increasing learning rate. What does this most directly suggest?',
				options: [
					'The optimizer’s steps may be too large near the current settings.',
					'The training labels must all be wrong.',
					'The model has proved it generalizes poorly.'
				],
				answer: 0,
				rationales: [
					'Overshoot is a plausible optimization diagnosis to test by restoring a smaller rate.',
					'Label errors are possible but not established by this observation alone.',
					'This is training behavior; generalization requires independent cases.'
				]
			}
		],
		assignment: {
			title: 'Explain a training update to the controller',
			scenario:
				'Use the worked three-row cost dataset. Initial predictions are 20, 30, and 40 against actual 20, 40, and 60. A later snapshot predicts 20, 35, and 50. The fixed parameter stayed at 20.',
			tasks: [
				'Calculate residuals and MAE for both snapshots.',
				'Infer the variable parameter in each snapshot and explain the direction of its movement.',
				'State what further evidence is needed and how an expensive underprediction would affect your evaluation.'
			],
			deliverable: 'An annotated three-row trace and a short decision note.',
			rubric: [
				{ criterion: 'Arithmetic', evidence: 'Consistent residual signs, units, and averages.' },
				{
					criterion: 'Mechanism',
					evidence: 'Connects parameter movement with changed predictions.'
				},
				{
					criterion: 'Evidence boundary',
					evidence: 'Does not equate lower training loss with readiness.'
				},
				{ criterion: 'Decision', evidence: 'Considers asymmetric consequences and a baseline.' }
			],
			workedSolution: [
				'Initial residuals are 0, −10, −20, with MAE USD 10. Later residuals are 0, −5, −10, with MAE USD 5. The variable amount rose from 10 to 15 per hundred invoices.',
				'The positive-volume predictions were too low, so increasing that parameter improved these cases while leaving the zero-volume prediction unchanged. MSE fell from 166.67 to 41.67.',
				'Evaluate on independent representative days and compare with the existing rule. Report directional bias and severe underestimates if they create staffing shortages; a symmetric average alone may not fit the decision.'
			]
		},
		interview: {
			question: 'Explain gradient descent without relying on a formula.',
			strongAnswer: [
				'A model makes predictions using its current adjustable values. We compare those predictions with known outcomes and summarize the errors in a loss. The gradient measures how small parameter changes would affect that loss locally, and an optimizer uses that information to take an update of a chosen size. Repeating the process can improve the fit.',
				'I would inspect the trajectory because large steps can overshoot and a low training loss does not guarantee good future predictions. I would choose the objective with the business consequences in view and reserve separate data for model selection and final evaluation.'
			],
			followUps: [
				{
					question: 'Is the learning rate learned in the same way as the regression slope?',
					answer:
						'Ordinarily the optimizer fits the slope while the learning rate is a selected training setting. It may follow a schedule or be adapted by an algorithm, but it is a different role from the predictive parameters.'
				},
				{
					question: 'Why not always minimize absolute dollar error?',
					answer:
						'It is interpretable, but the decision may penalize large misses or underprediction differently. I would choose training and reporting metrics deliberately and inspect cases, rather than assume one metric captures every consequence.'
				}
			]
		},
		sources: [
			{
				label: 'Google: gradient descent',
				url: 'https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent',
				note: 'Optimization mechanism; numerical cost trace is original.'
			},
			{
				label: 'Google: loss',
				url: 'https://developers.google.com/machine-learning/crash-course/linear-regression/loss',
				note: 'Contrasts absolute and squared error.'
			}
		]
	},
	{
		id: 'M04',
		day: 1,
		title: 'Generalization and independent evidence',
		subtitle: 'Choose a model before asking the final cases for an answer.',
		minutes: 75,
		prerequisites: ['M03'],
		objectives: [
			'Distinguish training, validation, and final test evidence.',
			'Diagnose underfitting, overfitting, and distribution mismatch.',
			'Explain regularization, early stopping, and the limits of a single evaluation score.'
		],
		why: 'The purpose of a model is to handle cases beyond its fitted examples. A convincing demonstration needs evidence that survives your own selection process.',
		sections: [
			{
				id: 'new-cases',
				title: 'The familiar cases are not the destination',
				lead: 'The model’s job begins where training ends.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Suppose a model predicts handling costs perfectly for twelve historical days. Those days helped choose its parameters, so the score answers a narrow question: how well did the fitted computation reproduce its examples? Generalization concerns performance on new cases from the population or conditions we care about. A model can reproduce examples by learning a useful relationship, memorizing accidental detail, or exploiting leaked information.',
							'Split the responsibilities. Training data fit parameters. Validation data help compare model families and hyperparameters, choose stopping points, and refine the procedure. A final test set estimates performance after those choices are frozen. These names describe how evidence is used, not an intrinsic property of a file.',
							'If you inspect test errors and change the model because of them, those cases have influenced selection. They have become development evidence. That can be a sensible way to improve the model, but the resulting score is no longer an independent final estimate. A new final assessment must reflect the changed procedure without repeatedly guiding its design.'
						]
					},
					{
						kind: 'callout',
						tone: 'mechanism',
						title: 'What “independent” means here',
						paragraphs: [
							'The final cases should not influence fitting or selection, and their sampling must support the intended claim. Independence is not achieved merely by giving another CSV file a different name. Duplicate records, future-derived features, and shared preparation can cross the boundary.',
							'Client-side hidden cases in this course are an instructional commitment device, not secure exam proctoring. The purpose is to practice honest evidence use.'
						]
					}
				]
			},
			{
				id: 'three-fits',
				title: 'Too rigid, too eager, and useful enough',
				lead: 'Fit quality is a pattern across datasets, not a label attached to complexity.',
				blocks: [
					{
						kind: 'table',
						caption:
							'Illustrative worked comparison on identical cost cases. MAE is in USD; values are authored for interpretation, not measured lab output.',
						headers: ['Candidate', 'Training MAE', 'Validation MAE', 'Final MAE after commitment'],
						rows: [
							['Very rigid model', '18', '19', '20'],
							['Moderate flexibility', '5', '7', '8'],
							['Highly flexible model', '0.5', '16', '17']
						]
					},
					{
						kind: 'prose',
						paragraphs: [
							'The rigid model misses both familiar and new cases. If the data and labels are suitable, this suggests underfitting: the procedure does not capture enough of the relevant relationship. Adding more similar examples alone may not fix a form that cannot represent the pattern. Better features, a more suitable model, or improved optimization may help.',
							'The highly flexible model fits the training cases exceptionally well but fares much worse on validation. This is a familiar overfitting pattern: the selected computation has adapted to details that do not carry over. Training examples include useful signal and incidental noise. Extra flexibility can reproduce both.',
							'The moderate model is preferable in this example because validation error is lower, despite worse training error than the flexible model. That is not a universal instruction to choose the middle option. A complex model can generalize well with appropriate data and training, and a simple model can fail badly. The evidence and the deployment question decide.',
							'Bias and variance provide another lens. A rigid family may have systematic error because its assumptions are too restrictive. A sensitive fitting procedure may change greatly when trained on a different sample. These are tendencies to investigate, not quantities you can reliably infer from one tiny split. Noise in the outcome can also impose an error floor.'
						]
					}
				]
			},
			{
				id: 'regularization',
				title: 'Constrain how eagerly the model fits',
				lead: 'Regularization changes the preference among possible fits.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Regularization favors some solutions over others beyond fitting the observed targets. A common penalty discourages large parameter values. In a polynomial regression, for example, a very wiggly fit can rely on large coefficients that chase individual observations. Penalizing coefficients can produce a smoother relationship, sometimes accepting more training error for better validation behavior.',
							'The strength of the penalty is a hyperparameter. Too little may leave overfitting; too much can make predictions overly rigid. Input scaling matters because a coefficient’s magnitude depends on its units. A large coefficient for values measured in millions is not directly comparable with one for values measured in single dollars. The fitting and preparation procedure must be evaluated together.',
							'Early stopping is a related practical control. During iterative training, training loss may keep falling while validation loss begins rising. Save the model snapshot that performed best under the declared validation criterion rather than automatically keeping the latest one. The stopping choice uses validation evidence. Looking at test loss after every update and selecting the best test moment would use the final set for tuning.',
							'Other controls include reducing model complexity, collecting representative data, or improving labels. Regularization is not a substitute for correcting leakage, wrong units, or a deployment population absent from training. First diagnose the failure instead of reaching for the same remedy in every case.'
						]
					},
					{
						kind: 'worked',
						title: 'Choose a stopping point',
						problem:
							'After 20, 50, and 100 updates, training loss is 12, 6, and 3. Validation loss is 14, 9, and 13. A final test has not been viewed.',
						steps: [
							'Training improves at every displayed point.',
							'Validation improves until update 50, then worsens. Under this declared criterion, retain the update-50 snapshot.',
							'Do not report update-100 training loss as evidence that update 100 is best.',
							'Evaluate the selected snapshot once on the final set, preserving the configuration and selection rationale.'
						],
						conclusion:
							'The training objective guides parameter fitting; validation guides the choice among fitted snapshots.'
					}
				]
			},
			{
				id: 'shift',
				title: 'Sometimes the world changed',
				lead: 'A model can fit well and still meet a different population.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Willow adds overseas suppliers whose documents and payment terms differ from the historical domestic sample. A model trained on domestic invoices may have no basis for that new region. This distribution shift is different from simply fitting too much noise. Increasing a penalty may make the model smoother without giving it the missing relationships.',
							'Check errors by meaningful groups and periods. A satisfactory average can hide poor performance on the newly important cases. Also inspect whether the inputs changed, the target relationship changed, or the measurement process changed. A new billing platform might alter a field’s meaning even if its column name remains the same.',
							'More data helps when it adds relevant, reliable information for the task. A million duplicated old invoices cannot substitute for examples of the new process. Conversely, a small but well-chosen new sample can reveal the failure and guide a revised scope or data collection plan. The response may be to restrict use temporarily rather than force a prediction into an unsupported setting.'
						]
					},
					{
						kind: 'compare',
						title: 'Three patterns, three investigations',
						items: [
							{
								label: 'Training high; validation high',
								text: 'Check model capacity, features, labels, optimization, and irreducible noise before assuming more complexity is enough.'
							},
							{
								label: 'Training low; validation high',
								text: 'Investigate overfitting, split mismatch, leakage differences, and sample size. Try justified regularization and repeat the comparison.'
							},
							{
								label: 'Both good historically; new cohort poor',
								text: 'Investigate population/process shift and label availability. Collect or validate relevant cases; regularization alone may not address it.'
							}
						]
					}
				]
			},
			{
				id: 'commit',
				title: 'Commit, reveal, then interpret',
				lead: 'Practice the discipline that makes an evaluation credible.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'The next lab changes the target from a dollar amount to a yes/no investigation label. Its cross-entropy loss penalizes putting little model probability on the observed label. Lower is better for that prediction objective; it is not measured in dollars. The L2 setting adds a training penalty on large weights. Displayed training and validation prediction losses exclude that penalty so the two can be compared on the same scale.',
							'You do not yet need every internal network calculation to conduct this experiment. Hidden units are intermediate numerical computations: increasing their count changes the model’s flexibility. Keep the seed and the other settings fixed when comparing complexity or regularization. M06 opens those computations and explains how their weights and activations differ.'
						]
					},
					{
						kind: 'lab',
						id: 'generalization',
						title: 'The independent-evidence challenge',
						task: 'Use the synthetic invoice-investigation classifier, whose inputs are overdue days and amount mismatch. It predicts an authored investigation label, rather than the dollar amount in M03. The same distinction between fitting, selecting, and testing applies. Explore model complexity and regularization with training and validation evidence. Record your chosen configuration and rationale before revealing the final cases. Repeat a fresh run to inspect sampling variation.',
						prediction:
							'Will the most flexible model have the lowest final error? State which evidence supports your expected choice.',
						evidence: [
							'Preserve the selected settings and validation score before final reveal.',
							'Compare training, validation, and final errors without hiding an unfavorable result.',
							'Label any tuning after final reveal as development on consulted cases.'
						],
						limitation:
							'Small synthetic datasets make variation visible. They do not establish a production model’s error rate or prove one model family is universally superior.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'A single final score is still an estimate from a finite sample. Different representative samples produce different values. Repeated experiments with fresh seeds can show sensitivity, but repeating until a favorable result appears and publishing only that result is selection again. Report the set of runs or define the experiment in advance.',
							'Cross-validation repeats training/validation partitions to use limited data more effectively for selection. For time series, the partitions must still respect time; for grouped entities, they must respect the relevant groups. It does not manufacture new information or automatically protect against leakage. Keep a final assessment appropriate to the claim after the procedure is chosen.'
						]
					}
				]
			},
			{
				id: 'decision-note',
				title: 'Write a model-selection note that survives questions',
				lead: 'The rationale matters as much as the winning number.',
				blocks: [
					{
						kind: 'reflection',
						prompt: 'The final score disappoints you. Can you improve the model?',
						guidance: 'Distinguish improving the artifact from preserving an independent estimate.',
						modelAnswer:
							'Yes. I can inspect failures and improve the procedure, documenting that these cases are now development evidence. I should not describe a better rerun on the same cases as a new independent final estimate. I need fresh appropriate final evidence for that claim.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Record the baseline, selected model, preparation, hyperparameters, intended population, validation method, and selection rationale. Report the final result even if it weakens the proposal. Include uncertainty and failure groups, then state a bounded next action. The same discipline will later apply to prompts, retrieval settings, and agent harnesses: selecting a system against a case suite also fits a procedure to evidence.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M04-C1',
				objective: 0,
				prompt:
					'You inspect final-test mistakes and change the feature set. What are those cases now?',
				options: [
					'Still independent because their file name says test.',
					'Development evidence that influenced selection.',
					'Training rows only if their labels enter gradient descent.'
				],
				answer: 1,
				rationales: [
					'The use of the evidence, not the filename, determines its role.',
					'Feature selection now depends on them; seek fresh final evidence for an independent claim.',
					'Selection can overfit without labels entering parameter updates directly.'
				]
			},
			{
				id: 'M04-C2',
				objective: 1,
				prompt:
					'Training and validation errors are both high for a rigid straight-line model of a curved relationship. What is a plausible first investigation?',
				options: [
					'Whether the model form and features can represent the relationship.',
					'Whether the test score should be hidden permanently.',
					'Whether a stronger penalty must always improve performance.'
				],
				answer: 0,
				rationales: [
					'Underfitting is plausible, though labels and optimization also deserve checking.',
					'Hiding a score does not repair a model.',
					'A stronger penalty may make an already rigid fit worse.'
				]
			},
			{
				id: 'M04-C3',
				objective: 2,
				prompt:
					'Training loss falls throughout a run; validation loss is lowest halfway through. Which snapshot should early stopping select under that criterion?',
				options: [
					'The last snapshot because training improved.',
					'The halfway snapshot selected using validation.',
					'Whichever snapshot has the best repeatedly checked test score.'
				],
				answer: 1,
				rationales: [
					'Training fit is not the selection criterion for generalization.',
					'That is the purpose of the declared validation stopping rule.',
					'This tunes against the test and compromises its final role.'
				]
			},
			{
				id: 'M04-C4',
				objective: 1,
				prompt:
					'A model works for domestic invoices but fails after overseas suppliers are added. Which statement is strongest?',
				options: [
					'Regularization will necessarily solve it.',
					'Investigate changed inputs, relationships, and coverage before choosing a remedy.',
					'The old validation score proves the new cohort is wrong.'
				],
				answer: 1,
				rationales: [
					'A penalty does not supply missing representative information.',
					'The change may be distribution or process shift and requires targeted diagnosis.',
					'The old score applies to its evaluated conditions, not all future cases.'
				]
			},
			{
				id: 'M04-C5',
				objective: 2,
				prompt:
					'Why can regularization improve validation performance while worsening training fit?',
				options: [
					'It intentionally changes the labels.',
					'It discourages fitting some patterns that do not transfer to new cases.',
					'It exposes validation targets to the optimizer as extra training labels.'
				],
				answer: 1,
				rationales: [
					'A penalty normally changes the objective or constraints, not the target observations.',
					'Accepting more training error can reduce sensitivity to incidental detail.',
					'That would change the data roles and is not the mechanism described.'
				]
			},
			{
				id: 'M04-C6',
				objective: 2,
				prompt:
					'Ten fresh runs give mixed results. You publish only the best run. What is the problem?',
				options: [
					'The reported result includes another layer of selection.',
					'Fresh seeds guarantee the selected score is representative.',
					'All repeated runs are invalid.'
				],
				answer: 0,
				rationales: [
					'Choosing the best outcome hides variation and can exaggerate expected performance.',
					'A seed creates a sample, not immunity from selection bias.',
					'Repeated experiments are useful when their procedure and distribution of outcomes are reported honestly.'
				]
			}
		],
		assignment: {
			title: 'Defend a model under changed conditions',
			scenario:
				'A simple model has training/validation MAE 12/13; a moderate model 5/7; a flexible model 1/14. After choosing the moderate model, final MAE is 9. New overseas customers later show MAE 24.',
			tasks: [
				'Choose and justify a model before using the final score.',
				'Explain what the final result establishes and what it does not.',
				'Propose a response to the new cohort and an honest reevaluation plan.'
			],
			deliverable: 'A model-selection memo with a separate shift investigation.',
			rubric: [
				{
					criterion: 'Selection',
					evidence: 'Uses validation and baseline comparison rather than minimum training loss.'
				},
				{
					criterion: 'Interpretation',
					evidence: 'Treats final MAE as finite evidence for its population.'
				},
				{
					criterion: 'Diagnosis',
					evidence: 'Investigates the changed cohort instead of assuming one universal remedy.'
				},
				{
					criterion: 'Reevaluation',
					evidence: 'Separates repaired development cases from fresh final cases.'
				}
			],
			workedSolution: [
				'The moderate model has the lowest validation MAE and a materially better result than the simple baseline. Select it with preparation and settings frozen.',
				'The final MAE of 9 is a new estimate on the declared final population. It is worse than validation but does not by itself prove a failure; inspect sample size, case mix, and consequential errors.',
				'MAE 24 on overseas customers suggests the historical evidence did not cover the new setting adequately. Check feature availability, units, terms, labels, and relationships, collect representative examples, and consider restricting use. Repaired cases become development evidence; evaluate the revised procedure on fresh appropriate cases.'
			]
		},
		interview: {
			question: 'How do you know a model will generalize?',
			strongAnswer: [
				'I cannot guarantee it from a training score. I define the deployment population and decision time, fit the complete procedure on training data, select using appropriate validation, and reserve later or otherwise independent final cases. I compare a baseline, inspect important groups, and report uncertainty and failures.',
				'After launch I monitor whether the population or process changes. Regularization and early stopping can help control overfitting, but neither corrects leakage or creates evidence for a new business setting.'
			],
			followUps: [
				{
					question: 'Can you use the test set more than once?',
					answer:
						'I can inspect and reuse it for improvement, but then it has influenced development. I would describe that honestly and obtain fresh final evidence for a renewed independent claim.'
				},
				{
					question: 'Would more data always help?',
					answer:
						'Only if it adds relevant reliable information. Duplicates, wrong labels, future leaks, or an irrelevant historical population can preserve or worsen the problem.'
				}
			]
		},
		sources: [
			{
				label: 'Google: overfitting',
				url: 'https://developers.google.com/machine-learning/crash-course/overfitting',
				note: 'Generalization and model complexity.'
			},
			{
				label: 'scikit-learn: cross-validation',
				url: 'https://scikit-learn.org/stable/modules/cross_validation.html',
				note: 'Evaluation strategies must match temporal and grouped data.'
			}
		]
	},
	{
		id: 'M05',
		day: 1,
		title: 'Classification, uncertainty, and decisions',
		subtitle: 'Turn scores into a review process with visible consequences.',
		minutes: 60,
		prerequisites: ['M04'],
		objectives: [
			'Calculate and interpret confusion counts, precision, recall, and accuracy.',
			'Distinguish ranking, calibrated probability, and threshold-based action.',
			'Defend a review policy using prevalence, capacity, and error costs.'
		],
		why: 'An impressive classifier score is not yet a workable finance process. Someone must decide what gets reviewed, what is missed, and how much those choices cost.',
		sections: [
			{
				id: 'three-layers',
				title: 'A score, a category, and an action are different',
				lead: 'The model estimates; the process decides what to do with the estimate.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Willow has 100 invoices in a completed teaching cohort. After investigation, 10 are confirmed duplicate submissions and 90 are not. A classifier assigns each invoice a score. Sorting by that score is ranking. Calling invoices above a cutoff “flagged” is classification at a threshold. Sending them to a reviewer is an operational action. These stages should remain visible because a useful ranking can support several different policies.',
							'The observed proportion of actual positives is prevalence: here 10 out of 100, or 10%. “Positive” simply names the class we chose to detect; it is not praise. In this case it means a confirmed duplicate submission. The source of that label matters. A flag from an older model is not automatically a verified label for evaluating a new one.',
							'An exception or anomaly is a case deserving attention under a defined criterion. It is not proof of fraud, intent, or material misstatement. A duplicate may be an innocent resend; an unusual amount may be a legitimate new order. The action and communication should match what the evidence establishes.'
						]
					}
				]
			},
			{
				id: 'four-cells',
				title: 'Put every invoice into one of four cells',
				lead: 'Confusion counts describe the model and reality together.',
				blocks: [
					{
						kind: 'table',
						caption:
							'At the chosen threshold, 20 invoices are flagged: 8 duplicates and 12 ordinary invoices. Two duplicates are missed.',
						headers: ['Actual outcome', 'Flagged for review', 'Not flagged', 'Total'],
						rows: [
							['Confirmed duplicate', '8 true positives', '2 false negatives', '10'],
							['Not duplicate', '12 false positives', '78 true negatives', '90'],
							['Total', '20', '80', '100']
						]
					},
					{
						kind: 'worked',
						title: 'Read the same table three ways',
						problem:
							'Calculate precision, recall, and accuracy, then explain what each denominator means.',
						steps: [
							'Precision asks: among the 20 flagged invoices, how many are actual duplicates? 8 / 20 = 40%. It describes the yield of the selected queue.',
							'Recall asks: among the 10 actual duplicates, how many were flagged? 8 / 10 = 80%. It describes capture of the positive cases.',
							'Accuracy asks: among all 100 invoices, how many categories were correct? (8 + 78) / 100 = 86%.',
							'A model that flags nothing gets 90 / 100 = 90% accuracy, higher than 86%, while catching zero duplicates. Its recall is 0%. Precision is undefined because it made no positive predictions; calling that 100% precision would mislead.'
						],
						conclusion:
							'The denominators encode different questions. A metric is meaningful only when connected to the decision.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'False-positive rate uses another denominator: 12 false positives among 90 actual negatives, or 13.33%. It is not the same as “60% of the queue is false alarms,” which uses the 20 flagged invoices. State the denominator in words whenever percentages could be confused. F1 combines precision and recall into one score, but it still omits explicit dollar consequences and capacity.'
						]
					}
				]
			},
			{
				id: 'threshold',
				title: 'Thresholds move the workload',
				lead: 'Changing the cutoff changes which mistakes you accept.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'Lowering a threshold usually flags more cases. Some newly flagged invoices are duplicates that were previously missed; others are additional false alarms. Raising it usually reduces the queue but misses more positives. The score-producing model may be unchanged. Threshold selection is part of designing the application, and should use development evidence rather than repeated final-test inspection.',
							'Suppose a lower threshold flags 35 invoices and captures 9 of the 10 duplicates. Precision becomes 9 / 35 = 25.71%, recall becomes 90%, and there are 26 false alarms. Compared with the previous policy, one more duplicate is caught at the cost of 15 additional reviews. Whether that is worthwhile depends on review effort and the expected consequence of a missed duplicate.',
							'A fixed capacity creates a different question. If staff can review only 15 cases today, a top-15 queue may be more useful than a threshold that creates 35. Evaluate how many positives appear among the top 15 and what happens to the unreviewed balance. A threshold should not silently promise more review work than the team can perform. High-risk cases may need escalation rather than disappearance below a cutoff.'
						]
					},
					{
						kind: 'lab',
						id: 'classification',
						title: 'Design the review queue',
						task: 'Use the synthetic invoice-investigation task from M04. Its positive labels identify authored investigation cases using overdue days and amount mismatch; they are not the confirmed duplicates in the worked example. The same confusion-count and threshold reasoning applies. Move the threshold and inspect which cases enter or leave the queue. Compare confusion counts, queue size, and the stated cost assumptions. Choose a policy that fits a declared capacity.',
						prediction:
							'What will happen to false negatives and review workload when you lower the threshold?',
						evidence: [
							'Record the threshold and actual selected cases.',
							'Calculate precision and recall from displayed counts.',
							'Explain whether the queue is operationally feasible and which misses remain.'
						],
						limitation:
							'Synthetic labels and costs illustrate tradeoffs; the score is not established as a calibrated probability of fraud, duplication, or late payment. A real review process requires verified outcomes, relevant case coverage, and monitored reviewer behavior.'
					}
				]
			},
			{
				id: 'cost',
				title: 'Connect the counts with money and effort',
				lead: 'A decision rule needs explicit assumptions about consequences.',
				blocks: [
					{
						kind: 'worked',
						title: 'Does one additional catch justify fifteen reviews?',
						problem:
							'Use the two thresholds above. Assume each review costs USD 6 in staff time and each missed duplicate has an expected avoidable cost of USD 150. Assume reviewed duplicates are successfully resolved for this simplified comparison.',
						steps: [
							'Original policy: 20 reviews cost USD 120. Two misses cost an expected USD 300. Total modeled cost is USD 420.',
							'Lower threshold: 35 reviews cost USD 210. One miss costs an expected USD 150. Total modeled cost is USD 360.',
							'Under these assumptions the lower threshold improves expected cost by USD 60, but requires 15 more reviews.',
							'If a miss instead costs USD 30, the original cost is 120 + 60 = USD 180, while the lower-threshold cost is 210 + 30 = USD 240. The preferred policy reverses.',
							'If reviewers can handle only 25 cases, neither cost calculation alone establishes how the 35-case queue will be completed. Model the capacity constraint or a revised review policy.'
						],
						conclusion:
							'The model score did not change. The decision changed because costs and capacity are part of the objective.'
					},
					{
						kind: 'callout',
						tone: 'accounting',
						title: 'An invoice amount is not automatically an expected loss',
						paragraphs: [
							'A duplicate submission may be stopped by another control, recovered after payment, or associated with varying investigation costs. Expected avoidable cost combines consequences and their chances under the actual process. Do not substitute the face amount without considering what action changes.',
							'Materiality is contextual judgment about significance, including qualitative factors. It is not a universal model threshold or a reason to ignore all small exceptions.'
						]
					}
				]
			},
			{
				id: 'calibration',
				title: 'When does 0.8 mean about 80%?',
				lead: 'Good ranking does not guarantee reliable probability estimates.',
				blocks: [
					{
						kind: 'prose',
						paragraphs: [
							'A risk score orders cases according to the model. It becomes a useful probability estimate only if its numerical scale corresponds reasonably to observed frequencies in relevant data. Calibration asks whether, among many comparable cases assigned about 0.8 probability, approximately 80% are positive. It does not promise that one particular invoice is “80% duplicate” in a physically measurable sense.',
							'A model can rank duplicates above ordinary invoices while exaggerating every probability. Multiplying all scores by a factor might preserve the order but damage calibration. Conversely, a model that always predicts the prevalence may be calibrated at that single level while providing no useful ranking. Discrimination and calibration answer different questions.',
							'Inspect groups or bins of predictions against observed frequencies, including the number of cases in each bin. Two positives among three cases are too little evidence for a precise probability claim. Calibration can also change when customers, controls, or prevalence change. Recalibration must be assessed on suitable held-out data and cannot repair a ranking that carries no useful signal.'
						]
					},
					{
						kind: 'reflection',
						prompt:
							'The review queue is well ranked, but only 40% of cases labeled 0.8 are duplicates. What can you conclude?',
						guidance: 'Separate ranking usefulness from the interpretation of the numeric score.',
						modelAnswer:
							'The 0.8 values overstate observed positive frequency in that evaluated group. The ranking may still be useful for allocating review, but I should not treat the scores as calibrated probabilities for expected-loss calculations. I would examine sample size, case mix, and calibration on held-out data.'
					}
				]
			},
			{
				id: 'prevalence',
				title: 'The same detection behavior can produce a different queue',
				lead: 'A rare positive class makes false alarms especially important.',
				blocks: [
					{
						kind: 'worked',
						title: 'Move from 10% prevalence to 1%',
						problem:
							'For a separate illustrative model, assume 80% recall and a 10% false-positive rate remain unchanged. Compare two cohorts of 1,000 invoices.',
						steps: [
							'At 10% prevalence there are 100 duplicates and 900 ordinary invoices. The model catches 80 duplicates and flags 90 ordinary invoices. Precision is 80 / 170 = 47.06%.',
							'At 1% prevalence there are 10 duplicates and 990 ordinary invoices. It catches 8 duplicates and flags 99 ordinary invoices. Precision is 8 / 107 = 7.48%.',
							'Recall and false-positive rate were held fixed for the illustration, yet the lower-prevalence queue has far fewer true duplicates per review.',
							'In practice those rates may also change with the population. Re-measure rather than assuming they remain fixed.'
						],
						conclusion:
							'A precision claim cannot be moved between populations without examining prevalence and model behavior.'
					},
					{
						kind: 'prose',
						paragraphs: [
							'Your day-one decision note should now connect the data contract, split, baseline, threshold, review capacity, and costs. That is a substantive answer to “How good is this model?” The answer is conditional on a task and a process, with the conditions stated clearly enough for a colleague to challenge.'
						]
					}
				]
			}
		],
		checks: [
			{
				id: 'M05-C1',
				objective: 0,
				prompt:
					'Of 30 flagged invoices, 12 are confirmed duplicates. There are 15 duplicates overall. What are precision and recall?',
				options: ['Precision 80%; recall 40%.', 'Precision 40%; recall 80%.', 'Both 12%.'],
				answer: 1,
				rationales: [
					'The denominators have been reversed.',
					'Precision is 12/30; recall is 12/15.',
					'Neither denominator is the entire cohort in these two metrics.'
				]
			},
			{
				id: 'M05-C2',
				objective: 0,
				prompt:
					'Only 1% of invoices are positive. A model predicts every invoice negative. What follows?',
				options: [
					'99% accuracy can coexist with zero recall.',
					'99% accuracy means 99% of duplicates were caught.',
					'Precision is necessarily 100%.'
				],
				answer: 0,
				rationales: [
					'It correctly classifies the 99% negatives but catches no positives.',
					'That confuses overall correctness with capture of positives.',
					'With no positive predictions precision has a zero denominator and is undefined.'
				]
			},
			{
				id: 'M05-C3',
				objective: 2,
				prompt:
					'Lowering a threshold adds 15 reviews at USD 6 each and avoids one miss costing an expected USD 150. Ignoring other effects, what changes?',
				options: [
					'Expected cost falls USD 60.',
					'Expected cost rises USD 90.',
					'The model’s fitted parameters must have improved.'
				],
				answer: 0,
				rationales: [
					'Extra review cost is 90, offset by 150 avoided cost, giving 60 improvement.',
					'That counts workload but omits the avoided miss.',
					'Threshold changes can use the same fitted model.'
				]
			},
			{
				id: 'M05-C4',
				objective: 1,
				prompt:
					'Cases scored around 0.8 are positive only 40% of the time in a large relevant holdout. What is the best diagnosis?',
				options: [
					'The probabilities appear overconfident in that range.',
					'The ranking must be completely useless.',
					'The individual cases are each exactly 40% positive.'
				],
				answer: 0,
				rationales: [
					'The assigned probability exceeds observed frequency; investigate calibration and conditions.',
					'Ordering can remain useful despite poor calibration.',
					'Calibration is a frequency comparison across cases, not a physical fractional label for each invoice.'
				]
			},
			{
				id: 'M05-C5',
				objective: 2,
				prompt:
					'Prevalence falls while recall and false-positive rate stay fixed. What usually happens to precision?',
				options: [
					'It increases because there are fewer positives.',
					'It falls because false positives make up more of the flagged set.',
					'It remains identical because recall is unchanged.'
				],
				answer: 1,
				rationales: [
					'Fewer true positives relative to false alarms tend to reduce queue yield.',
					'The denominator contains more negatives relative to positives.',
					'Precision depends on prevalence as well as these rates.'
				]
			},
			{
				id: 'M05-C6',
				objective: 2,
				prompt:
					'A threshold achieves 95% recall but creates 200 daily reviews; capacity is 40. What is the strongest recommendation?',
				options: [
					'Approve it because recall is the highest available.',
					'Evaluate a feasible queue policy, costs, and escalation for unreviewed risk.',
					'Delete the extra 160 cases from the evaluation.'
				],
				answer: 1,
				rationales: [
					'An unworkable queue may not deliver the measured capture in practice.',
					'Capacity is part of the decision; evaluate top-k or revised thresholds and consequences.',
					'Removing inconvenient cases hides the operational failure.'
				]
			}
		],
		assignment: {
			title: 'Recommend a review policy',
			scenario:
				'On a validation cohort, policy A flags 20 cases, catches 8 positives, and misses 2. Policy B flags 35, catches 9, and misses 1. Reviews cost USD 6; expected missed-case cost is USD 150. Daily capacity is 25.',
			tasks: [
				'Compute precision, recall, and modeled cost for both policies.',
				'Explain why the cheapest unconstrained policy may be infeasible.',
				'Propose a capacity-aware experiment and state what must be checked before deployment.'
			],
			deliverable: 'A review-queue recommendation with calculations and assumptions.',
			rubric: [
				{
					criterion: 'Metrics',
					evidence: 'Uses correct denominators and distinguishes queue size.'
				},
				{
					criterion: 'Economics',
					evidence: 'Includes review and missed-case cost with stated assumptions.'
				},
				{ criterion: 'Capacity', evidence: 'Does not promise completion of an oversized queue.' },
				{ criterion: 'Evaluation', evidence: 'Selects on validation and reserves final evidence.' }
			],
			workedSolution: [
				'A: precision 40%, recall 80%, modeled cost USD 420. B: precision 25.71%, recall 90%, modeled cost USD 360.',
				'B is cheaper under the cost assumptions but exceeds capacity by 10 reviews. Its theoretical benefit assumes reviews actually occur and resolve positives.',
				'Evaluate the top 25 scores or a revised threshold, inspecting which positives are captured and what remains. Consider escalation for high-impact cases and measure actual review times. Freeze the policy after validation, then assess on final representative cases; monitor prevalence and calibration afterward.'
			]
		},
		interview: {
			question:
				'A team advertises 99% accuracy for a finance exception classifier. How do you assess it?',
			strongAnswer: [
				'I would ask for class prevalence, the confusion counts, the labeling process, and the population/time split. If positives are rare, predicting everything negative may already achieve 99%. I would inspect precision, recall, ranking at the available review capacity, calibration if probabilities drive decisions, and the consequences of false alarms and misses.',
				'I would evaluate the complete review policy against a baseline on held-out cases. A classifier can rank well yet create an infeasible queue, and the same rates can produce a very different queue when prevalence changes.'
			],
			followUps: [
				{
					question: 'Would you always maximize recall?',
					answer:
						'No. Missed positives can be costly, but false alarms consume capacity and may delay important work. I would define consequences and constraints and evaluate the resulting policy.'
				},
				{
					question: 'What if the score is not calibrated?',
					answer:
						'It may still support ranking, but I would avoid treating it as an exact probability in expected-cost calculations. I would assess and, where justified, calibrate it using appropriate separate data.'
				}
			]
		},
		sources: [
			{
				label: 'Google: accuracy, precision, and recall',
				url: 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall',
				note: 'Metric definitions; all cohorts and costs here are synthetic.'
			},
			{
				label: 'scikit-learn: probability calibration',
				url: 'https://scikit-learn.org/stable/modules/calibration.html',
				note: 'Calibration is distinct from discrimination and requires suitable evaluation.'
			}
		]
	}
];
