/** Small CPU numerical primitives, authored for the course. No global random state. */
export function seededRandom(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

export function softmax(values: ArrayLike<number>, temperature = 1): number[] {
	if (!values.length || !Number.isFinite(temperature) || temperature <= 0) {
		throw new Error('Softmax needs nonempty scores and a positive finite temperature.');
	}
	let max = -Infinity;
	for (let i = 0; i < values.length; i++) max = Math.max(max, values[i]);
	const exponentials = Array.from(values, (value) => Math.exp((value - max) / temperature));
	const total = exponentials.reduce((sum, value) => sum + value, 0);
	return exponentials.map((value) => value / total);
}

export function sigmoid(value: number): number {
	return value >= 0 ? 1 / (1 + Math.exp(-value)) : Math.exp(value) / (1 + Math.exp(value));
}

export class Matrix {
	readonly data: Float64Array;
	readonly grad: Float64Array;
	constructor(
		readonly rows: number,
		readonly cols: number,
		values?: ArrayLike<number>
	) {
		if (values && values.length !== rows * cols) throw new Error('Matrix shape mismatch.');
		this.data = values ? Float64Array.from(values) : new Float64Array(rows * cols);
		this.grad = new Float64Array(rows * cols);
	}
	toRows(): number[][] {
		return Array.from({ length: this.rows }, (_, r) =>
			Array.from(this.data.slice(r * this.cols, (r + 1) * this.cols))
		);
	}
}

export type Parameter = { name: string; matrix: Matrix };
export type ParameterSnapshot = { name: string; rows: number; cols: number; values: number[] };

export function snapshot(parameters: Parameter[]): ParameterSnapshot[] {
	return parameters.map(({ name, matrix }) => ({
		name,
		rows: matrix.rows,
		cols: matrix.cols,
		values: Array.from(matrix.data)
	}));
}

/** A matrix-level reverse-mode tape. Each forward operation records its exact derivative. */
export class Tape {
	private operations: (() => void)[] = [];
	constructor(private enabled = true) {}
	private record(backward: () => void) {
		if (this.enabled) this.operations.push(backward);
	}
	backward() {
		for (let i = this.operations.length - 1; i >= 0; i--) this.operations[i]();
	}
	add(a: Matrix, b: Matrix): Matrix {
		if (a.cols !== b.cols || (b.rows !== a.rows && b.rows !== 1)) {
			throw new Error('Add expects matching shapes or a row bias.');
		}
		const out = new Matrix(a.rows, a.cols);
		for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] + b.data[i % b.data.length];
		this.record(() => {
			for (let i = 0; i < a.data.length; i++) {
				a.grad[i] += out.grad[i];
				b.grad[i % b.data.length] += out.grad[i];
			}
		});
		return out;
	}
	matmul(a: Matrix, b: Matrix): Matrix {
		if (a.cols !== b.rows) throw new Error('Matrix multiplication shape mismatch.');
		const out = new Matrix(a.rows, b.cols);
		for (let r = 0; r < a.rows; r++) {
			for (let k = 0; k < a.cols; k++) {
				const value = a.data[r * a.cols + k];
				for (let c = 0; c < b.cols; c++) out.data[r * b.cols + c] += value * b.data[k * b.cols + c];
			}
		}
		this.record(() => {
			for (let r = 0; r < a.rows; r++) {
				for (let k = 0; k < a.cols; k++) {
					let grad = 0;
					for (let c = 0; c < b.cols; c++) {
						const g = out.grad[r * b.cols + c];
						grad += g * b.data[k * b.cols + c];
						b.grad[k * b.cols + c] += g * a.data[r * a.cols + k];
					}
					a.grad[r * a.cols + k] += grad;
				}
			}
		});
		return out;
	}
	gather(table: Matrix, indices: number[]): Matrix {
		const out = new Matrix(indices.length, table.cols);
		indices.forEach((index, r) => {
			if (!Number.isInteger(index) || index < 0 || index >= table.rows)
				throw new Error('Invalid embedding ID.');
			out.data.set(
				table.data.subarray(index * table.cols, (index + 1) * table.cols),
				r * table.cols
			);
		});
		this.record(() => {
			indices.forEach((index, r) => {
				for (let c = 0; c < table.cols; c++)
					table.grad[index * table.cols + c] += out.grad[r * table.cols + c];
			});
		});
		return out;
	}
	tanh(a: Matrix): Matrix {
		const out = new Matrix(a.rows, a.cols, a.data.map(Math.tanh));
		this.record(() => {
			for (let i = 0; i < a.data.length; i++) a.grad[i] += out.grad[i] * (1 - out.data[i] ** 2);
		});
		return out;
	}
	relu(a: Matrix): Matrix {
		const out = new Matrix(
			a.rows,
			a.cols,
			a.data.map((value) => Math.max(0, value))
		);
		this.record(() => {
			for (let i = 0; i < a.data.length; i++) a.grad[i] += a.data[i] > 0 ? out.grad[i] : 0;
		});
		return out;
	}
	/** RMS normalization without a learned gain; epsilon is part of forward AND derivative. */
	rmsnorm(a: Matrix): Matrix {
		const out = new Matrix(a.rows, a.cols);
		const inverseRms = new Float64Array(a.rows);
		for (let r = 0; r < a.rows; r++) {
			let sum = 0;
			for (let c = 0; c < a.cols; c++) sum += a.data[r * a.cols + c] ** 2;
			inverseRms[r] = 1 / Math.sqrt(sum / a.cols + 1e-5);
			for (let c = 0; c < a.cols; c++)
				out.data[r * a.cols + c] = a.data[r * a.cols + c] * inverseRms[r];
		}
		this.record(() => {
			for (let r = 0; r < a.rows; r++) {
				let inner = 0;
				for (let c = 0; c < a.cols; c++) inner += out.grad[r * a.cols + c] * a.data[r * a.cols + c];
				for (let c = 0; c < a.cols; c++) {
					const i = r * a.cols + c;
					a.grad[i] +=
						out.grad[i] * inverseRms[r] - (a.data[i] * inner * inverseRms[r] ** 3) / a.cols;
				}
			}
		});
		return out;
	}
	/** Multi-head causal self-attention. Returned weights are the ones actually used below. */
	attention(
		q: Matrix,
		k: Matrix,
		v: Matrix,
		heads: number
	): { output: Matrix; weights: number[][][]; scores: number[][][] } {
		const length = q.rows;
		const width = q.cols;
		const headWidth = width / heads;
		if (
			width % heads ||
			k.rows !== length ||
			v.rows !== length ||
			k.cols !== width ||
			v.cols !== width
		) {
			throw new Error('Attention shape mismatch.');
		}
		const scale = 1 / Math.sqrt(headWidth);
		const output = new Matrix(length, width);
		const weights: number[][][] = [];
		const scores: number[][][] = [];
		for (let h = 0; h < heads; h++) {
			weights[h] = [];
			scores[h] = [];
			for (let r = 0; r < length; r++) {
				const visibleScores = [];
				for (let s = 0; s <= r; s++) {
					let dot = 0;
					for (let d = 0; d < headWidth; d++)
						dot += q.data[r * width + h * headWidth + d] * k.data[s * width + h * headWidth + d];
					visibleScores.push(dot * scale);
				}
				scores[h][r] = [...visibleScores, ...Array(length - r - 1).fill(-Infinity)];
				weights[h][r] = [...softmax(visibleScores), ...Array(length - r - 1).fill(0)];
				for (let s = 0; s <= r; s++) {
					for (let d = 0; d < headWidth; d++)
						output.data[r * width + h * headWidth + d] +=
							weights[h][r][s] * v.data[s * width + h * headWidth + d];
				}
			}
		}
		this.record(() => {
			for (let h = 0; h < heads; h++) {
				for (let r = 0; r < length; r++) {
					const weightGrad = new Float64Array(r + 1);
					for (let s = 0; s <= r; s++) {
						for (let d = 0; d < headWidth; d++) {
							const oi = r * width + h * headWidth + d;
							const vi = s * width + h * headWidth + d;
							weightGrad[s] += output.grad[oi] * v.data[vi];
							v.grad[vi] += weights[h][r][s] * output.grad[oi];
						}
					}
					let weightedGrad = 0;
					for (let s = 0; s <= r; s++) weightedGrad += weights[h][r][s] * weightGrad[s];
					for (let s = 0; s <= r; s++) {
						const scoreGrad = weights[h][r][s] * (weightGrad[s] - weightedGrad) * scale;
						for (let d = 0; d < headWidth; d++) {
							const qi = r * width + h * headWidth + d;
							const ki = s * width + h * headWidth + d;
							q.grad[qi] += scoreGrad * k.data[ki];
							k.grad[ki] += scoreGrad * q.data[qi];
						}
					}
				}
			}
		});
		return { output, weights, scores };
	}
	/** Seeds mean cross-entropy's gradient directly; stable log-sum-exp avoids log(0). */
	crossEntropy(logits: Matrix, targets: number[], scale = 1): number {
		if (targets.length !== logits.rows) throw new Error('One target is required for every row.');
		let loss = 0;
		for (let r = 0; r < logits.rows; r++) {
			if (!Number.isInteger(targets[r]) || targets[r] < 0 || targets[r] >= logits.cols)
				throw new Error('Invalid target token.');
			const row = logits.data.subarray(r * logits.cols, (r + 1) * logits.cols);
			const probs = softmax(row);
			const max = Math.max(...row);
			let total = 0;
			for (let c = 0; c < logits.cols; c++) total += Math.exp(row[c] - max);
			loss += max + Math.log(total) - row[targets[r]];
			if (this.enabled)
				for (let c = 0; c < logits.cols; c++)
					logits.grad[r * logits.cols + c] +=
						((probs[c] - Number(c === targets[r])) * scale) / logits.rows;
		}
		return loss / logits.rows;
	}
	binaryCrossEntropy(logits: Matrix, targets: number[]): number {
		if (logits.cols !== 1 || logits.rows !== targets.length)
			throw new Error('Binary loss shape mismatch.');
		let loss = 0;
		for (let r = 0; r < logits.rows; r++) {
			const z = logits.data[r];
			loss += Math.max(z, 0) - z * targets[r] + Math.log1p(Math.exp(-Math.abs(z)));
			if (this.enabled) logits.grad[r] = (sigmoid(z) - targets[r]) / logits.rows;
		}
		return loss / logits.rows;
	}
}

