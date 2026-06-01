/* ==========================================================================
   SECUREPROCTOR AI - CORE INTERACTIVE JS MOTOR ENGINE
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. GLOBAL STATE DEFINITIONS & INITIAL MOCK DATA
// --------------------------------------------------------------------------
let CURRENT_USER = {
  name: "Dr. Sarah Jenkins",
  role: "Department of Computer Science",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  timezone: "pst"
};

let ACTIVE_TAB = "dashboard-panel";
let THEME = "light";
let IS_ONBOARDED = false;
let ACTIVE_GRID_SIZE = 4;
let EXPORT_FORMAT = "pdf";

// Live candidates currently undergoing examinations
const CANDIDATES = [
  { id: "CAN-092", name: "Alex Rivera", exam: "CS101 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 15, eyes: {x: 0, y: 0}, stateTimer: 0, actionStatus: "Monitored" },
  { id: "CAN-183", name: "Beatrice Vance", exam: "CS101 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 20, eyes: {x: 0, y: 0}, stateTimer: 0, actionStatus: "Monitored" },
  { id: "CAN-754", name: "Clara Oswald", exam: "ECON202 Final", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 10, eyes: {x: 0, y: 0}, stateTimer: 0, actionStatus: "Monitored" },
  { id: "CAN-442", name: "David Miller", exam: "MGT300 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 12, eyes: {x: 0, y: 0}, stateTimer: 0, actionStatus: "Monitored" },
  { id: "CAN-891", name: "Elena Rostova", exam: "CS101 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 14, eyes: {x: 0, y: 0}, stateTimer: 0, actionStatus: "Monitored" },
  { id: "CAN-302", name: "Frank Wright", exam: "ECON202 Final", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 8, eyes: {x: 0, y: 0}, stateTimer: 0, actionStatus: "Monitored" }
];

// Historical and Real-time Incident Audit Log database
let INCIDENTS = [
  { id: "INC-8812", name: "Clara Oswald", exam: "ECON202 Final", rule: "Multiple Persons Detected", time: "06:40:12", severity: "high", status: "Flagged", confidence: 96, notes: "AI identified secondary human skeletal profile in background. Action pending." },
  { id: "INC-8809", name: "Beatrice Vance", exam: "CS101 Midterm", rule: "Gaze Deviation (Excessive)", time: "06:38:45", severity: "medium", status: "In Review", confidence: 88, notes: "Candidate repeatedly looking away from primary screen boundary box for intervals > 8s." },
  { id: "INC-8794", name: "Frank Wright", exam: "ECON202 Final", rule: "Suspicious Voice Frequency", time: "06:21:30", severity: "medium", status: "Resolved", confidence: 74, notes: "Audio threshold limit exceeded. Confirmed as background traffic noise; dismissed by Sarah Jenkins." }
];

// Calendar Shift schedules database
let SHIFTS = [
  { date: "2026-05-19", type: "session", exam: "CS101 Midterm", start: "09:00", end: "12:00" },
  { date: "2026-05-19", type: "session", exam: "ECON202 Final", start: "14:00", end: "16:00" },
  { date: "2026-05-20", type: "available", exam: "", start: "10:00", end: "17:00" },
  { date: "2026-05-22", type: "blocked", exam: "", start: "08:00", end: "13:00" }
];

// Simulated system alert history list
let NOTIFICATIONS = [];

// Selected date for Calendar operations
let CALENDAR_SELECTED_DATE = "2026-05-19";
let CALENDAR_CURRENT_MONTH = 4; // May (0-indexed)
let CALENDAR_CURRENT_YEAR = 2026;

// --------------------------------------------------------------------------
// 2. BOOTSTRAP INITIALIZATION
// --------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  // Load Theme Preference from LocalStorage
  if (localStorage.getItem("proctor_theme")) {
    THEME = localStorage.getItem("proctor_theme");
    document.documentElement.setAttribute("data-t", THEME);
  }
  
  // Load layout size preference on startup
  if (localStorage.getItem("proctor_grid_size")) {
    ACTIVE_GRID_SIZE = parseInt(localStorage.getItem("proctor_grid_size"), 10);
    const grid = document.getElementById("live-camera-grid");
    if (grid) {
      grid.className = `candidate-video-grid grid-${ACTIVE_GRID_SIZE}`;
    }
  }

  initClock();
  initMfaInputHandlers();
  initCanvasVideoSimulations();
  renderDashboardCharts();
  renderIncidentTable();
  renderCalendar();
  renderAgendaList();
  renderSnoozedPanel();
  
  // Set default values in forms
  document.getElementById("sidebar-name").textContent = CURRENT_USER.name;
  document.getElementById("settings-name-input").value = CURRENT_USER.name;
  document.getElementById("settings-timezone-input").value = CURRENT_USER.timezone;
  document.getElementById("settings-role-input").value = CURRENT_USER.role;
  
  // Initialize toggle buttons
  const themeSwitchBtn = document.getElementById("theme-switcher-btn");
  if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener("click", toggleTheme);
    const btnIcon = document.getElementById("theme-btn-icon");
    if (btnIcon) {
      btnIcon.textContent = THEME === "light" ? "dark_mode" : "light_mode";
    }
  }
  
  // Sync incident filter query preference on startup
  if (localStorage.getItem("proctor_incident_filter")) {
    const savedFilter = localStorage.getItem("proctor_incident_filter");
    const filterBtn = Array.from(document.querySelectorAll(".chip-row .chip")).find(c => {
      const txt = c.textContent.toLowerCase();
      if (savedFilter === "high") return txt === "critical";
      if (savedFilter === "medium") return txt === "warning";
      return txt === savedFilter;
    });
    if (filterBtn) {
      // Small timeout to let table render first
      setTimeout(() => {
        const freshBtn = Array.from(document.querySelectorAll(".chip-row .chip")).find(c => {
          const txt = c.textContent.toLowerCase();
          if (savedFilter === "high") return txt === "critical";
          if (savedFilter === "medium") return txt === "warning";
          return txt === savedFilter;
        });
        if (freshBtn) filterIncidentHub(savedFilter, freshBtn);
      }, 50);
    }
  }
  
  // Initialize mobile sidebar toggle
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("app-sidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
    });
  }

  // Handle outside clicks to close notifications dropdown
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("notif-dropdown-panel");
    const dropdownBtn = document.getElementById("notif-dropdown-btn");
    if (dropdown && dropdownBtn && !dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) {
      dropdown.classList.add("hidden");
      dropdownBtn.setAttribute("aria-expanded", "false");
    }
  });

  const notifBtn = document.getElementById("notif-dropdown-btn");
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      const panel = document.getElementById("notif-dropdown-panel");
      const isHidden = panel.classList.toggle("hidden");
      notifBtn.setAttribute("aria-expanded", !isHidden);
      if (!isHidden) {
        // Redraw notifications on open
        renderNotificationsDropdown();
      }
    });
  }

  // Bind Sidebar Nav click toggles
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPanel = btn.getAttribute("data-target");
      changePanel(targetPanel);
      document.querySelectorAll(".sidebar-nav .nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      // Close mobile drawer if open
      sidebar.classList.remove("mobile-open");
    });
  });
});

// Real-time synchronized digital clock
function initClock() {
  const clockEl = document.getElementById("server-time-string");
  if (!clockEl) return;
  
  setInterval(() => {
    const now = new Date();
    // Force year 2026 to align with mock requirements
    now.setFullYear(2026);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    
    clockEl.innerHTML = `${month} ${day}, ${hrs}:${mins}:${secs} PST`;
  }, 1000);
}

// --------------------------------------------------------------------------
// 3. AUTHENTICATION CONTROLLER (MFA & LOGIN FLOWS)
// --------------------------------------------------------------------------
function toggleAuthPanel(panelId) {
  document.querySelectorAll("#auth-view .auth-card").forEach(card => card.classList.add("hidden"));
  document.getElementById(`${panelId}-card`).classList.remove("hidden");
}

function handleLogin(event) {
  event.preventDefault();
  
  // Transition to MFA
  const loginSubmitBtn = document.getElementById("login-submit-btn");
  loginSubmitBtn.disabled = true;
  loginSubmitBtn.innerHTML = `<i class="material-icons spin-loader">sync</i> Processing Secure SSO...`;
  
  setTimeout(() => {
    toggleAuthPanel("mfa");
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.innerHTML = `<span>Sign In</span> <i class="material-icons">arrow_forward</i>`;
    // Focus first MFA slot
    setTimeout(() => {
      const firstDigitInput = document.querySelector(".mfa-digit[data-index='1']");
      if (firstDigitInput) firstDigitInput.focus();
    }, 150);
  }, 800);
}

// Auto tab and handle deleting backspace in MFA code inputs
function initMfaInputHandlers() {
  const digits = document.querySelectorAll(".mfa-digit");
  
  digits.forEach(inp => {
    inp.addEventListener("input", (e) => {
      const val = inp.value;
      if (val.length === 1) {
        const nextIndex = parseInt(inp.getAttribute("data-index")) + 1;
        const nextEl = document.querySelector(`.mfa-digit[data-index='${nextIndex}']`);
        if (nextEl) nextEl.focus();
      }
    });
    
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && inp.value === "") {
        const prevIndex = parseInt(inp.getAttribute("data-index")) - 1;
        const prevEl = document.querySelector(`.mfa-digit[data-index='${prevIndex}']`);
        if (prevEl) {
          prevEl.value = "";
          prevEl.focus();
        }
      }
    });
  });
}

function handleMfaVerify(event) {
  event.preventDefault();
  
  // Extract code
  let code = "";
  document.querySelectorAll(".mfa-digit").forEach(inp => code += inp.value);
  
  const mfaSubmit = document.getElementById("mfa-submit-btn");
  mfaSubmit.disabled = true;
  mfaSubmit.innerHTML = `<i class="material-icons spin-loader">sync</i> Validating Certificate...`;
  
  setTimeout(() => {
    if (code === "482915") {
      // Correct demo code
      document.getElementById("mfa-error").classList.add("hidden");
      // Go to onboarding wizard
      document.getElementById("auth-view").classList.remove("active");
      document.getElementById("onboarding-view").classList.add("active");
    } else {
      // Incorrect code
      document.getElementById("mfa-error").classList.remove("hidden");
      document.querySelectorAll(".mfa-digit").forEach(inp => {
        inp.classList.add("err-state");
        inp.value = "";
      });
      document.querySelector(".mfa-digit[data-index='1']").focus();
      mfaSubmit.disabled = false;
      mfaSubmit.innerHTML = `<span>Verify & Proceed</span> <i class="material-icons">verified_user</i>`;
    }
  }, 1000);
}

function regenerateOtp() {
  const code = Math.floor(100000 + Math.random() * 900000);
  const otpDisplay = document.getElementById("demo-otp");
  
  // Format as 3-3 code
  const codeStr = String(code);
  otpDisplay.textContent = `${codeStr.substring(0, 3)} ${codeStr.substring(3)}`;
  
  // Reset MFA fields
  document.querySelectorAll(".mfa-digit").forEach(inp => {
    inp.value = "";
    inp.classList.remove("err-state");
  });
  document.querySelector(".mfa-digit[data-index='1']").focus();
}

function handleSSOLogin(provider) {
  // Mock Google Workspace login
  alert(`Connecting secure OAUTH loop with ${provider} accounts...`);
  document.getElementById("auth-view").classList.remove("active");
  document.getElementById("onboarding-view").classList.add("active");
}

function handleRecovery(event) {
  event.preventDefault();
  alert("Password reset packet dispatched. Please check your system email inbox.");
  toggleAuthPanel("login");
}

// --------------------------------------------------------------------------
// 4. ONBOARDING DIAGNOSTICS & SETUP FLOW
// --------------------------------------------------------------------------
function nextOnboardStep(step) {
  // Hide all step panels
  document.querySelectorAll(".onboard-step-panel").forEach(p => p.classList.remove("active"));
  document.getElementById(`onboard-panel-${step}`).classList.add("active");
  
  // Update indicators
  document.querySelectorAll(".onboard-step-dot").forEach(dot => {
    const dotStep = parseInt(dot.getAttribute("data-step"));
    if (dotStep <= step) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
  
  // Update progress bar
  const progressFill = document.getElementById("onboard-progress");
  progressFill.style.width = `${(step / 3) * 100}%`;
}

function startSystemDiagnostics() {
  const checkBtn = document.getElementById("run-check-btn");
  checkBtn.disabled = true;
  checkBtn.innerHTML = `<i class="material-icons spin-loader">sync</i> Executing Node Self-Check...`;
  
  const tasks = [
    { id: "check-network", speed: 50, finalMsg: "250 Mbps Fiber Node connected (Ping: 4ms)" },
    { id: "check-camera", speed: 80, finalMsg: "FHD Webcam verified (FPS: 60fps locked)" },
    { id: "check-audio", speed: 110, finalMsg: "Audio frequency threshold calibrated (Stereo OK)" }
  ];
  
  tasks.forEach((t, i) => {
    const element = document.getElementById(t.id);
    const progressFill = element.querySelector(".sys-bar-fill");
    const statusVal = element.querySelector(".sys-status");
    const descText = element.querySelector(".sys-details p");
    const icon = element.querySelector(".sys-icon");
    
    setTimeout(() => {
      icon.classList.remove("pending");
      icon.classList.add("success");
      icon.innerHTML = `<i class="material-icons">check_circle</i>`;
      progressFill.style.width = "100%";
      statusVal.textContent = "Passed";
      statusVal.style.color = "var(--suc)";
      element.classList.add("success");
      descText.textContent = t.finalMsg;
      
      // If last item completed, reveal final transition button
      if (i === tasks.length - 1) {
        checkBtn.classList.add("hidden");
        document.getElementById("next-pref-btn").classList.remove("hidden");
      }
    }, (i + 1) * 1200);
  });
}

function completeOnboarding() {
  // Copy user preferences
  const soundPref = document.getElementById("pref-sound").checked;
  const desktopPref = document.getElementById("pref-desktop").checked;
  const customSens = document.getElementById("pref-sensitivity").value;
  
  document.getElementById("settings-notif-sound").checked = soundPref;
  document.getElementById("settings-notif-desktop").checked = desktopPref;
  document.getElementById("settings-sensitivity-slider").value = customSens === "1" ? 25 : (customSens === "2" ? 75 : 95);
  
  // Transition to main dashboard
  document.getElementById("onboarding-view").classList.remove("active");
  document.getElementById("main-view").classList.add("active");
  IS_ONBOARDED = true;
  
  // Welcome Notification toast
  pushToast("Integration Operational", "Welcome Sarah Jenkins. AI proctoring nodes are calibrated and active.", "medium");
  
  // Automatically trigger a quick guided onboarding tour modal
  setTimeout(() => {
    startAppTour();
  }, 1000);
}

// --------------------------------------------------------------------------
// 5. CLIENT-SIDE STATE ROUTER (TAB PANELS)
// --------------------------------------------------------------------------
function changePanel(panelId) {
  // Hide all panels
  document.querySelectorAll(".view-container .panel-section").forEach(p => p.classList.remove("active"));
  // Show target
  const target = document.getElementById(panelId);
  if (target) {
    target.classList.add("active");
    ACTIVE_TAB = panelId;
    
    // Sync sidebar button active class if jumped programmatically
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(btn => {
      if (btn.getAttribute("data-target") === panelId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Refresh views that contain dynamically drawn assets
    if (panelId === "dashboard-panel") {
      renderDashboardCharts();
      renderDashboardRoster();
    } else if (panelId === "incidents-panel") {
      renderIncidentTable();
    } else if (panelId === "reports-panel") {
      renderReportsCharts();
    } else if (panelId === "calendar-panel") {
      renderCalendar();
    } else if (panelId === "candidates-panel") {
      renderCandidatesPanel();
    } else if (panelId === "flags-panel") {
      renderFlagsPanel();
    } else if (panelId === "earnings-panel") {
      renderEarningsPanel();
      renderPaymentsPanel();
    }
  }
}

// --------------------------------------------------------------------------
// 6. SURVEILLANCE ENGINE (REAL-TIME VECTOR CAMERA CANVAS ANIMATIONS)
// --------------------------------------------------------------------------
const CANVAS_LOOPS = {};

function initCanvasVideoSimulations() {
  // Render active grids
  renderCameraGrid();
}

function renderCameraGrid() {
  const gridContainer = document.getElementById("live-camera-grid");
  if (!gridContainer) return;
  
  // Clear container
  gridContainer.innerHTML = "";
  
  // Fetch slice of candidates based on grid configuration size
  const activeFeedsCount = Math.min(ACTIVE_GRID_SIZE, CANDIDATES.length);
  document.getElementById("val-active-feeds").textContent = activeFeedsCount;
  
  for (let i = 0; i < activeFeedsCount; i++) {
    const c = CANDIDATES[i];
    
    const card = document.createElement("div");
    card.className = `candidate-card ${c.status === 'danger' ? 'danger' : (c.status === 'warning' ? 'warning' : '')}`;
    card.id = `card-${c.id}`;
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest(".candidate-actions-overlay")) return;
      openSupervisorPanel(c.id);
    });
    
    card.innerHTML = `
      <div class="candidate-header-overlay">
        <span class="candidate-name-badge">${c.name}</span>
        <span class="candidate-status-tag ${c.status === 'danger' ? 'danger' : (c.status === 'warning' ? 'warning' : 'clear')}" id="status-tag-${c.id}">
          ${c.status === 'danger' ? 'critical' : (c.status === 'warning' ? 'warning' : 'clear')}
        </span>
      </div>
      <canvas id="canvas-${c.id}" width="320" height="200"></canvas>
      <div class="candidate-actions-overlay" style="display: flex; gap: 4px; justify-content: center; width: 100%; padding: 8px;">
        <button class="mdbtn btn-tonal action-btn" onclick="openSupervisorPanel('${c.id}')" style="min-height: 28px; font-size: 10px; padding: 2px 8px; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 2px;" aria-label="Take custom action">
          <i class="material-icons" style="font-size: 14px;">explore</i> Act
        </button>
        <button class="mdbtn btn-outlined action-btn" onclick="quickSnoozeCandidate('${c.id}')" style="min-height: 28px; font-size: 10px; padding: 2px 8px; flex: 1; color: var(--pri); border-color: var(--pri); display: inline-flex; align-items: center; justify-content: center; gap: 2px;" aria-label="Snooze candidate warnings">
          <i class="material-icons" style="font-size: 14px;">schedule</i> Snooze
        </button>
        <button class="mdbtn btn-filled action-btn" onclick="quickResolveCandidate('${c.id}')" style="min-height: 28px; font-size: 10px; padding: 2px 8px; flex: 1; background: var(--suc); border-color: var(--suc); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 2px;" aria-label="Resolve candidate incident">
          <i class="material-icons" style="font-size: 14px;">check_circle</i> Solve
        </button>
      </div>
    `;
    
    gridContainer.appendChild(card);
    
    // Launch vector canvas drawing engine loop
    launchCandidateCanvasLoop(c);
  }
  
  // Re-calibrate notifications count
  updateIncidentCounter();
}

function launchCandidateCanvasLoop(c) {
  const canvas = document.getElementById(`canvas-${c.id}`);
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  // Store canvas coordinates variables inside the loop
  c.x = canvas.width / 2;
  c.y = canvas.height / 2 + 10;
  
  // Stop existing frame requests if running
  if (CANVAS_LOOPS[c.id]) {
    cancelAnimationFrame(CANVAS_LOOPS[c.id]);
  }
  
  function drawFrame() {
    if (!document.getElementById(`canvas-${c.id}`)) return; // Element destroyed
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Mock Camera background scan grid
    ctx.fillStyle = THEME === "dark" ? "#141416" : "#2d2d35";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw wireframe vector background wall corners
    ctx.strokeStyle = THEME === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.3);
    ctx.lineTo(canvas.width, canvas.height * 0.3);
    ctx.moveTo(canvas.width * 0.25, 0);
    ctx.lineTo(canvas.width * 0.25, canvas.height * 0.3);
    ctx.moveTo(canvas.width * 0.75, 0);
    ctx.lineTo(canvas.width * 0.75, canvas.height * 0.3);
    ctx.stroke();

    // Custom suspended offline card overlay
    if (c.actionStatus === "Suspended") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "var(--err)";
      ctx.font = "bold 13px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText("FEED CLOSED - SESSION SUSPENDED", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "11px 'Inter'";
      ctx.fillText("Candidate connection terminated by proctor admin.", canvas.width / 2, canvas.height / 2 + 10);
      return;
    }
    
    if (c.actionStatus === "Paused") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "var(--pri)";
      ctx.font = "bold 13px 'Inter'";
      ctx.textAlign = "center";
      ctx.fillText("EXAM SESSION PAUSED", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "11px 'Inter'";
      ctx.fillText("Candidate browser window locked.", canvas.width / 2, canvas.height / 2 + 10);
      return;
    }
    
    // 2. Animate Candidate Head/Eye micro-movements
    c.pulse += 0.03;
    c.stateTimer++;
    
    // State machine to trigger occasional gaze deviations or body offsets
    if (c.stateTimer > 200) {
      c.stateTimer = 0;
      // Change look target
      if (c.id === "CAN-183" && c.status === "warning") {
        // Beatrice Vance gaze violation simulation trigger
        c.eyes.x = 24; // Looks way to the right
        c.eyes.y = -2;
      } else if (c.id === "CAN-754" && c.status === "danger") {
        // Clara Oswald double person simulation
        c.eyes.x = -4;
        c.eyes.y = 2;
      } else {
        // Normal random eye glances
        c.eyes.x = Math.sin(c.pulse * 0.5) * 6;
        c.eyes.y = Math.cos(c.pulse * 0.3) * 3;
      }
    }
    
    const headX = canvas.width / 2 + Math.sin(c.pulse * 0.2) * 5;
    const headY = canvas.height / 2 - 12 + Math.cos(c.pulse * 0.15) * 3;
    
    // 3. Draw Candidate Wireframe Outline
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    
    // Shoulders
    ctx.beginPath();
    ctx.moveTo(headX - 60, canvas.height);
    ctx.quadraticCurveTo(headX - 45, headY + 50, headX - 25, headY + 32);
    ctx.lineTo(headX + 25, headY + 32);
    ctx.quadraticCurveTo(headX + 45, headY + 50, headX + 60, canvas.height);
    ctx.stroke();
    
    // Neck
    ctx.beginPath();
    ctx.moveTo(headX - 12, headY + 20);
    ctx.lineTo(headX - 12, headY + 35);
    ctx.moveTo(headX + 12, headY + 20);
    ctx.lineTo(headX + 12, headY + 35);
    ctx.stroke();
    
    // Secondary outline silhouette (Clara Oswald double person flag simulation)
    if (c.id === "CAN-754" && c.status === "danger") {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 1.5;
      
      const secHeadX = headX - 48;
      const secHeadY = headY + 12;
      
      // Secondary head outline
      ctx.beginPath();
      ctx.arc(secHeadX, secHeadY, 24, 0, Math.PI * 2);
      ctx.stroke();
      
      // Bounding box secondary
      ctx.strokeStyle = "var(--err)";
      ctx.strokeRect(secHeadX - 28, secHeadY - 28, 56, 56);
      ctx.fillStyle = "var(--err)";
      ctx.font = "bold 9px 'JetBrains Mono'";
      ctx.fillText(`UNREG. PROFILE`, secHeadX - 28, secHeadY - 32);
      
      // Reset stroke styles
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
    }
    
    // Primary Head circle
    ctx.beginPath();
    ctx.arc(headX, headY, 28, 0, Math.PI * 2);
    ctx.stroke();
    
    // Glasses details or face guides lines
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(headX - 28, headY);
    ctx.lineTo(headX + 28, headY);
    ctx.moveTo(headX, headY - 28);
    ctx.lineTo(headX, headY + 28);
    ctx.stroke();
    
    // Eyes & Pupils
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(headX - 10, headY - 2, 4, 0, Math.PI * 2); // Left eye
    ctx.arc(headX + 10, headY - 2, 4, 0, Math.PI * 2); // Right eye
    ctx.fill();
    
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(headX - 10 + (c.eyes.x * 0.15), headY - 2 + (c.eyes.y * 0.15), 1.8, 0, Math.PI * 2);
    ctx.arc(headX + 10 + (c.eyes.x * 0.15), headY - 2 + (c.eyes.y * 0.15), 1.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth (slight curve)
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(headX, headY + 12, 6, 0.1, Math.PI - 0.1);
    ctx.stroke();
    
    // 4. Draw AI Computer Vision Face Bounding Box overlay
    const boxColor = c.status === "danger" ? "var(--err)" : (c.status === "warning" ? "var(--wrn)" : "var(--suc)");
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 1.5;
    
    const boxW = 86;
    const boxH = 92;
    const boxX = headX - boxW / 2;
    const boxY = headY - boxH / 2 - 4;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    
    // Draw box corners
    ctx.fillStyle = boxColor;
    const cl = 8; // Corner line length
    ctx.fillRect(boxX - 2, boxY - 2, cl, 3);
    ctx.fillRect(boxX - 2, boxY - 2, 3, cl);
    ctx.fillRect(boxX + boxW - cl + 2, boxY - 2, cl, 3);
    ctx.fillRect(boxX + boxW - 1, boxY - 2, 3, cl);
    ctx.fillRect(boxX - 2, boxY + boxH - 1, cl, 3);
    ctx.fillRect(boxX - 2, boxY + boxH - cl + 2, 3, cl);
    ctx.fillRect(boxX + boxW - cl + 2, boxY + boxH - 1, cl, 3);
    ctx.fillRect(boxX + boxW - 1, boxY + boxH - cl + 2, 3, cl);
    
    // Bounding label text
    ctx.font = "bold 9px 'JetBrains Mono'";
    ctx.fillText(`ID: ${c.id}`, boxX + 4, boxY + 14);
    
    // Add real-time landmark dots (AI face mesh simulation)
    ctx.fillStyle = boxColor;
    const dots = [
      {dx: -10, dy: -2}, {dx: 10, dy: -2}, // eyes
      {dx: 0, dy: 5},                      // nose
      {dx: -8, dy: 13}, {dx: 8, dy: 13},   // mouth corners
      {dx: -20, dy: -8}, {dx: 20, dy: -8}, // eyebrows
      {dx: 0, dy: 24}                      // chin
    ];
    
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(headX + d.dx, headY + d.dy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // If warning/danger, overlay a glowing alert banner on the canvas
    if (c.status !== "clear") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
      ctx.fillStyle = boxColor;
      ctx.font = "bold 10px 'Inter'";
      ctx.textAlign = "left";
      const ruleText = c.status === "danger" ? "CRITICAL: MULTIPLE PROFILES DETECTED" : "WARNING: GAZE DEVIATION LIMIT EXCEEDED";
      ctx.fillText(ruleText, 10, canvas.height - 7);
    }
    
    // Real-time audio waveform feedback overlay
    c.audio += (Math.random() - 0.5) * 4;
    c.audio = Math.max(2, Math.min(60, c.audio));
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fillRect(10, canvas.height - 35, 60, 4);
    ctx.fillStyle = c.audio > 40 ? "var(--err)" : "var(--suc)";
    ctx.fillRect(10, canvas.height - 35, c.audio, 4);
    
    // Request next animation frame
    CANVAS_LOOPS[c.id] = requestAnimationFrame(drawFrame);
  }
  
  drawFrame();
}

// --------------------------------------------------------------------------
// 7. SURVEILLANCE ACTIONS CONTROLS & Real-Time Alert Dispatcher
// --------------------------------------------------------------------------
function toggleFeedGridSize() {
  const grid = document.getElementById("live-camera-grid");
  if (!grid) return;
  
  if (ACTIVE_GRID_SIZE === 4) {
    ACTIVE_GRID_SIZE = 6;
    grid.className = "candidate-video-grid grid-6";
  } else {
    ACTIVE_GRID_SIZE = 4;
    grid.className = "candidate-video-grid grid-4";
  }
  
  localStorage.setItem("proctor_grid_size", ACTIVE_GRID_SIZE);
  
  renderCameraGrid();
}

function filterLiveGrid(type) {
  document.getElementById("filter-all-feeds").classList.toggle("selected", type === 'all');
  document.getElementById("filter-flagged-feeds").classList.toggle("selected", type === 'flagged');
  
  const activeFeedsCount = Math.min(ACTIVE_GRID_SIZE, CANDIDATES.length);
  
  for (let i = 0; i < activeFeedsCount; i++) {
    const c = CANDIDATES[i];
    const card = document.getElementById(`card-${c.id}`);
    if (card) {
      if (type === "all") {
        card.style.display = "block";
      } else {
        card.style.display = c.status !== "clear" ? "block" : "none";
      }
    }
  }
}

// Proactively simulate an AI flagged alert in the grid
let AI_SIMULATION_INTERVAL = null;
function startAISurveillanceSim() {
  if (AI_SIMULATION_INTERVAL) clearInterval(AI_SIMULATION_INTERVAL);
  
  AI_SIMULATION_INTERVAL = setInterval(() => {
    // Generate AI incidents randomly for demonstration
    const activeFeeds = CANDIDATES.slice(0, ACTIVE_GRID_SIZE);
    // Find candidate who is clear
    const clearCandidates = activeFeeds.filter(c => c.status === "clear" && c.actionStatus === "Monitored");
    if (clearCandidates.length === 0) return;
    
    // Pick random candidate
    const candidate = clearCandidates[Math.floor(Math.random() * clearCandidates.length)];
    
    // Randomize violation
    const isCritical = Math.random() > 0.6;
    if (isCritical) {
      // Trigger multiple persons outline
      candidate.status = "danger";
      triggerAIAlert(candidate, "Multiple Persons Detected", "high", "AI identified secondary human silhouette outline in primary frame.");
    } else {
      // Trigger gaze deviation
      candidate.status = "warning";
      triggerAIAlert(candidate, "Gaze Deviation (Excessive)", "medium", "Candidate eyes diverted from screen boundaries repeatedly for >8s.");
    }
    
    // Re-render grid card classes and indicators
    const card = document.getElementById(`card-${candidate.id}`);
    if (card) {
      card.className = `candidate-card ${candidate.status === 'danger' ? 'danger' : 'warning'}`;
      const statusTag = document.getElementById(`status-tag-${candidate.id}`);
      if (statusTag) {
        statusTag.textContent = candidate.status === 'danger' ? 'critical' : 'warning';
        statusTag.className = `candidate-status-tag ${candidate.status === 'danger' ? 'danger' : 'warning'}`;
      }
    }
    
    // Sync counts
    updateIncidentCounter();
    renderDashboardRoster();
  }, 12000); // Trigger every 12 seconds
}

// Start simulation once main dashboard goes active
setInterval(() => {
  if (IS_ONBOARDED && ACTIVE_TAB === "live-panel" && !AI_SIMULATION_INTERVAL) {
    startAISurveillanceSim();
  }
}, 2000);

function triggerAIAlert(c, rule, severity, desc) {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const alertId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Create incident log
  const newIncident = {
    id: alertId,
    name: c.name,
    exam: c.exam,
    rule: rule,
    time: time,
    severity: severity,
    status: "Flagged",
    confidence: Math.floor(82 + Math.random() * 16),
    notes: desc
  };
  
  INCIDENTS.unshift(newIncident);
  
  // Play our new custom synthesizer priority alarms
  const soundActive = document.getElementById("settings-notif-sound").checked;
  if (soundActive) {
    playAlertChime(severity);
  }
  
  // Trigger top banner critical alerts flashing & scrolling marquee text
  triggerCriticalMarqueeAlert(c.name, rule);
  
  // Dynamic Chart Update: Increment incident counts in the active hourly dataset
  CHART_DATASET["1h"].incidents[CHART_DATASET["1h"].incidents.length - 1]++;
  if (rule.toLowerCase().includes("gaze")) {
    CHART_DATASET["1h"].gaze[CHART_DATASET["1h"].gaze.length - 1]++;
  } else if (rule.toLowerCase().includes("voice") || rule.toLowerCase().includes("noise")) {
    CHART_DATASET["1h"].noise[CHART_DATASET["1h"].noise.length - 1]++;
  } else {
    CHART_DATASET["1h"].profile[CHART_DATASET["1h"].profile.length - 1]++;
  }
  renderDashboardCharts();
  
  // System Toast
  pushToast(`AI Flag: ${c.name}`, `${rule} (${newIncident.confidence}% confidence)`, severity);
  
  // Push to Live Sidebar Alert list
  pushAlertToLiveSidebar(newIncident);
  
  // Notification dropdown feed push
  NOTIFICATIONS.unshift({
    id: alertId,
    title: `AI Flag: ${c.name}`,
    desc: `${rule} detected on ${c.exam}.`,
    severity: severity,
    time: "Just now"
  });
  
  // Update header unread badges
  const unreadCount = document.getElementById("notif-unread-count");
  if (unreadCount) {
    unreadCount.textContent = NOTIFICATIONS.length;
    unreadCount.classList.remove("hidden");
  }
  
  // Re-draw components if active
  if (ACTIVE_TAB === "incidents-panel") {
    renderIncidentTable();
  }
}

function pushAlertToLiveSidebar(inc) {
  const sidebarList = document.getElementById("live-alerts-list");
  if (!sidebarList) return;
  
  // Remove empty placeholder
  const empty = sidebarList.querySelector(".alert-empty-state");
  if (empty) empty.remove();
  
  const alertEl = document.createElement("div");
  alertEl.className = `alert-card-log ${inc.severity}`;
  alertEl.id = `alert-log-${inc.id}`;
  alertEl.onclick = () => openIncidentDrawer(inc.id);
  
  alertEl.innerHTML = `
    <div class="alert-log-header">
      <span class="alert-log-title">${inc.rule}</span>
      <span class="alert-log-time">${inc.time}</span>
    </div>
    <div class="alert-log-desc">${inc.notes}</div>
    <div class="alert-log-candidate">Candidate: ${inc.name} (${inc.exam})</div>
  `;
  
  sidebarList.insertBefore(alertEl, sidebarList.firstChild);
}

function playAlertBeep(freq) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.warn("Audio Context block by browser security.", e);
  }
}

function pushToast(title, desc, severity) {
  // Create toast container dynamically
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style = "position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 9999;";
    document.body.appendChild(container);
  }
  
  const toast = document.createElement("div");
  const color = severity === "high" ? "var(--err)" : (severity === "medium" ? "var(--wrn)" : "var(--suc)");
  const bg = severity === "high" ? "#fcedeb" : (severity === "medium" ? "#fff8db" : "#d2f4de");
  const textCol = severity === "high" ? "#601410" : (severity === "medium" ? "#3c2800" : "#003917");
  
  toast.style = `background: ${bg}; color: ${textCol}; border-left: 4px solid ${color}; padding: 16px; border-radius: 8px; box-shadow: var(--shadow-lg); min-width: 280px; animation: slideDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: flex; gap: 12px; align-items: start;`;
  
  const toastIcon = severity === 'high' ? 'cancel' : (severity === 'medium' ? 'warning' : 'check_circle');
  toast.innerHTML = `
    <i class="material-icons" style="color:${color};">${toastIcon}</i>
    <div>
      <h4 style="margin: 0; font-size:13px; font-weight:700;">${title}</h4>
      <p style="margin: 4px 0 0; font-size:11px; opacity: 0.9;">${desc}</p>
    </div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "slideDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards";
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

function sendMockWarning(candidateId) {
  const c = CANDIDATES.find(item => item.id === candidateId);
  if (!c) return;
  
  const warnText = prompt(`Send customized warning overlay message directly to candidate ${c.name}:`, "Automated Alert: AI detected gaze deviation from monitor boundaries. Please align eyes with center of screen.");
  if (warnText === null) return;
  
  c.warnings++;
  pushToast("Warning Dispatched", `Sent critical warning to ${c.name} (${c.warnings} total)`, "medium");
  
  // Reset candidate status warning level back to clear
  setTimeout(() => {
    c.status = "clear";
    const card = document.getElementById(`card-${c.id}`);
    if (card) {
      card.className = "candidate-card";
      const statusTag = document.getElementById(`status-tag-${c.id}`);
      if (statusTag) {
        statusTag.textContent = "clear";
        statusTag.className = "candidate-status-tag clear";
      }
    }
    updateIncidentCounter();
    renderDashboardRoster();
  }, 3000);
}

function togglePauseExam(candidateId, btn) {
  const c = CANDIDATES.find(item => item.id === candidateId);
  if (!c) return;
  
  if (c.actionStatus === "Monitored") {
    c.actionStatus = "Paused";
    btn.innerHTML = `<i class="material-icons">play_arrow</i> <span>Resume</span>`;
    btn.className = "mdbtn btn-tonal action-btn";
    pushToast("Exam Paused", `${c.name}'s browser interface locked in pause overlay.`, "medium");
  } else {
    c.actionStatus = "Monitored";
    btn.innerHTML = `<i class="material-icons">pause</i> <span>Pause</span>`;
    btn.className = "mdbtn btn-filled action-btn";
    pushToast("Exam Resumed", `${c.name}'s proctor node connection active.`, "success");
  }
}

function terminateExam(candidateId) {
  const c = CANDIDATES.find(item => item.id === candidateId);
  if (!c) return;
  
  const confirmAction = confirm(`WARNING: Are you absolutely certain you want to forcefully TERMINATE and lock ${c.name}'s registered exam feed? This action is legally binding.`);
  if (!confirmAction) return;
  
  c.actionStatus = "Suspended";
  c.status = "danger";
  
  // Re-style card in grids
  const card = document.getElementById(`card-${c.id}`);
  if (card) {
    card.className = "candidate-card danger";
    const tag = document.getElementById(`status-tag-${c.id}`);
    if (tag) {
      tag.textContent = "critical";
      tag.className = "candidate-status-tag danger";
    }
  }
  
  pushToast("Exam Terminated", `${c.name}'s registration has been revoked. Incident logged.`, "high");
  
  // Push incident log to Database
  triggerAIAlert(c, "Session Revocation", "high", "Exam forcefully terminated by proctor SARAH JENKINS due to visual security non-compliance.");
}

function updateIncidentCounter() {
  const activeFeeds = CANDIDATES.slice(0, ACTIVE_GRID_SIZE);
  const flaggedCount = activeFeeds.filter(c => c.status !== 'clear').length;
  
  const counterEl = document.getElementById("live-flagged-count");
  if (counterEl) counterEl.textContent = flaggedCount;
  
  // Update dashboard kpi indicator
  const dashIncVal = document.getElementById("val-flagged-incidents");
  if (dashIncVal) dashIncVal.textContent = flaggedCount;
  
  const trendColor = document.getElementById("incidents-trend-color");
  if (trendColor) {
    if (flaggedCount > 0) {
      trendColor.className = "kpi-trend trend-down";
      trendColor.innerHTML = `<i class="material-icons">trending_up</i> Alert`;
    } else {
      trendColor.className = "kpi-trend trend-up";
      trendColor.innerHTML = `<i class="material-icons">arrow_forward</i> Stable`;
    }
  }

  // Update navbar incident badge count
  const badge = document.getElementById("incident-counter-badge");
  if (badge) {
    const activeAlerts = INCIDENTS.filter(i => i.status === "Flagged").length;
    badge.textContent = activeAlerts;
    badge.classList.toggle("hidden", activeAlerts === 0);
  }
}

// --------------------------------------------------------------------------
// 8. HUB 1: MAIN OPERATIONS DASHBOARD (SVG CHARTING ENGINE)
// --------------------------------------------------------------------------
function renderDashboardRoster() {
  const list = document.getElementById("dashboard-active-roster");
  if (!list) return;
  
  list.innerHTML = "";
  
  const activeFeedsCount = Math.min(ACTIVE_GRID_SIZE, CANDIDATES.length);
  for (let i = 0; i < activeFeedsCount; i++) {
    const c = CANDIDATES[i];
    
    const item = document.createElement("div");
    item.className = "candidate-overview-card";
    item.style.cssText = "background: var(--md-bg); border: 1px solid rgba(0,0,0,0.03); border-radius: 12px; padding: 14px; position: relative; display: flex; flex-direction: column; gap: 12px; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--shadow-sm);";
    
    // Add hover effects and overlay actions
    const overlay = document.createElement("div");
    overlay.className = "overview-hover-overlay";
    overlay.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(28,27,31,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; opacity: 0; pointer-events: none; transition: opacity 0.25s ease; padding: 12px; z-index: 10;";
    
    overlay.innerHTML = `
      <div style="font-size: 10px; font-weight: 700; color: #fff; text-transform: uppercase; margin-bottom: 4px; font-family: 'JetBrains Mono';">Supervisor Workflows</div>
      <button class="mdbtn btn-tonal" style="width: 100%; background: var(--pri); color: #fff; min-height: 26px; font-size: 10px; border-color: var(--pri); font-weight: 700;" onclick="event.stopPropagation(); changePanel('live-panel')">
        <i class="material-icons" style="font-size: 12px;">visibility</i> Open Live Feed
      </button>
      <button class="mdbtn btn-outlined" style="width: 100%; color: var(--err); border-color: var(--err); min-height: 26px; font-size: 10px; font-weight: 700;" onclick="event.stopPropagation(); openSupervisorPanel('${c.id}')">
        <i class="material-icons" style="font-size: 12px;">gavel</i> Raise Flag
      </button>
      <button class="mdbtn btn-outlined" style="width: 100%; color: var(--wrn); border-color: var(--wrn); min-height: 26px; font-size: 10px; font-weight: 700;" onclick="event.stopPropagation(); openSupervisorPanel('${c.id}')">
        <i class="material-icons" style="font-size: 12px;">warning</i> Send Warning
      </button>
      <button class="mdbtn btn-outlined" style="width: 100%; color: var(--inf); border-color: var(--inf); min-height: 26px; font-size: 10px; font-weight: 700;" onclick="event.stopPropagation(); pushToast('Support Staff Dispatched', 'Academic supervisor has been notified.', 'info')">
        <i class="material-icons" style="font-size: 12px;">contact_support</i> Escalate
      </button>
    `;
    
    item.appendChild(overlay);
    
    // Hover events
    item.onmouseenter = () => {
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
    };
    item.onmouseleave = () => {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    };
    
    let avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"; // Default
    if (c.id === "CAN-183") avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80";
    if (c.id === "CAN-754") avatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80";
    if (c.id === "CAN-442") avatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80";
    if (c.id === "CAN-891") avatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80";
    
    const color = c.status === "danger" ? "#b3261e" : (c.status === "warning" ? "#7d5700" : "#146c2e");
    const bg = c.status === "danger" ? "#fcedeb" : (c.status === "warning" ? "#fff8db" : "#d2f4de");
    const badgeText = c.actionStatus === "Suspended" ? 'suspended' : (c.status === 'danger' ? 'critical' : (c.status === 'warning' ? 'warning' : 'optimal'));
    
    // Simulate connectivity and risk score
    const connScore = c.status === "danger" ? "32% (Poor)" : (c.status === "warning" ? "74% (Fair)" : "98% (Excellent)");
    const connColor = c.status === "danger" ? "var(--err)" : (c.status === "warning" ? "var(--wrn)" : "var(--suc)");
    const riskScore = c.status === "danger" ? "88%" : (c.status === "warning" ? "45%" : "4%");
    const riskColor = c.status === "danger" ? "var(--err)" : (c.status === "warning" ? "var(--wrn)" : "var(--suc)");
    
    const contentDiv = document.createElement("div");
    contentDiv.style.cssText = "display: flex; flex-direction: column; gap: 12px; width: 100%;";
    contentDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img class="roster-avatar" src="${avatarUrl}" alt="${c.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--on-sur);">${c.name}</div>
            <div style="font-size: 10px; color: var(--out);">${c.exam} · ID: ${c.id}</div>
          </div>
        </div>
        <span class="bdg" style="background:${bg}; color:${color}; font-size:9px; font-weight:700; padding:2px 6px; text-transform:uppercase;">
          ${badgeText}
        </span>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; border-top: 1px solid rgba(0,0,0,0.04); border-bottom: 1px solid rgba(0,0,0,0.04); padding: 8px 0; font-size: 10px;">
        <div>
          <span style="color: var(--out); display: block; margin-bottom: 2px;">Connectivity</span>
          <span style="font-weight: 700; color: ${connColor}; display: flex; align-items: center; gap: 2px;">
            <i class="material-icons" style="font-size: 12px;">wifi</i> ${connScore}
          </span>
        </div>
        <div>
          <span style="color: var(--out); display: block; margin-bottom: 2px;">AI Risk Index</span>
          <span style="font-weight: 700; color: ${riskColor}; display: flex; align-items: center; gap: 2px;">
            <i class="material-icons" style="font-size: 12px;">security</i> ${riskScore}
          </span>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--out);">
        <span>Timer: <strong style="font-family: 'JetBrains Mono'; color: var(--on-sur);">01:24:15</strong></span>
        <span>Node: <strong style="font-family: 'JetBrains Mono';">AI-NODE-03</strong></span>
      </div>
    `;
    item.appendChild(contentDiv);
    list.appendChild(item);
  }
}
function renderDashboardCharts() {
  renderDashboardRoster();
  
  const chartWrapper = document.getElementById("dashboard-trend-chart");
  if (!chartWrapper) return;
  
  const dataset = CHART_DATASET[CURRENT_TIME_RANGE];
  const N = dataset.labels.length;
  
  // Calculate dynamic scales
  let maxY = 10;
  if (CURRENT_TIME_RANGE === "1h") maxY = 5;
  if (CURRENT_TIME_RANGE === "7d") maxY = 30;
  
  const gridLineCol = THEME === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const labelCol = THEME === "dark" ? "#938f99" : "#79747e";
  
  // Generate vertical grid lines and labels dynamically
  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const yVal = Math.round(maxY - i * (maxY / 4));
    const yPos = 20 + i * 40;
    gridLines += `
      <line x1="40" y1="${yPos}" x2="440" y2="${yPos}" stroke="${gridLineCol}" stroke-width="1" />
      <text x="30" y="${yPos + 4}" fill="${labelCol}" font-size="9" font-family="'JetBrains Mono'" text-anchor="end">${yVal}</text>
    `;
  }
  
  // Generate X-axis labels dynamically
  let xAxisLabels = "";
  for (let i = 0; i < N; i++) {
    const xPos = 40 + i * (400 / (N - 1));
    xAxisLabels += `<text x="${xPos}" y="202" fill="${labelCol}" font-size="9" font-family="'JetBrains Mono'" text-anchor="middle">${dataset.labels[i]}</text>`;
  }
  
  // Generate line points
  let monitoredPoints = [];
  let incidentPoints = [];
  for (let i = 0; i < N; i++) {
    const x = 40 + i * (400 / (N - 1));
    let maxMon = CURRENT_TIME_RANGE === "1h" ? 6 : (CURRENT_TIME_RANGE === "24h" ? 30 : 70);
    const yMon = 180 - dataset.monitored[i] * (160 / maxMon);
    const yInc = 180 - dataset.incidents[i] * (160 / maxY);
    
    monitoredPoints.push({ x, y: yMon, val: dataset.monitored[i] });
    incidentPoints.push({ x, y: yInc, val: dataset.incidents[i], spike: dataset.spikes[i], gaze: dataset.gaze[i], noise: dataset.noise[i], profile: dataset.profile[i], label: dataset.labels[i] });
  }
  
  // Draw Paths
  const monPathD = monitoredPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  const monAreaD = `${monPathD} L ${monitoredPoints[N-1].x} 180 L 40 180 Z`;
  
  const incPathD = incidentPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  const incAreaD = `${incPathD} L ${incidentPoints[N-1].x} 180 L 40 180 Z`;
  
  const threshVal = Math.round(maxY * 0.75);
  const threshY = 180 - threshVal * (160 / maxY);
  
  // Render Outliers / Annotations
  let annotationMarkers = "";
  let interactiveCircles = "";
  
  incidentPoints.forEach((p) => {
    if (p.spike) {
      annotationMarkers += `
        <g class="spike-indicator" style="cursor: pointer;">
          <circle cx="${p.x}" cy="${p.y}" r="8" fill="rgba(179,38,30,0.2)" class="pulse-glow" style="animation: pulseGlow 1.5s infinite;" />
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--err)" />
          <text x="${p.x}" y="${p.y - 12}" fill="var(--err)" font-size="9" font-family="'JetBrains Mono'" font-weight="bold" text-anchor="middle">SPIKE</text>
        </g>
      `;
    }
    interactiveCircles += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--pri)" stroke="#fff" stroke-width="1" class="chart-interactive-dot" style="cursor: pointer;" />`;
  });
  
  chartWrapper.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 460 220" preserveAspectRatio="none" id="svg-trend-canvas" style="overflow: visible;">
      <!-- Grid & Y-Axis Labels -->
      ${gridLines}
      
      <!-- X-Axis Labels -->
      ${xAxisLabels}
      
      <!-- Critical Threshold Baseline -->
      <line x1="40" y1="${threshY}" x2="440" y2="${threshY}" stroke="var(--err)" stroke-dasharray="3,3" stroke-width="1.2" opacity="0.65" />
      <text x="440" y="${threshY - 5}" fill="var(--err)" font-size="8" font-family="'JetBrains Mono'" font-weight="700" text-anchor="end" opacity="0.8">CRITICAL ALERT THRESHOLD (${threshVal})</text>
      
      <!-- Monitored Stream Path -->
      <path d="${monPathD}" fill="none" stroke="var(--inf)" stroke-width="2" />
      <path d="${monAreaD}" fill="rgba(0, 99, 155, 0.04)" />
      
      <!-- AI Incident Path -->
      <path d="${incPathD}" fill="none" stroke="var(--pri)" stroke-width="2.5" />
      <path d="${incAreaD}" fill="rgba(249, 173, 0, 0.05)" />
      
      <!-- Spikes & Indicators -->
      ${annotationMarkers}
      
      <!-- Interactive Nodes -->
      ${interactiveCircles}
      
      <!-- Invisible hover tracker columns for tooltip interactivity -->
      ${incidentPoints.map((p, idx) => `
        <rect x="${p.x - 20}" y="20" width="40" height="160" fill="transparent" style="cursor: pointer;" 
          onmouseenter="showChartPointTooltip(event, ${idx})"
          onmouseleave="hideChartPointTooltip()" />
      `).join("")}
    </svg>
  `;
}

// --------------------------------------------------------------------------
// 9. HUB 3: INCIDENT AUDIT DATABASE HUB
// --------------------------------------------------------------------------
function renderIncidentTable() {
  const tbody = document.getElementById("incidents-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  INCIDENTS.forEach(inc => {
    const tr = document.createElement("tr");
    tr.id = `table-row-${inc.id}`;
    
    const severityColor = inc.severity === "high" ? "#601410" : (inc.severity === "medium" ? "#3c2800" : "#003350");
    const severityBg = inc.severity === "high" ? "#fcedeb" : (inc.severity === "medium" ? "#fff8db" : "#d3eaff");
    
    const statusColor = inc.status === "Resolved" ? "#003917" : (inc.status === "Escalated" ? "#601410" : "#321e73");
    const statusBg = inc.status === "Resolved" ? "#d2f4de" : (inc.status === "Escalated" ? "#fcedeb" : "#f3efff");
    
    tr.innerHTML = `
      <td class="incident-id">${inc.id}</td>
      <td style="font-weight:600;">${inc.name}</td>
      <td>${inc.exam}</td>
      <td class="incident-rule">${inc.rule}</td>
      <td>${inc.time}</td>
      <td>
        <span class="bdg" style="background:${severityBg}; color:${severityColor}; font-size:10px; padding:2px 6px;">
          ${inc.severity}
        </span>
      </td>
      <td>
        <span class="bdg" style="background:${statusBg}; color:${statusColor}; font-size:10px; padding:2px 6px;">
          ${inc.status}
        </span>
      </td>
      <td>
        <button class="mdbtn btn-tonal action-btn" style="min-height:28px; padding:4px 10px; font-size:11px;" onclick="openIncidentDrawer('${inc.id}')">
          <i class="material-icons" style="font-size:16px;">search</i> Audit
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

function handleIncidentSearch() {
  const query = document.getElementById("incident-table-search").value.toLowerCase();
  
  INCIDENTS.forEach(inc => {
    const row = document.getElementById(`table-row-${inc.id}`);
    if (row) {
      const match = inc.name.toLowerCase().includes(query) || 
                    inc.exam.toLowerCase().includes(query) || 
                    inc.rule.toLowerCase().includes(query) || 
                    inc.id.toLowerCase().includes(query);
      row.style.display = match ? "table-row" : "none";
    }
  });
}

function filterIncidentHub(severity, btn) {
  // Toggle chip selected classes
  btn.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
  btn.classList.add("selected");
  
  localStorage.setItem("proctor_incident_filter", severity);
  
  INCIDENTS.forEach(inc => {
    const row = document.getElementById(`table-row-${inc.id}`);
    if (row) {
      if (severity === "all") {
        row.style.display = "table-row";
      } else if (severity === "resolved") {
        row.style.display = inc.status === "Resolved" ? "table-row" : "none";
      } else {
        row.style.display = inc.severity === severity ? "table-row" : "none";
      }
    }
  });
}

// Draw a mock video capture graph loop on side audit drawer
let DRAWER_CANVAS_LOOP = null;
function openIncidentDrawer(incId) {
  const inc = INCIDENTS.find(i => i.id === incId);
  if (!inc) return;
  
  document.getElementById("incident-drawer-overlay").classList.remove("hidden");
  const drawer = document.getElementById("incident-drawer");
  drawer.classList.remove("hidden");
  
  // Set properties
  document.getElementById("drawer-title").textContent = inc.rule;
  document.getElementById("drawer-candidate-name").textContent = inc.name;
  document.getElementById("drawer-exam-name").textContent = inc.exam;
  document.getElementById("drawer-timestamp").textContent = `${inc.time} PST`;
  document.getElementById("drawer-confidence").textContent = `${inc.confidence}% Confidence Index`;
  document.getElementById("drawer-notes").value = inc.notes;
  
  const badge = document.getElementById("drawer-severity-badge");
  badge.textContent = `${inc.severity} Severity`;
  badge.style.background = inc.severity === "high" ? "#fcedeb" : "#fff8db";
  badge.style.color = inc.severity === "high" ? "#601410" : "#3c2800";
  
  // Store targeted incident ID in a custom drawer property for resolution saving
  drawer.setAttribute("data-active-incident", inc.id);
  
  // Draw wireframe video replay capture loop inside drawer canvas
  const canvas = document.getElementById("drawer-recorded-canvas");
  const ctx = canvas.getContext("2d");
  
  if (DRAWER_CANVAS_LOOP) clearInterval(DRAWER_CANVAS_LOOP);
  
  let loopTimer = 0;
  DRAWER_CANVAS_LOOP = setInterval(() => {
    loopTimer += 0.05;
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    // Draw room back grid
    ctx.fillStyle = "#1e1e24";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Head coordinates
    const headX = canvas.width / 2 + Math.sin(loopTimer) * 14;
    const headY = canvas.height / 2 - 10;
    
    // Wireframe candidate outline
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(headX, headY, 26, 0, Math.PI * 2);
    ctx.stroke();
    
    // Shoulders
    ctx.beginPath();
    ctx.moveTo(headX - 50, canvas.height);
    ctx.quadraticCurveTo(headX - 35, headY + 50, headX - 20, headY + 30);
    ctx.lineTo(headX + 20, headY + 30);
    ctx.quadraticCurveTo(headX + 35, headY + 50, headX + 50, canvas.height);
    ctx.stroke();
    
    // Deviated gaze simulation inside loop
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(headX - 10, headY - 2, 3, 0, Math.PI*2);
    ctx.arc(headX + 10, headY - 2, 3, 0, Math.PI*2);
    ctx.fill();
    
    // If Gaze Deviation rule is open, draw look lines extending from eyes to corners
    if (inc.rule.includes("Gaze")) {
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(headX - 10 + 2.5, headY - 2, 1.2, 0, Math.PI*2); // Look right
      ctx.arc(headX + 10 + 2.5, headY - 2, 1.2, 0, Math.PI*2);
      ctx.fill();
      
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX - 10, headY - 2);
      ctx.lineTo(canvas.width - 20, headY - 30);
      ctx.moveTo(headX + 10, headY - 2);
      ctx.lineTo(canvas.width - 20, headY - 30);
      ctx.stroke();
    } else {
      // Normal pupil positions
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(headX - 10, headY - 2, 1.2, 0, Math.PI*2);
      ctx.arc(headX + 10, headY - 2, 1.2, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Draw Bounding box Red Alert
    ctx.strokeStyle = "var(--err)";
    ctx.strokeRect(headX - 42, headY - 42, 84, 84);
    
  }, 50);
}

function closeIncidentDrawer() {
  document.getElementById("incident-drawer-overlay").classList.add("hidden");
  document.getElementById("incident-drawer").classList.add("hidden");
  if (DRAWER_CANVAS_LOOP) {
    clearInterval(DRAWER_CANVAS_LOOP);
    DRAWER_CANVAS_LOOP = null;
  }
}

function resolveDrawerIncident(resolutionState) {
  const drawer = document.getElementById("incident-drawer");
  const incId = drawer.getAttribute("data-active-incident");
  const notes = document.getElementById("drawer-notes").value;
  
  const inc = INCIDENTS.find(i => i.id === incId);
  if (inc) {
    inc.status = resolutionState;
    inc.notes = notes;
    
    pushToast("Incident Updated", `Audit record ${inc.id} marked as ${resolutionState}.`, "success");
    
    // Check if the incident corresponds to an active candidate feed
    const candidate = CANDIDATES.find(c => c.name === inc.name);
    if (candidate && resolutionState === "Resolved") {
      candidate.status = "clear";
      // Update camera grids
      const card = document.getElementById(`card-${candidate.id}`);
      if (card) {
        card.className = "candidate-card";
        const tag = document.getElementById(`status-tag-${candidate.id}`);
        if (tag) {
          tag.className = "candidate-status-tag clear";
          tag.textContent = "clear";
        }
      }
    }
    
    closeIncidentDrawer();
    updateIncidentCounter();
    renderIncidentTable();
    renderDashboardRoster();
  }
}

// --------------------------------------------------------------------------
// 10. HUB 4: REPORT COMPILATION & SVG Violations donut CHART
// --------------------------------------------------------------------------
function setExportFormat(fmt, btn) {
  btn.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
  btn.classList.add("selected");
  EXPORT_FORMAT = fmt;
}

function handleExportReport(event) {
  event.preventDefault();
  
  const progressBox = document.getElementById("download-progress-container");
  const progressFill = document.getElementById("download-progress-fill");
  const percentText = document.getElementById("download-percent");
  const nameLabel = document.getElementById("download-filename");
  const submitBtn = document.getElementById("export-button-submit");
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="material-icons spin-loader">sync</i> Querying Cluster Database...`;
  
  const filename = `secureproctor_audit_report_${new Date().toISOString().substring(0,10)}.${EXPORT_FORMAT}`;
  nameLabel.textContent = filename;
  
  setTimeout(() => {
    progressBox.classList.remove("hidden");
    submitBtn.innerHTML = `<i class="material-icons">inventory_2</i> Packing Archive Data...`;
    
    let percent = 0;
    const interval = setInterval(() => {
      percent += 10;
      progressFill.style.width = `${percent}%`;
      percentText.textContent = `${percent}%`;
      
      if (percent >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          progressBox.classList.add("hidden");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i class="material-icons">download</i> <span>Export Audit Report</span>`;
          pushToast("Export Complete", `Compliance packet downloaded successfully: ${filename}`, "success");
        }, 500);
      }
    }, 150);
  }, 1000);
}

function renderReportsCharts() {
  const chartWrapper = document.getElementById("violations-donut-chart");
  if (!chartWrapper) return;
  
  chartWrapper.style.width = "100%";
  chartWrapper.style.height = "220px";
  chartWrapper.innerHTML = "";
  
  const myChart = echarts.init(chartWrapper);
  
  const style = getComputedStyle(document.documentElement);
  const priColor = style.getPropertyValue('--pri').trim() || '#6750A4';
  const secColor = style.getPropertyValue('--sec').trim() || '#625B71';
  const errColor = style.getPropertyValue('--err').trim() || '#B3261E';
  const infColor = style.getPropertyValue('--inf').trim() || '#00639B';
  const textColor = style.getPropertyValue('--on-sur').trim() || '#1C1B1F';
  const textMuted = style.getPropertyValue('--out').trim() || '#79747E';

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      show: false
    },
    series: [
      {
        name: 'Violations',
        type: 'pie',
        radius: ['55%', '78%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: style.getPropertyValue('--sur').trim() || '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
            color: textColor
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 45, name: 'Gaze Deviations', itemStyle: { color: priColor } },
          { value: 25, name: 'Audio Spikes', itemStyle: { color: secColor } },
          { value: 20, name: 'Extra Profiles', itemStyle: { color: errColor } },
          { value: 10, name: 'Browser Tab Switch', itemStyle: { color: infColor } }
        ]
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: '38',
          textAlign: 'center',
          fill: textColor,
          fontSize: 28,
          fontWeight: 800
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '60%',
        style: {
          text: 'TOTAL COMPROMISES',
          textAlign: 'center',
          fill: textMuted,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1
        }
      }
    ]
  };
  
  myChart.setOption(option);
  
  const legend = document.getElementById("violations-chart-legend");
  if (legend) {
    legend.innerHTML = `
      <div class="legend-item"><span class="legend-dot" style="background:${priColor}"></span> Gaze Deviations (45%)</div>
      <div class="legend-item"><span class="legend-dot" style="background:${secColor}"></span> Audio Spikes (25%)</div>
      <div class="legend-item"><span class="legend-dot" style="background:${errColor}"></span> Extra Profiles (20%)</div>
      <div class="legend-item"><span class="legend-dot" style="background:${infColor}"></span> Browser Tab Switch (10%)</div>
    `;
  }
  
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

// --------------------------------------------------------------------------
// 11. HUB 5: INTERACTIVE SHIFT CALENDAR SCHEDULER
// --------------------------------------------------------------------------
function toggleCalendarView(view, btn) {
  btn.parentElement.querySelectorAll(".tbtn").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  
  pushToast("View Changed", `Calendar calibrated to ${view} grid view.`, "success");
}

function changeCalendarMonth(offset) {
  CALENDAR_CURRENT_MONTH += offset;
  if (CALENDAR_CURRENT_MONTH < 0) {
    CALENDAR_CURRENT_MONTH = 11;
    CALENDAR_CURRENT_YEAR--;
  } else if (CALENDAR_CURRENT_MONTH > 11) {
    CALENDAR_CURRENT_MONTH = 0;
    CALENDAR_CURRENT_YEAR++;
  }
  
  renderCalendar();
}

function renderCalendar() {
  const title = document.getElementById("calendar-month-title");
  const grid = document.getElementById("calendar-days-grid");
  if (!title || !grid) return;
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  title.textContent = `${months[CALENDAR_CURRENT_MONTH]} ${CALENDAR_CURRENT_YEAR}`;
  
  grid.innerHTML = "";
  
  // Generate days layout
  const firstDay = new Date(CALENDAR_CURRENT_YEAR, CALENDAR_CURRENT_MONTH, 1).getDay();
  const totalDays = new Date(CALENDAR_CURRENT_YEAR, CALENDAR_CURRENT_MONTH + 1, 0).getDate();
  const prevMonthTotal = new Date(CALENDAR_CURRENT_YEAR, CALENDAR_CURRENT_MONTH, 0).getDate();
  
  // Pad previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayVal = prevMonthTotal - i;
    const cell = document.createElement("div");
    cell.className = "cal-day-cell other-month";
    cell.innerHTML = `<span>${dayVal}</span>`;
    grid.appendChild(cell);
  }
  
  // Render active month cells
  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");
    cell.className = "cal-day-cell";
    
    const dateStr = `${CALENDAR_CURRENT_YEAR}-${String(CALENDAR_CURRENT_MONTH + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dateStr === CALENDAR_SELECTED_DATE) {
      cell.classList.add("selected");
    }
    
    cell.onclick = () => selectCalendarDate(dateStr);
    
    // Draw event category indicators dots inside cell
    const dayShifts = SHIFTS.filter(s => s.date === dateStr);
    let dotsHtml = "";
    if (dayShifts.length > 0) {
      dotsHtml = `<div class="cal-day-events">`;
      dayShifts.forEach(s => {
        dotsHtml += `<div class="cal-event-dot ${s.type}"></div>`;
      });
      dotsHtml += `</div>`;
    }
    
    cell.innerHTML = `
      <span>${d}</span>
      ${dotsHtml}
    `;
    
    grid.appendChild(cell);
  }
  
  if (typeof renderSessionsTable === "function") {
    renderSessionsTable();
  }
}

function renderAgendaList() {
  const list = document.getElementById("calendar-agenda-list");
  if (!list) return;
  
  list.innerHTML = "";
  
  // Filter upcoming shifts
  const sortedShifts = SHIFTS.filter(s => new Date(s.date) >= new Date("2026-05-19")).sort((a,b) => new Date(a.date) - new Date(b.date));
  
  sortedShifts.forEach(s => {
    const item = document.createElement("div");
    item.className = "agenda-item";
    
    const formattedDate = new Date(s.date + "T00:00:00").toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
    
    let tagBg = "var(--suc)";
    let tagCol = "#fff";
    let title = "Declared Open Availability";
    let desc = "Open shift pool allocation";
    
    if (s.type === "session") {
      tagBg = "var(--pri)";
      tagCol = "var(--on-pri)";
      title = s.exam.toUpperCase() + " Proctored Session";
      desc = "Webcam surveillance active";
    } else if (s.type === "blocked") {
      tagBg = "var(--out)";
      tagCol = "#fff";
      title = "Blocked Time Slot";
      desc = "Unavailable for assignments";
    }
    
    item.innerHTML = `
      <div class="agenda-time">${formattedDate}<br>${s.start}-${s.end}</div>
      <div class="agenda-meta">
        <div class="agenda-title">${title}</div>
        <div class="agenda-desc">${desc}</div>
      </div>
      <span class="bdg agenda-tag" style="background:${tagBg}; color:${tagCol}; font-size:9px; padding:2px 6px;">${s.type}</span>
    `;
    
    list.appendChild(item);
  });
}

// --------------------------------------------------------------------------
// 12. CONFIGURATION & PROFILE SETTINGS
// --------------------------------------------------------------------------
function toggleSettingsSubTab(subTab, tabBtn) {
  // Sync tab active styles
  tabBtn.parentElement.querySelectorAll(".tab").forEach(t => t.classList.remove("on"));
  tabBtn.classList.add("on");
  
  // Toggle sections
  document.querySelectorAll(".settings-panel-sub").forEach(p => p.classList.remove("active"));
  document.getElementById(`settings-sub-${subTab}`).classList.add("active");
}

function handleSaveProfileSettings(event) {
  event.preventDefault();
  
  const nameVal = document.getElementById("settings-name-input").value;
  const timezone = document.getElementById("settings-timezone-input").value;
  const role = document.getElementById("settings-role-input").value;
  
  CURRENT_USER.name = nameVal;
  CURRENT_USER.timezone = timezone;
  CURRENT_USER.role = role;
  
  // Sync digital tags
  document.getElementById("sidebar-name").textContent = nameVal;
  
  pushToast("Profile Saved", "Proctor system credentials updated.", "success");
}

function toggleTheme() {
  const html = document.documentElement;
  const btnIcon = document.getElementById("theme-btn-icon");
  
  if (THEME === "light") {
    html.setAttribute("data-t", "dark");
    THEME = "dark";
    if (btnIcon) {
      btnIcon.textContent = "light_mode";
    }
    pushToast("Dark Mode Active", "Aesthetic calibrated for low light proctor shifts.", "success");
  } else {
    html.setAttribute("data-t", "light");
    THEME = "light";
    if (btnIcon) {
      btnIcon.textContent = "dark_mode";
    }
    pushToast("Light Mode Active", "Aesthetic calibrated for daylight environments.", "success");
  }
  
  localStorage.setItem("proctor_theme", THEME);
  
  // Redraw charts to match background theme values
  renderDashboardCharts();
  renderReportsCharts();
}

// --------------------------------------------------------------------------
// 13. NOTIFICATION Toast & dropdown feed logger
// --------------------------------------------------------------------------
function renderNotificationsDropdown() {
  const list = document.getElementById("notif-dropdown-list");
  if (!list) return;
  
  list.innerHTML = "";
  
  if (NOTIFICATIONS.length === 0) {
    list.innerHTML = `
      <div class="notif-empty">
        <i class="material-icons">notifications_off</i>
        <p>No new system notifications.</p>
      </div>
    `;
    return;
  }
  
  NOTIFICATIONS.forEach(n => {
    const item = document.createElement("div");
    item.className = "notif-item";
    item.onclick = () => {
      changePanel("incidents-panel");
      openIncidentDrawer(n.id);
      document.getElementById("notif-dropdown-panel").classList.add("hidden");
    };
    
      const listIconName = n.severity === 'high' ? 'cancel' : 'warning';
      item.innerHTML = `
      <div class="notif-icon-marker ${n.severity}">
        <i class="material-icons" style="font-size:16px;">${listIconName}</i>
      </div>
      <div class="notif-details">
        <h4>${n.title}</h4>
        <p>${n.desc}</p>
        <div class="notif-time">${n.time}</div>
      </div>
    `;
    
    list.appendChild(item);
  });
}

function clearAllNotifications() {
  NOTIFICATIONS = [];
  const unreadCount = document.getElementById("notif-unread-count");
  unreadCount.classList.add("hidden");
  renderNotificationsDropdown();
  pushToast("Clear Success", "Cleared notification log.", "success");
}

// --------------------------------------------------------------------------
// 14. INTERACTIVE ONBOARDING TOUR CONTROLLER (HIGHLIGHT OVERLAY ENGINE)
// --------------------------------------------------------------------------
const TOUR_STEPS = [
  {
    target: "app-sidebar",
    title: "Sidebar Operations Controller",
    text: "Access key centers: view real-time operations, configure cameras, audit computer-vision incidents, declare shifts, or modify security parameters.",
    pos: "right"
  },
  {
    target: "nav-live",
    title: "Surveillance Monitoring Grid",
    text: "Simulate candidate video grids, run face boundary check coordinates, and issue warnings or terminate exams directly.",
    pos: "right"
  },
  {
    target: "nav-incidents",
    title: "AI Incident Hub Audit List",
    text: "Investigate flagged violations database list, evaluate AI confidence ratings, update logs, and dispatch escalation reports.",
    pos: "right"
  },
  {
    target: "help-tour-btn",
    title: "Onboarding System Help",
    text: "Re-trigger this guided tour at any time to familiarize yourself with newly loaded proctor features.",
    pos: "bottom"
  },
  {
    target: "theme-switcher-btn",
    title: "Aesthetics & Dark Mode Toggle",
    text: "Instantly cycle light and dark color modes designed on WCAG 2.2 compliant tokens to reduce eye fatigue.",
    pos: "left"
  }
];

let ACTIVE_TOUR_INDEX = 0;

function startAppTour() {
  ACTIVE_TOUR_INDEX = 0;
  
  // Close existing dropdowns
  document.getElementById("notif-dropdown-panel").classList.add("hidden");
  
  // Reveal overlays
  document.getElementById("app-tour-overlay").classList.remove("hidden");
  document.getElementById("app-tour-tooltip").classList.remove("hidden");
  
  executeTourStep();
}

function executeTourStep() {
  const step = TOUR_STEPS[ACTIVE_TOUR_INDEX];
  const target = document.getElementById(step.target);
  const tooltip = document.getElementById("app-tour-tooltip");
  
  // Remove highlighted class from previous steps
  document.querySelectorAll(".tour-highlighted-element").forEach(el => el.classList.remove("tour-highlighted-element"));
  
  if (target) {
    // Add highlighted boundary border glow to target
    target.classList.add("tour-highlighted-element");
    
    // Position tooltip smoothly relative to target coordinates
    const rect = target.getBoundingClientRect();
    const scrollY = window.scrollY;
    
    let left = 0;
    let top = 0;
    
    if (step.pos === "right") {
      left = rect.right + 12;
      top = rect.top + scrollY + (rect.height / 2) - 80;
    } else if (step.pos === "left") {
      left = rect.left - 332;
      top = rect.top + scrollY + (rect.height / 2) - 80;
    } else if (step.pos === "bottom") {
      left = rect.left + (rect.width / 2) - 160;
      top = rect.bottom + 12;
    }
    
    tooltip.style.left = `${Math.max(12, left)}px`;
    tooltip.style.top = `${Math.max(12, top)}px`;
    
    // Inject step parameters
    document.getElementById("tour-tooltip-title").textContent = step.title;
    document.getElementById("tour-tooltip-text").textContent = step.text;
    document.getElementById("tour-step-counter").textContent = `${ACTIVE_TOUR_INDEX + 1} / ${TOUR_STEPS.length}`;
    
    // Next/Finish label
    const nextBtn = document.getElementById("tour-next-btn");
    if (ACTIVE_TOUR_INDEX === TOUR_STEPS.length - 1) {
      nextBtn.innerHTML = `Finish <i class="material-icons">check_circle</i>`;
    } else {
      nextBtn.innerHTML = `Next <i class="material-icons">arrow_forward</i>`;
    }
  } else {
    // Fallback if target missing
    exitAppTour();
  }
}

function nextTourStep() {
  if (ACTIVE_TOUR_INDEX < TOUR_STEPS.length - 1) {
    ACTIVE_TOUR_INDEX++;
    executeTourStep();
  } else {
    exitAppTour();
  }
}

function exitAppTour() {
  document.getElementById("app-tour-overlay").classList.add("hidden");
  document.getElementById("app-tour-tooltip").classList.add("hidden");
  document.querySelectorAll(".tour-highlighted-element").forEach(el => el.classList.remove("tour-highlighted-element"));
  pushToast("Tour Complete", "Get started by checking candidate camera streams.", "success");
}

// --------------------------------------------------------------------------
// 16. REFINED SYSTEM FEATURE MODULES: CHARTS, WORKFLOWS, TELEMETRY & PERSISTENCE
// --------------------------------------------------------------------------

// Timeframe Selected state and multi-series datasets
let CURRENT_TIME_RANGE = "1h";
const CHART_DATASET = {
  "1h": {
    labels: ["06:00", "06:10", "06:20", "06:30", "06:40", "06:50"],
    monitored: [4, 4, 4, 4, 4, 4],
    incidents: [0, 0, 1, 1, 3, 0],
    gaze: [0, 0, 1, 0, 2, 0],
    noise: [0, 0, 0, 1, 1, 0],
    profile: [0, 0, 0, 0, 0, 0],
    spikes: [false, false, false, false, true, false]
  },
  "24h": {
    labels: ["08:00", "12:00", "16:00", "20:00", "00:00", "04:00"],
    monitored: [12, 16, 24, 8, 2, 6],
    incidents: [2, 4, 8, 3, 1, 2],
    gaze: [1, 2, 5, 2, 1, 1],
    noise: [1, 1, 2, 1, 0, 1],
    profile: [0, 1, 1, 0, 0, 0],
    spikes: [false, false, true, false, false, false]
  },
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    monitored: [45, 52, 60, 48, 65, 20, 15],
    incidents: [12, 14, 22, 10, 28, 5, 3],
    gaze: [8, 9, 14, 6, 18, 3, 2],
    noise: [3, 4, 6, 3, 8, 2, 1],
    profile: [1, 1, 2, 1, 2, 0, 0],
    spikes: [false, false, false, false, true, false, false]
  }
};

// Dynamic Line Chart Filters chips toggle
function changeChartTimeRange(range, element) {
  CURRENT_TIME_RANGE = range;
  
  // Highlight active selector chip
  const chips = document.querySelectorAll(".chart-filter-chip");
  chips.forEach(c => c.classList.remove("selected"));
  if (element) {
    element.classList.add("selected");
  }
  
  // Redraw SVG graph with new timelines
  renderDashboardCharts();
  
  pushToast("Timeframe Synced", `Incident trend view adjusted to past ${range === '1h' ? 'hour' : (range === '24h' ? '24 hours' : '7 days')}.`, "info");
}

// Floating Interactive SVG Tooltips
function showChartPointTooltip(event, index) {
  const tooltip = document.getElementById("chart-tooltip");
  if (!tooltip) return;
  
  const dataset = CHART_DATASET[CURRENT_TIME_RANGE];
  const time = dataset.labels[index];
  const mon = dataset.monitored[index];
  const inc = dataset.incidents[index];
  const gaze = dataset.gaze[index];
  const noise = dataset.noise[index];
  const prof = dataset.profile[index];
  
  tooltip.innerHTML = `
    <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 4px; font-family: 'JetBrains Mono';">Log Metrics (${time})</h4>
    <div class="tooltip-detail-item"><span>Monitored:</span><strong>${mon} nodes</strong></div>
    <div class="tooltip-detail-item" style="color: var(--pri);"><span>Total Flags:</span><strong>${inc}</strong></div>
    <div style="border-top: 1px dashed var(--out); margin-top: 6px; padding-top: 4px; font-size: 9px; opacity: 0.85;">
      <div class="tooltip-detail-item"><span>· Gaze Deviations:</span><span>${gaze}</span></div>
      <div class="tooltip-detail-item"><span>· Sound Violations:</span><span>${noise}</span></div>
      <div class="tooltip-detail-item"><span>· Profile Mismatches:</span><span>${prof}</span></div>
    </div>
  `;
  
  tooltip.classList.remove("hidden");
  
  // Calculate relative coordinates in trend graph container
  const container = document.getElementById("dashboard-trend-chart");
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left + 15;
  const y = event.clientY - rect.top - 80;
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideChartPointTooltip() {
  const tooltip = document.getElementById("chart-tooltip");
  if (tooltip) {
    tooltip.classList.add("hidden");
  }
}

// Web Audio API Synthesizer Chimes
let AUDIO_CTX = null;
function playAlertChime(severity) {
  try {
    if (!AUDIO_CTX) {
      AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (AUDIO_CTX.state === "suspended") {
      AUDIO_CTX.resume();
    }
    
    const now = AUDIO_CTX.currentTime;
    
    if (severity === "high" || severity === "danger") {
      // High severity double alert chime: 650Hz -> 800Hz
      const osc = AUDIO_CTX.createOscillator();
      const gain = AUDIO_CTX.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(AUDIO_CTX.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      
      setTimeout(() => {
        if (!AUDIO_CTX) return;
        const now2 = AUDIO_CTX.currentTime;
        const osc2 = AUDIO_CTX.createOscillator();
        const gain2 = AUDIO_CTX.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(650, now2);
        osc2.frequency.exponentialRampToValueAtTime(800, now2 + 0.15);
        gain2.gain.setValueAtTime(0.08, now2);
        gain2.gain.linearRampToValueAtTime(0.001, now2 + 0.35);
        osc2.connect(gain2);
        gain2.connect(AUDIO_CTX.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.4);
      }, 150);
    } else {
      // Soft single warning chime: 440Hz
      const osc = AUDIO_CTX.createOscillator();
      const gain = AUDIO_CTX.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(AUDIO_CTX.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn("Audio Context block by browser security policy.", e);
  }
}

// "Take Action" Candidate Session Supervisor Overlay
let ACTIVE_SUPERVISOR_CANDIDATE_ID = null;

function openSupervisorPanel(candidateId) {
  const c = CANDIDATES.find(item => item.id === candidateId);
  if (!c) return;
  
  ACTIVE_SUPERVISOR_CANDIDATE_ID = candidateId;
  
  document.getElementById("supervisor-cand-name").textContent = c.name;
  document.getElementById("supervisor-cand-exam").textContent = `${c.exam} · ID: ${c.id}`;
  
  // Set avatar dynamically based on indices
  const avatarEl = document.getElementById("supervisor-avatar");
  if (avatarEl) {
    avatarEl.src = `https://images.unsplash.com/photo-${candidateId === 'CAN-092' ? '1507003211169-0a1dd7228f2d' : (candidateId === 'CAN-183' ? '1494790108377-be9c29b29330' : (candidateId === 'CAN-754' ? '1438761681033-6461ffad8d80' : '1500648767791-00dcc994a43e'))}?w=100&auto=format&fit=crop&q=80`;
  }
  
  // Sync pause button status
  const pauseBtn = document.getElementById("supervisor-pause-btn");
  if (pauseBtn) {
    const isPaused = c.actionStatus === "Paused";
    pauseBtn.innerHTML = isPaused ? `<i class="material-icons" style="font-size:16px;">play_arrow</i> Resume Session` : `<i class="material-icons" style="font-size:16px;">pause</i> Pause Exam`;
  }
  
  // Open modal & overlay dialogs
  document.getElementById("supervisor-modal-overlay").classList.remove("hidden");
  document.getElementById("supervisor-modal").classList.remove("hidden");
}

function closeSupervisorPanel() {
  document.getElementById("supervisor-modal-overlay").classList.add("hidden");
  document.getElementById("supervisor-modal").classList.add("hidden");
  ACTIVE_SUPERVISOR_CANDIDATE_ID = null;
}

function dispatchSupervisorWarning(text) {
  if (!ACTIVE_SUPERVISOR_CANDIDATE_ID) return;
  
  const c = CANDIDATES.find(item => item.id === ACTIVE_SUPERVISOR_CANDIDATE_ID);
  if (!c) return;
  
  c.warnings++;
  c.status = "warning";
  
  pushToast("Direct Warning Dispatched", `Notification alert chime sent to ${c.name}.`, "success");
  playAlertChime("medium");
  
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];
  
  INCIDENTS.unshift({
    id: `INC-${Math.floor(8000 + Math.random() * 2000)}`,
    name: c.name,
    exam: c.exam,
    rule: "Proctor Issued Warning",
    time: timeStr,
    severity: "medium",
    status: "Flagged",
    confidence: 100,
    notes: `Manual warning chimes sent: "${text}"`
  });
  
  // Update views & dashboards
  renderCameraGrid();
  renderIncidentTable();
  updateIncidentCounter();
  
  // Flash top banner marquee
  triggerCriticalMarqueeAlert(c.name, text);
  
  closeSupervisorPanel();
}

function dispatchCustomWarning() {
  const input = document.getElementById("custom-warning-text");
  if (!input || !input.value.trim()) return;
  
  dispatchSupervisorWarning(input.value.trim());
  input.value = "";
}

function toggleSupervisorPause() {
  if (!ACTIVE_SUPERVISOR_CANDIDATE_ID) return;
  
  const c = CANDIDATES.find(item => item.id === ACTIVE_SUPERVISOR_CANDIDATE_ID);
  if (!c) return;
  
  const isCurrentlyPaused = c.actionStatus === "Paused";
  
  if (isCurrentlyPaused) {
    c.actionStatus = "Monitored";
    c.status = "clear";
    pushToast("Exam Resumed", `${c.name}'s proctor feed connection restored.`, "success");
  } else {
    c.actionStatus = "Paused";
    c.status = "warning";
    pushToast("Session Suspended", `${c.name}'s examination link paused.`, "info");
  }
  
  renderCameraGrid();
  closeSupervisorPanel();
}

function triggerSupervisorTermination() {
  if (!ACTIVE_SUPERVISOR_CANDIDATE_ID) return;
  
  const c = CANDIDATES.find(item => item.id === ACTIVE_SUPERVISOR_CANDIDATE_ID);
  if (!c) return;
  
  c.actionStatus = "Suspended";
  c.status = "danger";
  
  playAlertChime("high");
  pushToast("Session Terminated", `${c.name}'s exam link permanently revoked.`, "error");
  
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];
  
  INCIDENTS.unshift({
    id: `INC-${Math.floor(8000 + Math.random() * 2000)}`,
    name: c.name,
    exam: c.exam,
    rule: "Revocation of Authentication",
    time: timeStr,
    severity: "high",
    status: "Flagged",
    confidence: 100,
    notes: "Session permanently suspended by board administrator."
  });
  
  renderCameraGrid();
  renderIncidentTable();
  updateIncidentCounter();
  
  triggerCriticalMarqueeAlert(c.name, "Revocation of Authentication. Feed Terminated.");
  
  closeSupervisorPanel();
}

// Active Snooze Alerts Log Registry
let SNOOZED_ALERTS = [];

function quickSnoozeCandidate(candidateId) {
  const c = CANDIDATES.find(item => item.id === candidateId);
  if (!c) return;
  
  c.status = "clear";
  c.actionStatus = "Snoozed";
  
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];
  const alertId = `SNZ-${Math.floor(100 + Math.random() * 900)}`;
  
  SNOOZED_ALERTS.unshift({
    id: alertId,
    candidateId: c.id,
    name: c.name,
    time: timeStr,
    notes: "Active proctor warning alerts snoozed for 60 seconds."
  });
  
  pushToast("Alert Snoozed", `Violations for ${c.name} silenced for 60s.`, "warning");
  
  renderCameraGrid();
  renderSnoozedPanel();
  
  // Lift silence after 60 seconds
  setTimeout(() => {
    const freshC = CANDIDATES.find(item => item.id === candidateId);
    if (freshC && freshC.actionStatus === "Snoozed") {
      freshC.actionStatus = "Monitored";
      pushToast("Snooze Expired", `Resuming regular AI auditing for ${freshC.name}.`, "info");
      renderCameraGrid();
    }
  }, 60000);
}

function quickResolveCandidate(candidateId) {
  const c = CANDIDATES.find(item => item.id === candidateId);
  if (!c) return;
  
  c.status = "clear";
  c.actionStatus = "Monitored";
  c.warnings = 0;
  
  pushToast("Status Resolved", `${c.name} restored to optimal compliance score.`, "success");
  
  renderCameraGrid();
}

function renderSnoozedPanel() {
  const container = document.getElementById("snoozed-registry-list");
  if (!container) return;
  
  if (SNOOZED_ALERTS.length === 0) {
    container.innerHTML = `
      <div class="notif-empty" style="padding: 12px 0;">
        <p style="font-size: 11px; color: var(--on-sur-var); margin: 0;">No active alerts are currently snoozed.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = SNOOZED_ALERTS.map(alert => `
    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--sur-var); border: 1px solid var(--out); border-radius: 8px; padding: 10px 14px; font-size: 11px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="material-icons" style="color: var(--pri); font-size: 14px;">notifications_off</i>
        <div>
          <strong style="font-size: 12px; color: var(--on-sur);">${alert.name}</strong> 
          <span style="opacity: 0.7;">(${alert.candidateId}) · Silenced at ${alert.time}</span>
          <p style="margin: 2px 0 0 0; opacity: 0.85; font-size: 10px;">${alert.notes}</p>
        </div>
      </div>
      <button class="mdbtn btn-tonal" onclick="unsnoozeAlert('${alert.id}')" style="min-height: 24px; padding: 2px 8px; font-size: 10px;">
        <i class="material-icons" style="font-size: 12px;">undo</i> Restore Alarm
      </button>
    </div>
  `).join("");
}

function unsnoozeAlert(alertId) {
  const idx = SNOOZED_ALERTS.findIndex(alert => alert.id === alertId);
  if (idx === -1) return;
  
  const alert = SNOOZED_ALERTS[idx];
  SNOOZED_ALERTS.splice(idx, 1);
  
  const c = CANDIDATES.find(item => item.id === alert.candidateId);
  if (c) {
    c.actionStatus = "Monitored";
    c.status = "warning";
    pushToast("Alert Monitoring Restored", `Active violations for ${c.name} are being audited again.`, "info");
  }
  
  renderCameraGrid();
  renderSnoozedPanel();
}

// Critical Alert Scrolling Marquee Stream banner chimer
function triggerCriticalMarqueeAlert(candidateName, violationRule) {
  const marquee = document.getElementById("alert-marquee-text");
  const banner = document.getElementById("critical-alert-stream");
  const pulse = document.getElementById("alert-stream-pulse");
  const badge = document.getElementById("alert-stream-badge");
  
  if (!marquee || !banner) return;
  
  // Enable hazardous red flashing styles
  banner.classList.add("critical-flash");
  banner.style.background = "var(--err-ct)";
  banner.style.color = "var(--err)";
  if (pulse) {
    pulse.style.background = "var(--err)";
  }
  if (badge) {
    badge.style.color = "var(--err)";
  }
  
  // Set alert marquee scroll content
  marquee.textContent = `CRITICAL INCIDENT ALERT: Candidate ${candidateName} flagged for "${violationRule}". Immediate supervisor auditing recommended!`;
  
  // Revert back to calm operational green after 10 seconds
  setTimeout(() => {
    if (banner && marquee) {
      banner.classList.remove("critical-flash");
      banner.style.background = "var(--sur-var)";
      banner.style.color = "var(--on-sur-var)";
      if (pulse) {
        pulse.style.background = "var(--suc)";
      }
      if (badge) {
        badge.style.color = "var(--pri)";
      }
      marquee.textContent = "AI PROCTOR ACTIVE: Monitoring active exam nodes. Roster Integrity score at 98.4%. No active alerts.";
    }
  }, 10000);
}

// Metric Info Documentation modals
function toggleMetricHelp(metricKey) {
  const modal = document.getElementById("help-modal");
  const overlay = document.getElementById("help-modal-overlay");
  const title = document.getElementById("help-modal-title");
  const body = document.getElementById("help-modal-body");
  
  if (!modal || !body) return;
  
  let metricTitle = "";
  let metricDesc = "";
  
  switch(metricKey) {
    case 'active-feeds':
      metricTitle = "Active Candidate Feeds Documentation";
      metricDesc = `
        <p><strong>Definition:</strong> Represents the active webcam & telemetry nodes currently streaming encrypted candidate packages to the local AI proctor hub.</p>
        <p><strong>Calculation Formula:</strong> Total count of candidates with a verified hardware token and active examination link.</p>
        <div style="background:var(--sur-var); padding:8px; border-radius:6px; margin-top:8px; font-family:'JetBrains Mono'; font-size:10px;">
          active_feeds_count = SUM(candidate.status == 'Monitored')
        </div>
      `;
      break;
    case 'flagged-incidents':
      metricTitle = "Flagged AI Incidents Documentation";
      metricDesc = `
        <p><strong>Definition:</strong> Accumulation of AI proctoring violations generated by computer vision and sound analysis nodes.</p>
        <p><strong>Calculation Formula:</strong> Total number of incident logs filed during the current active monitoring window.</p>
        <div style="background:var(--sur-var); padding:8px; border-radius:6px; margin-top:8px; font-family:'JetBrains Mono'; font-size:10px;">
          flagged_incidents = count(INCIDENTS.filter(status == 'Flagged'))
        </div>
      `;
      break;
    case 'integrity-score':
      metricTitle = "Average Integrity Index Documentation";
      metricDesc = `
        <p><strong>Definition:</strong> A predictive percentage indicating the cumulative honesty and rule compliance of the cohort.</p>
        <p><strong>Calculation Formula:</strong> Scaled inverse duration of warning-trigger periods relative to monitored session duration across all candidates.</p>
        <div style="background:var(--sur-var); padding:8px; border-radius:6px; margin-top:8px; font-family:'JetBrains Mono'; font-size:10px;">
          integrity_score = 100 - (sum(candidate.violation_duration) / sum(candidate.total_duration)) * 100
        </div>
      `;
      break;
    case 'hours-monitored':
      metricTitle = "Hours Monitored Documentation";
      metricDesc = `
        <p><strong>Definition:</strong> Cumulative duration of active proctor surveillance recorded across all shifts.</p>
        <p><strong>Calculation Formula:</strong> Integral of active exam links across monitored candidate feeds.</p>
        <div style="background:var(--sur-var); padding:8px; border-radius:6px; margin-top:8px; font-family:'JetBrains Mono'; font-size:10px;">
          hours_monitored = sum(exam_session_duration) / 3600
        </div>
      `;
      break;
    case 'incident-trends':
      metricTitle = "Incident Frequency Trends Graph Guide";
      metricDesc = `
        <p><strong>Definition:</strong> Graphical distribution showing the occurrence of security alerts (orange) against total active candidate loads (blue).</p>
        <p><strong>Interactive Guidelines:</strong>
          <ul>
            <li><strong>Time Filters:</strong> Toggle between 1H, 24H, and 7D windows to render different chronological scales.</li>
            <li><strong>Interactive Dot tooltips:</strong> Hover over graph nodes to audit specific categoric counts (Gaze, Noise, Profile).</li>
            <li><strong>Baseline Guide:</strong> An institutional threshold line indicates when alert frequency reaches critical levels.</li>
          </ul>
        </p>
      `;
      break;
    default:
      metricTitle = "SecureProctor Documentation Helper";
      metricDesc = "<p>Standard examination surveillance system guidelines.</p>";
  }
  
  title.textContent = metricTitle;
  body.innerHTML = metricDesc;
  
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeHelpModal() {
  document.getElementById("help-modal").classList.add("hidden");
  document.getElementById("help-modal-overlay").classList.add("hidden");
}

// ==================== OPERATIONAL TELEMETRY STATE MACHINE ====================

// Telemetry Status Dropdown Toggle
function toggleTelemetryDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById("telemetry-dropdown-menu");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
}

// Close telemetry dropdown on click outside
window.addEventListener("click", function(e) {
  const dropdown = document.getElementById("telemetry-dropdown-menu");
  const container = document.getElementById("sys-mode-status-container");
  if (dropdown && !dropdown.classList.contains("hidden") && container && !container.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// Telemetry State Transition Handler
function changeTelemetryState(stateName) {
  const badgeBtn = document.getElementById("sys-mode-status");
  const badgePulse = document.getElementById("telemetry-badge-pulse");
  const badgeText = document.getElementById("telemetry-badge-text");
  const faultBanner = document.getElementById("telemetry-fault-banner");
  const faultText = document.getElementById("fault-banner-text");
  
  if (!badgeBtn || !badgeText || !badgePulse || !faultBanner || !faultText) return;
  
  // Close menu
  const dropdown = document.getElementById("telemetry-dropdown-menu");
  if (dropdown) dropdown.classList.add("hidden");
  
  // Set text
  badgeText.textContent = stateName;
  
  // Default values
  let color = "var(--suc)";
  let bg = "rgba(20, 108, 46, 0.1)";
  let border = "rgba(20, 108, 46, 0.25)";
  let isFault = false;
  let faultMsg = "";
  
  // Audio chime severity trigger
  let chimeSeverity = "info";
  
  if (stateName === "AI Monitoring Active") {
    color = "var(--suc)";
    bg = "rgba(20, 108, 46, 0.1)";
    border = "rgba(20, 108, 46, 0.25)";
    badgePulse.className = "pulse-green";
    badgePulse.style.background = "var(--suc)";
    chimeSeverity = "clear";
  } else if (stateName === "Test Open") {
    color = "var(--inf)";
    bg = "rgba(0, 99, 155, 0.1)";
    border = "rgba(0, 99, 155, 0.25)";
    badgePulse.className = "pulse-blue";
    badgePulse.style.background = "var(--inf)";
    chimeSeverity = "info";
  } else if (stateName === "AI Reviewing") {
    color = "var(--sec)";
    bg = "rgba(103, 80, 164, 0.1)";
    border = "rgba(103, 80, 164, 0.25)";
    badgePulse.className = "pulse-purple";
    badgePulse.style.background = "var(--sec)";
    chimeSeverity = "info";
  } else if (stateName === "Human Review Needed") {
    color = "var(--pri)";
    bg = "rgba(249, 173, 0, 0.1)";
    border = "rgba(249, 173, 0, 0.25)";
    badgePulse.className = "pulse-amber";
    badgePulse.style.background = "var(--pri)";
    chimeSeverity = "warning";
  } else if (stateName === "Network Error") {
    color = "var(--err)";
    bg = "rgba(179, 38, 30, 0.1)";
    border = "rgba(179, 38, 30, 0.25)";
    badgePulse.className = "pulse-red";
    badgePulse.style.background = "var(--err)";
    isFault = true;
    faultMsg = "Network Connection Fault. Sync protocols interrupted.";
    chimeSeverity = "critical";
  } else if (stateName === "Camera Disconnected") {
    color = "var(--err)";
    bg = "rgba(179, 38, 30, 0.1)";
    border = "rgba(179, 38, 30, 0.25)";
    badgePulse.className = "pulse-red";
    badgePulse.style.background = "var(--err)";
    isFault = true;
    faultMsg = "Peripheral Interruption. Camera Feed Node disconnected.";
    chimeSeverity = "critical";
  } else if (stateName === "AI Node Failure") {
    color = "var(--err)";
    bg = "rgba(179, 38, 30, 0.1)";
    border = "rgba(179, 38, 30, 0.25)";
    badgePulse.className = "pulse-red";
    badgePulse.style.background = "var(--err)";
    isFault = true;
    faultMsg = "Critical Server Error. AI Model Node Core Failure.";
    chimeSeverity = "critical";
  }
  
  // Style button
  badgeBtn.style.color = color;
  badgeBtn.style.background = bg;
  badgeBtn.style.borderColor = border;
  
  // Play chime alert synthesizer
  if (typeof playAlertChime === "function") {
    playAlertChime(chimeSeverity);
  }
  
  // Show / Hide fault banner
  if (isFault) {
    faultText.textContent = faultMsg;
    faultBanner.classList.remove("hidden");
    pushToast("Operational Fault Alert", faultMsg, "error");
  } else {
    faultBanner.classList.add("hidden");
    pushToast("Mode Switch Completed", `Operational state set to ${stateName}.`, "success");
  }
}

// Simulated Fault Recoveries
function simulatedSystemRetry() {
  pushToast("Retrying Node Connection...", "Synchronizing with secure exam channels...", "info");
  
  const faultBanner = document.getElementById("telemetry-fault-banner");
  if (faultBanner) {
    faultBanner.style.opacity = "0.5";
  }
  
  setTimeout(() => {
    if (faultBanner) {
      faultBanner.style.opacity = "1";
    }
    // Restore back to normal state
    changeTelemetryState("AI Monitoring Active");
    pushToast("Connection Restored", "All systems report green. Telemetry synchronized.", "success");
  }, 1200);
}

function simulatedNodeRestart() {
  pushToast("Restarting Node Core...", "Cold starting AI execution model layer...", "warning");
  
  const faultBanner = document.getElementById("telemetry-fault-banner");
  if (faultBanner) {
    faultBanner.style.opacity = "0.5";
  }
  
  setTimeout(() => {
    if (faultBanner) {
      faultBanner.style.opacity = "1";
    }
    // Restore back to normal state
    changeTelemetryState("AI Monitoring Active");
    pushToast("Node Restart Successful", "AI proctor layers online. Models loaded successfully.", "success");
  }, 1800);
}

// ==================== PANELS DATA & INTERACTIVE RENDERING ENGINE ====================

// Mock Payments Transaction logs database
let PAYMENTS = [
  { id: "TXN-99824", date: "2026-05-18", details: "SecureProctor Payout · Stripe Direct", amount: "$380.00", status: "Deposited", action: "Download Invoice" },
  { id: "TXN-99710", date: "2026-05-11", details: "SecureProctor Payout · Stripe Direct", amount: "$420.00", status: "Deposited", action: "Download Invoice" },
  { id: "TXN-99645", date: "2026-05-04", details: "SecureProctor Payout · Stripe Direct", amount: "$290.00", status: "Deposited", action: "Download Invoice" },
  { id: "TXN-99518", date: "2026-04-27", details: "SecureProctor Payout · Stripe Direct", amount: "$510.00", status: "Deposited", action: "Download Invoice" },
  { id: "TXN-99432", date: "2026-04-20", details: "SecureProctor Payout · Stripe Direct", amount: "$150.00", status: "Failed", action: "Retry Payout" }
];

// Mock Earnings shift list
let EARNINGS_SHIFTS = [
  { id: "SHIFT-881", session: "CS101 Midterm", duration: "3.0 hrs", node: "AI-NODE-03", rate: "$45.00/hr", payout: "$135.00" },
  { id: "SHIFT-880", session: "ECON202 Final", duration: "2.0 hrs", node: "AI-NODE-01", rate: "$45.00/hr", payout: "$90.00" },
  { id: "SHIFT-874", session: "MGT300 Midterm", duration: "1.5 hrs", node: "AI-NODE-04", rate: "$45.00/hr", payout: "$67.50" },
  { id: "SHIFT-869", session: "Ecology Lab Practical", duration: "2.5 hrs", node: "AI-NODE-08", rate: "$60.00/hr", payout: "$150.00" }
];

// Render Candidates Directory
function renderCandidatesPanel() {
  const tbody = document.getElementById("candidate-directory-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const searchVal = (document.getElementById("candidate-search-input")?.value || "").toLowerCase();
  const complianceVal = document.getElementById("candidate-compliance-filter")?.value || "all";
  
  CANDIDATES.forEach(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchVal) || c.exam.toLowerCase().includes(searchVal) || c.id.toLowerCase().includes(searchVal);
    
    // Status translation for compliance filter
    const compState = c.actionStatus === "Suspended" ? "critical" : (c.status === "danger" ? "critical" : (c.status === "warning" ? "warning" : "optimal"));
    const matchesCompliance = complianceVal === "all" || compState === complianceVal;
    
    if (matchesSearch && matchesCompliance) {
      const color = c.status === "danger" ? "#b3261e" : (c.status === "warning" ? "#7d5700" : "#146c2e");
      const bg = c.status === "danger" ? "#fcedeb" : (c.status === "warning" ? "#fff8db" : "#d2f4de");
      const badgeText = c.actionStatus === "Suspended" ? 'suspended' : (c.status === 'danger' ? 'critical' : (c.status === 'warning' ? 'warning' : 'optimal'));
      const riskScore = c.status === "danger" ? "88%" : (c.status === "warning" ? "45%" : "4%");
      
      const tr = document.createElement("tr");
      tr.style.cssText = "border-bottom: 1px solid rgba(0,0,0,0.03);";
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 700; color: var(--on-sur);">${c.name} <span style="font-size: 9px; color: var(--out); font-family: 'JetBrains Mono'; margin-left:4px;">${c.id}</span></td>
        <td style="padding: 12px 16px; color: var(--on-sur-var);">${c.exam}</td>
        <td style="padding: 12px 16px; font-weight: 700; font-family: 'JetBrains Mono';">${c.warnings} warnings</td>
        <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; font-weight: 700; color: ${color};">${riskScore}</td>
        <td style="padding: 12px 16px;">
          <span class="bdg" style="background:${bg}; color:${color}; font-size:9px; padding:2px 6px; text-transform:uppercase;">${badgeText}</span>
        </td>
        <td style="padding: 12px 16px; text-align: right;">
          <button class="mdbtn btn-tonal" onclick="changePanel('live-panel')" style="font-size: 10px; min-height: 24px; padding: 2px 8px;">
            <i class="material-icons" style="font-size: 12px;">visibility</i> Inspect
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function filterCandidateList() {
  renderCandidatesPanel();
}

// Render AI Flags Panel
function renderFlagsPanel() {
  const tbody = document.getElementById("flags-registry-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const searchVal = (document.getElementById("flag-search-input")?.value || "").toLowerCase();
  const typeVal = document.getElementById("flag-type-filter")?.value || "all";
  
  INCIDENTS.forEach(inc => {
    const matchesSearch = inc.name.toLowerCase().includes(searchVal) || inc.rule.toLowerCase().includes(searchVal) || inc.id.toLowerCase().includes(searchVal);
    const matchesType = typeVal === "all" || inc.rule.toLowerCase().includes(typeVal.toLowerCase()) || (typeVal === "Noise Spike" && inc.rule.includes("Voice"));
    
    if (matchesSearch && matchesType) {
      const color = inc.severity === "high" ? "var(--err)" : "var(--wrn)";
      const bg = inc.severity === "high" ? "rgba(179, 38, 30, 0.1)" : "rgba(249, 173, 0, 0.1)";
      
      const tr = document.createElement("tr");
      tr.style.cssText = "border-bottom: 1px solid rgba(0,0,0,0.03);";
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; font-weight: 700;">${inc.id}</td>
        <td style="padding: 12px 16px; font-weight: 700; color: var(--on-sur);">${inc.name}</td>
        <td style="padding: 12px 16px; color: var(--on-sur-var); font-weight: 600;">${inc.rule}</td>
        <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; color: var(--out);">${inc.time}</td>
        <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; font-weight: 700; color: ${color};">${inc.confidence}% Match</td>
        <td style="padding: 12px 16px; text-align: right;">
          <span class="bdg" style="background:${bg}; color:${color}; font-size:9px; padding:2px 6px; text-transform:uppercase;">${inc.status}</span>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function filterFlagsList() {
  renderFlagsPanel();
}

// Render Earnings Panel
function renderEarningsPanel() {
  renderPaymentsPanel();
}

function renderPaymentsPanel() {
  const tbody = document.getElementById("payments-history-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const searchVal = (document.getElementById("payment-search-input")?.value || "").toLowerCase();
  const statusVal = document.getElementById("payment-status-filter")?.value || "all";
  
  PAYMENTS.forEach(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchVal) || p.details.toLowerCase().includes(searchVal) || p.amount.toLowerCase().includes(searchVal);
    const matchesStatus = statusVal === "all" || p.status === statusVal;
    
    if (matchesSearch && matchesStatus) {
      const color = p.status === "Deposited" ? "var(--suc)" : (p.status === "Processing" ? "var(--inf)" : "var(--err)");
      const bg = p.status === "Deposited" ? "rgba(20, 108, 46, 0.1)" : (p.status === "Processing" ? "rgba(0, 99, 155, 0.1)" : "rgba(179, 38, 30, 0.1)");
      
      const tr = document.createElement("tr");
      tr.style.cssText = "border-bottom: 1px solid rgba(0,0,0,0.03);";
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-weight: 700; color: var(--on-sur);">${p.details}</td>
        <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; color: var(--out);">${p.date}</td>
        <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; font-weight: 700;">${p.id}</td>
        <td style="padding: 12px 16px; color: var(--on-sur); font-family: 'JetBrains Mono';">Stripe Direct</td>
        <td style="padding: 12px 16px;">
          <span class="bdg" style="background:${bg}; color:${color}; font-size:9px; padding:2px 6px; text-transform:uppercase;">${p.status}</span>
        </td>
        <td style="padding: 12px 16px; text-align: right;">
          <button class="mdbtn btn-tonal" onclick="pushToast('Processing Statement...', 'Compiling PDF details for invoice ${p.id}...', 'info')" style="font-size: 10px; min-height: 24px; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
            <i class="material-icons" style="font-size: 12px;">receipt</i> <span>Invoice</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function filterPaymentsList() {
  renderPaymentsPanel();
}

// SESSIONS & SCHEDULING DATABASE & RENDERING
let SESSIONS_DATA = [
  { id: "SESS-892", name: "CS101 Midterm", avatar: "💻", status: "Active", started: "May 19, 09:00 PST", incidents: 3, duration: "3.0 hrs", cohort: "Cohort A", proctor: "Dr. Sarah Jenkins" },
  { id: "SESS-891", name: "ECON202 Final", avatar: "📈", status: "Completed", started: "May 18, 14:00 PST", incidents: 0, duration: "2.0 hrs", cohort: "Cohort B", proctor: "Prof. Robert Chen" },
  { id: "SESS-890", name: "MGT300 Midterm", avatar: "📊", status: "Completed", started: "May 17, 10:30 PST", incidents: 1, duration: "1.5 hrs", cohort: "Cohort C", proctor: "Sarah Jenkins" },
  { id: "SESS-889", name: "Ecology Lab Practical", avatar: "🌿", status: "Completed", started: "May 15, 08:30 PST", incidents: 5, duration: "2.5 hrs", cohort: "Cohort D", proctor: "Dr. Angela Martinez" }
];

function renderSessionsTable(filter = 'all') {
  const tbody = document.getElementById("sessions-table-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  SESSIONS_DATA.forEach(s => {
    if (filter === "active" && s.status !== "Active") return;
    if (filter === "completed" && s.status !== "Completed") return;

    const statusCol = s.status === "Active" ? "var(--suc)" : "var(--out)";
    const statusBg = s.status === "Active" ? "rgba(20, 108, 46, 0.1)" : "rgba(0, 0, 0, 0.05)";

    const tr = document.createElement("tr");
    tr.className = "session-row-item";
    tr.style.cursor = "pointer";
    tr.style.borderBottom = "1px solid rgba(0,0,0,0.03)";
    tr.onclick = () => {
      // Highlight row
      document.querySelectorAll(".session-row-item").forEach(r => r.style.background = "");
      tr.style.background = "rgba(249, 173, 0, 0.08)";
      // Sync calendar date selection (highlight corresponding day on grid)
      const dayMatch = s.started.match(/May\s+(\d+)/);
      if (dayMatch && dayMatch[1]) {
        const targetDate = `2026-05-${dayMatch[1].padStart(2, '0')}`;
        CALENDAR_SELECTED_DATE = targetDate;
        renderCalendar();
        pushToast("Calendar Synced", `Date selection shifted to ${targetDate} for ${s.name}`, "info");
      }
    };

    tr.innerHTML = `
      <td style="padding: 12px 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">${s.avatar}</span>
          <div>
            <div style="font-weight: 700; color: var(--on-sur);">${s.name}</div>
            <div style="font-size: 10px; color: var(--out); font-family: 'JetBrains Mono';">${s.id}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px 16px;">
        <span class="bdg" style="background:${statusBg}; color:${statusCol}; font-size:9px; padding:2px 6px; text-transform:uppercase;">${s.status}</span>
      </td>
      <td style="padding: 12px 16px; color: var(--on-sur); font-family: 'JetBrains Mono';">${s.started}</td>
      <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; font-weight: 700; color: ${s.incidents > 0 ? 'var(--err)' : 'var(--suc)'};">${s.incidents}</td>
      <td style="padding: 12px 16px; font-family: 'JetBrains Mono'; color: var(--out);">${s.duration}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterSessions(filter, btn) {
  const container = btn.closest(".segmented-filters");
  if (container) {
    container.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("on");
      b.style.background = "transparent";
      b.style.color = "var(--out)";
      b.style.boxShadow = "none";
      b.style.border = "1px solid transparent";
    });
    btn.classList.add("on");
    btn.style.background = "var(--sur)";
    btn.style.color = "var(--on-sur)";
    btn.style.boxShadow = "var(--shadow-sm)";
    btn.style.border = "1px solid var(--glass-border)";
  }
  renderSessionsTable(filter);
}

function selectCalendarDate(dateStr) {
  CALENDAR_SELECTED_DATE = dateStr;
  renderCalendar();
  
  const existingSession = SESSIONS_DATA.find(s => s.started.includes(new Date(dateStr + "T00:00:00").toLocaleDateString('en-US', { month: 'short', day: 'numeric' })));
  if (existingSession) {
    pushToast("Session Info", `Selected: ${existingSession.name} (${existingSession.id})`, "info");
    const rows = document.querySelectorAll(".session-row-item");
    rows.forEach(r => {
      r.style.background = "";
      if (r.innerHTML.includes(existingSession.id)) {
        r.style.background = "rgba(249, 173, 0, 0.08)";
        r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  } else {
    openQuickActionModal('session', dateStr);
  }
}

function openQuickActionModal(type, date = null) {
  const modal = document.getElementById("scheduler-modal");
  const overlay = document.getElementById("scheduler-modal-overlay");
  if (!modal || !overlay) return;

  const targetDate = date || CALENDAR_SELECTED_DATE || "2026-05-19";
  document.getElementById("modal-shift-date").value = targetDate;
  
  const typeSelector = document.getElementById("modal-shift-type");
  typeSelector.value = type;
  toggleModalShiftType();
  
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeSchedulerModal() {
  document.getElementById("scheduler-modal").classList.add("hidden");
  document.getElementById("scheduler-modal-overlay").classList.add("hidden");
}

function toggleModalShiftType() {
  const type = document.getElementById("modal-shift-type").value;
  const group = document.getElementById("modal-shift-session-group");
  if (type === "session") {
    group.classList.remove("hidden");
  } else {
    group.classList.add("hidden");
  }
}

function saveModalShift() {
  const date = document.getElementById("modal-shift-date").value;
  const type = document.getElementById("modal-shift-type").value;
  const exam = document.getElementById("modal-shift-exam").value;
  const start = document.getElementById("modal-shift-start").value;
  const end = document.getElementById("modal-shift-end").value;
  
  SHIFTS = SHIFTS.filter(s => s.date !== date);
  
  const newShift = {
    date: date,
    type: type,
    exam: type === "session" ? exam : "",
    start: start,
    end: end
  };
  
  SHIFTS.push(newShift);
  
  if (type === "session") {
    const formattedStarted = new Date(date + "T" + start).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    }) + `, ${start} PST`;
    
    const newSession = {
      id: "SESS-" + Math.floor(100 + Math.random() * 900),
      name: exam,
      avatar: "💻",
      status: "Active",
      started: formattedStarted,
      incidents: 0,
      duration: (parseInt(end.split(":")[0]) - parseInt(start.split(":")[0])) + ".0 hrs",
      cohort: "Cohort A",
      proctor: "Dr. Sarah Jenkins"
    };
    SESSIONS_DATA.push(newSession);
  }
  
  pushToast("Shift / Session Saved", "The schedule has been successfully updated in real-time.", "success");
  
  closeSchedulerModal();
  renderCalendar();
  renderAgendaList();
}


