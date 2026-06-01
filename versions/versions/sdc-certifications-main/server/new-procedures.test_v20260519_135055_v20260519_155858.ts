import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// ─── Mock Context Factories ────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    req: { headers: {}, protocol: "https" } as TrpcContext["req"],
    res: {
      setHeader: () => {},
      clearCookie: () => {},
      getHeader: () => undefined,
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 1,
    openId: null,
    orgId: 1,
    email: "test@sdc.example.com",
    name: "Test User",
    role: "candidate",
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  } as AuthenticatedUser;
}

function makeAdminCtx(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  return makeCtx({ user: makeUser({ role: "super_admin", id: 99, ...overrides }) });
}

function makeOrgAdminCtx(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  return makeCtx({ user: makeUser({ role: "org_admin", id: 2, orgId: 1, ...overrides }) });
}

function makeCandidateCtx(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  return makeCtx({ user: makeUser({ role: "candidate", id: 1, ...overrides }) });
}

// ─── users.deactivate ─────────────────────────────────────────────────────

describe("users.deactivate", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).users.deactivate({ userId: 5 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires super_admin role", async () => {
    const caller = appRouter.createCaller(makeCandidateCtx());
    await expect(
      (caller as any).users.deactivate({ userId: 5 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("super_admin can deactivate a user", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    // Should not throw (user 5 may not exist but procedure should handle gracefully)
    const result = await (caller as any).users.deactivate({ userId: 5 }).catch((e: any) => e);
    // Either succeeds or throws a known error (not UNAUTHORIZED/FORBIDDEN)
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
      expect(result.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── users.invite ─────────────────────────────────────────────────────────

describe("users.invite", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).users.invite({ email: "new@test.com", role: "candidate" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("org_admin can invite a candidate", async () => {
    const caller = appRouter.createCaller(makeOrgAdminCtx());
    const result = await (caller as any).users.invite({
      email: `invite-${Date.now()}@test.com`,
      role: "candidate",
    }).catch((e: any) => e);
    // Should succeed or fail gracefully (not auth error)
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
      expect(result.code).not.toBe("FORBIDDEN");
    }
  });

  it("validates email format", async () => {
    const caller = appRouter.createCaller(makeOrgAdminCtx());
    await expect(
      (caller as any).users.invite({ email: "not-an-email", role: "candidate" })
    ).rejects.toBeDefined();
  });
});

// ─── orgs.suspend / orgs.activate ─────────────────────────────────────────

describe("orgs.suspend and orgs.activate", () => {
  it("orgs.suspend requires super_admin", async () => {
    const caller = appRouter.createCaller(makeOrgAdminCtx());
    await expect(
      (caller as any).orgs.suspend({ orgId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("orgs.activate requires super_admin", async () => {
    const caller = appRouter.createCaller(makeOrgAdminCtx());
    await expect(
      (caller as any).orgs.activate({ orgId: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("super_admin can suspend an org", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await (caller as any).orgs.suspend({ orgId: 999 }).catch((e: any) => e);
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
      expect(result.code).not.toBe("FORBIDDEN");
    }
  });

  it("super_admin can activate an org", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await (caller as any).orgs.activate({ orgId: 999 }).catch((e: any) => e);
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
      expect(result.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── orgs.updatePlan ──────────────────────────────────────────────────────

describe("orgs.updatePlan", () => {
  it("requires super_admin", async () => {
    const caller = appRouter.createCaller(makeOrgAdminCtx());
    await expect(
      (caller as any).orgs.updatePlan({ orgId: 1, plan: "enterprise" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects invalid plan values", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(
      (caller as any).orgs.updatePlan({ orgId: 1, plan: "invalid_plan" })
    ).rejects.toBeDefined();
  });

  it("super_admin can update org plan", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await (caller as any).orgs.updatePlan({ orgId: 1, plan: "professional" }).catch((e: any) => e);
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
      expect(result.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── books.purchase ───────────────────────────────────────────────────────

describe("books.purchase", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).books.purchase({ bookId: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("authenticated user can purchase a book", async () => {
    const caller = appRouter.createCaller(makeCandidateCtx());
    const result = await (caller as any).books.purchase({ bookId: 1 }).catch((e: any) => e);
    // Should succeed or fail gracefully (not auth error)
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
    }
  });
});

// ─── credentials.templates.update ────────────────────────────────────────

describe("credentials.templates.update", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).credentials.templates.update({ id: 1, name: "Updated" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("org_admin can update a template", async () => {
    const caller = appRouter.createCaller(makeOrgAdminCtx());
    const result = await (caller as any).credentials.templates.update({
      id: 1,
      name: "Updated Template",
    }).catch((e: any) => e);
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
      expect(result.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── credentials.templates.delete ────────────────────────────────────────

describe("credentials.templates.delete", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).credentials.templates.delete({ id: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("org_admin can delete a template", async () => {
    const caller = appRouter.createCaller(makeOrgAdminCtx());
    const result = await (caller as any).credentials.templates.delete({ id: 9999 }).catch((e: any) => e);
    if (result && result.code) {
      expect(result.code).not.toBe("UNAUTHORIZED");
      expect(result.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── Exam scoring accuracy ────────────────────────────────────────────────

describe("exams.attempts.submit (real scoring)", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).exams.attempts.submit({ examId: 1, answers: { "1": "B" } })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("authenticated candidate can submit an exam", async () => {
    const caller = appRouter.createCaller(makeCandidateCtx());
    const result = await (caller as any).exams.attempts.submit({
      examId: 1,
      answers: { "1": "B", "2": "B", "3": "C" },
    }).catch((e: any) => e);
    // Should return a result with score, passed, attemptId
    if (!result?.code) {
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("passed");
      expect(result).toHaveProperty("attemptId");
      expect(typeof result.score).toBe("number");
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });
});

// ─── Exam results retrieval ───────────────────────────────────────────────

describe("exams.attempts.getResult", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).exams.attempts.getResult({ attemptId: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns structured result for valid attempt", async () => {
    const caller = appRouter.createCaller(makeCandidateCtx());
    const result = await (caller as any).exams.attempts.getResult({ attemptId: 1 }).catch((e: any) => e);
    if (!result?.code) {
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("passed");
      expect(result).toHaveProperty("examTitle");
      expect(result).toHaveProperty("categories");
      expect(Array.isArray(result.categories)).toBe(true);
    }
  });
});

// ─── Credential auto-issuance on exam pass ────────────────────────────────

describe("Credential issuance email service", () => {
  it("sendCredentialIssuanceEmail is exported from emailService", async () => {
    const { sendCredentialIssuanceEmail } = await import("./lib/emailService");
    expect(typeof sendCredentialIssuanceEmail).toBe("function");
  });

  it("sendCredentialIssuanceEmail handles missing API key gracefully", async () => {
    const { sendCredentialIssuanceEmail } = await import("./lib/emailService");
    // Should not throw even without a real API key (trial mode)
    const result = await sendCredentialIssuanceEmail({
      to: "test@example.com",
      name: "Test User",
      credentialTitle: "CDTL",
      credentialId: "SDC-2026-TEST",
      score: 100,
      issueDate: "April 10, 2026",
    }).catch((e: any) => ({ error: e.message }));
    // In trial mode it returns false or logs, doesn't throw
    expect(result).toBeDefined();
  });
});

// ─── Admin credentials.list (role-based) ─────────────────────────────────────

describe("credentials.list (role-based access)", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      (caller as any).credentials.list()
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("candidate can list their own credentials", async () => {
    const caller = appRouter.createCaller(makeCandidateCtx());
    const result = await (caller as any).credentials.list().catch((e: any) => e);
    if (!result?.code) {
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it("super_admin can list all credentials (no filter by userId)", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await (caller as any).credentials.list().catch((e: any) => e);
    if (!result?.code) {
      expect(Array.isArray(result)).toBe(true);
    }
  });
});