/* ==========================================================================
   SDC CANDIDATE LEARNING PLATFORM - INTERACTIVE ENGINE (WCAG 2.2 AA)
   ========================================================================== */

const SDC_LOGO_B64 = 'data:image/png;base64,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';

let CANDIDATE_STATE = {
  name: "Alex Rivera",
  email: "alex@student.edu",
  examDate: null,
  learningProgress: 0,
  theme: "light",
  flowMode: "candidate",
  // Day zero: a freshly-registered candidate has taken no notes yet.
  notes: [],
};

// ==========================================================================
// TIME TRACKING
// ==========================================================================
function initTimeTracking() {
  const today = new Date().toISOString().split('T')[0];
  let timeData = JSON.parse(localStorage.getItem('cand_time_tracking') || '{}');
  
  if (!timeData[today]) {
    timeData[today] = 0; // seconds
  }

  function updateDisplay() {
    const timeDisplay = document.getElementById('time-spent-display');
    const lmTimeDisplay = document.getElementById('lm-time-display');
    const seconds = timeData[today];
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const timeString = `${hours}h ${minutes}m ${secs}s`;

    if (timeDisplay) {
      timeDisplay.textContent = `Time spent today: ${timeString}`;
    }
    if (lmTimeDisplay) {
      lmTimeDisplay.textContent = `${hours}h ${minutes}m`;
    }
  }

  setInterval(() => {
    if (!document.hidden) {
      timeData = JSON.parse(localStorage.getItem('cand_time_tracking') || '{}');
      if (!timeData[today]) timeData[today] = 0;
      timeData[today] += 1;
      localStorage.setItem('cand_time_tracking', JSON.stringify(timeData));
      updateDisplay();
    }
  }, 1000);
  
  updateDisplay();
}

// ==========================================================================
// INIT & KEYBOARD ACCESSIBILITY
// ==========================================================================
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('bypass') === 'true') {
    const mainHeader = document.getElementById("main-header");
    if (mainHeader) mainHeader.classList.remove("hidden");
    document.getElementById("main-nav").classList.remove("hidden");
    navigateTo(urlParams.get('view') === 'learning' ? 'cand-learn' : 'cand-home');
  }

  // Email "I Agree" link: confirm the dual-email association and land on profile.
  if (urlParams.get('action') === 'approve-emails') {
    const p = loadCandProfile();
    p.secondaryStatus = 'active';
    saveCandProfile(p);
    if (typeof spLogEmail === 'function') spLogEmail('Dual Email Association — Confirmed');
    const mh = document.getElementById("main-header"); if (mh) mh.classList.remove("hidden");
    const mn = document.getElementById("main-nav"); if (mn) mn.classList.remove("hidden");
    navigateTo('cand-profile');
    const code = urlParams.get('code') || candVoucherCode();
    if (typeof spToast === 'function') spToast(`Your email addresses are now linked to voucher ${code}.`, 'success');
  }

  // Theme toggles live in several shells (header on #globalThemeToggle, plus any
  // future .theme-toggle). Bind them all and keep every toggle's icon in sync.
  const themeToggles = Array.from(
    document.querySelectorAll(".theme-toggle, #globalThemeToggle")
  );
  const syncThemeIcons = () => {
    const next = CANDIDATE_STATE.theme === "light" ? "dark_mode" : "light_mode";
    themeToggles.forEach((t) => {
      const icon = t.querySelector(".material-icons, .material-icons-outlined");
      if (icon) icon.textContent = next;
    });
  };
  if (localStorage.getItem("cand_theme")) {
    CANDIDATE_STATE.theme = localStorage.getItem("cand_theme");
    document.documentElement.setAttribute("data-t", CANDIDATE_STATE.theme);
  }
  syncThemeIcons();
  themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      CANDIDATE_STATE.theme = CANDIDATE_STATE.theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-t", CANDIDATE_STATE.theme);
      localStorage.setItem("cand_theme", CANDIDATE_STATE.theme);
      syncThemeIcons();
    });
  });

  // Handle flowMode based on Port
    const loginMainTitle = document.getElementById("login-main-title");
    const headerAppTitle = document.getElementById("header-app-title");
    
    if (window.location.port === "3003") {
      CANDIDATE_STATE.flowMode = "in-class";
      if (loginMainTitle) loginMainTitle.textContent = "Login for Candidate";
      if (headerAppTitle) headerAppTitle.textContent = "SDC Certification Learning Material - Culinary Institute";
    } else if (window.location.port === "3002") {
      CANDIDATE_STATE.flowMode = "online";
      if (loginMainTitle) loginMainTitle.textContent = "Online Exam";
      if (headerAppTitle) headerAppTitle.textContent = "Online Portal";
    } else {
    CANDIDATE_STATE.flowMode = "candidate";
  }

  // Global Keyboard listener for custom interactive elements
  document.addEventListener("keydown", (e) => {
    if (
      (e.key === "Enter" || e.key === " ") &&
      e.target.getAttribute("role") === "button"
    ) {
      e.preventDefault();
      e.target.click();
    }
  });

  // Bind Navigation
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      navigateTo(e.currentTarget.getAttribute("data-target"));
    });
  });

  // Search Listener
  const searchInp = document.getElementById("ai-search-input");
  if (searchInp) {
    searchInp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") performAISearch();
    });
  }

  // Escape closes whichever full-screen overlay is open (secondary exit path
  // alongside each overlay's back/close button).
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const overlays = [
      ["credential-hub-overlay", closeCredentialHub],
      ["reader-overlay", closeReader],
      ["video-overlay", closeVideo],
      ["audio-overlay", closeAudio],
      ["flashcard-overlay", closeFlashcards],
    ];
    for (const [id, close] of overlays) {
      const el = document.getElementById(id);
      if (el && el.classList.contains("open") && typeof close === "function") {
        close();
        e.preventDefault();
        break;
      }
    }
  });

  renderNotes();
  initTimeTracking();
});

// ==========================================================================
// ROUTING & FOCUS MANAGEMENT (WCAG)
// ==========================================================================
function navigateTo(viewId) {
  document
    .querySelectorAll(".view-panel")
    .forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((n) => {
    n.classList.remove("active");
    n.setAttribute("aria-current", "false");
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
    target.focus(); // Shift focus to new view for screen readers
    window.scrollTo(0, 0);
  }

  const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
  if (navBtn) {
    navBtn.classList.add("active");
    navBtn.setAttribute("aria-current", "page");
  }

  if (viewId === "cand-home") updateDashboard();
  if (viewId === "cand-profile" && typeof renderProfileEmails === "function") renderProfileEmails();
}

// ==========================================================================
// PHASE 1: FORM VALIDATION & ANCHOR
// ==========================================================================
// New-candidate signup (day zero): create a fresh account and land in the
// portal with empty progress — no voucher redeemed, no exam booked yet.
function handleCandidateSignup(e) {
  if (e) e.preventDefault();
  CANDIDATE_STATE.learningProgress = 0;
  CANDIDATE_STATE.notes = [];
  CANDIDATE_STATE.examDate = new Date(); // so the dashboard renders
  const mainHeader = document.getElementById("main-header");
  if (mainHeader) mainHeader.classList.remove("hidden");
  const mainNav = document.getElementById("main-nav");
  if (mainNav) mainNav.classList.remove("hidden");
  navigateTo("cand-home");
  if (typeof checkVoucherStatus === "function") checkVoucherStatus();
  if (typeof spToast === "function") spToast("Welcome! Redeem a voucher to start your learning.", "success");
}

// Toggle between the sign-in and create-account steps on the auth card.
function showSignupStep(e) {
  if (e) e.preventDefault();
  const ls = document.getElementById("login-step");
  const ss = document.getElementById("signup-step");
  if (ls) ls.style.display = "none";
  if (ss) ss.style.display = "block";
}

function showLoginStep(e) {
  if (e) e.preventDefault();
  const ls = document.getElementById("login-step");
  const ss = document.getElementById("signup-step");
  if (ss) ss.style.display = "none";
  if (ls) ls.style.display = "block";
}

// Reveal/hide the optional voucher-code field on the create-account form.
function toggleSignupVoucher(e) {
  if (e) e.preventDefault();
  const panel = document.getElementById("signup-voucher-panel");
  const toggle = document.getElementById("signup-voucher-toggle");
  if (!panel) return;
  const open = panel.style.display !== "none" && panel.style.display !== "";
  panel.style.display = open ? "none" : "block";
  if (toggle) {
    const icon = open ? "redeem" : "expand_less";
    toggle.innerHTML = `<i aria-hidden="true" class="material-icons" style="font-size:18px;">${icon}</i> Add a voucher code`;
  }
  if (!open) { const inp = document.getElementById("signup-voucher-code"); if (inp) inp.focus(); }
}

// Create a brand-new candidate account. If a voucher code was added, it's
// applied to the new account (same effect as redeeming on the login screen),
// then the candidate lands in the portal.
async function handleSignupSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById("signup-name");
  const email = document.getElementById("signup-email");
  const pass = document.getElementById("signup-pass");

  let valid = true;
  if (name && !name.value.trim()) { name.classList.add("error"); valid = false; } else if (name) { name.classList.remove("error"); }
  if (email && !email.value.includes("@")) { email.classList.add("error"); valid = false; } else if (email) { email.classList.remove("error"); }
  if (pass && pass.value.length < 4) { pass.classList.add("error"); valid = false; } else if (pass) { pass.classList.remove("error"); }
  if (!valid) return;

  // Optional voucher attached to the new account.
  const vEl = document.getElementById("signup-voucher-code");
  const vPanel = document.getElementById("signup-voucher-panel");
  const code = (vPanel && vPanel.style.display !== "none" && vEl) ? vEl.value.trim() : "";
  let voucherApplied = false;
  if (code) {
    try { voucherApplied = await applyLoginVoucher(code); } catch (_) {}
  }

  // Reflect the new account on the top-bar profile.
  const trig = document.getElementById("profileDropdownBtn");
  if (trig) {
    const n = trig.querySelector(".name"), em = trig.querySelector(".email");
    if (n && name && name.value.trim()) n.textContent = name.value.trim();
    if (em && email && email.value.trim()) em.textContent = email.value.trim();
  }

  // Create the account (mirrors handleCandidateSignup) and enter the portal.
  CANDIDATE_STATE.learningProgress = 0;
  CANDIDATE_STATE.notes = [];
  CANDIDATE_STATE.examDate = new Date();
  const mainHeader = document.getElementById("main-header");
  if (mainHeader) mainHeader.classList.remove("hidden");
  const mainNav = document.getElementById("main-nav");
  if (mainNav) mainNav.classList.remove("hidden");
  navigateTo("cand-home");
  if (typeof checkVoucherStatus === "function") checkVoucherStatus();
  if (typeof spToast === "function") {
    spToast(voucherApplied ? "Welcome! Your voucher has been added to your account." : "Welcome! Redeem a voucher to start your learning.", "success");
  }
}

function handleForgotPassword(e) {
  if (e) e.preventDefault();
  const emailEl = document.getElementById("login-email");
  const email = emailEl ? emailEl.value.trim() : "";
  if (!email) {
    if (emailEl) emailEl.focus();
    showToast("Enter your email above, then tap Forgot password.");
    return;
  }
  showToast("Password reset link sent to " + email);
}

// Reveal/hide the optional voucher-code field on the email-login form.
function toggleLoginVoucher(e) {
  if (e) e.preventDefault();
  const panel = document.getElementById("login-voucher-panel");
  const toggle = document.getElementById("login-voucher-toggle");
  if (!panel) return;
  const open = panel.style.display !== "none" && panel.style.display !== "";
  panel.style.display = open ? "none" : "block";
  if (toggle) {
    const icon = open ? "redeem" : "expand_less";
    toggle.innerHTML = `<i aria-hidden="true" class="material-icons" style="font-size:18px;">${icon}</i> I already have a voucher code`;
  }
  if (!open) { const inp = document.getElementById("login-voucher-code"); if (inp) inp.focus(); }
}

// Verify a voucher entered on the email-login screen and apply it to the
// candidate's exam — same proctor-flow effect as signing in with a voucher
// (handleVoucherLogin). Returns true on success, false if it can't be verified.
async function applyLoginVoucher(code) {
  try {
    const res = await fetch(`${SP_API}/api/vouchers/${encodeURIComponent(code)}/activate`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({})
    });
    const data = await res.json();
    if (!res.ok || !data.success) return false;
    const voucher = data.voucher;
    if (voucher.materialId) spAddOwnedMaterial(voucher.materialId);
    const isNet = voucher.currentType === "Internet Proctored";
    Object.assign(spExam, {
      type: isNet ? "online" : "in-class",
      examName: voucher.cert || spExam.examName,
      paymentRequired: false,
      paymentStatus: isNet ? "paid" : "not_required",
      proctorUnlocked: isNet,
      voucherId: voucher.voucherId,
      voucherType: voucher.currentType
    });
    spSaveExam(spExam);
    return true;
  } catch (err) {
    console.error("Login voucher apply failed:", err);
    return false;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const form = document.getElementById("login-form");
  const email = document.getElementById("login-email");
  const pass = document.getElementById("login-pass");

  let valid = true;
  if (!email.value.includes("@")) {
    email.classList.add("error");
    valid = false;
  } else {
    email.classList.remove("error");
  }
  if (pass.value.length < 4) {
    pass.classList.add("error");
    valid = false;
  } else {
    pass.classList.remove("error");
  }

  if (!valid) return;

  const btn = document.getElementById("login-btn");
  const origBtn = btn.innerHTML;
  btn.innerHTML = `<i class="material-icons spin">sync</i> Authenticating...`;
  btn.disabled = true;

  // Optional voucher code entered at sign-in: verify it and apply it to the
  // exam (proctor flow) before completing login. Block login if it's invalid.
  const voucherInp = document.getElementById("login-voucher-code");
  const voucherErr = document.getElementById("login-voucher-error");
  const code = voucherInp ? voucherInp.value.trim() : "";
  let voucherApplied = false;
  if (code) {
    if (voucherErr) voucherErr.style.display = "none";
    voucherApplied = await applyLoginVoucher(code);
    if (!voucherApplied) {
      btn.innerHTML = origBtn;
      btn.disabled = false;
      if (voucherInp) voucherInp.classList.add("error");
      if (voucherErr) {
        voucherErr.style.display = "block";
        voucherErr.innerText = "We couldn't verify that voucher code. Please check it and try again.";
      }
      return;
    }
    if (voucherInp) voucherInp.classList.remove("error");
  }

  setTimeout(() => {
    // Bypass onboarding step and go straight to dashboard
    CANDIDATE_STATE.examDate = new Date(); // Set a default date so dashboard renders
    const mainHeader = document.getElementById("main-header");
    if (mainHeader) mainHeader.classList.remove("hidden");
    document.getElementById("main-nav").classList.remove("hidden");

    navigateTo("cand-home");
    checkVoucherStatus();
    if (voucherApplied) {
      try { renderExamCard(); } catch (err) {}
      if (typeof spToast === "function") spToast("Voucher applied — your exam is set up and ready.", "success");
    }

    setTimeout(() => {
      animateProgressRing(40);
    }, 500);
  }, 600);
}

