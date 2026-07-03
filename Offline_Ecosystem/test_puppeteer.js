const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('v3.html');
  
  // Wait for a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on Live Exam Monitoring
  await page.evaluate(() => {
    v3App.switchView('monitoring');
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const tbody = await page.evaluate(() => document.getElementById('monitor-tbody').innerHTML);
  console.log('TBODY CONTENT:', tbody.length > 10 ? 'HAS CONTENT' : tbody);
  
  await browser.close();
})();
