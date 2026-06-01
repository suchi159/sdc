import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";

const sql = readFileSync(
  new URL("../drizzle/0007_bent_hannibal_king.sql", import.meta.url),
  "utf-8"
);

const conn = await createConnection(process.env.DATABASE_URL);

// Split on statement-breakpoint and run each statement
const statements = sql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log("✓", stmt.slice(0, 60).replace(/\n/g, " "));
  } catch (err) {
    if (err.code === "ER_TABLE_EXISTS_ERROR") {
      console.log("⚠ already exists, skipping:", stmt.slice(0, 60));
    } else {
      throw err;
    }
  }
}

await conn.end();
console.log("✅ Iteration 11 migration complete");
