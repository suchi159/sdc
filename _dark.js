const puppeteer = require('puppeteer');
const path = require('path');
const OUT = '/private/tmp/claude-501/-Users-suchi-Documents-Data-proctor/ba242834-299e-41ce-853d-a77f524cad3b/scratchpad';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e=>console.log('PAGEERR', e.message));
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('secure_exam.html', { waitUntil: 'networkidle2', timeout: 60000 }).catch(e=>{});
  await new Promise(r=>setTimeout(r,1200));
  await page.evaluate(()=>handleLogin({preventDefault(){}, target:document.getElementById('login-form')}));
  await new Promise(r=>setTimeout(r,900));
  await page.evaluate(()=>{ const ds=document.querySelectorAll('.mfa-digit'); '482915'.split('').forEach((c,i)=>{if(ds[i])ds[i].value=c;}); handleMfaVerify({preventDefault(){}}); });
  await new Promise(r=>setTimeout(r,1100));
  await page.evaluate(()=>{ if(typeof completeOnboarding==='function'){try{completeOnboarding();}catch(e){}} });
  await new Promise(r=>setTimeout(r,800));
  await page.evaluate(()=>{ document.querySelectorAll('[id*="tour"],.tour-overlay').forEach(e=>{ if(getComputedStyle(e).position==='fixed') e.style.display='none'; }); });
  // dark mode
  await page.evaluate(()=>{ const b=document.getElementById('theme-switcher-btn'); if(b) b.click(); });
  await new Promise(r=>setTimeout(r,400));
  await page.evaluate(()=>changePanel('classmgmt-panel'));
  await new Promise(r=>setTimeout(r,600));
  await page.screenshot({ path: path.join(OUT,'proc-dark-classmgmt.png') });
  // verify proctor chrome (top nav + sidebar toggle) present
  const chrome = await page.evaluate(()=>({ hdr: !!document.querySelector('header.hdr') && getComputedStyle(document.querySelector('header.hdr')).display!=='none', toggle: !!document.querySelector('.sidebar-footer .portal-switch') }));
  console.log('CHROME', JSON.stringify(chrome));
  await browser.close();
})();
