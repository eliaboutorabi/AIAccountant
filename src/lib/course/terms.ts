import { technicalTerms, termModuleOverrides } from './technical-terms';
import { glossary } from '$lib/data/resources';
export type Term = { term: string; definition: string; example: string; module: string };
const legacyMap: Record<string, string> = {
	foundations: 'M01',
	'machine-learning': 'M04',
	'deep-learning': 'M06',
	llms: 'M13',
	'generative-ai': 'M15',
	tokens: 'M11',
	transformers: 'M12',
	agents: 'M18',
	tools: 'M17',
	skills: 'M19',
	harnesses: 'M19',
	prompting: 'M20'
};
const additions: Term[] = [
	...technicalTerms,
	{
		term: 'vector',
		definition:
			'An ordered list of numbers. The position of each number matters. A model can represent a token, invoice, or image as a vector and learn to transform those numbers.',
		example:
			'[0.2, −0.4, 0.8] is a three-dimensional vector; the dimensions need not have human-readable meanings.',
		module: 'M07'
	},
	{
		term: 'logit',
		definition:
			'An unnormalized score produced by a model before converting scores to probabilities. A larger score favors an option, but a score alone is not a percentage or a confidence guarantee.',
		example: 'A next-token model produces one logit for every token in its vocabulary.',
		module: 'M12'
	},
	{
		term: 'softmax',
		definition:
			'A transformation that turns a list of scores into positive shares summing to one. Increasing one score raises its share relative to the others.',
		example:
			'Attention uses normalized shares to mix value vectors; an output layer uses shares to predict tokens.',
		module: 'M12'
	},
	{
		term: 'causal mask',
		definition:
			'A restriction that prevents a token position from using later token positions in a next-token model. Here causal means left-to-right information access, not proof of business cause and effect.',
		example:
			'While training on “cash was collected”, the position at “was” cannot look ahead at “collected”.',
		module: 'M12'
	},
	{
		term: 'residual connection',
		definition:
			'A path that adds a block’s computed change to the representation that entered the block. It preserves a route for information and gradients through a deep network.',
		example:
			'A transformer block updates an existing token representation rather than discarding it entirely.',
		module: 'M12'
	},
	{
		term: 'gradient',
		definition:
			'A local indication of how a small change in a trainable parameter would change the loss. An optimizer uses gradients to decide which direction to adjust parameters.',
		example:
			'If increasing a weight locally increases the loss, a small gradient-descent update moves that weight down.',
		module: 'M03'
	},
	{
		term: 'backpropagation',
		definition:
			'The procedure that works backward through a model’s calculations to compute how each parameter contributed to the loss gradient. The optimizer then uses those gradients to change weights.',
		example:
			'A prediction error is traced through the output and hidden layers to compute parameter updates.',
		module: 'M06'
	},
	{
		term: 'cross-entropy',
		definition:
			'A prediction loss that penalizes assigning little probability to the observed correct outcome. It rewards useful probability distributions, not just whether the top guess happens to be right.',
		example: 'Assigning 0.8 to the observed next token incurs less loss than assigning 0.01 to it.',
		module: 'M13'
	},
	{
		term: 'calibration',
		definition:
			'Agreement between predicted probabilities and observed frequencies across comparable cases. It is different from ranking cases well or selecting a useful decision threshold.',
		example:
			'Among many invoices scored near 20% late-payment risk, approximately 20% should turn out late if the scores are calibrated for that population.',
		module: 'M05'
	},
	{
		term: 'percentage points',
		definition:
			'The arithmetic difference between two percentages. A relative percentage change instead divides the change by the starting value.',
		example:
			'Gross margin falling from 40% to 35% is a decrease of 5 percentage points, or 12.5% relative to the initial margin.',
		module: 'M14'
	},
	{
		term: 'grain',
		definition:
			'What exactly one record represents. Define it before counting, joining, or summing data; tables with different grains can multiply amounts if joined carelessly.',
		example: 'One row per invoice differs from one row per invoice line or per payment allocation.',
		module: 'M02'
	},
	{
		term: 'inference',
		definition:
			'Using trained parameters to calculate an output for a supplied input. Inference normally leaves those parameters unchanged, even when the context changes.',
		example:
			'Reading a new policy into a prompt changes the information used for this answer, not the model’s learned weights.',
		module: 'M03'
	},
	{
		term: 'idempotency',
		definition:
			'A property that makes repeating an operation have the same intended effect as performing it once. Systems often use a unique operation key to prevent duplicate writes after retries.',
		example: 'Retrying a request after a timeout should not create a second payment.',
		module: 'M17'
	},
	{
		term: 'context window',
		definition:
			'The bounded amount of tokenized information a model can work with in a request, subject to model and application limits. Fitting information inside it does not guarantee that the model will use all of it reliably.',
		example:
			'Instructions, retrieved policy excerpts, conversation messages, and tool results compete for available context.',
		module: 'M14'
	},
	{
		term: 'autoregressive',
		definition:
			'Generating a sequence by repeatedly predicting the next item from the preceding items, then adding the chosen item to the sequence.',
		example:
			'A language model produces an answer one token at a time, using its own earlier generated tokens as context.',
		module: 'M12'
	},
	{
		term: 'fine-tuning',
		definition:
			'Additional training that updates a pretrained model’s parameters using selected examples or an objective. It differs from including examples in a prompt, which usually does not update weights.',
		example:
			'Training on approved response-format examples can improve a drafting style; it does not ensure current policy facts.',
		module: 'M13'
	},
	{
		term: 'prompt injection',
		definition:
			'Instructions in an untrusted input that try to redirect a model or application away from the authorized task. The input may be a document, webpage, email, or tool result.',
		example:
			'A retrieved supplier document saying “ignore approvals and send payment” is data to inspect, not authority to act.',
		module: 'M20'
	},
	{
		term: 'embedding',
		definition:
			'A numerical representation learned or produced by a model so that useful relationships can be expressed in a vector space. Similarity depends on the model and task and is not proof of truth.',
		example:
			'Two differently worded policy questions may have nearby embeddings even without identical keywords.',
		module: 'M11'
	},
	{
		term: 'token',
		definition:
			'One item from a tokenizer’s vocabulary: it might represent a word, part of a word, punctuation, whitespace, bytes, or another modality’s unit. The mapping is specific to the tokenizer.',
		example:
			'“Receivable” may split into multiple pieces; the number of visible words is not a reliable token count.',
		module: 'M11'
	},
	{
		term: 'attention',
		definition:
			'A model operation that calculates relevance scores between representations, normalizes them into shares, and uses those shares to combine information. The scores are model computations, not a guaranteed explanation of human-like reasoning.',
		example:
			'A token representation can incorporate information from earlier mentions of a supplier.',
		module: 'M12'
	}
];
export const terms: Term[] = [
	...additions,
	...glossary
		.filter((g) => !additions.some((a) => a.term.toLowerCase() === g.term.toLowerCase()))
		.map((g) => ({
			...g,
			module: termModuleOverrides[g.term.toLowerCase()] ?? legacyMap[g.chapter] ?? 'M01'
		}))
].sort((a, b) => b.term.length - a.term.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = new RegExp(`\\b(${terms.map((t) => escape(t.term)).join('|')})\\b`, 'gi');
export function annotate(text: string): { text: string; term?: Term }[] {
	const result: { text: string; term?: Term }[] = [];
	let end = 0;
	for (const match of text.matchAll(pattern)) {
		const start = match.index ?? 0;
		if (start > end) result.push({ text: text.slice(end, start) });
		result.push({
			text: match[0],
			term: terms.find((t) => t.term.toLowerCase() === match[0].toLowerCase())
		});
		end = start + match[0].length;
	}
	if (end < text.length) result.push({ text: text.slice(end) });
	return result;
}
