/* ═══════════════════════════════════════════════════════════════ */
/*  SDC Super Admin — Core Logic                                  */
/*  Clean, single-responsibility functions. No dead code.         */
/* ═══════════════════════════════════════════════════════════════ */

// ─── DATA ──────────────────────────────────────────────────────
// Day zero: the platform has launched with its product catalog configured
// (voucher SKUs, pricing, credentials below) but no organizations have signed
// up yet. They appear here as they register and are approved.
let organizations = JSON.parse(localStorage.getItem('sdc_organizations_v2')) || [
    { name: 'Northwind Culinary Institute', legalName: 'Northwind Culinary Institute LLC', displayName: 'Northwind Culinary Institute', firstName: 'Maria', lastName: 'Gonzalez', slug: '@northwind', domain: 'northwind.edu', email: 'maria@northwind.edu', status: 'ACTIVE', isVerified: true, customDiscount: 10 },
    { name: 'Riverside College of Hospitality', legalName: 'Riverside College', displayName: 'Riverside College of Hospitality', firstName: 'David', lastName: 'Okafor', slug: '@riverside', domain: 'riverside.edu', email: 'dokafor@riverside.edu', status: 'ACTIVE', isVerified: true, customDiscount: 0 },
    { name: 'Summit Hotel Group', legalName: 'Summit Hospitality Holdings', displayName: 'Summit Hotel Group', firstName: 'Elena', lastName: 'Voss', slug: '@summit', domain: 'summithotels.com', email: 'elena.voss@summithotels.com', status: 'ACTIVE', isVerified: true, customDiscount: 15 },
    { name: 'Metro Food Services', legalName: 'Metro Food Services Inc.', displayName: 'Metro Food Services', firstName: 'James', lastName: 'Park', slug: '@metro', domain: 'metrofs.com', email: 'jpark@metrofs.com', status: 'ACTIVE', isVerified: true, customDiscount: 5 },
    { name: 'Greenfield University', legalName: 'Greenfield University', displayName: 'Greenfield University', firstName: 'Aisha', lastName: 'Rahman', slug: '@greenfield', domain: 'greenfield.edu', email: 'a.rahman@greenfield.edu', status: 'ACTIVE', isVerified: true, customDiscount: 20 },
    { name: 'Lakeside Catering Academy', legalName: 'Lakeside Catering Academy LLC', displayName: 'Lakeside Catering Academy', firstName: 'Daniel', lastName: 'Whitman', slug: '@lakeside', domain: 'lakesidecatering.edu', email: 'dwhitman@lakesidecatering.edu', status: 'ACTIVE', isVerified: true, customDiscount: 8 },
    { name: 'Grand Palace Hotels', legalName: 'Grand Palace Hospitality Group', displayName: 'Grand Palace Hotels', firstName: 'Sophia', lastName: 'Laurent', slug: '@grandpalace', domain: 'grandpalacehotels.com', email: 'sophia.laurent@grandpalacehotels.com', status: 'ACTIVE', isVerified: true, customDiscount: 12 },
    { name: 'Pacific Culinary College', legalName: 'Pacific Culinary College', displayName: 'Pacific Culinary College', firstName: 'Kenji', lastName: 'Sato', slug: '@pacific', domain: 'pacificculinary.edu', email: 'k.sato@pacificculinary.edu', status: 'ACTIVE', isVerified: true, customDiscount: 18 },
    { name: 'Evergreen Hospitality Group', legalName: 'Evergreen Hospitality Group Inc.', displayName: 'Evergreen Hospitality Group', firstName: 'Olivia', lastName: 'Brennan', slug: '@evergreen', domain: 'evergreenhospitality.com', email: 'obrennan@evergreenhospitality.com', status: 'ACTIVE', isVerified: true, customDiscount: 6 },
    { name: 'Crestview Institute of Food Science', legalName: 'Crestview Institute', displayName: 'Crestview Institute of Food Science', firstName: 'Marcus', lastName: 'Hale', slug: '@crestview', domain: 'crestview.edu', email: 'mhale@crestview.edu', status: 'ACTIVE', isVerified: true, customDiscount: 10 },
    { name: 'Bluewater Resorts & Spa', legalName: 'Bluewater Resorts Holdings', displayName: 'Bluewater Resorts & Spa', firstName: 'Priya', lastName: 'Nair', slug: '@bluewater', domain: 'bluewaterresorts.com', email: 'priya.nair@bluewaterresorts.com', status: 'ACTIVE', isVerified: true, customDiscount: 14 },
    { name: 'Harbor Institute of Culinary Arts', legalName: 'Harbor Institute', displayName: 'Harbor Institute of Culinary Arts', firstName: 'Tom', lastName: 'Becker', slug: '@harbor', domain: 'harbor.edu', email: 'tbecker@harbor.edu', status: 'TRIAL', isVerified: true, customDiscount: 0, trialExpiry: '2026-07-15' },
    { name: 'Beta Academy', legalName: 'Beta Academy LLC', displayName: 'Beta Academy', firstName: 'Nina', lastName: 'Cruz', slug: '@beta', domain: 'betaacademy.com', email: 'nina@betaacademy.com', status: 'TRIAL', isVerified: true, customDiscount: 0, trialExpiry: '2026-07-02' },
    { name: 'Coastal Catering Co.', legalName: 'Coastal Catering Company', displayName: 'Coastal Catering Co.', firstName: 'Raj', lastName: 'Patel', slug: '@coastal', domain: 'coastalcatering.com', email: 'raj@gmail.com', status: 'PENDING', isVerified: false, customDiscount: 0, flags: ['domain_mismatch'] },
    { name: 'Old Town Bistro Group', legalName: 'Old Town Bistro Group', displayName: 'Old Town Bistro Group', firstName: 'Carla', lastName: 'Mendez', slug: '@oldtown', domain: 'oldtownbistro.com', email: 'carla@oldtownbistro.com', status: 'SUSPENDED', isVerified: true, customDiscount: 0, suspendReason: 'Payment overdue 60+ days' }
];

function saveOrganizations() {
    localStorage.setItem('sdc_organizations_v2', JSON.stringify(organizations));
}

// Discount Offer (per-org): a master enable/disable toggle gates the percentage.
// When disabled, the system ignores the stored percentage entirely.
// Backfill the toggle for any org that predates the flag (enabled if it had a discount).
organizations.forEach(o => { if (o.discountEnabled === undefined) o.discountEnabled = !!o.customDiscount; });
function effectiveOrgDiscount(org) {
    return (org && org.discountEnabled && org.customDiscount) ? org.customDiscount : 0;
}


let vouchers = [
    { cert: "Food Handling & Sanitation Certification", price: 140 },
    { cert: "Professional Chef Certification", price: 790 },
    { cert: "Certified Restaurant Manager", price: 550 },
    { cert: "Front Office Operations Certification", price: 666 },
    { cert: "Hospitality Service Excellence Certification", price: 66 },
    { cert: "Diploma in Tourism Management", price: 58 },
    { cert: "Culinary Arts Fundamentals", price: 320 },
    { cert: "Beverage & Mixology Mastery", price: 410 },
    { cert: "Event Planning & Catering", price: 890 },
    { cert: "Food Safety Inspector Prep", price: 1200 },
    { cert: "Fast Food Franchise Operations", price: 45 } // Edge case: very low price
];

let discountRules = [
    { name: "Bulk Volume Discount", condition: ">50 units", percent: 5, enabled: true },
    { name: "Partnership Rate", condition: "partnership", percent: 10, enabled: true },
    { name: "Annual Renewal Loyalty", condition: "renewal", percent: 8, enabled: true },
    { name: "Enterprise Volume", condition: ">100 units", percent: 12, enabled: false },
    { name: "Mega Enterprise", condition: ">500 units", percent: 20, enabled: true },
    { name: "Non-Profit Grant", condition: "non-profit", percent: 50, enabled: true }, // Edge case: huge discount
    { name: "Early Adopter Beta", condition: "beta", percent: 100, enabled: false } // Edge case: 100% off
];

let credentials = [
    { cert: 'Food Handling & Sanitation', code: 'FHSC', examCode: 'FHSC-99', provider: 'Assess AI', validity: '60 months', category: 'Management', badge: '#1f2937', desc: '', score: 70, ceu: 0, renewal: 'Yes', enabled: true, testId: '72b0c5d3' },
    { cert: 'Diploma in Tourism Management', code: 'DTM', examCode: 'DTM-01', provider: 'Pearson VUE', validity: '36 months', category: 'Operations', badge: '#d97706', desc: '', score: 65, ceu: 5, renewal: 'No', enabled: true, testId: '83c1d6e4' },
    { cert: 'Front Office Operations', code: 'FOOC', examCode: 'FOOC-22', provider: 'Prometric', validity: '48 months', category: 'Management', badge: '#059669', desc: '', score: 80, ceu: 10, renewal: 'Yes', enabled: true, testId: '94d2e7f5' },
    { cert: 'Our Main Exam', code: 'OME', examCode: 'OME-10', provider: 'Assess AI', validity: '24 months', category: 'Safety', badge: '#dc2626', desc: '', score: 75, ceu: 0, renewal: 'No', enabled: false, testId: 'a5e3f8g6' },
    { cert: 'Mixology Expert', code: 'MIX', examCode: 'MIX-02', provider: 'Assess AI', validity: '12 months', category: 'Beverage', badge: '#2563eb', desc: '', score: 90, ceu: 2, renewal: 'Yes', enabled: true, testId: 'b6f4g9h7' },
    { cert: 'Event Catering Pro', code: 'ECP', examCode: 'ECP-03', provider: 'Pearson VUE', validity: 'Lifetime', category: 'Events', badge: '#7c3aed', desc: '', score: 60, ceu: 15, renewal: 'No', enabled: true, testId: 'c7g5h0i8' }, // Edge case: Lifetime
    { cert: 'Fast Food Supervisor', code: 'FFS', examCode: 'FFS-04', provider: 'Prometric', validity: '6 months', category: 'Management', badge: '#db2777', desc: '', score: 85, ceu: 1, renewal: 'Yes', enabled: true, testId: 'd8h6i1j9' }, // Edge case: Short validity
    { cert: 'Food Safety Inspector', code: 'FSI', examCode: 'FSI-05', provider: 'State Board', validity: '24 months', category: 'Safety', badge: '#4b5563', desc: '', score: 95, ceu: 20, renewal: 'Yes', enabled: true, testId: 'e9i7j2k0' }, // Edge case: High score req
    { cert: 'Kitchen Prep Basics', code: 'KPB', examCode: 'KPB-06', provider: 'Assess AI', validity: '12 months', category: 'Operations', badge: '#65a30d', desc: '', score: 50, ceu: 0, renewal: 'No', enabled: true, testId: 'f0j8k3l1' },
    { cert: 'Deprecated Cert', code: 'OLD', examCode: 'OLD-99', provider: 'Unknown', validity: '1 month', category: 'Legacy', badge: '#000000', desc: '', score: 100, ceu: 0, renewal: 'No', enabled: false, testId: 'g1k9l4m2' }
];

// Day zero: no support tickets raised yet.
const supportTickets = [];

// Day zero: no financial clearances pending.
const clearances = [];

// Voucher Requests (cross-portal, persisted)
// Day zero: cross-portal request/purchase queues start empty. They fill as
// organizations submit voucher requests, online-class requests, and the public
// website takes B2C purchases.
function loadVoucherRequests() {
    const stored = localStorage.getItem('sdc_vreq_v3');
    return stored ? JSON.parse(stored) : [
        { organization: 'Northwind Culinary Institute', details: 'Professional Chef Certification', qty: 50, mode: 'Purchase Order', status: 'PENDING' },
        { organization: 'Summit Hotel Group', details: 'Hospitality Service Excellence', qty: 120, mode: 'Credit Card', status: 'PENDING' },
        { organization: 'Metro Food Services', details: 'Food Handling & Sanitation', qty: 75, mode: 'Purchase Order', status: 'APPROVED' },
        { organization: 'Greenfield University', details: 'Culinary Arts Fundamentals', qty: 40, mode: 'Invoice', status: 'APPROVED' },
        { organization: 'Coastal Catering Co.', details: 'Food Handling & Sanitation', qty: 200, mode: 'Purchase Order', status: 'APPROVED', date: '2026-06-05' },
        { organization: 'Alpine Resorts Group', details: 'Allergen Awareness', qty: 60, mode: 'Credit Card', status: 'APPROVED', date: '2026-06-08' },
        { organization: 'Lakeside Hospitality School', details: 'HACCP Certification', qty: 90, mode: 'Invoice', status: 'APPROVED', date: '2026-06-15' }
    ];
}
function saveVoucherRequests(data) { localStorage.setItem('sdc_vreq_v3', JSON.stringify(data)); }
let voucherRequests = loadVoucherRequests();

function loadOnlineRequests() {
    const stored = localStorage.getItem('sdc_oreq_v3');
    return stored ? JSON.parse(stored) : [
        { organization: 'Riverside College of Hospitality', classTitle: 'Food Safety Mgmt — Summer Class', students: 30, totalCost: 4500, mode: 'Credit Card', status: 'PENDING' },
        { organization: 'Harbor Institute of Culinary Arts', classTitle: 'Allergen Awareness Online', students: 18, totalCost: 2160, mode: 'Invoice', status: 'APPROVED' },
        { organization: 'Greenfield University', classTitle: 'HACCP Level 3 — Online Cohort', students: 25, totalCost: 3750, mode: 'Credit Card', status: 'APPROVED', date: '2026-06-09' },
        { organization: 'Metro Food Services', classTitle: 'Food Protection Manager Prep', students: 42, totalCost: 5040, mode: 'Purchase Order', status: 'APPROVED', date: '2026-06-13' }
    ];
}
let onlineRequests = loadOnlineRequests();

function loadWebsitePurchases() {
    const stored = localStorage.getItem('sdc_wp_v3');
    return stored ? JSON.parse(stored) : [
        { email: 'amelia.carter@gmail.com',          cert: 'Food Handler Certification',      qty: 1, date: '2026-06-21', status: 'PAID' },
        { email: 'liam.nguyen@outlook.com',          cert: 'Allergen Awareness',               qty: 1, date: '2026-06-20', status: 'PAID' },
        { email: 'training@bistro54.com',            cert: 'Food Protection Manager (FPM)',    qty: 4, date: '2026-06-19', status: 'PAID' },
        { email: 'noah.patel@gmail.com',             cert: 'HACCP Certification',              qty: 1, date: '2026-06-18', status: 'PROCESSING' },
        { email: 'chef.olivia@harvestkitchen.com',   cert: 'Professional Chef Certification',  qty: 2, date: '2026-06-16', status: 'PAID' },
        { email: 'mason.reed@gmail.com',             cert: 'Food Handler Certification',       qty: 1, date: '2026-06-14', status: 'PAID' }
    ];
}
let websitePurchases = loadWebsitePurchases();
function saveOnlineRequests() { localStorage.setItem('sdc_oreq_v3', JSON.stringify(onlineRequests)); }
function saveWebsitePurchases() { localStorage.setItem('sdc_wp_v3', JSON.stringify(websitePurchases)); }

