import { seededRandom } from './numerics';

export type ForecastMethod = 'last' | 'seasonal' | 'moving' | 'trend' | 'seasonal-regression';
export type ForecastHorizon = 1 | 3 | 6;
export type ForecastScenario = 'stable' | 'shift';
export const FORECAST_METHODS: { id: ForecastMethod; label: string; description: string }[] = [
	{
		id: 'last',
		label: 'Last observed month',
		description: 'Carry the latest known value forward.'
	},
	{
		id: 'seasonal',
		label: 'Seasonal naive',
		description: 'Use the target calendar month from the previous year.'
	},
	{
		id: 'moving',
		label: 'Trailing three-month mean',
		description: 'Average the three most recently observed months.'
	},
	{
		id: 'trend',
		label: 'Fitted linear trend',
		description: 'Fit a straight time trend using all observations available at the origin.'
	},
	{
		id: 'seasonal-regression',
		label: 'Trend + month effects',
		description:
			'Fit a time trend and eleven month indicators by least squares using only available history.'
	}
];
export const FORECAST_PROVENANCE = {
	id: 'WILLOW-COLLECTIONS-72-v1',
	units: 'USD thousands',
	period: 'January 2021–December 2026',
	generator:
		'Original synthetic monthly series: level 130, linear trend 0.85 per month, fixed annual month effects, seeded uniform noise in [−8,8).',
	shift:
		'An authored stress starts at month 61: collections drop by 36, then a further 1.5 each month. This is a scenario, not an estimated probability.',
	selection:
		'Select using rolling targets July 2024–December 2025 (months 43–60). Commit at December 2025 month-end before final outcomes.',
	intervals:
		'Symmetric empirical bands use the nearest-rank 90th percentile of at most 24 earlier absolute errors whose target outcomes are available at that origin. At least six calibration errors are required. No coverage guarantee.',
	source: 'https://otexts.com/fpp3/tscv.html'
} as const;

export type MonthlyCollection = { index: number; month: string; value: number };
export type ForecastRow = {
	origin: number;
	originMonth: string;
	target: number;
	targetMonth: string;
	forecast: number;
	actual: number;
	error: number;
	lower: number | null;
	upper: number | null;
	calibrationTargets: number[];
};
export type ForecastMetrics = {
	count: number;
	mae: number;
	rmse: number;
	bias: number;
	bandCount: number;
	covered: number;
	coverage: number | null;
	meanWidth: number | null;
};
export type ForecastResult = {
	method: ForecastMethod;
	rows: ForecastRow[];
	metrics: ForecastMetrics;
};
export type ForecastCommitment = {
	method: ForecastMethod;
	horizon: ForecastHorizon;
	seed: number;
	rationale: string;
};

export function collectionSeries(
	seed = 42,
	scenario: ForecastScenario = 'stable'
): MonthlyCollection[] {
	if (!Number.isInteger(seed) || seed < 1 || seed > 999999)
		throw new Error('Use a whole-number seed from 1 to 999999.');
	const random = seededRandom(seed);
	const seasonal = [-24, -18, -10, 0, 10, 16, 8, 4, -8, 0, 12, 28];
	return Array.from({ length: 72 }, (_, index) => ({
		index,
		month: `${2021 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`,
		value:
			Math.round(
				(130 +
					0.85 * index +
					seasonal[index % 12] +
					(random() * 16 - 8) -
					(scenario === 'shift' && index >= 60 ? 36 + 1.5 * (index - 60) : 0)) *
					100
			) / 100
	}));
}

