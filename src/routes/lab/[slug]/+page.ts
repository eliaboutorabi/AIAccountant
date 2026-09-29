import { error } from '@sveltejs/kit';
import { labs } from '$lib/course/labs';
import { modules } from '$lib/course';
export const entries = () => labs.map((lab) => ({ slug: lab.id }));
export function load({ params }: { params: { slug: string } }) {
	const lab = labs.find((l) => l.id === params.slug);
	if (!lab) error(404, 'This experiment is not in the laboratory.');
	return {
		lab,
		related: modules
			.filter(
				(m) =>
					m.sections.some((s) => s.blocks.some((b) => b.kind === 'lab' && b.id === lab.id)) ||
					m.id === lab.module
			)
			.map((m) => ({ id: m.id, title: m.title }))
	};
}
