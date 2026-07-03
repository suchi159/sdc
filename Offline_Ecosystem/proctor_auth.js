// Certificate courses a proctor can be certified for — mirrors the VOUCHER_POOLS
// names in online_proctor.js so signup and class creation stay in sync.
const COURSES = [
  { id: 'v-chef-001',  name: 'Professional Chef Certification' },
  { id: 'v-fss-002',   name: 'Food Safety Standard' },
  { id: 'v-haccp-003', name: 'HACCP Level 3' },
  { id: 'v-culin-004', name: 'Culinary Arts' }
];

// 12 knowledge questions presented during signup and during license renewal.
const RENEWAL_FAQS = [
  { q: 'If the AI flags a "Secondary Person Detected", you should…', wrong: 'Pause the exam immediately.', correct: 'Review the live feed and log an incident if confirmed.' },
  { q: 'Candidates may use a calculator in an in-class exam…', wrong: 'Always.', correct: 'Only if explicitly permitted by the class settings.' },
  { q: 'A voucher can be redeemed for a student who…', wrong: 'Has already finished the learning material.', correct: 'Has not yet started using the learning material.' },
  { q: 'When a student requests a voucher replacement, the system…', wrong: 'Swaps it without any checks.', correct: 'Auto-verifies the new voucher before swapping.' },
  { q: 'If an email already has a voucher associated, you should…', wrong: 'Silently assign a second voucher.', correct: 'Be notified before assigning another.' },
  { q: 'Candidate PII must be…', wrong: 'Shared with colleagues for convenience.', correct: 'Kept strictly confidential.' },
  { q: 'You may add a candidate to an ongoing (live) class…', wrong: 'Never.', correct: 'At any time during the class.' },
  { q: 'When creating a class you must…', wrong: 'Skip learning materials.', correct: 'Select the learning materials for the class.' },
  { q: 'Screen recordings of candidates may be…', wrong: 'Posted publicly for transparency.', correct: 'Used only inside the SecureProctor platform.' },
  { q: 'Your proctor certification is valid for…', wrong: 'Life.', correct: '1 year and must be renewed before expiry.' },
  { q: 'If you suspect collusion you must…', wrong: 'Ignore it to avoid conflict.', correct: 'Report and log the violation.' },
  { q: 'Purchasing vouchers as a proctor requires…', wrong: 'No permission at all.', correct: 'Admin-delegated purchase rights.' }
];

