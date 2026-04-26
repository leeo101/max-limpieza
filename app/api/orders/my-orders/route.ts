import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getServerSession();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const orders = await db`
      SELECT id, total, status, created_at, items, delivery_method 
      FROM orders 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}
