/* ==========================================================================
 * admin_classes_v3.js
 * The v3.html "Classes" flow (grid/table list, status chips, session cards,
 * class-detail with Candidates/Materials tabs) ported into the Organization
 * Admin portal. Logic mirrors v3App's session methods (see v3.js) but reads the
 * org's own data (app.state.classes / app.state.candidates) and drives the org
 * portal's module navigation (app.navigateTo). The shared CCM module is left
 * untouched — only the Class Management + Class Detail modules use CV3.
 * ========================================================================== */
const CV3 = {
  viewMode: 'grid',
  currentSessionId: null,

  // ---- data + host shims (org portal) ------------------------------------
  // The org portal exposes its controller as a top-level `const app` (a global
  // lexical binding, NOT window.app), so resolve it via typeof.
  host() {
    try { if (typeof app !== 'undefined' && app) return app; } catch (e) {}
    return window.app || null;
  },
  sessions() { const h = this.host(); return (h && h.state && h.state.classes) || []; },
  candidates() { const h = this.host(); return (h && h.state && h.state.candidates) || []; },
  materials() { const h = this.host(); return (h && h.state && h.state.materials) || []; },
  toast(m, t) { const h = this.host(); if (h && h.showToast) h.showToast(m, t); },

  // Called by admin_app on init and whenever the Classes module is shown.
  refresh() {
    const active = document.querySelector('#session-filters .filter-chip.active');
    let status = 'all';
    if (active && active.getAttribute('onclick')) {
      const m = active.getAttribute('onclick').match(/'([^']+)'/);
      if (m) status = m[1];
    }
    this.renderSessions(status);
  },

  // ==========================================================================
  // SESSIONS LIST
  // ==========================================================================
  filterSessions(status) {
    document.querySelectorAll('#session-filters .filter-chip').forEach(b => {
      const oc = b.getAttribute('onclick') || '';
      b.classList.toggle('active', oc.includes(`'${status}'`));
    });
    this.renderSessions(status);
  },

  renderSessions(filter) {
    const grid = document.getElementById('sessions-grid');
    if (!grid) return;
    this.updateSessionCounts();
    let filtered = this.sessions();
    if (filter && filter !== 'all') filtered = filtered.filter(s => s.status === filter);
    this.renderSessionsList(filtered);
  },

  updateSessionCounts() {
    const ss = this.sessions();
    const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
    set('sc-all', ss.length);
    ['draft', 'upcoming', 'ongoing', 'live', 'completed'].forEach(st =>
      set('sc-' + st, ss.filter(s => s.status === st).length));
  },

  setSessionViewMode(mode) {
    this.viewMode = mode;
    const gridBtn = document.getElementById('btn-grid-view');
    const tableBtn = document.getElementById('btn-table-view');
    if (gridBtn && tableBtn) {
      gridBtn.classList.toggle('active', mode === 'grid');
      tableBtn.classList.toggle('active', mode === 'table');
    }
    const gridContainer = document.getElementById('sessions-grid');
    const tableContainer = document.getElementById('sessions-table-container');
    if (gridContainer && tableContainer) {
      gridContainer.style.display = mode === 'grid' ? 'grid' : 'none';
      tableContainer.style.display = mode === 'table' ? 'block' : 'none';
    }
    this.refresh();
  },

  renderSessionsList(filtered) {
    const grid = document.getElementById('sessions-grid');
    const tbody = document.getElementById('sessions-tbody');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <i class="material-icons-outlined">event_busy</i>
        <div class="es-title">No classes here yet</div>
        <div class="es-sub">No classes match this filter. Try another tab or add a class.</div>
      </div>`;
      if (tbody) tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="material-icons-outlined">event_busy</i><div class="es-title">No classes here yet</div><div class="es-sub">No classes match this filter.</div></div></td></tr>`;
      return;
    }

    const badgeFor = (status) => {
      let c = 'badge';
      if (status === 'live' || status === 'ongoing') c += ' badge-success';
      else if (status === 'upcoming' || status === 'review') c += ' badge-info';
      else if (status === 'completed' || status === 'draft') c += ' badge-warning';
      return c;
    };
    // org has no live-monitoring view — route "live" to the class detail too.
    const actionFor = (s) => `CV3.openSessionDetail('${s.id}')`;

    const mode = this.viewMode || 'grid';

    if (mode === 'grid') {
      grid.innerHTML = filtered.map(s => {
        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = (s.examDate && s.examDate !== 'TBD') ? new Date(s.examDate).toLocaleDateString() : '';
        const candCount = s.candidateCount || s.candidates || 18;
        const readiness = s.readiness || 0;
        return `
          <div class="card session-card">
            <div class="flex-between">
              <span class="${badgeFor(s.status)}">${(s.status || '').toUpperCase()}</span>
              <div style="position:relative;">
                <button class="icon-button" onclick="event.stopPropagation(); const m = this.nextElementSibling; m.style.display = m.style.display==='block'?'none':'block';"><i class="material-icons">more_horiz</i></button>
                <div class="session-menu" style="display:none; position:absolute; right:0; top:36px; background:var(--surface-color); border:1px solid var(--border-color); box-shadow:var(--shadow-md); border-radius:8px; z-index:10; width:150px; overflow:hidden;">
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; CV3.toast('Editing class...', 'info');">Edit Class</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; CV3.toast('Class duplicated.', 'success');">Duplicate</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px; color:var(--status-error); border-top:1px solid var(--border-light);" onclick="event.stopPropagation(); this.parentElement.style.display='none'; CV3.deleteSession('${s.id}')">Delete</div>
                </div>
              </div>
            </div>
            <div>
              <div class="sc-title">${s.name}</div>
              <span class="sc-batch">${s.program || '2026 · Batch B1'}</span>
            </div>
            <div class="sc-meta">
              <div class="sc-meta-row"><i class="material-icons-outlined">calendar_today</i> Created ${dateStr}</div>
              <div class="sc-meta-row"><i class="material-icons-outlined">event</i> Class / Exam: ${examDateStr || 'Pending Schedule'}</div>
              <div class="sc-meta-row"><i class="material-icons-outlined">location_on</i> Campus Lab A / Online</div>
            </div>
            <div class="sc-footer">
              <div class="flex-between">
                <span class="metric-label">Class Readiness</span>
                <span style="font-weight:600; font-size:13px; color:var(--brand-primary);">${readiness}%</span>
              </div>
              <div class="metric-bar"><span style="width:${readiness}%;"></span></div>
              <div class="flex-between" style="font-size:13px;">
                <span class="sc-meta-row" style="gap:6px;"><i class="material-icons-outlined" style="font-size:16px;">people</i> ${candCount} candidates</span>
                <button class="btn btn-primary" style="padding:6px 16px;" onclick="${actionFor(s)}">
                  ${(s.status === 'live') ? 'Monitor' : (s.status === 'ongoing' ? 'Manage' : 'View Class')}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else if (tbody) {
      tbody.innerHTML = filtered.map(s => {
        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = (s.examDate && s.examDate !== 'TBD') ? new Date(s.examDate).toLocaleDateString() : 'Pending Schedule';
        return `
          <tr style="cursor:pointer;" onclick="${actionFor(s)}">
            <td style="font-weight:600;">${s.name}</td>
            <td><span class="${badgeFor(s.status)}">${(s.status || '').toUpperCase()}</span></td>
            <td>${dateStr}</td>
            <td>${examDateStr}</td>
            <td>${s.candidateCount || s.candidates || 18}</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px; min-width:120px;">
                <div class="metric-bar" style="flex:1;"><span style="width:${s.readiness || 0}%;"></span></div>
                <span style="font-weight:600; color:var(--brand-primary); font-size:12px; min-width:34px;">${s.readiness || 0}%</span>
              </div>
            </td>
            <td>
               <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="event.stopPropagation(); ${actionFor(s)}">Manage</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  deleteSession(id) {
    if (confirm('Are you sure you want to delete this class?')) {
      const h = this.host();
      if (h && h.state) h.state.classes = h.state.classes.filter(s => String(s.id) !== String(id));
      this.renderSessions('all');
      this.toast('Class deleted.', 'success');
    }
  },

  // ==========================================================================
  // CLASS DETAIL
  // ==========================================================================
  openSessionDetail(id) {
    const session = this.sessions().find(s => String(s.id) === String(id));
    if (!session) return;
    this.currentSessionId = session.id;
    const h = this.host(); if (h && h.navigateTo) h.navigateTo('session-detail');

    document.getElementById('sd-title').textContent = session.name;
    document.getElementById('sd-subtitle').textContent = (session.status === 'draft' || session.status === 'upcoming')
      ? 'Draft Mode: Prepare candidates and vouchers.'
      : 'Review enrolled candidates and learning materials.';

    const topActions = document.getElementById('sd-top-actions');
    const voucherWarning = document.getElementById('sd-voucher-warning');
    const tabsContainer = document.getElementById('sd-tabs-container');

    if (session.status === 'draft' || session.status === 'upcoming') {
      const btnText = session.status === 'draft' ? 'Save Class' : 'Start Class';
      const actionFn = session.status === 'draft'
        ? `CV3.toast('Class Saved Successfully', 'success'); app.navigateTo('classes');`
        : `CV3.startSession('${session.id}')`;
      topActions.innerHTML = `
        <button class="btn btn-secondary" onclick="app.openFormDrawer('candidate', '${session.id}')"><i class="material-icons-outlined">person_add</i> Add Candidate</button>
        <button class="btn btn-primary" onclick="${actionFn}">${btnText}</button>
      `;
      if (voucherWarning) voucherWarning.style.display = (session.candidateCount || 0) > 0 ? 'flex' : 'none';
    } else if (session.status === 'ongoing') {
      topActions.innerHTML = `
        <button class="btn btn-primary" style="display:flex; align-items:center; gap:8px;" onclick="CV3.confirmStartExam('${session.id}')">
          <i class="material-icons">play_circle_filled</i> Start Exam
        </button>
      `;
      if (voucherWarning) voucherWarning.style.display = 'none';
    } else {
      topActions.innerHTML = ``;
      if (voucherWarning) voucherWarning.style.display = 'none';
    }

    if (session.status === 'draft' || session.status === 'upcoming' || session.status === 'completed') {
      if (tabsContainer) tabsContainer.style.display = 'none';
    } else {
      if (tabsContainer) tabsContainer.style.display = 'flex';
      const matTab = document.getElementById('sd-tab-materials');
      if (matTab) matTab.style.display = 'block';
    }
    this.switchSessionDetailTab('candidates');
  },

  switchSessionDetailTab(tab) {
    const c = document.getElementById('sd-tab-candidates');
    const m = document.getElementById('sd-tab-materials');
    if (c) {
      c.style.background = tab === 'candidates' ? 'var(--brand-active)' : 'transparent';
      c.style.color = tab === 'candidates' ? 'var(--brand-primary)' : 'var(--text-secondary)';
      c.style.borderBottomColor = tab === 'candidates' ? 'var(--brand-primary)' : 'transparent';
    }
    if (m) {
      m.style.background = tab === 'materials' ? 'var(--brand-active)' : 'transparent';
      m.style.color = tab === 'materials' ? 'var(--brand-primary)' : 'var(--text-secondary)';
      m.style.borderBottomColor = tab === 'materials' ? 'var(--brand-primary)' : 'transparent';
    }
    document.getElementById('sd-content-candidates').style.display = tab === 'candidates' ? 'block' : 'none';
    document.getElementById('sd-content-materials').style.display = tab === 'materials' ? 'block' : 'none';

    if (tab === 'candidates') this.renderSessionDetailCandidates();
    if (tab === 'materials') this.renderSessionDetailMaterials();
  },

  renderSessionDetailCandidates() {
    const session = this.sessions().find(s => String(s.id) === String(this.currentSessionId));
    if (!session) return;

    const all = this.candidates();
    // Prefer candidates tied to this class; fall back to a demo subset.
    let cands = all.filter(c => String(c.sessionId) === String(session.id));
    if (cands.length === 0) cands = all.slice(0, session.candidateCount || 4);

    const thead = document.getElementById('sd-candidates-thead');
    const tbody = document.getElementById('sd-candidates-tbody');

    if (session.status === 'draft' || session.status === 'upcoming' || session.status === 'ongoing') {
      thead.innerHTML = `
        <tr>
          <th>Candidate</th><th>Candidate ID</th><th>ID Verified</th><th>Voucher Code</th>
          <th>Progress</th><th>Accomm.</th><th>Exam Mode</th><th>Retake</th><th>Retake Mode</th><th>Action</th>
        </tr>`;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = cands.map((c, idx) => {
        let vBadge = '<span class="badge badge-success">Active</span>';
        let progVal = c.learningProgress || 45;
        let progBar = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-size:12px; font-weight:600;">${progVal}%</span><div style="flex:1; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:${progVal}%; height:100%; background:var(--brand-primary);"></div></div></div>`;

        if (session.status === 'draft' || session.status === 'upcoming') {
          progBar = `<span style="color:var(--text-tertiary);">0%</span>`;
          vBadge = c.voucherCode
            ? `<span class="badge" style="background:var(--border-light); color:var(--text-secondary); font-family:monospace;">${c.voucherCode}</span>`
            : '<button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="event.stopPropagation(); CV3.toast(\'Voucher Code Assigned\', \'success\')">Assign Voucher Code</button>';
        } else if (idx === 1) {
          vBadge = '<span class="badge" style="background:var(--bg-color); border:1px solid var(--border-color);">Unused</span>';
          progBar = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-size:12px; font-weight:600;">0%</span><div style="flex:1; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:0%; height:100%; background:var(--brand-primary);"></div></div></div>`;
        }

        const accomValue = (idx === 0) ? 'YES' : 'NO';
        const accomHtml = `
          <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CV3.handleAccommodationChange(this, '${c.id}')">
            <option value="NO" ${accomValue === 'NO' ? 'selected' : ''}>NO</option>
            <option value="YES" ${accomValue === 'YES' ? 'selected' : ''}>YES</option>
          </select>`;

        return `
        <tr style="vertical-align:middle;">
          <td>
            <div style="font-weight:600; font-size:13px; color:var(--text-primary); white-space:nowrap;">${c.name}</div>
            <div style="font-size:11px; color:var(--text-secondary); white-space:nowrap;">${c.email || 'student@domain.com'}</div>
          </td>
          <td class="font-mono" style="font-size:12px; color:var(--text-secondary);">${c.rollNo || c.candidateId || c.id}</td>
          <td>
            <label class="switch" style="transform:scale(0.85); transform-origin:left center; margin:0;" onclick="event.stopPropagation()">
              <input type="checkbox" onchange="if(this.checked) CV3.toast('ID Verified', 'success');">
              <span class="switch-slider"></span>
            </label>
          </td>
          <td>${vBadge}</td>
          <td style="min-width:100px;">${progBar}</td>
          <td>${accomHtml}</td>
          <td>
            <select style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CV3.handleExamModeChange(this)">
              <option value="In-Class" selected>In-Class</option>
              <option value="Online">Online</option>
            </select>
          </td>
          <td>
            <label class="switch" style="transform:scale(0.85); transform-origin:left center; margin:0;" onclick="event.stopPropagation()">
              <input type="checkbox" onchange="var s=document.getElementById('retake-mode-${c.id}'); if(this.checked){ CV3.toast('Retake Enabled', 'success'); s.disabled=false; } else { s.disabled=true; }">
              <span class="switch-slider"></span>
            </label>
          </td>
          <td>
            <select id="retake-mode-${c.id}" disabled style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CV3.handleExamModeChange(this)">
              <option value="In-Class" selected>In-Class</option>
              <option value="Online">Online</option>
            </select>
          </td>
          <td style="text-align:center;">
            <button class="icon-button" style="color:var(--status-error); padding:4px;" onclick="event.stopPropagation(); CV3.toast('Removed', 'info')">
              <i class="material-icons-outlined" style="font-size:16px;">delete</i>
            </button>
          </td>
        </tr>`;
      }).join('');

    } else { // completed
      thead.innerHTML = `
        <tr>
          <th>Candidate Name</th><th>Email ID</th><th>Candidate ID</th>
          <th>Score (out of 100)</th><th>Result</th><th>Flags / Incident</th><th>Retake Status</th>
        </tr>`;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = cands.map((c, i) => {
        const score = ((i * 37) % 100);
        let result = 'Passed', resultClass = 'badge-success';
        if (score <= 40) { result = 'Deactivated'; resultClass = 'badge-error'; }
        else if (score <= 75) { result = 'Failed'; resultClass = 'badge-error'; }
        const flagsCount = i % 3;
        let flagsHtml = '--';
        if (flagsCount > 0) {
          const reasons = ['Multiple Faces', 'Looking Away', 'Background Noise'];
          flagsHtml = `<div style="display:flex; flex-direction:column; gap:4px;">
            <span style="color:var(--status-error); font-weight:600; font-size:12px;">${flagsCount} Flag(s)</span>
            <span style="font-size:11px; color:var(--text-secondary);">${reasons[i % reasons.length]}</span>
          </div>`;
        }
        return `
          <tr>
            <td><div style="font-weight:600; font-size:14px;">${c.name}</div></td>
            <td style="font-size:13px; color:var(--text-secondary);">${c.email || ''}</td>
            <td class="font-mono" style="font-size:13px; color:var(--text-secondary);">${c.rollNo || c.candidateId || c.id}</td>
            <td style="font-weight:600; font-variant-numeric: tabular-nums;">${score} / 100</td>
            <td><span class="badge ${resultClass}">${result}</span></td>
            <td>${flagsHtml}</td>
            <td>
              <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onchange="CV3.toast('Retake status updated.', 'success')">
                <option>Not Eligible</option><option>In Class</option><option>Online</option>
              </select>
            </td>
          </tr>`;
      }).join('');
    }
  },

  renderSessionDetailMaterials() {
    const grid = document.getElementById('sd-materials-grid');
    if (!grid) return;
    const materials = this.materials();
    if (materials.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="width:100%;">
        <i class="material-icons-outlined">library_books</i>
        <div class="es-title">No materials attached to this class</div>
        <div class="es-sub">Learning materials are assigned by the proctor in the in-class app.</div>
      </div>`;
      return;
    }
    // (Org portal has no per-class materials in this prototype; empty-state above.)
    grid.innerHTML = '';
  },

  // ---- per-candidate / lifecycle interactions ----------------------------
  startSession(id) {
    const session = this.sessions().find(s => String(s.id) === String(id));
    if (session) {
      session.status = 'ongoing';
      this.toast('Class Started successfully.', 'success');
      this.renderSessions('all');
      this.openSessionDetail(id);
    }
  },

  confirmStartExam(id) {
    const session = this.sessions().find(s => String(s.id) === String(id));
    if (!session) return;
    const candCount = session.candidateCount || 0;
    let assistantNote = '';
    if (candCount > 35) assistantNote = '\n\nThis class has more than 35 candidates — an Assistant Proctor is required.';
    if (confirm('Start the exam for this class? Once started, candidates can begin and the timer commences. Ensure all candidates are present and IDs verified.' + assistantNote)) {
      this.toast('Exam started. Candidates may now begin.', 'success');
    }
  },

  handleAccommodationChange(selectElement) {
    if (selectElement.value === 'YES') this.toast('Accommodation enabled (extended time 1.5x).', 'success');
    else this.toast('Accommodation removed.', 'info');
  },

  handleExamModeChange(selectElement) {
    if (selectElement.value !== 'Online') return;
    const overlay = document.createElement('div');
    overlay.id = 'exam-mode-modal-overlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
    const modal = document.createElement('div');
    modal.className = 'card';
    modal.style.cssText = 'width:90%; max-width:400px; padding:24px;';
    modal.innerHTML = `
      <h3 style="margin-top:0; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:16px;">Configure Online Exam</h3>
      <div style="margin-bottom:16px;">
        <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600;">Fee chargeable to:</label>
        <select id="exam-mode-fee-select" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
          <option>Organization</option><option>Candidate</option>
        </select>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; padding:12px; background:var(--brand-active); border-radius:8px; border-left:3px solid var(--brand-primary);">
        <label style="font-size:13px; font-weight:600; color:var(--text-primary); cursor:pointer;" for="exam-mode-apply-all">Apply to all online tests for this class</label>
        <label class="switch"><input type="checkbox" id="exam-mode-apply-all"><span class="switch-slider"></span></label>
      </div>
      <div style="display:flex; gap:12px; justify-content:flex-end;">
        <button class="btn btn-secondary" id="exam-mode-cancel" style="padding:10px 20px;">Cancel</button>
        <button class="btn btn-primary" id="exam-mode-save" style="padding:10px 20px;">Save</button>
      </div>`;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.getElementById('exam-mode-cancel').onclick = () => { selectElement.value = 'In-Class'; overlay.remove(); };
    document.getElementById('exam-mode-save').onclick = () => {
      const payer = document.getElementById('exam-mode-fee-select').value;
      const applyAll = document.getElementById('exam-mode-apply-all').checked;
      this.toast(`Fee charged to: ${payer} ${applyAll ? '(Applied to all)' : ''}`, 'success');
      overlay.remove();
    };
  },

  // org portal has no per-candidate learning deep-dive view
  openLearningDeepDive() {
    this.toast('Candidate learning progress is managed in the in-class proctor app.', 'info');
  }
};
window.CV3 = CV3;
