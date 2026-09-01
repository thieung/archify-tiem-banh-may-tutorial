import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker, { createWorkerHandler } from '../src/worker.js';

const DEMO_BASE_PATH = '/s/9eb05eebff7f';

function request(path, options) {
  return new Request(`https://demo.slopengineer.dev${path}`, options);
}

function sessionEnv({ routedPaths = [], assetPaths = [] } = {}) {
  return {
    ASSETS: {
      fetch(assetRequest) {
        assetPaths.push(new URL(assetRequest.url).pathname);
        return Response.json({ asset: true });
      },
    },
    BAKERY_SESSION: {
      getByName() {
        return {
          fetch: async (sessionRequest) => {
            routedPaths.push(new URL(sessionRequest.url).pathname);
            return Response.json({ ok: true });
          },
        };
      },
    },
  };
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
    ASSETS: { fetch: async () => Response.json({ asset: true }) },
    BAKERY_SESSION: {
      getByName(name) {
        names.push(name);
        return { fetch: async () => Response.json({ ok: true }) };
      },
    },
  };

  const first = await worker.fetch(request(`${DEMO_BASE_PATH}/api/health`), env);
  const cookie = first.headers.get('set-cookie');
  assert.match(cookie, new RegExp(`^bakery_session=[^;]+; Path=${DEMO_BASE_PATH}; Max-Age=3600; HttpOnly; Secure; SameSite=Lax$`));

  const second = await worker.fetch(request(`${DEMO_BASE_PATH}/api/health`, {
    headers: { cookie: cookie.split(';')[0] },
  }), env);
  assert.equal(second.headers.has('set-cookie'), false);
  assert.equal(names.length, 2);
  assert.equal(names[0], names[1]);
});

test('Cloudflare entrypoint replaces an untrusted session identifier', async () => {
  let routedName;
  const response = await worker.fetch(request(`${DEMO_BASE_PATH}/api/health`, {
    headers: { cookie: 'bakery_session=../../not-a-session' },
  }), {
    ASSETS: { fetch: async () => Response.json({ asset: true }) },
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

test('Cloudflare entrypoint redirects the domain root to the stable demo slug', async () => {
  const response = await worker.fetch(request('/'), sessionEnv());
  const headResponse = await worker.fetch(request('/', { method: 'HEAD' }), sessionEnv());

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), `https://demo.slopengineer.dev${DEMO_BASE_PATH}/`);
  assert.equal(headResponse.status, 302);
  assert.equal(headResponse.headers.get('location'), `https://demo.slopengineer.dev${DEMO_BASE_PATH}/`);
});

test('Cloudflare entrypoint strips the demo slug before routing API and asset requests', async () => {
  const routedPaths = [];
  const assetPaths = [];
  const env = sessionEnv({ routedPaths, assetPaths });

  await worker.fetch(request(`${DEMO_BASE_PATH}/api/health`), env);
  await worker.fetch(request(`${DEMO_BASE_PATH}/`), env);
  await worker.fetch(request(`${DEMO_BASE_PATH}/app.js`), env);

  assert.deepEqual(routedPaths, ['/api/health']);
  assert.deepEqual(assetPaths, ['/', '/app.js']);
});

test('Cloudflare entrypoint does not expose the app API outside its slug', async () => {
  const response = await worker.fetch(request('/api/health'), sessionEnv());

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'NOT_FOUND' });
});
