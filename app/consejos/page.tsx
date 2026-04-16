'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const tips = [
  {
    id: 'tip-001',
    title: 'Cómo limpiar pisos de cerámica correctamente',
    content: 'Para limpiar pisos de cerámica de forma efectiva, utiliza agua tibia con detergente líquido. Limpia en secciones y cambia el agua cuando esté sucia. Para brillo extra, agrega una cucharada de vinagre blanco.',
    category: 'Pisos',
    icon: '🏠',
  },
  {
    id: 'tip-002',
    title: 'Elimina manchas de grasa en la cocina',
    content: 'Aplica desengrasante industrial directamente sobre la mancha, deja actuar 5 minutos y frota con esponja no abrasiva. Para manchas difíciles, repite el proceso.',
    category: 'Cocina',
    icon: '🍳',
  },
  {
    id: 'tip-003',
    title: 'Mantén tu auto limpio por más tiempo',
    content: 'Lava tu auto semanalmente con shampoo automotriz (nunca uses detergente). Seca con paño de microfibra para evitar manchas de agua. Aplica cera protectora mensual.',
    category: 'Automotriz',
    icon: '🚗',
  },
  {
    id: 'tip-004',
    title: 'Desinfecta baños como profesional',
    content: 'Usa desinfectante antibacterial en todas las superficies. Deja actuar 10 minutos antes de enjuagar. No olvides las manijas de puertas y grifos.',
    category: 'Baños',
    icon: '🚿',
  },
  {
    id: 'tip-005',
    title: 'Limpia vidrios sin rayas',
    content: 'Mezcla limpiavidrios con agua en partes iguales. Usa papel de diario o paño de microfibra para secar. Limpia en movimientos circulares para mejor resultado.',
    category: 'Vidrios',
    icon: '🪟',
  },
  {
    id: 'tip-006',
    title: 'Organiza tu lavandería eficientemente',
    content: 'Separa la ropa por colores y tipo de tela. Usa la cantidad correcta de detergente según la carga. Para prendas delicadas, usa agua fría y ciclo suave.',
    category: 'Lavandería',
    icon: '👕',
  },
  {
    id: 'tip-007',
    title: 'Elimina malos olores del hogar',
    content: 'Usa bicarbonato de sodio en alfombras antes de aspirar. Coloca recipientes con vinagre blanco en habitaciones. Usa ambientadores naturales con aceites esenciales.',
    category: 'Ambientación',
    icon: '🌸',
  },
  {
    id: 'tip-008',
    title: 'Limpieza profunda de colchones',
    content: 'Aspira el colchón regularmente. Espolvorea bicarbonato, deja actuar 2 horas y aspira. Voltea el colchón cada 3 meses para mayor durabilidad.',
    category: 'Dormitorio',
    icon: '🛏️',
  },
];

const categories = ['Todos', ...Array.from(new Set(tips.map(tip => tip.category)))];

export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredTips = selectedCategory === 'Todos' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-8 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">💡 Consejos de Limpieza</h1>
            <p className="text-lg">Tips profesionales para mantener tu hogar impecable</p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tips grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map((tip) => (
              <div key={tip.id} className="card p-6">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <span className="badge badge-primary text-xs mb-2 inline-block">{tip.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{tip.title}</h3>
                <p className="text-gray-600 leading-relaxed">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
