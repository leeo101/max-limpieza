'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search, Ghost } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 bg-sky-500 blur-[80px] opacity-20 animate-pulse" />
              <div className="relative z-10 w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl border border-gray-100">
                <Ghost size={64} className="text-sky-500 animate-bounce" strokeWidth={1.5} />
              </div>
              <span className="absolute -bottom-4 -right-4 bg-gray-900 text-white px-4 py-2 rounded-2xl font-black text-4xl shadow-2xl">404</span>
            </div>

            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-4">
              Página no encontrada
            </h1>
            <p className="text-gray-500 font-medium mb-12 max-w-xs mx-auto">
              Lo sentimos, parece que el producto o la página que buscas se ha esfumado como el detergente.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-3 py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
              >
                <Home size={18} />
                Regresar al Inicio
              </Link>
              <Link
                href="/tienda"
                className="flex items-center justify-center gap-3 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
              >
                <Search size={18} />
                Ir a la Tienda
              </Link>
            </div>
            
            <button 
              onClick={() => window.history.back()}
              className="mt-8 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto hover:text-sky-500 transition-colors"
            >
              <ArrowLeft size={14} /> Volver atrás
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