export function initializeParameter(
	name: string,
	rows: number,
	cols: number,
	random: () => number,
	scale: number
): Parameter {
	return {
		name,
		matrix: new Matrix(
			rows,
			cols,
			Array.from({ length: rows * cols }, () => (random() * 2 - 1) * scale)
		)
	};
}

/** Adam with bias correction and optional global gradient clipping. */
export class Adam {
	private moments: { first: Float64Array; second: Float64Array }[];
	private steps = 0;
	constructor(private parameters: Parameter[]) {
		this.moments = parameters.map(({ matrix }) => ({
			first: new Float64Array(matrix.data.length),
			second: new Float64Array(matrix.data.length)
		}));
	}
	update(learningRate: number, clipNorm = 1): number {
		let squaredNorm = 0;
		for (const { matrix } of this.parameters)
			for (const grad of matrix.grad) squaredNorm += grad * grad;
		const norm = Math.sqrt(squaredNorm);
		if (!Number.isFinite(norm))
			throw new Error('Nonfinite gradient: reset the experiment with a smaller learning rate.');
		const scale = Math.min(1, clipNorm / Math.max(norm, 1e-12));
		this.steps++;
		const firstCorrection = 1 - 0.9 ** this.steps;
		const secondCorrection = 1 - 0.999 ** this.steps;
		this.parameters.forEach(({ matrix }, p) => {
			const { first, second } = this.moments[p];
			for (let i = 0; i < matrix.data.length; i++) {
				const grad = matrix.grad[i] * scale;
				first[i] = 0.9 * first[i] + 0.1 * grad;
				second[i] = 0.999 * second[i] + 0.001 * grad * grad;
				matrix.data[i] -=
					(learningRate * (first[i] / firstCorrection)) /
					(Math.sqrt(second[i] / secondCorrection) + 1e-8);
			}
		});
		return norm;
	}
}

