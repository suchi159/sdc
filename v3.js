/**
 * SecureProctor AI v3 - Logic Engine
 */

const v3App = {
  openBatchModal: function(title, contentBase64) {
    const content = atob(contentBase64);
    const modalHtml = `
      <div id="batch-modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:9999;">
        <div style="background:var(--surface-color, #fff); width:90%; max-width:600px; border-radius:12px; padding:24px; box-shadow:0 8px 32px rgba(0,0,0,0.3); max-height:80vh; overflow-y:auto; position:relative;">
          <h2 style="margin-top:0; border-bottom:1px solid var(--border-color, #eee); padding-bottom:12px;">${title}</h2>
          <button onclick="const m = document.getElementById('batch-modal-overlay'); if(m) m.remove();" style="position:absolute; top:24px; right:24px; background:none; border:none; cursor:pointer; font-size:24px; color:var(--text-secondary, #666);">&times;</button>
          <div style="margin-top:16px;">
            ${content}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  state: {
    dashboard: null,
    candidates: [],
    sessions: [],
    incidents: [],
    materials: [],
    earnings: null,
    reports: null,
    settings: null,
    currentView: 'dashboard',
    sessionViewMode: 'grid',
    materialViewMode: 'grid',
    monitorSse: null,
    monitorState: { session: null, candidates: [], alerts: [] }
  },

  async init() {
    this.bindEvents();
    await this.fetchData();
    
    // Default route
    this.switchView('dashboard');
  },

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.currentTarget.dataset.view);
      });
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      document.getElementById('theme-toggle').innerHTML = isDark ? 
        '<i class="material-icons-outlined">dark_mode</i>' : 
        '<i class="material-icons-outlined">light_mode</i>';
    });

    // Global Search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (this.state.currentView === 'candidates') {
           const filtered = this.state.candidates.filter(c => c.name.toLowerCase().includes(query) || (c.rollNo && c.rollNo.toLowerCase().includes(query)));
           this.renderCandidatesList(filtered);
        } else if (this.state.currentView === 'sessions') {
           const filtered = this.state.sessions.filter(s => s.name.toLowerCase().includes(query));
           this.renderSessionsList(filtered);
        }
      });
    }

    // Notifications
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.style.display = notifDropdown.style.display === 'none' ? 'block' : 'none';
      });
      document.addEventListener('click', () => {
        notifDropdown.style.display = 'none';
      });
      notifDropdown.addEventListener('click', e => e.stopPropagation());
    }
  },

  signOut() {
    this.showToast('Signing out...', 'info');
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg-color);">
           <div style="background:var(--surface-color); padding:40px; border-radius:12px; border:1px solid var(--border-color); text-align:center; box-shadow:var(--shadow-lg);">
              <i class="material-icons-outlined" style="font-size:48px; color:var(--brand-primary); margin-bottom:16px;">lock</i>
              <h2>SecureProctor AI</h2>
              <p style="color:var(--text-secondary); margin:8px 0 24px 0;">You have been safely signed out.</p>
              <button class="btn btn-primary" onclick="location.reload()">Sign In Again</button>
           </div>
        </div>
      `;
    }, 1000);
  },

  async fetchData() {
    try {
      const [dashRes, candRes, sessRes, matRes, earnRes, repRes, setRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/candidates'),
        fetch('/api/sessions'),
        fetch('/api/modules'),
        fetch('/api/earnings'),
        fetch('/api/reports'),
        fetch('/api/settings')
      ]);

      if (dashRes.ok) this.state.dashboard = await dashRes.json();
      if (candRes.ok) {
        this.state.candidates = await candRes.json();
        this.state.candidates.forEach(cand => {
          let vStatus = (cand.voucherStatus || '').toLowerCase();
          let isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
          if (!cand.voucherCode && !isUnassigned) cand.voucherCode = 'VOUCH-' + Math.floor(Math.random()*9000+1000);
          if (!cand.sessionName) cand.sessionName = 'Data Science 101 Bootcamp';
          if (cand.readHours === undefined) cand.readHours = Math.floor(Math.random() * 20);
          if (cand.totalHours === undefined) cand.totalHours = 20;
          if (!cand.pastSessions && Math.random() > 0.5) cand.pastSessions = [{ name: 'Midterm Evaluation', score: '88%', certLink: '#' }];
        });
      }
      if (sessRes.ok) this.state.sessions = await sessRes.json();
      if (matRes.ok) this.state.materials = await matRes.json();
      if (earnRes.ok) this.state.earnings = await earnRes.json();
      if (repRes.ok) this.state.reports = await repRes.json();
      if (setRes.ok) this.state.settings = await setRes.json();
      
      this.state.incidents = this.state.dashboard?.pendingIncidents || [];
      
      // Update Notif Badge
      const badge = document.getElementById('notif-badge');
      const list = document.getElementById('notification-list');
      if (this.state.incidents.length > 0) {
        if (badge) badge.style.display = 'block';
        if (list) {
          list.innerHTML = this.state.incidents.map(inc => `
            <div style="padding:12px; border-bottom:1px solid var(--border-light); font-size:13px; display:flex; gap:12px; cursor:pointer;" onclick="v3App.showToast('Incident opened', 'info')">
               <i class="material-icons-outlined" style="color:var(--status-warning);">warning</i>
               <div>
                 <div style="font-weight:600;">${inc.type}</div>
                 <div style="color:var(--text-secondary); margin-top:4px;">${inc.candidateName} - ${new Date(inc.timestamp).toLocaleTimeString()}</div>
               </div>
            </div>
          `).join('');
        }
      } else {
        if (badge) badge.style.display = 'none';
        if (list) list.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-secondary);">No new notifications</div>`;
      }

      // Re-render current view with new data
      this.renderCurrentView();
    } catch (e) {
      console.error("API Fetch Error:", e);
      this.showToast("Failed to connect to SecureProctor services.", "error");
    }
  },

  switchView(viewId) {
    if (this.state.currentView !== 'monitoring' && viewId !== 'monitoring') {
      // Do nothing special
    }
    
    if (viewId !== 'monitoring' && this.state.monitorSse) {
      this.state.monitorSse.close();
      this.state.monitorSse = null;
    }

    this.state.currentView = viewId;
    
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Update Main Area
    document.querySelectorAll('.workspace').forEach(ws => {
      ws.classList.remove('active');
    });
    
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    // Update Title
    const titles = {
      'dashboard': 'Dashboard',
      'monitoring': 'Live Class Monitoring',
      'candidates': 'Master Candidate Roster',
      'sessions': 'Class Lifecycle Management',
      'materials': 'Learning Materials',
      'earnings': 'Earnings & Payments',
      'reports': 'Reports & Analytics',
      'settings': 'Platform Settings'
    };
    document.getElementById('view-title').textContent = titles[viewId] || 'SecureProctor AI';

    this.renderCurrentView();
  },

  renderCurrentView() {
    if (this.state.currentView === 'dashboard') this.renderDashboard();
    if (this.state.currentView === 'monitoring') this.renderMonitoring();
    if (this.state.currentView === 'candidates') this.renderCandidates('all');
    if (this.state.currentView === 'sessions') this.renderSessions('all');
    if (this.state.currentView === 'materials') this.renderMaterials();
    if (this.state.currentView === 'earnings') this.renderEarnings();
    if (this.state.currentView === 'reports') this.renderReports();
    if (this.state.currentView === 'settings') this.renderSettings();
  },

  // ==========================================================================
  // DASHBOARD RENDERING
  // ==========================================================================
  renderDashboard() {
    const dash = this.state.dashboard;
    if (!dash) return;

    // 1. KPIs
    const kpiGrid = document.getElementById('dashboard-kpis');
    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Active Live Classes</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--brand-primary);">${dash.activeLiveSessions || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Upcoming Classes (7D)</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px;">${dash.upcomingSessions7Days || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Pending Incidents</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:${dash.pendingIncidentCount > 0 ? 'var(--status-error)' : 'inherit'};">${dash.pendingIncidentCount || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Available Vouchers</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-success);">${dash.voucherBalance?.available || 0}</div>
        </div>
      `;
    }

    // 2. Upcoming Feed
    const upcoming = document.getElementById('dash-upcoming-feed');
    if (upcoming && dash.upcomingSessions) {
      if (dash.upcomingSessions.length === 0) {
        upcoming.innerHTML = `<div style="color:var(--text-secondary); font-size:14px; text-align:center; padding:20px;">No upcoming classes scheduled.</div>`;
      } else {
        upcoming.innerHTML = dash.upcomingSessions.map(s => `
          <div style="padding:12px 0; border-bottom:1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:600; font-size:14px;">${s.name}</div>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
                <i class="material-icons-outlined" style="font-size:12px; vertical-align:middle;">schedule</i> ${new Date(s.examDate).toLocaleString()}
              </div>
            </div>
            <div class="badge badge-info">${s.candidateCount} Enrolled</div>
          </div>
        `).join('');
      }
    }

    // 3. Action Feed
    const actionFeed = document.getElementById('dash-action-feed');
    if (actionFeed && dash.pendingIncidents) {
      if (dash.pendingIncidents.length === 0) {
        actionFeed.innerHTML = `<div style="color:var(--status-success); font-size:14px; text-align:center; padding:20px; background:var(--status-success-bg); border-radius:8px;">All caught up! No pending actions.</div>`;
      } else {
        actionFeed.innerHTML = dash.pendingIncidents.map(inc => `
          <div style="padding:12px; background:var(--status-error-bg); border-radius:8px; margin-bottom:8px; border-left:4px solid var(--status-error);">
            <div style="display:flex; justify-content:space-between;">
              <strong style="font-size:13px; color:var(--status-error);">${inc.type}</strong>
              <span style="font-size:11px; color:var(--text-secondary);">${new Date(inc.timestamp).toLocaleTimeString()}</span>
            </div>
            <div style="font-size:13px; margin-top:4px; font-weight:500;">${inc.candidateName}</div>
          </div>
        `).join('');
      }
    }
  },

  // ==========================================================================
  // CANDIDATES RENDERING
  // ==========================================================================
  filterCandidates(status) {
    // Update UI chips
    document.querySelectorAll('#candidate-filters .badge').forEach(b => {
      b.className = 'badge';
      b.style.background = 'var(--border-light)';
      b.style.color = 'var(--text-secondary)';
      if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${status}'`)) {
        b.className = 'badge badge-info';
        b.style.background = '';
        b.style.color = '';
      }
    });

    this.renderCandidates(status);
  },

  renderCandidates(filter) {
    const tbody = document.getElementById('candidates-tbody');
    if (!tbody) return;

    let filtered = this.state.candidates;
    if (filter !== 'all') {
      filtered = filtered.filter(c => c.examStatus === filter);
    }

    this.renderCandidatesList(filtered);
  },

  renderCandidatesList(filtered) {
    const tbody = document.getElementById('candidates-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates match this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      // Format Status
      let statusBadge = '';
      if (c.examStatus === 'completed') statusBadge = `<span class="badge badge-success">Completed</span>`;
      else if (c.examStatus === 'in_progress') statusBadge = `<span class="badge badge-warning">Active</span>`;
      else statusBadge = `<span class="badge" style="background:var(--border-color); color:var(--text-secondary);">Enrolled</span>`;

      // Voucher Status
      let vStatus = (c.voucherStatus || '').toLowerCase();
      let isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
      let isPending = vStatus === 'pending' || vStatus === 'assigned';
      let isActivated = vStatus === 'activated' || vStatus === 'redeemed';

      let voucherHtml = '';
      if (isUnassigned) {
        voucherHtml = `<span style="color:var(--status-warning); font-size:12px; font-weight:600;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span>`;
      } else if (isPending) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'PENDING'}</span><span class="badge badge-warning">Pending</span></div>`;
      } else if (isActivated) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'REDEEMED'}</span><span class="badge badge-success">Activated</span></div>`;
      } else {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'VOUCH'}</span><span class="badge">${c.voucherStatus}</span></div>`;
      }

      return `
        <tr style="cursor:pointer;" onclick="if(!event.target.closest('input') && !event.target.closest('button')) v3App.openCandidateDrawer('${c.id}')">
          <td><input type="checkbox" class="cand-checkbox" onchange="v3App.updateBulkActions()"></td>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
              <div>
                <div style="font-weight:600; font-size:14px;">${c.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${c.email}</div>
              </div>
            </div>
          </td>
          <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
          <td>${voucherHtml}</td>
          <td>${statusBadge}</td>
          <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="v3App.openCandidateDrawer('${c.id}')">Manage</button></td>
        </tr>
      `;
    }).join('');
    
    this.updateBulkActions();
  },

  toggleAllCandidates(e) {
    document.querySelectorAll('.cand-checkbox').forEach(cb => cb.checked = e.target.checked);
    this.updateBulkActions();
  },

  updateBulkActions() {
    const checked = document.querySelectorAll('.cand-checkbox:checked').length;
    let actionBar = document.getElementById('bulk-action-bar');
    
    if (checked > 0) {
      if (!actionBar) {
        actionBar = document.createElement('div');
        actionBar.id = 'bulk-action-bar';
        actionBar.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--text-primary); color:var(--surface-color); padding:16px 24px; border-radius:12px; display:flex; align-items:center; gap:24px; box-shadow:var(--shadow-lg); z-index:90;';
        document.body.appendChild(actionBar);
      }
      actionBar.innerHTML = `
        <div style="font-weight:600;">${checked} candidates selected</div>
        <div style="display:flex; gap:12px;">
          <button class="btn" style="background:var(--surface-color); color:var(--text-primary);" onclick="v3App.showToast('Vouchers assigned to ${checked} candidates.', 'success'); v3App.clearBulkActions();"><i class="material-icons">confirmation_number</i> Bulk Assign Vouchers</button>
          <button class="btn btn-danger" onclick="v3App.showToast('${checked} candidates suspended.', 'error'); v3App.clearBulkActions();"><i class="material-icons">block</i> Suspend Selected</button>
        </div>
      `;
    } else if (actionBar) {
      actionBar.remove();
    }
  },

  clearBulkActions() {
    document.querySelectorAll('.cand-checkbox').forEach(cb => cb.checked = false);
    const selectAll = document.getElementById('bulk-select-all');
    if (selectAll) selectAll.checked = false;
    this.updateBulkActions();
  },

  // ==========================================================================
  // SESSIONS RENDERING
  // ==========================================================================
  filterSessions(status) {
    document.querySelectorAll('#session-filters .badge').forEach(b => {
      b.className = 'badge';
      b.style.background = 'var(--border-light)';
      b.style.color = 'var(--text-secondary)';
      if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${status}'`)) {
        b.className = 'badge badge-info';
        b.style.background = '';
        b.style.color = '';
      }
    });

    this.renderSessions(status);
  },

  renderSessions(filter) {
    const grid = document.getElementById('sessions-grid');
    if (!grid) return;

    let filtered = this.state.sessions;
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.status === filter);
    }

    this.renderSessionsList(filtered);
  },

  setSessionViewMode(mode) {
    this.state.sessionViewMode = mode;
    
    // Update button states
    const gridBtn = document.getElementById('btn-grid-view');
    const tableBtn = document.getElementById('btn-table-view');
    if (gridBtn && tableBtn) {
      gridBtn.style.background = mode === 'grid' ? 'var(--border-light)' : 'transparent';
      gridBtn.style.color = mode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)';
      tableBtn.style.background = mode === 'table' ? 'var(--border-light)' : 'transparent';
      tableBtn.style.color = mode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)';
    }

    // Toggle container visibility
    const gridContainer = document.getElementById('sessions-grid');
    const tableContainer = document.getElementById('sessions-table-container');
    if (gridContainer && tableContainer) {
      gridContainer.style.display = mode === 'grid' ? 'grid' : 'none';
      tableContainer.style.display = mode === 'table' ? 'block' : 'none';
    }

    // Re-render
    const currentFilter = document.querySelector('#session-filters .badge-info');
    let status = 'all';
    if (currentFilter && currentFilter.getAttribute('onclick')) {
      const match = currentFilter.getAttribute('onclick').match(/'([^']+)'/);
      if (match) status = match[1];
    }
    this.renderSessions(status);
  },

  renderSessionsList(filtered) {
    const grid = document.getElementById('sessions-grid');
    const tbody = document.getElementById('sessions-tbody');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">No classes match this filter.</div>`;
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No classes match this filter.</td></tr>`;
      return;
    }

    const mode = this.state.sessionViewMode || 'grid';

    if (mode === 'grid') {
      grid.innerHTML = filtered.map(s => {
        let badgeClass = 'badge';
        if (s.status === 'live' || s.status === 'ongoing') badgeClass += ' badge-success';
        else if (s.status === 'upcoming' || s.status === 'review') badgeClass += ' badge-info';
        else if (s.status === 'completed') badgeClass += ' badge-warning';
        else { badgeClass += ''; }

        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = s.examDate ? new Date(s.examDate).toLocaleDateString() : '';

        return `
          <div class="card" style="display:flex; flex-direction:column; gap:16px;">
            <div class="flex-between">
              <span class="${badgeClass}">${s.status.toUpperCase()}</span>
              <div style="position:relative;">
                <button class="icon-button" onclick="event.stopPropagation(); const m = this.nextElementSibling; m.style.display = m.style.display==='block'?'none':'block';"><i class="material-icons">more_horiz</i></button>
                <div class="session-menu" style="display:none; position:absolute; right:0; top:36px; background:var(--surface-color); border:1px solid var(--border-color); box-shadow:var(--shadow-md); border-radius:8px; z-index:10; width:150px; overflow:hidden;">
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; v3App.showToast('Editing class...', 'info');">Edit Class</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; v3App.showToast('Class duplicated.', 'success');">Duplicate</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px; color:var(--status-error); border-top:1px solid var(--border-light);" onclick="event.stopPropagation(); this.parentElement.style.display='none'; v3App.deleteSession('${s.id}')">Delete</div>
                </div>
              </div>
            </div>
            <div>
              <h3 style="font-size:16px; font-weight:600; margin-bottom:4px;">${s.name} | B1 | 2026</h3>
              <div style="font-size:12px; font-weight:600; color:var(--brand-primary); margin-bottom:8px; display:none;">CLASS YEAR/BATCH NUMBER: 2026-B1</div>
              
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">calendar_today</i> Created ${dateStr}
              </div>
              ${examDateStr ? `<div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">event</i> Class / Exam: ${examDateStr}
              </div>` : `<div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">event</i> Class / Exam: Pending Schedule
              </div>`}
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
                <i class="material-icons-outlined" style="font-size:16px;">location_on</i> Campus Lab A / Online
              </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; padding-top:16px; border-top:1px solid var(--border-light);">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span style="color:var(--text-tertiary); font-size:11px; text-transform:uppercase; font-weight:600;">Candidates</span>
                <div style="font-weight:600; display:flex; align-items:center; gap:4px;"><i class="material-icons-outlined" style="font-size:16px;">people</i> ${s.candidateCount || s.candidates || 18}</div>
              </div>
              <div style="display:flex; flex-direction:column; text-align:right; gap:4px;">
                <span style="color:var(--text-tertiary); font-size:11px; text-transform:uppercase; font-weight:600;">Class Readiness</span>
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px;">
                  <i class="material-icons-outlined" style="font-size:16px;">schedule</i> <span style="font-weight:600; color:var(--brand-primary);">${s.readiness || 0}%</span>
                </div>
              </div>
            </div>
            <button class="btn btn-secondary" style="width:100%; margin-top:auto; ${(s.status === 'live') ? 'background:var(--status-error); border-color:var(--status-error); color:var(--err-ct);' : (s.status === 'ongoing' ? 'background:var(--status-warning); border-color:var(--status-warning); color:var(--wrn-ct);' : '')}" onclick="${(s.status === 'live') ? `v3App.switchView('monitoring')` : `v3App.openSessionDetail('${s.id}')`}">
              ${(s.status === 'live') ? 'Monitor Class' : (s.status === 'ongoing' ? 'Manage Ongoing Class' : 'View Class')}
            </button>
          </div>
        `;
      }).join('');
    } else if (tbody) {
      tbody.innerHTML = filtered.map(s => {
        let badgeClass = 'badge';
        if (s.status === 'live' || s.status === 'ongoing') badgeClass += ' badge-success';
        else if (s.status === 'upcoming' || s.status === 'review') badgeClass += ' badge-info';
        else if (s.status === 'completed') badgeClass += ' badge-warning';
        else { badgeClass += ''; }

        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = s.examDate ? new Date(s.examDate).toLocaleDateString() : 'Pending Schedule';

        return `
          <tr style="cursor:pointer;" onclick="${(s.status === 'live') ? `v3App.switchView('monitoring')` : `v3App.openSessionDetail('${s.id}')`}">
            <td style="font-weight:600;">${s.name}</td>
            <td><span class="${badgeClass}">${s.status.toUpperCase()}</span></td>
            <td>${dateStr}</td>
            <td>${examDateStr}</td>
            <td>${s.candidateCount || s.candidates || 18}</td>
            <td style="font-weight:600; color:var(--brand-primary);">${s.readiness || 0}%</td>
            <td>
               <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px; ${(s.status === 'live') ? 'color:var(--status-error); border-color:var(--status-error);' : ''}" onclick="event.stopPropagation(); ${(s.status === 'live') ? `v3App.switchView('monitoring')` : `v3App.openSessionDetail('${s.id}')`}">
                 ${(s.status === 'live') ? 'Monitor' : 'Manage'}
               </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },


  deleteSession(id) {
    if(confirm('Are you sure you want to delete this class?')) {
      this.state.sessions = this.state.sessions.filter(s => s.id !== id);
      this.renderSessions('all');
      this.showToast('Class deleted.', 'success');
    }
  },

  // ==========================================================================
  // LEARNING MATERIALS RENDERING
  // ==========================================================================
  setMaterialViewMode(mode) {
    this.state.materialViewMode = mode;
    
    // Update button states
    const gridBtn = document.getElementById('btn-mat-grid-view');
    const tableBtn = document.getElementById('btn-mat-table-view');
    if (gridBtn && tableBtn) {
      gridBtn.style.background = mode === 'grid' ? 'var(--border-light)' : 'transparent';
      gridBtn.style.color = mode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)';
      tableBtn.style.background = mode === 'table' ? 'var(--border-light)' : 'transparent';
      tableBtn.style.color = mode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)';
    }

    // Toggle container visibility
    const gridContainer = document.getElementById('materials-grid');
    const tableContainer = document.getElementById('materials-table-container');
    if (gridContainer && tableContainer) {
      gridContainer.style.display = mode === 'grid' ? 'grid' : 'none';
      tableContainer.style.display = mode === 'table' ? 'block' : 'none';
    }

    this.renderMaterials();
  },

  renderMaterials() {
    const grid = document.getElementById('materials-grid');
    const tbody = document.getElementById('materials-tbody');
    if (!grid) return;

    if (!this.state.materials || this.state.materials.length === 0) {
      grid.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-secondary); width:100%; grid-column:1/-1;">
        <i class="material-icons-outlined" style="font-size:32px; margin-bottom:12px; opacity:0.5;">menu_book</i><br>No learning materials uploaded yet.
      </div>`;
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No learning materials uploaded yet.</td></tr>`;
      return;
    }

    const mode = this.state.materialViewMode || 'grid';

    if (mode === 'grid') {
      grid.innerHTML = this.state.materials.map((m, i) => {
        const type = (m.type || 'Ebook').toLowerCase();
        let icon = 'menu_book';
        let ctaText = 'Manage';
        if (type === 'video') { icon = 'play_circle'; }
        else if (type === 'podcast') { icon = 'mic'; }
        else if (type === 'flashcard') { icon = 'style'; }
        else if (type === 'practice exam') { icon = 'quiz'; }
        
        const thumbMap = {
          'ebook': '/thumb_food_safety.png',
          'document': '/thumb_food_safety.png',
          'video': '/thumb_culinary.png',
          'podcast': '/thumb_culinary.png',
          'flashcard': '/thumb_haccp.png',
          'practice exam': '/thumb_practice_exam.png',
        };
        const thumbFallbacks = ['/thumb_food_safety.png', '/thumb_haccp.png', '/thumb_allergen.png', '/thumb_culinary.png', '/thumb_practice_exam.png'];
        const thumb = m.thumb || thumbMap[type] || thumbFallbacks[i % thumbFallbacks.length];

        return `
          <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; position:relative;">
            <img src="${thumb}" style="width:100%; height:140px; object-fit:cover; border-bottom:1px solid var(--border-light);" alt="Thumbnail">
            <div style="padding:20px; display:flex; flex-direction:column; flex:1;">
              <div style="font-size:18px; font-weight:700; color:var(--text-primary); margin-bottom:6px; line-height:1.3;">${m.title}</div>
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:16px;">
                <i class="material-icons-outlined" style="font-size:16px;">${icon}</i> 
                ${m.type || 'Ebook'} • ${m.duration || '120 mins'}
              </div>
              
              <div style="display:flex; justify-content:space-between; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border-light);">
                <div style="display:flex; flex-direction:column;">
                  <span style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-tertiary);">Assigned</span>
                  <span style="font-weight:600;">${Math.floor(Math.random()*20+5)}</span>
                </div>
                <div style="display:flex; flex-direction:column; text-align:right;">
                  <span style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-tertiary);">Avg. Complete</span>
                  <span style="font-weight:600; color:var(--brand-primary);">${Math.floor(Math.random()*40+50)}%</span>
                </div>
              </div>

              <button class="btn btn-secondary" style="width:100%; margin-top:auto;" onclick="v3App.showToast('Launching Material...', 'success')">${ctaText}</button>
            </div>
          </div>
        `;
      }).join('');
    } else if (tbody) {
      tbody.innerHTML = this.state.materials.map((m, i) => {
        const type = (m.type || 'Ebook').toLowerCase();
        let icon = 'menu_book';
        let ctaText = 'Manage';
        if (type === 'video') { icon = 'play_circle'; }
        else if (type === 'podcast') { icon = 'mic'; }
        else if (type === 'flashcard') { icon = 'style'; }
        else if (type === 'practice exam') { icon = 'quiz'; }
        
        const thumbMap = {
          'ebook': '/thumb_food_safety.png',
          'document': '/thumb_food_safety.png',
          'video': '/thumb_culinary.png',
          'podcast': '/thumb_culinary.png',
          'flashcard': '/thumb_haccp.png',
          'practice exam': '/thumb_practice_exam.png',
        };
        const thumbFallbacks = ['/thumb_food_safety.png', '/thumb_haccp.png', '/thumb_allergen.png', '/thumb_culinary.png', '/thumb_practice_exam.png'];
        const thumb = m.thumb || thumbMap[type] || thumbFallbacks[i % thumbFallbacks.length];

        return `
          <tr>
            <td style="width: 60px;">
              <img src="${thumb}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
            </td>
            <td style="font-weight:600;">${m.title}</td>
            <td>
              <div style="display:flex; align-items:center; gap:6px;">
                <i class="material-icons-outlined" style="font-size:16px;">${icon}</i> 
                ${m.type || 'Ebook'}
              </div>
            </td>
            <td>${m.duration || '120 mins'}</td>
            <td>${Math.floor(Math.random()*20+5)}</td>
            <td style="font-weight:600; color:var(--brand-primary);">${Math.floor(Math.random()*40+50)}%</td>
            <td>
               <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="v3App.showToast('Launching Material...', 'success')">
                 ${ctaText}
               </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  // ==========================================================================
  // MONITORING RENDERING
  // ==========================================================================
  
  renderMonitoring(filter = 'all') {
    const tbody = document.getElementById('monitor-tbody');
    const select = document.getElementById('monitor-session-select');
    const alertFeed = document.getElementById('monitor-alert-feed');
    const alertCount = document.getElementById('monitor-alert-count');
    
    if (!tbody) return;

    // Use exact same data as the rest of the application
    this.state.monitorState.session = { id: 'class_live_01', name: 'Active Live Class (Default)' };
    
    // Add mock monitoring properties to candidates if they don't have them
    this.state.monitorState.candidates = this.state.candidates.map(c => ({
      ...c,
      timeRemaining: c.timeRemaining || (Math.floor(Math.random() * 90) + 30) * 60,
      aiRisk: c.aiRisk || (Math.random() > 0.8 ? 'red' : Math.random() > 0.5 ? 'amber' : 'clear')
    }));

    // Mock some alerts based on high risk candidates
    const highRisk = this.state.monitorState.candidates.filter(c => c.aiRisk === 'red');
    this.state.monitorState.alerts = highRisk.map(c => ({
      candidateName: c.name,
      timestamp: new Date().toISOString(),
      alertType: 'Multiple Faces Detected / Audio Anomaly',
      message: 'System flagged suspicious activity.'
    }));

    this.renderMonitoringCandidates(filter);
    this.renderMonitoringAlerts(this.state.monitorState.alerts);
  },

  renderMonitoringCandidates(filter) {
    const tbody = document.getElementById('monitor-tbody');
    const select = document.getElementById('monitor-session-select');
    
    if (!tbody || !this.state.monitorState.session) return;
    
    // Update session select
    if (select && select.children.length <= 1) {
       select.innerHTML = `<option value="${this.state.monitorState.session.id}">${this.state.monitorState.session.name}</option>`;
    }

    let activeCandidates = this.state.monitorState.candidates;
    if (filter !== 'all') {
      activeCandidates = activeCandidates.filter(c => c.aiRisk === filter);
    }

    if (activeCandidates.length === 0) {
       tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-secondary);">No active candidates match this filter.</td></tr>`;
    } else {
       tbody.innerHTML = activeCandidates.map(c => {
         let riskChip = '';
         if (c.aiRisk === 'red') riskChip = '<span class="badge" style="background:var(--status-error-bg); color:var(--status-error);"><i class="material-icons" style="font-size:12px; margin-right:4px;">warning</i> High Risk</span>';
         else if (c.aiRisk === 'amber') riskChip = '<span class="badge" style="background:var(--status-warning-bg); color:var(--status-warning);">Medium Risk</span>';
         else riskChip = '<span class="badge" style="background:var(--status-success-bg); color:var(--status-success);">Clear</span>';

         let timeMins = Math.floor(c.timeRemaining / 60);

         return `
          <tr style="animation: fadeSlideUp 0.3s ease-out;">
            <td>
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                <div>
                  <div style="font-weight:600; font-size:14px;">${c.name}</div>
                  <div style="font-size:12px; color:var(--text-secondary);">${c.rollNo || c.id}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="display:flex; gap:8px;">
                <div style="width:40px; height:30px; background:var(--bg-color); border-radius:4px; display:flex; align-items:center; justify-content:center; color:var(--brand-primary);"><i class="material-icons-outlined" style="font-size:16px;">videocam</i></div>
                <div style="width:40px; height:30px; background:var(--bg-color); border-radius:4px; display:flex; align-items:center; justify-content:center; color:var(--brand-primary);"><i class="material-icons-outlined" style="font-size:16px;">desktop_windows</i></div>
              </div>
            </td>
            <td style="font-weight:600; font-variant-numeric: tabular-nums;">${timeMins}:00</td>
            <td>${riskChip}</td>
            <td>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary" style="padding:6px 12px; font-size:12px; color:var(--text-primary); border:1px solid var(--border-color); background:var(--surface-color); box-shadow:0 1px 2px rgba(0,0,0,0.05);" onclick="v3App.openSessionSupervisor('${c.id}')"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">settings</i> Take Action</button>
              </div>
            </td>
          </tr>
         `;
       }).join('');
    }
  },

  renderMonitoringAlerts(alerts) {
    this.state.monitorState.alerts = alerts;
    const alertFeed = document.getElementById('monitor-alert-feed');
    const alertCount = document.getElementById('monitor-alert-count');
    if (!alertFeed || !alertCount) return;

    alertCount.textContent = alerts.length;
    
    if (alerts.length === 0) {
      alertFeed.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">No active alerts.</div>';
      return;
    }

    alertFeed.innerHTML = alerts.map(a => `
      <div style="background:var(--bg-color); border-left:3px solid var(--status-error); border-radius:4px; padding:12px; animation: fadeSlideUp 0.3s ease-out;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="font-size:13px; color:var(--text-primary);">${a.candidateName}</strong>
          <span style="font-size:11px; color:var(--text-tertiary);">${new Date(a.timestamp).toLocaleTimeString()}</span>
        </div>
        <div style="font-size:12px; color:var(--text-secondary);">${a.alertType || a.message}</div>
      </div>
    `).join('');
  },

  filterMonitoring(type) {
    document.querySelectorAll('#monitor-filters .badge').forEach(b => {
      b.style.opacity = '0.5';
    });
    event.currentTarget.style.opacity = '1';
    this.renderMonitoring(type);
  },

  // ==========================================================================
  // EARNINGS RENDERING
  // ==========================================================================
  renderEarnings() {
    const data = this.state.earnings;
    if (!data) return;

    const kpis = document.getElementById('earnings-kpis');
    if (kpis) {
      kpis.innerHTML = `
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Total Earned This Month</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--brand-primary);">$${data.summary.totalEarnedThisMonth || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Classes Completed</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px;">${data.summary.sessionsCompleted || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Pending Payout</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-warning);">$${data.summary.pendingPayout || 0}</div>
        </div>
      `;
    }

    const sessionsTbody = document.getElementById('earnings-sessions-tbody');
    if (sessionsTbody && data.sessions) {
      sessionsTbody.innerHTML = data.sessions.map(s => `
        <tr>
          <td><div style="font-weight:600;">${s.sessionName}</div></td>
          <td>${s.date}</td>
          <td>${s.duration}</td>
          <td><strong style="color:var(--brand-primary);">$${s.amount}</strong></td>
          <td>${s.payoutStatus === 'paid' ? '<span class="badge badge-success">Paid</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
        </tr>
      `).join('');
    }

    const payoutsTbody = document.getElementById('earnings-payouts-tbody');
    if (payoutsTbody && data.payouts) {
      payoutsTbody.innerHTML = data.payouts.map(p => `
        <tr>
          <td>${p.date}</td>
          <td><strong style="color:var(--status-success);">$${p.amount}</strong></td>
          <td><div style="display:flex; align-items:center; gap:8px;"><i class="material-icons-outlined" style="font-size:16px;">account_balance</i> ${p.method}</div></td>
          <td><span class="badge badge-success">${p.status.toUpperCase()}</span></td>
        </tr>
      `).join('');
    }
  },

  // ==========================================================================
  // REPORTS RENDERING
  // ==========================================================================
  renderReports() {
    const data = this.state.reports;
    if (!data) return;

    const kpis = document.getElementById('reports-kpis');
    if (kpis) {
      kpis.innerHTML = `
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Completed Exams</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px;">${data.overview.completedSessions || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Overall Pass Rate</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-success);">${data.overview.passRate || 0}%</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">Total AI Flags</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--status-warning);">${data.aiStats.totalFlags || 0}</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="color:var(--text-secondary); font-size:13px; font-weight:600; text-transform:uppercase;">AI Accuracy</div>
          <div style="font-size:28px; font-weight:700; margin-top:8px; color:var(--brand-primary);">${data.aiStats.accuracyRate || 0}%</div>
        </div>
      `;
    }

    const sessTbody = document.getElementById('reports-sessions-tbody');
    if (sessTbody && data.sessionBreakdown) {
      sessTbody.innerHTML = data.sessionBreakdown.map(s => `
        <tr>
          <td><div style="font-weight:600;">${s.name}</div></td>
          <td>${new Date(s.examDate).toLocaleDateString()}</td>
          <td>${s.candidateCount}</td>
          <td>${s.incidentCount > 0 ? `<span style="color:var(--status-error); font-weight:600;">${s.incidentCount}</span>` : '0'}</td>
          <td><span class="badge ${s.status === 'completed' ? 'badge-success' : 'badge-info'}">${s.status.toUpperCase()}</span></td>
        </tr>
      `).join('');
    }

    const aiStats = document.getElementById('reports-ai-stats');
    if (aiStats && data.aiStats) {
      aiStats.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:12px; height:12px; background:var(--status-success); border-radius:50%;"></div>
              <span style="font-size:14px; font-weight:500;">Dismissed (False Positives)</span>
            </div>
            <strong style="font-size:16px;">${data.aiStats.dismissed}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:12px; height:12px; background:var(--status-error); border-radius:50%;"></div>
              <span style="font-size:14px; font-weight:500;">Escalated (Violations)</span>
            </div>
            <strong style="font-size:16px;">${data.aiStats.escalated}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:12px; height:12px; background:var(--status-warning); border-radius:50%;"></div>
              <span style="font-size:14px; font-weight:500;">Pending Review</span>
            </div>
            <strong style="font-size:16px;">${data.aiStats.pending}</strong>
          </div>
        </div>
      `;
    }
  },

  // ==========================================================================
  // SETTINGS RENDERING
  // ==========================================================================
  renderSettings() {
    const data = this.state.settings;
    if (!data) return;

    const profileForm = document.getElementById('settings-profile-form');
    if (profileForm) {
      profileForm.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
          <img src="${data.avatar || 'https://via.placeholder.com/150'}" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color);">
          <button class="btn btn-secondary" style="padding:6px 12px; font-size:13px;">Change Photo</button>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Full Name</label>
          <input type="text" value="${data.name}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Email Address</label>
          <input type="email" value="${data.email}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" disabled>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Phone Number</label>
          <input type="text" value="${data.phone || ''}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Organization</label>
          <input type="text" value="${data.organization}" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" disabled>
        </div>
        <button class="btn btn-primary" onclick="v3App.showToast('Profile updated.', 'success')">Save Profile</button>
      `;
    }

    const securityForm = document.getElementById('settings-security-form');
    if (securityForm) {
      securityForm.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding:16px; background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;">
          <div>
            <div style="font-weight:600; font-size:14px; margin-bottom:4px;">Two-Factor Authentication</div>
            <div style="font-size:12px; color:var(--text-secondary);">Secure your account with 2FA.</div>
          </div>
          <button class="btn ${data.twoFactorEnabled ? 'btn-danger' : 'btn-primary'}" style="padding:6px 12px; font-size:12px;" onclick="v3App.showToast('2FA settings changed.', 'success')">${data.twoFactorEnabled ? 'Disable' : 'Enable'}</button>
        </div>

        <h4 style="font-size:14px; font-weight:600; margin-bottom:12px;">Notification Preferences</h4>
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" ${data.notifications?.email ? 'checked' : ''}> Email Notifications
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" ${data.notifications?.sms ? 'checked' : ''}> SMS Alerts for AI Flags
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
            <input type="checkbox" ${data.notifications?.push ? 'checked' : ''}> Browser Push Notifications
          </label>
        </div>
        
        <button class="btn btn-primary" onclick="v3App.showToast('Preferences saved.', 'success')">Save Preferences</button>
      `;
    }
  },

  // ==========================================================================
  // DRAWER & ACTIONS
  // ==========================================================================
  openFormDrawer(type) {
    document.getElementById('drawer-subtitle').textContent = 'Create New Record';
    document.getElementById('drawer-action-btn').style.display = 'block';
    const content = document.getElementById('drawer-content');
    
    if (type === 'candidate') {
      document.getElementById('drawer-title').textContent = 'Add Candidate';
      content.innerHTML = `
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Full Name</label>
          <input type="text" id="form-name" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. John Doe">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Email Address</label>
          <input type="email" id="form-email" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. john@example.com">
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Roll Number</label>
          <input type="text" id="form-roll" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. CS-2026-001">
        </div>
      `;
      document.getElementById('drawer-action-btn').textContent = 'Add Candidate';
      document.getElementById('drawer-action-btn').onclick = () => {
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        if (!name || !email) { this.showToast('Name and Email are required.', 'error'); return; }
        this.state.candidates.unshift({
          id: 'cand_' + Math.random().toString(36).substr(2, 9),
          name: name,
          email: email,
          rollNo: document.getElementById('form-roll').value || 'N/A',
          examStatus: 'enrolled',
          photo: 'https://via.placeholder.com/150'
        });
        this.renderCandidates('all');
        this.closeDrawer();
        this.showToast('Candidate successfully added.', 'success');
      };

    } else if (type === 'session') {
      document.getElementById('drawer-title').textContent = 'Add Class';
      content.innerHTML = `
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Class Name</label>
          <input type="text" id="form-s-name" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Final Exams - Batch A">
        </div>
        <div style="display:flex; gap:16px; margin-bottom:16px;">
          <div class="form-group" style="flex:1">
            <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Add Vouchers code</label>
            <input type="number" id="form-s-vouchers" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. 50">
            <span style="font-size:12px; color:var(--status-success); margin-top:4px; display:block;">Total Available Vouchers: 500</span>
          </div>
          <div class="form-group" style="flex:1">
            <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Subject Duration (mins)</label>
            <input type="number" id="form-s-dur" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. 120" value="120">
          </div>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:12px; font-size:13px; font-weight:600; border-bottom:1px solid var(--border-light); padding-bottom:8px;">Exam Setup</label>
          <div style="display:flex; gap:16px; margin-bottom:16px;">
            <div style="flex:1">
              <label style="display:block; margin-bottom:4px; font-size:12px;">Date</label>
              <input type="date" id="form-s-date" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
            </div>
            <div style="flex:1">
              <label style="display:block; margin-bottom:4px; font-size:12px;">Time</label>
              <input type="time" id="form-s-time" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:4px; font-size:12px;">Location</label>
            <input type="text" id="form-s-loc" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Room 101 or Online">
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:12px; font-weight:600;">Allow Retake</label>
            <label class="switch">
              <input type="checkbox" id="form-s-retake">
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
      `;
      document.getElementById('drawer-action-btn').textContent = 'Add Class';
      document.getElementById('drawer-action-btn').onclick = () => {
        const name = document.getElementById('form-s-name').value;
        if (!name) { this.showToast('Class name is required.', 'error'); return; }
        this.state.sessions.unshift({
          id: 'sess_' + Math.random().toString(36).substr(2, 9),
          name: name,
          examDate: document.getElementById('form-s-date').value || new Date().toISOString(),
          duration: document.getElementById('form-s-dur').value || 60,
          status: 'upcoming',
          candidates: 0,
          readiness: 0
        });
        this.renderSessions('all');
        this.closeDrawer();
        this.showToast('New class created and marked as upcoming.', 'success');
      };

    } else if (type === 'material') {
      document.getElementById('drawer-title').textContent = 'Upload Learning Material';
      content.innerHTML = `
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">File Upload</label>
          <div style="border:2px dashed var(--brand-primary); padding:40px; text-align:center; border-radius:8px; background:var(--brand-active); cursor:pointer;">
             <i class="material-icons-outlined" style="font-size:32px; color:var(--brand-primary);">cloud_upload</i>
             <div style="margin-top:8px; font-weight:600; color:var(--brand-primary);">Click to browse files</div>
          </div>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Material Title</label>
          <input type="text" id="form-m-title" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Module 3 Handbook">
        </div>
      `;
      document.getElementById('drawer-action-btn').textContent = 'Upload File';
      document.getElementById('drawer-action-btn').onclick = () => {
        const tbody = document.getElementById('materials-tbody');
        if (tbody.innerHTML.includes('No learning materials')) tbody.innerHTML = '';
        
        tbody.innerHTML += `
          <tr>
            <td><input type="checkbox"></td>
            <td><strong>${document.getElementById('form-m-title').value || 'Untitled.pdf'}</strong></td>
            <td><span class="badge" style="background:var(--status-warning-bg); color:var(--status-warning);">PDF</span></td>
            <td>0 Classes</td>
            <td><span class="badge badge-success">Processed</span></td>
            <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;">View</button></td>
          </tr>
        `;
        this.closeDrawer();
        this.showToast('File successfully uploaded and processed.', 'success');
      };
    }

    document.getElementById('drawer-overlay').classList.add('open');
    document.getElementById('universal-drawer').classList.add('open');
  },

  openCandidateDrawer(id) {
    const cand = this.state.candidates.find(c => c.id === id);
    if (!cand) return;

    document.getElementById('drawer-title').textContent = cand.name;
    document.getElementById('drawer-subtitle').textContent = `ID: ${cand.rollNo || cand.id}`;

    let voucherState = cand.voucherStatus || 'unassigned'; 
    if (voucherState === 'not_assigned') voucherState = 'unassigned';
    let classStatus = cand.examStatus || 'enrolled'; 
    if (classStatus === 'session_scheduled') classStatus = 'enrolled';

    let scenario = 4;
    if ((voucherState === 'redeemed' || voucherState === 'activated') && classStatus === 'completed') scenario = 1;
    else if ((voucherState === 'redeemed' || voucherState === 'activated') && (classStatus === 'in_progress' || classStatus === 'active')) scenario = 2;
    else if ((voucherState === 'assigned' || voucherState === 'pending') && classStatus === 'enrolled') scenario = 3;
    else scenario = 4;

    let contentHtml = `
      <div style="background:var(--bg-color); padding:16px; border-radius:8px; display:flex; align-items:center; gap:16px; margin-bottom:20px; border:1px solid var(--border-color);">
        <img src="${cand.photo || 'https://via.placeholder.com/150'}" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid var(--brand-primary);">
        <div>
          <h3 style="margin:0 0 4px 0; font-size:16px; color:var(--text-primary);">${cand.name}</h3>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">email</i> ${cand.email}</div>
          <div style="font-size:12px; color:var(--text-secondary);"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">badge</i> Roll No: ${cand.rollNo || 'N/A'}</div>
        </div>
      </div>
      
      <div style="border:1px solid var(--border-color); padding:16px; border-radius:8px; margin-bottom:20px;">
        <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--text-primary);">Accommodations</h4>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:12px; cursor:pointer; color:var(--text-primary);">
          <input type="checkbox" id="acc-checkbox" onchange="document.getElementById('acc-notes').disabled = !this.checked">
          Accommodations Applied
        </label>
        <div class="form-group mb-0">
          <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600; color:var(--text-secondary);">Conditions & Reasons</label>
          <textarea id="acc-notes" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-primary); resize:vertical; min-height:60px;" disabled placeholder="Enter specific accommodation details..."></textarea>
        </div>
      </div>
    `;

    let scenarioContent = '';
    
    // Retake Logic Guard
    let retakeHtml = '';
    // Enrolled Class Guard: If enrolled (Scenario 0), retake logic is completely HIDDEN.
    if (scenario !== 0) {
      retakeHtml = `
        <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border-light);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; font-weight:600; color:var(--text-primary);">Retake Eligible</span>
            <label class="switch">
              <input type="checkbox" id="retake-toggle-${cand.id}" onchange="document.getElementById('exam-mode-block-${cand.id}').style.display = this.checked ? 'block' : 'none'">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div id="exam-mode-block-${cand.id}" style="display:none; margin-top:12px; animation: fadeSlideUp 0.2s ease;">
            <div class="form-group mb-0">
              <label style="display:block; margin-bottom:8px; font-size:12px; font-weight:600; color:var(--text-secondary);">Exam Mode</label>
              <select style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-primary);">
                <option>In-Class</option>
                <option>Online</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }


    if (scenario === 1) {
      if (cand.examScore === undefined) {
         cand.examScore = Math.floor(Math.random() * 80) + 20; // Generate between 20 and 100 for proper pass/fail variance
      }
      const passed = cand.examScore > 50;
      
      scenarioContent = `
        <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--text-primary);">Learning Summary</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px;">
          <div>
            <div style="font-size:11px; color:var(--text-secondary);">Exam Result</div>
            <div style="font-weight:600; color:${passed ? 'var(--status-success)' : 'var(--status-error)'};">${passed ? 'Passed' : 'Failed'}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-secondary);">Score Obtained</div>
            <div style="font-weight:600; color:var(--text-primary);">${cand.examScore}%</div>
          </div>
        </div>
        ${retakeHtml}
        
        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-primary" style="flex:2; background:var(--brand-primary); border-color:var(--brand-primary);" onclick="v3App.openSessionSupervisor('${cand.id}')"><i class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">settings</i> Take Action</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Account Suspended', 'error'); v3App.closeDrawer();">Suspend</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Candidate Removed', 'error'); v3App.closeDrawer();">Remove</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    } 
    else if (scenario === 2) {
      const examDateStr = cand.examDate ? new Date(cand.examDate).toLocaleDateString() : 'Pending Schedule';
      scenarioContent = `
        <h4 style="margin:0 0 12px 0; font-size:13px; color:var(--text-primary);">Current Class: <span style="font-weight:400; color:var(--text-secondary);">${cand.subject || 'N/A'}</span></h4>
        <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:6px;">
            <span>Learning Progress</span>
            <span>${cand.learningProgress || 0}% Complete</span>
          </div>
          <div style="width:100%; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;">
            <div style="width:${cand.learningProgress || 0}%; height:100%; background:var(--brand-primary);"></div>
          </div>
        </div>
        <div style="font-size:13px; margin-bottom:4px; color:var(--text-primary);"><strong>Upcoming Exam Date:</strong> <span style="color:var(--text-secondary);">${examDateStr}</span></div>
        ${retakeHtml}

        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-primary" style="flex:2; background:var(--brand-primary); border-color:var(--brand-primary);" onclick="v3App.openSessionSupervisor('${cand.id}')"><i class="material-icons-outlined" style="font-size:16px; vertical-align:middle; margin-right:4px;">settings</i> Take Action</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Account Suspended', 'error'); v3App.closeDrawer();">Suspend</button>
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Candidate Removed', 'error'); v3App.closeDrawer();">Remove</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    }
    else if (scenario === 3) {
      scenarioContent = `
        <div style="background:var(--status-warning-bg); border:1px solid var(--status-warning); padding:12px; border-radius:8px; margin-bottom:24px;">
          <div style="font-size:13px; font-weight:600; color:var(--status-warning); margin-bottom:4px;">Voucher State: Pending Redemption</div>
          <div style="font-size:12px; color:var(--status-warning);">Target Class: ${cand.subject || 'N/A'}</div>
        </div>
        
        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Candidate Removed', 'error'); v3App.closeDrawer();">Remove Candidate</button>
          <button class="btn btn-primary" style="flex:1;" onclick="v3App.showToast('Voucher Redeemed', 'success'); v3App.closeDrawer();">Redeem Voucher</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    }
    else {
      scenarioContent = `
        <div style="background:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px;">
          <div style="font-size:13px; font-weight:600; color:var(--text-primary); margin-bottom:4px;">Voucher State: No Voucher Linked</div>
          <div style="font-size:12px; color:var(--text-secondary);">Current Class: ${cand.subject || 'N/A'}</div>
        </div>
        ${retakeHtml}

        <div style="margin-top:24px; display:flex; gap:12px;">
          <button class="btn btn-secondary" style="flex:1; color:var(--status-error); border-color:var(--status-error);" onclick="v3App.showToast('Candidate Removed', 'error'); v3App.closeDrawer();">Remove Candidate</button>
          <button class="btn btn-primary" style="flex:1;" onclick="v3App.showToast('Voucher Assigned', 'success'); v3App.closeDrawer();">Assign Voucher</button>
        </div>
      `;
      document.getElementById('drawer-action-btn').style.display = 'none';
    }

    document.getElementById('drawer-content').innerHTML = contentHtml + scenarioContent;
    
    document.getElementById('drawer-overlay').classList.add('open');
    document.getElementById('universal-drawer').classList.add('open');
  },


  viewCandidateHistory(candId) {
    const cand = this.state.candidates.find(c => c.id === candId);
    if (!cand) return;

    document.getElementById('drawer-subtitle').textContent = `Class History - ID: ${cand.rollNo || cand.id}`;
    const content = document.getElementById('drawer-content');
    content.innerHTML = `
      <div class="card" style="margin-bottom:16px; padding:0;">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Score</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Oct 10, 2026</td><td>85%</td><td><span class="badge badge-success">Passed</span></td></tr>
            <tr><td>Sep 15, 2026</td><td>--</td><td><span class="badge badge-error">Failed</span></td></tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-secondary" style="width:100%;" onclick="v3App.openCandidateDrawer('${candId}')"><i class="material-icons-outlined">arrow_back</i> Back to Management</button>
    `;
  },

  suspendCandidate(id) {
    // Optimistic UI Update
    const cand = this.state.candidates.find(c => c.id === id);
    if (cand) cand.examStatus = 'suspended';
    this.closeDrawer();
    this.renderCandidates('all');
    this.showToast('Candidate account has been permanently suspended.', 'success');
  },

  startSession(id) {
    const session = this.state.sessions.find(s => s.id === id);
    if (session) {
      session.status = 'ongoing';
      this.showToast('Class Started successfully.', 'success');
      this.renderSessions('all');
      this.openSessionDetail(id);
    }
  },

    switchDeepDiveTab(el, type) {
    document.querySelectorAll('#dd-tabs-container .dd-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const grid = document.getElementById('dd-cards-grid');
    if (grid) {
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(8px)';
      setTimeout(() => {
        grid.style.transition = 'opacity 0.3s, transform 0.3s';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      }, 150);
    }
    v3App.showToast('Showing ' + type.charAt(0).toUpperCase() + type.slice(1) + ' materials', 'info');
  },

  openLearningDeepDive(candidateId, candName, className, globalProg) {
    document.getElementById('view-session-detail').style.display = 'none';
    const dd = document.getElementById('view-learning-deepdive');
    if(dd) dd.style.display = 'block';
    this.state.currentView = 'learning-deepdive';
    
    const nameEl = document.getElementById('dd-cand-name');
    if(nameEl) nameEl.textContent = candName || 'Unknown Candidate';
    
    const classEl = document.getElementById('dd-cand-class');
    if(classEl) classEl.textContent = className || 'Ongoing Class';
    
    const progEl = document.getElementById('dd-cand-progval');
    if(progEl) progEl.textContent = (globalProg || 0) + '%';
    
    const grid = document.getElementById('dd-cards-grid');
    if(grid) {
      const ddCards = [
        { title: "The Food Protection Manager's Handbook (Study Guide)", time: '120 / 120 mins read', prog: 100, cta: 'Read', img: '/thumb_food_safety.png', state: 'completed' },
        { title: "The Food Protection Manager's Handbook Concise Edition", time: '45 / 60 mins read', prog: 75, cta: 'Resume', img: '/thumb_haccp.png', state: 'progress' },
        { title: "The Food Protection Manager's Handbook A PODCAST SERIES", time: '0 / 180 mins listened', prog: 0, cta: 'Start Listening', img: '/thumb_culinary.png', state: 'disabled' },
        { title: 'SDC Certifications Practice Examination', time: '0 / 1 attempt', prog: 0, cta: 'Start Exam', img: '/thumb_practice_exam.png', state: 'not_started' },
      ];
      grid.innerHTML = ddCards.map((c, idx) => {
        const isDisabled = c.state === 'disabled';
        const delay = idx * 0.08;
        return `
          <div class="dd-card ${isDisabled ? 'disabled' : ''}" style="animation: ddFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both; ${isDisabled ? 'opacity:0.5;' : ''}">
            <img src="${c.img}" style="height:180px; width:100%; object-fit:cover; border-bottom:1px solid var(--border-color); ${isDisabled ? 'filter:grayscale(1);' : ''}" alt="${c.title}">
            <div style="padding:24px; display:flex; flex-direction:column; flex:1;">
              <div style="font-size:16px; font-weight:600; margin-bottom:8px; line-height:1.3;">${c.title}</div>
              <div style="font-size:13px; color:${isDisabled ? '#555' : '#888'}; display:flex; align-items:center; gap:6px; margin-bottom:16px;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:text-bottom;">menu_book</i> ${c.time}</div>
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; margin-bottom:8px;">
                <span>Progress</span>
                <span style="color:var(--brand-primary);">${c.prog}%</span>
              </div>
              <div style="width:100%; height:4px; background:var(--bg-color); border-radius:2px; margin-bottom:24px; overflow:hidden;">
                <div style="height:100%; background:var(--brand-primary); width:${c.prog}%; ${!isDisabled ? 'animation: ddBarFill 0.8s cubic-bezier(0.16, 1, 0.3, 1) ' + (delay + 0.3) + 's both;' : ''}"></div>
              </div>
              <button style="margin-top:auto; background:${isDisabled ? '#333' : '#FFDF85'}; color:${isDisabled ? '#666' : '#111'}; font-weight:700; border:none; border-radius:6px; padding:12px; width:100%; cursor:${isDisabled ? 'not-allowed' : 'pointer'}; font-size:14px; transition:all 0.2s;" ${isDisabled ? 'disabled' : `onclick="v3App.showToast('Opening ${c.title}...', 'info')"`} ${!isDisabled ? 'onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1"' : ''}>${c.cta}</button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  openSessionDetail(id) {
    const session = this.state.sessions.find(s => s.id === id);
    if (!session) return;
    this.currentSessionId = id;
    this.switchView('session-detail');
    document.getElementById('sd-title').textContent = session.name;
    document.getElementById('sd-subtitle').textContent = (session.status === 'draft' || session.status === 'upcoming') ? 'Draft Mode: Prepare candidates and vouchers.' : 'Review enrolled candidates and learning materials.';

    const topActions = document.getElementById('sd-top-actions');
    const voucherWarning = document.getElementById('sd-voucher-warning');
    const tabsContainer = document.getElementById('sd-tabs-container');
    const contentMaterials = document.getElementById('sd-content-materials');

    if (session.status === 'draft' || session.status === 'upcoming') {
      const btnText = session.status === 'draft' ? 'Save Class' : 'Start Class';
      const actionFn = session.status === 'draft' ? `v3App.showToast('Class Saved Successfully', 'success'); v3App.switchView('sessions');` : `v3App.startSession('${id}')`;
      
      topActions.innerHTML = `
        <button class="btn btn-secondary" onclick="v3App.openFormDrawer('candidate')"><i class="material-icons-outlined">person_add</i> Add Candidate</button>
        <button class="btn btn-primary" onclick="${actionFn}">${btnText}</button>
      `;
      // Mock logic: randomly decide if candidates > vouchers
      const hasInsufficientVouchers = Math.random() > 0.5;
      if (hasInsufficientVouchers) {
        voucherWarning.style.display = 'flex';
      } else {
        voucherWarning.style.display = 'none';
      }
    } else {
      topActions.innerHTML = ``;
      voucherWarning.style.display = 'none';
    }

    if (session.status === 'draft' || session.status === 'upcoming' || session.status === 'completed') {
      tabsContainer.style.display = 'none';
    } else {
      tabsContainer.style.display = 'flex';
      document.getElementById('sd-tab-materials').style.display = 'block';
    }
    this.switchSessionDetailTab('candidates');
  },

  switchSessionDetailTab(tab) {
    document.getElementById('sd-tab-candidates').style.background = tab === 'candidates' ? 'var(--brand-active)' : 'transparent';
    document.getElementById('sd-tab-candidates').style.color = tab === 'candidates' ? 'var(--brand-primary)' : 'var(--text-secondary)';
    document.getElementById('sd-tab-candidates').style.borderBottomColor = tab === 'candidates' ? 'var(--brand-primary)' : 'transparent';

    document.getElementById('sd-tab-materials').style.background = tab === 'materials' ? 'var(--brand-active)' : 'transparent';
    document.getElementById('sd-tab-materials').style.color = tab === 'materials' ? 'var(--brand-primary)' : 'var(--text-secondary)';
    document.getElementById('sd-tab-materials').style.borderBottomColor = tab === 'materials' ? 'var(--brand-primary)' : 'transparent';

    document.getElementById('sd-content-candidates').style.display = tab === 'candidates' ? 'block' : 'none';
    document.getElementById('sd-content-materials').style.display = tab === 'materials' ? 'block' : 'none';

    if (tab === 'candidates') this.renderSessionDetailCandidates();
    if (tab === 'materials') this.renderSessionDetailMaterials();
  },

  renderSessionDetailCandidates() {
    const session = this.state.sessions.find(s => s.id === this.currentSessionId);
    if (!session) return;

    // Filter candidates for this session, or show a subset for demo
    const cands = this.state.candidates.slice(0, session.candidateCount || 4);
    const thead = document.getElementById('sd-candidates-thead');
    const tbody = document.getElementById('sd-candidates-tbody');
    
    if (session.status === 'draft' || session.status === 'upcoming') {
      thead.innerHTML = `
        <tr>
          <th>Candidate Name</th>
          <th>ID / Roll No</th>
          <th>Exam Mode</th>
          <th>Retake Mode</th>
          <th style="min-width:200px;">Accommodations</th>
          <th>Voucher Code / Status</th>
          <th>Actions</th>
        </tr>
      `;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      
      // We will expose a global function for accommodation toggle to avoid inline complexity
      if (!window.toggleAccom) {
        window.toggleAccom = function(checkbox, candId) {
           const container = document.getElementById('accom-container-' + candId);
           if (checkbox.checked) {
             container.style.display = 'block';
           } else {
             container.style.display = 'none';
           }
        }
      }

      tbody.innerHTML = cands.map(c => `
        <tr>
          <td><div style="font-weight:600; font-size:14px;">${c.name}</div></td>
          <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
          
          <!-- Exam Mode -->
          <td>
            <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);">
              <option>In Class</option>
              <option>Online</option>
            </select>
          </td>
          
          <!-- Retake Mode -->
          <td>
            <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);">
              <option>Not Eligible</option>
              <option>In Class</option>
              <option>Online</option>
            </select>
          </td>
          
          <!-- Accommodations -->
          <td>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer;">
                <input type="checkbox" onchange="window.toggleAccom(this, '${c.id}')"> Enable
              </label>
              <div id="accom-container-${c.id}" style="display:none; animation: fadeSlideUp 0.2s ease;">
                <input type="text" placeholder="Reason..." style="width:100%; padding:4px 8px; font-size:11px; border:1px solid var(--border-color); border-radius:4px; margin-bottom:4px; background:var(--bg-color);">
                <button class="btn btn-primary" style="padding:2px 8px; font-size:11px; width:100%;" onclick="v3App.showToast('Accommodation Saved', 'success')">Save</button>
              </div>
            </div>
          </td>
          
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge" style="background:var(--border-light); color:var(--text-secondary); font-family:monospace;">${c.voucherCode || 'UNASSIGNED'}</span>
              ${!c.voucherCode ? '<span class="badge badge-warning">Unassigned</span>' : ''}
            </div>
          </td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="v3App.showToast('Voucher Redeemed', 'success')">Redeem</button>
              <button class="icon-button" style="color:var(--status-error); padding:4px;" onclick="v3App.showToast('Candidate removed from draft', 'info')"><i class="material-icons-outlined" style="font-size:18px;">delete</i></button>
            </div>
          </td>
        </tr>
      `).join('');
        } else if (session.status === 'ongoing') {
      thead.innerHTML = `
        <tr>
          <th>Candidate Name & Email</th>
          <th>ID / Roll No</th>
          <th>Voucher Status</th>
          <th style="min-width:140px;">Learning Progress</th>
          <th>Accommodations</th>
          <th>Exam Mode</th>
          <th>Retake Eligible</th>
          <th>Action</th>
        </tr>
      `;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      
      tbody.innerHTML = cands.map((c, idx) => {
        // Mock specific states for the prompt
        let vStatus = 'Active';
        let vBadge = '<span class="badge badge-success">Active</span>';
        let progBar = `<div style="width:100%; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:${c.learningProgress||45}%; height:100%; background:var(--brand-primary);"></div></div>`;
        
        if (idx === 1) {
          vStatus = 'Unused';
          vBadge = '<span class="badge" style="background:var(--bg-color); border:1px solid var(--border-color);">Unused</span>';
          progBar = `<div style="width:100%; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:0%; height:100%; background:var(--brand-primary);"></div></div>`;
        } else if (idx === 2) {
          vStatus = 'Not Assigned';
          vBadge = '<button class="btn btn-primary" style="padding:4px 8px; font-size:11px;">Assign Voucher</button>';
          progBar = `<span style="color:var(--text-tertiary);">--</span>`;
        }
        
        let accomHtml = `<span class="badge" style="background:var(--bg-color); border:1px solid var(--border-color);">NO</span>`;
        if (idx === 0) {
          accomHtml = `<span class="badge badge-warning" title="Extended time (1.5x) required due to documented IEP.">YES</span>`;
        }
        
        return `
        <tr style="cursor:pointer;" onclick="if(event.target.tagName !== 'SELECT' && event.target.tagName !== 'BUTTON') v3App.openLearningDeepDive('${c.id}', '${c.name}', '${session.name}', ${c.learningProgress||45})">
          <td>
            <div style="font-weight:600; font-size:14px; color:var(--text-primary);">${c.name}</div>
            <div style="font-size:12px; color:var(--text-secondary);">${c.email || 'student@domain.com'}</div>
          </td>
          <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
          
          <!-- Voucher Status -->
          <td>${vBadge}</td>
          
          <!-- Learning Material Progress -->
          <td>${progBar}</td>
          
          <!-- Accommodations -->
          <td>${accomHtml}</td>
          
          <!-- Exam Mode -->
          <td><span style="font-size:13px; font-weight:600;">${idx%2===0?'In-Class':'Online'}</span></td>
          
          <!-- Retake Config -->
          <td>
            <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onclick="event.stopPropagation();">
              <option>YES</option>
              <option>NO</option>
            </select>
          </td>
          
          <!-- Row Action -->
          <td>
            <button class="icon-button" style="color:var(--status-error); padding:4px;" onclick="event.stopPropagation(); v3App.showToast('Candidate removed from active roster', 'info')">
              <i class="material-icons-outlined" style="font-size:18px;">delete</i>
            </button>
          </td>
        </tr>
      `}).join('');

    } else if (session.status === 'completed') {
      thead.innerHTML = `
        <tr>
          <th>Candidate Name</th>
          <th>Email ID</th>
          <th>ID / Roll No</th>
          <th>Score (out of 100)</th>
          <th>Result</th>
          <th>Flags / Incident</th>
          <th>Retake Status</th>
        </tr>
      `;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = cands.map(c => {
        // Mock data generation
        const score = Math.floor(Math.random() * 100);
        let result = '';
        let resultClass = '';
        let retakeDate = '--';
        
        if (score > 75) {
          result = 'Passed';
          resultClass = 'badge-success';
        } else if (score > 40) {
          result = 'Failed';
          resultClass = 'badge-error';
          // Mock retake date
          const date = new Date();
          date.setDate(date.getDate() + 7);
          retakeDate = date.toLocaleDateString();
        } else {
          result = 'Suspended';
          resultClass = 'badge-error';
        }
        
        // Mock flags
        const flagsCount = Math.floor(Math.random() * 3);
        let flagsHtml = '--';
        if (flagsCount > 0) {
          const reasons = ['Multiple Faces', 'Looking Away', 'Background Noise'];
          const reason = reasons[Math.floor(Math.random() * reasons.length)];
          flagsHtml = `<div style="display:flex; flex-direction:column; gap:4px;">
            <span style="color:var(--status-error); font-weight:600; font-size:12px;">${flagsCount} Flag(s)</span>
            <span style="font-size:11px; color:var(--text-secondary);">${reason}</span>
          </div>`;
        }
        
        return `
          <tr>
            <td><div style="font-weight:600; font-size:14px;">${c.name}</div></td>
            <td style="font-size:13px; color:var(--text-secondary);">${c.email}</td>
            <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
            <td style="font-weight:600; font-variant-numeric: tabular-nums;">${score} / 100</td>
            <td><span class="badge ${resultClass}">${result}</span></td>
            <td>${flagsHtml}</td>
            <td>
              <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onchange="v3App.showToast('Retake status updated.', 'success')">
                <option>Not Eligible</option>
                <option>In Class</option>
                <option>Online</option>
              </select>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      thead.innerHTML = `
        <tr>
          <th>Candidate Name</th>
          <th>Email ID</th>
          <th>ID / Roll No</th>
          <th>Voucher Status</th>
          <th>Learning Progress</th>
          <th>Accommodations</th>
          <th>Exam Mode</th>
          <th>Retake Config</th>
          <th>Actions</th>
        </tr>
      `;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = cands.map(c => {
        const voucherStatuses = ['Active', 'Unused', 'Not Assigned'];
        const vStatus = voucherStatuses[Math.floor(Math.random() * voucherStatuses.length)];
        
        let vBadge = '';
        let progressHtml = '';
        
        if (vStatus === 'Not Assigned') {
          vBadge = `<button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="event.stopPropagation(); v3App.showToast('Voucher Assigned', 'success')">Assign Voucher</button>`;
          progressHtml = `<span style="color:var(--text-secondary);">-- (Locked)</span>`;
        } else {
          vBadge = `<span class="badge ${vStatus === 'Active' ? 'badge-success' : 'badge-info'}">${vStatus}</span>`;
          const prog = Math.floor(Math.random() * 80) + 10;
          progressHtml = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12px; font-weight:600;">${prog}%</span>
              <div style="flex:1; height:4px; background:var(--border-light); border-radius:2px; overflow:hidden;">
                <div style="width:${prog}%; height:100%; background:var(--brand-primary);"></div>
              </div>
            </div>`;
        }

        const accommYes = Math.random() > 0.7;
        const accommHtml = accommYes ? 
          `<span class="badge badge-warning" style="cursor:help;" title="Extended time (1.5x)">YES</span>` : 
          `<span class="badge" style="background:var(--border-light); color:var(--text-secondary);">NO</span>`;

        return `
          <tr style="cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='var(--hover-bg)'" onmouseout="this.style.background=''" onclick="v3App.openLearningDeepDive('${c.id}', '${vStatus}')">
            <td><div style="font-weight:600; font-size:14px;">${c.name}</div></td>
            <td style="font-size:13px; color:var(--text-secondary);">${c.email}</td>
            <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
            <td>${vBadge}</td>
            <td style="min-width:120px;">${progressHtml}</td>
            <td>${accommHtml}</td>
            <td><span class="badge" style="background:var(--bg-color); border:1px solid var(--border-color); color:var(--text-primary);">In-Class</span></td>
            <td onclick="event.stopPropagation();">
              <div style="display:flex; align-items:center; gap:8px;">
                <label class="switch" style="transform:scale(0.8); margin:0;">
                  <input type="checkbox" onchange="this.parentElement.nextElementSibling.style.display = this.checked ? 'block' : 'none'">
                  <span class="switch-slider"></span>
                </label>
                <select style="display:none; padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);">
                  <option>In Class</option>
                  <option>Online</option>
                </select>
              </div>
            </td>
            <td onclick="event.stopPropagation();">
              <button class="icon-button" style="color:var(--status-error); padding:4px;" onclick="v3App.showToast('Candidate removed', 'info')"><i class="material-icons-outlined" style="font-size:18px;">delete</i></button>
            </td>
          </tr>
        `;
      }).join('');
    }

  },

  renderSessionDetailMaterials() {
    const session = this.state.sessions.find(s => s.id === this.currentSessionId);
    const grid = document.getElementById('sd-materials-grid');
    const materials = this.state.materials || [];

    if (materials.length === 0) {
      grid.innerHTML = '<div style="text-align:center; padding:32px; color:var(--text-secondary);">No materials attached to this session.</div>';
      return;
    }

    // For ongoing sessions, use the Split-Action Asset Card framework
    if (session && session.status === 'ongoing') {
      const cands = this.state.candidates.slice(0, session.candidateCount || 4);
      const thumbMap = { 'document': '/thumb_food_safety.png', 'ebook': '/thumb_food_safety.png', 'video': '/thumb_culinary.png', 'podcast': '/thumb_culinary.png', 'flashcard': '/thumb_haccp.png', 'practice exam': '/thumb_practice_exam.png' };
      const thumbFallbacks = ['/thumb_food_safety.png', '/thumb_haccp.png', '/thumb_allergen.png', '/thumb_culinary.png', '/thumb_practice_exam.png'];

      grid.innerHTML = '<div class="asset-card-grid">' + materials.map((m, i) => {
        const type = (m.type || 'ebook').toLowerCase();
        let icon = 'menu_book', ctaText = 'Read';
        if (type === 'video') { icon = 'play_circle'; ctaText = 'Watch'; }
        else if (type === 'podcast') { icon = 'mic'; ctaText = 'Listen'; }
        else if (type === 'flashcard') { icon = 'style'; ctaText = 'Review Cards'; }
        else if (type === 'practice exam') { icon = 'quiz'; ctaText = 'Start Exam'; }

        let lbl1, lbl2, lbl3;
        if (type === 'video' || type === 'podcast') { lbl1='Watched'; lbl2='Watching'; lbl3='Not Started'; }
        else if (type === 'practice exam') { lbl1='Passed'; lbl2='In-Progress'; lbl3='Failed'; }
        else if (type === 'flashcard') { lbl1='Mastered'; lbl2='Reviewing'; lbl3='Not Started'; }
        else { lbl1='Completed'; lbl2='Reading'; lbl3='Not Started'; }

        const thumb = m.thumb || thumbMap[type] || thumbFallbacks[i % thumbFallbacks.length];
        const c1 = Math.floor(Math.random()*6+4), c2 = Math.floor(Math.random()*5+2), c3 = Math.floor(Math.random()*3), c4 = Math.floor(Math.random()*2);
        const avgProg = Math.floor(Math.random()*30+55);

        // Build tooltip names from the session candidates
        const ttNames = cands.map(c => '<div class="tt-item"><span>' + c.name + '</span><span>(' + Math.floor(Math.random()*100) + '%)</span></div>').join('');

        return '<div class="asset-card" style="animation-delay:' + (i * 0.08) + 's;">' +
          '<img src="' + thumb + '" class="asset-cover" alt="Thumbnail">' +
          '<div class="asset-header">' +
            '<div class="asset-title">' + m.title + '</div>' +
            '<div class="asset-meta"><i class="material-icons-outlined" style="font-size:14px;">' + icon + '</i> ' + (m.type || 'Ebook') + ' • ' + (m.duration || '120 mins') + ' total</div>' +
          '</div>' +
          '<div class="asset-toggles">' +
            '<button class="asset-toggle-btn active" onclick="this.parentElement.children[0].classList.add(\x27active\x27);this.parentElement.children[1].classList.remove(\x27active\x27);document.getElementById(\x27sd-card-view-' + m.id + '\x27).style.display=\x27flex\x27;document.getElementById(\x27sd-card-prog-' + m.id + '\x27).style.display=\x27none\x27;"><i class="material-icons-outlined" style="font-size:16px; vertical-align:text-bottom;">construction</i> View Material</button>' +
            '<button class="asset-toggle-btn" onclick="this.parentElement.children[1].classList.add(\x27active\x27);this.parentElement.children[0].classList.remove(\x27active\x27);document.getElementById(\x27sd-card-view-' + m.id + '\x27).style.display=\x27none\x27;document.getElementById(\x27sd-card-prog-' + m.id + '\x27).style.display=\x27flex\x27;"><i class="material-icons-outlined" style="font-size:16px; vertical-align:text-bottom;">analytics</i> Candidate Progress</button>' +
          '</div>' +
          '<div class="asset-body" id="sd-card-view-' + m.id + '">' +
            '<div class="asset-kpi-row">' +
              '<div class="asset-kpi"><div class="asset-kpi-val">' + (c1+c2+c3+c4) + '</div><div class="asset-kpi-lbl">Assigned</div></div>' +
              '<div class="asset-kpi"><div class="asset-kpi-val" style="color:var(--brand-primary);">' + avgProg + '%</div><div class="asset-kpi-lbl">Avg. Complete</div></div>' +
              '<div class="asset-kpi"><div class="asset-kpi-val" style="color:var(--status-success);">' + c2 + '</div><div class="asset-kpi-lbl">Active Now</div></div>' +
            '</div>' +
            '<div style="margin-bottom:16px;">' +
              '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;"><span style="color:var(--text-secondary);">Overall Class Progress</span><span style="font-weight:700; color:var(--brand-primary);">' + avgProg + '%</span></div>' +
              '<div style="height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div class="asset-prog-fill" style="width:' + avgProg + '%; height:100%; background:var(--brand-primary);"></div></div>' +
            '</div>' +
            '<div style="font-size:11px; color:var(--text-tertiary); margin-bottom:16px; display:flex; align-items:center; gap:4px;"><i class="material-icons-outlined" style="font-size:12px;">schedule</i> Last updated: ' + new Date().toLocaleDateString() + '</div>' +
            '<button class="asset-cta" onclick="v3App.showToast(\x27Launching Material...\x27, \x27success\x27)">' + ctaText + '</button>' +
          '</div>' +
          '<div class="asset-body" id="sd-card-prog-' + m.id + '" style="display:none; padding:12px;">' +
            '<div class="batch-list-item" onclick="v3App.openBatchModal(\x27Batch 2026 - A (' + session.name.split(' — ')[0] + ')\x27, \x27' + btoa('<div class="prog-grid">' +
              '<div class="prog-col"><div class="prog-val lbl-green">' + c1 + '</div><div class="prog-lbl">' + lbl1 + '</div><div class="tt-list">' + ttNames + '</div></div>' +
              '<div class="prog-col"><div class="prog-val lbl-cyan">' + c2 + '</div><div class="prog-lbl">' + lbl2 + '</div><div class="tt-list">' + ttNames + '</div></div>' +
              '<div class="prog-col"><div class="prog-val lbl-grey">' + c3 + '</div><div class="prog-lbl">' + lbl3 + '</div></div>' +
              '<div class="prog-col" style="cursor:default;"><div class="prog-val lbl-muted">' + c4 + '</div><div class="prog-lbl lbl-muted">No Voucher</div></div>' +
            '</div>') + '\x27)">' +
              '<div style="font-weight:600; font-size:14px;">Batch 2026 - A (' + session.name.split(' — ')[0] + ')</div>' +
              '<i class="material-icons-outlined">chevron_right</i>' +
            '</div>' +
            '<div class="batch-list-item" onclick="v3App.openBatchModal(\x27Batch 2026 - B (Retakes)\x27, \x27' + btoa('<div class="prog-grid">' +
              '<div class="prog-col"><div class="prog-val lbl-green">' + Math.floor(c1/2) + '</div><div class="prog-lbl">' + lbl1 + '</div></div>' +
              '<div class="prog-col"><div class="prog-val lbl-cyan">' + Math.floor(c2/2) + '</div><div class="prog-lbl">' + lbl2 + '</div></div>' +
              '<div class="prog-col"><div class="prog-val lbl-grey">' + Math.floor(c3/2) + '</div><div class="prog-lbl">' + lbl3 + '</div></div>' +
              '<div class="prog-col" style="cursor:default;"><div class="prog-val lbl-muted">' + Math.floor(c4/2) + '</div><div class="prog-lbl lbl-muted">No Voucher</div></div>' +
            '</div>') + '\x27)">' +
              '<div style="font-weight:600; font-size:14px;">Batch 2026 - B (Retakes)</div>' +
              '<i class="material-icons-outlined">chevron_right</i>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
      return;
    }

    // For non-ongoing sessions, keep the existing category-based layout
    const categories = ['FAQs', 'E-books', 'Audios', 'Videos', 'Practice Tests'];
    
    grid.innerHTML = categories.map(cat => {
      const catMats = materials.filter(m => {
         if (cat === 'Videos' && m.type === 'video') return true;
         if (cat === 'E-books' && m.type === 'document') return true;
         return false;
      });
      const items = catMats.length > 0 ? catMats : [{ title: 'Sample ' + cat + ' Resource', desc: 'Essential ' + cat.toLowerCase() + ' for exam preparation.', icon: cat === 'Videos' ? 'play_circle' : cat === 'Audios' ? 'headphones' : cat === 'Practice Tests' ? 'quiz' : 'menu_book' }];

      return '<div>' +
          '<h3 style="font-size:14px; font-weight:600; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px; display:flex; align-items:center; gap:8px;">' +
            cat + ' <span class="badge" style="background:var(--border-light); color:var(--text-secondary); font-size:10px;">VIEW ONLY</span>' +
          '</h3>' +
          '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">' +
            items.map(m => '<div style="background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px; padding:16px; display:flex; align-items:flex-start; gap:12px;">' +
                '<i class="material-icons-outlined" style="color:var(--brand-primary); font-size:24px;">' + (m.icon || 'menu_book') + '</i>' +
                '<div><div style="font-size:14px; font-weight:600; margin-bottom:4px;">' + m.title + '</div><div style="font-size:12px; color:var(--text-secondary);">' + m.desc + '</div></div>' +
              '</div>').join('') +
          '</div>' +
        '</div>';
    }).join('');
  },

  closeDrawer() {
    document.getElementById('drawer-overlay').classList.remove('open');
    document.getElementById('universal-drawer').classList.remove('open');
  },

  // ==========================================================================
  // UTILITIES
  // ==========================================================================
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `<i class="material-icons-outlined">${icon}</i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  simulateCsvUpload() {
    this.showToast('Uploading CSV...', 'info');
    setTimeout(() => {
      this.fetchData(); // Re-fetch to simulate new data arrival
      this.showToast('Import successful. Candidates refreshed.', 'success');
    }, 1500);
  },

  assignVoucher(candId) {
    this.showToast('Voucher generation requested...', 'info');
    setTimeout(() => {
      // Optimistic mock update for UI
      const cand = this.state.candidates.find(c => c.id === candId);
      if (cand) cand.voucherCode = 'VCH-' + Math.floor(Math.random()*10000);
      this.renderCandidates('all');
      this.openCandidateDrawer(candId); // Refresh drawer
      this.showToast('Voucher successfully assigned.', 'success');
    }, 800);
  }
,

  openSessionSupervisor(cId) {
    let c = this.state.monitorState.candidates.find(x => x.id === cId) || this.state.candidates.find(x => x.id === cId);
    if(!c) return;

    let overlay = document.getElementById('session-supervisor-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'session-supervisor-modal';
      overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;';
      document.body.appendChild(overlay);
    }
    
    // The exact UI styling from the user's screenshot
    overlay.innerHTML = `
      <div style="background:var(--surface-color); color:var(--text-primary); width:450px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); overflow:hidden; font-family:var(--font-sans);">
        
        <!-- Header -->
        <div style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color);">
          <h2 style="font-size:16px; margin:0; font-weight:700; display:flex; align-items:center; gap:8px;">
            <i class="material-icons" style="color:var(--brand-primary); font-size:18px;">videocam</i> Candidate Class Supervisor
          </h2>
          <button onclick="document.getElementById('session-supervisor-modal').style.display='none'" style="background:transparent; border:none; cursor:pointer; font-size:18px; color:var(--text-tertiary);">&times;</button>
        </div>
        
        <div style="padding:24px;">
          <!-- Candidate Info -->
          <div style="background:var(--bg-color); padding:16px; border-radius:8px; display:flex; align-items:center; gap:16px; margin-bottom:24px;">
            <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--text-primary);">${c.name}</div>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">Exam Class • ID: ${c.id}</div>
            </div>
          </div>
          
          <!-- 1. Dispatch Preset Direct Warning -->
          <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; color:var(--text-primary);">1. Dispatch Preset Direct Warning</h3>
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:24px;">
            <button onclick="v3App.showToast('Warning sent', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="display:flex; align-items:center; justify-content:flex-start; text-align:left; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px 12px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:12px;">visibility</i>
              "Keep eyes aligned with exam window"
            </button>
            <button onclick="v3App.showToast('Warning sent', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="display:flex; align-items:center; justify-content:flex-start; text-align:left; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px 12px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:12px;">volume_off</i>
              "Testing room must remain silent"
            </button>
            <button onclick="v3App.showToast('Warning sent', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="display:flex; align-items:center; justify-content:flex-start; text-align:left; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px 12px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:12px;">fullscreen</i>
              "Return to primary full-screen"
            </button>
            
            <div style="display:flex; gap:8px; margin-top:4px;">
              <input type="text" style="flex:1; padding:10px 12px; border-radius:6px; border:1px solid var(--border-color); font-size:13px; outline:none;" placeholder="Type a custom warning message">
              <button style="background:var(--brand-primary); color:var(--on-pri); border:none; padding:10px 16px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="v3App.showToast('Custom warning sent.', 'success'); document.getElementById('session-supervisor-modal').style.display='none'">Send</button>
            </div>
          </div>
          
          <!-- 2. Direct Session Controls -->
          <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; color:var(--text-primary);">2. Direct Class Controls</h3>
          <div style="display:flex; gap:12px; margin-bottom:24px;">
            <button onclick="v3App.showToast('Exam paused.', 'warning'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer;">
              <i class="material-icons" style="color:var(--text-primary); font-size:16px; margin-right:8px;">pause</i> Pause Exam
            </button>
            <button onclick="v3App.showToast('Feed suspended.', 'error'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--status-error); color:var(--status-error); padding:10px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer;">
              <i class="material-icons-outlined" style="font-size:16px; margin-right:8px;">cancel</i> Suspend Feed
            </button>
          </div>
          
          <!-- 3. Support Escalation Channels -->
          <h3 style="font-size:13px; font-weight:700; margin-bottom:12px; color:var(--text-primary);">3. Support Escalation Channels</h3>
          <div style="display:flex; gap:12px;">
            <button onclick="v3App.showToast('IT Support notified.', 'info'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:8px;">build</i> IT Support
            </button>
            <button onclick="v3App.showToast('Alert Chairman notified.', 'info'); document.getElementById('session-supervisor-modal').style.display='none'" style="flex:1; display:flex; justify-content:center; align-items:center; background:var(--surface-color); border:1px solid var(--brand-primary); color:var(--text-primary); padding:10px; border-radius:6px; font-size:13px; cursor:pointer;">
              <i class="material-icons-outlined" style="color:var(--text-secondary); font-size:16px; margin-right:8px;">person</i> Alert Chairman
            </button>
          </div>
        </div>
      </div>
    `;
    overlay.style.display = 'flex';
  }

};

document.addEventListener('DOMContentLoaded', () => {
  v3App.init();
});
