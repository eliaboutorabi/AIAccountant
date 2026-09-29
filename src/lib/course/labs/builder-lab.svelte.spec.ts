import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BuilderLab from './BuilderLab.svelte';
import '../../../routes/layout.css';
afterEach(() => vi.restoreAllMocks());

test('document controls change actual typing and preserve the original after correction', async () => {
	const screen = await render(BuilderLab, { mode: 'documents' });
	expect(document.querySelector('.builder-source-highlight')!.textContent).toBe('50.00');
	expect(document.querySelector('.builder-check')!.textContent).toContain('$10.00');
	await screen
		.getByRole('combobox', { name: 'Number convention', exact: true })
		.selectOptions('undecided');
	await expect
		.element(screen.getByText('Incomplete evidence', { exact: true }).first())
		.toBeVisible();
	expect(document.querySelectorAll('.builder-cell-unresolved').length).toBeGreaterThan(0);
	await screen
		.getByRole('combobox', { name: 'Number convention', exact: true })
		.selectOptions('dot');
	await screen.getByRole('button', { name: 'Apply correction', exact: true }).click();
	await expect.element(screen.getByText('Reconciled', { exact: true })).toBeVisible();
	await expect.element(screen.getByText('OCR: 60.00', { exact: true })).toBeVisible();
	expect(document.querySelectorAll('.builder-check')[1].textContent).toContain(
		'Incomplete evidence'
	);
	await screen.getByRole('button', { name: 'Reset', exact: true }).click();
	await expect.element(screen.getByText('Discrepancy', { exact: true })).toBeVisible();
});

test('a blank prior-year cell cannot be cleared by a numerical zero elsewhere', async () => {
	const screen = await render(BuilderLab, { mode: 'documents' });
	await screen.getByRole('combobox', { name: 'Correction cell', exact: true }).selectOptions('4:2');
	await screen.getByRole('textbox', { name: 'Corrected source value', exact: true }).fill('0');
	await screen.getByRole('textbox', { name: 'Evidence and reason', exact: true }).fill('');
	await screen.getByRole('button', { name: 'Apply correction', exact: true }).click();
	await expect.element(screen.getByRole('alert')).toHaveTextContent('reason');
	await screen
		.getByRole('textbox', { name: 'Evidence and reason', exact: true })
		.fill('Authored follow-up explicitly confirms zero.');
	await screen.getByRole('button', { name: 'Apply correction', exact: true }).click();
	expect(document.querySelectorAll('.builder-check')[1].textContent).toContain('Reconciled');
});

test('evidence UI withholds mixed-basis rates and recomputes disclosed denominator scope', async () => {
	const screen = await render(BuilderLab, { mode: 'evidence' });
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('10.00%');
	await screen.getByRole('combobox', { name: 'Historical comparator' }).selectOptions('original');
	await expect.element(screen.getByText('Not comparable', { exact: true })).toBeVisible();
	await expect.element(screen.getByText(/The raw quotient is 1.20%/)).toBeVisible();
	await screen.getByRole('combobox', { name: 'Historical comparator' }).selectOptions('restated');
	await screen.getByRole('textbox', { name: 'Clover 2025 revenue · USD million' }).fill('20');
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('55.85%');
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('3 of 3');
	await screen.getByRole('combobox', { name: 'Display unit' }).selectOptions('thousand');
	expect(document.querySelector('.builder-facts')!.textContent).toContain('181,200');
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('10.00%');
});

test('runtime loses a reply then reuses a receipt from a separate retained store', async () => {
	const screen = await render(BuilderLab, { mode: 'runtime' });
	await screen.getByRole('button', { name: 'Load review proposal' }).click();
	await screen.getByRole('button', { name: 'Validate and dispatch' }).click();
	await screen.getByRole('button', { name: 'Checkpoint working state' }).click();
	await screen.getByRole('button', { name: 'Execute, lose reply' }).click();
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('Reply lost');
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('1 item');
	await screen.getByRole('button', { name: 'Reconnect from checkpoint' }).click();
	await screen.getByRole('button', { name: 'Deliver selected call' }).click();
	expect(document.querySelector('.builder-table-scroll')!.textContent).toContain('Receipt reused');
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('1 item');
	await screen.getByRole('button', { name: 'Deliver selected call' }).click();
	expect(document.querySelector('.builder-trace')!.textContent).toContain('duplicate or late');
});

