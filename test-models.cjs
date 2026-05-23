const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto('file:///tmp/test-models.html');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: '/tmp/test-models-playwright.png', fullPage: true });
  await browser.close();
})();
