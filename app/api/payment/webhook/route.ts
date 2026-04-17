import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateOrderStatus } from '@/lib/products';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // MP sends different notification types
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;

      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      const orderId = paymentData.external_reference;
      const status = paymentData.status; // 'approved', 'pending', 'rejected'

      if (!orderId) {
        return NextResponse.json({ received: true });
      }

      if (status === 'approved') {
        await updateOrderStatus(orderId, 'confirmed');
        console.log(`✅ Pago aprobado. Pedido ${orderId} confirmado.`);
      } else if (status === 'pending' || status === 'in_process') {
        await updateOrderStatus(orderId, 'pending');
        console.log(`⏳ Pago pendiente. Pedido ${orderId}.`);
      } else if (status === 'rejected' || status === 'cancelled') {
        console.log(`❌ Pago rechazado para pedido ${orderId}.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook MP Error:', error);
    // Return 200 anyway so MP doesn't retry infinitely
    return NextResponse.json({ received: true });
  }
}
