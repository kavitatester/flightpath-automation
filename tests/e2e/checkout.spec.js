// tests/e2e/checkout.spec.js
const { test, expect } = require('@playwright/test');
const { InventoryPage }             = require('../../pages/InventoryPage');
const { CartPage, CheckoutPage }    = require('../../pages/CartCheckoutPage');
const { PRODUCTS, VALID_SHIPPING, INVALID_SHIPPING, ERRORS } = require('../../fixtures/testData');

/**
 * Checkout Test Suite
 * Tags: @smoke @regression
 *
 * Covers:
 *  - Full happy path: add → cart → checkout → confirm
 *  - Cart: remove item, continue shopping
 *  - Checkout Step 1 validation (missing fields)
 *  - Price calculation accuracy
 *  - Order confirmation screen
 */
test.describe('Checkout — End-to-End Purchase Flow', () => {

  test.use({ storageState: 'fixtures/.auth/user.json' });

  let inventoryPage, cartPage, checkoutPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    cartPage      = new CartPage(page);
    checkoutPage  = new CheckoutPage(page);
    await inventoryPage.goto();
  });

  // ── Full Happy Path ───────────────────────────────────────────────────────

  test('should complete full purchase flow successfully @smoke', async ({ page }) => {
    // 1. Add items
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);

    // 2. Go to cart
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/cart/);
    expect(await cartPage.getCartItemCount()).toBe(2);

    // 3. Proceed to checkout
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);

    // 4. Fill shipping info
    const { firstName, lastName, postalCode } = VALID_SHIPPING;
    await checkoutPage.fillShippingInfo(firstName, lastName, postalCode);
    await checkoutPage.continue();
    await expect(page).toHaveURL(/checkout-step-two/);

    // 5. Verify summary items
    expect(await checkoutPage.summaryItems.count()).toBe(2);

    // 6. Verify total = subtotal + tax
    const subtotal = await checkoutPage.getSubtotal();
    const tax      = await checkoutPage.getTax();
    const total    = await checkoutPage.getTotal();
    expect(total).toBeCloseTo(subtotal + tax, 2);

    // 7. Finish order
    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete/);

    const confirmation = await checkoutPage.getConfirmationMessage();
    expect(confirmation).toBe('Thank you for your order!');
  });

  // ── Cart Management ───────────────────────────────────────────────────────

  test('should remove item from cart and update count @regression', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT);
    await inventoryPage.goToCart();

    await cartPage.removeItem(PRODUCTS.BACKPACK);
    expect(await cartPage.getCartItemCount()).toBe(1);

    const names = await cartPage.getItemNames();
    expect(names).not.toContain(PRODUCTS.BACKPACK);
  });

  test('should navigate back to inventory from cart @regression', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.continueShopping();
    await expect(page).toHaveURL(/inventory/);
  });

  // ── Checkout Validation ───────────────────────────────────────────────────

  test('should show error when first name is missing @regression', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.checkout();

    const { lastName, postalCode } = INVALID_SHIPPING.missingFirst;
    await checkoutPage.fillShippingInfo('', lastName, postalCode);
    await checkoutPage.continue();

    const error = await checkoutPage.getErrorMessage();
    expect(error).toBe(ERRORS.CHECKOUT_FIRST);
  });

  test('should show error when last name is missing @regression', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.fillShippingInfo('John', '', '12345');
    await checkoutPage.continue();

    const error = await checkoutPage.getErrorMessage();
    expect(error).toBe(ERRORS.CHECKOUT_LAST);
  });

  test('should show error when postal code is missing @regression', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.fillShippingInfo('John', 'Doe', '');
    await checkoutPage.continue();

    const error = await checkoutPage.getErrorMessage();
    expect(error).toBe(ERRORS.CHECKOUT_ZIP);
  });

  test('should cancel checkout and return to inventory @regression', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK);
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.cancel();
    await expect(page).toHaveURL(/cart/);
  });

  // ── Price Accuracy ────────────────────────────────────────────────────────

  test('should show correct prices in cart matching inventory prices @regression', async ({ page }) => {
    const prices = await inventoryPage.getAllProductPrices();
    const firstName = prices[0]; // cheapest item price

    await inventoryPage.addFirstNProductsToCart(1);
    await inventoryPage.goToCart();

    const cartPrices = await cartPage.getItemPrices();
    expect(cartPrices[0]).toBe(prices[0]);
  });
});
