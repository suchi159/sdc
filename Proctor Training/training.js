/* ==========================================================================
   PROCTOR TRAINING ACADEMY - FULL-STACK SPA ENGINE
   ========================================================================== */

// ============================================================================
// STATE
// ============================================================================
let THEME = 'light';
let currentView = 'dashboard';
let currentModuleId = null;
let quizState = { moduleId: null, questions: [], answers: {}, currentQ: 0, timer: null, timeLeft: 300 };
let appData = { modules: [], stats: null, user: null };

// ============================================================================
// API CLIENT
// ============================================================================
const API = {
  async get(endpoint) {
    const res = await fetch(`/api${endpoint}`);
    return res.json();
  },
  async post(endpoint, body = {}) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  }
};

// ============================================================================
// ROUTER
// ============================================================================
function navigateTo(view, param) {
  // Hide all panels
  document.querySelectorAll('.panel-section').forEach(p => p.classList.remove('active'));

  // Show target panel
  const panelId = view === 'player' ? 'player-panel' : view === 'quiz' ? 'quiz-panel' : `${view}-panel`;
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`[data-view="${view}"]`);
  if (navBtn) navBtn.classList.add('active');

  currentView = view;

  // Load view data
  switch (view) {
    case 'dashboard': loadDashboard(); break;
    case 'modules': loadModulesGrid(); break;
    case 'player': loadModulePlayer(param); break;
    case 'quiz': startQuizView(param); break;
    case 'leaderboard': loadLeaderboard(); break;
    case 'certificate': loadCertificate(); break;
    case 'settings': break;
  }

  // Mobile: close sidebar
  document.getElementById('app-sidebar')?.classList.remove('mobile-open');
}

// ============================================================================
// LOGIN
// ============================================================================
function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-submit-btn');
  btn.innerHTML = '<i class="material-icons" style="animation: spin 1s linear infinite;">sync</i> <span>Signing in...</span>';

  setTimeout(() => {
    document.getElementById('auth-view').classList.remove('active');
    document.getElementById('main-view').classList.add('active');
    initApp();
    pushToast('Welcome Back', 'Signed in to Proctor Training Academy.', 'success');
  }, 800);
}

// ============================================================================
// APP INITIALIZATION
// ============================================================================
async function initApp() {
  initClock();
  initTheme();
  initNavigation();
  loadDashboard();
}

function initNavigation() {
  // Sidebar navigation
  document.querySelectorAll('.sidebar-nav .nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  // Mobile menu
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('app-sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
  }

  // Notifications
  const notifBtn = document.getElementById('notif-dropdown-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      document.getElementById('notif-dropdown-panel')?.classList.toggle('hidden');
    });
  }

  const clearBtn = document.getElementById('clear-notifs-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const list = document.getElementById('notif-dropdown-list');
      if (list) list.innerHTML = '<div class="notif-empty"><i class="material-icons">notifications_off</i><p>No new notifications.</p></div>';
    });
  }
}

