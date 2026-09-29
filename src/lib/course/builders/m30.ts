import type { Block, Check, CourseModule, Section } from '../types';
const p = (...paragraphs: string[]): Block => ({ kind: 'prose', paragraphs });
const s = (id: string, title: string, lead: string, ...blocks: Block[]): Section => ({
	id,
	title,
	lead,
	blocks
});
const q = (
	id: string,
	objective: number,
	prompt: string,
	options: string[],
	answer: number,
	rationales: string[]
): Check => ({ id, objective, prompt, options, answer, rationales });

export const m30: CourseModule = {
	id: 'M30',
	day: 6,
	title: 'Engineer the agent runtime',
	subtitle: 'Turn model proposals into controlled, observable, recoverable application actions.',
	minutes: 65,
	prerequisites: ['M19', 'M27', 'M29'],
	objectives: [
		'Trace model messages through schema validation, registry dispatch, and call-ID results.',
		'Choose safe parallel execution and reconcile authoritative artifact revisions.',
		'Explain middleware, skills, subagents, and context boundaries without confusing them with permissions.',
		'Design checkpoints, cancellation, and receipt-based recovery around real effects.',
		'Verify action and review status from application evidence rather than assistant claims.'
	],
	why: 'The model chooses useful next steps; the application must decide which requests are valid, execute them against the right state, and know what actually happened. That boundary is where an impressive demo becomes dependable software.',
	sections: [
		s(
			'loop',
			'The model proposes; the runtime executes',
			'Follow one request across the boundary.',
			p(
				'Recall that a tool is a capability exposed through a contract. A tool registry maps an allowed name to its input schema, implementation, and result formatter. A schema describes accepted fields and types. It is not an authorization policy. A request can be perfectly shaped and still ask to read another user’s workbook or perform an unapproved write.',
				'For Willow, a model proposes read_balance with an invoice ID. The provider adapter receives a tool-call event with a call_id and JSON arguments. The runtime waits until the arguments are complete, parses them, validates the schema, resolves the function from the registry, checks the caller’s access, then executes. It validates the output and sends a result associated with that same call_id. The model uses the returned evidence to choose another tool or produce an answer. It does not execute TypeScript merely by naming a function.',
				'The call_id correlates a result with a model request. An operationId identifies a logical action whose effect must not be duplicated. These identities serve different purposes. Retrying the same queue-review action after losing a response may have a new model call_id but must retain the stable operationId and compatible parameters. A document ID identifies the artifact; a revision identifies which version of that artifact the tool expects. Avoid one generic “ID” field doing four different jobs.',
				'A stream can split the string representing arguments across several network chunks. Do not execute on a partial JSON object or guess missing fields. Normalize provider events into application events such as call-started, arguments-complete, result, and error. The UI renders those states by identity rather than inferring progress from phrases in an assistant’s prose. An SDK can perform protocol work, but your application still owns authorization and state correctness.'
			),
			{
				kind: 'code',
				language: 'typescript',
				title: 'Different identities answer different questions',
				code: 'type ProposedWrite = {\n  callId: string;          // Which model request receives the result?\n  operationId: string;     // Which logical effect must not be duplicated?\n  documentId: string;      // Which artifact?\n  expectedRevision: number; // Which version was read?\n};',
				explanation:
					'This is a conceptual contract, not a complete authorization or persistence implementation. The server derives user identity from trusted session context, not model-supplied arguments.'
			}
		),
		s(
			'parallel',
			'Parallel calls need independent work',
			'Faster completion is useful only when the results remain correct.',
			p(
				'Reading independent invoices A and B can often happen concurrently. A queue-review action that depends on the latest balance must wait for the relevant read and checks. Calling several asynchronous functions can start their work before any one has finished. Promise.all aggregates their promises so the caller can wait for the group; it does not itself start the functions or understand their business dependencies. If read_balance is call C1 and read_policy is C2, either may finish first. Results must remain attached to their own IDs. The first response is not automatically the first requested result.',
				'Two writes based on the same workbook revision can conflict. Suppose revision 7 contains a fee of 60. A reviewer corrects it to 50 and commits revision 8. A tool still holding revision 7 must not replace the artifact with its old snapshot. Require an atomic expected-revision check at the authoritative write boundary. On conflict, return a structured conflict result, reload revision 8, and decide whether the proposed action is still needed.',
				'For truly independent edits, a reducer—a function that combines previous state with an update—can merge explicit operations rather than replacing entire snapshots. “Set cell B4 to 50 if revision is 7” is more precise than “replace workbook with this object.” Yet operations can still collide on the same cell. Define rejection, serialization, or a reviewed merge policy. An operation log does not automatically make all edits commutative, and replaying an add-row operation without deduplication can add the row twice.',
				'The same safety analysis applies to subagents. Separate contexts can make research or critique easier to manage, but two workers writing the same workbook need coordination. More agents are not automatically more independent evidence. If they all rely on the same wrong extraction, agreement can amplify the error.'
			)
		),
		s(
			'middleware',
			'Give the harness explicit policies',
			'Framework conveniences are building blocks, not completed controls.',
			p(
				'Middleware is code that runs around another operation: before a model call, around tool execution, or after a result. It can count usage, add trusted context, enforce a budget, check permission, record a trace, or pause for review. Order matters. A permission check must happen before the protected effect. An approval request in a prompt does not stop a function whose implementation ignores approval state.',
				'A skill is reusable task guidance and sometimes associated resources. Loading a skill changes instructions or available capabilities; it does not train new model weights. A subagent is a separately configured agent invocation, often with its own context and tool set. Give a reviewer only the tools it needs. If it must compare a workbook with original pages, a read_sheet tool alone is insufficient; either supply source evidence or provide authorized page-reading tools.',
				'Deep Agents offers planning, filesystem abstractions, and subagent patterns; LangGraph supports checkpointed execution. These names describe framework capabilities, not guarantees that an application has configured durable storage, enforced user isolation, or made external effects duplicate-safe. A virtual file can live in agent state rather than on a physical disk. Its durability depends on the backing store and checkpoint configuration.',
				'Context assembly selects what reaches the model now: instructions, relevant conversation, current artifact summary, retrieved evidence, and tool results. Saved state is not necessarily present in a request. Summaries should retain exact source IDs, unresolved operations, units, and revisions in structured state even if prose is shortened. Set step, token, tool, time, and cost budgets, including reviewer and suggestion calls. A limit on main-agent turns alone misses auxiliary spending.'
			)
		),
		s(
			'recovery',
			'A checkpoint and an effect are different records',
			'Recover from what happened, not merely from what the model remembers.',
			p(
				'A task checkpoint records execution state at a boundary: messages, pending calls, artifact revision, decisions, and unresolved operations. A receipt records an observed effect, such as review task R18 created for operation O9. Saving a checkpoint before the action can leave the action pending after a crash. Saving it after the response leaves another gap if the action succeeds but the response is lost. You need a recovery policy that checks durable effect state.',
				'Worked sequence: O9 creates one review task, then the connection fails before the result reaches the agent. On reconnect, load the checkpoint and query the receipt for O9 under the same user and parameters. If the receipt says R18 exists, return that result rather than creating R19. If no receipt is found, distinguish “not executed” from “status unavailable.” A caller-provided ID alone does not ensure exactly-once effects; the receiving system must enforce uniqueness and retain compatible receipts atomically with the action.',
				'A timeout means the caller stopped waiting by a deadline. It does not prove execution stopped. Promise.race with a timer may return an error while the underlying operation continues. Propagate cancellation through abort-aware reads and model calls, then reject late publications using run, turn, or session identity. Cancellation cannot undo a committed external action. Preserve unresolved operation identity so recovery can inspect it.',
				'When a human edits the workbook between runs, reconcile the checkpoint with the authoritative latest revision before another tool writes. A checkpoint is valuable precisely because it preserves prior reasoning, but it can also preserve stale data. If an old tool result arrives after a new run begins, retain it in its own trace if appropriate; do not apply it to the new run’s UI or counters.'
			),
			{
				kind: 'worked',
				title: 'One effect, two delivery attempts',
				problem:
					'O9 creates R18 at 10:00:01. The reply is lost. A new model call asks to retry O9 at 10:00:03.',
				steps: [
					'Retain O9 and the action parameters across the retry.',
					'Read the durable receipt for the same user and O9.',
					'If it records R18, return R18 under the new call_id without creating another task.',
					'If parameters differ, reject the conflicting reuse of O9; do not silently treat a different action as the original.'
				],
				conclusion:
					'Correlation lets the model receive the answer; receipt enforcement prevents an extra effect. A retry counter alone provides neither.'
			}
		),
		s(
			'verification',
			'Verify state before claiming success',
			'A requested action, a returned result, and an observed artifact are different evidence.',
			p(
				'A tool call named highlight_document is not proof that a highlight exists. The tool can fail, match no quote, or return a provisional candidate. A claim such as “I highlighted the discrepancy” should be grounded in a successful result and the actual artifact state. For a queue operation, inspect the created task identity and status. A schema-valid success string from a model is not a database receipt.',
				'A reviewer or critic can compare a draft with the evidence and flag missing conditions or unsupported claims. A different prompt or even a different model is not independent ground truth. Both may inherit the same extraction error. Mechanical checks can verify exact amounts, required source IDs, or action records; model critique can evaluate less rigid relationships. Neither should be labeled omniscient.',
				'Use separate states: provisional, checks running, issues found, checked with no detected issue, and review unavailable or failed. A failed reviewer request or malformed response must not silently become passed. If text streams before review, label it provisional and make subsequent revision visible. Stopping after a revision budget is exhausted should preserve unresolved objections, not emit a clean badge simply because the loop must end.',
				'Generated analysis code is another tool boundary. A constrained formula parser or allowlisted analytical operations can be easier to validate than arbitrary code. Node’s vm module is not a security sandbox. A timeout and a separate JavaScript context do not make document-influenced code safe to run with server privileges. Use a genuinely isolated execution design with explicit resource and data access controls when arbitrary code is a requirement.'
			),
			{
				kind: 'lab',
				id: 'agent-runtime',
				title: 'Agent runtime and recovery desk',
				task: 'Inspect the authored read_balance and queue_review proposals. Follow each call ID through validation and result routing. Exercise stale revision, missing write permission, and a committed effect with a lost reply. Restore the checkpoint and use the receipt before retrying.',
				prediction:
					'Predict which requests may run, which must be rejected, and whether recovery should create an additional review task.',
				evidence: [
					'A result is correlated to its original call ID even if another call finishes first.',
					'Permission and expectedRevision are checked at execution.',
					'Retry of the same committed operation returns the existing receipt without a second effect.'
				],
				limitation:
					'The local runtime uses authored model proposals and deterministic fixtures. It demonstrates contracts and state transitions; it is not a live model, multi-user server, or production distributed transaction system.'
			}
		)
	],
	checks: [
		q(
			'M30-Q1',
			0,
			'Two reads finish in the opposite order from their requests. What connects each result to the right model call?',
			['Arrival position', 'The original call_id', 'The length of the response text'],
			1,
			[
				'Asynchronous completion order can differ from request order.',
				'Correct: stable correlation survives different completion order.',
				'Text length has no identity meaning.'
			]
		),
		q(
			'M30-Q2',
			1,
			'An action writes a reviewer task from an invoice balance. Can its write run concurrently with the read it depends on?',
			[
				'Only if the dependency is satisfied through another explicit verified mechanism',
				'Yes, if both tool names appear in one response',
				'Always, because Promise.all is faster'
			],
			0,
			[
				'Correct: otherwise sequence the dependent write after the validated read.',
				'The model grouping requests does not establish independent work.',
				'Concurrency does not remove the need for the input.'
			]
		),
		q(
			'M30-Q3',
			2,
			'A prompt says “ask before writing,” but the tool executes any schema-valid write. Which claim is correct?',
			[
				'The schema makes approval unnecessary',
				'Approval is enforced',
				'Approval is only instructed; runtime authorization is missing'
			],
			2,
			[
				'Argument types do not establish authority.',
				'The function can still perform the effect without an approval record.',
				'Correct: validate permission and any required approval before the effect.'
			]
		),
		q(
			'M30-Q4',
			3,
			'A write succeeded but its reply was lost. What should recovery inspect first?',
			[
				'Whether the assistant sounds confident',
				'A new random operation ID',
				'A durable receipt/status for the original operation'
			],
			2,
			[
				'Prose is not evidence of external state.',
				'A new identity defeats duplicate prevention.',
				'Correct: recover the observed effect before deciding whether execution is needed.'
			]
		),
		q(
			'M30-Q5',
			3,
			'A one-second timer wins Promise.race while a tool continues running. What is established?',
			[
				'The caller stopped waiting; work may still finish',
				'The request is safe to retry without checking',
				'The tool was undone'
			],
			0,
			[
				'Correct: cancellation and effect reconciliation require separate mechanisms.',
				'The effect may already have happened or may still happen.',
				'A timer does not reverse an effect.'
			]
		),
		q(
			'M30-Q6',
			4,
			'The critic response is malformed after the draft streamed. What should the UI show?',
			[
				'Verified because no valid defects were returned',
				'Review failed/unavailable; keep the draft provisional',
				'A hidden clean badge to avoid confusing the user'
			],
			1,
			[
				'Absence of a usable review is not a successful review.',
				'Correct: disclose the actual check state and preserve uncertainty.',
				'A reassuring label would misrepresent evidence.'
			]
		)
	],
	assignment: {
		title: 'Specify a recoverable review-task agent',
		scenario:
			'A model reads workbook revision 7. A reviewer creates revision 8. The model then proposes a queue write. Later, a valid write O9 creates R18 but loses its response; a critic also fails.',
		tasks: [
			'Draw registry dispatch with schema, authorization, revision, and result-correlation boundaries.',
			'Explain the stale revision outcome before any write.',
			'Trace receipt-based recovery for O9 and a late callback from the earlier run.',
			'Define the user-visible status after the critic fails.'
		],
		deliverable: 'A sequence diagram and four test fixtures with expected state transitions.',
		rubric: [
			{
				criterion: 'Contracts',
				evidence: 'call_id, operationId, artifact ID, and revision have distinct roles.'
			},
			{
				criterion: 'Control',
				evidence:
					'Invalid permission or stale revision blocks execution independently of prompt wording.'
			},
			{
				criterion: 'Recovery',
				evidence:
					'R18 is returned without creating another task; late callbacks cannot mutate a new run.'
			},
			{
				criterion: 'Honesty',
				evidence: 'Review failure remains visible and the draft is not labeled verified.'
			}
		],
		workedSolution: [
			'The registry resolves an allowlisted function, validates arguments, derives caller identity from trusted context, checks access/approval and expected revision, executes, validates output, and attaches the original call_id.',
			'Expected 7 against current 8 returns conflict. Reload 8 and reconsider the proposal; do not replace 8 with an older snapshot.',
			'Persist O9 parameters and consult its durable receipt. Existing R18 resolves the uncertain result. A completion tagged with the old run ID can enter its trace but is ignored for the new run UI.',
			'A malformed critic response produces review-failed with a provisional draft. Keep mechanical checks and their results distinct from an unavailable semantic review.'
		]
	},
	interview: {
		question: 'What would you add around an LLM to make a financial agent reliable?',
		strongAnswer: [
			'I use a typed registry with schema validation, server-enforced authorization, authoritative revision checks, and call-ID result routing. I schedule dependent actions and define conflict handling for parallel writes.',
			'I separate conversation context, artifact state, task checkpoints, and durable operation receipts. Cancellation propagates to supported work, late callbacks are scoped to identity, and lost responses trigger status reconciliation.',
			'I verify actual tool effects and distinguish provisional output from completed checks. Frameworks help assemble these mechanisms, but a skill, reviewer, or checkpoint alone does not provide permission, correctness, or exactly-once execution.'
		],
		followUps: [
			{
				question: 'When does a subagent help?',
				answer:
					'When a bounded task benefits from separate context or tools, such as source comparison with read-only access. It still needs budget, evidence, result validation, and coordination with shared state.'
			},
			{
				question: 'Does Node vm safely isolate generated code?',
				answer:
					'No. Its own documentation says it is not a security mechanism. Use constrained operations or an appropriately isolated runtime with enforced access and resource limits.'
			}
		]
	},
	sources: [
		{
			label: 'LangGraph persistence and checkpoints',
			url: 'https://docs.langchain.com/oss/javascript/langgraph/persistence'
		},
		{
			label: 'Deep Agents overview',
			url: 'https://docs.langchain.com/oss/javascript/deepagents/overview'
		},
		{
			label: 'Node.js vm documentation',
			url: 'https://nodejs.org/api/vm.html',
			note: 'The module explicitly does not provide a security boundary.'
		},
		{
			label: 'OWASP authorization guidance',
			url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'
		}
	]
};
