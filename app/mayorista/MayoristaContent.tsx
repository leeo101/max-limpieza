'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import { 
  Check, 
  TrendingUp, 
  Truck, 
  ShieldCheck, 
  Zap,
  Info,
  Package,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category_name?: string;
  is_wholesale: number;
}

export default function MayoristaContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWholesaleProducts() {
      try {
        const res = await fetch('/api/products?activeOnly=true');
        const data = await res.json();
        if (data.success) {
          // Filter only wholesale products
          const wholesale = data.data.filter((p: Product) => p.is_wholesale === 1);
          setProducts(wholesale);
        }
      } catch (error) {
        console.error('Error fetching wholesale products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWholesaleProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Wholesale Hero Section */}
        <section className="bg-gray-950 overflow-hidden relative pt-20 pb-32 px-4">
          <div className="absolute inset-0 bg-sky-500/10 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(2,132,199,0.2),transparent_70%)]" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 backdrop-blur-md rounded-full text-sky-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-sky-500/30"
                >
                  <TrendingUp className="w-3 h-3" />
                  División Industrial & Mayorista
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8"
                >
                  Suministros <span className="text-sky-500 text-outline-white">Profesionales</span> <br />
                  A Granel
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mb-10 leading-relaxed"
                >
                  Abastecemos a revendedores, lavaderos, hoteles e instituciones con pastas base y concentrados de máxima pureza. 
                </motion.p>

                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.3 }}
                   className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mínimo de Compra</p>
                      <p className="text-lg font-black text-white leading-none">$200.000 ARS</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Envío</p>
                      <p className="text-lg font-black text-emerald-400 leading-none">Bonificado 100%</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="flex-1 relative hidden lg:block">
                <div className="w-full aspect-square bg-gradient-to-br from-sky-500/20 to-transparent rounded-[80px] rotate-3 relative overflow-hidden border border-white/5">
                   <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Package className="w-64 h-64 text-white" strokeWidth={1} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 bg-white border-b border-gray-100">
           <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
              <WholesaleBenefit icon={<Check className="w-6 h-6 text-sky-500" />} title="Máximo Rendimiento" text="Fórmulas concentradas para dilución profesional." />
              <WholesaleBenefit icon={<ShieldCheck className="w-6 h-6 text-sky-500" />} title="Calidad Certificada" text="Garantizamos la estabilidad de cada lote." />
              <WholesaleBenefit icon={<Zap className="w-6 h-6 text-sky-500" />} title="Stock Permanente" text="Envíos inmediatos desde nuestro centro logístico." />
              <WholesaleBenefit icon={<Info className="w-6 h-6 text-sky-500" />} title="Asesoría Técnica" text="Te ayudamos a fabricar tus propios productos." />
           </div>
        </section>

        {/* Wholesale Products */}
        <section className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <Breadcrumbs items={[{ label: 'Wholesale', href: '/mayorista' }]} className="mb-6" />
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-4">Catálogo Mayorista</h2>
                <div className="flex items-center gap-2 text-sky-600">
                   <Info size={16} />
                   <p className="text-xs font-bold uppercase tracking-widest">Precios especiales para volumen</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} bestseller={0} featured={1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No hay productos disponibles actualmente</h3>
              </div>
            )}
          </div>
        </section>

        {/* CTA Contact */}
        <section className="py-24 bg-white overflow-hidden relative">
           <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-8">
                ¿Buscas una solución <br /> <span className="text-sky-600">personalizada?</span>
              </h2>
              <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto font-medium">
                Si eres fabricante o necesitas volúmenes superiores, contacta con nuestro equipo comercial para obtener una cotización a medida.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <a 
                   href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492645630948'}?text=Hola!%20Deseo%20información%20para%20compras%20mayoristas.`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="px-10 py-5 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-sky-600/20 hover:bg-sky-700 active:scale-95 transition-all flex items-center gap-3"
                 >
                   Hablar con un asesor <ArrowRight size={18} />
                 </a>
              </div>
           </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .text-outline-white {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}</style>
    </div>
  );
}

function WholesaleBenefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-6 hover:bg-gray-50 rounded-[32px] transition-colors group">
      <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
