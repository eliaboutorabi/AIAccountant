import { describe, expect, test } from 'vitest';
import {
	attentionMixture,
	attentionValues,
	thresholdResult,
	thresholdCases,
	joinResult,
	initialAgentState,
	advanceAgent,
	approveAgent
} from './interactive-math';
import { interactiveVisuals } from './interactive';
import { modules } from '../index';
import { regressionData, regressionMetrics, regressionStep } from '$lib/engines/regression';
import { collectionSeries, forecastFromHistory } from '$lib/engines/forecast';
import { encode, decode } from 'gpt-tokenizer/encoding/o200k_base';

describe('inline explanations preserve the calculation they teach', () => {
	test('causal softmax is normalized, with exactly zero future contributions at every query', () => {
		for (let q = 0; q < 4; q++) {
			const row = attentionMixture(q);
			expect(row.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 14);
			for (let k = q + 1; k < 4; k++) {
				expect(row.weights[k]).toBe(0);
				expect(row.contributions[k]).toEqual([0, 0]);
			}
			for (let d = 0; d < 2; d++)
				expect(row.output[d]).toBeCloseTo(
					row.weights.reduce((sum, w, k) => sum + w * attentionValues[k][d], 0),
					14
				);
		}
		expect(attentionMixture(0).output).toEqual([2, 0]);
		expect(attentionMixture(1).weights[1]).toBeCloseTo(
			Math.exp(1 / Math.sqrt(2)) / (1 + Math.exp(1 / Math.sqrt(2))),
			14
		);
		expect(() => attentionMixture(4)).toThrow(RangeError);
	});
	test('threshold boundaries, undefined precision and cost match the ten unchanged records', () => {
		const original = JSON.stringify(thresholdCases);
		expect(thresholdResult(0)).toEqual({
			tp: 4,
			fp: 6,
			fn: 0,
			tn: 0,
			reviewed: 10,
			precision: 0.4,
			recall: 1,
			cost: 60
		});
		expect(thresholdResult(1)).toEqual({
			tp: 0,
			fp: 0,
			fn: 4,
			tn: 6,
			reviewed: 0,
			precision: null,
			recall: 0,
			cost: 400
		});
		expect(thresholdResult(0.5)).toMatchObject({ tp: 3, fp: 2, fn: 1, tn: 4, cost: 120 });
		expect(thresholdResult(0.41).tp).toBe(4);
		expect(thresholdResult(0.42).tp).toBe(3);
		expect(JSON.stringify(thresholdCases)).toBe(original);
	});
	test('row multiplicity is visible even with a correct invoice key', () => {
		expect(joinResult('customer')).toMatchObject({ invoiceTotal: 900, paymentTotal: 600 });
		expect(joinResult('customer').rows).toHaveLength(6);
		expect(joinResult('invoice')).toMatchObject({ invoiceTotal: 400, paymentTotal: 300 });
		expect(joinResult('invoice').rows).toHaveLength(3);
		expect(joinResult('aggregate')).toMatchObject({ invoiceTotal: 300, paymentTotal: 300 });
		expect(joinResult('aggregate').rows).toHaveLength(2);
	});
	test('agent state cannot write before approval, cannot approve early, and blocks out-of-scope actions', () => {
		let state = initialAgentState();
		expect(approveAgent(state)).toEqual(state);
		for (let i = 0; i < 3; i++) state = advanceAgent(state, false);
		expect(state).toMatchObject({ phase: 3, totalCents: 14400, posted: false, approved: false });
		state = advanceAgent(state, false);
		expect(state.posted).toBe(false);
		expect(state.log.at(-1)).toContain('denied');
		state = advanceAgent(approveAgent(state), false);
		expect(state.posted).toBe(true);
		expect(advanceAgent(state, false)).toEqual(state);
		const blocked = advanceAgent(advanceAgent(initialAgentState(), true), true);
		expect(blocked).toMatchObject({ blocked: true, posted: false, totalCents: null });
		expect(advanceAgent(approveAgent(blocked), true)).toEqual(blocked);
	});
	test('the learning step computes lower training error from actual gradients', () => {
		const before = { weight: 0.15, bias: 0.05, step: 0 };
		const update = regressionStep(before, 0.15);
		expect(update.next.weight).toBeCloseTo(before.weight - 0.15 * update.gradient.weight, 14);
		expect(regressionMetrics(update.next, regressionData.train).mse).toBeLessThan(
			regressionMetrics(before, regressionData.train).mse
		);
		expect(before).toEqual({ weight: 0.15, bias: 0.05, step: 0 });
	});
	test('forecast inputs stop at the origin; seasonal uses the next calendar month last year', () => {
		const series = collectionSeries(42, 'stable');
		const origin = 47;
		const prefix = series.slice(0, origin + 1).map((r) => r.value);
		expect(forecastFromHistory(prefix, 'last', 1)).toBe(series[origin].value);
		expect(forecastFromHistory(prefix, 'seasonal', 1)).toBe(series[origin - 11].value);
		expect(forecastFromHistory(prefix, 'moving', 1)).toBeCloseTo(
			series.slice(origin - 2, origin + 1).reduce((s, r) => s + r.value, 0) / 3,
			12
		);
	});
	test('real o200k IDs round trip multilingual text and space-sensitive pieces', () => {
		const text = 'INV-2026-009381: €1,208.00 · 売上高';
		expect(decode(encode(text))).toBe(text);
		expect(encode('invoice')).not.toEqual(encode(' invoice'));
		expect(encode('')).toEqual([]);
	});
	test('all seven figure placements point to actual chapter sections', () => {
		expect(interactiveVisuals).toHaveLength(7);
		expect(new Set(interactiveVisuals.map((v) => v.id)).size).toBe(7);
		for (const visual of interactiveVisuals)
			expect(
				modules.find((m) => m.id === visual.module)?.sections.some((s) => s.id === visual.section)
			).toBe(true);
	});
});
