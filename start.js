const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTS = [3001, 3002, 3003];
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

const requestHandler = (req, res) => {
  let reqUrl = req.url;
  
  // Clean query strings or hash parameters if present
  if (reqUrl.includes('?')) {
    reqUrl = reqUrl.split('?')[0];
  }
  if (reqUrl.includes('#')) {
    reqUrl = reqUrl.split('#')[0];
  }

  // Determine default HTML based on port
  const port = req.socket.localPort;
  const defaultHtml = (port === 3002 || port === 3003) ? 'candidate.html' : 'index.html';

  // Handle default route
  let filePath = path.join(BASE_DIR, reqUrl === '/' ? defaultHtml : reqUrl);
  
  // Prevent directory traversal attacks
  if (!filePath.startsWith(BASE_DIR)) {
    res.statusCode = 403;
    res.end('403 Forbidden: Directory traversal is not allowed.');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Return 404 with appropriate fallback for SPA router
      if (reqUrl !== '/' && !path.extname(reqUrl)) {
        filePath = path.join(BASE_DIR, defaultHtml);
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
};

console.log(`================================================================`);
console.log(`🚀 Exam Proctoring Application Developer Server Started Successfully!`);
console.log(`📂 Workspace Root: ${BASE_DIR}`);

PORTS.forEach(port => {
  const server = http.createServer(requestHandler);
  server.listen(port, 'localhost', () => {
    console.log(`🔗 Local Access: http://localhost:${port}/`);
  });
});
console.log(`================================================================`);
