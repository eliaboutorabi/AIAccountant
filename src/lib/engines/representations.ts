import {
	Adam,
	Matrix,
	Tape,
	clearGradients,
	initializeParameter,
	seededRandom,
	sigmoid,
	snapshot,
	type Parameter
} from './numerics';

export type RepresentationPoint = { id: string; input: [number, number]; label: 0 | 1 };
export type Candidate = 'raw' | 'engineered' | 'tree' | 'neural';
export type Domain = 'related' | 'reversed';
export type PredictionMetrics = { count: number; loss: number; accuracy: number };
export const CANDIDATES: { id: Candidate; name: string; description: string }[] = [
	{
		id: 'raw',
		name: 'Raw logistic',
		description: 'A linear logit from x and y: 3 learned parameters.'
	},
	{
		id: 'engineered',
		name: 'Engineered logistic',
		description:
			'A linear logit from x, y and the explicitly designed interaction x × y: 4 learned parameters.'
	},
	{
		id: 'tree',
		name: 'Small decision tree',
		description:
			'Greedy Gini splits on x or y, maximum depth 3, minimum 8 records per leaf; smoothed leaf probabilities.'
	},
	{
		id: 'neural',
		name: 'Neural network',
		description: '2 → 8 tanh hidden units → sigmoid: 33 learned parameters.'
	}
];
export const REPRESENTATION_PROVENANCE = {
	version: 'original-four-corner-domains-v1',
	task: 'Synthetic two-category routing shape; x and y are dimensionless abstract inputs, not observed financial predictors.',
	rule: 'Four separated clusters. Source class A occupies the corners where x and y have the same sign. Independently flip 3% of labels. The target rotates inputs 0.4 radians and shifts x by 0.08; the reversed target also reverses the underlying labels.',
	limits:
		'A controlled feature-learning demonstration, not an accounting policy, credit model, fraud benchmark or pretrained document representation.'
} as const;

export function makeRepresentationData(
	seed: number,
	count: number,
	prefix: string,
	domain: 'source' | Domain = 'source'
): RepresentationPoint[] {
	const random = seededRandom(seed);
	return Array.from({ length: count }, (_, i) => {
		const x = (i % 2 ? 1 : -1) * (0.35 + random() * 0.6);
		const y = (i % 4 < 2 ? 1 : -1) * (0.35 + random() * 0.6);
		let label: 0 | 1 = x * y > 0 ? 1 : 0;
		if (domain === 'reversed') label = label ? 0 : 1;
		if (random() < 0.03) label = label ? 0 : 1;
		const input: [number, number] =
			domain === 'source'
				? [x, y]
				: [x * Math.cos(0.4) - y * Math.sin(0.4) + 0.08, x * Math.sin(0.4) + y * Math.cos(0.4)];
		return { id: `${prefix}-${i + 1}`, input, label };
	});
}

class Classifier {
	private parameters: Parameter[];
	private optimizer: Adam;
	constructor(
		private kind: 'raw' | 'engineered' | 'neural',
		private seed: number
	) {
		const random = seededRandom(seed);
		const width = kind === 'engineered' ? 3 : 2;
		this.parameters =
			kind === 'neural'
				? [
						initializeParameter('input', 2, 8, random, 1),
						initializeParameter('hidden bias', 1, 8, random, 0),
						initializeParameter('output', 8, 1, random, 0.5),
						initializeParameter('output bias', 1, 1, random, 0)
					]
				: [
						initializeParameter('input', width, 1, random, 0.1),
						initializeParameter('bias', 1, 1, random, 0)
					];
		this.optimizer = new Adam(this.parameters);
	}
	private forward(inputs: [number, number][], training = false) {
		const tape = new Tape(training);
		const features = inputs.map(([x, y]) => (this.kind === 'engineered' ? [x, y, x * y] : [x, y]));
		const x = new Matrix(inputs.length, features[0].length, features.flat());
		let hidden = tape.add(tape.matmul(x, this.parameters[0].matrix), this.parameters[1].matrix);
		if (this.kind === 'neural') hidden = tape.tanh(hidden);
		const logits =
			this.kind === 'neural'
				? tape.add(tape.matmul(hidden, this.parameters[2].matrix), this.parameters[3].matrix)
				: hidden;
		return { tape, hidden, logits };
	}
	update(rows: RepresentationPoint[]) {
		clearGradients(this.parameters);
		const { tape, logits } = this.forward(
			rows.map((row) => row.input),
			true
		);
		tape.binaryCrossEntropy(
			logits,
			rows.map((row) => row.label)
		);
		tape.backward();
		for (const { name, matrix } of this.parameters)
			if (!name.includes('bias'))
				for (let i = 0; i < matrix.data.length; i++) matrix.grad[i] += 0.001 * matrix.data[i];
		this.optimizer.update(0.025, 5);
	}
	predict(input: [number, number]) {
		return sigmoid(this.forward([input]).logits.data[0]);
	}
	represent(input: [number, number]) {
		return Array.from(this.forward([input]).hidden.data);
	}
	weights() {
		return snapshot(this.parameters);
	}
	fork() {
		const copy = new Classifier(this.kind, this.seed);
		this.parameters.forEach(({ matrix }, i) => copy.parameters[i].matrix.data.set(matrix.data));
		return copy;
	}
}

