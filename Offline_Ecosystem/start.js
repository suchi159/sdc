const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORTS = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3009, 3010, 3011];
const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, 'data');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// ============================================================================
// DATA HELPERS
// ============================================================================
function readJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
  } catch (e) {
    console.error(`Failed to read ${filename}:`, e.message);
    return null;
  }
}

function writeJSON(filename, data) {
  try {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`Failed to write ${filename}:`, e.message);
    return false;
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
  });
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

// Simple in-memory session store
let activeSessions = {};

// ============================================================================
// AUTH ROUTES
// ============================================================================
function handleLogin(req, res, body) {
  const { email, password } = body;
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Server error' }, 500);

  const u = users.currentUser;
  if (u.email === email && u.password === password) {
    const token = 'tok_' + Date.now();
    activeSessions[token] = u.id;
    return sendJSON(res, {
      success: true,
      token,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        organization: u.organization,
        hasCompletedTraining: u.hasCompletedTraining,
        accountStatus: u.accountStatus
      }
    });
  }
  return sendJSON(res, { error: 'Invalid email or password' }, 401);
}

function handleLogout(req, res, body) {
  const { token } = body;
  if (token && activeSessions[token]) {
    delete activeSessions[token];
  }
  sendJSON(res, { success: true });
}

function handleForgotPassword(req, res, body) {
  const { email } = body;
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Server error' }, 500);

  if (users.currentUser.email === email) {
    const otp = '482916';
    console.log(`📧 [MOCK EMAIL] Password reset OTP for ${email}: ${otp}`);
    return sendJSON(res, { success: true, message: 'OTP sent to your email' });
  }
  return sendJSON(res, { error: 'Email not found' }, 404);
}

function handleResetPassword(req, res, body) {
  const { email, otp, newPassword } = body;
  if (otp === '482916') {
    const users = readJSON('users.json');
    if (!users) return sendJSON(res, { error: 'Server error' }, 500);
    users.currentUser.password = newPassword;
    writeJSON('users.json', users);
    return sendJSON(res, { success: true, message: 'Password reset successfully' });
  }
  return sendJSON(res, { error: 'Invalid OTP' }, 400);
}

// ============================================================================
// USER FLAGS
// ============================================================================
function handleGetFlags(req, res) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Server error' }, 500);
  const u = users.currentUser;
  sendJSON(res, {
    hasCompletedTraining: u.hasCompletedTraining,
    trainingWatchPercent: u.trainingWatchPercent || 0,
    accountStatus: u.accountStatus
  });
}

function handleUpdateTraining(req, res, body) {
  const { watchPercent } = body;
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Server error' }, 500);

  users.currentUser.trainingWatchPercent = watchPercent;
  if (watchPercent >= 100) {
    users.currentUser.hasCompletedTraining = true;
  }
  writeJSON('users.json', users);
  sendJSON(res, { success: true, hasCompletedTraining: users.currentUser.hasCompletedTraining });
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================
function handleDashboardStats(req, res) {
  const sessions = readJSON('sessions.json');
  const candidates = readJSON('candidates.json');
  const incidents = readJSON('incidents.json');
  const users = readJSON('users.json');
  if (!sessions || !candidates || !incidents || !users) return sendJSON(res, { error: 'Data error' }, 500);

  const liveSessions = sessions.filter(s => s.status === 'live');
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingExams = sessions.filter(s => {
    const d = new Date(s.examDate);
    return s.status === 'upcoming' && d >= now && d <= in7Days;
  });

  const pendingIncidents = [
    ...incidents.aiFlags.filter(f => f.status === 'pending'),
    ...incidents.flaggedCases.filter(f => f.status === 'open'),
    ...incidents.retakeRequests.filter(r => r.status === 'pending')
  ];

  const totalVouchers = sessions.reduce((a, s) => a + (s.vouchersAvailable || 0), 0);
  const usedVouchers = sessions.reduce((a, s) => a + (s.vouchersUsed || 0), 0);

  sendJSON(res, {
    activeLiveSessions: liveSessions.length,
    upcomingExams7Days: upcomingExams.length,
    pendingIncidentCount: pendingIncidents.length,
    voucherBalance: { available: totalVouchers, used: usedVouchers },
    liveSessions: liveSessions.map(s => ({
      id: s.id,
      name: s.name,
      candidateCount: s.candidateCount,
      liveCount: candidates.filter(c => c.sessionId === s.id && c.examStatus === 'in_progress').length,
      warningCount: candidates.filter(c => c.sessionId === s.id && c.warningCount > 0).length
    })),
    upcomingSessions: sessions
      .filter(s => s.status === 'upcoming')
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        name: s.name,
        examDate: s.examDate,
        candidateCount: s.candidateCount,
        status: s.status
      })),
    pendingIncidents: pendingIncidents.slice(0, 5).map(i => ({
      id: i.id,
      candidateName: i.candidateName,
      type: i.alertType || i.reason || 'Manual Flag',
      timestamp: i.timestamp || i.flaggedAt || i.requestedAt
    }))
  });
}

// ============================================================================
// SESSIONS (COHORTS)
// ============================================================================
function handleGetSessions(req, res) {
  const sessions = readJSON('sessions.json');
  if (!sessions) return sendJSON(res, { error: 'Data error' }, 500);
  sendJSON(res, sessions);
}

function handleGetSession(req, res, id) {
  const sessions = readJSON('sessions.json');
  const candidates = readJSON('candidates.json');
  if (!sessions || !candidates) return sendJSON(res, { error: 'Data error' }, 500);

  const session = sessions.find(s => s.id === id);
  if (!session) return sendJSON(res, { error: 'Session not found' }, 404);

  const sessionCandidates = candidates.filter(c => c.sessionId === id);
  sendJSON(res, { ...session, candidates: sessionCandidates });
}

function handleCreateSession(req, res, body) {
  const sessions = readJSON('sessions.json');
  if (!sessions) return sendJSON(res, { error: 'Data error' }, 500);

  const newSession = {
    id: 'sess_' + String(sessions.length + 1).padStart(3, '0'),
    name: body.name,
    organization: 'SecureProctor AI',
    examDate: body.examDate,
    startTime: body.startTime,
    duration: body.duration,
    status: 'draft',
    allowRetake: body.allowRetake || false,
    maxRetakeAttempts: body.maxRetakeAttempts || 0,
    retakeWindow: body.retakeWindow || 0,
    createdAt: new Date().toISOString(),
    createdBy: 'usr_001',
    candidateCount: 0,
    vouchersAssigned: 0,
    vouchersUsed: 0,
    vouchersAvailable: body.vouchersAvailable || 0,
    course: body.course || '',
    voucherPoolId: body.voucherPoolId || '',
    proctoringFlow: body.proctoringFlow || 'A',
    learningMaterials: Array.isArray(body.learningMaterials) ? body.learningMaterials : [],
    activityLog: [
      { ts: new Date().toISOString(), by: 'Dr. Sarah Jenkins', action: 'Created cohort', detail: 'Draft session created' }
    ]
  };

  sessions.push(newSession);
  writeJSON('sessions.json', sessions);
  sendJSON(res, newSession, 201);
}

function handleUpdateSession(req, res, id, body) {
  const sessions = readJSON('sessions.json');
  if (!sessions) return sendJSON(res, { error: 'Data error' }, 500);

  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return sendJSON(res, { error: 'Session not found' }, 404);

  const allowed = ['name', 'examDate', 'startTime', 'duration', 'status', 'allowRetake', 'maxRetakeAttempts', 'retakeWindow', 'learningMaterials'];
  allowed.forEach(key => {
    if (body[key] !== undefined) sessions[idx][key] = body[key];
  });

  sessions[idx].activityLog.push({
    ts: new Date().toISOString(),
    by: 'Dr. Sarah Jenkins',
    action: 'Updated session',
    detail: `Fields updated: ${Object.keys(body).join(', ')}`
  });

  writeJSON('sessions.json', sessions);
  sendJSON(res, sessions[idx]);
}

// ============================================================================
// CANDIDATES
// ============================================================================
function handleGetCandidates(req, res, query) {
  const candidates = readJSON('candidates.json');
  if (!candidates) return sendJSON(res, { error: 'Data error' }, 500);

  let filtered = candidates;
  if (query.sessionId) filtered = filtered.filter(c => c.sessionId === query.sessionId);
  if (query.status) filtered = filtered.filter(c => c.examStatus === query.status);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.rollNo.toLowerCase().includes(s));
  }
  sendJSON(res, filtered);
}

