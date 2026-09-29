import {
	FinanceTransformer,
	TRANSFORMER_PROVENANCE,
	type DomainScores
} from './finance-transformer';
import { FINANCE_CORPUS, GENERAL_CORPUS } from './finance-corpus';
import type { ParameterSnapshot } from './numerics';
export type AdaptationPoint = {
	step: number;
	phase: 'general' | 'finance';
	general: number;
	finance: number;
};
export const ADAPTATION_PROVENANCE = {
	...TRANSFORMER_PROVENANCE,
	experiment: 'general-to-finance-cpu-v1',
	data: `${GENERAL_CORPUS.version} then ${FINANCE_CORPUS.version}`,
	generalData: GENERAL_CORPUS.version,
	financeData: FINANCE_CORPUS.version,
	transition:
		'Continue updating the same parameters on finance training sentences. Retain Adam moments, learning rate, and training RNG state. No weights are reset or frozen.',
	assessment:
		'General and finance validation documents are repeatedly inspected development holdouts. Both separate final document sets are revealed only on commitment, which freezes training and domain changes.',
	scope:
		'Tiny character-level continued language-model pretraining. Not instruction tuning, preference training, RLHF, or a realistic foundation-model capability benchmark.'
} as const;
export class AdaptationExperiment {
	readonly model: FinanceTransformer;
	readonly initial: DomainScores;
	before: { step: number; scores: DomainScores; weights: ParameterSnapshot[] } | null = null;
	final: ReturnType<FinanceTransformer['commitDomainFinal']> | null = null;
	private points: AdaptationPoint[] = [];
	constructor(seed = 42, learningRate = 0.004) {
		this.model = new FinanceTransformer({
			seed,
			learningRate,
			width: 8,
			heads: 2,
			contextSize: 16
		});
		this.model.setTrainingDomain('general');
		this.initial = this.model.domainValidation();
		this.record(this.initial);
	}
	get phase() {
		return this.final ? ('committed' as const) : this.model.trainingDomain;
	}
	get generalSteps() {
		return this.before?.step ?? this.model.step;
	}
	get financeSteps() {
		return this.before ? this.model.step - this.before.step : 0;
	}
	train(steps = 5) {
		if (
			(this.model.trainingDomain === 'general' ? this.generalSteps : this.financeSteps) + steps >
			500
		)
			throw Error('Each stage is bounded to 500 updates. Compare or commit this run.');
		return this.model.train(steps);
	}
	measure() {
		const scores = this.model.domainValidation();
		this.record(scores);
		return scores;
	}
	private record(scores: DomainScores) {
		const point = {
			step: this.model.step,
			phase: this.model.trainingDomain,
			general: scores.general.loss,
			finance: scores.finance.loss
		};
		const last = this.points.at(-1);
		if (last?.step === point.step && last.phase === point.phase)
			this.points[this.points.length - 1] = point;
		else this.points.push(point);
	}
	beginFinance() {
		if (this.before || this.final)
			throw Error(
				'The finance stage is already started or committed. Reset to try a different development run.'
			);
		if (this.model.step < 1) throw Error('Train the general-language stage before adapting.');
		this.before = { step: this.model.step, scores: this.measure(), weights: this.model.weights() };
		this.model.setTrainingDomain('finance');
		this.measure();
		return { step: this.before.step, scores: this.before.scores };
	}
	commit(rationale: string) {
		if (!this.before || this.financeSteps < 1)
			throw Error('Train on finance sentences before committing.');
		if (!rationale.trim())
			throw Error('Record what the two validation scores imply before revealing final scores.');
		this.final ??= this.model.commitDomainFinal();
		return this.final;
	}
	report() {
		return {
			provenance: ADAPTATION_PROVENANCE,
			config: this.model.config,
			parameters: this.model.parameterCount,
			phase: this.phase,
			step: this.model.step,
			generalSteps: this.generalSteps,
			financeSteps: this.financeSteps,
			initial: structuredClone(this.initial),
			before: this.before
				? { step: this.before.step, scores: structuredClone(this.before.scores) }
				: null,
			current: this.model.domainValidation(),
			history: this.points.map((point) => ({ ...point })),
			final: this.final ? structuredClone(this.final) : null,
			beforeWeights: this.before?.weights ?? null,
			currentWeights: this.model.weights()
		};
	}
}
export const REWARD_CANDIDATES = [
	{
		id: 'confident',
		label: 'Confident explanation',
		text: 'The customer paid less because its cash position is deteriorating.',
		confidence: 5,
		grounding: 0,
		feedback:
			'The supplied balance does not establish the customer’s financial position. Fluency and confidence can reward an unsupported causal story.'
	},
	{
		id: 'supported',
		label: 'Supported reviewer note',
		text: 'USD 500 remains outstanding after accepted payments. The cause is unknown; obtain remittance or dispute evidence.',
		confidence: 3,
		grounding: 5,
		feedback:
			'This uses the available calculation, separates the unknown cause, and proposes relevant evidence. The illustrative grounding score favors this behavior.'
	},
	{
		id: 'abstain',
		label: 'Blanket abstention',
		text: 'Nothing can be said about this invoice.',
		confidence: 1,
		grounding: 2,
		feedback:
			'Avoiding a cause claim helps, but this discards the supported balance. A proxy that rewards only caution can make an assistant unhelpful.'
	}
] as const;
export function scoreRewardProxy(confidenceWeight: number, groundingWeight: number) {
	if (
		![confidenceWeight, groundingWeight].every(
			(value) => Number.isFinite(value) && value >= 0 && value <= 5
		)
	)
		throw Error('Illustrative weights must be between zero and five.');
	return REWARD_CANDIDATES.map((candidate) => ({
		...candidate,
		score: candidate.confidence * confidenceWeight + candidate.grounding * groundingWeight
	}));
}
