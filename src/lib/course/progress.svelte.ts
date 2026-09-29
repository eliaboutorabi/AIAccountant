import { modules } from './index';
import { browser } from '$app/environment';
import { getContext } from 'svelte';

export const BOOK = Symbol('course-evidence');
type Event = { id: string; at: number };
export type AnswerAttempt = Event & {
	answer: number;
	hints: number[];
	priorFeedback: boolean;
	priorSolution: boolean;
	priorHistoryUnknown: boolean;
};
export type CheckHistory = {
	attempts: AnswerAttempt[];
	hints: (Event & { level: 1 | 2 })[];
	reveals: (Event & { kind: 'feedback' | 'solution' })[];
	/** Existing v2 answers do not establish an original attempt or an assistance history. */
	legacyAnswer?: number;
	trimmed?: boolean;
	merged?: boolean;
};
export type WrittenSnapshot = Event & {
	text: string;
	trigger: 'saved' | 'before-solution';
	priorHistoryUnknown: boolean;
};
export type WrittenHistory = {
	first?: WrittenSnapshot;
	reveals: Event[];
	legacyResponse?: string;
	merged?: boolean;
};
export type ModuleEvidence = {
	read: string[];
	answers: Record<string, number>;
	responses: Record<string, string>;
	rubric: string[];
	bookmarked: boolean;
	/** Optional additions preserve compatibility with existing version 2 exports. */
	checkHistory?: Record<string, CheckHistory>;
	writtenHistory?: Record<string, WrittenHistory>;
};
export type BookData = { version: 2; modules: Record<string, ModuleEvidence>; lastModule: string };
export const emptyEvidence = (): ModuleEvidence => ({
	read: [],
	answers: {},
	responses: {},
	rubric: [],
	bookmarked: false,
	checkHistory: {},
	writtenHistory: {}
});
const storageKey = 'ai-accountant-course-v2';
const unique = <T>(values: T[]) => values.filter((value, index) => values.indexOf(value) === index);
const moduleIds = new Set(modules.map((module) => module.id));
const validModule = (id: string) => moduleIds.has(id);
const validKey = (key: string) =>
	/^[A-Za-z0-9][\w:.-]{0,149}$/.test(key) &&
	!['__proto__', 'constructor', 'prototype'].includes(key);
const object = (value: unknown): value is Record<string, unknown> =>
	!!value && typeof value === 'object' && !Array.isArray(value);
const validAnswer = (value: unknown): value is number =>
	typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 10;
const entries = (value: unknown) =>
	object(value)
		? Object.entries(value)
				.filter(([key]) => validKey(key))
				.slice(0, 250)
		: [];
const timestamp = (value: unknown): value is number =>
	typeof value === 'number' &&
	Number.isSafeInteger(value) &&
	value >= 0 &&
	value <= 8640000000000000;
