/**
 * SDC Public REST API v1
 *
 * All routes require: Authorization: Bearer sdc_live_<key>
 *
 * Endpoints:
 *   GET    /api/v1/exams                    — list published exams for the org
 *   GET    /api/v1/exams/:id                — get a single exam
 *   POST   /api/v1/candidates               — register / upsert a candidate
 *   GET    /api/v1/candidates/:email        — look up a candidate by email
 *   POST   /api/v1/results                  — submit an exam result
 *   GET    /api/v1/results/:id              — get a result by attempt ID
 *   GET    /api/v1/results                  — list results (filter by candidateEmail, examId)
 *   POST   /api/v1/credentials              — issue a credential for a passed result
 *   GET    /api/v1/credentials/:credentialId — get credential details (public verification)
 *   GET    /api/v1/vouchers/:code           — inspect a voucher without consuming it
 *   POST   /api/v1/vouchers/validate        — validate + optionally redeem a voucher
 *   GET    /api/v1/openapi.json             — OpenAPI 3.1 spec
 */
import { Router, Request, Response } from "express";
import crypto from "crypto";
import { getDb } from "../db";
import {
  exams, examAttempts, credentials, users, organizations,
  credentialTemplates, vouchers, bookAccess,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireApiKey, apiError, ApiContext } from "./middleware";

const router = Router();

// ─── Public routes (no auth) ─────────────────────────────────────────────────