// ==========================================================================
// PHASE 2: DASHBOARD
// ==========================================================================
function updateDashboard() {
  if (!CANDIDATE_STATE.examDate) return;

  const now = new Date();
  const diffTime = Math.abs(CANDIDATE_STATE.examDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const cd = document.getElementById("dash-countdown");
  cd.textContent = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
  document.getElementById("dash-date-display").textContent =
    CANDIDATE_STATE.examDate.toLocaleDateString();

  if (diffDays <= 0) {
    cd.textContent = "TODAY";
    cd.style.color = "var(--err)";
  }
}

function animateProgressRing(percent) {
  CANDIDATE_STATE.learningProgress = percent;
  
  // Dashboard Progress
  const circle = document.getElementById("main-prog-ring");
  const text = document.getElementById("main-prog-text");
  if (circle && text) {
    const r = circle.r.baseVal.value;
    const circ = r * 2 * Math.PI;
    const offset = circ - (percent / 100) * circ;
    circle.style.strokeDasharray = circ;
    circle.style.strokeDashoffset = offset;
    text.textContent = `${percent}%`;
  }

  // Learning Module Progress
  const lmCircle = document.getElementById("lm-prog-ring");
  const lmText = document.getElementById("lm-prog-text");
  if (lmCircle && lmText) {
    const r = lmCircle.r.baseVal.value;
    const circ = r * 2 * Math.PI;
    const offset = circ - (percent / 100) * circ;
    lmCircle.style.strokeDasharray = circ;
    lmCircle.style.strokeDashoffset = offset;
    lmText.textContent = `${percent}%`;
  }
}

// ==========================================================================
// VOUCHER UPGRADE
// ==========================================================================
async function checkVoucherStatus() {
  try {
    const res = await fetch('/api/vouchers');
    const vouchers = await res.json();
    const myVoucher = vouchers.find(v => v.assignedToCandidateId === 'cand_001');
    
    if (myVoucher) {
      if (myVoucher.currentType === 'In-House' && !myVoucher.upgrade.isUpgraded) {
        document.getElementById('voucher-upgrade-container').style.display = 'block';
      } else {
        document.getElementById('voucher-upgrade-container').style.display = 'none';
        document.querySelector('.scheduler-label').textContent = 'Upcoming Internet Proctored Exam';
      }
    }
  } catch (err) {
    console.error('Error fetching vouchers:', err);
  }
}

async function handleVoucherUpgrade() {
  document.getElementById('payment-modal').classList.add('active', 'open');
}

async function processVoucherPayment() {
  try {
    const btn = document.getElementById('pay-upgrade-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="material-icons spin">sync</i> Processing...`;
    btn.disabled = true;

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1200));

    // Upgrade the candidate's actual voucher (self-purchased or assigned).
    const vid = (typeof spExam !== 'undefined' && spExam.voucherId) ? spExam.voucherId : 'VCH-A1001';
    const res = await fetch(`/api/vouchers/${vid}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee: 25.00, paidBy: 'Candidate' })
    });

    if (res.ok) {
      document.getElementById('payment-modal').classList.remove('active', 'open');
      btn.innerHTML = originalText;
      btn.disabled = false;

      // Show success notification (if standard alert is okay, otherwise we can just update UI)
      alert("Payment successful! Voucher upgraded to Internet Proctored.");

      // Hide the upgrade banner and update the exam status label
      document.getElementById('voucher-upgrade-container').style.display = 'none';
      const label = document.querySelector('.scheduler-label');
      if (label) label.textContent = 'Upcoming Internet Proctored Exam';

      // Update the badge visually
      const icon = document.querySelector('.scheduler-icon-wrapper .material-icons');
      if(icon) icon.textContent = 'computer';

      // Upgraded → internet self-service: paid + unlocked so it launches now.
      if (typeof spExam !== 'undefined') {
        Object.assign(spExam, { type: 'online', paymentRequired: false, paymentStatus: 'paid', proctorUnlocked: true, voucherType: 'Internet Proctored' });
        spSaveExam(spExam);
        try { renderExamCard(); } catch (e) {}
      }
    } else {
      alert("Payment failed. Please check your card details.");
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  } catch (err) {
    console.error('Error processing payment:', err);
    alert('Network error. Please try again.');
    document.getElementById('pay-upgrade-btn').disabled = false;
  }
}

// ==========================================================================
// AI SEARCH (NEW)
// ==========================================================================
function performAISearch() {
  const inp = document.getElementById("ai-search-input");
  const panel = document.getElementById("ai-result");
  const ans = document.getElementById("ai-answer-text");

  if (!inp.value) return;

  panel.classList.remove("show");
  ans.textContent = "Retrieving from authorized RAG index...";
  panel.classList.add("show");

  setTimeout(() => {
    if (inp.value.toLowerCase().includes("danger zone")) {
      ans.textContent =
        "The temperature danger zone is between 41°F and 135°F (5°C to 57°C). Pathogens grow most rapidly in this range. (Source: The Food Protection Manager's Handbook - Concise Edition, Ch 1)";
    } else {
      ans.textContent =
        "According to FDA regulations, ensure all surfaces are sanitized and raw meats are kept on bottom shelves to prevent cross-contamination. (Source: The Food Protection Manager's Handbook, Ch 4)";
    }
  }, 1200);
}

// ==========================================================================
// FLASHCARDS (NEW)
// ==========================================================================
function flipCard() {
  document.getElementById("active-flashcard").classList.toggle("flipped");
}

function rateCard(rating) {
  // Simulate rating recording and moving to next card
  showToast(`Recorded: ${rating}. Loading next card...`);
  const fc = document.getElementById("active-flashcard");
  fc.classList.remove("flipped");

  setTimeout(() => {
    document.getElementById("fc-q").textContent =
      "What is the minimum holding temp for hot food?";
    document.getElementById("fc-a").textContent = "135°F (57°C)";
  }, 300);
}

// ==========================================================================
// NOTES CRUD (NEW)
// ==========================================================================
function renderNotes() {
  const container = document.getElementById("notes-list-container");
  if (!container) return;
  container.innerHTML = "";

  if (CANDIDATE_STATE.notes.length === 0) {
    container.innerHTML = `<p style="color:var(--on-sur-var); text-align:center;">No notes yet. Start highlighting or create one!</p>`;
    return;
  }

  CANDIDATE_STATE.notes.forEach((note) => {
    container.innerHTML += `
      <div class="note-card" tabindex="0">
        <div class="note-actions">
          <button class="icon-btn" onclick="deleteNote(${note.id})" aria-label="Delete Note"><i class="material-icons" style="font-size:16px; color:var(--err);">delete</i></button>
        </div>
        <div style="font-size: 12px; color: var(--on-sur-var); margin-bottom: 8px; font-weight: 600;">${note.topic}</div>
        <div class="note-text">${note.text}</div>
      </div>
    `;
  });
}

function openNoteModal() {
  document.getElementById("note-topic").value = "";
  document.getElementById("note-body").value = "";
  const modal = document.getElementById("note-modal");
  modal.classList.add("open");
  document.getElementById("note-topic").focus(); // WCAG Focus trap start
}

function closeNoteModal() {
  document.getElementById("note-modal").classList.remove("open");
}

function saveNote() {
  const topic = document.getElementById("note-topic").value || "General";
  const text = document.getElementById("note-body").value;
  if (!text) return;

  CANDIDATE_STATE.notes.push({ id: Date.now(), topic, text });
  renderNotes();
  closeNoteModal();
  showToast("Note saved successfully.");
}

function deleteNote(id) {
  if (confirm("Delete this note?")) {
    CANDIDATE_STATE.notes = CANDIDATE_STATE.notes.filter((n) => n.id !== id);
    renderNotes();
  }
}

// ==========================================================================
// READER OVERLAY
// ==========================================================================
let currentReaderPage = 0;
const ebookPages = [
  {
    chapter: "Chapter 1: The Danger Zone",
    title: "1.0 Overview of the Danger Zone",
    content: `
      <h2 style="margin-bottom: 24px; font-family: 'Georgia', serif; font-size: 28px; font-weight: normal; color: #333;">Chapter 1: The Danger Zone</h2>
      <p style="line-height:1.8; font-family: 'Georgia', serif; margin-bottom: 20px;">
        <span style="float: left; font-size: 64px; line-height: 52px; padding-top: 4px; padding-right: 8px; padding-left: 3px; font-family: 'Georgia', serif; color: var(--pri);">T</span>he temperature danger zone is the critical temperature range in which foodborne pathogens and bacteria can multiply rapidly. Food safety agencies worldwide define the danger zone as roughly <span class="highlighted-text" tabindex="0" onclick="selectPredefinedHighlight('41 to 135 degrees Fahrenheit (5 to 57 °C)')">41 to 135 degrees Fahrenheit (5 to 57 °C)</span>.
      </p>
      <p style="line-height:1.8; font-family: 'Georgia', serif;">
        When potentially hazardous foods (such as meat, poultry, dairy, and cooked carbohydrates) remain in this zone for more than four hours, the bacterial load can reach dangerous levels, leading to foodborne illnesses. Understanding and strictly monitoring time and temperature controls is the foundation of any effective HACCP plan.
      </p>
    `,
  },
  {
    chapter: "Chapter 1: The Danger Zone",
    title: "1.1 Time & Temp Controls",
    content: `
      <h3 style="margin-bottom: 20px; font-family: 'Georgia', serif; font-size: 22px; font-weight: normal; color: #333;">Time and Temperature Controls</h3>
      <p style="line-height:1.8; font-family: 'Georgia', serif; margin-bottom: 20px;">
        To prevent rapid bacterial growth, food must be kept out of the danger zone. This means hot foods must be held at 135°F (57°C) or higher, and cold foods must be held at 41°F (5°C) or lower. 
      </p>
      <div style="background: #fdfbf7; border-left: 4px solid var(--sec); padding: 20px; margin: 24px 0; font-family: 'Georgia', serif; font-size:15px; line-height: 1.6;">
        <strong>Key Principle:</strong> The 2-Hour / 4-Hour Rule. Food held between 41°F and 135°F for up to 2 hours can be refrigerated or used immediately. Food in this zone for up to 4 hours must be consumed immediately or thrown away. Beyond 4 hours, it must be discarded without exception.
      </div>
    `,
  },
  {
    chapter: "Chapter 1: The Danger Zone",
    title: "1.2 Cooling Hot Foods",
    content: `
      <h3 style="margin-bottom: 20px; font-family: 'Georgia', serif; font-size: 22px; font-weight: normal; color: #333;">Cooling Hot Foods</h3>
      <p style="line-height:1.8; font-family: 'Georgia', serif; margin-bottom: 20px;">
        Proper cooling is one of the most critical steps in food preparation. The FDA Food Code requires a two-stage cooling process for hot foods:
      </p>
      <ul style="line-height:1.8; font-family: 'Georgia', serif; margin-left: 20px; margin-bottom: 20px;">
        <li><strong>Stage 1:</strong> Cool food from 135°F to 70°F within exactly two hours.</li>
        <li><strong>Stage 2:</strong> Cool food from 70°F to 41°F or lower within the next four hours.</li>
      </ul>
      <p style="line-height:1.8; font-family: 'Georgia', serif;">
        If food does not reach 70°F within the first two hours, it must be reheated to 165°F and the cooling process restarted, or the food must be discarded immediately.
      </p>
    `,
  },
  {
    chapter: "Chapter 2: Sanitation & Hygiene",
    title: "2.0 Handwashing Requirements",
    content: `
      <h2 style="margin-bottom: 24px; font-family: 'Georgia', serif; font-size: 28px; font-weight: normal; color: #333;">Chapter 2: Sanitation & Hygiene</h2>
      <p style="line-height:1.8; font-family: 'Georgia', serif; margin-bottom: 20px;">
        Personal hygiene is the single most critical factor in preventing food contamination. Food service workers must wash hands frequently and properly, especially after using the restroom, eating, smoking, or handling raw meats.
      </p>
      <p style="line-height:1.8; font-family: 'Georgia', serif;">
        The entire handwashing process must take at least <span class="highlighted-text" tabindex="0" onclick="selectPredefinedHighlight('20 seconds')">20 seconds</span>, with at least <span class="highlighted-text" tabindex="0" onclick="selectPredefinedHighlight('10 to 15 seconds')">10 to 15 seconds</span> of vigorous scrubbing with soap and warm water.
      </p>
    `,
  },
  {
    chapter: "Chapter 2: Sanitation & Hygiene",
    title: "2.1 Three-Compartment Sink Setup",
    content: `
      <h3 style="margin-bottom: 20px; font-family: 'Georgia', serif; font-size: 22px; font-weight: normal; color: #333;">Three-Compartment Sink Setup</h3>
      <p style="line-height:1.8; font-family: 'Georgia', serif; margin-bottom: 20px;">
        To clean and sanitize utensils manually, a three-compartment sink must be set up properly:
      </p>
      <ol style="line-height:1.8; font-family: 'Georgia', serif; margin-left: 20px; margin-bottom: 20px;">
        <li><strong>Sink 1 (Wash):</strong> Hot water at at least 110°F (43°C) with detergent.</li>
        <li><strong>Sink 2 (Rinse):</strong> Clean warm water.</li>
        <li><strong>Sink 3 (Sanitize):</strong> Hot water at 171°F (77°C) or chemical sanitizer (chlorine, iodine, or quats).</li>
      </ol>
      <p style="line-height:1.8; font-family: 'Georgia', serif;">
        All items must be air-dried. Never use towels to dry dishes, as it can reintroduce pathogens.
      </p>
    `,
  },
];

let currentSelection = { text: "", range: null, pageIndex: -1 };
let highlightNotes = [
  {
    id: 1,
    text: "41 to 135 degrees Fahrenheit",
    note: "Danger Zone temperatures - critical for HACCP exams!",
    page: 1,
    date: "May 27, 2026",
  },
];
let isAIDrawerOpen = false;
let activeDrawerMode = "notes";

// Selection listeners
document.addEventListener("mouseup", handleTextSelection);
document.addEventListener("touchend", handleTextSelection);

document.addEventListener("mousedown", (e) => {
  const pill = document.getElementById("reader-floating-pill");
  const overlay = document.getElementById("reader-overlay");
  if (
    pill &&
    !pill.contains(e.target) &&
    overlay &&
    overlay.classList.contains("open")
  ) {
    setTimeout(() => {
      const selection = window.getSelection().toString().trim();
      if (selection.length === 0) {
        hideFloatingPill();
      }
    }, 20);
  }
});

function handleTextSelection(e) {
  const container = document.getElementById("reader-pdf");
  const overlay = document.getElementById("reader-overlay");
  if (!container || !overlay || !overlay.classList.contains("open")) {
    hideFloatingPill();
    return;
  }

  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0 && container.contains(selection.anchorNode)) {
      currentSelection.text = selectedText;
      currentSelection.range = selection.getRangeAt(0).cloneRange();
      currentSelection.pageIndex = currentReaderPage;

      showFloatingPill(e);
    } else {
      const pill = document.getElementById("reader-floating-pill");
      if (pill && !pill.contains(e.target)) {
        hideFloatingPill();
      }
    }
  }, 10);
}

function showFloatingPill(e) {
  const pill = document.getElementById("reader-floating-pill");
  if (!pill) return;

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top - 45;

    pill.style.left = `${Math.max(10, Math.min(window.innerWidth - 240, x - pill.offsetWidth / 2))}px`;
    pill.style.top = `${Math.max(10, y + window.scrollY)}px`;
    pill.classList.add("active");
  }
}

function hideFloatingPill() {
  const pill = document.getElementById("reader-floating-pill");
  if (pill) {
    pill.classList.remove("active");
  }
}

function triggerPillAction(action) {
  if (action === "highlight") {
    highlightSelection();
  } else if (action === "note") {
    hideFloatingPill();
    toggleAIDrawer(true);
    switchDrawerMode("notes");
  } else if (action === "query") {
    hideFloatingPill();
    toggleAIDrawer(true);
    switchDrawerMode("query");
  }
}

function highlightSelection() {
  if (!currentSelection.text || !currentSelection.range) return;

  try {
    const span = document.createElement("span");
    span.className = "highlighted-text";
    span.title = "User Highlight";
    span.onclick = (e) => {
      e.stopPropagation();
      currentSelection.text = e.target.textContent;
      document.getElementById("note-selection-display").textContent =
        currentSelection.text;
      document.getElementById("query-selection-display").textContent =
        currentSelection.text;
      toggleAIDrawer(true);
    };
    currentSelection.range.surroundContents(span);
    window.getSelection().removeAllRanges();
    showToast("Text highlighted!");
  } catch (err) {
    console.error("Highlight error:", err);
    showToast("Selected text loaded in drawer.");
  }
  hideFloatingPill();
}

function selectPredefinedHighlight(text) {
  currentSelection.text = text;
  currentSelection.pageIndex = currentReaderPage;
  document.getElementById("note-selection-display").textContent = text;
  document.getElementById("query-selection-display").textContent = text;
  toggleAIDrawer(true);
  showToast("Selection loaded into AI Assistant.");
}

function toggleAIDrawer(forceOpen) {
  const drawer = document.getElementById("reader-ai-drawer");
  if (!drawer) return;

  if (forceOpen !== undefined) {
    isAIDrawerOpen = forceOpen;
  } else {
    isAIDrawerOpen = !isAIDrawerOpen;
  }

  if (isAIDrawerOpen) {
    drawer.classList.remove("collapsed");
    document.getElementById("note-selection-display").textContent =
      currentSelection.text ||
      "No text selected. Highlight text on the page to attach a note.";
    document.getElementById("query-selection-display").textContent =
      currentSelection.text ||
      "No passage selected. Highlight text on the page to ask AI about it.";
    renderHighlightNotesList();
  } else {
    drawer.classList.add("collapsed");
  }
}

function switchDrawerMode(mode) {
  activeDrawerMode = mode;
  document
    .getElementById("drawer-tab-notes")
    .classList.toggle("active", mode === "notes");
  document
    .getElementById("drawer-tab-query")
    .classList.toggle("active", mode === "query");

  document.getElementById("drawer-panel-notes").style.display =
    mode === "notes" ? "flex" : "none";
  document.getElementById("drawer-panel-query").style.display =
    mode === "query" ? "flex" : "none";

  const title = document.getElementById("drawer-mode-title");
  if (title) {
    title.textContent = mode === "notes" ? "My Notes" : "Ask AI Assistant";
  }
}

function renderHighlightNotesList() {
  const container = document.getElementById("drawer-saved-notes-list");
  if (!container) return;

  container.innerHTML = "";
  if (highlightNotes.length === 0) {
    container.innerHTML = `<div style="font-size:12px; color:var(--on-sur-var); text-align:center; padding:12px;">No notes saved yet.</div>`;
    return;
  }

  highlightNotes.forEach((hn) => {
    const div = document.createElement("div");
    div.style.background = "var(--sur-var)";
    div.style.border = "1px solid var(--glass-border)";
    div.style.borderRadius = "8px";
    div.style.padding = "10px";
    div.style.fontSize = "12px";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.gap = "6px";
    div.style.marginBottom = "8px";

    div.innerHTML = `
      <div style="font-style:italic; border-left:3px solid var(--sec); padding-left:6px; color:var(--on-sur-var); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${hn.text}"</div>
      <div style="font-weight:600; color:var(--on-sur); word-break:break-word;">${hn.note}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:var(--on-sur-var); margin-top:4px;">
        <span>Pg ${hn.page} • ${hn.date}</span>
        <button onclick="deleteHighlightNote(${hn.id})" style="border:none; background:none; color:var(--err); cursor:pointer; font-weight:700; padding:0;">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function saveHighlightNote() {
  const text = currentSelection.text || "Book Annotation";
  const noteVal = document.getElementById("note-editor").value.trim();

  if (!noteVal) {
    showToast("Please enter a note!");
    return;
  }

  const newNote = {
    id: Date.now(),
    text: text,
    note: noteVal,
    page: currentReaderPage + 1,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  highlightNotes.unshift(newNote);
  document.getElementById("note-editor").value = "";
  renderHighlightNotesList();
  showToast("Note added successfully!");
}

function deleteHighlightNote(id) {
  highlightNotes = highlightNotes.filter((hn) => hn.id !== id);
  renderHighlightNotesList();
  showToast("Note deleted.");
}

function sendAIChatMessage() {
  const chatInput = document.getElementById("chat-input");
  if (!chatInput) return;

  const message = chatInput.value.trim();
  if (!message) return;

  appendChatBubble(message, "user");
  chatInput.value = "";

  setTimeout(() => {
    const response = getSimulatedAIResponse(message, currentSelection.text);
    appendChatBubble(response, "ai");
  }, 600);
}

function appendChatBubble(text, sender) {
  const container = document.getElementById("chat-history-container");
  if (!container) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function getSimulatedAIResponse(userMessage, contextText) {
  const msg = userMessage.toLowerCase();
  const ctx = (contextText || "").toLowerCase();

  if (ctx.includes("danger zone") || msg.includes("danger zone")) {
    return "The Temperature Danger Zone is 41°F to 135°F (5°C to 57°C). Bacteria grow rapidly in this range. Hot foods must be held at 135°F+ and cold foods at 41°F-.";
  }
  if (
    ctx.includes("cooling") ||
    msg.includes("cooling") ||
    msg.includes("cool")
  ) {
    return "FDA Food Code cooling standards: Cool hot food from 135°F to 70°F within 2 hours, and then from 70°F to 41°F or lower within the next 4 hours (6 hours total).";
  }
  if (
    ctx.includes("sink") ||
    msg.includes("sink") ||
    msg.includes("compartment") ||
    msg.includes("sanitize")
  ) {
    return "Three-compartment manual dishwashing: 1. Wash (110°F detergent). 2. Rinse (clean water). 3. Sanitize (171°F hot water for 30s or chemical solution like chlorine/iodine/quats). Always air dry.";
  }
  if (
    ctx.includes("seconds") ||
    msg.includes("wash hands") ||
    ctx.includes("handwashing")
  ) {
    return "Proper handwashing takes at least 20 seconds total. You must scrub your hands, wrists, and exposed forearms vigorously with soap and warm water for at least 10-15 seconds.";
  }

  return "That is an important food safety question. In a HACCP program, controlling time, temperature, personal hygiene, and surface sanitation are critical to passing the exam. Let me know if you need specific limits!";
}

function setReaderFontSize(size) {
  document.documentElement.style.setProperty("--reader-font-size", size + "px");
}

function toggleTOC() {
  const sidebar = document.getElementById("reader-toc-sidebar");
  const toggleBtn = document.getElementById("toc-toggle-btn");
  if (!sidebar) return;

  const isCollapsed = sidebar.classList.contains("collapsed");
  if (isCollapsed) {
    sidebar.classList.remove("collapsed");
    if (toggleBtn) toggleBtn.style.display = "none";
  } else {
    sidebar.classList.add("collapsed");
    if (toggleBtn) toggleBtn.style.display = "block";
  }
}

function renderTOC() {
  const listContainer = document.getElementById("reader-toc-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";
  let lastChapter = "";

  ebookPages.forEach((page, index) => {
    if (page.chapter !== lastChapter) {
      lastChapter = page.chapter;
      const headerLi = document.createElement("li");
      headerLi.style.padding = "12px 16px 4px 16px";
      headerLi.style.fontSize = "11px";
      headerLi.style.fontWeight = "700";
      headerLi.style.textTransform = "uppercase";
      headerLi.style.color = "var(--on-sur-var)";
      headerLi.style.opacity = "0.6";
      headerLi.textContent = lastChapter;
      listContainer.appendChild(headerLi);
    }

    const itemLi = document.createElement("li");
    itemLi.className = `toc-item ${index === currentReaderPage ? "active" : ""}`;
    itemLi.textContent = page.title;
    itemLi.onclick = () => {
      jumpToReaderPage(index + 1);
    };
    listContainer.appendChild(itemLi);
  });
}

function openReader(title = "The Food Protection Manager's Handbook") {
  document.getElementById("reader-overlay").classList.add("open");
  document.getElementById("reader-pdf").style.display = "block";
  document.getElementById("reader-title").textContent = title;

  currentReaderPage = 0;
  currentSelection = { text: "", range: null, pageIndex: -1 };
  hideFloatingPill();
  toggleAIDrawer(false);

  renderTOC();
  renderReaderPage();
}

function renderReaderPage() {
  const contentEl = document.getElementById("reader-pdf");
  const indicator = document.getElementById("reader-page-indicator");
  const progress = document.getElementById("reader-progress-bar");
  const progressPercent = document.getElementById("reader-progress-percent");
  const pageJumpInput = document.getElementById("page-jump-input");

  if (!contentEl) return;

  contentEl.innerHTML = ebookPages[currentReaderPage].content;

  if (indicator) {
    indicator.textContent = `Pg ${currentReaderPage + 1} / ${ebookPages.length}`;
  }
  if (pageJumpInput) {
    pageJumpInput.value = currentReaderPage + 1;
  }

  const pct = Math.round(((currentReaderPage + 1) / ebookPages.length) * 100);
  if (progress) progress.style.width = `${pct}%`;
  if (progressPercent) progressPercent.textContent = `${pct}%`;

  const tocItems = document.querySelectorAll(".toc-item");
  tocItems.forEach((item, index) => {
    item.classList.toggle("active", index === currentReaderPage);
  });

  const wrap = document.querySelector(".reader-content-wrap");
  if (wrap) wrap.scrollTop = 0;

  contentEl.focus();
}

function readerPage(dir) {
  const newPage = currentReaderPage + dir;
  if (newPage >= 0 && newPage < ebookPages.length) {
    currentReaderPage = newPage;
    renderReaderPage();
  }
}

function jumpToReaderPage(pageNum) {
  if (isNaN(pageNum) || pageNum < 1 || pageNum > ebookPages.length) {
    showToast(`Invalid page. Select between 1 and ${ebookPages.length}`);
    return;
  }
  currentReaderPage = pageNum - 1;
  renderReaderPage();
}

function closeReader() {
  document.getElementById("reader-overlay").classList.remove("open");
  hideFloatingPill();
  toggleAIDrawer(false);
}

// ==========================================================================
// MEDIA OVERLAYS
// ==========================================================================
const VIDEO_DETAILS = {
  "Temperature Danger Zone Explained": {
    desc: "This lecture covers critical Temperature Danger Zone rules for commercial kitchen environments, detailing how bacteria multiply and how to monitor food temperatures.",
    views: "12,543 views",
    published: "3 weeks ago",
    length: "15:00",
    transcript: [
      { time: "0:00", text: "Welcome to SDC Certifications. Today we are discussing temperature controls." },
      { time: "1:15", text: "The Temperature Danger Zone is defined as the range between 41 degrees and 135 degrees Fahrenheit." },
      { time: "2:40", text: "Pathogens grow rapidly within this temperature range, especially between 70 and 125 degrees." },
      { time: "5:12", text: "To prevent foodborne illness, we must keep hot foods hot above 135 and cold foods cold below 41." },
      { time: "7:30", text: "Use calibrated stem thermometers to check internal temperatures regularly." },
      { time: "9:05", text: "This ensures the safety of all dishes before serving them to the guests." }
    ]
  },
  "Cross-Contamination Prevention": {
    desc: "Learn about the methods to prevent cross-contamination in prep areas, color-coded cutting board standards, and proper refrigerator layout protocols.",
    views: "8,912 views",
    published: "1 month ago",
    length: "22:00",
    transcript: [
      { time: "0:00", text: "In this segment, we will cover cross-contamination prevention guidelines." },
      { time: "2:10", text: "Always use separate cutting boards for raw meats and ready-to-eat products." },
      { time: "4:45", text: "Standard color-coding includes red for raw meats, green for fresh fruits and vegetables." },
      { time: "7:20", text: "In the walk-in refrigerator, raw poultry must always be stored on the bottom shelf." },
      { time: "9:55", text: "This prevents raw juices from dripping onto cooked food items beneath them." },
      { time: "12:15", text: "Wash and sanitize all food contact surfaces after finishing each prep task." }
    ]
  },
  "Proper Handwashing Techniques": {
    desc: "A complete step-by-step video guide showing proper hand scrubbing, timing, soap application, drying, and restroom exit protocols for food managers.",
    views: "23,109 views",
    published: "5 days ago",
    length: "08:00",
    transcript: [
      { time: "0:00", text: "Proper handwashing is the single most critical practice in food safety." },
      { time: "1:30", text: "Wet your hands and arms with warm water, applying enough soap to build a good lather." },
      { time: "3:00", text: "Scrub hands, wrists, and forearms vigorously for at least 10 to 15 seconds." },
      { time: "4:45", text: "Rinse hands and arms thoroughly under warm running water." },
      { time: "6:15", text: "Dry hands completely with a single-use paper towel or warm air dryer." },
      { time: "7:30", text: "Use a clean paper towel to turn off the faucet and open the exit door." }
    ]
  }
};

function openVideo(title) {
  const details = VIDEO_DETAILS[title] || {
    desc: "This lecture covers critical regulatory and sanitation requirements for the Food Safety Manager certification.",
    views: "10K views",
    published: "1 month ago",
    length: "10:00",
    transcript: [
      { time: "0:00", text: "No transcript available for this video." }
    ]
  };

  // 1. Update Title and Header
  const titleEl = document.getElementById("active-video-title");
  if (titleEl) titleEl.textContent = title;
  
  // Update mock bg image depending on thumbnail
  const currentVideoData = LM_DATA.videos.find(v => v.title === title);
  const bgImgEl = document.getElementById("yt-mock-bg-img");
  if (bgImgEl && currentVideoData) {
    bgImgEl.style.backgroundImage = `url('${currentVideoData.thumb}')`;
  }

  // 2. Update Details and Description
  const descBox = document.querySelector(".youtube-description-box");
  if (descBox) {
    descBox.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 8px; font-size: 13px; color: #aaa;">
        <span>${details.views}</span> &bull; <span>${details.published}</span> &bull; <span style="color: #3ea6ff; font-weight: 500;">#FoodSafety</span>
      </div>
      <p id="active-video-desc">${details.desc}</p>
    `;
  }

  // 3. Render Seekable Transcript
  const transcriptEl = document.getElementById("active-video-transcript");
  if (transcriptEl) {
    transcriptEl.innerHTML = "";
    details.transcript.forEach((t) => {
      const line = document.createElement("div");
      line.className = "transcript-line";
      line.innerHTML = `
        <span class="transcript-timestamp">${t.time}</span>
        <span class="transcript-text">${t.text}</span>
      `;
      line.addEventListener("click", () => {
        showToast(`Seeking to ${t.time}...`);
        const timeDisplay = document.getElementById("yt-time-display");
        if (timeDisplay) {
          timeDisplay.textContent = `${t.time} / ${details.length}`;
        }
      });
      transcriptEl.appendChild(line);
    });
  }

  // 4. Update Time Display
  const timeDisplay = document.getElementById("yt-time-display");
  if (timeDisplay) {
    timeDisplay.textContent = `00:00 / ${details.length}`;
  }

  // 5. Render Related Sidebar Playlist
  const sidebarList = document.getElementById("youtube-sidebar-list");
  if (sidebarList) {
    sidebarList.innerHTML = "";
    LM_DATA.videos.forEach((video) => {
      const card = document.createElement("div");
      card.className = `yt-sidebar-card ${video.title === title ? "active" : ""}`;
      card.innerHTML = `
        <div class="yt-sidebar-thumb" style="background-image: url('${video.thumb}');"></div>
        <div class="yt-sidebar-info">
          <div class="yt-sidebar-title">${video.title}</div>
          <div class="yt-sidebar-meta">SDC Academy</div>
          <div class="yt-sidebar-meta">${video.totalLength} mins</div>
        </div>
      `;
      card.addEventListener("click", () => {
        openVideo(video.title);
      });
      sidebarList.appendChild(card);
    });
  }

  // 6. Add open class to show modal
  document.getElementById("video-overlay").classList.add("open");
}

function closeVideo() {
  document.getElementById("video-overlay").classList.remove("open");
}

function openAudio(title, thumbSrc) {
  document.getElementById("audio-title").textContent = title;
  const coverImg = document.getElementById("audio-cover-art");
  if (coverImg) {
    // Use the podcast's own thumbnail if provided, fallback to course thumb
    const imgSrc = thumbSrc || "course_thumb_food_safety.png";
    coverImg.src = imgSrc;
    coverImg.onerror = function() { this.src = SDC_LOGO_B64; };
  }
  document.getElementById("audio-overlay").classList.add("open");
}
function closeAudio() {
  document.getElementById("audio-overlay").classList.remove("open");
}

// GAMIFIED FLASHCARD LOGIC
let fcDataset = [
  { q: "What is the minimum cooking temp for poultry?", a: "165°F (74°C)", diff: "hard" },
  { q: "What is the minimum holding temp for hot food?", a: "135°F (57°C)", diff: "medium" },
  { q: "What is the temperature danger zone?", a: "41°F to 135°F", diff: "easy" },
  { q: "How long should you wash your hands?", a: "At least 20 seconds", diff: "easy" },
  { q: "What temp should ground beef be cooked to?", a: "155°F (68°C)", diff: "hard" },
  { q: "What is the maximum cold holding temperature?", a: "41°F (5°C)", diff: "medium" },
  { q: "What should you do after touching raw meat?", a: "Wash hands immediately", diff: "easy" },
];
let fcActiveDeck = [];
let fcCurrentIndex = 0;
let fcScore = 0;
let fcCurrentMode = 'adaptive'; // adaptive, low, moderate, difficult
let fcAdaptiveLevel = 'easy'; // easy, medium, hard
let fcHistory = [];
let fcHistoryMode = false;

function openFlashcards(title) {
  document.getElementById("flashcard-overlay").classList.add("open");
  
  // Reset states
  fcHistory = [];
  fcHistoryMode = false;
  document.getElementById("fc-history-area").innerHTML = "";
  document.getElementById("fc-left-drawer").style.left = "-320px";
  
  setFlashcardMode('adaptive');
}

function setFlashcardMode(mode) {
  fcCurrentMode = mode;
  fcAdaptiveLevel = 'easy'; // reset for adaptive
  fcScore = 0;
  fcCurrentIndex = 0;
  fcHistory = [];
  document.getElementById("fc-history-area").innerHTML = "";

  // Update Segmented Control UI
  document.querySelectorAll(".fc-segment-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.mode === mode) btn.classList.add("active");
  });

  // Prepare Deck
  if (mode === 'adaptive') {
    fcActiveDeck = fcDataset.filter(c => c.diff === 'easy'); // starts easy
  } else if (mode === 'low') {
    fcActiveDeck = fcDataset.filter(c => c.diff === 'easy');
  } else if (mode === 'moderate') {
    fcActiveDeck = fcDataset.filter(c => c.diff === 'medium');
  } else if (mode === 'difficult') {
    fcActiveDeck = fcDataset.filter(c => c.diff === 'hard');
  }

  fcActiveDeck.sort(() => Math.random() - 0.5);

  if (fcActiveDeck.length === 0) {
    fcActiveDeck = [...fcDataset].sort(() => Math.random() - 0.5); // Fallback
  }

  if (mode !== 'adaptive') {
    fcActiveDeck = fcActiveDeck.slice(0, 10);
  }

  fcCurrentIndex = 0;
  fcScore = 0;
  
  document.getElementById("fc-score").textContent = "0";
  document.getElementById("fc-total").textContent = (mode === 'adaptive') ? "10" : fcActiveDeck.length;
  
  // Setup the UI state
  document.getElementById("fc-game-screen").style.display = "flex";
  document.getElementById("fc-complete-msg").style.display = "none";
  document.querySelector(".fc-main-area .flashcard-container").style.display = "block";
  document.getElementById("fc-tracker").style.display = "inline";

  // Ensure card is not flipped before loading first card
  document.getElementById("fc-deck-card").classList.remove("flipped");
  
  setTimeout(() => {
    loadGamifiedCard();
  }, 300);
}

function toggleFlashcardDrawer() {
  fcHistoryMode = !fcHistoryMode;
  const drawer = document.getElementById("fc-left-drawer");
  const btnIcon = document.getElementById("fc-drawer-icon");
  const btnText = document.getElementById("fc-drawer-text");
  
  if (fcHistoryMode) {
    drawer.style.left = "0px";
    btnIcon.textContent = "keyboard_double_arrow_left";
    btnText.textContent = "Collapse";
    renderHistory();
  } else {
    drawer.style.left = "-320px";
    btnIcon.textContent = "menu_open";
    btnText.textContent = "Answers";
  }
}

function renderHistory() {
  const container = document.getElementById("fc-history-area");
  container.innerHTML = "";
  if (fcHistory.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--on-sur-var);">No history yet. Answer some cards!</div>`;
    return;
  }
  
  fcHistory.forEach(item => {
    const el = document.createElement("div");
    el.className = `fc-history-item ${item.isRight ? "right" : "wrong"}`;
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="fc-history-q">${item.q}</div>
        <div style="font-size:20px;">${item.isRight ? "✅" : "❌"}</div>
      </div>
      ${!item.isRight ? `<div class="fc-history-a" style="color:var(--suc);">Correct: ${item.a}</div>` : `<div class="fc-history-a" style="color:var(--on-sur-var);">You got it right!</div>`}
    `;
    container.appendChild(el);
  });
}

function loadGamifiedCard() {
  const card = fcActiveDeck[fcCurrentIndex];
  document.getElementById("fc-deck-q").textContent = card.q;
  document.getElementById("fc-deck-a").textContent = card.a;
  
  if (fcCurrentMode === 'adaptive') {
    document.getElementById("fc-tracker").textContent = `Level: ${fcAdaptiveLevel.toUpperCase()} (Card ${fcHistory.length + 1} of 10)`;
  } else {
    document.getElementById("fc-tracker").textContent = `Card ${fcCurrentIndex + 1} of ${fcActiveDeck.length}`;
  }
  document.getElementById("fc-tracker").style.display = "inline";
  
  document.getElementById("fc-gamified-controls").style.display = "none";
}

function flipGamifiedCard() {
  const fc = document.getElementById("fc-deck-card");
  if (!fc.classList.contains("flipped")) {
    fc.classList.add("flipped");
    document.getElementById("fc-gamified-controls").style.display = "flex";
  }
}

function scoreCard(isRight) {
  const card = fcActiveDeck[fcCurrentIndex];
  if (isRight) fcScore++;
  document.getElementById("fc-score").textContent = fcScore;

  // Save to history (add to beginning of array so newest is first)
  fcHistory.unshift({
    q: card.q,
    a: card.a,
    isRight: isRight
  });

  // Adaptive Logic processing
  if (fcCurrentMode === 'adaptive') {
    if (isRight) {
      if (fcAdaptiveLevel === 'easy') fcAdaptiveLevel = 'medium';
      else if (fcAdaptiveLevel === 'medium') fcAdaptiveLevel = 'hard';
    } else {
      if (fcAdaptiveLevel === 'hard') fcAdaptiveLevel = 'medium';
      else if (fcAdaptiveLevel === 'medium') fcAdaptiveLevel = 'easy';
    }
    // Pick a new random card matching this level
    let available = fcDataset.filter(c => c.diff === fcAdaptiveLevel);
    if (available.length === 0) available = fcDataset;
    const nextCard = available[Math.floor(Math.random() * available.length)];
    // Instead of incrementing index, we just replace the deck for infinite mode
    fcActiveDeck = [nextCard];
    fcCurrentIndex = 0;
  } else {
    fcCurrentIndex++;
  }
  
  // Flip the card back immediately, then load the next card's text after animation
  document.getElementById("fc-deck-card").classList.remove("flipped");
  document.getElementById("fc-gamified-controls").style.display = "none";
  
  setTimeout(() => {
    if (fcHistory.length >= 10 || (fcCurrentMode !== 'adaptive' && fcCurrentIndex >= fcActiveDeck.length)) {
      document.querySelector(".fc-main-area .flashcard-container").style.display = "none";
      document.getElementById("fc-tracker").style.display = "none";
      document.getElementById("fc-complete-msg").style.display = "flex";
      // Auto open drawer to see final history
      document.getElementById("fc-left-drawer").style.left = "0px";
      renderHistory();
    } else {
      loadGamifiedCard();
    }
  }, 400); // Wait 400ms for flip animation to complete before changing text
}

function resetFlashcards() {
  openFlashcards(); // Auto restart
}



function closeFlashcards() {
  document.getElementById("flashcard-overlay").classList.remove("open");
  document.getElementById("fc-left-drawer").style.left = "-320px";
}

// ==========================================================================
// MOCK EXAM & CERTIFICATES (90-Question Mock Logic)
// ==========================================================================
const TOTAL_MOCK_Q = 90;
const EXAM_Q = Array(TOTAL_MOCK_Q)
  .fill(null)
  .map((_, i) => ({
    q: `Simulated question ${i + 1}. Which of the following is correct regarding food safety procedures in a commercial kitchen?`,
    opts: [
      "Always wear a hairnet",
      "Wash hands for 5 seconds",
      "Store raw meat above vegetables",
      "Use the same cutting board for all foods",
    ],
    a: 0,
    sel: null,
    flagged: false,
  }));

// Hardcode the specific question from the screenshot for realism
EXAM_Q[4] = {
  q: "When refilling a cup, never touch",
  opts: [
    "No such restriction",
    "The lip contact area",
    "The middle",
    "The bottom",
  ],
  a: 1,
  sel: null,
  flagged: false,
};

let curQ = 4; // Start at question 5 to match screenshot exactly
let mockTimerInterval = null;
let mockTimeRemaining = 5400; // 90 minutes in seconds

function startMockTimer() {
  clearInterval(mockTimerInterval);
  mockTimeRemaining = 5400;
  updateMockTimerDisplay();
  mockTimerInterval = setInterval(() => {
    mockTimeRemaining--;
    if (mockTimeRemaining <= 0) {
      clearInterval(mockTimerInterval);
      submitMockForce();
    }
    updateMockTimerDisplay();
  }, 1000);
}

function stopMockTimer() {
  clearInterval(mockTimerInterval);
}

function updateMockTimerDisplay() {
  const min = Math.floor(mockTimeRemaining / 60);
  const sec = mockTimeRemaining % 60;
  const str = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  const timerEl = document.getElementById("mock-timer");
  if (timerEl) {
    timerEl.textContent = str;
  }
}

function submitMockForce() {
  stopMockTimer();
  renderMockResult(true);
}

function openMockExam() {
  const env = document.getElementById("mock-exam-env");
  // The markup nests this dialog inside #reader-overlay, whose `transform`
  // makes our `position:fixed` resolve against that (off-screen) overlay instead
  // of the viewport — so the exam never appears. Re-home it to <body> so it fills
  // the screen. Idempotent: a no-op once it's already a direct child of body.
  if (env && env.parentElement !== document.body) document.body.appendChild(env);
  env.classList.add("open");
  curQ = 4; // Reset to the specific screenshot question
  EXAM_Q.forEach((q) => {
    q.sel = null;
    q.flagged = false;
  });
  EXAM_Q[0].sel = 1; // dummy score padding to show "Score: 3 of 90"
  EXAM_Q[1].sel = 1;
  EXAM_Q[2].sel = 1;
  
  buildQuestionGridHTML();
  renderExamQ();
  startMockTimer();
  document.getElementById("mock-focus-trap").focus();
}

function buildQuestionGridHTML() {
  const grid = document.getElementById("mock-question-grid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < TOTAL_MOCK_Q; i++) {
    const btn = document.createElement("button");
    btn.className = "mock-grid-btn";
    btn.id = `grid-btn-${i}`;
    btn.textContent = i + 1;
    btn.tabIndex = 0;
    btn.setAttribute("aria-label", `Question ${i + 1}`);
    btn.addEventListener("click", () => {
      jumpToQuestion(i);
    });
    grid.appendChild(btn);
  }
}

function toggleMockGrid() {
  const grid = document.getElementById("mock-question-grid");
  const btn = document.getElementById("sidebar-submit-btn");
  const icon = document.getElementById("mock-grid-icon");
  if (!grid) return;
  
  if (grid.style.display === "none") {
    grid.style.display = "grid";
    if (btn) btn.style.display = "block";
    if (icon) icon.textContent = "expand_less";
  } else {
    grid.style.display = "none";
    if (btn) btn.style.display = "none";
    if (icon) icon.textContent = "expand_more";
  }
}

function jumpToQuestion(index) {
  if (index >= 0 && index < TOTAL_MOCK_Q) {
    curQ = index;
    renderExamQ();
    document.getElementById("mock-focus-trap").focus();
  }
}

function toggleFlagCurrentQuestion() {
  const q = EXAM_Q[curQ];
  q.flagged = !q.flagged;
  renderExamQ();
}

function renderExamQ() {
  const q = EXAM_Q[curQ];
  document.getElementById("mock-q-meta").textContent =
    `Question ${curQ + 1} of ${TOTAL_MOCK_Q}`;
  document.getElementById("mock-q-text").textContent = q.q;

  // Calculate stats
  const answered = EXAM_Q.filter((x) => x.sel !== null).length;
  const flagged = EXAM_Q.filter((x) => x.flagged).length;

  document.getElementById("mock-score-live").textContent =
    `Your Score: ${answered} of ${TOTAL_MOCK_Q}`;

  const ansBadge = document.getElementById("stats-answered");
  if (ansBadge) ansBadge.textContent = `Answered: ${answered}/${TOTAL_MOCK_Q}`;

  const flagBadge = document.getElementById("stats-flagged");
  if (flagBadge) flagBadge.textContent = `Flagged: ${flagged}/${TOTAL_MOCK_Q}`;

  // Render options
  const opts = document.getElementById("mock-q-options");
  opts.innerHTML = "";
  q.opts.forEach((opt, i) => {
    const lbl = document.createElement("label");
    lbl.className = "opt-label";
    lbl.innerHTML = `<input type="radio" name="mockq" value="${i}" ${q.sel === i ? "checked" : ""} tabindex="0"> <span>${opt}</span>`;
    lbl.querySelector("input").addEventListener("change", () => {
      q.sel = i;
      renderExamQ();
    });
    opts.appendChild(lbl);
  });

  // Update flag button display
  const flagBtn = document.getElementById("mock-flag-btn");
  const flagBtnText = document.getElementById("mock-flag-btn-text");
  if (flagBtn && flagBtnText) {
    if (q.flagged) {
      flagBtn.classList.add("active");
      flagBtnText.textContent = "Flagged";
    } else {
      flagBtn.classList.remove("active");
      flagBtnText.textContent = "Flag Question";
    }
  }

  // Update previous/next navigation buttons
  const prevBtn = document.getElementById("mock-prev-btn");
  if (prevBtn) {
    if (curQ === 0) {
      prevBtn.disabled = true;
      prevBtn.style.opacity = "0.4";
      prevBtn.style.cursor = "not-allowed";
    } else {
      prevBtn.disabled = false;
      prevBtn.style.opacity = "1";
      prevBtn.style.cursor = "pointer";
    }
  }

  const nextBtn = document.getElementById("mock-next-btn");
  if (nextBtn) {
    if (curQ === TOTAL_MOCK_Q - 1) {
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.4";
      nextBtn.style.cursor = "not-allowed";
    } else {
      nextBtn.disabled = false;
      nextBtn.style.opacity = "1";
      nextBtn.style.cursor = "pointer";
    }
  }

  // Sync grid button classes
  for (let i = 0; i < TOTAL_MOCK_Q; i++) {
    const btn = document.getElementById(`grid-btn-${i}`);
    if (btn) {
      btn.classList.remove("active", "answered", "flagged");
      if (i === curQ) btn.classList.add("active");
      if (EXAM_Q[i].sel !== null) btn.classList.add("answered");
      if (EXAM_Q[i].flagged) btn.classList.add("flagged");
    }
  }
}

function exitMock() {
  if (confirm("Are you sure you want to exit the exam? Your answers will be discarded and your progress will not be saved.")) {
    stopMockTimer();
    document.getElementById("mock-exam-env").classList.remove("open");
  }
}

function navMock(dir) {
  curQ += dir;
  if (curQ < 0) curQ = 0;
  if (curQ >= TOTAL_MOCK_Q) curQ = TOTAL_MOCK_Q - 1;
  renderExamQ();
}

function submitMock() {
  const answered = EXAM_Q.filter((x) => x.sel !== null).length;
  const flagged = EXAM_Q.filter((x) => x.flagged).length;
  const remaining = TOTAL_MOCK_Q - answered;

  let summaryMsg = `Are you sure you want to submit your practice exam?\n\n`;
  summaryMsg += `• Total Questions: ${TOTAL_MOCK_Q}\n`;
  summaryMsg += `• Answered: ${answered}\n`;
  summaryMsg += `• Flagged: ${flagged}\n`;
  summaryMsg += `• Unanswered: ${remaining}\n\n`;

  if (remaining > 0) {
    summaryMsg += `⚠️ WARNING: You have ${remaining} unanswered question(s) remaining! Checked answers will be submitted.`;
  } else {
    summaryMsg += `All questions have been answered.`;
  }

  if (confirm(summaryMsg)) {
    stopMockTimer();
    renderMockResult(false);
  }
}

// Score the practice attempt: a question is correct when the selected option
// index matches its answer index (`a`). Returns answered/correct/total/pct.
function mockScore() {
  const answered = EXAM_Q.filter((x) => x.sel !== null).length;
  const correct = EXAM_Q.filter((x) => x.sel !== null && x.sel === x.a).length;
  const pct = Math.round((correct / TOTAL_MOCK_Q) * 100);
  return { answered, correct, total: TOTAL_MOCK_Q, pct };
}

// Show a practice result overlay INSIDE the mock env (a practice mock does not
// unlock certification — it just reports the score). Rendered as a separate
// panel so the question DOM stays intact for the next attempt.
function renderMockResult(timedOut) {
  const env = document.getElementById("mock-exam-env");
  if (!env) return;
  const { answered, correct, total, pct } = mockScore();
  const passed = pct >= 70;
  let panel = document.getElementById("mock-result-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "mock-result-panel";
    panel.style.cssText =
      "position:absolute; inset:0; z-index:10; display:flex; align-items:center; justify-content:center; background:var(--sur-main, #fff); padding:24px;";
    env.appendChild(panel);
  }
  const accent = passed ? "var(--suc, #146c2e)" : "var(--pri, #f9ad00)";
  panel.innerHTML = `
    <div style="max-width:440px; width:100%; text-align:center;">
      <div style="width:88px; height:88px; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center; background:${accent}1f; color:${accent};">
        <i class="material-icons" style="font-size:48px;">${passed ? "verified" : "insights"}</i>
      </div>
      <h2 style="font-size:24px; font-weight:700; margin-bottom:6px;">${timedOut ? "Time's up — practice submitted" : "Practice complete"}</h2>
      <p style="color:var(--on-sur-var, #64748b); margin-bottom:24px;">${passed ? "Great work — you're on track for the real exam." : "Keep practising — review the topics you missed."}</p>
      <div style="display:flex; gap:12px; margin-bottom:28px;">
        <div style="flex:1; border:1px solid var(--out-var, #e5e7eb); border-radius:12px; padding:16px;">
          <div style="font-size:28px; font-weight:800; color:${accent};">${pct}%</div>
          <div style="font-size:12px; color:var(--on-sur-var, #64748b);">Score</div>
        </div>
        <div style="flex:1; border:1px solid var(--out-var, #e5e7eb); border-radius:12px; padding:16px;">
          <div style="font-size:28px; font-weight:800;">${correct}/${total}</div>
          <div style="font-size:12px; color:var(--on-sur-var, #64748b);">Correct</div>
        </div>
        <div style="flex:1; border:1px solid var(--out-var, #e5e7eb); border-radius:12px; padding:16px;">
          <div style="font-size:28px; font-weight:800;">${answered}</div>
          <div style="font-size:12px; color:var(--on-sur-var, #64748b);">Answered</div>
        </div>
      </div>
      <button class="btn-primary" onclick="closeMockResult()" style="width:100%; padding:14px; font-size:16px; font-weight:600; background:var(--pri); color:var(--on-pri);">Back to Practice</button>
    </div>`;
  panel.style.display = "flex";
  showToast(timedOut ? "Time expired — practice exam scored." : "Practice exam submitted.");
}

// Dismiss the result overlay and return to the Practice screen.
function closeMockResult() {
  const panel = document.getElementById("mock-result-panel");
  if (panel) panel.remove();
  const env = document.getElementById("mock-exam-env");
  if (env) env.classList.remove("open");
  navigateTo("cand-practice");
}

function handleLogout() {
  // Return to a clean login screen (drop any ?bypass=true so the login view shows).
  // The login fields carry demo credentials in the HTML, so they auto-fill on load.
  if (confirm("Sign out of your account?")) window.location.href = window.location.pathname;
}

// ==========================================================================
// PROFILE: primary + secondary email association (dual-email approval flow)
// ==========================================================================
// The candidate can link a secondary email to their account. Both addresses
// are tied to their exam voucher code, but only after the candidate approves
// the association — either via the in-portal "Approve" button below, or by
// opening the "I Agree" link in the approval email (?action=approve-emails).
const CAND_PROFILE_KEY = 'cand_profile_v1';

function candVoucherCode() {
  try { return (typeof spExam !== 'undefined' && spExam.voucherId) ? spExam.voucherId : 'VCH-A1001'; }
  catch (e) { return 'VCH-A1001'; }
}

function loadCandProfile() {
  const def = { primaryEmail: 'alex.scott@sdc.edu', secondaryEmail: '', secondaryStatus: 'none' };
  try { return Object.assign(def, JSON.parse(localStorage.getItem(CAND_PROFILE_KEY) || '{}')); }
  catch (e) { return def; }
}

function saveCandProfile(p) { try { localStorage.setItem(CAND_PROFILE_KEY, JSON.stringify(p)); } catch (e) {} }

// Paint the email inputs, association status badge, approve button, voucher line.
function renderProfileEmails() {
  const p = loadCandProfile();
  const primary = document.getElementById('profile-email');
  const secondary = document.getElementById('profile-email-secondary');
  const badge = document.getElementById('profile-secondary-status');
  const approveBtn = document.getElementById('profile-approve-secondary-btn');
  const vline = document.getElementById('profile-voucher-line');
  if (primary && !primary.value) primary.value = p.primaryEmail || '';
  if (secondary) secondary.value = p.secondaryEmail || '';
  const code = candVoucherCode();
  if (badge) {
    let txt = 'Not added', bg = 'rgba(120,120,120,0.12)', fg = '#5d5962', icon = 'remove_circle_outline';
    if (p.secondaryStatus === 'pending') { txt = 'Pending approval'; bg = 'rgba(125,87,0,0.16)'; fg = '#7d5700'; icon = 'hourglass_top'; }
    else if (p.secondaryStatus === 'active') { txt = 'Active'; bg = 'rgba(20,108,46,0.12)'; fg = '#146c2e'; icon = 'check_circle'; }
    badge.style.background = bg; badge.style.color = fg;
    badge.innerHTML = `<i class="material-icons" style="font-size:14px;">${icon}</i> ${txt}`;
  }
  if (approveBtn) approveBtn.style.display = (p.secondaryStatus === 'pending') ? 'inline-flex' : 'none';
  if (vline) {
    if (p.secondaryStatus === 'active') vline.textContent = `Both email addresses are linked to voucher ${code}.`;
    else if (p.secondaryStatus === 'pending') vline.textContent = `Awaiting approval to link both email addresses to voucher ${code}.`;
    else vline.textContent = `Add a secondary email to link it, with your primary, to voucher ${code}.`;
  }
}

// In-portal approval — same effect as clicking "I Agree" in the approval email.
function approveSecondaryEmail() {
  const p = loadCandProfile();
  if (!p.secondaryEmail) return;
  p.secondaryStatus = 'active';
  saveCandProfile(p);
  if (typeof spLogEmail === 'function') spLogEmail('Dual Email Association — Confirmed');
  renderProfileEmails();
  showToastNotification(`Both email addresses are now linked to voucher ${candVoucherCode()}.`, 'check_circle');
}

function saveProfileChanges() {
  const email = document.getElementById("profile-email");
  const secondary = document.getElementById("profile-email-secondary");
  const newPass = document.getElementById("profile-new-pass");
  const confirmPass = document.getElementById("profile-confirm-pass");

  let valid = true;

  // Validate primary email
  if (!email.value.includes("@")) {
    email.classList.add("error");
    valid = false;
  } else {
    email.classList.remove("error");
  }

  // Secondary email is optional; if present it must be valid and distinct.
  const secVal = secondary ? secondary.value.trim() : "";
  if (secVal) {
    if (!secVal.includes("@") || secVal.toLowerCase() === email.value.trim().toLowerCase()) {
      secondary.classList.add("error");
      valid = false;
    } else {
      secondary.classList.remove("error");
    }
  } else if (secondary) {
    secondary.classList.remove("error");
  }

  // Validate password match (only if user typed something)
  if (newPass.value.length > 0 && newPass.value !== confirmPass.value) {
    confirmPass.classList.add("error");
    showToastNotification("Passwords do not match. Please try again.", "error");
    valid = false;
  } else {
    confirmPass.classList.remove("error");
  }

  if (!valid) return;

  // Persist emails + association status.
  const p = loadCandProfile();
  const prevSecondary = p.secondaryEmail;
  p.primaryEmail = email.value.trim();
  p.secondaryEmail = secVal;
  if (!secVal) {
    p.secondaryStatus = 'none';
  } else if (secVal !== prevSecondary || p.secondaryStatus === 'none') {
    // A newly added or changed secondary email must be re-approved.
    p.secondaryStatus = 'pending';
  }
  saveCandProfile(p);

  // Keep the top-bar profile email in sync with the primary.
  const trig = document.getElementById("profileDropdownBtn");
  if (trig) { const em = trig.querySelector(".email"); if (em) em.textContent = p.primaryEmail; }

  const code = candVoucherCode();
  if (p.secondaryStatus === 'pending') {
    if (typeof spLogEmail === 'function') spLogEmail('Dual Email Association — Approval Requested');
    showToastNotification(`Approval email sent to ${secVal}. Confirm to link both addresses to voucher ${code}.`, "mail");
  } else {
    showToastNotification("Account settings saved successfully!", "check_circle");
  }

  renderProfileEmails();
  newPass.value = "";
  confirmPass.value = "";
}

function executeAccountDeletion() {
  const reason = document.getElementById("delete-reason-input").value.trim();
  if (!reason) {
    showToastNotification("A reason for deletion is required.", "error");
    return;
  }

  const btn = document.getElementById("confirm-delete-btn");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i class="material-icons spin">sync</i> Deleting...`;
  btn.disabled = true;

  // Simulate network request
  setTimeout(() => {
    document.getElementById("delete-modal").classList.remove("active");
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    alert("Account successfully deleted. You will now be redirected to the login page.");
    window.location.reload();
  }, 1000);
}

function showToast(msg) {
  const div = document.createElement("div");
  div.style.cssText =
    "position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:var(--on-sur); color:var(--sur); padding:12px 24px; border-radius:100px; z-index:9999; box-shadow:var(--shadow-md); font-weight:600; font-size:14px;";
  div.setAttribute("role", "alert");
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = "0";
    div.style.transition = "opacity 0.3s";
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

/* ==========================================================================
   LEARNING MODULE LOGIC (M3)
   ========================================================================== */

const LM_DATA = {
  ebooks: [
    {
      title: "The Food Protection Manager's Handbook",
      thumb: "course_thumb_food_safety.png",
      progress: 100,
      length: 120,
      totalLength: 120,
    },
    {
      title: "HACCP Principles Guide",
      thumb: "course_thumb_haccp.png",
      progress: 30,
      length: 45,
      totalLength: 150,
    },
    {
      title: "Allergen Management Manual",
      thumb: "media__1779413128911.jpg",
      progress: 0,
      length: 0,
      totalLength: 60,
    },
  ],
  videos: [
    {
      title: "Temperature Danger Zone Explained",
      thumb: "media__1779413128911.jpg",
      progress: 15,
      totalLength: 15,
    },
    {
      title: "Cross-Contamination Prevention",
      thumb: "media__1779413128905.jpg",
      progress: 10,
      totalLength: 22,
    },
    {
      title: "Proper Handwashing Techniques",
      thumb: "media__1779413128933.jpg",
      progress: 0,
      totalLength: 8,
    },
  ],
  podcasts: [
    {
      title: "01 Handling Food Safely",
      thumb: "media__1779413128933.jpg",
      progress: 18,
      totalLength: 18,
    },
    {
      title: "02 Bad Bugs and Foodborne Illness",
      thumb: "media__1779413128911.jpg",
      progress: 5,
      totalLength: 22,
    },
    {
      title: "03 Food Hazards and Allergens",
      thumb: "media__1779413128905.jpg",
      progress: 0,
      totalLength: 20,
    },
  ],
  flashcards: [
    {
      title: "Temperature Controls",
      thumb: "course_thumb_food_safety.png",
      progress: 50,
      cards: 20,
    },
    {
      title: "Pathogens & Bacteria",
      thumb: "course_thumb_haccp.png",
      progress: 100,
      cards: 15,
    },
    {
      title: "Sanitization Rules",
      thumb: "media__1779413128905.jpg",
      progress: 0,
      cards: 25,
    },
  ],
  practice: [
    {
      title: "Module 1 Assessment",
      thumb: "course_thumb_food_safety.png",
      score: "92%",
      time: "14m",
      date: "Today",
    },
    {
      title: "Module 2 Assessment",
      thumb: "course_thumb_haccp.png",
      score: "88%",
      time: "18m",
      date: "Yesterday",
    },
    {
      title: "Final Certification Mock",
      thumb: "media__1779413128911.jpg",
      score: "--",
      time: "--",
      date: "Not Attempted",
    },
  ],
};

function switchLmTab(tabId) {
  document
    .querySelectorAll(".l-tab")
    .forEach((t) => t.classList.remove("active"));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  } else {
    // If called directly, find the right tab
    const tabs = document.querySelectorAll(".l-tab");
    if (tabId === "ebooks") tabs[0].classList.add("active");
  }

  const grid = document.getElementById("lm-content-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const items = LM_DATA[tabId];
  if (!items) return;

  items.forEach((item) => {
    let metaHtml = "";
    let btnText = "Start";
    let ctaAction = "";
    let pct = 0;

    if (tabId === "ebooks") {
      pct = Math.round((item.length / item.totalLength) * 100);
      metaHtml = `<i class="material-icons" style="font-size:16px;">menu_book</i> ${item.length} / ${item.totalLength} mins read`;
      btnText = pct === 100 ? "Read" : pct > 0 ? "Resume" : "Start Reading";
      ctaAction = `openReader('pdf')`;
    } else if (tabId === "videos") {
      pct = Math.round((item.progress / item.totalLength) * 100);
      metaHtml = `<i class="material-icons" style="font-size:16px;">play_circle</i> ${item.progress} / ${item.totalLength} mins watched`;
      btnText = pct === 100 ? "Re-watch" : pct > 0 ? "Resume" : "Watch";
      ctaAction = `openVideo('${item.title}')`;
    } else if (tabId === "podcasts") {
      pct = Math.round((item.progress / item.totalLength) * 100);
      metaHtml = `<i class="material-icons" style="font-size:16px;">headphones</i> ${item.progress} / ${item.totalLength} mins listened`;
      btnText = pct === 100 ? "Listen Again" : pct > 0 ? "Resume" : "Listen";
      ctaAction = `openAudio('${item.title}', '${item.thumb || "course_thumb_food_safety.png"}')`;
    } else if (tabId === "flashcards") {
      pct = item.progress;
      metaHtml = `<i class="material-icons" style="font-size:16px;">style</i> ${item.cards} cards in deck`;
      btnText =
        pct === 100 ? "Review Deck" : pct > 0 ? "Resume" : "Study Cards";
      ctaAction = `openFlashcards('${item.title}')`;
    } else if (tabId === "practice") {
      pct = item.score !== "--" ? parseInt(item.score) : 0;
      metaHtml = `
        <table class="report-table">
          <tr><th>Attempted</th><td>${item.date}</td></tr>
          <tr><th>Score</th><td style="color:${pct >= 80 ? "var(--suc)" : "var(--on-sur)"};">${item.score}</td></tr>
          <tr><th>Duration</th><td>${item.time}</td></tr>
        </table>
      `;
      btnText = item.score !== "--" ? "Retake Test" : "Start Test";
      ctaAction = `openMockExam()`;
    }

    const cardHTML = `
      <div class="lm-card">
        <div class="lm-card-thumb" style="background-image: url('${item.thumb}');">
          ${tabId === "videos" ? '<i class="material-icons lm-card-icon" style="font-size:32px;">play_circle_outline</i>' : ""}
          ${tabId === "podcasts" ? '<i class="material-icons lm-card-icon" style="font-size:32px;">headphones</i>' : ""}
        </div>
        <div class="lm-card-body">
          <div class="lm-card-title">${item.title}</div>
          <div class="lm-card-meta">${metaHtml}</div>
          
          ${
            tabId !== "practice"
              ? `
          <div class="lm-progress-container">
            <div class="lm-progress-header">
              <span>Progress</span>
              <span style="color:var(--sec);">${pct}%</span>
            </div>
            <div class="lm-progress-bg">
              <div class="lm-progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
          `
              : ""
          }
          
          <button class="btn-secondary lm-card-cta" onclick="${ctaAction}">${btnText}</button>
        </div>
      </div>
    `;
    grid.innerHTML += cardHTML;
  });
}

// Ensure the first tab is loaded by default if we navigate to the learning view
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    switchLmTab("ebooks");
  }, 300);
});

// ==========================================================================
// CREDENTIAL HUB
// ==========================================================================

function openCredentialHub() {
  document.getElementById("credential-hub-overlay").classList.add("open");
  switchCredView("certificate", document.getElementById("seg-tab-cert"));
}

function closeCredentialHub() {
  document.getElementById("credential-hub-overlay").classList.remove("open");
}

function switchCredView(view, btn) {
  ["certificate", "badge", "web"].forEach(v => {
    const pane = document.getElementById(`cred-view-${v}`);
    if (pane) pane.style.display = "none";
  });
  document.querySelectorAll(".cred-seg-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
  });
  const targetPane = document.getElementById(`cred-view-${view}`);
  if (targetPane) targetPane.style.display = "flex";
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
  }
}

function credCopyLink(btn) {
  const url = "https://verify.sdccertifications.com/SDC-ACF-2026-04827193";
  navigator.clipboard.writeText(url).then(() => {
    showToastNotification("Verification Link Copied to Clipboard", "link");
  });
}

function credCopyVerifyLink(btn) {
  const url = document.getElementById("cred-verify-url").textContent.trim();
  const origHTML = btn.innerHTML;
  btn.innerHTML = `<span class="btn-spinner"></span>`;
  navigator.clipboard.writeText(url).then(() => {
    btn.innerHTML = origHTML;
    showToastNotification("Verification Link Copied to Clipboard", "link");
  });
}

function credShareLinkedIn() {
  const certUrl = encodeURIComponent("https://verify.sdccertifications.com/SDC-ACF-2026-04827193");
  const name = encodeURIComponent("Food Safety Manager Certification");
  const org = encodeURIComponent("SDC Certifications");
  const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&organizationName=${org}&certUrl=${certUrl}&certId=SDC-ACF-2026-04827193`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function credDownloadPDF(btn) {
  const origHTML = btn.innerHTML;
  btn.innerHTML = `<span class="btn-spinner"></span> Generating...`;
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = origHTML;
    btn.disabled = false;
    showToastNotification("Certificate PDF Downloaded Successfully", "picture_as_pdf");
  }, 2000);
}

function credDownloadBadge(btn) {
  const origHTML = btn.innerHTML;
  btn.innerHTML = `<span class="btn-spinner"></span> Preparing...`;
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = origHTML;
    btn.disabled = false;
    showToastNotification("High-Res Badge Image Downloaded Successfully", "download");
  }, 1800);
}

function credAddAppleWallet() {
  showToastNotification("Opening Apple Wallet — Please allow the pass to be added.", "ios_share");
}

function credAddGoogleWallet() {
  showToastNotification("Opening Google Wallet — Please allow the pass to be added.", "account_balance_wallet");
}

function credCopySchema(btn) {
  const schema = document.getElementById("cred-json-content").textContent;
  const origHTML = btn.innerHTML;
  btn.innerHTML = `<span class="btn-spinner"></span>`;
  navigator.clipboard.writeText(schema).then(() => {
    btn.innerHTML = origHTML;
    showToastNotification("Open Badge 2.0 Schema Copied to Clipboard", "code");
  });
}

function toggleCredAccordion() {
  const body = document.getElementById("cred-accordion-body");
  const chevron = document.querySelector(".cred-accordion-chevron");
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  if (chevron) chevron.classList.toggle("open", !isOpen);
}

function openCredMobileSheet(cardId) {
  document.getElementById("cred-mobile-sheet").classList.add("open");
}

function closeCredMobileSheet() {
  document.getElementById("cred-mobile-sheet").classList.remove("open");
}

// ---- Toast System ----
function showToastNotification(message, iconName) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerHTML = `
    <i class="material-icons" style="font-size: 18px; color: var(--suc); flex-shrink: 0;">${iconName || "check_circle"}</i>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Dismiss notification">
      <i class="material-icons" style="font-size: 18px;">close</i>
    </button>
  `;
  container.appendChild(toast);

  // Auto-dismiss after 3000ms
  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================================================
// CANDIDATE EXAM ENROLLMENT · PAYMENT · VOUCHER FLOW   (prototype / mock)
// Single source of truth for the dashboard exam card states + statuses.
// ==========================================================================
const SP_EXAM_KEY = 'sp_candidate_exam_v1';
function spLoadExam() {
  const def = {
    examName: 'Food Protection Manager Certification',
    type: 'online',               // 'online' | 'in-class'
    scheduledDisplay: 'Jun 21, 2026',
    fee: 75.00,
    paymentRequired: true,
    paymentStatus: 'pending',     // 'not_required' | 'pending' | 'paid' | 'failed'
    proctorUnlocked: false,
    paidAt: null
  };
  try { return Object.assign(def, JSON.parse(localStorage.getItem(SP_EXAM_KEY) || '{}')); }
  catch (e) { return def; }
}
function spSaveExam(s) { try { localStorage.setItem(SP_EXAM_KEY, JSON.stringify(s)); } catch (e) {} }
let spExam = spLoadExam();

function spBadge(text, kind, icon) {
  const map = {
    paid:   { bg: 'rgba(20,108,46,0.12)',  fg: '#146c2e' },
    pending:{ bg: 'rgba(125,87,0,0.16)',   fg: '#7d5700' },
    info:   { bg: 'rgba(0,99,155,0.12)',   fg: '#00639b' },
    brand:  { bg: 'rgba(249,173,0,0.16)',  fg: '#7a4e00' },
    neutral:{ bg: 'rgba(120,120,120,0.12)',fg: '#5d5962' }
  };
  const c = map[kind] || map.neutral;
  const ic = icon ? `<i class="material-icons" style="font-size:14px;">${icon}</i>` : '';
  return `<span class="sp-badge" style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:9999px;font-size:12px;font-weight:700;letter-spacing:.02em;background:${c.bg};color:${c.fg};">${ic}${text}</span>`;
}

function spToast(msg, kind) {
  let c = document.getElementById('sp-toast-container');
  if (!c) {
    c = document.createElement('div'); c.id = 'sp-toast-container';
    c.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  const bg = kind === 'success' ? '#146c2e' : kind === 'error' ? '#b3261e' : '#1c1b1f';
  const ic = kind === 'success' ? 'check_circle' : kind === 'error' ? 'error' : 'mail';
  t.style.cssText = `background:${bg};color:#fff;padding:14px 18px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;align-items:center;gap:10px;max-width:380px;animation:fadeInUp .3s ease-out;`;
  t.innerHTML = `<i class="material-icons" style="font-size:18px;">${ic}</i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 4000);
}
function spLogEmail(type) {
  try { const k = 'sp_sent_emails'; const a = JSON.parse(localStorage.getItem(k) || '[]');
        a.push({ type, at: new Date().toISOString() }); localStorage.setItem(k, JSON.stringify(a)); } catch (e) {}
}

function renderExamCard() {
  const s = spExam;
  const strip = document.getElementById('exam-status-strip');
  const help = document.getElementById('exam-help-text');
  const helpIcon = document.getElementById('exam-help-icon');
  const btn = document.getElementById('dash-start-exam-btn');
  const label = document.querySelector('.scheduler-label');
  const dateEl = document.getElementById('dash-date-display');
  if (!strip || !btn) return;

  if (label) label.textContent = s.type === 'online' ? 'Upcoming Internet-Proctored Exam' : 'Upcoming In-Class Exam';
  if (dateEl && s.scheduledDisplay) dateEl.textContent = s.scheduledDisplay;

  const badges = [];
  badges.push(spBadge(s.type === 'online' ? 'Online · Internet-Proctored' : 'In-Class', 'info', s.type === 'online' ? 'videocam' : 'meeting_room'));
  if (s.type === 'online' && s.paymentRequired) {
    if (s.paymentStatus === 'paid') badges.push(spBadge('Exam fee paid', 'paid', 'check_circle'));
    else if (s.paymentStatus === 'failed') badges.push(spBadge('Payment failed', 'pending', 'error'));
    else badges.push(spBadge('Payment pending', 'pending', 'schedule'));
  } else {
    badges.push(spBadge('No payment required', 'neutral', 'check'));
  }
  if (s.type === 'online' && s.paymentRequired && s.paymentStatus !== 'paid') badges.push(spBadge('Awaiting payment', 'pending', 'lock'));
  else if (!s.proctorUnlocked) badges.push(spBadge('Awaiting proctor', 'info', 'hourglass_top'));
  else badges.push(spBadge('Ready to start', 'paid', 'play_circle'));
  strip.innerHTML = badges.join('');

  const needPay = s.type === 'online' && s.paymentRequired && s.paymentStatus !== 'paid';
  if (needPay) {
    if (helpIcon) helpIcon.textContent = 'lock';
    if (help) help.textContent = `Upgrade: Pay your $${s.fee.toFixed(2)} exam fee to unlock this booking for online.`;
    btn.disabled = false; btn.className = 'btn-primary'; btn.setAttribute('style', '');
    btn.onclick = openExamPayment;
    btn.innerHTML = `<i class="material-icons" style="font-size:18px;">lock_open</i> Pay $${s.fee.toFixed(2)} to unlock`;
  } else if (!s.proctorUnlocked) {
    if (helpIcon) helpIcon.textContent = 'info_outline';
    if (help) help.textContent = s.paymentStatus === 'paid'
      ? 'Paid ✓ — your proctor will unlock the exam at the scheduled time.'
      : 'Exam launches automatically when unlocked by your proctor.';
    btn.disabled = true; btn.className = 'btn-primary locked-cta-btn';
    btn.setAttribute('style', 'background: var(--sur-var); color: var(--on-sur-var); border: 1px solid var(--out-var);');
    btn.onclick = null;
    btn.innerHTML = `<i class="material-icons spin" style="color: var(--pri);">sync</i> ${s.paymentStatus === 'paid' ? 'Paid ✓ · Waiting for Proctor' : 'Waiting for Proctor...'}`;
  } else {
    if (helpIcon) helpIcon.textContent = 'verified';
    if (help) help.textContent = 'You are all set. Begin your proctored exam.';
    btn.disabled = false; btn.className = 'btn-primary'; btn.setAttribute('style', '');
    btn.onclick = () => window.open('secure_exam.html', '_blank');
    btn.innerHTML = `<span>Start Exam</span> <i class="material-icons" style="font-size:18px;">arrow_forward</i>`;
  }
}

function openExamPayment() {
  const s = spExam; const fee = `$${s.fee.toFixed(2)}`;
  ['exam-pay-fee1', 'exam-pay-fee2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = fee; });
  const line = document.getElementById('exam-pay-line'); if (line) line.textContent = `Online Proctored Exam — ${s.examName}`;
  const lbl = document.getElementById('exam-pay-btn-label'); if (lbl) lbl.textContent = `Pay ${fee}`;
  const m = document.getElementById('exam-payment-modal'); if (m) m.classList.add('active', 'open');
}

async function confirmExamPayment() {
  const btn = document.getElementById('exam-pay-btn'); const orig = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = `<i class="material-icons spin">sync</i> Processing…`; }
  await new Promise(r => setTimeout(r, 1200));
  spExam.paymentStatus = 'paid'; spExam.paidAt = new Date().toISOString();
  // Online (Internet-Proctored) exams need no in-person proctor, so paying the
  // fee unlocks the exam outright. In-class exams still wait for the proctor.
  if (spExam.type === 'online') spExam.proctorUnlocked = true;
  spSaveExam(spExam);
  const m = document.getElementById('exam-payment-modal'); if (m) m.classList.remove('active', 'open');
  if (btn) { btn.disabled = false; btn.innerHTML = orig; }
  renderExamCard();
  spToast('Payment successful — a receipt has been emailed to you.', 'success');
  spLogEmail('Exam Payment Receipt');
}

// ==========================================================================
// STUDENT SELF-ENROLMENT INTO A CLASS  (Phase E)
// The student picks a published class. The class's resolved rules decide what
// happens: online + student-pays → pay the exam fee to unlock; online +
// org-pays → enrol free, ready (no in-person proctor); in-class → enrol and
// wait for the proctor to unlock on exam day. Classes are mocked here (no
// shared cross-portal store in this prototype); each carries its rule set.
// ==========================================================================
const SP_CLASSES = [
  { id: 'sc_1', name: 'HACCP Certification — Evening', assessment: 'HACCP Certification', examMode: 'in-class', onlinePayer: 'organization', fee: 0 },
  { id: 'sc_2', name: 'ServSafe Food Handler — Online (Org-paid)', assessment: 'ServSafe Food Handler', examMode: 'online', onlinePayer: 'organization', fee: 0 },
  { id: 'sc_3', name: 'Food Safety Manager — Online (Student-paid)', assessment: 'Food Safety Manager', examMode: 'online', onlinePayer: 'student', fee: 75 }
];

function openClassEnrol() {
  const sel = document.getElementById('enrol-class-select');
  if (sel) sel.innerHTML = SP_CLASSES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  renderEnrolSummary();
  const m = document.getElementById('class-enrol-modal'); if (m) m.classList.add('active', 'open');
}

function _enrolSelectedClass() {
  const sel = document.getElementById('enrol-class-select');
  return SP_CLASSES.find(c => c.id === (sel ? sel.value : '')) || SP_CLASSES[0];
}

function renderEnrolSummary() {
  const c = _enrolSelectedClass();
  const summary = document.getElementById('enrol-summary');
  const label = document.getElementById('enrol-confirm-label');
  if (!c || !summary) return;
  const studentPays = c.examMode === 'online' && c.onlinePayer === 'student';
  const rows = [
    ['Assessment', c.assessment],
    ['Exam mode', c.examMode === 'online' ? 'Online · Internet-Proctored' : 'In-Class'],
    ['Who pays', c.examMode === 'online' ? (c.onlinePayer === 'student' ? 'You (student)' : 'Organisation') : 'N/A (in-class)'],
    ['Exam fee', studentPays ? `$${c.fee.toFixed(2)}` : 'No charge to you']
  ];
  summary.innerHTML = rows.map(([k, v]) => `<div style="display:flex; justify-content:space-between; padding:3px 0;"><span style="color:var(--on-sur-var);">${k}</span><span style="font-weight:600;">${v}</span></div>`).join('');
  if (label) label.textContent = studentPays ? `Enrol & Pay $${c.fee.toFixed(2)}` : 'Enrol';
}

function confirmClassEnrol() {
  const c = _enrolSelectedClass();
  if (!c) return;
  const m = document.getElementById('class-enrol-modal'); if (m) m.classList.remove('active', 'open');
  const studentPays = c.examMode === 'online' && c.onlinePayer === 'student';

  if (c.examMode === 'online') {
    Object.assign(spExam, {
      type: 'online', examName: c.assessment, enrolledClass: c.name,
      paymentRequired: studentPays, fee: studentPays ? c.fee : 0,
      paymentStatus: studentPays ? 'pending' : 'paid',
      proctorUnlocked: !studentPays   // org-paid online is ready immediately
    });
  } else {
    Object.assign(spExam, {
      type: 'in-class', examName: c.assessment, enrolledClass: c.name,
      paymentRequired: false, fee: 0, paymentStatus: 'not_required', proctorUnlocked: false
    });
  }
  spSaveExam(spExam);
  renderExamCard();
  spToast(`Enrolled in ${c.name}.`, 'success');

  // Student-paid online: immediately open the existing exam-payment modal so the
  // student pays the fee to unlock (confirmExamPayment unlocks online on success).
  if (studentPays) setTimeout(openExamPayment, 300);
}

// ==========================================================================
// CANDIDATE SELF-PURCHASE  (B2C — candidate buys their own voucher; mock pay)
// Mirrors the exam-payment mock flow. The purchased voucher becomes the
// dashboard exam card's single source of truth (spExam).
// ==========================================================================
const SP_API = 'index.html';
let spPurchaseType = 'In-House';
function spVoucherPrice(type) { return type === 'Internet Proctored' ? 75 : 42; }

function openVoucherPurchase(type) {
  spPurchaseType = type;
  const isNet = type === 'Internet Proctored';
  const fee = `$${spVoucherPrice(type).toFixed(2)}`;
  const line = document.getElementById('vp-line'); if (line) line.textContent = (isNet ? 'Internet Proctored' : 'In-House Proctored') + ' Voucher';
  ['vp-fee1', 'vp-fee2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = fee; });
  const lbl = document.getElementById('vp-btn-label'); if (lbl) lbl.textContent = `Pay ${fee}`;
  const desc = document.getElementById('vp-desc'); if (desc) desc.textContent = isNet
    ? 'Buy an Internet-Proctored voucher and take your exam online immediately after a quick system check. A receipt and voucher code are emailed to you.'
    : 'Buy an In-House voucher for a scheduled school session. Your proctor enters the code on exam day. A receipt and voucher code are emailed to you.';
  const m = document.getElementById('voucher-purchase-modal'); if (m) m.classList.add('active', 'open');
}

async function confirmVoucherPurchase() {
  const type = spPurchaseType;
  const btn = document.getElementById('vp-pay-btn'); const orig = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = `<i class="material-icons spin">sync</i> Processing…`; }

  let voucherId = null;
  try {
    await new Promise(r => setTimeout(r, 1200)); // mock payment delay
    const candidateId = (typeof CANDIDATE_STATE !== 'undefined' && CANDIDATE_STATE.candidateId) || 'cand_001';
    const res = await fetch(`${SP_API}/api/vouchers/self-purchase`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, candidateId })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'purchase failed');
    voucherId = data.voucherId;
  } catch (e) {
    console.error('Voucher purchase failed:', e);
    if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    spToast('Payment could not be completed. Please try again.', 'error');
    return;
  }

  // Reflect the new voucher on the dashboard exam card (single source of truth).
  if (type === 'Internet Proctored') {
    // Internet voucher → self-service: paid + unlocked, launches immediately.
    Object.assign(spExam, { type: 'online', paymentRequired: false, paymentStatus: 'paid', proctorUnlocked: true, voucherId: voucherId, voucherType: type });
  } else {
    // In-House voucher → waits for the on-site proctor to redeem on exam day.
    Object.assign(spExam, { type: 'in-class', paymentRequired: false, paymentStatus: 'not_required', proctorUnlocked: false, voucherId: voucherId, voucherType: type });
  }
  spSaveExam(spExam);

  const m = document.getElementById('voucher-purchase-modal'); if (m) m.classList.remove('active', 'open');
  if (btn) { btn.disabled = false; btn.innerHTML = orig; }
  renderExamCard();

  const out = document.getElementById('voucher-purchase-result');
  if (out) {
    const isNet = type === 'Internet Proctored';
    const shareLine = isNet
      ? 'You can start your exam now. A receipt was emailed to you.'
      : 'Share this code with your proctor to redeem it for your exam on session day. A receipt was emailed to you.';
    out.style.display = 'block';
    out.innerHTML = `<div style="padding:14px;border-radius:10px;background:rgba(20,108,46,0.10);border:1px solid rgba(20,108,46,0.25);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <i class="material-icons" style="color:#146c2e;">check_circle</i>
        <div style="font-size:13px;color:#146c2e;line-height:1.45;">Voucher delivered (${type}). ${shareLine}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <code style="font-family:monospace;font-size:15px;font-weight:700;letter-spacing:.5px;background:var(--sur-var);color:var(--on-sur);padding:8px 12px;border-radius:8px;">${voucherId}</code>
        <button class="mdbtn btn-outlined" type="button" style="padding:8px 14px;font-size:13px;" onclick="spCopyVoucherCode('${voucherId}', this)">
          <i class="material-icons" style="font-size:16px;">content_copy</i> Copy code
        </button>
      </div>
    </div>`;
  }
  // A self-purchased In-House voucher can still be upgraded to Internet later.
  const up = document.getElementById('voucher-upgrade-container');
  if (up) up.style.display = (type === 'In-House') ? 'block' : 'none';

  spToast(`Voucher ${voucherId} purchased — receipt emailed.`, 'success');
  spLogEmail('Voucher Purchase Receipt');
}

// Copy a voucher code to the clipboard so the candidate can share it with their
// proctor. Falls back to a textarea+execCommand when the async Clipboard API is
// unavailable (insecure context / older browser).
function spCopyVoucherCode(code, btn) {
  const done = () => {
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<i class="material-icons" style="font-size:16px;">check</i> Copied`;
      setTimeout(() => { btn.innerHTML = orig; }, 1600);
    }
    spToast('Voucher code copied — share it with your proctor.', 'success');
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy());
  } else { fallbackCopy(); }
  function fallbackCopy() {
    try {
      const ta = document.createElement('textarea');
      ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); done();
    } catch (e) { spToast('Copy failed — code: ' + code, 'info'); }
  }
}

