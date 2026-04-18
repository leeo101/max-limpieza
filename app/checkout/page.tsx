'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { 
  User, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  Package, 
  Truck, 
  ArrowLeft,
  CreditCard,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    if (cart.length === 0 && !loading) {
      router.push('/tienda');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    if (userData) {
      setFormData(prev => ({
        ...prev,
        customer_name: userData.name || '',
        customer_phone: userData.phone || '',
        customer_email: userData.email || '',
        customer_address: userData.address || '',
        customer_city: userData.city || '',
        customer_province: userData.province || 'San Juan',
        customer_postal_code: userData.postal_code || '',
      }));
    }

    setLoading(false);
  }, [cart, router, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const wholesaleTotal = cart
    .filter(item => item.is_wholesale === 1)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const hasWholesale = wholesaleTotal > 0;
  const wholesaleMin = 200000;
  const retailFreeShippingThreshold = 200000;

  const isFreeShipping = hasWholesale 
    ? wholesaleTotal >= wholesaleMin 
    : total >= retailFreeShippingThreshold;

  const wholesaleConditionMet = !hasWholesale || wholesaleTotal >= wholesaleMin;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      nextStep();
      return;
    }

    setSubmitting(true);
    try {
      const userToken = localStorage.getItem('userToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

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
        clearCart();
        router.push(`/pedido-confirmado?id=${result.id}`);
      } else {
        alert('Error al procesar tu pedido. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const steps = [
    { id: 1, label: 'Tus Datos', icon: <User size={18} /> },
    { id: 2, label: 'Entrega', icon: <Truck size={18} /> },
    { id: 3, label: 'Pago', icon: <CreditCard size={18} /> }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header Progress */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Finalizar Compra</h1>
            
            <div className="flex items-center justify-between max-w-2xl mx-auto relative px-2 sm:px-0">
              {/* Line background */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
              {/* Active line progress */}
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-sky-500 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
              
              {steps.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                    ${currentStep >= step.id 
                      ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20' 
                      : 'bg-white border-gray-200 text-gray-400'}
                  `}>
                    {currentStep > step.id ? <CheckCircle2 size={20} /> : step.icon}
                  </div>
                  <span className={`
                    absolute top-12 whitespace-nowrap text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors
                    ${currentStep >= step.id ? 'text-sky-600' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-8">
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 sm:p-10"
                  >
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">1. Datos Personales</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nombre Completo *</label>
                          <input
                            type="text"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                            placeholder="Ej: Juan Pérez"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Teléfono Móvil *</label>
                          <input
                            type="tel"
                            name="customer_phone"
                            value={formData.customer_phone}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                            placeholder="Ej: 264 1234567"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">DNI (Para el transporte) *</label>
                          <input
                            type="text"
                            name="customer_dni"
                            value={formData.customer_dni}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                            placeholder="Ej: 35.123.456"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Correo Electrónico *</label>
                          <input
                            type="email"
                            name="customer_email"
                            value={formData.customer_email}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                            placeholder="tu@email.com"
                          />
                        </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-8">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">2. Entrega y Envío</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'delivery' }))}
                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.delivery_method === 'delivery' ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-500/10' : 'border-gray-100 bg-gray-50 grayscale opacity-60'}`}
                          >
                            <Truck className={formData.delivery_method === 'delivery' ? 'text-sky-500' : 'text-gray-400'} size={32} />
                            <span className="font-black text-xs uppercase tracking-widest">Envío a domicilio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'pickup' }))}
                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.delivery_method === 'pickup' ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-500/10' : 'border-gray-100 bg-gray-50 grayscale opacity-60'}`}
                          >
                            <Package className={formData.delivery_method === 'pickup' ? 'text-sky-500' : 'text-gray-400'} size={32} />
                            <span className="font-black text-xs uppercase tracking-widest">Retiro en local</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Provincia *</label>
                            <select
                              name="customer_province"
                              value={formData.customer_province}
                              onChange={handleChange}
                              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700 appearance-none"
                            >
                              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ciudad *</label>
                            <input
                              type="text"
                              name="customer_city"
                              value={formData.customer_city}
                              onChange={handleChange}
                              required
                              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                              placeholder="Ej: Capital"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">C.P. *</label>
                            <input
                              type="text"
                              name="customer_postal_code"
                              value={formData.customer_postal_code}
                              onChange={handleChange}
                              required
                              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                              placeholder="Ej: 5400"
                            />
                          </div>
                          {formData.delivery_method === 'delivery' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Transporte *</label>
                              <select
                                name="shipping_company"
                                value={formData.shipping_company}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700 appearance-none"
                              >
                                {SHIPPING_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Calle y Altura *</label>
                          <input
                            type="text"
                            name="customer_address"
                            value={formData.customer_address}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                            placeholder="Ej: Av. Rioja 123 Sur"
                          />
                        </div>

                        {formData.delivery_method === 'delivery' && (
                          <div className={`p-4 border rounded-2xl text-xs font-bold flex gap-3 ${isFreeShipping ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                            <Truck size={20} className="flex-shrink-0" />
                            {isFreeShipping ? (
                              <p>¡Tu pedido califica para **Envío Gratis**! Despacharemos por {formData.shipping_company} sin costo adicional.</p>
                            ) : (
                              <p>El envío se abona al recibir o retirar en sucursal según las tarifas de {formData.shipping_company}.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-8">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">3. Pago y Confirmación</h2>
                        
                        <div className="p-8 bg-sky-50 rounded-3xl border border-sky-100 text-center space-y-4">
                          <div className="w-16 h-16 bg-sky-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <MessageCircle size={32} />
                          </div>
                          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Coordinación por WhatsApp</h3>
                          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto font-medium">
                            Al confirmar, te contactaremos por WhatsApp para coordinar el medio de pago preferido.
                          </p>
                          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block mx-auto">
                            🤑 10% OFF pagando en EFECTIVO en el local
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Notas para nosotros</label>
                          <textarea
                            name="customer_notes"
                            value={formData.customer_notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700 resize-none"
                            placeholder="¿Alguna instrucción especial?"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-gray-100">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex items-center justify-center gap-2 px-8 py-4 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-900 transition-colors"
                        >
                          <ArrowLeft size={16} />
                          Volver
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex-1 flex items-center justify-center gap-3 py-5 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-sky-500/20 active:scale-95 transition-all
                          ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600'}
                        `}
                      >
                        {currentStep < 3 ? (
                          <>Siguiente Paso <ChevronRight size={18} /></>
                        ) : (
                          <>{submitting ? 'Procesando...' : 'Confirmar Pedido'} <CheckCircle2 size={18} /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 space-y-6">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter border-b border-gray-50 pb-4">Detalle del Pedido</h3>
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-4 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cant: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-black text-sky-600">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>Subtotal {hasWholesale ? 'General' : ''}</span>
                    <span>${total.toLocaleString('es-AR')}</span>
                  </div>
                  {hasWholesale && (
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>Subtotal Mayorista</span>
                      <span className={wholesaleTotal >= wholesaleMin ? 'text-emerald-600' : 'text-amber-500'}>
                        ${wholesaleTotal.toLocaleString('es-AR')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Envío</span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isFreeShipping ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isFreeShipping ? '¡Bonificado!' : 'Pago en destino'}
                    </span>
                  </div>
                  <div className="pt-4 mt-2 border-t-2 border-gray-50 flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-sky-600 tracking-tighter">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {isFreeShipping ? (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 text-center leading-relaxed">
                      {hasWholesale 
                        ? '¡Pedido Mayorista Confirmado! Tenés despacho bonificado.' 
                        : '¡Felicitaciones! Superaste los $200.000 y el despacho es gratuito.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Para envío gratis</span>
                      <span>${((hasWholesale ? wholesaleMin : retailFreeShippingThreshold) - (hasWholesale ? wholesaleTotal : total)).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sky-500 transition-all duration-1000"
                        style={{ width: `${((hasWholesale ? wholesaleTotal : total) / (hasWholesale ? wholesaleMin : retailFreeShippingThreshold)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