// ============================================================================
// DASHBOARD
// ============================================================================
async function loadDashboard() {
  const stats = await API.get('/stats');
  appData.stats = stats;

  // KPI Cards
  const grid = document.getElementById('dashboard-kpi-grid');
  grid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">Progress</span>
        <div class="kpi-icon"><i class="material-icons">trending_up</i></div>
      </div>
      <div class="kpi-value" style="color: var(--pri);">${stats.progressPercent}%</div>
      <div class="kpi-sparkline">
        <div class="progress-bar-thin"><div class="progress-bar-thin-fill" style="width: ${stats.progressPercent}%;"></div></div>
      </div>
      <div class="kpi-footer">
        <span>${stats.completedModules} of ${stats.totalModules} modules</span>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">Quiz Average</span>
        <div class="kpi-icon"><i class="material-icons">quiz</i></div>
      </div>
      <div class="kpi-value" style="color: ${stats.avgScore >= 80 ? 'var(--suc)' : stats.avgScore > 0 ? 'var(--wrn)' : 'var(--on-sur-var)'};">${stats.avgScore > 0 ? stats.avgScore + '%' : '—'}</div>
      <div class="kpi-sparkline">
        <div class="progress-bar-thin"><div class="progress-bar-thin-fill" style="width: ${stats.avgScore}%; background: ${stats.avgScore >= 80 ? 'var(--suc)' : 'var(--wrn)'};"></div></div>
      </div>
      <div class="kpi-footer">
        <span>${stats.avgScore >= 80 ? 'Passing' : stats.avgScore > 0 ? 'Needs improvement' : 'Not started'}</span>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">Total XP</span>
        <div class="kpi-icon"><i class="material-icons">stars</i></div>
      </div>
      <div class="kpi-value" style="font-family: 'JetBrains Mono';">${stats.totalXP}</div>
      <div class="kpi-footer" style="margin-top: 12px;">
        <span style="color: var(--pri); font-weight: 700;">Rank #${stats.rank}</span>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">Status</span>
        <div class="kpi-icon"><i class="material-icons">verified</i></div>
      </div>
      <div class="kpi-value" style="font-size: 20px; color: ${stats.certified ? 'var(--suc)' : 'var(--on-sur-var)'};">${stats.certified ? 'Certified ✓' : 'In Training'}</div>
      <div class="kpi-footer" style="margin-top: 12px;">
        <span>${stats.certified ? 'Certified Proctor' : `${stats.totalModules - stats.completedModules} modules remaining`}</span>
      </div>
    </div>
  `;

  // Next Module Card
  const nextCard = document.getElementById('dash-next-module');
  if (stats.nextModule) {
    nextCard.innerHTML = `
      <div class="dash-card">
        <div class="dash-card-header">
          <h3><i class="material-icons" style="color: var(--pri); font-size: 18px;">play_circle</i> Continue Where You Left Off</h3>
        </div>
        <div class="dash-next-content">
          <div class="dash-next-icon">
            <i class="material-icons">${stats.nextModule.icon}</i>
          </div>
          <div class="dash-next-info">
            <h4>Module ${stats.nextModule.id}: ${stats.nextModule.title}</h4>
            <p>${stats.nextModule.desc}</p>
            <div style="display: flex; gap: 8px; margin-top: 12px; align-items: center;">
              <span class="bdg" style="background: var(--pri-con); color: var(--pri-con-ct); font-size: 10px;">${stats.nextModule.duration}</span>
              <span class="bdg" style="background: var(--sur-var); color: var(--on-sur-var); font-size: 10px;">${stats.nextModule.type}</span>
            </div>
          </div>
        </div>
        <button class="mdbtn btn-filled" style="width: 100%; margin-top: 16px; justify-content: center;" onclick="navigateTo('player', ${stats.nextModule.id})">
          <i class="material-icons">play_arrow</i> Start Module ${stats.nextModule.id}
        </button>
      </div>
    `;
  } else {
    nextCard.innerHTML = `
      <div class="dash-card">
        <div class="dash-card-header"><h3><i class="material-icons" style="color: var(--suc); font-size: 18px;">check_circle</i> All Modules Complete!</h3></div>
        <p style="color: var(--on-sur-var); margin-top: 12px;">You've completed all training modules. ${stats.certified ? 'You are a Certified Proctor!' : 'Claim your certification now!'}</p>
        <button class="mdbtn btn-filled" style="width: 100%; margin-top: 16px; justify-content: center;" onclick="navigateTo('certificate')">
          <i class="material-icons">verified</i> ${stats.certified ? 'View Certificate' : 'Claim Certificate'}
        </button>
      </div>
    `;
  }

  // Activity Feed
  const actCard = document.getElementById('dash-activity');
  const completedIds = (await API.get('/progress')).user?.completedModules || [];
  const modules = await API.get('/modules');
  const completed = modules.filter(m => completedIds.includes(m.id));

  let actHtml = `<div class="dash-card">
    <div class="dash-card-header"><h3><i class="material-icons" style="color: var(--inf); font-size: 18px;">history</i> Recent Activity</h3></div>
    <div class="dash-activity-list">`;

  if (completed.length > 0) {
    completed.slice(-5).reverse().forEach(m => {
      actHtml += `
        <div class="dash-activity-item">
          <div class="dash-activity-icon" style="background: rgba(20,108,46,0.1); color: var(--suc);"><i class="material-icons">check_circle</i></div>
          <div class="dash-activity-info">
            <h4>Completed: ${m.title}</h4>
            <p>Score: ${m.quizScore !== null ? m.quizScore + '%' : 'N/A'}</p>
          </div>
        </div>`;
    });
  } else {
    actHtml += '<p style="color: var(--on-sur-var); padding: 16px 0; text-align: center;">No activity yet. Start your first module!</p>';
  }

  actHtml += '</div></div>';
  actCard.innerHTML = actHtml;
}

// ============================================================================
// MODULES GRID
// ============================================================================
async function loadModulesGrid() {
  const modules = await API.get('/modules');
  appData.modules = modules;

  const grid = document.getElementById('modules-grid');
  grid.innerHTML = '';

  modules.forEach(m => {
    const card = document.createElement('div');
    card.className = `module-card ${m.completed ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="module-card-icon ${m.completed ? 'done' : ''}">
        <i class="material-icons">${m.completed ? 'check_circle' : m.icon}</i>
      </div>
      <div class="module-card-body">
        <div class="module-card-num">Module ${m.id}</div>
        <h3 class="module-card-title">${m.title}</h3>
        <p class="module-card-desc">${m.desc}</p>
        <div class="module-card-meta">
          <span class="bdg" style="background: var(--sur-var); color: var(--on-sur-var); font-size: 10px;"><i class="material-icons" style="font-size: 12px;">schedule</i> ${m.duration}</span>
          ${m.quizScore !== null ? `<span class="bdg" style="background: ${m.quizScore >= 80 ? 'rgba(20,108,46,0.1)' : 'rgba(179,38,30,0.1)'}; color: ${m.quizScore >= 80 ? 'var(--suc)' : 'var(--err)'}; font-size: 10px;">${m.quizScore}%</span>` : ''}
        </div>
      </div>
      <button class="mdbtn ${m.completed ? 'btn-tonal' : 'btn-filled'} module-card-btn" onclick="navigateTo('player', ${m.id})">
        <i class="material-icons">${m.completed ? 'replay' : 'play_arrow'}</i>
        <span>${m.completed ? 'Review' : 'Start'}</span>
      </button>
    `;
    grid.appendChild(card);
  });

  const completedCount = modules.filter(m => m.completed).length;
  document.getElementById('modules-subtitle').textContent = `${completedCount} of ${modules.length} modules completed. Pass all quizzes (≥80%) to earn certification.`;
}

// ============================================================================
// MODULE PLAYER
// ============================================================================
async function loadModulePlayer(moduleId) {
  currentModuleId = moduleId || 1;
  const data = await API.get(`/modules/${currentModuleId}`);
  if (data.error) return navigateTo('modules');

  // Update header
  document.getElementById('player-title').textContent = data.title;
  document.getElementById('player-subtitle').textContent = `Module ${data.id} of ${data.totalModules} · ${data.duration}`;

  // Update content
  document.getElementById('player-content-title').textContent = data.contentTitle;
  document.getElementById('player-content-body').innerHTML = data.contentHtml;

  // Video/Interactive area
  renderPlayerVideo(data);

  // Quiz CTA
  const cta = document.getElementById('player-quiz-cta');
  if (data.completed) {
    cta.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(20,108,46,0.08); border-radius: 8px; border: 1px solid var(--suc);">
        <i class="material-icons" style="color: var(--suc); font-size: 28px;">check_circle</i>
        <div>
          <div style="font-weight: 700; color: var(--suc);">Module Completed — Score: ${data.quizScore}%</div>
          <div style="font-size: 12px; color: var(--on-sur-var); margin-top: 4px;">You can retake the quiz to improve your score.</div>
        </div>
      </div>
      <button class="mdbtn btn-tonal" onclick="startQuiz()" style="margin-top: 12px;">
        <i class="material-icons">replay</i> Retake Quiz
      </button>
    `;
  } else {
    cta.innerHTML = `
      <button class="mdbtn btn-filled" onclick="startQuiz()" id="take-quiz-btn">
        <i class="material-icons">quiz</i>
        <span>Take Module Quiz</span>
      </button>
      <p class="quiz-cta-hint">Score ≥80% to complete this module</p>
    `;
  }

  // Sidebar module list
  await renderPlayerSidebar();

  // Next button
  const nextBtn = document.getElementById('player-next-btn');
  if (data.id >= data.totalModules) {
    nextBtn.textContent = 'Finish';
    nextBtn.onclick = () => navigateTo('certificate');
  } else {
    nextBtn.innerHTML = '<span>Next Module</span>';
    nextBtn.onclick = () => playerNext();
  }
}

