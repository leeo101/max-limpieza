import { NextResponse } from 'next/server';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, getStats, getRecentOrders, getLowStockProducts, getDailySalesStats } from '@/lib/products';
import { sendOrderConfirmationToCustomer, sendOrderNotification } from '@/lib/email';
import { verifyToken } from '@/lib/auth';
import { orderLimiter } from '@/lib/rateLimit';

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

      // Security Hardening: Only allow public access if created in the last 24 hours
      const orderDate = new Date(order.created_at);
      const hoursSinceCreation = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
      
      // Check if user is admin (to allow viewing old orders in detail from admin panel)
      const authHeader = request.headers.get('authorization');
      const isAdmin = authHeader && authHeader.startsWith('Bearer ') && verifyToken(authHeader.split(' ')[1])?.role === 'admin';

      if (!isAdmin && hoursSinceCreation > 24) {
        return NextResponse.json({ success: false, error: 'Acceso denegado. Este pedido ya no es accesible públicamente.' }, { status: 403 });
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

    if (orderAction === 'chart') {
      const days = parseInt(searchParams.get('days') || '30', 10);
      const data = await getDailySalesStats(days);
      return NextResponse.json({ success: true, data });
    }

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (_error) {
    console.error('API Error:', _error);
    return NextResponse.json({ success: false, error: 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = orderLimiter.check(5, ip); // 5 orders per hour per IP
    
    if (limitResult.isLimitReached) {
      return NextResponse.json({ 
        success: false, 
        error: 'Demasiados intentos. Por favor espera una hora.' 
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limitResult.limit.toString(),
          'X-RateLimit-Current': limitResult.current.toString(),
        }
      });
    }

    const body = await request.json();
    
    if (!body.customer_name || !body.customer_phone || !body.customer_address || !body.items || !body.total) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = await createOrder({
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      customer_dni: body.customer_dni,
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
  } catch (_error) {
    console.error('POST Order Error:', _error);
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
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const success = await updateOrderStatus(id, status);
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Order not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (_error) {
    console.error('PATCH Order Error:', _error);
    return NextResponse.json({ success: false, error: 'Error updating order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing order ID' }, { status: 400 });
    }

    const success = await deleteOrder(id);
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (_error) {
    console.error('DELETE Order Error:', _error);
    return NextResponse.json({ success: false, error: 'Error deleting order' }, { status: 500 });
  }
}
