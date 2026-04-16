'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import StarRating from '@/components/StarRating';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  images: string | null;
  category_name?: string;
  bestseller: number;
  featured: number;
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string | null;
  created_at: string;
  approved: number;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, totalReviews: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          const found = (data.data as Product[]).find((p: Product) => p.id === productId);
          setProduct(found || null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
          setReviewSummary(data.summary);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    }

    fetchReviews();
  }, [productId]);

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: { id: string, quantity: number }) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const submitReview = async () => {
    if (!isLoggedIn || reviewRating === 0) return;

    const token = localStorage.getItem('userToken');
    if (!token) return;

    setSubmittingReview(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReviewSubmitted(true);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewForm(false);
      } else {
        alert(data.error || 'Error al enviar la reseña');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error al enviar la reseña. Intente nuevamente.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';
  const whatsappMessage = product
    ? encodeURIComponent(`Hola! Me interesa el producto: ${product.name} - $${product.price}`)
    : '';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <Link href="/tienda" className="btn-primary">
              Volver a la tienda
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumbs
            items={[
              { label: 'Tienda', href: '/tienda' },
              ...(product.category_name
                ? [{ label: product.category_name, href: `/tienda?category=${product.category_name.toLowerCase()}` }]
                : []),
              { label: product.name, href: '' },
            ]}
          />

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product image */}
              <div className="relative aspect-square lg:aspect-auto lg:h-96 bg-gray-50 flex items-center justify-center">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-8"
                    priority
                  />
                ) : (
                  <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}

                {product.bestseller === 1 && (
                  <span className="absolute top-4 left-4 badge badge-warning">🔥 Más vendido</span>
                )}
                {product.featured === 1 && (
                  <span className="absolute top-4 right-4 badge badge-primary">⭐ Destacado</span>
                )}
              </div>

              {/* Product info */}
              <div className="p-6 lg:p-8">
                {product.category_name && (
                  <span className="text-sm text-sky-600 font-medium uppercase tracking-wide">
                    {product.category_name}
                  </span>
                )}
                <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-gray-900">{product.name}</h1>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-sky-600">
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Stock */}
                <div className="mt-6">
                  <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {product.stock > 0 ? `✓ En stock (${product.stock} disponibles)` : '✗ Agotado'}
                  </span>
                </div>

                {/* Quantity selector */}
                {product.stock > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cantidad</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className={`btn-primary flex-1 flex items-center justify-center gap-2 ${addedToCart ? 'bg-emerald-500' : ''
                      } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {addedToCart ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        ¡Agregado!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Agregar al carrito
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas y Calificaciones</h2>

            {/* Rating Summary */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold text-sky-600">
                      {reviewSummary.averageRating > 0 ? reviewSummary.averageRating.toFixed(1) : '—'}
                    </span>
                    <div>
                      {reviewSummary.totalReviews > 0 ? (
                        <StarRating rating={Math.round(reviewSummary.averageRating)} size="lg" showValue />
                      ) : (
                        <p className="text-gray-500">Sin calificaciones aún</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'reseña' : 'reseñas'}
                      </p>
                    </div>
                  </div>
                </div>

                {isLoggedIn && !reviewSubmitted && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="btn-primary whitespace-nowrap"
                  >
                    {showReviewForm ? 'Cancelar' : 'Escribir una reseña'}
                  </button>
                )}

                {!isLoggedIn && (
                  <Link
                    href="/login"
                    className="btn-primary whitespace-nowrap text-center"
                  >
                    Iniciar sesión para reseñar
                  </Link>
                )}

                {reviewSubmitted && (
                  <p className="text-emerald-600 font-medium">
                    ¡Gracias! Tu reseña será visible después de la aprobación.
                  </p>
                )}
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Reseña</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación
                  </label>
                  <StarRating
                    rating={reviewRating}
                    onRate={setReviewRating}
                    size="lg"
                    interactive
                  />
                  {reviewRating === 0 && (
                    <p className="mt-1 text-sm text-gray-500">Selecciona una calificación</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                    placeholder="Comparte tu experiencia con este producto..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <button
                  onClick={submitReview}
                  disabled={reviewRating === 0 || submittingReview}
                  className={`btn-primary ${reviewRating === 0 || submittingReview ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submittingReview ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Reseña'
                  )}
                </button>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{review.user_name}</p>
                        <div className="mt-1">
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      <time className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                    {review.comment && (
                      <p className="mt-4 text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Sé el primero en reseñar este producto
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
