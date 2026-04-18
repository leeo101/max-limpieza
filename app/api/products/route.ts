import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, searchProducts, getProductsByCategory, createProduct, updateProduct, deleteProduct } from '@/lib/products';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'search') {
      const query = searchParams.get('q') || '';
      const results = await searchProducts(query);
      return NextResponse.json({ success: true, data: results });
    }

    if (action === 'by-category') {
      const categoryId = searchParams.get('categoryId') || '';
      const results = await getProductsByCategory(categoryId);
      return NextResponse.json({ success: true, data: results });
    }

    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const products = await getAllProducts(activeOnly);
    return NextResponse.json({ success: true, data: products });
  } catch (err: unknown) {
    console.error('API Error (GET products):', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ success: false, error: 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = await createProduct({
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      stock: parseInt(body.stock) || 0,
      category_id: body.category_id || null,
      image: body.image || null,
      images: body.images ? JSON.stringify(body.images) : null,
      sku: body.sku || null,
      active: body.active !== undefined ? body.active : 1,
      featured: body.featured || 0,
      bestseller: body.bestseller || 0,
      is_wholesale: body.is_wholesale || 0,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (err: any) {
    console.error('Create product error:', err);
    
    // Auto-fix if column is missing
    if (err.message && err.message.includes('is_wholesale')) {
      try {
        const sql = (await import('@/lib/db')).default;
        console.log('Attempting auto-migration for is_wholesale...');
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_wholesale INTEGER DEFAULT 0`;
        // One-time retry
        const body = await request.clone().json();
        const { createProduct } = await import('@/lib/products');
        const id = await createProduct({
          name: body.name,
          description: body.description,
          price: parseFloat(body.price),
          stock: parseInt(body.stock) || 0,
          category_id: body.category_id || null,
          image: body.image || null,
          images: body.images ? JSON.stringify(body.images) : null,
          sku: body.sku || null,
          active: body.active !== undefined ? body.active : 1,
          featured: body.featured || 0,
          bestseller: body.bestseller || 0,
          is_wholesale: body.is_wholesale || 0,
        });
        return NextResponse.json({ success: true, data: { id }, message: 'Database patched automatically' });
      } catch (migrationErr: any) {
        return NextResponse.json({ success: false, error: 'Database error: ' + migrationErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Error al crear el producto en la base de datos' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Convert numeric fields properly
    const updateData: Record<string, unknown> = { ...body };
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price as string);
    }
    if (updateData.stock !== undefined) {
      updateData.stock = parseInt(updateData.stock as string);
    }

    const success = await updateProduct(id, updateData);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update product error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Error al actualizar el producto' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Error deleting product' }, { status: 500 });
  }
}
