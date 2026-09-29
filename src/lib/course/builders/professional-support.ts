import type { Check } from '../types';
import type { Term } from '../terms';
import type { TeachingVisual } from '../visuals/types';
import { check } from '../days/content-helpers';

export const professionalTransferChecks: (Check & { moduleId: string })[] = [
	{
		moduleId: 'M26',
		...check(
			'M26-T1',
			3,
			'A new API returns amountCents: "40000" and currency: "GBP". Your internal Money type allows only safe integer cents and USD/EUR. A teammate casts the response as Money. What is required?',
			[
				'Convert every string to a number and treat any currency as USD',
				'Accept because the type checker passes',
				'Validate the runtime payload and reject or explicitly transform only under a declared contract'
			],
			2,
			[
				'That silently changes financial meaning and can misparse other fields.',
				'A cast does not validate external values.',
				'Correct. Both the numeric representation and unsupported currency must be addressed at the boundary.'
			]
		)
	},
	{
		moduleId: 'M27',
		...check(
			'M27-T1',
			4,
			'A backup route is cheaper and supports text, but the task requires reading a scan. Its developer tests all use pre-extracted text. What can those tests establish?',
			[
				'Only behavior on the supplied text; image capability and scan quality remain unestablished',
				'That any schema-valid output will be accurate',
				'That the backup can read scans'
			],
			0,
			[
				'Correct. Test the actual input capability and field evidence before routing scans there.',
				'Schema validity cannot supply missing perceptual evidence.',
				'The required image boundary was never exercised.'
			]
		)
	},
	{
		moduleId: 'M31',
		...check(
			'M31-T1',
			1,
			'In March 2027 a source revises December 2026 revenue. You replay a decision made in January 2027. Which view preserves the historical information boundary?',
			[
				'Use the March revision because it is more recent',
				'Use only records available by the January decision cutoff, retaining the later revision separately',
				'Average the original and revised amounts'
			],
			1,
			[
				'The later revision was unavailable at the decision time.',
				'Correct. A current comparable view can differ, but the historical replay must respect availability.',
				'Averaging versions has no declared economic interpretation.'
			]
		)
	},
	{
		moduleId: 'M32',
		...check(
			'M32-T1',
			1,
			'A user filters a dashboard to one company. The bar reads 100% but its caption still says “share of the whole industry”. What should fail?',
			[
				'Nothing because one selected company is 100% of itself',
				'Only the color test',
				'The result/denominator-label consistency test'
			],
			2,
			[
				'The selected-set percentage does not establish industry share.',
				'Color does not address the misleading analytical claim.',
				'Correct. The number and caption answer different questions.'
			]
		)
	},
	{
		moduleId: 'M35',
		...check(
			'M35-T1',
			2,
			'An assistant fixes duplicate events by keeping the first row for every payment ID. Reordering conflicting duplicate rows changes the final balance. What is the next useful action?',
			[
				'Preserve the failing fixture, hold the conflict under the declared policy, and test order independence',
				'Change the expected test value to whichever result appears',
				'Sort the screenshot'
			],
			0,
			[
				'Correct. The violated business rule must be repaired and independently verified.',
				'That would make the test endorse an arbitrary result.',
				'Presentation changes cannot fix input acceptance.'
			]
		)
	}
];

