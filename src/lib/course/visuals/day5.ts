import type { TeachingVisual } from './types';

export const day5Visuals: TeachingVisual[] = [
	{
		id: 'm21-reconcile-rows',
		module: 'M21',
		section: 'stages',
		afterBlock: 0,
		title: 'Reconcile every row',
		lead: 'An explainable pipeline preserves both accepted records and the reasons other records cannot be used.',
		alt: 'Raw payments split into accepted records and quarantine. Accepted records then split into matched and unmatched records. No branch silently disappears.',
		takeaway:
			'Accepted is not the same as matched. P4 can be a valid USD 150 payment record while its unknown invoice reference X remains unresolved. Tray sizes and slip counts are schematic.',
		question: 'Should an unmatched payment be removed so the invoice join looks tidy?',
		answer:
			'No. Preserve it in a separate unresolved category. Otherwise accepted payments no longer reconcile to matched plus unmatched records and the exception becomes invisible.',
		sourceNote:
			'Original generated illustration for M21, using the module’s fictional records and stated assumptions. Schematic, not measured model performance.',
		kind: 'art',
		image: '/images/visuals/m21-reconcile-rows.webp',
		width: 1536,
		height: 1024,
		transcript: [
			{
				label: 'Raw payments',
				explanation:
					'Retain original source rows and provenance before normalization or event checks.'
			},
			{
				label: 'Accepted',
				explanation:
					'Records satisfy the declared event and data rules; acceptance alone does not establish an invoice match.'
			},
			{
				label: 'Quarantine',
				explanation:
					'Preserve rejected or unresolved records with a reason, such as the identical repeated P2 in PIPE-01.'
			},
			{
				label: 'Matched',
				explanation:
					'Accepted records link to an invoice in the permitted cohort and can enter its settlement calculation.'
			},
			{
				label: 'Unmatched',
				explanation:
					'Accepted records with unresolved references stay visible for investigation; they are not silently discarded.'
			}
		]
	},
	{
		id: 'm21-payment-cohort',
		module: 'M21',
		section: 'records',
		afterBlock: 1,
		title: 'The payment cohort, row by row',
		lead: 'Follow event identity and invoice reference before adding amounts.',
		alt: 'Five nodes preserve raw payment rows: P1 A 300 accepted; P2 A 200 accepted; repeated identical P2 A 200 quarantined; P3 B 600 accepted; P4 X 150 accepted but unmatched.',
		takeaway:
			'These five raw rows total USD 1,450. Quarantine is USD 200; accepted payments total USD 1,250. A different legitimate ID with amount 200 must not be removed solely because its value repeats.',
		question: 'Why does P4 survive the acceptance step but fail the match step?',
		answer:
			'Its source record is valid under the fixture’s contract, but invoice X does not exist in the invoice cohort. Record the USD 150 as unmatched instead of losing it in an inner join.',
		sourceNote:
			'Original teaching figure for M21, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'Row 1 · P1 → A',
				detail: 'A distinct valid event, accepted and matched.',
				value: 'USD 300'
			},
			{
				label: 'Row 2 · P2 → A',
				detail: 'First occurrence of this valid payment event.',
				value: 'USD 200'
			},
			{
				label: 'Row 3 · P2 → A',
				detail: 'Identical repeated event; preserved in quarantine.',
				value: 'USD 200'
			},
			{
				label: 'Row 4 · P3 → B',
				detail: 'A distinct valid event, accepted and matched.',
				value: 'USD 600'
			},
			{
				label: 'Row 5 · P4 → X',
				detail: 'Accepted source record; invoice reference unresolved.',
				value: 'USD 150'
			}
		]
	},
	{
		id: 'm21-control-identities',
		module: 'M21',
		section: 'verify',
		afterBlock: 0,
		title: 'Three controls, one complete reconciliation',
		lead: 'Each identity tests a different boundary in the simple payment-only fixture.',
		alt: 'Three parallel controls reconcile raw payments to accepted plus quarantine, accepted payments to matched plus unmatched, and invoices to matched payments plus outstanding.',
		takeaway:
			'A total can look plausible while a boundary is broken. Verify all three identities and retain invoice C, whose USD 400 remains outstanding without a payment match.',
		question: 'An inner join drops invoice C. Which identity or assertion reveals the problem?',
		answer:
			'The required assertion that C remains present fails. Keeping the original USD 2,000 invoice control also exposes that matched payments 1,100 plus the reduced outstanding 500 no longer reconcile.',
		sourceNote:
			'Original teaching figure for M21, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'Raw-row control',
				detail: '1,450 raw = 1,250 accepted + 200 quarantined.',
				value: 'USD 1,450'
			},
			{
				label: 'Accepted-event control',
				detail: '1,250 accepted = 1,100 matched + 150 unmatched.',
				value: 'USD 1,250'
			},
			{
				label: 'Invoice-balance control',
				detail: '2,000 invoices = 1,100 matched + 900 outstanding.',
				value: 'USD 2,000'
			}
		]
	},
	{
		id: 'm22-denominators',
		module: 'M22',
		section: 'variability',
		afterBlock: 0,
		title: 'Two denominators',
		lead: 'Run reliability and case reliability are related, but they are not the same measure.',
		alt: 'Four rows contain three trial outcomes each: pass-pass-pass, pass-fail-pass, fail-fail-fail, and pass-pass-fail. There are seven passing runs and one all-pass case.',
		takeaway:
			'The authored example has trial pass rate 7/12 = 58.3% and all-three-pass case rate 1/4 = 25%. Repeated trials do not turn four case types into twelve independent business scenarios.',
		question:
			'Why is it misleading to describe this as twelve independent cases with 58.3% coverage?',
		answer:
			'There are only four cases, each repeated three times. Repeats probe run variability; they do not expand scenario coverage or establish independence.',
		sourceNote:
			'Original generated illustration for M22, using the module’s fictional records and stated assumptions. Schematic, not measured model performance.',
		kind: 'art',
		image: '/images/visuals/m22-denominators.webp',
		width: 1536,
		height: 1024,
		transcript: [
			{
				label: 'Four case trays',
				explanation:
					'The authored rows are ordinary, missing-policy, conflicting-payment, and hostile-text cases, in that order.'
			},
			{
				label: 'Three runs per case',
				explanation:
					'Each disc is one pass or failure under the reviewed criteria. The pattern is PPP, PFP, FFF, PPF.'
			},
			{
				label: 'Passing runs: 7 / 12',
				explanation: 'Count all seven passes across twelve executions. The denominator is trials.'
			},
			{
				label: 'Cases passing every run: 1 / 4',
				explanation: 'Only the first case passes all three repeats. The denominator is cases.'
			},
			{
				label: 'Pass / Fail',
				explanation:
					'Checks and crosses encode reviewed outcomes, not model confidence. The two legend discs are not extra trials.'
			}
		]
	},
	{
		id: 'm22-case-trial-grader',
		module: 'M22',
		section: 'units',
		afterBlock: 0,
		title: 'What exactly is one evaluation case?',
		lead: 'Keep the task, execution, and judgment distinct so the score has a meaning.',
		alt: 'A flow specifies a case’s inputs and expected boundaries, runs a recorded configuration, preserves observed outputs and state, then applies multiple graders.',
		takeaway:
			'A trace is diagnostic evidence, not a pass criterion. Ten impressive calls cannot rescue a wrong balance or unauthorized status.',
		question:
			'CASE-A produces USD 500 and cites a policy but sets status approved. Does the numerical pass make the case pass?',
		answer:
			'No. The amount grader can pass while the state grader fails. The prototype must preserve the required review boundary as well as numerical and evidential correctness.',
		sourceNote:
			'Original teaching figure for M22, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{
				label: 'Case',
				detail: 'Records, date, user scope, evidence, and acceptable outcome.',
				value: 'Starting conditions'
			},
			{
				label: 'Trial',
				detail: 'One execution under a recorded model, prompt, tool, and data configuration.',
				value: 'One run'
			},
			{
				label: 'Observation',
				detail: 'Preserve actual output, calls, results, and resulting state.',
				value: 'Trace + outcome'
			},
			{
				label: 'Graders',
				detail: 'Check amount, support, completeness, permissions, and recovery separately.',
				value: 'Defined criteria'
			}
		]
	},
	{
		id: 'm22-evidence-graders',
		module: 'M22',
		section: 'graders',
		afterBlock: 0,
		title: 'A release requires several kinds of evidence',
		lead: 'Match each judgment to a method that can actually assess it.',
		alt: 'Three compared grader types cover exact deterministic assertions, reviewed human judgments, and model-assisted judgments calibrated against reviewed examples.',
		takeaway:
			'A model grader can scale review but can also falsely pass or fail outputs. Validate the grader itself, especially before turning its score into a release decision.',
		question: 'A grader passes any answer containing the word “source.” What failure can it miss?',
		answer:
			'It can pass an invented, inapplicable, or unsupported citation. Check source existence and scope, then evaluate whether each claim follows that evidence.',
		sourceNote:
			'Original teaching figure for M22, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'Deterministic checks',
				detail: 'Exact cents, valid IDs, schemas, allowed states, and control identities.',
				value: 'Enforceable properties'
			},
			{
				label: 'Human rubric',
				detail: 'Claim support, uncertainty, clarity, and useful investigation requests.',
				value: 'Reviewed meaning'
			},
			{
				label: 'Model-assisted review',
				detail:
					'Compare judgments with reviewed examples; inspect false passes and false failures.',
				value: 'Calibrated assistance'
			}
		]
	},
	{
		id: 'm23-draft-boundary',
		module: 'M23',
		section: 'scope',
		afterBlock: 0,
		title: 'A draft is not a posting',
		lead: 'The capstone prepares evidence for a reviewer; it does not acquire accounting authority by writing fluently.',
		alt: 'Checked evidence flows into a draft for review and a human decision. A ledger sits behind a separate locked partition labeled posting needs authority.',
		takeaway:
			'A reviewer queue entry is a task record, not a journal entry, payment instruction, or company approval. The course’s local reviewed state remains a learning action.',
		question: 'The note says “No posting has been performed.” What else should you inspect?',
		answer:
			'Inspect actual available tools, execution records, and state changes. The statement is credible only when the system’s capabilities and observed effects support it.',
		sourceNote:
			'Original generated illustration for M23, using the module’s fictional records and stated assumptions. Schematic, not measured model performance.',
		kind: 'art',
		image: '/images/visuals/m23-draft-boundary.webp',
		width: 1536,
		height: 1024,
		transcript: [
			{
				label: 'Checked evidence',
				explanation:
					'The numerical core and source checks prepare validated amounts, versions, and unresolved issues.'
			},
			{
				label: 'Draft for review',
				explanation:
					'The note communicates observations and missing evidence; it does not independently authorize a financial action.'
			},
			{
				label: 'Human decision',
				explanation:
					'A reviewer inspects the evidence and follows the organization’s actual controls. Local course review is not company approval.'
			},
			{
				label: 'Posting needs authority',
				explanation:
					'Changing accounting records requires a separately authorized integration and controlled process, absent from this teaching prototype.'
			}
		]
	},
	{
		id: 'm23-provenance-path',
		module: 'M23',
		section: 'architecture',
		afterBlock: 0,
		title: 'Follow the source to the reviewer',
		lead: 'Each output should be traceable through components with distinct responsibilities.',
		alt: 'A flow moves from versioned inputs to exact reconciliation, applicable evidence, checked drafting, and one logical queue task with a trace.',
		takeaway:
			'The draft should receive checked amounts rather than reinterpret raw strings. A static local browser demonstration does not provide durable multi-user storage or production authentication.',
		question: 'Where should a draft’s invented reason for partial payment be caught?',
		answer:
			'At claim-support review and output validation. Correct arithmetic does not establish a cause; preserve needs_evidence and ask for remittance or dispute records.',
		sourceNote:
			'Original teaching figure for M23, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{
				label: 'Versioned inputs',
				detail: 'Case, entity, currency, cutoff, raw records, and source IDs.',
				value: 'Contract'
			},
			{
				label: 'Reconcile exactly',
				detail: 'Validate events, quarantine defects, calculate balances, retain unmatched items.',
				value: 'Numerical core'
			},
			{
				label: 'Retrieve evidence',
				detail: 'Enforce access and date applicability; retain versioned policy references.',
				value: 'Evidence packet'
			},
			{
				label: 'Draft + check',
				detail: 'Preserve checked amounts, supported claims, unknowns, and allowed status.',
				value: 'Reviewable note'
			},
			{
				label: 'Queue + trace',
				detail: 'Stable request identity, one logical draft, recorded actual results.',
				value: 'Handoff'
			}
		]
	},
	{
		id: 'm23-invoice-evidence',
		module: 'M23',
		section: 'worked-case',
		afterBlock: 1,
		title: 'Invoice A: a defensible conclusion',
		lead: 'Arithmetic, procedure, and causal explanation need different evidence.',
		alt: 'Four compared evidence links establish invoice A at 1,000, accepted payments 500, calculation 500 outstanding, and PARTIAL-02 review routing while the reason remains unknown.',
		takeaway:
			'The trace supports the amount and review route. It does not establish that the customer disputed the invoice, that a credit note exists, or that cash movement equals the balance.',
		question: 'Can PARTIAL-02 tell you why the customer paid only USD 500?',
		answer:
			'No. It establishes how unexplained partial settlements should be routed. A causal claim requires remittance, correspondence, credit-note, or other relevant evidence.',
		sourceNote:
			'Original teaching figure for M23, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'INV-A-v1',
				detail: 'The supplied invoice record establishes the stated total.',
				value: 'USD 1,000'
			},
			{
				label: 'PAY-09-v1',
				detail: 'P1 300 + P2 200; identical repeated P2 quarantined.',
				value: 'USD 500 accepted'
			},
			{
				label: 'CALC-A-01',
				detail: '1,000 invoice − 500 accepted matched payments.',
				value: 'USD 500 outstanding'
			},
			{
				label: 'PARTIAL-02',
				detail: 'Route unexplained partial settlement for review; cause remains unknown.',
				value: 'Needs evidence'
			}
		]
	},
	{
		id: 'm24-lost-reply',
		module: 'M24',
		section: 'incident-two',
		afterBlock: 0,
		title: 'The lost reply',
		lead: 'An uncertain response and an uncertain effect are different things.',
		alt: 'Request D8 creates Q31, but the return message is lost. The next panel inspects D8 and finds the same Q31 instead of creating another task.',
		takeaway:
			'This recovery illustration shows the alternative to the module’s faulty D9 retry, which created Q32 alongside Q31. Preserve original identity and check its case and inputs.',
		question: 'Why is a fresh D9 dangerous after D8 times out?',
		answer:
			'D8 may already have completed. D9 identifies a new logical operation and can create Q32, duplicating reviewer work even if both notes contain correct amounts.',
		sourceNote:
			'Original generated illustration for M24, using the module’s fictional records and stated assumptions. Schematic, not measured model performance.',
		kind: 'art',
		image: '/images/visuals/m24-lost-reply.webp',
		width: 1536,
		height: 1024,
		transcript: [
			{
				label: 'Request D8',
				explanation:
					'Persist the intended operation and stable identity before sending the request.'
			},
			{
				label: 'Q31 exists',
				explanation:
					'Execution can succeed and create a real queue task even when the caller never receives the result.'
			},
			{
				label: 'Reply lost',
				explanation: 'The response failure does not prove that the queue operation failed.'
			},
			{
				label: 'Check D8 status',
				explanation:
					'Inspect the original identity, case, and expected inputs. Recover the existing Q31 instead of blindly creating D9.'
			}
		]
	},
	{
		id: 'm24-conflicting-identity',
		module: 'M24',
		section: 'incident-one',
		afterBlock: 0,
		title: 'Locate the first divergence',
		lead: 'Equal event IDs are not sufficient evidence of identical records.',
		alt: 'Two records share P2 but disagree on USD 200 versus USD 250. A compared third state holds the conflict instead of choosing the first or latest value.',
		takeaway:
			'A timestamp is provenance, not correction authority. The first wrong assumption is treating repeated identity as proof that the full record is duplicated.',
		question: 'Would keeping the latest P2 row solve INC-01?',
		answer:
			'Not without an authoritative correction contract. The later row may be a correction, corrupt export, or misidentified event. Preserve both and request a valid resolution before claiming full reconciliation.',
		sourceNote:
			'Original teaching figure for M24, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'P2 · 09:00',
				detail: 'Invoice A, amount 200; original source row preserved.',
				value: 'USD 200'
			},
			{
				label: 'P2 · 09:03',
				detail: 'Same ID, same invoice, different amount.',
				value: 'USD 250'
			},
			{
				label: 'Conflict boundary',
				detail: 'Neither first nor latest is authoritative from these facts alone.',
				value: 'Hold both'
			}
		]
	},
	{
		id: 'm24-incident-repair',
		module: 'M24',
		section: 'respond',
		afterBlock: 0,
		title: 'Contain, correct, then verify',
		lead: 'Recovery needs more than editing the final paragraph.',
		alt: 'A flow records the expected-versus-observed failure, contains affected work, repairs the failing contract, runs regression and neighboring tests, then evaluates a frozen version on fresh cases.',
		takeaway:
			'The incident and any consulted final cases become development evidence after they influence a repair. Passing them again establishes regression progress, not a new independent result.',
		question: 'Does rolling back software automatically remove duplicate queue records?',
		answer:
			'No. Configuration rollback and reconciliation of existing effects are separate. Preserve the audit trail and use an authorized status correction or supersession process.',
		sourceNote:
			'Original teaching figure for M24, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{
				label: 'Establish facts',
				detail: 'Expected state, observed state, timeline, sources, and first divergence.',
				value: 'Evidence'
			},
			{
				label: 'Contain',
				detail: 'Stop affected output or route uncertain cases for review.',
				value: 'Current impact'
			},
			{
				label: 'Correct',
				detail: 'Repair the specific data, tool, permission, or state boundary.',
				value: 'Mechanism'
			},
			{
				label: 'Verify repair',
				detail: 'Retest incident and neighboring cases; retain first-attempt evidence.',
				value: 'Regression'
			},
			{
				label: 'Test fresh cases',
				detail: 'Freeze the repaired version before independent relevant evaluation.',
				value: 'New evidence'
			}
		]
	},
	{
		id: 'm25-score-decision',
		module: 'M25',
		section: 'classification',
		afterBlock: 1,
		title: 'A score becomes a decision',
		lead: 'Detection quality must meet review effort and operational capacity.',
		alt: 'Exception detection, a timed review tray, and finite review slots converge on the choice of a review policy.',
		takeaway:
			'INT-01 flags 120 invoices, catches 40 exceptions, and misses 10. Its modeled cost is USD 3,960, but a capacity of 60 reviews makes that unmodified queue infeasible. Slot counts in the image are schematic.',
		question:
			'If review capacity halves, can you assume the top 60 flags contain 20 true exceptions?',
		answer:
			'No. You need ranked scores or confusion counts at a capacity-compatible threshold. The distribution of true exceptions within the flagged queue is not established by the aggregate table.',
		sourceNote:
			'Original generated illustration for M25, using the module’s fictional records and stated assumptions. Schematic, not measured model performance.',
		kind: 'art',
		image: '/images/visuals/m25-score-decision.webp',
		width: 1536,
		height: 1024,
		transcript: [
			{
				label: 'Find exceptions',
				explanation:
					'INT-01 has 40 true flags and 10 missed exceptions. Recall is 40/50 = 80%; accuracy alone is insufficient.'
			},
			{
				label: 'Count review effort',
				explanation:
					'All 120 flagged cases consume review effort, including 80 false positives. At USD 8 each, review costs USD 960.'
			},
			{
				label: 'Respect capacity',
				explanation:
					'A 60-review limit cannot accommodate 120 flags. Evaluate a different threshold or process using appropriate validation evidence.'
			},
			{
				label: 'Choose a policy',
				explanation:
					'Under the stated loss assumptions, review cost 960 plus missed-loss cost 3,000 equals 3,960. Check assumptions and feasibility before deployment.'
			}
		]
	},
	{
		id: 'm25-portfolio-defense',
		module: 'M25',
		section: 'structure',
		afterBlock: 1,
		title: 'Six moves in a portfolio defense',
		lead: 'Make your work inspectable before listing technologies.',
		alt: 'A flow groups six defense moves into three pairs: decision and evidence, mechanism and trade-off, then failure and limit.',
		takeaway:
			'Reconstruct a small numerical case and explain one failure. Distinguish implemented behavior, inspected evidence, authored demonstrations, and proposed production work.',
		question:
			'An interviewer asks what you personally established. What evidence is stronger than naming a framework?',
		answer:
			'Show the source rows, validated USD 500 balance, duplicate quarantine, applicable procedure, review state, and a reproducible failure test. Explain what you inspected and what remains unproven.',
		sourceNote:
			'Original teaching figure for M25, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{
				label: 'Decision + evidence',
				detail:
					'Who uses this result? Which records, dates, units, and source versions support it?',
				value: 'Why + from what'
			},
			{
				label: 'Mechanism + trade-off',
				detail:
					'How do inputs become checked results? Why this design over a plausible alternative?',
				value: 'How + why this'
			},
			{
				label: 'Failure + limit',
				detail: 'What broke, which test catches it, and what is still unestablished?',
				value: 'What changed + next'
			}
		]
	},
	{
		id: 'm25-join-multiplication',
		module: 'M25',
		section: 'analytics',
		afterBlock: 0,
		title: 'A two-by-two join becomes four rows',
		lead: 'Two invoice lines and two payments create four combinations when joined only on invoice ID.',
		alt: 'A 2-by-2 matrix pairs line 600 and line 400 with payment 300 and payment 200. Each cell represents one joined row, for four rows in total.',
		takeaway:
			'Invoice A’s header repeats four times, producing a wrong USD 4,000 sum. Lines sum to 2,000 and payments to 1,000 after multiplication. Correct amounts are invoice 1,000, paid 500, outstanding 500.',
		question: 'Why is a generic remove-duplicates step an unsafe fix?',
		answer:
			'The four combinations contain legitimate lines and payments. Aggregate each fact to the intended invoice grain before joining, or model separate facts with appropriate relationships; do not discard valid events.',
		sourceNote:
			'Original teaching figure for M25, based on the module’s fictional records and stated assumptions. Not measured model performance.',
		kind: 'diagram',
		layout: 'matrix',
		nodes: [],
		rows: ['Line L1 · USD 600', 'Line L2 · USD 400'],
		columns: ['Payment P1 · USD 300', 'Payment P2 · USD 200'],
		cells: [
			[1, 1],
			[1, 1]
		],
		unit: 'joined row per line–payment pair'
	}
];
