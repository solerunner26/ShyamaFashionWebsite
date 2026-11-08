import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function shyamaStudioBackend(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'data');

  const ensureDir = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  };

  const readJson = <T,>(filename: string, fallback: T): T => {
    ensureDir();
    const fp = path.join(dataDir, filename);
    if (!fs.existsSync(fp)) return fallback;
    try {
      return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T;
    } catch {
      return fallback;
    }
  };

  const writeJson = (filename: string, data: unknown) => {
    ensureDir();
    const fp = path.join(dataDir, filename);
    fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
  };

  const parseBody = (req: import('node:http').IncomingMessage): Promise<unknown> =>
    new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
        if (raw.length > 12 * 1024 * 1024) {
          reject(new Error('Payload too large'));
        }
      });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch (err) {
          reject(err);
        }
      });
      req.on('error', reject);
    });

  return {
    name: 'shyama-studio-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        res.setHeader('Content-Type', 'application/json');
        const url = req.url.split('?')[0];

        try {
          if (url === '/api/health' && req.method === 'GET') {
            res.end(JSON.stringify({ ok: true, studio: 'Shyama Fashion' }));
            return;
          }

          if (url === '/api/telemetry') {
            if (req.method === 'GET') {
              const events = readJson<unknown[]>('runtime-telemetry.json', []);
              res.end(JSON.stringify({ events }));
              return;
            }
            if (req.method === 'POST') {
              const body = (await parseBody(req)) as { event?: unknown; events?: unknown[] };
              const existing = readJson<unknown[]>('runtime-telemetry.json', []);
              const incoming = body.events ?? (body.event ? [body.event] : []);
              const merged = [...incoming, ...existing].slice(0, 1000);
              writeJson('runtime-telemetry.json', merged);
              res.end(JSON.stringify({ ok: true, count: merged.length }));
              return;
            }
            if (req.method === 'DELETE') {
              writeJson('runtime-telemetry.json', []);
              res.end(JSON.stringify({ ok: true, count: 0 }));
              return;
            }
          }

          if (url === '/api/studio-config') {
            if (req.method === 'GET') {
              const config = readJson<unknown | null>('runtime-studio-config.json', null);
              res.end(JSON.stringify({ config }));
              return;
            }
            if (req.method === 'POST') {
              const body = await parseBody(req);
              writeJson('runtime-studio-config.json', body);
              res.end(JSON.stringify({ ok: true }));
              return;
            }
          }

          if (url === '/api/orders' && req.method === 'POST') {
            const order = await parseBody(req);
            const existing = readJson<unknown[]>('runtime-orders.json', []);
            writeJson('runtime-orders.json', [order, ...existing].slice(0, 200));
            res.end(JSON.stringify({ ok: true }));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), shyamaStudioBackend()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});
