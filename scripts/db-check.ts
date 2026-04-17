import 'dotenv/config';
import sql from '../lib/db';

async function checkSchema() {
  console.log('--- Checking USERS table ---');
  try {
    const users = await sql`SELECT * FROM users LIMIT 1`;
    if (users.length > 0) {
      console.log('Columns found:', Object.keys(users[0]).join(', '));
      console.log('Sample user:', JSON.stringify(users[0], null, 2));
    } else {
      console.log('No users found.');
    }
  } catch (err: any) {
    console.error('Error checking users:', err.message);
  }

  console.log('\n--- Checking ORDERS table ---');
  try {
    const orders = await sql`SELECT * FROM orders LIMIT 1`;
    if (orders.length > 0) {
      console.log('Columns found:', Object.keys(orders[0]).join(', '));
    } else {
      console.log('No orders found.');
    }
  } catch (err: any) {
    console.error('Error checking orders:', err.message);
  }

  process.exit(0);
}

checkSchema();
