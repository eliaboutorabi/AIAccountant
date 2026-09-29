import { describe, expect, it } from 'vitest';
import { FinanceMLP, makeInvoiceSplits } from './finance-mlp';
import { FinanceTransformer } from './finance-transformer';
import {
	CHARACTER_VOCABULARY,
	FINANCE_CORPUS,
	characterTokens,
	decodeCharacters,
	encodeCharacters
} from './finance-corpus';
import { softmax } from './numerics';

describe('real invoice classifier', () => {
	it('backpropagation agrees with finite differences, including regularization and biases', () => {
		const model = new FinanceMLP({ regularization: 0.02 });
		const before = model.weights();
		const checks = model.gradientCheck();
		expect(Math.max(...checks.map((check) => check.absoluteError))).toBeLessThan(1e-7);
		expect(checks.filter((check) => Math.abs(check.analytical) > 1e-5).length).toBeGreaterThan(4);
		expect(model.weights()).toEqual(before);
	});

	it('actually learns from training examples and measures independent validation performance', () => {
		const model = new FinanceMLP();
		const initial = model.metrics();
		const before = model.weights();
		model.train(200);
		const after = model.metrics();
		expect(after.train.loss).toBeLessThan(initial.train.loss * 0.7);
		expect(after.validation.loss).toBeLessThan(initial.validation.loss);
		expect(after.validation.accuracy).toBeGreaterThan(0.7);
		expect(model.weights()).not.toEqual(before);
		expect(model.parameterCount).toBe(25);
		expect(after.train.tp + after.train.fp + after.train.tn + after.train.fn).toBe(96);
	});

	it('inspection reports activations and a prediction computed from the displayed trained weights', () => {
		const model = new FinanceMLP();
		model.train(10);
		const trace = model.inspect([0.6, 0.2]);
		const w = trace.weights;
		const hidden = Array.from({ length: model.config.hiddenSize }, (_, h) =>
			Math.tanh(
				trace.scaledInput[0] * w[0].values[h] +
					trace.scaledInput[1] * w[0].values[h + model.config.hiddenSize] +
					w[1].values[h]
			)
		);
		const logit = hidden.reduce((sum, value, h) => sum + value * w[2].values[h], w[3].values[0]);
		expect(trace.hidden).toEqual(hidden);
		expect(trace.logit).toBeCloseTo(logit, 12);
		expect(trace.probability).toBe(model.predict([0.6, 0.2]));
	});

	it('final holdout is separate, committed once, and cannot be reused for continuing training', () => {
		const a = makeInvoiceSplits(42, 16);
		const b = makeInvoiceSplits(42, 96);
		expect(a.validation).toEqual(b.validation);
		expect(a.test).toEqual(b.test);
		expect(a.train.every((row) => row.split === 'train')).toBe(true);
		const model = new FinanceMLP();
		expect('test' in model.metrics()).toBe(false);
		expect('test' in model.data).toBe(false);
		model.train(2);
		const final = model.commitFinal(0.65);
		expect(final.score.count).toBe(192);
		expect(model.commitFinal(0.1)).toEqual(final);
		expect(() => model.train(1)).toThrow('Final holdout');
	});

	it('is reproducible across chunks, metrics and inspection, and guards its data', () => {
		const a = new FinanceMLP({ seed: 11 });
		const b = new FinanceMLP({ seed: 11 });
		a.train(20);
		b.train(10);
		b.metrics();
		b.inspect([0.2, 0.8]);
		b.data.train[0].label = (1 - b.data.train[0].label) as 0 | 1;
		b.train(10);
		expect(a.weights()).toEqual(b.weights());
		expect(() => a.predict([2, 0])).toThrow();
		expect(() => a.train(10000)).toThrow();
	});
});

