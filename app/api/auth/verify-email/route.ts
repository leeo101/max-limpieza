import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/iniciar-sesion?error=missing_token', request.url));
  }

  try {
    // Find user with this token
    const user = db.prepare('SELECT id FROM users WHERE verification_token = ?').get(token) as { id: string } | null;

    if (!user) {
      return NextResponse.redirect(new URL('/iniciar-sesion?error=invalid_token', request.url));
    }

    // Mark as verified and clear token
    db.prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?').run(user.id);

    return NextResponse.redirect(new URL('/iniciar-sesion?success=verified', request.url));
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.redirect(new URL('/iniciar-sesion?error=verification_failed', request.url));
  }
}
