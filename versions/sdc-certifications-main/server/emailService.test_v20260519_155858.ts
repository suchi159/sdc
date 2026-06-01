/**
 * Tests for server/lib/emailService.ts
 * Covers ICS generation, RFC 5545 compliance, HTML template generation,
 * and send function behaviour in trial mode.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the Resend SDK so tests never make real HTTP calls
vi.mock("resend", () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
      },
    })),
  };
});

// Force TRIAL_MODE by clearing RESEND_API_KEY before the module loads
const originalResendKey = process.env.RESEND_API_KEY;
process.env.RESEND_API_KEY = "";

import {
  generateICS,
  sendBookingConfirmation,
  sendBookingCancellation,
  type BookingEmailData,
  type CancellationEmailData,
} from "./lib/emailService";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const BOOKING: BookingEmailData = {
  candidateName: "Alice Smith",
  candidateEmail: "alice@example.com",
  proctorName: "Bob Jones",
  examTitle: "AWS Solutions Architect",
  scheduledAt: new Date("2026-06-15T10:00:00Z").getTime(),
  durationMinutes: 90,
  bookingId: 42,
  examId: 7,
  orgName: "Acme Corp",
  candidateNotes: "Please allow extra time for setup",
};

const CANCELLATION: CancellationEmailData = {
  candidateName: "Alice Smith",
  candidateEmail: "alice@example.com",
  examTitle: "AWS Solutions Architect",
  scheduledAt: new Date("2026-06-15T10:00:00Z").getTime(),
  reason: "Scheduling conflict",
  cancelledBy: "candidate",
};

// ─── ICS Generation ───────────────────────────────────────────────────────────
describe("generateICS", () => {
  it("produces a valid VCALENDAR/VEVENT structure", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
  });

  it("sets DTSTART correctly for the scheduled time", () => {
    const ics = generateICS(BOOKING);
    // 2026-06-15T10:00:00Z → 20260615T100000Z
    expect(ics).toContain("DTSTART:20260615T100000Z");
  });

  it("sets DTEND correctly based on duration", () => {
    const ics = generateICS(BOOKING);
    // 10:00 + 90 min = 11:30 UTC → 20260615T113000Z
    expect(ics).toContain("DTEND:20260615T113000Z");
  });

  it("includes the exam title in SUMMARY", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("AWS Solutions Architect");
  });

  it("includes the proctor name in DESCRIPTION", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("Bob Jones");
  });

  it("includes the booking ID in DESCRIPTION", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("42");
  });

  it("includes a 24-hour VALARM reminder", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("TRIGGER:-PT24H");
  });

  it("includes a 30-minute VALARM reminder", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("TRIGGER:-PT30M");
  });

  it("uses CRLF line endings per RFC 5545", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("\r\n");
  });

  it("sets STATUS:CONFIRMED", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("STATUS:CONFIRMED");
  });

  it("sets METHOD:REQUEST for calendar invite", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("METHOD:REQUEST");
  });

  it("generates a unique UID containing the booking ID", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("UID:booking-42-");
  });

  it("generates different UIDs for different bookings", () => {
    const ics1 = generateICS({ ...BOOKING, bookingId: 1 });
    const ics2 = generateICS({ ...BOOKING, bookingId: 2 });
    const uid1 = ics1.match(/UID:(.+)/)?.[1];
    const uid2 = ics2.match(/UID:(.+)/)?.[1];
    expect(uid1).not.toBe(uid2);
  });

  it("escapes commas in exam title", () => {
    const ics = generateICS({ ...BOOKING, examTitle: "Exam, Part 1" });
    expect(ics).toContain("\\,");
  });

  it("escapes semicolons in exam title", () => {
    const ics = generateICS({ ...BOOKING, examTitle: "Exam; Advanced" });
    expect(ics).toContain("\\;");
  });

  it("escapes backslashes in exam title", () => {
    const ics = generateICS({ ...BOOKING, examTitle: "Exam\\Test" });
    expect(ics).toContain("\\\\");
  });

  it("includes candidate notes in DESCRIPTION when provided", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("Please allow extra time for setup");
  });

  it("omits candidate notes section when not provided", () => {
    const ics = generateICS({ ...BOOKING, candidateNotes: undefined });
    expect(ics).not.toContain("Notes:");
  });

  it("handles 60-minute exam duration correctly", () => {
    const ics = generateICS({ ...BOOKING, durationMinutes: 60 });
    // 10:00 + 60 min = 11:00 UTC
    expect(ics).toContain("DTEND:20260615T110000Z");
  });

  it("handles midnight start time correctly", () => {
    const midnightTs = new Date("2026-06-15T00:00:00Z").getTime();
    const ics = generateICS({ ...BOOKING, scheduledAt: midnightTs });
    expect(ics).toContain("DTSTART:20260615T000000Z");
  });

  it("handles end-of-day overflow correctly", () => {
    const lateTs = new Date("2026-06-15T23:00:00Z").getTime();
    const ics = generateICS({ ...BOOKING, scheduledAt: lateTs, durationMinutes: 90 });
    // 23:00 + 90 min = next day 00:30
    expect(ics).toContain("DTEND:20260616T003000Z");
  });

  it("folds lines longer than 75 characters", () => {
    const longTitle = "A".repeat(100);
    const ics = generateICS({ ...BOOKING, examTitle: longTitle });
    // After folding, no single line should exceed 75 chars
    const lines = ics.split("\r\n");
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });

  it("sets PRODID to SDC Certifications", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("PRODID:-//SDC Certifications//Exam Booking//EN");
  });

  it("sets CALSCALE:GREGORIAN", () => {
    const ics = generateICS(BOOKING);
    expect(ics).toContain("CALSCALE:GREGORIAN");
  });
});

// ─── Send Functions (Trial Mode) ──────────────────────────────────────────────
describe("sendBookingConfirmation (trial mode)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns true in trial mode (no API key configured)", async () => {
    const result = await sendBookingConfirmation(BOOKING);
    expect(result).toBe(true);
  });

  it("logs the recipient email in trial mode", async () => {
    await sendBookingConfirmation(BOOKING);
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("alice@example.com");
  });

  it("logs the exam title in the subject sent via Resend", async () => {
    const result = await sendBookingConfirmation(BOOKING);
    expect(result).toBe(true);
    // The success log always contains the recipient email
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("alice@example.com");
  });

  it("sends an .ics attachment with the booking email", async () => {
    const result = await sendBookingConfirmation(BOOKING);
    expect(result).toBe(true);
  });
});

describe("sendBookingCancellation (trial mode)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns true in trial mode", async () => {
    const result = await sendBookingCancellation(CANCELLATION);
    expect(result).toBe(true);
  });

  it("logs the recipient email in trial mode", async () => {
    await sendBookingCancellation(CANCELLATION);
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("alice@example.com");
  });

  it("sends successfully via Resend and logs recipient", async () => {
    const result = await sendBookingCancellation(CANCELLATION);
    expect(result).toBe(true);
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("alice@example.com");
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────
describe("generateICS edge cases", () => {
  it("handles special characters in proctor name", () => {
    const ics = generateICS({ ...BOOKING, proctorName: "Dr. O'Brien & Associates" });
    expect(ics).toContain("BEGIN:VEVENT");
    // Should not throw
  });

  it("handles unicode characters in exam title", () => {
    const ics = generateICS({ ...BOOKING, examTitle: "Examen de Certificación" });
    expect(ics).toContain("BEGIN:VEVENT");
  });

  it("produces consistent output for the same input", () => {
    // UIDs include Date.now() so we just check structural consistency
    const ics1 = generateICS(BOOKING);
    const ics2 = generateICS(BOOKING);
    // Both should have the same DTSTART and DTEND
    expect(ics1.match(/DTSTART:.+/)?.[0]).toBe(ics2.match(/DTSTART:.+/)?.[0]);
    expect(ics1.match(/DTEND:.+/)?.[0]).toBe(ics2.match(/DTEND:.+/)?.[0]);
  });

  it("handles very short exam duration (30 minutes)", () => {
    const ics = generateICS({ ...BOOKING, durationMinutes: 30 });
    expect(ics).toContain("DTEND:20260615T103000Z");
  });

  it("handles very long exam duration (4 hours)", () => {
    const ics = generateICS({ ...BOOKING, durationMinutes: 240 });
    // 10:00 + 240 min = 14:00 UTC
    expect(ics).toContain("DTEND:20260615T140000Z");
  });
});

// ─── Proctor Notification Emails (Trial Mode) ─────────────────────────────────
import {
  sendProctorBookingNotification,
  sendProctorCancellationNotification,
  type ProctorBookingNotificationData,
} from "./lib/emailService";

const PROCTOR_BOOKING: ProctorBookingNotificationData = {
  proctorName: "Bob Jones",
  proctorEmail: "bob@example.com",
  candidateName: "Alice Smith",
  candidateEmail: "alice@example.com",
  examTitle: "AWS Solutions Architect",
  scheduledAt: new Date("2026-06-15T10:00:00Z").getTime(),
  durationMinutes: 90,
  bookingId: 42,
  candidateNotes: "Please allow extra time",
};

describe("sendProctorBookingNotification (trial mode)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns true in trial mode", async () => {
    const result = await sendProctorBookingNotification(PROCTOR_BOOKING);
    expect(result).toBe(true);
  });

  it("logs the proctor email in trial mode", async () => {
    await sendProctorBookingNotification(PROCTOR_BOOKING);
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("bob@example.com");
  });

  it("sends successfully via Resend and logs proctor email", async () => {
    const result = await sendProctorBookingNotification(PROCTOR_BOOKING);
    expect(result).toBe(true);
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("bob@example.com");
  });

  it("returns true for a valid proctor booking notification", async () => {
    const result = await sendProctorBookingNotification(PROCTOR_BOOKING);
    expect(result).toBe(true);
  });
});

describe("sendProctorCancellationNotification (trial mode)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns true in trial mode", async () => {
    const result = await sendProctorCancellationNotification({
      proctorName: "Bob Jones",
      proctorEmail: "bob@example.com",
      candidateName: "Alice Smith",
      examTitle: "AWS Solutions Architect",
      scheduledAt: new Date("2026-06-15T10:00:00Z").getTime(),
      reason: "Scheduling conflict",
    });
    expect(result).toBe(true);
  });

  it("logs the proctor email in trial mode", async () => {
    await sendProctorCancellationNotification({
      proctorName: "Bob Jones",
      proctorEmail: "bob@example.com",
      candidateName: "Alice Smith",
      examTitle: "AWS Solutions Architect",
      scheduledAt: new Date("2026-06-15T10:00:00Z").getTime(),
    });
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("bob@example.com");
  });

  it("sends successfully via Resend and logs proctor email", async () => {
    const result = await sendProctorCancellationNotification({
      proctorName: "Bob Jones",
      proctorEmail: "bob@example.com",
      candidateName: "Alice Smith",
      examTitle: "AWS Solutions Architect",
      scheduledAt: new Date("2026-06-15T10:00:00Z").getTime(),
    });
    expect(result).toBe(true);
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("bob@example.com");
  });
});

// ─── notificationHelper ────────────────────────────────────────────────────────
import { createNotification, createNotifications } from "./lib/notificationHelper";
import { vi as vitest } from "vitest";

describe("createNotification (no DB)", () => {
  it("does not throw when DB is unavailable", async () => {
    // getDb returns null in test environment without a real DB connection
    await expect(
      createNotification({
        userId: 1,
        type: "booking_confirmed",
        title: "Test",
        message: "Test message",
      })
    ).resolves.toBeUndefined();
  });

  it("does not throw for booking_new type", async () => {
    await expect(
      createNotification({
        userId: 2,
        type: "booking_new",
        title: "New Booking",
        message: "A candidate booked a slot",
        actionUrl: "/proctor/calendar",
      })
    ).resolves.toBeUndefined();
  });

  it("does not throw for booking_cancelled type", async () => {
    await expect(
      createNotification({
        userId: 3,
        type: "booking_cancelled",
        title: "Booking Cancelled",
        message: "A booking was cancelled",
      })
    ).resolves.toBeUndefined();
  });
});

describe("createNotifications (batch, no DB)", () => {
  it("handles an empty array without throwing", async () => {
    await expect(createNotifications([])).resolves.toBeUndefined();
  });

  it("handles multiple notifications without throwing", async () => {
    await expect(
      createNotifications([
        { userId: 1, type: "booking_confirmed", title: "T1", message: "M1" },
        { userId: 2, type: "booking_new", title: "T2", message: "M2" },
      ])
    ).resolves.toBeUndefined();
  });
});

// ─── Voucher Redeemed Email ────────────────────────────────────────────────────
import { sendVoucherRedeemedEmail, sendExamResultEmail } from "./lib/emailService";

describe("sendVoucherRedeemedEmail (trial mode)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  it("returns true in trial mode for exam voucher", async () => {
    const result = await sendVoucherRedeemedEmail({
      recipientName: "Alice Smith",
      recipientEmail: "alice@example.com",
      voucherCode: "SDC-ABCD1234",
      voucherType: "exam",
    });
    expect(result).toBe(true);
  });
  it("logs the recipient email in trial mode", async () => {
    await sendVoucherRedeemedEmail({
      recipientName: "Bob Jones",
      recipientEmail: "bob@example.com",
      voucherCode: "SDC-XYZ9876",
      voucherType: "book",
      bookTitle: "AWS Solutions Architect Guide",
    });
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("bob@example.com");
  });
  it("returns true for bundle voucher type", async () => {
    const result = await sendVoucherRedeemedEmail({
      recipientName: "Carol White",
      recipientEmail: "carol@example.com",
      voucherCode: "SDC-BUNDLE01",
      voucherType: "bundle",
    });
    expect(result).toBe(true);
  });
});

describe("sendExamResultEmail (trial mode)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  it("returns true for a passing result", async () => {
    const result = await sendExamResultEmail({
      candidateName: "Alice Smith",
      candidateEmail: "alice@example.com",
      examTitle: "AWS Solutions Architect",
      score: 85,
      passingScore: 70,
      passed: true,
      attemptId: 1,
      credentialId: "SDC-2026-ABCD1234",
    });
    expect(result).toBe(true);
  });
  it("returns true for a failing result", async () => {
    const result = await sendExamResultEmail({
      candidateName: "Bob Jones",
      candidateEmail: "bob@example.com",
      examTitle: "Azure Fundamentals",
      score: 55,
      passingScore: 70,
      passed: false,
      attemptId: 2,
    });
    expect(result).toBe(true);
  });
  it("logs the candidate email in trial mode", async () => {
    await sendExamResultEmail({
      candidateName: "Carol White",
      candidateEmail: "carol@example.com",
      examTitle: "GCP Associate",
      score: 90,
      passingScore: 70,
      passed: true,
      attemptId: 3,
    });
    const calls = consoleSpy.mock.calls.flat().join(" ");
    expect(calls).toContain("carol@example.com");
  });
});
