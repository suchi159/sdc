/* ==========================================================================
 * Shared Class & Candidate Management module  (global: window.CCM)
 * --------------------------------------------------------------------------
 * Single source of truth for the Class Lifecycle + Candidate Roster + per-class
 * Session Detail screens, used identically by:
 *   - classroom-proctor.html  (in-class proctor app, host = v3App)
 *   - admin_portal.html       (organization admin,    host = app)
 *
 * Each page calls CCM.init(hostAdapter). The adapter abstracts the small
 * differences between the two apps (state property names, drawers, toasts,
 * page-specific views). All markup generated here calls CCM.* handlers so the
 * generated DOM is host-agnostic.
 *
 * Required host adapter:
 *   getSessions()      -> live array of class/session objects (mutable ref)
 *   getCandidates()    -> live array of candidate objects (mutable ref)
 *   showToast(msg,type)
 *   showView(viewId)               // 'sessions' | 'candidates' | 'session-detail' | 'monitoring'
 *   openAddCandidate(sessionId)    // open the page's add-candidate drawer
 *   openAddClass()                 // open the page's add-class drawer
 *   manageCandidate(id)            // open the page's edit/manage-candidate drawer
 *   renderSessionDetailMaterials(session, gridEl)   // page-specific materials tab
 * Optional host hooks (fall back to a toast / sensible default if absent):
 *   deepDive(id,name,className,progress), examModeChange(el),
 *   accommodationChange(el,id), startSession(id), confirmStartExam(id),
 *   assignVoucher(id)
 * ========================================================================== */
