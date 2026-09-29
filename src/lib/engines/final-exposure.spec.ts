import { describe, expect, it } from 'vitest';
import { FINAL_EXPOSURE_STORAGE_KEY, markFinalExposure, readFinalExposure } from './final-exposure';
const memory = () => {
	const data = new Map<string, string>();
	return {
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => {
			data.set(key, value);
		}
	};
};
describe('persistent final-case exposure', () => {
	it('survives new readers and preserves the first reveal across repeated runs', () => {
		const store = memory();
		expect(readFinalExposure('data-v1', 42, 'final', store).state).toBe('not-recorded');
		const first = markFinalExposure('data-v1', 42, 'final', store);
		expect(first.state).toBe('recorded');
		expect(readFinalExposure('data-v1', 42, 'final', store)).toEqual(first);
		const second = markFinalExposure('data-v1', 42, 'final', store);
		expect(second.firstSeenAt).toBe(first.firstSeenAt);
		expect(second.views).toBe(2);
	});
	it('keys generated data by seed/split while fixed corpora retain exposure across all model seeds', () => {
		const store = memory();
		markFinalExposure('generated-v1', 42, 'source', store);
		expect(readFinalExposure('generated-v1', 43, 'source', store).state).toBe('not-recorded');
		expect(readFinalExposure('generated-v1', 42, 'target', store).state).toBe('not-recorded');
		markFinalExposure('corpus-v1', 'fixed', 'final', store);
		expect(readFinalExposure('corpus-v1', 'fixed', 'final', store).state).toBe('recorded');
		expect(readFinalExposure('corpus-v2', 'fixed', 'final', store).state).toBe('not-recorded');
	});
	it('reports unavailable storage or corrupt records as unknown, never as a clean first test', () => {
		const denied = {
			getItem: () => {
				throw Error('denied');
			},
			setItem: () => {
				throw Error('denied');
			}
		};
		expect(readFinalExposure('v1', 42, 'final', denied).state).toBe('unavailable');
		expect(markFinalExposure('v1', 42, 'final', denied).state).toBe('unavailable');
		const store = memory();
		store.setItem(FINAL_EXPOSURE_STORAGE_KEY, 'not json');
		expect(readFinalExposure('v1', 42, 'final', store).state).toBe('unavailable');
		expect(markFinalExposure('v1', 42, 'final', store).state).toBe('unavailable');
		expect(store.getItem(FINAL_EXPOSURE_STORAGE_KEY)).toBe('not json');
	});
	it('distinguishes readable history from a failed write', () => {
		const store = {
			getItem: () => null,
			setItem: () => {
				throw Error('quota');
			}
		};
		expect(readFinalExposure('v1', 'fixed', 'final', store).state).toBe('not-recorded');
		expect(markFinalExposure('v1', 'fixed', 'final', store).state).toBe('unavailable');
	});
});
