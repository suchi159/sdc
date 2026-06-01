/* ==========================================================================
   SDC CANDIDATE LEARNING PLATFORM - INTERACTIVE ENGINE (WCAG 2.2 AA)
   ========================================================================== */

let CANDIDATE_STATE = {
  name: "Alex Rivera",
  email: "alex@student.edu",
  examDate: null,
  learningProgress: 0,
  theme: "light",
  flowMode: "candidate",
  notes: [
    { id: 1, topic: "Domain 2", text: "The temperature danger zone for food is between 41°F and 135°F. Remember 4-1-1-3-5." }
  ]
};

// ==========================================================================
// INIT & KEYBOARD ACCESSIBILITY
// ==========================================================================
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("cand_theme")) {
    CANDIDATE_STATE.theme = localStorage.getItem("cand_theme");
    document.documentElement.setAttribute("data-t", CANDIDATE_STATE.theme);
  }

  // Handle flowMode based on Port
  if (window.location.port === "3003") {
    CANDIDATE_STATE.flowMode = "in-class";
    document.getElementById("login-main-title").textContent = "In-Class Exam";
    document.getElementById("header-app-title").textContent = "In-Class Portal";
  } else if (window.location.port === "3002") {
    CANDIDATE_STATE.flowMode = "online";
    document.getElementById("login-main-title").textContent = "Online Exam";
    document.getElementById("header-app-title").textContent = "Online Portal";
  } else {
    CANDIDATE_STATE.flowMode = "candidate";
  }

  // Global Keyboard listener for custom interactive elements
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.getAttribute("role") === "button") {
      e.preventDefault();
      e.target.click();
    }
  });

  // Bind Navigation
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      navigateTo(e.currentTarget.getAttribute("data-target"));
    });
  });

  // Search Listener
  const searchInp = document.getElementById("ai-search-input");
  if(searchInp) {
    searchInp.addEventListener("keydown", (e) => {
      if(e.key === "Enter") performAISearch();
    });
  }

  renderNotes();
});

// ==========================================================================
// ROUTING & FOCUS MANAGEMENT (WCAG)
// ==========================================================================
function navigateTo(viewId) {
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => {
    n.classList.remove("active");
    n.setAttribute("aria-current", "false");
  });
  
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
    target.focus(); // Shift focus to new view for screen readers
    window.scrollTo(0,0);
  }

  const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
  if (navBtn) {
    navBtn.classList.add("active");
    navBtn.setAttribute("aria-current", "page");
  }

  if (viewId === 'cand-home') updateDashboard();
}

// ==========================================================================
// PHASE 1: FORM VALIDATION & ANCHOR
// ==========================================================================
function handleLogin(e) {
  e.preventDefault();
  const form = document.getElementById("login-form");
  const email = document.getElementById("login-email");
  const pass = document.getElementById("login-pass");
  
  let valid = true;
  if(!email.value.includes("@")) { email.classList.add("error"); valid = false; } else { email.classList.remove("error"); }
  if(pass.value.length < 4) { pass.classList.add("error"); valid = false; } else { pass.classList.remove("error"); }

  if(!valid) return;

  const btn = document.getElementById("login-btn");
  btn.innerHTML = `<i class="material-icons spin">sync</i> Authenticating...`;
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById("login-step").classList.add("hidden");
    document.getElementById("anchor-step").classList.remove("hidden");
    document.getElementById("exam-date-input").focus(); // shift focus
  }, 600);
}

function setAnchorDate() {
  const dateInput = document.getElementById("exam-date-input");
  if(!dateInput.value) {
    dateInput.style.borderColor = "var(--err)";
    return;
  }
  
  CANDIDATE_STATE.examDate = new Date(dateInput.value);
  document.getElementById("main-header").classList.remove("hidden");
  document.getElementById("main-nav").classList.remove("hidden");
  
  navigateTo("cand-home");
  
  setTimeout(() => {
    animateProgressRing(40);
  }, 500);
}

