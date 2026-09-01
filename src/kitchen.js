import { orderStates } from './orders.js';

export function createKitchenWorker({ orderStore }) {
  return {
    tick(orderId) {
      const order = orderStore.get(orderId);
      if (!order) {
        return { ok: false, statusCode: 404, error: 'ORDER_NOT_FOUND' };
      }
      if (order.state === orderStates.confirmed) {
        return orderStore.startKitchen(orderId);
      }
      if (order.state === orderStates.inKitchen) {
        return orderStore.markReady(orderId);
      }
      return {
        ok: false,
        statusCode: 409,
        error: 'NOTHING_TO_PROCESS',
        state: order.state,
      };
    },
  };
}
