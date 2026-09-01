import { writeFile } from 'node:fs/promises';
import { createCatalogStore } from '../src/catalog.js';
import { createEventLog } from '../src/events.js';
import { createKitchenWorker } from '../src/kitchen.js';
import { createOrderStore } from '../src/orders.js';
import { createPaymentGateway } from '../src/payment.js';

const eventLog = createEventLog();
const catalogStore = createCatalogStore();
const orderStore = createOrderStore({ catalogStore, eventLog });
const paymentGateway = createPaymentGateway({ eventLog });
const kitchenWorker = createKitchenWorker({ orderStore });

const created = orderStore.create({
  customerName: 'Mai',
  lineItems: [{ itemId: 'banh-mi-may', quantity: 1 }],
});
const charged = paymentGateway.charge({
  orderId: created.order.id,
  amount: created.order.total,
  token: 'tok_success',
});
orderStore.confirmPayment(created.order.id, { id: charged.paymentId, amount: charged.amount });
kitchenWorker.tick(created.order.id);
kitchenWorker.tick(created.order.id);
orderStore.complete(created.order.id);

const evidence = {
  scenario: 'happy-path-order',
  input: {
    customerName: 'Mai',
    itemId: 'banh-mi-may',
    quantity: 1,
    paymentTokenClass: 'success-fixture',
  },
  output: {
    order: orderStore.get(created.order.id),
    events: eventLog.list(),
  },
};

const output = `${JSON.stringify(evidence, null, 2)}\n`;
const outputFlagIndex = process.argv.indexOf('--output');
if (outputFlagIndex >= 0) {
  const outputPath = process.argv[outputFlagIndex + 1];
  if (!outputPath) throw new Error('--output requires a path');
  await writeFile(outputPath, output, 'utf8');
}
process.stdout.write(output);
