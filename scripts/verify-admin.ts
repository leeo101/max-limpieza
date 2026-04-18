import { config } from 'dotenv';
import postgres from 'postgres';

config(); // Load .env

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env!');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function verifyAdmin() {
  try {
    console.log('🔌 Connecting to database...');
    await sql`SELECT 1 as test`;
    console.log('✅ Connection OK\n');

    const email = 'enzorodriguez31@gmail.com';
    console.log(`🔍 Checking user: ${email}...`);

    const users = await sql`SELECT id, email, role, active, name FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      console.log('❌ User NOT FOUND in database!');
      console.log('   You need to run the update-admin script first.');
    } else {
      const user = users[0];
      console.log('✅ User found:');
      console.log(`   ID:     ${user.id}`);
      console.log(`   Email:  ${user.email}`);
      console.log(`   Name:   ${user.name}`);
      console.log(`   Role:   ${user.role}  ${user.role === 'admin' ? '✅ CORRECT' : '❌ WRONG - must be "admin"'}`);
      console.log(`   Active: ${user.active}  ${user.active === 1 ? '✅ Active' : '❌ Inactive - must be 1'}`);
      
      if (user.role !== 'admin') {
        console.log('\n⚠️  FIXING: Updating role to admin...');
        await sql`UPDATE users SET role = 'admin', active = 1 WHERE email = ${email}`;
        console.log('✅ Role updated to admin successfully!');
      }

      if (user.active !== 1) {
        console.log('\n⚠️  FIXING: Activating user...');
        await sql`UPDATE users SET active = 1 WHERE email = ${email}`;
        console.log('✅ User activated successfully!');
      }
    }

    // Also show all users with admin role
    console.log('\n📋 All users with role=admin:');
    const admins = await sql`SELECT id, email, name, role, active FROM users WHERE role = 'admin'`;
    if (admins.length === 0) {
      console.log('   ❌ NO admin users found!');
    } else {
      admins.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.email} (active: ${a.active})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

verifyAdmin();
