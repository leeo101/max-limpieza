'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, ShieldCheck, Loader2, Star } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage('Suscripcion exitosa!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al suscribirse');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexion. Intenta de nuevo.');
    }

    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 4000);
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Newsletter Section */}
        <div className="relative mb-16 overflow-hidden rounded-3xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-500 to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider mb-4">
                  <Star className="w-3 h-3 fill-current" />
                  Próximamente beneficios exclusivos
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  Unite al Club <span className="text-sky-100">MAX</span>
                </h3>
                <p className="text-white/80 text-lg max-w-md">
                  Recibí las mejores ofertas, lanzamientos y consejos de limpieza profesional directo en tu bandeja.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-200" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Tu mejor email..."
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all backdrop-blur-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-4 rounded-2xl bg-white text-sky-600 font-bold hover:bg-sky-50 transition-all shadow-xl shadow-sky-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Sumarme ahora'
                    )}
                  </button>
                </form>
                {message && (
                  <div className={`flex items-center gap-2 text-sm font-bold ${status === 'success' ? 'text-emerald-300' : 'text-rose-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'success' ? 'bg-emerald-300' : 'bg-rose-200'} animate-pulse`}></div>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="MAX Limpieza Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold">MAX Limpieza</h3>
                <p className="text-xs text-gray-400">Productos de limpieza</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Tu tienda de confianza para artículos de limpieza de calidad. Productos profesionales para hogar y empresa.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li><Link href="/tienda" className="text-gray-400 hover:text-white transition-colors text-sm">Productos</Link></li>
              <li><Link href="/combos" className="text-gray-400 hover:text-white transition-colors text-sm">Combos</Link></li>
              <li><Link href="/consejos" className="text-gray-400 hover:text-white transition-colors text-sm">Consejos</Link></li>
              <li><Link href="/calculadora" className="text-gray-400 hover:text-white transition-colors text-sm">Calculadora</Link></li>
              <li><Link href="/nosotros" className="text-gray-400 hover:text-white transition-colors text-sm">Nosotros</Link></li>
              <li><Link href="/contacto" className="text-gray-400 hover:text-white transition-colors text-sm">Contacto</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/tienda?category=detergentes" className="hover:text-white transition-colors">Detergentes</Link></li>
              <li><Link href="/tienda?category=desengrasantes" className="hover:text-white transition-colors">Desengrasantes</Link></li>
              <li><Link href="/tienda?category=perfuminas" className="hover:text-white transition-colors">Perfuminas</Link></li>
              <li><Link href="/tienda?category=limpieza-automotriz" className="hover:text-white transition-colors">Limpieza Automotriz</Link></li>
              <li><Link href="/tienda?category=jabon-ropa" className="hover:text-white transition-colors">Jabón de Ropa</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                admin@maxlimpieza.com
              </li>
            </ul>
          </div>
        </div>

        {/* Admin/Vendor access */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} MAX Limpieza. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/terminos" className="text-sm text-gray-500 hover:text-sky-400 transition-colors">
                Terminos y Condiciones
              </Link>
              <Link href="/privacidad" className="text-sm text-gray-500 hover:text-sky-400 transition-colors">
                Politica de Privacidad
              </Link>
              <Link
                href="/admin/login"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-400 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Acceso Vendedores
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
