import {
	Adam,
	Matrix,
	Tape,
	clearGradients,
	finiteDifferenceCheck,
	initializeParameter,
	seededRandom,
	sigmoid,
	snapshot,
	type Parameter
} from './numerics';

export type InvoicePoint = {
	id: string;
	/** Both inputs are in [0, 1]: overdue days / 90 and amount mismatch / 25%. */
	inputs: [number, number];
	label: 0 | 1;
	split: 'train' | 'validation' | 'test';
};
export type ClassificationScore = {
	count: number;
	loss: number;
	accuracy: number;
	tp: number;
	fp: number;
	tn: number;
	fn: number;
	precision: number | null;
	recall: number | null;
};
export type MLPConfig = {
	seed?: number;
	hiddenSize?: number;
	learningRate?: number;
	regularization?: number;
	trainCount?: number;
};
export type TrainingUpdate = { step: number; batchLoss: number; gradientNorm: number };

export const INVOICE_DATA_PROVENANCE = {
	version: 'willow-synthetic-review-v1',
	featureNames: ['Days overdue (0–90)', 'Amount mismatch (0–25%)'],
	target: 'Synthetic reviewer requests investigation',
	limitations:
		'Invented data and a disclosed nonlinear labeling rule, with 4% random label flips. This is a mechanics experiment, not an empirically validated fraud or credit-risk model. Scores have not been calibrated.',
	rule: 'Investigation when mismatch exceeds 19.25%, or when overdue days exceed 52.2 and mismatch exceeds 7%. Then independently flip 4% of labels.'
} as const;

export function makeInvoiceSplits(seed = 42, trainCount = 96) {
	const make = (count: number, split: InvoicePoint['split'], offset: number): InvoicePoint[] => {
		const random = seededRandom(seed + offset);
		return Array.from({ length: count }, (_, index) => {
			const inputs: [number, number] = [random(), random()];
			let label: 0 | 1 = inputs[1] > 0.77 || (inputs[0] > 0.58 && inputs[1] > 0.28) ? 1 : 0;
			if (random() < 0.04) label = label === 1 ? 0 : 1;
			return { id: `${split}-${index + 1}`, inputs, label, split };
		});
	};
	return {
		train: make(trainCount, 'train', 101),
		validation: make(64, 'validation', 10001),
		test: make(192, 'test', 900001)
	};
}

function checkInput(input: [number, number]) {
	if (input.length !== 2 || input.some((n) => !Number.isFinite(n) || n < 0 || n > 1))
		throw new Error('Inputs must be two finite values between 0 and 1.');
}

/** Actual 2 → tanh hidden layer → sigmoid classifier, trained with minibatch Adam. */
export class FinanceMLP {
	readonly config: Required<MLPConfig>;
	private parameters: Parameter[];
	private optimizer: Adam;
	private random: () => number;
	private splitData: ReturnType<typeof makeInvoiceSplits>;
	private final: { step: number; threshold: number; score: ClassificationScore } | null = null;
	step = 0;

	constructor(config: MLPConfig = {}) {
		this.config = Object.freeze({
			seed: config.seed ?? 42,
			hiddenSize: config.hiddenSize ?? 6,
			learningRate: config.learningRate ?? 0.025,
			regularization: config.regularization ?? 0.001,
			trainCount: config.trainCount ?? 96
		});
		const { seed, hiddenSize, learningRate, regularization, trainCount } = this.config;
		if (
			!Number.isSafeInteger(seed) ||
			!Number.isInteger(hiddenSize) ||
			hiddenSize < 1 ||
			hiddenSize > 32 ||
			!Number.isInteger(trainCount) ||
			trainCount < 8 ||
			trainCount > 512 ||
			!Number.isFinite(learningRate) ||
			learningRate <= 0 ||
			learningRate > 0.5 ||
			!Number.isFinite(regularization) ||
			regularization < 0 ||
			regularization > 1
		)
			throw new Error('Invalid bounded MLP configuration.');
		const init = seededRandom(seed);
		this.random = seededRandom(seed + 301);
		this.parameters = [
			initializeParameter('input weights', 2, hiddenSize, init, Math.sqrt(3 / 2)),
			initializeParameter('hidden bias', 1, hiddenSize, init, 0),
			initializeParameter('output weights', hiddenSize, 1, init, Math.sqrt(3 / hiddenSize)),
			initializeParameter('output bias', 1, 1, init, 0)
		];
		this.optimizer = new Adam(this.parameters);
		this.splitData = makeInvoiceSplits(seed, trainCount);
	}

