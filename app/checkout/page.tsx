'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_dni: '',
    customer_address: '',
    customer_city: '',
    customer_province: 'San Juan',
    customer_postal_code: '',
    delivery_method: 'delivery',
    shipping_company: 'Correo Argentino',
    customer_notes: '',
  });

  const PROVINCES = [
    'San Juan', 'CABA', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Luis', 
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  const SHIPPING_COMPANIES = [
    'Correo Argentino', 'Andreani', 'OCA', 'OCASA', 'Vía Cargo', 'Cruz del Sur', 
    'La Sevillanita', 'Expreso Luján', 'MD Cargas', 'Buspack', 'Urbano', 
    'SendBox', 'Integral Pack', 'EcaPack', 'Central de Cargas Terrestres (CCT)', 
    'Otro (A coordinar)'
  ];

  useEffect(() => {
    const safeParse = (key: string, fallback: any) => {
      try {
        const item = localStorage.getItem(key);
        if (item && item !== 'undefined') return JSON.parse(item);
      } catch (e) {
        console.error(`Error parsing ${key}:`, e);
      }
      return fallback;
    };

    const cartData = safeParse('cart', []);
    if (cartData.length === 0) {
      router.push('/carrito');
      return;
    }
    setCart(cartData);

    // Auto-fill form if user is logged in
    const userData = safeParse('userData', null);
    if (userData) {
      setFormData({
        customer_name: userData.name || '',
        customer_phone: userData.phone || '',
        customer_email: userData.email || '',
        customer_dni: '',
        customer_address: userData.address || '',
        customer_city: userData.city || '',
        customer_province: userData.province || 'San Juan',
        customer_postal_code: userData.postal_code || '',
        delivery_method: 'delivery',
        shipping_company: 'Correo Argentino',
        customer_notes: '',
      });
    }

    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Get user token if logged in
      const userToken = localStorage.getItem('userToken');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          province: formData.customer_province,
          city: formData.customer_city,
          postal_code: formData.customer_postal_code,
          shipping_company: formData.delivery_method === 'delivery' ? formData.shipping_company : null,
          total,
          items: cart,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart
        localStorage.setItem('cart', '[]');
        window.dispatchEvent(new Event('cartUpdated'));

        // Redirect to success page
        router.push(`/pedido-confirmado?id=${result.id}`);
      } else {
        alert('Error al procesar tu pedido. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al procesar tu pedido. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Datos del Cliente</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Tu número de teléfono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI (para el correo) *
                    </label>
                    <input
                      type="text"
                      name="customer_dni"
                      value={formData.customer_dni}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Tu número de DNI"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email * <span className="text-gray-500 font-normal">(para enviarte el comprobante)</span>
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="tu@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">📧 Recibirás un email de confirmación con el detalle de tu pedido</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Cómo querés recibir tu pedido? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, delivery_method: 'delivery' })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${formData.delivery_method === 'delivery'
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="text-2xl mb-2">📦</div>
                        <div className="font-semibold text-sm">Envío a Domicilio</div>
                        <div className="text-xs text-gray-500 mt-1">Te lo llevamos</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, delivery_method: 'pickup' })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${formData.delivery_method === 'pickup'
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="text-2xl mb-2">🏪</div>
                        <div className="font-semibold text-sm">Retiro en Local</div>
                        <div className="text-xs text-gray-500 mt-1">Pasás a buscar</div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia *
                      </label>
                      <select
                        name="customer_province"
                        value={formData.customer_province}
                        onChange={handleChange}
                        required
                        className="input-field"
                      >
                        {PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad / Localidad *
                      </label>
                      <input
                        type="text"
                        name="customer_city"
                        value={formData.customer_city}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Ej: San Juan Capital"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="customer_postal_code"
                        value={formData.customer_postal_code}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Ej: 5400"
                      />
                    </div>
                    {formData.delivery_method === 'delivery' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa de Transporte Preferida *
                        </label>
                        <select
                          name="shipping_company"
                          value={formData.shipping_company}
                          onChange={handleChange}
                          required
                          className="input-field"
                        >
                          {SHIPPING_COMPANIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.delivery_method === 'delivery' ? 'Calle y Número *' : 'Dirección (opcional)'}
                    </label>
                    <input
                      type="text"
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder={formData.delivery_method === 'delivery' ? 'Ej: Av. Libertador 1234' : 'Tu dirección (opcional)'}
                    />
                    {formData.delivery_method === 'pickup' && (
                      <p className="text-xs text-gray-500 mt-1">📍 Te avisaremos cuando esté listo para retirar en nuestro local de San Juan</p>
                    )}
                    {formData.delivery_method === 'delivery' && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-xs text-amber-800">
                          <strong>🚚 Envío:</strong> El costo del transporte <strong>no está incluido</strong> en este pago. Se abona en destino al recibir o retirar el paquete según las tarifas de {formData.shipping_company}.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      name="customer_notes"
                      value={formData.customer_notes}
                      onChange={handleChange}
                      rows={3}
                      className="input-field"
                      placeholder="Instrucciones especiales, horario preferido, etc."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn-primary w-full mt-6 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </form>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tu Pedido</h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>${total.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío:</span>
                    <span className="font-medium text-amber-600">Pago en Destino</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                    <span>Total a pagar hoy:</span>
                    <span className="text-sky-600">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-sky-50 rounded-lg">
                  <p className="text-sm text-sky-800">
                    <strong>✓</strong> Te contactaremos para confirmar tu pedido y coordinar la entrega
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
