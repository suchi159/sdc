import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  users, credentials, examAttempts, notifications,
  ledgerEntries, stripePayments, auditLogs, bookAccess,
  passwordResets,
} from "../../drizzle/schema";

export const gdprRouter = router({
  // ── EXPORT MY DATA ────────────────────────────────────────────────────────
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userId = ctx.user.id;

    const [
      profile,
      userCredentials,
      attempts,
      userNotifications,
      ledger,
      payments,
      logs,
      access,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(credentials).where(eq(credentials.candidateId, userId)),
      db.select().from(examAttempts).where(eq(examAttempts.candidateId, userId)),
      db.select().from(notifications).where(eq(notifications.userId, userId)),
      db.select().from(ledgerEntries).where(eq(ledgerEntries.userId, userId)),
      db.select().from(stripePayments).where(eq(stripePayments.userId, userId)),
      db.select().from(auditLogs).where(eq(auditLogs.userId, userId)),
      db.select().from(bookAccess).where(eq(bookAccess.userId, userId)),
    ]);

    // Strip sensitive fields from profile
    const safeProfile = profile[0]
      ? {
          id: profile[0].id,
          name: profile[0].name,
          email: profile[0].email,
          role: profile[0].role,
          status: profile[0].status,
          createdAt: profile[0].createdAt,
          lastSignedIn: profile[0].lastSignedIn,
          loginMethod: profile[0].loginMethod,
        }
      : null;

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: safeProfile,
      credentials: userCredentials,
      examAttempts: attempts,
      notifications: userNotifications,
      ledgerEntries: ledger,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt,
      })),
      auditLogs: logs,
      bookAccess: access,
    };

    return { data: exportPayload };
  }),

  // ── DELETE MY ACCOUNT ─────────────────────────────────────────────────────
  deleteAccount: protectedProcedure
    .input(z.object({
      password: z.string().min(1),
      confirmPhrase: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.confirmPhrase !== "DELETE MY ACCOUNT") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Please type DELETE MY ACCOUNT to confirm" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userId = ctx.user.id;
      const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = result[0];
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // Verify password before deletion
      if (user.passwordHash) {
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
      }

      // Anonymise rather than hard-delete to preserve referential integrity
      const anonymisedEmail = `deleted_${userId}_${Date.now()}@deleted.invalid`;
      await db.update(users).set({
        name: "Deleted User",
        email: anonymisedEmail,
        passwordHash: null,
        avatarUrl: null,
        status: "suspended",
        openId: null,
      }).where(eq(users.id, userId));

      // Remove password reset tokens
      await db.delete(passwordResets).where(eq(passwordResets.userId, userId));

      // Revoke all notifications
      await db.delete(notifications).where(eq(notifications.userId, userId));

      return { success: true };
    }),
});
