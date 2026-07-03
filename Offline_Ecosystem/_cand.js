const puppeteer = require('puppeteer');
const path = require('path');
const OUT = '/private/tmp/claude-501/-Users-suchi-Documents-Data-proctor/ba242834-299e-41ce-853d-a77f524cad3b/scratchpad';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e=>console.log('PAGEERR', e.message));
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('candidate.html', { waitUntil: 'networkidle2', timeout: 60000 }).catch(e=>{});
  await new Promise(r=>setTimeout(r,1500));
  // login (prefilled). submit form
  await page.evaluate(()=>{ const f=document.getElementById('login-form'); if(f) f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true})); });
  await new Promise(r=>setTimeout(r,1800));
  // ensure dashboard view; try to find enrol button
  const before = await page.evaluate(()=>{ try{return {has:!!document.getElementById('exam-status-strip'), exam: JSON.parse(localStorage.getItem('sp_candidate_exam_v1')||'{}')};}catch(e){return {err:e.message}} });
  console.log('BEFORE', JSON.stringify(before));
  // open enrol, select student-paid online (sc_3), confirm
  await page.evaluate(()=>openClassEnrol());
  await new Promise(r=>setTimeout(r,400));
  await page.evaluate(()=>{ const s=document.getElementById('enrol-class-select'); s.value='sc_3'; renderEnrolSummary(); });
  await new Promise(r=>setTimeout(r,200));
  await page.screenshot({ path: path.join(OUT,'cand-enrol.png') });
  await page.evaluate(()=>confirmClassEnrol());
  await new Promise(r=>setTimeout(r,600));
  await page.screenshot({ path: path.join(OUT,'cand-pay.png') });
  // pay
  await page.evaluate(()=>confirmExamPayment());
  await new Promise(r=>setTimeout(r,1600));
  await page.screenshot({ path: path.join(OUT,'cand-after-pay.png') });
  const after = await page.evaluate(()=>{ try{return JSON.parse(localStorage.getItem('sp_candidate_exam_v1')||'{}');}catch(e){return {}} });
  console.log('AFTER PAY', JSON.stringify(after));
  await browser.close();
})();