	get parameterCount() {
		return this.parameters.reduce((sum, { matrix }) => sum + matrix.data.length, 0);
	}
	get isCommitted() {
		return this.final !== null;
	}
	/** Copies keep UI manipulation from changing the data used by the optimizer. Test rows stay sealed. */
	get data() {
		return {
			train: this.splitData.train.map((row) => ({
				...row,
				inputs: [...row.inputs] as [number, number]
			})),
			validation: this.splitData.validation.map((row) => ({
				...row,
				inputs: [...row.inputs] as [number, number]
			}))
		};
	}
	weights() {
		return snapshot(this.parameters);
	}

	private forward(inputs: [number, number][], training = false) {
		const tape = new Tape(training);
		const x = new Matrix(
			inputs.length,
			2,
			inputs.flatMap((row) => row.map((value) => value * 2 - 1))
		);
		const hidden = tape.tanh(
			tape.add(tape.matmul(x, this.parameters[0].matrix), this.parameters[1].matrix)
		);
		const logits = tape.add(
			tape.matmul(hidden, this.parameters[2].matrix),
			this.parameters[3].matrix
		);
		return { tape, x, hidden, logits };
	}

	private objective(rows: InvoicePoint[], gradients = false): number {
		if (gradients) clearGradients(this.parameters);
		const { tape, logits } = this.forward(
			rows.map((row) => row.inputs),
			gradients
		);
		let loss = tape.binaryCrossEntropy(
			logits,
			rows.map((row) => row.label)
		);
		if (gradients) tape.backward();
		// L2 applies to weight matrices; biases are deliberately excluded.
		for (const index of [0, 2]) {
			const { matrix } = this.parameters[index];
			for (let i = 0; i < matrix.data.length; i++) {
				loss += (this.config.regularization * matrix.data[i] ** 2) / 2;
				if (gradients) matrix.grad[i] += this.config.regularization * matrix.data[i];
			}
		}
		return loss;
	}

	/** One step is one 32-record minibatch update. Call small chunks and yield between them. */
	train(steps = 10): TrainingUpdate {
		if (this.final)
			throw new Error('Final holdout has been revealed. Start a new experiment to train again.');
		if (!Number.isInteger(steps) || steps < 1 || steps > 200)
			throw new Error('Train between 1 and 200 steps per chunk.');
		let batchLoss = 0;
		let gradientNorm = 0;
		for (let s = 0; s < steps; s++) {
			const batch = Array.from(
				{ length: 32 },
				() => this.splitData.train[Math.floor(this.random() * this.splitData.train.length)]
			);
			batchLoss = this.objective(batch, true);
			gradientNorm = this.optimizer.update(this.config.learningRate, 5);
			this.step++;
		}
		return { step: this.step, batchLoss, gradientNorm };
	}

	predict(input: [number, number]): number {
		checkInput(input);
		return sigmoid(this.forward([input]).logits.data[0]);
	}

	inspect(input: [number, number]) {
		checkInput(input);
		const { x, hidden, logits } = this.forward([input]);
		return {
			input: [...input],
			scaledInput: Array.from(x.data),
			hidden: Array.from(hidden.data),
			logit: logits.data[0],
			probability: sigmoid(logits.data[0]),
			weights: this.weights(),
			step: this.step
		};
	}

	private score(rows: InvoicePoint[], threshold: number): ClassificationScore {
		if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1)
			throw new Error('Threshold must lie between 0 and 1.');
		const { logits, tape } = this.forward(rows.map((row) => row.inputs));
		let tp = 0;
		let fp = 0;
		let tn = 0;
		let fn = 0;
		rows.forEach((row, index) => {
			const positive = sigmoid(logits.data[index]) >= threshold;
			if (positive && row.label) tp++;
			else if (positive) fp++;
			else if (row.label) fn++;
			else tn++;
		});
		return {
			count: rows.length,
			loss: tape.binaryCrossEntropy(
				logits,
				rows.map((row) => row.label)
			),
			accuracy: (tp + tn) / rows.length,
			tp,
			fp,
			tn,
			fn,
			precision: tp + fp ? tp / (tp + fp) : null,
			recall: tp + fn ? tp / (tp + fn) : null
		};
	}

	/** Reported loss is data cross-entropy, without the training-only L2 penalty. */
	metrics(threshold = 0.5) {
		return {
			step: this.step,
			train: this.score(this.splitData.train, threshold),
			validation: this.score(this.splitData.validation, threshold)
		};
	}

	commitFinal(threshold = 0.5) {
		if (!this.final)
			this.final = {
				step: this.step,
				threshold,
				score: this.score(this.splitData.test, threshold)
			};
		return { ...this.final, score: { ...this.final.score } };
	}

	gradientCheck() {
		const rows = this.splitData.train.slice(0, 5);
		return finiteDifferenceCheck(
			this.parameters,
			() => this.objective(rows, true),
			() => this.objective(rows),
			4
		);
	}
}
