const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const BASE_DIR = __dirname;
const HUB_FILE = path.join(BASE_DIR, 'central_hub.html');

// The hub only serves static files; the real data API lives in start.js.
// Proxy /api/* (and /data/*.json) through to it so portals opened on :8888
// get the same populated data they show when opened on :3001-:3011.
const API_BACKEND = { host: '127.0.0.1', port: 3001 };

function proxyToApi(req, res) {
  const proxyReq = http.request(
    { host: API_BACKEND.host, port: API_BACKEND.port, path: req.url, method: req.method, headers: req.headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API backend unavailable', detail: err.message }));
  });
  req.pipe(proxyReq);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function serveHub(res) {
  fs.readFile(HUB_FILE, (err, content) => {
    if (err) { res.writeHead(500); return res.end('Error loading hub'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Forward data calls to the start.js API backend (so /api/candidates etc.
  // return real JSON instead of falling back to the hub HTML).
  if (urlPath.startsWith('/api/') || /^\/data\/.*\.json$/.test(urlPath)) return proxyToApi(req, res);

  // Hub at root
  if (urlPath === '/' || urlPath === '/central_hub.html') return serveHub(res);

  // Serve static assets (design_system.css, logos, etc.) from disk so the
  // shared design system actually loads on the hub. Prevent path traversal.
  const filePath = path.join(BASE_DIR, urlPath);
  if (!filePath.startsWith(BASE_DIR)) { res.writeHead(403); return res.end('403 Forbidden'); }

  fs.readFile(filePath, (err, content) => {
    if (err) return serveHub(res); // unknown route → fall back to the hub
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Central Hub running at http://localhost:${PORT}/`);
});
