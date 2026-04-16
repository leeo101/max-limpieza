"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  PlusCircle, 
  ExternalLink,
  AlertTriangle,
  MessageCircle,
  Mail,
  CheckCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
    averageTicket: 0,
    lowStockCount: 0,
    pendingReviews: 0,
    newsletterCount: 0,
  });
  interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    total: number;
    status: string;
    created_at: string;
  }
  interface LowStockProduct {
    id: string;
    name: string;
    stock: number;
  }
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Suggested monthly target for the progress bar
  const MONTHLY_TARGET = 500000; 

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('adminToken');
      
      try {
        const [statsRes, ordersRes, inventoryRes] = await Promise.all([
          fetch('/api/orders?action=stats', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('/api/orders?action=recent&limit=10', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('/api/orders?action=inventory', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        const inventoryData = await inventoryRes.json();

        if (statsData.success) {
          setStats(statsData.data);
        }

        if (ordersData.success) {
          setRecentOrders(ordersData.data);
        }

        if (inventoryData.success) {
          setLowStockProducts(inventoryData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <p className="text-gray-500 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema en línea y operando
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
          <Link 
            href="/admin/productos" 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all text-xs sm:text-sm shadow-lg shadow-sky-900/10"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Nuevo
          </Link>
          <Link 
            href="/admin/pedidos" 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-xs sm:text-sm"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            Pedidos
          </Link>
        </div>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Ingresos Totales" 
          value={`$${stats.totalRevenue.toLocaleString('es-AR')}`} 
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
          trend="+12%"
        />
        <StatCard 
          title="Ticket Promedio" 
          value={`$${stats.averageTicket.toLocaleString('es-AR')}`} 
          icon={<TrendingUp className="w-6 h-6 text-sky-600" />}
          color="bg-sky-50"
        />
        <StatCard 
          title="Pendientes" 
          value={stats.pendingOrders} 
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50"
          highlight={stats.pendingOrders > 0}
        />
        <StatCard 
          title="Usuarios" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6 text-violet-600" />}
          color="bg-violet-50"
        />
      </div>

      {/* Secondary Stats Row (Pro Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          title="Reseñas" 
          value={stats.pendingReviews} 
          icon={<MessageCircle className="w-6 h-6 text-indigo-600" />}
          color="bg-indigo-50"
          highlight={stats.pendingReviews > 0}
        />
        <StatCard 
          title="Suscritos" 
          value={stats.newsletterCount} 
          icon={<Mail className="w-6 h-6 text-rose-600" />}
          color="bg-rose-50"
        />
        <StatCard 
          title="Stock Bajo" 
          value={stats.lowStockCount} 
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
          highlight={stats.lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Performance & Inventory Alerts */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          {/* Performance Widget */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Meta Mensual</h3>
            <p className="text-sm text-gray-500 mb-6">Objetivo: {MONTHLY_TARGET.toLocaleString('es-AR')}</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black text-gray-900">
                  {Math.min(100, (stats.totalRevenue / MONTHLY_TARGET) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.totalRevenue / MONTHLY_TARGET) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Inventory Alerts Widget */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Alertas
              </h3>
              {stats.lowStockCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                  {stats.lowStockCount} Stock Bajo
                </span>
              )}
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-xl group hover:border-orange-200 transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-orange-600 font-medium">Solo {product.stock} un.</p>
                    </div>
                    <Link 
                      href={`/admin/productos?edit=${product.id}`}
                      className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-bold">Stock saludable</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Orders adaptive view */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
            <Link href="/admin/pedidos" className="text-sky-600 hover:text-sky-700 font-bold text-sm flex items-center gap-1 group">
              Ver Historial
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length > 0 ? (
                  recentOrders.slice(0, 8).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 text-[10px] font-mono text-gray-300 italic">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm">{order.customer_name}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900 text-sm">
                        ${order.total.toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href="/admin/pedidos" 
                          className="p-2 text-gray-200 hover:text-sky-600 transition-colors flex items-center justify-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">Sin actividad</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-gray-100">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 8).map((order) => (
                <Link key={order.id} href="/admin/pedidos" className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">#{order.id.slice(-6)}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">{order.customer_name}</p>
                    <p className="text-xs font-black text-sky-600">${order.total.toLocaleString('es-AR')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-gray-400 text-xs">Sin actividad reciente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, highlight }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  color: string,
  trend?: string,
  highlight?: boolean
}) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${highlight ? 'border-sky-500 shadow-lg shadow-sky-500/5' : 'border-gray-100'} relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
      <div className={`absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 ${color} opacity-40 group-hover:scale-150 transition-transform duration-700 rounded-full blur-3xl`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${color} rounded-xl group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          {trend && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