// Reconcile the dashboard card with backend voucher state. Picks up an
// in-house voucher the proctor has redeemed (→ unlock) or an upgrade applied
// elsewhere (→ online self-service).
async function spSyncVoucher() {
  if (!spExam || !spExam.voucherId) return;
  try {
    const res = await fetch(`${SP_API}/api/vouchers`);
    const list = await res.json();
    const v = Array.isArray(list) ? list.find(x => x.voucherId === spExam.voucherId) : null;
    if (!v) return;
    let changed = false;
    if (v.status === 'Redeemed' && !spExam.proctorUnlocked) { spExam.proctorUnlocked = true; changed = true; }
    if (v.currentType === 'Internet Proctored' && spExam.type !== 'online') {
      Object.assign(spExam, { type: 'online', paymentRequired: false, paymentStatus: 'paid', proctorUnlocked: true });
      changed = true;
    }
    if (changed) { spSaveExam(spExam); renderExamCard(); }
  } catch (e) { /* offline / mock — ignore */ }
}

// ---- Pre-login: Learning Material voucher redemption ----
function toggleVoucherRedeem() {
  const p = document.getElementById('lm-voucher-panel'); if (!p) return;
  p.style.display = (p.style.display === 'none' || !p.style.display) ? 'block' : 'none';
}
function spVoucherStatus(msg, kind, icon) {
  const el = document.getElementById('lm-voucher-status'); if (!el) return;
  el.style.display = 'block'; el.innerHTML = spBadge(msg, kind, icon);
  if (el.firstChild) { el.firstChild.style.whiteSpace = 'normal'; el.firstChild.style.textAlign = 'left'; el.firstChild.style.lineHeight = '1.45'; el.firstChild.style.alignItems = 'flex-start'; }
}
function requestVoucherRedeem() {
  const code = (document.getElementById('lm-voucher-code').value || '').trim();
  const btn = document.getElementById('lm-voucher-btn');
  if (code.length < 4) { spVoucherStatus('That code doesn’t look valid. Please check and try again.', 'pending', 'error'); return; }
  btn.disabled = true; btn.innerHTML = `<i class="material-icons spin">sync</i> Sending request…`;
  setTimeout(() => {
    spVoucherStatus('Code valid · Redemption requested — your proctor will approve it shortly.', 'info', 'hourglass_top');
    btn.innerHTML = `<i class="material-icons">schedule</i> Awaiting proctor approval`;
    setTimeout(() => {
      spVoucherStatus('Voucher redeemed ✓ — your learning material is unlocked. A confirmation email has been sent.', 'paid', 'check_circle');
      btn.disabled = false; btn.className = 'btn-primary'; btn.style.width = '100%';
      btn.innerHTML = `<i class="material-icons">menu_book</i> Open learning material`;
      btn.onclick = () => spToast('Sign in to access your unlocked learning material.', 'info');
      spLogEmail('Learning Material Voucher Redeemed');
    }, 2200);
  }, 1200);
}

