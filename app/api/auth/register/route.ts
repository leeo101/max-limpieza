import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, address, city, postal_code } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Password validation (min 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const result = await registerCustomer({
      email,
      password,
      name,
      phone,
      address,
      city,
      postal_code,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ name, email }).catch(err => {
      console.error('Error sending welcome email:', err);
    });

    return NextResponse.json({
      message: 'Cuenta creada exitosamente',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