router.get("/openapi.json", (_req: Request, res: Response) => {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "SDC Certifications API",
      version: "1.0.0",
      description: "Public REST API for SDC Certifications. Use your API key as a Bearer token.",
      contact: { email: "api@sdccertify.com" },
    },
    servers: [{ url: "/api/v1", description: "Production" }],
    security: [{ BearerAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "sdc_live_...",
          description: "API key from the SDC Developer Portal. Format: sdc_live_<40chars>",
        },
      },
    },
    paths: {
      "/exams": { get: { summary: "List published exams", operationId: "listExams", tags: ["Exams"], responses: { "200": { description: "Array of published exams" } } } },
      "/exams/{id}": { get: { summary: "Get a single exam", operationId: "getExam", tags: ["Exams"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Exam details" }, "404": { description: "Not found" } } } },
      "/candidates": { post: { summary: "Register a candidate", operationId: "createCandidate", tags: ["Candidates"], responses: { "201": { description: "Created" }, "200": { description: "Already exists" } } } },
      "/candidates/{email}": { get: { summary: "Look up a candidate", operationId: "getCandidate", tags: ["Candidates"], parameters: [{ name: "email", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Candidate details" }, "404": { description: "Not found" } } } },
      "/results": {
        post: { summary: "Submit an exam result", operationId: "createResult", tags: ["Results"], responses: { "201": { description: "Result recorded" } } },
        get: { summary: "List exam results", operationId: "listResults", tags: ["Results"], responses: { "200": { description: "Array of results" } } },
      },
      "/results/{id}": { get: { summary: "Get a result by ID", operationId: "getResult", tags: ["Results"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Result details" }, "404": { description: "Not found" } } } },
      "/credentials": { post: { summary: "Issue a credential", operationId: "createCredential", tags: ["Credentials"], responses: { "201": { description: "Credential issued" }, "422": { description: "Candidate did not pass" } } } },
      "/credentials/{credentialId}": { get: { summary: "Get credential details", operationId: "getCredential", tags: ["Credentials"], parameters: [{ name: "credentialId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Credential details" }, "404": { description: "Not found" } } } },
      "/vouchers/{code}": {
        get: {
          summary: "Inspect a voucher",
          operationId: "getVoucher",
          tags: ["Vouchers"],
          description: "Returns voucher metadata (type, status, exam/book association, expiry) without consuming the voucher.",
          parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" }, description: "Voucher code e.g. SDC-XXXXXXXXXXXX" }],
          responses: {
            "200": { description: "Voucher details" },
            "403": { description: "Voucher belongs to a different org" },
            "404": { description: "Voucher not found" },
          },
        },
      },
      "/vouchers/validate": {
        post: {
          summary: "Validate (and optionally redeem) a voucher",
          operationId: "validateVoucher",
          tags: ["Vouchers"],
          description: "Validates a voucher code. If redeem=true and candidateEmail are provided, marks the voucher as redeemed and grants exam/book access to the candidate.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["code"],
                  properties: {
                    code: { type: "string", description: "Voucher code" },
                    candidateEmail: { type: "string", format: "email", description: "Candidate email — required when redeem is true" },
                    redeem: { type: "boolean", default: false, description: "Set to true to consume the voucher" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Voucher is valid (or redeemed if redeem=true)" },
            "400": { description: "Voucher expired or already redeemed" },
            "403": { description: "Voucher belongs to a different org" },
            "404": { description: "Voucher not found" },
            "422": { description: "redeem=true but candidateEmail missing" },
          },
        },
      },
    },
  };
  res.json(spec);
});

// ─── Protected routes (API key required) ─────────────────────────────────────

// Apply API key auth to all routes below
router.use(requireApiKey);

// ─── Helper ──────────────────────────────────────────────────────────────────

function ctx(res: Response): ApiContext {
  return res.locals.apiCtx as ApiContext;
}

// ─── GET /api/v1/exams ───────────────────────────────────────────────────────

router.get("/exams", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const rows = await db
    .select({
      id: exams.id,
      title: exams.title,
      description: exams.description,
      industry: exams.industry,
      passingScore: exams.passingScore,
      timeLimit: exams.timeLimit,
      totalQuestions: exams.totalQuestions,
      allowedAttempts: exams.allowedAttempts,
      proctorType: exams.proctorType,
      status: exams.status,
      createdAt: exams.createdAt,
    })
    .from(exams)
    .where(and(eq(exams.orgId, orgId), eq(exams.status, "published")))
    .orderBy(desc(exams.createdAt));

  res.json({ data: rows, total: rows.length });
});

// ─── GET /api/v1/exams/:id ───────────────────────────────────────────────────

router.get("/exams/:id", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const examId = parseInt(req.params.id);
  if (isNaN(examId)) return apiError(res, 400, "Bad Request", "Exam ID must be an integer.");

  const [exam] = await db
    .select()
    .from(exams)
    .where(and(eq(exams.id, examId), eq(exams.orgId, orgId)))
    .limit(1);

  if (!exam) return apiError(res, 404, "Not Found", `Exam ${examId} not found.`);
  res.json({ data: exam });
});

// ─── POST /api/v1/candidates ─────────────────────────────────────────────────

router.post("/candidates", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const { email, name } = req.body as {
    email?: string;
    name?: string;
  };

  if (!email || !name) {
    return apiError(res, 400, "Bad Request", "Fields 'email' and 'name' are required.");
  }

  // Upsert: check if candidate already exists in this org
  const [existing] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(and(eq(users.email, email), eq(users.orgId, orgId)))
    .limit(1);

  if (existing) {
    return res.status(200).json({
      data: existing,
      created: false,
      message: "Candidate already exists.",
    });
  }

  // Create new candidate user
  const result = await db.insert(users).values({
    name,
    role: "candidate",
    orgId,
    status: "active",
  });

  const insertId = (result as unknown as { insertId: number }).insertId;

  res.status(201).json({
    data: { id: insertId, email, name, role: "candidate", orgId },
    created: true,
    message: "Candidate registered successfully.",
  });
});

// ─── GET /api/v1/candidates/:email ───────────────────────────────────────────

router.get("/candidates/:email", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const email = decodeURIComponent(req.params.email);

  const [candidate] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.email, email), eq(users.orgId, orgId)))
    .limit(1);

  if (!candidate) return apiError(res, 404, "Not Found", `Candidate with email '${email}' not found.`);
  res.json({ data: candidate });
});

// ─── POST /api/v1/results ────────────────────────────────────────────────────

router.post("/results", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const {
    examId,
    candidateEmail,
    score,
    responses,
    startedAt,
    completedAt,
  } = req.body as {
    examId?: number;
    candidateEmail?: string;
    score?: number;
    responses?: unknown;
    startedAt?: string;
    completedAt?: string;
  };

  if (!examId || !candidateEmail || score === undefined) {
    return apiError(res, 400, "Bad Request", "Fields 'examId', 'candidateEmail', and 'score' are required.");
  }

  // Validate exam belongs to org
  const [exam] = await db
    .select({ id: exams.id, passingScore: exams.passingScore })
    .from(exams)
    .where(and(eq(exams.id, examId), eq(exams.orgId, orgId)))
    .limit(1);

  if (!exam) return apiError(res, 404, "Not Found", `Exam ${examId} not found in your organisation.`);

  // Find or create candidate
  let [candidate] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, candidateEmail), eq(users.orgId, orgId)))
    .limit(1);

  if (!candidate) {
    const ins = await db.insert(users).values({
      email: candidateEmail,
      name: candidateEmail.split("@")[0],
      role: "candidate",
      orgId,
      status: "active",
    });
    candidate = { id: (ins as unknown as { insertId: number }).insertId };
  }

  const passingScore = parseFloat(exam.passingScore ?? "70");
  const passed = score >= passingScore;

  const result = await db.insert(examAttempts).values({
    examId,
    candidateId: candidate.id,
    orgId,
    status: "completed",
    score: score.toFixed(2),
    passed,
    responses: responses ?? null,
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    completedAt: completedAt ? new Date(completedAt) : new Date(),
  });

  const attemptId = (result as unknown as { insertId: number }).insertId;

  res.status(201).json({
    data: {
      id: attemptId,
      examId,
      candidateEmail,
      score,
      passingScore,
      passed,
      status: "completed",
    },
    message: passed
      ? "Exam result recorded. Candidate passed."
      : "Exam result recorded. Candidate did not pass.",
  });
});

