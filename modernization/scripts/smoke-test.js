import http from 'node:http';

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: 4000, path, method: 'GET' }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end();
  });
}

const checks = ['/api/health', '/api/colleges', '/api/programs?collegeId=1', '/', '/admin'];
for (const path of checks) {
  const result = await request(path);
  if (result.status >= 400) {
    throw new Error(`Smoke check failed for ${path}: ${result.status}`);
  }
  console.log(`${path} -> ${result.status}`);
}
