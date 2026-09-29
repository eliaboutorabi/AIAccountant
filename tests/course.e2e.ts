import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { labs } from '../src/lib/course/labs';

test('the visual atlas filters, links into lessons, and supports readable image zoom', async ({
	page
}) => {
	await page.goto('./visuals/');
	await expect(page.locator('.visual-card')).toHaveCount(82);
	await page.getByRole('button', { name: 'Infographics', exact: true }).click();
	await expect(page.locator('.visual-card')).toHaveCount(25);
	await page.getByLabel('Select study day').selectOption('3');
	await expect(page.locator('.visual-card')).toHaveCount(5);
	await page.getByLabel('Find a visual').fill('attention');
	await expect(page.locator('.visual-card')).toHaveCount(1);
	await page.locator('.visual-card').click();
	await expect(page).toHaveURL(/course\/m12\/#/);
	const enlarge = page.getByRole('button', { name: /^Enlarge:/ });
	await enlarge.click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Original size', exact: true }).click();
	const region = dialog.getByRole('region', { name: /image viewer/ });
	await expect(region).toBeFocused();
	expect(await region.locator('img').evaluate((e) => e.getBoundingClientRect().width)).toBe(1536);
	await page.keyboard.press('ArrowRight');
	await expect.poll(() => region.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
	await expect(enlarge).toBeFocused();
});

test('inline tokens and attention expose actual calculations inside the chapters', async ({
	page
}) => {
	await page.goto('./course/m11/');
	const tokenizer = page.locator('#M11-interactive-token-ids');
	await expect(tokenizer.getByRole('button', { name: /^Token 1:/ })).toBeVisible();
	await tokenizer.getByLabel('1 · Text to encode').fill('INV-42 paid.');
	await expect(
		tokenizer.getByRole('group', { name: 'Actual token pieces and vocabulary IDs' })
	).toContainText('ID');
	await tokenizer.getByText('Verify the full text & understand the scope', { exact: true }).click();
	await expect(tokenizer.locator('pre')).toHaveText('INV-42 paid.');
	await expect(tokenizer).toContainText('Exact round trip.');
	await page.goto('./course/m12/');
	const attention = page.locator('#M12-interactive-mixture');
	await attention
		.getByRole('group', { name: 'Query position' })
		.getByRole('button')
		.first()
		.click();
	await expect(attention.locator('.ie-masked')).toHaveCount(3);
	for (const masked of await attention.locator('.ie-masked').all()) {
		await expect(masked.locator('.ie-weight')).toContainText('0.0%');
	}
	await expect(attention.locator('.ie-attention-output')).toContainText('1.000');
	await attention.getByRole('group', { name: 'Query position' }).getByRole('button').last().click();
	await expect(attention.locator('.ie-masked')).toHaveCount(0);
	await expect(attention.locator('.ie-attention-output')).toContainText('1.000');
});

test('a module preserves reading, case writing, bookmarks, and attempts', async ({ page }) => {
	await page.goto('./');
	await expect(page.locator('h1')).toContainText('Accounting minds.');
	await page.getByRole('link', { name: 'Begin the five-day course' }).click();
	await expect(page.locator('h1')).toContainText('AI history');
	await page.getByLabel('I’ve studied this section and can explain its main idea.').first().check();
	await page
		.getByLabel('Your case response', { exact: true })
		.fill(
			'Validate the source, calculate the exact amount, and separate approval authority from extraction.'
		);
	await page.getByRole('button', { name: 'Bookmark module', exact: true }).click();
	const check = page.locator('#knowledge-check fieldset').first();
	await check.getByRole('radio').first().check();
	await check.getByRole('button', { name: /Check my answer/ }).click();
	await page.reload();
	await expect(
		page.getByLabel('I’ve studied this section and can explain its main idea.').first()
	).toBeChecked();
	await expect(page.getByLabel('Your case response', { exact: true })).toHaveValue(
		/Validate the source/
	);
	await expect(page.getByRole('button', { name: 'Bookmarked', exact: true })).toBeVisible();
	await expect(page.locator('#knowledge-check')).toContainText('first recorded');
});

test('search and glossary reach expanded chapters', async ({ page, isMobile }) => {
	await page.goto('./');
	await page.getByRole('button', { name: 'Search the course', exact: true }).click();
	await page.getByRole('textbox', { name: 'Search the course', exact: true }).fill('idempotency');
	await expect(page.getByRole('dialog').getByRole('link').first()).toBeVisible();
	await page.getByRole('button', { name: 'Close search' }).click();
	if (isMobile) await page.getByRole('button', { name: 'Toggle navigation' }).click();
	await page.getByRole('link', { name: 'Technical glossary', exact: true }).click();
	await page.getByRole('textbox', { name: 'Find a term' }).fill('idempotency');
	await expect(page.locator('.term-card')).toHaveCount(1);
	await page.getByRole('link', { name: /Study the concept/ }).click();
	await expect(page).toHaveURL(/course\/m17\//);
});

test('linked definitions work by keyboard and fit the viewport', async ({ page }) => {
	await page.goto('./course/m11/');
	const term = page.locator('button.technical-term').first();
	await term.focus();
	await term.press('Enter');
	await expect(page.locator('.definition')).toHaveCount(1);
	await expect(page.locator('.definition a')).toHaveAttribute('href', /course\/m\d+\/?$/);
	expect(
		await page.locator('.definition').evaluate((e) => {
			const r = e.getBoundingClientRect();
			return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
		})
	).toBe(true);
	await page.keyboard.press('Escape');
	await expect(page.locator('.definition')).toHaveCount(0);
});

test('the spreadsheet calculates formulas and exposes join multiplication', async ({ page }) => {
	await page.goto('./lab/spreadsheet/');
	const b6 = page.getByRole('textbox', { name: 'B6 exercise cell', exact: true });
	await b6.fill('=SUM(B3:B5)');
	await b6.press('Tab');
	await expect(b6).toHaveValue('720');
	await page.getByRole('textbox', { name: 'B3', exact: true }).fill('610');
	await page.getByRole('textbox', { name: 'B3', exact: true }).press('Tab');
	await expect(b6).toHaveValue('730');
	await page.reload();
	await expect(b6).toHaveValue('730');
	await expect(page.locator('.data-lens tfoot')).toContainText('520');
	await page.getByLabel('Aggregate payments by invoice before joining').check();
	await expect(page.locator('.data-lens tfoot')).toContainText('400');
	await expect(page.locator('.data-lens tfoot')).toContainText('220');
});

test('real regression updates and commitment are accessible through the integrated route', async ({
	page
}) => {
	await page.goto('./lab/training/');
	const before = await page.locator('.regression-lab .metrics').innerText();
	await page.getByRole('button', { name: /Train ?25 updates/ }).click();
	await expect(page.locator('.regression-lab .metrics')).not.toHaveText(before);
	await page.getByRole('button', { name: /Commit/ }).click();
	await expect(page.getByRole('button', { name: 'One update' })).toBeDisabled();
	await expect(page.locator('.regression-lab')).toContainText('40');
});

test('all chapters and laboratory components load without client errors', async ({ page }) => {
	test.setTimeout(180000);
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('./path/');
	const links = await page
		.locator('.module-row')
		.evaluateAll((es) => es.map((e) => (e as HTMLAnchorElement).href));
	expect(links).toHaveLength(25);
	for (const link of links) {
		// The course's prerendered canonical URLs use a trailing slash.
		// Vite preview's directory redirect drops the configured base prefix.
		await page.goto(link.endsWith('/') ? link : `${link}/`);
		await expect(page.locator('#knowledge-check fieldset')).toHaveCount(6);
		await expect(page.locator('#transfer-check')).toBeVisible();
		expect(await page.locator('.tf-figure').count(), link).toBeGreaterThanOrEqual(3);
		await expect(page.locator('.tf-figure[data-kind="art"]')).toHaveCount(1);
		const illustration = page.locator('.tf-art > img');
		await illustration.scrollIntoViewIfNeeded();
		await expect
			.poll(
				() =>
					illustration.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
				{ message: link }
			)
			.toBe(true);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
			),
			link
		).toBe(true);
		const audit = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze();
		expect(
			audit.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
			link
		).toEqual([]);
	}
	for (const { id: slug } of labs) {
		await page.goto(`./lab/${slug}/`);
		await expect(page.locator('.loading')).toHaveCount(0);
		await expect(page.locator('main [role="alert"]')).toHaveCount(0);
		await expect(page.locator('.lab-page h2').first()).toBeVisible();
	}
	expect(errors).toEqual([]);
});

test('portfolio downloads and interview notebook are usable', async ({ page, request }) => {
	await page.goto('./interview/');
	await page
		.getByLabel('Your answer, before the worked response')
		.fill('I would begin with the decision, source records, and a tested baseline.');
	await page.reload();
	await expect(page.getByLabel('Your answer, before the worked response')).toHaveValue(
		/tested baseline/
	);
	await page.goto('./projects/');
	for (const a of await page.locator('a[download]').all()) {
		const href = await a.getAttribute('href');
		const res = await request.get(href!);
		expect(res.ok(), href!).toBe(true);
		expect((await res.body()).length).toBeGreaterThan(100);
	}
	const manifest = await request.get('./downloads/data-manifest.json');
	expect((await manifest.json()).pipeline.outstanding).toBe(900);
});

test('legacy writing survives import without claiming expanded completion', async ({ page }) => {
	await page.goto('./progress/');
	const record = {
		course: 'AI Accountant',
		version: 1,
		progress: {
			completed: ['foundations/1'],
			notes: { 'foundations/1': 'Preserved original accounting note.' },
			bookmarks: ['foundations/1']
		}
	};
	await expect(page.getByLabel('Restore / merge a record')).toBeEnabled();
	await page.getByLabel('Restore / merge a record').setInputFiles({
		name: 'record.json',
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify(record))
	});
	await page.locator('.legacy-record summary').click();
	await expect(
		page.getByText('Preserved original accounting note.', { exact: true })
	).toBeVisible();
	await expect(page.locator('.evidence-stats').first()).toContainText('0');
	await page.getByRole('link', { name: 'A new kind of number person', exact: true }).click();
	await expect(page.getByText('Introductory edition archive', { exact: true })).toBeVisible();
	await expect(page.getByLabel('A thought worth keeping?')).toHaveValue(
		'Preserved original accounting note.'
	);
});

