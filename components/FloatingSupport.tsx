'use client';

import { useState } from 'react';
import { MessageCircle, Phone, MapPin, X } from 'lucide-react';

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492645630948';

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <SupportItem 
            href={`https://wa.me/${whatsappNumber}`}
            icon={<MessageCircle className="w-5 h-5" />}
            label="WhatsApp"
            color="bg-emerald-500"
          />
          <SupportItem 
            href="tel:+542645630948"
            icon={<Phone className="w-5 h-5" />}
            label="Llamar"
            color="bg-sky-500"
          />
          <SupportItem 
            href="/contacto"
            icon={<MapPin className="w-5 h-5" />}
            label="Ubicación"
            color="bg-amber-500"
          />
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-br from-sky-500 to-emerald-500 hover:scale-110 active:scale-95'
        }`}
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-sky-400 opacity-20 pointer-events-none"></div>
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
          </div>
        )}
      </button>
    </div>
  );
}

function SupportItem({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 group"
    >
      <span className="px-3 py-1.5 bg-white shadow-lg rounded-lg text-sm font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100">
        {label}
      </span>
      <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center shadow-lg transform group-hover:-translate-y-1 transition-transform`}>
        {icon}
      </div>
    </a>
  );
}
