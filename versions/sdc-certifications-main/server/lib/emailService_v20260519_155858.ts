/**
 * Email Service — SDC Certifications
 * Sends transactional emails via Resend with .ics calendar attachments.
 * Falls back to console logging when RESEND_API_KEY is not configured (dev/trial mode).
 */
import { Resend } from "resend";

// ─── Configuration ────────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@sdccertifications.com";
const FROM_NAME = "SDC Certifications";
const TRIAL_MODE = !RESEND_API_KEY || RESEND_API_KEY === "trial";

const resend = new Resend(TRIAL_MODE ? "re_placeholder" : RESEND_API_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BookingEmailData {
  candidateName: string;
  candidateEmail: string;
  proctorName: string;
  examTitle: string;
  scheduledAt: number;      // UTC ms timestamp
  durationMinutes: number;
  bookingId: number;
  examId: number;
  orgName?: string;
  candidateNotes?: string;
}

export interface CancellationEmailData {
  candidateName: string;
  candidateEmail: string;
  examTitle: string;
  scheduledAt: number;
  reason?: string;
  cancelledBy: "candidate" | "proctor" | "admin";
}

// ─── ICS Generator ────────────────────────────────────────────────────────────
/** Format a UTC ms timestamp as iCal YYYYMMDDTHHMMSSZ */
function toICSDate(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Generate a random UID for the calendar event */
function generateUID(bookingId: number): string {
  return `booking-${bookingId}-${Date.now()}@sdccertifications.com`;
}

/** Escape special characters in iCal text fields */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Fold long lines per RFC 5545 (max 75 octets per line) */
function foldLine(line: string): string {
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 75) {
    chunks.push(remaining.substring(0, 75));
    remaining = " " + remaining.substring(75);
  }
  chunks.push(remaining);
  return chunks.join("\r\n");
}

export function generateICS(data: BookingEmailData): string {
  const start = toICSDate(data.scheduledAt);
  const end = toICSDate(data.scheduledAt + data.durationMinutes * 60 * 1000);
  const now = toICSDate(Date.now());
  const uid = generateUID(data.bookingId);
  const summary = escapeICS(`SDC Exam: ${data.examTitle}`);
  const description = escapeICS(
    `Exam: ${data.examTitle}\n` +
    `Proctor: ${data.proctorName}\n` +
    `Duration: ${data.durationMinutes} minutes\n` +
    `Booking ID: ${data.bookingId}\n` +
    (data.candidateNotes ? `Notes: ${data.candidateNotes}\n` : "") +
    `\nPlease ensure you have completed the Pre-Exam Check before your session.`
  );
  const location = escapeICS("SDC Certifications Online Platform");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SDC Certifications//Exam Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    foldLine(`UID:${uid}`),
    foldLine(`DTSTAMP:${now}`),
    foldLine(`DTSTART:${start}`),
    foldLine(`DTEND:${end}`),
    foldLine(`SUMMARY:${summary}`),
    foldLine(`DESCRIPTION:${description}`),
    foldLine(`LOCATION:${location}`),
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    // 24-hour reminder
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    foldLine(`DESCRIPTION:Reminder: ${data.examTitle} is tomorrow`),
    "END:VALARM",
    // 30-minute reminder
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    foldLine(`DESCRIPTION:Reminder: ${data.examTitle} starts in 30 minutes`),
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

// ─── HTML Email Templates ─────────────────────────────────────────────────────
function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "UTC",
  });
}

