import { allLessons } from '$lib/data/course';
export type ProgressData = {
	completed: string[];
	bookmarks: string[];
	answers: Record<string, number[]>;
	notes: Record<string, string>;
	lastLesson: string;
	reviewed: string[];
};
export const empty = (): ProgressData => ({
	completed: [],
	bookmarks: [],
	answers: {},
	notes: {},
	lastLesson: '',
	reviewed: []
});
export function sanitizeProgress(value: unknown): ProgressData {
	const result = empty();
	if (!value || typeof value !== 'object') return result;
	const input = value as Partial<ProgressData>;
	const ids = new Set(allLessons.map((l) => l.id));
	const validIds = (v: unknown) =>
		Array.isArray(v)
			? [...new Set(v.filter((id): id is string => typeof id === 'string' && ids.has(id)))]
			: [];
	result.bookmarks = validIds(input.bookmarks);
	result.lastLesson =
		typeof input.lastLesson === 'string' && ids.has(input.lastLesson) ? input.lastLesson : '';
	for (const lesson of allLessons) {
		const a = input.answers?.[lesson.id];
		if (Array.isArray(a))
			result.answers[lesson.id] = lesson.quiz.map((q, i) =>
				Number.isInteger(a[i]) && a[i] >= 0 && a[i] < q.options.length ? a[i] : -1
			);
		const note = input.notes?.[lesson.id];
		if (typeof note === 'string') result.notes[lesson.id] = note.slice(0, 10000);
	}
	result.completed = validIds(input.completed).filter((id) => {
		const lesson = allLessons.find((l) => l.id === id)!;
		return lesson.quiz.every((q, i) => result.answers[id]?.[i] === q.answer);
	});
	result.reviewed = Array.isArray(input.reviewed)
		? [
				...new Set(
					input.reviewed.filter((v): v is string => typeof v === 'string' && v.length < 200)
				)
			].slice(0, 100)
		: [];
	return result;
}