function renderPlayerVideo(data) {
  const wrapper = document.getElementById('player-video-wrapper');

  if (data.type === 'interactive') {
    wrapper.className = 'player-video-container interactive';
    wrapper.innerHTML = `
      <div class="sim-wrapper">
        <div class="sim-inner" id="sim-svg-container"></div>
        <div class="sim-controls">
          <button class="mdbtn btn-filled" style="background: var(--err); border-color: var(--err); color: #fff;" onclick="simWarn()">
            <i class="material-icons">warning</i> Send Warning
          </button>
          <button class="mdbtn btn-tonal" onclick="simSnooze()">
            <i class="material-icons">schedule</i> Snooze
          </button>
        </div>
      </div>`;
    startSimulator();
  } else {
    wrapper.className = 'player-video-container';
    wrapper.innerHTML = `
      <div class="play-btn" onclick="simulateVideoPlay(this)">
        <i class="material-icons">play_arrow</i>
      </div>
      <p style="font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Simulated Video Content</p>
      <p style="font-size: 11px; margin-top: 8px; color: rgba(255,255,255,0.5);">Click play to watch — then take the quiz below</p>`;
  }
}

function simulateVideoPlay(btn) {
  btn.innerHTML = '<i class="material-icons" style="animation: spin 1s linear infinite;">sync</i>';
  setTimeout(() => {
    btn.parentElement.innerHTML = `
      <div style="text-align: center;">
        <i class="material-icons" style="font-size: 48px; color: var(--suc); margin-bottom: 12px;">check_circle</i>
        <p style="font-size: 14px; font-weight: 600;">Video Complete</p>
        <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px;">Scroll down to take the quiz</p>
      </div>`;
  }, 1500);
}

