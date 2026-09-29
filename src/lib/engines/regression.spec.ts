import { describe, it, expect } from 'vitest';
import { regressionData, regressionMetrics, regressionStep } from './regression';
describe('actual linear training', () => {
	it('its gradient agrees with a finite difference of normalized MSE', () => {
		const p = { weight: 0.2, bias: 0.1, step: 0 },
			epsilon = 1e-6;
		const loss = (weight: number) =>
			regressionMetrics({ ...p, weight }, regressionData.train).mse / 10000;
		const finite = (loss(p.weight + epsilon) - loss(p.weight - epsilon)) / (2 * epsilon);
		expect(regressionStep(p, 0.1).gradient.weight).toBeCloseTo(finite, 7);
	});
	it('learns and improves held-out customer cases without training on them', () => {
		let p = { weight: 0, bias: 0, step: 0 };
		const before = regressionMetrics(p, regressionData.validation).mse;
		for (let i = 0; i < 500; i++) p = regressionStep(p, 0.2).next;
		expect(regressionMetrics(p, regressionData.validation).mse).toBeLessThan(before / 100);
		expect(p.weight).toBeCloseTo(0.55, 1);
	});
});
