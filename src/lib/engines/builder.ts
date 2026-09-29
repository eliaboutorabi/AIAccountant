/** Original builder experiments. All provider/OCR measurements and proposals are authored fixtures.
 * Pure bounded calculations and explicit state machines run locally; no credentials, model calls,
 * file execution, microphone, database or production authorization boundary are implied. */
export type BuilderMode = 'documents' | 'evidence' | 'runtime' | 'voice' | 'routing';
export type NumberConvention = 'dot' | 'comma' | 'undecided';
export type SourceCell = { text: string; rowSpan?: number; colSpan?: number; header?: boolean };
export type GridCell = {
	raw: string;
	anchor: string;
	covered: boolean;
	rowSpan: number;
	colSpan: number;
	header: boolean;
};
export type TypedCell = {
	raw: string;
	kind: 'text' | 'identifier' | 'money' | 'blank' | 'unresolved';
	value: string | number | null;
	minor?: number;
	issue?: string;
};
export type CellCorrection = { row: number; col: number; value: string; reason: string };
const coordinate = (row: number, col: number) => `${String.fromCharCode(65 + col)}${row + 1}`;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
function bounded(value: number, min: number, max: number, label: string, integer = false): void {
	if (
		!Number.isFinite(value) ||
		value < min ||
		value > max ||
		(integer && !Number.isInteger(value))
	)
		throw new Error(
			`${label} must be ${integer ? 'a whole number ' : ''}between ${min} and ${max}.`
		);
}
export function documentFixture(comma = false): SourceCell[][] {
	const n = (s: string) => (comma ? s.replace(/[.,]/g, (c) => (c === '.' ? ',' : '.')) : s);
	return [
		[
			{ text: 'Account ID', rowSpan: 2, header: true },
			{ text: 'Amounts · USD', colSpan: 2, header: true }
		],
		[
			{ text: '2025', header: true },
			{ text: '2024', header: true }
		],
		[{ text: '0012' }, { text: n('1,200.00') }, { text: n('1,000.00') }],
		[{ text: '0041' }, { text: n('(250.00)') }, { text: n('(200.00)') }],
		[{ text: '0088' }, { text: '0' }, { text: '' }],
		[{ text: '0101' }, { text: n('60.00') }, { text: n('50.00') }],
		[{ text: 'Printed total' }, { text: n('1,000.00') }, { text: n('850.00') }]
	];
}
/** Expand provider-shaped row/column spans. Covered positions point to an anchor, never copy its value. */
export function expandStructure(rows: SourceCell[][]): GridCell[][] {
	if (!rows.length || rows.length > 30) throw new Error('Use 1–30 source rows.');
	const grid: Array<Array<GridCell | undefined>> = Array.from({ length: rows.length }, () => []);
	for (let r = 0; r < rows.length; r++) {
		let c = 0;
		for (const cell of rows[r]) {
			while (grid[r][c]) c++;
			const rs = cell.rowSpan ?? 1,
				cs = cell.colSpan ?? 1;
			bounded(rs, 1, 10, 'Row span', true);
			bounded(cs, 1, 10, 'Column span', true);
			if (r + rs > rows.length || c + cs > 20)
				throw new Error('A span exceeds the 30 × 20 teaching grid.');
			for (let dr = 0; dr < rs; dr++)
				for (let dc = 0; dc < cs; dc++) {
					if (grid[r + dr][c + dc]) throw new Error('Overlapping merged cells.');
					grid[r + dr][c + dc] = {
						raw: dr || dc ? '' : cell.text,
						anchor: coordinate(r, c),
						covered: !!(dr || dc),
						rowSpan: rs,
						colSpan: cs,
						header: !!cell.header
					};
				}
			c += cs;
		}
	}
	const width = Math.max(...grid.map((row) => row.length));
	return grid.map((row, r) =>
		Array.from(
			{ length: width },
			(_, c) =>
				row[c] ?? {
					raw: '',
					anchor: coordinate(r, c),
					covered: false,
					rowSpan: 1,
					colSpan: 1,
					header: false
				}
		)
	);
}
/** Strict two-decimal monetary convention. Ambiguous punctuation is not guessed. IDs never become amounts. */
export function typeCell(
	raw: string,
	role: 'identifier' | 'amount' | 'text',
	convention: NumberConvention
): TypedCell {
	const text = raw.trim();
	if (!text) return { raw, kind: 'blank', value: null };
	if (role !== 'amount')
		return { raw, kind: role === 'identifier' ? 'identifier' : 'text', value: text };
	const unresolved = (issue: string): TypedCell => ({
		raw,
		kind: 'unresolved',
		value: text,
		issue
	});
	if (convention === 'undecided' && /[.,]/.test(text))
		return unresolved('Choose the source number convention before converting punctuation.');
	let signed = text,
		sign = 1;
	if (/^\(.*\)$/.test(signed)) {
		sign = -1;
		signed = signed.slice(1, -1);
	} else if (signed.startsWith('-')) {
		sign = -1;
		signed = signed.slice(1);
	}
	const pattern =
		convention === 'comma'
			? /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/
			: /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;
	if (!pattern.test(signed))
		return unresolved(
			'This value does not match the selected convention (at most two decimal places).'
		);
	const normalized =
		convention === 'comma'
			? signed.replaceAll('.', '').replace(',', '.')
			: signed.replaceAll(',', '');
	const [whole, fraction = ''] = normalized.split('.');
	const minor = sign * (Number(whole) * 100 + Number(fraction.padEnd(2, '0')));
	if (!Number.isSafeInteger(minor) || Math.abs(minor) > 1e12)
		return unresolved('The amount exceeds the exact-cent teaching limit.');
	return { raw, kind: 'money', value: minor / 100, minor: minor || 0 };
}
export function buildDocument(
	comma: boolean,
	convention: NumberConvention,
	corrections: CellCorrection[] = []
) {
	const source = expandStructure(documentFixture(comma));
	const applied = new Map<string, CellCorrection>();
	for (const correction of corrections) {
		if (
			!Number.isInteger(correction.row) ||
			correction.row < 2 ||
			correction.row > 6 ||
			![1, 2].includes(correction.col) ||
			!correction.reason.trim() ||
			correction.reason.length > 240 ||
			correction.value.length > 40
		)
			throw new Error('A correction needs an amount cell, a bounded value and a recorded reason.');
		applied.set(coordinate(correction.row, correction.col), correction);
	}
	const typed = source.map((row, r) =>
		row.map((cell, c) => {
			const correction = applied.get(coordinate(r, c));
			return {
				...typeCell(
					correction?.value ?? cell.raw,
					r < 2 || (r === 6 && c === 0) ? 'text' : c === 0 ? 'identifier' : 'amount',
					convention
				),
				original: cell.raw,
				covered: cell.covered,
				anchor: cell.anchor,
				correction
			};
		})
	);
	const checks = [1, 2].map((c) => {
		const components = typed.slice(2, 6).map((row) => row[c]);
		const unavailable = components.filter((cell) => cell.kind !== 'money').length;
		const knownMinor = components.reduce((sum, cell) => sum + (cell.minor ?? 0), 0);
		const printed = typed[6][c].minor ?? null;
		const complete = unavailable === 0 && printed !== null;
		return {
			period: c === 1 ? '2025' : '2024',
			knownMinor,
			printedMinor: printed,
			unavailable,
			complete,
			differenceMinor: complete ? knownMinor - printed! : null
		};
	});
	return {
		schema: 'teaching-document-v1',
		provenance: 'Original authored OCR fixture; no model or OCR service executed.',
		ocrGrid: source,
		ocrRows: documentFixture(comma),
		authoredSourceRows: documentFixture(comma).map((row, r) =>
			row.map((cell, c) => ({
				...cell,
				text: r === 5 && c === 1 ? (comma ? '50,00' : '50.00') : cell.text
			}))
		),
		convention,
		typed,
		corrections: clone(corrections),
		checks
	};
}
/** Text-safe export: prefixes formula-like text. JSON is the type-preserving artifact; TSV is a flat interchange. */
export function safeTsv(rows: Array<Array<string | number | null>>): string {
	return rows
		.map((row) =>
			row
				.map((value) => {
					if (value === null) return '';
					if (typeof value === 'number') {
						if (!Number.isFinite(value)) throw new Error('Export values must be finite.');
						return String(value);
					}
					let text = value.replace(/[\t\r\n]/g, ' ');
					if (/^\s*[=+\-@]/.test(text) || /^0\d/.test(text)) text = `'${text}`;
					return text;
				})
				.join('\t')
		)
		.join('\n');
}
export type Observation = {
	id: string;
	entity: string;
	source: string;
	version: number;
	year: number;
	periodEnd: string;
	metric: 'revenue';
	unit: 'USD million' | 'USD thousand';
	basis: 'all operations' | 'continuing operations';
	value: number | null;
	supersedes?: string;
};
export const evidenceFixture: Observation[] = [
	{
		id: 'A23-original',
		entity: 'Aster',
		source: 'Fictional 2023 report · p12',
		version: 1,
		year: 2023,
		periodEnd: '2023-12-31',
		metric: 'revenue',
		unit: 'USD million',
		basis: 'all operations',
		value: 90
	},
	{
		id: 'A23-restated',
		entity: 'Aster',
		source: 'Fictional 2025 report · note4',
		version: 2,
		year: 2023,
		periodEnd: '2023-12-31',
		metric: 'revenue',
		unit: 'USD million',
		basis: 'continuing operations',
		value: 80,
		supersedes: 'A23-original'
	},
	{
		id: 'A24-original',
		entity: 'Aster',
		source: 'Fictional 2024 report · p12',
		version: 1,
		year: 2024,
		periodEnd: '2024-12-31',
		metric: 'revenue',
		unit: 'USD million',
		basis: 'all operations',
		value: 100
	},
	{
		id: 'A24-restated',
		entity: 'Aster',
		source: 'Fictional 2025 report · note4',
		version: 2,
		year: 2024,
		periodEnd: '2024-12-31',
		metric: 'revenue',
		unit: 'USD million',
		basis: 'continuing operations',
		value: 92,
		supersedes: 'A24-original'
	},
	{
		id: 'A25',
		entity: 'Aster',
		source: 'Fictional 2025 report · p12',
		version: 1,
		year: 2025,
		periodEnd: '2025-12-31',
		metric: 'revenue',
		unit: 'USD million',
		basis: 'continuing operations',
		value: 101.2
	},
	{
		id: 'B25',
		entity: 'Birch',
		source: 'Fictional 2025 report · p8',
		version: 1,
		year: 2025,
		periodEnd: '2025-12-31',
		metric: 'revenue',
		unit: 'USD thousand',
		basis: 'continuing operations',
		value: 60000
	},
	{
		id: 'C25',
		entity: 'Clover',
		source: 'Authored missing-disclosure record',
		version: 1,
		year: 2025,
		periodEnd: '2025-12-31',
		metric: 'revenue',
		unit: 'USD million',
		basis: 'continuing operations',
		value: null
	}
];
export function canonicalMillions(observation: Observation): number | null {
	if (observation.value === null) return null;
	bounded(observation.value, 0, 1e9, 'Revenue');
	return observation.unit === 'USD thousand' ? observation.value / 1000 : observation.value;
}
export function evidenceAnalysis(
	useRestated: boolean,
	cloverRevenue: number | null = null,
	currentRevenue = 101.2
) {
	bounded(currentRevenue, 0, 100000, 'Current revenue');
	if (cloverRevenue !== null) bounded(cloverRevenue, 0, 100000, 'Clover revenue');
	const observations = clone(evidenceFixture);
	if (currentRevenue !== 101.2)
		observations.push({
			...observations[4],
			id: 'A25-user-v2',
			source: 'Learner-authored revision; not external evidence',
			version: 2,
			value: currentRevenue,
			supersedes: 'A25'
		});
	if (cloverRevenue !== null)
		observations.push({
			...observations[6],
			id: 'C25-user-v2',
			source: 'Learner-authored disclosure; not external evidence',
			version: 2,
			value: cloverRevenue,
			supersedes: 'C25'
		});
	const ids = [
		useRestated ? 'A23-restated' : 'A23-original',
		useRestated ? 'A24-restated' : 'A24-original',
		currentRevenue === 101.2 ? 'A25' : 'A25-user-v2'
	];
	const series = ids.map((id) => observations.find((row) => row.id === id)!);
	const [start, prior, current] = series.map((row) => canonicalMillions(row)!);
	const comparable = series.every(
		(row) =>
			row.basis === series[2].basis &&
			row.entity === series[2].entity &&
			row.metric === series[2].metric &&
			row.periodEnd.endsWith('12-31')
	);
	const naiveGrowth = prior > 0 ? current / prior - 1 : null;
	const intervals = series[2].year - series[0].year;
	const peers = [
		series[2],
		observations[5],
		observations.find((row) => row.id === (cloverRevenue === null ? 'C25' : 'C25-user-v2'))!
	];
	const included = peers.filter((row) => canonicalMillions(row) !== null);
	const denominator = included.reduce((sum, row) => sum + canonicalMillions(row)!, 0);
	return {
		schema: 'teaching-evidence-v1',
		observations,
		series,
		comparable,
		intervals,
		naiveGrowth,
		growth: comparable ? naiveGrowth : null,
		cagr:
			comparable && start > 0 && intervals > 0 ? (current / start) ** (1 / intervals) - 1 : null,
		peers,
		includedIds: included.map((row) => row.id),
		missingIds: peers.filter((row) => row.value === null).map((row) => row.id),
		denominator,
		share: denominator > 0 ? current / denominator : null
	};
}

