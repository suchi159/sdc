const http = require('http');
http.get('http://localhost:3007/api/candidates', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('candidates length:', JSON.parse(data).length));
});
