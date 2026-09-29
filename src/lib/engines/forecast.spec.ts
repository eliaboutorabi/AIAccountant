import { describe, expect, it } from 'vitest';
import {
	collectionSeries,
	forecastFromHistory,
	FORECAST_METHODS,
	rollingForecasts,
	ForecastExperiment,
	nearestRank,
	forecastMetrics
} from './forecast';

describe('forecasting mechanics and evidence boundaries', () => {
	it('uses a reproducible 72-month source with an unchanged pre-shift history', () => {
		const a = collectionSeries(42),
			b = collectionSeries(42),
			shifted = collectionSeries(42, 'shift');
		expect(a).toEqual(b);
		expect(a).toHaveLength(72);
		expect(a[0].month).toBe('2021-01');
		expect(a[71].month).toBe('2026-12');
		expect(a.slice(0, 60)).toEqual(shifted.slice(0, 60));
		expect(a[60].value - shifted[60].value).toBeCloseTo(36, 9);
		expect(collectionSeries(43)).not.toEqual(a);
	});
	it('reproduces hand-computable baselines and a perfect linear extrapolation', () => {
		const history = Array.from({ length: 24 }, (_, i) => 10 + 2 * i);
		expect(forecastFromHistory(history, 'last', 3)).toBe(56);
		expect(forecastFromHistory(history, 'moving', 3)).toBe(54);
		expect(forecastFromHistory(history, 'seasonal', 3)).toBe(38);
		expect(forecastFromHistory(history, 'trend', 3)).toBeCloseTo(62, 9);
	});
	it('fits trend plus month effects exactly when the data follow that model', () => {
		const season = [-12, 2, 5, 8, -4, 0, 10, -2, 4, 7, -8, 13];
		const history = Array.from({ length: 48 }, (_, i) => 100 + 1.25 * i + season[i % 12]);
		for (const horizon of [1, 3, 6]) {
			const target = 47 + horizon;
			expect(forecastFromHistory(history, 'seasonal-regression', horizon)).toBeCloseTo(
				100 + 1.25 * target + season[target % 12],
				8
			);
		}
	});
	it('does not let future values influence a forecast or its interval', () => {
		const original = collectionSeries(52);
		const changed = original.map((row) => ({
			...row,
			value: row.index > 45 ? row.value + 1000 : row.value
		}));
		for (const { id } of FORECAST_METHODS)
			for (const horizon of [1, 3, 6] as const) {
				const before = rollingForecasts(original, id, horizon).filter((row) => row.origin <= 45);
				const after = rollingForecasts(changed, id, horizon).filter((row) => row.origin <= 45);
				before.forEach((row, i) => {
					expect(after[i].forecast).toBeCloseTo(row.forecast, 10);
					expect(after[i].lower).toEqual(row.lower);
					expect(after[i].upper).toEqual(row.upper);
					expect(row.calibrationTargets.every((target) => target <= row.origin)).toBe(true);
				});
			}
	});
	it('keeps final outcomes hidden until commitment and rejects retuning in a committed run', () => {
		const run = new ForecastExperiment(42, 3);
		expect(run.history()).toHaveLength(60);
		expect(run.report().final).toBeNull();
		expect(run.report().observations).toHaveLength(60);
		expect(() => run.final()).toThrow('Commit');
		expect(() => run.commit('trend', ' ')).toThrow('rationale');
		run.commit('trend', 'Compare later same-horizon errors.');
		expect(run.final().rows).toHaveLength(10);
		expect(run.final().rows.every((row) => row.origin >= 59 && row.target >= 62)).toBe(true);
		expect(() => run.commit('last', 'changed after seeing final')).toThrow('already committed');
	});
	it('has comparable validation targets and honest final target counts by horizon', () => {
		for (const horizon of [1, 3, 6] as const) {
			const run = new ForecastExperiment(6, horizon);
			const validation = run.validation();
			expect(
				validation.every(
					(result) =>
						result.rows.length === 18 &&
						result.rows[0].target === 42 &&
						result.rows.at(-1)?.target === 59
				)
			).toBe(true);
			run.commit('seasonal', 'Annual pattern baseline.');
			expect(run.final().metrics.count).toBe(13 - horizon);
		}
	});
	it('computes empirical quantiles, actual coverage, and metric units consistently', () => {
		expect(nearestRank([0, 2, 3, 5, 5, 8, 8, 12, 12, 18], 0.9)).toBe(12);
		const base = rollingForecasts(collectionSeries(), 'last', 1)[20];
		const rows = [10, -10, 10, -20].map((error, i) => ({
			...base,
			target: i,
			error,
			forecast: 100,
			actual: 100 - error,
			lower: 88,
			upper: 112
		}));
		const metrics = forecastMetrics(rows);
		expect(metrics.mae).toBe(12.5);
		expect(metrics.bias).toBe(-2.5);
		expect(metrics.rmse).toBeCloseTo(Math.sqrt(175), 10);
		expect(metrics.coverage).toBe(0.75);
		expect(metrics.meanWidth).toBe(24);
	});
	it('fails explicitly on unsupported or insufficient inputs', () => {
		expect(() => forecastFromHistory([1, 2], 'seasonal-regression', 1)).toThrow('two full');
		expect(() => forecastFromHistory([1, Number.NaN], 'trend', 1)).toThrow('finite');
		expect(() => forecastFromHistory([1, 2], 'trend', 0)).toThrow('horizon');
		expect(() => collectionSeries(0)).toThrow('seed');
	});
});
