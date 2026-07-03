/* ==========================================================================
   SECUREPROCTOR AI - LOCKDOWN EXAM RUNTIME (PORTS 3003 & 3004)
   ========================================================================== */

// ==========================================================================
// STATE
// ==========================================================================
const urlParams = new URLSearchParams(window.location.search);
const candidateId = urlParams.get('candidateId') || localStorage.getItem('candidateId') || 'cand_001';

const EXAM_STATE = {
  candidateId: candidateId,
  candidateName: 'Rahul Mehta',
  rollNo: 'CS2026-001',
  sessionName: 'Food Protection Manager Certification (Final Assessment)',
  warningCount: 0,
  timer: null,
  timeLeft: 3600, // 60 minutes
  currentQ: 0,
  questions: [
    {
      q: "Which of the following temperature ranges represents the 'Temperature Danger Zone' where pathogens grow most rapidly?",
      opts: ["32°F to 41°F", "41°F to 135°F", "135°F to 165°F", "50°F to 140°F"],
      a: 1,
      sel: null
    },
    {
      q: "When refilling a customer's beverage cup, which part of the cup must the food handler NEVER touch?",
      opts: ["The lip contact area", "The middle section", "The bottom base", "Any part of the cup handle"],
      a: 0,
      sel: null
    },
    {
      q: "To ensure safety, what is the minimum internal cooking temperature required for poultry (chicken, turkey, duck)?",
      opts: ["145°F (63°C) for 15 seconds", "155°F (68°C) for 15 seconds", "165°F (74°C) for <1 second", "135°F (57°C) for 15 seconds"],
      a: 2,
      sel: null
    },
    {
      q: "How should raw meats, poultry, and fish be stored in a refrigerator relative to ready-to-eat foods?",
      opts: ["On the top shelf above ready-to-eat foods", "Directly next to salad greens on the middle shelf", "On the bottom shelves below ready-to-eat foods, organized by cooking temperature", "Wrapped together in a single open plastic bin"],
      a: 2,
      sel: null
    },
    {
      q: "What is the first step that must be performed when cleaning and sanitizing a stationary prep table?",
      opts: ["Apply a chemical sanitizer spray", "Wash the surface with hot soapy water", "Scrape or remove food bits and soil from the surface", "Rinse the table surface with clean warm water"],
      a: 2,
      sel: null
    },
    {
      q: "What is the only guaranteed method for preventing cross-contact of food allergens?",
      opts: ["Cooking the food to 165°F", "Washing hands vigorously", "Using completely separate equipment and utensils", "Storing allergens on the bottom shelf"],
      a: 2,
      sel: null
    },
    {
      q: "A food handler comes to work with a sore throat and fever. What should the manager do?",
      opts: ["Restrict them from working with or around food", "Tell them to wear a mask and continue working", "Allow them to only work the register", "Send them home immediately regardless of the operation type"],
      a: 0,
      sel: null
    },
    {
      q: "Which document provides guidelines on chemical hazards and safe handling procedures?",
      opts: ["FDA Food Code", "Safety Data Sheet (SDS / MSDS)", "HACCP Plan", "Standard Operating Procedures (SOP)"],
      a: 1,
      sel: null
    },
    {
      q: "At what temperature must hot TCS food be maintained during service?",
      opts: ["100°F (38°C) or higher", "135°F (57°C) or higher", "145°F (63°C) or higher", "165°F (74°C) or higher"],
      a: 1,
      sel: null
    },
    {
      q: "How should a bi-metallic stemmed thermometer be calibrated?",
      opts: ["By shaking it vigorously", "Using the ice-point or boiling-point method", "By holding it under hot running water", "It does not need to be calibrated"],
      a: 1,
      sel: null
    }
  ],
  flagged: new Set()
};

// ==========================================================================
// BOOTSTRAP & INITIALIZATION
// ==========================================================================
window.addEventListener("DOMContentLoaded", () => {
  // Lock down theme to dark theme for secure exam lockdown look
  document.documentElement.setAttribute("data-t", "dark");
  document.body.classList.add("dark-theme");

  // Load candidate details
  fetchCandidateDetails();

  // Setup security focus listeners
  setupSecurityListeners();
});

async function fetchCandidateDetails() {
  try {
    const res = await fetch(`/api/candidates/${EXAM_STATE.candidateId}`);
    const data = await res.json();
    if (data && !data.error) {
      EXAM_STATE.candidateName = data.name;
      EXAM_STATE.rollNo = data.rollNo || data.id;

      // Update webcam badge name
      const badge = document.querySelector('.live-rec-badge');
      if (badge) badge.textContent = `LIVE REC • ${EXAM_STATE.rollNo}`;

      // Update camera mock image if webcam fails
      const img = document.querySelector('.exam-cam-preview img');
      if (img && data.photo) {
        img.src = data.photo;
      }
    }
  } catch (err) {
    console.error("Failed to fetch candidate information:", err);
  }
}

