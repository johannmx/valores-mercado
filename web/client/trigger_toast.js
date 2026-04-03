import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch();

  // Mobile
  const mobileContext = await browser.newContext({
    ...devices['Pixel 5']
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173');
  await mobilePage.waitForTimeout(2000);

  // Trigger a change to make toast appear
  await mobilePage.evaluate(() => {
    // We can't directly call setNotifications, so we might need to mock the API response
  });

  await browser.close();
})();
