import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from './email';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing. Authentication will fail.');
}

if (JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
  console.warn('SECURITY WARNING: JWT_SECRET is too short (< 32 chars). Consider using a stronger key.');
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  email_verified?: number;
  active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  email_verified?: number;
  active?: number;
  created_at?: string;
  updated_at?: string;
}

export async function authenticateUser(email: string, password: string): Promise<{ token: string; user: UserWithoutPassword } | null> {
  const users = await db<User[]>`SELECT * FROM users WHERE email = ${email}`;
  const user = users[0];

  if (!user) return null;
  if (!user.active) return null;

  const isValidPassword = bcrypt.compareSync(password, user.password as string);
  if (!isValidPassword) return null;

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _password, ...userWithoutPassword } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
  return { token, user: userWithoutPassword };
}

export async function registerCustomer(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}): Promise<{ token: string; user: UserWithoutPassword } | null> {
  const existing = await db`SELECT id FROM users WHERE email = ${data.email}`;
  if (existing.length > 0) return null;

  const id = uuidv4();
  const verificationToken = uuidv4();
  const hashedPassword = hashPassword(data.password);

  try {
    await db`
      INSERT INTO users (id, email, password, role, name, phone, address, city, postal_code, active, verification_token)
      VALUES (${id}, ${data.email}, ${hashedPassword}, 'customer', ${data.name}, ${data.phone || null}, ${data.address || null}, ${data.city || null}, ${data.postal_code || null}, 1, ${verificationToken})
    `;

    const newUser = await db<User[]>`SELECT * FROM users WHERE id = ${id}`;
    const user = newUser[0];
    if (!user) return null;

    sendWelcomeEmail({ name: data.name, email: data.email }).catch(console.error);
    sendVerificationEmail(data.email, verificationToken).catch(console.error);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _password, ...userWithoutPassword } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return { token, user: userWithoutPassword };
  } catch (error) {
    console.error('Error registering customer:', error);
    return null;
  }
}

export async function createPasswordResetToken(userId: string): Promise<string | null> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000).toISOString();

  try {
    await db`DELETE FROM password_resets WHERE user_id = ${userId}`;
    await db`INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (${uuidv4()}, ${userId}, ${token}, ${expiresAt})`;

    const users = await db`SELECT email FROM users WHERE id = ${userId}`;
    if (users[0]) {
      sendPasswordResetEmail(users[0].email, token).catch(console.error);
    }
    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    return null;
  }
}

export async function verifyPasswordResetToken(token: string): Promise<{ userId: string } | null> {
  const resets = await db`
    SELECT user_id, expires_at FROM password_resets 
    WHERE token = ${token} AND expires_at > CURRENT_TIMESTAMP
  `;
  if (!resets[0]) return null;
  return { userId: resets[0].user_id };
}

export async function resetPassword(userId: string, newPassword: string): Promise<boolean> {
  const hashedPassword = hashPassword(newPassword);

  try {
    await db`UPDATE users SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;
    await db`DELETE FROM password_resets WHERE user_id = ${userId}`;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}

export async function updateUserProfile(userId: string, data: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}): Promise<boolean> {
  try {
    const dataObj = data as Record<string, unknown>;
    const keys = Object.keys(data).filter(k => dataObj[k] !== undefined);
    if (keys.length === 0) return false;

    // Build dynamic update
    for (const key of keys) {
      if (key === 'name') await db`UPDATE users SET name = ${data.name || null} WHERE id = ${userId}`;
      if (key === 'phone') await db`UPDATE users SET phone = ${data.phone || null} WHERE id = ${userId}`;
      if (key === 'address') await db`UPDATE users SET address = ${data.address || null} WHERE id = ${userId}`;
      if (key === 'city') await db`UPDATE users SET city = ${data.city || null} WHERE id = ${userId}`;
      if (key === 'postal_code') await db`UPDATE users SET postal_code = ${data.postal_code || null} WHERE id = ${userId}`;
    }
    await db`UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('[Auth] Token expired');
    } else {
      console.error('[Auth] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    return null;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function createUser(email: string, password: string, role = 'admin'): Promise<string> {
  const id = uuidv4();
  const hashedPassword = hashPassword(password);
  await db`INSERT INTO users (id, email, password, role) VALUES (${id}, ${email}, ${hashedPassword}, ${role})`;
  return id;
}
