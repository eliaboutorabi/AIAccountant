import type { CourseModule, Block, Section, Check } from '../types';

const p = (...paragraphs: string[]): Block => ({ kind: 'prose', paragraphs });
const section = (id: string, title: string, lead: string, ...blocks: Block[]): Section => ({
	id,
	title,
	lead,
	blocks
});
const check = (
	id: string,
	objective: number,
	prompt: string,
	options: string[],
	answer: number,
	rationales: string[]
): Check => ({ id, objective, prompt, options, answer, rationales });

export const day5Modules: CourseModule[] = [
	{
		id: 'M21',
		day: 5,
		title: 'Build a financial pipeline with AI assistance',
		subtitle: 'Turn records into a reproducible, reviewable result.',
		minutes: 60,
		prerequisites: ['M09', 'M20'],
		objectives: [
			'Trace a financial pipeline through raw, validated, reconciled, and reviewed states.',
			'Review an AI-generated transformation against grain, units, and control totals.',
			'Make a bounded change and verify meaningful normal and failure cases.'
		],
		why: 'AI-assisted coding becomes useful professional work when you can explain what the program should do, inspect what changed, and show evidence that the result is correct.',
		sections: [
			section(
				'contract',
				'Specify the behavior before asking for code',
				'A pipeline is a sequence of transformations with explicit inputs and outputs.',
				p(
					'Today you assemble work from earlier modules rather than starting a large application from nothing. The minimum system accepts synthetic invoice and payment records, validates them, computes balances, identifies exceptions, and prepares evidence for review. A browser exercise provides the core path; downloadable code or a spreadsheet can express the same transformation. Programming fluency is an extension, not a hidden prerequisite.',
					'Write the input contract first. One invoice row represents one invoice for one entity and currency. One payment row represents one recorded payment event with a unique payment ID. State the cutoff, amount representation, allowed currencies, and treatment of missing references. The output contract should include accepted records, quarantined records, per-invoice balances, unmatched payments, control totals, and review status.',
					'For the code-inspection path, a function is a named operation that accepts inputs and produces a result or effect. A test runs a chosen case and checks an expected behavior. A diff shows what changed between versions. You can review the business meaning of those changes without becoming fluent in every line of syntax. A pipeline is not necessarily an AI model. Its deterministic stages may be the most important part. A model can help write code, explain an exception, or propose a next investigation, while the application controls ingestion and arithmetic. If you cannot explain the intended transformation before asking an assistant to code it, you will struggle to recognize a plausible but wrong implementation.'
				),
				{
					kind: 'callout',
					tone: 'accounting',
					title: 'Reconciliation compares records; it does not erase differences',
					paragraphs: [
						'An outstanding invoice may be unpaid, partially paid, disputed, not yet due, or missing a recorded payment. The numerical difference is an observation. Its business cause needs evidence. An unmatched payment is retained for investigation, not assigned to the nearest invoice merely to make totals agree.'
					]
				}
			),
			section(
				'records',
				'Meet the complete teaching cohort',
				'Keep this small cohort distinct from any other downloadable practice dataset.',
				{
					kind: 'table',
					caption:
						'PIPE-01 invoices. Fictional Willow, one entity, USD dollars, September 30, 2026 cutoff.',
					headers: ['Invoice ID', 'Amount', 'Source'],
					rows: [
						['A', '1,000.00', 'INV-A-v1'],
						['B', '600.00', 'INV-B-v1'],
						['C', '400.00', 'INV-C-v1']
					]
				},
				{
					kind: 'table',
					caption: 'PIPE-01 raw payment rows. The second P2 is deliberately duplicated.',
					headers: ['Row', 'Payment ID', 'Invoice reference', 'Amount USD'],
					rows: [
						['1', 'P1', 'A', '300.00'],
						['2', 'P2', 'A', '200.00'],
						['3', 'P2', 'A', '200.00'],
						['4', 'P3', 'B', '600.00'],
						['5', 'P4', 'X', '150.00']
					]
				},
				p(
					'The raw payment rows total $1,450. The repeated P2 is the same payment ID and identical content. Under this fixture’s documented rule, keep the first occurrence and quarantine the second, preserving its row and reason. Accepted payment records total $1,250. This does not mean duplicate IDs are always harmless: if repeated IDs have conflicting content, the entire conflict requires investigation rather than arbitrarily choosing a version.',
					'Accepted payments linked to known invoices total $1,100: A has $500 and B has $600. P4 references unknown invoice X, so its $150 remains unmatched. Invoice C has no matched payment. All three invoices remain in the result. Inner-joining only records with matches would hide C, and therefore hide a $400 outstanding amount.',
					'The correct invoice balances are A $500, B $0, and C $400, for total outstanding $900. The control identities are: raw payments 1,450 = accepted 1,250 + quarantined 200; accepted 1,250 = matched 1,100 + unmatched 150; invoices 2,000 = matched 1,100 + outstanding 900. These identities are valid for this fixture’s simple payment-only settlement model. Credit notes, refunds, overpayments, and foreign exchange require additional categories and rules.'
				)
			),
			section(
				'stages',
				'Build stages that can be checked separately',
				'Each stage should preserve enough evidence to explain the next.',
				{
					kind: 'steps',
					title: 'From raw input to review',
					steps: [
						{
							title: 'Preserve',
							text: 'Keep the original records and source version. Do not overwrite the imported amount when normalizing it.'
						},
						{
							title: 'Validate',
							text: 'Check required fields, IDs, currency, cutoff, and strict amount parsing. Separate invalid rows with reasons.'
						},
						{
							title: 'Normalize',
							text: 'Convert accepted USD amounts to integer cents using the declared format; standardize agreed keys without inventing missing ones.'
						},
						{
							title: 'Reconcile',
							text: 'Aggregate accepted payments at invoice/entity/currency grain, retain all invoices, and separately retain unmatched payments.'
						},
						{
							title: 'Check',
							text: 'Reproduce counts and control identities. Halt the relevant output if an invariant fails.'
						},
						{
							title: 'Explain and review',
							text: 'Prepare a note from checked amounts and evidence. Preserve unresolved items and set awaiting_review.'
						}
					]
				},
				p(
					'Normalization must not become silent correction. Trimming agreed surrounding whitespace may be reasonable; guessing that “1O0.00” means “100.00” changes ambiguous evidence. Reject or quarantine the ambiguous value and request a verified source. A model may suggest an interpretation, but the pipeline should not quietly treat the suggestion as an accepted financial amount.',
					'The order of stages matters. If you aggregate before detecting duplicate payment IDs, the repeated P2 is hidden inside a total. If you join raw payments to invoice headers and sum the repeated headers, you multiply invoice amounts. If you drop unmatched rows before computing controls, the final table may look tidy while the input no longer reconciles.'
				)
			),
			section(
				'review-code',
				'Review a generated transformation with a concrete counterexample',
				'A program can run without doing the intended job.',
				{
					kind: 'code',
					language: 'sql',
					title: 'A plausible but wrong summary',
					code: 'SELECT SUM(i.amount) AS invoice_total,\n       SUM(p.amount) AS payment_total\nFROM invoices i\nJOIN payments p ON p.invoice_id = i.invoice_id;',
					explanation:
						'The inner join removes invoice C and unmatched payment P4. It also repeats invoice A for each matching payment row. A successful query execution does not make these totals meaningful.'
				},
				p(
					'Read this query in ordinary language: pair each invoice with every payment whose reference matches, then sum the paired rows. Before duplicate treatment, A appears three times and B once. The summed invoice headers become $3,600, while matched raw payments total $1,300. Neither result is the required control summary. Even after removing the duplicate payment, A appears twice, so summing headers still overstates invoices.',
					'A repair validates and deduplicates payment events first, groups accepted payments to invoice grain, then left-joins that summary to the complete invoice list. It separately identifies accepted payments without an invoice match. In Power Query, the equivalent idea is to validate, group payments, merge at the intended keys, and retain an unmatched query. The interface differs; the accounting reasoning is the same.',
					'Ask a coding assistant for a bounded change: “Replace the raw-payment join with a grouped accepted-payment summary; preserve invoices with no payments and report unmatched payments. Show the changed functions and tests.” This is easier to review than “build the whole finance system.” Inspect the diff—the specific changes—and rerun the meaningful fixtures. A green check from tests that merely repeat the implementation is weak evidence.'
				)
			),
			section(
				'verify',
				'Test behavior that matters to the business',
				'Tests should expose plausible mistakes.',
				p(
					'For PIPE-01, assert the $2,000 invoice total, $1,250 accepted payments, $200 quarantine, $150 unmatched payments, and $900 outstanding. Assert that C remains present. Add a malformed amount, a conflicting duplicate, and a currency mismatch. The expected behavior can be rejection or quarantine according to the contract, but it must not be silent acceptance.',
					'Also test an invariant across changed inputs. Reordering rows should not change totals under the identical-duplicate rule. Re-running the same import should not create additional accepted payment events in a persistent system. A legitimate second payment with a different ID must survive even if its amount equals P2. This catches an overly broad “remove duplicate amounts” repair.',
					'Reproducibility means another person can obtain the same declared result from the same source version, configuration, and procedure. Record the data manifest, environment or browser requirements, commands where applicable, and expected outputs. Do not embed credentials in a static site or share real client records in a public portfolio. Synthetic fixtures allow the reviewer to reproduce the reasoning without private access.',
					'A dependency is code supplied by another component or library; a package bundles reusable code and its metadata. Dependency review asks why each package is needed, which version is used, what its license permits, and whether the application actually needs its capabilities. AI-generated code can add unnecessary libraries or assume a server exists. This course’s deployed browser site is static; a durable backend, authentication, and secrets management are separate engineering work.'
				)
			),
			section(
				'practice',
				'Make one verified change',
				'Your deliverable is a working increment with an explanation.',
				{
					kind: 'lab',
					id: 'pipeline',
					title: 'Reconciliation pipeline workbench',
					task: 'Inspect the teaching cohort, choose the correct duplicate and join treatment, and run the local pipeline. Compare stage totals and exceptions. Introduce a malformed amount and explain the rejection without losing the raw record.',
					prediction:
						'What will happen to invoice C if you use an inner join? Calculate its effect before running the variant.',
					evidence: [
						'Source version and declared input grain',
						'Accepted and quarantined records with reasons',
						'Matched and unmatched payment totals',
						'Per-invoice balances and reconciled control identities'
					],
					limitation:
						'The small synthetic pipeline is a learning prototype. It does not implement a complete ledger, tax engine, multi-currency settlement system, or production access control.'
				},
				{
					kind: 'reflection',
					prompt:
						'The code assistant says the fix is complete because the app builds. What would you still require?',
					guidance: 'Distinguish software compilation from financial behavior.',
					modelAnswer:
						'I would require the PIPE-01 control totals, retained unpaid and unmatched records, duplicate and malformed-input behavior, and a review of the changed transformation. A successful build establishes that the program can be compiled, not that its accounting logic is correct.'
				}
			)
		],
		checks: [
			check(
				'M21-Q1',
				0,
				'What is the accepted payment total after the identical duplicate P2 is quarantined?',
				['USD 1,450', 'USD 1,250', 'USD 1,100'],
				1,
				[
					'This includes the repeated P2 row.',
					'1450 − 200 = 1250 accepted payments.',
					'This is the matched accepted amount, excluding unmatched P4.'
				]
			),
			check(
				'M21-Q2',
				1,
				'What is total outstanding across A, B, and C?',
				['USD 750', 'USD 900', 'USD 500'],
				1,
				[
					'This wrongly subtracts unmatched P4 from known invoices.',
					'A 500 + B 0 + C 400 = 900.',
					'This omits unpaid invoice C.'
				]
			),
			check(
				'M21-Q3',
				1,
				'Why is removing duplicate payment amounts an unsafe repair?',
				[
					'Two legitimate payments can have equal amounts',
					'Amounts are never useful in reconciliation',
					'Payment IDs cannot be validated'
				],
				0,
				[
					'Identity and source evidence matter; equality of amount alone does not establish duplication.',
					'Amounts remain important checks but are not unique identities.',
					'IDs can and should be validated under the contract.'
				]
			),
			check(
				'M21-Q4',
				0,
				'Which identity explains all accepted payments in PIPE-01?',
				[
					'1250 = 1100 matched + 150 unmatched',
					'1250 = 900 outstanding + 350 profit',
					'2000 = 1450 accepted + 550 outstanding'
				],
				0,
				[
					'It accounts for every accepted payment in the fixture.',
					'Profit is unrelated to this payment classification.',
					'1450 includes a duplicate, and the balance is wrong.'
				]
			),
			check(
				'M21-Q5',
				2,
				'A field reads “1O0.00” with the letter O. What should the pipeline do?',
				[
					'Silently convert it to 100.00',
					'Quarantine or reject it under the strict parsing contract',
					'Use zero so the pipeline can finish'
				],
				1,
				[
					'This guesses a financial value from ambiguous evidence.',
					'Preserve the raw value and request a verified correction.',
					'Zero is a real amount, not a substitute for invalid data.'
				]
			),
			check(
				'M21-Q6',
				2,
				'Which test most directly catches the inner-join omission?',
				[
					'The page has a green button',
					'Invoice C remains present with USD 400 outstanding',
					'The query returns at least one row'
				],
				1,
				[
					'Appearance does not verify financial behavior.',
					'The assertion tests the exact missing-record failure.',
					'A nonempty result can still omit important records.'
				]
			)
		],
		assignment: {
			title: 'A reproducible pipeline increment',
			scenario:
				'Use PIPE-01. A generated implementation joins raw payments to invoices and reports only matched records. Your task is to correct the behavior using the browser workbench or a supplied starter, then explain the change.',
			tasks: [
				'State the grain, units, cutoff, and duplicate policy.',
				'Produce accepted, quarantined, matched, unmatched, and outstanding totals.',
				'Explain the raw-join defect with invoice A and the omission with C.',
				'Add a malformed-value case and an equal-amount/different-ID case.'
			],
			deliverable:
				'A saved result table, control summary, and a concise change note with test evidence.',
			rubric: [
				{ criterion: 'Financial correctness', evidence: 'All three control identities reconcile.' },
				{ criterion: 'Completeness', evidence: 'C and P4 remain visible in appropriate outputs.' },
				{
					criterion: 'Reviewability',
					evidence: 'The change explanation identifies the mechanism and meaningful tests.'
				}
			],
			workedSolution: [
				'Invoice grain is one invoice; payment grain is one event. All values are USD at September 30, 2026. Preserve raw rows, accept the first identical P2, and quarantine the second with its source-row reference.',
				'Invoices total USD 2,000; raw payments 1,450; quarantine 200; accepted 1,250; matched 1,100; unmatched 150; outstanding 900. Per invoice: A 500, B 0, C 400.',
				'The raw join repeats A for multiple payment rows and an inner join drops C and P4. Validate and aggregate accepted payments before a left join to invoices, while retaining a separate unmatched-payment output.',
				'Reject or quarantine “1O0.00” rather than guessing. A new payment ID with the same amount is not automatically a duplicate. Document expected outcomes and rerun the control fixture.'
			]
		},
		interview: {
			question:
				'You used AI to write a reconciliation pipeline. How do you demonstrate that you understand and trust the result?',
			strongAnswer: [
				'I would explain the input grain, cutoff, keys, money representation, and duplicate policy, then trace a small case through validation, aggregation, matching, and exception reporting. I would show source-to-output control totals and retain unpaid and unmatched records.',
				'I would review the code changes and tests that expose join multiplication, duplicate ingestion, malformed amounts, and ambiguous inputs. AI assistance is part of the development process; the evidence for correctness is the reproducible behavior and review.'
			],
			followUps: [
				{
					question: 'What if all totals agree?',
					answer:
						'Agreement is necessary but not sufficient. Offsetting errors can preserve a total, so I also check record identity, classification, missing records, and source links.'
				},
				{
					question: 'What would change for multiple currencies?',
					answer:
						'I would preserve currency at every grain, prohibit unconverted sums, define exchange-rate sources and dates, and add precision/rounding and translation controls. The single-currency fixture does not establish that capability.'
				}
			]
		},
		sources: [
			{
				label: 'Microsoft: Power Query merge queries',
				url: 'https://learn.microsoft.com/en-us/power-query/merge-queries-overview',
				note: 'Join behavior and interface reference; PIPE-01 and its controls are original teaching material.'
			},
			{
				label: 'Microsoft: Power BI star schema',
				url: 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema',
				note: 'Fact/dimension and grain reference for the analytics extension.'
			}
		]
	},
	{
		id: 'M22',
		day: 5,
		title: 'Evaluation, monitoring, and release decisions',
		subtitle: 'Define success before deciding whether the system is good enough.',
		minutes: 60,
		prerequisites: ['M05', 'M16', 'M19', 'M21'],
		objectives: [
			'Design cases, trials, and graders for distinct financial and system outcomes.',
			'Interpret small-sample results and repeated-run variability without overstating reliability.',
			'Define a release decision and monitoring response tied to meaningful failures.'
		],
		why: 'A convincing demonstration is one observation. A defensible release decision needs representative cases, explicit criteria, preserved failures, and a plan for changed conditions.',
		sections: [
			section(
				'units',
				'Know what you are counting',
				'A case, a trial, and a grader answer different questions.',
				p(
					'A case specifies a task and its starting conditions: records, user scope, policy version, expected evidence, and acceptable outcomes. A trial is one execution of that case under a recorded configuration. A grader applies criteria to the output or resulting state. These distinctions matter when a generative system can behave differently across runs.',
					'For CASE-A, a trial might calculate $500 outstanding, cite the partial-payment policy, draft a note, and leave status awaiting_review. A numerical grader checks the amount. An evidence grader checks that claims follow the supplied sources. A state grader checks the review status and absence of unauthorized effects. A final text that passes one grader may fail another.',
					'A trace records observable requests, results, and state transitions. It helps diagnose a failure but is not itself a pass criterion. Ten elegant tool calls do not establish that the task was completed. An outcome is the resulting business-relevant condition: for this prototype, a correct, evidence-linked review draft with unresolved items preserved. Production outcomes would require additional organizational measures.'
				),
				{
					kind: 'table',
					caption: 'Separate criteria for the same case',
					headers: ['Dimension', 'Pass evidence', 'Possible hidden failure'],
					rows: [
						[
							'Amounts',
							'Outstanding equals checked calculation',
							'Correct-looking number from wrong source'
						],
						[
							'Support',
							'Each claim follows an applicable source',
							'Real citation does not support the claim'
						],
						[
							'Completeness',
							'Partial/unmatched items retained',
							'Tidy note silently omits an exception'
						],
						[
							'State',
							'Awaiting review; no unauthorized transition',
							'Correct note paired with approved status'
						],
						['Recovery', 'One logical draft after retry', 'Duplicate tasks created after timeout']
					]
				}
			),
			section(
				'suite',
				'Build a suite from failure mechanisms',
				'A useful set includes more than ordinary success cases.',
				p(
					'Start from the contract and ask how each assumption can fail. PIPE-01 covers partial payment, an identical duplicate, an unpaid invoice, and an unmatched payment. Add conflicting duplicate content, a malformed amount, a currency mismatch, a missing policy, a superseded policy, hostile source text, and a lost tool response. Some cases should end in an explicit unresolved state. Otherwise the suite rewards finishing at any cost.',
					'Distinguish development cases from final cases. During development you inspect failures and change the system; these cases are valuable regression checks. Final cases should be new enough to test transfer after configuration is frozen. Once final cases are revealed and used to repair the system, they join the development suite. A second run on the same revealed cases is not fresh independent evidence.',
					'Representativeness concerns the deployment population. A suite with eight hostile documents and two normal invoices is useful for boundary testing, but its overall pass rate does not estimate the failure rate of a real invoice stream unless the mixture reflects that stream. Report targeted categories and intended scope. A small teaching suite can establish that a particular defect exists or that a fixture passes; it cannot certify broad production reliability.'
				),
				{
					kind: 'worked',
					title: 'A pass rate that hides a release blocker',
					problem:
						'Ten cases produce nine acceptable final notes. The remaining case exposes an unauthorized entity record. All arithmetic checks pass.',
					steps: [
						'The note-level pass count is 9/10, but the authority-boundary count includes a critical failure.',
						'Arithmetic correctness does not compensate for unauthorized access.',
						'Inspect whether the access check is missing, misplaced, or using model-supplied identity.',
						'Repair the enforcement point and add a regression case.',
						'Retain the failure in the report rather than averaging it away.'
					],
					conclusion:
						'Release criteria can include mandatory boundaries as well as aggregate quality measures. Define them before seeing the scores.'
				}
			),
			section(
				'graders',
				'Match the grader to the claim',
				'Different evidence needs different review methods.',
				p(
					'Deterministic graders are appropriate for exact amounts, required IDs, schema validity, allowed states, and invariants. They can be wrong if their expected answer is wrong or their logic is too narrow. A grader that accepts only one sentence may fail an equally correct paraphrase. A grader that merely checks for the word “source” can pass an invented citation.',
					'A human rubric is useful for evidential support, clarity, appropriate uncertainty, and the quality of a proposed next investigation. Define the rubric with examples of weak, competent, and strong answers. Review disagreements: they may expose ambiguity in the task, missing evidence, or inconsistent criteria. Self-assessment is helpful for learning, but it remains self-assessment.',
					'A model grader can assist with scale, but its judgments need calibration against reviewed examples. It may prefer fluent wording, share the generator’s misconceptions, or be influenced by irrelevant text. Check false passes and false failures. Do not quietly present model judgment as objective certification. For critical numerical or permission conditions, use enforceable checks and inspected records where possible.',
					'A false pass means a bad result is accepted. A false failure means a good result is rejected. Both matter: false passes create risk, while false failures can increase review burden or block useful work. Improve the grader with examples that isolate the distinction rather than simply making it stricter.'
				)
			),
			section(
				'variability',
				'Repeated trials reveal another kind of uncertainty',
				'Case coverage and run-to-run consistency are separate.',
				{
					kind: 'table',
					caption:
						'Authored evaluation exercise: four cases, three trials each. 1 = passes all declared criteria.',
					headers: ['Case', 'Trial 1', 'Trial 2', 'Trial 3', 'What to inspect'],
					rows: [
						['Ordinary partial payment', '1', '1', '1', 'Stable on this case'],
						['Missing policy', '1', '0', '1', 'Sometimes invents a rule'],
						['Conflicting duplicate', '0', '0', '0', 'Systematic treatment defect'],
						['Hostile source', '1', '1', '0', 'Intermittent boundary-related behavior']
					]
				},
				p(
					'These authored results contain seven passing trials out of twelve, or 58.3%. Only one of four cases passes all three trials. Neither measure is universally “the accuracy”: they answer different questions. Trial pass rate counts executions; all-trials-per-case success highlights consistency on each case. State which measure you use and why it matters.',
					'Do not assume trials are independent or that this small table estimates a precise real-world probability. The same model and evidence can produce correlated failures. Repeating one easy case a thousand times does not cover a missing failure category. Conversely, one run per case may miss instability that matters in repeated operations.',
					'When comparing versions, preserve the case mix, grader version, and execution conditions. Record actual failures and latency as well as averages. A median can hide a long tail of very slow cases; a mean can be dominated by a few incidents. Choose summaries that help the operational decision, and keep the raw case-level evidence available.'
				)
			),
			section(
				'monitor',
				'After release, watch assumptions as well as outputs',
				'Monitoring asks whether the environment has changed.',
				p(
					'Data drift means an input distribution changes: new invoice layouts, different customer mix, altered payment terms, or more missing references. Performance drift means task outcomes deteriorate. Input drift is a warning, not proof that performance fell; performance can also worsen without an obvious shift in a monitored input. Tie alerts to an investigation plan.',
					'For Willow, monitor rejected-row counts, unmatched payment amounts, missing-policy cases, unsupported-claim review findings, draft duplication, and reviewer correction time. A sudden rise in malformed amounts may indicate an export-format change rather than a model problem. A rise in unsupported explanations with stable inputs may point to a changed prompt or model configuration.',
					'Define an owner and response for each meaningful alert. For example: if the control identity fails, stop producing reconciled totals for that batch and preserve the raw input; if the policy source is unavailable, produce an unresolved evidence state; if an unauthorized access attempt succeeds, suspend the affected capability and investigate. Thresholds should reflect the business context and evidence, not arbitrary red and green colors.',
					'A release note should state what was evaluated, known limitations, configuration, data versions, owners, and rollback or fallback behavior. A fallback might be the existing manual process or a simpler deterministic workflow. It should not be an invisible fabricated answer when a live model fails.'
				)
			),
			section(
				'practice',
				'Make a release decision from evidence',
				'A decision can be “limited pilot with conditions.”',
				{
					kind: 'lab',
					id: 'evaluation',
					title: 'Evaluation and release desk',
					task: 'Score the supplied cases by amount, support, state, and recovery. Inspect a false-pass example and a repeated-trial table. Write release criteria before revealing a changed-case result.',
					prediction:
						'Could a higher average score still justify rejecting a release? Name a concrete condition.',
					evidence: [
						'Case and grader versions',
						'Per-dimension results and actual failures',
						'Trial counts and configuration',
						'Release decision, remaining limitations, and owner response'
					],
					limitation:
						'The authored suite is a teaching exercise. It does not validate a production model, certify reliability, or replace a practitioner/learner pilot.'
				},
				{
					kind: 'reflection',
					prompt: 'The developer reports 100% on six cases. What would you ask next?',
					guidance: 'Ask about scope and evidence without assuming the developer is wrong.',
					modelAnswer:
						'I would ask which cases and failure categories were included, whether they influenced development, how many trials ran, what graders checked, and whether resulting state was inspected. I would then ask for fresh cases and the known limitations. Six passing cases are useful evidence within their scope, not a universal guarantee.'
				}
			)
		],
		checks: [
			check(
				'M22-Q1',
				0,
				'What is a trial?',
				[
					'One execution of a defined case under a configuration',
					'The entire collection of test cases',
					'The rule that scores an answer'
				],
				0,
				['A case can have multiple trials.', 'That is an evaluation suite.', 'That is a grader.']
			),
			check(
				'M22-Q2',
				1,
				'The authored table has seven passes in twelve trials. What may you report?',
				[
					'58.3% of those specified trials passed the declared criteria',
					'The production system is exactly 58.3% reliable',
					'Two thirds of all possible finance tasks are solved'
				],
				0,
				[
					'This states the observed count and scope.',
					'The sample, dependence, and representativeness do not support that precision.',
					'The suite does not cover all finance tasks.'
				]
			),
			check(
				'M22-Q3',
				0,
				'A keyword grader accepts “source: invented-report.” What is the issue?',
				[
					'A false pass caused by an inadequate evidence check',
					'A false failure',
					'Proof that source checking is impossible'
				],
				0,
				[
					'The grader accepts an unsupported result.',
					'A false failure would reject a good result.',
					'Identifier and claim-support checks can improve the grader.'
				]
			),
			check(
				'M22-Q4',
				2,
				'Nine notes pass, but one unauthorized record is exposed. What should happen?',
				[
					'Release because the average exceeds 80%',
					'Treat the authority failure under the predefined blocking criterion',
					'Ignore it if arithmetic is correct'
				],
				1,
				[
					'An aggregate threshold should not hide a critical boundary failure.',
					'Repair the enforcement point and reevaluate relevant cases.',
					'Financial accuracy does not authorize access.'
				]
			),
			check(
				'M22-Q5',
				1,
				'Why repeat trials on a generative case?',
				[
					'To reveal possible run-to-run inconsistency',
					'To turn development cases into independent test cases',
					'To guarantee all future outcomes'
				],
				0,
				[
					'Repeated trials can expose intermittent failures.',
					'Repeated use does not restore independence.',
					'Finite observations cannot guarantee all future behavior.'
				]
			),
			check(
				'M22-Q6',
				2,
				'Rejected amount strings jump after an export change. What is the first useful investigation?',
				[
					'Retrain the LLM immediately',
					'Inspect schema/format changes and strict parsing failures',
					'Suppress the alert so users can continue'
				],
				1,
				[
					'The evidence points first to the input pipeline.',
					'Inspect the changed data contract and preserve raw records.',
					'Suppressing evidence can conceal incorrect amounts.'
				]
			)
		],
		assignment: {
			title: 'An evaluation report with an honest release claim',
			scenario:
				'Evaluate the PIPE-01 prototype plus missing-policy, conflicting-duplicate, hostile-source, and lost-response cases. Use deterministic local results and clearly labeled authored outputs where no model is connected.',
			tasks: [
				'Specify cases, criteria, and the difference between output and resulting state.',
				'Calculate the trial pass rate and all-trials-per-case result from the table.',
				'Identify one false-pass risk and one blocking failure category.',
				'Recommend release, limited pilot, or further development with monitoring and fallback.'
			],
			deliverable: 'A short evaluation report with a case matrix and explicit scope statement.',
			rubric: [
				{ criterion: 'Measurement', evidence: 'Counts and denominators are correct and defined.' },
				{
					criterion: 'Evidence',
					evidence: 'Preserves failures and distinguishes authored fixtures from actual executions.'
				},
				{
					criterion: 'Decision',
					evidence: 'Links criteria, limitations, monitoring, and fallback to the recommendation.'
				}
			],
			workedSolution: [
				'The table has 7/12 passing trials and 1/4 cases passing all three trials. These are exercise results, not production probability estimates. Record the criteria and configuration.',
				'Check amounts and control identities deterministically; inspect source support and unresolved items with a rubric; inspect review state and duplicate drafts directly. A correct final sentence does not excuse an unauthorized transition.',
				'A keyword-only source grader can falsely accept invented evidence. Unauthorized access or an incorrect financial control identity should block the relevant capability under the declared release criteria.',
				'A reasonable recommendation is further development for the systematic conflicting-duplicate defect, followed by a bounded synthetic pilot after repair. Monitor input rejection, unmatched amounts, support failures, and duplicate state. Retain the manual review process as fallback.'
			]
		},
		interview: {
			question: 'How would you evaluate an AI finance assistant before release?',
			strongAnswer: [
				'I would define representative and targeted failure cases, separate development from final evidence, and grade amounts, support, completeness, state, and boundary behavior separately. I would inspect actual tool results and resulting records, not only the final message.',
				'For variable generation I would run repeated trials and report the case mix, denominators, failures, and limitations. Release criteria would include mandatory controls as well as quality and review-effort targets, with monitoring owners and a fallback process.'
			],
			followUps: [
				{
					question: 'Would you use an LLM as the grader?',
					answer:
						'Possibly for rubric-based judgments after calibration against reviewed examples. I would examine false passes and failures and keep deterministic checks for exact amounts, identifiers, and allowed states.'
				},
				{
					question: 'What if performance falls after release?',
					answer:
						'I would compare input, configuration, policy, and outcome changes, locate the failing stage, and use the predefined containment/fallback process. Retraining is only one possible response.'
				}
			]
		},
		sources: [
			{
				label: 'Anthropic: Demystifying evals for AI agents',
				url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents',
				note: 'Terminology and evaluation distinctions; the numerical suite is original and explicitly authored.'
			},
			{
				label: 'scikit-learn: Common pitfalls',
				url: 'https://scikit-learn.org/stable/common_pitfalls.html',
				note: 'Independent evaluation and leakage principles also apply to selected system configurations.'
			}
		]
	},
	{
		id: 'M23',
		day: 5,
		title: 'Integrate the finance assistant capstone',
		subtitle: 'Build one small system whose result you can defend.',
		minutes: 80,
		prerequisites: ['M22'],
		objectives: [
			'Connect validated records, exact calculation, applicable evidence, and reviewer output.',
			'Produce a reproducible case trace and inspectable review state.',
			'Justify a bounded architecture and its limitations using previous artifacts.'
		],
		why: 'A portfolio becomes persuasive when the viewer can run a case, inspect the evidence, and understand why the system made each permitted transition.',
		sections: [
			section(
				'scope',
				'A capstone should integrate what you have learned',
				'The core project is deliberately bounded and complete.',
				p(
					'Your task is an exception-investigation assistant for fictional Willow. It reads synthetic approved invoice and payment records, validates them, calculates balances, retrieves an applicable procedure, prepares an evidence-linked note, and places that note in a local review queue. It does not post journals, release payments, decide tax treatment, or certify that a transaction is legitimate.',
					'Those boundaries make a complete learning project possible. Completeness means the specified inputs, outputs, failures, and review path work end to end. It does not mean including every finance function. You already have the data contract from day one, the analytical checks from day two, evidence discipline from day three, and tool/harness design from day four. Reuse and refine them.',
					'Choose a fixed workflow or a bounded investigative design and state why. The core can use deterministic local components and explicitly authored draft templates. That is a valid system prototype, but describe it accurately. If an optional real model produces the note, record the model/configuration and actual output; never replace a failed call with a canned answer while presenting it as live generation.'
				),
				{
					kind: 'callout',
					tone: 'mechanism',
					title: 'The minimum artifact',
					paragraphs: [
						'A reader should be able to load the synthetic case, run the pipeline, inspect a source-linked result, see the correct review state, and reproduce at least one failure. A screenshot alone does not provide that evidence. A working narrow prototype is more useful than an architecture diagram promising a large unfinished system.'
					]
				}
			),
			section(
				'architecture',
				'Give each component one clear responsibility',
				'Draw the boundaries before connecting them.',
				{
					kind: 'steps',
					title: 'The capstone path',
					steps: [
						{
							title: 'Input contract',
							text: 'Accept case ID, entity, currency, cutoff, and versioned source references.'
						},
						{
							title: 'Validation and reconciliation',
							text: 'Preserve raw rows, quarantine invalid/duplicate records, compute exact accepted totals, and retain exceptions.'
						},
						{
							title: 'Evidence retrieval',
							text: 'Select the authorized procedure applicable to the case date and task scope.'
						},
						{
							title: 'Draft preparation',
							text: 'Use checked amounts and retrieved evidence to produce observations, unknowns, and next steps.'
						},
						{
							title: 'Output validation',
							text: 'Verify amounts, existing source IDs, supported claims, and allowed review status.'
						},
						{
							title: 'Queue and trace',
							text: 'Store one logical reviewer draft with case identity, source versions, and execution evidence.'
						}
					]
				},
				p(
					'The draft component should not recalculate balances from unvalidated raw strings. Give it the checked result plus the source references. This reduces disagreement between the numerical core and the narrative. The output checker still verifies that the note did not alter a number or infer an unsupported cause.',
					'The review queue is a collection of tasks awaiting human judgment. A queue entry is not an accounting entry. Give it a stable identity and a status such as awaiting_review, needs_evidence, or reviewed. For the teaching prototype, reviewed may be a local learner action; it is not a real company approval. Label the boundary in the interface and export.',
					'A static browser application can run local calculations and save progress on the device. It cannot secretly protect a server credential embedded in its code, provide production identity controls, or guarantee durable multi-user storage. The architecture diagram should distinguish the working local prototype from the services a production implementation would require.'
				)
			),
			section(
				'worked-case',
				'Run invoice A from beginning to end',
				'Every sentence in the note should have a place in the trace.',
				{
					kind: 'table',
					caption: 'CAP-A evidence packet. All records are fictional and use USD.',
					headers: ['Evidence ID', 'Content', 'What it establishes'],
					rows: [
						['INV-A-v1', 'Invoice A total 1,000.00', 'The stated invoice amount'],
						[
							'PAY-09-v1',
							'P1 300.00; P2 200.00; repeated P2 quarantined',
							'Accepted matched payments total 500.00'
						],
						[
							'CALC-A-01',
							'1000.00 − 500.00 = 500.00',
							'Outstanding amount under the fixture rules'
						],
						[
							'PARTIAL-02',
							'Unexplained partial settlements require reviewer investigation; effective July 1, 2026',
							'The required review route'
						],
						['CASE-A-state', 'No verified reason for partial payment', 'Cause remains unresolved']
					]
				},
				{
					kind: 'worked',
					title: 'An evidence-linked reviewer note',
					problem:
						'Prepare the September invoice-A note without inventing why the customer paid only part.',
					steps: [
						'State the verified amount: invoice A is 1000.00 and accepted payments are 500.00, leaving 500.00 outstanding.',
						'Identify the duplicate handling: the repeated P2 record is quarantined and does not create an additional accepted payment.',
						'Apply PARTIAL-02 to route the unexplained partial settlement for review.',
						'State the unknown: the supplied records do not establish whether the difference is disputed, a timing issue, a credit note, or missing payment evidence.',
						'Request the relevant remittance advice or correspondence and retain awaiting_review/needs_evidence status.'
					],
					conclusion:
						'Draft: “Invoice A has USD 500.00 outstanding as of the supplied cutoff (INV-A-v1, PAY-09-v1, CALC-A-01). The repeated P2 row was quarantined. Under PARTIAL-02, the unexplained partial settlement requires review. Obtain remittance or dispute evidence before assigning a cause. No posting or payment has been performed.”'
				}
			),
			section(
				'connect',
				'Connect components through explicit data',
				'An interface keeps assumptions from becoming hidden.',
				p(
					'An interface is the agreed shape of data passed between components. The reconciliation result might contain caseId, currency, invoiceMinor, acceptedPaymentMinor, outstandingMinor, sourceIds, and exceptions. The draft stage consumes that result instead of searching an unrelated table. The output checker compares the note’s monetary fields with the same result.',
					'When one stage fails, later stages should know which information is unavailable. If the invoice lookup is missing, do not continue with an empty object and zero amount. If the policy is missing, the system can still report verified balances but must label the procedural interpretation unresolved. Partial completion should be explicit and useful.',
					'Use stable IDs to connect the trace. CALC-A-01 should point to its input versions; the draft should point to CALC-A-01; the review task should point to the draft and case. This lineage lets a reviewer ask, “Where did this $500 come from?” and reach the records rather than a chain of unsupported model statements.',
					'Keep business fields separate from display text. An amount stored as integer cents is easier to validate than parsing “approximately five hundred dollars” from a paragraph. A human-readable explanation remains valuable, but the system should not depend on extracting critical state from decorative prose.'
				)
			),
			section(
				'acceptance',
				'Define acceptance before improving appearance',
				'A beautiful prototype still needs observable behavior.',
				p(
					'For CAP-A, acceptance requires correct amounts, preserved duplicate evidence, the applicable procedure, an honest unknown-cause statement, and the intended review state. For the full cohort, retain invoice C and unmatched payment P4. A note that explains A perfectly while silently omitting C is incomplete for the batch task.',
					'Test at least one normal run, one missing-evidence run, one malformed input, and one repeated operation. Record the actual results. If you change the configuration after a failure, show the before/after evidence and keep the original failure in the report. Do not turn a debugging history into a claim that the first version was flawless.',
					'Prepare a compact architecture diagram and a one-page run guide. The guide should state the synthetic data, input contract, steps to reproduce, expected outputs, known limitations, and how to reset the local exercise. If optional code requires a runtime, name it explicitly. The browser path remains sufficient for the core learner to demonstrate the pipeline reasoning.',
					'Your portfolio description should say what you built and verified. For example: “A local synthetic reconciliation prototype with exact-money calculations, versioned policy evidence, and a reviewer queue; tested duplicate, partial, unmatched, and missing-evidence cases.” Avoid claiming production deployment, live autonomous operation, or audited reliability if you have not implemented and evaluated those capabilities.'
				)
			),
			section(
				'practice',
				'Build, inspect, explain',
				'The artifact and its defense belong together.',
				{
					kind: 'lab',
					id: 'capstone',
					title: 'Willow finance assistant workbench',
					task: 'Run the approved synthetic case through reconciliation, evidence selection, draft preparation, and review. Inspect the trace and export or record the evidence. Then remove a required source and explain the changed result.',
					prediction:
						'Which parts of the output remain valid if the policy is unavailable but the invoice and payment records are intact?',
					evidence: [
						'The source and configuration versions',
						'Exact control totals and exception rows',
						'Applicable evidence or an explicit gap',
						'One reviewer draft with correct state and no unsupported causal claim'
					],
					limitation:
						'This is a local learning prototype with synthetic records. Authored draft templates are labeled; they do not imply live LLM generation or production integration.'
				},
				{
					kind: 'reflection',
					prompt: 'How would you explain this project to a controller in ninety seconds?',
					guidance: 'Lead with the decision, then the evidence and boundaries.',
					modelAnswer:
						'The prototype helps reviewers investigate reconciliation exceptions. It validates synthetic invoice/payment records, computes traceable balances, selects an applicable procedure, and prepares a source-linked note. It preserves duplicate and unmatched records and cannot post or pay. I can demonstrate a normal case and a missing-evidence case, with the exact calculations and review state visible.'
				}
			)
		],
		checks: [
			check(
				'M23-Q1',
				0,
				'What should the drafting component receive for critical amounts?',
				[
					'Only the unvalidated raw CSV text',
					'Checked structured calculation results with source references',
					'A screenshot of an attractive chart'
				],
				1,
				[
					'This invites a second inconsistent interpretation of raw amounts.',
					'The deterministic core and narrative should share the same evidence.',
					'A chart image is not the strongest computational interface.'
				]
			),
			check(
				'M23-Q2',
				1,
				'PARTIAL-02 is unavailable but invoice/payment records are valid. What can the system still state?',
				[
					'The verified outstanding amount, while policy interpretation remains unresolved',
					'That the partial payment is approved',
					'That all results must be replaced with zero'
				],
				0,
				[
					'Partial completion can be explicit and useful.',
					'No applicable procedure or approval is established.',
					'Missing policy evidence does not erase valid arithmetic.'
				]
			),
			check(
				'M23-Q3',
				1,
				'What does a local review-queue entry establish?',
				[
					'A task has been prepared for review',
					'A journal has been posted',
					'The customer’s bank transfer succeeded'
				],
				0,
				[
					'Queue state is a workflow artifact under the prototype’s contract.',
					'A reviewer draft is not a ledger posting.',
					'No bank execution is implied.'
				]
			),
			check(
				'M23-Q4',
				2,
				'Which portfolio claim fits the core prototype?',
				[
					'Production-ready autonomous accountant',
					'A synthetic reconciliation prototype with tested records and explicit limits',
					'A certified finance AI system'
				],
				1,
				[
					'The core does not establish production readiness or broad autonomy.',
					'This states the implemented scope and evidence accurately.',
					'No certification has been performed.'
				]
			),
			check(
				'M23-Q5',
				0,
				'Why preserve CALC-A-01 with its input references?',
				[
					'To make the trace longer',
					'So the reviewer can reproduce the amount from the exact source versions',
					'To prove the customer’s reason for paying partially'
				],
				1,
				[
					'Length is incidental; lineage is the purpose.',
					'This provides traceable evidence for the number.',
					'Calculation does not establish the operational cause.'
				]
			),
			check(
				'M23-Q6',
				2,
				'The browser uses an authored note template. What should it say?',
				[
					'“Live LLM answer”',
					'“Authored/local template using checked results”',
					'Nothing about provenance'
				],
				1,
				[
					'That would misrepresent the execution.',
					'This accurately identifies the mechanism.',
					'Hiding provenance encourages false conclusions about capability.'
				]
			)
		],
		assignment: {
			title: 'A runnable, defensible finance prototype',
			scenario:
				'Integrate the PIPE-01 cohort and CAP-A evidence into a local review workflow. The minimum outcome is a reproducible draft with correct amounts, sources, exceptions, and review state.',
			tasks: [
				'Choose and justify the architecture.',
				'Run CAP-A and preserve its complete trace.',
				'Demonstrate missing-policy and malformed-input behavior.',
				'Prepare a run guide, architecture explanation, and evaluation summary.'
			],
			deliverable:
				'The working browser result or local starter output plus a concise portfolio pack.',
			rubric: [
				{
					criterion: 'End-to-end behavior',
					evidence: 'Records become a checked, evidence-linked review draft.'
				},
				{
					criterion: 'Traceability',
					evidence: 'Amounts, sources, configuration, and state are inspectable.'
				},
				{
					criterion: 'Honest scope',
					evidence: 'Authored templates, optional model use, and production gaps are stated.'
				}
			],
			workedSolution: [
				'A fixed workflow is sufficient for the defined core sequence. A bounded investigative branch is optional if it has a clear evaluated purpose. Keep validation and exact calculation deterministic.',
				'CAP-A reports USD 500 outstanding, duplicate P2 quarantine, PARTIAL-02 review routing, and an unresolved cause. The state is awaiting_review or needs_evidence, never paid or posted.',
				'Without PARTIAL-02, preserve valid balances and state that procedure evidence is missing. A malformed amount is rejected/quarantined with the raw value retained; it does not become zero.',
				'The portfolio pack identifies synthetic data and versions, explains the interfaces, includes normal and failure traces, and reports evaluation scope. Optional live model outputs must be distinguished from the authored core.'
			]
		},
		interview: {
			question: 'Walk me through your capstone without starting with the model brand.',
			strongAnswer: [
				'The user is a finance reviewer investigating payment differences. My input contract defines source grain, currency, cutoff, and duplicate treatment. A deterministic pipeline validates records and computes balances, retrieval supplies the applicable procedure, and the draft stage prepares a source-linked note for review.',
				'I can reproduce invoice A’s USD 500 balance, show the quarantined duplicate, and demonstrate what happens when policy evidence is missing. The prototype uses synthetic data and has no posting or payment capability. Its tests inspect both the final note and resulting review state.'
			],
			followUps: [
				{
					question: 'Where does AI add value?',
					answer:
						'It can assist code development, interpret irregular descriptions, or draft explanations from checked evidence. I would compare that contribution with a deterministic template and include review/correction effort before claiming value.'
				},
				{
					question: 'What is the first production gap you would address?',
					answer:
						'It depends on the deployment, but trusted identity, approved data access, durable state, operational monitoring, and organizational review responsibilities are separate requirements. I would not treat the local prototype as already satisfying them.'
				}
			]
		},
		sources: [
			{
				label: 'MCP tools specification',
				url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools',
				note: 'Interface reference for an optional integration extension; the core is local.'
			},
			{
				label: 'Microsoft: Power BI star schema',
				url: 'https://learn.microsoft.com/en-us/power-bi/guidance/star-schema',
				note: 'Analytical grain reference; the capstone dataset and workflow are original.'
			}
		]
	},
	{
		id: 'M24',
		day: 5,
		title: 'Unseen cases and incident investigation',
		subtitle: 'Find the failed assumption, repair it, and preserve the evidence.',
		minutes: 80,
		prerequisites: ['M23'],
		objectives: [
			'Commit a configuration before inspecting final-case outcomes.',
			'Diagnose failures from records, tool results, and state rather than final prose alone.',
			'Write a corrective action, regression case, and monitoring/rollback plan with justified limits.'
		],
		why: 'Professional competence shows when the case changes. A system worth presenting should reveal its failures clearly enough that you can investigate and improve it.',
		sections: [
			section(
				'commit',
				'Freeze the proposal before revealing the next cases',
				'A final check is valuable because it can surprise you.',
				p(
					'Record the current data contract, procedure version, prompt or template, tool configuration, and expected behavior. State which outcomes would block release and which would trigger review. Then inspect the new-case material in the workbench. The commitment is an instructional discipline, not secure exam proctoring: a static website cannot hide its client-side assets from a determined reader.',
					'A new case should change a meaningful condition. A fresh invoice number alone is a weak transfer test. A conflicting duplicate, different currency, missing policy, or unknown tool result challenges an assumption. Explain your expected behavior before running it. A correct rejection or escalation can count as success when the contract requires it.',
					'After revealing final cases, use them to learn and repair the system. Keep the original result separately from the corrected run. The revealed cases are now development/regression evidence. A later claim of independent improvement needs another fresh assessment. This is the same idea you applied to model selection, forecasting, and prompt tuning earlier in the course.'
				),
				{
					kind: 'reflection',
					prompt:
						'What would make you change your release recommendation before seeing the final cases?',
					guidance: 'Name an observable condition, not a general feeling of confidence.',
					modelAnswer:
						'I would block the affected capability for incorrect control totals, unauthorized access, or duplicated consequential effects. I would route a missing policy to an explicit unresolved state. I would record thresholds and scope before observing the results so I cannot quietly redefine success afterward.'
				}
			),
			section(
				'incident-one',
				'Investigate a conflicting duplicate',
				'A familiar ID can conceal unfamiliar content.',
				{
					kind: 'table',
					caption: 'Authored incident exhibit INC-01, revealed for the worked investigation.',
					headers: ['Row', 'Payment ID', 'Invoice', 'Amount USD', 'Source timestamp'],
					rows: [
						['1', 'P2', 'A', '200.00', '09:00'],
						['2', 'P2', 'A', '250.00', '09:03']
					]
				},
				p(
					'The earlier fixture contained an identical duplicate. This one does not. A rule that simply keeps the first row reports $200, while a rule that keeps the latest reports $250. Neither timestamp alone establishes whether the second row is a correction, a corrupt export, or a different event incorrectly sharing an ID. The source contract has been violated.',
					'Separate the observation from the cause: two rows share identity P2 and disagree on amount. The immediate action is to quarantine or hold the conflict according to a documented policy and prevent an unsupported final balance. Preserve both rows and their provenance. Ask the source owner for the authoritative event or correction mechanism. Do not rewrite the historical raw record.',
					'A failed assumption is that equal payment IDs imply identical duplicate content. The repair compares the full relevant event fields, distinguishes identical duplicates from conflicts, and records a specific conflict reason. A regression case should assert that the conflict cannot silently enter accepted totals. This is more precise than adding “be careful with duplicates” to a prompt.'
				),
				{
					kind: 'worked',
					title: 'Write the incident finding',
					problem:
						'The old pipeline accepted the first P2 and produced a confident balance without mentioning the second amount.',
					steps: [
						'Impact: the reported balance depends on an unresolved source conflict and may be misstated.',
						'Evidence: P2 appears at 200 and 250 with different timestamps; no correction authority is supplied.',
						'Failed assumption: duplicate ID was treated as proof of duplicate content.',
						'Containment: mark the case needs_evidence and prevent its amount from being represented as fully reconciled.',
						'Correction: detect conflicting fields, preserve both records, and request an authoritative resolution.',
						'Verification: a regression fixture confirms explicit conflict output and no silent acceptance.'
					],
					conclusion:
						'The incident report identifies a concrete mechanism and repair. It does not speculate about who caused the source conflict.'
				}
			),
			section(
				'incident-two',
				'Investigate the correct note with the wrong state',
				'Read the system outcome as carefully as the answer.',
				{
					kind: 'table',
					caption: 'Authored incident exhibit INC-02: a lost response and a duplicate draft.',
					headers: ['Time', 'Observed event', 'Result'],
					rows: [
						['10:00', 'Draft request D8 sent for CASE-A', 'Response lost'],
						['10:01', 'Application starts a new request D9', 'Draft Q32 created'],
						['10:02', 'Queue inspection', 'Q31 from D8 and Q32 from D9 both exist'],
						['10:03', 'Final note', '“One draft prepared for review.”']
					]
				},
				p(
					'The final sentence is false even if both draft bodies contain the correct amount. The process created two review tasks. The failed assumption is that no response meant no effect. A fresh request identity created a second logical operation rather than retrying or reconciling the first.',
					'Containment should preserve both records and prevent conflicting reviewer work. The appropriate correction depends on the queue’s controls: an authorized reviewer may mark one task superseded with a link to the retained task, rather than deleting history. The learning prototype can model that status; a production system needs its own approved correction process.',
					'Repair the request/state boundary. Persist D8 before dispatch, query its status after an uncertain result, and follow the queue’s idempotency contract. Add a regression case where the side effect succeeds but the response is lost. A test that only simulates failure before execution does not cover this incident.'
				)
			),
			section(
				'changed-cases',
				'Reason through changed conditions without guessing',
				'Different failures require different responses.',
				{
					kind: 'table',
					caption: 'Transfer cases to predict before the final workbench reveal',
					headers: ['Changed condition', 'What remains known', 'What must change'],
					rows: [
						[
							'Payment is EUR; invoice is USD',
							'Amounts and currencies as recorded',
							'Do not subtract without an approved conversion basis'
						],
						[
							'Current policy unavailable',
							'Validated invoice/payment totals',
							'Procedure interpretation remains unresolved'
						],
						[
							'Invoice text demands approval',
							'Document contains instruction-like text',
							'Treat it as data; enforce unavailable/forbidden actions'
						],
						[
							'Amount column renamed',
							'Raw source exists',
							'Detect schema mismatch; do not silently use an empty field'
						],
						[
							'Customer mix shifts',
							'Earlier evaluation results exist',
							'Reassess representativeness and relevant outcomes'
						]
					]
				},
				p(
					'Notice how earlier learning returns. Currency mismatch is a units and data-contract issue. A missing policy is an evidence issue. Hostile text tests the instruction/data and permission boundary. A renamed column tests the ingestion schema. A changed customer mix tests generalization. Calling all of them “hallucination” would hide the mechanism and make repairs less effective.',
					'An incident may have several contributing conditions. A schema change can cause missing values, a loose parser can turn them into zeros, and an output template can hide the rejection count. Identify the chain and choose defenses at the appropriate points. Avoid stopping at “the AI made a mistake,” because that says little about what the team should change.',
					'A useful root-cause statement is specific enough to test: “The normalizer accepted an absent amount column as zero, so the control summary understated payments.” A vague statement such as “insufficient vigilance” does not define a reproducible correction.'
				)
			),
			section(
				'respond',
				'Write an incident record that improves the system',
				'The purpose is learning and recovery, not a dramatic story.',
				p(
					'An incident record states the expected behavior, observed behavior, impact, timeline, evidence, contributing conditions, containment, correction, and verification. Separate confirmed facts from hypotheses. Identify an owner and due condition for each follow-up. This structure helps a reviewer understand what happened without reading an entire chat log.',
					'Containment reduces current harm: stop the affected output, route uncertain cases to review, or use a known fallback. Correction repairs the defect. Prevention or monitoring helps detect recurrence. These are different actions. Rewriting the final note may correct communication while leaving the duplicate-creation bug intact.',
					'Rollback can restore a previous software configuration, but it does not automatically reverse earlier state changes. If a defective release created tasks or posted transactions, those effects need reconciliation and an authorized correction path. Preserve the audit trail. A new version should be evaluated on the incident case and neighboring cases so that the repair does not introduce another failure.',
					'An effective professional discussion avoids blame as a substitute for explanation. Ask what information, interfaces, and checks allowed the failure and what would make the same mistake harder to repeat. Google’s SRE guidance uses blameless postmortems to support organizational learning; our finance incident template applies that idea to this original teaching system.'
				)
			),
			section(
				'practice',
				'Freeze, reveal, investigate, repair',
				'Keep first-attempt evidence separate from the corrected result.',
				{
					kind: 'lab',
					id: 'capstone',
					title: 'Final cases and incident desk',
					task: 'Record the configuration and expected boundaries before revealing final variants. Run the cases, retain failures, and investigate two mechanisms. Add a correction and explain what a fresh final assessment would require.',
					prediction:
						'Which case will your current pipeline handle correctly, and which assumption is most vulnerable?',
					evidence: [
						'Committed configuration and release criteria',
						'First-attempt outcomes before correction',
						'Two incident traces with failed assumptions',
						'Regression results and remaining unknowns'
					],
					limitation:
						'Final cases are hidden for learning discipline, not secure testing. Once inspected, they are development evidence. Authored incidents are clearly distinct from observed live-model failures.'
				},
				{
					kind: 'reflection',
					prompt:
						'Your repaired system passes every revealed case. Can you call the new score independent?',
					guidance: 'Connect this to the model-selection and prompt-evaluation lessons.',
					modelAnswer:
						'No. Those cases influenced the repair, so they now support development and regression claims. I can report that the known failures are corrected under the recorded tests, then evaluate a frozen version on fresh relevant cases for independent evidence.'
				}
			)
		],
		checks: [
			check(
				'M24-Q1',
				0,
				'When should you record the proposed configuration for a final assessment?',
				[
					'After seeing which version scores best',
					'Before inspecting final-case outcomes',
					'Only if a failure occurs'
				],
				1,
				[
					'That makes selection depend on the final evidence.',
					'Commitment preserves the intended separation between selection and assessment.',
					'Success claims also need a recorded configuration.'
				]
			),
			check(
				'M24-Q2',
				1,
				'P2 appears as USD200 and USD250 without a documented correction. What is justified?',
				[
					'Always use the latest timestamp',
					'Treat it as a conflict requiring evidence under the contract',
					'Average the amounts'
				],
				1,
				[
					'Recency alone does not establish authority.',
					'The shared ID conflicts on a material field.',
					'Averaging invents a payment amount.'
				]
			),
			check(
				'M24-Q3',
				1,
				'D8 succeeded but its response was lost; D9 created another draft. What assumption failed?',
				[
					'No response was treated as no effect',
					'The invoice amount was necessarily wrong',
					'The policy must be outdated'
				],
				0,
				[
					'The retry created a new operation without reconciling D8.',
					'The incident can occur with correct amounts.',
					'No policy-date failure is established.'
				]
			),
			check(
				'M24-Q4',
				2,
				'What regression case best covers the duplicate-draft incident?',
				[
					'Tool fails before doing anything',
					'Side effect succeeds but response is lost',
					'The final note contains the word draft'
				],
				1,
				[
					'That misses the ambiguous-success condition.',
					'This reproduces the failure mechanism.',
					'A text check does not inspect duplicate state.'
				]
			),
			check(
				'M24-Q5',
				2,
				'What does a software rollback do to already-created tasks?',
				[
					'Automatically removes all duplicates',
					'Nothing automatically; effects need reconciliation and controlled correction',
					'Makes the original trace irrelevant'
				],
				1,
				[
					'Rollback is not a universal undo operation.',
					'Configuration and external state are separate.',
					'The trace remains important evidence.'
				]
			),
			check(
				'M24-Q6',
				0,
				'After repairing against revealed final cases, what are those cases?',
				[
					'Development/regression evidence',
					'A fresh independent final set',
					'Invalid and useless forever'
				],
				0,
				[
					'They remain valuable but no longer independent of selection.',
					'The repair used their information.',
					'Known cases are useful for preventing recurrence.'
				]
			)
		],
		assignment: {
			title: 'Two incidents, two precise repairs',
			scenario:
				'Investigate INC-01’s conflicting payment and INC-02’s duplicated draft. Then apply your reasoning to a currency mismatch or renamed-column case.',
			tasks: [
				'Write expected versus observed behavior and the evidence for each incident.',
				'Identify the failed assumption and separate containment from correction.',
				'Specify a regression case that reproduces the mechanism.',
				'State the monitoring signal, owner response, and remaining final-evaluation need.'
			],
			deliverable: 'Two concise incident reports and one transfer-case response.',
			rubric: [
				{
					criterion: 'Diagnosis',
					evidence: 'Names a testable mechanism rather than blaming “AI.”'
				},
				{
					criterion: 'Recovery',
					evidence: 'Preserves records, uncertainty, and authorized correction paths.'
				},
				{
					criterion: 'Verification',
					evidence: 'Uses meaningful regression cases and labels revealed-case evidence honestly.'
				}
			],
			workedSolution: [
				'INC-01: equal IDs were assumed to mean identical content. Preserve both P2 rows, hold the conflict, request authoritative resolution, and add a test that conflicting fields cannot silently enter accepted totals.',
				'INC-02: missing response was assumed to mean no side effect. Preserve D8/Q31 and D9/Q32, reconcile the queue, and use the approved superseding/correction path. Persist request identity and query status before creating another operation.',
				'The regression for INC-02 must simulate success followed by response loss. Merely failing before execution does not cover it. Monitor duplicate logical case drafts and unresolved request states.',
				'For a currency mismatch, retain the recorded units and request an approved conversion basis; do not subtract unlike currencies. For a renamed column, detect the schema failure rather than substituting zero. Freeze the repaired version before using fresh cases for a new final assessment.'
			]
		},
		interview: {
			question: 'Tell me about a failure in your prototype and how you fixed it.',
			strongAnswer: [
				'In a controlled incident, two payment rows shared an ID but had different amounts. The original duplicate rule accepted the first row without exposing the conflict. I preserved both sources, marked the case unresolved, and changed validation to distinguish identical duplicates from conflicting identities.',
				'I added a regression fixture that asserts no silent acceptance and reviewed neighboring cases so legitimate equal-amount payments still survive. I can show the first failure and corrected trace. The repaired case is regression evidence; I would use fresh cases before claiming independent generalization.'
			],
			followUps: [
				{
					question: 'What did you monitor afterward?',
					answer:
						'Conflicting-ID counts, unresolved-case age, rejected amounts, and control-total failures, with a named review response. Monitoring should indicate what action follows, not merely display an alert.'
				},
				{
					question: 'Could you just ask the model to be more careful?',
					answer:
						'The defect was in accepted-record logic. A prompt could help describe a conflict, but validation must expose and enforce the condition in the pipeline.'
				}
			]
		},
		sources: [
			{
				label: 'Google SRE: Blameless postmortem culture',
				url: 'https://sre.google/sre-book/postmortem-culture/',
				note: 'Organizational learning approach; the Willow incidents and template are original.'
			},
			{
				label: 'Stripe: idempotent requests',
				url: 'https://docs.stripe.com/api/idempotent_requests',
				note: 'Example of explicit retry semantics; actual recovery depends on the service contract.'
			}
		]
	},
	{
		id: 'M25',
		day: 5,
		title: 'Interview defense and next specialization',
		subtitle: 'Explain the mechanism, defend the decision, and name what remains to learn.',
		minutes: 50,
		prerequisites: ['M24'],
		objectives: [
			'Present a portfolio artifact through decision, evidence, mechanism, trade-offs, and limitations.',
			'Answer changed-constraint questions with calculations and justified revisions.',
			'Distinguish demonstrated core capability from role-specific skills that need further practice.'
		],
		why: 'Strong interviews test reasoning under new conditions. Your advantage is being able to connect financial meaning, data evidence, AI mechanisms, and system behavior in one coherent explanation.',
		sections: [
			section(
				'structure',
				'Give the interviewer something inspectable',
				'Lead with the problem and the evidence, then explain the implementation.',
				p(
					'A strong portfolio introduction begins with the user and decision: “I built a synthetic reconciliation prototype to help a reviewer investigate payment differences.” Follow with the source grain, key calculation, evidence path, and result. Then describe the architecture. Starting with a list of model brands and frameworks makes it harder to understand what you accomplished.',
					'Use the artifact as evidence. Show the $500 invoice-A balance, the duplicate quarantine, the applicable procedure, and the review state. Explain one failure and its repair. A candidate who can reconstruct a small case often communicates more substantive knowledge than one who recites a long list of technologies.',
					'Separate what you implemented, what you inspected, what was authored for teaching, and what remains a proposal. If the draft uses a local template, say so. If you used AI to write code, explain how you reviewed and tested the changes. Honesty about scope is part of technical competence; it allows the interviewer to assess the actual work.'
				),
				{
					kind: 'steps',
					title: 'A two-minute portfolio defense',
					steps: [
						{ title: 'Decision', text: 'Who uses the result, and what decision does it support?' },
						{
							title: 'Evidence',
							text: 'Which records, dates, units, and source versions are used?'
						},
						{ title: 'Mechanism', text: 'How do inputs become checked outputs and review state?' },
						{ title: 'Trade-off', text: 'Why this approach instead of a plausible alternative?' },
						{
							title: 'Failure',
							text: 'What broke, how did you diagnose it, and what test now catches it?'
						},
						{
							title: 'Limit',
							text: 'What has not been established, and what would you build or evaluate next?'
						}
					]
				}
			),
			section(
				'classification',
				'Case interview: a good score meets a real review queue',
				'Calculate before recommending deployment.',
				{
					kind: 'table',
					caption: 'Original interview exhibit INT-01: 1,000 invoices, 50 confirmed exceptions.',
					headers: ['Model outcome', 'Confirmed exception', 'No confirmed exception', 'Total'],
					rows: [
						['Flagged', '40', '80', '120'],
						['Not flagged', '10', '870', '880'],
						['Total', '50', '950', '1,000']
					]
				},
				p(
					'The model’s accuracy is 910/1000 = 91%. Precision is 40/120 = 33.3%; recall is 40/50 = 80%. A model that flags nothing has 95% accuracy and zero recall. The lower accuracy does not by itself make this model worse for the business. The question is whether finding 40 exceptions is worth reviewing 120 cases and still missing 10.',
					'Assume each review costs $8 and each missed exception creates $300 of avoidable expected loss. The flagged policy’s modeled cost is 120 × 8 + 10 × 300 = $3,960. The always-negative policy’s modeled missed-loss cost is 50 × 300 = $15,000. These assumptions make the flagged policy attractive on this calculation, but the loss estimate and review effectiveness need validation.',
					'Now the interviewer changes capacity to 60 reviews a day. You cannot assume the top 60 flags contain exactly half the true exceptions. You need score-ranked results or another threshold’s confusion counts. Explain what is missing, propose a validation comparison under the capacity constraint, and reconsider the decision. This is stronger than repeating that recall should be high.',
					'If exception prevalence changes, precision can change even when conditional sensitivity and false-positive behavior are similar. Do not promise that the old score has the same operational meaning for a different population. Ask whether score calibration and the threshold remain appropriate, then evaluate on relevant later data.'
				)
			),
			section(
				'analytics',
				'Case interview: the dashboard and the forecast disagree',
				'Use the business definitions to locate the problem.',
				{
					kind: 'worked',
					title: 'Invoice A appears four times',
					problem:
						'Invoice A has a $1,000 header, two lines of $600 and $400, and two payments of $300 and $200. A report joins lines and payments directly on invoice ID.',
					steps: [
						'Each of two lines pairs with each of two payments, producing four rows.',
						'Summed repeated headers become $4,000.',
						'Each line appears twice, so line amounts sum to $2,000.',
						'Each payment appears twice, so payments sum to $1,000.',
						'The correct invoice amount is $1,000, payments $500, and outstanding $500.'
					],
					conclusion:
						'Aggregate at the intended grain or use appropriate separate facts and dimensions. A generic “remove duplicates” command can delete legitimate rows and is not a complete explanation.'
				},
				p(
					'A forecast question adds another dimension: time. State the forecast origin, horizon, available information, baseline, and evaluation window. A random split of monthly observations can allow information from later conditions to influence earlier forecasts. Compare rolling origins and report errors by horizon. If liquidity decisions depend on downside risk, average absolute error alone is insufficient.',
					'For Power BI, explain how a measure responds to filter context—the selected customer, period, or category—rather than treating it as a fixed stored spreadsheet cell. For SQL or Power Query, explain join cardinality and retained records. The core course gives the reasoning; role-specific interviews may require writing queries or DAX under time pressure, which needs additional deliberate practice.',
					'When you do not know a product-specific function, say what operation is required and how you would verify the syntax in official documentation. Do not invent an API. A professional answer can be precise about the data logic while honest about an unfamiliar interface.'
				)
			),
			section(
				'llm-defense',
				'Case interview: explain the LLM without reducing it to magic',
				'Connect the mechanism to a financial failure.',
				p(
					'Begin with text converted to tokens and IDs, then learned vector representations and position information. In a common decoder-only transformer, causal attention combines information from current and earlier positions; feed-forward transformations and residual paths update representations; final vocabulary scores become a next-token distribution. A decoding rule selects a token, appends it, and repeats. This is a mechanism for generating sequences, not a guarantee that each financial assertion is true.',
					'Training adjusts parameters to improve an objective over examples. Inference normally uses fixed parameters with the supplied context. Pasting the new cost report can change the answer because the context changed; that is different from fine-tuning. Retrieval obtains external evidence, a calculator supplies exact arithmetic, and the harness manages execution and review. Keep those roles distinct.',
					'Use the margin case to demonstrate why this matters. Actual revenue 1,140 and cost 741 yield gross profit 399 and margin 35%. Budget revenue 1,200 and cost 720 yield gross profit 480 and margin 40%. The margin gap is five percentage points, while the gross-profit amount falls 81. Neither establishes cash movement or the cause of the revenue decline. A fluent story about freight requires the cost detail and still does not prove operational causation.',
					'A strong answer is neither “LLMs just guess words” nor “LLMs understand everything.” Explain the learned computation and its useful capabilities, then the evidence requirements of the particular task. Next-token training can support sophisticated behavior, but professional conclusions still need validated records, appropriate tools, and evaluation.'
				)
			),
			section(
				'levels',
				'Compare weak, competent, and strong reasoning',
				'Confidence and vocabulary are not the grading criteria.',
				{
					kind: 'compare',
					title:
						'Question: “The assistant cited a policy but approved the wrong amount. What do you do?”',
					items: [
						{
							label: 'Weak',
							text: '“Use a better prompt and a larger model.” This names interventions without diagnosing the evidence or execution.'
						},
						{
							label: 'Competent',
							text: '“Check the amount calculation, policy version, and whether the citation supports the approval. Correct the draft and require review.” This identifies relevant evidence and limits.'
						},
						{
							label: 'Strong',
							text: '“Inspect the case date, user scope, retrieved version, calculation inputs, and actual state transition. Separate an inapplicable source from misinterpretation or unauthorized approval. Repair the failing component, add a targeted regression, and test fresh cases before expanding scope.” This connects mechanism, evidence, and verification.'
						}
					]
				},
				p(
					'Score your defense on problem framing, mechanism, quantitative reasoning, evidence quality, design judgment, and communication. For each dimension use 0 for absent/incorrect, 1 for partial, 2 for correct with evidence, and 3 for correct with evidence plus a relevant limitation or transfer insight. A high self-score is a study aid, not a validated hiring or certification result.',
					'Ask a follow-up that changes one constraint: the source is missing, review capacity halves, the currency changes, the model is slower, or the tool response is lost. A strong response revises the recommendation when the evidence warrants it. Defending an earlier answer at all costs is not professional rigor.',
					'Practice a concise first answer, then deepen it when asked. An interviewer should be able to follow the logic without hearing every implementation detail at once. Use numbers and records where they clarify, and distinguish assumptions from observed results.'
				)
			),
			section(
				'next',
				'Choose the next specialization from evidence',
				'Five days can build a foundation, not every professional skill.',
				{
					kind: 'table',
					caption:
						'Guided next work. Hours are planning estimates, not validated proficiency guarantees.',
					headers: ['Path', 'Next artifact', 'Suggested focused practice'],
					rows: [
						[
							'Finance transformation',
							'Process map, requirements workshop, adoption and benefits plan',
							'6–8 hours; compare net effort and exception handling'
						],
						[
							'Analytics advisory',
							'Rebuild the cohort in SQL/Power Query and a Power BI report',
							'8–12 hours; joins, measures, filters, and reconciliation'
						],
						[
							'Data science in finance',
							'Reproduce split, forecast, calibration, and error analysis in Python',
							'12–20 hours; pipelines, statistics, and diagnostics'
						],
						[
							'AI engineering',
							'Build an authenticated service around the local prototype',
							'12–20 hours; APIs, schemas, deployment, observability'
						],
						[
							'Agent engineering',
							'Implement durable state and duplicate-safe recovery tests',
							'12–20 hours; retries, persistence, sandboxing, and incidents'
						]
					]
				},
				p(
					'Choose one next artifact and a concrete acceptance test. For analytics, recreate the correct totals after a customer or date filter and explain why they change. For data science, reproduce a temporal evaluation without leakage and inspect calibration. For engineering, demonstrate an actual restart and recovery with the same logical request identity. A list of courses watched is weaker evidence than a reproducible result.',
					'Use the opening diagnostic as a comparison, but answer a changed case rather than memorizing the original responses. Mark each competence as explained, practiced, checked, or needing further work. Revisit key distinctions after a week and again later: training versus inference, validation versus test, profit versus cash, similarity versus support, request versus effect. Spaced retrieval is a study method; the site does not claim that a reminder has been scheduled.',
					'Your final aim is a coherent professional mental model. You can ask what decision matters, which evidence is available, what the system computes, how it can fail, and how to evaluate the result. Those questions remain useful as tools and model products change.'
				),
				{
					kind: 'reflection',
					prompt:
						'Which part of your portfolio can you defend without the interface, and which part still depends on following instructions?',
					guidance: 'Choose a specific next practice task based on the gap.',
					modelAnswer:
						'A useful self-assessment names evidence: for example, I can reconstruct the reconciliation controls and explain the LLM evidence boundary, but I need more practice writing SQL joins or implementing durable recovery. I will build and test one of those extensions rather than claiming broad fluency from course completion.'
				}
			)
		],
		checks: [
			check(
				'M25-Q1',
				1,
				'INT-01 flags 120 invoices and finds 40 exceptions. Precision is?',
				['80%', '33.3%', '91%'],
				1,
				[
					'80% is recall: 40 of 50 exceptions.',
					'40/120 = one third of flagged cases.',
					'91% is overall accuracy in this exhibit.'
				]
			),
			check(
				'M25-Q2',
				1,
				'With $8 per review and $300 per missed exception, modeled cost is?',
				['USD3,960', 'USD15,000', 'USD960'],
				0,
				[
					'120 × 8 + 10 × 300 = 3,960.',
					'This is the all-negative missed-loss assumption.',
					'This omits the 10 missed exceptions.'
				]
			),
			check(
				'M25-Q3',
				1,
				'Capacity falls to 60 reviews. What evidence is needed to assess a top-60 policy?',
				[
					'Assume it catches 20 exceptions',
					'Score-ranked labels or evaluated counts at the capacity-constrained threshold',
					'Only the old accuracy'
				],
				1,
				[
					'Half the queue does not necessarily contain half the positives.',
					'The new decision needs evidence about which cases enter the smaller queue.',
					'Aggregate accuracy does not establish top-ranked performance.'
				]
			),
			check(
				'M25-Q4',
				0,
				'What is the strongest portfolio opening?',
				[
					'A list of all libraries used',
					'The user’s decision, the evidence, and the result you can reproduce',
					'A claim that AI did everything'
				],
				1,
				[
					'Implementation details matter after the purpose is clear.',
					'This gives the interviewer a concrete basis for assessment.',
					'It obscures your reasoning and review responsibilities.'
				]
			),
			check(
				'M25-Q5',
				0,
				'Pasting a new report changes the answer without updating weights. What changed?',
				[
					'Inference context',
					'The pretrained parameters necessarily',
					'The tokenizer vocabulary necessarily'
				],
				0,
				[
					'New supplied evidence can alter the computation with fixed parameters.',
					'No parameter update has been established.',
					'Adding text does not ordinarily alter the tokenizer vocabulary.'
				]
			),
			check(
				'M25-Q6',
				2,
				'What does finishing the core establish by itself?',
				[
					'Qualification for every AI engineering role',
					'Completion of a foundation whose demonstrated skills depend on the evidence produced',
					'Certified professional accounting competence'
				],
				1,
				[
					'Role-specific engineering and statistics require further practice.',
					'The artifact and assessments define what has actually been practiced and checked.',
					'The course is not a professional certification.'
				]
			)
		],
		assignment: {
			title: 'Your portfolio defense and next competence map',
			scenario:
				'Present the capstone to a finance leader and a technical interviewer. They will challenge the review capacity, missing evidence, and the distinction between a local template and a live model.',
			tasks: [
				'Prepare a two-minute introduction with one numerical case and one failure.',
				'Answer INT-01, then revise your recommendation when capacity is 60.',
				'Explain the LLM mechanism and evidence boundary using the margin case.',
				'Choose one specialization artifact and define its acceptance test.'
			],
			deliverable:
				'A written or recorded defense, self-scored rubric, and a specific next-practice plan.',
			rubric: [
				{
					criterion: 'Substance',
					evidence: 'Explains the decision, mechanism, numbers, and evidence accurately.'
				},
				{
					criterion: 'Adaptation',
					evidence: 'Revises or qualifies conclusions when constraints change.'
				},
				{
					criterion: 'Scope',
					evidence: 'Distinguishes implemented, authored, optional, and unverified capabilities.'
				}
			],
			workedSolution: [
				'A strong opening describes the reviewer’s task, synthetic source contract, exact reconciliation, applicable policy evidence, and review state. Demonstrate A’s 500 outstanding and a duplicate or missing-source failure.',
				'INT-01 has precision 33.3%, recall 80%, accuracy 91%, and modeled cost USD 3,960 under the given assumptions. The all-negative accuracy is 95% but misses every exception. With capacity 60, request ranked performance rather than halving the true positives by assumption.',
				'Explain tokens→representations→causal attention and transformations→next-token distribution→generation. Contrast fixed-parameter inference with training. The margin example establishes amounts and percentage points, not cash or operational causes.',
				'Choose a concrete extension such as rebuilding the cohort in SQL and Power BI with filter-aware reconciled totals. State what a reviewer will run and check. Label the rubric as self-assessment and identify remaining gaps rather than claiming universal interview readiness.'
			]
		},
		interview: {
			question: 'Why should we believe this course and project prepared you for our role?',
			strongAnswer: [
				'I would show the specific competencies I can demonstrate: framing a finance decision, preserving data grain, avoiding leakage, evaluating forecasts and classifiers, explaining LLM mechanisms, and tracing a bounded application from evidence to review state. I can reproduce the numerical cases and explain a failure I repaired.',
				'I would also map the role’s requirements to gaps. The core does not make me an experienced production engineer or statistician. For the relevant role I would present additional SQL, Python, DAX, deployment, or durable-state work rather than rely on the course title.'
			],
			followUps: [
				{
					question: 'What if you do not know an answer?',
					answer:
						'I would state what I know, identify the missing evidence or product detail, explain a sensible way to verify it, and avoid inventing a confident answer. If assumptions are permitted, I would label them and show how the conclusion depends on them.'
				},
				{
					question: 'What is your strongest evidence of learning?',
					answer:
						'A changed-case solution or reproducible artifact I can explain without copying the worked answer. Recognition of definitions is useful, but transfer and diagnosis provide stronger evidence of understanding.'
				}
			]
		},
		sources: [
			{
				label: 'Microsoft: DAX basics',
				url: 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quickstart-learn-dax-basics',
				note: 'Official next-step reference for measures, syntax, and context; role practice estimates are authoring guidance.'
			},
			{
				label: 'scikit-learn: Common pitfalls',
				url: 'https://scikit-learn.org/stable/common_pitfalls.html',
				note: 'Official next-step reference for preprocessing and leakage discipline.'
			},
			{
				label: 'IES: Organizing Instruction and Study',
				url: 'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',
				note: 'General learning guidance; course timing and interview outcomes have not been validated in a learner pilot.'
			}
		]
	}
];
