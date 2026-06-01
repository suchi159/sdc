/**
 * Anomaly Detection Router
 * Handles response-time submission, analysis, and dashboard queries.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  questionResponses,
  responseTimeAnomalies,
  attemptAnomalySummaries,
  examAttempts,
  users,
  exams,
} from "../../drizzle/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import {
  analyzeAttemptResponses,
  batchCollusionScan,
  type QuestionResponseInput,
  type AttemptAnswerSet,
} from "../lib/anomalyDetection";
import { invokeLLM } from "../_core/llm";

// ─── Submit Response Times ────────────────────────────────────────────────────

const submitResponseTimesSchema = z.object({
  attemptId: z.number().int().positive(),
  examId: z.number().int().positive(),
  responses: z.array(
    z.object({
      questionId: z.number().int().positive(),
      questionIndex: z.number().int().min(0),
      responseTimeMs: z.number().int().min(0),
      flaggedForReview: z.boolean().optional(),
      revisitCount: z.number().int().min(0).optional(),
      answer: z.unknown().optional(),
      isCorrect: z.boolean().nullable().optional(),
    })
  ),
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const anomalyDetectionRouter = router({
  /**
   * Called at exam submission to persist response times and run analysis.
   */
  submitAndAnalyze: protectedProcedure
    .input(submitResponseTimesSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const { attemptId, examId, responses } = input;
      const candidateId = ctx.user.id;
      const orgId = (ctx.user as any).orgId ?? 1;

      // 1. Persist each question response
      if (responses.length > 0) {
        await db.insert(questionResponses).values(
          responses.map((r) => ({
            attemptId,
            questionId: r.questionId,
            candidateId,
            examId,
            orgId,
            responseTimeMs: r.responseTimeMs,
            flaggedForReview: r.flaggedForReview ?? false,
            revisitCount: r.revisitCount ?? 0,
            answer: r.answer ?? null,
            isCorrect: r.isCorrect ?? null,
            questionIndex: r.questionIndex,
          }))
        );
      }

      // 2. Fetch other attempts for the same exam (for collusion detection)
      const otherAttemptRows = await db
        .select({
          attemptId: questionResponses.attemptId,
          answer: questionResponses.answer,
          questionIndex: questionResponses.questionIndex,
        })
        .from(questionResponses)
        .where(
          and(
            eq(questionResponses.examId, examId),
            sql`${questionResponses.attemptId} != ${attemptId}`
          )
        )
        .orderBy(questionResponses.attemptId, questionResponses.questionIndex);

      // Group by attemptId
      const otherAttemptMap = new Map<number, unknown[]>();
      for (const row of otherAttemptRows) {
        if (!otherAttemptMap.has(row.attemptId)) {
          otherAttemptMap.set(row.attemptId, []);
        }
        otherAttemptMap.get(row.attemptId)!.push(row.answer);
      }
      const otherAttempts = Array.from(otherAttemptMap.entries()).map(
        ([aid, answers]) => ({ attemptId: aid, answers })
      );

      // 3. Run statistical analysis
      const inputResponses: QuestionResponseInput[] = responses.map((r) => ({
        questionId: r.questionId,
        questionIndex: r.questionIndex,
        responseTimeMs: r.responseTimeMs,
        isCorrect: r.isCorrect,
        answer: r.answer,
      }));

      const analysis = analyzeAttemptResponses(inputResponses, {
        zScoreThreshold: 2.0,
        collusionThreshold: 0.85,
        otherAttempts,
      });

      // 4. Persist anomaly records (with AI narrative enrichment for high/critical)
      if (analysis.anomalies.length > 0) {
        const enrichedAnomalies = await Promise.all(
          analysis.anomalies.map(async (a) => {
            let aiNarrative = a.narrative;
            // Enrich high/critical anomalies with LLM narrative
            if (a.severity === "high" || a.severity === "critical") {
              try {
                const llmResp = await invokeLLM({
                  messages: [
                    {
                      role: "system",
                      content:
                        "You are a test security analyst. Write a concise 2-sentence professional narrative explaining the anomaly for a proctor report. Be specific about the statistical evidence.",
                    },
                    {
                      role: "user",
                      content: `Anomaly type: ${a.anomalyType}. ${a.narrative}`,
                    },
                  ],
                });
                aiNarrative =
                  (llmResp as any)?.choices?.[0]?.message?.content ?? a.narrative;
              } catch {
                // Fall back to rule-based narrative
              }
            }
            return { ...a, aiNarrative };
          })
        );

        await db.insert(responseTimeAnomalies).values(
          enrichedAnomalies.map((a) => ({
            attemptId,
            questionId: a.questionId,
            candidateId,
            examId,
            orgId,
            anomalyType: a.anomalyType,
            severity: a.severity,
            responseTimeMs: a.responseTimeMs,
            meanTimeMs: a.meanTimeMs,
            stdDevMs: a.stdDevMs,
            zScore: a.zScore.toString(),
            iqrLowerBound: a.iqrLowerBound ?? null,
            iqrUpperBound: a.iqrUpperBound ?? null,
            collusionAttemptId: a.collusionAttemptId ?? null,
            collusionSimilarityScore: a.collusionSimilarityScore
              ? a.collusionSimilarityScore.toString()
              : null,
            aiNarrative: a.aiNarrative,
          }))
        );
      }

      // 5. Upsert attempt anomaly summary
      await db
        .insert(attemptAnomalySummaries)
        .values({
          attemptId,
          candidateId,
          examId,
          orgId,
          totalAnomalies: analysis.anomalies.length,
          tooFastCount: analysis.anomalies.filter((a) =>
            ["too_fast", "iqr_outlier_fast"].includes(a.anomalyType)
          ).length,
          tooSlowCount: analysis.anomalies.filter((a) =>
            ["too_slow", "iqr_outlier_slow"].includes(a.anomalyType)
          ).length,
          collusionCount: analysis.anomalies.filter((a) =>
            ["collusion", "copy_pattern"].includes(a.anomalyType)
          ).length,
          uniformSpeedCount: analysis.anomalies.filter((a) =>
            ["uniform_speed", "acceleration"].includes(a.anomalyType)
          ).length,
          riskScore: analysis.riskScore.toString(),
          riskLevel: analysis.riskLevel,
          totalTimeMs: analysis.stats.totalTimeMs,
          meanResponseTimeMs: analysis.stats.meanResponseTimeMs,
          stdDevResponseTimeMs: analysis.stats.stdDevResponseTimeMs,
          fastestResponseMs: analysis.stats.fastestResponseMs,
          slowestResponseMs: analysis.stats.slowestResponseMs,
          flaggedForReview: analysis.flaggedForReview,
          analysisCompletedAt: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            totalAnomalies: analysis.anomalies.length,
            riskScore: analysis.riskScore.toString(),
            riskLevel: analysis.riskLevel,
            flaggedForReview: analysis.flaggedForReview,
            analysisCompletedAt: new Date(),
          },
        });

      return {
        success: true,
        anomalyCount: analysis.anomalies.length,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        flaggedForReview: analysis.flaggedForReview,
      };
    }),

  /**
   * List all flagged attempts for the proctor dashboard.
   */
  listFlaggedAttempts: protectedProcedure
    .input(
      z.object({
        examId: z.number().int().positive().optional(),
        riskLevel: z
          .enum(["clean", "low", "medium", "high", "critical"])
          .optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { attempts: [], total: 0 };
      const conditions = [
        sql`${attemptAnomalySummaries.totalAnomalies} > 0`,
      ];
      if (input.examId) {
        conditions.push(eq(attemptAnomalySummaries.examId, input.examId));
      }
      if (input.riskLevel) {
        conditions.push(eq(attemptAnomalySummaries.riskLevel, input.riskLevel));
      }

      const rows = await db
        .select()
        .from(attemptAnomalySummaries)
        .where(and(...conditions))
        .orderBy(desc(attemptAnomalySummaries.riskScore))
        .limit(input.limit)
        .offset(input.offset);

      // Enrich with candidate names
      if (rows.length === 0) return { attempts: [], total: 0 };

      const candidateIds = Array.from(new Set(rows.map((r: typeof rows[number]) => r.candidateId))) as number[];
      const candidateRows = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(inArray(users.id, candidateIds));
      const candidateMap = new Map<number, { name: string | null; email: string | null }>(
        candidateRows.map((c: { id: number; name: string | null; email: string | null }) => [c.id, { name: c.name, email: c.email }])
      );

      const examIds = Array.from(new Set(rows.map((r: typeof rows[number]) => r.examId))) as number[];
      const examRows = await db
        .select({ id: exams.id, title: exams.title })
        .from(exams)
        .where(inArray(exams.id, examIds));
      const examMap = new Map<number, { title: string | null }>(
        examRows.map((e: { id: number; title: string | null }) => [e.id, { title: e.title }])
      );

      const countResult = await db
        .select({ total: sql<number>`count(*)` })
        .from(attemptAnomalySummaries)
        .where(and(...conditions));
      const total = Number(countResult[0]?.total ?? 0);

      type SummaryRow = typeof rows[number];
      return {
        attempts: rows.map((r: SummaryRow) => ({
          ...r,
          candidateName: (candidateMap.get(r.candidateId) as { name: string | null; email: string | null } | undefined)?.name ?? "Unknown",
          candidateEmail: (candidateMap.get(r.candidateId) as { name: string | null; email: string | null } | undefined)?.email ?? "",
          examTitle: (examMap.get(r.examId) as { title: string | null } | undefined)?.title ?? "Unknown Exam",
        })),
        total,
      };
    }),

  /**
   * Get all anomalies for a specific attempt (for the detail view).
   */
  getAttemptAnomalies: protectedProcedure
    .input(z.object({ attemptId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { anomalies: [], responses: [], summary: null };
      const anomalies = await db
        .select()
        .from(responseTimeAnomalies)
        .where(eq(responseTimeAnomalies.attemptId, input.attemptId))
        .orderBy(responseTimeAnomalies.questionId);

      const responses = await db
        .select()
        .from(questionResponses)
        .where(eq(questionResponses.attemptId, input.attemptId))
        .orderBy(questionResponses.questionIndex);

      const [summary] = await db
        .select()
        .from(attemptAnomalySummaries)
        .where(eq(attemptAnomalySummaries.attemptId, input.attemptId));

      return { anomalies, responses, summary: summary ?? null };
    }),

  /**
   * Update the review status of an anomaly (proctor confirms or dismisses).
   */
  reviewAnomaly: protectedProcedure
    .input(
      z.object({
        anomalyId: z.number().int().positive(),
        status: z.enum(["confirmed", "dismissed"]),
        note: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db
        .update(responseTimeAnomalies)
        .set({
          reviewStatus: input.status,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          reviewNote: input.note ?? null,
        })
        .where(eq(responseTimeAnomalies.id, input.anomalyId));
      return { success: true };
    }),

  /**
   * Dashboard stats: anomaly counts by type, risk distribution, trend.
   */
  dashboardStats: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { totals: { totalFlagged: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, avgRiskScore: "0.0" }, anomalyTypeCounts: [], recentFlagged: [] };
    const [totals] = await db
      .select({
        totalFlagged: sql<number>`count(*)`,
        criticalCount: sql<number>`sum(case when risk_level = 'critical' then 1 else 0 end)`,
        highCount: sql<number>`sum(case when risk_level = 'high' then 1 else 0 end)`,
        mediumCount: sql<number>`sum(case when risk_level = 'medium' then 1 else 0 end)`,
        lowCount: sql<number>`sum(case when risk_level = 'low' then 1 else 0 end)`,
        avgRiskScore: sql<number>`avg(risk_score)`,
      })
      .from(attemptAnomalySummaries)
      .where(sql`${attemptAnomalySummaries.totalAnomalies} > 0`);

    const anomalyTypeCounts = await db
      .select({
        anomalyType: responseTimeAnomalies.anomalyType,
        count: sql<number>`count(*)`,
      })
      .from(responseTimeAnomalies)
      .groupBy(responseTimeAnomalies.anomalyType)
      .orderBy(desc(sql`count(*)`));

    const recentFlagged = await db
      .select()
      .from(attemptAnomalySummaries)
      .where(
        and(
          sql`${attemptAnomalySummaries.totalAnomalies} > 0`,
          sql`${attemptAnomalySummaries.riskLevel} in ('high', 'critical')`
        )
      )
      .orderBy(desc(attemptAnomalySummaries.createdAt))
      .limit(5);

    return {
      totals: {
        totalFlagged: Number(totals?.totalFlagged ?? 0),
        criticalCount: Number(totals?.criticalCount ?? 0),
        highCount: Number(totals?.highCount ?? 0),
        mediumCount: Number(totals?.mediumCount ?? 0),
        lowCount: Number(totals?.lowCount ?? 0),
        avgRiskScore: parseFloat((totals?.avgRiskScore ?? 0).toString()).toFixed(1),
      },
      anomalyTypeCounts,
      recentFlagged,
    };
  }),

  /**
   * Run a full batch collusion scan across all attempts for a given exam.
   * Returns a similarity matrix, flagged pairs with severity, and ring detection.
   */
  collusionScan: protectedProcedure
    .input(
      z.object({
        examId: z.number().int().positive(),
        threshold: z.number().min(0.5).max(1.0).default(0.85),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return {
        examId: input.examId,
        scannedAttempts: 0,
        flaggedPairs: [],
        matrix: [],
        attemptIds: [],
        summary: { totalPairs: 0, flaggedCount: 0, maxSimilarity: 0, avgSimilarity: 0, collusionRingCount: 0 },
      };

      // 1. Fetch all response rows for this exam
      const allResponses = await db
        .select()
        .from(questionResponses)
        .where(eq(questionResponses.examId, input.examId))
        .orderBy(questionResponses.attemptId, questionResponses.questionIndex);

      if (allResponses.length === 0) {
        return {
          examId: input.examId,
          scannedAttempts: 0,
          flaggedPairs: [],
          matrix: [],
          attemptIds: [],
          summary: { totalPairs: 0, flaggedCount: 0, maxSimilarity: 0, avgSimilarity: 0, collusionRingCount: 0 },
        };
      }

      // 2. Group by attemptId, preserving candidateId
      const attemptMap = new Map<number, { answers: unknown[]; candidateId: number }>();
      for (const r of allResponses) {
        if (!attemptMap.has(r.attemptId)) {
          attemptMap.set(r.attemptId, { answers: [], candidateId: r.candidateId });
        }
        attemptMap.get(r.attemptId)!.answers.push(r.answer);
      }

      // 3. Fetch candidate names
      const candidateIds = Array.from(new Set(
        Array.from(attemptMap.values()).map((v) => v.candidateId)
      )) as number[];
      const candidateRows = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, candidateIds));
      const nameMap = new Map<number, string>(
        candidateRows.map((c: { id: number; name: string | null }) => [c.id, c.name ?? `Candidate #${c.id}`])
      );

      // 4. Build AttemptAnswerSet array
      const attempts: AttemptAnswerSet[] = Array.from(attemptMap.entries()).map(
        ([attemptId, { answers, candidateId }]) => ({
          attemptId,
          candidateId,
          candidateName: nameMap.get(candidateId) ?? `Candidate #${candidateId}`,
          answers,
        })
      );

      // 5. Run batch collusion scan
      const result = batchCollusionScan(attempts, {
        examId: input.examId,
        threshold: input.threshold,
      });

      return result;
    }),
});
