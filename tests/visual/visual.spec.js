// tests/visual/visual.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../../pages/LoginPage');
const { InventoryPage } = require('../../pages/InventoryPage');
const { CartPage }      = require('../../pages/CartCheckoutPage');
const { STANDARD_USER, PASSWORD, PRODUCTS } = require('../../fixtures/testData');

/**
 * Visual Regression Test Suite
 *
 * Uses Playwright's built-in screenshot comparison.
 * On first run: snapshots are created in tests/visual/__snapshots__/
 * On subsequent runs: new screenshots are compared pixel-by-pixel.
 *
 * Run: npx playwright test tests/visual/ --update-snapshots   (to update baselines)
 *
 * Covers:
 *  - Login page layout
 *  - Inventory page layout
 *  - Cart page layout
 *  - Individual product card
 *  - Responsive layouts (mobile)
 */
test.describe('Visual Regression — UI Layout Checks', () => {

  test.use({ storageState: 'fixtures/.auth/user.json' });

  // ── Login Page ────────────────────────────────────────────────────────────

  test('login page — full page snapshot @visual', async ({ page }) => {
    // Use fresh context (not logged in) for login page
    await page.context().clearCookies();
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('login page — error state snapshot @visual', async ({ page }) => {
    await page.context().clearCookies();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid', 'invalid');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveScreenshot('login-error-state.png', {
      animations: 'disabled',
    });
  });

  // ── Inventory Page ────────────────────────────────────────────────────────

  test('inventory page — full page snapshot @visual', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await expect(page).toHaveScreenshot('inventory-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('inventory page — product card snapshot @visual', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    // Capture just the first product card
    const firstCard = page.locator('.inventory_item').first();
    await expect(firstCard).toHaveScreenshot('product-card.png', {
      animations: 'disabled',
    });
  });

  test('inventory page — with items in cart @visual', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);

    // Cart badge should be visible in snapshot
    await expect(page.locator('.shopping_cart_container')).toHaveScreenshot(
      'cart-badge-2-items.png',
      { animations: 'disabled' }
    );
  });

  // ── Cart Page ─────────────────────────────────────────────────────────────

  test('cart page — with 2 items snapshot @visual', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.goToCart();

    await expect(page).toHaveScreenshot('cart-2-items.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  // ── Mobile Viewport ───────────────────────────────────────────────────────

  test('inventory page — mobile viewport snapshot @visual', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();

    await expect(page).toHaveScreenshot('inventory-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