const authFlow = {
  isRenewal: false,
  profile: {},
  issuedCode: null,

  startRegistration: function() {
    document.getElementById('view-login').classList.remove('active');
    document.getElementById('view-reg-0').classList.add('active');
    document.getElementById('flow-title').textContent = 'Proctor Certification';
    document.getElementById('flow-subtitle').textContent = 'Complete onboarding to get approved';

    // Populate the certificate course selector.
    const sel = document.getElementById('reg-course');
    if (sel && !sel.options.length) {
      sel.innerHTML = COURSES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  },

  submitDetails: function() {
    const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const first = val('reg-first');
    const last = val('reg-last');
    const dob = val('reg-dob');
    const email = val('reg-email');
    const phone = val('reg-phone');
    const street = val('reg-street');
    const city = val('reg-city');
    const state = val('reg-state');
    const zip = val('reg-zip');
    const country = val('reg-country');
    const idType = val('reg-idtype');
    const idNumber = val('reg-idnum');
    const employer = val('reg-employer');
    const jobTitle = val('reg-title');
    const experience = val('reg-experience');
    const highestCert = val('reg-highcert');
    const sel = document.getElementById('reg-course');
    const courseId = sel.value;
    const course = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';

    // Required: name, DOB, email, phone, ID type + number, course.
    if (!first || !last || !dob || !email || !phone || !idType || !idNumber || !courseId) {
      alert('Please complete all required (*) fields: name, date of birth, email, phone, government ID, and certificate course.');
      return;
    }

    this.profile = {
      firstName: first, lastName: last, dob,
      email, phone,
      address: { street, city, state, zip, country },
      idType, idNumber,
      employer, jobTitle,
      experienceYears: experience ? Number(experience) : null,
      highestCert,
      course, courseId
    };

    // Frame the training video for the chosen course.
    const sub = document.getElementById('reg-video-sub');
    if (sub) sub.textContent = `Please watch this mandatory training video on proctoring the ${course} certificate course.`;

    this.nextStep(1);
  },

  startRenewal: function() {
    this.isRenewal = true;
    document.querySelectorAll('.view-step').forEach(el => el.classList.remove('active'));
    document.getElementById('view-reg-1').classList.add('active');
    document.getElementById('flow-title').textContent = 'License Renewal';
    document.getElementById('flow-subtitle').textContent = 'Watch the video, answer 12 questions and accept the terms';
  },

  renderQuiz: function() {
    const step = document.getElementById('view-reg-2');
    if (!step) return;
    const faqHtml = RENEWAL_FAQS.map((f, i) => {
      const n = i + 1;
      return `<div style="margin-bottom:20px;">
        <p style="font-weight:600; font-size:14px; margin:0 0 12px 0;">${n}. ${f.q}</p>
        <label class="quiz-option"><input name="rq${n}" type="radio" value="wrong"/> ${f.wrong}</label>
        <label class="quiz-option"><input name="rq${n}" type="radio" value="correct"/> ${f.correct}</label>
      </div>`;
    }).join('');
    // Registration uses 4 wizard dots (Details·Video·Quiz·Sign); renewal uses 3.
    const dots = this.isRenewal
      ? '<div class="wizard-dot active"></div><div class="wizard-dot active"></div><div class="wizard-dot"></div>'
      : '<div class="wizard-dot active"></div><div class="wizard-dot active"></div><div class="wizard-dot active"></div><div class="wizard-dot"></div>';
    const stepLabel = this.isRenewal ? 'Step 2: 12 Questions' : 'Step 3: 12 Questions';
    step.innerHTML = `
      <div class="wizard-progress">${dots}</div>
      <h3 style="margin:0 0 16px 0; font-size:18px;">${stepLabel}</h3>
      <p style="font-size:13px; color:var(--text-secondary); margin-bottom:24px;">Answer all 12 questions to confirm your understanding before approval.</p>
      <div style="max-height:340px; overflow-y:auto; padding-right:8px;">${faqHtml}</div>
      <button class="btn btn-primary btn-full" onclick="authFlow.checkQuiz()">Verify Answers</button>`;
  },

  nextStep: function(step) {
    if (step === 2) this.renderQuiz();
    document.querySelectorAll('.view-step').forEach(el => el.classList.remove('active'));
    document.getElementById('view-reg-' + step).classList.add('active');
  },

  playVideo: function(el) {
    el.innerHTML = '<div style="color:rgba(255,255,255,0.9); font-weight:600; font-size:16px;">Video Playing... (Simulated)</div>';
    el.style.background = '#1a1a1a';
    setTimeout(() => {
      el.innerHTML = '<i class="material-icons" style="color:var(--status-success);">check_circle</i><div style="position:absolute; bottom:16px; text-align:center; width:100%; color:var(--status-success); font-weight:600; font-size:12px;">Training Completed</div>';
      document.getElementById('btn-reg-1').disabled = false;
    }, 2000);
  },

  checkQuiz: function() {
    for (let i = 1; i <= RENEWAL_FAQS.length; i++) {
      const ans = document.querySelector(`input[name="rq${i}"]:checked`);
      if (!ans) { alert('Please answer all 12 questions before verifying.'); return; }
      if (ans.value !== 'correct') { alert(`Question ${i} is incorrect. Please review and try again.`); return; }
    }
    this.nextStep(3);
  },

  copyCode: function() {
    const code = (document.getElementById('reg-code-value') || {}).textContent || '';
    if (!code || code === '—') return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => alert('Proctor code copied to clipboard.'));
    } else {
      alert('Your proctor code is: ' + code);
    }
  },

  // Best-effort client IP for the audit stamp; falls back gracefully offline.
  getClientIp: async function() {
    try {
      const r = await fetch('https://api.ipify.org?format=json');
      const d = await r.json();
      return d && d.ip ? d.ip : 'unavailable';
    } catch (e) {
      return 'unavailable';
    }
  },

  submitApproval: async function() {
    const successStep = document.getElementById('view-reg-success');
    const heading = successStep.querySelector('h3');
    const desc = document.getElementById('reg-success-desc');
    const codeBox = successStep.querySelector('div[style*="dashed"]');

    if (this.isRenewal) {
      // Renewal extends the proctor license (existing behavior).
      let licenseNumber = '';
      try {
        const r = await fetch('/api/license/renew', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
        });
        const data = await r.json();
        if (data && data.license) licenseNumber = data.license.number;
      } catch (e) { /* non-fatal */ }

      document.querySelectorAll('.view-step').forEach(el => el.classList.remove('active'));
      successStep.classList.add('active');
      document.getElementById('flow-title').textContent = 'License Renewed';
      document.getElementById('flow-subtitle').textContent = '';
      if (heading) heading.textContent = 'License Renewed';
      if (codeBox) codeBox.style.display = 'none';
      if (desc) desc.textContent = licenseNumber
        ? `License ${licenseNumber} is now valid for another year.`
        : 'Your proctor license has been renewed for another year.';
      return;
    }

    // Stamp the application with a submitted-at timestamp + client IP (recorded
    // for audit — not a formal digital signature) and persist a local copy.
    this.profile.submittedAt = new Date().toISOString();
    this.profile.ip = await this.getClientIp();
    try {
      const apps = JSON.parse(localStorage.getItem('sp_proctor_applications') || '[]');
      apps.push(this.profile);
      localStorage.setItem('sp_proctor_applications', JSON.stringify(apps));
    } catch (e) { /* non-fatal */ }

    // Registration issues the per-course SDC proctor code.
    let code = null;
    try {
      const r = await fetch('/api/proctor-code/issue', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.profile)
      });
      const data = await r.json();
      if (data && data.code) code = data.code;
    } catch (e) { /* non-fatal */ }

    this.issuedCode = code;
    if (code) {
      localStorage.setItem('sp_proctor_code', code.codeId);
      localStorage.setItem('proctor_approved', 'true');
    }

    document.querySelectorAll('.view-step').forEach(el => el.classList.remove('active'));
    successStep.classList.add('active');
    document.getElementById('flow-title').textContent = 'Welcome Aboard';
    document.getElementById('flow-subtitle').textContent = '';

    const codeEl = document.getElementById('reg-code-value');
    const expEl = document.getElementById('reg-code-expiry');
    if (code) {
      if (codeEl) codeEl.textContent = code.codeId;
      if (expEl) expEl.textContent = code.expiresAt
        ? `Certified for ${code.course || 'proctoring'} · Valid until ${new Date(code.expiresAt).toLocaleDateString()}`
        : '';
    } else {
      if (codeEl) codeEl.textContent = 'Issued — see your profile';
    }
  }
};

// Auto-enter renewal mode when arriving with ?mode=renew
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'renew') {
    authFlow.startRenewal();
  }
});

// Enable "Submit for Approval" only when BOTH the NDA and T&C are signed.
document.addEventListener('DOMContentLoaded', () => {
  const nda = document.getElementById('nda-checkbox');
  const tc = document.getElementById('tc-checkbox');
  const btnSubmit = document.getElementById('btn-reg-3');
  function sync() {
    if (btnSubmit) btnSubmit.disabled = !(nda && nda.checked && tc && tc.checked);
  }
  if (nda) nda.addEventListener('change', sync);
  if (tc) tc.addEventListener('change', sync);
});
