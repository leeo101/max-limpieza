'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useStore();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Tienda', href: '/tienda', icon: ShoppingBag },
    { name: 'Carrito', href: '/carrito', icon: ShoppingCart, badge: cartCount },
    { name: 'Cuenta', href: '/mi-cuenta', icon: User },
  ];

  // Don't show on admin routes or checkout
  if (pathname?.startsWith('/admin') || pathname === '/checkout') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 pb-safe-offset-2 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[64px] py-1 transition-colors ${
                isActive ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-transform ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-black min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 border-2 border-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight mt-1">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
