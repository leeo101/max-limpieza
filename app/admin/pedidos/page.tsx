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
  FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
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
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch {
      alert('Error al actualizar el estado del pedido');
    }
  };

  const generateOrderPDF = async (order: Order) => {
    const doc = new jsPDF();
    const items = JSON.parse(order.items);
    
    // Function to load image
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
      // Header Section
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

      // Title & Order Info (Right aligned)
      doc.setTextColor(14, 79, 148);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPROBANTE', 190, 25, { align: 'right' });
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Orden: #${order.id.slice(-6).toUpperCase()}`, 190, 32, { align: 'right' });
      doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-AR')}`, 190, 37, { align: 'right' });

      // Divider Line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(20, 50, 190, 50);

      // Info Grid (Customer & Delivery)
      // Customer Info Section
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
      doc.text('Dirección:', 20, 89);
      doc.setFont('helvetica', 'normal');
      doc.text(order.customer_address, 50, 89);

      if (order.customer_notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notas:', 20, 96);
        doc.setFont('helvetica', 'normal');
        doc.text(order.customer_notes, 50, 96);
      }

      // Delivery Status
      doc.setTextColor(14, 79, 148);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉTODO DE ENTREGA', 130, 65);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(order.delivery_method === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local', 130, 75);

      // Table of products
      const tableData = items.map((item: any) => [
        item.name,
        item.quantity.toString(),
        `$${item.price.toLocaleString('es-AR')}`,
        `$${(item.price * item.quantity).toLocaleString('es-AR')}`
      ]);
      
      autoTable(doc, {
        startY: 110,
        head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        headStyles: { 
          fillColor: [14, 79, 148], 
          textColor: 255, 
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 20, right: 20 },
        theme: 'striped'
      });
      
      // Total Calculation Area
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setDrawColor(14, 79, 148);
      doc.setLineWidth(0.5);
      doc.line(130, finalY - 5, 190, finalY - 5);
      
      doc.setTextColor(14, 79, 148);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL FINAL:`, 130, finalY + 5);
      doc.text(`$${order.total.toLocaleString('es-AR')}`, 190, finalY + 5, { align: 'right' });
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('Gracias por su compra en MAX Limpieza. Su confianza es nuestro motor.', 105, 280, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('www.maxlimpieza.com.ar', 105, 285, { align: 'center' });
      
      // Download
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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestión de Pedidos</h1>
          <p className="text-gray-500 mt-1">Controlá y procesá las compras de tus clientes</p>
        </div>
        <div className="relative group lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-white"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-gray-200">
        <Filter className="w-4 h-4 text-gray-400 mr-2" />
        {[
          { id: 'all', label: 'Todos', active: 'bg-gray-900 text-white', inactive: 'bg-white text-gray-600 border-gray-200' },
          { id: 'pending', label: 'Pendientes', active: 'bg-amber-500 text-white', inactive: 'bg-white text-gray-600 border-gray-200' },
          { id: 'confirmed', label: 'Confirmados', active: 'bg-sky-500 text-white', inactive: 'bg-white text-gray-600 border-gray-200' },
          { id: 'delivered', label: 'Entregados', active: 'bg-emerald-500 text-white', inactive: 'bg-white text-gray-600 border-gray-200' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              filter === item.id ? item.active : `${item.inactive} hover:border-gray-300`
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            const items = JSON.parse(order.items);
            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-300">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-gray-400">#{order.id.slice(-8).toUpperCase()}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <h3 className="text-xl font-black text-gray-900">{order.customer_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(order.created_at).toLocaleDateString('es-AR')}</span>
                        <span className="flex items-center gap-1 font-bold text-sky-600">
                          {order.delivery_method === 'delivery' ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          {order.delivery_method === 'delivery' ? 'Envío' : 'Retiro'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-3xl font-black text-gray-900">${order.total.toLocaleString('es-AR')}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Total del pedido</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Información de contacto</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Dirección</p>
                          <p className="text-sm font-bold text-gray-700 leading-tight">{order.customer_address}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Teléfono</p>
                          <p className="text-sm font-bold text-gray-700">{order.customer_phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=Hola%20${encodeURIComponent(order.customer_name)}!%20Te%20contactamos%20sobre%20tu%20pedido%20#${order.id.slice(-6)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 transition-all transform hover:scale-[1.02]"
                        >
                          <MessageCircle className="w-5 h-5" />
                          WhatsApp
                        </a>
                        <button
                          onClick={() => generateOrderPDF(order)}
                          className="flex items-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/10 transition-all transform hover:scale-[1.02]"
                        >
                          <FileDown className="w-5 h-5" />
                          Descargar PDF
                        </button>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Productos ({items.length})</h4>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item: OrderItem, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                            <span className="font-bold text-gray-700">
                              <span className="text-sky-600 mr-2">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="font-black text-gray-900">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400">Cambiar estado:</span>
                      <div className="flex gap-1">
                        {[
                          { id: 'pending', icon: <Clock className="w-3.5 h-3.5" />, color: 'hover:bg-amber-100 hover:text-amber-700' },
                          { id: 'confirmed', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'hover:bg-sky-100 hover:text-sky-700' },
                          { id: 'delivered', icon: <Truck className="w-3.5 h-3.5" />, color: 'hover:bg-emerald-100 hover:text-emerald-700' },
                          { id: 'cancelled', icon: <XCircle className="w-3.5 h-3.5" />, color: 'hover:bg-rose-100 hover:text-rose-700' }
                        ].map(btn => (
                          <button
                            key={btn.id}
                            onClick={() => updateOrderStatus(order.id, btn.id)}
                            className={`p-2.5 rounded-lg border border-gray-200 transition-all flex items-center justify-center ${
                              order.status === btn.id ? 'bg-gray-900 text-white border-gray-900' : `bg-white text-gray-400 ${btn.color}`
                            }`}
                            title={`Marcar como ${btn.id}`}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    {order.customer_notes && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Notas: {order.customer_notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No encontramos nada</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Probá cambiando el filtro o la búsqueda para encontrar lo que necesitás.</p>
        </div>
      )}
    </div>
  );
}

