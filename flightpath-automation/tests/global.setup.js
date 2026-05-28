// tests/global.setup.js
const { test: setup, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { STANDARD_USER, PASSWORD } = require('../fixtures/testData');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '../fixtures/.auth/user.json');

/**
 * Global Setup — runs once before all tests.
 * Performs login and saves browser storage state so E2E tests
 * skip the login flow and run faster.
 */
setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(STANDARD_USER, PASSWORD);

  // Verify we landed on inventory page
  await expect(page).toHaveURL(/inventory/);

  // Save the authenticated state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });

  console.log('✅ Auth state saved to', AUTH_FILE);
});
