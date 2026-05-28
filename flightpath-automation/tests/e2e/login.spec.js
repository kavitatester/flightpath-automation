// tests/e2e/login.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { InventoryPage } = require('../../pages/InventoryPage');
const {
  STANDARD_USER, LOCKED_USER, PROBLEM_USER,
  PASSWORD, ERRORS,
} = require('../../fixtures/testData');

/**
 * Login Test Suite
 * Tags: @smoke @regression
 *
 * Covers:
 *  - Successful login (standard, problem user)
 *  - Locked-out user
 *  - Invalid credentials (bad user, bad pass, empty fields)
 *  - Error message dismiss
 *  - Logout flow
 */
test.describe('Login — Authentication Flows', () => {

  test.beforeEach(async ({ page }) => {
    // Always start from a clean login page (no saved auth state for this suite)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  test('should login successfully with valid credentials @smoke', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.login(STANDARD_USER, PASSWORD);

    await expect(page).toHaveURL(/inventory/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('should login as problem_user and land on inventory @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(PROBLEM_USER, PASSWORD);
    await expect(page).toHaveURL(/inventory/);
  });

  // ── Negative Cases ────────────────────────────────────────────────────────

  test('should block locked-out user with correct error message @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(LOCKED_USER, PASSWORD);

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorMessage()).toContain('locked out');
  });

  test('should show error for wrong password @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(STANDARD_USER, 'wrong_password');

    const error = await loginPage.getErrorMessage();
    expect(error).toBe(ERRORS.WRONG_CREDS);
  });

  test('should show error for empty username @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('', PASSWORD);

    const error = await loginPage.getErrorMessage();
    expect(error).toBe(ERRORS.MISSING_USER);
  });

  test('should show error for empty password @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(STANDARD_USER, '');

    const error = await loginPage.getErrorMessage();
    expect(error).toBe(ERRORS.MISSING_PASS);
  });

  test('should dismiss error message when X button clicked @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.clearError();
    await expect(loginPage.errorMessage).not.toBeVisible();
  });

  // ── Logout ────────────────────────────────────────────────────────────────

  test('should logout and redirect to login page @smoke', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.login(STANDARD_USER, PASSWORD);
    await expect(page).toHaveURL(/inventory/);

    await inventoryPage.logout();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });

  // ── Security ──────────────────────────────────────────────────────────────

  test('should not allow direct navigation to inventory when logged out @regression', async ({ page }) => {
    // Clear cookies first
    await page.context().clearCookies();
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('/');
  });
});
