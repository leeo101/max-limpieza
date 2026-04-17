import { config } from 'dotenv';
config({ path: '.env' });

async function main() {
  console.log('Running migration: Adding shipping columns to orders table...');
  try {
    const { default: sql } = await import('../lib/db');
    
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS province TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS postal_code TEXT,
      ADD COLUMN IF NOT EXISTS shipping_company TEXT,
      ADD COLUMN IF NOT EXISTS shipping_cost REAL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tracking_number TEXT;
    `;
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit();
}

main();
