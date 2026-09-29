import { describe, expect, it } from 'vitest';
import {
	assessClaim,
	CAPSTONE_FINAL_PACK,
	commitCapstone,
	evaluateCapstoneFinal,
	restoreCapstoneCommitment,
	type CapstoneCommitment,
	createEnvironment,
	datasetFor,
	defaultPipeline,
	defaultSearch,
	evaluateWorkflow,
	executeTool,
	gradeTrialFixture,
	money,
	parseMinor,
	retrievalQuestions,
	restoreQueueCheckpoint,
	runPipeline,
	runWorkflow,
	searchPolicies,
	starterSource
} from './workflow';

describe('policy evidence search', () => {
	it('filters effective date, entity, and permissions before ranking', () => {
		const hits = searchPolicies('domestic accommodation limit', defaultSearch);
		expect(hits.some((h) => h.document.id === 'TRAVEL-02')).toBe(true);
		expect(hits.some((h) => ['TRAVEL-01', 'EXEC-02', 'CEDAR-02'].includes(h.document.id))).toBe(
			false
		);
		const old = searchPolicies('domestic accommodation limit', {
			...defaultSearch,
			date: '2026-03-12'
		});
		expect(old.every((h) => h.document.id === 'TRAVEL-01')).toBe(true);
	});
	it('computes term-vector similarity without claiming semantic learning', () => {
		const hits = searchPolicies('domestic accommodation limit', {
			...defaultSearch,
			method: 'term-vector'
		});
		expect(hits.length).toBeGreaterThan(0);
		expect(hits.every((h) => h.score > 0 && h.score <= 1.0000001)).toBe(true);
		expect(searchPolicies('zzznonsense', defaultSearch)).toEqual([]);
	});
	it('rejects a real citation supporting the wrong amount or date', () => {
		const q = retrievalQuestions[0],
			hits = searchPolicies(q.query, { ...defaultSearch, chunkWords: 80 });
		expect(assessClaim(q.claim, hits, q, defaultSearch).pass).toBe(true);
		expect(assessClaim({ ...q.claim, amountMinor: 9000 }, hits, q, defaultSearch).pass).toBe(false);
		const both = searchPolicies(q.query, {
			...defaultSearch,
			enforceDate: false,
			topK: 10,
			chunkWords: 80
		});
		expect(
			assessClaim({ ...q.claim, sourceId: 'TRAVEL-01', amountMinor: 9000 }, both, q, defaultSearch)
				.pass
		).toBe(false);
	});
	it('preserves a missing-evidence result when the required current source is absent', () => {
		const q = retrievalQuestions[0],
			options = { ...defaultSearch, omitCurrent: true };
		const hits = searchPolicies(q.query, options);
		expect(assessClaim(q.claim, hits, q, options).pass).toBe(false);
		expect(assessClaim({ kind: 'abstain' }, hits, q, options).pass).toBe(true);
	});
});
describe('exact pipeline and changed cases', () => {
	it('reconciles the complete declared cohort without losing unmatched or unpaid records', () => {
		const r = runPipeline(datasetFor('base'), defaultPipeline);
		expect(r.controls).toEqual({
			invoices: 200000,
			rawUsd: 145000,
			accepted: 125000,
			quarantinedUsd: 20000,
			matched: 110000,
			unmatched: 15000,
			outstanding: 90000
		});
		expect(r.rows.find((i) => i.id === 'C')?.outstandingMinor).toBe(40000);
		expect(r.complete).toBe(true);
		expect(r.identities.every((i) => i.pass)).toBe(true);
	});
	it('detects inner-join omission and incorrect acceptance even when some totals reconcile', () => {
		expect(
			runPipeline(datasetFor('base'), { ...defaultPipeline, join: 'inner' }).identities[2].pass
		).toBe(false);
		const r = runPipeline(datasetFor('base'), { ...defaultPipeline, duplicatePolicy: 'keep-all' });
		expect(r.identities.every((i) => i.pass)).toBe(true);
		expect(r.complete).toBe(false);
		expect(
			evaluateWorkflow({ ...defaultPipeline, duplicatePolicy: 'keep-all' }).some((c) => !c.pass)
		).toBe(true);
	});
	it('quarantines all versions of a conflicting identity, including earlier rows', () => {
		const r = runPipeline(datasetFor('conflict'), defaultPipeline);
		expect(
			r.decisions.filter((p) => p.row.id === 'P2').every((p) => p.status === 'quarantined')
		).toBe(true);
		expect(r.complete).toBe(false);
	});
	it('does not invent malformed or missing amounts or mix currencies', () => {
		for (const s of ['malformed', 'schema', 'currency'] as const) {
			const r = runPipeline(datasetFor(s), defaultPipeline);
			expect(r.complete).toBe(false);
			expect(r.decisions.at(-1)?.status).toBe('quarantined');
		}
		expect(parseMinor('1O0.00')).toBeNull();
		expect(parseMinor('1e2')).toBeNull();
		expect(parseMinor('1.001')).toBeNull();
		expect(parseMinor('9007199254740992')).toBeNull();
		expect(parseMinor('1.2')).toBe(120);
	});
	it('retains legitimate equal-amount payments with different IDs', () => {
		const d = datasetFor('base');
		d.payments.push({ ...d.payments[1], row: '6', id: 'P5' });
		expect(runPipeline(d, defaultPipeline).controls.accepted).toBe(145000);
	});
});
describe('tool execution and recovery', () => {
	it('strictly validates money and rejects unknown fields and tools', () => {
		const env = createEnvironment();
		expect(
			executeTool(
				{
					tool: 'calculate_outstanding',
					arguments: { currency: 'USD', invoiceMinor: 100000, acceptedPaymentMinor: [30000, 20000] }
				},
				env
			)
		).toMatchObject({ ok: true, data: { outstandingMinor: 50000 } });
		expect(
			executeTool(
				{
					tool: 'calculate_outstanding',
					arguments: { currency: 'USD', invoiceMinor: 1.2, acceptedPaymentMinor: [] }
				},
				env
			)
		).toMatchObject({ ok: false, code: 'INVALID_ARGUMENT' });
		expect(
			executeTool({ tool: 'read_invoice', arguments: { invoiceId: 'A', admin: true } }, env)
		).toMatchObject({ ok: false, code: 'INVALID_ARGUMENT' });
		expect(executeTool({ tool: 'post_journal', arguments: {} }, env)).toMatchObject({
			ok: false,
			code: 'FORBIDDEN'
		});
		expect(
			executeTool({ tool: 'read_invoice', arguments: { invoiceId: 'CEDAR-A' } }, env)
		).toMatchObject({ ok: false, code: 'FORBIDDEN' });
	});
	it('rejects safe inputs whose sum overflows the exact supported range', () => {
		expect(
			executeTool(
				{
					tool: 'calculate_outstanding',
					arguments: {
						currency: 'USD',
						invoiceMinor: 1,
						acceptedPaymentMinor: [Number.MAX_SAFE_INTEGER, 1]
					}
				},
				createEnvironment()
			)
		).toMatchObject({ ok: false, code: 'OUT_OF_RANGE' });
	});
	it('demonstrates response loss after an actual effect and idempotent recovery', () => {
		const env = createEnvironment();
		env.loseNextDraftResponse = true;
		const req = {
			tool: 'create_review_draft',
			arguments: { requestId: 'D8', caseId: 'A', outstandingMinor: 50000, sourceIds: ['INV-A-v1'] }
		};
		expect(executeTool(req, env)).toMatchObject({ ok: false, code: 'TIMEOUT' });
		expect(env.queue.length).toBe(1);
		expect(
			executeTool({ tool: 'draft_status', arguments: { requestId: 'D8' } }, env)
		).toMatchObject({ ok: true, data: { id: 'Q1' } });
		expect(executeTool(req, env)).toMatchObject({ ok: true, replayed: true });
		expect(env.queue.length).toBe(1);
		expect(
			executeTool({ ...req, arguments: { ...req.arguments, outstandingMinor: 40000 } }, env)
		).toMatchObject({ ok: false, code: 'IDEMPOTENCY_CONFLICT' });
	});
	it('shows why a fresh identity duplicates work', () => {
		const env = createEnvironment();
		for (const requestId of ['D8', 'D9'])
			executeTool(
				{
					tool: 'create_review_draft',
					arguments: { requestId, caseId: 'A', outstandingMinor: 50000, sourceIds: ['INV-A-v1'] }
				},
				env
			);
		expect(env.queue.length).toBe(2);
	});
});
describe('workflow outcomes and graders', () => {
	it('keeps cents exact when formatting the largest supported amount', () => {
		expect(money(Number.MAX_SAFE_INTEGER)).toBe('$90,071,992,547,409.91');
		expect(money(-1)).toBe('-$0.01');
		expect(() => money(0.5)).toThrow();
	});
	it('restores valid state without trusting a corrupted fingerprint or repeated identity', () => {
		const env = createEnvironment();
		executeTool(
			{
				tool: 'create_review_draft',
				arguments: {
					requestId: 'D8',
					caseId: 'CASE-A',
					outstandingMinor: 50000,
					sourceIds: ['INV-A-v1']
				}
			},
			env
		);
		const saved = { version: 1, queue: structuredClone(env.queue) };
		expect(restoreQueueCheckpoint(saved)).toEqual(env.queue);
		saved.queue[0].outstandingMinor = 40000;
		expect(restoreQueueCheckpoint(saved)).toBeNull();
		saved.queue = [env.queue[0], { ...env.queue[0], id: 'Q2' }];
		expect(restoreQueueCheckpoint(saved)).toBeNull();
		expect(restoreQueueCheckpoint({ version: 1, queue: [null] })).toBeNull();
		expect(
			executeTool(
				{
					tool: 'create_review_draft',
					arguments: {
						requestId: 'D9',
						caseId: 'CASE-A',
						outstandingMinor: 50000,
						sourceIds: ['FABRICATED']
					}
				},
				env
			)
		).toMatchObject({ ok: false, code: 'INVALID_SOURCE' });
	});
	it('executes a real local workflow with a clearly authored draft', () => {
		const r = runWorkflow(datasetFor('base'), defaultPipeline);
		expect(r.queue).toHaveLength(1);
		expect(r.status).toBe('awaiting_review');
		expect(r.draft).toContain('$500.00');
		expect(r.grades.every((g) => g.pass)).toBe(true);
	});
	it('does not fabricate successful runs when evidence or a tool fails', () => {
		for (const s of ['missing-policy', 'tool-failure', 'conflict'] as const) {
			const r = runWorkflow(datasetFor(s), defaultPipeline);
			expect(r.status).toBe('needs_evidence');
			expect(r.queue).toHaveLength(0);
			expect(r.draft).toContain('Needs evidence');
		}
	});
	it('keeps instruction-like source text out of control flow', () => {
		const r = runWorkflow(datasetFor('hostile'), defaultPipeline);
		expect(r.queue[0].status).toBe('awaiting_review');
		expect(r.trace.every((t) => JSON.stringify(t.request).includes('post_journal') === false)).toBe(
			true
		);
	});
	it('uses correct authored trial denominators and exposes runnable starter text', () => {
		expect(gradeTrialFixture()).toEqual({ passes: 7, trials: 12, consistentCases: 1, cases: 4 });
		expect(starterSource()).toContain('90000n');
	});
});

