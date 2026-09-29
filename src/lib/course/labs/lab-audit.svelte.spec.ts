import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SpreadsheetLab from './SpreadsheetLab.svelte';
import RegressionLab from './RegressionLab.svelte';
import ValueLab from './ValueLab.svelte';
import WorkflowLab from './WorkflowLab.svelte';
import AdaptationLab from './AdaptationLab.svelte';
import TransformerLab from './TransformerLab.svelte';
import NetworkLab from '$lib/components/NetworkLab.svelte';
import { AdaptationExperiment } from '$lib/engines/adaptation';
import { FinanceTransformer } from '$lib/engines/finance-transformer';
import { workbooks } from '$lib/engines/spreadsheet';
import { regressionStep, predictCollection } from '$lib/engines/regression';
import '../../../routes/layout.css';
afterEach(() => vi.restoreAllMocks());

test('the formula bar preserves initial, restored, switched and pasted cell contents', async () => {
	for (const book of workbooks) localStorage.removeItem(`ai-accountant-sheet-${book.id}`);
	let screen = await render(SpreadsheetLab);
	await expect
		.element(screen.getByRole('textbox', { name: 'Formula or value for A1', exact: true }))
		.toHaveValue(workbooks[0].cells[0][0]);
	await screen.getByRole('button', { name: 'Apply', exact: true }).click();
	await expect
		.element(screen.getByRole('textbox', { name: 'A1', exact: true }))
		.toHaveValue(workbooks[0].cells[0][0]);
	await screen.getByRole('textbox', { name: 'A1', exact: true }).click();
	const data = new DataTransfer();
	data.setData('text/plain', 'Pasted header\tSecond header');
	document
		.querySelector<HTMLInputElement>('input[aria-label="A1"]')!
		.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: data }));
	await expect
		.element(screen.getByRole('textbox', { name: 'Formula or value for A1', exact: true }))
		.toHaveValue('Pasted header');
	await screen.getByRole('button', { name: 'Apply', exact: true }).click();
	await expect
		.element(screen.getByRole('textbox', { name: 'A1', exact: true }))
		.toHaveValue('Pasted header');
	await screen.unmount();
	screen = await render(SpreadsheetLab);
	await expect
		.element(screen.getByRole('textbox', { name: 'Formula or value for A1', exact: true }))
		.toHaveValue('Pasted header');
	await screen.getByRole('button', { name: workbooks[1].title, exact: true }).click();
	await expect
		.element(screen.getByRole('textbox', { name: 'Formula or value for A1', exact: true }))
		.toHaveValue(workbooks[1].cells[0][0]);
	for (const book of workbooks) localStorage.removeItem(`ai-accountant-sheet-${book.id}`);
});

test('an unstable regression line preserves signed geometry and its last successful checkpoint', async () => {
	const screen = await render(RegressionLab);
	await screen.getByRole('combobox', { name: 'Learning rate' }).selectOptions('2');
	await screen.getByRole('button', { name: 'One update', exact: true }).click();
	await screen.getByRole('button', { name: 'One update', exact: true }).click();
	const params = regressionStep(regressionStep({ weight: 0, bias: 0, step: 0 }, 2).next, 2).next;
	expect(predictCollection(params, 40)).toBeLessThan(0);
	const line = document.querySelector('line[stroke="#c37532"]')!;
	expect(Number(line.getAttribute('y1'))).toBeLessThan(Number(line.getAttribute('y2')));
	expect(Number(line.getAttribute('y2'))).toBeCloseTo(260);
	await screen.getByRole('button', { name: 'Train 25 updates', exact: true }).click();
	await expect.element(screen.getByRole('alert')).toHaveTextContent('unstable');
	const updates = Number(document.querySelector('.metrics strong')!.textContent);
	expect(updates).toBeGreaterThan(2);
	const rows = document.querySelectorAll('details table:first-child tbody tr');
	// First table records the exact successful state, even when the rest of a chunk is rejected.
	expect(Number(rows[rows.length - 1].querySelector('td')!.textContent)).toBe(updates);
});

test('the business case rejects out-of-range finite inputs rather than displaying overflow', async () => {
	const screen = await render(ValueLab);
	await screen.getByRole('spinbutton', { name: 'Weekly documents', exact: true }).fill('1e308');
	await expect.element(screen.getByRole('alert')).toHaveTextContent('within the input limits');
	expect(document.querySelector('.value-results')).toBeNull();
	await screen.getByRole('spinbutton', { name: 'Weekly documents', exact: true }).fill('800');
	await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
	expect(document.querySelector('.value-results')!.textContent).not.toMatch(/NaN|Infinity/);
});