// ─── PENDING COLLECTION: dunning (reminders + auto-deactivation) ───
// Deterministic "today" for the demo (mirrors the app's hardcoded-today pattern).
const COLLECTION_TODAY = new Date('2026-06-23');
const COLLECTION_NET_DAYS = 30; // due date = transaction date + Net-30
// Demo transaction dates chosen so seeded pending items land at different
// reminder stages relative to COLLECTION_TODAY (works even if older localStorage
// records have no `date` field).
const COLLECTION_SEED_DATES = {
    'Northwind Culinary Institute':      '2026-05-11', // due 06-10 → +10 overdue → 3/3 + deactivate
    'Summit Hotel Group':                '2026-05-25', // due 06-24 → due−1 reached → 2/3
    'Riverside College of Hospitality':  '2026-05-29'  // due 06-28 → due−7 reached → 1/3
};
// Three escalating reminder emails (content changes per stage).
const COLLECTION_REMINDER_TEMPLATES = [
    { stage: 1, type: 'Payment Reminder', label: '1st notice',
      subject: 'Upcoming payment due in 7 days',
      body: 'A friendly reminder that your payment is due in one week. Please arrange settlement to keep your account in good standing.' },
    { stage: 2, type: 'Payment Reminder', label: '2nd notice',
      subject: 'Payment due tomorrow — please remit',
      body: 'Your payment is due tomorrow. Kindly remit promptly to avoid service interruption.' },
    { stage: 3, type: 'Payment Reminder', label: 'final notice',
      subject: 'FINAL NOTICE: payment 10 days overdue — account will be deactivated',
      body: 'Your payment is now 10 days overdue. This is the final reminder before your account is deactivated for non-payment.' }
];
function loadCollectionReminders() {
    try { return JSON.parse(localStorage.getItem('sdc_collection_reminders') || '{}'); }
    catch (e) { return {}; }
}
let collectionReminders = loadCollectionReminders();
function saveCollectionReminders() { localStorage.setItem('sdc_collection_reminders', JSON.stringify(collectionReminders)); }

function collectionKey(item) { return `${item.source}|${item.client}|${item.details}|${item.amount}`; }
function collectionAddDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function collectionFmt(d) { return new Date(d).toISOString().slice(0, 10); }
function collectionDueDate(item) { return collectionAddDays(item.date, COLLECTION_NET_DAYS); }
function collectionMilestones(due) {
    return [
        { stage: 1, at: collectionAddDays(due, -7) },
        { stage: 2, at: collectionAddDays(due, -1) },
        { stage: 3, at: collectionAddDays(due, 10) }
    ];
}

// Email Audit Log
// Day zero: no automated emails sent yet.
const emailLog = [];

// ─── STATE ─────────────────────────────────────────────────────
let currentEditOrgIndex = null;
let currentVoucherTab = 'individual';
let currentVoucherManagementTab = 'requests';
let currentOrgFilter = 'ALL';
let orgSearchQuery = '';
let orgToSuspend = null;
let currentProfileOrgIndex = null;

let pendingDeleteType = null;
let pendingDeleteIndex = null;

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    saveOrganizations();
    renderOrganizations();
    renderActionRequired();
    renderVouchers();
    renderDiscounts();
    renderCredentials();
    renderPurchaseRequests();
    renderEmailLog();
    renderCredentials();
    renderSupportQueue();
    renderFinancialClearance();
    renderTransfersQueue();
    updateAlertTicker();
    updateOrgStats();
    updateVoucherMetrics();
    renderFinancialLedger();
});

// ─── NAVIGATION ────────────────────────────────────────────────
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
    if (sectionId === 'org-details') {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('.nav-item[data-target="organizations"]').classList.add('active');
    }
    document.getElementById(sectionId).classList.add('active');
}

// ─── ALERT TICKER ──────────────────────────────────────────────
function updateAlertTicker() {
    const pendingOrgs = organizations.filter(o => o.status === 'PENDING').length;
    const pendingQuotes = voucherRequests.filter(r => r.status === 'PENDING').length;
    const pendingOnline = onlineRequests.filter(r => r.status === 'PENDING').length;
    const totalActionRequired = pendingOrgs + pendingQuotes + pendingOnline;

    const badge = document.getElementById('nav-badge-action-required');
    if (badge) {
        badge.textContent = totalActionRequired;
        badge.style.display = totalActionRequired > 0 ? 'inline-block' : 'none';
    }

    const criticalCount = supportTickets.filter(t => t.tier === 'critical').length;
    const overdueCount = clearances.filter(c => c.daysPending > 21).length;
    
    const parts = [];
    if (totalActionRequired) parts.push(`${totalActionRequired} Pending Approval${totalActionRequired > 1 ? 's' : ''}`);
    if (criticalCount) parts.push(`${criticalCount} Critical Support Ticket${criticalCount > 1 ? 's' : ''}`);
    if (overdueCount) parts.push(`${overdueCount} Overdue Clearance${overdueCount > 1 ? 's' : ''}`);
    
    const ticker = document.getElementById('ticker-content');
    const tickerEl = document.getElementById('global-alert-ticker');
    if (parts.length === 0) {
        ticker.textContent = 'All systems operational — no pending actions.';
        tickerEl.querySelector('.ticker-icon').style.color = 'var(--suc-text)';
        tickerEl.querySelector('.ticker-icon').className = 'material-icons ticker-icon';
        tickerEl.querySelector('.ticker-icon').textContent = 'check_circle';
    } else {
        ticker.textContent = parts.join('  •  ');
        tickerEl.querySelector('.ticker-icon').style.color = 'var(--amber)';
        tickerEl.querySelector('.ticker-icon').className = 'material-icons ticker-icon';
        tickerEl.querySelector('.ticker-icon').textContent = 'warning';
    }
}

function updateVoucherMetrics() {
    // Calc MTD Revenue from website + approved/paid orders
    let rev = 0;
    websitePurchases.forEach(p => { if(p.status === 'PAID') rev += 140; }); // stub 140 per purchase
    voucherRequests.forEach(r => { if(r.status === 'PAID' || r.status === 'APPROVED') rev += (r.qty * 140); });
    onlineRequests.forEach(r => { if(r.status === 'APPROVED') rev += r.totalCost; });

    // Pending Sales Actions
    const pendingSales = voucherRequests.filter(r => r.status === 'PENDING').length + onlineRequests.filter(r => r.status === 'PENDING').length;

    const elRev = document.getElementById('metric-revenue');
    const elPending = document.getElementById('metric-pending-sales');
    if (elRev) elRev.textContent = '$' + rev.toLocaleString();
    if (elPending) elPending.textContent = pendingSales;
}

// ─── ACTION REQUIRED ───────────────────────────────────────────
let currentSelectedActionType = null;
let currentSelectedActionIndex = null;

let actionFilters = { type: 'ALL' };

function setActionFilter(dim, val, el) {
    actionFilters[dim] = val;
    document.querySelectorAll('#action-required .ar-chip[data-dim="' + dim + '"]').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    renderActionRequired();
}

function renderActionRequired() {
    const body = document.getElementById('ar-table-body');
    if (!body) return;

    const pendingOrgs = organizations.map((o, i) => ({ ...o, originalIndex: i, actionType: 'org', date: 'Just now' })).filter(o => o.status === 'PENDING');
    const pendingProc = voucherRequests.map((r, i) => ({ ...r, name: r.organization, originalIndex: i, actionType: 'proc', date: '2 hrs ago', flowType: 'proc' })).filter(r => r.status === 'PENDING');
    const pendingOnline = onlineRequests.map((r, i) => ({ ...r, name: r.organization, originalIndex: i, actionType: 'online', date: '5 hrs ago', flowType: 'online' })).filter(r => r.status === 'PENDING');

    const allPending = [...pendingOrgs, ...pendingProc, ...pendingOnline];
    // Voucher purchases and online-service requests are clubbed under one
    // "Voucher Purchase" category (registration stays separate). Detail/approve
    // logic still branches on actionType ('proc' vs 'online') for the right fields.
    const typeLabel = { org: 'Registration', proc: 'Voucher Purchase', online: 'Voucher Purchase' };
    const actionCategory = t => (t === 'org' ? 'org' : 'purchase');
    // Request medium: where the purchase request originated — the org's own
    // application (proc) vs. the public website (online). Registration n/a.
    const mediumLabel = { proc: 'Application', online: 'Website', org: '—' };

    let rows = allPending.filter(it =>
        (actionFilters.type === 'ALL' || actionCategory(it.actionType) === actionFilters.type)
    );

    if (allPending.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:48px;color:var(--text-tertiary);"><i class="material-icons" style="font-size:40px;opacity:.4;display:block;margin-bottom:8px;">inbox</i>No pending requests. You\'re all caught up.</td></tr>';
        currentSelectedActionType = null;
        currentSelectedActionIndex = null;
        return;
    }

    if (rows.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-tertiary);">No items match the selected filters.</td></tr>';
    } else {
        body.innerHTML = rows.map(item => {
            const isSel = (currentSelectedActionType === item.actionType && currentSelectedActionIndex === item.originalIndex);
            const warn = item.flags && item.flags.length ? ' <i class="material-icons" style="color:#f59e0b;font-size:15px;vertical-align:middle;" title="Has flags">warning</i>' : '';
            const chevron = '<i class="material-icons ar-chevron" style="font-size:18px;vertical-align:middle;transition:transform .2s;' + (isSel ? 'transform:rotate(180deg);' : '') + '">expand_more</i>';
            const rowHtml = '<tr class="ar-row' + (isSel ? ' ar-row-open' : '') + '" onclick="selectActionItem(\'' + item.actionType + '\', ' + item.originalIndex + ')">' +
                '<td><div class="ar-name">' + item.name + warn + '</div><div class="ar-sub">' + typeLabel[item.actionType] + ' request</div></td>' +
                '<td><span class="ar-type-badge">' + typeLabel[item.actionType] + '</span></td>' +
                '<td><span class="ar-medium">' + mediumLabel[item.actionType] + '</span></td>' +
                '<td style="color:var(--text-secondary);">' + item.date + '</td>' +
                '<td style="text-align:right;"><button class="btn-secondary" style="padding:6px 14px;height:auto;font-size:13px;display:inline-flex;align-items:center;gap:4px;" onclick="event.stopPropagation(); selectActionItem(\'' + item.actionType + '\', ' + item.originalIndex + ')">' + (isSel ? 'Close' : 'Review') + chevron + '</button></td>' +
                '</tr>';
            const accordionHtml = isSel
                ? '<tr class="ar-accordion-row" id="ar-accordion-open"><td colspan="5" style="padding:0;background:var(--surface-bg);">' +
                      '<div class="ar-accordion-body">' + getActionDetailHtml(item.actionType, item.originalIndex) + '</div>' +
                  '</td></tr>'
                : '';
            return rowHtml + accordionHtml;
        }).join('');
    }

    // Clear stale selection if the open item is no longer pending (e.g. after approve/reject).
    let selectedValid = false;
    if (currentSelectedActionType === 'org' && organizations[currentSelectedActionIndex] && organizations[currentSelectedActionIndex].status === 'PENDING') selectedValid = true;
    if (currentSelectedActionType === 'proc' && voucherRequests[currentSelectedActionIndex] && voucherRequests[currentSelectedActionIndex].status === 'PENDING') selectedValid = true;
    if (currentSelectedActionType === 'online' && onlineRequests[currentSelectedActionIndex] && onlineRequests[currentSelectedActionIndex].status === 'PENDING') selectedValid = true;
    if (!selectedValid) {
        currentSelectedActionType = null;
        currentSelectedActionIndex = null;
    }
}