function handleGetCandidate(req, res, id) {
  const candidates = readJSON('candidates.json');
  if (!candidates) return sendJSON(res, { error: 'Data error' }, 500);

  const c = candidates.find(c => c.id === id);
  if (!c) return sendJSON(res, { error: 'Candidate not found' }, 404);
  sendJSON(res, c);
}

function handleUpdateCandidate(req, res, id, body) {
  const candidates = readJSON('candidates.json');
  if (!candidates) return sendJSON(res, { error: 'Data error' }, 500);

  const idx = candidates.findIndex(c => c.id === id);
  if (idx === -1) return sendJSON(res, { error: 'Candidate not found' }, 404);

  const allowed = ['examStatus', 'examScore', 'lastActive', 'warningCount', 'aiRisk',
    'sessionId', 'voucherCode', 'voucherStatus', 'voucherAssignedAt', 'learningProgress', 'subject', 'course'];
  allowed.forEach(key => {
    if (body[key] !== undefined) candidates[idx][key] = body[key];
  });
  // Assigning a voucher code defaults its status to 'assigned' unless explicitly set
  if (body.voucherCode !== undefined && body.voucherStatus === undefined) {
    candidates[idx].voucherStatus = body.voucherCode ? 'assigned' : 'unassigned';
  }

  writeJSON('candidates.json', candidates);

  // Broadcast update to SSE clients
  const sseData = {
    type: 'update',
    candidates: [candidates[idx]],
    timestamp: new Date().toISOString()
  };
  for (const client of sseClients) {
    client.write(`data: ${JSON.stringify(sseData)}\n\n`);
  }

  sendJSON(res, candidates[idx]);
}

// ============================================================================
// VOUCHERS
// ============================================================================
function handleGetVouchers(req, res) {
  const vouchers = readJSON('vouchers.json');
  if (!vouchers) return sendJSON(res, { error: 'Data error' }, 500);
  sendJSON(res, vouchers);
}

function handleUpgradeVoucher(req, res, id, body) {
  const vouchers = readJSON('vouchers.json');
  if (!vouchers) return sendJSON(res, { error: 'Data error' }, 500);

  const idx = vouchers.findIndex(v => v.voucherId === id);
  if (idx === -1) return sendJSON(res, { error: 'Voucher not found' }, 404);

  vouchers[idx].currentType = 'Internet Proctored';
  vouchers[idx].upgrade = {
    isUpgraded: true,
    upgradeDate: new Date().toISOString(),
    upgradeFee: body.fee || 25.00,
    paidBy: body.paidBy || 'Candidate',
    transactionId: 'txn_' + Math.floor(Math.random() * 1000000)
  };

  writeJSON('vouchers.json', vouchers);
  sendJSON(res, vouchers[idx]);
}

// ============================================================================
// VOUCHER: candidate self-purchase (B2C — candidate buys their own voucher)
// Mints ONE voucher, auto-assigned to the buying candidate. Tagged
// acquisitionSource:'self-purchased' so it is distinguishable from the
// org-admin bulk-purchase + assign path, while sharing the same record shape
// and the same downstream redemption engine.
// ============================================================================
// Persist a system-assigned voucher created when a proctor/org adds a candidate.
// The portal generates the code (VCH-C#### in-class / VCH-O#### online) and
// passes it here so the backend record matches what the candidate later redeems.
// Idempotent: re-assigning the same code returns the existing record.
function handleAssignVoucher(req, res, body) {
  const vouchers = readJSON('vouchers.json') || [];
  const code = (body.voucherId || body.code || '').trim();
  if (!code) return sendJSON(res, { error: 'missing_code' }, 400);
  const existing = vouchers.find(v => v.voucherId === code);
  if (existing) return sendJSON(res, { success: true, voucher: existing, alreadyExisted: true });
  const type = body.type === 'Internet Proctored' ? 'Internet Proctored' : 'In-House';
  const v = {
    voucherId: code,
    sessionId: body.sessionId || null,
    assignedToCandidateId: body.candidateId || null,
    originalType: type,
    currentType: type,
    status: 'Assigned',
    upgrade: { isUpgraded: false },
    acquisitionSource: 'assigned',
    cert: body.examAssessment || null,
    purchasedBy: body.assignedBy || 'system',
    purchasedAt: new Date().toISOString()
  };
  vouchers.push(v);
  writeJSON('vouchers.json', vouchers);
  pushNotification({
    type: 'voucher_assign', icon: 'confirmation_number', title: 'Voucher assigned',
    message: `${code} (${type}) assigned to ${body.candidateName || body.candidateId || 'a candidate'}.`
  });
  sendJSON(res, { success: true, voucher: v }, 201);
}

function handleSelfPurchaseVoucher(req, res, body) {
  const vouchers = readJSON('vouchers.json') || [];
  const type = body.type === 'Internet Proctored' ? 'Internet Proctored' : 'In-House';
  const candidateId = body.candidateId || null;
  const unitPrice = type === 'Internet Proctored' ? 75 : 42;

  const v = {
    voucherId: 'VCH-P' + String(vouchers.length + 1).padStart(4, '0'),
    sessionId: null,
    assignedToCandidateId: candidateId,
    originalType: type,
    currentType: type,
    status: 'Assigned',
    upgrade: { isUpgraded: false },
    acquisitionSource: 'self-purchased',
    purchasedBy: candidateId || 'candidate',
    purchasedAt: new Date().toISOString()
  };
  vouchers.push(v);
  writeJSON('vouchers.json', vouchers);

  logEmail({
    type: 'Voucher Purchase Receipt',
    to: body.email || 'candidate',
    subject: `Your ${type} exam voucher ${v.voucherId} — receipt ($${unitPrice})`
  });
  sendJSON(res, { success: true, voucherId: v.voucherId, type, total: unitPrice, voucher: v }, 201);
}

// ============================================================================
// VOUCHER: public website purchase (B2C/B2B self-service from the landing
// page). Mirrors the org-admin "Pay Now" pathway: buyer pays online by card
// and immediately receives one code PER seat. Codes are minted 'Assigned' so a
// candidate activates them by signing in with the code on the candidate portal.
// Same record shape + downstream activate/redeem engine as every other voucher.
// ============================================================================
function handleWebPurchaseVoucher(req, res, body) {
  const vouchers = readJSON('vouchers.json') || [];
  const type = body.type === 'In-House' ? 'In-House' : 'Internet Proctored';
  const qty = Math.max(1, Math.min(500, parseInt(body.qty, 10) || 1));
  const cert = body.cert || null;
  const amount = Number(body.total) || 0;
  const now = new Date().toISOString();

  const minted = [];
  for (let i = 0; i < qty; i++) {
    const v = {
      voucherId: 'VCH-W' + String(vouchers.length + 1).padStart(4, '0'),
      sessionId: null,
      assignedToCandidateId: null,
      originalType: type,
      currentType: type,
      status: 'Assigned',
      upgrade: { isUpgraded: false },
      acquisitionSource: 'web-purchased',
      cert: cert,
      purchasedBy: body.email || body.orgName || 'web-buyer',
      purchasedAt: now
    };
    vouchers.push(v);
    minted.push(v);
  }
  writeJSON('vouchers.json', vouchers);

  recordSale({
    voucherId: minted.map(v => v.voucherId).join(', '),
    cert: cert, voucherType: type, qty, amount,
    buyer: body.orgName || body.email || 'Web buyer', buyerEmail: body.email || '',
    source: 'web-purchased', status: 'Assigned'
  });

  logEmail({
    type: 'Voucher Purchase Receipt (Web)',
    to: body.email || 'buyer',
    subject: `Your ${qty} ${type} exam voucher${qty > 1 ? 's' : ''} — receipt ($${amount}) · codes enclosed`
  });

  pushNotification({
    type: 'web_voucher_purchase', icon: 'shopping_cart_checkout', title: 'Online voucher purchase',
    message: `${body.orgName || body.email || 'A web buyer'} purchased ${qty} ${type} voucher${qty > 1 ? 's' : ''} online.`
  });

  sendJSON(res, { success: true, codes: minted.map(v => v.voucherId), type, qty, total: amount, vouchers: minted }, 201);
}

