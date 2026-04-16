import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, getRecentOrders, getStats } from '@/lib/products';
import { verifyToken } from '@/lib/auth';
import { sendOrderNotification, sendOrderConfirmationToCustomer } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'stats') {
      const stats = getStats();
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'inventory') {
      const { getLowStockProducts } = await import('@/lib/products');
      const products = getLowStockProducts();
      return NextResponse.json({ success: true, data: products });
    }

    if (action === 'recent') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const orders = getRecentOrders(limit);
      return NextResponse.json({ success: true, data: orders });
    }

    if (action === 'get') {
      const id = searchParams.get('id');
      if (!id) {
        return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
      }
      const order = getOrderById(id);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: order });
    }

    // Admin only - get all orders
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const orders = getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch {
    return NextResponse.json({ success: false, error: 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if user is logged in (optional)
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    const id = createOrder({
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      customer_address: body.customer_address,
      customer_notes: body.customer_notes,
      delivery_method: body.delivery_method || 'delivery',
      total: parseFloat(body.total),
      items: body.items,
      user_id: userId,
    });

    // Send email notifications (non-blocking)
    if (body.customer_email) {
      const emailData = {
        orderId: id,
        customerName: body.customer_name,
        customerPhone: body.customer_phone,
        customerEmail: body.customer_email,
        customerAddress: body.customer_address,
        deliveryMethod: body.delivery_method || 'delivery',
        total: parseFloat(body.total),
        items: body.items,
      };

      // Send notification to admin
      sendOrderNotification(emailData).catch(err => {
        console.error('Error sending admin notification:', err);
      });

      // Send confirmation to customer
      sendOrderConfirmationToCustomer(emailData).catch(err => {
        console.error('Error sending customer confirmation:', err);
      });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch {
    console.error('Error creating order');
    return NextResponse.json({ success: false, error: 'Error creating order' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    const success = updateOrderStatus(id, body.status);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Error updating order' }, { status: 500 });
  }
}
