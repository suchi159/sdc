import { describe, it, expect } from "vitest";
import { batchCollusionScan, computeAnswerSimilarity } from "./lib/anomalyDetection";

// ─── computeAnswerSimilarity ──────────────────────────────────────────────────

describe("computeAnswerSimilarity", () => {
  it("returns 1.0 for identical answer sequences", () => {
    const a = ["A", "B", "C", "D", "A"];
    const b = ["A", "B", "C", "D", "A"];
    expect(computeAnswerSimilarity(a, b)).toBe(1.0);
  });

  it("returns 0.0 for completely different answer sequences", () => {
    const a = ["A", "A", "A", "A"];
    const b = ["B", "B", "B", "B"];
    expect(computeAnswerSimilarity(a, b)).toBe(0.0);
  });

  it("returns 0.5 for half-matching sequences", () => {
    const a = ["A", "B", "C", "D"];
    const b = ["A", "B", "X", "Y"];
    expect(computeAnswerSimilarity(a, b)).toBe(0.5);
  });

  it("handles empty sequences gracefully", () => {
    expect(computeAnswerSimilarity([], [])).toBe(0);
  });

  it("handles sequences of different lengths by using the shorter", () => {
    const a = ["A", "B", "C", "D", "E"];
    const b = ["A", "B", "C"];
    // 3 matching out of min(5,3)=3 → 1.0
    expect(computeAnswerSimilarity(a, b)).toBe(1.0);
  });

  it("is symmetric — similarity(a,b) === similarity(b,a)", () => {
    const a = ["A", "B", "C", "D"];
    const b = ["A", "X", "C", "Y"];
    expect(computeAnswerSimilarity(a, b)).toBe(computeAnswerSimilarity(b, a));
  });
});

// ─── batchCollusionScan ───────────────────────────────────────────────────────

