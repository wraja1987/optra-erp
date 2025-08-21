const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async()=>{
  const out = path.join(process.cwd(),'screenshots'); if (!fs.existsSync(out)) fs.mkdirSync(out);
  const url = process.env.APP_ORIGIN || 'http://localhost:3000';
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  async function cap(name){
    try { await page.screenshot({ path: path.join(out, name), fullPage: false }); console.log(`[ok] ${name}`); }
    catch(e){ console.error(`[cap-fail] ${name}: ${e?.message||e}`); }
  }
  async function nav(to, debugName){
    try { await page.goto(to, { waitUntil:'networkidle2', timeout: 20000 }); return true; }
    catch(e){ console.error(`[nav-fail] ${to}: ${e?.message||e}`); try{ fs.writeFileSync(path.join(out,`debug-${debugName}.html`), await page.content()); }catch{} return false; }
  }
  // Programmatic login if credentials provided
  try {
    if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
      try {
        await page.evaluate(async (origin, email, password)=>{ try{ await fetch(origin+'/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({ email, password })}); }catch{} }, url, process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD);
      } catch {}
    }
    await nav(`${url}/login`, 'login');
    const hasEmail = await page.$('input[type="email"]');
    if (hasEmail && process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
      await page.type('input[type="email"]', process.env.TEST_USER_EMAIL, { delay: 5 }).catch(()=>{});
      await page.type('input[type="password"]', process.env.TEST_USER_PASSWORD, { delay: 5 }).catch(()=>{});
      await page.click('button[type="submit"]').catch(()=>{});
      await page.waitForNavigation({ waitUntil:'networkidle0', timeout: 8000 }).catch(()=>{});
    }
  } catch {}
  const SALES = process.env.SALES_ORDERS_PATH || '/orders/sales';
  const PRODUCTS = process.env.PRODUCTS_PATH || '/products';
  const CUSTOMERS = process.env.CUSTOMERS_ACCOUNTS_PATH || '/customers/accounts';
  // Light
  await nav(`${url}${SALES}`, 'orders-light-desktop');
  await cap('sales-orders-light-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('sales-orders-light-mobile.png');
  // Dark: toggle via prefers-color-scheme media emulation if app supports
  await page.emulateMediaFeatures([{ name:'prefers-color-scheme', value:'dark' }]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await nav(`${url}${SALES}`, 'orders-dark-desktop');
  await cap('sales-orders-dark-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('sales-orders-dark-mobile.png');
  // Products
  await page.emulateMediaFeatures([ { name:'prefers-color-scheme', value:'light' } ]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await nav(`${url}${PRODUCTS}`, 'products-light-desktop');
  await cap('products-light-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('products-light-mobile.png');
  await page.emulateMediaFeatures([ { name:'prefers-color-scheme', value:'dark' } ]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await nav(`${url}${PRODUCTS}`, 'products-dark-desktop');
  await cap('products-dark-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('products-dark-mobile.png');
  // Customers → Accounts
  await page.emulateMediaFeatures([ { name:'prefers-color-scheme', value:'light' } ]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await nav(`${url}${CUSTOMERS}`, 'customers-light-desktop');
  await cap('customers-accounts-light-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('customers-accounts-light-mobile.png');
  await page.emulateMediaFeatures([ { name:'prefers-color-scheme', value:'dark' } ]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await nav(`${url}${CUSTOMERS}`, 'customers-dark-desktop');
  await cap('customers-accounts-dark-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('customers-accounts-dark-mobile.png');
  await browser.close();
  // Log presence (non-blocking)
  const required = [
    'sales-orders-light-desktop.png','sales-orders-dark-desktop.png','sales-orders-light-mobile.png','sales-orders-dark-mobile.png',
    'products-light-desktop.png','products-dark-desktop.png','products-light-mobile.png','products-dark-mobile.png',
    'customers-accounts-light-desktop.png','customers-accounts-dark-desktop.png','customers-accounts-light-mobile.png','customers-accounts-dark-mobile.png'
  ];
  const missing = required.filter(f=>!fs.existsSync(path.join(out,f)));
  if (missing.length) console.error('Missing screenshots (non-blocking):', missing.join(', '));
  console.log('Screenshots saved to screenshots/ (non-blocking)');
})();


