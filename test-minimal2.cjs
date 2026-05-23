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
  
  const rects = await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    const wrapper = document.querySelector('.car-model-wrapper');
    const pivot = document.querySelector('.f1-scroll-car-pivot');
    const stage = document.querySelector('.car-scroll-stage');
    return {
      mv: mv ? mv.getBoundingClientRect() : null,
      wrapper: wrapper ? wrapper.getBoundingClientRect() : null,
      pivot: pivot ? pivot.getBoundingClientRect() : null,
      stage: stage ? stage.getBoundingClientRect() : null,
    };
  });
  console.log('rects:', JSON.stringify(rects, null, 2));
  
  await browser.close();
})();
