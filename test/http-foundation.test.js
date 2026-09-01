import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { startServer } from '../src/server.js';

let baseUrl;
let server;

beforeEach(async () => {
  server = await startServer({ port: 0 });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
}));

test('GET /api/health reports the running service', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { service: 'tiem-banh-may', status: 'ok' });
});

test('GET / serves the tutorial web shell', async () => {
  const response = await fetch(baseUrl);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Tiệm bánh Mây/);
  assert.match(response.headers.get('content-type'), /text\/html/);
});

test('unknown routes return a bounded JSON error', async () => {
  const response = await fetch(`${baseUrl}/not-real`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'NOT_FOUND' });
});

test('POST /api/orders/:id/pay exposes the deterministic payment boundary', async () => {
  const createdResponse = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lineItems: [{ itemId: 'tra-dao', quantity: 1 }] }),
  });
  const { order } = await createdResponse.json();
  const paymentResponse = await fetch(`${baseUrl}/api/orders/${order.id}/pay`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: 'tok_success' }),
  });
  const payload = await paymentResponse.json();

  assert.equal(paymentResponse.status, 200);
  assert.equal(payload.order.state, 'CONFIRMED');
});

test('kitchen ticks and completion expose the fulfillment lifecycle', async () => {
  const createdResponse = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lineItems: [{ itemId: 'banh-mi-may', quantity: 1 }] }),
  });
  const { order } = await createdResponse.json();
  await fetch(`${baseUrl}/api/orders/${order.id}/pay`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: 'tok_success' }),
  });

  for (const expectedState of ['IN_KITCHEN', 'READY']) {
    const tickResponse = await fetch(`${baseUrl}/api/kitchen/tick`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    });
    assert.equal((await tickResponse.json()).order.state, expectedState);
  }

  const completeResponse = await fetch(`${baseUrl}/api/orders/${order.id}/complete`, {
    method: 'POST',
  });
  assert.equal((await completeResponse.json()).order.state, 'COMPLETED');
});

test('GET /api/catalog exposes stock-backed bakery items', async () => {
  const response = await fetch(`${baseUrl}/api/catalog`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.items.length, 3);
  assert.equal(body.items[0].id, 'banh-mi-may');
});

test('POST /api/orders creates an awaiting-payment order and reserves stock', async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Linh',
      lineItems: [{ itemId: 'banh-mi-may', quantity: 2 }],
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.order.id, 'ORD-0001');
  assert.equal(body.order.state, 'AWAITING_PAYMENT');
  assert.equal(body.order.total, 64000);

  const lookup = await fetch(`${baseUrl}/api/orders/${body.order.id}`);
  assert.equal(lookup.status, 200);
  assert.equal((await lookup.json()).order.customerName, 'Linh');
});

test('POST /api/orders rejects sold-out requests before an order is created', async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      customerName: 'An',
      lineItems: [{ itemId: 'croissant-bo', quantity: 99 }],
    }),
  });
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { error: 'SOLD_OUT', itemId: 'croissant-bo' });
});
