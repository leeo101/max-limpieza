import { NextResponse } from 'next/server';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, getStats, getRecentOrders, getLowStockProducts } from '@/lib/products';
import { sendOrderConfirmationToCustomer, sendOrderNotification } from '@/lib/email';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderAction = searchParams.get('action');
    const orderIdParam = searchParams.get('id');

    // Action: Get single order (accessible for confirmation page)
    if (orderAction === 'get' && orderIdParam) {
      const order = await getOrderById(orderIdParam);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: order });
    }

    // Administrative actions (Require Admin Authentication)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (orderAction === 'stats') {
      const stats = await getStats();
      return NextResponse.json({ success: true, data: stats });
    }

    if (orderAction === 'recent') {
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const orders = await getRecentOrders(limit);
      return NextResponse.json({ success: true, data: orders });
    }

    if (orderAction === 'inventory') {
      const products = await getLowStockProducts(5);
      return NextResponse.json({ success: true, data: products });
    }

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('API Error:', error);
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
      province: body.province,
      city: body.city,
      postal_code: body.postal_code,
      shipping_company: body.shipping_company,
      shipping_cost: body.shipping_cost,
    });

    if (body.customer_email) {
      try {
        await sendOrderConfirmationToCustomer({
          orderId,
          customerName: body.customer_name,
          customerPhone: body.customer_phone,
          customerEmail: body.customer_email,
          customerAddress: body.customer_address,
          customerCity: body.city,
          customerProvince: body.province,
          deliveryMethod: body.delivery_method || 'delivery',
          shippingCompany: body.shipping_company,
          total: body.total,
          items: body.items,
        });

        await sendOrderNotification({
          orderId,
          customerName: body.customer_name,
          customerPhone: body.customer_phone,
          customerEmail: body.customer_email,
          customerAddress: body.customer_address,
          customerCity: body.city,
          customerProvince: body.province,
          deliveryMethod: body.delivery_method || 'delivery',
          shippingCompany: body.shipping_company,
          total: body.total,
          items: body.items,
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }

    return NextResponse.json({ success: true, id: orderId });
  } catch (error) {
    console.error('POST Order Error:', error);
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
  } catch (error) {
    console.error('PATCH Order Error:', error);
    return NextResponse.json({ success: false, error: 'Error updating order' }, { status: 500 });
  }
}
