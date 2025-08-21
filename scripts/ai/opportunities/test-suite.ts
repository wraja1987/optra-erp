import http from 'node:http';

function req(method: string, path: string, body?: any, cookie?: string): Promise<{status:number, text:string}> {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : undefined;
    const req = http.request(
      { host: '127.0.0.1', port: 3000, path, method,
        headers: {
          'Content-Type': 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
          ...(data ? { 'Content-Length': data.length } : {}),
        } },
      res => {
        let chunks: Buffer[] = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode || 0, text: Buffer.concat(chunks).toString('utf8') }));
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function expect(status: number, got: number, label: string) {
  if (got !== status) throw new Error(`${label}: expected ${status}, got ${got}`);
}

(async () => {
  // Negative flow (no cookie): should 403
  const negList = await req('GET', '/api/ai/opportunities');
  await expect(403, negList.status, 'list without cookie');

  const negRefresh = await req('POST', '/api/ai/opportunities/refresh');
  await expect(403, negRefresh.status, 'refresh without cookie');

  // Positive flow (Super Admin cookie)
  const cookie = 'role=SUPERADMIN';

  const refresh = await req('POST', '/api/ai/opportunities/refresh', {}, cookie);
  await expect(200, refresh.status, 'refresh with superadmin');

  const list = await req('GET', '/api/ai/opportunities', undefined, cookie);
  await expect(200, list.status, 'list with superadmin');

  const plan = await req('POST', '/api/ai/opportunities/plan', { id: 'demo-1' }, cookie);
  await expect(200, plan.status, 'plan with superadmin');

  const accept = await req('POST', '/api/ai/opportunities/accept', { id: 'demo-1' }, cookie);
  await expect(200, accept.status, 'accept with superadmin');

  const reject = await req('POST', '/api/ai/opportunities/reject', { id: 'demo-1', reason: 'not now' }, cookie);
  await expect(200, reject.status, 'reject with superadmin');

  console.log('ai:opps:test OK');
})().catch(err => {
  console.error('ai:opps:test FAILED', err?.message || err);
  process.exit(1);
});
