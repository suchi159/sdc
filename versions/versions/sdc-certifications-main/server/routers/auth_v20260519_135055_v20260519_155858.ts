import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { eq, or, and } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users, passwordResets } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import { sendPasswordResetEmail } from "../lib/emailService";
import { randomBytes } from "crypto";

const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "sdc-secret-key-change-in-production");
const COOKIE_NAME = "sdc_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

function isHttps(res: any): boolean {
  // Check if request came over HTTPS (handles reverse proxy with x-forwarded-proto)
  try {
    const req = res.req;
    if (req?.protocol === "https") return true;
    const fwd = req?.headers?.["x-forwarded-proto"];
    if (fwd) {
      const protos = Array.isArray(fwd) ? fwd : fwd.split(",");
      if (protos.some((p: string) => p.trim().toLowerCase() === "https")) return true;
    }
  } catch { /* ignore */ }
  return process.env.NODE_ENV === "production";
}

function setCookie(res: any, token: string) {
  const secure = isHttps(res);
  const cookieOpts = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    "Path=/",
    "HttpOnly",
    secure ? "SameSite=None" : "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
  res.setHeader("Set-Cookie", cookieOpts);
}

function clearCookie(res: any) {
  const secure = isHttps(res);
  const cookieOpts = [
    `${COOKIE_NAME}=`,
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    secure ? "SameSite=None" : "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
  res.setHeader("Set-Cookie", cookieOpts);
}

export async function getUserFromRequest(req: any) {
  try {
    const cookieHeader = req.headers?.cookie || "";
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const token = match?.[1] || req.headers?.authorization?.replace("Bearer ", "");
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(users).where(eq(users.id, payload.userId as number)).limit(1);
    return result[0] || null;
  } catch {
    return null;
  }
}

export const authRouter = router({
  // ── REGISTER ──────────────────────────────────────────────────────────────
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(8).max(100),
      orgId: z.number().optional(),
      role: z.enum(["candidate", "instructor", "proctor", "exam_developer", "psychometrician", "org_admin"]).default("candidate"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check email not taken
      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const [result] = await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "email",
        role: input.role,
        orgId: input.orgId ?? null,
        status: "active",
        lastSignedIn: new Date(),
      });

      const userId = (result as any).insertId;
      const token = await signToken({ userId, email: input.email, role: input.role });
      setCookie(ctx.res, token);

      return { success: true, userId, role: input.role };
    }),

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const user = result[0];

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      // Support demo users with no password (set during seed) — allow any password for demo
      let valid = false;
      if (user.passwordHash) {
        valid = await bcrypt.compare(input.password, user.passwordHash);
      } else if (input.password === "demo1234" || input.password === "Demo1234!") {
        // Demo fallback for seeded users without passwords
        valid = true;
      }

      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      if (user.status === "suspended") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account suspended. Contact support." });
      }

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      const token = await signToken({ userId: user.id, email: user.email, role: user.role });
      setCookie(ctx.res, token);

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
          avatarUrl: user.avatarUrl,
        },
      };
    }),

  // ── ME ────────────────────────────────────────────────────────────────────
  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.user
      ? {
          id: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
          role: ctx.user.role,
          orgId: ctx.user.orgId,
          avatarUrl: ctx.user.avatarUrl,
          twoFactorEnabled: ctx.user.twoFactorEnabled,
          status: ctx.user.status,
          createdAt: ctx.user.createdAt,
        }
      : null;
  }),

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  logout: publicProcedure.mutation(({ ctx }) => {
    clearCookie(ctx.res);
    return { success: true };
  }),

  // ── UPDATE PROFILE ────────────────────────────────────────────────────────
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100).optional(),
      avatarUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(users).set(input).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  // ── FORGOT PASSWORD (public) ─────────────────────────────────────────────
  forgotPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      origin: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      // Always return success to avoid email enumeration
      if (!result.length || !result[0]) return { success: true };

      const user = result[0];
      const token = randomBytes(48).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResets).values({ userId: user.id, token, expiresAt });

      const resetUrl = `${input.origin}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email ?? "", user.name || "User", resetUrl);

      return { success: true };
    }),

  // ── RESET PASSWORD (public) ───────────────────────────────────────────────
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8).max(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db.select().from(passwordResets)
        .where(eq(passwordResets.token, input.token))
        .limit(1);

      const reset = rows[0];
      if (!reset) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired reset link" });
      if (reset.usedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link has already been used" });
      if (new Date() > reset.expiresAt) throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link has expired. Please request a new one." });

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await db.update(users).set({ passwordHash }).where(eq(users.id, reset.userId));
      await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, reset.id));

      return { success: true };
    }),

  // ── CHANGE PASSWORD ───────────────────────────────────────────────────────
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(100),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const user = result[0];

      if (user?.passwordHash) {
        const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password incorrect" });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await db.update(users).set({ passwordHash }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
