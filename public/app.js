const elements = {
  catalog: document.querySelector('#catalog'), complete: document.querySelector('#complete-order'),
  empty: document.querySelector('#order-empty'), form: document.querySelector('#checkout-form'),
  history: document.querySelector('#order-history'), orderId: document.querySelector('#order-id'),
  result: document.querySelector('#order-result'), serverStatus: document.querySelector('#server-status'),
  tick: document.querySelector('#kitchen-tick'), total: document.querySelector('#order-total'),
};
let currentOrder = null;
let selectedItemId = null;

async function requestJson(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json();
  if (!response.ok && !payload.order) throw new Error(payload.error ?? 'REQUEST_FAILED');
  return { response, payload };
}

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

function renderOrder(order) {
  currentOrder = order;
  elements.empty.hidden = true;
  elements.result.hidden = false;
  elements.orderId.textContent = order.id;
  elements.total.textContent = money(order.total);
  elements.history.replaceChildren(...order.history.map((entry) => {
    const item = document.createElement('li');
    const state = document.createElement('strong');
    const note = document.createElement('span');
    state.textContent = entry.state;
    note.textContent = entry.note;
    item.append(state, note);
    return item;
  }));
  elements.tick.disabled = !['CONFIRMED', 'IN_KITCHEN'].includes(order.state);
  elements.complete.disabled = order.state !== 'READY';
}

async function loadCatalog() {
  const { payload } = await requestJson('/api/catalog');
  selectedItemId = payload.items[0]?.id ?? null;
  elements.catalog.replaceChildren(...payload.items.map((item, index) => {
    const label = document.createElement('label');
    label.className = 'product-card';
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'catalog-item'; input.value = item.id; input.checked = index === 0;
    input.addEventListener('change', () => { selectedItemId = item.id; });
    const name = document.createElement('strong'); name.textContent = item.name;
    const price = document.createElement('span'); price.textContent = money(item.price);
    const stock = document.createElement('small'); stock.textContent = `Còn ${item.stock}`;
    label.append(input, name, price, stock);
    return label;
  }));
}

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  try {
    const created = await requestJson('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customerName: formData.get('customerName'), lineItems: [{ itemId: selectedItemId, quantity: 1 }] }) });
    renderOrder(created.payload.order);
    const paid = await requestJson(`/api/orders/${created.payload.order.id}/pay`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: formData.get('paymentToken') }) });
    renderOrder(paid.payload.order);
  } catch (error) {
    elements.empty.hidden = false;
    elements.empty.textContent = `Không tạo được đơn: ${error.message}`;
  }
});

elements.tick.addEventListener('click', async () => {
  const { payload } = await requestJson('/api/kitchen/tick', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orderId: currentOrder.id }) });
  renderOrder(payload.order);
});

elements.complete.addEventListener('click', async () => {
  const { payload } = await requestJson(`/api/orders/${currentOrder.id}/complete`, { method: 'POST' });
  renderOrder(payload.order);
});

try {
  const { payload } = await requestJson('/api/health');
  elements.serverStatus.textContent = payload.status === 'ok' ? 'Server sẵn sàng' : 'Server chưa sẵn sàng';
  await loadCatalog();
} catch {
  elements.serverStatus.textContent = 'Không kết nối được với server';
}
