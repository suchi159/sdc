import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { getDb } from "../db";
import { questions, examBlueprints, essayScores } from "../../drizzle/schema";
import { eq, and, desc, like, or, ne } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["super_admin", "org_admin", "psychometrician", "exam_developer"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const itemBankRouter = router({
  // ── Item Review Workflow ─────────────────────────────────────────────────
  listByWorkflowStage: adminProcedure
    .input(z.object({ stage: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.orgId || 1;
      const rows = await db.select().from(questions)
        .where(eq(questions.orgId, orgId))
        .orderBy(desc(questions.updatedAt))
        .limit(500);
      if (input.stage) return rows.filter(r => r.workflowStage === input.stage);
      return rows;
    }),

  advanceWorkflowStage: adminProcedure
    .input(z.object({
      questionId: z.number(),
      stage: z.enum(["draft", "expert_review", "qa_review", "approved", "published", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(questions)
        .set({ workflowStage: input.stage, updatedAt: new Date() })
        .where(eq(questions.id, input.questionId));
      return { success: true };
    }),

  bulkAdvanceStage: adminProcedure
    .input(z.object({
      questionIds: z.array(z.number()),
      stage: z.enum(["draft", "expert_review", "qa_review", "approved", "published", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      for (const id of input.questionIds) {
        await db.update(questions)
          .set({ workflowStage: input.stage, updatedAt: new Date() })
          .where(eq(questions.id, id));
      }
      return { moved: input.questionIds.length };
    }),

  // ── AI Item Generation (AIG) ─────────────────────────────────────────────
  generateItems: adminProcedure
    .input(z.object({
      topic: z.string().min(3),
      questionType: z.enum(["mcq", "true_false", "short_answer", "multi_select"]),
      difficulty: z.number().min(1).max(5).default(3),
      count: z.number().min(1).max(10).default(5),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const typeInstructions: Record<string, string> = {
        mcq: "4-option multiple choice with one correct answer",
        true_false: "true/false statement",
        short_answer: "short answer question (no options needed)",
        multi_select: "multiple select with 2-3 correct answers from 5 options",
      };

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert psychometrician and item writer. Generate high-quality exam questions in JSON format.`,
          },
          {
            role: "user",
            content: `Generate ${input.count} ${typeInstructions[input.questionType]} questions about: "${input.topic}".
Difficulty level: ${input.difficulty}/5.
${input.context ? `Context/source material: ${input.context}` : ""}

Return ONLY a JSON array with objects having these fields:
- stem: string (the question text)
- options: array of {id, text} objects (omit for short_answer)
- correctAnswer: string or array of strings (option id(s) or "true"/"false")
- explanation: string (why this is correct)
- tags: array of strings (topic keywords)`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "generated_questions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      stem: { type: "string" },
                      options: { type: "array", items: { type: "object", properties: { id: { type: "string" }, text: { type: "string" } }, required: ["id", "text"], additionalProperties: false } },
                      correctAnswer: { type: "string" },
                      explanation: { type: "string" },
                      tags: { type: "array", items: { type: "string" } },
                    },
                    required: ["stem", "explanation", "tags"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices[0]?.message?.content;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const generated = parsed?.questions || [];

      const orgId = ctx.user.orgId || 1;
      const inserted: number[] = [];
      for (const q of generated) {
        const [result] = await db.insert(questions).values({
          orgId,
          createdBy: ctx.user.id,
          type: input.questionType,
          stem: q.stem,
          options: q.options || null,
          correctAnswer: q.correctAnswer || null,
          explanation: q.explanation,
          difficulty: input.difficulty,
          tags: q.tags,
          workflowStage: "draft",
          status: "draft",
        });
        inserted.push((result as any).insertId);
      }
      return { generated: generated.length, questionIds: inserted };
    }),

  // ── Enemy Item Detection ─────────────────────────────────────────────────
  detectEnemyItems: adminProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const rows = await db.select().from(questions)
        .where(eq(questions.orgId, ctx.user.orgId || 1))
        .limit(200);

      const target = rows.find(r => r.id === input.questionId);
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });

      const others = rows.filter(r => r.id !== input.questionId).slice(0, 50);
      if (others.length === 0) return { enemies: [] };

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a psychometrician. Identify semantically similar (enemy) items that test the same knowledge point and should not appear in the same exam.",
          },
          {
            role: "user",
            content: `Target question: "${target.stem}"

Compare against these questions and return IDs of those with similarity > 0.7:
${others.map(q => `ID ${q.id}: "${q.stem}"`).join("\n")}

Return JSON: {"enemies": [{"id": number, "similarity": number, "reason": string}]}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "enemy_items",
            strict: true,
            schema: {
              type: "object",
              properties: {
                enemies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      similarity: { type: "number" },
                      reason: { type: "string" },
                    },
                    required: ["id", "similarity", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["enemies"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices[0]?.message?.content;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const enemies = parsed?.enemies || [];

      // Store highest similarity on the target question
      if (enemies.length > 0) {
        const maxSim = Math.max(...enemies.map((e: any) => e.similarity));
        await db.update(questions).set({
          enemySimilarity: String(maxSim),
          enemyItemIds: enemies.map((e: any) => e.id),
        }).where(eq(questions.id, input.questionId));
      }

      return { enemies };
    }),

  // ── Item Statistics ──────────────────────────────────────────────────────
  getItemStats: adminProcedure
    .input(z.object({ questionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const rows = await db.select().from(questions).where(eq(questions.id, input.questionId)).limit(1);
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const q = rows[0]!;
      return {
        id: q.id,
        stem: q.stem,
        pValue: q.pValue,
        pointBiserial: q.pointBiserial,
        irtA: q.irtA,
        irtB: q.irtB,
        irtC: q.irtC,
        difficulty: q.difficulty,
        enemySimilarity: q.enemySimilarity,
        enemyItemIds: q.enemyItemIds,
        workflowStage: q.workflowStage,
      };
    }),

  // ── Exam Blueprints (ATA) ────────────────────────────────────────────────
  blueprints: {
    list: adminProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(examBlueprints)
        .where(eq(examBlueprints.orgId, ctx.user.orgId || 1))
        .orderBy(desc(examBlueprints.createdAt));
    }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        totalQuestions: z.number().min(1).max(500).default(50),
        sections: z.array(z.object({
          name: z.string(),
          difficulty: z.number().min(1).max(5),
          count: z.number().min(1),
          categoryId: z.number().optional(),
          tags: z.array(z.string()).optional(),
        })).optional(),
        passingScore: z.string().optional(),
        timeLimit: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(examBlueprints).values({
          orgId: ctx.user.orgId || 1,
          createdBy: ctx.user.id,
          name: input.name,
          description: input.description,
          totalQuestions: input.totalQuestions,
          sections: input.sections || null,
          passingScore: input.passingScore || "70.00",
          timeLimit: input.timeLimit,
          status: "draft",
        });
        return { success: true };
      }),

    assemble: adminProcedure
      .input(z.object({ blueprintId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const bpRows = await db.select().from(examBlueprints)
          .where(eq(examBlueprints.id, input.blueprintId)).limit(1);
        if (!bpRows.length) throw new TRPCError({ code: "NOT_FOUND" });
        const bp = bpRows[0]!;

        const allQuestions = await db.select().from(questions)
          .where(and(eq(questions.orgId, ctx.user.orgId || 1), eq(questions.workflowStage, "approved")))
          .orderBy(desc(questions.updatedAt))
          .limit(1000);

        const sections = (bp.sections as any[]) || [];
        const assembled: number[] = [];

        for (const section of sections) {
          const pool = allQuestions.filter(q => {
            const diffMatch = !section.difficulty || q.difficulty === section.difficulty;
            const catMatch = !section.categoryId || q.categoryId === section.categoryId;
            const tagMatch = !section.tags?.length || (q.tags as string[])?.some(t => section.tags.includes(t));
            return diffMatch && catMatch && tagMatch && !assembled.includes(q.id);
          });
          const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, section.count);
          assembled.push(...shuffled.map(q => q.id));
        }

        if (assembled.length === 0 && allQuestions.length > 0) {
          assembled.push(...allQuestions.slice(0, bp.totalQuestions).map(q => q.id));
        }

         return { assembledQuestionIds: assembled, count: assembled.length };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        totalQuestions: z.number().min(1).max(500).optional(),
        sections: z.array(z.object({
          name: z.string(),
          difficulty: z.number().min(1).max(5),
          count: z.number().min(1),
          categoryId: z.number().optional(),
          tags: z.array(z.string()).optional(),
        })).optional(),
        passingScore: z.string().optional(),
        timeLimit: z.number().optional(),
        status: z.enum(["draft", "active", "archived"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...updates } = input;
        await db.update(examBlueprints).set({ ...updates, updatedAt: new Date() })
          .where(and(eq(examBlueprints.id, id), eq(examBlueprints.orgId, ctx.user.orgId || 1)));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(examBlueprints)
          .where(and(eq(examBlueprints.id, input.id), eq(examBlueprints.orgId, ctx.user.orgId || 1)));
        return { success: true };
      }),
  },
  // ── Automated Essay Scoring (AES) ────────────────────────────────────────
  scoreEssay: adminProcedure
    .input(z.object({
      attemptId: z.number(),
      questionId: z.number(),
      candidateId: z.number(),
      responseText: z.string().min(1),
      rubric: z.array(z.object({
        criterion: z.string(),
        maxScore: z.number(),
        weight: z.number(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const qRows = await db.select().from(questions).where(eq(questions.id, input.questionId)).limit(1);
      const question = qRows[0];

      const rubricText = input.rubric
        ? input.rubric.map(r => `- ${r.criterion} (max ${r.maxScore} pts, weight ${r.weight})`).join("\n")
        : "- Content accuracy (40 pts)\n- Clarity and structure (30 pts)\n- Depth of analysis (30 pts)";

      const maxScore = input.rubric ? input.rubric.reduce((s, r) => s + r.maxScore, 0) : 100;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert essay scorer. Score the response against the rubric and provide detailed rationale.",
          },
          {
            role: "user",
            content: `Question: ${question?.stem || "Essay question"}

Rubric:
${rubricText}

Candidate Response:
${input.responseText}

Score this response (0-${maxScore} total) and explain your scoring for each criterion. Return JSON.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "essay_score",
            strict: true,
            schema: {
              type: "object",
              properties: {
                totalScore: { type: "number" },
                rationale: { type: "string" },
                criterionScores: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      criterion: { type: "string" },
                      score: { type: "number" },
                      comment: { type: "string" },
                    },
                    required: ["criterion", "score", "comment"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["totalScore", "rationale", "criterionScores"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices[0]?.message?.content;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

      // Upsert essay score record
      const existing = await db.select().from(essayScores)
        .where(and(eq(essayScores.attemptId, input.attemptId), eq(essayScores.questionId, input.questionId)))
        .limit(1);

      if (existing.length > 0) {
        await db.update(essayScores).set({
          aiScore: String(parsed.totalScore),
          aiRationale: JSON.stringify(parsed),
          status: "ai_scored",
          updatedAt: new Date(),
        }).where(eq(essayScores.id, existing[0]!.id));
      } else {
        await db.insert(essayScores).values({
          attemptId: input.attemptId,
          questionId: input.questionId,
          candidateId: input.candidateId,
          responseText: input.responseText,
          rubric: input.rubric || null,
          aiScore: String(parsed.totalScore),
          aiRationale: JSON.stringify(parsed),
          status: "ai_scored",
        });
      }

      return { score: parsed.totalScore, rationale: parsed.rationale, criterionScores: parsed.criterionScores };
    }),

  listEssayScores: adminProcedure
    .input(z.object({ attemptId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.attemptId) {
        return db.select().from(essayScores)
          .where(eq(essayScores.attemptId, input.attemptId))
          .orderBy(desc(essayScores.createdAt));
      }
      return db.select().from(essayScores)
        .orderBy(desc(essayScores.createdAt)).limit(100);
    }),

  // ── CSV Export ───────────────────────────────────────────────────────────
  exportCsv: adminProcedure
    .input(z.object({ stage: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return "";
      const orgId = ctx.user.orgId || 1;
      const rows = await db.select().from(questions)
        .where(eq(questions.orgId, orgId))
        .orderBy(desc(questions.createdAt))
        .limit(1000);

      const filtered = input.stage ? rows.filter(r => r.workflowStage === input.stage) : rows;
      const header = "id,type,stem,difficulty,workflowStage,pValue,pointBiserial,irtA,irtB,irtC,tags,status";
      const lines = filtered.map(q =>
        [q.id, q.type, `"${(q.stem || "").replace(/"/g, '""')}"`, q.difficulty, q.workflowStage,
          q.pValue, q.pointBiserial, q.irtA, q.irtB, q.irtC,
          `"${(q.tags as string[] || []).join(";")}"`, q.status].join(",")
      );
      return [header, ...lines].join("\n");
    }),
});
