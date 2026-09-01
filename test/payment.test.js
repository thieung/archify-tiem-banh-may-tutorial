import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCatalogStore } from '../src/catalog.js';
import { createOrderStore } from '../src/orders.js';
import { createPaymentGateway } from '../src/payment.js';

function createAwaitingPaymentOrder() {
  const orderStore = createOrderStore({ catalogStore: createCatalogStore() });
  const created = orderStore.create({
    customerName: 'Mai',
    lineItems: [{ itemId: 'banh-mi-may', quantity: 1 }],
  });
  return { orderStore, order: created.order };
}

test('successful deterministic payment confirms an awaiting order', () => {
  const gateway = createPaymentGateway();
  const { orderStore, order } = createAwaitingPaymentOrder();
  const charged = gateway.charge({ orderId: order.id, amount: order.total, token: 'tok_success' });
  const result = orderStore.confirmPayment(order.id, {
    id: charged.paymentId,
    amount: charged.amount,
  });

  assert.equal(charged.ok, true);
  assert.equal(result.order.state, 'CONFIRMED');
  assert.deepEqual(result.order.payment, { id: 'PAY-ORD-0001', amount: 32000 });
});

test('declined payment moves the order to a terminal failure state', () => {
  const gateway = createPaymentGateway();
  const { orderStore, order } = createAwaitingPaymentOrder();
  const charged = gateway.charge({ orderId: order.id, amount: order.total, token: 'tok_declined' });
  const result = orderStore.failPayment(order.id, charged.error);

  assert.deepEqual(charged, { ok: false, error: 'CARD_DECLINED' });
  assert.equal(result.order.state, 'PAYMENT_FAILED');
});

test('an order cannot be paid twice', () => {
  const { orderStore, order } = createAwaitingPaymentOrder();
  orderStore.confirmPayment(order.id, { id: 'PAY-1', amount: order.total });

  assert.deepEqual(orderStore.confirmPayment(order.id, { id: 'PAY-2', amount: order.total }), {
    ok: false,
    statusCode: 409,
    error: 'INVALID_ORDER_STATE',
    state: 'CONFIRMED',
  });
});
