import nodemailer from 'nodemailer';
import { generateOrderPDF } from './pdf';

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity?: string;
  customerProvince?: string;
  deliveryMethod: string;
  shippingCompany?: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

// Create transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Send order notification to admin
export async function sendOrderNotification(orderData: OrderEmailData) {
  try {
    const transporter = createTransporter();
    const pdfBuffer = await generateOrderPDF(orderData);
    
    // Fixed admin email as requested
    const adminEmail = 'enzorodriguez31@gmail.com';
    const orderLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/pedidos`;
    
    const mailOptions = {
      from: `"MAX Limpieza" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🛒 ¡Nuevo Pedido! #${orderData.orderId.slice(-6).toUpperCase()} - $${orderData.total.toLocaleString('es-AR')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0ea5e9, #10b981); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #0ea5e9; border-bottom: 2px solid #e0f2fe; padding-bottom: 8px; margin-bottom: 12px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .info-item { background: #f8fafc; padding: 12px; border-radius: 8px; }
            .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .info-value { font-weight: bold; color: #0f172a; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; }
            .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .total-row { background: #f0fdf4; }
            .total-row td { font-size: 18px; font-weight: bold; color: #10b981; }
            .btn { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 ¡Nuevo Pedido Recibido!</h1>
              <p>Pedido #${orderData.orderId.slice(-6).toUpperCase()}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>👤 Datos del Cliente</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Nombre</div>
                    <div class="info-value">${orderData.customerName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Teléfono</div>
                    <div class="info-value">${orderData.customerPhone}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${orderData.customerEmail}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Dirección</div>
                    <div class="info-value">
                      ${orderData.customerAddress}<br>
                      ${orderData.customerCity ? orderData.customerCity + ', ' : ''}${orderData.customerProvince || ''}
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>🚚 Entrega</h3>
                <div style="background: #e0f2fe; color: #0369a1; padding: 12px; border-radius: 8px; font-weight: bold;">
                  ${orderData.deliveryMethod === 'delivery' ? `📦 Envío por ${orderData.shippingCompany || 'Transporte'}` : '🏪 Retiro en Local'}
                </div>
                ${orderData.deliveryMethod === 'delivery' ? '<p style="font-size: 12px; color: #64748b; margin-top: 5px;">(Pago en destino a cargo del cliente)</p>' : ''}
              </div>

              <div class="section">
                <h3>📦 Productos</h3>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderData.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${(item.price * item.quantity).toLocaleString('es-AR')}</td>
                      </tr>
                    `).join('')}
                    <tr class="total-row">
                      <td colspan="2"><strong>TOTAL</strong></td>
                      <td>$${orderData.total.toLocaleString('es-AR')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="section" style="text-align: center;">
                <p style="color: #64748b; margin-bottom: 15px;">Se adjunta la boleta en PDF para control.</p>
                <a href="${orderLink}" class="btn">Gestionar en Panel Admin</a>
              </div>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} MAX Artículos de Limpieza</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Pedido-MAX-${orderData.orderId.slice(-6).toUpperCase()}.pdf`,
          content: pdfBuffer,
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de notificación enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error };
  }
}

// Send order confirmation to customer
export async function sendOrderConfirmationToCustomer(orderData: OrderEmailData) {
  try {
    const transporter = createTransporter();
    const pdfBuffer = await generateOrderPDF(orderData);
    
    const mailOptions = {
      from: `"MAX Limpieza" <${process.env.SMTP_USER}>`,
      to: orderData.customerEmail,
      subject: `✅ ¡Tu pedido #${orderData.orderId.slice(-6).toUpperCase()} fue recibido! - MAX Limpieza`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #0ea5e9); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #10b981; border-bottom: 2px solid #d1fae5; padding-bottom: 8px; }
            .info-box { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ¡Pedido Recibido!</h1>
              <p>Orden #${orderData.orderId.slice(-6).toUpperCase()}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>Hola ${orderData.customerName},</h3>
                <p>Tu pedido ha sido recibido correctamente. Te adjuntamos la boleta en PDF con el detalle de tu compra y los datos para realizar el pago.</p>
              </div>

               <div class="section">
                <h3>🚚 Entrega</h3>
                <div class="info-box">
                  <strong>${orderData.deliveryMethod === 'delivery' ? `📦 Envío por ${orderData.shippingCompany || 'Transporte'}` : '🏪 Retiro en Local'}</strong>
                  <p style="margin: 8px 0 0;">
                    ${orderData.customerAddress}<br>
                    ${orderData.customerCity ? orderData.customerCity + ', ' : ''}${orderData.customerProvince || ''}
                  </p>
                  ${orderData.deliveryMethod === 'delivery' ? '<p style="margin-top: 10px; font-size: 12px; color: #b45309;">⚠️ El costo de envío no está incluido y se abona al recibir el paquete.</p>' : ''}
                </div>
              </div>

              <div class="section">
                <h3>💰 Forma de Pago</h3>
                <div class="info-box">
                  <p><strong>Mercado Pago (Transferencia)</strong></p>
                  <p>Alias: <strong>enzo.09.</strong></p>
                  <p>Titular: <strong>Enzo Leonel Rodriguez</strong></p>
                </div>
              <div class="section" style="text-align: center; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <h3 style="color: #0ea5e9; border: none; margin-top: 0;">💳 Centro de Pago Online</h3>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Accedé a nuestro centro de pago para copiar el Alias, ver el QR y facilitar tu transferencia.</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pedido-confirmado?id=${orderData.orderId}" 
                   style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Ir a Pagar mi Pedido
                </a>
              </div>

              <div class="section" style="text-align: center;">
                <p><strong>¿Tenés dudas?</strong></p>
                <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000'}?text=Hola!%20Consulta%20sobre%20mi%20pedido%20%23${orderData.orderId.slice(-6).toUpperCase()}" class="whatsapp-btn">
                  💬 Contactar por WhatsApp
                </a>
              </div>
            </div>

            <div class="footer" style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
              <p>© ${new Date().getFullYear()} MAX Artículos de Limpieza</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Boleta-MAX-${orderData.orderId.slice(-6).toUpperCase()}.pdf`,
          content: pdfBuffer,
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación al cliente enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error enviando email al cliente:', error);
    return { success: false, error };
  }
}

// Send welcome email after registration
export async function sendWelcomeEmail(userData: { name: string; email: string }) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"MAX Limpieza" <${process.env.SMTP_USER}>`,
      to: userData.email,
      subject: `👋 ¡Bienvenido a MAX Limpieza, ${userData.name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0ea5e9, #10b981); color: white; padding: 40px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; }
            .content { padding: 40px; text-align: center; }
            .content h2 { color: #0f172a; margin-bottom: 20px; }
            .content p { color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .btn { display: inline-block; background: #0ea5e9; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ ¡Hola ${userData.name}!</h1>
            </div>
            <div class="content">
              <h2>Estamos felices de tenerte con nosotros</h2>
              <p>Gracias por unirte a MAX Limpieza. Ahora tenés acceso a los mejores productos de limpieza profesional con precios exclusivos y envíos a todo el país.</p>
              <p>Además, por cada compra que realices vas a sumar <strong>puntos MAX</strong> que después vas a poder canjear por descuentos increíbles.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tienda" class="btn">Empezar a Comprar</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MAX Limpieza. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return { success: false, error };
  }
}

// Send verification email
export async function sendVerificationEmail(email: string, token: string) {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"MAX Limpieza" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🛡️ Verificá tu cuenta en MAX Limpieza`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: #0ea5e9; color: white; padding: 40px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px; text-align: center; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 30px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verificá tu Email</h1>
            </div>
            <div class="content">
              <p>¡Gracias por registrarte! Para asegurar tu cuenta y empezar a sumar puntos, por favor verificá tu dirección de email haciendo clic en el siguiente botón:</p>
              <a href="${verificationUrl}" class="btn">Verificar mi Email</a>
              <p style="font-size: 12px; color: #94a3b8;">Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:<br>${verificationUrl}</p>
            </div>
            <div class="footer">
              <p>Si no creaste esta cuenta, podés ignorar este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    return { success: false, error };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/restablecer-contraseña?token=${token}`;
    
    const mailOptions = {
      from: `"MAX Limpieza" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🔑 Restablecé tu contraseña - MAX Limpieza`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: #0f172a; color: white; padding: 40px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px; text-align: center; }
            .btn { display: inline-block; background: #0ea5e9; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 30px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Restablecer Contraseña</h1>
            </div>
            <div class="content">
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el botón de abajo para elegir una nueva:</p>
              <a href="${resetUrl}" class="btn">Restablecer mi Contraseña</a>
              <p style="color: #64748b;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, podés ignorar este email de forma segura.</p>
            </div>
            <div class="footer">
              <p>MAX Limpieza - Productos profesionales a un clic.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error enviando email de reset:', error);
    return { success: false, error };
  }
}
