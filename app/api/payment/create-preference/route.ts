import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getOrderById } from '@/lib/products';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId requerido' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://max-limpieza.vercel.app';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: orderId,
            title: `Pedido MAX Limpieza #${orderId.slice(-6).toUpperCase()}`,
            quantity: 1,
            unit_price: Number(order.total),
            currency_id: 'ARS',
          },
        ],
        payer: {
          name: order.customer_name || 'Cliente',
          email: order.customer_email || undefined,
        },
        back_urls: {
          success: `${siteUrl}/pedido-confirmado?id=${orderId}&payment=success`,
          failure: `${siteUrl}/pedido-confirmado?id=${orderId}&payment=failure`,
          pending: `${siteUrl}/pedido-confirmado?id=${orderId}&payment=pending`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/payment/webhook`,
        external_reference: orderId,
        statement_descriptor: 'MAX Limpieza',
      },
    });

    return NextResponse.json({
      success: true,
      init_point: result.init_point,
      id: result.id,
    });
  } catch (error) {
    console.error('MP Preference Error:', error);
    return NextResponse.json({ error: 'Error al crear preferencia de pago' }, { status: 500 });
  }
}
