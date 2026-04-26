import { NextResponse } from 'next/server';
import { verifyToken, updateUserProfile, getServerSession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const decoded = await getServerSession();

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const users = await db`SELECT id, email, role, name, phone, address, city, postal_code, points, email_verified, created_at FROM users WHERE id = ${decoded.id}`;
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const decoded = await getServerSession();

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, address, city, postal_code } = body;

    const success = await updateUserProfile(decoded.id, {
      name,
      phone,
      address,
      city,
      postal_code
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar el perfil' },
        { status: 400 }
      );
    }

    // Return the updated basic info (points etc remain the same)
    const users = await db`SELECT id, email, role, name, phone, address, city, postal_code, points, email_verified, created_at FROM users WHERE id = ${decoded.id}`;
    const user = users[0];

    return NextResponse.json({ 
      success: true, 
      message: 'Perfil actualizado exitosamente',
      user
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
