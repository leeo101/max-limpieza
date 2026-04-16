import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken, resetPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verify the reset token
    const tokenData = await verifyPasswordResetToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Reset password
    const success = await resetPassword(tokenData.userId, password);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al restablecer la contraseña' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (error) {
    console.error('Error in reset password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
