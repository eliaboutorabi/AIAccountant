import type { Check } from '../types';
import type { TeachingVisual } from '../visuals/types';
import type { Term } from '../terms';

export const noviceTransferChecks: (Check & { moduleId: string })[] = [
	{
		moduleId: 'M28',
		id: 'M28-T1',
		objective: 3,
		prompt:
			'A source shows USD 180 and 70, total 250. Extraction reads 190 and 60; the two words have confidence scores 0.99. Which release conclusion is justified?',
		options: [
			'Change the source total to 260',
			'Release because the total and scores agree',
			'The sum agrees, but both cells are wrong against the source; investigate the recognition and review process'
		],
		answer: 2,
		rationales: [
			'The source total is already consistent with its lines; 260 has no basis in this case.',
			'Offsetting errors pass a sum check; confidence is not proof of exact transcription.',
			'Correct: 190 + 60 = 250 and 180 + 70 = 250, yet each extracted cell differs. Preserve the source and record corrected observations.'
		]
	},
	{
		moduleId: 'M29',
		id: 'M29-T1',
		objective: 2,
		prompt:
			'A worksheet has B2 = 80, B3=B2 × 3, B4=B3 − 20. A reviewed edit changes B2 to 90, but an export stores B4’s old cached value 220. What is the current correct B4 and the defect?',
		options: [
			'250; the cache was not invalidated through the dependency chain',
			'270; subtracting 20 is only display formatting',
			'220; formula text did not change'
		],
		answer: 0,
		rationales: [
			'Correct: 90 × 3 = 270, then 270 − 20 = 250. Exporting 220 leaves a stale dependent result.',
			'The subtraction is part of the formula, so 270 is the intermediate B3 value.',
			'An unchanged formula can have a new result when its input changes.'
		]
	},
	{
		moduleId: 'M30',
		id: 'M30-T1',
		objective: 3,
		prompt:
			'Call C8 with operation O4 creates review R6 and loses its reply. A new call C9 repeats O4 with identical parameters; the durable receipt records R6. Which result is correct?',
		options: [
			'Return R6 correlated only to C8 and leave C9 pending forever',
			'Create R7 because C9 is new',
			'Return R6 correlated to C9, without another effect'
		],
		answer: 2,
		rationales: [
			'The old receipt supplies evidence, but the new caller still needs a correctly correlated result.',
			'call_id identifies delivery correlation; changing it does not create a new logical operation.',
			'Correct: reuse the receipt for O4 and respond to the current requesting call C9.'
		]
	},
	{
		moduleId: 'M33',
		id: 'M33-T1',
		objective: 2,
		prompt:
			'A voice response has generated 4,000 ms and the user has heard 1,250 ms when interrupted. Its tool returns after generation 2 begins. Which combined treatment is correct?',
		options: [
			'Reconcile the 2,750 ms unheard portion under the transport contract; reject the old result from generation 2',
			'Delete all operation receipts because interruption cancels history',
			'Treat all 4,000 ms as heard and accept the old result into generation 2'
		],
		answer: 0,
		rationales: [
			'Correct: 4,000 − 1,250 = 2,750 ms. Playback/context handling and generation-scoped publication are separate controls.',
			'A committed side effect may still need recovery; interruption does not erase its evidence.',
			'Generation and hearing differ, and an old callback cannot become current merely by arriving late.'
		]
	},
	{
		moduleId: 'M34',
		id: 'M34-T1',
		objective: 3,
		prompt:
			'A shared allowance is USD 0.20. Request A atomically reserves 0.14; B needs 0.09. A later records actual usage 0.10 and releases its unused reservation. What is B’s eligibility before and after settlement?',
		options: [
			'Eligible both times because each is below 0.20',
			'Initially ineligible with 0.06 available; later eligible with 0.10 available',
			'Never eligible because reservations permanently spend the maximum'
		],
		answer: 1,
		rationales: [
			'Concurrent requests share one allowance, not a separate allowance each.',
			'Correct: 0.20 − 0.14 = 0.06, then 0.14 − 0.10 = 0.04 released, leaving 0.10. B can reserve 0.09 after settlement.',
			'Reservations hold capacity; actual usage and release determine final consumption.'
		]
	}
];