export type RuntimeRequest = {
	callId: string;
	tool: 'read_balance' | 'queue_review';
	args: { documentId: string; expectedRevision?: number; operationId?: string; note?: string };
};
export type RuntimeCall = RuntimeRequest & {
	status: 'pending' | 'completed' | 'rejected' | 'cancelled';
	result?: string;
};
export type RuntimeState = {
	version: 1;
	connected: boolean;
	calls: RuntimeCall[];
	events: string[];
	attempts: number;
};
export type EffectReceipt = {
	operationId: string;
	fingerprint: string;
	revision: number;
	result: string;
};
export type RuntimeStore = {
	documentId: string;
	revision: number;
	balanceMinor: number;
	queue: Array<{ operationId: string; note: string }>;
	receipts: EffectReceipt[];
};
export const runtimeFixture: RuntimeRequest[] = [
	{ callId: 'call-read', tool: 'read_balance', args: { documentId: 'DOC-7' } },
	{
		callId: 'call-review',
		tool: 'queue_review',
		args: {
			documentId: 'DOC-7',
			expectedRevision: 1,
			operationId: 'review-DOC-7-v1',
			note: 'Investigate the source discrepancy.'
		}
	}
];
export const initialRuntime = (): RuntimeState => ({
	version: 1,
	connected: true,
	calls: [],
	events: ['Connected. Authored proposals are inputs; local code enforces the contract.'],
	attempts: 0
});
export const initialRuntimeStore = (): RuntimeStore => ({
	documentId: 'DOC-7',
	revision: 1,
	balanceMinor: 120000,
	queue: [],
	receipts: []
});
function logRuntime(state: RuntimeState, message: string) {
	state.events = [...state.events.slice(-29), message];
}
function validateRequest(input: unknown): RuntimeRequest {
	if (!input || typeof input !== 'object' || Array.isArray(input))
		throw new Error('Request must be a JSON object.');
	const value = input as Record<string, unknown>;
	if (
		Object.keys(value).some((key) => !['callId', 'tool', 'args'].includes(key)) ||
		typeof value.callId !== 'string' ||
		!/^[a-zA-Z0-9-]{1,40}$/.test(value.callId)
	)
		throw new Error('Use a bounded callId and only callId/tool/args keys.');
	if (!['read_balance', 'queue_review'].includes(String(value.tool)))
		throw new Error('Tool is not allowlisted.');
	const args = value.args as Record<string, unknown>;
	if (
		!args ||
		typeof args !== 'object' ||
		Array.isArray(args) ||
		typeof args.documentId !== 'string'
	)
		throw new Error('args.documentId must be a string.');
	const keys =
		value.tool === 'read_balance'
			? ['documentId']
			: ['documentId', 'expectedRevision', 'operationId', 'note'];
	if (Object.keys(args).some((key) => !keys.includes(key)))
		throw new Error('Unexpected argument key.');
	if (
		value.tool === 'queue_review' &&
		(!Number.isSafeInteger(args.expectedRevision) ||
			Number(args.expectedRevision) < 1 ||
			typeof args.operationId !== 'string' ||
			!/^[a-zA-Z0-9-]{1,60}$/.test(args.operationId) ||
			typeof args.note !== 'string' ||
			args.note.trim().length < 5 ||
			args.note.length > 240)
	)
		throw new Error(
			'A write needs expectedRevision, a stable operationId and a 5–240 character note.'
		);
	return clone(value) as RuntimeRequest;
}
export function dispatchRuntime(state: RuntimeState, input: unknown): RuntimeState {
	const next = clone(state);
	if (!next.connected) {
		logRuntime(next, 'Rejected: reconnect before dispatching.');
		return next;
	}
	if (next.attempts >= 8) {
		logRuntime(next, 'Rejected: eight-proposal budget exhausted. Reset for a new experiment.');
		return next;
	}
	next.attempts++;
	try {
		const request = validateRequest(input);
		if (next.calls.some((call) => call.callId === request.callId))
			throw new Error('callId already exists; results must retain this identity.');
		next.calls.push({ ...request, status: 'pending' });
		logRuntime(next, `${request.callId}: validated ${request.tool}; queued, not executed.`);
	} catch (error) {
		logRuntime(next, `Rejected: ${(error as Error).message}`);
	}
	return next;
}
/** Separate durable store/receipt ledger from transport state. Loss of a reply does not undo a committed effect. */
export function executeRuntime(
	state: RuntimeState,
	store: RuntimeStore,
	callId: string,
	allowWrite: boolean,
	loseReply = false
): { state: RuntimeState; store: RuntimeStore } {
	const next = clone(state),
		db = clone(store),
		call = next.calls.find((item) => item.callId === callId);
	if (!next.connected) {
		logRuntime(next, 'Rejected: transport disconnected. Reconnect from the checkpoint.');
		return { state: next, store: db };
	}
	if (!call) {
		logRuntime(next, `${callId}: rejected unknown result identity; no pending call matched.`);
		return { state: next, store: db };
	}
	if (call.status !== 'pending') {
		logRuntime(next, `${callId}: duplicate or late delivery ignored (${call.status}).`);
		return { state: next, store: db };
	}
	const reject = (reason: string) => {
		call.status = 'rejected';
		call.result = reason;
		logRuntime(next, `${callId}: rejected — ${reason}`);
		return { state: next, store: db };
	};
	if (call.args.documentId !== db.documentId) return reject('Document ownership/scope mismatch.');
	let result: string;
	if (call.tool === 'read_balance')
		result = `Balance USD ${(db.balanceMinor / 100).toFixed(2)} at revision ${db.revision}.`;
	else {
		if (!allowWrite) return reject('Write permission denied at execution.');
		const fingerprint = JSON.stringify([
			call.args.documentId,
			call.args.expectedRevision,
			call.args.note
		]);
		const receipt = db.receipts.find((entry) => entry.operationId === call.args.operationId);
		if (receipt) {
			if (receipt.fingerprint !== fingerprint)
				return reject('Operation identity reused with different arguments.');
			result = `Receipt reused: ${receipt.result}`;
		} else {
			if (call.args.expectedRevision !== db.revision)
				return reject(
					`Stale revision ${call.args.expectedRevision}; current revision is ${db.revision}.`
				);
			db.queue.push({ operationId: call.args.operationId!, note: call.args.note! });
			db.revision++;
			result = `One review queued at revision ${db.revision}. No posting or payment.`;
			db.receipts.push({
				operationId: call.args.operationId!,
				fingerprint,
				revision: db.revision,
				result
			});
		}
	}
	if (loseReply) {
		next.connected = false;
		logRuntime(
			next,
			`${callId}: tool finished; reply lost. Durable store retained, pending call unresolved.`
		);
	} else {
		call.status = 'completed';
		call.result = result;
		logRuntime(next, `${callId}: ${result}`);
	}
	return { state: next, store: db };
}
export function cancelRuntime(state: RuntimeState, callId: string): RuntimeState {
	const next = clone(state),
		call = next.calls.find((item) => item.callId === callId);
	if (call?.status === 'pending') {
		call.status = 'cancelled';
		logRuntime(
			next,
			`${callId}: cancelled before local execution. Late delivery cannot mutate state.`
		);
	}
	return next;
}
export function checkpointRuntime(state: RuntimeState): string {
	return JSON.stringify(state);
}
export function reconnectRuntime(serialized: string): RuntimeState {
	if (serialized.length > 40000) throw new Error('Checkpoint exceeds the teaching limit.');
	const value = JSON.parse(serialized) as RuntimeState;
	if (
		value.version !== 1 ||
		!Array.isArray(value.calls) ||
		value.calls.length > 8 ||
		!Array.isArray(value.events) ||
		value.events.length > 30 ||
		value.events.some((event) => typeof event !== 'string' || event.length > 600) ||
		!Number.isInteger(value.attempts) ||
		value.attempts < value.calls.length ||
		value.attempts > 8
	)
		throw new Error('Invalid checkpoint envelope.');
	const ids = new Set<string>();
	for (const call of value.calls) {
		validateRequest({ callId: call.callId, tool: call.tool, args: call.args });
		if (
			ids.has(call.callId) ||
			!['pending', 'completed', 'rejected', 'cancelled'].includes(call.status) ||
			(call.result !== undefined && (typeof call.result !== 'string' || call.result.length > 600))
		)
			throw new Error('Invalid checkpoint call.');
		ids.add(call.callId);
	}
	const next = clone(value);
	next.connected = true;
	logRuntime(
		next,
		'Reconnected from working-state checkpoint; durable receipts remain a separate store.'
	);
	return next;
}

