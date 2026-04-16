import nodemailer from 'nodemailer';

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  deliveryMethod: string;
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
    
    const orderLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/pedidos`;
    
    const itemsList = orderData.items
      .map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-AR')}`)
      .join('\n');

    const mailOptions = {
      from: `"MAX Limpieza" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `🛒 ¡Nuevo Pedido! #${orderData.orderId.slice(-6)} - $${orderData.total.toLocaleString('es-AR')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0ea5e9, #10b981); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0; opacity: 0.9; }
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
            .btn:hover { background: #0284c7; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .delivery-badge { background: #e0f2fe; color: #0369a1; padding: 8px 16px; border-radius: 8px; display: inline-block; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 ¡Nuevo Pedido Recibido!</h1>
              <p>Pedido #${orderData.orderId.slice(-6)}</p>
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
                    <div class="info-value">${orderData.customerAddress}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>🚚 Método de Entrega</h3>
                <div class="delivery-badge">
                  ${orderData.deliveryMethod === 'delivery' ? '📦 Envío a Domicilio' : '🏪 Retiro en Local'}
                </div>
              </div>

              <div class="section">
                <h3>📦 Productos</h3>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
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
                <h3>⚡ Gestionar Pedido</h3>
                <p style="color: #64748b; margin-bottom: 15px;">Hacé clic en el botón para ver y gestionar este pedido:</p>
                <a href="${orderLink}" class="btn">Ver Pedido en el Panel Admin</a>
              </div>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} MAX Gestión de Artículos de Limpieza</p>
              <p>Este email fue enviado automáticamente. No respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🛒 ¡NUEVO PEDIDO!

Pedido: #${orderData.orderId.slice(-6)}
Fecha: ${new Date().toLocaleString('es-AR')}

👤 CLIENTE:
Nombre: ${orderData.customerName}
Teléfono: ${orderData.customerPhone}
Email: ${orderData.customerEmail}
Dirección: ${orderData.customerAddress}

🚚 ENTREGA: ${orderData.deliveryMethod === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}

📦 PRODUCTOS:
${itemsList}

💰 TOTAL: $${orderData.total.toLocaleString('es-AR')}

📋 GESTIONAR PEDIDO:
${orderLink}
      `,
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
    
    const mailOptions = {
      from: `"MAX Limpieza" <${process.env.SMTP_USER}>`,
      to: orderData.customerEmail,
      subject: `✅ ¡Tu pedido #${orderData.orderId.slice(-6)} fue recibido! - MAX Limpieza`,
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
            .items-list { list-style: none; padding: 0; }
            .items-list li { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .total { background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
            .total-price { font-size: 24px; font-weight: bold; color: #10b981; }
            .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ¡Pedido Confirmado!</h1>
              <p>Pedido #${orderData.orderId.slice(-6)}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>Hola ${orderData.customerName},</h3>
                <p>Tu pedido fue recibido exitosamente. Nos pondremos en contacto para coordinar la entrega.</p>
              </div>

              <div class="section">
                <h3>📦 Resumen del Pedido</h3>
                <ul class="items-list">
                  ${orderData.items.map(item => `
                    <li>${item.name} <strong>x${item.quantity}</strong> - $${(item.price * item.quantity).toLocaleString('es-AR')}</li>
                  `).join('')}
                </ul>
                <div class="total">
                  <div>Total a pagar:</div>
                  <div class="total-price">$${orderData.total.toLocaleString('es-AR')}</div>
                </div>
              </div>

              <div class="section">
                <h3>🚚 Entrega</h3>
                <div class="info-box">
                  <strong>${orderData.deliveryMethod === 'delivery' ? '📦 Envío a Domicilio' : '🏪 Retiro en Local'}</strong>
                  <p style="margin: 8px 0 0;">${orderData.customerAddress}</p>
                </div>
              </div>

              <div class="section" style="text-align: center;">
                <p><strong>¿Tenés dudas?</strong></p>
                <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000'}?text=Hola!%20Consulta%20sobre%20mi%20pedido%20%23${orderData.orderId.slice(-6)}" class="whatsapp-btn">
                  💬 Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
✅ ¡TU PEDIDO FUE RECIBIDO!

Pedido: #${orderData.orderId.slice(-6)}

Hola ${orderData.customerName}, tu pedido fue recibido exitosamente.

📦 PRODUCTOS:
${orderData.items.map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-AR')}`).join('\n')}

💰 TOTAL: $${orderData.total.toLocaleString('es-AR')}

🚚 ENTREGA: ${orderData.deliveryMethod === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}
📍 DIRECCIÓN: ${orderData.customerAddress}

Nos pondremos en contacto pronto. ¡Gracias por tu compra!
      `,
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

