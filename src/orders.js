export const orderStates = {
  awaitingPayment: 'AWAITING_PAYMENT',
  confirmed: 'CONFIRMED',
  inKitchen: 'IN_KITCHEN',
  ready: 'READY',
  completed: 'COMPLETED',
  paymentFailed: 'PAYMENT_FAILED',
  rejected: 'REJECTED',
};

export function createOrderStore({ catalogStore, idPrefix = 'ORD' }) {
  const orders = new Map();
  let nextOrderNumber = 1;

  function normalizeLineItems(rawLineItems) {
    if (!Array.isArray(rawLineItems) || rawLineItems.length === 0) {
      return { ok: false, reason: 'EMPTY_ORDER' };
    }

    const lineItems = [];
    for (const rawLineItem of rawLineItems) {
      const itemId = String(rawLineItem?.itemId ?? '');
      const quantity = Number(rawLineItem?.quantity ?? 0);
      if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
        return { ok: false, reason: 'INVALID_LINE_ITEM' };
      }
      const catalogItem = catalogStore.find(itemId);
      if (!catalogItem) {
        return { ok: false, reason: 'UNKNOWN_ITEM', itemId };
      }
      lineItems.push({
        itemId,
        name: catalogItem.name,
        quantity,
        unitPrice: catalogItem.price,
      });
    }

    return { ok: true, lineItems };
  }

  function totalFor(lineItems) {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  return {
    create({ customerName, lineItems: rawLineItems }) {
      const normalized = normalizeLineItems(rawLineItems);
      if (!normalized.ok) {
        return { ok: false, statusCode: 400, error: normalized.reason };
      }

      const reserved = catalogStore.reserve(normalized.lineItems);
      if (!reserved.ok) {
        return { ok: false, statusCode: 409, error: reserved.reason, itemId: reserved.itemId };
      }

      const order = {
        id: `${idPrefix}-${String(nextOrderNumber).padStart(4, '0')}`,
        customerName: String(customerName ?? 'Khách lẻ').trim() || 'Khách lẻ',
        lineItems: normalized.lineItems,
        total: totalFor(normalized.lineItems),
        state: orderStates.awaitingPayment,
        history: [
          {
            state: orderStates.awaitingPayment,
            note: 'Đã giữ hàng trong catalog, chờ thanh toán.',
          },
        ],
      };
      nextOrderNumber += 1;
      orders.set(order.id, order);
      return { ok: true, order: { ...order, lineItems: [...order.lineItems], history: [...order.history] } };
    },

    get(orderId) {
      const order = orders.get(orderId);
      return order ? { ...order, lineItems: [...order.lineItems], history: [...order.history] } : null;
    },
  };
}
