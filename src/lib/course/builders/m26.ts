import type { CourseModule } from '../types';
import { p, note, table, worked, lab, section, check } from '../days/content-helpers';

export const m26: CourseModule = {
	id: 'M26',
	day: 6,
	title: 'Full-stack and coding foundations',
	subtitle:
		'Follow a financial request through the browser, data contracts, code, and execution environment.',
	minutes: 60,
	prerequisites: ['M21', 'M25'],
	objectives: [
		'Trace a user action through an HTTP request, validated data, calculation, and rendered response.',
		'Distinguish browser, build-time, and server responsibilities, including where secrets and durable state belong.',
		'Read simple TypeScript modules, functions, objects, arrays, and asynchronous control flow.',
		'Separate compile-time types from runtime and business validation.',
		'Use a small Git change and independent fixture to explain a reproducible implementation.'
	],
	why: 'You can explain the accounting calculation. Now you need to explain how a click produces it, where an error could enter, and what actually runs after publication.',
	sections: [
		section(
			'request-journey',
			'Trace one click all the way through',
			'A financial application is a connected sequence of responsibilities.',
			p(
				'Imagine a fictional receivables application. A reviewer selects invoice A and asks for its outstanding balance. The browser displays the interface and responds to the click. In a server-backed design, it sends a request to a service that checks the user’s access, reads accepted records, computes the balance, and returns a response. The browser then renders the amount and evidence links. A language model is optional in this path: the balance can be calculated exactly without generating prose.',
				'HTTP is a protocol for exchanging requests and responses. A URL identifies a resource or endpoint; a method expresses the requested operation. GET commonly retrieves a representation, while POST commonly submits data for processing. Headers describe matters such as content format and credentials; the body carries the payload. A status code indicates the HTTP outcome. A successful status does not prove that the balance is financially correct. You still need the right invoice, cutoff, currency, and accepted payment records.',
				'JSON represents structured data as text using objects, arrays, strings, numbers, booleans, and null. An object groups named fields; an array is an ordered collection. The response {"invoiceId":"A","balanceCents":50000,"currency":"USD"} describes a USD 500 balance under a cents contract. JSON parsing turns that text into program values. It does not verify that A exists, that cents were used, or that the requesting user can see A. Keep transport success, format validity, authorization, and financial correctness separate.'
			),
			table(
				'The same request, four different questions',
				['Boundary', 'Question', 'Evidence'],
				[
					['HTTP', 'Did the service respond?', 'Status and request identifier'],
					[
						'Schema',
						'Are required fields correctly typed?',
						'Validated response or explicit error'
					],
					['Access', 'May this user read this invoice?', 'Server-enforced authorization'],
					[
						'Business',
						'Is the amount correct for this cutoff?',
						'Accepted inputs and reconciled calculation'
					]
				]
			)
		),
		section(
			'execution-places',
			'Know where each piece runs',
			'A development server and a deployed backend are different things.',
			p(
				'Browser code runs on the visitor’s device. Anything delivered to it can be inspected, including bundled JavaScript and downloaded JSON. Hiding an API key in a component, environment variable expanded into the bundle, or obscure filename does not protect it. A private integration normally belongs behind an authorized server boundary. That server can hold credentials, enforce access, and return only the allowed result. It must not trust a client-supplied role such as "administrator" without authenticating and authorizing it.',
				'Build-time code runs while creating deployable assets. It can validate public synthetic CSV files, calculate a dashboard snapshot, or generate approved narration. The resulting HTML, JavaScript, JSON, images, and audio can then be served as static files. Static hosting can support rich calculations in the browser, including this course’s local labs. It does not automatically provide a private database, scheduled worker, secret-holding API, or durable multi-user queue. A file named server in a framework may execute during prerendering; inspect the deployment output and adapter rather than infer infrastructure from a filename.',
				'A backend is a service that executes outside the visitor’s browser. Durable storage keeps required records beyond one page session or worker process. Local browser storage is useful for preferences and practice evidence, but users can clear or edit it and other devices do not automatically share it. To turn a prototype into an organizational application, specify identity, access, data ownership, persistence, recovery, and operational responsibility. These are architectural decisions, not benefits that appear when a page receives a professional design.'
			),
			note(
				'mechanism',
				'Three clocks',
				'Build time produces an artifact; request time serves or calculates a response; interaction time updates the interface. A dated data snapshot remains dated even when the website loads instantly.'
			)
		),
		section(
			'read-code',
			'Read a small module as a business procedure',
			'Names, inputs, outputs, and effects matter more than memorizing syntax.',
			p(
				'A function is a named procedure with inputs and a result. A variable holds a value; const prevents reassignment of that binding, but does not make every nested object immutable. TypeScript adds descriptions of expected values to JavaScript. In the type below, the vertical bar means the currency must be one of two allowed strings. The function accepts two Money records, checks matching currency and safe integer amounts, and returns another record. Safe integers are whole numbers within JavaScript’s exact integer range. The cents policy avoids ordinary decimal rounding surprises for this bounded example.',
				'A module is a file with explicit exports and imports. Put the balance calculation in a module separate from the visual component. That lets a test call the calculation without clicking a page and lets another interface reuse the same rule. An import does not mean a network request on every calculation: the build tool resolves and bundles dependencies according to the application setup. A package is a reusable collection of code with metadata; the package manifest declares dependencies and scripts, while the lockfile records resolved versions for repeatable installation.'
			),
			{
				kind: 'code',
				language: 'typescript',
				title: 'A bounded money function',
				code: 'type Money = { cents: number; currency: "USD" | "EUR" };\nexport function outstanding(invoice: Money, paid: Money): Money {\n  if (invoice.currency !== paid.currency) throw new Error("Currency mismatch");\n  if (![invoice.cents, paid.cents].every(Number.isSafeInteger)) {\n    throw new Error("Amounts must be safe integer cents");\n  }\n  const cents = invoice.cents - paid.cents;\n  if (!Number.isSafeInteger(cents)) throw new Error("Amount overflow");\n  return { cents, currency: invoice.currency };\n}',
				explanation:
					'Read top to bottom: describe inputs, reject incompatible currency and invalid integer representations, subtract, check the result, and return its unit. This function assumes accepted amounts have already been selected; it does not deduplicate payments, authorize users, or settle accounting policy for overpayments.'
			},
			p(
				'A pure calculation returns a result from its inputs without changing outside state. Sending a message, updating a database, or writing a file has a side effect. Keep side effects visible in the design. Repeating a pure calculation is usually straightforward; repeating a payment or reviewer-task creation needs the idempotency and recovery rules from M17–M19.'
			)
		),
		section(
			'async-boundaries',
			'Waiting is part of the program',
			'Responses can arrive late, out of order, or incompletely.',
			p(
				'A Promise represents an operation that may finish later with a value or an error. An async function returns a Promise. await pauses that function’s progress until the awaited operation settles; it does not freeze the whole browser. A request can fail because the network is unavailable, because a server returns an error, because response text is not valid JSON, or because parsed fields fail validation. Those are different repair paths. With the browser Fetch API, an HTTP error such as 404 still produces a response, so inspect response.ok rather than relying only on a catch block.',
				'Suppose a reviewer selects A, then immediately selects B. A’s slower response arrives last. If the page blindly displays every completed response, B’s label can appear beside A’s balance. Record the active request identity and ignore stale results, or cancel obsolete requests where supported. Cancellation does not establish that a remote side effect was undone. Read operations and write operations therefore need different recovery reasoning.',
				'Independent reads can run concurrently; dependent steps must wait for their inputs. Reading two already-authorized public source documents together may reduce elapsed time. Computing a balance before accepted payments have been selected does not. Display explicit loading, empty, error, and completed states. An error should not leave an old amount looking like the new answer. Distinguish “no matching payments” from “payment service unavailable”: the first may legitimately mean zero accepted payments, while the second means the balance cannot yet be established.'
			),
			worked(
				'Diagnose a stale result',
				'A starts at 0 ms and returns USD 500 at 900 ms. B starts at 100 ms and returns USD 200 at 300 ms. The active selection remains B.',
				[
					'At 300 ms, B’s response matches the active request and may be displayed.',
					'At 900 ms, A’s response is stale. Preserve its trace if needed, but do not replace B’s amount.',
					'A changed-case test should deliberately reverse response order and assert that the displayed ID and amount still belong together.'
				],
				'The defect is response coordination, not the subtraction formula.'
			)
		),
		section(
			'contracts',
			'Types are a guide; boundaries need checks',
			'External data must earn its place in a calculation.',
			p(
				'TypeScript can catch mistakes while checking code, such as passing a string where a number is expected. Those type annotations do not inspect a network payload at runtime. A cast saying “treat this as Money” is a claim by the programmer, not evidence about the data. Start an external value as unknown, validate its structure and allowed values, then permit the narrower type inside trusted code. Schema libraries can help, but you must still state the financial rules.',
				'For a payment record, validate the identifier, safe integer cents, supported currency, and cutoff date. Then validate relationships: the invoice exists, the currency agrees, a repeated payment ID is handled under the duplicate policy, and the record is authorized for this user. A syntactically correct USD 500,000 payment can still be the wrong amount. A valid date after the cutoff can still be excluded from the current balance. Rejection should retain a reason and the source identity so a reviewer can fix the record without losing its history.'
			),
			lab(
				'agent-runtime',
				'Read the execution boundary',
				'Inspect the local runtime’s authored proposals, validated tool inputs, execution results, and stop states. Choose one rejected proposal and explain which boundary rejected it. Then connect one accepted result to its visible input records.',
				'Would changing a proposal’s wording change permission to execute it?',
				[
					'Identify proposal, validator, executor, and result as separate responsibilities.',
					'Record one accepted and one rejected transition.',
					'Describe which responsibilities would require a server in a private deployed application.'
				],
				'The lab executes local deterministic mechanics with authored model inputs. It does not send a provider request, authenticate an enterprise user, or create a production backend.'
			)
		),
		section(
			'versioned-change',
			'Make one change that another person can inspect',
			'A reproducible change is smaller than a complete application rewrite.',
			p(
				'Git records versions of tracked files. A diff shows what changed; a commit records a selected snapshot and message. A branch supports a line of development; pushing sends commits to a remote repository. None of these operations proves the program works or automatically publishes a website. Deployment depends on a separate configured process. Before asking an assistant to change code, inspect the current files and instructions, define one outcome, and preserve unrelated work.',
				'For the balance function, a useful first fixture is invoice 100,000 cents and accepted payments 50,000 cents, both USD: expected balance 50,000. Add mismatched currency and malformed input cases. Then change the accepted payment to 60,000 and expect 40,000. A test that always expects the function’s own output checks little. Calculate the expected result independently and explain its units. Record the code revision, fixture version, command, and observed result. M35 develops this into a complete implementation review.'
			)
		)
	],
	checks: [
		check(
			'm26-q1',
			0,
			'A request returns HTTP 200 and valid JSON containing the wrong invoice ID. What has been established?',
			[
				'Transport and JSON parsing succeeded; identity still fails',
				'The server must have authenticated the intended invoice',
				'The financial answer is correct'
			],
			0,
			[
				'Correct. Format and transport evidence do not validate the requested business identity.',
				'Authentication and object authorization need their own evidence.',
				'HTTP success does not establish financial correctness.'
			]
		),
		check(
			'm26-q2',
			1,
			'A static build includes a provider key in its JavaScript bundle. Which repair addresses the boundary?',
			[
				'Hide the settings panel',
				'Rename the variable',
				'Move the secret-dependent call behind an authorized server endpoint'
			],
			2,
			[
				'A hidden panel does not protect downloaded code.',
				'Names do not prevent inspecting delivered bytes.',
				'Correct. The private credential stays outside public assets and the server enforces access.'
			]
		),
		check(
			'm26-q3',
			2,
			'A function returns a Promise. What does await do inside an async caller?',
			[
				'Freezes every browser interaction',
				'Waits for that operation before continuing that function',
				'Trains the model in the background'
			],
			1,
			[
				'Await does not synchronously block the entire browser.',
				'Correct. Other event-loop work can continue while the operation is pending.',
				'Asynchronous control flow has no necessary connection to training.'
			]
		),
		check(
			'm26-q4',
			3,
			'An external amount "50000" is cast as a number with TypeScript. What happened?',
			[
				'A compile-time assertion was made; runtime validation is still needed',
				'Currency was checked',
				'The string became a validated safe integer'
			],
			0,
			[
				'Correct. Validate the actual value and financial contract.',
				'A numeric assertion says nothing about currency.',
				'A type assertion does not parse or validate external values.'
			]
		),
		check(
			'm26-q5',
			0,
			'B is selected after A, but A’s response arrives last. Which assertion catches the important failure?',
			[
				'Every response is eventually displayed',
				'The page contains a dollar sign',
				'Displayed record ID and balance belong to the active request'
			],
			2,
			[
				'Showing obsolete responses can cause precisely the defect.',
				'Formatting cannot detect an identity mix-up.',
				'Correct. Test the association under reversed response order.'
			]
		),
		check(
			'm26-q6',
			4,
			'A commit exists and was pushed. Can you report that the application is deployed and verified?',
			[
				'Only if the commit message says tested',
				'No; inspect the deployment and meaningful verification evidence separately',
				'Yes, Git performs all three operations'
			],
			1,
			[
				'A message is a claim, not the test or deployed artifact.',
				'Correct. Connect revision, checks, artifact, and environment.',
				'Version control and deployment are distinct systems.'
			]
		)
	],
	assignment: {
		title: 'Defend a one-click balance architecture',
		scenario:
			'Fictional invoice A is USD 1,000 with USD 500 accepted payments. A reviewer requests its balance; a second request for B may overlap. The public portfolio contains only synthetic fixtures.',
		tasks: [
			'Draw the request path and label browser, build-time, and optional server responsibilities.',
			'Explain the Money function line by line and calculate a changed payment of USD 600.',
			'Specify malformed data, currency mismatch, and out-of-order-response tests.',
			'Describe the smallest Git change and the evidence required before publication.'
		],
		deliverable:
			'One architecture sketch, a function explanation, three boundary tests, and a revision/verification record.',
		download: 'downloads/builder-guide.md',
		rubric: [
			{
				criterion: 'Execution location',
				evidence:
					'Public browser bytes contain no private key; durable/authorized services are explicit.'
			},
			{
				criterion: 'Financial meaning',
				evidence:
					'100000 − 50000 = 50000 cents; changed case gives 40000, with USD and cutoff retained.'
			},
			{
				criterion: 'Boundaries',
				evidence:
					'Types, schema checks, access, business validation, and stale-result handling remain distinct.'
			},
			{
				criterion: 'Reproducibility',
				evidence:
					'Small diff, known fixture, independent expected result, and exact verification outcome.'
			}
		],
		workedSolution: [
			'A browser selection triggers a read request; an authorized server is needed only for the proposed private integration. The synthetic local demonstration can execute the same pure calculation without that server.',
			'The function checks matching currency and integer representation, subtracts 50000 from 100000, and returns 50000 cents/USD. With 60000 paid, it returns 40000. Accepted-payment selection is a separate prerequisite.',
			'Reject a string amount unless the declared parser validates and converts it; reject EUR versus USD; reverse A/B response completion and keep B’s ID with B’s value.',
			'Commit the bounded calculation/request-coordination change after inspecting its diff. Record fixture and test results; verify the compiled deployed artifact separately from the Git push.'
		]
	},
	interview: {
		question: 'Walk me from a user’s click to a defensible financial number.',
		strongAnswer: [
			'I identify the active record and request, validate external fields and access, select accepted inputs at the declared cutoff, calculate with explicit units, and return both amount and evidence IDs. The interface presents loading and failure states without showing a stale amount as current.',
			'I explain where each step runs. A static synthetic demonstration can calculate in the browser; private credentials and organizational authorization need a server boundary. I show the function, changed fixture, and deployed revision rather than claiming that a type annotation or green HTTP response proves correctness.'
		],
		followUps: [
			{
				question: 'Why not put everything in the UI component?',
				answer:
					'Separating calculation and validation from presentation makes business rules reusable and directly testable. Side effects remain visible and can have explicit recovery contracts.'
			},
			{
				question: 'What if the server returns no payments?',
				answer:
					'I distinguish a successful empty result under the correct scope from an unavailable or incomplete service. Only the former can support a zero accepted-payment amount.'
			}
		]
	},
	sources: [
		{
			label: 'MDN — Using the Fetch API',
			url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
			note: 'HTTP response checks and asynchronous request/body handling.'
		},
		{
			label: 'Git — About Version Control',
			url: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control',
			note: 'Recorded file versions and recoverable history.'
		},
		{
			label: 'TypeScript Handbook — Everyday Types',
			url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html',
			note: 'Objects, arrays, unions, and type assertions; consult the current official handbook.'
		}
	]
};
