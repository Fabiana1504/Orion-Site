const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const el = document.getElementById('car');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(5000);
  
  const modelViewer = await page.$('model-viewer');
  if (modelViewer) {
    const src = await modelViewer.getAttribute('src');
    const ready = await modelViewer.evaluate(el => ({
      loaded: el.loaded,
      modelIsVisible: el.modelIsVisible,
      poster: el.poster,
      error: el.error
    }));
    console.log('model-viewer found:', { src, ...ready });
  } else {
    console.log('model-viewer NOT found in DOM');
  }
  
  // Check network for GLB
  const glbRequest = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .filter(r => r.name.includes('so26.glb'))
      .map(r => ({ name: r.name, duration: r.duration, responseStatus: r.responseStatus }));
  });
  console.log('GLB network:', glbRequest);
  
  await page.screenshot({ path: '/tmp/orion-car-debug.png', fullPage: false });
  await browser.close();
})();
