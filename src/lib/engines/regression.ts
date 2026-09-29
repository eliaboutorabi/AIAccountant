import { seededRandom } from './numerics';
export type CollectionRow = { id: string; receivable: number; collected: number };
const sample = (seed: number, count: number, prefix: string): CollectionRow[] => {
	const random = seededRandom(seed);
	return Array.from({ length: count }, (_, i) => {
		const receivable = 40 + 100 * random();
		return {
			id: `${prefix}-${i + 1}`,
			receivable,
			collected: 8 + 0.55 * receivable + (random() - 0.5) * 8
		};
	});
};
export const regressionData = {
	train: sample(71, 24, 'train'),
	validation: sample(701, 16, 'validation')
};
export type LinearParameters = { weight: number; bias: number; step: number };
export const predictCollection = (p: LinearParameters, receivable: number) =>
	100 * (p.bias + (p.weight * receivable) / 100);
export function regressionMetrics(p: LinearParameters, data: CollectionRow[]) {
	const errors = data.map((r) => predictCollection(p, r.receivable) - r.collected);
	return {
		mse: errors.reduce((s, e) => s + e * e, 0) / errors.length,
		mae: errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length
	};
}
export function regressionStep(p: LinearParameters, rate: number) {
	if (!Number.isFinite(rate) || rate <= 0 || rate > 3)
		throw new Error('Choose a rate between 0 and 3.');
	let dw = 0,
		db = 0;
	for (const r of regressionData.train) {
		const x = r.receivable / 100,
			y = r.collected / 100,
			error = p.bias + p.weight * x - y;
		dw += (2 * error * x) / regressionData.train.length;
		db += (2 * error) / regressionData.train.length;
	}
	const next = { weight: p.weight - rate * dw, bias: p.bias - rate * db, step: p.step + 1 };
	if (!Number.isFinite(next.weight) || Math.abs(next.weight) > 1e6 || Math.abs(next.bias) > 1e6)
		throw new Error('The update became unstable. Reset and reduce the learning rate.');
	return { next, gradient: { weight: dw, bias: db }, before: { ...p }, rate };
}
export const regressionFinal = (p: LinearParameters) =>
	regressionMetrics(p, sample(7001, 40, 'final'));
