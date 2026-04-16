import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre Nosotros</h1>
            <p className="text-xl text-sky-50 max-w-3xl">
              Somos una empresa familiar dedicada a la limpieza desde hace más de 15 años
            </p>
          </div>
        </div>

        {/* Story section */}
        <div className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Historia</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    MAX Limpieza nació en 2008 como un emprendimiento familiar. Empezamos vendiendo productos 
                    de limpieza puerta a puerta en nuestro barrio, con la idea de ofrecer productos de calidad 
                    a precios accesibles.
                  </p>
                  <p>
                    Con el tiempo, fuimos creciendo. Hoy tenemos un local propio, un depósito con stock 
                    permanente y una cartera de clientes que confían en nosotros. Pero seguimos manteniendo 
                    esa atención personalizada de los primeros días.
                  </p>
                  <p>
                    Nos especializamos en productos de limpieza para el hogar, la industria y el automotor. 
                    Trabajamos con las mejores marcas y también tenemos nuestra línea propia con precios 
                    aún más competitivos.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-sky-100 to-emerald-100 rounded-lg h-80 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🏪</div>
                  <p className="text-gray-700 font-semibold text-lg">Nuestro local</p>
                  <p className="text-gray-600 text-sm mt-2">Desde 2008</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Lo Que Nos Hace Diferentes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Calidad Garantizada</h3>
                <p className="text-gray-600">
                  Todos nuestros productos pasan por un control de calidad riguroso. Si no estás conforme, 
                  te cambiamos el producto sin preguntas.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Precios Justos</h3>
                <p className="text-gray-600">
                  Creemos en precios accesibles para todos. Hacemos combos y ofertas semanales para 
                  que puedas comprar más por menos.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Atención Personalizada</h3>
                <p className="text-gray-600">
                  Te asesoramos en la elección del producto correcto. No vendemos por vender, 
                  queremos que quedes conforme.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team/CTA section */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Por Qué Elegirnos?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Porque somos un equipo que se preocupa de verdad por tus necesidades de limpieza. 
              Ya sea para tu casa, tu negocio o tu auto, tenemos el producto justo para vos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/tienda"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-8 py-3 rounded-md transition"
              >
                Ver Productos
              </a>
              <a
                href="/contacto"
                className="bg-white border-2 border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold px-8 py-3 rounded-md transition"
              >
                Contactanos
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
