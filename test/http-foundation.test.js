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
