export function createPaymentGateway() {
  return {
    charge({ orderId, amount, token }) {
      if (token === 'tok_success') {
        return {
          ok: true,
          paymentId: `PAY-${orderId}`,
          amount,
        };
      }

      return {
        ok: false,
        error: token === 'tok_declined' ? 'CARD_DECLINED' : 'INVALID_PAYMENT_TOKEN',
      };
    },
  };
}
