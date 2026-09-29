import { describe, expect, it } from 'vitest';
import {
	buildDocument,
	documentFixture,
	expandStructure,
	typeCell,
	safeTsv,
	evidenceAnalysis,
	canonicalMillions,
	evidenceFixture,
	initialRuntime,
	initialRuntimeStore,
	dispatchRuntime,
	executeRuntime,
	runtimeFixture,
	checkpointRuntime,
	reconnectRuntime,
	cancelRuntime,
	initialVoice,
	generateVoice,
	hearVoice,
	interruptVoice,
	startNextVoice,
	resolveVoiceTool,
	WORD_MS,
	compareRoutes,
	defaultRouting
} from './builder';

describe('document structure and evidence-preserving typing', () => {
	it('expands both header spans without duplicating data or covering the second-year header', () => {
		const grid = expandStructure(documentFixture());
		expect(grid.map((row) => row.length)).toEqual(Array(7).fill(3));
		expect(grid[1][0]).toMatchObject({ covered: true, raw: '', anchor: 'A1' });
		expect(grid[0][2]).toMatchObject({ covered: true, raw: '', anchor: 'B1' });
		expect(grid[1][2]).toMatchObject({ covered: false, raw: '2024', anchor: 'C2' });
		expect(() => expandStructure([[{ text: 'bad', rowSpan: 2 }]])).toThrow();
		expect(() =>
			expandStructure([
				[{ text: 'a' }, { text: 'b', rowSpan: 2 }],
				[{ text: 'overlap', colSpan: 2 }]
			])
		).toThrow('Overlapping');
	});
	it('keeps identifiers, blanks, exact zeros, negatives and locale decisions distinct', () => {
		expect(typeCell('0012', 'identifier', 'dot')).toMatchObject({
			value: '0012',
			kind: 'identifier'
		});
		expect(typeCell('', 'amount', 'dot')).toMatchObject({ value: null, kind: 'blank' });
		expect(typeCell('0', 'amount', 'dot')).toMatchObject({ minor: 0, kind: 'money' });
		expect(typeCell('(1,234.56)', 'amount', 'dot').minor).toBe(-123456);
		expect(typeCell('(1.234,56)', 'amount', 'comma').minor).toBe(-123456);
		expect(typeCell('1,234', 'amount', 'undecided').kind).toBe('unresolved');
		expect(typeCell('1,234', 'amount', 'comma').kind).toBe('unresolved');
		expect(typeCell('1.234,56', 'amount', 'dot').kind).toBe('unresolved');
		expect(
			typeCell('0.10', 'amount', 'dot').minor! + typeCell('0.20', 'amount', 'dot').minor!
		).toBe(30);
	});
	it('reconciles a reviewed correction while retaining the raw discrepancy and unknown prior cell', () => {
		const before = buildDocument(false, 'dot');
		expect(before.checks[0].differenceMinor).toBe(1000);
		expect(before.authoredSourceRows[5][1].text).toBe('50.00');
		expect(before.ocrRows[5][1].text).toBe('60.00');
		expect(before.checks[1]).toMatchObject({
			complete: false,
			unavailable: 1,
			differenceMinor: null
		});
		const corrections = [
			{ row: 5, col: 1, value: '50.00', reason: 'Authored source line reads 50.00.' }
		];
		const after = buildDocument(false, 'dot', corrections);
		expect(after.checks[0].differenceMinor).toBe(0);
		expect(after.typed[5][1]).toMatchObject({
			original: '60.00',
			value: 50,
			correction: corrections[0]
		});
		expect(before.typed[5][1].value).toBe(60);
		expect(after.checks[1].complete).toBe(false);
		expect(
			buildDocument(false, 'dot', [
				...corrections,
				{
					row: 4,
					col: 2,
					value: '0',
					reason: 'Reviewer establishes zero from source clarification.'
				}
			]).checks[1].differenceMinor
		).toBe(0);
		expect(() => buildDocument(false, 'dot', [{ ...corrections[0], reason: '' }])).toThrow();
	});
	it('exports text without turning leading-zero IDs or authored formulas into executable spreadsheet cells', () => {
		expect(safeTsv([['0012', '=WEBSERVICE("example")', ' @x', null, -250, 'multi\nline']])).toBe(
			"'0012\t'=WEBSERVICE(\"example\")\t' @x\t\t-250\tmulti line"
		);
		expect(() => safeTsv([[Infinity]])).toThrow();
	});
});

