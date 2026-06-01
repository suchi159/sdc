import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const url = new URL(DB_URL);
const conn = await createConnection({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace("/", ""),
  ssl: { rejectUnauthorized: false },
});

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663256112242/BqBGzU832tRR27sND2ECBo";

// Map: book title substring → CDN filename
const coverMap = [
  { match: "CSP Study Guide",                                    file: "csp-study-guide_17b5fc40.png" },
  { match: "ASP Study Materials",                                file: "asp-study-materials_29751cbc.png" },
  { match: "OSHA-30 Construction",                               file: "osha-30-construction_6f309e01.png" },
  { match: "OSHA-10 General",                                    file: "osha-10-general-industry_c4370ef8.png" },
  { match: "CIH Exam Preparation",                               file: "cih-exam-prep_703bf155.png" },
  { match: "NEBOSH International",                               file: "nebosh-certificate_62f7b57c.png" },
  { match: "ISO 45001",                                          file: "iso-45001-handbook_9af6907e.png" },
  { match: "CHST Exam Guide",                                    file: "chst-exam-guide_8f573df5.png" },
  { match: "Fire Protection Handbook",                           file: "fire-protection-handbook_581ccd3a.png" },
  { match: "Environmental Health",                               file: "chmm-prep_f9c02c96.png" },
];

let updated = 0;
for (const { match, file } of coverMap) {
  const coverUrl = `${CDN}/${file}`;
  const [result] = await conn.execute(
    "UPDATE books SET coverUrl = ? WHERE title LIKE ? AND orgId = 1",
    [coverUrl, `%${match}%`]
  );
  if (result.affectedRows > 0) {
    console.log(`  UPDATED: ${match} → ${file}`);
    updated++;
  } else {
    console.warn(`  NOT FOUND: ${match}`);
  }
}

console.log(`\nDone. Updated ${updated} books with cover URLs.`);
await conn.end();