// ==========================================================================
// MATERIAL + EXAM BUNDLES  (candidate buys a material; one purchase also
// allocates the exam voucher. Self-buyers get INSTANT access — no code
// re-entry. The emailed code + magic link is the receipt / transfer path,
// used only when a code was ASSIGNED to someone.)
// ==========================================================================
const SP_MATERIALS = [
  { id: 'mat_food_safety', title: 'Food Protection Manager', cert: 'Certified Restaurant Manager', desc: 'Full study guide, practice questions and flashcards for the Manager exam.', img: 'thumb_food_safety.png', material: 54, exam: 75 },
  { id: 'mat_haccp',       title: 'HACCP Level 3',            cert: 'HACCP Advanced',                desc: 'Hazard analysis, critical control points and audit-ready coursework.',    img: 'thumb_haccp.png',       material: 64, exam: 75 },
  { id: 'mat_allergen',    title: 'Allergen Awareness',       cert: 'Allergen Management',           desc: 'Allergen control, labelling and cross-contamination essentials.',          img: 'thumb_allergen.png',    material: 39, exam: 75 }
];
const SP_OWNED_KEY = 'sp_owned_materials';
function spOwnedMaterials() { try { return JSON.parse(localStorage.getItem(SP_OWNED_KEY) || '[]'); } catch (e) { return []; } }
function spAddOwnedMaterial(id) { if (!id) return; try { const a = spOwnedMaterials(); if (!a.includes(id)) { a.push(id); localStorage.setItem(SP_OWNED_KEY, JSON.stringify(a)); } } catch (e) {} }
function spBundlePrice(m) { return (m.material || 0) + (m.exam || 0); }

