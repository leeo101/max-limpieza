'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, RefreshCcw, Trash2, Check, X, Percent, CircleDollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  usage_limit: number | null;
  times_used: number;
  expires_at: string | null;
  active: number;
  created_at: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons', {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (error) {
      toast.error('Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\`
        },
        body: JSON.stringify({ id, active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCoupons();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\`
        },
        body: JSON.stringify({
          code,
          discount_type: discountType,
          discount_value: parseFloat(discountValue),
          min_purchase: minPurchase ? parseFloat(minPurchase) : 0,
          usage_limit: usageLimit ? parseInt(usageLimit) : null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error al crear cupón');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinPurchase('');
    setUsageLimit('');
    setExpiresAt('');
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
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Cupones de Descuento</h1>
          <p className="text-gray-500 font-medium">Gestiona códigos promocionales para tus clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs shadow-md hover:bg-sky-600 transition-colors"
        >
          <Plus size={16} />
          Nuevo Cupón
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest">Código</th>
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest">Descuento</th>
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest">Uso</th>
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest">Vencimiento</th>
                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="text-sky-500" size={16} />
                      <span className="font-black text-gray-900 uppercase">{coupon.code}</span>
                    </div>
                    {coupon.min_purchase > 0 && (
                      <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        Min: $\${coupon.min_purchase.toLocaleString('es-AR')}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={\`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black \${coupon.discount_type === 'percentage' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}\`}>
                      {coupon.discount_type === 'percentage' ? (
                        <><Percent size={12} /> {coupon.discount_value}%</>
                      ) : (
                        <><CircleDollarSign size={12} /> $\${coupon.discount_value}</>
                      )}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-600">
                      {coupon.times_used} {coupon.usage_limit ? \`/ \${coupon.usage_limit}\` : 'usos'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={\`text-sm font-bold \${coupon.expires_at && new Date(coupon.expires_at) < new Date() ? 'text-rose-500' : 'text-gray-600'}\`}>
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('es-AR') : 'Sin fecha'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(coupon.id, coupon.active)}
                      className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${coupon.active ? 'bg-sky-500' : 'bg-gray-200'}\`}
                    >
                      <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${coupon.active ? 'translate-x-6' : 'translate-x-1'}\`} />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                    No hay cupones creados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Nuevo Cupón</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Código del Cupón *</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required 
                  placeholder="Ej: BIENVENIDA10"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Tipo *</label>
                  <select 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Valor *</label>
                  <input 
                    type="number" 
                    value={discountValue} 
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required 
                    min="1"
                    placeholder="Ej: 10"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Compra Mínima ($)</label>
                <input 
                  type="number" 
                  value={minPurchase} 
                  onChange={(e) => setMinPurchase(e.target.value)}
                  placeholder="Ej: 5000 (Opcional)"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Límite de Uso</label>
                  <input 
                    type="number" 
                    value={usageLimit} 
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Opcional"
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Vencimiento</label>
                  <input 
                    type="date" 
                    value={expiresAt} 
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-sky-500 text-white rounded-xl font-black uppercase tracking-widest shadow-md hover:bg-sky-600 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCcw className="animate-spin" size={20} /> : <Check size={20} />}
                Crear Cupón
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
