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

export const m33: CourseModule = {
	id: 'M33',
	day: 7,
	title: 'Coordinate a realtime voice assistant',
	subtitle: 'Audio, transcripts, tools, and interruptions each have their own clock.',
	minutes: 75,
	prerequisites: ['M27', 'M30', 'M31'],
	objectives: [
		'Distinguish speech-to-text, language processing, text-to-speech, and speech-to-speech architectures.',
		'Choose HTTP, SSE, WebSocket, and WebRTC roles without conflating transport with intelligence.',
		'Track generated, buffered, and heard audio through interruption and context repair.',
		'Coordinate tool completion and response state with run/turn/session identities.',
		'Measure voice latency and test permission, cancellation, and reconnect failure cases.'
	],
	why: 'A finance conversation can feel natural while its application state is wrong. A dependable voice assistant must know what was said, what was actually heard, which evidence is current, and which actions really finished.',
	sections: [
		s(
			'audio-pipeline',
			'From sound to a useful answer',
			'A waveform and a transcript are different representations.',
			p(
				'A microphone produces sampled audio: numerical measurements of changing air pressure over time. Speech-to-text, or STT, estimates words from that signal. A language model can use those words plus evidence and tools to produce an answer. Text-to-speech, or TTS, turns answer text into generated audio. This modular STT → language → TTS pipeline exposes useful intermediate stages, such as a transcript that can be checked before an amount is used.',
				'A speech-to-speech model can work with audio input and produce audio output without requiring your application to chain three separate services. It may preserve aspects of conversational rhythm that a plain transcript loses. That does not remove application responsibilities: you still need session state, tool authorization, evidence, interruption handling, and clear limits. A displayed transcript may be produced alongside audio and need not align perfectly word by word with playback.',
				'Suppose a user says “one forty” while discussing an invoice. Is that USD 140, USD 1.40, a line number, or a time? Acoustic recognition alone cannot establish business meaning. Use the surrounding question and source record, and ask for a precise confirmation when ambiguity matters. A voice that sounds certain must not convert an ambiguous phrase into a financial action. Read back important amounts with currency and reference before any separately authorized write.',
				'An animated waveform usually displays signal amplitude or energy. Mouth animation may follow volume and frequency heuristics from the audio being played. Neither is evidence that a model understands the accounts. Drive the animation from actual playback when possible; driving it solely from generated text can make a character appear to speak after audio stops. Provide text access and quiet controls so the learning or business task does not depend on hearing.'
			)
		),
		s(
			'transport',
			'Choose the pipe for the job',
			'The connection moves information; the model interprets it.',
			p(
				'HTTP request/response is a useful starting point: the client requests a session, sends a document, or calls a server endpoint and receives a response. Server-sent events, or SSE, are a text event format carried in a streaming HTTP response. They are useful for a server sending incremental text or progress events. They do not by themselves create two-way realtime audio. A fetch-stream client and the browser EventSource interface are also not interchangeable in every API, especially where request methods or authorization headers differ.',
				'WebSocket provides a persistent two-way message connection. An application can send audio chunks and receive model events, but it must implement the expected encoding, playback buffering, and flow control. WebRTC provides browser media tracks and data channels. Audio can travel on negotiated media tracks while JSON events and tool results travel on a data channel. These transports are alternatives or companions within an architecture, not different kinds of neural network.',
				'For a browser voice session, the application commonly negotiates a peer connection using a Session Description Protocol, or SDP, offer and answer. This describes connection/media capabilities; it is not a prompt or an audio transcript. An HTTP exchange may establish the session before media begins. Provider contracts differ, so choose the specific API and read its current setup instructions rather than combining event names from unrelated versions.',
				'Keep long-lived project credentials on a trusted server in a shared application. Some provider designs support short-lived browser session credentials; others use a server-mediated session exchange. Authenticate and authorize that creation endpoint and restrict what the session may do. Short lifetime reduces exposure, but it does not make an unrestricted session harmless or authenticate your users automatically. Microphone access requires browser permission and an appropriate secure context; denial should leave a usable text path.'
			)
		),
		s(
			'turns',
			'Decide when a turn has ended',
			'Silence detection, response completion, and playback completion are separate events.',
			p(
				'Voice activity detection, or VAD, estimates whether someone is speaking. A silence-based detector waits for a quiet interval before ending a turn. A shorter interval can reduce waiting but may interrupt someone pausing to read a number. A semantic detector also considers whether an utterance seems complete. Neither should be confused with a guarantee that the user approved an action. Tune and evaluate with the intended speakers, devices, and environments.',
				'Measure latency from a defined event. For an authored serial example, turn-end detection takes 400 ms, network and dispatch take 100 ms, the model takes 300 ms to begin its response, and playback buffering takes 100 ms. First audible response is 900 ms after the actual end of speech. Adding a required source lookup of 250 ms before generation makes it 1,150 ms under these assumptions. Real systems overlap work, so measure the critical path instead of adding every duration in a trace regardless of concurrency.',
				'The model may finish generating a response while several seconds of audio remain buffered. Conversely, audio can stop temporarily while a tool is pending. Track connection state, response state, playback state, and pending tools separately. A single isSpeaking boolean cannot explain all combinations. “Thinking” should not conceal an expired request indefinitely; surface a timeout or recoverable error when the relevant deadline is exceeded.'
			),
			{
				kind: 'worked',
				title: 'The continuation barrier',
				problem:
					'Calls C1 and C2 are pending. The model response ends at 300 ms. C2 finishes at 500 ms; C1 finishes at 800 ms.',
				steps: [
					'At 300 ms the response is closed but two tool results are missing: do not create a continuation.',
					'At 500 ms associate C2 with its own call ID; one call remains pending.',
					'At 800 ms record C1; the response is closed and no required call remains pending.',
					'Create one continuation and mark that barrier consumed. Repeated delivery of the same result must not trigger a second continuation.'
				],
				conclusion:
					'Response completion and tool completion can arrive in either order. Explicit state, not timing guesses, decides when the model may continue.'
			}
		),
		s(
			'interruption',
			'Keep context aligned with what was heard',
			'Generated speech is not the same as delivered meaning.',
			p(
				'Imagine an answer has generated 5.0 seconds of audio. The playback system has received 3.0 seconds, but the user has heard only 2.0 seconds when they interrupt. Three seconds of generated content have not been heard, including one second already buffered locally. Continuing as if the user heard the entire answer can produce confusing references such as “as I just explained” to material they never received.',
				'Interruption needs several coordinated actions: stop or cancel further generation as supported, stop unwanted playback, and align retained conversation state with the relevant heard portion. The mechanism depends on the provider and transport. OpenAI’s Realtime documentation specifies automatic removal of unplayed audio for its WebRTC and SIP interruption path; its WebSocket path requires the client to stop playback and request truncation using the playback position. Do not send a guessed truncation message merely because another transport’s example used one.',
				'Truncation may not provide a perfectly word-aligned shortened transcript. Do not pretend that cutting at 2.0 seconds always means a known number of words. The local lab uses authored timestamped words to make the distinction visible; a production system needs the actual service contract and playback evidence. Retain uncertainty if timing or alignment is incomplete.',
				'Barge-in means the user begins speaking while the assistant is speaking. Muting a microphone is different: it disables outgoing audio but can leave the connection, tool work, and output playback running. Ending the session should release microphone tracks, connection, audio resources, and listeners. A “listen only” feature should not claim it never requests microphone access if its implementation acquires a stream and merely disables the track afterward.'
			)
		),
		s(
			'identity',
			'Old callbacks must not enter a new conversation',
			'Cancellation needs identity as well as a stop button.',
			p(
				'JavaScript promises can finish after the user changes direction. Session S7 begins a tool request; the user hangs up and starts S8; S7’s result arrives late. If the handler writes through a shared current-session reference, it can inject an old invoice balance into the new conversation. Capture session and turn identities when work starts, pass an abort signal where supported, and check identity again before publishing results or changing counters.',
				'Use the same principle during connection startup. Credential creation and microphone permission are asynchronous. A user can cancel before the peer connection exists. Store a startup generation or cancellation token; if it is no longer current when an await completes, release any newly acquired resources and do not activate the old session. A disabled button helps interaction, but it is not a complete concurrency control.',
				'A late write may already have committed despite cancellation. Ignoring its display result protects the new UI but does not erase the effect. Record and reconcile that operation using the receipt mechanism from M30. Reconnecting must distinguish a new media connection from restoration of business state. Replaying the last few text messages can omit tool evidence, current document revisions, or an unresolved action. Explain the recovered scope and reload authoritative state.',
				'Test duplicate tool events, out-of-order results, response completion before tools, microphone denial, disconnect during startup, interruption during playback, and a tool timeout followed by late success. Track session ID, turn ID, call ID, model/API configuration, timing milestones, and normalized error categories. Avoid logging raw credentials or unnecessary private speech. A good trace lets you explain why a continuation was allowed and which audio position was retained.'
			),
			{
				kind: 'lab',
				id: 'voice-coordination',
				title: 'Voice event coordination studio',
				task: 'Advance the authored voice timeline and compare generated versus heard content. Barge in at a chosen playback point, start a new generation, and deliver an old versus current tool result. Explain which context remains and which callback may update the current session.',
				prediction:
					'Predict how much generated content has not been heard and whether a late result belongs to the current generation.',
				evidence: [
					'Record generated and heard positions using the same time unit.',
					'Explain why interruption changes retained conversational context.',
					'Show that an old-generation result is rejected while a current one may be accepted.'
				],
				limitation:
					'The lab uses deterministic event timing and authored word timestamps. It does not access a microphone, run speech recognition or synthesis, call a realtime provider, or benchmark actual latency.'
			}
		)
	],
	checks: [
		q(
			'M33-Q1',
			0,
			'A moving waveform accompanies an answer. What does it establish by itself?',
			[
				'A signal or visual animation is being shown, not semantic understanding',
				'Every spoken word was transcribed accurately',
				'The financial reasoning is correct'
			],
			0,
			[
				'Correct: inspect what drives the animation; it may be actual audio or a simulation.',
				'Recognition accuracy needs separate evidence.',
				'Amplitude is unrelated to factual validation.'
			]
		),
		q(
			'M33-Q2',
			1,
			'Which pairing fits a WebRTC voice design?',
			[
				'SDP contains the assistant’s final answer',
				'Audio on media tracks; JSON tool events on a data channel',
				'All audio must be sent as SSE text'
			],
			1,
			[
				'SDP describes session/media capabilities, not answer content.',
				'Correct: these are distinct paths in the negotiated connection.',
				'SSE is not the native WebRTC media transport.'
			]
		),
		q(
			'M33-Q3',
			4,
			'A serial path takes 400 ms turn detection, 100 ms dispatch,300 ms first generation,100 ms playback buffer. What is first-audio latency under these assumptions?',
			['300 ms', '400 ms', '900 ms'],
			2,
			[
				'Generation time alone excludes the other stages.',
				'This counts only end-of-turn detection.',
				'Correct: 400 + 100 + 300 + 100 = 900 ms; measured overlap would require a different calculation.'
			]
		),
		q(
			'M33-Q4',
			2,
			'Five seconds were generated and two heard when the user interrupted. How much generated audio was not heard?',
			['Two seconds', 'Three seconds', 'Zero because response generation completed'],
			1,
			[
				'Two seconds is the heard portion.',
				'Correct:5 − 2 = 3 seconds. Delivered or buffered content can still be unheard.',
				'Generation completion does not imply playback completion.'
			]
		),
		q(
			'M33-Q5',
			3,
			'response.done arrives while C1 is still pending. What should happen?',
			[
				'Wait for the required tool state and then create at most one continuation',
				'Mark the tool successful because the response ended',
				'Immediately create a continuation using a guessed result'
			],
			0,
			[
				'Correct: the barrier requires both closed response and settled required calls.',
				'Response lifecycle does not establish tool success.',
				'The model cannot reason from a result that is not present.'
			]
		),
		q(
			'M33-Q6',
			3,
			'A read started in S7 completes after S8 begins. Which publication policy is appropriate?',
			[
				'Delete all receipt history',
				'Apply it to whichever session is visible',
				'Check identity and reject it from S8; retain any needed S7 trace'
			],
			2,
			[
				'Historical effect/status evidence may be needed for recovery.',
				'This can mix evidence from different conversations.',
				'Correct: late results must not mutate current state merely because they completed now.'
			]
		)
	],
	assignment: {
		title: 'Draw the voice state machine',
		scenario:
			'A finance assistant generates 5 seconds, the user hears 2 seconds, and two tools are pending. The user interrupts, ends S7, and starts S8. An S7 tool later returns. A new connection attempt also faces microphone denial.',
		tasks: [
			'Separate media, transcript, tool, and connection paths.',
			'Calculate unheard audio and define the transport-specific interruption responsibility.',
			'Specify the continuation barrier and stale-result rule.',
			'Describe the accessible fallback and latency/trace measurements.'
		],
		deliverable: 'A state diagram, event trace, and five boundary tests with expected outcomes.',
		rubric: [
			{
				criterion: 'Representations',
				evidence: 'Audio, transcript, and model context are distinct.'
			},
			{
				criterion: 'Interruption',
				evidence: '3 seconds unheard; retained context follows actual transport/playback contract.'
			},
			{
				criterion: 'Coordination',
				evidence: 'Pending tools block continuation; identities prevent S7 updates to S8.'
			},
			{
				criterion: 'Reliability',
				evidence:
					'Permission denial leaves text available; cancellation releases resources and does not claim to undo writes.'
			}
		],
		workedSolution: [
			'Draw microphone/media input and remote media output separately from JSON event/tool exchange. Transcript is a related representation, not the audio itself.',
			'5 − 2 = 3 seconds generated but unheard. For a client-managed playback transport, stop playback and reconcile/truncate according to the provider contract; for documented automatic handling, verify its events rather than duplicating it blindly.',
			'Continue only once after response closure and all required results settle. A result tagged S7 is not published into S8. A committed external effect still needs receipt recovery.',
			'On microphone denial show the cause and preserve text interaction. Measure speech-end, detected-turn-end, first request, first audio, and first playback; test startup cancellation, duplicate result, out-of-order results, interruption, and stale completion.'
		]
	},
	interview: {
		question: 'What makes a realtime financial voice assistant difficult to build?',
		strongAnswer: [
			'Several asynchronous systems coexist: microphone input, turn detection, model generation, tool calls, playback, and UI state. I give them explicit identities and states instead of treating a response as one synchronous function.',
			'I choose transports for their roles, measure first-audio latency, and keep interruption context aligned with what was heard under the actual provider contract. Typed tool results and exact financial records remain the evidence behind spoken answers.',
			'I test late callbacks, duplicate events, permission failures, and reconnects. Cancellation protects current interaction but does not undo committed effects; those require durable status reconciliation.'
		],
		followUps: [
			{
				question: 'Does a transcript prove what the user heard?',
				answer:
					'No. It may represent generated content or approximate transcription while playback is incomplete. Audio position and the service’s alignment/truncation contract matter.'
			},
			{
				question: 'Why can lowering a VAD silence threshold hurt?',
				answer:
					'It can end a turn during a natural pause, especially while reading identifiers or amounts. Evaluate both responsiveness and interrupted/incorrect turns with the intended users.'
			}
		]
	},
	sources: [
		{ label: 'MDN WebRTC API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API' },
		{
			label: 'WHATWG server-sent events specification',
			url: 'https://html.spec.whatwg.org/multipage/server-sent-events.html'
		},
		{
			label: 'MDN WebSocket API',
			url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket'
		},
		{
			label: 'OpenAI Realtime interruption and truncation',
			url: 'https://developers.openai.com/api/docs/guides/realtime-conversations#interruption-and-truncation',
			note: 'The responsibility differs between WebRTC/SIP and WebSocket; verify the API variant you implement.'
		},
		{
			label: 'OpenAI voice activity detection',
			url: 'https://developers.openai.com/api/docs/guides/realtime-vad'
		}
	]
};
