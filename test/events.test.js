import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCatalogStore } from '../src/catalog.js';
import { createEventLog } from '../src/events.js';
import { createOrderStore } from '../src/orders.js';
import { createPaymentGateway } from '../src/payment.js';

test('event log records deterministic order and payment facts without the payment token', () => {
  const eventLog = createEventLog();
  const orderStore = createOrderStore({ catalogStore: createCatalogStore(), eventLog });
  const paymentGateway = createPaymentGateway({ eventLog });
  const created = orderStore.create({ lineItems: [{ itemId: 'tra-dao', quantity: 1 }] });
  paymentGateway.charge({ orderId: created.order.id, amount: created.order.total, token: 'tok_success' });

  assert.deepEqual(eventLog.list().map((event) => event.type), ['ORDER_CREATED', 'PAYMENT_CHARGED']);
  assert.doesNotMatch(JSON.stringify(eventLog.list()), /tok_success/);
});

test('event log returns copies that callers cannot mutate', () => {
  const eventLog = createEventLog();
  eventLog.append('EXAMPLE', { value: 1 });
  const first = eventLog.list();
  first[0].data.value = 99;
  assert.equal(eventLog.list()[0].data.value, 1);
});
