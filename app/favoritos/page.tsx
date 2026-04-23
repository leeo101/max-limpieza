'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  bestseller: number;
  featured: number;
  category_name?: string;
}

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const allProducts = data.data as Product[];
          const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));
          setProducts(wishlistProducts);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [wishlist]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Link 
              href="/tienda" 
              className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-sky-600 transition-all hover:shadow-md"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase">Mis Favoritos</h1>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                {products.length} productos guardados
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse shadow-sm" />
                ))}
              </motion.div>
            ) : products.length > 0 ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-gray-200/50">
                  <Heart size={40} className="text-gray-200" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">No tenés favoritos todavía</h2>
                <p className="text-gray-400 font-bold max-w-sm mb-12 uppercase tracking-wide text-sm">
                  Guardá los productos que más te gustan para encontrarlos rápido después.
                </p>
                <Link 
                  href="/tienda"
                  className="px-10 py-5 bg-sky-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 flex items-center gap-3"
                >
                  <ShoppingBag size={18} />
                  Ir a la tienda
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