describe('distinct capstone final pack', () => {
	const commitment = () =>
		commitCapstone(
			defaultPipeline,
			'Preserve invoices; hold unresolved evidence.',
			'2026-09-30T12:00:00.000Z'
		);
	it('requires a valid recorded commitment and rejects stale or empty metadata', () => {
		expect(() => evaluateCapstoneFinal(null as unknown as CapstoneCommitment)).toThrow(
			'commitment'
		);
		expect(() => commitCapstone(defaultPipeline, ' ')).toThrow();
		expect(restoreCapstoneCommitment({ ...commitment(), packId: 'old-pack' })).toBeNull();
		expect(
			restoreCapstoneCommitment({ ...commitment(), config: { ...defaultPipeline, join: 'guess' } })
		).toBeNull();
		expect(restoreCapstoneCommitment(commitment())).toEqual(commitment());
	});
	it('uses different records, amounts and combined conditions from every public development case', () => {
		const final = evaluateCapstoneFinal(commitment());
		expect(final).toHaveLength(8);
		expect(final.every((c) => c.id.startsWith(CAPSTONE_FINAL_PACK))).toBe(true);
		expect(new Set(final.map((c) => c.run.pipeline.controls.invoices)).size).toBe(8);
		const dev = datasetFor('base');
		for (const c of final) {
			expect(
				c.dataset.invoices.some((i) =>
					dev.invoices.some((d) => d.id === i.id || d.source === i.source)
				)
			).toBe(false);
			expect(c.dataset.payments.some((p) => dev.payments.some((d) => d.id === p.id))).toBe(false);
		}
		expect(final[0].run.pipeline.controls).toEqual({
			invoices: 270085,
			rawUsd: 201810,
			accepted: 160295,
			quarantinedUsd: 41515,
			matched: 155060,
			unmatched: 5235,
			outstanding: 115025
		});
		expect(final[2].dataset.policyAvailable).toBe(false);
		expect(final[2].run.pipeline.issues.some((s) => s.includes('Conflicting'))).toBe(true);
		expect(final[3].dataset.payments.filter((p) => parseMinor(p.amount) === null)).toHaveLength(2);
	});
	it('keeps legitimate equal-amount payments, ignores hostile text, and reconciles an actual lost response', () => {
		const c = evaluateCapstoneFinal(commitment())[1];
		expect(c.run.pipeline.rows[0].paidMinor).toBe(116050);
		expect(c.run.pipeline.rows[0].outstandingMinor).toBe(62725);
		expect(c.run.queue).toHaveLength(1);
		expect(c.run.queue[0].sourceIds).toEqual([
			'F02-INV-K-v1',
			'F02-PAY-v1',
			'F02-CALC-v1',
			'PARTIAL-02'
		]);
		expect(c.run.trace.some((e) => !e.result.ok && e.result.code === 'TIMEOUT')).toBe(true);
		expect(c.run.trace.some((e) => e.result.ok && e.result.replayed)).toBe(true);
		expect(c.run.trace.map((e) => (e.request as { tool?: string }).tool).filter(Boolean)).toEqual([
			'read_invoice',
			'calculate_outstanding',
			'create_review_draft',
			'draft_status',
			'create_review_draft'
		]);
		expect(c.run.queue[0].status).toBe('awaiting_review');
	});
	it('escalates incomplete evidence and respects the historical cutoff', () => {
		const final = evaluateCapstoneFinal(commitment());
		expect(final.every((c) => c.pass)).toBe(true);
		for (const c of final.slice(2)) {
			expect(c.status).toBe('needs_evidence');
			expect(c.run.queue).toHaveLength(0);
		}
		expect(final[6].run.pipeline.complete).toBe(true);
		expect(final[6].run.policyId).toBeNull();
		expect(final[6].run.trace[0].result).toMatchObject({
			ok: true,
			data: { snapshot: '2026-06-20' }
		});
	});
	it('exposes faulty variants without mutating the first configuration or its evidence', () => {
		const first = commitment(),
			original = evaluateCapstoneFinal(first);
		for (const config of [
			{ ...defaultPipeline, duplicatePolicy: 'keep-all' as const },
			{ ...defaultPipeline, join: 'inner' as const },
			{ ...defaultPipeline, invalid: 'zero' as const }
		]) {
			const repaired = evaluateCapstoneFinal(
				commitCapstone(config, 'Deliberately test a faulty variant.')
			);
			expect(repaired.some((c) => !c.pass)).toBe(true);
		}
		expect(evaluateCapstoneFinal(first)).toEqual(original);
		expect(first.config).toEqual(defaultPipeline);
	});
});
