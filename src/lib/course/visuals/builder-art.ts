import type { TeachingVisual } from './types';
const art = (
	module: string,
	section: string,
	slug: string,
	title: string,
	lead: string,
	takeaway: string,
	question: string,
	answer: string,
	rows: [string, string][]
): TeachingVisual => ({
	id: `${slug}-art`,
	module,
	section,
	title,
	lead,
	kind: 'art',
	image: `/images/visuals/${slug}.webp`,
	width: 1536,
	height: 1024,
	alt: `${title}. ${rows.map(([label, explanation]) => `${label}: ${explanation}`).join(' ')}`,
	takeaway,
	question,
	answer,
	sourceNote:
		'Original generated conceptual illustration. The accompanying lesson and executable workbench define the exact behavior; decorative objects are not measured model outputs.',
	transcript: rows.map(([label, explanation]) => ({ label, explanation }))
});
export const builderArt: TeachingVisual[] = [
	art(
		'M26',
		'request-journey',
		'm26-behind-button',
		'Behind one button',
		'Trace a saved-document request across the parts a user cannot see.',
		'A button initiates a request. Trusted code must decide whether the requested state change is valid.',
		'The screen says Saving, then the connection drops. Has the document definitely been lost?',
		'No. The server may have stored it before the response was lost. Reconcile by request identity and authoritative state instead of inferring the result from the missing message.',
		[
			[
				'Browser · request',
				'The interface gathers input and sends a request. It cannot establish that the server accepted or stored it.'
			],
			[
				'Server · validate',
				'Application code checks the input, the caller and the allowed operation. This plate follows one saved-document request; not every API call writes data.'
			],
			[
				'Storage · remember',
				'Persisted state can outlive an individual network connection. The application must return and later reconcile the actual outcome.'
			]
		]
	),
	art(
		'M27',
		'roles',
		'm27-model-team',
		'Different jobs, different engines',
		'A useful AI application can combine learned models with ordinary deterministic programs.',
		'Choose components by the job and measured evidence, not by treating every step as a language task.',
		'If one model can see a document and explain it, why retain a separate calculation tool?',
		'Interpretation and exact arithmetic have different failure modes. Validated inputs can be calculated reproducibly by code while the model helps interpret the task; the complete pipeline still needs evaluation.',
		[
			[
				'Read the page',
				'Document reading may use native text extraction, OCR or a vision model, depending on the evidence and required structure.'
			],
			[
				'Interpret the task',
				'A language model uses supplied context to generate an interpretation or action proposal. That is separate from executing it.'
			],
			[
				'Calculate exactly',
				'A deterministic tool calculates under a declared number representation and validated input contract.'
			],
			[
				'Speak and listen',
				'Audio input/output has its own latency, transport, context and interruption requirements.'
			]
		]
	),
	art(
		'M28',
		'evidence-layers',
		'm28-document-layers',
		'A page has more than words',
		'Text, coordinates and typed values answer different questions about the same document.',
		'Retain a route back from every interpreted value to its original page evidence.',
		'A value is correctly recognized but attached to the neighboring column. Is this an OCR success?',
		'Character recognition may have succeeded, but the extraction pipeline failed to preserve structure. Evaluate field assignment, table geometry and downstream meaning in addition to text accuracy.',
		[
			[
				'Source pixels',
				'The source image remains evidence. A selectable PDF can also provide native text and geometry.'
			],
			[
				'Layout and boxes',
				'Locations and reading order connect content to its page region. Transform coordinates consistently when scaling, cropping or rotating.'
			],
			[
				'Typed records',
				'The application turns source content into fields with declared meanings. These layers are conceptual; interpretation is not automatically verified by a clean layout.'
			]
		]
	),
	art(
		'M29',
		'cell-types',
		'm29-value-type',
		'Same characters, different meaning',
		'A spreadsheet cell carries a type and a meaning, not just a sequence of visible characters.',
		'Keep identifiers, negative amounts, known zeros and missing values distinct.',
		'What is lost if a generic number parser turns account 0012 into 12 and replaces the empty payment date with zero?',
		'It changes the identifier and invents a value for missing evidence. The typed schema must govern interpretation, preserve original text and make unresolved fields explicit.',
		[
			[
				'0012 · identifier',
				'Leading zeros may be part of the account identity. Preserve the text when the schema defines an identifier.'
			],
			[
				'(120) · negative amount',
				'Under the stated accounting convention, parentheses represent a negative amount. Locale and field type must be explicit.'
			],
			['0 · known zero', 'Zero is an observed or calculated numeric value.'],
			[
				'Empty · missing value',
				'Missing evidence remains missing. It is not automatically numeric zero or an empty string with known meaning.'
			]
		]
	),
	art(
		'M30',
		'loop',
		'm30-agent-boundary',
		'A proposal is not an action',
		'The model, the runtime and the executable tool have different responsibilities.',
		'A valid-looking request still needs an authorized dispatcher and an observed result.',
		'The model outputs a perfectly valid payment JSON object. Which stage is still missing?',
		'Execution authorization, validated current state, actual tool execution and outcome reconciliation. JSON conformance alone establishes neither permission nor a completed payment.',
		[
			['Model proposes', 'The model produces an action request using its available context.'],
			[
				'Harness checks',
				'The surrounding runtime validates the contract, run identity, permissions and limits before dispatching a capability.'
			],
			[
				'Tool executes',
				'Trusted application code performs an allowed operation and returns its actual result. The plate separates roles; the lesson traces how a correlated result returns to the model context.'
			]
		]
	),
	art(
		'M31',
		'observation-model',
		'm31-evidence-record',
		'A number needs its history',
		'Period, source, scope and version make an observation interpretable.',
		'Preserve lineage when a source revises a reported amount.',
		'A new report replaces last year’s number on a changed business perimeter. Should a stored observation be silently overwritten?',
		'Keep the original and revised observations with their source/version relationship. Use comparable definitions for the requested calculation and state which version was selected.',
		[
			[
				'120 · USD millions',
				'The amount and unit are separate attributes. The value is an illustrative observation, not a disclosed fact about a real organization.'
			],
			[
				'Period and source',
				'Record the observation period, source identity and locator needed to inspect the evidence.'
			],
			[
				'Scope and version',
				'Business perimeter and revisions can change a comparison even when the entity and metric names look identical.'
			]
		]
	),
	art(
		'M32',
		'encoding',
		'm32-honest-scale',
		'Make comparisons fair',
		'Visual clarity starts with the comparison contract.',
		'Shared scales and declared denominators help the reader assess a comparison.',
		'One chart compares headcount; the other compares full-time equivalents. Do identical bar heights establish equal workforce size?',
		'No. The metric definitions differ. Align or explicitly distinguish definitions before selecting an encoding. A clean chart cannot repair an invalid analytical comparison.',
		[
			[
				'Same baseline',
				'The schematic bars share a visible zero baseline. They are not measured company data; their purpose is to show an honest common scale.'
			],
			[
				'Same definition',
				'Matching vessels illustrate a declared comparison basis. Equal-looking shapes do not prove the underlying definitions are equivalent.'
			],
			[
				'Declared denominator',
				'A share needs a named population and coverage. Missing observations must not silently become zeros or market-wide totals.'
			]
		]
	),
	art(
		'M33',
		'audio-pipeline',
		'm33-heard-context',
		'Generated is not always heard',
		'A voice session has both generation state and delivery state.',
		'After interruption, reconcile the heard audio, conversation state and outstanding tool work.',
		'Ten seconds have been generated but only three heard. Can the next turn assume the user heard the entire answer?',
		'No. Playback progress and transcript/context must be reconciled according to the transport. A late tool result still belongs to its original run and may need discarding or separate effect reconciliation.',
		[
			[
				'Heard',
				'The sage portion represents audio delivered to the listener. The proportions are conceptual, not timing measurements.'
			],
			[
				'Not yet heard',
				'Generated or buffered audio can remain unheard when an interruption occurs.'
			],
			[
				'Conversation context',
				'Keep the model’s next-turn context consistent with delivered content and the state of outstanding operations. Stopping sound does not undo an external action.'
			]
		]
	),
	art(
		'M34',
		'boundaries',
		'm34-runtime-boundaries',
		'Every boundary has a job',
		'Separate presentation, execution authority and durable state.',
		'A full application needs enforceable boundaries around identity, ownership and recovery.',
		'A browser bundles a long-lived service key but hides the settings screen. Is the key protected?',
		'No. Browser-delivered assets and requests can be inspected by their user. Keep long-lived application secrets in a trusted server boundary; short-lived client credentials and bring-your-own-key designs require explicit threat and scope choices.',
		[
			[
				'User interface · ask',
				'The browser displays state and submits requests. A disabled button is not authorization.'
			],
			[
				'Application server · authorize',
				'The key appears only inside the server compartment in this conceptual server-backed design. Validate identity, ownership and operation permissions.'
			],
			[
				'Database · persist',
				'Durable records support recovery and auditing, but persistence alone does not enforce correct access or exactly-once effects.'
			]
		]
	),
	art(
		'M35',
		'specify',
		'm35-builder-evidence',
		'Build it. Test it. Explain it.',
		'Coding assistance is most useful when you can inspect what was built and challenge its behavior.',
		'Connect the specification, actual code, independently chosen tests and a reproducible explanation.',
		'A coding agent’s tests all pass, but the expected values were copied from the function’s output. What evidence is missing?',
		'The tests may repeat the same mistaken assumption. Specify independent expected outcomes, boundaries and failure cases, then trace the implementation and deployed artifact against that contract.',
		[
			[
				'1 · contract',
				'State the decision, data shape, allowed behavior and acceptance criteria before asking for implementation.'
			],
			[
				'2 · implementation',
				'Inspect the actual request path, state transitions and dependencies, not just a generated summary.'
			],
			[
				'3 · tests',
				'Keep both success and failure evidence. Choose expected outcomes independently of the code being checked.'
			],
			[
				'4 · explanation',
				'Reproduce one trace, explain a repair and identify what the demonstration has not established.'
			]
		]
	)
];
