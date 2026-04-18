import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

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

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
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
