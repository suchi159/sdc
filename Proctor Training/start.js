const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3003;
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

  const allowed = ['name', 'examDate', 'startTime', 'duration', 'status', 'allowRetake', 'maxRetakeAttempts', 'retakeWindow'];
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

// ============================================================================
// INCIDENTS
// ============================================================================
function handleGetIncidents(req, res) {
  const incidents = readJSON('incidents.json');
  if (!incidents) return sendJSON(res, { error: 'Data error' }, 500);
  sendJSON(res, incidents);
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
  users.leaderboard = users.leaderboard.filter(e => e.id !== users.currentUser.id);
  writeJSON('users.json', users);
  sendJSON(res, { success: true });
}


// ============================================================================
// HTTP SERVER
// ============================================================================
const server = http.createServer(async (req, res) => {
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
      const candMatch = pathname.match(/^\/api\/candidates\/(\w+)$/);
      if (candMatch && req.method === 'GET') return handleGetCandidate(req, res, candMatch[1]);

      // INCIDENTS
      if (pathname === '/api/incidents' && req.method === 'GET') return handleGetIncidents(req, res);
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

  // ---- STATIC FILES ----
  let reqUrl = pathname;
  if (reqUrl.includes('?')) reqUrl = reqUrl.split('?')[0];
  if (reqUrl.includes('#')) reqUrl = reqUrl.split('#')[0];

  let filePath = path.join(BASE_DIR, reqUrl === '/' ? 'index.html' : reqUrl);

  if (!filePath.startsWith(BASE_DIR)) {
    res.statusCode = 403;
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (!path.extname(reqUrl)) {
        filePath = path.join(BASE_DIR, 'index.html');
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        return res.end(`404 Not Found: ${req.url}`);
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`500 Internal Server Error: ${streamErr.message}`);
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🎓 SecureProctor AI — Proctor Platform Server`);
  console.log(`🔗 Local Access: http://localhost:${PORT}/`);
  console.log(`📂 Workspace Root: ${BASE_DIR}`);
  console.log(`🔌 API Endpoints: http://localhost:${PORT}/api/`);
  console.log(`================================================================`);
});
