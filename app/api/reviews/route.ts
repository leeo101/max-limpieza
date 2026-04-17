import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const all = searchParams.get('all') === 'true';

    if (productId) {
      const reviews = await db`
        SELECT r.*, u.name as user_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ${productId} AND r.approved = 1 
        ORDER BY r.created_at DESC
      `;

      // Calculate summary
      let totalRating = 0;
      reviews.forEach(r => totalRating += Number(r.rating || 0));
      const summary = {
        averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
        totalReviews: reviews.length
      };

      return NextResponse.json({ success: true, data: reviews, summary });
    }

    if (all) {
      const allReviews = await db`
        SELECT r.*, p.name as product_name
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
      `;
      return NextResponse.json({ success: true, data: allReviews });
    }

    return NextResponse.json(
      { success: false, error: 'Missing productId parameter' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado - Debes iniciar sesión para opinar' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos. La calificación debe ser un número entre 1 y 5.' },
        { status: 400 }
      );
    }

    const products = await db`SELECT id FROM products WHERE id = ${productId}`;
    const product = products[0];
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const existingReviews = await db`
      SELECT id FROM reviews 
      WHERE user_id = ${decoded.id} AND product_id = ${productId}
    `;
    const existingReview = existingReviews[0];

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Ya has opinado sobre este producto' },
        { status: 400 }
      );
    }

    const users = await db`SELECT id, name, email FROM users WHERE id = ${decoded.id}`;
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const reviewId = randomUUID();
    
    await db`
      INSERT INTO reviews (id, product_id, user_id, user_name, user_email, rating, comment, approved)
      VALUES (${reviewId}, ${productId}, ${decoded.id}, ${user.name || 'Usuario'}, ${user.email}, ${rating}, ${comment || null}, 0)
    `;

    return NextResponse.json({
      success: true,
      message: 'Gracias por tu opinión. Será publicada luego de ser aprobada por un administrador.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error del servidor al guardar opinión' },
      { status: 500 }
    );
  }
}
