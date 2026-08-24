// playwright.config.js
// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * FlightPath Automation — Playwright Configuration
 * Supports: multi-browser, API testing, visual regression, Allure reporting
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 2,
  timeout: 30000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        framework: 'Playwright',
        language: 'JavaScript',
        project: 'FlightPath Automation',
        environment: process.env.ENV || 'staging',
      },
    }],
    ['json', { outputFile: 'reports/test-results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  projects: [
    // ── Setup Project (global auth) ──────────────────────────────────────
    {
      name: 'setup',
      testMatch: '**/global.setup.js',
    },

    // ── E2E: Desktop Browsers ────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: ['**/api/**', '**/visual/**'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: ['**/api/**', '**/visual/**'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: ['**/api/**', '**/visual/**'],
    },

    // ── E2E: Mobile Browsers ─────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
      testMatch: '**/e2e/**',
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
      dependencies: ['setup'],
      testMatch: '**/e2e/**',
    },

    // ── API Tests ────────────────────────────────────────────────────────
    {
      name: 'api',
      testMatch: '**/api/**',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
      },
    },

    // ── Visual Regression ────────────────────────────────────────────────
    {
      name: 'visual',
      testMatch: '**/visual/**',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  webServer: process.env.START_SERVER ? {
    command: 'npm run start:dev',
    url: process.env.BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  } : undefined,
});