window.CCM = {
  host: null,
  currentSessionId: null,
  state: { sessionViewMode: 'grid' },

  init(host) {
    this.host = host;
    return this;
  },

  // ---- accessors / host bridges ------------------------------------------
  sessions() { return (this.host && this.host.getSessions()) || []; },
  candidates() { return (this.host && this.host.getCandidates()) || []; },
  toast(m, t) { if (this.host && this.host.showToast) this.host.showToast(m, t); },
  navigate(viewId) { if (this.host && this.host.showView) this.host.showView(viewId); },

  addCandidate() { if (this.host && this.host.openAddCandidate) this.host.openAddCandidate(this.currentSessionId); },
  addClass() { if (this.host && this.host.openAddClass) this.host.openAddClass(); },
  manageCandidate(id) {
    if (this.host && this.host.manageCandidate) this.host.manageCandidate(id);
    else this.toast('Candidate details unavailable.', 'info');
  },
  deepDive(id, name, className, progress) {
    if (this.host && this.host.deepDive) this.host.deepDive(id, name, className, progress);
    else this.toast('Opening learning details…', 'info');
  },
  examModeChange(el) {
    if (this.host && this.host.examModeChange) this.host.examModeChange(el);
    else if (el && el.value === 'Online') this.toast('Online exam mode selected for this candidate.', 'info');
  },
  accommodationChange(el, id) {
    if (this.host && this.host.accommodationChange) { this.host.accommodationChange(el, id); return; }
    if (el && el.value === 'YES') {
      const reason = prompt('Please provide an explanation for the accommodation:');
      if (reason) this.toast('Accommodation reason saved for candidate.', 'success');
      else el.value = 'NO';
    } else {
      this.toast('Accommodation removed.', 'info');
    }
  },
  assignVoucher(id) {
    if (this.host && this.host.assignVoucher) this.host.assignVoucher(id);
    else this.toast('Voucher assigned.', 'success');
  },
  // Proctor enters a code the candidate bought/shared → validate → mark redeemed.
  redeemVoucher(id) {
    if (this.host && this.host.redeemVoucher) this.host.redeemVoucher(id);
    else this.toast('Voucher redeemed.', 'success');
  },
  // Swap an assigned-but-not-yet-redeemed voucher for a different code.
  replaceVoucher(id) {
    if (this.host && this.host.replaceVoucher) this.host.replaceVoucher(id);
    else this.toast('Voucher replaced.', 'success');
  },
  // Nudge a single candidate who hasn't bought a voucher yet (simulated send).
  remindCandidate(id) {
    if (this.host && this.host.remindCandidate) this.host.remindCandidate(id);
    else this.toast('Reminder sent.', 'success');
  },
  // Nudge every unassigned candidate in the given class (simulated send).
  remindAllUnassigned(sessionId) {
    if (this.host && this.host.remindAllUnassigned) this.host.remindAllUnassigned(sessionId || this.currentSessionId);
    else this.toast('Reminders sent to unassigned candidates.', 'success');
  },

  // ==========================================================================
  // CANDIDATES
  // ==========================================================================
  filterCandidates(status) {
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
    let filtered = this.candidates();
    if (filter && filter !== 'all') filtered = filtered.filter(c => c.examStatus === filter);
    this.renderCandidatesList(filtered);
  },

  renderCandidatesList(filtered) {
    const tbody = document.getElementById('candidates-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates match this filter.</td></tr>`;
      this.updateBulkActions();
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      let statusBadge = '';
      if (c.examStatus === 'completed') statusBadge = `<span class="badge badge-success">Completed</span>`;
      else if (c.examStatus === 'in_progress') statusBadge = `<span class="badge badge-warning">Active</span>`;
      else statusBadge = `<span class="badge badge-info">Enrolled</span>`;

      const vStatus = (c.voucherStatus || '').toLowerCase();
      const isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
      const isPending = vStatus === 'pending' || vStatus === 'assigned';
      const isActivated = vStatus === 'activated' || vStatus === 'redeemed';

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

      let examResult = '<span style="color:var(--text-tertiary);">-</span>';
      if (c.examStatus === 'completed') {
        if (c.examScore === undefined) c.examScore = Math.floor(Math.random() * 80) + 20;
        const passed = c.examScore > 50;
        examResult = passed ? '<span style="color:var(--status-success); font-weight:600;">Pass</span>' : '<span style="color:var(--status-error); font-weight:600;">Fail</span>';
      }

      return `
        <tr>
          <td><input type="checkbox" class="cand-checkbox" onchange="CCM.updateBulkActions()"></td>
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
          <td>${examResult}</td>
          <td><button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="CCM.manageCandidate('${c.id}')">Manage</button></td>
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
          <button class="btn" style="background:var(--surface-color); color:var(--text-primary);" onclick="CCM.toast('Vouchers assigned to ${checked} candidates.', 'success'); CCM.clearBulkActions();"><i class="material-icons">confirmation_number</i> Bulk Assign Vouchers</button>
          <button class="btn btn-danger" onclick="CCM.toast('${checked} candidates suspended.', 'error'); CCM.clearBulkActions();"><i class="material-icons">block</i> Suspend Selected</button>
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
  // SESSIONS / CLASSES
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
    let filtered = this.sessions();
    if (filter && filter !== 'all') filtered = filtered.filter(s => s.status === filter);
    this.renderSessionsList(filtered);
  },

  setSessionViewMode(mode) {
    this.state.sessionViewMode = mode;
    const gridBtn = document.getElementById('btn-grid-view');
    const tableBtn = document.getElementById('btn-table-view');
    if (gridBtn && tableBtn) {
      gridBtn.style.background = mode === 'grid' ? 'var(--border-light)' : 'transparent';
      gridBtn.style.color = mode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)';
      tableBtn.style.background = mode === 'table' ? 'var(--border-light)' : 'transparent';
      tableBtn.style.color = mode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)';
    }
    const gridContainer = document.getElementById('sessions-grid');
    const tableContainer = document.getElementById('sessions-table-container');
    if (gridContainer && tableContainer) {
      gridContainer.style.display = mode === 'grid' ? 'grid' : 'none';
      tableContainer.style.display = mode === 'table' ? 'block' : 'none';
    }
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
    const badgeFor = (s) => {
      let b = 'badge';
      if (s.status === 'live' || s.status === 'ongoing') b += ' badge-success';
      else if (s.status === 'upcoming' || s.status === 'review') b += ' badge-info';
      else if (s.status === 'completed') b += ' badge-warning';
      return b;
    };

    if (mode === 'grid') {
      grid.innerHTML = filtered.map(s => {
        const badgeClass = badgeFor(s);
        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = s.examDate ? new Date(s.examDate).toLocaleDateString() : '';
        const openAction = (s.status === 'live') ? `CCM.navigate('monitoring')` : `CCM.openSessionDetail('${s.id}')`;
        return `
          <div class="card" style="display:flex; flex-direction:column; gap:16px;">
            <div class="flex-between">
              <span class="${badgeClass}">${s.status.toUpperCase()}</span>
              <div style="position:relative;">
                <button class="icon-button" onclick="event.stopPropagation(); const m = this.nextElementSibling; m.style.display = m.style.display==='block'?'none':'block';"><i class="material-icons">more_horiz</i></button>
                <div class="session-menu" style="display:none; position:absolute; right:0; top:36px; background:var(--surface-color); border:1px solid var(--border-color); box-shadow:var(--shadow-md); border-radius:8px; z-index:10; width:150px; overflow:hidden;">
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; CCM.openSessionDetail('${s.id}');">Edit Class</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px;" onclick="event.stopPropagation(); this.parentElement.style.display='none'; CCM.toast('Class duplicated.', 'success');">Duplicate</div>
                   <div style="padding:10px 16px; cursor:pointer; font-size:13px; color:var(--status-error); border-top:1px solid var(--border-light);" onclick="event.stopPropagation(); this.parentElement.style.display='none'; CCM.deleteSession('${s.id}')">Delete</div>
                </div>
              </div>
            </div>
            <div>
              <h3 style="font-size:16px; font-weight:600; margin-bottom:4px;">${s.name}</h3>
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">calendar_today</i> Created ${dateStr}
              </div>
              <div style="font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <i class="material-icons-outlined" style="font-size:16px;">event</i> Class / Exam: ${examDateStr || 'Pending Schedule'}
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; padding-top:16px; border-top:1px solid var(--border-light);">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span style="color:var(--text-tertiary); font-size:11px; text-transform:uppercase; font-weight:600;">Candidates</span>
                <div style="font-weight:600; display:flex; align-items:center; gap:4px;"><i class="material-icons-outlined" style="font-size:16px;">people</i> ${s.candidateCount != null ? s.candidateCount : (s.candidates || 0)}</div>
              </div>
              <div style="display:flex; flex-direction:column; text-align:right; gap:4px;">
                <span style="color:var(--text-tertiary); font-size:11px; text-transform:uppercase; font-weight:600;">Class Readiness</span>
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px;">
                  <i class="material-icons-outlined" style="font-size:16px;">schedule</i> <span style="font-weight:600; color:var(--brand-primary);">${s.readiness || 0}%</span>
                </div>
              </div>
            </div>
            <button class="btn btn-secondary" style="width:100%; margin-top:auto; ${(s.status === 'live') ? 'background:var(--status-error); border-color:var(--status-error); color:var(--err-ct);' : (s.status === 'ongoing' ? 'background:var(--status-warning); border-color:var(--status-warning); color:var(--wrn-ct);' : '')}" onclick="event.stopPropagation(); ${openAction}">
              ${(s.status === 'live') ? 'Monitor Class' : (s.status === 'ongoing' ? 'Manage Ongoing Class' : 'View Class')}
            </button>
          </div>
        `;
      }).join('');
    } else if (tbody) {
      tbody.innerHTML = filtered.map(s => {
        const badgeClass = badgeFor(s);
        const dateStr = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        const examDateStr = s.examDate ? new Date(s.examDate).toLocaleDateString() : 'Pending Schedule';
        const openAction = (s.status === 'live') ? `CCM.navigate('monitoring')` : `CCM.openSessionDetail('${s.id}')`;
        return `
          <tr>
            <td style="font-weight:600;">${s.name}</td>
            <td><span class="${badgeClass}">${s.status.toUpperCase()}</span></td>
            <td>${dateStr}</td>
            <td>${examDateStr}</td>
            <td>${s.candidateCount != null ? s.candidateCount : (s.candidates || 0)}</td>
            <td style="font-weight:600; color:var(--brand-primary);">${s.readiness || 0}%</td>
            <td>
               <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px; ${(s.status === 'live') ? 'color:var(--status-error); border-color:var(--status-error);' : ''}" onclick="event.stopPropagation(); ${openAction}">
                 ${(s.status === 'live') ? 'Monitor' : 'Manage'}
               </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  deleteSession(id) {
    if (!confirm('Are you sure you want to delete this class?')) return;
    const arr = this.sessions();
    const idx = arr.findIndex(s => s.id === id);
    if (idx > -1) arr.splice(idx, 1);
    this.renderSessions('all');
    this.toast('Class deleted.', 'success');
  },

  // ==========================================================================
  // SESSION DETAIL (per-class drill-down)
  // ==========================================================================
  openSessionDetail(id) {
    const session = this.sessions().find(s => s.id === id);
    if (!session) return;
    this.currentSessionId = id;
    this.navigate('session-detail');

    const titleEl = document.getElementById('sd-title');
    const subEl = document.getElementById('sd-subtitle');
    if (titleEl) titleEl.textContent = session.name;
    if (subEl) subEl.textContent = (session.status === 'draft' || session.status === 'upcoming')
      ? 'Draft Mode: Prepare candidates and vouchers.'
      : 'Review enrolled candidates and learning materials.';

    const topActions = document.getElementById('sd-top-actions');
    const voucherWarning = document.getElementById('sd-voucher-warning');
    const tabsContainer = document.getElementById('sd-tabs-container');

    // Count candidates in this class with no voucher yet — drives the bulk
    // "Remind all unassigned" button (and lets us hide it when everyone's set).
    const sdCands = this.candidates().slice(0, session.candidateCount || 4);
    const unassignedCount = sdCands.filter(c => {
      const v = (c.voucherStatus || '').toLowerCase();
      return v !== 'redeemed' && v !== 'activated' && v !== 'assigned' && v !== 'pending';
    }).length;
    const remindAllBtn = `<button class="btn btn-secondary" ${unassignedCount ? '' : 'disabled style="opacity:.5; cursor:not-allowed;"'} onclick="CCM.remindAllUnassigned('${id}')"><i class="material-icons-outlined">notifications_active</i> Remind all unassigned (${unassignedCount})</button>`;

    if (topActions) {
      if (session.status === 'draft' || session.status === 'upcoming') {
        const btnText = session.status === 'draft' ? 'Save Class' : 'Start Class';
        const actionFn = session.status === 'draft'
          ? `CCM.toast('Class Saved Successfully', 'success'); CCM.navigate('sessions');`
          : `CCM.startSession('${id}')`;
        topActions.innerHTML = `
          <button class="btn btn-secondary" onclick="CCM.addCandidate()"><i class="material-icons-outlined">person_add</i> Add Candidate</button>
          ${remindAllBtn}
          <button class="btn btn-primary" onclick="${actionFn}">${btnText}</button>
        `;
        if (voucherWarning) voucherWarning.style.display = (Math.random() > 0.5) ? 'flex' : 'none';
      } else if (session.status === 'ongoing') {
        topActions.innerHTML = `
          <button class="btn btn-secondary" onclick="CCM.addCandidate()"><i class="material-icons-outlined">person_add</i> Add Candidate</button>
          ${remindAllBtn}
          <button class="btn btn-primary" style="display:flex; align-items:center; gap:8px;" onclick="CCM.confirmStartExam('${id}')">
            <i class="material-icons">play_circle_filled</i> Start Exam
          </button>
        `;
        if (voucherWarning) voucherWarning.style.display = 'none';
      } else {
        topActions.innerHTML = ``;
        if (voucherWarning) voucherWarning.style.display = 'none';
      }
    }

    if (tabsContainer) {
      if (session.status === 'draft' || session.status === 'upcoming' || session.status === 'completed') {
        tabsContainer.style.display = 'none';
      } else {
        tabsContainer.style.display = 'flex';
        const matTab = document.getElementById('sd-tab-materials');
        if (matTab) matTab.style.display = 'block';
      }
    }
    this.switchSessionDetailTab('candidates');
  },

  backToSessions() { this.navigate('sessions'); },

  switchSessionDetailTab(tab) {
    const candTab = document.getElementById('sd-tab-candidates');
    const matTab = document.getElementById('sd-tab-materials');
    if (candTab) {
      candTab.style.background = tab === 'candidates' ? 'var(--brand-active)' : 'transparent';
      candTab.style.color = tab === 'candidates' ? 'var(--brand-primary)' : 'var(--text-secondary)';
      candTab.style.borderBottomColor = tab === 'candidates' ? 'var(--brand-primary)' : 'transparent';
    }
    if (matTab) {
      matTab.style.background = tab === 'materials' ? 'var(--brand-active)' : 'transparent';
      matTab.style.color = tab === 'materials' ? 'var(--brand-primary)' : 'var(--text-secondary)';
      matTab.style.borderBottomColor = tab === 'materials' ? 'var(--brand-primary)' : 'transparent';
    }
    const cContent = document.getElementById('sd-content-candidates');
    const mContent = document.getElementById('sd-content-materials');
    if (cContent) cContent.style.display = tab === 'candidates' ? 'block' : 'none';
    if (mContent) mContent.style.display = tab === 'materials' ? 'block' : 'none';

    if (tab === 'candidates') this.renderSessionDetailCandidates();
    if (tab === 'materials') this.renderSessionDetailMaterials();
  },

  renderSessionDetailCandidates() {
    const session = this.sessions().find(s => s.id === this.currentSessionId);
    if (!session) return;
    const cands = this.candidates().slice(0, session.candidateCount || 4);
    const thead = document.getElementById('sd-candidates-thead');
    const tbody = document.getElementById('sd-candidates-tbody');
    if (!thead || !tbody) return;

    if (session.status === 'draft' || session.status === 'upcoming' || session.status === 'ongoing') {
      thead.innerHTML = `
        <tr>
          <th>Candidate</th><th>ID / Roll No</th><th>ID Verified</th><th>Voucher</th>
          <th>Progress</th><th>Accomm.</th><th>Exam Mode</th><th>Retake</th><th>Retake Mode</th><th>Action</th>
        </tr>`;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      // Voucher actions are available while a class is draft/upcoming/ongoing
      // (i.e. before the exam starts) and the candidate's voucher isn't settled.
      const gateOpen = (session.status === 'draft' || session.status === 'upcoming' || session.status === 'ongoing');
      tbody.innerHTML = cands.map((c, idx) => {
        const vStatus = (c.voucherStatus || '').toLowerCase();
        const isRedeemed = vStatus === 'redeemed' || vStatus === 'activated';
        const isAssigned = vStatus === 'assigned' || vStatus === 'pending';
        const isUnassigned = !isRedeemed && !isAssigned;
        const codeChip = c.voucherCode
          ? `<span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode}</span>` : '';

        // Voucher cell: Assign (pool) + Redeem (student code) when unassigned;
        // Redeem + Replace when assigned-not-redeemed; settled badge when redeemed.
        let vBadge;
        if (isRedeemed) {
          vBadge = `<div style="display:flex; align-items:center; gap:8px;">${codeChip}<span class="badge badge-success">Redeemed</span></div>`;
        } else if (isAssigned) {
          vBadge = `<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${codeChip}<span class="badge badge-warning">Assigned</span>`
            + (gateOpen ? `<button class="btn btn-primary" style="padding:3px 8px; font-size:11px;" onclick="event.stopPropagation(); CCM.redeemVoucher('${c.id}')">Redeem</button>`
                        + `<button class="btn btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="event.stopPropagation(); CCM.replaceVoucher('${c.id}')">Replace</button>` : '')
            + `</div>`;
        } else {
          vBadge = gateOpen
            ? `<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">`
              + `<button class="btn btn-primary" style="padding:3px 8px; font-size:11px;" onclick="event.stopPropagation(); CCM.assignVoucher('${c.id}')">Assign</button>`
              + `<button class="btn btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="event.stopPropagation(); CCM.redeemVoucher('${c.id}')">Redeem</button>`
              + `</div>`
            : `<span style="color:var(--status-warning); font-size:12px; font-weight:600;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span>`;
        }

        const progVal = (session.status === 'draft' || session.status === 'upcoming') ? 0 : (c.learningProgress || 0);
        const progBar = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-size:12px; font-weight:600;">${progVal}%</span><div style="flex:1; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:${progVal}%; height:100%; background:var(--brand-primary);"></div></div></div>`;

        const accomValue = (idx === 0) ? 'YES' : 'NO';
        const accomHtml = `
          <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CCM.accommodationChange(this, '${c.id}')">
            <option value="NO" ${accomValue === 'NO' ? 'selected' : ''}>NO</option>
            <option value="YES" ${accomValue === 'YES' ? 'selected' : ''}>YES</option>
          </select>`;

        // Remind only makes sense for an unassigned candidate while the gate is open.
        const remindBtn = (isUnassigned && gateOpen)
          ? `<button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" title="Remind candidate to buy a voucher" onclick="event.stopPropagation(); CCM.remindCandidate('${c.id}')"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">notifications_active</i></button>`
          : '';

        return `
        <tr style="vertical-align:middle;">
          <td>
            <button type="button" class="ccm-name-link" style="background:none; border:none; padding:0; text-align:left; cursor:pointer; font:inherit; color:inherit;" onclick="CCM.deepDive('${c.id}', '${(c.name||'').replace(/'/g,'')}', '${(session.name||'').replace(/'/g,'')}', ${c.learningProgress||0})">
              <div style="font-weight:600; font-size:13px; color:var(--text-primary); white-space:nowrap;">${c.name}</div>
              <div style="font-size:11px; color:var(--text-secondary); white-space:nowrap;">${c.email || 'student@domain.com'}</div>
            </button>
          </td>
          <td class="font-mono" style="font-size:12px; color:var(--text-secondary);">${c.rollNo || c.id}</td>
          <td>
            <label class="switch" style="transform:scale(0.85); transform-origin:left center; margin:0;" onclick="event.stopPropagation()">
              <input type="checkbox" class="physical-id-check" data-cand-id="${c.id}" onchange="if(this.checked) { CCM.toast('ID Verified', 'success'); }">
              <span class="switch-slider"></span>
            </label>
          </td>
          <td>${vBadge}</td>
          <td style="min-width:100px;">${progBar}</td>
          <td>${accomHtml}</td>
          <td>
            <select style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CCM.examModeChange(this)">
              <option value="In-Class" selected>In-Class</option>
              <option value="Online">Online</option>
            </select>
          </td>
          <td>
            <label class="switch" style="transform:scale(0.85); transform-origin:left center; margin:0;" onclick="event.stopPropagation()">
              <input type="checkbox" onchange="if(this.checked) { CCM.toast('Retake Enabled', 'success'); document.getElementById('retake-mode-${c.id}').disabled=false; } else { document.getElementById('retake-mode-${c.id}').disabled=true; }">
              <span class="switch-slider"></span>
            </label>
          </td>
          <td>
            <select id="retake-mode-${c.id}" disabled style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CCM.examModeChange(this)">
              <option value="In-Class" selected>In-Class</option>
              <option value="Online">Online</option>
            </select>
          </td>
          <td style="text-align:center;">
            <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
              ${remindBtn}
              <button class="icon-button" style="color:var(--status-error); padding:4px;" title="Remove candidate" onclick="event.stopPropagation(); CCM.removeCandidateFromSession('${c.id}')">
                <i class="material-icons-outlined" style="font-size:16px;">delete</i>
              </button>
            </div>
          </td>
        </tr>`;
      }).join('');

    } else if (session.status === 'completed') {
      thead.innerHTML = `
        <tr>
          <th>Candidate Name</th><th>Email ID</th><th>ID / Roll No</th>
          <th>Score (out of 100)</th><th>Result</th><th>Flags / Incident</th><th>Retake Status</th>
        </tr>`;
      if (cands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates enrolled yet.</td></tr>`;
        return;
      }
      tbody.innerHTML = cands.map(c => {
        const score = Math.floor(Math.random() * 100);
        let result, resultClass;
        if (score > 75) { result = 'Passed'; resultClass = 'badge-success'; }
        else if (score > 40) { result = 'Failed'; resultClass = 'badge-error'; }
        else { result = 'Suspended'; resultClass = 'badge-error'; }

        const flagsCount = Math.floor(Math.random() * 3);
        let flagsHtml = '--';
        if (flagsCount > 0) {
          const reasons = ['Multiple Faces', 'Looking Away', 'Background Noise'];
          const reason = reasons[Math.floor(Math.random() * reasons.length)];
          flagsHtml = `<div style="display:flex; flex-direction:column; gap:4px;"><span style="color:var(--status-error); font-weight:600; font-size:12px;">${flagsCount} Flag(s)</span><span style="font-size:11px; color:var(--text-secondary);">${reason}</span></div>`;
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
              <select style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onchange="CCM.toast('Retake status updated.', 'success')">
                <option>Not Eligible</option><option>In Class</option><option>Online</option>
              </select>
            </td>
          </tr>`;
      }).join('');
    }
  },

  renderSessionDetailMaterials() {
    const session = this.sessions().find(s => s.id === this.currentSessionId);
    const grid = document.getElementById('sd-materials-grid');
    if (!grid) return;
    if (this.host && this.host.renderSessionDetailMaterials) {
      this.host.renderSessionDetailMaterials(session, grid);
      return;
    }
    grid.innerHTML = '<div style="text-align:center; padding:48px; color:var(--text-secondary); width:100%;"><i class="material-icons-outlined" style="font-size:48px; opacity:0.5; margin-bottom:16px;">library_books</i><br>No materials attached to this class.</div>';
  },

  removeCandidateFromSession(candId) {
    const session = this.sessions().find(s => s.id === this.currentSessionId);
    if (session && typeof session.candidateCount === 'number' && session.candidateCount > 0) {
      session.candidateCount -= 1;
    }
    this.toast('Candidate removed from class.', 'info');
    this.renderSessionDetailCandidates();
  },

  // ---- session lifecycle (host hooks with defaults) -----------------------
  startSession(id) {
    if (this.host && this.host.startSession) { this.host.startSession(id); return; }
    const session = this.sessions().find(s => s.id === id);
    if (!session) return;
    session.status = 'ongoing';
    this.toast('Class Started successfully.', 'success');
    this.renderSessions('all');
    this.openSessionDetail(id);
  },

  confirmStartExam(id) {
    if (this.host && this.host.confirmStartExam) { this.host.confirmStartExam(id); return; }
    const session = this.sessions().find(s => s.id === id);
    if (!session) return;
    const candCount = session.candidateCount || 40;
    let assistantHtml = '';
    if (candCount > 35) {
      assistantHtml = `
        <div style="background:var(--status-warning-bg); border:1px solid var(--status-warning); padding:12px; border-radius:8px; margin-bottom:16px;">
          <div style="font-size:13px; font-weight:600; color:var(--status-warning); margin-bottom:4px;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> Assistant Proctor Required</div>
          <div style="font-size:12px; color:var(--status-warning); margin-bottom:12px;">This class has more than 35 candidates. You must provide an Assistant Proctor code to proceed.</div>
          <input type="text" placeholder="Assistant Proctor Code" id="assistant-proctor-code" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-color);">
        </div>`;
    }
    const modalHtml = `
      <div class="batch-modal-overlay open" id="start-exam-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center;" onclick="if(event.target === this) this.remove()">
        <div class="card" style="max-width: 500px; width:90%;">
          <h2 style="font-size:20px; font-weight:600; margin:0 0 16px 0;">Start Exam Confirmation</h2>
          <p style="font-size:14px; color:var(--text-secondary); margin-bottom:24px;">Are you sure you want to start the exam? Once started, candidates will be able to begin and the timer will commence. Please ensure all candidates are present and physical IDs have been verified.</p>
          ${assistantHtml}
          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button class="btn btn-secondary" onclick="document.getElementById('start-exam-modal').remove()">Cancel</button>
            <button class="btn btn-primary" style="background:var(--status-success); color:#fff; border-color:var(--status-success);" onclick="
              ${candCount > 35 ? `if(!document.getElementById('assistant-proctor-code').value) { CCM.toast('Please enter Assistant Proctor code.', 'error'); return; }` : ''}
              document.getElementById('start-exam-modal').remove(); CCM.navigate('monitoring');
            ">Confirm &amp; Start Exam</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
};
