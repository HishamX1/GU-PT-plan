import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { handleApi } from './routes/catalogRoutes.js';
import { ensureDataStore } from './db/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../../frontend');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
}

await ensureDataStore();

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, `http://${req.headers.host}`);

  const apiHandled = await handleApi(req, res, url);
  if (apiHandled !== false) {
    console.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
    return;
  }

  if (url.pathname === '/') {
    serveFile(res, path.join(frontendDir, 'student', 'index.html'));
  } else if (url.pathname === '/admin') {
    serveFile(res, path.join(frontendDir, 'admin', 'index.html'));
  } else {
    const cleaned = url.pathname.replace(/^\/+/, '');
    const filePath = path.join(frontendDir, cleaned);
    serveFile(res, filePath);
  }

  console.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
});

server.listen(env.port, () => {
  console.log(`Backend running on port ${env.port} (${env.dataMode} mode)`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
