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
  
  const carSection = await page.$('#car');
  if (carSection) {
    await carSection.screenshot({ path: '/Users/estebancanales/Work/Orion-Site/car-section.png' });
    console.log('Screenshot saved to car-section.png');
  } else {
    console.log('car section not found');
  }
  await browser.close();
})();
