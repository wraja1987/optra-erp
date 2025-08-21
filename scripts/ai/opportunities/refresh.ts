/* eslint-disable no-console */
import 'dotenv/config';
import fetch from 'node-fetch';

async function main() {
  const res = await fetch('http://localhost:3000/api/ai/opportunities/refresh', { method:'POST', headers:{ cookie: 'role=SUPERADMIN' } });
  if (!res.ok) { console.error('Refresh failed', await res.text()); process.exit(1); }
  console.log('Refresh OK');
}

main();