function renderMaterialBundles() {
  const grid = document.getElementById('material-bundle-grid'); if (!grid) return;
  const owned = spOwnedMaterials();
  grid.innerHTML = SP_MATERIALS.map(m => {
    const isOwned = owned.includes(m.id);
    const price = spBundlePrice(m);
    const cta = isOwned
      ? `<button class="btn-secondary" onclick="openOwnedMaterial('${m.id}')" style="display:inline-flex; align-items:center; gap:6px;"><i class="material-icons" style="font-size:18px;">menu_book</i> Open material</button>`
      : `<button class="btn-primary" onclick="openBundlePurchase('${m.id}')" style="display:inline-flex; align-items:center; gap:6px;"><i class="material-icons" style="font-size:18px;">shopping_bag</i> Buy bundle</button>`;
    return `<div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column;">
      <div style="height:120px; background:#eef1f7 url('${m.img}') center/cover no-repeat;"></div>
      <div style="padding:16px; display:flex; flex-direction:column; gap:8px; flex:1;">
        <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--on-sur-var);">${m.cert}</div>
        <h3 style="margin:0; font-size:16px; font-weight:700;">${m.title}</h3>
        <p style="margin:0; font-size:13px; color:var(--on-sur-var); line-height:1.45; flex:1;">${m.desc}</p>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
          <span style="font-size:18px; font-weight:800;">$${price.toFixed(2)}</span>
          ${cta}
        </div>
        ${isOwned ? `<span style="font-size:12px; color:#146c2e; font-weight:700;"><i class="material-icons" style="font-size:14px; vertical-align:middle;">check_circle</i> Owned · exam voucher allocated</span>` : `<span style="font-size:12px; color:var(--on-sur-var);">Material + ${m.cert} exam voucher</span>`}
      </div>
    </div>`;
  }).join('');
}

