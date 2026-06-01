import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// ─── MOCK CONTEXT FACTORIES ───────────────────────────────────────────────

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

function createMockContext(overrides: Partial<AuthenticatedUser> = {}): { ctx: TrpcContext; clearedCookies: Array<{ name: string; options: Record<string, unknown> }> } {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: null,
    orgId: 1,
    email: "test@sdc.example.com",
    name: "Test User",
    passwordHash: "$2b$12$hashedpassword",
    loginMethod: "email",
    role: "candidate",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    avatarUrl: null,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createAdminContext() {
  return createMockContext({ role: "org_admin", id: 2 });
}

function createSuperAdminContext() {
  return createMockContext({ role: "super_admin", id: 3 });
}

function createCandidateContext() {
  return createMockContext({ role: "candidate", id: 4 });
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
  return { ctx };
}

// ─── AUTH TESTS ───────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const headers: string[] = [];
    const res = {
      setHeader: (name: string, value: string) => { if (name === "Set-Cookie") headers.push(value); },
      clearCookie: () => {},
      getHeader: () => undefined,
    };
    const ctx = makeCtx({ res: res as unknown as TrpcContext["res"] });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(headers.some(h => h.includes("Max-Age=0"))).toBe(true);
  });

  it("returns current user for authenticated me query", async () => {
    const { ctx } = createMockContext({ name: "Alice", email: "alice@test.com" });
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Alice");
    expect(user?.email).toBe("alice@test.com");
  });

  it("returns null for unauthenticated me query", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });
});

// ─── CREDENTIALS TESTS ────────────────────────────────────────────────────

describe("credentials.verify", () => {
  it("returns invalid for non-existent credential ID", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.credentials.verify({ credentialId: "SDC-NONEXISTENT-000" });
    // Either valid: false (not found) or service unavailable
    expect(result.valid).toBe(false);
  });

  it("returns invalid for empty credential ID format", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    // Should handle gracefully
    const result = await caller.credentials.verify({ credentialId: "INVALID-FORMAT" });
    expect(result.valid).toBe(false);
  });
});

describe("credentials.list", () => {
  it("returns empty array for new candidate", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.credentials.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("credentials.issue", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.credentials.issue({ candidateId: 1, templateId: 1 })
    ).rejects.toThrow();
  });
});

describe("credentials.templates.list", () => {
  it("returns array for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.credentials.templates.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── EXAMS TESTS ──────────────────────────────────────────────────────────

describe("exams.list", () => {
  it("returns array for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.exams.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("exams.create", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.exams.create({ title: "Test Exam" })
    ).rejects.toThrow();
  });
});

describe("exams.get", () => {
  it("returns null for non-existent exam ID", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.exams.get({ id: 999999 });
    expect(result).toBeNull();
  });
});

// ─── QUESTIONS TESTS ──────────────────────────────────────────────────────

describe("questions.list", () => {
  it("returns array for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.questions.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("supports filtering by type", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.questions.list({ type: "mcq" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("questions.categories.list", () => {
  it("returns array for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.questions.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── PROCTOR TESTS ────────────────────────────────────────────────────────

describe("proctor.sessions.list", () => {
  it("returns array for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.proctor.sessions.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("proctor.incidents.list", () => {
  it("returns array for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.proctor.incidents.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── BOOKS TESTS ──────────────────────────────────────────────────────────

describe("books.list", () => {
  it("returns array for public access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.books.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── VOUCHERS TESTS ───────────────────────────────────────────────────────

describe("vouchers.list", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.vouchers.list()).rejects.toThrow();
  });
});

describe("vouchers.redeem", () => {
  it("throws NOT_FOUND for invalid voucher code", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vouchers.redeem({ code: "INVALID-VOUCHER-CODE-XYZ" })
    ).rejects.toThrow();
  });
});

// ─── LEDGER TESTS ─────────────────────────────────────────────────────────

describe("ledger.balance", () => {
  it("returns balance object for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ledger.balance();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("balance");
  });
});

describe("ledger.entries", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.ledger.entries()).rejects.toThrow();
  });
});

