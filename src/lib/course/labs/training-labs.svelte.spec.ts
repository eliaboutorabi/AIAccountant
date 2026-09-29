import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import ModelTrainingLab from './ModelTrainingLab.svelte';
import TransformerLab from './TransformerLab.svelte';
import '../../../routes/layout.css';

test('the neural lab trains real weights, commits its threshold and freezes the final result', async () => {
	const screen = await render(ModelTrainingLab);
	await expect.element(screen.getByRole('status')).toHaveTextContent('Fresh random weights');
	await expect
		.element(screen.getByRole('button', { name: 'Commit model & reveal final cases' }))
		.toBeDisabled();
	await screen.getByRole('button', { name: 'One update', exact: true }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Finished 1 updates');
	await screen.getByRole('button', { name: 'Commit model & reveal final cases' }).click();
	await expect.element(screen.getByText('Your final result is now evidence.')).toBeVisible();
	await expect.element(screen.getByRole('button', { name: 'Train 200 updates' })).toBeDisabled();
	await expect.element(screen.getByRole('slider', { name: /Flag when the score/ })).toBeDisabled();
	await screen.getByRole('button', { name: 'Reset weights' }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Fresh random weights');
	await expect.element(screen.getByText(/You have already viewed final cases/)).toBeVisible();
	await screen.unmount();
	const reopened = await render(ModelTrainingLab);
	await expect.element(reopened.getByText(/You have already viewed final cases/)).toBeVisible();
});

test('reset invalidates pending classifier chunks', async () => {
	const screen = await render(ModelTrainingLab);
	await screen.getByRole('button', { name: 'Train 200 updates' }).click();
	await screen.getByRole('button', { name: 'Reset weights' }).click();
	await new Promise((resolve) => setTimeout(resolve, 250));
	await expect.element(screen.getByRole('status')).toHaveTextContent('Fresh random weights');
	await expect
		.element(screen.getByRole('button', { name: 'Commit model & reveal final cases' }))
		.toBeDisabled();
});

test('the transformer lab trains, exposes causal attention and generates actual local output', async () => {
	const screen = await render(TransformerLab);
	await screen.getByRole('button', { name: 'Train 100 updates', exact: true }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Finished 100 updates');
	await screen.getByRole('button', { name: /Look inside/ }).click();
	await expect.element(screen.getByText('Where does position 4 look?')).toBeVisible();
	await screen.getByRole('button', { name: 'Inspect position 0: c, ID 69' }).click();
	await expect.element(screen.getByText('Where does position 0 look?')).toBeVisible();
	await screen.getByRole('button', { name: /Generate text/ }).click();
	await screen.getByRole('button', { name: 'Generate 80 characters', exact: true }).click();
	await expect
		.element(screen.getByRole('status'))
		.toHaveTextContent('Generated 80 characters at update 100');
	await expect.element(screen.getByText('80 selected characters')).toBeVisible();
	await screen.getByRole('button', { name: /Train a model/ }).click();
	await screen.getByRole('button', { name: 'Commit & reveal final loss' }).click();
	await expect.element(screen.getByText('Final corpus evaluated.')).toBeVisible();
	await expect
		.element(screen.getByRole('button', { name: 'Train 100 updates', exact: true }))
		.toBeDisabled();
	await screen.unmount();
	const reopened = await render(TransformerLab);
	await reopened.getByRole('spinbutton', { name: 'Random seed', exact: true }).fill('43');
	await reopened.getByRole('button', { name: 'Apply settings & reset', exact: true }).click();
	await expect.element(reopened.getByText(/resetting or changing the seed/)).toBeVisible();
}, 15000);

test('reset invalidates pending transformer chunks and restores the untrained state', async () => {
	const screen = await render(TransformerLab);
	await screen.getByRole('button', { name: 'Train 500', exact: true }).click();
	await screen.getByRole('button', { name: 'Reset model', exact: true }).click();
	await new Promise((resolve) => setTimeout(resolve, 250));
	await expect.element(screen.getByRole('status')).toHaveTextContent('Fresh random parameters');
	await expect
		.element(screen.getByRole('button', { name: 'Commit & reveal final loss' }))
		.toBeDisabled();
});

test('training labs expose accessible controls and fit a narrow viewport', async () => {
	await page.viewport(390, 844);
	const neural = await render(ModelTrainingLab);
	await expect.element(neural.getByRole('status')).toHaveTextContent('Fresh random weights');
	const neuralAudit = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		neuralAudit.violations.map(({ id, nodes }) => ({
			id,
			targets: nodes.map((node) => node.target)
		}))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		document.documentElement.clientWidth
	);
	await page.viewport(390, 844);
	await neural.unmount();
	const transformer = await render(TransformerLab);
	await transformer.getByRole('button', { name: /Look inside/ }).click();
	const transformerAudit = await axe.run(document.body, {
		runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa']
	});
	expect(
		transformerAudit.violations.map(({ id, nodes }) => ({
			id,
			targets: nodes.map((node) => node.target)
		}))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
		document.documentElement.clientWidth
	);
}, 15000);
