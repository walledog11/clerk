import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node ./scripts/with-test-env.mjs npm run dev -w apps/dashboard',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'node ./scripts/with-test-env.mjs npm run dev -w apps/gateway',
      url: 'http://localhost:8080',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
