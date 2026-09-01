import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCatalogStore } from '../src/catalog.js';
import { createKitchenWorker } from '../src/kitchen.js';
import { createOrderStore } from '../src/orders.js';

function confirmedOrderFixture() {
  const orderStore = createOrderStore({ catalogStore: createCatalogStore() });
  const created = orderStore.create({
    lineItems: [{ itemId: 'croissant-bo', quantity: 1 }],
  });
  const confirmed = orderStore.confirmPayment(created.order.id, {
    id: 'PAY-TEST',
    amount: created.order.total,
  });
  return { orderStore, order: confirmed.order };
}

test('two explicit kitchen ticks move a confirmed order to ready', () => {
  const { orderStore, order } = confirmedOrderFixture();
  const worker = createKitchenWorker({ orderStore });

  const started = worker.tick(order.id);
  const ready = worker.tick(order.id);

  assert.equal(started.order.state, 'IN_KITCHEN');
  assert.equal(ready.order.state, 'READY');
  assert.deepEqual(ready.order.history.map((entry) => entry.state), [
    'AWAITING_PAYMENT',
    'CONFIRMED',
    'IN_KITCHEN',
    'READY',
  ]);
});

test('ready order completes only after explicit customer handoff', () => {
  const { orderStore, order } = confirmedOrderFixture();
  const worker = createKitchenWorker({ orderStore });
  worker.tick(order.id);
  worker.tick(order.id);

  const completed = orderStore.complete(order.id);
  assert.equal(completed.order.state, 'COMPLETED');
});

test('kitchen refuses awaiting-payment and completed orders', () => {
  const orderStore = createOrderStore({ catalogStore: createCatalogStore() });
  const created = orderStore.create({ lineItems: [{ itemId: 'tra-dao', quantity: 1 }] });
  const worker = createKitchenWorker({ orderStore });

  assert.deepEqual(worker.tick(created.order.id), {
    ok: false,
    statusCode: 409,
    error: 'NOTHING_TO_PROCESS',
    state: 'AWAITING_PAYMENT',
  });
});
