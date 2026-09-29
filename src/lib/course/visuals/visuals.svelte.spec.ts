import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import TeachingFigure from './TeachingFigure.svelte';
import { interactiveVisuals } from './interactive';
import type { TeachingVisual } from './types';
import '../../../routes/layout.css';

const find = (interaction: string) =>
	interactiveVisuals.find((v) => v.kind === 'interactive' && v.interaction === interaction)!;
function changeRange(label: string, value: string) {
	const input = page.getByRole('slider', { name: label }).element() as HTMLInputElement;
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

test('learning and threshold controls update actual numerical evidence', async () => {
	const screen = await render(TeachingFigure, { visual: find('training') });
	await screen.getByRole('button', { name: 'Take one learning step' }).click();
	await expect.element(screen.getByText('Actual slope update')).toBeVisible();
	await expect.element(screen.getByText('USD thousands · update 1')).toBeVisible();
	await screen.getByRole('button', { name: 'Reset learning line' }).click();
	await expect.element(screen.getByText('USD thousands · update 0')).toBeVisible();
	await screen.unmount();
	const threshold = await render(TeachingFigure, { visual: find('threshold') });
	changeRange('Review if score ≥ threshold', '1');
	await expect.element(threshold.getByText('Undefined', { exact: true })).toBeVisible();
	await expect.element(threshold.getByText('$400.00', { exact: true })).toBeVisible();
});

test('forecast changes its origin and method while keeping the target outside the inputs', async () => {
	const screen = await render(TeachingFigure, { visual: find('forecast') });
	await screen.getByRole('combobox', { name: 'Forecast rule' }).selectOptions('seasonal');
	await screen.getByText('Inspect the available inputs', { exact: true }).click();
	await expect.element(screen.getByText(/same calendar month last year/)).toBeVisible();
	changeRange('Available through 2024-12', '58');
	await expect.element(screen.getByText('Forecast for 2025-12', { exact: true })).toBeVisible();
	await expect.element(screen.getByText(/2024-12:/)).toBeVisible();
	expect((screen.getByRole('slider').element() as HTMLInputElement).max).toBe('58');
});

test('invoice join choice repairs the displayed grain and total', async () => {
	const screen = await render(TeachingFigure, { visual: find('join') });
	await expect.element(screen.getByText('Result · 6 rows')).toBeVisible();
	await screen.getByRole('combobox', { name: 'Join strategy' }).selectOptions('invoice');
	await expect.element(screen.getByText('Result · 3 rows')).toBeVisible();
	await expect.element(screen.getByRole('cell', { name: '400', exact: true })).toBeVisible();
	await screen.getByRole('combobox', { name: 'Join strategy' }).selectOptions('aggregate');
	await expect.element(screen.getByText('Result · 2 rows')).toBeVisible();
	await expect.element(screen.getByText('Both totals reconcile to USD 300.')).toBeVisible();
});

test('attention moving query changes the exact causal mixture', async () => {
	const screen = await render(TeachingFigure, { visual: find('attention') });
	await screen.getByRole('button', { name: 'position 1 The available past' }).click();
	await expect.element(screen.getByText('Query for “The”')).toBeVisible();
	await expect.element(screen.getByText('100.0%', { exact: true })).toBeVisible();
	const rows = document.querySelectorAll('.ie-attention-lane');
	expect(rows.length).toBe(4);
	for (let i = 1; i < 4; i++) {
		expect(rows[i].querySelector('.ie-weight strong')?.textContent).toBe('0.0%');
		expect(rows[i].querySelector('.ie-contribution strong')?.textContent).toBe('[0.000, 0.000]');
	}
});

test('agent write gate waits for approval and unsafe proposal cannot write', async () => {
	const screen = await render(TeachingFigure, { visual: find('agents') });
	for (let i = 0; i < 3; i++) await screen.getByRole('button', { name: 'Run next step' }).click();
	await screen.getByRole('button', { name: 'Try to apply draft' }).click();
	await expect
		.element(screen.getByText('Write permission denied: approval has not been recorded.'))
		.toBeVisible();
	await expect.element(screen.getByText('No change', { exact: true })).toBeVisible();
	await screen.getByRole('button', { name: 'Approve this $144 draft' }).click();
	await screen.getByRole('button', { name: 'Try to apply draft' }).click();
	await expect.element(screen.getByText('$144.00 posted', { exact: true })).toBeVisible();
	expect(document.querySelectorAll('.ie-agent-phases .ie-complete').length).toBe(5);
	expect(document.querySelectorAll('.ie-agent-phases .ie-current').length).toBe(0);
	await screen.getByRole('button', { name: 'Reset workflow' }).click();
	await screen.getByRole('checkbox').click();
	await screen.getByRole('button', { name: 'Run next step' }).click();
	await screen.getByRole('button', { name: 'Run next step' }).click();
	await expect.element(screen.getByText('blocked safely', { exact: true })).toBeVisible();
	await expect.element(screen.getByText('No change', { exact: true })).toBeVisible();
});

test('tokenizer shows real IDs, supports editing and labels the illustrative embedding', async () => {
	const screen = await render(TeachingFigure, { visual: find('tokenizer') });
	await expect
		.element(screen.getByRole('group', { name: 'Actual token pieces and vocabulary IDs' }))
		.toBeVisible();
	await screen.getByRole('textbox', { name: '1 · Text to encode' }).fill('invoice');
	const tokens = screen.getByRole('group', { name: 'Actual token pieces and vocabulary IDs' });
	await expect.element(tokens.getByRole('button')).toHaveLength(1);
	await expect.element(screen.getByText('Illustrative values · 4 dimensions shown')).toBeVisible();
	await screen.getByRole('textbox', { name: '1 · Text to encode' }).fill('');
	await expect.element(screen.getByText('Empty input produces zero tokens.')).toBeVisible();
}, 20000);

for (const visual of interactiveVisuals)
	test(`${visual.id} is accessible and fits a narrow lesson`, async () => {
		await page.viewport(390, 844);
		const screen = await render(TeachingFigure, { visual });
		if (visual.kind === 'interactive' && visual.interaction === 'tokenizer')
			await expect
				.element(screen.getByRole('group', { name: 'Actual token pieces and vocabulary IDs' }))
				.toBeVisible();
		const result = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
		expect(
			result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) }))
		).toEqual([]);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			document.documentElement.clientWidth
		);
	}, 20000);

