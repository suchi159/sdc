/* ==========================================================================
   SECUREPROCTOR AI - CANDIDATE PORTAL INTERACTIVE ENGINE
   ========================================================================== */

// --------------------------------------------------------------------------
// STATE & MOCK DATA
// --------------------------------------------------------------------------
let CANDIDATE_STATE = {
  name: "Alex Rivera",
  id: "CAN-092",
  email: "alex.rivera@student.edu",
  course: "Advanced Computer Science CS101",
  learningProgress: 68,
  examDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  theme: "light",
  isExamMode: false
};

const PRACTICE_SCORES = [72, 78, 85, 92];

let EXAM_TIMER_INTERVAL = null;
let EXAM_SECONDS_LEFT = 3600; // 60 mins

let EXAM_QUESTIONS = [
  { id: 1, text: "Which sorting algorithm has the best average-case time complexity?", options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"], answer: 1, selected: null },
  { id: 2, text: "What is the primary purpose of a foreign key in a relational database?", options: ["To uniquely identify a record", "To index data for faster retrieval", "To establish a link between two tables", "To encrypt sensitive data"], answer: 2, selected: null },
  { id: 3, text: "Which data structure operates on a Last-In-First-Out (LIFO) principle?", options: ["Queue", "Stack", "Linked List", "Tree"], answer: 1, selected: null },
  { id: 4, text: "In object-oriented programming, what defines the concept of 'polymorphism'?", options: ["Hiding internal state", "Inheriting attributes from a parent", "Multiple objects responding to the same method call differently", "Bundling data and methods together"], answer: 2, selected: null },
  { id: 5, text: "What does the 'O' in SOLID design principles stand for?", options: ["Open-Closed Principle", "Object-Oriented Principle", "Overload Principle", "Output Principle"], answer: 0, selected: null }
];
let CURRENT_QUESTION = 0;

// --------------------------------------------------------------------------
// INITIALIZATION
// --------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  // Check theme
  if (localStorage.getItem("cand_theme")) {
    CANDIDATE_STATE.theme = localStorage.getItem("cand_theme");
    document.documentElement.setAttribute("data-t", CANDIDATE_STATE.theme);
  }

  // Bind theme toggles
  const themeBtns = document.querySelectorAll(".theme-toggle");
  themeBtns.forEach(btn => {
    btn.addEventListener("click", toggleTheme);
  });

  // Bind Navigation
  document.querySelectorAll("[data-target]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget.getAttribute("data-target");
      if (target) navigateTo(target);
    });
  });

  // Init values
  updateDashboardValues();
});

// --------------------------------------------------------------------------
// NAVIGATION & VIEWS
// --------------------------------------------------------------------------
function navigateTo(viewId) {
  // If in exam mode, prevent standard navigation unless confirmed
  if (CANDIDATE_STATE.isExamMode && viewId !== 'cand-results') {
    if(!confirm("Warning: You are in an active proctored exam. Leaving this page will submit your current progress. Are you sure?")) {
      return;
    }
    endExam();
  }

  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
    window.scrollTo(0,0);
  }

  // Handle header visibility
  const header = document.getElementById("main-header");
  const noHeaderViews = ['cand-auth-view', 'cand-onboard-view', 'cand-exam-live'];
  if (header) {
    if (noHeaderViews.includes(viewId)) {
      header.classList.add("hidden");
    } else {
      header.classList.remove("hidden");
    }
  }

  // View specific setups
  if (viewId === 'cand-dashboard') {
    updateDashboardValues();
  } else if (viewId === 'cand-exam-prep') {
    initSystemCheck();
  } else if (viewId === 'cand-exam-live') {
    startExam();
  } else if (viewId === 'cand-results') {
    renderResults();
  }
}

function toggleTheme() {
  CANDIDATE_STATE.theme = CANDIDATE_STATE.theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-t", CANDIDATE_STATE.theme);
  localStorage.setItem("cand_theme", CANDIDATE_STATE.theme);
  
  // Update icons
  document.querySelectorAll(".theme-toggle i").forEach(i => {
    i.textContent = CANDIDATE_STATE.theme === "light" ? "dark_mode" : "light_mode";
  });
}

