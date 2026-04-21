'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, RefreshCcw, ShoppingBag, ArrowRight, Truck, Package, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderTimeline from '@/components/OrderTimeline';
import { useStore } from '@/store/useStore';
import { toast } from 'react-hot-toast';

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
  customer_notes?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { addToCart } = useStore();
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
      const storedData = localStorage.getItem('userData');
      if (storedData && storedData !== 'undefined') {
        try {
          const userData = JSON.parse(storedData);
          if (userData) {
            setUser(userData);
            setFormData({
              name: userData.name || '',
              phone: userData.phone || '',
              address: userData.address || '',
              city: userData.city || '',
            });
          }
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
          localStorage.setItem('userData', JSON.stringify(result.user));
          setFormData({
            name: result.user.name || '',
            phone: result.user.phone || '',
            address: result.user.address || '',
            city: result.user.city || '',
          });
        }
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
        toast.success('Perfil actualizado correctamente');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleRepeatOrder = (orderItemsJson: string) => {
    try {
      const items = JSON.parse(orderItemsJson) as OrderItem[];
      items.forEach(item => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: null 
        }, item.quantity);
      });
      toast.success('Productos agregados al carrito');
      router.push('/carrito');
    } catch (e) {
      toast.error('Error al repetir el pedido');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getTier = (points: number = 0) => {
    if (points >= 1500) return { name: 'Oro', color: 'from-amber-400 to-yellow-600', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (points >= 500) return { name: 'Plata', color: 'from-slate-300 to-slate-500', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };
    return { name: 'Bronce', color: 'from-orange-400 to-orange-600', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Cargando tu cuenta...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const tier = getTier(user.points);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* User Header Card */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 group-hover:bg-sky-100 transition-colors duration-700" />
            
            <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-sky-600 rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-sky-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name || 'Usuario MAX'}</h1>
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${tier.bg} ${tier.text} border ${tier.border} shadow-sm`}>
                      Nivel {tier.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{user.email}</p>
                  <div className="flex justify-center md:justify-start">
                    {user.email_verified ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        ✓ CUENTA VERIFICADA
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                        ⚠ PENDIENTE DE VERIFICACIÓN
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                <div className="relative group/points w-full md:w-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-3xl blur opacity-20 group-hover/points:opacity-40 transition duration-1000"></div>
                  <div className="relative flex items-center gap-5 bg-white px-6 py-4 rounded-[28px] border border-amber-100 shadow-xl shadow-amber-500/5">
                    <div className="p-3 bg-amber-50 rounded-2xl">
                      <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-none mb-1.5">Puntos MAX</p>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{user.points || 0}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-black text-gray-300 hover:text-red-500 transition-colors uppercase tracking-[0.3em]"
                >
                  Cerrar sesión de la cuenta
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-100">
              <nav className="flex gap-10 px-10" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-6 px-1 border-b-4 font-black text-xs uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === 'orders' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Mis Pedidos
                  {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 rounded-full blur-sm opacity-50" />}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-6 px-1 border-b-4 font-black text-xs uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === 'profile' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Mi Perfil
                  {activeTab === 'profile' && <span className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 rounded-full blur-sm opacity-50" />}
                </button>
              </nav>
            </div>

            <div className="p-8 md:p-12">
              {activeTab === 'orders' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Historial Reciente</h2>
                    <Link href="/tienda" className="flex items-center gap-2 group text-xs font-black text-sky-500 uppercase tracking-widest">
                      Nueva compra <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-20">
                      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Buscando tus pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                      <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ShoppingBag className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Todavía no tenés pedidos</p>
                      <p className="text-sm text-gray-400 font-bold mb-10 max-w-sm mx-auto uppercase tracking-wide">Comienza tu viaje de limpieza premium hoy mismo.</p>
                      <Link
                        href="/tienda"
                        className="inline-flex bg-sky-500 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
                      >
                        Descubrir productos
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                      {orders.map((order) => (
                        <div key={order.id} className="group bg-white border border-gray-100 rounded-[40px] p-8 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 border-l-8 border-l-transparent hover:border-l-sky-500">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                            <div className="flex items-start gap-6">
                              <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-300 transition-all duration-500 group-hover:bg-sky-500 group-hover:text-white group-hover:rotate-6 shadow-sm">
                                <ShoppingBag size={28} />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ORDEN #{order.id.slice(0, 8)}</p>
                                  <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)} border border-current opacity-80 shadow-sm`}>
                                    {getStatusText(order.status)}
                                  </span>
                                </div>
                                <p className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                  {new Date(order.created_at).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-left lg:text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto de compra</p>
                                <p className="text-3xl font-black text-sky-600 tracking-tighter">
                                  ${order.total.toLocaleString('es-AR')}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRepeatOrder(order.items)}
                                className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-emerald-500/5"
                                title="Volver a comprar estos productos"
                              >
                                <RefreshCcw size={18} strokeWidth={3} />
                                <span className="hidden sm:inline">Repetir Pedido</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50/50 rounded-3xl p-6 mb-8 border border-gray-100">
                             <OrderTimeline status={order.status} />
                          </div>
                          
                          <div className="pt-6 border-t border-gray-50">
                            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Detalle de productos</h4>
                            <div className="flex flex-wrap gap-3">
                              {(() => {
                                try {
                                  const items = JSON.parse(order.items) as OrderItem[];
                                  return items.map((item: OrderItem, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm hover:border-sky-200 transition-colors">
                                      <span className="text-xs font-black text-sky-500 bg-sky-50 w-7 h-7 flex items-center justify-center rounded-xl">{item.quantity}</span>
                                      <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{item.name}</span>
                                    </div>
                                  ));
                                } catch (e) {
                                  return <p className="text-xs text-red-500 font-bold">Error en datos de productos</p>;
                                }
                              })()}
                            </div>
                            
                            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                {order.delivery_method === 'delivery' ? (
                                  <div className="flex items-center gap-2"><Truck size={16} className="text-sky-500" /> ENVÍO A DOMICILIO</div>
                                ) : (
                                  <div className="flex items-center gap-2"><Package size={16} className="text-emerald-500" /> RETIRO EN SUCURSAL</div>
                                )}
                              </div>
                              {order.customer_notes && (
                                <div className="max-w-md bg-amber-50/50 px-4 py-2 rounded-xl border border-amber-100/50">
                                  <p className="text-[10px] font-bold text-amber-600/70 italic leading-relaxed">
                                    Nota: "{order.customer_notes}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Datos Personales</h2>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                      >
                        Editar Perfil
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-8 bg-gray-50/50 p-8 md:p-12 rounded-[40px] border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-bold text-gray-700"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono Móvil</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-bold text-gray-700"
                            placeholder="Tu teléfono"
                          />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dirección de Entrega</label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-bold text-gray-700"
                            placeholder="Calle, número, depto..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ciudad / Localidad</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-bold text-gray-700"
                            placeholder="Tu ciudad"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 bg-sky-500 text-white px-10 py-5 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {saving ? 'Guardando Cambios...' : 'Actualizar Perfil'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="flex-1 bg-white text-gray-400 px-10 py-5 rounded-[20px] font-black uppercase tracking-widest text-xs border border-gray-100 hover:bg-gray-50 transition-all"
                        >
                          Cancelar Edición
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-10">
                        <ProfileDataItem label="Nombre" value={user.name} />
                        <ProfileDataItem label="Email de contacto" value={user.email} />
                        <ProfileDataItem label="Teléfono" value={user.phone} />
                      </div>
                      <div className="space-y-10">
                        <ProfileDataItem label="Dirección de envío" value={user.address} />
                        <ProfileDataItem label="Ciudad" value={user.city} />
                        <ProfileDataItem label="Cliente desde" value={new Date(user.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })} />
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

function ProfileDataItem({ label, value }: { label: string, value?: string }) {
  return (
    <div className="group">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 group-hover:text-sky-500 transition-colors uppercase">{label}</p>
      <p className="text-xl font-black text-gray-900 tracking-tight">{value || 'No especificado'}</p>
      <div className="w-12 h-1 bg-gray-100 rounded-full mt-4 group-hover:w-24 group-hover:bg-sky-500 transition-all duration-500" />
    </div>
  );
}