export const voiceWords =
	'I found a fifty dollar difference in the source. I can prepare a review note for you.'.split(
		' '
	);
export type VoiceState = {
	generation: number;
	active: boolean;
	generated: number;
	heard: number;
	queueCleared: boolean;
	context: Array<{ generation: number; text: string; heardMs: number }>;
	toolCalls: Array<{
		callId: string;
		generation: number;
		status: 'pending' | 'accepted' | 'ignored';
	}>;
	events: string[];
};
export const WORD_MS = 250;
export const initialVoice = (): VoiceState => ({
	generation: 1,
	active: true,
	generated: 0,
	heard: 0,
	queueCleared: false,
	context: [],
	toolCalls: [{ callId: 'voice-call-1', generation: 1, status: 'pending' }],
	events: ['Generation 1 started. Authored words stand in for provider output; no audio is played.']
});
function voiceLog(state: VoiceState, text: string) {
	state.events = [...state.events.slice(-29), text];
}
export function generateVoice(state: VoiceState, count = 6): VoiceState {
	bounded(count, 1, voiceWords.length, 'Generated word count', true);
	const next = clone(state);
	if (!next.active) {
		voiceLog(next, 'Cancelled generation: newly arriving output discarded.');
		return next;
	}
	next.generated = Math.min(voiceWords.length, next.generated + count);
	voiceLog(
		next,
		`g${next.generation}: generated ${next.generated * WORD_MS} ms; heard remains ${next.heard * WORD_MS} ms.`
	);
	return next;
}
export function hearVoice(state: VoiceState, count = 2): VoiceState {
	bounded(count, 1, voiceWords.length, 'Heard word count', true);
	const next = clone(state);
	if (!next.active) {
		voiceLog(next, 'Cleared audio queue: there is nothing left to hear.');
		return next;
	}
	next.heard = Math.min(next.generated, next.heard + count);
	voiceLog(
		next,
		`g${next.generation}: listener reached ${next.heard * WORD_MS} ms (${next.heard} complete authored words).`
	);
	return next;
}
export function interruptVoice(state: VoiceState): VoiceState {
	const next = clone(state);
	if (!next.active) return next;
	next.active = false;
	next.queueCleared = true;
	next.context.push({
		generation: next.generation,
		text: voiceWords.slice(0, next.heard).join(' '),
		heardMs: next.heard * WORD_MS
	});
	voiceLog(
		next,
		`Barge-in: cancelled g${next.generation}, cleared ${(next.generated - next.heard) * WORD_MS} ms unheard buffer; context truncated to ${next.heard * WORD_MS} ms.`
	);
	return next;
}
export function startNextVoice(state: VoiceState): VoiceState {
	if (state.active) return state;
	const next = clone(state);
	if (next.generation >= 5) {
		voiceLog(next, 'Five-generation teaching budget reached. Reset to continue.');
		return next;
	}
	next.generation++;
	next.active = true;
	next.generated = 0;
	next.heard = 0;
	next.queueCleared = false;
	next.toolCalls.push({
		callId: `voice-call-${next.generation}`,
		generation: next.generation,
		status: 'pending'
	});
	voiceLog(
		next,
		`g${next.generation}: new response identity; previous context contains only the heard prefix.`
	);
	return next;
}
export function resolveVoiceTool(state: VoiceState, callId: string): VoiceState {
	const next = clone(state),
		call = next.toolCalls.find((item) => item.callId === callId);
	if (!call) {
		voiceLog(next, `${callId}: unknown call ignored.`);
		return next;
	}
	if (call.status !== 'pending') {
		voiceLog(next, `${callId}: duplicate result ignored (${call.status}).`);
		return next;
	}
	if (call.generation !== next.generation || !next.active) {
		call.status = 'ignored';
		voiceLog(
			next,
			`${callId}: stale generation result retained only in trace; current response unchanged.`
		);
	} else {
		call.status = 'accepted';
		voiceLog(
			next,
			`${callId}: matched active g${next.generation}; read-only result accepted: source difference USD 50.00.`
		);
	}
	return next;
}