/** Modified Gram-Schmidt with a reorthogonalization pass; fail explicitly on rank loss. */
function leastSquares(design: number[][], targets: number[]): number[] {
	const columns = design[0]?.length ?? 0;
	if (!columns || design.length < columns)
		throw new Error('Insufficient observations for this regression.');
	const q: number[][] = [];
	const r = Array.from({ length: columns }, () => Array(columns).fill(0) as number[]);
	for (let j = 0; j < columns; j++) {
		const vector = design.map((row) => row[j]);
		for (let pass = 0; pass < 2; pass++) {
			for (let k = 0; k < j; k++) {
				const projection = vector.reduce((sum, value, i) => sum + value * q[k][i], 0);
				r[k][j] += projection;
				for (let i = 0; i < vector.length; i++) vector[i] -= projection * q[k][i];
			}
		}
		const norm = Math.hypot(...vector);
		if (!Number.isFinite(norm) || norm < 1e-10)
			throw new Error(
				'Regression is not identifiable from this history; no fallback forecast was substituted.'
			);
		r[j][j] = norm;
		q.push(vector.map((value) => value / norm));
	}
	const transformed = q.map((column) =>
		column.reduce((sum, value, i) => sum + value * targets[i], 0)
	);
	const result = Array(columns).fill(0) as number[];
	for (let j = columns - 1; j >= 0; j--) {
		let remainder = transformed[j];
		for (let k = j + 1; k < columns; k++) remainder -= r[j][k] * result[k];
		result[j] = remainder / r[j][j];
	}
	return result;
}

/** Receives a prefix only: no future target can influence fitting or its features. */
export function forecastFromHistory(
	history: readonly number[],
	method: ForecastMethod,
	horizon: number
): number {
	if (!Number.isInteger(horizon) || horizon < 1 || horizon > 12)
		throw new Error('Forecast horizon must be a whole number from one to twelve months.');
	if (!history.length || history.some((value) => !Number.isFinite(value)))
		throw new Error('Forecast history must contain finite observations.');
	const n = history.length;
	let result: number;
	switch (method) {
		case 'last':
			result = history[n - 1];
			break;
		case 'seasonal':
			if (n < 12) throw new Error('Seasonal naive needs at least twelve observations.');
			result = history[n - 1 + horizon - 12];
			break;
		case 'moving':
			if (n < 3) throw new Error('The trailing mean needs at least three observations.');
			result = (history[n - 1] + history[n - 2] + history[n - 3]) / 3;
			break;
		case 'trend': {
			if (n < 2) throw new Error('Trend needs at least two observations.');
			const xMean = (n - 1) / 2;
			const yMean = history.reduce((sum, value) => sum + value, 0) / n;
			let cross = 0,
				spread = 0;
			history.forEach((value, i) => {
				cross += (i - xMean) * (value - yMean);
				spread += (i - xMean) ** 2;
			});
			result = yMean + (cross / spread) * (n - 1 + horizon - xMean);
			break;
		}
		case 'seasonal-regression': {
			if (n < 24)
				throw new Error('Trend plus month effects needs at least two full annual cycles.');
			const features = (index: number) => [
				1,
				index / n,
				...Array.from({ length: 11 }, (_, month) => Number(index % 12 === month + 1))
			];
			const coefficients = leastSquares(
				history.map((_, i) => features(i)),
				[...history]
			);
			result = features(n - 1 + horizon).reduce(
				(sum, value, i) => sum + value * coefficients[i],
				0
			);
			break;
		}
		default:
			throw new Error('Unknown forecast method.');
	}
	if (!Number.isFinite(result))
		throw new Error('The forecast was not finite; no replacement value was used.');
	return result;
}

export function nearestRank(values: readonly number[], probability: number): number {
	if (
		!values.length ||
		values.some((value) => !Number.isFinite(value)) ||
		probability <= 0 ||
		probability > 1 ||
		!Number.isFinite(probability)
	)
		throw new Error('A quantile needs finite observations and a probability in (0,1].');
	const ordered = [...values].sort((a, b) => a - b);
	return ordered[Math.ceil(probability * ordered.length) - 1];
}

/** Every forecast is fitted on an observed prefix. Bands use only errors matured by origin. */
export function rollingForecasts(
	series: readonly MonthlyCollection[],
	method: ForecastMethod,
	horizon: ForecastHorizon
): ForecastRow[] {
	if (![1, 3, 6].includes(horizon))
		throw new Error('This experiment supports one, three, or six months.');
	if (series.some((point, i) => point.index !== i || !Number.isFinite(point.value)))
		throw new Error('The series must be contiguous from month one with finite values.');
	const rows: ForecastRow[] = [];
	for (let origin = 23; origin + horizon < series.length; origin++) {
		const target = origin + horizon;
		const forecast = forecastFromHistory(
			series.slice(0, origin + 1).map((point) => point.value),
			method,
			horizon
		);
		const calibration = rows.filter((row) => row.target <= origin).slice(-24);
		const halfWidth =
			calibration.length >= 6
				? nearestRank(
						calibration.map((row) => Math.abs(row.error)),
						0.9
					)
				: null;
		rows.push({
			origin,
			originMonth: series[origin].month,
			target,
			targetMonth: series[target].month,
			forecast,
			actual: series[target].value,
			error: forecast - series[target].value,
			lower: halfWidth === null ? null : forecast - halfWidth,
			upper: halfWidth === null ? null : forecast + halfWidth,
			calibrationTargets: calibration.map((row) => row.target)
		});
	}
	return rows;
}