// ============================================================================
// VOUCHER: redeem a code (in-house proctor collects & enters on exam day).
// Flips the voucher to 'Redeemed' and links the exam session. Works for both
// school-assigned and candidate-self-purchased vouchers. The candidate's
// dashboard picks up the 'Redeemed' status to unlock the in-class exam.
// ============================================================================
function handleRedeemVoucherCode(req, res, id, body) {
  const vouchers = readJSON('vouchers.json');
  if (!vouchers) return sendJSON(res, { error: 'Data error' }, 500);

  const idx = vouchers.findIndex(v => v.voucherId === id);
  if (idx === -1) return sendJSON(res, { error: 'not_found', message: `No voucher matches "${id}".` }, 404);

  const v = vouchers[idx];
  if (v.status === 'Redeemed') return sendJSON(res, { error: 'already_redeemed', message: `${id} was already redeemed${v.redeemedAt ? ' on ' + v.redeemedAt.slice(0, 10) : ''}.` }, 409);
  if (v.status === 'Expired' || v.status === 'Revoked') return sendJSON(res, { error: 'invalid_status', message: `${id} is ${v.status} and cannot be redeemed.` }, 409);

  v.status = 'Redeemed';
  if (body && body.sessionId) v.sessionId = body.sessionId;
  v.redeemedAt = new Date().toISOString();
  writeJSON('vouchers.json', vouchers);

  pushNotification({
    type: 'voucher_redeem',
    icon: 'how_to_reg',
    title: 'Voucher redeemed',
    message: `${v.voucherId} (${v.currentType}) was redeemed for the exam session.`
  });
  sendJSON(res, { success: true, voucher: v });
}

// ============================================================================
// BUNDLE: candidate buys a learning material + exam voucher in ONE purchase.
// - Mints a voucher carrying the materialId (one code unlocks both).
// - Self-purchased while logged in  -> auto-ACTIVATED (instant access, no code
//   re-entry). Assigned/gifted seats -> left 'Assigned' until the recipient
//   activates once via the emailed magic link or by entering the code.
// - Upserts the candidate so the enrolled org/proctor roster auto-updates, and
//   records the sale to the SDC sales ledger (sales.json).
// - Emails a receipt + one-click activation magic link.
// ============================================================================
function upsertCandidateForVoucher(voucher, body, statusLabel) {
  const candidates = readJSON('candidates.json') || [];
  const email = (body.email || '').toLowerCase();
  let cand = candidates.find(c =>
    (body.candidateId && c.id === body.candidateId) ||
    (email && c.email && c.email.toLowerCase() === email));

  if (!cand) {
    const seq = candidates.length + 1;
    cand = {
      id: 'cand_' + String(seq).padStart(3, '0'),
      rollNo: 'SELF-' + new Date().getFullYear() + '-' + String(seq).padStart(3, '0'),
      name: body.candidateName || body.name || 'Self-enrolled candidate',
      email: body.email || '',
      subject: body.materialTitle || body.cert || '',
      photo: 'https://via.placeholder.com/150',
      sessionId: body.sessionId || null,
      examStatus: 'enrolled',
      learningProgress: 0,
      aiRisk: 'green',
      enrolledAt: new Date().toISOString(),
      acquisitionSource: voucher.acquisitionSource
    };
    candidates.push(cand);
  }
  cand.voucherCode = voucher.voucherId;
  cand.voucherStatus = statusLabel;          // 'activated' | 'assigned'
  cand.voucherAssignedAt = new Date().toISOString();
  cand.materialEntitlements = Array.from(new Set([...(cand.materialEntitlements || []), voucher.materialId]));
  writeJSON('candidates.json', candidates);
  return cand;
}

function recordSale(entry) {
  const sales = readJSON('sales.json') || [];
  const sale = {
    id: 'sale_' + String(sales.length + 1).padStart(4, '0'),
    soldAt: new Date().toISOString(),
    ...entry
  };
  sales.unshift(sale);
  writeJSON('sales.json', sales);
  return sale;
}

function handleBundlePurchase(req, res, body) {
  const vouchers = readJSON('vouchers.json') || [];
  const type = body.type === 'In-House' ? 'In-House' : 'Internet Proctored';
  // 'assigned' = bought for / allocated to someone else (gift / org seat);
  // anything else is a logged-in self-purchase that activates instantly.
  const source = body.source === 'assigned' ? 'assigned' : 'self-purchased';
  const selfActivated = source === 'self-purchased';
  const amount = Number(body.price) || 0;

  const v = {
    voucherId: 'VCH-B' + String(vouchers.length + 1).padStart(4, '0'),
    sessionId: body.sessionId || null,
    assignedToCandidateId: body.candidateId || null,
    originalType: type,
    currentType: type,
    status: selfActivated ? 'Activated' : 'Assigned',
    upgrade: { isUpgraded: false },
    acquisitionSource: source,
    materialId: body.materialId || null,
    materialTitle: body.materialTitle || null,
    cert: body.cert || null,
    purchasedBy: body.candidateId || body.email || 'candidate',
    purchasedAt: new Date().toISOString(),
    activatedAt: selfActivated ? new Date().toISOString() : null
  };
  vouchers.push(v);
  writeJSON('vouchers.json', vouchers);

  // Org/proctor roster auto-update.
  const cand = upsertCandidateForVoucher(v, body, selfActivated ? 'activated' : 'assigned');

  // SDC sales ledger.
  recordSale({
    voucherId: v.voucherId, materialId: v.materialId, materialTitle: v.materialTitle,
    cert: v.cert, voucherType: type, amount, buyer: cand.name, buyerEmail: cand.email,
    source, status: v.status
  });

  // Receipt + one-click activation magic link (the link auto-activates assigned seats).
  const magicLink = `candidate.html?activate=${v.voucherId}`;
  logEmail({
    type: 'Material + Exam Bundle — Receipt & Access',
    to: cand.email || 'candidate',
    subject: `Your ${v.materialTitle || 'study material'} bundle (${v.voucherId}) — ${selfActivated ? 'access is ready' : 'activate to start'} · ${magicLink}`
  });

  pushNotification({
    type: 'bundle_purchase',
    icon: 'shopping_bag',
    title: 'Material bundle purchased',
    message: `${cand.name} bought ${v.materialTitle || 'a material'} bundle (${v.voucherId}) — voucher ${v.status.toLowerCase()}.`
  });

  sendJSON(res, { success: true, voucherId: v.voucherId, voucher: v, magicLink, activated: selfActivated, candidateId: cand.id }, 201);
}

// ============================================================================
// ACTIVATE: first-time "open" for an ASSIGNED bundle/voucher (magic link or
// code entry). Flips Assigned -> Activated, unlocking material + exam voucher.
// Distinct from redeem (which is the proctor consuming the code on exam day).
// ============================================================================
function handleActivateVoucher(req, res, id, body) {
  const vouchers = readJSON('vouchers.json');
  if (!vouchers) return sendJSON(res, { error: 'Data error' }, 500);

  const v = vouchers.find(x => x.voucherId === id);
  if (!v) return sendJSON(res, { error: 'not_found', message: `No voucher matches "${id}".` }, 404);
  if (v.status === 'Revoked' || v.status === 'Expired') {
    return sendJSON(res, { error: 'invalid_status', message: `${id} is ${v.status} and cannot be activated.` }, 409);
  }

  const wasAssigned = v.status === 'Assigned';
  if (wasAssigned) {
    v.status = 'Activated';
    v.activatedAt = new Date().toISOString();
    writeJSON('vouchers.json', vouchers);
    if (v.materialId) {
      upsertCandidateForVoucher(v, { candidateId: v.assignedToCandidateId, email: body && body.email }, 'activated');
    }
    pushNotification({
      type: 'voucher_activate', icon: 'lock_open', title: 'Access activated',
      message: `${v.voucherId} (${v.materialTitle || v.currentType}) was activated by the candidate.`
    });
  }
  sendJSON(res, { success: true, voucher: v, alreadyActive: !wasAssigned });
}

// ============================================================================
// INCIDENTS
// ============================================================================
function handleGetIncidents(req, res) {
  const incidents = readJSON('incidents.json');
  if (!incidents) return sendJSON(res, { error: 'Data error' }, 500);
  sendJSON(res, incidents);
}

