'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Drawer from './ui/Drawer';

export default function MiniCart() {
  const { 
    cart, 
    isMiniCartOpen, 
    setMiniCartOpen, 
    removeFromCart, 
    updateQuantity, 
    cartTotal 
  } = useStore();

  const total = cartTotal();
  const freeShippingThreshold = 50000; // Example threshold
  const progress = Math.min((total / freeShippingThreshold) * 100, 100);

  return (
    <Drawer
      isOpen={isMiniCartOpen}
      onClose={() => setMiniCartOpen(false)}
      title="Tu Carrito"
    >
      <div className="flex flex-col h-full">
        {cart.length > 0 ? (
          <>
            {/* Free Shipping Progress */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span className={total >= freeShippingThreshold ? 'text-emerald-600' : 'text-gray-500'}>
                  {total >= freeShippingThreshold 
                    ? '¡Tenés envío gratis!' 
                    : `Te faltan $${(freeShippingThreshold - total).toLocaleString('es-AR')} para el envío gratis`}
                </span>
                <span className="text-gray-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-contain w-full h-full p-2 group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sky-600 font-extrabold text-sm mt-0.5">${item.price.toLocaleString('es-AR')}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md text-gray-500 transition-all font-bold"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md text-gray-500 transition-all font-bold"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary */}
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-bold text-gray-900">${total.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-[10px] text-gray-500">Envío</span>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">
                    {total >= freeShippingThreshold ? 'Bonificado' : 'Pago en destino'}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-sky-600 tracking-tighter">${total.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="grid gap-3">
                <Link
                  href="/checkout"
                  onClick={() => setMiniCartOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-sky-600 active:scale-95 transition-all shadow-xl shadow-sky-500/20"
                >
                  Confirmar compra
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/carrito"
                  onClick={() => setMiniCartOpen(false)}
                  className="flex items-center justify-center w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-900 transition-colors"
                >
                  Ver carrito completo
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-gray-200" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Tu carrito está vacío</h4>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Parece que todavía no agregaste nada. ¡Explorá nuestras ofertas!</p>
            <Link
              href="/tienda"
              onClick={() => setMiniCartOpen(false)}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-sky-500 transition-all shadow-lg"
            >
              Ir a la tienda
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}
