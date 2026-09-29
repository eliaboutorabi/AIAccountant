import { expect, test, vi } from 'vitest';
import { FINAL_EXPOSURE_STORAGE_KEY } from '$lib/engines/final-exposure';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import RepresentationLab from './RepresentationLab.svelte';
import DenoisingLab from './DenoisingLab.svelte';
import '../../../routes/layout.css';

test('representation comparison trains, commits, and adapts actual reused and scratch models', async () => {
	await page.viewport(1200, 1000);
	const screen = await render(RepresentationLab);
	await expect
		.element(screen.getByRole('button', { name: 'Commit & reveal source test' }))
		.toBeDisabled();
	await screen.getByRole('button', { name: 'Fit 200 updates' }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Finished 200 source updates');
	await screen.getByRole('button', { name: 'Commit & reveal source test' }).click();
	await expect.element(screen.getByText('Source comparison committed.')).toBeVisible();
	await expect.element(screen.getByRole('button', { name: 'Fit 200 updates' })).toBeDisabled();
	await screen.getByRole('button', { name: 'Capture source & begin comparison' }).click();
	await expect
		.element(screen.getByText(/Source exposure: 128 labeled records and 200 updates/))
		.toBeVisible();
	await screen.getByRole('button', { name: 'Adapt both for 100 updates' }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Finished 100 target updates');
	await screen.getByRole('button', { name: 'Freeze both & reveal target test' }).click();
	await expect.element(screen.getByText('Independent target cases, now revealed')).toBeVisible();
	await expect
		.element(screen.getByRole('button', { name: 'Adapt both for 100 updates' }))
		.toBeDisabled();
	await screen.getByRole('button', { name: 'Reset experiment' }).click();
	await expect.element(screen.getByText(/You have viewed final cases/)).toBeVisible();
	await screen.unmount();
	const reopened = await render(RepresentationLab);
	await expect.element(reopened.getByText(/You have viewed final cases/)).toBeVisible();
}, 15000);

test('representation reset cancels pending training updates', async () => {
	const screen = await render(RepresentationLab);
	await screen.getByRole('button', { name: 'Fit 200 updates' }).click();
	await screen.getByRole('button', { name: 'Reset experiment' }).click();
	await new Promise((resolve) => setTimeout(resolve, 200));
	await expect.element(screen.getByRole('status')).toHaveTextContent('Source models initialized');
	await expect
		.element(screen.getByRole('button', { name: 'Commit & reveal source test' }))
		.toBeDisabled();
});

test('denoising learns, separates evaluation noise from training, and freezes its final test', async () => {
	const screen = await render(DenoisingLab);
	await screen.getByRole('button', { name: 'Learn for 200 updates' }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Finished 200 updates');
	const slider = screen.getByRole('slider', { name: /Evaluation noise standard deviation/ });
	const input = slider.element() as HTMLInputElement;
	input.value = '1.2';
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await expect
		.element(screen.getByText(/This evaluation noise is outside the model’s training range/))
		.toBeVisible();
	await screen.getByRole('button', { name: 'Commit & reveal final denoising test' }).click();
	await expect
		.element(screen.getByRole('status'))
		.toHaveTextContent('Final cases revealed at noise 1.20');
	await expect
		.element(screen.getByRole('button', { name: 'Learn for 200 updates' }))
		.toBeDisabled();
	input.value = '0.2';
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await expect
		.element(screen.getByRole('status'))
		.toHaveTextContent('Final cases revealed at noise 1.20');
	await expect
		.element(screen.getByRole('heading', { name: 'The final denoising test is now revealed.' }))
		.toBeVisible();
	await screen.getByRole('button', { name: 'Reset model' }).click();
	await expect.element(screen.getByText(/You have viewed final cases/)).toBeVisible();
	await screen.unmount();
	const reopened = await render(DenoisingLab);
	await expect.element(reopened.getByText(/You have viewed final cases/)).toBeVisible();
}, 15000);

test('denoising reset cancels pending optimization and preserves pending settings correctly', async () => {
	const screen = await render(DenoisingLab);
	await screen.getByRole('button', { name: 'Learn for 200 updates' }).click();
	await screen.getByRole('button', { name: 'Reset model' }).click();
	await new Promise((resolve) => setTimeout(resolve, 200));
	await expect.element(screen.getByRole('status')).toHaveTextContent('Fresh random weights');
	await expect
		.element(screen.getByRole('button', { name: 'Commit & reveal final denoising test' }))
		.toBeDisabled();
	await screen.getByRole('combobox', { name: 'Maximum training noise' }).selectOptions('0.3');
	await expect.element(screen.getByText(/Pending settings apply on reset/)).toBeVisible();
	await screen.getByRole('button', { name: 'Apply settings & reset' }).click();
	await expect
		.element(screen.getByText(/This evaluation noise is outside the model’s training range/))
		.toBeVisible();
});

test('representation and denoising controls remain accessible at a narrow viewport', async () => {
	await page.viewport(390, 844);
	const representation = await render(RepresentationLab);
	await expect
		.element(representation.getByRole('status'))
		.toHaveTextContent('Source models initialized');
	const first = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		first.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		document.documentElement.clientWidth
	);
	await representation.unmount();
	const denoising = await render(DenoisingLab);
	await expect.element(denoising.getByRole('status')).toHaveTextContent('Fresh random weights');
	const second = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		second.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		document.documentElement.clientWidth
	);
}, 15000);

test('unavailable exposure storage is labeled unknown rather than a fresh final test', async () => {
	const original = Storage.prototype.getItem;
	const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (
		this: Storage,
		key: string
	) {
		if (key === FINAL_EXPOSURE_STORAGE_KEY) throw new Error('storage blocked');
		return original.call(this, key);
	});
	try {
		const screen = await render(DenoisingLab);
		await expect.element(screen.getByText(/Prior exposure is unknown/)).toBeVisible();
	} finally {
		read.mockRestore();
	}
});
