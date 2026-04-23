'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Package, 
  Plus, 
  ChevronRight, 
  Trash2, 
  ArrowLeft, 
  ShoppingBag,
  Sparkles,
  Zap,
  Tag,
  X,
  Loader2
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category_id?: string;
  category_name?: string;
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartSubtotal, discountAmount, appliedCoupon, applyCoupon, removeCoupon, addToCart } = useStore();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const allProducts = data.data as Product[];
          // Filter by "Accesorios" or products under $1500 that are NOT in cart
          const cartIds = cart.map(item => item.id);
          const filtered = allProducts
            .filter(p => (p.category_name === 'Accesorios' || p.price < 1500) && !cartIds.includes(p.id))
            .slice(0, 6);
          setSuggestions(filtered);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    }
    fetchSuggestions();
  }, [cart]);

  const subtotal = cartSubtotal();
  const discount = discountAmount();
  const finalTotal = cartTotal();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cartSubtotal: subtotal })
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(data.data);
        toast.success('Cupón aplicado con éxito');
        setCouponInput('');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al validar cupón');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
          >
            <div className="bg-white w-24 h-24 rounded-[32px] shadow-xl shadow-gray-200/50 flex items-center justify-center mx-auto mb-8 border border-gray-100">
              <ShoppingBag className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">Tu carrito está vacío</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-10 leading-relaxed">¿Todavía no probaste la calidad MAX? Descubrí nuestros mejores productos hoy.</p>
            <Link 
              href="/tienda" 
              className="inline-flex items-center gap-3 bg-sky-500 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
            >
              Ir a la tienda
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Link href="/tienda" className="flex items-center gap-2 text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] mb-4 hover:gap-3 transition-all">
                <ArrowLeft size={14} strokeWidth={3} /> Volver a la tienda
              </Link>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Mi Pedido</h1>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Vaciar todo el carrito?')) clearCart();
              }}
              className="flex items-center gap-2 text-[10px] font-black text-gray-300 hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
            >
              <Trash2 size={14} /> Vaciar pedido completo
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id} 
                    className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-8 relative group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500"
                  >
                    <div className="w-full sm:w-40 h-40 bg-gray-50 rounded-[32px] flex items-center justify-center flex-shrink-0 overflow-hidden relative group/img">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={160}
                          height={160}
                          className="object-contain w-full h-full p-6 mix-blend-multiply group-hover/img:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-200" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between pt-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none group-hover:text-sky-600 transition-colors">{item.name}</h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio unitario: ${item.price.toLocaleString('es-AR')}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-200 hover:text-red-500 transition-colors p-2 bg-gray-50 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-end justify-between mt-8 gap-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-gray-900 transition-all font-black text-lg active:scale-90"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-black text-gray-900 text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-gray-900 transition-all font-black text-lg active:scale-90"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-300 mb-1">Subtotal Item</p>
                          <p className="text-3xl font-black text-gray-900 leading-none tracking-tighter">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Suggestions Section (Cross-selling) */}
              {suggestions.length > 0 && (
                <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-sky-50 rounded-xl text-sky-500">
                      <Sparkles size={20} className="fill-sky-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Completá tu pedido</h2>
                  </div>
                  
                  <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2 -mx-2">
                    {suggestions.map((p) => (
                      <motion.div 
                        whileHover={{ y: -5 }}
                        key={p.id} 
                        className="min-w-[200px] bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 group"
                      >
                        <div className="aspect-square bg-gray-50 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} width={120} height={120} className="object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <Package className="w-10 h-10 text-gray-200" />
                          )}
                          <button 
                            onClick={() => {
                              addToCart(p, 1);
                              toast.success('Agregado con éxito');
                            }}
                            className="absolute bottom-3 right-3 w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 active:scale-90"
                          >
                            <Plus size={20} strokeWidth={3} />
                          </button>
                        </div>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1 mb-1">{p.name}</h4>
                        <p className="text-sm font-black text-sky-600">${p.price.toLocaleString('es-AR')}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-4 relative">
              <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 p-8 md:p-10 sticky top-24 border border-gray-100 overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500" />
                
                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Resumen</h2>

                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                    <span className="text-sm font-bold">${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-500">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                        <Tag size={12} /> {appliedCoupon.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">- ${discount.toLocaleString('es-AR')}</span>
                        <button onClick={removeCoupon} className="text-rose-400 hover:text-rose-600">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-emerald-500">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Envío</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">A calcular</span>
                  </div>
                  
                  {!appliedCoupon && (
                    <div className="pt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="CÓDIGO DE DESCUENTO"
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponInput.trim()}
                          className="bg-gray-900 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 flex items-center justify-center transition-colors"
                        >
                          {isValidatingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Aplicar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] mb-2 leading-none">Total Final</p>
                        <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                          ${finalTotal.toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-3 py-6 bg-sky-500 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-sky-500/20 hover:bg-sky-600 active:scale-95 transition-all group/btn"
                  >
                    Iniciar Checkout
                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/tienda"
                    className="w-full flex items-center justify-center gap-3 py-5 bg-white text-gray-400 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] border border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    Seguir eligiendo
                  </Link>
                </div>

                <div className="mt-10 p-5 bg-sky-50/50 rounded-3xl border border-sky-100/50">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-500 shadow-sm flex-shrink-0">
                      <Zap size={20} className="fill-sky-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.1em] mb-1">Puntos MAX</p>
                      <p className="text-xs font-bold text-gray-500 leading-tight">Sumarás <span className="font-black text-gray-900">{Math.floor(finalTotal / 100)} puntos</span> con esta compra.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
