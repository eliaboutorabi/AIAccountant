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

export const m29: CourseModule = {
	id: 'M29',
	day: 6,
	title: 'Build a workbook that means what it displays',
	subtitle: 'Typed cells, merged headings, formulas, revisions, and honest exports.',
	minutes: 65,
	prerequisites: ['M28', 'M09'],
	objectives: [
		'Reconstruct header and merge relationships without duplicating observations.',
		'Assign cell types using units, locale, and business meaning while preserving originals.',
		'Recalculate formulas through dependencies and identify stale cached values.',
		'Apply reviewed edits with revision checks and export text without accidental execution.',
		'Defend workbook correctness with source-linked arithmetic and artifact tests.'
	],
	why: 'A beautiful spreadsheet can still contain text pretending to be numbers, lost account IDs, stale formulas, and invisible assumptions. A builder needs a shared data contract behind the grid, tools, and export.',
	sections: [
		s(
			'cell-types',
			'A cell has more than one value',
			'The displayed string is only one view of the record.',
			p(
				'In M28 we preserved original evidence and extraction. Now we turn extracted cells into a workbook that can be calculated, edited, and exported. A typed value records what kind of thing a cell contains: text, number, boolean, date, blank, or a formula with a computed result. The display format is separate. The number 0.15 may display as 15%; the text “15%” may look identical but behave differently in arithmetic.',
				'An account code 0012 should remain text when the zeros identify the account. Converting it to number 12 and later displaying four digits does not preserve all possible identifiers or prove that the conversion was valid. Likewise a blank can mean not reported, not applicable, or not yet extracted. Zero means an observed or deliberately established quantity of zero. If a prior-period amount is blank, a growth calculation is unavailable until its meaning is resolved; silently substituting zero creates an invented observation.',
				'A useful cell contract contains rawText, typedValue, type, unit, sourceLocation, formula if any, review status, and revision. A formatting preference belongs beside these fields rather than replacing them. Keep a table’s grain explicit: one row per account differs from one row per invoice line. A printed total is a check row, not another transaction to add. The browser grid, agent tools, and export should all read this same contract rather than each guessing what a string means.'
			),
			{
				kind: 'table',
				caption: 'Independent examples of display and meaning',
				headers: ['Source text', 'Declared meaning', 'Stored interpretation'],
				rows: [
					['0012', 'Account identifier', 'Text: 0012'],
					['(250.00)', 'USD accounting negative', 'Number: −250.00 USD'],
					['0', 'Observed amount', 'Number: 0 USD'],
					['blank', 'Prior amount not reported', 'Blank: unknown, not zero'],
					['15%', 'Rate', 'Number: 0.15 with percent display']
				]
			}
		),
		s(
			'grid',
			'Expand the grid before calculating',
			'Merged headings express relationships; covered cells are not extra amounts.',
			p(
				'Our workbench fixture has a two-row header. “Amounts · USD” spans the 2025 and 2024 columns. An account heading can span both header rows. The parser must mark a cell’s anchor and the slots covered by its row or column span. To place the next cell, advance to the next unoccupied slot. Validate that spans are positive, within limits, and non-overlapping. Otherwise a malformed table can shift every amount into the wrong year while still looking orderly.',
				'Flattening headers means turning their hierarchy into unambiguous column identities such as amount_2025_USD and amount_2024_USD. Retain the original header structure as evidence. Do not paste a merged total into every covered cell and then sum those copies. Where a multi-page statement repeats its heading, remove the repeated heading from the body only after confirming that the following rows belong to the same table, period, and units.',
				'The model can propose which rows form the header and which table continues another. Deterministic code should expand spans and validate coordinates. Keeping these tasks separate makes a failure diagnosable: a valid rectangular grid with a wrongly chosen year heading is a semantic error, while an overlapping span is a structural error. Both need tests. “The JSON parsed” proves neither.'
			),
			{
				kind: 'reflection',
				prompt:
					'A merged heading says “USD thousands.” The cell text is 1,200. Should the model replace it with 1,200,000 immediately?',
				guidance:
					'Separate the observed number, reporting unit, and a requested standardized measure.',
				modelAnswer:
					'Preserve source value 1,200 and unit USD thousands. If a standardized USD measure is needed, derive 1,200,000 with an explicit conversion and provenance. Do not erase the source representation or apply the scale twice.'
			}
		),
		s(
			'typing',
			'Interpret separators with an explicit convention',
			'Parsing is a decision about meaning, not just deleting punctuation.',
			p(
				'Under a declared convention using commas for thousands and a point for decimals, “1,200.00” is twelve hundred. Under a convention using a comma as the decimal separator, “1.200,00” represents the same amount. A lone “1,200” is ambiguous across conventions. Choose a number convention from source evidence, show it to the reviewer, and leave unresolved values as text or errors. Removing every comma may turn 1,20 into 120 when the source meant 1.20.',
				'Accounting parentheses often indicate a negative amount, such as (250.00). That does not imply every parenthetical string is a number; “(estimate)” is text. Dates need similarly explicit handling: 03/04/2025 could mean March 4 or April 3. Preserve ambiguous dates rather than inventing precision. Parsing rules should reject unexpected trailing characters and preserve the original so a reviewer can reverse the decision.',
				'For the workbench’s 2025 column, the authored extraction contains 1,200.00, (250.00), an explicit 0, and a fee of 60.00. The independently displayed source fee is 50.00 and printed total is 1,000.00. The extracted arithmetic is 1,200 − 250 + 0 + 60 =1,010, a USD 10 discrepancy. Review the fee source before correcting it to 50. Then the sum is 1,000. A blank in the prior-year column remains unknown; fixing the current-year discrepancy does not justify filling it.',
				'Store currency calculations in a representation appropriate to the required precision. Integer minor units work for this USD cents fixture:1,200.00 becomes 120,000 cents and (250.00) becomes−25,000 cents. Other tasks need explicit decimal precision, currencies, rounding policies, or rates. Do not assume every currency has two decimals or that rounding each line always equals rounding an aggregate. State the convention and test boundary amounts.'
			)
		),
		s(
			'formulas',
			'A formula is a dependency, not a painted number',
			'Changing an input must invalidate every result that depends on it.',
			p(
				'A formula such as =SUM(B3:B6) is an instruction to calculate from referenced cells. Its cached value is a previously calculated result stored for display or file compatibility. A workbook can therefore contain a correct formula and an outdated cached number. Some spreadsheet-writing libraries store formulas without evaluating them. A recalculation flag asks compatible software to recalculate later; it does not prove the current preview or downloaded file already contains current results.',
				'Represent formula dependencies as a directed graph: an arrow from B3 to B7 means B7 depends on B3. Calculate prerequisite cells before dependent cells. If B7 depends on B8 and B8 depends on B7, there is a cycle. Reject or explicitly support a documented iterative method; do not display an old value as a fresh calculation. Three arbitrary recalculation passes cannot guarantee correctness for a longer chain.',
				'Suppose B3 = 100, B4=B3 × 2, and B5=B4 + 10. The results are 200 and 210. Changing B3 to 120 requires B4 = 240 and B5 = 250. Updating B4 alone leaves B5 stale at 210. A dependency-aware evaluator invalidates both, calculates in order, and records errors rather than quietly keeping previous values. This is the same principle as updating a financial schedule after changing a driver: every linked schedule must use the revised driver.',
				'An application formula engine may support only a subset of Excel functions. Publish that subset and reject unsupported functions. Do not use JavaScript eval to interpret spreadsheet formulas. A parser can recognize allowed operators, cell references, and functions while enforcing bounds. This also separates a legitimate formula supplied through a trusted formula control from untrusted text that merely begins with an equals sign.'
			)
		),
		s(
			'revisions',
			'Reconcile edits, calculations, and exports',
			'The latest visible workbook and the agent’s saved copy must agree.',
			p(
				'A reviewer corrects the fee in workbook revision 8. An agent still holds revision 7 and submits an update. Without a revision check, its old copy can overwrite the correction. Require expectedRevision with a mutation and compare it atomically with the authoritative current revision before committing. On conflict, reload, explain the intervening edit, and recompute or request review. Checking a revision and writing later as separate unprotected operations leaves a race.',
				'The original text remains 60.00, while a correction event records 50.00, source evidence, reason, actor, and new revision. Recalculate dependent formulas and checks after the accepted edit. If a task checkpoint contains a workbook snapshot, either refresh it from the authoritative artifact or reject stale mutations. Two stores named “workbook” do not synchronize themselves. The next chapter applies this rule to tool execution and recovery.',
				'Exports are part of the product contract. Typed JSON can preserve fields and provenance; a plain TSV or CSV carries rows of text and cannot preserve merges, multiple sheets, formula semantics, and rich comments as a full workbook does. A real XLSX exporter must deliberately write types, formulas, cached results, merges, and formatting. Test the exported artifact by reopening it, rather than assuming a successful download means a correct workbook.',
				'Spreadsheet software may interpret untrusted text beginning with characters such as = as a formula when importing CSV or TSV. A supplier description can therefore become executable spreadsheet content if the exporter treats it like a trusted formula. Use an explicit export policy that preserves such values as text, covers separators and quoting, and is tested in the intended importer. Keep original evidence unchanged; escaping belongs in the exported representation. Deliberately created formulas should travel through a separate validated path.'
			),
			{
				kind: 'lab',
				id: 'document-structure',
				title: 'Typed workbook and correction exercise',
				task: 'Use the workbench’s number convention and compare raw versus typed cells. Explain the 2025 discrepancy from 1,200.00, (250.00),0, and the extracted 60.00 fee against printed 1,000.00. Inspect source 50.00, apply a justified fee correction, then export. Leave the prior-year blank unresolved unless evidence establishes its meaning.',
				prediction:
					'Before changing anything, predict the USD 10 discrepancy, the corrected sum, and which source fields should remain unchanged.',
				evidence: [
					'Account 0012 remains a text identifier.',
					'The correction changes the interpreted fee and total check while preserving the original 60.00.',
					'The export identifies the chosen convention, correction reason, and unresolved blank.'
				],
				limitation:
					'Local typing and arithmetic operate on authored extraction fixtures. The downloaded formats are those named by the workbench; a text export is not a full Excel workbook, and this lab does not call OCR.'
			}
		)
	],
	checks: [
		q(
			'M29-Q1',
			0,
			'A heading spans both 2025 and 2024 columns. Which representation avoids duplication?',
			[
				'Two independent financial values to sum',
				'Discard the heading because it is merged',
				'One anchor with covered slots and header links'
			],
			2,
			[
				'A repeated label or total is not another transaction.',
				'The heading may carry the currency and scale needed to interpret both columns.',
				'Correct: structure preserves the shared meaning without creating extra observations.'
			]
		),
		q(
			'M29-Q2',
			1,
			'An account ID 0012 and an unreported amount are imported. Which typing is justified?',
			[
				'Number 12 and zero',
				'Text 0012 and an explicit blank/unknown',
				'Both numeric because spreadsheets prefer numbers'
			],
			1,
			[
				'This loses identifier information and invents a zero observation.',
				'Correct: types follow business meaning, not appearance.',
				'A spreadsheet can contain several valid cell types; arithmetic convenience is not evidence.'
			]
		),
		q(
			'M29-Q3',
			1,
			'The declared USD fixture contains 1,200.00, (250.00),0,60.00; printed total 1,000.00. What is the discrepancy?',
			['+10 USD', '+500 USD', '−490 USD'],
			0,
			[
				'Correct:1,200 − 250 + 0 + 60 = 1,010; calculated minus printed is +10.',
				'This does not follow the fixture’s signed arithmetic.',
				'Parentheses mean a negative 250, not a second deduction of 1,200.'
			]
		),
		q(
			'M29-Q4',
			2,
			'B3 changes 100 → 120; B4=B3 × 2; B5=B4 + 10. What should fresh results be?',
			['B4=240,B5=210', 'B4=240,B5=250', 'B4 = 200, B5 = 210 because formulas did not change'],
			1,
			[
				'B5 is stale even though its formula text is unchanged.',
				'Correct: invalidate the whole downstream chain and calculate dependencies in order.',
				'A formula result depends on inputs, not only its own text.'
			]
		),
		q(
			'M29-Q5',
			3,
			'The agent requests an edit against revision 7, but a reviewer has committed revision 8. What is the correct next step?',
			[
				'Hide the reviewer correction from the agent',
				'Overwrite 8 because the agent started first',
				'Reject the stale mutation and reload/reconcile against 8'
			],
			2,
			[
				'Keeping the agent ignorant increases repeated conflicts and incorrect calculations.',
				'Start order does not grant authority to overwrite newer evidence.',
				'Correct: enforce the revision at the authoritative write boundary.'
			]
		),
		q(
			'M29-Q6',
			4,
			'A downloaded TSV opens successfully. What does this establish?',
			[
				'A file was produced; content, escaping, and supported semantics still need verification',
				'The source evidence is now unnecessary',
				'Its formulas, merges, and types match Excel exactly'
			],
			0,
			[
				'Correct: artifact verification is separate from transport success.',
				'Export does not replace original evidence or correction history.',
				'TSV cannot itself preserve all workbook semantics.'
			]
		)
	],
	assignment: {
		title: 'Specify a reviewable typed workbook',
		scenario:
			'Build a contract for account 0012, current amounts 1,200.00/(250.00)/0/60.00, a prior-period blank, a merged USD heading, and printed total 1,000.00. Source inspection establishes fee 50.00. A stale agent attempts to edit after the reviewer.',
		tasks: [
			'Define raw, typed, display, source, review, formula, and revision fields.',
			'Calculate before/after totals and preserve the correction event.',
			'Draw a formula dependency chain and describe invalidation.',
			'Specify stale-edit rejection and text-safe export tests.'
		],
		deliverable:
			'One typed example row, a correction record, a dependency diagram, and four expected test outcomes.',
		rubric: [
			{
				criterion: 'Typing',
				evidence: '0012 is text; blank is unknown; negative sign and USD units are explicit.'
			},
			{
				criterion: 'Arithmetic',
				evidence: '1,010 before,1,000 after,10 discrepancy; printed total excluded from the sum.'
			},
			{
				criterion: 'State',
				evidence: 'Authoritative revision comparison prevents stale overwrite.'
			},
			{
				criterion: 'Export',
				evidence: 'A hostile text prefix remains text and file semantics are honestly described.'
			}
		],
		workedSolution: [
			'A fee cell preserves rawText 60.00, extracted numeric 6000 cents, reviewed numeric 5000 cents, USD unit, source page/box/version, reviewer/reason, and revision 8. The original record is retained.',
			'Sum 120000 − 25000 + 0 + 6000 = 101000 cents; discrepancy 1000 cents. Reviewed sum 100000 cents equals printed 100000. The prior blank remains unknown.',
			'The total depends on all four inputs; any downstream variance depends on the total. Invalidate both after the accepted correction, then evaluate in dependency order.',
			'Reject expectedRevision 7 against current 8. Reopen exported JSON/TSV under the documented contract; test quoted separators and a description beginning= without turning it into a formula. A full XLSX test would additionally verify merges, types, and cached formula values.'
		]
	},
	interview: {
		question: 'What makes a document-to-spreadsheet application more than an OCR table?',
		strongAnswer: [
			'It builds a typed, source-linked artifact: header relationships, units, identifier types, missing values, and original text survive interpretation. Corrections are reviewed events with revisions.',
			'Formulas have explicit dependencies and errors; cached values are not assumed current. Tools and direct edits share an authoritative version so a stale agent cannot overwrite a reviewer.',
			'The exported file is tested under its promised semantics. I separate untrusted text from allowed formulas and keep discrepancies visible rather than changing evidence to make totals match.'
		],
		followUps: [
			{
				question: 'Could a model choose a wrong locale even when code parses correctly?',
				answer:
					'Yes. Parsing a declared convention correctly does not prove that convention matches the source. Preserve raw text, show the convention, and validate representative fields and totals against reviewed evidence.'
			},
			{
				question: 'Why not recalculate three times?',
				answer:
					'A fixed pass count does not cover arbitrary dependency depth or cycles. Use a dependency graph with invalidation and cycle detection, or explicitly document and test a supported iterative calculation policy.'
			}
		]
	},
	sources: [
		{
			label: 'HTML table slots and spans',
			url: 'https://html.spec.whatwg.org/multipage/tables.html#processing-model-1'
		},
		{
			label: 'Microsoft Open XML: working with formulas',
			url: 'https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/working-with-formulas',
			note: 'Formula expressions and stored calculated values are distinct parts of an artifact.'
		},
		{
			label: 'OWASP CSV injection',
			url: 'https://owasp.org/www-community/attacks/CSV_Injection',
			note: 'Treat spreadsheet import behavior as part of the export security boundary.'
		}
	]
};