export type DecisionNode = {
	count: number;
	probability: number;
	feature?: 0 | 1;
	threshold?: number;
	left?: DecisionNode;
	right?: DecisionNode;
};
export function fitSmallTree(rows: RepresentationPoint[], depth = 0): DecisionNode {
	if (!rows.length) throw new Error('A tree needs training records.');
	const positives = rows.reduce((sum, row) => sum + row.label, 0);
	const result: DecisionNode = {
		count: rows.length,
		probability: (positives + 1) / (rows.length + 2)
	};
	if (depth >= 3 || rows.length < 16 || positives === 0 || positives === rows.length) return result;
	const impurity = (items: RepresentationPoint[]) => {
		const p = items.reduce((sum, row) => sum + row.label, 0) / items.length;
		return items.length * 2 * p * (1 - p);
	};
	let best = impurity(rows);
	let split:
		| {
				feature: 0 | 1;
				threshold: number;
				left: RepresentationPoint[];
				right: RepresentationPoint[];
		  }
		| undefined;
	for (const feature of [0, 1] as const) {
		const sorted = rows.map((row) => row.input[feature]).sort((a, b) => a - b);
		for (let i = 8; i <= sorted.length - 8; i++) {
			const threshold = (sorted[i - 1] + sorted[i]) / 2;
			const left = rows.filter((row) => row.input[feature] <= threshold);
			const right = rows.filter((row) => row.input[feature] > threshold);
			if (left.length < 8 || right.length < 8) continue;
			const value = impurity(left) + impurity(right);
			if (value < best - 1e-12) {
				best = value;
				split = { feature, threshold, left, right };
			}
		}
	}
	if (split)
		return {
			...result,
			feature: split.feature,
			threshold: split.threshold,
			left: fitSmallTree(split.left, depth + 1),
			right: fitSmallTree(split.right, depth + 1)
		};
	return result;
}
export function treeProbability(node: DecisionNode, input: [number, number]): number {
	if (node.feature === undefined || node.threshold === undefined || !node.left || !node.right)
		return node.probability;
	return treeProbability(input[node.feature] <= node.threshold ? node.left : node.right, input);
}
function score(
	rows: RepresentationPoint[],
	predict: (x: [number, number]) => number
): PredictionMetrics {
	let correct = 0;
	let loss = 0;
	for (const row of rows) {
		const p = Math.max(1e-10, Math.min(1 - 1e-10, predict(row.input)));
		if (Number(p >= 0.5) === row.label) correct++;
		loss -= row.label ? Math.log(p) : Math.log1p(-p);
	}
	return { count: rows.length, loss: loss / rows.length, accuracy: correct / rows.length };
}
const cloneRows = (rows: RepresentationPoint[]) =>
	rows.map((row) => ({ ...row, input: [...row.input] as [number, number] }));

