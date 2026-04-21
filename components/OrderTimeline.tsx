'use client';

import { Check, Truck, Package, Clock, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const steps = [
    { id: 'pending', label: 'Pendiente', icon: Clock },
    { id: 'confirmed', label: 'Confirmado', icon: Check },
    { id: 'shipped', label: 'Enviado', icon: Truck },
    { id: 'delivered', label: 'Entregado', icon: Package },
  ];

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 mt-4">
        <XCircle size={20} />
        <span className="text-xs font-black uppercase tracking-widest">Pedido Cancelado</span>
      </div>
    );
  }

  const getStatusIndex = (s: string) => {
    const indices: Record<string, number> = {
      'pending': 0,
      'confirmed': 1,
      'shipped': 2,
      'delivered': 3
    };
    return indices[s] ?? 0;
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="mt-6 mb-2">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-sky-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-out" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-110' 
                    : 'bg-white text-gray-300 border-2 border-gray-100'
                } ${isCurrent ? 'ring-4 ring-sky-100 animate-pulse' : ''}`}
              >
                <Icon size={16} strokeWidth={3} />
              </div>
              <span 
                className={`text-[9px] font-black uppercase tracking-tighter mt-2 transition-colors duration-500 ${
                  isCompleted ? 'text-sky-600' : 'text-gray-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
