import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import LocalAgentLab from './LocalAgentLab.svelte';
import '../../../routes/layout.css';

test('optional model stays unloaded on an unsupported adapter and remains accessible', async () => {
	const adapter = vi.spyOn(navigator.gpu, 'requestAdapter').mockResolvedValue(null);
	const screen = await render(LocalAgentLab);
	await expect
		.element(screen.getByText(/This browser has no available WebGPU adapter/))
		.toBeVisible();
	await expect
		.element(screen.getByRole('button', { name: 'Download and load optional model' }))
		.toBeDisabled();
	await expect.element(screen.getByRole('button', { name: 'Run actual model' })).toBeDisabled();
	await expect.element(screen.getByRole('button', { name: 'Unload model' })).toBeDisabled();
	await screen.getByRole('combobox', { name: 'Business question' }).selectOptions('travel');
	await screen.getByRole('checkbox', { name: 'Supply applicable policy evidence' }).click();
	await page.viewport(390, 844);
	const audit = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) }))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
	adapter.mockRestore();
});
