import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Check all users
const [users] = await conn.query('SELECT id, name, email, role, passwordHash FROM users');
console.log('\n=== ALL USERS ===');
for (const u of users) {
  console.log(`  [${u.id}] ${u.name} | ${u.email} | ${u.role} | hasPassword: ${!!u.passwordHash}`);
}

// Fix users without passwords
const hash = await bcrypt.hash('Demo1234!', 12);
const [noPass] = await conn.query('SELECT id, email FROM users WHERE passwordHash IS NULL');
if (noPass.length > 0) {
  console.log(`\nFixing ${noPass.length} users without passwords...`);
  await conn.query('UPDATE users SET passwordHash = ? WHERE passwordHash IS NULL', [hash]);
  console.log('Done!');
} else {
  console.log('\nAll users already have passwords!');
}

// Also ensure the super admin exists
const [existing] = await conn.query("SELECT id FROM users WHERE email = 'sarah.mitchell@sdc.global'");
if (existing.length === 0) {
  console.log('\nCreating super admin user...');
  await conn.query(
    "INSERT INTO users (name, email, passwordHash, loginMethod, role, orgId, status, lastSignedIn) VALUES (?, ?, ?, 'email', 'super_admin', 1, 'active', NOW())",
    ['Sarah Mitchell', 'sarah.mitchell@sdc.global', hash]
  );
  console.log('Super admin created!');
} else {
  // Ensure super admin has correct role
  await conn.query("UPDATE users SET role = 'super_admin', passwordHash = ? WHERE email = 'sarah.mitchell@sdc.global'", [hash]);
  console.log('\nSuper admin password updated!');
}

// Verify all demo accounts
const demoEmails = [
  'sarah.mitchell@sdc.global',
  'james.okonkwo@sdcglobal.com',
  'liam.t@example.com',
  'david.kim@sdcglobal.com',
  'priya.sharma@sdcglobal.com',
  'marcus.chen@sdcglobal.com',
];

console.log('\n=== DEMO ACCOUNT STATUS ===');
for (const email of demoEmails) {
  const [rows] = await conn.query('SELECT id, name, email, role, passwordHash FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    const u = rows[0];
    console.log(`  ✓ ${u.email} | ${u.role} | hasPassword: ${!!u.passwordHash}`);
  } else {
    console.log(`  ✗ MISSING: ${email}`);
  }
}

await conn.end();
console.log('\nDone!');