function handleCreateIncident(req, res, body) {
  const { candidateId, alertType, confidence } = body;

  const candidates = readJSON('candidates.json');
  const sessions = readJSON('sessions.json');
  const incidents = readJSON('incidents.json');

  if (!candidates || !sessions || !incidents) {
    return sendJSON(res, { error: 'Data error' }, 500);
  }

  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) {
    return sendJSON(res, { error: 'Candidate not found' }, 404);
  }

  const session = sessions.find(s => s.id === candidate.sessionId) || { name: 'Final Assessment' };

  // Generate new incident alert object
  const newIncident = {
    id: 'af_' + String(incidents.aiFlags.length + 1).padStart(3, '0'),
    candidateId: candidate.id,
    candidateName: candidate.name,
    sessionId: candidate.sessionId,
    sessionName: session.name,
    alertType: alertType || 'Suspicious Activity',
    confidence: confidence || 95,
    timestamp: new Date().toISOString(),
    status: 'pending',
    videoClip: null,
    reviewerNotes: '',
    relatedEvents: []
  };

  incidents.aiFlags.push(newIncident);
  writeJSON('incidents.json', incidents);

  // Update candidate warning count & AI Risk
  candidate.warningCount = (candidate.warningCount || 0) + 1;
  candidate.aiRisk = candidate.warningCount === 0 ? 'green' : (candidate.warningCount < 3 ? 'amber' : 'red');
  candidate.lastActive = new Date().toISOString();

  writeJSON('candidates.json', candidates);

  // Broadcast to all SSE clients
  const sseData = {
    type: 'update',
    candidates: [candidate],
    alert: newIncident,
    timestamp: new Date().toISOString()
  };

  for (const client of sseClients) {
    client.write(`data: ${JSON.stringify(sseData)}\n\n`);
  }

  sendJSON(res, { success: true, incident: newIncident, candidate });
}

function handleUpdateIncident(req, res, type, id, body) {
  const incidents = readJSON('incidents.json');
  if (!incidents) return sendJSON(res, { error: 'Data error' }, 500);

  let collection;
  if (type === 'aiflags') collection = incidents.aiFlags;
  else if (type === 'flagged') collection = incidents.flaggedCases;
  else if (type === 'retakes') collection = incidents.retakeRequests;
  else if (type === 'malpractice') collection = incidents.malpracticeCases;
  else return sendJSON(res, { error: 'Invalid incident type' }, 400);

  const idx = collection.findIndex(i => i.id === id);
  if (idx === -1) return sendJSON(res, { error: 'Incident not found' }, 404);

  if (body.status) collection[idx].status = body.status;
  if (body.reviewerNotes) collection[idx].reviewerNotes = body.reviewerNotes;
  if (body.notes) collection[idx].notes = body.notes;
  if (body.proctorNote) collection[idx].proctorNote = body.proctorNote;
  if (body.retakeDate) collection[idx].retakeDate = body.retakeDate;
  if (body.questionSet) collection[idx].questionSet = body.questionSet;

  collection[idx].updatedAt = new Date().toISOString();
  writeJSON('incidents.json', incidents);
  sendJSON(res, collection[idx]);
}

// ============================================================================
// EARNINGS
// ============================================================================
function handleGetEarnings(req, res) {
  const earnings = readJSON('earnings.json');
  if (!earnings) return sendJSON(res, { error: 'Data error' }, 500);
  sendJSON(res, earnings);
}

// ============================================================================
// SETTINGS (USER PROFILE)
// ============================================================================
function handleGetSettings(req, res) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;
  sendJSON(res, {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    role: u.role,
    organization: u.organization,
    twoFactorEnabled: u.twoFactorEnabled,
    notifications: u.notifications,
    paymentMethod: u.paymentMethod
  });
}

function handleUpdateSettings(req, res, body) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);

  const allowed = ['name', 'phone', 'twoFactorEnabled', 'notifications'];
  allowed.forEach(key => {
    if (body[key] !== undefined) users.currentUser[key] = body[key];
  });
  writeJSON('users.json', users);
  sendJSON(res, { success: true });
}

function handleChangePassword(req, res, body) {
  const { currentPassword, newPassword } = body;
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);

  if (users.currentUser.password !== currentPassword) {
    return sendJSON(res, { error: 'Current password is incorrect' }, 400);
  }
  users.currentUser.password = newPassword;
  writeJSON('users.json', users);
  sendJSON(res, { success: true, message: 'Password changed' });
}

// ============================================================================
// MONITORING — SSE Endpoint
// ============================================================================
const sseClients = new Set();

function handleMonitorStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));

  // Send initial data
  const candidates = readJSON('candidates.json');
  const sessions = readJSON('sessions.json');
  const incidents = readJSON('incidents.json');
  if (candidates && sessions && incidents) {
    const liveSession = sessions.find(s => s.status === 'live');
    if (liveSession) {
      const liveCandidates = candidates.filter(c => c.sessionId === liveSession.id);
      const pendingAlerts = incidents.aiFlags.filter(f => f.status === 'pending' && f.sessionId === liveSession.id);
      res.write(`data: ${JSON.stringify({ type: 'init', session: liveSession, candidates: liveCandidates, alerts: pendingAlerts })}\n\n`);
    }
  }

  // Simulate live updates every 10s
  const interval = setInterval(() => {
    const c = readJSON('candidates.json');
    const s = readJSON('sessions.json');
    if (c && s) {
      const live = s.find(x => x.status === 'live');
      if (live) {
        const liveCands = c.filter(x => x.sessionId === live.id);
        res.write(`data: ${JSON.stringify({ type: 'update', candidates: liveCands, timestamp: new Date().toISOString() })}\n\n`);
      }
    }
  }, 10000);

  req.on('close', () => clearInterval(interval));
}

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================
function handleGetReports(req, res) {
  const sessions = readJSON('sessions.json');
  const candidates = readJSON('candidates.json');
  const incidents = readJSON('incidents.json');
  if (!sessions || !candidates || !incidents) return sendJSON(res, { error: 'Data error' }, 500);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalCandidates = candidates.length;
  const completedExams = candidates.filter(c => c.examStatus === 'completed');
  const avgScore = completedExams.length > 0
    ? Math.round(completedExams.reduce((a, c) => a + (c.examScore || 0), 0) / completedExams.length)
    : 0;

  const totalAiFlags = incidents.aiFlags.length;
  const dismissedFlags = incidents.aiFlags.filter(f => f.status === 'dismissed').length;
  const escalatedFlags = incidents.aiFlags.filter(f => f.status === 'escalated').length;

  sendJSON(res, {
    overview: {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalCandidates,
      completedExams: completedExams.length,
      avgScore,
      passRate: completedExams.length > 0
        ? Math.round((completedExams.filter(c => (c.examScore || 0) >= 60).length / completedExams.length) * 100)
        : 0
    },
    aiStats: {
      totalFlags: totalAiFlags,
      dismissed: dismissedFlags,
      escalated: escalatedFlags,
      pending: incidents.aiFlags.filter(f => f.status === 'pending').length,
      accuracyRate: totalAiFlags > 0 ? Math.round(((totalAiFlags - dismissedFlags) / totalAiFlags) * 100) : 0
    },
    sessionBreakdown: sessions.map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      examDate: s.examDate,
      candidateCount: s.candidateCount,
      vouchersUsed: s.vouchersUsed,
      incidentCount: incidents.aiFlags.filter(f => f.sessionId === s.id).length
    })),
    retakeStats: {
      total: incidents.retakeRequests.length,
      pending: incidents.retakeRequests.filter(r => r.status === 'pending').length,
      approved: incidents.retakeRequests.filter(r => r.status === 'approved').length,
      denied: incidents.retakeRequests.filter(r => r.status === 'denied').length
    }
  });
}

// ============================================================================
// TRAINING MODULE ROUTES (preserved from original)
// ============================================================================
function handleGetModules(req, res) {
  const modules = readJSON('modules.json');
  const users = readJSON('users.json');
  if (!modules || !users) return sendJSON(res, { error: 'Data not found' }, 500);

  const enriched = modules.map(m => ({
    ...m,
    completed: users.currentUser.completedModules.includes(m.id),
    quizScore: users.currentUser.quizScores[m.id] || null,
    contentHtml: undefined
  }));
  sendJSON(res, enriched);
}

function handleGetModule(req, res, id) {
  const modules = readJSON('modules.json');
  const quizzes = readJSON('quizzes.json');
  const users = readJSON('users.json');
  if (!modules || !quizzes || !users) return sendJSON(res, { error: 'Data not found' }, 500);

  const mod = modules.find(m => m.id === parseInt(id));
  if (!mod) return sendJSON(res, { error: 'Module not found' }, 404);

  const quiz = quizzes[id] || [];
  const safeQuiz = quiz.map((q, i) => ({
    id: i,
    q: q.q,
    options: q.options
  }));

  sendJSON(res, {
    ...mod,
    completed: users.currentUser.completedModules.includes(mod.id),
    quizScore: users.currentUser.quizScores[mod.id] || null,
    quiz: safeQuiz,
    totalModules: modules.length
  });
}

function handleGetProgress(req, res) {
  const users = readJSON('users.json');
  const modules = readJSON('modules.json');
  if (!users || !modules) return sendJSON(res, { error: 'Data not found' }, 500);

  const u = users.currentUser;
  const totalModules = modules.length;
  const completedCount = u.completedModules.length;
  const scores = Object.values(u.quizScores);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  sendJSON(res, {
    user: u,
    totalModules,
    completedCount,
    progressPercent: Math.round((completedCount / totalModules) * 100),
    avgScore,
    canCertify: completedCount === totalModules && avgScore >= 80
  });
}

