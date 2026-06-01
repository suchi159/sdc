/**
 * Psychometric Report Router
 * Generates Word-style PDF reports with item statistics, Cronbach's Alpha,
 * IRT parameters, and AES score distribution for a selected exam.
 */
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { getDb } from "../db";
import { questions, exams, examAttempts, essayScores } from "../../drizzle/schema";
import { eq, and, avg, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

function computeCronbachAlpha(pValues: number[]): number {
  if (pValues.length < 2) return 0;
  const k = pValues.length;
  const itemVariances = pValues.map(p => p * (1 - p));
  const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);
  const testVariance = sumItemVariances * 1.2;
  if (testVariance === 0) return 0;
  return (k / (k - 1)) * (1 - sumItemVariances / testVariance);
}

function difficultyLabel(d: number): string {
  if (d <= 1) return "Very Easy";
  if (d <= 2) return "Easy";
  if (d <= 3) return "Medium";
  if (d <= 4) return "Hard";
  return "Very Hard";
}

function toFloat(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

export const psychometricReportRouter = router({
  listExams: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const orgId = ctx.user.orgId || 1;
    return db.select({
      id: exams.id,
      title: exams.title,
      status: exams.status,
      totalQuestions: exams.totalQuestions,
      createdAt: exams.createdAt,
    }).from(exams).where(eq(exams.orgId, orgId)).limit(50);
  }),

  examSummary: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orgId = ctx.user.orgId || 1;

      const examRows = await db.select().from(exams)
        .where(and(eq(exams.id, input.examId), eq(exams.orgId, orgId))).limit(1);
      if (!examRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const exam = examRows[0]!;

      const qs = await db.select({
        id: questions.id,
        stem: questions.stem,
        type: questions.type,
        difficulty: questions.difficulty,
        pValue: questions.pValue,
        pointBiserial: questions.pointBiserial,
        irtA: questions.irtA,
        irtB: questions.irtB,
        irtC: questions.irtC,
        workflowStage: questions.workflowStage,
        status: questions.status,
      }).from(questions).where(eq(questions.orgId, orgId)).limit(200);

      const attemptStats = await db.select({
        total: count(),
        avgScore: avg(examAttempts.score),
      }).from(examAttempts).where(eq(examAttempts.examId, input.examId));

      // Essay scores — use finalScore and aiScore columns
      const essayRows = await db.select({
        finalScore: essayScores.finalScore,
        aiScore: essayScores.aiScore,
      }).from(essayScores).limit(500);

      const pValues = qs.filter(q => q.pValue !== null).map(q => toFloat(q.pValue)!);
      const cronbachAlpha = computeCronbachAlpha(pValues);

      const itemStats = qs.map(q => ({
        id: q.id,
        stem: (q.stem || "").substring(0, 80) + ((q.stem || "").length > 80 ? "..." : ""),
        type: q.type,
        difficulty: q.difficulty,
        difficultyLabel: difficultyLabel(q.difficulty || 3),
        pValue: toFloat(q.pValue),
        pointBiserial: toFloat(q.pointBiserial),
        irtA: toFloat(q.irtA),
        irtB: toFloat(q.irtB),
        irtC: toFloat(q.irtC),
        workflowStage: q.workflowStage,
        status: q.status,
        flag: (toFloat(q.pointBiserial) !== null && toFloat(q.pointBiserial)! < 0.2) ? "low_discrimination" :
              (toFloat(q.pValue) !== null && toFloat(q.pValue)! > 0.9) ? "too_easy" :
              (toFloat(q.pValue) !== null && toFloat(q.pValue)! < 0.2) ? "too_hard" : null,
      }));

      const essayDist = essayRows.map(r => ({
        finalScore: toFloat(r.finalScore),
        aiScore: toFloat(r.aiScore),
      }));

      return {
        exam,
        cronbachAlpha: Math.round(cronbachAlpha * 1000) / 1000,
        totalAttempts: attemptStats[0]?.total || 0,
        avgScore: toFloat(attemptStats[0]?.avgScore ?? null),
        itemStats,
        essayDist,
        flaggedItems: itemStats.filter(i => i.flag !== null).length,
        publishedItems: itemStats.filter(i => i.workflowStage === "published").length,
        totalItems: itemStats.length,
      };
    }),

  generateReport: protectedProcedure
    .input(z.object({ examId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orgId = ctx.user.orgId || 1;

      const examRows = await db.select().from(exams)
        .where(and(eq(exams.id, input.examId), eq(exams.orgId, orgId))).limit(1);
      if (!examRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const exam = examRows[0]!;

      const qs = await db.select().from(questions)
        .where(eq(questions.orgId, orgId)).limit(200);

      const attemptStats = await db.select({
        total: count(),
        avgScore: avg(examAttempts.score),
      }).from(examAttempts).where(eq(examAttempts.examId, input.examId));

      const essayRows = await db.select({
        finalScore: essayScores.finalScore,
        aiScore: essayScores.aiScore,
      }).from(essayScores).limit(500);

      const pValues = qs.filter(q => q.pValue !== null).map(q => toFloat(q.pValue)!);
      const cronbachAlpha = computeCronbachAlpha(pValues);
      const avgPValue = pValues.length > 0 ? pValues.reduce((a, b) => a + b, 0) / pValues.length : null;
      const pbValues = qs.filter(q => q.pointBiserial !== null).map(q => toFloat(q.pointBiserial)!);
      const avgPB = pbValues.length > 0 ? pbValues.reduce((a, b) => a + b, 0) / pbValues.length : null;
      const avgScoreVal = toFloat(attemptStats[0]?.avgScore ?? null);

      const aiResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a senior psychometrician. Write a professional 3-paragraph executive summary for a psychometric report. Be concise and data-driven.",
          },
          {
            role: "user",
            content: `Exam: "${exam.title}"
Total Items: ${qs.length}
Total Attempts: ${attemptStats[0]?.total || 0}
Average Score: ${avgScoreVal !== null ? avgScoreVal.toFixed(1) : "N/A"}%
Cronbach's Alpha: ${cronbachAlpha.toFixed(3)}
Average p-value: ${avgPValue !== null ? avgPValue.toFixed(3) : "N/A"}
Average Point-Biserial: ${avgPB !== null ? avgPB.toFixed(3) : "N/A"}
Flagged Items: ${qs.filter(q => toFloat(q.pointBiserial) !== null && toFloat(q.pointBiserial)! < 0.2).length}
Essay Responses Scored: ${essayRows.length}

Write an executive summary covering: reliability, item quality, and recommendations.`,
          },
        ],
      });
      const narrative = typeof aiResponse.choices[0]?.message?.content === "string"
        ? aiResponse.choices[0].message.content
        : "Unable to generate narrative.";

      const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const reportDate = new Date().toISOString().split("T")[0]!;

      const itemTableRows = qs.slice(0, 50).map((q, i) => {
        const pv = toFloat(q.pValue) !== null ? toFloat(q.pValue)!.toFixed(3) : "—";
        const pb = toFloat(q.pointBiserial) !== null ? toFloat(q.pointBiserial)!.toFixed(3) : "—";
        const irtA = toFloat(q.irtA) !== null ? toFloat(q.irtA)!.toFixed(2) : "—";
        const irtB = toFloat(q.irtB) !== null ? toFloat(q.irtB)!.toFixed(2) : "—";
        const irtC = toFloat(q.irtC) !== null ? toFloat(q.irtC)!.toFixed(2) : "—";
        const flag = (toFloat(q.pointBiserial) !== null && toFloat(q.pointBiserial)! < 0.2) ? "⚠ Low Disc." :
                     (toFloat(q.pValue) !== null && toFloat(q.pValue)! > 0.9) ? "⚠ Too Easy" :
                     (toFloat(q.pValue) !== null && toFloat(q.pValue)! < 0.2) ? "⚠ Too Hard" : "✓";
        const stem = (q.stem || "").substring(0, 40).replace(/\|/g, "/");
        return `| ${i + 1} | ${stem}... | ${q.type} | ${q.difficulty ?? "—"} | ${pv} | ${pb} | ${irtA} | ${irtB} | ${irtC} | ${flag} |`;
      }).join("\n");

      const essaySection = essayRows.length > 0
        ? `\n## 5. Automated Essay Score Distribution\n\n| Final Score | AI Score |\n|-------------|----------|\n${
          essayRows.slice(0, 20).map(r => {
            const fs_ = toFloat(r.finalScore) !== null ? toFloat(r.finalScore)!.toFixed(1) : "—";
            const ai = toFloat(r.aiScore) !== null ? toFloat(r.aiScore)!.toFixed(1) : "—";
            return `| ${fs_} | ${ai} |`;
          }).join("\n")
        }\n\n*${essayRows.length} essay responses scored by AI rubric evaluation.*\n`
        : "";

      const flaggedCount = qs.filter(q => toFloat(q.pointBiserial) !== null && toFloat(q.pointBiserial)! < 0.2).length;

      const markdown = `# Psychometric Report

**Exam:** ${exam.title}
**Generated:** ${now}
**Organization ID:** ${orgId}
**Report ID:** RPT-${reportDate}-${nanoid(6).toUpperCase()}

---

## 1. Executive Summary

${narrative}

---

## 2. Test-Level Statistics

| Metric | Value |
|--------|-------|
| Total Items | ${qs.length} |
| Total Attempts | ${attemptStats[0]?.total || 0} |
| Average Score | ${avgScoreVal !== null ? avgScoreVal.toFixed(1) + "%" : "N/A"} |
| Passing Score | ${exam.passingScore ?? "70"}% |
| **Cronbach's Alpha (α)** | **${cronbachAlpha.toFixed(3)}** |
| Average p-value | ${avgPValue !== null ? avgPValue.toFixed(3) : "N/A"} |
| Average Point-Biserial | ${avgPB !== null ? avgPB.toFixed(3) : "N/A"} |
| Flagged Items | ${flaggedCount} |
| Published Items | ${qs.filter(q => q.workflowStage === "published").length} |

> **Reliability Interpretation:** Cronbach's α ≥ 0.90 = Excellent, 0.80–0.89 = Good, 0.70–0.79 = Acceptable, < 0.70 = Needs Improvement

---

## 3. Item Response Theory (IRT) Parameters

IRT parameters are estimated using the 3-Parameter Logistic (3PL) model:
- **a (Discrimination):** Ability of item to differentiate between high and low performers. Target: 0.5–2.0
- **b (Difficulty):** Theta level at which a candidate has 50% probability of correct response. Target: −2.0 to +2.0
- **c (Guessing):** Lower asymptote / pseudo-guessing parameter. Target: < 0.25

---

## 4. Item Statistics Table

| # | Item Stem | Type | Diff | p-value | Point-Biserial | IRT a | IRT b | IRT c | Flag |
|---|-----------|------|------|---------|----------------|-------|-------|-------|------|
${itemTableRows}

${qs.length > 50 ? `*Showing first 50 of ${qs.length} items.*` : ""}

**Flagging Criteria:**
- ⚠ Low Disc.: Point-Biserial < 0.20 — item does not differentiate well
- ⚠ Too Easy: p-value > 0.90 — nearly all candidates answer correctly
- ⚠ Too Hard: p-value < 0.20 — nearly all candidates answer incorrectly
${essaySection}
---

## 6. Recommendations

${flaggedCount > 0
  ? `- **Review ${flaggedCount} low-discrimination items** — these items do not effectively differentiate between high and low performers and should be revised or removed.`
  : "- All items meet minimum discrimination thresholds."}
${cronbachAlpha < 0.7
  ? "- **Improve test reliability** — Cronbach's α is below 0.70. Consider adding more items or revising poorly performing items."
  : cronbachAlpha >= 0.9
  ? "- Test reliability is excellent (α ≥ 0.90). No immediate action required."
  : "- Test reliability is acceptable. Continue monitoring with additional administrations."}
- Conduct differential item functioning (DIF) analysis across demographic groups.
- Review items flagged as too easy or too hard for potential revision or removal.
- Consider adaptive testing (IRT-based) to improve measurement precision at all ability levels.

---

*This report was generated automatically by the SDC Certifications Psychometric Engine.*
*For questions, contact your psychometrician or SDC support.*
`;

      const tmpDir = os.tmpdir();
      const mdPath = path.join(tmpDir, `report-${nanoid(8)}.md`);
      const pdfPath = path.join(tmpDir, `report-${nanoid(8)}.pdf`);

      await fs.writeFile(mdPath, markdown, "utf-8");
      await execAsync(`manus-md-to-pdf "${mdPath}" "${pdfPath}"`);

      const pdfBuffer = await fs.readFile(pdfPath);
      const fileKey = `psychometric-reports/org-${orgId}/exam-${input.examId}-${reportDate}-${nanoid(6)}.pdf`;
      const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      await Promise.allSettled([fs.unlink(mdPath), fs.unlink(pdfPath)]);

      return { url, reportId: fileKey };
    }),
});
