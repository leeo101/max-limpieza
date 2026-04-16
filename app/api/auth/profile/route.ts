import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, updateUserProfile } from '@/lib/auth';
import db from '@/lib/db';

interface User {
  id: string;
  email: string;
  role: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  points: number;
  email_verified: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Get user from database (without password)
    const user = db.prepare(
      'SELECT id, email, role, name, phone, address, city, postal_code, points, email_verified, active, created_at, updated_at FROM users WHERE id = ?'
    ).get(decoded.id) as User | null;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, address, city, postal_code } = body;

    const success = updateUserProfile(decoded.id, {
      name,
      phone,
      address,
      city,
      postal_code,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      );
    }

    // Get updated user
    const user = db.prepare(
      'SELECT id, email, role, name, phone, address, city, postal_code, points, email_verified, active, created_at, updated_at FROM users WHERE id = ?'
    ).get(decoded.id) as User | null;

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      user,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
