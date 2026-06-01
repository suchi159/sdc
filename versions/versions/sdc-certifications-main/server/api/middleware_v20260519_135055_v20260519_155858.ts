/**
 * SDC Public REST API — API Key Authentication Middleware
 *
 * Validates Bearer tokens against the api_keys table.
 * Attaches { orgId, keyId } to res.locals for downstream handlers.
 */
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { getDb } from "../db";
import { apiKeys } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface ApiContext {
  orgId: number;
  keyId: number;
  rateLimit: number;
}

/** RFC 7807 Problem Details error response */
export function apiError(
  res: Response,
  status: number,
  title: string,
  detail?: string,
  extra?: Record<string, unknown>
) {
  res.status(status).json({
    type: `https://docs.sdccertify.com/errors/${title.toLowerCase().replace(/\s+/g, "-")}`,
    title,
    status,
    detail: detail ?? title,
    ...extra,
  });
}

/** Authenticate incoming request using Bearer API key */
export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiError(res, 401, "Unauthorized", "Missing or malformed Authorization header. Use: Authorization: Bearer sdc_live_...");
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith("sdc_live_") || rawKey.length < 20) {
    return apiError(res, 401, "Unauthorized", "Invalid API key format. Keys must start with sdc_live_");
  }

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const db = await getDb();
  if (!db) {
    return apiError(res, 503, "Service Unavailable", "Database connection unavailable.");
  }

  const [key] = await db
    .select({
      id: apiKeys.id,
      orgId: apiKeys.orgId,
      status: apiKeys.status,
      rateLimit: apiKeys.rateLimit,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.status, "active")))
    .limit(1);

  if (!key) {
    return apiError(res, 401, "Unauthorized", "API key not found or has been revoked.");
  }

  if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
    return apiError(res, 401, "Unauthorized", "API key has expired.");
  }

  // Update lastUsedAt asynchronously (fire-and-forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))
    .catch(() => {});

  res.locals.apiCtx = {
    orgId: key.orgId,
    keyId: key.id,
    rateLimit: key.rateLimit ?? 1000,
  } satisfies ApiContext;

  next();
}