let spBundleMaterial = null;
function openBundlePurchase(id) {
  const m = SP_MATERIALS.find(x => x.id === id); if (!m) return;
  spBundleMaterial = m;
  const set = (i, t) => { const el = document.getElementById(i); if (el) el.textContent = t; };
  set('bp-mat-line', `${m.title} — study material`); set('bp-mat-fee', `$${m.material.toFixed(2)}`);
  set('bp-exam-line', `${m.cert} exam voucher`);      set('bp-exam-fee', `$${m.exam.toFixed(2)}`);
  set('bp-total', `$${spBundlePrice(m).toFixed(2)}`); set('bp-btn-label', `Pay $${spBundlePrice(m).toFixed(2)}`);
  const mod = document.getElementById('bundle-purchase-modal'); if (mod) mod.classList.add('active', 'open');
}

async function confirmBundlePurchase() {
  const m = spBundleMaterial; if (!m) return;
  const btn = document.getElementById('bp-pay-btn'); const orig = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = `<i class="material-icons spin">sync</i> Processing…`; }
  let data = null;
  try {
    await new Promise(r => setTimeout(r, 1200)); // mock payment delay
    const candidateId = (typeof CANDIDATE_STATE !== 'undefined' && CANDIDATE_STATE.candidateId) || 'cand_001';
    const email = (typeof CANDIDATE_STATE !== 'undefined' && CANDIDATE_STATE.email) || (document.getElementById('login-email') || {}).value || '';
    const res = await fetch(`${SP_API}/api/bundles/purchase`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId: m.id, materialTitle: m.title, cert: m.cert, type: 'Internet Proctored', price: spBundlePrice(m), source: 'self-purchased', candidateId, email })
    });
    data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'purchase failed');
  } catch (e) {
    console.error('Bundle purchase failed:', e);
    if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    spToast('Payment could not be completed. Please try again.', 'error');
    return;
  }

  // Self-purchase → auto-activated: unlock material + reflect the exam voucher
  // on the dashboard card. No code entry required.
  spAddOwnedMaterial(m.id);
  Object.assign(spExam, { type: 'online', examName: m.cert, paymentRequired: false, paymentStatus: 'paid', proctorUnlocked: true, voucherId: data.voucherId, voucherType: 'Internet Proctored' });
  spSaveExam(spExam);

  const mod = document.getElementById('bundle-purchase-modal'); if (mod) mod.classList.remove('active', 'open');
  if (btn) { btn.disabled = false; btn.innerHTML = orig; }
  renderMaterialBundles(); renderExamCard();
  spToast(`Bundle purchased — ${m.title} unlocked. Receipt emailed.`, 'success');
  spLogEmail('Material + Exam Bundle — Receipt & Access');
}

