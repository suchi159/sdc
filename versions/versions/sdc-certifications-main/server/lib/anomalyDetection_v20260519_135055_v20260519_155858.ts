/**
 * Response-Time Anomaly Detection Engine
 *
 * Implements multiple statistical methods to flag suspicious exam-taking behavior:
 *   1. Z-score analysis — flags responses > 2 SD from the mean
 *   2. IQR (Tukey fence) analysis — flags responses outside Q1-1.5*IQR / Q3+1.5*IQR
 *   3. Uniform-speed detection — flags bot-like constant response times
 *   4. Acceleration detection — flags increasing speed toward end of exam
 *   5. Collusion detection — flags answer-sequence similarity between candidates
 */

export interface QuestionResponseInput {
  questionId: number;
  questionIndex: number;
  responseTimeMs: number;
  isCorrect?: boolean | null;
  answer?: unknown;
}

export interface AnomalyResult {
  questionId: number;
  questionIndex: number;
  responseTimeMs: number;
  anomalyType:
    | "too_fast"
    | "too_slow"
    | "iqr_outlier_fast"
    | "iqr_outlier_slow"
    | "collusion"
    | "uniform_speed"
    | "acceleration"
    | "copy_pattern";
  severity: "low" | "medium" | "high" | "critical";
  zScore: number;
  meanTimeMs: number;
  stdDevMs: number;
  iqrLowerBound?: number;
  iqrUpperBound?: number;
  collusionAttemptId?: number;
  collusionSimilarityScore?: number;
  narrative: string;
}

export interface AttemptAnalysisResult {
  anomalies: AnomalyResult[];
  stats: {
    totalTimeMs: number;
    meanResponseTimeMs: number;
    stdDevResponseTimeMs: number;
    fastestResponseMs: number;
    slowestResponseMs: number;
    coefficientOfVariation: number;
  };
  riskScore: number;
  riskLevel: "clean" | "low" | "medium" | "high" | "critical";
  flaggedForReview: boolean;
  uniformSpeedDetected: boolean;
  accelerationDetected: boolean;
}

// ─── Statistical Primitives ───────────────────────────────────────────────────

