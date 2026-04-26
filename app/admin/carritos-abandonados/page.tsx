'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Mail, Clock, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AbandonedCart {
  id: string;
  user_email: string;
  user_name: string;
  items: string;
  total: number;
  updated_at: string;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      const res = await fetch('/api/cart/sync');
      const data = await res.json();
      if (data.success) {
        setCarts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getHoursSince = (dateString: string) => {
    const hours = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60);
    return Math.floor(hours);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-sky-600 transition-colors border border-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Carritos Abandonados</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Recupera ventas contactando a los clientes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : carts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-black text-gray-900 uppercase">No hay carritos abandonados</p>
            <p className="text-gray-400 text-sm font-medium">Todos tus clientes están finalizando sus compras.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="pb-4 font-black">Cliente</th>
                  <th className="pb-4 font-black">Monto</th>
                  <th className="pb-4 font-black">Tiempo</th>
                  <th className="pb-4 font-black">Productos</th>
                  <th className="pb-4 font-black text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {carts.map((cart) => (
                  <tr key={cart.id} className="group hover:bg-sky-50/50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-gray-900 text-sm">{cart.user_name || 'Sin nombre'}</p>
                      <p className="text-xs text-gray-500">{cart.user_email}</p>
                    </td>
                    <td className="py-4">
                      <span className="font-black text-sky-600">${cart.total.toLocaleString('es-AR')}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md w-max">
                        <Clock size={14} /> Hace {getHoursSince(cart.updated_at)}hs
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-gray-500 font-medium line-clamp-1 max-w-[200px]">
                        {(() => {
                          try {
                            return JSON.parse(cart.items).map((i: any) => i.name).join(', ');
                          } catch {
                            return 'Error leyendo items';
                          }
                        })()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <a 
                        href={`mailto:${cart.user_email}?subject=¿Olvidaste algo en MAX Limpieza?&body=Hola ${cart.user_name}, vimos que dejaste algunos productos en tu carrito. Si necesitas ayuda para finalizar tu compra, no dudes en responder este correo o escribirnos por WhatsApp.`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-colors shadow-sm"
                      >
                        <Mail size={16} /> Contactar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
