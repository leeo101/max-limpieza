'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  ChevronDown,
  ShoppingCart,
  Menu,
  X,
  Package,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

import { useStore } from '@/store/useStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  // Zustand Store
  const { cart, setMiniCartOpen } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const search = async () => {
        try {
          const res = await fetch(`/api/products`);
          const data = await res.json();
          if (data.success) {
            const matches = (data.data as Product[])
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 5);
            setSuggestions(matches);
            setShowSuggestions(true);
          }
        } catch (e) {
          console.error(e);
        }
      };
      const debounceTimer = setTimeout(search, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData && userData !== 'undefined') {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('userUpdated', checkUser);
    return () => window.removeEventListener('userUpdated', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tienda?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="MAX Limpieza Logo"
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">MAX Limpieza</h1>
              <p className="text-xs text-gray-500">Productos de limpieza</p>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full px-5 py-3 pl-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-bold text-gray-700 transition-all placeholder:text-gray-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-14 left-0 w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-[100]"
                >
                  <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Sugerencias</p>
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        router.push(`/producto/${p.id}`);
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-contain p-1" />
                        ) : (
                          <Package className="w-full h-full p-2 text-gray-200" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-sky-600 transition-colors uppercase tracking-tight">{p.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/tienda" className="text-gray-700 hover:text-sky-600 font-medium transition-colors">
              Productos
            </Link>
            <Link href="/combos" className="text-gray-700 hover:text-sky-600 font-medium transition-colors">
              Combos
            </Link>
            <Link href="/consejos" className="text-gray-700 hover:text-sky-600 font-medium transition-colors">
              Consejos
            </Link>
            <Link href="/calculadora" className="text-gray-700 hover:text-sky-600 font-medium transition-colors">
              Calculadora
            </Link>
          </nav>

          {/* User account / Login */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Usuario'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/mi-cuenta"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mi Cuenta
                    </Link>
                    <Link
                      href="/mi-cuenta?tab=orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/iniciar-sesion"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-sky-600 font-medium transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>

          {/* Cart and mobile menu button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMiniCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-sky-600 transition-colors cursor-pointer group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Navegación</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué estás buscando?"
                  className="w-full px-4 py-3 pl-10 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-sky-500 text-gray-900"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>

            <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
              <MobileNavLink href="/tienda" label="Productos" icon={<Package className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="/combos" label="Combos" icon={<ShoppingCart className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="/consejos" label="Consejos" icon={<ChevronDown className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink href="/calculadora" label="Calculadora" icon={<Search className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} />
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user.name || 'Usuario'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/mi-cuenta" className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    Mi Cuenta
                  </Link>
                  <button onClick={handleLogout} className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl">
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link href="/iniciar-sesion" className="flex items-center justify-center gap-2 w-full py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-900/10" onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-all group"
    >
      <div className="text-gray-400 group-hover:text-sky-500 transition-colors">
        {icon}
      </div>
      <span className="font-bold">{label}</span>
      <ChevronDown className="w-4 h-4 ml-auto -rotate-90 opacity-40" />
    </Link>
  );
}
