'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import { Folder, Check, Zap, DollarSign, MessageCircle, Droplets, SprayCan, FlaskConical, ShieldCheck, Car, Shirt, Star, ChevronRight, type LucideIcon } from 'lucide-react';

// Icon/Image mapping for categories
const categoryContent: Record<string, LucideIcon | string> = {
  'detergentes': '/categories/detergentes.png',
  'desengrasantes': '/categories/desengrasantes.png',
  'perfuminas': '/categories/perfuminas.png',
  'limpieza-automotriz': '/categories/limpieza-automotriz.png',
  'desinfectantes': '/categories/desinfectantes.png',
  'accesorios': '/categories/accesorios.png',
  'jabon-ropa': '/categories/jabon-ropa.png',
};

function getCategoryContent(slug: string): LucideIcon | string {
  return categoryContent[slug] || Folder;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category_name?: string;
  bestseller: number;
  featured: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Maria Rodriguez',
    role: 'Dueno de empresa de limpieza',
    initials: 'MR',
    text: 'Llevo 2 anos comprando en MAX Limpieza y la calidad de sus productos es inmejorable. Mis clientes quedan encantados con los resultados. Los precios son los mejores del mercado.',
  },
  {
    name: 'Carlos Gutierrez',
    role: 'Administrador de oficinas',
    initials: 'CG',
    text: 'Desde que empezamos a usar los productos de MAX, nuestras oficinas impecan todo el dia. La entrega es rapida y el servicio al cliente excelente. Totalmente recomendado.',
  },
  {
    name: 'Ana Martinez',
    role: 'Ama de casa',
    initials: 'AM',
    text: 'Encontre productos de limpieza profesional a precios accesibles. Mi casa queda reluciente y rinden mucho mas que los del supermercado. Ya no compro en otro lado.',
  },
  {
    name: 'Roberto Sanchez',
    role: 'Gerente de hotel',
    initials: 'RS',
    text: 'La linea de productos para hoteles es fantastica. Nuestros huespedes siempre comentan lo limpio y fresco que huele todo. MAX se convirtio en nuestro proveedor principal.',
  },
  {
    name: 'Laura Fernandez',
    role: 'Propietaria de taller mecanico',
    initials: 'LF',
    text: 'Los desengrasantes y productos automotrices son de primera calidad. Limpian al instante y no danan las superficies. Excelente relacion precio-calidad.',
  },
  {
    name: 'Diego Lopez',
    role: 'Encargado de restaurante',
    initials: 'DL',
    text: 'La higiene es fundamental en mi negocio. Con los desinfectantes y limpiadores de MAX cumplimos todas las normas sanitarias sin gastar de mas. Muy satisfecho.',
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (productsData.success) {
          setFeaturedProducts(productsData.data.filter((p: Product) => p.featured));
          setBestsellerProducts(productsData.data.filter((p: Product) => p.bestseller));
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <Hero />

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const content = getCategoryContent(category.slug);
              return (
                <Link
                  key={category.id}
                  href={`/tienda?category=${category.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 bg-white rounded-[32px] border border-gray-100 flex items-center justify-center overflow-hidden group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-sky-500/10 group-hover:border-sky-100 transition-all duration-500 transform group-hover:-translate-y-2">
                    {typeof content === 'string' ? (
                      <img src={content} alt={category.name} className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                        {/* @ts-expect-error - Dynamic content component type mismatch */}
                        <content className="w-6 h-6 text-sky-500" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-widest group-hover:text-sky-600 transition-colors">{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] mb-3">Colección Premium</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">Productos Destacados</h2>
            </div>
            <Link href="/tienda" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-sky-600 transition-all group">
              Ver Catálogo Completo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-3">Los Favoritos</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">Más Vendidos 🔥</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {bestsellerProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Testimonials Carousel */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Voces de nuestra comunidad</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Miles de profesionales y hogares confían en la eficacia de MAX Limpieza
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Carousel Content */}
            <div className="relative min-h-[320px] sm:min-h-[280px] md:min-h-[250px] h-auto">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentTestimonial
                      ? 'opacity-100 translate-x-0 scale-100'
                      : 'opacity-0 translate-x-full scale-95 pointer-events-none'
                    }`}
                >
                  <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl border border-sky-100 relative flex flex-col justify-center">
                    <div className="absolute top-6 left-8 opacity-10">
                      <svg width="60" height="45" viewBox="0 0 60 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.1429 0L24.2857 7.25806C16.4286 16.6935 15.7143 23.2258 15.7143 27.5806H25.7143V45H0V28.3065C0 12.3387 7.85714 2.90323 17.1429 0ZM51.4286 0L58.5714 7.25806C50.7143 16.6935 50 23.2258 50 27.5806H60V45H34.2857V28.3065C34.2857 12.3387 42.1429 2.90323 51.4286 0Z" fill="#0EA5E9" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-base sm:text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6 relative z-10">
                      &quot;{testimonial.text}&quot;
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-sky-50">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                        <p className="text-sky-600 font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-sky-500 w-8' : 'bg-gray-300 hover:bg-sky-300'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows (Hidden on small screens) */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 hidden lg:flex w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg text-gray-400 hover:text-sky-500 hover:shadow-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 hidden lg:flex w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg text-gray-400 hover:text-sky-500 hover:shadow-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features/Benefits */}
      <section className="py-16 bg-gradient-to-r from-sky-500 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calidad Garantizada</h3>
              <p className="text-sky-100">Productos profesionales de alta calidad</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Entrega Rápida</h3>
              <p className="text-sky-100">Recibe tu pedido en 24-48 horas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mejores Precios</h3>
              <p className="text-sky-100">Precios competitivos y ofertas especiales</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Necesitas ayuda con tu pedido?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Contáctanos directamente por WhatsApp y te asesoramos
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000'}?text=Hola!%20Necesito%20ayuda%20con%20mi%20pedido`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            Contactar por WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
