const statusElement = document.querySelector('#server-status');

try {
  const response = await fetch('/api/health');
  const health = await response.json();
  statusElement.textContent = health.status === 'ok' ? 'Sẵn sàng nhận đơn.' : 'Chưa sẵn sàng.';
} catch {
  statusElement.textContent = 'Không kết nối được với server.';
}
