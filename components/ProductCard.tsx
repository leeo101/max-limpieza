import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, MessageCircle, Heart, Package } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { useStore } from '@/store/useStore';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category_name?: string;
  bestseller: number;
  featured: number;
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductCard({ id, name, description, price, image, category_name, bestseller, featured, averageRating, reviewCount }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isFavorite = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, price, image });
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492645630948';
  const whatsappMessage = encodeURIComponent(`Hola! Me interesa el producto: ${name} - $${price}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-900/5 transition-all duration-500">
      <div className="relative">
        <Link href={`/producto/${id}`}>
          <div className="relative aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <Package className="w-16 h-16 text-gray-200" />
            )}
            
            {/* Overlay for desktop hover stats or actions could go here */}
            <div className="absolute inset-0 bg-sky-900/0 group-hover:bg-sky-900/5 transition-colors duration-500" />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          {bestseller && (
            <span className="px-2 py-1 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">🔥 TOP</span>
          )}
          {featured && (
            <span className="px-2 py-1 bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">⭐ PROMO</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(id); }}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-all duration-300 ${
            isFavorite ? 'bg-rose-500 text-white translate-y-0 scale-100' : 'bg-white text-gray-300 hover:text-rose-500 translate-y-2 lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:translate-y-0'
          }`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add Button (Desktop only hover) */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-4 right-4 py-3 bg-white/90 backdrop-blur-md text-sky-600 font-black text-xs uppercase tracking-widest rounded-xl shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden lg:flex items-center justify-center gap-2 hover:bg-sky-600 hover:text-white"
        >
          <ShoppingCart size={14} />
          Agregar rápido
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex justify-between items-start mb-2">
          {category_name && (
            <span className="text-[10px] text-sky-600 font-black uppercase tracking-widest">{category_name}</span>
          )}
          {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-400">{averageRating.toFixed(1)}</span>
              <div className="flex text-amber-400">
                <StarRating rating={Math.round(averageRating)} size="xs" />
              </div>
            </div>
          )}
        </div>

        <Link href={`/producto/${id}`}>
          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight hover:text-sky-600 transition-colors line-clamp-1 mb-2">
            {name}
          </h3>
        </Link>
        
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter leading-none">Precio</span>
            <span className="text-xl sm:text-2xl font-black text-sky-600 tracking-tighter mt-1">
              ${price.toLocaleString('es-AR')}
            </span>
          </div>
          
          <div className="flex gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-90 lg:hidden"
            >
              <MessageCircle size={20} />
            </a>
            <button
              onClick={handleAddToCart}
              className="p-3 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 lg:p-4"
            >
              <ShoppingCart size={20} className="lg:hidden" />
              <span className="hidden lg:inline text-xs font-black uppercase tracking-widest px-2">Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
