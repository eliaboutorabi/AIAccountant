import type { CourseModule } from '../types';
import { p, note, table, worked, lab, section, check } from '../days/content-helpers';
export const m27: CourseModule = {
	id: 'M27',
	day: 6,
	title: 'Model and provider routing',
	subtitle: 'Choose a capability, enforce a contract, and measure the whole route.',
	minutes: 65,
	prerequisites: ['M26', 'M13'],
	objectives: [
		'Separate application roles, model capabilities, providers, tools, and execution runtimes.',
		'Design a provider adapter that preserves useful metadata and explicitly rejects unsupported capabilities.',
		'Distinguish structured output, tool proposals, execution permission, and factual support.',
		'Calculate illustrative routing cost and latency, including cache and retry assumptions.',
		'Evaluate routing changes on relevant cases and apply consistent access and budget controls.'
	],
	why: 'A finance product may need extraction, calculation, explanation, and speech. Calling all four “the AI” hides the decisions that determine cost, reliability, and what the system can actually do.',
	sections: [
		section(
			'roles',
			'Assign work before choosing a model',
			'The job description comes before the model name.',
			p(
				'Consider a fictional monthly briefing builder. It reads a scanned cost statement, extracts candidates, checks totals against approved records, drafts commentary, and optionally produces narration. These are different roles. A multimodal model or OCR engine may read the scan. Ordinary code reconciles amounts. A language model drafts an explanation from verified facts. A text-to-speech model converts the approved wording into audio. A single provider might offer several capabilities, but that does not make every model or endpoint interchangeable.',
				'A provider supplies access to a service; a model is the learned system used for a task; an API defines how software requests the service. An SDK is a programming library that helps use that API. An adapter translates your application’s contract into a provider’s request and translates the response back. The runtime executes code, tracks state, applies permissions, and handles failures. A tool is a callable capability such as reading records or calculating a balance. A model proposing a tool call is not the same event as the runtime executing it.',
				'Start with required input and output types, evidence needs, allowed data handling, latency and budget, then evaluate candidates. Reading an image, returning constrained JSON, producing speech, and executing a hosted search have distinct capability requirements. A label such as reasoning model does not establish that a particular endpoint accepts an image or supports a given schema. Consult current provider documentation and test the exact model, endpoint, and options. Model names and feature availability change; record the combination used in your evidence.'
			),
			table(
				'Fictional briefing route',
				['Role', 'Input → output', 'Independent acceptance check'],
				[
					[
						'Extract',
						'Source page → candidate fields',
						'Location, currency, totals, missing fields'
					],
					['Calculate', 'Accepted numeric records → reconciliation', 'Exact control identities'],
					[
						'Draft',
						'Verified facts → proposed narrative',
						'Each claim supported; unknown causes withheld'
					],
					[
						'Narrate',
						'Approved text → audio',
						'Numbers pronounced correctly; transcript and playback reviewed'
					]
				]
			)
		),
		section(
			'adapter',
			'Build a small stable application contract',
			'Normalize differences without pretending they disappeared.',
			p(
				'An application request can carry a task ID, role, input references, required output schema, maximum output size, deadline, and allowed tools. The adapter maps these into the provider-specific API. Its result should distinguish completed, refused, incomplete, unavailable, and invalid responses. Also retain provider, exact model identifier, request ID where available, measured duration, token or other usage, and the source/configuration versions. Without those fields, a quality change can be mistaken for a prompt effect when the selected model or endpoint actually changed.',
				'Do not reduce every response to one text string. A response may contain tool proposals, text, citations, audio, or incomplete output. Flattening these loses information the runtime needs. Likewise, do not silently remove an unsupported schema or ignore an output cap to make a call succeed. Fail with a specific capability error or select an explicitly evaluated alternative. Fallback changes behavior and data destination; it must respect the same access, retention, and task constraints as the preferred route.',
				'An adapter is a useful seam for testing. Supply authored responses that contain valid fields, malformed JSON, a refusal, a truncated object, or an unavailable service. Test how your application reacts without paying for inference on every unit test. Keep those fixtures labeled. They establish deterministic response handling, not the live model’s accuracy. A separate provider evaluation needs actual requests under recorded conditions and a budget. The core routing lab uses the former approach.'
			),
			note(
				'mechanism',
				'Compatibility is multidimensional',
				'A provider can support text but not image input on a chosen endpoint, tool proposals but not your schema subset, or streaming but not the response shape your parser expects. Maintain a capability table with observed tests, not just a vendor-name switch.'
			)
		),
		section(
			'structured-contract',
			'A valid structure can carry a false statement',
			'Check shape, meaning, evidence, and authority separately.',
			p(
				'Structured output constrains the response format according to a supported schema. For example, require invoiceId as text, currency as USD or EUR, amountCents as an integer, and evidenceIds as an array. This can eliminate many parsing and field-shape failures. It cannot establish that the amount matches the document, that the cited record supports the claim, or that the user may access it. A schema-valid object containing 120300 cents is wrong if the source total is 120800 cents. Run the financial checks from M15 and M21 after structure validation.',
				'Providers distinguish structured user-facing responses from tool calling in different API shapes. In an application-owned tool loop, the model returns a tool name and arguments; your runtime validates them, checks permission and budget, executes allowed code, and returns the result associated with the call. A valid proposal to send_payment is still unauthorized when the task permits only draft_note. Provider-hosted tools may execute within the provider service, so document their actual data and control boundary rather than assume every tool runs on your server.',
				'Handle incomplete or refused responses explicitly. Retrying the same invalid schema forever cannot fix an unsupported contract. A useful repair request might explain a detected formatting problem within a bounded retry policy, but retain the original failure and validate the replacement independently. Never turn a failure into a fabricated successful response. For financial extraction, an honest unresolved field is more useful than a syntactically convenient guess.'
			),
			worked(
				'Four gates for one authored response',
				'Candidate: {"invoiceId":"W-18","currency":"USD","amountCents":120300,"evidenceIds":["SCAN-18"]}. The verified printed amount is USD 1,208.00.',
				[
					'The candidate is valid JSON and may satisfy the declared field schema.',
					'120300 cents equals USD 1,203.00, five dollars below the verified amount. The financial check fails.',
					'A real evidence ID establishes a locator, not agreement with its content. Compare the cited field or crop.',
					'Even a corrected extraction would not authorize posting or payment. That requires a separate reviewed action.'
				],
				'The repair belongs to evidence extraction and validation, not merely JSON formatting.'
			)
		),
		section(
			'economics',
			'Price the route, including its failure paths',
			'All rates below are invented teaching rates, not provider prices.',
			p(
				'Token-based cost combines input usage and output usage at their respective rates. Some services charge differently for cached input, reasoning output, images, audio, search, storage, or batch work. Use the actual provider’s billing definitions for a real budget. Here we deliberately use a simple fictional rate card so the reasoning can be checked without relying on changing commercial prices. A 4,000-token input at USD 1 per million costs USD 0.004; an 800-token output at USD 4 per million costs USD 0.0032.',
				'Cheap calls can still create an expensive process if they produce more review, retries, or unsupported answers. Suppose a fast route costs USD 0.0072 per case; a deeper route costs USD 0.0288. A router that sends every case through the fast route and escalates 20% adds the deeper cost for those cases. It does not replace the already incurred fast cost. If escalation requires another review pass, include that too. An apparent token saving can be dominated by professional time.',
				'Latency is elapsed waiting time, not just token throughput. Sequential dependencies add: if extraction takes two seconds and required drafting takes three, the path takes at least five before other overhead. Independent reads of two and three seconds can take roughly the slower three when run concurrently, subject to limits and overhead. Report a distribution: the median is the middle case after ordering the measured times, and it can look excellent while the slowest cases time out. An upper percentile describes a slower boundary: roughly 95% of cases finish at or below the 95th-percentile time under the chosen measurement method. Track that tail, completion rate, and useful result quality under the same workload.'
			),
			worked(
				'A thousand-case route',
				'For 1,000 cases, fast input/output costs USD 1/USD 4 per million; deeper costs USD 4/USD 16. Both use 4,000 input and 800 output tokens per call. Every case uses fast; 20% also use deeper.',
				[
					'Fast: 1000 × (0.004 + 0.0032) = USD 7.20.',
					'Deeper escalation: 200 × (0.016 + 0.0128) = USD 5.76. Total model cost = USD 12.96.',
					'If 5% of fast calls need one identical-cost retry, add 50 × 0.0072 = USD 0.36; total becomes USD 13.32.',
					'If 200 escalations each take two reviewer minutes at USD 60/hour, review adds USD 400. This is a separate assumption, not measured savings.'
				],
				'A useful comparison includes accepted outcome quality and human effort, not just the USD 13.32 API estimate.'
			)
		),
		section(
			'cache-control',
			'Reuse work without reusing the wrong authority',
			'A cache needs an identity and an invalidation rule.',
			p(
				'An application result cache stores a previous result for reuse. Its key should reflect all inputs that affect the result: model and configuration, prompt/schema version, source version, language, and relevant user or access scope. Reusing a narrative after the underlying financial record changes can silently publish a stale claim. Reusing one client’s result for another can disclose information. Expiration by time alone is not enough when a policy or access entitlement changes immediately.',
				'Provider prompt caching is different: it can reuse processing of a matching prompt prefix under the provider’s rules, while the model still generates an answer. An application result-cache hit may avoid inference entirely. Do not count a prefix-cache hit as though no output generation was billed. For our fictional route, 300 authorized exact-result hits and 700 fast calls with no escalation would cost 700 × 0.0072 = USD 5.04. That calculation assumes free cache reads and still excludes operating costs.',
				'Apply the same controls to every model call, including suggested questions, summaries, background enrichment, and retries. A quota on the main chat endpoint is incomplete if a suggestions endpoint can spend without limits. Enforce per-task and shared budgets at a trusted boundary, cap attempts and concurrency, and distinguish rate-limit/backoff recovery from permanent validation failures. Log enough to explain usage without placing secrets or unnecessary private content in logs. A cached answer must still pass current authorization before delivery.'
			),
			lab(
				'model-routing',
				'Compare actual routing constraints',
				'Start with the workbench defaults: 2,000 input tokens, 500 reserved output tokens, USD 0.10 call budget, six-second latency limit, one critical error allowed per 100 authored cases, USD 2 per minor error and USD 50 per critical error. Compare the Compact, Balanced and Deliberate profiles. Then require vision or lower the latency limit and inspect which routes remain eligible.',
				'Does the cheapest API call also minimize the total modeled cost among eligible routes?',
				[
					'Compact USD 0.0012, Balanced USD 0.008 and Deliberate USD 0.028 per call under these defaults',
					'Per-100 API plus authored error costs: USD 270.12, USD 58.80 and USD 4.80 respectively',
					'Eligibility rejection reasons and the selected route after a constraint changes'
				],
				'The workbench uses a separate illustrative rate card from the thousand-case example above. It performs real local calculations on authored synthetic capability, latency and error measurements; it does not execute or benchmark a provider. Cache/retry reasoning above is a written exercise, not a hidden live service.'
			),
			p(
				'The workbench prices the reserved output amount, so it is a planning estimate rather than a bill from observed token usage. Its zero critical errors for one profile means zero in the 100 authored cases, not guaranteed zero risk. If a one-second deadline leaves no profile satisfying the error ceiling, report no eligible route and reconsider the task constraints; do not silently discard the safety or quality requirement.'
			)
		),
		section(
			'evaluate-route',
			'Test the selection policy, not just the selected model',
			'Routing itself can make mistakes.',
			p(
				'Create cases that exercise easy and difficult documents, supported and unsupported claims, missing evidence, long inputs, refusals, and service failures. A router that sends unfamiliar scans to a text-only route fails before answer quality is even assessed. Measure route suitability, schema acceptance, field/claim correctness, completion, latency and total cost. Segment results by task and difficulty; an excellent overall rate can hide systematic failures on the cases the router calls easy.',
				'Freeze the candidate routing rule on development evidence and evaluate it on new cases. When replacing a provider or model, keep task inputs and acceptance criteria comparable and record changed capabilities. A stronger general model may still be worse for a particular financial document layout or response contract. Use verified outcomes to justify the route. “The newest model” and “the cheapest model” are selection proposals, not evaluation results.'
			)
		)
	],
	checks: [
		check(
			'm27-q1',
			0,
			'A model returns calculate_balance arguments. What produces the application-owned tool result?',
			[
				'The tool name automatically runs code',
				'The runtime validates, authorizes, and executes the callable',
				'The tokenizer calculates the balance'
			],
			1,
			[
				'A proposal is not execution.',
				'Correct. The runtime enforces the boundary and supplies the observed result.',
				'Tokenization represents input; it does not implement the balance tool.'
			]
		),
		check(
			'm27-q2',
			1,
			'A replacement endpoint does not support the required schema. What should the adapter do?',
			[
				'Return a capability error or use an explicitly approved, evaluated alternative',
				'Pretend free text is the same contract',
				'Silently omit the schema'
			],
			0,
			[
				'Correct. Unsupported capabilities must be explicit.',
				'Downstream code cannot assume a shape that was not enforced and validated.',
				'That weakens a required contract without review.'
			]
		),
		check(
			'm27-q3',
			2,
			'A schema-valid candidate says 120300 cents where the verified source says USD 1,208.00. Which result is defensible?',
			[
				'Change the source to agree',
				'Accept because strict formatting passed',
				'Treat the discrepancy as a five-dollar evidence failure'
			],
			2,
			[
				'Changing source evidence to fit a generated answer destroys the audit trail.',
				'Schema validity does not establish factual accuracy.',
				'Correct. The source amount is 120800 cents, so the candidate is 500 cents low.'
			]
		),
		check(
			'm27-q4',
			3,
			'Every case costs 0.0072; 20% additionally cost 0.0288. For 1,000 cases before retries, what is total model cost?',
			['USD 28.80', 'USD 12.96', 'USD 7.20'],
			1,
			[
				'This assumes every case uses only the deeper route.',
				'Correct: 7.20 + 5.76.',
				'This ignores the additional escalations.'
			]
		),
		check(
			'm27-q5',
			4,
			'Main-chat calls enforce a daily quota, but automatic suggestions do not. What remains?',
			[
				'An unbounded spending path outside the intended control',
				'A tokenizer issue',
				'No issue because suggestions are short'
			],
			0,
			[
				'Correct. Apply consistent authorization and budget accounting to every call path.',
				'The failure concerns control coverage, not text segmentation.',
				'Small calls can accumulate and still access a paid service.'
			]
		),
		check(
			'm27-q6',
			4,
			'Routing improves average accuracy but fails on unfamiliar invoice layouts. What evidence is needed?',
			[
				'An assertion that unfamiliar layouts are rare',
				'A larger aggregate chart only',
				'Task/layout-segment results and route-level failure analysis'
			],
			2,
			[
				'Rarity and consequence must be established, not assumed.',
				'Aggregation can hide the failure.',
				'Correct. Check both routing suitability and downstream correctness on representative changed cases.'
			]
		)
	],
	assignment: {
		title: 'Specify a briefing model gateway',
		scenario:
			'A fictional service handles 1,000 documents using the rate card above. It must extract fields, calculate exact totals, draft supported notes, and optionally narrate approved text. Twenty percent escalate; 5% of fast calls retry once.',
		tasks: [
			'Assign each role to a required capability and separate deterministic calculations from generation.',
			'Define request/result fields and refusal, incomplete, invalid, and unavailable states.',
			'Reconcile USD 13.32 illustrative model cost and USD 400 review cost.',
			'Define a result-cache key and one invalidation event.',
			'Design one changed-layout and one unsupported-schema evaluation case.'
		],
		deliverable:
			'A route table, adapter contract, cost worksheet, cache policy, and two test cases.',
		rubric: [
			{
				criterion: 'Role and execution clarity',
				evidence:
					'Extraction, calculation, narrative and speech have independent acceptance checks.'
			},
			{
				criterion: 'Honest contract',
				evidence:
					'Unsupported/refused/incomplete results are explicit; strict shape never substitutes for support.'
			},
			{
				criterion: 'Economic reasoning',
				evidence: 'Fast, escalation, retry and human costs are separate and arithmetically correct.'
			},
			{
				criterion: 'Control coverage',
				evidence:
					'Every call path shares permissions/budgets; cache identity includes data/configuration and access scope.'
			}
		],
		workedSolution: [
			'Use image-capable extraction for scans, deterministic money functions for reconciliation, a language model for evidence-bounded notes, and TTS only after text review. No role acquires posting authority.',
			'The adapter preserves task/request identity, role, schema/version, provider/model/configuration, input/source references, status, usage and duration. Refusal and incomplete output are not success-shaped strings.',
			'Fast USD 7.20 + escalations USD 5.76 + retries USD 0.36 = USD 13.32. Review is 400 minutes at USD 1/minute = USD 400; stated combined amount is USD 413.32 before other operating costs.',
			'Cache by task inputs, source/prompt/schema/model/configuration and authorized scope. A corrected source version invalidates the old result; current access is checked again on delivery.',
			'The layout case must route to a compatible input capability and pass field-level checks. The unsupported-schema case must fail explicitly or take an evaluated permitted alternative; it must not silently drop the contract.'
		]
	},
	interview: {
		question: 'How would you choose and swap model providers in a finance application?',
		strongAnswer: [
			'I define roles and measurable requirements, then evaluate exact model/endpoint configurations against the same relevant cases. I keep deterministic finance checks outside generation and preserve evidence, status, usage and version metadata through an adapter.',
			'A swap can change supported inputs, tool shapes, refusal behavior, latency, data handling and cost. I test those boundaries and the routing policy, including retries, suggestions and cache access, before recommending a bounded release.'
		],
		followUps: [
			{
				question: 'Does strict JSON make a financial application reliable?',
				answer:
					'It improves the format boundary for supported schemas. Record identity, financial arithmetic, source support and permissions remain separate checks.'
			},
			{
				question: 'When is the more expensive route cheaper overall?',
				answer:
					'When verified improvements reduce retries, reviewer time or consequential errors enough to offset inference cost. I would measure that full process under a declared workload rather than assume it.'
			}
		]
	},
	sources: [
		{
			label: 'OpenAI — Structured model outputs',
			url: 'https://developers.openai.com/api/docs/guides/structured-outputs',
			note: 'Structured responses, supported schema constraints, refusals and incomplete outputs.'
		},
		{
			label: 'Anthropic — Tool use with Claude',
			url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
			note: 'Tool definitions, model proposals, client/server tool roles and result flow.'
		},
		{
			label: 'MDN — Using Fetch',
			url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
			note: 'Transport status and asynchronous response handling.'
		}
	]
};
