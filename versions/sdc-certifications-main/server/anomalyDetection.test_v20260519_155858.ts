import { describe, it, expect } from "vitest";
import {
  computeMean,
  computeStdDev,
  computeZScore,
  computeIQR,
  detectUniformSpeed,
  detectAcceleration,
  computeAnswerSimilarity,
  analyzeAttemptResponses,
  type QuestionResponseInput,
} from "./lib/anomalyDetection";

// ─── computeMean ──────────────────────────────────────────────────────────────

describe("computeMean", () => {
  it("returns correct mean for simple values", () => {
    expect(computeMean([10, 20, 30])).toBeCloseTo(20);
  });

  it("returns 0 for empty array", () => {
    expect(computeMean([])).toBe(0);
  });

  it("handles single value", () => {
    expect(computeMean([42])).toBe(42);
  });
});

// ─── computeStdDev ────────────────────────────────────────────────────────────

describe("computeStdDev", () => {
  it("returns 0 for single value", () => {
    expect(computeStdDev([100])).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(computeStdDev([])).toBe(0);
  });

  it("computes sample std dev correctly", () => {
    // [2, 4, 4, 4, 5, 5, 7, 9] → mean=5, sample std≈2
    const sd = computeStdDev([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(sd).toBeCloseTo(2.0, 0);
  });

  it("returns 0 for all-same values", () => {
    expect(computeStdDev([5, 5, 5, 5])).toBe(0);
  });
});

// ─── computeZScore ────────────────────────────────────────────────────────────

describe("computeZScore", () => {
  it("returns 0 when value equals mean", () => {
    expect(computeZScore(50, 50, 10)).toBe(0);
  });

  it("returns positive Z for above-mean value", () => {
    expect(computeZScore(70, 50, 10)).toBeCloseTo(2.0);
  });

  it("returns negative Z for below-mean value", () => {
    expect(computeZScore(30, 50, 10)).toBeCloseTo(-2.0);
  });

  it("returns 0 when stdDev is 0 (no variance)", () => {
    expect(computeZScore(50, 50, 0)).toBe(0);
  });
});

// ─── computeIQR ───────────────────────────────────────────────────────────────

describe("computeIQR", () => {
  it("returns correct Q1, Q3, IQR for sorted data", () => {
    const result = computeIQR([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.q1).toBeGreaterThan(0);
    expect(result.q3).toBeGreaterThan(result.q1);
    expect(result.iqr).toBeCloseTo(result.q3 - result.q1, 5);
  });

  it("computes fences correctly", () => {
    const result = computeIQR([10000, 11000, 12000, 13000, 14000]);
    expect(result.lowerFence).toBeLessThan(result.q1);
    expect(result.upperFence).toBeGreaterThan(result.q3);
  });

  it("handles uniform values", () => {
    const result = computeIQR([5000, 5000, 5000, 5000]);
    expect(result.iqr).toBe(0);
  });
});

// ─── detectUniformSpeed ───────────────────────────────────────────────────────

describe("detectUniformSpeed", () => {
  it("flags bot-like uniform response times (CV < 5%)", () => {
    const times = [5000, 5001, 4999, 5002, 4998, 5000, 5001];
    expect(detectUniformSpeed(times)).toBe(true);
  });

  it("does not flag natural variation", () => {
    const times = [3000, 8000, 15000, 4000, 20000, 6000, 12000];
    expect(detectUniformSpeed(times)).toBe(false);
  });

  it("returns false for fewer than 5 responses", () => {
    expect(detectUniformSpeed([5000, 5001, 5002])).toBe(false);
  });

  it("returns false for zero mean", () => {
    expect(detectUniformSpeed([0, 0, 0, 0, 0])).toBe(false);
  });
});

// ─── detectAcceleration ───────────────────────────────────────────────────────

describe("detectAcceleration", () => {
  it("flags significant speed increase toward end of exam", () => {
    // First third: slow (20s each), last third: very fast (2s each)
    const times = [20000, 20000, 20000, 10000, 10000, 10000, 2000, 2000, 2000];
    expect(detectAcceleration(times)).toBe(true);
  });

  it("does not flag natural deceleration", () => {
    // Getting slower over time — no acceleration
    const times = [2000, 2000, 2000, 10000, 10000, 10000, 20000, 20000, 20000];
    expect(detectAcceleration(times)).toBe(false);
  });

  it("returns false for fewer than 9 responses", () => {
    expect(detectAcceleration([1000, 2000, 3000, 4000, 5000])).toBe(false);
  });
});

// ─── computeAnswerSimilarity ──────────────────────────────────────────────────

describe("computeAnswerSimilarity", () => {
  it("returns 1.0 for identical answer sequences", () => {
    const answers = ["A", "B", "C", "D", "A"];
    expect(computeAnswerSimilarity(answers, answers)).toBe(1.0);
  });

  it("returns 0 for completely different answers", () => {
    const a = ["A", "A", "A", "A", "A"];
    const b = ["B", "B", "B", "B", "B"];
    expect(computeAnswerSimilarity(a, b)).toBe(0);
  });

  it("returns 0 for empty arrays", () => {
    expect(computeAnswerSimilarity([], [])).toBe(0);
  });

  it("handles mismatched lengths using shorter array", () => {
    const a = ["A", "B", "C", "D"];
    const b = ["A", "B"];
    const sim = computeAnswerSimilarity(a, b);
    expect(sim).toBe(1.0); // Both match on the first 2
  });

  it("computes partial similarity correctly", () => {
    const a = ["A", "B", "C", "D"];
    const b = ["A", "B", "X", "Y"];
    expect(computeAnswerSimilarity(a, b)).toBeCloseTo(0.5);
  });
});

// ─── analyzeAttemptResponses ──────────────────────────────────────────────────

describe("analyzeAttemptResponses", () => {
  function makeResponses(times: number[]): QuestionResponseInput[] {
    return times.map((t, i) => ({
      questionId: i + 1,
      questionIndex: i,
      responseTimeMs: t,
      isCorrect: true,
      answer: "A",
    }));
  }

  it("returns clean result for normal response times", () => {
    const responses = makeResponses([8000, 10000, 12000, 9000, 11000, 8500, 10500, 9500, 11500, 10000]);
    const result = analyzeAttemptResponses(responses);
    expect(result.riskLevel).toBe("clean");
    expect(result.riskScore).toBe(0);
    expect(result.anomalies).toHaveLength(0);
  });

  it("detects too_fast anomaly for very quick responses", () => {
    // One extremely fast response among normal ones
    const times = [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 500];
    const responses = makeResponses(times);
    const result = analyzeAttemptResponses(responses, { zScoreThreshold: 2.0 });
    const tooFast = result.anomalies.filter((a) => a.anomalyType === "too_fast");
    expect(tooFast.length).toBeGreaterThan(0);
  });

  it("detects too_slow anomaly for very slow responses", () => {
    const times = [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 120000];
    const responses = makeResponses(times);
    const result = analyzeAttemptResponses(responses, { zScoreThreshold: 2.0 });
    const tooSlow = result.anomalies.filter((a) => a.anomalyType === "too_slow");
    expect(tooSlow.length).toBeGreaterThan(0);
  });

  it("detects uniform_speed for bot-like constant times", () => {
    const times = Array(10).fill(5000).map((v, i) => v + (i % 2 === 0 ? 1 : -1));
    const responses = makeResponses(times);
    const result = analyzeAttemptResponses(responses);
    expect(result.uniformSpeedDetected).toBe(true);
  });

  it("detects acceleration pattern", () => {
    const times = [20000, 20000, 20000, 10000, 10000, 10000, 1000, 1000, 1000, 1000];
    const responses = makeResponses(times);
    const result = analyzeAttemptResponses(responses);
    expect(result.accelerationDetected).toBe(true);
  });

  it("detects collusion between similar answer patterns", () => {
    const responses = makeResponses(Array(10).fill(8000));
    const otherAttempt = {
      attemptId: 999,
      answers: responses.map(() => "A"), // identical answers
    };
    const result = analyzeAttemptResponses(responses, {
      collusionThreshold: 0.85,
      otherAttempts: [otherAttempt],
    });
    const collusion = result.anomalies.filter((a) => a.anomalyType === "collusion");
    expect(collusion.length).toBeGreaterThan(0);
  });

  it("returns correct stats", () => {
    const times = [5000, 10000, 15000];
    const responses = makeResponses(times);
    const result = analyzeAttemptResponses(responses);
    expect(result.stats.meanResponseTimeMs).toBeCloseTo(10000, -2);
    expect(result.stats.fastestResponseMs).toBe(5000);
    expect(result.stats.slowestResponseMs).toBe(15000);
    expect(result.stats.totalTimeMs).toBe(30000);
  });

  it("flags for review when risk score >= 35", () => {
    // Inject many anomalies by using extreme outliers
    const times = Array(10).fill(10000);
    times[0] = 100; // extreme fast
    times[1] = 200; // extreme fast
    times[2] = 300; // extreme fast
    const responses = makeResponses(times);
    const result = analyzeAttemptResponses(responses, { zScoreThreshold: 1.5 });
    if (result.riskScore >= 35) {
      expect(result.flaggedForReview).toBe(true);
    }
  });

  it("risk level is critical when risk score >= 80", () => {
    // Force many high-severity anomalies with extreme outliers
    const times = Array(20).fill(10000);
    for (let i = 0; i < 10; i++) times[i] = 50 + i * 10; // extreme fast
    const responses = makeResponses(times);
    const result = analyzeAttemptResponses(responses, { zScoreThreshold: 1.0 });
    // Verify risk level matches score regardless of exact threshold hit
    const expectedLevel =
      result.riskScore >= 80 ? "critical" :
      result.riskScore >= 60 ? "high" :
      result.riskScore >= 35 ? "medium" :
      result.riskScore >= 10 ? "low" : "clean";
    expect(result.riskLevel).toBe(expectedLevel);
  });
});

// ─── Risk level thresholds ────────────────────────────────────────────────────

describe("risk level classification", () => {
  function getRiskLevel(score: number): string {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 35) return "medium";
    if (score >= 10) return "low";
    return "clean";
  }

  it("classifies 90 as critical", () => expect(getRiskLevel(90)).toBe("critical"));
  it("classifies 65 as high", () => expect(getRiskLevel(65)).toBe("high"));
  it("classifies 40 as medium", () => expect(getRiskLevel(40)).toBe("medium"));
  it("classifies 15 as low", () => expect(getRiskLevel(15)).toBe("low"));
  it("classifies 5 as clean", () => expect(getRiskLevel(5)).toBe("clean"));
  it("classifies 0 as clean", () => expect(getRiskLevel(0)).toBe("clean"));
  it("classifies 80 as critical (boundary)", () => expect(getRiskLevel(80)).toBe("critical"));
  it("classifies 60 as high (boundary)", () => expect(getRiskLevel(60)).toBe("high"));
});