// ==========================================================================
// SYSTEM CHECK / HARDWARE VALIDATION
// ==========================================================================
function runSystemCheck() {
  const checkBtn = document.getElementById("run-check-btn");
  const startBtn = document.getElementById("start-exam-btn");
  if (!checkBtn) return;

  checkBtn.disabled = true;
  checkBtn.innerHTML = `<i class="material-icons" style="animation: spin 1s linear infinite;">sync</i> <span>Validating...</span>`;

  // Define steps
  const steps = [
    { id: "check-cam", name: "Webcam Access" },
    { id: "check-mic", name: "Microphone Access" },
    { id: "check-net", name: "Network Stability" },
    { id: "check-win", name: "Fullscreen & Browser" }
  ];

  let currentStepIndex = 0;

  function runNextStep() {
    if (currentStepIndex >= steps.length) {
      // Done with checks
      checkBtn.innerHTML = `<i class="material-icons" style="color: var(--suc);">check_circle</i> <span>Checks Complete</span>`;

      startBtn.disabled = false;
      startBtn.classList.remove("btn-tonal");
      startBtn.classList.add("btn-filled");
      startBtn.innerHTML = `<span>Start Secure Exam</span> <i class="material-icons">lock_open</i>`;

      // Attempt to start streaming real webcam
      startWebcamStream();
      return;
    }

    const step = steps[currentStepIndex];
    const el = document.getElementById(step.id);
    if (el) {
      el.classList.add("checking");
      el.querySelector(".sys-check-status").innerHTML = `<i class="material-icons" style="animation: spin 1s linear infinite;">sync</i>`;
    }

    setTimeout(() => {
      if (el) {
        el.classList.remove("checking");
        el.classList.add("success");
        el.querySelector(".sys-check-status").innerHTML = `<i class="material-icons" style="color: var(--suc);">check_circle</i>`;
      }
      currentStepIndex++;
      runNextStep();
    }, 600);
  }

  runNextStep();
}

function startWebcamStream() {
  const container = document.querySelector('.exam-cam-preview');
  if (!container) return;

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      // Create video element
      let video = document.getElementById("webcam-video");
      if (!video) {
        video = document.createElement("video");
        video.id = "webcam-video";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;

        // Remove img and overlay to insert video
        const img = container.querySelector('img');
        if (img) img.remove();
        container.insertBefore(video, container.firstChild);
      }
      video.srcObject = stream;
    })
    .catch(err => {
      console.warn("Real webcam stream failed, falling back to mock: ", err);
    });
}

// ==========================================================================
// SECURITY MONITORING (BLUR/FOCUS LOSS & INCIDENT POSTING)
// ==========================================================================
let isExamActive = false;

function setupSecurityListeners() {
  window.addEventListener("blur", () => {
    if (!isExamActive) return;

    // Increment warnings
    EXAM_STATE.warningCount++;

    // Display Warning Toast
    showWarningToast(`PROCTOR WARNING: Focus lost / Tab switched detected. Warning count: ${EXAM_STATE.warningCount}`);

    // Post Malpractice Incident Telemetry to backend
    logMalpracticeIncident("Tab Switch / Focus Lost");
  });

  window.addEventListener("focus", () => {
    if (!isExamActive) return;
    showWarningToast(`Focus restored. Please keep your window in fullscreen.`, "info");
  });
}

function showWarningToast(message, type = "error") {
  const toast = document.getElementById("exam-warning");
  const textSpan = document.getElementById("exam-warning-text");
  const icon = toast.querySelector(".warning-icon");
  const title = toast.querySelector(".toast-title");

  if (!toast || !textSpan) return;

  textSpan.textContent = message;

  if (type === "info") {
    toast.style.background = "#003350";
    toast.style.color = "#7fcfff";
    toast.style.borderLeft = "5px solid var(--sec)";
    if (icon) icon.textContent = "info";
    if (title) title.textContent = "SECURITY ANNOUNCEMENT";
  } else {
    toast.style.background = "#601410";
    toast.style.color = "#fcedeb";
    toast.style.borderLeft = "5px solid var(--err)";
    if (icon) icon.textContent = "warning";
    if (title) title.textContent = "PROCTOR WARNING";
  }

  toast.classList.add("show");

  // Auto-hide warning toast after 5s
  setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);
}

async function logMalpracticeIncident(alertType) {
  try {
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: EXAM_STATE.candidateId,
        alertType: alertType,
        confidence: 99
      })
    });
    const data = await res.json();
    console.log("Malpractice incident logged successfully:", data);
  } catch (err) {
    console.error("Failed to log malpractice incident telemetry:", err);
  }
}

