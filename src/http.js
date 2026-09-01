import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCatalogStore } from './catalog.js';
import { createOrderStore } from './orders.js';

const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function sendPublicFile(response, fileName) {
  try {
    const filePath = join(publicDirectory, fileName);
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    response.end(body);
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendJson(response, 404, { error: 'NOT_FOUND' });
      return;
    }
    throw error;
  }
}

export function createRequestHandler({
  catalogStore = createCatalogStore(),
  orderStore = createOrderStore({ catalogStore }),
} = {}) {
  return async function requestHandler(request, response) {
    const url = new URL(request.url, 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, { service: 'tiem-banh-may', status: 'ok' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/catalog') {
      sendJson(response, 200, { items: catalogStore.list() });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/orders') {
      try {
        const created = orderStore.create(await readJson(request));
        if (!created.ok) {
          sendJson(response, created.statusCode, { error: created.error, itemId: created.itemId });
          return;
        }
        sendJson(response, 201, { order: created.order });
      } catch {
        sendJson(response, 400, { error: 'INVALID_JSON' });
      }
      return;
    }

    const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (request.method === 'GET' && orderMatch) {
      const order = orderStore.get(orderMatch[1]);
      if (!order) {
        sendJson(response, 404, { error: 'ORDER_NOT_FOUND' });
        return;
      }
      sendJson(response, 200, { order });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/') {
      await sendPublicFile(response, 'index.html');
      return;
    }

    if (request.method === 'GET' && ['/app.js', '/styles.css'].includes(url.pathname)) {
      await sendPublicFile(response, url.pathname.slice(1));
      return;
    }

    sendJson(response, 404, { error: 'NOT_FOUND' });
  };
}