// ==========================================================================
// PHASE 2: DASHBOARD
// ==========================================================================
function updateDashboard() {
  if(!CANDIDATE_STATE.examDate) return;

  const now = new Date();
  const diffTime = Math.abs(CANDIDATE_STATE.examDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  const cd = document.getElementById("dash-countdown");
  cd.textContent = `${diffDays} Days`;
  document.getElementById("dash-date-display").textContent = CANDIDATE_STATE.examDate.toLocaleDateString();
  
  if (diffDays <= 0) {
    cd.textContent = "TODAY";
    cd.style.color = "var(--err)";
  }
}

function animateProgressRing(percent) {
  CANDIDATE_STATE.learningProgress = percent;
  const circle = document.getElementById("main-prog-ring");
  const text = document.getElementById("main-prog-text");
  
  if(circle && text) {
    const r = circle.r.baseVal.value;
    const circ = r * 2 * Math.PI;
    const offset = circ - (percent / 100) * circ;
    circle.style.strokeDasharray = circ;
    circle.style.strokeDashoffset = offset;
    text.textContent = `${percent}%`;
  }
}

// ==========================================================================
// AI SEARCH (NEW)
// ==========================================================================
function performAISearch() {
  const inp = document.getElementById("ai-search-input");
  const panel = document.getElementById("ai-result");
  const ans = document.getElementById("ai-answer-text");

  if(!inp.value) return;

  panel.classList.remove("show");
  ans.textContent = "Retrieving from authorized RAG index...";
  panel.classList.add("show");

  setTimeout(() => {
    if(inp.value.toLowerCase().includes("danger zone")) {
      ans.textContent = "The temperature danger zone is between 41°F and 135°F (5°C to 57°C). Pathogens grow most rapidly in this range. (Source: The Food Protection Manager's Handbook - Concise Edition, Ch 1)";
    } else {
      ans.textContent = "According to FDA regulations, ensure all surfaces are sanitized and raw meats are kept on bottom shelves to prevent cross-contamination. (Source: The Food Protection Manager's Handbook, Ch 4)";
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
    document.getElementById("fc-q").textContent = "What is the minimum holding temp for hot food?";
    document.getElementById("fc-a").textContent = "135°F (57°C)";
  }, 300);
}

// ==========================================================================
// NOTES CRUD (NEW)
// ==========================================================================
function renderNotes() {
  const container = document.getElementById("notes-list-container");
  container.innerHTML = "";

  if(CANDIDATE_STATE.notes.length === 0) {
    container.innerHTML = `<p style="color:var(--on-sur-var); text-align:center;">No notes yet. Start highlighting or create one!</p>`;
    return;
  }

  CANDIDATE_STATE.notes.forEach(note => {
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
  if(!text) return;

  CANDIDATE_STATE.notes.push({ id: Date.now(), topic, text });
  renderNotes();
  closeNoteModal();
  showToast("Note saved successfully.");
}

function deleteNote(id) {
  if(confirm("Delete this note?")) {
    CANDIDATE_STATE.notes = CANDIDATE_STATE.notes.filter(n => n.id !== id);
    renderNotes();
  }
}

// ==========================================================================
// READER OVERLAY
// ==========================================================================
function openReader(type) {
  document.getElementById("reader-overlay").classList.add("open");
  document.getElementById("reader-pdf").style.display = "block";
  document.getElementById("reader-title").textContent = "The Danger Zone (Chapter 1)";
  document.getElementById("reader-pdf").focus();
}

function closeReader() {
  document.getElementById("reader-overlay").classList.remove("open");
  document.getElementById("anno-toolbar").classList.remove("active");
}

function showAnnoToolbar(e) {
  e.preventDefault();
  const t = document.getElementById("anno-toolbar");
  t.style.left = `${e.clientX || window.innerWidth/2}px`;
  t.style.top = `${(e.clientY || window.innerHeight/2) - 40}px`;
  t.classList.add("active");
  t.querySelector('button').focus();
}

function handleAnno(action) {
  document.getElementById("anno-toolbar").classList.remove("active");
  if (action === 'note') openNoteModal();
  else showToast(`Action ${action} applied.`);
}

// ==========================================================================
// MOCK EXAM & CERTIFICATES (90-Question Mock Logic)
// ==========================================================================
const TOTAL_MOCK_Q = 90;
const EXAM_Q = Array(TOTAL_MOCK_Q).fill(null).map((_, i) => ({
  q: `Simulated question ${i+1}. Which of the following is correct regarding food safety procedures in a commercial kitchen?`,
  opts: ["Always wear a hairnet", "Wash hands for 5 seconds", "Store raw meat above vegetables", "Use the same cutting board for all foods"],
  a: 0,
  sel: null
}));

// Hardcode the specific question from the screenshot for realism
EXAM_Q[4] = {
  q: "When refilling a cup, never touch",
  opts: ["No such restriction", "The lip contact area", "The middle", "The bottom"],
  a: 1,
  sel: null
};

let curQ = 4; // Start at question 5 to match screenshot exactly

function openMockExam() {
  document.getElementById("mock-exam-env").classList.add("open");
  curQ = 4; // Reset to the specific screenshot question
  EXAM_Q.forEach(q => q.sel = null);
  EXAM_Q[0].sel = 1; // dummy score padding to show "Score: 3 of 90"
  EXAM_Q[1].sel = 1;
  EXAM_Q[2].sel = 1;
  renderExamQ();
  document.getElementById("mock-focus-trap").focus();
}

function renderExamQ() {
  const q = EXAM_Q[curQ];
  document.getElementById("mock-q-meta").textContent = `Question ${curQ + 1} of ${TOTAL_MOCK_Q}`;
  document.getElementById("mock-q-text").textContent = q.q;
  
  // Calculate Score Live
  const answered = EXAM_Q.filter(x => x.sel !== null).length;
  document.getElementById("mock-score-live").textContent = `Your Score: ${answered} of ${TOTAL_MOCK_Q}`;
  
  const opts = document.getElementById("mock-q-options");
  opts.innerHTML = "";
  q.opts.forEach((opt, i) => {
    const lbl = document.createElement("label");
    lbl.className = "opt-label";
    lbl.innerHTML = `<input type="radio" name="mockq" value="${i}" ${q.sel === i ? 'checked' : ''} tabindex="0"> <span>${opt}</span>`;
    lbl.querySelector("input").addEventListener("change", () => { 
      q.sel = i; 
      // Update score silently
      const answeredNow = EXAM_Q.filter(x => x.sel !== null).length;
      document.getElementById("mock-score-live").textContent = `Your Score: ${answeredNow} of ${TOTAL_MOCK_Q}`;
    });
    opts.appendChild(lbl);
  });
  
  const nextBtn = document.getElementById("mock-next-btn");
  if (curQ === TOTAL_MOCK_Q - 1) {
    nextBtn.textContent = "FINISH EXAM";
  } else {
    nextBtn.textContent = "SUBMIT";
  }
}

function navMock(dir) {
  if (curQ === TOTAL_MOCK_Q - 1 && dir === 1) {
    submitMock();
    return;
  }
  curQ += dir;
  renderExamQ();
}

function submitMock() {
  document.getElementById("mock-exam-env").classList.remove("open");
  showToast("Exam Submitted! Certification Unlocked.");
  document.getElementById("cert-placeholder").classList.add("hidden");
  document.getElementById("cert-earned").classList.remove("hidden");
  navigateTo("cand-profile");
}

function handleLogout() {
  if(confirm("Sign out?")) window.location.reload();
}

function showToast(msg) {
  const div = document.createElement("div");
  div.style.cssText = "position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:var(--on-sur); color:var(--sur); padding:12px 24px; border-radius:100px; z-index:9999; box-shadow:var(--shadow-md); font-weight:600; font-size:14px;";
  div.setAttribute("role", "alert");
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => { div.style.opacity="0"; div.style.transition="opacity 0.3s"; setTimeout(()=>div.remove(), 300); }, 3000);
}