// ==========================================================================
// EXAM NAVIGATION & INTERACTION
// ==========================================================================
function navigateTo(panelId) {
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(panelId);
  if (target) {
    target.classList.add("active");
  }

  if (panelId === 'cand-exam-live') {
    startExam();
  }
}

function startExam() {
  isExamActive = true;
  EXAM_STATE.timeLeft = 3600; // Reset to 60m
  startTimer();
  populateNavGrid();
  renderQuestion();

  // Request Fullscreen
  requestFullscreen();
}

function requestFullscreen() {
  const docEl = document.documentElement;
  if (docEl.requestFullscreen) {
    docEl.requestFullscreen().catch(err => {
      console.warn("Fullscreen request denied: ", err);
    });
  }
}

function startTimer() {
  if (EXAM_STATE.timer) clearInterval(EXAM_STATE.timer);
  const display = document.getElementById("exam-timer-display");

  EXAM_STATE.timer = setInterval(() => {
    EXAM_STATE.timeLeft--;
    const mins = Math.floor(EXAM_STATE.timeLeft / 60);
    const secs = EXAM_STATE.timeLeft % 60;

    if (display) {
      display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (EXAM_STATE.timeLeft <= 300) {
        display.style.color = "var(--err)";
        display.style.borderColor = "var(--err)";
      }
    }

    if (EXAM_STATE.timeLeft <= 0) {
      clearInterval(EXAM_STATE.timer);
      submitExam();
    }
  }, 1000);
}

function populateNavGrid() {
  const grid = document.getElementById("exam-nav-grid");
  if (!grid) return;
  grid.innerHTML = "";

  EXAM_STATE.questions.forEach((q, i) => {
    const btn = document.createElement("button");
    const isFlagged = EXAM_STATE.flagged.has(i);
    let statusClass = q.sel !== null ? 'answered' : 'unanswered';
    if (isFlagged) statusClass = 'flagged';

    btn.className = `nav-btn ${statusClass} ${i === EXAM_STATE.currentQ ? 'active' : ''}`;
    if (isFlagged) {
      btn.style.borderColor = 'var(--wrn)';
      btn.style.color = 'var(--wrn)';
    }
    btn.textContent = i + 1;
    btn.onclick = () => jumpToQuestion(i);
    grid.appendChild(btn);
  });
}

function renderQuestion() {
  const q = EXAM_STATE.questions[EXAM_STATE.currentQ];
  const metaText = document.getElementById("q-meta-text");
  const qText = document.getElementById("q-text");
  const optionsList = document.getElementById("q-options");

  if (metaText) metaText.textContent = `Question ${EXAM_STATE.currentQ + 1} of ${EXAM_STATE.questions.length}`;
  if (qText) qText.textContent = q.q;

  if (optionsList) {
    optionsList.innerHTML = "";
    q.opts.forEach((opt, idx) => {
      const isSelected = q.sel === idx;
      const label = document.createElement("label");
      label.className = `opt-label ${isSelected ? 'selected' : ''}`;
      label.innerHTML = `
        <input type="radio" name="options" value="${idx}" ${isSelected ? 'checked' : ''}>
        <span>${opt}</span>
      `;

      label.querySelector("input").addEventListener("change", () => {
        selectAnswer(idx);
      });
      optionsList.appendChild(label);
    });
  }

  // Handle footer buttons
  const prevBtn = document.getElementById("btn-prev-q");
  const nextBtn = document.getElementById("btn-next-q");

  if (prevBtn) prevBtn.disabled = EXAM_STATE.currentQ === 0;
  if (nextBtn) {
    if (EXAM_STATE.currentQ === EXAM_STATE.questions.length - 1) {
      nextBtn.innerHTML = `<span>Submit Exam</span> <i class="material-icons">send</i>`;
      nextBtn.onclick = submitExam;
    } else {
      nextBtn.innerHTML = `<span>Next Question</span> <i class="material-icons">arrow_forward</i>`;
      nextBtn.onclick = () => navQuestion(1);
    }
  }
}

function selectAnswer(idx) {
  EXAM_STATE.questions[EXAM_STATE.currentQ].sel = idx;

  // Re-render current options selection styles
  const labels = document.querySelectorAll("#q-options .opt-label");
  labels.forEach((l, i) => {
    if (i === idx) {
      l.classList.add("selected");
    } else {
      l.classList.remove("selected");
    }
  });

  // Re-render navigation grid
  populateNavGrid();
}

function navQuestion(direction) {
  const target = EXAM_STATE.currentQ + direction;
  if (target >= 0 && target < EXAM_STATE.questions.length) {
    jumpToQuestion(target);
  }
}

