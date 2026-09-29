import {
	Adam,
	Matrix,
	Tape,
	clearGradients,
	finiteDifferenceCheck,
	initializeParameter,
	seededRandom,
	snapshot,
	type Parameter
} from './numerics';

export type DenoisingPoint = {
	id: string;
	clean: [number, number];
	noise: [number, number];
	cluster: 0 | 1;
};
export type DenoisingPair = DenoisingPoint & {
	noisy: [number, number];
	predicted: [number, number];
	squaredError: number;
};
export type DenoisingConfig = { seed?: number; learningRate?: number; maxTrainingNoise?: number };
export const DENOISING_PROVENANCE = {
	version: 'original-two-cluster-denoising-v1',
	units:
		'Dimensionless two-dimensional coordinates. These are not dollars, transactions or image pixels.',
	architecture:
		'Three inputs (noisy x, noisy y, noise standard deviation), 16 tanh units, and two linear clean-coordinate outputs; 98 trainable parameters.',
	objective:
		'Mean squared error per coordinate against the original clean points, with Adam and freshly sampled Gaussian corruption during training.',
	limits:
		'This is a real conditional denoising regression model. It is not a full diffusion sampler or an image generator. A predicted mean can lie between plausible clean points; there is no guarantee of recovering the unique original.'
} as const;

function normal(random: () => number): number {
	return Math.sqrt(-2 * Math.log(Math.max(random(), 1e-12))) * Math.cos(2 * Math.PI * random());
}
export function makeDenoisingData(seed: number, count: number, prefix: string): DenoisingPoint[] {
	const random = seededRandom(seed);
	return Array.from({ length: count }, (_, i) => {
		const cluster = (i % 2) as 0 | 1;
		const sign = cluster ? 1 : -1;
		return {
			id: `${prefix}-${i + 1}`,
			clean: [sign * 0.65 + normal(random) * 0.16, sign * 0.35 + normal(random) * 0.16],
			noise: [normal(random), normal(random)],
			cluster
		};
	});
}

