export const interviewQuestions = [
	{
		role: 'Data science',
		title: 'Your model is 99% accurate. Should we deploy?',
		question:
			'Only 1% of invoices are problematic. Your classifier reports 99% accuracy. How would you assess it?',
		answer:
			'A model that flags nothing is already 99% accurate. Inspect the confusion matrix, precision, and recall; compare with that baseline. Define the cost of missed issues and false alarms, choose a threshold using validation data, evaluate later unseen data, and measure the review queue. Accuracy alone does not establish value.',
		rubric: [
			'Identify class imbalance and the trivial baseline',
			'Explain precision and recall in business language',
			'Discuss thresholds, costs, validation, and review capacity'
		],
		chapter: 'machine-learning'
	},
	{
		role: 'Data science',
		title: 'The forecast was perfect… until launch.',
		question:
			'You predicted payment delays using eventual payment dates and randomly split invoice rows. What concerns you?',
		answer:
			'The eventual payment date leaks the outcome. Remove fields unavailable at prediction time, rebuild features as of a clear cutoff, fit transformations on training data only, and use time-based evaluation. Consider customer grouping if deployment targets new customers. Compare against a simple baseline and inspect several rolling periods.',
		rubric: [
			'Name leakage explicitly',
			'Respect decision-time information',
			'Redesign evaluation to resemble deployment'
		],
		chapter: 'machine-learning'
	},
	{
		role: 'Finance transformation',
		title: 'Where would you start with AI in finance?',
		question:
			'A CFO asks you to “automate the close.” How do you turn that into a useful first project?',
		answer:
			'Map the close, identify a bounded pain point and its owner, measure a baseline, and choose a reversible pilot such as assembling reconciliation exceptions. Define data sources, grain, acceptance criteria, permissions, and escalation. Measure total review time and error consequences before adding autonomy. Preserve approval and posting controls.',
		rubric: [
			'Scope a bounded business problem',
			'Define value and a baseline',
			'Include data ownership and controls'
		],
		chapter: 'applications-agents'
	},
	{
		role: 'AI engineering',
		title: 'Why not just give the model every policy?',
		question:
			'You are designing an assistant for frequently changing company policies. Explain your approach.',
		answer:
			'Retrieve relevant authorized passages with versions and effective dates. Keep access filters in the data layer, provide citations, and instruct the assistant to acknowledge missing evidence. Evaluate retrieval coverage and answer support separately. Fine-tuning could improve behavior or format, but is not a substitute for current authoritative information.',
		rubric: [
			'Distinguish context, retrieval, and training',
			'Enforce document permissions',
			'Evaluate retrieval and generation separately'
		],
		chapter: 'language-models'
	},
	{
		role: 'Analytics advisory',
		title: 'Your dashboard doubled revenue.',
		question:
			'A report joins invoices with invoice lines and payments. It now shows twice the ledger revenue. What do you investigate?',
		answer:
			'Define the grain of each table and inspect relationship cardinality and duplicate keys. Joining multiple one-to-many tables can multiply rows. Aggregate at the intended grain, use separate facts and appropriate dimensions, and reconcile row counts and totals to source records and the ledger. Check filter behavior and missing joins too.',
		rubric: [
			'Explain grain and join multiplication',
			'Propose a defensible model',
			'Reconcile business totals, not just syntax'
		],
		chapter: 'applications-agents'
	},
	{
		role: 'Agent engineering',
		title: 'The payment tool timed out.',
		question: 'An agent requested a payment but did not receive a result. How do you recover?',
		answer:
			'A timeout does not prove failure. Check the actual transaction status using the original request identity. Use idempotency to avoid duplicate effects, preserve approval for the exact payment, and keep bounded retries and logs. Escalate ambiguous state rather than issuing a new payment blindly.',
		rubric: [
			'Distinguish no response from no effect',
			'Use idempotency and state reconciliation',
			'Preserve authorization and escalation'
		],
		chapter: 'tools'
	},
	{
		role: 'Data science',
		title: 'Training improves. Validation gets worse.',
		question: 'What could explain this pattern, and what would you do next?',
		answer:
			'The gap suggests overfitting, although data mismatch and evaluation design also deserve investigation. Compare learning curves, remove leakage, assess representativeness, try simpler capacity or regularization, and use validation-based early stopping when appropriate. Keep the final test set untouched while making these choices.',
		rubric: [
			'Recognize overfitting without overclaiming',
			'Suggest appropriate remedies',
			'Protect the test set'
		],
		chapter: 'machine-learning'
	},
	{
		role: 'Finance transformation',
		title: 'AI says freight caused the margin decline.',
		question:
			'The available table only shows revenue and total cost. How do you handle the generated commentary?',
		answer:
			'Confirm the observed margin change using deterministic calculation and consistent definitions. Freight is an unverified hypothesis without supporting detail. Separate observations from proposed causes, obtain the relevant cost breakdown, and require source-linked claims and reviewer sign-off. Fluency is not evidence.',
		rubric: [
			'Separate fact from causal hypothesis',
			'Recalculate and verify definitions',
			'Request evidence and preserve review'
		],
		chapter: 'language-models'
	},
	{
		role: 'AI engineering',
		title: 'Explain a transformer without equations.',
		question: 'A finance leader asks how attention helps a language model understand a sentence.',
		answer:
			'Tokens are represented numerically along with information about position. Attention combines information across positions based on learned relevance, so the word “bank” can be represented differently beside “loan” and “river.” Multiple heads learn different relationships. It is a pattern-processing mechanism, not proof of understanding or truth.',
		rubric: [
			'Explain token representations and position',
			'Use an accessible context example',
			'State limits of the analogy'
		],
		chapter: 'transformers'
	},
	{
		role: 'Agent engineering',
		title: 'Tool, skill, harness: what is the difference?',
		question: 'Use a reconciliation assistant to explain all three terms.',
		answer:
			'A tool might read authorized ledger entries. A skill is the repeatable reconciliation method, with instructions, examples, and templates. The harness runs the loop, supplies context, routes tools, tracks state, applies permissions and budgets, and records results. The model selects or generates within that environment. Terminology varies, so specify the actual responsibilities.',
		rubric: [
			'Give a distinct concrete example for each',
			'Place execution and controls in the harness',
			'Avoid equating skills with training or permission'
		],
		chapter: 'harnesses'
	},
	{
		role: 'Analytics advisory',
		title: 'Design a cash forecast you can defend.',
		question:
			'You have 24 months of collections. How would you build and evaluate an initial forecast?',
		answer:
			'Inspect missing periods, currency, one-offs, and available drivers. Use a simple last-month or seasonal-naive baseline as appropriate. Evaluate later months using rolling cutoffs and compare absolute dollar error, bias, and the consequences of shortfalls. Twenty-four months provide limited seasonal evidence. Communicate uncertainty and scenarios; avoid using future-known drivers.',
		rubric: [
			'Start with data checks and an honest baseline',
			'Use temporal evaluation and relevant metrics',
			'Communicate sample limitations and uncertainty'
		],
		chapter: 'machine-learning'
	},
	{
		role: 'AI engineering',
		title: 'A prompt says “ignore all prior rules.”',
		question:
			'That sentence is inside a supplier document retrieved by your assistant. What do you do?',
		answer:
			'Treat the document as untrusted data, not a policy authority. Restrict tools and data, validate action arguments, isolate execution, and require approval for sensitive writes. Test adversarial documents and log attempted deviations. Prompt-level instructions help but are not a complete security boundary.',
		rubric: [
			'Recognize prompt injection',
			'Propose enforced layered controls',
			'Avoid claiming a prompt alone solves it'
		],
		chapter: 'tools'
	},
	{
		role: 'Finance transformation',
		title: 'Make the ROI case without hype.',
		question:
			'A vendor claims its model writes commentary ten times faster. What does your business case include?',
		answer:
			'Measure the existing workflow and pilot total time including preparation, review, corrections, and exceptions. Include software, integration, maintenance, training, and failed-run costs. Compare acceptable completed outputs, error severity, and adoption. Vendor generation speed is one input, not your end-to-end savings estimate.',
		rubric: [
			'Use a baseline and full workflow costs',
			'Measure quality and review burden',
			'Distinguish vendor claims from pilot evidence'
		],
		chapter: 'generative-ai'
	},
	{
		role: 'Agent engineering',
		title: 'How would you evaluate a finance agent?',
		question:
			'You must recommend whether an exception-investigation agent can move from pilot to production.',
		answer:
			'Create reviewed normal and edge cases with explicit criteria for numeric accuracy, evidence support, access boundaries, tool errors, and escalation. Include malicious documents and partial failures. Evaluate end-to-end, including reviewer effectiveness, runtime, and cost. Define unacceptable failure modes and monitor fresh cases after release with a rollback path.',
		rubric: [
			'Test behavior beyond answer quality',
			'Include high-impact and adversarial cases',
			'Define monitoring and release criteria'
		],
		chapter: 'harnesses'
	},
	{
		role: 'Analytics advisory',
		title: 'Write a measure, not a misleading story.',
		question:
			'A Power BI stakeholder wants “overdue receivables.” What needs clarification before writing DAX?',
		answer:
			'Define the as-of date, grain, unpaid balance, due-date rule, currency, treatment of credits and missing dates, and filter context. Identify relationships and date dimensions. Reconcile against a reviewed fixture and the relevant control account before styling the visual. DAX syntax is the final expression of the business definition.',
		rubric: [
			'Clarify the metric’s business meaning',
			'Discuss model and filter context',
			'Reconcile results using test fixtures'
		],
		chapter: 'applications-agents'
	},
	{
		role: 'AI engineering',
		title: 'Would you fine-tune this model?',
		question:
			'A team has poor answer quality on company documents. They suggest fine-tuning immediately.',
		answer:
			'Diagnose whether retrieval is missing relevant passages, documents are stale, instructions are unclear, or outputs need a consistent format. Improve the responsible component and evaluate. Fine-tuning may help repeated behavior with suitable reviewed examples, but it will not automatically solve access, freshness, missing evidence, or flawed retrieval.',
		rubric: [
			'Diagnose before choosing a technique',
			'Distinguish knowledge access from behavior',
			'Require representative evaluation'
		],
		chapter: 'language-models'
	},
	{
		role: 'Data science',
		title: 'Prediction is not causation.',
		question:
			'Customers contacted by collections pay later on average. Should we stop contacting them?',
		answer:
			'Not on this correlation alone. The team may target customers already likely to pay late, creating selection effects. Clarify the decision and examine how treatment was assigned. A well-designed randomized or credible quasi-experimental approach may help estimate the effect. A predictive association does not establish the intervention’s impact.',
		rubric: [
			'Identify selection or confounding',
			'Separate prediction from intervention',
			'Suggest an appropriate causal design'
		],
		chapter: 'machine-learning'
	},
	{
		role: 'Agent engineering',
		title: 'You built it with AI. How do you trust it?',
		question:
			'Explain how you would review a small AI-generated finance application before sharing it.',
		answer:
			'Inspect the architecture, dependency choices, permissions, and handling of secrets. Verify calculations and data transformations with reviewed fixtures, test meaningful failure cases and unauthorized actions, and inspect the deployed routes and output. Document limitations and rollback. AI assistance changes how code is produced, not who is responsible for its behavior.',
		rubric: [
			'Review security and architecture',
			'Test data correctness and failure behavior',
			'Verify deployment and state limitations'
		],
		chapter: 'prompt-engineering'
	}
];
