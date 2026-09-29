import { describe, expect, it } from 'vitest';
import { createEnvironment } from './workflow';
import {
	agentPrompt,
	boundedConfig,
	defaultAgent,
	executeAgentTool,
	parseProposal,
	runLocalAgent
} from './local-agent';

describe('local model proposal boundary', () => {
	it('accepts one exact schema and rejects repaired, fenced, or mixed output', () => {
		expect(parseProposal('{"tool":"read_invoice","arguments":{"invoiceId":"A"}}')).toMatchObject({
			tool: 'read_invoice'
		});
		expect(
			parseProposal('<tool_call>{"name":"read_invoice","arguments":{"invoiceId":"A"}}</tool_call>')
		).toEqual({ tool: 'read_invoice', arguments: { invoiceId: 'A' } });
		for (const text of [
			'```json\n{"tool":"read_invoice","arguments":{"invoiceId":"A"}}\n```',
			'I will do it. {"final":"done","sourceIds":[]}',
			'{"final":"done","sourceIds":[],"tool":"post_journal"}',
			'null'
		])
			expect(() => parseProposal(text)).toThrow();
	});
	it('does not let the model acquire write powers, escape scope, or pass fractional cents', () => {
		const env = createEnvironment();
		expect(
			executeAgentTool({ tool: 'create_review_draft', arguments: {} }, env, true)
		).toMatchObject({ ok: false, code: 'FORBIDDEN' });
		expect(
			executeAgentTool({ tool: 'read_invoice', arguments: { invoiceId: 'CEDAR-A' } }, env, true)
		).toMatchObject({ ok: false, code: 'FORBIDDEN' });
		expect(
			executeAgentTool(
				{
					tool: 'calculate_outstanding',
					arguments: { currency: 'USD', invoiceMinor: 10.5, acceptedPaymentMinor: [] }
				},
				env,
				true
			)
		).toMatchObject({ ok: false, code: 'INVALID_ARGUMENT' });
		expect(env.queue).toEqual([]);
	});
	it('returns actual accepted payments and distinguishes withheld evidence from an empty result', () => {
		const env = createEnvironment();
		expect(
			executeAgentTool({ tool: 'read_payments', arguments: { invoiceId: 'A' } }, env, true)
		).toMatchObject({ ok: true, data: { acceptedPaymentMinor: [30000, 20000] } });
		expect(
			executeAgentTool(
				{ tool: 'search_policy', arguments: { query: 'domestic accommodation limit' } },
				env,
				false
			)
		).toMatchObject({ ok: false, code: 'EVIDENCE_WITHHELD' });
		expect(
			executeAgentTool(
				{ tool: 'search_policy', arguments: { query: 'domestic accommodation limit' } },
				env,
				true
			)
		).toMatchObject({
			ok: true,
			data: {
				passages: expect.arrayContaining([expect.objectContaining({ sourceId: 'TRAVEL-02' })])
			}
		});
	});
	it('withholds policies in the actual prompt and bounds learner settings', () => {
		expect(agentPrompt({ ...defaultAgent, evidence: false }).evidenceIds).toEqual([]);
		expect(agentPrompt({ ...defaultAgent, task: 'travel' }).evidenceIds).toEqual(['TRAVEL-02']);
		expect(
			boundedConfig({ ...defaultAgent, maxTurns: 100, maxTokens: 9000, maxSeconds: 600 })
		).toMatchObject({ maxTurns: 8, maxTokens: 256, maxSeconds: 120 });
	});
});

describe('agent orchestration with explicitly scripted test doubles', () => {
	it('rejects an invoice final answer without observed read and calculator evidence', async () => {
		const result = await runLocalAgent(
			{ ...defaultAgent, maxTurns: 1 },
			async () => '{"final":"Balance is zero.","sourceIds":[]}'
		);
		expect(result.status).toBe('limit');
		expect(result.final).toBeUndefined();
		expect(result.trace[0].result).toMatchObject({ ok: false, code: 'MISSING_EVIDENCE' });
	});
	it('feeds actual tool results back into generation without replacing model content', async () => {
		const generated = [
			'{"tool":"read_invoice","arguments":{"invoiceId":"A"}}',
			'{"tool":"read_payments","arguments":{"invoiceId":"A"}}',
			'{"tool":"calculate_outstanding","arguments":{"currency":"USD","invoiceMinor":100000,"acceptedPaymentMinor":[30000,20000]}}',
			'{"final":"USD 500 remains; investigate the reason.","sourceIds":["INV-A-v1","PAY-09-v1","CALC-A-01","PARTIAL-02"]}'
		];
		let turn = 0;
		const result = await runLocalAgent(defaultAgent, async (messages) => {
			if (turn === 3) expect(messages.at(-1)?.content).toContain('"outstandingMinor":50000');
			return generated[turn++];
		});
		expect(result.status).toBe('finished');
		expect(result.trace).toHaveLength(4);
		expect(result.trace[2].result).toMatchObject({ ok: true, data: { outstandingMinor: 50000 } });
		expect(result.evidenceSupplied).toContain('CALC-A-01');
	});
	it('retains malformed output as an error rather than returning a canned answer', async () => {
		const result = await runLocalAgent(defaultAgent, async () => '{broken');
		expect(result.status).toBe('invalid');
		expect(result.trace[0].raw).toBe('{broken');
		expect(result.trace[0].result).toBeUndefined();
		expect(result.final).toBeUndefined();
	});
	it('enforces turn/time limits before another effect and honors cancellation', async () => {
		const result = await runLocalAgent(
			{ ...defaultAgent, maxTurns: 1 },
			async () => '{"tool":"read_invoice","arguments":{"invoiceId":"A"}}'
		);
		expect(result.status).toBe('limit');
		let time = 0;
		const late = await runLocalAgent(
			defaultAgent,
			async () => {
				time = 100000;
				return '{"tool":"read_invoice","arguments":{"invoiceId":"A"}}';
			},
			() => {},
			() => false,
			() => time
		);
		expect(late.status).toBe('limit');
		expect(late.trace).toHaveLength(0);
		const stopped = await runLocalAgent(
			defaultAgent,
			async () => 'never called',
			() => {},
			() => true
		);
		expect(stopped.status).toBe('stopped');
	});
});
