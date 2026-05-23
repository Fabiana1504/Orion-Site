const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const el = document.getElementById('car');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(5000);
  
  // Change background to white and add auto-rotate
  await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    if (mv) {
      mv.style.backgroundColor = '#ffffff';
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('shadow-intensity', '1');
      mv.removeAttribute('environment-image');
    }
  });
  await page.waitForTimeout(3000);
  
  const mvState = await page.evaluate(() => {
    const mv = document.querySelector('model-viewer');
    return mv ? {
      loaded: mv.loaded,
      modelIsVisible: mv.modelIsVisible,
      src: mv.getAttribute('src'),
      poster: mv.poster
    } : null;
  });
  console.log('model-viewer state:', mvState);
  
  await page.screenshot({ path: '/tmp/orion-car-white-bg.png', fullPage: false });
  await browser.close();
})();