export function computeMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeStdDev(values: number[], mean?: number): number {
  if (values.length < 2) return 0;
  const m = mean ?? computeMean(values);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function computeZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function computePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export function computeIQR(values: number[]): {
  q1: number;
  q3: number;
  iqr: number;
  lowerFence: number;
  upperFence: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = computePercentile(sorted, 25);
  const q3 = computePercentile(sorted, 75);
  const iqr = q3 - q1;
  return {
    q1,
    q3,
    iqr,
    lowerFence: q1 - 1.5 * iqr,
    upperFence: q3 + 1.5 * iqr,
  };
}

// ─── Severity Mapping ─────────────────────────────────────────────────────────

function zScoreToSeverity(absZ: number): "low" | "medium" | "high" | "critical" {
  if (absZ >= 4.0) return "critical";
  if (absZ >= 3.0) return "high";
  if (absZ >= 2.5) return "medium";
  return "low";
}

// ─── Uniform-Speed Detection ─────────────────────────────────────────────────
// Coefficient of Variation (CV) < 5% across all responses suggests bot-like behaviour

export function detectUniformSpeed(times: number[]): boolean {
  if (times.length < 5) return false;
  const mean = computeMean(times);
  if (mean === 0) return false;
  const stdDev = computeStdDev(times, mean);
  const cv = (stdDev / mean) * 100;
  return cv < 5;
}

// ─── Acceleration Detection ───────────────────────────────────────────────────
// Split into thirds; if the last third is significantly faster than the first third

export function detectAcceleration(times: number[]): boolean {
  if (times.length < 9) return false;
  const third = Math.floor(times.length / 3);
  const firstThird = times.slice(0, third);
  const lastThird = times.slice(-third);
  const firstMean = computeMean(firstThird);
  const lastMean = computeMean(lastThird);
  if (firstMean === 0) return false;
  // Flag if last third is > 40% faster than first third
  return lastMean < firstMean * 0.6;
}

// ─── Collusion Detection ──────────────────────────────────────────────────────
// Jaccard similarity on answer sequences

export function computeAnswerSimilarity(
  answersA: unknown[],
  answersB: unknown[]
): number {
  if (answersA.length === 0 || answersB.length === 0) return 0;
  const len = Math.min(answersA.length, answersB.length);
  let matches = 0;
  for (let i = 0; i < len; i++) {
    if (JSON.stringify(answersA[i]) === JSON.stringify(answersB[i])) {
      matches++;
    }
  }
  return matches / len;
}

// ─── Main Analysis Function ───────────────────────────────────────────────────

export function analyzeAttemptResponses(
  responses: QuestionResponseInput[],
  options: {
    zScoreThreshold?: number;      // default 2.0
    collusionThreshold?: number;   // default 0.85
    otherAttempts?: Array<{
      attemptId: number;
      answers: unknown[];
    }>;
  } = {}
): AttemptAnalysisResult {
  const {
    zScoreThreshold = 2.0,
    collusionThreshold = 0.85,
    otherAttempts = [],
  } = options;

  if (responses.length === 0) {
    return {
      anomalies: [],
      stats: {
        totalTimeMs: 0,
        meanResponseTimeMs: 0,
        stdDevResponseTimeMs: 0,
        fastestResponseMs: 0,
        slowestResponseMs: 0,
        coefficientOfVariation: 0,
      },
      riskScore: 0,
      riskLevel: "clean",
      flaggedForReview: false,
      uniformSpeedDetected: false,
      accelerationDetected: false,
    };
  }

  const times = responses.map((r) => r.responseTimeMs);
  const mean = computeMean(times);
  const stdDev = computeStdDev(times, mean);
  const { lowerFence, upperFence } = computeIQR(times);
  const totalTimeMs = times.reduce((a, b) => a + b, 0);
  const fastestResponseMs = Math.min(...times);
  const slowestResponseMs = Math.max(...times);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  const anomalies: AnomalyResult[] = [];

  // ── Z-score and IQR per question ──────────────────────────────────────────
  for (const r of responses) {
    const z = computeZScore(r.responseTimeMs, mean, stdDev);
    const absZ = Math.abs(z);

    if (absZ >= zScoreThreshold) {
      const isTooFast = z < 0;
      const severity = zScoreToSeverity(absZ);
      anomalies.push({
        questionId: r.questionId,
        questionIndex: r.questionIndex,
        responseTimeMs: r.responseTimeMs,
        anomalyType: isTooFast ? "too_fast" : "too_slow",
        severity,
        zScore: parseFloat(z.toFixed(4)),
        meanTimeMs: Math.round(mean),
        stdDevMs: Math.round(stdDev),
        iqrLowerBound: Math.round(lowerFence),
        iqrUpperBound: Math.round(upperFence),
        narrative: isTooFast
          ? `Question ${r.questionIndex} answered in ${(r.responseTimeMs / 1000).toFixed(1)}s — ${absZ.toFixed(1)} standard deviations below the mean (${(mean / 1000).toFixed(1)}s). This speed is consistent with pre-knowledge or memorised answers.`
          : `Question ${r.questionIndex} took ${(r.responseTimeMs / 1000).toFixed(1)}s — ${absZ.toFixed(1)} standard deviations above the mean (${(mean / 1000).toFixed(1)}s). Extended dwell time may indicate external assistance or reference material use.`,
      });
    } else if (r.responseTimeMs < lowerFence && lowerFence > 0) {
      // IQR outlier (fast) — below Z threshold but still outside Tukey fence
      anomalies.push({
        questionId: r.questionId,
        questionIndex: r.questionIndex,
        responseTimeMs: r.responseTimeMs,
        anomalyType: "iqr_outlier_fast",
        severity: "low",
        zScore: parseFloat(z.toFixed(4)),
        meanTimeMs: Math.round(mean),
        stdDevMs: Math.round(stdDev),
        iqrLowerBound: Math.round(lowerFence),
        iqrUpperBound: Math.round(upperFence),
        narrative: `Question ${r.questionIndex} answered in ${(r.responseTimeMs / 1000).toFixed(1)}s — below the IQR lower fence of ${(lowerFence / 1000).toFixed(1)}s. Marginally fast but warrants monitoring.`,
      });
    } else if (r.responseTimeMs > upperFence) {
      // IQR outlier (slow)
      anomalies.push({
        questionId: r.questionId,
        questionIndex: r.questionIndex,
        responseTimeMs: r.responseTimeMs,
        anomalyType: "iqr_outlier_slow",
        severity: "low",
        zScore: parseFloat(z.toFixed(4)),
        meanTimeMs: Math.round(mean),
        stdDevMs: Math.round(stdDev),
        iqrLowerBound: Math.round(lowerFence),
        iqrUpperBound: Math.round(upperFence),
        narrative: `Question ${r.questionIndex} took ${(r.responseTimeMs / 1000).toFixed(1)}s — above the IQR upper fence of ${(upperFence / 1000).toFixed(1)}s. Marginally slow but warrants monitoring.`,
      });
    }
  }

  // ── Uniform-speed detection ───────────────────────────────────────────────
  const uniformSpeedDetected = detectUniformSpeed(times);
  if (uniformSpeedDetected) {
    // Add a single anomaly record for the whole attempt
    anomalies.push({
      questionId: responses[0].questionId,
      questionIndex: 0,
      responseTimeMs: Math.round(mean),
      anomalyType: "uniform_speed",
      severity: "high",
      zScore: 0,
      meanTimeMs: Math.round(mean),
      stdDevMs: Math.round(stdDev),
      narrative: `All ${responses.length} questions were answered at a near-constant speed (CV = ${cv.toFixed(1)}%). This pattern is inconsistent with natural human reading and reasoning behaviour and may indicate automated or scripted test-taking.`,
    });
  }

  // ── Acceleration detection ────────────────────────────────────────────────
  const accelerationDetected = detectAcceleration(times);
  if (accelerationDetected) {
    const third = Math.floor(times.length / 3);
    const firstMean = computeMean(times.slice(0, third));
    const lastMean = computeMean(times.slice(-third));
    anomalies.push({
      questionId: responses[responses.length - 1].questionId,
      questionIndex: responses.length,
      responseTimeMs: Math.round(lastMean),
      anomalyType: "acceleration",
      severity: "medium",
      zScore: 0,
      meanTimeMs: Math.round(mean),
      stdDevMs: Math.round(stdDev),
      narrative: `Response speed increased significantly toward the end of the exam. First-third mean: ${(firstMean / 1000).toFixed(1)}s; last-third mean: ${(lastMean / 1000).toFixed(1)}s — a ${Math.round((1 - lastMean / firstMean) * 100)}% acceleration. This pattern is consistent with pre-memorised answer sequences.`,
    });
  }

  // ── Collusion detection ───────────────────────────────────────────────────
  const thisAnswers = responses.map((r) => r.answer);
  for (const other of otherAttempts) {
    const similarity = computeAnswerSimilarity(thisAnswers, other.answers);
    if (similarity >= collusionThreshold) {
      anomalies.push({
        questionId: responses[0].questionId,
        questionIndex: 0,
        responseTimeMs: Math.round(mean),
        anomalyType: "collusion",
        severity: similarity >= 0.95 ? "critical" : "high",
        zScore: 0,
        meanTimeMs: Math.round(mean),
        stdDevMs: Math.round(stdDev),
        collusionAttemptId: other.attemptId,
        collusionSimilarityScore: parseFloat(similarity.toFixed(4)),
        narrative: `Answer sequence similarity of ${(similarity * 100).toFixed(1)}% detected with attempt #${other.attemptId}. This exceeds the ${(collusionThreshold * 100).toFixed(0)}% collusion threshold and warrants investigation for answer sharing or copying.`,
      });
    }
  }

  // ── Risk scoring ──────────────────────────────────────────────────────────
  let riskScore = 0;
  for (const a of anomalies) {
    const weight =
      a.severity === "critical" ? 30 :
      a.severity === "high"     ? 20 :
      a.severity === "medium"   ? 10 : 5;
    riskScore += weight;
  }
  riskScore = Math.min(100, riskScore);

  const riskLevel: AttemptAnalysisResult["riskLevel"] =
    riskScore >= 80 ? "critical" :
    riskScore >= 60 ? "high" :
    riskScore >= 35 ? "medium" :
    riskScore >= 10 ? "low" : "clean";

  return {
    anomalies,
    stats: {
      totalTimeMs,
      meanResponseTimeMs: Math.round(mean),
      stdDevResponseTimeMs: Math.round(stdDev),
      fastestResponseMs,
      slowestResponseMs,
      coefficientOfVariation: parseFloat(cv.toFixed(2)),
    },
    riskScore,
    riskLevel,
    flaggedForReview: riskScore >= 35,
    uniformSpeedDetected,
    accelerationDetected,
  };
}

// ─── Batch Collusion Scan ─────────────────────────────────────────────────────
// Computes a full N×N Jaccard similarity matrix across all attempts for an exam,
// returning every pair whose similarity meets or exceeds the threshold.

export interface CollusionPair {
  attemptIdA: number;
  attemptIdB: number;
  candidateIdA: number;
  candidateIdB: number;
  candidateNameA: string;
  candidateNameB: string;
  similarityScore: number;        // 0–1
  matchingAnswers: number;        // count of identical answer positions
  totalQuestions: number;
  severity: "low" | "medium" | "high" | "critical";
  narrative: string;
}

export interface BatchCollusionResult {
  examId: number;
  scannedAttempts: number;
  flaggedPairs: CollusionPair[];
  matrix: number[][];             // N×N similarity matrix (row/col = attempt index)
  attemptIds: number[];           // ordered list of attempt IDs (index maps to matrix)
  summary: {
    totalPairs: number;
    flaggedCount: number;
    maxSimilarity: number;
    avgSimilarity: number;
    collusionRingCount: number;   // connected components with ≥3 members
  };
}

export interface AttemptAnswerSet {
  attemptId: number;
  candidateId: number;
  candidateName: string;
  answers: unknown[];
}

function similarityToSeverity(s: number): "low" | "medium" | "high" | "critical" {
  if (s >= 0.97) return "critical";
  if (s >= 0.92) return "high";
  if (s >= 0.85) return "medium";
  return "low";
}

/** Union-Find for connected-component counting */
function countCollusionRings(
  n: number,
  flaggedPairs: Array<{ idxA: number; idxB: number }>
): number {
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(x: number, y: number) {
    parent[find(x)] = find(y);
  }
  for (const { idxA, idxB } of flaggedPairs) union(idxA, idxB);
  // Count components that contain ≥3 nodes
  const componentSizes = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    componentSizes.set(root, (componentSizes.get(root) ?? 0) + 1);
  }
  let rings = 0;
  for (const size of Array.from(componentSizes.values())) {
    if (size >= 3) rings++;
  }
  return rings;
}

