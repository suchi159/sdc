// ============================================================================
// SECUREPROCTOR AI - PROCTOR PLATFORM MAIN APPLICATION LOGIC
// ============================================================================

const API_BASE = '/api';
let STATE = {
  token: localStorage.getItem('sp_token') || null,
  user: JSON.parse(localStorage.getItem('sp_user')) || null,
  theme: localStorage.getItem('sp_theme') || 'light',
  currentView: 'dashboard',
  monitorSse: null,
  data: {
    sessions: [],
    candidates: [],
    incidents: null,
    dashboard: null
  }
};

// ============================================================================
// INITIALIZATION & ROUTING
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(STATE.theme);
  
  if (STATE.token && STATE.user) {
    checkGateAndLoad();
  } else {
    showView('auth-view');
  }

  // Sidebar navigation setup
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      navigateTo(view);
    });
  });

  // Mobile menu toggle
  document.getElementById('menu-btn')?.addEventListener('click', () => {
    document.getElementById('app-sidebar').classList.toggle('mobile-open');
  });

  // Theme toggle
  document.getElementById('theme-switcher-btn')?.addEventListener('click', toggleTheme);

  // Search
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      const query = e.target.value.toLowerCase();
      if (STATE.currentView === 'candidates') {
        renderCandidatesList(query);
      } else if (STATE.currentView === 'sessions') {
        renderSessionsList(query);
      }
    });
  }

  // Time display
  setInterval(updateServerTime, 1000);
  updateServerTime();
});

async function checkGateAndLoad() {
  try {
    const res = await apiFetch('/user/flags');
    if (res.error) throw new Error(res.error);

    if (res.accountStatus === 'suspended') {
      document.getElementById('blocked-status-text').textContent = 'suspended';
      showView('blocked-view');
      return;
    }
    if (res.accountStatus === 'pending') {
      document.getElementById('blocked-status-text').textContent = 'pending approval';
      showView('blocked-view');
      return;
    }

    if (!res.hasCompletedTraining) {
      window.location.href = '/online_training.html';
      return;
    }

    // Passed gates, load app
    showView('main-view');
    populateSidebar();
    navigateTo(STATE.currentView);

  } catch (err) {
    pushToast('Failed to verify account status', 'error');
    handleLogout();
  }
}

function showView(viewId) {
  document.querySelectorAll('.view-panel').forEach(el => el.classList.remove('active'));
  document.getElementById(viewId)?.classList.add('active');
}

function navigateTo(view) {
  STATE.currentView = view;
  
  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`nav-${view}`)?.classList.add('active');

  // Update breadcrumb
  const titles = {
    'dashboard': 'Dashboard',
    'monitoring': 'Exam Monitoring',
    'sessions': 'Sessions',
    'candidates': 'Candidates',
    'incidents': 'Incident Hub',
    'reports': 'Reports & Analytics',
    'earnings': 'Earnings & Payments',
    'settings': 'Settings'
  };
  document.getElementById('breadcrumb').innerHTML = `<span class="breadcrumb-item">${titles[view] || view}</span>`;

  // Show panel
  document.querySelectorAll('.panel-section').forEach(el => el.classList.remove('active'));
  document.getElementById(`${view}-panel`)?.classList.add('active');

  // Close mobile sidebar if open
  document.getElementById('app-sidebar')?.classList.remove('mobile-open');

  // Load data for view
  loadViewData(view);
}

function loadViewData(view) {
  // Disconnect SSE if leaving monitoring view
  if (view !== 'monitoring' && STATE.monitorSse) {
    STATE.monitorSse.close();
    STATE.monitorSse = null;
  }

  switch(view) {
    case 'dashboard': fetchDashboard(); break;
    case 'monitoring': initMonitoring(); break;
    case 'sessions': fetchSessions(); break;
    case 'candidates': fetchCandidates(); break;
    case 'incidents': fetchIncidents(); break;
    case 'reports': fetchReports(); break;
    case 'earnings': fetchEarnings(); break;
    case 'settings': fetchSettings(); break;
  }
}

// ============================================================================
// API HELPERS
// ============================================================================
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

function generateTableSkeleton(rows, cols) {
  let html = '';
  for(let i=0; i<rows; i++) {
    html += `<tr style="animation: fadeSlideUp 0.4s ease forwards; opacity: 0; animation-delay: ${i*0.05}s;">`;
    for(let j=0; j<cols; j++) {
      if (j===0) html += `<td><div class="skeleton-row" style="border:none; padding:0;"><div class="skeleton skeleton-avatar"></div><div style="flex:1"><div class="skeleton skeleton-text short" style="margin:0;"></div></div></div></td>`;
      else html += `<td><div class="skeleton skeleton-text"></div></td>`;
    }
    html += `</tr>`;
  }
  return html;
}


// ============================================================================
// AUTHENTICATION
// ============================================================================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-submit-btn');
  const errDiv = document.getElementById('login-error');

  btn.classList.add('disabled');
  errDiv.style.display = 'none';

  try {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    if (res.error) throw new Error(res.error);

    STATE.token = res.token;
    STATE.user = res.user;
    localStorage.setItem('sp_token', res.token);
    localStorage.setItem('sp_user', JSON.stringify(res.user));

    checkGateAndLoad();

  } catch (err) {
    document.getElementById('login-error-text').textContent = err.message;
    errDiv.style.display = 'flex';
  } finally {
    btn.classList.remove('disabled');
  }
}

async function handleLogout() {
  if (STATE.token) {
    await apiFetch('/auth/logout', { method: 'POST', body: { token: STATE.token } });
  }
  
  STATE.token = null;
  STATE.user = null;
  localStorage.removeItem('sp_token');
  localStorage.removeItem('sp_user');
  
  if (STATE.monitorSse) {
    STATE.monitorSse.close();
    STATE.monitorSse = null;
  }
  
  showView('auth-view');
  showLoginCard();
}

function showForgotPassword(e) {
  e.preventDefault();
  document.getElementById('login-card').classList.add('hidden');
  document.getElementById('forgot-card').classList.remove('hidden');
}

function showLoginCard() {
  document.getElementById('forgot-card').classList.add('hidden');
  document.getElementById('login-card').classList.remove('hidden');
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  try {
    const res = await apiFetch('/auth/forgot', { method: 'POST', body: { email } });
    if (res.error) throw new Error(res.error);
    pushToast(res.message, 'success');
    showLoginCard();
  } catch (err) {
    pushToast(err.message, 'error');
  }
}

// ============================================================================
// TRAINING GATE
// ============================================================================
function initTrainingGate() {
  const fill = document.getElementById('training-progress-fill');
  const pctText = document.getElementById('training-watch-percent');
  const btn = document.getElementById('training-continue-btn');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    fill.style.width = `${progress}%`;
    pctText.textContent = `${progress}% watched`;
    
    if (progress >= 100) {
      clearInterval(interval);
      btn.classList.remove('disabled');
      btn.innerHTML = `<i class="material-icons">check_circle</i><span>Continue to Dashboard</span>`;
      pushToast('Training complete!', 'success');
    }
  }, 100); // Fast mock for demo
}

async function completeTraining() {
  const btn = document.getElementById('training-continue-btn');
  if (btn.classList.contains('disabled')) return;

  try {
    const res = await apiFetch('/user/training', {
      method: 'POST',
      body: { watchPercent: 100 }
    });
    
    if (res.success) {
      checkGateAndLoad();
    }
  } catch (err) {
    pushToast('Error saving progress', 'error');
  }
}

function populateSidebar() {
  if (!STATE.user) return;
  document.getElementById('sidebar-name').textContent = STATE.user.name;
  document.getElementById('sidebar-role').textContent = STATE.user.role;
  const avatar = document.getElementById('sidebar-avatar');
  if (avatar) avatar.src = STATE.user.avatar;
}

// ============================================================================
// DASHBOARD
// ============================================================================
async function fetchDashboard() {
  try {
    const data = await apiFetch('/dashboard');
    STATE.data.dashboard = data;
    renderDashboard(data);
  } catch (err) {
    pushToast('Failed to load dashboard data', 'error');
  }
}

