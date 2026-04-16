import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';

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

    // Get user's orders from database
    const orders = db.prepare(`
      SELECT id, customer_name, customer_phone, customer_email, customer_address, 
             customer_notes, delivery_method, total, status, items, created_at, updated_at
      FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(decoded.id);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error getting user orders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
