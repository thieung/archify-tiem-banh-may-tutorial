import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker, { createWorkerHandler } from '../src/worker.js';

function request(path, options) {
  return new Request(`https://demo.slopengineer.dev${path}`, options);
}

test('Cloudflare worker health endpoint identifies its runtime', async () => {
  const response = await createWorkerHandler()(request('/api/health'));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    service: 'tiem-banh-may',
    status: 'ok',
    runtime: 'cloudflare-worker',
  });
});

test('Cloudflare worker completes the deterministic order journey', async () => {
  const fetch = createWorkerHandler();
  const headers = { 'content-type': 'application/json' };
  const createdResponse = await fetch(request('/api/orders', {
    method: 'POST', headers, body: JSON.stringify({
      customerName: 'Mai',
      lineItems: [{ itemId: 'banh-mi-may', quantity: 1 }],
    }),
  }));
  const created = await createdResponse.json();
  assert.equal(createdResponse.status, 201);
  assert.equal(created.order.state, 'AWAITING_PAYMENT');

  const paidResponse = await fetch(request(`/api/orders/${created.order.id}/pay`, {
    method: 'POST', headers, body: JSON.stringify({ token: 'tok_success' }),
  }));
  const paid = await paidResponse.json();
  assert.equal(paid.order.state, 'CONFIRMED');

  for (const expectedState of ['IN_KITCHEN', 'READY']) {
    const tickResponse = await fetch(request('/api/kitchen/tick', {
      method: 'POST', headers, body: JSON.stringify({ orderId: created.order.id }),
    }));
    assert.equal((await tickResponse.json()).order.state, expectedState);
  }

  const completedResponse = await fetch(request(`/api/orders/${created.order.id}/complete`, {
    method: 'POST',
  }));
  assert.equal((await completedResponse.json()).order.state, 'COMPLETED');
});

test('Cloudflare worker keeps invalid JSON and unknown routes bounded', async () => {
  const fetch = createWorkerHandler();
  const invalid = await fetch(request('/api/orders', { method: 'POST', body: '{' }));
  const missing = await fetch(request('/api/not-real'));

  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), { error: 'INVALID_JSON' });
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'NOT_FOUND' });
});

test('Cloudflare entrypoint creates and reuses a bounded session cookie', async () => {
  const names = [];
  const env = {
    BAKERY_SESSION: {
      getByName(name) {
        names.push(name);
        return { fetch: async () => Response.json({ ok: true }) };
      },
    },
  };

  const first = await worker.fetch(request('/api/health'), env);
  const cookie = first.headers.get('set-cookie');
  assert.match(cookie, /^bakery_session=[^;]+; Path=\/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax$/);

  const second = await worker.fetch(request('/api/health', {
    headers: { cookie: cookie.split(';')[0] },
  }), env);
  assert.equal(second.headers.has('set-cookie'), false);
  assert.equal(names.length, 2);
  assert.equal(names[0], names[1]);
});

test('Cloudflare entrypoint replaces an untrusted session identifier', async () => {
  let routedName;
  const response = await worker.fetch(request('/api/health', {
    headers: { cookie: 'bakery_session=../../not-a-session' },
  }), {
    BAKERY_SESSION: {
      getByName(name) {
        routedName = name;
        return { fetch: async () => Response.json({ ok: true }) };
      },
    },
  });

  assert.match(routedName, /^[0-9a-f-]{36}$/);
  assert.notEqual(routedName, '../../not-a-session');
  assert.match(response.headers.get('set-cookie'), /^bakery_session=/);
});