export const noviceVisuals: TeachingVisual[] = [
	{
		id: 'm28-evidence-layers',
		module: 'M28',
		section: 'readers',
		afterBlock: 0,
		title: 'Preserve every layer of the observation',
		lead: 'Each arrow creates a derived record; it does not erase the previous one.',
		alt: 'Flow from original file to extracted observation, interpreted field, and reviewed revision. Each retains a source link.',
		takeaway:
			'Source bytes, raw extraction, typed meaning, and reviewed correction are different records. Preserve their lineage so a number can be challenged and reproduced.',
		question: 'Which layer changes when a reviewer establishes that extracted 1,000 should be 100?',
		answer:
			'The reviewed interpretation changes, with evidence and a new revision. The original file and raw extracted 1,000 remain available.',
		sourceNote:
			'Original authored architecture diagram; fictional values, not measured extraction performance.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{
				label: 'Original file',
				detail: 'Immutable document identity, version, and bytes.',
				value: 'Evidence'
			},
			{
				label: 'Extraction',
				detail: 'Raw text, page, region, reader configuration.',
				value: 'Observation'
			},
			{ label: 'Interpretation', detail: 'Amount, unit, row, period, and type.', value: 'Meaning' },
			{
				label: 'Reviewed revision',
				detail: 'Accepted change, source justification, actor, and reason.',
				value: 'Decision'
			}
		]
	},
	{
		id: 'm28-coordinate-transform',
		module: 'M28',
		section: 'geometry',
		afterBlock: 0,
		title: 'One source box, three coordinate views',
		lead: 'The arithmetic assumes an unrotated page and the stated bottom-origin baseline.',
		alt: 'Three panels compare source coordinates on a 600 by 800 page, top-origin conversion to 88, and half-scale display coordinates x 30 top 44 height 6.',
		takeaway:
			'Change the origin before scaling: top=800 − 700 − 12 = 88, then multiply by 0.5. Rotation, crop, and real font transforms require the renderer’s complete transform.',
		question: 'What is the normalized top coordinate before display scaling?',
		answer:
			'88/800 = 0.11. It stays 0.11 when the same unrotated page is shown at a different size.',
		sourceNote:
			'Original authored geometric example; simplified PDF coordinate assumptions are explicit.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'Source',
				detail: 'Page 600 × 800; x 60; baseline 700; height 12.',
				value: 'Bottom origin'
			},
			{ label: 'Convert origin', detail: 'Top edge: 800 − 700 − 12 = 88.', value: 'Top 88' },
			{ label: 'Display at half', detail: 'x 30; top 44; height 6.', value: 'Scale 0.5' }
		]
	},
	{
		id: 'm29-cell-record',
		module: 'M29',
		section: 'typing',
		afterBlock: 0,
		title: 'The cell behind the visible number',
		lead: 'Several fields describe one cell; none should silently overwrite the others.',
		alt: 'Four comparison panels show original 60.00, interpreted 6,000 USD cents, reviewed 5,000 USD cents, and source/revision evidence.',
		takeaway:
			'A correction changes the accepted interpretation while retaining the original observation. Display formatting is another view of the record, not its identity.',
		question: 'Should the original text become 50.00 after a justified correction?',
		answer:
			'No. Preserve 60.00 as the raw extraction, add reviewed 50.00 with its source evidence and reason, and recalculate dependent results.',
		sourceNote:
			'Original authored diagram using the document workbench’s fictional fee correction.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{ label: 'Raw observation', detail: 'Retain the extracted string exactly.', value: '60.00' },
			{
				label: 'Typed extraction',
				detail: 'Declared USD convention and sign.',
				value: '6,000 cents'
			},
			{
				label: 'Reviewed value',
				detail: 'Source review supports the correction.',
				value: '5,000 cents'
			},
			{ label: 'Lineage', detail: 'Source anchor, actor, reason, and revision.', value: 'Retained' }
		]
	},
	{
		id: 'm29-dependency-chain',
		module: 'M29',
		section: 'formulas',
		afterBlock: 0,
		title: 'A driver changes every dependent result',
		lead: 'Each arrow means “the next cell depends on this cell.”',
		alt: 'A three-node chain shows B3 changing 100 to 120, B4 recalculating 200 to 240, and B5 recalculating 210 to 250.',
		takeaway:
			'Changing an input invalidates its downstream results even when their formula text stays unchanged. A cached value must be refreshed or shown as stale.',
		question: 'Why is B5 = 210 wrong after B3 becomes 120?',
		answer:
			'B5 depends on B4, which depends on B3. 120 × 2 + 10 = 250. Updating only B4 leaves an outdated cached B5.',
		sourceNote:
			'Original authored dependency example; exact arithmetic, not a claim of full Excel compatibility.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{ label: 'B3 input', detail: 'Reviewer changes the driver.', value: '100→120' },
			{ label: 'B4=B3×2', detail: 'Invalidate and recalculate first.', value: '200→240' },
			{ label: 'B5=B4+10', detail: 'Then recalculate the dependent cell.', value: '210→250' }
		]
	},
	{
		id: 'm30-dispatch-boundary',
		module: 'M30',
		section: 'parallel',
		afterBlock: 0,
		title: 'A proposal crosses enforced boundaries',
		lead: 'A model’s request becomes an action only after the runtime checks it.',
		alt: 'Flow from model proposal through registry/schema, authorization/revision, execution/receipt, to correlated result.',
		takeaway:
			'Schemas establish shape; authorization establishes permission; revision checks establish state compatibility. The returned result retains the model call identity.',
		question: 'Can a schema-valid request still be denied?',
		answer:
			'Yes. The caller may lack access, approval may be missing, or the expected artifact revision may be stale.',
		sourceNote:
			'Original authored runtime design; local demonstrations do not establish production security.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{ label: 'Model proposal', detail: 'Tool name, arguments, call_id.', value: 'Request' },
			{
				label: 'Registry + schema',
				detail: 'Allowlisted function and valid shape.',
				value: 'Validate'
			},
			{
				label: 'Access + revision',
				detail: 'Trusted user, approval, current artifact.',
				value: 'Authorize'
			},
			{
				label: 'Execute + record',
				detail: 'Perform the effect and retain its receipt.',
				value: 'Observe'
			},
			{
				label: 'Correlate result',
				detail: 'Return evidence to the matching call_id.',
				value: 'Respond'
			}
		]
	},
	{
		id: 'm30-recovery-records',
		module: 'M30',
		section: 'recovery',
		afterBlock: 0,
		title: 'Two records close the lost-reply gap',
		lead: 'A checkpoint explains unfinished work; a receipt establishes the observed effect.',
		alt: 'Three comparison panels show checkpoint pending O9, durable receipt O9 created R18, and recovery returning R18 without a second task.',
		takeaway:
			'When the reply is lost, do not infer failure from a pending model call. Reconcile the original logical operation with the effect store before executing again.',
		question: 'Does a new call_id require a new review task?',
		answer:
			'No. A new call_id may ask for the result of the same operation. Reuse its compatible receipt and correlate the answer to the new call.',
		sourceNote:
			'Original authored lost-response case; receiving-system receipt enforcement is a required assumption.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'Checkpoint',
				detail: 'Operation O9 remains unresolved to the agent.',
				value: 'Pending'
			},
			{ label: 'Effect receipt', detail: 'O9 already created review R18.', value: 'Committed' },
			{ label: 'Recovery', detail: 'Return R18; do not create another task.', value: 'One effect' }
		]
	},
	{
		id: 'm33-voice-representations',
		module: 'M33',
		section: 'transport',
		afterBlock: 0,
		title: 'The modular speech path',
		lead: 'A speech-to-speech design can combine model stages, while the application still owns evidence and actions.',
		alt: 'Flow from microphone waveform to speech-to-text, language model/tools, text-to-speech, and played audio.',
		takeaway:
			'Audio samples, recognized words, business evidence, generated speech, and heard playback are different representations. A waveform animation does not verify an answer.',
		question: 'Where should an ambiguous spoken amount be resolved?',
		answer:
			'Use source evidence and explicit business confirmation before a separately authorized action. Recognition alone cannot determine whether “one forty” means 140 or 1.40.',
		sourceNote:
			'Original architecture illustration of a modular pipeline; not a running audio model.',
		kind: 'diagram',
		layout: 'flow',
		nodes: [
			{ label: 'Microphone', detail: 'Samples capture the sound signal.', value: 'Audio' },
			{ label: 'Speech-to-text', detail: 'Recognition estimates words.', value: 'Transcript' },
			{
				label: 'Language + tools',
				detail: 'Use source evidence and validated actions.',
				value: 'Answer'
			},
			{
				label: 'Text-to-speech',
				detail: 'Synthesize speech from answer text.',
				value: 'Generated audio'
			},
			{ label: 'Playback', detail: 'The listener hears the played portion.', value: 'Heard audio' }
		]
	},
	{
		id: 'm33-audio-cursors',
		module: 'M33',
		section: 'interruption',
		afterBlock: 0,
		title: 'Three clocks at the interruption',
		lead: 'Generated, received, and heard durations describe different progress.',
		alt: 'Bars show 5 seconds generated, 3 seconds received, and 2 seconds heard, all on the same seconds scale.',
		takeaway:
			'At this point 3 seconds of generated audio remain unheard, including 1 second already received but not played. Reconcile context using the transport’s interruption contract.',
		question: 'Does receiving 3 seconds mean the user heard 3 seconds?',
		answer:
			'No. Only 2 seconds were heard in this case. Buffered content can be delivered but unplayed.',
		sourceNote:
			'Authored timing example for reasoning; these are not measured provider latency or performance results.',
		kind: 'diagram',
		layout: 'bars',
		unit: 'seconds',
		nodes: [
			{ label: 'Generated', detail: 'Total output produced so far.', value: '5 s', amount: 5 },
			{
				label: 'Received',
				detail: 'Audio delivered to the playback system.',
				value: '3 s',
				amount: 3
			},
			{ label: 'Heard', detail: 'Audio actually played to the listener.', value: '2 s', amount: 2 }
		]
	},
	{
		id: 'm34-runtime-boundaries',
		module: 'M34',
		section: 'access',
		afterBlock: 0,
		title: 'Who owns the secret and the state?',
		lead: 'Each panel names a runtime responsibility, not merely a folder in the repository.',
		alt: 'Comparison of browser interface, trusted server, durable stores, and external provider responsibilities.',
		takeaway:
			'A downloaded frontend cannot keep a shared project key private. Authorization belongs at the protected service boundary; durable state must outlive one process.',
		question: 'Can static hosting alone execute an authenticated secret-bearing API route?',
		answer:
			'No. It can serve the frontend, which may call a separately deployed service. The server runtime and protected storage must actually exist.',
		sourceNote:
			'Original authored architecture diagram; hosting products and provider contracts must be configured and tested separately.',
		kind: 'diagram',
		layout: 'compare',
		nodes: [
			{
				label: 'Browser',
				detail: 'Interface, local interaction, scoped requests.',
				value: 'Downloaded code'
			},
			{
				label: 'Trusted server',
				detail: 'Identity, permissions, secrets, budgets.',
				value: 'Enforced boundary'
			},
			{
				label: 'Durable stores',
				detail: 'Originals, revisions, receipts, usage.',
				value: 'Persistent evidence'
			},
			{
				label: 'Provider',
				detail: 'Authorized inference under its API contract.',
				value: 'External service'
			}
		]
	},
	{
		id: 'm34-lease-fencing',
		module: 'M34',
		section: 'durability',
		afterBlock: 0,
		title: 'A late worker cannot regain ownership',
		lead: 'Time expiry needs an enforced version at the write boundary.',
		alt: 'Timeline shows worker A holding lease 4, expiry, worker B holding lease 5, and rejection of a late worker A write carrying 4.',
		takeaway:
			'A lease allows recovery after an owner disappears. A fencing check rejects an older owner that wakes after a newer owner has taken over.',
		question: 'Why is storing an expiry timestamp alone insufficient?',
		answer:
			'If a late write does not check current ownership, the old worker may still overwrite new progress. The authoritative write must reject stale ownership tokens.',
		sourceNote:
			'Original distributed-work teaching case; the local runtime lab does not implement a production lease service.',
		kind: 'diagram',
		layout: 'timeline',
		nodes: [
			{ label: 'A owns the job', detail: 'Lease token 4 is current.', value: 'Before expiry' },
			{ label: 'Lease expires', detail: 'Recovery becomes eligible.', value: '12:00:30' },
			{ label: 'B takes over', detail: 'Authoritative token advances to 5.', value: 'New owner' },
			{
				label: 'A writes late',
				detail: 'Token 4 is rejected against current 5.',
				value: 'No stale write'
			}
		]
	}
];