describe('evidence comparability', () => {
	it('withholds a cross-basis growth headline even when a numerical quotient exists', () => {
		const old = evidenceAnalysis(false);
		expect(old.naiveGrowth).toBeCloseTo(0.012);
		expect(old.growth).toBeNull();
		expect(old.cagr).toBeNull();
		const comparable = evidenceAnalysis(true);
		expect(comparable.growth).toBeCloseTo(0.1);
		expect(comparable.cagr).toBeCloseTo(Math.sqrt(101.2 / 80) - 1);
		expect(comparable.intervals).toBe(2);
		expect(comparable.series.map((row) => row.id)).toEqual(['A23-restated', 'A24-restated', 'A25']);
	});
	it('normalizes thousand units, excludes missing values and preserves the actual denominator IDs', () => {
		expect(canonicalMillions(evidenceFixture[5])).toBe(60);
		const missing = evidenceAnalysis(true);
		expect(missing.denominator).toBe(161.2);
		expect(missing.missingIds).toEqual(['C25']);
		const disclosed = evidenceAnalysis(true, 20);
		expect(disclosed.denominator).toBe(181.2);
		expect(disclosed.share).toBeCloseTo(101.2 / 181.2);
		expect(disclosed.includedIds).toContain('C25-user-v2');
		expect(disclosed.observations.find((row) => row.id === 'C25')?.value).toBeNull();
		expect(evidenceAnalysis(true, 0).missingIds).toEqual([]);
		expect(() => evidenceAnalysis(true, NaN)).toThrow();
	});
});

describe('call identity, permission, revision and durable receipt runtime', () => {
	const queued = () =>
		dispatchRuntime(dispatchRuntime(initialRuntime(), runtimeFixture[0]), runtimeFixture[1]);
	it('matches out-of-order calls by identity and rejects malformed or unknown requests/results', () => {
		let { state, store } = executeRuntime(queued(), initialRuntimeStore(), 'call-review', true);
		expect(state.calls[0].status).toBe('pending');
		expect(store.queue).toHaveLength(1);
		({ state, store } = executeRuntime(state, store, 'call-read', true));
		expect(state.calls[0].result).toContain('revision 2');
		const duplicate = executeRuntime(state, store, 'call-review', true);
		expect(duplicate.store.queue).toHaveLength(1);
		expect(executeRuntime(state, store, 'wrong-call', true).state.events.at(-1)).toContain(
			'unknown'
		);
		expect(
			dispatchRuntime(initialRuntime(), { ...runtimeFixture[0], tool: 'send_payment' }).calls
		).toHaveLength(0);
		expect(
			dispatchRuntime(initialRuntime(), {
				...runtimeFixture[0],
				args: { documentId: 'DOC-7', unexpected: true }
			}).calls
		).toHaveLength(0);
	});
	it('enforces permission at execution and detects stale revisions without mutation', () => {
		expect(
			executeRuntime(queued(), initialRuntimeStore(), 'call-review', false).store.queue
		).toEqual([]);
		const db = { ...initialRuntimeStore(), revision: 2 };
		const stale = executeRuntime(queued(), db, 'call-review', true);
		expect(stale.state.calls[1].result).toContain('Stale revision');
		expect(stale.store).toEqual(db);
		const cancelled = cancelRuntime(queued(), 'call-review');
		expect(
			executeRuntime(cancelled, initialRuntimeStore(), 'call-review', true).store.queue
		).toHaveLength(0);
	});
	it('replays the pending call after a lost reply without executing its effect twice', () => {
		const pending = queued(),
			checkpoint = checkpointRuntime(pending);
		const lost = executeRuntime(pending, initialRuntimeStore(), 'call-review', true, true);
		expect(lost.state.connected).toBe(false);
		expect(lost.store.queue).toHaveLength(1);
		const replay = executeRuntime(reconnectRuntime(checkpoint), lost.store, 'call-review', true);
		expect(replay.store.queue).toHaveLength(1);
		expect(replay.store.revision).toBe(2);
		expect(replay.state.calls[1].result).toContain('Receipt reused');
		expect(pending.calls[1].status).toBe('pending');
		const changed = dispatchRuntime(initialRuntime(), {
			...runtimeFixture[1],
			args: { ...runtimeFixture[1].args, note: 'Different request under an old key.' }
		});
		expect(
			executeRuntime(changed, lost.store, 'call-review', true).state.calls[0].result
		).toContain('different arguments');
	});
	it('validates checkpoint identity and enforces a bounded proposal budget', () => {
		const broken = JSON.parse(checkpointRuntime(queued()));
		broken.calls.push(broken.calls[0]);
		expect(() => reconnectRuntime(JSON.stringify(broken))).toThrow();
		let state = initialRuntime();
		for (let i = 0; i < 9; i++)
			state = dispatchRuntime(state, { ...runtimeFixture[0], callId: `call-${i}` });
		expect(state.calls).toHaveLength(8);
		expect(state.events.at(-1)).toContain('budget');
	});
});