// --------------------------------------------------------------------------
// AUTH & ONBOARDING
// --------------------------------------------------------------------------
function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById("login-btn");
  btn.innerHTML = `<i class="material-icons spin">sync</i> Authenticating...`;
  btn.disabled = true;

  setTimeout(() => {
    // Show password reset on "first" login mock
    document.getElementById("login-form-container").classList.add("hidden");
    document.getElementById("reset-form-container").classList.remove("hidden");
    document.querySelector(".auth-subtitle").textContent = "For security, please set a new password for your first login.";
  }, 1000);
}

function handleReset(e) {
  e.preventDefault();
  const btn = document.getElementById("reset-btn");
  btn.innerHTML = `<i class="material-icons spin">sync</i> Updating...`;
  btn.disabled = true;

  setTimeout(() => {
    navigateTo('cand-onboard-view');
  }, 800);
}

let ONBOARD_STEP = 1;
function nextOnboardStep(dir) {
  ONBOARD_STEP += dir;
  
  if (ONBOARD_STEP > 4) {
    navigateTo('cand-dashboard');
    return;
  }
  
  if (ONBOARD_STEP < 1) ONBOARD_STEP = 1;

  const carousel = document.getElementById("onboard-slider");
  carousel.style.transform = `translateX(-${(ONBOARD_STEP - 1) * 100}%)`;

  // Update dots
  document.querySelectorAll(".onboard-dots .dot").forEach((d, i) => {
    d.classList.toggle("active", i === ONBOARD_STEP - 1);
  });
}

function skipOnboarding() {
  navigateTo('cand-dashboard');
}

// --------------------------------------------------------------------------
// DASHBOARD
// --------------------------------------------------------------------------
function updateDashboardValues() {
  const diff = CANDIDATE_STATE.examDate - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  const daysEl = document.getElementById("dash-days-left");
  if(daysEl) daysEl.textContent = `${days} Days`;

  const barFill = document.getElementById("dash-prog-fill");
  if(barFill) {
    setTimeout(() => {
      barFill.style.width = `${CANDIDATE_STATE.learningProgress}%`;
    }, 300);
  }
}

// --------------------------------------------------------------------------
// LEARNING MATERIALS
// --------------------------------------------------------------------------
function switchLearningTab(tabId, btn) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  // In a real app, this would filter or change the visible list.
  // For mock, we just show a toast
  showToast(`Switched to ${btn.textContent.trim()}`);
}

