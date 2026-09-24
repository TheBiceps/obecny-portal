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
    baseURL: 'http://localhost:4180',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx --yes serve ../dist -l 4180',
    url: 'http://localhost:4180',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
