export const sources: Record<
	string,
	{ title: string; publisher: string; url: string; note: string }
> = {
	history: {
		title: 'AI & Robotics: a historical timeline',
		publisher: 'Computer History Museum',
		url: 'https://www.computerhistory.org/timeline/ai-robotics/',
		note: 'Primary historical context for early neural networks, symbolic AI, and later milestones.'
	},
	ml: {
		title: 'Machine Learning Crash Course',
		publisher: 'Google for Developers',
		url: 'https://developers.google.com/machine-learning/crash-course',
		note: 'Extend the intuition here with formal lessons on models, data, neural networks, and evaluation.'
	},
	overfitting: {
		title: 'Generalization and overfitting',
		publisher: 'Google for Developers',
		url: 'https://developers.google.com/machine-learning/crash-course/overfitting/overfitting',
		note: 'A visual explanation of why fitting old examples is not the same as predicting new ones.'
	},
	llm: {
		title: 'Introduction to large language models',
		publisher: 'Google for Developers',
		url: 'https://developers.google.com/machine-learning/crash-course/llm',
		note: 'Language modeling, tokenization, and the transition to transformer architectures.'
	},
	tuning: {
		title: 'Fine-tuning, distillation, and prompt engineering',
		publisher: 'Google for Developers',
		url: 'https://developers.google.com/machine-learning/crash-course/llm/tuning',
		note: 'Compare approaches that change model behavior and how they differ from supplying task context.'
	},
	transformer: {
		title: 'Attention Is All You Need',
		publisher: 'Vaswani et al. · 2017',
		url: 'https://arxiv.org/abs/1706.03762',
		note: 'The original transformer paper. Optional technical reading; equations are not required for this course.'
	},
	finance: {
		title: 'AI in Microsoft Finance',
		publisher: 'Microsoft · Frontier Finance',
		url: 'https://www.microsoft.com/en-us/frontierfinance/ai-in-finance.aspx',
		note: 'Published examples from one organization, including reconciliation, collections, and forecasting. Outcomes are context-specific.'
	},
	agents: {
		title: 'Building effective agents',
		publisher: 'Anthropic Engineering',
		url: 'https://www.anthropic.com/engineering/building-effective-agents',
		note: 'Useful distinctions between workflows and agents, plus design patterns for tool-using systems.'
	},
	skills: {
		title: 'Agent Skills overview and specification',
		publisher: 'Agent Skills',
		url: 'https://agentskills.io/home',
		note: 'The open format for reusable instructions, scripts, references, and templates.'
	},
	harness: {
		title: 'Decoupling the brain from the hands',
		publisher: 'Anthropic Engineering · 2026',
		url: 'https://www.anthropic.com/engineering/managed-agents',
		note: 'A current example of how sessions, harnesses, and execution environments can be separated.'
	},
	risk: {
		title: 'AI Risk Management Framework',
		publisher: 'NIST',
		url: 'https://www.nist.gov/itl/ai-risk-management-framework',
		note: 'A framework for managing AI risk, with a companion generative-AI profile. Guidance, not a claim of course certification.'
	},
	powerbi: {
		title: 'Understand star schema for Power BI',
		publisher: 'Microsoft Learn',
		url: 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema',
		note: 'Practical guidance for fact tables, dimensions, relationships, and a clear semantic model.'
	}
};
export const glossary: {
	term: string;
	category: string;
	definition: string;
	example: string;
	chapter: string;
}[] = [
	[
		'AI',
		'AI foundations',
		'Systems that perform tasks associated with intelligence, using approaches such as rules or learned patterns.',
		'A policy checker and a receipt recognizer can both contribute to an intelligent workflow.',
		'foundations'
	],
	[
		'GOFAI',
		'AI foundations',
		'Good old-fashioned AI: explicit symbolic representations and reasoning rules.',
		'If a receipt is missing, request evidence.',
		'foundations'
	],
	[
		'Machine learning',
		'AI foundations',
		'Fitting patterns from examples to perform a task on new data.',
		'Predict whether a newly issued invoice will be paid late.',
		'machine-learning'
	],
	[
		'Feature',
		'Data science',
		'An input available to a model when making a prediction.',
		'Payment terms known on the invoice issue date.',
		'machine-learning'
	],
	[
		'Label',
		'Data science',
		'The target outcome used in supervised learning.',
		'Whether a historical invoice was actually paid late.',
		'machine-learning'
	],
	[
		'Regression',
		'Data science',
		'Predicting a numerical quantity.',
		'Estimate cash collections next month.',
		'machine-learning'
	],
	[
		'Classification',
		'Data science',
		'Predicting a category or category probability.',
		'Flag a transaction for review or no review.',
		'machine-learning'
	],
	[
		'Training set',
		'Data science',
		'Examples used to fit the model’s parameters.',
		'Earlier months of historical invoices.',
		'machine-learning'
	],
	[
		'Validation set',
		'Data science',
		'Separate examples used to select models or tune hyperparameters.',
		'Compare two approaches on later held-out months.',
		'machine-learning'
	],
	[
		'Test set',
		'Data science',
		'Held-out examples used for a final estimate after model choices.',
		'A final future period untouched during tuning.',
		'machine-learning'
	],
	[
		'Data leakage',
		'Data science',
		'Information enters training or evaluation that would not be legitimately available at prediction time.',
		'Using the eventual payment date to predict late payment at issue.',
		'machine-learning'
	],
	[
		'Overfitting',
		'Data science',
		'Learning sample-specific quirks that do not transfer well to new examples.',
		'Excellent old-invoice accuracy, poor new-customer accuracy.',
		'machine-learning'
	],
	[
		'Underfitting',
		'Data science',
		'A model is too limited or insufficiently fitted to capture important patterns.',
		'Predicting the same collection amount despite clear seasonality.',
		'machine-learning'
	],
	[
		'Generalization',
		'Data science',
		'Remaining useful on relevant, unseen examples.',
		'Performing well on next quarter’s invoices.',
		'machine-learning'
	],
	[
		'Regularization',
		'Data science',
		'Constraints or training choices that discourage an overly complex fit.',
		'Limit tree depth or penalize large weights.',
		'machine-learning'
	],
	[
		'Drift',
		'Data science',
		'A change in data or its relationship to outcomes over time.',
		'Customer payment behavior changes after a market shock.',
		'machine-learning'
	],
	[
		'Precision',
		'Data science',
		'Of the cases flagged positive, the share that are actually positive.',
		'Of invoices flagged late, how many truly became late?',
		'machine-learning'
	],
	[
		'Recall',
		'Data science',
		'Of the actual positive cases, the share the model successfully flags.',
		'Of all late invoices, how many did the model catch?',
		'machine-learning'
	],
	[
		'MAE',
		'Data science',
		'Mean absolute error: the average size of numeric misses, ignoring their direction.',
		'An average collection forecast miss of $8,000.',
		'neural-networks'
	],
	[
		'Neural network',
		'AI foundations',
		'Connected layers of numerical operations with adjustable parameters.',
		'A model combining invoice features to estimate a risk score.',
		'neural-networks'
	],
	[
		'Deep learning',
		'AI foundations',
		'Machine learning using neural networks with multiple processing layers.',
		'Recognizing document features across varied invoice images.',
		'neural-networks'
	],
	[
		'Backpropagation',
		'AI foundations',
		'An efficient method for calculating how parameters contribute to training loss.',
		'Information the optimizer uses to adjust network weights.',
		'neural-networks'
	],
	[
		'Inference',
		'AI foundations',
		'Using a fitted model to produce an output.',
		'Scoring a newly received invoice.',
		'neural-networks'
	],
	[
		'LLM',
		'Language models',
		'A large language model trained to model language patterns; many generate text token by token.',
		'Draft an explanation from a supplied variance table.',
		'language-models'
	],
	[
		'Hallucination',
		'Language models',
		'Generated content that is unsupported or false.',
		'An invented policy citation.',
		'language-models'
	],
	[
		'RAG',
		'Language models',
		'Retrieval-augmented generation: retrieving relevant evidence and supplying it for generation.',
		'Retrieve the approved travel policy before answering.',
		'language-models'
	],
	[
		'Fine-tuning',
		'Language models',
		'Additional training that adjusts a model’s parameters.',
		'Train on reviewed examples to improve a repeated output format.',
		'language-models'
	],
	[
		'Generative AI',
		'Language models',
		'AI that creates content such as text, images, audio, or code.',
		'Draft a report or create an educational illustration.',
		'generative-ai'
	],
	[
		'Token',
		'Language models',
		'A model-specific unit of input or output; in text, often a word or word fragment.',
		'A currency amount can be split into several tokens.',
		'tokens'
	],
	[
		'Context window',
		'Language models',
		'The finite information budget a model can process for a request.',
		'Instructions, evidence, tool results, and response space share limited room.',
		'tokens'
	],
	[
		'Embedding',
		'Language models',
		'A learned numerical representation that captures useful relationships.',
		'Represent policy passages to search for related meaning.',
		'transformers'
	],
	[
		'Transformer',
		'Language models',
		'A neural architecture built around attention and other processing layers.',
		'A foundation for many modern language models.',
		'transformers'
	],
	[
		'Attention',
		'Language models',
		'A mechanism for combining information across positions using learned relevance.',
		'Use neighboring words to distinguish a river bank from a lender.',
		'transformers'
	],
	[
		'Workflow',
		'Building systems',
		'A process with predefined steps.',
		'Import files, match records, create an exception table.',
		'applications-agents'
	],
	[
		'Agent',
		'Building systems',
		'A system that uses model outputs to choose some next actions based on observations.',
		'Choose which permitted records to inspect for an exception.',
		'applications-agents'
	],
	[
		'Tool',
		'Building systems',
		'An operation exposed through an interface that application code can execute.',
		'Query an authorized ledger or run a calculation.',
		'tools'
	],
	[
		'Skill',
		'Building systems',
		'Reusable instructions and resources for a class of tasks.',
		'A versioned reconciliation playbook and template.',
		'skills'
	],
	[
		'Harness',
		'Building systems',
		'The runtime around an agent managing context, tools, state, limits, and execution.',
		'A controlled loop that logs actions and requests approvals.',
		'harnesses'
	],
	[
		'Prompt injection',
		'Building systems',
		'Untrusted content attempting to redirect a model or agent.',
		'An invoice instructing an agent to export confidential data.',
		'tools'
	],
	[
		'Idempotency',
		'Building systems',
		'Repeated requests for the same operation do not create additional effects.',
		'A retried payment submission does not create a second payment.',
		'tools'
	],
	[
		'Evaluation',
		'Building systems',
		'Measuring behavior against defined criteria on representative cases.',
		'Test normal, ambiguous, malicious, and failure cases.',
		'harnesses'
	],
	[
		'Data grain',
		'Accounting & finance',
		'What one row in a dataset represents.',
		'One invoice is a different grain from one payment.',
		'generative-ai'
	],
	[
		'Star schema',
		'Data science',
		'A model organizing facts around descriptive dimensions.',
		'An invoice fact related to date, customer, and account dimensions.',
		'applications-agents'
	],
	[
		'Reconciliation',
		'Accounting & finance',
		'Comparing records and explaining differences with evidence.',
		'Match the cash ledger to the bank statement.',
		'foundations'
	],
	[
		'Accounts receivable',
		'Accounting & finance',
		'Money customers owe the business.',
		'An unpaid customer invoice.',
		'machine-learning'
	],
	[
		'Accounts payable',
		'Accounting & finance',
		'Money the business owes suppliers.',
		'A supplier invoice awaiting payment.',
		'foundations'
	],
	[
		'Accrual',
		'Accounting & finance',
		'Recognition of income or expenses in the appropriate period even when cash moves at another time.',
		'Record an incurred expense before payment, when the recognition criteria are met.',
		'neural-networks'
	],
	[
		'Materiality',
		'Accounting & finance',
		'Whether an omission or error could influence users’ decisions in context.',
		'Assess the significance and nature of an error, not just a universal percentage.',
		'machine-learning'
	],
	[
		'Working capital',
		'Accounting & finance',
		'Commonly current assets minus current liabilities; operating definitions may differ.',
		'State whether cash and debt are included in your analysis.',
		'generative-ai'
	],
	[
		'Segregation of duties',
		'Accounting & finance',
		'Separating incompatible responsibilities to reduce error and misuse.',
		'Different roles prepare, approve, and release a payment.',
		'generative-ai'
	],
	[
		'Cutoff',
		'Accounting & finance',
		'Assigning activity to the appropriate reporting period.',
		'Record a received service in the correct period.',
		'machine-learning'
	],
	[
		'Audit trail',
		'Accounting & finance',
		'Records that let a reviewer reconstruct actions and evidence.',
		'A log linking source invoice, proposed entry, approval, and posting.',
		'harnesses'
	]
].map(([term, category, definition, example, chapter]) => ({
	term,
	category,
	definition,
	example,
	chapter
}));
