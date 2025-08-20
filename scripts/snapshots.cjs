const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async()=>{
  const out = path.join(process.cwd(),'screenshots'); if (!fs.existsSync(out)) fs.mkdirSync(out);
  const url = process.env.APP_ORIGIN || 'http://localhost:3000';
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  async function cap(name){ await page.screenshot({ path: path.join(out, name) }); }
  // Login first (uses default demo creds on login page)
  await page.goto(`${url}/login`);
  await page.waitForSelector('input[type="email"]');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil:'networkidle0' }).catch(()=>{});
  // Light
  await page.goto(`${url}/dashboard/orders`);
  await cap('sales-orders-light-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('sales-orders-light-mobile.png');
  // Dark: toggle via prefers-color-scheme media emulation if app supports
  await page.emulateMediaFeatures([{ name:'prefers-color-scheme', value:'dark' }]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${url}/dashboard/orders`);
  await cap('sales-orders-dark-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('sales-orders-dark-mobile.png');
  // Products
  await page.emulateMediaFeatures([ { name:'prefers-color-scheme', value:'light' } ]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${url}/dashboard/products`);
  await cap('products-light-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('products-light-mobile.png');
  await page.emulateMediaFeatures([ { name:'prefers-color-scheme', value:'dark' } ]);
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${url}/dashboard/products`);
  await cap('products-dark-desktop.png');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await cap('products-dark-mobile.png');
  await browser.close();
  console.log('Screenshots saved to screenshots/');
})();


