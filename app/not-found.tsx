'use client';

import Link from 'next/link';
import {
  Home,
  ShoppingBag,
  Mail,
  MessageCircle,
  FileQuestion,
  ArrowLeft,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          {/* Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center">
                <FileQuestion className="w-16 h-16 sm:w-20 sm:h-20 text-sky-500" />
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
              <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-1/2 -right-5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* 404 Text */}
          <h1 className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 bg-clip-text text-transparent leading-none mb-4">
            404
          </h1>

          {/* Message */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            &iexcl;Ups! P&aacute;gina no encontrada
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
            La p&aacute;gina que est&aacute;s buscando no existe o fue movida. No te preocupes, te ayudamos a volver al camino.
          </p>

          {/* Primary CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 mb-10"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Inicio
          </Link>

          {/* Helpful Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link
              href="/tienda"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-sky-100 group-hover:bg-sky-200 transition-colors">
                <ShoppingBag className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">Ir a la Tienda</p>
                <p className="text-xs text-gray-500">Ver productos</p>
              </div>
            </Link>

            <Link
              href="/contacto"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">Contacto</p>
                <p className="text-xs text-gray-500">Escríbenos</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-sky-100 group-hover:bg-sky-200 transition-colors">
                <Home className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">Inicio</p>
                <p className="text-xs text-gray-500">P&aacute;gina principal</p>
              </div>
            </Link>

            <a
              href="https://wa.me/5491100000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm">WhatsApp</p>
                <p className="text-xs text-gray-500">Chatea con nosotros</p>
              </div>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
