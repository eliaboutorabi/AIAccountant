import type { CourseModule } from '../types';
import { p, note, table, worked, steps, reflect, lab, section, check } from './content-helpers';
export const m15: CourseModule = {
	id: 'M15',
	day: 3,
	title: 'Generative and multimodal AI',
	subtitle:
		'Understand what changes when a system creates images, reads documents, or combines text with other signals.',
	minutes: 60,
	prerequisites: ['M07', 'M14'],
	objectives: [
		'Distinguish generative AI from a language model, a classifier, and an application interface.',
		'Explain the intuition behind autoregressive generation and learned denoising without treating either as magic.',
		'Trace a document from image through extraction, validation, business rules, and review.',
		'Identify ambiguity and preserve evidence when a multimodal model reads financial documents.',
		'Design useful evaluations for creative outputs and high-stakes extracted fields.'
	],
	why: 'Willow wants one assistant to read scanned invoices, write explanations, and produce presentation graphics. A single friendly interface can hide very different model tasks, error types, and validation requirements.',
	sections: [
		section(
			'family',
			'Generative AI is a category of behavior',
			'Not every generator is a text model, and not every AI application generates content.',
			p(
				'A generative model learns patterns that can be used to create new outputs resembling a target distribution, often conditioned on an input. A text model can generate a continuation; an image model can create a picture from a description; an audio model can produce speech; other systems generate video, code, or structured content. The output is new in the sense of being produced by the system, but that does not establish originality, correctness, or permission to use every element.',
				'A classifier instead maps an input to a category or score, such as whether an invoice needs investigation. A forecasting model predicts future values. These categories overlap: a generative model can be prompted to perform classification, and a probabilistic forecasting system can generate sample future paths. Focus on the actual objective, input, output, and use rather than forcing every application into one exclusive marketing box.',
				'An LLM is a language-model family; generative AI is broader. A chatbot is an interface. The chatbot may connect to a language model, a search system, an image generator, a database, or all of them. If it answers a question about a receipt, you cannot infer from the chat interface alone whether it used optical character recognition (OCR), which converts image text into machine-readable characters, a multimodal model, a deterministic parser, or a combination. This is why system diagrams should show the components behind the interface.'
			),
			table(
				'Same user interface, different tasks',
				['Request', 'Underlying task', 'Evidence of quality'],
				[
					[
						'“Classify this invoice for review”',
						'Classification or prompted classification',
						'Errors, calibration where relevant, and review cost'
					],
					[
						'“Write a variance explanation”',
						'Conditional text generation',
						'Correct calculations and supported claims'
					],
					[
						'“Read this scanned total”',
						'Image understanding / extraction',
						'Field accuracy against verified source transcription'
					],
					[
						'“Create an illustration for training”',
						'Image generation',
						'Visual communication, provenance, and accessibility'
					],
					[
						'“Forecast next quarter’s cash receipts”',
						'Time-series prediction',
						'Rolling-origin error, uncertainty, and decision value'
					]
				]
			),
			note(
				'warning',
				'Generated does not mean verified',
				'A visually persuasive chart can still contain invented values or distorted scales. Use computed charts for measured evidence. Generated illustrations can communicate a metaphor or set a scene, but they must not impersonate an actual model result or financial record.'
			)
		),
		section(
			'denoising',
			'A second route to generation: learn to remove noise',
			'Build the intuition with a small numerical example before thinking about images.',
			p(
				'Autoregressive text generation predicts and appends the next token. Diffusion-style generation takes a different route: training examples are deliberately corrupted with noise, and a model learns a related denoising task at different noise levels. At generation time, a procedure starts with noise and repeatedly uses the learned model to move toward a sample. The exact prediction target and sampling procedure vary across diffusion formulations, so “it simply reverses every noise step exactly” would be misleading.',
				'Imagine a two-dimensional dataset of points arranged around two clusters. Adding random noise blurs those patterns. A trained denoiser learns from many noisy/clean pairs how a noisy point relates to the underlying pattern, with the noise level supplied as part of the task. A single noisy location may correspond to several possible clean points, so removing noise is not equivalent to recovering one uniquely hidden original. Sampling aims to produce a plausible new point from the learned distribution.',
				'For images, the representation has many more dimensions and a much more capable model. Some systems perform denoising in a compressed latent representation rather than directly in full-resolution pixel space. Text conditioning steers the process toward requested content. The important conceptual bridge is a learned transformation operating repeatedly on representations, not a stock image search that merely retrieves a finished picture. This does not imply that memorization or close reproduction can never occur.',
				'A low-dimensional classroom denoiser can demonstrate a genuine learned noise-removal objective and show its errors. It does not establish that the classroom network reproduces all the components of a modern image system. Keep the analogy explicit: real parameter learning on a simple distribution, with vastly smaller data, capacity, and output complexity.'
			),
			lab(
				'denoising',
				'Train a denoiser on a two-dimensional pattern',
				'Inspect clean points and their noisy counterparts, train the small denoising model, and compare held-out noisy-to-clean error before and after learning. Change the noise level and observe what becomes ambiguous.',
				'As noise increases, will every point still have an obvious original? Will reducing training error guarantee a visually accurate unseen image?',
				[
					'Record measured held-out error at two noise levels.',
					'Identify where the denoiser averages or misplaces ambiguous points.',
					'Explain which part is actual learned computation and which connection to image generation is an analogy.'
				],
				'This is a real small denoising experiment on synthetic points. It is not a full text-to-image diffusion model, a pretrained image generator, or a test of professional image quality.'
			)
		),
		section(
			'multimodal',
			'Different signals can enter one system',
			'Reading pixels requires a representation step before any business interpretation.',
			p(
				'Multimodal systems process more than one type of information, such as text and images, or audio and text. An image may be represented through patches or learned visual features, then connected to a language model through an architecture-specific mechanism. Some document pipelines first use OCR to extract text; others let a multimodal model inspect the image directly; many combine both. The result may be fluent language even when an upstream visual field was misread.',
				'A scanned invoice contains more than words. Layout links labels to values; a currency symbol can be far from the total; a handwritten correction may override a printed amount; a page boundary can separate the subtotal from a continuation. Cropping, low resolution, blur, rotation, and compression can remove evidence. A model cannot reliably recover a genuinely illegible digit simply because its surrounding prose sounds sensible.',
				'Separate the tasks: detecting a field, reading its characters, assigning its meaning, checking its arithmetic, matching it to records, applying policy, and authorizing an action. A system can succeed at one and fail at the next. Reading “1,208.00” accurately does not prove that the invoice is legitimate. Matching a supplier name does not prove that bank details are authorized. The application needs evidence and controls appropriate to each step.'
			),
			steps('From document image to reviewed record', [
				[
					'Preserve the source',
					'Store or reference the original image and document ID, including page and crop information.'
				],
				[
					'Extract candidates',
					'Read fields and retain evidence locations where available. Preserve ambiguity rather than silently guessing.'
				],
				[
					'Normalize carefully',
					'Parse dates, decimal separators, currencies, and identifiers using explicit rules; keep original strings.'
				],
				[
					'Validate relationships',
					'Check required fields, line totals, tax arithmetic, duplicate keys, and record matches.'
				],
				[
					'Apply business policy',
					'Use the current authorized policy and permissions. An extracted field is data, not an approval.'
				],
				[
					'Route exceptions',
					'Give a reviewer the source, extracted candidates, failed checks, and a specific decision to make.'
				]
			]),
			note(
				'accounting',
				'Invoice total is not the same as outstanding payable',
				'A document total may include tax, credits, deposits, or charges that need separate treatment. Outstanding payable depends on accepted invoices, payments, credit notes, and the reporting cutoff. A correct image transcription does not replace reconciliation to the ledger.'
			)
		),
		section(
			'extraction-case',
			'Make uncertainty concrete',
			'The right exception is often more useful than a confident guess.',
			table(
				'Document teaching case INV-SCAN-17 · USD',
				['Printed field', 'Verified case transcription', 'Candidate extraction'],
				[
					['Subtotal', '1,100.00', '1,100.00'],
					['Tax', '88.00', '88.00'],
					['Freight', '20.00', '20.00'],
					['Total', '1,208.00', '1,203.00'],
					['Invoice ID', 'WIL-0018', 'WIL-OO18']
				]
			),
			worked(
				'Validate the extraction before using it',
				'The candidate total misreads an 8 as a 3, and the identifier substitutes letters O for zeros. The verified transcription is supplied for scoring this teaching case.',
				[
					'Add the components: 1,100 + 88 + 20 = 1,208. The extracted 1,203 fails by $5.',
					'Do not silently overwrite the source total solely because the arithmetic suggests 1,208. Inspect the image and any rounding, discount, or continuation fields before concluding which field is wrong.',
					'Compare the raw invoice ID with the source and vendor formatting rules. Do not globally replace all letters O with zero: some legitimate IDs contain letters.',
					'Route the case with both raw and normalized candidate values, the source reference, the $5 difference, and the ambiguous characters.',
					'After review confirms the verified transcription, retain the correction and reviewer evidence. Then proceed to ledger matching and approval checks.'
				],
				'Arithmetic checks detect inconsistency. They do not by themselves prove which source field is correct or that the invoice should be paid.'
			),
			lab(
				'documents',
				'Inspect a document and validate its fields',
				'Compare rendered teaching invoices with candidate extracted values. Enter corrected fields, run arithmetic and identifier checks, and route unresolved ambiguity. Inspect a changed example before viewing its verified transcription.',
				'Which errors will a total check catch, and which could leave the total correct?',
				[
					'Record the original string, corrected value, and visual evidence for each change.',
					'Identify an error that arithmetic alone cannot catch, such as a wrong but plausible identifier.',
					'State the next approval or reconciliation step after transcription passes.'
				],
				'The source documents and candidate extractions are authored teaching fixtures, not a live OCR benchmark. Validation runs on your actual entries. Any illustrated OCR error must not be described as a measured output from a model we did not run.'
			)
		),
		section(
			'evaluation',
			'Evaluate each part of the multimodal workflow',
			'One average accuracy number can hide the field that matters most.',
			p(
				'For extraction, define the unit of evaluation: characters, fields, documents, or complete correctly processed transactions. A system with 99% character accuracy can still misread the one digit that changes an amount materially. Measure critical fields separately and specify normalization rules. For example, whitespace differences may be harmless in a description but unacceptable changes in a bank-account identifier.',
				'Include varied layouts, low-quality scans, handwriting where relevant, new suppliers, different date formats, currency symbols, credit notes, missing pages, and deliberately unanswerable fields. Group related documents appropriately when splitting data so that nearly identical templates do not create an easy test disguised as generalization. Evaluate the exception-routing decision and reviewer workload, not only the model’s extracted string.',
				'A model’s confidence score, if supplied, needs interpretation. It may not be calibrated to field correctness or comparable across document types. Choose review thresholds on representative development evidence, then test the committed policy independently. A low-confidence correct result and a high-confidence wrong result are both informative: one affects review effort; the other may create undetected risk.',
				'For creative graphics, evaluation differs. Ask whether the image communicates the intended concept, whether labels and visual relationships are accurate, whether it is readable at the intended size, whether accessible text explains the content, and whether provenance and usage rights are understood. Do not demand a fictional business illustration prove a model’s numerical performance. Use exact plotted data for that purpose.'
			),
			reflect(
				'A vendor reports “98% extraction accuracy.” What would you ask before accepting the claim?',
				'Ask about the denominator, field mix, dataset, and final business outcome.',
				'What is counted: characters, fields, documents, or complete transactions? Which critical fields fail? What layouts, scan qualities, currencies, and supplier groups were held out? How are normalization, missing fields, confidence, exceptions, and reviewer corrections handled? What is the end-to-end error and workload on our representative records?'
			)
		),
		section(
			'integration',
			'A helpful assistant still needs a system around it',
			'The next day turns models into controlled applications.',
			p(
				'Willow’s proposed assistant can now be drawn as a sequence: receive a document, interpret its visual/text content, validate fields, retrieve relevant policy, calculate exact values, draft a supported review note, and route a decision. Some steps use models; some use ordinary code; some require human authority. A strong design makes those responsibilities visible rather than hiding them behind one “AI” box.',
				'The same principle applies when a model helps you build the application itself. It can draft code, tests, and documentation, but the resulting system must execute real operations and be tested against intended behavior. Day 4 introduces tools, skills, agents, and harnesses. Day 5 uses those ideas to build and defend a bounded financial pipeline, carrying forward the evidence discipline you practiced today.'
			)
		)
	],
	checks: [
		check(
			'm15-q1',
			0,
			'Which statement best relates LLMs and generative AI?',
			[
				'Generative AI includes text and other output modalities; an LLM is a language-model family',
				'Every generative model is a chatbot',
				'A classifier cannot ever use a generative model'
			],
			0,
			[
				'Correct. The categories describe related but different aspects of a system.',
				'A chatbot is an interface, and generators can produce images, audio, or other outputs.',
				'A generative model can be used in a classification application; inspect the actual task and evaluation.'
			]
		),
		check(
			'm15-q2',
			1,
			'Why is a denoiser not simply recovering one guaranteed hidden original from every noisy point?',
			[
				'Training never uses examples',
				'Several clean points may plausibly correspond to a noisy observation',
				'Noise contains an exact readable copy of the answer'
			],
			1,
			[
				'Denoising training uses examples and a defined corruption/prediction objective.',
				'Correct. The inverse problem can be ambiguous, especially with substantial noise.',
				'Noise does not carry a guaranteed accessible original; the model learns patterns and uncertainty remains.'
			]
		),
		check(
			'm15-q3',
			3,
			'An extracted invoice total fails arithmetic by $5. What should happen first?',
			[
				'Automatically replace the printed total with the sum',
				'Pay the smaller total because it is safer',
				'Inspect the source and all contributing fields, preserving the discrepancy'
			],
			2,
			[
				'The error could be in a line, tax, discount, or missing page rather than the total itself.',
				'Payment authority does not follow from choosing the smaller number.',
				'Correct. The check detects inconsistency, and source review identifies the repair.'
			]
		),
		check(
			'm15-q4',
			2,
			'All fields were transcribed correctly. What remains unresolved?',
			[
				'Document legitimacy, record matching, policy, and authorization',
				'Nothing; accurate OCR authorizes payment',
				'The model must still learn a new token vocabulary'
			],
			0,
			[
				'Correct. Transcription is one stage, not the full financial process.',
				'Reading a document does not establish legitimacy or approval.',
				'Vocabulary training is not a necessary consequence of successful extraction.'
			]
		),
		check(
			'm15-q5',
			4,
			'Why is character accuracy alone weak evidence for invoice processing?',
			[
				'Characters cannot be measured',
				'A small number of wrong critical digits can change the business result',
				'Every character error has the same financial consequence'
			],
			1,
			[
				'Character error is measurable but has a limited evaluation scope.',
				'Correct. Field and transaction outcomes, including exception routing, reveal consequences hidden by averages.',
				'An amount digit or bank-account character can matter much more than punctuation in a description.'
			]
		),
		check(
			'm15-q6',
			4,
			'A generated illustration shows a beautifully smooth learning curve. Can it report an experiment’s result?',
			[
				'Yes, if the title says “training”',
				'Yes, because visual quality implies accuracy',
				'Only a chart computed from the actual measurements can support that result'
			],
			2,
			[
				'A label does not establish provenance or computation.',
				'Aesthetic quality and measured accuracy are distinct.',
				'Correct. Generated art can illustrate a concept but must not substitute for experiment data.'
			]
		)
	],
	assignment: {
		title: 'Design a document-to-review workflow',
		scenario:
			'Willow receives 800 supplier invoices per week, including low-resolution scans and unfamiliar layouts. The team wants to minimize manual transcription while preserving a clear exception and approval process.',
		tasks: [
			'Draw or describe the stages from image capture to reviewed record, naming the model and non-model operations.',
			'Use INV-SCAN-17 to show one arithmetic check and one identifier check.',
			'Define evaluation measures for critical fields, complete transactions, and reviewer effort.',
			'Describe what happens when a total is illegible or an identifier is ambiguous.',
			'Explain why a corrected transcription still cannot authorize payment.'
		],
		deliverable:
			'A workflow sketch, two worked validation rules, and a small evaluation/exception plan.',
		rubric: [
			{
				criterion: 'Stages are separated',
				evidence:
					'Extraction, normalization, validation, matching, policy, and authorization have distinct responsibilities.'
			},
			{
				criterion: 'Checks are precise',
				evidence: 'Shows 1,100+88+20=1,208 and handles O/0 ambiguity without global substitution.'
			},
			{
				criterion: 'Evaluation measures consequences',
				evidence:
					'Critical-field and complete-transaction outcomes plus reviewer time and exception coverage.'
			},
			{
				criterion: 'Unknowns remain visible',
				evidence:
					'Preserves raw source, candidate values, failed checks, and routes ambiguity to an authorized reviewer.'
			}
		],
		workedSolution: [
			'Keep the original document with a stable ID. Extract candidate fields, retaining original strings and locations. Normalize using explicit date/currency rules. Validate arithmetic and required fields, then match supplier/invoice/payment records and apply current policy. Only the authorized process can approve a payment.',
			'For INV-SCAN-17, the components sum to 1,208, so 1,203 fails by 5. Review the image and contributing fields before correcting the total. For WIL-OO18 versus WIL-0018, compare source and valid supplier formats; do not replace every O with 0. Preserve the correction trail.',
			'Measure amount, currency, supplier, invoice ID, and bank-detail accuracy separately where applicable. Also measure fully correct transactions, undetected errors, false exception rates, review minutes, and behavior on unreadable/missing-page cases. Hold out relevant supplier/layout/time groups to test the intended deployment.',
			'An illegible total is unresolved evidence. Route it with the source and precise uncertainty, request a better document if needed, and avoid downstream financial action. A correct transcription establishes what the document says; legitimacy, ledger status, policy compliance, and authority require further checks.'
		]
	},
	interview: {
		question: 'How would you assess an AI invoice-reading system?',
		strongAnswer: [
			'I would separate visual extraction from financial validation and approval. The system needs to preserve the original document, candidate strings, normalized values, and any unresolved ambiguity. Arithmetic and identifier checks detect different errors.',
			'I would evaluate critical fields and complete transactions on representative held-out layouts and scan qualities, including unreadable and conflicting documents. I would measure reviewer effort and undetected errors, not just average OCR accuracy.',
			'Accurate reading does not authorize a transaction. The application must match records, apply current policy, and enforce the appropriate review and execution permissions.'
		],
		followUps: [
			{
				question: 'What if a multimodal model says it is very confident?',
				answer:
					'Confidence must be tested against observed field correctness on representative data. It does not replace source inspection for ambiguous critical values or determine who may authorize payment.'
			},
			{
				question: 'When is generated art appropriate in financial communication?',
				answer:
					'For clearly illustrative concepts and presentation design, with provenance and accessible descriptions. Financial charts and experiment results must be rendered from actual data with accurate labels and scales.'
			}
		]
	},
	sources: [
		{
			label: 'Ho et al. (2020): Denoising Diffusion Probabilistic Models',
			url: 'https://arxiv.org/abs/2006.11239'
		},
		{
			label: 'Rombach et al. (2022): High-Resolution Image Synthesis with Latent Diffusion Models',
			url: 'https://arxiv.org/abs/2112.10752'
		},
		{
			label: 'Microsoft Learn: Document Intelligence model overview',
			url: 'https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/model-overview',
			note: 'A product-specific example of document extraction capabilities; assess current task performance rather than treating feature availability as accuracy evidence.'
		}
	]
};
