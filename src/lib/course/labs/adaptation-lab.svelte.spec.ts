import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import AdaptationLab from './AdaptationLab.svelte';
import '../../../routes/layout.css';

test('actual staged training preserves the switch, scores both domains, and freezes final weights', async () => {
	localStorage.removeItem('willow-adaptation-final-consulted-v1');
	const screen = await render(AdaptationLab);
	await expect
		.element(screen.getByRole('button', { name: 'Keep weights → switch to finance' }))
		.toBeDisabled();
	await screen.getByRole('combobox', { name: 'Updates in this chunk' }).selectOptions('20');
	await screen.getByRole('button', { name: 'Train general stage' }).click();
	await expect
		.element(screen.getByRole('button', { name: 'Keep weights → switch to finance' }))
		.toBeEnabled();
	await screen.getByRole('button', { name: 'Keep weights → switch to finance' }).click();
	await expect.element(screen.getByText(/Training documents changed to finance/)).toBeVisible();
	await screen.getByRole('button', { name: 'Train finance stage' }).click();
	await expect.element(screen.getByRole('button', { name: 'Pause', exact: true })).toBeDisabled();
	await screen
		.getByRole('textbox', {
			name: 'What do the measured changes justify—and what do they not establish?'
		})
		.fill('Compare both domains; character loss does not establish financial reasoning.');
	await screen.getByRole('button', { name: 'Freeze weights and reveal both final sets' }).click();
	await expect.element(screen.getByText('general final loss', { exact: true })).toBeVisible();
	await expect.element(screen.getByText('finance final loss', { exact: true })).toBeVisible();
	await expect.element(screen.getByRole('button', { name: 'Train finance stage' })).toBeDisabled();
	await screen.getByRole('button', { name: 'Fresh development run' }).click();
	await expect.element(screen.getByText(/At least one final set has been consulted/)).toBeVisible();
	localStorage.removeItem('willow-adaptation-final-consulted-v1');
}, 30000);

test('adaptation controls and descriptions fit mobile and expose accessible names', async () => {
	await page.viewport(390, 844);
	await render(AdaptationLab);
	const audit = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) }))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		document.documentElement.clientWidth
	);
});
