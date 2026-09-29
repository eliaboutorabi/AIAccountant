import { error } from '@sveltejs/kit';
import { chapters, allLessons } from '$lib/data/course';
export function entries() {
	return allLessons.map((l) => ({ slug: l.chapter.slug, lesson: String(l.lessonIndex + 1) }));
}
export function load({ params }: { params: { slug: string; lesson: string } }) {
	const chapter = chapters.find((c) => c.slug === params.slug);
	const index = Number(params.lesson) - 1;
	if (!chapter || !Number.isInteger(index) || !chapter.lessons[index])
		error(404, 'This lesson is not on our path.');
	return {
		chapter,
		lesson: chapter.lessons[index],
		index,
		chapterIndex: chapters.indexOf(chapter),
		id: `${chapter.slug}/${index + 1}`
	};
}
