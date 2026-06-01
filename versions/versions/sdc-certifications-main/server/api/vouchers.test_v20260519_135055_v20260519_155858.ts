/**
 * Tests for SDC REST API v1 — Voucher Endpoints
 *
 * Covers:
 *   GET  /api/v1/vouchers/:code      — inspect without consuming
 *   POST /api/v1/vouchers/validate   — validate + optionally redeem
 *
 * Auth bypass strategy: provide a valid-looking Bearer token and mock the
 * apiKeys DB lookup to return a valid key record, so requireApiKey passes.
 * Then configure the vouchers DB lookup per-test.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// ─── DB mock ─────────────────────────────────────────────────────────────────
// vi.hoisted() ensures mockDb is available before the vi.mock() factory runs.
const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  };
  return { mockDb };
});

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

import apiV1Router from "./routes";

// ─── Constants ────────────────────────────────────────────────────────────────
const ORG_ID = 42;
const VALID_KEY = "sdc_live_testkey1234567890abcdefghij";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const apiKeyRecord = {
  id: 1,
  orgId: ORG_ID,
  status: "active",
  rateLimit: 1000,
  expiresAt: null,
};

const activeExamVoucher = {
  id: 1,
  orgId: ORG_ID,
  code: "SDC-TESTEXAM0001",
  type: "exam" as const,
  examId: 10,
  bookId: null,
  status: "active" as const,
  redeemedBy: null,
  redeemedAt: null,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdBy: 1,
  createdAt: new Date(),
  qrCode: null,
};

const redeemedVoucher = {
  ...activeExamVoucher,
  id: 2,
  code: "SDC-REDEEMED0001",
  status: "redeemed" as const,
  redeemedBy: 99,
  redeemedAt: new Date(Date.now() - 1000),
};

const expiredVoucher = {
  ...activeExamVoucher,
  id: 3,
  code: "SDC-EXPIRED00001",
  status: "expired" as const,
  expiresAt: new Date(Date.now() - 1000),
};

const cancelledVoucher = {
  ...activeExamVoucher,
  id: 4,
  code: "SDC-CANCELLED001",
  status: "cancelled" as const,
};

const activeVoucherExpiredByDate = {
  ...activeExamVoucher,
  id: 5,
  code: "SDC-EXPBYDATE001",
  status: "active" as const,
  expiresAt: new Date(Date.now() - 1000), // past expiry but DB still says "active"
};

const wrongOrgVoucher = {
  ...activeExamVoucher,
  id: 6,
  code: "SDC-WRONGORG0001",
  orgId: 999,
};

// ─── App factory ─────────────────────────────────────────────────────────────
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", apiV1Router);
  return app;
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────

/**
 * Configure mockDb.select to return `apiKeyRecord` on the first call
 * (the auth middleware lookup), then return `voucherRows` on the second call,
 * and `extraRows` on subsequent calls (e.g. exam title lookup).
 */
function mockSelectSequence(voucherRows: unknown[], ...extraRows: unknown[][]) {
  let call = 0;
  mockDb.select.mockImplementation(() => ({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockImplementation(() => {
          call++;
          if (call === 1) return Promise.resolve([apiKeyRecord]); // auth middleware
          if (call === 2) return Promise.resolve(voucherRows);   // voucher lookup
          const extra = extraRows[call - 3];
          return Promise.resolve(extra ?? []);
        }),
      }),
    }),
  }));
  // Also mock the lastUsedAt update (fire-and-forget in middleware)
  mockDb.update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ catch: vi.fn() }),
    }),
  });
}

// ─── GET /api/v1/vouchers/:code ───────────────────────────────────────────────