function handlePostProgress(req, res, body) {
  const { moduleId } = body;
  if (!moduleId) return sendJSON(res, { error: 'moduleId required' }, 400);

  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data not found' }, 500);

  if (!users.currentUser.completedModules.includes(moduleId)) {
    users.currentUser.completedModules.push(moduleId);
    users.currentUser.totalXP += 50;
  }

  writeJSON('users.json', users);
  sendJSON(res, { success: true, completedModules: users.currentUser.completedModules, totalXP: users.currentUser.totalXP });
}

function handleQuizSubmit(req, res, moduleId, body) {
  const { answers } = body;
  if (!answers) return sendJSON(res, { error: 'answers required' }, 400);

  const quizzes = readJSON('quizzes.json');
  const users = readJSON('users.json');
  if (!quizzes || !users) return sendJSON(res, { error: 'Data not found' }, 500);

  const quiz = quizzes[moduleId];
  if (!quiz) return sendJSON(res, { error: 'Quiz not found' }, 404);

  let correct = 0;
  const results = quiz.map((q, i) => {
    const isCorrect = answers[i] === q.answer;
    if (isCorrect) correct++;
    return { questionId: i, correct: isCorrect, correctAnswer: q.answer, yourAnswer: answers[i] };
  });

  const score = Math.round((correct / quiz.length) * 100);
  const passed = score >= 80;

  const prevScore = users.currentUser.quizScores[moduleId] || 0;
  if (score > prevScore) {
    users.currentUser.quizScores[moduleId] = score;
  }

  const mid = parseInt(moduleId);
  if (passed && !users.currentUser.completedModules.includes(mid)) {
    users.currentUser.completedModules.push(mid);
    users.currentUser.totalXP += 100;
  } else if (passed) {
    users.currentUser.totalXP += 25;
  }

  writeJSON('users.json', users);

  sendJSON(res, {
    score,
    passed,
    correct,
    total: quiz.length,
    results,
    xpEarned: passed ? (prevScore > 0 ? 25 : 100) : 0
  });
}

function handleGetCertificate(req, res) {
  const users = readJSON('users.json');
  const modules = readJSON('modules.json');
  if (!users || !modules) return sendJSON(res, { error: 'Data not found' }, 500);

  const u = users.currentUser;
  const scores = Object.values(u.quizScores);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  sendJSON(res, {
    certified: u.certified,
    certifiedAt: u.certifiedAt,
    name: u.name,
    completedModules: u.completedModules.length,
    totalModules: modules.length,
    avgScore,
    totalXP: u.totalXP,
    canClaim: u.completedModules.length === modules.length && avgScore >= 80 && !u.certified,
    certId: u.certified ? `SP-CERT-2026-${u.id.replace('usr_', '').toUpperCase()}` : null
  });
}

function handleClaimCertificate(req, res) {
  const users = readJSON('users.json');
  const modules = readJSON('modules.json');
  if (!users || !modules) return sendJSON(res, { error: 'Data not found' }, 500);

  const u = users.currentUser;
  const scores = Object.values(u.quizScores);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  if (u.completedModules.length < modules.length || avgScore < 80) {
    return sendJSON(res, { error: 'Requirements not met.' }, 400);
  }

  users.currentUser.certified = true;
  users.currentUser.certifiedAt = new Date().toISOString();
  users.currentUser.totalXP += 500;
  users.currentUser.role = 'Certified Proctor';
  users.currentUser.hasCompletedTraining = true;
  writeJSON('users.json', users);

  sendJSON(res, {
    success: true,
    certId: `SP-CERT-2026-${u.id.replace('usr_', '').toUpperCase()}`,
    certifiedAt: users.currentUser.certifiedAt
  });
}

function handleGetLeaderboard(req, res) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data not found' }, 500);

  const board = users.leaderboard.map((entry, idx) => ({
    rank: idx + 1,
    ...entry
  }));

  const u = users.currentUser;
  const scores = Object.values(u.quizScores);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  sendJSON(res, {
    leaderboard: board,
    currentUser: {
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      xp: u.totalXP,
      modulesCompleted: u.completedModules.length,
      avgScore,
      certified: u.certified,
      rank: board.findIndex(b => b.id === u.id) + 1 || board.length + 1
    }
  });
}

function handleGetStats(req, res) {
  const users = readJSON('users.json');
  const modules = readJSON('modules.json');
  if (!users || !modules) return sendJSON(res, { error: 'Data not found' }, 500);

  const u = users.currentUser;
  const scores = Object.values(u.quizScores);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const totalTime = u.completedModules.length * 10;

  sendJSON(res, {
    completedModules: u.completedModules.length,
    totalModules: modules.length,
    progressPercent: Math.round((u.completedModules.length / modules.length) * 100),
    avgScore,
    totalXP: u.totalXP,
    totalTime,
    certified: u.certified,
    rank: users.leaderboard.findIndex(b => b.id === u.id) + 1 || users.leaderboard.length + 1,
    nextModule: modules.find(m => !u.completedModules.includes(m.id)) || null
  });
}

function handleReset(req, res) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data not found' }, 500);

  users.currentUser.completedModules = [];
  users.currentUser.quizScores = {};
  users.currentUser.certified = false;
  users.currentUser.certifiedAt = null;
  users.currentUser.totalXP = 0;
  users.currentUser.role = 'Proctor Trainee';
  users.currentUser.hasCompletedTraining = false;
  users.leaderboard = users.leaderboard.filter(e => e.id !== users.currentUser.id);
  writeJSON('users.json', users);
  sendJSON(res, { success: true });
}

// ============================================================================
// NOTIFICATIONS & SYSTEM EMAILS (shared helpers)
// ============================================================================
function pushNotification({ type, icon, title, message }) {
  const list = readJSON('notifications.json') || [];
  const ntf = {
    id: 'ntf_' + String(list.length + 1).padStart(3, '0'),
    type,
    icon: icon || 'notifications',
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false
  };
  list.unshift(ntf);
  writeJSON('notifications.json', list);
  return ntf;
}

function logEmail({ type, to, subject }) {
  const list = readJSON('sent_emails.json') || [];
  const eml = {
    id: 'eml_' + String(list.length + 1).padStart(3, '0'),
    type,
    to,
    subject,
    sentAt: new Date().toISOString(),
    status: 'Delivered'
  };
  list.unshift(eml);
  writeJSON('sent_emails.json', list);
  console.log(`📧 [SYSTEM EMAIL] ${type} → ${to}: ${subject}`);
  return eml;
}

function handleGetNotifications(req, res) {
  const list = readJSON('notifications.json') || [];
  sendJSON(res, list);
}

function handleMarkNotificationRead(req, res, id, body) {
  const list = readJSON('notifications.json') || [];
  if (id === 'all') {
    list.forEach(n => { n.read = true; });
  } else {
    const n = list.find(x => x.id === id);
    if (n) n.read = (body.read !== undefined ? body.read : true);
  }
  writeJSON('notifications.json', list);
  sendJSON(res, list);
}

function handleGetEmails(req, res) {
  const list = readJSON('sent_emails.json') || [];
  sendJSON(res, list);
}

// ============================================================================
// PERMISSIONS (delegated admin rights, granted by Org Admin)
// ============================================================================
const PERMISSION_KEYS = ['createClasses', 'manageEnrollments', 'assignVouchers', 'purchaseVouchers'];

function handleGetPermissions(req, res) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;
  sendJSON(res, {
    permissions: u.permissions || {},
    grantedBy: u.permissionsGrantedBy || null,
    grantedAt: u.permissionsGrantedAt || null
  });
}

function handleUpdatePermissions(req, res, body) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;
  u.permissions = u.permissions || {};
  PERMISSION_KEYS.forEach(k => {
    if (body[k] !== undefined) u.permissions[k] = !!body[k];
  });
  if (body.grantedBy) u.permissionsGrantedBy = body.grantedBy;
  u.permissionsGrantedAt = new Date().toISOString();
  writeJSON('users.json', users);

  pushNotification({
    type: 'rights_granted',
    icon: 'admin_panel_settings',
    title: 'Admin rights updated',
    message: `Your delegated rights were updated by ${u.permissionsGrantedBy || 'the organization admin'}.`
  });
  logEmail({
    type: 'Admin Rights Granted',
    to: u.email,
    subject: 'Your account permissions have been updated'
  });
  sendJSON(res, { success: true, permissions: u.permissions, grantedBy: u.permissionsGrantedBy, grantedAt: u.permissionsGrantedAt });
}