describe("batchCollusionScan", () => {
  const makeAttempt = (id: number, answers: string[], name = `Candidate ${id}`) => ({
    attemptId: id,
    candidateName: name,
    answers,
  });

  it("returns empty flaggedPairs when all similarities are below threshold", () => {
    const attempts = [
      makeAttempt(1, ["A", "B", "C", "D"]),
      makeAttempt(2, ["B", "C", "D", "A"]),
      makeAttempt(3, ["C", "D", "A", "B"]),
    ];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.flaggedPairs).toHaveLength(0);
    expect(result.summary.flaggedCount).toBe(0);
  });

  it("flags a pair with 100% similarity as critical", () => {
    const attempts = [
      makeAttempt(1, ["A", "B", "C", "D", "A"]),
      makeAttempt(2, ["A", "B", "C", "D", "A"]),
      makeAttempt(3, ["B", "C", "D", "A", "B"]),
    ];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.flaggedPairs).toHaveLength(1);
    expect(result.flaggedPairs[0].severity).toBe("critical");
    expect(result.flaggedPairs[0].similarityScore).toBe(1.0);
    expect(result.flaggedPairs[0].attemptIdA).toBe(1);
    expect(result.flaggedPairs[0].attemptIdB).toBe(2);
  });

  it("flags a pair with 90% similarity as medium (below 0.92 threshold for high)", () => {
    // 9/10 matching = 0.9 → medium (high requires >= 0.92)
    const a = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"];
    const b = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "X"]; // last differs
    const attempts = [makeAttempt(10, a), makeAttempt(11, b)];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.flaggedPairs).toHaveLength(1);
    expect(result.flaggedPairs[0].severity).toBe("medium");
    expect(result.flaggedPairs[0].similarityScore).toBeCloseTo(0.9, 2);
  });

  it("flags a pair with 85% similarity as medium", () => {
    // 17/20 matching
    const a = Array(20).fill("A");
    const b = [...Array(17).fill("A"), "B", "B", "B"]; // 17 match
    const attempts = [makeAttempt(20, a), makeAttempt(21, b)];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.flaggedPairs).toHaveLength(1);
    expect(result.flaggedPairs[0].severity).toBe("medium");
  });

  it("does not flag pairs below the custom threshold", () => {
    const a = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"];
    const b = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "X"]; // 90%
    const attempts = [makeAttempt(30, a), makeAttempt(31, b)];
    // Use 95% threshold — 90% should NOT be flagged
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.95 });
    expect(result.flaggedPairs).toHaveLength(0);
  });

  it("builds a correct similarity matrix", () => {
    const attempts = [
      makeAttempt(1, ["A", "B"]),
      makeAttempt(2, ["A", "B"]),
      makeAttempt(3, ["C", "D"]),
    ];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    // matrix[0][1] should be 1.0 (identical)
    expect(result.matrix[0][1]).toBe(1.0);
    // matrix[0][2] should be 0.0 (completely different)
    expect(result.matrix[0][2]).toBe(0.0);
    // diagonal should be 1.0
    expect(result.matrix[0][0]).toBe(1.0);
    expect(result.matrix[1][1]).toBe(1.0);
    expect(result.matrix[2][2]).toBe(1.0);
  });

  it("detects a collusion ring of 3 candidates", () => {
    const identical = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"];
    const attempts = [
      makeAttempt(1, identical, "Alice"),
      makeAttempt(2, identical, "Bob"),
      makeAttempt(3, identical, "Charlie"),
      makeAttempt(4, ["B", "C", "D", "A", "B", "C", "D", "A", "B", "C"], "Dave"), // different
    ];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    // 3 flagged pairs: (1,2), (1,3), (2,3)
    expect(result.flaggedPairs).toHaveLength(3);
    expect(result.summary.collusionRingCount).toBeGreaterThanOrEqual(1);
  });

  it("returns correct summary statistics", () => {
    const a = ["A", "B", "C", "D"];
    const b = ["A", "B", "C", "D"]; // 100% similar
    const c = ["X", "Y", "Z", "W"]; // 0% similar to a/b
    const attempts = [makeAttempt(1, a), makeAttempt(2, b), makeAttempt(3, c)];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.summary.totalPairs).toBe(3); // C(3,2) = 3
    expect(result.summary.flaggedCount).toBe(1);
    expect(result.summary.maxSimilarity).toBe(1.0);
    expect(result.scannedAttempts).toBe(3);
  });

  it("returns correct attemptIds list", () => {
    const attempts = [
      makeAttempt(10, ["A", "B"]),
      makeAttempt(20, ["C", "D"]),
    ];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.attemptIds).toEqual([10, 20]);
  });

  it("handles a single attempt gracefully (no pairs to compare)", () => {
    const attempts = [makeAttempt(1, ["A", "B", "C"])];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.flaggedPairs).toHaveLength(0);
    expect(result.summary.totalPairs).toBe(0);
    expect(result.scannedAttempts).toBe(1);
  });

  it("handles zero attempts gracefully", () => {
    const result = batchCollusionScan([], { examId: 1, threshold: 0.85 });
    expect(result.flaggedPairs).toHaveLength(0);
    expect(result.matrix).toHaveLength(0);
    expect(result.scannedAttempts).toBe(0);
  });

  it("includes candidateName in flagged pair output", () => {
    const attempts = [
      makeAttempt(1, ["A", "B", "C", "D"], "Alice Smith"),
      makeAttempt(2, ["A", "B", "C", "D"], "Bob Jones"),
    ];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    expect(result.flaggedPairs[0].candidateNameA).toBe("Alice Smith");
    expect(result.flaggedPairs[0].candidateNameB).toBe("Bob Jones");
  });

  it("includes matchingAnswers and totalQuestions in flagged pair output", () => {
    const a = ["A", "B", "C", "D", "E"];
    const b = ["A", "B", "C", "X", "Y"]; // 3/5 = 60% — below threshold
    const attempts = [makeAttempt(1, a), makeAttempt(2, b)];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.50 }); // lower threshold to catch this pair
    expect(result.flaggedPairs).toHaveLength(1);
    expect(result.flaggedPairs[0].matchingAnswers).toBe(3);
    expect(result.flaggedPairs[0].totalQuestions).toBe(5);
  });

  it("sorts flagged pairs by similarity score descending", () => {
    const identical = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"];
    const similar9 = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "X"]; // 90%
    const attempts = [
      makeAttempt(1, identical, "Alice"),
      makeAttempt(2, identical, "Bob"),   // 100% with Alice
      makeAttempt(3, similar9, "Charlie"), // 90% with Alice, 90% with Bob
    ];
    const result = batchCollusionScan(attempts, { examId: 1, threshold: 0.85 });
    // First pair should have the highest similarity
    const scores = result.flaggedPairs.map((p) => p.similarityScore);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });
});
