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
  notes: [
    {
      id: 1,
      topic: "Domain 2",
      text: "The temperature danger zone for food is between 41°F and 135°F. Remember 4-1-1-3-5.",
    },
  ],
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
    if (timeDisplay) {
      const seconds = timeData[today];
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      timeDisplay.textContent = `Time spent today: ${hours}h ${minutes}m ${secs}s`;
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
  const themeToggle = document.querySelector(".theme-toggle");
  if (localStorage.getItem("cand_theme")) {
    CANDIDATE_STATE.theme = localStorage.getItem("cand_theme");
    document.documentElement.setAttribute("data-t", CANDIDATE_STATE.theme);
    if (themeToggle) {
      const icon = themeToggle.querySelector(".material-icons");
      if (icon) icon.textContent = CANDIDATE_STATE.theme === "light" ? "dark_mode" : "light_mode";
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      CANDIDATE_STATE.theme = CANDIDATE_STATE.theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-t", CANDIDATE_STATE.theme);
      localStorage.setItem("cand_theme", CANDIDATE_STATE.theme);
      const icon = themeToggle.querySelector(".material-icons");
      if (icon) icon.textContent = CANDIDATE_STATE.theme === "light" ? "dark_mode" : "light_mode";
    });
  }

  // Handle flowMode based on Port
  if (window.location.port === "3003") {
    CANDIDATE_STATE.flowMode = "in-class";
    document.getElementById("login-main-title").textContent =
      "Login for Student";
    document.getElementById("header-app-title").textContent = "SDC Certification Learning Material - Culinary Institute";
  } else if (window.location.port === "3002") {
    CANDIDATE_STATE.flowMode = "online";
    document.getElementById("login-main-title").textContent = "Online Exam";
    document.getElementById("header-app-title").textContent = "Online Portal";
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
  btn.innerHTML = `<i class="material-icons spin">sync</i> Authenticating...`;
  btn.disabled = true;

  setTimeout(() => {
    // Bypass onboarding step and go straight to dashboard
    CANDIDATE_STATE.examDate = new Date(); // Set a default date so dashboard renders
    document.getElementById("main-header").classList.remove("hidden");
    document.getElementById("main-nav").classList.remove("hidden");

    navigateTo("cand-home");

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
  cd.textContent = `${diffDays} Days`;
  document.getElementById("dash-date-display").textContent =
    CANDIDATE_STATE.examDate.toLocaleDateString();

  if (diffDays <= 0) {
    cd.textContent = "TODAY";
    cd.style.color = "var(--err)";
  }
}

function animateProgressRing(percent) {
  CANDIDATE_STATE.learningProgress = percent;
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
  document.getElementById("mock-exam-env").classList.remove("open");
  showToast("Time expired! Exam submitted automatically.");
  document.getElementById("cert-placeholder").classList.add("hidden");
  document.getElementById("cert-earned").classList.remove("hidden");
  navigateTo("cand-profile");
}

function openMockExam() {
  document.getElementById("mock-exam-env").classList.add("open");
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

  let summaryMsg = `Are you sure you want to submit your exam?\n\n`;
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
    document.getElementById("mock-exam-env").classList.remove("open");
    showToast("Exam Submitted! Certification Unlocked.");
    document.getElementById("cert-placeholder").classList.add("hidden");
    document.getElementById("cert-earned").classList.remove("hidden");
    navigateTo("cand-profile");
  }
}

function handleLogout() {
  if (confirm("Sign out of your account?")) window.location.reload();
}

function saveProfileChanges() {
  const email = document.getElementById("profile-email");
  const newPass = document.getElementById("profile-new-pass");
  const confirmPass = document.getElementById("profile-confirm-pass");

  let valid = true;

  // Validate email
  if (!email.value.includes("@")) {
    email.classList.add("error");
    valid = false;
  } else {
    email.classList.remove("error");
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

  // Simulate save
  showToastNotification("Account settings saved successfully!", "check_circle");
  newPass.value = "";
  confirmPass.value = "";
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
          
          <button class="mdbtn btn-tonal lm-card-cta" onclick="${ctaAction}">${btnText}</button>
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
