import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }
    
    const result = await authenticateUser(email, password);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }
    
    // Set secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('userToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 1 week
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        user: result.user, 
        token: result.token // Keep sending for compatibility
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
