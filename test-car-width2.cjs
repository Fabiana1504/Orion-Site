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
  
  const dims = await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    const wrap = document.querySelector('.car-model-wrapper');
    const pivot = document.querySelector('.f1-scroll-car-pivot, [class*="z-[4]"]');
    return {
      mvWidth: mv?.getBoundingClientRect().width,
      mvHeight: mv?.getBoundingClientRect().height,
      wrapWidth: wrap?.getBoundingClientRect().width,
      wrapHeight: wrap?.getBoundingClientRect().height,
      pivotWidth: pivot?.getBoundingClientRect().width,
      pivotHeight: pivot?.getBoundingClientRect().height,
    };
  });
  console.log('Dimensions:', JSON.stringify(dims, null, 2));
  
  await browser.close();
})();
