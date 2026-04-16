'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

const combos = [
  {
    id: 'combo-001',
    name: 'Pack Limpieza Total del Hogar',
    description: 'Todo lo que necesitas para una limpieza completa de tu casa',
    price: 3500,
    originalPrice: 4500,
    products: 'Detergente 1L, Desinfectante 1L, Ambientador 500ml',
    savings: 1000,
  },
  {
    id: 'combo-002',
    name: 'Kit Automotriz Premium',
    description: 'Productos profesionales para el cuidado de tu vehículo',
    price: 4200,
    originalPrice: 5500,
    products: 'Shampoo 1L, Cera Líquida, Paño Microfibra',
    savings: 1300,
  },
  {
    id: 'combo-003',
    name: 'Pack Oficina',
    description: 'Mantén tu espacio de trabajo impecable',
    price: 2800,
    originalPrice: 3600,
    products: 'Limpiavidrios 500ml, Desinfectante 500ml, Trapo Multiuso',
    savings: 800,
  },
  {
    id: 'combo-004',
    name: 'Super Pack Industrial',
    description: 'Solución completa para limpieza industrial',
    price: 8500,
    originalPrice: 11000,
    products: 'Desengrasante 5L, Detergente 5L, Desinfectante 5L',
    savings: 2500,
  },
];

export default function CombosPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-8 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">🎉 Combos y Ofertas Especiales</h1>
            <p className="text-lg">Ahorra más comprando en packs</p>
          </div>

          {/* Combos grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {combos.map((combo) => (
              <div key={combo.id} className="card overflow-hidden">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 h-48 flex items-center justify-center">
                  <svg className="w-24 h-24 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{combo.name}</h3>
                    <span className="badge badge-danger">
                      Ahorras ${combo.savings.toLocaleString('es-AR')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{combo.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Incluye:</p>
                    <p className="text-sm text-gray-600">{combo.products}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-gray-500 line-through">
                        ${combo.originalPrice.toLocaleString('es-AR')}
                      </span>
                      <span className="text-3xl font-bold text-sky-600 ml-2">
                        ${combo.price.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Hola!%20Me%20interesa%20el%20combo:%20${encodeURIComponent(combo.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Comprar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
