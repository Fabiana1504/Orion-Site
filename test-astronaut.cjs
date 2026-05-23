const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  await page.goto('file:///tmp/test-astronaut.html');
  await page.waitForTimeout(10000);
  await page.screenshot({ path: '/tmp/test-astronaut.png', fullPage: true });
  await browser.close();
})();
