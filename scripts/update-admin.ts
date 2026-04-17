import { config } from 'dotenv';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
config();

const sql = postgres(process.env.DATABASE_URL as string, {
  ssl: 'require',
});

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

async function main() {
  try {
    console.log('Testing connection...');
    const result = await sql`SELECT 1 as test`;
    console.log('Connection OK:', result);
    
    console.log('Creando nuevo admin...');
    const id = uuidv4();
    const hashedPassword = hashPassword('EnzoRodriguez10');
    // Upsert or just insert
    await sql`
      INSERT INTO users (id, email, password, role, name, active) 
      VALUES (${id}, 'enzorodriguez31@gmail.com', ${hashedPassword}, 'admin', 'Administrador', 1)
      ON CONFLICT (email) DO UPDATE SET password = ${hashedPassword}
    `;
    console.log('Nuevo admin creado con exito.');

    console.log('Eliminando admin anterior...');
    await sql`DELETE FROM users WHERE email = 'admin@maxlimpieza.com'`;
    console.log('Admin anterior eliminado con exito.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
