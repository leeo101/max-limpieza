import { generateOrderPDF } from '../lib/pdf';
import fs from 'fs';

async function test() {
  const dummyData = {
    orderId: 'ORD-123456',
    customerName: 'Enzo Test',
    customerPhone: '123456789',
    customerEmail: 'test@example.com',
    customerAddress: 'Calle Falsa 123',
    customerCity: 'Capital',
    customerProvince: 'San Juan',
    deliveryMethod: 'delivery',
    shippingCompany: 'Vía Cargo',
    total: 15000,
    items: [
      { name: 'Detergente Premium 5L', quantity: 2, price: 5000 },
      { name: 'Lavandina Concentrada', quantity: 1, price: 5000 }
    ]
  };

  try {
    const buffer = await generateOrderPDF(dummyData);
    fs.writeFileSync('test-order.pdf', buffer);
    console.log('PDF generated successfully: test-order.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

test();
