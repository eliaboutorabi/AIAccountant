import {
	CHARACTER_VOCABULARY,
	FINANCE_CORPUS,
	GENERAL_CORPUS,
	characterTokens,
	decodeCharacters,
	encodeCharacters
} from './finance-corpus';
import {
	Adam,
	Tape,
	clearGradients,
	finiteDifferenceCheck,
	initializeParameter,
	seededRandom,
	snapshot,
	softmax,
	type Parameter
} from './numerics';
import type { TrainingUpdate } from './finance-mlp';

export type TransformerConfig = {
	seed?: number;
	learningRate?: number;
	contextSize?: number;
	width?: number;
	heads?: number;
};
export type LanguageScore = {
	loss: number;
	perplexity: number;
	targetTokens: number;
	documents: number;
};
export type GenerationOptions = { tokens?: number; temperature?: number; seed?: number };
export type TrainingDomain = 'general' | 'finance';
export type DomainScores = { general: LanguageScore; finance: LanguageScore };

export const TRANSFORMER_PROVENANCE = {
	name: 'Willow micro-transformer',
	version: 'cpu-causal-transformer-v1',
	architecture:
		'One decoder block: learned character and position embeddings; RMS normalization; two-head causal self-attention by default; residual; RMS normalization; ReLU feed-forward layer; residual; final RMS normalization; vocabulary projection and bias.',
	objective:
		'Mean next-character cross-entropy. Adam updates every trainable parameter; gradients are clipped to global norm 1.',
	limitations:
		'A small character language model trained only on original short teaching sentences. It is not instruction tuned, does not retrieve records, does not know your company and cannot reliably reason or calculate. Lower held-out prediction loss is not evidence of safe finance advice.',
	data: FINANCE_CORPUS.version
} as const;

/** A real CPU causal transformer. Training, generation and inspection share one forward pass. */
export class FinanceTransformer {
	readonly config: Required<TransformerConfig>;
	readonly vocabulary = CHARACTER_VOCABULARY;
	private parameters: Parameter[];
	private optimizer: Adam;
	private random: () => number;
	private trainRecords: number[][];
	private domain: TrainingDomain = 'finance';
	private domainFinal: { step: number; scores: DomainScores } | null = null;
	private final: { step: number; score: LanguageScore } | null = null;
	step = 0;

	constructor(config: TransformerConfig = {}) {
		this.config = Object.freeze({
			seed: config.seed ?? 42,
			learningRate: config.learningRate ?? 0.004,
			contextSize: config.contextSize ?? 32,
			width: config.width ?? 16,
			heads: config.heads ?? 2
		});
		const { seed, learningRate, contextSize, width, heads } = this.config;
		if (
			!Number.isSafeInteger(seed) ||
			!Number.isInteger(width) ||
			width < 4 ||
			width > 32 ||
			!Number.isInteger(heads) ||
			heads < 1 ||
			heads > 4 ||
			width % heads ||
			!Number.isInteger(contextSize) ||
			contextSize < 4 ||
			contextSize > 64 ||
			!Number.isFinite(learningRate) ||
			learningRate <= 0 ||
			learningRate > 0.05
		)
			throw new Error('Invalid bounded transformer configuration.');
		const random = seededRandom(seed);
		this.random = seededRandom(seed + 731);
		const weightScale = Math.sqrt(3 / width);
		this.parameters = [
			initializeParameter('token embeddings', CHARACTER_VOCABULARY.length, width, random, 0.08),
			initializeParameter('position embeddings', contextSize, width, random, 0.04),
			initializeParameter('query projection', width, width, random, weightScale),
			initializeParameter('key projection', width, width, random, weightScale),
			initializeParameter('value projection', width, width, random, weightScale),
			initializeParameter('attention output projection', width, width, random, weightScale * 0.25),
			initializeParameter('feed-forward expansion', width, width * 2, random, weightScale * 0.5),
			initializeParameter('feed-forward contraction', width * 2, width, random, weightScale * 0.25),
			initializeParameter(
				'vocabulary projection',
				width,
				CHARACTER_VOCABULARY.length,
				random,
				weightScale * 0.1
			),
			initializeParameter('vocabulary bias', 1, CHARACTER_VOCABULARY.length, random, 0)
		];
		this.optimizer = new Adam(this.parameters);
		this.trainRecords = FINANCE_CORPUS.train.map((text) => encodeCharacters(`\n${text}\n`));
	}

	get parameterCount() {
		return this.parameters.reduce((sum, { matrix }) => sum + matrix.data.length, 0);
	}
	get isCommitted() {
		return this.final !== null;
	}
	weights() {
		return snapshot(this.parameters);
	}
	get trainingDomain() {
		return this.domain;
	}
	/** Change sampled documents only; retain all parameters, Adam moments, step and training RNG. */
	setTrainingDomain(domain: TrainingDomain) {
		if (this.final)
			throw new Error('Final holdout has been revealed. Start a new experiment to change domain.');
		if (domain !== 'finance' && domain !== 'general') throw new Error('Unknown training domain.');
		this.domain = domain;
		const corpus = domain === 'finance' ? FINANCE_CORPUS : GENERAL_CORPUS;
		this.trainRecords = corpus.train.map((text) => encodeCharacters(`\n${text}\n`));
	}

