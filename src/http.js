import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function createRequestHandler() {
  return async function requestHandler(request, response) {
    const url = new URL(request.url, 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, { service: 'tiem-banh-may', status: 'ok' });
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
