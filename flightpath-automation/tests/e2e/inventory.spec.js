// tests/e2e/inventory.spec.js
const { test, expect } = require('@playwright/test');
const { InventoryPage } = require('../../pages/InventoryPage');
const { SORT_OPTIONS, PRODUCTS } = require('../../fixtures/testData');

/**
 * Inventory Test Suite
 * Tags: @smoke @regression
 *
 * Covers:
 *  - Product listing loads correctly
 *  - Sorting (A→Z, Z→A, low→high, high→low)
 *  - Add/Remove items from cart (cart badge updates)
 *  - Product detail navigation
 */
test.describe('Inventory — Product Listing & Sorting', () => {

  test.use({ storageState: 'fixtures/.auth/user.json' });

  let inventoryPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
  });

  // ── Product Listing ───────────────────────────────────────────────────────

  test('should display 6 products on inventory page @smoke', async () => {
    const count = await inventoryPage.getProductCount();
    expect(count).toBe(6);
  });

  test('should display correct page title @smoke', async () => {
    const title = await inventoryPage.getPageTitle();
    expect(title).toBe('Products');
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  test('should sort products A to Z @regression', async () => {
    await inventoryPage.sortBy(SORT_OPTIONS.AZ);
    const names = await inventoryPage.getAllProductNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('should sort products Z to A @regression', async () => {
    await inventoryPage.sortBy(SORT_OPTIONS.ZA);
    const names = await inventoryPage.getAllProductNames();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  test('should sort products by price low to high @regression', async () => {
    await inventoryPage.sortBy(SORT_OPTIONS.LOHI);
    const prices = await inventoryPage.getAllProductPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('should sort products by price high to low @regression', async () => {
    await inventoryPage.sortBy(SORT_OPTIONS.HILO);
    const prices = await inventoryPage.getAllProductPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  // ── Cart Interactions ─────────────────────────────────────────────────────

  test('should add single product to cart and update badge @smoke', async () => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    const count = await inventoryPage.getCartCount();
    expect(count).toBe(1);
  });

  test('should add multiple products and show correct cart count @regression', async () => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.addProductToCart(PRODUCTS.BOLT_SHIRT);

    const count = await inventoryPage.getCartCount();
    expect(count).toBe(3);
  });

  test('should remove product from cart and update badge @regression', async () => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.removeProductFromCart(PRODUCTS.BACKPACK);

    const count = await inventoryPage.getCartCount();
    expect(count).toBe(1);
  });

  test('should hide cart badge when no items in cart @regression', async ({ page }) => {
    const badge = page.locator('.shopping_cart_badge');
    await expect(badge).not.toBeVisible();
  });

  // ── Product Detail ────────────────────────────────────────────────────────

  test('should navigate to product detail when name is clicked @regression', async ({ page }) => {
    await inventoryPage.openProductByName(PRODUCTS.BACKPACK);
    await expect(page).toHaveURL(/inventory-item/);
    await expect(page.locator('.inventory_details_name')).toHaveText(PRODUCTS.BACKPACK);
  });
});
