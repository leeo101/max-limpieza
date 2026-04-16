import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from './email';

const JWT_SECRET = process.env.JWT_SECRET || 'max-limpieza-secret-key-2024-change-in-production';

export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  email_verified?: number;
  active?: number;
  created_at: string;
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
  created_at: string;
  updated_at?: string;
}

export function authenticateUser(email: string, password: string): { token: string; user: UserWithoutPassword } | null {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | null;

  if (!user) return null;
  if (!user.active) return null; // Don't allow inactive users to login

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) return null;

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _password, ...userWithoutPassword } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
  return { token, user: userWithoutPassword };
}

export function registerCustomer(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}): { token: string; user: UserWithoutPassword } | null {
  // Check if user already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
  if (existingUser) return null;

  const id = uuidv4();
  const verificationToken = uuidv4();
  const hashedPassword = hashPassword(data.password);

  try {
      db.prepare(`
        INSERT INTO users (id, email, password, role, name, phone, address, city, postal_code, active, verification_token)
        VALUES (?, ?, ?, 'customer', ?, ?, ?, ?, ?, 1, ?)
      `).run(id, data.email, hashedPassword, data.name, data.phone || null, data.address || null, data.city || null, data.postal_code || null, verificationToken);

      // Get the newly created user
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | null;
      if (!user) return null;

      // Send emails (async, non-blocking)
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

export function createPasswordResetToken(userId: string): string | null {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

  try {
    // Delete any existing reset tokens for this user
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(userId);

    // Create new token
    db.prepare('INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), userId, token, expiresAt);

    // Get user email and send reset email
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as { email: string } | null;
    if (user) {
      sendPasswordResetEmail(user.email, token).catch(console.error);
    }

    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    return null;
  }
}

export function verifyPasswordResetToken(token: string): { userId: string } | null {
  const reset = db.prepare(`
    SELECT user_id, expires_at FROM password_resets 
    WHERE token = ? AND expires_at > datetime('now')
  `).get(token) as { user_id: string; expires_at: string } | null;

  if (!reset) return null;

  return { userId: reset.user_id };
}

export function resetPassword(userId: string, newPassword: string): boolean {
  const hashedPassword = hashPassword(newPassword);

  try {
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, userId);

    // Delete used reset token
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(userId);

    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}

export function updateUserProfile(userId: string, data: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}): boolean {
  try {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      values.push(data.address);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }
    if (data.postal_code !== undefined) {
      updates.push('postal_code = ?');
      values.push(data.postal_code);
    }

    if (updates.length === 0) return false;

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function createUser(email: string, password: string, role = 'admin'): string {
  const id = uuidv4();
  const hashedPassword = hashPassword(password);

  const stmt = db.prepare('INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)');
  stmt.run(id, email, hashedPassword, role);
  return id;
}
