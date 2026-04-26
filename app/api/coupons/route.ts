import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken, getServerSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const decoded = await getServerSession();
    
    // Solo admins
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const coupons = await db`
      SELECT * FROM coupons 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await getServerSession();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const { code, discount_type, discount_value, min_purchase, usage_limit, expires_at } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ success: false, error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const id = randomUUID();

    await db`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_purchase, usage_limit, expires_at)
      VALUES (
        ${id}, 
        ${code.toUpperCase()}, 
        ${discount_type}, 
        ${discount_value}, 
        ${min_purchase || 0}, 
        ${usage_limit || null}, 
        ${expires_at || null}
      )
    `;

    return NextResponse.json({ success: true, message: 'Cupón creado correctamente' });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    if (error.code === '23505') { // Unique violation in Postgres
      return NextResponse.json({ success: false, error: 'El código de cupón ya existe' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Error al crear cupón' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const decoded = await getServerSession();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, active } = body;

    if (!id || active === undefined) {
      return NextResponse.json({ success: false, error: 'Faltan datos' }, { status: 400 });
    }

    await db`
      UPDATE coupons 
      SET active = ${active ? 1 : 0} 
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Estado del cupón actualizado' });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar cupón' }, { status: 500 });
  }
}
