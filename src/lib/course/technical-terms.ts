import type { Term } from './terms';
/** Definitions connect a mechanism to an example; they do not replace the full chapter. */
const entries: [string, string, string, string][] = [
	[
		'interval calibration',
		'Using historical forecast errors to set uncertainty bands, then checking how often later outcomes fall inside them. The forecasting lab only uses errors available at each origin.',
		'A nominal 90% band is a design target, not a guarantee; inspect coverage and width under changed conditions.',
		'M08'
	],
	[
		'parameter',
		'A stored value learned or fitted during training. Together, parameters define how the model transforms its inputs.',
		'The slope and intercept of the collections model are two parameters.',
		'M03'
	],
	[
		'hyperparameter',
		'A configuration choice that governs the model or training procedure rather than being fitted as an ordinary model weight.',
		'Choose the learning rate using development evidence, not a final test score.',
		'M04'
	],
	[
		'loss',
		'A numerical measure of prediction error used as a training objective. The chosen loss determines what improvement training rewards.',
		'Mean squared error penalizes a USD 20 miss more than four USD 5 misses.',
		'M03'
	],
	[
		'residual',
		'The difference between a prediction and its observed outcome, with a declared sign convention.',
		'With prediction minus actual, predicting 90 when actual is 100 gives a residual of −10.',
		'M03'
	],
	[
		'learning rate',
		'The size multiplier used by an optimizer when updating parameters. Too large a step can overshoot; too small a step can learn slowly.',
		'The regression lab lets you compare the same updates with different step sizes.',
		'M03'
	],
	[
		'optimizer',
		'The algorithm that turns loss-gradient information into parameter updates. It may retain additional state such as moving averages.',
		'Gradient descent takes a step opposite the loss gradient; Adam also tracks gradient statistics.',
		'M06'
	],
	[
		'batch',
		'The group of training examples used together to calculate an update or a set of predictions.',
		'A batch of 16 invoice records provides one average training gradient.',
		'M06'
	],
	[
		'epoch',
		'One pass through the declared training dataset. It is a counting convention, not a guarantee of convergence or learning quality.',
		'Ten epochs revisit the training records ten times; they do not create ten independent datasets.',
		'M06'
	],
	[
		'bias',
		'In a model unit, an added parameter that shifts its output before activation. In evaluation, statistical bias means a systematic tendency, so context matters.',
		'The intercept in a line is a bias parameter; repeatedly underforecasting cash is a different use of the word.',
		'M06'
	],
	[
		'activation',
		'The computed output of a unit or layer for a particular input, often after a nonlinear transformation.',
		'A new invoice changes the hidden activations without changing the stored weights.',
		'M06'
	],
	[
		'ReLU',
		'Rectified linear unit: a nonlinear function that returns zero for negative inputs and the input itself for positive inputs.',
		'An input of −0.1 becomes 0; an input of 0.3 remains 0.3.',
		'M06'
	],
	[
		'sigmoid',
		'A smooth function that maps a real-valued score into the interval from zero to one. Its output is not automatically a calibrated probability.',
		'A binary classifier converts its final score to an output near 0.7 before applying a review threshold.',
		'M05'
	],
	[
		'baseline',
		'A simple, explicit comparison method that a more complex approach must improve on for the task and constraints.',
		'A seasonal naive forecast predicts this December using the previous December.',
		'M08'
	],
	[
		'prevalence',
		'The share of cases with the outcome of interest in a defined population or sample.',
		'If 20 of 200 invoices are late, observed lateness prevalence is 10%.',
		'M05'
	],
	[
		'confusion matrix',
		'Counts comparing predicted classes with observed classes: true positives, false positives, false negatives, and true negatives.',
		'A flagged on-time invoice is a false positive when late payment is the positive class.',
		'M05'
	],
	[
		'RMSE',
		'Root mean squared error: square errors, average them, then take the square root. Its units match the target and large misses have greater influence than in MAE.',
		'A single large cash shortfall can raise RMSE substantially even when many months have small errors.',
		'M08'
	],
	[
		'rolling origin',
		'A forecasting evaluation that repeatedly moves the forecast date forward while using only information available at each date.',
		'Fit through March to predict April, then through April to predict May.',
		'M08'
	],
	[
		'horizon',
		'How far ahead of the forecast origin the target lies. Performance must be assessed at the horizon used for the decision.',
		'A June forecast made at March month-end has a three-month horizon.',
		'M08'
	],
	[
		'seasonality',
		'A pattern that tends to recur at a fixed calendar or operational frequency. It may change or disappear.',
		'Collections may rise each December; that pattern is evidence to test rather than an automatic rule.',
		'M08'
	],
	[
		'gross profit',
		'Revenue less the cost of goods sold under the classification used in the example. It is an amount, not a margin percentage or cash flow.',
		'Revenue of 1,200 less COGS of 780 gives gross profit of 420.',
		'M14'
	],
	[
		'gross margin',
		'Gross profit divided by revenue, usually expressed as a percentage. The denominator matters when comparing periods.',
		'Gross profit 420 divided by revenue 1,200 is a 35% gross margin.',
		'M14'
	],
	[
		'COGS',
		'Cost of goods sold: costs classified as relating to the goods sold in the period. Specific treatment depends on applicable accounting rules and facts.',
		'The course separately supplies materials, freight, and warehouse amounts when a case needs their classification.',
		'M14'
	],
	[
		'cardinality',
		'How many records can correspond across a relationship, such as one customer to many invoices.',
		'Joining two one-to-many child tables can multiply combinations and overstate totals.',
		'M09'
	],
	[
		'primary key',
		'A field or combination of fields intended to uniquely identify a row in a table. Uniqueness must be validated.',
		'An invoice ID should identify one invoice header within its declared scope.',
		'M09'
	],
	[
		'foreign key',
		'A field referencing the identifying key of a record in another table. Validity and allowed missing references depend on the data contract.',
		'A payment allocation carries an invoice ID linking it to the invoice header.',
		'M09'
	],
	[
		'filter context',
		'The set of filters affecting a calculation in a reporting model, including selections from visuals and related tables.',
		'Selecting Cedar changes the invoices and payments contributing to its collection-rate measure.',
		'M09'
	],
	[
		'measure',
		'A calculation evaluated over data in the current report context, rather than a fixed value stored on every row.',
		'A collection-rate measure divides total matched payments by total invoiced amounts in the selected context.',
		'M09'
	],
	[
		'API',
		'Application programming interface: a specified way for software components to request operations or exchange information.',
		'An invoice-read API defines required arguments, permissions, returned fields, and errors.',
		'M17'
	],
	[
		'JSON',
		'A text format for structured values such as objects, arrays, strings, numbers, booleans, and null. Valid syntax does not prove valid meaning.',
		'{"amountMinor":12345,"currency":"USD"} is an object; a schema must still check what those fields permit.',
		'M17'
	],
	[
		'schema',
		'A specification for the shape, types, and constraints of data. It supports validation but does not by itself establish factual accuracy.',
		'A tool may require amountMinor to be an integer and currency to equal USD.',
		'M17'
	],
	[
		'checkpoint',
		'A saved description of a process or model state used for inspection or recovery. Correct recovery also depends on external effects and versions.',
		'A saved queue-operation key helps inspect whether a timed-out review item already exists.',
		'M19'
	],
	[
		'pretraining',
		'An initial training stage that learns broad representations or prediction behavior from a large training corpus before later adaptation.',
		'A language model learns next-token patterns before being trained to follow particular instructions.',
		'M13'
	],
	[
		'post-training',
		'Training after a base model has been pretrained, often to improve instruction following, preference alignment, or particular capabilities.',
		'Supervised instruction examples and preference-based optimization are different possible post-training procedures.',
		'M13'
	],
	[
		'self-supervised learning',
		'Learning from targets derived from the data itself rather than separately supplied human task labels. It still uses a training objective and targets.',
		'A text sequence supplies its own next-token targets.',
		'M11'
	],
	[
		'transfer learning',
		'Using representations or parameters learned on one task or dataset to help another. The benefit must be measured and can be negative.',
		'Compare source-pretrained and randomly initialized networks under the same target-data budget.',
		'M07'
	],
	[
		'reward model',
		'A learned model that scores outputs or behavior as a proxy for preferences or another objective. Optimizing it can exploit imperfections in that proxy.',
		'Preference comparisons can train a scorer used during a language model’s post-training.',
		'M13'
	],
	[
		'temperature',
		'A decoding setting that rescales next-token scores before sampling. Lower values tend to concentrate probability; it does not verify an answer.',
		'A low-temperature model can confidently repeat an unsupported freight explanation.',
		'M12'
	],
	[
		'greedy decoding',
		'Selecting the highest-scoring next token at every generation step. Local choices do not guarantee the globally best or factually correct sequence.',
		'The tiny model’s zero-temperature setting chooses the top token rather than sampling.',
		'M12'
	],
	[
		'top-k',
		'A sampling restriction that considers only a fixed number of highest-scoring candidate tokens at each step.',
		'Top-k of 10 samples among the ten leading candidates after applying the configured scoring procedure.',
		'M12'
	],
	[
		'top-p',
		'A sampling restriction that keeps a leading set of tokens covering a chosen cumulative probability mass. The number of retained tokens can change by step.',
		'Top-p of 0.9 retains enough leading candidates to reach at least 90% of the distribution.',
		'M12'
	],
	[
		'layer normalization',
		'A normalization operation applied to features within a representation to stabilize numerical behavior. Variants differ; RMS normalization is related but does not subtract the mean.',
		'The course’s tiny transformer uses RMS normalization and identifies that architectural choice explicitly.',
		'M12'
	],
	[
		'feed-forward',
		'A transformation that sends an input through learned layers without recurrent feedback. In a transformer block, it commonly transforms each token representation separately.',
		'Attention mixes information across positions; the feed-forward sublayer then transforms each position’s features.',
		'M12'
	],
	[
		'query vector',
		'A learned projection of a representation used to score which key vectors are relevant in attention. It is a numerical vector, not an English question.',
		'The current token’s query is compared with keys at permitted earlier positions.',
		'M12'
	],
	[
		'key vector',
		'A learned projection compared with a query to form attention scores. Key vectors are distinct from database primary keys.',
		'Two earlier tokens can receive different attention scores for the same query.',
		'M12'
	],
	[
		'value vector',
		'A learned projection containing the information mixed by attention after the scores have been normalized.',
		'Shares 0.3 and 0.7 blend two value vectors into one weighted result.',
		'M12'
	],
	[
		'context assembly',
		'The application process of selecting and organizing instructions, messages, evidence, and tool results for a model request.',
		'An expense assistant includes the policy effective at the expense date and omits documents the user cannot access.',
		'M20'
	],
	[
		'cosine similarity',
		'A comparison of vector directions, based on their normalized inner product. It measures a defined geometric relationship, not truth or authorization.',
		'Term-vector retrieval can rank documents with similar word usage without a learned embedding model.',
		'M16'
	],
	[
		'chunking',
		'Dividing source material into smaller units for indexing, retrieval, or processing while preserving enough context and provenance.',
		'A policy limit separated from its effective date can become a misleading retrieval chunk.',
		'M16'
	],
	[
		'sandbox',
		'An execution environment that restricts what code or tools can access or change. Its guarantees come from enforcement, not an instruction to behave.',
		'A calculation tool can be limited to supplied numbers with no file or network access.',
		'M19'
	],
	[
		'observability',
		'The ability to investigate a system through useful records such as traces, logs, metrics, and state evidence.',
		'A run ID links a user request to retrieved documents, validated tool arguments, results, and review outcomes.',
		'M22'
	],
	[
		'regularization',
		'A technique that constrains or discourages some fitted solutions to improve behavior beyond training examples. It is selected using development evidence.',
		'A weight penalty discourages large weights; it does not guarantee that a model generalizes.',
		'M04'
	],
	[
		'training data',
		'Examples used to fit model parameters. Their availability, quality, and relationship to the deployment task matter.',
		'The invoice model learns from its training partition; final-case labels do not enter its updates.',
		'M04'
	],
	[
		'validation data',
		'Examples used to select or tune the modeling procedure. Repeated consultation makes them part of development.',
		'Choose capacity and regularization using validation error before committing to a final evaluation.',
		'M04'
	],
	[
		'test data',
		'Examples reserved to assess a selected, frozen procedure. Once results guide a repair, the cases also become development evidence.',
		'Preserve the first final result even when a later revised model scores better on the same cases.',
		'M04'
	]
];
export const technicalTerms: Term[] = entries.map(([term, definition, example, module]) => ({
	term,
	definition,
	example,
	module
}));
export const termModuleOverrides: Record<string, string> = {
	'neural network': 'M06',
	'deep learning': 'M07',
	'large language model (llm)': 'M11',
	llm: 'M11',
	hallucination: 'M14',
	'retrieval-augmented generation (rag)': 'M16',
	rag: 'M16',
	agent: 'M18',
	workflow: 'M18',
	evaluation: 'M22',
	'star schema': 'M09',
	precision: 'M05',
	recall: 'M05',
	classification: 'M05',
	regression: 'M03',
	mae: 'M03',
	'data grain': 'M02',
	features: 'M02',
	labels: 'M02',
	'data leakage': 'M02',
	receivables: 'M02',
	'segregation of duties': 'M19'
};
