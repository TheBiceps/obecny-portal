import { defineConfig, devices } from '@playwright/test'

/**
 * Test beží proti zostavenej aplikácii (priečinok ../dist), nie proti dev serveru.
 * Build treba spustiť ručne pred testom, pozri e2e/README.md.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4180/obecny-portal/',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 1600 },
  },
  webServer: {
    command: 'node server.mjs',
    url: 'http://localhost:4180/obecny-portal/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 1600 } },
    },
  ],
})
