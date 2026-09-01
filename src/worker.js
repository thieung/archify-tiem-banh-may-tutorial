import { createCatalogStore } from './catalog.js';
import { createOrderStore } from './orders.js';
import { createPaymentGateway } from './payment.js';
import { createKitchenWorker } from './kitchen.js';
import { createEventLog } from './events.js';

function json(payload, status = 200) {
  return Response.json(payload, { status });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function createWorkerHandler({
  eventLog = createEventLog(),
  catalogStore = createCatalogStore(),
  orderStore = createOrderStore({ catalogStore, eventLog }),
  paymentGateway = createPaymentGateway({ eventLog }),
  kitchenWorker = createKitchenWorker({ orderStore }),
} = {}) {
  return async function handleRequest(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ service: 'tiem-banh-may', status: 'ok', runtime: 'cloudflare-worker' });
    }

    if (request.method === 'GET' && url.pathname === '/api/catalog') {
      return json({ items: catalogStore.list() });
    }

    if (request.method === 'GET' && url.pathname === '/api/events') {
      return json({ events: eventLog.list() });
    }

    if (request.method === 'POST' && url.pathname === '/api/orders') {
      const body = await readJson(request);
      if (!body) return json({ error: 'INVALID_JSON' }, 400);
      const created = orderStore.create(body);
      if (!created.ok) {
        return json({ error: created.error, itemId: created.itemId }, created.statusCode);
      }
      return json({ order: created.order }, 201);
    }

    const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (request.method === 'GET' && orderMatch) {
      const order = orderStore.get(orderMatch[1]);
      return order ? json({ order }) : json({ error: 'ORDER_NOT_FOUND' }, 404);
    }

    const paymentMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/pay$/);
    if (request.method === 'POST' && paymentMatch) {
      const order = orderStore.get(paymentMatch[1]);
      if (!order) return json({ error: 'ORDER_NOT_FOUND' }, 404);
      if (order.state !== 'AWAITING_PAYMENT') {
        return json({ error: 'INVALID_ORDER_STATE', state: order.state }, 409);
      }

      const body = await readJson(request);
      if (!body) return json({ error: 'INVALID_JSON' }, 400);
      const charged = paymentGateway.charge({ orderId: order.id, amount: order.total, token: body.token });
      const result = charged.ok
        ? orderStore.confirmPayment(order.id, { id: charged.paymentId, amount: charged.amount })
        : orderStore.failPayment(order.id, charged.error);

      return json({
        order: result.order,
        ...(charged.ok ? {} : { error: charged.error }),
      }, charged.ok ? 200 : 402);
    }

    if (request.method === 'POST' && url.pathname === '/api/kitchen/tick') {
      const body = await readJson(request);
      if (!body) return json({ error: 'INVALID_JSON' }, 400);
      const result = kitchenWorker.tick(String(body.orderId ?? ''));
      return result.ok
        ? json({ order: result.order })
        : json({ error: result.error, state: result.state }, result.statusCode);
    }

    const completeMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/complete$/);
    if (request.method === 'POST' && completeMatch) {
      const result = orderStore.complete(completeMatch[1]);
      return result.ok
        ? json({ order: result.order })
        : json({ error: result.error, state: result.state }, result.statusCode);
    }

    return json({ error: 'NOT_FOUND' }, 404);
  };
}

export class BakerySession {
  constructor() {
    this.handler = createWorkerHandler();
  }

  fetch(request) {
    return this.handler(request);
  }
}

function readSessionId(request) {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)bakery_session=([^;]+)/);
  const value = match?.[1] ?? '';
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

export default {
  async fetch(request, env) {
    const existingSessionId = readSessionId(request);
    const sessionId = existingSessionId ?? crypto.randomUUID();
    const response = await env.BAKERY_SESSION.getByName(sessionId).fetch(request);
    if (existingSessionId) return response;

    const withSession = new Response(response.body, response);
    withSession.headers.append(
      'set-cookie',
      `bakery_session=${sessionId}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`,
    );
    return withSession;
  },
};
