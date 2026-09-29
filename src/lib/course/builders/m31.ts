import type { CourseModule } from '../types';
import { p, note, table, worked, lab, section, check } from '../days/content-helpers';
export const m31: CourseModule = {
	id: 'M31',
	day: 7,
	title: 'Evidence data modeling and revisions',
	subtitle:
		'Build analytical facts that survive changing disclosures, missing records, and awkward comparisons.',
	minutes: 75,
	prerequisites: ['M26', 'M09', 'M14'],
	objectives: [
		'Design separate entity, source, metric, observation, and derived-result records with stable identities.',
		'Preserve revisions and select a defensible comparison basis without erasing history.',
		'Represent missingness and source quality without inventing zeros or probabilities.',
		'Compute growth, shares, and productivity proxies with explicit input lineage and comparability limits.',
		'Choose summary statistics and checks appropriate to the population, units, and dependence.'
	],
	why: 'A research assistant can find a plausible number quickly. Building a trustworthy analytical product requires knowing exactly what the number measures, which version it belongs to, and which other numbers it can fairly be compared with.',
	sections: [
		section(
			'observation-model',
			'Give every fact a precise address',
			'A number needs more than a label and a year.',
			p(
				'An observation is a recorded value for a defined entity, measure, period or instant, and source. “Revenue, 2025, 100” is incomplete. Is the entity a group or a subsidiary? Does 100 mean dollars, thousands, or millions? Is the year a twelve-month fiscal period or a calendar year? Is the value reported, calculated, or estimated? The observation grain should answer those questions before the interface draws a chart. This extends the transaction grain from M02 to public disclosures and research products.',
				'Separate five concepts. An entity record identifies the organization and reporting perimeter. A source record identifies the document, publisher, publication/access dates, version or saved digest, and location. A metric dictionary defines the quantity, unit, inclusions and required dimensions. An observation links those identities to the original text, parsed value, period, source locator and status. A derived-result record identifies its input observations and transformation. This avoids repeating a publisher’s details in every cell while preserving the path back to the source.',
				'Keep the original string alongside normalized values. If a report says “USD 101.2 million”, preserve that wording, parse 101.2, retain scale million, and derive 101,200,000 USD under a declared transformation. An ID such as REV-A-25 is a stable reference, not a claim that the record is correct. A page number or table locator lets a reviewer inspect the evidence; a URL alone often cannot identify which of many amounts was used. A content digest can detect changed bytes, but it cannot certify the truth of those bytes.'
			),
			table(
				'Minimal fictional evidence graph',
				['Record', 'Purpose', 'Example relationship'],
				[
					[
						'Entity E-A',
						'What organization is measured?',
						'Consolidated group; continuing operations'
					],
					[
						'Source S-25',
						'Where did the claim appear?',
						'Report version 2, page 18, revenue table'
					],
					['Metric REV', 'What is counted?', 'Annual recognized revenue, USD'],
					[
						'Observation REV-A-25',
						'What did this source report?',
						'101.2 million; E-A; fiscal period; S-25'
					],
					['Result GROW-A', 'How was a conclusion computed?', 'REV-A-25 and REV-A-24R; growth-v1']
				]
			)
		),
		section(
			'revisions',
			'Append a revision; do not rewrite the past',
			'The question determines which historical view is appropriate.',
			p(
				'A later disclosure may correct an error, change a classification, restate a comparative, or report a different business perimeter. Preserve the new observation as a separate record and connect it to the old one when the relationship is known. Include the reason and publication time. Overwriting the old amount destroys the ability to reconstruct what an analyst could have known earlier. Conversely, automatically charting the original amount forever can mix incompatible bases once operations change.',
				'Distinguish the economic period from the information-availability date. A 2025 report can revise a 2024 value. For a present-day comparison on a consistent basis, that revised comparative may be appropriate. For an as-known-in-2024 decision replay, it was unavailable and must not leak into the historical input. This is the same availability principle used for model evaluation, now applied to research data. Store both dates and state which view the product provides.',
				'A supersedes link represents a specific relationship, not an instruction to add both amounts. Some changes are not one-to-one: an old “advisory” category may split into two services, or two regions may be regrouped. A crosswalk maps source categories to a canonical taxonomy, but a map cannot manufacture an undisclosed split. Preserve combined categories or label the comparison unavailable. Select categories because their definitions are mutually exclusive and complete for the stated total, not because their sum happens to look close.'
			),
			worked(
				'One business, two apparent growth rates',
				'A consolidated group combines the parent and included subsidiaries under the applicable reporting basis; its perimeter is the set of operations included. Continuing operations means the ongoing operations under that basis, excluding separately presented discontinued operations. Fictional Alder reports prior-year revenue 100 million in REV-A-24. A later report restates the continuing-operations comparative to 92 million in REV-A-24R. Current revenue REV-A-25 is 101.2 million on that same continuing-operations basis.',
				[
					'Using the original prior amount: (101.2 − 100) ÷ 100 = 1.2%.',
					'Using the comparable revised amount: (101.2 − 92) ÷ 92 = 10%.',
					'Preserve all three observations. Link REV-A-24R to REV-A-24 and record the change in perimeter.',
					'GROW-A uses REV-A-24R and REV-A-25, with their source versions and growth formula. An as-known historical view retains REV-A-24 where the revision was not yet available.'
				],
				'The arithmetic changed because the denominator and reporting basis changed. These two ratios do not by themselves prove that operating growth accelerated.'
			)
		),
		section(
			'missingness',
			'Treat unknowns as information about the research',
			'Not found, not disclosed, and not applicable mean different things.',
			p(
				'Zero is an observed quantity. Null is a missing value representation. Pair missing values with a reason: not yet researched, searched but not found, not disclosed, not applicable, or not comparable. If an entity does not disclose workforce, setting workforce to zero would create an absurd revenue-per-person calculation. A missing value should survive normalization and reach the interface as a gap or explicit state. Do not silently replace it with the previous year unless the product deliberately presents a dated carry-forward with that label.',
				'A coverage matrix records the expected entity × metric × period combinations and their status. Completeness must have a declared denominator. Eight observed cells out of ten required cells gives 80% field coverage, but it does not mean 80% accuracy. A search log records the question, source families checked, dates, and unresolved reason. This lets another researcher continue efficiently and distinguishes a deliberate negative finding from a task that was never attempted.',
				'Source authority, extraction confidence, and cross-record comparability are different judgments. An official report can accurately state a period-end headcount that is unsuitable for comparison with another company’s average full-time equivalents. A scanned official document can have a transcription error. A neat five-point source rubric is an ordinal judgment, not an 80% probability when the score is four. Define the rubric, preserve the reviewer’s reasons, and use independent checking for consequential fields. Do not convert authority grades into statistical confidence without evidence.'
			),
			note(
				'accounting',
				'Headcount and FTE',
				'Headcount counts people under the stated inclusion rule. Full-time equivalents adjust workload to full-time units. Average FTE over a year differs from a headcount on the final day. Contractors, partners and acquired teams may also be included differently.'
			)
		),
		section(
			'derived',
			'Make every denominator inspectable',
			'A derived value carries the limits of its inputs.',
			p(
				'For a ratio, save both numerator and denominator identities. For a growth calculation, save the beginning and ending observations and the elapsed interval. Compound annual growth rate describes the constant annual multiplier that would connect two positive endpoints. Moving from 80 at year-end 2021 to 100 at year-end 2025 spans four annual intervals and implies about 5.74% per year: 80 multiplied by roughly 1.0574 four times reaches 100. It does not mean every intervening year grew by that rate. If the endpoints or interval are not comparable, precise arithmetic does not repair the interpretation.',
				'Shares require a defined universe. If Alder discloses 60 million, Birch 30 million, and Cedar is missing, 60 divided by 90 is two-thirds of the disclosed two-company total. It is not a supported share of all three companies, still less the entire industry. When Cedar later discloses 10 million on the same basis, Alder’s three-company share becomes 60%. Store all included observation IDs so the displayed denominator can be reconstructed. A filtered view must either recompute its denominator or visibly retain the wider universe.',
				'Revenue per person is a proxy, not a direct measure of efficiency or individual output. Suppose Alder reports revenue 120 million with average 1,000 FTE and Birch reports 130 million with 1,100 period-end people. The arithmetic gives USD 120,000 and approximately USD 118,182 respectively. Their timing and population bases differ; service mix, subcontracting, acquisitions and currency can further affect the ratio. A responsible product can show these source-specific calculations with prominent caveats, but should not turn the small difference into a confident productivity ranking.'
			),
			table(
				'Compare before calculating',
				['Dimension', 'Question', 'Failure if ignored'],
				[
					['Perimeter', 'Same business/entity scope?', 'Subsidiary versus group ranked as peers'],
					[
						'Time',
						'Same period length and availability?',
						'Fiscal-year labels hide different windows'
					],
					['Unit', 'Same currency and scale?', 'Millions mixed with full dollars'],
					[
						'Definition',
						'Same inclusions and categories?',
						'Revenue/FTE compared with revenue/headcount'
					],
					[
						'Universe',
						'Which records enter the denominator?',
						'Partial coverage called market share'
					]
				]
			)
		),
		section(
			'statistics',
			'Summaries are models of what matters',
			'Choose the unit of analysis before choosing the statistic.',
			p(
				'A mean adds observations and divides by their count; a median is the middle ordered value, or the midpoint of the two central values. For five fictional collection delays of 2, 3, 4, 5 and 36 days, the mean is 10 days and the median is 4. Both are correct summaries of different aspects. The mean reflects the long delay strongly; the median describes the middle case while concealing the tail if shown alone. Report enough distribution information to support the business decision, such as how many cases exceed the review threshold.',
				'Weights change the question. Two units have revenue 90 and 10, with margins 10% and 50%. The simple average margin is 30%, describing the unweighted average unit percentage. Total profit is 9 + 5 = 14 on total revenue 100, so the combined margin is 14%. That revenue-weighted result answers the group question. Do not average percentages merely because each row has a percentage column. Reconstruct the relevant numerators and denominators.',
				'A collected dataset is not automatically a random sample of a broader population. Three disclosures from related entities, ten invoices from one customer, or repeated annual measurements are not independent interchangeable draws. A confidence interval requires a defensible sampling/modeling assumption; it is not generated by counting rows. Correlation between revenue and headcount does not establish that hiring caused growth. Growth can fund hiring, acquisitions can raise both, and scale can dominate the association. State what the analysis describes and what design or additional evidence would be needed for a causal claim.'
			),
			worked(
				'A percentage that cannot be averaged away',
				'Unit A: revenue 90, margin 10%. Unit B: revenue 10, margin 50%. Amounts use the same fictional currency and period.',
				[
					'Compute profit: A = 90 × 0.10 = 9; B = 10 × 0.50 = 5.',
					'Combine numerators and denominators: 14 profit ÷ 100 revenue = 14%.',
					'The mean of 10% and 50% is 30%, but that gives the small unit the same influence as the large unit.'
				],
				'Label the 14% as combined margin and preserve both units’ input records.'
			)
		),
		section(
			'verify-lineage',
			'Make the evidence graph executable',
			'A reviewer should be able to walk backward from an answer.',
			p(
				'Validate unique IDs and source/entity/metric references before computing a view. Check dates, allowed statuses, unit conversions, revision links and required source locators. Derived calculations should identify all inputs and the transformation version; business checks can verify that mutually exclusive components reconcile within a stated rounding tolerance. A small difference might be published rounding, a missing component or a taxonomy error. Investigate its cause rather than widen the tolerance until the test turns green.',
				'A content hash helps detect a changed source or output, and a manifest records versions used in a build. Neither establishes source quality. Keep separate evidence of human or deterministic verification. When a revision arrives, recompute affected results, retain the earlier artifact where appropriate, and test both the current-comparable and historically available views. Good lineage reduces the cost of change because you can identify which numbers and narratives depend on the amended fact.'
			),
			lab(
				'evidence-lineage',
				'Reconstruct a defensible comparison',
				'Use the workbench’s separate Aster fixture: original 2023/2024 revenue 90/100 million, restated continuing-operations values 80/92 million, and 2025 continuing-operations revenue 101.2 million. Compare original and restated selection. Inspect Birch’s 60,000 USD-thousand disclosure and Clover’s missing value; then supply a learner-authored Clover amount and follow the appended record and denominator.',
				'Why does the original-basis selection withhold comparable growth even though a naive 1.2% calculation is possible?',
				[
					'Restated growth 10%; two-interval CAGR from 80 to 101.2 approximately 12.47%',
					'Original-basis comparable growth withheld because the reporting bases differ',
					'Birch normalized to 60 million; missing Clover excluded only under the explicitly disclosed partial denominator'
				],
				'The workbench’s Aster records are distinct from the chapter’s Alder example. Calculations are real and local; all disclosures and learner revisions are synthetic, not verified public evidence or causal conclusions.'
			)
		)
	],
	checks: [
		check(
			'm31-q1',
			0,
			'Which record best supports a reproducible reported fact?',
			[
				'A confidence score alone',
				'Value and chart color',
				'Entity, metric, period, unit, original text, source version and locator'
			],
			2,
			[
				'A score cannot substitute for the fact and source.',
				'Presentation attributes do not identify what was measured.',
				'Correct. These fields identify the claim and its evidence.'
			]
		),
		check(
			'm31-q2',
			1,
			'A prior value changes from 100 to a comparable revised 92; current is 101.2. Which statement is defensible?',
			[
				'Delete the original to prevent confusion',
				'Comparable growth is 10%; retain original and revised records',
				'Growth is always 1.2% because originals can never be revised'
			],
			1,
			[
				'Deletion prevents historical reconstruction and hides the revision.',
				'Correct. The current comparable view uses 92 while lineage preserves history.',
				'Original values may be inappropriate for a current same-basis comparison.'
			]
		),
		check(
			'm31-q3',
			2,
			'Eight of ten required fields are found. What does 80% measure?',
			[
				'Coverage under the declared field universe',
				'Probability that a source is true',
				'Accuracy of all found values'
			],
			0,
			[
				'Correct. The denominator is required fields, not verified outcomes.',
				'Coverage is not a probability of truth.',
				'Found values may still be wrong.'
			]
		),
		check(
			'm31-q4',
			3,
			'Revenue 60 and 30 is known; a third entity is missing. How may 60/90 be labeled?',
			[
				'A fully comparable three-entity share',
				'The first entity’s whole-industry share',
				'Share of the two disclosed values on this basis'
			],
			2,
			[
				'The third denominator input is missing.',
				'The broader universe has not been observed.',
				'Correct. Name the restricted denominator explicitly.'
			]
		),
		check(
			'm31-q5',
			4,
			'Units have revenue/margin 90/10% and 10/50%. What is their combined margin?',
			['30%', '14%', '60%'],
			1,
			[
				'That is an unweighted mean of unit percentages.',
				'Correct: (9 + 5)/(90 + 10) = 14%.',
				'Adding percentages does not yield a combined margin.'
			]
		),
		check(
			'm31-q6',
			4,
			'An official source receives quality 4/5. Can the interface call this 80% probability of accuracy?',
			[
				'No; an ordinal rubric is not calibrated probability',
				'Yes, divide by five',
				'Only if the font is small'
			],
			0,
			[
				'Correct. Explain the rubric and independent verification.',
				'The numerical scale does not establish a frequency interpretation.',
				'Presentation cannot repair a false statistical claim.'
			]
		)
	],
	assignment: {
		title: 'Deliver a revision-aware evidence pack',
		scenario:
			'Use the fictional Alder records 100, 92 and 101.2 million, the 60/30/missing share case, and the two-unit margin case. A director wants a current comparison and a historically available view.',
		tasks: [
			'Define entity/source/metric/observation/result records and connect their IDs.',
			'Preserve both prior-year disclosures and compute the two growth figures.',
			'Write a coverage statement and an honest share label.',
			'Reconstruct combined margin and explain why averaging percentages fails.',
			'Specify broken-reference, wrong-scale, missing-value and unavailable-revision tests.'
		],
		deliverable:
			'A compact evidence table, revision graph, calculation register, coverage note, and test expectations.',
		rubric: [
			{
				criterion: 'Evidence model',
				evidence: 'Original values, units, periods, source locators and stable IDs retained.'
			},
			{
				criterion: 'Revision reasoning',
				evidence: '1.2% and 10% calculated; view selection and availability dates explicit.'
			},
			{
				criterion: 'Denominator discipline',
				evidence: 'Two-company 66.7% labeled narrowly; group margin equals 14%.'
			},
			{
				criterion: 'Quality interpretation',
				evidence: 'Missingness, authority, comparability and uncertainty remain distinct.'
			}
		],
		workedSolution: [
			'Create observations REV-A-24=100m, REV-A-24R=92m, and REV-A-25=101.2m with separate source/version records. Link the revision, retain its publication time, and label continuing operations.',
			'Original-base arithmetic gives 1.2%; comparable-current arithmetic gives 10%. The earlier as-known view cannot use a revision published later. Neither alone proves a causal improvement.',
			'60/(60+30) is 66.7% of the two disclosed values. The third entity remains missing with a reason; once its comparable value 10 is supplied, the three-entity share is 60%.',
			'Profits are 9 and 5; combined margin 14/100=14%. The unweighted 30% describes a different quantity.',
			'Reject unknown IDs and unsupported units; preserve null rather than zero; block unavailable future revisions in historical selection; check selected taxonomy before reconciliation.'
		]
	},
	interview: {
		question: 'How would you turn public disclosures into a defensible analytical dataset?',
		strongAnswer: [
			'I first define entities, metrics, units, periods and expected coverage. I preserve original facts with source locators, normalize through explicit transformations, and keep revisions as linked observations with availability dates. Missingness receives a reason rather than an invented zero.',
			'I compute derived measures from identified inputs on a declared basis, expose denominators and comparability limits, and test lineage and reconciliation. Source authority and a neat chart do not establish a valid peer comparison or a causal conclusion.'
		],
		followUps: [
			{
				question: 'Would you always select the newest record?',
				answer:
					'No. The current comparable view may need a revised comparative; a historical as-known view must respect publication availability. Scope and definition must agree as well as date.'
			},
			{
				question: 'What makes a calculated result auditable?',
				answer:
					'Its inputs, units, selection policy, transformation version and source trail are explicit. Another person can recompute the value and see the interpretation limits.'
			}
		]
	},
	sources: [
		{
			label: 'W3C — PROV Model Primer',
			url: 'https://www.w3.org/TR/prov-primer/',
			note: 'Entities, activities, agents and derivation relationships for provenance; course financial cases are original.'
		},
		{
			label: 'NIST — Measures of Location',
			url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm',
			note: 'Mean and median summarize different aspects of a distribution.'
		}
	]
};
