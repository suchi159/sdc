/**
 * SDC Certifications — Comprehensive Seed Script (v2 — column-corrected)
 * Run: node scripts/seed.mjs
 */
import { createConnection } from "mysql2/promise";
import { randomBytes, createHash } from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("❌ DATABASE_URL not set"); process.exit(1); }

function nanoid(len = 8) { return randomBytes(len).toString("base64url").slice(0, len).toUpperCase(); }
function credId() { return `SDC-${new Date().getFullYear()}-${nanoid(8)}`; }
function hashData(data, prev = "GENESIS") { return createHash("sha256").update(JSON.stringify(data) + prev).digest("hex"); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }

async function seed() {
  const conn = await createConnection(DB_URL);
  console.log("✅ Connected to database\n");

  try {
    // ── 1. ORGANIZATIONS ────────────────────────────────────────────────────
    console.log("🏢 Seeding organizations...");
    await conn.execute(`
      INSERT IGNORE INTO organizations (id, name, slug, industry, plan, apiKey, status, createdAt, updatedAt)
      VALUES
        (1, 'SDC Global Institute',    'sdc-global',   'Professional Development', 'enterprise',   'sdc_live_PRD1XXXXXXXXXXXXXXXXXXXXXXXX', 'active', NOW(), NOW()),
        (2, 'TechCert Academy',        'techcert',     'Information Technology',   'professional', 'sdc_live_TC01XXXXXXXXXXXXXXXXXXXXXXXX', 'active', NOW(), NOW()),
        (3, 'HealthPro Credentialing', 'healthpro',    'Healthcare',               'starter',      'sdc_live_HP01XXXXXXXXXXXXXXXXXXXXXXXX', 'active', NOW(), NOW())
    `);

    // ── 2. USERS ────────────────────────────────────────────────────────────
    console.log("👥 Seeding users...");
    await conn.execute(`
      INSERT IGNORE INTO users (id, openId, name, email, loginMethod, role, orgId, createdAt, updatedAt, lastSignedIn)
      VALUES
        (1,  'demo-superadmin-001', 'Dr. Sarah Mitchell',  'sarah.mitchell@sdc.global',   'oauth', 'super_admin',     NULL, NOW(), NOW(), NOW()),
        (2,  'demo-orgadmin-001',   'James Okonkwo',       'james.okonkwo@sdcglobal.com', 'oauth', 'org_admin',       1,    NOW(), NOW(), NOW()),
        (3,  'demo-psycho-001',     'Dr. Priya Sharma',    'priya.sharma@sdcglobal.com',  'oauth', 'psychometrician', 1,    NOW(), NOW(), NOW()),
        (4,  'demo-examdev-001',    'Marcus Chen',         'marcus.chen@sdcglobal.com',   'oauth', 'exam_developer',  1,    NOW(), NOW(), NOW()),
        (5,  'demo-instructor-001', 'Amelia Rodriguez',    'amelia.r@sdcglobal.com',      'oauth', 'instructor',      1,    NOW(), NOW(), NOW()),
        (6,  'demo-proctor-001',    'David Kim',           'david.kim@sdcglobal.com',     'oauth', 'proctor',         1,    NOW(), NOW(), NOW()),
        (7,  'demo-candidate-001',  'Liam Thompson',       'liam.t@example.com',          'oauth', 'candidate',       1,    NOW(), NOW(), NOW()),
        (8,  'demo-candidate-002',  'Fatima Al-Hassan',    'fatima.h@example.com',        'oauth', 'candidate',       1,    NOW(), NOW(), NOW()),
        (9,  'demo-candidate-003',  'Noah Patel',          'noah.patel@example.com',      'oauth', 'candidate',       2,    NOW(), NOW(), NOW()),
        (10, 'demo-candidate-004',  'Isabella Nguyen',     'isabella.n@example.com',      'oauth', 'candidate',       2,    NOW(), NOW(), NOW()),
        (11, 'demo-orgadmin-002',   'Elena Volkov',        'elena.v@techcert.com',        'oauth', 'org_admin',       2,    NOW(), NOW(), NOW()),
        (12, 'demo-candidate-005',  'Kwame Asante',        'kwame.a@example.com',         'oauth', 'candidate',       3,    NOW(), NOW(), NOW())
    `);

    // ── 3. CREDENTIAL TEMPLATES ─────────────────────────────────────────────
    console.log("🎖️  Seeding credential templates...");
    await conn.execute(`
      INSERT IGNORE INTO credential_templates (id, orgId, name, description, criteria, skills, validityMonths, isAnsiAligned, createdAt)
      VALUES
        (1, 1, 'Certified Digital Transformation Leader',
          'Validates mastery of digital transformation strategy, change management, and technology adoption.',
          'Pass CDTL exam with ≥75% score and complete 40 hours of coursework.',
          '["Digital Strategy","Change Management","Technology Adoption","Innovation Leadership","Data-Driven Decision Making"]',
          24, 1, NOW()),
        (2, 1, 'AI & Machine Learning Practitioner',
          'Demonstrates proficiency in applied AI/ML concepts, model development, and deployment.',
          'Pass AIML exam with ≥70% score.',
          '["Machine Learning","Python","Neural Networks","Model Deployment","Data Engineering","MLOps"]',
          18, 1, NOW()),
        (3, 1, 'Cybersecurity Fundamentals Certificate',
          'Foundational certification covering network security, threat analysis, and compliance.',
          'Pass CFC exam with ≥72% score.',
          '["Network Security","Threat Analysis","SIEM","Compliance","Incident Response","Cryptography"]',
          12, 1, NOW()),
        (4, 2, 'Cloud Architecture Professional',
          'Advanced certification for cloud architects designing scalable, resilient systems.',
          'Pass CAP exam with ≥78% score and submit architecture case study.',
          '["AWS","Azure","GCP","Kubernetes","Terraform","Cloud Security","Cost Optimization"]',
          24, 1, NOW()),
        (5, 3, 'Healthcare Data Privacy Specialist',
          'Specialized certification for HIPAA compliance and healthcare data governance.',
          'Pass HDPS exam with ≥80% score.',
          '["HIPAA","PHI Management","Data Governance","Healthcare IT","Privacy Law","Audit Readiness"]',
          12, 1, NOW())
    `);

    // ── 4. QUESTION CATEGORIES ──────────────────────────────────────────────
    console.log("📂 Seeding question categories...");
    await conn.execute(`
      INSERT IGNORE INTO question_categories (id, orgId, name, industry, createdAt)
      VALUES
        (1, 1, 'Digital Transformation', 'Professional Development', NOW()),
        (2, 1, 'Artificial Intelligence','Information Technology',   NOW()),
        (3, 1, 'Cybersecurity',          'Information Technology',   NOW()),
        (4, 2, 'Cloud Computing',        'Information Technology',   NOW()),
        (5, 1, 'Data Analytics',         'Professional Development', NOW()),
        (6, 1, 'Project Management',     'Professional Development', NOW()),
        (7, 3, 'Healthcare IT',          'Healthcare',               NOW()),
        (8, 2, 'Software Engineering',   'Information Technology',   NOW())
    `);

    // ── 5. QUESTIONS ────────────────────────────────────────────────────────
    console.log("❓ Seeding questions...");
    const questions = [
      // Digital Transformation (cat 1, org 1)
      [1, 1, 1, 'mcq', 'Which framework is most commonly used for digital transformation roadmaps?',
       '["McKinsey 7S Framework","Kotter\'s 8-Step Model","TOGAF","MIT CISR Framework"]', 'D',
       'The MIT CISR Framework is specifically designed for digital transformation strategy.', 'medium', 0.72, 0.45],
      [1, 1, 1, 'mcq', 'What is the primary driver of failed digital transformation initiatives?',
       '["Technology limitations","Lack of change management","Budget constraints","Regulatory barriers"]', 'B',
       'Studies show 70% of transformations fail due to people and culture issues, not technology.', 'easy', 0.78, 0.38],
      [1, 1, 1, 'true_false', 'Digital transformation is primarily about implementing new technology systems.',
       '["True","False"]', 'B',
       'Digital transformation is fundamentally about cultural and organizational change enabled by technology.', 'easy', 0.82, 0.30],
      // AI/ML (cat 2, org 1)
      [2, 1, 1, 'mcq', 'Which activation function is most commonly used in hidden layers of deep neural networks?',
       '["Sigmoid","Tanh","ReLU","Softmax"]', 'C',
       'ReLU is preferred for hidden layers due to computational efficiency and mitigation of vanishing gradient.', 'medium', 0.68, 0.52],
      [2, 1, 1, 'mcq', 'What does "overfitting" mean in machine learning?',
       '["Model performs well on training data but poorly on new data","Model performs poorly on both","Model is too simple","Model requires too much power"]', 'A',
       'Overfitting occurs when a model memorizes training data including noise, reducing generalization.', 'easy', 0.85, 0.28],
      [2, 1, 1, 'mcq', 'Which technique is used to prevent overfitting in neural networks?',
       '["Increasing learning rate","Adding more layers","Dropout regularization","Removing validation set"]', 'C',
       'Dropout randomly deactivates neurons during training, forcing the network to learn robust features.', 'medium', 0.71, 0.48],
      [2, 1, 1, 'mcq', 'What is the purpose of the softmax function in neural networks?',
       '["Normalize inputs","Convert outputs to probability distribution","Reduce overfitting","Speed up training"]', 'B',
       'Softmax converts raw logits into a probability distribution summing to 1, used in multi-class classification.', 'hard', 0.58, 0.62],
      // Cybersecurity (cat 3, org 1)
      [3, 1, 1, 'mcq', 'What does the CIA triad stand for in cybersecurity?',
       '["Confidentiality, Integrity, Availability","Control, Identity, Authentication","Compliance, Inspection, Audit","Cipher, Integrity, Authorization"]', 'A',
       'The CIA triad is the foundational model for information security policy.', 'easy', 0.88, 0.22],
      [3, 1, 1, 'mcq', 'Which type of attack involves intercepting communication between two parties?',
       '["SQL Injection","Man-in-the-Middle","Phishing","DDoS"]', 'B',
       'MITM attacks intercept and potentially alter communications between two parties without their knowledge.', 'medium', 0.74, 0.44],
      [3, 1, 1, 'mcq', 'What is the purpose of a SIEM system?',
       '["Encrypt data at rest","Aggregate and analyze security events in real-time","Manage user passwords","Scan for malware"]', 'B',
       'SIEM provides real-time analysis of security alerts generated by applications and network hardware.', 'medium', 0.65, 0.55],
      // Cloud Computing (cat 4, org 2)
      [4, 2, 4, 'mcq', 'What is the difference between horizontal and vertical scaling?',
       '["Horizontal adds more servers; vertical upgrades existing server resources","Horizontal upgrades CPU; vertical adds RAM","Both are the same","Horizontal is for databases only"]', 'A',
       'Horizontal scaling adds instances; vertical scaling increases resources on existing instances.', 'medium', 0.70, 0.50],
      [4, 2, 4, 'mcq', 'Which AWS service provides managed Kubernetes?',
       '["EC2","ECS","EKS","Lambda"]', 'C',
       'Amazon EKS (Elastic Kubernetes Service) is the managed Kubernetes service on AWS.', 'medium', 0.66, 0.54],
      // Healthcare IT (cat 7, org 3)
      [7, 3, 7, 'mcq', 'Under HIPAA, what is Protected Health Information (PHI)?',
       '["Any data stored in a hospital","Individually identifiable health information","Anonymized patient records","Medical billing codes only"]', 'B',
       'PHI is any individually identifiable information relating to health status, care, or payment.', 'easy', 0.80, 0.35],
      [7, 3, 7, 'mcq', 'What is the maximum penalty per violation category under HIPAA?',
       '["$10,000","$50,000","$100,000","$1,900,000"]', 'D',
       'The maximum penalty is $1.9M per violation category per year for willful neglect.', 'hard', 0.52, 0.68],
    ];
    for (const [categoryId, orgId, createdBy, type, stem, options, correctAnswer, explanation, difficulty, pValue, pointBiserial] of questions) {
      await conn.execute(`
        INSERT IGNORE INTO questions (orgId, categoryId, createdBy, type, stem, options, correctAnswer, explanation, difficulty, pValue, pointBiserial, status, version, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, NOW(), NOW())
      `, [orgId, categoryId, createdBy, type, stem, options, JSON.stringify(correctAnswer), explanation, difficulty, pValue, pointBiserial]);
    }

    // ── 6. EXAMS ────────────────────────────────────────────────────────────
    console.log("📝 Seeding exams...");
    await conn.execute(`
      INSERT IGNORE INTO exams (id, orgId, createdBy, title, description, industry, passingScore, timeLimit, totalQuestions, randomizeQuestions, adaptiveTesting, proctorType, allowedAttempts, credentialTemplateId, status, createdAt, updatedAt)
      VALUES
        (1, 1, 1, 'Certified Digital Transformation Leader (CDTL)',
          'Comprehensive assessment of digital transformation strategy, leadership, and execution capabilities.',
          'Professional Development', '75', 120, 60, 1, 1, 'ai', 3, 1, 'published', NOW(), NOW()),
        (2, 1, 4, 'AI & Machine Learning Practitioner (AIML)',
          'Validates applied AI/ML knowledge including model development, evaluation, and deployment.',
          'Information Technology', '70', 90, 45, 1, 0, 'ai', 2, 2, 'published', NOW(), NOW()),
        (3, 1, 4, 'Cybersecurity Fundamentals Certificate (CFC)',
          'Foundation-level cybersecurity assessment covering threats, controls, and compliance.',
          'Information Technology', '72', 75, 40, 1, 0, 'virtual_human', 3, 3, 'published', NOW(), NOW()),
        (4, 2, 11, 'Cloud Architecture Professional (CAP)',
          'Advanced assessment for cloud architects designing enterprise-grade cloud solutions.',
          'Information Technology', '78', 150, 75, 1, 1, 'ai', 2, 4, 'published', NOW(), NOW()),
        (5, 3, 2, 'Healthcare Data Privacy Specialist (HDPS)',
          'Specialized HIPAA compliance and healthcare data governance assessment.',
          'Healthcare', '80', 60, 35, 0, 0, 'in_person', 2, 5, 'published', NOW(), NOW()),
        (6, 1, 4, 'Digital Leadership Fundamentals',
          'Entry-level assessment for professionals beginning their digital transformation journey.',
          'Professional Development', '65', 45, 25, 1, 0, 'none', 5, NULL, 'draft', NOW(), NOW())
    `);

    // ── 7. EXAM ATTEMPTS ────────────────────────────────────────────────────
    console.log("🎯 Seeding exam attempts...");
    await conn.execute(`
      INSERT IGNORE INTO exam_attempts (id, examId, candidateId, orgId, status, score, passed, startedAt, completedAt, createdAt)
      VALUES
        (1,  1, 7,  1, 'completed',  '82',  1,    DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
        (2,  2, 7,  1, 'completed',  '76',  1,    DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
        (3,  3, 7,  1, 'completed',  '68',  0,    DATE_SUB(NOW(), INTERVAL 8 DAY),  DATE_SUB(NOW(), INTERVAL 8 DAY),  DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (4,  3, 7,  1, 'completed',  '74',  1,    DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 3 DAY)),
        (5,  1, 8,  1, 'completed',  '91',  1,    DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
        (6,  2, 8,  1, 'in_progress', NULL, NULL, NOW(), NULL, NOW()),
        (7,  4, 9,  2, 'completed',  '85',  1,    DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
        (8,  4, 10, 2, 'completed',  '71',  0,    DATE_SUB(NOW(), INTERVAL 5 DAY),  DATE_SUB(NOW(), INTERVAL 5 DAY),  DATE_SUB(NOW(), INTERVAL 5 DAY)),
        (9,  5, 12, 3, 'completed',  '88',  1,    DATE_SUB(NOW(), INTERVAL 7 DAY),  DATE_SUB(NOW(), INTERVAL 7 DAY),  DATE_SUB(NOW(), INTERVAL 7 DAY)),
        (10, 1, 10, 2, 'scheduled',  NULL,  NULL, DATE_ADD(NOW(), INTERVAL 2 DAY),  NULL, NOW())
    `);

    // ── 8. CREDENTIALS ──────────────────────────────────────────────────────
    console.log("🏅 Seeding credentials...");
    const credRows = [
      [credId(), 1, 7,  1, '82', daysAgo(15), daysFromNow(365*2-15), 'active'],
      [credId(), 1, 7,  2, '76', daysAgo(10), daysFromNow(548-10),   'active'],
      [credId(), 1, 7,  3, '74', daysAgo(3),  daysFromNow(365-3),    'active'],
      [credId(), 1, 8,  1, '91', daysAgo(20), daysFromNow(365*2-20), 'active'],
      [credId(), 2, 9,  4, '85', daysAgo(12), daysFromNow(365*2-12), 'active'],
      [credId(), 3, 12, 5, '88', daysAgo(7),  daysFromNow(365-7),    'active'],
      [credId(), 1, 8,  2, '79', daysAgo(45), daysFromNow(548-45),   'active'],
      ['SDC-2024-EXPIREDX', 1, 7, 1, '95', daysAgo(400), daysAgo(35), 'expired'],
    ];
    for (const [cid, orgId, candidateId, templateId, score, issueDate, expiryDate, status] of credRows) {
      const badgeData = {
        "@context": "https://w3id.org/openbadges/v2",
        type: "Assertion",
        id: `https://sdc.example.com/credentials/${cid}`,
        recipient: { type: "id", identity: `user:${candidateId}` },
        issuedOn: issueDate.toISOString(),
        expires: expiryDate?.toISOString(),
      };
      const sig = hashData(badgeData);
      await conn.execute(`
        INSERT IGNORE INTO credentials (credentialId, orgId, candidateId, templateId, score, issueDate, expiryDate, badgeJson, cryptoSignature, verificationUrl, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [cid, orgId, candidateId, templateId, score, issueDate, expiryDate, JSON.stringify(badgeData), sig, `/verify/${cid}`, status]);
    }

    // ── 9. BOOKS ────────────────────────────────────────────────────────────
    console.log("📚 Seeding books...");
    await conn.execute(`
      INSERT IGNORE INTO books (id, orgId, title, author, description, isbn, price, linkedExamId, drmEnabled, status, coverUrl, createdAt)
      VALUES
        (1, 1, 'Digital Transformation: A Leader''s Playbook',
          'Dr. Sarah Mitchell & James Okonkwo',
          'The definitive guide to leading successful digital transformation initiatives. Covers strategy, culture, technology selection, and change management with real-world case studies.',
          '978-1-4842-9001-1', '49.99', 1, 1, 'published',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', NOW()),
        (2, 1, 'Applied Machine Learning with Python',
          'Dr. Priya Sharma',
          'Hands-on guide to building and deploying ML models. Covers scikit-learn, TensorFlow, PyTorch, and MLOps practices aligned to the AIML certification.',
          '978-1-4842-9002-2', '59.99', 2, 1, 'published',
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&q=80', NOW()),
        (3, 1, 'Cybersecurity Essentials: Threats, Controls & Compliance',
          'Marcus Chen',
          'Comprehensive coverage of cybersecurity fundamentals including network security, cryptography, incident response, and regulatory compliance frameworks.',
          '978-1-4842-9003-3', '44.99', 3, 1, 'published',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&q=80', NOW()),
        (4, 2, 'Cloud Architecture Patterns & Best Practices',
          'Elena Volkov',
          'Advanced reference for cloud architects covering multi-cloud strategies, serverless architectures, Kubernetes orchestration, and cost optimization techniques.',
          '978-1-4842-9004-4', '69.99', 4, 1, 'published',
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80', NOW()),
        (5, 3, 'HIPAA Compliance & Healthcare Data Privacy',
          'Amelia Rodriguez',
          'Essential guide for healthcare IT professionals covering HIPAA regulations, PHI management, breach notification, and building a culture of compliance.',
          '978-1-4842-9005-5', '54.99', 5, 1, 'published',
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&q=80', NOW()),
        (6, 1, 'Data Analytics for Business Leaders',
          'Dr. Priya Sharma',
          'Non-technical guide to leveraging data analytics for strategic decision-making. Covers BI tools, KPI frameworks, and building data-driven organizational culture.',
          '978-1-4842-9006-6', '39.99', NULL, 0, 'published',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=80', NOW())
    `);

    // ── 10. BOOK ACCESS ─────────────────────────────────────────────────────
    console.log("📖 Seeding book access...");
    const bookAccessRows = [
      [1, 7,  'purchased'],
      [2, 7,  'purchased'],
      [3, 7,  'voucher'],
      [1, 8,  'purchased'],
      [2, 8,  'subscription'],
      [4, 9,  'purchased'],
      [5, 12, 'purchased'],
      [6, 7,  'purchased'],
      [6, 8,  'subscription'],
      [3, 9,  'voucher'],
    ];
    for (const [bookId, userId, accessType] of bookAccessRows) {
      await conn.execute(`
        INSERT IGNORE INTO book_access (bookId, userId, accessType, purchasedAt)
        VALUES (?, ?, ?, NOW())
      `, [bookId, userId, accessType]);
    }

    // ── 11. VOUCHERS ────────────────────────────────────────────────────────
    console.log("🎟️  Seeding vouchers...");
    const voucherData = [
      [1, 'SDC-EXAM-CDTL-2026A', 'exam',   1,    null, 'active',   null, null],
      [1, 'SDC-EXAM-CDTL-2026B', 'exam',   1,    null, 'active',   null, null],
      [1, 'SDC-EXAM-AIML-2026A', 'exam',   2,    null, 'active',   null, null],
      [1, 'SDC-EXAM-AIML-2026B', 'exam',   2,    null, 'redeemed', 7,    daysAgo(10)],
      [1, 'SDC-BOOK-DT-2026A',   'book',   null, 1,    'active',   null, null],
      [1, 'SDC-BOOK-DT-2026B',   'book',   null, 1,    'redeemed', 8,    daysAgo(5)],
      [1, 'SDC-BNDL-AIML-2026A', 'bundle', 2,    2,    'active',   null, null],
      [1, 'SDC-BNDL-AIML-2026B', 'bundle', 2,    2,    'active',   null, null],
      [2, 'SDC-EXAM-CAP-2026A',  'exam',   4,    null, 'active',   null, null],
      [2, 'SDC-EXAM-CAP-2026B',  'exam',   4,    null, 'redeemed', 9,    daysAgo(12)],
      [3, 'SDC-EXAM-HDPS-2026A', 'exam',   5,    null, 'active',   null, null],
      [3, 'SDC-BOOK-HIPAA-2026A','book',   null, 5,    'redeemed', 12,   daysAgo(7)],
      [1, 'SDC-EXAM-CFC-2026A',  'exam',   3,    null, 'active',   null, null],
      [1, 'SDC-EXAM-CFC-2026B',  'exam',   3,    null, 'expired',  null, null],
      [1, 'SDC-BNDL-CFC-2026A',  'bundle', 3,    3,    'active',   null, null],
    ];
    for (const [orgId, code, type, examId, bookId, status, redeemedBy, redeemedAt] of voucherData) {
      const expiresAt = status === 'expired' ? daysAgo(5) : daysFromNow(90);
      await conn.execute(`
        INSERT IGNORE INTO vouchers (orgId, code, type, examId, bookId, status, expiresAt, redeemedBy, redeemedAt, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
      `, [orgId, code, type, examId, bookId, status, expiresAt, redeemedBy, redeemedAt]);
    }

    // ── 12. CREDIT BALANCES ─────────────────────────────────────────────────
    console.log("💰 Seeding credit balances...");
    await conn.execute(`
      INSERT INTO credit_balances (orgId, balance, updatedAt)
      VALUES (1, '12450.0000', NOW()), (2, '5200.0000', NOW()), (3, '1800.0000', NOW())
      ON DUPLICATE KEY UPDATE balance = VALUES(balance), updatedAt = NOW()
    `);

    // ── 13. LEDGER ENTRIES ──────────────────────────────────────────────────
    console.log("📒 Seeding ledger entries...");
    const ledgerRows = [
      [1, 2, 'credit_purchase',    '5000.0000', 'USD', '0.0000',      '5000.0000',  'Initial credit package — Enterprise Starter'],
      [1, 2, 'exam_redemption',   '-49.9900',   'USD', '5000.0000',   '4950.0100',  'CDTL Exam fee — Liam Thompson'],
      [1, 2, 'exam_redemption',   '-49.9900',   'USD', '4950.0100',   '4900.0200',  'AIML Exam fee — Liam Thompson'],
      [1, 2, 'book_purchase',     '-49.9900',   'USD', '4900.0200',   '4850.0300',  'Book: Digital Transformation Playbook'],
      [1, 2, 'credit_purchase',   '5000.0000',  'USD', '4850.0300',   '9850.0300',  'Top-up credit package — Q1 2026'],
      [1, 2, 'subscription',      '-9.9900',    'USD', '9850.0300',   '9840.0400',  'Credential issuance fee — CDTL'],
      [1, 2, 'voucher_generation', '0.0000',    'USD', '9840.0400',   '9840.0400',  'Voucher SDC-EXAM-AIML-2026B redeemed'],
      [1, 2, 'exam_redemption',   '-49.9900',   'USD', '9840.0400',   '9790.0500',  'CFC Exam fee — Fatima Al-Hassan'],
      [1, 2, 'credit_purchase',   '3000.0000',  'USD', '9790.0500',   '12790.0500', 'Top-up credit package — Q2 2026'],
      [1, 2, 'exam_redemption',   '-49.9900',   'USD', '12790.0500',  '12740.0600', 'CDTL Exam fee — Fatima Al-Hassan'],
      [1, 2, 'refund',             '49.9900',   'USD', '12740.0600',  '12790.0500', 'Refund: duplicate charge — Isabella Nguyen'],
      [1, 2, 'subscription',      '-9.9900',    'USD', '12790.0500',  '12780.0600', 'Credential issuance fee — AIML'],
      [2, 11,'credit_purchase',   '3000.0000',  'USD', '0.0000',      '3000.0000',  'Initial credit package — TechCert'],
      [2, 11,'exam_redemption',   '-79.9900',   'USD', '3000.0000',   '2920.0100',  'CAP Exam fee — Noah Patel'],
      [2, 11,'subscription',      '-9.9900',    'USD', '2920.0100',   '2910.0200',  'Credential issuance fee — CAP'],
      [2, 11,'credit_purchase',   '2500.0000',  'USD', '2910.0200',   '5410.0200',  'Top-up credit package'],
      [3, 2, 'credit_purchase',   '2000.0000',  'USD', '0.0000',      '2000.0000',  'Initial credit package — HealthPro'],
      [3, 2, 'exam_redemption',   '-59.9900',   'USD', '2000.0000',   '1940.0100',  'HDPS Exam fee — Kwame Asante'],
      [3, 2, 'subscription',      '-9.9900',    'USD', '1940.0100',   '1930.0200',  'Credential issuance fee — HDPS'],
    ];
    let prevHash = "GENESIS";
    for (const [orgId, userId, type, amount, currency, balBefore, balAfter, desc] of ledgerRows) {
      const entryData = { orgId, userId, type, amount, ts: Date.now() + Math.random() };
      const cryptoHash = hashData(entryData, prevHash);
      await conn.execute(`
        INSERT INTO ledger_entries (orgId, userId, type, amount, currency, balanceBefore, balanceAfter, description, cryptoHash, prevHash, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [orgId, userId, type, amount, currency, balBefore, balAfter, desc, cryptoHash, prevHash]);
      prevHash = cryptoHash;
    }

    // ── 14. PROCTORING SESSIONS ─────────────────────────────────────────────
    console.log("👁️  Seeding proctoring sessions...");
    await conn.execute(`
      INSERT IGNORE INTO proctor_sessions (id, examAttemptId, candidateId, proctorId, type, status, startedAt, endedAt, createdAt)
      VALUES
        (1, 1, 7,  6, 'ai',           'completed', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
        (2, 2, 7,  6, 'ai',           'completed', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
        (3, 3, 7,  6, 'virtual_human','completed', DATE_SUB(NOW(), INTERVAL 8 DAY),  DATE_SUB(NOW(), INTERVAL 8 DAY),  DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (4, 4, 7,  6, 'virtual_human','completed', DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 3 DAY)),
        (5, 5, 8,  6, 'ai',           'completed', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
        (6, 6, 8,  6, 'ai',           'active',    NOW(), NULL, NOW()),
        (7, 7, 9,  NULL, 'ai',         'completed', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
        (8, 9, 12, NULL, 'in_person',  'completed', DATE_SUB(NOW(), INTERVAL 7 DAY),  DATE_SUB(NOW(), INTERVAL 7 DAY),  DATE_SUB(NOW(), INTERVAL 7 DAY))
    `);

    // ── 15. PROCTORING INCIDENTS ────────────────────────────────────────────
    console.log("⚠️  Seeding proctoring incidents...");
    await conn.execute(`
      INSERT IGNORE INTO proctor_incidents (sessionId, type, severity, description, timestamp)
      VALUES
        (3, 'gaze_deviation',  'medium',   'Candidate looked away from screen for 8 seconds',                    DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (3, 'audio_anomaly',   'high',     'Background voice detected — possible external assistance',           DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (3, 'tab_switch',      'medium',   'Browser tab switch detected — 2 occurrences in 5 minutes',          DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (3, 'face_detection',  'critical', 'Second face detected in frame — possible impersonation',            DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (4, 'gaze_deviation',  'low',      'Brief gaze deviation — 3 seconds, within acceptable threshold',     DATE_SUB(NOW(), INTERVAL 3 DAY)),
        (6, 'phone_detected',  'high',     'Mobile device detected in camera frame',                            NOW()),
        (6, 'gaze_deviation',  'medium',   'Candidate looking down repeatedly — possible notes',                NOW()),
        (1, 'tab_switch',      'low',      'Single tab switch — candidate returned within 2 seconds',           DATE_SUB(NOW(), INTERVAL 15 DAY))
    `);

    // ── 16. NOTIFICATIONS ───────────────────────────────────────────────────
    console.log("🔔 Seeding notifications...");
    await conn.execute(`
      INSERT IGNORE INTO notifications (userId, orgId, type, title, message, \`read\`, createdAt)
      VALUES
        (7,  1, 'credential_issued',  'Credential Issued',                    'Your CDTL credential has been issued successfully.',                                            0, DATE_SUB(NOW(), INTERVAL 15 DAY)),
        (7,  1, 'credential_issued',  'Credential Issued',                    'Your AIML credential has been issued successfully.',                                            0, DATE_SUB(NOW(), INTERVAL 10 DAY)),
        (7,  1, 'exam_result',        'Exam Result: CFC — Not Passed',        'You scored 68% on the CFC exam. Minimum passing score is 72%. You have 2 attempts remaining.', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (7,  1, 'exam_result',        'Exam Result: CFC — Passed!',           'Congratulations! You scored 74% on the CFC exam and have earned your certificate.',            0, DATE_SUB(NOW(), INTERVAL 3 DAY)),
        (7,  1, 'credential_expiry',  'Credential Expired',                   'Your CDTL-2024 credential expired 35 days ago. Renew to maintain your certification status.',  0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
        (8,  1, 'credential_issued',  'Credential Issued',                    'Your CDTL credential (score: 91%) has been issued. View in your wallet.',                      0, DATE_SUB(NOW(), INTERVAL 20 DAY)),
        (8,  1, 'exam_scheduled',     'Exam Session Active: AIML',            'Your AIML exam session is now active. Good luck!',                                             0, NOW()),
        (9,  2, 'credential_issued',  'Credential Issued',                    'Your Cloud Architecture Professional credential has been issued.',                             0, DATE_SUB(NOW(), INTERVAL 12 DAY)),
        (12, 3, 'credential_issued',  'Credential Issued',                    'Your Healthcare Data Privacy Specialist credential has been issued.',                         0, DATE_SUB(NOW(), INTERVAL 7 DAY)),
        (2,  1, 'system_alert',       'Proctoring Incident — High Severity',  'A high-severity proctoring incident was flagged for candidate Liam Thompson (Attempt #3).',   0, DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (2,  1, 'system_alert',       'Proctoring Incident — Critical',       'Critical: Second face detected during CFC exam. Liam Thompson. Review required.',             0, DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (6,  1, 'proctor_alert',      'Active Session Alert',                 'High-risk activity detected in Fatima Al-Hassan current exam session. Risk score: 22.',       0, NOW()),
        (1,  NULL,'platform_update',  'Platform Update v2.1',                 'New: Enhanced AI proctoring, improved psychometric reports, and API rate limiting.',           1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
        (3,  1, 'ai_analysis',        'AI Analysis Complete',                 'Psychometric analysis complete for CDTL exam. 3 questions flagged for review.',               0, DATE_SUB(NOW(), INTERVAL 5 DAY))
    `);

    // ── 17. API KEYS ────────────────────────────────────────────────────────
    console.log("🔑 Seeding API keys...");
    await conn.execute(`
      INSERT IGNORE INTO api_keys (id, orgId, name, keyHash, keyPrefix, rateLimit, status, lastUsedAt, createdAt)
      VALUES
        (1, 1, 'Production API Key',     'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', 'sdc_live_PRD1', 10000, 'active',  DATE_SUB(NOW(), INTERVAL 1 DAY),  DATE_SUB(NOW(), INTERVAL 60 DAY)),
        (2, 1, 'Development API Key',    'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a', 'sdc_live_DEV1', 1000,  'active',  DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 30 DAY)),
        (3, 1, 'Staging API Key',        'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2', 'sdc_live_STG1', 5000,  'active',  DATE_SUB(NOW(), INTERVAL 7 DAY),  DATE_SUB(NOW(), INTERVAL 14 DAY)),
        (4, 2, 'TechCert Production',    'd4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2c3', 'sdc_live_TC01', 5000,  'active',  DATE_SUB(NOW(), INTERVAL 2 DAY),  DATE_SUB(NOW(), INTERVAL 45 DAY)),
        (5, 1, 'Legacy Integration Key', 'e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2c3d4', 'sdc_live_LEG1', 500,   'revoked', NULL,                             DATE_SUB(NOW(), INTERVAL 90 DAY))
    `);

    // ── 18. SUBSCRIPTIONS ───────────────────────────────────────────────────
    console.log("📋 Seeding subscriptions...");
    await conn.execute(`
      INSERT IGNORE INTO subscriptions (id, orgId, plan, status, currentPeriodStart, currentPeriodEnd, createdAt)
      VALUES
        (1, 1, 'enterprise',   'active', DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_ADD(NOW(), INTERVAL 275 DAY), NOW()),
        (2, 2, 'professional', 'active', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 320 DAY), NOW()),
        (3, 3, 'starter',      'active', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 335 DAY), NOW())
    `);

    // ── 19. AUDIT LOGS ──────────────────────────────────────────────────────
    console.log("📜 Seeding audit logs...");
    await conn.execute(`
      INSERT IGNORE INTO audit_logs (orgId, userId, action, resource, resourceId, ipAddress, userAgent, createdAt)
      VALUES
        (1, 2, 'credential.issue',  'credential', 'SDC-2026-DEMO01', '192.168.1.100', 'Mozilla/5.0 Chrome/120',  DATE_SUB(NOW(), INTERVAL 15 DAY)),
        (1, 2, 'credential.issue',  'credential', 'SDC-2026-DEMO02', '192.168.1.100', 'Mozilla/5.0 Chrome/120',  DATE_SUB(NOW(), INTERVAL 10 DAY)),
        (1, 7, 'exam.start',        'exam',       '1',               '10.0.0.45',     'Mozilla/5.0 Firefox/121', DATE_SUB(NOW(), INTERVAL 15 DAY)),
        (1, 7, 'exam.submit',       'exam',       '1',               '10.0.0.45',     'Mozilla/5.0 Firefox/121', DATE_SUB(NOW(), INTERVAL 15 DAY)),
        (1, 7, 'book.access',       'book',       '1',               '10.0.0.45',     'Mozilla/5.0 Firefox/121', DATE_SUB(NOW(), INTERVAL 14 DAY)),
        (1, 4, 'question.create',   'question',   '1',               '192.168.1.105', 'Mozilla/5.0 Chrome/120',  DATE_SUB(NOW(), INTERVAL 30 DAY)),
        (1, 3, 'exam.publish',      'exam',       '1',               '192.168.1.103', 'Mozilla/5.0 Chrome/120',  DATE_SUB(NOW(), INTERVAL 25 DAY)),
        (1, 6, 'proctor.flag',      'incident',   '4',               '192.168.1.106', 'Mozilla/5.0 Chrome/120',  DATE_SUB(NOW(), INTERVAL 8 DAY)),
        (2, 11,'voucher.generate',  'voucher',    'batch-001',       '10.1.0.22',     'Mozilla/5.0 Safari/17',   DATE_SUB(NOW(), INTERVAL 20 DAY)),
        (1, 2, 'apikey.create',     'api_key',    '1',               '192.168.1.100', 'Mozilla/5.0 Chrome/120',  DATE_SUB(NOW(), INTERVAL 60 DAY)),
        (1, 1, 'user.role_update',  'user',       '2',               '10.0.0.1',      'Mozilla/5.0 Chrome/120',  DATE_SUB(NOW(), INTERVAL 90 DAY)),
        (3, 2, 'credential.issue',  'credential', 'SDC-2026-DEMO06', '172.16.0.50',   'Mozilla/5.0 Edge/120',    DATE_SUB(NOW(), INTERVAL 7 DAY))
    `);

    console.log("\n✅ Seed complete! Summary:");
    console.log("   🏢 3 organizations (SDC Global, TechCert Academy, HealthPro)");
    console.log("   👥 12 users across 7 roles");
    console.log("   🎖️  5 credential templates");
    console.log("   📂 8 question categories");
    console.log("   ❓ 14 questions");
    console.log("   📝 6 exams (5 published, 1 draft)");
    console.log("   🎯 10 exam attempts");
    console.log("   🏅 8 credentials (7 active, 1 expired)");
    console.log("   📚 6 books + 10 access records");
    console.log("   🎟️  15 vouchers");
    console.log("   💰 Credit balances: $12,450 / $5,200 / $1,800");
    console.log("   📒 19 immutable ledger entries");
    console.log("   👁️  8 proctoring sessions + 8 incidents");
    console.log("   🔔 14 notifications");
    console.log("   🔑 5 API keys");
    console.log("   📋 3 subscriptions");
    console.log("   📜 12 audit log entries\n");

  } catch (err) {
    console.error("❌ Seed error:", err.message);
    throw err;
  } finally {
    await conn.end();
  }
}

seed().catch(console.error);