function selectActionItem(type, index) {
    const t = (typeof type === 'number') ? 'org' : type;
    const i = (typeof type === 'number') ? type : index;
    // Accordion toggle: clicking the already-open row collapses it.
    if (currentSelectedActionType === t && currentSelectedActionIndex === i) {
        currentSelectedActionType = null;
        currentSelectedActionIndex = null;
        renderActionRequired();
        return;
    }
    currentSelectedActionType = t;
    currentSelectedActionIndex = i;
    renderActionRequired();
    const open = document.getElementById('ar-accordion-open');
    if (open) open.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getActionDetailHtml(type, index) {
    let title, alertBlock = '', detailsHtml = '';

    // Default values if no specific type handler matches, although it shouldn't happen.
    let itemEmail = 'N/A';

    if (type === 'org') {
        const org = organizations[index];
        itemEmail = org.email;
        title = `Review Request: ${org.name}`;
        if (org.flags && org.flags.includes('domain_mismatch')) {
            alertBlock = `
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px;">
                <i class="material-icons" style="color: #f59e0b; font-size: 20px; margin-top: 2px;">warning</i>
                <div>
                    <h4 style="color: #f59e0b; font-size: 15px; margin-bottom: 4px;">Flag: Domain Mismatch</h4>
                    <p style="color: var(--text-secondary); font-size: 13px;">The applicant's email domain does not match the claimed company web domain. Please verify authenticity before approving.</p>
                </div>
            </div>
            `;
        }
        
        let quoteSection = '';
        if (org.flowType === 'quote') {
            quoteSection = `
            <div style="display: contents;">
                <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Requested Exam Assessment</div>
                <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${org.quoteCourse}</div>
                
                <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Quantity</div>
                <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${org.quoteQty} Vouchers</div>
            </div>
            `;
        }
        
        detailsHtml = `
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Organization Name</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${org.name}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Claimed Domain</div>
            <div style="color: var(--text-primary); font-size: 14px; display: flex; align-items: center; gap: 8px;">
                ${org.domain || 'N/A'} ${org.domain ? '<a href="http://' + org.domain + '" target="_blank" style="color: var(--primary);"><i class="material-icons" style="font-size:12px;">open_in_new</i></a>' : ''}
            </div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Applicant Email</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${org.email}</div>
            
            ${quoteSection}
        `;
    } else if (type === 'proc') {
        const proc = voucherRequests[index];
        title = `Voucher Purchase: ${proc.organization}`;
        detailsHtml = `
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Organization Name</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${proc.organization}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Certification</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${proc.details}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Quantity</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${proc.qty}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Payment Mode</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${proc.mode}</div>
        `;
    } else if (type === 'online') {
        const online = onlineRequests[index];
        title = `Application Request: ${online.organization}`;
        detailsHtml = `
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Organization Name</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${online.organization}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Class Title</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${online.classTitle}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Candidates</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${online.students}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Total Cost</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">$${online.totalCost.toLocaleString()}</div>
            
            <div style="color: var(--text-tertiary); font-size: 13px; font-weight: 500;">Payment Mode</div>
            <div style="color: var(--text-primary); font-size: 14px; font-weight: 500;">${online.mode}</div>
        `;
    }

    return `
        <div style="padding: 24px 28px;">
            <h2 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0;">${title}</h2>
            ${alertBlock}

            <div style="background: var(--surface-light); border-radius: 12px; border: 1px solid var(--border-color); padding: 24px; margin-bottom: 20px;">
                <h3 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">Data Comparison</h3>

                <div style="display: grid; grid-template-columns: 200px 1fr; row-gap: 16px; align-items: center;">
                    ${detailsHtml}
                </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">
                <button class="btn-danger-outline" onclick="event.stopPropagation(); rejectItem('${type}', ${index})">Reject Request</button>
                <button class="btn-secondary" onclick="event.stopPropagation(); prClarify('${type}', ${index})">Request Clarification</button>
                <button class="btn-primary" onclick="event.stopPropagation(); approveItem('${type}', ${index})">Approve &amp; Provision</button>
            </div>
        </div>
    `;
}
function approveItem(type, index) {
    if (type === 'org') {
        organizations[index].status = 'ACTIVE';
        saveOrganizations();
        renderOrganizations();
        showToast('Organization Approved', 'success');
        renderOrganizations();
    } else if (type === 'proc') {
        voucherRequests[index].status = 'APPROVED';
        saveVoucherRequests(voucherRequests);
        showToast('Purchase Request Approved', 'success');
        renderPurchaseRequests();
    } else if (type === 'online') {
        onlineRequests[index].status = 'APPROVED';
        localStorage.setItem('sdc_oreq_v3', JSON.stringify(onlineRequests));
        showToast('Application Request Approved', 'success');
        renderPurchaseRequests();
    }
    renderActionRequired();
    updateAlertTicker();
    updateOrgStats();
}

function rejectItem(type, index) {
    if (!confirm('Are you sure you want to reject this request?')) return;

    if (type === 'org') {
        organizations.splice(index, 1);
        showToast('Organization Rejected and Removed', 'success');
        renderOrganizations();
    } else if (type === 'proc') {
        voucherRequests[index].status = 'REJECTED';
        saveVoucherRequests(voucherRequests);
        showToast('Purchase Request Rejected', 'success');
        renderPurchaseRequests();
    } else if (type === 'online') {
        onlineRequests[index].status = 'REJECTED';
        localStorage.setItem('sdc_oreq_v3', JSON.stringify(onlineRequests));
        showToast('Application Request Rejected', 'success');
        renderPurchaseRequests();
    }
    renderActionRequired();
    updateAlertTicker();
    updateOrgStats();
}

// ─── ORGANIZATIONS ─────────────────────────────────────────────
function updateOrgStats() {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-all-count', organizations.length);
    el('stat-active-count', organizations.filter(o => o.status === 'ACTIVE').length);
    el('stat-trial-count', organizations.filter(o => o.status === 'TRIAL').length);
    el('stat-pending-count', organizations.filter(o => o.status === 'PENDING').length);
    el('stat-suspended-count', organizations.filter(o => o.status === 'SUSPENDED').length);
}

function handleOrgSearch() {
    const input = document.getElementById('orgSearchInput');
    if (input) { orgSearchQuery = input.value.toLowerCase(); renderOrganizations(); }
}

function filterByStatus(status) {
    currentOrgFilter = status;
    document.querySelectorAll('#org-stats-filters .filter-card').forEach(c => c.classList.remove('active'));
    const id = 'filter-card-' + (status === 'ALL' ? 'all' : status.toLowerCase());
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    renderOrganizations();
}

function renderOrganizations() {
    const tbody = document.getElementById('organizations-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filtered = organizations.filter(org => {
        const matchStatus = currentOrgFilter === 'ALL' || org.status === currentOrgFilter;
        const matchSearch = org.name.toLowerCase().includes(orgSearchQuery) ||
                            org.slug.toLowerCase().includes(orgSearchQuery) ||
                            org.email.toLowerCase().includes(orgSearchQuery);
        return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 48px; color: var(--text-tertiary);"><i class="material-icons" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.4;">business</i>No organizations match this filter.</td></tr>`;
        return;
    }

    filtered.forEach(org => {
        const index = organizations.indexOf(org);
        const tr = document.createElement('tr');

        // Handle trial expiry simulation
        if (org.status === 'TRIAL' && org.trialExpiry) {
            const expiryDate = new Date(org.trialExpiry);
            const today = new Date('2026-06-17');
            if (expiryDate < today) {
                org.status = 'SUSPENDED';
                org.suspendReason = 'Trial Expired';
            }
        }

        let badgeClass = 'badge-trial';
        if (org.status === 'ACTIVE') badgeClass = 'badge-active';
        else if (org.status === 'SUSPENDED') badgeClass = 'badge-suspended';
        else if (org.status === 'PENDING') badgeClass = 'badge-verification';

        let discountCol;
        if (!org.discountEnabled) {
            discountCol = `<span style="color:var(--text-tertiary);" title="Discount disabled">Off</span>`;
        } else if (org.customDiscount) {
            discountCol = `${org.customDiscount}%`;
        } else {
            discountCol = '-';
        }
        let trialExpiryStr = '';
        if (org.status === 'TRIAL' && org.trialExpiry) {
            trialExpiryStr = `<div style="font-size: 11px; color: var(--text-tertiary); margin-top: 4px;"><i class="material-icons">schedule</i> Expires: ${org.trialExpiry}</div>`;
        }

        let verifyBadge = '';
        if (org.status === 'ACTIVE' || org.isVerified) {
            verifyBadge = '<i class="material-icons" style="color: var(--suc-text); margin-left: 4px;" title="Verified Organization">check_circle</i>';
        } else if (org.flags && org.flags.length > 0) {
            const reasons = org.flags.map(f => f.replace('_', ' ')).join(', ');
            verifyBadge = `<i class="material-icons" style="color: var(--err-text); margin-left: 4px;" title="Flagged: ${reasons}">flag</i>`;
        } else if (org.status === 'SUSPENDED') {
            verifyBadge = `<i class="material-icons" style="color: var(--err-text); margin-left: 4px;" title="Deactivated: ${org.suspendReason || 'Unknown Reason'}">flag</i>`;
        } else {
            verifyBadge = '<i class="material-icons" style="color: var(--wrn); margin-left: 4px;" title="Pending Verification">hourglass_top</i>';
        }

        tr.innerHTML = `
            <td>
                <div class="org-cell">
                    <div>
                        <div class="table-title-text">${org.name} ${verifyBadge}</div>
                        <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 1px;">${org.slug}</div>
                        ${trialExpiryStr}
                    </div>
                </div>
            </td>
            <td><span class="badge ${badgeClass}">${org.status === 'SUSPENDED' ? 'DEACTIVATED' : org.status}</span></td>
            <td style="font-weight: 500;">${discountCol}</td>
            <td style="color: var(--text-secondary);">${org.email}</td>
            <td style="text-align: right;">
                <div class="action-btns" style="justify-content: flex-end; gap: 8px;">
                    <button class="action-btn-ghost" title="Profile" onclick="openOrgProfile(${index})"><i class="material-icons">badge</i> Profile</button>
                    <button class="action-btn-ghost" title="Edit" onclick="editOrganization(${index})"><i class="material-icons">edit</i> Edit</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openOrgProfile(index) {
    const org = organizations[index];
    document.getElementById('profile-org-name').textContent = org.name;
    document.getElementById('profile-org-slug').textContent = org.slug;
    document.getElementById('profile-org-email').textContent = org.email || 'N/A';
    document.getElementById('profile-org-status').textContent = org.status === 'SUSPENDED' ? 'DEACTIVATED' : org.status;
    document.getElementById('profile-org-discount').textContent = effectiveOrgDiscount(org) ? `${effectiveOrgDiscount(org)}%` : (org.discountEnabled ? '0%' : 'Off');
    showSection('org-details');
}

function populateDiscountSelect() {
    const select = document.getElementById('drawer-org-discount-offer');
    if (!select) return;
    select.innerHTML = '<option value="0">No Discount (Base Tier)</option>';
    const sorted = [...discountRules].sort((a,b) => a.percent - b.percent);
    sorted.forEach(d => {
        if (!d.enabled) return;
        select.innerHTML += `<option value="${d.percent}">${d.name} (${d.percent}% off)</option>`;
    });
}

// Sync the discount percentage input's enabled/dimmed state with the toggle.
function toggleOrgDiscountInput() {
    const on = document.getElementById('drawer-org-discount-enabled').checked;
    const input = document.getElementById('drawer-org-discount-pct');
    const hint = document.getElementById('drawer-org-discount-hint');
    if (input) {
        input.disabled = !on;
        input.style.opacity = on ? '1' : '0.5';
    }
    if (hint) {
        hint.textContent = on
            ? "Percentage applied to this organization's voucher purchases."
            : 'Discount disabled — the system ignores the percentage below.';
    }
}

function createOrganization() {
    currentEditOrgIndex = null;
    populateDiscountSelect();
    document.getElementById('drawer-org-firstname').value = "";
    document.getElementById('drawer-org-lastname').value = "";
    document.getElementById('drawer-org-displayname').value = "";
    document.getElementById('drawer-org-name').value = "";
    document.getElementById('drawer-org-domain').value = "";
    document.getElementById('drawer-org-email').value = "";
    document.getElementById('drawer-org-status').value = "PENDING";
    document.getElementById('drawer-org-verified').checked = false;

    // ADD flow: no email is collected here (the org confirms its own email via the
    // verification link), so the email association field is hidden.
    document.getElementById('drawer-org-email-group').style.display = 'none';

    // Discount Offer defaults: enabled, 0%.
    document.getElementById('drawer-org-discount-enabled').checked = true;
    document.getElementById('drawer-org-discount-pct').value = 0;
    toggleOrgDiscountInput();

    document.getElementById('drawer-suspend-info').style.display = 'none';
    document.getElementById('btn-reactivate-org').style.display = 'none';
    document.getElementById('btn-suspend-org').style.display = 'none';
    document.getElementById('btn-save-org').textContent = "Create Organization";

    // ADD flow: new orgs always start PENDING (set by magic-link verification),
    // so the Account Status selector and lifecycle actions are hidden here.
    document.getElementById('drawer-org-status-group').style.display = 'none';
    document.getElementById('editOrgTitleText').textContent = 'Add Organization';

    toggleDrawer('editOrgDrawer');
}

function editOrganization(index) {
    currentEditOrgIndex = index;
    populateDiscountSelect();
    const org = organizations[index];
    
    document.getElementById('drawer-org-firstname').value = org.firstName || '';
    document.getElementById('drawer-org-lastname').value = org.lastName || '';
    document.getElementById('drawer-org-displayname').value = org.displayName || org.name || '';
    document.getElementById('drawer-org-name').value = org.legalName || org.name || '';
    document.getElementById('drawer-org-domain').value = org.domain || '';
    document.getElementById('drawer-org-email').value = org.email || '';
    document.getElementById('drawer-org-status').value = org.status;
    document.getElementById('drawer-org-verified').checked = !!org.isVerified;

    // EDIT flow: the email association field is editable here.
    document.getElementById('drawer-org-email-group').style.display = '';

    // Discount Offer: master toggle + percentage.
    document.getElementById('drawer-org-discount-enabled').checked = !!org.discountEnabled;
    document.getElementById('drawer-org-discount-pct').value = org.customDiscount || 0;
    toggleOrgDiscountInput();

    const suspendInfo = document.getElementById('drawer-suspend-info');
    const suspendReasonText = document.getElementById('drawer-suspend-reason-text');
    const btnReactivate = document.getElementById('btn-reactivate-org');
    const btnSuspend = document.getElementById('btn-suspend-org');
    const btnSave = document.getElementById('btn-save-org');
    btnSave.textContent = "Save Changes";

    if (org.status === 'SUSPENDED') {
        suspendInfo.style.display = 'block';
        suspendReasonText.textContent = 'Reason: ' + (org.suspendReason || 'Unknown');
        btnReactivate.style.display = 'block';
        btnReactivate.textContent = 'Reactivate Account';
        btnReactivate.onclick = reactivateOrganization;
        btnSuspend.style.display = 'none';
    } else {
        suspendInfo.style.display = 'none';
        btnSuspend.style.display = 'block';
        
        if (org.status === 'TRIAL') {
            btnReactivate.style.display = 'block';
            btnReactivate.textContent = 'Send Renewal Email';
            btnReactivate.onclick = () => sendRenewalEmail(index);
        } else {
            btnReactivate.style.display = 'none';
        }
    }

    // EDIT flow: full account management — show the Account Status selector.
    document.getElementById('drawer-org-status-group').style.display = 'block';
    document.getElementById('editOrgTitleText').textContent = 'Edit Organization';

    toggleDrawer('editOrgDrawer');
}

function saveDrawerOrganization() {
    const firstName = document.getElementById('drawer-org-firstname').value;
    const lastName = document.getElementById('drawer-org-lastname').value;
    const displayName = document.getElementById('drawer-org-displayname').value;
    const legalName = document.getElementById('drawer-org-name').value;
    const domain = document.getElementById('drawer-org-domain').value;
    const email = document.getElementById('drawer-org-email').value;
    const status = document.getElementById('drawer-org-status').value;
    // Discount Offer: master toggle gates the percentage. When disabled the
    // percentage is preserved but ignored everywhere (see effectiveOrgDiscount).
    const discountEnabled = document.getElementById('drawer-org-discount-enabled').checked;
    const rawDiscount = parseInt(document.getElementById('drawer-org-discount-pct').value, 10);
    const discount = isNaN(rawDiscount) ? 0 : Math.max(0, Math.min(100, rawDiscount));
    const isVerified = document.getElementById('drawer-org-verified').checked;

    if (!legalName) { showToast("Legal Business Name is required", "error"); return; }
    const name = displayName || legalName;
    const isNew = currentEditOrgIndex === null;

    // Slug is no longer entered by hand: keep an existing org's slug, otherwise
    // auto-generate a handle from the organization name.
    const slug = (!isNew && organizations[currentEditOrgIndex].slug)
        ? organizations[currentEditOrgIndex].slug
        : '@' + (name || legalName).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24);

    const orgData = { name, legalName, displayName, firstName, lastName, domain, slug, email, status, isVerified, customDiscount: discount, discountEnabled, suspendReason: "" };

    if (isNew) {
        organizations.unshift(orgData);
        showToast("Organization created. A verification link will be sent once the org confirms its email.", "success");
    } else {
        const org = organizations[currentEditOrgIndex];
        org.name = orgData.name;
        org.legalName = orgData.legalName;
        org.displayName = orgData.displayName;
        org.firstName = orgData.firstName;
        org.lastName = orgData.lastName;
        org.domain = orgData.domain;
        org.slug = orgData.slug;
        org.email = orgData.email;
        org.status = orgData.status;
        org.isVerified = orgData.isVerified;
        org.customDiscount = orgData.customDiscount;
        org.discountEnabled = orgData.discountEnabled;
        showToast("Organization updated", "success");
    }
    saveOrganizations();
    renderOrganizations();
    updateOrgStats();
    toggleDrawer('editOrgDrawer');
}

function reactivateOrganization() {
    if (currentEditOrgIndex !== null) {
        organizations[currentEditOrgIndex].status = 'ACTIVE';
        organizations[currentEditOrgIndex].suspendReason = '';
        saveDrawerOrganization();
        showToast("Account successfully reactivated.", "success");
    }
}

function sendRenewalEmail(index) {
    if (index !== null) {
        const org = organizations[index];
        showToast("Renewal reminder email sent to " + org.email, "success");
        logEmail(org.name, 'Renewal Reminder', 'Reminder: Trial expiring soon, renew within 15 days');
        toggleDrawer('editOrgDrawer');
    }
}

// ─── SUSPEND ───────────────────────────────────────────────────
function triggerSuspendFromDrawer() {
    if (currentEditOrgIndex !== null) {
        orgToSuspend = currentEditOrgIndex;
        openModal('suspendOrgModal');
    }
}

function openSuspendModal(index) {
    orgToSuspend = index;
    openModal('suspendOrgModal');
}

function confirmSuspendOrg() {
    if (orgToSuspend !== null) {
        const reason = document.getElementById('suspendReason').value;
        organizations[orgToSuspend].status = 'SUSPENDED';
        organizations[orgToSuspend].suspendReason = reason;
        
        saveOrganizations();
        renderOrganizations();
        updateOrgStats();
        closeModal('suspendOrgModal');
        showToast("Organization deactivated. Vouchers invalidated, sessions terminated.", "success");
        
        // If drawer is open and looking at this org, re-render drawer
        if (currentEditOrgIndex === orgToSuspend) {
            editOrganization(currentEditOrgIndex);
        }
        orgToSuspend = null;
    }
}

// ─── VOUCHERS ──────────────────────────────────────────────────
function renderVouchers() {
    const tbody = document.getElementById('vouchers-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    vouchers.forEach((v, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="table-title-text">${v.cert}</td>
            <td style="font-weight: 600;">$ ${v.price.toLocaleString()}</td>
            <td style="text-align:right;">
                <div class="action-btns" style="justify-content:flex-end;">
                    <button class="action-btn" title="Edit" onclick="editVoucher(${i})"><i class="material-icons">edit</i></button>
                </div>
            </td>`;
        tbody.appendChild(tr);
    });
}

function renderDiscounts() {
    const container = document.getElementById('discount-ladder-container');
    if (!container) return;
    
    // Sort rules by percent
    const sorted = [...discountRules].sort((a,b) => a.percent - b.percent);
    
    let html = '<div class="pricing-ladder">';
    html += `
        <div class="ladder-step">
            <div class="ladder-icon" style="border-color:var(--text-tertiary); color:var(--text-tertiary);">0</div>
            <div class="ladder-content">
                <div class="ladder-condition">Base Tier (1 - 49 units)</div>
                <div class="ladder-discount" style="background:var(--bg); color:var(--text-secondary);">Full Price</div>
            </div>
        </div>
    `;
    
    sorted.forEach((d, i) => {
        if (!d.enabled) return;
        const conditionLabel = d.condition.startsWith('>') ? `Volume ${d.condition}` :
            d.condition === 'partnership' ? 'Partnership Agreement' :
            d.condition === 'renewal' ? 'Annual Renewal' : d.condition;
            
        html += `
            <div class="ladder-step">
                <div class="ladder-icon"><i class="material-icons">arrow_downward</i></div>
                <div class="ladder-content">
                    <div class="ladder-condition">${d.name} <span style="font-size:12px; font-weight:500; color:var(--text-tertiary); margin-left:8px;">(${conditionLabel})</span></div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div class="ladder-discount">${d.percent}% off</div>
                        <button class="action-btn" title="Edit" onclick="editDiscount(${discountRules.indexOf(d)})"><i class="material-icons">edit</i></button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    // Add custom rule button
    html += `
        <div style="margin-top:20px; padding-left:46px;">
            <button class="btn-secondary" onclick="openModal('addPackageModal')"><i class="material-icons">add</i> Add Pricing Tier</button>
        </div>
    `;
    container.innerHTML = html;
}

function switchVoucherTab(tabId) {
    currentVoucherTab = tabId;
    ['individual', 'discounts', 'codes'].forEach(id => {
        const btn = document.getElementById('tab-btn-' + id);
        if (btn) btn.classList.remove('active');
        const content = document.getElementById('tab-content-' + id);
        if (content) content.style.display = 'none';
    });
    const activeBtn = document.getElementById('tab-btn-' + tabId);
    if (activeBtn) activeBtn.classList.add('active');
    const content = document.getElementById('tab-content-' + tabId);
    if (content) content.style.display = '';

    // The Discount Codes tab has its own "Add Discount Code" button, so hide the header one.
    const addBtn = document.getElementById('main-add-voucher-btn');
    if (addBtn) addBtn.style.display = tabId === 'codes' ? 'none' : '';
    const btnText = document.getElementById('add-voucher-btn-text');
    if (btnText) btnText.textContent = tabId === 'individual' ? 'Add Voucher' : 'Add Discount Rule';

    if (tabId === 'codes') renderDiscountCodes();
}

// ─── DISCOUNT / COUPON CODES ───────────────────────────────────
let discountCodes = JSON.parse(localStorage.getItem('sdc_discount_codes') || 'null') || [
    { code: 'WELCOME10', discountPct: 10, validityType: 'one-time', active: true,
      usage: [ { org: 'Northwind Culinary', date: '2026-06-18', result: 'applied' } ] },
    { code: 'SUMMER25', discountPct: 25, validityType: 'range', startDate: '2026-06-01', endDate: '2026-08-31', active: true,
      usage: [ { org: 'Riverside College', date: '2026-06-20', result: 'applied' },
               { org: 'Acme Institute', date: '2026-06-21', result: 'failed', reason: 'Minimum order value not met' } ] },
    { code: 'EARLYBIRD', discountPct: 15, validityType: 'range', startDate: '2026-01-01', endDate: '2026-03-31', active: true,
      usage: [ { org: 'Beta Academy', date: '2026-04-02', result: 'failed', reason: 'Code expired' } ] }
];
let dcSelectedCode = null;

function saveDiscountCodes() { localStorage.setItem('sdc_discount_codes', JSON.stringify(discountCodes)); }

function dcFmtDate(d) {
    if (!d) return '';
    const p = d.split('-');
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return m[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10) + ', ' + p[0];
}

function dcStatus(c) {
    if (!c.active) return { label: 'Inactive', bg: 'rgba(120,120,120,.12)', fg: '#6b7280' };
    if (c.validityType === 'range' && c.endDate) {
        const today = new Date().toISOString().slice(0, 10);
        if (c.endDate < today) return { label: 'Expired', bg: 'rgba(120,120,120,.12)', fg: '#6b7280' };
        if (c.startDate && c.startDate > today) return { label: 'Scheduled', bg: 'rgba(0,99,155,.1)', fg: '#00639b' };
    }
    return { label: 'Active', bg: 'rgba(20,108,46,.12)', fg: 'var(--suc-text)' };
}

function renderDiscountCodes() {
    const tbody = document.getElementById('discount-codes-tbody');
    if (!tbody) return;
    if (discountCodes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-tertiary);">No discount codes yet. Click “Add Discount Code” to create one.</td></tr>';
        document.getElementById('discount-code-usage').innerHTML = '';
        return;
    }
    tbody.innerHTML = discountCodes.map((c, i) => {
        const st = dcStatus(c);
        const validity = c.validityType === 'one-time' ? 'One-time use' : (dcFmtDate(c.startDate) + ' – ' + dcFmtDate(c.endDate));
        const u = c.usage || [];
        const applied = u.filter(x => x.result === 'applied').length;
        const failed = u.filter(x => x.result === 'failed').length;
        const usesCell = u.length
            ? u.length + ' &middot; <span style="color:var(--suc-text);">' + applied + ' applied</span>' + (failed ? ' / <span style="color:var(--err-text);">' + failed + ' failed</span>' : '')
            : '<span style="color:var(--text-tertiary);">0</span>';
        return '<tr>' +
            '<td><span style="font-family:monospace; font-weight:700; background:var(--surface-bg); border:1px solid var(--border-color); padding:3px 8px; border-radius:6px;">' + c.code + '</span></td>' +
            '<td style="font-weight:600;">' + c.discountPct + '% off</td>' +
            '<td style="color:var(--text-secondary);">' + validity + '</td>' +
            '<td><span style="display:inline-block; padding:3px 10px; border-radius:9999px; font-size:12px; font-weight:700; background:' + st.bg + '; color:' + st.fg + ';">' + st.label + '</span></td>' +
            '<td>' + usesCell + '</td>' +
            '<td style="text-align:right; white-space:nowrap;">' +
                '<button class="action-btn-ghost" title="View usage" onclick="viewCodeUsage(' + i + ')"><i class="material-icons">receipt_long</i></button>' +
                '<button class="action-btn-ghost" title="' + (c.active ? 'Deactivate' : 'Activate') + '" onclick="toggleDiscountCode(' + i + ')"><i class="material-icons">' + (c.active ? 'toggle_on' : 'toggle_off') + '</i></button>' +
                '<button class="action-btn-ghost" title="Delete" onclick="deleteDiscountCode(' + i + ')"><i class="material-icons">delete</i></button>' +
            '</td></tr>';
    }).join('');
    if (dcSelectedCode != null && discountCodes[dcSelectedCode]) renderCodeUsage(dcSelectedCode);
    else document.getElementById('discount-code-usage').innerHTML = '';
}

function viewCodeUsage(i) {
    dcSelectedCode = i;
    renderCodeUsage(i);
    const box = document.getElementById('discount-code-usage');
    if (box) box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeCodeUsage() { dcSelectedCode = null; document.getElementById('discount-code-usage').innerHTML = ''; }

function renderCodeUsage(i) {
    const c = discountCodes[i];
    const box = document.getElementById('discount-code-usage');
    if (!c || !box) return;
    const th = 'text-align:left; padding:10px 18px; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--text-secondary); border-bottom:1px solid var(--border-light);';
    const rows = (c.usage || []).length ? c.usage.map(x => {
        const ok = x.result === 'applied';
        return '<tr>' +
            '<td style="padding:12px 18px; border-bottom:1px solid var(--border-light); font-weight:500;">' + x.org + '</td>' +
            '<td style="padding:12px 18px; border-bottom:1px solid var(--border-light); color:var(--text-secondary);">' + dcFmtDate(x.date) + '</td>' +
            '<td style="padding:12px 18px; border-bottom:1px solid var(--border-light);"><span style="display:inline-flex; align-items:center; gap:5px; padding:2px 10px; border-radius:9999px; font-size:12px; font-weight:700; background:' + (ok ? 'rgba(20,108,46,.12)' : 'rgba(179,38,30,.1)') + '; color:' + (ok ? 'var(--suc-text)' : 'var(--err-text)') + ';"><i class="material-icons" style="font-size:14px;">' + (ok ? 'check_circle' : 'cancel') + '</i>' + (ok ? 'Applied' : 'Failed') + '</span></td>' +
            '<td style="padding:12px 18px; border-bottom:1px solid var(--border-light); color:var(--text-tertiary); font-size:13px;">' + (x.reason || (ok ? 'Successfully redeemed' : '')) + '</td>' +
        '</tr>';
    }).join('') : '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-tertiary);">No redemptions yet for this code.</td></tr>';
    box.innerHTML =
        '<div style="border:1px solid var(--border-color); border-radius:12px; overflow:hidden;">' +
            '<div style="padding:14px 18px; background:var(--surface-bg); border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">' +
                '<h4 style="font-size:14px; font-weight:600;">Usage Log — <span style="font-family:monospace;">' + c.code + '</span></h4>' +
                '<button class="action-btn-ghost" title="Close" onclick="closeCodeUsage()"><i class="material-icons">close</i></button>' +
            '</div>' +
            '<table style="width:100%; border-collapse:collapse;"><thead><tr>' +
                '<th style="' + th + '">Organization</th><th style="' + th + '">Date</th><th style="' + th + '">Result</th><th style="' + th + '">Note</th>' +
            '</tr></thead><tbody>' + rows + '</tbody></table>' +
        '</div>';
}

function toggleDiscountCode(i) { discountCodes[i].active = !discountCodes[i].active; saveDiscountCodes(); renderDiscountCodes(); }
function deleteDiscountCode(i) {
    if (!confirm('Delete code "' + discountCodes[i].code + '"?')) return;
    discountCodes.splice(i, 1);
    if (dcSelectedCode === i) dcSelectedCode = null;
    saveDiscountCodes();
    renderDiscountCodes();
}

function openAddDiscountCode() {
    document.getElementById('dc-code').value = '';
    document.getElementById('dc-discount').value = '10';
    const oneTime = document.querySelector('input[name="dc-validity"][value="one-time"]');
    if (oneTime) oneTime.checked = true;
    document.getElementById('dc-start').value = '';
    document.getElementById('dc-end').value = '';
    document.getElementById('dc-error').style.display = 'none';
    toggleDcValidity();
    document.getElementById('discountCodeModal').style.display = 'flex';
}
function closeDiscountCodeModal() { document.getElementById('discountCodeModal').style.display = 'none'; }
function toggleDcValidity() {
    const isRange = document.querySelector('input[name="dc-validity"]:checked').value === 'range';
    document.getElementById('dc-date-range').style.display = isRange ? 'flex' : 'none';
}
function saveDiscountCode() {
    const code = document.getElementById('dc-code').value.trim().toUpperCase();
    const pct = parseInt(document.getElementById('dc-discount').value, 10);
    const validityType = document.querySelector('input[name="dc-validity"]:checked').value;
    const err = document.getElementById('dc-error');
    const fail = (m) => { err.textContent = m; err.style.display = 'block'; };
    if (!code) return fail('Enter a coupon code.');
    if (discountCodes.some(c => c.code === code)) return fail('That code already exists.');
    if (!(pct >= 1 && pct <= 100)) return fail('Discount must be between 1 and 100%.');
    const entry = { code, discountPct: pct, validityType, active: true, usage: [] };
    if (validityType === 'range') {
        const s = document.getElementById('dc-start').value, e = document.getElementById('dc-end').value;
        if (!s || !e) return fail('Select both a start and end date.');
        if (e < s) return fail('End date must be after the start date.');
        entry.startDate = s; entry.endDate = e;
    }
    discountCodes.push(entry);
    saveDiscountCodes();
    renderDiscountCodes();
    closeDiscountCodeModal();
    if (typeof showToast === 'function') showToast('Discount code "' + code + '" created', 'success');
}

// Legacy shim: the three sub-tabs were merged into one unified Purchase
// Requests table. Any remaining caller just re-renders that table.
function switchVoucherManagementTab(tabId) {
    currentVoucherManagementTab = tabId;
    renderPurchaseRequests();
}

function openActiveVoucherModal() {
    if (currentVoucherTab === 'individual') {
        const select = document.getElementById('voucherCert');
        select.innerHTML = '<option value="">Select a Certification...</option>';
        credentials.forEach(c => {
            select.innerHTML += `<option value="${c.cert}">${c.cert}</option>`;
        });
        document.getElementById('voucherIndex').value = '';
        document.getElementById('addVoucherForm').reset();
        document.getElementById('btn-delete-voucher').style.display = 'none';
        document.querySelector('#addVoucherModal .modal-title').textContent = 'Add Voucher';
        openModal('addVoucherModal');
    } else {
        document.getElementById('discountIndex').value = '';
        document.getElementById('addPackageForm').reset();
        document.getElementById('btn-delete-package').style.display = 'none';
        document.querySelector('#addPackageModal .modal-title').textContent = 'Add Discount Rule';
        openModal('addPackageModal');
    }
}

function editVoucher(i) {
    const v = vouchers[i];
    const select = document.getElementById('voucherCert');
    select.innerHTML = '<option value="">Select a Certification...</option>';
    credentials.forEach(c => {
        select.innerHTML += `<option value="${c.cert}">${c.cert}</option>`;
    });
    select.value = v.cert;
    document.getElementById('voucherPrice').value = v.price;
    document.getElementById('voucherIndex').value = i;
    
    document.querySelector('#addVoucherModal .modal-title').textContent = 'Edit Voucher';
    document.getElementById('btn-delete-voucher').style.display = 'inline-block';
    openModal('addVoucherModal');
}

function handleAddVoucher(e) {
    e.preventDefault();
    const idx = document.getElementById('voucherIndex').value;
    const v = { cert: document.getElementById('voucherCert').value, price: parseInt(document.getElementById('voucherPrice').value) };
    if (idx === '') {
        vouchers.unshift(v);
        showToast("Voucher added", "success");
    } else {
        vouchers[idx] = v;
        showToast("Voucher updated", "success");
    }
    renderVouchers();
    closeModal('addVoucherModal');
    logEmail('System', 'Config Update', 'Voucher catalog updated');
}

function editDiscount(i) {
    const d = discountRules[i];
    document.getElementById('discountName').value = d.name;
    document.getElementById('discountCondition').value = d.condition;
    document.getElementById('discountPercent').value = d.percent;
    document.getElementById('discountIndex').value = i;
    
    document.querySelector('#addPackageModal .modal-title').textContent = 'Edit Discount Rule';
    document.getElementById('btn-delete-package').style.display = 'inline-block';
    openModal('addPackageModal');
}

function handleAddDiscount(e) {
    e.preventDefault();
    const idx = document.getElementById('discountIndex').value;
    const d = {
        name: document.getElementById('discountName').value,
        condition: document.getElementById('discountCondition').value,
        percent: parseInt(document.getElementById('discountPercent').value),
        enabled: true
    };
    if (idx === '') {
        discountRules.unshift(d);
        showToast("Discount rule added", "success");
    } else {
        d.enabled = discountRules[idx].enabled;
        discountRules[idx] = d;
        showToast("Discount rule updated", "success");
    }
    renderDiscounts();
    closeModal('addPackageModal');
}

function toggleDiscount(i) {
    discountRules[i].enabled = !discountRules[i].enabled;
    renderDiscounts();
    showToast(`Discount rule ${discountRules[i].enabled ? 'enabled' : 'disabled'}`, 'success');
}


// ─── PURCHASE REQUESTS (unified: Application + Website) ─────────
// One table merges the three source queues into a normalized view with a
// Source column, an Action-Required-first default, search, and inline quick
// actions (Approve / Request Clarification / Reject). "Application" = requests
// raised inside the SDC app (org voucher buys + online-class buys); "Website" =
// public B2C checkout. Rows key off (kind, source-array index) so actions stay
// stable even though the seed data has no ids.
let purchaseView = 'action'; // 'action' (default) | 'all'
let clarifyTarget = null;
let prPage = 1;                // current page in the Purchase Requests table
const PR_PAGE_SIZE = 8;        // rows shown per page

function prUnitPrice(certName) {
    const v = vouchers.find(x => x.cert && certName && x.cert.toLowerCase().includes(certName.toLowerCase().split(' ')[0]));
    return v ? v.price : 140;
}

function prDiscountPctFor(req) {
    // Org discount (gated by its master toggle) takes precedence; otherwise fall
    // back to an enabled volume rule.
    const org = organizations.find(o => o.name === req.organization);
    const orgPct = effectiveOrgDiscount(org);
    if (orgPct) return orgPct;
    const rule = discountRules.find(d => d.enabled && d.condition.startsWith('>') && req.qty > parseInt(d.condition.replace('>', '').split(' ')[0]));
    return rule ? rule.percent : 0;
}

// Normalize all three source arrays into one list of display rows.
function buildPurchaseRequests() {
    const rows = [];
    voucherRequests.forEach((r, idx) => {
        const base = r.qty * 140;
        const pct = prDiscountPctFor(r);
        rows.push({
            kind: 'proc', idx, source: 'Application',
            requester: r.organization, details: r.details, qty: r.qty,
            payment: r.mode || '—', cost: base * (1 - pct / 100),
            date: r.date || '', status: r.status, approvable: true,
            clarificationSent: !!r.clarificationSent
        });
    });
    onlineRequests.forEach((r, idx) => {
        rows.push({
            kind: 'online', idx, source: 'Application',
            requester: r.organization, details: r.classTitle, qty: r.students,
            payment: r.mode || '—', cost: r.totalCost,
            date: r.date || '', status: r.status, approvable: true,
            clarificationSent: !!r.clarificationSent
        });
    });
    websitePurchases.forEach((r, idx) => {
        rows.push({
            kind: 'web', idx, source: 'Website',
            requester: r.email, details: r.cert, qty: r.qty,
            payment: 'Credit Card', cost: r.qty * prUnitPrice(r.cert),
            date: r.date || '', status: r.status, approvable: false,
            clarificationSent: false
        });
    });
    return rows;
}

function prStatusBadge(status) {
    if (status === 'PENDING') return '<span class="badge badge-pending">PENDING</span>';
    if (status === 'APPROVED') return '<span class="badge badge-active">APPROVED</span>';
    if (status === 'REJECTED') return '<span class="badge" style="background:rgba(179,38,30,.1);color:var(--err-text);">REJECTED</span>';
    if (status === 'PAID') return '<span class="badge" style="background:#dbeafe;color:#1e40af;">PAID</span>';
    if (status === 'PROCESSING') return '<span class="badge badge-pending">PROCESSING</span>';
    if (status === 'PO SENT') return '<span class="badge badge-verification">PO SENT</span>';
    return `<span class="badge badge-active">${status}</span>`;
}

function setPurchaseView(view) {
    purchaseView = view;
    prPage = 1;
    document.getElementById('pr-seg-action').classList.toggle('active', view === 'action');
    document.getElementById('pr-seg-all').classList.toggle('active', view === 'all');
    renderPurchaseRequests();
}

// Reset to the first page whenever filters/search change, then re-render.
function prFilterChanged() {
    prPage = 1;
    renderPurchaseRequests();
}

function prGoToPage(p) {
    prPage = p;
    renderPurchaseRequests();
}

function renderPurchaseRequests() {
    const tbody = document.getElementById('requests-tbody');
    if (!tbody) return;

    const q = (document.getElementById('prSearchInput')?.value || '').toLowerCase().trim();
    const srcF = document.getElementById('prSourceFilter')?.value || 'ALL';
    const statF = document.getElementById('prStatusFilter')?.value || 'ALL';

    let rows = buildPurchaseRequests();

    // Smart classification: an "Action Required" row is an approvable request
    // still PENDING. That is the default view.
    const isAction = r => r.approvable && r.status === 'PENDING';
    if (purchaseView === 'action') rows = rows.filter(isAction);

    if (srcF !== 'ALL') rows = rows.filter(r => r.source === srcF);
    if (statF === 'RESOLVED') rows = rows.filter(r => r.status === 'PAID' || r.status === 'PROCESSING');
    else if (statF !== 'ALL') rows = rows.filter(r => r.status === statF);

    if (q) {
        rows = rows.filter(r => {
            const hay = [r.requester, r.details, r.payment, r.source, r.status, r.date,
                         '$' + Math.round(r.cost).toLocaleString(), Math.round(r.cost)].join(' ').toLowerCase();
            return hay.includes(q);
        });
    }

    // Action-required first, then the rest.
    rows.sort((a, b) => (isAction(b) ? 1 : 0) - (isAction(a) ? 1 : 0));

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:48px;color:var(--text-tertiary);"><i class="material-icons" style="font-size:40px;opacity:.4;display:block;margin-bottom:8px;">inbox</i>${purchaseView === 'action' ? "No requests need action — you're all caught up." : 'No requests match these filters.'}</td></tr>`;
        const t0 = document.getElementById('requests-total');
        if (t0) t0.textContent = '0 items';
        renderPurchasePagination(0, 0, 0);
        return;
    }

    // Pagination: clamp the current page and slice the visible rows.
    const totalRows = rows.length;
    const pageCount = Math.max(1, Math.ceil(totalRows / PR_PAGE_SIZE));
    if (prPage > pageCount) prPage = pageCount;
    if (prPage < 1) prPage = 1;
    const start = (prPage - 1) * PR_PAGE_SIZE;
    const pageRows = rows.slice(start, start + PR_PAGE_SIZE);

    tbody.innerHTML = pageRows.map(r => {
        const action = isAction(r);
        const srcPill = `<span class="src-pill ${r.source === 'Website' ? 'src-web' : 'src-app'}">${r.source}</span>`;
        const clarifyTag = r.clarificationSent
            ? '<div style="font-size:11px;color:var(--wrn);margin-top:3px;"><i class="material-icons" style="font-size:12px;vertical-align:middle;">schedule_send</i> Clarification sent</div>' : '';

        let actionsCell;
        if (action) {
            // Section 6: inline one-click Approve / Request Clarification / Reject.
            actionsCell = `<div class="pr-qa">
                <button class="pr-icon-btn pr-approve" title="Approve & send approval email" onclick="prApprove('${r.kind}',${r.idx})"><i class="material-icons">check</i></button>
                <button class="pr-icon-btn pr-clarify" title="Request clarification" onclick="prClarify('${r.kind}',${r.idx})"><i class="material-symbols-outlined">unknown_document</i></button>
                <button class="pr-icon-btn pr-reject" title="Reject request" onclick="prReject('${r.kind}',${r.idx})"><i class="material-icons">close</i></button>
            </div>`;
        } else {
            // Resolved (approved/rejected/paid/processing) → single View Details icon.
            actionsCell = `<div class="pr-qa"><button class="pr-icon-btn" title="View details" onclick="prViewDetails('${r.kind}',${r.idx})"><i class="material-icons">visibility</i></button></div>`;
        }

        return `<tr class="${action ? 'pr-action-row' : ''}">
            <td class="table-title-text">${r.requester}${clarifyTag}</td>
            <td>${srcPill}</td>
            <td style="color:var(--text-secondary);">${r.details}</td>
            <td style="font-weight:600;">${r.qty}</td>
            <td style="color:var(--text-secondary);">${r.payment}</td>
            <td style="font-weight:600;">$${Math.round(r.cost).toLocaleString()}</td>
            <td>${prStatusBadge(r.status)}</td>
            <td style="text-align:right;">${actionsCell}</td>
        </tr>`;
    }).join('');

    const total = document.getElementById('requests-total');
    if (total) {
        const from = start + 1;
        const to = start + pageRows.length;
        total.textContent = `Showing ${from}–${to} of ${totalRows} item${totalRows === 1 ? '' : 's'}`;
    }
    renderPurchasePagination(prPage, pageCount, totalRows);
}

// Build the numbered prev/next pager beneath the requests table.
function renderPurchasePagination(page, pageCount, totalRows) {
    const el = document.getElementById('requests-pagination');
    if (!el) return;
    if (totalRows === 0 || pageCount <= 1) { el.innerHTML = ''; return; }

    // Compact page window: first, last, current ±1, with ellipses.
    const pages = [];
    for (let p = 1; p <= pageCount; p++) {
        if (p === 1 || p === pageCount || (p >= page - 1 && p <= page + 1)) pages.push(p);
        else if (pages[pages.length - 1] !== '…') pages.push('…');
    }

    const btn = (label, target, opts = {}) => {
        const cls = ['pr-page-btn'];
        if (opts.active) cls.push('active');
        const disabled = opts.disabled ? 'disabled' : '';
        const onclick = opts.disabled ? '' : `onclick="prGoToPage(${target})"`;
        return `<button class="${cls.join(' ')}" ${disabled} ${onclick}>${label}</button>`;
    };

    let html = btn('<i class="material-icons">chevron_left</i>', page - 1, { disabled: page <= 1 });
    pages.forEach(p => {
        html += (p === '…')
            ? '<span class="pr-page-ellipsis">…</span>'
            : btn(p, p, { active: p === page });
    });
    html += btn('<i class="material-icons">chevron_right</i>', page + 1, { disabled: page >= pageCount });
    el.innerHTML = html;
}

// Backward-compat alias: older callers (approve/reject in Action Required,
// cross-tab storage sync) still call renderVoucherRequests().
function renderVoucherRequests() { renderPurchaseRequests(); }

// ─── PURCHASE REQUEST QUICK ACTIONS (Section 6) ────────────────
function prGetReq(kind, idx) {
    if (kind === 'proc') return voucherRequests[idx];
    if (kind === 'online') return onlineRequests[idx];
    if (kind === 'web') return websitePurchases[idx];
    if (kind === 'org') return organizations[idx];
    return null;
}
function prRecipient(req, kind) {
    if (kind === 'web') return req.email;
    if (kind === 'org') return req.email || req.name;
    const org = organizations.find(o => o.name === req.organization);
    return (org && org.email) ? org.email : req.organization;
}
function prSaveKind(kind) {
    if (kind === 'proc') saveVoucherRequests(voucherRequests);
    else if (kind === 'online') saveOnlineRequests();
    else if (kind === 'web') saveWebsitePurchases();
    else if (kind === 'org') saveOrganizations();
}
function prRefresh() {
    renderPurchaseRequests();
    updateAlertTicker();
    updateVoucherMetrics();
    renderActionRequired();
}

function prApprove(kind, idx) {
    const req = prGetReq(kind, idx);
    if (!req) return;
    req.status = 'APPROVED';
    prSaveKind(kind);
    const what = kind === 'online' ? `${req.students} seats for ${req.classTitle}` : `${req.qty} × ${req.details}`;
    logEmail(prRecipient(req, kind), 'Approval', `Your voucher purchase request was approved (${what}).`);
    showToast('Request approved — approval email sent.', 'success');
    prRefresh();
}

function prReject(kind, idx) {
    const req = prGetReq(kind, idx);
    if (!req) return;
    if (!confirm('Reject this request? The requester will be notified by email.')) return;
    req.status = 'REJECTED';
    prSaveKind(kind);
    logEmail(prRecipient(req, kind), 'Rejection', 'Your voucher purchase request was declined.');
    showToast('Request rejected — notification email sent.', 'success');
    prRefresh();
}

function prClarify(kind, idx) {
    const req = prGetReq(kind, idx);
    if (!req) return;
    clarifyTarget = { kind, idx };
    document.getElementById('clarify-recipient').textContent = prRecipient(req, kind);
    document.getElementById('clarify-notes').value = '';
    openModal('clarificationModal');
}

function confirmClarification() {
    if (!clarifyTarget) return;
    const notes = document.getElementById('clarify-notes').value.trim();
    if (!notes) { showToast('Please enter what needs clarification.', 'error'); return; }
    const req = prGetReq(clarifyTarget.kind, clarifyTarget.idx);
    if (req) {
        req.clarificationSent = true;
        prSaveKind(clarifyTarget.kind);
        logEmail(prRecipient(req, clarifyTarget.kind), 'Clarification Needed', `Clarification needed: ${notes}`);
        showToast('Clarification email sent.', 'success');
    }
    closeModal('clarificationModal');
    clarifyTarget = null;
    prRefresh();
}

function prViewDetails(kind, idx) {
    const req = prGetReq(kind, idx);
    if (!req) return;
    const rows = buildPurchaseRequests();
    const row = rows.find(r => r.kind === kind && r.idx === idx);
    if (!row) return;
    const line = (label, val) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-light);font-size:14px;"><span style="color:var(--text-tertiary);">${label}</span><span style="font-weight:600;text-align:right;">${val}</span></div>`;
    document.getElementById('request-detail-body').innerHTML =
        line('Requester', row.requester) +
        line('Source', row.source) +
        line('Details', row.details) +
        line('Quantity', row.qty) +
        line('Payment', row.payment) +
        line('Cost', '$' + Math.round(row.cost).toLocaleString()) +
        (row.date ? line('Date', row.date) : '') +
        line('Status', row.status) +
        `<div style="margin-top:20px;text-align:right;"><button class="btn-secondary" onclick="closeModal('requestDetailModal')">Close</button></div>`;
    openModal('requestDetailModal');
}

function handleGeneratePO(id) {
    const idx = voucherRequests.findIndex(r => r.id == id);
    if (idx > -1) {
        voucherRequests[idx].status = 'PO SENT';
        saveVoucherRequests(voucherRequests);
        renderVoucherRequests();
        updateAlertTicker();
        updateVoucherMetrics();
        showToast("[AI Verified] Quote approved — invoice emailed to client.", "success");
        logEmail(voucherRequests[idx].organization, 'Quote', `Approved quote for ${voucherRequests[idx].qty} vouchers`);
    }
}

function handleApproveRequest(id) {
    const idx = voucherRequests.findIndex(r => r.id == id);
    if (idx > -1 && confirm("Assign vouchers to " + voucherRequests[idx].organization + "?")) {
        voucherRequests[idx].status = 'APPROVED';
        saveVoucherRequests(voucherRequests);
        renderVoucherRequests();
        updateVoucherMetrics();
        showToast("Vouchers assigned to organization inventory.", "success");
        logEmail(voucherRequests[idx].organization, 'Allocation', `${voucherRequests[idx].qty} vouchers assigned`);
    }
}

// Cross-tab sync
window.addEventListener('storage', function(e) {
    if (e.key === 'sdc_voucher_requests') {
        voucherRequests = JSON.parse(e.newValue);
        renderPurchaseRequests();
        updateAlertTicker();
    } else if (e.key === 'sdc_online_service_requests') {
        onlineRequests = JSON.parse(e.newValue);
        renderPurchaseRequests();
    } else if (e.key === 'sdc_website_purchases') {
        websitePurchases = JSON.parse(e.newValue);
        renderPurchaseRequests();
    } else if (e.key === 'sdc_ownership_transfers') {
        renderTransfersQueue();
    }
});

// ─── ONLINE SERVICE REQUESTS ──────────────────────────────────
function renderOnlineRequests() {
    const tbody = document.getElementById('online-requests-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    onlineRequests.forEach(req => {
        const tr = document.createElement('tr');
        let statusBadge = '';
        if (req.status === 'PENDING') statusBadge = '<span class="badge badge-pending">PENDING</span>';
        else if (req.status === 'APPROVED') statusBadge = '<span class="badge badge-active">APPROVED</span>';
        else statusBadge = `<span class="badge">${req.status}</span>`;

        let actionBtn = '';
        if (req.status === 'PENDING') {
            actionBtn = `<button class="btn-approve" onclick="openSmartApproval('online', '${req.id}')">Review & Approve</button>`;
        } else {
            actionBtn = `<span style="color:var(--suc-text); font-size:12px; font-weight:600;"><i class="material-icons">check</i> Done</span>`;
        }

        tr.innerHTML = `
            <td class="table-title-text">${req.organization}</td>
            <td style="color:var(--text-secondary);">${req.classTitle}</td>
            <td style="font-weight:600;">${req.students}</td>
            <td style="font-weight:600;">$${req.totalCost.toLocaleString()}</td>
            <td style="color:var(--text-secondary);">${req.mode}</td>
            <td>${statusBadge}</td>
            <td style="text-align:right;">${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
    const total = document.getElementById('online-requests-total');
    if (total) total.textContent = `${onlineRequests.length} items`;
}

function approveOnlineRequest(id) {
    const idx = onlineRequests.findIndex(r => r.id == id);
    if (idx > -1) {
        onlineRequests[idx].status = 'APPROVED';
        localStorage.setItem('sdc_online_service_requests', JSON.stringify(onlineRequests));
        renderOnlineRequests();
        showToast('Application request approved. Vouchers assigned.', 'success');
        logEmail(onlineRequests[idx].organization, 'Allocation', `${onlineRequests[idx].students} online service vouchers assigned for ${onlineRequests[idx].classTitle}`);
        updateVoucherMetrics();
    }
}

// ─── WEBSITE PURCHASES ────────────────────────────────────────
function renderWebsitePurchases() {
    const tbody = document.getElementById('website-purchases-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    websitePurchases.forEach(p => {
        const tr = document.createElement('tr');
        let statusBadge = '';
        if (p.status === 'PAID') statusBadge = '<span class="badge" style="background:#dbeafe;color:#1e40af;">PAID</span>';
        else if (p.status === 'PROCESSING') statusBadge = '<span class="badge badge-pending">PROCESSING</span>';
        else statusBadge = `<span class="badge badge-active">${p.status}</span>`;

        tr.innerHTML = `
            <td style="color:var(--text-secondary);">${p.email}</td>
            <td class="table-title-text">${p.cert}</td>
            <td style="font-weight:600;">${p.qty}</td>
            <td style="color:var(--text-secondary);">${p.date}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ─── CREDENTIALS ───────────────────────────────────────────────
function renderCredentials() {
    const tbody = document.getElementById('credentials-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    credentials.forEach((c, i) => {
        const tr = document.createElement('tr');
        const statusHtml = c.enabled
            ? `<span style="color:var(--suc-text); font-size:12px; font-weight:600;"><i class="material-icons">toggle_on</i> Active</span>`
            : `<span style="color:var(--text-tertiary); font-size:12px;"><i class="material-icons">toggle_off</i> Disabled</span>`;

        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:10px; height:10px; border-radius:3px; background:${c.badge};"></div>
                    <div>
                        <div class="table-title-text">${c.cert}</div>
                        <div style="font-size:11px; color:var(--text-tertiary);">${c.category}</div>
                    </div>
                </div>
            </td>
            <td style="font-weight:600;">${c.code}</td>
            <td>${c.provider}</td>
            <td>${c.validity}</td>
            <td>${statusHtml}</td>
            <td style="text-align:right;">
                <div class="action-btns" style="justify-content:flex-end;">
                    <button class="action-btn" title="Edit" onclick="openCredentialModal(${i})"><i class="material-icons">edit</i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function initiateDelete(type) {
    pendingDeleteType = type;
    if (type === 'voucher') {
        pendingDeleteIndex = document.getElementById('voucherIndex').value;
    } else if (type === 'discount') {
        pendingDeleteIndex = document.getElementById('discountIndex').value;
    } else if (type === 'credential') {
        pendingDeleteIndex = document.getElementById('credIndex').value;
    }
    document.getElementById('deleteReasonInput').value = '';
    openModal('deleteReasonModal');
}

function confirmDeleteWithReason() {
    const reason = document.getElementById('deleteReasonInput').value.trim();
    if (!reason) {
        showToast('A reason is required to delete.', 'error');
        return;
    }
    
    if (pendingDeleteType === 'voucher') {
        vouchers.splice(pendingDeleteIndex, 1);
        renderVouchers();
        closeModal('addVoucherModal');
        showToast("Voucher deleted", "success");
    } else if (pendingDeleteType === 'discount') {
        discountRules.splice(pendingDeleteIndex, 1);
        renderDiscounts();
        closeModal('addPackageModal');
        showToast("Discount rule deleted", "success");
    } else if (pendingDeleteType === 'credential') {
        credentials.splice(pendingDeleteIndex, 1);
        renderCredentials();
        closeModal('credentialModal');
        showToast("Exam Assessment Management deleted", "success");
    } else if (pendingDeleteType === 'organization') {
        organizations.splice(pendingDeleteIndex, 1);
        saveOrganizations();
        renderOrganizations();
        renderActionRequired();
        closeDrawer();
        showToast("Organization Application deleted", "success");
    }
    closeModal('deleteReasonModal');
    logEmail('System', 'Config Update', `Item deleted (${pendingDeleteType}). Reason: ${reason}`);
}

function openCredentialModal(index = null) {
    openModal('credentialModal');
    const form = document.getElementById('credentialForm');
    if (index !== null && index !== '') {
        const c = credentials[index];
        document.getElementById('credIndex').value = index;
        document.getElementById('credName').value = c.cert;
        document.getElementById('credCode').value = c.code;
        document.getElementById('credExamCode').value = c.examCode;
        document.getElementById('credTestId').value = c.testId || '';
        document.getElementById('credProvider').value = c.provider;
        document.getElementById('credValidity').value = parseInt(c.validity);
        document.getElementById('credCategory').value = c.category;
        document.getElementById('credDescription').value = c.desc;
        document.getElementById('credScore').value = c.score;
        document.getElementById('credCeu').value = c.ceu;
        document.getElementById('credRenewal').value = c.renewal;
        const toggle = document.getElementById('credEnabledToggle');
        toggle.classList.toggle('enabled', c.enabled);
        document.querySelectorAll('#credentialModal .color-swatch').forEach(btn => {
            btn.classList.remove('active');
            if (rgb2hex(btn.style.backgroundColor) === c.badge.toLowerCase()) btn.classList.add('active');
        });
        document.querySelector('#credentialModal .modal-title').textContent = 'Edit Exam Assessment Management';
        document.getElementById('btn-delete-credential').style.display = 'inline-block';
    } else {
        form.reset();
        document.getElementById('credIndex').value = '';
        document.getElementById('credEnabledToggle').classList.add('enabled');
        document.querySelectorAll('#credentialModal .color-swatch').forEach(b => b.classList.remove('active'));
        document.querySelector('#credentialModal .color-swatch:first-child').classList.add('active');
        document.querySelector('#credentialModal .modal-title').textContent = 'Add Exam Assessment Management';
        document.getElementById('btn-delete-credential').style.display = 'none';
    }
}

function handleSaveCredential(e) {
    e.preventDefault();
    const index = document.getElementById('credIndex').value;
    let activeColor = '#1f2937';
    const activeBtn = document.querySelector('#credentialModal .color-swatch.active');
    if (activeBtn) activeColor = rgb2hex(activeBtn.style.backgroundColor);

    const cred = {
        cert: document.getElementById('credName').value,
        code: document.getElementById('credCode').value,
        examCode: document.getElementById('credExamCode').value,
        testId: document.getElementById('credTestId').value,
        provider: document.getElementById('credProvider').value,
        validity: document.getElementById('credValidity').value + ' months',
        category: document.getElementById('credCategory').value,
        desc: document.getElementById('credDescription').value,
        score: parseInt(document.getElementById('credScore').value),
        ceu: parseInt(document.getElementById('credCeu').value || 0),
        renewal: document.getElementById('credRenewal').value,
        enabled: document.getElementById('credEnabledToggle').classList.contains('enabled'),
        badge: activeColor
    };

    if (index !== '') { credentials[index] = cred; showToast("Credential updated", "success"); }
    else { credentials.push(cred); showToast("Credential added", "success"); }
    renderCredentials();
    closeModal('credentialModal');
}

// ─── EMAIL AUDIT LOG ───────────────────────────────────────────
// Persisted so reminder history (and the reminder engine's "already sent"
// state) survives reloads; falls back to the in-memory seed on first run.
function loadEmailLog() {
    try {
        const stored = localStorage.getItem('sdc_email_log');
        if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    return [...emailLog];
}
const emailLogEntries = loadEmailLog();
function saveEmailLog() { localStorage.setItem('sdc_email_log', JSON.stringify(emailLogEntries)); }

function logEmail(recipient, type, subject) {
    const now = new Date();
    const ts = now.toISOString().slice(0, 16).replace('T', ' ');
    emailLogEntries.unshift({ timestamp: ts, type, recipient, subject, status: 'Delivered' });
    saveEmailLog();
    renderEmailLog();
}

function renderEmailLog() {
    const tbody = document.getElementById('email-log-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (emailLogEntries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:48px;color:var(--text-tertiary);"><i class="material-icons" style="font-size:40px;opacity:.4;display:block;margin-bottom:8px;">mail_outline</i>No automated emails sent yet. Outbound communications will appear here.</td></tr>';
        const sentEl0 = document.getElementById('email-sent-count');
        const chaserEl0 = document.getElementById('email-chaser-count');
        const failedEl0 = document.getElementById('email-failed-count');
        if (sentEl0) sentEl0.textContent = 0;
        if (chaserEl0) chaserEl0.textContent = 0;
        if (failedEl0) failedEl0.textContent = 0;
        return;
    }

    emailLogEntries.forEach(e => {
        const tr = document.createElement('tr');
        let typeColor = 'var(--text-secondary)';
        let typeIcon = 'mail';
        if (e.type === 'Auto-Chaser') { typeColor = '#d97706'; typeIcon = 'history'; }
        else if (e.type === 'Payment Reminder') { typeColor = '#d97706'; typeIcon = 'schedule'; }
        else if (e.type === 'Verification') { typeColor = '#7c3aed'; typeIcon = 'shield'; }
        else if (e.type === 'Invoice' || e.type === 'Quote') { typeColor = '#2563eb'; typeIcon = 'receipt_long'; }
        else if (e.type === 'Suspension') { typeColor = 'var(--err-text)'; typeIcon = 'block'; }
        else if (e.type === 'Allocation') { typeColor = 'var(--suc-text)'; typeIcon = 'confirmation_number'; }
        else if (e.type === 'Welcome') { typeColor = 'var(--suc-text)'; typeIcon = 'waving_hand'; }

        const statusHtml = e.status === 'Delivered'
            ? '<span style="color:var(--suc-text); font-size:12px; font-weight:600;"><i class="material-icons" style="font-size:14px; vertical-align:middle;">check_circle</i> Delivered</span>'
            : '<span style="color:var(--err-text); font-size:12px; font-weight:600;"><i class="material-icons" style="font-size:14px; vertical-align:middle;">cancel</i> Bounced</span>';

        tr.innerHTML = `
            <td style="color:var(--text-tertiary); font-size:12px; white-space:nowrap;">${e.timestamp}</td>
            <td><span style="color:${typeColor}; font-weight:600; font-size:12px;"><i class="material-icons" style="font-size:14px; vertical-align:middle;">${typeIcon}</i> ${e.type}</span></td>
            <td style="color:var(--text-secondary); font-size:13px;">${e.recipient}</td>
            <td style="font-size:13px;">${e.subject}</td>
            <td>${statusHtml}</td>
        `;
        tbody.appendChild(tr);
    });

    // Update stats
    const sentEl = document.getElementById('email-sent-count');
    const chaserEl = document.getElementById('email-chaser-count');
    const failedEl = document.getElementById('email-failed-count');
    if (sentEl) sentEl.textContent = emailLogEntries.filter(e => e.status === 'Delivered').length;
    if (chaserEl) chaserEl.textContent = emailLogEntries.filter(e => e.type === 'Auto-Chaser').length;
    if (failedEl) failedEl.textContent = emailLogEntries.filter(e => e.status === 'Bounced').length;
}

function selectColor(btn) {
    document.querySelectorAll('#credentialModal .color-swatch').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
function toggleCredEnabled() { document.getElementById('credEnabledToggle').classList.toggle('enabled'); }
function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb.toLowerCase();
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!rgb) return "#1f2937";
    const hex = x => ("0" + parseInt(x).toString(16)).slice(-2);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

// ─── SUPPORT QUEUE DRAWER ──────────────────────────────────────
function renderSupportQueue() {
    const container = document.getElementById('ai-support-list');
    if (!container) return;

    container.innerHTML = supportTickets.map(t => {
        let color = 'var(--text-tertiary)';
        if (t.tier === 'critical') color = 'var(--err-text)';
        else if (t.tier === 'moderate') color = '#d97706';
        else if (t.tier === 'low') color = 'var(--suc-text)';

        return `
            <div class="ticket-card ${t.tier}">
                <div class="ticket-meta">
                    <span style="color:${color};">${t.tier.toUpperCase()}</span>
                    <span style="color:var(--text-tertiary);">${t.time}</span>
                </div>
                <div class="ticket-issue">${t.issue}</div>
                <div class="ticket-org"><i class="material-icons">business</i> ${t.org} · ${t.id} · ${t.status}</div>
            </div>
        `;
    }).join('');

    // Update badge
    const badge = document.getElementById('support-badge');
    const critical = supportTickets.filter(t => t.tier === 'critical').length;
    if (badge) badge.textContent = critical || supportTickets.length;
}

// ─── FINANCIAL CLEARANCE DRAWER ────────────────────────────────
function renderFinancialClearance() {
    const container = document.getElementById('financial-clearance-list');
    if (!container) return;

    container.innerHTML = clearances.map(c => {
        const isOverdue = c.daysPending > 21;
        const isWarn = c.daysPending > 14;
        const progress = Math.min((c.daysPending / 21) * 100, 100);
        const fillClass = isOverdue ? 'overdue' : isWarn ? 'warn' : 'normal';

        return `
            <div class="clearance-card ${isOverdue ? 'overdue' : ''}">
                <div class="clearance-top">
                    <span class="clearance-id">${c.id}</span>
                    <span class="clearance-amount" style="color:${isOverdue ? 'var(--err-text)' : 'var(--text-primary)'};">$${c.amount.toLocaleString()}</span>
                </div>
                <div class="clearance-detail"><strong>${c.org}</strong> · ${c.method}</div>
                <div class="clearance-detail" style="color:${isOverdue ? 'var(--err-text)' : 'var(--text-tertiary)'}; font-weight:${isOverdue ? '600' : '400'};">
                    ${isOverdue ? '<i class="material-icons">warning</i> Overdue — Action Required' : `Day ${c.daysPending} of 21`}
                </div>
                <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${progress}%;"></div></div>
                <div class="clearance-actions">
                    <button class="btn-primary" onclick="markCleared('${c.id}', event)">Mark Cleared</button>
                    ${isOverdue ? `<button class="btn-danger-outline" onclick="voidOrder('${c.id}', event)">Void Order</button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Update badge
    const badge = document.getElementById('clearance-badge');
    if (badge) badge.textContent = clearances.filter(c => c.daysPending > 14).length || clearances.length;
}

function markCleared(id, e) {
    showToast("Payment cleared. Inventory released and email sent.", "success");
    const el = e.target.closest('.clearance-card');
    if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }
}

function voidOrder(id, e) {
    if (confirm("Void this order? Reserved inventory returns to global pool.")) {
        showToast("Order voided. Inventory released.", "success");
        const el = e.target.closest('.clearance-card');
        if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }
    }
}

// ─── OWNERSHIP TRANSFERS DRAWER ────────────────────────────────
function renderTransfersQueue() {
    const container = document.getElementById('transfers-list');
    if (!container) return;
    
    const transfers = JSON.parse(localStorage.getItem('sdc_ownership_transfers') || '[]');
    const pendingTransfers = transfers.filter(t => t.status === 'PENDING_SUPER_ADMIN');
    
    if (pendingTransfers.length === 0) {
        container.innerHTML = '<p style="color:var(--text-tertiary); padding:24px; text-align:center;">No pending transfer requests.</p>';
        document.getElementById('transfers-badge').style.display = 'none';
        return;
    }
    
    document.getElementById('transfers-badge').textContent = pendingTransfers.length;
    document.getElementById('transfers-badge').style.display = 'inline-flex';
    
    container.innerHTML = pendingTransfers.map(t => `
        <div class="ticket-card moderate" style="background:var(--bg-card); border:1px solid #d97706; padding:16px; border-radius:8px; margin-bottom:12px;">
            <div class="ticket-meta" style="margin-bottom:8px; display:flex; justify-content:space-between; font-size:11px;">
                <span style="color:#d97706; font-weight:600;">PENDING APPROVAL</span>
                <span style="color:var(--text-tertiary);">${t.date}</span>
            </div>
            <div class="ticket-issue" style="font-weight:600; margin-bottom:4px;">Transfer ${t.fromOrg} to ${t.newOwner}</div>
            <div class="ticket-org" style="font-size:12px; color:var(--text-secondary);"><i class="material-icons">business</i> Current Owner: ${t.currentOwner}</div>
            <div style="margin-top:16px; display:flex; gap:8px;">
                <button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:4px;" onclick="approveTransfer('${t.id}')">Approve</button>
                <button class="btn-danger-outline" style="padding:6px 12px; font-size:12px; border-radius:4px;" onclick="denyTransfer('${t.id}')">Deny</button>
            </div>
        </div>
    `).join('');
}

function approveTransfer(id) {
    const transfers = JSON.parse(localStorage.getItem('sdc_ownership_transfers') || '[]');
    const idx = transfers.findIndex(t => t.id === id);
    if (idx > -1) {
        transfers[idx].status = 'APPROVED';
        localStorage.setItem('sdc_ownership_transfers', JSON.stringify(transfers));
        renderTransfersQueue();
        showToast("Ownership transfer approved. New owner notified.", "success");
    }
}

function denyTransfer(id) {
    const transfers = JSON.parse(localStorage.getItem('sdc_ownership_transfers') || '[]');
    const idx = transfers.findIndex(t => t.id === id);
    if (idx > -1) {
        transfers[idx].status = 'DENIED';
        localStorage.setItem('sdc_ownership_transfers', JSON.stringify(transfers));
        renderTransfersQueue();
        showToast("Ownership transfer denied.", "error");
    }
}

// ─── SMART APPROVAL DRAWER ──────────────────────────────────────
let currentSmartApprovalType = null;
let currentSmartApprovalId = null;
let currentSmartSubtotal = 0;

function openSmartApproval(type, id) {
    currentSmartApprovalType = type;
    currentSmartApprovalId = id;
    
    let item = null;
    let title = "";
    let basePrice = 0;
    let qty = 0;
    
    if (type === 'procurement') {
        item = voucherRequests.find(r => r.id == id);
        title = "Purchase PO Request";
        basePrice = 140; // assuming default voucher price
        qty = item.qty;
    } else if (type === 'online') {
        item = onlineRequests.find(r => r.id == id);
        title = "Application Assignment";
        basePrice = 150; // assuming service price
        qty = item.students;
    }
    
    if (!item) return;

    currentSmartSubtotal = basePrice * qty;
    
    // Find organization to check for custom discount
    const org = organizations.find(o => o.name === item.organization);
    
    // Auto-calculate suggested discount
    let suggestedDiscount = 0;
    let ruleText = 'No volume rules apply.';
    
    if (org && effectiveOrgDiscount(org)) {
        suggestedDiscount = effectiveOrgDiscount(org);
        ruleText = `Custom Organization Discount (${suggestedDiscount}% off)`;
    } else {
        let activeRule = discountRules.find(d => d.enabled && d.condition.startsWith('>') && qty > parseInt(d.condition.replace('>', '').split(' ')[0]));
        if (activeRule) {
            suggestedDiscount = activeRule.percent;
            ruleText = activeRule.name + ' (' + activeRule.percent + '% off)';
        }
    }
    
    const content = document.getElementById('smart-approval-content');
    content.innerHTML = `
        <div style="margin-bottom: 24px;">
            <div style="font-size:12px; color:var(--text-tertiary); margin-bottom:4px; text-transform:uppercase; font-weight:700;">Organization</div>
            <div style="font-size:15px; font-weight:600;"><i class="material-icons" style="color:var(--pri); margin-right:6px;">business</i> ${item.organization}</div>
            <div style="font-size:12px; color:var(--suc-text); margin-top:4px;"><i class="material-icons">check_circle</i> Account in good standing</div>
        </div>
        <div style="margin-bottom: 24px;">
            <div style="font-size:12px; color:var(--text-tertiary); margin-bottom:4px; text-transform:uppercase; font-weight:700;">Order Details</div>
            <div style="font-size:14px;"><strong>Type:</strong> ${title}</div>
            <div style="font-size:14px;"><strong>Item:</strong> ${item.details || item.classTitle}</div>
            <div style="font-size:14px;"><strong>Qty:</strong> ${qty}</div>
            <div style="font-size:14px;"><strong>Payment Method:</strong> ${item.mode}</div>
        </div>
        <div style="background:var(--bg); border:1px solid var(--pri); border-radius:var(--radius-md); padding:12px; margin-bottom:16px;">
            <div style="font-size:12px; font-weight:600; color:var(--pri); margin-bottom:4px;"><i class="material-icons">auto_awesome</i> AI Suggested Rule</div>
            <div style="font-size:13px;">${ruleText}</div>
        </div>
    `;

    document.getElementById('smartOverrideDiscount').value = suggestedDiscount;
    recalculateSmartTotal();
    toggleDrawer('smartApprovalDrawer');
}

function recalculateSmartTotal() {
    const discInput = document.getElementById('smartOverrideDiscount');
    let percent = parseInt(discInput.value) || 0;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    
    const discountAmount = (currentSmartSubtotal * percent) / 100;
    const final = currentSmartSubtotal - discountAmount;
    
    document.getElementById('smartSubtotal').textContent = '$' + currentSmartSubtotal.toLocaleString();
    document.getElementById('smartDiscountText').textContent = '-$' + discountAmount.toLocaleString();
    document.getElementById('smartFinalTotal').textContent = '$' + final.toLocaleString();
}

function confirmSmartApproval() {
    if (currentSmartApprovalType === 'procurement') {
        handleGeneratePO(currentSmartApprovalId);
    } else if (currentSmartApprovalType === 'online') {
        approveOnlineRequest(currentSmartApprovalId);
    }
    closeAllDrawers();
    updateVoucherMetrics();
}

// ─── ORGANIZATION FINANCIALS (Invoices & Ledger) ────────────────
// Builds a representative billing history for an org: any real voucher/online
// requests on file plus a seeded baseline so the panel always shows data.
// The seed is derived from the org name, so the same org always renders the
// same figures within a session.
function buildOrgFinancialsHtml(org, index) {
    let seed = (org.name || 'org').split('').reduce((a, c) => a + c.charCodeAt(0), index * 7 + 13);
    const rand = (min, max) => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return min + (seed % (max - min + 1));
    };
    const money = n => '$' + Math.round(n).toLocaleString();
    const discPct = (org.discountEnabled ? (org.customDiscount || 0) : 0);

    // Assemble line items: real requests first, then seeded historical orders.
    const items = [];
    voucherRequests.filter(r => r.organization === org.name).forEach(r => {
        items.push({ date: '2026-06-10', kind: 'VOUCHERS', desc: `${r.qty}× ${r.details}`,
            amount: (r.qty * 140) * (1 - discPct / 100), status: r.status });
    });
    onlineRequests.filter(r => r.organization === org.name).forEach(r => {
        items.push({ date: '2026-06-12', kind: 'SERVICE', desc: r.classTitle,
            amount: r.totalCost, status: r.status });
    });

    const catalog = ['Food Handling Cert', 'Food Safety Level 1', 'Advanced Mixology',
                     'HACCP Manager', 'Allergen Awareness', 'Executive Chef Masterclass'];
    const baseMonths = ['2026-02-14', '2026-03-22', '2026-04-09', '2026-05-18', '2026-06-03'];
    const histCount = rand(3, 5);
    for (let i = 0; i < histCount; i++) {
        const qty = rand(10, 120);
        const cert = catalog[rand(0, catalog.length - 1)];
        items.push({ date: baseMonths[i % baseMonths.length], kind: 'VOUCHERS',
            desc: `${qty}× ${cert}`, amount: (qty * 140) * (1 - discPct / 100),
            status: i === 0 ? 'PENDING' : 'PAID' });
    }
    // Newest first.
    items.sort((a, b) => (a.date < b.date ? 1 : -1));

    // ── Invoices ────────────────────────────────────────────────
    let totalBilled = 0, totalPaid = 0, outstanding = 0;
    const invoiceRows = items.map((it, i) => {
        const paid = it.status === 'PAID' || it.status === 'APPROVED';
        const overdue = !paid && it.date < '2026-05-01';
        const st = paid ? 'PAID' : overdue ? 'OVERDUE' : 'DUE';
        totalBilled += it.amount;
        if (paid) totalPaid += it.amount; else outstanding += it.amount;
        const num = 'INV-' + (2401 + index * 17 + i);
        const badgeClass = paid ? 'badge-active' : overdue ? 'badge-suspended' : 'badge-pending';
        const kindStyle = it.kind === 'SERVICE'
            ? 'background:#fce7f3;color:#be185d;' : 'background:#e0e7ff;color:#3730a3;';
        return `<tr>
            <td style="font-weight:600; white-space:nowrap;">${num}</td>
            <td style="color:var(--text-tertiary); white-space:nowrap;">${it.date}</td>
            <td><span class="badge" style="${kindStyle}">${it.kind}</span></td>
            <td style="font-size:13px;">${it.desc}</td>
            <td style="font-weight:600; white-space:nowrap;">${money(it.amount)}</td>
            <td><span class="badge ${badgeClass}">${st}</span></td>
            <td style="text-align:right;"><button class="pr-icon-btn" title="Download invoice PDF" onclick="showToast('Invoice ${num} downloaded','success')"><i class="material-icons">download</i></button></td>
        </tr>`;
    }).join('');

    // ── Ledger (running balance) ────────────────────────────────
    const ledgerEntries = [];
    items.slice().reverse().forEach((it, i) => {
        const num = 'INV-' + (2401 + index * 17 + (items.length - 1 - i));
        ledgerEntries.push({ date: it.date, ref: num, type: 'DEBIT',
            label: `Invoice raised — ${it.kind.toLowerCase()}`, amount: it.amount });
        if (it.status === 'PAID' || it.status === 'APPROVED') {
            ledgerEntries.push({ date: it.date, ref: 'PMT-' + num.slice(4), type: 'CREDIT',
                label: 'Payment received', amount: it.amount });
        }
    });
    let balance = 0;
    const ledgerRows = ledgerEntries.map(e => {
        balance += e.type === 'DEBIT' ? e.amount : -e.amount;
        const isDebit = e.type === 'DEBIT';
        return `<tr>
            <td style="color:var(--text-tertiary); white-space:nowrap;">${e.date}</td>
            <td style="font-size:13px; white-space:nowrap;">${e.ref}</td>
            <td style="font-size:13px;">${e.label}</td>
            <td style="color:${isDebit ? 'var(--err-text)' : 'var(--suc-text)'}; font-weight:600; white-space:nowrap;">${isDebit ? '+' : '−'}${money(e.amount)}</td>
            <td style="font-weight:600; white-space:nowrap;">${money(balance)}</td>
        </tr>`;
    }).join('');

    return `
        <div class="stats-row" style="margin-top:16px; margin-bottom:24px; gap:16px;">
            <div class="stat-card" style="background:var(--surface-hover); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">
                <div class="stat-value" style="font-size:22px;">${money(totalBilled)}</div>
                <div class="stat-label">Total Billed</div>
            </div>
            <div class="stat-card" style="background:var(--surface-hover); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">
                <div class="stat-value" style="font-size:22px; color:var(--suc-text);">${money(totalPaid)}</div>
                <div class="stat-label">Total Paid</div>
            </div>
            <div class="stat-card" style="background:var(--surface-hover); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">
                <div class="stat-value" style="font-size:22px; color:${outstanding > 0 ? 'var(--err-text)' : 'var(--text-primary)'};">${money(outstanding)}</div>
                <div class="stat-label">Outstanding</div>
            </div>
        </div>

        <h3 style="font-size:15px; font-weight:700; margin:0 0 8px;"><i class="material-icons" style="font-size:18px; vertical-align:-4px; color:var(--text-secondary);">receipt_long</i> Invoices</h3>
        <div class="table-card" style="margin-bottom:28px;">
            <table>
                <thead><tr><th>Invoice #</th><th>Date</th><th>Type</th><th>Details</th><th>Amount</th><th>Status</th><th style="text-align:right;">PDF</th></tr></thead>
                <tbody>${invoiceRows}</tbody>
            </table>
        </div>

        <h3 style="font-size:15px; font-weight:700; margin:0 0 8px;"><i class="material-icons" style="font-size:18px; vertical-align:-4px; color:var(--text-secondary);">account_balance_wallet</i> Account Ledger</h3>
        <div class="table-card">
            <table>
                <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Amount</th><th>Balance</th></tr></thead>
                <tbody>${ledgerRows}</tbody>
            </table>
        </div>
    `;
}

// ─── ORGANIZATION PROFILE DRAWER ────────────────────────────────
function openOrgProfile(index) {
    const org = organizations[index];
    if (!org) return;

    document.getElementById('orgProfileTitle').innerHTML = `<i class="material-icons">business</i> ${org.name}`;
    document.getElementById('orgProfileEmail').textContent = org.email + " • " + org.slug;

    // Generate Mock Members
    const membersHtml = `
        <table style="margin-top: 16px;">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
                <tr><td style="font-weight:600;">Admin User</td><td style="color:var(--text-secondary);">${org.email}</td><td><span class="badge">OWNER</span></td><td>Mar 2025</td></tr>
                <tr><td style="font-weight:600;">John Smith</td><td style="color:var(--text-secondary);">jsmith@example.com</td><td><span class="badge">MANAGER</span></td><td>Apr 2025</td></tr>
                <tr><td style="font-weight:600;">Sarah Connor</td><td style="color:var(--text-secondary);">sconnor@example.com</td><td><span class="badge">MEMBER</span></td><td>May 2025</td></tr>
            </tbody>
        </table>
    `;
    document.getElementById('org-content-members').innerHTML = membersHtml;

    // Invoices & Ledger — always populated with a representative financial
    // history for the org (real requests where present, seeded mock data
    // otherwise) so the panel is never empty.
    document.getElementById('org-content-invoices').innerHTML = buildOrgFinancialsHtml(org, index);

    // Account controls footer (Section 2c): a deactivated org gets a Reactivate
    // button instead of Deactivate.
    currentProfileOrgIndex = index;
    const deactBtn = document.getElementById('profile-deactivate-btn');
    if (org.status === 'SUSPENDED') {
        deactBtn.innerHTML = '<i class="material-icons">restart_alt</i> Reactivate Account';
        deactBtn.className = 'btn-secondary';
        deactBtn.style.flex = '1';
    } else {
        deactBtn.innerHTML = '<i class="material-icons">block</i> Deactivate Account';
        deactBtn.className = 'btn-danger-outline';
        deactBtn.style.flex = '1';
    }

    // Default to Members tab
    switchOrgProfileTab('members');
    toggleDrawer('orgProfileDrawer');
}

// Profile-view account controls.
function editProfileOrg() {
    if (currentProfileOrgIndex === null) return;
    toggleDrawer('orgProfileDrawer');
    editOrganization(currentProfileOrgIndex);
}
function deactivateProfileOrg() {
    if (currentProfileOrgIndex === null) return;
    const org = organizations[currentProfileOrgIndex];
    if (org.status === 'SUSPENDED') {
        org.status = 'ACTIVE';
        org.suspendReason = '';
        saveOrganizations();
        renderOrganizations();
        updateOrgStats();
        showToast('Account successfully reactivated.', 'success');
        openOrgProfile(currentProfileOrgIndex);
    } else {
        toggleDrawer('orgProfileDrawer');
        openSuspendModal(currentProfileOrgIndex);
    }
}

function switchOrgProfileTab(tab) {
    document.getElementById('org-tab-members').classList.remove('active');
    document.getElementById('org-tab-invoices').classList.remove('active');
    document.getElementById('org-content-members').style.display = 'none';
    document.getElementById('org-content-invoices').style.display = 'none';

    document.getElementById('org-tab-' + tab).classList.add('active');
    document.getElementById('org-content-' + tab).style.display = 'block';
}

// ─── GLOBAL FINANCIAL LEDGER ────────────────────────────────────
let currentLedgerTab = 'all';

function switchLedgerTab(tab) {
    currentLedgerTab = tab;
    ['all', 'cleared', 'pending'].forEach(id => {
        const btn = document.getElementById('ledger-tab-' + id);
        if (btn) btn.classList.remove('active');
    });
    const btn = document.getElementById('ledger-tab-' + tab);
    if (btn) btn.classList.add('active');
    renderFinancialLedger();
}

// Aggregate the ledger from the three source arrays (used by both the renderer
// and the manual collection actions so they share one source of truth).
function buildLedger() {
    let ledger = [];

    // Voucher Requests (B2B)
    voucherRequests.forEach(r => {
        const org = organizations.find(o => o.name === r.organization);
        let discount = 0;
        if (org && effectiveOrgDiscount(org)) discount = effectiveOrgDiscount(org);
        else if (r.qty >= 500) discount = 20;
        else if (r.qty >= 100) discount = 12;
        else if (r.qty >= 50) discount = 5;

        const finalAmount = (r.qty * 140) * (1 - (discount/100));

        ledger.push({
            date: r.date || COLLECTION_SEED_DATES[r.organization] || '2026-06-10',
            source: 'B2B Vouchers',
            client: r.organization,
            details: `${r.qty}x ${r.details}`,
            method: r.mode,
            amount: finalAmount,
            status: r.status === 'APPROVED' || r.status === 'PAID' ? 'CLEARED' : 'PENDING',
            statusBadge: r.status === 'APPROVED' || r.status === 'PAID' ? 'badge-active' : 'badge-pending',
            sourceColor: 'background:#e0e7ff;color:#3730a3;'
        });
    });

    // Online Services (B2B)
    onlineRequests.forEach(r => {
        ledger.push({
            date: r.date || COLLECTION_SEED_DATES[r.organization] || '2026-06-12',
            source: 'B2B Services',
            client: r.organization,
            details: r.classTitle,
            method: r.mode,
            amount: r.totalCost,
            status: r.status === 'APPROVED' ? 'CLEARED' : 'PENDING',
            statusBadge: r.status === 'APPROVED' ? 'badge-active' : 'badge-pending',
            sourceColor: 'background:#fce7f3;color:#be185d;'
        });
    });

    // Website Purchases (B2C)
    websitePurchases.forEach(r => {
        if (r.status === 'CANCELLED' || r.status === 'FAILED' || r.status === 'REFUNDED') return;
        ledger.push({
            date: r.date,
            source: 'B2C Website',
            client: r.email,
            details: `${r.qty}x ${r.cert}`,
            method: 'Stripe',
            amount: r.qty * 140, // Base Price Mock
            status: r.status === 'PAID' ? 'CLEARED' : 'PENDING',
            statusBadge: r.status === 'PAID' ? 'badge-active' : 'badge-pending',
            sourceColor: 'background:#dcfce7;color:#166534;'
        });
    });

    ledger.sort((a,b) => new Date(b.date) - new Date(a.date));
    return ledger;
}

// Send a single escalating reminder email for a pending item.
function sendCollectionReminderEmail(item, stage) {
    const tmpl = COLLECTION_REMINDER_TEMPLATES[stage - 1];
    const org = organizations.find(o => o.name === item.client);
    const recipient = (org && org.email) ? org.email : item.client;
    logEmail(recipient, tmpl.type, `[${tmpl.label}] ${tmpl.subject} — ${item.details}`);
}

// Deactivate an org for non-payment (mirrors confirmSuspendOrg).
function deactivateForNonPayment(item) {
    const org = organizations.find(o => o.name === item.client);
    if (!org || org.status === 'SUSPENDED') return false;
    org.status = 'SUSPENDED';
    org.suspendReason = 'Payment overdue — deactivated after 3 reminders';
    saveOrganizations();
    logEmail(org.email || org.name, 'Suspension', `Account deactivated — invoice for ${item.details} unpaid after 3 reminders`);
    if (typeof renderOrganizations === 'function') renderOrganizations();
    if (typeof updateOrgStats === 'function') updateOrgStats();
    return true;
}

// Auto catch-up: for each pending item, send any reminders whose milestone has
// passed (and weren't sent yet), then deactivate once all 3 are sent and the
// final (+10d) milestone is reached. State in `collectionReminders` prevents
// double-sending across reloads.
function processCollectionReminders(pendingItems) {
    let changed = false;
    pendingItems.forEach(item => {
        const key = collectionKey(item);
        const st = collectionReminders[key] || (collectionReminders[key] = { remindersSent: 0, log: [], deactivated: false });
        const due = collectionDueDate(item);
        collectionMilestones(due).forEach(m => {
            if (m.stage > st.remindersSent && COLLECTION_TODAY >= m.at) {
                sendCollectionReminderEmail(item, m.stage);
                st.remindersSent = m.stage;
                st.log.push({ stage: m.stage, sentAt: collectionFmt(COLLECTION_TODAY) });
                changed = true;
            }
        });
        if (!st.deactivated && st.remindersSent >= 3 && COLLECTION_TODAY >= collectionAddDays(due, 10)) {
            if (deactivateForNonPayment(item)) { st.deactivated = true; changed = true; }
        }
    });
    if (changed) saveCollectionReminders();
}

// Manual: send the next reminder now (or deactivate if all 3 already sent).
function sendCollectionReminder(key) {
    const item = buildLedger().find(i => i.status === 'PENDING' && collectionKey(i) === key);
    if (!item) return;
    const st = collectionReminders[key] || (collectionReminders[key] = { remindersSent: 0, log: [], deactivated: false });
    if (st.remindersSent >= 3) {
        if (deactivateForNonPayment(item)) { st.deactivated = true; saveCollectionReminders(); showToast(`${item.client} deactivated for non-payment.`, 'success'); }
        renderFinancialLedger();
        return;
    }
    const next = st.remindersSent + 1;
    sendCollectionReminderEmail(item, next);
    st.remindersSent = next;
    st.log.push({ stage: next, sentAt: collectionFmt(COLLECTION_TODAY) });
    saveCollectionReminders();
    renderFinancialLedger();
    showToast(`Reminder ${next}/3 (${COLLECTION_REMINDER_TEMPLATES[next-1].label}) sent to ${item.client}.`, 'success');
}

// Manual: mark a pending invoice as received → flips source record to cleared.
function markCollectionReceived(key) {
    const item = buildLedger().find(i => i.status === 'PENDING' && collectionKey(i) === key);
    if (!item) return;
    if (item.source === 'B2B Vouchers') {
        const r = voucherRequests.find(r => r.organization === item.client && `${r.qty}x ${r.details}` === item.details);
        if (r) { r.status = 'APPROVED'; saveVoucherRequests(voucherRequests); }
    } else if (item.source === 'B2B Services') {
        const r = onlineRequests.find(r => r.organization === item.client && r.classTitle === item.details);
        if (r) { r.status = 'APPROVED'; saveOnlineRequests(); }
    } else if (item.source === 'B2C Website') {
        const r = websitePurchases.find(r => r.email === item.client);
        if (r) { r.status = 'PAID'; saveWebsitePurchases(); }
    }
    delete collectionReminders[key];
    saveCollectionReminders();
    renderFinancialLedger();
    showToast(`Payment marked received for ${item.client}.`, 'success');
}

function renderFinancialLedger() {
    const tbody = document.getElementById('financials-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const ledger = buildLedger();

    // Run the dunning engine on pending items before rendering counts.
    processCollectionReminders(ledger.filter(i => i.status === 'PENDING'));

    let clearedRev = 0, pendingRev = 0;
    ledger.forEach(item => {
        if (item.status === 'CLEARED') clearedRev += item.amount;
        if (item.status === 'PENDING') pendingRev += item.amount;
    });
    const cEl = document.getElementById('ledger-cleared-rev');
    const pEl = document.getElementById('ledger-pending-rev');
    if (cEl) cEl.textContent = '$' + clearedRev.toLocaleString();
    if (pEl) pEl.textContent = '$' + pendingRev.toLocaleString();

    const filteredLedger = ledger.filter(item => {
        if (currentLedgerTab === 'all') return true;
        if (currentLedgerTab === 'cleared' && item.status === 'CLEARED') return true;
        if (currentLedgerTab === 'pending' && item.status === 'PENDING') return true;
        return false;
    });

    const isPending = currentLedgerTab === 'pending';

    // Swap the header columns for the Pending tab (adds Due Date / Reminders / Actions).
    const thead = document.getElementById('financials-thead');
    if (thead) {
        thead.innerHTML = isPending
            ? '<tr><th>Source</th><th>Client</th><th>Details</th><th>Amount</th><th>Due Date</th><th>Reminders</th><th>Actions</th></tr>'
            : '<tr><th>Date</th><th>Source</th><th>Client / Email</th><th>Details</th><th>Method</th><th>Amount</th><th>Status</th></tr>';
    }

    filteredLedger.forEach(item => {
        const tr = document.createElement('tr');
        const amt = `$${item.amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        if (!isPending) {
            tr.innerHTML = `
                <td style="color:var(--text-tertiary);">${item.date}</td>
                <td><span class="badge" style="${item.sourceColor}">${item.source}</span></td>
                <td class="table-title-text">${item.client}</td>
                <td style="font-size:13px;">${item.details}</td>
                <td style="color:var(--text-secondary);">${item.method}</td>
                <td style="font-weight:600;">${amt}</td>
                <td><span class="badge ${item.statusBadge}">${item.status}</span></td>
            `;
        } else {
            const key = collectionKey(item);
            const st = collectionReminders[key] || { remindersSent: 0, deactivated: false };
            const due = collectionDueDate(item);
            const dueStr = collectionFmt(due);
            const overdue = COLLECTION_TODAY > due;
            const sent = st.remindersSent || 0;

            // Reminders cell: count + next-due hint or deactivated badge.
            let remindersCell;
            if (st.deactivated) {
                remindersCell = `<span class="badge badge-suspended">3/3 · Deactivated</span>`;
            } else {
                const nextMs = collectionMilestones(due).find(m => m.stage === sent + 1);
                const hint = sent >= 3
                    ? '<div style="font-size:11px;color:var(--err-text);">deactivation due</div>'
                    : (nextMs ? `<div style="font-size:11px;color:var(--text-tertiary);">next: ${collectionFmt(nextMs.at)}</div>` : '');
                remindersCell = `<span style="font-weight:600;">${sent} / 3</span>${hint}`;
            }

            // Actions: Send Reminder (or Deactivate now) + Mark Received.
            const sendBtn = st.deactivated
                ? ''
                : (sent >= 3
                    ? `<button class="btn-secondary btn-sm" style="color:var(--err-text);" onclick="sendCollectionReminder('${key.replace(/'/g, "\\'")}')"><i class="material-icons" style="font-size:14px;">block</i> Deactivate now</button>`
                    : `<button class="btn-secondary btn-sm" onclick="sendCollectionReminder('${key.replace(/'/g, "\\'")}')"><i class="material-icons" style="font-size:14px;">send</i> Send Reminder</button>`);
            const recvBtn = `<button class="btn-secondary btn-sm" onclick="markCollectionReceived('${key.replace(/'/g, "\\'")}')"><i class="material-icons" style="font-size:14px;">check</i> Mark Received</button>`;

            tr.innerHTML = `
                <td><span class="badge" style="${item.sourceColor}">${item.source}</span></td>
                <td class="table-title-text">${item.client}</td>
                <td style="font-size:13px;">${item.details}</td>
                <td style="font-weight:600;">${amt}</td>
                <td style="color:${overdue ? 'var(--err-text)' : 'var(--text-secondary)'}; white-space:nowrap;">${dueStr}${overdue ? ' <span style="font-size:11px;">(overdue)</span>' : ''}</td>
                <td>${remindersCell}</td>
                <td><div style="display:flex; gap:6px; flex-wrap:wrap;">${sendBtn}${recvBtn}</div></td>
            `;
        }
        tbody.appendChild(tr);
    });

    const total = document.getElementById('financials-total');
    if (total) total.textContent = `${filteredLedger.length} items`;
}

function toggleDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    const overlay = document.getElementById('drawerOverlay');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('open');
    closeAllDrawers();
    if (!isOpen) {
        drawer.classList.add('open');
        overlay.classList.add('active');
    }
}

function closeAllDrawers() {
    document.querySelectorAll('.side-drawer').forEach(d => d.classList.remove('open'));
    document.getElementById('drawerOverlay').classList.remove('active');
}

// ─── MODALS ────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ─── PROFILE DROPDOWN ──────────────────────────────────────────
function toggleProfileDropdown(e) {
    e.stopPropagation();
    document.getElementById('profileDropdown').classList.toggle('show');
}
document.addEventListener('click', () => {
    const dd = document.getElementById('profileDropdown');
    if (dd && dd.classList.contains('show')) dd.classList.remove('show');
});

// ─── TOASTS ────────────────────────────────────────────────────
function showToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success'
        ? '<i class="material-icons" style="color:var(--suc-text); font-size:18px;">check_circle</i>'
        : '<i class="material-icons" style="color:var(--err-text); font-size:18px;">error</i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
}
