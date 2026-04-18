import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

interface PDFOrderData {
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

export async function generateOrderPDF(orderData: PDFOrderData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.width;
  
  // 1. Add Logo
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath).toString('base64');
      doc.addImage(`data:image/png;base64,${logoData}`, 'PNG', 15, 15, 40, 40);
    }
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }

  // 2. Header Info
  doc.setFontSize(22);
  doc.setTextColor(14, 165, 233); // sky-500
  doc.text('MAX LIMPIEZA', 65, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Artículos de Limpieza de Alta Calidad', 65, 32);
  doc.text('San Juan, Argentina', 65, 39);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('COMPROBANTE DE PEDIDO', 120, 55);
  
  doc.setDrawColor(226, 232, 240); // border
  doc.line(15, 65, pageWidth - 15, 65);

  // 3. Order Details
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`NRO. PEDIDO: #${orderData.orderId.slice(-6).toUpperCase()}`, 15, 75);
  doc.text(`FECHA: ${new Date().toLocaleDateString('es-AR')}`, 15, 82);

  // 4. Customer Info
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('CLIENTE:', 15, 95);
  doc.setFontSize(10);
  doc.text(`Nombre: ${orderData.customerName}`, 15, 102);
  doc.text(`Teléfono: ${orderData.customerPhone}`, 15, 109);
  doc.text(`Email: ${orderData.customerEmail}`, 15, 116);
  doc.text(`Dirección: ${orderData.customerAddress}`, 15, 123);
  doc.text(`Ubicación: ${orderData.customerCity || ''}${orderData.customerCity ? ', ' : ''}${orderData.customerProvince || ''}`, 15, 130);

  // 5. Shipping Info
  doc.setFontSize(12);
  doc.text('ENVÍO / ENTREGA:', 120, 95);
  doc.setFontSize(10);
  doc.text(`Método: ${orderData.deliveryMethod === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}`, 120, 102);
  if (orderData.deliveryMethod === 'delivery') {
    doc.text(`Empresa: ${orderData.shippingCompany || 'A coordinar'}`, 120, 109);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('* El costo se abona en destino.', 120, 116);
    doc.setTextColor(15, 23, 42);
  }

  // 6. Items Table
  const tableRows = orderData.items.map(item => [
    item.name,
    item.quantity.toString(),
    `$${item.price.toLocaleString('es-AR')}`,
    `$${(item.price * item.quantity).toLocaleString('es-AR')}`
  ]);

  autoTable(doc, {
    startY: 140,
    head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // 7. Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL PEDIDO: $${orderData.total.toLocaleString('es-AR')}`, pageWidth - 15, finalY, { align: 'right' });

  // 8. Payment Info Footer
  const footerY = 240;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, footerY - 10, pageWidth - 15, footerY - 10);
  
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text('INFORMACIÓN DE PAGO (MERCADO PAGO)', 15, footerY);
  
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text('Para confirmar tu pedido, por favor realizá el pago a la siguiente cuenta:', 15, footerY + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(`Alias: enzo.09.`, 15, footerY + 15);
  doc.text(`Titular: Enzo Leonel Rodriguez`, 15, footerY + 22);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Una vez realizado el pago, envianos el comprobante por WhatsApp.', 15, footerY + 32);

  // Return buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