export const professionalVisuals: TeachingVisual[] = [
	{
		id: 'm26-execution-places',
		module: 'M26',
		section: 'execution-places',
		kind: 'diagram',
		layout: 'compare',
		title: 'Three places code can run',
		lead: 'The same source repository can produce work in different execution environments.',
		alt: 'Build-time code produces public assets. Browser code handles interaction and public local calculations. Server code enforces private access and holds service credentials.',
		takeaway:
			'Choose the environment by the responsibility. Static deployment does not create a private server just because the development project had one.',
		question: 'Where can a long-lived provider credential safely remain in a private integration?',
		answer:
			'Behind an appropriately secured server or generation environment, outside public browser assets; authorization is still required.',
		sourceNote: 'Original architecture diagram; responsibilities are illustrative.',
		nodes: [
			{
				label: 'Build time',
				detail: 'Validate source snapshots and create approved public files.',
				icon: 'package'
			},
			{
				label: 'Browser',
				detail: 'Render, interact, and calculate on delivered data.',
				icon: 'monitor'
			},
			{
				label: 'Server',
				detail: 'Enforce private access, call services, and persist authorized state.',
				icon: 'server'
			}
		]
	},
	{
		id: 'm26-response-order',
		module: 'M26',
		section: 'async-boundaries',
		kind: 'diagram',
		layout: 'timeline',
		title: 'The last reply may be the wrong reply',
		lead: 'The active request determines which result belongs on screen.',
		alt: 'At 0 ms A is requested. At 100 ms B becomes active. B returns 200 dollars at 300 ms. A returns 500 dollars at 900 ms and is ignored as stale.',
		takeaway:
			'Keep record identity and response identity together; do not display a stale balance beneath the current selection.',
		question: 'Which amount remains visible when the last response arrives?',
		answer: 'B’s USD 200. A’s late response does not match the active selection.',
		sourceNote: 'Original hypothetical request-timing example; timings are authored.',
		nodes: [
			{ label: '0 ms', detail: 'Request A.', value: 'A active' },
			{ label: '100 ms', detail: 'Select and request B.', value: 'B active' },
			{ label: '300 ms', detail: 'B returns; display its amount.', value: 'USD 200' },
			{ label: '900 ms', detail: 'A returns late; ignore for this view.', value: 'USD 500 stale' }
		]
	},
	{
		id: 'm27-four-gates',
		module: 'M27',
		section: 'structured-contract',
		kind: 'diagram',
		layout: 'flow',
		title: 'Four questions after a response',
		lead: 'Each check establishes a different property.',
		alt: 'A candidate passes through format, financial meaning, source support and execution authority checks. Passing one check does not imply passing the others.',
		takeaway:
			'A schema-valid amount can still be wrong, unsupported or unauthorized for an action.',
		question: 'Does an existing evidence ID prove that its source supports the amount?',
		answer: 'No. The source content and field must be compared with the candidate claim.',
		sourceNote: 'Original validation architecture; the flow is an explanatory sequence.',
		nodes: [
			{ label: 'Shape', detail: 'Required keys and allowed value types.' },
			{ label: 'Meaning', detail: 'Identity, units, amounts, dates and relationships.' },
			{ label: 'Support', detail: 'Cited evidence actually supports each claim.' },
			{ label: 'Authority', detail: 'The requested action is permitted in current scope.' }
		]
	},
	{
		id: 'm27-cost-components',
		module: 'M27',
		section: 'economics',
		kind: 'diagram',
		layout: 'bars',
		title: 'Follow the cost through each route',
		lead: 'Every case uses fast; one fifth also uses deeper; some fast calls retry.',
		alt: 'Illustrative API costs for 1000 cases: fast 7.20 dollars, deeper escalation 5.76 dollars and retries 0.36 dollars, totaling 13.32 dollars. Human review 400 dollars is separate.',
		takeaway:
			'Escalation adds to the initial cost. The much larger assumed reviewer cost must be included in a full-process comparison.',
		question: 'Why is the model cost not simply 1000 times the fast-call rate?',
		answer: 'The additional 200 deeper calls and 50 fast retries consume service usage too.',
		sourceNote: 'Original hypothetical arithmetic, not provider pricing or measured outcomes.',
		unit: 'USD',
		nodes: [
			{ label: 'Fast calls', detail: '1,000 × USD 0.0072', amount: 7.2, value: 'USD 7.20' },
			{ label: 'Escalations', detail: '200 × USD 0.0288', amount: 5.76, value: 'USD 5.76' },
			{ label: 'Retries', detail: '50 × USD 0.0072', amount: 0.36, value: 'USD 0.36' }
		]
	},
	{
		id: 'm31-version-comparison',
		module: 'M31',
		section: 'revisions',
		kind: 'diagram',
		layout: 'compare',
		title: 'Keep the versions; choose the basis',
		lead: 'The original and revised comparative are different observations of the same reported period.',
		alt: 'Prior original 100 million on all-operations basis, prior revised 92 million on continuing-operations basis, and current 101.2 million on continuing-operations basis. Comparable growth uses 92 and 101.2.',
		takeaway:
			'The 1.2% original-base calculation and 10% comparable calculation use different denominators. Preserve the revision and explain the selection.',
		question: 'Which prior value supports the current continuing-operations comparison?',
		answer:
			'The revised 92 million, assuming the case’s aligned definitions and periods; the original 100 remains in history.',
		sourceNote: 'Original fictional disclosure case; not an accounting-standard prescription.',
		nodes: [
			{
				label: 'Original prior',
				detail: 'Preserved for the earlier reported view.',
				value: '100 million'
			},
			{
				label: 'Revised prior',
				detail: 'Continuing operations; supersedes the comparable value.',
				value: '92 million'
			},
			{
				label: 'Current',
				detail: 'Same continuing-operations basis as revised prior.',
				value: '101.2 million'
			}
		]
	},
	{
		id: 'm31-weighted-margin',
		module: 'M31',
		section: 'statistics',
		kind: 'diagram',
		layout: 'bars',
		title: 'Averaging ratios changes the question',
		lead: 'Large and small units cannot be given equal revenue weight by accident.',
		alt: 'An unweighted average of unit margins 10% and 50% is 30%. Combined profit 14 divided by combined revenue 100 is 14%.',
		takeaway:
			'Reconstruct the combined numerator and denominator. 30% describes the equal-weight average unit percentage; 14% describes the group margin.',
		question: 'What makes the second result 14%?',
		answer: 'Unit profits 9 and 5 total 14; revenues 90 and 10 total 100; 14/100 = 14%.',
		sourceNote: 'Original fictional two-unit calculation.',
		unit: '%',
		nodes: [
			{
				label: 'Mean unit margin',
				detail: 'Equal weight for 10% and 50%.',
				amount: 30,
				value: '30%'
			},
			{
				label: 'Combined margin',
				detail: 'Revenue weights 90 and 10; profit 14.',
				amount: 14,
				value: '14%'
			}
		]
	},
	{
		id: 'm32-denominator-policy',
		module: 'M32',
		section: 'denominators',
		kind: 'diagram',
		layout: 'compare',
		title: 'One filter, two honest policies',
		lead: 'The label must identify the denominator actually used.',
		alt: 'Full universe 60 plus 30 plus 10 gives Alder 60%. Selecting only 60 and 30 gives 66.7% if the denominator is recalculated, or 60% if the full universe is retained and disclosed.',
		takeaway: 'Choose a policy and update number, label, evidence and export together.',
		question: 'Can a60% result remain correct after hiding the third company?',
		answer:
			'Yes, if the product explicitly retains the full 100 denominator and labels that policy.',
		sourceNote: 'Original synthetic selection example.',
		nodes: [
			{ label: 'Full universe', detail: '60 ÷100', value: '60%' },
			{
				label: 'Selected universe',
				detail: '60 ÷90; after removing the 10 record.',
				value: '66.7%'
			},
			{
				label: 'Retained universe',
				detail: '60 ÷100; hidden record still in denominator.',
				value: '60%'
			}
		]
	},
	{
		id: 'm32-coordinate-counts',
		module: 'M32',
		section: 'gaps-geography',
		kind: 'diagram',
		layout: 'bars',
		title: 'Count the records at each boundary',
		lead: 'These nested counts do not measure the same population.',
		alt: 'A hypothetical directory contains 100 collected records, 90 valid coordinate records, and 80 plotted records under the active filter.',
		takeaway:
			'A map showing 80 points cannot establish 80 locations worldwide. Report coverage and coordinate method separately.',
		question: 'How many collected records lack valid coordinates in this case?',
		answer:
			'10. The further 10-record difference is due to the selected plotting filter, not necessarily missing coordinates.',
		sourceNote: 'Original hypothetical geography pipeline; not real directory coverage.',
		unit: 'records',
		nodes: [
			{
				label: 'Collected',
				detail: 'Records in the supplied directory.',
				amount: 100,
				value: '100'
			},
			{
				label: 'Valid coordinates',
				detail: 'Records passing coordinate checks.',
				amount: 90,
				value: '90'
			},
			{
				label: 'Plotted selection',
				detail: 'Records included by the active filter.',
				amount: 80,
				value: '80'
			}
		]
	},
	{
		id: 'm35-equal-amount',
		module: 'M35',
		section: 'test-change',
		kind: 'diagram',
		layout: 'compare',
		title: 'Equal amounts can be different events',
		lead: 'Duplicate treatment follows the declared identity, not amount alone.',
		alt: 'P2 is an existing payment of 200 dollars. A repeated identical P2 is quarantined. New P5 is another 200-dollar payment with a distinct identity and remains accepted.',
		takeaway:
			'Adding legitimate P5 to invoice C reduces PIPE-01 outstanding from USD 900 to USD 700; amount-based deduplication would wrongly erase it.',
		question: 'Which 200-dollar row is rejected under the supplied identical-duplicate policy?',
		answer: 'The repeated identical P2; the distinct legitimate P5 remains accepted.',
		sourceNote: 'Original extension of the course’s synthetic PIPE-01 cohort.',
		nodes: [
			{ label: 'P2 original', detail: 'Accepted event with stable identity.', value: 'USD 200' },
			{ label: 'P2 repeated', detail: 'Identical duplicate; quarantine once.', value: 'USD 200' },
			{ label: 'P5 new', detail: 'Different legitimate event for C; accept.', value: 'USD 200' }
		]
	},
	{
		id: 'm35-release-chain',
		module: 'M35',
		section: 'release',
		kind: 'diagram',
		layout: 'flow',
		title: 'Connect the source to the running result',
		lead: 'Each transition needs evidence rather than a success-shaped label.',
		alt: 'The release path connects a source revision, required checks, compiled artifact, deployed environment and verified user behavior.',
		takeaway:
			'An independent green deployment cannot establish that a failed quality job passed. Required gates must be connected to release.',
		question: 'Why repeat an asset-path check on the compiled deployment?',
		answer:
			'Development serving can hide base-path and asset-reference errors that occur in the published artifact.',
		sourceNote: 'Original release architecture diagram.',
		nodes: [
			{ label: 'Revision', detail: 'Reviewed diff and known inputs.' },
			{ label: 'Checks', detail: 'Required business and behavior tests pass.' },
			{ label: 'Artifact', detail: 'Compiled files match the verified source.' },
			{ label: 'Environment', detail: 'Correct paths, configuration and access.' },
			{ label: 'Behavior', detail: 'Observed user journey and recovery evidence.' }
		]
	}
];

