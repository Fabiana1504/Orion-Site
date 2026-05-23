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
    const stage = document.querySelector('.car-scroll-stage');
    const container = document.querySelector('#car .container');
    const carSection = document.querySelector('#car');
    return {
      mv: mv ? { width: mv.getBoundingClientRect().width, height: mv.getBoundingClientRect().height } : null,
      wrapper: wrapper ? { width: wrapper.getBoundingClientRect().width, height: wrapper.getBoundingClientRect().height } : null,
      stage: stage ? { width: stage.getBoundingClientRect().width, height: stage.getBoundingClientRect().height } : null,
      container: container ? { width: container.getBoundingClientRect().width, height: container.getBoundingClientRect().height } : null,
      carSection: carSection ? { width: carSection.getBoundingClientRect().width, height: carSection.getBoundingClientRect().height } : null,
    };
  });
  console.log('rects:', JSON.stringify(rects, null, 2));
  
  await browser.close();
})();
