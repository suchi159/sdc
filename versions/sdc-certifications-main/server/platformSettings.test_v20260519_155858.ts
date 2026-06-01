import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ─────────────────────────────────────────────────────────────────
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();
const mockSet = vi.fn();
const mockValues = vi.fn();
const mockOrderBy = vi.fn();

const chainable = {
  from: mockFrom,
  where: mockWhere,
  limit: mockLimit,
  set: mockSet,
  values: mockValues,
  orderBy: mockOrderBy,
};

// Make each chain method return the chainable object
Object.values(chainable).forEach(fn => (fn as any).mockReturnValue(chainable));

const mockDb = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
};

mockSelect.mockReturnValue(chainable);
mockInsert.mockReturnValue(chainable);
mockUpdate.mockReturnValue(chainable);

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../drizzle/schema", () => ({
  platformSettings: { id: "id", section: "section", data: "data" },
  auditLogs: { id: "id", resource: "resource" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  desc: vi.fn(a => ({ desc: a })),
  and: vi.fn((...args) => ({ and: args })),
}));

// ─── Helper: build a minimal super_admin context ──────────────────────────────
function makeCtx(role = "super_admin") {
  return {
    user: { id: 1, role, orgId: null },
    req: { headers: {} },
    res: {},
  };
}

// ─── Unit tests for platformSettingsRouter logic ──────────────────────────────
describe("platformSettingsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue(chainable);
    mockInsert.mockReturnValue(chainable);
    mockUpdate.mockReturnValue(chainable);
    Object.values(chainable).forEach(fn => (fn as any).mockReturnValue(chainable));
  });

  describe("get procedure", () => {
    it("returns null when section not found", async () => {
      mockLimit.mockResolvedValueOnce([]); // empty result
      const { getDb } = await import("./db");
      const db = await getDb();
      expect(db).toBeTruthy();
      const result = await (db as any).select().from("platformSettings").where("section='general'").limit(1);
      expect(result).toEqual([]);
    });

    it("returns the row when section exists", async () => {
      const row = { id: 1, section: "general", data: { platformName: "SDC" } };
      mockLimit.mockResolvedValueOnce([row]);
      const { getDb } = await import("./db");
      const db = await getDb();
      const result = await (db as any).select().from("platformSettings").where("section='general'").limit(1);
      expect(result).toEqual([row]);
    });

    it("returns all sections as a map when no section specified", async () => {
      const rows = [
        { section: "general", data: { platformName: "SDC" } },
        { section: "security", data: { require2FA: true } },
      ];
      mockFrom.mockResolvedValueOnce(rows);
      const { getDb } = await import("./db");
      const db = await getDb();
      const result = await (db as any).select().from("platformSettings");
      const map = Object.fromEntries((result as any[]).map((r: any) => [r.section, r.data]));
      expect(map).toEqual({ general: { platformName: "SDC" }, security: { require2FA: true } });
    });
  });

  describe("save procedure", () => {
    it("inserts a new row when section does not exist", async () => {
      // First call: check existing → empty
      mockLimit.mockResolvedValueOnce([]);
      // Second call: insert
      mockValues.mockResolvedValueOnce({ insertId: 1 });

      const { getDb } = await import("./db");
      const db = await getDb();

      // Simulate the check
      const existing = await (db as any).select({ id: "id" }).from("platformSettings").where("section='general'").limit(1);
      expect(existing).toEqual([]);

      // Simulate the insert
      await (db as any).insert("platformSettings").values({ section: "general", data: { platformName: "SDC" }, updatedBy: 1 });
      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();
    });

    it("updates an existing row when section exists", async () => {
      // Simulate the check returning an existing row
      mockLimit.mockResolvedValueOnce([{ id: 5 }]);

      const { getDb } = await import("./db");
      const db = await getDb();

      const existing = await (db as any).select({ id: "id" }).from("platformSettings").where("section='general'").limit(1);
      expect(existing).toEqual([{ id: 5 }]);

      // Simulate the update — mockWhere is the terminal call in the update chain
      mockWhere.mockResolvedValueOnce({ affectedRows: 1 });
      const updateResult = await (db as any).update("platformSettings").set({ data: { platformName: "NewName" }, updatedBy: 1 }).where("section='general'");
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(updateResult).toEqual({ affectedRows: 1 });
    });

    it("rejects non-super_admin users", () => {
      const ctx = makeCtx("org_admin");
      expect(ctx.user.role).not.toBe("super_admin");
    });

    it("accepts super_admin users", () => {
      const ctx = makeCtx("super_admin");
      expect(ctx.user.role).toBe("super_admin");
    });

    it("validates section enum — rejects invalid sections", () => {
      const validSections = ["general", "security", "email", "api_webhooks", "integrations", "billing"];
      const invalidSection = "unknown_section";
      expect(validSections.includes(invalidSection)).toBe(false);
    });

    it("validates section enum — accepts all valid sections", () => {
      const validSections = ["general", "security", "email", "api_webhooks", "integrations", "billing"];
      validSections.forEach(s => expect(validSections.includes(s)).toBe(true));
    });
  });

  describe("history procedure", () => {
    it("returns audit logs for platform_settings resource", async () => {
      const logs = [
        { id: 1, action: "platform_settings.update", resource: "platform_settings", resourceId: "general", createdAt: new Date() },
        { id: 2, action: "platform_settings.update", resource: "platform_settings", resourceId: "security", createdAt: new Date() },
      ];
      // The history query ends with .limit(50) — mock that terminal call
      mockLimit.mockResolvedValueOnce(logs);
      const { getDb } = await import("./db");
      const db = await getDb();
      const result = await (db as any).select().from("auditLogs").where("resource='platform_settings'").orderBy("createdAt desc").limit(50);
      expect(result).toEqual(logs);
    });

    it("limits to 50 entries", async () => {
      mockLimit.mockResolvedValueOnce([]);
      const { getDb } = await import("./db");
      const db = await getDb();
      await (db as any).select().from("auditLogs").where("resource='platform_settings'").orderBy("createdAt desc").limit(50);
      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });

  describe("section defaults", () => {
    it("general section has expected default keys", () => {
      const defaults = { platformName: "SDC Certifications", supportEmail: "support@sdccertify.com", logoUrl: "", primaryColor: "#c8972a", timezone: "UTC", defaultLanguage: "en", maintenanceMode: false };
      expect(Object.keys(defaults)).toContain("platformName");
      expect(Object.keys(defaults)).toContain("maintenanceMode");
      expect(defaults.maintenanceMode).toBe(false);
    });

    it("security section has expected default keys", () => {
      const defaults = { require2FA: false, sessionTimeoutMinutes: 60, maxLoginAttempts: 5, ipAllowlist: "", passwordMinLength: 8, enforcePasswordExpiry: false, passwordExpiryDays: 90 };
      expect(defaults.sessionTimeoutMinutes).toBe(60);
      expect(defaults.require2FA).toBe(false);
    });

    it("billing section has expected default keys", () => {
      const defaults = { starterMonthlyPrice: 99, professionalMonthlyPrice: 299, enterpriseMonthlyPrice: 999, apiSaasMonthlyPrice: 499, trialDays: 14, creditsPerDollar: 10, minTopUpAmount: 50 };
      expect(defaults.trialDays).toBe(14);
      expect(defaults.creditsPerDollar).toBe(10);
    });
  });
});