	private forward(ids: number[], training = false) {
		if (!ids.length || ids.length > this.config.contextSize)
			throw new Error('The forward pass needs 1 to contextSize tokens.');
		const tape = new Tape(training);
		const p = this.parameters.map(({ matrix }) => matrix);
		const tokenEmbeddings = tape.gather(p[0], ids);
		const positionEmbeddings = tape.gather(
			p[1],
			ids.map((_, index) => index)
		);
		const embedded = tape.add(tokenEmbeddings, positionEmbeddings);
		const normalized = tape.rmsnorm(embedded);
		const queries = tape.matmul(normalized, p[2]);
		const keys = tape.matmul(normalized, p[3]);
		const values = tape.matmul(normalized, p[4]);
		const attention = tape.attention(queries, keys, values, this.config.heads);
		const attentionMixed = tape.matmul(attention.output, p[5]);
		const attentionResidual = tape.add(embedded, attentionMixed);
		const ffExpanded = tape.relu(tape.matmul(tape.rmsnorm(attentionResidual), p[6]));
		const feedForward = tape.matmul(ffExpanded, p[7]);
		const finalResidual = tape.add(attentionResidual, feedForward);
		const logits = tape.add(tape.matmul(tape.rmsnorm(finalResidual), p[8]), p[9]);
		return {
			tape,
			logits,
			tokenEmbeddings,
			positionEmbeddings,
			embedded,
			queries,
			keys,
			values,
			attention,
			attentionMixed,
			attentionResidual,
			ffExpanded,
			feedForward,
			finalResidual
		};
	}

	private loss(ids: number[], targets: number[], gradients = false, scale = 1) {
		const { tape, logits } = this.forward(ids, gradients);
		const loss = tape.crossEntropy(logits, targets, scale);
		if (gradients) tape.backward();
		return loss;
	}

	/** Inputs and one-position-shifted targets never cross a document or split boundary. */
	trainingExample(document = 0, start = 0) {
		if (!Number.isInteger(document) || document < 0 || document >= this.trainRecords.length)
			throw new Error('Unknown training document.');
		const record = this.trainRecords[document];
		if (!Number.isInteger(start) || start < 0 || start >= record.length - 1)
			throw new Error('Invalid training window.');
		const length = Math.min(this.config.contextSize, record.length - start - 1);
		const inputs = record.slice(start, start + length);
		const targets = record.slice(start + 1, start + length + 1);
		return {
			document: `train-${document + 1}`,
			start,
			inputs,
			targets,
			inputText: decodeCharacters(inputs),
			targetText: decodeCharacters(targets)
		};
	}

	/** Each optimizer step averages two independently sampled training windows. */
	train(steps = 5): TrainingUpdate {
		if (this.final)
			throw new Error('Final holdout has been revealed. Start a new experiment to train again.');
		if (!Number.isInteger(steps) || steps < 1 || steps > 50)
			throw new Error('Train between 1 and 50 steps per chunk.');
		let batchLoss = 0;
		let gradientNorm = 0;
		for (let s = 0; s < steps; s++) {
			clearGradients(this.parameters);
			batchLoss = 0;
			for (let b = 0; b < 2; b++) {
				const document = Math.floor(this.random() * this.trainRecords.length);
				const maxStart = Math.max(
					0,
					this.trainRecords[document].length - this.config.contextSize - 1
				);
				const example = this.trainingExample(document, Math.floor(this.random() * (maxStart + 1)));
				batchLoss += this.loss(example.inputs, example.targets, true, 0.5) / 2;
			}
			gradientNorm = this.optimizer.update(this.config.learningRate);
			this.step++;
		}
		return { step: this.step, batchLoss, gradientNorm };
	}

	/** Public inspection is always inference: no optimizer call, parameter update or RNG use. */
	inspect(text: string) {
		const tokens = characterTokens(text || '\n').slice(-this.config.contextSize);
		const ids = tokens.map((token) => token.id);
		const f = this.forward(ids);
		const logits = f.logits.toRows();
		const probabilities = logits.map((row) => softmax(row));
		return {
			step: this.step,
			tokens,
			contextText: decodeCharacters(ids),
			truncated: Array.from(text).length > this.config.contextSize,
			tokenEmbeddings: f.tokenEmbeddings.toRows(),
			positionEmbeddings: f.positionEmbeddings.toRows(),
			embedded: f.embedded.toRows(),
			queries: f.queries.toRows(),
			keys: f.keys.toRows(),
			values: f.values.toRows(),
			attention: f.attention.weights,
			attentionScores: f.attention.scores,
			attentionOutput: f.attention.output.toRows(),
			attentionMixed: f.attentionMixed.toRows(),
			attentionResidual: f.attentionResidual.toRows(),
			feedForwardHidden: f.ffExpanded.toRows(),
			feedForward: f.feedForward.toRows(),
			finalResidual: f.finalResidual.toRows(),
			logits,
			probabilities,
			next: probabilities[probabilities.length - 1]
				.map((probability, id) => ({ id, piece: CHARACTER_VOCABULARY[id], probability }))
				.sort((a, b) => b.probability - a.probability)
		};
	}