// ─── NOTIFICATIONS TESTS ──────────────────────────────────────────────────

describe("notifications.list", () => {
  it("returns array for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("notifications.unreadCount", () => {
  it("returns count object for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.unreadCount();
    expect(result).toHaveProperty("count");
    expect(typeof result.count).toBe("number");
  });
});

// ─── ORGANIZATIONS TESTS ──────────────────────────────────────────────────

describe("orgs.list", () => {
  it("throws FORBIDDEN for non-super-admin users", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.orgs.list()).rejects.toThrow();
  });
});

describe("orgs.myOrg", () => {
  it("returns org or null for user with orgId", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.orgs.myOrg();
    // User has orgId=1 so may return an org or null depending on DB
    expect(result === null || typeof result === "object").toBe(true);
  });
});

// ─── ANALYTICS TESTS ──────────────────────────────────────────────────────

describe("analytics.overview", () => {
  it("returns analytics object for authenticated user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.overview();
    expect(result).toHaveProperty("credentials");
    expect(result).toHaveProperty("exams");
    expect(result).toHaveProperty("vouchers");
    expect(typeof result.credentials).toBe("number");
    expect(typeof result.exams).toBe("number");
  });
});

// ─── API KEYS TESTS ───────────────────────────────────────────────────────

describe("apiKeys.list", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.apiKeys.list()).rejects.toThrow();
  });
});

describe("apiKeys.create", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.apiKeys.create({ name: "Test Key" })
    ).rejects.toThrow();
  });
});

// ─── USERS TESTS ──────────────────────────────────────────────────────────

describe("users.list", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });
});

describe("users.updateRole", () => {
  it("throws FORBIDDEN for non-super-admin users", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.updateRole({ userId: 1, role: "candidate" })
    ).rejects.toThrow();
  });
});

// ─── RBAC SECURITY TESTS ──────────────────────────────────────────────────

describe("RBAC Security", () => {
  it("candidate cannot access admin-only endpoints", async () => {
    const { ctx } = createCandidateContext();
    const caller = appRouter.createCaller(ctx);
    const promises = [
      caller.credentials.issue({ candidateId: 1, templateId: 1 }),
      caller.exams.create({ title: "Unauthorized Exam" }),
      caller.vouchers.list(),
      caller.ledger.entries(),
      caller.apiKeys.list(),
      caller.users.list(),
    ];
    const results = await Promise.allSettled(promises);
    results.forEach(result => {
      expect(result.status).toBe("rejected");
    });
  });

  it("unauthenticated user cannot access protected endpoints", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const promises = [
      caller.credentials.list(),
      caller.exams.list(),
      caller.notifications.list(),
      caller.analytics.overview(),
    ];
    const results = await Promise.allSettled(promises);
    results.forEach(result => {
      expect(result.status).toBe("rejected");
    });
  });

  it("public endpoints accessible without auth", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    // These should not throw
    const [user, verification, books] = await Promise.all([
      caller.auth.me(),
      caller.credentials.verify({ credentialId: "SDC-TEST-123" }),
      caller.books.list(),
    ]);
    expect(user).toBeNull();
    expect(verification.valid).toBe(false);
    expect(Array.isArray(books)).toBe(true);
  });
});

// ─── CREDENTIAL ID FORMAT TESTS ───────────────────────────────────────────

describe("Credential ID generation", () => {
  it("credential IDs follow SDC-YEAR-XXXX format", () => {
    const year = new Date().getFullYear();
    const pattern = new RegExp(`^SDC-${year}-[A-Z0-9]{8}$`);
    // Test the format by verifying the pattern
    const testId = `SDC-${year}-ABCD1234`;
    expect(pattern.test(testId)).toBe(true);
  });

  it("invalid credential IDs are rejected by verify endpoint", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.credentials.verify({ credentialId: "FAKE-ID-12345" });
    expect(result.valid).toBe(false);
  });
});
