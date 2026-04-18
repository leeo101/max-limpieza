import db from '../lib/db';

async function checkUser() {
  try {
    const email = 'enzorodriguez31@gmail.com';
    console.log(`Checking user: ${email}...`);
    const users = await db`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      console.log('User not found.');
    } else {
      const user = users[0];
      console.log('User found:');
      console.log({
        id: user.id,
        email: user.email,
        role: user.role,
        active: user.active,
        email_verified: user.email_verified
      });
      console.log('Password hash exists:', !!user.password);
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    process.exit();
  }
}

checkUser();
