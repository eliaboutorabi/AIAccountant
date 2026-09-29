/** Optional manual verification. Never imported by the regular test suite. */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

if (process.env.RUN_LOCAL_MODEL !== '1') {
	console.error(
		'Opt in with RUN_LOCAL_MODEL=1. This downloads about 600 MB and uses an available WebGPU GPU. Start the course dev server first.'
	);
	process.exit(2);
}
const target = process.env.LOCAL_AGENT_URL || 'http://localhost:5173/lab/local-agent/';
const args = (process.env.LOCAL_AGENT_FLAGS || '').split(',').filter(Boolean);
const output = '.work/local-agent-verification';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args });
const context = await browser.newContext({
	viewport: { width: 1280, height: 1000 },
	acceptDownloads: true
});
const page = await context.newPage();
const errors = [],
	networkAfterLoad = [];
let loaded = false;
context.on('request', (request) => {
	if (loaded)
		networkAfterLoad.push({
			url: request.url(),
			method: request.method(),
			hasBody: !!request.postData()
		});
});
page.on('pageerror', (error) => errors.push(error.message));
try {
	await page.goto(target, { waitUntil: 'networkidle' });
	const hardware = await page.evaluate(async () => {
		const adapter = await navigator.gpu?.requestAdapter();
		return {
			webgpu: !!navigator.gpu,
			adapter: !!adapter,
			shaderF16: adapter?.features.has('shader-f16') ?? false,
			vendor: adapter?.info?.vendor,
			architecture: adapter?.info?.architecture
		};
	});
	console.log('Hardware:', hardware);
	if (!hardware.shaderF16)
		throw Error(
			'Unsupported adapter: no model downloaded. This is an optional experiment; core CI requires no GPU.'
		);
	await page.getByRole('button', { name: 'Download and load optional model' }).click();
	for (let elapsed = 0; elapsed < 300; elapsed++) {
		await page.waitForTimeout(1000);
		if (await page.getByRole('button', { name: 'Run actual model' }).isEnabled()) {
			loaded = true;
			break;
		}
		if (elapsed % 10 === 0)
			console.log(
				'Loading:',
				await page.locator('.local-agent .status').innerText(),
				await page
					.locator('.download-progress')
					.innerText()
					.catch(() => '')
			);
		if ((await page.locator('.local-agent .status').innerText()).includes('Model unavailable'))
			throw Error('The model reported a load failure.');
	}
	if (!loaded) throw Error('Model did not become ready within five minutes.');
	for (const fixture of [
		{ task: 'invoice', evidence: true },
		{ task: 'travel', evidence: true },
		{ task: 'travel', evidence: false }
	]) {
		await page.getByRole('combobox', { name: 'Business question' }).selectOption(fixture.task);
		await page
			.getByRole('checkbox', { name: 'Supply applicable policy evidence' })
			.setChecked(fixture.evidence);
		await page.getByRole('button', { name: 'Run actual model' }).click();
		await page.locator('.local-agent .outcome').waitFor({ timeout: 125000 });
		console.log('Observed case:', fixture, await page.locator('.local-agent .outcome').innerText());
	}
	const waiting = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export actual experiment evidence' }).click();
	const download = await waiting;
	await download.saveAs(`${output}/evidence.json`);
	await page.screenshot({ path: `${output}/browser.png`, fullPage: true });
	await writeFile(
		`${output}/verification.json`,
		JSON.stringify(
			{
				target,
				args,
				hardware,
				loaded,
				networkAfterLoad,
				errors,
				note: 'A successful script means inference executed; inspect exported model answers for correctness. These prompted cases are development evidence, not a reliability estimate.'
			},
			null,
			2
		)
	);
	console.log(
		`Saved actual evidence to ${output}. Requests after load: ${networkAfterLoad.length}; page errors: ${errors.length}.`
	);
	await page.getByRole('button', { name: 'Unload model' }).click();
} finally {
	await browser.close();
}
