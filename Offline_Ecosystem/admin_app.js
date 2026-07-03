const app = {
    state: {
        theme: 'light',
        viewMode: { vouchers: 'list', proctors: 'list', candidates: 'list' },
        candidateSearch: '',
        // Ordered list of dashboard widget ids currently shown. Hydrated from
        // localStorage by loadDashboardLayout() on init (see app.widgets).
        dashboardLayout: [],
        // Seeded inventory: voucher pools allocated to the organization
        // (instead of the day-zero empty state) so the inventory table and
        // dashboard balance show real data on load.
        vouchers: [
            { id: 'v-chef-001',  name: 'Professional Chef Certification', purchased: 10, used: 4,  available: 6,  delivery: 'Digital' },
            { id: 'v-fss-002',   name: 'Food Safety Standard',           purchased: 50, used: 18, available: 32, delivery: 'Digital' },
            { id: 'v-haccp-003', name: 'HACCP Level 3',                  purchased: 25, used: 9,  available: 16, delivery: 'Physical' },
            { id: 'v-culin-004', name: 'Culinary Arts',                  purchased: 30, used: 12, available: 18, delivery: 'Digital' }
        ],
        proctors: [],
        candidates: [],
        classes: [],
        b2b: {
            invoices: [],
            requests: [],
            transfers: [],
            profile: { name: '', taxId: '', address: '' },
            procurePath: 'instant'
        }
    },

    async init() {
        this.setupNavigation();
        this.setupThemeToggle();
        this.setupTabs();

        try {
            const [sessionsRes, candidatesRes] = await Promise.all([
                fetch('data/sessions.json'),
                fetch('data/candidates.json')
            ]);
            
            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                this.state.classes = sessionsData.map(s => ({
                    id: s.id,
                    name: s.name,
                    program: s.program || s.subject,
                    status: s.status,
                    createdAt: s.createdAt.split('T')[0],
                    examDate: s.examDate ? s.examDate.split('T')[0] : 'TBD',
                    candidateCount: s.candidateCount,
                    readiness: s.readiness || Math.floor(Math.random() * 40) + 60,
                    // Class-level rule DEFAULTS (inherited by candidates unless overridden).
                    allowRetake: !!s.allowRetake,
                    allowOnline: !!s.allowOnline,
                    onlinePayer: s.onlinePayer || null
                }));
            }
            
            if (candidatesRes.ok) {
                const candidatesData = await candidatesRes.json();
                this.state.candidates = candidatesData.map(c => ({
                    id: c.id,
                    name: c.name,
                    rollNo: c.rollNo,
                    candidateId: c.candidateId || c.rollNo,
                    examAssessment: c.examAssessment || c.subject || '',
                    sessionId: c.sessionId,
                    accommodation: c.accommodation || { enabled: false, note: '' },
                    rules: c.rules || {},
                    voucherStatus: c.voucherStatus || 'unassigned',
                    voucherCode: c.voucherCode || '',
                    examStatus: c.examStatus || 'enrolled',
                    learningProgress: c.learningProgress || 0,
                    email: c.email || (c.name.replace(' ', '.').toLowerCase() + '@email.com')
                }));
            }

            // Seeded directory: 12 proctors onboarded (8 active, 2 in training,
            // 2 pending) so the Proctor Management tabs show real data on load.
            this.state.proctors = [
                { id: 1,  name: 'Marcus Bennett',   email: 'marcus.bennett@sdc.edu',   status: 'Active',      sdcId: 'SDC-P-1001' },
                { id: 2,  name: 'Priya Nair',       email: 'priya.nair@sdc.edu',       status: 'Active',      sdcId: 'SDC-P-1002' },
                { id: 3,  name: 'David Okafor',     email: 'david.okafor@sdc.edu',     status: 'Active',      sdcId: 'SDC-P-1003' },
                { id: 4,  name: 'Sofia Reyes',      email: 'sofia.reyes@sdc.edu',      status: 'Active',      sdcId: 'SDC-P-1004' },
                { id: 5,  name: 'Aisha Khan',       email: 'aisha.khan@sdc.edu',       status: 'Active',      sdcId: 'SDC-P-1005' },
                { id: 6,  name: 'Liam Murphy',      email: 'liam.murphy@sdc.edu',      status: 'Active',      sdcId: 'SDC-P-1006' },
                { id: 7,  name: 'Chen Wei',         email: 'chen.wei@sdc.edu',         status: 'Active',      sdcId: 'SDC-P-1007' },
                { id: 8,  name: 'Isabella Rossi',   email: 'isabella.rossi@sdc.edu',   status: 'Active',      sdcId: 'SDC-P-1008' },
                { id: 9,  name: 'James Whitfield',  email: 'james.whitfield@sdc.edu',  status: 'In Training', sdcId: 'SDC-P-1009' },
                { id: 10, name: 'Fatima Al-Sayed',  email: 'fatima.alsayed@sdc.edu',   status: 'In Training', sdcId: 'SDC-P-1010' },
                { id: 11, name: 'Lena Hoffmann',    email: 'lena.hoffmann@sdc.edu',    status: 'Pending',     sdcId: 'SDC-P-1011' },
                { id: 12, name: 'Carlos Mendes',    email: 'carlos.mendes@sdc.edu',    status: 'Pending',     sdcId: 'SDC-P-1012' }
            ];

        } catch (err) {
            console.error('Error fetching real data:', err);
        }

        // Wire the shared Class & Candidate Management module (CCM).
        if (window.CCM) {
            CCM.init({
                getSessions: () => this.state.classes,
                getCandidates: () => this.state.candidates,
                showToast: (m, t) => this.showToast(m, t),
                showView: (v) => this.showView(v),
                openAddCandidate: (sessionId) => this.openFormDrawer('candidate', sessionId),
                openAddClass: () => this.openFormDrawer('session'),
                manageCandidate: (id) => this.openDrawer('edit-candidate', id),
                redeemVoucher: (id) => this.openRedeemVoucherModal(id),
                commitCandidate: (cand) => this.commitCandidate(cand)
                // No renderSessionDetailMaterials hook: org has no per-class
                // materials, so CCM falls back to its empty-state.
            });
        }

        this.loadDashboardLayout();
        this.renderActivities();
        this.renderVouchers();
        this.renderProctors();
        this.filterCandidates('all');
        this.filterSessions('all');
        this.updateDashboardCards();
        this.initB2B();
    },

    initB2B() {
        // Day zero: no invoices yet.
        this.state.b2b.invoices = JSON.parse(localStorage.getItem('sdc_org_invoices')) || [];
        // Proctor Request Inbox: load saved requests, or seed a sample queue so
        // the inbox shows real data on first load (instead of an empty table).
        this.state.b2b.requests = JSON.parse(localStorage.getItem('sdc_vreq_v3')) || [
            { id: 'req-001', date: '2026-06-18', proctor: 'Marcus Bennett',  material: 'Food Safety Standard',           qty: 12, status: 'Pending' },
            { id: 'req-002', date: '2026-06-17', proctor: 'Priya Nair',      material: 'HACCP Level 3',                  qty: 8,  status: 'Pending' },
            { id: 'req-003', date: '2026-06-15', proctor: 'David Okafor',    material: 'Professional Chef Certification', qty: 5,  status: 'Approved' },
            { id: 'req-004', date: '2026-06-12', proctor: 'Sofia Reyes',     material: 'Culinary Arts',                  qty: 15, status: 'Approved' },
            { id: 'req-005', date: '2026-06-10', proctor: 'James Whitfield', material: 'Food Safety Standard',           qty: 6,  status: 'Pending' }
        ];
        this.state.b2b.transfers = JSON.parse(localStorage.getItem('sdc_ownership_transfers')) || [];
        this.state.b2b.profile = JSON.parse(localStorage.getItem('org_profile_settings')) || this.state.b2b.profile;

        this.renderB2B();
    },

    setViewMode(module, mode) {
        this.state.viewMode[module] = mode;
        if (module === 'vouchers') this.renderVouchers();
        if (module === 'proctors') this.renderProctors();
    },

    // Reusable day-zero / empty-state block.
    emptyState(icon, title, subtitle, ctaHtml = '') {
        return `<div class="empty-state" style="text-align:center; padding:48px 24px; color:var(--text-secondary);">
            <span class="material-icons" style="font-size:44px; opacity:.45; color:var(--text-secondary);">${icon}</span>
            <h3 style="margin:12px 0 4px; color:var(--text-primary); font-size:18px;">${title}</h3>
            <p style="margin:0 0 16px; font-size:14px;">${subtitle}</p>
            ${ctaHtml}
        </div>`;
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        
        toast.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:currentColor;color:var(--sur-card);font-size:12px;">${icon}</span> ${message}`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    simulateCsvUpload() {
        this.showToast('CSV Upload successful', 'success');
    },

    openFormDrawer(type, sessionId = null) {
        if(type === 'session') {
            this.openDrawer('create-class');
        } else if (type === 'candidate') {
            // Remember which class (if any) the candidate is being added to, so
            // "Add Candidate" from a live/ongoing class detail enrolls them there.
            this._addToSessionId = sessionId;
            this.openDrawer('add-candidate');
        } else {
            this.showToast(`Opening drawer to add ${type}...`, 'info');
        }
    },

    // CANDIDATES + SESSIONS RENDERING
    // Delegated to the shared Class & Candidate Management module (CCM) so the
    // org portal and the in-class proctor app render identically. See
    // shared/class_candidate_mgmt.js.
    filterCandidates(status) { if (window.CCM) CCM.filterCandidates(status); },
    renderCandidatesList(filtered) { if (window.CCM) CCM.renderCandidatesList(filtered); },
    toggleAllCandidates(e) { if (window.CCM) CCM.toggleAllCandidates(e); },
    updateBulkActions() { if (window.CCM) CCM.updateBulkActions(); },

    // Class Management is driven by the v3-style CV3 module (admin_classes_v3.js),
    // falling back to the shared CCM only if CV3 hasn't loaded.
    filterSessions(status) { if (window.CV3) CV3.filterSessions(status); else if (window.CCM) CCM.filterSessions(status); },
    setSessionViewMode(mode) { if (window.CV3) CV3.setSessionViewMode(mode); else if (window.CCM) CCM.setSessionViewMode(mode); },
    renderSessionsList(filtered) { if (window.CV3) CV3.renderSessionsList(filtered); else if (window.CCM) CCM.renderSessionsList(filtered); },
    openSessionDetail(id) { if (window.CV3) CV3.openSessionDetail(id); },

    simulateSave(btn, message) {
        btn.classList.add('loading');
        setTimeout(() => {
            btn.classList.remove('loading');
            this.showToast(message, 'success');
            this.closeModal();
        }, 800);
    },

    navigateTo(moduleId) {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.target === moduleId);
        });

        document.querySelectorAll('.module').forEach(el => {
            el.classList.toggle('active', el.id === moduleId);
        });

        const titleMap = {
            'dashboard': 'Dashboard',
            'profile': 'Profile Settings',
            'vouchers': 'Voucher Management',
            'proctors': 'Proctor Management',
            'classes': 'Class Management',
            'candidates': 'Candidate Directory',
            'session-detail': 'Class Details'
        };
        const titleEl = document.getElementById('page-title');
        if(titleEl) titleEl.innerText = titleMap[moduleId];

        const topbarActions = document.getElementById('topbar-actions');
        if (topbarActions) {
            topbarActions.innerHTML = ''; // Clear previous actions
            if (moduleId === 'vouchers') {
                topbarActions.innerHTML = `<button class="btn-primary" onclick="app.openDrawer('voucher-request')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Purchase Vouchers</button>`;
            }
            // 'classes' has its own "Add Class" button in the page header (v3 flow),
            // so no duplicate topbar action here.
        }

        // Refresh the v3-style class list when entering Class Management.
        if (moduleId === 'classes' && window.CV3) CV3.refresh();
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateTo(item.dataset.target);
            });
        });
    },

    setupThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if(toggle) toggle.addEventListener('click', () => {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.state.theme);
        });
    },

    setupTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target.dataset.tab;
                const container = e.target.closest('.card');
                if(!container) return;
                
                container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                container.querySelector(`#${target}`).classList.add('active');
            });
        });
    },

    // Public entry point (called from every place that mutates dashboard data):
    // re-render the customizable widget grid and refresh the pending-PO banner.
    updateDashboardCards() {
        this.renderDashboardWidgets();
        this.updatePendingActionCard();
    },

    updatePendingActionCard() {
        // Pending-PO banner only makes sense if there's an unpaid order.
        const pending = document.getElementById('pending-action-card');
        if (pending) pending.style.display = this.state.b2b.requests.some(r => r.status === 'Pending') ? 'flex' : 'none';
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD WIDGETS
    // Registry of available widgets. Each render() returns the inner markup for
    // a KPI card; renderDashboardWidgets() wraps it in .card.dash-card and adds
    // the remove (×) control + drag handle. `nav` = module to open on click,
    // `span` = column span in the grid-4 layout, `desc` = gallery description.
    //
    // NOTE ON TRENDS: the demo state has no time-series history, so the trend
    // pills below are illustrative constants (consistent with the prototype's
    // other hard-coded demo data) — they are NOT computed analytics.
    // ─────────────────────────────────────────────────────────────────────────
    widgets: {
        vouchers: {
            title: 'Voucher Balance', icon: 'confirmation_number', span: 1, nav: 'vouchers',
            desc: 'Available vs. purchased exam vouchers, with pool usage.',
            render: () => {
                const totalV = app.state.vouchers.reduce((a, v) => a + v.purchased, 0);
                const availV = app.state.vouchers.reduce((a, v) => a + v.available, 0);
                const usedV = totalV - availV;
                const low = totalV > 0 && availV / totalV < 0.15;
                return app.kpiCardInner({
                    icon: 'confirmation_number', label: 'Voucher Balance',
                    value: `${availV} / ${totalV}`, valueColor: low ? 'var(--err)' : '',
                    sublabel: `${usedV} used · ${availV} available`,
                    progress: totalV > 0 ? availV / totalV : 0,
                    progressColor: low ? 'var(--err)' : '',
                    trend: { dir: 'up', text: '6% vs last month' }
                });
            }
        },
        proctors: {
            title: 'Proctor Pipeline', icon: 'supervisor_account', span: 1, nav: 'proctors',
            desc: 'Active proctors against those still in training.',
            render: () => {
                const active = app.state.proctors.filter(p => p.status === 'Active').length;
                const training = app.state.proctors.filter(p => p.status === 'In Training').length;
                const total = app.state.proctors.length;
                return app.kpiCardInner({
                    icon: 'supervisor_account', label: 'Proctor Pipeline',
                    value: `${active} / ${training}`,
                    sublabel: `${active} active · ${training} in training`,
                    progress: total > 0 ? active / total : 0,
                    trend: { dir: 'up', text: '2 onboarding' }
                });
            }
        },
        classes: {
            title: 'Active Classes', icon: 'school', span: 1, nav: 'classes',
            desc: 'Classes that are not yet completed. Includes a quick "New" action.',
            render: () => {
                const activeClasses = app.state.classes.filter(c => c.status !== 'completed').length;
                const newBtn = `<button class="dash-mini-btn" onclick="event.stopPropagation(); app.openFormDrawer('session');">+ New Class</button>`;
                return app.kpiCardInner({
                    icon: 'school', label: 'Active Classes',
                    value: activeClasses,
                    sublabel: `${app.state.classes.length} total classes`,
                    trend: { dir: 'up', text: '3 this week' },
                    footer: newBtn
                });
            }
        },
        accrual: {
            title: 'Monthly Accrual', icon: 'payments', span: 1, nav: 'profile',
            desc: 'Revenue from paid invoices this period.',
            render: () => {
                const accrual = app.state.b2b.invoices
                    .filter(i => i.status === 'Paid')
                    .reduce((a, i) => a + (i.amount || 0), 0);
                return app.kpiCardInner({
                    icon: 'payments', label: 'Monthly Accrual',
                    value: `$${accrual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    sublabel: 'Paid invoices this period',
                    trend: { dir: 'up', text: '12% vs last month' }
                });
            }
        },
        classBreakdown: {
            title: 'Class Readiness', icon: 'insights', span: 2, nav: 'classes',
            desc: 'Class distribution by status and average readiness across active classes.',
            render: () => {
                const classes = app.state.classes;
                const buckets = { Draft: 0, Upcoming: 0, Live: 0, Completed: 0 };
                classes.forEach(c => {
                    const s = (c.status || '').toLowerCase();
                    if (s === 'completed') buckets.Completed++;
                    else if (s === 'ongoing' || s === 'live') buckets.Live++;
                    else if (s === 'upcoming') buckets.Upcoming++;
                    else buckets.Draft++;
                });
                const total = classes.length || 1;
                const colors = { Draft: 'var(--text-tertiary)', Upcoming: 'var(--inf)', Live: 'var(--suc)', Completed: 'var(--pri)' };
                const segments = Object.entries(buckets).filter(([, n]) => n > 0).map(([k, n]) =>
                    `<div class="cb-seg" style="width:${(n / total) * 100}%; background:${colors[k]};" title="${k}: ${n}"></div>`).join('')
                    || '<div class="cb-seg" style="width:100%; background:var(--border-light);"></div>';
                const legend = Object.entries(buckets).map(([k, n]) =>
                    `<div class="cb-legend-item"><span class="cb-dot" style="background:${colors[k]};"></span>${k}<strong>${n}</strong></div>`).join('');
                const activeClasses = classes.filter(c => (c.status || '').toLowerCase() !== 'completed');
                const avg = activeClasses.length ? Math.round(activeClasses.reduce((a, c) => a + (c.readiness || 0), 0) / activeClasses.length) : 0;
                return `
                    <div class="dash-card-head"><div class="dash-icon"><span class="material-icons">insights</span></div></div>
                    <div class="dash-label">Class Readiness &amp; Status</div>
                    <div class="cb-bar">${segments}</div>
                    <div class="cb-legend">${legend}</div>
                    <div style="margin-top:16px;">
                        <div class="dash-sublabel" style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Avg. readiness (active classes)</span>
                            <strong style="color:var(--text-primary); font-size:15px;">${avg}%</strong>
                        </div>
                        <div class="dash-progress"><div class="dash-progress-bar" style="width:${avg}%;"></div></div>
                    </div>`;
            }
        }
    },

    // Shared KPI-card inner markup. See widgets[] above for usage.
    kpiCardInner({ icon, label, value, sublabel, progress, progressColor, trend, valueColor, footer }) {
        const trendHtml = trend
            ? `<div class="dash-trend ${trend.dir}"><span class="material-icons">${trend.dir === 'up' ? 'arrow_upward' : 'arrow_downward'}</span>${trend.text}</div>`
            : '';
        const progHtml = (progress != null)
            ? `<div class="dash-progress"><div class="dash-progress-bar" style="width:${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%;${progressColor ? `background:${progressColor};` : ''}"></div></div>`
            : '';
        return `
            <div class="dash-card-head"><div class="dash-icon"><span class="material-icons">${icon}</span></div></div>
            <div class="dash-label">${label}</div>
            <div class="dash-value"${valueColor ? ` style="color:${valueColor}"` : ''}>${value}</div>
            ${sublabel ? `<div class="dash-sublabel">${sublabel}</div>` : ''}
            ${progHtml}
            ${trendHtml}
            ${footer || ''}`;
    },

    loadDashboardLayout() {
        const defaults = ['vouchers', 'proctors', 'classes', 'accrual'];
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem('proctor_dashboard_layout')); } catch (e) { /* ignore */ }
        if (Array.isArray(saved)) {
            // Drop ids that no longer map to a registered widget; de-dupe.
            const valid = [...new Set(saved.filter(id => this.widgets[id]))];
            this.state.dashboardLayout = valid.length ? valid : defaults;
        } else {
            this.state.dashboardLayout = defaults;
        }
    },

    saveDashboardLayout() {
        try { localStorage.setItem('proctor_dashboard_layout', JSON.stringify(this.state.dashboardLayout)); } catch (e) { /* ignore */ }
    },

    renderDashboardWidgets() {
        const grid = document.getElementById('dash-widget-grid');
        if (!grid) return;
        const layout = this.state.dashboardLayout.filter(id => this.widgets[id]);
        const cards = layout.map(id => {
            const w = this.widgets[id];
            const nav = w.nav ? `onclick="app.navigateTo('${w.nav}')"` : '';
            const span = w.span > 1 ? ' style="grid-column: span 2;"' : '';
            return `<div class="card dash-card" data-widget="${id}" draggable="true"${span} ${nav}>
                <button class="widget-remove" title="Remove widget" onclick="event.stopPropagation(); app.removeWidget('${id}')"><span class="material-icons">close</span></button>
                ${w.render()}
            </div>`;
        }).join('');
        const addTile = `<div class="add-widget-tile" onclick="app.openModal('add-widget')">
            <span class="material-icons">add</span><span>Add Widget</span>
        </div>`;
        grid.innerHTML = cards + addTile;
        this.setupWidgetDrag();
    },

    setupWidgetDrag() {
        const grid = document.getElementById('dash-widget-grid');
        if (!grid) return;
        let dragId = null;
        grid.querySelectorAll('.dash-card[draggable]').forEach(card => {
            card.addEventListener('dragstart', e => {
                dragId = card.dataset.widget;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                grid.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));
            });
            card.addEventListener('dragover', e => {
                e.preventDefault();
                if (card.dataset.widget !== dragId) card.classList.add('drag-over');
            });
            card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
            card.addEventListener('drop', e => {
                e.preventDefault();
                card.classList.remove('drag-over');
                if (dragId && card.dataset.widget !== dragId) this.moveWidget(dragId, card.dataset.widget);
            });
        });
    },

    addWidget(id) {
        if (!this.widgets[id] || this.state.dashboardLayout.includes(id)) return;
        this.state.dashboardLayout.push(id);
        this.saveDashboardLayout();
        this.renderDashboardWidgets();
        this.showToast(`${this.widgets[id].title} added`, 'success');
        // Keep the gallery in sync if the Add Widget modal is open.
        if (document.getElementById('add-widget-gallery')) this.renderWidgetGallery();
    },

    removeWidget(id) {
        const title = this.widgets[id] ? this.widgets[id].title : 'Widget';
        this.state.dashboardLayout = this.state.dashboardLayout.filter(w => w !== id);
        this.saveDashboardLayout();
        this.renderDashboardWidgets();
        this.showToast(`${title} removed`, 'info');
    },

    // Reorder: move `fromId` to sit immediately before `toId` in the layout.
    moveWidget(fromId, toId) {
        const layout = this.state.dashboardLayout;
        const from = layout.indexOf(fromId);
        if (from < 0) return;
        layout.splice(from, 1);
        const to = layout.indexOf(toId);
        layout.splice(to < 0 ? layout.length : to, 0, fromId);
        this.saveDashboardLayout();
        this.renderDashboardWidgets();
    },

    // Markup for the Add Widget gallery (widgets not already on the dashboard).
    widgetGalleryHtml() {
        const available = Object.keys(this.widgets).filter(id => !this.state.dashboardLayout.includes(id));
        if (!available.length) {
            return this.emptyState('widgets', 'All widgets added',
                'Every available widget is already on your dashboard. Remove one to bring it back here.');
        }
        return available.map(id => {
            const w = this.widgets[id];
            return `<div class="widget-gallery-item">
                <div class="widget-gallery-icon"><span class="material-icons">${w.icon}</span></div>
                <div style="flex:1; min-width:0;">
                    <div class="widget-gallery-title">${w.title}</div>
                    <div class="widget-gallery-desc">${w.desc || ''}</div>
                </div>
                <button class="btn-primary" style="padding:6px 16px; font-size:13px; height:auto;" onclick="app.addWidget('${id}')">Add</button>
            </div>`;
        }).join('');
    },

    renderWidgetGallery() {
        const g = document.getElementById('add-widget-gallery');
        if (g) g.innerHTML = this.widgetGalleryHtml();
    },

    renderActivities() {
        const feed = document.getElementById('recent-activity-feed');
        if(!feed) return;
        const activities = this.state.activities || [];
        if (activities.length === 0) {
            feed.innerHTML = `<div class="empty-state" style="text-align:center; padding:24px; color:var(--text-secondary);">
                <span class="material-icons" style="font-size:32px; opacity:.5;">history</span>
                <p style="margin:8px 0 0;">No activity yet. Actions across your organization will appear here.</p>
            </div>`;
            return;
        }
        feed.innerHTML = activities.map(a => `
            <div class="notif-item">
                <div class="notif-time">${a.time}</div>
                <div class="notif-text">${a.text}</div>
            </div>
        `).join('');
    },

    renderVouchers() {
        const container = document.getElementById('voucher-view-container');
        if(!container) return;
        if (this.state.vouchers.length === 0) {
            container.innerHTML = this.emptyState('confirmation_number', 'No vouchers yet',
                'Purchase exam vouchers, then assign them to your candidates.',
                `<button class="btn-primary" onclick="app.openDrawer('voucher-request')">Purchase Vouchers</button>`);
            return;
        }
        // Voucher Inventory is list-only.
        container.innerHTML = `
            <table>
                <thead><tr><th>Certificate Course</th><th>Total Purchased</th><th>Used</th><th>Available</th><th>Delivery</th><th>Action</th></tr></thead>
                <tbody>
                ${this.state.vouchers.map(v => `
                    <tr>
                        <td>${v.name}</td>
                        <td>${v.purchased}</td>
                        <td>${v.used}</td>
                        <td style="font-weight: 600; color: ${v.available/v.purchased < 0.15 ? 'var(--err)' : 'inherit'}">${v.available}</td>
                        <td>${v.delivery}</td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-primary" style="padding: 4px 8px; font-size: 11px;" onclick="app.openDrawer('voucher-request')">Purchase Vouchers</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
                </tbody>
            </table>`;
    },

    // Find the voucher pool for a certification, creating it on first purchase.
    // On day zero state.vouchers is empty, so every purchase flow must be able to
    // mint a new pool rather than assume vouchers[0] exists.
    addVouchersToPool(name, qty, delivery = 'Digital') {
        let pool = this.state.vouchers.find(v => v.name === name);
        if (!pool) {
            pool = { id: 'v' + Date.now(), name: name, purchased: 0, used: 0, available: 0, delivery: delivery };
            this.state.vouchers.push(pool);
        }
        pool.purchased += qty;
        pool.available += qty;
        return pool;
    },

    quickBuyVouchers(id, amount) {
        const v = this.state.vouchers.find(x => x.id === id);
        if (v) {
            v.purchased += amount;
            v.available += amount;
            this.renderVouchers();
            this.updateDashboardCards();
            this.showToast(`Successfully requested +${amount} vouchers for ${v.name}.`, 'success');
        }
    },

    updateVoucherRequestCost() {
        const qty = parseInt(document.getElementById('vr-qty').value) || 0;
        const flow = document.getElementById('vr-flow').value;
        document.getElementById('calc-cost').innerText = '$' + (qty * 25).toFixed(2);
        
        const details = document.getElementById('vr-payment-details');
        if (flow === 'B') {
            details.innerHTML = `
                <label style="display:block; font-size: 13px; font-weight: 500; margin-bottom: 8px;">Purchase Order Number</label>
                <input type="text" class="form-control" placeholder="e.g. PO-2026-089">
                <div style="font-size: 11px; color: var(--on-sur-var); margin-top: 4px;">An invoice will be sent to the billing department.</div>
            `;
        } else {
            details.innerHTML = `
                <label style="display:block; font-size: 13px; font-weight: 500; margin-bottom: 8px;">Vaulted Credit Card</label>
                <select class="form-control">
                    <option>Visa ending in 4242</option>
                    <option>MasterCard ending in 5555</option>
                </select>
                <div style="font-size: 11px; color: var(--on-sur-var); margin-top: 4px;">Card will be charged immediately.</div>
            `;
        }
    },

    submitVoucherRequest() {
        const btn = document.querySelector('#side-drawer .btn-primary');
        const qty = parseInt(document.getElementById('vr-qty').value) || 0;
        
        if (qty < 50) {
            this.showToast('Minimum bulk request is 50 vouchers.', 'error');
            return;
        }

        const mat = document.getElementById('vr-material').value;
        const flow = document.getElementById('vr-flow').value;
        
        const msg = flow === 'C' ? `Card charged $${(qty * 25).toFixed(2)}. Vouchers added.` : 'PO request submitted to billing.';
        
        this.simulateSave(btn, msg);
        setTimeout(() => {
            const v = this.state.vouchers.find(x => x.name === mat);
            if(v) { 
                v.purchased += qty; 
                v.available += qty; 
            }
            this.renderVouchers();
            this.updateDashboardCards();
        }, 800);
    },

    // Shows the "who pays / apply to all" options only when an online exam is allowed.
    updateOnlineExamOptions(prefix = 'cc-') {
        const allow = document.getElementById(prefix + 'allow-online');
        const options = document.getElementById(prefix + 'online-options');
        if (!allow || !options) return;
        options.style.display = allow.value === 'yes' ? '' : 'none';
    },

    // Surfaces the available voucher count for the chosen Certificate Course.
    updateCertCourseVouchers(prefix = 'cc-') {
        const courseSel = document.getElementById(prefix + 'program');
        const countEl = document.getElementById(prefix + 'voucher-count');
        if (!courseSel) return;

        const voucher = this.state.vouchers.find(v => v.id === courseSel.value);
        if (countEl) {
            if (voucher) {
                const available = voucher.available || 0;
                const color = available > 0 ? 'var(--ok, #2e7d32)' : 'var(--err)';
                countEl.innerHTML = `<strong style="color: ${color};">${available} voucher${available === 1 ? '' : 's'} available</strong> in this pool`;
            } else {
                countEl.textContent = 'No vouchers available for this course';
            }
        }
    },

    // "Request More" link from the Certificate Course field — closes the class
    // drawer and opens the voucher request/purchase drawer.
    requestMoreVouchers() {
        this.closeModal();
        this.openDrawer('voucher-request');
    },

    // ─── Voucher redemption ───────────────────────────────────────
    // The set of voucher codes this org has issued and that haven't been
    // redeemed yet. Seeded from any already-assigned candidate codes plus a few
    // spare demo codes, so "Redeem" can be validated against real org inventory.
    seedVoucherCodes() {
        const fromAssigned = (this.state.candidates || [])
            .filter(c => {
                const s = (c.voucherStatus || '').toLowerCase();
                return c.voucherCode && (s === 'assigned' || s === 'pending');
            })
            .map(c => String(c.voucherCode).toUpperCase());
        const spares = ['VCH-1001', 'VCH-1002', 'VCH-1003', 'VCH-1004', 'VCH-1005', 'VCH-1006'];
        this.state.availableVoucherCodes = [...new Set([...fromAssigned, ...spares])];
    },

    openRedeemVoucherModal(id) {
        if (!this.state.availableVoucherCodes) this.seedVoucherCodes();
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');
        const title = document.getElementById('modal-title');
        if (!overlay || !container || !content) return;
        if (title) title.innerText = 'Redeem Voucher Code';
        const sample = (this.state.availableVoucherCodes || [])[0] || 'VCH-1001';
        content.innerHTML = `
            <p style="font-size: 13px; color: var(--on-sur-var); margin-bottom: 16px;">
                Enter the voucher code the candidate purchased. We'll verify it against issued voucher codes before redeeming.
            </p>
            <div class="form-group">
                <label>Voucher Code</label>
                <input type="text" class="form-control" id="redeem-code-input" placeholder="e.g. ${sample}" autocomplete="off" style="font-family: monospace; text-transform: uppercase;">
                <div id="redeem-error" style="display: none; color: var(--err); font-size: 12px; margin-top: 8px;"></div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                <button class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                <button class="btn-primary" onclick="app.confirmRedeemVoucher('${id}')">Verify &amp; Redeem</button>
            </div>
        `;
        overlay.classList.add('active');
        container.style.display = 'block';
        setTimeout(() => { const i = document.getElementById('redeem-code-input'); if (i) i.focus(); }, 50);
    },

    confirmRedeemVoucher(id) {
        const input = document.getElementById('redeem-code-input');
        const errEl = document.getElementById('redeem-error');
        const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; } };
        const code = (input ? input.value : '').trim().toUpperCase();
        if (!code) { showErr('Please enter a voucher code.'); return; }
        if (!this.state.availableVoucherCodes) this.seedVoucherCodes();

        const pool = this.state.availableVoucherCodes;
        const cand = (this.state.candidates || []).find(c => String(c.id) === String(id));
        // Valid if the code is in the org's issued/available pool — OR it's the
        // candidate's own already-assigned code being confirmed.
        const ownAssigned = cand && cand.voucherCode &&
            String(cand.voucherCode).toUpperCase() === code &&
            ['assigned', 'pending'].includes((cand.voucherStatus || '').toLowerCase());
        const idx = pool.indexOf(code);

        if (idx === -1 && !ownAssigned) {
            showErr('Invalid voucher code. Please check and try again.');
            return;
        }

        // Approved — consume the code and redeem it for this candidate.
        if (idx !== -1) pool.splice(idx, 1);
        if (cand) {
            cand.voucherCode = code;
            cand.voucherStatus = 'redeemed';
            // Reflect usage in the matching pool's counters when possible.
            const poolRec = (this.state.vouchers || []).find(v => v.name === cand.program);
            if (poolRec && poolRec.available > 0) { poolRec.available -= 1; poolRec.used = (poolRec.used || 0) + 1; }
        }
        this.closeModal();
        this.showToast('Voucher code verified and redeemed.', 'success');
        if (window.CCM && CCM.renderSessionDetailCandidates) CCM.renderSessionDetailCandidates();
        if (this.renderVouchers) this.renderVouchers();
        this.filterCandidates && this.filterCandidates('all');
    },

    // Proctor invite: reveal the inline new-class fields when "Create a new
    // class" is chosen in the Assign Class select.
    togglePiNewClass() {
        const sel = document.getElementById('pi-assign-class');
        const fields = document.getElementById('pi-newclass-fields');
        if (!sel || !fields) return;
        const isNew = sel.value === '__new__';
        fields.style.display = isNew ? 'block' : 'none';
        if (isNew) this.updateCertCourseVouchers('pi-');
    },

    // Invite a proctor and assign them to a class — either an existing one or a
    // brand-new class created inline from the same fields as Add New Class.
    submitProctorInvite(btn) {
        const name = (document.getElementById('pi-fullname') || {}).value || 'New Proctor';
        const sel = document.getElementById('pi-assign-class');
        let msg = 'Proctor invited successfully!';
        if (sel && sel.value === '__new__') {
            const cls = this.buildClassFromForm('pi-');
            this.renderSessionsList(this.state.classes);
            if (this.state.viewMode.classes) this.setSessionViewMode(this.state.viewMode.classes);
            msg = `${name} invited and assigned to new class "${cls.name}" (Draft).`;
        } else if (sel && sel.value) {
            const cls = this.state.classes.find(c => c.id === sel.value);
            if (cls) msg = `${name} invited and assigned to "${cls.name}".`;
        }
        this.simulateSave(btn, msg);
    },

    // Shared "Add New Class" field set. Used by the create-class drawer and the
    // proctor invite "Assign Class → create new" flow. IDs are prefixed so the
    // same fields can appear in different containers without collisions.
    classFormFieldsHtml(prefix) {
        const courseOptions = this.state.vouchers.length
            ? this.state.vouchers.map(v => `<option value="${v.id}">${v.name}</option>`).join('')
            : `<option value="">No certificate courses available yet</option>`;
        return `
            <div class="form-group">
                <label>Class Name</label>
                <input type="text" class="form-control" id="${prefix}name" placeholder="e.g. Culinary Arts Class 3">
            </div>
            <div class="form-group">
                <label>Certificate Course</label>
                <select class="form-control" id="${prefix}program" onchange="app.updateCertCourseVouchers('${prefix}')">
                    ${courseOptions}
                </select>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; font-size: 13px;">
                    <span id="${prefix}voucher-count" style="color: var(--on-sur-var);"></span>
                    <a href="#" onclick="app.requestMoreVouchers(); return false;" style="color: var(--pri); font-weight: 600; text-decoration: none;">Request More</a>
                </div>
            </div>
            <div class="form-group">
                <label>Allow Retake Exam</label>
                <select class="form-control" id="${prefix}allow-retake">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Allow Online Exam</label>
                <select class="form-control" id="${prefix}allow-online" onchange="app.updateOnlineExamOptions('${prefix}')">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
            <div class="form-group" id="${prefix}online-options" style="display: none;">
                <label>Who will bear the price?</label>
                <select class="form-control" id="${prefix}online-payer">
                    <option value="student">Student</option>
                    <option value="organization">Organization</option>
                </select>
                <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; font-weight: normal;">
                    <input type="checkbox" id="${prefix}online-apply-all" style="width: 16px; height: 16px;">
                    Apply to all candidates in this class
                </label>
            </div>
            <div class="form-group">
                <label>Exam Date</label>
                <input type="date" class="form-control" id="${prefix}date">
            </div>
        `;
    },

    // Reads the shared class fields (by prefix), creates the class as a Draft, and
    // returns it. Reads synchronously so it works before any modal/drawer closes.
    buildClassFromForm(prefix = 'cc-') {
        const val = (suffix) => (document.getElementById(prefix + suffix) || {}).value;
        const name = val('name') || 'New Class';
        const date = val('date') || 'TBD';
        const courseId = val('program');
        const courseVoucher = this.state.vouchers.find(v => v.id === courseId);
        const program = courseVoucher ? courseVoucher.name : courseId;
        const allowRetake = val('allow-retake') === 'yes';
        const allowOnline = val('allow-online') === 'yes';
        const onlinePayer = val('online-payer') || 'student';
        const onlineApplyToAll = !!(document.getElementById(prefix + 'online-apply-all') || {}).checked;
        const cls = {
            id: 's' + Date.now(), name: name, program: program, voucherPoolId: courseId,
            status: 'draft', createdAt: new Date().toISOString().split('T')[0], examDate: date,
            candidateCount: 0, readiness: 0,
            allowRetake: allowRetake, allowOnline: allowOnline,
            onlinePayer: allowOnline ? onlinePayer : null,
            onlineApplyToAll: allowOnline ? onlineApplyToAll : false
        };
        this.state.classes.unshift(cls);
        return cls;
    },

    submitNewClass(btn) {
        // Build synchronously (reads fields while the drawer is still open), then
        // animate + close.
        this.buildClassFromForm('cc-');
        this.simulateSave(btn, 'Class created successfully!');
        setTimeout(() => {
            this.renderSessionsList(this.state.classes);
            if(this.state.viewMode.classes) this.setSessionViewMode(this.state.viewMode.classes);
        }, 800);
    },

    replaceCandidateVoucher(candidateId) {
        const input = document.getElementById('cand-replace-voucher');
        if (!input) return;
        const newCode = input.value.trim();
        if (!newCode) {
            this.showToast('Please enter a new voucher code.', 'error');
            return;
        }

        const cand = this.state.candidates.find(c => c.id === candidateId);
        if (!cand) return;

        if (cand.voucherStatus === 'activated' || cand.voucherStatus === 'redeemed') {
            this.showToast('Voucher is already activated and cannot be replaced.', 'error');
            return;
        }

        // Refund the org pool 
        // We will just find the first voucher pool with some used/assigned count and refund 1.
        // For simulation purposes, we just refund to the first pool.
        if (this.state.vouchers.length > 0) {
            this.state.vouchers[0].available += 1;
            this.state.vouchers[0].used = Math.max(0, this.state.vouchers[0].used - 1);
            this.updateDashboardCards();
            this.renderVouchers();
        }

        cand.voucherCode = newCode;
        cand.voucherStatus = 'assigned';
        
        this.showToast('Voucher replaced successfully. Organization pool refunded.', 'success');
        this.renderCandidatesList(this.state.candidates);
        
        // Re-render drawer
        this.openDrawer('edit-candidate', candidateId);
    },

    // Persist a candidate built by the shared CCM Add-Candidate form: add to
    // state, enroll into its class (bump count), refresh roster + dashboard, and
    // return to the originating class detail if we came from there.
    commitCandidate(cand) {
        const fromSession = this._addToSessionId;
        this.state.candidates.unshift(cand);
        if (cand.sessionId) {
            const cls = this.state.classes.find(c => c.id === cand.sessionId);
            if (cls) cls.candidateCount = (cls.candidateCount || 0) + 1;
        }
        this.filterCandidates('all');
        this.filterSessions('all');
        this.updateDashboardCards();
        this.closeDrawer();
        this._addToSessionId = null;
        if (fromSession && window.CV3 && CV3.currentSessionId === fromSession) {
            CV3.openSessionDetail(fromSession);
        }
    },

    // Legacy path retained for any old callers; the shared form now drives adds.
    submitNewCandidate(btn) {
        const name = document.getElementById('ac-name').value || 'New Candidate';
        const email = document.getElementById('ac-email').value || 'new@email.com';
        const classId = (document.getElementById('ac-class') || {}).value || this._addToSessionId || '';
        const voucher = (document.getElementById('ac-voucher') || {}).value || '';
        const fromSession = this._addToSessionId;
        this.simulateSave(btn, 'Candidate added successfully!');
        setTimeout(() => {
            this.state.candidates.unshift({
                id: 'c' + Date.now(), name: name, rollNo: 'RN-' + Math.floor(Math.random()*10000),
                voucherStatus: voucher ? 'assigned' : 'not_assigned',
                voucherCode: voucher ? ('VCH-' + Math.floor(Math.random()*10000)) : '',
                examStatus: 'enrolled', email: email, sessionId: classId || undefined
            });
            // Enroll into the chosen class (bumps its candidate count + readiness).
            if (classId) {
                const cls = this.state.classes.find(c => c.id === classId);
                if (cls) cls.candidateCount = (cls.candidateCount || 0) + 1;
            }
            this.filterCandidates('all');
            this.filterSessions('all');
            this.updateDashboardCards();
            this.closeDrawer();
            this._addToSessionId = null;
            // If added from a live/ongoing class detail, return there and refresh.
            if (fromSession && window.CV3 && CV3.currentSessionId === fromSession) {
                CV3.openSessionDetail(fromSession);
            }
        }, 800);
    },

    openClassDashboard(id) {
        // Open the v3-style per-class detail drill-down (candidates + materials).
        if (window.CV3) CV3.openSessionDetail(id);
        else if (window.CCM) CCM.openSessionDetail(id);
    },

    // Bridge CCM's view names to the org portal's module ids.
    showView(viewId) {
        if (viewId === 'monitoring') {
            this.showToast('Live monitoring opens in the proctor app.', 'info');
            return;
        }
        const map = { sessions: 'classes', candidates: 'candidates', 'session-detail': 'session-detail', dashboard: 'dashboard' };
        this.navigateTo(map[viewId] || viewId);
    },

    renderProctors() {
        const activeContainer = document.getElementById('proctor-active-container');
        const trainingContainer = document.getElementById('proctor-training-container');
        const pendingContainer = document.getElementById('proctor-pending-container');
        
        if(!activeContainer || !trainingContainer || !pendingContainer) return;

        if (this.state.proctors.length === 0) {
            activeContainer.innerHTML = this.emptyState('groups', 'No proctors yet',
                'Invite proctors to your organization. Once they complete training and receive a license, they’ll appear here.',
                `<button class="btn-primary" onclick="app.showToast('Invite sent (demo)','success')">Invite Proctor</button>`);
            trainingContainer.innerHTML = '';
            pendingContainer.innerHTML = '';
            return;
        }

        const active = this.state.proctors.filter(p => p.status === 'Active');
        const training = this.state.proctors.filter(p => p.status === 'In Training');
        const pending = this.state.proctors.filter(p => p.status === 'Pending');
        
        // Active Proctors
        activeContainer.innerHTML = `
        <table>
            <thead><tr><th>Name</th><th>Email</th><th>SDC Proctor ID</th><th>Verified Proctor</th><th>Create Classes</th><th>Manage Enrollments</th><th>Assign Vouchers</th><th>Action</th></tr></thead>
            <tbody>
            ${active.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.email}</td>
                    <td style="font-family: monospace; font-size: 12px;">${p.sdcId || '—'}</td>
                    <td><span class="chip badge-active">✓ Verified</span></td>
                    <td><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></td>
                    <td><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></td>
                    <td><label class="switch"><input type="checkbox"><span class="slider"></span></label></td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="app.openDrawer('proctor-details', ${p.id})">Details</button>
                        </div>
                    </td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        // Training Proctors
        trainingContainer.innerHTML = `
        <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
            ${training.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.email}</td>
                    <td><span class="chip badge-trial">In Training</span></td>
                    <td><button class="btn-primary" style="padding: 4px 8px; font-size: 11px;" onclick="app.showToast('Proctor approved!', 'success')">Approve</button></td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;

        // Pending Proctors
        pendingContainer.innerHTML = `
        <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
            ${pending.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.email}</td>
                    <td><span class="chip badge-pending">Pending</span></td>
                    <td><button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="app.showToast('Reminder Sent!', 'success')">Resend Link</button></td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;
    },

    // Deleted old renderClasses and renderCandidates to avoid dead code

    openDrawer(type, id = null) {
        const overlay = document.getElementById('drawer-overlay');
        const drawer = document.getElementById('side-drawer');
        const content = document.getElementById('drawer-content');
        const title = document.getElementById('drawer-title');

        if (type === 'proctor-details') {
            const p = this.state.proctors.find(x => x.id === id);
            title.innerText = 'Proctor Profile: ' + p.name;
            content.innerHTML = `
                <div class="data-card" style="padding: 16px; margin-bottom: 24px; background: var(--sur-card); border-radius: 8px; border: 1px solid var(--out); box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--out); padding-bottom: 8px; margin-bottom: 16px;">
                        <h4 style="font-size: 14px; font-weight: 600; color: var(--on-sur); margin: 0;">Personal Information</h4>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--on-sur-var);">
                            <span class="chip badge-active">✓ Verified</span>
                            <span style="font-weight: 500;">Expires: Oct 12, 2027</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label style="font-size: 12px; font-weight: 500; color: var(--on-sur-var);">Full Name</label>
                        <input type="text" class="form-control" value="${p.name}">
                    </div>
                    <div class="form-group">
                        <label style="font-size: 12px; font-weight: 500; color: var(--on-sur-var);">SDC Proctor ID</label>
                        <input type="text" class="form-control" value="${p.sdcId || ''}" placeholder="e.g. SDC-P-1013" style="font-family: monospace;">
                    </div>
                    <div class="form-group">
                        <label style="font-size: 12px; font-weight: 500; color: var(--on-sur-var);">Email Address</label>
                        <input type="email" class="form-control" value="${p.email}">
                    </div>
                    <div class="form-group">
                        <label style="font-size: 12px; font-weight: 500; color: var(--on-sur-var);">Phone Number</label>
                        <input type="text" class="form-control" value="+1 (555) 019-8472">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 12px; font-weight: 500; color: var(--on-sur-var);">Current Status</label>
                        <select class="form-control">
                            <option ${p.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option ${p.status === 'In Training' ? 'selected' : ''}>In Training</option>
                            <option ${p.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option>Deactivated</option>
                        </select>
                    </div>
                </div>

                <div class="data-card" style="padding: 16px; margin-bottom: 24px; background: var(--sur-card); border-radius: 8px; border: 1px solid var(--out); box-shadow: var(--shadow-sm);">
                    <h4 style="margin-bottom: 16px; font-size: 14px; border-bottom: 1px solid var(--out); padding-bottom: 8px; font-weight: 600; color: var(--on-sur);">Permissions & Roles</h4>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; font-size: 13px; margin-bottom: 12px; cursor: pointer;">
                            <input type="checkbox" checked style="width: 16px; height: 16px; accent-color: var(--pri);"> Can Create Classes
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; font-size: 13px; margin-bottom: 12px; cursor: pointer;">
                            <input type="checkbox" checked style="width: 16px; height: 16px; accent-color: var(--pri);"> Can Manage Enrollments
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; font-size: 13px; margin-bottom: 0; cursor: pointer;">
                            <input type="checkbox" style="width: 16px; height: 16px; accent-color: var(--pri);"> Can Assign Vouchers
                        </label>
                    </div>
                </div>

                <div class="data-card" style="padding: 16px; margin-bottom: 24px; background: var(--sur-card); border-radius: 8px; border: 1px solid var(--out); box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--out); padding-bottom: 8px; margin-bottom: 16px;">
                        <h4 style="font-size: 14px; margin: 0; font-weight: 600; color: var(--on-sur);">Associated Classes</h4>
                        <button class="btn-secondary" style="padding: 2px 8px; font-size: 11px;">+ Assign</button>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div style="background: var(--sur-main); border: 1px solid var(--out-var); border-radius: 8px; padding: 12px;">
                            <details open>
                                <summary style="cursor: pointer; font-weight: 500; font-size: 13px; outline: none; margin-bottom: 8px; color: var(--pri);">Food Safety Standard - June Class</summary>
                                <div style="font-size: 12px; color: var(--on-sur-var); padding-left: 12px; border-left: 2px solid var(--out); margin-top: 8px;">
                                    <strong>Candidates:</strong> 24 Enrolled<br>
                                    <strong>Date:</strong> June 1, 2026<br>
                                    <strong>Model:</strong> Online Proctoring Enabled
                                </div>
                            </details>
                        </div>
                        <div style="background: var(--sur-main); border: 1px solid var(--out-var); border-radius: 8px; padding: 12px;">
                            <details>
                                <summary style="cursor: pointer; font-weight: 500; font-size: 13px; outline: none; color: var(--pri);">Advanced Culinary - Evening</summary>
                                <div style="font-size: 12px; color: var(--on-sur-var); padding-left: 12px; border-left: 2px solid var(--out); margin-top: 8px;">
                                    <strong>Candidates:</strong> 12 Enrolled<br>
                                    <strong>Date:</strong> July 15, 2026<br>
                                    <strong>Model:</strong> In-Classroom
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; border-top: 1px solid var(--out); padding-top: 24px;">
                    <button class="btn-secondary" style="flex: 1; color: var(--err); border-color: var(--err); justify-content: center;" onclick="app.openModal('delete-confirm', {type: 'proctors', id: ${id}, name: 'Proctor'})">Delete</button>
                    <button class="btn-primary" style="flex: 2; justify-content: center;" onclick="app.simulateSave(this, 'Profile Updated!'); setTimeout(() => app.closeDrawer(), 1200);">Save Changes</button>
                </div>
            `;
        }

        if (type === 'voucher-request') {
            title.innerText = 'Purchase Vouchers (Store)';
            // Certificate-course dropdown: the org's existing voucher pools first
            // (so they can top up), then the rest of the SDC certification catalog.
            const certCatalog = [
                'Professional Chef Certification',
                'Food Safety Standard',
                'HACCP Level 3',
                'Culinary Arts',
                'Certified Restaurant Manager',
                'Food Handling & Sanitation',
                'Hospitality Service Excellence'
            ];
            const poolNames = (this.state.vouchers || []).map(v => v.name);
            const certList = [...new Set([...poolNames, ...certCatalog])];
            const certOptions = certList.map(n => `<option value="${n}">${n}</option>`).join('');
            content.innerHTML = `
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom:16px;">Step 1: Selection & Quoting</h4>
                    <div class="form-group">
                        <label>Select Certificate Course</label>
                        <select id="drawer-procure-cert" class="form-control">
                            ${certOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" id="drawer-procure-qty" class="form-control" value="50" min="1" oninput="app.updateQuote('drawer-')">
                    </div>
                    <div id="drawer-discount-notice" style="display:none; background:var(--suc-ct, rgba(34,197,94,0.08)); border:1px solid var(--suc); color:var(--suc); padding:12px 14px; border-radius:8px; margin-bottom:16px; font-size:13px; align-items:center; gap:8px;">
                        <i class="material-icons" style="font-size:18px;">local_offer</i>
                        <span id="drawer-discount-notice-text"></span>
                    </div>
                    <div style="background:var(--sur-main); padding:16px; border-radius:8px; border:1px solid var(--out);">
                        <div class="flex-between" style="margin-bottom:8px;"><span>Subtotal:</span><span id="drawer-quote-subtotal">$2,100.00</span></div>
                        <div class="flex-between" style="margin-bottom:8px; color:var(--suc);"><span>Discount:</span><span id="drawer-quote-discount">-$0.00</span></div>
                        <div class="flex-between" style="font-weight:600; font-size:18px; border-top:1px solid var(--out); padding-top:8px;">
                            <span>Total:</span><span id="drawer-quote-total">$2,100.00</span>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom:16px;">Step 2: Payment Pathway</h4>
                    <div class="tabs" style="margin-bottom:16px;">
                        <div class="tab active" id="drawer-tab-pay-instant" onclick="app.switchPaymentPath('instant', 'drawer-')">Pay Now</div>
                        <div class="tab" id="drawer-tab-pay-net30" onclick="app.switchPaymentPath('net30', 'drawer-')">Pay by Check</div>
                    </div>

                    <div id="drawer-pay-instant" class="tab-content active">
                        <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">Credit card clears instantly. Vouchers are added immediately and invoice is marked Paid.</p>
                        <div class="form-group">
                            <label>Card Details</label>
                            <input type="text" class="form-control" placeholder="**** **** **** 4242" disabled>
                        </div>
                        <button class="btn-primary" style="width:100%; justify-content:center;" onclick="app.processCheckout('instant', 'drawer-')">Pay Now</button>
                    </div>

                    <div id="drawer-pay-net30" class="tab-content" style="display:none;">
                        <div style="background:var(--inf); padding:12px; border-radius:8px; margin-bottom:16px; font-size:12px; color:var(--inf-ct);">
                            <strong>One-Month Credibility Active:</strong> Vouchers will be unlocked instantly. Invoice must be cleared within 30 days via check or bank transfer.
                        </div>
                        <div class="form-group">
                            <label>Internal PO Number</label>
                            <input type="text" id="drawer-procure-po" class="form-control" placeholder="e.g. PO-2026-999">
                        </div>
                        <button class="btn-secondary" style="width:100%; justify-content:center;" onclick="app.processCheckout('net30', 'drawer-')">Pay by Check</button>
                    </div>
                </div>
            `;
            
            // Initialize quote
            setTimeout(() => this.updateQuote('drawer-'), 100);
        }
        
        if (type === 'edit-class') {
            const cls = this.state.classes.find(c => c.id === id);
            if (!cls) return;
            title.innerText = 'Edit Class';
            content.innerHTML = `
                <div class="form-group">
                    <label>Class Name</label>
                    <input type="text" class="form-control" id="edit-cls-name" value="${cls.name}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select class="form-control" id="edit-cls-status">
                        <option value="draft" ${cls.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="upcoming" ${cls.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                        <option value="ongoing" ${cls.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                        <option value="live" ${cls.status === 'live' ? 'selected' : ''}>Live</option>
                        <option value="completed" ${cls.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Exam Date</label>
                    <input type="date" class="form-control" id="edit-cls-date" value="${cls.examDate}">
                </div>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button class="btn-secondary" style="flex: 1; color: var(--err); border-color: var(--err); justify-content: center;" onclick="app.openModal('delete-confirm', {type: 'classes', id: '${cls.id}', name: '${cls.name}'})">
                        Delete
                    </button>
                    <button class="btn-primary" style="flex: 2; justify-content: center;" onclick="app.simulateSave(this, 'Class updated successfully!')">
                        Save Changes
                    </button>
                </div>
            `;
        }

        if (type === 'edit-candidate') {
            const cand = this.state.candidates.find(c => c.id === id);
            if (!cand) return;
            title.innerText = 'Edit Candidate Profile';
            
            let voucherSection = '';
            if (cand.voucherStatus === 'activated') {
                voucherSection = `
                    <div style="background: var(--sur-main); border: 1px solid var(--out); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
                            <span class="material-icons" style="font-size: 16px; color: var(--suc);">verified</span> Voucher Activated
                        </h4>
                        <div style="font-size: 12px; color: var(--on-sur-var);">Code: <strong>${cand.voucherCode}</strong></div>
                        <div style="font-size: 11px; color: var(--err); margin-top: 8px;">Cannot be replaced once activated.</div>
                    </div>
                `;
            } else if (cand.voucherStatus === 'assigned' || cand.voucherStatus === 'pending') {
                voucherSection = `
                    <div style="background: var(--sur-main); border: 1px solid var(--out); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Voucher Management</h4>
                        <div style="font-size: 12px; color: var(--on-sur-var); margin-bottom: 8px;">Current Assigned Code: <strong>${cand.voucherCode || 'PENDING'}</strong></div>
                        <label style="font-size: 11px; font-weight: 500;">Candidate Provided Code (Replace)</label>
                        <div style="display: flex; gap: 8px; margin-top: 4px;">
                            <input type="text" class="form-control" id="cand-replace-voucher" placeholder="e.g. EXT-9999" style="font-family: monospace;">
                            <button class="btn-secondary" onclick="app.replaceCandidateVoucher('${cand.id}')" style="white-space: nowrap;">Replace</button>
                        </div>
                        <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 6px;">Replacing the voucher will refund the original voucher back to the Organization's pool.</div>
                    </div>
                `;
            } else {
                voucherSection = `
                    <div style="background: var(--sur-main); border: 1px solid var(--out); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Voucher Management</h4>
                        <div style="font-size: 12px; color: var(--status-warning);">Not Assigned</div>
                    </div>
                `;
            }

            content.innerHTML = `
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" class="form-control" id="edit-cand-name" value="${cand.name}">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" class="form-control" id="edit-cand-email" value="${cand.email}">
                </div>
                <div class="form-group">
                    <label>Roll Number / ID</label>
                    <input type="text" class="form-control" id="edit-cand-roll" value="${cand.rollNo}">
                </div>
                
                ${voucherSection}

                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button class="btn-secondary" style="flex: 1; color: var(--err); border-color: var(--err); justify-content: center;" onclick="app.openModal('delete-confirm', {type: 'candidates', id: '${cand.id}', name: '${cand.name}'})">
                        Delete
                    </button>
                    <button class="btn-primary" style="flex: 2; justify-content: center;" onclick="app.simulateSave(this, 'Candidate updated successfully!')">
                        Save Changes
                    </button>
                </div>
            `;
        }

        if (type === 'edit-voucher') {
            const v = this.state.vouchers.find(x => x.id === id);
            if (!v) return;
            title.innerText = 'Edit Voucher Tier';
            content.innerHTML = `
                <div class="form-group">
                    <label>Certificate Course</label>
                    <input type="text" class="form-control" id="edit-v-name" value="${v.name}">
                </div>
                <div class="form-group">
                    <label>Delivery Method</label>
                    <input type="text" class="form-control" id="edit-v-delivery" value="${v.delivery}">
                </div>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button class="btn-secondary" style="flex: 1; color: var(--err); border-color: var(--err); justify-content: center;" onclick="app.openModal('delete-confirm', {type: 'vouchers', id: '${v.id}', name: '${v.name}'})">
                        Delete
                    </button>
                    <button class="btn-primary" style="flex: 2; justify-content: center;" onclick="app.simulateSave(this, 'Voucher updated successfully!')">
                        Save Changes
                    </button>
                </div>
            `;
        }

        if (type === 'create-class') {
            title.innerText = 'Create New Class';
            content.innerHTML = `
                ${this.classFormFieldsHtml('cc-')}
                <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="app.submitNewClass(this)">Create Class</button>
            `;
            // Populate the available-voucher count for the default course selection.
            this.updateCertCourseVouchers('cc-');
        }

        if (type === 'add-candidate') {
            title.innerText = 'Add Candidate';
            // Shared, richer Add-Candidate form (auto ID, accommodations + note,
            // exam assessment, in-class/online + retake + payer rules, system
            // voucher). One implementation across the org + proctor portals.
            content.innerHTML = window.CCM
                ? CCM.addCandidateFormHtml(this._addToSessionId)
                : '<p>Candidate management module unavailable.</p>';
        }

        if (type === 'class-dashboard') {
            const cls = this.state.classes.find(c => c.id === id);
            title.innerText = 'Class Dashboard: ' + (cls ? cls.name : '');
            content.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div>
                        <div style="font-size:12px; color:var(--on-sur-var);">Status</div>
                        <div style="font-weight:600;">${cls ? cls.status.toUpperCase() : ''}</div>
                    </div>
                    <div>
                        <div style="font-size:12px; color:var(--on-sur-var);">Candidates</div>
                        <div style="font-weight:600;">${cls ? cls.candidateCount : 0}</div>
                    </div>
                </div>
                <div style="margin-bottom:24px;">
                    <button class="btn-primary" style="width:100%; margin-bottom:12px;" onclick="app.simulateSave(this, 'Started Proctoring Session.')">Launch Proctor Console (Simulated)</button>
                    <button class="btn-secondary" style="width:100%; margin-bottom:12px;" onclick="app.showToast('Generating report...', 'info')">Export Result Report</button>
                </div>
            `;
        }

        overlay.classList.add('active');
        drawer.classList.add('active');
    },

    closeDrawer() {
        document.getElementById('drawer-overlay').classList.remove('active');
        document.getElementById('side-drawer').classList.remove('active');
    },

    openModal(type, data = null) {
        const overlay = document.getElementById('modal-overlay');
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');
        const title = document.getElementById('modal-title');

        if (type === 'proctor-invite') {
            title.innerText = 'Invite New Proctor';
            const classOptions = (this.state.classes || [])
                .map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            content.innerHTML = `
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" class="form-control" id="pi-fullname" placeholder="e.g. Jane Doe">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" class="form-control" id="pi-email" placeholder="jane@example.com">
                </div>
                <div class="form-group">
                    <label>SDC Proctor ID</label>
                    <input type="text" class="form-control" id="pi-sdcid" placeholder="e.g. SDC-P-1013" style="font-family: monospace;">
                </div>
                <div class="form-group">
                    <label>Assign Class</label>
                    <select class="form-control" id="pi-assign-class" onchange="app.togglePiNewClass()">
                        <option value="">— No class yet —</option>
                        ${classOptions}
                        <option value="__new__">➕ Create a new class…</option>
                    </select>
                </div>
                <div id="pi-newclass-fields" style="display: none; border: 1px solid var(--out); border-radius: 8px; padding: 16px; margin-bottom: 8px; background: var(--sur-main);">
                    <div style="font-size: 12px; font-weight: 600; color: var(--on-sur-var); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px;">New Class Details</div>
                    ${this.classFormFieldsHtml('pi-')}
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                    <button class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="app.submitProctorInvite(this)">Send Invite Link</button>
                </div>
            `;
        }

        if (type === 'add-widget') {
            title.innerText = 'Add a Widget';
            content.innerHTML = `
                <p style="color:var(--text-secondary); font-size:14px; margin-bottom:16px;">
                    Choose widgets to add to your dashboard. On the dashboard you can drag cards to reorder them, or use the × on a card to remove it.
                </p>
                <div id="add-widget-gallery">${this.widgetGalleryHtml()}</div>
                <div style="display:flex; justify-content:flex-end; margin-top:24px;">
                    <button class="btn-secondary" onclick="app.closeModal()">Done</button>
                </div>
            `;
        }

        if (type === 'delete-confirm' && data) {
            title.innerText = 'Confirm Deletion';
            content.innerHTML = `
                <div style="margin-bottom: 16px; color: var(--on-sur-var); font-size: 14px;">
                    Are you sure you want to delete the record: <strong style="color: var(--on-sur);">${data.name}</strong>?<br>
                    This action cannot be undone.
                </div>
                <div class="form-group">
                    <label>Reason for deletion <span style="color:var(--err)">*</span></label>
                    <textarea class="form-control" id="delete-reason-input" rows="3" placeholder="Enter reason for audit log..." required></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                    <button class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button class="btn-primary" style="background: var(--err); border-color: var(--err);" onclick="app.executeDelete('${data.type}', '${data.id}', this)">
                        <span class="material-icons" style="font-size:16px; margin-right:4px;">delete_forever</span> Confirm Delete
                    </button>
                </div>
            `;
        }

        overlay.classList.add('active');
        container.style.display = 'block';
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
        document.getElementById('modal-container').style.display = 'none';
        
        // Also close drawer if open
        this.closeDrawer();
    },

    executeDelete(type, id, btn) {
        const reason = document.getElementById('delete-reason-input').value.trim();
        if (!reason) {
            this.showToast('A reason for deletion is required.', 'error');
            return;
        }

        btn.classList.add('loading');
        setTimeout(() => {
            if (this.state[type]) {
                this.state[type] = this.state[type].filter(item => String(item.id) !== String(id));
                
                // Re-render appropriate view
                if (type === 'classes') {
                    this.filterSessions('all');
                } else if (type === 'candidates') {
                    this.filterCandidates('all');
                } else if (type === 'vouchers') {
                    this.renderVouchers();
                } else if (type === 'proctors') {
                    this.renderProctors();
                }
            }
            
            this.closeModal();
            this.updateDashboardCards();
            this.showToast('Record deleted successfully.', 'success');
        }, 600);
    },

    // --- B2B LOGIC START ---

    renderB2B() {
        // Profile Settings
        if (document.getElementById('profile-biz-name')) {
            document.getElementById('profile-biz-name').value = this.state.b2b.profile.name;
            document.getElementById('profile-tax-id').value = this.state.b2b.profile.taxId;
            document.getElementById('profile-address').value = this.state.b2b.profile.address;
        }

        // Ownership Transfers UI
        const transferPending = this.state.b2b.transfers.find(t => t.status === 'Pending_SuperAdmin');
        if (transferPending) {
            document.getElementById('transfer-form-area').style.display = 'none';
            document.getElementById('transfer-pending-area').style.display = 'block';
            document.getElementById('transfer-pending-email').innerText = transferPending.newOwner;
        } else {
            document.getElementById('transfer-form-area').style.display = 'block';
            document.getElementById('transfer-pending-area').style.display = 'none';
        }

        // Proctor Requests Table
        const reqTbody = document.getElementById('proctor-requests-tbody');
        if (reqTbody) {
            reqTbody.innerHTML = this.state.b2b.requests.map(req => `
                <tr>
                    <td>${req.date}</td>
                    <td>${req.proctor}</td>
                    <td>${req.material}</td>
                    <td>${req.qty}</td>
                    <td><span class="badge ${req.status === 'Pending' ? 'badge-pending' : 'badge-active'}">${req.status}</span></td>
                    <td style="text-align:right;">
                        ${req.status === 'Pending' ? `<button class="btn-secondary" style="padding:4px 12px;" onclick="app.approveRequest('${req.id}')">Approve</button>` : ''}
                    </td>
                </tr>
            `).join('');
        }

        // Invoices Table
        const invTbody = document.getElementById('invoices-tbody');
        if (invTbody) {
            invTbody.innerHTML = this.state.b2b.invoices.map(inv => `
                <tr>
                    <td>${inv.date}</td>
                    <td>${inv.po || 'N/A'}</td>
                    <td>${inv.qty}</td>
                    <td>$${inv.amount.toLocaleString()}</td>
                    <td>${inv.method}</td>
                    <td><span class="badge ${inv.status === 'Paid' ? 'badge-active' : inv.status === 'Overdue' ? 'badge-suspended' : 'badge-pending'}">${inv.status}</span></td>
                    <td style="text-align:right;">
                        <button class="btn-secondary" style="padding:4px 12px;">PDF</button>
                        ${inv.status !== 'Paid' ? `<button class="btn-primary" style="padding:4px 12px; margin-left:8px;" onclick="app.payInvoice('${inv.id}')">Pay Now</button>` : ''}
                    </td>
                </tr>
            `).join('');
        }
    },

    saveProfile() {
        this.state.b2b.profile = {
            name: document.getElementById('profile-biz-name').value,
            taxId: document.getElementById('profile-tax-id').value,
            address: document.getElementById('profile-address').value
        };
        localStorage.setItem('org_profile_settings', JSON.stringify(this.state.b2b.profile));
        
        // Update header if present
        const headerName = document.getElementById('header-org-name');
        if(headerName) headerName.innerText = this.state.b2b.profile.name;
        
        this.showToast('Workspace Profile Saved', 'success');
    },

    initiateTransfer() {
        const email = document.getElementById('transfer-email').value;
        const pass = document.getElementById('transfer-password').value;
        if (!email || !pass) {
            this.showToast('Please enter the new owner email and your password', 'error');
            return;
        }

        this.state.b2b.transfers.push({
            id: 'TRF-' + Math.floor(Math.random()*10000),
            date: new Date().toISOString().split('T')[0],
            newOwner: email,
            status: 'Pending_SuperAdmin'
        });
        localStorage.setItem('sdc_ownership_transfers', JSON.stringify(this.state.b2b.transfers));
        this.renderB2B();
        this.showToast('Ownership Transfer Initiated', 'success');
    },

    updateQuote(prefix = '') {
        const qty = parseInt(document.getElementById(prefix + 'procure-qty').value) || 0;

        // System-determined discount: bulk volume discount applies automatically.
        const BULK_THRESHOLD = 50;
        const discPercent = qty >= BULK_THRESHOLD ? 5 : 0;

        const pricePerUnit = 42; // Base price
        const subtotal = qty * pricePerUnit;
        const discountAmt = (subtotal * discPercent) / 100;
        const total = subtotal - discountAmt;

        document.getElementById(prefix + 'quote-subtotal').innerText = '$' + subtotal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
        document.getElementById(prefix + 'quote-discount').innerText = '-$' + discountAmt.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
        document.getElementById(prefix + 'quote-total').innerText = '$' + total.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});

        // Inform the user when the system applies a discount.
        const notice = document.getElementById(prefix + 'discount-notice');
        const noticeText = document.getElementById(prefix + 'discount-notice-text');
        if (notice && noticeText) {
            if (discPercent > 0) {
                noticeText.innerText = `Bulk Volume Discount (${discPercent}%) applied automatically for orders of ${BULK_THRESHOLD}+ vouchers.`;
                notice.style.display = 'flex';
            } else {
                noticeText.innerText = '';
                notice.style.display = 'none';
            }
        }

        this.currentQuote = { qty, total };
    },

    switchPaymentPath(path, prefix = '') {
        this.state.b2b.procurePath = path;
        
        const instantTab = document.getElementById(prefix + 'tab-pay-instant');
        const net30Tab = document.getElementById(prefix + 'tab-pay-net30');
        const instantContent = document.getElementById(prefix + 'pay-instant');
        const net30Content = document.getElementById(prefix + 'pay-net30');

        if(instantTab) {
            instantTab.classList.toggle('active', path === 'instant');
        }
        if(net30Tab) {
            net30Tab.classList.toggle('active', path === 'net30');
        }
        
        if(instantContent) {
            instantContent.classList.toggle('active', path === 'instant');
            instantContent.style.display = path === 'instant' ? 'block' : 'none';
        }
        if(net30Content) {
            net30Content.classList.toggle('active', path === 'net30');
            net30Content.style.display = path === 'net30' ? 'block' : 'none';
        }
    },

    processCheckout(path, prefix = '') {
        if (!this.currentQuote || this.currentQuote.qty < 1) {
            this.showToast('Please select a valid quantity', 'error');
            return;
        }

        // Overdue Check for Net-30
        if (path === 'net30') {
            const hasOverdue = this.state.b2b.invoices.some(inv => inv.status === 'Overdue');
            if (hasOverdue) {
                this.showToast('Purchase Order Blocked: You have an overdue invoice.', 'error');
                return;
            }
            
            const poStr = document.getElementById(prefix + 'procure-po').value.trim();
            if(!poStr) {
                this.showToast('Internal PO Number is required for Net-30', 'error');
                return;
            }
        }

        const newInv = {
            id: 'INV-' + Math.floor(Math.random()*10000),
            date: new Date().toISOString().split('T')[0],
            po: path === 'net30' ? document.getElementById(prefix + 'procure-po').value : 'Online Purchase',
            qty: this.currentQuote.qty,
            amount: this.currentQuote.total,
            method: path === 'instant' ? 'Credit Card' : 'Net-30',
            status: path === 'instant' ? 'Paid' : 'Pending Clearance'
        };

        this.state.b2b.invoices.unshift(newInv);
        localStorage.setItem('sdc_org_invoices', JSON.stringify(this.state.b2b.invoices));

        // Provision vouchers into the selected certification's pool, creating it
        // on the first purchase (day zero).
        const certEl = document.getElementById(prefix + 'procure-cert');
        const certName = (certEl && certEl.value) ? certEl.value : 'Exam Vouchers';
        this.addVouchersToPool(certName, this.currentQuote.qty);

        this.renderVouchers();
        this.renderB2B();
        this.updateDashboardCards();

        this.showToast(path === 'instant' ? 'Payment Successful. Vouchers Added!' : 'PO Generated. Vouchers Unlocked!', 'success');
    },

    approveRequest(reqId) {
        const req = this.state.b2b.requests.find(r => r.id === reqId);
        if (req) {
            req.status = 'Approved';
            localStorage.setItem('sdc_vreq_v3', JSON.stringify(this.state.b2b.requests));
            this.renderB2B();
            this.showToast('Proctor Request Approved', 'success');
        }
    },

    payInvoice(invId) {
        const inv = this.state.b2b.invoices.find(i => i.id === invId);
        if (inv) {
            inv.status = 'Paid';
            localStorage.setItem('sdc_org_invoices', JSON.stringify(this.state.b2b.invoices));
            this.renderB2B();
            this.showToast('Invoice Paid via Vaulted Card', 'success');
        }
    },

    openPOModal() {
        document.getElementById('po-processing-modal').style.display = 'flex';
    },

    submitPurchaseOrder() {
        const signature = document.getElementById('po-signature').value;
        const terms = document.getElementById('po-terms').checked;
        
        if (!terms) {
            this.showToast('You must agree to the terms and conditions.', 'error');
            return;
        }
        
        if (!signature) {
            this.showToast('Please provide a digital signature or upload an external PO.', 'error');
            return;
        }

        document.getElementById('po-processing-modal').style.display = 'none';
        
        // Hide pending action card
        const card = document.getElementById('pending-action-card');
        if (card) card.style.display = 'none';

        // Show success modal
        document.getElementById('po-success-modal').style.display = 'flex';

        // Provision the 50 ordered vouchers, creating the pool on first purchase.
        this.addVouchersToPool('Professional Chef Certification', 50);
        this.updateDashboardCards();
        this.renderVouchers();
    },

    assignVouchers() {
        document.getElementById('po-success-modal').style.display = 'none';
        this.navigateTo('candidates');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
