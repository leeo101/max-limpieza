import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'El email es requerido' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'El email no es valido' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Este email ya esta suscrito' },
        { status: 409 }
      );
    }

    // Insert subscriber
    const id = randomUUID();
    db.prepare('INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)').run(id, email);

    return NextResponse.json(
      { success: true, message: 'Suscripcion exitosa' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
