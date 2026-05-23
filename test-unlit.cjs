const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const el = document.getElementById('car');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(5000);
  await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    if (mv) {
      mv.src = '/so26-unlit.glb';
      mv.style.backgroundColor = '#ffffff';
      mv.removeAttribute('environment-image');
      mv.setAttribute('auto-rotate', '');
    }
  });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/orion-car-unlit.png', fullPage: false });
  await browser.close();
})();
