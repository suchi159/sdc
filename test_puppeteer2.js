const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3007/v3');
  await new Promise(r => setTimeout(r, 1000));
  
  // Click on Live Exam Monitoring
  await page.evaluate(() => {
    v3App.switchView('monitoring');
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Click on a filter
  await page.evaluate(() => {
    document.querySelector('#monitor-filters button:nth-child(2)').click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await browser.close();
})();
