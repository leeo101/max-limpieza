import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, items, total } = body;

    if (!email || !items || !items.length) {
      return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 });
    }

    // Check if an active abandoned cart exists for this email
    const existing = await sql`SELECT id FROM abandoned_carts WHERE user_email = ${email} AND status = 'pending'`;

    if (existing && existing.length > 0) {
      // Update existing
      await sql`
        UPDATE abandoned_carts 
        SET items = ${JSON.stringify(items)}, total = ${total}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;
    } else {
      // Create new
      const id = uuidv4();
      await sql`
        INSERT INTO abandoned_carts (id, user_email, user_name, items, total)
        VALUES (${id}, ${email}, ${name || ''}, ${JSON.stringify(items)}, ${total})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const carts = await sql`
      SELECT * FROM abandoned_carts 
      WHERE status = 'pending' 
      ORDER BY updated_at DESC
    `;
    return NextResponse.json({ success: true, data: carts });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
