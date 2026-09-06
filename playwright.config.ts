import { defineConfig, devices } from '@playwright/test';

import { AUTH_STORAGE_STATE_PATH } from './playwright/test-account';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  globalSetup: './playwright/global-setup.ts',
  globalTeardown: './playwright/global-teardown.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    storageState: AUTH_STORAGE_STATE_PATH,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run dev',
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://learning_forge@localhost:5432/learning_forge?schema=public',
    },
    url: 'http://127.0.0.1:3000/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