async function renderPlayerSidebar() {
  const modules = await API.get('/modules');
  const list = document.getElementById('player-module-list');
  list.innerHTML = '';

  const completedCount = modules.filter(m => m.completed).length;
  const percent = Math.round((completedCount / modules.length) * 100);
  document.getElementById('player-progress-fill').style.width = `${percent}%`;
  document.getElementById('player-progress-text').textContent = `${percent}%`;

  modules.forEach(m => {
    const item = document.createElement('div');
    item.className = `player-module-item ${m.id === currentModuleId ? 'active' : ''} ${m.completed ? 'completed' : ''}`;
    item.onclick = () => { navigateTo('player', m.id); };
    item.innerHTML = `
      <div class="player-module-icon ${m.completed ? 'done' : ''}">
        <i class="material-icons">${m.completed ? 'check' : m.icon}</i>
      </div>
      <div class="player-module-info">
        <h4>${m.id}. ${m.title}</h4>
        <p>${m.duration}</p>
      </div>
    `;
    list.appendChild(item);
  });
}

function playerNext() {
  if (currentModuleId < 8) navigateTo('player', currentModuleId + 1);
}

function playerPrev() {
  if (currentModuleId > 1) navigateTo('player', currentModuleId - 1);
}

// ============================================================================
// SIMULATOR (Interactive Module)
// ============================================================================
let simInterval = null;

