// fixtures/testData.js
/**
 * Centralised test data — all credentials, users, and constants in one place.
 * In real projects this would be loaded from env vars / secrets manager.
 */

// ── Credentials (SauceDemo public test site) ──────────────────────────────────
const STANDARD_USER   = 'standard_user';
const LOCKED_USER     = 'locked_out_user';
const PROBLEM_USER    = 'problem_user';
const PERF_GLITCH_USER = 'performance_glitch_user';
const ERROR_USER      = 'error_user';
const VISUAL_USER     = 'visual_user';
const PASSWORD        = 'secret_sauce';

// ── Products ───────────────────────────────────────────────────────────────────
const PRODUCTS = {
  BACKPACK:   'Sauce Labs Backpack',
  BIKE_LIGHT: 'Sauce Labs Bike Light',
  BOLT_SHIRT: 'Sauce Labs Bolt T-Shirt',
  FLEECE:     'Sauce Labs Fleece Jacket',
  ONESIE:     'Sauce Labs Onesie',
  RED_SHIRT:  'Test.allTheThings() T-Shirt (Red)',
};

// ── Shipping Info ──────────────────────────────────────────────────────────────
const VALID_SHIPPING = {
  firstName:  'Jane',
  lastName:   'Automation',
  postalCode: '560001',
};

const INVALID_SHIPPING = {
  missingFirst:  { firstName: '',     lastName: 'Doe', postalCode: '12345' },
  missingLast:   { firstName: 'John', lastName: '',    postalCode: '12345' },
  missingZip:    { firstName: 'John', lastName: 'Doe', postalCode: ''      },
};

// ── Sort Options ───────────────────────────────────────────────────────────────
const SORT_OPTIONS = {
  AZ:   'az',
  ZA:   'za',
  LOHI: 'lohi',
  HILO: 'hilo',
};

// ── Error Messages ─────────────────────────────────────────────────────────────
const ERRORS = {
  LOCKED:         'Epic sadface: Sorry, this user has been locked out.',
  MISSING_USER:   'Epic sadface: Username is required',
  MISSING_PASS:   'Epic sadface: Password is required',
  WRONG_CREDS:    'Epic sadface: Username and password do not match any user in this service',
  CHECKOUT_FIRST: 'Error: First Name is required',
  CHECKOUT_LAST:  'Error: Last Name is required',
  CHECKOUT_ZIP:   'Error: Postal Code is required',
};

module.exports = {
  STANDARD_USER, LOCKED_USER, PROBLEM_USER, PERF_GLITCH_USER,
  ERROR_USER, VISUAL_USER, PASSWORD,
  PRODUCTS, VALID_SHIPPING, INVALID_SHIPPING,
  SORT_OPTIONS, ERRORS,
};
