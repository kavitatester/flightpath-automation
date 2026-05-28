// tests/e2e/data-driven.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { InventoryPage } = require('../../pages/InventoryPage');
const { CartPage, CheckoutPage } = require('../../pages/CartCheckoutPage');
const { PASSWORD }     = require('../../fixtures/testData');

/**
 * Data-Driven Test Suite
 *
 * Demonstrates:
 *  - test.each() pattern with inline datasets
 *  - Dynamic test generation from JSON
 *  - Parameterised login tests
 *  - Parameterised checkout with multiple user profiles
 */

// ── Login Data Table ──────────────────────────────────────────────────────────

const loginTestCases = [
  {
    scenario:    'standard user can login',
    username:    'standard_user',
    password:    'secret_sauce',
    expectURL:   /inventory/,
    shouldFail:  false,
  },
  {
    scenario:    'locked user gets error',
    username:    'locked_out_user',
    password:    'secret_sauce',
    expectError: 'locked out',
    shouldFail:  true,
  },
  {
    scenario:    'wrong password shows error',
    username:    'standard_user',
    password:    'wrong_password',
    expectError: 'do not match',
    shouldFail:  true,
  },
  {
    scenario:    'empty username shows error',
    username:    '',
    password:    'secret_sauce',
    expectError: 'Username is required',
    shouldFail:  true,
  },
];

// ── Checkout User Profiles ────────────────────────────────────────────────────

const checkoutProfiles = [
  { name: 'Indian user',  firstName: 'Arjun',  lastName: 'Sharma',   zip: '560001' },
  { name: 'UK user',      firstName: 'Oliver', lastName: 'Thompson', zip: 'SW1A 1AA' },
  { name: 'US user',      firstName: 'Emily',  lastName: 'Carter',   zip: '10001' },
  { name: 'German user',  firstName: 'Hans',   lastName: 'Müller',   zip: '10115' },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Data-Driven — Login Scenarios', () => {

  for (const { scenario, username, password, expectURL, expectError, shouldFail } of loginTestCases) {
    test(`${scenario} @regression`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(username, password);

      if (shouldFail) {
        const error = await loginPage.getErrorMessage();
        expect(error.toLowerCase()).toContain(expectError.toLowerCase());
        await expect(page).toHaveURL('/');
      } else {
        await expect(page).toHaveURL(expectURL);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Data-Driven — Checkout with Multiple User Profiles', () => {

  test.use({ storageState: 'fixtures/.auth/user.json' });

  for (const profile of checkoutProfiles) {
    test(`checkout completes for ${profile.name} @regression`, async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      const cartPage      = new CartPage(page);
      const checkoutPage  = new CheckoutPage(page);

      await inventoryPage.goto();
      await inventoryPage.addFirstNProductsToCart(1);
      await inventoryPage.goToCart();
      await cartPage.checkout();

      await checkoutPage.fillShippingInfo(
        profile.firstName,
        profile.lastName,
        profile.zip
      );
      await checkoutPage.continue();

      await expect(page).toHaveURL(/checkout-step-two/);
      await checkoutPage.finish();
      await expect(page).toHaveURL(/checkout-complete/);

      const msg = await checkoutPage.getConfirmationMessage();
      expect(msg).toBe('Thank you for your order!');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Data-Driven — Product Sort Validation', () => {

  test.use({ storageState: 'fixtures/.auth/user.json' });

  const sortTests = [
    {
      label:     'A to Z',
      option:    'az',
      validator: (names) => {
        const sorted = [...names].sort((a, b) => a.localeCompare(b));
        expect(names).toEqual(sorted);
      },
    },
    {
      label:     'Z to A',
      option:    'za',
      validator: (names) => {
        const sorted = [...names].sort((a, b) => b.localeCompare(a));
        expect(names).toEqual(sorted);
      },
    },
    {
      label:     'Price Low to High',
      option:    'lohi',
      validator: (_, prices) => {
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
        }
      },
    },
    {
      label:     'Price High to Low',
      option:    'hilo',
      validator: (_, prices) => {
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
        }
      },
    },
  ];

  for (const { label, option, validator } of sortTests) {
    test(`sort by ${label} should order products correctly @regression`, async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.goto();
      await inventoryPage.sortBy(option);

      const names  = await inventoryPage.getAllProductNames();
      const prices = await inventoryPage.getAllProductPrices();
      validator(names, prices);
    });
  }
});