function startSimulator() {
  const container = document.getElementById('sim-svg-container');
  if (!container) return;
  if (simInterval) clearInterval(simInterval);

  let loopTimer = 0;
  const w = 480, h = 300;
  const headX = w / 2, headY = h / 2 - 10;

  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="${w-20}" height="${h-20}" stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none" />
      <path d="M${headX-60},${h} Q${headX-45},${headY+60} ${headX-25},${headY+35} L${headX+25},${headY+35} Q${headX+45},${headY+60} ${headX+60},${h}" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none" />
      <g id="sim-head-group">
        <circle cx="${headX}" cy="${headY}" r="32" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none" />
        <circle cx="${headX-12}" cy="${headY-2}" r="4" fill="rgba(255,255,255,0.8)" />
        <circle cx="${headX+12}" cy="${headY-2}" r="4" fill="rgba(255,255,255,0.8)" />
        <circle id="sim-pupil-l" cx="${headX-12}" cy="${headY-2}" r="2" fill="#000" />
        <circle id="sim-pupil-r" cx="${headX+12}" cy="${headY-2}" r="2" fill="#000" />
      </g>
      <rect id="sim-bbox" x="${headX-50}" y="${headY-50}" width="100" height="100" stroke="var(--wrn)" stroke-width="1.5" fill="none" />
      <text x="${headX-48}" y="${headY-54}" fill="var(--wrn)" style="font-family:'JetBrains Mono';font-size:11px;font-weight:bold;">DEMO STUDENT</text>
    </svg>`;

  simInterval = setInterval(() => {
    loopTimer += 0.05;
    const headGroup = document.getElementById('sim-head-group');
    const bbox = document.getElementById('sim-bbox');
    if (headGroup && bbox) {
      const offsetX = Math.sin(loopTimer * 1.5) * 20;
      headGroup.setAttribute('transform', `translate(${offsetX}, 0)`);
      bbox.setAttribute('x', headX - 50 + offsetX);
    }
  }, 50);
}

function simWarn() {
  pushToast('Warning Sent', 'You successfully issued a warning to the demo candidate.', 'warning');
}

function simSnooze() {
  pushToast('Alert Snoozed', 'The simulated alert was temporarily snoozed.', 'info');
}

// ============================================================================
// QUIZ ENGINE
// ============================================================================
async function startQuiz() {
  const data = await API.get(`/modules/${currentModuleId}`);
  if (!data.quiz || data.quiz.length === 0) {
    pushToast('No Quiz', 'This module does not have a quiz.', 'warning');
    return;
  }

  quizState = {
    moduleId: currentModuleId,
    questions: data.quiz,
    answers: {},
    currentQ: 0,
    timer: null,
    timeLeft: data.quiz.length * 60 // 1 min per question
  };

  navigateTo('quiz', currentModuleId);
}

function startQuizView(moduleId) {
  const qs = quizState.questions;
  if (qs.length === 0) return navigateTo('player', moduleId);

  document.getElementById('quiz-container').classList.remove('hidden');
  document.getElementById('quiz-results').classList.add('hidden');

  document.getElementById('quiz-title').textContent = `Module ${quizState.moduleId} Quiz`;
  renderQuizQuestion();
  startQuizTimer();
}

function renderQuizQuestion() {
  const q = quizState.questions[quizState.currentQ];
  const total = quizState.questions.length;
  const current = quizState.currentQ + 1;

  // Progress
  document.getElementById('quiz-progress-fill').style.width = `${(current / total) * 100}%`;
  document.getElementById('quiz-progress-label').textContent = `Question ${current} of ${total}`;

  // Question card
  const card = document.getElementById('quiz-question-card');
  let html = `<h3 class="quiz-q-text">${q.q}</h3><div class="quiz-options">`;

  q.options.forEach((opt, i) => {
    const selected = quizState.answers[quizState.currentQ] === i;
    html += `
      <button class="quiz-option ${selected ? 'selected' : ''}" onclick="selectAnswer(${i})">
        <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
        <span class="quiz-option-text">${opt}</span>
        ${selected ? '<i class="material-icons" style="margin-left: auto; color: var(--pri);">check_circle</i>' : ''}
      </button>`;
  });

  html += '</div>';
  card.innerHTML = html;

  // Navigation buttons
  document.getElementById('quiz-prev-btn').disabled = quizState.currentQ === 0;
  const nextBtn = document.getElementById('quiz-next-btn');
  if (quizState.currentQ === total - 1) {
    nextBtn.innerHTML = '<i class="material-icons">send</i> Submit Quiz';
    nextBtn.onclick = submitQuiz;
  } else {
    nextBtn.innerHTML = '<span>Next Question</span>';
    nextBtn.onclick = quizNext;
  }
}

function selectAnswer(idx) {
  quizState.answers[quizState.currentQ] = idx;
  renderQuizQuestion();
}

function quizNext() {
  if (quizState.currentQ < quizState.questions.length - 1) {
    quizState.currentQ++;
    renderQuizQuestion();
  }
}

function quizPrev() {
  if (quizState.currentQ > 0) {
    quizState.currentQ--;
    renderQuizQuestion();
  }
}

function startQuizTimer() {
  if (quizState.timer) clearInterval(quizState.timer);
  quizState.timer = setInterval(() => {
    quizState.timeLeft--;
    const mins = Math.floor(quizState.timeLeft / 60);
    const secs = quizState.timeLeft % 60;
    document.getElementById('quiz-timer-text').textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

    if (quizState.timeLeft <= 30) {
      document.getElementById('quiz-timer').style.color = 'var(--err)';
    }

    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timer);
      submitQuiz();
    }
  }, 1000);
}

async function submitQuiz() {
  if (quizState.timer) clearInterval(quizState.timer);

  // Build answers array
  const answers = [];
  for (let i = 0; i < quizState.questions.length; i++) {
    answers.push(quizState.answers[i] !== undefined ? quizState.answers[i] : -1);
  }

  const result = await API.post(`/quiz/${quizState.moduleId}/submit`, { answers });

  // Show results
  document.getElementById('quiz-container').classList.add('hidden');
  const resultsDiv = document.getElementById('quiz-results');
  resultsDiv.classList.remove('hidden');

  const passed = result.passed;

  let html = `
    <div class="quiz-results-card">
      <div class="quiz-results-icon ${passed ? 'pass' : 'fail'}">
        <i class="material-icons">${passed ? 'emoji_events' : 'sentiment_dissatisfied'}</i>
      </div>
      <h2 class="quiz-results-title">${passed ? 'Excellent! You Passed!' : 'Not Quite — Try Again'}</h2>
      <p class="quiz-results-subtitle">${passed ? `You scored ${result.score}% and earned ${result.xpEarned} XP!` : `You scored ${result.score}%. You need ≥80% to pass.`}</p>

      <div class="quiz-results-stats">
        <div class="quiz-stat">
          <span class="quiz-stat-value" style="color: var(--suc);">${result.correct}</span>
          <span class="quiz-stat-label">Correct</span>
        </div>
        <div class="quiz-stat">
          <span class="quiz-stat-value" style="color: var(--err);">${result.total - result.correct}</span>
          <span class="quiz-stat-label">Wrong</span>
        </div>
        <div class="quiz-stat">
          <span class="quiz-stat-value" style="color: var(--pri);">${result.score}%</span>
          <span class="quiz-stat-label">Score</span>
        </div>
      </div>

      <div class="quiz-results-detail">
        <h3>Question Review</h3>`;

  result.results.forEach((r, i) => {
    const q = quizState.questions[i];
    html += `
      <div class="quiz-review-item ${r.correct ? 'correct' : 'wrong'}">
        <div class="quiz-review-marker">
          <i class="material-icons">${r.correct ? 'check_circle' : 'cancel'}</i>
        </div>
        <div class="quiz-review-body">
          <p class="quiz-review-q">${q.q}</p>
          <p class="quiz-review-answer">Your answer: <b>${q.options[r.yourAnswer] || 'No answer'}</b></p>
          ${!r.correct ? `<p class="quiz-review-correct">Correct: <b>${q.options[r.correctAnswer]}</b></p>` : ''}
        </div>
      </div>`;
  });

  html += `
      </div>
      <div class="quiz-results-actions">
        <button class="mdbtn btn-tonal" onclick="navigateTo('player', ${quizState.moduleId})">
          <i class="material-icons">arrow_back</i> Back to Module
        </button>
        ${!passed ? `<button class="mdbtn btn-filled" onclick="startQuiz()"><i class="material-icons">replay</i> Retry Quiz</button>` : ''}
        ${passed && quizState.moduleId < 8 ? `<button class="mdbtn btn-filled" onclick="navigateTo('player', ${quizState.moduleId + 1})"><i class="material-icons">arrow_forward</i> Next Module</button>` : ''}
        ${passed && quizState.moduleId >= 8 ? `<button class="mdbtn btn-filled" onclick="navigateTo('certificate')"><i class="material-icons">verified</i> View Certificate</button>` : ''}
      </div>
    </div>`;

  resultsDiv.innerHTML = html;
}

// ============================================================================
// LEADERBOARD
// ============================================================================
async function loadLeaderboard() {
  const data = await API.get('/leaderboard');

  const container = document.getElementById('leaderboard-container');

  // Top 3 podium
  const top3 = data.leaderboard.slice(0, 3);
  let podiumHtml = '<div class="lb-podium">';
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
  podiumOrder.forEach(idx => {
    const entry = top3[idx];
    if (!entry) return;
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
    const height = idx === 0 ? '160px' : idx === 1 ? '120px' : '100px';
    podiumHtml += `
      <div class="lb-podium-item" style="--podium-height: ${height};">
        <img class="lb-podium-avatar" src="${entry.avatar}" alt="${entry.name}">
        <span class="lb-podium-medal">${medal}</span>
        <h4 class="lb-podium-name">${entry.name.split(' ')[0]}</h4>
        <span class="lb-podium-xp">${entry.xp} XP</span>
        <div class="lb-podium-bar"></div>
      </div>`;
  });
  podiumHtml += '</div>';

  // Full table
  let tableHtml = `<div class="lb-table">
    <div class="lb-table-header">
      <span>Rank</span><span>Trainee</span><span>Modules</span><span>Avg Score</span><span>XP</span><span>Status</span>
    </div>`;

  data.leaderboard.forEach(entry => {
    const isMe = entry.id === data.currentUser.id;
    tableHtml += `
      <div class="lb-table-row ${isMe ? 'is-me' : ''}">
        <span class="lb-rank">#${entry.rank}</span>
        <span class="lb-user">
          <img src="${entry.avatar}" alt="${entry.name}" class="lb-avatar">
          <span>${entry.name}${isMe ? ' <span class="bdg" style="background: var(--pri-con); color: var(--pri-con-ct); font-size: 9px;">YOU</span>' : ''}</span>
        </span>
        <span>${entry.modulesCompleted}/8</span>
        <span>${entry.avgScore}%</span>
        <span style="font-weight: 700; font-family: 'JetBrains Mono';">${entry.xp}</span>
        <span>${entry.certified ? '<span class="bdg" style="background: rgba(20,108,46,0.1); color: var(--suc);">Certified</span>' : '<span class="bdg" style="background: var(--sur-var); color: var(--on-sur-var);">Training</span>'}</span>
      </div>`;
  });

  // Current user if not in leaderboard
  if (data.currentUser.rank > data.leaderboard.length) {
    tableHtml += `
      <div class="lb-table-row is-me">
        <span class="lb-rank">#${data.currentUser.rank}</span>
        <span class="lb-user">
          <img src="${data.currentUser.avatar}" alt="${data.currentUser.name}" class="lb-avatar">
          <span>${data.currentUser.name} <span class="bdg" style="background: var(--pri-con); color: var(--pri-con-ct); font-size: 9px;">YOU</span></span>
        </span>
        <span>${data.currentUser.modulesCompleted}/8</span>
        <span>${data.currentUser.avgScore}%</span>
        <span style="font-weight: 700; font-family: 'JetBrains Mono';">${data.currentUser.xp}</span>
        <span>${data.currentUser.certified ? '<span class="bdg" style="background: rgba(20,108,46,0.1); color: var(--suc);">Certified</span>' : '<span class="bdg" style="background: var(--sur-var); color: var(--on-sur-var);">Training</span>'}</span>
      </div>`;
  }

  tableHtml += '</div>';

  container.innerHTML = podiumHtml + tableHtml;
}

// ============================================================================
// CERTIFICATE
// ============================================================================
async function loadCertificate() {
  const data = await API.get('/certificate');
  const container = document.getElementById('cert-container');

  if (data.certified) {
    container.innerHTML = `
      <div class="cert-display">
        <div class="cert-badge-glow">
          <i class="material-icons cert-badge-icon">verified</i>
        </div>
        <div class="cert-document">
          <div class="cert-doc-header">
            <div class="cert-doc-logo">SP</div>
            <h2>SecureProctor AI</h2>
            <p>Certified Proctor Credential</p>
          </div>
          <div class="cert-doc-body">
            <p class="cert-doc-label">This certifies that</p>
            <h1 class="cert-doc-name">${data.name}</h1>
            <p class="cert-doc-label">has successfully completed the SecureProctor AI Proctor Training Academy and is authorized to monitor live examination sessions.</p>
            <div class="cert-doc-stats">
              <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.completedModules}/${data.totalModules}</span><span>Modules</span></div>
              <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.avgScore}%</span><span>Avg Score</span></div>
              <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.totalXP}</span><span>Total XP</span></div>
            </div>
            <div class="cert-doc-footer">
              <div><span class="cert-doc-label">Certificate ID</span><span class="cert-doc-id">${data.certId}</span></div>
              <div><span class="cert-doc-label">Issued</span><span>${new Date(data.certifiedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            </div>
          </div>
        </div>
      </div>`;
  } else if (data.canClaim) {
    container.innerHTML = `
      <div class="cert-claim">
        <div class="cert-badge-glow">
          <i class="material-icons cert-badge-icon" style="color: var(--pri);">workspace_premium</i>
        </div>
        <h2>Ready for Certification!</h2>
        <p>You've completed all ${data.totalModules} modules with an average score of ${data.avgScore}%.</p>
        <div class="cert-doc-stats" style="margin: 24px 0;">
          <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.completedModules}/${data.totalModules}</span><span>Modules</span></div>
          <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.avgScore}%</span><span>Avg Score</span></div>
          <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.totalXP}</span><span>Total XP</span></div>
        </div>
        <button class="mdbtn btn-filled" style="padding: 14px 32px; font-size: 16px;" onclick="claimCertificate()">
          <i class="material-icons">verified</i> Claim Your Certificate
        </button>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="cert-locked">
        <div class="cert-badge-glow locked">
          <i class="material-icons cert-badge-icon" style="color: var(--on-sur-var);">lock</i>
        </div>
        <h2>Certification Locked</h2>
        <p>Complete all ${data.totalModules} training modules and score ≥80% average to unlock.</p>
        <div class="cert-doc-stats" style="margin: 24px 0;">
          <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.completedModules}/${data.totalModules}</span><span>Modules</span></div>
          <div class="cert-doc-stat"><span class="cert-doc-stat-val">${data.avgScore > 0 ? data.avgScore + '%' : '—'}</span><span>Avg Score</span></div>
        </div>
        <button class="mdbtn btn-filled" onclick="navigateTo('modules')">
          <i class="material-icons">school</i> Continue Training
        </button>
      </div>`;
  }
}

async function claimCertificate() {
  const result = await API.post('/certificate/claim');
  if (result.success) {
    pushToast('🎉 Certified!', `Certificate ${result.certId} issued. Congratulations!`, 'success');
    document.getElementById('sidebar-role').textContent = 'Certified Proctor';
    loadCertificate();
  } else {
    pushToast('Error', result.error || 'Failed to claim certificate.', 'error');
  }
}

// ============================================================================
// SETTINGS
// ============================================================================
async function resetProgress() {
  if (!confirm('This will reset ALL your progress, quiz scores, and certification. Are you sure?')) return;
  await API.post('/reset');
  pushToast('Progress Reset', 'All training data has been cleared.', 'warning');
  document.getElementById('sidebar-role').textContent = 'Proctor Trainee';
  navigateTo('dashboard');
}

// ============================================================================
// TOAST SYSTEM
// ============================================================================
function pushToast(title, desc, severity) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style = 'position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 9999;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const color = severity === 'warning' ? 'var(--wrn)' : severity === 'error' ? 'var(--err)' : 'var(--suc)';
  const bg = severity === 'warning' ? '#fff8db' : severity === 'error' ? '#fcedeb' : '#d2f4de';
  const textCol = severity === 'warning' ? '#3c2800' : severity === 'error' ? '#601410' : '#003917';
  const icon = severity === 'error' ? 'cancel' : severity === 'warning' ? 'warning' : 'check_circle';

  toast.style.cssText = `background: ${bg}; color: ${textCol}; border-left: 4px solid ${color}; padding: 16px; border-radius: 8px; box-shadow: 0 12px 36px rgba(0,0,0,0.08); min-width: 280px; max-width: 400px; animation: slideDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; display: flex; gap: 12px; align-items: start;`;
  toast.innerHTML = `
    <i class="material-icons" style="color:${color};">${icon}</i>
    <div>
      <h4 style="margin: 0; font-size:13px; font-weight:700;">${title}</h4>
      <p style="margin: 4px 0 0; font-size:11px; opacity: 0.9;">${desc}</p>
    </div>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ============================================================================
