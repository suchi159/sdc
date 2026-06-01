import { createConnection } from "mysql2/promise";
import "dotenv/config";

const conn = await createConnection(process.env.DATABASE_URL);

const statements = [
  {
    name: "proctor_bank_accounts",
    sql: `
CREATE TABLE IF NOT EXISTS \`proctor_bank_accounts\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`proctorId\` int NOT NULL,
  \`accountHolderName\` varchar(100) NOT NULL,
  \`bankName\` varchar(100) NOT NULL,
  \`accountLast4\` varchar(4) NOT NULL,
  \`routingNumber\` varchar(20) NOT NULL,
  \`accountType\` enum('checking','savings') NOT NULL DEFAULT 'checking',
  \`isVerified\` boolean DEFAULT false,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`proctor_bank_accounts_id\` PRIMARY KEY(\`id\`),
  CONSTRAINT \`proctor_bank_accounts_proctorId_unique\` UNIQUE(\`proctorId\`)
)`
  },
  {
    name: "proctor_earnings",
    sql: `
CREATE TABLE IF NOT EXISTS \`proctor_earnings\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`proctorId\` int NOT NULL,
  \`sessionId\` int,
  \`amount\` int NOT NULL,
  \`currency\` varchar(3) NOT NULL DEFAULT 'USD',
  \`type\` enum('session_fee','bonus','adjustment') NOT NULL DEFAULT 'session_fee',
  \`status\` enum('pending','available','paid_out') NOT NULL DEFAULT 'pending',
  \`description\` text,
  \`earnedAt\` timestamp NOT NULL DEFAULT (now()),
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`proctor_earnings_id\` PRIMARY KEY(\`id\`)
)`
  },
  {
    name: "proctor_payouts",
    sql: `
CREATE TABLE IF NOT EXISTS \`proctor_payouts\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`proctorId\` int NOT NULL,
  \`amount\` int NOT NULL,
  \`currency\` varchar(3) NOT NULL DEFAULT 'USD',
  \`status\` enum('requested','processing','completed','failed') NOT NULL DEFAULT 'requested',
  \`bankAccountLast4\` varchar(4),
  \`bankAccountName\` varchar(100),
  \`bankRoutingNumber\` varchar(20),
  \`notes\` text,
  \`requestedAt\` timestamp NOT NULL DEFAULT (now()),
  \`processedAt\` timestamp,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`proctor_payouts_id\` PRIMARY KEY(\`id\`)
)`
  },
  {
    name: "stripe_payments",
    sql: `
CREATE TABLE IF NOT EXISTS \`stripe_payments\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`orgId\` int NOT NULL,
  \`userId\` int NOT NULL,
  \`stripeSessionId\` varchar(255) NOT NULL,
  \`stripePaymentIntentId\` varchar(255),
  \`amount\` int NOT NULL,
  \`currency\` varchar(3) NOT NULL DEFAULT 'USD',
  \`credits\` int DEFAULT 0,
  \`plan\` varchar(50),
  \`status\` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  \`metadata\` json,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`completedAt\` timestamp,
  CONSTRAINT \`stripe_payments_id\` PRIMARY KEY(\`id\`),
  CONSTRAINT \`stripe_payments_stripeSessionId_unique\` UNIQUE(\`stripeSessionId\`)
)`
  },
  {
    name: "voucher_cohorts",
    sql: `
CREATE TABLE IF NOT EXISTS \`voucher_cohorts\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`orgId\` int NOT NULL,
  \`name\` varchar(100) NOT NULL,
  \`description\` text,
  \`examId\` int,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT \`voucher_cohorts_id\` PRIMARY KEY(\`id\`)
)`
  }
];

try {
  for (const { name, sql } of statements) {
    await conn.execute(sql);
    console.log(`✅ ${name} created/verified`);
  }

  // Seed proctor earnings for user 6 (proctor)
  await conn.execute(`
    INSERT IGNORE INTO proctor_earnings (id, proctorId, sessionId, amount, currency, type, status, description, earnedAt)
    VALUES
      (1, 6, 1, 2500, 'USD', 'session_fee', 'available', 'Proctored session: AWS Cloud Practitioner', DATE_SUB(NOW(), INTERVAL 5 DAY)),
      (2, 6, 2, 2500, 'USD', 'session_fee', 'available', 'Proctored session: Cybersecurity Fundamentals', DATE_SUB(NOW(), INTERVAL 4 DAY)),
      (3, 6, 3, 2500, 'USD', 'session_fee', 'pending', 'Proctored session: Data Science Professional', DATE_SUB(NOW(), INTERVAL 2 DAY)),
      (4, 6, 4, 3000, 'USD', 'bonus', 'available', 'Performance bonus - Q1 2026', DATE_SUB(NOW(), INTERVAL 10 DAY)),
      (5, 6, 5, 2500, 'USD', 'session_fee', 'paid_out', 'Proctored session: DevOps Engineer', DATE_SUB(NOW(), INTERVAL 30 DAY)),
      (6, 6, 6, 2500, 'USD', 'session_fee', 'paid_out', 'Proctored session: Project Management', DATE_SUB(NOW(), INTERVAL 45 DAY))
  `);
  console.log("✅ Proctor earnings seeded");

  // Seed voucher cohorts
  await conn.execute(`
    INSERT IGNORE INTO voucher_cohorts (id, orgId, name, description, examId)
    VALUES
      (1, 1, 'Q1 2026 Batch', 'First quarter certification batch', 1),
      (2, 1, 'Partner Program', 'External partner certifications', 2),
      (3, 2, 'TechCert Spring 2026', 'Spring semester cohort', 3)
  `);
  console.log("✅ Voucher cohorts seeded");

  console.log("\n✅ Migration complete!");
} catch (err) {
  console.error("❌ Migration error:", err.message);
  process.exit(1);
} finally {
  await conn.end();
}
