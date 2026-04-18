'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  ChevronDown,
  Truck,
  CreditCard,
  Package,
  RefreshCcw,
  Users,
  UserCircle,
  MessageCircle,
  Phone,
  Clock,
  ShieldCheck,
  Tag,
  HelpCircle,
} from 'lucide-react';

interface FAQItem {
  id: number;
  category: string;
  icon: React.ReactNode;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // Shipping
  {
    id: 1,
    category: 'Envíos y Entregas',
    icon: <Truck className="w-5 h-5" />,
    question: '¿Cuáles son los tiempos de envío?',
    answer: 'Los envíos dentro de CABA y GBA se realizan en 24-48 horas hábiles. Para el resto del país, el tiempo estimado es de 3-5 días hábiles. Una vez confirmado tu pedido, recibirás un código de seguimiento por email.',
  },
  {
    id: 2,
    category: 'Envíos y Entregas',
    icon: <Truck className="w-5 h-5" />,
    question: '¿El envío es gratuito?',
    answer: 'Ofrecemos envío gratuito en compras superiores a $200.000. Para pedidos menores, el costo de envío se calcula según la zona y el peso del paquete. Podés ver el costo exacto antes de confirmar tu compra.',
  },
  {
    id: 3,
    category: 'Envíos y Entregas',
    icon: <Clock className="w-5 h-5" />,
    question: '¿Puedo elegir el horario de entrega?',
    answer: 'Sí, al momento de realizar tu pedido podés seleccionar un rango horario preferido (mañana o tarde). Hacemos lo posible por cumplir con tu preferencia, aunque no podemos garantizar un horario exacto.',
  },
  // Payment
  {
    id: 4,
    category: 'Métodos de Pago',
    icon: <CreditCard className="w-5 h-5" />,
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria, Mercado Pago y efectivo contra entrega en CABA y GBA.',
  },
  {
    id: 5,
    category: 'Métodos de Pago',
    icon: <Tag className="w-5 h-5" />,
    question: '¿Ofrecen descuentos por pago en efectivo o transferencia?',
    answer: 'Sí, ofrecemos un 10% de descuento para pagos en EFECTIVO en nuestro local. Para transferencias bancarias o Mercado Pago, el precio es el publicado.',
  },
  {
    id: 6,
    category: 'Métodos de Pago',
    icon: <ShieldCheck className="w-5 h-5" />,
    question: '¿Mis datos de pago están seguros?',
    answer: 'Absolutamente. Utilizamos encriptación SSL y procesamos los pagos a través de pasarelas certificadas (Mercado Pago). No almacenamos datos de tarjetas de crédito en nuestros servidores.',
  },
  // Products
  {
    id: 7,
    category: 'Productos',
    icon: <Package className="w-5 h-5" />,
    question: '¿Los productos son aptos para uso industrial?',
    answer: 'Sí, contamos con una línea profesional e industrial con productos concentrados de alta performance. Estos productos están diseñados para empresas, comercios e industrias que requieren alto rendimiento.',
  },
  {
    id: 8,
    category: 'Productos',
    icon: <HelpCircle className="w-5 h-5" />,
    question: '¿Dónde puedo ver la composición de los productos?',
    answer: 'Cada producto en nuestra tienda incluye una ficha técnica con su composición, modo de uso y precauciones. Si necesitás información adicional, no dudes en contactarnos por WhatsApp.',
  },
  {
    id: 9,
    category: 'Productos',
    icon: <Tag className="w-5 h-5" />,
    question: '¿Tienen productos ecológicos o biodegradables?',
    answer: 'Sí, estamos ampliando nuestra línea de productos ecológicos. Buscá el sello "Eco-Friendly" en nuestras descripciones para identificar los productos biodegradables y amigables con el medio ambiente.',
  },
  // Returns
  {
    id: 10,
    category: 'Devoluciones y Reembolsos',
    icon: <RefreshCcw className="w-5 h-5" />,
    question: '¿Cuál es la política de devoluciones?',
    answer: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en su envase original y sin uso. Para iniciar una devolución, contactanos por WhatsApp o email con tu número de pedido.',
  },
  {
    id: 11,
    category: 'Devoluciones y Reembolsos',
    icon: <RefreshCcw className="w-5 h-5" />,
    question: '¿Qué hago si recibí un producto dañado?',
    answer: 'Si recibiste un producto dañado o defectuoso, contactanos dentro de las 48 horas de recibido el pedido con fotos del producto y el embalaje. Te enviaremos un reemplazo sin costo o te reembolsaremos el importe completo.',
  },
  {
    id: 12,
    category: 'Devoluciones y Reembolsos',
    icon: <Clock className="w-5 h-5" />,
    question: '¿Cuánto tarda el reembolso?',
    answer: 'Los reembolsos por transferencia bancaria se procesan en 5-7 días hábiles. Para pagos con tarjeta de crédito, el reintegro se refleja en tu próximo resumen (sujeto a los tiempos de tu entidad bancaria).',
  },
  // Wholesale
  {
    id: 13,
    category: 'Ventas al por Mayor',
    icon: <Users className="w-5 h-5" />,
    question: '¿Ofrecen precios especiales por cantidad?',
    answer: 'Sí, ofrecemos descuentos escalonados por volumen. A partir de 10 unidades del mismo producto, aplicamos un descuento del 15%. Para pedidos mayores a 50 unidades, contactanos para recibir una cotización personalizada.',
  },
  {
    id: 14,
    category: 'Ventas al por Mayor',
    icon: <Users className="w-5 h-5" />,
    question: '¿Cómo puedo abrir una cuenta mayorista?',
    answer: 'Para abrir una cuenta mayorista, envianos un email a ventas@maxlimpieza.com con tus datos fiscales (CUIT, razón social, condición IVA) o escribinos por WhatsApp. Te responderemos en menos de 24 horas con tu lista de precios especial.',
  },
  // Account
  {
    id: 15,
    category: 'Mi Cuenta',
    icon: <UserCircle className="w-5 h-5" />,
    question: '¿Es necesario crear una cuenta para comprar?',
    answer: 'No es obligatorio, pero te recomendamos crear una cuenta para poder seguir tus pedidos, guardar direcciones de envío y acceder a ofertas exclusivas. Podés registrarte en menos de un minuto.',
  },
  {
    id: 16,
    category: 'Mi Cuenta',
    icon: <UserCircle className="w-5 h-5" />,
    question: '¿Cómo recupero mi contraseña?',
    answer: 'Hacé clic en "Iniciar Sesión" y luego en "¿Olvidaste tu contraseña?". Ingresá tu email y te enviaremos un enlace para restablecerla. Si no recibís el email, revisá la carpeta de spam o contactanos.',
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Envíos y Entregas': <Truck className="w-6 h-6" />,
  'Métodos de Pago': <CreditCard className="w-6 h-6" />,
  'Productos': <Package className="w-6 h-6" />,
  'Devoluciones y Reembolsos': <RefreshCcw className="w-6 h-6" />,
  'Ventas al por Mayor': <Users className="w-6 h-6" />,
  'Mi Cuenta': <UserCircle className="w-6 h-6" />,
};

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sky-500 flex-shrink-0">{item.icon}</span>
          <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-5 pb-4 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
          <p className="pt-3 pl-8">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqData.map((item) => item.category)));

  const filteredFAQs = selectedCategory
    ? faqData.filter((item) => item.category === selectedCategory)
    : faqData;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Preguntas Frecuentes</h1>
            <p className="text-xl text-sky-50 max-w-2xl mx-auto">
              Encontrá respuestas a las consultas más comunes sobre nuestros productos y servicios
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category filters */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-sky-300 hover:text-sky-600'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Todas
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-sky-300 hover:text-sky-600'
                  }`}
                >
                  {categoryIcons[category]}
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {filteredFAQs.map((item) => (
              <FAQAccordionItem key={item.id} item={item} />
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-8 text-center text-white">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">¿No encontraste lo que buscabas?</h2>
            <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
              Nuestro equipo está disponible para responder cualquier consulta. Escribinos por WhatsApp y te ayudaremos enseguida.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-lg hover:bg-emerald-50 transition duration-200 shadow-md"
              >
                <Phone className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
              <a
                href="mailto:admin@maxlimpieza.com"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-emerald-800 transition duration-200 border border-emerald-400"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar Email
              </a>
            </div>
            <p className="text-sm text-emerald-100 mt-4">
              Horario de atención: Lunes a Viernes 9:00 - 18:00 | Sábados 9:00 - 13:00
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
