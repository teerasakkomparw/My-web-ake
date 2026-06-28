import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('.');
const port = Number(process.env.PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function resolveRequest(url) {
  const pathname = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const cleaned = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const target = resolve(join(root, cleaned === '/' ? '/index.html' : cleaned));
  if (!target.startsWith(root)) return null;
  return target;
}

const server = createServer(async (request, response) => {
  const filePath = resolveRequest(request.url || '/');
  if (!filePath) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  let target = filePath;
  if (!existsSync(target)) target = join(root, 'index.html');

  try {
    const details = await stat(target);
    if (!details.isFile()) target = join(root, 'index.html');
    response.writeHead(200, {
      'Content-Type': types[extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview available at http://127.0.0.1:${port}`);
});
