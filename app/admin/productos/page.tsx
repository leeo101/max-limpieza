'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Package, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  TrendingUp,
  ChevronRight,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string | null;
  active: number;
  featured: number;
  bestseller: number;
  is_wholesale: number;
  image: string | null;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

// Helper to compress and resize images before upload
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Resize failed'));
        }, 'image/jpeg', 0.85);
      };
    };
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: '',
    active: 1,
    featured: 0,
    bestseller: 0,
    is_wholesale: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const token = localStorage.getItem('adminToken');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?activeOnly=false', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/categories', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (productsData.success) {
        setProducts(productsData.data);
      }
      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setImagePreview(product.image);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id || '',
        image: product.image || '',
        active: product.active,
        featured: product.featured,
        bestseller: product.bestseller,
        is_wholesale: product.is_wholesale || 0,
      });
    } else {
      setEditingProduct(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: '',
        active: 1,
        featured: 0,
        bestseller: 0,
        is_wholesale: 0,
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida');
      return;
    }

    setUploadingImage(true);
    try {
      // Process image before upload
      const resizedBlob = await resizeImage(file);
      const processedFile = new File([resizedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });

      const form = new FormData();
      form.append('file', processedFile);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.data.url }));
        setImagePreview(result.data.url);
        toast.success('Imagen optimizada y subida');
      } else {
        toast.error(result.error || 'Error al subir imagen');
        console.error('Upload error:', result);
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
        setShowModal(false);
        fetchData();
      }
    } catch {
      toast.error('Error al guardar');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Producto eliminado');
        fetchData();
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const toggleActive = async (product: Product) => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/products?id=${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...product, active: product.active === 1 ? 0 : 1 }),
      });
      fetchData();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Productos</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Control de inventario y catálogo</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-xl shadow-sky-600/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Tool bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
        <input
          type="text"
          placeholder="Buscar por nombre o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-sky-500/20 shadow-sm bg-white text-sm font-bold text-gray-700 placeholder:text-gray-300 transition-all"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Etiquetas</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 relative">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} fill className="object-contain mix-blend-multiply" />
                          ) : (
                            <Package className="w-full h-full p-3 text-gray-200" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase leading-none mb-1">{p.name}</p>
                          <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{p.category_name || 'Sin categoría'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">${p.price.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black ${p.stock < 10 ? 'text-rose-500' : 'text-gray-500'}`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {p.featured === 1 && <Star size={14} className="text-amber-400 fill-amber-400" />}
                        {p.bestseller === 1 && <TrendingUp size={14} className="text-sky-500" />}
                        {p.is_wholesale === 1 && <div className="px-1.5 py-0.5 bg-sky-500 text-white text-[8px] font-black rounded uppercase">Mayorista</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleActive(p)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${p.active === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100 opacity-50'}`}>
                        {p.active === 1 ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid/Card View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-gray-100 relative">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill className="object-contain mix-blend-multiply" />
                    ) : (
                      <Package className="w-full h-full p-5 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tight truncate">{p.name}</h3>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-2">{p.category_name || 'Sin categoría'}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-gray-900">${p.price.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Actual</p>
                    <p className={`text-sm font-black ${p.stock < 10 ? 'text-rose-500' : 'text-gray-900'}`}>{p.stock} un.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                    <button onClick={() => toggleActive(p)} className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${p.active === 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {p.active === 1 ? '● Activo' : '○ Inactivo'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openModal(p)} className="flex-1 py-3 bg-sky-50 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl active:scale-95 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal for Create/Edit */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image Section */}
            <div className="w-full sm:w-48 space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden bg-white border-2 border-dashed border-gray-200 relative flex items-center justify-center group">
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="Preview" fill className="object-contain mix-blend-multiply" />
                    <button 
                      type="button"
                      onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: '' })); }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <Upload size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sin imagen</span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-black transition-all">
                <Upload size={14} />
                Subir Foto
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            </div>

            {/* Fields Section */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Ej. Detergente 5L"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Precio ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Stock (un.)</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-sky-500/20"
                    placeholder="0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Destacados y Visibilidad</label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <OptionToggle active={formData.active === 1} label="Activo" onClick={() => setFormData({...formData, active: formData.active === 1 ? 0 : 1})} />
                <OptionToggle active={formData.featured === 1} label="Destacado" onClick={() => setFormData({...formData, featured: formData.featured === 1 ? 0 : 1})} />
                <OptionToggle active={formData.bestseller === 1} label="Pro" onClick={() => setFormData({...formData, bestseller: formData.bestseller === 1 ? 0 : 1})} />
                <OptionToggle active={formData.is_wholesale === 1} label="Mayorista" onClick={() => setFormData({...formData, is_wholesale: formData.is_wholesale === 1 ? 0 : 1})} />
             </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-sky-600/20 hover:bg-sky-700 active:scale-95 transition-all">
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all">
              Cerrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function OptionToggle({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
        active ? 'bg-sky-500 text-white border-sky-600 shadow-lg shadow-sky-500/20' : 'bg-white text-gray-400 border-gray-100'
      }`}
    >
      {label}
    </button>
  );
}
