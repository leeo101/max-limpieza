import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createPasswordResetToken } from '@/lib/auth';
import { sendEmail, getPasswordResetTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await db`SELECT id, email, name FROM users WHERE email = ${email}`;
    const user = users[0];

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña',
      });
    }

    // Create reset token
    const token = await createPasswordResetToken(user.id);

    if (!token) {
      return NextResponse.json(
        { error: 'Error al generar el token de recuperación' },
        { status: 500 }
      );
    }

    // Send email with reset link
    const emailHtml = getPasswordResetTemplate(token);
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Restablecer Contraseña - MAX Limpieza',
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
    }

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/restablecer-contraseña?token=${token}`;
    
    console.log('Password reset link for', user.email, ':', resetLink);

    return NextResponse.json({
      message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña',
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