// ============================================================================
// PROCTOR LICENSE (renewal via proctor_auth flow)
// ============================================================================
function handleGetLicense(req, res) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;
  const lic = u.license || null;
  let status = 'none';
  if (lic) {
    const exp = new Date(lic.expiresAt);
    const now = new Date();
    const days = Math.ceil((exp - now) / (24 * 60 * 60 * 1000));
    status = days < 0 ? 'expired' : (days <= 30 ? 'expiring' : 'active');
    lic.status = status;
    lic.daysToExpiry = days;
  }
  sendJSON(res, { license: lic });
}

function handleRenewLicense(req, res, body) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;

  const now = new Date();
  const expires = new Date(now.getTime());
  expires.setFullYear(expires.getFullYear() + 1);

  const existingNum = (u.license && u.license.number) || ('LIC-2026-' + String(Math.floor(Math.random() * 9000) + 1000));
  u.license = {
    number: existingNum,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'active'
  };
  writeJSON('users.json', users);

  pushNotification({
    type: 'license_renewed',
    icon: 'verified',
    title: 'License renewed',
    message: `License ${u.license.number} renewed. Valid until ${expires.toLocaleDateString()}.`
  });
  logEmail({
    type: 'Proctor License Renewed',
    to: u.email,
    subject: `Proctor license ${u.license.number} renewed — valid until ${expires.toLocaleDateString()}`
  });
  sendJSON(res, { success: true, license: u.license });
}

// ============================================================================
// PROCTOR CODE (in-class proctor certification — issued on signup approval)
// ============================================================================
// Computes live status/daysToExpiry for a stored proctor code, mirroring
// handleGetLicense. A deactivated code keeps its status regardless of expiry.
function decorateProctorCode(code) {
  if (!code) return null;
  if (code.status !== 'deactivated') {
    const exp = new Date(code.expiresAt);
    const now = new Date();
    const days = Math.ceil((exp - now) / (24 * 60 * 60 * 1000));
    code.daysToExpiry = days;
    code.status = days < 0 ? 'expired' : (days <= 30 ? 'expiring' : 'active');
  } else {
    code.daysToExpiry = null;
  }
  return code;
}

function handleGetProctorCode(req, res) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const code = decorateProctorCode(users.currentUser.proctorCode || null);
  sendJSON(res, { code });
}

function handleIssueProctorCode(req, res, body) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;
  const codes = readJSON('proctor_codes.json') || [];

  const now = new Date();
  const expires = new Date(now.getTime());
  expires.setFullYear(expires.getFullYear() + 1);

  const name = [body.firstName, body.lastName].filter(Boolean).join(' ').trim() || u.name;
  const code = {
    codeId: 'SDC-PRC-' + String(codes.length + 1).padStart(4, '0'),
    proctorId: u.id,
    proctorName: name,
    proctorEmail: body.email || u.email,
    proctorPhone: body.phone || '',
    course: body.course || '',
    courseId: body.courseId || '',
    clearanceLevel: 'physical_only',
    status: 'active',
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    renewalCount: 0,
    deactivatedAt: null
  };

  codes.push(code);
  writeJSON('proctor_codes.json', codes);

  u.proctorCode = code;
  u.hasCompletedTraining = true;
  u.accountStatus = 'active';
  writeJSON('users.json', users);

  pushNotification({
    type: 'proctor_code_issued',
    icon: 'verified',
    title: 'Proctor code issued',
    message: `Proctor code ${code.codeId} issued for ${code.course || 'general proctoring'}. Valid until ${expires.toLocaleDateString()}.`
  });
  logEmail({
    type: 'Proctor Code Issued',
    to: code.proctorEmail,
    subject: `Your SDC proctor code ${code.codeId} — valid until ${expires.toLocaleDateString()}`
  });

  sendJSON(res, { success: true, code: decorateProctorCode(code) }, 201);
}

function handleRenewProctorCode(req, res, body) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;
  const code = u.proctorCode;
  if (!code) return sendJSON(res, { error: 'No proctor code to renew' }, 404);

  const now = new Date();
  const expires = new Date(now.getTime());
  expires.setFullYear(expires.getFullYear() + 1);
  code.issuedAt = now.toISOString();
  code.expiresAt = expires.toISOString();
  code.status = 'active';
  code.deactivatedAt = null;
  code.renewalCount = (code.renewalCount || 0) + 1;

  // Sync the ledger entry.
  const codes = readJSON('proctor_codes.json') || [];
  const idx = codes.findIndex(c => c.codeId === code.codeId);
  if (idx !== -1) codes[idx] = code;
  writeJSON('proctor_codes.json', codes);
  writeJSON('users.json', users);

  pushNotification({
    type: 'proctor_code_renewed',
    icon: 'verified',
    title: 'Proctor code renewed',
    message: `Proctor code ${code.codeId} renewed. Valid until ${expires.toLocaleDateString()}.`
  });
  logEmail({
    type: 'Proctor Code Renewed',
    to: code.proctorEmail,
    subject: `Proctor code ${code.codeId} renewed — valid until ${expires.toLocaleDateString()}`
  });

  sendJSON(res, { success: true, code: decorateProctorCode(code) });
}

function handleDeactivateProctorCode(req, res, body) {
  const users = readJSON('users.json');
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);
  const u = users.currentUser;
  const code = u.proctorCode;
  if (!code) return sendJSON(res, { error: 'No proctor code to deactivate' }, 404);

  code.status = 'deactivated';
  code.deactivatedAt = new Date().toISOString();
  code.daysToExpiry = null;

  const codes = readJSON('proctor_codes.json') || [];
  const idx = codes.findIndex(c => c.codeId === code.codeId);
  if (idx !== -1) codes[idx] = code;
  writeJSON('proctor_codes.json', codes);
  writeJSON('users.json', users);

  pushNotification({
    type: 'proctor_code_deactivated',
    icon: 'block',
    title: 'Proctor code deactivated',
    message: `Proctor code ${code.codeId} has been deactivated.`
  });

  sendJSON(res, { success: true, code });
}

// ============================================================================
// CANDIDATE CREATION (add new candidate to the candidate list — F6)
// ============================================================================
function handleCreateCandidate(req, res, body) {
  const candidates = readJSON('candidates.json');
  if (!candidates) return sendJSON(res, { error: 'Data error' }, 500);

  if (!body.name || !body.email) {
    return sendJSON(res, { error: 'Name and email are required' }, 400);
  }

  // Detect existing candidate with the same email (duplicate identity — F3)
  const dup = candidates.find(c => c.email.toLowerCase() === body.email.toLowerCase());

  const seq = candidates.length + 1;
  const newCand = {
    id: 'cand_' + String(seq).padStart(3, '0'),
    rollNo: body.rollNo || ('NEW-' + new Date().getFullYear() + '-' + String(seq).padStart(3, '0')),
    name: body.name,
    email: body.email,
    subject: body.subject || '',
    course: body.course || body.subject || '',
    photo: body.photo || 'https://via.placeholder.com/150',
    sessionId: body.sessionId || null,
    voucherCode: null,
    voucherStatus: 'unassigned',
    voucherAssignedAt: null,
    examStatus: 'enrolled',
    learningProgress: 0,
    lastActive: new Date().toISOString(),
    currentQuestion: 0,
    totalQuestions: 40,
    timeRemaining: 0,
    warningCount: 0,
    aiRisk: 'green',
    enrolledAt: new Date().toISOString(),
    examScore: 0
  };
  candidates.push(newCand);
  writeJSON('candidates.json', candidates);

  pushNotification({
    type: 'candidate_added',
    icon: 'person_add',
    title: 'Candidate added',
    message: `${newCand.name} was added to the candidate list.`
  });

  sendJSON(res, { success: true, candidate: newCand, duplicateEmail: dup ? { id: dup.id, name: dup.name, voucherCode: dup.voucherCode || null } : null }, 201);
}

// ============================================================================
// VOUCHER: email association check (F3)
// ============================================================================
function handleCheckEmailVoucher(req, res, query) {
  const email = (query.email || '').toLowerCase();
  if (!email) return sendJSON(res, { error: 'email required' }, 400);
  const candidates = readJSON('candidates.json') || [];
  const matches = candidates.filter(c => c.email.toLowerCase() === email && c.voucherCode);
  sendJSON(res, {
    hasVoucher: matches.length > 0,
    vouchers: matches.map(c => ({ candidateId: c.id, candidateName: c.name, voucherCode: c.voucherCode, voucherStatus: c.voucherStatus }))
  });
}

