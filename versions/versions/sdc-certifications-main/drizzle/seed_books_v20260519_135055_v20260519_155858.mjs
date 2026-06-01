import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

// Parse mysql://user:pass@host:port/db?ssl=...
const url = new URL(DB_URL);
const conn = await createConnection({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace("/", ""),
  ssl: { rejectUnauthorized: false },
});

const books = [
  {
    orgId: 1,
    title: "CSP Study Guide & Workbook",
    author: "American Society of Safety Professionals",
    isbn: "978-0-87912-320-5",
    description:
      "Comprehensive preparation guide for the Certified Safety Professional (CSP) examination. Covers all BCSP exam domains including hazard identification, risk assessment, incident investigation, emergency response, and regulatory compliance. Includes 400+ practice questions with detailed rationales.",
    industry: "Occupational Safety",
    price: "89.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "ASP Study Materials — Associate Safety Professional",
    author: "Board of Certified Safety Professionals",
    isbn: "978-0-87912-295-6",
    description:
      "Official preparation materials for the Associate Safety Professional (ASP) exam. Covers safety management, industrial hygiene fundamentals, fire prevention, ergonomics, and environmental safety. Ideal for candidates with 1–4 years of safety experience.",
    industry: "Occupational Safety",
    price: "69.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "OSHA-30 Construction Safety Handbook",
    author: "National Safety Council",
    isbn: "978-0-87912-418-9",
    description:
      "Complete reference for OSHA 30-Hour Construction Industry outreach training. Covers fall protection, scaffolding, electrical safety, excavation, personal protective equipment, and OSHA standards 29 CFR 1926. Includes case studies and inspection checklists.",
    industry: "Construction Safety",
    price: "59.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "OSHA-10 General Industry Safety Guide",
    author: "National Safety Council",
    isbn: "978-0-87912-401-1",
    description:
      "Foundational guide for the OSHA 10-Hour General Industry outreach training. Covers walking-working surfaces, machine guarding, lockout/tagout, hazard communication (GHS/SDS), and emergency action plans per 29 CFR 1910.",
    industry: "General Industry",
    price: "49.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "CIH Exam Preparation — Certified Industrial Hygienist",
    author: "American Industrial Hygiene Association",
    isbn: "978-0-932627-96-3",
    description:
      "Authoritative study resource for the Certified Industrial Hygienist (CIH) examination. Covers chemical, biological, physical, and ergonomic hazards; exposure assessment; toxicology; ventilation; and AIHA/ACGIH standards. Includes worked examples and practice exams.",
    industry: "Industrial Hygiene",
    price: "99.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "NEBOSH International General Certificate Study Guide",
    author: "RRC International",
    isbn: "978-1-911002-30-4",
    description:
      "Complete study guide for the NEBOSH International General Certificate in Occupational Health and Safety. Covers risk management, workplace hazards, health and safety management systems, and international legislation. Aligned with the 2019 syllabus.",
    industry: "International Safety",
    price: "79.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "ISO 45001:2018 Implementation Handbook",
    author: "BSI Standards",
    isbn: "978-0-580-90060-5",
    description:
      "Practical implementation guide for ISO 45001:2018 Occupational Health and Safety Management Systems. Covers context of the organization, leadership, planning, support, operation, performance evaluation, and continual improvement. Includes gap analysis templates and audit checklists.",
    industry: "Safety Management Systems",
    price: "75.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "CHST Exam Guide — Construction Health & Safety Technician",
    author: "Board of Certified Safety Professionals",
    isbn: "978-0-87912-350-2",
    description:
      "Targeted preparation for the Construction Health and Safety Technician (CHST) certification. Covers pre-project planning, site safety management, fall protection, scaffolding, trenching, and OSHA construction standards. Includes 300+ practice questions.",
    industry: "Construction Safety",
    price: "65.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "Fire Protection Handbook — NFPA Complete Reference",
    author: "National Fire Protection Association",
    isbn: "978-0-87765-821-4",
    description:
      "The definitive reference for fire protection engineering and safety. Covers fire dynamics, suppression systems, detection and alarm systems, egress design, hazardous materials, and NFPA codes. Essential for CFI, CFPS, and fire safety certification candidates.",
    industry: "Fire Safety",
    price: "120.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
  {
    orgId: 1,
    title: "Environmental Health & Safety Management — CHMM Prep",
    author: "Institute of Hazardous Materials Management",
    isbn: "978-0-87912-380-9",
    description:
      "Comprehensive preparation for the Certified Hazardous Materials Manager (CHMM) examination. Covers hazardous waste regulations (RCRA, CERCLA), spill response, DOT transport requirements, air and water quality standards, and EHS program management.",
    industry: "Environmental Safety",
    price: "85.00",
    fileType: "pdf",
    drmEnabled: 1,
    maxPrintPercent: 10,
    status: "published",
  },
];

// Check if already seeded
const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM books WHERE orgId = 1 AND status = 'published'");
const count = existing[0].cnt;
if (count >= 10) {
  console.log(`Already seeded: ${count} published books found. Skipping.`);
  await conn.end();
  process.exit(0);
}

let inserted = 0;
for (const book of books) {
  // Skip if title already exists
  const [dup] = await conn.execute("SELECT id FROM books WHERE title = ? AND orgId = 1 LIMIT 1", [book.title]);
  if (dup.length > 0) {
    console.log(`  SKIP (exists): ${book.title}`);
    continue;
  }
  await conn.execute(
    `INSERT INTO books (orgId, title, author, isbn, description, industry, price, fileType, drmEnabled, maxPrintPercent, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      book.orgId,
      book.title,
      book.author,
      book.isbn,
      book.description,
      book.industry,
      book.price,
      book.fileType,
      book.drmEnabled,
      book.maxPrintPercent,
      book.status,
    ]
  );
  console.log(`  INSERTED: ${book.title} (${book.industry}) — $${book.price}`);
  inserted++;
}

console.log(`\nDone. Inserted ${inserted} books.`);
await conn.end();
