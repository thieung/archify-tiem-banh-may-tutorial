export function createPaymentGateway({ eventLog } = {}) {
  return {
    charge({ orderId, amount, token }) {
      if (token === 'tok_success') {
        eventLog?.append('PAYMENT_CHARGED', { orderId, amount, outcome: 'SUCCESS' });
        return {
          ok: true,
          paymentId: `PAY-${orderId}`,
          amount,
        };
      }

      const error = token === 'tok_declined' ? 'CARD_DECLINED' : 'INVALID_PAYMENT_TOKEN';
      eventLog?.append('PAYMENT_CHARGED', { orderId, amount, outcome: 'FAILED', error });
      return {
        ok: false,
        error,
      };
    },
  };
}