function buildConfirmationHTML(data: BookingEmailData): string {
  const dateStr = formatDateTime(data.scheduledAt);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exam Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;overflow:hidden;border:1px solid #30363d;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a2744,#0d1117);padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#f5a623;letter-spacing:-0.5px;">SDC Certifications</div>
              <div style="font-size:13px;color:#8b949e;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Professional Certification Platform</div>
            </td>
          </tr>
          <!-- Status Badge -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <div style="display:inline-block;background:#1a3a1a;border:1px solid #2ea043;border-radius:20px;padding:8px 20px;color:#3fb950;font-size:14px;font-weight:600;">
                ✓ Booking Confirmed
              </div>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding:24px 40px 8px;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#e6edf3;">Hi ${data.candidateName},</h1>
              <p style="margin:12px 0 0;color:#8b949e;font-size:15px;line-height:1.6;">
                Your exam session has been confirmed. Please find the details below and add the event to your calendar using the attached <strong style="color:#e6edf3;">.ics file</strong>.
              </p>
            </td>
          </tr>
          <!-- Booking Details Card -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:8px;border:1px solid #30363d;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #21262d;">
                    <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Exam</div>
                    <div style="font-size:16px;font-weight:600;color:#e6edf3;">${data.examTitle}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #21262d;">
                    <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Date &amp; Time (UTC)</div>
                    <div style="font-size:15px;color:#e6edf3;">${dateStr}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #21262d;">
                    <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Duration</div>
                    <div style="font-size:15px;color:#e6edf3;">${data.durationMinutes} minutes</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #21262d;">
                    <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Proctor</div>
                    <div style="font-size:15px;color:#e6edf3;">${data.proctorName}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Booking Reference</div>
                    <div style="font-size:15px;color:#f5a623;font-family:monospace;font-weight:600;">SDC-BK-${String(data.bookingId).padStart(6, "0")}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Pre-Exam Checklist -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:#1a2744;border:1px solid #1f3a6e;border-radius:8px;padding:20px 24px;">
                <div style="font-size:13px;font-weight:600;color:#f5a623;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">Pre-Exam Checklist</div>
                <ul style="margin:0;padding:0 0 0 20px;color:#8b949e;font-size:14px;line-height:2;">
                  <li>Complete the Pre-Exam Check at least 15 minutes before your session</li>
                  <li>Ensure your webcam, microphone, and internet connection are working</li>
                  <li>Have a valid government-issued photo ID ready for verification</li>
                  <li>Clear your desk of all unauthorised materials</li>
                  <li>Use a supported lockdown browser (Respondus or Safe Exam Browser)</li>
                </ul>
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://sdccertifications.com/exam-check" style="display:inline-block;background:#f5a623;color:#0d1117;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Start Pre-Exam Check →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
              <p style="margin:0;color:#484f58;font-size:12px;line-height:1.6;">
                This is an automated message from SDC Certifications. Please do not reply to this email.<br/>
                If you need to cancel or reschedule, log in to your candidate portal at least 1 hour before your session.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCancellationHTML(data: CancellationEmailData): string {
  const dateStr = formatDateTime(data.scheduledAt);
  const cancelledByLabel = data.cancelledBy === "candidate" ? "you" : `the ${data.cancelledBy}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exam Booking Cancelled</title>
</head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;overflow:hidden;border:1px solid #30363d;">
          <tr>
            <td style="background:linear-gradient(135deg,#1a2744,#0d1117);padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#f5a623;">SDC Certifications</div>
              <div style="font-size:13px;color:#8b949e;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Professional Certification Platform</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <div style="display:inline-block;background:#3a1a1a;border:1px solid #da3633;border-radius:20px;padding:8px 20px;color:#f85149;font-size:14px;font-weight:600;">
                ✕ Booking Cancelled
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 8px;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#e6edf3;">Hi ${data.candidateName},</h1>
              <p style="margin:12px 0 0;color:#8b949e;font-size:15px;line-height:1.6;">
                Your exam booking for <strong style="color:#e6edf3;">${data.examTitle}</strong> scheduled on
                <strong style="color:#e6edf3;">${dateStr}</strong> has been cancelled by ${cancelledByLabel}.
                ${data.reason ? `<br/><br/>Reason: <em style="color:#e6edf3;">${data.reason}</em>` : ""}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <a href="https://sdccertifications.com/candidate/schedule" style="display:inline-block;background:#f5a623;color:#0d1117;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Rebook Your Exam →
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
              <p style="margin:0;color:#484f58;font-size:12px;line-height:1.6;">
                This is an automated message from SDC Certifications. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send Functions ───────────────────────────────────────────────────────────
export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  const icsContent = generateICS(data);
  const icsBase64 = Buffer.from(icsContent).toString("base64");

  const msg = {
    to: { email: data.candidateEmail, name: data.candidateName },
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `✓ Exam Booking Confirmed: ${data.examTitle}`,
    html: buildConfirmationHTML(data),
    attachments: [
      {
        content: icsBase64,
        filename: `exam-booking-${data.bookingId}.ics`,
        type: "text/calendar; method=REQUEST",
        disposition: "attachment",
      },
    ],
  };

  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send booking confirmation email:");
    console.log(`  To: ${data.candidateEmail} (${data.candidateName})`);
    console.log(`  Subject: ${msg.subject}`);
    console.log(`  Exam: ${data.examTitle} @ ${formatDateTime(data.scheduledAt)}`);
    console.log(`  .ics attachment: exam-booking-${data.bookingId}.ics (${icsContent.length} bytes)`);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [data.candidateEmail],
      subject: msg.subject,
      html: msg.html,
      attachments: [
        {
          content: Buffer.from(icsContent),
          filename: `exam-booking-${data.bookingId}.ics`,
        },
      ],
    });
    if (error) throw error;
    console.log(`[EmailService] Booking confirmation sent to ${data.candidateEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send booking confirmation:", err?.message ?? err);
    return false;
  }
}

export async function sendBookingCancellation(data: CancellationEmailData): Promise<boolean> {
  const msg = {
    to: { email: data.candidateEmail, name: data.candidateName },
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Exam Booking Cancelled: ${data.examTitle}`,
    html: buildCancellationHTML(data),
  };

  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send cancellation email:");
    console.log(`  To: ${data.candidateEmail} (${data.candidateName})`);
    console.log(`  Subject: ${msg.subject}`);
    console.log(`  Exam: ${data.examTitle} @ ${formatDateTime(data.scheduledAt)}`);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [data.candidateEmail],
      subject: msg.subject,
      html: msg.html,
    });
    if (error) throw error;
    console.log(`[EmailService] Cancellation email sent to ${data.candidateEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send cancellation email:", err?.message ?? err);
    return false;
  }
}

// ─── Proctor Notification Emails ──────────────────────────────────────────────

export interface ProctorBookingNotificationData {
  proctorName: string;
  proctorEmail: string;
  candidateName: string;
  candidateEmail: string;
  examTitle: string;
  scheduledAt: number;
  durationMinutes: number;
  bookingId: number;
  candidateNotes?: string;
}

function buildProctorNewBookingHTML(data: ProctorBookingNotificationData): string {
  const dateStr = formatDateTime(data.scheduledAt);
  const endStr = formatDateTime(data.scheduledAt + data.durationMinutes * 60 * 1000);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Exam Booking</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;overflow:hidden;border:1px solid #30363d;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a2744,#0d1117);padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#f5a623;">SDC Certifications</div>
            <div style="font-size:13px;color:#8b949e;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Proctor Portal</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <div style="display:inline-block;background:#1a3a2a;border:1px solid #2ea043;border-radius:20px;padding:8px 20px;color:#3fb950;font-size:14px;font-weight:600;">
              📅 New Booking Request
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 8px;">
            <h1 style="margin:0;font-size:22px;font-weight:600;color:#e6edf3;">Hi ${data.proctorName},</h1>
            <p style="margin:12px 0 0;color:#8b949e;font-size:15px;line-height:1.6;">
              A candidate has booked an exam session in your availability window.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:8px;border:1px solid #21262d;overflow:hidden;">
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #21262d;">
                  <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Candidate</div>
                  <div style="font-size:15px;color:#e6edf3;">${data.candidateName} &lt;${data.candidateEmail}&gt;</div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #21262d;">
                  <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Exam</div>
                  <div style="font-size:15px;color:#e6edf3;">${data.examTitle}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #21262d;">
                  <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Date &amp; Time</div>
                  <div style="font-size:15px;color:#e6edf3;">${dateStr} → ${endStr}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;">
                  <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Booking Reference</div>
                  <div style="font-size:15px;color:#f5a623;font-family:monospace;font-weight:600;">SDC-BK-${String(data.bookingId).padStart(6, "0")}</div>
                </td>
              </tr>
              ${data.candidateNotes ? `<tr><td style="padding:16px 24px;border-top:1px solid #21262d;">
                <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Candidate Notes</div>
                <div style="font-size:14px;color:#8b949e;font-style:italic;">${data.candidateNotes}</div>
              </td></tr>` : ""}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://sdccertifications.com/proctor/availability" style="display:inline-block;background:#f5a623;color:#0d1117;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
              View in Proctor Portal →
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
            <p style="margin:0;color:#484f58;font-size:12px;line-height:1.6;">
              This is an automated message from SDC Certifications. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildProctorCancellationHTML(data: {
  proctorName: string;
  proctorEmail: string;
  candidateName: string;
  examTitle: string;
  scheduledAt: number;
  reason?: string;
}): string {
  const dateStr = formatDateTime(data.scheduledAt);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Booking Cancelled</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;overflow:hidden;border:1px solid #30363d;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a2744,#0d1117);padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#f5a623;">SDC Certifications</div>
            <div style="font-size:13px;color:#8b949e;margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Proctor Portal</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <h1 style="margin:0;font-size:22px;font-weight:600;color:#e6edf3;">Hi ${data.proctorName},</h1>
            <p style="margin:12px 0 0;color:#8b949e;font-size:15px;line-height:1.6;">
              The following exam booking has been <strong style="color:#f85149;">cancelled by the candidate</strong>.
            </p>
            <div style="background:#0d1117;border-radius:8px;border:1px solid #21262d;padding:20px 24px;margin-top:20px;">
              <p style="margin:0 0 8px;color:#e6edf3;font-size:15px;"><strong>Candidate:</strong> ${data.candidateName}</p>
              <p style="margin:0 0 8px;color:#e6edf3;font-size:15px;"><strong>Exam:</strong> ${data.examTitle}</p>
              <p style="margin:0;color:#e6edf3;font-size:15px;"><strong>Scheduled:</strong> ${dateStr}</p>
              ${data.reason ? `<p style="margin:8px 0 0;color:#8b949e;font-size:14px;font-style:italic;">Reason: ${data.reason}</p>` : ""}
            </div>
            <p style="margin:16px 0 0;color:#8b949e;font-size:14px;">This slot is now free and can be made available to other candidates.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #21262d;">
            <p style="margin:0;color:#484f58;font-size:12px;line-height:1.6;">
              This is an automated message from SDC Certifications. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Send booking notification to the proctor (no .ics — proctor sets their own schedule) */
export async function sendProctorBookingNotification(data: ProctorBookingNotificationData): Promise<boolean> {
  const msg = {
    to: { email: data.proctorEmail, name: data.proctorName },
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `📅 New Exam Booking: ${data.candidateName} — ${data.examTitle}`,
    html: buildProctorNewBookingHTML(data),
  };

  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send proctor booking notification:");
    console.log(`  To: ${data.proctorEmail} (${data.proctorName})`);
    console.log(`  Subject: ${msg.subject}`);
    console.log(`  Candidate: ${data.candidateName} | Exam: ${data.examTitle} @ ${formatDateTime(data.scheduledAt)}`);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [data.proctorEmail],
      subject: msg.subject,
      html: msg.html,
    });
    if (error) throw error;
    console.log(`[EmailService] Proctor booking notification sent to ${data.proctorEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send proctor notification:", err?.message ?? err);
    return false;
  }
}

/** Send cancellation notification to the proctor when a candidate cancels */
export async function sendProctorCancellationNotification(data: {
  proctorName: string;
  proctorEmail: string;
  candidateName: string;
  examTitle: string;
  scheduledAt: number;
  reason?: string;
}): Promise<boolean> {
  const msg = {
    to: { email: data.proctorEmail, name: data.proctorName },
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Booking Cancelled: ${data.candidateName} — ${data.examTitle}`,
    html: buildProctorCancellationHTML(data),
  };

  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send proctor cancellation notification:");
    console.log(`  To: ${data.proctorEmail} (${data.proctorName})`);
    console.log(`  Subject: ${msg.subject}`);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [data.proctorEmail],
      subject: msg.subject,
      html: msg.html,
    });
    if (error) throw error;
    console.log(`[EmailService] Proctor cancellation notification sent to ${data.proctorEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send proctor cancellation notification:", err?.message ?? err);
    return false;
  }
}

/**
 * Send booking confirmation to BOTH candidate (with .ics) and proctor (without .ics).
 * Non-fatal — failures are logged but do not block the booking.
 */
export async function sendDualBookingNotification(
  candidateData: BookingEmailData,
  proctorData: ProctorBookingNotificationData
): Promise<void> {
  await Promise.allSettled([
    sendBookingConfirmation(candidateData),
    sendProctorBookingNotification(proctorData),
  ]);
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────────────────────

function buildPasswordResetHTML(name: string, resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr><td style="background:linear-gradient(135deg,#b8860b,#d4a017);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:1px;">SDC CERTIFICATIONS</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:2px;">PASSWORD RESET REQUEST</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#94a3b8;font-size:15px;margin:0 0 16px;">Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>
          <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong style="color:#e2e8f0;">1 hour</strong>.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#b8860b,#d4a017);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.5px;">Reset My Password</a>
          </div>
          <p style="color:#64748b;font-size:13px;margin:24px 0 0;">If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
          <p style="color:#64748b;font-size:12px;margin:12px 0 0;word-break:break-all;">Or copy this link: <a href="${resetUrl}" style="color:#d4a017;">${resetUrl}</a></p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
          <p style="color:#475569;font-size:11px;margin:0;">SDC Certifications — Secure Exam Platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
): Promise<boolean> {
  const msg = {
    to: toEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: "Reset Your SDC Certifications Password",
    html: buildPasswordResetHTML(toName, resetUrl),
    text: `Hi ${toName},\n\nReset your password here: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, ignore this email.`,
  };

  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send password reset email:");
    console.log(`  To: ${toEmail} (${toName})`);
    console.log(`  Reset URL: ${resetUrl}`);
    return true;
  }
  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    });
    if (error) throw error;
    console.log(`[EmailService] Password reset email sent to ${toEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send password reset email:", err?.message ?? err);
    return false;
  }
}

// ─── Credential Issuance Email ────────────────────────────────────────────────

export interface CredentialIssuanceEmailData {
  candidateName: string;
  candidateEmail: string;
  examTitle: string;
  credentialId: string;
  score: number;
  issueDate: Date;
  verificationUrl: string;
  appBaseUrl?: string;
}

function buildCredentialIssuanceHTML(data: CredentialIssuanceEmailData): string {
  const baseUrl = data.appBaseUrl || "https://sdccertifications.com";
  const verifyLink = `${baseUrl}/verify/${data.credentialId}`;
  const walletLink = `${baseUrl}/wallet`;
  const issueDateStr = data.issueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your SDC Credential</title></head>
<body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;text-align:center;">🏆</div>
      <h1 style="color:#f59e0b;font-size:28px;margin:16px 0 8px;">Congratulations, ${data.candidateName}!</h1>
      <p style="color:#a3a3a3;font-size:16px;margin:0;">You have earned your SDC Certification</p>
    </div>

    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:28px;margin-bottom:24px;">
      <h2 style="color:#f5f5f5;font-size:20px;margin:0 0 16px;">${data.examTitle}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#a3a3a3;padding:6px 0;font-size:14px;">Credential ID</td>
          <td style="color:#f59e0b;font-family:monospace;font-size:14px;text-align:right;">${data.credentialId}</td>
        </tr>
        <tr>
          <td style="color:#a3a3a3;padding:6px 0;font-size:14px;">Score Achieved</td>
          <td style="color:#22c55e;font-size:14px;font-weight:bold;text-align:right;">${data.score}%</td>
        </tr>
        <tr>
          <td style="color:#a3a3a3;padding:6px 0;font-size:14px;">Issue Date</td>
          <td style="color:#f5f5f5;font-size:14px;text-align:right;">${issueDateStr}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${verifyLink}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;margin-right:12px;">Verify Credential</a>
      <a href="${walletLink}" style="display:inline-block;background:#1a1a1a;border:1px solid #f59e0b;color:#f59e0b;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;">View Wallet</a>
    </div>

    <p style="color:#a3a3a3;font-size:13px;text-align:center;">
      Share your achievement on LinkedIn or include your credential ID in your resume.<br>
      Employers can verify your credential at: <a href="${verifyLink}" style="color:#f59e0b;">${verifyLink}</a>
    </p>

    <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0;">
    <p style="color:#525252;font-size:12px;text-align:center;">
      SDC Certifications · Blockchain-verified digital credentials<br>
      This email was sent to ${data.candidateEmail}
    </p>
  </div>
</body>
</html>`;
}

export async function sendCredentialIssuanceEmail(data: CredentialIssuanceEmailData): Promise<boolean> {
  const msg = {
    to: data.candidateEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `🏆 Your SDC Credential: ${data.examTitle}`,
    html: buildCredentialIssuanceHTML(data),
    text: `Congratulations ${data.candidateName}!\n\nYou have earned your SDC Certification for "${data.examTitle}".\n\nCredential ID: ${data.credentialId}\nScore: ${data.score}%\nIssue Date: ${data.issueDate.toLocaleDateString()}\n\nVerify your credential: ${data.verificationUrl}\nView your wallet: ${data.appBaseUrl || "https://sdccertifications.com"}/wallet\n\nSDC Certifications`,
  };

  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send credential issuance email:");
    console.log(`  To: ${data.candidateEmail} (${data.candidateName})`);
    console.log(`  Credential: ${data.credentialId} — ${data.examTitle} — ${data.score}%`);
    return true;
  }
  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [data.candidateEmail],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    });
    if (error) throw error;
    console.log(`[EmailService] Credential issuance email sent to ${data.candidateEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send credential issuance email:", err?.message ?? err);
    return false;
  }
}

// ─── Voucher Redeemed Email ───────────────────────────────────────────────────
export interface VoucherRedeemedEmailData {
  recipientName: string;
  recipientEmail: string;
  voucherCode: string;
  voucherType: string;
  bookTitle?: string;
  appBaseUrl?: string;
}

function buildVoucherRedeemedHTML(data: VoucherRedeemedEmailData): string {
  const base = data.appBaseUrl || "https://sdccertifications.com";
  const typeLabel = data.voucherType === "book" ? "Book Access" : data.voucherType === "bundle" ? "Bundle" : "Exam Voucher";
  const ctaHref = (data.voucherType === "book" || data.voucherType === "bundle") ? `${base}/books` : `${base}/candidate/exams`;
  const ctaLabel = (data.voucherType === "book" || data.voucherType === "bundle") ? "Access Your Book →" : "Schedule Your Exam →";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Voucher Redeemed</title></head><body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;"><tr><td style="background:linear-gradient(135deg,#b8860b,#d4a017);padding:32px 40px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Voucher Redeemed</h1><p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${typeLabel} successfully activated</p></td></tr><tr><td style="padding:40px;"><p style="color:#94a3b8;font-size:15px;line-height:1.6;">Hi <strong style="color:#e2e8f0;">${data.recipientName}</strong>,</p><p style="color:#94a3b8;font-size:15px;line-height:1.6;">Your voucher has been successfully redeemed.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #334155;"><tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Voucher Code</td><td style="padding:8px 0;color:#e2e8f0;font-size:13px;font-family:monospace;text-align:right;">${data.voucherCode}</td></tr><tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Type</td><td style="padding:8px 0;color:#e2e8f0;font-size:13px;text-align:right;">${typeLabel}</td></tr>${data.bookTitle ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Book</td><td style="padding:8px 0;color:#e2e8f0;font-size:13px;text-align:right;">${data.bookTitle}</td></tr>` : ""}</table><div style="text-align:center;margin:32px 0;"><a href="${ctaHref}" style="display:inline-block;background:linear-gradient(135deg,#b8860b,#d4a017);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">${ctaLabel}</a></div></td></tr><tr><td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #334155;"><p style="margin:0;color:#475569;font-size:12px;">© ${new Date().getFullYear()} SDC Certifications. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}

export async function sendVoucherRedeemedEmail(data: VoucherRedeemedEmailData): Promise<boolean> {
  const typeLabel = data.voucherType === "book" ? "Book Access" : data.voucherType === "bundle" ? "Bundle" : "Exam Voucher";
  const subject = `Voucher Redeemed — ${data.voucherCode} (${typeLabel})`;
  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send voucher redeemed email:");
    console.log(`  To: ${data.recipientEmail} (${data.recipientName})`);
    console.log(`  Voucher: ${data.voucherCode} (${data.voucherType})`);
    return true;
  }
  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [data.recipientEmail],
      subject,
      html: buildVoucherRedeemedHTML(data),
      text: `Hi ${data.recipientName},\n\nYour voucher ${data.voucherCode} (${typeLabel}) has been successfully redeemed.\n${data.bookTitle ? `Book: ${data.bookTitle}\n` : ""}\nSDC Certifications`,
    });
    if (error) throw error;
    console.log(`[EmailService] Voucher redeemed email sent to ${data.recipientEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send voucher redeemed email:", err?.message ?? err);
    return false;
  }
}

// ─── Exam Result Email ────────────────────────────────────────────────────────
export interface ExamResultEmailData {
  candidateName: string;
  candidateEmail: string;
  examTitle: string;
  score: number;
  passingScore: number;
  passed: boolean;
  attemptId: number;
  credentialId?: string;
  appBaseUrl?: string;
}

function buildExamResultHTML(data: ExamResultEmailData): string {
  const base = data.appBaseUrl || "https://sdccertifications.com";
  const statusColor = data.passed ? "#10b981" : "#ef4444";
  const statusLabel = data.passed ? "PASSED" : "NOT PASSED";
  const statusBg = data.passed ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)";
  const ctaHref = data.passed ? `${base}/wallet` : `${base}/candidate/exams`;
  const ctaLabel = data.passed ? "View Credential Wallet →" : "Retake Exam →";
  const credBlock = data.passed && data.credentialId ? `<div style="background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.3);border-radius:12px;padding:20px;margin:24px 0;text-align:center;"><p style="margin:0 0 4px;color:#d4a017;font-size:13px;font-weight:700;">Credential Issued</p><p style="margin:0;color:#94a3b8;font-size:13px;">Your credential has been automatically issued.</p><p style="margin:8px 0 0;font-family:monospace;color:#e2e8f0;font-size:12px;">${data.credentialId}</p></div>` : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Exam Result</title></head><body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;"><tr><td style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);padding:32px 40px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Exam Result</h1><p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${data.examTitle}</p></td></tr><tr><td style="padding:40px;"><p style="color:#94a3b8;font-size:15px;line-height:1.6;">Hi <strong style="color:#e2e8f0;">${data.candidateName}</strong>,</p><p style="color:#94a3b8;font-size:15px;line-height:1.6;">Your exam has been scored. Here are your results:</p><div style="text-align:center;margin:32px 0;padding:32px;background:#0f172a;border-radius:16px;border:1px solid #334155;"><div style="font-size:64px;font-weight:800;color:${statusColor};line-height:1;">${data.score}%</div><div style="margin-top:12px;padding:6px 20px;border-radius:99px;background:${statusBg};color:${statusColor};font-size:14px;font-weight:700;border:1px solid ${statusColor};display:inline-block;">${statusLabel}</div><p style="margin:16px 0 0;color:#64748b;font-size:13px;">Passing score: ${data.passingScore}%</p></div>${credBlock}<div style="text-align:center;margin:24px 0;"><a href="${ctaHref}" style="display:inline-block;background:linear-gradient(135deg,#b8860b,#d4a017);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">${ctaLabel}</a></div></td></tr><tr><td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #334155;"><p style="margin:0;color:#475569;font-size:12px;">© ${new Date().getFullYear()} SDC Certifications. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}

export async function sendExamResultEmail(data: ExamResultEmailData): Promise<boolean> {
  const statusLabel = data.passed ? "PASSED" : "Not Passed";
  const subject = `Exam Result: ${data.examTitle} — ${data.score}% (${statusLabel})`;
  if (TRIAL_MODE) {
    console.log("[EmailService] TRIAL MODE — would send exam result email:");
    console.log(`  To: ${data.candidateEmail} (${data.candidateName})`);
    console.log(`  Exam: ${data.examTitle} — Score: ${data.score}% — ${statusLabel}`);
    return true;
  }
  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [data.candidateEmail],
      subject,
      html: buildExamResultHTML(data),
      text: `Hi ${data.candidateName},\n\nYour exam result for "${data.examTitle}":\n\nScore: ${data.score}%\nStatus: ${statusLabel}\nPassing score: ${data.passingScore}%\n${data.credentialId ? `\nCredential ID: ${data.credentialId}\n` : ""}\nSDC Certifications`,
    });
    if (error) throw error;
    console.log(`[EmailService] Exam result email sent to ${data.candidateEmail}`);
    return true;
  } catch (err: any) {
    console.error("[EmailService] Failed to send exam result email:", err?.message ?? err);
    return false;
  }
}