// --------------------------------------------------------------------------
// SYSTEM CHECK & EXAM PREP
// --------------------------------------------------------------------------
function initSystemCheck() {
  // Reset states
  document.querySelectorAll(".sys-check-item").forEach(item => {
    item.className = "sys-check-item";
    const status = item.querySelector(".sys-check-status");
    const icon = item.querySelector(".sys-check-icon");
    if(status) status.innerHTML = '<i class="material-icons">hourglass_empty</i>';
    if(icon) {
      const type = item.id.split("-")[1];
      let iName = "settings";
      if(type==="cam") iName="videocam";
      if(type==="mic") iName="mic";
      if(type==="net") iName="wifi";
      if(type==="win") iName="desktop_windows";
      icon.innerHTML = `<i class="material-icons">${iName}</i>`;
    }
  });

  const btn = document.getElementById("start-exam-btn");
  if(btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="material-icons">lock</i> Run System Check First`;
  }
}

function runSystemCheck() {
  const btn = document.getElementById("run-check-btn");
  btn.disabled = true;
  btn.innerHTML = `<i class="material-icons spin">sync</i> Validating...`;

  const checks = ["check-cam", "check-mic", "check-net", "check-win"];
  
  checks.forEach((id, index) => {
    setTimeout(() => {
      const item = document.getElementById(id);
      item.classList.add("passed");
      item.querySelector(".sys-check-status").innerHTML = '<i class="material-icons">check_circle</i>';
      item.querySelector(".sys-check-icon").innerHTML = '<i class="material-icons">check</i>';
      
      if(index === checks.length - 1) {
        btn.innerHTML = `<i class="material-icons">verified</i> System Verified`;
        const startBtn = document.getElementById("start-exam-btn");
        startBtn.disabled = false;
        startBtn.innerHTML = `<span>Start Final Exam</span> <i class="material-icons">arrow_forward</i>`;
        startBtn.classList.remove("btn-tonal");
        startBtn.classList.add("btn-filled");
      }
    }, (index + 1) * 800);
  });
}

// --------------------------------------------------------------------------
// LIVE EXAM
// --------------------------------------------------------------------------
function startExam() {
  CANDIDATE_STATE.isExamMode = true;
  EXAM_SECONDS_LEFT = 3600; // 60 mins
  CURRENT_QUESTION = 0;
  
  // Hide normal header
  document.getElementById("main-header").classList.add("hidden");
  
  renderQuestion();
  renderExamNav();
  
  EXAM_TIMER_INTERVAL = setInterval(updateExamTimer, 1000);
  updateExamTimer();

  // Start AI Surveillance Mock
  startAIPolling();
}

function updateExamTimer() {
  EXAM_SECONDS_LEFT--;
  if (EXAM_SECONDS_LEFT <= 0) {
    clearInterval(EXAM_TIMER_INTERVAL);
    submitExam();
    return;
  }
  
  const m = Math.floor(EXAM_SECONDS_LEFT / 60).toString().padStart(2, '0');
  const s = (EXAM_SECONDS_LEFT % 60).toString().padStart(2, '0');
  
  const tEl = document.getElementById("exam-timer-display");
  if(tEl) tEl.textContent = `${m}:${s}`;

  if(EXAM_SECONDS_LEFT < 300) { // 5 mins
    tEl.style.color = "#ff5252";
  }
}

function renderQuestion() {
  const q = EXAM_QUESTIONS[CURRENT_QUESTION];
  document.getElementById("q-meta-text").textContent = `Question ${CURRENT_QUESTION + 1} of ${EXAM_QUESTIONS.length}`;
  document.getElementById("q-text").textContent = q.text;
  
  const optsContainer = document.getElementById("q-options");
  optsContainer.innerHTML = "";
  
  q.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "option-label";
    
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "exam-q";
    input.value = idx;
    if (q.selected === idx) input.checked = true;
    
    input.addEventListener("change", () => {
      q.selected = idx;
      renderExamNav();
    });
    
    const span = document.createElement("span");
    span.className = "option-text";
    span.textContent = opt;
    
    label.appendChild(input);
    label.appendChild(span);
    optsContainer.appendChild(label);
  });

  document.getElementById("btn-prev-q").disabled = CURRENT_QUESTION === 0;
  
  const nextBtn = document.getElementById("btn-next-q");
  if (CURRENT_QUESTION === EXAM_QUESTIONS.length - 1) {
    nextBtn.innerHTML = `<span>Review & Submit</span> <i class="material-icons">send</i>`;
    nextBtn.onclick = confirmSubmitExam;
  } else {
    nextBtn.innerHTML = `<span>Next Question</span> <i class="material-icons">arrow_forward</i>`;
    nextBtn.onclick = () => navQuestion(1);
  }
}

function renderExamNav() {
  const navContainer = document.getElementById("exam-nav-grid");
  if(!navContainer) return;
  navContainer.innerHTML = "";
  
  EXAM_QUESTIONS.forEach((q, idx) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    if (idx === CURRENT_QUESTION) btn.classList.add("active");
    else if (q.selected !== null) btn.classList.add("answered");
    
    btn.textContent = idx + 1;
    btn.onclick = () => {
      CURRENT_QUESTION = idx;
      renderQuestion();
      renderExamNav();
    };
    navContainer.appendChild(btn);
  });
}

function navQuestion(dir) {
  CURRENT_QUESTION += dir;
  renderQuestion();
  renderExamNav();
}

// AI Proctoring Mock
let AI_INTERVAL = null;
function startAIPolling() {
  if(AI_INTERVAL) clearInterval(AI_INTERVAL);
  
  AI_INTERVAL = setInterval(() => {
    if(!CANDIDATE_STATE.isExamMode) {
      clearInterval(AI_INTERVAL);
      return;
    }
    
    // 5% chance to trigger warning
    if(Math.random() > 0.95) {
      triggerExamWarning("Face not detected clearly. Please look at the camera.");
    }
  }, 10000);
}

function triggerExamWarning(msg) {
  const toast = document.getElementById("exam-warning");
  if(!toast) return;
  
  document.getElementById("exam-warning-text").textContent = msg;
  toast.classList.add("show");
  
  // Blink camera border
  const cam = document.querySelector(".exam-cam-overlay");
  if(cam) cam.style.borderColor = "#ff5252";
  
  setTimeout(() => {
    toast.classList.remove("show");
    if(cam) cam.style.borderColor = "rgba(255,255,255,0.1)";
  }, 5000);
}

// Override native tab switching
window.addEventListener("blur", () => {
  if (CANDIDATE_STATE.isExamMode) {
    triggerExamWarning("CRITICAL: Tab switching detected. This incident has been logged.");
  }
});

function confirmSubmitExam() {
  const unans = EXAM_QUESTIONS.filter(q => q.selected === null).length;
  let msg = "Are you sure you want to submit your exam?";
  if (unans > 0) msg = `You have ${unans} unanswered questions. Are you sure you want to submit?`;
  
  if(confirm(msg)) {
    submitExam();
  }
}

function submitExam() {
  clearInterval(EXAM_TIMER_INTERVAL);
  clearInterval(AI_INTERVAL);
  CANDIDATE_STATE.isExamMode = false;
  
  // Restore header
  document.getElementById("main-header").classList.remove("hidden");
  
  // Calculate score mock
  let correct = 0;
  EXAM_QUESTIONS.forEach(q => {
    if (q.selected === q.answer) correct++;
  });
  
  CANDIDATE_STATE.finalScore = Math.round((correct / EXAM_QUESTIONS.length) * 100);
  
  navigateTo('cand-results');
}

// --------------------------------------------------------------------------
// RESULTS
// --------------------------------------------------------------------------
function renderResults() {
  const score = CANDIDATE_STATE.finalScore || 85;
  const passed = score >= 70;
  
  const circle = document.getElementById("res-score-circle");
  if(circle) {
    circle.className = `score-circle ${passed ? 'pass' : 'fail'}`;
    circle.querySelector(".score-val").textContent = score;
    circle.querySelector(".score-label").textContent = passed ? "Passed" : "Failed";
    circle.querySelector(".score-label").style.color = passed ? "var(--suc)" : "var(--err)";
  }
  
  // Mock topic breakdowns
  const topics = [
    { name: "Algorithms", score: Math.min(100, score + 5) },
    { name: "Data Structures", score: Math.min(100, score - 8) },
    { name: "Architecture", score: Math.min(100, score + 12) },
    { name: "Design Patterns", score: Math.min(100, score - 2) }
  ];
  
  const tContainer = document.getElementById("res-topics");
  if(tContainer) {
    tContainer.innerHTML = "";
    topics.forEach(t => {
      const fillCol = t.score < 60 ? "var(--err)" : (t.score < 80 ? "var(--wrn)" : "var(--suc)");
      tContainer.innerHTML += `
        <div class="topic-bar-wrap">
          <div class="topic-meta">
            <span>${t.name}</span>
            <span>${t.score}%</span>
          </div>
          <div class="topic-track">
            <div class="topic-fill" style="width: ${t.score}%; background: ${fillCol}"></div>
          </div>
        </div>
      `;
    });
  }
}

// --------------------------------------------------------------------------
// UTILS
// --------------------------------------------------------------------------
function showToast(msg) {
  // Simple mock toast
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.bottom = "24px";
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.background = "var(--on-sur)";
  div.style.color = "var(--sur)";
  div.style.padding = "12px 24px";
  div.style.borderRadius = "100px";
  div.style.zIndex = "9999";
  div.style.boxShadow = "var(--shadow-md)";
  div.style.fontWeight = "600";
  div.style.fontSize = "14px";
  div.textContent = msg;
  
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.style.opacity = "0";
    div.style.transition = "opacity 0.3s";
    setTimeout(() => div.remove(), 300);
  }, 3000);
}
