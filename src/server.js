import { createServer } from 'node:http';
import { createRequestHandler } from './http.js';

export function startServer({ port = 3000 } = {}) {
  const server = createServer(createRequestHandler());
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolve(server);
    });
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const server = await startServer({ port });
  const address = server.address();
  console.log(`Tiệm bánh Mây đang chạy tại http://localhost:${address.port}`);
}