export function batchCollusionScan(
  attempts: AttemptAnswerSet[],
  options: {
    examId: number;
    threshold?: number;   // default 0.85
  }
): BatchCollusionResult {
  const { examId, threshold = 0.85 } = options;
  const n = attempts.length;

  // Build N×N matrix
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const flaggedPairs: CollusionPair[] = [];
  const flaggedIndices: Array<{ idxA: number; idxB: number }> = [];

  let totalSimilaritySum = 0;
  let pairCount = 0;
  let maxSimilarity = 0;

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1; // self-similarity
    for (let j = i + 1; j < n; j++) {
      const sim = computeAnswerSimilarity(attempts[i].answers, attempts[j].answers);
      matrix[i][j] = parseFloat(sim.toFixed(4));
      matrix[j][i] = matrix[i][j];
      totalSimilaritySum += sim;
      pairCount++;
      if (sim > maxSimilarity) maxSimilarity = sim;

      if (sim >= threshold) {
        const len = Math.min(attempts[i].answers.length, attempts[j].answers.length);
        const matchingAnswers = Math.round(sim * len);
        const severity = similarityToSeverity(sim);
        flaggedPairs.push({
          attemptIdA: attempts[i].attemptId,
          attemptIdB: attempts[j].attemptId,
          candidateIdA: attempts[i].candidateId,
          candidateIdB: attempts[j].candidateId,
          candidateNameA: attempts[i].candidateName,
          candidateNameB: attempts[j].candidateName,
          similarityScore: parseFloat(sim.toFixed(4)),
          matchingAnswers,
          totalQuestions: len,
          severity,
          narrative: `${attempts[i].candidateName} (attempt #${attempts[i].attemptId}) and ${attempts[j].candidateName} (attempt #${attempts[j].attemptId}) share ${(sim * 100).toFixed(1)}% identical answers (${matchingAnswers}/${len} questions). This ${severity} similarity score exceeds the ${(threshold * 100).toFixed(0)}% collusion threshold and warrants investigation.`,
        });
        flaggedIndices.push({ idxA: i, idxB: j });
      }
    }
  }

  // Sort flagged pairs by similarity descending
  flaggedPairs.sort((a, b) => b.similarityScore - a.similarityScore);

  const avgSimilarity = pairCount > 0 ? totalSimilaritySum / pairCount : 0;
  const collusionRingCount = countCollusionRings(n, flaggedIndices);

  return {
    examId,
    scannedAttempts: n,
    flaggedPairs,
    matrix,
    attemptIds: attempts.map((a) => a.attemptId),
    summary: {
      totalPairs: pairCount,
      flaggedCount: flaggedPairs.length,
      maxSimilarity: parseFloat(maxSimilarity.toFixed(4)),
      avgSimilarity: parseFloat(avgSimilarity.toFixed(4)),
      collusionRingCount,
    },
  };
}