// ─── GET /api/v1/results/:id ─────────────────────────────────────────────────

router.get("/results/:id", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const attemptId = parseInt(req.params.id);
  if (isNaN(attemptId)) return apiError(res, 400, "Bad Request", "Result ID must be an integer.");

  const [attempt] = await db
    .select({
      id: examAttempts.id,
      examId: examAttempts.examId,
      candidateId: examAttempts.candidateId,
      score: examAttempts.score,
      passed: examAttempts.passed,
      status: examAttempts.status,
      startedAt: examAttempts.startedAt,
      completedAt: examAttempts.completedAt,
      credentialId: examAttempts.credentialId,
    })
    .from(examAttempts)
    .where(and(eq(examAttempts.id, attemptId), eq(examAttempts.orgId, orgId)))
    .limit(1);

  if (!attempt) return apiError(res, 404, "Not Found", `Result ${attemptId} not found.`);

  // Enrich with candidate email
  const [candidate] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, attempt.candidateId))
    .limit(1);

  res.json({
    data: {
      ...attempt,
      candidateEmail: candidate?.email,
      candidateName: candidate?.name,
    },
  });
});

// ─── GET /api/v1/results ─────────────────────────────────────────────────────

router.get("/results", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const { candidateEmail, examId, limit = "50", offset = "0" } = req.query as Record<string, string>;

  // Build base query
  let rows = await db
    .select({
      id: examAttempts.id,
      examId: examAttempts.examId,
      candidateId: examAttempts.candidateId,
      score: examAttempts.score,
      passed: examAttempts.passed,
      status: examAttempts.status,
      completedAt: examAttempts.completedAt,
      credentialId: examAttempts.credentialId,
    })
    .from(examAttempts)
    .where(eq(examAttempts.orgId, orgId))
    .orderBy(desc(examAttempts.completedAt))
    .limit(parseInt(limit) || 50)
    .offset(parseInt(offset) || 0);

  // Client-side filter (simple approach for now)
  if (examId) {
    rows = rows.filter((r) => r.examId === parseInt(examId));
  }

  // Enrich with candidate emails if filtering by email
  const enriched = await Promise.all(
    rows.map(async (r) => {
      const [c] = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, r.candidateId))
        .limit(1);
      return { ...r, candidateEmail: c?.email, candidateName: c?.name };
    })
  );

  const filtered = candidateEmail
    ? enriched.filter((r) => r.candidateEmail === candidateEmail)
    : enriched;

  res.json({ data: filtered, total: filtered.length });
});

// ─── POST /api/v1/credentials ────────────────────────────────────────────────

