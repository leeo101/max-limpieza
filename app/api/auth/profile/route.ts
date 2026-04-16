import { NextResponse } from 'next/server';
import { verifyToken, updateUserProfile } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado - Token omitido' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'No autorizado - Token inválido' },
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

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado - Token omitido' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'No autorizado - Token inválido' },
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

    const users = await db`SELECT id, role FROM users WHERE id = ${decoded.id}`;
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
