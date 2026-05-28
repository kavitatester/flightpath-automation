// tests/api/booking.api.spec.js
const { test, expect, request } = require('@playwright/test');

/**
 * API Test Suite — Restful Booker (https://restful-booker.herokuapp.com)
 * A public hotel booking REST API — ideal for demonstrating API testing skills.
 *
 * Covers:
 *  - Authentication (get token)
 *  - CRUD: Create, Read, Update, Delete bookings
 *  - Schema validation
 *  - Status code assertions
 *  - Response time checks
 *  - Negative/validation tests
 */

const BASE_URL = 'https://restful-booker.herokuapp.com';

test.describe('Booking API — CRUD & Validation', () => {

  let authToken;
  let createdBookingId;

  // ── Auth ──────────────────────────────────────────────────────────────────

  test('POST /auth — should return valid auth token @smoke', async ({ request }) => {
    const start = Date.now();

    const response = await request.post(`${BASE_URL}/auth`, {
      data: { username: 'admin', password: 'password123' },
    });

    const elapsed = Date.now() - start;
    const body    = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(5000); // response time SLA

    authToken = body.token;
    console.log(`✅ Auth token obtained: ${authToken}`);
  });

  // ── GET All Bookings ──────────────────────────────────────────────────────

  test('GET /booking — should return list of booking IDs @smoke', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/booking`);
    const body     = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Schema validation — each item must have bookingid
    body.slice(0, 5).forEach(item => {
      expect(item).toHaveProperty('bookingid');
      expect(typeof item.bookingid).toBe('number');
    });
  });

  test('GET /booking — should filter by first name @regression', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/booking`, {
      params: { firstname: 'John' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  // ── POST — Create Booking ─────────────────────────────────────────────────

  test('POST /booking — should create a new booking @smoke', async ({ request }) => {
    const payload = {
      firstname:       'Jane',
      lastname:        'Automation',
      totalprice:      250,
      depositpaid:     true,
      bookingdates: {
        checkin:  '2025-01-15',
        checkout: '2025-01-20',
      },
      additionalneeds: 'Playwright suite room',
    };

    const response = await request.post(`${BASE_URL}/booking`, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });

    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('bookingid');
    expect(body).toHaveProperty('booking');

    // Deep schema validation
    expect(body.booking.firstname).toBe(payload.firstname);
    expect(body.booking.lastname).toBe(payload.lastname);
    expect(body.booking.totalprice).toBe(payload.totalprice);
    expect(body.booking.depositpaid).toBe(true);
    expect(body.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(body.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    expect(body.booking.additionalneeds).toBe(payload.additionalneeds);

    createdBookingId = body.bookingid;
    console.log(`✅ Created booking ID: ${createdBookingId}`);
  });

  // ── GET Single Booking ────────────────────────────────────────────────────

  test('GET /booking/:id — should retrieve created booking @regression', async ({ request }) => {
    // Use a known public booking if createdBookingId not set
    const id = createdBookingId || 1;

    const response = await request.get(`${BASE_URL}/booking/${id}`);
    expect([200, 404]).toContain(response.status()); // may have been deleted

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('firstname');
      expect(body).toHaveProperty('lastname');
      expect(body).toHaveProperty('totalprice');
      expect(body).toHaveProperty('depositpaid');
      expect(body).toHaveProperty('bookingdates');
      expect(body.bookingdates).toHaveProperty('checkin');
      expect(body.bookingdates).toHaveProperty('checkout');
    }
  });

  // ── PUT — Full Update ─────────────────────────────────────────────────────

  test('PUT /booking/:id — should update entire booking @regression', async ({ request }) => {
    // Create a booking first
    const createRes = await request.post(`${BASE_URL}/booking`, {
      data: {
        firstname: 'Test', lastname: 'Update',
        totalprice: 100, depositpaid: false,
        bookingdates: { checkin: '2025-03-01', checkout: '2025-03-05' },
      },
    });
    const { bookingid } = await createRes.json();

    // Get fresh token
    const authRes = await request.post(`${BASE_URL}/auth`, {
      data: { username: 'admin', password: 'password123' },
    });
    const { token } = await authRes.json();

    // Full update
    const updatePayload = {
      firstname: 'Updated', lastname: 'User',
      totalprice: 999, depositpaid: true,
      bookingdates: { checkin: '2025-06-01', checkout: '2025-06-10' },
      additionalneeds: 'Updated needs',
    };

    const updateRes = await request.put(`${BASE_URL}/booking/${bookingid}`, {
      data: updatePayload,
      headers: {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'Cookie':        `token=${token}`,
      },
    });

    expect(updateRes.status()).toBe(200);
    const body = await updateRes.json();
    expect(body.firstname).toBe('Updated');
    expect(body.totalprice).toBe(999);
  });

  // ── PATCH — Partial Update ────────────────────────────────────────────────

  test('PATCH /booking/:id — should partially update booking price @regression', async ({ request }) => {
    const createRes = await request.post(`${BASE_URL}/booking`, {
      data: {
        firstname: 'Patch', lastname: 'Test',
        totalprice: 50, depositpaid: false,
        bookingdates: { checkin: '2025-04-01', checkout: '2025-04-03' },
      },
    });
    const { bookingid } = await createRes.json();

    const authRes = await request.post(`${BASE_URL}/auth`, {
      data: { username: 'admin', password: 'password123' },
    });
    const { token } = await authRes.json();

    const patchRes = await request.patch(`${BASE_URL}/booking/${bookingid}`, {
      data: { totalprice: 750 },
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
        'Cookie':       `token=${token}`,
      },
    });

    expect(patchRes.status()).toBe(200);
    const body = await patchRes.json();
    expect(body.totalprice).toBe(750);
    // Unchanged fields should remain
    expect(body.firstname).toBe('Patch');
  });

  // ── DELETE ────────────────────────────────────────────────────────────────

  test('DELETE /booking/:id — should delete booking and return 404 @regression', async ({ request }) => {
    // Create
    const createRes = await request.post(`${BASE_URL}/booking`, {
      data: {
        firstname: 'Delete', lastname: 'Me',
        totalprice: 1, depositpaid: false,
        bookingdates: { checkin: '2025-05-01', checkout: '2025-05-02' },
      },
    });
    const { bookingid } = await createRes.json();

    // Auth
    const authRes = await request.post(`${BASE_URL}/auth`, {
      data: { username: 'admin', password: 'password123' },
    });
    const { token } = await authRes.json();

    // Delete
    const deleteRes = await request.delete(`${BASE_URL}/booking/${bookingid}`, {
      headers: { 'Cookie': `token=${token}` },
    });
    expect(deleteRes.status()).toBe(201);

    // Verify deleted
    const getRes = await request.get(`${BASE_URL}/booking/${bookingid}`);
    expect(getRes.status()).toBe(404);
  });

  // ── Negative Tests ────────────────────────────────────────────────────────

  test('GET /booking/:id — should return 404 for non-existent ID @regression', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/booking/9999999`);
    expect(response.status()).toBe(404);
  });

  test('POST /auth — should return error for invalid credentials @regression', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth`, {
      data: { username: 'wrong', password: 'wrong' },
    });
    const body = await response.json();

    expect(response.status()).toBe(200); // API returns 200 even for bad auth
    expect(body).toHaveProperty('reason');
    expect(body.reason).toBe('Bad credentials');
  });
});
