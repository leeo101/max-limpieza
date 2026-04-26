import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const result = await authenticateUser(email, password);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // STRICT ADMIN CHECK: Only users with role='admin' can access the admin panel
    if (result.user.role !== 'admin') {
      console.warn(`[Admin Login] Access denied: ${email} has role '${result.user.role}', not 'admin'`);
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Esta área es exclusiva para administradores.' },
        { status: 403 }
      );
    }

    // Set secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('adminToken', result.token, {
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
        token: result.token, // Keep sending for compatibility for now
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
