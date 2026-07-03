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

  // ==========================================================================
  // DATA MODEL HELPERS  (candidate IDs, voucher codes, rule resolution)
  // ==========================================================================
  // Auto-generate a human-readable, collision-checked candidate ID. No generator
  // existed before (CAN-### were hardcoded, RN-#### was random with no shape).
  genCandidateId() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // base32, no ambiguous 0/O/1/I
    const existing = new Set(this.candidates().map(c => c && c.candidateId).filter(Boolean));
    for (let attempt = 0; attempt < 50; attempt++) {
      let s = '';
      for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
      const id = 'SDC-CAN-' + s;
      if (!existing.has(id)) return id;
    }
    return 'SDC-CAN-' + Date.now().toString(36).toUpperCase().slice(-4);
  },

  // Generate a voucher code. Prefix encodes the delivery type so the redeem path
  // can route it: VCH-C#### for in-class (In-House), VCH-O#### for online
  // (Internet Proctored). Matches the VCH- family already in data/vouchers.json.
  genVoucherCode(examMode) {
    const n = Math.floor(1000 + Math.random() * 9000);
    return (examMode === 'online' ? 'VCH-O' : 'VCH-C') + n;
  },

  // Resolve the effective exam rules for a candidate: a per-candidate override
  // wins; otherwise inherit the candidate's class defaults; otherwise the hard
  // platform default (in-class, no retake, org pays). Standalone candidates
  // (no sessionId) simply skip the class layer.
  effectiveRules(candidate) {
    const cls = candidate && candidate.sessionId
      ? this.sessions().find(s => s.id === candidate.sessionId)
      : null;
    const ov = (candidate && candidate.rules) || {};
    const pick = (override, classVal, hard) =>
      (override !== undefined && override !== null) ? override
        : (classVal !== undefined && classVal !== null) ? classVal
          : hard;
    // Class stores allowOnline/allowRetake/onlinePayer; a class never *forces*
    // online, it only *permits* it — so the class layer for examMode is the
    // hard 'in-class' default unless the candidate overrides to online.
    const examMode = pick(ov.examMode, null, 'in-class');
    const retakeAllowed = pick(ov.retakeAllowed, cls ? !!cls.allowRetake : null, false);
    const retakeMode = pick(ov.retakeMode, null, 'in-class');
    const onlinePayer = pick(ov.onlinePayer, cls ? cls.onlinePayer : null, 'organization');
    return {
      examMode,
      onlineAllowed: examMode === 'online' || (cls ? !!cls.allowOnline : false),
      retakeAllowed,
      retakeMode,
      onlinePayer: onlinePayer || 'organization',
      inheritedFromClass: !!cls
    };
  },

  addCandidate() { if (this.host && this.host.openAddCandidate) this.host.openAddCandidate(this.currentSessionId); },

  // ==========================================================================
  // ADD-CANDIDATE FORM  (shared markup + submit, host-agnostic)
  // The host opens its own shell (drawer/modal) and injects this HTML, then a
  // submit button calls CCM.submitCandidateForm(). One implementation, both
  // portals. Field ids are prefixed `ccm-ac-` to avoid collisions.
  // ==========================================================================
  addCandidateFormHtml(sessionId) {
    const sid = sessionId || '';
    const lockClass = !!sid;
    const classOpts = ['<option value="">None (standalone)</option>']
      .concat(this.sessions().map(s =>
        `<option value="${s.id}" ${s.id === sid ? 'selected' : ''}>${s.name}</option>`)).join('');
    // Assessment options: class programs + a few common assessments.
    const programNames = Array.from(new Set(this.sessions().map(s => s.program).filter(Boolean)));
    const assessments = Array.from(new Set(programNames.concat([
      'Food Safety Manager', 'ServSafe Food Handler', 'HACCP Certification', 'Professional Chef Certification'
    ])));
    const assessmentOpts = assessments.map(a => `<option value="${a}">${a}</option>`).join('');
    const genId = this.genCandidateId();
    return `
      <div class="ccm-form">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" class="form-control" id="ccm-ac-name" placeholder="e.g. Jordan Lee">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-control" id="ccm-ac-email" placeholder="e.g. jordan@example.com">
        </div>
        <div class="form-group">
          <label>Candidate ID <span style="font-weight:normal; color:var(--text-secondary, var(--on-sur-var));">(auto-generated)</span></label>
          <input type="text" class="form-control" id="ccm-ac-candidateid" value="${genId}" readonly style="font-family:var(--font-mono, monospace); background:var(--border-light, rgba(127,127,127,.1));">
        </div>
        <div class="form-group">
          <label>Exam / Assessment</label>
          <select class="form-control" id="ccm-ac-assessment">${assessmentOpts}</select>
        </div>
        <div class="form-group">
          <label>Class</label>
          <select class="form-control" id="ccm-ac-class" ${lockClass ? 'disabled' : ''}>${classOpts}</select>
          ${lockClass ? `<input type="hidden" id="ccm-ac-class-locked" value="${sid}">` : ''}
        </div>
        <div class="form-group">
          <label>Accommodations</label>
          <select class="form-control" id="ccm-ac-accom" onchange="CCM.acToggleAccommodation(this)">
            <option value="NO">No</option>
            <option value="YES">Yes</option>
          </select>
          <div id="ccm-ac-accom-note-wrap" style="display:none; margin-top:8px;">
            <label>Explanation <span style="color:var(--status-error,#b3261e);">*</span></label>
            <textarea class="form-control" id="ccm-ac-accom-note" rows="2" placeholder="Describe the accommodation (e.g. extra time, screen reader)…"></textarea>
          </div>
        </div>
        <div class="form-group">
          <label>Exam Mode</label>
          <select class="form-control" id="ccm-ac-exammode">
            <option value="in-class" selected>In-Class (default)</option>
            <option value="online">Online</option>
          </select>
        </div>
        <!-- Retake is a top-level toggle (independent of the primary exam mode):
             Allow Retake → if on, Retake Mode → if online, who pays. -->
        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <label style="margin:0;">Allow Retake</label>
          <label class="switch" style="margin:0;">
            <input type="checkbox" id="ccm-ac-retake" onchange="CCM.acToggleRetake(this)">
            <span class="switch-slider"></span>
          </label>
        </div>
        <div id="ccm-ac-retake-opts" style="display:none; border-left:2px solid var(--brand-primary, var(--pri)); padding-left:12px; margin-bottom:16px;">
          <div class="form-group" id="ccm-ac-retake-mode-wrap">
            <label>Retake Mode</label>
            <select class="form-control" id="ccm-ac-retake-mode" onchange="CCM.acToggleRetakePayer(this)">
              <option value="in-class">In-Class</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div class="form-group" id="ccm-ac-payer-wrap" style="display:none;">
            <label>Who pays for the online retake?</label>
            <div style="display:flex; gap:16px; margin-top:4px;">
              <label style="display:flex; align-items:center; gap:6px; font-weight:normal;"><input type="radio" name="ccm-ac-payer" value="organization" checked> Organisation</label>
              <label style="display:flex; align-items:center; gap:6px; font-weight:normal;"><input type="radio" name="ccm-ac-payer" value="student"> Candidate</label>
            </div>
          </div>
        </div>
        <div class="form-group" style="background:var(--brand-active, rgba(127,127,127,.08)); border-radius:8px; padding:12px; font-size:13px; color:var(--text-secondary, var(--on-sur-var));">
          <i class="material-icons-outlined" style="font-size:16px; vertical-align:middle;">confirmation_number</i>
          A voucher will be <strong>auto-assigned by the system</strong>. The candidate redeems it at login.
        </div>
        <button class="btn btn-primary" style="width:100%; justify-content:center;" onclick="CCM.submitCandidateForm(this)">Add Candidate</button>
      </div>`;
  },

  acToggleAccommodation(sel) {
    const wrap = document.getElementById('ccm-ac-accom-note-wrap');
    if (wrap) wrap.style.display = sel.value === 'YES' ? 'block' : 'none';
  },
  // Allow-Retake toggle reveals the retake options (mode → payer cascade).
  acToggleRetake(cb) {
    const opts = document.getElementById('ccm-ac-retake-opts');
    if (opts) opts.style.display = cb.checked ? 'block' : 'none';
    if (!cb.checked) {
      const payer = document.getElementById('ccm-ac-payer-wrap');
      if (payer) payer.style.display = 'none';
    }
  },
  // Online retake → ask who pays; in-class retake → hide the payer choice.
  acToggleRetakePayer(sel) {
    const wrap = document.getElementById('ccm-ac-payer-wrap');
    if (wrap) wrap.style.display = sel.value === 'online' ? 'block' : 'none';
  },

  submitCandidateForm(btn) {
    const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const name = val('ccm-ac-name') || 'New Candidate';
    const email = val('ccm-ac-email') || 'candidate@example.com';
    const candidateId = val('ccm-ac-candidateid') || this.genCandidateId();
    const examAssessment = val('ccm-ac-assessment');
    const lockedClass = document.getElementById('ccm-ac-class-locked');
    const sessionId = lockedClass ? lockedClass.value : val('ccm-ac-class');
    const accomEnabled = val('ccm-ac-accom') === 'YES';
    const accomNote = val('ccm-ac-accom-note');
    if (accomEnabled && !accomNote) { this.toast('Please provide an accommodation explanation.', 'error'); return; }

    const examMode = (document.getElementById('ccm-ac-exammode') || {}).value || 'in-class';
    // Only persist rule fields the user actually engaged, so unset rules keep
    // inheriting from the class (the override semantics in effectiveRules).
    const rules = {};
    if (examMode === 'online') rules.examMode = 'online';
    // Retake is independent of the primary exam mode: only persist it when the
    // toggle is on (off = inherit the class default).
    const retakeOn = !!(document.getElementById('ccm-ac-retake') || {}).checked;
    if (retakeOn) {
      rules.retakeAllowed = true;
      const retakeMode = (document.getElementById('ccm-ac-retake-mode') || {}).value || 'in-class';
      rules.retakeMode = retakeMode;
      if (retakeMode === 'online') {
        const payerEl = document.querySelector('input[name="ccm-ac-payer"]:checked');
        rules.onlinePayer = payerEl ? payerEl.value : 'organization';
      }
    }

    const voucherCode = this.genVoucherCode(examMode);
    const cand = {
      id: 'c' + Date.now(),
      candidateId,
      name, email, examAssessment,
      sessionId: sessionId || undefined,
      accommodation: { enabled: accomEnabled, note: accomEnabled ? accomNote : '' },
      rules,
      voucherCode,
      voucherStatus: 'assigned',
      examStatus: 'enrolled',
      learningProgress: 0
    };

    // Persist the system-assigned voucher to the backend so the candidate can
    // redeem/activate it at login (only while unused). Fire-and-forget; guarded
    // for static/file:// contexts where there's no API.
    this._persistAssignedVoucher(cand);

    if (this.host && this.host.commitCandidate) this.host.commitCandidate(cand);
    else { this.candidates().unshift(cand); this.renderCandidates('all'); }
    this.toast(`Candidate added · ID ${candidateId} · voucher ${voucherCode} assigned.`, 'success');
  },

  _persistAssignedVoucher(cand) {
    try {
      if (typeof fetch !== 'function' || !/^https?:$/.test(location.protocol)) return;
      const eff = this.effectiveRules(cand);
      fetch('/api/vouchers/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucherId: cand.voucherCode,
          candidateId: cand.candidateId,
          candidateName: cand.name,
          examAssessment: cand.examAssessment,
          sessionId: cand.sessionId || null,
          type: eff.examMode === 'online' ? 'Internet Proctored' : 'In-House'
        })
      }).catch(() => {});
    } catch (e) { /* no-op in non-browser/static contexts */ }
  },
  addClass() { if (this.host && this.host.openAddClass) this.host.openAddClass(); },
  manageCandidate(id) {
    if (this.host && this.host.manageCandidate) this.host.manageCandidate(id);
    else this.toast('Candidate details unavailable.', 'info');
  },
  deepDive(id, name, className, progress) {
    if (this.host && this.host.deepDive) this.host.deepDive(id, name, className, progress);
    else this.toast('Opening learning details…', 'info');
  },
  // Find a candidate by id (helper for the persisted session-detail controls).
  _cand(id) { return this.candidates().find(c => c.id === id); },

  // Persist a per-candidate exam-mode override from the session-detail table.
  examModeChange(el, id) {
    const c = id && this._cand(id);
    if (c) {
      c.rules = c.rules || {};
      c.rules.examMode = el.value; // 'in-class' | 'online'
      this.toast(el.value === 'online' ? 'Exam mode set to Online (override).' : 'Exam mode set to In-Class (override).', 'success');
      return;
    }
    if (this.host && this.host.examModeChange) this.host.examModeChange(el);
  },
  // Persist accommodation (+ explanation) from the session-detail table.
  accommodationChange(el, id) {
    const c = id && this._cand(id);
    if (!c) { if (this.host && this.host.accommodationChange) this.host.accommodationChange(el, id); return; }
    c.accommodation = c.accommodation || { enabled: false, note: '' };
    if (el && el.value === 'YES') {
      const reason = prompt('Please provide an explanation for the accommodation:', c.accommodation.note || '');
      if (reason) { c.accommodation = { enabled: true, note: reason }; this.toast('Accommodation reason saved.', 'success'); }
      else { el.value = 'NO'; c.accommodation = { enabled: false, note: '' }; }
    } else {
      c.accommodation = { enabled: false, note: '' };
      this.toast('Accommodation removed.', 'info');
    }
  },
  // Persist retake on/off; enable/disable the paired retake-mode select.
  retakeToggle(cb, id) {
    const c = id && this._cand(id);
    const modeSel = document.getElementById('retake-mode-' + id);
    if (c) { c.rules = c.rules || {}; c.rules.retakeAllowed = !!cb.checked; }
    if (modeSel) modeSel.disabled = !cb.checked;
    this.toast(cb.checked ? 'Retake enabled (override).' : 'Retake disabled (override).', cb.checked ? 'success' : 'info');
  },
  // Persist the retake mode override.
  retakeModeChange(el, id) {
    const c = id && this._cand(id);
    if (c) { c.rules = c.rules || {}; c.rules.retakeMode = el.value; }
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
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-secondary);">No candidates match this filter.</td></tr>`;
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

      // Read-only status + a Redeem link CTA (opens the voucher-code popup),
      // matching the in-class proctor candidate list.
      const redeemLink = `<a href="#" class="ccm-redeem-link" onclick="event.stopPropagation(); event.preventDefault(); CCM.redeemVoucher('${c.id}')" style="color:var(--brand-primary); font-weight:600; font-size:12px; text-decoration:none; white-space:nowrap;">Redeem</a>`;

      let voucherHtml = '';
      if (isUnassigned) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span style="color:var(--status-warning); font-size:12px; font-weight:600;" title="Read-only status"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span>${redeemLink}</div>`;
      } else if (isPending) {
        voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || 'PENDING'}</span><span class="badge badge-warning" title="Read-only status">Pending</span>${redeemLink}</div>`;
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

      // Class the candidate is enrolled in (collapsed header) + Start Exam CTA.
      const cls = c.sessionId ? this.sessions().find(s => s.id === c.sessionId) : null;
      const className = cls ? cls.name : 'Unassigned';
      const canStart = !!cls;
      // A completed exam can't be (re)started from here — surface the result instead.
      const isCompleted = c.examStatus === 'completed';
      const startExamBtn = isCompleted
        ? `<button class="btn btn-secondary" style="padding:4px 12px; font-size:12px; display:inline-flex; align-items:center; gap:6px;" onclick="event.stopPropagation(); CCM.manageCandidate('${c.id}')"><i class="material-icons" style="font-size:16px;">visibility</i> View Result</button>`
        : `<button class="btn btn-primary" style="padding:4px 12px; font-size:12px; display:inline-flex; align-items:center; gap:6px;${canStart ? '' : ' opacity:.5; cursor:not-allowed;'}" ${canStart ? `onclick="event.stopPropagation(); CCM.confirmStartExam('${cls.id}')"` : 'disabled title="Assign this candidate to a class first"'}><i class="material-icons" style="font-size:16px;">play_circle_filled</i> Start Exam</button>`;

      // Effective (class-default + candidate-override) rules for the inline config.
      const eff = this.effectiveRules(c);
      if (!c.accommodation) c.accommodation = { enabled: false, note: '' };
      const accomValue = c.accommodation.enabled ? 'YES' : 'NO';
      const payerVisible = eff.retakeAllowed && eff.retakeMode === 'online';

      const detailHtml = `
        <div class="cand-cfg-grid">
          <div class="cand-cfg">
            <label class="cand-cfg-lbl">Exam Mode</label>
            <select class="form-control cand-cfg-ctl" onchange="CCM.examModeChange(this, '${c.id}')">
              <option value="in-class" ${eff.examMode === 'in-class' ? 'selected' : ''}>In-Class</option>
              <option value="online" ${eff.examMode === 'online' ? 'selected' : ''}>Online</option>
            </select>
          </div>
          <div class="cand-cfg">
            <label class="cand-cfg-lbl">Allow Retake</label>
            <label class="switch" style="margin-top:4px;">
              <input type="checkbox" id="dir-retake-${c.id}" ${eff.retakeAllowed ? 'checked' : ''} onchange="CCM.dirRetakeToggle(this,'${c.id}')">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="cand-cfg">
            <label class="cand-cfg-lbl">Retake Mode</label>
            <select id="dir-retake-mode-${c.id}" class="form-control cand-cfg-ctl" ${eff.retakeAllowed ? '' : 'disabled'} onchange="CCM.retakeModeChange(this,'${c.id}'); CCM.acDirPayerSync('${c.id}')">
              <option value="in-class" ${eff.retakeMode === 'in-class' ? 'selected' : ''}>In-Class</option>
              <option value="online" ${eff.retakeMode === 'online' ? 'selected' : ''}>Online</option>
            </select>
          </div>
          <div class="cand-cfg" id="dir-payer-wrap-${c.id}" style="display:${payerVisible ? 'block' : 'none'};">
            <label class="cand-cfg-lbl">Who pays for online retake?</label>
            <select id="dir-payer-${c.id}" class="form-control cand-cfg-ctl" onchange="CCM.payerChange('${c.id}', this.value)">
              <option value="organization" ${eff.onlinePayer === 'organization' ? 'selected' : ''}>Organisation</option>
              <option value="student" ${eff.onlinePayer === 'student' ? 'selected' : ''}>Candidate</option>
            </select>
          </div>
          <div class="cand-cfg">
            <label class="cand-cfg-lbl">Voucher</label>
            <div style="margin-top:4px;">${voucherHtml}</div>
          </div>
          <div class="cand-cfg">
            <label class="cand-cfg-lbl">Accommodation</label>
            <select class="form-control cand-cfg-ctl" onchange="CCM.accommodationChange(this, '${c.id}')">
              <option value="NO" ${accomValue === 'NO' ? 'selected' : ''}>No</option>
              <option value="YES" ${accomValue === 'YES' ? 'selected' : ''}>Yes</option>
            </select>
          </div>
          <div class="cand-cfg">
            <label class="cand-cfg-lbl">ID Verified</label>
            <label class="switch" style="margin-top:4px;">
              <input type="checkbox" class="physical-id-check" data-cand-id="${c.id}" onchange="if(this.checked){CCM.toast('ID Verified','success');}">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div class="cand-cfg">
            <label class="cand-cfg-lbl">Exam Status / Result</label>
            <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">${statusBadge} ${examResult}</div>
          </div>
        </div>`;

      return `
        <tr class="cand-acc-head" onclick="CCM.toggleCandidateRow(this)" style="cursor:pointer;">
          <td style="width:40px; text-align:center;"><i class="material-icons cand-acc-chevron">expand_more</i></td>
          <td style="width:40px;" onclick="event.stopPropagation();"><input type="checkbox" class="cand-checkbox" onchange="CCM.updateBulkActions()"></td>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${c.photo || 'https://via.placeholder.com/150'}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
              <div>
                <div style="font-weight:600; font-size:14px;">${c.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${c.email}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight:500; font-size:13px;">${className}</div>
            <div style="margin-top:4px;">${statusBadge}</div>
          </td>
          <td style="text-align:right;" onclick="event.stopPropagation();">
            <div style="display:flex; gap:8px; justify-content:flex-end; align-items:center;">
              ${startExamBtn}
              <button class="btn btn-secondary" style="padding:4px 12px; font-size:12px;" onclick="CCM.manageCandidate('${c.id}')">Manage</button>
            </div>
          </td>
        </tr>
        <tr class="cand-acc-detail" style="display:none;">
          <td colspan="5" style="padding:0;">
            <div class="cand-acc-panel">${detailHtml}</div>
          </td>
        </tr>
      `;
    }).join('');

    this.updateBulkActions();
  },

  // Expand/collapse a candidate accordion row (header → detail sibling).
  toggleCandidateRow(row) {
    const detail = row.nextElementSibling;
    if (!detail || !detail.classList.contains('cand-acc-detail')) return;
    const open = detail.style.display === 'none' || !detail.style.display;
    detail.style.display = open ? 'table-row' : 'none';
    row.classList.toggle('cand-acc-open', open);
  },

  // Persist the online-retake payer override from the directory accordion.
  payerChange(id, val) {
    const c = id && this._cand(id);
    if (c) { c.rules = c.rules || {}; c.rules.onlinePayer = val; }
    this.toast('Retake payer updated.', 'success');
  },

  // Directory-scoped retake toggle (own select id to avoid colliding with the
  // session-detail table's `retake-mode-${id}`). Persists + syncs the cascade.
  dirRetakeToggle(cb, id) {
    const c = id && this._cand(id);
    if (c) { c.rules = c.rules || {}; c.rules.retakeAllowed = !!cb.checked; }
    const modeSel = document.getElementById('dir-retake-mode-' + id);
    if (modeSel) modeSel.disabled = !cb.checked;
    this.acDirPayerSync(id);
    this.toast(cb.checked ? 'Retake enabled (override).' : 'Retake disabled (override).', cb.checked ? 'success' : 'info');
  },

  // Show the payer choice only when retake is on AND the retake mode is online.
  acDirPayerSync(id) {
    const cb = document.getElementById('dir-retake-' + id);
    const modeSel = document.getElementById('dir-retake-mode-' + id);
    const wrap = document.getElementById('dir-payer-wrap-' + id);
    if (!wrap) return;
    const on = cb && cb.checked;
    const online = modeSel && modeSel.value === 'online';
    wrap.style.display = (on && online) ? 'block' : 'none';
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
  // Candidates shown for a class: prefer real membership (candidate.sessionId),
  // fall back to the legacy slice-by-count for seed data that predates sessionId.
  sessionCandidates(session) {
    if (!session) return [];
    const owned = this.candidates().filter(c => c.sessionId === session.id);
    if (owned.length) return owned;
    return this.candidates().slice(0, session.candidateCount || 4);
  },

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
    const sdCands = this.sessionCandidates(session);
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
    const cands = this.sessionCandidates(session);
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
          // Redeem is a link CTA; Replace stays a small secondary button.
          vBadge = `<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">${codeChip}<span class="badge badge-warning">Assigned</span>`
            + (gateOpen ? `<a href="#" class="ccm-redeem-link" onclick="event.stopPropagation(); event.preventDefault(); CCM.redeemVoucher('${c.id}')" style="color:var(--brand-primary); font-weight:600; font-size:12px; text-decoration:none;">Redeem</a>`
                        + `<button class="btn btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="event.stopPropagation(); CCM.replaceVoucher('${c.id}')">Replace</button>` : '')
            + `</div>`;
        } else {
          // Unassigned + gate open: offer Assign (from pool) and a Redeem link
          // (candidate-purchased code).
          vBadge = gateOpen
            ? `<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">`
              + `<button class="btn btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="event.stopPropagation(); CCM.assignVoucher('${c.id}')">Assign</button>`
              + `<a href="#" class="ccm-redeem-link" onclick="event.stopPropagation(); event.preventDefault(); CCM.redeemVoucher('${c.id}')" style="color:var(--brand-primary); font-weight:600; font-size:12px; text-decoration:none;">Redeem</a>`
              + `</div>`
            : `<span style="color:var(--status-warning); font-size:12px; font-weight:600;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span>`;
        }

        const progVal = (session.status === 'draft' || session.status === 'upcoming') ? 0 : (c.learningProgress || 0);
        const progBar = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-size:12px; font-weight:600;">${progVal}%</span><div style="flex:1; height:6px; background:var(--border-light); border-radius:3px; overflow:hidden;"><div style="width:${progVal}%; height:100%; background:var(--brand-primary);"></div></div></div>`;

        // Effective (class-default + candidate-override) rules + persisted accommodation.
        const eff = this.effectiveRules(c);
        if (!c.accommodation) c.accommodation = { enabled: false, note: '' };
        const accomValue = c.accommodation.enabled ? 'YES' : 'NO';
        const accomTitle = c.accommodation.enabled && c.accommodation.note ? ` title="${(c.accommodation.note||'').replace(/"/g,'&quot;')}"` : '';
        const accomHtml = `
          <select${accomTitle} style="padding:6px; border-radius:4px; border:1px solid var(--border-color); font-size:12px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CCM.accommodationChange(this, '${c.id}')">
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
            <select style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CCM.examModeChange(this, '${c.id}')" title="${eff.inheritedFromClass && !(c.rules&&c.rules.examMode) ? 'Inherited from class default' : 'Per-candidate override'}">
              <option value="in-class" ${eff.examMode === 'in-class' ? 'selected' : ''}>In-Class</option>
              <option value="online" ${eff.examMode === 'online' ? 'selected' : ''}>Online</option>
            </select>
          </td>
          <td>
            <label class="switch" style="transform:scale(0.85); transform-origin:left center; margin:0;" onclick="event.stopPropagation()">
              <input type="checkbox" ${eff.retakeAllowed ? 'checked' : ''} onchange="CCM.retakeToggle(this, '${c.id}')">
              <span class="switch-slider"></span>
            </label>
          </td>
          <td>
            <select id="retake-mode-${c.id}" ${eff.retakeAllowed ? '' : 'disabled'} style="padding:4px; border-radius:4px; border:1px solid var(--border-color); font-size:11px; background:var(--bg-color);" onclick="event.stopPropagation();" onchange="CCM.retakeModeChange(this, '${c.id}')">
              <option value="in-class" ${eff.retakeMode === 'in-class' ? 'selected' : ''}>In-Class</option>
              <option value="online" ${eff.retakeMode === 'online' ? 'selected' : ''}>Online</option>
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
