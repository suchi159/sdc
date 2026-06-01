import { createConnection } from "mysql2/promise";
import "dotenv/config";
const conn = await createConnection(process.env.DATABASE_URL);
const statements = [
  {
    name: "exam_blueprints",
    sql: `CREATE TABLE IF NOT EXISTS \`exam_blueprints\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`orgId\` int NOT NULL,
  \`createdBy\` int NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`description\` text,
  \`totalQuestions\` int NOT NULL DEFAULT 50,
  \`sections\` json,
  \`passingScore\` decimal(5,2) DEFAULT '70.00',
  \`timeLimit\` int,
  \`status\` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`exam_blueprints_id\` PRIMARY KEY(\`id\`)
)`
  },
  {
    name: "pre_exam_checks",
    sql: `CREATE TABLE IF NOT EXISTS \`pre_exam_checks\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`attemptId\` int NOT NULL,
  \`candidateId\` int NOT NULL,
  \`webcamOk\` boolean DEFAULT false,
  \`micOk\` boolean DEFAULT false,
  \`bandwidthOk\` boolean DEFAULT false,
  \`idVerified\` boolean DEFAULT false,
  \`idPhotoUrl\` text,
  \`roomScanOk\` boolean DEFAULT false,
  \`roomScanVideoUrl\` text,
  \`lockdownBrowserOk\` boolean DEFAULT false,
  \`completedAt\` timestamp,
  \`status\` enum('pending','in_progress','passed','failed') NOT NULL DEFAULT 'pending',
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`pre_exam_checks_id\` PRIMARY KEY(\`id\`)
)`
  },
  {
    name: "alter_proctor_incidents_type",
    sql: `ALTER TABLE \`proctor_incidents\` MODIFY COLUMN \`type\` enum('gaze_deviation','face_not_detected','multiple_faces','audio_anomaly','tab_switch','phone_detected','manual_flag','notebook_detected','second_monitor','screen_share_detected','identity_mismatch') NOT NULL`
  },
  {
    name: "add_workflowStage_to_questions",
    sql: `ALTER TABLE \`questions\` ADD COLUMN IF NOT EXISTS \`workflowStage\` enum('draft','expert_review','qa_review','approved','published','archived') NOT NULL DEFAULT 'draft'`
  },
  {
    name: "add_enemySimilarity_to_questions",
    sql: `ALTER TABLE \`questions\` ADD COLUMN IF NOT EXISTS \`enemySimilarity\` decimal(5,4)`
  },
  {
    name: "add_enemyItemIds_to_questions",
    sql: `ALTER TABLE \`questions\` ADD COLUMN IF NOT EXISTS \`enemyItemIds\` json`
  },
];
for (const stmt of statements) {
  try {
    await conn.execute(stmt.sql);
    console.log(`✓ ${stmt.name}`);
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME" || e.code === "ER_TABLE_EXISTS_ERROR" || e.message?.includes("Duplicate column")) {
      console.log(`~ ${stmt.name} (already exists)`);
    } else {
      console.error(`✗ ${stmt.name}: ${e.message}`);
    }
  }
}
await conn.end();
console.log("Migration complete.");
