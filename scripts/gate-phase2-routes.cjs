const { execSync, spawn } = require('child_process');
const http = require('http');

function ok(s){ console.log(`PASS: ${s}`); }
function fail(s){ console.error(`FAIL: ${s}`); process.exitCode = 1; }

function probe(url){ return new Promise(resolve=>{
  const req = http.get(url, res=>{ resolve(res.statusCode); });
  req.on('error', ()=> resolve(0));
}); }

(async()=>{
  try {
    // Ensure dev server (apps/web)
    execSync('pgrep -f "next dev.*apps/web" >/dev/null || (cd apps/web && PORT=${PORT:-3000} pnpm dev >/dev/null 2>&1 &)', { stdio:'ignore', shell:'/bin/bash' });
    const origin = process.env.APP_ORIGIN || `http://localhost:${process.env.PORT||3000}`;
    // Wait ready
    const start = Date.now();
    while(Date.now()-start < 60000){ const code = await probe(origin + '/'); if (code) break; await new Promise(r=>setTimeout(r,1000)); }

    // Route map (fallbacks)
    const SALES = process.env.SALES_ORDERS_PATH || '/orders/sales';
    const PRODUCTS = process.env.PRODUCTS_PATH || '/products';
    const CUSTOMERS = process.env.CUSTOMERS_ACCOUNTS_PATH || '/customers/accounts';

    const checks = [ ['Sales Orders', SALES], ['Products', PRODUCTS], ['Customers Accounts', CUSTOMERS] ];
    for (const [label, path] of checks){
      const code = await probe(origin + path);
      if (code === 200) ok(`${label} route 200`); else fail(`${label} route ${code||'NO_RESPONSE'} at ${origin+path}`);
    }
  } catch(e){ fail(`routes gate error: ${e?.message||e}`); }
})();




