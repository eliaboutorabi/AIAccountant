import type { CourseModule } from '../types';
import { p, note, table, worked, steps, reflect, lab, section, check } from './content-helpers';
export const m11: CourseModule = {
	id: 'M11',
	day: 3,
	title: 'Language modeling, tokens, and embeddings',
	subtitle: 'Follow a sentence from readable words to the numbers a language model can learn from.',
	minutes: 55,
	prerequisites: ['M06', 'M07'],
	objectives: [
		'Explain how next-token prediction can learn useful language patterns without being a truth-checking objective.',
		'Distinguish characters, words, tokens, token IDs, and embeddings using an actual tokenizer.',
		'Explain why the same word can need a different representation in different contexts.',
		'Estimate and test the consequences of tokenization for financial documents, identifiers, and context limits.'
	],
	why: 'Willow wants an assistant that can read management reports and explain results. How can a system trained to predict the next piece of text become useful at that task, and why can it still produce convincing errors?',
	sections: [
		section(
			'prediction',
			'Begin with a missing continuation',
			'A prediction task supplies a learning signal; it does not supply an accounting qualification.',
			p(
				'Read this fragment: “The invoice remains unpaid, so the balance is in accounts …”. “Receivable” is a plausible continuation if Willow issued the invoice to a customer. “Payable” could be appropriate if Willow received it from a supplier. Language contains patterns, but the fragment has not supplied every fact needed to choose the accounting perspective. A model estimates what continuation fits its input; a professional must also ask which entity and records the statement describes.',
				'A language model assigns probabilities to sequences of language. In the next-token setting used by many generative LLMs, it receives a prefix and predicts the following token. During training, the next token in an example provides the target. No person needs to label each sentence “this is a noun” or “this is an explanation”: the text itself supplies many input–target pairs. This is a form of self-supervised learning, built using a prediction loss much like the losses you studied on Day 1.',
				'Consider the sentence “Revenue increased because prices rose.” Training can reward predicting “prices” after the prefix. To predict well across many documents, a model benefits from learning grammar, relationships between concepts, common report structures, and patterns of reasoning. That does not mean its loss function independently checks whether prices actually rose at Willow. A false sentence can be a perfectly learnable training example. Useful language ability and factual reliability are related engineering concerns, not the same measurement.'
			),
			note(
				'mechanism',
				'If you are entering the course here',
				'An input is the information supplied for a prediction. Parameters are stored numbers inside the model; activations are the values its calculations produce for this particular input. A loss measures how poorly a prediction fits an observed target, and training adjusts parameters to reduce that loss. Inference uses the current parameters to produce a result. M06 and M07 provide the full worked learning loop and representation practice; this recap names the prerequisites without replacing them.'
			),
			note(
				'accounting',
				'Whose receivable? Whose payable?',
				'If Willow sells goods on credit, it records a receivable: a claim against the customer. The customer may record a payable: an obligation to Willow. The same commercial event appears differently in each entity’s books. Always establish whose records an assistant is interpreting.'
			),
			worked(
				'One sentence, several training examples',
				'Use the simplified word sequence “the customer paid late”. This illustration treats whole words as tokens only to expose the task.',
				[
					'Prefix “the” → observed next word “customer”.',
					'Prefix “the customer” → observed next word “paid”.',
					'Prefix “the customer paid” → observed next word “late”.',
					'The model can score all vocabulary choices at each position. The loss penalizes allocating too little probability to the observed continuation. A different sentence might have “early” as its observed continuation.'
				],
				'The target is the observed continuation in the training text. It is not a label saying what should happen or whether the sentence is true. Real tokenizers may split these words differently.'
			)
		),
		section(
			'history',
			'From short counts to learned representations',
			'The modern model grew from earlier solutions to a concrete prediction problem.',
			p(
				'A simple historical baseline counts how often words follow short word sequences. If “accounts” was followed by “receivable” 70 times and “payable” 30 times in a small corpus, a count-based model can assign a 70% versus 30% distribution for those observed continuations. Smoothing reserves some probability for combinations not seen before. The limit is immediate: exact phrase counts become sparse as the context gets longer. A new supplier name or unfamiliar wording can leave the model with little evidence.',
				'Neural language models introduced learned representations and functions that share information across examples. Instead of treating every phrase as an isolated table entry, the model can learn similarities between words and contexts. Recurrent networks process sequences through a changing internal state; later attention mechanisms let models combine information across positions more directly. The transformer, introduced in 2017 for sequence transduction, made attention central. The next module traces its mechanism instead of treating “transformer” as a label for any chatbot.',
				'“Large” in large language model usually refers to scale of parameters and training, but there is no universal parameter count that makes a model an LLM. More parameters create capacity, not a certificate of competence. Training data quality, data quantity, architecture, compute, objectives, and evaluation all affect useful behavior. A small specialist model can be preferable for a constrained task; a broad model can be useful when the language and requests vary.'
			),
			table(
				'Three ways to think about the same prediction task',
				['Approach', 'What is learned or stored', 'A limitation to investigate'],
				[
					[
						'Short-context counts',
						'Frequencies of observed continuations',
						'Unseen wording and long-distance relationships'
					],
					[
						'Neural language model',
						'Parameters mapping representations to predictions',
						'Capacity and data may not cover the task'
					],
					[
						'Modern LLM application',
						'A trained model plus instructions, context, and often tools',
						'Application quality depends on more than model text fluency'
					]
				]
			),
			reflect(
				'A manager says, “It has read many annual reports, so it knows our September revenue.” What information is missing?',
				'Separate general patterns from entity-specific current evidence.',
				'The training may teach what revenue means and how reports are phrased. It does not establish that the model has Willow’s approved September records. We need the relevant company, period, currency, reporting basis, and source data in an authorized context or tool result, then must verify the calculation and narrative.'
			)
		),
		section(
			'tokens',
			'Text must become a sequence of IDs',
			'A token is a unit in a particular encoding, not a universal word-sized object.',
			p(
				'Computers store text as encoded symbols, but a neural model needs a finite vocabulary of input choices. A tokenizer maps text into token pieces and their integer IDs. Depending on the tokenizer, a token may represent a complete word, part of a word, punctuation, whitespace, or bytes. Many current text tokenizers use subword methods that balance common chunks against the ability to represent unfamiliar strings. Splitting a rare term into smaller pieces avoids needing a separate vocabulary entry for every supplier name.',
				'The ID is an index, like an internal record key. Token 700 is not “more valuable” than token 70, and IDs from different tokenizers are not directly comparable. The model uses each ID to select a learned embedding. Confusing IDs with meaningful numerical magnitudes would be like concluding that customer number 900 has nine times the credit risk of customer number 100.',
				'Token boundaries can be surprising. Leading spaces may be part of a token; capitalization can change the split; digits may appear in chunks; accented names and other writing systems can yield different counts. A word-count estimate is convenient for rough planning but cannot verify a particular input length. Even token counts from the wrong tokenizer can mislead. Provider APIs may add message-format overhead, and multimodal inputs use model-specific accounting. The lab exposes one named tokenizer and does not claim to reproduce every service’s billing.'
			),
			lab(
				'tokens',
				'Inspect an actual tokenizer',
				'Compare “accounts receivable”, “Accounts receivable”, an invoice ID such as “WIL-2026-009381”, and a sentence containing a non-English supplier name. Inspect the token pieces and IDs, then decode them back to the original string.',
				'Which changes will affect the count: a leading space, uppercasing the first letter, replacing a familiar word with a rare identifier? Predict before testing.',
				[
					'Record the tokenizer name and four measured counts.',
					'Identify at least one boundary that did not match your word-based intuition.',
					'Confirm whether decoding the full token sequence reconstructs the input.'
				],
				'This is a real named text tokenizer. It does not represent every model’s vocabulary, hidden message formatting, image token accounting, or commercial price.'
			),
			note(
				'warning',
				'A token limit is not a comprehension guarantee',
				'A document fitting inside a model’s supported context window only establishes a length constraint. It does not prove that the relevant clause will be retrieved internally, used correctly, or prioritized over conflicting information. We test evidence use separately in M14.'
			)
		),
		section(
			'embeddings',
			'From an ID to a learned vector',
			'A vector is an ordered list of numbers; an embedding gives that list a learned role.',
			p(
				'Suppose our illustration represents a token using four numbers: [0.2, −0.4, 0.8, 0.1]. The position of each number matters, just as the columns in a financial table have an order. In a real embedding the dimensions usually do not come with labels such as “financialness” or “risk”. They are coordinates adjusted during training because certain combinations help the model predict. We cannot infer that the third coordinate literally means profitability.',
				'An embedding table contains one learned vector for each vocabulary ID. Looking up a token retrieves its row. Training updates that table along with other model parameters. Tokens that occur in related contexts can develop useful relationships, but proximity depends on the model and its training objective. Two concepts can be related yet have opposite business effects: “increase” and “decrease” appear in similar grammatical contexts. Similarity is therefore a retrieval clue, not proof that two statements mean the same thing.',
				'A token’s initial embedding is not the end of the process. The word “bank” in “bank account” and in “river bank” starts from the same token embedding if the tokenizer assigns the same ID. Later layers combine it with surrounding information, producing contextual representations that differ. This distinction explains why a model needs more than a dictionary lookup. Attention in the next module performs one important part of that contextual mixing.',
				'Document embeddings used for retrieval are another application of representations. An embedding model converts a query or passage into a vector so that a search system can compare them. That is not the same operation as merely exposing one token’s input embedding inside a text generator. Different models, pooling methods, objectives, and dimensions can be involved. M16 will use similarity to find candidate evidence and then inspect whether that evidence actually answers the question.'
			),
			steps('A readable sentence enters a model', [
				[
					'Tokenize',
					'Split the input using the model’s specific tokenizer, producing an ordered sequence of vocabulary IDs.'
				],
				[
					'Look up vectors',
					'Retrieve each ID’s learned embedding. IDs are addresses; vectors are the numerical representations the model will transform.'
				],
				[
					'Represent order',
					'Provide information about token position or relative position so that order can affect interpretation.'
				],
				[
					'Build context',
					'Repeated model blocks transform each representation using information permitted by the architecture.'
				],
				[
					'Score continuations',
					'The final representation produces a score for each vocabulary token; a probability distribution guides next-token prediction.'
				]
			]),
			reflect(
				'Why might a similarity search return “payment received” for a query about “payment overdue”?',
				'Give one reason this can happen and one check that follows.',
				'The passages share financial vocabulary and related contexts, so their vectors may be nearby. Their business meanings are not interchangeable. Check the actual passage, entity, date, status, and whether it supports the requested claim instead of trusting a similarity score as evidence of equivalence.'
			)
		),
		section(
			'transfer',
			'What this changes in a finance project',
			'Use tokenization and representation knowledge to ask better operational questions.',
			p(
				'Willow has 400 policy pages and wants to paste everything into each request. Your first response should not be a token-to-word slogan. Identify the model and tokenizer, measure the actual input, reserve room for the answer and application instructions, and test whether the resulting context supports the task. Large input can add cost and latency while burying relevant evidence. Retrieval may reduce the input, but retrieval quality then becomes another thing to evaluate.',
				'For structured financial fields, preserve the original source alongside any model representation. A supplier ID can split into several tokens without becoming invalid, but the model may still copy it incorrectly. Exact identifiers, dates, currencies, and amounts should be validated against records or schemas. Fluent text generation is not a substitute for preserving data types and keys.',
				'In an interview, connect the mechanism to a decision. You do not need to recite an embedding dimension. Explain how text becomes IDs, why IDs select learned representations, how context changes later representations, and why all of that helps prediction without guaranteeing current company facts. Then name the evidence you would inspect: exact inputs, tokenizer, source records, output checks, and task performance on cases the system has not been tuned to.'
			)
		)
	],
	checks: [
		check(
			'm11-q1',
			0,
			'A training example contains a confidently written but false revenue claim. What does ordinary next-token training directly reward?',
			[
				'Assigning probability to its observed continuation',
				'Rejecting it because it is financially false',
				'Reconciling it to a ledger that was not supplied'
			],
			0,
			[
				'Correct. The observed text supplies the target; truth needs additional evidence and evaluation.',
				'The prediction loss does not automatically possess an independent financial truth label.',
				'An absent ledger cannot be reconciled merely because the training objective predicts text.'
			]
		),
		check(
			'm11-q2',
			1,
			'Token ID 840 is larger than token ID 84. What follows?',
			[
				'Its meaning is ten times stronger',
				'It selects a different vocabulary entry in that encoding',
				'It uses ten times as much context'
			],
			1,
			[
				'IDs are identifiers, not meaningful magnitudes.',
				'Correct. The embedding lookup uses an index; numeric order does not establish semantic magnitude.',
				'Each is one ID in the sequence. Its numeric value is not its context size.'
			]
		),
		check(
			'm11-q3',
			1,
			'Why measure an actual token count for a policy document?',
			[
				'One token always equals four characters',
				'Every model shares the same tokenizer',
				'Whitespace, names, and encoding choice can change the count'
			],
			2,
			[
				'A rough average is not a rule for a specific string.',
				'Different vocabularies and algorithms can split the same text differently.',
				'Correct. Use the intended tokenizer and account separately for application overhead.'
			]
		),
		check(
			'm11-q4',
			2,
			'The same “bank” token appears in two meanings. Which description best fits a transformer?',
			[
				'The input embedding may be the same, while later contextual representations differ',
				'Every meaning must have a different token ID',
				'Its vector is permanently a dictionary definition'
			],
			0,
			[
				'Correct. Context-dependent transformations distinguish uses after the initial lookup.',
				'A tokenizer generally does not assign a separate ID for every possible meaning.',
				'Learned vectors are numerical representations transformed by the model, not fixed prose definitions.'
			]
		),
		check(
			'm11-q5',
			3,
			'A relevant policy fits within the context limit, but the answer uses an obsolete clause. What conclusion is justified?',
			[
				'The tokenizer cannot decode the text',
				'Length eligibility did not establish correct evidence use',
				'The model necessarily changed its weights'
			],
			1,
			[
				'A wrong answer does not imply a tokenizer decoding failure.',
				'Correct. Context capacity and reliable use of evidence are distinct concerns.',
				'Supplying context ordinarily changes inputs, not weights.'
			]
		),
		check(
			'm11-q6',
			2,
			'A search returns a passage with a high embedding similarity. What should happen next?',
			[
				'Treat its claims as approved because the score is high',
				'Replace exact supplier keys with the vector',
				'Inspect its support, version, scope, and authority'
			],
			2,
			[
				'Similarity measures model-defined relatedness, not approval or truth.',
				'Keep authoritative identifiers. A vector serves search, not exact identity.',
				'Correct. Search narrows the evidence candidates; it does not complete the analysis.'
			]
		)
	],
	assignment: {
		title: 'Write a language-model data brief',
		scenario:
			'Willow proposes sending a 120-page policy pack, supplier IDs, and a September variance table to a drafting assistant. The sponsor says, “It understands English, so the rest is formatting.”',
		tasks: [
			'Trace one sentence through tokenization, IDs, embeddings, and contextual representations.',
			'List three input risks and a concrete measurement or check for each.',
			'Explain why good next-token prediction does not prove Willow’s financial claims.',
			'State what you would keep in authoritative structured form.'
		],
		deliverable:
			'A 300–500-word brief with one measured tokenizer example and three proposed checks.',
		rubric: [
			{
				criterion: 'Mechanism is connected',
				evidence:
					'IDs are distinct from vectors, and contextual transformation follows embedding lookup.'
			},
			{
				criterion: 'Operational checks are testable',
				evidence:
					'Named tokenizer, actual length measurement, exact-field validation, and evidence-use testing.'
			},
			{
				criterion: 'Reliability is calibrated',
				evidence:
					'Explains prediction versus factual support without claiming that models cannot ever be useful.'
			}
		],
		workedSolution: [
			'A sentence is encoded into model-specific IDs; those IDs select learned embedding rows. Model layers combine permitted contextual information, producing representations used to score possible next tokens. ID magnitude has no accounting meaning.',
			'Measure the policy pack with the intended tokenizer, allowing for instructions and output. Test a set of policy questions including obsolete and conflicting clauses. Check all supplier IDs, dates, and amounts against source records rather than accepting copied text by appearance.',
			'Next-token training rewards observed continuations, which can include errors. The system therefore needs current authorized evidence and task evaluation. Preserve table keys, currencies, numeric types, document versions, and source IDs in structured data, using generated prose as a reviewed interpretation.'
		]
	},
	interview: {
		question: 'How does a language model represent text, and why does that matter in finance?',
		strongAnswer: [
			'A tokenizer encodes text as model-specific IDs. Each ID selects a learned vector; later layers incorporate context and predict a distribution over possible next tokens. A token is not necessarily a word, and an ID is not a meaningful numerical value.',
			'That mechanism supports flexible language work, but it does not establish that a draft reflects our approved records. I would measure input size, preserve exact identifiers and financial values, supply current evidence, and evaluate supported answers separately from fluent output.'
		],
		followUps: [
			{
				question: 'Would a larger context window solve all policy-answering errors?',
				answer:
					'No. It permits more input but does not ensure appropriate attention, conflict resolution, or version selection. Test long-context evidence use and compare retrieval with full-context approaches on representative questions.'
			},
			{
				question: 'Why not use embedding similarity to decide whether two invoices are duplicates?',
				answer:
					'It can find candidates with similar descriptions, but duplication depends on exact and contextual evidence such as supplier, invoice ID, amount, currency, dates, and legitimate recurring charges. Evaluate false matches and use deterministic checks plus review where needed.'
			}
		]
	},
	sources: [
		{
			label: 'Google: Introduction to large language models',
			url: 'https://developers.google.com/machine-learning/crash-course/llm'
		},
		{
			label: 'Bengio et al. (2003): A Neural Probabilistic Language Model',
			url: 'https://www.jmlr.org/papers/v3/bengio03a.html'
		},
		{
			label: 'Vaswani et al. (2017): Attention Is All You Need',
			url: 'https://arxiv.org/abs/1706.03762'
		},
		{
			label: 'gpt-tokenizer: encoding and decoding implementation',
			url: 'https://github.com/niieani/gpt-tokenizer',
			note: 'The interactive text tokenizer uses this MIT-licensed implementation; it is not a universal tokenizer.'
		}
	]
};