router.post("/credentials", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const { resultId, templateId, expiryMonths } = req.body as {
    resultId?: number;
    templateId?: number;
    expiryMonths?: number;
  };

  if (!resultId || !templateId) {
    return apiError(res, 400, "Bad Request", "Fields 'resultId' and 'templateId' are required.");
  }

  // Validate attempt
  const [attempt] = await db
    .select()
    .from(examAttempts)
    .where(and(eq(examAttempts.id, resultId), eq(examAttempts.orgId, orgId)))
    .limit(1);

  if (!attempt) return apiError(res, 404, "Not Found", `Result ${resultId} not found.`);
  if (!attempt.passed) return apiError(res, 422, "Unprocessable Entity", "Cannot issue credential: candidate did not pass the exam.");

  // Validate template belongs to org
  const [template] = await db
    .select({ id: credentialTemplates.id, name: credentialTemplates.name })
    .from(credentialTemplates)
    .where(and(eq(credentialTemplates.id, templateId), eq(credentialTemplates.orgId, orgId)))
    .limit(1);

  if (!template) return apiError(res, 404, "Not Found", `Credential template ${templateId} not found.`);

  // Generate credential ID
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  const credentialId = `SDC-${year}-${rand}`;

  const issueDate = new Date();
  const expiryDate = expiryMonths
    ? new Date(issueDate.getTime() + expiryMonths * 30 * 24 * 60 * 60 * 1000)
    : null;

  const verificationUrl = `${process.env.VITE_OAUTH_PORTAL_URL ?? "https://sdccertify.com"}/verify/${credentialId}`;

  const cryptoSignature = crypto
    .createHash("sha256")
    .update(`${credentialId}:${attempt.candidateId}:${attempt.examId}:${issueDate.toISOString()}`)
    .digest("hex");

  const result = await db.insert(credentials).values({
    credentialId,
    orgId,
    candidateId: attempt.candidateId,
    templateId,
    examId: attempt.examId,
    status: "active",
    score: attempt.score,
    issueDate,
    expiryDate,
    cryptoSignature,
    verificationUrl,
  });

  const insertId = (result as unknown as { insertId: number }).insertId;

  // Link credential back to attempt
  await db
    .update(examAttempts)
    .set({ credentialId: insertId })
    .where(eq(examAttempts.id, resultId));

  res.status(201).json({
    data: {
      id: insertId,
      credentialId,
      candidateId: attempt.candidateId,
      examId: attempt.examId,
      templateName: template.name,
      score: attempt.score,
      issueDate,
      expiryDate,
      verificationUrl,
      cryptoSignature,
    },
    message: "Credential issued successfully.",
  });
});

// ─── GET /api/v1/credentials/:credentialId ───────────────────────────────────

router.get("/credentials/:credentialId", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const { credentialId } = req.params;

  const [cred] = await db
    .select({
      id: credentials.id,
      credentialId: credentials.credentialId,
      status: credentials.status,
      score: credentials.score,
      issueDate: credentials.issueDate,
      expiryDate: credentials.expiryDate,
      verificationUrl: credentials.verificationUrl,
      cryptoSignature: credentials.cryptoSignature,
      candidateId: credentials.candidateId,
      examId: credentials.examId,
      templateId: credentials.templateId,
    })
    .from(credentials)
    .where(and(eq(credentials.credentialId, credentialId), eq(credentials.orgId, orgId)))
    .limit(1);

  if (!cred) return apiError(res, 404, "Not Found", `Credential '${credentialId}' not found.`);

  // Enrich with candidate and exam info
  const [candidate] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, cred.candidateId))
    .limit(1);

  const [exam] = await db
    .select({ title: exams.title })
    .from(exams)
    .where(eq(exams.id, cred.examId!))
    .limit(1);

  res.json({
    data: {
      ...cred,
      candidateEmail: candidate?.email,
      candidateName: candidate?.name,
      examTitle: exam?.title,
    },
  });
});

// ─── GET /api/v1/vouchers/:code ──────────────────────────────────────────────
// Inspect a voucher without consuming it.
router.get("/vouchers/:code", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const { code } = req.params;
  const [voucher] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.code, code))
    .limit(1);

  if (!voucher) return apiError(res, 404, "Not Found", `Voucher '${code}' not found.`);
  if (voucher.orgId !== orgId)
    return apiError(res, 403, "Forbidden", "This voucher belongs to a different organisation.");

  // Resolve exam title for convenience
  let examTitle: string | null = null;
  if (voucher.examId) {
    const [e] = await db.select({ title: exams.title }).from(exams).where(eq(exams.id, voucher.examId)).limit(1);
    examTitle = e?.title ?? null;
  }

  // Compute effective status (may be expired in DB but not yet marked)
  const effectiveStatus =
    voucher.status === "active" && voucher.expiresAt && voucher.expiresAt < new Date()
      ? "expired"
      : voucher.status;

  res.json({
    data: {
      code: voucher.code,
      type: voucher.type,
      status: effectiveStatus,
      examId: voucher.examId ?? null,
      examTitle,
      bookId: voucher.bookId ?? null,
      expiresAt: voucher.expiresAt ?? null,
      redeemedAt: voucher.redeemedAt ?? null,
      createdAt: voucher.createdAt,
    },
  });
});

