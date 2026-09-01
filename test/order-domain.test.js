import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCatalogStore } from '../src/catalog.js';
import { createOrderStore } from '../src/orders.js';

test('catalog store returns copies that callers cannot mutate', () => {
  const catalogStore = createCatalogStore();
  const firstRead = catalogStore.list();
  firstRead[0].stock = 0;

  const secondRead = catalogStore.list();
  assert.equal(secondRead[0].stock, 12);
});

test('order store creates an awaiting-payment order from reserved catalog stock', () => {
  const catalogStore = createCatalogStore();
  const orderStore = createOrderStore({ catalogStore });
  const result = orderStore.create({
    customerName: 'Mai',
    lineItems: [{ itemId: 'tra-dao', quantity: 2 }],
  });

  assert.equal(result.ok, true);
  assert.equal(result.order.id, 'ORD-0001');
  assert.equal(result.order.state, 'AWAITING_PAYMENT');
  assert.equal(result.order.total, 56000);
  assert.equal(catalogStore.find('tra-dao').stock, 14);
});

test('order store rejects unknown and sold-out items with stable errors', () => {
  const catalogStore = createCatalogStore();
  const orderStore = createOrderStore({ catalogStore });

  assert.deepEqual(orderStore.create({
    lineItems: [{ itemId: 'missing', quantity: 1 }],
  }), { ok: false, statusCode: 400, error: 'UNKNOWN_ITEM' });

  assert.deepEqual(orderStore.create({
    lineItems: [{ itemId: 'croissant-bo', quantity: 99 }],
  }), { ok: false, statusCode: 409, error: 'SOLD_OUT', itemId: 'croissant-bo' });
});

test('order lookup returns null until an order is created', () => {
  const catalogStore = createCatalogStore();
  const orderStore = createOrderStore({ catalogStore });
  assert.equal(orderStore.get('ORD-9999'), null);
});