export function clearGradients(parameters: Parameter[]) {
	for (const { matrix } of parameters) matrix.grad.fill(0);
}

export type GradientCheck = {
	parameter: string;
	index: number;
	analytical: number;
	numerical: number;
	absoluteError: number;
	relativeError: number;
};

/** Finite differences for diagnostics. Restores each value even if the loss callback throws. */
export function finiteDifferenceCheck(
	parameters: Parameter[],
	lossAndGradients: () => number,
	loss: () => number,
	perParameter = 3
): GradientCheck[] {
	lossAndGradients();
	const gradients = parameters.map(({ matrix }) => Array.from(matrix.grad));
	const result: GradientCheck[] = [];
	const epsilon = 1e-5;
	parameters.forEach(({ name, matrix }, p) => {
		// Always include an active gradient (important for sparse embedding lookups).
		const largest = gradients[p].reduce(
			(best, value, i, all) => (Math.abs(value) > Math.abs(all[best]) ? i : best),
			0
		);
		const indices = new Set([largest]);
		for (let s = 0; s < Math.min(perParameter, matrix.data.length); s++)
			indices.add(
				Math.floor((s * matrix.data.length) / Math.min(perParameter, matrix.data.length))
			);
		for (const index of indices) {
			const original = matrix.data[index];
			let plus: number;
			let minus: number;
			try {
				matrix.data[index] = original + epsilon;
				plus = loss();
				matrix.data[index] = original - epsilon;
				minus = loss();
			} finally {
				matrix.data[index] = original;
			}
			const numerical = (plus - minus) / (2 * epsilon);
			const analytical = gradients[p][index];
			const absoluteError = Math.abs(numerical - analytical);
			result.push({
				parameter: name,
				index,
				analytical,
				numerical,
				absoluteError,
				relativeError: absoluteError / Math.max(1e-7, Math.abs(numerical) + Math.abs(analytical))
			});
		}
	});
	return result;
}
