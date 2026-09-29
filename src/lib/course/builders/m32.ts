import type { CourseModule } from '../types';
import { p, note, table, worked, lab, section, check } from '../days/content-helpers';
export const m32: CourseModule = {
	id: 'M32',
	day: 7,
	title: 'Analytical interfaces that explain themselves',
	subtitle: 'Make the visual, the selected data, and the evidence tell the same story.',
	minutes: 55,
	prerequisites: ['M31'],
	objectives: [
		'Choose visual encodings, shared scales, and explicit denominators that preserve the intended comparison.',
		'Connect displayed and derived values to exact evidence records and reproducible filter state.',
		'Represent missingness, geographic precision, and scenario assumptions honestly.',
		'Design keyboard, reduced-motion, text-equivalent, and media-failure paths.',
		'Separate generated illustrative assets from measured financial graphics and build-time narration.'
	],
	why: 'A dashboard can make a weak comparison look authoritative. The builder’s responsibility is to make the correct interpretation easy, and the limits visible exactly where the user needs them.',
	sections: [
		section(
			'encoding',
			'Choose what the visual should let someone compare',
			'Every mark is a claim about a number or relationship.',
			p(
				'A visual encoding maps data to a position, length, area, color, or other visible feature. For comparing four revenue amounts, aligned bars on one scale let the viewer compare lengths against the same baseline. A table remains valuable for exact values and definitions. A chart should answer a declared question: which entity is larger, how a quantity changes over time, which categories compose a total, or how two variables relate. Decorative complexity is not a substitute for deciding which comparison matters.',
				'Suppose Alder has revenue 100 and Birch 80 in the same unit and period. If both bars start at zero on a 0–100 scale, Birch’s bar is 80% as long. If each card scales its own bar to its own maximum, both bars fill their containers and the comparison disappears. If a bar axis begins at 75, lengths of 25 and 5 exaggerate the apparent ratio. A line chart may use a clearly labeled restricted range to inspect small changes, but bar length normally communicates magnitude from its baseline. State the scale and choose it for the question.',
				'Keep colors consistent across views and do not rely on color alone. Direct labels, shapes, text and focus states help readers who cannot distinguish the palette. Label units near the value: USD millions differs from dollars, while a rate differs from percentage points. Rounding should happen for display after calculation under the chosen precision policy. Two values displayed as 10.0 can differ in stored precision; do not infer an exact tie from a rounded label.'
			),
			table(
				'Question → suitable first view',
				['Question', 'Useful encoding', 'Evidence to keep nearby'],
				[
					[
						'Which amount is larger?',
						'Aligned bars or dot positions',
						'Common scale, unit and reporting basis'
					],
					[
						'What changed over time?',
						'Line with actual observation markers',
						'Dates, gaps and revision status'
					],
					[
						'What makes up the total?',
						'Aligned composition or table',
						'Mutually exclusive categories and denominator'
					],
					[
						'What supports this point?',
						'Selectable mark and evidence panel',
						'Observation IDs, source and transformation'
					]
				]
			)
		),
		section(
			'denominators',
			'Filtering changes the analytical question',
			'Selection state is part of the result.',
			p(
				'Return to the fictional revenues Alder 60, Birch 30, Cedar 10, all in millions on an agreed basis. Alder is 60% of the three-entity total 100. If the user filters out Cedar, a recalculated visible-entity denominator is 90 and Alder becomes 66.7%. Alternatively, the product may keep the full-universe denominator and continue showing 60%. Both policies can be useful, but they answer different questions. Label “share of selected entities” or “share of the complete three-entity universe” beside the result; do not let the user infer the denominator from the remaining bars.',
				'Derived values need more than one citation. A share depends on all denominator inputs; an index depends on its base-period observation; a growth rate depends on both endpoints and elapsed time. Let a user open those inputs from the displayed result. A single source link to the numerator cannot substantiate the whole calculation. An evidence panel should identify original wording, period, unit, source locator, revision status and formula. It should also state when definitions limit the comparison.',
				'Use stable IDs in interface state. A chart mark can carry observationId rather than a copied value and guessed source URL. Resolve that ID against the selected data version. Store shareable filters in validated URL parameters when they contain public, non-sensitive selections: metric, year, entity IDs and basis. Parse allowed values and provide a safe default for unknown ones. A URL is not an access-control mechanism and should not contain secrets or private record details. If the data version changes, record or display that change so the same link does not silently claim an identical historical result.'
			),
			worked(
				'One toggle, two possible shares',
				'Alder 60, Birch 30, Cedar 10. The user hides Cedar.',
				[
					'Initial share:60/100=60%.',
					'Visible-entities policy:60/90≈66.7%, labeled as share of selected entities.',
					'Fixed-universe policy:60/100=60%, with the retained three-entity denominator disclosed.',
					'A test changes the selection and asserts both the numeric result and denominator label.'
				],
				'A correct percentage with the wrong label is still an analytical defect.'
			)
		),
		section(
			'gaps-geography',
			'Show the limits in the marks themselves',
			'Missing data should not look like smooth continuity.',
			p(
				'If revenue is known for 2023 and 2025 but unavailable for 2024, a continuous line can imply a value or smooth path that was never observed. Break the line at the missing period or deliberately show a separately labeled interpolation. A tooltip alone is weak protection when the visible mark makes the wrong claim. Distinguish “no matching records” from “data failed to load”, and show a missing-value reason when it matters. Zero should be plotted only when it is the measured value.',
				'A map introduces another kind of precision. Source-provided building coordinates and a city-centroid estimate can both produce a crisp dot, yet they do not locate an office equally well. A city centroid is an approximate representative center of the city area, not an actual office address. Retain coordinate method, source, date and coverage status. Use a legend or evidence panel to distinguish precision and avoid implying a street address from a centroid. Collected records, valid coordinates, plotted points, and all actual locations are different counts. Two offices may overlap on screen; visual point count is not necessarily record count.',
				'For a fictional directory with 100 records, suppose 90 have valid coordinates and only 80 are shown under the current regional filter. “80 offices worldwide” would be unsupported. State 80 plotted records in the selected region, 90 geocoded records overall, and 100 collected directory records; separately disclose whether the directory is complete. A globe adds delight, but geography must remain registered: markers, coastlines and projection need the same coordinate convention. Provide a usable list or flat view if 3D fails, and do not require rotation to read the source evidence.'
			),
			note(
				'mechanism',
				'A smooth picture is not a measurement',
				'Interpolation, city centroids, rounded values and authored scenarios are transformations or assumptions. Label them where a reader might otherwise mistake visual precision for source precision.'
			)
		),
		section(
			'scenario',
			'Let people explore assumptions without inventing certainty',
			'A slider usually changes a scenario, not a forecast model.',
			p(
				'A scenario interface makes an assumption adjustable and recomputes its consequence. Starting revenue 100 million compounded at 5% annually becomes 115.7625 million after three years, usually displayed as 115.8. This answers “what follows if this rate persists?” It does not establish that 5% is likely. A forecast needs a model and evaluation appropriate to its purpose, as covered in M08. Historical CAGR used as a slider default remains an assumption about the future.',
				'Show the baseline period, rate, horizon, unit, and omitted drivers. Currency changes, acquisitions, capacity constraints and different reporting scopes can invalidate a simplistic extrapolation. A scenario based on local-currency growth applied to a USD baseline should not be described as a currency-consistent forecast. Let the user reset assumptions and inspect the baseline evidence. Preserve configuration in exports so another reviewer can reproduce the displayed result.',
				'Test direction and boundary behavior as well as one answer. With a positive baseline, zero growth should retain the amount; a negative rate should reduce it over a positive horizon. A zero-year horizon should equal the baseline if allowed. If the UI allows a negative modeled change, do not hardcode a plus sign before it. The visual bar, displayed amount, sentence and export should all come from the same computed result rather than separately maintained copies.'
			),
			lab(
				'evidence-lineage',
				'Audit the number and its presentation',
				'Use the evidence workbench to select an analytical basis and inspect the result’s input records. Design a two-state sketch showing the visible number, denominator/basis label, missing-data state and evidence link. Test your interpretation against a changed selection.',
				'Which labels or source references must change when the calculation basis changes?',
				[
					'One displayed result and all required input IDs',
					'Before/after basis labels and numeric explanation',
					'An explicit state for missing or incompatible evidence'
				],
				'The lab performs local deterministic evidence calculations. The interface sketch is your design exercise, not a claim that this course builds a live public-data dashboard or forecasts a real business.'
			)
		),
		section(
			'accessible-state',
			'Design the whole interaction, including failure',
			'A beautiful default state is only one frame of the product.',
			p(
				'A user must be able to reach chart details using the keyboard, identify the focused element, open the evidence, close the panel, and return to a sensible place. A hover-only tooltip excludes touch and keyboard interaction. Put important information in persistent text or an accessible detail panel. Complex charts need a concise description and an equivalent explanation or table that communicates the relationships, units, values and meaningful caveats. Accessible text should teach the same idea, not simply say “chart”.',
				'Animation should help the user understand a transition, not obscure the current state. Respect reduced-motion preferences and retain all information when motion is removed. Expensive 3D rendering can be deferred until visible, paused when the page is hidden, and cleaned up when the component is removed. A failed graphics capability should reveal a useful fallback, not an empty rectangle. Responsive design must preserve the analytical relationship at a narrow width; horizontal scrolling can be preferable to shrinking an evidence table until it is unreadable.',
				'Observe the interface under loading, empty, error and completed conditions. If a request fails after a filter changes, an old chart must not appear to represent the new filter. Pair a result with its data version and request identity. Test at least one keyboard journey and one narrow-screen journey through selection, detail, export and return. Check the meaning of the exported evidence as carefully as its download button.'
			)
		),
		section(
			'media',
			'Keep generated media and measured graphics distinct',
			'Creative generation and analytical rendering have different acceptance tests.',
			p(
				'Generate an illustration to explain an abstract mechanism, then inspect its labels, arrows, readability and equivalent text. Render financial charts from the actual selected data so numbers and scales can be checked and updated. An image that resembles a chart is not evidence of a calculation. When using generated diagrams, clearly mark an illustrative example and ensure its accessible explanation does not contradict the pixels.',
				'Narration can be generated before deployment from an approved script. A build pipeline can store audio and captions with a manifest recording script/configuration identity and measured duration. Changing a number in the script should trigger regeneration or a visible stale-asset failure, not leave the old spoken value. Review pronunciation of units and numbers, normalize loudness, and provide playback controls plus a transcript when audio is unavailable. Pre-generated narration is different from a realtime voice agent: it does not listen, reason about a new request, or select tools during playback.',
				'The media pipeline should never expose a provider key in the static application. Generation may happen in a controlled build environment; only approved public outputs are shipped. A content hash can connect script/settings to an asset, while listening and source review establish whether the narration is accurate and usable. This combination makes rich presentation maintainable rather than a collection of impressive but disconnected files.'
			)
		)
	],
	checks: [
		check(
			'm32-q1',
			0,
			'Revenue bars 100 and 80 each fill their own card width. What has been lost?',
			[
				'The ability to compare magnitude by shared length',
				'The data automatically becomes false',
				'Nothing; every full bar means the same quantity'
			],
			0,
			[
				'Correct. Independent maxima erase the intended length comparison.',
				'The stored values can be correct while the encoding misleads.',
				'Full width has a different scale in each card.'
			]
		),
		check(
			'm32-q2',
			1,
			'Hiding Cedar 10 changes Alder’s share from 60% to 66.7%. What label is required?',
			['No denominator label', 'Whole-industry share', 'Share of selected entities totaling 90'],
			2,
			[
				'A changed denominator needs a visible explanation.',
				'The industry universe was never established.',
				'Correct. 60/90 describes the selected two-entity denominator.'
			]
		),
		check(
			'm32-q3',
			2,
			'A precise dot comes from a city centroid. What may the interface claim?',
			[
				'Exact building location',
				'Approximate city location with method/source disclosed',
				'Every office in that city is at that dot'
			],
			1,
			[
				'A centroid does not establish a street-level position.',
				'Correct. Preserve the precision distinction.',
				'One representative coordinate cannot identify every building.'
			]
		),
		check(
			'm32-q4',
			2,
			'Revenue 100 compounds at 5% for three years. What is 115.7625?',
			[
				'A conditional scenario amount under the chosen assumptions',
				'A measured model forecast error',
				'A guaranteed future revenue'
			],
			0,
			[
				'Correct. It is 100×1.05×1.05×1.05.',
				'There is no observed outcome or forecast evaluation here.',
				'The growth assumption has not been established as certain.'
			]
		),
		check(
			'm32-q5',
			3,
			'Essential caveats appear only when hovering over a chart point. What change is needed?',
			[
				'Remove the caveats',
				'Use a brighter hover color',
				'Provide keyboard/touch access and persistent or equivalent detail'
			],
			2,
			[
				'Removing meaning makes the analytical problem worse.',
				'Color does not create a usable non-hover path.',
				'Correct. Important evidence must be reachable through other interaction modes.'
			]
		),
		check(
			'm32-q6',
			4,
			'A generated narration clip predates a corrected revenue figure. What should release do?',
			[
				'Publish the new text with the old audio',
				'Regenerate and review the dependent asset, or explicitly withhold stale narration',
				'Assume a matching filename means the audio is current'
			],
			1,
			[
				'Users would receive contradictory facts through different media.',
				'Correct. Asset lineage should connect the corrected script to reviewed output.',
				'A filename without content/version verification is insufficient.'
			]
		)
	],
	assignment: {
		title: 'Design one evidence-connected analytical view',
		scenario:
			'Use fictional same-basis revenues 60, 30, 10. The third record can be filtered or marked missing. A separate directory has 100 collected, 90 valid-coordinate and 80 currently plotted records.',
		tasks: [
			'Draw a shared-scale comparison and state its denominator policy.',
			'Specify the evidence panel and a public shareable URL state.',
			'Show the missing-data and city-centroid presentation.',
			'Calculate the 100-at 5%-for-three-years scenario and label its limits.',
			'Describe keyboard, reduced-motion and audio-failure behavior.'
		],
		deliverable:
			'A desktop/narrow-screen sketch with state table, evidence IDs, calculation checks and accessibility notes.',
		rubric: [
			{
				criterion: 'Analytical integrity',
				evidence:
					'Shared scale; 60% versus 66.7% tied to explicit denominator; missing is not zero.'
			},
			{
				criterion: 'Traceability',
				evidence: 'Source and derived-input IDs survive filter, detail and export.'
			},
			{
				criterion: 'Precision and assumptions',
				evidence:
					'Directory counts distinguished; centroid approximate; 115.7625 scenario conditional.'
			},
			{
				criterion: 'Interaction completeness',
				evidence:
					'Keyboard/detail return, narrow layout, motion reduction and transcript fallback specified.'
			}
		],
		workedSolution: [
			'Use bars sharing a zero baseline and common unit. Display 60% for the full 100 universe; if recomputing after hiding Cedar, show 66.7% of selected 90.',
			'Resolve selected marks by stable observation ID, expose all denominator inputs, and validate metric/year/entity/basis URL parameters. Keep private information out of the URL.',
			'A missing Cedar value creates a gap/unknown denominator for the three-entity share. Show 80 plotted records for the current filter, 90 with valid coordinates, 100 collected; city centroids have an approximation label.',
			'The scenario is 100×1.05³=115.7625, displayed 115.8 with baseline/rate/horizon and omitted drivers. It is not a prediction interval or validated forecast.',
			'Provide keyboard activation and focus return for evidence, equivalent data/description, useful no-3D and reduced-motion states, and a transcript plus retry or silent continuation if narration fails.'
		]
	},
	interview: {
		question: 'What makes an analytical interface trustworthy rather than merely attractive?',
		strongAnswer: [
			'Its encoding matches the question: comparable values share scales, missing observations remain visible as gaps, and denominators and reporting definitions are stated. Every displayed result can open the exact inputs and transformation that produced it.',
			'I test the relationship between state and meaning after filters, errors, revisions and narrow-screen changes. Keyboard and text-equivalent paths carry the same evidence. Generated art and narration are reviewed assets; measured financial charts are rendered from validated data.'
		],
		followUps: [
			{
				question: 'Would you remove all animation?',
				answer:
					'No. A transition can explain a change when it preserves meaning. It needs a reduced-motion equivalent, readable stable state and sensible performance behavior.'
			},
			{
				question: 'How would you test a percentage chart?',
				answer:
					'Recompute its numerator/denominator independently, change the filter, and assert the amount, labels, evidence inputs and export all follow the declared denominator policy.'
			}
		]
	},
	sources: [
		{
			label: 'W3C WAI — Complex Images',
			url: 'https://www.w3.org/WAI/tutorials/images/complex/',
			note: 'Text alternatives and detailed descriptions for complex charts and diagrams.'
		},
		{
			label: 'MDN — URLSearchParams',
			url: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
			note: 'Reading and constructing URL query parameters; application validation remains required.'
		},
		{
			label: 'MDN — prefers-reduced-motion',
			url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion',
			note: 'Responding to a user’s reduced-motion preference.'
		},
		{
			label: 'W3C — PROV Model Primer',
			url: 'https://www.w3.org/TR/prov-primer/',
			note: 'Derivation links underlying evidence-connected presentation.'
		}
	]
};
