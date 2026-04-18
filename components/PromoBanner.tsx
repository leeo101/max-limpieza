'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Truck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentText, setCurrentText] = useState(0);

  const banners = [
    { text: "🚚 ¡ENVÍO GRATIS en compras superiores a $200.000!", icon: <Truck size={14} />, color: "bg-sky-600" },
    { text: "💵 10% OFF pagando en EFECTIVO en el local", icon: <Sparkles size={14} />, color: "bg-emerald-600" },
    { text: "🕒 Despachamos tu pedido en menos de 24hs hábiles", icon: <Clock size={14} />, color: "bg-amber-600" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`relative w-full ${banners[currentText].color} text-white transition-colors duration-500 overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center min-h-[40px]">
          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-black uppercase tracking-[0.15em] animate-in fade-in slide-in-from-bottom-1 transition-all">
            <span className="hidden sm:inline-block animate-pulse">{banners[currentText].icon}</span>
            <span className="text-center">{banners[currentText].text}</span>
          </div>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
