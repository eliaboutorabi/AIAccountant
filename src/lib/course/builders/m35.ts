import type { CourseModule } from '../types';
import { p, note, table, worked, lab, section, check } from '../days/content-helpers';
export const m35: CourseModule = {
	id: 'M35',
	day: 7,
	title: 'AI-assisted implementation and architecture defense',
	subtitle:
		'Turn a business requirement into a small verified change, then explain exactly what you built.',
	minutes: 60,
	prerequisites: ['M34', 'M32'],
	objectives: [
		'Specify a bounded coding task with observable acceptance criteria and explicit constraints.',
		'Trace implementation and review a diff rather than infer behavior from documentation or an assistant’s summary.',
		'Use independent fixtures and failure reproduction to distinguish business, state, and presentation defects.',
		'Connect source revision, checks, build artifact, deployment and operational limitations.',
		'Defend an architecture and personal contribution using evidence without overstating model or system capabilities.'
	],
	why: 'The useful skill is not persuading a coding assistant to produce a large amount of code. It is steering the work toward a correct, inspectable product and being able to explain its behavior when the first demonstration goes wrong.',
	sections: [
		section(
			'specify',
			'Write the task as a testable business change',
			'A clear outcome gives the assistant something real to finish.',
			p(
				'Coding assistants such as Codex and Claude Code can inspect files, propose edits, run available tools, and help iterate on failures within their configured environment and permissions. Their outputs still need the same engineering evidence as any other implementation. A product sketch, a scaffold, an executed prototype and a deployed system are different deliverables. Name the intended one. “Build an intelligent finance platform” leaves too much undefined to review; a bounded user behavior with known inputs is a useful unit of work.',
				'For example: “Add a read-only reconciliation result for the synthetic PIPE-01 cohort. Quarantine identical duplicate payment IDs, hold conflicting duplicates, preserve unpaid invoices and unmatched payments, and return totals plus source IDs. Do not create posting or payment capability. Preserve existing routes and use the repository’s current stack. Demonstrate the normal fixture and one changed case.” That request names the business rule, boundary, expected evidence and scope. It also leaves implementation choices open where the existing architecture should guide them.',
				'Give the assistant the repository instructions, relevant files, data contract, acceptance cases and current error if one exists. Ask it to inspect before editing. Context should explain why a rule matters: preserving invoice C is necessary because no-payment invoices still contribute to receivables. A code comment saying “keep C” is weaker than a documented left-preserving relationship plus a test that covers any unpaid invoice. Reusable project guidance belongs in the appropriate repository instruction files; a one-off task should not silently redefine every future workflow.'
			),
			table(
				'A reviewable task specification',
				['Part', 'Concrete content'],
				[
					['Outcome', 'A selected synthetic invoice returns a reconciled balance and evidence IDs'],
					['Constraints', 'Read-only; explicit currency/cutoff; preserve unrelated changes'],
					['Acceptance', 'Known totals, unmatched rows, malformed input and retry behavior'],
					['Deliverable', 'Small diff, observed test results, runnable artifact and limitations']
				]
			)
		),
		section(
			'trace',
			'Read the path that actually executes',
			'Names and diagrams are clues, not proof.',
			p(
				'Start at the entry point: a page action, API route, command, or scheduled job. Follow the imported function, its inputs, validation, data reads, calculations and effects. Identify where results are stored and how the interface receives them. If a README describes an agent but the code selects the next step with fixed branches, explain it as a workflow. If a diagram shows durable storage but the implementation uses an in-memory array, process restart loses that state unless another mechanism persists it. Accurate architecture defense requires following the actual path.',
				'Separate claimed capability from demonstrated capability. A provider SDK may format a request or expose an event stream; it does not automatically implement your authorization policy, idempotency ledger, financial reconciliation or recovery tests. A frontend button labeled “approve” does not establish a server-side approval boundary. A test file is not evidence that it passed on the deployed revision. Inspect the relevant function and show the observed result for the claim you make.',
				'Review the diff in the context of the existing code. Look for changed business rules, deleted checks, broadened permissions, new dependencies, secrets in public files, unrelated rewrites, and error paths that now masquerade as success. Ask the assistant to explain a suspicious line using a concrete input. You do not need to recite every syntax feature, but you should be able to say which function selected records, which computed the amount, which mutated state, and which rendered the result. If you cannot yet explain a section, narrow the change and learn that boundary before presenting it as your design.'
			),
			note(
				'mechanism',
				'AI assistance is a contribution, not an alibi',
				'An honest portfolio can say an assistant helped implement code while you specified the controls, reviewed the calculations and tested the failure cases. Be precise about both the help and the decisions you can defend.'
			)
		),
		section(
			'test-change',
			'Use independent expected results',
			'A test is useful when a plausible mistake would make it fail.',
			p(
				'Use the PIPE-01 cohort from M21. Invoices total USD 2,000. Raw payments total USD 1,450, including an identical USD 200 duplicate. Quarantining that duplicate leaves USD 1,250 accepted; USD 1,100 matches invoices and USD 150 remains unmatched. Outstanding is USD 900. These totals provide several independent control identities. A generated test that calls the same incorrect aggregation to compute its expected answer will agree with the bug. Calculate the fixture expectations separately and test the business relationships.',
				'A unit test exercises a bounded function, such as strict money parsing or duplicate resolution. An integration test checks components working together, such as a request handler, operation receipt and persistence layer. A browser test checks a user journey and the resulting presentation. The layers answer different questions. A perfect subtraction unit test cannot detect the wrong record selected in the interface, while a screenshot cannot establish durable idempotency after process restart.',
				'Use changed cases to expose shortcuts. Reordering rows must not alter the declared duplicate result. A second payment with a new ID and the same amount must remain legitimate. A conflicting duplicate must follow the hold policy, not silently choose whichever row appears first. A received amount after the cutoff must not change the current balance. For a write, simulate success followed by loss of the response, then retry the same operation identity and verify a single logical effect. A retry test that fails before execution misses the harder uncertainty.'
			),
			worked(
				'A repair that accidentally deletes a real payment',
				'A proposed fix removes duplicate payment amounts. Existing P2 is USD 200; a changed fixture adds legitimate P5 of USD 200 for invoice C. Invoice C originally owes USD 400.',
				[
					'P2 and P5 have different event IDs, so equal amounts alone do not make them duplicates.',
					'Accepted payments rise from USD 1,250 to USD 1,450. Matched payments rise from USD 1,100 to USD 1,300; unmatched remains USD 150.',
					'Outstanding falls from USD 900 to USD 700, including USD 200 still due on C.',
					'An amount-based deduplicator may erase P5 and incorrectly leave USD 900 outstanding. A stable-ID changed case catches it.'
				],
				'The test defends the business grain rather than merely repeating the implementation.'
			)
		),
		section(
			'debug',
			'Locate the first broken boundary',
			'Preserve the failure before changing the system.',
			p(
				'When a number is wrong, reproduce the smallest failing input and compare expected with observed behavior. Trace stages in order: raw source, parsing, accepted records, join, calculation, response, display and export. The earliest divergence narrows the repair. If the accepted payment table already dropped P5, changing chart formatting will not solve the problem. If the calculation is right but the browser displays an obsolete request, changing financial logic risks adding a second bug.',
				'Keep a short incident record: input/configuration versions, observed behavior, expected behavior, reproduction steps, suspected mechanism, repair and regression evidence. A hypothesis is not a confirmed cause. Change one relevant mechanism, rerun the failing case, and check nearby behavior that the repair could affect. Preserve the original result instead of replacing it with the successful retest. This makes improvement credible and prevents hindsight from making the earlier system appear stronger than it was.',
				'Ask an assistant for a diagnosis with evidence before a broad rewrite when the failure is localized. Useful requests include “show which record first disappears”, “trace this operation ID through retry”, or “explain why the deployed asset path differs from development”. Review the proposed change, run the necessary checks, and stop broadening the repair once its acceptance criteria are met. If the root cause remains uncertain, say what the evidence rules out and which next experiment would discriminate between the remaining explanations.'
			),
			lab(
				'agent-runtime',
				'Defend a lost-response recovery',
				'Use the local runtime to inspect dispatch and execution separately. Compare a permitted operation with a denied or stale one; exercise a lost reply and recovery while preserving the operation identity. Explain the transport state and effect receipt as separate records.',
				'Does a lost response prove that a tool did not complete its effect?',
				[
					'Call identity, operation identity and expected revision',
					'Observed effect count before and after recovery',
					'Rejected, pending and completed states with reasons'
				],
				'Authored proposals drive actual bounded local state transitions. The browser experiment is not a durable enterprise service; the optional downloadable starter provides a separate local HTTP/persistence exercise without model inference.'
			)
		),
		section(
			'release',
			'Connect the verified change to the published artifact',
			'Passing locally is one link in the release chain.',
			p(
				'A commit identifies source; a build transforms source and dependencies into an artifact; deployment makes that artifact available in an environment. Record all three. Lockfile-based dependency installation reduces accidental version drift, but data, generated assets and environment configuration also affect behavior. A successful deployment job is not proof that the complete test suite passed if the jobs run independently. Make required checks prerequisites of release and identify exactly which revision they evaluated.',
				'Test the compiled application under its real base path, especially on repository-relative static hosting. A development URL can work while a worker, image, downloadable file or deep link fails after publication. Check loading, route refresh, errors, exports and offline or unsupported-capability fallbacks where relevant. A provider key should never appear in the static artifact. For a private backend, additionally verify server-side identity, access, timeouts, durable operation state and operational ownership; a public teaching prototype does not establish those controls.',
				'The downloadable builder service is a local Node HTTP/SSE exercise with synthetic reconciliation and an operation receipt. SSE means server-sent events: a server streams updates to a client over an HTTP connection. Follow its companion guide to run, inspect and test it, including restart/retry behavior. The service does not call a model or require provider credentials. Its small implementation makes boundaries visible; it is not an authenticated production service or a replacement for the release and deployment work in M34.'
			),
			note(
				'warning',
				'Build what you can verify',
				'A polished demo may be ready to teach while still needing authentication, concurrency review, operational monitoring or organizational approval for a real deployment. List those concrete gaps rather than using a vague “production-ready” label.'
			)
		),
		section(
			'defend',
			'Present a system you can take apart and rebuild',
			'A strong interview is an evidence walk, not a feature recital.',
			p(
				'Open with the user’s decision and the bounded outcome. Then show one path: input record, selection rule, calculation, source-supported draft, review state and displayed result. Identify which parts are learned, which use authored fixtures, and which are deterministic. Explain one failure you reproduced and the test that now catches it. This is more persuasive than listing many libraries or claiming that an assistant built everything overnight.',
				'Prepare to change the example in front of the reviewer. If an amount, reporting basis, document layout, provider response, or request order changes, predict which output and controls should change before running it. Name the architecture tradeoff: static public snapshot versus private live service; local deterministic route versus model-selected action; pre-generated audio versus realtime conversation. Use measured or observed evidence where you have it, and label assumptions where you do not.',
				'Conclude the defense with remaining work tied to the intended use. A portfolio demonstrator may justify no sensitive data and bounded fixtures. An organizational finance system requires approved source integration, authorization, durable audit records, monitoring, support and tested recovery. Completing this chapter makes those distinctions explainable; expertise grows through further implementation and review. Your next project should extend a boundary you can already trace rather than hide missing foundations behind a larger architecture diagram.'
			)
		)
	],
	checks: [
		check(
			'm35-q1',
			0,
			'Which coding request is most reviewable?',
			[
				'Make the whole finance platform production-ready',
				'Add the declared read-only balance path with fixture totals and explicit rejection cases',
				'Use as many agents as possible'
			],
			1,
			[
				'Scope and acceptance are unspecified.',
				'Correct. The task has observable behavior and constraints.',
				'Agent count is an implementation choice, not a business outcome.'
			]
		),
		check(
			'm35-q2',
			1,
			'A README says a queue is durable; its only store is an in-memory array. What can you defend?',
			[
				'Only process-local state unless another persistence mechanism is demonstrated',
				'Durability because an SDK is imported',
				'Durability because documentation promises it'
			],
			0,
			[
				'Correct. Trace storage and restart behavior.',
				'An SDK import does not establish this application’s persistence contract.',
				'Documentation can be stale or aspirational.'
			]
		),
		check(
			'm35-q3',
			2,
			'Legitimate P5 adds USD 200 to C after the original PIPE-01 result. What should outstanding become?',
			['USD 1,100', 'USD 900 because the amount already existed', 'USD 700'],
			2,
			[
				'A payment reduces this positive receivable balance under the supplied case.',
				'Equal amounts do not make distinct event IDs duplicates.',
				'Correct. Matched payments increase 200 and outstanding decreases 200.'
			]
		),
		check(
			'm35-q4',
			2,
			'Which retry test addresses an uncertain write most directly?',
			[
				'Fail before the tool executes',
				'Commit the effect, lose the response, retry the same operation ID and assert one effect',
				'Retry with a new ID until the interface looks right'
			],
			1,
			[
				'That misses success-with-lost-reply uncertainty.',
				'Correct. It tests recovery at the consequential boundary.',
				'A new identity can duplicate the effect.'
			]
		),
		check(
			'm35-q5',
			3,
			'Deployment succeeds while an independent quality job fails. What follows?',
			[
				'The release chain allowed publication without the full quality prerequisite',
				'The failing test can be renamed',
				'Everything required passed'
			],
			0,
			[
				'Correct. Connect job dependencies and investigate the actual failed behavior.',
				'Renaming does not repair the release or test.',
				'A successful deployment is not a substitute for the failed gate.'
			]
		),
		check(
			'm35-q6',
			4,
			'Which portfolio claim is strongest?',
			[
				'Guaranteed production safety because code was AI-reviewed',
				'A fully autonomous accountant replaces finance staff',
				'A bounded synthetic prototype with traced calculations, actual local controls and recorded changed-case tests'
			],
			2,
			[
				'Review cannot guarantee safety or substitute for the necessary controls.',
				'This exceeds the demonstrated scope and ignores responsibility.',
				'Correct. It identifies what was built and verified.'
			]
		)
	],
	assignment: {
		title: 'Ship and defend one bounded implementation',
		scenario:
			'Extend the supplied local synthetic service or your prior bounded prototype. Use PIPE-01 plus legitimate payment P5 of USD 200 for C as a changed case. Preserve the original evidence and identify any task-specific fixture differences in the starter.',
		tasks: [
			'Write an outcome/constraint/acceptance specification before editing.',
			'Trace one actual input-to-output path and identify its execution/storage boundaries.',
			'Implement one small change and review the diff.',
			'Record independently calculated normal/changed results and one relevant failure/recovery test.',
			'Prepare a five-minute architecture defense with observed evidence and remaining work.'
		],
		deliverable:
			'A small patch or clearly specified implementation increment, execution trace, test record, release checklist and architecture defense.',
		download: 'downloads/builder-service.mjs',
		rubric: [
			{
				criterion: 'Bounded specification',
				evidence: 'Concrete user behavior and fixture expectations precede the edit.'
			},
			{
				criterion: 'Implementation understanding',
				evidence: 'Can identify parser, selector, calculation, effect and presentation boundaries.'
			},
			{
				criterion: 'Verification',
				evidence: 'Independent expected totals, changed-case evidence and preserved failure/retest.'
			},
			{
				criterion: 'Release honesty',
				evidence:
					'Source/check/artifact/environment linked; limitations and AI contribution explicit.'
			}
		],
		workedSolution: [
			'Specify a read-only reconciliation change with stable payment identity and no posting authority. Locate the actual service/engine and response path before changing files.',
			'For PIPE-01, record raw 1450, quarantine 200, accepted 1250, matched 1100, unmatched 150 and outstanding 900 USD. With legitimate P5, raw 1650, quarantine 200, accepted 1450, matched 1300, unmatched 150 and outstanding 700.',
			'The expected result must not come from the same implementation under test. Add equal-amount/different-ID, conflicting-duplicate or lost-reply recovery evidence appropriate to the changed boundary.',
			'Inspect the diff for unrelated changes, then record the exact checks and compiled/local behavior. Follow the supplied guide for the separate service’s fixtures and restart exercise; do not claim it executed PIPE-01 unless you actually adapted and ran that input.',
			'In the defense, explain the user decision, architecture, trace, one failure and repair, AI assistance used, and concrete production gaps. A clear limitation strengthens an accurate claim.'
		]
	},
	interview: {
		question:
			'An AI assistant wrote much of this application. What did you contribute, and how do you know it works?',
		strongAnswer: [
			'I defined the financial grain, control identities, permissions and acceptance cases; then used the assistant for bounded implementation work. I can trace a displayed result through the actual code to source records, explain the diff, and independently recompute the example.',
			'I preserve failed and corrected runs, demonstrate a changed case and relevant recovery behavior, and connect checks to the published revision. I state which model calls are real, which inputs are authored fixtures, and which operational controls remain outside the prototype.'
		],
		followUps: [
			{
				question: 'What if a test passes because it repeats the bug?',
				answer:
					'I replace the expected value with an independent calculation or invariant and add a plausible changed case, such as a legitimate equal-amount payment with a different identity.'
			},
			{
				question: 'What would you show first if the demo fails?',
				answer:
					'The smallest reproduction and its expected behavior, followed by the first boundary where observed data diverges. I would not conceal the failure or immediately rewrite unrelated components.'
			}
		]
	},
	sources: [
		{
			label: 'OpenAI — Using Goals in Codex',
			url: 'https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex',
			note: 'Concrete outcomes, verification methods and constraints for sustained coding work.'
		},
		{
			label: 'Anthropic — Best practices for Claude Code',
			url: 'https://code.claude.com/docs/en/best-practices',
			note: 'Providing context and verifiable success criteria; inspecting and iterating on code.'
		},
		{
			label: 'Git — About Version Control',
			url: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control',
			note: 'Recoverable file history and comparison of changes.'
		}
	]
};