test('development scores explicitly retain their configuration until the suite is rerun', async () => {
	const screen = await render(WorkflowLab, { mode: 'evaluation' });
	await screen
		.getByRole('button', { name: 'Run current configuration against all eight cases' })
		.click();
	expect(document.querySelector('.assessment')!.textContent).toContain('8/8');
	await screen.getByRole('combobox', { name: 'Payment identity' }).selectOptions('keep-all');
	await expect.element(screen.getByText(/Settings changed after this evaluation/)).toBeVisible();
	expect(document.querySelector('.assessment')!.textContent).toContain('8/8');
	await screen
		.getByRole('button', { name: 'Run current configuration against all eight cases' })
		.click();
	await expect
		.element(screen.getByText(/Settings changed after this evaluation/))
		.not.toBeInTheDocument();
	expect(document.querySelector('.assessment')!.textContent).toContain('0/8');
});

// Pause precisely between scheduled metric checkpoints, after a real five-update chunk.
test('pausing adaptation measures the actual retained weights at update five', async () => {
	const original = AdaptationExperiment.prototype.train;
	vi.spyOn(AdaptationExperiment.prototype, 'train').mockImplementation(function (
		this: AdaptationExperiment,
		...args: Parameters<typeof original>
	) {
		const value = original.apply(this, args);
		[...document.querySelectorAll<HTMLButtonElement>('button')]
			.find((b) => b.textContent?.trim() === 'Pause')!
			.click();
		return value;
	});
	const screen = await render(AdaptationLab);
	await screen.getByRole('button', { name: 'Train general stage' }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Paused at update 5');
	await expect
		.element(screen.getByText(/original training sentences · 5 actual updates/))
		.toBeVisible();
	expect(document.querySelector('svg circle')?.getAttribute('cx')).not.toBeNull();
});

test('pausing the language model retains a measured checkpoint and cancels later chunks', async () => {
	const original = FinanceTransformer.prototype.train;
	vi.spyOn(FinanceTransformer.prototype, 'train').mockImplementation(function (
		this: FinanceTransformer,
		...args: Parameters<typeof original>
	) {
		const value = original.apply(this, args);
		[...document.querySelectorAll<HTMLButtonElement>('button')]
			.find((b) => b.textContent?.trim() === 'Pause')!
			.click();
		return value;
	});
	const screen = await render(TransformerLab);
	await screen.getByRole('button', { name: 'Train 100 updates', exact: true }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('Paused at update 5');
	await new Promise((resolve) => setTimeout(resolve, 80));
	expect(document.querySelector('.metrics strong')!.textContent).toBe('5');
});

test('legacy network controls change the numerical result and describe motion rather than playback', async () => {
	const screen = await render(NetworkLab);
	const before = document.querySelector('.network-output strong')!.textContent;
	const slider = document.querySelector<HTMLInputElement>('#age')!;
	slider.value = '100';
	slider.dispatchEvent(new Event('input', { bubbles: true }));
	await expect
		.poll(() => document.querySelector('.network-output strong')!.textContent)
		.not.toBe(before);
	await screen.getByRole('button', { name: 'Pause motion' }).click();
	await expect.element(screen.getByRole('button', { name: 'Resume motion' })).toBeVisible();
});

test('document arithmetic rejects oversized amounts and checks both authored cases', async () => {
	const { default: DocumentLab } = await import('./DocumentLab.svelte');
	const screen = await render(DocumentLab);
	await screen.getByRole('textbox', { name: 'Total (USD)', exact: true }).fill('9'.repeat(310));
	await expect.element(screen.getByText(/safe integer-cent precision/)).toBeVisible();
	expect(document.querySelector('.arithmetic')!.textContent).not.toMatch(
		/Infinity|Components reconcile/
	);
	await screen.getByRole('textbox', { name: 'Total (USD)', exact: true }).fill('1208');
	await screen.getByRole('textbox', { name: 'Invoice ID', exact: true }).fill('WIL-0018');
	await screen.getByRole('button', { name: 'Compare to verified case transcription' }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('fields match');
	await screen.getByRole('button', { name: 'Changed case · INV-SCAN-18' }).click();
	await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
	await screen.getByRole('textbox', { name: 'Total (USD)', exact: true }).fill('1051.80');
	await screen.getByRole('textbox', { name: 'Invoice ID', exact: true }).fill('WIL-0019');
	await screen.getByRole('button', { name: 'Compare to verified case transcription' }).click();
	await expect.element(screen.getByRole('status')).toHaveTextContent('fields match');
});
