'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, ChevronRight, Droplets, Shirt } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gray-950 text-white">
      {/* Background Image with Overlay */}
      <div className="relative aspect-[21/9] min-h-[400px] md:min-h-[500px] lg:min-h-[600px] w-full">
        <Image
          src="/hero-bg-clean.png"
          alt="Banner de MAX Limpieza"
          fill
          className="object-cover opacity-80 brightness-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-gray-950/40" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-between pb-4">
        {/* Main Title */}
        <div className="mt-6 md:mt-12 text-center px-4 w-full">
          <ScrollReveal direction="up" delay={100}>
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[1.1] max-w-4xl mx-auto drop-shadow-xl">
              Descubre la potencia de nuestras <span className="text-sky-400">fórmulas</span> <br className="hidden sm:block" />
              listas para usar
            </h2>
          </ScrollReveal>
        </div>

        {/* Center Section: Buttons and Map */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16 lg:gap-24">
          {/* Product Buttons */}
          <div className="flex flex-col gap-2.5 w-full max-w-[320px]">
            <ScrollReveal direction="left" delay={200}>
              <HeroButton label="Jabón para ropa" icon={<Shirt className="w-5 h-5" />} href="/tienda?category=jabon-ropa" color="bg-sky-600/20" border="border-sky-500/50" />
            </ScrollReveal>
            <ScrollReveal direction="left" delay={300}>
              <HeroButton label="Detergente" icon={<Droplets className="w-5 h-5" />} href="/tienda?category=detergentes" color="bg-emerald-600/20" border="border-emerald-500/50" />
            </ScrollReveal>
            <ScrollReveal direction="left" delay={400}>
              <HeroButton label="Suavizante" icon={<Droplets className="w-5 h-5" />} href="/tienda?category=suavizantes" color="bg-sky-600/20" border="border-sky-500/50" />
            </ScrollReveal>
          </div>

          {/* Argentina Map & Badge (Right side) */}
          <div className="hidden lg:flex flex-col items-center">
             <ScrollReveal direction="right" delay={300}>
               <div className="relative w-48 h-64 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <MapPin className="w-12 h-12 text-sky-400 mb-2 animate-bounce" />
                    <p className="text-lg font-bold uppercase tracking-widest text-gray-300">Envíos<br/>Nacionales</p>
                  </div>
               </div>
             </ScrollReveal>
          </div>
        </div>

        {/* Bottom Bar */}
        <ScrollReveal direction="up" delay={500} className="w-full">
          <div className="w-full bg-black/80 backdrop-blur-md border-t border-white/10 py-4">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
              <p className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] text-gray-500 text-center">
                Soluciones de limpieza a granel para el hogar y la industria
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm">
                <a href="tel:+542645630948" className="flex items-center gap-2 hover:text-sky-400 transition-colors group">
                  <div className="p-1 bg-sky-500/10 rounded-full">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm tracking-tight">+54 264 563-0948</span>
                </a>

                <a href="https://wa.me/542645630948" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
                  <div className="p-1 bg-emerald-500/10 rounded-full">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm tracking-tight">WhatsApp</span>
                </a>

                <div className="flex items-center gap-2 text-gray-300">
                   <div className="p-1 bg-white/10 rounded-full">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                   </div>
                   <span className="font-bold text-xs sm:text-sm tracking-tight hidden sm:inline">TikTok: MAX limpieza</span>
                   <span className="font-bold text-xs sm:text-sm tracking-tight sm:hidden text-sky-400">TikTok</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function HeroButton({ label, icon, href, color, border }: { label: string; icon: React.ReactNode; href: string; color: string; border: string }) {
  return (
    <Link 
      href={href}
      className={`group relative flex items-center justify-between p-4 ${color} backdrop-blur-md border ${border} rounded-xl hover:scale-105 transition-all duration-300 shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <div className="text-white group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-lg font-bold uppercase tracking-tight">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
