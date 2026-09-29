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

export const m28: CourseModule = {
	id: 'M28',
	day: 6,
	title: 'Turn documents into source-linked evidence',
	subtitle: 'Read the page, preserve its structure, and show exactly where each value came from.',
	minutes: 75,
	prerequisites: ['M15', 'M27'],
	objectives: [
		'Separate original files, extraction, interpretation, and reviewed values.',
		'Choose native text, OCR, or vision-language processing for each page and retain layout evidence.',
		'Transform bounding boxes and match quotes without inventing source precision.',
		'Use confidence and reconciliation to prioritize review without confusing them with proof.',
		'Specify and test a document-to-structure pipeline with partial failures.'
	],
	why: 'A finance application cannot defend a number merely because it appears in a polished table. Its builder must preserve the route from the original page through extraction and correction to the number being used.',
	sections: [
		s(
			'evidence-layers',
			'One document, four different records',
			'Keep what the source says separate from what software thinks it says.',
			p(
				'Imagine Willow receives a supplier statement showing two charges, USD 120 and USD 100, with a printed total of USD 220. An extraction system reads the second charge as 1,000. A language model writes a confident explanation of a USD 1,120 balance. The explanation is fluent, and its arithmetic is consistent with its input. The failure occurred earlier: an observation of the page became an unexamined fact.',
				'Preserve four layers. The original is the uploaded file with an immutable identity and version. The extraction is the text, cells, page numbers, and boxes produced by a particular reader or model. The interpretation assigns meaning: this column is USD, this row is an invoice rather than a subtotal, and this value belongs to September. A reviewed value records an accepted correction with who changed it, why, and which evidence supported it. A correction should create a new revision rather than rewrite the original evidence.',
				'A hash is a compact fingerprint of file bytes. It can help detect that the same file was processed again or that a file changed; it does not certify authenticity, approval, or truth. Store a stable document ID as well as the hash, extraction configuration, timestamp, and source page. An auditor must be able to distinguish “same supplier” from “same file version.”'
			),
			{
				kind: 'worked',
				title: 'A correct sum of incorrect observations',
				problem: 'The source shows 120 + 100 = 220 USD. Extracted cells contain 120 and 1,000.',
				steps: [
					'Compute the extracted sum: 120 + 1,000 = 1,120 USD.',
					'Compare with the independently preserved printed total: 1,120 − 220 = 900 USD discrepancy.',
					'Open the source region for the second charge. If review establishes 100, record raw text 1,000, corrected value 100, source location, reviewer, and reason.',
					'Recalculate: 120 + 100 = 220. Keep the earlier discrepancy and correction in the trace.'
				],
				conclusion:
					'Reconciliation found an inconsistency. Inspecting source evidence justified this particular correction; subtracting 900 blindly would not.'
			}
		),
		s(
			'readers',
			'Choose the reader page by page',
			'PDF is a container, not a guarantee of readable text.',
			p(
				'A native PDF text layer stores character information and positioning instructions. PDF.js can extract those characters without asking a model to recognize their appearance. A scan may contain only an image of the page. Optical character recognition, or OCR, estimates characters from pixels. A vision-language model, or VLM, accepts images and language and can answer questions about layout or content. Some modern document systems combine these capabilities, so inspect the actual output contract rather than treating the product label as a complete architecture.',
				'Use native text when it is usable, and inspect reading order and missing characters. Use OCR for image-only or poor-text regions. A VLM can help interpret an unusual form or connect a footnote to a table, but its answer still needs source evidence and validation. Sending an image to a capable model does not guarantee exact cents, complete rows, or faithful punctuation. Compare performance on representative documents with reviewed answers; do not assume the most expensive model is the best reader for every page.',
				'A three-page PDF may contain a native-text cover, a scanned invoice, and a rotated attachment. A whole-file rule saying “some text exists, skip OCR” silently loses the invoice. Track each page as pending, extracted, failed, or review-needed, with its extraction method. Retry only the failed page range and retain earlier successful output. Show “2 of 3 pages processed” rather than an unqualified ready badge. A partial artifact can be useful if its missing scope is explicit.',
				'Upload acceptance must precede extraction success. If the application rejects every PDF with no native text, its later OCR fallback is unreachable for precisely the scans it should handle. Validate size and permitted file formats, preserve the original, then choose a reader. A MIME type is a declared content format, such as application/pdf. File extensions and declared MIME types are clues; a deployed service should also validate content and bound processing resources. A browser preview and a server extractor must agree on the same file version.'
			)
		),
		s(
			'layout',
			'Recover relationships, not only words',
			'A number needs its row, column, heading, unit, and page.',
			p(
				'Consider a table whose first heading is Account and spans two rows. A second heading, Amounts in USD, spans two columns; beneath it are Current and Prior. Reading left to right as one string loses the fact that both year columns share the currency. A rowspan covers several grid rows; a colspan covers several grid columns. Store one anchor cell carrying the content and explicit covered positions. Copying the heading into every covered slot may be useful for a flattened export, but those copies must not become duplicate financial observations.',
				'Layout reconstruction places each cell in the next unoccupied grid position and reserves its span. Reject overlapping spans and unreasonable dimensions rather than shifting cells until the result looks rectangular. Next, infer header relationships and distinguish body rows, repeated continuation headers, subtotals, and footnotes. Those are interpretation decisions. A deterministic span-expansion function can be perfectly implemented while a model chooses the wrong header rows.',
				'When a table continues onto another page, matching column count is insufficient. Check header meaning, units, reporting period, and whether a carried-forward total is being repeated. Keep page-local source coordinates even after rows are combined in one workbook. If a model proposes joining two tables, show the proposal and evidence; code should validate the resulting structure. The next chapter turns that structure into typed cells with reproducible formulas.'
			)
		),
		s(
			'geometry',
			'Make a highlight land on the evidence',
			'Coordinates have a unit, an origin, and a transformation.',
			p(
				'A bounding box describes a rectangle around source content. It might use pixels, PDF points, or normalized coordinates between zero and one. Normalization divides horizontal positions by page width and vertical positions by page height, making the stored location independent of display size. It does not fix an incorrect page, rotation, crop, or coordinate origin. Store those assumptions beside the box.',
				'Suppose a page is 600 units wide and 800 high. For this simplified unrotated example, a text run starts at x=60 with baseline y=700 in bottom-origin coordinates and height 12. Its top edge is 800 − 700 − 12 = 88. At half-size display, x becomes 30, top becomes 44, and height becomes 6. The normalized top is 88/800 = 0.11. Real PDF transforms can include rotation and font transformations; a renderer’s viewport transform is safer than applying this shortcut universally.',
				'Quote matching answers “where is this text?” rather than “is this claim true?” Start with exact text, then explicitly permitted normalization such as repeated whitespace or typographic quotation marks. Preserve an offset map back to the original text. Over-aggressive normalization can turn distinct amounts or identifiers into the same string. If “Total 220” appears twice, page and surrounding text must disambiguate; otherwise report multiple candidates. Never draw the closest-looking highlight and silently label it exact.'
			),
			{
				kind: 'reflection',
				prompt:
					'A correct quote is highlighted on page 2 of revision A, but the viewer now displays revision B. What should happen?',
				guidance: 'Think about what the stored coordinates actually identify.',
				modelAnswer:
					'Invalidate or re-resolve the highlight against revision B. A document ID without version identity is insufficient. Retain the old location with revision A rather than pretending coordinates transfer automatically.'
			}
		),
		s(
			'confidence',
			'Use uncertainty to organize work',
			'A recognition score is not the probability that an accounting conclusion is correct.',
			p(
				'OCR confidence may describe a character, word, block, or page aggregate. A high average can conceal one badly recognized decimal point. A low score can direct review to a difficult region, but its numerical meaning depends on the provider and task. A language model saying “95% confident” is another signal, not automatically a calibrated probability. Calibration requires comparing scores with reviewed outcomes on comparable data.',
				'For a calibration test, suppose a score is intended to estimate the probability of exact cell transcription. If 200 cells assigned probabilities near 90% contain only 150 exactly correct transcriptions, observed accuracy is 75% for that group: overconfidence in this sample. If the provider score is only a ranking signal, this probability interpretation is not justified without further evidence. Even 100% exact transcription would not establish the correct period, currency, account classification, or approval. Evaluate those separately. Keep a held-out set when selecting review thresholds so a rule does not merely fit examples used to invent it.',
				'Prioritize review using both uncertainty and consequence. A smudged supplier phone number and a smudged payment amount may have similar recognition scores but different business impact. Reconciliation, valid identifier patterns, period checks, and totals are additional evidence. They can miss offsetting errors: reading 120 as 130 and 100 as 90 still totals 220. Agreement is one check, not complete validation. A clear interface shows unresolved cells and missing pages before inviting reliance on a polished summary.'
			),
			{
				kind: 'lab',
				id: 'document-structure',
				title: 'Document structure workbench',
				task: 'Inspect the authored document fixture and its structured cells. Identify merged headings, grid-cell anchors, and raw versus interpreted values. The anchors locate cells in the authored table; PDF page boxes are a separate written exercise above. Change one supported interpretation or correction, then inspect the total check and exported evidence. Explain which source region justifies your choice.',
				prediction:
					'Predict which cells can change calculation without changing the original extraction, and which discrepancy a wrong numeric interpretation will create.',
				evidence: [
					'Record the original text, typed value, source identity, and correction separately.',
					'Explain one header/span relationship and one blank-versus-zero decision.',
					'Export the actual result and state any unsupported or missing source evidence.'
				],
				limitation:
					'This workbench computes over authored OCR/table fixtures with cell anchors. It does not run OCR, draw real PDF bounding boxes, measure provider accuracy, or establish that an uploaded real document is correct.'
			}
		)
	],
	checks: [
		q(
			'M28-Q1',
			0,
			'The extracted second line is 1,000; source review establishes 100. Which record best preserves evidence?',
			[
				'Retain raw extraction, add reviewed value 100 and its source/reviewer/reason',
				'Change the printed total to 1,120',
				'Replace the source file with a corrected PDF'
			],
			0,
			[
				'Correct: interpretation changes while the original observation and justification remain inspectable.',
				'A computed mismatch does not authorize changing the source total.',
				'The original is evidence; rewriting it erases what was received.'
			]
		),
		q(
			'M28-Q2',
			1,
			'Page 1 has native text; page 2 is a scan. What is the appropriate fallback boundary?',
			[
				'Discard page 1 and assume OCR will be perfect',
				'Skip OCR because the PDF has text',
				'OCR page 2 and preserve method/status for both pages'
			],
			2,
			[
				'OCR can fail and needlessly replaces useful evidence without a reason.',
				'A whole-file any-text rule loses the scanned page.',
				'Correct: extraction decisions and completeness belong at page or region level.'
			]
		),
		q(
			'M28-Q3',
			2,
			'In the stated unrotated example, page height is 800, baseline 700, run height 12, display scale 0.5. What is the displayed top?',
			['50', '44', '350'],
			1,
			[
				'This ignores the run height: the baseline is not the top edge.',
				'Correct: (800 − 700 − 12) × 0.5 = 44.',
				'This scales the original bottom-origin baseline without changing origin.'
			]
		),
		q(
			'M28-Q4',
			2,
			'An exact normalized quote appears twice on a page. What should matching return?',
			[
				'Two candidates or a disambiguation requirement',
				'A new sentence that combines both occurrences',
				'The first occurrence with certainty'
			],
			0,
			[
				'Correct: exact text does not necessarily identify a unique location.',
				'Changing the quote would manufacture evidence rather than locate it.',
				'First occurrence is an arbitrary choice unless additional evidence selects it.'
			]
		),
		q(
			'M28-Q5',
			3,
			'Of 200 cells assigned predicted probabilities near 90% for exact transcription, 150 are exactly correct. Which conclusion is supported?',
			[
				'The financial report is 75% correct',
				'The confidence threshold should always be 75%',
				'Accuracy in this reviewed group is 75%; the score is overconfident here'
			],
			2,
			[
				'Cell recognition is not report-level accounting correctness.',
				'A threshold also needs impact, review capacity, and held-out evaluation; it is not set by this fraction alone.',
				'Correct: 150/200 = 75%, measured against this exact-transcription criterion.'
			]
		),
		q(
			'M28-Q6',
			4,
			'A pipeline returns two extracted pages and one failed page. Which artifact status is defensible?',
			[
				'Complete because the available pages balance',
				'Partial, with page identities, failure, and targeted retry recorded',
				'Empty, deleting both successful pages'
			],
			1,
			[
				'Balanced available content does not establish completeness.',
				'Correct: preserve useful results while making missing scope and recovery explicit.',
				'Deleting good evidence creates avoidable work and can hide what succeeded.'
			]
		)
	],
	assignment: {
		title: 'Design a document evidence contract',
		scenario:
			'A three-page supplier statement has native text on pages 1 and 3, a scanned table on page 2, a repeated Total 220 quote, and extracted line values 120 and 1,000 against printed total 220 USD.',
		tasks: [
			'Draw the page-by-page extraction decisions and four evidence layers.',
			'Calculate the discrepancy and describe the review needed before correction.',
			'Specify a source location record that remains meaningful after display resizing.',
			'Give four tests: mixed pages, duplicate quote, changed source revision, and offsetting numeric errors.'
		],
		deliverable:
			'A one-page pipeline diagram, one example evidence record, and four test cases with expected outcomes.',
		rubric: [
			{
				criterion: 'Completeness',
				evidence:
					'All three pages have method and status; scan acceptance is independent of native-text success.'
			},
			{
				criterion: 'Lineage',
				evidence:
					'Raw 1,000 is preserved beside reviewed 100 with source version, page, box, and reason.'
			},
			{
				criterion: 'Verification',
				evidence: '900 discrepancy is correct; matching totals are not treated as proof.'
			},
			{
				criterion: 'Geometry',
				evidence: 'Coordinate units/origin and duplicate-location ambiguity are explicit.'
			}
		],
		workedSolution: [
			'Preserve original S-17 version 1; use native text for pages 1 and 3 and OCR for page 2. Keep a failed page 2 as partial rather than complete.',
			'Extracted sum is 1,120 and discrepancy is 900 USD. Open the second line’s source box before accepting 100; the amount of the mismatch alone is insufficient evidence.',
			'Record document S-17, version 1, page 2, coordinate space, page dimensions, box, quote, extraction method/version, raw text, typed value, and review event. Resize through an explicit transform.',
			'Duplicate quotes must remain ambiguous until context selects one; version 2 invalidates version 1 coordinates; 130 + 90 matching 220 must still fail exact-cell comparison when the source is 120 + 100.'
		]
	},
	interview: {
		question: 'How would you build reliable financial extraction from PDFs?',
		strongAnswer: [
			'I preserve the original, then choose native text or OCR per page and keep layout, units, versions, and completeness in the extraction contract. A VLM can help interpret structure, but its output remains a proposal.',
			'I separate raw text from typed and reviewed values, transform coordinates into the viewer correctly, and treat ambiguous quote matches explicitly. Confidence prioritizes review; it does not certify accounting correctness.',
			'I combine source inspection, exact-cell tests, totals, period and unit checks, then export provenance and unresolved exceptions. I test mixed PDFs and partial failures before claiming end-to-end support.'
		],
		followUps: [
			{
				question: 'Why not trust a balanced total?',
				answer:
					'Two cell errors can offset, the total may include the wrong period, and missing rows may be absent from both sides. Balance is one invariant, not a complete ground truth.'
			},
			{
				question: 'What if your OCR provider changes its output?',
				answer:
					'Version the adapter and validate response schemas, retain raw response/configuration for reproducibility, test representative fixtures, and re-evaluate extraction and review thresholds before adopting the change.'
			}
		]
	},
	sources: [
		{
			label: 'PDF.js examples: page viewports and rendering',
			url: 'https://mozilla.github.io/pdf.js/examples/',
			note: 'Primary documentation for PDF rendering; the numerical coordinate case here is an authored simplified example.'
		},
		{
			label: 'Mistral document OCR: tables, blocks, and confidence',
			url: 'https://docs.mistral.ai/studio/document-processing/basic_ocr',
			note: 'Provider-specific output fields vary by model and configuration; check the current contract.'
		},
		{
			label: 'HTML table model',
			url: 'https://html.spec.whatwg.org/multipage/tables.html#processing-model-1',
			note: 'Primary specification for table slots and row/column spans.'
		}
	]
};
