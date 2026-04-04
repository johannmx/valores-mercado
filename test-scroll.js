const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173');

  // Wait for content to load
  await page.waitForTimeout(1000);

  // Press 'd' to add a toast
  await page.keyboard.press('d');
  await page.waitForTimeout(500);
  await page.keyboard.press('d');
  await page.waitForTimeout(500);

  // Scroll down a bit
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'mobile-scrolled.png' });
  await browser.close();
})();