export class DenoisingExperiment {
	readonly config: Required<DenoisingConfig>;
	private parameters: Parameter[];
	private optimizer: Adam;
	private random: () => number;
	private trainRows: DenoisingPoint[];
	private validationRows: DenoisingPoint[];
	private testRows: DenoisingPoint[];
	private final: {
		step: number;
		noise: number;
		mse: number;
		noisyMse: number;
		count: number;
	} | null = null;
	step = 0;
	constructor(config: DenoisingConfig = {}) {
		this.config = Object.freeze({
			seed: config.seed ?? 42,
			learningRate: config.learningRate ?? 0.008,
			maxTrainingNoise: config.maxTrainingNoise ?? 1
		});
		const { seed, learningRate, maxTrainingNoise } = this.config;
		if (
			!Number.isSafeInteger(seed) ||
			!Number.isFinite(learningRate) ||
			learningRate <= 0 ||
			learningRate > 0.1 ||
			!Number.isFinite(maxTrainingNoise) ||
			maxTrainingNoise < 0.05 ||
			maxTrainingNoise > 1.5
		)
			throw new Error('Invalid denoising configuration.');
		const init = seededRandom(seed);
		this.parameters = [
			initializeParameter('input weights', 3, 16, init, 0.7),
			initializeParameter('hidden bias', 1, 16, init, 0),
			initializeParameter('output weights', 16, 2, init, 0.15),
			initializeParameter('output bias', 1, 2, init, 0)
		];
		this.optimizer = new Adam(this.parameters);
		this.random = seededRandom(seed + 735);
		this.trainRows = makeDenoisingData(seed + 101, 128, 'train');
		this.validationRows = makeDenoisingData(seed + 10231, 64, 'validation');
		this.testRows = makeDenoisingData(seed + 800321, 128, 'final');
	}
	get parameterCount() {
		return this.parameters.reduce((sum, p) => sum + p.matrix.data.length, 0);
	}
	get isCommitted() {
		return !!this.final;
	}
	weights() {
		return snapshot(this.parameters);
	}
	private forward(inputs: number[][], training = false) {
		const tape = new Tape(training);
		const x = new Matrix(inputs.length, 3, inputs.flat());
		const hidden = tape.tanh(
			tape.add(tape.matmul(x, this.parameters[0].matrix), this.parameters[1].matrix)
		);
		const output = tape.add(
			tape.matmul(hidden, this.parameters[2].matrix),
			this.parameters[3].matrix
		);
		return { tape, output, hidden };
	}
	private loss(inputs: number[][], targets: [number, number][], gradients = false) {
		if (gradients) clearGradients(this.parameters);
		const { tape, output } = this.forward(inputs, gradients);
		let squared = 0;
		const count = targets.length * 2;
		for (let r = 0; r < targets.length; r++)
			for (let c = 0; c < 2; c++) {
				const error = output.data[r * 2 + c] - targets[r][c];
				squared += error * error;
				if (gradients) output.grad[r * 2 + c] = (2 * error) / count;
			}
		if (gradients) tape.backward();
		return squared / count;
	}
	train(steps = 10) {
		if (this.final)
			throw new Error('Final cases were revealed. Reset for a new development experiment.');
		if (!Number.isInteger(steps) || steps < 1 || steps > 100)
			throw new Error('Train 1–100 updates per chunk.');
		let loss = 0;
		for (let s = 0; s < steps; s++) {
			const inputs: number[][] = [];
			const targets: [number, number][] = [];
			for (let b = 0; b < 32; b++) {
				const row = this.trainRows[Math.floor(this.random() * this.trainRows.length)];
				const noise = 0.03 + this.random() * (this.config.maxTrainingNoise - 0.03);
				inputs.push([
					row.clean[0] + normal(this.random) * noise,
					row.clean[1] + normal(this.random) * noise,
					noise
				]);
				targets.push(row.clean);
			}
			loss = this.loss(inputs, targets, true);
			this.optimizer.update(this.config.learningRate, 3);
			this.step++;
		}
		return { step: this.step, loss };
	}
	predict(noisy: [number, number], noise: number): [number, number] {
		if (noisy.some((n) => !Number.isFinite(n)) || !Number.isFinite(noise) || noise < 0 || noise > 2)
			throw new Error('Prediction needs finite coordinates and noise between zero and two.');
		const { output } = this.forward([[...noisy, noise]]);
		return [output.data[0], output.data[1]];
	}
	private pairs(rows: DenoisingPoint[], noise: number): DenoisingPair[] {
		return rows.map((row) => {
			const noisy: [number, number] = [
				row.clean[0] + noise * row.noise[0],
				row.clean[1] + noise * row.noise[1]
			];
			const predicted = this.predict(noisy, noise);
			return {
				...row,
				clean: [...row.clean] as [number, number],
				noise: [...row.noise] as [number, number],
				noisy,
				predicted,
				squaredError: ((predicted[0] - row.clean[0]) ** 2 + (predicted[1] - row.clean[1]) ** 2) / 2
			};
		});
	}
	private score(rows: DenoisingPoint[], noise: number) {
		const pairs = this.pairs(rows, noise);
		return {
			count: rows.length,
			mse: pairs.reduce((sum, p) => sum + p.squaredError, 0) / rows.length,
			noisyMse:
				pairs.reduce(
					(sum, p) => sum + ((p.noisy[0] - p.clean[0]) ** 2 + (p.noisy[1] - p.clean[1]) ** 2) / 2,
					0
				) / rows.length
		};
	}
	metrics(noise = 0.5) {
		return {
			step: this.step,
			noise,
			train: this.score(this.trainRows, noise),
			validation: this.score(this.validationRows, noise)
		};
	}
	validationPairs(noise = 0.5) {
		return this.pairs(this.validationRows, noise);
	}
	commitFinal(noise = 0.5) {
		if (!this.final) this.final = { step: this.step, noise, ...this.score(this.testRows, noise) };
		return { ...this.final };
	}
	gradientCheck() {
		const rows = this.trainRows.slice(0, 4);
		const inputs = rows.map((row) => [
			row.clean[0] + row.noise[0] * 0.4,
			row.clean[1] + row.noise[1] * 0.4,
			0.4
		]);
		return finiteDifferenceCheck(
			this.parameters,
			() =>
				this.loss(
					inputs,
					rows.map((row) => row.clean),
					true
				),
			() =>
				this.loss(
					inputs,
					rows.map((row) => row.clean)
				),
			3
		);
	}
}