function jumpToQuestion(idx) {
  EXAM_STATE.currentQ = idx;
  renderQuestion();
  populateNavGrid();
}

function toggleFlag() {
  if (EXAM_STATE.flagged.has(EXAM_STATE.currentQ)) {
    EXAM_STATE.flagged.delete(EXAM_STATE.currentQ);
  } else {
    EXAM_STATE.flagged.add(EXAM_STATE.currentQ);
  }
  populateNavGrid();
}

// ==========================================================================
// EXAM SUBMISSION & GRADING
// ==========================================================================
function submitExam() {
  isExamActive = false;
  if (EXAM_STATE.timer) clearInterval(EXAM_STATE.timer);

  // Grade the exam
  let score = 0;
  EXAM_STATE.questions.forEach(q => {
    if (q.sel === q.a) score++;
  });

  const percentage = Math.round((score / EXAM_STATE.questions.length) * 100);
  const passed = percentage >= 70; // 70% passing grade

  // Show results view
  document.getElementById("cand-exam-live").classList.remove("active");
  document.getElementById("cand-results").classList.add("active");

  // Render score circle
  const scoreCircle = document.getElementById("res-score-circle");
  if (scoreCircle) {
    scoreCircle.className = `score-circle ${passed ? 'pass' : 'fail'}`;
    scoreCircle.innerHTML = `
      <span class="score-val">${percentage}%</span>
      <span class="score-label">${passed ? 'Passed' : 'Failed'}</span>
    `;
  }

  // Render Topic breakdown
  const topicsDiv = document.getElementById("res-topics");
  if (topicsDiv) {
    const calcTopic = (indices) => {
      let correct = 0;
      indices.forEach(i => { if (EXAM_STATE.questions[i].sel === EXAM_STATE.questions[i].a) correct++; });
      return { correct, total: indices.length };
    };

    const t1 = calcTopic([0, 1, 2, 3]); // Food Handling
    const t2 = calcTopic([4, 7]);       // Cleaning & SDS
    const t3 = calcTopic([6]);          // Hygiene
    const t4 = calcTopic([5, 8, 9]);    // Temps & Equip

    topicsDiv.innerHTML = `
      <div class="topic-row">
        <span>Food Handling Practices (Q1-Q4)</span>
        <span style="font-weight:700; color:${t1.correct === t1.total ? 'var(--suc)' : 'var(--wrn)'};">${t1.correct} / ${t1.total} Correct</span>
      </div>
      <div class="topic-row">
        <span>Cleaning, Sanitation & Safety (Q5, Q8)</span>
        <span style="font-weight:700; color:${t2.correct === t2.total ? 'var(--suc)' : 'var(--wrn)'};">${t2.correct} / ${t2.total} Correct</span>
      </div>
      <div class="topic-row">
        <span>Employee Hygiene & Health (Q7)</span>
        <span style="font-weight:700; color:${t3.correct === t3.total ? 'var(--suc)' : 'var(--err)'};">${t3.correct} / ${t3.total} Correct</span>
      </div>
      <div class="topic-row">
        <span>Temperatures & Equipment (Q6, Q9, Q10)</span>
        <span style="font-weight:700; color:${t4.correct === t4.total ? 'var(--suc)' : 'var(--wrn)'};">${t4.correct} / ${t4.total} Correct</span>
      </div>
    `;
  }

  if (passed) {
    const certContainer = document.getElementById("res-cert-container");
    const certName = document.getElementById("cert-name");
    const certDate = document.getElementById("cert-date");
    const certScore = document.getElementById("cert-score");

    if (certContainer) certContainer.style.display = "block";
    if (certName) certName.textContent = EXAM_STATE.candidateName;
    if (certDate) certDate.textContent = new Date().toLocaleDateString();
    if (certScore) certScore.textContent = `${percentage}%`;
  }

  // Exit Fullscreen if active
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(err => {
      console.warn("Error exiting fullscreen:", err);
    });
  }

  // Tell the backend candidate completed the exam
  updateCandidateStatus(percentage);
}

async function updateCandidateStatus(score) {
  try {
    const res = await fetch(`/api/candidates/${EXAM_STATE.candidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examStatus: 'completed',
        examScore: score,
        lastActive: new Date().toISOString(),
        warningCount: EXAM_STATE.warningCount,
        aiRisk: EXAM_STATE.warningCount === 0 ? 'green' : (EXAM_STATE.warningCount < 3 ? 'amber' : 'red')
      })
    });
    const data = await res.json();
    console.log("Candidate status updated on server:", data);
  } catch (err) {
    console.error("Failed to update candidate status:", err);
  }
}

// CSS spin animation helper
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(style);
