const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url;
  
  // Clean query strings or hash parameters if present
  if (reqUrl.includes('?')) {
    reqUrl = reqUrl.split('?')[0];
  }
  if (reqUrl.includes('#')) {
    reqUrl = reqUrl.split('#')[0];
  }

  // Handle default route
  let filePath = path.join(BASE_DIR, reqUrl === '/' ? 'index.html' : reqUrl);
  
  // Prevent directory traversal attacks
  if (!filePath.startsWith(BASE_DIR)) {
    res.statusCode = 403;
    res.end('403 Forbidden: Directory traversal is not allowed.');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Return 404 with index.html fallback for SPA router (optional, but let's just return 404 for missing assets or index.html for unknown paths)
      if (reqUrl !== '/' && !path.extname(reqUrl)) {
        filePath = path.join(BASE_DIR, 'index.html');
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`404 Not Found: ${req.url}`);
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    
    // Add cache control to prevent browser caching during development
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`500 Internal Server Error: ${streamErr.message}`);
    });
    stream.pipe(res);
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`================================================================`);
  console.log(`🚀 Exam Proctoring Application Developer Server Started Successfully!`);
  console.log(`🔗 Local Access: http://localhost:${PORT}/`);
  console.log(`📂 Workspace Root: ${BASE_DIR}`);
  console.log(`================================================================`);
});