export function forecastMetrics(rows: readonly ForecastRow[]): ForecastMetrics {
	if (!rows.length) throw new Error('There are no forecast targets to score.');
	const intervals = rows.filter((row) => row.lower !== null && row.upper !== null);
	const covered = intervals.filter(
		(row) => row.actual >= row.lower! && row.actual <= row.upper!
	).length;
	return {
		count: rows.length,
		mae: rows.reduce((sum, row) => sum + Math.abs(row.error), 0) / rows.length,
		rmse: Math.sqrt(rows.reduce((sum, row) => sum + row.error ** 2, 0) / rows.length),
		bias: rows.reduce((sum, row) => sum + row.error, 0) / rows.length,
		bandCount: intervals.length,
		covered,
		coverage: intervals.length ? covered / intervals.length : null,
		meanWidth: intervals.length
			? intervals.reduce((sum, row) => sum + row.upper! - row.lower!, 0) / intervals.length
			: null
	};
}

/** Pedagogical reveal boundary. Client assets are not secure exam proctoring. */
export class ForecastExperiment {
	readonly seed: number;
	readonly horizon: ForecastHorizon;
	private commitment: ForecastCommitment | null = null;
	constructor(seed = 42, horizon: ForecastHorizon = 1) {
		collectionSeries(seed);
		if (![1, 3, 6].includes(horizon))
			throw new Error('Choose a one-, three-, or six-month horizon.');
		this.seed = seed;
		this.horizon = horizon;
	}
	history(): MonthlyCollection[] {
		return collectionSeries(this.seed).slice(0, 60);
	}
	validation(): ForecastResult[] {
		return FORECAST_METHODS.map(({ id }) => {
			const rows = rollingForecasts(this.history(), id, this.horizon).filter(
				(row) => row.target >= 42
			);
			return { method: id, rows, metrics: forecastMetrics(rows) };
		});
	}
	commit(method: ForecastMethod, rationale: string): ForecastCommitment {
		if (this.commitment)
			throw new Error(
				'This experiment is already committed. Start a new development run to change configuration.'
			);
		if (!FORECAST_METHODS.some((candidate) => candidate.id === method))
			throw new Error('Choose a supported method.');
		if (!rationale.trim())
			throw new Error('Record your selection rationale before revealing final outcomes.');
		this.commitment = {
			method,
			seed: this.seed,
			horizon: this.horizon,
			rationale: rationale.trim()
		};
		return { ...this.commitment };
	}
	final(scenario: ForecastScenario = 'stable'): ForecastResult {
		if (!this.commitment)
			throw new Error('Commit a method and rationale before revealing final evidence.');
		const rows = rollingForecasts(
			collectionSeries(this.seed, scenario),
			this.commitment.method,
			this.horizon
		).filter((row) => row.origin >= 59);
		return { method: this.commitment.method, rows, metrics: forecastMetrics(rows) };
	}
	observed(scenario: ForecastScenario = 'stable'): MonthlyCollection[] {
		return this.commitment ? collectionSeries(this.seed, scenario) : this.history();
	}
	report(scenario: ForecastScenario = 'stable') {
		return {
			provenance: FORECAST_PROVENANCE,
			seed: this.seed,
			horizon: this.horizon,
			commitment: this.commitment ? { ...this.commitment } : null,
			observations: this.observed(scenario),
			validation: this.validation(),
			final: this.commitment ? this.final(scenario) : null,
			scenario: this.commitment ? scenario : 'stable'
		};
	}
}