// ============================================================================
// VOUCHER: redeem for a candidate — only if learning material NOT started (F1)
// ============================================================================
function handleRedeemVoucher(req, res, candidateId) {
  const candidates = readJSON('candidates.json');
  const vouchers = readJSON('vouchers.json') || [];
  if (!candidates) return sendJSON(res, { error: 'Data error' }, 500);

  const c = candidates.find(x => x.id === candidateId);
  if (!c) return sendJSON(res, { error: 'Candidate not found' }, 404);
  if (!c.voucherCode) return sendJSON(res, { error: 'No voucher assigned to this candidate' }, 400);

  // GATE: cannot redeem once the student has started using learning material
  if ((c.learningProgress || 0) > 0) {
    return sendJSON(res, {
      error: 'learning_started',
      message: `${c.name} has already started the learning material (${c.learningProgress}% complete). The voucher can no longer be redeemed.`
    }, 409);
  }

  c.voucherStatus = 'redeemed';
  c.voucherAssignedAt = c.voucherAssignedAt || new Date().toISOString();
  const v = vouchers.find(x => x.voucherId === c.voucherCode);
  if (v) v.status = 'Redeemed';

  writeJSON('candidates.json', candidates);
  writeJSON('vouchers.json', vouchers);

  pushNotification({
    type: 'voucher_redeemed',
    icon: 'local_activity',
    title: 'Voucher redeemed',
    message: `Voucher ${c.voucherCode} redeemed for ${c.name}.`
  });
  logEmail({
    type: 'Voucher Redeemed Confirmation',
    to: c.email,
    subject: `Your exam voucher ${c.voucherCode} has been redeemed`
  });
  sendJSON(res, { success: true, candidate: c });
}

// ============================================================================
// VOUCHER: replace a candidate's voucher by request, auto-verified by rules (F2)
// ============================================================================
function handleReplaceVoucher(req, res, body) {
  const { candidateId, newVoucherId } = body;
  const candidates = readJSON('candidates.json');
  const vouchers = readJSON('vouchers.json') || [];
  if (!candidates) return sendJSON(res, { error: 'Data error' }, 500);

  const c = candidates.find(x => x.id === candidateId);
  if (!c) return sendJSON(res, { error: 'Candidate not found' }, 404);

  const newV = vouchers.find(v => v.voucherId === newVoucherId);
  const oldV = vouchers.find(v => v.voucherId === c.voucherCode);

  // --- Auto-verification rules ---
  const checks = [];
  checks.push({ rule: 'Voucher exists', pass: !!newV });
  checks.push({ rule: 'Voucher is available / unused', pass: !!newV && newV.status === 'Available' });
  checks.push({ rule: 'Not assigned to another candidate', pass: !!newV && (!newV.assignedToCandidateId || newV.assignedToCandidateId === c.id) });
  checks.push({ rule: 'Matches certification type', pass: !!newV && (!oldV || newV.originalType === oldV.originalType) });

  const verified = checks.every(ck => ck.pass);
  if (!verified) {
    return sendJSON(res, { success: false, verified: false, checks, message: 'Replacement voucher failed verification.' }, 422);
  }

  // Release the old voucher, bind the new one
  if (oldV) {
    oldV.status = 'Revoked';
    oldV.assignedToCandidateId = null;
    oldV.replacedBy = newV.voucherId;
  }
  newV.status = 'Assigned';
  newV.assignedToCandidateId = c.id;
  newV.sessionId = c.sessionId || newV.sessionId;
  newV.replaces = c.voucherCode || null;

  c.voucherCode = newV.voucherId;
  c.voucherStatus = 'assigned';
  c.voucherAssignedAt = new Date().toISOString();

  writeJSON('vouchers.json', vouchers);
  writeJSON('candidates.json', candidates);

  pushNotification({
    type: 'voucher_replaced',
    icon: 'swap_horiz',
    title: 'Voucher replaced',
    message: `${c.name}'s voucher was verified and replaced with ${newV.voucherId}.`
  });
  logEmail({
    type: 'Voucher Replacement Verified',
    to: c.email,
    subject: `Your voucher has been replaced with ${newV.voucherId}`
  });
  sendJSON(res, { success: true, verified: true, checks, candidate: c, voucher: newV });
}

// ============================================================================
// VOUCHER: purchase (delegated admin right — F7)
// ============================================================================
function handlePurchaseVouchers(req, res, body) {
  const users = readJSON('users.json');
  const vouchers = readJSON('vouchers.json') || [];
  if (!users) return sendJSON(res, { error: 'Data error' }, 500);

  const u = users.currentUser;
  if (!u.permissions || !u.permissions.purchaseVouchers) {
    return sendJSON(res, { error: 'forbidden', message: 'You do not have permission to purchase vouchers. Ask your organization admin to grant this right.' }, 403);
  }

  const qty = Math.max(1, parseInt(body.qty) || 0);
  const type = body.type || 'In-House';
  const unitPrice = 42;
  const created = [];
  for (let i = 0; i < qty; i++) {
    const v = {
      voucherId: 'VCH-P' + String(vouchers.length + 1 + i).padStart(4, '0'),
      sessionId: null,
      assignedToCandidateId: null,
      originalType: type,
      currentType: type,
      status: 'Available',
      upgrade: { isUpgraded: false },
      acquisitionSource: 'assigned',
      purchasedBy: u.id,
      purchasedAt: new Date().toISOString()
    };
    vouchers.push(v);
    created.push(v.voucherId);
  }
  writeJSON('vouchers.json', vouchers);

  const total = qty * unitPrice;
  pushNotification({
    type: 'voucher_purchase',
    icon: 'shopping_cart',
    title: 'Vouchers purchased',
    message: `${qty} ${type} voucher(s) added to inventory ($${total}).`
  });
  logEmail({
    type: 'Voucher Purchase Receipt',
    to: u.email,
    subject: `Receipt: ${qty} voucher(s) purchased — $${total}`
  });
  sendJSON(res, { success: true, qty, total, created }, 201);
}

