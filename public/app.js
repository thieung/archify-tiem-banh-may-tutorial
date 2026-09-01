const statusElement = document.querySelector('#server-status');
const catalogElement = document.querySelector('#catalog-list');

try {
  const response = await fetch('/api/health');
  const health = await response.json();
  statusElement.textContent = health.status === 'ok' ? 'Sẵn sàng nhận đơn.' : 'Chưa sẵn sàng.';
} catch {
  statusElement.textContent = 'Không kết nối được với server.';
}

try {
  const response = await fetch('/api/catalog');
  const payload = await response.json();
  catalogElement.innerHTML = payload.items
    .map((item) => `
      <article class="catalog-card">
        <h3>${item.name}</h3>
        <p class="sku">${item.id}</p>
        <p>${item.stock} phần còn lại</p>
        <strong>${new Intl.NumberFormat('vi-VN').format(item.price)}đ</strong>
      </article>
    `)
    .join('');
} catch {
  catalogElement.textContent = 'Không tải được catalog.';
}