// THEME
// ============================================================================
function initTheme() {
  const saved = localStorage.getItem('proctor_theme');
  if (saved) {
    THEME = saved;
    document.documentElement.setAttribute('data-t', THEME);
    const btnIcon = document.getElementById('theme-btn-icon');
    if (btnIcon) btnIcon.textContent = THEME === 'light' ? 'dark_mode' : 'light_mode';
    const toggle = document.getElementById('settings-theme-toggle');
    if (toggle) toggle.checked = THEME === 'dark';
  }

  document.getElementById('theme-switcher-btn')?.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const btnIcon = document.getElementById('theme-btn-icon');
  const toggle = document.getElementById('settings-theme-toggle');

  if (THEME === 'light') {
    html.setAttribute('data-t', 'dark');
    THEME = 'dark';
    if (btnIcon) btnIcon.textContent = 'light_mode';
    if (toggle) toggle.checked = true;
  } else {
    html.setAttribute('data-t', 'light');
    THEME = 'light';
    if (btnIcon) btnIcon.textContent = 'dark_mode';
    if (toggle) toggle.checked = false;
  }
  localStorage.setItem('proctor_theme', THEME);
}

// ============================================================================
// CLOCK
// ============================================================================
function initClock() {
  const clockEl = document.getElementById('server-time-string');
  if (!clockEl) return;
  setInterval(() => {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    clockEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')} PST`;
  }, 1000);
}

// ============================================================================
// BOOTSTRAP
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in (for simplicity, auto-show login)
  // Theme init even on login screen
  const saved = localStorage.getItem('proctor_theme');
  if (saved) {
    THEME = saved;
    document.documentElement.setAttribute('data-t', THEME);
    const btnIcon = document.getElementById('theme-btn-icon');
    if (btnIcon) btnIcon.textContent = THEME === 'light' ? 'dark_mode' : 'light_mode';
  }
});

// CSS spin animation
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(style);
