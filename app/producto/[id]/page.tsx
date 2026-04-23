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
  Check,
  Star,
  MessageSquare,
  Send
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import JsonLd from '@/components/JsonLd';


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
  averageRating?: number;
  reviewCount?: number;
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isFavorite = isInWishlist(productId);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) setUser(JSON.parse(userData));

    async function fetchDetails() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const allProducts = data.data as Product[];
          const found = allProducts.find((p) => p.id === productId);
          if (found) {
            setProduct(found);
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

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    }

    fetchDetails();
    fetchReviews();
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para opinar');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newComment
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setNewComment('');
        setNewRating(5);
      } else {
        toast.error(data.error || 'Error al enviar opinión');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSubmittingReview(false);
    }
  };

  const galleryImages = product?.images 
    ? JSON.parse(product.images) 
    : [product?.image].filter(Boolean);

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

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {product && (
          <JsonLd 
            data={{
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "image": product.image ? [`${window.location.origin}${product.image}`] : [],
              "description": product.description,
              "sku": product.id,
              "brand": {
                "@type": "Brand",
                "name": "MAX Limpieza"
              },
              "offers": {
                "@type": "Offer",
                "url": typeof window !== 'undefined' ? window.location.href : '',
                "priceCurrency": "ARS",
                "price": product.price,
                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
              },
              "aggregateRating": product.reviewCount && product.reviewCount > 0 ? {
                "@type": "AggregateRating",
                "ratingValue": product.averageRating,
                "reviewCount": product.reviewCount
              } : undefined
            }}
          />
        )}

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
              <div className="relative aspect-square bg-white rounded-[40px] overflow-hidden group border border-gray-100 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full p-8 md:p-12 flex items-center justify-center"
                  >
                    <Image
                      src={galleryImages[activeImage] || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-contain p-8 md:p-12 mix-blend-multiply transition-transform duration-700"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {!!product.bestseller && (
                    <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">🔥 Más vendido</span>
                  )}
                  {!!product.featured && (
                    <span className="bg-sky-500 text-white px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">⭐ PROMO</span>
                  )}
                </div>
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-3 px-2 overflow-x-auto pb-2 scrollbar-hide">
                  {galleryImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${activeImage === idx ? 'border-sky-500 ring-4 ring-sky-500/10 shadow-lg' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                    >
                      <Image src={img} alt={`Vista ${idx + 1}`} fill className="object-contain p-3 mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col pt-4 lg:pt-0">
              <div className="space-y-4 mb-8">
                {product.category_name && (
                  <span className="inline-block px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {product.category_name}
                  </span>
                )}
                <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9]">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <StarRating rating={product.averageRating || 5} size="sm" />
                    <span className="text-xs font-black text-gray-400 ml-1">({product.reviewCount || 0} reseñas)</span>
                  </div>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className={`text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {product.stock > 0 ? 'En Stock' : 'Sin Stock'}
                  </span>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Precio de lista</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-5xl font-black text-sky-600 tracking-tighter leading-none">
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                  <span className="text-gray-300 line-through font-bold text-xl tracking-tighter">
                    ${(product.price * 1.2).toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-3">✓ 10% OFF en efectivo presencial</p>
              </div>

              <div className="space-y-6 mb-12 flex-1">
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
              <div className="space-y-4">
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
                      onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl text-gray-500 transition-all active:scale-90"
                    >
                      <Plus size={20} className="stroke-[3]" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 flex items-center justify-center gap-3 py-5 bg-sky-500 text-white rounded-[20px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-sky-500/20 hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Reviews Section */}
        <section id="reviews" className="bg-gray-50 py-20 mt-12 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Review Summary */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-6">Opiniones de clientes</h2>
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                  <div className="text-center mb-8">
                    <p className="text-6xl font-black text-sky-600 mb-2">{product.averageRating?.toFixed(1) || '0.0'}</p>
                    <div className="flex justify-center mb-2">
                       <StarRating rating={product.averageRating || 0} size="md" />
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Basado en {product.reviewCount || 0} reseñas</p>
                  </div>
                  
                  {user ? (
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Dejanos tu opinión</p>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="flex justify-center gap-2 p-3 bg-gray-50 rounded-2xl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className={`p-1 transition-all ${newRating >= star ? 'text-amber-400 scale-110' : 'text-gray-300'}`}
                            >
                              <Star size={24} fill={newRating >= star ? 'currentColor' : 'none'} strokeWidth={2.5} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Contanos tu experiencia..."
                          required
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500 font-medium text-gray-700 min-h-[100px] outline-none"
                        />
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                        >
                          {submittingReview ? <RefreshCcw size={16} className="animate-spin" /> : <Send size={16} />}
                          Enviar Reseña
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-sky-50 rounded-[28px] border border-sky-100">
                      <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3">¿Ya probaste este producto?</p>
                      <p className="text-sm font-bold text-gray-700 mb-6">Iniciá sesión para compartir tu experiencia con la comunidad.</p>
                      <Link 
                        href={`/iniciar-sesion?from=/producto/${productId}`}
                        className="inline-block px-6 py-3 bg-white text-sky-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
                      >
                        Iniciar Sesión
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Review List */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-8">
                  <MessageSquare className="text-sky-500" size={24} />
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Comentarios recientes</h3>
                </div>

                {loadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse" />)}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-black text-sm">
                              {review.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{review.user_name}</p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} size={10} fill={s <= review.rating ? '#fbbf24' : 'none'} className={s <= review.rating ? 'text-amber-400' : 'text-gray-200'} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-gray-300 uppercase">
                            {new Date(review.created_at).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium italic leading-relaxed">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[40px] p-12 text-center border border-dashed border-gray-200">
                    <p className="text-lg font-black text-gray-300 uppercase tracking-tight">Sin opiniones todavía</p>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">¡Sé el primero en calificar este producto!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-20 border-b border-gray-50">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <BenefitItem icon={<Truck className="w-12 h-12 text-sky-500" />} title="Envíos a todo el país" text="Despachamos por Correo Argentino, Andreani y transportes locales." />
            <BenefitItem icon={<RefreshCcw className="w-12 h-12 text-sky-500" />} title="Devoluciones" text="Si el producto no cumple tus expectativas, te devolvemos el dinero." />
            <BenefitItem icon={<Check className="w-12 h-12 text-sky-500" />} title="Venta Mayorista" text="Excelentes precios para revendedores e instituciones públicas." />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-24">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">También te puede interesar</h2>
              <Link href="/tienda" className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                Explorar todo <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
      <div className="text-sky-500 bg-white p-2.5 rounded-xl shadow-sm group-hover:bg-sky-500 group-hover:text-white transition-colors">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 truncate">{title}</p>
        <p className="text-[10px] font-bold text-gray-400 truncate">{text}</p>
      </div>
    </div>
  );
}

function BenefitItem({ icon, title, text }: { icon: React.ReactNode; title: string, text: string }) {
  return (
    <div className="flex flex-col items-center group">
      <div className="mb-6 bg-gray-50 p-6 rounded-[32px] group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm">{icon}</div>
      <h4 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-3">{title}</h4>
      <p className="text-sm text-gray-500 font-medium max-w-[260px] leading-relaxed">{text}</p>
    </div>
  );
}
