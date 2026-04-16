import { config } from 'dotenv';
config({ path: '.env' });

async function main() {
  console.log('Connecting to Supabase (PostgreSQL)...');
  try {
    const { initializeDatabase } = await import('../lib/db');
    await initializeDatabase();
    console.log('Successfully initialized database tables and sample data!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit();
}

main();