function event(raw: unknown): Event | undefined {
	if (!object(raw) || typeof raw.id !== 'string' || !validKey(raw.id) || !timestamp(raw.at)) return;
	return { id: raw.id, at: raw.at };
}
function newEvent(): Event {
	return {
		id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		at: Date.now()
	};
}
/** Keep the first observation and the newest observations, never just the final green answer. */
function retain<T extends Event>(values: T[], maximum = 200): T[] {
	// Stored order, not a device clock, defines the first attempt within one record.
	const unique = [...new Map(values.map((value) => [value.id, value])).values()];
	return unique.length <= maximum ? unique : [unique[0], ...unique.slice(-(maximum - 1))];
}
function blankCheck(legacyAnswer?: number): CheckHistory {
	return {
		attempts: [],
		hints: [],
		reveals: [],
		...(legacyAnswer === undefined ? {} : { legacyAnswer })
	};
}
function checkHistory(raw: unknown): CheckHistory {
	const result = blankCheck();
	if (!object(raw)) return result;
	if (validAnswer(raw.legacyAnswer)) result.legacyAnswer = raw.legacyAnswer;
	result.trimmed = raw.trimmed === true;
	result.merged = raw.merged === true;
	const attempts = Array.isArray(raw.attempts) ? raw.attempts : [];
	result.attempts = retain(
		attempts.flatMap((value) => {
			const e = event(value);
			if (!e || !object(value) || !validAnswer(value.answer)) return [];
			return [
				{
					...e,
					answer: value.answer,
					hints: Array.isArray(value.hints)
						? ([...new Set(value.hints.filter((v) => v === 1 || v === 2))] as number[])
						: [],
					priorFeedback: value.priorFeedback === true,
					priorSolution: value.priorSolution === true,
					priorHistoryUnknown:
						value.priorHistoryUnknown !== false ||
						typeof value.priorFeedback !== 'boolean' ||
						typeof value.priorSolution !== 'boolean' ||
						!Array.isArray(value.hints)
				}
			];
		})
	);
	if (attempts.length > 200) result.trimmed = true;
	result.hints = retain(
		(Array.isArray(raw.hints) ? raw.hints : []).flatMap((value) => {
			const e = event(value);
			return e && object(value) && (value.level === 1 || value.level === 2)
				? [{ ...e, level: value.level as 1 | 2 }]
				: [];
		})
	);
	result.reveals = retain(
		(Array.isArray(raw.reveals) ? raw.reveals : []).flatMap((value) => {
			const e = event(value);
			return e && object(value) && (value.kind === 'feedback' || value.kind === 'solution')
				? [{ ...e, kind: value.kind as 'feedback' | 'solution' }]
				: [];
		})
	);
	return result;
}
function writtenHistory(raw: unknown): WrittenHistory {
	const result: WrittenHistory = { reveals: [] };
	if (!object(raw)) return result;
	if (typeof raw.legacyResponse === 'string')
		result.legacyResponse = raw.legacyResponse.slice(0, 30000);
	result.merged = raw.merged === true;
	const first = event(raw.first);
	if (
		first &&
		object(raw.first) &&
		typeof raw.first.text === 'string' &&
		['saved', 'before-solution'].includes(String(raw.first.trigger))
	) {
		result.first = {
			...first,
			text: raw.first.text.slice(0, 30000),
			trigger: raw.first.trigger as WrittenSnapshot['trigger'],
			priorHistoryUnknown: raw.first.priorHistoryUnknown !== false
		};
	}
	result.reveals = retain(
		(Array.isArray(raw.reveals) ? raw.reveals : []).flatMap((value) => {
			const e = event(value);
			return e ? [e] : [];
		})
	);
	return result;
}
export function sanitizeBook(raw: unknown): BookData {
	const result: BookData = { version: 2, modules: {}, lastModule: 'M01' };
	if (!object(raw)) return result;
	if (typeof raw.lastModule === 'string' && validModule(raw.lastModule))
		result.lastModule = raw.lastModule;
	if (!object(raw.modules)) return result;
	for (const [id, value] of Object.entries(raw.modules)) {
		if (!validModule(id) || !object(value)) continue;
		const e = emptyEvidence();
		for (const k of ['read', 'rubric'] as const)
			if (Array.isArray(value[k]))
				e[k] = unique(
					value[k].filter((v): v is string => typeof v === 'string' && validKey(v))
				).slice(0, 100);
		e.bookmarked = value.bookmarked === true;
		for (const [key, text] of entries(value.responses))
			if (typeof text === 'string') e.responses[key] = text.slice(0, 30000);
		for (const [key, answer] of entries(value.answers))
			if (validAnswer(answer)) e.answers[key] = answer;
		for (const [key, history] of entries(value.checkHistory))
			e.checkHistory![key] = checkHistory(history);
		for (const [key, history] of entries(value.writtenHistory))
			e.writtenHistory![key] = writtenHistory(history);
		for (const [key, answer] of Object.entries(e.answers)) {
			if (!e.checkHistory![key]) e.checkHistory![key] = blankCheck(answer);
			else if (!e.checkHistory![key].attempts.length) e.checkHistory![key].legacyAnswer ??= answer;
		}
		for (const [key, text] of Object.entries(e.responses))
			if (!e.writtenHistory![key])
				e.writtenHistory![key] = { reveals: [], ...(text.trim() ? { legacyResponse: text } : {}) };
		result.modules[id] = e;
	}
	return result;
}
/** Current notes/answers win conflicts; historical events from both records are retained by ID. */
export function mergeBook(currentRaw: unknown, incomingRaw: unknown): BookData {
	const current = sanitizeBook(currentRaw),
		incoming = sanitizeBook(incomingRaw);
	for (const [id, incomingModule] of Object.entries(incoming.modules)) {
		const own = current.modules[id];
		if (!own) {
			current.modules[id] = incomingModule;
			continue;
		}
		const merged: ModuleEvidence = {
			...incomingModule,
			...own,
			read: unique([...incomingModule.read, ...own.read]),
			rubric: unique([...incomingModule.rubric, ...own.rubric]),
			answers: { ...incomingModule.answers, ...own.answers },
			responses: { ...incomingModule.responses, ...own.responses },
			checkHistory: { ...incomingModule.checkHistory },
			writtenHistory: { ...incomingModule.writtenHistory }
		};
		for (const [key, local] of Object.entries(own.checkHistory ?? {})) {
			const imported = merged.checkHistory![key];
			if (!imported) {
				merged.checkHistory![key] = local;
				continue;
			}
			const all = [...local.attempts, ...imported.attempts];
			merged.checkHistory![key] = {
				attempts: retain(all),
				hints: retain([...imported.hints, ...local.hints]),
				reveals: retain([...imported.reveals, ...local.reveals]),
				...((local.legacyAnswer ?? imported.legacyAnswer) === undefined
					? {}
					: { legacyAnswer: local.legacyAnswer ?? imported.legacyAnswer }),
				trimmed: local.trimmed || imported.trimmed || unique(all.map((e) => e.id)).length > 200,
				merged:
					local.merged ||
					imported.merged ||
					(!!local.attempts[0] &&
						!!imported.attempts[0] &&
						local.attempts[0].id !== imported.attempts[0].id)
			};
		}
		for (const [key, local] of Object.entries(own.writtenHistory ?? {})) {
			const imported = merged.writtenHistory![key];
			if (!imported) {
				merged.writtenHistory![key] = local;
				continue;
			}
			const first = retain([
				...(imported.first ? [imported.first] : []),
				...(local.first ? [local.first] : [])
			]).sort((a, b) => a.at - b.at)[0];
			merged.writtenHistory![key] = {
				...(first ? { first } : {}),
				reveals: retain([...imported.reveals, ...local.reveals]),
				...((local.legacyResponse ?? imported.legacyResponse) === undefined
					? {}
					: { legacyResponse: local.legacyResponse ?? imported.legacyResponse }),
				merged:
					local.merged ||
					imported.merged ||
					(!!local.first && !!imported.first && local.first.id !== imported.first.id)
			};
		}
		current.modules[id] = merged;
	}
	return current;
}
function ensureCheck(e: ModuleEvidence, key: string) {
	e.checkHistory ??= {};
	if (!e.checkHistory[key]) e.checkHistory[key] = blankCheck(e.answers[key]);
	return e.checkHistory[key];
}
function ensureWriting(e: ModuleEvidence, key: string) {
	e.writtenHistory ??= {};
	if (!e.writtenHistory[key])
		e.writtenHistory[key] = {
			reveals: [],
			...(e.responses[key]?.trim() ? { legacyResponse: e.responses[key] } : {})
		};
	return e.writtenHistory[key];
}
export class CourseProgress {
	data = $state<BookData>({ version: 2, modules: {}, lastModule: 'M01' });
	loaded = $state(false);
	storageAvailable = $state(true);
	load() {
		if (!browser || this.loaded) return;
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) this.data = sanitizeBook(JSON.parse(raw));
		} catch {
			this.storageAvailable = false;
		}
		this.loaded = true;
	}
	save() {
		if (!browser) return;
		try {
			localStorage.setItem(storageKey, JSON.stringify(this.data));
		} catch {
			this.storageAvailable = false;
		}
	}
	get(id: string): ModuleEvidence {
		return this.data.modules[id] ?? emptyEvidence();
	}
	update(id: string, operation: (e: ModuleEvidence) => void) {
		if (!validModule(id)) return;
		if (!this.data.modules[id]) this.data.modules[id] = emptyEvidence();
		operation(this.data.modules[id]);
		this.data.lastModule = id;
		this.save();
	}
	response(id: string, key: string, value: string) {
		if (!validKey(key)) return;
		this.update(id, (e) => {
			ensureWriting(e, key);
			e.responses[key] = value.slice(0, 30000);
		});
	}
	answer(id: string, key: string, value: number) {
		if (!validKey(key) || !validAnswer(value)) return;
		this.update(id, (e) => {
			const history = ensureCheck(e, key);
			if (history.attempts.at(-1)?.answer === value && e.answers[key] === value) return;
			const attempt: AnswerAttempt = {
				...newEvent(),
				answer: value,
				hints: unique(history.hints.map((h) => h.level)),
				priorFeedback: history.reveals.some((r) => r.kind === 'feedback'),
				priorSolution: history.reveals.some((r) => r.kind === 'solution'),
				priorHistoryUnknown: history.legacyAnswer !== undefined || history.merged === true
			};
			const values = [...history.attempts, attempt];
			history.attempts = values.length > 200 ? [values[0], ...values.slice(-199)] : values;
			if (values.length > 200) history.trimmed = true;
			e.answers[key] = value;
			if (!history.reveals.some((r) => r.kind === 'feedback'))
				history.reveals.push({ ...newEvent(), kind: 'feedback' });
		});
	}
	hint(id: string, key: string, level: 1 | 2) {
		if (!validKey(key) || (level !== 1 && level !== 2)) return;
		this.update(id, (e) => {
			const h = ensureCheck(e, key);
			if (!h.hints.some((item) => item.level === level)) h.hints.push({ ...newEvent(), level });
		});
	}
	revealCheck(id: string, key: string) {
		if (!validKey(key)) return;
		this.update(id, (e) => {
			const h = ensureCheck(e, key);
			h.reveals = retain([...h.reveals, { ...newEvent(), kind: 'solution' }]);
		});
	}
	captureResponse(id: string, key: string) {
		if (!validKey(key)) return;
		this.update(id, (e) => {
			const h = ensureWriting(e, key);
			h.first ??= {
				...newEvent(),
				text: e.responses[key] ?? '',
				trigger: 'saved',
				priorHistoryUnknown: h.legacyResponse !== undefined
			};
		});
	}
	revealWritten(id: string, key: string) {
		if (!validKey(key)) return;
		this.update(id, (e) => {
			const h = ensureWriting(e, key);
			h.first ??= {
				...newEvent(),
				text: e.responses[key] ?? '',
				trigger: 'before-solution',
				priorHistoryUnknown: h.legacyResponse !== undefined
			};
			h.reveals = retain([...h.reveals, newEvent()]);
		});
	}
	toggle(id: string, field: 'read' | 'rubric', key: string) {
		if (validKey(key))
			this.update(id, (e) => {
				e[field] = e[field].includes(key) ? e[field].filter((v) => v !== key) : [...e[field], key];
			});
	}
	restore(raw: unknown) {
		this.data = sanitizeBook(raw);
		this.save();
	}
}
export const useBook = () => getContext<CourseProgress>(BOOK);
