import { describe, it, expect } from 'vitest';
import {
	fitPolynomial,
	trainingPoints,
	validationPoints,
	mae,
	classificationMetrics,
	evaluateForecast,
	toyNetwork
} from './lab-math';
import { allLessons, chapters, totalQuestions } from './data/course';
import { sources } from './data/resources';
import { sanitizeProgress } from './progress.svelte';

describe('teaching calculations', () => {
	it('fits an exact line without peeking at validation data', () => {
		const predict = fitPolynomial(
			[
				{ x: 0, y: 2 },
				{ x: 0.5, y: 3 },
				{ x: 1, y: 4 }
			],
			1,
			0
		);
		expect(predict(0.25)).toBeCloseTo(2.5, 8);
	});
	it('the flexible example demonstrates a measurable generalization gap', () => {
		const balanced = fitPolynomial(trainingPoints, 2, 0);
		const flexible = fitPolynomial(trainingPoints, 10, 0);
		expect(mae(trainingPoints, flexible)).toBeLessThan(mae(trainingPoints, balanced));
		expect(mae(validationPoints, flexible)).toBeGreaterThan(mae(validationPoints, balanced));
	});
	it('handles no positive predictions without dividing by zero', () => {
		expect(classificationMetrics(1)).toEqual({
			tp: 0,
			fp: 0,
			fn: 6,
			tn: 9,
			precision: null,
			recall: 0,
			flagged: 0
		});
	});
	it('classifies all predictions and computes precision and recall consistently', () => {
		const m = classificationMetrics(0.5);
		expect(m).toMatchObject({ tp: 4, fp: 3, fn: 2, tn: 6, flagged: 7 });
		expect(m.precision).toBeCloseTo(4 / 7);
		expect(m.recall).toBeCloseTo(4 / 6);
	});
	it('rolling forecasts use the previous observed month, not the actual target', () => {
		const rows = evaluateForecast('last');
		expect(rows[0]).toEqual({ month: 18, actual: 129, predicted: 117 });
		expect(rows[1].predicted).toBe(rows[0].actual);
		expect(evaluateForecast('seasonal')[0].predicted).toBe(108);
	});
	it('the toy network reacts to inputs and keeps activations bounded', () => {
		const low = toyNetwork(0, 0);
		const high = toyNetwork(1, 1);
		expect(high.score).toBeGreaterThan(low.score);
		expect([...high.hidden, high.score].every((n) => n > 0 && n < 1)).toBe(true);
	});
});
describe('course integrity and portable progress', () => {
	it('has complete questions and linked primary sources for every lesson', () => {
		expect(chapters).toHaveLength(12);
		expect(allLessons).toHaveLength(36);
		expect(totalQuestions).toBe(72);
		expect(new Set(allLessons.map((l) => l.id)).size).toBe(36);
		for (const lesson of allLessons) {
			expect(
				lesson.quiz.every(
					(q) =>
						q.options.length >= 3 &&
						q.answer >= 0 &&
						q.answer < q.options.length &&
						q.explanation.length > 30
				)
			).toBe(true);
			expect(lesson.chapter.sources.every((id) => Boolean(sources[id]))).toBe(true);
		}
	});
	it('discards malformed progress and does not award unearned completion', () => {
		const result = sanitizeProgress({
			completed: ['foundations/1', 'invalid'],
			bookmarks: ['foundations/1', 'foundations/1', 'invalid'],
			answers: { 'foundations/1': [99, 1] },
			notes: { 'foundations/1': 42 },
			lastLesson: 'invalid'
		});
		expect(result.completed).toEqual([]);
		expect(result.bookmarks).toEqual(['foundations/1']);
		expect(result.answers['foundations/1']).toEqual([-1, 1]);
		expect(result.notes).toEqual({});
		expect(result.lastLesson).toBe('');
	});
	it('preserves earned completion when restoring a valid record', () => {
		expect(
			sanitizeProgress({ completed: ['foundations/1'], answers: { 'foundations/1': [0, 1] } })
				.completed
		).toEqual(['foundations/1']);
	});
	it('handles a missing or corrupt top-level record', () => {
		expect(sanitizeProgress(null).completed).toEqual([]);
		expect(sanitizeProgress('broken').bookmarks).toEqual([]);
	});
});