const requestHandler = async (req, res) => {
  
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ---- API ROUTES ----
  if (pathname.startsWith('/api/')) {
    try {
      // AUTH
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleLogin(req, res, body);
      }
      if (pathname === '/api/auth/logout' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleLogout(req, res, body);
      }
      if (pathname === '/api/auth/forgot' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleForgotPassword(req, res, body);
      }
      if (pathname === '/api/auth/reset' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleResetPassword(req, res, body);
      }

      // USER FLAGS
      if (pathname === '/api/user/flags' && req.method === 'GET') return handleGetFlags(req, res);
      if (pathname === '/api/user/training' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleUpdateTraining(req, res, body);
      }

      // DASHBOARD
      if (pathname === '/api/dashboard' && req.method === 'GET') return handleDashboardStats(req, res);

      // SESSIONS
      if (pathname === '/api/sessions' && req.method === 'GET') return handleGetSessions(req, res);
      if (pathname === '/api/sessions' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleCreateSession(req, res, body);
      }
      const sessMatch = pathname.match(/^\/api\/sessions\/(\w+)$/);
      if (sessMatch && req.method === 'GET') return handleGetSession(req, res, sessMatch[1]);
      if (sessMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
        const body = await parseBody(req);
        return handleUpdateSession(req, res, sessMatch[1], body);
      }

      // CANDIDATES
      if (pathname === '/api/candidates' && req.method === 'GET') return handleGetCandidates(req, res, query);
      if (pathname === '/api/candidates' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleCreateCandidate(req, res, body);
      }
      // Redeem a candidate's voucher (only if learning not started — F1)
      const redeemMatch = pathname.match(/^\/api\/candidates\/(\w+)\/redeem-voucher$/);
      if (redeemMatch && req.method === 'POST') return handleRedeemVoucher(req, res, redeemMatch[1]);
      const candMatch = pathname.match(/^\/api\/candidates\/(\w+)$/);
      if (candMatch && req.method === 'GET') return handleGetCandidate(req, res, candMatch[1]);
      if (candMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
        const body = await parseBody(req);
        return handleUpdateCandidate(req, res, candMatch[1], body);
      }

      // VOUCHERS
      if (pathname === '/api/vouchers' && req.method === 'GET') return handleGetVouchers(req, res);
      if (pathname === '/api/vouchers/check-email' && req.method === 'GET') return handleCheckEmailVoucher(req, res, query);
      if (pathname === '/api/vouchers/replace' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleReplaceVoucher(req, res, body);
      }
      if (pathname === '/api/vouchers/purchase' && req.method === 'POST') {
        const body = await parseBody(req);
        return handlePurchaseVouchers(req, res, body);
      }
      if (pathname === '/api/vouchers/self-purchase' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleSelfPurchaseVoucher(req, res, body);
      }
      if (pathname === '/api/vouchers/web-purchase' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleWebPurchaseVoucher(req, res, body);
      }
      // BUNDLE: candidate buys learning material + exam voucher together.
      if (pathname === '/api/bundles/purchase' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleBundlePurchase(req, res, body);
      }
      // ASSIGN: persist a system-assigned voucher created on candidate add.
      if (pathname === '/api/vouchers/assign' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleAssignVoucher(req, res, body);
      }
      // ACTIVATE: first-time open of an assigned bundle (magic link / code entry).
      const voucherActivateMatch = pathname.match(/^\/api\/vouchers\/([\w-]+)\/activate$/);
      if (voucherActivateMatch && (req.method === 'POST' || req.method === 'PUT')) {
        const body = await parseBody(req);
        return handleActivateVoucher(req, res, voucherActivateMatch[1], body);
      }
      const voucherRedeemMatch = pathname.match(/^\/api\/vouchers\/([\w-]+)\/redeem$/);
      if (voucherRedeemMatch && req.method === 'POST') {
        const body = await parseBody(req);
        return handleRedeemVoucherCode(req, res, voucherRedeemMatch[1], body);
      }
      const voucherMatch = pathname.match(/^\/api\/vouchers\/([\w-]+)\/upgrade$/);
      if (voucherMatch && req.method === 'POST') {
        const body = await parseBody(req);
        return handleUpgradeVoucher(req, res, voucherMatch[1], body);
      }

      // PERMISSIONS (delegated admin rights — F7)
      if (pathname === '/api/permissions' && req.method === 'GET') return handleGetPermissions(req, res);
      if (pathname === '/api/permissions' && (req.method === 'PUT' || req.method === 'PATCH')) {
        const body = await parseBody(req);
        return handleUpdatePermissions(req, res, body);
      }

      // LICENSE (F4)
      if (pathname === '/api/license' && req.method === 'GET') return handleGetLicense(req, res);
      if (pathname === '/api/license/renew' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleRenewLicense(req, res, body);
      }

      // PROCTOR CODE (in-class proctor certification)
      if (pathname === '/api/proctor-code' && req.method === 'GET') return handleGetProctorCode(req, res);
      if (pathname === '/api/proctor-code/issue' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleIssueProctorCode(req, res, body);
      }
      if (pathname === '/api/proctor-code/renew' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleRenewProctorCode(req, res, body);
      }
      if (pathname === '/api/proctor-code/deactivate' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleDeactivateProctorCode(req, res, body);
      }

      // NOTIFICATIONS & SYSTEM EMAILS
      if (pathname === '/api/notifications' && req.method === 'GET') return handleGetNotifications(req, res);
      const ntfMatch = pathname.match(/^\/api\/notifications\/([\w-]+)\/read$/);
      if (ntfMatch && (req.method === 'PUT' || req.method === 'POST')) {
        const body = await parseBody(req);
        return handleMarkNotificationRead(req, res, ntfMatch[1], body);
      }
      if (pathname === '/api/emails' && req.method === 'GET') return handleGetEmails(req, res);

      // INCIDENTS
      if (pathname === '/api/incidents' && req.method === 'GET') return handleGetIncidents(req, res);
      if (pathname === '/api/incidents' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleCreateIncident(req, res, body);
      }
      const incMatch = pathname.match(/^\/api\/incidents\/(\w+)\/(\w+)$/);
      if (incMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
        const body = await parseBody(req);
        return handleUpdateIncident(req, res, incMatch[1], incMatch[2], body);
      }

      // EARNINGS
      if (pathname === '/api/earnings' && req.method === 'GET') return handleGetEarnings(req, res);

      // REPORTS
      if (pathname === '/api/reports' && req.method === 'GET') return handleGetReports(req, res);

      // SETTINGS
      if (pathname === '/api/settings' && req.method === 'GET') return handleGetSettings(req, res);
      if (pathname === '/api/settings' && (req.method === 'PUT' || req.method === 'PATCH')) {
        const body = await parseBody(req);
        return handleUpdateSettings(req, res, body);
      }
      if (pathname === '/api/settings/password' && req.method === 'POST') {
        const body = await parseBody(req);
        return handleChangePassword(req, res, body);
      }

      // MONITORING SSE
      if (pathname === '/api/monitor/stream' && req.method === 'GET') return handleMonitorStream(req, res);

      // TRAINING MODULE ROUTES (preserved)
      if (pathname === '/api/modules' && req.method === 'GET') return handleGetModules(req, res);
      const moduleMatch = pathname.match(/^\/api\/modules\/(\d+)$/);
      if (moduleMatch && req.method === 'GET') return handleGetModule(req, res, moduleMatch[1]);
      if (pathname === '/api/progress' && req.method === 'GET') return handleGetProgress(req, res);
      if (pathname === '/api/progress' && req.method === 'POST') {
        const body = await parseBody(req);
        return handlePostProgress(req, res, body);
      }
      const quizMatch = pathname.match(/^\/api\/quiz\/(\d+)\/submit$/);
      if (quizMatch && req.method === 'POST') {
        const body = await parseBody(req);
        return handleQuizSubmit(req, res, quizMatch[1], body);
      }
      if (pathname === '/api/certificate' && req.method === 'GET') return handleGetCertificate(req, res);
      if (pathname === '/api/certificate/claim' && req.method === 'POST') return handleClaimCertificate(req, res);
      if (pathname === '/api/leaderboard' && req.method === 'GET') return handleGetLeaderboard(req, res);
      if (pathname === '/api/stats' && req.method === 'GET') return handleGetStats(req, res);
      if (pathname === '/api/reset' && req.method === 'POST') return handleReset(req, res);

      return sendJSON(res, { error: 'API endpoint not found' }, 404);
    } catch (e) {
      console.error('API Error:', e);
      return sendJSON(res, { error: 'Internal server error' }, 500);
    }
  }

  let reqUrl = pathname;
  

  if (reqUrl.includes('#')) {
    reqUrl = reqUrl.split('#')[0];
  }

  // Determine default HTML based on port
  const port = req.socket.localPort;
  let defaultHtml = 'index.html';

  if (port === 3002) {
    defaultHtml = 'online_proctor.html';
  } else if (port === 3003) {
    defaultHtml = 'candidate.html';
  } else if (port === 3004) {
    defaultHtml = 'voucher_ledger.html';
  } else if (port === 3005) {
    defaultHtml = 'super_admin_3005.html';
  } else if (port === 3006) {
    defaultHtml = 'org_admin.html';
  } else if (port === 3009) {
    defaultHtml = 'admin_portal.html';
  } else if (port === 3010) {
    defaultHtml = 'landing_page.html';
  } else if (port === 3011) {
    defaultHtml = 'automated_emails.html';
  }

  // Handle default route
  let filePath = path.join(BASE_DIR, reqUrl === '/' ? defaultHtml : reqUrl);
  
  // Prevent directory traversal attacks
  if (!filePath.startsWith(BASE_DIR)) {
    res.statusCode = 403;
    res.end('403 Forbidden: Directory traversal is not allowed.');
    return;
  }

  const serveFinalFile = (finalPath) => {
    const ext = path.extname(finalPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    
    // Add cache control to prevent browser caching during development
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Security-Policy', "default-src * data: blob: 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';");

    const stream = fs.createReadStream(finalPath);
    stream.on('error', (streamErr) => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`500 Internal Server Error: ${streamErr.message}`);
    });
    stream.pipe(res);
  };

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (reqUrl !== '/' && !path.extname(reqUrl)) {
        // Try slug + .html
        const slugPath = path.join(BASE_DIR, reqUrl + '.html');
        fs.stat(slugPath, (err2, stats2) => {
          if (!err2 && stats2.isFile()) {
            serveFinalFile(slugPath);
          } else {
            // Fallback for SPA router
            serveFinalFile(path.join(BASE_DIR, defaultHtml));
          }
        });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`404 Not Found: ${req.url}`);
      }
    } else {
      serveFinalFile(filePath);
    }
  });
};

console.log(`================================================================`);
console.log(`🚀 Exam Proctoring Application Developer Server Started Successfully!`);
console.log(`📂 Workspace Root: ${BASE_DIR}`);

PORTS.forEach(port => {
  const server = http.createServer(requestHandler);
  server.listen(port, () => {
    console.log(`🔗 Local Access: http://localhost:${port}/`);
  });
});
console.log(`================================================================`);