export type ProviderFixture = {
	id: string;
	label: string;
	context: number;
	maxOutput: number;
	inputPerMillion: number;
	outputPerMillion: number;
	latency: number;
	minor: number;
	critical: number;
	cases: number;
	capabilities: Array<'text' | 'vision'>;
};
export const providerFixtures: ProviderFixture[] = [
	{
		id: 'compact',
		label: 'Compact profile',
		context: 8192,
		maxOutput: 2048,
		inputPerMillion: 0.3,
		outputPerMillion: 1.2,
		latency: 0.9,
		minor: 10,
		critical: 5,
		cases: 100,
		capabilities: ['text']
	},
	{
		id: 'balanced',
		label: 'Balanced profile',
		context: 32768,
		maxOutput: 8192,
		inputPerMillion: 2,
		outputPerMillion: 8,
		latency: 2.4,
		minor: 4,
		critical: 1,
		cases: 100,
		capabilities: ['text', 'vision']
	},
	{
		id: 'deliberate',
		label: 'Deliberate profile',
		context: 65536,
		maxOutput: 16384,
		inputPerMillion: 8,
		outputPerMillion: 24,
		latency: 5,
		minor: 1,
		critical: 0,
		cases: 100,
		capabilities: ['text', 'vision']
	}
];
export type RoutingConfig = {
	inputTokens: number;
	outputTokens: number;
	maxCallCost: number;
	maxLatency: number;
	criticalLimit: number;
	minorCost: number;
	criticalCost: number;
	capability: 'text' | 'vision';
};
export const defaultRouting: RoutingConfig = {
	inputTokens: 2000,
	outputTokens: 500,
	maxCallCost: 0.1,
	maxLatency: 6,
	criticalLimit: 1,
	minorCost: 2,
	criticalCost: 50,
	capability: 'text'
};
export function compareRoutes(config: RoutingConfig) {
	bounded(config.inputTokens, 1, 100000, 'Input tokens', true);
	bounded(config.outputTokens, 1, 20000, 'Reserved output tokens', true);
	bounded(config.maxCallCost, 0, 10, 'Per-call budget');
	bounded(config.maxLatency, 0.1, 60, 'Latency limit');
	bounded(config.criticalLimit, 0, 100, 'Critical error ceiling', true);
	bounded(config.minorCost, 0, 10000, 'Minor mistake cost');
	bounded(config.criticalCost, 0, 100000, 'Critical mistake cost');
	if (!['text', 'vision'].includes(config.capability))
		throw new Error('Choose text or vision capability.');
	const rows = providerFixtures.map((provider) => {
		const callCost =
			(config.inputTokens * provider.inputPerMillion +
				config.outputTokens * provider.outputPerMillion) /
			1e6;
		const reviewCostPer100 =
			provider.minor * config.minorCost + provider.critical * config.criticalCost;
		const reasons: string[] = [];
		if (!provider.capabilities.includes(config.capability))
			reasons.push('Required capability absent');
		if (config.inputTokens + config.outputTokens > provider.context)
			reasons.push('Input plus reserved output exceeds context');
		if (config.outputTokens > provider.maxOutput)
			reasons.push('Reserved output exceeds output cap');
		if (callCost > config.maxCallCost + 1e-12) reasons.push('API call exceeds budget');
		if (provider.latency > config.maxLatency)
			reasons.push('Measured fixture latency exceeds limit');
		if (provider.critical > config.criticalLimit)
			reasons.push('Observed critical errors exceed ceiling');
		return {
			...provider,
			callCost,
			apiPer100: callCost * 100,
			reviewCostPer100,
			totalPer100: callCost * 100 + reviewCostPer100,
			eligible: reasons.length === 0,
			reasons
		};
	});
	const winner =
		rows.filter((row) => row.eligible).sort((a, b) => a.totalPer100 - b.totalPer100)[0]?.id ?? null;
	return {
		schema: 'teaching-routing-v1',
		config: clone(config),
		rows,
		winner,
		provenance:
			'Authored synthetic measurements, 100 fictional cases per profile. Error categories are disjoint. No provider benchmark, guarantee, current pricing or live inference.'
	};
}