test('storage denial remains usable and malformed imports do not destroy notes', async ({
	page,
	isMobile
}) => {
	await page.addInitScript(() => {
		Storage.prototype.getItem = () => {
			throw Error('Denied for test');
		};
		Storage.prototype.setItem = () => {
			throw Error('Denied for test');
		};
	});
	await page.goto('./course/m01/');
	await page.getByLabel('Your case response', { exact: true }).fill('Keep this working note.');
	if (isMobile) await page.getByRole('button', { name: 'Toggle navigation' }).click();
	await page.getByRole('link', { name: 'Your progress', exact: true }).click();
	await expect(page).toHaveURL(/progress\//);
	await expect(page.getByText('Browser storage is unavailable.', { exact: false })).toBeVisible();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export learning record' }).click();
	expect((await download).suggestedFilename()).toBe('ai-accountant-learning-record-v2.json');
	await expect(page.getByLabel('Restore / merge a record')).toBeEnabled();
	await page.getByLabel('Restore / merge a record').setInputFiles({
		name: 'broken.json',
		mimeType: 'application/json',
		buffer: Buffer.from('{invalid')
	});
	await expect(page.locator('.notice')).toBeVisible();
	await page.getByText('Read this module’s saved writing', { exact: true }).click();
	await expect(page.getByText('Keep this working note.', { exact: true })).toBeVisible();
});

test('principal pages and all workbenches are accessible and responsive', async ({
	page
}, info) => {
	test.setTimeout(180000);
	const failures: unknown[] = [];
	for (const route of [
		'./',
		'./path/',
		'./visuals/',
		'./course/m14/',
		'./diagnostic/',
		'./interview/',
		'./projects/',
		'./progress/',
		'./glossary/',
		'./resources/',
		...labs.map(({ id }) => `./lab/${id}/`)
	]) {
		await page.goto(route);
		if (route.includes('/lab/')) await expect(page.locator('.loading')).toHaveCount(0);
		const audit = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze();
		if (audit.violations.length)
			failures.push({
				route,
				violations: audit.violations.map((v) => ({
					id: v.id,
					nodes: v.nodes.map((n) => ({ target: n.target, details: n.failureSummary }))
				}))
			});
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
			),
			route
		).toBe(true);
	}
	expect(failures).toEqual([]);
	await page.goto('./course/m14/');
	await page.screenshot({ path: `.work/course-reader-${info.project.name}.png` });
});