function openOwnedMaterial() {
  try { if (typeof navigateTo === 'function') { navigateTo('cand-learn'); return; } } catch (e) {}
  window.open('learning_material.html', '_blank');
}

// ---- First-time activation for ASSIGNED codes (magic link or manual entry) ----
async function activateAccess(code, opts) {
  opts = opts || {};
  const statusEl = document.getElementById('activate-access-status');
  const show = (msg, kind, icon) => { if (statusEl) { statusEl.style.display = 'block'; statusEl.innerHTML = spBadge(msg, kind, icon); } };
  if (!code || code.trim().length < 4) { show('That code doesn’t look valid. Please check and try again.', 'pending', 'error'); return; }
  code = code.trim();
  show('Activating your access…', 'info', 'hourglass_top');
  try {
    const res = await fetch(`${SP_API}/api/vouchers/${encodeURIComponent(code)}/activate`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'activation failed');
    const v = data.voucher;
    if (v.materialId) spAddOwnedMaterial(v.materialId);
    const isNet = v.currentType === 'Internet Proctored';
    Object.assign(spExam, { type: isNet ? 'online' : 'in-class', examName: v.cert || spExam.examName, paymentRequired: false, paymentStatus: isNet ? 'paid' : 'not_required', proctorUnlocked: isNet, voucherId: v.voucherId, voucherType: v.currentType });
    spSaveExam(spExam);
    show(data.alreadyActive ? 'Already activated ✓ — your material and exam voucher are ready.' : 'Activated ✓ — your material and exam voucher are unlocked.', 'paid', 'check_circle');
    renderMaterialBundles(); renderExamCard();
    if (!opts.silent) spToast(`Voucher ${v.voucherId} activated.`, 'success');
  } catch (e) {
    console.error('Activation failed:', e);
    show(e.message || 'We couldn’t activate that code. Please check it and try again.', 'pending', 'error');
  }
}
function activateAccessFromInput() { const el = document.getElementById('activate-code-input'); activateAccess(el ? el.value : ''); }