describe('real character transformer', () => {
	it('round-trips its declared character vocabulary and flags unsupported characters', () => {
		const text = 'Invoice INV-204: -$1,240.50\n2026-09-30';
		expect(decodeCharacters(encodeCharacters(text))).toBe(text);
		expect(characterTokens('€文')[0]).toMatchObject({ id: 0, unknown: true, original: '€' });
		expect(decodeCharacters([0])).toBe('\uFFFD');
		expect(new Set(CHARACTER_VOCABULARY).size).toBe(CHARACTER_VOCABULARY.length);
	});

	it('differentiates every parameter family, including causal attention and normalization', () => {
		const model = new FinanceTransformer({ width: 8 });
		const before = model.weights();
		const checks = model.gradientCheck();
		expect(Math.max(...checks.map((check) => check.absoluteError))).toBeLessThan(1e-6);
		for (const weights of before)
			expect(
				checks.some(
					(check) => check.parameter === weights.name && Math.abs(check.analytical) > 1e-6
				)
			).toBe(true);
		expect(model.weights()).toEqual(before);
	});

	it('normalizes measured attention, masks future positions, and preserves earlier logits', () => {
		const model = new FinanceTransformer();
		const trace = model.inspect('cash');
		const changedFuture = model.inspect('casX');
		for (const head of trace.attention) {
			for (let r = 0; r < head.length; r++) {
				expect(head[r].reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
				expect(head[r].slice(r + 1).every((value) => value === 0)).toBe(true);
			}
		}
		expect(trace.logits.slice(0, 3)).toEqual(changedFuture.logits.slice(0, 3));
		expect(trace.logits[3]).not.toEqual(changedFuture.logits[3]);
		for (let r = 0; r < trace.tokens.length; r++)
			expect(trace.probabilities[r]).toEqual(softmax(trace.logits[r]));
	});

	it('inspects the attention values and residual operations actually used in the forward pass', () => {
		const model = new FinanceTransformer();
		const trace = model.inspect('cash ');
		const d = model.config.width / model.config.heads;
		const row = 4;
		const head = 1;
		const scores = Array.from(
			{ length: row + 1 },
			(_, s) =>
				trace.queries[row]
					.slice(head * d, (head + 1) * d)
					.reduce((sum, value, i) => sum + value * trace.keys[s][head * d + i], 0) / Math.sqrt(d)
		);
		expect(trace.attention[head][row]).toEqual(softmax(scores));
		for (let c = 0; c < model.config.width; c++) {
			const h = Math.floor(c / d);
			const mixed = trace.attention[h][row].reduce(
				(sum, weight, s) => sum + weight * trace.values[s][c],
				0
			);
			expect(trace.attentionOutput[row][c]).toBeCloseTo(mixed, 12);
			expect(trace.attentionResidual[row][c]).toBeCloseTo(
				trace.embedded[row][c] + trace.attentionMixed[row][c],
				12
			);
			expect(trace.finalResidual[row][c]).toBeCloseTo(
				trace.attentionResidual[row][c] + trace.feedForward[row][c],
				12
			);
		}
	});

	it('uses original disjoint documents and genuinely shifted training targets', () => {
		const train = new Set<string>(FINANCE_CORPUS.train);
		expect(FINANCE_CORPUS.validation.some((text) => train.has(text))).toBe(false);
		expect(FINANCE_CORPUS.test.some((text) => train.has(text))).toBe(false);
		const model = new FinanceTransformer();
		const example = model.trainingExample();
		expect(example.inputs.slice(1)).toEqual(example.targets.slice(0, -1));
		expect(example.inputText).toBe(`\n${FINANCE_CORPUS.train[0]}`.slice(0, 32));
		expect(example.targetText).toBe(FINANCE_CORPUS.train[0].slice(0, 32));
		expect(() => model.trainingExample(40)).toThrow();
	});

	it('learns next-character prediction with real gradient updates on CPU', () => {
		const model = new FinanceTransformer();
		const before = model.metrics();
		const initialWeights = model.weights();
		for (let i = 0; i < 3; i++) model.train(40);
		const after = model.metrics();
		expect(after.train.loss).toBeLessThan(before.train.loss * 0.8);
		expect(after.validation.loss).toBeLessThan(before.validation.loss * 0.85);
		expect(model.step).toBe(120);
		model.weights().forEach((p, i) => expect(p.values).not.toEqual(initialWeights[i].values));
		expect(after.train.perplexity).toBeCloseTo(Math.exp(after.train.loss), 10);
		expect(model.parameterCount).toBe(5761);
	}, 15000);

	it('generation changes context and sampling, but neither parameters nor the training RNG', () => {
		const a = new FinanceTransformer({ width: 8 });
		const b = new FinanceTransformer({ width: 8 });
		a.train(2);
		b.train(2);
		const before = a.weights();
		const sample = a.generate('cash ', { tokens: 4, temperature: 0, seed: 3 });
		expect(sample.tokens.every((token) => token.samplingProbability === 1)).toBe(true);
		expect(sample.tokens[0].id).toBe(a.inspect('cash ').next[0].id);
		expect(a.generate('cash ', { tokens: 4, temperature: 0.8, seed: 4 })).toEqual(
			a.generate('cash ', { tokens: 4, temperature: 0.8, seed: 4 })
		);
		a.metrics();
		expect(a.weights()).toEqual(before);
		a.train(2);
		b.train(2);
		expect(a.weights()).toEqual(b.weights());
	});

	it('keeps final evaluation unavailable until commitment and locks further fitting', () => {
		const model = new FinanceTransformer({ width: 8 });
		expect('test' in model.metrics()).toBe(false);
		const final = model.commitFinal();
		expect(final.score.documents).toBe(8);
		expect(final.score.targetTokens).toBeGreaterThan(300);
		expect(model.commitFinal()).toEqual(final);
		expect(() => model.train()).toThrow('Final holdout');
		expect(() => model.generate('cash', { temperature: -1 })).toThrow();
	});
});
