import { describe, expect, it } from 'vitest';
import { AdaptationExperiment, scoreRewardProxy } from './adaptation';
import { FinanceTransformer } from './finance-transformer';
import { GENERAL_CORPUS, FINANCE_CORPUS } from './finance-corpus';

describe('actual general-to-finance adaptation', () => {
	it('keeps every document split and both domain corpora disjoint', () => {
		const records = [
			...GENERAL_CORPUS.train,
			...GENERAL_CORPUS.validation,
			...GENERAL_CORPUS.test,
			...FINANCE_CORPUS.train,
			...FINANCE_CORPUS.validation,
			...FINANCE_CORPUS.test
		];
		expect(new Set(records).size).toBe(records.length);
	});
	it('changes the sampled domain while preserving weights and optimizer history', () => {
		const a = new FinanceTransformer({ width: 4, heads: 2, contextSize: 8 });
		const b = new FinanceTransformer({ width: 4, heads: 2, contextSize: 8 });
		a.setTrainingDomain('general');
		b.setTrainingDomain('general');
		a.train(3);
		b.train(3);
		const before = a.weights();
		a.setTrainingDomain('finance');
		expect(a.weights()).toEqual(before);
		expect(a.step).toBe(3);
		expect(a.trainingExample().inputText).toBe('\ncash re');
		b.setTrainingDomain('finance');
		a.train(2);
		b.train(2);
		expect(a.weights()).toEqual(b.weights());
		expect(a.weights()).not.toEqual(before);
	});
	it('scores both heldout domains without changing weights or future training draws', () => {
		const a = new FinanceTransformer({ width: 4, heads: 2, contextSize: 8 });
		const b = new FinanceTransformer({ width: 4, heads: 2, contextSize: 8 });
		a.setTrainingDomain('general');
		b.setTrainingDomain('general');
		a.train(2);
		b.train(2);
		const before = a.weights();
		const scores = a.domainValidation();
		expect(scores.general.documents).toBe(8);
		expect(scores.finance.documents).toBe(8);
		expect(scores.general.targetTokens).toBeGreaterThan(300);
		expect(Number.isFinite(scores.finance.loss)).toBe(true);
		expect(a.weights()).toEqual(before);
		a.train(1);
		b.train(1);
		expect(a.weights()).toEqual(b.weights());
	});
	it('records real before/after losses and freezes both final holdouts at commitment', () => {
		const experiment = new AdaptationExperiment(42);
		experiment.train(10);
		experiment.beginFinance();
		const before = experiment.report();
		expect(before.beforeWeights).toEqual(before.currentWeights);
		experiment.train(10);
		const after = experiment.report();
		expect(after.currentWeights).not.toEqual(before.currentWeights);
		expect(after.current.finance.loss).not.toBe(before.current.finance.loss);
		const final = experiment.commit(
			'Compare both domains and check business reasoning separately.'
		);
		expect(final.scores.general.documents).toBe(8);
		expect(final.scores.finance.documents).toBe(8);
		expect(() => experiment.train(1)).toThrow();
		expect(() => experiment.model.setTrainingDomain('general')).toThrow();
		expect(experiment.commit('A later comment cannot alter the committed scores.')).toEqual(final);
	});
	it('treats the reward selector as an authored numeric illustration, not learning', () => {
		const confidence = scoreRewardProxy(5, 0);
		const grounding = scoreRewardProxy(0, 5);
		expect(confidence.reduce((a, b) => (a.score > b.score ? a : b)).id).toBe('confident');
		expect(grounding.reduce((a, b) => (a.score > b.score ? a : b)).id).toBe('supported');
		expect(scoreRewardProxy(0, 0).every((row) => row.score === 0)).toBe(true);
	});
});
