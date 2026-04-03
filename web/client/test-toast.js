import { chromium, devices } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();

  // Mobile
  const mobileContext = await browser.newContext({
    ...devices['Pixel 5']
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.route('**/api/rates', async route => {
    const mockedData = {
        "timestamp": new Date().toISOString(),
        "usd_oficial": 1000,
        "usd_blue": 1500,
        "usd_mep": 1100,
        "usd_ccl": 1150,
        "usd_cripto": 1200,
        "usd_tarjeta": 1300,
        "ves_oficial": 36,
        "ves_paralelo": 40,
        "ves_eur_oficial": 39,
        "ves_eur_paralelo": 43,
        "ves_compra": 35,
        "uyu_venta": 39,
        "uyu_compra": 38,
        "clp_venta": 900,
        "clp_compra": 850,
        "brl_venta": 5.5,
        "brl_compra": 5.2,
        "eur_venta": 1100,
        "eur_compra": 1050,
        "uyu_ar": 25,
        "clp_ar": 1.2,
        "brl_ar": 190,
        "btc_usd": 65000,
        "changes": {},
        "api_status": {}
    };
    mockedData.usd_blue += Math.random() * 10 - 5;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockedData) });
  });

  await mobilePage.route('**/api/history', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await mobilePage.goto('http://localhost:5173');
  await mobilePage.waitForTimeout(1000);

  // Simulate clicking on the 'Refresh' icon directly by relying on SVG class or button click
  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const refreshBtn = buttons.find(b => b.innerHTML.includes('lucide-refresh-cw'));
    if(refreshBtn) refreshBtn.click();
  });
  await mobilePage.waitForTimeout(2000);

  await mobilePage.screenshot({ path: 'mobile-screenshot.png' });

  const hasToast = await mobilePage.evaluate(() => {
    return document.querySelectorAll('div.fixed.bottom-24.right-4.md\\:right-8').length > 0 &&
           document.querySelector('div.fixed.bottom-24.right-4.md\\:right-8').children.length > 0;
  });
  console.log(`Mobile: Has toast? ${hasToast}`);
  const html = await mobilePage.evaluate(() => document.querySelector('div.fixed.bottom-24.right-4.md\\:right-8')?.outerHTML);
  console.log('Mobile Toast HTML:', html);


  // Desktop
  const desktopContext = await browser.newContext();
  const desktopPage = await desktopContext.newPage();

  await desktopPage.route('**/api/rates', async route => {
    const mockedData = {
        "timestamp": new Date().toISOString(),
        "usd_oficial": 1000,
        "usd_blue": 1500,
        "usd_mep": 1100,
        "usd_ccl": 1150,
        "usd_cripto": 1200,
        "usd_tarjeta": 1300,
        "ves_oficial": 36,
        "ves_paralelo": 40,
        "ves_eur_oficial": 39,
        "ves_eur_paralelo": 43,
        "ves_compra": 35,
        "uyu_venta": 39,
        "uyu_compra": 38,
        "clp_venta": 900,
        "clp_compra": 850,
        "brl_venta": 5.5,
        "brl_compra": 5.2,
        "eur_venta": 1100,
        "eur_compra": 1050,
        "uyu_ar": 25,
        "clp_ar": 1.2,
        "brl_ar": 190,
        "btc_usd": 65000,
        "changes": {},
        "api_status": {}
    };
    mockedData.usd_blue += Math.random() * 10 - 5;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockedData) });
  });

  await desktopPage.route('**/api/history', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await desktopPage.goto('http://localhost:5173');
  await desktopPage.waitForTimeout(1000);

  await desktopPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const refreshBtn = buttons.find(b => b.innerHTML.includes('lucide-refresh-cw'));
    if(refreshBtn) refreshBtn.click();
  });
  await desktopPage.waitForTimeout(2000);

  await desktopPage.screenshot({ path: 'desktop-screenshot.png' });

  const desktopHasToast = await desktopPage.evaluate(() => {
    return document.querySelectorAll('div.fixed.bottom-24.right-4.md\\:right-8').length > 0 &&
           document.querySelector('div.fixed.bottom-24.right-4.md\\:right-8').children.length > 0;
  });
  console.log(`Desktop: Has toast? ${desktopHasToast}`);
  const desktopHtml = await desktopPage.evaluate(() => document.querySelector('div.fixed.bottom-24.right-4.md\\:right-8')?.outerHTML);
  console.log('Desktop Toast HTML:', desktopHtml);

  await browser.close();
})();
