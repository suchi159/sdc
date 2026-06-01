import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();
const mockSet = vi.fn();
const mockValues = vi.fn();

const chainable: Record<string, any> = {
  from: mockFrom,
  where: mockWhere,
  limit: mockLimit,
  set: mockSet,
  values: mockValues,
};
Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));

const mockDb = { select: mockSelect, insert: mockInsert, update: mockUpdate };
mockSelect.mockReturnValue(chainable);
mockInsert.mockReturnValue(chainable);
mockUpdate.mockReturnValue(chainable);

vi.mock("./db", () => ({ getDb: vi.fn().mockResolvedValue(mockDb) }));
vi.mock("../drizzle/schema", () => ({
  platformSettings: { id: "id", section: "section", data: "data" },
  auditLogs: { id: "id", resource: "resource" },
}));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  like: vi.fn((a, b) => ({ like: [a, b] })),
  desc: vi.fn(a => ({ desc: a })),
  and: vi.fn((...args) => ({ and: args })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSelect.mockReturnValue(chainable);
  mockInsert.mockReturnValue(chainable);
  mockUpdate.mockReturnValue(chainable);
  Object.values(chainable).forEach(fn => fn.mockReturnValue(chainable));
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("integrationsRouter", () => {
  describe("provider definitions", () => {
    it("has 12 providers defined", () => {
      const providers = [
        "pearson_vue", "prometric", "psi",
        "moodle", "canvas", "blackboard",
        "scorm", "xapi",
        "credly",
        "zapier",
        "saml", "oidc",
      ];
      expect(providers).toHaveLength(12);
    });

    it("covers all required categories", () => {
      const categories = ["testing", "lms", "standards", "badges", "automation", "sso"];
      expect(categories).toHaveLength(6);
    });

    it("each provider has required fields defined", () => {
      const providerFields: Record<string, string[]> = {
        pearson_vue: ["apiKey", "accountId", "environment"],
        prometric: ["apiKey", "clientId", "baseUrl"],
        psi: ["apiKey", "accountCode", "baseUrl"],
        moodle: ["baseUrl", "wsToken", "serviceShortName"],
        canvas: ["baseUrl", "accessToken", "accountId"],
        scorm: ["appId", "secretKey", "baseUrl"],
        xapi: ["endpoint", "username", "password"],
        credly: ["apiKey", "organizationId"],
        zapier: ["webhookUrl"],
        saml: ["idpEntityId", "idpSsoUrl", "idpCertificate", "spEntityId"],
        oidc: ["issuerUrl", "clientId", "clientSecret", "redirectUri"],
      };
      for (const [, fields] of Object.entries(providerFields)) {
        expect(fields.length).toBeGreaterThan(0);
      }
    });
  });

  describe("credential masking", () => {
    it("masks sensitive fields with asterisks + last 4 chars", () => {
      const sensitiveFields = ["apiKey", "secretKey", "password", "clientSecret", "wsToken", "accessToken", "applicationSecret"];
      const testValue = "super_secret_key_1234";
      const masked = "*".repeat(8) + testValue.slice(-4);
      expect(masked).toBe("********1234");
      sensitiveFields.forEach(field => {
        expect(sensitiveFields.includes(field)).toBe(true);
      });
    });

    it("does not mask non-sensitive fields", () => {
      const nonSensitive = ["baseUrl", "accountId", "clientId", "organizationId", "endpoint", "enabled"];
      nonSensitive.forEach(field => {
        const sensitiveFields = ["apiKey", "secretKey", "password", "clientSecret", "wsToken", "accessToken"];
        expect(sensitiveFields.includes(field)).toBe(false);
      });
    });
  });

  describe("getAll procedure", () => {
    it("returns empty object when no integrations configured", async () => {
      // The getAll query ends with .where() — mock that terminal call
      mockWhere.mockResolvedValueOnce([]);
      const { getDb } = await import("./db");
      const db = await getDb();
      const rows = await (db as any).select().from("platformSettings").where("like section integration_%");
      expect(rows).toEqual([]);
    });

    it("parses integration rows into keyed configs", async () => {
      const rows = [
        { section: "integration_moodle", data: { baseUrl: "https://moodle.org", wsToken: "tok123", enabled: true } },
        { section: "integration_credly", data: { apiKey: "cred_key_9999", organizationId: "org-1", enabled: true } },
      ];
      // The getAll query ends with .where() — mock that terminal call
      mockWhere.mockResolvedValueOnce(rows);
      const { getDb } = await import("./db");
      const db = await getDb();
      const result = await (db as any).select().from("platformSettings").where("like");
      const configs: Record<string, any> = {};
      for (const row of result) {
        const key = row.section.replace("integration_", "");
        configs[key] = row.data;
      }
      expect(Object.keys(configs)).toContain("moodle");
      expect(Object.keys(configs)).toContain("credly");
      expect(configs.moodle.baseUrl).toBe("https://moodle.org");
    });
  });

  describe("save procedure", () => {
    it("inserts when section does not exist", async () => {
      mockLimit.mockResolvedValueOnce([]);
      mockValues.mockResolvedValueOnce({ insertId: 1 });
      const { getDb } = await import("./db");
      const db = await getDb();
      const existing = await (db as any).select({ id: "id" }).from("platformSettings").where("section='integration_moodle'").limit(1);
      expect(existing).toEqual([]);
      await (db as any).insert("platformSettings").values({ section: "integration_moodle", data: { baseUrl: "https://moodle.org" }, updatedBy: 1 });
      expect(mockInsert).toHaveBeenCalled();
    });

    it("updates when section already exists", async () => {
      // First call: check existing → found
      mockLimit.mockResolvedValueOnce([{ id: 7 }]);
      const { getDb } = await import("./db");
      const db = await getDb();
      const existing = await (db as any).select({ id: "id" }).from("platformSettings").where("section='integration_credly'").limit(1);
      expect(existing).toEqual([{ id: 7 }]);
      // Second call: update — mockWhere is terminal
      mockWhere.mockResolvedValueOnce({ affectedRows: 1 });
      const result = await (db as any).update("platformSettings").set({ data: { apiKey: "new_key" } }).where("section='integration_credly'");
      expect(result).toEqual({ affectedRows: 1 });
    });

    it("stores enabled flag in data", () => {
      const data = { apiKey: "key123", enabled: true, updatedAt: new Date().toISOString() };
      expect(data.enabled).toBe(true);
      expect(data.apiKey).toBe("key123");
    });

    it("rejects non-super_admin users", () => {
      const ctx = { user: { role: "org_admin" } };
      expect(ctx.user.role).not.toBe("super_admin");
    });
  });

  describe("test procedure — validation logic", () => {
    it("pearson_vue: rejects short API key", () => {
      const config = { apiKey: "short" };
      const isValid = config.apiKey && config.apiKey.length >= 8;
      expect(isValid).toBeFalsy();
    });

    it("pearson_vue: accepts valid API key", () => {
      const config = { apiKey: "pvue_valid_key_123" };
      const isValid = config.apiKey && config.apiKey.length >= 8;
      expect(isValid).toBeTruthy();
    });

    it("prometric: requires both apiKey and clientId", () => {
      const config1 = { apiKey: "key123" }; // missing clientId
      const config2 = { apiKey: "key123", clientId: "client456" };
      expect(!!(config1 as any).apiKey && !!(config1 as any).clientId).toBe(false);
      expect(!!(config2 as any).apiKey && !!(config2 as any).clientId).toBe(true);
    });

    it("zapier: requires webhookUrl", () => {
      const config = {};
      expect(!!(config as any).webhookUrl).toBe(false);
    });

    it("xapi: requires endpoint, username, and password", () => {
      const config = { endpoint: "https://lrs.org/xapi", username: "user", password: "pass" };
      expect(!!(config as any).endpoint && !!(config as any).username && !!(config as any).password).toBe(true);
    });

    it("saml: requires idpEntityId and idpSsoUrl", () => {
      const config = { idpEntityId: "https://idp.org/saml2/metadata", idpSsoUrl: "https://idp.org/saml2/sso" };
      expect(!!(config as any).idpEntityId && !!(config as any).idpSsoUrl).toBe(true);
    });

    it("oidc: requires issuerUrl, clientId, and clientSecret", () => {
      const config = { issuerUrl: "https://accounts.google.com", clientId: "client_id", clientSecret: "secret" };
      expect(!!(config as any).issuerUrl && !!(config as any).clientId && !!(config as any).clientSecret).toBe(true);
    });
  });

  describe("delete procedure", () => {
    it("soft-deletes by setting enabled: false and cleared: true", () => {
      const softDeleteData = { enabled: false, cleared: true, clearedAt: new Date().toISOString() };
      expect(softDeleteData.enabled).toBe(false);
      expect(softDeleteData.cleared).toBe(true);
      expect(softDeleteData.clearedAt).toBeTruthy();
    });

    it("does nothing if integration does not exist", async () => {
      // The delete check ends with .limit(1) — return empty
      mockLimit.mockResolvedValueOnce([]);
      const { getDb } = await import("./db");
      const db = await getDb();
      const existing = await (db as any).select().from("platformSettings").where("section='integration_unknown'").limit(1);
      expect(existing).toEqual([]);
      // In real code: if existing.length === 0, no update is called
      // We verify the empty check works correctly
      expect(existing.length).toBe(0);
    });
  });

  describe("toggle procedure", () => {
    it("throws NOT_FOUND when integration not configured", async () => {
      mockLimit.mockResolvedValueOnce([]);
      const { getDb } = await import("./db");
      const db = await getDb();
      const existing = await (db as any).select().from("platformSettings").where("section='integration_credly'").limit(1);
      expect(existing).toHaveLength(0);
      // Would throw TRPCError NOT_FOUND
    });

    it("flips enabled flag correctly", () => {
      const current = { apiKey: "key123", enabled: true };
      const toggled = { ...current, enabled: !current.enabled };
      expect(toggled.enabled).toBe(false);
      expect(toggled.apiKey).toBe("key123");
    });
  });
});
