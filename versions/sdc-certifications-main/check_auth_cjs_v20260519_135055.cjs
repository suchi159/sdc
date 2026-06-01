const mysql2 = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  console.log('DB URL found:', !!dbUrl);

  const conn = await mysql2.createConnection(dbUrl);
  const [rows] = await conn.execute(
    'SELECT id, name, email, role, passwordHash, status FROM users WHERE email IN (?, ?, ?, ?, ?, ?)',
    ['sarah.mitchell@sdc.global','james.okonkwo@sdcglobal.com','liam.t@example.com','david.kim@sdcglobal.com','priya.sharma@sdcglobal.com','marcus.chen@sdcglobal.com']
  );

  console.log('Found', rows.length, 'demo users:');
  for (const user of rows) {
    const hasHash = !!(user.passwordHash);
    let valid1 = false, valid2 = false;
    if (hasHash) {
      valid1 = await bcrypt.compare('Demo1234!', user.passwordHash);
      valid2 = await bcrypt.compare('demo1234', user.passwordHash);
    }
    console.log(user.email + ' (' + user.role + '): hasHash=' + hasHash + ' Demo1234!=' + valid1 + ' demo1234=' + valid2 + ' status=' + user.status);
  }
  await conn.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
