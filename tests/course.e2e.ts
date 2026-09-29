import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home, navigation, and first lesson retain progress after reload', async ({
	page
}, testInfo) => {
	await page.goto('./');
	await expect(
		page.getByRole('heading', { name: 'Accounting minds. AI possibilities.' })
	).toBeVisible();
	await page.getByRole('link', { name: 'Let’s begin your journey', exact: true }).click();
	await expect(
		page.getByRole('heading', { name: 'A new kind of number person', exact: true })
	).toBeVisible();
	const complete = page.getByRole('button', { name: 'Mark lesson complete', exact: true });
	await expect(complete).toBeDisabled();
	await page.getByRole('radio', { name: 'B A creative language model', exact: true }).check();
	await expect(page.getByText('A useful pause. Let’s unpack it.')).toBeVisible();
	await expect(complete).toBeDisabled();
	await page
		.getByRole('radio', { name: 'A A spreadsheet formula or tested calculation', exact: true })
		.check();
	await page.getByRole('radio', { name: 'B It deserves investigation', exact: true }).check();
	await page
		.getByLabel('A thought worth keeping?')
		.fill('Use deterministic calculations for exact totals.');
	await page.getByRole('button', { name: 'Save this lesson', exact: true }).click();
	await complete.click();
	await expect(page.getByText('A little more confident. A little further along.')).toBeVisible();
	await page.reload();
	await expect(page.getByText('You’ve explored this lesson.')).toBeVisible();
	await expect(page.getByLabel('A thought worth keeping?')).toHaveValue(
		'Use deterministic calculations for exact totals.'
	);
	await page.goto('./progress/');
	await expect(
		page.getByRole('heading', { name: 'A new kind of number person', exact: true })
	).toBeVisible();
	await expect(page.getByText('Use deterministic calculations for exact totals.')).toBeVisible();
	await page.screenshot({ path: `.work/progress-${testInfo.project.name}.png`, fullPage: true });
});

test('search, glossary filters, and mobile navigation work', async ({ page, isMobile }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Search the course', exact: true }).click();
	await page.getByRole('textbox', { name: 'Search the course', exact: true }).fill('overfitting');
	await expect(
		page.getByRole('dialog').getByRole('link', { name: /Overfitting Data science/ })
	).toBeVisible();
	await page.getByRole('button', { name: 'Close search' }).click();
	if (isMobile) {
		await page.getByRole('button', { name: 'Toggle navigation' }).click();
	}
	await page.getByRole('link', { name: 'The little glossary', exact: true }).click();
	await page.getByRole('textbox', { name: 'Find a term' }).fill('idempotency');
	await expect(page.getByRole('heading', { name: 'Idempotency', exact: true })).toBeVisible();
	await page.getByRole('textbox', { name: 'Find a term' }).fill('no-such-concept');
	await expect(page.getByText('We haven’t met that word yet.')).toBeVisible();
	await page.getByRole('button', { name: 'Reset filters' }).click();
	await expect(page.getByRole('heading', { name: 'AI', exact: true })).toBeVisible();
});

test('labs calculate real outcomes and hash deep links select the right experiment', async ({
	page
}) => {
	await page.goto('./playground/#forecast');
	await expect(
		page.getByRole('heading', { name: 'Forecasting studio', exact: true })
	).toBeVisible();
	const previous = await page.locator('.metric-grid').innerText();
	await page.getByLabel('Choose your baseline').selectOption('seasonal');
	await expect(page.locator('.metric-grid')).not.toHaveText(previous);
	await page.getByRole('link', { name: 'Catch or over-catch?', exact: true }).click();
	await expect(page.locator('.metric-grid')).toContainText('57%');
	await page.getByRole('slider').focus();
	await page.getByRole('slider').press('End');
	await expect(page.locator('.metric-grid')).toContainText('Undefined when nothing is flagged.');
	await page.getByRole('link', { name: 'The Goldilocks fit', exact: true }).click();
	await page.getByLabel('Model flexibility').selectOption('10');
	await expect(page.getByText('Notice the gap between practice and new examples.')).toBeVisible();
	await page.getByRole('link', { name: 'The prompt workshop', exact: true }).click();
	await page.getByLabel('1. The task').fill('Explain the June cash variance.');
	await expect(page.locator('.prompt-preview')).toContainText('Explain the June cash variance.');
});

