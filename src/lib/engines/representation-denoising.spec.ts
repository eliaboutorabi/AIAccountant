import { describe, expect, it } from 'vitest';
import {
	RepresentationExperiment,
	fitSmallTree,
	treeProbability,
	makeRepresentationData,
	type DecisionNode
} from './representations';
import { DenoisingExperiment, makeDenoisingData } from './denoising';

describe('representation comparison and transfer', () => {
	it('fits actual comparable candidates and makes the nonlinear interaction useful', () => {
		const experiment = new RepresentationExperiment();
		for (let i = 0; i < 3; i++) experiment.train(100);
		const result = experiment.metrics();
		const raw = result.candidates.find((m) => m.id === 'raw')!;
		const engineered = result.candidates.find((m) => m.id === 'engineered')!;
		const neural = result.candidates.find((m) => m.id === 'neural')!;
		expect(engineered.validation.accuracy).toBeGreaterThan(0.85);
		expect(neural.validation.accuracy).toBeGreaterThan(0.85);
		expect(raw.validation.accuracy).toBeLessThan(0.7);
		expect(result.candidates.every((m) => m.train.count === 128 && m.validation.count === 96)).toBe(
			true
		);
		expect(experiment.activations().every((row) => row.values.length === 8)).toBe(true);
	});
	it('tree splits are learned from labels and every leaf respects the minimum size', () => {
		const rows = makeRepresentationData(11, 128, 'tree');
		const tree = fitSmallTree(rows);
		expect(tree.left).toBeDefined();
		expect(tree.count).toBe(128);
		function inspectLeaves(node: DecisionNode, depth = 0) {
			expect(depth).toBeLessThanOrEqual(3);
			if (node.left && node.right) {
				expect(node.left.count + node.right.count).toBe(node.count);
				inspectLeaves(node.left, depth + 1);
				inspectLeaves(node.right, depth + 1);
			} else expect(node.count).toBeGreaterThanOrEqual(8);
		}
		inspectLeaves(tree);
		expect(
			rows.every(
				(row) => treeProbability(tree, row.input) > 0 && treeProbability(tree, row.input) < 1
			)
		).toBe(true);
		const flipped = fitSmallTree(rows.map((row) => ({ ...row, label: (1 - row.label) as 0 | 1 })));
		expect(
			treeProbability(tree, rows[3].input) + treeProbability(flipped, rows[3].input)
		).toBeCloseTo(1, 12);
	});
	it('captures actual source weights and gives transfer and scratch the same target examples', () => {
		const a = new RepresentationExperiment();
		const b = new RepresentationExperiment();
		a.train(100);
		b.train(100);
		const source = a.weights();
		a.startTransfer(24, 'related');
		b.startTransfer(24, 'related');
		expect(a.transferWeights()!.reused).toEqual(source);
		expect(a.transferWeights()!.scratch).not.toEqual(source);
		expect(a.transferData()).toEqual(b.transferData());
		const before = a.transferMetrics()!;
		a.trainTransfer(40);
		b.trainTransfer(20);
		b.transferMetrics();
		b.trainTransfer(20);
		expect(a.transferMetrics()).toEqual(b.transferMetrics());
		expect(a.transferWeights()).toEqual(b.transferWeights());
		expect(a.transferMetrics()!.reused.validation.loss).not.toBe(before.reused.validation.loss);
		expect(a.weights()).toEqual(source);
		expect(a.transferMetrics()!.scratch.train.count).toBe(24);
		expect(a.transferMetrics()!.reused.train.count).toBe(24);
		expect(() => a.train(1)).toThrow('captured');
		expect(a.commitTransfer().reused.count).toBe(192);
		expect(() => a.trainTransfer(1)).toThrow();
	});
	it('keeps target validation fixed when the target training budget changes', () => {
		const a = new RepresentationExperiment();
		const b = new RepresentationExperiment();
		a.train(1);
		b.train(1);
		a.startTransfer(16);
		b.startTransfer(48);
		expect(a.transferData()!.validation).toEqual(b.transferData()!.validation);
		const final = a.commit('engineered');
		expect(final.scores.engineered.count).toBe(192);
		expect(a.commit('raw')).toEqual(final);
	});
});

describe('conditional point denoising', () => {
	it('backpropagates mean squared error correctly through both outputs and all parameters', () => {
		const model = new DenoisingExperiment();
		const original = model.weights();
		expect(Math.max(...model.gradientCheck().map((r) => r.absoluteError))).toBeLessThan(1e-7);
		expect(model.weights()).toEqual(original);
		expect(model.parameterCount).toBe(98);
	});
	it('reduces measured held-out denoising error, beyond merely copying noisy coordinates', () => {
		const model = new DenoisingExperiment();
		const before = model.metrics(0.6);
		for (let i = 0; i < 3; i++) model.train(100);
		const after = model.metrics(0.6);
		expect(after.validation.mse).toBeLessThan(before.validation.mse);
		expect(after.validation.mse).toBeLessThan(after.validation.noisyMse * 0.7);
		expect(after.validation.noisyMse).toBe(before.validation.noisyMse);
	});
	it('uses identical evaluation noise draws across levels and never updates on inspection', () => {
		const model = new DenoisingExperiment();
		const before = model.weights();
		const small = model.validationPairs(0.2);
		const large = model.validationPairs(0.8);
		expect(large[0].noisy[0] - large[0].clean[0]).toBeCloseTo(
			4 * (small[0].noisy[0] - small[0].clean[0]),
			12
		);
		expect(small.map((p) => p.clean)).toEqual(large.map((p) => p.clean));
		expect(model.weights()).toEqual(before);
		expect(makeDenoisingData(43, 64, 'validation')).not.toEqual(makeDenoisingData(44, 64, 'test'));
	});
	it('is chunk-reproducible and freezes after revealing the final split', () => {
		const a = new DenoisingExperiment();
		const b = new DenoisingExperiment();
		a.train(20);
		b.train(10);
		b.metrics(0.7);
		b.train(10);
		expect(a.weights()).toEqual(b.weights());
		const final = a.commitFinal(0.4);
		expect(final.count).toBe(128);
		expect(a.commitFinal(0.8)).toEqual(final);
		expect(() => a.train(1)).toThrow('Final cases');
	});
});
