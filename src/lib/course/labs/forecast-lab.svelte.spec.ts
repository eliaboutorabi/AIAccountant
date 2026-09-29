import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import ForecastLab from './ForecastLab.svelte';
import '../../../routes/layout.css';

beforeEach(() => {
	localStorage.removeItem('ai-accountant-forecast-v1');
});

test('a horizon change requires a fresh run and commitment precedes the final reveal', async () => {
	const screen = await render(ForecastLab);
	await expect
		.element(screen.getByRole('button', { name: 'Commit method & reveal final year' }))
		.toBeDisabled();
	await screen.getByRole('combobox', { name: 'Forecast horizon' }).selectOptions('6');
	await expect.element(screen.getByText(/Pending settings/)).toBeVisible();
	await screen.getByRole('button', { name: 'Start new run' }).click();
	await screen.getByRole('radio', { name: 'Trend + month effects', exact: true }).click();
	await screen
		.getByRole('textbox', { name: 'Your selection rationale' })
		.fill(
			'Seasonality and trend fit the same-horizon validation evidence; a regime change could invalidate that pattern.'
		);
	await screen.getByRole('button', { name: 'Commit method & reveal final year' }).click();
	await expect
		.element(screen.getByRole('status'))
		.toHaveTextContent('7 final targets are now visible');
	await expect
		.element(screen.getByRole('radio', { name: 'Seasonal naive', exact: true }))
		.toBeDisabled();
	await screen.getByRole('radio', { name: 'Collections slowdown from January 2026' }).click();
	await expect
		.element(screen.getByRole('status'))
		.toHaveTextContent('first sixty months are unchanged');
	await expect.element(screen.getByText(/Authored stress: a 36-thousand drop/)).toBeVisible();
	await screen.getByRole('button', { name: 'Start new run' }).click();
	await expect
		.element(screen.getByText(/You have already viewed final cases for this seed/))
		.toBeVisible();
	await expect
		.element(screen.getByRole('button', { name: 'Commit method & reveal final year' }))
		.toBeDisabled();
});

test('committed evidence, first configuration, and notes survive remount and export', async () => {
	const screen = await render(ForecastLab);
	await screen
		.getByRole('textbox', { name: 'Your selection rationale' })
		.fill('Annual repetition is a useful baseline; its trend lag is an explicit limitation.');
	await screen.getByRole('button', { name: 'Commit method & reveal final year' }).click();
	await screen
		.getByRole('textbox', { name: 'Your interpretation · self-assessed' })
		.fill('A point forecast is not a liquidity guarantee.');
	await screen.getByRole('radio', { name: 'Collections slowdown from January 2026' }).click();
	await screen.unmount();
	const restored = await render(ForecastLab);
	await expect
		.element(restored.getByRole('status'))
		.toHaveTextContent('Restored your committed forecast');
	await expect
		.element(restored.getByRole('textbox', { name: 'Your interpretation · self-assessed' }))
		.toHaveValue('A point forecast is not a liquidity guarantee.');
	await expect
		.element(restored.getByRole('radio', { name: 'Collections slowdown from January 2026' }))
		.toBeChecked();
	const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:forecast-test');
	const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
	try {
		await restored.getByRole('button', { name: 'Export evidence' }).click();
		const blob = create.mock.calls[0][0] as Blob;
		const exported = JSON.parse(await blob.text());
		expect(exported.observations).toHaveLength(72);
		expect(exported.scenario).toBe('shift');
		expect(exported.final.metrics.count).toBe(12);
		expect(exported.firstCommittedRun.scenario).toBe('stable');
		expect(exported.firstCommittedRun.commitment.method).toBe('seasonal');
		expect(exported.consultedSeeds).toEqual([42]);
		expect(exported.interpretation).toBe('A point forecast is not a liquidity guarantee.');
	} finally {
		create.mockRestore();
		click.mockRestore();
	}
});

test('forecast controls and evidence remain accessible on a narrow viewport', async () => {
	await page.viewport(390, 844);
	const screen = await render(ForecastLab);
	await screen
		.getByRole('textbox', { name: 'Your selection rationale' })
		.fill('Compare the same horizon before selecting this baseline.');
	await screen.getByRole('button', { name: 'Commit method & reveal final year' }).click();
	const audit = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		document.documentElement.clientWidth
	);
});
