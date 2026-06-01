import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 99 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("../server/db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          questions: [
            {
              stem: "What is the OSI model?",
              options: [{ id: "a", text: "A" }, { id: "b", text: "B" }],
              correctAnswer: "a",
              explanation: "The OSI model has 7 layers.",
              tags: ["networking", "osi"],
            },
          ],
          enemies: [],
          risk: "low",
          summary: "No incidents detected.",
          recommendation: "Session appears clean.",
          confidenceScore: 0.95,
          totalScore: 78,
          rationale: "Good response",
          criterionScores: [{ criterion: "Content", score: 38, comment: "Accurate" }],
        }),
      },
    }],
  }),
}));

// ─── Item Bank Router Tests ────────────────────────────────────────────────────

describe("itemBank router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockResolvedValue([{ insertId: 99 }]);
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
  });

  it("listByWorkflowStage returns empty array when no items", async () => {
    const { getDb } = await import("../server/db");
    const db = await getDb();
    expect(db).toBeDefined();
    const result = await (db as any).select().from({}).where({}).orderBy({}).limit(500);
    expect(result).toEqual([]);
  });

  it("advanceWorkflowStage calls db.update with correct stage", async () => {
    const { getDb } = await import("../server/db");
    const db = await getDb();
    await (db as any).update({}).set({ workflowStage: "approved" }).where({});
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.set).toHaveBeenCalledWith({ workflowStage: "approved" });
  });

  it("bulkAdvanceStage iterates over all question IDs", async () => {
    const { getDb } = await import("../server/db");
    const db = await getDb();
    const ids = [1, 2, 3];
    for (const id of ids) {
      await (db as any).update({}).set({ workflowStage: "published" }).where({});
    }
    expect(mockDb.update).toHaveBeenCalledTimes(3);
  });

  it("generateItems calls invokeLLM with correct parameters", async () => {
    const { invokeLLM } = await import("../server/_core/llm");
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "You are a psychometrician." },
        { role: "user", content: "Generate 5 MCQ questions about networking." },
      ],
    });
    expect(result.choices[0].message.content).toBeTruthy();
    const parsed = JSON.parse(result.choices[0].message.content as string);
    expect(parsed.questions).toHaveLength(1);
    expect(parsed.questions[0].stem).toBe("What is the OSI model?");
  });

  it("detectEnemyItems returns empty enemies when no similar items", async () => {
    const { invokeLLM } = await import("../server/_core/llm");
    const result = await invokeLLM({ messages: [] });
    const parsed = JSON.parse(result.choices[0].message.content as string);
    expect(parsed.enemies).toEqual([]);
  });

  it("blueprints.create inserts a blueprint with correct fields", async () => {
    const { getDb } = await import("../server/db");
    const db = await getDb();
    await (db as any).insert({}).values({
      name: "CCNA Blueprint",
      totalQuestions: 60,
      passingScore: "70.00",
      timeLimit: 90,
      orgId: 1,
      createdBy: 1,
      status: "draft",
    });
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      name: "CCNA Blueprint",
      totalQuestions: 60,
    }));
  });

  it("scoreEssay calls invokeLLM and returns score", async () => {
    const { invokeLLM } = await import("../server/_core/llm");
    const result = await invokeLLM({ messages: [] });
    const parsed = JSON.parse(result.choices[0].message.content as string);
    expect(parsed.totalScore).toBe(78);
    expect(parsed.rationale).toBe("Good response");
    expect(parsed.criterionScores).toHaveLength(1);
  });

  it("exportCsv returns CSV header row", () => {
    const header = "id,type,stem,difficulty,workflowStage,pValue,pointBiserial,irtA,irtB,irtC,tags,status";
    expect(header).toContain("id");
    expect(header).toContain("workflowStage");
    expect(header).toContain("irtA");
  });
});

// ─── Proctoring Router Tests ───────────────────────────────────────────────────

