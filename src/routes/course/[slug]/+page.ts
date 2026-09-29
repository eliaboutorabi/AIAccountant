import { error } from '@sveltejs/kit';
import { modules } from '$lib/course';
export const entries = () => modules.map((module) => ({ slug: module.id.toLowerCase() }));
export function load({ params }: { params: { slug: string } }) {
	const index = modules.findIndex((m) => m.id.toLowerCase() === params.slug);
	if (index < 0) error(404, 'This module is not in the course.');
	const adjacent = (i: number) =>
		modules[i] ? { id: modules[i].id, title: modules[i].title } : undefined;
	return { module: modules[index], previous: adjacent(index - 1), next: adjacent(index + 1) };
}
