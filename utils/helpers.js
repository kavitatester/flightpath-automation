// utils/helpers.js
/**
 * Shared utility functions used across the test suite.
 */

const { faker } = require('@faker-js/faker');

// ── Random Data Generators ────────────────────────────────────────────────────

/**
 * Generate a random user profile for checkout
 */
function generateUserProfile() {
  return {
    firstName:  faker.person.firstName(),
    lastName:   faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    email:      faker.internet.email(),
    phone:      faker.phone.number(),
  };
}

/**
 * Generate a random booking payload for API tests
 */
function generateBookingPayload(overrides = {}) {
  const checkin  = faker.date.future({ years: 0.5 });
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + faker.number.int({ min: 1, max: 14 }));

  return {
    firstname:    faker.person.firstName(),
    lastname:     faker.person.lastName(),
    totalprice:   faker.number.int({ min: 50, max: 2000 }),
    depositpaid:  faker.datatype.boolean(),
    bookingdates: {
      checkin:  formatDate(checkin),
      checkout: formatDate(checkout),
    },
    additionalneeds: faker.helpers.arrayElement([
      'Breakfast', 'Late checkout', 'Early check-in', 'Airport transfer', ''
    ]),
    ...overrides,
  };
}

// ── Date Utilities ────────────────────────────────────────────────────────────

/**
 * Format a Date object to YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Add N days to a date string (YYYY-MM-DD)
 */
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// ── Wait Utilities ────────────────────────────────────────────────────────────

/**
 * Retry an async function N times with delay
 */
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// ── Price Utilities ───────────────────────────────────────────────────────────

/**
 * Round to 2 decimal places (avoids floating point issues in price assertions)
 */
function roundPrice(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Parse price string like "$29.99" → 29.99
 */
function parsePrice(str) {
  return parseFloat(str.replace(/[^0-9.]/g, ''));
}

// ── String Utilities ──────────────────────────────────────────────────────────

/**
 * Check if an array is sorted alphabetically
 */
function isSortedAZ(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1].localeCompare(arr[i]) > 0) return false;
  }
  return true;
}

/**
 * Check if an array of numbers is sorted ascending
 */
function isSortedAscending(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

module.exports = {
  generateUserProfile,
  generateBookingPayload,
  formatDate,
  addDays,
  retry,
  roundPrice,
  parsePrice,
  isSortedAZ,
  isSortedAscending,
};
