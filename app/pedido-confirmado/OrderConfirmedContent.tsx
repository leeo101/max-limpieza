'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';

export default function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  
  interface Order {
    id: string;
    total: number;
    status: string;
  }
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'alias' | 'total' | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders?action=get&id=${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrder();
  }, [orderId]);

  const alias = "enzo.09.";
  const titular = "Enzo Leonel Rodriguez";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';

  const handleCopy = (text: string, type: 'alias' | 'total') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header section with icon */}
            <div className="bg-emerald-500 pt-12 pb-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold">¡Pedido Recibido!</h1>
              <p className="mt-2 text-emerald-50 opacity-90">Tu orden #{orderId?.slice(-6).toUpperCase()} está lista para ser abonada.</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                
                {/* Left Side: Order & Payment Info */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-emerald-500 pl-4">Centro de Pago Directo</h2>
                    <p className="text-gray-600 mb-6">Realizá la transferencia a los siguientes datos para confirmar tu pedido:</p>
                    
                    <div className="space-y-4">
                      {/* Total Amount Card */}
                      <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 flex justify-between items-center group">
                        <div>
                          <p className="text-xs text-sky-600 font-bold uppercase tracking-wider">Monto a pagar</p>
                          <p className="text-2xl font-bold text-sky-900">${order?.total.toLocaleString('es-AR')}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(order?.total.toString() || '', 'total')}
                          className="p-2 hover:bg-sky-200 rounded-lg transition-colors relative"
                        >
                          {copied === 'total' ? <Check className="w-6 h-6 text-emerald-600" /> : <Copy className="w-6 h-6 text-sky-600" />}
                          {copied === 'total' && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">Copiado!</span>}
                        </button>
                      </div>

                      {/* Alias Card */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Alias Mercado Pago</p>
                          <p className="text-xl font-mono font-bold text-gray-900">{alias}</p>
                          <p className="text-xs text-gray-400 mt-1">{titular}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(alias, 'alias')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors relative"
                        >
                          {copied === 'alias' ? <Check className="w-6 h-6 text-emerald-600" /> : <Copy className="w-6 h-6 text-gray-600" />}
                          {copied === 'alias' && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">Copiado!</span>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-3">
                    <a 
                      href="https://link.mercadopago.com.ar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Abrir Mercado Pago
                    </a>
                    
                    <a 
                      href={`https://wa.me/${whatsappNumber}?text=Hola!%20Ya%20realicé%20la%20transferencia%20de%20mi%20pedido%20%23${orderId?.slice(-6).toUpperCase()}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Enviar Comprobante
                    </a>
                  </div>
                </div>

                {/* Right Side: QR Code Area */}
                <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200">
                  <div className="bg-white p-4 rounded-xl shadow-md mb-4 group relative">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${alias}`} 
                      alt="QR Transferencia"
                      className="w-48 h-48"
                    />
                    <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                      <QrCode className="w-10 h-10 text-sky-500" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Escaneá para pagar</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Escané con tu billetera virtual (Mercado Pago, BNA+, MODO, etc.) para transferir directamente.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Secondary Info Card */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Sin Comisiones</h4>
              <p className="text-xs text-gray-500">Al transferir, el 100% de tu dinero llega al local.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-600">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Confirmación</h4>
              <p className="text-xs text-gray-500">Recibirás un mail una vez validado el comprobante.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Envío Seguro</h4>
              <p className="text-xs text-gray-500">Coordinaremos el despacho apenas se acredite.</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/tienda" className="text-gray-400 hover:text-sky-500 transition-colors flex items-center justify-center gap-2 text-sm uppercase font-bold tracking-widest">
              ← Seguir Comprando
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

      <Footer />
    </div>
  );
}
