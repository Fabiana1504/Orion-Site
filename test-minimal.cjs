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
  
  // Replace model-viewer with a minimal one
  await page.evaluate(() => {
    const wrapper = document.querySelector('.car-model-wrapper');
    if (wrapper) {
      wrapper.innerHTML = '<model-viewer class="car-model-viewer" src="/so26.glb" camera-controls style="background-color:#fff;width:100%;height:100%;"></model-viewer>';
    }
  });
  await page.waitForTimeout(5000);
  
  const mvState = await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    return mv ? { loaded: mv.loaded, modelIsVisible: mv.modelIsVisible, src: mv.getAttribute('src') } : null;
  });
  console.log('minimal model-viewer state:', mvState);
  
  const rect = await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    return mv ? mv.getBoundingClientRect() : null;
  });
  console.log('model-viewer rect:', rect);
  
  await page.screenshot({ path: '/tmp/orion-car-minimal.png', fullPage: false });
  await browser.close();
})();
