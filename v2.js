/**
 * InClass Proctor V2 - Main Application Logic
 */

const v2App = {
  // Mock Data
  data: {
    candidates: [],
    sessions: [],
    incidents: [],
    activities: [],
    courses: [],
    dashboard: null
  },
  currentSort: { col: null, asc: true },

  async init() {
    await this.fetchLiveSystemData();
    this.bindEvents();
    this.renderDashboard();
    this.renderCandidates('all');
    this.renderSessions('all');

    // Close action menus when clicking outside
    document.addEventListener('click', (e) => {
       if (!e.target.closest('.action-cell')) {
          document.querySelectorAll('.action-dropdown').forEach(m => m.style.display = 'none');
       }
    });
  },

  async fetchLiveSystemData() {
    try {
      // Fetch all required data in parallel
      const [candidates, sessions, dashboard] = await Promise.all([
        fetch('/api/candidates').then(r => r.json()),
        fetch('/api/sessions').then(r => r.json()),
        fetch('/api/dashboard').then(r => r.json())
      ]);

      // Handle incidents from dashboard if available
      let activities = [];
      if (dashboard.pendingIncidents) {
        activities = dashboard.pendingIncidents.map(inc => ({
          time: new Date(inc.timestamp).toLocaleTimeString(),
          text: `Incident: ${inc.type} - ${inc.candidateName}`
        }));
      }

      this.data.candidates = candidates || [];
      this.data.sessions = sessions || [];
      this.data.dashboard = dashboard || null;
      this.data.activities = activities;
      this.data.incidents = dashboard?.pendingIncidents || [];
    } catch (e) {
      console.error("Failed to fetch live data:", e);
      this.showToast("Failed to fetch live system data.", "error");
    }
  },

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.showSection(e.currentTarget.dataset.target);
      });
    });

    // Candidate Filter Chips
    document.querySelectorAll('.filter-chips .chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderCandidates(e.currentTarget.textContent.toLowerCase().trim());
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-t') === 'dark';
      html.setAttribute('data-t', isDark ? 'light' : 'dark');
      themeBtn.querySelector('i').textContent = isDark ? 'dark_mode' : 'light_mode';
    });

    // Session Tabs
    document.querySelectorAll('.stage-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        // Only run for session view tabs, not detail view tabs
        if (!e.currentTarget.closest('#view-sessions') && !e.currentTarget.closest('#view-session-detail')) return;
        const parent = e.currentTarget.parentNode;
        parent.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (e.currentTarget.dataset.stage) {
          this.renderSessions(e.currentTarget.dataset.stage);
        }
      });
    });

    // Session Detail Tabs
    document.querySelectorAll('#sd-tabs .stage-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('#sd-tabs .stage-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderSessionDetailTab(e.currentTarget.dataset.tab);
      });
    });

    // Settings Tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderSettingsTab(e.currentTarget.dataset.tab);
      });
    });
  },

  showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`view-${sectionId}`).classList.add('active');
    
    // Update active nav button if triggered programmatically
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.target === sectionId);
    });
  },

  renderDashboard() {
    if (!this.data.dashboard) return;
    
    // Check for actionable items (mocking based on empty vouchers or incomplete profiles)
    const actionableCandidates = this.data.candidates.filter(c => !c.voucherCode).length;
    
    const actFeed = document.getElementById('dash-actionable-feed');
    if (!actFeed) return;
    
    let feedHTML = '';
    
    if (actionableCandidates > 0) {
      feedHTML += `
        <div style="background:var(--err-con); border-left:4px solid var(--err); padding:16px; border-radius:var(--radius-sm); cursor:pointer;" onclick="v2App.showSection('candidates')">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
             <strong style="color:var(--err); font-size:14px; display:flex; align-items:center; gap:8px;"><i class="material-icons-outlined" style="font-size:18px;">warning</i> Unassigned Vouchers</strong>
             <span style="font-size:12px; color:var(--on-sur-var);">Just now</span>
          </div>
          <p style="font-size:13px; margin-top:8px; color:var(--on-sur-var);">${actionableCandidates} candidates are missing vouchers. Click to resolve.</p>
        </div>
      `;
    }
    
    if (this.data.dashboard.pendingIncidentCount > 0) {
      feedHTML += `
        <div style="background:var(--pri-con); border-left:4px solid var(--pri); padding:16px; border-radius:var(--radius-sm); margin-top:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
             <strong style="color:var(--pri-dk); font-size:14px; display:flex; align-items:center; gap:8px;"><i class="material-icons-outlined" style="font-size:18px;">receipt_long</i> Pending Incidents</strong>
             <span style="font-size:12px; color:var(--on-sur-var);">Action required</span>
          </div>
          <p style="font-size:13px; margin-top:8px; color:var(--on-sur-var);">${this.data.dashboard.pendingIncidentCount} incidents need your review.</p>
        </div>
      `;
    }
    
    actFeed.innerHTML = feedHTML;
  },

  renderCandidates(filter) {
    const tbody = document.getElementById('candidates-tbody');
    if (!tbody) return;
    
    let filtered = this.data.candidates;
    if (filter === 'enrolled') {
      filtered = this.data.candidates.filter(c => c.examStatus === 'enrolled' || c.examStatus === 'exam_scheduled');
    } else if (filter === 'learning') {
      filtered = this.data.candidates.filter(c => c.examStatus === 'in_progress');
    } else if (filter === 'completed') {
      filtered = this.data.candidates.filter(c => c.examStatus === 'completed' || c.examStatus === 'suspended');
    }
    
    // Sort logic (if active)
    if (this.currentSort.col) {
      filtered.sort((a, b) => {
        let valA = a[this.currentSort.col];
        let valB = b[this.currentSort.col];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return this.currentSort.asc ? -1 : 1;
        if (valA > valB) return this.currentSort.asc ? 1 : -1;
        return 0;
      });
    }

    tbody.innerHTML = filtered.map(c => {
      // Map API fields to UI format
      const sessionsCount = c.sessions ? c.sessions : 1; 
      const examDate = c.enrolledAt ? new Date(c.enrolledAt).toLocaleDateString() : '--';

      let vStatus = (c.voucherStatus || '').toLowerCase();
      let isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
      let isPending = vStatus === 'pending' || vStatus === 'assigned';
      let isActivated = vStatus === 'activated' || vStatus === 'redeemed';

      if (!c.voucherCode && !isUnassigned) c.voucherCode = 'VOUCH-' + Math.floor(Math.random()*9000+1000);
      
      let voucherHtml = '';
      if (isUnassigned) {
        voucherHtml = `<span style="color:var(--err); font-size:12px; font-weight:600;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span>`;
      } else if (isPending) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-family:var(--font-mono); font-size:12px; background:var(--sur-var); padding:4px 8px; border-radius:4px;">${c.voucherCode || 'PENDING'}</span><span class="status-chip pending" style="padding:2px 6px; font-size:10px;">Pending</span></div>`;
      } else if (isActivated) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-family:var(--font-mono); font-size:12px; background:var(--sur-var); padding:4px 8px; border-radius:4px;">${c.voucherCode || 'REDEEMED'}</span><span class="status-chip success" style="padding:2px 6px; font-size:10px;">Activated</span></div>`;
      } else {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-family:var(--font-mono); font-size:12px; background:var(--sur-var); padding:4px 8px; border-radius:4px;">${c.voucherCode || 'VOUCH'}</span><span class="status-chip" style="padding:2px 6px; font-size:10px;">${c.voucherStatus}</span></div>`;
      }

      let sessionStatusHtml = this.formatStatus(c.examStatus || c.status);
      if (c.examStatus === 'in_progress') sessionStatusHtml = `<span class="status-chip pending">Active</span>`;

      return `
      <tr onclick="if(!event.target.closest('input')) v2App.openCandidateDetail('${c.id}')" style="cursor:pointer;">
        <td><input type="checkbox" value="${c.id}" aria-label="Select ${c.name}" class="cand-checkbox" onclick="event.stopPropagation(); v2App.updateBulkActionState()"></td>
        <td>
          <div class="cand-cell">
            <img src="${c.photo || 'https://via.placeholder.com/150'}" alt="${c.name}" class="cand-avatar">
            <strong>${c.name}</strong>
          </div>
        </td>
        <td><span style="font-family:var(--font-mono); color:var(--on-sur-var);">${c.rollNo || c.id}</span></td>
        <td>${voucherHtml}</td>
        <td>${sessionStatusHtml}</td>
        <td>${sessionsCount}</td>
        <td>${c.examStatus !== 'completed' ? examDate : '--'}</td>
      </tr>
      `;
    }).join('');
    
    this.updateBulkActionState();
  },

  renderSessions(filter) {
    const container = document.getElementById('session-grid-container');
    const filtered = filter === 'all' ? this.data.sessions : this.data.sessions.filter(s => (s.status || s.state) === filter);
    
    container.innerHTML = filtered.map(s => {
      const state = s.status || s.state;
      const dateStr = s.examDate ? new Date(s.examDate).toLocaleString() : s.date;
      const candCount = s.candidateCount || s.candidates || 0;
      const readiness = s.readiness || 0;

      return `
      <div class="session-card glass-panel">
        <div class="session-card-header">
          <span class="status-chip ${this.getStateClass(state)}" style="margin-bottom:8px; display:inline-block;">${state.toUpperCase()}</span>
          <button class="icon-btn" style="width:24px; height:24px;"><i class="material-icons">more_horiz</i></button>
        </div>
        <h4>${s.name}</h4>
        <div class="session-meta" style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--on-sur-var);">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="display:flex; align-items:center; gap:4px;"><i class="material-icons-outlined" style="font-size:14px;">calendar_today</i> Created</span>
            <strong style="color:var(--on-sur);">Oct 12, 2026</strong>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="display:flex; align-items:center; gap:4px;"><i class="material-icons-outlined" style="font-size:14px;">event</i> Exam Date</span>
            <strong style="color:var(--on-sur);">${dateStr}</strong>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="display:flex; align-items:center; gap:4px;"><i class="material-icons-outlined" style="font-size:14px;">people</i> Candidates</span>
            <strong style="color:var(--on-sur);">${candCount}</strong>
          </div>
        </div>
        
        <div style="margin-top:12px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
            <span>Readiness Score</span>
            <span>${readiness}%</span>
          </div>
          <div class="progress-track" style="margin:0;"><div class="progress-fill" style="width:${readiness}%; background:${readiness > 80 ? 'var(--suc)' : 'var(--pri)'}"></div></div>
        </div>

        <div style="margin-top:20px; display:flex; gap:8px;">
          <button class="btn ${state === 'live' ? 'btn-primary' : 'btn-outlined'}" style="flex:1; justify-content:center;" onclick="v2App.openSessionDetail('${s.id}')">
            ${state === 'live' ? '<i class="material-icons">videocam</i> Monitor' : 'Open Session'}
          </button>
        </div>
      </div>
    `;
    }).join('');
  },

  startSession(id) {
    const s = this.data.sessions.find(x => x.id === id);
    if(s) {
      s.status = 'ongoing';
      s.state = 'ongoing';
      this.showToast('Class Started (Ongoing)! Candidates notified.', 'success');
      this.renderSessions('all');
      this.renderDashboard();
      this.openSessionDetail(id);
    }
  },

  startExam(id) {
    const s = this.data.sessions.find(x => x.id === id);
    if(s) {
      s.status = 'live';
      s.state = 'live';
      this.showToast('Exam Started (Live Monitoring active).', 'success');
      this.renderSessions('all');
      this.renderDashboard();
      this.openSessionDetail(id);
    }
  },

  endSession(id) {
    const s = this.data.sessions.find(x => x.id === id);
    if(s) {
      s.status = 'completed';
      s.state = 'completed';
      this.showToast('Session Ended.', 'success');
      this.renderSessions('all');
      this.renderDashboard();
      this.openSessionDetail(id);
    }
  },

  openSessionDetail(sessionId) {
    const session = this.data.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const liveCount = this.data.sessions.filter(s => (s.status || s.state) === 'live').length;
    const dateStr = session.examDate ? new Date(session.examDate).toLocaleDateString() : session.date;
    const candCount = session.candidateCount || session.candidates || 0;
    const readiness = session.readiness || 0;
    const state = session.status || session.state;

    document.getElementById('dash-live').textContent = liveCount;
    document.getElementById('dash-incidents').textContent = this.data.incidents.length;
    document.getElementById('sd-title').textContent = session.name;
    document.getElementById('sd-meta').textContent = `${dateStr} • ${candCount} Candidates`;
    document.getElementById('sd-readiness').textContent = `${readiness}%`;
    
    this.currentSessionId = sessionId; // Store for tab rendering
    const headerActions = document.getElementById('sd-header-actions');
    if (state === 'live') {
      headerActions.innerHTML = `
        <button class="btn btn-outlined" onclick="v2App.showToast('Messages sent to all candidates', 'success')"><i class="material-icons-outlined">chat</i> Message All</button>
        <button class="btn btn-outlined" style="color:var(--err); border-color:var(--err);" onclick="v2App.endSession('${session.id}')"><i class="material-icons">stop</i> End Session</button>
      `;
    } else if (state === 'ongoing') {
      headerActions.innerHTML = `
        <button class="btn btn-outlined" onclick="v2App.showToast('Messages sent to all candidates', 'success')"><i class="material-icons-outlined">chat</i> Message All</button>
        <button class="btn btn-outlined" onclick="v2App.showToast('Exam rescheduled', 'success')"><i class="material-icons">event</i> Reschedule Exam</button>
        <button class="btn btn-primary" onclick="v2App.startExam('${session.id}')"><i class="material-icons">play_arrow</i> Start Exam</button>
      `;
    } else if (state === 'completed') {
      headerActions.innerHTML = `
        <button class="btn btn-outlined" onclick="document.querySelector('#sd-tabs .stage-tab[data-tab=\\'analytics\\']')?.click()"><i class="material-icons">bar_chart</i> View Analytics</button>
      `;
    } else {
      // Draft state
      headerActions.innerHTML = `
        <button class="btn btn-outlined" onclick="v2App.showToast('Candidates Added', 'success')"><i class="material-icons">person_add</i> Add Candidates</button>
        <button class="btn btn-primary" onclick="v2App.startSession('${session.id}')"><i class="material-icons">check_circle</i> Start Class</button>
      `;
    }

    this.showSection('session-detail');
    
    // Auto-route to specific tab based on session state
    let targetTab = 'candidates';
    
    // Set the tab active
    document.querySelectorAll('#sd-tabs .stage-tab').forEach(t => {
      if (t.dataset.tab === targetTab) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    this.renderSessionDetailTab(targetTab);
  },

  openCandidateDetail(candidateId) {
    const candidate = this.data.candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    this.currentCandidate = candidate;
    
    // Update Drawer Header
    document.getElementById('drawer-name').innerHTML = `<input type="text" id="edit-cand-name" value="${candidate.name}" class="v2-input" style="font-size:18px; font-weight:600; padding:4px; width:100%; border:1px solid var(--out); border-radius:4px;">`;
    document.getElementById('drawer-id').innerHTML = `ID: ${candidate.id} | <input type="email" id="edit-cand-email" value="${candidate.email || ''}" class="v2-input" style="font-size:12px; padding:2px; display:inline-block; width:150px; border:1px solid var(--out); border-radius:4px;">`;
    document.getElementById('drawer-avatar').src = candidate.avatar;

    let vStatus = (candidate.voucherStatus || '').toLowerCase();
    let isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
    let isPending = vStatus === 'pending' || vStatus === 'assigned';
    let isActivated = vStatus === 'activated' || vStatus === 'redeemed';

    if (!candidate.voucherCode && !isUnassigned) candidate.voucherCode = 'VOUCH-' + Math.floor(Math.random()*9000+1000);
    if (!candidate.sessionName) candidate.sessionName = 'Data Science 101 Bootcamp';
    if (candidate.readHours === undefined) candidate.readHours = Math.floor(Math.random() * 20);
    if (candidate.totalHours === undefined) candidate.totalHours = 20;
    if (!candidate.pastExams && Math.random() > 0.5) candidate.pastExams = [{ name: 'Midterm Evaluation', score: '88%', certLink: '#' }];

    // 1. Voucher & Basic Details
    let detailsHtml = '';
    if (isUnassigned) {
      detailsHtml += `
        <div style="background:rgba(249, 173, 0, 0.1); padding:16px; border-radius:8px; border:1px solid var(--pri);">
           <p style="color:var(--pri-dk); font-size:13px; margin-bottom:12px;"><i class="material-icons-outlined" style="font-size:16px; vertical-align:middle;">warning</i> Voucher Not Assigned</p>
           <button class="btn btn-primary" style="width:100%;" onclick="v2App.showToast('Voucher Assigned', 'success')"><i class="material-icons">card_giftcard</i> Assign New Voucher</button>
        </div>
      `;
    } else if (isPending) {
      detailsHtml += `
        <div style="background:var(--sur-var); padding:16px; border-radius:8px; border:1px solid var(--out);">
           <p style="color:var(--on-sur); font-size:13px; margin-bottom:8px;">Voucher Code</p>
           <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
             <span style="font-family:var(--font-mono); font-size:16px; font-weight:600;">${candidate.voucherCode || 'PENDING'}</span>
             <span class="status-chip pending">Pending</span>
           </div>
           <button class="btn btn-outlined" style="width:100%;" onclick="v2App.showToast('Voucher Code Changed', 'success')">Change Voucher Code</button>
        </div>
      `;
    } else if (isActivated) {
      detailsHtml += `
        <div style="background:var(--sur-var); padding:16px; border-radius:8px; border:1px solid var(--out);">
           <p style="color:var(--on-sur); font-size:13px; margin-bottom:8px;">Voucher Code</p>
           <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
             <span style="font-family:var(--font-mono); font-size:16px; font-weight:600;">${candidate.voucherCode || 'REDEEMED'}</span>
             <span class="status-chip success">Activated</span>
           </div>
        </div>
      `;
    }

    document.getElementById('drawer-basic-details').innerHTML = detailsHtml + `
        <button class="btn btn-secondary" style="width:100%; margin-top:12px; background:var(--sur-var); border:1px solid var(--out); border-radius:4px; padding:8px; cursor:pointer;" onclick="
          v2App.currentCandidate.name = document.getElementById('edit-cand-name').value;
          v2App.currentCandidate.email = document.getElementById('edit-cand-email').value;
          v2App.renderCandidates(v2App.currentCandFilter || 'all');
          v2App.showToast('Profile Saved', 'success');
        ">Save Profile</button>
    `;

    // 2. Study Progress
    let progressHtml = '';
    if (isActivated) {
      let progressPct = Math.round((candidate.readHours / candidate.totalHours) * 100) || 0;
      progressHtml = `
        <div style="background:var(--sur-var); padding:16px; border-radius:8px;">
          <h5 style="margin-bottom:8px; font-size:13px; margin-top:0;">${candidate.sessionName}</h5>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:var(--on-sur-var);">
            <span>Hours Read</span>
            <strong>${candidate.readHours} / ${candidate.totalHours} hrs</strong>
          </div>
          <div class="progress-track" style="margin:0;"><div class="progress-fill" style="width:${progressPct}%; background:var(--pri);"></div></div>
        </div>
      `;
    } else {
      progressHtml = `<p style="font-size:13px; color:var(--on-sur-var);">Voucher must be activated to track learning progress.</p>`;
    }
    document.getElementById('drawer-study-progress').innerHTML = progressHtml;

    // 3. Practice Tests / Exams
    let examHtml = '';
    if (candidate.pastExams && candidate.pastExams.length > 0) {
      examHtml += `<table class="v2-table" style="font-size:12px; margin-top:0; width:100%; text-align:left;">
        <thead><tr><th style="padding:8px; border-bottom:1px solid var(--out);">Exam</th><th style="padding:8px; border-bottom:1px solid var(--out);">Score</th><th style="padding:8px; border-bottom:1px solid var(--out);">Cert</th></tr></thead><tbody>`;
      candidate.pastExams.forEach(ex => {
        let isPass = parseInt(ex.score) > 75;
        examHtml += `<tr>
          <td style="padding:8px; border-bottom:1px solid var(--out-var);">${ex.name}</td>
          <td style="color:${isPass ? 'var(--suc)' : 'var(--err)'}; font-weight:600; padding:8px; border-bottom:1px solid var(--out-var);">${ex.score}</td>
          <td style="padding:8px; border-bottom:1px solid var(--out-var);"><a href="${ex.certLink}" target="_blank" style="color:var(--pri); text-decoration:none;"><i class="material-icons-outlined" style="font-size:16px; vertical-align:middle;">verified</i></a></td>
        </tr>`;
      });
      examHtml += `</tbody></table>`;
    } else {
      examHtml = `<p style="font-size:13px; color:var(--on-sur-var);">No exams completed yet.</p>`;
    }
    document.getElementById('drawer-practice-tests').innerHTML = examHtml;

    // 4. Messages
    document.getElementById('drawer-messages-feed').innerHTML = `
      <div style="background:var(--sur-var); padding:8px 12px; border-radius:8px 8px 8px 0; width:fit-content; max-width:80%;">
         Can you reset my password for the learning portal?
      </div>
    `;
    
    // Open Drawer
    document.getElementById('drawer-overlay').classList.add('open');
    document.getElementById('candidate-drawer').classList.add('drawer-open');
  },

  closeCandidateDrawer() {
    document.getElementById('drawer-overlay').classList.remove('open');
    document.getElementById('candidate-drawer').classList.remove('drawer-open');
  },

  fixCandidateInfo() {
    if (!this.currentCandidate) return;
    const email = document.getElementById('fix-email').value;
    const phone = document.getElementById('fix-phone').value;
    
    if (!email || !phone) {
      this.showToast('Please fill all required fields.', 'error');
      return;
    }
    
    this.currentCandidate.email = email;
    this.currentCandidate.phone = phone;
    this.currentCandidate.status = 'enrolled'; // Upgrade status
    
    this.showToast('Candidate info fixed and enrolled!', 'success');
    this.renderCandidates('all');
    this.renderDashboard();
    this.openCandidateDetail(this.currentCandidate.id); // Refresh drawer
  },

  openVoucherDrawer() {
    document.getElementById('drawer-overlay').classList.add('open');
    document.getElementById('voucher-drawer').classList.add('drawer-open');
  },

  closeVoucherDrawer() {
    document.getElementById('drawer-overlay').classList.remove('open');
    document.getElementById('voucher-drawer').classList.remove('drawer-open');
  },

  assignVoucher() {
    this.closeVoucherDrawer();
    this.showToast('Materials assigned! Candidate locked to session.', 'success');
  },

  sendDrawerMessage() {
    const input = document.getElementById('drawer-msg-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    const feed = document.getElementById('drawer-messages-feed');
    feed.innerHTML += `
      <div style="background:var(--sec); color:white; padding:8px 12px; border-radius:8px 8px 0 8px; width:fit-content; max-width:80%; align-self:flex-end;">
         ${msg}
      </div>
    `;
    input.value = '';
    this.showToast('Message sent to candidate.', 'success');
    feed.scrollTop = feed.scrollHeight;
  },

  renderSessionDetailTab(tabId) {
    const container = document.getElementById('sd-content-container');
    const session = this.data.sessions.find(s => s.id === this.currentSessionId) || {};
    const state = session.status || session.state;
    
    if (tabId === 'candidates') {
      let draftActionsHtml = '';
      if (state === 'draft') {
        draftActionsHtml = `
          <div style="background:var(--sur-var); padding:16px; border-radius:8px; border:1px solid var(--out); margin-bottom:16px; display:flex; gap:12px; align-items:center;">
             <p style="margin:0; font-size:13px; color:var(--on-sur-var); flex:1;"><strong>Draft Mode:</strong> Add candidates and allocate vouchers before starting the session.</p>
             <button class="btn btn-outlined" onclick="v2App.showToast('Candidates added from CRM', 'success')"><i class="material-icons">person_add</i> Add Candidates</button>
             <button class="btn btn-primary" onclick="v2App.showToast('Vouchers allocated to all candidates', 'success')"><i class="material-icons">card_giftcard</i> Allocate Vouchers</button>
          </div>
        `;
      }
      
      let redeemBtnHtml = state === 'ongoing' ? `<button class="btn btn-outlined" style="padding:4px 8px; font-size:11px; height:24px;" onclick="v2App.showToast('Voucher Redeemed for student', 'success')">Redeem Voucher</button>` : `<button class="btn btn-text" style="padding:4px; min-width:auto; font-size:11px;" onclick="v2App.showToast('Voucher Resent', 'success')">Resend</button>`;
      
      container.innerHTML = draftActionsHtml + `
        <div class="table-container glass-panel" style="overflow:visible;">
          <table class="v2-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Voucher Status</th>
                <th>Learning Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>John Doe</strong></td>
                <td>john@example.com</td>
                <td>
                  <div class="voucher-cell" style="display:flex; align-items:center; gap:8px;">
                    <span class="status-chip success">Redeemed</span>
                    <div class="voucher-actions" style="display:none; gap:4px;">
                      <button class="btn btn-text" style="padding:4px; min-width:auto; font-size:11px;" onclick="v2App.showToast('Voucher Extended', 'success')">Extend</button>
                    </div>
                  </div>
                </td>
                <td><div class="progress-track" style="margin:0;"><div class="progress-fill" style="width:100%"></div></div></td>
              </tr>
              <tr>
                <td><strong>Alice Smith</strong></td>
                <td>alice@example.com</td>
                <td>
                  <div class="voucher-cell" style="display:flex; align-items:center; gap:8px;">
                    <span class="status-chip pending">Pending</span>
                    <div class="voucher-actions" style="display:flex; gap:4px;">
                      ${redeemBtnHtml}
                    </div>
                  </div>
                </td>
                <td><div class="progress-track" style="margin:0;"><div class="progress-fill" style="width:40%"></div></div></td>
              </tr>
              <tr>
                <td><strong>Emma Davis</strong></td>
                <td>emma@example.com</td>
                <td>
                  <div class="voucher-cell" style="display:flex; align-items:center; gap:8px;">
                    <span class="status-chip" style="background:#e2e8f0; color:var(--on-sur-var);">Unassigned</span>
                    <div class="voucher-actions" style="display:flex; gap:4px;">
                      <button class="btn btn-primary" style="padding:4px 8px; min-width:auto; font-size:11px; height:24px;" onclick="v2App.openVoucherDrawer()">Assign</button>
                    </div>
                  </div>
                </td>

                <td><span style="font-size:12px; color:var(--on-sur-var);">Not started</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      // Attach hover logic for voucher-actions via JS or rely on CSS. I'll rely on CSS.
    } else if (tabId === 'learning') {
      container.innerHTML = `
        <div class="glass-panel" style="padding:24px;">
          <h4 style="margin-bottom:16px;">Assigned Learning Materials</h4>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; align-items:center; gap:16px; padding:16px; background:var(--sur-var); border-radius:var(--radius-sm);">
               <i class="material-icons-outlined" style="font-size:32px; color:var(--pri);">menu_book</i>
               <div><strong style="display:block;">CS101 Study Guide</strong><span style="font-size:12px; color:var(--on-sur-var);">E-Book (PDF) • 2.4 MB</span></div>
            </div>
            <div style="display:flex; align-items:center; gap:16px; padding:16px; background:var(--sur-var); border-radius:var(--radius-sm);">
               <i class="material-icons-outlined" style="font-size:32px; color:var(--pri);">play_circle</i>
               <div><strong style="display:block;">Lecture 4: Data Structures</strong><span style="font-size:12px; color:var(--on-sur-var);">Video • 45m</span></div>
            </div>
            <div style="display:flex; align-items:center; gap:16px; padding:16px; background:var(--sur-var); border-radius:var(--radius-sm);">
               <i class="material-icons-outlined" style="font-size:32px; color:var(--pri);">quiz</i>
               <div><strong style="display:block;">Practice Quiz 1</strong><span style="font-size:12px; color:var(--on-sur-var);">Assessment • 15 questions</span></div>
            </div>
          </div>
        </div>
      `;
    }
  },

  filterLM(type) {
    document.querySelectorAll('#view-learning .filter-chips .chip').forEach(c => {
      c.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    this.renderLearningCourses(type);
  },

  renderLearningCourses(filter = 'all') {
    const grid = document.getElementById('v2-lm-grid');
    if (!grid) return;
    
    grid.innerHTML = this.data.courses.map(course => {
      const totalEbooks = course.materials.ebooks ? course.materials.ebooks.length : 0;
      const totalVideos = course.materials.video ? course.materials.video.length : 0;
      const totalAudio = course.materials.audio ? course.materials.audio.length : 0;
      const totalPractice = course.materials.practice ? course.materials.practice.length : 0;
      
      const r = 30;
      const c = 2 * Math.PI * r;
      const offset = c - (course.progress / 100) * c;
      const isComplete = course.progress === 100;
      
      return `
        <div class="glass-panel" style="cursor:pointer; display:flex; flex-direction:column; overflow:hidden;" onclick="v2App.openCourseDetail('${course.id}')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'" style="transition:0.3s ease;">
          <div style="height:120px; background:url('${course.thumbnail}') center/cover; position:relative;">
            <div style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.7); color:#fff; font-size:10px; font-weight:700; padding:4px 8px; border-radius:4px; text-transform:uppercase;">
              ${isComplete ? 'Completed Avg' : 'In Progress Avg'}
            </div>
          </div>
          <div style="padding:24px; flex:1; display:flex; flex-direction:column; gap:8px;">
            <h3 style="font-size:16px; margin-bottom:4px; line-height:1.3;">${course.title}</h3>
            <p style="font-size:12px; color:var(--on-sur-var); margin-bottom:12px; display:flex; align-items:center; gap:4px; font-weight:400; opacity:0.8;"><i class="material-icons" style="font-size:14px;">person</i> ${course.instructor}</p>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:16px;">
              ${course.tags.map(t => `<span style="background:var(--sur-var); color:var(--on-sur-var); padding:2px 8px; border-radius:100px; font-size:10px;">${t}</span>`).join('')}
            </div>
            
            <div style="margin-top:auto; padding-top:16px; border-top:1px solid var(--glass-border); display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; gap:12px; color:var(--on-sur-var);">
                <span title="Ebooks" style="display:flex; align-items:center; gap:4px; font-size:12px;"><i class="material-icons" style="font-size:16px;">menu_book</i> ${totalEbooks}</span>
                <span title="Videos" style="display:flex; align-items:center; gap:4px; font-size:12px;"><i class="material-icons" style="font-size:16px;">play_circle</i> ${totalVideos}</span>
                <span title="Audio" style="display:flex; align-items:center; gap:4px; font-size:12px;"><i class="material-icons" style="font-size:16px;">headphones</i> ${totalAudio}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:700; font-size:14px; color:${course.progress > 0 ? 'var(--sec)' : 'var(--on-sur-var)'};">${course.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openCourseDetail(courseId) {
    const course = this.data.courses.find(c => c.id === courseId);
    if (!course) return;
    this.currentCourse = course;
    
    document.getElementById('lm-phase1-dashboard').style.display = 'none';
    document.getElementById('lm-phase2-detail').style.display = 'block';
    
    document.getElementById('lm-detail-title').textContent = course.title;
    document.getElementById('lm-detail-instructor').textContent = course.instructor;
    
    const pText = document.getElementById('lm-detail-progress-text');
    const pRing = document.getElementById('lm-detail-progress-ring');
    const sText = document.getElementById('lm-detail-status-text');
    
    pText.textContent = course.progress + '%';
    const c = 2 * Math.PI * 40;
    pRing.style.strokeDashoffset = c - (course.progress / 100) * c;
    
    if (course.progress === 100) {
      pRing.style.stroke = 'var(--suc)';
      pText.style.color = 'var(--suc)';
      sText.textContent = 'Avg 100% Completed';
    } else if (course.progress > 0) {
      pRing.style.stroke = 'var(--sec)';
      pText.style.color = 'var(--sec)';
      sText.textContent = 'Avg In Progress';
    } else {
      pRing.style.stroke = 'var(--out-var)';
      pText.style.color = 'var(--out)';
      sText.textContent = 'Not Started';
    }
    
    this.renderCourseTab('ebooks');
  },

  closeCourseDetail() {
    document.getElementById('lm-phase2-detail').style.display = 'none';
    document.getElementById('lm-phase1-dashboard').style.display = 'block';
  },

  renderCourseTab(tabId) {
    if (!this.currentCourse) return;
    const course = this.currentCourse;
    
    // Update active tab styling
    document.querySelectorAll('#lm-detail-tabs .stage-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    
    const container = document.getElementById('lm-tab-content-area');
    
    if (tabId === 'ebooks') {
      const items = course.materials.ebooks || [];
      if (items.length === 0) { container.innerHTML = `<div style="padding:48px; text-align:center; color:var(--on-sur-var);">No ebooks available.</div>`; return; }
      container.innerHTML = items.map(eb => `
        <div class="glass-panel" style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="v2App.showToast('Opening Ebook reader...', 'info')">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:48px; height:48px; border-radius:8px; background:rgba(var(--sec-rgb), 0.1); color:var(--sec); display:flex; justify-content:center; align-items:center;"><i class="material-icons">auto_stories</i></div>
            <div>
              <h4 style="margin:0 0 4px 0;">${eb.title}</h4>
              <div style="font-size:12px; color:var(--on-sur-var);">${eb.author} • ${eb.length}</div>
            </div>
          </div>
          <button class="btn btn-outlined">Read</button>
        </div>
      `).join('');
    } else if (tabId === 'videos') {
      const items = course.materials.video || [];
      if (items.length === 0) { container.innerHTML = `<div style="padding:48px; text-align:center; color:var(--on-sur-var);">No videos available.</div>`; return; }
      container.innerHTML = items.map((vid, idx) => `
        <div class="glass-panel" style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="v2App.showToast('Opening Video Player...', 'info')">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:80px; height:48px; border-radius:4px; background:var(--sur-var); display:flex; justify-content:center; align-items:center; position:relative;">
               <i class="material-icons" style="color:var(--on-sur-var);">play_circle_outline</i>
               <span style="position:absolute; bottom:2px; right:4px; font-size:9px; font-family:var(--font-mono); background:rgba(0,0,0,0.6); padding:0 4px; border-radius:2px; color:#fff;">${vid.length}</span>
            </div>
            <div>
              <h4 style="margin:0 0 4px 0;">${vid.title}</h4>
              <div style="font-size:12px; color:var(--on-sur-var);">${course.instructor}</div>
            </div>
          </div>
          <button class="btn btn-outlined">Watch</button>
        </div>
      `).join('');
    } else if (tabId === 'audio') {
      const items = course.materials.audio || [];
      if (items.length === 0) { container.innerHTML = `<div style="padding:48px; text-align:center; color:var(--on-sur-var);">No audio available.</div>`; return; }
      container.innerHTML = items.map(aud => `
        <div class="glass-panel" style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="v2App.showToast('Playing Podcast...', 'success')">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:48px; height:48px; border-radius:50%; background:var(--sur-var); display:flex; justify-content:center; align-items:center;"><i class="material-icons">headphones</i></div>
            <div>
              <h4 style="margin:0 0 4px 0;">${aud.title}</h4>
              <div style="font-size:12px; color:var(--on-sur-var);">${aud.length}</div>
            </div>
          </div>
          <button class="icon-btn"><i class="material-icons">play_arrow</i></button>
        </div>
      `).join('');
    } else if (tabId === 'practice') {
      const items = course.materials.practice || [];
      if (items.length === 0) { container.innerHTML = `<div style="padding:48px; text-align:center; color:var(--on-sur-var);">No practice tests available.</div>`; return; }
      container.innerHTML = items.map(test => `
        <div class="glass-panel" style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="v2App.showToast('Opening Practice Test environment...', 'info')">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:48px; height:48px; border-radius:8px; background:rgba(var(--pri-rgb), 0.1); color:var(--pri); display:flex; justify-content:center; align-items:center;"><i class="material-icons">quiz</i></div>
            <div>
              <h4 style="margin:0 0 4px 0;">${test.title}</h4>
              <div style="font-size:12px; color:var(--on-sur-var); display:flex; gap:12px;">
                 <span>${test.questions} Qs</span>
                 <span>${test.time}</span>
                 <span>${test.attempts} Attempts</span>
              </div>
            </div>
          </div>
          <button class="btn btn-outlined" style="border-color:var(--pri); color:var(--pri);">Preview Mock</button>
        </div>
      `).join('');
    }
  },

  removeLiveCandidate(btn) {
    const card = btn.closest('.glass-panel');
    if (card) {
      card.style.opacity = '0.5';
      card.style.pointerEvents = 'none';
      btn.textContent = 'Removed';
    }
    this.showToast('Candidate Removed from Session', 'error');
  },

  resolveIncident(btn) {
    const item = document.getElementById('incident-item');
    if (item) item.style.display = 'none';
    const msg = document.getElementById('no-incidents');
    if (msg) msg.style.display = 'block';
    this.showToast('Incident Resolved', 'success');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('v2-toast-container');
    const toast = document.createElement('div');
    toast.className = `v2-toast ${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';

    toast.innerHTML = `
      <i class="material-icons" style="color:var(--${type==='success'?'suc':type==='error'?'err':type==='warning'?'pri':'sec'})">${icon}</i>
      <span style="font-size:14px; font-weight:500;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  },

  openModal(title, type, subType = 'manual') {
    document.getElementById('modal-title').textContent = title;
    const body = document.getElementById('modal-body');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (type === 'session') {
      body.innerHTML = `
        <div class="form-group"><label for="sessionName">Class Name</label><input type="text" id="sessionName" name="sessionName" class="v2-input" placeholder="e.g. CS101 Final Exam"></div>
        <div style="display:flex; gap:16px;">
          <div class="form-group" style="flex:1"><label for="sessionVouchers">Add Vouchers code</label><input type="number" id="sessionVouchers" name="sessionVouchers" class="v2-input" placeholder="e.g. 50"><span style="font-size:12px; color:var(--suc); margin-top:4px; display:block;">Total Available Vouchers: 500</span></div>
          <div class="form-group" style="flex:1"><label for="sessionDuration">Course Duration (mins)</label><input type="number" id="sessionDuration" name="sessionDuration" class="v2-input" value="60"></div>
        </div>
        <div class="form-group"><label>Exam Setup</label>
          <div style="display:flex; gap:16px; margin-top:8px;">
            <div class="form-group" style="flex:1; margin-bottom:0;"><label for="sessionDate" style="font-weight:normal; font-size:12px;">Date</label><input type="date" id="sessionDate" name="sessionDate" class="v2-input"></div>
            <div class="form-group" style="flex:1; margin-bottom:0;"><label for="sessionTime" style="font-weight:normal; font-size:12px;">Time</label><input type="time" id="sessionTime" name="sessionTime" class="v2-input"></div>
          </div>
          <div class="form-group" style="margin-top:12px; margin-bottom:0;"><label for="sessionLocation" style="font-weight:normal; font-size:12px;">Location</label><input type="text" id="sessionLocation" name="sessionLocation" class="v2-input" placeholder="e.g. Room 101 or Online"></div>
        </div>
        <div class="form-group"><label>Exam Settings</label>
          <label class="toggle-switch" style="margin-top:8px;" for="chkRetakes"><input type="checkbox" id="chkRetakes" name="chkRetakes" checked><span class="toggle-slider"></span><span class="toggle-label">Allow Retakes</span></label><br>
          <label class="toggle-switch" style="margin-top:8px;" for="chkVouchers"><input type="checkbox" id="chkVouchers" name="chkVouchers" checked><span class="toggle-slider"></span><span class="toggle-label">Auto-Assign Vouchers</span></label>
        </div>
      `;
      submitBtn.innerHTML = '<i class="material-icons">save</i> Save Draft';
    } else if (type === 'candidate') {
      let content = '';
      if (subType === 'excel') {
        content = `
          <div style="border:2px dashed var(--out); padding:32px; text-align:center; border-radius:var(--radius-sm); margin-bottom:16px;">
            <i class="material-icons" style="font-size:32px; color:var(--on-sur-var);">upload_file</i>
            <p>Drag & Drop Excel File</p>
          </div>
          <div style="font-size:12px; color:var(--suc);">Preview: 2 valid candidates found.</div>
          <table class="v2-table" style="margin-top:12px;">
            <tr><th>Name</th><th>Email</th></tr>
            <tr><td>Tom Clark</td><td>tom@example.com</td></tr>
            <tr><td>Jane Roe</td><td>jane@example.com</td></tr>
          </table>
        `;
        submitBtn.innerHTML = '<i class="material-icons">upload</i> Import Candidates';
      } else if (subType === 'cv') {
        content = `
          <div style="border:2px dashed var(--out); padding:32px; text-align:center; border-radius:var(--radius-sm); margin-bottom:16px;">
            <i class="material-icons" style="font-size:32px; color:var(--on-sur-var);">upload_file</i>
            <p>Drag & Drop Resume (PDF)</p>
          </div>
          <p style="font-size:12px; color:var(--on-sur-var);">AI will extract Name, Email, Phone, and Skills automatically.</p>
        `;
        submitBtn.innerHTML = '<i class="material-icons">document_scanner</i> Parse Resume';
      } else {
        content = `
          <div style="display:flex; gap:16px; margin-bottom:16px;">
            <button class="btn btn-outlined" style="flex:1" onclick="v2App.openModal('Add Candidate', 'candidate', 'manual')">Manual</button>
            <button class="btn btn-outlined" style="flex:1" onclick="v2App.openModal('Add Candidate', 'candidate', 'excel')">Excel</button>
            <button class="btn btn-outlined" style="flex:1" onclick="v2App.openModal('Add Candidate', 'candidate', 'cv')">CV Upload</button>
          </div>
          <div class="form-group"><label for="candName">Full Name</label><input type="text" id="candName" name="candName" class="v2-input" placeholder="John Doe"></div>
          <div class="form-group"><label for="candEmail">Email</label><input type="email" id="candEmail" name="candEmail" class="v2-input" placeholder="john@example.com"></div>
          <div style="display:flex; gap:16px;">
            <div class="form-group" style="flex:1"><label for="candPhone">Phone</label><input type="text" id="candPhone" name="candPhone" class="v2-input" placeholder="+1..."></div>
            <div class="form-group" style="flex:1"><label for="candId">Candidate ID</label><input type="text" id="candId" name="candId" class="v2-input" placeholder="C100..."></div>
          </div>
          <div class="form-group"><label for="candProgram">Program / Specialization</label><input type="text" id="candProgram" name="candProgram" class="v2-input" placeholder="e.g. Data Science"></div>
          <div class="form-group"><label for="candNotes">Notes / Tags</label><input type="text" id="candNotes" name="candNotes" class="v2-input" placeholder="e.g. Retake"></div>
        `;
        submitBtn.innerHTML = '<i class="material-icons">person_add</i> Add Candidate';
      }
      body.innerHTML = content;
    } else if (type === 'material') {
      body.innerHTML = `
        <div class="form-group"><label for="matTitle">Material Title</label><input type="text" id="matTitle" name="matTitle" class="v2-input" placeholder="e.g. Study Guide PDF"></div>
        <div class="form-group"><label for="matFile">File</label><input type="file" id="matFile" name="matFile" class="v2-input"></div>
      `;
      submitBtn.innerHTML = '<i class="material-icons">cloud_upload</i> Upload';
    }

    document.getElementById('v2-modal-overlay').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('v2-modal-overlay').classList.add('hidden');
  },

  submitModal() {
    this.closeModal();
    const btn = document.getElementById('modal-submit-btn');
    const text = btn.textContent || btn.innerText;
    
    if (text.includes('Add Candidate') || text.includes('Parse Resume')) {
       const newId = 'C' + Math.floor(Math.random() * 900 + 100);
       const nameInput = document.getElementById('candName')?.value || 'New Student';
       const emailInput = document.getElementById('candEmail')?.value || 'new@student.edu';
       
       this.data.candidates.unshift({ 
         id: newId, 
         name: nameInput, 
         email: emailInput, 
         sessions: 0, 
         progress: 0, 
         status: 'enrolled', 
         avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&q=80',
         history: []
       });
       this.renderCandidates('all');
       this.renderDashboard();
       document.querySelector('#cand-filter-chips .chip[data-filter="all"]')?.click();
       this.showToast('Candidate successfully added!', 'success');
       
    } else if (text.includes('Import Candidates')) {
       // Mock CSV Import generating Incomplete candidates
       this.data.candidates.unshift({ id: 'C998', name: 'Tom Clark', email: '', sessions: 0, progress: 0, status: 'incomplete', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&q=80' });
       this.data.candidates.unshift({ id: 'C999', name: 'Jane Roe', email: 'jane@example.com', phone:'', sessions: 0, progress: 0, status: 'incomplete', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&q=80' });
       
       this.data.activities.unshift({ time: 'Just now', text: 'CSV uploaded: 2 new candidates added (Incomplete)' });
       
       this.renderCandidates('all');
       this.renderDashboard();
       document.querySelector('#cand-filter-chips .chip[data-filter="all"]')?.click();
       this.showToast('CSV Parsed. 2 candidates added with missing details.', 'warning');
       
    } else if (text.includes('Save Draft') || text.includes('Add Class')) {
       const newId = 'S' + Math.floor(Math.random() * 900 + 100);
       const nameInput = document.getElementById('sessionName')?.value || 'Add Class Draft';
       const dateInput = document.getElementById('sessionDate')?.value || 'Upcoming';
       
       this.data.sessions.unshift({ id: newId, name: nameInput, date: dateInput, candidates: 0, state: 'draft', readiness: 0 });
       this.renderSessions('all');
       this.renderDashboard();
       document.querySelector('.stage-tab[data-stage="all"]')?.click(); // reset session filter
       this.showToast('Session Draft Created!', 'success');
    } else if (text.includes('Upload')) {
       this.showToast('Material successfully uploaded!', 'success');
    } else {
       this.showToast('Action completed successfully!', 'success');
    }
  },

  renderSettingsTab(tabId) {
    const content = document.getElementById('settings-content-area');
    if (!content) return;
    
    if (tabId === 'profile') {
      content.innerHTML = `
        <h4>Profile Details</h4>
        <div class="form-group"><label for="setFullName">Full Name</label><input type="text" id="setFullName" name="setFullName" value="Dr. Sarah Jenkins" class="v2-input"></div>
        <div class="form-group"><label for="setEmail">Email Address</label><input type="email" id="setEmail" name="setEmail" value="sarah.jenkins@secureproctor.ai" class="v2-input"></div>
        <div class="form-group"><label for="setPhone">Phone Number</label><input type="text" id="setPhone" name="setPhone" value="+1 (555) 019-2831" class="v2-input"></div>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="v2App.showToast('Settings saved successfully', 'success')"><i class="material-icons">save</i> Save Changes</button>
      `;
    } else if (tabId === 'institution') {
      content.innerHTML = `
        <h4>Institution Settings</h4>
        <div class="form-group"><label for="setInstName">Institution Name</label><input type="text" id="setInstName" name="setInstName" value="SecureProctor University" class="v2-input"></div>
        <div class="form-group"><label for="setApiKey">API Key</label><input type="password" id="setApiKey" name="setApiKey" value="sk_test_123456789" class="v2-input"></div>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="v2App.showToast('Institution updated', 'success')"><i class="material-icons">save</i> Update Institution</button>
      `;
    } else if (tabId === 'defaults') {
      content.innerHTML = `
        <h4>Session Defaults</h4>
        <label class="toggle-switch" style="margin-top:12px; display:flex;" for="defAI"><input type="checkbox" id="defAI" name="defAI" checked><span class="toggle-slider"></span><span class="toggle-label">Enable AI Monitoring</span></label>
        <label class="toggle-switch" style="margin-top:12px; display:flex;" for="defAudio"><input type="checkbox" id="defAudio" name="defAudio" checked><span class="toggle-slider"></span><span class="toggle-label">Record Audio</span></label>
        <label class="toggle-switch" style="margin-top:12px; display:flex;" for="defFs"><input type="checkbox" id="defFs" name="defFs"><span class="toggle-slider"></span><span class="toggle-label">Force Fullscreen</span></label>
        <button class="btn btn-primary" style="margin-top:20px;" onclick="v2App.showToast('Defaults saved', 'success')"><i class="material-icons">save</i> Save Defaults</button>
      `;
    } else {
      content.innerHTML = `
        <h4>${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h4>
        <p style="color:var(--on-sur-var); margin-top:8px;">Configuration options for this section will appear here.</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="v2App.showToast('Preferences updated', 'success')"><i class="material-icons">save</i> Save Preferences</button>
      `;
    }
  },

  formatStatus(status) {
    if (status === 'learning') return '<span class="status-chip pending">Actively Learning</span>';
    if (status === 'enrolled') return '<span class="status-chip success">Enrolled</span>';
    if (status === 'suspended') return '<span class="status-chip error">Suspended</span>';
    if (status === 'completed') return '<span class="status-chip" style="background:#e2e8f0; color:var(--on-sur-var);">Completed</span>';
    if (status === 'incomplete') return '<span class="status-chip pending" style="border:1px solid var(--pri);">Incomplete</span>';
    return `<span class="status-chip">${status}</span>`;
  },

  getStatusClass(status) {
    if (status === 'completed') return 'success';
    if (status === 'in_progress') return 'pending';
    return '';
  },

  searchCandidates(query) {
    this.candidateSearchQuery = query.toLowerCase();
    this.renderCandidates(this.currentCandFilter || 'all');
  },

  removeBulkCandidates() {
    const selectedIds = Array.from(document.querySelectorAll('.cand-checkbox:checked')).map(cb => cb.value);
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to remove ${selectedIds.length} candidate(s)?`)) return;
    
    this.data.candidates = this.data.candidates.filter(c => !selectedIds.includes(c.id));
    this.renderCandidates(this.currentCandFilter || 'all');
    this.showToast(`${selectedIds.length} candidate(s) removed successfully.`, 'success');
  },

  removeSingleCandidate(id) {
    const c = this.data.candidates.find(cand => cand.id === id);
    if(!c) return;
    if (!confirm(`Are you sure you want to suspend/remove ${c.name}?`)) return;
    
    this.data.candidates = this.data.candidates.filter(cand => cand.id !== id);
    this.renderCandidates(this.currentCandFilter || 'all');
    this.showToast(`${c.name} has been removed.`, 'success');
  },

  toggleActionMenu(id, event) {
    if(event) event.stopPropagation();
    
    // Close all other open menus
    document.querySelectorAll('.action-dropdown').forEach(m => {
      if(m.id !== `menu-${id}`) m.style.display = 'none';
    });

    const menu = document.getElementById(`menu-${id}`);
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
    }
  },

  toggleAllCandidates(checkbox) {
    const checks = document.querySelectorAll('.cand-checkbox');
    checks.forEach(c => c.checked = checkbox.checked);
    this.updateBulkSelection();
  },

  updateBulkSelection() {
    const selected = document.querySelectorAll('.cand-checkbox:checked').length;
    const bar = document.getElementById('bulk-action-bar');
    const count = document.getElementById('bulk-count');
    if (bar && count) {
      if (selected > 0) {
        bar.style.display = 'flex';
        count.textContent = `${selected} Selected`;
      } else {
        bar.style.display = 'none';
        const selectAll = document.getElementById('select-all-candidates');
        if (selectAll) selectAll.checked = false;
      }
    }
  },

  clearBulkSelection() {
    document.querySelectorAll('.cand-checkbox').forEach(c => c.checked = false);
    this.updateBulkSelection();
  },

  getStateClass(state) {
    if (state === 'live') return 'error'; // make it pop with red/amber
    if (state === 'completed') return 'success';
    if (state === 'ongoing') return 'pending';
    return ''; // draft
  }
};

document.addEventListener('DOMContentLoaded', () => v2App.init());