test('interview practice and dataset downloads are usable', async ({ page, request }) => {
	await page.goto('./interview/');
	await page.getByRole('button', { name: 'Agent engineering', exact: true }).click();
	await expect(
		page.getByRole('heading', { name: 'The payment tool timed out.', exact: true })
	).toBeVisible();
	await page
		.getByLabel('Your first thoughts')
		.fill('First check whether the payment was already created.');
	await page.getByRole('button', { name: 'Explore a strong answer' }).click();
	await expect(page.locator('.worked-answer')).toContainText('idempotency');
	await page.getByRole('button', { name: 'Mark as practiced' }).click();
	await expect(page.getByRole('button', { name: 'Practice recorded' })).toBeDisabled();
	await page.goto('./projects/');
	for (const anchor of await page.locator('a[download]').all()) {
		const href = await anchor.getAttribute('href');
		const response = await request.get(href!);
		expect(response.ok(), href!).toBeTruthy();
		expect((await response.body()).length).toBeGreaterThan(50);
	}
});

test('every chapter deep link loads without client errors', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('./path/');
	const links = await page
		.locator('.chapter-lessons a')
		.evaluateAll((elements) => elements.map((e) => (e as HTMLAnchorElement).href));
	expect(links).toHaveLength(36);
	// Every route is also checked during prerender; sample each chapter’s final lesson in a real browser.
	for (const link of links.filter((_, i) => i % 3 === 2)) {
		await page.goto(link);
		await expect(page.locator('.question')).toHaveCount(2);
		await expect(page.locator('h1')).not.toBeEmpty();
	}
	expect(errors).toEqual([]);
});

test('home is accessible and fits the viewport', async ({ page }, testInfo) => {
	await page.goto('./');
	await page.screenshot({ path: `.work/home-${testInfo.project.name}.png`, fullPage: true });
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
		true
	);
	const result = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
		.analyze();
	expect(
		result.violations.map((v) => ({
			id: v.id,
			impact: v.impact,
			nodes: v.nodes.map((n) => ({ target: n.target, details: n.failureSummary }))
		}))
	).toEqual([]);
});

test('3D controls react and important learning pages meet accessibility checks', async ({
	page
}, testInfo) => {
	const hydrationWarnings: string[] = [];
	page.on('console', (message) => {
		if (message.text().includes('hydration')) hydrationWarnings.push(message.text());
	});
	await page.goto('./playground/#network');
	await expect(page.getByText('Growing a little network…')).not.toBeVisible();
	await page.getByLabel('Invoice age').focus();
	await page.getByLabel('Invoice age').press('End');
	await expect(page.locator('.network-output')).not.toContainText('47 / 100');
	await page.getByRole('button', { name: 'Pause motion' }).click();
	await expect(page.getByRole('button', { name: 'Play motion' })).toBeVisible();
	await page.screenshot({ path: `.work/network-${testInfo.project.name}.png`, fullPage: true });
	for (const route of [
		'./playground/#network',
		'./playground/#forecast',
		'./learn/foundations/1/',
		'./path/',
		'./interview/',
		'./projects/',
		'./progress/'
	]) {
		await page.goto(route);
		const result = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze();
		expect(
			result.violations.map((v) => ({
				id: v.id,
				nodes: v.nodes.map((n) => ({ target: n.target, details: n.failureSummary }))
			})),
			route
		).toEqual([]);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
			route
		).toBe(true);
	}
	expect(hydrationWarnings).toEqual([]);
});

test('export and restore work and storage denial is handled', async ({ page }) => {
	await page.addInitScript(() => {
		Storage.prototype.getItem = () => {
			throw new Error('Storage is disabled for this test');
		};
		Storage.prototype.setItem = () => {
			throw new Error('Storage is disabled for this test');
		};
	});
	await page.goto('./progress/');
	await expect(page.getByText('Browser storage is unavailable.', { exact: false })).toBeVisible();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export learning record' }).click();
	expect((await download).suggestedFilename()).toBe('ai-accountant-learning-record.json');
	const record = {
		course: 'AI Accountant',
		version: 1,
		progress: {
			completed: ['foundations/1'],
			answers: { 'foundations/1': [0, 1] },
			notes: { 'foundations/1': 'A restored thought.' },
			bookmarks: ['foundations/1']
		}
	};
	await page
		.getByLabel('Restore a learning record')
		.setInputFiles({
			name: 'record.json',
			mimeType: 'application/json',
			buffer: Buffer.from(JSON.stringify(record))
		});
	await expect(page.getByText('A restored thought.', { exact: true })).toBeVisible();
	await expect(page.getByText('Learning record merged.', { exact: false })).toBeVisible();
});
