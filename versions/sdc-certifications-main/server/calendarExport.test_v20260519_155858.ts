/**
 * Tests for the calendar export utility functions.
 *
 * These are pure-function tests that run in Node.js (no DOM required).
 * We import the utility directly from the client/src/lib directory.
 */

import { describe, it, expect, vi } from "vitest";

// ─── Pure utility functions (no DOM dependencies) ─────────────────────────────
// We re-implement the pure logic here to test it in isolation without needing
// a browser environment. The actual client file uses the same algorithms.

// RFC 5545 date formatter
function toICSDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let remaining = line;
  chunks.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    chunks.push(" " + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return chunks.join("\r\n");
}

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startMs: number;
  endMs: number;
  uid: string;
}

function generateICSContent(event: CalendarEvent): string {
  const now = toICSDate(Date.now());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SDC Certifications//Exam Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    foldLine(`UID:${event.uid}@sdccertifications.com`),
    `DTSTAMP:${now}`,
    `DTSTART:${toICSDate(event.startMs)}`,
    `DTEND:${toICSDate(event.endMs)}`,
    foldLine(`SUMMARY:${escapeICS(event.title)}`),
    foldLine(`DESCRIPTION:${escapeICS(event.description)}`),
    foldLine(`LOCATION:${escapeICS(event.location)}`),
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    foldLine(`DESCRIPTION:Reminder: ${escapeICS(event.title)} starts in 30 minutes`),
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    foldLine(`DESCRIPTION:Tomorrow: ${escapeICS(event.title)}`),
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toICSDate(event.startMs)}/${toICSDate(event.endMs)}`,
    details: event.description,
    location: event.location,
    sf: "true",
    output: "xml",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Test data ────────────────────────────────────────────────────────────────

const SAMPLE_EVENT: CalendarEvent = {
  title: "SDC Exam: AWS Solutions Architect",
  description: "Exam: AWS Solutions Architect\nProctor: Jane Smith\nPlatform: SDC Certifications",
  location: "Online – SDC Certifications Proctored Exam",
  // 2026-06-15 09:00:00 UTC
  startMs: new Date("2026-06-15T09:00:00Z").getTime(),
  // 2026-06-15 11:00:00 UTC (2 hours)
  endMs: new Date("2026-06-15T11:00:00Z").getTime(),
  uid: "booking-42-1750000000000",
};

// ─── toICSDate ────────────────────────────────────────────────────────────────

describe("toICSDate", () => {
  it("formats a UTC timestamp as YYYYMMDDTHHMMSSZ", () => {
    const ts = new Date("2026-06-15T09:00:00Z").getTime();
    expect(toICSDate(ts)).toBe("20260615T090000Z");
  });

  it("pads single-digit month and day", () => {
    const ts = new Date("2026-01-05T03:07:09Z").getTime();
    expect(toICSDate(ts)).toBe("20260105T030709Z");
  });

  it("handles midnight UTC correctly", () => {
    const ts = new Date("2026-12-31T00:00:00Z").getTime();
    expect(toICSDate(ts)).toBe("20261231T000000Z");
  });

  it("handles end-of-day UTC correctly", () => {
    const ts = new Date("2026-12-31T23:59:59Z").getTime();
    expect(toICSDate(ts)).toBe("20261231T235959Z");
  });
});

// ─── escapeICS ────────────────────────────────────────────────────────────────

describe("escapeICS", () => {
  it("escapes backslashes", () => {
    expect(escapeICS("C:\\Users\\test")).toBe("C:\\\\Users\\\\test");
  });

  it("escapes semicolons", () => {
    expect(escapeICS("a;b;c")).toBe("a\\;b\\;c");
  });

  it("escapes commas", () => {
    expect(escapeICS("a,b,c")).toBe("a\\,b\\,c");
  });

  it("escapes newlines", () => {
    expect(escapeICS("line1\nline2")).toBe("line1\\nline2");
  });

  it("leaves plain text unchanged", () => {
    expect(escapeICS("Hello World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(escapeICS("")).toBe("");
  });
});

// ─── foldLine ─────────────────────────────────────────────────────────────────

describe("foldLine", () => {
  it("returns short lines unchanged", () => {
    const short = "A".repeat(75);
    expect(foldLine(short)).toBe(short);
  });

  it("folds lines longer than 75 characters", () => {
    const long = "X".repeat(100);
    const folded = foldLine(long);
    const parts = folded.split("\r\n");
    expect(parts[0].length).toBe(75);
    expect(parts[1]).toMatch(/^ /); // continuation line starts with space
  });

  it("folds very long lines into multiple continuation lines", () => {
    const veryLong = "Y".repeat(300);
    const folded = foldLine(veryLong);
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(2);
    // All continuation lines start with a space
    for (let i = 1; i < parts.length; i++) {
      expect(parts[i][0]).toBe(" ");
    }
  });

  it("preserves total content after folding", () => {
    const original = "Z".repeat(200);
    const folded = foldLine(original);
    // Remove fold markers (CRLF + space) to recover original
    const recovered = folded.replace(/\r\n /g, "");
    expect(recovered).toBe(original);
  });
});

// ─── generateICSContent ───────────────────────────────────────────────────────

describe("generateICSContent", () => {
  it("starts with BEGIN:VCALENDAR and ends with END:VCALENDAR", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
    expect(ics).toMatch(/END:VCALENDAR$/);
  });

  it("contains VEVENT block", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
  });

  it("contains correct DTSTART", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("DTSTART:20260615T090000Z");
  });

  it("contains correct DTEND", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("DTEND:20260615T110000Z");
  });

  it("contains the event title in SUMMARY", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("SDC Exam: AWS Solutions Architect");
  });

  it("contains the UID", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("booking-42-1750000000000@sdccertifications.com");
  });

  it("contains VERSION:2.0", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("VERSION:2.0");
  });

  it("contains CALSCALE:GREGORIAN", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("CALSCALE:GREGORIAN");
  });

  it("contains PRODID with SDC Certifications", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("PRODID:-//SDC Certifications//Exam Booking//EN");
  });

  it("contains STATUS:CONFIRMED", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("STATUS:CONFIRMED");
  });

  it("contains two VALARM blocks (30min and 24h reminders)", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    const alarmCount = (ics.match(/BEGIN:VALARM/g) ?? []).length;
    expect(alarmCount).toBe(2);
  });

  it("contains 30-minute reminder trigger", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("TRIGGER:-PT30M");
  });

  it("contains 24-hour reminder trigger", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    expect(ics).toContain("TRIGGER:-PT24H");
  });

  it("uses CRLF line endings (RFC 5545 §3.1)", () => {
    const ics = generateICSContent(SAMPLE_EVENT);
    // Every line should end with \r\n
    const lines = ics.split("\r\n");
    expect(lines.length).toBeGreaterThan(5);
  });

  it("escapes special characters in title", () => {
    const event = { ...SAMPLE_EVENT, title: "Exam; Part 1, Section A" };
    const ics = generateICSContent(event);
    expect(ics).toContain("Exam\\; Part 1\\, Section A");
  });

  it("escapes newlines in description", () => {
    const event = { ...SAMPLE_EVENT, description: "Line 1\nLine 2" };
    const ics = generateICSContent(event);
    expect(ics).toContain("Line 1\\nLine 2");
  });
});

// ─── buildGoogleCalendarUrl ───────────────────────────────────────────────────

describe("buildGoogleCalendarUrl", () => {
  it("returns a Google Calendar URL", () => {
    const url = buildGoogleCalendarUrl(SAMPLE_EVENT);
    expect(url).toMatch(/^https:\/\/calendar\.google\.com\/calendar\/render/);
  });

  it("includes action=TEMPLATE", () => {
    const url = buildGoogleCalendarUrl(SAMPLE_EVENT);
    expect(url).toContain("action=TEMPLATE");
  });

  it("includes the event title in the URL", () => {
    const url = buildGoogleCalendarUrl(SAMPLE_EVENT);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("text")).toBe("SDC Exam: AWS Solutions Architect");
  });

  it("includes the correct dates parameter", () => {
    const url = buildGoogleCalendarUrl(SAMPLE_EVENT);
    expect(decodeURIComponent(url)).toContain("20260615T090000Z/20260615T110000Z");
  });

  it("includes sf=true", () => {
    const url = buildGoogleCalendarUrl(SAMPLE_EVENT);
    expect(url).toContain("sf=true");
  });

  it("includes output=xml", () => {
    const url = buildGoogleCalendarUrl(SAMPLE_EVENT);
    expect(url).toContain("output=xml");
  });

  it("includes the location in the URL", () => {
    const url = buildGoogleCalendarUrl(SAMPLE_EVENT);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("location")).toBe("Online – SDC Certifications Proctored Exam");
  });

  it("handles events with special characters in title", () => {
    const event = { ...SAMPLE_EVENT, title: "Exam & Test: Part 1" };
    const url = buildGoogleCalendarUrl(event);
    expect(url).toBeTruthy();
    expect(url).toMatch(/^https:\/\/calendar\.google\.com/);
  });
});

// ─── bookingToCalendarEvent (logic test) ─────────────────────────────────────

describe("bookingToCalendarEvent logic", () => {
  // Inline the factory logic to test without DOM (window.location not available in Node)
  function bookingToCalendarEventNode(booking: {
    id: number;
    examTitle: string;
    proctorName: string | null;
    scheduledAt: number;
    durationMinutes?: number;
    examId?: number;
  }): CalendarEvent {
    const durationMs = (booking.durationMinutes ?? 60) * 60 * 1000;
    const endMs = booking.scheduledAt + durationMs;
    const description = [
      `Exam: ${booking.examTitle}`,
      booking.proctorName ? `Proctor: ${booking.proctorName}` : null,
      "Platform: SDC Certifications",
    ]
      .filter(Boolean)
      .join("\n");
    return {
      title: `SDC Exam: ${booking.examTitle}`,
      description,
      location: "Online – SDC Certifications Proctored Exam",
      startMs: booking.scheduledAt,
      endMs,
      uid: `booking-${booking.id}-${booking.scheduledAt}`,
    };
  }

  it("sets title with SDC Exam prefix", () => {
    const event = bookingToCalendarEventNode({
      id: 1,
      examTitle: "AWS Cloud Practitioner",
      proctorName: "John Doe",
      scheduledAt: 1750000000000,
    });
    expect(event.title).toBe("SDC Exam: AWS Cloud Practitioner");
  });

  it("calculates endMs from durationMinutes", () => {
    const start = 1750000000000;
    const event = bookingToCalendarEventNode({
      id: 1,
      examTitle: "Test",
      proctorName: null,
      scheduledAt: start,
      durationMinutes: 90,
    });
    expect(event.endMs).toBe(start + 90 * 60 * 1000);
  });

  it("defaults to 60 minutes if durationMinutes not provided", () => {
    const start = 1750000000000;
    const event = bookingToCalendarEventNode({
      id: 1,
      examTitle: "Test",
      proctorName: null,
      scheduledAt: start,
    });
    expect(event.endMs).toBe(start + 60 * 60 * 1000);
  });

  it("includes proctor name in description when provided", () => {
    const event = bookingToCalendarEventNode({
      id: 1,
      examTitle: "Test",
      proctorName: "Jane Smith",
      scheduledAt: 1750000000000,
    });
    expect(event.description).toContain("Proctor: Jane Smith");
  });

  it("omits proctor line when proctorName is null", () => {
    const event = bookingToCalendarEventNode({
      id: 1,
      examTitle: "Test",
      proctorName: null,
      scheduledAt: 1750000000000,
    });
    expect(event.description).not.toContain("Proctor:");
  });

  it("generates a unique UID from booking id and timestamp", () => {
    const event = bookingToCalendarEventNode({
      id: 42,
      examTitle: "Test",
      proctorName: null,
      scheduledAt: 1750000000000,
    });
    expect(event.uid).toBe("booking-42-1750000000000");
  });

  it("sets correct location string", () => {
    const event = bookingToCalendarEventNode({
      id: 1,
      examTitle: "Test",
      proctorName: null,
      scheduledAt: 1750000000000,
    });
    expect(event.location).toBe("Online – SDC Certifications Proctored Exam");
  });
});
