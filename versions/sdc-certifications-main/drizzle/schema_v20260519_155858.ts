import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── USERS & MULTI-TENANCY ─────────────────────────────────────────────────

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logoUrl"),
  industry: varchar("industry", { length: 100 }),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise", "api_saas"]).default("starter").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "trial"]).default("trial").notNull(),
  settings: json("settings"),
  apiKey: varchar("apiKey", { length: 128 }).unique(),
  webhookUrl: text("webhookUrl"),
  onboardingStep: int("onboardingStep").default(1).notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  onboardingData: json("onboardingData"),
  size: varchar("size", { length: 50 }),
  website: varchar("website", { length: 255 }),
  primaryColor: varchar("primaryColor", { length: 20 }).default("#c8972a"),
  subdomain: varchar("subdomain", { length: 100 }).unique(),
  featuresEnabled: json("featuresEnabled"),
  examConfig: json("examConfig"),
  notificationPrefs: json("notificationPrefs"),
  monthlyBudget: int("monthlyBudget"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  orgId: int("orgId"),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
  role: mysqlEnum("role", ["super_admin", "org_admin", "psychometrician", "exam_developer", "instructor", "proctor", "candidate", "user", "admin"]).default("candidate").notNull(),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  twoFactorSecret: varchar("twoFactorSecret", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CREDENTIALS & OPEN BADGE 2.0 ─────────────────────────────────────────

export const credentialTemplates = mysqlTable("credential_templates", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  badgeImageUrl: text("badgeImageUrl"),
  criteria: text("criteria"),
  skills: json("skills"),
  validityMonths: int("validityMonths"),
  isAnsiAligned: boolean("isAnsiAligned").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const credentials = mysqlTable("credentials", {
  id: int("id").autoincrement().primaryKey(),
  credentialId: varchar("credentialId", { length: 64 }).notNull().unique(),
  orgId: int("orgId").notNull(),
  candidateId: int("candidateId").notNull(),
  templateId: int("templateId").notNull(),
  examId: int("examId"),
  status: mysqlEnum("status", ["active", "expired", "revoked", "suspended"]).default("active").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  expiryDate: timestamp("expiryDate"),
  badgeJson: json("badgeJson"),
  cryptoSignature: text("cryptoSignature"),
  pdfUrl: text("pdfUrl"),
  walletCardUrl: text("walletCardUrl"),
  linkedinShared: boolean("linkedinShared").default(false),
  verificationUrl: text("verificationUrl"),
  revokedAt: timestamp("revokedAt"),
  revokedReason: text("revokedReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── EXAM ENGINE ──────────────────────────────────────────────────────────

export const questionCategories = mysqlTable("question_categories", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  parentId: int("parentId"),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  categoryId: int("categoryId"),
  createdBy: int("createdBy").notNull(),
  version: int("version").default(1).notNull(),
  parentQuestionId: int("parentQuestionId"),
  type: mysqlEnum("type", ["mcq", "multi_select", "true_false", "short_answer", "essay", "drag_drop", "image_hotspot", "code_snippet"]).notNull(),
  stem: text("stem").notNull(),
  options: json("options"),
  correctAnswer: json("correctAnswer"),
  explanation: text("explanation"),
  difficulty: int("difficulty").default(3),
  tags: json("tags"),
  industryTemplate: varchar("industryTemplate", { length: 100 }),
  mediaUrl: text("mediaUrl"),
  irtA: decimal("irtA", { precision: 5, scale: 3 }),
  irtB: decimal("irtB", { precision: 5, scale: 3 }),
  irtC: decimal("irtC", { precision: 5, scale: 3 }),
  pValue: decimal("pValue", { precision: 5, scale: 4 }),
  pointBiserial: decimal("pointBiserial", { precision: 5, scale: 4 }),
  flaggedForReview: boolean("flaggedForReview").default(false),
  flagReason: text("flagReason"),
  aiSuggestion: text("aiSuggestion"),
  workflowStage: mysqlEnum("workflowStage", ["draft", "expert_review", "qa_review", "approved", "published", "archived"]).default("draft").notNull(),
  enemySimilarity: decimal("enemySimilarity", { precision: 5, scale: 4 }),
  enemyItemIds: json("enemyItemIds"),
  status: mysqlEnum("status", ["draft", "active", "archived", "flagged"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  createdBy: int("createdBy").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  industry: varchar("industry", { length: 100 }),
  passingScore: decimal("passingScore", { precision: 5, scale: 2 }).default("70.00"),
  timeLimit: int("timeLimit"),
  totalQuestions: int("totalQuestions"),
  randomizeQuestions: boolean("randomizeQuestions").default(true),
  randomizeOptions: boolean("randomizeOptions").default(true),
  adaptiveTesting: boolean("adaptiveTesting").default(false),
  branchingLogic: json("branchingLogic"),
  questionPools: json("questionPools"),
  proctorType: mysqlEnum("proctorType", ["none", "ai", "virtual_human", "in_person"]).default("ai"),
  allowedAttempts: int("allowedAttempts").default(1),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  credentialTemplateId: int("credentialTemplateId"),
  linkedBookId: int("linkedBookId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const examAttempts = mysqlTable("exam_attempts", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("examId").notNull(),
  candidateId: int("candidateId").notNull(),
  orgId: int("orgId").notNull(),
  voucherId: int("voucherId"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "abandoned", "flagged"]).default("scheduled").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  passed: boolean("passed"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  responses: json("responses"),
  proctorSessionId: int("proctorSessionId"),
  credentialId: int("credentialId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── PROCTORING ───────────────────────────────────────────────────────────

export const proctorSessions = mysqlTable("proctor_sessions", {
  id: int("id").autoincrement().primaryKey(),
  examAttemptId: int("examAttemptId").notNull(),
  candidateId: int("candidateId").notNull(),
  proctorId: int("proctorId"),
  type: mysqlEnum("type", ["ai", "virtual_human", "in_person"]).notNull(),
  status: mysqlEnum("status", ["pending", "active", "completed", "flagged"]).default("pending").notNull(),
  aiFlags: json("aiFlags"),
  incidentCount: int("incidentCount").default(0),
  recordingUrl: text("recordingUrl"),
  reportUrl: text("reportUrl"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const proctorIncidents = mysqlTable("proctor_incidents", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  type: mysqlEnum("type", ["gaze_deviation", "face_not_detected", "multiple_faces", "audio_anomaly", "tab_switch", "phone_detected", "manual_flag", "notebook_detected", "second_monitor", "screen_share_detected", "identity_mismatch"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  description: text("description"),
  evidenceUrl: text("evidenceUrl"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  reviewedBy: int("reviewedBy"),
  resolution: text("resolution"),
});

// ─── DIGITAL BOOKS ────────────────────────────────────────────────────────

export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  isbn: varchar("isbn", { length: 20 }),
  description: text("description"),
  coverUrl: text("coverUrl"),
  fileUrl: text("fileUrl"),
  fileType: mysqlEnum("fileType", ["epub", "pdf"]).default("pdf"),
  industry: varchar("industry", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  drmEnabled: boolean("drmEnabled").default(true),
  maxPrintPercent: int("maxPrintPercent").default(10),
  tableOfContents: json("tableOfContents"),
  vectorIndexId: text("vectorIndexId"),
  linkedExamId: int("linkedExamId"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const bookAccess = mysqlTable("book_access", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull(),
  userId: int("userId").notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  accessType: mysqlEnum("accessType", ["purchased", "voucher", "org_license"]).default("purchased"),
});

// ─── FINANCIAL LEDGER ─────────────────────────────────────────────────────

export const ledgerEntries = mysqlTable("ledger_entries", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  userId: int("userId"),
  type: mysqlEnum("type", ["credit_purchase", "voucher_generation", "exam_redemption", "book_purchase", "refund", "api_usage", "subscription"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  balanceBefore: decimal("balanceBefore", { precision: 12, scale: 4 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 4 }).notNull(),
  referenceId: varchar("referenceId", { length: 128 }),
  referenceType: varchar("referenceType", { length: 64 }),
  description: text("description"),
  cryptoHash: varchar("cryptoHash", { length: 256 }),
  prevHash: varchar("prevHash", { length: 256 }),
  stripePaymentId: varchar("stripePaymentId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const vouchers = mysqlTable("vouchers", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  qrCode: text("qrCode"),
  type: mysqlEnum("type", ["exam", "book", "bundle"]).notNull(),
  examId: int("examId"),
  bookId: int("bookId"),
  status: mysqlEnum("status", ["active", "redeemed", "expired", "cancelled"]).default("active").notNull(),
  redeemedBy: int("redeemedBy"),
  redeemedAt: timestamp("redeemedAt"),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const creditBalances = mysqlTable("credit_balances", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 4 }).default("0.0000").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── BILLING & SUBSCRIPTIONS ──────────────────────────────────────────────

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise", "api_saas"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "past_due", "trialing"]).default("trialing").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────

export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  orgId: int("orgId"),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  resourceId: varchar("resourceId", { length: 64 }),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orgId: int("orgId"),
  type: mysqlEnum("type", ["credential_issued", "exam_scheduled", "exam_result", "expiry_reminder", "proctoring_incident", "system_alert", "billing_alert", "booking_confirmed", "booking_cancelled", "booking_new"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── API KEYS ─────────────────────────────────────────────────────────────

export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: varchar("keyHash", { length: 256 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 12 }).notNull(),
  permissions: json("permissions"),
  rateLimit: int("rateLimit").default(1000),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  url: text("url").notNull(),
  events: json("events").notNull(),
  secret: varchar("secret", { length: 128 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  lastDeliveredAt: timestamp("lastDeliveredAt"),
  failureCount: int("failureCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── PROCTOR EARNINGS & PAYOUTS ──────────────────────────────────────────
export const proctorEarnings = mysqlTable("proctor_earnings", {
  id: int("id").autoincrement().primaryKey(),
  proctorId: int("proctorId").notNull(),
  sessionId: int("sessionId"),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  type: mysqlEnum("type", ["session_fee", "bonus", "adjustment"]).default("session_fee").notNull(),
  status: mysqlEnum("status", ["pending", "available", "paid_out"]).default("pending").notNull(),
  description: text("description"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const proctorPayouts = mysqlTable("proctor_payouts", {
  id: int("id").autoincrement().primaryKey(),
  proctorId: int("proctorId").notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["requested", "processing", "completed", "failed"]).default("requested").notNull(),
  bankAccountLast4: varchar("bankAccountLast4", { length: 4 }),
  bankAccountName: varchar("bankAccountName", { length: 100 }),
  bankRoutingNumber: varchar("bankRoutingNumber", { length: 20 }),
  notes: text("notes"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const proctorBankAccounts = mysqlTable("proctor_bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  proctorId: int("proctorId").notNull().unique(),
  accountHolderName: varchar("accountHolderName", { length: 100 }).notNull(),
  bankName: varchar("bankName", { length: 100 }).notNull(),
  accountLast4: varchar("accountLast4", { length: 4 }).notNull(),
  routingNumber: varchar("routingNumber", { length: 20 }).notNull(),
  accountType: mysqlEnum("accountType", ["checking", "savings"]).default("checking").notNull(),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── STRIPE PAYMENTS ─────────────────────────────────────────────────────
export const stripePayments = mysqlTable("stripe_payments", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  userId: int("userId").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  credits: int("credits").default(0), // credits to add on success
  plan: varchar("plan", { length: 50 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

// ─── EXAM BLUEPRINTS ─────────────────────────────────────────────────────
export const examBlueprints = mysqlTable("exam_blueprints", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  createdBy: int("createdBy").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  totalQuestions: int("totalQuestions").default(50).notNull(),
  sections: json("sections"),
  passingScore: decimal("passingScore", { precision: 5, scale: 2 }).default("70.00"),
  timeLimit: int("timeLimit"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// ─── ESSAY SCORING ────────────────────────────────────────────────────────
export const essayScores = mysqlTable("essay_scores", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  questionId: int("questionId").notNull(),
  candidateId: int("candidateId").notNull(),
  responseText: text("responseText").notNull(),
  rubric: json("rubric"),
  aiScore: decimal("aiScore", { precision: 5, scale: 2 }),
  aiRationale: text("aiRationale"),
  humanScore: decimal("humanScore", { precision: 5, scale: 2 }),
  humanReviewerId: int("humanReviewerId"),
  finalScore: decimal("finalScore", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["pending", "ai_scored", "human_reviewed", "finalized"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// ─── PRE-EXAM CHECKS ──────────────────────────────────────────────────────
export const preExamChecks = mysqlTable("pre_exam_checks", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  candidateId: int("candidateId").notNull(),
  webcamOk: boolean("webcamOk").default(false),
  micOk: boolean("micOk").default(false),
  bandwidthOk: boolean("bandwidthOk").default(false),
  idVerified: boolean("idVerified").default(false),
  idPhotoUrl: text("idPhotoUrl"),
  roomScanOk: boolean("roomScanOk").default(false),
  roomScanVideoUrl: text("roomScanVideoUrl"),
  lockdownBrowserOk: boolean("lockdownBrowserOk").default(false),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["pending", "in_progress", "passed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
// ─── VOUCHER COHORTS ─────────────────────────────────────────────────────
export const voucherCohorts = mysqlTable("voucher_cohorts", {
  id: int("id").autoincrement().primaryKey(),
  orgId: int("orgId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  examId: int("examId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── RESPONSE-TIME TRACKING & ANOMALY DETECTION ───────────────────────────

/**
 * Stores per-question response time for every exam attempt.
 * Captured by the ExamTaking frontend and persisted via tRPC.
 */
export const questionResponses = mysqlTable("question_responses", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  questionId: int("questionId").notNull(),
  candidateId: int("candidateId").notNull(),
  examId: int("examId").notNull(),
  orgId: int("orgId").notNull(),
  // Time in milliseconds the candidate spent on this question
  responseTimeMs: int("responseTimeMs").notNull(),
  // Whether the candidate flagged the question for review
  flaggedForReview: boolean("flaggedForReview").default(false),
  // Number of times the candidate revisited this question
  revisitCount: int("revisitCount").default(0).notNull(),
  // The answer submitted (stored as JSON for flexibility across question types)
  answer: json("answer"),
  // Whether the answer was correct (null = not yet graded)
  isCorrect: boolean("isCorrect"),
  // Sequence position in the exam (1-based)
  questionIndex: int("questionIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Anomaly records produced by the statistical analysis engine.
 * One record per (attempt, question) pair that triggers a flag.
 */
export const responseTimeAnomalies = mysqlTable("response_time_anomalies", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull(),
  questionId: int("questionId").notNull(),
  candidateId: int("candidateId").notNull(),
  examId: int("examId").notNull(),
  orgId: int("orgId").notNull(),
  // Type of anomaly detected
  anomalyType: mysqlEnum("anomalyType", [
    "too_fast",          // response time < 2 SD below mean (pre-knowledge)
    "too_slow",          // response time > 2 SD above mean (possible assistance)
    "iqr_outlier_fast",  // below Q1 - 1.5*IQR
    "iqr_outlier_slow",  // above Q3 + 1.5*IQR
    "collusion",         // response pattern matches another candidate
    "uniform_speed",     // all questions answered at nearly identical speed (bot-like)
    "acceleration",      // speed increases significantly toward end (memorized answers)
    "copy_pattern",      // answer sequence matches another candidate's
  ]).notNull(),
  // Severity computed from Z-score magnitude
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  // Statistical values for audit trail
  responseTimeMs: int("responseTimeMs").notNull(),
  meanTimeMs: int("meanTimeMs").notNull(),
  stdDevMs: int("stdDevMs").notNull(),
  zScore: decimal("zScore", { precision: 8, scale: 4 }).notNull(),
  // IQR bounds used for this analysis
  iqrLowerBound: int("iqrLowerBound"),
  iqrUpperBound: int("iqrUpperBound"),
  // For collusion: the other candidate's attempt ID
  collusionAttemptId: int("collusionAttemptId"),
  collusionSimilarityScore: decimal("collusionSimilarityScore", { precision: 5, scale: 4 }),
  // AI-generated narrative explanation
  aiNarrative: text("aiNarrative"),
  // Proctor review status
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "confirmed", "dismissed"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Aggregate anomaly summary per exam attempt (one row per attempt).
 * Pre-computed for fast dashboard queries.
 */
export const attemptAnomalySummaries = mysqlTable("attempt_anomaly_summaries", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attemptId").notNull().unique(),
  candidateId: int("candidateId").notNull(),
  examId: int("examId").notNull(),
  orgId: int("orgId").notNull(),
  // Counts by anomaly type
  totalAnomalies: int("totalAnomalies").default(0).notNull(),
  tooFastCount: int("tooFastCount").default(0).notNull(),
  tooSlowCount: int("tooSlowCount").default(0).notNull(),
  collusionCount: int("collusionCount").default(0).notNull(),
  uniformSpeedCount: int("uniformSpeedCount").default(0).notNull(),
  // Overall risk score 0-100
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0.00").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["clean", "low", "medium", "high", "critical"]).default("clean").notNull(),
  // Exam-level statistics for this attempt
  totalTimeMs: int("totalTimeMs").default(0).notNull(),
  meanResponseTimeMs: int("meanResponseTimeMs").default(0).notNull(),
  stdDevResponseTimeMs: int("stdDevResponseTimeMs").default(0).notNull(),
  fastestResponseMs: int("fastestResponseMs"),
  slowestResponseMs: int("slowestResponseMs"),
  // Whether this attempt was flagged for proctor review
  flaggedForReview: boolean("flaggedForReview").default(false).notNull(),
  analysisCompletedAt: timestamp("analysisCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULING: Proctor Availability Windows & Exam Bookings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proctor-published availability windows.
 * A proctor creates recurring or one-off time slots that candidates can book.
 */
export const proctorAvailabilityWindows = mysqlTable("proctor_availability_windows", {
  id: int("id").autoincrement().primaryKey(),
  proctorId: int("proctorId").notNull(),
  orgId: int("orgId"),
  // Window start/end as UTC Unix timestamps (ms)
  startsAt: bigint("startsAt", { mode: "number" }).notNull(),
  endsAt: bigint("endsAt", { mode: "number" }).notNull(),
  // Max concurrent bookings within this window
  capacity: int("capacity").default(1).notNull(),
  // How many slots have been booked so far (denormalised for fast queries)
  bookedCount: int("bookedCount").default(0).notNull(),
  // Recurrence: null = one-off, otherwise comma-separated ISO day-of-week e.g. "1,3,5"
  recurrenceDays: varchar("recurrenceDays", { length: 20 }),
  recurrenceEndsAt: bigint("recurrenceEndsAt", { mode: "number" }),
  // Status
  status: mysqlEnum("status", ["active", "cancelled", "full"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Candidate exam booking — links a candidate to a proctor availability window
 * for a specific exam.
 */
export const examBookings = mysqlTable("exam_bookings", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  proctorId: int("proctorId").notNull(),
  examId: int("examId").notNull(),
  windowId: int("windowId").notNull(),
  orgId: int("orgId"),
  // Confirmed slot within the window (candidate picks exact start time)
  scheduledAt: bigint("scheduledAt", { mode: "number" }).notNull(),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  // Booking lifecycle
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "cancelled_by_candidate",
    "cancelled_by_proctor",
    "completed",
    "no_show",
  ]).default("pending").notNull(),
  // Cancellation
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
  // Reminder flags
  reminderSent24h: boolean("reminderSent24h").default(false).notNull(),
  reminderSent1h: boolean("reminderSent1h").default(false).notNull(),
  // Notes
  candidateNotes: text("candidateNotes"),
  proctorNotes: text("proctorNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InsertProctorAvailabilityWindow = typeof proctorAvailabilityWindows.$inferInsert;
export type SelectProctorAvailabilityWindow = typeof proctorAvailabilityWindows.$inferSelect;
export type InsertExamBooking = typeof examBookings.$inferInsert;
export type SelectExamBooking = typeof examBookings.$inferSelect;

// ─── PASSWORD RESETS ──────────────────────────────────────────────────────────
export const passwordResets = mysqlTable("password_resets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InsertPasswordReset = typeof passwordResets.$inferInsert;
export type SelectPasswordReset = typeof passwordResets.$inferSelect;

// ─── ORGANISATION INVITES ─────────────────────────────────────────────────────
/**
 * Super-admin-generated invite tokens for onboarding new organisations.
 * Each token is single-use and expires after 7 days.
 */
export const orgInvites = mysqlTable("org_invites", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  orgName: varchar("orgName", { length: 255 }),
  orgEmail: varchar("orgEmail", { length: 320 }),
  orgIndustry: varchar("orgIndustry", { length: 100 }),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise", "api_saas"]).default("starter").notNull(),
  createdByAdminId: int("createdByAdminId").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "expired", "cancelled"]).default("pending").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  resultingOrgId: int("resultingOrgId"),
  notes: text("notes"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InsertOrgInvite = typeof orgInvites.$inferInsert;
export type SelectOrgInvite = typeof orgInvites.$inferSelect;

// ─── PLATFORM SETTINGS ───────────────────────────────────────────────────────
/**
 * Global platform configuration stored as key-value JSON rows.
 * One row per settings section (general, security, email, integrations, billing).
 * Only super_admin can read/write these.
 */
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  section: varchar("section", { length: 64 }).notNull().unique(),
  data: json("data").notNull(),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InsertPlatformSettings = typeof platformSettings.$inferInsert;
export type SelectPlatformSettings = typeof platformSettings.$inferSelect;
