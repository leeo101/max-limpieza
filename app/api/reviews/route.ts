import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string | null;
  created_at: string;
  approved: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { success: false, error: 'productId is required' },
      { status: 400 }
    );
  }

  try {
    const reviews = db.prepare(`
      SELECT r.*
      FROM reviews r
      WHERE r.product_id = ? AND r.approved = 1
      ORDER BY r.created_at DESC
    `).all(productId) as Review[];

    // Calculate average rating
    const allReviews = db.prepare(`
      SELECT AVG(rating) as avgRating, COUNT(*) as totalCount
      FROM reviews
      WHERE product_id = ? AND approved = 1
    `).get(productId) as { avgRating: number | null; totalCount: number };

    return NextResponse.json({
      success: true,
      data: reviews,
      summary: {
        averageRating: allReviews.avgRating ? parseFloat(Number(allReviews.avgRating).toFixed(1)) : 0,
        totalReviews: allReviews.totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { success: false, error: 'productId and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = db.prepare(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?'
    ).get(productId, decoded.id);

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 409 }
      );
    }

    // Get user details
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.id) as {
      id: string;
      name: string | null;
      email: string;
    } | null;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const id = uuidv4();
    const userName = user.name || user.email.split('@')[0];

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, user_name, user_email, rating, comment, approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, productId, user.id, userName, user.email, rating, comment || null);

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      data: { id, productId, rating, comment, userName },
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
