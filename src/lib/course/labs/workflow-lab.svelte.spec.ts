import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import WorkflowLab from './WorkflowLab.svelte';
import { CAPSTONE_FINAL_PACK } from '$lib/engines/workflow';
const finalKey = 'ai-accountant-capstone-' + CAPSTONE_FINAL_PACK;
const clearFinal = () => {
	localStorage.removeItem(finalKey);
	localStorage.removeItem(finalKey + '-seen');
};
import '../../../routes/layout.css';

test('retrieval changes evidence and distinguishes a citation from support', async () => {
	const screen = await render(WorkflowLab, { mode: 'retrieval' });
	await expect
		.element(screen.getByText('Supported under this constrained check', { exact: true }))
		.toBeVisible();
	await screen
		.getByRole('combobox', { name: 'Authored claim to check' })
		.selectOptions('wrong-amount');
	await expect.element(screen.getByText('Not supported', { exact: true })).toBeVisible();
	await screen.getByRole('combobox', { name: 'Authored claim to check' }).selectOptions('expected');
	await screen
		.getByRole('checkbox', { name: 'Withhold TRAVEL-02 to test missing evidence' })
		.click();
	await expect.element(screen.getByText('Not supported', { exact: true })).toBeVisible();
	await screen.getByRole('button', { name: 'Run and inspect the five-question audit' }).click();
	await expect
		.element(screen.getByRole('region', { name: 'Retrieval audit results' }))
		.toBeVisible();
});

test('the editable tool request executes and rejects malformed amounts', async () => {
	const screen = await render(WorkflowLab, { mode: 'tools' });
	await screen.getByRole('button', { name: 'Calculate exact cents' }).click();
	await screen.getByRole('button', { name: 'Validate and execute' }).click();
	await expect.element(screen.getByText('Execution succeeded', { exact: true })).toBeVisible();
	await screen.getByRole('button', { name: 'Reject fractional cents' }).click();
	await screen.getByRole('button', { name: 'Validate and execute' }).click();
	await expect.element(screen.getByText('INVALID_ARGUMENT', { exact: true })).toBeVisible();
});

test('recovery exposes actual effects and a stable-key retry does not duplicate them', async () => {
	localStorage.removeItem('ai-accountant-workflow-checkpoint-v1');
	const screen = await render(WorkflowLab, { mode: 'harness' });
	await screen.getByRole('button', { name: 'Send D8 · lose response' }).click();
	await expect
		.element(
			screen
				.getByRole('region', { name: 'Actual local review queue' })
				.getByText('Q1', { exact: true })
		)
		.toBeVisible();
	await screen.getByRole('button', { name: 'Retry same D8' }).click();
	await expect
		.element(
			screen
				.getByRole('region', { name: 'Actual local review queue' })
				.getByText('Q2', { exact: true })
		)
		.not.toBeInTheDocument();
	await screen.getByRole('button', { name: 'Save checkpoint on this device' }).click();
	await screen.getByRole('button', { name: 'Reset local queue' }).click();
	await screen.getByRole('button', { name: 'Restore checkpoint' }).click();
	await expect
		.element(
			screen
				.getByRole('region', { name: 'Actual local review queue' })
				.getByText('Q1', { exact: true })
		)
		.toBeVisible();
	await screen.getByRole('button', { name: 'Try fresh D9' }).click();
	await expect
		.element(
			screen
				.getByRole('region', { name: 'Actual local review queue' })
				.getByText('Q2', { exact: true })
		)
		.toBeVisible();
	localStorage.removeItem('ai-accountant-workflow-checkpoint-v1');
});

