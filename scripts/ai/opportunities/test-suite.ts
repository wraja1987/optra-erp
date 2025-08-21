/* eslint-disable no-console */
import 'dotenv/config';
import fetch from 'node-fetch';

async function expectOk(res: Response, msg: string) {
  if (!res.ok) {
    const t = await res.text();
    console.error(msg, t);
    process.exit(1);
  }
}

async function main() {
  const headers = { cookie: 'role=SUPERADMIN' } as any;
  let res = await fetch('http://localhost:3000/api/ai/opportunities');
  if (res.status !== 403) { console.error('Expected 403 without cookie'); process.exit(1); }
  res = await fetch('http://localhost:3000/api/ai/opportunities', { headers });
  await expectOk(res, 'List failed');
  const list = await res.json() as any;
  if (!Array.isArray(list.items)) { console.error('List invalid'); process.exit(1); }
  if (!list.items.length) { console.warn('No items; run refresh first'); }
  const id = list.items[0]?.id || 1;
  res = await fetch(`http://localhost:3000/api/ai/opportunities/${id}/plan`, { method:'POST', headers });
  await expectOk(res, 'Plan failed');
  const plan = await res.json() as any;
  res = await fetch(`http://localhost:3000/api/ai/opportunities/${id}/accept`, { method:'POST', headers, body: JSON.stringify({ plan: plan.plan }), 
    // @ts-ignore
    headers: { ...headers, 'Content-Type': 'application/json' } });
  await expectOk(res, 'Accept failed');
  console.log('AI opportunities test suite OK');
}

main();