	/** Temperature affects selection only. Zero means greedy argmax; no weights change. */
	generate(text: string, options: GenerationOptions = {}) {
		const count = options.tokens ?? 60;
		const temperature = options.temperature ?? 0.8;
		if (
			!Number.isInteger(count) ||
			count < 1 ||
			count > 240 ||
			!Number.isFinite(temperature) ||
			temperature < 0 ||
			temperature > 3 ||
			(options.seed !== undefined && !Number.isSafeInteger(options.seed))
		)
			throw new Error('Invalid bounded generation options.');
		const seed = options.seed ?? 31;
		const random = seededRandom(seed);
		const context = encodeCharacters(text || '\n');
		const generated: {
			id: number;
			piece: string;
			modelProbability: number;
			samplingProbability: number;
		}[] = [];
		for (let t = 0; t < count; t++) {
			const { logits } = this.forward(context.slice(-this.config.contextSize));
			const row = logits.data.subarray((logits.rows - 1) * logits.cols);
			const modelProbs = softmax(row);
			const sampleProbs =
				temperature > 0
					? softmax(row, temperature)
					: modelProbs.map((_, i) => Number(i === modelProbs.indexOf(Math.max(...modelProbs))));
			let draw = random();
			let id = sampleProbs.length - 1;
			for (let i = 0; i < sampleProbs.length; i++) {
				draw -= sampleProbs[i];
				if (draw <= 0) {
					id = i;
					break;
				}
			}
			context.push(id);
			generated.push({
				id,
				piece: CHARACTER_VOCABULARY[id],
				modelProbability: modelProbs[id],
				samplingProbability: sampleProbs[id]
			});
		}
		const continuation = decodeCharacters(generated.map((token) => token.id));
		return {
			prompt: text,
			continuation,
			text: text + continuation,
			tokens: generated,
			step: this.step,
			temperature,
			seed
		};
	}

	private evaluate(records: readonly string[]): LanguageScore {
		let totalLoss = 0;
		let targetTokens = 0;
		for (const text of records) {
			const ids = encodeCharacters(`\n${text}\n`);
			// Fixed nonoverlapping windows; every target is evaluated once, with no cross-record context.
			for (let start = 0; start < ids.length - 1; start += this.config.contextSize) {
				const length = Math.min(this.config.contextSize, ids.length - 1 - start);
				totalLoss +=
					this.loss(ids.slice(start, start + length), ids.slice(start + 1, start + length + 1)) *
					length;
				targetTokens += length;
			}
		}
		const loss = totalLoss / targetTokens;
		return { loss, perplexity: Math.exp(loss), targetTokens, documents: records.length };
	}

	metrics() {
		const corpus = this.domain === 'general' ? GENERAL_CORPUS : FINANCE_CORPUS;
		return {
			step: this.step,
			train: this.evaluate(corpus.train),
			validation: this.evaluate(corpus.validation)
		};
	}
	/** Repeatedly inspected development holdouts. Neither set is sampled by train(). */
	domainValidation(): DomainScores {
		return {
			general: this.evaluate(GENERAL_CORPUS.validation),
			finance: this.evaluate(FINANCE_CORPUS.validation)
		};
	}
	commitDomainFinal() {
		if (!this.domainFinal) {
			const scores = {
				general: this.evaluate(GENERAL_CORPUS.test),
				finance: this.final?.score ?? this.evaluate(FINANCE_CORPUS.test)
			};
			this.domainFinal = { step: this.step, scores };
			this.final = { step: this.step, score: scores.finance };
		}
		return {
			step: this.domainFinal.step,
			scores: {
				general: { ...this.domainFinal.scores.general },
				finance: { ...this.domainFinal.scores.finance }
			}
		};
	}
	commitFinal() {
		if (!this.final) this.final = { step: this.step, score: this.evaluate(FINANCE_CORPUS.test) };
		return { ...this.final, score: { ...this.final.score } };
	}
	gradientCheck() {
		const inputs = encodeCharacters('cash ').slice(0, this.config.contextSize);
		const targets = encodeCharacters('ash f').slice(0, this.config.contextSize);
		return finiteDifferenceCheck(
			this.parameters,
			() => {
				clearGradients(this.parameters);
				return this.loss(inputs, targets, true);
			},
			() => this.loss(inputs, targets),
			4
		);
	}
}