test('runtime can exercise out-of-order calls and revoked execution permission', async () => {
	const screen = await render(BuilderLab, { mode: 'runtime' });
	await screen.getByRole('button', { name: 'Validate and dispatch' }).click();
	await screen.getByRole('button', { name: 'Load review proposal' }).click();
	await screen.getByRole('button', { name: 'Validate and dispatch' }).click();
	await screen.getByRole('checkbox', { name: 'Allow writes at execution' }).click();
	await screen.getByRole('button', { name: 'Deliver selected call' }).click();
	expect(document.querySelector('.builder-table-scroll')!.textContent).toContain(
		'Write permission denied'
	);
	await screen
		.getByRole('combobox', { name: 'Selected call', exact: true })
		.selectOptions('call-read');
	await screen.getByRole('button', { name: 'Deliver selected call' }).click();
	expect(document.querySelector('.builder-table-scroll')!.textContent).toContain(
		'Balance USD 1200.00 at revision 1'
	);
	expect(document.querySelector('.builder-metrics')!.textContent).toContain('0 items');
});

test('voice context is the heard prefix and old tool results cannot enter a new response', async () => {
	const screen = await render(BuilderLab, { mode: 'voice' });
	await screen.getByRole('button', { name: 'Generate next six words' }).click();
	await screen.getByRole('button', { name: 'Generate next six words' }).click();
	await screen.getByRole('button', { name: 'Advance listener by two words' }).click();
	await screen.getByRole('button', { name: 'Advance listener by two words' }).click();
	await screen.getByRole('button', { name: 'Barge in', exact: true }).click();
	expect(document.querySelector('.builder-context')!.textContent).toContain('I found a fifty');
	expect(document.querySelector('.builder-context')!.textContent).not.toContain('dollar');
	expect(document.querySelectorAll('.builder-word-discarded').length).toBe(8);
	await screen.getByRole('button', { name: 'Start next response' }).click();
	await screen.getByRole('button', { name: 'Deliver tool result', exact: true }).click();
	expect(document.querySelector('.builder-trace')!.textContent).toContain(
		'stale generation result'
	);
	await screen
		.getByRole('combobox', { name: 'Tool result identity' })
		.selectOptions('voice-call-2');
	await screen.getByRole('button', { name: 'Deliver tool result', exact: true }).click();
	expect(document.querySelector('.builder-trace')!.textContent).toContain('matched active g2');
});

test('routing responds to measured-quality costs, output reservations, and invalid inputs', async () => {
	const screen = await render(BuilderLab, { mode: 'routing' });
	expect(document.querySelector('.builder-provider-selected')!.textContent).toContain(
		'Deliberate profile'
	);
	await screen.getByRole('spinbutton', { name: 'Critical errors allowed per 100 cases' }).fill('5');
	await screen.getByRole('spinbutton', { name: 'Cost per minor mistake · USD' }).fill('0');
	await screen.getByRole('spinbutton', { name: 'Cost per critical mistake · USD' }).fill('0');
	expect(document.querySelector('.builder-provider-selected')!.textContent).toContain(
		'Compact profile'
	);
	await screen.getByRole('spinbutton', { name: 'Input tokens', exact: true }).fill('8000');
	expect(document.querySelector('.builder-provider-selected')!.textContent).toContain(
		'Balanced profile'
	);
	await screen.getByRole('spinbutton', { name: 'Input tokens', exact: true }).fill('');
	await expect.element(screen.getByRole('alert')).toHaveTextContent('Input tokens');
	expect(document.querySelector('.builder-provider-grid')).toBeNull();
});

test('export snapshot contains the corrected type and original source instead of display text only', async () => {
	let captured: Blob | undefined;
	vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
		captured = blob as Blob;
		return 'blob:fixture-export';
	});
	vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
	vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
	const screen = await render(BuilderLab, { mode: 'documents' });
	await screen.getByRole('button', { name: 'Apply correction', exact: true }).click();
	await screen.getByRole('button', { name: 'Export snapshot', exact: true }).click();
	const data = JSON.parse(await captured!.text());
	expect(data.typed[5][1]).toMatchObject({ value: 50, minor: 5000, original: '60.00' });
	expect(data.corrections).toHaveLength(1);
	expect(data.typed[4][2].value).toBeNull();
});
