import { allLessons } from '$lib/data/course';
import { browser } from '$app/environment';
import { empty, sanitizeProgress, type ProgressData } from './progress-data';
export { sanitizeProgress } from './progress-data';
const key = 'ai-accountant-progress-v1';

export class LearningProgress {
	data = $state<ProgressData>(empty());
	loaded = $state(false);
	storageAvailable = $state(true);
	load() {
		if (!browser || this.loaded) return;
		try {
			const raw = localStorage.getItem(key);
			if (raw) this.data = sanitizeProgress(JSON.parse(raw));
		} catch {
			this.storageAvailable = false;
		}
		this.loaded = true;
	}
	save() {
		if (!browser) return;
		try {
			localStorage.setItem(key, JSON.stringify(this.data));
		} catch {
			this.storageAvailable = false;
		}
	}
	visit(id: string) {
		this.data.lastLesson = id;
		this.save();
	}
	answer(id: string, question: number, option: number) {
		const lesson = allLessons.find((l) => l.id === id);
		if (
			!lesson ||
			!lesson.quiz[question] ||
			option < 0 ||
			option >= lesson.quiz[question].options.length
		)
			return;
		const answers = this.data.answers[id] ?? lesson.quiz.map(() => -1);
		answers[question] = option;
		this.data.answers[id] = answers;
		if (!lesson.quiz.every((q, i) => answers[i] === q.answer))
			this.data.completed = this.data.completed.filter((v) => v !== id);
		this.save();
	}
	complete(id: string) {
		const lesson = allLessons.find((l) => l.id === id);
		if (
			lesson?.quiz.every((q, i) => this.data.answers[id]?.[i] === q.answer) &&
			!this.data.completed.includes(id)
		) {
			this.data.completed.push(id);
			this.save();
		}
	}
	bookmark(id: string) {
		this.data.bookmarks = this.data.bookmarks.includes(id)
			? this.data.bookmarks.filter((v) => v !== id)
			: [...this.data.bookmarks, id];
		this.save();
	}
	note(id: string, value: string) {
		this.data.notes[id] = value.slice(0, 10000);
		this.save();
	}
	review(title: string) {
		if (!this.data.reviewed.includes(title)) {
			this.data.reviewed.push(title);
			this.save();
		}
	}
	reset() {
		this.data = empty();
		this.save();
	}
	get percent() {
		return Math.round((this.data.completed.length / allLessons.length) * 100);
	}
	get next() {
		return (
			allLessons.find(
				(l) => l.id === this.data.lastLesson && !this.data.completed.includes(l.id)
			) ??
			allLessons.find((l) => !this.data.completed.includes(l.id)) ??
			allLessons[0]
		);
	}
}
