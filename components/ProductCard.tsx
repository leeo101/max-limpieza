'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart, MessageCircle } from 'lucide-react';
import StarRating from '@/components/StarRating';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category_name?: string;
  bestseller?: boolean | number;
  featured?: boolean | number;
  averageRating?: number;
  reviewCount?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

import { toast } from 'react-hot-toast';

export default function ProductCard({ id, name, description, price, image, category_name, bestseller, featured, averageRating, reviewCount }: ProductCardProps) {
  const addToCart = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: CartItem) => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1, image });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${name} agregado al carrito 🛒`);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';
  const whatsappMessage = encodeURIComponent(`Hola! Me interesa el producto: ${name} - $${price}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="card group">
      <div className="relative">
        <Link href={`/producto/${id}`}>
          <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Package className="w-20 h-20 text-gray-400" />
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {bestseller && (
            <span className="badge badge-warning text-xs">🔥 Más vendido</span>
          )}
          {featured && (
            <span className="badge badge-primary text-xs">⭐ Destacado</span>
          )}
        </div>

        {/* WhatsApp button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors opacity-0 group-hover:opacity-100"
          title="Consultar por WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>

      <div className="p-4">
        {category_name && (
          <span className="text-xs text-sky-600 font-medium uppercase tracking-wide">{category_name}</span>
        )}
        <Link href={`/producto/${id}`}>
          <h3 className="mt-1 text-lg font-semibold text-gray-900 hover:text-sky-600 transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>

        {/* Rating display */}
        {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} size="sm" />
            <span className="text-sm text-gray-600">({reviewCount})</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-sky-600">${price.toLocaleString('es-AR')}</span>
          </div>
          <button
            onClick={addToCart}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
