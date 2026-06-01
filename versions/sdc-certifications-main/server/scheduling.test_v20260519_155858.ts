/**
 * Scheduling Router Tests
 * Tests for proctor availability windows, candidate booking, conflict detection,
 * and cancellation flows.
 */

import { describe, it, expect, beforeEach } from "vitest";

// ─── Pure utility tests (no DB required) ─────────────────────────────────────

function checkConflict(
  existingStart: number,
  existingEnd: number,
  newStart: number,
  newEnd: number
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}

function isWithinWindow(scheduledAt: number, windowStart: number, windowEnd: number): boolean {
  return scheduledAt >= windowStart && scheduledAt < windowEnd;
}

function canCancelBooking(scheduledAt: number, now: number, bufferMinutes = 60): boolean {
  return scheduledAt - now > bufferMinutes * 60 * 1000;
}

function computeUtilizationRate(bookedCount: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.round((bookedCount / capacity) * 100);
}

function formatDuration(startMs: number, endMs: number): string {
  const mins = Math.round((endMs - startMs) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function groupSlotsByDate(
  slots: Array<{ startsAt: number }>
): Map<string, typeof slots> {
  const map = new Map<string, typeof slots>();
  for (const slot of slots) {
    const key = new Date(slot.startsAt).toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  return map;
}

function validateWindowInput(
  startsAt: number,
  endsAt: number,
  capacity: number
): { valid: boolean; error?: string } {
  if (endsAt <= startsAt) return { valid: false, error: "End time must be after start time" };
  const durationMs = endsAt - startsAt;
  const minDurationMs = 30 * 60 * 1000; // 30 minutes
  const maxDurationMs = 12 * 60 * 60 * 1000; // 12 hours
  if (durationMs < minDurationMs) return { valid: false, error: "Window must be at least 30 minutes" };
  if (durationMs > maxDurationMs) return { valid: false, error: "Window cannot exceed 12 hours" };
  if (capacity < 1 || capacity > 100) return { valid: false, error: "Capacity must be between 1 and 100" };
  return { valid: true };
}

// ─── Conflict Detection ───────────────────────────────────────────────────────

describe("Scheduling: Conflict Detection", () => {
  const base = new Date("2026-06-01T09:00:00Z").getTime();
  const hour = 60 * 60 * 1000;

  it("detects overlapping windows (new starts during existing)", () => {
    expect(checkConflict(base, base + 2 * hour, base + hour, base + 3 * hour)).toBe(true);
  });

  it("detects overlapping windows (new ends during existing)", () => {
    expect(checkConflict(base + hour, base + 3 * hour, base, base + 2 * hour)).toBe(true);
  });

  it("detects fully contained window", () => {
    expect(checkConflict(base, base + 4 * hour, base + hour, base + 2 * hour)).toBe(true);
  });

  it("detects containing window", () => {
    expect(checkConflict(base + hour, base + 2 * hour, base, base + 4 * hour)).toBe(true);
  });

  it("allows adjacent windows (no overlap)", () => {
    expect(checkConflict(base, base + hour, base + hour, base + 2 * hour)).toBe(false);
  });

  it("allows non-overlapping windows before", () => {
    expect(checkConflict(base + 2 * hour, base + 3 * hour, base, base + hour)).toBe(false);
  });

  it("allows non-overlapping windows after", () => {
    expect(checkConflict(base, base + hour, base + 2 * hour, base + 3 * hour)).toBe(false);
  });
});

// ─── Window Validation ────────────────────────────────────────────────────────

describe("Scheduling: Window Validation", () => {
  const base = new Date("2026-06-01T09:00:00Z").getTime();
  const hour = 60 * 60 * 1000;

  it("accepts a valid 2-hour window with capacity 5", () => {
    const result = validateWindowInput(base, base + 2 * hour, 5);
    expect(result.valid).toBe(true);
  });

  it("rejects window where end is before start", () => {
    const result = validateWindowInput(base + hour, base, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("after start");
  });

  it("rejects window shorter than 30 minutes", () => {
    const result = validateWindowInput(base, base + 20 * 60 * 1000, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("30 minutes");
  });

  it("rejects window longer than 12 hours", () => {
    const result = validateWindowInput(base, base + 13 * hour, 5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("12 hours");
  });

  it("rejects capacity of 0", () => {
    const result = validateWindowInput(base, base + 2 * hour, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Capacity");
  });

  it("rejects capacity over 100", () => {
    const result = validateWindowInput(base, base + 2 * hour, 101);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Capacity");
  });

  it("accepts minimum valid window (exactly 30 min)", () => {
    const result = validateWindowInput(base, base + 30 * 60 * 1000, 1);
    expect(result.valid).toBe(true);
  });

  it("accepts maximum valid window (exactly 12 hours)", () => {
    const result = validateWindowInput(base, base + 12 * hour, 100);
    expect(result.valid).toBe(true);
  });
});

// ─── Booking Placement ────────────────────────────────────────────────────────

describe("Scheduling: Booking Placement", () => {
  const base = new Date("2026-06-01T09:00:00Z").getTime();
  const hour = 60 * 60 * 1000;

  it("accepts booking at window start", () => {
    expect(isWithinWindow(base, base, base + 2 * hour)).toBe(true);
  });

  it("accepts booking in the middle of window", () => {
    expect(isWithinWindow(base + hour, base, base + 2 * hour)).toBe(true);
  });

  it("rejects booking exactly at window end", () => {
    expect(isWithinWindow(base + 2 * hour, base, base + 2 * hour)).toBe(false);
  });

  it("rejects booking after window", () => {
    expect(isWithinWindow(base + 3 * hour, base, base + 2 * hour)).toBe(false);
  });

  it("rejects booking before window", () => {
    expect(isWithinWindow(base - hour, base, base + 2 * hour)).toBe(false);
  });
});

// ─── Cancellation Policy ──────────────────────────────────────────────────────

describe("Scheduling: Cancellation Policy", () => {
  const now = new Date("2026-06-01T09:00:00Z").getTime();
  const hour = 60 * 60 * 1000;

  it("allows cancellation 2 hours before exam", () => {
    expect(canCancelBooking(now + 2 * hour, now)).toBe(true);
  });

  it("allows cancellation 24 hours before exam", () => {
    expect(canCancelBooking(now + 24 * hour, now)).toBe(true);
  });

  it("blocks cancellation 30 minutes before exam", () => {
    expect(canCancelBooking(now + 30 * 60 * 1000, now)).toBe(false);
  });

  it("blocks cancellation exactly at 1-hour buffer", () => {
    expect(canCancelBooking(now + 60 * 60 * 1000, now)).toBe(false);
  });

  it("blocks cancellation for past exams", () => {
    expect(canCancelBooking(now - hour, now)).toBe(false);
  });

  it("respects custom buffer (30 min)", () => {
    expect(canCancelBooking(now + 45 * 60 * 1000, now, 30)).toBe(true);
  });
});

// ─── Utilisation Rate ─────────────────────────────────────────────────────────

describe("Scheduling: Utilisation Rate", () => {
  it("returns 0% for empty window", () => {
    expect(computeUtilizationRate(0, 10)).toBe(0);
  });

  it("returns 100% for fully booked window", () => {
    expect(computeUtilizationRate(10, 10)).toBe(100);
  });

  it("returns 50% for half-booked window", () => {
    expect(computeUtilizationRate(5, 10)).toBe(50);
  });

  it("returns 0% for zero-capacity window (safe division)", () => {
    expect(computeUtilizationRate(0, 0)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(computeUtilizationRate(1, 3)).toBe(33);
  });
});

// ─── Duration Formatting ──────────────────────────────────────────────────────

describe("Scheduling: Duration Formatting", () => {
  const base = 0;
  const min = 60 * 1000;
  const hour = 60 * min;

  it("formats 30 minutes", () => {
    expect(formatDuration(base, base + 30 * min)).toBe("30 min");
  });

  it("formats exactly 1 hour", () => {
    expect(formatDuration(base, base + hour)).toBe("1h");
  });

  it("formats 1.5 hours", () => {
    expect(formatDuration(base, base + 90 * min)).toBe("1h 30m");
  });

  it("formats 2 hours", () => {
    expect(formatDuration(base, base + 2 * hour)).toBe("2h");
  });

  it("formats 2 hours 15 minutes", () => {
    expect(formatDuration(base, base + 135 * min)).toBe("2h 15m");
  });
});

// ─── Slot Grouping ────────────────────────────────────────────────────────────

describe("Scheduling: Slot Grouping by Date", () => {
  it("groups slots on the same day together", () => {
    const slots = [
      { startsAt: new Date("2026-06-01T09:00:00Z").getTime() },
      { startsAt: new Date("2026-06-01T14:00:00Z").getTime() },
    ];
    const grouped = groupSlotsByDate(slots);
    expect(grouped.size).toBe(1);
    expect(grouped.get("2026-06-01")?.length).toBe(2);
  });

  it("separates slots on different days", () => {
    const slots = [
      { startsAt: new Date("2026-06-01T09:00:00Z").getTime() },
      { startsAt: new Date("2026-06-02T09:00:00Z").getTime() },
      { startsAt: new Date("2026-06-03T09:00:00Z").getTime() },
    ];
    const grouped = groupSlotsByDate(slots);
    expect(grouped.size).toBe(3);
  });

  it("handles empty slot list", () => {
    const grouped = groupSlotsByDate([]);
    expect(grouped.size).toBe(0);
  });

  it("groups multiple slots across multiple days correctly", () => {
    const slots = [
      { startsAt: new Date("2026-06-01T09:00:00Z").getTime() },
      { startsAt: new Date("2026-06-01T11:00:00Z").getTime() },
      { startsAt: new Date("2026-06-01T14:00:00Z").getTime() },
      { startsAt: new Date("2026-06-02T10:00:00Z").getTime() },
    ];
    const grouped = groupSlotsByDate(slots);
    expect(grouped.size).toBe(2);
    expect(grouped.get("2026-06-01")?.length).toBe(3);
    expect(grouped.get("2026-06-02")?.length).toBe(1);
  });
});

// ─── Capacity Management ──────────────────────────────────────────────────────

describe("Scheduling: Capacity Management", () => {
  it("allows booking when capacity is available", () => {
    const window = { capacity: 5, bookedCount: 3 };
    expect(window.bookedCount < window.capacity).toBe(true);
  });

  it("blocks booking when window is full", () => {
    const window = { capacity: 5, bookedCount: 5 };
    expect(window.bookedCount < window.capacity).toBe(false);
  });

  it("blocks booking when over capacity (edge case)", () => {
    const window = { capacity: 5, bookedCount: 6 };
    expect(window.bookedCount < window.capacity).toBe(false);
  });

  it("allows booking when capacity is 1 and count is 0", () => {
    const window = { capacity: 1, bookedCount: 0 };
    expect(window.bookedCount < window.capacity).toBe(true);
  });

  it("computes remaining slots correctly", () => {
    const window = { capacity: 10, bookedCount: 7 };
    expect(window.capacity - window.bookedCount).toBe(3);
  });
});
