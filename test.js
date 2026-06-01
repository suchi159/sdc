const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  
  // Test v2
  const page2 = await browser.newPage();
  page2.on('pageerror', err => console.log('v2 PAGE ERROR:', err.toString()));
  await page2.goto('http://localhost:3007/v2');
  await new Promise(r => setTimeout(r, 2000));
  
  const v2_td4 = await page2.evaluate(() => {
    const el = document.querySelector("#candidates-tbody > tr:nth-child(1) > td:nth-child(4)");
    return el ? el.innerText : 'null';
  });
  console.log("v2.html td:nth-child(4):", v2_td4);

  // Test v3
  const page3 = await browser.newPage();
  page3.on('pageerror', err => console.log('v3 PAGE ERROR:', err.toString()));
  await page3.goto('http://localhost:3007/v3');
  await new Promise(r => setTimeout(r, 2000));
  
  const v3_td4 = await page3.evaluate(() => {
    const el = document.querySelector("#candidates-tbody > tr:nth-child(1) > td:nth-child(4)");
    return el ? el.innerText : 'null';
  });
  console.log("v3.html td:nth-child(4):", v3_td4);

  await browser.close();
})();
