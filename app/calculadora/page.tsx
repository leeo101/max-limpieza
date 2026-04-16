'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CalculationResult {
  product: string;
  amount: string;
  frequency: string;
  tip: string;
}

export default function CalculatorPage() {
  const [calculatorType, setCalculatorType] = useState<'home' | 'office' | 'car'>('home');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = () => {
    let calculation: CalculationResult;

    if (calculatorType === 'home') {
      if (size === 'small') {
        calculation = {
          product: 'Detergente Líquido',
          amount: '250ml por limpieza',
          frequency: '2-3 veces por semana',
          tip: 'Rinde aproximadamente 40 limpiezas por litro',
        };
      } else if (size === 'medium') {
        calculation = {
          product: 'Detergente Líquido',
          amount: '500ml por limpieza',
          frequency: '3-4 veces por semana',
          tip: 'Rinde aproximadamente 20 limpiezas por litro',
        };
      } else {
        calculation = {
          product: 'Detergente Líquido',
          amount: '750ml por limpieza',
          frequency: '4-5 veces por semana',
          tip: 'Rinde aproximadamente 13 limpiezas por litro',
        };
      }
    } else if (calculatorType === 'office') {
      if (size === 'small') {
        calculation = {
          product: 'Desinfectante Multiuso',
          amount: '100ml por limpieza',
          frequency: 'Diariamente',
          tip: 'Rinde aproximadamente 100 limpiezas por litro',
        };
      } else if (size === 'medium') {
        calculation = {
          product: 'Desinfectante Multiuso + Limpiavidrios',
          amount: '200ml desinfectante + 100ml limpiavidrios',
          frequency: 'Diariamente',
          tip: 'Mantén stock para 2 semanas mínimo',
        };
      } else {
        calculation = {
          product: 'Kit completo de limpieza',
          amount: '500ml desinfectante + 250ml limpiavidrios',
          frequency: 'Diariamente, 2 veces al día',
          tip: 'Considera contratar servicio de limpieza profesional',
        };
      }
    } else {
      if (size === 'small') {
        calculation = {
          product: 'Shampoo Automotriz',
          amount: '50ml por lavado',
          frequency: 'Semanalmente',
          tip: 'Rinde aproximadamente 20 lavados por litro',
        };
      } else if (size === 'medium') {
        calculation = {
          product: 'Shampoo + Cera Automotriz',
          amount: '75ml shampoo + 50ml cera',
          frequency: 'Semanalmente',
          tip: 'Aplica cera cada 2 lavados para mejor protección',
        };
      } else {
        calculation = {
          product: 'Kit Automotriz Completo',
          amount: '100ml shampoo + 75ml cera + desengrasante',
          frequency: 'Semanalmente',
          tip: 'Incluye limpieza de motor cada 3 meses',
        };
      }
    }

    setResult(calculation);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl p-8 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">🧮 Calculadora de Productos</h1>
            <p className="text-lg">Descubre cuánto producto necesitas según tu uso</p>
          </div>

          {/* Calculator */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Configura tu necesidad</h2>
            
            {/* Type selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Qué tipo de espacio vas a limpiar?
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setCalculatorType('home')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    calculatorType === 'home'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">🏠</div>
                  <div className="font-semibold">Hogar</div>
                </button>
                <button
                  onClick={() => setCalculatorType('office')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    calculatorType === 'office'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="font-semibold">Oficina</div>
                </button>
                <button
                  onClick={() => setCalculatorType('car')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    calculatorType === 'car'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">🚗</div>
                  <div className="font-semibold">Automóvil</div>
                </button>
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Qué tamaño tiene el espacio?
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setSize('small')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    size === 'small'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {calculatorType === 'home' && '🏠'}
                    {calculatorType === 'office' && '🏢'}
                    {calculatorType === 'car' && '🚙'}
                  </div>
                  <div className="font-semibold text-sm">
                    {calculatorType === 'home' && 'Pequeño (< 50m²)'}
                    {calculatorType === 'office' && 'Pequeño (< 30m²)'}
                    {calculatorType === 'car' && 'Auto pequeño'}
                  </div>
                </button>
                <button
                  onClick={() => setSize('medium')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    size === 'medium'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {calculatorType === 'home' && '🏡'}
                    {calculatorType === 'office' && '🏬'}
                    {calculatorType === 'car' && '🚗'}
                  </div>
                  <div className="font-semibold text-sm">
                    {calculatorType === 'home' && 'Mediano (50-100m²)'}
                    {calculatorType === 'office' && 'Mediano (30-80m²)'}
                    {calculatorType === 'car' && 'Auto mediano'}
                  </div>
                </button>
                <button
                  onClick={() => setSize('large')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    size === 'large'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {calculatorType === 'home' && '🏰'}
                    {calculatorType === 'office' && '🏢'}
                    {calculatorType === 'car' && '🚐'}
                  </div>
                  <div className="font-semibold text-sm">
                    {calculatorType === 'home' && 'Grande (> 100m²)'}
                    {calculatorType === 'office' && 'Grande (> 80m²)'}
                    {calculatorType === 'car' && 'SUV/Camioneta'}
                  </div>
                </button>
              </div>
            </div>

            {/* Calculate button */}
            <button
              onClick={calculate}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calcular
            </button>

            {/* Result */}
            {result && (
              <div className="mt-6 p-6 bg-gradient-to-r from-sky-50 to-emerald-50 rounded-lg border border-sky-200 animate-scale-in">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Resultado</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-sky-600 font-bold text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Producto recomendado:</p>
                      <p className="text-gray-700">{result.product}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-sky-600 font-bold text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Cantidad por uso:</p>
                      <p className="text-gray-700">{result.amount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-sky-600 font-bold text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Frecuencia:</p>
                      <p className="text-gray-700">{result.frequency}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-xl">💡</span>
                    <div>
                      <p className="font-semibold text-gray-900">Tip adicional:</p>
                      <p className="text-gray-700">{result.tip}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>¿Necesitas estos productos?</strong>
                  </p>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000'}?text=Hola!%20Necesito%20ayuda%20para%20elegir%20productos%20de%20limpieza`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
