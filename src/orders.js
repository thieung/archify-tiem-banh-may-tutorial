export const orderStates = {
  awaitingPayment: 'AWAITING_PAYMENT',
  confirmed: 'CONFIRMED',
  inKitchen: 'IN_KITCHEN',
  ready: 'READY',
  completed: 'COMPLETED',
  paymentFailed: 'PAYMENT_FAILED',
  rejected: 'REJECTED',
};

export function createOrderStore({ catalogStore, eventLog, idPrefix = 'ORD' }) {
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

  function copyOrder(order) {
    return order ? {
      ...order,
      lineItems: order.lineItems.map((item) => ({ ...item })),
      history: order.history.map((entry) => ({ ...entry })),
    } : null;
  }

  function transition(orderId, { from, to, note, details = {} }) {
    const order = orders.get(orderId);
    if (!order) {
      return { ok: false, statusCode: 404, error: 'ORDER_NOT_FOUND' };
    }
    if (order.state !== from) {
      return { ok: false, statusCode: 409, error: 'INVALID_ORDER_STATE', state: order.state };
    }

    order.state = to;
    Object.assign(order, details);
    order.history.push({ state: to, note });
    eventLog?.append('ORDER_STATE_CHANGED', { orderId, from, to });
    return { ok: true, order: copyOrder(order) };
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
      eventLog?.append('ORDER_CREATED', {
        orderId: order.id,
        itemIds: order.lineItems.map((item) => item.itemId),
        total: order.total,
      });
      return { ok: true, order: copyOrder(order) };
    },

    get(orderId) {
      return copyOrder(orders.get(orderId));
    },

    confirmPayment(orderId, payment) {
      return transition(orderId, {
        from: orderStates.awaitingPayment,
        to: orderStates.confirmed,
        note: 'Thanh toán thành công, đơn đã vào hàng chờ làm bánh.',
        details: { payment },
      });
    },

    failPayment(orderId, error) {
      return transition(orderId, {
        from: orderStates.awaitingPayment,
        to: orderStates.paymentFailed,
        note: `Thanh toán thất bại: ${error}.`,
        details: { paymentError: error },
      });
    },

    startKitchen(orderId) {
      return transition(orderId, {
        from: orderStates.confirmed,
        to: orderStates.inKitchen,
        note: 'Bếp đã nhận đơn và bắt đầu chuẩn bị.',
      });
    },

    markReady(orderId) {
      return transition(orderId, {
        from: orderStates.inKitchen,
        to: orderStates.ready,
        note: 'Đơn đã sẵn sàng để khách nhận.',
      });
    },

    complete(orderId) {
      return transition(orderId, {
        from: orderStates.ready,
        to: orderStates.completed,
        note: 'Khách đã nhận đủ món.',
      });
    },
  };
}
