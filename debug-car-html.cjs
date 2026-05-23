const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const el = document.getElementById('car');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(5000);
  
  const html = await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    return mv ? mv.outerHTML : 'NOT FOUND';
  });
  console.log('model-viewer HTML:', html);
  
  await browser.close();
})();