function renderDashboard(data) {
  // KPIs
  const kpiGrid = document.getElementById('dashboard-kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon" style="color:var(--inf); background:rgba(0,99,155,0.1);"><i class="material-icons">sensors</i></div>
        <div class="kpi-val">${data.activeLiveSessions}</div>
        <div class="kpi-lbl">Active Live Classes</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="color:var(--sec); background:rgba(103,80,164,0.1);"><i class="material-icons">event</i></div>
        <div class="kpi-val">${data.upcomingExams7Days}</div>
        <div class="kpi-lbl">Upcoming (7 days)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="color:var(--err); background:rgba(179,38,30,0.1);"><i class="material-icons">warning</i></div>
        <div class="kpi-val">${data.pendingIncidentCount}</div>
        <div class="kpi-lbl">Pending Incidents</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="color:var(--suc); background:rgba(20,108,46,0.1);"><i class="material-icons">confirmation_number</i></div>
        <div class="kpi-val">${data.voucherBalance.available}</div>
        <div class="kpi-lbl">Available Vouchers</div>
      </div>
    `;
  }

  // Active Sessions
  const activeDiv = document.getElementById('dash-active-sessions-body');
  if (activeDiv) {
    if (data.liveSessions.length === 0) {
      activeDiv.innerHTML = `<div class="empty-state">No live sessions currently running.</div>`;
    } else {
      activeDiv.innerHTML = data.liveSessions.map(s => `
        <div class="dash-list-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--out-var);">
          <div>
            <div style="font-weight:600; margin-bottom:4px;">${s.name}</div>
            <div style="font-size:12px; color:var(--on-sur-var);">
              <span style="color:var(--suc); font-weight:600;">${s.liveCount}</span> / ${s.candidateCount} Live 
              • <span style="color:var(--err);">${s.warningCount} Warnings</span>
            </div>
          </div>
          <button class="mdbtn btn-tonal" style="padding:6px 12px; min-height:0; font-size:12px;" onclick="navigateTo('monitoring')">Join</button>
        </div>
      `).join('');
    }
  }

  // Upcoming Classes
  const upcomingDiv = document.getElementById('dash-upcoming-sessions-body');
  if (upcomingDiv) {
    if (data.upcomingSessions.length === 0) {
      upcomingDiv.innerHTML = `<div class="empty-state">No upcoming sessions.</div>`;
    } else {
      upcomingDiv.innerHTML = data.upcomingSessions.map(s => `
        <div class="dash-list-item" style="padding:12px 0; border-bottom:1px solid var(--out-var);">
          <div style="font-weight:600; margin-bottom:4px;">${s.name}</div>
          <div style="font-size:12px; color:var(--on-sur-var); display:flex; justify-content:space-between;">
            <span>${new Date(s.examDate).toLocaleString()}</span>
            <span>${s.candidateCount} Candidates</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Pending Incidents
  const incidentsDiv = document.getElementById('dash-pending-incidents-body');
  if (incidentsDiv) {
    if (data.pendingIncidents.length === 0) {
      incidentsDiv.innerHTML = `<div class="empty-state">All caught up! No pending incidents.</div>`;
    } else {
      incidentsDiv.innerHTML = data.pendingIncidents.map(i => `
        <div class="dash-list-item" style="padding:12px 0; border-bottom:1px solid var(--out-var);">
          <div style="font-weight:600; margin-bottom:4px;">${i.candidateName}</div>
          <div style="font-size:12px; color:var(--on-sur-var); display:flex; justify-content:space-between;">
            <span style="color:var(--err);">${i.type}</span>
            <span>${new Date(i.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Vouchers
  const voucherDiv = document.getElementById('dash-voucher-summary-body');
  if (voucherDiv) {
    const total = data.voucherBalance.available + data.voucherBalance.used;
    const availPct = total > 0 ? (data.voucherBalance.available / total) * 100 : 0;
    const usedPct = total > 0 ? (data.voucherBalance.used / total) * 100 : 0;
    
    voucherDiv.innerHTML = `
      <div style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:12px; color:var(--on-sur-var);">Available</span>
          <span style="font-weight:600; color:var(--suc);">${data.voucherBalance.available}</span>
        </div>
        <div style="width:100%; height:8px; background:var(--out-var); border-radius:4px; overflow:hidden;">
          <div style="width:${availPct}%; height:100%; background:var(--suc);"></div>
        </div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:12px; color:var(--on-sur-var);">Used</span>
          <span style="font-weight:600;">${data.voucherBalance.used}</span>
        </div>
        <div style="width:100%; height:8px; background:var(--out-var); border-radius:4px; overflow:hidden;">
          <div style="width:${usedPct}%; height:100%; background:var(--out);"></div>
        </div>
      </div>
      <div style="margin-top:20px; text-align:center;">
        <button class="mdbtn btn-outlined">Request More Vouchers</button>
      </div>
    `;
  }
}

// ============================================================================
// EXAM MONITORING (SSE)
// ============================================================================
function initMonitoring() {
  const feed = document.getElementById('ai-alert-feed');
  const tbody = document.getElementById('monitor-table-body');
  if(feed) feed.innerHTML = '<div style="padding:20px;text-align:center;color:var(--on-sur-var);"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>';
  if(tbody) tbody.innerHTML = generateTableSkeleton(6, 7);

  if (STATE.monitorSse) {
    STATE.monitorSse.close();
  }

  STATE.monitorSse = new EventSource(`${API_BASE}/monitor/stream`);
  
  STATE.monitorSse.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'init') {
      STATE.data.candidates = data.candidates;
      renderMonitorBar(data.session);
      renderMonitorCandidates();
      renderAiAlerts(data.alerts);
    } else if (data.type === 'update') {
      // Merge candidate updates
      data.candidates.forEach(c => {
        const idx = STATE.data.candidates.findIndex(existing => existing.id === c.id);
        if (idx !== -1) {
          STATE.data.candidates[idx] = c;
        } else {
          STATE.data.candidates.push(c);
        }
      });
      renderMonitorCandidates();
    }
  };

  STATE.monitorSse.onerror = () => {
    if(feed) feed.innerHTML = '<div style="padding:20px;text-align:center;color:var(--err);">Connection lost. Reconnecting...</div>';
  };
}

function renderMonitorBar(session) {
  const bar = document.getElementById('monitoring-session-bar');
  if(!bar || !session) return;
  bar.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--sur); padding:16px 24px; border-radius:8px; border:1px solid var(--out-var); margin-bottom:24px;">
      <div>
        <h2 style="margin:0; font-size:18px;">${session.name}</h2>
        <div style="font-size:12px; color:var(--on-sur-var); margin-top:4px;">
          Started: ${new Date().toLocaleTimeString()} • Duration: ${session.duration} mins
        </div>
      </div>
      <div class="bdg" style="background:rgba(20,108,46,0.1); color:var(--suc); border:1px solid rgba(20,108,46,0.25);">
        <span style="width: 6px; height: 6px; background: var(--suc); border-radius: 50%; display: inline-block; animation: pulseGlow 1.5s infinite;"></span>
        LIVE
      </div>
    </div>
  `;
}

function renderMonitorCandidates() {
  const tbody = document.getElementById('monitor-table-body');
  if (!tbody) return;

  const search = (document.getElementById('monitor-search')?.value || '').toLowerCase();
  const filterBtn = document.querySelector('#monitor-risk-filters .chip.selected');
  const riskFilter = filterBtn ? filterBtn.dataset.filter : 'all';

  let filtered = STATE.data.candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search) || c.rollNo.toLowerCase().includes(search);
    const matchesRisk = riskFilter === 'all' || c.aiRisk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No candidates found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    let riskHtml = `<span class="risk-dot risk-${c.aiRisk}"></span> ${c.aiRisk.charAt(0).toUpperCase() + c.aiRisk.slice(1)}`;
    let progressPct = Math.round((c.currentQuestion / c.totalQuestions) * 100) || 0;
    let timeMins = Math.floor(c.timeRemaining / 60);
    
    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--out-var);">
            <div style="display:flex; flex-direction:column;">
              <span style="font-weight:600;">${c.name}</span>
            </div>
          </div>
        </td>
        <td>${c.rollNo}</td>
        <td>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <div style="font-size:12px; color:var(--on-sur-var);">Q${c.currentQuestion} of ${c.totalQuestions}</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:60px; height:6px; background:var(--out-var); border-radius:3px; overflow:hidden;">
                <div style="width:${progressPct}%; height:100%; background:var(--pri);"></div>
              </div>
              <span style="font-size:12px; color:var(--on-sur-var);">${progressPct}%</span>
            </div>
          </div>
        </td>
        <td>${timeMins} min</td>
        <td><span style="color:${c.warningCount > 0 ? 'var(--err)' : 'inherit'}; font-weight:${c.warningCount > 0 ? '600' : 'normal'}">${c.warningCount}</span></td>
        <td>${riskHtml}</td>
        <td>
          <button class="icon-btn" title="Session Supervisor" onclick="openSessionSupervisor('${c.id}')"><i class="material-icons">visibility</i></button>
          <button class="icon-btn" title="Take Action" onclick="openSessionSupervisor('${c.id}')"><i class="material-icons" style="color:var(--wrn);">warning</i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterMonitorCandidates() {
  renderMonitorCandidates();
}

function setMonitorFilter(risk) {
  document.querySelectorAll('#monitor-risk-filters .chip').forEach(el => el.classList.remove('selected'));
  document.querySelector(`#monitor-risk-filters .chip[data-filter="${risk}"]`)?.classList.add('selected');
  renderMonitorCandidates();
}

function renderAiAlerts(alerts) {
  const countSpan = document.getElementById('ai-alert-count');
  const feed = document.getElementById('ai-alert-feed');
  if(!countSpan || !feed) return;

  countSpan.textContent = alerts.length;
  if(alerts.length > 0) {
    countSpan.style.background = 'var(--err)';
    countSpan.style.color = 'var(--err-ct)';
  } else {
    countSpan.style.background = 'var(--out-var)';
    countSpan.style.color = 'var(--sur)';
  }

  if (alerts.length === 0) {
    feed.innerHTML = '<div style="padding:20px;text-align:center;color:var(--on-sur-var);">No active alerts.</div>';
    return;
  }

  feed.innerHTML = alerts.map(a => `
    <div style="background:var(--sur); border:1px solid var(--out-var); border-radius:8px; padding:12px; margin-bottom:12px; border-left:4px solid var(--err);">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:600; font-size:13px;">${a.candidateName}</span>
        <span style="font-size:11px; color:var(--on-sur-var);">${new Date(a.timestamp).toLocaleTimeString()}</span>
      </div>
      <div style="color:var(--err); font-size:12px; font-weight:600; margin-bottom:8px;">
        <i class="material-icons" style="font-size:14px; vertical-align:middle; margin-right:4px;">warning</i>
        ${a.alertType}
      </div>
      <div style="font-size:11px; color:var(--on-sur-var); margin-bottom:12px;">Confidence: ${a.confidence}%</div>
      <div style="display:flex; gap:8px;">
        <button class="mdbtn btn-outlined" style="flex:1; min-height:28px; padding:4px; font-size:11px;" onclick="pushToast('Alert dismissed', 'info')">Dismiss</button>
        <button class="mdbtn btn-filled" style="flex:1; min-height:28px; padding:4px; font-size:11px;" onclick="pushToast('Alert escalated', 'success')">Escalate</button>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// SESSIONS
// ============================================================================
async function fetchSessions() {
  try {
    document.getElementById('sessions-grid').innerHTML = `
      <div class="skeleton" style="height:150px;"></div>
      <div class="skeleton" style="height:150px;"></div>
      <div class="skeleton" style="height:150px;"></div>
    `;
    STATE.data.sessions = await apiFetch('/sessions');
    setTimeout(renderSessions, 400); // 400ms delay for premium feel
  } catch (err) {
    pushToast('Failed to load sessions', 'error');
  }
}

function renderSessions() {
  const grid = document.getElementById('sessions-grid');
  if(!grid) return;

  const filterBtn = document.querySelector('#session-status-filters .chip.selected');
  const statusFilter = filterBtn ? filterBtn.dataset.filter : 'all';

  let filtered = STATE.data.sessions;
  if (statusFilter !== 'all') {
    filtered = filtered.filter(s => s.status === statusFilter);
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--on-sur-var);">No sessions found.</div>';
    return;
  }

  grid.innerHTML = filtered.map(s => {
    let statusColors = {
      'live': 'background:rgba(20,108,46,0.1); color:var(--suc); border-color:rgba(20,108,46,0.25);',
      'upcoming': 'background:rgba(0,99,155,0.1); color:var(--inf); border-color:rgba(0,99,155,0.25);',
      'draft': 'background:rgba(142,138,148,0.1); color:var(--on-sur-var); border-color:rgba(142,138,148,0.25);',
      'completed': 'background:rgba(103,80,164,0.1); color:var(--sec); border-color:rgba(103,80,164,0.25);'
    };
    
    return `
      <div style="background:var(--sur); border:1px solid var(--out-var); border-radius:8px; padding:var(--spacing-lg); display:flex; flex-direction:column; gap:var(--spacing-md); cursor:pointer; transition:0.2s;" onclick="viewSessionDetails('${s.id}')" onmouseover="this.style.borderColor='var(--pri)'" onmouseout="this.style.borderColor='var(--out-var)'">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h3 style="margin:0; font-size:16px; font-weight:600;">${s.name}</h3>
          <div class="bdg" style="${statusColors[s.status]}">${s.status}</div>
        </div>
        <div style="font-size:13px; color:var(--on-sur-var); display:flex; flex-direction:column; gap:var(--spacing-sm);">
          <div style="display:flex; align-items:center; gap:var(--spacing-sm);"><i class="material-icons" style="font-size:16px;">event</i> ${new Date(s.examDate).toLocaleString()}</div>
          <div style="display:flex; align-items:center; gap:var(--spacing-sm);"><i class="material-icons" style="font-size:16px;">timer</i> ${s.duration} mins</div>
          <div style="display:flex; align-items:center; gap:var(--spacing-sm);"><i class="material-icons" style="font-size:16px;">people</i> ${s.candidateCount} Candidates</div>
        </div>
        <div style="margin-top:auto; display:flex; gap:var(--spacing-sm); justify-content:flex-end; border-top:1px solid var(--out-var); padding-top:var(--spacing-md);">
          ${s.status !== 'completed' ? `<button class="mdbtn btn-tonal" onclick="event.stopPropagation(); showEditSessionModal('${s.id}')">Edit</button>` : ''}
          ${s.status === 'live' ? `<button class="mdbtn btn-filled" onclick="event.stopPropagation(); navigateTo('monitoring')">Monitor</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function setSessionFilter(status) {
  document.querySelectorAll('#session-status-filters .chip').forEach(el => el.classList.remove('selected'));
  document.querySelector(`#session-status-filters .chip[data-filter="${status}"]`)?.classList.add('selected');
  renderSessions();
}

async function viewSessionDetails(id) {
  STATE.currentSessionId = id;
  try {
    const s = await apiFetch('/sessions/' + id);
    STATE.data.currentSession = s;
    
    document.getElementById('sd-title').textContent = s.name;
    document.getElementById('sd-subtitle').textContent = `Status: ${s.status.toUpperCase()} | Date: ${new Date(s.examDate).toLocaleDateString()} | Candidates: ${s.candidates ? s.candidates.length : 0}`;
    
    const btn = document.getElementById('sd-action-btn');
    const editBtn = document.getElementById('sd-edit-btn');
    if(editBtn) editBtn.style.display = (s.status === 'completed') ? 'none' : 'block';
    
    if(s.status === 'live') {
      btn.innerHTML = `<i class="material-icons">stop</i> End Exam`;
      btn.className = "mdbtn btn-outlined";
      btn.style.color = "var(--err)";
      btn.style.borderColor = "var(--err)";
    } else if (s.status === 'completed') {
      btn.innerHTML = `<i class="material-icons">check_circle</i> Completed`;
      btn.className = "mdbtn btn-tonal";
      btn.disabled = true;
    } else {
      btn.innerHTML = `<i class="material-icons">play_arrow</i> Start Exam`;
      btn.className = "mdbtn btn-filled";
      btn.disabled = false;
    }

    renderSessionCandidates();

    document.querySelectorAll('.panel-section').forEach(el => el.classList.remove('active'));
    document.getElementById('session-details-panel').classList.add('active');
  } catch (e) {
    pushToast('Failed to load session details', 'error');
  }
}

function renderSessionCandidates() {
  const s = STATE.data.currentSession;
  const tbody = document.getElementById('sd-candidates-tbody');
  const search = document.getElementById('sd-search').value.toLowerCase();
  
  if(!s || !s.candidates || s.candidates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--on-sur-var);">No candidates found.</td></tr>`;
    return;
  }
  
  let filtered = s.candidates;
  if(search) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.rollNo.toLowerCase().includes(search));
  }

  tbody.innerHTML = filtered.map(c => {
    let statusBdg = `<span class="status-dot dot-draft"></span> Not Started`;
    if(c.examStatus === 'in_progress') statusBdg = `<span class="status-dot dot-live"></span> In Progress`;
    else if(c.examStatus === 'completed') statusBdg = `<span class="status-dot dot-completed"></span> Completed`;
    
    if(c.warningCount > 0 && c.examStatus === 'in_progress') {
       statusBdg = `<span class="status-dot" style="background:var(--err);"></span> Flagged (${c.warningCount})`;
    }

    return `
      <tr style="border-bottom:1px solid var(--out-var);">
        <td style="padding:12px 16px;"><input type="checkbox" class="sd-cand-cb" value="${c.id}"></td>
        <td style="padding:12px 16px;">
          <div style="font-weight:600; font-size:14px;">${c.name}</div>
          <div style="font-size:12px; color:var(--on-sur-var);">${c.email}</div>
        </td>
        <td style="padding:12px 16px; font-size:13px;">${c.rollNo}</td>
        <td style="padding:12px 16px;"><code style="background:var(--sur-var); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'UNASSIGNED'}</code></td>
        <td style="padding:12px 16px; font-size:13px; display:flex; align-items:center; gap:6px;">${statusBdg}</td>
        <td style="padding:12px 16px;">
          <button class="mdbtn btn-text" onclick="showCandidateDetail('${c.id}')" style="padding:4px 8px; font-size:13px;">View</button>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleSelectAllSD() {
  const isChecked = document.getElementById('sd-select-all').checked;
  document.querySelectorAll('.sd-cand-cb').forEach(cb => cb.checked = isChecked);
}

function allocateVouchers() {
  const cbs = document.querySelectorAll('.sd-cand-cb:checked');
  if(cbs.length === 0) { pushToast('Select candidates to allocate vouchers', 'warning'); return; }
  
  cbs.forEach(cb => {
    const cid = cb.value;
    const c = STATE.data.currentSession.candidates.find(x => x.id === cid);
    if(c && !c.voucherCode) {
      c.voucherCode = 'SDC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      apiFetch(`/candidates/${cid}`, { method:'PUT', body: { voucherCode: c.voucherCode } }).catch(console.error);
    }
  });
  pushToast(`Allocated vouchers to ${cbs.length} candidates`, 'success');
  renderSessionCandidates();
}

function bulkMessageCandidates() {
  const cbs = document.querySelectorAll('.sd-cand-cb:checked');
  if(cbs.length === 0) { pushToast('Select candidates to message', 'warning'); return; }
  pushToast(`Message sent to ${cbs.length} candidates.`, 'success');
}

function exportCandidateList() {
  pushToast('Candidate list exported as CSV.', 'success');
}

async function toggleSessionState() {
  const s = STATE.data.currentSession;
  if(s.status === 'live') {
    await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: { status: 'completed' } });
    pushToast('Exam session ended.', 'success');
  } else if (s.status === 'completed') {
    return;
  } else {
    await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: { status: 'live' } });
    pushToast('Exam session started!', 'success');
    simulateLiveSession();
  }
  viewSessionDetails(s.id);
}

let simInterval = null;
function simulateLiveSession() {
  if(simInterval) clearInterval(simInterval);
  simInterval = setInterval(() => {
    const s = STATE.data.currentSession;
    if(!s || s.status !== 'live') {
      clearInterval(simInterval);
      return;
    }
    if(s.candidates && s.candidates.length > 0) {
       const rc = s.candidates[Math.floor(Math.random() * s.candidates.length)];
       if(rc.examStatus !== 'completed') {
         rc.examStatus = 'in_progress';
         if(Math.random() > 0.8) rc.warningCount = (rc.warningCount || 0) + 1;
         renderSessionCandidates();
       }
    }
  }, 4000);
}

function showCandidateDetail(id) {
  let c = null;
  if (STATE.data && STATE.data.candidates) {
    c = STATE.data.candidates.find(x => x.id === id);
  }
  if (!c && STATE.data && STATE.data.currentSession && STATE.data.currentSession.candidates) {
    c = STATE.data.currentSession.candidates.find(x => x.id === id);
  }
  if (!c) return;

  let voucherState = c.voucherStatus || 'unassigned'; 
  let classStatus = c.examStatus || 'enrolled'; 
  
  if (classStatus === 'session_scheduled') classStatus = 'enrolled';

  let scenario = 4;
  if (voucherState === 'redeemed' && classStatus === 'completed') scenario = 1;
  else if (voucherState === 'redeemed' && (classStatus === 'in_progress' || classStatus === 'active')) scenario = 2;
  else if ((voucherState === 'assigned' || voucherState === 'pending') && classStatus === 'enrolled') scenario = 3;
  else scenario = 4;

  let contentHtml = `
    <div style="background:var(--sur-var); padding:16px; border-radius:8px; display:flex; align-items:center; gap:16px; margin-bottom:20px;">
      <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid var(--pri);">
      <div>
        <h3 style="margin:0 0 4px 0; font-size:16px;">${c.name}</h3>
        <div style="font-size:12px; color:var(--on-sur-var); margin-bottom:4px;"><i class="material-icons" style="font-size:14px; vertical-align:middle;">email</i> ${c.email}</div>
        <div style="font-size:12px; color:var(--on-sur-var);"><i class="material-icons" style="font-size:14px; vertical-align:middle;">badge</i> Roll No: ${c.rollNo || 'N/A'}</div>
      </div>
    </div>
    
    <div style="border:1px solid var(--out-var); padding:16px; border-radius:8px; margin-bottom:20px;">
      <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--on-sur);">Accommodations</h4>
      <label style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:12px; cursor:pointer;">
        <input type="checkbox" id="acc-checkbox" onchange="document.getElementById('acc-notes').disabled = !this.checked">
        Accommodations Applied
      </label>
      <div class="inp-group" style="margin:0;">
        <label class="inp-label">Conditions & Reasons</label>
        <textarea id="acc-notes" class="inp" style="resize:vertical; min-height:60px;" disabled placeholder="Enter specific accommodation details..."></textarea>
      </div>
    </div>
  `;

  let scenarioContent = '';
  let footerActions = '';
  
  const retakeHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:16px; border-top:1px solid var(--out-var);">
      <span style="font-size:13px; font-weight:600;">Retake Eligible</span>
      <label class="switch">
        <input type="checkbox" id="retake-toggle" onchange="document.getElementById('exam-mode-block').style.display = this.checked ? 'block' : 'none'">
        <span class="switch-slider"></span>
      </label>
    </div>
    <div id="exam-mode-block" style="display:none; margin-top:12px; animation: fadeSlideUp 0.2s ease;">
      <div class="inp-group" style="margin:0;">
        <label class="inp-label">Exam Mode</label>
        <select class="inp">
          <option>In-Class</option>
          <option>Online</option>
        </select>
      </div>
    </div>
  `;

  if (scenario === 1) {
    const passed = (c.examScore && c.examScore >= 70) || (c.learningProgress && c.learningProgress >= 80);
    scenarioContent = `
      <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--on-sur);">Learning Summary</h4>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:var(--sur-var); padding:12px; border-radius:8px;">
        <div>
          <div style="font-size:11px; color:var(--on-sur-var);">Exam Result</div>
          <div style="font-weight:600; color:${passed ? 'var(--suc)' : 'var(--err)'};">${passed ? 'Passed' : 'Failed'}</div>
        </div>
        <div>
          <div style="font-size:11px; color:var(--on-sur-var);">Score Obtained</div>
          <div style="font-weight:600;">${c.examScore || Math.floor(Math.random()*40 + 60)}%</div>
        </div>
      </div>
      ${retakeHtml}
    `;
    footerActions = `
      <button class="mdbtn btn-text" style="color:var(--err);" onclick="pushToast('Account Suspended', 'error'); closeModal()">Suspend Account</button>
      <button class="mdbtn btn-text" style="color:var(--err);" onclick="pushToast('Candidate Removed', 'error'); closeModal()">Remove Candidate</button>
    `;
  } 
  else if (scenario === 2) {
    const examDateStr = c.examDate ? new Date(c.examDate).toLocaleDateString() : 'Pending Schedule';
    scenarioContent = `
      <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--on-sur);">Current Class: <span style="font-weight:400;">${c.subject || 'N/A'}</span></h4>
      <div style="background:var(--sur-var); padding:12px; border-radius:8px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--on-sur-var); margin-bottom:6px;">
          <span>Learning Progress</span>
          <span>${c.learningProgress || 0}% Complete</span>
        </div>
        <div style="width:100%; height:6px; background:var(--out-var); border-radius:3px; overflow:hidden;">
          <div style="width:${c.learningProgress || 0}%; height:100%; background:var(--pri);"></div>
        </div>
      </div>
      <div style="font-size:13px; margin-bottom:4px;"><strong>Upcoming Exam Date:</strong> ${examDateStr}</div>
      ${retakeHtml}
    `;
    footerActions = `
      <button class="mdbtn btn-text" style="color:var(--err);" onclick="pushToast('Account Suspended', 'error'); closeModal()">Suspend Account</button>
      <button class="mdbtn btn-text" style="color:var(--err);" onclick="pushToast('Candidate Removed', 'error'); closeModal()">Remove Candidate</button>
    `;
  }
  else if (scenario === 3) {
    scenarioContent = `
      <div style="background:rgba(125,87,0,0.1); border:1px solid var(--wrn); padding:12px; border-radius:8px;">
        <div style="font-size:13px; font-weight:600; color:var(--wrn); margin-bottom:4px;">Voucher State: Pending Redemption</div>
        <div style="font-size:12px; color:var(--on-sur-var);">Target Class: ${c.subject || 'N/A'}</div>
      </div>
    `;
    footerActions = `
      <button class="mdbtn btn-text" style="color:var(--err);" onclick="pushToast('Candidate Removed', 'error'); closeModal()">Remove Candidate</button>
      <button class="mdbtn btn-filled" onclick="pushToast('Voucher Redeemed', 'success'); closeModal()">Redeem Voucher</button>
    `;
  }
  else {
    scenarioContent = `
      <div style="background:var(--sur-var); padding:12px; border-radius:8px;">
        <div style="font-size:13px; font-weight:600; margin-bottom:4px;">Voucher State: No Voucher Linked</div>
        <div style="font-size:12px; color:var(--on-sur-var);">Current Class: ${c.subject || 'N/A'}</div>
      </div>
      ${retakeHtml}
    `;
    footerActions = `
      <button class="mdbtn btn-text" style="color:var(--err);" onclick="pushToast('Candidate Removed', 'error'); closeModal()">Remove Candidate</button>
      <button class="mdbtn btn-filled" onclick="pushToast('Voucher Assigned', 'success'); closeModal()">Assign Voucher</button>
    `;
  }

  document.getElementById('modal-header').innerHTML = `<h2 style="font-size:18px;">Candidate Details</h2>`;
  document.getElementById('modal-body').innerHTML = contentHtml + scenarioContent;
  
  document.getElementById('modal-footer').innerHTML = `
    <div style="display:flex; justify-content:space-between; width:100%;">
      <div style="display:flex; gap:8px;">
        ${footerActions}
      </div>
      <button class="mdbtn btn-outlined" onclick="closeModal()">Close</button>
    </div>
  `;
  
  document.getElementById('modal-overlay').classList.remove('hidden');
}



function showCreateSessionModal() {
  document.getElementById('modal-header').innerHTML = `<h2 style="font-size:18px;">Add Class</h2>`;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--spacing-md);">
      <div class="inp-group">
        <label class="inp-label">Class Name</label>
        <input class="inp" type="text" id="create-s-name" placeholder="e.g. Fall 2026 Batch">
      </div>
      <div style="display:flex; gap:16px;">
        <div class="inp-group" style="flex:1;">
          <label class="inp-label">Exam Date</label>
          <input class="inp" type="date" id="create-s-date">
        </div>
        <div class="inp-group" style="flex:1;">
          <label class="inp-label">Time</label>
          <input class="inp" type="time" id="create-s-time">
        </div>
      </div>
      <div class="inp-group">
        <label class="inp-label">Duration (mins)</label>
        <input class="inp" type="number" id="create-s-dur" value="120">
      </div>
      <div class="inp-group">
        <label class="inp-label">Voucher Allocation (Optional Pool)</label>
        <input class="inp" type="number" id="create-s-vouchers" placeholder="Number of vouchers to pre-allocate" value="0">
      </div>
      <div class="inp-group" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
        <label class="inp-label" style="margin:0;">Allow Retake</label>
        <label class="switch">
          <input type="checkbox" id="create-s-retake">
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>
  `;
  document.getElementById('modal-footer').innerHTML = `
    <button class="mdbtn btn-tonal" onclick="closeModal()">Cancel</button>
    <button class="mdbtn btn-filled" onclick="saveNewClass()">Add Class</button>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

async function saveNewClass() {
  const name = document.getElementById('create-s-name').value;
  const examDate = document.getElementById('create-s-date').value;
  const startTime = document.getElementById('create-s-time').value;
  const duration = parseInt(document.getElementById('create-s-dur').value) || 120;
  const vouchersAvailable = parseInt(document.getElementById('create-s-vouchers').value) || 0;
  
  if(!name || !examDate) {
    pushToast('Name and date are required', 'error');
    return;
  }

  try {
    const res = await apiFetch('/sessions', {
      method: 'POST',
      body: { name, examDate, startTime, duration, vouchersAvailable }
    });
    pushToast('Session created successfully', 'success');
    closeModal();
    fetchSessions(); // Refresh grid
    setTimeout(() => { showAddCandidateModal(res.id || 'sess_' + Date.now()); }, 300); // Trigger add candidate flow
  } catch (e) {
    pushToast('Failed to create session', 'error');
  }
}

function showEditSessionModal(id) {
  const s = STATE.data.sessions.find(x => x.id === id);
  if(!s) return;
  document.getElementById('modal-header').innerHTML = `<h2 style="font-size:18px;">Edit Class</h2>`;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--spacing-md);">
      <div class="inp-group">
        <label class="inp-label">Class Name</label>
        <input class="inp" type="text" id="edit-s-name" value="${s.name}">
      </div>
      <div style="display:flex; gap:16px;">
        <div class="inp-group" style="flex:1;">
          <label class="inp-label">Exam Date</label>
          <input class="inp" type="date" id="edit-s-date" value="${s.examDate ? s.examDate.split('T')[0] : ''}">
        </div>
        <div class="inp-group" style="flex:1;">
          <label class="inp-label">Time</label>
          <input class="inp" type="time" id="edit-s-time" value="${s.startTime || ''}">
        </div>
      </div>
      <div class="inp-group">
        <label class="inp-label">Duration (mins)</label>
        <input class="inp" type="number" id="edit-s-dur" value="${s.duration}">
      </div>
    </div>
  `;
  document.getElementById('modal-footer').innerHTML = `
    <button class="mdbtn btn-tonal" onclick="closeModal()">Cancel</button>
    <button class="mdbtn btn-filled" onclick="saveSessionEdit('${id}')">Save Changes</button>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

async function saveSessionEdit(id) {
  const name = document.getElementById('edit-s-name').value;
  const examDate = document.getElementById('edit-s-date').value;
  const startTime = document.getElementById('edit-s-time').value;
  const duration = parseInt(document.getElementById('edit-s-dur').value);
  try {
    await apiFetch(`/sessions/${id}`, { method: 'PUT', body: { name, duration, examDate, startTime } });
    pushToast('Session updated successfully', 'success');
    closeModal();
    fetchSessions(); // Refresh grid
  } catch(e) {
    pushToast('Failed to update session', 'error');
  }
}

// ============================================================================
// CANDIDATES
// ============================================================================
async function fetchCandidates() {
  try {
    const tbody = document.getElementById('candidates-table-body');
    if(tbody) tbody.innerHTML = generateTableSkeleton(5, 7);
    
    STATE.data.candidates = await apiFetch('/candidates');
    setTimeout(renderCandidatesTable, 400); // Premium delay
  } catch(err) {
    pushToast('Failed to load candidates', 'error');
  }
}

function renderCandidatesTable() {
  const tbody = document.getElementById('candidates-table-body');
  if(!tbody) return;

  const search = (document.getElementById('candidates-search')?.value || '').toLowerCase();
  const filterBtn = document.querySelector('#candidates-status-filters .chip.selected');
  const statusFilter = filterBtn ? filterBtn.dataset.filter : 'all';

  let filtered = STATE.data.candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search) || c.rollNo.toLowerCase().includes(search) || c.email.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || c.examStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No candidates found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${c.photo}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
          <div>
            <div style="font-weight:600;">${c.name}</div>
            <div style="font-size:11px; color:var(--on-sur-var);">${c.email}</div>
          </div>
        </div>
      </td>
      <td>${c.rollNo}</td>
      <td>${c.course}</td>
      <td><span style="font-size:12px; font-family:var(--font-mono);">${c.sessionId}</span></td>
      <td><span class="chip" style="font-size:11px; padding:2px 8px; border-radius:4px;">${c.examStatus.replace('_', ' ')}</span></td>
      <td>
        ${c.voucherCode ? 
          `<span style="font-family:var(--font-mono); font-size:12px;">${c.voucherCode}</span> <br> <span style="font-size:10px; color:var(--on-sur-var); text-transform:uppercase;">${c.voucherStatus}</span>` : 
          `<span style="color:var(--on-sur-var); font-style:italic;">None</span>`
        }
      </td>
      <td><span style="color:${c.warningCount > 0 ? 'var(--err)' : 'inherit'}">${c.warningCount}</span></td>
    </tr>
  `).join('');
}

function filterCandidates() {
  renderCandidatesTable();
}

function setCandidateFilter(status) {
  document.querySelectorAll('#candidates-status-filters .chip').forEach(el => el.classList.remove('selected'));
  document.querySelector(`#candidates-status-filters .chip[data-filter="${status}"]`)?.classList.add('selected');
  renderCandidatesTable();
}

// ============================================================================
// INCIDENTS
// ============================================================================
async function fetchIncidents() {
  try {
    const [inc, cands, sess] = await Promise.all([
      apiFetch('/incidents'),
      apiFetch('/candidates'),
      apiFetch('/sessions')
    ]);
    STATE.data.incidents = inc;
    STATE.data.candidates = cands;
    STATE.data.sessions = sess;
    updateIncidentTabCounts();
    const activeTab = document.querySelector('.incident-tab.active')?.dataset.tab || 'aiflags';
    renderIncidentTab(activeTab);
  } catch(err) {
    pushToast('Failed to load incidents', 'error');
  }
}

function updateIncidentTabCounts() {
  const inc = STATE.data.incidents;
  if(!inc) return;
  document.getElementById('tab-count-aiflags').textContent = inc.aiFlags.length;
  document.getElementById('tab-count-flagged').textContent = inc.flaggedCases.length;
  document.getElementById('tab-count-retakes').textContent = inc.retakeRequests.length;
  document.getElementById('tab-count-malpractice').textContent = inc.malpracticeCases.length;
}

function setIncidentTab(tab) {
  document.querySelectorAll('.incident-tab').forEach(el => el.classList.remove('active'));
  document.querySelector(`.incident-tab[data-tab="${tab}"]`)?.classList.add('active');
  renderIncidentTab(tab);
}

function renderIncidentTab(tab) {
  const container = document.getElementById('incident-content');
  const inc = STATE.data.incidents;
  if(!container || !inc) return;

  if (tab === 'aiflags') {
    container.innerHTML = `
      <div class="proctor-table-wrapper">
        <table class="proctor-table">
          <thead><tr><th>Time</th><th>Candidate</th><th>Session</th><th>Alert Type</th><th>Confidence</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${inc.aiFlags.map(f => `
              <tr>
                <td>${new Date(f.timestamp).toLocaleTimeString()}</td>
                <td style="font-weight:600;">${f.candidateName}</td>
                <td>${f.sessionName}</td>
                <td style="color:var(--err);"><i class="material-icons" style="font-size:14px; vertical-align:middle;">warning</i> ${f.alertType}</td>
                <td>${f.confidence}%</td>
                <td><span class="chip" style="font-size:11px;">${f.status}</span></td>
                <td>
                  <div style="display:flex; gap:var(--spacing-sm);">
                    <button class="mdbtn btn-tonal" style="padding:4px 8px; min-height:0; font-size:12px;" onclick="resolveAiFlag('${f.id}', 'dismissed')">Dismiss</button>
                    <button class="mdbtn btn-filled" style="padding:4px 8px; min-height:0; font-size:12px;" onclick="resolveAiFlag('${f.id}', 'escalated')">Escalate</button>
                    <button class="mdbtn btn-outlined" style="padding:4px 8px; min-height:0; font-size:12px;" onclick="reviewIncident('aiflags', '${f.id}')">Review</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === 'flagged') {
    container.innerHTML = `
      <div class="proctor-table-wrapper">
        <table class="proctor-table">
          <thead><tr><th>Flagged At</th><th>Candidate</th><th>Session</th><th>Reason</th><th>Flagged By</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${inc.flaggedCases.map(fc => `
              <tr>
                <td>${new Date(fc.flaggedAt).toLocaleString()}</td>
                <td style="font-weight:600;">${fc.candidateName}</td>
                <td>${fc.sessionName}</td>
                <td>${fc.reason}</td>
                <td>${fc.flaggedBy}</td>
                <td><span class="chip" style="font-size:11px;">${fc.status}</span></td>
                <td>
                  <button class="mdbtn btn-outlined" style="padding:4px 8px; min-height:0; font-size:12px;" onclick="reviewIncident('flagged', '${fc.id}')">Review</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === 'retakes') {
    container.innerHTML = `
      <div class="proctor-table-wrapper">
        <table class="proctor-table">
          <thead><tr><th>Requested</th><th>Candidate</th><th>Session</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${inc.retakeRequests.map(r => `
              <tr>
                <td>${new Date(r.requestedAt).toLocaleString()}</td>
                <td style="font-weight:600;">${r.candidateName}</td>
                <td>${r.sessionName}</td>
                <td>${r.reason}</td>
                <td><span class="chip" style="font-size:11px;">${r.status}</span></td>
                <td>
                  <div style="display:flex; gap:var(--spacing-sm); align-items:center;">
                    ${r.status === 'pending' ? `
                      <button class="icon-btn" style="color:var(--suc);" onclick="handleRetake('${r.id}', 'approved')"><i class="material-icons">check</i></button>
                      <button class="icon-btn" style="color:var(--err);" onclick="handleRetake('${r.id}', 'denied')"><i class="material-icons">close</i></button>
                    ` : ''}
                    <button class="mdbtn btn-outlined" style="padding:4px 8px; min-height:0; font-size:12px;" onclick="reviewIncident('retakes', '${r.id}')">Review</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === 'malpractice') {
    container.innerHTML = `
      <div class="proctor-table-wrapper">
        <table class="proctor-table">
          <thead><tr><th>Escalated At</th><th>Candidate</th><th>Session</th><th>Evidence Flags</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${inc.malpracticeCases.map(mp => `
              <tr>
                <td>${new Date(mp.escalatedAt).toLocaleString()}</td>
                <td style="font-weight:600;">${mp.candidateName}</td>
                <td>${mp.sessionName}</td>
                <td><span class="chip" style="font-size:11px; font-family:var(--font-mono);">${mp.evidence.join(', ') || 'None'}</span></td>
                <td><span class="chip" style="font-size:11px;">${mp.status.replace('_', ' ')}</span></td>
                <td>
                  <button class="mdbtn btn-outlined" style="padding:4px 8px; min-height:0; font-size:12px;" onclick="reviewIncident('malpractice', '${mp.id}')">Review</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

async function resolveAiFlag(flagId, action) {
  try {
    await apiFetch(`/incidents/aiflags/${flagId}`, { method: 'PUT', body: { status: action } });
    pushToast('AI flag ' + action, 'success');
    fetchIncidents();
  } catch(e) {
    pushToast('Failed to update flag', 'error');
  }
}

async function handleRetake(requestId, status) {
  try {
    await apiFetch(`/incidents/retakes/${requestId}`, { method: 'PUT', body: { status } });
    pushToast('Retake request ' + status, 'success');
    fetchIncidents();
  } catch(e) {
    pushToast('Failed to update request', 'error');
  }
}

function reviewIncident(type, id) {
  const inc = STATE.data.incidents;
  if (!inc) return;

  let incident;
  if (type === 'aiflags') incident = inc.aiFlags.find(x => x.id === id);
  else if (type === 'flagged') incident = inc.flaggedCases.find(x => x.id === id);
  else if (type === 'retakes') incident = inc.retakeRequests.find(x => x.id === id);
  else if (type === 'malpractice') incident = inc.malpracticeCases.find(x => x.id === id);

  if (!incident) {
    pushToast('Incident not found', 'error');
    return;
  }

  const candidate = STATE.data.candidates.find(c => c.id === incident.candidateId) || {};
  const session = STATE.data.sessions.find(s => s.id === incident.sessionId) || {};

  let statusOptions = [];
  if (type === 'aiflags') {
    statusOptions = [
      { val: 'pending', lbl: 'Pending' },
      { val: 'dismissed', lbl: 'Dismissed' },
      { val: 'escalated', lbl: 'Escalated' }
    ];
  } else if (type === 'flagged') {
    statusOptions = [
      { val: 'open', lbl: 'Open' },
      { val: 'reviewed', lbl: 'Reviewed' },
      { val: 'resolved', lbl: 'Resolved' }
    ];
  } else if (type === 'retakes') {
    statusOptions = [
      { val: 'pending', lbl: 'Pending' },
      { val: 'approved', lbl: 'Approved' },
      { val: 'denied', lbl: 'Denied' }
    ];
  } else if (type === 'malpractice') {
    statusOptions = [
      { val: 'under_review', lbl: 'Under Review' },
      { val: 'verified', lbl: 'Verified (Confirmed Malpractice)' },
      { val: 'dismissed', lbl: 'Dismissed' }
    ];
  }

  const currentNotes = incident.reviewerNotes || incident.notes || incident.proctorNote || '';

  const modalHeader = document.getElementById('modal-header');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');
  const modalOverlay = document.getElementById('modal-overlay');

  if (!modalHeader || !modalBody || !modalFooter || !modalOverlay) return;

  const modalCard = document.getElementById('modal-card');
  if (modalCard) {
    modalCard.style.width = '750px';
    modalCard.style.maxWidth = '95%';
    modalCard.style.borderRadius = '16px';
  }

  modalHeader.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
      <h2 style="font-size:18px; font-weight:700; margin:0; display:flex; align-items:center; gap:8px;">
        <i class="material-icons" style="color:var(--pri-dk);">gavel</i>
        Review Incident - ${incident.id}
      </h2>
      <button class="icon-btn" onclick="closeModal()" aria-label="Close modal">
        <i class="material-icons">close</i>
      </button>
    </div>
  `;

  modalBody.innerHTML = `
    <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:20px; text-align:left;">
      
      <!-- LEFT COLUMN: Incident Info & Actions -->
      <div style="display:flex; flex-direction:column; gap:16px; border-right:1px solid var(--out-var); padding-right:20px;">
        
        <!-- Incident Info -->
        <div>
          <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:var(--on-sur-var);">INCIDENT DETAILS</h4>
          <div style="background:var(--sur-var); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:6px; font-size:13px;">
            <div><strong>Type/Reason:</strong> ${incident.alertType || incident.reason || 'N/A'}</div>
            ${incident.confidence ? `<div><strong>AI Confidence:</strong> ${incident.confidence}%</div>` : ''}
            <div><strong>Time Detected:</strong> ${new Date(incident.timestamp || incident.flaggedAt || incident.requestedAt || incident.escalatedAt).toLocaleString()}</div>
            ${incident.flaggedBy ? `<div><strong>Flagged By:</strong> ${incident.flaggedBy}</div>` : ''}
            ${incident.evidence && incident.evidence.length > 0 ? `<div><strong>Evidence Flags:</strong> <span style="font-family:var(--font-mono); font-size:11px;">${incident.evidence.join(', ')}</span></div>` : ''}
          </div>
        </div>

        <!-- Notes -->
        <div class="inp-group">
          <label class="inp-label" for="incident-review-notes">Notes / Decision Rationale</label>
          <textarea class="inp" id="incident-review-notes" style="min-height:90px; resize:vertical; font-family:inherit; font-size:13px;" placeholder="Add reviewer comments or notes...">${currentNotes}</textarea>
        </div>

        <!-- Status Action -->
        <div class="inp-group">
          <label class="inp-label" for="incident-review-status">Incident Status</label>
          <select class="inp" id="incident-review-status" style="font-size:13px; padding:10px;" onchange="toggleRetakeFields(this.value)">
            ${statusOptions.map(opt => `
              <option value="${opt.val}" ${incident.status === opt.val ? 'selected' : ''}>${opt.lbl}</option>
            `).join('')}
          </select>
        </div>

        <!-- Retake Specific Options (conditional) -->
        <div id="retake-conditional-fields" style="display:${type === 'retakes' && incident.status === 'approved' ? 'block' : 'none'}; border-top:1px dashed var(--out-var); padding-top:12px; margin-top:4px;">
          <div class="inp-group" style="margin-bottom:12px;">
            <label class="inp-label" for="incident-retake-date">Retake Date & Time</label>
            <input class="inp" type="datetime-local" id="incident-retake-date" value="${incident.retakeDate ? incident.retakeDate.substring(0,16) : ''}">
          </div>
          <div class="inp-group">
            <label class="inp-label" for="incident-retake-qset">Assigned Question Set</label>
            <input class="inp" type="text" id="incident-retake-qset" placeholder="e.g. Randomized Set B" value="${incident.questionSet || ''}">
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Candidate & Session Context -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        
        <!-- Candidate Section -->
        <div>
          <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:var(--on-sur-var); display:flex; align-items:center; gap:6px;">
            <i class="material-icons" style="font-size:18px;">person</i>
            CANDIDATE PROFILE
          </h4>
          <div style="background:var(--sur); border:1px solid var(--out-var); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px; font-size:13px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${candidate.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--out-var);">
              <div>
                <div style="font-weight:700;">${candidate.name || incident.candidateName || 'Unknown'}</div>
                <div style="font-size:11px; color:var(--on-sur-var);">${candidate.email || 'N/A'}</div>
              </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:4px; border-top:1px solid rgba(0,0,0,0.04); padding-top:8px;">
              <div><strong>Roll No:</strong> ${candidate.rollNo || 'N/A'}</div>
              <div><strong>Course:</strong> ${candidate.course || 'N/A'}</div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div><strong>Exam Status:</strong> 
                <span class="chip" style="font-size:10px; padding:1px 6px; border-radius:4px;">
                  ${candidate.examStatus ? candidate.examStatus.replace('_', ' ') : 'N/A'}
                </span>
              </div>
              <div style="display:flex; align-items:center; gap:4px;">
                <strong>AI Risk:</strong>
                <span class="risk-dot risk-${candidate.aiRisk || 'green'}" style="margin:0; width:8px; height:8px;"></span>
                <span style="font-size:11px; text-transform:capitalize;">${candidate.aiRisk || 'green'}</span>
              </div>
            </div>

            <div><strong>Warning Count:</strong> <span style="font-weight:700; color:${candidate.warningCount > 0 ? 'var(--err)' : 'inherit'};">${candidate.warningCount ?? 0}</span></div>
          </div>
        </div>

        <!-- Session Section -->
        <div>
          <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:var(--on-sur-var); display:flex; align-items:center; gap:6px;">
            <i class="material-icons" style="font-size:18px;">event</i>
            SESSION CONTEXT
          </h4>
          <div style="background:var(--sur); border:1px solid var(--out-var); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px; font-size:13px;">
            <div style="font-weight:700; color:var(--pri-dk);">${session.name || incident.sessionName || 'Unknown Session'}</div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:4px; border-top:1px solid rgba(0,0,0,0.04); padding-top:8px;">
              <div><strong>Status:</strong> 
                <span class="chip" style="font-size:10px; padding:1px 6px; border-radius:4px;">
                  ${session.status || 'N/A'}
                </span>
              </div>
              <div><strong>Duration:</strong> ${session.duration || 'N/A'} mins</div>
            </div>

            <div><strong>Exam Date:</strong> ${session.examDate ? new Date(session.examDate).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Cohort Size:</strong> ${session.candidateCount || 0} candidates</div>
          </div>
        </div>

      </div>

    </div>
  `;

  modalFooter.innerHTML = `
    <div style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); width:100%;">
      <button class="mdbtn btn-tonal" onclick="closeModal()">Cancel</button>
      <button class="mdbtn btn-filled" onclick="saveIncidentReview('${type}', '${id}')">Save Changes</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function toggleRetakeFields(status) {
  const fields = document.getElementById('retake-conditional-fields');
  if (fields) {
    fields.style.display = status === 'approved' ? 'block' : 'none';
  }
}

async function saveIncidentReview(type, id) {
  const notes = document.getElementById('incident-review-notes').value;
  const status = document.getElementById('incident-review-status').value;
  
  const body = { status };
  
  if (type === 'aiflags') {
    body.reviewerNotes = notes;
  } else if (type === 'flagged' || type === 'malpractice') {
    body.notes = notes;
  } else if (type === 'retakes') {
    body.proctorNote = notes;
    if (status === 'approved') {
      const retakeDate = document.getElementById('incident-retake-date').value;
      const questionSet = document.getElementById('incident-retake-qset').value;
      body.retakeDate = retakeDate ? new Date(retakeDate).toISOString() : null;
      body.questionSet = questionSet || null;
    }
  }

  try {
    await apiFetch(`/incidents/${type}/${id}`, { method: 'PUT', body });
    pushToast('Incident updated successfully', 'success');
    closeModal();
    fetchIncidents();
  } catch(e) {
    pushToast('Failed to update incident', 'error');
  }
}

// ============================================================================
// REPORTS & EARNINGS
// ============================================================================
async function fetchReports() {
  try {
    const data = await apiFetch('/reports');
    
    // KPIs
    document.getElementById('reports-kpi-grid').innerHTML = `
      <div class="kpi-card"><div class="kpi-val">${data.overview.totalSessions}</div><div class="kpi-lbl">Total Sessions</div></div>
      <div class="kpi-card"><div class="kpi-val">${data.overview.totalCandidates}</div><div class="kpi-lbl">Total Candidates</div></div>
      <div class="kpi-card"><div class="kpi-val">${data.overview.avgScore}%</div><div class="kpi-lbl">Average Score</div></div>
      <div class="kpi-card"><div class="kpi-val">${data.overview.passRate}%</div><div class="kpi-lbl">Overall Pass Rate</div></div>
    `;

    document.getElementById('reports-ai-stats').innerHTML = `
      <div style="display:flex; justify-content:space-around; text-align:center; padding:20px 0;">
        <div><div style="font-size:24px; font-weight:700;">${data.aiStats.totalFlags}</div><div style="font-size:12px; color:var(--on-sur-var);">Total Flags</div></div>
        <div><div style="font-size:24px; font-weight:700; color:var(--err);">${data.aiStats.escalated}</div><div style="font-size:12px; color:var(--on-sur-var);">Escalated</div></div>
        <div><div style="font-size:24px; font-weight:700; color:var(--suc);">${data.aiStats.accuracyRate}%</div><div style="font-size:12px; color:var(--on-sur-var);">AI Accuracy</div></div>
      </div>
    `;

    document.getElementById('reports-retake-stats').innerHTML = `
      <div style="display:flex; justify-content:space-around; text-align:center; padding:20px 0;">
        <div><div style="font-size:24px; font-weight:700;">${data.retakeStats.total}</div><div style="font-size:12px; color:var(--on-sur-var);">Requests</div></div>
        <div><div style="font-size:24px; font-weight:700; color:var(--suc);">${data.retakeStats.approved}</div><div style="font-size:12px; color:var(--on-sur-var);">Approved</div></div>
        <div><div style="font-size:24px; font-weight:700; color:var(--err);">${data.retakeStats.denied}</div><div style="font-size:12px; color:var(--on-sur-var);">Denied</div></div>
      </div>
    `;

    document.getElementById('reports-session-breakdown').innerHTML = data.sessionBreakdown.map(s => `
      <tr>
        <td style="font-weight:600;">${s.name}</td>
        <td><span class="chip" style="font-size:11px;">${s.status}</span></td>
        <td>${new Date(s.examDate).toLocaleDateString()}</td>
        <td>${s.candidateCount}</td>
        <td>${s.vouchersUsed}</td>
        <td style="color:${s.incidentCount > 0 ? 'var(--err)' : 'inherit'}">${s.incidentCount}</td>
      </tr>
    `).join('');

  } catch (err) {
    pushToast('Failed to load reports', 'error');
  }
}

async function fetchEarnings() {
  try {
    const data = await apiFetch('/earnings');
    
    document.getElementById('earnings-kpi-grid').innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon" style="color:var(--suc); background:rgba(20,108,46,0.1);"><i class="material-icons">attach_money</i></div>
        <div class="kpi-val">$${data.summary.totalEarnedThisMonth}</div>
        <div class="kpi-lbl">Earned This Month</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="color:var(--inf); background:rgba(0,99,155,0.1);"><i class="material-icons">pending</i></div>
        <div class="kpi-val">$${data.summary.pendingPayout}</div>
        <div class="kpi-lbl">Pending Payout</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="color:var(--sec); background:rgba(103,80,164,0.1);"><i class="material-icons">check_circle</i></div>
        <div class="kpi-val">${data.summary.sessionsCompleted}</div>
        <div class="kpi-lbl">Classes Completed</div>
      </div>
    `;

    document.getElementById('earnings-sessions-body').innerHTML = data.sessions.map(s => `
      <tr>
        <td style="font-weight:600;">${s.sessionName}</td>
        <td>${s.date}</td>
        <td>${s.duration}</td>
        <td>$${s.rate}/hr</td>
        <td style="font-weight:700;">$${s.amount}</td>
        <td><span class="chip" style="font-size:11px;">${s.payoutStatus}</span></td>
      </tr>
    `).join('');

    document.getElementById('earnings-payouts-body').innerHTML = data.payouts.map(p => `
      <div style="padding:12px; border:1px solid var(--out-var); border-radius:8px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="font-weight:600; font-size:16px;">$${p.amount}</span>
          <span style="color:var(--suc); font-size:12px; font-weight:600;"><i class="material-icons" style="font-size:14px; vertical-align:middle;">check_circle</i> ${p.status}</span>
        </div>
        <div style="font-size:12px; color:var(--on-sur-var); margin-bottom:4px;">${p.date}</div>
        <div style="font-size:11px; color:var(--on-sur-var); font-family:var(--font-mono);">${p.method}</div>
      </div>
    `).join('');

  } catch(err) {
    pushToast('Failed to load earnings', 'error');
  }
}

// ============================================================================
// SETTINGS & PROFILE
// ============================================================================
async function fetchSettings() {
  try {
    const data = await apiFetch('/settings');
    document.getElementById('settings-name').textContent = data.name;
    document.getElementById('settings-email').textContent = data.email;
    document.getElementById('settings-org').textContent = data.organization;
    const avatar = document.getElementById('settings-avatar');
    if (avatar) avatar.src = data.avatar;

    document.getElementById('settings-2fa-toggle').checked = data.twoFactorEnabled;
    
    if(data.notifications) {
      document.getElementById('notif-incident').checked = data.notifications.newIncident;
      document.getElementById('notif-retake').checked = data.notifications.retakeRequest;
      document.getElementById('notif-voucher').checked = data.notifications.voucherUpdate;
      document.getElementById('notif-exam').checked = data.notifications.examStarting;
      document.getElementById('notif-ai').checked = data.notifications.aiFlag;
    }

    if(data.paymentMethod) {
      document.getElementById('settings-bank-name').textContent = data.paymentMethod.bankName;
      document.getElementById('settings-account-ending').textContent = `****${data.paymentMethod.accountEnding}`;
    }
  } catch (err) {
    pushToast('Failed to load settings', 'error');
  }
}

async function updateNotifPref(key, value) {
  try {
    const body = { notifications: {} };
    body.notifications[key] = value;
    await apiFetch('/settings', { method: 'PATCH', body });
    pushToast('Preference updated', 'success');
  } catch(err) {
    pushToast('Failed to update preference', 'error');
  }
}

function toggle2FA() {
  const isChecked = document.getElementById('settings-2fa-toggle').checked;
  apiFetch('/settings', { method: 'PATCH', body: { twoFactorEnabled: isChecked } })
    .then(() => pushToast(`2FA ${isChecked ? 'Enabled' : 'Disabled'}`, 'success'))
    .catch(() => pushToast('Failed to update 2FA', 'error'));
}

function showChangePasswordModal() {
  pushToast('Change password modal goes here', 'info');
}

// ============================================================================
// UTILITIES (Theme, Time, Toasts, Modals)
// ============================================================================
function toggleTheme() {
  const newTheme = STATE.theme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

function applyTheme(themeName) {
  STATE.theme = themeName;
  localStorage.setItem('sp_theme', themeName);
  document.documentElement.setAttribute('data-t', themeName);
  
  const btnIcon = document.getElementById('theme-btn-icon');
  if (btnIcon) btnIcon.textContent = themeName === 'light' ? 'dark_mode' : 'light_mode';
  
  const toggleInput = document.getElementById('settings-theme-toggle');
  if (toggleInput) toggleInput.checked = (themeName === 'dark');
}

function updateServerTime() {
  const el = document.getElementById('server-time-string');
  if (el) el.textContent = new Date().toLocaleString();
}

function pushToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  if (type === 'error') icon = 'error';
  if (type === 'warning') icon = 'warning';

  toast.innerHTML = `<i class="material-icons">${icon}</i><span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// Additional styling for new components not in index.css natively
document.head.insertAdjacentHTML('beforeend', `
<style>
  /* Extra Dashboard Styles */
  .dash-widgets-row { display: flex; gap: 24px; margin-top: 24px; flex-wrap: wrap; }
  .dash-widget { flex: 1; min-width: 300px; background: var(--sur); border: 1px solid var(--out-var); border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-sm); }
  .dash-widget-header { padding: 16px 20px; border-bottom: 1px solid var(--out-var); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.02); }
  html[data-t="dark"] .dash-widget-header { background: rgba(255,255,255,0.02); }
  .dash-widget-header h3 { font-size: 14px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px; }
  .dash-widget-header i { color: var(--pri-dk); font-size: 18px; }
  .dash-widget-body { padding: 20px; flex: 1; }
  
  /* Tabs */
  .incident-tabs { display: flex; border-bottom: 1px solid var(--out-var); margin-bottom: 24px; overflow-x: auto; scrollbar-width: none; }
  .incident-tab { background: none; border: none; padding: 12px 24px; display: flex; align-items: center; gap: 8px; color: var(--on-sur-var); font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all var(--transition-fast); white-space: nowrap; }
  .incident-tab:hover { color: var(--on-sur); background: rgba(0,0,0,0.02); }
  html[data-t="dark"] .incident-tab:hover { background: rgba(255,255,255,0.02); }
  .incident-tab.active { color: var(--pri-dk); border-bottom-color: var(--pri); }
  .incident-tab i { font-size: 18px; }
  .tab-count { background: var(--out-var); color: var(--sur); font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 700; }
  .incident-tab.active .tab-count { background: var(--pri); color: var(--on-pri); }
  
  /* Tables */
  .proctor-table-wrapper { width: 100%; overflow-x: auto; background: var(--sur); border: 1px solid var(--out-var); border-radius: 8px; }
  .proctor-table { width: 100%; border-collapse: collapse; text-align: left; }
  .proctor-table th { padding: 16px; font-size: 12px; font-weight: 600; color: var(--on-sur-var); border-bottom: 1px solid var(--out-var); background: rgba(0,0,0,0.02); }
  html[data-t="dark"] .proctor-table th { background: rgba(255,255,255,0.02); }
  .proctor-table td { padding: 16px; border-bottom: 1px solid var(--out-var); font-size: 13px; }
  .proctor-table tr:last-child td { border-bottom: none; }
  .proctor-table tbody tr:hover { background: rgba(0,0,0,0.01); }
  html[data-t="dark"] .proctor-table tbody tr:hover { background: rgba(255,255,255,0.01); }
  
  /* Table Controls */
  .table-controls { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
  .table-search { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
  .table-search i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--on-sur-var); font-size: 18px; }
  .table-search input { width: 100%; padding: 10px 12px 10px 36px; border: 1px solid var(--out-var); border-radius: 8px; background: var(--sur); color: var(--on-sur); font-size: 13px; transition: all var(--transition-fast); }
  .table-search input:focus { border-color: var(--pri); outline: none; box-shadow: 0 0 0 3px rgba(249, 173, 0, 0.2); }
  
  /* Dots/Indicators */
  .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
  .dot-live { background: var(--suc); }
  .dot-upcoming { background: var(--inf); }
  .dot-draft { background: var(--on-sur-var); }
  .dot-completed { background: var(--sec); }
  
  .risk-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; }
  .risk-red { background: var(--err); box-shadow: 0 0 8px var(--err); }
  .risk-amber { background: var(--wrn); }
  .risk-green { background: var(--suc); }
  
  /* Exam Monitoring Specifics */
  .monitoring-layout { display: flex; gap: 24px; align-items: flex-start; height: calc(100vh - 240px); }
  .monitoring-table-container { flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
  .monitoring-table-container .proctor-table-wrapper { flex: 1; overflow-y: auto; }
  .ai-alert-panel { width: 320px; background: var(--sur); border: 1px solid var(--out-var); border-radius: 8px; display: flex; flex-direction: column; height: 100%; overflow: hidden; flex-shrink: 0; }
  .ai-alert-header { padding: 16px; border-bottom: 1px solid var(--out-var); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.02); }
  html[data-t="dark"] .ai-alert-header { background: rgba(255,255,255,0.02); }
  .ai-alert-header h3 { margin: 0; font-size: 14px; display: flex; align-items: center; gap: 8px; }
  .ai-alert-count { background: var(--out-var); color: var(--sur); font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 12px; transition: all 0.3s; }
  .ai-alert-feed { flex: 1; padding: 16px; overflow-y: auto; background: var(--md-bg); }
  
  /* Training Gate */
  .training-gate-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 24px; background: var(--md-bg); }
  .training-gate-card { max-width: 600px; width: 100%; background: var(--sur); border: 1px solid var(--out-var); border-radius: 12px; padding: 40px; box-shadow: var(--shadow-lg); text-align: center; }
  .training-gate-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(249,173,0,0.1); color: var(--pri-dk); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .training-gate-icon i { font-size: 32px; }
  .training-gate-title { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
  .training-gate-desc { color: var(--on-sur-var); margin-bottom: 32px; font-size: 14px; line-height: 1.6; }
  .training-video-wrapper { background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 32px; border: 1px solid var(--out-var); }
  .training-video-placeholder { padding: 60px 20px; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
  .training-video-placeholder i { font-size: 48px; color: var(--pri-dk); opacity: 0.8; }
  .training-video-duration { font-size: 12px; opacity: 0.6; font-family: var(--font-mono); }
  .training-progress-bar { width: 100%; height: 6px; background: #333; }
  .training-progress-fill { height: 100%; background: var(--pri); transition: width 0.1s linear; }
  .training-progress-info { display: flex; justify-content: space-between; padding: 12px 16px; background: #111; color: #aaa; font-size: 12px; }
  .training-continue-btn { width: 100%; font-size: 16px; padding: 16px; }
  .training-gate-hint { font-size: 12px; color: var(--on-sur-var); margin-top: 16px; }
  
  /* Blocked Screen */
  .blocked-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 24px; background: var(--md-bg); }
  .blocked-card { max-width: 400px; width: 100%; background: var(--sur); border: 1px solid var(--err); border-radius: 12px; padding: 40px; box-shadow: 0 12px 36px rgba(179,38,30,0.15); text-align: center; }
  .blocked-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(179,38,30,0.1); color: var(--err); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .blocked-icon i { font-size: 32px; }
  .blocked-title { font-size: 24px; font-weight: 800; margin-bottom: 12px; color: var(--err); }
  .blocked-desc { color: var(--on-sur-var); margin-bottom: 24px; font-size: 14px; line-height: 1.6; }
  .blocked-hint { font-size: 12px; color: var(--out); margin-bottom: 32px; font-style: italic; }
  
  /* Sessions Grid */
  .sessions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
  
  /* Misc UI fixes */
  .nav-badge { background: var(--err); color: var(--err-ct); font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; margin-left: auto; }
  
  /* Sidebar Logout Button */
  .sidebar-logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; margin-top: 16px; border-radius: 8px; border: 1px solid rgba(179,38,30,0.2); background: transparent; color: var(--err); font-weight: 600; cursor: pointer; transition: all var(--transition-fast); }
  .sidebar-logout-btn:hover { background: rgba(179,38,30,0.1); border-color: var(--err); color: var(--err); }
  .sidebar-logout-btn i { font-size: 18px; }
</style>
`);

// ============================================================================
// SUPERVISOR MODAL
// ============================================================================
function openSessionSupervisor(id) {
  const c = STATE.data.candidates.find(x => x.id === id);
  if(!c) return;
  
  const sessionName = STATE.data.currentSession ? STATE.data.currentSession.name : "Exam Class";

  document.getElementById('modal-header').innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <i class="material-icons" style="color:var(--pri);">videocam</i> 
      <h2 style="font-size:18px; margin:0;">Candidate Session Supervisor</h2>
    </div>
  `;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex; flex-direction:column; gap:24px; padding-bottom:8px;">
      
      <div style="background:var(--sur-var); border-radius:12px; padding:16px; display:flex; align-items:center; gap:16px;">
        <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <div>
          <h3 style="margin:0 0 4px 0; font-size:16px; font-weight:600;">${c.name}</h3>
          <div style="font-size:13px; color:var(--on-sur-var);">${sessionName} · ID: ${c.id}</div>
        </div>
      </div>

      <div>
        <div style="font-size:14px; font-weight:600; margin-bottom:12px;">1. Dispatch Preset Direct Warning</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="mdbtn btn-tonal" style="justify-content:flex-start; padding:12px 16px; font-weight:500;" onclick="pushToast('Warning dispatched', 'success'); closeModal();">
            <i class="material-icons" style="margin-right:12px;">visibility</i> "Keep eyes aligned with exam window"
          </button>
          <button class="mdbtn btn-tonal" style="justify-content:flex-start; padding:12px 16px; font-weight:500;" onclick="pushToast('Warning dispatched', 'success'); closeModal();">
            <i class="material-icons" style="margin-right:12px;">volume_up</i> "Testing room must remain silent"
          </button>
          <button class="mdbtn btn-tonal" style="justify-content:flex-start; padding:12px 16px; font-weight:500;" onclick="pushToast('Warning dispatched', 'success'); closeModal();">
            <i class="material-icons" style="margin-right:12px;">picture_in_picture</i> "Return to primary full-screen"
          </button>
        </div>
        <div style="display:flex; gap:12px; margin-top:12px;">
          <input class="inp" type="text" placeholder="Type a custom warning message to student..." style="flex:1;">
          <button class="mdbtn btn-filled" onclick="pushToast('Custom warning sent', 'success'); closeModal();">Send</button>
        </div>
      </div>

      <div>
        <div style="font-size:14px; font-weight:600; margin-bottom:12px;">2. Direct Session Controls</div>
        <div style="display:flex; gap:12px;">
          <button class="mdbtn btn-outlined" style="flex:1; justify-content:center; padding:12px;" onclick="pushToast('Exam paused', 'info'); closeModal();">
            <i class="material-icons" style="margin-right:8px;">pause</i> Pause Exam
          </button>
          <button class="mdbtn btn-outlined" style="flex:1; justify-content:center; padding:12px; color:var(--err); border-color:var(--err);" onclick="pushToast('Feed suspended', 'error'); closeModal();">
            <i class="material-icons" style="margin-right:8px;">cancel</i> Suspend Feed
          </button>
        </div>
      </div>

      <div>
        <div style="font-size:14px; font-weight:600; margin-bottom:12px;">3. Support Escalation Channels</div>
        <div style="display:flex; gap:12px;">
          <button class="mdbtn btn-tonal" style="flex:1; justify-content:center; padding:12px;" onclick="pushToast('Escalated to IT Support', 'info'); closeModal();">
            <i class="material-icons" style="margin-right:8px;">build</i> IT Support
          </button>
          <button class="mdbtn btn-tonal" style="flex:1; justify-content:center; padding:12px;" onclick="pushToast('Alerted Chairman', 'info'); closeModal();">
            <i class="material-icons" style="margin-right:8px;">person</i> Alert Chairman
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modal-footer').innerHTML = ``;
  
  const card = document.getElementById('modal-card');
  card.style.maxWidth = '550px';
  document.getElementById('modal-overlay').classList.remove('hidden');
  
  const originalClose = window.closeModal;
  window.closeModal = function() {
    card.style.maxWidth = '400px'; 
    document.getElementById('modal-footer').innerHTML = ''; 
    if(originalClose) originalClose();
    window.closeModal = originalClose; 
  };
}

// ============================================================================
// ADD CANDIDATE MODAL
// ============================================================================
async function showAddCandidateModal(sessionId) {
  let allCands = [];
  try {
    allCands = await apiFetch('/candidates');
  } catch(e) {
    allCands = STATE.data.candidates || []; 
  }
  
  const availableCands = allCands.filter(c => c.sessionId !== sessionId);
  
  const courses = [...new Set(availableCands.map(c => c.course).filter(Boolean))];
  const batchYears = [...new Set(availableCands.map(c => {
     const match = c.rollNo.match(/\\d{4}/);
     return match ? match[0] : null;
  }).filter(Boolean))];

  document.getElementById('modal-header').innerHTML = `<h2 style="font-size:18px;">Add Candidates to Session</h2>`;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; gap:8px;">
        <input class="inp" type="text" id="add-cand-search" placeholder="Search name/email..." onkeyup="filterAddCandidateList()" style="flex:2;">
        <select class="inp" id="add-cand-course" onchange="filterAddCandidateList()" style="flex:1;">
          <option value="">All Subjects</option>
          ${courses.map(course => `<option value="${course}">${course}</option>`).join('')}
        </select>
        <select class="inp" id="add-cand-batch" onchange="filterAddCandidateList()" style="flex:1;">
          <option value="">All Batches</option>
          ${batchYears.map(yr => `<option value="${yr}">${yr}</option>`).join('')}
        </select>
      </div>
      <div id="add-cand-list" style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:4px;">
        ${availableCands.length === 0 ? '<div style="text-align:center; color:var(--on-sur-var); padding:20px;">No candidates available to add.</div>' : ''}
        ${availableCands.map(c => {
          const batch = c.rollNo.match(/\\d{4}/) ? c.rollNo.match(/\\d{4}/)[0] : '';
          return `
          <div class="add-cand-item" data-name="${c.name.toLowerCase()}" data-email="${c.email.toLowerCase()}" data-course="${c.course || ''}" data-batch="${batch}" style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--sur); border:1px solid var(--out-var); border-radius:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
              <div>
                <div style="font-weight:600; font-size:14px;">${c.name}</div>
                <div style="font-size:12px; color:var(--on-sur-var);">${c.course || 'No Course'} · Batch ${batch || 'N/A'}</div>
              </div>
            </div>
            <button class="mdbtn btn-outlined" style="padding:4px 12px; font-size:13px;" onclick="addCandidateToSession('${c.id}', '${sessionId}', this)">Add</button>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  document.getElementById('modal-footer').innerHTML = `
    <button class="mdbtn btn-filled" onclick="closeModal(); viewSessionDetails('${sessionId}');">Done</button>
  `;
  
  const card = document.getElementById('modal-card');
  card.style.maxWidth = '650px';
  document.getElementById('modal-overlay').classList.remove('hidden');
  
  const originalClose = window.closeModal;
  window.closeModal = function() {
    card.style.maxWidth = '400px'; 
    if(originalClose) originalClose();
    window.closeModal = originalClose; 
  };
}

function filterAddCandidateList() {
  const query = document.getElementById('add-cand-search').value.toLowerCase();
  const courseFilter = document.getElementById('add-cand-course').value;
  const batchFilter = document.getElementById('add-cand-batch').value;

  document.querySelectorAll('.add-cand-item').forEach(el => {
    const n = el.dataset.name;
    const e = el.dataset.email;
    const c = el.dataset.course;
    const b = el.dataset.batch;
    
    const matchesSearch = n.includes(query) || e.includes(query);
    const matchesCourse = courseFilter === "" || c === courseFilter;
    const matchesBatch = batchFilter === "" || b === batchFilter;
    
    if(matchesSearch && matchesCourse && matchesBatch) el.style.display = 'flex';
    else el.style.display = 'none';
  });
}

function addCandidateToSession(candId, sessionId, btnEl) {
  apiFetch(`/candidates/${candId}`, { method: 'PUT', body: { sessionId: sessionId } }).catch(console.error);
  btnEl.textContent = 'Added';
  btnEl.disabled = true;
  btnEl.className = 'mdbtn btn-tonal';
  pushToast('Candidate added', 'success');
}
