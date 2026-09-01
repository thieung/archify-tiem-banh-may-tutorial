import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { startServer } from '../src/server.js';

let baseUrl;
let server;

before(async () => {
  server = await startServer({ port: 0 });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve, reject) => {
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
