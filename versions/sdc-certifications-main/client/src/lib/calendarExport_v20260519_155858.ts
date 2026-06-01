/**
 * Calendar Export Utility
 *
 * Provides two export strategies:
 * 1. generateICS() — creates an RFC 5545-compliant .ics file and triggers a download.
 *    Works with Apple Calendar, Outlook, Thunderbird, and any iCal-compatible client.
 * 2. buildGoogleCalendarUrl() — returns a deep-link URL that opens Google Calendar's
 *    "Add Event" form pre-filled with the booking details.
 */

export interface CalendarEvent {
  /** Event title shown in the calendar */
  title: string;
  /** Event description / notes */
  description: string;
  /** Location string (e.g. "Online – SDC Proctored Exam") */
  location: string;
  /** UTC start timestamp in milliseconds */
  startMs: number;
  /** UTC end timestamp in milliseconds */
  endMs: number;
  /** Unique identifier for the event (prevents duplicate imports) */
  uid: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a UTC millisecond timestamp as an iCal DTSTART/DTEND value.
 * Uses the "floating" UTC form: YYYYMMDDTHHMMSSZ
 */
function toICSDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/**
 * Format a UTC millisecond timestamp as a Google Calendar date string.
 * Google Calendar expects: YYYYMMDDTHHmmssZ
 */
function toGoogleDate(ms: number): string {
  return toICSDate(ms); // same format
}

/**
 * Escape special characters in iCal text fields.
 * RFC 5545 §3.3.11 requires escaping backslash, semicolon, comma, and newline.
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Fold long iCal lines at 75 octets per RFC 5545 §3.1.
 * Continuation lines begin with a single space.
 */
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

// ─── iCal (.ics) Generator ────────────────────────────────────────────────────

/**
 * Generate an RFC 5545-compliant iCal string for a single event.
 */
export function generateICSContent(event: CalendarEvent): string {
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

/**
 * Trigger a browser download of an .ics file for the given event.
 * Works in all modern browsers; Apple Calendar opens it automatically on macOS/iOS.
 */
export function downloadICS(event: CalendarEvent): void {
  const content = generateICSContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // Sanitise the filename
  const safeName = event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  a.download = `${safeName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Google Calendar Deep-Link ─────────────────────────────────────────────

/**
 * Build a Google Calendar "Add Event" URL pre-filled with the booking details.
 * Opening this URL in a new tab takes the user directly to the event creation
 * form in their Google Calendar account.
 *
 * Reference: https://calendar.google.com/calendar/r/eventedit?...
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGoogleDate(event.startMs)}/${toGoogleDate(event.endMs)}`,
    details: event.description,
    location: event.location,
    sf: "true",
    output: "xml",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Convenience factory ──────────────────────────────────────────────────────

/**
 * Build a CalendarEvent from a raw exam booking record.
 */
export function bookingToCalendarEvent(booking: {
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
    "Please ensure you are in a quiet, well-lit room with a stable internet connection.",
    "Have your government-issued photo ID ready for identity verification.",
    `Join your exam at: ${window.location.origin}/exam/${booking.examId ?? ""}`,
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