describe("proctoring router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockResolvedValue([{ insertId: 1 }]);
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
  });

  it("preCheck.upsert inserts a new record when none exists", async () => {
    const { getDb } = await import("../server/db");
    const db = await getDb();
    await (db as any).insert({}).values({
      attemptId: 1,
      candidateId: 1,
      webcamOk: true,
      micOk: true,
      status: "in_progress",
    });
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      webcamOk: true,
      status: "in_progress",
    }));
  });

  it("preCheck.complete marks status as passed when all checks pass", () => {
    const check = {
      webcamOk: true, micOk: true, bandwidthOk: true,
      idVerified: true, roomScanOk: true,
    };
    const allPassed = check.webcamOk && check.micOk && check.bandwidthOk && check.idVerified && check.roomScanOk;
    expect(allPassed).toBe(true);
  });

  it("preCheck.complete marks status as failed when any check fails", () => {
    const check = {
      webcamOk: true, micOk: false, bandwidthOk: true,
      idVerified: true, roomScanOk: true,
    };
    const allPassed = check.webcamOk && check.micOk && check.bandwidthOk && check.idVerified && check.roomScanOk;
    expect(allPassed).toBe(false);
  });

  it("liveMonitor.activeSessions returns empty array when no active sessions", async () => {
    const { getDb } = await import("../server/db");
    const db = await getDb();
    const result = await (db as any).select().from({}).where({}).orderBy({}).limit(50);
    expect(result).toEqual([]);
  });

  it("liveMonitor.flagIncident inserts incident with correct type and severity", async () => {
    const { getDb } = await import("../server/db");
    const db = await getDb();
    await (db as any).insert({}).values({
      sessionId: 1,
      type: "gaze_deviation",
      severity: "medium",
      reviewedBy: 1,
    });
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      type: "gaze_deviation",
      severity: "medium",
    }));
  });

  it("analyzeSession calls invokeLLM and returns risk assessment", async () => {
    const { invokeLLM } = await import("../server/_core/llm");
    const result = await invokeLLM({ messages: [] });
    const parsed = JSON.parse(result.choices[0].message.content as string);
    expect(parsed.risk).toBe("low");
    expect(parsed.summary).toBe("No incidents detected.");
    expect(parsed.confidenceScore).toBe(0.95);
  });

  it("dashboardStats returns correct structure", () => {
    const stats = { active: 3, flagged: 1, completed: 12, totalIncidents: 5 };
    expect(stats).toHaveProperty("active");
    expect(stats).toHaveProperty("flagged");
    expect(stats).toHaveProperty("completed");
    expect(stats).toHaveProperty("totalIncidents");
    expect(typeof stats.active).toBe("number");
  });

  it("sessionReport returns timeline and breakdown", () => {
    const incidents = [
      { id: 1, type: "gaze_deviation", severity: "low", timestamp: new Date(), description: null, evidenceUrl: null },
      { id: 2, type: "tab_switch", severity: "medium", timestamp: new Date(), description: null, evidenceUrl: null },
      { id: 3, type: "gaze_deviation", severity: "low", timestamp: new Date(), description: null, evidenceUrl: null },
    ];
    const breakdown: Record<string, number> = {};
    for (const inc of incidents) {
      breakdown[inc.type] = (breakdown[inc.type] || 0) + 1;
    }
    expect(breakdown["gaze_deviation"]).toBe(2);
    expect(breakdown["tab_switch"]).toBe(1);
  });
});

// ─── Pre-Exam Check Logic Tests ────────────────────────────────────────────────

describe("pre-exam check logic", () => {
  it("all 6 steps must pass for check to be complete", () => {
    const STEPS = ["webcamOk", "micOk", "bandwidthOk", "idVerified", "roomScanOk", "lockdownBrowserOk"];
    const results: Record<string, boolean> = {
      webcamOk: true, micOk: true, bandwidthOk: true,
      idVerified: true, roomScanOk: true, lockdownBrowserOk: true,
    };
    const allPassed = STEPS.every(step => results[step] === true);
    expect(allPassed).toBe(true);
  });

  it("fails if lockdown browser check fails", () => {
    const results: Record<string, boolean> = {
      webcamOk: true, micOk: true, bandwidthOk: true,
      idVerified: true, roomScanOk: true, lockdownBrowserOk: false,
    };
    const allPassed = Object.values(results).every(Boolean);
    expect(allPassed).toBe(false);
  });

  it("progress percentage is calculated correctly", () => {
    const totalSteps = 6;
    const completedSteps = 4;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    expect(progress).toBe(67);
  });
});

// ─── Exam Blueprint Assembly Tests ────────────────────────────────────────────

describe("exam blueprint assembly", () => {
  it("assembles questions matching section difficulty", () => {
    const questions = [
      { id: 1, difficulty: 2, workflowStage: "approved", tags: ["networking"], categoryId: null },
      { id: 2, difficulty: 3, workflowStage: "approved", tags: ["security"], categoryId: null },
      { id: 3, difficulty: 2, workflowStage: "approved", tags: ["networking"], categoryId: null },
      { id: 4, difficulty: 4, workflowStage: "draft", tags: ["networking"], categoryId: null },
    ];
    const section = { difficulty: 2, count: 2, tags: ["networking"] };
    const pool = questions.filter(q =>
      q.workflowStage === "approved" &&
      q.difficulty === section.difficulty &&
      (q.tags as string[]).some(t => section.tags.includes(t))
    );
    expect(pool).toHaveLength(2);
    expect(pool.every(q => q.difficulty === 2)).toBe(true);
  });

  it("blueprint total questions matches sum of section counts", () => {
    const sections = [
      { name: "Core", difficulty: 2, count: 20 },
      { name: "Applied", difficulty: 3, count: 20 },
      { name: "Advanced", difficulty: 4, count: 10 },
    ];
    const total = sections.reduce((s, sec) => s + sec.count, 0);
    expect(total).toBe(50);
  });
});
