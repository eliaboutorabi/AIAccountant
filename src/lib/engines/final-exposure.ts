/** Local teaching evidence only. Clearing/editing storage never makes reused final cases independent. */
export const FINAL_EXPOSURE_STORAGE_KEY = 'ai-accountant-final-exposure-v1';
export type FinalExposure = {
	datasetVersion: string;
	dataIdentity: string;
	split: string;
	state: 'recorded' | 'not-recorded' | 'unavailable';
	firstSeenAt: number | null;
	lastSeenAt: number | null;
	views: number;
};
type StoredExposure = { firstSeenAt: number; lastSeenAt: number; views: number };
type Store = Pick<Storage, 'getItem' | 'setItem'>;
type Registry = { version: 1; cases: Record<string, StoredExposure> };
function browserStore(): Store | undefined {
	try {
		return typeof localStorage === 'undefined' ? undefined : localStorage;
	} catch {
		return undefined;
	}
}
function registry(store: Store): Registry {
	const raw = store.getItem(FINAL_EXPOSURE_STORAGE_KEY);
	if (raw === null) return { version: 1, cases: {} };
	const parsed: unknown = JSON.parse(raw);
	if (
		!parsed ||
		typeof parsed !== 'object' ||
		!('version' in parsed) ||
		parsed.version !== 1 ||
		!('cases' in parsed) ||
		!parsed.cases ||
		typeof parsed.cases !== 'object' ||
		Array.isArray(parsed.cases)
	)
		throw new Error('Exposure history is unreadable.');
	const cases: Record<string, StoredExposure> = {};
	for (const [key, value] of Object.entries(parsed.cases)) {
		if (
			key.length > 500 ||
			!value ||
			typeof value !== 'object' ||
			!Number.isSafeInteger(value.firstSeenAt) ||
			value.firstSeenAt < 0 ||
			!Number.isSafeInteger(value.lastSeenAt) ||
			value.lastSeenAt < 0 ||
			!Number.isSafeInteger(value.views) ||
			value.views < 1
		)
			throw new Error('Exposure history is unreadable.');
		Object.defineProperty(cases, key, {
			value: { firstSeenAt: value.firstSeenAt, lastSeenAt: value.lastSeenAt, views: value.views },
			enumerable: true,
			writable: true,
			configurable: true
		});
	}
	return { version: 1, cases };
}
function descriptor(
	datasetVersion: string,
	dataIdentity: string | number,
	split: string
): FinalExposure {
	return {
		datasetVersion,
		dataIdentity: String(dataIdentity),
		split,
		state: 'unavailable',
		firstSeenAt: null,
		lastSeenAt: null,
		views: 0
	};
}
/** The identity describes the DATA, not the random initialization of a model. Fixed corpora use 'fixed'. */
export function readFinalExposure(
	datasetVersion: string,
	dataIdentity: string | number = 'fixed',
	split = 'final',
	store: Store | undefined = browserStore()
): FinalExposure {
	const result = descriptor(datasetVersion, dataIdentity, split);
	if (!store) return result;
	try {
		const key = JSON.stringify([datasetVersion, String(dataIdentity), split]);
		const saved = registry(store).cases[key];
		return saved
			? { ...result, ...saved, state: 'recorded' }
			: { ...result, state: 'not-recorded' };
	} catch {
		return result;
	}
}
/** Call only after revealing final cases. Returns unavailable if persistence cannot be confirmed. */
export function markFinalExposure(
	datasetVersion: string,
	dataIdentity: string | number = 'fixed',
	split = 'final',
	store: Store | undefined = browserStore()
): FinalExposure {
	const result = descriptor(datasetVersion, dataIdentity, split);
	if (!store) return result;
	try {
		const key = JSON.stringify([datasetVersion, String(dataIdentity), split]);
		if (key.length > 500) return result;
		const data = registry(store),
			previous = data.cases[key],
			now = Date.now();
		// Preserve known exposure rather than silently evicting old records to make room.
		if (!previous && Object.keys(data.cases).length >= 500) return result;
		const saved = {
			firstSeenAt: previous?.firstSeenAt ?? now,
			lastSeenAt: now,
			views: (previous?.views ?? 0) + 1
		};
		data.cases[key] = saved;
		store.setItem(FINAL_EXPOSURE_STORAGE_KEY, JSON.stringify(data));
		return { ...result, ...saved, state: 'recorded' };
	} catch {
		return result;
	}
}