export const noviceTerms: Term[] = [
	{
		term: 'bounding box',
		definition:
			'A rectangle locating content in a coordinate space. Its page, units, origin, rotation, and source version are needed to place it correctly.',
		example:
			'A source box at normalized top 0.11 stays at 11% of page height when the same page is resized.',
		module: 'M28'
	},
	{
		term: 'rowspan',
		definition:
			'The number of table rows occupied by one cell. A reconstructed grid keeps one content anchor and marks the positions covered by it.',
		example: 'An Account heading spanning two header rows is one heading, not two observations.',
		module: 'M28'
	},
	{
		term: 'colspan',
		definition:
			'The number of table columns occupied by one cell. Its meaning may apply to several subheadings without becoming duplicated financial data.',
		example: 'Amounts · USD spans both 2025 and 2024 columns.',
		module: 'M28'
	},
	{
		term: 'number convention',
		definition:
			'An explicit rule for interpreting numeric punctuation and signs, including decimal and thousands separators. It must match the source rather than be silently guessed.',
		example: '1.200,00 represents 1200 under a decimal-comma convention; the raw text is retained.',
		module: 'M29'
	},
	{
		term: 'cached value',
		definition:
			'A previously calculated result stored alongside a formula or computation. It can become stale when inputs change, even if the formula text does not.',
		example:
			'B5’s cached 210 must become 250 after its upstream driver changes 100 to 120 in the worked chain.',
		module: 'M29'
	},
	{
		term: 'dependency graph',
		definition:
			'A map of which calculations rely on which inputs. It supports correct calculation order, downstream invalidation, and cycle detection.',
		example: 'B3→B4→B5 means changing B3 invalidates both B4 and B5.',
		module: 'M29'
	},
	{
		term: 'middleware',
		definition:
			'Code that runs before, after, or around another operation to apply policies such as authorization, budgets, context assembly, logging, or retries.',
		example:
			'A write-permission check runs before queue_review executes, independently of the assistant’s wording.',
		module: 'M30'
	},
	{
		term: 'subagent',
		definition:
			'A separately configured agent invocation with its own task, context, and tool access. Its conclusions still require evidence and its shared-state actions need coordination.',
		example:
			'A read-only reviewer compares source evidence and a draft; it cannot approve a payment merely because it is a reviewer.',
		module: 'M30'
	},
	{
		term: 'call_id',
		definition:
			'An identifier correlating a model’s tool request with the result returned for that request. It is distinct from the logical operation identity used to prevent duplicate effects.',
		example:
			'Call C9 can receive the existing receipt for operation O4 without creating another review task.',
		module: 'M30'
	},
	{
		term: 'operation receipt',
		definition:
			'A durable record of an observed logical action and its result, associated with stable identity and compatible parameters. It supports recovery after a response is lost.',
		example:
			'O9’s receipt records review R18, so a retry can return R18 instead of creating a second task.',
		module: 'M30'
	},
	{
		term: 'VAD',
		definition:
			'Voice activity detection: a mechanism estimating when speech starts or stops. Turn-detection settings trade responsiveness against premature interruption.',
		example:
			'A short silence threshold may cut off a user pausing between an invoice prefix and its digits.',
		module: 'M33'
	},
	{
		term: 'WebRTC',
		definition:
			'A family of browser communication APIs and protocols supporting media tracks and data channels. It transports audio or events; it does not itself interpret financial meaning.',
		example:
			'A voice session carries microphone audio on a media track and tool events on a data channel.',
		module: 'M33'
	},
	{
		term: 'WebSocket',
		definition:
			'A persistent two-way message connection between client and server. An application using it for audio must manage the relevant message, buffering, and playback contracts.',
		example:
			'A client sends audio chunks and receives generated audio events, then tracks how much was played.',
		module: 'M33'
	},
	{
		term: 'SSE',
		definition:
			'Server-sent events: a text event format sent over a streaming HTTP response. Applications can use it for incremental output, with their own identity and recovery rules.',
		example:
			'A progress stream labels events so a reconnect can request replay after the last received event.',
		module: 'M33'
	},
	{
		term: 'session epoch',
		definition:
			'A changing generation identifier used to distinguish current asynchronous work from work started under an older session. A callback checks it before publishing.',
		example:
			'An S7 tool result is ignored for the S8 interface even if it arrives after S8 starts.',
		module: 'M33'
	},
	{
		term: 'BYOK',
		definition:
			'Bring your own key: a design in which the user supplies a provider credential. It changes credential ownership and billing, but still requires deliberate storage, access, and disclosure controls.',
		example:
			'A browser may send the user’s key directly to a provider; that does not mean the key never leaves the device.',
		module: 'M34'
	},
	{
		term: 'lease',
		definition:
			'Temporary ownership of work until an expiry, often renewed by an active worker. It supports recovery when a worker disappears but needs stale-owner protection.',
		example: 'After workerA’s lease expires, workerB may take over under a newer ownership token.',
		module: 'M34'
	},
	{
		term: 'fencing token',
		definition:
			'A monotonically increasing ownership version enforced at a protected resource. It rejects writes from a worker whose older lease is no longer authoritative.',
		example: 'A late write with token 4 is rejected after token 5 becomes current.',
		module: 'M34'
	}
];