// ---- Pre-login: sign in with an exam voucher code -------------------------
// A candidate who holds a voucher (bought online on the website or assigned by
// a school) can enter it on the login screen to be signed straight into the
// portal with the exam unlocked — no email/password required.
function toggleVoucherLogin() {
  const panel = document.getElementById('exam-voucher-panel');
  if (!panel) return;
  const open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : 'block';
  if (!open) { const inp = document.getElementById('exam-voucher-code'); if (inp) inp.focus(); }
}

async function handleVoucherLogin() {
  const inp = document.getElementById('exam-voucher-code');
  const btn = document.getElementById('exam-voucher-btn');
  const statusEl = document.getElementById('exam-voucher-status');
  const show = (msg, kind, icon) => { if (statusEl) { statusEl.style.display = 'block'; statusEl.innerHTML = spBadge(msg, kind, icon); } };
  const code = inp ? inp.value.trim() : '';
  if (code.length < 4) { show('That code doesn’t look valid. Please check and try again.', 'pending', 'error'); if (inp) inp.focus(); return; }

  const orig = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = `<i class="material-icons spin">sync</i> Signing you in…`; }
  show('Verifying your voucher…', 'info', 'hourglass_top');

  let voucher = null;
  try {
    // Activate flips an Assigned voucher to Activated and returns it; an
    // already-active voucher is returned unchanged. Works for online-purchased
    // and school-assigned codes alike.
    const res = await fetch(`${SP_API}/api/vouchers/${encodeURIComponent(code)}/activate`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'We couldn’t verify that voucher.');
    voucher = data.voucher;
  } catch (e) {
    if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    show(e.message || 'We couldn’t verify that voucher. Please check it and try again.', 'pending', 'error');
    return;
  }

  // Reflect the voucher on the dashboard exam card (single source of truth).
  if (voucher.materialId) spAddOwnedMaterial(voucher.materialId);
  const isNet = voucher.currentType === 'Internet Proctored';
  Object.assign(spExam, {
    type: isNet ? 'online' : 'in-class',
    examName: voucher.cert || spExam.examName,
    paymentRequired: false,
    paymentStatus: isNet ? 'paid' : 'not_required',
    proctorUnlocked: isNet,
    voucherId: voucher.voucherId,
    voucherType: voucher.currentType
  });
  spSaveExam(spExam);

  // Sign the candidate in (mirrors handleLogin): reveal chrome, land on home.
  show('Voucher verified ✓ — signing you in…', 'paid', 'check_circle');
  setTimeout(() => {
    CANDIDATE_STATE.examDate = new Date();
    const mainHeader = document.getElementById('main-header');
    if (mainHeader) mainHeader.classList.remove('hidden');
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.classList.remove('hidden');
    navigateTo('cand-home');
    try { renderExamCard(); } catch (e) {}
    try { checkVoucherStatus(); } catch (e) {}
    spToast(`Signed in with voucher ${voucher.voucherId}. ${isNet ? 'Your exam is ready to start.' : 'Your in-class exam is set.'}`, 'success');
    if (btn) { btn.disabled = false; btn.innerHTML = orig; }
  }, 600);
}

// Render bundles + handle a one-click activation magic link (?activate=CODE).
function spInitBundles() {
  try { renderMaterialBundles(); } catch (e) {}
  try {
    const ap = new URLSearchParams(window.location.search).get('activate');
    if (ap) {
      const inp = document.getElementById('activate-code-input'); if (inp) inp.value = ap;
      activateAccess(ap, { silent: false });
    }
  } catch (e) {}
}

function spReparentModals() {
  // .mock-env carries a transform, which traps position:fixed modals inside it.
  // Move overlay modals to <body> so they cover the viewport correctly.
  try { document.querySelectorAll('.modal-overlay').forEach(m => { if (m.parentElement !== document.body) document.body.appendChild(m); }); } catch (e) {}
}
document.addEventListener('DOMContentLoaded', () => { try { renderExamCard(); } catch (e) {} try { spSyncVoucher(); } catch (e) {} spReparentModals(); spInitBundles(); });
try { renderExamCard(); } catch (e) {}
try { spReparentModals(); } catch (e) {}