export const professionalTerms: Term[] = [
	{
		term: 'HTTP',
		module: 'M26',
		definition:
			'A protocol for exchanging requests and responses. Methods, headers, status and bodies describe the exchange; a successful status does not establish financial correctness.',
		example:
			'A balance endpoint returns HTTP 200 but still needs record-identity and amount validation.'
	},
	{
		term: 'JSON',
		module: 'M26',
		definition:
			'A text format for structured data using objects, arrays, strings, numbers, booleans and null. Parsing it does not prove that its fields satisfy a business contract.',
		example: 'An object can contain invoiceId, balanceCents and currency.'
	},
	{
		term: 'Promise',
		module: 'M26',
		definition:
			'A JavaScript object representing an asynchronous operation that will settle with a value or an error. Awaiting it pauses the current async function’s progress, not the entire browser.',
		example: 'A record request may complete after another user selection has already started.'
	},
	{
		term: 'runtime validation',
		module: 'M26',
		definition:
			'Checks performed on actual values while a program runs, especially at external boundaries. Type annotations alone do not inspect received data.',
		example: 'Reject an amount string where the API contract requires safe integer cents.'
	},
	{
		term: 'provider adapter',
		module: 'M27',
		definition:
			'Application code that translates a stable internal request/result contract to and from a provider-specific API while preserving capabilities, errors and useful metadata.',
		example:
			'Map a drafting task to the chosen endpoint and retain refusal, usage and model-version fields.'
	},
	{
		term: 'result cache',
		module: 'M27',
		definition:
			'Stored application outputs reused for matching requests under explicit identity, freshness and access rules. It differs from provider processing of a cached prompt prefix.',
		example:
			'A revised source invalidates a previously generated note even if the user asks the same question.'
	},
	{
		term: 'source locator',
		module: 'M31',
		definition:
			'A precise reference to the place within source evidence that supports a claim, such as page, table, paragraph or crop coordinates.',
		example: 'Report version 2, page 18, revenue table, continuing-operations row.'
	},
	{
		term: 'reporting perimeter',
		module: 'M31',
		definition:
			'The entities or operations included in a reported measure. A change in perimeter can change a value without the same change in underlying comparable activity.',
		example:
			'Continuing operations exclude a disposed business that was included in the original comparative.'
	},
	{
		term: 'crosswalk',
		module: 'M31',
		definition:
			'An explicit mapping between source categories and a chosen common taxonomy. It preserves definition differences and cannot invent an undisclosed category split.',
		example:
			'Keep a combined advisory category when the source does not separately disclose its two proposed subcategories.'
	},
	{
		term: 'restatement',
		module: 'M31',
		definition:
			'A later revised presentation of a previously reported value. Preserve its reason, source, publication date and relation to the earlier observation; the suitable version depends on the analytical question.',
		example: 'A prior-year continuing-operations comparative changes from 100 to 92 million.'
	},
	{
		term: 'visual encoding',
		module: 'M32',
		definition:
			'A mapping from data to visual properties such as position, length, area or color. The scale and baseline determine what comparisons the viewer can fairly make.',
		example: 'Two revenue bars use the same zero baseline and dollars-per-pixel scale.'
	},
	{
		term: 'build artifact',
		module: 'M35',
		definition:
			'Files produced by a build for a particular deployment or distribution. It is distinct from the source commit and must be verified with its data and configuration.',
		example: 'A static site artifact contains compiled JavaScript, HTML, data and reviewed media.'
	}
];