describe("GET /api/v1/vouchers/:code — Inspect voucher", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no Authorization header is provided", async () => {
    const res = await request(buildApp()).get("/api/v1/vouchers/SDC-TESTEXAM0001");
    expect(res.status).toBe(401);
  });

  it("returns 404 when voucher code does not exist", async () => {
    mockSelectSequence([]);
    const res = await request(buildApp())
      .get("/api/v1/vouchers/SDC-NOTEXIST0001")
      .set("Authorization", `Bearer ${VALID_KEY}`);
    expect(res.status).toBe(404);
    expect(res.body.title).toBe("Not Found");
  });

  it("returns 403 when voucher belongs to a different org", async () => {
    mockSelectSequence([wrongOrgVoucher]);
    const res = await request(buildApp())
      .get("/api/v1/vouchers/SDC-WRONGORG0001")
      .set("Authorization", `Bearer ${VALID_KEY}`);
    expect(res.status).toBe(403);
    expect(res.body.title).toBe("Forbidden");
  });

  it("returns 200 with voucher data for an active exam voucher", async () => {
    // 3rd call = exam title lookup
    mockSelectSequence([activeExamVoucher], [{ title: "AWS Cloud Practitioner" }]);
    const res = await request(buildApp())
      .get("/api/v1/vouchers/SDC-TESTEXAM0001")
      .set("Authorization", `Bearer ${VALID_KEY}`);
    expect(res.status).toBe(200);
    expect(res.body.data.code).toBe("SDC-TESTEXAM0001");
    expect(res.body.data.type).toBe("exam");
    expect(res.body.data.status).toBe("active");
    expect(res.body.data.examId).toBe(10);
    expect(res.body.data.examTitle).toBe("AWS Cloud Practitioner");
  });

  it("reports status as 'expired' when expiresAt is in the past even if DB says active", async () => {
    mockSelectSequence([activeVoucherExpiredByDate], []);
    const res = await request(buildApp())
      .get("/api/v1/vouchers/SDC-EXPBYDATE001")
      .set("Authorization", `Bearer ${VALID_KEY}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("expired");
  });

  it("returns null examTitle when voucher has no examId", async () => {
    const bookVoucher = { ...activeExamVoucher, examId: null, bookId: 20, type: "book" as const };
    mockSelectSequence([bookVoucher]);
    const res = await request(buildApp())
      .get("/api/v1/vouchers/SDC-TESTEXAM0001")
      .set("Authorization", `Bearer ${VALID_KEY}`);
    expect(res.status).toBe(200);
    expect(res.body.data.examTitle).toBeNull();
    expect(res.body.data.bookId).toBe(20);
  });
});

// ─── POST /api/v1/vouchers/validate ──────────────────────────────────────────

describe("POST /api/v1/vouchers/validate — Validate / redeem voucher", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no Authorization header is provided", async () => {
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .send({ code: "SDC-TESTEXAM0001" });
    expect(res.status).toBe(401);
  });

  it("returns 400 when 'code' field is missing", async () => {
    // Auth passes (apiKeyRecord), then body validation fires before DB
    mockSelectSequence([]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/code/i);
  });

  it("returns 422 when redeem=true but candidateEmail is missing", async () => {
    mockSelectSequence([]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-TESTEXAM0001", redeem: true });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/candidateEmail/i);
  });

  it("returns 404 when voucher code does not exist", async () => {
    mockSelectSequence([]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-NOTEXIST0001" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when voucher belongs to a different org", async () => {
    mockSelectSequence([wrongOrgVoucher]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-WRONGORG0001" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when voucher is already redeemed", async () => {
    mockSelectSequence([redeemedVoucher]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-REDEEMED0001" });
    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/already been redeemed/i);
  });

  it("returns 400 when voucher is cancelled", async () => {
    mockSelectSequence([cancelledVoucher]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-CANCELLED001" });
    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/cancelled/i);
  });

  it("returns 400 when voucher status is expired", async () => {
    mockSelectSequence([expiredVoucher]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-EXPIRED00001" });
    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/expired/i);
  });

  it("returns 400 when voucher is active but expiresAt is in the past", async () => {
    mockSelectSequence([activeVoucherExpiredByDate]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-EXPBYDATE001" });
    expect(res.status).toBe(400);
    expect(res.body.detail).toMatch(/expired/i);
  });

  it("returns 200 with valid=true, redeemed=false when redeem is not set (validation-only)", async () => {
    // Calls: 1=apiKey, 2=voucher, 3=examTitle
    mockSelectSequence([activeExamVoucher], [{ title: "AWS Cloud Practitioner" }]);
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-TESTEXAM0001" });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.redeemed).toBe(false);
    expect(res.body.message).toMatch(/valid and available/i);
    expect(res.body.data.code).toBe("SDC-TESTEXAM0001");
    expect(res.body.data.type).toBe("exam");
  });

  it("returns 200 with redeemed=true when redeem=true and candidate exists", async () => {
    const candidate = { id: 55, name: "Jane Doe", email: "jane@example.com" };
    // The candidate lookup uses .limit(1).then(r => r[0] ?? null).
    // We need limit() to return a real Promise so .then() chains correctly.
    let selectCall = 0;
    mockDb.select.mockImplementation(() => {
      selectCall++;
      const n = selectCall;
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              if (n === 1) return Promise.resolve([apiKeyRecord]);     // auth
              if (n === 2) return Promise.resolve([activeExamVoucher]); // voucher
              if (n === 3) return Promise.resolve([{ title: "AWS Cloud Practitioner" }]); // exam title
              return Promise.resolve([candidate]); // candidate lookup
            }),
          }),
        }),
      };
    });
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          catch: vi.fn().mockReturnValue(undefined),
        }),
      }),
    });
    const res = await request(buildApp())
      .post("/api/v1/vouchers/validate")
      .set("Authorization", `Bearer ${VALID_KEY}`)
      .send({ code: "SDC-TESTEXAM0001", candidateEmail: "jane@example.com", redeem: true });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.redeemed).toBe(true);
    expect(res.body.data.code).toBe("SDC-TESTEXAM0001");
    expect(res.body.data.candidate.email).toBe("jane@example.com");
    expect(res.body.message).toMatch(/redeemed successfully/i);
  }, 10000);
});

// ─── OpenAPI spec includes voucher paths ─────────────────────────────────────

describe("OpenAPI spec — voucher paths", () => {
  it("includes /vouchers/{code} path with getVoucher operationId", async () => {
    const res = await request(buildApp()).get("/api/v1/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.paths).toHaveProperty("/vouchers/{code}");
    expect(res.body.paths["/vouchers/{code}"].get.operationId).toBe("getVoucher");
  });

  it("includes /vouchers/validate path with validateVoucher operationId", async () => {
    const res = await request(buildApp()).get("/api/v1/openapi.json");
    expect(res.body.paths).toHaveProperty("/vouchers/validate");
    expect(res.body.paths["/vouchers/validate"].post.operationId).toBe("validateVoucher");
  });

  it("has 10 paths total (8 original + 2 voucher)", async () => {
    const res = await request(buildApp()).get("/api/v1/openapi.json");
    expect(Object.keys(res.body.paths).length).toBe(10);
  });
});
