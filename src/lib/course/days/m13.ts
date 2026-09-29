import type { CourseModule } from '../types';
import { p, note, table, worked, steps, reflect, lab, section, check } from './content-helpers';
export const m13: CourseModule = {
	id: 'M13',
	day: 3,
	title: 'Pretraining, post-training, and adaptation',
	subtitle:
		'Understand what changes a model, what changes its context, and how to test the difference.',
	minutes: 70,
	prerequisites: ['M04', 'M12'],
	objectives: [
		'Explain how next-token examples, a loss, gradients, and an optimizer update a language model.',
		'Distinguish pretraining, supervised fine-tuning, preference optimization, and inference.',
		'Choose among prompting, retrieval, tool use, and parameter updates for different finance problems.',
		'Interpret training and held-out language-model losses without equating them to accounting competence.',
		'Explain the purpose and limitations of distillation and quantization.'
	],
	why: 'Willow asks whether it should “train ChatGPT on the policy manual.” Before proposing a budget, you need to discover whether the actual need is fresh facts, consistent style, a specialized task, or controlled execution.',
	sections: [
		section(
			'learning-signal',
			'What does language-model training actually do?',
			'Connect the next-token objective to the learning loop you already know.',
			p(
				'Start with parameters initialized to small random values. The model can compute a distribution, but it has not yet learned useful language patterns. A batch of training sequences is tokenized. For each permitted position, the model predicts a distribution over the next token, and the example supplies the observed target. The loss summarizes how poorly the model allocated probability to those targets. Backpropagation computes gradients, and an optimizer uses them to update parameters.',
				'Cross-entropy is a common next-token loss. Its key behavior is intuitive: giving the observed token very little probability is penalized heavily, while giving it more probability reduces the loss. You do not have to manipulate logarithms to understand why a confidently wrong prediction is costly. The objective concerns the entire probability distribution, not just whether the most likely token happened to match. Moving the target probability from 0.01 to 0.10 improves the loss even if another token remains the top choice.',
				'The updates affect embeddings and many layers of learned transformations. A single training step does not insert a sentence as an exact row in an approved-facts database. Information is distributed across parameters, and behavior depends on context. Memorization can occur, especially for repeated or distinctive content, but the existence of memorization does not make parameter storage a reliable records-management system. To reproduce an authoritative financial value, retrieve and validate the record.'
			),
			worked(
				'Two predictions with the same top choice',
				'The observed next token is “received”. Model A assigns it 0.40 probability and assigns “overdue” 0.50. Model B assigns it 0.05 and assigns “overdue” 0.80.',
				[
					'Both models choose “overdue” under greedy decoding, so both top-choice predictions are wrong.',
					'Model A allocated substantially more probability to the observed outcome. Cross-entropy penalizes it less than Model B.',
					'An update that increases the target probability can improve loss before the top choice changes.',
					'Average loss over many held-out positions gives broader evidence than showing one pleasing sentence.'
				],
				'A training curve may improve while a particular generated example still looks poor. Inspect both the objective and the downstream task; neither one chosen sample nor one aggregate metric tells the whole story.'
			),
			note(
				'mechanism',
				'Parameters, settings, and data play different roles',
				'A learned weight is a parameter. Learning rate, batch size, context length, and training duration are training settings or design choices. A selected temperature is a decoding setting. A new policy excerpt supplied at inference is input data. Saying “we changed the model” is ambiguous unless you name which of these changed.'
			)
		),
		section(
			'pretraining',
			'Pretraining learns broad predictive structure',
			'Scale helps only through an interaction of data, capacity, compute, and objective.',
			p(
				'Pretraining usually means the initial broad training stage that produces a model reusable across later tasks. In a text next-token setup, the model sees many examples and adjusts parameters to reduce prediction loss. The corpus may include different languages, styles, domains, and code. Its composition matters: repetition, contamination, missing perspectives, poor-quality examples, and private data all affect the behavior and risks of the resulting model.',
				'Training a model with more parameters is not the same as training it well. A model can have capacity it has not learned to use because it saw too little suitable data or received insufficient optimization. Research on compute-optimal language-model training examines how model size and training-token quantity interact under a compute budget. Do not turn one historical scaling result into a universal rule for every current architecture or business task. For Willow, the practical comparison includes task quality, latency, cost, deployment constraints, and reliability.',
				'The training/validation/test distinction remains essential. Use training data for parameter updates, validation data to compare settings, and a held-out final set for a committed assessment. A final set repeatedly consulted to select prompts or models becomes development evidence, even if no gradient update touches it. Language corpora make leakage subtle: near-duplicate paragraphs, template variants, and repeated document fragments may cross splits. A low held-out loss is less persuasive if the supposedly new text largely reproduces training material.'
			),
			lab(
				'language-training',
				'Train a small language model in your browser',
				'Train the local character-level transformer in short batches. Record training and validation loss at several points, inspect real next-character probabilities, then commit the run before opening its final score. Compare generated text with the actual held-out measurements.',
				'Will training loss and validation loss improve at exactly the same rate? Will a more readable sample establish competence on an unseen financial question?',
				[
					'Record seed, number of updates, and measured losses rather than only the generated text.',
					'Compare a familiar finance phrase with a different input, describing the distribution and model limitations.',
					'After commitment, record the final score and state whether it influenced any later design change.'
				],
				'This small model learns from an original, deliberately tiny synthetic finance corpus on the CPU. It demonstrates real parameter learning and causal attention, not the scale, factual coverage, or professional ability of a commercial LLM. Reusing a revealed final set turns it into development evidence.'
			)
		),
		section(
			'posttraining',
			'From continuation to useful assistant behavior',
			'The broad model is often adapted to follow instructions and preferences.',
			p(
				'A base pretrained model is optimized for its training objective, which may be continuing text. It has not necessarily been optimized to respond as a cooperative assistant to a user instruction. Supervised fine-tuning uses selected input–response examples to update parameters toward desired behavior. Examples can teach response formats, task patterns, style, and how to respond when evidence is missing. Their quality and coverage matter: a polished but unsupported target answer teaches the wrong behavior.',
				'Preference-based methods use comparisons or other feedback about outputs. One historical pipeline collects human preferences, trains a reward model to predict them, and optimizes the language model toward higher reward with constraints. This is commonly associated with reinforcement learning from human feedback, or RLHF. Other methods optimize preferences differently, and current post-training recipes vary. The important common question is what signal is being optimized and how well that signal represents the behavior we actually want.',
				'Reinforcement learning studies how a policy chooses actions and is adjusted using reward signals. Here “policy” means a strategy for selecting outputs, not Willow’s expense manual. In a language-model setting, generating tokens or responses can be treated as actions, and a reward model may score completed responses. An optimization procedure changes the language model to favor higher-scoring behavior, often while limiting departure from a reference model. The reward is not a verified ledger: it is a numerical training signal whose connection to financial quality must be examined. A classroom selector that ranks two authored answers by confidence is an analogy for a poor reward proxy, not a complete implementation of RLHF.',
				'Suppose reviewers favor a confident short variance explanation over a cautious accurate one. Optimizing that preference can teach a harmful tradeoff. A reward or preference label is a proxy for quality, not quality itself. Evaluation therefore needs separate criteria for factual support, numerical correctness, instruction following, usefulness, and appropriate uncertainty. A single thumbs-up average can hide a serious failure dimension.',
				'Post-training can improve assistant behavior without supplying Willow’s current figures. It also cannot make application permissions enforce themselves. A model trained to avoid unauthorized actions still needs a harness that restricts which tools can execute and under whose authority. Learned behavior and enforced controls are complementary; substituting one for the other creates fragile systems.'
			),
			table(
				'Three training stages or signals',
				[
					'Stage / method',
					'What the example or feedback supplies',
					'Question for a finance project'
				],
				[
					[
						'Next-token pretraining',
						'Observed continuation in broad data',
						'What useful patterns and data weaknesses might it learn?'
					],
					[
						'Supervised fine-tuning',
						'An input paired with a desired response',
						'Are desired answers correct, representative, and appropriately uncertain?'
					],
					[
						'Preference optimization',
						'A comparison or reward signal about outputs',
						'Does the preference reward evidence and accuracy, or merely style?'
					]
				]
			),
			reflect(
				'Two drafts receive preference votes. The fluent draft invents a cause; the cautious draft correctly identifies missing evidence. How should the labeling rubric change?',
				'Write criteria that separate usefulness from unsupported confidence.',
				'Require numerical correctness and source support before rewarding style. Reviewers should identify unsupported causal claims, distinguish known facts from hypotheses, and assess whether the next investigation step is useful. A confident but invented explanation should lose even if it sounds more executive-ready.'
			)
		),
		section(
			'adaptation',
			'Choose the right adaptation lever',
			'Do not propose weight updates for a problem that is mainly about evidence access.',
			p(
				'Prompting supplies task instructions, examples, and context at inference time. In-context learning describes behavior adapting to examples in the input without an ordinary parameter update. JSON is a text format for structured data: named fields pair with values, such as an amount, a source ID, or a list of exceptions. If you show a model three examples of a required JSON format, it may imitate that pattern for a fourth case. That is useful, but it is not the same as saving new trained weights. The behavior may disappear when the examples leave the context.',
				'Retrieval finds relevant external information and supplies it to the model or application. If Willow changes an expense limit this morning, a versioned policy source is usually easier to update and audit than retraining a model and hoping the old limit has disappeared from its behavior. Retrieval adds its own failure modes: missing passages, wrong versions, poor access filters, or unsupported synthesis. It therefore requires evaluation, which M16 develops.',
				'Tool use delegates a bounded operation to executable software: fetching approved records, calculating a variance, or checking a schema. A model can propose arguments; code validates and performs the operation. For exact arithmetic and database state, this separates language interpretation from deterministic work. The model can still choose wrong arguments, so validation and end-to-end tests remain necessary.',
				'Fine-tuning changes parameters. It can be useful when you have a stable specialized task, representative labeled examples, a clear evaluation set, and evidence that a simpler prompting approach is insufficient or too costly. It is not automatically the best way to store frequently changing company facts. It also brings dataset governance, training cost, regression evaluation, and maintenance work. Good proposals compare alternatives rather than treating “custom model” as the desired outcome.',
				'Shared parameters create a trade-off during adaptation. Updates that improve one narrow collection can damage behavior on other tasks or inputs, sometimes called catastrophic forgetting when the loss is substantial. It is not inevitable after every update, and a worse score can have other causes. Compare both finance-domain and general held-out cases before and after adaptation; retain the starting checkpoint—a saved model state—and choose the training strength using validation evidence. A lower finance training loss alone cannot show that the broader behavior was preserved.'
			),
			worked(
				'Match each Willow need to an initial experiment',
				'The sponsor provides four requests that all sound like “make the AI better”.',
				[
					'“Use the expense policy approved today.” Start with authorized retrieval and explicit effective-date selection; test conflict and missing-source cases.',
					'“Always return our three-field review note.” Start with clear instructions, structured output validation, and representative examples. Consider fine-tuning only if measured quality or cost justifies it.',
					'“Calculate exact outstanding balances.” Use a tested tool over authoritative invoices and payments, preserving cents, currencies, and record IDs.',
					'“Classify a large stable family of specialized documents.” Compare a baseline model or prompting approach with task-specific training using representative labels and independent evaluation.'
				],
				'The system may combine all four levers. Choose each for the failure it addresses and measure whether it actually resolves that failure.'
			)
		),
		section(
			'deployment',
			'Distillation and quantization change different things',
			'Model size and serving cost are engineering questions, not shortcuts to accuracy.',
			p(
				'Distillation trains a smaller student model using signals from a teacher, often generated responses or probability information. It can transfer useful behavior to a cheaper model, but the student may inherit teacher errors and lose capability outside the training distribution. The teacher’s output is not automatically an authoritative label. In finance, evaluate the student against approved records and task criteria rather than only agreement with the teacher.',
				'Quantization represents model values with lower numerical precision to reduce memory or computation costs. It is different from teaching new policy knowledge and different from reducing the number of tokens in a prompt. The effect on quality depends on the method, model, hardware, and task. A smaller memory footprint is a measured engineering benefit; preserved accuracy must also be measured. Some quantization approaches involve additional calibration or training, so avoid the blanket claim that all quantization is the same procedure.',
				'A deployment decision should consider the whole system. A local model may improve data locality but still requires secure storage, access controls, updates, and quality checks. A hosted model may reduce infrastructure work but raises its own data-handling and vendor requirements. This course does not ask beginners to become infrastructure specialists in one module. It asks them to distinguish the tradeoffs and know what evidence to request from the team.'
			),
			note(
				'warning',
				'A benchmark score has a scope',
				'A language-model loss, a generic reasoning benchmark, a preference score, and an approved financial workflow success rate measure different things. Ask which records, decisions, errors, and operating conditions the evaluation covers. Do not use a broad model ranking as the release test for a company-specific system.'
			)
		),
		section(
			'design',
			'Write the experiment before choosing the model',
			'A good technical recommendation states what would change your mind.',
			p(
				'For Willow’s first pilot, define a fixed set of development cases, output requirements, and failure costs. Establish a simple prompt-plus-tool baseline. Add retrieval only where current source access is needed. Compare improvements on the same development cases, then commit the chosen configuration and test it on fresh cases. If you subsequently tune using the fresh cases, disclose that they are no longer an independent final assessment.',
				'If fine-tuning is proposed, ask for representative examples, a separate evaluation design, expected gains, and maintenance ownership. Track regression risks: a model may improve the target format while becoming less reliable at expressing uncertainty or handling new document layouts. The recommendation should name a stop condition as well as a success condition. “We will fine-tune until it looks good” is neither an experiment nor a professional plan.'
			)
		)
	],
	checks: [
		check(
			'm13-q1',
			0,
			'A model assigns more probability to the observed next token but still ranks another token first. What can happen?',
			[
				'Cross-entropy improves while top-choice accuracy is unchanged',
				'The loss must remain unchanged',
				'The parameters cannot have changed'
			],
			0,
			[
				'Correct. Loss measures probability assigned to the target, not only the top choice.',
				'The distribution can improve before its largest entry changes.',
				'A training update can change probabilities without changing which token is ranked first.'
			]
		),
		check(
			'm13-q2',
			1,
			'Three examples in a prompt cause a model to follow a new report format. What is the most direct explanation?',
			[
				'The examples permanently rewrote its weights',
				'It adapted behavior using the current context',
				'It necessarily underwent RLHF'
			],
			1,
			[
				'Ordinary prompting does not imply a parameter update.',
				'Correct. This is an in-context behavior change; durability beyond the context requires separate evidence.',
				'Preference-based training is a different process from supplying examples at inference.'
			]
		),
		check(
			'm13-q3',
			2,
			'The main failure is an obsolete expense limit. What is the best first investigation?',
			[
				'Increase sampling temperature',
				'Add more parameters without changing evidence',
				'Check retrieval, effective dates, and the exact context supplied'
			],
			2,
			[
				'Temperature changes selection behavior, not policy freshness.',
				'Capacity does not establish access to the current approved policy.',
				'Correct. Start with evidence freshness and version selection, then evaluate the answer.'
			]
		),
		check(
			'm13-q4',
			1,
			'A preference dataset favors confident but unsupported answers. What risk follows?',
			[
				'Optimization can reward the wrong behavior',
				'The preference signal guarantees truth',
				'More votes always eliminate systematic bias'
			],
			0,
			[
				'Correct. The optimized feedback must represent the quality dimensions we care about.',
				'A preference label is a proxy, not independent factual validation.',
				'If the rubric rewards the wrong thing, more labels can reinforce that systematic problem.'
			]
		),
		check(
			'm13-q5',
			4,
			'Which comparison correctly separates distillation and quantization?',
			[
				'Both merely shorten prompts',
				'Distillation trains a student from teacher signals; quantization reduces numerical precision',
				'Quantization supplies current policy facts'
			],
			1,
			[
				'Neither is defined by shortening the input prompt.',
				'Correct. Both may reduce serving costs through different mechanisms, and both need task evaluation.',
				'Numerical representation changes do not supply new external policy evidence.'
			]
		),
		check(
			'm13-q6',
			3,
			'You used the final test set to choose between five prompts. How should you describe that evidence?',
			[
				'Still fully independent because no weights changed',
				'A certification of generalization',
				'Development evidence used in configuration selection'
			],
			2,
			[
				'Prompt selection is tuning the system, even without gradient updates.',
				'No finite reused test set certifies broad generalization.',
				'Correct. Independence concerns influence on the chosen system, not only weight updates.'
			]
		)
	],
	assignment: {
		title: 'Recommend an adaptation strategy',
		scenario:
			'Willow has a new monthly policy, 400 approved review notes, and frequent arithmetic mistakes in drafts. The sponsor requests a custom-trained model immediately.',
		tasks: [
			'Separate the three failure types and choose an initial intervention for each.',
			'Describe what would justify fine-tuning and what data you would reserve.',
			'Design a comparison including a simple baseline, evaluation criteria, and a stop condition.',
			'Explain why a lower language-model loss is not sufficient for release.'
		],
		deliverable:
			'A 400-word recommendation with an intervention/evidence table and a validation plan.',
		rubric: [
			{
				criterion: 'Interventions match failures',
				evidence:
					'Freshness uses versioned evidence, arithmetic uses validated tools, and style starts with prompt/format evaluation.'
			},
			{
				criterion: 'Training proposal is conditional',
				evidence:
					'Representative examples, rights to use them, baseline comparison, and independent assessment are specified.'
			},
			{
				criterion: 'Release uses task evidence',
				evidence:
					'Numerical accuracy, supported claims, exception handling, latency/cost, and review effort are considered.'
			}
		],
		workedSolution: [
			'Use current-policy retrieval with effective dates for freshness. Use a calculation tool and typed input/output validation for arithmetic. Try instructions and selected approved examples for review-note style, with structured format checks. These interventions address different causes of failure.',
			'Fine-tuning becomes a candidate if the stable note-writing task has enough representative examples and a measured advantage over simpler methods. Split at a meaningful document/customer/time level and reserve independent cases; do not let near-duplicate templates leak across evaluation boundaries.',
			'Compare the baseline and proposed configuration on development cases, then commit and evaluate on fresh cases. Stop if unsupported claims or unhandled critical exceptions exceed the agreed release criteria, even if drafting speed improves. Language-model loss measures predictive fit to text, not the correctness of financial figures or the resulting business action.'
		]
	},
	interview: {
		question:
			'When would you fine-tune a finance assistant instead of using RAG or better prompts?',
		strongAnswer: [
			'I would first identify the failure. Current facts point toward versioned retrieval; exact operations point toward tools; a stable response-format or specialist classification problem may justify fine-tuning. Prompting is a useful baseline because it changes behavior without a training pipeline.',
			'Fine-tuning needs representative examples, a sound split, a defined objective, and evidence of gains relative to maintenance and serving costs. I would evaluate supported financial outcomes and regressions, not only style or language-model loss.'
		],
		followUps: [
			{
				question: 'Can fine-tuning and retrieval be combined?',
				answer:
					'Yes. Training may improve task behavior while retrieval supplies current evidence. Each layer still needs evaluation: evidence selection, answer support, formatting, numeric operations, and system behavior.'
			},
			{
				question: 'Why does an unchanged model need a new evaluation after a prompt update?',
				answer:
					'The deployed system includes its prompt and context policy. Changing those inputs can change behavior, tool choices, and failure rates even if model parameters remain identical.'
			}
		]
	},
	sources: [
		{
			label: 'Brown et al. (2020): Language Models are Few-Shot Learners',
			url: 'https://arxiv.org/abs/2005.14165'
		},
		{
			label: 'Hoffmann et al. (2022): Training Compute-Optimal Large Language Models',
			url: 'https://arxiv.org/abs/2203.15556'
		},
		{
			label:
				'Ouyang et al. (2022): Training language models to follow instructions with human feedback',
			url: 'https://arxiv.org/abs/2203.02155'
		},
		{
			label: 'Google: Fine-tuning, distillation, and prompt engineering',
			url: 'https://developers.google.com/machine-learning/crash-course/llm/tuning'
		}
	]
};
