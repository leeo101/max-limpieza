"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileDown,
  Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_dni: string | null;
  customer_address: string;
  customer_notes: string | null;
  delivery_method: string;
  total: number;
  status: string;
  items: string;
  user_id: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch {
      console.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('adminToken');
    const order = orders.find(o => o.id === orderId);
    
    let trackingNumber = '';
    if (newStatus === 'delivered') {
      trackingNumber = window.prompt('Ingresá el Número de Seguimiento (Opcional):', '') || '';
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        
        if (newStatus === 'delivered' && order) {
          const message = `¡Hola ${order.customer_name}! Te aviso que ya despachamos tu pedido #${order.id.slice(-6).toUpperCase()}.${trackingNumber ? ` El número de seguimiento es: ${trackingNumber}.` : ''} A continuación te adjunto la foto del comprobante. ¡Muchas gracias!`;
          const encodedMsg = encodeURIComponent(message);
          window.open(`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodedMsg}`, '_blank');
        }
      } else {
        alert(result.error || 'Error al actualizar el estado');
      }
    } catch {
      alert('Error al conectar con el servidor');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        alert(result.error || 'Error al eliminar el pedido');
      }
    } catch {
      alert('Error al conectar con el servidor');
    }
  };

  const generateOrderPDF = async (order: Order) => {
    const doc = new jsPDF();
    const items = JSON.parse(order.items);
    
    const loadImage = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
      });
    };

    try {
      try {
        const logoBase64 = await loadImage('/logo.png');
        doc.addImage(logoBase64, 'PNG', 20, 15, 30, 30);
      } catch (e) {
        console.error('Logo could not be loaded', e);
        doc.setTextColor(14, 79, 148);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('MAX LIMPIEZA', 20, 25);
      }

      doc.setTextColor(14, 79, 148);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPROBANTE', 190, 25, { align: 'right' });
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Orden: #${order.id.slice(-6).toUpperCase()}`, 190, 32, { align: 'right' });
      doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-AR')}`, 190, 37, { align: 'right' });

      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(20, 50, 190, 50);

      doc.setTextColor(14, 79, 148);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL CLIENTE', 20, 65);

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre:', 20, 75);
      doc.setFont('helvetica', 'normal');
      doc.text(order.customer_name, 50, 75);

      doc.setFont('helvetica', 'bold');
      doc.text('Teléfono:', 20, 82);
      doc.setFont('helvetica', 'normal');
      doc.text(order.customer_phone, 50, 82);

      doc.setFont('helvetica', 'bold');
      doc.text('DNI:', 20, 89);
      doc.setFont('helvetica', 'normal');
      doc.text(order.customer_dni || 'N/A', 50, 89);

      doc.setFont('helvetica', 'bold');
      doc.text('Dirección:', 20, 96);
      doc.setFont('helvetica', 'normal');
      doc.text(order.customer_address, 50, 96);

      if (order.customer_notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notas:', 20, 103);
        doc.setFont('helvetica', 'normal');
        doc.text(order.customer_notes, 50, 103);
      }

      doc.setTextColor(14, 79, 148);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉTODO DE ENTREGA', 130, 65);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(order.delivery_method === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local', 130, 75);

      const tableData = items.map((item: any) => [
        item.name,
        item.quantity.toString(),
        `$${item.price.toLocaleString('es-AR')}`,
        `$${(item.price * item.quantity).toLocaleString('es-AR')}`
      ]);
      
      autoTable(doc, {
        head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        headStyles: { 
          fillColor: [14, 79, 148], 
          textColor: 255, 
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        startY: 120,
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 20, right: 20 },
        theme: 'striped'
      });
      
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setDrawColor(14, 79, 148);
      doc.setLineWidth(0.5);
      doc.line(130, finalY - 5, 190, finalY - 5);
      
      doc.setTextColor(14, 79, 148);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL FINAL:`, 130, finalY + 5);
      doc.text(`$${order.total.toLocaleString('es-AR')}`, 190, finalY + 5, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('Gracias por su compra en MAX Limpieza. Su confianza es nuestro motor.', 105, 280, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('www.maxlimpieza.com.ar', 105, 285, { align: 'center' });
      
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Comprobante_MAX_${order.id.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intentá nuevamente.');
    }
  };

  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .filter(order => 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm)
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">Pendiente</span>;
      case 'confirmed':
        return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-sky-100 text-sky-700 border border-sky-200">Confirmado</span>;
      case 'delivered':
        return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">Entregado</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">Cancelado</span>;
      default:
        return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492645630948';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Gestión de Pedidos</h1>
          <p className="text-gray-500 mt-1 text-sm">Controlá y procesá las compras de tus clientes</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-white text-sm"
          />
        </div>
      </div>

      {/* Filters — scrollable on mobile */}
      <div className="-mx-4 sm:mx-0">
        <div className="flex gap-2 items-center px-4 sm:px-0 pb-3 border-b border-gray-200 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {[
            { id: 'all', label: 'Todos', active: 'bg-gray-900 text-white', inactive: 'bg-white text-gray-600 border-gray-200' },
            { id: 'pending', label: 'Pendientes', active: 'bg-amber-500 text-white', inactive: 'bg-white text-gray-600 border-gray-200' },
            { id: 'confirmed', label: 'Confirmados', active: 'bg-sky-500 text-white', inactive: 'bg-white text-gray-600 border-gray-200' },
            { id: 'delivered', label: 'Entregados', active: 'bg-emerald-500 text-white', inactive: 'bg-white text-gray-600 border-gray-200' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                filter === item.id ? item.active : `${item.inactive} hover:border-gray-300`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid gap-4 sm:gap-6">
          {filteredOrders.map((order) => {
            const items = JSON.parse(order.items);
            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-300">
                <div className="p-5 sm:p-6 md:p-8">
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-400">#{order.id.slice(-8).toUpperCase()}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-gray-900">{order.customer_name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleDateString('es-AR')}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-sky-600">
                          {order.delivery_method === 'delivery' ? <Truck className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                          {order.delivery_method === 'delivery' ? 'Envío' : 'Retiro'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <div className="text-2xl sm:text-3xl font-black text-gray-900">${order.total.toLocaleString('es-AR')}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">Total del pedido</div>
                    </div>
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Customer info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Información de contacto</h4>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Dirección</p>
                          <p className="text-sm font-bold text-gray-700 leading-tight">{order.customer_address}</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Teléfono</p>
                          <p className="text-sm font-bold text-gray-700">{order.customer_phone}</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-black mb-1">DNI</p>
                          <p className="text-sm font-bold text-gray-700">{order.customer_dni || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=Hola%20${encodeURIComponent(order.customer_name)}!%20Te%20contactamos%20sobre%20tu%20pedido%20#${order.id.slice(-6)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          onClick={() => generateOrderPDF(order)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 active:scale-95 transition-all shadow-md shadow-sky-500/10"
                        >
                          <FileDown className="w-4 h-4" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Productos ({items.length})</h4>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {items.map((item: OrderItem, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                            <span className="font-bold text-gray-700 min-w-0 truncate pr-2">
                              <span className="text-sky-600 mr-1">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="font-black text-gray-900 flex-shrink-0">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                    {order.customer_notes && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-100">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>Nota: {order.customer_notes}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">Estado:</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {[
                            { id: 'pending', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pendiente', color: 'hover:bg-amber-100 hover:text-amber-700 hover:border-amber-200' },
                            { id: 'confirmed', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Confirmar', color: 'hover:bg-sky-100 hover:text-sky-700 hover:border-sky-200' },
                            { id: 'delivered', icon: <Truck className="w-3.5 h-3.5" />, label: 'Enviado', color: 'hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-200' },
                            { id: 'cancelled', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelar', color: 'hover:bg-rose-100 hover:text-rose-700 hover:border-rose-200' }
                          ].map(btn => (
                            <button
                              key={btn.id}
                              onClick={() => updateOrderStatus(order.id, btn.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold active:scale-95 transition-all ${
                                order.status === btn.id
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : `bg-white text-gray-400 border-gray-200 ${btn.color}`
                              }`}
                              title={btn.label}
                            >
                              {btn.icon}
                              <span className="hidden sm:inline">{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-300 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 active:scale-95 transition-all"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl py-16 px-8 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No encontramos nada</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">Probá cambiando el filtro o la búsqueda.</p>
        </div>
      )}
    </div>
  );
}