export class RepresentationExperiment {
	private models: Record<'raw' | 'engineered' | 'neural', Classifier>;
	private tree: DecisionNode | null = null;
	private trainRows: RepresentationPoint[];
	private validationRows: RepresentationPoint[];
	private testRows: RepresentationPoint[];
	private random: () => number;
	private transferRandom: () => number;
	private final: {
		selected: Candidate;
		step: number;
		scores: Record<Candidate, PredictionMetrics>;
	} | null = null;
	private transfer: {
		scratch: Classifier;
		reused: Classifier;
		train: RepresentationPoint[];
		validation: RepresentationPoint[];
		test: RepresentationPoint[];
		sourceStep: number;
		step: number;
		domain: Domain;
		final: { scratch: PredictionMetrics; reused: PredictionMetrics } | null;
	} | null = null;
	step = 0;
	constructor(readonly seed = 42) {
		if (!Number.isSafeInteger(seed)) throw new Error('Seed must be an integer.');
		this.models = {
			raw: new Classifier('raw', seed),
			engineered: new Classifier('engineered', seed),
			neural: new Classifier('neural', seed)
		};
		this.trainRows = makeRepresentationData(seed + 101, 128, 'source-train');
		this.validationRows = makeRepresentationData(seed + 10001, 96, 'source-validation');
		this.testRows = makeRepresentationData(seed + 900001, 192, 'source-final');
		this.random = seededRandom(seed + 891);
		this.transferRandom = seededRandom(seed + 4781);
	}
	get isFrozen() {
		return !!this.final || !!this.transfer;
	}
	get data() {
		return { train: cloneRows(this.trainRows), validation: cloneRows(this.validationRows) };
	}
	get treeStructure() {
		return this.tree ? structuredClone(this.tree) : null;
	}
	predict(candidate: Candidate, input: [number, number]) {
		return candidate === 'tree'
			? this.tree
				? treeProbability(this.tree, input)
				: 0.5
			: this.models[candidate].predict(input);
	}
	train(steps = 20) {
		if (this.isFrozen)
			throw new Error(
				'Source model is committed or captured for transfer. Reset for a new source experiment.'
			);
		if (!Number.isInteger(steps) || steps < 1 || steps > 100)
			throw new Error('Train 1–100 updates per chunk.');
		this.tree ??= fitSmallTree(this.trainRows);
		for (let i = 0; i < steps; i++) {
			const batch = Array.from(
				{ length: 32 },
				() => this.trainRows[Math.floor(this.random() * this.trainRows.length)]
			);
			for (const model of Object.values(this.models)) model.update(batch);
			this.step++;
		}
	}
	metrics() {
		return {
			step: this.step,
			treeFitted: !!this.tree,
			candidates: CANDIDATES.map((candidate) => ({
				...candidate,
				train: score(this.trainRows, (input) => this.predict(candidate.id, input)),
				validation: score(this.validationRows, (input) => this.predict(candidate.id, input))
			}))
		};
	}
	activations() {
		return this.validationRows.map((row) => ({
			...row,
			input: [...row.input] as [number, number],
			values: this.models.neural.represent(row.input)
		}));
	}
	weights() {
		return this.models.neural.weights();
	}
	commit(selected: Candidate) {
		if (!CANDIDATES.some((candidate) => candidate.id === selected))
			throw new Error('Unknown candidate.');
		if (!this.final)
			this.final = {
				selected,
				step: this.step,
				scores: Object.fromEntries(
					CANDIDATES.map(({ id }) => [id, score(this.testRows, (input) => this.predict(id, input))])
				) as Record<Candidate, PredictionMetrics>
			};
		return structuredClone(this.final);
	}
	startTransfer(targetCount = 24, domain: Domain = 'related') {
		if (this.transfer)
			throw new Error('Transfer already started. Reset for a different target experiment.');
		if (this.step === 0) throw new Error('Train the source network before reusing it.');
		if (![16, 24, 48, 96].includes(targetCount) || !['related', 'reversed'].includes(domain))
			throw new Error('Invalid target configuration.');
		this.transfer = {
			scratch: new Classifier('neural', this.seed),
			reused: this.models.neural.fork(),
			train: makeRepresentationData(this.seed + 4121, targetCount, 'target-train', domain),
			validation: makeRepresentationData(this.seed + 54411, 96, 'target-validation', domain),
			test: makeRepresentationData(this.seed + 735111, 192, 'target-final', domain),
			sourceStep: this.step,
			step: 0,
			domain,
			final: null
		};
		return this.transferMetrics();
	}
	trainTransfer(steps = 20) {
		const transfer = this.transfer;
		if (!transfer || transfer.final)
			throw new Error('Start an uncommitted transfer experiment first.');
		if (!Number.isInteger(steps) || steps < 1 || steps > 100)
			throw new Error('Train 1–100 updates per chunk.');
		for (let i = 0; i < steps; i++) {
			const batch = Array.from(
				{ length: 32 },
				() => transfer.train[Math.floor(this.transferRandom() * transfer.train.length)]
			);
			transfer.scratch.update(batch);
			transfer.reused.update(batch);
			transfer.step++;
		}
		return this.transferMetrics();
	}
	transferMetrics() {
		const t = this.transfer;
		if (!t) return null;
		return {
			step: t.step,
			sourceStep: t.sourceStep,
			domain: t.domain,
			sourceCount: this.trainRows.length,
			targetCount: t.train.length,
			scratch: {
				train: score(t.train, (input) => t.scratch.predict(input)),
				validation: score(t.validation, (input) => t.scratch.predict(input))
			},
			reused: {
				train: score(t.train, (input) => t.reused.predict(input)),
				validation: score(t.validation, (input) => t.reused.predict(input))
			}
		};
	}
	transferData() {
		return this.transfer
			? { train: cloneRows(this.transfer.train), validation: cloneRows(this.transfer.validation) }
			: null;
	}
	transferWeights() {
		return this.transfer
			? { scratch: this.transfer.scratch.weights(), reused: this.transfer.reused.weights() }
			: null;
	}
	commitTransfer() {
		if (!this.transfer) throw new Error('Start a transfer experiment first.');
		const t = this.transfer;
		t.final ??= {
			scratch: score(t.test, (input) => t.scratch.predict(input)),
			reused: score(t.test, (input) => t.reused.predict(input))
		};
		return structuredClone(t.final);
	}
}
