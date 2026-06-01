/**
 * Tests for the SDC Public REST API v1
 *
 * Covers:
 * - Middleware: rejects missing/malformed auth headers
 * - Middleware: rejects invalid key format
 * - Routes: /api/v1/openapi.json is accessible without auth
 * - Routes: protected endpoints return 401 without a valid key
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import apiV1Router from "./routes";

// Mock the database to avoid real DB calls in unit tests
vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", apiV1Router);
  return app;
}

describe("SDC REST API v1 — Authentication Middleware", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/v1/exams");
    expect(res.status).toBe(401);
    expect(res.body.title).toBe("Unauthorized");
    expect(res.body.detail).toMatch(/Missing or malformed/);
  });

  it("returns 401 when Authorization header does not start with Bearer", async () => {
    const app = buildApp();
    const res = await request(app)
      .get("/api/v1/exams")
      .set("Authorization", "Basic abc123");
    expect(res.status).toBe(401);
    expect(res.body.title).toBe("Unauthorized");
  });

  it("returns 401 when API key format is invalid (no sdc_live_ prefix)", async () => {
    const app = buildApp();
    const res = await request(app)
      .get("/api/v1/exams")
      .set("Authorization", "Bearer invalid_key_format");
    expect(res.status).toBe(401);
    expect(res.body.detail).toMatch(/Invalid API key format/);
  });

  it("returns 401 when key looks valid but DB is unavailable (null db)", async () => {
    const app = buildApp();
    const res = await request(app)
      .get("/api/v1/exams")
      .set("Authorization", "Bearer sdc_live_validlookingkeybutnotreal1234567890");
    // DB is mocked to return null → 503
    expect(res.status).toBe(503);
    expect(res.body.title).toBe("Service Unavailable");
  });
});

describe("SDC REST API v1 — Public Routes", () => {
  it("GET /api/v1/openapi.json returns spec without auth", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/v1/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(res.body.info.title).toBe("SDC Certifications API");
    expect(Object.keys(res.body.paths)).toContain("/exams");
    expect(Object.keys(res.body.paths)).toContain("/results");
    expect(Object.keys(res.body.paths)).toContain("/credentials");
    expect(Object.keys(res.body.paths)).toContain("/candidates");
  });

  it("openapi.json includes all 10 expected path entries", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/v1/openapi.json");
    expect(Object.keys(res.body.paths).length).toBe(10);
  });
});

describe("SDC REST API v1 — Error Response Format (RFC 7807)", () => {
  it("error responses include type, title, status, detail fields", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/v1/exams");
    expect(res.body).toHaveProperty("type");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("detail");
    expect(typeof res.body.type).toBe("string");
    expect(res.body.type).toMatch(/^https:\/\//);
  });
});
