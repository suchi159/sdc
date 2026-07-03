const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('console', msg => console.log('PAGE CONSOLE:', msg.text()));

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('dashboard.html');
  
  await page.waitForSelector('#login-submit-btn');

  const loginBtn = await page.$('#login-submit-btn');
  if (loginBtn) {
    console.log("Clicking Sign In...");
    await loginBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  const coveringElementInfo = await page.evaluate(() => {
    const el = document.getElementById('auth-view');
    return el ? el.className : 'null';
  });
  console.log("Auth view class:", coveringElementInfo);

  await browser.close();
})();
