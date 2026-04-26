import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, cartSubtotal } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Ingresa un código de cupón' }, { status: 400 });
    }

    const coupons = await db`
      SELECT * FROM coupons 
      WHERE code = ${code.toUpperCase()}
    `;

    const coupon = coupons[0];

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Cupón no encontrado' }, { status: 404 });
    }

    if (coupon.active === 0) {
      return NextResponse.json({ success: false, error: 'Este cupón está inactivo' }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Este cupón ha expirado' }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ success: false, error: 'Este cupón ha alcanzado su límite de uso' }, { status: 400 });
    }

    if (coupon.min_purchase && cartSubtotal < coupon.min_purchase) {
      return NextResponse.json({ 
        success: false, 
        error: `Este cupón requiere una compra mínima de $${coupon.min_purchase}` 
      }, { status: 400 });
    }

    // Retornamos el cupón válido
    return NextResponse.json({ 
      success: true, 
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      } 
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ success: false, error: 'Error al validar cupón' }, { status: 500 });
  }
}
