'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import StarRating from '@/components/StarRating';
import { 
  ShoppingBag, 
  MessageCircle, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RefreshCcw,
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  images: string | null;
  category_name?: string;
  category_id?: string;
  bestseller: number;
  featured: number;
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Store actions
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isFavorite = isInWishlist(productId);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const allProducts = data.data as Product[];
          const found = allProducts.find((p) => p.id === productId);
          if (found) {
            setProduct(found);
            // Fetch related products (same category, different ID)
            const related = allProducts
              .filter(p => p.category_id === found.category_id && p.id !== found.id)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [productId]);

  const handleShare = () => {
    navigator.share({
      title: product?.name,
      text: product?.description,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado al portapapeles');
    });
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492645630948';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Me interesa el producto: ${product?.name} - $${product?.price}`)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null; // Or custom 404

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Navigation / Mobile Header */}
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-500 hover:text-sky-600 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
            <div className="flex gap-2">
              <button onClick={handleShare} className="p-2.5 bg-gray-50 text-gray-400 hover:text-sky-600 rounded-full transition-colors">
                <Share2 size={18} />
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full transition-all ${isFavorite ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400 hover:text-rose-500'}`}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-50 rounded-[40px] overflow-hidden group">
                {product.image ? (
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full p-12 flex items-center justify-center"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-8 md:p-12 hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ShoppingBag size={80} strokeWidth={1} />
                  </div>
                )}
                
                {product.bestseller === 1 && (
                  <span className="absolute top-8 left-8 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">🔥 Más vendido</span>
                )}
              </div>

              {/* Thumbnails (Simulated for now) */}
              <div className="flex gap-3 px-2 overflow-x-auto pb-2 scrollbar-hide">
                {[product.image, product.image, product.image].filter(Boolean).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-gray-50 ${activeImage === idx ? 'border-sky-500 ring-4 ring-sky-500/10' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img!} alt="Vista" fill className="object-contain p-3" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col pt-4 lg:pt-0">
              <div className="space-y-4 mb-8">
                {product.category_name && (
                  <span className="inline-block px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {product.category_name}
                  </span>
                )}
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9]">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <StarRating rating={5} size="sm" />
                    <span className="text-xs font-black text-gray-400 ml-1">(12 reseñas)</span>
                  </div>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">En Stock</span>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Precio de lista</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-sky-600 tracking-tighter leading-none">
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                  <span className="text-gray-300 line-through font-bold text-xl uppercase tracking-tighter">
                    ${(product.price * 1.25).toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-3">✓ 10% OFF pagando con transferencia</p>
              </div>

              <div className="space-y-6 mb-12">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Descripción del producto</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{product.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FeatureBadge icon={<Truck size={18} />} title="Envío Express" text="Llega en 24-48hs hab." />
                  <FeatureBadge icon={<ShieldCheck size={18} />} title="Garantía MAX" text="Calidad 100% asegurada" />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100 flex-shrink-0">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl text-gray-500 transition-all active:scale-90"
                    >
                      <Minus size={20} className="stroke-[3]" />
                    </button>
                    <span className="w-12 text-center text-lg font-black text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl text-gray-500 transition-all active:scale-90"
                    >
                      <Plus size={20} className="stroke-[3]" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-3 py-5 bg-sky-500 text-white rounded-[20px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-sky-500/20 hover:bg-sky-600 active:scale-95 transition-all"
                  >
                    <ShoppingBag size={20} />
                    Agregar al pedido
                  </button>
                </div>

                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 border-2 border-emerald-500 text-emerald-600 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-emerald-50 transition-all"
                >
                  <MessageCircle size={18} />
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <section className="bg-gray-50 py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <BenefitItem icon={<Truck className="w-10 h-10 text-sky-500" />} title="Envíos a todo el país" text="Despachamos por Correo Argentino, Andreani y más." />
            <BenefitItem icon={<RefreshCcw className="w-10 h-10 text-sky-500" />} title="Devoluciones" text="Si el producto tiene falla, lo reemplazamos sin cargo." />
            <BenefitItem icon={<Check className="w-10 h-10 text-sky-500" />} title="Venta Mayorista" text="Excelentes precios para revendedores e insituciones." />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Productos Relacionados</h2>
              <Link href="/tienda" className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                Ver todo <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function FeatureBadge({ icon, title, text }: { icon: React.ReactNode; title: string, text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="text-sky-500 bg-white p-2.5 rounded-xl shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 truncate">{title}</p>
        <p className="text-[10px] font-bold text-gray-400 truncate">{text}</p>
      </div>
    </div>
  );
}

function BenefitItem({ icon, title, text }: { icon: React.ReactNode; title: string, text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <h4 className="text-base font-black uppercase tracking-tighter text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-500 font-medium max-w-[240px] leading-relaxed">{text}</p>
    </div>
  );
}
