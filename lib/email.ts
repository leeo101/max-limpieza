import nodemailer from 'nodemailer';

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"MAX Limpieza" <${process.env.EMAIL_USER || 'no-reply@maxlimpieza.com'}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function getOrderEmailTemplate(order: any) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #0ea5e9; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">¡Pedido Confirmado!</h1>
      </div>
      <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Hola <strong>${order.customer_name}</strong>,</p>
        <p>Tu pedido <strong>#${order.id.slice(0, 8)}</strong> ha sido recibido correctamente.</p>
        
        <h3 style="border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">Resumen de tu compra</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px; font-weight: bold;">TOTAL</td>
            <td style="padding: 10px; font-weight: bold; text-align: right; color: #0ea5e9; font-size: 18px;">
              $${order.total.toLocaleString('es-AR')}
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 10px;">
          <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Dirección de entrega:</strong> ${order.customer_address}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;"><strong>Método:</strong> ${order.delivery_method === 'delivery' ? 'Envío a domicilio' : 'Retiro en sucursal'}</p>
        </div>
        
        <p style="margin-top: 30px;">Si tenés alguna duda, contactanos por WhatsApp.</p>
        <p>¡Gracias por elegir MAX Limpieza!</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} MAX Limpieza. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
}

export function getPasswordResetTemplate(token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/restablecer-contraseña?token=${token}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #0ea5e9; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Restablecer Contraseña</h1>
      </div>
      <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetLink}" style="background: #0ea5e9; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi contraseña</a>
        </div>
        <p>Si no solicitaste este cambio, podés ignorar este correo.</p>
      </div>
    </div>
  `;
}

export async function sendOrderConfirmationToCustomer(data: any) {
  const html = getOrderEmailTemplate({
    id: data.orderId,
    customer_name: data.customerName,
    customer_address: `${data.customerAddress}${data.customerCity ? ', ' + data.customerCity : ''}`,
    delivery_method: data.deliveryMethod,
    total: data.total,
    items: data.items
  });

  return sendEmail({
    to: data.customerEmail,
    subject: `Confirmación de Pedido #${data.orderId.slice(0, 8)} - MAX Limpieza`,
    html,
  });
}

export async function sendOrderNotification(data: any) {
  const html = `
    <h1>Nuevo Pedido Recibido</h1>
    <p><strong>ID:</strong> ${data.orderId}</p>
    <p><strong>Cliente:</strong> ${data.customerName}</p>
    <p><strong>Total:</strong> $${data.total.toLocaleString('es-AR')}</p>
    <hr />
    <p>Revisá el panel de administración para más detalles.</p>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'enzorodriguez31@gmail.com',
    subject: `NUEVO PEDIDO: ${data.customerName} - $${data.total}`,
    html,
  });
}
