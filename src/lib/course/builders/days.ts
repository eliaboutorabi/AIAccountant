import type { CourseDay } from '../types';
export const builderDays: CourseDay[] = [
	{
		day: 6,
		title: 'From a model call to a working application',
		question: 'How do documents, models, tools and durable state become a system?',
		image: 'visuals/m26-behind-button',
		color: 'mint',
		artifact: 'A traced document-to-workbook service and a recoverable tool runtime',
		review: [
			{
				prompt:
					'A browser hides an Approve button, but the API accepts the same request from a terminal. Explain the missing boundary, then trace where identity, record ownership and business permission belong.',
				answer:
					'Hiding a control changes presentation. The trusted application endpoint must authenticate the caller, authorize that caller for this record and action, validate the arguments and current workflow state, then execute and record the result. A typed frontend, private repository or secret-looking URL does not replace these checks. Trace the request from UI event through HTTP payload, endpoint, validation and storage; test a request that bypasses the UI.'
			},
			{
				prompt:
					'For a synthetic batch of 100 documents, OCR costs $0.02 per document and interpretation costs $0.004 per document. Ten documents repeat both stages once. Compute total provider cost and name two missing economic inputs.',
				answer:
					'The first pass costs 100 × $0.024 = $2.40. The ten repeats add $0.24, giving $2.64. These invented rates teach accounting, not current provider prices. Human review, storage, hosting, failed attempts, latency and maintenance may change the business case. A cache saves provider work only when its identity covers the source, configuration and relevant versions; a cache hit is not evidence that the cached answer remains appropriate.'
			},
			{
				prompt:
					'A PDF has selectable text on pages 1–2 and scanned tables on pages 3–4. A whole-document check finds some text and skips OCR. What evidence is lost, and how would you repair the routing?',
				answer:
					'Text on the early pages does not establish extractable text on every page. Inspect extraction quality page by page and route empty or unusable pages to OCR. Retain page identities and transform each source coordinate system into the displayed page coordinates, including scale, crop and rotation. A text match identifies candidate evidence; an ambiguous match must not silently highlight an arbitrary occurrence.'
			},
			{
				prompt:
					'An extracted row contains account 0012, amount (120.00), and an empty payment-date cell. What should a typed workbook preserve? What does a reconciled total still fail to prove?',
				answer:
					'0012 is an identifier string, parentheses mean a negative amount under the declared accounting convention, and the missing date stays missing rather than becoming zero or today. Keep original text, interpreted type, source locator and any correction separately. Reconciliation tests an arithmetic relationship; equal errors can cancel, and a matching total does not prove each cell, classification, date or authorization is correct.'
			},
			{
				prompt:
					'The model requests two independent reads with call IDs A and B. B returns first. A repeated delivery of B arrives after that. How should the runtime handle all three events?',
				answer:
					'Match by call ID rather than arrival order, retain the associated validated arguments and run identity, and apply each completed result once. A duplicate delivery should not create a second state change. Parallelism is appropriate only when the operations do not have an ordering dependency or conflicting writes. Preserve an explicit result for A rather than attaching B to the next empty position.'
			},
			{
				prompt:
					'A reviewer changes cell C4 after a checkpoint. The restored agent continues from its older workbook copy and reports success. Describe the defect and a reproducible recovery test.',
				answer:
					'The application has two inconsistent authorities for workbook state. Track a workbook revision in the checkpoint and compare it with current authoritative storage before resuming. Reject, rebase or explicitly reconcile a stale plan; do not silently overwrite the correction. Test with a known edit, restore an older checkpoint, and inspect persisted cells and revisions after the attempted continuation. A success sentence is not a state assertion.'
			}
		]
	},
	{
		day: 7,
		title: 'Evidence, voice and professional delivery',
		question: 'Can another person inspect, interrupt, reproduce and challenge what you built?',
		image: 'visuals/m31-evidence-record',
		color: 'lavender',
		artifact: 'An evidence-linked analytical interface and a defended release dossier',
		review: [
			{
				prompt:
					'An earlier release reports 2024 revenue of 100. A later release restates 2024 to 92 on the same basis as 2025 revenue of 101.2. Calculate both growth rates and explain the appropriate comparison.',
				answer:
					'Against the original 100, growth is 1.2%. Against the comparable restated 92, growth is 10%. Preserve both historical observations and a supersession relationship, then state which basis and source version the comparison uses. A convenient later figure does not automatically solve other differences in scope, fiscal period, currency or workforce definition.'
			},
			{
				prompt:
					'A chart shows revenue of 40, 30 and 20 for three entities; a fourth entity is missing. The first bar is described as 40% of the market. Diagnose the denominator and display problem.',
				answer:
					'The observed total is 90, so 40/90 is about 44.4% of the observed three-entity total. Neither that share nor 40% establishes market share without a defined complete market denominator. Keep missingness explicit and avoid interpreting missing as zero. Display coverage, units, period and the denominator alongside the comparison; connect the plotted number to its source inputs.'
			},
			{
				prompt:
					'A voice model generates ten seconds of speech, but the user interrupts after hearing three. A read-only tool from that turn returns later. What must be reconciled?',
				answer:
					'Stop generation and playback as appropriate for the transport, preserve what was actually heard, and truncate or synchronize conversation history so the model does not assume all ten seconds were delivered. Associate the late result with its original session, turn and call. Do not let an obsolete callback update the current turn. Cancellation does not itself undo an external write, so effect reconciliation would be needed for a write tool.'
			},
			{
				prompt:
					'A service has $5 remaining budget. Two concurrent requests each estimate $3 and both see the same initial balance. Explain why a simple preflight check fails and design the next step.',
				answer:
					'Both checks can pass before either updates the balance, permitting $6 of reservations. Reserve budget atomically with the request identity, release unused reservations and reconcile actual usage. Bound retries and auxiliary calls as well as the main model call. State how failed requests, delayed usage reports and provider-side limits affect the policy; a client-side counter is not an enforcement boundary.'
			},
			{
				prompt:
					'A reviewer model times out after the application has streamed a draft. The UI changes its badge to No issues found because the findings array is empty. What states and tests are missing?',
				answer:
					'An empty result is not the same as a completed review with no findings. Represent pending, passed, findings, failed and cancelled explicitly, and label streamed text provisional until the required checks complete. Test timeout, malformed output, absent source evidence and a known wrong arithmetic claim. A model critic may catch problems, but its agreement does not establish truth or independent assurance.'
			},
			{
				prompt:
					'A coding agent produces a polished patch and passing tests that repeat the implementation’s own assumption. What would make your build defense convincing?',
				answer:
					'Explain the input/output contract, trace one request through the actual code and persisted state, and use independently specified expected outcomes. Include boundary, failure, concurrency and recovery cases rather than only the happy path. Review the diff, dependencies, secrets, migration and deployment controls. Preserve the first failed evidence and the repair, then demonstrate that the tested artifact is the one deployed. Coding assistance changes how code is produced, not who must understand its behavior.'
			}
		]
	}
];
