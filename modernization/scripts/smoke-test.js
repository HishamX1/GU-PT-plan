import http from 'node:http';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port: 4000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }
        resolve({ status: res.statusCode, body: raw, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
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

const created = await request('/api/colleges', 'POST', { name: `Smoke Faculty ${Date.now()}` });
if (created.status !== 201 || !created.json?.id) {
  throw new Error(`Create college failed: ${created.status}`);
}
console.log(`/api/colleges POST -> ${created.status}`);

const updated = await request(`/api/colleges/${created.json.id}`, 'PUT', { name: `${created.json.name} Updated` });
if (updated.status !== 200) {
  throw new Error(`Update college failed: ${updated.status}`);
}
console.log(`/api/colleges/:id PUT -> ${updated.status}`);

const deleted = await request(`/api/colleges/${created.json.id}`, 'DELETE');
if (deleted.status !== 200) {
  throw new Error(`Delete college failed: ${deleted.status}`);
}
console.log(`/api/colleges/:id DELETE -> ${deleted.status}`);
