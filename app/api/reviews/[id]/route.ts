import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await getServerSession();
    
    // Solo admins
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { approved } = body;

    await db`
      UPDATE reviews 
      SET approved = ${approved ? 1 : 0} 
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Estado de reseña actualizado' });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar reseña' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await getServerSession();
    
    // Solo admins
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await params;

    await db`
      DELETE FROM reviews 
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Reseña eliminada permanentemente' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar reseña' }, { status: 500 });
  }
}
