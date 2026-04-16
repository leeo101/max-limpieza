import { NextResponse } from 'next/server';
import { createOrder, getAllOrders, updateOrderStatus } from '@/lib/products';
import { sendOrderConfirmationToCustomer, sendOrderNotification } from '@/lib/email';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch {
    return NextResponse.json({ success: false, error: 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.customer_name || !body.customer_phone || !body.customer_address || !body.items || !body.total) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = await createOrder({
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      customer_address: body.customer_address,
      customer_notes: body.customer_notes,
      delivery_method: body.delivery_method,
      total: body.total,
      items: body.items,
      user_id: body.user_id,
    });

    if (body.customer_email) {
      try {
        await sendOrderConfirmationToCustomer({
          orderId,
          customerName: body.customer_name,
          customerPhone: body.customer_phone,
          customerEmail: body.customer_email,
          customerAddress: body.customer_address,
          deliveryMethod: body.delivery_method || 'delivery',
          total: body.total,
          items: body.items,
        });

        await sendOrderNotification({
          orderId,
          customerName: body.customer_name,
          customerPhone: body.customer_phone,
          customerEmail: body.customer_email,
          customerAddress: body.customer_address,
          deliveryMethod: body.delivery_method || 'delivery',
          total: body.total,
          items: body.items,
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }

    return NextResponse.json({ success: true, id: orderId });
  } catch {
    return NextResponse.json({ success: false, error: 'Error creating order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const success = await updateOrderStatus(id, status);
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ success: false, error: 'Error updating order' }, { status: 500 });
  }
}