describe('voice coordination without real audio', () => {
	it('retains only actually heard authored words, clears queued audio and rejects a stale result', () => {
		const generated = generateVoice(initialVoice(), 12),
			heard = hearVoice(generated, 4),
			cancelled = interruptVoice(heard);
		expect(cancelled.context[0]).toEqual({
			generation: 1,
			text: 'I found a fifty',
			heardMs: 4 * WORD_MS
		});
		expect(cancelled.generated).toBe(12);
		expect(cancelled.queueCleared).toBe(true);
		expect(hearVoice(cancelled).heard).toBe(4);
		let next = startNextVoice(cancelled);
		next = resolveVoiceTool(next, 'voice-call-1');
		expect(next.toolCalls[0].status).toBe('ignored');
		expect(next.toolCalls[1].status).toBe('pending');
		expect(next.generated).toBe(0);
		expect(next.context[0].text).not.toContain('dollar');
		expect(resolveVoiceTool(next, 'voice-call-2').toolCalls[1].status).toBe('accepted');
	});
	it('never hears more than generated and keeps duplicate callbacks from changing state', () => {
		expect(hearVoice(initialVoice()).heard).toBe(0);
		const accepted = resolveVoiceTool(initialVoice(), 'voice-call-1');
		expect(resolveVoiceTool(accepted, 'voice-call-1').events.at(-1)).toContain('duplicate');
		expect(generateVoice(interruptVoice(initialVoice())).generated).toBe(0);
	});
});

describe('synthetic routing economics', () => {
	it('computes separate call, quality and weighted per100 costs instead of using canned rankings', () => {
		const result = compareRoutes(defaultRouting);
		expect(result.rows[0].callCost).toBeCloseTo(0.0012);
		expect(result.rows[1].apiPer100).toBeCloseTo(0.8);
		expect(result.rows[1].reviewCostPer100).toBe(58);
		expect(result.rows[2].totalPer100).toBeCloseTo(4.8);
		expect(result.winner).toBe('deliberate');
		expect(
			compareRoutes({ ...defaultRouting, criticalLimit: 5, minorCost: 0, criticalCost: 0 }).winner
		).toBe('compact');
	});
	it('reserves output within context and distinguishes budget, latency, quality and capability failures', () => {
		const result = compareRoutes({
			...defaultRouting,
			inputTokens: 8000,
			outputTokens: 500,
			capability: 'vision',
			maxLatency: 3
		});
		expect(result.rows[0].reasons).toEqual(
			expect.arrayContaining([
				'Required capability absent',
				'Input plus reserved output exceeds context'
			])
		);
		expect(result.rows[2].reasons).toContain('Measured fixture latency exceeds limit');
		expect(result.winner).toBe('balanced');
		expect(compareRoutes({ ...defaultRouting, maxCallCost: 0 }).winner).toBeNull();
		expect(() => compareRoutes({ ...defaultRouting, inputTokens: NaN })).toThrow();
	});
});
