'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, RefreshCcw, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string | null;
  approved: number;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?all=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      toast.error('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ approved: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchReviews();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchReviews();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCcw className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Gestión de Reseñas</h1>
          <p className="text-gray-500 font-medium">Modera las opiniones de tus clientes antes de que sean públicas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className={`bg-white p-6 rounded-3xl shadow-sm border ${review.approved ? 'border-emerald-100' : 'border-amber-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    fill={star <= review.rating ? '#fbbf24' : 'none'} 
                    className={star <= review.rating ? 'text-amber-400' : 'text-gray-200'} 
                  />
                ))}
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${review.approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {review.approved ? 'Publicada' : 'Pendiente'}
              </span>
            </div>

            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1 truncate">
              {review.product_name}
            </h3>
            
            <p className="text-xs text-gray-500 mb-4">
              Por <span className="font-bold">{review.user_name}</span> ({review.user_email})
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 min-h-[80px]">
              <p className="text-sm text-gray-600 font-medium italic relative">
                <MessageSquare size={12} className="inline-block text-gray-300 absolute -left-1 -top-1" />
                <span className="ml-4">{review.comment || 'Sin comentario'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleApprove(review.id, review.approved)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${review.approved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
              >
                {review.approved ? <><XCircle size={14} /> Ocultar</> : <><CheckCircle size={14} /> Aprobar</>}
              </button>
              <button
                onClick={() => handleDelete(review.id)}
                className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                title="Eliminar permanentemente"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">No hay reseñas</h3>
            <p className="text-gray-500">Cuando los clientes dejen sus opiniones, aparecerán aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
}