for (const layout of ['flow', 'cycle', 'compare', 'timeline', 'bars', 'matrix'] as const)
	test(`${layout} diagram has text alternatives and no mobile overflow`, async () => {
		await page.viewport(390, 844);
		const visual: TeachingVisual = {
			...interactiveVisuals[0],
			kind: 'diagram',
			layout,
			nodes: [
				{ label: 'Source', detail: 'Records enter the calculation.', icon: 'file', amount: -12 },
				{
					label: 'Transform',
					detail: 'The transformation preserves the intended grain.',
					icon: 'layers',
					amount: 0
				},
				{ label: 'Result', detail: 'Check the resulting totals.', icon: 'check', amount: 24 }
			],
			rows: ['one', 'two'],
			columns: ['A', 'B', 'C'],
			cells: [
				[0, 0.5, 0.5],
				[0.2, 0.3, 0.5]
			],
			unit: 'illustrative units'
		};
		await render(TeachingFigure, { visual });
		if (layout === 'flow' || layout === 'cycle') {
			expect(document.querySelectorAll('.tf-connector').length).toBe(visual.nodes.length - 1);
		}
		if (layout === 'cycle') {
			expect(document.querySelector('.tf-cycle-return')?.textContent).toContain('01 · Source');
		}
		const result = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
		expect(
			result.violations.map((v) => ({
				id: v.id,
				nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary }))
			}))
		).toEqual([]);
		expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			document.documentElement.clientWidth
		);
	});

test('art image preserves dimensions, zooms with keyboard focus and restores the opener', async () => {
	await page.viewport(390, 844);
	const visual: TeachingVisual = {
		...interactiveVisuals[0],
		kind: 'art',
		image: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
		width: 1536,
		height: 1024,
		transcript: [{ label: 'The mechanism', explanation: 'An accessible full-text explanation.' }]
	};
	const screen = await render(TeachingFigure, { visual });
	const image = screen.getByRole('img').first();
	await expect.element(image).toHaveAttribute('width', '1536');
	await expect.element(image).toHaveAttribute('height', '1024');
	await screen.getByRole('button', { name: `Enlarge: ${visual.title}` }).click();
	await expect.element(screen.getByRole('dialog', { name: visual.title })).toBeVisible();
	await screen.getByRole('button', { name: 'Original size', exact: true }).click();
	const region = screen
		.getByRole('region', { name: `${visual.title}: image viewer` })
		.element() as HTMLDivElement;
	expect(document.activeElement).toBe(region);
	expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
	expect(region.querySelector('img')!.getBoundingClientRect().width).toBe(1536);
	await screen.getByRole('button', { name: 'Fit to window', exact: true }).click();
	expect(region.querySelector('img')!.getBoundingClientRect().width).toBeLessThanOrEqual(
		region.clientWidth
	);
	const audit = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
		[]
	);
	await screen.getByRole('button', { name: 'Close enlarged image' }).click();
	expect(document.querySelector('dialog')?.open).toBe(false);
	expect(document.activeElement?.getAttribute('aria-label')).toBe(`Enlarge: ${visual.title}`);
	await screen.getByText('Read the visual explanation', { exact: true }).click();
	await expect.element(screen.getByText('An accessible full-text explanation.')).toBeVisible();
});