test('capstone requires a commitment, retains distinct first-case evidence, and exposes faulty variants', async () => {
	clearFinal();
	let screen = await render(WorkflowLab, { mode: 'capstone' });
	await expect.element(screen.getByRole('button', { name: 'Commit configuration' })).toBeDisabled();
	expect(document.body.textContent).not.toContain('F01-K');
	await expect
		.element(screen.getByRole('button', { name: 'Reveal changed-case assessment' }))
		.not.toBeInTheDocument();
	await screen
		.getByRole('textbox', { name: 'Predict the outcome and explain your choice' })
		.fill('Keep all invoices, quarantine duplicate identities, and retain missing evidence.');
	await screen.getByRole('button', { name: 'Run original/local case' }).click();
	await expect
		.element(screen.getByText('Last executed snapshot: PIPE-01-base-v1', { exact: true }))
		.toBeVisible();
	await screen.getByRole('button', { name: 'Commit configuration' }).click();
	await screen.getByRole('button', { name: 'Reveal changed-case assessment' }).click();
	expect(document.querySelector('.assessment')?.textContent).toContain('8/8');
	await screen.getByRole('combobox', { name: 'Payment identity' }).selectOptions('keep-all');
	await screen
		.getByRole('button', { name: 'Run repaired configuration · development evidence' })
		.click();
	await expect
		.element(
			screen.getByRole('status').filter({ hasText: /The original committed results remain/ })
		)
		.toBeVisible();
	expect(document.querySelector('.final-assessment')?.textContent).toContain('0/8');
	const saved = JSON.parse(localStorage.getItem(finalKey)!);
	expect(saved.firstCommit.config.duplicatePolicy).toBe('quarantine');
	expect(saved.firstExposureWasFresh).toBe(true);
	await screen.unmount();
	screen = await render(WorkflowLab, { mode: 'capstone' });
	await expect.element(screen.getByText(/Previously revealed final pack restored/)).toBeVisible();
	expect(document.querySelector('.final-assessment')?.textContent).toContain('8/8');
	await expect.element(screen.getByRole('button', { name: 'Commit configuration' })).toBeDisabled();
	await screen.getByText(/Changed partial settlement, repeated event/).click();
	await screen
		.getByRole('button', { name: 'Inspect records and execution · F01-K', exact: true })
		.click();
	await expect
		.element(screen.getByText('Last executed snapshot: WILLOW-FINAL-02-v1-F01', { exact: true }))
		.toBeVisible();
	await expect
		.element(
			screen
				.getByRole('region', { name: 'Invoice source records' })
				.getByText('1750.50', { exact: true })
		)
		.toBeVisible();
	await page.viewport(390, 844);
	const audit = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
	expect(
		audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }))
	).toEqual([]);
	expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
	clearFinal();
});

test('all workbench modes fit a narrow viewport and expose accessible controls', async () => {
	await page.viewport(390, 844);
	for (const mode of [
		'retrieval',
		'tools',
		'harness',
		'pipeline',
		'agents',
		'evaluation',
		'capstone'
	]) {
		const screen = await render(WorkflowLab, { mode });
		if (['pipeline', 'agents', 'evaluation', 'capstone'].includes(mode))
			await screen.getByRole('button', { name: 'Run original/local case' }).click();
		const audit = await axe.run(document.body, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
		expect(
			audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) })),
			mode
		).toEqual([]);
		expect(document.documentElement.scrollWidth, mode).toBeLessThanOrEqual(window.innerWidth);
		await screen.unmount();
	}
}, 30000);

test('lost saved results do not erase the previously consulted final-pack flag', async () => {
	clearFinal();
	localStorage.setItem(finalKey + '-seen', 'seen');
	localStorage.setItem(finalKey, '{invalid');
	const screen = await render(WorkflowLab, { mode: 'capstone' });
	await expect
		.element(
			screen.getByText(
				/This final pack was previously consulted, but its saved commitment cannot be restored/
			)
		)
		.toBeVisible();
	await screen
		.getByRole('textbox', { name: 'Predict the outcome and explain your choice' })
		.fill('An already seen pack needs truthful exposure labels.');
	await screen.getByRole('button', { name: 'Commit configuration' }).click();
	await screen.getByRole('button', { name: 'Reveal changed-case assessment' }).click();
	expect(JSON.parse(localStorage.getItem(finalKey)!).firstExposureWasFresh).toBe(false);
	await expect
		.element(screen.getByText(/Already consulted or exposure history unverified at commitment/))
		.toBeVisible();
	clearFinal();
});
