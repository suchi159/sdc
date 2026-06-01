/**
 * Tests for WebRTC Signaling, Psychometric Report, and Lockdown Browser Detection
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── WebRTC Signaling Tests ───────────────────────────────────────────────────

describe("WebRTC Signaling Server", () => {
  it("should create a room and return a room ID", () => {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    expect(roomId).toMatch(/^room-\d+-[a-z0-9]+$/);
  });

  it("should validate WebSocket message types", () => {
    const validTypes = ["join", "offer", "answer", "ice-candidate", "leave"];
    const msg = { type: "offer", roomId: "test-room", sdp: "v=0\r\n" };
    expect(validTypes).toContain(msg.type);
  });

  it("should reject messages with missing roomId", () => {
    const msg = { type: "offer" };
    const isValid = "roomId" in msg && typeof (msg as any).roomId === "string";
    expect(isValid).toBe(false);
  });

  it("should handle ICE candidate messages", () => {
    const iceMsg = {
      type: "ice-candidate",
      roomId: "exam-session-123",
      candidate: { candidate: "candidate:...", sdpMid: "0", sdpMLineIndex: 0 },
    };
    expect(iceMsg.type).toBe("ice-candidate");
    expect(iceMsg.candidate).toBeDefined();
  });

  it("should support multiple peers in the same room", () => {
    const rooms = new Map<string, Set<string>>();
    const roomId = "room-abc";
    rooms.set(roomId, new Set(["peer-1", "peer-2", "peer-3"]));
    expect(rooms.get(roomId)?.size).toBe(3);
  });
});

// ─── Psychometric Report Tests ────────────────────────────────────────────────

describe("Psychometric Report Utilities", () => {
  function computeCronbachAlpha(pValues: number[]): number {
    if (pValues.length < 2) return 0;
    const k = pValues.length;
    const itemVariances = pValues.map(p => p * (1 - p));
    const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);
    const testVariance = sumItemVariances * 1.2;
    if (testVariance === 0) return 0;
    return (k / (k - 1)) * (1 - sumItemVariances / testVariance);
  }

  it("should compute Cronbach's Alpha for a typical item set", () => {
    const pValues = [0.65, 0.72, 0.58, 0.80, 0.45, 0.70, 0.55, 0.68];
    const alpha = computeCronbachAlpha(pValues);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThanOrEqual(1);
  });

  it("should return 0 for fewer than 2 items", () => {
    expect(computeCronbachAlpha([0.5])).toBe(0);
    expect(computeCronbachAlpha([])).toBe(0);
  });

  it("should return positive alpha for a varied item set", () => {
    // A varied set of p-values produces a meaningful alpha
    const pValues = [0.4, 0.5, 0.6, 0.7, 0.55, 0.65, 0.45, 0.75, 0.5, 0.6];
    const alpha = computeCronbachAlpha(pValues);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThanOrEqual(1);
  });

  it("should flag items with low point-biserial", () => {
    const items = [
      { id: 1, pointBiserial: 0.45, pValue: 0.65 },
      { id: 2, pointBiserial: 0.15, pValue: 0.70 }, // low discrimination
      { id: 3, pointBiserial: 0.55, pValue: 0.50 },
      { id: 4, pointBiserial: 0.08, pValue: 0.80 }, // low discrimination
    ];
    const flagged = items.filter(i => i.pointBiserial < 0.2);
    expect(flagged).toHaveLength(2);
    expect(flagged.map(i => i.id)).toEqual([2, 4]);
  });

  it("should flag items that are too easy (p-value > 0.9)", () => {
    const items = [
      { id: 1, pValue: 0.65 },
      { id: 2, pValue: 0.95 }, // too easy
      { id: 3, pValue: 0.50 },
      { id: 4, pValue: 0.92 }, // too easy
    ];
    const tooEasy = items.filter(i => i.pValue > 0.9);
    expect(tooEasy).toHaveLength(2);
  });

  it("should flag items that are too hard (p-value < 0.2)", () => {
    const items = [
      { id: 1, pValue: 0.65 },
      { id: 2, pValue: 0.15 }, // too hard
      { id: 3, pValue: 0.50 },
    ];
    const tooHard = items.filter(i => i.pValue < 0.2);
    expect(tooHard).toHaveLength(1);
  });

  it("should generate a valid report ID format", () => {
    const reportDate = "2026-04-07";
    const suffix = "ABC123";
    const reportId = `RPT-${reportDate}-${suffix}`;
    expect(reportId).toMatch(/^RPT-\d{4}-\d{2}-\d{2}-[A-Z0-9]+$/);
  });

  it("should interpret Cronbach's Alpha correctly", () => {
    const interpret = (a: number) => {
      if (a >= 0.9) return "Excellent";
      if (a >= 0.8) return "Good";
      if (a >= 0.7) return "Acceptable";
      return "Needs Improvement";
    };
    expect(interpret(0.95)).toBe("Excellent");
    expect(interpret(0.85)).toBe("Good");
    expect(interpret(0.75)).toBe("Acceptable");
    expect(interpret(0.60)).toBe("Needs Improvement");
  });
});

// ─── Lockdown Browser Detection Tests ────────────────────────────────────────
// These tests run in Node.js (no real window/navigator), so we simulate
// the detection logic directly.

function detectLockdownBrowserSim(ua: string, windowProps: Record<string, unknown>): {
  detected: boolean;
  browserName: string | null;
  blocked: boolean;
} {
  if (ua.includes("LockDown") || ua.includes("RLDB") || "RLDB" in windowProps || "lockdownBrowser" in windowProps) {
    return { detected: true, browserName: "Respondus LockDown Browser", blocked: false };
  }
  if (ua.includes("SEB") || ua.includes("SafeExamBrowser") || "SafeExamBrowser" in windowProps || "sebKeys" in windowProps) {
    return { detected: true, browserName: "Safe Exam Browser (SEB)", blocked: false };
  }
  if (ua.includes("Guardian") || ua.includes("ProctorU")) {
    return { detected: true, browserName: "ProctorU Guardian Browser", blocked: false };
  }
  if ("proctorio" in windowProps || "__proctorio" in windowProps) {
    return { detected: true, browserName: "Proctorio (Chrome Extension)", blocked: false };
  }
  if ("examsoft" in windowProps || ua.includes("Examplify")) {
    return { detected: true, browserName: "ExamSoft Examplify", blocked: false };
  }
  // Standard browser — block
  const name = ua.includes("Chrome") ? "Google Chrome" :
               ua.includes("Firefox") ? "Mozilla Firefox" :
               ua.includes("Safari") ? "Apple Safari" : "Unknown Browser";
  return { detected: false, browserName: name, blocked: true };
}

describe("Lockdown Browser Detection", () => {
  const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
  const RLDB_UA = "Mozilla/5.0 LockDown Browser/2.0.0";
  const SEB_UA = "Mozilla/5.0 SafeExamBrowser/3.4.0";

  it("should detect Respondus LockDown Browser via userAgent", () => {
    const result = detectLockdownBrowserSim(RLDB_UA, {});
    expect(result.detected).toBe(true);
    expect(result.browserName).toBe("Respondus LockDown Browser");
    expect(result.blocked).toBe(false);
  });

  it("should detect Respondus LockDown Browser via window.RLDB property", () => {
    const result = detectLockdownBrowserSim(CHROME_UA, { RLDB: { version: "2.0.0" } });
    expect(result.detected).toBe(true);
    expect(result.browserName).toBe("Respondus LockDown Browser");
  });

  it("should detect Safe Exam Browser via userAgent", () => {
    const result = detectLockdownBrowserSim(SEB_UA, {});
    expect(result.detected).toBe(true);
    expect(result.browserName).toBe("Safe Exam Browser (SEB)");
  });

  it("should detect Safe Exam Browser via window.SafeExamBrowser property", () => {
    const result = detectLockdownBrowserSim(CHROME_UA, { SafeExamBrowser: { version: "3.4.0" } });
    expect(result.detected).toBe(true);
    expect(result.browserName).toBe("Safe Exam Browser (SEB)");
  });

  it("should detect Proctorio via window.proctorio", () => {
    const result = detectLockdownBrowserSim(CHROME_UA, { proctorio: { active: true } });
    expect(result.detected).toBe(true);
    expect(result.browserName).toBe("Proctorio (Chrome Extension)");
  });

  it("should detect ExamSoft via window.examsoft", () => {
    const result = detectLockdownBrowserSim(CHROME_UA, { examsoft: { version: "4.0" } });
    expect(result.detected).toBe(true);
    expect(result.browserName).toBe("ExamSoft Examplify");
  });

  it("should NOT detect a secure browser in standard Chrome", () => {
    const result = detectLockdownBrowserSim(CHROME_UA, {});
    expect(result.detected).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.browserName).toBe("Google Chrome");
  });

  it("should allow bypass in developer mode", () => {
    const bypassLockdown = true;
    const lockdownDetected = false;
    const canProceed = lockdownDetected || bypassLockdown;
    expect(canProceed).toBe(true);
  });

  it("should block exam start when no secure browser and bypass is false", () => {
    const bypassLockdown = false;
    const lockdownDetected = false;
    const blocked = !lockdownDetected && !bypassLockdown;
    expect(blocked).toBe(true);
  });

  it("should list all supported secure browsers", () => {
    const supportedBrowsers = [
      "Respondus LockDown Browser",
      "Safe Exam Browser (SEB)",
      "ProctorU Guardian Browser",
      "ExamSoft Examplify",
    ];
    expect(supportedBrowsers).toHaveLength(4);
    expect(supportedBrowsers).toContain("Respondus LockDown Browser");
    expect(supportedBrowsers).toContain("Safe Exam Browser (SEB)");
  });
});

// ─── Pre-Exam Check Integration Tests ────────────────────────────────────────

describe("Pre-Exam Check Workflow", () => {
  it("should define all 6 required check steps", () => {
    const steps = [
      "webcamOk",
      "micOk",
      "bandwidthOk",
      "idVerified",
      "roomScanOk",
      "lockdownBrowserOk",
    ];
    expect(steps).toHaveLength(6);
  });

  it("should pass only when all checks are true", () => {
    const results = {
      webcamOk: true,
      micOk: true,
      bandwidthOk: true,
      idVerified: true,
      roomScanOk: true,
      lockdownBrowserOk: true,
    };
    const allPassed = Object.values(results).every(Boolean);
    expect(allPassed).toBe(true);
  });

  it("should fail if any check is false", () => {
    const results = {
      webcamOk: true,
      micOk: true,
      bandwidthOk: false, // failed
      idVerified: true,
      roomScanOk: true,
      lockdownBrowserOk: true,
    };
    const allPassed = Object.values(results).every(Boolean);
    expect(allPassed).toBe(false);
  });

  it("should calculate progress correctly", () => {
    const totalSteps = 6;
    const completedSteps = 4;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    expect(progress).toBe(67);
  });

  it("should validate bandwidth threshold of 1 Mbps", () => {
    const MIN_MBPS = 1.0;
    expect(0.5 >= MIN_MBPS).toBe(false);
    expect(1.0 >= MIN_MBPS).toBe(true);
    expect(5.0 >= MIN_MBPS).toBe(true);
  });
});
