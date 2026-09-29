import { defineConfig, devices } from '@playwright/test';
const base = process.env.BASE_PATH || '';
export default defineConfig({
	testDir: './tests',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : 4,
	reporter: 'list',
	use: { baseURL: `http://localhost:4173${base}/`, trace: 'retain-on-failure' },
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1050 } }
		},
		{ name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }
	],
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	}
});
