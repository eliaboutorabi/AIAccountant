export type Point = { x: number; y: number };
const noise = [2, -4, 3, -2, 4, -5, 2, 4, -3, 3, -4, 2];
export const trainingPoints: Point[] = noise.map((n, i) => ({
	x: i / 11,
	y: 18 + 14 * (i / 11) + 22 * (i / 11) ** 2 + n
}));
export const validationPoints: Point[] = Array.from({ length: 10 }, (_, i) => {
	const x = (i + 0.5) / 10;
	return { x, y: 18 + 14 * x + 22 * x * x + (i % 2 === 0 ? 1 : -1) };
});
/** Ridge polynomial least squares on normalized inputs. The intercept is not penalized. */
export function fitPolynomial(points: Point[], degree: number, penalty: number) {
	const n = degree + 1;
	const matrix = Array.from({ length: n }, () => Array(n + 1).fill(0) as number[]);
	for (const { x, y } of points) {
		const z = 2 * x - 1;
		const powers = Array.from({ length: 2 * degree + 1 }, (_, p) => z ** p);
		for (let row = 0; row < n; row++) {
			for (let col = 0; col < n; col++) matrix[row][col] += powers[row + col];
			matrix[row][n] += y * powers[row];
		}
	}
	for (let i = 1; i < n; i++) matrix[i][i] += penalty;
	for (let i = 0; i < n; i++) {
		let pivot = i;
		for (let j = i + 1; j < n; j++)
			if (Math.abs(matrix[j][i]) > Math.abs(matrix[pivot][i])) pivot = j;
		[matrix[i], matrix[pivot]] = [matrix[pivot], matrix[i]];
		const divisor = matrix[i][i];
		if (Math.abs(divisor) < 1e-12) return () => points.reduce((s, p) => s + p.y, 0) / points.length;
		for (let j = i; j <= n; j++) matrix[i][j] /= divisor;
		for (let k = 0; k < n; k++) {
			if (k === i) continue;
			const factor = matrix[k][i];
			for (let j = i; j <= n; j++) matrix[k][j] -= factor * matrix[i][j];
		}
	}
	const coefficients = matrix.map((row) => row[n]);
	return (x: number) => coefficients.reduce((sum, c, p) => sum + c * (2 * x - 1) ** p, 0);
}
export function mae(points: Point[], predict: (x: number) => number) {
	return points.reduce((sum, p) => sum + Math.abs(p.y - predict(p.x)), 0) / points.length;
}
export const invoiceScores = [
	{ score: 0.91, late: true },
	{ score: 0.84, late: true },
	{ score: 0.79, late: false },
	{ score: 0.72, late: true },
	{ score: 0.66, late: false },
	{ score: 0.58, late: true },
	{ score: 0.52, late: false },
	{ score: 0.45, late: true },
	{ score: 0.39, late: false },
	{ score: 0.33, late: false },
	{ score: 0.28, late: true },
	{ score: 0.21, late: false },
	{ score: 0.16, late: false },
	{ score: 0.09, late: false },
	{ score: 0.05, late: false }
];
export function classificationMetrics(threshold: number) {
	let tp = 0,
		fp = 0,
		fn = 0,
		tn = 0;
	for (const i of invoiceScores) {
		if (i.score >= threshold) {
			if (i.late) tp++;
			else fp++;
		} else {
			if (i.late) fn++;
			else tn++;
		}
	}
	return {
		tp,
		fp,
		fn,
		tn,
		precision: tp + fp ? tp / (tp + fp) : null,
		recall: tp + fn ? tp / (tp + fn) : null,
		flagged: tp + fp
	};
}
export const monthlyCollections = [
	82, 89, 91, 95, 102, 98, 108, 112, 107, 119, 126, 138, 94, 101, 104, 111, 118, 117, 129, 134, 129,
	142, 151, 166
];
export function forecastBaseline(method: string, values: number[]) {
	if (method === 'seasonal') return values[values.length - 12];
	if (method === 'average') return values.slice(-3).reduce((s, v) => s + v, 0) / 3;
	return values[values.length - 1];
}
export function evaluateForecast(method: string) {
	return monthlyCollections.slice(18).map((actual, i) => ({
		month: 18 + i,
		actual,
		predicted: forecastBaseline(method, monthlyCollections.slice(0, 18 + i))
	}));
}
export function toyNetwork(age: number, history: number) {
	const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
	const hidden = [
		sigmoid(age * 3 + history - 1.5),
		sigmoid(age + history * 2.5 - 1.6),
		sigmoid(age * 2 - history + 0.1),
		sigmoid(history * 2 - age + 0.2)
	];
	const score = sigmoid(
		hidden[0] * 1.8 + hidden[1] * 1.6 + hidden[2] * 0.4 + hidden[3] * 0.5 - 2.2
	);
	return { hidden, score };
}