// ─── POST /api/v1/vouchers/validate ──────────────────────────────────────────
// Validate + optionally redeem a voucher for a candidate.
// Body: { code: string, candidateEmail?: string, redeem?: boolean }
router.post("/vouchers/validate", async (req: Request, res: Response) => {
  const { orgId } = ctx(res);
  const db = await getDb();
  if (!db) return apiError(res, 503, "Service Unavailable");

  const { code, candidateEmail, redeem = false } = req.body as {
    code?: string;
    candidateEmail?: string;
    redeem?: boolean;
  };

  if (!code || typeof code !== "string" || !code.trim()) {
    return apiError(res, 400, "Bad Request", "Field 'code' is required.");
  }
  if (redeem && !candidateEmail) {
    return apiError(res, 422, "Unprocessable Entity", "'candidateEmail' is required when 'redeem' is true.");
  }

  // Fetch voucher
  const [voucher] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.code, code.trim()))
    .limit(1);

  if (!voucher) return apiError(res, 404, "Not Found", `Voucher '${code}' not found.`);
  if (voucher.orgId !== orgId)
    return apiError(res, 403, "Forbidden", "This voucher belongs to a different organisation.");

  // Check status
  if (voucher.status === "redeemed") {
    return apiError(res, 400, "Bad Request", "Voucher has already been redeemed.");
  }
  if (voucher.status === "cancelled") {
    return apiError(res, 400, "Bad Request", "Voucher has been cancelled.");
  }
  if (voucher.status === "expired" || (voucher.expiresAt && voucher.expiresAt < new Date())) {
    return apiError(res, 400, "Bad Request", "Voucher has expired.");
  }

  // Resolve exam title
  let examTitle: string | null = null;
  if (voucher.examId) {
    const [e] = await db.select({ title: exams.title }).from(exams).where(eq(exams.id, voucher.examId)).limit(1);
    examTitle = e?.title ?? null;
  }

  // --- Validation-only mode ---
  if (!redeem) {
    return res.json({
      valid: true,
      redeemed: false,
      data: {
        code: voucher.code,
        type: voucher.type,
        status: voucher.status,
        examId: voucher.examId ?? null,
        examTitle,
        bookId: voucher.bookId ?? null,
        expiresAt: voucher.expiresAt ?? null,
      },
      message: "Voucher is valid and available for redemption.",
    });
  }

  // --- Redemption mode ---
  // Resolve or auto-create candidate
  let candidateRow = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.email, candidateEmail!), eq(users.orgId, orgId)))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!candidateRow) {
    const insertResult = await db.insert(users).values({
      email: candidateEmail!,
      name: candidateEmail!.split("@")[0],
      role: "candidate",
      orgId,
      passwordHash: "",
    });
    const newId = (insertResult as unknown as { insertId: number }).insertId;
    candidateRow = { id: newId, name: candidateEmail!.split("@")[0], email: candidateEmail! };
  }

  // Mark voucher as redeemed
  await db
    .update(vouchers)
    .set({ status: "redeemed", redeemedBy: candidateRow.id, redeemedAt: new Date() })
    .where(eq(vouchers.id, voucher.id));

  // Grant book access if applicable
  if (voucher.bookId && (voucher.type === "book" || voucher.type === "bundle")) {
    await db.insert(bookAccess).values({
      bookId: voucher.bookId,
      userId: candidateRow.id,
      accessType: "voucher",
    });
  }

  const redeemedAt = new Date();
  res.status(200).json({
    valid: true,
    redeemed: true,
    data: {
      code: voucher.code,
      type: voucher.type,
      examId: voucher.examId ?? null,
      examTitle,
      bookId: voucher.bookId ?? null,
      redeemedAt,
      candidate: { id: candidateRow.id, email: candidateRow.email, name: candidateRow.name },
    },
    message: `Voucher redeemed successfully for ${candidateRow.email}.`,
  });
});

export default router;
