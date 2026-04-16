'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  points?: number;
  email_verified?: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  items: string;
  created_at: string;
  delivery_method: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/iniciar-sesion?from=/mi-cuenta');
      return;
    }

    fetchUserData(token);
    fetchOrders(token);
  }, [router]);

  const fetchUserData = async (token: string) => {
    try {
      // First try to get from localStorage
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        const userData = JSON.parse(storedData);
        setUser(userData);
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
        });
      }

      // Then fetch latest from server
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        localStorage.setItem('userData', JSON.stringify(result.user));
        setFormData({
          name: result.user.name || '',
          phone: result.user.phone || '',
          address: result.user.address || '',
          city: result.user.city || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(result.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token!}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        localStorage.setItem('userData', JSON.stringify(result.user));
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTier = (points: number = 0) => {
    if (points >= 1500) return { name: 'Oro', color: 'from-amber-400 to-yellow-600', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (points >= 500) return { name: 'Plata', color: 'from-slate-300 to-slate-500', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };
    return { name: 'Bronce', color: 'from-orange-400 to-orange-600', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
  };

  const tier = getTier(user?.points);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Cargando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-sky-500/20">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h1 className="text-2xl font-black text-gray-900">{user.name || 'Usuario'}</h1>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${tier.bg} ${tier.text} border ${tier.border}`}>
                      {tier.name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                    <div className="flex gap-2">
                      {user.email_verified ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          VERIFICADO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          SIN VERIFICAR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-amber-100 shadow-sm">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Puntos MAX</p>
                      <p className="text-2xl font-black text-gray-900 leading-none">{user.points || 0}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-6 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === 'orders'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mis Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === 'profile'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mi Perfil
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de pedidos</h2>
                  
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">Cargando pedidos...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-gray-600 mb-4">Aún no realizaste ningún pedido</p>
                      <Link
                        href="/tienda"
                        className="inline-block bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 transition"
                      >
                        Ir a comprar
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div>
                              <p className="text-sm text-gray-600">
                                Pedido #{order.id.slice(0, 8)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('es-AR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-3">
                            <div className="space-y-2">
                              {(JSON.parse(order.items) as OrderItem[]).slice(0, 2).map((item: OrderItem, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-700">
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                                  </span>
                                </div>
                              ))}
                              {(JSON.parse(order.items) as OrderItem[]).length > 2 && (
                                <p className="text-sm text-gray-500">
                                  +{(JSON.parse(order.items) as OrderItem[]).length - 2} productos más
                                </p>
                              )}
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                {order.delivery_method === 'delivery' ? '🚚 Envío a domicilio' : '📦 Retiro en punto de venta'}
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                Total: ${order.total.toLocaleString('es-AR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Datos de mi perfil</h2>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-sky-600 hover:text-sky-700 font-medium text-sm"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Dirección
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 transition disabled:opacity-50"
                        >
                          {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Nombre</p>
                          <p className="text-gray-900 font-medium">{user.name || 'No especificado'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Email</p>
                          <p className="text-gray-900 font-medium">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                          <p className="text-gray-900 font-medium">{user.phone || 'No especificado'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Miembro desde</p>
                          <p className="text-gray-900 font-medium">
                            {new Date(user.created_at).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Dirección</p>
                          <p className="text-gray-900 font-medium">{user.address || 'No especificado'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Ciudad</p>
                          <p className="text-gray-900 font-medium">{user.city || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
