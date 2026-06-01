import { z } from "zod";
import { and, eq, gte, lte, ne, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  proctorAvailabilityWindows,
  examBookings,
  exams,
  users,
} from "../../drizzle/schema";
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendProctorBookingNotification,
  sendProctorCancellationNotification,
} from "../lib/emailService";
import { createNotifications } from "../lib/notificationHelper";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Check whether two time ranges overlap */
function overlaps(
  aStart: number, aEnd: number,
  bStart: number, bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const schedulingRouter = router({
  // ── Proctor: publish an availability window ────────────────────────────────
  publishWindow: protectedProcedure
    .input(
      z.object({
        startsAt: z.number().int().positive(),
        endsAt: z.number().int().positive(),
        capacity: z.number().int().min(1).max(50).default(1),
        notes: z.string().max(500).optional(),
        recurrenceDays: z.string().max(20).optional(), // e.g. "1,3,5"
        recurrenceEndsAt: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!["proctor", "org_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only proctors can publish availability" });
      }
      if (input.endsAt <= input.startsAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "endsAt must be after startsAt" });
      }
      const minDuration = 30 * 60 * 1000; // 30 minutes
      if (input.endsAt - input.startsAt < minDuration) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Window must be at least 30 minutes" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [result] = await db.insert(proctorAvailabilityWindows).values({
        proctorId: ctx.user.id,
        orgId: ctx.user.orgId ?? null,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        capacity: input.capacity,
        notes: input.notes ?? null,
        recurrenceDays: input.recurrenceDays ?? null,
        recurrenceEndsAt: input.recurrenceEndsAt ?? null,
        status: "active",
      });
      return { id: (result as any).insertId, success: true };
    }),

  // ── Proctor: list my windows ───────────────────────────────────────────────
  myWindows: protectedProcedure
    .input(
      z.object({
        fromTs: z.number().int().optional(),
        toTs: z.number().int().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!["proctor", "org_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const now = Date.now();
      const from = input?.fromTs ?? now - 7 * 24 * 60 * 60 * 1000;
      const to = input?.toTs ?? now + 60 * 24 * 60 * 60 * 1000;

      const windows = await db
        .select()
        .from(proctorAvailabilityWindows)
        .where(
          and(
            eq(proctorAvailabilityWindows.proctorId, ctx.user.id),
            gte(proctorAvailabilityWindows.startsAt, from),
            lte(proctorAvailabilityWindows.startsAt, to)
          )
        )
        .orderBy(proctorAvailabilityWindows.startsAt);

      return windows;
    }),

  // ── Proctor: cancel a window ───────────────────────────────────────────────
  cancelWindow: protectedProcedure
    .input(z.object({ windowId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [win] = await db
        .select()
        .from(proctorAvailabilityWindows)
        .where(eq(proctorAvailabilityWindows.id, input.windowId));

      if (!win) throw new TRPCError({ code: "NOT_FOUND" });
      if (win.proctorId !== ctx.user.id && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db
        .update(proctorAvailabilityWindows)
        .set({ status: "cancelled" })
        .where(eq(proctorAvailabilityWindows.id, input.windowId));

      // Cancel all pending bookings in this window
      await db
        .update(examBookings)
        .set({
          status: "cancelled_by_proctor",
          cancelledAt: new Date(),
          cancellationReason: "Proctor cancelled the availability window",
        })
        .where(
          and(
            eq(examBookings.windowId, input.windowId),
            eq(examBookings.status, "pending")
          )
        );

      return { success: true };
    }),

  // ── Proctor: list bookings for my windows ──────────────────────────────────
  myBookings: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "cancelled_by_candidate", "cancelled_by_proctor", "completed", "no_show"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!["proctor", "org_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const conditions = [eq(examBookings.proctorId, ctx.user.id)];
      if (input?.status) conditions.push(eq(examBookings.status, input.status));

      const bookings = await db
        .select({
          booking: examBookings,
          candidate: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          exam: {
            id: exams.id,
            title: exams.title,
            timeLimit: exams.timeLimit,
          },
        })
        .from(examBookings)
        .leftJoin(users, eq(examBookings.candidateId, users.id))
        .leftJoin(exams, eq(examBookings.examId, exams.id))
        .where(and(...conditions))
        .orderBy(examBookings.scheduledAt);

      return bookings;
    }),

  // ── Candidate: list available slots ───────────────────────────────────────
  listAvailableSlots: protectedProcedure
    .input(
      z.object({
        examId: z.number().int(),
        fromTs: z.number().int().optional(),
        toTs: z.number().int().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const now = Date.now();
      const from = input.fromTs ?? now;
      const to = input.toTs ?? now + 30 * 24 * 60 * 60 * 1000; // 30 days

      // Get all active windows with remaining capacity
      const windows = await db
        .select({
          window: proctorAvailabilityWindows,
          proctor: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(proctorAvailabilityWindows)
        .leftJoin(users, eq(proctorAvailabilityWindows.proctorId, users.id))
        .where(
          and(
            eq(proctorAvailabilityWindows.status, "active"),
            gte(proctorAvailabilityWindows.startsAt, from),
            lte(proctorAvailabilityWindows.startsAt, to),
            sql`${proctorAvailabilityWindows.bookedCount} < ${proctorAvailabilityWindows.capacity}`
          )
        )
        .orderBy(proctorAvailabilityWindows.startsAt);

      // Fetch the exam to know its duration
      const [exam] = await db
        .select({ timeLimit: exams.timeLimit, title: exams.title })
        .from(exams)
        .where(eq(exams.id, input.examId));

      const durationMs = (exam?.timeLimit ?? 60) * 60 * 1000;

      // Filter windows that are long enough for the exam
      const eligible = windows.filter(
        ({ window: w }) => w.endsAt - w.startsAt >= durationMs
      );

      return {
        slots: eligible,
        examTitle: exam?.title ?? "Unknown Exam",
        examDurationMinutes: exam?.timeLimit ?? 60,
      };
    }),

  // ── Candidate: book a slot ────────────────────────────────────────────────
  bookSlot: protectedProcedure
    .input(
      z.object({
        windowId: z.number().int(),
        examId: z.number().int(),
        scheduledAt: z.number().int().positive(),
        candidateNotes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // 1. Fetch the window
      const [win] = await db
        .select()
        .from(proctorAvailabilityWindows)
        .where(eq(proctorAvailabilityWindows.id, input.windowId));

      if (!win) throw new TRPCError({ code: "NOT_FOUND", message: "Availability window not found" });
      if (win.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This window is no longer available" });
      }
      if (win.bookedCount >= win.capacity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This slot is fully booked" });
      }

      // 2. Fetch exam to get duration
      const [exam] = await db
        .select({ timeLimit: exams.timeLimit })
        .from(exams)
        .where(eq(exams.id, input.examId));

      const durationMinutes = exam?.timeLimit ?? 60;
      const slotEnd = input.scheduledAt + durationMinutes * 60 * 1000;

      // 3. Validate scheduledAt is within the window
      if (input.scheduledAt < win.startsAt || slotEnd > win.endsAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Scheduled time does not fit within the availability window",
        });
      }

      // 4. Check for candidate double-booking (same candidate, overlapping time)
      const existingBookings = await db
        .select()
        .from(examBookings)
        .where(
          and(
            eq(examBookings.candidateId, ctx.user.id),
            ne(examBookings.status, "cancelled_by_candidate"),
            ne(examBookings.status, "cancelled_by_proctor")
          )
        );

      for (const b of existingBookings) {
        const bEnd = b.scheduledAt + b.durationMinutes * 60 * 1000;
        if (overlaps(input.scheduledAt, slotEnd, b.scheduledAt, bEnd)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You already have a booking that overlaps with this time slot",
          });
        }
      }

      // 5. Insert booking
      const [result] = await db.insert(examBookings).values({
        candidateId: ctx.user.id,
        proctorId: win.proctorId,
        examId: input.examId,
        windowId: input.windowId,
        orgId: ctx.user.orgId ?? null,
        scheduledAt: input.scheduledAt,
        durationMinutes,
        status: "confirmed",
        candidateNotes: input.candidateNotes ?? null,
      });

      // 6. Increment bookedCount on the window
      await db
        .update(proctorAvailabilityWindows)
        .set({
          bookedCount: sql`${proctorAvailabilityWindows.bookedCount} + 1`,
          status: win.bookedCount + 1 >= win.capacity ? "full" : "active",
        })
        .where(eq(proctorAvailabilityWindows.id, input.windowId));

      const bookingId = (result as any).insertId;

      // 7. Fetch candidate and proctor details for the confirmation email
      try {
        const [candidateRow] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, ctx.user.id));
        const [proctorRow] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, win.proctorId));
        const [examRow] = await db
          .select({ title: exams.title })
          .from(exams)
          .where(eq(exams.id, input.examId));

        const emailPromises: Promise<boolean>[] = [];
        if (candidateRow?.email) {
          emailPromises.push(sendBookingConfirmation({
            candidateName: candidateRow.name ?? "Candidate",
            candidateEmail: candidateRow.email,
            proctorName: proctorRow?.name ?? "Your Proctor",
            examTitle: examRow?.title ?? "Exam",
            scheduledAt: input.scheduledAt,
            durationMinutes,
            bookingId,
            examId: input.examId,
            candidateNotes: input.candidateNotes,
          }));
        }
        // Also notify the proctor
        const [proctorFullRow] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, win.proctorId));
        if (proctorFullRow?.email) {
          emailPromises.push(sendProctorBookingNotification({
            proctorName: proctorFullRow.name ?? "Proctor",
            proctorEmail: proctorFullRow.email,
            candidateName: candidateRow?.name ?? "Candidate",
            candidateEmail: candidateRow?.email ?? "",
            examTitle: examRow?.title ?? "Exam",
            scheduledAt: input.scheduledAt,
            durationMinutes,
            bookingId,
            candidateNotes: input.candidateNotes,
          }));
        }
        await Promise.allSettled(emailPromises);

        // In-app notifications
        const notifItems = [];
        notifItems.push({
          userId: ctx.user.id,
          orgId: ctx.user.orgId ?? null,
          type: "booking_confirmed" as const,
          title: "Exam Booking Confirmed",
          message: `Your booking for "${examRow?.title ?? "Exam"}" on ${new Date(input.scheduledAt).toLocaleString()} has been confirmed.`,
          actionUrl: "/candidate/schedule",
        });
        if (win.proctorId) {
          notifItems.push({
            userId: win.proctorId,
            orgId: ctx.user.orgId ?? null,
            type: "booking_new" as const,
            title: "New Booking Received",
            message: `${candidateRow?.name ?? "A candidate"} booked "${examRow?.title ?? "Exam"}" on ${new Date(input.scheduledAt).toLocaleString()}.`,
            actionUrl: "/proctor/calendar",
          });
        }
        await createNotifications(notifItems);
      } catch (emailErr) {
        // Email failure must never break the booking — log and continue
        console.error("[bookSlot] Email send failed (non-fatal):", emailErr);
      }

      return { bookingId, success: true };
    }),

  // ── Candidate: list my bookings ────────────────────────────────────────────
  mySchedule: protectedProcedure
    .input(
      z.object({
        upcoming: z.boolean().default(true),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const now = Date.now();

      const conditions = [eq(examBookings.candidateId, ctx.user.id)];
      if (input?.upcoming !== false) {
        conditions.push(gte(examBookings.scheduledAt, now));
      }

      const bookings = await db
        .select({
          booking: examBookings,
          exam: {
            id: exams.id,
            title: exams.title,
            timeLimit: exams.timeLimit,
          },
          proctor: {
            id: users.id,
            name: users.name,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(examBookings)
        .leftJoin(exams, eq(examBookings.examId, exams.id))
        .leftJoin(users, eq(examBookings.proctorId, users.id))
        .where(and(...conditions))
        .orderBy(examBookings.scheduledAt);

      return bookings;
    }),

  // ── Candidate: cancel a booking ───────────────────────────────────────────
  cancelBooking: protectedProcedure
    .input(
      z.object({
        bookingId: z.number().int(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [booking] = await db
        .select()
        .from(examBookings)
        .where(eq(examBookings.id, input.bookingId));

      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });

      // Only the candidate themselves or an admin can cancel
      if (booking.candidateId !== ctx.user.id && !["org_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Cannot cancel within 1 hour of the scheduled time
      const oneHourMs = 60 * 60 * 1000;
      if (booking.scheduledAt - Date.now() < oneHourMs) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bookings cannot be cancelled within 1 hour of the scheduled time",
        });
      }

      await db
        .update(examBookings)
        .set({
          status: "cancelled_by_candidate",
          cancelledAt: new Date(),
          cancellationReason: input.reason ?? null,
        })
        .where(eq(examBookings.id, input.bookingId));

      // Decrement bookedCount on the window
      await db
        .update(proctorAvailabilityWindows)
        .set({
          bookedCount: sql`GREATEST(0, ${proctorAvailabilityWindows.bookedCount} - 1)`,
          status: "active",
        })
        .where(eq(proctorAvailabilityWindows.id, booking.windowId));

      // Send cancellation email
      try {
        const [candidateRow] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, booking.candidateId));
        const [examRow] = await db
          .select({ title: exams.title })
          .from(exams)
          .where(eq(exams.id, booking.examId));

        const cancelPromises: Promise<boolean>[] = [];
        if (candidateRow?.email) {
          cancelPromises.push(sendBookingCancellation({
            candidateName: candidateRow.name ?? "Candidate",
            candidateEmail: candidateRow.email,
            examTitle: examRow?.title ?? "Exam",
            scheduledAt: booking.scheduledAt,
            reason: input.reason,
            cancelledBy: "candidate",
          }));
        }
        // Notify the proctor of the cancellation
        const [proctorRow] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, booking.proctorId));
        if (proctorRow?.email) {
          cancelPromises.push(sendProctorCancellationNotification({
            proctorName: proctorRow.name ?? "Proctor",
            proctorEmail: proctorRow.email,
            candidateName: candidateRow?.name ?? "Candidate",
            examTitle: examRow?.title ?? "Exam",
            scheduledAt: booking.scheduledAt,
            reason: input.reason,
          }));
        }
        await Promise.allSettled(cancelPromises);

        // In-app notifications
        const cancelNotifs = [];
        cancelNotifs.push({
          userId: booking.candidateId,
          orgId: booking.orgId ?? null,
          type: "booking_cancelled" as const,
          title: "Booking Cancelled",
          message: `Your booking for "${examRow?.title ?? "Exam"}" on ${new Date(booking.scheduledAt).toLocaleString()} has been cancelled.`,
          actionUrl: "/candidate/schedule",
        });
        if (booking.proctorId) {
          cancelNotifs.push({
            userId: booking.proctorId,
            orgId: booking.orgId ?? null,
            type: "booking_cancelled" as const,
            title: "Booking Cancelled by Candidate",
            message: `${candidateRow?.name ?? "A candidate"} cancelled their booking for "${examRow?.title ?? "Exam"}" on ${new Date(booking.scheduledAt).toLocaleString()}.`,
            actionUrl: "/proctor/calendar",
          });
        }
        await createNotifications(cancelNotifs);
      } catch (emailErr) {
        console.error("[cancelBooking] Email send failed (non-fatal):", emailErr);
      }

      return { success: true };
    }),

  // ── Admin/Proctor: confirm a booking ──────────────────────────────────────
  confirmBooking: protectedProcedure
    .input(z.object({ bookingId: z.number().int(), notes: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!["proctor", "org_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db
        .update(examBookings)
        .set({ status: "confirmed", proctorNotes: input.notes ?? null })
        .where(eq(examBookings.id, input.bookingId));
      return { success: true };
    }),

  // ── Dashboard stats for proctor ────────────────────────────────────────────
  proctorStats: protectedProcedure.query(async ({ ctx }) => {
    if (!["proctor", "org_admin", "super_admin"].includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const now = Date.now();

    const [windows, bookings] = await Promise.all([
      db
        .select()
        .from(proctorAvailabilityWindows)
        .where(eq(proctorAvailabilityWindows.proctorId, ctx.user.id)),
      db
        .select()
        .from(examBookings)
        .where(eq(examBookings.proctorId, ctx.user.id)),
    ]);

    const upcomingBookings = bookings.filter(
      (b) => b.scheduledAt >= now && b.status === "confirmed"
    );
    const totalCapacity = windows
      .filter((w) => w.status === "active")
      .reduce((sum, w) => sum + w.capacity, 0);
    const totalBooked = windows.reduce((sum, w) => sum + w.bookedCount, 0);

    return {
      totalWindows: windows.length,
      activeWindows: windows.filter((w) => w.status === "active").length,
      totalCapacity,
      totalBooked,
      utilizationRate: totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
      upcomingBookings: upcomingBookings.length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
    };
  }),

  // ── Proctor: combined calendar data (windows + enriched bookings) ───────────────
  proctorSchedule: protectedProcedure.query(async ({ ctx }) => {
    if (!(["proctor", "org_admin", "super_admin"] as string[]).includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const [windows, bookings] = await Promise.all([
      db
        .select({
          id: proctorAvailabilityWindows.id,
          startTime: proctorAvailabilityWindows.startsAt,
          endTime: proctorAvailabilityWindows.endsAt,
          capacity: proctorAvailabilityWindows.capacity,
          bookedCount: proctorAvailabilityWindows.bookedCount,
          status: proctorAvailabilityWindows.status,
          notes: proctorAvailabilityWindows.notes,
        })
        .from(proctorAvailabilityWindows)
        .where(eq(proctorAvailabilityWindows.proctorId, ctx.user.id))
        .orderBy(proctorAvailabilityWindows.startsAt),
      db
        .select({
          id: examBookings.id,
          candidateId: examBookings.candidateId,
          examId: examBookings.examId,
          proctorId: examBookings.proctorId,
          scheduledAt: examBookings.scheduledAt,
          durationMinutes: examBookings.durationMinutes,
          status: examBookings.status,
          notes: examBookings.candidateNotes,
          proctorNotes: examBookings.proctorNotes,
          candidateName: users.name,
          candidateEmail: users.email,
          examTitle: exams.title,
        })
        .from(examBookings)
        .leftJoin(users, eq(examBookings.candidateId, users.id))
        .leftJoin(exams, eq(examBookings.examId, exams.id))
        .where(eq(examBookings.proctorId, ctx.user.id))
        .orderBy(examBookings.scheduledAt),
    ]);

    return { windows, bookings };
  }),
});
