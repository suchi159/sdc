import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = readFileSync(
  join(__dirname, "../drizzle/0006_steady_jack_murdock.sql"),
  "utf8"
);

const conn = await createConnection(process.env.DATABASE_URL);

const statements = sql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    const match = stmt.match(/CREATE TABLE `([^`]+)`/);
    console.log(`✓ Created table: ${match ? match[1] : "(unknown)"}`);
  } catch (err) {
    if (err.code === "ER_TABLE_EXISTS_ERROR") {
      console.log(`  Table already exists, skipping.`);
    } else {
      console.error(`✗ Error: ${err.message}`);
    }
  }
}

await conn.end();
console.log("Migration complete.");
